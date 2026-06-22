package store

import (
	"encoding/json"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

// User represents a user in the system.
type User struct {
	ID         pgtype.UUID `db:"id" json:"id"`
	StudentID  string      `db:"student_id" json:"student_id"`
	Name       string      `db:"name" json:"name"`
	Password   string      `db:"password" json:"-"` // bcrypt hash
	Role       string      `db:"role" json:"role"`  // "student" | "verified_contributor" | "admin"
	ColorIndex int         `db:"color_index" json:"color_index"`
	XP         int         `db:"xp" json:"xp"`
	Verified   bool        `db:"verified" json:"verified"`
	VerifiedAt *time.Time  `db:"verified_at" json:"verified_at,omitempty"`
	CreatedAt  time.Time   `db:"created_at" json:"created_at"`
}

// NewUser represents a user creation request.
type NewUser struct {
	StudentID string
	Name      string
	Password  string // plaintext, will be hashed
	Role      string // "student" | "admin"
}

// Problem represents an exercise definition stored in the database.
type Problem struct {
	ID               pgtype.UUID `db:"id" json:"id"`
	Slug             string      `db:"slug" json:"slug"`
	Module           string      `db:"module" json:"module"`
	Type             string      `db:"type" json:"type"`
	Language         string      `db:"language" json:"language"`
	Title            string      `db:"title" json:"title"`
	Statement        string      `db:"statement" json:"statement"`
	FuncName         string      `db:"func_name" json:"func_name"`
	ReturnType       string      `db:"return_type" json:"return_type"`
	ParamTypes       []string    `db:"param_types" json:"param_types"`
	Hints            []string    `db:"hints" json:"hints"`
	Difficulty       int         `db:"difficulty" json:"difficulty"`
	XPReward         int         `db:"xp_reward" json:"xpReward"`
	Tags             []string    `db:"tags" json:"tags"`
	Visible          bool        `db:"visible" json:"visible"`
	SourceHash       string      `db:"source_hash" json:"source_hash"`
	RawReadme        string      `db:"raw_readme" json:"raw_readme"`
	AuthorID         pgtype.UUID `db:"author_id" json:"author_id,omitempty"`
	AuthorName       *string     `db:"author_name" json:"author_name,omitempty"`
	CreatedAt        time.Time   `db:"created_at" json:"created_at"`
	UpdatedAt        time.Time   `db:"updated_at" json:"updated_at"`
	Solved           bool        `json:"solved"`
	Stars            int         `json:"stars"`
	Attempts         int         `json:"attempts"`
	TotalSubmissions int         `json:"total_submissions"`
	SuccessRate      float64     `json:"success_rate"`
	AvgRuntimeMs     int         `json:"avg_runtime_ms"`
	EstTimeMinutes   int         `json:"estTimeMinutes"`
	Examples         []TestCase  `json:"examples"`
}

// TestCase represents a single problem test case.
type TestCase struct {
	ID        pgtype.UUID `db:"id" json:"id"`
	ProblemID pgtype.UUID `db:"problem_id" json:"problem_id"`
	Input     []byte      `db:"input" json:"input"`
	Expected  string      `db:"expected" json:"expected"`
	IsHidden  bool        `db:"is_hidden" json:"is_hidden"`
	Ordinal   int         `db:"ordinal" json:"ordinal"`
}

// Submission represents a graded solution attempt.
type Submission struct {
	ID          pgtype.UUID `db:"id" json:"id"`
	UserID      pgtype.UUID `db:"user_id" json:"user_id"`
	ProblemID   pgtype.UUID `db:"problem_id" json:"problem_id"`
	Language    string      `db:"language" json:"language"`
	Code        string      `db:"code" json:"code"`
	Status      string      `db:"status" json:"status"`
	PassedCount int         `db:"passed_count" json:"passed_count"`
	TotalCount  int         `db:"total_count" json:"total_count"`
	OutputLogs  string      `db:"output_logs" json:"output_logs"`
	RuntimeMs   int         `db:"runtime_ms" json:"runtime_ms"`
	CreatedAt   time.Time   `db:"created_at" json:"created_at"`
}

// Progress represents a user's progress on a problem.
type Progress struct {
	UserID      pgtype.UUID `db:"user_id"`
	ProblemID   pgtype.UUID `db:"problem_id"`
	Solved      bool        `db:"solved"`
	Stars       int         `db:"stars"`
	Attempts    int         `db:"attempts"`
	BestRuntime int         `db:"best_runtime"`
	XPAwarded   int         `db:"xp_awarded"`
}

// ActivityLog represents a system event for the admin dashboard.
type ActivityLog struct {
	ID        pgtype.UUID `db:"id" json:"id"`
	Type      string      `db:"type" json:"type"` // e.g. "success", "info", "warning", "error"
	Message   string      `db:"message" json:"message"`
	Color     string      `db:"color" json:"color"`
	Icon      string      `db:"icon" json:"icon"`
	CreatedAt time.Time   `db:"created_at" json:"created_at"`
}

// AdminStats represents the aggregation counters for the admin dashboard.
type AdminStats struct {
	TotalProblems    int `json:"total_problems"`
	ActiveProblems   int `json:"active_problems"`
	TotalSubmissions int `json:"total_submissions"`
}

// LeaderboardUser represents the embedded user in a leaderboard entry.
type LeaderboardUser struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	StudentID   string `json:"studentId"`
	Role        string `json:"role"`
	ColorIndex  int    `json:"colorIndex"`
	XP          int    `json:"xp"`
	Level       int    `json:"level"`
	SolvedCount int    `json:"solvedCount"`
}

