package api

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/jerryjuche/koder/internal/store"
)

// ProfileHandler handles profile-related endpoints.
type ProfileHandler struct {
	store store.Store
}

// NewProfileHandler creates a new ProfileHandler.
func NewProfileHandler(s store.Store) *ProfileHandler {
	return &ProfileHandler{store: s}
}

// profileResponse is the detailed user profile response.
type profileResponse struct {
	ID                  string                                    `json:"id"`
	StudentID           string                                    `json:"student_id"`
	Name                string                                    `json:"name"`
	ColorIndex          int                                       `json:"color_index"`
	XP                  int                                       `json:"xp"`
	Level               int                                       `json:"level"`
	GlobalRank          int                                       `json:"global_rank"`
	CreatedAt           string                                    `json:"created_at"`
	Stats               profileStatsResponse                      `json:"stats"`
	ProgressByDifficulty map[string]difficultyProgressResponse  `json:"progress_by_difficulty"`
	RecentSubmissions   []submissionResponse                      `json:"recent_submissions"`
}

type profileStatsResponse struct {
	SolvedCount       int     `json:"solved_count"`
	AttemptedCount    int     `json:"attempted_count"`
	AverageStars      float64 `json:"average_stars"`
	BestRuntimeMs     int     `json:"best_runtime_ms"`
	CurrentStreakDays int     `json:"current_streak_days"`
}

type difficultyProgressResponse struct {
	Solved int `json:"solved"`
	Total  int `json:"total"`
}

type submissionResponse struct {
	ID          string `json:"id"`
	ProblemID   string `json:"problem_id"`
	Language    string `json:"language"`
	Status      string `json:"status"`
	PassedCount int    `json:"passed_count"`
	TotalCount  int    `json:"total_count"`
	RuntimeMs   int    `json:"runtime_ms"`
	CreatedAt   string `json:"created_at"`
}

// GetProfile returns the authenticated user's detailed profile.
func (h *ProfileHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	userUUID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID in token", nil)
		return
	}

	// Get user from database
	user, err := h.store.GetUserByID(r.Context(), userUUID)
	if err != nil {
		RespondError(w, http.StatusNotFound, "USER_NOT_FOUND", "User not found", nil)
		return
	}

	// Get user rank
	rank, err := h.store.GetUserRank(r.Context(), userUUID)
	if err != nil {
		rank = 0
	}

	// Get user stats
	stats, err := h.store.GetUserStats(r.Context(), userUUID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "STATS_ERROR", "Failed to retrieve stats", nil)
		return
	}

	// Get recent submissions
	submissions, err := h.store.GetRecentSubmissions(r.Context(), userUUID, 10)
	if err != nil {
		submissions = []store.Submission{}
	}

	// Convert difficulty progress to response format
	progressByDiff := make(map[string]difficultyProgressResponse)
	progressByDiff["easy"] = difficultyProgressResponse{
		Solved: stats.ProgressByDiff["easy"].Solved,
		Total:  stats.ProgressByDiff["easy"].Total,
	}
	progressByDiff["medium"] = difficultyProgressResponse{
		Solved: stats.ProgressByDiff["medium"].Solved,
		Total:  stats.ProgressByDiff["medium"].Total,
	}
	progressByDiff["hard"] = difficultyProgressResponse{
		Solved: stats.ProgressByDiff["hard"].Solved,
		Total:  stats.ProgressByDiff["hard"].Total,
	}

	// Convert recent submissions to response format
	recentSubs := make([]submissionResponse, 0, len(submissions))
	for _, sub := range submissions {
		subID, _ := uuidStringFromPGType(sub.ID)
		probID, _ := uuidStringFromPGType(sub.ProblemID)
		recentSubs = append(recentSubs, submissionResponse{
			ID:          subID,
			ProblemID:   probID,
			Language:    sub.Language,
			Status:      sub.Status,
			PassedCount: sub.PassedCount,
			TotalCount:  sub.TotalCount,
			RuntimeMs:   sub.RuntimeMs,
			CreatedAt:   sub.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	userID, _ := uuidStringFromPGType(user.ID)
	level := (user.XP / 1000) + 1

	resp := profileResponse{
		ID:         userID,
		StudentID:  user.StudentID,
		Name:       user.Name,
		ColorIndex: user.ColorIndex,
		XP:         user.XP,
		Level:      level,
		GlobalRank: rank,
		CreatedAt:  user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		Stats: profileStatsResponse{
			SolvedCount:       stats.SolvedCount,
			AttemptedCount:    stats.AttemptedCount,
			AverageStars:      stats.AverageStars,
			BestRuntimeMs:     stats.BestRuntimeMs,
			CurrentStreakDays: stats.CurrentStreakDays,
		},
		ProgressByDifficulty: progressByDiff,
		RecentSubmissions:    recentSubs,
	}

	RespondSuccess(w, resp)
}

// updateProfileRequest is the request body for updating user profile.
type updateProfileRequest struct {
	Name string `json:"name"`
}

// UpdateProfile updates the authenticated user's profile (currently just name).
func (h *ProfileHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	claims := GetClaims(r.Context())
	if claims == nil {
		RespondError(w, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	userUUID, err := uuid.Parse(claims.UserID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_USER_ID", "Invalid user ID in token", nil)
		return
	}

	var req updateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "INVALID_REQUEST", "Invalid request body", nil)
		return
	}

	if req.Name == "" {
		RespondError(w, http.StatusBadRequest, "INVALID_NAME", "Name cannot be empty", nil)
		return
	}

	// Update user name
	if err := h.store.UpdateUserName(r.Context(), userUUID, req.Name); err != nil {
		RespondError(w, http.StatusInternalServerError, "UPDATE_ERROR", "Failed to update profile", nil)
		return
	}

	// Get updated user
	user, err := h.store.GetUserByID(r.Context(), userUUID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "FETCH_ERROR", "Failed to fetch updated user", nil)
		return
	}

	userID, _ := uuidStringFromPGType(user.ID)
	level := (user.XP / 1000) + 1

	RespondSuccess(w, map[string]interface{}{
		"id":          userID,
		"name":        user.Name,
		"student_id":  user.StudentID,
		"xp":          user.XP,
		"level":       level,
		"color_index": user.ColorIndex,
		"role":        user.Role,
	})
}
