package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jerryjuche/koder/internal/enricher"
	"github.com/jerryjuche/koder/internal/store"
)

// explainFakeStore simulates the store interactions of the explain handler.
type explainFakeStore struct {
	*store.PostgresStore
	sol       *store.SolutionForExplain
	cached    *store.SolutionExplanation
	upserted  *store.SolutionExplanation
	usageLogs int
}

func (f *explainFakeStore) GetSolutionForExplain(_ context.Context, _ uuid.UUID) (*store.SolutionForExplain, error) {
	return f.sol, nil
}
func (f *explainFakeStore) GetSolutionExplanation(_ context.Context, _ uuid.UUID) (*store.SolutionExplanation, error) {
	return f.cached, nil
}
func (f *explainFakeStore) UpsertSolutionExplanation(_ context.Context, exp *store.SolutionExplanation) error {
	f.upserted = exp
	return nil
}
func (f *explainFakeStore) LogAIUsage(_ context.Context, _ uuid.UUID, _, _ string, _, _, _ int, _ bool, _ string) error {
	f.usageLogs++
	return nil
}

// fakeExplainer is a scriptable Explainer for handler tests.
type fakeExplainer struct {
	exp    *store.SolutionExplanation
	answer string
	err    error
	calls  int
}

func (f *fakeExplainer) ExplainSolution(_ context.Context, _ *enricher.ExplainSolutionRequest) (*store.SolutionExplanation, error) {
	f.calls++
	return f.exp, f.err
}

func (f *fakeExplainer) ExplainChat(_ context.Context, _ *enricher.ExplainChatRequest) (string, error) {
	f.calls++
	return f.answer, f.err
}

func (f *fakeExplainer) ExplainSolutionStream(_ context.Context, _ *enricher.ExplainSolutionRequest, onDelta func(string) error) (*store.SolutionExplanation, error) {
	f.calls++
	if f.err != nil {
		return nil, f.err
	}
	if onDelta != nil && f.answer != "" {
		_ = onDelta(f.answer)
	}
	return f.exp, nil
}

func (f *fakeExplainer) ExplainChatStream(_ context.Context, _ *enricher.ExplainChatRequest, onDelta func(string) error) (string, error) {
	f.calls++
	if f.err != nil {
		return "", f.err
	}
	if onDelta != nil && f.answer != "" {
		_ = onDelta(f.answer)
	}
	return f.answer, nil
}

func explainHTTPRequest(body string) *http.Request {
	req := httptest.NewRequest(http.MethodPost, "/ai/explain", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	return req
}

func explainChatHTTPRequest(body string) *http.Request {
	req := httptest.NewRequest(http.MethodPost, "/ai/explain/chat", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	return req
}

// explainClaims wraps a request with authenticated claims carrying a valid UUID.
func explainClaims(req *http.Request) *http.Request {
	return withClaims(req, uuid.NewString())
}

func sampleSolution() *store.SolutionForExplain {
	author := uuid.New()
	sub := uuid.New()
	return &store.SolutionForExplain{
		SubmissionID: pgtype.UUID{Bytes: sub, Valid: true},
		AuthorID:     pgtype.UUID{Bytes: author, Valid: true},
		Language:     "go",
		Code:         "package koder\nfunc Sum(a, b int) int { return a + b }\n",
		ProblemTitle: "Sum Two Numbers",
		ProblemSlug:  "sum-two-numbers",
		Module:       "math",
		RuntimeMs:    3,
	}
}

func TestExplainRejectsUnauthenticated(t *testing.T) {
	h := NewExplainHandler(&explainFakeStore{}, &fakeExplainer{})
	rec := httptest.NewRecorder()
	h.Explain(rec, explainHTTPRequest(`{"submission_id":"`+uuid.NewString()+`"}`))
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rec.Code)
	}
}

func TestExplainValidatesPayload(t *testing.T) {
	h := NewExplainHandler(&explainFakeStore{}, &fakeExplainer{})
	rec := httptest.NewRecorder()
	h.Explain(rec, explainClaims(explainHTTPRequest(`{"submission_id":""}`)))
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for empty submission_id, got %d", rec.Code)
	}
}

func TestExplainReturns404ForIneligibleSolution(t *testing.T) {
	fs := &explainFakeStore{sol: nil}
	h := NewExplainHandler(fs, &fakeExplainer{})
	rec := httptest.NewRecorder()
	h.Explain(rec, explainClaims(explainHTTPRequest(`{"submission_id":"`+uuid.NewString()+`"}`)))
	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rec.Code)
	}
}

