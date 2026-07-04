-- Add Gitea OAuth2 profile fields to users table
ALTER TABLE users ADD COLUMN gitea_id         BIGINT UNIQUE;
ALTER TABLE users ADD COLUMN gitea_username   TEXT;
ALTER TABLE users ADD COLUMN gitea_email      TEXT;
ALTER TABLE users ADD COLUMN gitea_avatar_url TEXT;
