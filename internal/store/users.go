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
	email := user.Email
	query := `
		INSERT INTO users (student_id, username, name, email, password, role, color_index, xp, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 0, NOW())
		RETURNING id, created_at
	`

	err = s.pool.QueryRow(ctx, query, user.StudentID, user.Username, user.Name, email, string(hashedPassword), user.Role, colorIndex).
		Scan(&userID, &createdAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return &User{
		ID:         userID,
		StudentID:  user.StudentID,
		Username:   user.Username,
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
		SELECT id, student_id, username, name, bio, email, password, role, color_index, xp,
		       google_id, google_email, google_avatar_url, created_at
		FROM users
		WHERE student_id = $1
	`

	err := s.pool.QueryRow(ctx, query, studentID).Scan(
		&user.ID,
		&user.StudentID,
		&user.Username,
		&user.Name,
		&user.Bio,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.ColorIndex,
		&user.XP,
		&user.GoogleID,
		&user.GoogleEmail,
		&user.GoogleAvatarURL,
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
		SELECT id, student_id, username, name, bio, email, password, role, color_index, xp,
		       google_id, google_email, google_avatar_url, created_at
		FROM users
		WHERE id = $1
	`

	err := s.pool.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.StudentID,
		&user.Username,
		&user.Name,
		&user.Bio,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.ColorIndex,
		&user.XP,
		&user.GoogleID,
		&user.GoogleEmail,
		&user.GoogleAvatarURL,
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

// GetUserByUsername retrieves a user by their username.
func (s *PostgresStore) GetUserByUsername(ctx context.Context, username string) (*User, error) {
	if username == "" {
		return nil, fmt.Errorf("username cannot be empty")
	}

	user := &User{}

	query := `
		SELECT id, student_id, username, name, bio, email, password, role, color_index, xp,
		       google_id, google_email, google_avatar_url, created_at
		FROM users
		WHERE username = $1
	`

	err := s.pool.QueryRow(ctx, query, username).Scan(
		&user.ID,
		&user.StudentID,
		&user.Username,
		&user.Name,
		&user.Bio,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.ColorIndex,
		&user.XP,
		&user.GoogleID,
		&user.GoogleEmail,
		&user.GoogleAvatarURL,
		&user.CreatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("user not found: %w", err)
		}
		return nil, fmt.Errorf("failed to get user by username: %w", err)
	}

	return user, nil
}

// GetUserByEmail retrieves a user by their email.
func (s *PostgresStore) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	if email == "" {
		return nil, fmt.Errorf("email cannot be empty")
	}

	user := &User{}

	query := `
		SELECT id, student_id, username, name, bio, email, password, role, color_index, xp,
		       google_id, google_email, google_avatar_url, created_at
		FROM users
		WHERE email = $1
	`

	err := s.pool.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.StudentID,
		&user.Username,
		&user.Name,
		&user.Bio,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.ColorIndex,
		&user.XP,
		&user.GoogleID,
		&user.GoogleEmail,
		&user.GoogleAvatarURL,
		&user.CreatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("user not found: %w", err)
		}
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	return user, nil
}

// GetUserByLogin retrieves a user by checking username, email, or student_id.
func (s *PostgresStore) GetUserByLogin(ctx context.Context, login string) (*User, error) {
	if login == "" {
		return nil, fmt.Errorf("login cannot be empty")
	}

	user := &User{}

	query := `
		SELECT id, student_id, username, name, bio, email, password, role, color_index, xp,
		       google_id, google_email, google_avatar_url, created_at
		FROM users
		WHERE username = $1 OR email = $1 OR student_id = $1
		LIMIT 1
	`

	err := s.pool.QueryRow(ctx, query, login).Scan(
		&user.ID,
		&user.StudentID,
		&user.Username,
		&user.Name,
		&user.Bio,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.ColorIndex,
		&user.XP,
		&user.GoogleID,
		&user.GoogleEmail,
		&user.GoogleAvatarURL,
		&user.CreatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("user not found: %w", err)
		}
		return nil, fmt.Errorf("failed to get user by login: %w", err)
	}

	return user, nil
}

