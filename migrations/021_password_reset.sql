-- Password reset tokens for forgot-password flow
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    email      TEXT        NOT NULL,
    token_hash TEXT        NOT NULL PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens (expires_at);
