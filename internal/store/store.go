package store


import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// FullProfileResult holds all data returned by the GetFullProfile query.
type FullProfileResult struct {
	UserJSON             []byte
	Rank                 int
	SolvedCount          int
	AttemptedCount       int
	AverageStars         float64
	BestRuntimeMs        int
	CurrentStreakDays    int
	ProgressByDifficulty map[string]DifficultyProgress
	ModuleProficiency    map[string]DifficultyProgress
	RecentSubmissions    []Submission
}

// ActivityEntry represents a single day's activity for the contribution graph.
type ActivityEntry struct {
	Date           string `json:"date"`
	Submissions    int    `json:"submissions"`
	Solved         int    `json:"solved"`
	TestsRun       int    `json:"tests_run"`
	Level          int    `json:"level"`
}

// Store defines the interface for all database operations.
type Store interface {
	// Ping checks database connectivity.
	Ping(ctx context.Context) error

	// User operations
	CreateUser(ctx context.Context, user *NewUser) (*User, error)
	CreateUserFromGoogle(ctx context.Context, info *GoogleUserInfo) (*User, error)
	GetUserExportData(ctx context.Context, userID uuid.UUID) (map[string]any, error)
	GetUserByStudentID(ctx context.Context, studentID string) (*User, error)
	GetUserByUsername(ctx context.Context, username string) (*User, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)
	GetUserByLogin(ctx context.Context, login string) (*User, error) // checks username, email, student_id
	GetUserByID(ctx context.Context, id uuid.UUID) (*User, error)
	GetUserByGoogleID(ctx context.Context, googleID string) (*User, error)
	GetUserWithSolvedCount(ctx context.Context, id uuid.UUID) (*User, int, error)
	UpdateUserRole(ctx context.Context, id uuid.UUID, role string) error
	UpdateUserName(ctx context.Context, id uuid.UUID, name string) error
	UpdateUserProfile(ctx context.Context, id uuid.UUID, name, bio string) error
	UpdateUserUsername(ctx context.Context, id uuid.UUID, username string) error
	UpdateUserStudentID(ctx context.Context, id uuid.UUID, studentID string) error
	UpdateUserUsernameSet(ctx context.Context, id uuid.UUID, usernameSet bool) error
	CompleteUserOnboarding(ctx context.Context, id uuid.UUID, username string) error
	UpdateUserGoogleAvatar(ctx context.Context, id uuid.UUID, avatarURL string) error
	GetLeaderboard(ctx context.Context, period string) ([]LeaderboardEntry, error)
	GetSolvedCount(ctx context.Context, userID uuid.UUID) (int, error)
	GetUserRank(ctx context.Context, userID uuid.UUID) (int, error)
	GetUserStats(ctx context.Context, userID uuid.UUID) (*UserStats, error)
	GetModuleProficiency(ctx context.Context, userID uuid.UUID) (map[string]DifficultyProgress, error)
	GetRecentSubmissions(ctx context.Context, userID uuid.UUID, limit int) ([]Submission, error)
	GetFullProfile(ctx context.Context, userID uuid.UUID) (*FullProfileResult, error)
	GetUserActivity(ctx context.Context, userID uuid.UUID, year int) ([]ActivityEntry, error)
	UpdateUserProfileWithReturn(ctx context.Context, id uuid.UUID, name, bio string) (*User, error)
	UpdateUserPrimaryLanguage(ctx context.Context, id uuid.UUID, language string) error
	LinkGoogleToUser(ctx context.Context, userID uuid.UUID, info *GoogleUserInfo) error
	DeleteUser(ctx context.Context, id uuid.UUID) error

	// Problem operations
	ListVisibleProblems(ctx context.Context, userID uuid.UUID) ([]Problem, error)
	GetProblemBySlug(ctx context.Context, slug string, userID uuid.UUID) (*Problem, error)
	GetProblemBySlugAny(ctx context.Context, slug string) (*Problem, error)
	GetProblemByID(ctx context.Context, id uuid.UUID) (*Problem, error)
	ListProblemsNeedingEnrichment(ctx context.Context) ([]Problem, error)
	UpsertProblem(ctx context.Context, problem *Problem) error
	UpdateProblem(ctx context.Context, problem *Problem) (*Problem, error)
	UpdateProblemVisibility(ctx context.Context, problemID uuid.UUID, visible bool) error
	PublishAllDrafts(ctx context.Context) (int, error)
	UpsertTestCasesForProblem(ctx context.Context, problemID uuid.UUID, testCases []TestCase) error
	UpsertEnrichedProblem(ctx context.Context, problem *Problem, testCases []TestCase) error
	GetTestCasesForProblem(ctx context.Context, problemID uuid.UUID) ([]TestCase, error)
	GetVisibleTestCasesForProblem(ctx context.Context, problemID uuid.UUID) ([]TestCase, error)

	// Submission & Progress operations
	CreateSubmission(ctx context.Context, sub *Submission) error
	UpsertProgress(ctx context.Context, prog *Progress) error
	GetProblemWithTestCases(ctx context.Context, problemID uuid.UUID) (*Problem, []TestCase, error)
	ListAllProblemsAdmin(ctx context.Context) ([]Problem, error)

	// Community Solutions & Likes
	LikeSubmission(ctx context.Context, submissionID, userID uuid.UUID) error
	UnlikeSubmission(ctx context.Context, submissionID, userID uuid.UUID) error
	GetTopCommunitySolutionsForProblem(ctx context.Context, problemID, currentUserID uuid.UUID, limit int) ([]CommunitySolution, error)
	GetBestPractices(ctx context.Context, currentUserID uuid.UUID, limit int) ([]CommunitySolution, error)

	// Admin operations
	GetAdminStats(ctx context.Context) (*AdminStats, error)
	LogActivity(ctx context.Context, logType, message, color, icon string) error
	GetRecentActivity(ctx context.Context, limit int) ([]ActivityLog, error)

	// Community Contributions
	CreateUserProblem(ctx context.Context, userID uuid.UUID, problem *NewUserProblem) (*UserProblem, error)
	ListUserProblemsByUser(ctx context.Context, userID uuid.UUID) ([]UserProblem, error)
	ListPendingUserProblems(ctx context.Context) ([]UserProblem, error)
	GetUserProblemByID(ctx context.Context, id uuid.UUID) (*UserProblem, error)
	RejectUserProblem(ctx context.Context, id uuid.UUID, adminNotes string) (*UserProblem, error)
	ApproveUserProblem(ctx context.Context, id uuid.UUID, adminNotes string) (*UserProblem, *uuid.UUID, error)

	// Feedback
	CreateFeedback(ctx context.Context, userID uuid.UUID, fb *NewFeedback) (*Feedback, error)
	GetAdminFeedback(ctx context.Context, statusFilter string) ([]Feedback, error)
	GetUserFeedback(ctx context.Context, userID uuid.UUID) ([]Feedback, error)
	GetProblemReports(ctx context.Context, problemSlug string) ([]Feedback, error)
	UpdateFeedbackStatus(ctx context.Context, id uuid.UUID, status, adminNotes string) (*Feedback, error)
	CountFeedbackByStatus(ctx context.Context) (map[string]int, error)

	// Notifications
	CreateNotification(ctx context.Context, userID uuid.UUID, notifType, message string, relatedID *uuid.UUID) error
	GetUnreadNotifications(ctx context.Context, userID uuid.UUID) ([]Notification, error)
	GetRecentNotifications(ctx context.Context, userID uuid.UUID, limit int) ([]Notification, error)
	MarkNotificationAsRead(ctx context.Context, id, userID uuid.UUID) error
	MarkAllNotificationsAsRead(ctx context.Context, userID uuid.UUID) error
	NotifyAdmins(ctx context.Context, notifType, message string, relatedID *uuid.UUID) error
	NotifyAllUsers(ctx context.Context, notifType, message string, relatedID *uuid.UUID) error

	// Broadcasts
	ReplaceBroadcastNotifications(ctx context.Context, notifType, message string, relatedID *uuid.UUID) error
	CreateBroadcast(ctx context.Context, adminID uuid.UUID, nb *NewBroadcast) (*Broadcast, error)
	GetActiveBroadcasts(ctx context.Context, userID uuid.UUID) ([]Broadcast, error)
	GetAllBroadcasts(ctx context.Context) ([]Broadcast, error)
	GetBroadcastByID(ctx context.Context, id uuid.UUID) (*Broadcast, error)
	DeactivateBroadcast(ctx context.Context, id uuid.UUID) error
	ActivateBroadcast(ctx context.Context, id uuid.UUID) error
	DeleteBroadcast(ctx context.Context, id uuid.UUID) error
	MarkBroadcastDismissed(ctx context.Context, userID, broadcastID uuid.UUID) error

	// Token blacklist (JWT revocation)
	BlacklistToken(ctx context.Context, jti string, expiresAt time.Time) error
	IsTokenBlacklisted(ctx context.Context, jti string) (bool, error)
	CleanupExpiredBlacklistedTokens(ctx context.Context) error

	// AI Usage logging
	LogAIUsage(ctx context.Context, userID uuid.UUID, action, problemSlug string, tokensIn, tokensOut, responseTimeMs int, success bool, errorMessage string) error
	GetAIUsageStats(ctx context.Context) (*AIUsageStats, error)

	// Refresh tokens
	CreateRefreshToken(ctx context.Context, userID uuid.UUID, tokenHash string, expiresAt time.Time) error
	GetRefreshToken(ctx context.Context, tokenHash string) (*RefreshToken, error)
	RevokeRefreshToken(ctx context.Context, tokenID uuid.UUID) error
	RevokeAllUserRefreshTokens(ctx context.Context, userID uuid.UUID) error
	CleanupExpiredRefreshTokens(ctx context.Context) error

	// Password reset
	CreatePasswordResetToken(ctx context.Context, email, tokenHash string, expiresAt time.Time) error
	GetPasswordResetToken(ctx context.Context, tokenHash string) (string, time.Time, bool, error)
	MarkPasswordResetTokenUsed(ctx context.Context, tokenHash string) error
	UpdateUserPassword(ctx context.Context, userID uuid.UUID, passwordHash string) error
	UpdateUserPINHash(ctx context.Context, userID uuid.UUID, pinHash string) error
	CleanupExpiredPasswordResetTokens(ctx context.Context) error
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

	// Connection pool limits — stay within Supabase free tier's 15-connection ceiling
	config.MaxConns = 10
	config.MinConns = 2
	config.MaxConnLifetime = 30 * time.Minute
	config.MaxConnIdleTime = 5 * time.Minute

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

// Ping checks database connectivity.
func (s *PostgresStore) Ping(ctx context.Context) error {
	return s.pool.Ping(ctx)
}

// Close closes the connection pool.
func (s *PostgresStore) Close() {
	if s.pool != nil {
		s.pool.Close()
	}
}
