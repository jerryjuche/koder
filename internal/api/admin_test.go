package api

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

// roundTripFunc implements http.RoundTripper for tests.
type roundTripFunc func(req *http.Request) *http.Response

func (f roundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) { return f(req), nil }

type fakeStore struct {
	*store.PostgresStore
	createdEmails []string
}

func (f *fakeStore) Ping(ctx context.Context) error { return nil }
func (f *fakeStore) ListAllUserEmails(ctx context.Context) ([]string, error) {
	return []string{"tester@example.com"}, nil
}
func (f *fakeStore) GetProblemBySlugAny(ctx context.Context, slug string) (*store.Problem, error) {
	return &store.Problem{Slug: slug, Title: "Sum Two Numbers", Statement: "Add two numbers"}, nil
}
func (f *fakeStore) CreateEmailLog(ctx context.Context, resetID *uuid.UUID, email, flow string) (*store.EmailLog, error) {
	now := time.Now()
	id := pgtype.UUID{}
	f.createdEmails = append(f.createdEmails, email)
	return &store.EmailLog{ID: id, Email: email, Flow: flow, Status: "created", Attempts: 0, CreatedAt: now, UpdatedAt: now}, nil
}
func (f *fakeStore) UpdateEmailLogAttempts(ctx context.Context, logID uuid.UUID, attempts int) error {
	return nil
}
func (f *fakeStore) UpdateEmailLogStatus(ctx context.Context, logID uuid.UUID, status string, providerEmailID, errorMessage *string) error {
	return nil
}
func (f *fakeStore) LogActivity(ctx context.Context, logType, message, color, icon string) error {
	return nil
}
func (f *fakeStore) GetBestPractices(ctx context.Context, currentUserID uuid.UUID, mineOnly bool, limit int) ([]store.CommunitySolution, error) {
	return []store.CommunitySolution{
		{UserName: "Alice", ProblemTitle: "Sum Two Numbers", Language: "go", Likes: 24, RuntimeMs: 5},
		{UserName: "Bob", ProblemTitle: "Fibonacci", Language: "python", Likes: 19, RuntimeMs: 12},
	}, nil
}

