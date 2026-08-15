package api

import (
	"context"
	"encoding/json"
	"errors"
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
// tests can substitute a fake without a live NVIDIA NIM call.
type Explainer interface {
	ExplainSolution(ctx context.Context, req *enricher.ExplainSolutionRequest) (*store.SolutionExplanation, error)
	ExplainChat(ctx context.Context, req *enricher.ExplainChatRequest) (string, error)
}

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
	exp, err := h.explainer.ExplainSolution(r.Context(), &enricher.ExplainSolutionRequest{
		Code:               sol.Code,
		Language:           sol.Language,
		ProblemTitle:       sol.ProblemTitle,
		ProblemSlug:        sol.ProblemSlug,
		ProblemStatement:   sol.ProblemStatement,
		ProblemConstraints: sol.ProblemConstraints,
		Module:             sol.Module,
		RuntimeMs:          sol.RuntimeMs,
	})
	duration := time.Since(start)
	tokensIn := len(sol.Code)/4 + 10
	if err != nil {
		h.logUsage(r.Context(), userUUID, "explain_solution", sol.ProblemSlug, tokensIn, 5, duration, false, err.Error())
		slog.Warn("explain: ai generation failed", "submission_id", submissionUUID, "error", err)
		h.respondExplainError(w, r, err, "EXPLAIN_FAILED", "The AI could not analyze this solution. Please try again.")
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

	RespondSuccess(w, explainResponse{Cached: false, Explanation: exp})
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
	answer, err := h.explainer.ExplainChat(r.Context(), &enricher.ExplainChatRequest{
		Code:        sol.Code,
		Language:    sol.Language,
		Question:    req.Question,
		Explanation: exp,
	})
	duration := time.Since(start)
	tokensIn := (len(sol.Code)+len(req.Question))/4 + 10
	if err != nil {
		h.logUsage(r.Context(), userUUID, "explain_chat", sol.ProblemSlug, tokensIn, 5, duration, false, err.Error())
		slog.Warn("explain: chat generation failed", "submission_id", submissionUUID, "error", err)
		h.respondExplainError(w, r, err, "EXPLAIN_CHAT_FAILED", "The AI could not answer. Please try again.")
		return
	}

	tokensOut := len(answer)/4 + 5
	h.logUsage(r.Context(), userUUID, "explain_chat", sol.ProblemSlug, tokensIn, tokensOut, duration, true, "")

	RespondSuccess(w, explainChatResponse{Answer: answer})
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
