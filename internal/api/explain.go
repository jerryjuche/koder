package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jerryjuche/koder/internal/enricher"
	"github.com/jerryjuche/koder/internal/store"
)

// Explainer generates AI code explanations. Defined as an interface so handler
// tests can substitute a fake without a live NVIDIA NIM call. The Stream
// variants forward deltas to onDelta as they are generated; returning an error
// from onDelta (e.g. a broken client connection) aborts the provider stream.
type Explainer interface {
	ExplainSolution(ctx context.Context, req *enricher.ExplainSolutionRequest) (*store.SolutionExplanation, error)
	ExplainChat(ctx context.Context, req *enricher.ExplainChatRequest) (string, error)
	ExplainSolutionStream(ctx context.Context, req *enricher.ExplainSolutionRequest, onDelta func(string) error) (*store.SolutionExplanation, error)
	ExplainChatStream(ctx context.Context, req *enricher.ExplainChatRequest, onDelta func(string) error) (string, error)
}

// errStreamWrite signals a write failure to an already-connected client. It is
// returned by the delta sink when the client disconnects mid-stream, so the
// handler stops silently instead of attempting to write an error frame.
var errStreamWrite = errors.New("stream write failed")

// ExplainHandler serves POST /ai/explain and POST /ai/explain/chat — structured
// AI analysis of Best Practices solutions with a server-side dedupe cache so a
// given solution is billed to the AI at most once.
type ExplainHandler struct {
	store    store.Store
	explainer Explainer
}

// NewExplainHandler creates a new ExplainHandler.
func NewExplainHandler(s store.Store, e Explainer) *ExplainHandler {
	return &ExplainHandler{store: s, explainer: e}
}

type explainRequest struct {
	SubmissionID string `json:"submission_id"`
}

type explainResponse struct {
	Cached      bool                       `json:"cached"`
	Explanation *store.SolutionExplanation `json:"explanation"`
}

// SSE frame payloads. The client discriminates frames by which key is present:
// a "delta" frame carries the next chunk of generated text; an "explanation"
// frame carries the final validated analysis (cache miss); an "error" frame
// reports a mid-stream failure after headers were already sent.
type sseDeltaFrame struct {
	Delta string `json:"delta"`
}

type sseExplanationFrame struct {
	Cached      bool                       `json:"cached"`
	Explanation *store.SolutionExplanation `json:"explanation"`
}

