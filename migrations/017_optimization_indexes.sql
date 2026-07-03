-- Performance optimization indexes

-- High-impact indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_xp_desc ON users(xp DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_submissions_problem_status ON submissions(problem_id, status);
CREATE INDEX IF NOT EXISTS idx_submissions_status_created ON submissions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_problems_visible_created ON problems(visible, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_user_solved ON progress(user_id) WHERE solved = true;

-- Medium-impact indexes
CREATE INDEX IF NOT EXISTS idx_feedback_status_created ON feedback(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user_created ON feedback(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_problems_user_created ON user_problems(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_problems_status_created ON user_problems(status, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_test_cases_problem_visible ON test_cases(problem_id, is_hidden, ordinal);

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_broadcasts_created_by ON broadcasts(created_by);
CREATE INDEX IF NOT EXISTS idx_problems_author_id ON problems(author_id);
