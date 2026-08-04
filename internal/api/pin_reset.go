package api

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
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
	store store.Store
	cfg   *config.Config
	rl    *identifierRateLimiter
}

// identifierRateLimiter is a per-key sliding-window limiter keyed by login
// identifiers (username, email, or student_id) to prevent PIN brute-forcing.
type identifierRateLimiter struct {
	mu       sync.Mutex
	attempts map[string]*identifierRateEntry
}

type identifierRateEntry struct {
	count       int
	windowStart time.Time
}

func newIdentifierRateLimiter() *identifierRateLimiter {
	rl := &identifierRateLimiter{
		attempts: make(map[string]*identifierRateEntry),
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

func (rl *identifierRateLimiter) allow(identifier string) (bool, time.Duration) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	entry, exists := rl.attempts[identifier]

	if !exists || now.Sub(entry.windowStart) >= 15*time.Minute {
		rl.attempts[identifier] = &identifierRateEntry{
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
	Login string `json:"login"`
	Pin   string `json:"pin"`
}

type resetPasswordPinRequest struct {
	Token    string `json:"token"`
	Password string `json:"password"`
}

// pinResetClaims are short-lived JWT claims for PIN-based password reset.
// The subject is the user ID so recovery works for accounts without an email.
type pinResetClaims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

func NewPINResetHandler(store store.Store, cfg *config.Config) *PINResetHandler {
	return &PINResetHandler{
		store: store,
		cfg:   cfg,
		rl:    newIdentifierRateLimiter(),
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

	if req.Login == "" || req.Pin == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Username/email and PIN are required", nil)
		return
	}

	// Rate limit: 5 attempts per 15 minutes per login identifier
	allowed, retryAfter := h.rl.allow(req.Login)
	if !allowed {
		w.Header().Set("Retry-After", fmt.Sprintf("%.0f", retryAfter.Seconds()))
		RespondError(w, http.StatusTooManyRequests, "RATE_LIMITED", "Too many PIN attempts. Please wait 15 minutes.", nil)
		return
	}

	// Look up user by username, email, or student_id so accounts without an
	// email can still recover their password using their PIN.
	user, err := h.store.GetUserByLogin(r.Context(), req.Login)
	if err != nil {
		slog.Info("pin_reset: account not found", "login", maskLogin(req.Login))
		// Don't reveal whether the account exists
		RespondError(w, http.StatusUnauthorized, "INVALID_PIN", "Invalid username/email or PIN", nil)
		return
	}

	if user.PINHash == nil || *user.PINHash == "" {
		slog.Info("pin_reset: no PIN set", "user_id", user.ID)
		RespondError(w, http.StatusUnauthorized, "INVALID_PIN", "Invalid username/email or PIN", nil)
		return
	}

	// Verify the PIN
	if !auth.ComparePassword(*user.PINHash, req.Pin) {
		slog.Info("pin_reset: invalid PIN attempt", "user_id", user.ID)
		RespondError(w, http.StatusUnauthorized, "INVALID_PIN", "Invalid username/email or PIN", nil)
		return
	}

	userIDString, err := uuidStringFromPGType(user.ID)
	if err != nil {
		slog.Error("pin_reset: invalid user ID", "error", err)
		RespondError(w, http.StatusInternalServerError, "USER_ID_INVALID", "Unable to encode user ID", nil)
		return
	}

	// Issue short-lived JWT (5 minutes)
	now := time.Now()
	claims := &pinResetClaims{
		UserID: userIDString,
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

	slog.Info("pin_reset: PIN verified, token issued", "user_id", userIDString)
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

	if claims.UserID == "" {
		RespondError(w, http.StatusUnauthorized, "INVALID_TOKEN", "Invalid or expired reset token", nil)
		return
	}

	// Find user by ID from claims
	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		slog.Error("pin_reset: malformed user ID in claims", "error", err)
		RespondError(w, http.StatusUnauthorized, "INVALID_TOKEN", "Invalid or expired reset token", nil)
		return
	}
	user, err := h.store.GetUserByID(r.Context(), userID)
	if err != nil {
		slog.Error("pin_reset: user not found for ID", "user_id", claims.UserID)
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

	slog.Info("pin_reset: password updated", "user_id", claims.UserID)
	RespondSuccess(w, map[string]string{"message": "Password has been reset successfully"})
}

// maskLogin redacts a login identifier for logging: email-like values keep
// their domain portion while usernames are shortened to their first two chars.
func maskLogin(login string) string {
	if login == "" {
		return ""
	}
	at := strings.LastIndex(login, "@")
	if at > 0 && at < len(login)-1 {
		return login[:1] + "***" + login[at:]
	}
	if len(login) <= 2 {
		return login[:1] + "*"
	}
	return login[:2] + "***"
}