// previewRequest drives PreviewEmail and decodes the response envelope.
func previewRequest(t *testing.T, h *AdminHandler, query string) (int, emailPreviewResponse) {
	t.Helper()
	req := httptest.NewRequest(http.MethodGet, "/admin/email-preview?"+query, nil)
	w := httptest.NewRecorder()
	h.PreviewEmail(w, req)

	var envelope struct {
		Success bool                 `json:"success"`
		Data    emailPreviewResponse `json:"data"`
		Error   APIError             `json:"error"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &envelope); err != nil {
		t.Fatalf("decode preview response: %v (body=%s)", err, w.Body.String())
	}
	return w.Code, envelope.Data
}

func previewHandler(cfg *config.Config) *AdminHandler {
	return &AdminHandler{store: &fakeStore{}, cfg: cfg, httpClient: nil}
}

func TestPreviewEmail_PasswordResetInlinesLogo(t *testing.T) {
	cfg := &config.Config{FrontendURL: "https://koder.sbs", EmailFrom: "Koder <noreply@koder.sbs>", ResendAPIKey: "testkey"}
	code, preview := previewRequest(t, previewHandler(cfg), "template=password_reset")

	if code != http.StatusOK {
		t.Fatalf("expected 200, got %d", code)
	}
	if preview.Template != "password_reset" {
		t.Errorf("template = %q", preview.Template)
	}
	if preview.Subject != "Koder — Reset Your Password" {
		t.Errorf("subject = %q", preview.Subject)
	}
	if preview.From != cfg.EmailFrom {
		t.Errorf("from = %q", preview.From)
	}
	if !preview.SendReady {
		t.Error("expected send_ready=true when a Resend key is configured")
	}
	for _, want := range []string{
		"Reset your password",
		"https://koder.sbs/reset-password?token=preview-only-token",
		"data:image/png;base64,",
		`width="120"`,
	} {
		if !strings.Contains(preview.HTML, want) {
			t.Errorf("preview HTML missing %q", want)
		}
	}
	if strings.Contains(preview.HTML, "cid:") {
		t.Error("preview HTML must inline the logo (no cid: reference)")
	}
}

func TestPreviewEmail_ProblemReminder(t *testing.T) {
	cfg := &config.Config{FrontendURL: "https://koder.sbs", EmailFrom: "Koder <noreply@koder.sbs>", ResendAPIKey: "testkey"}
	code, preview := previewRequest(t, previewHandler(cfg), "template=problem_reminder&problem_slug=sum-two-numbers")

	if code != http.StatusOK {
		t.Fatalf("expected 200, got %d", code)
	}
	if preview.Subject != "Koder — Try this problem: Sum Two Numbers" {
		t.Errorf("subject = %q", preview.Subject)
	}
	for _, want := range []string{"Sum Two Numbers", "redirect_to=", "data:image/png;base64,"} {
		if !strings.Contains(preview.HTML, want) {
			t.Errorf("preview HTML missing %q", want)
		}
	}
}

func TestPreviewEmail_ProblemReminderRequiresSlug(t *testing.T) {
	cfg := &config.Config{FrontendURL: "https://koder.sbs"}
	req := httptest.NewRequest(http.MethodGet, "/admin/email-preview?template=problem_reminder", nil)
	w := httptest.NewRecorder()
	previewHandler(cfg).PreviewEmail(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d body=%s", w.Code, w.Body.String())
	}
	if !strings.Contains(w.Body.String(), "VALIDATION_ERROR") {
		t.Errorf("expected VALIDATION_ERROR, got %s", w.Body.String())
	}
}

func TestPreviewEmail_BestPracticesShowsLiveSolutions(t *testing.T) {
	cfg := &config.Config{FrontendURL: "https://koder.sbs", EmailFrom: "Koder <noreply@koder.sbs>"}
	code, preview := previewRequest(t, previewHandler(cfg), "template=best_practices")

	if code != http.StatusOK {
		t.Fatalf("expected 200, got %d", code)
	}
	if preview.SendReady {
		t.Error("expected send_ready=false without a Resend key")
	}
	for _, want := range []string{"Discover Best Practices", "Sum Two Numbers", "Alice", "data:image/png;base64,"} {
		if !strings.Contains(preview.HTML, want) {
			t.Errorf("preview HTML missing %q", want)
		}
	}
}

func TestPreviewEmail_RejectsUnknownOrMissingTemplate(t *testing.T) {
	cfg := &config.Config{FrontendURL: "https://koder.sbs"}
	for _, query := range []string{"", "template=welcome_campaign"} {
		req := httptest.NewRequest(http.MethodGet, "/admin/email-preview?"+query, nil)
		w := httptest.NewRecorder()
		previewHandler(cfg).PreviewEmail(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("query %q: expected 400, got %d", query, w.Code)
		}
		if !strings.Contains(w.Body.String(), "VALIDATION_ERROR") {
			t.Errorf("query %q: expected VALIDATION_ERROR, got %s", query, w.Body.String())
		}
	}
}

func TestPreviewEmail_EchoesCustomSubject(t *testing.T) {
	cfg := &config.Config{FrontendURL: "https://koder.sbs"}
	code, preview := previewRequest(t, previewHandler(cfg), "template=password_reset&subject=Custom%20subject")
	if code != http.StatusOK {
		t.Fatalf("expected 200, got %d", code)
	}
	if preview.Subject != "Custom subject" {
		t.Errorf("subject = %q", preview.Subject)
	}
}

// TestPreviewEmail_DoesNotDispatch guards the "inspect before broadcast"
// contract: rendering a preview must never hit Resend or write an email log.
func TestPreviewEmail_DoesNotDispatch(t *testing.T) {
	cfg := &config.Config{FrontendURL: "https://koder.sbs", EmailFrom: "Koder <noreply@koder.sbs>", ResendAPIKey: "testkey"}
	fs := &fakeStore{}
	h := &AdminHandler{store: fs, cfg: cfg}
	h.httpClient = &http.Client{Transport: roundTripFunc(func(req *http.Request) *http.Response {
		t.Fatalf("preview must not call Resend, got %s %s", req.Method, req.URL)
		return nil
	})}

	for _, query := range []string{
		"template=password_reset",
		"template=problem_reminder&problem_slug=sum-two-numbers",
		"template=best_practices",
	} {
		if code, _ := previewRequest(t, h, query); code != http.StatusOK {
			t.Fatalf("query %q: expected 200, got %d", query, code)
		}
	}
	if len(fs.createdEmails) != 0 {
		t.Errorf("preview must not create email logs, got %v", fs.createdEmails)
	}
}

func TestSendProblemReminder_Handler(t *testing.T) {
	cfg := &config.Config{FrontendURL: "https://koder.sbs", EmailFrom: "Koder <noreply@koder.sbs>", ResendAPIKey: "testkey"}
	fs := &fakeStore{}
	h := &AdminHandler{store: fs, cfg: cfg}
	h.httpClient = &http.Client{Transport: roundTripFunc(func(req *http.Request) *http.Response {
		if req.URL.Path != "/emails" {
			t.Fatalf("unexpected Resend request path: %s", req.URL.Path)
		}
		// Read outgoing request body and assert it contains the redirect_to param
		bodyBytes, _ := io.ReadAll(req.Body)
		bodyStr := string(bodyBytes)
		if !strings.Contains(bodyStr, "redirect_to=") {
			t.Fatalf("expected redirect_to in resend payload, got body=%s", bodyStr)
		}
		return &http.Response{
			StatusCode: 200,
			Body:       io.NopCloser(strings.NewReader(`{"id":"abc-123"}`)),
			Header:     make(http.Header),
		}
	})}

	payload := `{"problem_slug":"sum-two-numbers","send_to_all":true}`
	req := httptest.NewRequest("POST", "/admin/broadcast-emails", strings.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.SendProblemReminder(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200 got %d body=%s", w.Code, w.Body.String())
	}

	if len(fs.createdEmails) != 1 || fs.createdEmails[0] != "tester@example.com" {
		t.Fatalf("expected one email created for tester@example.com, got %v", fs.createdEmails)
	}
}

func TestSendBestPracticesAnnouncement_Handler(t *testing.T) {
	cfg := &config.Config{FrontendURL: "https://koder.sbs", EmailFrom: "Koder <noreply@koder.sbs>", ResendAPIKey: "testkey"}
	fs := &fakeStore{}
	h := &AdminHandler{store: fs, cfg: cfg}
	h.httpClient = &http.Client{Transport: roundTripFunc(func(req *http.Request) *http.Response {
		if req.URL.Path != "/emails" {
			t.Fatalf("unexpected Resend request path: %s", req.URL.Path)
		}
		bodyBytes, _ := io.ReadAll(req.Body)
		bodyStr := string(bodyBytes)
		if !strings.Contains(bodyStr, "Best Practices") {
			t.Fatalf("expected 'Best Practices' in email body, got body=%s", bodyStr)
		}
		return &http.Response{
			StatusCode: 200,
			Body:       io.NopCloser(strings.NewReader(`{"id":"bp-456"}`)),
			Header:     make(http.Header),
		}
	})}

	payload := `{"send_to_all":true}`
	req := httptest.NewRequest("POST", "/admin/broadcast-best-practices", strings.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.SendBestPracticesAnnouncement(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200 got %d body=%s", w.Code, w.Body.String())
	}

	if len(fs.createdEmails) != 1 || fs.createdEmails[0] != "tester@example.com" {
		t.Fatalf("expected one email created for tester@example.com, got %v", fs.createdEmails)
	}
}
