package store

import (
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

// User represents a user in the system.
type User struct {
	ID        pgtype.UUID `db:"id"`
	StudentID string      `db:"student_id"`
	Name      string      `db:"name"`
	Password  string      `db:"password"` // bcrypt hash
	Role      string      `db:"role"`     // "student" | "admin"
	ColorIndex int        `db:"color_index"`
	XP        int         `db:"xp"`
	CreatedAt time.Time   `db:"created_at"`
}

// NewUser represents a user creation request.
type NewUser struct {
	StudentID string
	Name      string
	Password  string // plaintext, will be hashed
	Role      string // "student" | "admin"
}
