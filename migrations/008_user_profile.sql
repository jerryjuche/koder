-- 008_user_profile.sql

ALTER TABLE users
ADD COLUMN IF NOT EXISTS bio TEXT;
