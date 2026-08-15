-- 055_ai_solution_scores.sql
-- Numeric quality scores for AI code explanations.
-- The AI rubrics each dimension 0-100; NULL means "not scored yet" (older rows),
-- so reads COALESCE to 0 and the UI hides the gauge/radar until real scores exist.
ALTER TABLE ai_solution_explanations
    ADD COLUMN IF NOT EXISTS quality_score       INT,
    ADD COLUMN IF NOT EXISTS efficiency_score    INT,
    ADD COLUMN IF NOT EXISTS readability_score   INT,
    ADD COLUMN IF NOT EXISTS correctness_score   INT,
    ADD COLUMN IF NOT EXISTS best_practices_score INT;
