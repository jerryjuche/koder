-- 043_seed_python_mastery_practice.sql
-- 30 Professional Python Practice Problems
-- Difficulty: 1–5 (Beginner → Advanced)
--
-- Each problem includes:
--   - A descriptive statement with real-world analogy
--   - Constraints, learning objective, 3 hints
--   - 5–7 test cases (2–3 visible examples + 3–4 hidden edge cases)
--   - Single-language Python (language_versions contains only "python")

-- ────────────────────────────────────────────────────────────────────────────
-- HELPER: attach test cases to a problem slug
-- ────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    prob_id UUID;
BEGIN

-- ════════════════════════════════════════════════════════════════════════════
-- 🟢 BEGINNER (1–8) — difficulty 1–2
-- ════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 1. The Empty Guard: Array Average Calculator
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-avg-calculator',
    'python-practice',
    'function',
    'python',
    'The Empty Guard: Array Average Calculator',
    E'Write a function `average_calculator` that takes a list of numbers and returns its mathematical mean.\n\n'
    'Your system must remain stable even when handed an empty dataset — a rogue empty list must never trigger a division-by-zero error.\n\n'
    '**Examples:**\n'
    '- `average_calculator([1, 2, 3, 4])` → `2.5`\n'
    '- `average_calculator([-2, 2])` → `0.0`\n'
    '- `average_calculator([])` → `0.0`',
    '- Input list length: 0 ≤ len(arr) ≤ 10_000\n- Element range: -10_000 ≤ arr[i] ≤ 10_000\n- Elements may be integers or floating-point\n- Return a float (Python float); return `0.0` for empty input',
    'Guard against edge cases (empty input) while computing a fundamental aggregate statistic: the arithmetic mean.',
    'average_calculator',
    'float',
    '{"list}',
    '{"Sum all elements with sum() then divide by the length — but only if the list is non-empty.","Use a conditional: if the list is empty, return 0.0 immediately.","Remember that dividing an int by an int in Python 3 yields a float automatically, but an empty sum([]) is 0, and 0 / 0 raises ZeroDivisionError."}',
    1,
    70,
    '{"python","beginner","arrays","math"}',
    true,
    'seed-py-avg-calculator',
    '## The Empty Guard: Array Average Calculator\n\nWrite a function `average_calculator` that takes a list of numbers and returns its mathematical mean.',
    '{"python": {"func_name": "average_calculator", "return_type": "float", "param_types": ["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-avg-calculator';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[1, 2, 3, 4]'::jsonb,       '2.5',   false, 1),
(prob_id, '[10]'::jsonb,                '10.0',  false, 2),
(prob_id, '[-2, 2]'::jsonb,             '0.0',   false, 3),
(prob_id, '[]'::jsonb,                  '0.0',   true,  4),
(prob_id, '[0, 0, 0]'::jsonb,           '0.0',   true,  5),
(prob_id, '[1.5, 2.5, 3.0]'::jsonb,    '2.3333333333333335', true, 6),
(prob_id, '[-5, -3, 8, 0]'::jsonb,      '0.0',   true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Inner-Core Extraction: Trimming Strings
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-trim-ends',
    'python-practice',
    'function',
    'python',
    'Inner-Core Extraction: Trimming Strings',
    E'Write a function `trim_ends` that removes the very first and very last character from a string, revealing its inner content.\n\n'
    'Think of it as peeling away the outermost shell of data to reach the core.\n\n'
    '**Examples:**\n'
    '- `trim_ends("hello")` → `"ell"`\n'
    '- `trim_ends("ab")` → `""`\n'
    '- `trim_ends("a")` → `""`',
    '- Input length: 0 ≤ len(str) ≤ 1000\n- Characters may include letters, digits, symbols, spaces, or unicode\n- If length < 2, return empty string',
    'Practice Python string slicing with negative indices and boundary handling for undersized inputs.',
    'trim_ends',
    'str',
    '{"str}',
    '{"Python slicing with str[1:-1] removes the first and last character in one elegant expression.","If the string has 0 or 1 character, slicing str[1:-1] already returns ''\"\"'' — test this!","For a 2-character string, str[1:-1] gives the empty string, which is exactly the expected result."}',
    1,
    70,
    '{"python","beginner","strings","slicing"}',
    true,
    'seed-py-trim-ends',
    '## Inner-Core Extraction: Trimming Strings',
    '{"python": {"func_name": "trim_ends", "return_type": "str", "param_types": ["str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-trim-ends';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '["hello"]'::jsonb,    '"ell"',   false, 1),
