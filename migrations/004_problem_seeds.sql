-- =============================================================================
-- 004_problem_seeds.sql
-- Seed: 10 visible function-type problems (piscine module, Go language)
--
-- Expected values are JSON-serialized to match sandbox runner output format.
-- Two-sum results are stored as sorted ascending indices; the judge must
-- sort both sides before comparison when order is contractually undefined.
-- source_hash prefix "MANUAL:" marks rows as hand-authored so the ingestion
-- pipeline never overwrites them during a GitHub sync.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Problem 1: Reverse a string
-- ---------------------------------------------------------------------------
WITH p AS (
    INSERT INTO problems (
        slug, module, type, language, title, statement,
        func_name, return_type, param_types,
        hints, difficulty, xp_reward, tags,
        visible, source_hash, raw_readme
    ) VALUES (
        'reverse-string',
        'piscine',
        'function',
        'go',
        'Reverse String',
        'Given a string, return a new string with the characters in reverse order.',
        'ReverseString',
        'string',
        ARRAY['string']::text[],
        ARRAY[
            'Go strings are UTF-8 encoded; iterate over runes, not bytes.',
            'Build the result one rune at a time in reverse.',
            'Consider edge cases: empty string, single character.'
        ],
        1,
        50,
        ARRAY['strings', 'runes', 'basic'],
        true,
        'MANUAL:reverse-string',
        $$Reverse the input string and return the reversed value.$$
    ) RETURNING id
)
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    ((SELECT id FROM p), '["hello"]'::jsonb, '"olleh"', false, 1),
    ((SELECT id FROM p), '["GoLang"]'::jsonb, '"gnaLoG"', false, 2),
    ((SELECT id FROM p), '["racecar"]'::jsonb, '"racecar"', false, 3),
    ((SELECT id FROM p), '[""]'::jsonb, '""', true, 4),
    ((SELECT id FROM p), '["a"]'::jsonb, '"a"', true, 5);

-- ---------------------------------------------------------------------------
-- Problem 2: Prime number checker
-- ---------------------------------------------------------------------------
WITH p AS (
    INSERT INTO problems (
        slug, module, type, language, title, statement,
        func_name, return_type, param_types,
        hints, difficulty, xp_reward, tags,
        visible, source_hash, raw_readme
    ) VALUES (
        'is-prime',
        'piscine',
        'function',
        'go',
        'Prime Checker',
        'Return true if the given positive integer is a prime number, false otherwise.',
        'IsPrime',
        'bool',
        ARRAY['int']::text[],
        ARRAY[
            'A prime number is greater than 1.',
            'Check divisibility only up to the square root of n.',
            '2 is the only even prime; all other primes are odd.'
        ],
        1,
        50,
        ARRAY['math', 'numbers', 'basic'],
        true,
        'MANUAL:is-prime',
        $$Determine whether the input number is prime.$$
    ) RETURNING id
)
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    ((SELECT id FROM p), '[2]'::jsonb, 'true', false, 1),
    ((SELECT id FROM p), '[15]'::jsonb, 'false', false, 2),
    ((SELECT id FROM p), '[17]'::jsonb, 'true', false, 3),
    ((SELECT id FROM p), '[1]'::jsonb, 'false', true, 4),
    ((SELECT id FROM p), '[97]'::jsonb, 'true', true, 5);

