package api

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/broker"
	"github.com/jerryjuche/koder/internal/store"
)

type CommunityHandler struct {
	store  store.Store
	broker *broker.Broker
}

func NewCommunityHandler(s store.Store, b *broker.Broker) *CommunityHandler {
	return &CommunityHandler{store: s, broker: b}
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

	inserted, err := h.store.LikeSubmission(r.Context(), submissionUUID, userUUID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "LIKE_ERROR", "Failed to like submission", nil)
		return
	}

	// Notify the submission's author the first time their solution is liked.
	// Duplicate likes (ON CONFLICT DO NOTHING) are silent to avoid spamming.
	if inserted {
		h.notifyAuthorOnLike(r.Context(), submissionUUID, userUUID)
	}

	RespondSuccess(w, map[string]bool{"success": true})
}

// notifyAuthorOnLike creates a notification + publishes a real-time WS event for
// the author of a liked solution. Failures are logged but never fail the like.
func (h *CommunityHandler) notifyAuthorOnLike(ctx context.Context, submissionID, likerID uuid.UUID) {
	sum, err := h.store.GetSubmissionLikeSummary(ctx, submissionID)
	if err != nil {
		slog.Warn("community: could not load submission for like notification",
			"submission_id", submissionID, "error", err)
		return
	}
	if sum == nil {
		return
	}

	// Never notify the author for liking their own solution.
	if sum.AuthorID == likerID {
		return
	}

	problemTitle := sum.ProblemTitle
	if problemTitle == "" {
		problemTitle = "a community problem"
	}
	message := fmt.Sprintf("Your solution to \"%s\" got a like", problemTitle)
	relatedID := sum.ProblemID
	if err := h.store.CreateNotification(ctx, sum.AuthorID, "solution_liked", message, &relatedID); err != nil {
		slog.Warn("community: failed to create like notification", "error", err)
		return
	}

	if h.broker != nil {
		h.broker.PublishEvent("solution.liked", map[string]interface{}{
			"user_id":       sum.AuthorID.String(),
			"submission_id": submissionID.String(),
			"problem_slug":  sum.ProblemSlug,
			"problem_title": sum.ProblemTitle,
		})
	}
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

	problem, err := h.store.GetProblemBySlug(r.Context(), slug, uuid.Nil)
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

	mineOnly := false
	if v := r.URL.Query().Get("mine"); v == "1" || strings.EqualFold(v, "true") {
		mineOnly = true
	}

	solutions, err := h.store.GetBestPractices(r.Context(), userUUID, mineOnly, limit)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "FETCH_ERROR", "Failed to fetch best practices", nil)
		return
	}

	RespondSuccess(w, solutions)
}

