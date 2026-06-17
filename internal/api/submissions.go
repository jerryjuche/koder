package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jerryjuche/koder/internal/executor"
	"github.com/jerryjuche/koder/internal/store"
)

type SubmissionHandler struct {
	store    store.Store
	executor *executor.Executor
}

func NewSubmissionHandler(store store.Store, exec *executor.Executor) *SubmissionHandler {
	return &SubmissionHandler{
		store:    store,
		executor: exec,
	}
}

type submitRequest struct {
	ProblemSlug string `json:"problem_slug"`
	Code        string `json:"code"`
}

// Submit handles students compiling and running their solution.
func (h *SubmissionHandler) Submit(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication claims are missing", nil)
		return
	}

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_INVALID", "Invalid user identifier in token", err.Error())
		return
	}

	var req submitRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", err.Error())
		return
	}

	if req.ProblemSlug == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "problem_slug is required", nil)
		return
	}

	if req.Code == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "code is required", nil)
		return
	}

	// Enforce 50KB code size limit (security & resource protection)
	if len(req.Code) > 50*1024 {
		RespondError(w, http.StatusRequestEntityTooLarge, "PAYLOAD_TOO_LARGE", "Code submission exceeds 50KB limit", nil)
		return
	}

	// Fetch the problem by slug
	problem, err := h.store.GetProblemBySlug(r.Context(), req.ProblemSlug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Problem not found or not visible", nil)
			return
		}
		RespondError(w, http.StatusInternalServerError, "PROBLEM_FETCH_FAILED", "Unable to get problem details", err.Error())
		return
	}

	// Execute grading flow
	execReq := executor.ExecutionRequest{
		UserID:    userID,
		ProblemID: uuid.UUID(problem.ID.Bytes),
		Code:      req.Code,
		Language:  problem.Language,
	}

	res, err := h.executor.Execute(r.Context(), execReq)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "EXECUTION_FAILED", "Failed to grade solution attempt", err.Error())
		return
	}

	if res.Status == "passed" {
		h.store.LogActivity(r.Context(), "success", fmt.Sprintf("User %s successfully solved '%s'", claims.StudentID, problem.Slug), "text-brand-success", "CheckCircle2")
	} else if res.Status == "timeout" {
		h.store.LogActivity(r.Context(), "warning", fmt.Sprintf("Problem '%s' execution timed out for %s", problem.Slug, claims.StudentID), "text-brand-muted-gold", "AlertCircle")
	}

	// Log to database
	sub := &store.Submission{
		UserID:      pgtype.UUID{Bytes: userID, Valid: true},
		ProblemID:   problem.ID,
		Language:    problem.Language,
		Code:        req.Code,
		Status:      res.Status,
		PassedCount: res.PassedCount,
		TotalCount:  res.TotalCount,
		RuntimeMs:   res.RuntimeMs,
	}
	_ = h.store.CreateSubmission(r.Context(), sub)

	prog := &store.Progress{
		UserID:      pgtype.UUID{Bytes: userID, Valid: true},
		ProblemID:   problem.ID,
		Solved:      res.Status == "passed",
		BestRuntime: res.RuntimeMs,
	}
	_ = h.store.UpsertProgress(r.Context(), prog)

	RespondSuccess(w, res)
}
