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
		RespondError(w, http.StatusUnauthorized, "AUTH_INVALID", "Invalid user identifier in token", err.Error())
		return
	}

	problems, err := h.store.ListVisibleProblems(r.Context(), userID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "PROBLEM_LIST_FAILED", "Unable to list problems", err.Error())
		return
	}

	RespondSuccess(w, problems)
}

func (h *ProblemHandler) GetProblemBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if slug == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "slug is required", nil)
		return
	}

	problem, err := h.store.GetProblemBySlug(r.Context(), slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			RespondError(w, http.StatusNotFound, "NOT_FOUND", "Problem not found", nil)
			return
		}
		RespondError(w, http.StatusInternalServerError, "PROBLEM_FETCH_FAILED", "Unable to get problem", err.Error())
		return
	}

	RespondSuccess(w, problem)
}
