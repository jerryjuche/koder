-- 051_email_logs.sql
-- Tracks every transactional email (password reset, admin reset) from creation
-- through delivery. `email_logs` records the request-side lifecycle (created →
-- sent/failed), while `email_webhook_events` records the asynchronous delivery
-- outcome reported by the Resend webhook (delivered/bounced/complained/delayed/
-- failed), keyed by provider email id.

-- Email lifecycle log (one row per send attempt)
CREATE TABLE IF NOT EXISTS email_logs (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reset_id           UUID,
    email              TEXT NOT NULL,
    flow               TEXT NOT NULL DEFAULT 'forgot_password',  -- forgot_password | admin_reset
    status             TEXT NOT NULL DEFAULT 'created',           -- created | sent | delivered | delivery_delayed | bounced | complained | failed
    provider_email_id  TEXT,                                      -- Resend email id returned by POST /emails
    attempts           INT  NOT NULL DEFAULT 0,
    error              TEXT,
    delivered_at       TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_provider_email_id ON email_logs (provider_email_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status_created_at ON email_logs (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_email ON email_logs (email);
CREATE INDEX IF NOT EXISTS idx_email_logs_reset_id ON email_logs (reset_id);

-- Webhook event log (one row per svix-id, dedupe key for at-least-once delivery)
CREATE TABLE IF NOT EXISTS email_webhook_events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    svix_id       TEXT NOT NULL UNIQUE,
    email_log_id  UUID REFERENCES email_logs (id) ON DELETE CASCADE,
    event_type    TEXT NOT NULL,
    payload       JSONB NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_webhook_events_email_log_id ON email_webhook_events (email_log_id);
