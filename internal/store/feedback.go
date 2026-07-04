package store

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

func (s *PostgresStore) CreateFeedback(ctx context.Context, userID uuid.UUID, fb *NewFeedback) (*Feedback, error) {
	query := `
		INSERT INTO feedback (user_id, type, title, description, priority, screenshot_url, is_anonymous)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, user_id, type, title, description, priority, screenshot_url, status, admin_notes, is_anonymous, created_at
	`
	var f Feedback
	err := s.pool.QueryRow(ctx, query,
		userID, fb.Type, fb.Title, fb.Description, fb.Priority, fb.ScreenshotURL, fb.IsAnonymous,
	).Scan(&f.ID, &f.UserID, &f.Type, &f.Title, &f.Description, &f.Priority, &f.ScreenshotURL, &f.Status, &f.AdminNotes, &f.IsAnonymous, &f.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create feedback: %w", err)
	}
	return &f, nil
}

func (s *PostgresStore) GetAdminFeedback(ctx context.Context, statusFilter string) ([]Feedback, error) {
	query := `
		SELECT f.id, f.user_id, f.type, f.title, f.description, f.priority,
		       f.screenshot_url, f.status, f.admin_notes, f.is_anonymous, f.created_at,
		       u.name AS user_name
		FROM feedback f
		LEFT JOIN users u ON f.user_id = u.id
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
			&f.ScreenshotURL, &f.Status, &f.AdminNotes, &f.IsAnonymous, &f.CreatedAt, &f.UserName); err != nil {
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
		       screenshot_url, status, admin_notes, is_anonymous, created_at
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
			&f.ScreenshotURL, &f.Status, &f.AdminNotes, &f.IsAnonymous, &f.CreatedAt); err != nil {
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

func (s *PostgresStore) UpdateFeedbackStatus(ctx context.Context, id uuid.UUID, status, adminNotes string) (*Feedback, error) {
	query := `
		UPDATE feedback
		SET status = $2, admin_notes = $3
		WHERE id = $1
		RETURNING id, user_id, type, title, description, priority, screenshot_url, status, admin_notes, is_anonymous, created_at
	`
	var f Feedback
	err := s.pool.QueryRow(ctx, query, id, status, adminNotes).
		Scan(&f.ID, &f.UserID, &f.Type, &f.Title, &f.Description, &f.Priority, &f.ScreenshotURL, &f.Status, &f.AdminNotes, &f.IsAnonymous, &f.CreatedAt)
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
