package store

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

func (s *PostgresStore) CreateFeedback(ctx context.Context, userID uuid.UUID, fb *NewFeedback) (*Feedback, error) {
	query := `
		INSERT INTO feedback (user_id, type, title, description, priority, screenshot_url, is_anonymous, problem_slug, code_snippet, error_message)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, user_id, type, title, description, priority, screenshot_url, status, admin_notes, is_anonymous, problem_slug, code_snippet, error_message, created_at
	`
	var f Feedback
	err := s.pool.QueryRow(ctx, query,
		userID, fb.Type, fb.Title, fb.Description, fb.Priority, fb.ScreenshotURL, fb.IsAnonymous,
		fb.ProblemSlug, fb.CodeSnippet, fb.ErrorMessage,
	).Scan(&f.ID, &f.UserID, &f.Type, &f.Title, &f.Description, &f.Priority, &f.ScreenshotURL, &f.Status, &f.AdminNotes, &f.IsAnonymous, &f.ProblemSlug, &f.CodeSnippet, &f.ErrorMessage, &f.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create feedback: %w", err)
	}
	return &f, nil
}

// HideProblemOnReportThreshold counts distinct bug reporters for a problem and,
// once the threshold is met, auto-drafts it (visible=false) so it drops out of
// student listings until an admin reviews it. A per-problem advisory lock
// serializes concurrent reports so two simultaneous submissions can't both read
// a count below the threshold. Returns whether the problem is now a draft.
func (s *PostgresStore) HideProblemOnReportThreshold(ctx context.Context, problemSlug string, threshold int) (bool, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return false, fmt.Errorf("failed to begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx, "SELECT pg_advisory_xact_lock(hashtext($1)::bigint)", problemSlug); err != nil {
		return false, fmt.Errorf("failed to acquire report lock: %w", err)
	}

	var visible bool
	err = tx.QueryRow(ctx, "SELECT visible FROM problems WHERE slug = $1", problemSlug).Scan(&visible)
	if err == pgx.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("failed to load problem visibility: %w", err)
	}

	var reporters int
	if err := tx.QueryRow(ctx, `
		SELECT COUNT(DISTINCT user_id)::int
		FROM feedback
		WHERE type = 'bug' AND problem_slug = $1
	`, problemSlug).Scan(&reporters); err != nil {
		return false, fmt.Errorf("failed to count bug reporters: %w", err)
	}

	drafted := false
	if !visible {
		// Already a draft — report anyway, nothing to flip.
		drafted = true
	} else if reporters >= threshold {
		if _, err := tx.Exec(ctx, "UPDATE problems SET visible = false WHERE slug = $1", problemSlug); err != nil {
			return false, fmt.Errorf("failed to draft problem: %w", err)
		}
		drafted = true
	}
	if err := tx.Commit(ctx); err != nil {
		return false, fmt.Errorf("failed to commit draft decision: %w", err)
	}
	return drafted, nil
}

func (s *PostgresStore) GetAdminFeedback(ctx context.Context, statusFilter string) ([]Feedback, error) {
	query := `
		SELECT f.id, f.user_id, f.type, f.title, f.description, f.priority,
		       f.screenshot_url, f.status, f.admin_notes, f.is_anonymous,
		       f.problem_slug, f.code_snippet, f.error_message, f.created_at,
		       u.name AS user_name,
		       p.title AS problem_title
		FROM feedback f
		LEFT JOIN users u ON f.user_id = u.id
		LEFT JOIN problems p ON p.slug = f.problem_slug
	`
	var args []interface{}

	if statusFilter != "" {
		query += " WHERE f.status = $1"
		args = append(args, statusFilter)
	}
	query += " ORDER BY f.created_at DESC LIMIT 100"

	rows, err := s.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query admin feedback: %w", err)
	}
	defer rows.Close()

	var feedbacks []Feedback
	for rows.Next() {
		var f Feedback
		if err := rows.Scan(&f.ID, &f.UserID, &f.Type, &f.Title, &f.Description, &f.Priority,
			&f.ScreenshotURL, &f.Status, &f.AdminNotes, &f.IsAnonymous,
			&f.ProblemSlug, &f.CodeSnippet, &f.ErrorMessage, &f.CreatedAt, &f.UserName, &f.ProblemTitle); err != nil {
			return nil, fmt.Errorf("failed to scan feedback: %w", err)
		}
		feedbacks = append(feedbacks, f)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("feedback rows error: %w", err)
	}
	if feedbacks == nil {
		feedbacks = make([]Feedback, 0)
	}
	return feedbacks, nil
}

