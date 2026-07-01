package store

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// CreateUserProblem inserts a new staging problem submitted by a verified user.
func (s *PostgresStore) CreateUserProblem(ctx context.Context, userID uuid.UUID, problem *NewUserProblem) (*UserProblem, error) {
	// Convert test cases to JSONB array
	var testCasesJSON []string
	for _, tc := range problem.TestCases {
		b, err := json.Marshal(tc)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal test case: %w", err)
		}
		testCasesJSON = append(testCasesJSON, string(b))
	}

	query := `
		INSERT INTO user_problems (
			user_id, slug, title, statement, func_name, return_type, 
			param_types, hints, difficulty, xp_reward, tags, test_cases, status
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::JSONB[], 'pending')
		ON CONFLICT (slug) DO UPDATE SET
			title = EXCLUDED.title,
			statement = EXCLUDED.statement,
			func_name = EXCLUDED.func_name,
			return_type = EXCLUDED.return_type,
			param_types = EXCLUDED.param_types,
			hints = EXCLUDED.hints,
			difficulty = EXCLUDED.difficulty,
			xp_reward = EXCLUDED.xp_reward,
			tags = EXCLUDED.tags,
			test_cases = EXCLUDED.test_cases,
			status = 'pending',
			admin_notes = NULL
		WHERE user_problems.user_id = EXCLUDED.user_id
		RETURNING id, user_id, slug, title, statement, func_name, return_type, param_types, hints, difficulty, xp_reward, tags, status, created_at
	`

	var up UserProblem
	err := s.pool.QueryRow(ctx, query,
		userID, problem.Slug, problem.Title, problem.Statement, problem.FuncName, problem.ReturnType,
		problem.ParamTypes, problem.Hints, problem.Difficulty, problem.XPReward, problem.Tags, testCasesJSON,
	).Scan(
		&up.ID, &up.UserID, &up.Slug, &up.Title, &up.Statement, &up.FuncName, &up.ReturnType,
		&up.ParamTypes, &up.Hints, &up.Difficulty, &up.XPReward, &up.Tags, &up.Status, &up.CreatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("slug already exists and you are not the author")
		}
		return nil, fmt.Errorf("failed to create or update user problem: %w", err)
	}

	up.TestCases = problem.TestCases
	return &up, nil
}

func (s *PostgresStore) listUserProblems(ctx context.Context, query string, args ...any) ([]UserProblem, error) {
	rows, err := s.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query user problems: %w", err)
	}
	defer rows.Close()

	var problems []UserProblem
	for rows.Next() {
		var up UserProblem
		var testCasesJSON [][]byte
		err := rows.Scan(
			&up.ID, &up.UserID, &up.Slug, &up.Title, &up.Statement, &up.FuncName, &up.ReturnType,
			&up.ParamTypes, &up.Hints, &up.Difficulty, &up.XPReward, &up.Tags, &testCasesJSON,
			&up.Status, &up.AdminNotes, &up.CreatedAt, &up.ReviewedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user problem: %w", err)
		}

		// Unmarshal test cases
		for _, b := range testCasesJSON {
			var tc UserProblemTestCase
			if err := json.Unmarshal(b, &tc); err != nil {
				return nil, fmt.Errorf("failed to unmarshal test case JSON: %w", err)
			}
			up.TestCases = append(up.TestCases, tc)
		}

		problems = append(problems, up)
	}
	return problems, nil
}

// ListUserProblemsByUser lists all submissions from a specific user.
func (s *PostgresStore) ListUserProblemsByUser(ctx context.Context, userID uuid.UUID) ([]UserProblem, error) {
	query := `
		SELECT id, user_id, slug, title, statement, func_name, return_type, param_types, hints, difficulty, xp_reward, tags, test_cases, status, admin_notes, created_at, reviewed_at
		FROM user_problems
		WHERE user_id = $1
		ORDER BY created_at DESC
	`
	return s.listUserProblems(ctx, query, userID)
}

// ListPendingUserProblems lists all pending community contributions for admins.
func (s *PostgresStore) ListPendingUserProblems(ctx context.Context) ([]UserProblem, error) {
	query := `
		SELECT id, user_id, slug, title, statement, func_name, return_type, param_types, hints, difficulty, xp_reward, tags, test_cases, status, admin_notes, created_at, reviewed_at
		FROM user_problems
		WHERE status = 'pending'
		ORDER BY created_at ASC
	`
	return s.listUserProblems(ctx, query)
}

