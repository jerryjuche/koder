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
