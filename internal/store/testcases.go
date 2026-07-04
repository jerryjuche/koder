package store

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

// GetTestCasesForProblem returns all test cases for a problem ordered by ordinal.
func (s *PostgresStore) GetTestCasesForProblem(ctx context.Context, problemID uuid.UUID) ([]TestCase, error) {
	if problemID == uuid.Nil {
		return nil, fmt.Errorf("problemID cannot be nil")
	}

	query := `
		SELECT id, problem_id, input, expected, is_hidden, ordinal
		FROM test_cases
		WHERE problem_id = $1
		ORDER BY ordinal ASC
		LIMIT 200
	`

	rows, err := s.pool.Query(ctx, query, problemID)
	if err != nil {
		return nil, fmt.Errorf("failed to query test cases: %w", err)
	}
	defer rows.Close()

	var cases []TestCase
	for rows.Next() {
		var tc TestCase
		if err := rows.Scan(
			&tc.ID,
			&tc.ProblemID,
			&tc.Input,
			&tc.Expected,
			&tc.IsHidden,
			&tc.Ordinal,
		); err != nil {
			return nil, fmt.Errorf("failed to scan test case row: %w", err)
		}
		cases = append(cases, tc)
	}

	if rows.Err() != nil {
		return nil, fmt.Errorf("row iteration error: %w", rows.Err())
	}

	return cases, nil
}

// GetVisibleTestCasesForProblem returns only visible (non-hidden) test cases for a problem.
func (s *PostgresStore) GetVisibleTestCasesForProblem(ctx context.Context, problemID uuid.UUID) ([]TestCase, error) {
	if problemID == uuid.Nil {
		return nil, fmt.Errorf("problemID cannot be nil")
	}

	query := `
		SELECT id, problem_id, input, expected, is_hidden, ordinal
		FROM test_cases
		WHERE problem_id = $1 AND is_hidden = false
		ORDER BY ordinal ASC
		LIMIT 200
	`

	rows, err := s.pool.Query(ctx, query, problemID)
	if err != nil {
		return nil, fmt.Errorf("failed to query visible test cases: %w", err)
	}
	defer rows.Close()

	var cases []TestCase
	for rows.Next() {
		var tc TestCase
		if err := rows.Scan(
			&tc.ID,
			&tc.ProblemID,
			&tc.Input,
			&tc.Expected,
			&tc.IsHidden,
			&tc.Ordinal,
		); err != nil {
			return nil, fmt.Errorf("failed to scan test case row: %w", err)
		}
		cases = append(cases, tc)
	}

	if rows.Err() != nil {
		return nil, fmt.Errorf("row iteration error: %w", rows.Err())
	}

	return cases, nil
}
