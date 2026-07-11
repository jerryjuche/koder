-- 027_language_versions.sql
-- Multi-language support for Koder

ALTER TABLE users ADD COLUMN primary_language TEXT NOT NULL DEFAULT 'go';
CREATE INDEX idx_users_primary_language ON users (primary_language);

ALTER TABLE problems ADD COLUMN language_versions JSONB NOT NULL DEFAULT '{"go": {"func_name": "", "return_type": "", "param_types": []}}'::jsonb;

-- Backfill language_versions from existing columns for all current problems
UPDATE problems SET language_versions = jsonb_build_object(
  'go', jsonb_build_object(
    'func_name', COALESCE(func_name, ''),
    'return_type', COALESCE(return_type, ''),
    'param_types', COALESCE(param_types, '{}'::text[])
  )
) WHERE language = 'go' AND language_versions = '{"go": {"func_name": "", "return_type": "", "param_types": []}}'::jsonb;
