package store

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"golang.org/x/crypto/bcrypt"
)

// CreateUser inserts a new user into the database with a bcrypt-hashed password.
// Returns the created user with its generated ID.
func (s *PostgresStore) CreateUser(ctx context.Context, user *NewUser) (*User, error) {
	if user == nil {
		return nil, fmt.Errorf("user cannot be nil")
	}

	// Hash the plaintext password with bcrypt cost=12
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), 12)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Validate role
	if user.Role != "student" && user.Role != "admin" {
		return nil, fmt.Errorf("invalid role: %s", user.Role)
	}

	var userID pgtype.UUID
	var createdAt pgtype.Timestamp

	// Assign a stable design token index between 0 and 5 for avatar colors.
	colorIndexBig, err := rand.Int(rand.Reader, big.NewInt(6))
	if err != nil {
		return nil, fmt.Errorf("failed to assign color index: %w", err)
	}
	colorIndex := int(colorIndexBig.Int64())

	// Insert into database with parameterized query
	query := `
		INSERT INTO users (student_id, name, password, role, color_index, xp, created_at)
		VALUES ($1, $2, $3, $4, $5, 0, NOW())
		RETURNING id, created_at
	`

	err = s.pool.QueryRow(ctx, query, user.StudentID, user.Name, string(hashedPassword), user.Role, colorIndex).
		Scan(&userID, &createdAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return &User{
		ID:         userID,
		StudentID:  user.StudentID,
		Name:       user.Name,
		Password:   string(hashedPassword),
		Role:       user.Role,
		ColorIndex: colorIndex,
		XP:         0,
		CreatedAt:  createdAt.Time,
	}, nil
}

