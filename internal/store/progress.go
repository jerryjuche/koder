package store

import (
	"context"
	"fmt"
	"hash/fnv"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// advisoryLockID computes a deterministic int64 from user_id and problem_id
// for use with pg_advisory_xact_lock, preventing XP double-award races on
// concurrent first-solves where FOR UPDATE cannot lock a non-existent row.
func advisoryLockID(userID, problemID pgtype.UUID) int64 {
	h := fnv.New64a()
	h.Write(userID.Bytes[:])
	h.Write(problemID.Bytes[:])
	return int64(h.Sum64())
}

// UpsertProgress updates progress stats, solves, stars, and awards XP atomically.
func (s *PostgresStore) UpsertProgress(ctx context.Context, prog *Progress) error {
	if prog == nil {
		return fmt.Errorf("progress cannot be nil")
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	// Acquire advisory lock to serialize concurrent first-solves for this
	// (user, problem) pair. FOR UPDATE below cannot lock a row that doesn't
	// exist yet, so two concurrent callers would both see no row and both
	// INSERT — the second would get a unique violation (bad UX) or with
	// ON CONFLICT would double-award XP. This lock serializes them.
	_, err = tx.Exec(ctx, `SELECT pg_advisory_xact_lock($1)`, advisoryLockID(prog.UserID, prog.ProblemID))
	if err != nil {
		return fmt.Errorf("failed to acquire advisory lock: %w", err)
	}

	// 1. Get problem details (xp_reward)
	var xpReward int
	err = tx.QueryRow(ctx, `SELECT xp_reward FROM problems WHERE id = $1`, prog.ProblemID).Scan(&xpReward)
	if err != nil {
		return fmt.Errorf("failed to get problem xp_reward: %w", err)
	}

	// 2. Check current progress (with row lock to prevent XP double-award race)
	var currentSolved bool
	var currentStars int
	var currentBestRuntime *int
	var currentAttempts int
	var hasProgress bool

	err = tx.QueryRow(ctx, `
		SELECT solved, stars, best_runtime, attempts
		FROM progress
		WHERE user_id = $1 AND problem_id = $2
		FOR UPDATE
	`, prog.UserID, prog.ProblemID).Scan(&currentSolved, &currentStars, &currentBestRuntime, &currentAttempts)

	if err != nil {
		if err == pgx.ErrNoRows {
			hasProgress = false
		} else {
			return fmt.Errorf("failed to query existing progress: %w", err)
		}
	} else {
		hasProgress = true
	}

	// Calculate new fields
	newAttempts := currentAttempts + 1
	newSolved := currentSolved || prog.Solved

	newStars := currentStars
	if prog.Solved {
		calculatedStars := 1
		if newAttempts == 1 {
			calculatedStars = 3
		} else if newAttempts == 2 {
			calculatedStars = 2
		}
		if calculatedStars > currentStars {
			newStars = calculatedStars
		}
	}

	var newBestRuntime *int
	if prog.Solved {
		if currentBestRuntime == nil || prog.BestRuntime < *currentBestRuntime {
			newBestRuntime = &prog.BestRuntime
		} else {
			newBestRuntime = currentBestRuntime
		}
	}

	var xpToAward int
	if newSolved && !currentSolved {
		xpToAward = xpReward
	}

	// 3. Upsert progress row
	if hasProgress {
		_, err = tx.Exec(ctx, `
			UPDATE progress
			SET solved = $1, stars = $2, attempts = $3, best_runtime = $4, xp_awarded = xp_awarded + $5
			WHERE user_id = $6 AND problem_id = $7
		`, newSolved, newStars, newAttempts, newBestRuntime, xpToAward, prog.UserID, prog.ProblemID)
	} else {
		_, err = tx.Exec(ctx, `
			INSERT INTO progress (user_id, problem_id, solved, stars, attempts, best_runtime, xp_awarded)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`, prog.UserID, prog.ProblemID, newSolved, newStars, newAttempts, newBestRuntime, xpToAward)
	}
	if err != nil {
		return fmt.Errorf("failed to upsert progress: %w", err)
	}

	// 4. Update user's total XP if first solved
	if xpToAward > 0 {
		_, err = tx.Exec(ctx, `
			UPDATE users
			SET xp = xp + $1
			WHERE id = $2
		`, xpToAward, prog.UserID)
		if err != nil {
			return fmt.Errorf("failed to update user XP: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Update the caller's struct to reflect actual database state
	prog.Solved = newSolved
	prog.Stars = newStars
	prog.Attempts = newAttempts
	if newBestRuntime != nil {
		prog.BestRuntime = *newBestRuntime
	}
	if newSolved {
		prog.XPAwarded = xpReward
	}

	return nil
}
