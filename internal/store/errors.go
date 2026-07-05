package store

import (
	"errors"
	"strings"

	"github.com/jackc/pgx/v5/pgconn"
)

// FriendlyError wraps a database error with a user-facing message.
type FriendlyError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (e *FriendlyError) Error() string { return e.Message }

// constraintFriendly maps PostgreSQL constraint names to user-friendly messages.
var constraintFriendly = map[string]string{
	"idx_users_email_unique": "An account with this email already exists. Try logging in instead.",
	"idx_users_username":     "This username is already taken. Please choose another one.",
	"users_student_id_key":   "This student ID is already taken.",
	"idx_users_student_id":   "This student ID is already taken.",
	"problems_slug_key":      "A problem with this slug already exists.",
}

// IsUniqueViolation checks if the error is a PostgreSQL unique constraint violation (code 23505).
func IsUniqueViolation(err error) (string, bool) {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		if msg, ok := constraintFriendly[pgErr.ConstraintName]; ok {
			return msg, true
		}
		// Fallback for unknown constraints
		name := pgErr.ConstraintName
		name = strings.ReplaceAll(name, "_unique", "")
		name = strings.ReplaceAll(name, "_key", "")
		name = strings.ReplaceAll(name, "idx_", "")
		name = strings.ReplaceAll(name, "_", " ")
		return "This " + name + " is already taken.", true
	}
	return "", false
}

// NewDuplicateError creates a FriendlyError with DUPLICATE_RESOURCE code.
func NewDuplicateError(msg string) *FriendlyError {
	return &FriendlyError{Code: "DUPLICATE_RESOURCE", Message: msg}
}

// NewNotFoundError creates a FriendlyError with NOT_FOUND code.
func NewNotFoundError(msg string) *FriendlyError {
	return &FriendlyError{Code: "NOT_FOUND", Message: msg}
}

// NewValidationError creates a FriendlyError with VALIDATION_ERROR code.
func NewValidationError(msg string) *FriendlyError {
	return &FriendlyError{Code: "VALIDATION_ERROR", Message: msg}
}

// IsFriendlyError checks if an error is a FriendlyError and returns its code and message.
func IsFriendlyError(err error) (string, string, bool) {
	var fe *FriendlyError
	if errors.As(err, &fe) {
		return fe.Code, fe.Message, true
	}
	return "", "", false
}
