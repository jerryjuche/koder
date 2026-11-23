-- 056_admin_insight_reports.sql
-- Cache for the admin AI insights endpoint. Reports are keyed by (period,
-- question hash) so an identical question asked again inside the cache window
-- reuses the stored narrative instead of spending another model call.
-- The snapshot is stored alongside the report so the prose and the numbers it
-- cites always describe the same instant.

CREATE TABLE IF NOT EXISTS admin_insight_reports (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    period        TEXT NOT NULL,
    question_hash TEXT NOT NULL,
    question      TEXT NOT NULL,
    model         TEXT,
    report        JSONB NOT NULL,
    snapshot      JSONB NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_insight_reports_key
    ON admin_insight_reports (period, question_hash);

CREATE INDEX IF NOT EXISTS idx_admin_insight_reports_created_at
    ON admin_insight_reports (created_at DESC);
