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
