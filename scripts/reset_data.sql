-- Reset all problem/progress/submission/reward data
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

UPDATE users SET xp = 0;

COMMIT;
