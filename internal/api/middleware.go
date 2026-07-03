package api

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"sync"
	"time"

	"github.com/jerryjuche/koder/internal/auth"
	"github.com/jerryjuche/koder/internal/config"
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

// AuthMiddleware validates the Authorization header and attaches claims to the context.
func AuthMiddleware(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authorization := r.Header.Get("Authorization")
			if authorization == "" {
				RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authorization header is required", nil)
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

// GetClaims extracts JWT claims from the request context.
func GetClaims(ctx context.Context) *auth.Claims {
	claims, _ := ctx.Value(claimsContextKey).(*auth.Claims)
	return claims
}
