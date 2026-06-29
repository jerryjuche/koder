package api

import (
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/store"
)

// ActivityHandler handles the /me/activity endpoint.
type ActivityHandler struct {
	store store.Store
}

// NewActivityHandler creates a new ActivityHandler.
func NewActivityHandler(s store.Store) *ActivityHandler {
	return &ActivityHandler{store: s}
}

// GetActivity returns the authenticated user's daily activity for the contribution graph.
func (h *ActivityHandler) GetActivity(w http.ResponseWriter, r *http.Request) {
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

	year := time.Now().Year()
	if yearParam := r.URL.Query().Get("year"); yearParam != "" {
		if parsed, err := strconv.Atoi(yearParam); err == nil && parsed > 2000 && parsed < 2100 {
			year = parsed
		}
	}

	entries, err := h.store.GetUserActivity(r.Context(), userUUID, year)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "ACTIVITY_ERROR", "Failed to load activity data", nil)
		return
	}

	if entries == nil {
		entries = []store.ActivityEntry{}
	}

	RespondSuccess(w, entries)
}
