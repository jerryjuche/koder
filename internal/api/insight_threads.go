package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"sync"
	"time"
	"unicode/utf8"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/enricher"
	"github.com/jerryjuche/koder/internal/store"
)

// ── Admin analyst conversations ────────────────────────────────────────────
//
// Threads persist so an investigation survives a refresh and a second admin
// login. Each turn follows the same grounded flow:
//
//  1. load the thread (owner-scoped) and its recent history
//  2. compute the SQL snapshot and, if the question names someone, one
//     student's profile
//  3. stream the model's narrative as SSE deltas
//  4. persist the user turn and the assistant turn (narrative + report +
//     snapshot) so reopening the thread shows the numbers behind the prose
//
// Nothing is persisted until generation succeeds, so a failed turn never leaves
// an unanswered question in the transcript.

type insightMessageRequest struct {
	Question  string `json:"question"`
	Period    string `json:"period"`
	SubjectID string `json:"subject_id"`
}

// insightTurnResponse is both the non-streaming JSON body and the final SSE
// frame payload.
type insightTurnResponse struct {
	ThreadID      string                  `json:"thread_id"`
	UserMessageID string                  `json:"user_message_id"`
	MessageID     string                  `json:"message_id"`
	Report        *enricher.InsightReport `json:"report"`
	Snapshot      *store.InsightsSnapshot `json:"snapshot"`
	Subject       *store.StudentInsight   `json:"subject,omitempty"`
	Cached        bool                    `json:"cached"`
	Model         string                  `json:"model,omitempty"`
	GeneratedAt   time.Time               `json:"generated_at"`
}

func (h *InsightsHandler) ListThreads(w http.ResponseWriter, r *http.Request) {
	adminID, ok := h.adminID(w, r)
	if !ok {
		return
	}
	threads, err := h.store.ListInsightThreads(r.Context(), adminID, 40)
	if err != nil {
		slog.Error("insights: list threads failed", "error", err)
		RespondError(w, http.StatusInternalServerError, "THREADS_FAILED", "Failed to load conversations", nil)
		return
	}
	if threads == nil {
		threads = []store.InsightThread{}
	}
	RespondSuccess(w, threads)
}

func (h *InsightsHandler) CreateThread(w http.ResponseWriter, r *http.Request) {
	adminID, ok := h.adminID(w, r)
	if !ok {
		return
	}
	var req struct {
		Title  string `json:"title"`
		Period string `json:"period"`
	}
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}
	period := strings.ToLower(strings.TrimSpace(req.Period))
	if period == "" {
		period = "today"
	}
	if _, _, ok := insightWindow(period, h.now()); !ok {
		RespondError(w, http.StatusBadRequest, "INVALID_PERIOD",
			"period must be one of: today, yesterday, week, month, all", nil)
		return
	}
	title := strings.TrimSpace(req.Title)
	if utf8.RuneCountInString(title) > 120 {
		title = truncateRunes(title, 120)
	}

	thread, err := h.store.CreateInsightThread(r.Context(), adminID, title, period)
	if err != nil {
		slog.Error("insights: create thread failed", "error", err)
		RespondError(w, http.StatusInternalServerError, "THREAD_CREATE_FAILED", "Failed to start a conversation", nil)
		return
	}
	RespondSuccess(w, thread)
}

func (h *InsightsHandler) GetThread(w http.ResponseWriter, r *http.Request) {
	adminID, ok := h.adminID(w, r)
	if !ok {
		return
	}
	threadID, ok := h.threadID(w, r)
	if !ok {
		return
	}

	thread, err := h.store.GetInsightThread(r.Context(), adminID, threadID)
	if err != nil {
		slog.Error("insights: get thread failed", "error", err)
		RespondError(w, http.StatusInternalServerError, "THREADS_FAILED", "Failed to load the conversation", nil)
		return
	}
	if thread == nil {
		RespondError(w, http.StatusNotFound, "THREAD_NOT_FOUND", "Conversation not found", nil)
		return
	}

	messages, err := h.store.ListInsightMessages(r.Context(), threadID, 40)
	if err != nil {
		slog.Error("insights: list messages failed", "error", err)
		RespondError(w, http.StatusInternalServerError, "THREADS_FAILED", "Failed to load the conversation", nil)
		return
	}
	if messages == nil {
		messages = []store.InsightMessage{}
	}
	RespondSuccess(w, map[string]any{"thread": thread, "messages": messages})
}

