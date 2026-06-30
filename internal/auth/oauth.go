package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/jerryjuche/koder/internal/store"
)

// googleHTTPClient is an HTTP client with a 10s timeout for Google API calls.
var googleHTTPClient = &http.Client{
	Timeout: 10 * time.Second,
}

// VerifyGoogleToken verifies a Google ID token using Google's tokeninfo endpoint.
// Returns the parsed Google user info if valid.
func VerifyGoogleToken(idToken, expectedClientID string) (*store.GoogleUserInfo, error) {
	if idToken == "" {
		return nil, fmt.Errorf("id_token cannot be empty")
	}
	if expectedClientID == "" {
		return nil, fmt.Errorf("GOOGLE_CLIENT_ID is not configured")
	}

	url := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", idToken)
	resp, err := googleHTTPClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to verify Google token: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Google token verification failed with status %d", resp.StatusCode)
	}

	var info store.GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return nil, fmt.Errorf("failed to decode Google token response: %w", err)
	}

	if info.Sub == "" {
		return nil, fmt.Errorf("Google token missing subject (sub)")
	}

	if !info.EmailVerified {
		return nil, fmt.Errorf("Google email not verified")
	}

	if info.Email == "" {
		return nil, fmt.Errorf("Google token missing email")
	}

	return &info, nil
}
