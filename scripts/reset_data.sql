-- Reset all problem/progress/submission/reward/activity data
-- Keeps user accounts intact, resets XP to 0

BEGIN;

DELETE FROM user_broadcast_status;
DELETE FROM broadcasts;
DELETE FROM feedback;
DELETE FROM notifications;
DELETE FROM submission_likes;
DELETE FROM submissions;
DELETE FROM progress;
DELETE FROM user_problems;
DELETE FROM test_cases;
DELETE FROM problems;
DELETE FROM activity_logs;
DELETE FROM ai_usage_logs;
DELETE FROM refresh_tokens;
DELETE FROM password_reset_tokens;
DELETE FROM token_blacklist;

UPDATE users SET xp = 0, solved_count = 0;

COMMIT;
