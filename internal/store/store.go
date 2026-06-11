package store


import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Store defines the interface for all database operations.
type Store interface {
	// User operations
	CreateUser(ctx context.Context, user *NewUser) (*User, error)
	GetUserByStudentID(ctx context.Context, studentID string) (*User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*User, error)

	// Add more interfaces as phases progress
}

// PostgresStore implements Store using pgx and Postgres.
type PostgresStore struct {
	pool *pgxpool.Pool
}

// NewPostgresStore creates a new PostgresStore and verifies the connection.
func NewPostgresStore(ctx context.Context, databaseURL string) (*PostgresStore, error) {
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to create pgxpool: %w", err)
	}

	// Ping the database to ensure connectivity
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &PostgresStore{
		pool: pool,
	}, nil
}

// Close closes the connection pool.
func (s *PostgresStore) Close() {
	if s.pool != nil {
		s.pool.Close()
	}
}
