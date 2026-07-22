-- module_locks: tracks which problem modules (text categories) are locked by admin
CREATE TABLE IF NOT EXISTS module_locks (
    module_name TEXT PRIMARY KEY,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
