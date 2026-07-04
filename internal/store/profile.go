package store

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// fullProfileSQLResult mirrors the JSON structure returned by get_full_profile()
type fullProfileSQLResult struct {
	User struct {
		ID         pgtype.UUID `json:"id"`
		StudentID  string      `json:"student_id"`
		Name       string      `json:"name"`
		Bio        *string     `json:"bio"`
		Role       string      `json:"role"`
		ColorIndex int         `json:"color_index"`
		XP         int         `json:"xp"`
		CreatedAt  time.Time   `json:"created_at"`
	} `json:"user"`
	Rank int `json:"rank"`
	Stats struct {
		SolvedCount       int     `json:"solved_count"`
		AttemptedCount    int     `json:"attempted_count"`
		AverageStars      float64 `json:"average_stars"`
		BestRuntimeMs     int     `json:"best_runtime_ms"`
		CurrentStreakDays int     `json:"current_streak_days"`
	} `json:"stats"`
	ProgressByDifficulty map[string]DifficultyProgress `json:"progress_by_difficulty"`
	ModuleProficiency    map[string]DifficultyProgress `json:"module_proficiency"`
	RecentSubmissions    []submissionSQLResult         `json:"recent_submissions"`
}

type submissionSQLResult struct {
	ID          pgtype.UUID `json:"id"`
	ProblemID   pgtype.UUID `json:"problem_id"`
	Language    string      `json:"language"`
	Status      string      `json:"status"`
	PassedCount int         `json:"passed_count"`
	TotalCount  int         `json:"total_count"`
	RuntimeMs   int         `json:"runtime_ms"`
	CreatedAt   time.Time   `json:"created_at"`
}

// GetFullProfile returns all profile data for a user in a single database call.
func (s *PostgresStore) GetFullProfile(ctx context.Context, userID uuid.UUID) (*FullProfileResult, error) {
	var rawJSON []byte
	err := s.pool.QueryRow(ctx, "SELECT get_full_profile($1)", userID).Scan(&rawJSON)
	if err != nil {
		return nil, fmt.Errorf("failed to get full profile: %w", err)
	}

	var result fullProfileSQLResult
	if err := json.Unmarshal(rawJSON, &result); err != nil {
		return nil, fmt.Errorf("failed to parse full profile JSON: %w", err)
	}

	// Convert recent submissions
	submissions := make([]Submission, 0, len(result.RecentSubmissions))
	for _, s := range result.RecentSubmissions {
		submissions = append(submissions, Submission{
			ID:          s.ID,
			ProblemID:   s.ProblemID,
			Language:    s.Language,
			Status:      s.Status,
			PassedCount: s.PassedCount,
			TotalCount:  s.TotalCount,
			RuntimeMs:   s.RuntimeMs,
			CreatedAt:   s.CreatedAt,
		})
	}

	if result.ProgressByDifficulty == nil {
		result.ProgressByDifficulty = make(map[string]DifficultyProgress)
	}
	if result.ModuleProficiency == nil {
		result.ModuleProficiency = make(map[string]DifficultyProgress)
	}

	return &FullProfileResult{
		UserJSON:             rawJSON,
		Rank:                 result.Rank,
		SolvedCount:          result.Stats.SolvedCount,
		AttemptedCount:       result.Stats.AttemptedCount,
		AverageStars:         result.Stats.AverageStars,
		BestRuntimeMs:        result.Stats.BestRuntimeMs,
		CurrentStreakDays:    result.Stats.CurrentStreakDays,
		ProgressByDifficulty: result.ProgressByDifficulty,
		ModuleProficiency:    result.ModuleProficiency,
		RecentSubmissions:    submissions,
	}, nil
}

// GetUserActivity returns daily activity counts for a user for the given year.
func (s *PostgresStore) GetUserActivity(ctx context.Context, userID uuid.UUID, year int) ([]ActivityEntry, error) {
	var rawJSON []byte
	err := s.pool.QueryRow(ctx, "SELECT get_user_activity($1, $2)", userID, year).Scan(&rawJSON)
	if err != nil {
		return nil, fmt.Errorf("failed to get user activity: %w", err)
	}

	var entries []ActivityEntry
	if err := json.Unmarshal(rawJSON, &entries); err != nil {
		return nil, fmt.Errorf("failed to parse activity JSON: %w", err)
	}

	return entries, nil
}