func (s *PostgresStore) GetUserFeedback(ctx context.Context, userID uuid.UUID) ([]Feedback, error) {
	query := `
		SELECT id, user_id, type, title, description, priority,
		       screenshot_url, status, admin_notes, is_anonymous,
		       problem_slug, code_snippet, error_message, created_at
		FROM feedback
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 50
	`
	rows, err := s.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query user feedback: %w", err)
	}
	defer rows.Close()

	var feedbacks []Feedback
	for rows.Next() {
		var f Feedback
		if err := rows.Scan(&f.ID, &f.UserID, &f.Type, &f.Title, &f.Description, &f.Priority,
			&f.ScreenshotURL, &f.Status, &f.AdminNotes, &f.IsAnonymous,
			&f.ProblemSlug, &f.CodeSnippet, &f.ErrorMessage, &f.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan feedback: %w", err)
		}
		feedbacks = append(feedbacks, f)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("feedback rows error: %w", err)
	}
	if feedbacks == nil {
		feedbacks = make([]Feedback, 0)
	}
	return feedbacks, nil
}

func (s *PostgresStore) GetProblemReports(ctx context.Context, problemSlug string) ([]Feedback, error) {
	query := `
		SELECT f.id, f.user_id, f.type, f.title, f.description, f.priority,
		       f.screenshot_url, f.status, f.admin_notes, f.is_anonymous,
		       f.problem_slug, f.code_snippet, f.error_message, f.created_at,
		       u.name AS user_name,
		       p.title AS problem_title
		FROM feedback f
		LEFT JOIN users u ON f.user_id = u.id
		LEFT JOIN problems p ON p.slug = f.problem_slug
		WHERE f.type = 'bug' AND f.problem_slug IS NOT NULL
	`
	var args []interface{}
	argIdx := 1

	if problemSlug != "" {
		query += fmt.Sprintf(" AND f.problem_slug = $%d", argIdx)
		args = append(args, problemSlug)
		argIdx++
	}
	query += " ORDER BY f.created_at DESC LIMIT 100"

	rows, err := s.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query problem reports: %w", err)
	}
	defer rows.Close()

	var feedbacks []Feedback
	for rows.Next() {
		var f Feedback
		if err := rows.Scan(&f.ID, &f.UserID, &f.Type, &f.Title, &f.Description, &f.Priority,
			&f.ScreenshotURL, &f.Status, &f.AdminNotes, &f.IsAnonymous,
			&f.ProblemSlug, &f.CodeSnippet, &f.ErrorMessage, &f.CreatedAt, &f.UserName, &f.ProblemTitle); err != nil {
			return nil, fmt.Errorf("failed to scan problem report: %w", err)
		}
		feedbacks = append(feedbacks, f)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("problem report rows error: %w", err)
	}
	if feedbacks == nil {
		feedbacks = make([]Feedback, 0)
	}
	return feedbacks, nil
}

func (s *PostgresStore) UpdateFeedbackStatus(ctx context.Context, id uuid.UUID, status, adminNotes string) (*Feedback, error) {
	query := `
		UPDATE feedback
		SET status = $2, admin_notes = $3
		WHERE id = $1
		RETURNING id, user_id, type, title, description, priority, screenshot_url, status, admin_notes, is_anonymous, problem_slug, code_snippet, error_message, created_at
	`
	var f Feedback
	err := s.pool.QueryRow(ctx, query, id, status, adminNotes).
		Scan(&f.ID, &f.UserID, &f.Type, &f.Title, &f.Description, &f.Priority, &f.ScreenshotURL, &f.Status, &f.AdminNotes, &f.IsAnonymous, &f.ProblemSlug, &f.CodeSnippet, &f.ErrorMessage, &f.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to update feedback: %w", err)
	}
	return &f, nil
}

func (s *PostgresStore) CountFeedbackByStatus(ctx context.Context) (map[string]int, error) {
	query := `
		SELECT status, COUNT(*)::int FROM feedback GROUP BY status
	`
	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to count feedback by status: %w", err)
	}
	defer rows.Close()

	counts := map[string]int{}
	for rows.Next() {
		var status string
		var count int
		if err := rows.Scan(&status, &count); err != nil {
			return nil, fmt.Errorf("failed to scan feedback count: %w", err)
		}
		counts[status] = count
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("feedback count rows error: %w", err)
	}
	return counts, nil
}
