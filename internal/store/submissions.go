package store

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"github.com/google/uuid"
)

// CreateSubmission inserts a new submission record with a 90-day TTL on output logs.
func (s *PostgresStore) CreateSubmission(ctx context.Context, sub *Submission) error {
	if sub == nil {
		return fmt.Errorf("submission cannot be nil")
	}

	query := `
		INSERT INTO submissions (user_id, problem_id, language, code, status, passed_count, total_count, output_logs, runtime_ms, created_at, output_logs_expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)
		RETURNING id, created_at
	`

	expiresAt := time.Now().Add(90 * 24 * time.Hour)

	err := s.pool.QueryRow(ctx, query,
		sub.UserID,
		sub.ProblemID,
		sub.Language,
		sub.Code,
		sub.Status,
		sub.PassedCount,
		sub.TotalCount,
		sub.OutputLogs,
		sub.RuntimeMs,
		expiresAt,
	).Scan(&sub.ID, &sub.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to insert submission: %w", err)
	}

	return nil
}

// GetProblemWithTestCases fetches both a problem and its associated test cases.
func (s *PostgresStore) GetProblemWithTestCases(ctx context.Context, problemID uuid.UUID) (*Problem, []TestCase, error) {
	if problemID == uuid.Nil {
		return nil, nil, fmt.Errorf("problemID cannot be nil")
	}

	query := `
		SELECT id, slug, module, type, language, title, statement, func_name, return_type, param_types, hints, difficulty, xp_reward, tags, visible, source_hash, language_versions, raw_readme, created_at, updated_at
		FROM problems
		WHERE id = $1
	`

	var problem Problem
	var lvBytes []byte
	err := s.pool.QueryRow(ctx, query, problemID).Scan(
		&problem.ID,
		&problem.Slug,
		&problem.Module,
		&problem.Type,
		&problem.Language,
		&problem.Title,
		&problem.Statement,
		&problem.FuncName,
		&problem.ReturnType,
		&problem.ParamTypes,
		&problem.Hints,
		&problem.Difficulty,
		&problem.XPReward,
		&problem.Tags,
		&problem.Visible,
		&problem.SourceHash,
		&lvBytes,
		&problem.RawReadme,
		&problem.CreatedAt,
		&problem.UpdatedAt,
	)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get problem: %w", err)
	}

	if len(lvBytes) > 0 {
		if err := json.Unmarshal(lvBytes, &problem.LanguageVersions); err != nil {
			slog.Warn("failed to unmarshal language_versions", "slug", problem.Slug, "error", err)
		}
	}

	testCases, err := s.GetTestCasesForProblem(ctx, problemID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get test cases for problem: %w", err)
	}

	return &problem, testCases, nil
}

// LikeSubmission adds a like to a submission from a user.
func (s *PostgresStore) LikeSubmission(ctx context.Context, submissionID, userID uuid.UUID) error {
	query := `
		INSERT INTO submission_likes (submission_id, user_id)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING
	`
	_, err := s.pool.Exec(ctx, query, submissionID, userID)
	if err != nil {
		return fmt.Errorf("failed to like submission: %w", err)
	}
	return nil
}

// UnlikeSubmission removes a like from a submission from a user.
func (s *PostgresStore) UnlikeSubmission(ctx context.Context, submissionID, userID uuid.UUID) error {
	query := `
		DELETE FROM submission_likes
		WHERE submission_id = $1 AND user_id = $2
	`
	_, err := s.pool.Exec(ctx, query, submissionID, userID)
	if err != nil {
		return fmt.Errorf("failed to unlike submission: %w", err)
	}
	return nil
}

// GetTopCommunitySolutionsForProblem gets the top liked successful submissions for a problem.
func (s *PostgresStore) GetTopCommunitySolutionsForProblem(ctx context.Context, problemID, currentUserID uuid.UUID, limit int) ([]CommunitySolution, error) {
	if limit <= 0 {
		limit = 3
	}

	query := `
		SELECT 
			sub.id, sub.user_id, u.name as user_name, sub.problem_id,
			sub.language, sub.code, sub.runtime_ms, sub.created_at,
			COUNT(sl.id) as likes,
			EXISTS(SELECT 1 FROM submission_likes WHERE submission_id = sub.id AND user_id = $2) as has_liked,
			u.google_avatar_url, u.verified
		FROM submissions sub
		JOIN users u ON sub.user_id = u.id
		LEFT JOIN submission_likes sl ON sub.id = sl.submission_id
		WHERE sub.problem_id = $1 AND sub.status = 'passed'
		GROUP BY sub.id, u.name, u.google_avatar_url, u.verified
		ORDER BY likes DESC, sub.runtime_ms ASC, sub.created_at DESC
		LIMIT $3
	`

	rows, err := s.pool.Query(ctx, query, problemID, currentUserID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query community solutions: %w", err)
	}
	defer rows.Close()

	var solutions []CommunitySolution
	for rows.Next() {
		var cs CommunitySolution
		err := rows.Scan(
			&cs.ID, &cs.UserID, &cs.UserName, &cs.ProblemID,
			&cs.Language, &cs.Code, &cs.RuntimeMs, &cs.CreatedAt,
			&cs.Likes, &cs.HasLiked, &cs.UserAvatarURL, &cs.Verified,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan community solution: %w", err)
		}
		solutions = append(solutions, cs)
	}

	if solutions == nil {
		solutions = []CommunitySolution{}
	}

	return solutions, nil
}

// GetBestPractices gets the top liked successful submissions across all problems globally.
func (s *PostgresStore) GetBestPractices(ctx context.Context, currentUserID uuid.UUID, limit int) ([]CommunitySolution, error) {
	if limit <= 0 {
		limit = 20
	}

	query := `
		SELECT 
			sub.id, sub.user_id, u.name as user_name, sub.problem_id, p.slug as problem_slug,
			sub.language, sub.code, sub.runtime_ms, sub.created_at,
			COUNT(sl.id) as likes,
			EXISTS(SELECT 1 FROM submission_likes WHERE submission_id = sub.id AND user_id = $1) as has_liked,
			u.google_avatar_url, u.verified
		FROM submissions sub
		JOIN users u ON sub.user_id = u.id
		JOIN problems p ON sub.problem_id = p.id
		LEFT JOIN submission_likes sl ON sub.id = sl.submission_id
		WHERE sub.status = 'passed' AND p.visible = true
		  AND EXISTS (SELECT 1 FROM submission_likes WHERE submission_id = sub.id)
		GROUP BY sub.id, u.name, p.slug, u.google_avatar_url, u.verified
		ORDER BY likes DESC, sub.created_at DESC
		LIMIT $2
	`

	rows, err := s.pool.Query(ctx, query, currentUserID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query best practices: %w", err)
	}
	defer rows.Close()

	var solutions []CommunitySolution
	for rows.Next() {
		var cs CommunitySolution
		err := rows.Scan(
			&cs.ID, &cs.UserID, &cs.UserName, &cs.ProblemID, &cs.ProblemSlug,
			&cs.Language, &cs.Code, &cs.RuntimeMs, &cs.CreatedAt,
			&cs.Likes, &cs.HasLiked, &cs.UserAvatarURL, &cs.Verified,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan best practice: %w", err)
		}
		solutions = append(solutions, cs)
	}

	if solutions == nil {
		solutions = []CommunitySolution{}
	}

	return solutions, nil
}