type sseErrorFrame struct {
	Error struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

func setStreamHeaders(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "text/event-stream; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
}

// writeSSEFrame marshals v and writes it as a single "data:" SSE frame, then
// flushes so the client receives it immediately.
func writeSSEFrame(w http.ResponseWriter, flusher http.Flusher, v any) error {
	payload, err := json.Marshal(v)
	if err != nil {
		return err
	}
	if _, err := fmt.Fprintf(w, "data: %s\n\n", payload); err != nil {
		return err
	}
	flusher.Flush()
	return nil
}

// sseErrorFrameFrom builds a mid-stream error frame with a stable machine code
// and a human-friendly message (no internal error strings leak to the client).
func sseErrorFrameFrom(code, message string) sseErrorFrame {
	var f sseErrorFrame
	f.Error.Code = code
	f.Error.Message = message
	return f
}

// Explain handles POST /ai/explain.
func (h *ExplainHandler) Explain(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}
	userUUID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID", nil)
		return
	}

	var req explainRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}
	if strings.TrimSpace(req.SubmissionID) == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "submission_id is required", nil)
		return
	}
	submissionUUID, err := uuid.Parse(req.SubmissionID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_SUBMISSION_ID", "Invalid submission ID", nil)
		return
	}

	// Authorization: only passed submissions on visible problems are explainable.
	sol, err := h.store.GetSolutionForExplain(r.Context(), submissionUUID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "FETCH_ERROR", "Failed to load solution", nil)
		return
	}
	if sol == nil {
		RespondError(w, http.StatusNotFound, "SOLUTION_NOT_FOUND", "Solution not found or not eligible for analysis", nil)
		return
	}

	// Cache hit → instant, zero AI cost.
	cached, err := h.store.GetSolutionExplanation(r.Context(), submissionUUID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "CACHE_ERROR", "Failed to read cached explanation", nil)
		return
	}
	if cached != nil {
		RespondSuccess(w, explainResponse{Cached: true, Explanation: cached})
		return
	}

	start := time.Now()
	solReq := &enricher.ExplainSolutionRequest{
		Code:               sol.Code,
		Language:           sol.Language,
		ProblemTitle:       sol.ProblemTitle,
		ProblemSlug:        sol.ProblemSlug,
		ProblemStatement:   sol.ProblemStatement,
		ProblemConstraints: sol.ProblemConstraints,
		Module:             sol.Module,
		RuntimeMs:          sol.RuntimeMs,
	}
	tokensIn := len(sol.Code)/4 + 10

	flusher, ok := w.(http.Flusher)
	if !ok {
		// No streaming support — fall back to the buffered path so the endpoint
		// still works on any server.
		exp, err := h.explainer.ExplainSolution(r.Context(), solReq)
		duration := time.Since(start)
		if err != nil {
			h.logUsage(r.Context(), userUUID, "explain_solution", sol.ProblemSlug, tokensIn, 5, duration, false, err.Error())
			slog.Warn("explain: ai generation failed", "submission_id", submissionUUID, "error", err)
			h.respondExplainError(w, r, err, "EXPLAIN_FAILED", "The AI could not analyze this solution. Please try again.")
			return
		}
		exp.SubmissionID = pgtype.UUID{Bytes: submissionUUID, Valid: true}
		exp.Language = sol.Language
		exp.CreatedAt = time.Now()
		if err := h.store.UpsertSolutionExplanation(r.Context(), exp); err != nil {
			slog.Warn("explain: failed to cache explanation", "submission_id", submissionUUID, "error", err)
		}
		tokensOut := (len(exp.Summary)+len(exp.Approach)+len(exp.TimeComplexity)+len(exp.SpaceComplexity))/4 + 5
		h.logUsage(r.Context(), userUUID, "explain_solution", sol.ProblemSlug, tokensIn, tokensOut, duration, true, "")
		RespondSuccess(w, explainResponse{Cached: false, Explanation: exp})
		return
	}

	// Stream the analysis as Server-Sent Events. The client progressively
	// hydrates the panel from "delta" frames and applies the final validated
	// "explanation" frame when generation completes.
	setStreamHeaders(w)
	exp, err := h.explainer.ExplainSolutionStream(r.Context(), solReq, func(delta string) error {
		select {
		case <-r.Context().Done():
			return r.Context().Err()
		default:
		}
		if writeErr := writeSSEFrame(w, flusher, sseDeltaFrame{Delta: delta}); writeErr != nil {
			return errStreamWrite
		}
		return nil
	})
	duration := time.Since(start)
	if err != nil {
		h.logUsage(r.Context(), userUUID, "explain_solution", sol.ProblemSlug, tokensIn, 5, duration, false, err.Error())
		slog.Warn("explain: ai generation failed", "submission_id", submissionUUID, "error", err)
		if errors.Is(err, errStreamWrite) || errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
			return // client disconnected; headers already sent
		}
		_ = writeSSEFrame(w, flusher, sseErrorFrameFrom("EXPLAIN_FAILED", "The AI could not analyze this solution. Please try again."))
		return
	}

	exp.SubmissionID = pgtype.UUID{Bytes: submissionUUID, Valid: true}
	exp.Language = sol.Language
	exp.CreatedAt = time.Now()

	// Persist for dedupe. A failure here is non-fatal: the explanation is still
	// returned, it just won't be cached for the next viewer.
	if err := h.store.UpsertSolutionExplanation(r.Context(), exp); err != nil {
		slog.Warn("explain: failed to cache explanation", "submission_id", submissionUUID, "error", err)
	}

	tokensOut := (len(exp.Summary)+len(exp.Approach)+len(exp.TimeComplexity)+len(exp.SpaceComplexity))/4 + 5
	h.logUsage(r.Context(), userUUID, "explain_solution", sol.ProblemSlug, tokensIn, tokensOut, duration, true, "")

	if err := writeSSEFrame(w, flusher, sseExplanationFrame{Cached: false, Explanation: exp}); err != nil {
		return
	}
	fmt.Fprint(w, "data: [DONE]\n\n")
	flusher.Flush()
}

type explainChatRequest struct {
	SubmissionID string `json:"submission_id"`
	Question     string `json:"question"`
}

type explainChatResponse struct {
	Answer string `json:"answer"`
}

