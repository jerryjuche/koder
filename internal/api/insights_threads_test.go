package api

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/enricher"
	"github.com/jerryjuche/koder/internal/store"
)

// threadFakeStore implements only the store methods the conversation handlers
// touch, mirroring the fake-store pattern used by the other API tests.
type threadFakeStore struct {
	*store.PostgresStore

	thread    *store.InsightThread
	messages  []store.InsightMessage
	appended  []*store.NewInsightMessage
	directory []store.InsightsStudentRef
	student   *store.StudentInsight

	studentLookups int
	deleted        bool
	createdPeriod  string
	updatedTitle   string
}

func (f *threadFakeStore) GetInsightsSnapshot(_ context.Context, period string, start, end time.Time) (*store.InsightsSnapshot, error) {
	return sampleInsightsSnapshot(period, start, end), nil
}

func (f *threadFakeStore) GetAdminInsightReport(_ context.Context, _, _ string, _ time.Time) ([]byte, []byte, string, time.Time, error) {
	return nil, nil, "", time.Time{}, nil
}

func (f *threadFakeStore) UpsertAdminInsightReport(_ context.Context, _ uuid.UUID, _, _, _, _ string, _, _ []byte) error {
	return nil
}

func (f *threadFakeStore) LogAIUsage(_ context.Context, _ uuid.UUID, _, _ string, _, _, _ int, _ bool, _ string) error {
	return nil
}

func (f *threadFakeStore) LogActivity(_ context.Context, _, _, _, _ string) error { return nil }

func (f *threadFakeStore) CreateInsightThread(_ context.Context, _ uuid.UUID, title, period string) (*store.InsightThread, error) {
	f.createdPeriod = period
	return &store.InsightThread{ID: uuid.NewString(), Title: title, Period: period}, nil
}

func (f *threadFakeStore) ListInsightThreads(_ context.Context, _ uuid.UUID, _ int) ([]store.InsightThread, error) {
	return []store.InsightThread{}, nil
}

func (f *threadFakeStore) GetInsightThread(_ context.Context, _, _ uuid.UUID) (*store.InsightThread, error) {
	return f.thread, nil
}

func (f *threadFakeStore) UpdateInsightThread(_ context.Context, _, _ uuid.UUID, title, period string) (*store.InsightThread, error) {
	f.updatedTitle = title
	if f.thread == nil {
		return nil, nil
	}
	if title != "" {
		f.thread.Title = title
	}
	if period != "" {
		f.thread.Period = period
	}
	return f.thread, nil
}

func (f *threadFakeStore) DeleteInsightThread(_ context.Context, _, _ uuid.UUID) error {
	if f.thread == nil {
		return store.ErrInsightThreadNotFound
	}
	f.deleted = true
	return nil
}

func (f *threadFakeStore) AppendInsightMessage(_ context.Context, msg *store.NewInsightMessage) (*store.InsightMessage, error) {
	f.appended = append(f.appended, msg)
	return &store.InsightMessage{
		ID:       uuid.NewString(),
		ThreadID: msg.ThreadID,
		Role:     msg.Role,
		Content:  msg.Content,
		Report:   msg.Report,
		Model:    msg.Model,
	}, nil
}

func (f *threadFakeStore) ListInsightMessages(_ context.Context, _ uuid.UUID, _ int) ([]store.InsightMessage, error) {
	return f.messages, nil
}

func (f *threadFakeStore) ListStudentDirectory(_ context.Context) ([]store.InsightsStudentRef, error) {
	return f.directory, nil
}

func (f *threadFakeStore) GetStudentInsight(_ context.Context, _ uuid.UUID, _ time.Time, _ time.Time) (*store.StudentInsight, error) {
	f.studentLookups++
	return f.student, nil
}

func newThread() *store.InsightThread {
	return &store.InsightThread{
		ID:     uuid.NewString(),
		Title:  "New conversation",
		Period: "today",
	}
}

