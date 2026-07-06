package api

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/jerryjuche/koder/internal/auth"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

// RateLimiter implements a per-user sliding window rate limiter.
type RateLimiter struct {
	mu       sync.RWMutex
	limits   map[string]*userRateLimit
	maxReqs  int
	window   time.Duration
}

type userRateLimit struct {
	count       int
	windowStart time.Time
}

// NewRateLimiter creates a new rate limiter allowing maxReqs requests per window duration.
func NewRateLimiter(maxReqs int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		limits:  make(map[string]*userRateLimit),
		maxReqs: maxReqs,
		window:  window,
	}
	// Periodic cleanup of stale entries (every 2x window duration)
	go func() {
		ticker := time.NewTicker(window * 2)
		defer ticker.Stop()
		for range ticker.C {
			rl.mu.Lock()
			now := time.Now()
			for k, v := range rl.limits {
				if now.Sub(v.windowStart) > rl.window*2 {
					delete(rl.limits, k)
				}
			}
			rl.mu.Unlock()
		}
	}()
	return rl
}

// Allow checks if a user is allowed to proceed. Returns true + 0 if allowed,
// or false + retryAfter duration if rate limited.
func (rl *RateLimiter) Allow(userID string) (bool, time.Duration) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	entry, exists := rl.limits[userID]

	if !exists || now.Sub(entry.windowStart) >= rl.window {
		rl.limits[userID] = &userRateLimit{
			count:       1,
			windowStart: now,
		}
		return true, 0
	}

	entry.count++
	if entry.count <= rl.maxReqs {
		return true, 0
	}

	elapsed := now.Sub(entry.windowStart)
	retryAfter := rl.window - elapsed
	return false, retryAfter
}

// RateLimitMiddleware returns a middleware that enforces per-user rate limits
// on submission and test endpoints. Admin users are exempt.
func RateLimitMiddleware(rl *RateLimiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims := GetClaims(r.Context())
			if claims == nil {
				RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
				return
			}

			// Exempt admin users from rate limiting
			if claims.Role == "admin" {
				next.ServeHTTP(w, r)
				return
			}

			allowed, retryAfter := rl.Allow(claims.UserID)
			if !allowed {
				seconds := int(retryAfter.Seconds()) + 1
				msg := fmt.Sprintf("Too many submissions. Try again in %d seconds.", seconds)
				slog.Warn("rate_limit: denied", "user_id", claims.UserID, "retry_after_seconds", seconds)
				RespondError(w, http.StatusTooManyRequests, "RATE_LIMITED", msg, nil)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

type contextKey string

const claimsContextKey contextKey = "claims"

// CORSMiddleware returns a middleware that applies simple CORS headers.
func CORSMiddleware(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", cfg.AllowedOrigin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// AuthMiddleware validates the Authorization header or httpOnly cookie and attaches claims to the context.
func AuthMiddleware(cfg *config.Config, store store.Store) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authorization := r.Header.Get("Authorization")

			// Fallback: read token from httpOnly cookie if no Authorization header
			if authorization == "" {
				cookie, err := r.Cookie("koder_token")
				if err == nil && cookie.Value != "" {
					authorization = "Bearer " + cookie.Value
				}
			}

			if authorization == "" {
				RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
				return
			}

			const bearerPrefix = "Bearer "
			if len(authorization) <= len(bearerPrefix) || authorization[:len(bearerPrefix)] != bearerPrefix {
				RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authorization header must be in Bearer format", nil)
				return
			}

			token := authorization[len(bearerPrefix):]
			claims, err := auth.VerifyToken(token, cfg.JWTSecret)
			if err != nil {
				RespondError(w, http.StatusUnauthorized, "AUTH_INVALID", "Invalid or expired token", nil)
				return
			}

			// Check if token has been revoked
			if claims.ID != "" {
				blacklisted, err := store.IsTokenBlacklisted(r.Context(), claims.ID)
				if err != nil {
					slog.Error("auth: failed to check token blacklist", "error", err)
				} else if blacklisted {
					RespondError(w, http.StatusUnauthorized, "TOKEN_REVOKED", "Token has been revoked", nil)
					return
				}
			}

			r = r.WithContext(context.WithValue(r.Context(), claimsContextKey, claims))
			next.ServeHTTP(w, r)
		})
	}
}

