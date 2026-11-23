package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/enricher"
	"github.com/jerryjuche/koder/internal/store"
)

// insightsFakeStore simulates only the store surface the insights handler uses.
type insightsFakeStore struct {
	*store.PostgresStore

	snapshotErr error

	cachedReport   []byte
	cachedSnapshot []byte
	cachedModel    string
	cachedAt       time.Time

	upsertedReport   []byte
	upsertedSnapshot []byte
	upsertCalls      int
	usageLogs        int
	activityLogs     int
	snapshotPeriod   string
	snapshotStart    time.Time
}

func (f *insightsFakeStore) GetInsightsSnapshot(_ context.Context, period string, start, end time.Time) (*store.InsightsSnapshot, error) {
	f.snapshotPeriod = period
	f.snapshotStart = start
	if f.snapshotErr != nil {
		return nil, f.snapshotErr
	}
	return sampleInsightsSnapshot(period, start, end), nil
}

func (f *insightsFakeStore) GetAdminInsightReport(_ context.Context, _, _ string, _ time.Time) ([]byte, []byte, string, time.Time, error) {
	if len(f.cachedReport) == 0 {
		return nil, nil, "", time.Time{}, nil
	}
	return f.cachedReport, f.cachedSnapshot, f.cachedModel, f.cachedAt, nil
}

func (f *insightsFakeStore) UpsertAdminInsightReport(_ context.Context, _ uuid.UUID, _, _, _ string, _ string, reportJSON, snapshotJSON []byte) error {
	f.upsertCalls++
	f.upsertedReport = reportJSON
	f.upsertedSnapshot = snapshotJSON
	return nil
}

func (f *insightsFakeStore) LogAIUsage(_ context.Context, _ uuid.UUID, _, _ string, _, _, _ int, _ bool, _ string) error {
	f.usageLogs++
	return nil
}

func (f *insightsFakeStore) LogActivity(_ context.Context, _, _, _, _ string) error {
	f.activityLogs++
	return nil
}

// fakeInsightGenerator is a scriptable InsightGenerator.
type fakeInsightGenerator struct {
	report *enricher.InsightReport
	err    error
	calls  int
	last   *enricher.AdminInsightsRequest
}

func (f *fakeInsightGenerator) GenerateInsights(_ context.Context, req *enricher.AdminInsightsRequest) (*enricher.AdminInsightsResponse, error) {
	f.calls++
	f.last = req
	if f.err != nil {
		return nil, f.err
	}
	report := f.report
	if report == nil {
		report = &enricher.InsightReport{
			Headline:   "Quiet day with steady practice",
			Summary:    "## Overview\n\nOne student solved two problems and the pass rate held at 50%.",
			Highlights: []string{"2 problems solved"},
		}
	}
	return &enricher.AdminInsightsResponse{
		Report:      report,
		Model:       "test-model",
		GeneratedAt: time.Date(2026, 11, 23, 12, 0, 0, 0, time.UTC),
	}, nil
}

func (f *fakeInsightGenerator) GenerateInsightsStream(_ context.Context, req *enricher.AdminInsightsRequest, onNarrative func(string) error) (*enricher.AdminInsightsResponse, error) {
	resp, err := f.GenerateInsights(context.Background(), req)
	if err != nil {
		return nil, err
	}
	if onNarrative != nil {
		if err := onNarrative(resp.Report.Summary); err != nil {
			return nil, err
		}
	}
	return resp, nil
}

func sampleInsightsSnapshot(period string, start, end time.Time) *store.InsightsSnapshot {
	return &store.InsightsSnapshot{
		GeneratedAt:   time.Date(2026, 11, 23, 12, 0, 0, 0, time.UTC),
		Period:        period,
		WindowStart:   start,
		WindowEnd:     end,
		Totals:        store.InsightsTotals{ActiveUsers: 3, Submissions: 10, Passed: 5, PassRate: 50, Solutions: 4, XPEarned: 40},
		DailyActivity: []store.InsightsDailyCount{{Day: "2026-11-23", Submissions: 10, Passed: 5, ActiveUsers: 3}},
		TopPerformers: []store.InsightsPerformer{{UserID: uuid.NewString(), Name: "Ada", Username: "ada", XPEarned: 20, Solved: 2, Attempts: 3, PassRate: 66.7}},
		AI:            store.InsightsAI{ByAction: []store.InsightsAIActivity{}},
	}
}

