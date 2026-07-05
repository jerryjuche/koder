-- ============================================================================
-- Split monolithic problem markdown into structured fields.
-- Adds dedicated columns for constraints and learning objectives so each
-- concept has its own home instead of being crammed into statement.
-- ============================================================================

ALTER TABLE problems
  ADD COLUMN IF NOT EXISTS constraints TEXT,
  ADD COLUMN IF NOT EXISTS learning_objective TEXT;
