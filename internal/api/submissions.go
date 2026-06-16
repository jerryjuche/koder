package api

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
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

	RespondSuccess(w, res)
}
