package store

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// CreateNotification inserts a new notification for a specific user.
// If relatedID is nil, it inserts a notification without a relation.
func (s *PostgresStore) CreateNotification(ctx context.Context, userID uuid.UUID, notifType, message string, relatedID *uuid.UUID) error {
	query := `
		INSERT INTO notifications (user_id, type, message, related_id)
		VALUES ($1, $2, $3, $4)
	`
	var rID pgtype.UUID
	if relatedID != nil {
		rID = pgtype.UUID{Bytes: *relatedID, Valid: true}
	} else {
		rID = pgtype.UUID{Valid: false}
	}

	_, err := s.pool.Exec(ctx, query, userID, notifType, message, rID)
	if err != nil {
		return fmt.Errorf("failed to create notification: %w", err)
	}
	return nil
}

// GetUnreadNotifications retrieves up to 50 unread notifications for a user.
func (s *PostgresStore) GetUnreadNotifications(ctx context.Context, userID uuid.UUID) ([]Notification, error) {
	query := `
		SELECT id, user_id, type, message, related_id, is_read, created_at
		FROM notifications
		WHERE user_id = $1 AND is_read = FALSE
		ORDER BY created_at DESC
		LIMIT 50
	`
	rows, err := s.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query notifications: %w", err)
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var n Notification
		if err := rows.Scan(
			&n.ID, &n.UserID, &n.Type, &n.Message, &n.RelatedID, &n.IsRead, &n.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan notification: %w", err)
		}
		notifications = append(notifications, n)
	}

	if notifications == nil {
		notifications = []Notification{}
	}
	return notifications, nil
}

// MarkNotificationAsRead marks a specific notification as read.
func (s *PostgresStore) MarkNotificationAsRead(ctx context.Context, id, userID uuid.UUID) error {
	query := `
		UPDATE notifications
		SET is_read = TRUE
		WHERE id = $1 AND user_id = $2
	`
	res, err := s.pool.Exec(ctx, query, id, userID)
	if err != nil {
		return fmt.Errorf("failed to mark notification as read: %w", err)
	}
	if res.RowsAffected() == 0 {
		return fmt.Errorf("notification not found or unauthorized")
	}
	return nil
}

// MarkAllNotificationsAsRead marks all notifications as read for a user.
func (s *PostgresStore) MarkAllNotificationsAsRead(ctx context.Context, userID uuid.UUID) error {
	query := `
		UPDATE notifications
		SET is_read = TRUE
		WHERE user_id = $1 AND is_read = FALSE
	`
	_, err := s.pool.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to mark all notifications as read: %w", err)
	}
	return nil
}

// NotifyAdmins sends a notification to all admins.
func (s *PostgresStore) NotifyAdmins(ctx context.Context, notifType, message string, relatedID *uuid.UUID) error {
	query := `
		INSERT INTO notifications (user_id, type, message, related_id)
		SELECT id, $1, $2, $3 FROM users WHERE role = 'admin'
	`
	var rID pgtype.UUID
	if relatedID != nil {
		rID = pgtype.UUID{Bytes: *relatedID, Valid: true}
	} else {
		rID = pgtype.UUID{Valid: false}
	}

	_, err := s.pool.Exec(ctx, query, notifType, message, rID)
	if err != nil {
		return fmt.Errorf("failed to notify admins: %w", err)
	}
	return nil
}
