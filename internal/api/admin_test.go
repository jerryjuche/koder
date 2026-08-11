package api

import (
	"context"
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

func TestSendProblemReminder_Handler(t *testing.T) {
	cfg := &config.Config{FrontendURL: "https://koder.sbs", EmailFrom: "Koder <noreply@koder.sbs>", ResendAPIKey: "testkey"}
	fs := &fakeStore{}
	h := &AdminHandler{store: fs, cfg: cfg}
	h.httpClient = &http.Client{Transport: roundTripFunc(func(req *http.Request) *http.Response {
		if req.URL.Path != "/emails" {
			t.Fatalf("unexpected Resend request path: %s", req.URL.Path)
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
