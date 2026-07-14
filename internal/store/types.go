package store

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

// User represents a user in the system.
type User struct {
	ID             pgtype.UUID `db:"id" json:"id"`
	StudentID      string      `db:"student_id" json:"student_id"`
	Username       string      `db:"username" json:"username"`
	Name           string      `db:"name" json:"name"`
	Bio            *string     `db:"bio" json:"bio,omitempty"`
	Email          *string     `db:"email" json:"email,omitempty"`
	Password       string      `db:"password" json:"-"` // bcrypt hash (or placeholder for OAuth users)
	Role           string      `db:"role" json:"role"`  // "student" | "verified_contributor" | "admin"
	ColorIndex     int         `db:"color_index" json:"color_index"`
	XP             int         `db:"xp" json:"xp"`
	Verified       bool        `db:"verified" json:"verified"`
	VerifiedAt     *time.Time  `db:"verified_at" json:"verified_at,omitempty"`
	GoogleID       *string     `db:"google_id" json:"-"`
	GoogleEmail    *string     `db:"google_email" json:"-"`
	GoogleAvatarURL *string   `db:"google_avatar_url" json:"google_avatar_url,omitempty"`
	PINHash        *string     `db:"pin_hash" json:"-"`
	UsernameSet    bool        `db:"username_set" json:"username_set"`
	PrimaryLanguage string      `db:"primary_language" json:"primary_language"`
	CreatedAt      time.Time   `db:"created_at" json:"created_at"`
}

// FlexibleBool accepts both JSON boolean and string ("true"/"false").
type FlexibleBool bool

func (b *FlexibleBool) UnmarshalJSON(data []byte) error {
	switch string(data) {
	case "true", `"true"`:
		*b = true
	case "false", `"false"`:
		*b = false
	default:
		return fmt.Errorf("FlexibleBool: cannot unmarshal %s", string(data))
	}
	return nil
}

// FlexibleStrings accepts both a single JSON string and an array of strings.
type FlexibleStrings []string

func (fs *FlexibleStrings) UnmarshalJSON(data []byte) error {
	if len(data) == 0 {
		return nil
	}
	if data[0] == '[' {
		var arr []string
		if err := json.Unmarshal(data, &arr); err != nil {
			return err
		}
		*fs = FlexibleStrings(arr)
		return nil
	}
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	*fs = FlexibleStrings{s}
	return nil
}

// GoogleUserInfo represents the user info from Google's ID token.
type GoogleUserInfo struct {
	Sub           string       `json:"sub"`
	Email         string       `json:"email"`
	Name          string       `json:"name"`
	Picture       string       `json:"picture"`
	EmailVerified FlexibleBool `json:"email_verified"`
	Audience      string       `json:"aud"`
}

// NewUser represents a user creation request.
type NewUser struct {
	StudentID        string
	Username         string
	Name             string
	Email            *string
	Password         string // plaintext, will be hashed (empty for Google-only users)
	PINHash          string // bcrypt hash of 6-digit PIN (empty for Google-only users)
	Role             string // "student" | "admin"
	UsernameSet      bool
	PrimaryLanguage  string  // default "go"
	GoogleID         string  // Google sub for OAuth users
	GoogleAvatarURL  string  // Google avatar URL
}