// AdminOnly middleware restricts access to endpoints to users with the "admin" role.
func AdminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := GetClaims(r.Context())
		if claims == nil || claims.Role != "admin" {
			RespondError(w, http.StatusForbidden, "FORBIDDEN", "Admin access required", nil)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// VerifiedContributorOnly restricts access to admin or verified_contributor roles.
func VerifiedContributorOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := GetClaims(r.Context())
		if claims == nil || (claims.Role != "admin" && claims.Role != "verified_contributor") {
			RespondError(w, http.StatusForbidden, "FORBIDDEN", "Verified contributor access required", nil)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// IPRateLimiter implements a per-IP sliding window rate limiter.
type IPRateLimiter struct {
	mu       sync.RWMutex
	limits   map[string]*userRateLimit
	maxReqs  int
	window   time.Duration
}

// NewIPRateLimiter creates a new IP-based rate limiter allowing maxReqs per window.
func NewIPRateLimiter(maxReqs int, window time.Duration) *IPRateLimiter {
	rl := &IPRateLimiter{
		limits:  make(map[string]*userRateLimit),
		maxReqs: maxReqs,
		window:  window,
	}
	go func() {
		ticker := time.NewTicker(window * 2)
		defer ticker.Stop()
		for range ticker.C {
			rl.mu.Lock()
			now := time.Now()
			for k, v := range rl.limits {
				if now.Sub(v.windowStart) > rl.window*2 {
					delete(rl.limits, k)
				}
			}
			rl.mu.Unlock()
		}
	}()
	return rl
}

// Allow checks if an IP is allowed to proceed. Returns true + 0 if allowed,
// or false + retryAfter duration if rate limited.
func (rl *IPRateLimiter) Allow(ip string) (bool, time.Duration) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	entry, exists := rl.limits[ip]

	if !exists || now.Sub(entry.windowStart) >= rl.window {
		rl.limits[ip] = &userRateLimit{
			count:       1,
			windowStart: now,
		}
		return true, 0
	}

	entry.count++
	if entry.count <= rl.maxReqs {
		return true, 0
	}

	elapsed := now.Sub(entry.windowStart)
	retryAfter := rl.window - elapsed
	return false, retryAfter
}

// Middleware returns an HTTP middleware that enforces per-IP rate limits.
func (rl *IPRateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.Header.Get("X-Forwarded-For")
		if ip == "" {
			ip = r.Header.Get("X-Real-IP")
		}
		if ip == "" {
			ip = r.RemoteAddr
			if idx := strings.LastIndex(ip, ":"); idx != -1 {
				ip = ip[:idx]
			}
		}

		allowed, retryAfter := rl.Allow(ip)
		if !allowed {
			seconds := int(retryAfter.Seconds()) + 1
			msg := fmt.Sprintf("Too many requests. Try again in %d seconds.", seconds)
			slog.Warn("ip_rate_limit: denied", "ip", ip, "retry_after_seconds", seconds)
			RespondError(w, http.StatusTooManyRequests, "RATE_LIMITED", msg, nil)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// BodySizeLimitMiddleware restricts request body size to maxBytes.
func BodySizeLimitMiddleware(maxBytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Body != nil {
				r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
			}
			next.ServeHTTP(w, r)
		})
	}
}

// SecurityHeadersMiddleware sets standard security headers on every response.
func SecurityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "0")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		next.ServeHTTP(w, r)
	})
}

// GetClaims extracts JWT claims from the request context.
func GetClaims(ctx context.Context) *auth.Claims {
	claims, _ := ctx.Value(claimsContextKey).(*auth.Claims)
	return claims
}
