-- Add composite index for streak calculation (consecutive passed submissions per user)
CREATE INDEX IF NOT EXISTS idx_submissions_user_status_date
ON submissions (user_id, status, created_at);
