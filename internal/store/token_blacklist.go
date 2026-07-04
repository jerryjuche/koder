package store

import (
	"context"
	"time"
)

// BlacklistToken adds a JWT to the blacklist so it cannot be used again.
func (s *PostgresStore) BlacklistToken(ctx context.Context, jti string, expiresAt time.Time) error {
	_, err := s.pool.Exec(ctx,
		`INSERT INTO token_blacklist (jti, expires_at) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
		jti, expiresAt,
	)
	return err
}

// IsTokenBlacklisted checks if a JWT has been revoked.
func (s *PostgresStore) IsTokenBlacklisted(ctx context.Context, jti string) (bool, error) {
	var exists bool
	err := s.pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM token_blacklist WHERE jti = $1 AND expires_at > NOW())`,
		jti,
	).Scan(&exists)
	return exists, err
}

// CleanupExpiredBlacklistedTokens removes expired entries from the blacklist.
func (s *PostgresStore) CleanupExpiredBlacklistedTokens(ctx context.Context) error {
	_, err := s.pool.Exec(ctx,
		`DELETE FROM token_blacklist WHERE expires_at < NOW()`,
	)
	return err
}
