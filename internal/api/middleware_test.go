package api

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/jerryjuche/koder/internal/auth"
	"github.com/jerryjuche/koder/internal/config"
)

func TestNewRateLimiter(t *testing.T) {
	rl := NewRateLimiter(5, time.Minute)
	if rl == nil {
		t.Fatal("NewRateLimiter returned nil")
	}
	defer rl.Stop()
}

func TestRateLimiter_Allow_UnderLimit(t *testing.T) {
	rl := NewRateLimiter(3, time.Minute)
	defer rl.Stop()

	for i := 0; i < 3; i++ {
		allowed, retryAfter := rl.Allow("user-1")
		if !allowed {
			t.Errorf("request %d: expected allowed, got denied", i+1)
		}
		if retryAfter != 0 {
			t.Errorf("request %d: expected 0 retryAfter, got %v", i+1, retryAfter)
		}
	}
}

func TestRateLimiter_Allow_OverLimit(t *testing.T) {
	rl := NewRateLimiter(2, time.Minute)
	defer rl.Stop()

	for i := 0; i < 2; i++ {
		rl.Allow("user-1")
	}

	allowed, retryAfter := rl.Allow("user-1")
	if allowed {
		t.Error("expected denied after exceeding limit")
	}
	if retryAfter <= 0 || retryAfter > time.Minute {
		t.Errorf("expected retryAfter between 0 and 1 minute, got %v", retryAfter)
	}
}

func TestRateLimiter_Allow_DoesNotAffectOtherUsers(t *testing.T) {
	rl := NewRateLimiter(1, time.Minute)
	defer rl.Stop()

	allowed, _ := rl.Allow("user-1")
	if !allowed {
		t.Error("expected user-1 first request allowed")
	}

	allowed, _ = rl.Allow("user-2")
	if !allowed {
		t.Error("expected user-2 first request allowed (different user)")
	}
}

func TestRateLimiter_WindowExpiry(t *testing.T) {
	rl := NewRateLimiter(1, 50*time.Millisecond)
	defer rl.Stop()

	rl.Allow("user-1")
	allowed, _ := rl.Allow("user-1")
	if allowed {
		t.Error("expected denied before window expiry")
	}

	time.Sleep(60 * time.Millisecond)
	allowed, _ = rl.Allow("user-1")
	if !allowed {
		t.Error("expected allowed after window expiry")
	}
}

func TestRateLimiter_Stop(t *testing.T) {
	rl := NewRateLimiter(5, time.Minute)
	rl.Stop()
	// Should not panic on double stop
	rl.Stop()
}

func TestIPRateLimiter_Allow(t *testing.T) {
	rl := NewIPRateLimiter(2, time.Minute)
	defer rl.Stop()

	allowed, _ := rl.Allow("192.168.1.1")
	if !allowed {
		t.Error("expected first IP request allowed")
	}

	allowed, _ = rl.Allow("192.168.1.1")
	if !allowed {
		t.Error("expected second IP request allowed")
	}

	allowed, _ = rl.Allow("192.168.1.1")
	if allowed {
		t.Error("expected third IP request denied")
	}

	// Different IP should be allowed
	allowed, _ = rl.Allow("192.168.1.2")
	if !allowed {
		t.Error("expected different IP request allowed")
	}
}

func TestIPRateLimiter_Stop(t *testing.T) {
	rl := NewIPRateLimiter(5, time.Minute)
	rl.Stop()
	rl.Stop() // double stop should not panic
}

func TestGetClaims(t *testing.T) {
	t.Run("empty context", func(t *testing.T) {
		claims := GetClaims(context.Background())
		if claims != nil {
			t.Error("expected nil claims for empty context")
		}
	})

	t.Run("with claims", func(t *testing.T) {
		expected := &auth.Claims{
			UserID: "user-123",
			Role:   "admin",
		}
		ctx := context.WithValue(context.Background(), claimsContextKey, expected)
		claims := GetClaims(ctx)
		if claims == nil {
			t.Fatal("expected non-nil claims")
		}
		if claims.UserID != "user-123" {
			t.Errorf("expected UserID 'user-123', got %q", claims.UserID)
		}
		if claims.Role != "admin" {
			t.Errorf("expected Role 'admin', got %q", claims.Role)
		}
	})

	t.Run("wrong type in context", func(t *testing.T) {
		ctx := context.WithValue(context.Background(), claimsContextKey, "not-claims")
		claims := GetClaims(ctx)
		if claims != nil {
			t.Error("expected nil claims for wrong context type")
		}
	})
}