// LeaderboardEntry represents a single row on the leaderboard.
type LeaderboardEntry struct {
	Rank       int             `json:"rank"`
	User       LeaderboardUser `json:"user"`
	BestTimeMs int             `json:"bestTimeMs"`
	RankDelta  int             `json:"rankDelta"`
}

// DifficultyProgress represents progress for a single difficulty level.
type DifficultyProgress struct {
	Solved int `json:"solved"`
	Total  int `json:"total"`
}

// UserStats represents aggregated statistics for a user's profile.
type UserStats struct {
	SolvedCount       int                           `json:"solved_count"`
	AttemptedCount    int                           `json:"attempted_count"`
	AverageStars      float64                       `json:"average_stars"`
	BestRuntimeMs     int                           `json:"best_runtime_ms"`
	CurrentStreakDays int                           `json:"current_streak_days"`
	ProgressByDiff    map[string]DifficultyProgress `json:"progress_by_difficulty"`
}

// UserProblemTestCase represents an embedded test case in a UserProblem payload.
type UserProblemTestCase struct {
	Input    json.RawMessage `json:"input"`
	Expected string          `json:"expected"`
	IsHidden bool            `json:"is_hidden"`
	Ordinal  int             `json:"ordinal"`
}

// UserProblem represents a staging problem submitted by a verified contributor.
type UserProblem struct {
	ID         pgtype.UUID           `db:"id" json:"id"`
	UserID     pgtype.UUID           `db:"user_id" json:"user_id"`
	Slug       string                `db:"slug" json:"slug"`
	Title      string                `db:"title" json:"title"`
	Statement  string                `db:"statement" json:"statement"`
	FuncName   string                `db:"func_name" json:"func_name"`
	ReturnType string                `db:"return_type" json:"return_type"`
	ParamTypes []string              `db:"param_types" json:"param_types"`
	Hints      []string              `db:"hints" json:"hints"`
	Difficulty int                   `db:"difficulty" json:"difficulty"`
	XPReward   int                   `db:"xp_reward" json:"xp_reward"`
	Tags       []string              `db:"tags" json:"tags"`
	TestCases  []UserProblemTestCase `db:"test_cases" json:"test_cases"`
	Status     string                `db:"status" json:"status"` // pending | approved | rejected
	AdminNotes *string               `db:"admin_notes" json:"admin_notes,omitempty"`
	CreatedAt  time.Time             `db:"created_at" json:"created_at"`
	ReviewedAt *time.Time            `db:"reviewed_at" json:"reviewed_at,omitempty"`
}

// Notification represents an alert for a user.
type Notification struct {
	ID        pgtype.UUID  `db:"id" json:"id"`
	UserID    pgtype.UUID  `db:"user_id" json:"user_id"`
	Type      string       `db:"type" json:"type"`
	Message   string       `db:"message" json:"message"`
	RelatedID *pgtype.UUID `db:"related_id" json:"related_id,omitempty"`
	IsRead    bool         `db:"is_read" json:"is_read"`
	CreatedAt time.Time    `db:"created_at" json:"created_at"`
}

// NewUserProblem is the payload for creating a community contribution.
type NewUserProblem struct {
	Slug       string                `json:"slug"`
	Title      string                `json:"title"`
	Statement  string                `json:"statement"`
	FuncName   string                `json:"func_name"`
	ReturnType string                `json:"return_type"`
	ParamTypes []string              `json:"param_types"`
	Hints      []string              `json:"hints"`
	Difficulty int                   `json:"difficulty"`
	XPReward   int                   `json:"xp_reward"`
	Tags       []string              `json:"tags"`
	TestCases  []UserProblemTestCase `json:"test_cases"`
}