// GetUserByGoogleID retrieves a user by their Google ID.
func (s *PostgresStore) GetUserByGoogleID(ctx context.Context, googleID string) (*User, error) {
	if googleID == "" {
		return nil, fmt.Errorf("googleID cannot be empty")
	}

	user := &User{}

	query := `
		SELECT id, student_id, username, name, bio, email, password, role, color_index, xp,
		       google_id, google_email, google_avatar_url, created_at
		FROM users
		WHERE google_id = $1
	`

	err := s.pool.QueryRow(ctx, query, googleID).Scan(
		&user.ID,
		&user.StudentID,
		&user.Username,
		&user.Name,
		&user.Bio,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.ColorIndex,
		&user.XP,
		&user.GoogleID,
		&user.GoogleEmail,
		&user.GoogleAvatarURL,
		&user.CreatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("user not found by google_id: %w", err)
		}
		return nil, fmt.Errorf("failed to get user by google_id: %w", err)
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
				u.id, u.name, u.student_id, u.username, u.role, u.color_index,
				COALESCE(SUM(pr.xp_reward), 0) as xp,
				COUNT(DISTINCT sub.problem_id) as solved_count,
				COALESCE(MIN(sub.runtime_ms), 0) as best_time_ms,
				u.google_avatar_url
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
			HAVING COALESCE(SUM(pr.xp_reward), 0) > 0
			ORDER BY xp DESC, solved_count DESC, u.id
			LIMIT 100
		`, interval)
	} else {
		// All time
		query = `
			SELECT 
				u.id, u.name, u.student_id, u.username, u.role, u.color_index, u.xp,
				COUNT(p.problem_id) FILTER (WHERE p.solved) as solved_count,
				COALESCE(MIN(p.best_runtime) FILTER (WHERE p.solved), 0) as best_time_ms,
				u.google_avatar_url
			FROM users u
			LEFT JOIN progress p ON u.id = p.user_id
			WHERE u.role != 'admin' AND u.xp > 0
			GROUP BY u.id
			ORDER BY u.xp DESC, solved_count DESC, u.id
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
			&uID, &u.Name, &u.StudentID, &u.Username, &u.Role, &u.ColorIndex, &u.XP,
			&u.SolvedCount, &bestTime, &u.GoogleAvatarURL,
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

// GetUserWithSolvedCount returns a user with their solved count in one query.
func (s *PostgresStore) GetUserWithSolvedCount(ctx context.Context, id uuid.UUID) (*User, int, error) {
	if id == uuid.Nil {
		return nil, 0, fmt.Errorf("id cannot be nil")
	}

	user := &User{}
	var solvedCount int

	query := `
		SELECT u.id, u.student_id, u.username, u.name, u.bio, u.email, u.password, u.role, u.color_index, u.xp,
		       u.google_id, u.google_email, u.google_avatar_url, u.created_at,
		       (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.solved = true) as solved_count
		FROM users u
		WHERE u.id = $1
	`

	err := s.pool.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.StudentID,
		&user.Username,
		&user.Name,
		&user.Bio,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.ColorIndex,
		&user.XP,
		&user.GoogleID,
		&user.GoogleEmail,
		&user.GoogleAvatarURL,
		&user.CreatedAt,
		&solvedCount,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, 0, fmt.Errorf("user not found: %w", err)
		}
		return nil, 0, fmt.Errorf("failed to get user: %w", err)
	}

	return user, solvedCount, nil
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