(prob_id, '["code"]'::jsonb,     '"od"',    false, 2),
(prob_id, '["ab"]'::jsonb,       to_jsonb(''::text),      false, 3),
(prob_id, '["a"]'::jsonb,        to_jsonb(''::text),      true,  4),
(prob_id, '[""]'::jsonb,         to_jsonb(''::text),      true,  5),
(prob_id, '["12345"]'::jsonb,    '"234"',   true,  6),
(prob_id, '["!@#"]'::jsonb,      '"@"',     true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Strict Membership: The Containment Check
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-contains-value',
    'python-practice',
    'function',
    'python',
    'Strict Membership: The Containment Check',
    E'Build a search module `contains_value` that inspects a heterogeneous list — one mixing integers, strings, booleans, and other types — to determine whether a target value exists within it.\n\n'
    'The check must use value equality (==), not identity (is), but must respect Python\'s natural type coercion rules.\n\n'
    '**Examples:**\n'
    '- `contains_value([1, "2", 3], 1)` → `True`\n'
    '- `contains_value([1, "2", 3], "2")` → `True`\n'
    '- `contains_value([1, "2", 3], 2)` → `False`',
    '- Input list length: 0 ≤ len(a) ≤ 10_000\n- Elements may be int, float, str, bool, None, or nested lists\n- Use standard Python `in` operator (value equality)',
    'Learn to search heterogeneous collections with Python\'s `in` operator, understanding how equality behaves across types.',
    'contains_value',
    'bool',
    '{"list,"any}',
    '{"Python''s `in` operator is the simplest way — `return x in a`.","The `in` operator uses `==` under the hood, so `1 == True` evaluates to True — be aware of this!","For an empty list, `in` always returns False, which is a safe default."}',
    1,
    70,
    '{"python","beginner","arrays","search"}',
    true,
    'seed-py-contains-value',
    '## Strict Membership: The Containment Check',
    '{"python": {"func_name": "contains_value", "return_type": "bool", "param_types": ["list", "any"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-contains-value';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[[1, "2", 3], 1]'::jsonb,            'true',  false, 1),
(prob_id, '[[1, "2", 3], "2"]'::jsonb,          'true',  false, 2),
(prob_id, '[[1, "2", 3], 2]'::jsonb,            'false', false, 3),
(prob_id, '[["apple", "banana"], "apple"]'::jsonb, 'true', true, 4),
(prob_id, '[[], 5]'::jsonb,                     'false', true,  5),
(prob_id, '[[true, false], true]'::jsonb,        'true',  true,  6),
(prob_id, '[[null, 0], null]'::jsonb,            'true',  true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Split-Metric Analysis: Positives & Negatives
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-positives-negatives',
    'python-practice',
    'function',
    'python',
    'Split-Metric Analysis: Positives & Negatives',
    E'Process a sequence of integers with `positives_negatives_summary` and produce a two-part statistical report.\n\n'
    'Your function must compute two distinct metrics in a single pass: the count of all numbers strictly greater than zero, and the sum of all numbers strictly less than zero.\n\n'
    'Zero is neutral — it contributes to neither metric and must be silently ignored.\n\n'
    '**Examples:**\n'
    '- `positives_negatives_summary([1, 2, 3, 4, -5, -2])` → `[4, -7]`\n'
    '- `positives_negatives_summary([0, 0, 0])` → `[0, 0]`\n'
    '- `positives_negatives_summary([])` → `[]`',
    '- Array length: 0 ≤ len(arr) ≤ 10_000\n- Element range: -10_000 ≤ arr[i] ≤ 10_000\n- Integers only\n- Return `[]` for empty input\n- 0 is neutral (ignore it)',
    'Master single-pass iteration with conditional branching to produce a compound statistical summary.',
    'positives_negatives_summary',
    'list',
    '{"list}',
    '{"Initialize two counters: `pos_count = 0` and `neg_sum = 0`.","Loop through each number; if > 0 increment count, if < 0 add to sum.","After the loop, return `[pos_count, neg_sum]` — or `[]` if the original input was empty."}',
    1,
    70,
    '{"python","beginner","arrays","loops","conditionals"}',
    true,
    'seed-py-positives-negatives',
    '## Split-Metric Analysis: Positives & Negatives',
    '{"python": {"func_name": "positives_negatives_summary", "return_type": "list", "param_types": ["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-positives-negatives';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[[1, 2, 3, 4, -5, -2]]'::jsonb,  '[4,-7]', false, 1),
(prob_id, '[[-1, -2, -3]]'::jsonb,          '[0,-6]', false, 2),
(prob_id, '[[0, 0, 0]]'::jsonb,             '[0,0]',  false, 3),
(prob_id, '[[]]'::jsonb,                    '[]',     true,  4),
(prob_id, '[[1, -1, 2, -2, 3, -3]]'::jsonb,'[3,-6]', true,  5),
(prob_id, '[[100, -100, 200, -200]]'::jsonb,'[2,-300]',true, 6),
(prob_id, '[[5]]'::jsonb,                   '[1,0]',  true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Sanitization Engine: Character Purge
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-sanitize-exclamations',
    'python-practice',
    'function',
    'python',
    'Sanitization Engine: Character Purge',
    E'Data cleaning is an essential software skill. Write a function `sanitize_exclamations` that scans an incoming string and ruthlessly strips every single exclamation mark (`!`), returning a pristine, sanitized version of the text.\n\n'
    '**Examples:**\n'
    '- `sanitize_exclamations("Hello! World!")` → `"Hello World"`\n'
    '- `sanitize_exclamations("!!!")` → `""`\n'
    '- `sanitize_exclamations("No exclamations here")` → `"No exclamations here"`',
    '- String length: 0 ≤ len(text) ≤ 10_000\n- Remove only `!` characters (U+0021)\n- All other characters — letters, digits, spaces, punctuation — must remain untouched',
    'Implement a character-level filter using Python\'s `str.replace()` or a comprehension with `str.join()`.',
    'sanitize_exclamations',
    'str',
    '{"str}',
    '{"Python''s `str.replace(\"''!''\", \"''\"'')` removes all exclamation marks in one call.","Alternatively, use a generator: `\"''.join(c for c in text if c != \"''!\"'')`.","Both approaches handle empty strings gracefully — an empty input returns an empty string."}',
    1,
    70,
    '{"python","beginner","strings","sanitization"}',
    true,
    'seed-py-sanitize-exclamations',
    '## Sanitization Engine: Character Purge',
    '{"python": {"func_name": "sanitize_exclamations", "return_type": "str", "param_types": ["str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-sanitize-exclamations';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '["Hello! World!"]'::jsonb,    '"Hello World"',       false, 1),
(prob_id, '["!!!"]'::jsonb,              to_jsonb(''::text),                  false, 2),
(prob_id, '["No exclamations here"]'::jsonb, '"No exclamations here"', false, 3),
(prob_id, '[""]'::jsonb,                 to_jsonb(''::text),                  true,  4),
(prob_id, '["!a!b!c!"]'::jsonb,         '"abc"',               true,  5),
(prob_id, '["!!"]'::jsonb,               to_jsonb(''::text),                  true,  6),
(prob_id, '["Normal text."]'::jsonb,     '"Normal text."',      true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 6. Freight Logistics: Cuboid Volume
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-cuboid-volume',
    'python-practice',
    'function',
    'python',
    'Freight Logistics: Cuboid Volume',
    E'A logistics warehouse needs to automate packaging. Write a function `cuboid_volume` that accepts three dimensions of a rectangular box — length, width, and height — and calculates its total volumetric space.\n\n'
    '**Examples:**\n'
    '- `cuboid_volume(10, 5, 2)` → `100`\n'
    '- `cuboid_volume(1, 1, 1)` → `1`\n'
    '- `cuboid_volume(0, 5, 2)` → `0`',
    '- Dimensions: 0 ≤ length, width, height ≤ 10_000\n- Inputs may be integers or floats\n- Return the product as a float if any input is float, else int',
    'Apply a simple geometric formula (V = l × w × h) with attention to numeric type preservation.',
    'cuboid_volume',
    'float',
    '{"float,"float,"float}',
    '{"Volume is simply length * width * height — multiplication handles it all.","If all inputs are integers and the product is integral, Python returns an int; convert to float if consistency matters.","A zero dimension correctly yields zero volume."}',
    1,
    70,
    '{"python","beginner","math","geometry"}',
    true,
    'seed-py-cuboid-volume',
    '## Freight Logistics: Cuboid Volume',
    '{"python": {"func_name": "cuboid_volume", "return_type": "float", "param_types": ["float", "float", "float"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-cuboid-volume';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[10, 5, 2]'::jsonb,     '100',   false, 1),
(prob_id, '[1, 1, 1]'::jsonb,      '1',     false, 2),
(prob_id, '[0, 5, 2]'::jsonb,      '0',     false, 3),
(prob_id, '[2.5, 4, 3]'::jsonb,    '30.0',  true,  4),
(prob_id, '[100, 100, 100]'::jsonb,'1000000', true, 5),
(prob_id, '[0, 0, 0]'::jsonb,      '0',     true,  6),
(prob_id, '[7, 1, 1]'::jsonb,      '7',     true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 7. Digit-by-Digit Square Concatenation
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-square-concat-digits',
    'python-practice',
    'function',
    'python',
    'Digit-by-Digit Square Concatenation',
    E'Transform an integer by isolating each of its digits, squaring each one independently, and concatenating the resulting squares in their original order to form a new integer.\n\n'
    'For example, 9119 becomes 9^2=81, 1^2=1, 1^2=1, 9^2=81 → concatenated as 811181.\n\n'
    '**Examples:**\n'
    '- `square_concat_digits(9119)` → `811181`\n'
    '- `square_concat_digits(0)` → `0`\n'
    '- `square_concat_digits(3)` → `9`',
    '- Input: 0 ≤ n ≤ 1_000_000_000\n- Each digit squared individually (not the number as a whole)\n- Return an integer',
    'Combine digit extraction, string conversion, and functional programming with `str.join()` and `map()`.',
    'square_concat_digits',
    'int',
    '{"int}',
    '{"Convert the integer to a string to iterate over digits.","Square each digit using `int(d)**2` and convert back to string for concatenation.","Handle the edge case of `n=0` separately — `int(\"''0\"'')**2 = 0`."}',
    2,
    90,
    '{"python","beginner","math","strings","digits"}',
    true,
    'seed-py-square-concat-digits',
    '## Digit-by-Digit Square Concatenation',
    '{"python": {"func_name": "square_concat_digits", "return_type": "int", "param_types": ["int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-square-concat-digits';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[9119]'::jsonb,   '811181', false, 1),
(prob_id, '[0]'::jsonb,      '0',      false, 2),
(prob_id, '[3]'::jsonb,      '9',      false, 3),
(prob_id, '[10]'::jsonb,     '10',     true,  4),
(prob_id, '[99]'::jsonb,     '8181',   true,  5),
(prob_id, '[123]'::jsonb,    '149',    true,  6),
(prob_id, '[100]'::jsonb,    '100',    true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 8. Extreme Bounds: Range Finder
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-min-max-range',
    'python-practice',
    'function',
    'python',
    'Extreme Bounds: Range Finder',
    E'You are given a raw text string of numbers separated by single spaces. Parse this string, identify the maximum and minimum values, and return them formatted as `"MAX MIN"`.\n\n'
    '**Examples:**\n'
    '- `min_max_range("1 9 3 4 -5")` → `"9 -5"`\n'
    '- `min_max_range("42")` → `"42 42"`\n'
    '- `min_max_range("-10 -20 -30")` → `"-10 -30"`',
    '- Input length: 1 ≤ len(str) ≤ 10_000\n- Numbers separated by single space\n- Integers only, range: -10_000 ≤ n ≤ 10_000\n- Return format: `"MAX MIN"` with single space',
    'Parse space-delimited strings, type-cast strings to integers, and compute extrema with built-in `max()` and `min()`.',
    'min_max_range',
    'str',
    '{"str}',
    '{"Split the string with `.split(\"'' \"'')` to get a list of digit-strings.","Convert each element to an integer using `map(int, ...)` or a list comprehension.","Use built-in `max()` and `min()`, convert back to strings, and format as `f\"\"{max_val} {min_val}\"\"`."}',
    2,
    90,
    '{"python","beginner","strings","parsing","math"}',
    true,
    'seed-py-min-max-range',
    '## Extreme Bounds: Range Finder',
    '{"python": {"func_name": "min_max_range", "return_type": "str", "param_types": ["str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-min-max-range';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '["1 9 3 4 -5"]'::jsonb,    '"9 -5"',   false, 1),
(prob_id, '["42"]'::jsonb,            '"42 42"',  false, 2),
(prob_id, '["-10 -20 -30"]'::jsonb,   '"-10 -30"', false, 3),
(prob_id, '["0 0 0"]'::jsonb,         '"0 0"',    true,  4),
(prob_id, '["100 200 300"]'::jsonb,   '"300 100"', true,  5),
(prob_id, '["-5 -1 -3"]'::jsonb,      '"-1 -5"',  true,  6),
(prob_id, '["5 5 5 5"]'::jsonb,       '"5 5"',    true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════
-- 🟡 INTERMEDIATE (9–17) — difficulty 2–3
-- ════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 9. Generational Alignment: Age Relativity Calculator
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-years-to-double',
    'python-practice',
    'function',
    'python',
    'Generational Alignment: Age Relativity Calculator',
    E'Given the current age of a parent and the current age of a child, calculate how many years it will take (or has taken) for the parent to be exactly twice as old as the child.\n\n'
    'The result must always be a non-negative integer, regardless of whether this moment is in the past or the future.\n\n'
    '**Examples:**\n'
    '- `years_to_double_age(30, 5)` → `20` (in 20 years, father is 50, son is 25)\n'
    '- `years_to_double_age(40, 20)` → `0` (right now, father is exactly twice as old)\n'
    '- `years_to_double_age(50, 30)` → `10` (10 years ago, father was 40, son was 20)',
    '- Parent age: 1 ≤ parent ≤ 150\n- Child age: 1 ≤ child ≤ 150\n- Child age is always less than parent age\n- Return absolute value of the difference: `parent - 2 * child`',
    'Model a linear age relationship over time using algebra: parent + t = 2 * (child + t).',
    'years_to_double_age',
    'int',
    '{"int,"int}',
    '{"The equation is: parent + years = 2 * (child + years).","Solve for years: years = parent - 2 * child.","Take the absolute value using `abs()` to guarantee a non-negative result."}',
    2,
    90,
    '{"python","intermediate","math","algebra","conditionals"}',
    true,
    'seed-py-years-to-double',
    '## Generational Alignment: Age Relativity Calculator',
    '{"python": {"func_name": "years_to_double_age", "return_type": "int", "param_types": ["int", "int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-years-to-double';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[30, 5]'::jsonb,    '20', false, 1),
(prob_id, '[40, 20]'::jsonb,   '0',  false, 2),
(prob_id, '[50, 30]'::jsonb,   '10', false, 3),
(prob_id, '[35, 7]'::jsonb,    '21', true,  4),
(prob_id, '[18, 9]'::jsonb,    '0',  true,  5),
(prob_id, '[100, 1]'::jsonb,   '98', true,  6),
(prob_id, '[25, 12]'::jsonb,   '1',  true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 10. The Conditional Sensor: Zero-Biased Filter
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-extract-positives',
    'python-practice',
    'function',
    'python',
    'The Conditional Sensor: Zero-Biased Filter',
    E'Write a function `extract_positives` that processes a list of numbers and extracts only the positive elements. If the list contains exclusively non-positive numbers (negatives and zeros), return an empty list as a system flag.\n\n'
    '**Examples:**\n'
    '- `extract_positives([-1, 0, 3, 5, -2])` → `[3, 5]`\n'
    '- `extract_positives([-1, -5, 0])` → `[]`\n'
    '- `extract_positives([])` → `[]`',
    '- List length: 0 ≤ len(arr) ≤ 10_000\n- Element range: -10_000 ≤ arr[i] ≤ 10_000\n- Return a new list (do not mutate the original)\n- 0 is NOT positive',
    'Apply list filtering with a conditional guard, returning a clean list of only qualifying elements.',
    'extract_positives',
    'list',
    '{"list}',
    '{"Use a list comprehension: `[x for x in arr if x > 0]`.","If no element satisfies the condition, the comprehension naturally returns an empty list.","The comprehension handles empty input correctly — it returns `[]`."}',
    2,
    90,
    '{"python","intermediate","arrays","filtering","conditionals"}',
    true,
    'seed-py-extract-positives',
    '## The Conditional Sensor: Zero-Biased Filter',
    '{"python": {"func_name": "extract_positives", "return_type": "list", "param_types": ["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-extract-positives';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[[-1, 0, 3, 5, -2]]'::jsonb, '[3,5]', false, 1),
(prob_id, '[[-1, -5, 0]]'::jsonb,       '[]',    false, 2),
(prob_id, '[[]]'::jsonb,                '[]',    false, 3),
(prob_id, '[[10, 20, 30]]'::jsonb,      '[10,20,30]', true, 4),
(prob_id, '[[0, 0, 0]]'::jsonb,         '[]',    true,  5),
(prob_id, '[[-1, -2, -3, 4]]'::jsonb,   '[4]',   true,  6),
(prob_id, '[[0.5, -0.5, 1.5]]'::jsonb,  '[0.5,1.5]', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 11. Custom Boundary Trim: Variable Index Stripper
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-trim-variable-ends',
    'python-practice',
    'function',
    'python',
    'Custom Boundary Trim: Variable Index Stripper',
    E'Upgrade the basic string-trimming concept. Write `trim_variable_ends` that takes a string and an integer `n`, and removes `n` characters from the front and `n` characters from the back.\n\n'
    '**Examples:**\n'
    '- `trim_variable_ends("hello world", 3)` → `"lo wo"`\n'
    '- `trim_variable_ends("hello world", 0)` → `"hello world"`\n'
    '- `trim_variable_ends("abcd", 2)` → `""`\n'
    '- `trim_variable_ends("abc", 2)` → `""`',
    '- String length: 0 ≤ len(str) ≤ 1000\n- n: 0 ≤ n ≤ 500\n- If 2*n >= len(str), return empty string\n- Characters include letters, digits, symbols, unicode',
    'Generalize string slicing with a variable parameter, handling degenerate cases where the trim exceeds string length.',
    'trim_variable_ends',
    'str',
    '{"str,"int}',
    '{"Slice with `str[n:-n]` — but only if `2*n < len(str)`.","If `n == 0`, the slice returns the entire string unchanged.","When `2*n >= len(str)` or the string is empty, return an empty string."}',
    2,
    100,
    '{"python","intermediate","strings","slicing"}',
    true,
    'seed-py-trim-variable-ends',
    '## Custom Boundary Trim: Variable Index Stripper',
    '{"python": {"func_name": "trim_variable_ends", "return_type": "str", "param_types": ["str", "int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-trim-variable-ends';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '["hello world", 3]'::jsonb,  '"lo wo"',      false, 1),
(prob_id, '["hello world", 0]'::jsonb,  '"hello world"', false, 2),
(prob_id, '["abcd", 2]'::jsonb,         to_jsonb(''::text),           false, 3),
(prob_id, '["abc", 2]'::jsonb,          to_jsonb(''::text),     true,  4),
(prob_id, '["python", 1]'::jsonb,       '"ytho"',       true,  5),
(prob_id, '["", 0]'::jsonb,             to_jsonb(''::text),     true,  6),
(prob_id, '["a", 0]'::jsonb,            '"a"',          true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 12. Strict Deep Equivalence Search
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-strict-deep-equals',
    'python-practice',
    'function',
    'python',
    'Strict Deep Equivalence Search',
    E'Standard inclusion checks can fail due to weak type matching. Create a strict search function `strict_deep_equals` that ensures both the value AND the data type match exactly.\n\n'
    'The string `"5"` should NOT match the number `5`. The boolean `True` should NOT match the integer `1`.\n\n'
    '**Examples:**\n'
    '- `strict_deep_equals([1, "2", 3], 1)` → `True`\n'
    '- `strict_deep_equals([1, "2", 3], "1")` → `False` (string "1" !== int 1)\n'
    '- `strict_deep_equals([True, 0], 1)` → `False` (True is bool, 1 is int)',
    '- Array length: 0 ≤ len(a) ≤ 10_000\n- Elements may be any type\n- Use `type(x) == type(y) and x == y` for strict comparison\n- `True` should NOT match `1`, `False` should NOT match `0`',
    'Understand Python type identity vs value equality by implementing type-aware search that bypasses Python\'s implicit bool↔int coercion.',
    'strict_deep_equals',
    'bool',
    '{"list,"any}',
    '{"Python''s `type(x)` returns the exact type — `type(1) == int`, `type(True) == bool`.","Use `type(x) == type(y) and x == y` to enforce both type and value match.","Alternatively, `isinstance(x, int) and not isinstance(x, bool)` can distinguish bool from int."}',
    3,
    120,
    '{"python","intermediate","arrays","types","search"}',
    true,
    'seed-py-strict-deep-equals',
    '## Strict Deep Equivalence Search',
    '{"python": {"func_name": "strict_deep_equals", "return_type": "bool", "param_types": ["list", "any"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-strict-deep-equals';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[[1, "2", 3], 1]'::jsonb,      'true',  false, 1),
(prob_id, '[[1, "2", 3], "1"]'::jsonb,    'false', false, 2),
(prob_id, '[[true, 0], 1]'::jsonb,         'false', false, 3),
(prob_id, '[[1, 2, 3], 4]'::jsonb,        'false', true,  4),
(prob_id, '[[1, 2, 3], "2"]'::jsonb,      'false', true,  5),
(prob_id, '[[1.0, 2.0], "1.0"]'::jsonb,   'false', true,  6),
(prob_id, '[["true", false], true]'::jsonb,'false', true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 13. Balanced Account Ledger
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-account-ledger',
    'python-practice',
    'function',
    'python',
    'Balanced Account Ledger',
    E'Imagine a financial tracking app. Positive integers are deposits, negative integers are withdrawals. Write `account_ledger` that analyzes transaction history and returns a dictionary with the net balance and an account status.\n\n'
    '**Examples:**\n'
    '- `account_ledger([100, -50, 200, -30])` → `{"net_balance": 220, "status": "PROFIT"}`\n'
    '- `account_ledger([-100, -50])` → `{"net_balance": -150, "status": "DEBT"}`\n'
    '- `account_ledger([10, -10, 0])` → `{"net_balance": 0, "status": "BALANCED"}`\n'
    '- `account_ledger([])` → `{"net_balance": 0, "status": "BALANCED"}`',
    '- Array length: 0 ≤ len(transactions) ≤ 10_000\n- Amount range: -10_000 ≤ amount ≤ 10_000\n- Return a dictionary with keys "net_balance" (int) and "status" (str)\n- Status: "PROFIT" for net > 0, "DEBT" for net < 0, "BALANCED" for net == 0',
    'Aggregate financial data with `sum()` and classify outcomes using conditional logic, returning a structured dictionary.',
    'account_ledger',
    'dict',
    '{"list}',
    '{"Compute net balance with `sum(transactions)`.","Use conditionals: if net > 0 → \"''PROFIT\"''; if net < 0 → \"''DEBT\"''; else → \"''BALANCED\"''.","Return a dictionary: `{\"''net_balance\"'': net, \"''status\"'': status}`."}',
    2,
    100,
    '{"python","intermediate","arrays","math","conditionals","dictionaries"}',
    true,
    'seed-py-account-ledger',
    '## Balanced Account Ledger',
    '{"python": {"func_name": "account_ledger", "return_type": "dict", "param_types": ["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-account-ledger';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[[100, -50, 200, -30]]'::jsonb,     '{"net_balance":220,"status":"PROFIT"}', false, 1),
(prob_id, '[[-100, -50]]'::jsonb,               '{"net_balance":-150,"status":"DEBT"}',  false, 2),
(prob_id, '[[10, -10, 0]]'::jsonb,              '{"net_balance":0,"status":"BALANCED"}', false, 3),
(prob_id, '[[]]'::jsonb,                        '{"net_balance":0,"status":"BALANCED"}', true,  4),
(prob_id, '[[500, -200, -300]]'::jsonb,          '{"net_balance":0,"status":"BALANCED"}', true,  5),
(prob_id, '[[1, 2, 3]]'::jsonb,                 '{"net_balance":6,"status":"PROFIT"}',   true,  6),
(prob_id, '[[-1, -2, -3]]'::jsonb,              '{"net_balance":-6,"status":"DEBT"}',    true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 14. Target Punctuation Eraser
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-erase-target-char',
    'python-practice',
    'function',
    'python',
    'Target Punctuation Eraser',
    E'Expand the sanitization engine. Instead of hardcoding a specific character, create a dynamic cleaning function `erase_target_char` that takes a text string and a target character to eliminate globally.\n\n'
    '**Examples:**\n'
    '- `erase_target_char("Hello, World!", ",")` → `"Hello World!"`\n'
    '- `erase_target_char("banana", "a")` → `"bnn"`\n'
    '- `erase_target_char("Mississippi", "s")` → `"Miiippi"`',
    '- String length: 0 ≤ len(text) ≤ 10_000\n- Target is a single-character string\n- Remove ALL occurrences of target (case-sensitive)\n- If target is empty string, return original text unchanged',
    'Build a reusable string cleaning utility with dynamic character targeting, teaching parameterized string operations.',
    'erase_target_char',
    'str',
    '{"str","str"}',
    '{"Use `text.replace(target, "''''")` to remove all instances of the target character.","If `target` is an empty string, return `text` unchanged to avoid an infinite loop.","Remember that `.replace()` returns a new string — strings in Python are immutable."}',
    2,
    90,
    '{"python","intermediate","strings","sanitization"}',
    true,
    'seed-py-erase-target-char',
    '## Target Punctuation Eraser',
    '{"python": {"func_name": "erase_target_char", "return_type": "str", "param_types": ["str", "str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-erase-target-char';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '["Hello, World!", ","]'::jsonb,  '"Hello World!"', false, 1),
(prob_id, '["banana", "a"]'::jsonb,         '"bnn"',          false, 2),
(prob_id, '["Mississippi", "s"]'::jsonb,    '"Miiippi"',      false, 3),
(prob_id, '["", "a"]'::jsonb,               to_jsonb(''::text),       true,  4),
(prob_id, '["hello", ""]'::jsonb,         '"hello"',        true,  5),
(prob_id, '["!hello!", "!"]'::jsonb,        '"hello"',        true,  6),
(prob_id, '["aabbcc", "d"]'::jsonb,         '"aabbcc"',       true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 15. Material Density Calculator
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-calculate-density',
    'python-practice',
    'function',
    'python',
    'Material Density Calculator',
    E'Advance the volume calculator into a physics utility. Write `calculate_density` that uses three dimensions (length, width, height) and a mass value to compute the material\'s density.\n\n'
    'Density = Mass / Volume, where Volume = length × width × height.\n\n'
    'Return the density rounded to exactly two decimal places.\n\n'
    '**Examples:**\n'
    '- `calculate_density(10, 5, 2, 100)` → `1.0`\n'
    '- `calculate_density(1, 1, 1, 10)` → `10.0`\n'
    '- `calculate_density(3, 3, 3, 27)` → `1.0`',
    '- Dimensions: 1 ≤ length, width, height ≤ 10_000\n- Mass: 1 ≤ mass ≤ 1_000_000\n- Volume will always be > 0 (no zero dimension)\n- Round result to 2 decimal places with `round(density, 2)`',
    'Combine geometry and physics formulas with output formatting via `round()`, teaching multi-parameter mathematical functions.',
    'calculate_density',
    'float',
    '{"float,"float,"float,"float}',
    '{"Compute volume as `length * width * height`.","Divide mass by volume to get density: `mass / volume`.","Use `round(density, 2)` to format to two decimal places."}',
    2,
    100,
    '{"python","intermediate","math","geometry","physics"}',
    true,
    'seed-py-calculate-density',
    '## Material Density Calculator',
    '{"python": {"func_name": "calculate_density", "return_type": "float", "param_types": ["float", "float", "float", "float"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-calculate-density';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[10, 5, 2, 100]'::jsonb,  '1.0',  false, 1),
(prob_id, '[1, 1, 1, 10]'::jsonb,    '10.0', false, 2),
(prob_id, '[3, 3, 3, 27]'::jsonb,    '1.0',  false, 3),
(prob_id, '[2, 5, 3, 60]'::jsonb,    '2.0',  true,  4),
(prob_id, '[10, 10, 10, 500]'::jsonb,'0.5',  true,  5),
(prob_id, '[1, 2, 4, 10]'::jsonb,    '1.25', true,  6),
(prob_id, '[7, 3, 2, 84]'::jsonb,    '2.0',  true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 16. Structural Digit Inversion
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-reverse-square-concat',
    'python-practice',
    'function',
    'python',
    'Structural Digit Inversion',
    E'Receive an integer, separate it into its individual digits, square each digit, and concatenate the squared values in REVERSE order.\n\n'
    'For 34: digits are 3 and 4. Squares are 9 and 16. Reversed concatenation: 169.\n\n'
    '**Examples:**\n'
    '- `reverse_square_concat(34)` → `169`\n'
    '- `reverse_square_concat(0)` → `0`\n'
    '- `reverse_square_concat(10)` → `1`',
    '- Input: 0 ≤ n ≤ 1_000_000_000\n- Process digits in reverse order\n- Square each digit individually\n- Concatenate the squared strings then convert to int',
    'Combine digit extraction, list reversal, mapping, and string concatenation into a single pipeline.',
    'reverse_square_concat',
    'int',
    '{"int}',
    '{"Convert to string, iterate over digits in reverse with `reversed()`.","Square each digit: `int(d)**2` → convert to string.","Join all squared strings and convert back to integer with `int()`."}',
    3,
    120,
    '{"python","intermediate","math","strings","digits"}',
    true,
    'seed-py-reverse-square-concat',
    '## Structural Digit Inversion',
    '{"python": {"func_name": "reverse_square_concat", "return_type": "int", "param_types": ["int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-reverse-square-concat';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[34]'::jsonb,   '169',  false, 1),
(prob_id, '[0]'::jsonb,    '0',    false, 2),
(prob_id, '[10]'::jsonb,   '1',    false, 3),
(prob_id, '[123]'::jsonb,  '941',  true,  4),
(prob_id, '[9119]'::jsonb, '181181', true, 5),
(prob_id, '[5]'::jsonb,    '25',   true,  6),
(prob_id, '[100]'::jsonb,  '1',    true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 17. Extreme Outlier Remover
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-remove-extremes',
    'python-practice',
    'function',
    'python',
    'Extreme Outlier Remover',
    E'Given a space-separated string of integers, identify the maximum and minimum values, remove them completely, and return a new string of the remaining numbers.\n\n'
    'If fewer than 3 numbers are provided, return an empty string — there are not enough elements to sacrifice the extremes.\n\n'
    '**Examples:**\n'
    '- `remove_extremes("3 1 4 1 5 9")` → `"3 4 1 5"`\n'
    '- `remove_extremes("1 2")` → `""`\n'
    '- `remove_extremes("5 5 5 5")` → `"5 5"`',
    '- String length: 0 ≤ len(str) ≤ 10_000\n- Numbers separated by single space\n- Integers only\n- Remove ALL occurrences of the min and max values\n- Return numbers separated by single space, or empty string if < 3 numbers',
    'Parse strings, compute extrema, filter with list comprehensions, and re-join into a formatted string.',
    'remove_extremes',
    'str',
    '{"str}',
    '{"Split the string into a list of integers.","Find the minimum and maximum with `min()` and `max()`.","Filter out elements that equal either extreme: `[x for x in nums if x != min_val and x != max_val]`, then join back."}',
    3,
    120,
    '{"python","intermediate","strings","parsing","math","filtering"}',
    true,
    'seed-py-remove-extremes',
    '## Extreme Outlier Remover',
    '{"python": {"func_name": "remove_extremes", "return_type": "str", "param_types": ["str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-remove-extremes';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '["3 1 4 1 5 9"]'::jsonb,  '"3 4 1 5"', false, 1),
(prob_id, '["1 2"]'::jsonb,          to_jsonb(''::text),        false, 2),
(prob_id, '["5 5 5 5"]'::jsonb,      '"5 5"',     false, 3),
(prob_id, '["10 20 30"]'::jsonb,     '"20"',      true,  4),
(prob_id, '["-5 0 5"]'::jsonb,       '"0"',       true,  5),
(prob_id, '["1"]'::jsonb,            to_jsonb(''::text),        true,  6),
(prob_id, '[""]'::jsonb,             to_jsonb(''::text),        true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════
-- 🔴 ADVANCED (18–25) — difficulty 3–4
-- ════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 18. Historical Century Milestone Planner
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-century-milestone',
    'python-practice',
    'function',
    'python',
    'Historical Century Milestone Planner',
    E'Given a list of family member ages and the current calendar year, determine the exact future year when the oldest member will be exactly twice as old as the youngest member.\n\n'
    '**Examples:**\n'
    '- `century_milestone([30, 5], 2026)` → `2046` (oldest 30→50, youngest 5→25 in 20 years)\n'
    '- `century_milestone([40, 20], 2026)` → `2026` (already exactly double)\n'
    '- `century_milestone([10, 5, 15], 2026)` → `2036` (oldest 15→25, youngest 5→15)',
    '- Array length: 2 ≤ len(ages) ≤ 100\n- Ages: 1 ≤ age ≤ 150\n- Current year: 1 ≤ current_year ≤ 9999\n- Return the calendar year as an integer',
    'Extend the age-ratio concept to multi-person datasets, computing extrema across a collection and projecting into calendar time.',
    'century_milestone',
    'int',
    '{"list,"int}',
    '{"Find the oldest and youngest ages with `max(ages)` and `min(ages)`.","Use the formula: `years = oldest - 2 * youngest` (could be negative).","Add the absolute years to the current year, but handle past vs future correctly."}',
    3,
    150,
    '{"python","advanced","math","arrays","conditionals"}',
    true,
    'seed-py-century-milestone',
    '## Historical Century Milestone Planner',
    '{"python": {"func_name": "century_milestone", "return_type": "int", "param_types": ["list", "int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-century-milestone';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[[30, 5], 2026]'::jsonb,     '2046', false, 1),
(prob_id, '[[40, 20], 2026]'::jsonb,    '2026', false, 2),
(prob_id, '[[10, 5, 15], 2026]'::jsonb, '2036', false, 3),
(prob_id, '[[50, 30], 2026]'::jsonb,    '2016', true,  4),
(prob_id, '[[100, 1], 2000]'::jsonb,    '2098', true,  5),
(prob_id, '[[18, 9], 2024]'::jsonb,     '2024', true,  6),
(prob_id, '[[35, 7, 21], 2026]'::jsonb, '2047', true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 19. Outlier-Resilient Trim Average
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-trimmed-average',
    'python-practice',
    'function',
    'python',
    'Outlier-Resilient Trim Average',
    E'Calculate a robust average by stripping away the single highest and single lowest values before computing the mean. This outlier-resistant technique is used in scientific data analysis.\n\n'
    'If removing the extremes leaves 2 or fewer elements (or the array was empty), return 0 — there is not enough data for a meaningful average.\n\n'
    '**Examples:**\n'
    '- `trimmed_average([1, 2, 3, 4, 100])` → `3.0` (removes 1 and 100, averages [2,3,4])\n'
    '- `trimmed_average([5, 5, 5])` → `5.0` (removes 5 and 5, averages [5])\n'
    '- `trimmed_average([1, 2])` → `0.0` (only 2 elements after trimming → 0)',
    '- Array length: 0 ≤ len(arr) ≤ 10_000\n- Remove ONE occurrence of the maximum and ONE occurrence of the minimum\n- If the remaining list has ≤ 2 elements, return 0.0\n- Return a float',
    'Implement a robust statistical estimator (trimmed mean) with careful edge-case handling for small datasets.',
    'trimmed_average',
    'float',
    '{"list}',
    '{"Use `max()` and `min()` to find the extremes, then `.remove()` each once.","`.remove()` only removes the first occurrence, which is the correct behavior here.","If the remaining list has ≤ 2 elements after removal, return 0.0."}',
    3,
    150,
    '{"python","advanced","math","arrays","filtering","statistics"}',
    true,
    'seed-py-trimmed-average',
    '## Outlier-Resilient Trim Average',
    '{"python": {"func_name": "trimmed_average", "return_type": "float", "param_types": ["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-trimmed-average';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[[1, 2, 3, 4, 100]]'::jsonb,  '3.0', false, 1),
(prob_id, '[[5, 5, 5]]'::jsonb,          '5.0', false, 2),
(prob_id, '[[1, 2]]'::jsonb,             '0.0', false, 3),
(prob_id, '[[]]'::jsonb,                 '0.0', true,  4),
(prob_id, '[[10, 20, 30, 40]]'::jsonb,   '25.0', true, 5),
(prob_id, '[[-10, 0, 10, 20]]'::jsonb,   '5.0', true,  6),
(prob_id, '[[100, 200, 300]]'::jsonb,    '200.0', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 20. Substring Boundary Eraser
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-remove-around-substring',
    'python-practice',
    'function',
    'python',
    'Substring Boundary Eraser',
    E'Create an advanced string parser. Given a primary string and a target substring, locate the first occurrence of that substring, then remove the characters immediately preceding and following it.\n\n'
    'If the target is not found, return the original string unchanged.\n\n'
    '**Examples:**\n'
    '- `remove_around_substring("abcdefg", "cd")` → `"abfg"` (removes "cde" — "c" before, "cd" target, "e" after)\n'
    '- `remove_around_substring("hello world", "lo wo")` → `"held"` (removes "lo wo" and its neighbors)\n'
    '- `remove_around_substring("abcdefg", "xyz")` → `"abcdefg"` (not found)',
    '- Source length: 0 ≤ len(source) ≤ 1000\n- Target length: 1 ≤ len(target) ≤ 100\n- Remove: one char before target + target + one char after target\n- If target at start: skip before-char removal\n- If target at end: skip after-char removal\n- If not found: return source unchanged',
    'Master string search with `.find()`, slice arithmetic for boundary conditions, and index-safe string manipulation.',
    'remove_around_substring',
    'str',
    '{"str,"str}',
    '{"Use `source.find(target)` to locate the starting index. If -1, return source unchanged.","The slice to remove starts at `idx - 1` (if idx > 0) and ends at `idx + len(target) + 1` (if within bounds).","Construct the result by concatenating `source[:start] + source[end:]`."}',
    3,
    150,
    '{"python","advanced","strings","search","slicing"}',
    true,
    'seed-py-remove-around-substring',
    '## Substring Boundary Eraser',
    '{"python": {"func_name": "remove_around_substring", "return_type": "str", "param_types": ["str", "str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-remove-around-substring';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '["abcdefg", "cd"]'::jsonb,     '"abfg"',     false, 1),
(prob_id, '["hello world", "lo wo"]'::jsonb,'"held"',    false, 2),
(prob_id, '["abcdefg", "xyz"]'::jsonb,    '"abcdefg"',  false, 3),
(prob_id, '["abcde", "a"]'::jsonb,         '"bcde"',     true,  4),
(prob_id, '["abcde", "e"]'::jsonb,         '"abcd"',     true,  5),
(prob_id, '["abcde", "bcd"]'::jsonb,       '"ae"',       true,  6),
(prob_id, '["a", "a"]'::jsonb,             to_jsonb(''::text),         true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 21. Multi-Dimensional Inclusion Indexer
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-find-in-nested',
    'python-practice',
    'function',
    'python',
    'Multi-Dimensional Inclusion Indexer',
    E'Upgrade the containment check to handle nested data. Write `find_in_nested` that searches a 2D matrix (list of lists) for a target value and returns its `[row, column]` coordinates.\n\n'
    'If the target does not exist, return `[-1, -1]`.\n\n'
    '**Examples:**\n'
    '- `find_in_nested([[1, 2], [3, 4]], 3)` → `[1, 0]`\n'
    '- `find_in_nested([[1, 2], [3, 4]], 5)` → `[-1, -1]`\n'
    '- `find_in_nested([[5]], 5)` → `[0, 0]`',
    '- Matrix dimensions: 0 ≤ rows ≤ 100, 0 ≤ cols ≤ 100\n- Elements may be any type\n- Return the FIRST occurrence (row-major order)\n- Return `[-1, -1]` if not found or matrix is empty',
    'Navigate two-dimensional data structures using nested loops, tracking positional indices for coordinate reporting.',
    'find_in_nested',
    'list',
    '{"list,"any}',
    '{"Use a nested loop: `for i, row in enumerate(matrix): for j, val in enumerate(row):`.","When you find the target, immediately return `[i, j]`.","If the loop completes without finding the target, return `[-1, -1]`."}',
    3,
    150,
    '{"python","advanced","arrays","nested-loops","search"}',
    true,
    'seed-py-find-in-nested',
    '## Multi-Dimensional Inclusion Indexer',
    '{"python": {"func_name": "find_in_nested", "return_type": "list", "param_types": ["list", "any"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-find-in-nested';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[[[1, 2], [3, 4]], 3]'::jsonb,  '[1,0]',   false, 1),
(prob_id, '[[[1, 2], [3, 4]], 5]'::jsonb,  '[-1,-1]', false, 2),
(prob_id, '[[[5]], 5]'::jsonb,             '[0,0]',   false, 3),
(prob_id, '[[[1, 2], [3, 4]], "1"]'::jsonb,'[-1,-1]', true,  4),
(prob_id, '[[[1, 2], [1, 2]], 1]'::jsonb,  '[0,0]',   true,  5),
(prob_id, '[[[]], 1]'::jsonb,             '[-1,-1]', true,  6),
(prob_id, '[[[true, false]], true]'::jsonb,'[0,0]',   true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 22. Array Segment Parity Summary
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-chunked-parity',
    'python-practice',
    'function',
    'python',
    'Array Segment Parity Summary',
    E'Partition an array of integers into consecutive chunks of size `k`. For each chunk, calculate: the count of positive numbers and the sum of negative numbers. Return these summaries as a list of `[pos_count, neg_sum]` pairs.\n\n'
    'The final chunk may be smaller than `k` if the array length is not evenly divisible.\n\n'
    '**Examples:**\n'
    '- `chunked_parity_summary([1, -2, 3, -4, 5, -6], 2)` → `[[1, -2], [1, -4], [1, -6]]`\n'
    '- `chunked_parity_summary([1, -1, 2, -2, 3], 3)` → `[[1, -1], [1, -2]]`',
    '- Array length: 0 ≤ len(arr) ≤ 10_000\n- k: 1 ≤ k ≤ len(arr)\n- Chunks are consecutive, non-overlapping\n- Last chunk may be shorter than k\n- Return list of [pos_count, neg_sum] pairs',
    'Combine chunking logic with aggregation, building a pipeline from list slicing through per-chunk statistical reduction.',
    'chunked_parity_summary',
    'list',
    '{"list,"int}',
    '{"Iterate with step `k`: `for i in range(0, len(arr), k)`.","Slice the chunk: `chunk = arr[i:i+k]`.","For each chunk, count positives (x > 0) and sum negatives (x < 0), then append `[pos_count, neg_sum]`."}',
    4,
    190,
    '{"python","advanced","arrays","loops","chunking","statistics"}',
    true,
    'seed-py-chunked-parity',
    '## Array Segment Parity Summary',
    '{"python": {"func_name": "chunked_parity_summary", "return_type": "list", "param_types": ["list", "int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-chunked-parity';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[[1, -2, 3, -4, 5, -6], 2]'::jsonb, '[[1,-2],[1,-4],[1,-6]]', false, 1),
(prob_id, '[[1, -1, 2, -2, 3], 3]'::jsonb,     '[[1,-1],[1,-2]]',         false, 2),
(prob_id, '[[0, 0, 0], 1]'::jsonb,             '[[0,0],[0,0],[0,0]]',     false, 3),
(prob_id, '[[5], 1]'::jsonb,                    '[[1,0]]',                 true,  4),
(prob_id, '[[-1, -2, -3, -4], 4]'::jsonb,      '[[0,-10]]',               true,  5),
(prob_id, '[[1, -1, 1, -1, 1], 2]'::jsonb,     '[[1,-1],[1,-1],[1,0]]',   true,  6),
(prob_id, '[[]]'::jsonb,                        '[]',                      true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 23. Sequential Punctuation Condenser
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-condense-punctuation',
    'python-practice',
    'function',
    'python',
    'Sequential Punctuation Condenser',
    E'Write a clean-up function that scans text for consecutive repeated `!` or `?` marks and collapses each run into a single instance.\n\n'
    'This normalizes messy user inputs like "Hello!!! What???" into clean "Hello! What?" without affecting other repeated characters.\n\n'
    '**Examples:**\n'
    '- `condense_punctuation("Hello!!! What???")` → `"Hello! What?"`\n'
    '- `condense_punctuation("No change")` → `"No change"`\n'
    '- `condense_punctuation("!!!???!!!")` → `"!?"`',
    '- String length: 0 ≤ len(text) ≤ 10_000\n- Only condense `!` and `?` characters\n- Other repeated characters (e.g., "aa") must remain unchanged\n- A single punctuation mark stays as-is',
    'Build a character-level state machine or use regex substitution (`re.sub()`) for pattern-based string normalization.',
    'condense_punctuation',
    'str',
    '{"str}',
    '{"Use `re.sub(r"([!?])\1+", r"\1", text)` with the `re` module to collapse consecutive punctuation.","The pattern `([!?])` captures one punctuation, `\1+` matches one or more repeats of the same character.","Alternatively, iterate character-by-character and skip duplicates of `!` or `?`."},
    4,
    190,
    '{"python","advanced","strings","regex","sanitization"}',
    true,
    'seed-py-condense-punctuation',
    '## Sequential Punctuation Condenser',
    '{"python": {"func_name": "condense_punctuation", "return_type": "str", "param_types": ["str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-condense-punctuation';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '["Hello!!! What???"]'::jsonb,  '"Hello! What?"',  false, 1),
(prob_id, '["No change"]'::jsonb,         '"No change"',     false, 2),
(prob_id, '["!!!???!!!"]'::jsonb,         '"!?"',            false, 3),
(prob_id, '[""]'::jsonb,                  to_jsonb(''::text),              true,  4),
(prob_id, '["H!!e!!l!!l!!o!!"]'::jsonb,   '"H!e!l!l!o!"',    true,  5),
(prob_id, '["Already fine!"]'::jsonb,     '"Already fine!"', true,  6),
(prob_id, '["???!!!"]'::jsonb,            '"?!",',           true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 24. Shipping Container Optimization Engine
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-max-boxes-in-container',
    'python-practice',
    'function',
    'python',
    'Shipping Container Optimization Engine',
    E'A logistics company needs to maximize container utilization. Given container dimensions `[L, W, H]` and product box dimensions `[l, w, h]`, calculate the maximum number of boxes that can fit inside the container — assuming all boxes are packed in the same orientation.\n\n'
    '**Examples:**\n'
    '- `max_boxes_in_container([10, 10, 10], [2, 2, 2])` → `125` (5×5×5 = 125 boxes)\n'
    '- `max_boxes_in_container([10, 10, 10], [3, 3, 3])` → `27` (3×3×3 = 27 boxes)\n'
    '- `max_boxes_in_container([5, 5, 5], [6, 1, 1])` → `0`',
    '- Container: 1 ≤ L, W, H ≤ 10_000\n- Box: 1 ≤ l, w, h ≤ 10_000\n- Integer division for each dimension (floor)\n- Same orientation for all boxes (no rotation)\n- Return 0 if any single box dimension exceeds the container',
    'Solve a constrained optimization problem using integer division and multiplication, teaching real-world volumetric reasoning.',
    'max_boxes_in_container',
    'int',
    '{"list,"list}',
    '{"Compute how many boxes fit along each axis using integer division: `L // l`, `W // w`, `H // h`.","Multiply the three axis counts: `(L // l) * (W // w) * (H // h)`.","If any box dimension exceeds the container, the division yields 0, and the product becomes 0 — naturally correct."}',
    4,
    190,
    '{"python","advanced","math","geometry","optimization"}',
    true,
    'seed-py-max-boxes-in-container',
    '## Shipping Container Optimization Engine',
    '{"python": {"func_name": "max_boxes_in_container", "return_type": "int", "param_types": ["list", "list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-max-boxes-in-container';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[[10, 10, 10], [2, 2, 2]]'::jsonb,     '125', false, 1),
(prob_id, '[[10, 10, 10], [3, 3, 3]]'::jsonb,     '27',  false, 2),
(prob_id, '[[5, 5, 5], [6, 1, 1]]'::jsonb,        '0',   false, 3),
(prob_id, '[[100, 1, 1], [2, 1, 1]]'::jsonb,       '50',  true,  4),
(prob_id, '[[7, 7, 7], [3, 3, 3]]'::jsonb,         '8',   true,  5),
(prob_id, '[[1, 1, 1], [1, 1, 1]]'::jsonb,         '1',   true,  6),
(prob_id, '[[10, 20, 30], [5, 5, 5]]'::jsonb,      '48',  true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 25. High-Low Digit Map Reducer
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-high-low-square-map',
    'python-practice',
    'function',
    'python',
    'High-Low Digit Map Reducer',
    E'Given a large integer, isolate its digits, find the highest and lowest digit values. Square these two extreme digits, concatenate the squared results, and convert back to an integer.\n\n'
    'For 2817: digits are 2, 8, 1, 7. Highest is 8 → 64. Lowest is 1 → 1. Concatenated: 641.\n\n'
    '**Examples:**\n'
    '- `high_low_square_map(2817)` → `641`\n'
    '- `high_low_square_map(5)` → `2525` (highest=5, lowest=5 → 25 concatenated with 25 = 2525)\n'
    '- `high_low_square_map(100)` → `10`',
    '- Input: 0 ≤ n ≤ 1_000_000_000\n- Find max and min digit values (0–9)\n- Square each, concatenate as strings, convert to int\n- If all digits are the same, the two squares are identical — concatenate them anyway',
    'Combine digit extraction with extreme-value computation, string concatenation, and type conversion in a multi-step pipeline.',
    'high_low_square_map',
    'int',
    '{"int}',
    '{"Extract digits using `str(n)` and convert to integers with `map(int, str(n))`.","Find `max_digit` and `min_digit`, then compute `max_sq = max_digit**2` and `min_sq = min_digit**2`.","Concatenate as strings: `int(str(max_sq) + str(min_sq))`."}',
    3,
    150,
    '{"python","advanced","math","digits","strings"}',
    true,
    'seed-py-high-low-square-map',
    '## High-Low Digit Map Reducer',
    '{"python": {"func_name": "high_low_square_map", "return_type": "int", "param_types": ["int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-high-low-square-map';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[2817]'::jsonb,  '641',  false, 1),
(prob_id, '[5]'::jsonb,     '2525', false, 2),
(prob_id, '[100]'::jsonb,   '10',   false, 3),
(prob_id, '[1234]'::jsonb,  '161',  true,  4),
(prob_id, '[999]'::jsonb,   '8181', true,  5),
(prob_id, '[0]'::jsonb,     '0',    true,  6),
(prob_id, '[808]'::jsonb,   '640',  true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════
-- 🏆 BONUS CHALLENGES (26–30) — difficulty 3–5
-- ════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 26. Palindrome Verifier
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-is-palindrome',
    'python-practice',
    'function',
    'python',
    'Palindrome Verifier',
    E'A palindrome reads the same forwards and backwards. Write `is_palindrome` that checks whether a given string is a palindrome, ignoring case and non-alphanumeric characters.\n\n'
    '**Examples:**\n'
    '- `is_palindrome("A man, a plan, a canal: Panama")` → `True`\n'
    '- `is_palindrome("race a car")` → `False`\n'
    '- `is_palindrome("")` → `True` (empty string is trivially a palindrome)',
    '- String length: 0 ≤ len(s) ≤ 10_000\n- Ignore case (upper/lower)\n- Ignore all non-alphanumeric characters (punctuation, spaces)\n- Empty string returns True',
    'Build a cleaned-string comparison pipeline using filtering, case normalization, and reversal.',
    'is_palindrome',
    'bool',
    '{"str}',
    '{"Filter to keep only alphanumeric characters: `c.isalnum()`.","Convert to lowercase with `.lower()`.","Compare the cleaned string to its reverse: `cleaned == cleaned[::-1]`."}',
    3,
    120,
    '{"python","intermediate","strings","palindrome","filtering"}',
    true,
    'seed-py-is-palindrome',
    '## Palindrome Verifier',
    '{"python": {"func_name": "is_palindrome", "return_type": "bool", "param_types": ["str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-is-palindrome';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '["A man, a plan, a canal: Panama"]'::jsonb, 'true',  false, 1),
(prob_id, '["race a car"]'::jsonb,                     'false', false, 2),
(prob_id, '[""]'::jsonb,                                'true',  false, 3),
(prob_id, '["No ''x'' in Nixon"]'::jsonb,                'true',  true,  4),
(prob_id, '["hello"]'::jsonb,                           'false', true,  5),
(prob_id, '["12321"]'::jsonb,                           'true',  true,  6),
(prob_id, '["Was it a car or a cat I saw?"]'::jsonb,    'true',  true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 27. Vowel Counter
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-count-vowels',
    'python-practice',
    'function',
    'python',
    'Vowel Counter',
    E'Write a function `count_vowels` that returns the total number of vowels (a, e, i, o, u) in a given string. The count must be case-insensitive.\n\n'
    '**Examples:**\n'
    '- `count_vowels("Hello World")` → `3`\n'
    '- `count_vowels("PYTHON")` → `1`\n'
    '- `count_vowels("Rhythm")` → `0`',
    '- String length: 0 ≤ len(s) ≤ 10_000\n- Vowels: a, e, i, o, u (case-insensitive)\n- y is NOT considered a vowel\n- Return an integer count',
    'Use string methods and summation patterns to count character class occurrences.',
    'count_vowels',
    'int',
    '{"str}',
    '{"Define a set of vowels: `vowels = set(\"''aeiou\"'')`.","Iterate through the lowercased string and count matches: `sum(1 for c in s.lower() if c in vowels)`.","Using a set for vowels gives O(1) lookup per character."}',
    2,
    90,
    '{"python","intermediate","strings","counting","loops"}',
    true,
    'seed-py-count-vowels',
    '## Vowel Counter',
    '{"python": {"func_name": "count_vowels", "return_type": "int", "param_types": ["str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-count-vowels';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '["Hello World"]'::jsonb, '3', false, 1),
(prob_id, '["PYTHON"]'::jsonb,      '1', false, 2),
(prob_id, '["Rhythm"]'::jsonb,      '0', false, 3),
(prob_id, '[""]'::jsonb,            '0', true,  4),
(prob_id, '["Beautiful"]'::jsonb,   '5', true,  5),
(prob_id, '["AEIOUaeiou"]'::jsonb,  '10', true, 6),
(prob_id, '["xYz"]'::jsonb,         '0', true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 28. Array Intersection Finder
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-array-intersection',
    'python-practice',
    'function',
    'python',
    'Array Intersection Finder',
    E'Given two lists of integers, write `array_intersection` that returns a sorted list of elements common to both lists — with no duplicates.\n\n'
    '**Examples:**\n'
    '- `array_intersection([1, 2, 3, 4], [3, 4, 5, 6])` → `[3, 4]`\n'
    '- `array_intersection([1, 2, 3], [4, 5, 6])` → `[]`\n'
    '- `array_intersection([1, 1, 2, 2], [1, 2])` → `[1, 2]`',
    '- List lengths: 0 ≤ len(a), len(b) ≤ 10_000\n- Element range: -10_000 ≤ n ≤ 10_000\n- Return a sorted list of unique common elements\n- Use set operations or list comprehensions with uniqueness',
    'Solve set intersection problems using Python\'s built-in set type or list comprehension with deduplication.',
    'array_intersection',
    'list',
    '{"list,"list}',
    '{"Convert both lists to sets: `set(a)` and `set(b)`.","Use the `&` operator for intersection: `set(a) & set(b)`.","Convert back to a sorted list: `sorted(list(result))`."}',
    3,
    120,
    '{"python","intermediate","arrays","sets","search"}',
    true,
    'seed-py-array-intersection',
    '## Array Intersection Finder',
    '{"python": {"func_name": "array_intersection", "return_type": "list", "param_types": ["list", "list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-array-intersection';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[[1, 2, 3, 4], [3, 4, 5, 6]]'::jsonb,  '[3,4]', false, 1),
(prob_id, '[[1, 2, 3], [4, 5, 6]]'::jsonb,        '[]',    false, 2),
(prob_id, '[[1, 1, 2, 2], [1, 2]]'::jsonb,        '[1,2]', false, 3),
(prob_id, '[[], [1, 2, 3]]'::jsonb,               '[]',    true,  4),
(prob_id, '[[5, 5, 5], [5, 5]]'::jsonb,           '[5]',   true,  5),
(prob_id, '[[-1, 0, 1], [0, 2, -1]]'::jsonb,      '[-1,0]', true, 6),
(prob_id, '[[100, 200], [100]]'::jsonb,            '[100]', true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 29. FizzBuzz Sequence Generator
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-fizzbuzz-sequence',
    'python-practice',
    'function',
    'python',
    'FizzBuzz Sequence Generator',
    E'Generate the FizzBuzz sequence up to `n`. For each number from 1 to n:\n- If divisible by 3 and 5: `"FizzBuzz"`\n- If divisible by 3 only: `"Fizz"`\n- If divisible by 5 only: `"Buzz"`\n- Otherwise: the number as a string\n\nReturn the results as a list of strings.\n\n'
    '**Examples:**\n'
    '- `fizzbuzz_sequence(5)` → `["1", "2", "Fizz", "4", "Buzz"]`\n'
    '- `fizzbuzz_sequence(15)` → `["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]`\n'
    '- `fizzbuzz_sequence(0)` → `[]`',
    '- n: 0 ≤ n ≤ 10_000\n- Return a list of strings\n- Divisibility check order: 15 first (3 and 5), then 3, then 5',
    'Master conditional chaining, modulo arithmetic, and list accumulation in Python.',
    'fizzbuzz_sequence',
    'list',
    '{"int}',
    '{"Loop from 1 to n with `range(1, n+1)`.","Check divisibility by 15 FIRST (`x % 15 == 0`), then 3, then 5.","Append the appropriate string to a result list each iteration."}',
    2,
    100,
    '{"python","intermediate","loops","conditionals","math","strings"}',
    true,
    'seed-py-fizzbuzz-sequence',
    '## FizzBuzz Sequence Generator',
    '{"python": {"func_name": "fizzbuzz_sequence", "return_type": "list", "param_types": ["int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-fizzbuzz-sequence';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '[5]'::jsonb,    '["1","2","Fizz","4","Buzz"]',              false, 1),
(prob_id, '[15]'::jsonb,   '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', false, 2),
(prob_id, '[0]'::jsonb,    '[]',                                        false, 3),
(prob_id, '[1]'::jsonb,    '["1"]',                                     true,  4),
(prob_id, '[3]'::jsonb,    '["1","2","Fizz"]',                          true,  5),
(prob_id, '[30]'::jsonb,   '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz","16","17","Fizz","19","Buzz","Fizz","22","23","Fizz","Buzz","26","Fizz","28","29","FizzBuzz"]', true, 6),
(prob_id, '[100]'::jsonb,  '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 30. Anagram Checker
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-anagram-checker',
    'python-practice',
    'function',
    'python',
    'Anagram Checker',
    E'Two strings are anagrams if they contain the same characters in the same frequency. Write `anagram_checker` that determines whether two strings are anagrams, ignoring case and non-alphanumeric characters.\n\n'
    '**Examples:**\n'
    '- `anagram_checker("listen", "silent")` → `True`\n'
    '- `anagram_checker("Hello", "Ole! h!")` → `True`\n'
    '- `anagram_checker("hello", "world")` → `False`',
    '- String lengths: 0 ≤ len(a), len(b) ≤ 10_000\n- Case-insensitive comparison\n- Ignore all non-alphanumeric characters\n- Empty strings are anagrams of each other',
    'Compare character frequency distributions using sorting or counting dictionaries, with sanitization preprocessing.',
    'anagram_checker',
    'bool',
    '{"str,"str}',
    '{"Sanitize both strings: keep only alphanumeric chars, convert to lowercase.","Compare sorted versions: `sorted(a) == sorted(b)`.","Or use collections.Counter: `Counter(a) == Counter(b)` — both handle character frequency."}',
    3,
    120,
    '{"python","advanced","strings","anagram","sorting","filtering"}',
    true,
    'seed-py-anagram-checker',
    '## Anagram Checker',
    '{"python": {"func_name": "anagram_checker", "return_type": "bool", "param_types": ["str", "str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'py-anagram-checker';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
(prob_id, '["listen", "silent"]'::jsonb,          'true',  false, 1),
(prob_id, '["Hello", "Ole! h!"]'::jsonb,           'true',  false, 2),
(prob_id, '["hello", "world"]'::jsonb,             'false', false, 3),
(prob_id, '["", ""]'::jsonb,                       'true',  true,  4),
(prob_id, '["Dormitory", "Dirty room"]'::jsonb,    'true',  true,  5),
(prob_id, '["abc", "abcd"]'::jsonb,                'false', true,  6),
(prob_id, '["12345", "54321"]'::jsonb,             'true',  true,  7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

END $$;
