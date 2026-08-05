package api

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

// defaultWebhookToleranceSeconds is the max age (in seconds) accepted for a
// webhook timestamp. Anything older is rejected to mitigate replay attacks.
const defaultWebhookToleranceSeconds = 300

// WebhooksHandler receives asynchronous provider callbacks (currently Resend
// email delivery events). These routes are public by design — authenticity is
// enforced via signature verification, not auth.
type WebhooksHandler struct {
	store store.Store
	cfg   *config.Config
}

func NewWebhooksHandler(store store.Store, cfg *config.Config) *WebhooksHandler {
	return &WebhooksHandler{store: store, cfg: cfg}
}

// resendWebhookEvent is the delivery event payload sent by Resend.
type resendWebhookEvent struct {
	Type      string `json:"type"`
	CreatedAt string `json:"created_at"`
	Data      struct {
		EmailID string `json:"email_id"`
		To      []string `json:"to"`
		Bounce  *struct {
			Type    string `json:"type"`
			SubType string `json:"subType"`
			Message string `json:"message"`
		} `json:"bounce,omitempty"`
	} `json:"data"`
}

// resendEventToStatus maps Resend delivery events to email_logs status values.
var resendEventToStatus = map[string]string{
	"email.sent":             "sent",
	"email.delivered":        "delivered",
	"email.delivery_delayed": "delivery_delayed",
	"email.bounced":          "bounced",
	"email.complained":       "complained",
	"email.failed":           "failed",
}

// HandleResend verifies and processes a Resend delivery webhook.
// POST /api/webhooks/resend
func (h *WebhooksHandler) HandleResend(w http.ResponseWriter, r *http.Request) {
	if h.cfg.ResendWebhookSecret == "" {
		slog.Warn("webhook: RESEND_WEBHOOK_SECRET not configured, rejecting delivery events")
		http.Error(w, "webhook not configured", http.StatusServiceUnavailable)
		return
	}

	// Read the raw body BEFORE any parsing — signature verification is
	// byte-sensitive and must run against the exact request payload.
	rawBody, err := io.ReadAll(io.LimitReader(r.Body, 1*1024*1024))
	if err != nil {
		slog.Warn("webhook: failed to read body", "error", err)
		http.Error(w, "failed to read body", http.StatusBadRequest)
		return
	}

	id := r.Header.Get("svix-id")
	timestamp := r.Header.Get("svix-timestamp")
	signature := r.Header.Get("svix-signature")

	if err := verifyWebhookSignature(h.cfg.ResendWebhookSecret, string(rawBody), id, timestamp, signature); err != nil {
		slog.Warn("webhook: signature verification failed", "error", err, "svix_id", id)
		http.Error(w, "invalid signature", http.StatusBadRequest)
		return
	}

	var event resendWebhookEvent
	if err := json.Unmarshal(rawBody, &event); err != nil {
		slog.Warn("webhook: failed to parse payload", "error", err, "svix_id", id)
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}

	if event.Data.EmailID == "" {
		slog.Info("webhook: event without email_id ignored", "type", event.Type, "svix_id", id)
		respondWebhookOK(w)
		return
	}

	// Resolve the originating email log row so webhook events link to it.
	emailLog, err := h.store.GetEmailLogByProviderID(r.Context(), event.Data.EmailID)
	if err != nil {
		// The email id may belong to an older send without a log row (e.g.
		// pre-migration). Acknowledge but do not fail the delivery pipeline.
		slog.Warn("webhook: no email log found for provider email id",
			"type", event.Type, "provider_email_id", event.Data.EmailID, "error", err)
	}

	var emailLogID *uuid.UUID
	if emailLog != nil {
		id := uuid.UUID(emailLog.ID.Bytes)
		emailLogID = &id
	}

	// Record the raw event (dedupe on svix_id — delivery is at-least-once).
	// The payload is a string so SimpleProtocol encodes it as text, not bytea,
	// which the jsonb column requires (see MarkWebhookEventProcessed).
	inserted, err := h.store.MarkWebhookEventProcessed(r.Context(), id, emailLogID, event.Type, string(rawBody))
	if err != nil {
		slog.Error("webhook: failed to record event", "error", err, "svix_id", id)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	if !inserted {
		// Duplicate delivery — already processed.
		slog.Debug("webhook: duplicate event ignored", "svix_id", id)
		respondWebhookOK(w)
		return
	}

	status, ok := resendEventToStatus[event.Type]
	if !ok || emailLog == nil {
		// Events we don't track (opened/clicked) or emails without a log row
		// are acknowledged but don't mutate state.
		respondWebhookOK(w)
		return
	}

	// Bounces carry a descriptive reason we surface in the admin log.
	var errorMsg *string
	if event.Data.Bounce != nil && event.Data.Bounce.Message != "" {
		msg := event.Data.Bounce.Message
		errorMsg = &msg
	}

	if err := h.store.UpdateEmailLogByProviderID(r.Context(), event.Data.EmailID, status, errorMsg); err != nil {
		slog.Error("webhook: failed to update email log", "error", err, "provider_email_id", event.Data.EmailID, "status", status)
		// The event is already recorded; report failure so Resend retries.
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	slog.Info("webhook: email event processed",
		"type", event.Type, "status", status, "provider_email_id", event.Data.EmailID)
	respondWebhookOK(w)
}

// verifyWebhookSignature validates a Svix-signed webhook (used by Resend).
// It computes HMAC-SHA256 over "{id}.{timestamp}.{payload}" using the
// base64-decoded signing secret (whsec_ prefix stripped) and constant-time
// compares against every signature in the space-separated header. A stale
// timestamp (outside ±tolerance) is rejected to prevent replay attacks.
func verifyWebhookSignature(secret, payload, id, timestamp, signature string) error {
	if secret == "" {
		return errors.New("webhook secret is empty")
	}
	if id == "" || timestamp == "" || signature == "" {
		return errors.New("missing svix headers")
	}

	ts, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid timestamp: %w", err)
	}
	now := time.Now().Unix()
	diff := now - ts
	if diff > defaultWebhookToleranceSeconds || diff < -defaultWebhookToleranceSeconds {
		return fmt.Errorf("timestamp outside tolerance window: difference of %d seconds", diff)
	}

	// The secret is base64-encoded with a "whsec_" prefix (Svix convention).
	decodedSecret, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(secret, "whsec_"))
	if err != nil {
		return fmt.Errorf("failed to decode webhook secret: %w", err)
	}

	signedContent := fmt.Sprintf("%s.%s.%s", id, timestamp, payload)
	expected := webhookSignature(decodedSecret, []byte(signedContent))

	// The signature header may contain multiple space-separated entries,
	// each formatted as "v1,signature".
	for _, sig := range strings.Split(signature, " ") {
		parts := strings.SplitN(sig, ",", 2)
		if len(parts) != 2 {
			continue
		}
		if hmac.Equal([]byte(expected), []byte(parts[1])) {
			return nil
		}
	}
	return errors.New("no matching signature found")
}

// webhookSignature computes the base64 HMAC-SHA256 of content with the secret.
func webhookSignature(secret, content []byte) string {
	h := hmac.New(sha256.New, secret)
	h.Write(content)
	return base64.StdEncoding.EncodeToString(h.Sum(nil))
}

// respondWebhookOK acknowledges a webhook so the provider does not retry.
func respondWebhookOK(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}