func (h *InsightsHandler) UpdateThread(w http.ResponseWriter, r *http.Request) {
	adminID, ok := h.adminID(w, r)
	if !ok {
		return
	}
	threadID, ok := h.threadID(w, r)
	if !ok {
		return
	}
	var req struct {
		Title  string `json:"title"`
		Period string `json:"period"`
	}
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}
	period := strings.ToLower(strings.TrimSpace(req.Period))
	if period != "" {
		if _, _, valid := insightWindow(period, h.now()); !valid {
			RespondError(w, http.StatusBadRequest, "INVALID_PERIOD",
				"period must be one of: today, yesterday, week, month, all", nil)
			return
		}
	}
	title := truncateRunes(strings.TrimSpace(req.Title), 120)
	if title == "" && period == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "title or period is required", nil)
		return
	}

	thread, err := h.store.UpdateInsightThread(r.Context(), adminID, threadID, title, period)
	if err != nil {
		slog.Error("insights: update thread failed", "error", err)
		RespondError(w, http.StatusInternalServerError, "THREADS_FAILED", "Failed to update the conversation", nil)
		return
	}
	if thread == nil {
		RespondError(w, http.StatusNotFound, "THREAD_NOT_FOUND", "Conversation not found", nil)
		return
	}
	RespondSuccess(w, thread)
}

func (h *InsightsHandler) DeleteThread(w http.ResponseWriter, r *http.Request) {
	adminID, ok := h.adminID(w, r)
	if !ok {
		return
	}
	threadID, ok := h.threadID(w, r)
	if !ok {
		return
	}
	err := h.store.DeleteInsightThread(r.Context(), adminID, threadID)
	if err != nil {
		if errors.Is(err, store.ErrInsightThreadNotFound) {
			RespondError(w, http.StatusNotFound, "THREAD_NOT_FOUND", "Conversation not found", nil)
			return
		}
		slog.Error("insights: delete thread failed", "error", err)
		RespondError(w, http.StatusInternalServerError, "THREADS_FAILED", "Failed to delete the conversation", nil)
		return
	}
	RespondSuccess(w, map[string]string{"status": "deleted"})
}