func TestAdminOnly(t *testing.T) {
	t.Run("admin allowed", func(t *testing.T) {
		claims := &auth.Claims{Role: "admin"}
		ctx := context.WithValue(context.Background(), claimsContextKey, claims)
		req := httptest.NewRequest(http.MethodGet, "/admin", nil).WithContext(ctx)
		w := httptest.NewRecorder()

		AdminOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})).ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
	})

	t.Run("student denied", func(t *testing.T) {
		claims := &auth.Claims{Role: "student"}
		ctx := context.WithValue(context.Background(), claimsContextKey, claims)
		req := httptest.NewRequest(http.MethodGet, "/admin", nil).WithContext(ctx)
		w := httptest.NewRecorder()

		AdminOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			t.Error("handler should not be called")
		})).ServeHTTP(w, req)

		if w.Code != http.StatusForbidden {
			t.Errorf("expected 403, got %d", w.Code)
		}
	})

	t.Run("no claims", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/admin", nil)
		w := httptest.NewRecorder()

		AdminOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			t.Error("handler should not be called")
		})).ServeHTTP(w, req)

		if w.Code != http.StatusForbidden {
			t.Errorf("expected 403, got %d", w.Code)
		}
	})
}

func TestVerifiedContributorOnly(t *testing.T) {
	t.Run("admin allowed", func(t *testing.T) {
		claims := &auth.Claims{Role: "admin"}
		ctx := context.WithValue(context.Background(), claimsContextKey, claims)
		req := httptest.NewRequest(http.MethodGet, "/contributor", nil).WithContext(ctx)
		w := httptest.NewRecorder()

		VerifiedContributorOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})).ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200 for admin, got %d", w.Code)
		}
	})

	t.Run("verified_contributor allowed", func(t *testing.T) {
		claims := &auth.Claims{Role: "verified_contributor"}
		ctx := context.WithValue(context.Background(), claimsContextKey, claims)
		req := httptest.NewRequest(http.MethodGet, "/contributor", nil).WithContext(ctx)
		w := httptest.NewRecorder()

		VerifiedContributorOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})).ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200 for verified_contributor, got %d", w.Code)
		}
	})

	t.Run("student denied", func(t *testing.T) {
		claims := &auth.Claims{Role: "student"}
		ctx := context.WithValue(context.Background(), claimsContextKey, claims)
		req := httptest.NewRequest(http.MethodGet, "/contributor", nil).WithContext(ctx)
		w := httptest.NewRecorder()

		VerifiedContributorOnly(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			t.Error("handler should not be called")
		})).ServeHTTP(w, req)

		if w.Code != http.StatusForbidden {
			t.Errorf("expected 403, got %d", w.Code)
		}
	})
}

func TestBodySizeLimitMiddleware(t *testing.T) {
	middleware := BodySizeLimitMiddleware(10)

	t.Run("body under limit", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		w := httptest.NewRecorder()
		called := false

		middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			called = true
			w.WriteHeader(http.StatusOK)
		})).ServeHTTP(w, req)

		if !called {
			t.Error("handler should have been called")
		}
	})
}

func TestSecurityHeadersMiddleware(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()

	SecurityHeadersMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})).ServeHTTP(w, req)

	headers := w.Header()
	if headers.Get("X-Content-Type-Options") != "nosniff" {
		t.Error("missing X-Content-Type-Options header")
	}
	if headers.Get("X-Frame-Options") != "DENY" {
		t.Error("missing X-Frame-Options header")
	}
	if headers.Get("Referrer-Policy") != "strict-origin-when-cross-origin" {
		t.Error("missing Referrer-Policy header")
	}
}

func TestRecoveryMiddleware(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()

	RecoveryMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		panic("test panic")
	})).ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected 500, got %d", w.Code)
	}
}

