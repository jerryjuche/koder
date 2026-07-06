package store

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// ListVisibleProblems returns problems visible to students with optional progress overlay.
// Uses LATERAL join instead of correlated subqueries.
func (s *PostgresStore) ListVisibleProblems(ctx context.Context, userID uuid.UUID) ([]Problem, error) {
	query := `
		SELECT p.id, p.slug, p.module, p.type, p.language, p.title,
		       p.statement, p.constraints, p.learning_objective, p.func_name, p.return_type, p.param_types, p.hints, p.difficulty,
		       p.xp_reward, p.tags, p.visible, p.source_hash,
		       p.created_at, p.updated_at,
		       COALESCE(pr.solved, false), COALESCE(pr.stars, 0), COALESCE(pr.attempts, 0),
		       COALESCE(s.total_subs, 0)::int,
		       COALESCE(s.passed_subs, 0)::int,
		       COALESCE(s.avg_runtime, 0)::int
		FROM problems p
		LEFT JOIN progress pr ON pr.problem_id = p.id AND pr.user_id = $1
		LEFT JOIN LATERAL (
			SELECT
				COUNT(*) AS total_subs,
				COUNT(*) FILTER (WHERE status = 'passed') AS passed_subs,
				ROUND(AVG(runtime_ms) FILTER (WHERE status = 'passed')) AS avg_runtime
			FROM submissions
			WHERE problem_id = p.id
		) s ON true
		WHERE p.visible = true
		ORDER BY p.created_at DESC
		LIMIT 200
	`

	rows, err := s.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query visible problems: %w", err)
	}
	defer rows.Close()

	var problems []Problem
	for rows.Next() {
		var problem Problem
		var successfulSubs int
		if err := rows.Scan(
			&problem.ID,
			&problem.Slug,
			&problem.Module,
			&problem.Type,
			&problem.Language,
			&problem.Title,
			&problem.Statement,
			&problem.Constraints,
			&problem.LearningObjective,
			&problem.FuncName,
			&problem.ReturnType,
			&problem.ParamTypes,
			&problem.Hints,
			&problem.Difficulty,
			&problem.XPReward,
			&problem.Tags,
			&problem.Visible,
			&problem.SourceHash,
			&problem.CreatedAt,
			&problem.UpdatedAt,
			&problem.Solved,
			&problem.Stars,
			&problem.Attempts,
			&problem.TotalSubmissions,
			&successfulSubs,
			&problem.AvgRuntimeMs,
		); err != nil {
			return nil, fmt.Errorf("failed to scan problem row: %w", err)
		}
		if problem.TotalSubmissions > 0 {
			problem.SuccessRate = float64(successfulSubs) / float64(problem.TotalSubmissions) * 100
		}
		if problem.AvgRuntimeMs > 0 {
			problem.EstTimeMinutes = int((problem.AvgRuntimeMs + 59999) / 60000)
		}
		problems = append(problems, problem)
	}

	if rows.Err() != nil {
		return nil, fmt.Errorf("row iteration error: %w", rows.Err())
	}

	return problems, nil
}