func TestExplainCacheHitSkipsProvider(t *testing.T) {
	cached := &store.SolutionExplanation{
		SubmissionID:   pgtype.UUID{Bytes: uuid.New(), Valid: true},
		Language:       "go",
		Summary:        "Cached summary",
		Approach:       "Cached approach",
		TimeComplexity: "O(1)",
	}
	fs := &explainFakeStore{sol: sampleSolution(), cached: cached}
	fe := &fakeExplainer{}
	h := NewExplainHandler(fs, fe)
	rec := httptest.NewRecorder()
	h.Explain(rec, explainClaims(explainHTTPRequest(`{"submission_id":"`+uuid.NewString()+`"}`)))

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", rec.Code, rec.Body.String())
	}
	if fe.calls != 0 {
		t.Fatal("expected provider not to be called on cache hit")
	}
	if fs.upserted != nil {
		t.Fatal("expected no upsert on cache hit")
	}
	var body map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	data, _ := body["data"].(map[string]any)
	if data["cached"] != true {
		t.Fatalf("expected cached=true, got %v", data["cached"])
	}
}

func TestExplainCacheMissStreamsAndUpserts(t *testing.T) {
	fs := &explainFakeStore{sol: sampleSolution(), cached: nil}
	fe := &fakeExplainer{
		answer: `{"summary":"Adds two numbers","approach":"Returns a+b","time_complexity":"O(1)","space_complexity":"O(1)"}`,
		exp: &store.SolutionExplanation{
			Language:        "go",
			Summary:         "Adds two numbers",
			Approach:        "Returns a + b",
			TimeComplexity:  "O(1)",
			SpaceComplexity: "O(1)",
			KeyTechniques:   []string{"addition"},
		},
	}
	h := NewExplainHandler(fs, fe)
	rec := httptest.NewRecorder()
	h.Explain(rec, explainClaims(explainHTTPRequest(`{"submission_id":"`+uuid.NewString()+`"}`)))

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", rec.Code, rec.Body.String())
	}
	if ct := rec.Header().Get("Content-Type"); !strings.HasPrefix(ct, "text/event-stream") {
		t.Fatalf("expected text/event-stream, got %q", ct)
	}
	if fe.calls != 1 {
		t.Fatalf("expected 1 provider call, got %d", fe.calls)
	}
	if fs.upserted == nil {
		t.Fatal("expected explanation to be cached after generation")
	}
	if !fs.upserted.SubmissionID.Valid {
		t.Fatal("expected submission_id attached to cached explanation")
	}
	if fs.usageLogs != 1 {
		t.Fatalf("expected 1 usage log, got %d", fs.usageLogs)
	}

	body := rec.Body.String()
	if !strings.Contains(body, `data: {"delta":"`) {
		t.Errorf("expected a delta frame in stream, got %s", body)
	}
	if !strings.Contains(body, `"cached":false`) || !strings.Contains(body, `"summary":"Adds two numbers"`) {
		t.Errorf("expected final explanation frame with cached=false, got %s", body)
	}
	if !strings.Contains(body, "data: [DONE]") {
		t.Errorf("expected [DONE] terminator, got %s", body)
	}
}

// TestExplainStreamsThroughLoggingMiddleware guards against a regression where
// a ResponseWriter wrapper hides http.Flusher. Every request in production
// passes through RequestLoggingMiddleware, so if its wrapper loses Flush the
// w.(http.Flusher) assertion fails and the endpoint silently degrades to the
// buffered JSON path (which older clients would drop entirely). The direct
// httptest.NewRecorder() tests never catch this because the recorder itself
// implements Flusher.
func TestExplainStreamsThroughLoggingMiddleware(t *testing.T) {
	fs := &explainFakeStore{sol: sampleSolution(), cached: nil}
	fe := &fakeExplainer{
		answer: `{"summary":"Adds two numbers","approach":"Returns a+b","time_complexity":"O(1)","space_complexity":"O(1)"}`,
		exp: &store.SolutionExplanation{
			Language:        "go",
			Summary:         "Adds two numbers",
			Approach:        "Returns a + b",
			TimeComplexity:  "O(1)",
			SpaceComplexity: "O(1)",
			KeyTechniques:   []string{"addition"},
		},
	}
	h := NewExplainHandler(fs, fe)
	wrapped := RequestLoggingMiddleware(http.HandlerFunc(h.Explain))

	rec := httptest.NewRecorder()
	wrapped.ServeHTTP(rec, explainClaims(explainHTTPRequest(`{"submission_id":"`+uuid.NewString()+`"}`)))

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", rec.Code, rec.Body.String())
	}
	if ct := rec.Header().Get("Content-Type"); !strings.HasPrefix(ct, "text/event-stream") {
		t.Fatalf("expected text/event-stream through the logging middleware, got %q", ct)
	}
	if body := rec.Body.String(); !strings.Contains(body, `data: {"delta":"`) || !strings.Contains(body, "data: [DONE]") {
		t.Errorf("expected streamed delta + [DONE] frames through the logging middleware, got %s", body)
	}
	if fs.upserted == nil {
		t.Fatal("expected explanation to be cached after streaming")
	}
}

