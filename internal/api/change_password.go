package api

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"regexp"

	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/auth"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

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
	Pin         string `json:"pin"`
	NewPassword string `json:"new_password"`
}

type verifyPinRequest struct {
	Pin string `json:"pin"`
}

type setPinRequest struct {
	Pin        string `json:"pin"`
	ConfirmPin string `json:"confirm_pin"`
}

// SetPin creates or updates a 6-digit recovery PIN for the authenticated user.
// POST /auth/set-pin
func (h *ChangePasswordHandler) SetPin(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	var req setPinRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if req.Pin == "" || req.ConfirmPin == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Both PIN and confirmation are required", nil)
		return
	}

	if matched, _ := regexp.MatchString(`^\d{6}$`, req.Pin); !matched {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "PIN must be exactly 6 digits", nil)
		return
	}

	if req.Pin != req.ConfirmPin {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "PINs do not match", nil)
		return
	}

	userUUID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER", "Invalid user ID", nil)
		return
	}

	// Check if PIN already exists (requires verify first)
	existing, err := h.store.GetUserByID(r.Context(), userUUID)
	if err != nil {
		RespondError(w, http.StatusNotFound, "USER_NOT_FOUND", "User not found", nil)
		return
	}
	if existing.PINHash != nil && *existing.PINHash != "" {
		RespondError(w, http.StatusConflict, "PIN_ALREADY_SET", "A PIN is already set on this account. Use verify-pin to authenticate.", nil)
		return
	}

	pinHash, err := auth.HashPassword(req.Pin)
	if err != nil {
		slog.Error("set_pin: failed to hash PIN", "error", err)
		RespondError(w, http.StatusInternalServerError, "HASH_FAILED", "Unable to process PIN", nil)
		return
	}

	if err := h.store.UpdateUserPINHash(r.Context(), userUUID, pinHash); err != nil {
		slog.Error("set_pin: failed to update PIN hash", "error", err)
		RespondError(w, http.StatusInternalServerError, "UPDATE_FAILED", "Unable to set PIN", nil)
		return
	}

	slog.Info("set_pin: PIN set successfully", "user_id", claims.UserID)
	RespondSuccess(w, map[string]string{"message": "Recovery PIN set successfully"})
}

// VerifyPin validates the user's 6-digit recovery PIN without changing the password.
// POST /auth/verify-pin
func (h *ChangePasswordHandler) VerifyPin(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	var req verifyPinRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if matched, _ := regexp.MatchString(`^\d{6}$`, req.Pin); !matched {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "PIN must be exactly 6 digits", nil)
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

	if user.PINHash == nil || *user.PINHash == "" {
		RespondError(w, http.StatusBadRequest, "PIN_NOT_SET", "No PIN is set on this account", nil)
		return
	}

	if !auth.ComparePassword(*user.PINHash, req.Pin) {
		slog.Warn("verify_pin: incorrect PIN", "user_id", claims.UserID)
		RespondError(w, http.StatusUnauthorized, "PIN_MISMATCH", "Incorrect PIN", nil)
		return
	}

	RespondSuccess(w, map[string]bool{"valid": true})
}

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

	if req.Pin == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "PIN is required", nil)
		return
	}
	if matched, _ := regexp.MatchString(`^\d{6}$`, req.Pin); !matched {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "PIN must be exactly 6 digits", nil)
		return
	}
	if req.NewPassword == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "New password is required", nil)
		return
	}
	if len(req.NewPassword) < 6 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "New password must be at least 6 characters", nil)
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

	if user.PINHash == nil || *user.PINHash == "" {
		RespondError(w, http.StatusBadRequest, "PIN_NOT_SET", "No PIN is set on this account. Please register a PIN first.", nil)
		return
	}

	if !auth.ComparePassword(*user.PINHash, req.Pin) {
		slog.Warn("change_password: incorrect PIN", "user_id", claims.UserID)
		RespondError(w, http.StatusUnauthorized, "PIN_MISMATCH", "Incorrect PIN", nil)
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

	RespondSuccess(w, map[string]string{"message": "Password changed successfully"})
}
