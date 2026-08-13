package api

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jerryjuche/koder/internal/auth"
	"github.com/jerryjuche/koder/internal/broker"
	"github.com/jerryjuche/koder/internal/config"
	"github.com/jerryjuche/koder/internal/store"
)

// feedbackUserID is a stable UUID used for the authenticated reporter in tests.
const feedbackUserID = "11111111-1111-1111-1111-111111111111"

// fakeFeedbackStore implements only the store methods the feedback Submit
// handler reaches, recording the draft-threshold decision and admin notice.
type fakeFeedbackStore struct {
	store.Store
	createErr         error
	hideResult        bool
	hideErr           error
	capturedSlug      string
	capturedThreshold int
	notifyMessage     string
}

func (f *fakeFeedbackStore) CreateFeedback(_ context.Context, _ uuid.UUID, fb *store.NewFeedback) (*store.Feedback, error) {
	if f.createErr != nil {
		return nil, f.createErr
	}
	return &store.Feedback{
		ID:          pgtype.UUID{Bytes: uuid.MustParse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), Valid: true},
		UserID:      pgtype.UUID{Bytes: uuid.MustParse(feedbackUserID), Valid: true},
		Type:        fb.Type,
		Title:       fb.Title,
		Description: fb.Description,
		Priority:    fb.Priority,
		Status:      "new",
		ProblemSlug: fb.ProblemSlug,
		CreatedAt:   time.Now(),
	}, nil
}

func (f *fakeFeedbackStore) HideProblemOnReportThreshold(_ context.Context, problemSlug string, threshold int) (bool, error) {
	f.capturedSlug = problemSlug
	f.capturedThreshold = threshold
	return f.hideResult, f.hideErr
}

func (f *fakeFeedbackStore) NotifyAdmins(_ context.Context, _ string, message string, _ *uuid.UUID) error {
	f.notifyMessage = message
	return nil
}

// withFeedbackClaims attaches a student JWT claim carrying feedbackUserID.
func withFeedbackClaims(req *http.Request) *http.Request {
	ctx := context.WithValue(req.Context(), claimsContextKey, &auth.Claims{UserID: feedbackUserID, Role: "student"})
	return req.WithContext(ctx)
}

func callFeedbackSubmit(t *testing.T, f *fakeFeedbackStore, body string) *httptest.ResponseRecorder {
	t.Helper()
	h := NewFeedbackHandler(f, &config.Config{}, broker.New())
	req := httptest.NewRequest(http.MethodPost, "/feedback", bytes.NewReader([]byte(body)))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	h.Submit(rec, withFeedbackClaims(req))
	return rec
}

func feedbackBody(t *testing.T, extra map[string]any) string {
	t.Helper()
	payload := map[string]any{
		"type":        "bug",
		"title":       "Wrong expected output",
		"description": "Case 4 returns 9 instead of 8.",
		"priority":    "medium",
	}
	for k, v := range extra {
		payload[k] = v
	}
	raw, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("marshal feedback body: %v", err)
	}
	return string(raw)
}

func decodeFeedbackData(t *testing.T, rec *httptest.ResponseRecorder) map[string]any {
	t.Helper()
	var res struct {
		Data map[string]any `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
		t.Fatalf("unmarshal response: %v (body: %s)", err, rec.Body.String())
	}
	return res.Data
}

func TestFeedbackSubmit_BugReportBelowThreshold_NotDrafted(t *testing.T) {
	f := &fakeFeedbackStore{hideResult: false}
	rec := callFeedbackSubmit(t, f, feedbackBody(t, map[string]any{"problem_slug": "two-sum"}))

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d (body: %s)", rec.Code, rec.Body.String())
	}
	data := decodeFeedbackData(t, rec)
	if data["problem_drafted"] != false {
		t.Fatalf("expected problem_drafted false below threshold, got %v", data["problem_drafted"])
	}
	if f.capturedSlug != "two-sum" {
		t.Fatalf("expected draft check for two-sum, got %q", f.capturedSlug)
	}
	if f.capturedThreshold != bugReportDraftThreshold {
		t.Fatalf("expected threshold %d, got %d", bugReportDraftThreshold, f.capturedThreshold)
	}
	if strings.Contains(f.notifyMessage, "taken down") {
		t.Fatalf("expected no taken-down notice below threshold, got %q", f.notifyMessage)
	}
}

func TestFeedbackSubmit_BugReportAtThreshold_Drafted(t *testing.T) {
	f := &fakeFeedbackStore{hideResult: true}
	rec := callFeedbackSubmit(t, f, feedbackBody(t, map[string]any{"problem_slug": "two-sum"}))

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d (body: %s)", rec.Code, rec.Body.String())
	}
	data := decodeFeedbackData(t, rec)
	if data["problem_drafted"] != true {
		t.Fatalf("expected problem_drafted true at threshold, got %v", data["problem_drafted"])
	}
	if !strings.Contains(f.notifyMessage, "(taken down for review)") {
		t.Fatalf("expected taken-down admin notice, got %q", f.notifyMessage)
	}
}

func TestFeedbackSubmit_GeneralFeedback_SkipsDraftCheck(t *testing.T) {
	body := feedbackBody(t, map[string]any{"type": "general"})
	f := &fakeFeedbackStore{}
	rec := callFeedbackSubmit(t, f, body)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d (body: %s)", rec.Code, rec.Body.String())
	}
	if f.capturedSlug != "" {
		t.Fatalf("expected no draft check for non-bug feedback, got slug %q", f.capturedSlug)
	}
	data := decodeFeedbackData(t, rec)
	if data["problem_drafted"] != false {
		t.Fatalf("expected problem_drafted false for non-bug feedback, got %v", data["problem_drafted"])
	}
}

func TestFeedbackSubmit_DraftCheckError_StillSucceeds(t *testing.T) {
	f := &fakeFeedbackStore{hideErr: errors.New("db down")}
	rec := callFeedbackSubmit(t, f, feedbackBody(t, map[string]any{"problem_slug": "two-sum"}))

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201 despite draft-check failure, got %d (body: %s)", rec.Code, rec.Body.String())
	}
	data := decodeFeedbackData(t, rec)
	if data["problem_drafted"] != false {
		t.Fatalf("expected problem_drafted false on error, got %v", data["problem_drafted"])
	}
}