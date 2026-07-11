package api

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/store"
)

// MeHandler handles the /me endpoint for authenticated user profile.
type MeHandler struct {
	store store.Store
}

// NewMeHandler creates a new MeHandler.
func NewMeHandler(s store.Store) *MeHandler {
	return &MeHandler{store: s}
}

// meResponse is the safe, password-free user profile response.
type meResponse struct {
	ID              string  `json:"id"`
	StudentID       string  `json:"student_id"`
	Username        string  `json:"username"`
	Name            string  `json:"name"`
	Role            string  `json:"role"`
	ColorIndex      int     `json:"color_index"`
	XP              int     `json:"xp"`
	Level           int     `json:"level"`
	SolvedCount     int     `json:"solved_count"`
	AttemptedCount  int     `json:"attempted_count"`
	StreakDays      int     `json:"current_streak_days"`
	PrimaryLanguage string  `json:"primary_language"`
	GoogleAvatarURL *string `json:"google_avatar_url,omitempty"`
	GoogleLinked    bool    `json:"google_linked"`
	UsernameSet     bool    `json:"username_set"`
}

func clampColorIndex(index int) int {
	if index < 0 {
		return 0
	}
	if index > 5 {
		return 5
	}
	return index
}

// GetMe returns the authenticated user's profile.
func (h *MeHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	userUUID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID in token", nil)
		return
	}

	// Check cache first
	if cached, ok := getCachedUser(r.Context(), userUUID.String()); ok {
		RespondSuccess(w, cached)
		return
	}

	user, solvedCount, err := h.store.GetUserWithSolvedCount(r.Context(), userUUID)
	if err != nil {
		RespondError(w, http.StatusNotFound, "USER_NOT_FOUND", "User not found", nil)
		return
	}

	stats, err := h.store.GetUserStats(r.Context(), userUUID)
	if err != nil {
		stats = nil
	}

	idStr, err := uuidStringFromPGType(user.ID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "USER_ID_INVALID", "Unable to encode user ID", nil)
		return
	}

	level := (user.XP / 1000) + 1
	googleLinked := user.GoogleID != nil && *user.GoogleID != ""
	attemptedCount := 0
	streakDays := 0
	if stats != nil {
		attemptedCount = stats.AttemptedCount
		streakDays = stats.CurrentStreakDays
	}

	primaryLanguage := user.PrimaryLanguage
	if primaryLanguage == "" {
		primaryLanguage = "go"
	}

	resp := meResponse{
		ID:              idStr,
		StudentID:       user.StudentID,
		Username:        user.Username,
		Name:            user.Name,
		Role:            user.Role,
		ColorIndex:      clampColorIndex(user.ColorIndex),
		XP:              user.XP,
		Level:           level,
		SolvedCount:     solvedCount,
		AttemptedCount:  attemptedCount,
		StreakDays:      streakDays,
		PrimaryLanguage: primaryLanguage,
		GoogleAvatarURL: user.GoogleAvatarURL,
		GoogleLinked:    googleLinked,
		UsernameSet:     user.UsernameSet,
	}

	cacheUser(r.Context(), userUUID.String(), resp)
	RespondSuccess(w, resp)
}

// setUsernameRequest is the payload for setting/changing the username when username_set=false.
type setUsernameRequest struct {
	Username string `json:"username"`
}

