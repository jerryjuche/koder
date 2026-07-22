-- Wipe all user data except admin (maxjerry242@gmail.com)
-- Keeps: problems, test_cases, courses, modules, lessons, sections, projects intact
-- Run this in Supabase SQL Editor or via psql

BEGIN;

DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Identify the admin to preserve
    SELECT id INTO admin_id FROM users WHERE email = 'maxjerry242@gmail.com';

    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Admin user with email maxjerry242@gmail.com not found. Aborting.';
    END IF;

    RAISE NOTICE 'Preserving admin user: %', admin_id;

    -- 1. Tables with REFERENCES users(id) NO ACTION (no cascade) — must delete explicitly
    DELETE FROM submissions  WHERE user_id != admin_id;
    DELETE FROM progress     WHERE user_id != admin_id;

    -- 2. Tables with ON DELETE SET NULL — delete explicitly to fully clean up
    DELETE FROM feedback     WHERE user_id != admin_id;

    -- 3. Tables with ON DELETE CASCADE — safe to delete explicitly (belt and suspenders)
    DELETE FROM lesson_progress       WHERE user_id != admin_id;
    DELETE FROM course_progress       WHERE user_id != admin_id;
    DELETE FROM refresh_tokens        WHERE user_id != admin_id;
    DELETE FROM ai_usage_logs         WHERE user_id != admin_id;
    DELETE FROM notifications         WHERE user_id != admin_id;
    DELETE FROM submission_likes      WHERE user_id != admin_id;
    DELETE FROM user_problems         WHERE user_id != admin_id;
    DELETE FROM user_broadcast_status WHERE user_id != admin_id;

    -- 4. Tables with no user FK — wipe entirely (fresh state)
    DELETE FROM activity_logs;
    DELETE FROM token_blacklist;
    DELETE FROM password_reset_tokens;

    -- 5. Broadcasts created by non-admin users
    DELETE FROM broadcasts WHERE created_by != admin_id;

    -- 6. Delete non-admin users (cascades to all ON DELETE CASCADE tables)
    DELETE FROM users WHERE id != admin_id;

    RAISE NOTICE 'Done. Admin user % retained. All other users and their data cleared.', admin_id;
END $$;

COMMIT;
