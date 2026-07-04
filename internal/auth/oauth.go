package auth

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"math/big"
	"net/http"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jerryjuche/koder/internal/store"
)

// Google JWKS endpoint for RSA public keys
const googleCertsURL = "https://www.googleapis.com/oauth2/v3/certs"

// googleHTTPClient is an HTTP client with a 10s timeout for Google API calls.
var googleHTTPClient = &http.Client{
	Timeout: 10 * time.Second,
}

// jwksCache holds the parsed Google public keys with a TTL.
var (
	jwksCache     map[string]*rsa.PublicKey
	jwksCacheMu   sync.RWMutex
	jwksFetchedAt time.Time
	jwksTTL       = 1 * time.Hour
)

// jwksKey is a single key from Google's JWKS response.
type jwksKey struct {
	Kid string `json:"kid"`
	Kty string `json:"kty"`
	Use string `json:"use"`
	N   string `json:"n"` // modulus (base64url-encoded)
	E   string `json:"e"` // exponent (base64url-encoded)
	Alg string `json:"alg"`
}

type jwksResponse struct {
	Keys []jwksKey `json:"keys"`
}

// googleClaims represents the standard claims in a Google ID token.
type googleClaims struct {
	jwt.RegisteredClaims
	Email         string      `json:"email"`
	Name          string      `json:"name"`
	Picture       string      `json:"picture"`
	EmailVerified interface{} `json:"email_verified"`
}

// VerifyGoogleToken verifies a Google ID token using Google's JWKS public keys.
// Returns the parsed Google user info if valid.
func VerifyGoogleToken(idToken, expectedClientID string) (*store.GoogleUserInfo, error) {
	if idToken == "" {
		return nil, fmt.Errorf("id_token cannot be empty")
	}
	if expectedClientID == "" {
		return nil, fmt.Errorf("GOOGLE_CLIENT_ID is not configured")
	}

	keys, err := getJWKS()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Google public keys: %w", err)
	}

	// Parse the JWT header to extract kid
	token, err := jwt.ParseWithClaims(idToken, &googleClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, fmt.Errorf("token missing kid header")
		}
		key, exists := keys[kid]
		if !exists {
			return nil, fmt.Errorf("unknown key id: %s", kid)
		}
		return key, nil
	})
	if err != nil {
		return nil, fmt.Errorf("invalid Google token: %w", err)
	}

	claims, ok := token.Claims.(*googleClaims)
	if !ok {
		return nil, fmt.Errorf("failed to parse Google token claims")
	}

	// Validate audience
	if !isExpectedAudience(claims.Audience, expectedClientID) {
		return nil, fmt.Errorf("Google token audience mismatch")
	}

	// Validate issuer
	if !isExpectedIssuer(claims.Issuer) {
		return nil, fmt.Errorf("Google token issuer mismatch")
	}

	// Validate email_verified
	emailVerified := false
	switch v := claims.EmailVerified.(type) {
	case bool:
		emailVerified = v
	case string:
		emailVerified = v == "true" || v == "1"
	}
	if !emailVerified {
		return nil, fmt.Errorf("Google email not verified")
	}

	if claims.Email == "" {
		return nil, fmt.Errorf("Google token missing email")
	}

	return &store.GoogleUserInfo{
		Sub:           claims.Subject,
		Email:         claims.Email,
		Name:          claims.Name,
		Picture:       claims.Picture,
		EmailVerified: store.FlexibleBool(emailVerified),
		Audience:      expectedClientID,
	}, nil
}

// getJWKS fetches and parses Google's JWKS public keys, caching them for 1 hour.
func getJWKS() (map[string]*rsa.PublicKey, error) {
	jwksCacheMu.RLock()
	if jwksCache != nil && time.Since(jwksFetchedAt) < jwksTTL {
		defer jwksCacheMu.RUnlock()
		return jwksCache, nil
	}
	jwksCacheMu.RUnlock()

	jwksCacheMu.Lock()
	defer jwksCacheMu.Unlock()

	// Double-check after acquiring write lock
	if jwksCache != nil && time.Since(jwksFetchedAt) < jwksTTL {
		return jwksCache, nil
	}

	resp, err := googleHTTPClient.Get(googleCertsURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch JWKS: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("JWKS endpoint returned status %d", resp.StatusCode)
	}

	var jwks jwksResponse
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return nil, fmt.Errorf("failed to decode JWKS: %w", err)
	}

	keys := make(map[string]*rsa.PublicKey, len(jwks.Keys))
	for _, k := range jwks.Keys {
		if k.Kty != "RSA" {
			continue
		}
		pubKey, err := jwksKeyToPublicKey(k)
		if err != nil {
			continue
		}
		keys[k.Kid] = pubKey
	}

	if len(keys) == 0 {
		return nil, fmt.Errorf("no valid RSA keys found in JWKS response")
	}

	jwksCache = keys
	jwksFetchedAt = time.Now()
	return keys, nil
}

// jwksKeyToPublicKey converts a JWKS key entry to an *rsa.PublicKey.
func jwksKeyToPublicKey(k jwksKey) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(k.N)
	if err != nil {
		return nil, fmt.Errorf("failed to decode modulus: %w", err)
	}
	eBytes, err := base64.RawURLEncoding.DecodeString(k.E)
	if err != nil {
		return nil, fmt.Errorf("failed to decode exponent: %w", err)
	}

	pub := &rsa.PublicKey{
		N: new(big.Int).SetBytes(nBytes),
		E: int(new(big.Int).SetBytes(eBytes).Int64()),
	}

	// Validate the key by encoding it back to DER
	derBytes := x509.MarshalPKCS1PublicKey(pub)
	pem.Encode(nil, &pem.Block{Type: "RSA PUBLIC KEY", Bytes: derBytes})

	return pub, nil
}

// isExpectedAudience checks if the expected client ID is present in the audience list.
func isExpectedAudience(audience jwt.ClaimStrings, expected string) bool {
	for _, a := range audience {
		if a == expected {
			return true
		}
	}
	return false
}

// isExpectedIssuer checks if the token was issued by Google.
func isExpectedIssuer(issuer string) bool {
	return issuer == "https://accounts.google.com" || issuer == "accounts.google.com"
}
