package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
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
		RespondError(w, http.StatusUnauthorized, "AUTH_INVALID", "Invalid user identifier in token", nil)
		return
	}

	// 2. Parse request body
	var req struct {
		ProblemSlug string `json:"problem_slug"`
		Code        string `json:"code"`
		Language    string `json:"language,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_REQUEST", "Invalid request body", nil)
		return
	}

	// 3. Validate code size
	if len(req.Code) > 50*1024 {
		RespondError(w, http.StatusBadRequest, "CODE_TOO_LARGE", "Code exceeds 50KB limit", "")
		return
	}

	// 4. Fetch problem by slug
	problem, err := h.store.GetProblemBySlug(r.Context(), req.ProblemSlug, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			RespondError(w, http.StatusNotFound, "PROBLEM_NOT_FOUND", "Problem not found", "")
			return
		}
		RespondError(w, http.StatusInternalServerError, "FETCH_FAILED", "Failed to fetch problem", nil)
		return
	}

	// 5. Resolve and validate language
	language := req.Language
	if language == "" {
		language = problem.Language
	}
	if language == "" && len(problem.LanguageVersions) > 0 {
		if _, ok := problem.LanguageVersions["go"]; ok {
			language = "go"
		} else if _, ok := problem.LanguageVersions["python"]; ok {
			language = "python"
		} else {
			for lang := range problem.LanguageVersions {
				language = lang
				break
			}
		}
	}
	if language != "go" && language != "python" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Language must be 'go' or 'python'", nil)
		return
	}
	if _, supported := problem.LanguageVersions[language]; !supported && problem.LanguageVersions != nil {
		RespondError(w, http.StatusBadRequest, "LANGUAGE_NOT_SUPPORTED", "Problem does not support the requested language", nil)
		return
	}

	// 6. Execute code against visible tests only
	execReq := executor.ExecutionRequest{
		UserID:    userID,
		ProblemID: uuid.UUID(problem.ID.Bytes),
		Code:      req.Code,
		Language:  language,
	}

	res, err := h.executor.ExecuteVisibleOnly(r.Context(), execReq)
	if err != nil {
		slog.Error("executor: test execution failed", "error", err, "user_id", userID, "problem_id", req.ProblemSlug, "language", language)
		RespondError(w, http.StatusInternalServerError, "EXECUTION_FAILED", fmt.Sprintf("Failed to test code: %s", err.Error()), nil)
		return
	}

	// 6. Return results without database side effects
	RespondSuccess(w, res)
}
