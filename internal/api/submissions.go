package api

import (
	"encoding/json"
	"errors"
	"fmt"
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
	Language    string `json:"language,omitempty"`
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
		RespondError(w, http.StatusUnauthorized, "AUTH_INVALID", "Invalid user identifier in token", nil)
		return
	}

	var req submitRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Unable to parse request body", nil)
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
	problem, err := h.store.GetProblemBySlug(r.Context(), req.ProblemSlug, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Problem not found or not visible", nil)
			return
		}
		RespondError(w, http.StatusInternalServerError, "PROBLEM_FETCH_FAILED", "Unable to get problem details", nil)
		return
	}

	// Block resubmission if the user has already solved this problem
	if problem.Solved {
		RespondError(w, http.StatusConflict, "ALREADY_SOLVED", "You have already solved this problem. Submissions are disabled for completed problems.", nil)
		return
	}

	// Resolve and validate language
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

	// Execute grading flow
	execReq := executor.ExecutionRequest{
		UserID:    userID,
		ProblemID: uuid.UUID(problem.ID.Bytes),
		Code:      req.Code,
		Language:  language,
	}

	res, err := h.executor.Execute(r.Context(), execReq)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "EXECUTION_FAILED", "Failed to grade solution attempt", nil)
		return
	}

	if res.Status == "passed" {
		h.store.LogActivity(r.Context(), "success", fmt.Sprintf("User %s successfully solved '%s'", claims.StudentID, problem.Slug), "text-brand-success", "CheckCircle2")
		InvalidateUserCache(userID.String())
	} else if res.Status == "timeout" {
		h.store.LogActivity(r.Context(), "warning", fmt.Sprintf("Problem '%s' execution timed out for %s", problem.Slug, claims.StudentID), "text-brand-muted-gold", "AlertCircle")
	}

	RespondSuccess(w, res)
}
