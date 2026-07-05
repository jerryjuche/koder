-- Add encrypted Gitea PAT token column for PAT-based linking
ALTER TABLE users ADD COLUMN gitea_token TEXT;