// ExplainChat handles POST /ai/explain/chat — a follow-up question grounded in
// the cached structured explanation. Chat answers are ephemeral (not cached).
func (h *ExplainHandler) ExplainChat(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}
	userUUID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID", nil)
		return
	}

	var req explainChatRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
		return
	}
	if strings.TrimSpace(req.SubmissionID) == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "submission_id is required", nil)
		return
	}
	if strings.TrimSpace(req.Question) == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "question is required", nil)
		return
	}
	submissionUUID, err := uuid.Parse(req.SubmissionID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_SUBMISSION_ID", "Invalid submission ID", nil)
		return
	}

	sol, err := h.store.GetSolutionForExplain(r.Context(), submissionUUID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "FETCH_ERROR", "Failed to load solution", nil)
		return
	}
	if sol == nil {
		RespondError(w, http.StatusNotFound, "SOLUTION_NOT_FOUND", "Solution not found or not eligible for analysis", nil)
		return
	}

	// The cached structured explanation grounds the chat when available.
	exp, err := h.store.GetSolutionExplanation(r.Context(), submissionUUID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "CACHE_ERROR", "Failed to read cached explanation", nil)
		return
	}

	start := time.Now()
	chatReq := &enricher.ExplainChatRequest{
		Code:        sol.Code,
		Language:    sol.Language,
		Question:    req.Question,
		Explanation: exp,
	}
	tokensIn := (len(sol.Code)+len(req.Question))/4 + 10

	flusher, ok := w.(http.Flusher)
	if !ok {
		// No streaming support — buffered fallback.
		answer, err := h.explainer.ExplainChat(r.Context(), chatReq)
		duration := time.Since(start)
		if err != nil {
			h.logUsage(r.Context(), userUUID, "explain_chat", sol.ProblemSlug, tokensIn, 5, duration, false, err.Error())
			slog.Warn("explain: chat generation failed", "submission_id", submissionUUID, "error", err)
			h.respondExplainError(w, r, err, "EXPLAIN_CHAT_FAILED", "The AI could not answer. Please try again.")
			return
		}
		tokensOut := len(answer)/4 + 5
		h.logUsage(r.Context(), userUUID, "explain_chat", sol.ProblemSlug, tokensIn, tokensOut, duration, true, "")
		RespondSuccess(w, explainChatResponse{Answer: answer})
		return
	}

	// Stream the answer as Server-Sent Events so tokens render as they arrive.
	setStreamHeaders(w)
	answer, err := h.explainer.ExplainChatStream(r.Context(), chatReq, func(delta string) error {
		select {
		case <-r.Context().Done():
			return r.Context().Err()
		default:
		}
		if writeErr := writeSSEFrame(w, flusher, sseDeltaFrame{Delta: delta}); writeErr != nil {
			return errStreamWrite
		}
		return nil
	})
	duration := time.Since(start)
	if err != nil {
		h.logUsage(r.Context(), userUUID, "explain_chat", sol.ProblemSlug, tokensIn, 5, duration, false, err.Error())
		slog.Warn("explain: chat generation failed", "submission_id", submissionUUID, "error", err)
		if errors.Is(err, errStreamWrite) || errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
			return // client disconnected; headers already sent
		}
		_ = writeSSEFrame(w, flusher, sseErrorFrameFrom("EXPLAIN_CHAT_FAILED", "The AI could not answer. Please try again."))
		return
	}

	tokensOut := len(answer)/4 + 5
	h.logUsage(r.Context(), userUUID, "explain_chat", sol.ProblemSlug, tokensIn, tokensOut, duration, true, "")

	fmt.Fprint(w, "data: [DONE]\n\n")
	flusher.Flush()
}

// logUsage records AI usage with a best-effort write (failures only warn).
func (h *ExplainHandler) logUsage(ctx context.Context, userID uuid.UUID, action, slug string, tokensIn, tokensOut int, duration time.Duration, success bool, errMsg string) {
	if err := h.store.LogAIUsage(ctx, userID, action, slug, tokensIn, tokensOut, int(duration.Milliseconds()), success, errMsg); err != nil {
		slog.Warn("explain: failed to log ai usage", "action", action, "error", err)
	}
}

// respondExplainError classifies an explainer failure and returns a 502 with a
// machine-readable "details" hint so operators can diagnose the root cause
// (upstream provider vs. a malformed AI response vs. missing fields) directly
// from the browser. Upstream failures carry Retry-After so the client can back
// off and retry instead of hammering a degraded provider.
func (h *ExplainHandler) respondExplainError(w http.ResponseWriter, r *http.Request, err error, code, message string) {
	var details string
	switch {
	case errors.Is(err, enricher.ErrAIValidation):
		details = "validation_error"
	case errors.Is(err, enricher.ErrAIInvalidResponse):
		details = "invalid_response"
	case errors.Is(err, enricher.ErrAIUpstream):
		details = "upstream_error"
	default:
		details = "unknown_error"
	}

	if details == "upstream_error" {
		w.Header().Set("Retry-After", "30")
	}

	slog.Warn("explain: responding failure",
		"path", r.URL.Path,
		"code", code,
		"details", details,
		"error", err,
	)

	RespondError(w, http.StatusBadGateway, code, message, details)
}
