package store

import (
	"context"
	"time"
)

// CreatePasswordResetToken stores a hashed reset token for an email.
func (s *PostgresStore) CreatePasswordResetToken(ctx context.Context, email, tokenHash string, expiresAt time.Time) error {
	_, err := s.pool.Exec(ctx,
		`INSERT INTO password_reset_tokens (email, token_hash, expires_at) VALUES ($1, $2, $3)`,
		email, tokenHash, expiresAt,
	)
	return err
}

// GetPasswordResetToken returns the email and whether the token is valid (not expired, not used).
// Returns empty string and false if the token is invalid.
func (s *PostgresStore) GetPasswordResetToken(ctx context.Context, tokenHash string) (string, time.Time, bool, error) {
	var email string
	var expiresAt time.Time
	var used bool
	err := s.pool.QueryRow(ctx,
		`SELECT email, expires_at, used FROM password_reset_tokens WHERE token_hash = $1`,
		tokenHash,
	).Scan(&email, &expiresAt, &used)
	if err != nil {
		return "", time.Time{}, false, err
	}
	return email, expiresAt, used, nil
}

// MarkPasswordResetTokenUsed marks a reset token as consumed.
func (s *PostgresStore) MarkPasswordResetTokenUsed(ctx context.Context, tokenHash string) error {
	_, err := s.pool.Exec(ctx,
		`UPDATE password_reset_tokens SET used = TRUE WHERE token_hash = $1`,
		tokenHash,
	)
	return err
}

// CleanupExpiredPasswordResetTokens removes expired and used tokens older than 24h.
func (s *PostgresStore) CleanupExpiredPasswordResetTokens(ctx context.Context) error {
	_, err := s.pool.Exec(ctx,
		`DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR (used = TRUE AND created_at < NOW() - INTERVAL '24 hours')`,
	)
	return err
}
