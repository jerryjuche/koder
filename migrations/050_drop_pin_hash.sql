-- 050_drop_pin_hash.sql
-- Removes the 6-digit recovery PIN system. Password recovery is now handled
-- exclusively via email (POST /auth/forgot-password + /auth/reset-password),
-- and password changes require the current password (POST /auth/change-password).
-- The 022_add_pin_hash.sql column and all related endpoints/handlers are obsolete.

ALTER TABLE users DROP COLUMN IF EXISTS pin_hash;