func threadRequest(method, body, threadID string) *http.Request {
	req := httptest.NewRequest(method, "/admin/ai/threads/"+threadID+"/messages", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", threadID)
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	return withClaims(req, uuid.NewString())
}

func TestPostMessageStreamsPersistsAndKeepsHistory(t *testing.T) {
	thread := newThread()
	fs := &threadFakeStore{
		thread: thread,
		messages: []store.InsightMessage{
			{Role: "user", Content: "how was today?"},
			{Role: "assistant", Content: "Ten attempts, five passed."},
		},
	}
	fg := &fakeInsightGenerator{}
	h := NewInsightsHandler(fs, fg)

	rec := httptest.NewRecorder()
	h.PostMessage(rec, threadRequest(http.MethodPost, `{"question":"why?","period":"today"}`, thread.ID))

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200 (body=%s)", rec.Code, rec.Body.String())
	}
	if ct := rec.Header().Get("Content-Type"); !strings.HasPrefix(ct, "text/event-stream") {
		t.Fatalf("content-type = %q, want text/event-stream", ct)
	}
	body := rec.Body.String()
	if !strings.Contains(body, `"delta"`) {
		t.Errorf("stream carried no narrative delta: %s", body)
	}
	if !strings.Contains(body, `"report"`) || !strings.Contains(body, `"snapshot"`) {
		t.Errorf("final frame is missing the report or snapshot: %s", body)
	}
	if !strings.HasSuffix(body, "data: [DONE]\n\n") {
		t.Errorf("stream did not terminate with [DONE]")
	}

	// History must reach the model, and it must exclude the current question.
	if fg.last == nil || len(fg.last.History) != 2 {
		t.Fatalf("history passed to model = %+v, want 2 turns", fg.last)
	}
	if len(fs.appended) != 2 {
		t.Fatalf("persisted %d messages, want 2 (user + assistant)", len(fs.appended))
	}
	if fs.appended[0].Role != "user" || fs.appended[0].Content != "why?" {
		t.Errorf("user turn stored incorrectly: %+v", fs.appended[0])
	}
	if fs.appended[1].Role != "assistant" || len(fs.appended[1].Report) == 0 || len(fs.appended[1].Snapshot) == 0 {
		t.Errorf("assistant turn missing report/snapshot: %+v", fs.appended[1])
	}
	if thread.Title == "New conversation" {
		t.Errorf("thread was not renamed from the first question")
	}
}

func TestPostMessageResolvesNamedStudent(t *testing.T) {
	thread := newThread()
	studentID := uuid.NewString()
	fs := &threadFakeStore{
		thread: thread,
		directory: []store.InsightsStudentRef{
			{UserID: studentID, Name: "Aisha Bello", Username: "aisha_b"},
			{UserID: uuid.NewString(), Name: "Tunde Okafor", Username: "tunde"},
		},
		student: &store.StudentInsight{UserID: studentID, Name: "Aisha Bello", LifetimeXP: 4200, Level: 5},
	}
	fg := &fakeInsightGenerator{}
	h := NewInsightsHandler(fs, fg)

	rec := httptest.NewRecorder()
	h.PostMessage(rec, threadRequest(http.MethodPost, `{"question":"how is Aisha doing this week?","period":"week"}`, thread.ID))

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d (body=%s)", rec.Code, rec.Body.String())
	}
	if fg.last == nil || fg.last.Subject == nil {
		t.Fatalf("student profile was not attached to the request")
	}
	if fg.last.Subject.Name != "Aisha Bello" {
		t.Errorf("resolved the wrong student: %+v", fg.last.Subject)
	}
	if fs.studentLookups != 1 {
		t.Errorf("student lookups = %d, want 1", fs.studentLookups)
	}
	if !strings.Contains(rec.Body.String(), `"student"`) && !strings.Contains(rec.Body.String(), `"subject"`) {
		t.Errorf("final frame did not include the subject profile")
	}
}

func TestPostMessageRejectsForeignThread(t *testing.T) {
	fs := &threadFakeStore{} // GetInsightThread returns nil = not owned
	fg := &fakeInsightGenerator{}
	h := NewInsightsHandler(fs, fg)

	rec := httptest.NewRecorder()
	h.PostMessage(rec, threadRequest(http.MethodPost, `{"question":"hello"}`, uuid.NewString()))

	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404 (body=%s)", rec.Code, rec.Body.String())
	}
	if fg.calls != 0 {
		t.Errorf("model was called for a thread the admin does not own")
	}
}

func TestPostMessageRequiresQuestion(t *testing.T) {
	thread := newThread()
	h := NewInsightsHandler(&threadFakeStore{thread: thread}, &fakeInsightGenerator{})

	rec := httptest.NewRecorder()
	h.PostMessage(rec, threadRequest(http.MethodPost, `{"question":"   "}`, thread.ID))

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", rec.Code)
	}
}

func TestCreateThreadValidatesPeriod(t *testing.T) {
	h := NewInsightsHandler(&threadFakeStore{}, &fakeInsightGenerator{})
	req := httptest.NewRequest(http.MethodPost, "/admin/ai/threads", strings.NewReader(`{"period":"fortnight"}`))
	req = withClaims(req, uuid.NewString())

	rec := httptest.NewRecorder()
	h.CreateThread(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400 (body=%s)", rec.Code, rec.Body.String())
	}
}

