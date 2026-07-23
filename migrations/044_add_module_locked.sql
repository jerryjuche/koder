-- Add locked column to modules table for admin-gated module access
ALTER TABLE modules ADD COLUMN IF NOT EXISTS locked BOOLEAN NOT NULL DEFAULT false;

-- Update existing rows to have locked=false (default) — no-op but explicit
UPDATE modules SET locked = false WHERE locked IS NULL;
