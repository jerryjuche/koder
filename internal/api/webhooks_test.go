package api

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

// errNoEmailLog simulates a provider email id with no matching email log row.
var errNoEmailLog = errors.New("email log not found")

// fakeEmailLogStore implements only the store methods the webhook handler uses.
type fakeEmailLogStore struct {
	store.Store
	emailLog         *store.EmailLog
	getErr           error
	markErr          error
	updateErr        error
	markedEventType  string
	markedPayload    string
	updateStatus     string
	updateProviderID string
	inserted         bool
}

func (f *fakeEmailLogStore) GetEmailLogByProviderID(_ context.Context, providerEmailID string) (*store.EmailLog, error) {
	return f.emailLog, f.getErr
}

func (f *fakeEmailLogStore) MarkWebhookEventProcessed(_ context.Context, svixID string, emailLogID *uuid.UUID, eventType string, payload string) (bool, error) {
	f.markedEventType = eventType
	f.markedPayload = payload
	return f.inserted, f.markErr
}

func (f *fakeEmailLogStore) UpdateEmailLogByProviderID(_ context.Context, providerEmailID, status string, errorMessage *string) error {
	f.updateStatus = status
	f.updateProviderID = providerEmailID
	return f.updateErr
}

// webhookSecretForTest is a base64-encoded Svix signing secret.
func webhookSecretForTest() string {
	return "whsec_" + base64.StdEncoding.EncodeToString([]byte("test-secret-key-0123456789abcdef"))
}

// signWebhookPayload produces a valid Svix-style signature for the given body.
func signWebhookPayload(secret, body string, ts int64) (id, timestamp, signature string) {
	id = "msg_" + uuid.NewString()
	timestamp = strconv.FormatInt(ts, 10)
	content := id + "." + timestamp + "." + body
	decoded, _ := base64.StdEncoding.DecodeString(strings.TrimPrefix(secret, "whsec_"))
	h := hmac.New(sha256.New, decoded)
	h.Write([]byte(content))
	sig := base64.StdEncoding.EncodeToString(h.Sum(nil))
	return id, timestamp, "v1," + sig
}

func webhookConfig(secret string) *config.Config {
	return &config.Config{ResendWebhookSecret: secret}
}

func newWebhookHandler(f *fakeEmailLogStore, secret string) *WebhooksHandler {
	return NewWebhooksHandler(f, webhookConfig(secret))
}

func resendDeliveredBody() []byte {
	body, _ := json.Marshal(map[string]any{
		"type":       "email.delivered",
		"created_at": time.Now().UTC().Format(time.RFC3339),
		"data": map[string]any{
			"email_id": "4d3d3d3d-0000-4000-8000-000000000000",
			"to":       []string{"student@example.com"},
		},
	})
	return body
}

func TestVerifyWebhookSignatureValid(t *testing.T) {
	secret := webhookSecretForTest()
	body := `{"type":"email.delivered"}`
	id, ts, sig := signWebhookPayload(secret, body, time.Now().Unix())

	if err := verifyWebhookSignature(secret, body, id, ts, sig); err != nil {
		t.Fatalf("expected valid signature, got error: %v", err)
	}
}

func TestVerifyWebhookSignatureWrongSecret(t *testing.T) {
	body := `{"type":"email.delivered"}`
	_, ts, sig := signWebhookPayload(webhookSecretForTest(), body, time.Now().Unix())

	if err := verifyWebhookSignature(webhookSecretForTest(), body, "msg_other", ts, sig); err == nil {
		t.Fatal("expected signature verification to fail with a different svix id")
	}
}

func TestVerifyWebhookSignatureTamperedPayload(t *testing.T) {
	secret := webhookSecretForTest()
	body := `{"type":"email.delivered"}`
	id, ts, sig := signWebhookPayload(secret, body, time.Now().Unix())

	tampered := body + " "
	if err := verifyWebhookSignature(secret, tampered, id, ts, sig); err == nil {
		t.Fatal("expected signature verification to fail on tampered payload")
	}
}

func TestVerifyWebhookSignatureStaleTimestamp(t *testing.T) {
	secret := webhookSecretForTest()
	body := `{"type":"email.delivered"}`
	stale := time.Now().Add(-10 * time.Minute).Unix()
	id, ts, sig := signWebhookPayload(secret, body, stale)

	if err := verifyWebhookSignature(secret, body, id, ts, sig); err == nil {
		t.Fatal("expected stale timestamp to be rejected")
	}
}

func TestVerifyWebhookSignatureMissingHeaders(t *testing.T) {
	secret := webhookSecretForTest()
	if err := verifyWebhookSignature(secret, `{}`, "", "12345", ""); err == nil {
		t.Fatal("expected missing headers to be rejected")
	}
}

func TestVerifyWebhookSignatureEmptySecret(t *testing.T) {
	if err := verifyWebhookSignature("", `{}`, "id", "12345", "v1,sig"); err == nil {
		t.Fatal("expected empty secret to be rejected")
	}
}

func TestVerifyWebhookSignatureUndecodableSecret(t *testing.T) {
	if err := verifyWebhookSignature("whsec_!!!not-base64!!!", `{}`, "id", "12345", "v1,sig"); err == nil {
		t.Fatal("expected undecodable secret to be rejected")
	}
}

