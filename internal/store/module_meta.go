package store

import (
	"context"
	"fmt"
	"time"
)

// ListModuleMeta returns all module metadata entries, pinned first then alphabetically.
func (s *PostgresStore) ListModuleMeta(ctx context.Context) ([]ModuleMeta, error) {
	rows, err := s.pool.Query(ctx, `SELECT module_name, display_name, is_pinned, created_at FROM module_meta ORDER BY is_pinned DESC, module_name ASC`)
	if err != nil {
		return nil, fmt.Errorf("failed to query module_meta: %w", err)
	}
	defer rows.Close()

	var metas []ModuleMeta
	for rows.Next() {
		var m ModuleMeta
		if err := rows.Scan(&m.ModuleName, &m.DisplayName, &m.IsPinned, &m.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan module_meta: %w", err)
		}
		metas = append(metas, m)
	}
	if rows.Err() != nil {
		return nil, fmt.Errorf("row iteration error: %w", rows.Err())
	}
	return metas, nil
}

// UpsertModuleMeta creates or updates a module's display name.
func (s *PostgresStore) UpsertModuleMeta(ctx context.Context, moduleName, displayName string) (*ModuleMeta, error) {
	var m ModuleMeta
	err := s.pool.QueryRow(ctx, `
		INSERT INTO module_meta (module_name, display_name)
		VALUES ($1, $2)
		ON CONFLICT (module_name)
		DO UPDATE SET display_name = EXCLUDED.display_name
		RETURNING module_name, display_name, is_pinned, created_at
	`, moduleName, displayName).Scan(&m.ModuleName, &m.DisplayName, &m.IsPinned, &m.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to upsert module_meta: %w", err)
	}
	return &m, nil
}

// SetModulePin sets the pinned state of a module (pinned modules appear first).
func (s *PostgresStore) SetModulePin(ctx context.Context, moduleName string, pinned bool) (*ModuleMeta, error) {
	var m ModuleMeta
	// Upsert to ensure row exists even if never seeded
	err := s.pool.QueryRow(ctx, `
		INSERT INTO module_meta (module_name, display_name, is_pinned)
		VALUES ($1, $2, $3)
		ON CONFLICT (module_name)
		DO UPDATE SET is_pinned = $3
		RETURNING module_name, display_name, is_pinned, created_at
	`, moduleName, moduleName, pinned).Scan(&m.ModuleName, &m.DisplayName, &m.IsPinned, &m.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to set module pin: %w", err)
	}

	// Log with timestamp since we're outside admin handler
	_, _ = s.pool.Exec(ctx, `INSERT INTO activity_logs (type, message, color, icon, created_at) VALUES ($1, $2, $3, $4, $5)`,
		"info",
		fmt.Sprintf("%s module '%s'", map[bool]string{true: "Pinned", false: "Unpinned"}[pinned], moduleName),
		"text-amber-400", "Pin",
		time.Now(),
	)

	return &m, nil
}

// ListAllModules returns all distinct modules from the problems table merged with module_meta and lock state.
func (s *PostgresStore) ListAllModules(ctx context.Context) ([]AllModule, error) {
	query := `
		SELECT DISTINCT p.module AS module_name,
			COALESCE(m.display_name, p.module) AS display_name,
			COALESCE(m.is_pinned, false) AS is_pinned,
			EXISTS(SELECT 1 FROM module_locks ml WHERE ml.module_name = p.module) AS is_locked,
			(SELECT COUNT(*) FROM problems p2 WHERE p2.module = p.module) AS problem_count
		FROM problems p
		LEFT JOIN module_meta m ON m.module_name = p.module
		UNION
		SELECT m.module_name,
			m.display_name,
			m.is_pinned,
			EXISTS(SELECT 1 FROM module_locks ml WHERE ml.module_name = m.module_name),
			0
		FROM module_meta m
		WHERE NOT EXISTS (SELECT 1 FROM problems p WHERE p.module = m.module_name)
		ORDER BY is_pinned DESC, module_name ASC`
	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query all modules: %w", err)
	}
	defer rows.Close()

	var modules []AllModule
	for rows.Next() {
		var m AllModule
		if err := rows.Scan(&m.ModuleName, &m.DisplayName, &m.IsPinned, &m.IsLocked, &m.ProblemCount); err != nil {
			return nil, fmt.Errorf("failed to scan all module: %w", err)
		}
		modules = append(modules, m)
	}
	if rows.Err() != nil {
		return nil, fmt.Errorf("row iteration error: %w", rows.Err())
	}
	return modules, nil
}