func TestCORSMiddleware_Wildcard(t *testing.T) {
	cfg := &config.Config{AllowedOrigin: "*"}
	middleware := CORSMiddleware(cfg)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Origin", "https://evil.com")
	w := httptest.NewRecorder()

	middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})).ServeHTTP(w, req)

	if w.Header().Get("Access-Control-Allow-Origin") != "https://evil.com" {
		t.Errorf("expected wildcard to echo origin, got %q", w.Header().Get("Access-Control-Allow-Origin"))
	}
}

func TestCORSMiddleware_SpecificOrigin(t *testing.T) {
	cfg := &config.Config{AllowedOrigin: "https://example.com"}
	middleware := CORSMiddleware(cfg)

	t.Run("matching origin", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Origin", "https://example.com")
		w := httptest.NewRecorder()

		middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})).ServeHTTP(w, req)

		if w.Header().Get("Access-Control-Allow-Origin") != "https://example.com" {
			t.Errorf("expected allowed origin, got %q", w.Header().Get("Access-Control-Allow-Origin"))
		}
	})

	t.Run("non-matching origin falls back", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Origin", "https://other.com")
		w := httptest.NewRecorder()

		middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})).ServeHTTP(w, req)

		if w.Header().Get("Access-Control-Allow-Origin") != "https://example.com" {
			t.Errorf("expected fallback to configured origin, got %q", w.Header().Get("Access-Control-Allow-Origin"))
		}
	})
}

func TestCORSMiddleware_NoOrigin(t *testing.T) {
	cfg := &config.Config{AllowedOrigin: "https://example.com"}
	middleware := CORSMiddleware(cfg)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()

	called := false
	middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
	})).ServeHTTP(w, req)

	if !called {
		t.Error("handler should be called when no Origin header")
	}
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

func TestCORSMiddleware_OptionsPreflight(t *testing.T) {
	cfg := &config.Config{AllowedOrigin: "*"}
	middleware := CORSMiddleware(cfg)

	req := httptest.NewRequest(http.MethodOptions, "/", nil)
	req.Header.Set("Origin", "https://example.com")
	w := httptest.NewRecorder()

	called := false
	middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
	})).ServeHTTP(w, req)

	if called {
		t.Error("handler should not be called for OPTIONS preflight")
	}
	if w.Code != http.StatusOK {
		t.Errorf("expected 200 for OPTIONS, got %d", w.Code)
	}
	if w.Header().Get("Access-Control-Allow-Credentials") != "true" {
		t.Error("expected Access-Control-Allow-Credentials: true")
	}
	if w.Header().Get("Access-Control-Allow-Methods") == "" {
		t.Error("expected Access-Control-Allow-Methods header")
	}
}

func TestCORSMiddleware_NullOrigin(t *testing.T) {
	cfg := &config.Config{AllowedOrigin: "https://example.com"}
	middleware := CORSMiddleware(cfg)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Origin", "null")
	w := httptest.NewRecorder()

	middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})).ServeHTTP(w, req)

	if w.Header().Get("Access-Control-Allow-Origin") != "null" {
		t.Errorf("expected null origin to be allowed, got %q", w.Header().Get("Access-Control-Allow-Origin"))
	}
}

func TestCORSMiddleware_MultipleOrigins(t *testing.T) {
	cfg := &config.Config{AllowedOrigin: "https://a.com, https://b.com"}
	middleware := CORSMiddleware(cfg)

	t.Run("first origin matches", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Origin", "https://a.com")
		w := httptest.NewRecorder()

		middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})).ServeHTTP(w, req)

		if w.Header().Get("Access-Control-Allow-Origin") != "https://a.com" {
			t.Errorf("expected https://a.com, got %q", w.Header().Get("Access-Control-Allow-Origin"))
		}
	})

	t.Run("non-matching origin with multiple", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("Origin", "https://c.com")
		w := httptest.NewRecorder()

		middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})).ServeHTTP(w, req)

		// Multiple origins with no match: no fallback is set
		origin := w.Header().Get("Access-Control-Allow-Origin")
		if origin != "" {
			t.Errorf("expected empty origin for non-matching with multiple origins, got %q", origin)
		}
	})
}