func TestWebhookRejectsWhenSecretNotConfigured(t *testing.T) {
	f := &fakeEmailLogStore{}
	h := newWebhookHandler(f, "")
	rec := httptest.NewRecorder()

	h.HandleResend(rec, httptest.NewRequest(http.MethodPost, "/api/webhooks/resend", bytes.NewReader(resendDeliveredBody())))

	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", rec.Code)
	}
}

func TestWebhookRejectsInvalidSignature(t *testing.T) {
	f := &fakeEmailLogStore{}
	h := newWebhookHandler(f, webhookSecretForTest())
	rec := httptest.NewRecorder()

	req := httptest.NewRequest(http.MethodPost, "/api/webhooks/resend", bytes.NewReader(resendDeliveredBody()))
	req.Header.Set("svix-id", "msg_fake")
	req.Header.Set("svix-timestamp", "12345")
	req.Header.Set("svix-signature", "v1,bogus")

	h.HandleResend(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
}

func TestWebhookProcessesDeliveredEvent(t *testing.T) {
	secret := webhookSecretForTest()
	body := resendDeliveredBody()
	id, ts, sig := signWebhookPayload(secret, string(body), time.Now().Unix())

	emailLog := &store.EmailLog{
		ID:    pgtype.UUID{Bytes: uuid.MustParse("11111111-1111-1111-1111-111111111111"), Valid: true},
		Email: "student@example.com",
	}
	f := &fakeEmailLogStore{emailLog: emailLog, inserted: true}
	h := newWebhookHandler(f, secret)
	rec := httptest.NewRecorder()

	req := httptest.NewRequest(http.MethodPost, "/api/webhooks/resend", bytes.NewReader(body))
	req.Header.Set("svix-id", id)
	req.Header.Set("svix-timestamp", ts)
	req.Header.Set("svix-signature", sig)

	h.HandleResend(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d (body: %s)", rec.Code, rec.Body.String())
	}
	if f.markedEventType != "email.delivered" {
		t.Fatalf("expected delivered event recorded, got %q", f.markedEventType)
	}
	if f.markedPayload != string(body) {
		t.Fatalf("expected raw JSON payload forwarded to the store, got %q", f.markedPayload)
	}
	if f.updateStatus != "delivered" {
		t.Fatalf("expected status delivered, got %q", f.updateStatus)
	}
	if f.updateProviderID != "4d3d3d3d-0000-4000-8000-000000000000" {
		t.Fatalf("expected provider id, got %q", f.updateProviderID)
	}
}

func TestWebhookAcknowledgesDuplicateEvent(t *testing.T) {
	secret := webhookSecretForTest()
	body := resendDeliveredBody()
	id, ts, sig := signWebhookPayload(secret, string(body), time.Now().Unix())

	emailLog := &store.EmailLog{ID: pgtype.UUID{Bytes: uuid.MustParse("11111111-1111-1111-1111-111111111111"), Valid: true}}
	f := &fakeEmailLogStore{emailLog: emailLog, inserted: false}
	h := newWebhookHandler(f, secret)
	rec := httptest.NewRecorder()

	req := httptest.NewRequest(http.MethodPost, "/api/webhooks/resend", bytes.NewReader(body))
	req.Header.Set("svix-id", id)
	req.Header.Set("svix-timestamp", ts)
	req.Header.Set("svix-signature", sig)

	h.HandleResend(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 for duplicate, got %d", rec.Code)
	}
	if f.updateStatus != "" {
		t.Fatalf("expected no status update for duplicate, got %q", f.updateStatus)
	}
}

func TestWebhookHandlesUnknownEventType(t *testing.T) {
	secret := webhookSecretForTest()
	unknown, _ := json.Marshal(map[string]any{
		"type": "email.opened",
		"data": map[string]any{"email_id": "4d3d3d3d-0000-4000-8000-000000000000"},
	})
	id, ts, sig := signWebhookPayload(secret, string(unknown), time.Now().Unix())

	emailLog := &store.EmailLog{ID: pgtype.UUID{Bytes: uuid.MustParse("11111111-1111-1111-1111-111111111111"), Valid: true}}
	f := &fakeEmailLogStore{emailLog: emailLog, inserted: true}
	h := newWebhookHandler(f, secret)
	rec := httptest.NewRecorder()

	req := httptest.NewRequest(http.MethodPost, "/api/webhooks/resend", bytes.NewReader(unknown))
	req.Header.Set("svix-id", id)
	req.Header.Set("svix-timestamp", ts)
	req.Header.Set("svix-signature", sig)

	h.HandleResend(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 for unknown event, got %d", rec.Code)
	}
	if f.updateStatus != "" {
		t.Fatalf("expected no status update for unknown event, got %q", f.updateStatus)
	}
}

func TestWebhookHandlesEventWithoutEmailLog(t *testing.T) {
	secret := webhookSecretForTest()
	body := resendDeliveredBody()
	id, ts, sig := signWebhookPayload(secret, string(body), time.Now().Unix())

	f := &fakeEmailLogStore{emailLog: nil, getErr: errNoEmailLog, inserted: true}
	h := newWebhookHandler(f, secret)
	rec := httptest.NewRecorder()

	req := httptest.NewRequest(http.MethodPost, "/api/webhooks/resend", bytes.NewReader(body))
	req.Header.Set("svix-id", id)
	req.Header.Set("svix-timestamp", ts)
	req.Header.Set("svix-signature", sig)

	h.HandleResend(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 when email log is missing, got %d", rec.Code)
	}
	if f.updateStatus != "" {
		t.Fatalf("expected no status update without a matching email log, got %q", f.updateStatus)
	}
}
