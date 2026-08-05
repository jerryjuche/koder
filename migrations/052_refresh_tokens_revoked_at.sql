-- 052_refresh_tokens_revoked_at.sql
-- Adds revoked_at to refresh_tokens so token-rotation reuse detection can
-- distinguish a benign concurrent refresh (two tabs waking at the same token
-- boundary) from a genuine replay attack. A recently-revoked token (< 30s) is
-- the rotation race and must NOT cascade-revoke the user's other sessions;
-- an older reuse is treated as theft and revokes everything.

ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked_at ON refresh_tokens (revoked_at);
