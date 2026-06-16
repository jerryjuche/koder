package store

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// CreateSubmission inserts a new submission record.
func (s *PostgresStore) CreateSubmission(ctx context.Context, sub *Submission) error {
	if sub == nil {
		return fmt.Errorf("submission cannot be nil")
	}

	query := `
		INSERT INTO submissions (user_id, problem_id, language, code, status, passed_count, total_count, output_logs, runtime_ms, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
		RETURNING id, created_at
	`

	err := s.pool.QueryRow(ctx, query,
		sub.UserID,
		sub.ProblemID,
		sub.Language,
		sub.Code,
		sub.Status,
		sub.PassedCount,
		sub.TotalCount,
		sub.OutputLogs,
		sub.RuntimeMs,
	).Scan(&sub.ID, &sub.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to insert submission: %w", err)
	}

	return nil
}

// GetProblemWithTestCases fetches both a problem and its associated test cases.
func (s *PostgresStore) GetProblemWithTestCases(ctx context.Context, problemID uuid.UUID) (*Problem, []TestCase, error) {
	if problemID == uuid.Nil {
		return nil, nil, fmt.Errorf("problemID cannot be nil")
	}

	query := `
		SELECT id, slug, module, type, language, title, statement, func_name, return_type, param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme, created_at, updated_at
		FROM problems
		WHERE id = $1
	`

	var problem Problem
	err := s.pool.QueryRow(ctx, query, problemID).Scan(
		&problem.ID,
		&problem.Slug,
		&problem.Module,
		&problem.Type,
		&problem.Language,
		&problem.Title,
		&problem.Statement,
		&problem.FuncName,
		&problem.ReturnType,
		&problem.ParamTypes,
		&problem.Hints,
		&problem.Difficulty,
		&problem.XPReward,
		&problem.Tags,
		&problem.Visible,
		&problem.SourceHash,
		&problem.RawReadme,
		&problem.CreatedAt,
		&problem.UpdatedAt,
	)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get problem: %w", err)
	}

	testCases, err := s.GetTestCasesForProblem(ctx, problemID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get test cases for problem: %w", err)
	}

	return &problem, testCases, nil
}
