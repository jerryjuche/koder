package store

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

// ListLockedModules returns all locked problem module names.
func (s *PostgresStore) ListLockedModules(ctx context.Context) ([]ModuleLock, error) {
	rows, err := s.pool.Query(ctx, `SELECT module_name, created_at FROM module_locks ORDER BY module_name`)
	if err != nil {
		return nil, fmt.Errorf("failed to query module_locks: %w", err)
	}
	defer rows.Close()

	var locks []ModuleLock
	for rows.Next() {
		var l ModuleLock
		if err := rows.Scan(&l.ModuleName, &l.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan module_lock: %w", err)
		}
		locks = append(locks, l)
	}
	if rows.Err() != nil {
		return nil, fmt.Errorf("row iteration error: %w", rows.Err())
	}
	return locks, nil
}

// ToggleProblemModuleLock toggles the lock state for a problem module.
// Returns true if the module is now locked, false if unlocked.
func (s *PostgresStore) ToggleProblemModuleLock(ctx context.Context, moduleName string) (bool, error) {
	// Try to insert — if module_name already exists, delete it instead
	tag, err := s.pool.Exec(ctx, `DELETE FROM module_locks WHERE module_name = $1`, moduleName)
	if err != nil {
		return false, fmt.Errorf("failed to toggle module lock: %w", err)
	}
	if tag.RowsAffected() > 0 {
		return false, nil // was locked, now unlocked
	}

	_, err = s.pool.Exec(ctx, `INSERT INTO module_locks (module_name) VALUES ($1) ON CONFLICT DO NOTHING`, moduleName)
	if err != nil {
		return false, fmt.Errorf("failed to insert module lock: %w", err)
	}
	return true, nil // now locked
}

// IsModuleLocked returns whether a problem module is currently locked.
func (s *PostgresStore) IsModuleLocked(ctx context.Context, moduleName string) (bool, error) {
	var exists bool
	err := s.pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM module_locks WHERE module_name = $1)`, moduleName).Scan(&exists)
	if err != nil {
		if err == pgx.ErrNoRows {
			return false, nil
		}
		return false, fmt.Errorf("failed to check module lock: %w", err)
	}
	return exists, nil
}

// DeleteProblemModule deletes all problems in a module and removes its module lock.
// Deletes submissions and progress first to handle FK constraints, then problems (cascades to test_cases).
func (s *PostgresStore) DeleteProblemModule(ctx context.Context, moduleName string) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Delete submissions for problems in this module (cascades to submission_likes)
	_, err = tx.Exec(ctx, `DELETE FROM submissions WHERE problem_id IN (SELECT id FROM problems WHERE module = $1)`, moduleName)
	if err != nil {
		return fmt.Errorf("failed to delete submissions: %w", err)
	}

	// Delete progress for problems in this module
	_, err = tx.Exec(ctx, `DELETE FROM progress WHERE problem_id IN (SELECT id FROM problems WHERE module = $1)`, moduleName)
	if err != nil {
		return fmt.Errorf("failed to delete progress: %w", err)
	}

	// Delete problems (cascades to test_cases)
	_, err = tx.Exec(ctx, `DELETE FROM problems WHERE module = $1`, moduleName)
	if err != nil {
		return fmt.Errorf("failed to delete problems: %w", err)
	}

	// Remove the module lock if it exists
	_, err = tx.Exec(ctx, `DELETE FROM module_locks WHERE module_name = $1`, moduleName)
	if err != nil {
		return fmt.Errorf("failed to delete module lock: %w", err)
	}

	return tx.Commit(ctx)
}
