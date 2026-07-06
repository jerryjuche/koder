package api

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/store"
)

type BroadcastsHandler struct {
	store store.Store
}

func NewBroadcastsHandler(store store.Store) *BroadcastsHandler {
	return &BroadcastsHandler{store: store}
}

func (h *BroadcastsHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	var req store.NewBroadcast
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	validTypes := map[string]bool{"info": true, "warning": true, "update": true, "new_feature": true, "maintenance": true, "announcement": true}
	if !validTypes[req.Type] {
		RespondError(w, http.StatusBadRequest, "INVALID_TYPE", "Type must be one of: info, warning, update, new_feature, maintenance, announcement", nil)
		return
	}
	if strings.TrimSpace(req.Title) == "" {
		RespondError(w, http.StatusBadRequest, "INVALID_TITLE", "Title is required", nil)
		return
	}
	if req.Priority == "" {
		req.Priority = "medium"
	}
	validPriorities := map[string]bool{"low": true, "medium": true, "high": true, "critical": true}
	if !validPriorities[req.Priority] {
		RespondError(w, http.StatusBadRequest, "INVALID_PRIORITY", "Priority must be one of: low, medium, high, critical", nil)
		return
	}
	if strings.TrimSpace(req.Message) == "" {
		req.Message = req.Title
	}
	if (req.ActionLabel != nil && req.ActionURL == nil) || (req.ActionURL != nil && req.ActionLabel == nil) {
		RespondError(w, http.StatusBadRequest, "INVALID_CTA", "Both action_label and action_url must be provided together", nil)
		return
	}

	adminID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER", "Invalid user ID", nil)
		return
	}

	broadcast, err := h.store.CreateBroadcast(r.Context(), adminID, &req)
	if err != nil {
		slog.Error("broadcasts: failed to create", "error", err)
		RespondError(w, http.StatusInternalServerError, "CREATE_FAILED", "Failed to create broadcast", nil)
		return
	}

	// Send in-app notification to all users about the broadcast
	go func() {
		ctx := context.Background()
		typeLabels := map[string]string{
			"info":         "Information",
			"warning":      "Warning",
			"update":       "Update",
			"new_feature":  "New Feature",
			"maintenance":  "Maintenance",
			"announcement": "Announcement",
		}
		label := typeLabels[req.Type]
		if label == "" {
			label = req.Type
		}
		notifMessage := label + ": " + req.Title
		bid := uuid.UUID(broadcast.ID.Bytes)
		if err := h.store.ReplaceBroadcastNotifications(ctx, "broadcast_"+req.Type, notifMessage, &bid); err != nil {
			slog.Error("broadcasts: failed to notify users", "error", err)
		}
	}()

	h.store.LogActivity(r.Context(), "info", "Broadcast sent: "+req.Title, "text-brand-muted-gold", "Send")

	RespondCreated(w, broadcast)
}

func (h *BroadcastsHandler) ListActive(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER", "Invalid user ID", nil)
		return
	}

	broadcasts, err := h.store.GetActiveBroadcasts(r.Context(), userID)
	if err != nil {
		slog.Error("broadcasts: failed to list active", "error", err)
		RespondError(w, http.StatusInternalServerError, "QUERY_FAILED", "Failed to list broadcasts", nil)
		return
	}

	RespondSuccess(w, broadcasts)
}

func (h *BroadcastsHandler) Dismiss(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER", "Invalid user ID", nil)
		return
	}

	broadcastIDStr := chi.URLParam(r, "id")
	broadcastID, err := uuid.Parse(broadcastIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Invalid broadcast ID", nil)
		return
	}

	if err := h.store.MarkBroadcastDismissed(r.Context(), userID, broadcastID); err != nil {
		slog.Error("broadcasts: failed to dismiss", "error", err)
		RespondError(w, http.StatusInternalServerError, "DISMISS_FAILED", "Failed to dismiss broadcast", nil)
		return
	}

	RespondSuccess(w, map[string]string{"status": "dismissed"})
}

func (h *BroadcastsHandler) ListAll(w http.ResponseWriter, r *http.Request) {
	broadcasts, err := h.store.GetAllBroadcasts(r.Context())
	if err != nil {
		slog.Error("broadcasts: failed to list all", "error", err)
		RespondError(w, http.StatusInternalServerError, "QUERY_FAILED", "Failed to list broadcasts", nil)
		return
	}

	RespondSuccess(w, broadcasts)
}

func (h *BroadcastsHandler) Deactivate(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Invalid broadcast ID", nil)
		return
	}

	if err := h.store.DeactivateBroadcast(r.Context(), id); err != nil {
		slog.Error("broadcasts: failed to deactivate", "error", err)
		RespondError(w, http.StatusInternalServerError, "DEACTIVATE_FAILED", "Failed to deactivate broadcast", nil)
		return
	}

	RespondSuccess(w, map[string]string{"status": "deactivated"})
}

func (h *BroadcastsHandler) Activate(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Invalid broadcast ID", nil)
		return
	}

	if err := h.store.ActivateBroadcast(r.Context(), id); err != nil {
		slog.Error("broadcasts: failed to activate", "error", err)
		RespondError(w, http.StatusInternalServerError, "ACTIVATE_FAILED", "Failed to activate broadcast", nil)
		return
	}

	RespondSuccess(w, map[string]string{"status": "activated"})
}

func (h *BroadcastsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Invalid broadcast ID", nil)
		return
	}

	if err := h.store.DeleteBroadcast(r.Context(), id); err != nil {
		slog.Error("broadcasts: failed to delete", "error", err)
		RespondError(w, http.StatusInternalServerError, "DELETE_FAILED", "Failed to delete broadcast", nil)
		return
	}

	RespondSuccess(w, map[string]string{"status": "deleted"})
}
