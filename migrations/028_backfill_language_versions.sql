-- ============================================================================
-- 028: Seed language_versions for all Go problems.
--
-- Migration 027 added the column with a Go-only default backfilled from
-- func_name/return_type/param_types.  This migration derives Python entries
-- from the same Go metadata so every problem supports both languages.
--
-- The helper functions are kept as reusable PL/pgSQL so future raw SQL
-- INSERTs can use them directly to build language_versions inline.
--
-- Idempotent: safe to run multiple times; skips rows that already have a
-- proper Go entry AND a Python entry.
-- ============================================================================

-- Helper: PascalCase → snake_case
-- Handles: "Fibonacci" → "fibonacci", "FindMax" → "find_max",
--          "HTMLEscape" → "html_escape", "ParseJSON" → "parse_json"
CREATE OR REPLACE FUNCTION koder_to_snake_case(pascal TEXT) RETURNS TEXT
    IMMUTABLE
    LANGUAGE plpgsql AS $$
BEGIN
    IF pascal IS NULL OR pascal = '' THEN RETURN ''; END IF;
    RETURN lower(
        regexp_replace(
            regexp_replace(pascal, '([a-z0-9])([A-Z])', '\1_\2', 'g'),
            '([A-Z])([A-Z][a-z])', '\1_\2', 'g'
        )
    );
END;
$$;

-- Helper: Go type → Python type annotation
-- Covers every type used in the 180 seed problems plus common extras.
CREATE OR REPLACE FUNCTION koder_go_type_to_python(go_type TEXT) RETURNS TEXT
    IMMUTABLE
    LANGUAGE plpgsql AS $$
BEGIN
    RETURN CASE go_type
        WHEN 'int'            THEN 'int'
        WHEN 'int8'           THEN 'int'
        WHEN 'int16'          THEN 'int'
        WHEN 'int32'          THEN 'int'
        WHEN 'int64'          THEN 'int'
        WHEN 'uint'           THEN 'int'
        WHEN 'uint8'          THEN 'int'
        WHEN 'uint16'         THEN 'int'
        WHEN 'uint32'         THEN 'int'
        WHEN 'uint64'         THEN 'int'
        WHEN 'float32'        THEN 'float'
        WHEN 'float64'        THEN 'float'
        WHEN 'string'         THEN 'str'
        WHEN 'bool'           THEN 'bool'
        WHEN 'byte'           THEN 'int'
        WHEN 'rune'           THEN 'int'
        WHEN 'error'          THEN 'bool'
        WHEN '[]int'          THEN 'list'
        WHEN '[]int8'         THEN 'list'
        WHEN '[]int16'        THEN 'list'
        WHEN '[]int32'        THEN 'list'
        WHEN '[]int64'        THEN 'list'
        WHEN '[]uint'         THEN 'list'
        WHEN '[]uint8'        THEN 'list'
        WHEN '[]uint16'       THEN 'list'
        WHEN '[]uint32'       THEN 'list'
        WHEN '[]uint64'       THEN 'list'
        WHEN '[]float32'      THEN 'list'
        WHEN '[]float64'      THEN 'list'
        WHEN '[]string'       THEN 'list'
        WHEN '[]byte'         THEN 'list'
        WHEN '[]bool'         THEN 'list'
        WHEN '[]rune'         THEN 'list'
        WHEN 'map[string]int' THEN 'dict'
        WHEN 'map[string]string' THEN 'dict'
        WHEN 'map[string]bool' THEN 'dict'
        WHEN 'map[string]float64' THEN 'dict'
        ELSE go_type
    END;
END;
$$;

-- ============================================================================
-- Populate language_versions for every Go problem that has a real func_name
-- but lacks a proper Python entry.
-- Derives both Go and Python directly from the actual column values so this
-- works regardless of what 027's default left in the JSONB.
-- ============================================================================
UPDATE problems
SET language_versions = jsonb_build_object(
    'go', jsonb_build_object(
        'func_name',   func_name,
        'return_type', COALESCE(return_type, ''),
        'param_types', COALESCE(param_types, '{}'::text[])
    ),
    'python', jsonb_build_object(
        'func_name',   koder_to_snake_case(func_name),
        'return_type', koder_go_type_to_python(COALESCE(return_type, '')),
        'param_types', COALESCE(
            (SELECT array_agg(koder_go_type_to_python(t))
             FROM unnest(COALESCE(param_types, '{}'::text[])) AS t),
            '{}'::text[]
        )
    )
)
WHERE language = 'go'
  AND func_name IS NOT NULL
  AND func_name != ''
  AND (
    NOT (language_versions ? 'python')
    OR (language_versions#>'{go,func_name}' #>>'{}') = ''
    OR (language_versions#>'{python,func_name}' #>>'{}') = ''
  );