// PostMessage handles POST /admin/ai/threads/{id}/messages and streams the turn.
func (h *InsightsHandler) PostMessage(w http.ResponseWriter, r *http.Request) {
	adminID, ok := h.adminID(w, r)
	if !ok {
		return
	}
	threadID, ok := h.threadID(w, r)
	if !ok {
		return
	}

	var req insightMessageRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}

	question := strings.TrimSpace(req.Question)
	if question == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "question is required", nil)
		return
	}
	if utf8.RuneCountInString(question) > 500 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "question must be 500 characters or fewer", nil)
		return
	}

	thread, err := h.store.GetInsightThread(r.Context(), adminID, threadID)
	if err != nil {
		slog.Error("insights: get thread failed", "error", err)
		RespondError(w, http.StatusInternalServerError, "THREADS_FAILED", "Failed to load the conversation", nil)
		return
	}
	if thread == nil {
		RespondError(w, http.StatusNotFound, "THREAD_NOT_FOUND", "Conversation not found", nil)
		return
	}

	period := strings.ToLower(strings.TrimSpace(req.Period))
	if period == "" {
		period = thread.Period
	}
	windowStart, windowEnd, valid := insightWindow(period, h.now())
	if !valid {
		RespondError(w, http.StatusBadRequest, "INVALID_PERIOD",
			"period must be one of: today, yesterday, week, month, all", nil)
		return
	}

	// History is read before the new turn is stored, so the model sees earlier
	// turns only and the current question is passed separately.
	messages, err := h.store.ListInsightMessages(r.Context(), threadID, 20)
	if err != nil {
		slog.Warn("insights: could not load history, continuing without it", "error", err)
	}
	history := toInsightTurns(store.InsightHistory(messages, 8))

	// Snapshot first: a database failure is not an AI failure.
	snapshot, err := h.store.GetInsightsSnapshot(r.Context(), period, windowStart, windowEnd)
	if err != nil {
		slog.Error("insights: failed to build snapshot", "thread", threadID, "error", err)
		RespondError(w, http.StatusInternalServerError, "SNAPSHOT_FAILED", "Failed to read platform metrics", nil)
		return
	}

	// Subject: an explicit click in the UI wins over a name mention.
	subject, err := h.resolveSubject(r.Context(), req.SubjectID, question, windowStart, windowEnd)
	if err != nil {
		slog.Error("insights: failed to load student profile", "error", err)
		RespondError(w, http.StatusInternalServerError, "SNAPSHOT_FAILED", "Failed to read the student profile", nil)
		return
	}

	// Rename a fresh thread from its first question and keep the period in sync.
	title := ""
	if thread.Title == "" || thread.Title == "New conversation" {
		title = deriveThreadTitle(question)
	}
	if updated, err := h.store.UpdateInsightThread(r.Context(), adminID, threadID, title, period); err != nil {
		slog.Warn("insights: could not update thread metadata", "error", err)
	} else if updated != nil {
		thread = updated
	}

	genReq := &enricher.AdminInsightsRequest{
		Question: question,
		Period:   period,
		Snapshot: snapshot,
		History:  history,
		Subject:  subject,
	}

	// First-turn answers are cacheable; follow-ups depend on context, so caching
	// them by question text alone would return a reply to a different thread.
	subjectKey := ""
	if subject != nil {
		subjectKey = subject.UserID
	}
	cacheable := len(history) == 0 && subject == nil
	questionHash := hashInsightQuestion(period, question, subjectKey)

	start := time.Now()
	cached := false
	var result *enricher.AdminInsightsResponse
	if cacheable {
		if hit, ok := h.loadCachedReport(r.Context(), period, questionHash); ok {
			cached = true
			result = &enricher.AdminInsightsResponse{
				Report:      hit.Report,
				Model:       hit.Model,
				GeneratedAt: hit.GeneratedAt,
			}
			snapshot = hit.Snapshot
		}
	}

	flusher, canStream := w.(http.Flusher)
	var stream *sseStream
	if cached {
		// No generation required — fall through to persistence and framing.
	} else if canStream {
		setStreamHeaders(w)
		stream = newSSEStream(w, flusher)
		stream.startKeepAlive(15 * time.Second)
		defer stream.close()
		stream.comment("analyst connected")
		result, err = h.generator.GenerateInsightsStream(r.Context(), genReq, func(delta string) error {
			select {
			case <-r.Context().Done():
				return r.Context().Err()
			default:
			}
			if writeErr := stream.frame(sseDeltaFrame{Delta: delta}); writeErr != nil {
				return errStreamWrite
			}
			return nil
		})
	} else {
		result, err = h.generator.GenerateInsights(r.Context(), genReq)
	}

	duration := time.Since(start)
	tokensIn := len(question)/4 + len(history)*300 + 900
	tokensOut := 5
	if err == nil && result != nil && result.Report != nil {
		tokensOut = len(result.Report.Summary)/4 + len(result.Report.Highlights)*8
	}
	if logErr := h.store.LogAIUsage(r.Context(), adminID, "admin_insights", "", tokensIn, tokensOut, int(duration.Milliseconds()), err == nil, errorText(err)); logErr != nil {
		slog.Warn("insights: failed to log ai usage", "error", logErr)
	}

	if err == nil && (result == nil || result.Report == nil) {
		err = fmt.Errorf("%w: model returned no report", enricher.ErrAIValidation)
	}

	if err != nil {
		slog.Warn("insights: conversational turn failed", "thread", threadID, "error", err)
		if !canStream || cached {
			respondAIError(w, r, err, "ADMIN_INSIGHTS_FAILED", "The AI could not answer that. Please try again.")
			return
		}
		if errors.Is(err, errStreamWrite) || errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
			return // client disconnected; headers are already sent
		}
		_ = stream.frame(sseErrorFrameFrom("ADMIN_INSIGHTS_FAILED", "The AI could not answer that. Please try again."))
		return
	}

	// Persist both turns only after a successful answer.
	userMsg, err := h.store.AppendInsightMessage(r.Context(), &store.NewInsightMessage{
		ThreadID: threadID.String(),
		Role:     "user",
		Content:  question,
	})
	if err != nil {
		slog.Warn("insights: failed to store user turn", "error", err)
	}
	reportJSON, _ := json.Marshal(result.Report)
	snapshotJSON, _ := json.Marshal(snapshot)
	assistantMsg, err := h.store.AppendInsightMessage(r.Context(), &store.NewInsightMessage{
		ThreadID: threadID.String(),
		Role:     "assistant",
		Content:  result.Report.Summary,
		Report:   reportJSON,
		Snapshot: snapshotJSON,
		Model:    result.Model,
	})
	if err != nil {
		slog.Warn("insights: failed to store assistant turn", "error", err)
	}

	if cacheable && !cached {
		h.storeCachedReport(r.Context(), adminID, period, questionHash, question, result, snapshot)
	}

	resp := insightTurnResponse{
		ThreadID:    threadID.String(),
		Report:      result.Report,
		Snapshot:    snapshot,
		Subject:     subject,
		Cached:      cached,
		Model:       result.Model,
		GeneratedAt: result.GeneratedAt,
	}
	if userMsg != nil {
		resp.UserMessageID = userMsg.ID
	}
	if assistantMsg != nil {
		resp.MessageID = assistantMsg.ID
	}

	if !canStream || cached {
		RespondSuccess(w, resp)
		return
	}

	if err := stream.frame(resp); err != nil {
		return
	}
	if err := stream.raw("data: [DONE]\n\n"); err != nil {
		return
	}

	if logErr := h.store.LogActivity(r.Context(), "info",
		fmt.Sprintf("Admin AI analyst (%s) in %dms", period, duration.Milliseconds()),
		"text-brand-cool-accent", "BrainCircuit"); logErr != nil {
		slog.Warn("insights: failed to log activity", "error", logErr)
	}
}

