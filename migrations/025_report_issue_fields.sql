-- 025_report_issue_fields.sql
-- Adds structured problem-report fields to the feedback table.
-- These are optional — only populated when a user reports an issue from the workspace.

ALTER TABLE feedback
  ADD COLUMN IF NOT EXISTS problem_slug  TEXT,
  ADD COLUMN IF NOT EXISTS code_snippet  TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT;

CREATE INDEX IF NOT EXISTS idx_feedback_problem_slug ON feedback(problem_slug);
