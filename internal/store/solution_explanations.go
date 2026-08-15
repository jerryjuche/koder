package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// GetSolutionExplanation returns the cached AI explanation for a submission,
// or (nil, nil) when it has not been generated yet. Returning nil on a cache
// miss lets the handler generate + upsert in one round trip.
func (s *PostgresStore) GetSolutionExplanation(ctx context.Context, submissionID uuid.UUID) (*SolutionExplanation, error) {
	query := `
		SELECT submission_id, language, summary, approach, time_complexity, space_complexity,
		       key_techniques, strengths, improvements, created_at
		FROM ai_solution_explanations
		WHERE submission_id = $1
	`

	var exp SolutionExplanation
	var keyTechniques, strengths, improvements []byte

	err := s.pool.QueryRow(ctx, query, submissionID).Scan(
		&exp.SubmissionID, &exp.Language, &exp.Summary, &exp.Approach,
		&exp.TimeComplexity, &exp.SpaceComplexity,
		&keyTechniques, &strengths, &improvements, &exp.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get solution explanation: %w", err)
	}

	if err := json.Unmarshal(keyTechniques, &exp.KeyTechniques); err != nil {
		return nil, fmt.Errorf("failed to parse key_techniques: %w", err)
	}
	if err := json.Unmarshal(strengths, &exp.Strengths); err != nil {
		return nil, fmt.Errorf("failed to parse strengths: %w", err)
	}
	if err := json.Unmarshal(improvements, &exp.Improvements); err != nil {
		return nil, fmt.Errorf("failed to parse improvements: %w", err)
	}

	return &exp, nil
}

// UpsertSolutionExplanation inserts or replaces the cached explanation for a
// submission. ON CONFLICT guards against a concurrent generate racing two
// inserts for the same submission.
func (s *PostgresStore) UpsertSolutionExplanation(ctx context.Context, exp *SolutionExplanation) error {
	if exp == nil {
		return fmt.Errorf("explanation cannot be nil")
	}

	keyTechniques, err := json.Marshal(exp.KeyTechniques)
	if err != nil {
		return fmt.Errorf("failed to marshal key_techniques: %w", err)
	}
	strengths, err := json.Marshal(exp.Strengths)
	if err != nil {
		return fmt.Errorf("failed to marshal strengths: %w", err)
	}
	improvements, err := json.Marshal(exp.Improvements)
	if err != nil {
		return fmt.Errorf("failed to marshal improvements: %w", err)
	}

	query := `
		INSERT INTO ai_solution_explanations
			(submission_id, language, summary, approach, time_complexity, space_complexity,
			 key_techniques, strengths, improvements)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (submission_id) DO UPDATE SET
			language = EXCLUDED.language,
			summary = EXCLUDED.summary,
			approach = EXCLUDED.approach,
			time_complexity = EXCLUDED.time_complexity,
			space_complexity = EXCLUDED.space_complexity,
			key_techniques = EXCLUDED.key_techniques,
			strengths = EXCLUDED.strengths,
			improvements = EXCLUDED.improvements
	`

	_, err = s.pool.Exec(ctx, query,
		exp.SubmissionID, exp.Language, exp.Summary, exp.Approach,
		exp.TimeComplexity, exp.SpaceComplexity,
		keyTechniques, strengths, improvements,
	)
	if err != nil {
		return fmt.Errorf("failed to upsert solution explanation: %w", err)
	}
	return nil
}

// GetSolutionForExplain loads a submission + its problem context for AI
// explanation. Only passed submissions on visible problems qualify — returning
// (nil, nil) when the submission is missing, not passed, or its problem is
// hidden, so the handler can 404 without leaking draft problem details.
func (s *PostgresStore) GetSolutionForExplain(ctx context.Context, submissionID uuid.UUID) (*SolutionForExplain, error) {
	query := `
		SELECT sub.id, sub.user_id, sub.language, sub.code,
		       p.title, p.slug, p.module, sub.runtime_ms
		FROM submissions sub
		JOIN problems p ON sub.problem_id = p.id
		WHERE sub.id = $1 AND sub.status = 'passed' AND p.visible = true
	`

	var sol SolutionForExplain
	err := s.pool.QueryRow(ctx, query, submissionID).Scan(
		&sol.SubmissionID, &sol.AuthorID, &sol.Language, &sol.Code,
		&sol.ProblemTitle, &sol.ProblemSlug, &sol.Module, &sol.RuntimeMs,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get solution for explain: %w", err)
	}

	return &sol, nil
}