func insightsRequest(body string) *http.Request {
	req := httptest.NewRequest(http.MethodPost, "/admin/ai/insights", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	return withClaims(req, uuid.NewString())
}

type insightsEnvelope struct {
	Success bool                   `json:"success"`
	Data    adminInsightsResponse  `json:"data"`
	Error   struct {
		Code    string `json:"code"`
		Message string `json:"message"`
		Details any    `json:"details"`
	} `json:"error"`
}

func decodeInsightsEnvelope(t *testing.T, rec *httptest.ResponseRecorder) insightsEnvelope {
	t.Helper()
	var env insightsEnvelope
	if err := json.Unmarshal(rec.Body.Bytes(), &env); err != nil {
		t.Fatalf("decode response: %v (body=%s)", err, rec.Body.String())
	}
	return env
}

func TestInsightsGeneratesAndCaches(t *testing.T) {
	fs := &insightsFakeStore{}
	fg := &fakeInsightGenerator{}
	h := NewInsightsHandler(fs, fg)

	rec := httptest.NewRecorder()
	h.Generate(rec, insightsRequest(`{"question":"how was today?","period":"today"}`))

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200 (body=%s)", rec.Code, rec.Body.String())
	}
	env := decodeInsightsEnvelope(t, rec)
	if !env.Success || env.Data.Report == nil {
		t.Fatalf("unexpected envelope: %s", rec.Body.String())
	}
	if env.Data.Cached {
		t.Error("cached = true on a cache miss")
	}
	if env.Data.Snapshot == nil || env.Data.Snapshot.Totals.Submissions != 10 {
		t.Errorf("snapshot not returned with characterising numbers: %+v", env.Data.Snapshot)
	}
	if fg.calls != 1 {
		t.Errorf("generator calls = %d, want 1", fg.calls)
	}
	if fg.last == nil || fg.last.Question != "how was today?" || fg.last.Period != "today" {
		t.Errorf("generator received wrong request: %+v", fg.last)
	}
	if fg.last.Snapshot == nil {
		t.Error("generator did not receive the SQL snapshot as grounding")
	}
	if fs.upsertCalls != 1 || len(fs.upsertedReport) == 0 || len(fs.upsertedSnapshot) == 0 {
		t.Errorf("report was not cached (calls=%d)", fs.upsertCalls)
	}
	if fs.usageLogs != 1 {
		t.Errorf("ai usage logs = %d, want 1", fs.usageLogs)
	}
	if fs.activityLogs != 1 {
		t.Errorf("activity logs = %d, want 1", fs.activityLogs)
	}
}

func TestInsightsDefaultsToToday(t *testing.T) {
	fs := &insightsFakeStore{}
	fg := &fakeInsightGenerator{}
	h := NewInsightsHandler(fs, fg)
	h.now = func() time.Time { return time.Date(2026, 11, 23, 15, 30, 0, 0, time.UTC) }

	rec := httptest.NewRecorder()
	h.Generate(rec, insightsRequest(`{}`))

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200 (body=%s)", rec.Code, rec.Body.String())
	}
	if fs.snapshotPeriod != "today" {
		t.Errorf("period = %q, want today", fs.snapshotPeriod)
	}
	wantStart := time.Date(2026, 11, 23, 0, 0, 0, 0, time.UTC)
	if !fs.snapshotStart.Equal(wantStart) {
		t.Errorf("window start = %s, want %s", fs.snapshotStart, wantStart)
	}
	if fg.last.Question == "" {
		t.Error("default question was not applied")
	}
}

func TestInsightsServesCacheWithoutAICall(t *testing.T) {
	snap := sampleInsightsSnapshot("today", time.Now().Add(-time.Hour), time.Now())
	snapJSON, _ := json.Marshal(snap)
	reportJSON, _ := json.Marshal(&enricher.InsightReport{
		Headline: "Cached headline",
		Summary:  "## Cached\n\nThis answer was served from the cache without a model call.",
	})

	fs := &insightsFakeStore{
		cachedReport:   reportJSON,
		cachedSnapshot: snapJSON,
		cachedModel:    "cached-model",
		cachedAt:       time.Now().Add(-5 * time.Minute),
	}
	fg := &fakeInsightGenerator{}
	h := NewInsightsHandler(fs, fg)

	rec := httptest.NewRecorder()
	h.Generate(rec, insightsRequest(`{"period":"today"}`))

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200 (body=%s)", rec.Code, rec.Body.String())
	}
	env := decodeInsightsEnvelope(t, rec)
	if !env.Data.Cached {
		t.Error("cached = false for a cache hit")
	}
	if env.Data.Report == nil || env.Data.Report.Headline != "Cached headline" {
		t.Errorf("cached report not returned: %+v", env.Data.Report)
	}
	if env.Data.Model != "cached-model" {
		t.Errorf("model = %q, want cached-model", env.Data.Model)
	}
	if fg.calls != 0 {
		t.Errorf("generator calls = %d, want 0 on a cache hit", fg.calls)
	}
	if fs.usageLogs != 0 {
		t.Errorf("usage logs = %d, want 0 on a cache hit", fs.usageLogs)
	}
}

