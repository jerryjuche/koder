package api

import (
	"context"
	"net/http"

	"github.com/jerryjuche/koder/internal/auth"
	"github.com/jerryjuche/koder/internal/config"
)

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

// AdminOnly middleware requires the authenticated user to have role="admin".
func AdminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := GetClaims(r.Context())
		if claims == nil || claims.Role != "admin" {
			RespondError(w, http.StatusForbidden, "FORBIDDEN", "Admin role required", nil)
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
