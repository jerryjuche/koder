package api

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/store"
)

type CommunityHandler struct {
	store store.Store
}

func NewCommunityHandler(s store.Store) *CommunityHandler {
	return &CommunityHandler{store: s}
}

// LikeSubmission handles POST /submissions/{id}/like
func (h *CommunityHandler) LikeSubmission(w http.ResponseWriter, r *http.Request) {
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

	submissionIDStr := chi.URLParam(r, "id")
	submissionUUID, err := uuid.Parse(submissionIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_SUBMISSION_ID", "Invalid submission ID", nil)
		return
	}

	if err := h.store.LikeSubmission(r.Context(), submissionUUID, userUUID); err != nil {
		RespondError(w, http.StatusInternalServerError, "LIKE_ERROR", "Failed to like submission", nil)
		return
	}

	RespondSuccess(w, map[string]bool{"success": true})
}

// UnlikeSubmission handles DELETE /submissions/{id}/like
func (h *CommunityHandler) UnlikeSubmission(w http.ResponseWriter, r *http.Request) {
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

	submissionIDStr := chi.URLParam(r, "id")
	submissionUUID, err := uuid.Parse(submissionIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_SUBMISSION_ID", "Invalid submission ID", nil)
		return
	}

	if err := h.store.UnlikeSubmission(r.Context(), submissionUUID, userUUID); err != nil {
		RespondError(w, http.StatusInternalServerError, "UNLIKE_ERROR", "Failed to unlike submission", nil)
		return
	}

	RespondSuccess(w, map[string]bool{"success": true})
}

// GetCommunitySolutions handles GET /problems/{slug}/community-solutions
func (h *CommunityHandler) GetCommunitySolutions(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if slug == "" {
		RespondError(w, http.StatusBadRequest, "MISSING_SLUG", "Problem slug is required", nil)
		return
	}

	// We still need current user to know if they liked it
	var userUUID uuid.UUID
	claims := GetClaims(r.Context())
	if claims != nil {
		userUUID, _ = uuid.Parse(claims.UserID)
	}

	problem, err := h.store.GetProblemBySlug(r.Context(), slug)
	if err != nil || problem == nil {
		RespondError(w, http.StatusNotFound, "PROBLEM_NOT_FOUND", "Problem not found", nil)
		return
	}
	problemUUID := uuid.UUID(problem.ID.Bytes)

	limit := 3
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	solutions, err := h.store.GetTopCommunitySolutionsForProblem(r.Context(), problemUUID, userUUID, limit)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "FETCH_ERROR", "Failed to fetch community solutions", nil)
		return
	}

	RespondSuccess(w, solutions)
}

// GetBestPractices handles GET /best-practices
func (h *CommunityHandler) GetBestPractices(w http.ResponseWriter, r *http.Request) {
	var userUUID uuid.UUID
	claims := GetClaims(r.Context())
	if claims != nil {
		userUUID, _ = uuid.Parse(claims.UserID)
	}

	limit := 20
	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	solutions, err := h.store.GetBestPractices(r.Context(), userUUID, limit)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "FETCH_ERROR", "Failed to fetch best practices", nil)
		return
	}

	RespondSuccess(w, solutions)
}

