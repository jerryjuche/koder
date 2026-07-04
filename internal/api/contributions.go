package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/store"
)

// ContributionsHandler handles requests for community contributions.
type ContributionsHandler struct {
	store store.Store
}

// NewContributionsHandler creates a new handler.
func NewContributionsHandler(s store.Store) *ContributionsHandler {
	return &ContributionsHandler{store: s}
}

// PostContribution allows a verified contributor to submit a new problem.
func (h *ContributionsHandler) PostContribution(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Unauthorized", nil)
		return
	}

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid user ID", nil)
		return
	}

	var payload store.NewUserProblem
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Invalid request payload", nil)
		return
	}

	// Validate basic constraints
	if payload.Title == "" || payload.Statement == "" || payload.Slug == "" {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Title, statement, and slug are required", nil)
		return
	}
	if len(payload.TestCases) == 0 {
		RespondError(w, http.StatusBadRequest, "VALIDATION_ERROR", "At least one test case is required", nil)
		return
	}

	up, err := h.store.CreateUserProblem(r.Context(), userID, &payload)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to submit contribution", nil)
		return
	}

	upID := uuid.UUID(up.ID.Bytes)
	h.store.NotifyAdmins(r.Context(), "contribution_submitted", fmt.Sprintf("New problem submitted for review: %s", payload.Title), &upID)

	RespondSuccess(w, up)
}

// GetMyContributions returns all contributions submitted by the current user.
func (h *ContributionsHandler) GetMyContributions(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Unauthorized", nil)
		return
	}

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid user ID", nil)
		return
	}

	problems, err := h.store.ListUserProblemsByUser(r.Context(), userID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "DB_ERROR", "Failed to list contributions", nil)
		return
	}

	RespondSuccess(w, problems)
}
