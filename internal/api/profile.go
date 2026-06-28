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
	Bio                 string                                    `json:"bio"`
	ColorIndex          int                                       `json:"color_index"`
	XP                  int                                       `json:"xp"`
	Level               int                                       `json:"level"`
	GlobalRank          int                                       `json:"global_rank"`
	CreatedAt           string                                    `json:"created_at"`
	Stats               profileStatsResponse                      `json:"stats"`
	ProgressByDifficulty map[string]difficultyProgressResponse   `json:"progress_by_difficulty"`
	ModuleProficiency    map[string]difficultyProgressResponse   `json:"module_proficiency"`
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

// rawProfileJSON is used to parse the nested JSON from GetFullProfile
type rawProfileJSON struct {
	User struct {
		ID         string `json:"id"`
		StudentID  string `json:"student_id"`
		Name       string `json:"name"`
		Bio        *string `json:"bio"`
		Role       string `json:"role"`
		ColorIndex int    `json:"color_index"`
		XP         int    `json:"xp"`
		CreatedAt  string `json:"created_at"`
	} `json:"user"`
	Rank int `json:"rank"`
	Stats struct {
		SolvedCount       int     `json:"solved_count"`
		AttemptedCount    int     `json:"attempted_count"`
		AverageStars      float64 `json:"average_stars"`
		BestRuntimeMs     int     `json:"best_runtime_ms"`
		CurrentStreakDays int     `json:"current_streak_days"`
	} `json:"stats"`
	ProgressByDifficulty map[string]difficultyProgressResponse `json:"progress_by_difficulty"`
	ModuleProficiency    map[string]difficultyProgressResponse `json:"module_proficiency"`
	RecentSubmissions    []struct {
		ID          string `json:"id"`
		ProblemID   string `json:"problem_id"`
		Language    string `json:"language"`
		Status      string `json:"status"`
		PassedCount int    `json:"passed_count"`
		TotalCount  int    `json:"total_count"`
		RuntimeMs   int    `json:"runtime_ms"`
		CreatedAt   string `json:"created_at"`
	} `json:"recent_submissions"`
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

	// Check cache first
	if cached, ok := getCachedProfile(r.Context(), userUUID.String()); ok {
		RespondSuccess(w, cached)
		return
	}

	result, err := h.store.GetFullProfile(r.Context(), userUUID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "PROFILE_ERROR", "Failed to load profile", nil)
		return
	}

	var raw rawProfileJSON
	if err := json.Unmarshal(result.UserJSON, &raw); err != nil {
		RespondError(w, http.StatusInternalServerError, "PARSE_ERROR", "Failed to parse profile data", nil)
		return
	}

	level := (raw.User.XP / 1000) + 1

	bio := ""
	if raw.User.Bio != nil {
		bio = *raw.User.Bio
	}

	// Convert submissions
	recentSubs := make([]submissionResponse, 0, len(raw.RecentSubmissions))
	for _, sub := range raw.RecentSubmissions {
		recentSubs = append(recentSubs, submissionResponse{
			ID:          sub.ID,
			ProblemID:   sub.ProblemID,
			Language:    sub.Language,
			Status:      sub.Status,
			PassedCount: sub.PassedCount,
			TotalCount:  sub.TotalCount,
			RuntimeMs:   sub.RuntimeMs,
			CreatedAt:   sub.CreatedAt,
		})
	}

	// Ensure progress maps exist (they should from the SQL, but guard anyway)
	if raw.ProgressByDifficulty == nil {
		raw.ProgressByDifficulty = make(map[string]difficultyProgressResponse)
	}
	if raw.ModuleProficiency == nil {
		raw.ModuleProficiency = make(map[string]difficultyProgressResponse)
	}
	// Ensure all three difficulty levels exist
	for _, d := range []string{"easy", "medium", "hard"} {
		if _, ok := raw.ProgressByDifficulty[d]; !ok {
			raw.ProgressByDifficulty[d] = difficultyProgressResponse{0, 0}
		}
	}

	resp := profileResponse{
		ID:         raw.User.ID,
		StudentID:  raw.User.StudentID,
		Name:       raw.User.Name,
		Bio:        bio,
		ColorIndex: raw.User.ColorIndex,
		XP:         raw.User.XP,
		Level:      level,
		GlobalRank: raw.Rank,
		CreatedAt:  raw.User.CreatedAt,
		Stats: profileStatsResponse{
			SolvedCount:       raw.Stats.SolvedCount,
			AttemptedCount:    raw.Stats.AttemptedCount,
			AverageStars:      raw.Stats.AverageStars,
			BestRuntimeMs:     raw.Stats.BestRuntimeMs,
			CurrentStreakDays: raw.Stats.CurrentStreakDays,
		},
		ProgressByDifficulty: raw.ProgressByDifficulty,
		ModuleProficiency:    raw.ModuleProficiency,
		RecentSubmissions:    recentSubs,
	}

	cacheProfile(r.Context(), userUUID.String(), resp)
	RespondSuccess(w, resp)
}

// updateProfileRequest is the request body for updating user profile.
type updateProfileRequest struct {
	Name string `json:"name"`
	Bio  string `json:"bio"`
}

// UpdateProfile updates the authenticated user's profile and returns updated data without re-fetching.
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

	// Update and return in a single operation
	user, err := h.store.UpdateUserProfileWithReturn(r.Context(), userUUID, req.Name, req.Bio)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "UPDATE_ERROR", "Failed to update profile", nil)
		return
	}

	// Invalidate cache so next read fetches fresh data
	InvalidateUserCache(userUUID.String())

	userID, _ := uuidStringFromPGType(user.ID)
	level := (user.XP / 1000) + 1

	bioStr := ""
	if user.Bio != nil {
		bioStr = *user.Bio
	}

	RespondSuccess(w, map[string]interface{}{
		"id":          userID,
		"name":        user.Name,
		"bio":         bioStr,
		"student_id":  user.StudentID,
		"xp":          user.XP,
		"level":       level,
		"color_index": user.ColorIndex,
		"role":        user.Role,
	})
}
