-- Token blacklist for JWT revocation
CREATE TABLE IF NOT EXISTS token_blacklist (
    jti        TEXT        NOT NULL PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient cleanup of expired entries
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON token_blacklist (expires_at);