// resolveSubject loads the student profile for an explicit id or a name
// mentioned in the question. A nil profile means "platform-wide answer".
func (h *InsightsHandler) resolveSubject(ctx context.Context, subjectID, question string, start, end time.Time) (*store.StudentInsight, error) {
	if strings.TrimSpace(subjectID) != "" {
		if id, err := uuid.Parse(strings.TrimSpace(subjectID)); err == nil {
			profile, err := h.store.GetStudentInsight(ctx, id, start, end)
			if err != nil {
				return nil, err
			}
			return profile, nil
		}
	}

	directory, err := h.store.ListStudentDirectory(ctx)
	if err != nil {
		return nil, err
	}
	match := resolveStudentMention(question, directory)
	if match == nil {
		return nil, nil
	}
	id, err := uuid.Parse(match.UserID)
	if err != nil {
		return nil, nil
	}
	return h.store.GetStudentInsight(ctx, id, start, end)
}

func (h *InsightsHandler) adminID(w http.ResponseWriter, r *http.Request) (uuid.UUID, bool) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return uuid.Nil, false
	}
	adminID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID", nil)
		return uuid.Nil, false
	}
	return adminID, true
}

func (h *InsightsHandler) threadID(w http.ResponseWriter, r *http.Request) (uuid.UUID, bool) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_THREAD_ID", "Invalid conversation id", nil)
		return uuid.Nil, false
	}
	return id, true
}

