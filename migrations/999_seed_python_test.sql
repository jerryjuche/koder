-- Simple Python problem to verify the multi-language pipeline.
-- Idempotent: safe to run multiple times.
-- Uses the koder_to_snake_case() and koder_go_type_to_python() helpers from 028.

DO $$
DECLARE
    prob_id uuid;
BEGIN
    -- Upsert the problem
    INSERT INTO problems (
        slug, module, type, language, title, statement,
        func_name, return_type, param_types,
        hints, difficulty, xp_reward, tags,
        visible, source_hash, raw_readme, language_versions
    ) VALUES (
        'py-double-it',
        'arrays-strings',
        'function',
        'go',
        'Double It (Python Test)',
        'Write a function that takes an integer and returns twice its value.',
        'DoubleIt',
        'int',
        '{int}',
        '{Hint: multiplication}',
        1,
        10,
        '{go,python,basics}',
        true,
        'manual-test-001',
        'Manual test problem for Python pipeline verification.',
        jsonb_build_object(
            'go', jsonb_build_object(
                'func_name',   'DoubleIt',
                'return_type', 'int',
                'param_types', '{int}'
            ),
            'python', jsonb_build_object(
                'func_name',   koder_to_snake_case('DoubleIt'),
                'return_type', koder_go_type_to_python('int'),
                'param_types', (SELECT array_agg(koder_go_type_to_python(t))
                                 FROM unnest('{int}'::text[]) AS t)
            )
        )
    )
    ON CONFLICT (slug) DO UPDATE SET
        statement = EXCLUDED.statement,
        visible = true
    RETURNING id INTO prob_id;

    -- Visible test case 1
    INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal)
    VALUES (prob_id, '[3]', '6', false, 1)
    ON CONFLICT (problem_id, ordinal) DO NOTHING;

    -- Hidden test case 2
    INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal)
    VALUES (prob_id, '[0]', '0', true, 2)
    ON CONFLICT (problem_id, ordinal) DO NOTHING;

    RAISE NOTICE 'Created/updated problem py-double-it with id %', prob_id;
END;
$$;
