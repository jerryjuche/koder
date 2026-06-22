package api

import (
	"net/http"

	"github.com/jerryjuche/koder/internal/store"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type NotificationsHandler struct {
	store store.Store
}

func NewNotificationsHandler(store store.Store) *NotificationsHandler {
	return &NotificationsHandler{store: store}
}

// GetUnreadNotifications returns the unread notifications for the current user.
func (h *NotificationsHandler) GetUnreadNotifications(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Unauthorized", nil)
		return
	}

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid user ID", nil)
		return
	}

	notifications, err := h.store.GetUnreadNotifications(r.Context(), userID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to fetch notifications", err.Error())
		return
	}

	RespondSuccess(w, notifications)
}

// MarkAsRead marks a specific notification as read.
func (h *NotificationsHandler) MarkAsRead(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Unauthorized", nil)
		return
	}

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid user ID", nil)
		return
	}

	notifIDStr := chi.URLParam(r, "id")
	notifID, err := uuid.Parse(notifIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Invalid notification ID", nil)
		return
	}

	if err := h.store.MarkNotificationAsRead(r.Context(), notifID, userID); err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to mark notification as read", err.Error())
		return
	}

	RespondSuccess(w, map[string]string{"status": "success"})
}
