package store

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
)

// CreateEmailLog records the start of a transactional email lifecycle.
func (s *PostgresStore) CreateEmailLog(ctx context.Context, resetID *uuid.UUID, email, flow string) (*EmailLog, error) {
	query := `
		INSERT INTO email_logs (reset_id, email, flow, status, attempts)
		VALUES ($1, $2, $3, 'created', 0)
		RETURNING id, reset_id, email, flow, status, provider_email_id, attempts, error, delivered_at, created_at, updated_at
	`
	var log EmailLog
	err := s.pool.QueryRow(ctx, query, resetID, email, flow).Scan(
		&log.ID, &log.ResetID, &log.Email, &log.Flow, &log.Status,
		&log.ProviderEmailID, &log.Attempts, &log.Error, &log.DeliveredAt,
		&log.CreatedAt, &log.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create email log: %w", err)
	}
	return &log, nil
}

// UpdateEmailLogStatus transitions an email log (request-side) by its id.
// providerEmailID is set on first success; errorMessage is stored when present.
func (s *PostgresStore) UpdateEmailLogStatus(ctx context.Context, logID uuid.UUID, status string, providerEmailID, errorMessage *string) error {
	query := `
		UPDATE email_logs
		SET status = $2,
			provider_email_id = COALESCE($3, provider_email_id),
			error = COALESCE($4, error),
			delivered_at = CASE WHEN $2 = 'delivered' AND delivered_at IS NULL THEN NOW() ELSE delivered_at END,
			updated_at = NOW()
		WHERE id = $1
	`
	_, err := s.pool.Exec(ctx, query, logID, status, providerEmailID, errorMessage)
	if err != nil {
		return fmt.Errorf("failed to update email log status: %w", err)
	}
	return nil
}

// UpdateEmailLogAttempts records how many send attempts were made.
func (s *PostgresStore) UpdateEmailLogAttempts(ctx context.Context, logID uuid.UUID, attempts int) error {
	query := `
		UPDATE email_logs
		SET attempts = $2, updated_at = NOW()
		WHERE id = $1
	`
	_, err := s.pool.Exec(ctx, query, logID, attempts)
	if err != nil {
		return fmt.Errorf("failed to update email log attempts: %w", err)
	}
	return nil
}

// UpdateEmailLogByProviderID transitions an email log from a webhook event,
// matched by the Resend email id. Status precedence prevents regression:
// bounced/complained/failed are terminal; delivered wins over delivery_delayed,
// which wins over sent, which wins over created.
func (s *PostgresStore) UpdateEmailLogByProviderID(ctx context.Context, providerEmailID, status string, errorMessage *string) error {
	query := `
		UPDATE email_logs
		SET status = CASE
				WHEN $2 IN ('bounced', 'complained', 'failed') THEN $2
				WHEN email_logs.status IN ('bounced', 'complained', 'failed') THEN email_logs.status
				WHEN $2 = 'delivered' THEN 'delivered'
				WHEN $2 = 'delivery_delayed' AND email_logs.status IN ('created', 'sent') THEN 'delivery_delayed'
				ELSE email_logs.status
			END,
			error = COALESCE($3, error),
			delivered_at = CASE WHEN $2 = 'delivered' AND delivered_at IS NULL THEN NOW() ELSE delivered_at END,
			updated_at = NOW()
		WHERE provider_email_id = $1
	`
	ct, err := s.pool.Exec(ctx, query, providerEmailID, status, errorMessage)
	if err != nil {
		return fmt.Errorf("failed to update email log by provider id: %w", err)
	}
	if ct.RowsAffected() == 0 {
		return fmt.Errorf("no email log found for provider id %q", providerEmailID)
	}
	return nil
}

// GetEmailLogByProviderID resolves an email log by the Resend email id. Used by
// the webhook handler to link delivery events to the originating log row.
func (s *PostgresStore) GetEmailLogByProviderID(ctx context.Context, providerEmailID string) (*EmailLog, error) {
	query := `
		SELECT id, reset_id, email, flow, status, provider_email_id, attempts, error, delivered_at, created_at, updated_at
		FROM email_logs
		WHERE provider_email_id = $1
	`
	var log EmailLog
	err := s.pool.QueryRow(ctx, query, providerEmailID).Scan(
		&log.ID, &log.ResetID, &log.Email, &log.Flow, &log.Status,
		&log.ProviderEmailID, &log.Attempts, &log.Error, &log.DeliveredAt,
		&log.CreatedAt, &log.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get email log by provider id: %w", err)
	}
	return &log, nil
}

// MarkWebhookEventProcessed records a webhook event keyed by svix_id and
// returns true if the event was new (dedupe for at-least-once delivery).
//
// payload is a string (not []byte): the pool runs in SimpleProtocol mode, where
// pgx encodes []byte as bytea (\x hex) text — invalid JSON for the payload
// column. A string is emitted as a quoted text literal, which Postgres' text →
// jsonb assignment cast parses correctly. The explicit ::jsonb cast validates
// the payload up front so malformed JSON fails with a clear error.
func (s *PostgresStore) MarkWebhookEventProcessed(ctx context.Context, svixID string, emailLogID *uuid.UUID, eventType string, payload string) (bool, error) {
	query := `
		INSERT INTO email_webhook_events (svix_id, email_log_id, event_type, payload)
		VALUES ($1, $2, $3, $4::jsonb)
		ON CONFLICT (svix_id) DO NOTHING
	`
	ct, err := s.pool.Exec(ctx, query, svixID, emailLogID, eventType, payload)
	if err != nil {
		return false, fmt.Errorf("failed to record webhook event: %w", err)
	}
	return ct.RowsAffected() > 0, nil
}

// ListEmailLogs returns email lifecycle rows, newest first, with optional
// status and email filters. Values are truncated for safe LIMIT/OFFSET use.
func (s *PostgresStore) ListEmailLogs(ctx context.Context, limit, offset int, status, emailFilter string) ([]EmailLog, error) {
	var sb strings.Builder
	sb.WriteString(`
		SELECT id, reset_id, email, flow, status, provider_email_id, attempts, error, delivered_at, created_at, updated_at
		FROM email_logs
		WHERE 1 = 1
	`)
	args := []interface{}{}
	argIdx := 1

	if status != "" {
		sb.WriteString(fmt.Sprintf(" AND status = $%d", argIdx))
		args = append(args, status)
		argIdx++
	}
	if emailFilter != "" {
		sb.WriteString(fmt.Sprintf(" AND LOWER(email) LIKE $%d", argIdx))
		args = append(args, "%"+strings.ToLower(emailFilter)+"%")
		argIdx++
	}

	if limit <= 0 {
		limit = 50
	}
	if limit > 200 {
		limit = 200
	}
	sb.WriteString(" ORDER BY created_at DESC")
	sb.WriteString(fmt.Sprintf(" LIMIT $%d", argIdx))
	args = append(args, limit)
	argIdx++
	if offset < 0 {
		offset = 0
	}
	sb.WriteString(fmt.Sprintf(" OFFSET $%d", argIdx))
	args = append(args, offset)

	rows, err := s.pool.Query(ctx, sb.String(), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list email logs: %w", err)
	}
	defer rows.Close()

	logs := []EmailLog{}
	for rows.Next() {
		var log EmailLog
		if err := rows.Scan(
			&log.ID, &log.ResetID, &log.Email, &log.Flow, &log.Status,
			&log.ProviderEmailID, &log.Attempts, &log.Error, &log.DeliveredAt,
			&log.CreatedAt, &log.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan email log: %w", err)
		}
		logs = append(logs, log)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate email logs: %w", err)
	}
	return logs, nil
}