func TestIPRateLimiter_Middleware(t *testing.T) {
	rl := NewIPRateLimiter(2, time.Minute)
	defer rl.Stop()

	nextHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	t.Run("under limit passes", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.RemoteAddr = "192.168.1.1:12345"
		w := httptest.NewRecorder()

		rl.Middleware(nextHandler).ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
	})

	t.Run("over limit returns 429", func(t *testing.T) {
		smallRL := NewIPRateLimiter(1, time.Minute)
		defer smallRL.Stop()

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.RemoteAddr = "10.0.0.1:9999"

		// First request passes
		w1 := httptest.NewRecorder()
		smallRL.Middleware(nextHandler).ServeHTTP(w1, req)
		if w1.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w1.Code)
		}

		// Second request denied
		w2 := httptest.NewRecorder()
		smallRL.Middleware(nextHandler).ServeHTTP(w2, req)
		if w2.Code != http.StatusTooManyRequests {
			t.Errorf("expected 429, got %d", w2.Code)
		}
	})
}

func TestIPRateLimiter_Middleware_IPExtraction(t *testing.T) {
	rl := NewIPRateLimiter(10, time.Minute)
	defer rl.Stop()

	nextHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	t.Run("X-Forwarded-For takes priority", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("X-Forwarded-For", "203.0.113.1")
		req.Header.Set("X-Real-IP", "10.0.0.1")
		req.RemoteAddr = "192.168.1.1:12345"
		w := httptest.NewRecorder()

		rl.Middleware(nextHandler).ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
	})

	t.Run("X-Real-IP fallback", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("X-Real-IP", "203.0.113.2")
		req.RemoteAddr = "192.168.1.2:12345"
		w := httptest.NewRecorder()

		rl.Middleware(nextHandler).ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
	})
}

func TestRateLimitMiddleware(t *testing.T) {
	rl := NewRateLimiter(1, time.Minute)
	defer rl.Stop()

	nextHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	t.Run("no claims returns 401", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/submit", nil)
		w := httptest.NewRecorder()

		RateLimitMiddleware(rl)(nextHandler).ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", w.Code)
		}
	})

	t.Run("admin bypasses rate limit", func(t *testing.T) {
		claims := &auth.Claims{UserID: "admin-1", Role: "admin"}
		ctx := context.WithValue(context.Background(), claimsContextKey, claims)
		req := httptest.NewRequest(http.MethodPost, "/submit", nil).WithContext(ctx)
		w := httptest.NewRecorder()

		RateLimitMiddleware(rl)(nextHandler).ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200 for admin, got %d", w.Code)
		}
	})

	t.Run("under limit passes", func(t *testing.T) {
		claims := &auth.Claims{UserID: "student-1", Role: "student"}
		ctx := context.WithValue(context.Background(), claimsContextKey, claims)
		req := httptest.NewRequest(http.MethodPost, "/submit", nil).WithContext(ctx)
		w := httptest.NewRecorder()

		RateLimitMiddleware(rl)(nextHandler).ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w.Code)
		}
	})

	t.Run("over limit returns 429", func(t *testing.T) {
		smallRL := NewRateLimiter(1, time.Minute)
		defer smallRL.Stop()

		claims := &auth.Claims{UserID: "student-2", Role: "student"}
		ctx := context.WithValue(context.Background(), claimsContextKey, claims)
		req := httptest.NewRequest(http.MethodPost, "/submit", nil).WithContext(ctx)

		// First — consumes the slot
		w1 := httptest.NewRecorder()
		RateLimitMiddleware(smallRL)(nextHandler).ServeHTTP(w1, req)
		if w1.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", w1.Code)
		}

		// Second — rate limited
		w2 := httptest.NewRecorder()
		RateLimitMiddleware(smallRL)(nextHandler).ServeHTTP(w2, req)
		if w2.Code != http.StatusTooManyRequests {
			t.Errorf("expected 429, got %d", w2.Code)
		}

		// Check error response body has RATE_LIMITED code
		var resp APIResponse
		if err := json.NewDecoder(w2.Body).Decode(&resp); err == nil {
			errMap, ok := resp.Error.(map[string]interface{})
			if ok {
				if errMap["code"] != "RATE_LIMITED" {
					t.Errorf("expected code RATE_LIMITED, got %v", errMap["code"])
				}
			}
		}
	})
}