func toInsightTurns(in []store.InsightThreadHistory) []enricher.AdminInsightTurn {
	out := make([]enricher.AdminInsightTurn, 0, len(in))
	for _, t := range in {
		out = append(out, enricher.AdminInsightTurn{Role: t.Role, Content: t.Content})
	}
	return out
}

// deriveThreadTitle makes a readable sidebar label from the first question.
func deriveThreadTitle(question string) string {
	clean := strings.Join(strings.Fields(question), " ")
	clean = strings.TrimRight(clean, ".?!")
	if clean == "" {
		return "New conversation"
	}
	title := truncateRunes(clean, 60)
	if title == "" {
		return "New conversation"
	}
	// Capitalise the first letter for a tidy sidebar entry.
	runes := []rune(title)
	runes[0] = []rune(strings.ToUpper(string(runes[0])))[0]
	return string(runes)
}

func truncateRunes(s string, limit int) string {
	runes := []rune(s)
	if len(runes) <= limit {
		return s
	}
	return string(runes[:limit])
}

// ── SSE writer ─────────────────────────────────────────────────────────────

// sseStream serialises frames written by the request handler with the
// keep-alive comments a background ticker emits. Without the lock the two
// would interleave mid-frame and corrupt the stream.
type sseStream struct {
	mu      sync.Mutex
	w       http.ResponseWriter
	flusher http.Flusher
	ticker  *time.Ticker
	done    chan struct{}
	closed  bool
}

func newSSEStream(w http.ResponseWriter, flusher http.Flusher) *sseStream {
	return &sseStream{w: w, flusher: flusher}
}

// frame writes one data frame and flushes it.
func (s *sseStream) frame(v any) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.closed {
		return errStreamWrite
	}
	return writeSSEFrame(s.w, s.flusher, v)
}

// raw writes pre-formatted bytes, such as the terminal [DONE] sentinel.
func (s *sseStream) raw(payload string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.closed {
		return errStreamWrite
	}
	if _, err := fmt.Fprint(s.w, payload); err != nil {
		return err
	}
	s.flusher.Flush()
	return nil
}

// comment writes an SSE comment. Clients ignore it; intermediaries see bytes
// and keep a connection open while the model is still thinking.
func (s *sseStream) comment(text string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.closed {
		return
	}
	if _, err := fmt.Fprintf(s.w, ": %s\n\n", text); err == nil {
		s.flusher.Flush()
	}
}

// startKeepAlive emits a comment every interval until close is called.
func (s *sseStream) startKeepAlive(interval time.Duration) {
	s.mu.Lock()
	if s.closed || s.ticker != nil {
		s.mu.Unlock()
		return
	}
	s.ticker = time.NewTicker(interval)
	s.done = make(chan struct{})
	ticker, done := s.ticker, s.done
	s.mu.Unlock()

	go func() {
		for {
			select {
			case <-done:
				return
			case <-ticker.C:
				s.comment("keep-alive")
			}
		}
	}()
}

// close stops the keep-alive ticker and refuses later writes. It waits for any
// write in flight, so nothing touches the ResponseWriter after the handler
// returns.
func (s *sseStream) close() {
	s.mu.Lock()
	if s.closed {
		s.mu.Unlock()
		return
	}
	s.closed = true
	ticker, done := s.ticker, s.done
	s.ticker, s.done = nil, nil
	s.mu.Unlock()

	if done != nil {
		close(done)
	}
	if ticker != nil {
		ticker.Stop()
	}
}
