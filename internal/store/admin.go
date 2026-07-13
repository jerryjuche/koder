package store

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

// LogActivity inserts a new activity log event into the database.
func (s *PostgresStore) LogActivity(ctx context.Context, logType, message, color, icon string) error {
	query := `
		INSERT INTO activity_logs (type, message, color, icon)
		VALUES ($1, $2, $3, $4)
	`
	_, err := s.pool.Exec(ctx, query, logType, message, color, icon)
	if err != nil {
		return fmt.Errorf("failed to log activity: %w", err)
	}
	return nil
}

// GetRecentActivity fetches the latest activity logs for the dashboard.
func (s *PostgresStore) GetRecentActivity(ctx context.Context, limit int) ([]ActivityLog, error) {
	query := `
		SELECT id, type, message, color, icon, created_at
		FROM activity_logs
		ORDER BY created_at DESC
		LIMIT $1
	`
	rows, err := s.pool.Query(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query activity logs: %w", err)
	}
	defer rows.Close()

	var logs []ActivityLog
	for rows.Next() {
		var log ActivityLog
		if err := rows.Scan(&log.ID, &log.Type, &log.Message, &log.Color, &log.Icon, &log.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan activity log: %w", err)
		}
		logs = append(logs, log)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("activity logs rows error: %w", err)
	}

	// Ensure we return an empty array, not null
	if logs == nil {
		logs = make([]ActivityLog, 0)
	}
	return logs, nil
}

// GetAdminStats calculates total counts for the admin dashboard.
func (s *PostgresStore) GetAdminStats(ctx context.Context) (*AdminStats, error) {
	var stats AdminStats

	query := `
		SELECT 
			(SELECT COUNT(*) FROM problems),
			(SELECT COUNT(*) FROM problems WHERE visible = true),
			(SELECT COUNT(*) FROM submissions)
	`
	err := s.pool.QueryRow(ctx, query).Scan(
		&stats.TotalProblems, &stats.ActiveProblems, &stats.TotalSubmissions,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to calculate admin stats: %w", err)
	}

	// AI usage stats — graceful if table doesn't exist
	todayStart := time.Now().Truncate(24 * time.Hour)
	aiQuery := `
		SELECT
			(SELECT COUNT(*) FROM ai_usage_logs),
			(SELECT COUNT(*) FROM ai_usage_logs WHERE created_at >= $1)
	`
	if err := s.pool.QueryRow(ctx, aiQuery, todayStart).Scan(
		&stats.TotalAICalls, &stats.AICallsToday,
	); err != nil {
		if isRelationNotExist(err) {
			stats.TotalAICalls = 0
			stats.AICallsToday = 0
		} else {
			return nil, fmt.Errorf("failed to calculate admin stats: %w", err)
		}
	}

	return &stats, nil
}

func isRelationNotExist(err error) bool {
	return err != nil && strings.Contains(err.Error(), "does not exist")
}

// SearchUsers finds users by name or username using case-insensitive matching.
func (s *PostgresStore) SearchUsers(ctx context.Context, query string, limit int) ([]UserSearchResult, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	sql := `
		SELECT id, name, username, email, role, verified, google_avatar_url, created_at
		FROM users
		WHERE name ILIKE $1 OR username ILIKE $1
		ORDER BY name ASC
		LIMIT $2
	`
	pattern := "%" + query + "%"

	rows, err := s.pool.Query(ctx, sql, pattern, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to search users: %w", err)
	}
	defer rows.Close()

	var users []UserSearchResult
	for rows.Next() {
		var u UserSearchResult
		if err := rows.Scan(
			&u.ID, &u.Name, &u.Username, &u.Email, &u.Role,
			&u.Verified, &u.GoogleAvatarURL, &u.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan user search result: %w", err)
		}
		users = append(users, u)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("user search rows error: %w", err)
	}
	if users == nil {
		users = make([]UserSearchResult, 0)
	}
	return users, nil
}

// ToggleUserVerified flips the verified flag for a user and returns the new state.
func (s *PostgresStore) ToggleUserVerified(ctx context.Context, userID uuid.UUID) (bool, error) {
	var verified bool
	err := s.pool.QueryRow(ctx, `
		UPDATE users SET verified = NOT verified WHERE id = $1 RETURNING verified
	`, userID).Scan(&verified)
	if err != nil {
		return false, fmt.Errorf("failed to toggle user verified: %w", err)
	}
	return verified, nil
}
