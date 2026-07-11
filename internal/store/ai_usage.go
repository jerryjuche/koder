package store

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
)

func (s *PostgresStore) LogAIUsage(ctx context.Context, userID uuid.UUID, action, problemSlug string, tokensIn, tokensOut, responseTimeMs int, success bool, errorMessage string) error {
	query := `
		INSERT INTO ai_usage_logs (user_id, action, problem_slug, tokens_in, tokens_out, response_time_ms, success, error_message)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	var errMsg *string
	if errorMessage != "" {
		errMsg = &errorMessage
	}
	_, err := s.pool.Exec(ctx, query, userID, action, problemSlug, tokensIn, tokensOut, responseTimeMs, success, errMsg)
	if err != nil {
		return fmt.Errorf("failed to log AI usage: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetAIUsageStats(ctx context.Context) (*AIUsageStats, error) {
	var stats AIUsageStats

	weekStart := time.Now().AddDate(0, 0, -7)
	todayStart := time.Now().Truncate(24 * time.Hour)

	query := `
		SELECT
			COALESCE(COUNT(*), 0) AS total,
			COALESCE(COUNT(*) FILTER (WHERE created_at >= $1), 0) AS today,
			COALESCE(COUNT(*) FILTER (WHERE created_at >= $2), 0) AS week,
			COALESCE(
				AVG(CASE WHEN success THEN response_time_ms ELSE NULL END)::float8, 0
			) AS avg_ms,
			CASE
				WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE success)::numeric / COUNT(*) * 100), 1)
				ELSE 0
			END AS success_rate
		FROM ai_usage_logs
	`
	err := s.pool.QueryRow(ctx, query, todayStart, weekStart).Scan(
		&stats.TotalAICalls, &stats.AICallsToday, &stats.AICallsThisWeek,
		&stats.AvgResponseTimeMs, &stats.SuccessRate,
	)
	if err != nil {
		if isRelationNotExist(err) {
			return &AIUsageStats{}, nil
		}
		return nil, fmt.Errorf("failed to get AI usage stats: %w", err)
	}

	return &stats, nil
}