-- ---------------------------------------------------------------------------
-- Problem 3: Sum of even numbers
-- ---------------------------------------------------------------------------
WITH p AS (
    INSERT INTO problems (
        slug, module, type, language, title, statement,
        func_name, return_type, param_types,
        hints, difficulty, xp_reward, tags,
        visible, source_hash, raw_readme
    ) VALUES (
        'sum-even-numbers',
        'piscine',
        'function',
        'go',
        'Sum Even Numbers',
        'Return the sum of all even numbers in the provided integer slice. Return 0 for an empty slice.',
        'SumEvenNumbers',
        'int',
        ARRAY['[]int']::text[],
        ARRAY[
            'Iterate through the slice and check each value.',
            'A number is even if n % 2 == 0.',
            'An empty slice should return 0.'
        ],
        1,
        60,
        ARRAY['arrays', 'loops', 'basic'],
        true,
        'MANUAL:sum-even-numbers',
        $$Compute the sum of even integers in the list.$$
    ) RETURNING id
)
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    ((SELECT id FROM p), '[[1,2,3,4,5]]'::jsonb, '6', false, 1),
    ((SELECT id FROM p), '[[10,11,12,13]]'::jsonb, '22', false, 2),
    ((SELECT id FROM p), '[[]]'::jsonb, '0', false, 3),
    ((SELECT id FROM p), '[[-2,-4,1,3]]'::jsonb, '-6', true, 4);

-- ---------------------------------------------------------------------------
-- Problem 4: Merge two sorted arrays
-- ---------------------------------------------------------------------------
WITH p AS (
    INSERT INTO problems (
        slug, module, type, language, title, statement,
        func_name, return_type, param_types,
        hints, difficulty, xp_reward, tags,
        visible, source_hash, raw_readme
    ) VALUES (
        'merge-sorted-arrays',
        'piscine',
        'function',
        'go',
        'Merge Sorted Arrays',
        'Given two sorted integer slices, return a single sorted slice containing all elements from both.',
        'MergeSortedArrays',
        '[]int',
        ARRAY['[]int', '[]int']::text[],
        ARRAY[
            'Use two pointers — one per slice — and advance the smaller one each step.',
            'Append any remaining elements after one pointer is exhausted.',
            'Handle empty input slices gracefully.'
        ],
        2,
        100,
        ARRAY['arrays', 'sorting', 'medium'],
        true,
        'MANUAL:merge-sorted-arrays',
        $$Merge two sorted lists into a single sorted result.$$
    ) RETURNING id
)
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    ((SELECT id FROM p), '[[1,3,5],[2,4,6]]'::jsonb, '[1,2,3,4,5,6]', false, 1),
    ((SELECT id FROM p), '[[1,2,2],[2,3]]'::jsonb, '[1,2,2,2,3]', false, 2),
    ((SELECT id FROM p), '[[],[7,8]]'::jsonb, '[7,8]', false, 3),
    ((SELECT id FROM p), '[[],[]]'::jsonb, '[]', true, 4);

-- ---------------------------------------------------------------------------
-- Problem 5: Word frequency counter
-- ---------------------------------------------------------------------------
WITH p AS (
    INSERT INTO problems (
        slug, module, type, language, title, statement,
        func_name, return_type, param_types,
        hints, difficulty, xp_reward, tags,
        visible, source_hash, raw_readme
    ) VALUES (
        'word-frequency',
        'piscine',
        'function',
        'go',
        'Word Frequency',
        'Return a map counting each word in the provided sentence. Split on spaces, normalize to lowercase, and strip punctuation before counting.',
        'WordFrequency',
        'map[string]int',
        ARRAY['string']::text[],
        ARRAY[
            'Normalize all words to lowercase before inserting into the map.',
            'Strip trailing/leading punctuation from each token.',
            'Guard against empty tokens when splitting.'
        ],
        2,
        110,
        ARRAY['strings', 'maps', 'medium'],
        true,
        'MANUAL:word-frequency',
        $$Count words in a sentence and return a frequency map.$$
    ) RETURNING id
)
-- NOTE: expected values are JSON objects. Judge comparison must be
-- key-value equality, not string equality, because map JSON order is not stable.
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    ((SELECT id FROM p), '["Hello hello world"]'::jsonb,    '{"hello":2,"world":1}',    false, 1),
    ((SELECT id FROM p), '["Go is great!"]'::jsonb,         '{"go":1,"is":1,"great":1}', false, 2),
    ((SELECT id FROM p), '["repeat repeat repeat"]'::jsonb, '{"repeat":3}',             false, 3),
    ((SELECT id FROM p), '[""]'::jsonb,                     '{}',                        true,  4);

