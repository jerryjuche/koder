-- 057_admin_insight_threads.sql
-- Persistent conversations for the admin "Ask the Platform" analyst.
--
-- A thread belongs to one admin. Messages keep the narrative text (for
-- conversation history) plus the structured report and the SQL snapshot it was
-- generated from, so reopening a conversation shows exactly the numbers the
-- answer was written against.

CREATE TABLE IF NOT EXISTS admin_insight_threads (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      TEXT NOT NULL DEFAULT 'New conversation',
    period     TEXT NOT NULL DEFAULT 'today',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_insight_threads_admin
    ON admin_insight_threads (admin_id, updated_at DESC)
    WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS admin_insight_messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id  UUID NOT NULL REFERENCES admin_insight_threads(id) ON DELETE CASCADE,
    role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content    TEXT NOT NULL DEFAULT '',
    report     JSONB,
    snapshot   JSONB,
    model      TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_insight_messages_thread
    ON admin_insight_messages (thread_id, created_at);
