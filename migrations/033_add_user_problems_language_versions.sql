-- 033_add_user_problems_language_versions.sql
-- Fix 500 error on /admin/user-problems/pending and related endpoints
-- by adding the language_versions column (missing from 005 schema).

ALTER TABLE user_problems
ADD COLUMN IF NOT EXISTS language_versions JSONB NOT NULL DEFAULT '{}'::jsonb;
