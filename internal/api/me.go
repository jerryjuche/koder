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
	ID             string  `json:"id"`
	StudentID      string  `json:"student_id"`
	Username       string  `json:"username"`
	Name           string  `json:"name"`
	Role           string  `json:"role"`
	ColorIndex     int     `json:"color_index"`
	XP             int     `json:"xp"`
	Level          int     `json:"level"`
	SolvedCount    int     `json:"solved_count"`
	GoogleAvatarURL *string `json:"google_avatar_url,omitempty"`
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

	idStr, err := uuidStringFromPGType(user.ID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "USER_ID_INVALID", "Unable to encode user ID", nil)
		return
	}

	level := (user.XP / 1000) + 1

	cacheUser(r.Context(), userUUID.String(), meResponse{
		ID:             idStr,
		StudentID:      user.StudentID,
		Username:       user.Username,
		Name:           user.Name,
		Role:           user.Role,
		ColorIndex:     clampColorIndex(user.ColorIndex),
		XP:             user.XP,
		Level:          level,
		SolvedCount:    solvedCount,
		GoogleAvatarURL: user.GoogleAvatarURL,
	})

	RespondSuccess(w, meResponse{
		ID:             idStr,
		StudentID:      user.StudentID,
		Username:       user.Username,
		Name:           user.Name,
		Role:           user.Role,
		ColorIndex:     clampColorIndex(user.ColorIndex),
		XP:             user.XP,
		Level:          level,
		SolvedCount:    solvedCount,
		GoogleAvatarURL: user.GoogleAvatarURL,
	})
}
