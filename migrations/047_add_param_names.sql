-- Add param_names column for descriptive parameter names in scaffold generation
-- Previously parameter names were auto-generated as arg1, arg2, arg3 from array indices
-- This column stores human-readable names (e.g., {"s"}, {"nums", "target"}) 
-- that correspond 1:1 with param_types

ALTER TABLE problems ADD COLUMN IF NOT EXISTS param_names TEXT[] DEFAULT '{}';

-- Update the language_versions JSONB to optionally include param_names per language
-- This allows Go and Python to have language-specific parameter names if needed
-- e.g., {"go": {"func_name": "...", "param_names": ["nums", "target"], ...}}

COMMENT ON COLUMN problems.param_names IS 'Descriptive parameter names corresponding 1:1 to param_types. Used in Monaco editor scaffold generation to replace generic arg1/arg2/arg3 names.';
