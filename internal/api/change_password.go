package api

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/auth"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

// passwordAttemptLimiter is a per-user sliding window limiter for
// change-password verification attempts, preventing brute force against
// the current password. 5 attempts per 15 minutes.
type passwordAttemptLimiter struct {
	mu       sync.Mutex
	attempts map[string]int
	lastSeen map[string]time.Time
}

var globalPasswordLimiter = &passwordAttemptLimiter{
	attempts: make(map[string]int),
	lastSeen: make(map[string]time.Time),
}

func (rl *passwordAttemptLimiter) Allow(userID string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	// Cleanup stale entries (older than 15 min)
	now := time.Now()
	for k, t := range rl.lastSeen {
		if now.Sub(t) > 15*time.Minute {
			delete(rl.attempts, k)
			delete(rl.lastSeen, k)
		}
	}

	rl.lastSeen[userID] = now
	rl.attempts[userID]++
	if rl.attempts[userID] > 5 {
		return false
	}
	return true
}

type ChangePasswordHandler struct {
	store  store.Store
	config *config.Config
}

func NewChangePasswordHandler(store store.Store, cfg *config.Config) *ChangePasswordHandler {
	return &ChangePasswordHandler{
		store:  store,
		config: cfg,
	}
}

type changePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

// ChangePassword verifies the user's current password and updates it to a new one.
// POST /auth/change-password
func (h *ChangePasswordHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	var req changePasswordRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if req.CurrentPassword == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Current password is required", nil)
		return
	}
	if req.NewPassword == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "New password is required", nil)
		return
	}
	if len(req.NewPassword) < 8 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "New password must be at least 8 characters", nil)
		return
	}
	if len(req.NewPassword) > 128 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "New password must be at most 128 characters", nil)
		return
	}
	if req.CurrentPassword == req.NewPassword {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "New password must be different from the current password", nil)
		return
	}

	userUUID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER", "Invalid user ID", nil)
		return
	}

	user, err := h.store.GetUserByID(r.Context(), userUUID)
	if err != nil {
		RespondError(w, http.StatusNotFound, "USER_NOT_FOUND", "User not found", nil)
		return
	}

	// Google-only accounts have no password set; email reset is the only recovery path.
	if user.Password == "" {
		RespondError(w, http.StatusConflict, "NO_PASSWORD_SET", "No password is set on this account. Use password reset via email instead.", nil)
		return
	}

	if !globalPasswordLimiter.Allow(claims.UserID) {
		RespondError(w, http.StatusTooManyRequests, "RATE_LIMITED", "Too many attempts. Please wait 15 minutes.", nil)
		return
	}

	if !auth.ComparePassword(user.Password, req.CurrentPassword) {
		slog.Warn("change_password: incorrect current password", "user_id", claims.UserID)
		RespondError(w, http.StatusUnauthorized, "INCORRECT_PASSWORD", "Current password is incorrect", nil)
		return
	}

	passwordHash, err := auth.HashPassword(req.NewPassword)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "HASH_FAILED", "Unable to hash password", nil)
		return
	}

	if err := h.store.UpdateUserPassword(r.Context(), userUUID, passwordHash); err != nil {
		RespondError(w, http.StatusInternalServerError, "UPDATE_FAILED", "Unable to update password", nil)
		return
	}

	slog.Info("change_password: password changed", "user_id", claims.UserID)
	RespondSuccess(w, map[string]string{"message": "Password changed successfully"})
}
