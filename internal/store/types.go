package store

import (
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

// User represents a user in the system.
type User struct {
	ID         pgtype.UUID `db:"id"`
	StudentID  string      `db:"student_id"`
	Name       string      `db:"name"`
	Password   string      `db:"password"` // bcrypt hash
	Role       string      `db:"role"`     // "student" | "admin"
	ColorIndex int         `db:"color_index"`
	XP         int         `db:"xp"`
	CreatedAt  time.Time   `db:"created_at"`
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
	ID          pgtype.UUID `db:"id" json:"id"`
	Slug        string      `db:"slug" json:"slug"`
	Module      string      `db:"module" json:"module"`
	Type        string      `db:"type" json:"type"`
	Language    string      `db:"language" json:"language"`
	Title       string      `db:"title" json:"title"`
	Statement   string      `db:"statement" json:"statement"`
	FuncName    string      `db:"func_name" json:"func_name"`
	ReturnType  string      `db:"return_type" json:"return_type"`
	ParamTypes  []string    `db:"param_types" json:"param_types"`
	Hints       []string    `db:"hints" json:"hints"`
	Difficulty  int         `db:"difficulty" json:"difficulty"`
	XPReward    int         `db:"xp_reward" json:"xp_reward"`
	Tags        []string    `db:"tags" json:"tags"`
	Visible     bool        `db:"visible" json:"visible"`
	SourceHash  string      `db:"source_hash" json:"source_hash"`
	RawReadme   string      `db:"raw_readme" json:"raw_readme"`
	CreatedAt   time.Time   `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time   `db:"updated_at" json:"updated_at"`
	Solved      bool        `json:"solved"`
	Stars       int         `json:"stars"`
	Attempts    int         `json:"attempts"`
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