func TestInsightsRejectsInvalidPeriod(t *testing.T) {
	h := NewInsightsHandler(&insightsFakeStore{}, &fakeInsightGenerator{})
	rec := httptest.NewRecorder()
	h.Generate(rec, insightsRequest(`{"period":"last-quarter"}`))

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", rec.Code)
	}
	if env := decodeInsightsEnvelope(t, rec); env.Error.Code != "INVALID_PERIOD" {
		t.Errorf("error code = %q, want INVALID_PERIOD", env.Error.Code)
	}
}

func TestInsightsRejectsLongQuestion(t *testing.T) {
	h := NewInsightsHandler(&insightsFakeStore{}, &fakeInsightGenerator{})
	body := fmt.Sprintf(`{"question":%q}`, strings.Repeat("a", 501))
	rec := httptest.NewRecorder()
	h.Generate(rec, insightsRequest(body))

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", rec.Code)
	}
}

func TestInsightsRequiresAuthentication(t *testing.T) {
	h := NewInsightsHandler(&insightsFakeStore{}, &fakeInsightGenerator{})
	req := httptest.NewRequest(http.MethodPost, "/admin/ai/insights", strings.NewReader(`{}`))
	rec := httptest.NewRecorder()
	h.Generate(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want 401", rec.Code)
	}
}

func TestInsightsUpstreamFailureMapsTo502(t *testing.T) {
	fs := &insightsFakeStore{}
	fg := &fakeInsightGenerator{err: fmt.Errorf("%w: provider down", enricher.ErrAIUpstream)}
	h := NewInsightsHandler(fs, fg)

	rec := httptest.NewRecorder()
	h.Generate(rec, insightsRequest(`{"period":"week"}`))

	if rec.Code != http.StatusBadGateway {
		t.Fatalf("status = %d, want 502 (body=%s)", rec.Code, rec.Body.String())
	}
	if got := rec.Header().Get("Retry-After"); got != "30" {
		t.Errorf("Retry-After = %q, want 30", got)
	}
	env := decodeInsightsEnvelope(t, rec)
	if env.Error.Code != "ADMIN_INSIGHTS_FAILED" || env.Error.Details != "upstream_error" {
		t.Errorf("unexpected error payload: %+v", env.Error)
	}
	if fs.upsertCalls != 0 {
		t.Error("failed generation must not be cached")
	}
	if fs.usageLogs != 1 {
		t.Errorf("failed generation should still be logged for AI budget visibility (logs=%d)", fs.usageLogs)
	}
}

func TestInsightsSnapshotFailureIsServerError(t *testing.T) {
	fs := &insightsFakeStore{snapshotErr: errors.New("db down")}
	fg := &fakeInsightGenerator{}
	h := NewInsightsHandler(fs, fg)

	rec := httptest.NewRecorder()
	h.Generate(rec, insightsRequest(`{"period":"today"}`))

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want 500", rec.Code)
	}
	if fg.calls != 0 {
		t.Error("generator must not run when the snapshot failed")
	}
}

func TestInsightWindow(t *testing.T) {
	now := time.Date(2026, 11, 23, 15, 30, 0, 0, time.UTC)
	today := time.Date(2026, 11, 23, 0, 0, 0, 0, time.UTC)

	cases := []struct {
		period     string
		wantStart  time.Time
		wantEnd    time.Time
		wantValid  bool
	}{
		{"today", today, now, true},
		{"yesterday", today.AddDate(0, 0, -1), today, true},
		{"week", now.AddDate(0, 0, -7), now, true},
		{"month", now.AddDate(0, 0, -30), now, true},
		{"all", time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC), now, true},
		{"quarter", time.Time{}, time.Time{}, false},
	}

	for _, tc := range cases {
		start, end, ok := insightWindow(tc.period, now)
		if ok != tc.wantValid {
			t.Fatalf("%s: valid = %v, want %v", tc.period, ok, tc.wantValid)
		}
		if !ok {
			continue
		}
		if !start.Equal(tc.wantStart) || !end.Equal(tc.wantEnd) {
			t.Errorf("%s: window = %s..%s, want %s..%s", tc.period, start, end, tc.wantStart, tc.wantEnd)
		}
	}
}

func TestHashInsightQuestionNormalisesCaseAndSpace(t *testing.T) {
	a := hashInsightQuestion("today", "How was today?", "")
	b := hashInsightQuestion("today", "  how was today?  ", "")
	if a != b {
		t.Errorf("hash should ignore case and surrounding whitespace: %s != %s", a, b)
	}
	if a == hashInsightQuestion("week", "How was today?", "") {
		t.Error("hash must include the period")
	}
	if a == hashInsightQuestion("today", "How was today?", "user-1") {
		t.Error("hash must include the subject, so platform and student answers never collide")
	}
}
