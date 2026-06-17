package store

import (
	"context"
	"fmt"

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

	// Insert into database with parameterized query
	query := `
		INSERT INTO users (student_id, name, password, role, color_index, xp, created_at)
		VALUES ($1, $2, $3, $4, 0, 0, NOW())
		RETURNING id, created_at
	`

	err = s.pool.QueryRow(ctx, query, user.StudentID, user.Name, string(hashedPassword), user.Role).
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
		ColorIndex: 0,
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
func (s *PostgresStore) GetLeaderboard(ctx context.Context) ([]LeaderboardEntry, error) {
	query := `
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
			&uID, &u.Name, &u.StudentID, &u.Role, &u.AvatarIndex, &u.XP, 
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
