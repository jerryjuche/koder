package api

import (
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
	ID         string `json:"id"`
	StudentID  string `json:"student_id"`
	Name       string `json:"name"`
	Role       string `json:"role"`
	ColorIndex int    `json:"color_index"`
	XP         int    `json:"xp"`
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

	user, err := h.store.GetUserByID(r.Context(), userUUID)
	if err != nil {
		RespondError(w, http.StatusNotFound, "USER_NOT_FOUND", "User not found", nil)
		return
	}

	idStr, err := uuidStringFromPGType(user.ID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "USER_ID_INVALID", "Unable to encode user ID", nil)
		return
	}

	RespondSuccess(w, meResponse{
		ID:         idStr,
		StudentID:  user.StudentID,
		Name:       user.Name,
		Role:       user.Role,
		ColorIndex: user.ColorIndex,
		XP:         user.XP,
	})
}
