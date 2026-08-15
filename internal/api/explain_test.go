package api

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jerryjuche/koder/internal/enricher"
	"github.com/jerryjuche/koder/internal/store"
)

var errExplainFailure = errors.New("nvidia: upstream failed")

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

func TestExplainCacheMissGeneratesAndUpserts(t *testing.T) {
	fs := &explainFakeStore{sol: sampleSolution(), cached: nil}
	fe := &fakeExplainer{exp: &store.SolutionExplanation{
		Language:        "go",
		Summary:         "Adds two numbers",
		Approach:        "Returns a + b",
		TimeComplexity:  "O(1)",
		SpaceComplexity: "O(1)",
		KeyTechniques:   []string{"addition"},
	}}
	h := NewExplainHandler(fs, fe)
	rec := httptest.NewRecorder()
	h.Explain(rec, explainClaims(explainHTTPRequest(`{"submission_id":"`+uuid.NewString()+`"}`)))

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", rec.Code, rec.Body.String())
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
	var body map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	data, _ := body["data"].(map[string]any)
	if data["cached"] != false {
		t.Fatalf("expected cached=false, got %v", data["cached"])
	}
}

func TestExplainProviderFailureReturns502(t *testing.T) {
	fs := &explainFakeStore{sol: sampleSolution(), cached: nil}
	fe := &fakeExplainer{err: errExplainFailure}
	h := NewExplainHandler(fs, fe)
	rec := httptest.NewRecorder()
	h.Explain(rec, explainClaims(explainHTTPRequest(`{"submission_id":"`+uuid.NewString()+`"}`)))

	if rec.Code != http.StatusBadGateway {
		t.Fatalf("expected 502, got %d", rec.Code)
	}
	if fs.upserted != nil {
		t.Fatal("expected no upsert when generation fails")
	}
}

func TestExplainChatReturnsAnswer(t *testing.T) {
	fs := &explainFakeStore{sol: sampleSolution(), cached: nil}
	fe := &fakeExplainer{answer: "The loop runs O(n) times."}
	h := NewExplainHandler(fs, fe)
	rec := httptest.NewRecorder()
	h.ExplainChat(rec, explainClaims(explainChatHTTPRequest(`{"submission_id":"`+uuid.NewString()+`","question":"complexity?"}`)))

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", rec.Code, rec.Body.String())
	}
	if fe.calls != 1 {
		t.Fatalf("expected 1 provider call, got %d", fe.calls)
	}
	var body map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	data, _ := body["data"].(map[string]any)
	if data["answer"] != "The loop runs O(n) times." {
		t.Fatalf("unexpected answer: %v", data["answer"])
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
