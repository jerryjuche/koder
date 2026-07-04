-- Add PIN hash column for PIN-based password recovery
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash TEXT;