// SetUsername sets the username for a user who hasn't completed onboarding.
// PUT /me/username
func (h *MeHandler) SetUsername(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	userUUID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID in token", nil)
		return
	}

	user, err := h.store.GetUserByID(r.Context(), userUUID)
	if err != nil {
		RespondError(w, http.StatusNotFound, "USER_NOT_FOUND", "User not found", nil)
		return
	}

	// Only allow if username_set is false
	if user.UsernameSet {
		RespondError(w, http.StatusForbidden, "USERNAME_ALREADY_SET", "Your username has already been set and cannot be changed. Contact an admin for assistance.", nil)
		return
	}

	var req setUsernameRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if req.Username == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Username is required", nil)
		return
	}
	if len(req.Username) < 3 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Username must be at least 3 characters", nil)
		return
	}
	if len(req.Username) > 30 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Username must be at most 30 characters", nil)
		return
	}
	if !validUsername.MatchString(req.Username) {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Username can only contain letters, numbers, underscores, and hyphens", nil)
		return
	}

	// Check uniqueness
	existingUser, err := h.store.GetUserByUsername(r.Context(), req.Username)
	if err == nil && existingUser != nil {
		existingID, _ := uuidStringFromPGType(existingUser.ID)
		if existingID != claims.UserID {
			RespondError(w, http.StatusConflict, "USERNAME_TAKEN", "This username is already taken", nil)
			return
		}
	}

	// Update username and student_id
	if err := h.store.UpdateUserUsername(r.Context(), userUUID, req.Username); err != nil {
		RespondError(w, http.StatusInternalServerError, "UPDATE_FAILED", "Unable to set username", nil)
		return
	}
	if err := h.store.UpdateUserStudentID(r.Context(), userUUID, req.Username); err != nil {
		RespondError(w, http.StatusInternalServerError, "UPDATE_FAILED", "Unable to set student ID", nil)
		return
	}
	if err := h.store.UpdateUserUsernameSet(r.Context(), userUUID, true); err != nil {
		RespondError(w, http.StatusInternalServerError, "UPDATE_FAILED", "Unable to finalize username", nil)
		return
	}

	InvalidateUserCache(claims.UserID)

	RespondSuccess(w, map[string]string{"message": "Username set successfully"})
}

// updateLanguageRequest is the payload for changing the user's primary language.
type updateLanguageRequest struct {
	Language string `json:"language"`
}

// UpdateLanguage updates the authenticated user's primary language preference.
// PUT /me/language
func (h *MeHandler) UpdateLanguage(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	userUUID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID in token", nil)
		return
	}

	var req updateLanguageRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	if req.Language != "go" && req.Language != "python" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Language must be 'go' or 'python'", nil)
		return
	}

	if err := h.store.UpdateUserPrimaryLanguage(r.Context(), userUUID, req.Language); err != nil {
		RespondError(w, http.StatusInternalServerError, "UPDATE_FAILED", "Unable to update language preference", nil)
		return
	}

	InvalidateUserCache(claims.UserID)

	// Return updated user
	user, solvedCount, err := h.store.GetUserWithSolvedCount(r.Context(), userUUID)
	if err != nil {
		RespondError(w, http.StatusNotFound, "USER_NOT_FOUND", "User not found", nil)
		return
	}

	stats, err := h.store.GetUserStats(r.Context(), userUUID)
	if err != nil {
		stats = nil
	}

	idStr, err := uuidStringFromPGType(user.ID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "USER_ID_INVALID", "Unable to encode user ID", nil)
		return
	}

	level := (user.XP / 1000) + 1
	googleLinked := user.GoogleID != nil && *user.GoogleID != ""
	attemptedCount := 0
	streakDays := 0
	if stats != nil {
		attemptedCount = stats.AttemptedCount
		streakDays = stats.CurrentStreakDays
	}

	primaryLanguage := user.PrimaryLanguage
	if primaryLanguage == "" {
		primaryLanguage = "go"
	}

	resp := meResponse{
		ID:              idStr,
		StudentID:       user.StudentID,
		Username:        user.Username,
		Name:            user.Name,
		Role:            user.Role,
		ColorIndex:      clampColorIndex(user.ColorIndex),
		XP:              user.XP,
		Level:           level,
		SolvedCount:     solvedCount,
		AttemptedCount:  attemptedCount,
		StreakDays:      streakDays,
		PrimaryLanguage: primaryLanguage,
		GoogleAvatarURL: user.GoogleAvatarURL,
		GoogleLinked:    googleLinked,
		UsernameSet:     user.UsernameSet,
	}

	RespondSuccess(w, resp)
}

// DeleteAccount permanently removes the authenticated user and all their data.
func (h *MeHandler) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	userUUID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID in token", nil)
		return
	}

	if err := h.store.DeleteUser(r.Context(), userUUID); err != nil {
		RespondError(w, http.StatusInternalServerError, "DELETE_FAILED", "Failed to delete account", nil)
		return
	}

	RespondSuccess(w, map[string]string{"message": "Account permanently deleted"})
}