// GetUserByStudentID retrieves a user by their student ID.
func (s *PostgresStore) GetUserByStudentID(ctx context.Context, studentID string) (*User, error) {
	if studentID == "" {
		return nil, fmt.Errorf("studentID cannot be empty")
	}

	user := &User{}

	query := `
		SELECT id, student_id, name, password, role, color_index, xp, created_at
		FROM users
		WHERE student_id = $1
	`

	err := s.pool.QueryRow(ctx, query, studentID).Scan(
		&user.ID,
		&user.StudentID,
		&user.Name,
		&user.Password,
		&user.Role,
		&user.ColorIndex,
		&user.XP,
		&user.CreatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("user not found: %w", err)
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// GetUserByID retrieves a user by their UUID.
func (s *PostgresStore) GetUserByID(ctx context.Context, id uuid.UUID) (*User, error) {
	if id == uuid.Nil {
		return nil, fmt.Errorf("id cannot be nil")
	}

	user := &User{}

	query := `
		SELECT id, student_id, name, password, role, color_index, xp, created_at
		FROM users
		WHERE id = $1
	`

	err := s.pool.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.StudentID,
		&user.Name,
		&user.Password,
		&user.Role,
		&user.ColorIndex,
		&user.XP,
		&user.CreatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("user not found: %w", err)
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// UpdateUserRole updates the role for a user by UUID.
func (s *PostgresStore) UpdateUserRole(ctx context.Context, id uuid.UUID, role string) error {
	if id == uuid.Nil {
		return fmt.Errorf("id cannot be nil")
	}
	if role != "admin" && role != "student" {
		return fmt.Errorf("invalid role: %s", role)
	}

	query := `
		UPDATE users
		SET role = $1
		WHERE id = $2
	`

	cmdTag, err := s.pool.Exec(ctx, query, role, id)
	if err != nil {
		return fmt.Errorf("failed to update user role: %w", err)
	}

	if cmdTag.RowsAffected() == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// GetLeaderboard fetches the top users ranked by XP, then solved count.
func (s *PostgresStore) GetLeaderboard(ctx context.Context, period string) ([]LeaderboardEntry, error) {
	var query string

	if period == "weekly" || period == "monthly" {
		interval := "7 days"
		if period == "monthly" {
			interval = "30 days"
		}
		query = fmt.Sprintf(`
			SELECT 
				u.id, u.name, u.student_id, u.role, u.color_index,
				COALESCE(SUM(pr.xp_reward), 0) as xp,
				COUNT(DISTINCT sub.problem_id) as solved_count,
				COALESCE(MIN(sub.runtime_ms), 0) as best_time_ms
			FROM users u
			LEFT JOIN (
				SELECT user_id, problem_id, MIN(runtime_ms) as runtime_ms
				FROM submissions
				WHERE status = 'passed' AND created_at >= NOW() - INTERVAL '%s'
				GROUP BY user_id, problem_id
			) sub ON u.id = sub.user_id
			LEFT JOIN problems pr ON sub.problem_id = pr.id
			WHERE u.role != 'admin'
			GROUP BY u.id
			ORDER BY xp DESC, solved_count DESC
			LIMIT 100
		`, interval)
	} else {
		// All time
		query = `
			SELECT 
				u.id, u.name, u.student_id, u.role, u.color_index, u.xp,
				COUNT(p.problem_id) FILTER (WHERE p.solved) as solved_count,
				COALESCE(MIN(p.best_runtime) FILTER (WHERE p.solved), 0) as best_time_ms
			FROM users u
			LEFT JOIN progress p ON u.id = p.user_id
			WHERE u.role != 'admin'
			GROUP BY u.id
			ORDER BY u.xp DESC, solved_count DESC
			LIMIT 100
		`
	}

	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query leaderboard: %w", err)
	}
	defer rows.Close()

	var entries []LeaderboardEntry
	rank := 1
	for rows.Next() {
		var uID pgtype.UUID
		var u LeaderboardUser
		var bestTime int

		err := rows.Scan(
			&uID, &u.Name, &u.StudentID, &u.Role, &u.ColorIndex, &u.XP,
			&u.SolvedCount, &bestTime,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan leaderboard row: %w", err)
		}

		if uID.Valid {
			u.ID = uuid.UUID(uID.Bytes).String()
		}

		u.Level = (u.XP / 1000) + 1

		entries = append(entries, LeaderboardEntry{
			Rank:       rank,
			User:       u,
			BestTimeMs: bestTime,
			RankDelta:  0, // RankDelta would require historical snapshots, just pass 0 for now.
		})
		rank++
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("leaderboard rows iteration error: %w", err)
	}

	return entries, nil
}

// GetSolvedCount returns the number of problems a user has solved.
func (s *PostgresStore) GetSolvedCount(ctx context.Context, userID uuid.UUID) (int, error) {
	var count int
	err := s.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM progress WHERE user_id = $1 AND solved = true`, userID,
	).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get solved count: %w", err)
	}
	return count, nil
}

// UpdateUserName updates the user's name by ID.
func (s *PostgresStore) UpdateUserName(ctx context.Context, id uuid.UUID, name string) error {
	if id == uuid.Nil {
		return fmt.Errorf("id cannot be nil")
	}
	if name == "" {
		return fmt.Errorf("name cannot be empty")
	}

	query := `
		UPDATE users
		SET name = $1
		WHERE id = $2
	`

	cmdTag, err := s.pool.Exec(ctx, query, name, id)
	if err != nil {
		return fmt.Errorf("failed to update user name: %w", err)
	}

	if cmdTag.RowsAffected() == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// GetUserRank returns the user's rank (1-indexed position) in the leaderboard.
func (s *PostgresStore) GetUserRank(ctx context.Context, userID uuid.UUID) (int, error) {
	var rank int
	query := `
		SELECT COUNT(*) + 1
		FROM users u
		WHERE u.role != 'admin'
		  AND (
			u.xp > (SELECT xp FROM users WHERE id = $1)
			OR (
			  u.xp = (SELECT xp FROM users WHERE id = $1)
			  AND u.id < $1
			)
		  )
	`

	err := s.pool.QueryRow(ctx, query, userID).Scan(&rank)
	if err != nil {
		return 0, fmt.Errorf("failed to get user rank: %w", err)
	}
	return rank, nil
}

// GetUserStats returns comprehensive statistics for a user's profile.
func (s *PostgresStore) GetUserStats(ctx context.Context, userID uuid.UUID) (*UserStats, error) {
	stats := &UserStats{
		ProgressByDiff: make(map[string]DifficultyProgress),
	}

	// Get attempted and solved counts, average stars, best runtime
	query1 := `
		SELECT 
			COUNT(DISTINCT p.problem_id) FILTER (WHERE p.solved) as solved_count,
			COUNT(DISTINCT CASE WHEN s.id IS NOT NULL THEN s.id END) as attempted_count,
			COALESCE(AVG(p.stars) FILTER (WHERE p.solved), 0.0) as avg_stars,
			COALESCE(MIN(p.best_runtime) FILTER (WHERE p.solved AND p.best_runtime > 0), 0) as best_runtime
		FROM progress p
		LEFT JOIN submissions s ON p.user_id = s.user_id AND p.problem_id = s.problem_id
		WHERE p.user_id = $1
	`

	err := s.pool.QueryRow(ctx, query1, userID).Scan(
		&stats.SolvedCount,
		&stats.AttemptedCount,
		&stats.AverageStars,
		&stats.BestRuntimeMs,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get basic stats: %w", err)
	}

	// Get progress by difficulty
	query2 := `
		SELECT 
			pr.difficulty,
			COUNT(DISTINCT CASE WHEN pg.solved THEN pg.problem_id END) as solved,
			COUNT(DISTINCT pr.id) as total
		FROM problems pr
		LEFT JOIN progress pg ON pr.id = pg.problem_id AND pg.user_id = $1
		WHERE pr.visible = true
		GROUP BY pr.difficulty
		ORDER BY pr.difficulty
	`

	rows, err := s.pool.Query(ctx, query2, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get difficulty progress: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var difficulty int
		var solved, total int
		if err := rows.Scan(&difficulty, &solved, &total); err != nil {
			return nil, fmt.Errorf("failed to scan difficulty progress: %w", err)
		}

		diffLabel := "easy"
		if difficulty == 2 {
			diffLabel = "medium"
		} else if difficulty == 3 {
			diffLabel = "hard"
		}

		stats.ProgressByDiff[diffLabel] = DifficultyProgress{
			Solved: solved,
			Total:  total,
		}
	}

	// Ensure all three difficulty levels exist in the map
	if _, ok := stats.ProgressByDiff["easy"]; !ok {
		stats.ProgressByDiff["easy"] = DifficultyProgress{0, 0}
	}
	if _, ok := stats.ProgressByDiff["medium"]; !ok {
		stats.ProgressByDiff["medium"] = DifficultyProgress{0, 0}
	}
	if _, ok := stats.ProgressByDiff["hard"]; !ok {
		stats.ProgressByDiff["hard"] = DifficultyProgress{0, 0}
	}

	// Calculate current streak (number of consecutive days with submissions)
	queryStreak := `
		SELECT COUNT(*) as streak_days
		FROM (
			SELECT DATE(created_at) as submission_date
			FROM submissions
			WHERE user_id = $1
			  AND created_at >= NOW() - INTERVAL '365 days'
			GROUP BY DATE(created_at)
			ORDER BY submission_date DESC
		) daily_submissions,
		(
			SELECT DATE(NOW()) - (ROW_NUMBER() OVER (ORDER BY DATE(created_at) DESC) - 1) * INTERVAL '1 day' as expected_date
			FROM submissions
			WHERE user_id = $1
			  AND created_at >= NOW() - INTERVAL '365 days'
			GROUP BY DATE(created_at)
			ORDER BY DATE(created_at) DESC
			LIMIT 1
		) streak_check
		WHERE submission_date = expected_date
	`

	err = s.pool.QueryRow(ctx, queryStreak, userID).Scan(&stats.CurrentStreakDays)
	if err != nil {
		stats.CurrentStreakDays = 0
	}

	return stats, nil
}

// GetRecentSubmissions returns the most recent submissions for a user.
func (s *PostgresStore) GetRecentSubmissions(ctx context.Context, userID uuid.UUID, limit int) ([]Submission, error) {
	if limit <= 0 {
		limit = 10
	}

	query := `
		SELECT id, user_id, problem_id, language, code, status, passed_count, total_count, output_logs, runtime_ms, created_at
		FROM submissions
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`

	rows, err := s.pool.Query(ctx, query, userID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query recent submissions: %w", err)
	}
	defer rows.Close()

	var submissions []Submission
	for rows.Next() {
		var sub Submission
		err := rows.Scan(
			&sub.ID,
			&sub.UserID,
			&sub.ProblemID,
			&sub.Language,
			&sub.Code,
			&sub.Status,
			&sub.PassedCount,
			&sub.TotalCount,
			&sub.OutputLogs,
			&sub.RuntimeMs,
			&sub.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan submission: %w", err)
		}
		submissions = append(submissions, sub)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate submissions: %w", err)
	}

	return submissions, nil
}
