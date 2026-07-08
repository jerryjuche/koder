-- Output logs TTL: adds expiration column for automatic cleanup of stale
-- submission output logs, keeping the 500MB Postgres budget under control.
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS output_logs_expires_at TIMESTAMPTZ;

-- Set a default TTL of 90 days for all existing rows and new submissions.
UPDATE submissions SET output_logs_expires_at = NOW() + INTERVAL '90 days'
WHERE output_logs_expires_at IS NULL;
