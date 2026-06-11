-- 002_indexes.sql
-- Performance indexes for Koder
-- User indexes
CREATE INDEX idx_users_student_id ON users (student_id);

CREATE INDEX idx_users_role ON users (role);

-- Problem indexes
CREATE INDEX idx_problems_slug ON problems (slug);

CREATE INDEX idx_problems_visible ON problems (visible);

CREATE INDEX idx_problems_module ON problems (module);

CREATE INDEX idx_problems_language ON problems (language);

-- Test case indexes
CREATE INDEX idx_test_cases_problem_id ON test_cases (problem_id);

-- Submission indexes
CREATE INDEX idx_submissions_user_id ON submissions (user_id);

CREATE INDEX idx_submissions_problem_id ON submissions (problem_id);

CREATE INDEX idx_submissions_status ON submissions (status);

CREATE INDEX idx_submissions_created_at ON submissions (created_at);

-- Progress indexes
CREATE INDEX idx_progress_user_id ON progress (user_id);

CREATE INDEX idx_progress_problem_id ON progress (problem_id);

CREATE INDEX idx_progress_solved ON progress (solved);