-- ---------------------------------------------------------------------------
-- Problem 6: Matrix diagonal sum
-- ---------------------------------------------------------------------------
WITH p AS (
    INSERT INTO problems (
        slug, module, type, language, title, statement,
        func_name, return_type, param_types,
        hints, difficulty, xp_reward, tags,
        visible, source_hash, raw_readme
    ) VALUES (
        'matrix-diagonal-sum',
        'piscine',
        'function',
        'go',
        'Matrix Diagonal Sum',
        'Given a square integer matrix (n×n), return the sum of elements on the main diagonal (top-left to bottom-right).',
        'MatrixDiagonalSum',
        'int',
        ARRAY['[][]int']::text[],
        ARRAY[
            'The main diagonal element at row i is matrix[i][i].',
            'Iterate once over rows — no nested loops are required.',
            'A 1×1 matrix should return its only element.'
        ],
        2,
        110,
        ARRAY['matrices', 'loops', 'medium'],
        true,
        'MANUAL:matrix-diagonal-sum',
        $$Sum the main diagonal values of a square matrix.$$
    ) RETURNING id
)
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    ((SELECT id FROM p), '[[[1,2,3],[4,5,6],[7,8,9]]]'::jsonb, '15', false, 1),
    ((SELECT id FROM p), '[[[5,0],[0,5]]]'::jsonb,             '10', false, 2),
    ((SELECT id FROM p), '[[[7]]]'::jsonb,                     '7',  false, 3);

-- ---------------------------------------------------------------------------
-- Problem 7: Rotate matrix clockwise 90°
-- ---------------------------------------------------------------------------
WITH p AS (
    INSERT INTO problems (
        slug, module, type, language, title, statement,
        func_name, return_type, param_types,
        hints, difficulty, xp_reward, tags,
        visible, source_hash, raw_readme
    ) VALUES (
        'rotate-matrix',
        'piscine',
        'function',
        'go',
        'Rotate Matrix',
        'Rotate a square matrix 90 degrees clockwise and return the rotated matrix. Do not modify the input.',
        'RotateMatrix',
        '[][]int',
        ARRAY['[][]int']::text[],
        ARRAY[
            'A 90° clockwise rotation maps element [i][j] to [j][n-1-i].',
            'Alternatively, transpose the matrix and then reverse each row.',
            'Allocate a new result matrix; do not mutate the input.'
        ],
        3,
        140,
        ARRAY['matrices', 'arrays', 'medium'],
        true,
        'MANUAL:rotate-matrix',
        $$Rotate a square matrix clockwise by 90 degrees.$$
    ) RETURNING id
)
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    ((SELECT id FROM p), '[[[1,2],[3,4]]]'::jsonb,           '[[3,1],[4,2]]',         false, 1),
    ((SELECT id FROM p), '[[[1,2,3],[4,5,6],[7,8,9]]]'::jsonb, '[[7,4,1],[8,5,2],[9,6,3]]', false, 2),
    ((SELECT id FROM p), '[[[42]]]'::jsonb,                  '[[42]]',                false, 3);

-- ---------------------------------------------------------------------------
-- Problem 8: Balanced parentheses checker
-- ---------------------------------------------------------------------------
WITH p AS (
    INSERT INTO problems (
        slug, module, type, language, title, statement,
        func_name, return_type, param_types,
        hints, difficulty, xp_reward, tags,
        visible, source_hash, raw_readme
    ) VALUES (
        'balanced-parentheses',
        'piscine',
        'function',
        'go',
        'Balanced Parentheses',
        'Return true if every opening bracket in the string has a corresponding closing bracket in the correct order. Supported pairs: (), [], {}. Ignore all other characters.',
        'BalancedParentheses',
        'bool',
        ARRAY['string']::text[],
        ARRAY[
            'Use a stack: push open brackets and match on closing brackets.',
            'If the stack is non-empty at the end, the string is unbalanced.',
            'Ignore non-bracket characters entirely.'
        ],
        2,
        100,
        ARRAY['strings', 'stacks', 'medium'],
        true,
        'MANUAL:balanced-parentheses',
        $$Check whether parentheses and brackets in a string are balanced.$$
    ) RETURNING id
)
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    ((SELECT id FROM p), '["()[]{}"]'::jsonb,   'true',  false, 1),
    ((SELECT id FROM p), '["([)]"]'::jsonb,     'false', false, 2),
    ((SELECT id FROM p), '["{[()()]}"]'::jsonb, 'true',  false, 3),
    ((SELECT id FROM p), '[""]'::jsonb,         'true',  true,  4),
    ((SELECT id FROM p), '["("]'::jsonb,        'false', true,  5);

