package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

type FeedbackHandler struct {
	store store.Store
	cfg   *config.Config
}

func NewFeedbackHandler(store store.Store, cfg *config.Config) *FeedbackHandler {
	return &FeedbackHandler{store: store, cfg: cfg}
}

func (h *FeedbackHandler) Submit(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	var req store.NewFeedback
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", err.Error())
		return
	}

	if req.Type == "" || (req.Type != "general" && req.Type != "bug" && req.Type != "feature") {
		RespondError(w, http.StatusBadRequest, "INVALID_TYPE", "Type must be general, bug, or feature", nil)
		return
	}
	if strings.TrimSpace(req.Title) == "" {
		RespondError(w, http.StatusBadRequest, "INVALID_TITLE", "Title is required", nil)
		return
	}
	if strings.TrimSpace(req.Description) == "" {
		RespondError(w, http.StatusBadRequest, "INVALID_DESCRIPTION", "Description is required", nil)
		return
	}
	if req.Priority == "" {
		req.Priority = "medium"
	}
	if req.Priority != "low" && req.Priority != "medium" && req.Priority != "high" {
		RespondError(w, http.StatusBadRequest, "INVALID_PRIORITY", "Priority must be low, medium, or high", nil)
		return
	}

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER", "Invalid user ID", nil)
		return
	}

	fb, err := h.store.CreateFeedback(r.Context(), userID, &req)
	if err != nil {
		slog.Error("feedback: failed to create", "user_id", claims.UserID, "error", err)
		RespondError(w, http.StatusInternalServerError, "CREATE_FAILED", "Failed to submit feedback", nil)
		return
	}

	userIdentifier := claims.UserID
	go h.sendEmailNotification(fb, userIdentifier)

	RespondCreated(w, fb)
}

func (h *FeedbackHandler) ListAdmin(w http.ResponseWriter, r *http.Request) {
	statusFilter := r.URL.Query().Get("status")

	feedbacks, err := h.store.GetAdminFeedback(r.Context(), statusFilter)
	if err != nil {
		slog.Error("feedback: failed to list admin", "error", err)
		RespondError(w, http.StatusInternalServerError, "QUERY_FAILED", "Failed to list feedback", nil)
		return
	}

	RespondSuccess(w, feedbacks)
}

func (h *FeedbackHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_ID", "Invalid feedback ID", nil)
		return
	}

	var req struct {
		Status     string  `json:"status"`
		AdminNotes *string `json:"admin_notes"`
	}
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", err.Error())
		return
	}

	if req.Status != "new" && req.Status != "in_progress" && req.Status != "resolved" {
		RespondError(w, http.StatusBadRequest, "INVALID_STATUS", "Status must be new, in_progress, or resolved", nil)
		return
	}

	notes := ""
	if req.AdminNotes != nil {
		notes = *req.AdminNotes
	}

	fb, err := h.store.UpdateFeedbackStatus(r.Context(), id, req.Status, notes)
	if err != nil {
		slog.Error("feedback: failed to update status", "id", idStr, "error", err)
		RespondError(w, http.StatusInternalServerError, "UPDATE_FAILED", "Failed to update feedback", nil)
		return
	}

	RespondSuccess(w, fb)
}

func (h *FeedbackHandler) ListMine(w http.ResponseWriter, r *http.Request) {
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

	feedbacks, err := h.store.GetUserFeedback(r.Context(), userID)
	if err != nil {
		slog.Error("feedback: failed to list user feedback", "user_id", claims.UserID, "error", err)
		RespondError(w, http.StatusInternalServerError, "QUERY_FAILED", "Failed to list feedback", nil)
		return
	}

	RespondSuccess(w, feedbacks)
}

func (h *FeedbackHandler) Counts(w http.ResponseWriter, r *http.Request) {
	counts, err := h.store.CountFeedbackByStatus(r.Context())
	if err != nil {
		slog.Error("feedback: failed to count", "error", err)
		RespondError(w, http.StatusInternalServerError, "QUERY_FAILED", "Failed to count feedback", nil)
		return
	}

	RespondSuccess(w, counts)
}

func (h *FeedbackHandler) sendEmailNotification(fb *store.Feedback, userID string) {
	if h.cfg.ResendAPIKey == "" {
		slog.Info("feedback: no RESEND_API_KEY configured, skipping email notification")
		return
	}

	subject := fmt.Sprintf("[Koder Feedback] %s - %s", fb.Type, fb.Title)
	priority := fb.Priority
	if fb.Priority == "" {
		priority = "medium"
	}

	typeLabel := map[string]string{
		"general": "General Feedback",
		"bug":     "Bug Report",
		"feature": "Feature Request",
	}[fb.Type]

	description := fb.Description
	if len(description) > 1000 {
		description = description[:1000] + "..."
	}

	textBody := fmt.Sprintf(`New feedback submitted on Koder

Type: %s
Priority: %s
Title: %s
User: %s

Description:
%s
`, typeLabel, priority, fb.Title, userID, description)

	htmlBody := fmt.Sprintf(`<h2>New Feedback Submitted</h2>
<table style="border-collapse:collapse;width:100%%;max-width:600px;">
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Type</td><td style="padding:8px;border:1px solid #ddd;">%s</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Priority</td><td style="padding:8px;border:1px solid #ddd;">%s</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Title</td><td style="padding:8px;border:1px solid #ddd;">%s</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">User ID</td><td style="padding:8px;border:1px solid #ddd;">%s</td></tr>
<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Description</td><td style="padding:8px;border:1px solid #ddd;">%s</td></tr>
</table>`, typeLabel, priority, fb.Title, userID, description)

	payload := map[string]interface{}{
		"from":    "Koder Feedback <feedback@koder.app>",
		"to":      []string{h.cfg.AdminEmail},
		"subject": subject,
		"text":    textBody,
		"html":    htmlBody,
	}

	if fb.ScreenshotURL != nil && *fb.ScreenshotURL != "" {
		payload["attachments"] = []map[string]string{
			{
				"filename": "screenshot.png",
				"content":  *fb.ScreenshotURL,
			},
		}
	}

	body, err := json.Marshal(payload)
	if err != nil {
		slog.Error("feedback: failed to marshal email payload", "error", err)
		return
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewReader(body))
	if err != nil {
		slog.Error("feedback: failed to create email request", "error", err)
		return
	}
	req.Header.Set("Authorization", "Bearer "+h.cfg.ResendAPIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		slog.Error("feedback: failed to send email notification", "error", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		slog.Error("feedback: email API returned error", "status", resp.StatusCode)
	} else {
		slog.Info("feedback: email notification sent", "id", fb.ID.String())
	}
}
