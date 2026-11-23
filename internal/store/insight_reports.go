package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// Admin insight reports are cached per (period, question hash) so repeated
// questions — "how was today?" asked five times before lunch — cost the
// free-tier AI budget once. The snapshot is cached with the narrative so the
// prose and the numbers it cites always come from the same moment.
func (s *PostgresStore) GetAdminInsightReport(ctx context.Context, period, questionHash string, notBefore time.Time) (reportJSON, snapshotJSON []byte, model string, createdAt time.Time, err error) {
	query := `
		SELECT report, snapshot, COALESCE(model, ''), created_at
		  FROM admin_insight_reports
		 WHERE period = $1 AND question_hash = $2 AND created_at >= $3
	`
	err = s.pool.QueryRow(ctx, query, period, questionHash, notBefore).Scan(
		&reportJSON, &snapshotJSON, &model, &createdAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil, "", time.Time{}, nil
	}
	if err != nil {
		if isRelationNotExist(err) {
			return nil, nil, "", time.Time{}, nil
		}
		return nil, nil, "", time.Time{}, fmt.Errorf("failed to read admin insight report: %w", err)
	}
	return reportJSON, snapshotJSON, model, createdAt, nil
}

func (s *PostgresStore) UpsertAdminInsightReport(ctx context.Context, adminID uuid.UUID, period, questionHash, question, model string, reportJSON, snapshotJSON []byte) error {
	query := `
		INSERT INTO admin_insight_reports (admin_id, period, question_hash, question, model, report, snapshot)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (period, question_hash) DO UPDATE
		   SET admin_id = EXCLUDED.admin_id,
		       question = EXCLUDED.question,
		       model = EXCLUDED.model,
		       report = EXCLUDED.report,
		       snapshot = EXCLUDED.snapshot,
		       created_at = NOW()
	`
	if _, err := s.pool.Exec(ctx, query,
		adminID, period, questionHash, question, model, reportJSON, snapshotJSON,
	); err != nil {
		if isRelationNotExist(err) {
			return nil
		}
		return fmt.Errorf("failed to cache admin insight report: %w", err)
	}
	return nil
}

func (s *PostgresStore) CleanupExpiredAdminInsightReports(ctx context.Context, olderThan time.Time) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM admin_insight_reports WHERE created_at < $1`, olderThan)
	if err != nil {
		if isRelationNotExist(err) {
			return nil
		}
		return fmt.Errorf("failed to clean up admin insight reports: %w", err)
	}
	return nil
}
