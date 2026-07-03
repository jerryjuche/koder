package store

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

func (s *PostgresStore) CreateBroadcast(ctx context.Context, adminID uuid.UUID, nb *NewBroadcast) (*Broadcast, error) {
	actionLabel := pgtype.Text{Valid: false}
	if nb.ActionLabel != nil {
		actionLabel = pgtype.Text{String: *nb.ActionLabel, Valid: true}
	}
	actionURL := pgtype.Text{Valid: false}
	if nb.ActionURL != nil {
		actionURL = pgtype.Text{String: *nb.ActionURL, Valid: true}
	}

	query := `
		INSERT INTO broadcasts (type, priority, title, message, action_label, action_url, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, type, priority, title, message, action_label, action_url, active, created_by, created_at, updated_at
	`
	var b Broadcast
	err := s.pool.QueryRow(ctx, query,
		nb.Type, nb.Priority, nb.Title, nb.Message, actionLabel, actionURL, adminID,
	).Scan(&b.ID, &b.Type, &b.Priority, &b.Title, &b.Message, &b.ActionLabel, &b.ActionURL, &b.Active, &b.CreatedBy, &b.CreatedAt, &b.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create broadcast: %w", err)
	}
	return &b, nil
}

func (s *PostgresStore) GetActiveBroadcasts(ctx context.Context, userID uuid.UUID) ([]Broadcast, error) {
	query := `
		SELECT b.id, b.type, b.priority, b.title, b.message, b.action_label, b.action_url,
		       b.active, b.created_by, b.created_at, b.updated_at, u.name AS user_name
		FROM broadcasts b
		LEFT JOIN users u ON b.created_by = u.id
		WHERE b.active = TRUE
		  AND b.id = (SELECT id FROM broadcasts WHERE active = TRUE ORDER BY created_at DESC LIMIT 1)
		  AND NOT EXISTS (
		    SELECT 1 FROM user_broadcast_status
		    WHERE broadcast_id = b.id AND user_id = $1 AND dismissed = TRUE
		  )
	`
	rows, err := s.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query active broadcasts: %w", err)
	}
	defer rows.Close()

	var broadcasts []Broadcast
	for rows.Next() {
		var b Broadcast
		if err := rows.Scan(
			&b.ID, &b.Type, &b.Priority, &b.Title, &b.Message, &b.ActionLabel, &b.ActionURL,
			&b.Active, &b.CreatedBy, &b.CreatedAt, &b.UpdatedAt, &b.UserName,
		); err != nil {
			return nil, fmt.Errorf("failed to scan broadcast: %w", err)
		}
		broadcasts = append(broadcasts, b)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("broadcast rows error: %w", err)
	}
	if broadcasts == nil {
		broadcasts = []Broadcast{}
	}
	return broadcasts, nil
}

func (s *PostgresStore) GetAllBroadcasts(ctx context.Context) ([]Broadcast, error) {
	query := `
		SELECT b.id, b.type, b.priority, b.title, b.message, b.action_label, b.action_url,
		       b.active, b.created_by, b.created_at, b.updated_at, u.name AS user_name
		FROM broadcasts b
		LEFT JOIN users u ON b.created_by = u.id
		ORDER BY b.created_at DESC
	`
	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query all broadcasts: %w", err)
	}
	defer rows.Close()

	var broadcasts []Broadcast
	for rows.Next() {
		var b Broadcast
		if err := rows.Scan(
			&b.ID, &b.Type, &b.Priority, &b.Title, &b.Message, &b.ActionLabel, &b.ActionURL,
			&b.Active, &b.CreatedBy, &b.CreatedAt, &b.UpdatedAt, &b.UserName,
		); err != nil {
			return nil, fmt.Errorf("failed to scan broadcast: %w", err)
		}
		broadcasts = append(broadcasts, b)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("broadcast rows error: %w", err)
	}
	if broadcasts == nil {
		broadcasts = []Broadcast{}
	}
	return broadcasts, nil
}

func (s *PostgresStore) GetBroadcastByID(ctx context.Context, id uuid.UUID) (*Broadcast, error) {
	query := `
		SELECT b.id, b.type, b.priority, b.title, b.message, b.action_label, b.action_url,
		       b.active, b.created_by, b.created_at, b.updated_at, u.name AS user_name
		FROM broadcasts b
		LEFT JOIN users u ON b.created_by = u.id
		WHERE b.id = $1
	`
	var b Broadcast
	err := s.pool.QueryRow(ctx, query, id).Scan(
		&b.ID, &b.Type, &b.Priority, &b.Title, &b.Message, &b.ActionLabel, &b.ActionURL,
		&b.Active, &b.CreatedBy, &b.CreatedAt, &b.UpdatedAt, &b.UserName,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get broadcast: %w", err)
	}
	return &b, nil
}

func (s *PostgresStore) DeactivateBroadcast(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE broadcasts SET active = FALSE, updated_at = $2 WHERE id = $1`
	_, err := s.pool.Exec(ctx, query, id, time.Now())
	if err != nil {
		return fmt.Errorf("failed to deactivate broadcast: %w", err)
	}
	return nil
}

func (s *PostgresStore) DeleteBroadcast(ctx context.Context, id uuid.UUID) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM broadcasts WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete broadcast: %w", err)
	}
	return nil
}

func (s *PostgresStore) MarkBroadcastDismissed(ctx context.Context, userID, broadcastID uuid.UUID) error {
	query := `
		INSERT INTO user_broadcast_status (user_id, broadcast_id, dismissed, dismissed_at)
		VALUES ($1, $2, TRUE, NOW())
		ON CONFLICT (user_id, broadcast_id) DO UPDATE
		SET dismissed = TRUE, dismissed_at = NOW()
	`
	_, err := s.pool.Exec(ctx, query, userID, broadcastID)
	if err != nil {
		return fmt.Errorf("failed to mark broadcast dismissed: %w", err)
	}
	return nil
}
