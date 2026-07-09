package api

import (
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jerryjuche/koder/internal/store"
)

type ProblemHandler struct {
	store store.Store
}

func NewProblemHandler(store store.Store) *ProblemHandler {
	return &ProblemHandler{store: store}
}

func (h *ProblemHandler) ListVisibleProblems(w http.ResponseWriter, r *http.Request) {
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

	problems, err := h.store.ListVisibleProblems(r.Context(), userID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "PROBLEM_LIST_FAILED", "Unable to list problems", nil)
		return
	}

	languageFilter := r.URL.Query().Get("language")
	if languageFilter != "" && languageFilter != "go" && languageFilter != "python" {
		languageFilter = ""
	}
	if languageFilter != "" {
		var filtered []store.Problem
		for _, p := range problems {
			if p.Language == languageFilter {
				filtered = append(filtered, p)
			} else if p.LanguageVersions != nil {
				if spec, ok := p.LanguageVersions[languageFilter]; ok && spec.FuncName != "" {
					filtered = append(filtered, p)
				}
			}
		}
		problems = filtered
	}

	RespondSuccess(w, problems)
}

func (h *ProblemHandler) GetProblemBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if slug == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "slug is required", nil)
		return
	}

	claims := GetClaims(r.Context())
	var userID uuid.UUID
	if claims != nil {
		if parsed, err := uuid.Parse(claims.UserID); err == nil {
			userID = parsed
		}
	}
	problem, err := h.store.GetProblemBySlug(r.Context(), slug, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Problem not found", nil)
			return
		}
		RespondError(w, http.StatusInternalServerError, "PROBLEM_FETCH_FAILED", "Unable to get problem", nil)
		return
	}

	// Convert example inputs (byte arrays) to readable strings for JSON payload
	var examples []map[string]interface{}
	for _, tc := range problem.Examples {
		examples = append(examples, map[string]interface{}{
			"id": tc.ID,
			"input": string(tc.Input),
			"expected": tc.Expected,
			"ordinal": tc.Ordinal,
		})
	}

	// Build response payload merging problem fields and examples
	payload := map[string]interface{}{
		"id": problem.ID,
		"slug": problem.Slug,
		"module": problem.Module,
		"type": problem.Type,
		"language": problem.Language,
		"language_versions": problem.LanguageVersions,
		"title": problem.Title,
		"statement": problem.Statement,
		"constraints": problem.Constraints,
		"learningObjective": problem.LearningObjective,
		"func_name": problem.FuncName,
		"return_type": problem.ReturnType,
		"param_types": problem.ParamTypes,
		"hints": problem.Hints,
		"difficulty": problem.Difficulty,
		"xpReward": problem.XPReward,
		"tags": problem.Tags,
		"visible": problem.Visible,
		"source_hash": problem.SourceHash,
		"raw_readme": problem.RawReadme,
		"created_at": problem.CreatedAt,
		"updated_at": problem.UpdatedAt,
		"solved": problem.Solved,
		"stars": problem.Stars,
		"attempts": problem.Attempts,
		"total_submissions": problem.TotalSubmissions,
		"success_rate": problem.SuccessRate,
		"avg_runtime_ms": problem.AvgRuntimeMs,
		"estTimeMinutes": problem.EstTimeMinutes,
		"examples": examples,
	}

	RespondSuccess(w, payload)
}
