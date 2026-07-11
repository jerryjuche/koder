package api

import (
	"crypto/tls"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/jerryjuche/koder/internal/config"
)

func TestRespondSuccess(t *testing.T) {
	w := httptest.NewRecorder()
	RespondSuccess(w, map[string]string{"key": "value"})

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}

	var resp APIResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if !resp.Success {
		t.Error("expected success=true")
	}
	if resp.Error != nil {
		t.Errorf("expected nil error, got %v", resp.Error)
	}
}

func TestRespondCreated(t *testing.T) {
	w := httptest.NewRecorder()
	RespondCreated(w, "created")

	if w.Code != http.StatusCreated {
		t.Errorf("expected 201, got %d", w.Code)
	}

	var resp APIResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if !resp.Success {
		t.Error("expected success=true")
	}
}

func TestRespondError(t *testing.T) {
	w := httptest.NewRecorder()
	RespondError(w, http.StatusBadRequest, "BAD_REQUEST", "invalid input", nil)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}

	var resp APIResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Success {
		t.Error("expected success=false")
	}
	if resp.Data != nil {
		t.Errorf("expected nil data, got %v", resp.Data)
	}

	errMap, ok := resp.Error.(map[string]interface{})
	if !ok {
		t.Fatalf("expected error as object, got %T", resp.Error)
	}
	if errMap["code"] != "BAD_REQUEST" {
		t.Errorf("expected code 'BAD_REQUEST', got %v", errMap["code"])
	}
	if errMap["message"] != "invalid input" {
		t.Errorf("expected message 'invalid input', got %v", errMap["message"])
	}
}

func TestRespondErrorWithDetails(t *testing.T) {
	w := httptest.NewRecorder()
	details := map[string]string{"field": "username"}
	RespondError(w, http.StatusConflict, "DUPLICATE", "already exists", details)

	var resp APIResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	errMap, ok := resp.Error.(map[string]interface{})
	if !ok {
		t.Fatalf("expected error as object, got %T", resp.Error)
	}
	detMap, ok := errMap["details"].(map[string]interface{})
	if !ok {
		t.Fatalf("expected details as object, got %T", errMap["details"])
	}
	if detMap["field"] != "username" {
		t.Errorf("expected details.field='username', got %v", detMap["field"])
	}
}

func TestIsHTTPS(t *testing.T) {
	t.Run("no TLS", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		if isHTTPS(req) {
			t.Error("expected false for plain HTTP")
		}
	})

	t.Run("with TLS", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.TLS = &tls.ConnectionState{}
		if !isHTTPS(req) {
			t.Error("expected true when TLS is set")
		}
	})

	t.Run("X-Forwarded-Proto", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("X-Forwarded-Proto", "https")
		if !isHTTPS(req) {
			t.Error("expected true with X-Forwarded-Proto: https")
		}
	})

	t.Run("X-Forwarded-Proto http", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("X-Forwarded-Proto", "http")
		if isHTTPS(req) {
			t.Error("expected false with X-Forwarded-Proto: http")
		}
	})
}

func TestSetAuthCookie(t *testing.T) {
	cfg := &config.Config{}
	// Set JWTExpiryHours to a testable value via JWTExpiry method
	// We can't set JWTExpiryHours directly and have JWTExpiry() work without
	// the full config, so let's just test cookie structure.
	// Zero cfg means JWTExpiryHours is 0 and MaxAge will be 0.

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()

	SetAuthCookie(w, req, "test-token", cfg)

	cookieHeader := w.Header().Get("Set-Cookie")
	if cookieHeader == "" {
		t.Fatal("expected Set-Cookie header")
	}

	if !strings.Contains(cookieHeader, "koder_token=test-token") {
		t.Errorf("expected koder_token=test-token, got %q", cookieHeader)
	}
	if !strings.Contains(cookieHeader, "HttpOnly") {
		t.Errorf("expected HttpOnly, got %q", cookieHeader)
	}
	if !strings.Contains(cookieHeader, "Path=/") {
		t.Errorf("expected Path=/, got %q", cookieHeader)
	}
}

func TestSetAuthCookie_HTTPS(t *testing.T) {
	cfg := &config.Config{}

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("X-Forwarded-Proto", "https")
	w := httptest.NewRecorder()

	SetAuthCookie(w, req, "secure-token", cfg)

	cookieHeader := w.Header().Get("Set-Cookie")
	if !strings.Contains(cookieHeader, "Secure") {
		t.Errorf("expected Secure flag for HTTPS, got %q", cookieHeader)
	}
	if !strings.Contains(cookieHeader, "SameSite=None") {
		t.Errorf("expected SameSite=None for HTTPS, got %q", cookieHeader)
	}
}

func TestClearAuthCookie(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()

	ClearAuthCookie(w, req)

	cookieHeader := w.Header().Get("Set-Cookie")
	if cookieHeader == "" {
		t.Fatal("expected Set-Cookie header")
	}

	if !strings.Contains(cookieHeader, "koder_token=") {
		t.Errorf("expected koder_token, got %q", cookieHeader)
	}
	if !strings.Contains(cookieHeader, "Max-Age=0") {
		t.Errorf("expected Max-Age=0, got %q", cookieHeader)
	}
}

func TestAPIResponse_ContentType(t *testing.T) {
	w := httptest.NewRecorder()
	RespondSuccess(w, nil)

	ct := w.Header().Get("Content-Type")
	if ct != "application/json" {
		t.Errorf("expected Content-Type: application/json, got %q", ct)
	}
}