// UpdateUserProfile updates the user's name and bio by ID.
func (s *PostgresStore) UpdateUserProfile(ctx context.Context, id uuid.UUID, name, bio string) error {
	if id == uuid.Nil {
		return fmt.Errorf("id cannot be nil")
	}
	if name == "" {
		return fmt.Errorf("name cannot be empty")
	}

	query := `
		UPDATE users
		SET name = $1, bio = $2
		WHERE id = $3
	`

	cmdTag, err := s.pool.Exec(ctx, query, name, bio, id)
	if err != nil {
		return fmt.Errorf("failed to update user profile: %w", err)
	}

	if cmdTag.RowsAffected() == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// UpdateUserProfileWithReturn updates the user's name and bio and returns the updated user.
func (s *PostgresStore) UpdateUserProfileWithReturn(ctx context.Context, id uuid.UUID, name, bio string) (*User, error) {
	if id == uuid.Nil {
		return nil, fmt.Errorf("id cannot be nil")
	}
	if name == "" {
		return nil, fmt.Errorf("name cannot be empty")
	}

	user := &User{}

	query := `
		UPDATE users
		SET name = $1, bio = $2
		WHERE id = $3
		RETURNING id, student_id, username, name, bio, role, color_index, xp, created_at
	`

	err := s.pool.QueryRow(ctx, query, name, bio, id).Scan(
		&user.ID,
		&user.StudentID,
		&user.Username,
		&user.Name,
		&user.Bio,
		&user.Role,
		&user.ColorIndex,
		&user.XP,
		&user.CreatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to update user profile: %w", err)
	}

	return user, nil
}

// UpdateUserUsername updates the username for a user.
func (s *PostgresStore) UpdateUserUsername(ctx context.Context, id uuid.UUID, username string) error {
	if id == uuid.Nil {
		return fmt.Errorf("id cannot be nil")
	}
	if username == "" {
		return fmt.Errorf("username cannot be empty")
	}

	query := `
		UPDATE users
		SET username = $1
		WHERE id = $2
	`

	cmdTag, err := s.pool.Exec(ctx, query, username, id)
	if err != nil {
		return fmt.Errorf("failed to update username: %w", err)
	}
	if cmdTag.RowsAffected() == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// UpdateUserStudentID updates the student_id for a user.
func (s *PostgresStore) UpdateUserStudentID(ctx context.Context, id uuid.UUID, studentID string) error {
	if id == uuid.Nil {
		return fmt.Errorf("id cannot be nil")
	}
	if studentID == "" {
		return fmt.Errorf("studentID cannot be empty")
	}

	query := `
		UPDATE users
		SET student_id = $1
		WHERE id = $2
	`

	cmdTag, err := s.pool.Exec(ctx, query, studentID, id)
	if err != nil {
		return fmt.Errorf("failed to update student_id: %w", err)
	}
	if cmdTag.RowsAffected() == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// UpdateUserPassword updates the password hash for a user.
func (s *PostgresStore) UpdateUserPassword(ctx context.Context, id uuid.UUID, passwordHash string) error {
	if id == uuid.Nil {
		return fmt.Errorf("id cannot be nil")
	}
	if passwordHash == "" {
		return fmt.Errorf("password hash cannot be empty")
	}

	cmdTag, err := s.pool.Exec(ctx,
		`UPDATE users SET password = $1 WHERE id = $2`,
		passwordHash, id,
	)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}
	if cmdTag.RowsAffected() == 0 {
		return fmt.Errorf("user not found")
	}
	return nil
}

// UpdateUserGoogleAvatar updates the Google avatar URL for a user.
func (s *PostgresStore) UpdateUserGoogleAvatar(ctx context.Context, id uuid.UUID, avatarURL string) error {
	if id == uuid.Nil {
		return fmt.Errorf("id cannot be nil")
	}

	query := `
		UPDATE users
		SET google_avatar_url = $1
		WHERE id = $2
	`

	cmdTag, err := s.pool.Exec(ctx, query, avatarURL, id)
	if err != nil {
		return fmt.Errorf("failed to update google avatar: %w", err)
	}
	if cmdTag.RowsAffected() == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// CreateUserFromGoogle creates a new user from a Google OAuth profile.
func (s *PostgresStore) CreateUserFromGoogle(ctx context.Context, info *GoogleUserInfo) (*User, error) {
	if info == nil {
		return nil, fmt.Errorf("google user info cannot be nil")
	}

	// Generate a random placeholder password (OAuth users don't use password login)
	placeholderPW, err := bcrypt.GenerateFromPassword([]byte(uuid.New().String()), 12)
	if err != nil {
		return nil, fmt.Errorf("failed to hash placeholder password: %w", err)
	}

	colorIndexBig, err := rand.Int(rand.Reader, big.NewInt(6))
	if err != nil {
		return nil, fmt.Errorf("failed to assign color index: %w", err)
	}
	colorIndex := int(colorIndexBig.Int64())

	// Generate a temporary student_id and username from Google metadata
	tempUsername := "g_" + info.Sub[:8]

	var userID pgtype.UUID
	var createdAt pgtype.Timestamp

	query := `
		INSERT INTO users (student_id, username, name, email, password, role, color_index, xp, google_id, google_email, google_avatar_url, created_at)
		VALUES ($1, $2, $3, $4, $5, 'student', $6, 0, $7, $8, $9, NOW())
		RETURNING id, created_at
	`

	err = s.pool.QueryRow(ctx, query,
		info.Email,       // student_id = Google email (internal)
		tempUsername,     // username (temporary, user will set it on onboarding)
		info.Name,        // name from Google
		info.Email,       // email
		string(placeholderPW),
		colorIndex,
		info.Sub,         // google_id
		info.Email,       // google_email
		info.Picture,     // google_avatar_url
	).Scan(&userID, &createdAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create user from google: %w", err)
	}

	return &User{
		ID:             userID,
		StudentID:      info.Email,
		Username:       tempUsername,
		Name:           info.Name,
		Email:          &info.Email,
		Password:       string(placeholderPW),
		Role:           "student",
		ColorIndex:     colorIndex,
		XP:             0,
		GoogleID:       &info.Sub,
		GoogleEmail:    &info.Email,
		GoogleAvatarURL: &info.Picture,
		CreatedAt:      createdAt.Time,
	}, nil
}

// LinkGoogleToUser links an existing user to a Google account.
func (s *PostgresStore) LinkGoogleToUser(ctx context.Context, userID uuid.UUID, info *GoogleUserInfo) error {
	if userID == uuid.Nil {
		return fmt.Errorf("userID cannot be nil")
	}
	if info == nil {
		return fmt.Errorf("google user info cannot be nil")
	}

	query := `
		UPDATE users
		SET google_id = $1, google_email = $2, google_avatar_url = $3, email = COALESCE(email, $2)
		WHERE id = $4
	`

	cmdTag, err := s.pool.Exec(ctx, query,
		info.Sub,
		info.Email,
		info.Picture,
		userID,
	)
	if err != nil {
		return fmt.Errorf("failed to link google to user: %w", err)
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

	// Get solved count, average stars, best runtime from progress (no JOIN needed)
	query1 := `
		SELECT 
			COUNT(*) FILTER (WHERE solved) as solved_count,
			COALESCE(AVG(stars) FILTER (WHERE solved), 0.0) as avg_stars,
			COALESCE(MIN(best_runtime) FILTER (WHERE solved AND best_runtime > 0), 0) as best_runtime
		FROM progress
		WHERE user_id = $1
	`

	err := s.pool.QueryRow(ctx, query1, userID).Scan(
		&stats.SolvedCount,
		&stats.AverageStars,
		&stats.BestRuntimeMs,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get basic stats: %w", err)
	}

	// Attempted count from submissions (separate query avoids row multiplication from JOIN)
	err = s.pool.QueryRow(ctx, `SELECT COUNT(DISTINCT problem_id) FROM submissions WHERE user_id = $1`, userID).Scan(&stats.AttemptedCount)
	if err != nil {
		stats.AttemptedCount = 0
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

	streakDays, err := s.CalculateStreak(ctx, userID)
	if err != nil {
		stats.CurrentStreakDays = 0
	} else {
		stats.CurrentStreakDays = streakDays
	}

	return stats, nil
}

// GetModuleProficiency returns the user's progress by module.
func (s *PostgresStore) GetModuleProficiency(ctx context.Context, userID uuid.UUID) (map[string]DifficultyProgress, error) {
	query := `
		SELECT 
			pr.module,
			COUNT(DISTINCT CASE WHEN pg.solved THEN pg.problem_id END) as solved,
			COUNT(DISTINCT pr.id) as total
		FROM problems pr
		LEFT JOIN progress pg ON pr.id = pg.problem_id AND pg.user_id = $1
		WHERE pr.visible = true
		GROUP BY pr.module
		ORDER BY pr.module
	`

	rows, err := s.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get module proficiency: %w", err)
	}
	defer rows.Close()

	proficiency := make(map[string]DifficultyProgress)
	for rows.Next() {
		var module string
		var solved, total int
		if err := rows.Scan(&module, &solved, &total); err != nil {
			return nil, fmt.Errorf("failed to scan module proficiency: %w", err)
		}
		proficiency[module] = DifficultyProgress{
			Solved: solved,
			Total:  total,
		}
	}

	return proficiency, nil
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

// DeleteUser permanently removes a user and all associated data.
func (s *PostgresStore) DeleteUser(ctx context.Context, id uuid.UUID) error {
	if id == uuid.Nil {
		return fmt.Errorf("id cannot be nil")
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Delete submissions (no ON DELETE CASCADE)
	if _, err := tx.Exec(ctx, `DELETE FROM submissions WHERE user_id = $1`, id); err != nil {
		return fmt.Errorf("failed to delete submissions: %w", err)
	}

	// Delete progress (no ON DELETE CASCADE)
	if _, err := tx.Exec(ctx, `DELETE FROM progress WHERE user_id = $1`, id); err != nil {
		return fmt.Errorf("failed to delete progress: %w", err)
	}

	// Delete the user (cascades to user_problems, notifications, submission_likes,
	// and sets author_id = NULL on authored problems)
	if tag, err := tx.Exec(ctx, `DELETE FROM users WHERE id = $1`, id); err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	} else if tag.RowsAffected() == 0 {
		return fmt.Errorf("user not found")
	}

	return tx.Commit(ctx)
}

// CalculateStreak returns the number of consecutive days the user has passed submissions.
func (s *PostgresStore) CalculateStreak(ctx context.Context, userID uuid.UUID) (int, error) {
	query := `
		WITH daily_submissions AS (
			SELECT DISTINCT DATE(created_at) AS sub_date
			FROM submissions
			WHERE user_id = $1 AND status = 'passed'
		),
		streak_groups AS (
			SELECT sub_date,
				   sub_date - (DENSE_RANK() OVER (ORDER BY sub_date ASC))::integer AS grp
			FROM daily_submissions
		)
		SELECT COALESCE(COUNT(*), 0)
		FROM streak_groups
		WHERE grp = (
			SELECT grp
			FROM streak_groups
			WHERE sub_date >= CURRENT_DATE - INTERVAL '1 day'
			ORDER BY sub_date DESC
			LIMIT 1
		)
	`
	var days int
	err := s.pool.QueryRow(ctx, query, userID).Scan(&days)
	if err != nil {
		return 0, fmt.Errorf("failed to calculate streak: %w", err)
	}
	return days, nil
}
