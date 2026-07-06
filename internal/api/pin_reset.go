package api

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/auth"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

// pinResetKey derives a separate signing key from the JWT secret
// for domain separation: PIN reset tokens cannot be confused with auth tokens.
func pinResetKey(secret string) []byte {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte("koder-pin-reset-v1"))
	return []byte(hex.EncodeToString(mac.Sum(nil)))
}

type PINResetHandler struct {
	store      store.Store
	cfg        *config.Config
	pinLimiter *emailRateLimiter
}

type emailRateLimiter struct {
	mu       sync.Mutex
	attempts map[string]*emailRateEntry
}

type emailRateEntry struct {
	count       int
	windowStart time.Time
}

func newEmailRateLimiter() *emailRateLimiter {
	rl := &emailRateLimiter{
		attempts: make(map[string]*emailRateEntry),
	}
	go func() {
		ticker := time.NewTicker(30 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			rl.mu.Lock()
			now := time.Now()
			for k, v := range rl.attempts {
				if now.Sub(v.windowStart) > 30*time.Minute {
					delete(rl.attempts, k)
				}
			}
			rl.mu.Unlock()
		}
	}()
	return rl
}

func (rl *emailRateLimiter) allow(email string) (bool, time.Duration) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	entry, exists := rl.attempts[email]

	if !exists || now.Sub(entry.windowStart) >= 15*time.Minute {
		rl.attempts[email] = &emailRateEntry{
			count:       1,
			windowStart: now,
		}
		return true, 0
	}

	entry.count++
	if entry.count <= 5 {
		return true, 0
	}

	elapsed := now.Sub(entry.windowStart)
	retryAfter := (15 * time.Minute) - elapsed
	return false, retryAfter
}

type forgotPasswordPinRequest struct {
	Email string `json:"email"`
	Pin   string `json:"pin"`
}

type resetPasswordPinRequest struct {
	Token    string `json:"token"`
	Password string `json:"password"`
}

// pinResetClaims are short-lived JWT claims for PIN-based password reset.
type pinResetClaims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

func NewPINResetHandler(store store.Store, cfg *config.Config) *PINResetHandler {
	return &PINResetHandler{
		store:      store,
		cfg:        cfg,
		pinLimiter: newEmailRateLimiter(),
	}
}

// ForgotPasswordPin validates the 6-digit PIN and issues a short-lived JWT.
// POST /auth/forgot-password-pin
func (h *PINResetHandler) ForgotPasswordPin(w http.ResponseWriter, r *http.Request) {
	var req forgotPasswordPinRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if req.Email == "" || req.Pin == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Email and PIN are required", nil)
		return
	}

	// Rate limit: 5 attempts per 15 minutes per email
	allowed, retryAfter := h.pinLimiter.allow(req.Email)
	if !allowed {
		w.Header().Set("Retry-After", fmt.Sprintf("%.0f", retryAfter.Seconds()))
		RespondError(w, http.StatusTooManyRequests, "RATE_LIMITED", "Too many PIN attempts. Try again later.", nil)
		return
	}

	// Look up user by email
	user, err := h.store.GetUserByEmail(r.Context(), req.Email)
	if err != nil {
		slog.Info("pin_reset: email not found", "email", maskEmail(req.Email))
		// Don't reveal whether email exists
		RespondError(w, http.StatusUnauthorized, "INVALID_PIN", "Invalid email or PIN", nil)
		return
	}

	if user.PINHash == nil || *user.PINHash == "" {
		slog.Info("pin_reset: no PIN set", "email", maskEmail(req.Email))
		RespondError(w, http.StatusUnauthorized, "INVALID_PIN", "Invalid email or PIN", nil)
		return
	}

	// Verify the PIN
	if !auth.ComparePassword(*user.PINHash, req.Pin) {
		slog.Info("pin_reset: invalid PIN attempt", "email", maskEmail(req.Email))
		RespondError(w, http.StatusUnauthorized, "INVALID_PIN", "Invalid email or PIN", nil)
		return
	}

	// Issue short-lived JWT (5 minutes)
	now := time.Now()
	claims := &pinResetClaims{
		Email: req.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        uuid.New().String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(5 * time.Minute)),
			NotBefore: jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(pinResetKey(h.cfg.JWTSecret))
	if err != nil {
		slog.Error("pin_reset: failed to sign token", "error", err)
		RespondError(w, http.StatusInternalServerError, "TOKEN_FAILED", "Unable to generate reset token", nil)
		return
	}

	slog.Info("pin_reset: PIN verified, token issued", "email", maskEmail(req.Email))
	RespondSuccess(w, map[string]string{"token": tokenString})
}

// ResetPasswordPin validates the short-lived JWT and updates the user's password.
// POST /auth/reset-password-pin
func (h *PINResetHandler) ResetPasswordPin(w http.ResponseWriter, r *http.Request) {
	var req resetPasswordPinRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if req.Token == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Token is required", nil)
		return
	}
	if req.Password == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Password is required", nil)
		return
	}
	if len(req.Password) < 8 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Password must be at least 8 characters", nil)
		return
	}
	if len(req.Password) > 128 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Password must be at most 128 characters", nil)
		return
	}

	// Parse and validate the JWT
	claims := &pinResetClaims{}
	token, err := jwt.ParseWithClaims(req.Token, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return pinResetKey(h.cfg.JWTSecret), nil
	})
	if err != nil || !token.Valid {
		slog.Info("pin_reset: invalid reset token")
		RespondError(w, http.StatusUnauthorized, "INVALID_TOKEN", "Invalid or expired reset token", nil)
		return
	}

	if claims.ExpiresAt != nil && claims.ExpiresAt.Before(time.Now()) {
		RespondError(w, http.StatusUnauthorized, "TOKEN_EXPIRED", "This reset token has expired", nil)
		return
	}

	// Find user by email from claims
	user, err := h.store.GetUserByEmail(r.Context(), claims.Email)
	if err != nil {
		slog.Error("pin_reset: user not found for email", "email", maskEmail(claims.Email))
		RespondError(w, http.StatusInternalServerError, "USER_NOT_FOUND", "Unable to reset password", nil)
		return
	}

	// Hash new password
	passwordHash, err := auth.HashPassword(req.Password)
	if err != nil {
		slog.Error("pin_reset: failed to hash password", "error", err)
		RespondError(w, http.StatusInternalServerError, "HASH_FAILED", "Unable to process password", nil)
		return
	}

	// Update password
	if err := h.store.UpdateUserPassword(r.Context(), user.ID.Bytes, passwordHash); err != nil {
		slog.Error("pin_reset: failed to update password", "error", err)
		RespondError(w, http.StatusInternalServerError, "UPDATE_FAILED", "Unable to update password", nil)
		return
	}

	slog.Info("pin_reset: password updated", "email", maskEmail(claims.Email))
	RespondSuccess(w, map[string]string{"message": "Password has been reset successfully"})
}