// Problem represents an exercise definition stored in the database.
type Problem struct {
	ID               pgtype.UUID `db:"id" json:"id"`
	Slug             string      `db:"slug" json:"slug"`
	Module           string      `db:"module" json:"module"`
	Type             string      `db:"type" json:"type"`
	Language         string      `db:"language" json:"language"`
	LanguageVersions map[string]LanguageSpec `db:"language_versions" json:"language_versions"`
	Title            string      `db:"title" json:"title"`
	Statement        string      `db:"statement" json:"statement"`
	Constraints      string      `db:"constraints" json:"constraints"`
	LearningObjective string    `db:"learning_objective" json:"learningObjective"`
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

// LanguageSpec holds per-language function metadata for a problem.
type LanguageSpec struct {
	FuncName   string         `json:"func_name"`
	ReturnType string         `json:"return_type"`
	ParamTypes FlexibleStrings `json:"param_types"`
}

// TestCase represents a single problem test case.
type TestCase struct {
	ID        pgtype.UUID `db:"id" json:"id"`
	ProblemID pgtype.UUID `db:"problem_id" json:"problem_id"`
	Input     json.RawMessage `db:"input" json:"input"`
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
	TotalAICalls     int `json:"total_ai_calls"`
	AICallsToday     int `json:"ai_calls_today"`
}

// LeaderboardUser represents the embedded user in a leaderboard entry.
type LeaderboardUser struct {
	ID              string  `json:"id"`
	Name            string  `json:"name"`
	StudentID       string  `json:"studentId"`
	Username        string  `json:"username"`
	Role            string  `json:"role"`
	ColorIndex      int     `json:"colorIndex"`
	XP              int     `json:"xp"`
	Level           int     `json:"level"`
	SolvedCount     int     `json:"solvedCount"`
	Streak          int     `json:"streak"`
	Verified        bool    `json:"verified"`
	GoogleAvatarURL *string `json:"google_avatar_url,omitempty"`
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

// PublicUserData is a safe subset of user data for the hover card endpoint.
type PublicUserData struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Username    string  `json:"username"`
	Role        string  `json:"role"`
	ColorIndex  int     `json:"color_index"`
	XP          int     `json:"xp"`
	Level       int     `json:"level"`
	SolvedCount int     `json:"solved_count"`
	Streak      int     `json:"streak"`
	AvatarURL   *string `json:"google_avatar_url,omitempty"`
	Verified    bool    `json:"verified"`
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
	ID               pgtype.UUID           `db:"id" json:"id"`
	UserID           pgtype.UUID           `db:"user_id" json:"user_id"`
	Slug             string                `db:"slug" json:"slug"`
	Title            string                `db:"title" json:"title"`
	Statement        string                `db:"statement" json:"statement"`
	FuncName         string                `db:"func_name" json:"func_name"`
	ReturnType       string                `db:"return_type" json:"return_type"`
	ParamTypes       []string              `db:"param_types" json:"param_types"`
	LanguageVersions *map[string]LanguageSpec `db:"language_versions" json:"language_versions,omitempty"`
	Hints            []string              `db:"hints" json:"hints"`
	Difficulty       int                   `db:"difficulty" json:"difficulty"`
	XPReward         int                   `db:"xp_reward" json:"xp_reward"`
	Tags             []string              `db:"tags" json:"tags"`
	TestCases        []UserProblemTestCase `db:"test_cases" json:"test_cases"`
	Status           string                `db:"status" json:"status"` // pending | approved | rejected
	AdminNotes       *string               `db:"admin_notes" json:"admin_notes,omitempty"`
	CreatedAt        time.Time             `db:"created_at" json:"created_at"`
	ReviewedAt       *time.Time            `db:"reviewed_at" json:"reviewed_at,omitempty"`
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
	Slug             string                     `json:"slug"`
	Title            string                     `json:"title"`
	Statement        string                     `json:"statement"`
	FuncName         string                     `json:"func_name"`
	ReturnType       string                     `json:"return_type"`
	ParamTypes       []string                   `json:"param_types"`
	LanguageVersions *map[string]LanguageSpec   `json:"language_versions,omitempty"`
	Hints            []string                   `json:"hints"`
	Difficulty       int                        `json:"difficulty"`
	XPReward         int                        `json:"xp_reward"`
	Tags             []string                   `json:"tags"`
	TestCases        []UserProblemTestCase      `json:"test_cases"`
}

// Feedback represents a user-submitted feedback or bug report.
type Feedback struct {
	ID            pgtype.UUID `db:"id" json:"id"`
	UserID        pgtype.UUID `db:"user_id" json:"user_id"`
	Type          string      `db:"type" json:"type"`
	Title         string      `db:"title" json:"title"`
	Description   string      `db:"description" json:"description"`
	Priority      string      `db:"priority" json:"priority"`
	ScreenshotURL *string     `db:"screenshot_url" json:"screenshot_url,omitempty"`
	Status        string      `db:"status" json:"status"`
	AdminNotes    *string     `db:"admin_notes" json:"admin_notes,omitempty"`
	IsAnonymous   bool        `db:"is_anonymous" json:"is_anonymous"`
	ProblemSlug   *string     `db:"problem_slug" json:"problem_slug,omitempty"`
	CodeSnippet   *string     `db:"code_snippet" json:"code_snippet,omitempty"`
	ErrorMessage  *string     `db:"error_message" json:"error_message,omitempty"`
	ProblemTitle  *string     `db:"problem_title" json:"problem_title,omitempty"`
	CreatedAt     time.Time   `db:"created_at" json:"created_at"`
	UserName      *string     `db:"user_name" json:"user_name,omitempty"`
}

// NewFeedback is the payload for creating a feedback entry.
type NewFeedback struct {
	Type          string  `json:"type"`
	Title         string  `json:"title"`
	Description   string  `json:"description"`
	Priority      string  `json:"priority"`
	ScreenshotURL *string `json:"screenshot_url,omitempty"`
	IsAnonymous   bool    `json:"is_anonymous"`
	ProblemSlug   *string `json:"problem_slug,omitempty"`
	CodeSnippet   *string `json:"code_snippet,omitempty"`
	ErrorMessage  *string `json:"error_message,omitempty"`
}

// Broadcast represents an admin-created broadcast message sent to all users.
type Broadcast struct {
	ID         pgtype.UUID `db:"id" json:"id"`
	Type       string      `db:"type" json:"type"`
	Priority   string      `db:"priority" json:"priority"`
	Title      string      `db:"title" json:"title"`
	Message    string      `db:"message" json:"message"`
	ActionLabel *string    `db:"action_label" json:"action_label,omitempty"`
	ActionURL  *string    `db:"action_url" json:"action_url,omitempty"`
	Active     bool        `db:"active" json:"active"`
	CreatedBy  pgtype.UUID `db:"created_by" json:"created_by"`
	CreatedAt  time.Time   `db:"created_at" json:"created_at"`
	UpdatedAt  time.Time   `db:"updated_at" json:"updated_at"`
	UserName   *string     `db:"user_name" json:"user_name,omitempty"`
}

// NewBroadcast is the payload for creating a broadcast.
type NewBroadcast struct {
	Type        string  `json:"type"`
	Priority    string  `json:"priority,omitempty"`
	Title       string  `json:"title"`
	Message     string  `json:"message,omitempty"`
	ActionLabel *string `json:"action_label,omitempty"`
	ActionURL   *string `json:"action_url,omitempty"`
}

// CommunitySolution represents a submission returned for the community solutions/best practices view.
type CommunitySolution struct {
	ID            pgtype.UUID `json:"id"`
	UserID        pgtype.UUID `json:"user_id"`
	UserName      string      `json:"user_name"`
	UserAvatarURL *string     `json:"user_avatar_url,omitempty"`
	Verified      bool        `json:"verified"`
	ProblemID     pgtype.UUID `json:"problem_id"`
	ProblemSlug   string      `json:"problem_slug,omitempty"`
	Language      string      `json:"language"`
	Code          string      `json:"code"`
	RuntimeMs     int         `json:"runtime_ms"`
	Likes         int         `json:"likes"`
	HasLiked      bool        `json:"has_liked"`
	CreatedAt     time.Time   `json:"created_at"`
}

// AIUsageLog records a single AI assist call for monitoring and billing.
type AIUsageLog struct {
	ID             pgtype.UUID `db:"id" json:"id"`
	UserID         pgtype.UUID `db:"user_id" json:"user_id"`
	Action         string      `db:"action" json:"action"`
	ProblemSlug    string      `db:"problem_slug" json:"problem_slug"`
	TokensIn       int         `db:"tokens_in" json:"tokens_in"`
	TokensOut      int         `db:"tokens_out" json:"tokens_out"`
	ResponseTimeMs int         `db:"response_time_ms" json:"response_time_ms"`
	Success        bool        `db:"success" json:"success"`
	ErrorMessage   *string     `db:"error_message" json:"error_message,omitempty"`
	CreatedAt      time.Time   `db:"created_at" json:"created_at"`
}

// RefreshToken represents a stored refresh token for token rotation.
type RefreshToken struct {
	ID        pgtype.UUID `db:"id" json:"id"`
	UserID    pgtype.UUID `db:"user_id" json:"user_id"`
	TokenHash string      `db:"token_hash" json:"-"`
	ExpiresAt time.Time   `db:"expires_at" json:"expires_at"`
	Revoked   bool        `db:"revoked" json:"revoked"`
	CreatedAt time.Time   `db:"created_at" json:"created_at"`
}

// UserSearchResult is a lightweight user record returned by admin user search.
type UserSearchResult struct {
	ID              pgtype.UUID `json:"id"`
	Name            string      `json:"name"`
	Username        string      `json:"username"`
	Email           string      `json:"email"`
	Role            string      `json:"role"`
	Verified        bool        `json:"verified"`
	GoogleAvatarURL *string     `json:"google_avatar_url,omitempty"`
	CreatedAt       time.Time   `json:"created_at"`
}

// ── Curriculum CMS Types ──

// Course represents a top-level curriculum grouping.
type Course struct {
	ID               pgtype.UUID `db:"id" json:"id"`
	Slug             string      `db:"slug" json:"slug"`
	Title            string      `db:"title" json:"title"`
	Description      string      `db:"description" json:"description"`
	ImageURL         *string     `db:"image_url" json:"image_url,omitempty"`
	Icon             *string     `db:"icon" json:"icon,omitempty"`
	DifficultyLevel  int         `db:"difficulty_level" json:"difficulty_level"`
	EstimatedHours   int         `db:"estimated_hours" json:"estimated_hours"`
	OrderNumber      int         `db:"order_number" json:"order_number"`
	Visible          bool        `db:"visible" json:"visible"`
	CreatedAt        time.Time   `db:"created_at" json:"created_at"`
	UpdatedAt        time.Time   `db:"updated_at" json:"updated_at"`
}

// Module represents a chapter or unit within a course.
type Module struct {
	ID          pgtype.UUID `db:"id" json:"id"`
	CourseID    pgtype.UUID `db:"course_id" json:"course_id"`
	Slug        string      `db:"slug" json:"slug"`
	Title       string      `db:"title" json:"title"`
	Description string      `db:"description" json:"description"`
	ImageURL    *string     `db:"image_url" json:"image_url,omitempty"`
	OrderNumber int         `db:"order_number" json:"order_number"`
	Visible     bool        `db:"visible" json:"visible"`
	CreatedAt   time.Time   `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time   `db:"updated_at" json:"updated_at"`
}

// Lesson represents an individual lesson within a module.
type Lesson struct {
	ID                pgtype.UUID `db:"id" json:"id"`
	ModuleID          pgtype.UUID `db:"module_id" json:"module_id"`
	Slug              string      `db:"slug" json:"slug"`
	Title             string      `db:"title" json:"title"`
	Description       string      `db:"description" json:"description"`
	RawReadme         string      `db:"raw_readme" json:"raw_readme"`
	Difficulty        int         `db:"difficulty" json:"difficulty"`
	EstimatedMinutes  int         `db:"estimated_minutes" json:"estimated_minutes"`
	XPReward          int         `db:"xp_reward" json:"xp_reward"`
	OrderNumber       int         `db:"order_number" json:"order_number"`
	Visible           bool        `db:"visible" json:"visible"`
	ProblemReferences []string    `db:"problem_references" json:"problem_references"`
	CreatedAt         time.Time   `db:"created_at" json:"created_at"`
	UpdatedAt         time.Time   `db:"updated_at" json:"updated_at"`
}

// LessonSection represents a typed, ordered content block within a lesson.
type LessonSection struct {
	ID          pgtype.UUID     `db:"id" json:"id"`
	LessonID    pgtype.UUID     `db:"lesson_id" json:"lesson_id"`
	SectionType string          `db:"section_type" json:"section_type"`
	Title       string          `db:"title" json:"title"`
	Content     string          `db:"content" json:"content"`
	Metadata    json.RawMessage `db:"metadata" json:"metadata,omitempty"`
	OrderNumber int             `db:"order_number" json:"order_number"`
	CreatedAt   time.Time       `db:"created_at" json:"created_at"`
}

// LessonPrereq represents a prerequisite edge in the lesson dependency graph.
type LessonPrereq struct {
	LessonID          pgtype.UUID `json:"lesson_id"`
	DependsOnLessonID pgtype.UUID `json:"depends_on_lesson_id"`
}

// Project represents a hands-on coding project linked to a lesson.
type Project struct {
	ID           pgtype.UUID `db:"id" json:"id"`
	LessonID     pgtype.UUID `db:"lesson_id" json:"lesson_id"`
	Slug         string      `db:"slug" json:"slug"`
	Title        string      `db:"title" json:"title"`
	Description  string      `db:"description" json:"description"`
	Requirements string      `db:"requirements" json:"requirements"`
	StarterCode  string      `db:"starter_code" json:"starter_code"`
	Difficulty   int         `db:"difficulty" json:"difficulty"`
	XPReward     int         `db:"xp_reward" json:"xp_reward"`
	Hints        []string    `db:"hints" json:"hints"`
	OrderNumber  int         `db:"order_number" json:"order_number"`
	Visible      bool        `db:"visible" json:"visible"`
	CreatedAt    time.Time   `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time   `db:"updated_at" json:"updated_at"`
}

// CourseProgress tracks a user's progress through a course.
type CourseProgress struct {
	UserID      pgtype.UUID  `db:"user_id" json:"user_id"`
	CourseID    pgtype.UUID  `db:"course_id" json:"course_id"`
	StartedAt   time.Time    `db:"started_at" json:"started_at"`
	CompletedAt *time.Time   `db:"completed_at" json:"completed_at,omitempty"`
	ProgressPct float32      `db:"progress_pct" json:"progress_pct"`
}

// LessonProgress tracks a user's completion of a single lesson.
type LessonProgress struct {
	UserID      pgtype.UUID  `db:"user_id" json:"user_id"`
	LessonID    pgtype.UUID  `db:"lesson_id" json:"lesson_id"`
	Completed   bool         `db:"completed" json:"completed"`
	XPAwarded   int          `db:"xp_awarded" json:"xp_awarded"`
	CompletedAt *time.Time   `db:"completed_at" json:"completed_at,omitempty"`
}

// ── Creation Payloads ──

// NewCourse is the payload for creating a course.
type NewCourse struct {
	Slug            string  `json:"slug"`
	Title           string  `json:"title"`
	Description     string  `json:"description,omitempty"`
	ImageURL        *string `json:"image_url,omitempty"`
	Icon            *string `json:"icon,omitempty"`
	DifficultyLevel int     `json:"difficulty_level"`
	EstimatedHours  int     `json:"estimated_hours"`
	OrderNumber     int     `json:"order_number"`
}

// NewModule is the payload for creating a module.
type NewModule struct {
	CourseID    string  `json:"course_id"`
	Slug        string  `json:"slug"`
	Title       string  `json:"title"`
	Description string  `json:"description,omitempty"`
	ImageURL    *string `json:"image_url,omitempty"`
	OrderNumber int     `json:"order_number"`
}

// NewLesson is the payload for creating a lesson.
type NewLesson struct {
	ModuleID          string   `json:"module_id"`
	Slug              string   `json:"slug"`
	Title             string   `json:"title"`
	Description       string   `json:"description,omitempty"`
	RawReadme         string   `json:"raw_readme,omitempty"`
	Difficulty        int      `json:"difficulty"`
	EstimatedMinutes  int      `json:"estimated_minutes"`
	XPReward          int      `json:"xp_reward"`
	OrderNumber       int      `json:"order_number"`
	ProblemReferences []string `json:"problem_references,omitempty"`
}

// NewLessonSection is the payload for creating a lesson section.
type NewLessonSection struct {
	SectionType string          `json:"section_type"`
	Title       string          `json:"title,omitempty"`
	Content     string          `json:"content,omitempty"`
	Metadata    json.RawMessage `json:"metadata,omitempty"`
	OrderNumber int             `json:"order_number"`
}

// NewProject is the payload for creating a project.
type NewProject struct {
	LessonID     string   `json:"lesson_id"`
	Slug         string   `json:"slug"`
	Title        string   `json:"title"`
	Description  string   `json:"description,omitempty"`
	Requirements string   `json:"requirements,omitempty"`
	StarterCode  string   `json:"starter_code,omitempty"`
	Difficulty   int      `json:"difficulty"`
	XPReward     int      `json:"xp_reward"`
	Hints        []string `json:"hints,omitempty"`
	OrderNumber  int      `json:"order_number"`
}

// QuizMetadata holds quiz question data stored in lesson_sections.metadata JSONB.
type QuizMetadata struct {
	Question      string   `json:"question"`
	Options       []string `json:"options"`
	CorrectIndex  int      `json:"correct_index"`
	Explanation   string   `json:"explanation"`
}

// ── Response Types ──

// CourseWithModules is a course with its modules, lessons, and user progress embedded.
type CourseWithModules struct {
	Course
	Modules        []Module        `json:"modules"`
	Progress       *CourseProgress `json:"progress,omitempty"`
	TotalLessons   int             `json:"total_lessons"`
	CompletedLessons int           `json:"completed_lessons"`
}

// LessonWithSections is a lesson with its sections, dependencies, projects, and progress.
type LessonWithSections struct {
	Lesson
	Sections          []LessonSection  `json:"sections"`
	Dependencies      []LessonPrereq   `json:"dependencies"`
	Projects          []Project        `json:"projects"`
	Progress          *LessonProgress  `json:"progress,omitempty"`
	PrerequisitesMet  bool             `json:"prerequisites_met"`
}

// AIUsageStats holds aggregate AI usage counts for the admin dashboard.
type AIUsageStats struct {
	TotalAICalls      int     `json:"total_ai_calls"`
	AICallsToday      int     `json:"ai_calls_today"`
	AICallsThisWeek   int     `json:"ai_calls_this_week"`
	SuccessRate       float64 `json:"success_rate"`
	AvgResponseTimeMs float64 `json:"avg_response_time_ms"`
}