// GetUserProblemByID fetches a single user problem by its ID.
func (s *PostgresStore) GetUserProblemByID(ctx context.Context, id uuid.UUID) (*UserProblem, error) {
	query := `
		SELECT id, user_id, slug, title, statement, func_name, return_type, param_types, hints, difficulty, xp_reward, tags, test_cases, status, admin_notes, created_at, reviewed_at
		FROM user_problems
		WHERE id = $1
	`
	problems, err := s.listUserProblems(ctx, query, id)
	if err != nil {
		return nil, err
	}
	if len(problems) == 0 {
		return nil, fmt.Errorf("user problem not found")
	}
	return &problems[0], nil
}

// RejectUserProblem marks a contribution as rejected and appends an admin note.
func (s *PostgresStore) RejectUserProblem(ctx context.Context, id uuid.UUID, adminNotes string) (*UserProblem, error) {
	query := `
		UPDATE user_problems
		SET status = 'rejected', admin_notes = $2, reviewed_at = NOW()
		WHERE id = $1 AND status = 'pending'
		RETURNING id, user_id, slug, title, status, admin_notes
	`
	var up UserProblem
	err := s.pool.QueryRow(ctx, query, id, adminNotes).Scan(
		&up.ID, &up.UserID, &up.Slug, &up.Title, &up.Status, &up.AdminNotes,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("user problem not found or not pending")
		}
		return nil, fmt.Errorf("failed to reject user problem: %w", err)
	}
	return &up, nil
}

// ApproveUserProblem is a transaction that approves the contribution, moves it to the problems table, and saves the test cases.
func (s *PostgresStore) ApproveUserProblem(ctx context.Context, id uuid.UUID, adminNotes string) (*UserProblem, *uuid.UUID, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Fetch the user problem
	var up UserProblem
	var testCasesJSON [][]byte
	fetchQuery := `
		SELECT id, user_id, slug, title, statement, func_name, return_type, param_types, hints, difficulty, xp_reward, tags, test_cases
		FROM user_problems
		WHERE id = $1 AND status = 'pending'
		FOR UPDATE
	`
	err = tx.QueryRow(ctx, fetchQuery, id).Scan(
		&up.ID, &up.UserID, &up.Slug, &up.Title, &up.Statement, &up.FuncName, &up.ReturnType,
		&up.ParamTypes, &up.Hints, &up.Difficulty, &up.XPReward, &up.Tags, &testCasesJSON,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil, fmt.Errorf("user problem not found or already processed")
		}
		return nil, nil, fmt.Errorf("failed to fetch user problem: %w", err)
	}

	// 2. Fetch author's name
	var authorName string
	err = tx.QueryRow(ctx, "SELECT name FROM users WHERE id = $1", up.UserID).Scan(&authorName)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to fetch author name: %w", err)
	}

	// 3. Insert into main problems table
	insertProbQuery := `
		INSERT INTO problems (
			slug, module, type, language, title, statement, func_name, return_type, 
			param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme, author_id, author_name
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
		RETURNING id
	`
	var newProblemID uuid.UUID
	err = tx.QueryRow(ctx, insertProbQuery,
		up.Slug, "Community", "algorithm", "go", up.Title, up.Statement, up.FuncName, up.ReturnType,
		up.ParamTypes, up.Hints, up.Difficulty, up.XPReward, up.Tags, true, "COMMUNITY:"+uuid.UUID(up.ID.Bytes).String(),
		"Community Contribution", up.UserID, authorName,
	).Scan(&newProblemID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to insert problem: %w", err)
	}

	// 4. Insert test cases
	for _, tcJSON := range testCasesJSON {
		var tc UserProblemTestCase
		if err := json.Unmarshal(tcJSON, &tc); err != nil {
			return nil, nil, fmt.Errorf("failed to unmarshal test case JSON: %w", err)
		}

		insertTCQuery := `
			INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal)
			VALUES ($1, $2, $3, $4, $5)
		`
		_, err = tx.Exec(ctx, insertTCQuery, newProblemID, tc.Input, tc.Expected, tc.IsHidden, tc.Ordinal)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to insert test case: %w", err)
		}
	}

	// 5. Update user_problems status
	updateQuery := `
		UPDATE user_problems
		SET status = 'approved', admin_notes = $2, reviewed_at = NOW()
		WHERE id = $1
	`
	_, err = tx.Exec(ctx, updateQuery, id, adminNotes)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to update user problem status: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, nil, fmt.Errorf("failed to commit transaction: %w", err)
	}
	up.Status = "approved"
	up.AdminNotes = &adminNotes
	return &up, &newProblemID, nil
}
