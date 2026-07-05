-- 024_add_username_set.sql
-- Tracks whether a user has explicitly set their username during onboarding.
-- Users with username_set = false are prompted to set one on login.
ALTER TABLE users ADD COLUMN username_set BOOLEAN NOT NULL DEFAULT false;
