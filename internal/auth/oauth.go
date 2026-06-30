package auth

import (
	"compress/gzip"
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/jerryjuche/koder/internal/store"
)

// deriveEncryptionKey derives a 256-bit AES key from the JWT secret using SHA-256.
func deriveEncryptionKey(jwtSecret string) []byte {
	h := sha256.Sum256([]byte(jwtSecret))
	return h[:]
}

// EncryptToken encrypts a plaintext PAT using AES-256-GCM with a key derived from JWT_SECRET.
// Returns base64-encoded ciphertext (nonce + ciphertext + auth tag).
func EncryptToken(plaintext, jwtSecret string) (string, error) {
	key := deriveEncryptionKey(jwtSecret)
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("failed to generate nonce: %w", err)
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.RawStdEncoding.EncodeToString(ciphertext), nil
}

// DecryptToken decrypts a base64-encoded ciphertext produced by EncryptToken.
func DecryptToken(ciphertextB64, jwtSecret string) (string, error) {
	key := deriveEncryptionKey(jwtSecret)
	ciphertext, err := base64.RawStdEncoding.DecodeString(ciphertextB64)
	if err != nil {
		return "", fmt.Errorf("failed to decode ciphertext: %w", err)
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", fmt.Errorf("ciphertext too short")
	}

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", fmt.Errorf("failed to decrypt: %w", err)
	}

	return string(plaintext), nil
}

const stateSeparator = "."

// GenerateOAuthState creates an HMAC-signed state token for CSRF protection.
// Format: hex_nonce.HMAC(hex_nonce, secret)
func GenerateOAuthState(secret string) string {
	nonce := make([]byte, 32)
	_, _ = rand.Read(nonce)
	hexNonce := hex.EncodeToString(nonce)

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(hexNonce))
	sig := hex.EncodeToString(mac.Sum(nil))

	return hexNonce + stateSeparator + sig
}

// VerifyOAuthState validates the HMAC-signed state token.
// Returns true if the signature matches, preventing CSRF attacks.
func VerifyOAuthState(state, secret string) bool {
	parts := strings.SplitN(state, stateSeparator, 2)
	if len(parts) != 2 {
		return false
	}
	hexNonce, sig := parts[0], parts[1]

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(hexNonce))
	expected := hex.EncodeToString(mac.Sum(nil))

	return hmac.Equal([]byte(sig), []byte(expected))
}


// giteaHTTPClient is an HTTP client with a 15s timeout for Gitea API calls.
var giteaHTTPClient = &http.Client{
	Timeout: 15 * time.Second,
}

// FetchGiteaUser calls Gitea's /api/v1/user endpoint with the access token
// and returns the user's profile information.
func FetchGiteaUser(ctx context.Context, giteaURL string, token string) (*store.GiteaUserInfo, error) {
	giteaURL = strings.TrimRight(giteaURL, "/")
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, giteaURL+"/api/v1/user", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create gitea user request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("User-Agent", "Koder/1.0")
	req.Header.Set("Accept", "application/json")

	resp, err := giteaHTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch gitea user: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		reader := resp.Body
		if resp.Header.Get("Content-Encoding") == "gzip" {
			gr, err := gzip.NewReader(resp.Body)
			if err == nil {
				defer gr.Close()
				reader = gr
			}
		}
		body, _ := io.ReadAll(reader)
		bodyStr := strings.TrimSpace(string(body))
		// Detect Cloudflare challenges and give a helpful error
		if resp.StatusCode == http.StatusForbidden && (strings.Contains(bodyStr, "Cloudflare") || strings.Contains(bodyStr, "cf-error-details")) {
			return nil, fmt.Errorf("gitea API blocked by Cloudflare: add your backend server's IP to the Cloudflare WAF allowlist, or use a Gitea instance not behind Cloudflare")
		}
		return nil, fmt.Errorf("gitea API returned status %d: %s", resp.StatusCode, bodyStr)
	}

	var user store.GiteaUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, fmt.Errorf("failed to decode gitea user response: %w", err)
	}

	if user.ID == 0 || user.Login == "" {
		return nil, fmt.Errorf("gitea returned incomplete user info")
	}

	return &user, nil
}
