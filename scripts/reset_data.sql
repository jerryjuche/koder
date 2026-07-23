-- Remove all submissions + activity logs only.
-- Keeps everything else: user accounts, progress, XP, problems, curriculum.
--
-- Run via Supabase SQL editor.

BEGIN;

DELETE FROM submission_likes;
DELETE FROM submissions;
DELETE FROM activity_logs;

COMMIT;
