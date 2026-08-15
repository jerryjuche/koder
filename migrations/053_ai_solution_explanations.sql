-- 053_ai_solution_explanations.sql
-- Cached AI-generated code explanations for Best Practices solutions.
-- One row per submission: a single NIM call generates it, then every user who
-- opens the same solution gets the cached result — no re-billing.
CREATE TABLE IF NOT EXISTS ai_solution_explanations (
    submission_id    UUID PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
    language         TEXT NOT NULL,
    summary          TEXT NOT NULL,
    approach         TEXT NOT NULL,
    time_complexity  TEXT NOT NULL,
    space_complexity TEXT NOT NULL,
    key_techniques   JSONB NOT NULL DEFAULT '[]',
    strengths        JSONB NOT NULL DEFAULT '[]',
    improvements     JSONB NOT NULL DEFAULT '[]',
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_solution_explanations_created_at
    ON ai_solution_explanations(created_at DESC);
