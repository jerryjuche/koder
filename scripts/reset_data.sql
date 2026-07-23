-- Reset all problem/progress/submission/activity data for non-admin users.
-- Keeps admin accounts, progress, XP, and submissions intact.
-- User accounts, curriculum, and module_meta are preserved.
--
-- Run via Supabase SQL editor.

BEGIN;

-- Preserve admin IDs for WHERE clause filters
CREATE TEMP TABLE admin_ids AS SELECT id FROM users WHERE role = 'admin';

-- Clear global tables (no user FK)
DELETE FROM broadcasts;
DELETE FROM activity_logs;
DELETE FROM ai_usage_logs;
DELETE FROM password_reset_tokens;
DELETE FROM token_blacklist;

-- Clear student-specific data
-- submission_likes and submissions cleared for ALL users
-- (they reference problems which are being deleted)
DELETE FROM submission_likes;
DELETE FROM submissions;

DELETE FROM progress WHERE user_id NOT IN (SELECT id FROM admin_ids);
DELETE FROM user_problems WHERE user_id NOT IN (SELECT id FROM admin_ids);
DELETE FROM feedback WHERE user_id NOT IN (SELECT id FROM admin_ids);
DELETE FROM notifications WHERE user_id NOT IN (SELECT id FROM admin_ids);
DELETE FROM refresh_tokens WHERE user_id NOT IN (SELECT id FROM admin_ids);
DELETE FROM user_broadcast_status WHERE user_id NOT IN (SELECT id FROM admin_ids);

-- Reset problems (admin submissions cleared above alongside all others)
DELETE FROM test_cases;
DELETE FROM problems;

-- Reset XP and solved count for non-admin users only
UPDATE users SET xp = 0, solved_count = 0 WHERE role != 'admin';

DROP TABLE admin_ids;

COMMIT;