func TestCreateThreadDefaultsToday(t *testing.T) {
	fs := &threadFakeStore{}
	h := NewInsightsHandler(fs, &fakeInsightGenerator{})
	req := httptest.NewRequest(http.MethodPost, "/admin/ai/threads", strings.NewReader(`{}`))
	req = withClaims(req, uuid.NewString())

	rec := httptest.NewRecorder()
	h.CreateThread(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200 (body=%s)", rec.Code, rec.Body.String())
	}
	if fs.createdPeriod != "today" {
		t.Errorf("period = %q, want today", fs.createdPeriod)
	}
}

func TestDeleteForeignThreadIsNotFound(t *testing.T) {
	h := NewInsightsHandler(&threadFakeStore{}, &fakeInsightGenerator{})
	rec := httptest.NewRecorder()
	h.DeleteThread(rec, threadRequest(http.MethodDelete, "", uuid.NewString()))
	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404 (body=%s)", rec.Code, rec.Body.String())
	}
}

func TestGetThreadReturnsMessages(t *testing.T) {
	thread := newThread()
	fs := &threadFakeStore{
		thread:   thread,
		messages: []store.InsightMessage{{ID: uuid.NewString(), Role: "user", Content: "how was today?"}},
	}
	h := NewInsightsHandler(fs, &fakeInsightGenerator{})

	rec := httptest.NewRecorder()
	h.GetThread(rec, threadRequest(http.MethodGet, "", thread.ID))
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d (body=%s)", rec.Code, rec.Body.String())
	}

	var env struct {
		Success bool `json:"success"`
		Data    struct {
			Thread   store.InsightThread    `json:"thread"`
			Messages []store.InsightMessage `json:"messages"`
		} `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &env); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if !env.Success || len(env.Data.Messages) != 1 || env.Data.Thread.ID != thread.ID {
		t.Errorf("unexpected payload: %s", rec.Body.String())
	}
}

func TestResolveStudentMention(t *testing.T) {
	dir := []store.InsightsStudentRef{
		{UserID: "1", Name: "Aisha Bello", Username: "aisha_b"},
		{UserID: "2", Name: "Aisha Mohammed", Username: "aisha_m"},
		{UserID: "3", Name: "Tunde Okafor", Username: "tunde"},
		{UserID: "4", Name: "Ada Lovelace", Username: "ada"},
		{UserID: "5", Name: "Bo Chen", Username: "bochen"},
	}

	tests := []struct {
		name     string
		question string
		wantID   string
	}{
		{"full name", "how is Aisha Bello doing?", "1"},
		{"username", "check @tunde progress", "3"},
		{"case insensitive", "What about TUNDE OKAFOR?", "3"},
		{"ambiguous first name", "how is Aisha doing?", ""},
		{"unique first name", "is Ada stuck on recursion?", "4"},
		{"no mention", "how was today?", ""},
		{"two-letter name is too weak a signal", "is Bo ok?", ""},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := resolveStudentMention(tc.question, dir)
			gotID := ""
			if got != nil {
				gotID = got.UserID
			}
			if gotID != tc.wantID {
				t.Errorf("resolved %q to %q, want %q", tc.question, gotID, tc.wantID)
			}
		})
	}
}

func TestDeriveThreadTitle(t *testing.T) {
	if got := deriveThreadTitle("  how was   today?  "); got != "How was today" {
		t.Errorf("title = %q", got)
	}
	long := strings.Repeat("a", 120)
	if got := deriveThreadTitle(long); len([]rune(got)) != 60 {
		t.Errorf("long title length = %d, want 60", len([]rune(got)))
	}
}

// The streamed narrative must be the same text the final report carries.
func TestStreamedNarrativeMatchesReport(t *testing.T) {
	thread := newThread()
	fs := &threadFakeStore{thread: thread}
	report := &enricher.InsightReport{
		Headline: "Five of ten passed",
		Summary:  "## Today\n\n**5 of 10** attempts passed (50%).",
	}
	fg := &fakeInsightGenerator{report: report}
	h := NewInsightsHandler(fs, fg)

	rec := httptest.NewRecorder()
	h.PostMessage(rec, threadRequest(http.MethodPost, `{"question":"how was today?"}`, thread.ID))

	var streamed strings.Builder
	for _, line := range strings.Split(rec.Body.String(), "\n") {
		if !strings.HasPrefix(line, "data: ") {
			continue
		}
		payload := strings.TrimPrefix(line, "data: ")
		var frame struct {
			Delta string `json:"delta"`
		}
		if json.Unmarshal([]byte(payload), &frame) == nil && frame.Delta != "" {
			streamed.WriteString(frame.Delta)
		}
	}
	if streamed.String() != report.Summary {
		t.Errorf("streamed narrative = %q, want %q", streamed.String(), report.Summary)
	}
}
