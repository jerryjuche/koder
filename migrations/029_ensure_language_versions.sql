-- ============================================================================
-- 029: Ensure language_versions for ALL problems (Go + Python)
--
-- Migration 028 backfilled language_versions for problems missing Python
-- entries.  This migration goes further — it guarantees EVERY problem in the
-- database has BOTH Go and Python entries, regardless of the legacy
-- `language` column or prior enrichment state.
--
-- The helper functions are recreated so this migration can run standalone
-- (e.g. on a fresh database where 028 was never applied).
--
-- Idempotent: safe to run multiple times.
-- ============================================================================

-- Helper: PascalCase → snake_case
CREATE OR REPLACE FUNCTION koder_to_snake_case(pascal TEXT) RETURNS TEXT
    IMMUTABLE
    LANGUAGE plpgsql AS $$
BEGIN
    IF pascal IS NULL OR pascal = '' THEN RETURN ''; END if;
    RETURN lower(
        regexp_replace(
            regexp_replace(pascal, '([a-z0-9])([A-Z])', '\1_\2', 'g'),
            '([A-Z])([A-Z][a-z])', '\1_\2', 'g'
        )
    );
END;
$$;

-- Helper: Go type → Python type annotation
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
        WHEN 'uint32'        THEN 'int'
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
-- Set language_versions for ALL problems that lack one or both language entries.
-- Uses the actual column values (func_name, return_type, param_types) as the
-- Go spec and derives the Python spec from them.
--
-- Skips problems that already have a complete language_versions with both
-- Go and Python entries containing non-empty func_name values.
-- ============================================================================
UPDATE problems
SET language_versions = jsonb_build_object(
    'go', jsonb_build_object(
        'func_name',   COALESCE(func_name, ''),
        'return_type', COALESCE(return_type, ''),
        'param_types', COALESCE(param_types, '{}'::text[])
    ),
    'python', jsonb_build_object(
        'func_name',   COALESCE(
            NULLIF(koder_to_snake_case(func_name), ''),
            func_name,
            ''
        ),
        'return_type', koder_go_type_to_python(COALESCE(return_type, '')),
        'param_types', COALESCE(
            (SELECT array_agg(koder_go_type_to_python(t))
             FROM unnest(COALESCE(param_types, '{}'::text[])) AS t),
            '{}'::text[]
        )
    )
)
WHERE func_name IS NOT NULL
  AND func_name != ''
  AND (
    language_versions IS NULL
    OR language_versions = '{}'::jsonb
    OR NOT (language_versions ? 'go')
    OR NOT (language_versions ? 'python')
    OR (language_versions#>'{go,func_name}' #>>'{}') = ''
    OR (language_versions#>'{python,func_name}' #>>'{}') = ''
  );

-- ============================================================================
-- Handle edge case: problems with empty/funky func_name (unlikely, but safe).
-- Give them a minimal dual-language entry so the language filter never breaks.
-- ============================================================================
UPDATE problems
SET language_versions = jsonb_build_object(
    'go',     jsonb_build_object('func_name', '', 'return_type', '', 'param_types', '{}'::text[]),
    'python', jsonb_build_object('func_name', '', 'return_type', '', 'param_types', '{}'::text[])
)
WHERE language_versions IS NULL
   OR language_versions = '{}'::jsonb
   OR NOT (language_versions ? 'go' AND language_versions ? 'python');

-- ============================================================================
-- Verification
-- ============================================================================
DO $$
DECLARE
    total       INT;
    missing     INT;
    go_count    INT;
    py_count    INT;
BEGIN
    SELECT COUNT(*) INTO total FROM problems;

    SELECT COUNT(*) INTO missing
    FROM problems
    WHERE language_versions IS NULL
       OR language_versions = '{}'::jsonb
       OR NOT (language_versions ? 'go')
       OR NOT (language_versions ? 'python');

    SELECT COUNT(*) INTO go_count
    FROM problems
    WHERE language_versions ? 'go'
      AND language_versions#>'{go,func_name}' #>>'{}' != '';

    SELECT COUNT(*) INTO py_count
    FROM problems
    WHERE language_versions ? 'python'
      AND language_versions#>'{python,func_name}' #>>'{}' != '';

    RAISE NOTICE '029: % total problems, % missing language_versions, % with Go func_name, % with Python func_name',
        total, missing, go_count, py_count;
END;
$$;
