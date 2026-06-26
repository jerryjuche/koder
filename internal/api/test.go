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

// TestHandler handles test code execution requests (without submitting).
type TestHandler struct {
	store    store.Store
	executor *executor.Executor
}

// NewTestHandler creates a new TestHandler.
func NewTestHandler(store store.Store, executor *executor.Executor) *TestHandler {
	return &TestHandler{
		store:    store,
		executor: executor,
	}
}

// Test handles POST /test - test code against visible test cases without submitting.
func (h *TestHandler) Test(w http.ResponseWriter, r *http.Request) {
	// 1. Authenticate
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

	// 2. Parse request body
	var req struct {
		ProblemSlug string `json:"problem_slug"`
		Code        string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_REQUEST", "Invalid request body", err.Error())
		return
	}

	// 3. Validate code size
	if len(req.Code) > 50*1024 {
		RespondError(w, http.StatusBadRequest, "CODE_TOO_LARGE", "Code exceeds 50KB limit", "")
		return
	}

	// 4. Fetch problem by slug
	problem, err := h.store.GetProblemBySlug(r.Context(), req.ProblemSlug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			RespondError(w, http.StatusNotFound, "PROBLEM_NOT_FOUND", "Problem not found", "")
			return
		}
		RespondError(w, http.StatusInternalServerError, "FETCH_FAILED", "Failed to fetch problem", err.Error())
		return
	}

	// 5. Execute code against visible tests only
	execReq := executor.ExecutionRequest{
		UserID:    userID,
		ProblemID: uuid.UUID(problem.ID.Bytes),
		Code:      req.Code,
		Language:  problem.Language,
	}

	res, err := h.executor.ExecuteVisibleOnly(r.Context(), execReq)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "EXECUTION_FAILED", "Failed to test code", err.Error())
		return
	}

	// 6. Return results without database side effects
	RespondSuccess(w, res)
}