// GetProblemBySlug returns a visible problem by slug, with user progress overlay.
func (s *PostgresStore) GetProblemBySlug(ctx context.Context, slug string, userID uuid.UUID) (*Problem, error) {
	if slug == "" {
		return nil, fmt.Errorf("slug cannot be empty")
	}

	query := `
		SELECT p.id, p.slug, p.module, p.type, p.language, p.title, p.statement,
		       p.constraints, p.learning_objective,
			   p.func_name, p.return_type, p.param_types, p.hints, p.difficulty,
			   p.xp_reward, p.tags, p.visible, p.source_hash, p.raw_readme,
			   p.created_at, p.updated_at,
			   (SELECT COUNT(*) FROM submissions WHERE problem_id = p.id) as total_subs,
			   (SELECT COUNT(*) FROM submissions WHERE problem_id = p.id AND status = 'passed') as successful_subs,
			   COALESCE( (SELECT ROUND(AVG(runtime_ms)) FROM submissions s WHERE s.problem_id = p.id AND s.status = 'passed'), 0 )::int AS avg_runtime_ms,
			   COALESCE(pr.solved, false), COALESCE(pr.stars, 0), COALESCE(pr.attempts, 0)
		FROM problems p
		LEFT JOIN progress pr ON pr.problem_id = p.id AND pr.user_id = $2
		WHERE p.slug = $1 AND p.visible = true
	`

	var problem Problem
	var successfulSubs int
	if err := s.pool.QueryRow(ctx, query, slug, userID).Scan(
		&problem.ID,
		&problem.Slug,
		&problem.Module,
		&problem.Type,
		&problem.Language,
		&problem.Title,
		&problem.Statement,
		&problem.Constraints,
		&problem.LearningObjective,
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
		&problem.TotalSubmissions,
		&successfulSubs,
		&problem.AvgRuntimeMs,
		&problem.Solved,
		&problem.Stars,
		&problem.Attempts,
	); err != nil {
		return nil, fmt.Errorf("failed to get problem by slug: %w", err)
	}

	if problem.TotalSubmissions > 0 {
		problem.SuccessRate = float64(successfulSubs) / float64(problem.TotalSubmissions) * 100
	}
	if problem.AvgRuntimeMs > 0 {
		problem.EstTimeMinutes = int((problem.AvgRuntimeMs + 59999) / 60000)
	}

	// Load non-hidden example test cases (limit 3)
	tcRows, err := s.pool.Query(ctx, `SELECT id, input, expected, is_hidden, ordinal FROM test_cases WHERE problem_id = $1 AND is_hidden = false ORDER BY ordinal ASC LIMIT 3`, problem.ID)
	if err == nil {
		defer tcRows.Close()
		examples := make([]TestCase, 0)
		for tcRows.Next() {
			var tc TestCase
			if err := tcRows.Scan(&tc.ID, &tc.Input, &tc.Expected, &tc.IsHidden, &tc.Ordinal); err != nil {
				continue
			}
			examples = append(examples, tc)
		}
		problem.Examples = examples
	}

	return &problem, nil
}

// UpsertProblem inserts or updates a problem record by slug.
func (s *PostgresStore) UpsertProblem(ctx context.Context, problem *Problem) error {
	if problem == nil {
		return fmt.Errorf("problem cannot be nil")
	}
	if problem.Slug == "" {
		return fmt.Errorf("problem slug is required")
	}

	query := `
		INSERT INTO problems (
		    slug, module, type, language, title, statement, func_name,
		    return_type, param_types, hints, difficulty, xp_reward, tags,
		    visible, source_hash, raw_readme, created_at, updated_at
		)
		VALUES (
		    $1, $2, $3, $4, $5, $6, $7,
		    $8, $9, $10, $11, $12, $13,
		    $14, $15, $16, NOW(), NOW()
		)
		ON CONFLICT (slug) DO UPDATE SET
		    module = EXCLUDED.module,
		    type = EXCLUDED.type,
		    language = EXCLUDED.language,
		    title = EXCLUDED.title,
		    statement = EXCLUDED.statement,
		    func_name = EXCLUDED.func_name,
		    return_type = EXCLUDED.return_type,
		    param_types = EXCLUDED.param_types,
		    hints = EXCLUDED.hints,
		    difficulty = EXCLUDED.difficulty,
		    xp_reward = EXCLUDED.xp_reward,
		    tags = EXCLUDED.tags,
		    visible = EXCLUDED.visible,
		    source_hash = EXCLUDED.source_hash,
		    raw_readme = EXCLUDED.raw_readme,
		    updated_at = NOW()
	`

	_, err := s.pool.Exec(ctx, query,
		problem.Slug,
		problem.Module,
		problem.Type,
		problem.Language,
		problem.Title,
		problem.Statement,
		problem.FuncName,
		problem.ReturnType,
		problem.ParamTypes,
		problem.Hints,
		problem.Difficulty,
		problem.XPReward,
		problem.Tags,
		problem.Visible,
		problem.SourceHash,
		problem.RawReadme,
	)
	if err != nil {
		return fmt.Errorf("failed to upsert problem: %w", err)
	}

	return nil
}