-- ---------------------------------------------------------------------------
-- Problem 9: Longest common prefix
-- ---------------------------------------------------------------------------
WITH p AS (
    INSERT INTO problems (
        slug, module, type, language, title, statement,
        func_name, return_type, param_types,
        hints, difficulty, xp_reward, tags,
        visible, source_hash, raw_readme
    ) VALUES (
        'longest-common-prefix',
        'piscine',
        'function',
        'go',
        'Longest Common Prefix',
        'Given a slice of strings, return the longest common prefix shared by all strings. Return an empty string if there is no common prefix.',
        'LongestCommonPrefix',
        'string',
        ARRAY['[]string']::text[],
        ARRAY[
            'Compare characters column by column across all strings.',
            'Stop at the first column where any string diverges or ends.',
            'An empty string is a valid result when no common prefix exists.'
        ],
        2,
        110,
        ARRAY['strings', 'arrays', 'medium'],
        true,
        'MANUAL:longest-common-prefix',
        $$Find the longest common prefix for a list of strings.$$
    ) RETURNING id
)
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    ((SELECT id FROM p), '[ ["flower","flow","flight"] ]'::jsonb,              '"fl"',      false, 1),
    ((SELECT id FROM p), '[ ["dog","racecar","car"] ]'::jsonb,                 '""',        false, 2),
    ((SELECT id FROM p), '[ ["interspecies","interstellar","interstate"] ]'::jsonb, '"inters"', false, 3),
    ((SELECT id FROM p), '[ ["abc"] ]'::jsonb,                                  '"abc"',     true,  4);

-- ---------------------------------------------------------------------------
-- Problem 10: Two-sum indices
-- ---------------------------------------------------------------------------
-- JUDGE CONTRACT: expected is stored as a sorted JSON array.
-- The runner must sort both output indices and expected indices before comparison.
WITH p AS (
    INSERT INTO problems (
        slug, module, type, language, title, statement,
        func_name, return_type, param_types,
        hints, difficulty, xp_reward, tags,
        visible, source_hash, raw_readme
    ) VALUES (
        'two-sum-indices',
        'piscine',
        'function',
        'go',
        'Two Sum Indices',
        'Given a slice of integers and a target, return the indices of the two numbers that add up to the target. You may return indices in any order. Exactly one valid solution exists.',
        'TwoSumIndices',
        '[]int',
        ARRAY['[]int', 'int']::text[],
        ARRAY[
            'A hash map lets you check for the complement in O(1) per element.',
            'Store seen values as value→index pairs as you iterate.',
            'Exactly one valid pair is guaranteed; order is not important.'
        ],
        3,
        150,
        ARRAY['arrays', 'hashmap', 'medium'],
        true,
        'MANUAL:two-sum-indices',
        $$Find two indices for numbers that sum to the target. Return indices in any order.$$
    ) RETURNING id
)
-- Expected values are sorted ascending index pairs. The judge should sort output before comparing.
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    ((SELECT id FROM p), '[[2,7,11,15],9]'::jsonb,    '[0,1]', false, 1),
    ((SELECT id FROM p), '[[3,2,4],6]'::jsonb,       '[1,2]', false, 2),
    ((SELECT id FROM p), '[[3,3],6]'::jsonb,         '[0,1]', false, 3),
    ((SELECT id FROM p), '[[-1,-2,-3,-4,-5],-8]'::jsonb, '[2,4]', true, 4);
