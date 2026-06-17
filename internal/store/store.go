package store


import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Store defines the interface for all database operations.
type Store interface {
	// User operations
	CreateUser(ctx context.Context, user *NewUser) (*User, error)
	GetUserByStudentID(ctx context.Context, studentID string) (*User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*User, error)
	UpdateUserRole(ctx context.Context, id uuid.UUID, role string) error
	GetLeaderboard(ctx context.Context) ([]LeaderboardEntry, error)
	GetSolvedCount(ctx context.Context, userID uuid.UUID) (int, error)

	// Problem operations
	ListVisibleProblems(ctx context.Context, userID uuid.UUID) ([]Problem, error)
	GetProblemBySlug(ctx context.Context, slug string) (*Problem, error)
	GetProblemBySlugAny(ctx context.Context, slug string) (*Problem, error)
	ListProblemsNeedingEnrichment(ctx context.Context) ([]Problem, error)
	UpsertProblem(ctx context.Context, problem *Problem) error
	UpsertTestCasesForProblem(ctx context.Context, problemID uuid.UUID, testCases []TestCase) error
	GetTestCasesForProblem(ctx context.Context, problemID uuid.UUID) ([]TestCase, error)

	// Submission & Progress operations
	CreateSubmission(ctx context.Context, sub *Submission) error
	UpsertProgress(ctx context.Context, prog *Progress) error
	GetProblemWithTestCases(ctx context.Context, problemID uuid.UUID) (*Problem, []TestCase, error)
	ListAllProblemsAdmin(ctx context.Context) ([]Problem, error)

	// Admin operations
	GetAdminStats(ctx context.Context) (*AdminStats, error)
	LogActivity(ctx context.Context, logType, message, color, icon string) error
	GetRecentActivity(ctx context.Context, limit int) ([]ActivityLog, error)
}

// PostgresStore implements Store using pgx and Postgres.
type PostgresStore struct {
	pool *pgxpool.Pool
}

// NewPostgresStore creates a new PostgresStore and verifies the connection.
func NewPostgresStore(ctx context.Context, databaseURL string) (*PostgresStore, error) {
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database URL: %w", err)
	}

	// Disable prepared statement cache for compatibility with PgBouncer / Supabase transaction poolers
	config.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	pool, err := pgxpool.NewWithConfig(ctx, config)
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