// UpsertEnrichedProblem atomically saves enriched problem metadata and test cases in a single transaction.
func (s *PostgresStore) UpsertEnrichedProblem(ctx context.Context, problem *Problem, testCases []TestCase) error {
	if problem == nil {
		return fmt.Errorf("problem cannot be nil")
	}
	if problem.Slug == "" {
		return fmt.Errorf("problem slug is required")
	}
	if len(testCases) == 0 {
		return fmt.Errorf("testCases cannot be empty")
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	upsertQuery := `
		INSERT INTO problems (
		    slug, module, type, language, title, statement, func_name,
		    return_type, param_types, hints, difficulty, xp_reward, tags,
		    visible, source_hash, raw_readme, created_at, updated_at
		)
		VALUES (
		    $1, $2, $3, $4, $5, $6, $7,
		    $8, $9, $10, $11, $12, $13,
		    $14, $15, $16, NOW(), NOW()
		)
		ON CONFLICT (slug) DO UPDATE SET
		    module = EXCLUDED.module,
		    type = EXCLUDED.type,
		    language = EXCLUDED.language,
		    title = EXCLUDED.title,
		    statement = EXCLUDED.statement,
		    func_name = EXCLUDED.func_name,
		    return_type = EXCLUDED.return_type,
		    param_types = EXCLUDED.param_types,
		    hints = EXCLUDED.hints,
		    difficulty = EXCLUDED.difficulty,
		    xp_reward = EXCLUDED.xp_reward,
		    tags = EXCLUDED.tags,
		    visible = EXCLUDED.visible,
		    source_hash = EXCLUDED.source_hash,
		    raw_readme = EXCLUDED.raw_readme,
		    updated_at = NOW()
	`

	if _, err := tx.Exec(ctx, upsertQuery,
		problem.Slug, problem.Module, problem.Type, problem.Language,
		problem.Title, problem.Statement, problem.FuncName, problem.ReturnType,
		problem.ParamTypes, problem.Hints, problem.Difficulty, problem.XPReward,
		problem.Tags, problem.Visible, problem.SourceHash, problem.RawReadme,
	); err != nil {
		return fmt.Errorf("failed to upsert enriched problem: %w", err)
	}

	var problemID pgtype.UUID
	if err := tx.QueryRow(ctx, `SELECT id FROM problems WHERE slug = $1`, problem.Slug).Scan(&problemID); err != nil {
		return fmt.Errorf("failed to resolve problem ID: %w", err)
	}

	if _, err := tx.Exec(ctx, `DELETE FROM test_cases WHERE problem_id = $1`, problemID); err != nil {
		return fmt.Errorf("failed to delete existing test cases: %w", err)
	}

	if len(testCases) > 0 {
		valueStrings := make([]string, 0, len(testCases))
		args := make([]interface{}, 0, 1+len(testCases)*4)
		args = append(args, problemID)
		for i, tc := range testCases {
			base := 1 + i*4
			valueStrings = append(valueStrings, fmt.Sprintf("($1, $%d, $%d, $%d, $%d)", base+1, base+2, base+3, base+4))
			args = append(args, tc.Input, tc.Expected, tc.IsHidden, tc.Ordinal)
		}
		insertQuery := `INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ` + strings.Join(valueStrings, ", ")
		if _, err := tx.Exec(ctx, insertQuery, args...); err != nil {
			return fmt.Errorf("failed to bulk insert test cases: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit enrichment transaction: %w", err)
	}

	return nil
}

// GetProblemByID returns a problem by its UUID regardless of visibility.
func (s *PostgresStore) GetProblemByID(ctx context.Context, id uuid.UUID) (*Problem, error) {
	if id == uuid.Nil {
		return nil, fmt.Errorf("problem ID cannot be nil")
	}

	query := `
		SELECT p.id, p.slug, p.module, p.type, p.language, p.title, p.statement,
		       p.constraints, p.learning_objective,
		       p.func_name, p.return_type, p.param_types, p.hints, p.difficulty,
		       p.xp_reward, p.tags, p.visible, p.source_hash, p.raw_readme,
		       p.created_at, p.updated_at
		FROM problems p
		WHERE p.id = $1
	`

	var problem Problem
	if err := s.pool.QueryRow(ctx, query, id).Scan(
		&problem.ID,
		&problem.Slug,
		&problem.Module,
		&problem.Type,
		&problem.Language,
		&problem.Title,
		&problem.Statement,
		&problem.Constraints,
		&problem.LearningObjective,
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
	); err != nil {
		return nil, fmt.Errorf("failed to get problem by ID: %w", err)
	}

	return &problem, nil
}

// GetProblemBySlugAny returns a problem by slug regardless of visibility.
func (s *PostgresStore) GetProblemBySlugAny(ctx context.Context, slug string) (*Problem, error) {
	if slug == "" {
		return nil, fmt.Errorf("slug cannot be empty")
	}

	query := `
		SELECT p.id, p.slug, p.module, p.type, p.language, p.title, p.statement,
		       p.constraints, p.learning_objective,
			   p.func_name, p.return_type, p.param_types, p.hints, p.difficulty,
			   p.xp_reward, p.tags, p.visible, p.source_hash, p.raw_readme,
			   p.created_at, p.updated_at,
			   (SELECT COUNT(*) FROM submissions WHERE problem_id = p.id) as total_subs,
			   (SELECT COUNT(*) FROM submissions WHERE problem_id = p.id AND status = 'passed') as successful_subs,
			   COALESCE( (SELECT ROUND(AVG(runtime_ms)) FROM submissions s WHERE s.problem_id = p.id AND s.status = 'passed'), 0 )::int AS avg_runtime_ms
		FROM problems p
		WHERE p.slug = $1
	`

	var problem Problem
	var successfulSubs int
	if err := s.pool.QueryRow(ctx, query, slug).Scan(
		&problem.ID,
		&problem.Slug,
		&problem.Module,
		&problem.Type,
		&problem.Language,
		&problem.Title,
		&problem.Statement,
		&problem.Constraints,
		&problem.LearningObjective,
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
		&problem.TotalSubmissions,
		&successfulSubs,
		&problem.AvgRuntimeMs,
	); err != nil {
		return nil, fmt.Errorf("failed to get problem by slug: %w", err)
	}

	if problem.TotalSubmissions > 0 {
		problem.SuccessRate = float64(successfulSubs) / float64(problem.TotalSubmissions) * 100
	}
	if problem.AvgRuntimeMs > 0 {
		problem.EstTimeMinutes = int((problem.AvgRuntimeMs + 59999) / 60000)
	}

	// Load non-hidden example test cases (limit 3)
	tcRows, err := s.pool.Query(ctx, `SELECT id, input, expected, is_hidden, ordinal FROM test_cases WHERE problem_id = $1 AND is_hidden = false ORDER BY ordinal ASC LIMIT 3`, problem.ID)
	if err == nil {
		defer tcRows.Close()
		examples := make([]TestCase, 0)
		for tcRows.Next() {
			var tc TestCase
			if err := tcRows.Scan(&tc.ID, &tc.Input, &tc.Expected, &tc.IsHidden, &tc.Ordinal); err != nil {
				continue
			}
			examples = append(examples, tc)
		}
		problem.Examples = examples
	}

	return &problem, nil
}

// ListProblemsNeedingEnrichment returns hidden problems that still need AI enrichment.
func (s *PostgresStore) ListProblemsNeedingEnrichment(ctx context.Context) ([]Problem, error) {
	query := `
		SELECT p.id, p.slug, p.module, p.type, p.language, p.title, p.statement,
		       p.constraints, p.learning_objective,
		       p.func_name, p.return_type, p.param_types, p.hints, p.difficulty,
		       p.xp_reward, p.tags, p.visible, p.source_hash, p.raw_readme,
		       p.created_at, p.updated_at
		FROM problems p
		WHERE p.visible = false
		ORDER BY p.created_at ASC
		LIMIT 100
	`

	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query problems needing enrichment: %w", err)
	}
	defer rows.Close()

	var problems []Problem
	for rows.Next() {
		var problem Problem
		if err := rows.Scan(
			&problem.ID,
			&problem.Slug,
			&problem.Module,
			&problem.Type,
			&problem.Language,
			&problem.Title,
			&problem.Statement,
			&problem.Constraints,
			&problem.LearningObjective,
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
		); err != nil {
			return nil, fmt.Errorf("failed to scan problem row: %w", err)
		}
		problems = append(problems, problem)
	}

	if rows.Err() != nil {
		return nil, fmt.Errorf("row iteration error: %w", rows.Err())
	}

	return problems, nil
}

// UpdateProblemVisibility sets the visible flag for a problem by ID.
func (s *PostgresStore) UpdateProblemVisibility(ctx context.Context, problemID uuid.UUID, visible bool) error {
	if problemID == uuid.Nil {
		return fmt.Errorf("problemID cannot be nil")
	}

	query := `UPDATE problems SET visible = $1, updated_at = NOW() WHERE id = $2`
	tag, err := s.pool.Exec(ctx, query, visible, problemID)
	if err != nil {
		return fmt.Errorf("failed to update problem visibility: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("problem not found: %s", problemID.String())
	}
	return nil
}

// UpsertTestCasesForProblem deletes existing case rows for a problem and inserts the current set.
func (s *PostgresStore) UpsertTestCasesForProblem(ctx context.Context, problemID uuid.UUID, testCases []TestCase) error {
	if problemID == uuid.Nil {
		return fmt.Errorf("problemID cannot be nil")
	}

	if len(testCases) == 0 {
		return fmt.Errorf("testCases cannot be empty")
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	if _, err := tx.Exec(ctx, `DELETE FROM test_cases WHERE problem_id = $1`, problemID); err != nil {
		return fmt.Errorf("failed to delete existing test cases: %w", err)
	}

	if len(testCases) > 0 {
		valueStrings := make([]string, 0, len(testCases))
		args := make([]interface{}, 0, 1+len(testCases)*4)
		args = append(args, problemID)
		for i, tc := range testCases {
			base := 1 + i*4
			valueStrings = append(valueStrings, fmt.Sprintf("($1, $%d, $%d, $%d, $%d)", base+1, base+2, base+3, base+4))
			args = append(args, tc.Input, tc.Expected, tc.IsHidden, tc.Ordinal)
		}
		insertQuery := `INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ` + strings.Join(valueStrings, ", ")
		if _, err := tx.Exec(ctx, insertQuery, args...); err != nil {
			return fmt.Errorf("failed to bulk insert test cases: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit test case transaction: %w", err)
	}

	return nil
}

// ListAllProblemsAdmin returns all problems (visible and non-visible) for the admin dashboard.
func (s *PostgresStore) ListAllProblemsAdmin(ctx context.Context) ([]Problem, error) {
	query := `
		SELECT p.id, p.slug, p.module, p.type, p.language, p.title,
		       p.statement, p.constraints, p.learning_objective,
		       p.func_name, p.return_type, p.param_types, p.hints, p.difficulty,
		       p.xp_reward, p.tags, p.visible, p.source_hash,
		       p.created_at, p.updated_at
		FROM problems p
		ORDER BY p.module, p.difficulty ASC
		LIMIT 200
	`

	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query all problems: %w", err)
	}
	defer rows.Close()

	var problems []Problem
	for rows.Next() {
		var problem Problem
		if err := rows.Scan(
			&problem.ID,
			&problem.Slug,
			&problem.Module,
			&problem.Type,
			&problem.Language,
			&problem.Title,
			&problem.Statement,
			&problem.Constraints,
			&problem.LearningObjective,
			&problem.FuncName,
			&problem.ReturnType,
			&problem.ParamTypes,
			&problem.Hints,
			&problem.Difficulty,
			&problem.XPReward,
			&problem.Tags,
			&problem.Visible,
			&problem.SourceHash,
			&problem.CreatedAt,
			&problem.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan problem: %w", err)
		}
		problems = append(problems, problem)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("problems iteration error: %w", err)
	}

	if problems == nil {
		problems = make([]Problem, 0)
	}

	return problems, nil
}

// UpdateProblem updates all editable fields for a problem by ID.
func (s *PostgresStore) UpdateProblem(ctx context.Context, problem *Problem) (*Problem, error) {
	if problem == nil {
		return nil, fmt.Errorf("problem cannot be nil")
	}

	query := `
		UPDATE problems SET
		    title = $1, statement = $2, constraints = $3,
		    learning_objective = $4, module = $5, type = $6,
		    language = $7, func_name = $8, return_type = $9,
		    param_types = $10, hints = $11, difficulty = $12,
		    xp_reward = $13, tags = $14, visible = $15,
		    updated_at = NOW()
		WHERE id = $16
		RETURNING id, slug, module, type, language, title, statement,
		          constraints, learning_objective,
		          func_name, return_type, param_types, hints, difficulty,
		          xp_reward, tags, visible, source_hash,
		          created_at, updated_at
	`

	var updated Problem
	if err := s.pool.QueryRow(ctx, query,
		problem.Title,
		problem.Statement,
		problem.Constraints,
		problem.LearningObjective,
		problem.Module,
		problem.Type,
		problem.Language,
		problem.FuncName,
		problem.ReturnType,
		problem.ParamTypes,
		problem.Hints,
		problem.Difficulty,
		problem.XPReward,
		problem.Tags,
		problem.Visible,
		problem.ID,
	).Scan(
		&updated.ID,
		&updated.Slug,
		&updated.Module,
		&updated.Type,
		&updated.Language,
		&updated.Title,
		&updated.Statement,
		&updated.Constraints,
		&updated.LearningObjective,
		&updated.FuncName,
		&updated.ReturnType,
		&updated.ParamTypes,
		&updated.Hints,
		&updated.Difficulty,
		&updated.XPReward,
		&updated.Tags,
		&updated.Visible,
		&updated.SourceHash,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	); err != nil {
		return nil, fmt.Errorf("failed to update problem: %w", err)
	}

	return &updated, nil
}