func TestExplainProviderFailureSendsStreamErrorFrame(t *testing.T) {
	fs := &explainFakeStore{sol: sampleSolution(), cached: nil}
	fe := &fakeExplainer{err: fmt.Errorf("%w: upstream 500", enricher.ErrAIUpstream)}
	h := NewExplainHandler(fs, fe)
	rec := httptest.NewRecorder()
	h.Explain(rec, explainClaims(explainHTTPRequest(`{"submission_id":"`+uuid.NewString()+`"}`)))

	// Headers were sent once streaming started, so the failure surfaces as a
	// mid-stream error frame rather than a JSON 502.
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 with error frame, got %d", rec.Code)
	}
	if !strings.HasPrefix(rec.Header().Get("Content-Type"), "text/event-stream") {
		t.Fatalf("expected text/event-stream, got %q", rec.Header().Get("Content-Type"))
	}
	if !strings.Contains(rec.Body.String(), "EXPLAIN_FAILED") {
		t.Errorf("expected error frame with EXPLAIN_FAILED, got %s", rec.Body.String())
	}
	if fs.upserted != nil {
		t.Fatal("expected no upsert when generation fails")
	}
}

func TestExplainChatStreamsAnswer(t *testing.T) {
	fs := &explainFakeStore{sol: sampleSolution(), cached: nil}
	fe := &fakeExplainer{answer: "The loop runs O(n) times."}
	h := NewExplainHandler(fs, fe)
	rec := httptest.NewRecorder()
	h.ExplainChat(rec, explainClaims(explainChatHTTPRequest(`{"submission_id":"`+uuid.NewString()+`","question":"complexity?"}`)))

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", rec.Code, rec.Body.String())
	}
	if !strings.HasPrefix(rec.Header().Get("Content-Type"), "text/event-stream") {
		t.Fatalf("expected text/event-stream, got %q", rec.Header().Get("Content-Type"))
	}
	if fe.calls != 1 {
		t.Fatalf("expected 1 provider call, got %d", fe.calls)
	}
	if fs.usageLogs != 1 {
		t.Fatalf("expected 1 usage log, got %d", fs.usageLogs)
	}
	body := rec.Body.String()
	if !strings.Contains(body, `data: {"delta":"The loop runs O(n) times."}`) {
		t.Errorf("expected chat delta frame, got %s", body)
	}
	if !strings.Contains(body, "data: [DONE]") {
		t.Errorf("expected [DONE] terminator, got %s", body)
	}
}

func TestExplainChatProviderFailureSendsStreamErrorFrame(t *testing.T) {
	fs := &explainFakeStore{sol: sampleSolution(), cached: nil}
	fe := &fakeExplainer{err: fmt.Errorf("%w: upstream 500", enricher.ErrAIUpstream)}
	h := NewExplainHandler(fs, fe)
	rec := httptest.NewRecorder()
	h.ExplainChat(rec, explainClaims(explainChatHTTPRequest(`{"submission_id":"`+uuid.NewString()+`","question":"why?"}`)))

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 with error frame, got %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), "EXPLAIN_CHAT_FAILED") {
		t.Errorf("expected error frame with EXPLAIN_CHAT_FAILED, got %s", rec.Body.String())
	}
	if fs.usageLogs != 1 {
		t.Fatalf("expected 1 (failed) usage log, got %d", fs.usageLogs)
	}
}

func TestExplainChatValidatesQuestion(t *testing.T) {
	h := NewExplainHandler(&explainFakeStore{}, &fakeExplainer{})
	rec := httptest.NewRecorder()
	h.ExplainChat(rec, explainClaims(explainChatHTTPRequest(`{"submission_id":"`+uuid.NewString()+`","question":""}`)))
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for empty question, got %d", rec.Code)
	}
}

func TestExplainChatRejectsIneligibleSolution(t *testing.T) {
	fs := &explainFakeStore{sol: nil}
	h := NewExplainHandler(fs, &fakeExplainer{})
	rec := httptest.NewRecorder()
	h.ExplainChat(rec, explainClaims(explainChatHTTPRequest(`{"submission_id":"`+uuid.NewString()+`","question":"why?"}`)))
	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rec.Code)
	}
}
