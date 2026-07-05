-- ============================================================================
-- Koder :: Problem Seed Migration (Batch 3)
-- Error Handling / Interfaces & Generics (15 problems each)
-- Every expected test-case value below is computed programmatically from a
-- Python reference implementation of the intended Go solution before being
-- written into this script, so a correct submission is guaranteed to pass.
-- 
-- Schema note: the grading harness compares a single return value, so Error
-- Handling problems are framed around documented sentinel returns and
-- recover-and-continue logic rather than Go's (value, error) tuple, and
-- Interfaces problems dispatch on a string type name rather than an actual
-- interface value. Each problem statement explains the real-world interface
-- or error-handling pattern it stands in for.
-- ============================================================================

BEGIN;

-- ---- error-handling :: Safe Divide (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'safe-divide',
    'error-handling',
    'function',
    'go',
    'Safe Divide',
    'Write a function `SafeDivide(a, b int) int` that returns `a / b` using integer division truncated toward zero, or -1 if `b` is zero. This models the common Go pattern of guarding an operation before it can panic, rather than recovering after the fact.',
    '- -10^6 <= a, b <= 10^6',
    'Practice guarding against a runtime panic (division by zero) with an explicit precondition check.',
    'SafeDivide',
    'int',
    '{"int","int"}',
    '{"Dividing by zero would normally panic in Go — check for it before doing the division.","Go''s integer division truncates toward zero, not toward negative infinity, so -7 / 2 is -3, not -4.","Return the documented sentinel value -1 whenever the divisor is zero, instead of letting the program crash."}',
    1,
    70,
    '{"error-handling","beginner"}',
    true,
    'seed-error-handling-safe-divide',
    '## Safe Divide

Write a function `SafeDivide(a, b int) int` that returns `a / b` using integer division truncated toward zero, or -1 if `b` is zero. This models the common Go pattern of guarding an operation before it can panic, rather than recovering after the fact.

**Function signature**

```go
func SafeDivide(a int, b int) int
```

**Examples**

- `SafeDivide(10, 2)` returns `5`
- `SafeDivide(7, 0)` returns `-1`

**Constraints**

- -10^6 <= a, b <= 10^6

**Learning objective:** Practice guarding against a runtime panic (division by zero) with an explicit precondition check.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-divide'), '[10,2]'::jsonb, '5', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-divide'), '[7,0]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-divide'), '[-7,2]'::jsonb, '-3', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-divide'), '[9,-2]'::jsonb, '-4', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-divide'), '[0,5]'::jsonb, '0', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- error-handling :: Validate Age (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'validate-age',
    'error-handling',
    'function',
    'go',
    'Validate Age',
    'Write a function that returns whether an integer `age` represents a plausible human age, defined as being between 0 and 150 inclusive.',
    '- -10^6 <= age <= 10^6',
    'Write the simplest possible validation function: a bounded range check.',
    'ValidateAge',
    'bool',
    '{"int"}',
    '{"A valid human age is bounded on both ends — negative ages and implausibly large ages are both invalid.","A simple range check against both bounds is all this validation needs.","Boundary values (0 and 150 themselves) should be treated as valid."}',
    1,
    70,
    '{"error-handling","validation","beginner"}',
    true,
    'seed-error-handling-validate-age',
    '## Validate Age

Write a function that returns whether an integer `age` represents a plausible human age, defined as being between 0 and 150 inclusive.

**Function signature**

```go
func ValidateAge(age int) bool
```

**Examples**

- `ValidateAge(25)` returns `true`
- `ValidateAge(-5)` returns `false`

**Constraints**

- -10^6 <= age <= 10^6

**Learning objective:** Write the simplest possible validation function: a bounded range check.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'validate-age'), '[25]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'validate-age'), '[-5]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'validate-age'), '[200]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'validate-age'), '[0]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'validate-age'), '[150]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- error-handling :: Safe Array Access (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'safe-array-get',
    'error-handling',
    'function',
    'go',
    'Safe Array Access',
    'Write a function `SafeArrayGet(nums []int, index int) int` that returns `nums[index]` if `index` is a valid position in `nums`, or -1 if it is out of bounds (including negative indices).',
    '- 0 <= len(nums) <= 10000',
    'Practice defensive bounds-checking as an alternative to letting an invalid access panic.',
    'SafeArrayGet',
    'int',
    '{"[]int","int"}',
    '{"Accessing a slice with an out-of-range index would normally panic in Go.","Checking that the index falls within [0, len(nums)) before accessing it prevents that panic entirely.","Return the documented sentinel value -1 for any index that fails the bounds check, including negative indices."}',
    1,
    70,
    '{"error-handling","arrays","beginner"}',
    true,
    'seed-error-handling-safe-array-get',
    '## Safe Array Access

Write a function `SafeArrayGet(nums []int, index int) int` that returns `nums[index]` if `index` is a valid position in `nums`, or -1 if it is out of bounds (including negative indices).

**Function signature**

```go
func SafeArrayGet(nums []int, index int) int
```

**Examples**

- `SafeArrayGet([10, 20, 30], 1)` returns `20`
- `SafeArrayGet([10, 20, 30], 5)` returns `-1`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Practice defensive bounds-checking as an alternative to letting an invalid access panic.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-array-get'), '[[10,20,30],1]'::jsonb, '20', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-array-get'), '[[10,20,30],5]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-array-get'), '[[10,20,30],-1]'::jsonb, '-1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-array-get'), '[[],0]'::jsonb, '-1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-array-get'), '[[7],0]'::jsonb, '7', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- error-handling :: Parse Non-Negative Integer (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'parse-non-negative-int',
    'error-handling',
    'function',
    'go',
    'Parse Non-Negative Integer',
    'Write a function that parses a string `s` as a non-negative integer and returns its value. If `s` is empty or contains anything other than digit characters, return -1 to indicate a parse error, mirroring how `strconv.Atoi` reports an error in Go.',
    '- 0 <= len(s) <= 20',
    'Model an error-returning parse function using a documented sentinel instead of a Go (value, error) pair.',
    'ParseNonNegativeInt',
    'int',
    '{"string"}',
    '{"A valid non-negative integer string contains only digit characters and is not empty.","Go''s strconv.Atoi returns an error for malformed input — model that by checking validity before converting.","Return the documented sentinel value -1 for anything that isn''t a clean non-negative digit string, including empty strings and strings with a sign or letters."}',
    2,
    110,
    '{"error-handling","strings","parsing"}',
    true,
    'seed-error-handling-parse-non-negative-int',
    '## Parse Non-Negative Integer

Write a function that parses a string `s` as a non-negative integer and returns its value. If `s` is empty or contains anything other than digit characters, return -1 to indicate a parse error, mirroring how `strconv.Atoi` reports an error in Go.

**Function signature**

```go
func ParseNonNegativeInt(s string) int
```

**Examples**

- `ParseNonNegativeInt("123")` returns `123`
- `ParseNonNegativeInt("")` returns `-1`

**Constraints**

- 0 <= len(s) <= 20

**Learning objective:** Model an error-returning parse function using a documented sentinel instead of a Go (value, error) pair.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'parse-non-negative-int'), '["123"]'::jsonb, '123', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'parse-non-negative-int'), '[""]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'parse-non-negative-int'), '["12a3"]'::jsonb, '-1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'parse-non-negative-int'), '["-5"]'::jsonb, '-1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'parse-non-negative-int'), '["007"]'::jsonb, '7', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- error-handling :: Validate Email Format (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'is-valid-email',
    'error-handling',
    'function',
    'go',
    'Validate Email Format',
    'Write a function that performs basic structural validation of an email address string `s`: exactly one ''@'' symbol, a non-empty local part before it, and a domain part after it that contains at least one ''.'', doesn''t start or end with a ''.'', and has no empty segments between dots.',
    '- 0 <= len(s) <= 200',
    'Build up a validation function from several small, individually-testable rules.',
    'IsValidEmail',
    'bool',
    '{"string"}',
    '{"A minimally valid email has exactly one ''@'' symbol, with non-empty text on both sides of it.","The part after ''@'' (the domain) must itself contain a ''.'', and it can''t start or end with one.","Split the domain on ''.'' and make sure every resulting piece is non-empty — that rules out things like ''user@domain..com''."}',
    2,
    110,
    '{"error-handling","strings","validation"}',
    true,
    'seed-error-handling-is-valid-email',
    '## Validate Email Format

Write a function that performs basic structural validation of an email address string `s`: exactly one ''@'' symbol, a non-empty local part before it, and a domain part after it that contains at least one ''.'', doesn''t start or end with a ''.'', and has no empty segments between dots.

**Function signature**

```go
func IsValidEmail(s string) bool
```

**Examples**

- `IsValidEmail("user@example.com")` returns `true`
- `IsValidEmail("no-at-symbol.com")` returns `false`

**Constraints**

- 0 <= len(s) <= 200

**Learning objective:** Build up a validation function from several small, individually-testable rules.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-valid-email'), '["user@example.com"]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-valid-email'), '["no-at-symbol.com"]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-valid-email'), '["two@@signs.com"]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-valid-email'), '["a@b..com"]'::jsonb, 'false', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-valid-email'), '["@missing-local.com"]'::jsonb, 'false', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- error-handling :: Count Invalid Ages (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'count-invalid-ages',
    'error-handling',
    'function',
    'go',
    'Count Invalid Ages',
    'Write a function that returns how many values in a slice `ages` fall outside the plausible human age range of 0 to 150 inclusive.',
    '- 0 <= len(ages) <= 10000',
    'Apply a validation predicate across a whole collection instead of a single value.',
    'CountInvalidAges',
    'int',
    '{"[]int"}',
    '{"Reuse the same validity rule as a single-age check: an age is valid when it''s between 0 and 150 inclusive.","Scan the whole slice once, incrementing a counter each time you find an age that fails the rule.","An empty slice has zero invalid ages."}',
    2,
    110,
    '{"error-handling","validation","arrays"}',
    true,
    'seed-error-handling-count-invalid-ages',
    '## Count Invalid Ages

Write a function that returns how many values in a slice `ages` fall outside the plausible human age range of 0 to 150 inclusive.

**Function signature**

```go
func CountInvalidAges(ages []int) int
```

**Examples**

- `CountInvalidAges([25, -5, 200, 40])` returns `2`
- `CountInvalidAges([10, 20, 30])` returns `0`

**Constraints**

- 0 <= len(ages) <= 10000

**Learning objective:** Apply a validation predicate across a whole collection instead of a single value.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-invalid-ages'), '[[25,-5,200,40]]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-invalid-ages'), '[[10,20,30]]'::jsonb, '0', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-invalid-ages'), '[[]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-invalid-ages'), '[[-1,-2,-3]]'::jsonb, '3', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-invalid-ages'), '[[0,150,151,-1]]'::jsonb, '2', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- error-handling :: Safe Integer Square Root (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'safe-int-sqrt',
    'error-handling',
    'function',
    'go',
    'Safe Integer Square Root',
    'Write a function `SafeIntSqrt(n int) int` that returns the integer square root of `n` (the largest integer `r` such that `r*r <= n`) if `n` is non-negative, or -1 if `n` is negative.',
    '- -10^6 <= n <= 10^12',
    'Guard a mathematically undefined case (negative input to a real square root) with an explicit check.',
    'SafeIntSqrt',
    'int',
    '{"int"}',
    '{"A square root is only defined for non-negative numbers — reject negative input up front.","The integer square root of n is the largest integer whose square does not exceed n.","Return the documented sentinel value -1 for negative input instead of computing a nonsensical result."}',
    3,
    150,
    '{"error-handling","math"}',
    true,
    'seed-error-handling-safe-int-sqrt',
    '## Safe Integer Square Root

Write a function `SafeIntSqrt(n int) int` that returns the integer square root of `n` (the largest integer `r` such that `r*r <= n`) if `n` is non-negative, or -1 if `n` is negative.

**Function signature**

```go
func SafeIntSqrt(n int) int
```

**Examples**

- `SafeIntSqrt(16)` returns `4`
- `SafeIntSqrt(-4)` returns `-1`

**Constraints**

- -10^6 <= n <= 10^12

**Learning objective:** Guard a mathematically undefined case (negative input to a real square root) with an explicit check.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-int-sqrt'), '[16]'::jsonb, '4', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-int-sqrt'), '[-4]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-int-sqrt'), '[15]'::jsonb, '3', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-int-sqrt'), '[0]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-int-sqrt'), '[1000000000000]'::jsonb, '1000000', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- error-handling :: Error Message for Status Code (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'error-message-for-code',
    'error-handling',
    'function',
    'go',
    'Error Message for Status Code',
    'Write a function `ErrorMessageForCode(code int) string` that returns the standard HTTP-style message for a known status code — 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 500: "Internal Server Error" — or "Unknown Error" for any other code.',
    '- -1000 <= code <= 1000',
    'Model a custom error type''s message formatting as a lookup with a documented fallback.',
    'ErrorMessageForCode',
    'string',
    '{"int"}',
    '{"A small lookup table mapping known codes to their standard messages is cleaner than a long if/else chain.","Codes outside the known set should map to a generic fallback message rather than an empty string or a panic.","This models a common Go pattern: a custom error type whose Error() method formats a message based on an internal code."}',
    3,
    150,
    '{"error-handling","strings"}',
    true,
    'seed-error-handling-error-message-for-code',
    '## Error Message for Status Code

Write a function `ErrorMessageForCode(code int) string` that returns the standard HTTP-style message for a known status code — 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 500: "Internal Server Error" — or "Unknown Error" for any other code.

**Function signature**

```go
func ErrorMessageForCode(code int) string
```

**Examples**

- `ErrorMessageForCode(404)` returns `"Not Found"`
- `ErrorMessageForCode(200)` returns `"Unknown Error"`

**Constraints**

- -1000 <= code <= 1000

**Learning objective:** Model a custom error type''s message formatting as a lookup with a documented fallback.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'error-message-for-code'), '[404]'::jsonb, 'Not Found', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'error-message-for-code'), '[200]'::jsonb, 'Unknown Error', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'error-message-for-code'), '[500]'::jsonb, 'Internal Server Error', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'error-message-for-code'), '[401]'::jsonb, 'Unauthorized', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'error-message-for-code'), '[999]'::jsonb, 'Unknown Error', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- error-handling :: Validate Username (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'is-valid-username',
    'error-handling',
    'function',
    'go',
    'Validate Username',
    'Write a function that validates a username string `s`: it must be non-empty, no longer than 20 characters, and contain only letters, digits, and underscores.',
    '- 0 <= len(s) <= 200',
    'Chain several independent validation rules together, all of which must pass.',
    'IsValidUsername',
    'bool',
    '{"string"}',
    '{"Combine multiple independent rules: a length check and a character-set check.","A username should only contain letters, digits, and underscores — no spaces or punctuation.","An empty string should always fail validation, regardless of what the character-set check would otherwise say."}',
    3,
    150,
    '{"error-handling","strings","validation"}',
    true,
    'seed-error-handling-is-valid-username',
    '## Validate Username

Write a function that validates a username string `s`: it must be non-empty, no longer than 20 characters, and contain only letters, digits, and underscores.

**Function signature**

```go
func IsValidUsername(s string) bool
```

**Examples**

- `IsValidUsername("jerry_dev")` returns `true`
- `IsValidUsername("")` returns `false`

**Constraints**

- 0 <= len(s) <= 200

**Learning objective:** Chain several independent validation rules together, all of which must pass.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-valid-username'), '["jerry_dev"]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-valid-username'), '[""]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-valid-username'), '["this_username_is_way_too_long"]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-valid-username'), '["bad name!"]'::jsonb, 'false', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-valid-username'), '["OK_123"]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- error-handling :: Validate Stack Operation Sequence (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'is-valid-stack-sequence',
    'error-handling',
    'function',
    'go',
    'Validate Stack Operation Sequence',
    'Write a function that simulates a sequence of stack commands `ops`, each either `"push x"` (x an integer) or `"pop"`, and returns whether the sequence is valid — meaning no `"pop"` is ever attempted while the stack is empty.',
    '- 0 <= len(ops) <= 10000
- Each op is exactly "push <int>" or "pop"',
    'Detect an error condition (popping an empty stack) by simulating state rather than checking it in isolation.',
    'IsValidStackSequence',
    'bool',
    '{"[]string"}',
    '{"Simulate the operations against an actual stack, just as you would to compute a final result.","The sequence becomes invalid the moment a ''pop'' is attempted on an empty stack — that would panic in a real implementation.","If every operation completes without that problem, the whole sequence is valid, regardless of what''s left on the stack at the end."}',
    4,
    190,
    '{"error-handling","stacks"}',
    true,
    'seed-error-handling-is-valid-stack-sequence',
    '## Validate Stack Operation Sequence

Write a function that simulates a sequence of stack commands `ops`, each either `"push x"` (x an integer) or `"pop"`, and returns whether the sequence is valid — meaning no `"pop"` is ever attempted while the stack is empty.

**Function signature**

```go
func IsValidStackSequence(ops []string) bool
```

**Examples**

- `IsValidStackSequence(["push 1", "push 2", "pop", "pop"])` returns `true`
- `IsValidStackSequence(["pop"])` returns `false`

**Constraints**

- 0 <= len(ops) <= 10000
- Each op is exactly "push <int>" or "pop"

**Learning objective:** Detect an error condition (popping an empty stack) by simulating state rather than checking it in isolation.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-valid-stack-sequence'), '[["push 1","push 2","pop","pop"]]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-valid-stack-sequence'), '[["pop"]]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-valid-stack-sequence'), '[["push 1","pop","pop"]]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-valid-stack-sequence'), '[[]]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-valid-stack-sequence'), '[["push 5","push 6","push 7"]]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- error-handling :: First Successful Attempt (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'first-successful-attempt',
    'error-handling',
    'function',
    'go',
    'First Successful Attempt',
    'A retry loop makes a series of attempts, recorded in a slice `attempts` where a non-negative value means that attempt succeeded and a negative value means it failed. Write a function that returns the 1-indexed position of the first successful attempt, or -1 if every attempt failed.',
    '- 0 <= len(attempts) <= 10000',
    'Model a retry-until-success loop as a linear scan with an early, meaningful exit condition.',
    'FirstSuccessfulAttempt',
    'int',
    '{"[]int"}',
    '{"Each value in the slice represents the outcome of one attempt: non-negative means success, negative means failure.","Scan the attempts in order and stop at the first success — this models a retry loop that gives up as soon as it succeeds.","If no attempt ever succeeds, the retry loop exhausts every attempt and should report failure with -1."}',
    4,
    190,
    '{"error-handling","retry-logic"}',
    true,
    'seed-error-handling-first-successful-attempt',
    '## First Successful Attempt

A retry loop makes a series of attempts, recorded in a slice `attempts` where a non-negative value means that attempt succeeded and a negative value means it failed. Write a function that returns the 1-indexed position of the first successful attempt, or -1 if every attempt failed.

**Function signature**

```go
func FirstSuccessfulAttempt(attempts []int) int
```

**Examples**

- `FirstSuccessfulAttempt([-1, -1, 5, -1])` returns `3`
- `FirstSuccessfulAttempt([3, 7, 2])` returns `1`

**Constraints**

- 0 <= len(attempts) <= 10000

**Learning objective:** Model a retry-until-success loop as a linear scan with an early, meaningful exit condition.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'first-successful-attempt'), '[[-1,-1,5,-1]]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'first-successful-attempt'), '[[3,7,2]]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'first-successful-attempt'), '[[-1,-1,-1]]'::jsonb, '-1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'first-successful-attempt'), '[[]]'::jsonb, '-1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'first-successful-attempt'), '[[0]]'::jsonb, '1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- error-handling :: Safe Batch Divide (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'safe-batch-divide',
    'error-handling',
    'function',
    'go',
    'Safe Batch Divide',
    'Write a function `SafeBatchDivide(numerator int, divisors []int) []int` that divides `numerator` by each value in `divisors`, using truncating integer division, and returns the results in order. For any divisor that is 0, record -1 in that position instead of dividing.',
    '- -10^6 <= numerator <= 10^6
- 0 <= len(divisors) <= 10000',
    'Extend a single guarded operation into a batch operation where individual failures don''t halt the whole run.',
    'SafeBatchDivide',
    '[]int',
    '{"int","[]int"}',
    '{"Apply the same safe-division rule (guard against a zero divisor) independently to every element.","One invalid divisor should not stop the rest of the batch from being processed — record its sentinel and move on.","Integer division truncates toward zero, exactly as in the single-value safe-divide exercise."}',
    4,
    190,
    '{"error-handling","arrays"}',
    true,
    'seed-error-handling-safe-batch-divide',
    '## Safe Batch Divide

Write a function `SafeBatchDivide(numerator int, divisors []int) []int` that divides `numerator` by each value in `divisors`, using truncating integer division, and returns the results in order. For any divisor that is 0, record -1 in that position instead of dividing.

**Function signature**

```go
func SafeBatchDivide(numerator int, divisors []int) []int
```

**Examples**

- `SafeBatchDivide(100, [2, 0, 5])` returns `[50, -1, 20]`
- `SafeBatchDivide(7, [])` returns `[]`

**Constraints**

- -10^6 <= numerator <= 10^6
- 0 <= len(divisors) <= 10000

**Learning objective:** Extend a single guarded operation into a batch operation where individual failures don''t halt the whole run.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-batch-divide'), '[100,[2,0,5]]'::jsonb, '[50,-1,20]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-batch-divide'), '[7,[]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-batch-divide'), '[-9,[3]]'::jsonb, '[-3]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-batch-divide'), '[10,[0,0,0]]'::jsonb, '[-1,-1,-1]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-batch-divide'), '[50,[7,-5,2]]'::jsonb, '[7,-10,25]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- error-handling :: Safe Chained Operations (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'safe-chained-operations',
    'error-handling',
    'function',
    'go',
    'Safe Chained Operations',
    'Write a function `SafeChainedOperations(initial int, ops []string) int` that starts with an accumulator equal to `initial` and applies a sequence of operations `ops`, each formatted as `"add x"`, `"sub x"`, `"mul x"`, or `"div x"` (x an integer). If an operation would panic — specifically, a `"div 0"` — recover by skipping just that operation and continue processing the rest. Return the final accumulator value.',
    '- -10^6 <= initial <= 10^6
- 0 <= len(ops) <= 10000',
    'Implement recover-and-continue error handling at the level of a whole sequence of operations, not just a single guarded call.',
    'SafeChainedOperations',
    'int',
    '{"int","[]string"}',
    '{"Process the operations one at a time against a running accumulator, the way a real interpreter would.","A ''div 0'' operation would panic in a literal implementation — recover from it by simply skipping that operation and continuing with the next one.","Every other operation (add, sub, mul, and non-zero div) should apply normally to the accumulator."}',
    5,
    220,
    '{"error-handling","recover"}',
    true,
    'seed-error-handling-safe-chained-operations',
    '## Safe Chained Operations

Write a function `SafeChainedOperations(initial int, ops []string) int` that starts with an accumulator equal to `initial` and applies a sequence of operations `ops`, each formatted as `"add x"`, `"sub x"`, `"mul x"`, or `"div x"` (x an integer). If an operation would panic — specifically, a `"div 0"` — recover by skipping just that operation and continue processing the rest. Return the final accumulator value.

**Function signature**

```go
func SafeChainedOperations(initial int, ops []string) int
```

**Examples**

- `SafeChainedOperations(10, ["add 5", "div 0", "mul 2", "sub 3"])` returns `27`
- `SafeChainedOperations(0, ["div 0", "div 0", "add 100"])` returns `100`

**Constraints**

- -10^6 <= initial <= 10^6
- 0 <= len(ops) <= 10000

**Learning objective:** Implement recover-and-continue error handling at the level of a whole sequence of operations, not just a single guarded call.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-chained-operations'), '[10,["add 5","div 0","mul 2","sub 3"]]'::jsonb, '27', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-chained-operations'), '[0,["div 0","div 0","add 100"]]'::jsonb, '100', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-chained-operations'), '[5,[]]'::jsonb, '5', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-chained-operations'), '[20,["div 4","div 0","div 5"]]'::jsonb, '1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-chained-operations'), '[1,["mul 3","mul 3","div 0","add 2"]]'::jsonb, '11', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- error-handling :: First Non-Empty Fallback (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'first-non-empty-fallback',
    'error-handling',
    'function',
    'go',
    'First Non-Empty Fallback',
    'Write a function that returns the first non-empty string in a slice `sources`, modeling a fallback chain of configuration sources tried in priority order. If every source is empty, or `sources` is empty, return `"default"`.',
    '- 0 <= len(sources) <= 10000',
    'Implement the fallback-chain pattern often used for defaulting configuration values from multiple sources.',
    'FirstNonEmpty',
    'string',
    '{"[]string"}',
    '{"This models a common configuration-loading pattern: try several sources in priority order, and use the first one that actually has a value.","An empty string represents a source that failed to provide a value — it should be skipped, not returned.","If every source is empty (or there are no sources at all), fall back to the documented default value \"default\"."}',
    5,
    220,
    '{"error-handling","fallback-pattern"}',
    true,
    'seed-error-handling-first-non-empty-fallback',
    '## First Non-Empty Fallback

Write a function that returns the first non-empty string in a slice `sources`, modeling a fallback chain of configuration sources tried in priority order. If every source is empty, or `sources` is empty, return `"default"`.

**Function signature**

```go
func FirstNonEmpty(sources []string) string
```

**Examples**

- `FirstNonEmpty(["", "", "prod-config"])` returns `"prod-config"`
- `FirstNonEmpty(["env-config", "file-config"])` returns `"env-config"`

**Constraints**

- 0 <= len(sources) <= 10000

**Learning objective:** Implement the fallback-chain pattern often used for defaulting configuration values from multiple sources.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'first-non-empty-fallback'), '[["","","prod-config"]]'::jsonb, 'prod-config', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'first-non-empty-fallback'), '[["env-config","file-config"]]'::jsonb, 'env-config', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'first-non-empty-fallback'), '[[]]'::jsonb, 'default', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'first-non-empty-fallback'), '[["","",""]]'::jsonb, 'default', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'first-non-empty-fallback'), '[["only-source"]]'::jsonb, 'only-source', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- error-handling :: Safe Index With Default (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'safe-index-or-default',
    'error-handling',
    'function',
    'go',
    'Safe Index With Default',
    'Write a function `SafeIndexOrDefault(nums []int, index, defaultVal int) int` that returns `nums[index]` if `index` is a valid position in `nums`, or `defaultVal` otherwise.',
    '- 0 <= len(nums) <= 10000',
    'Generalize a hardcoded sentinel-return pattern into a caller-configurable default, a common Go API design choice.',
    'SafeIndexOrDefault',
    'int',
    '{"[]int","int","int"}',
    '{"This is the safe-array-access pattern generalized: instead of a fixed sentinel, the caller supplies their own default value.","The validity check is identical to the earlier bounds-checking exercise: the index must fall within [0, len(nums)).","Returning a caller-supplied default rather than a hardcoded sentinel is a common Go idiom for making a fallback value explicit and configurable."}',
    5,
    220,
    '{"error-handling","arrays"}',
    true,
    'seed-error-handling-safe-index-or-default',
    '## Safe Index With Default

Write a function `SafeIndexOrDefault(nums []int, index, defaultVal int) int` that returns `nums[index]` if `index` is a valid position in `nums`, or `defaultVal` otherwise.

**Function signature**

```go
func SafeIndexOrDefault(nums []int, index int, defaultVal int) int
```

**Examples**

- `SafeIndexOrDefault([1, 2, 3], 1, -1)` returns `2`
- `SafeIndexOrDefault([1, 2, 3], 10, -1)` returns `-1`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Generalize a hardcoded sentinel-return pattern into a caller-configurable default, a common Go API design choice.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-index-or-default'), '[[1,2,3],1,-1]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-index-or-default'), '[[1,2,3],10,-1]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-index-or-default'), '[[],0,99]'::jsonb, '99', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-index-or-default'), '[[5,6],-1,0]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'safe-index-or-default'), '[[7],0,42]'::jsonb, '7', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- interfaces-generics :: Generic Max (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'generic-max',
    'interfaces-generics',
    'function',
    'go',
    'Generic Max',
    'Go generics let you write a single function that works across many types using a type parameter. Write a generic function `Max[T constraints.Ordered](a, b T) T` that returns the larger of two values. For grading, it is instantiated and called with `int` arguments.',
    '- -10^9 <= a, b <= 10^9',
    'Write your first type-parameterized function and see how a generic constraint like Ordered captures ''can be compared with <''.',
    'Max',
    'int',
    '{"int","int"}',
    '{"A generic Max[T Ordered](a, b T) T works identically for ints, floats, or strings — the comparison logic never changes.","For grading, this function is exercised with int arguments, but write it as if T could be any ordered type.","Only one of the two values needs to be returned — pick whichever is not smaller."}',
    1,
    70,
    '{"generics","beginner"}',
    true,
    'seed-interfaces-generics-generic-max',
    '## Generic Max

Go generics let you write a single function that works across many types using a type parameter. Write a generic function `Max[T constraints.Ordered](a, b T) T` that returns the larger of two values. For grading, it is instantiated and called with `int` arguments.

**Function signature**

```go
func Max(a int, b int) int
```

**Examples**

- `Max(3, 7)` returns `7`
- `Max(10, 2)` returns `10`

**Constraints**

- -10^9 <= a, b <= 10^9

**Learning objective:** Write your first type-parameterized function and see how a generic constraint like Ordered captures ''can be compared with <''.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-max'), '[3,7]'::jsonb, '7', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-max'), '[10,2]'::jsonb, '10', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-max'), '[5,5]'::jsonb, '5', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-max'), '[-8,-3]'::jsonb, '-3', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-max'), '[0,0]'::jsonb, '0', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- interfaces-generics :: Generic Min (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'generic-min',
    'interfaces-generics',
    'function',
    'go',
    'Generic Min',
    'Write a generic function `Min[T constraints.Ordered](a, b T) T` that returns the smaller of two values. For grading, it is instantiated and called with `int` arguments.',
    '- -10^9 <= a, b <= 10^9',
    'Reinforce the Ordered constraint pattern from a second angle before moving to collection-based generics.',
    'Min',
    'int',
    '{"int","int"}',
    '{"This is the mirror image of Max — the same Ordered constraint, comparing in the opposite direction.","For grading, this function is exercised with int arguments, but write it generically.","Only one of the two values needs to be returned — pick whichever is not larger."}',
    1,
    70,
    '{"generics","beginner"}',
    true,
    'seed-interfaces-generics-generic-min',
    '## Generic Min

Write a generic function `Min[T constraints.Ordered](a, b T) T` that returns the smaller of two values. For grading, it is instantiated and called with `int` arguments.

**Function signature**

```go
func Min(a int, b int) int
```

**Examples**

- `Min(3, 7)` returns `3`
- `Min(10, 2)` returns `2`

**Constraints**

- -10^9 <= a, b <= 10^9

**Learning objective:** Reinforce the Ordered constraint pattern from a second angle before moving to collection-based generics.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-min'), '[3,7]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-min'), '[10,2]'::jsonb, '2', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-min'), '[5,5]'::jsonb, '5', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-min'), '[-8,-3]'::jsonb, '-8', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-min'), '[0,0]'::jsonb, '0', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- interfaces-generics :: Animal Sound Dispatch (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'animal-sound-dispatch',
    'interfaces-generics',
    'function',
    'go',
    'Animal Sound Dispatch',
    'Imagine an `Animal` interface with a `Speak() string` method, implemented by `Dog` ("Woof"), `Cat` ("Meow"), and `Cow` ("Moo"). Write a function `AnimalSound(animalType string) string` that returns the sound for the named animal type, standing in for calling `Speak()` on the corresponding implementation. Return "..." for any unrecognized type.',
    '- animalType is a plain string, e.g. "Dog", "Cat", "Cow", or an unrecognized value',
    'Model interface-based dispatch (one method, many implementations) using a simple, gradable switch.',
    'AnimalSound',
    'string',
    '{"string"}',
    '{"Imagine an Animal interface with a Speak() string method, implemented differently by Dog, Cat, and Cow types.","For grading, the concrete type is passed in as a string name rather than an actual interface value, so a switch on that name stands in for interface dispatch.","Any animal type name that isn''t recognized should fall back to a generic \"...\" sound."}',
    1,
    70,
    '{"interfaces","beginner"}',
    true,
    'seed-interfaces-generics-animal-sound-dispatch',
    '## Animal Sound Dispatch

Imagine an `Animal` interface with a `Speak() string` method, implemented by `Dog` ("Woof"), `Cat` ("Meow"), and `Cow` ("Moo"). Write a function `AnimalSound(animalType string) string` that returns the sound for the named animal type, standing in for calling `Speak()` on the corresponding implementation. Return "..." for any unrecognized type.

**Function signature**

```go
func AnimalSound(animalType string) string
```

**Examples**

- `AnimalSound("Dog")` returns `"Woof"`
- `AnimalSound("Cat")` returns `"Meow"`

**Constraints**

- animalType is a plain string, e.g. "Dog", "Cat", "Cow", or an unrecognized value

**Learning objective:** Model interface-based dispatch (one method, many implementations) using a simple, gradable switch.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'animal-sound-dispatch'), '["Dog"]'::jsonb, 'Woof', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'animal-sound-dispatch'), '["Cat"]'::jsonb, 'Meow', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'animal-sound-dispatch'), '["Cow"]'::jsonb, 'Moo', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'animal-sound-dispatch'), '["Fish"]'::jsonb, '...', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'animal-sound-dispatch'), '[""]'::jsonb, '...', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- interfaces-generics :: Generic Contains (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'generic-contains',
    'interfaces-generics',
    'function',
    'go',
    'Generic Contains',
    'Write a generic function `Contains[T comparable](s []T, target T) bool` that returns whether `target` appears anywhere in `s`. For grading, it is instantiated and called with a slice of `int`.',
    '- 0 <= len(nums) <= 10000',
    'Introduce the comparable constraint, which captures ''supports == and !=''.',
    'ContainsInt',
    'bool',
    '{"[]int","int"}',
    '{"A generic Contains[T comparable](s []T, target T) bool only needs the ability to check equality, captured by the comparable constraint.","A single linear scan checking each element against target is all that''s required.","For grading, this function is exercised with a slice of ints, but write it as if T could be any comparable type."}',
    2,
    110,
    '{"generics","arrays"}',
    true,
    'seed-interfaces-generics-generic-contains',
    '## Generic Contains

Write a generic function `Contains[T comparable](s []T, target T) bool` that returns whether `target` appears anywhere in `s`. For grading, it is instantiated and called with a slice of `int`.

**Function signature**

```go
func ContainsInt(nums []int, target int) bool
```

**Examples**

- `ContainsInt([1, 2, 3], 2)` returns `true`
- `ContainsInt([1, 2, 3], 9)` returns `false`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Introduce the comparable constraint, which captures ''supports == and !=''.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-contains'), '[[1,2,3],2]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-contains'), '[[1,2,3],9]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-contains'), '[[],1]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-contains'), '[[5,5,5],5]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-contains'), '[[-1,-2,-3],-2]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- interfaces-generics :: Generic Reverse (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'generic-reverse-slice',
    'interfaces-generics',
    'function',
    'go',
    'Generic Reverse',
    'Write a generic function `Reverse[T any](s []T) []T` that returns a new slice with the elements of `s` in reverse order. For grading, it is instantiated and called with a slice of `int`.',
    '- 0 <= len(nums) <= 10000',
    'Recognize when the any constraint (no requirements at all) is sufficient, because the operation doesn''t compare or order elements.',
    'GenericReverse',
    '[]int',
    '{"[]int"}',
    '{"A generic Reverse[T any](s []T) []T works on a slice of anything — it never needs to inspect the elements themselves, just their positions.","The any constraint places no requirements on T at all, since reversing never compares or combines elements.","Build the result by walking from the last element to the first, or swap pairs of elements from both ends inward."}',
    2,
    110,
    '{"generics","arrays"}',
    true,
    'seed-interfaces-generics-generic-reverse-slice',
    '## Generic Reverse

Write a generic function `Reverse[T any](s []T) []T` that returns a new slice with the elements of `s` in reverse order. For grading, it is instantiated and called with a slice of `int`.

**Function signature**

```go
func GenericReverse(nums []int) []int
```

**Examples**

- `GenericReverse([1, 2, 3, 4])` returns `[4, 3, 2, 1]`
- `GenericReverse([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Recognize when the any constraint (no requirements at all) is sufficient, because the operation doesn''t compare or order elements.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-reverse-slice'), '[[1,2,3,4]]'::jsonb, '[4,3,2,1]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-reverse-slice'), '[[]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-reverse-slice'), '[[9]]'::jsonb, '[9]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-reverse-slice'), '[[1,2]]'::jsonb, '[2,1]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-reverse-slice'), '[[5,4,3,2,1]]'::jsonb, '[1,2,3,4,5]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- interfaces-generics :: Shape Area Dispatch (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'shape-area-dispatch',
    'interfaces-generics',
    'function',
    'go',
    'Shape Area Dispatch',
    'Imagine a `Shape` interface with an `Area() int` method, implemented by `Rectangle` (dims `[width, height]`), `Square` (dims `[side]`), and `Triangle` (dims `[base, height]`, area computed as `base * height / 2` using integer division). Write a function `ComputeShapeArea(shapeType string, dims []int) int` that returns the area for the given shape type and dimensions, standing in for calling `Area()` on the corresponding implementation. Return -1 for an unrecognized shape type.',
    '- dims has exactly the length each shape type expects
- 0 <= dims[i] <= 10000',
    'Model interface-based dispatch where each implementation also has its own internal computation.',
    'ComputeShapeArea',
    'int',
    '{"string","[]int"}',
    '{"Imagine a Shape interface with an Area() int method, implemented differently by Rectangle, Square, and Triangle types.","Each shape type interprets its dims slice differently: Rectangle is [width, height], Square is [side], Triangle is [base, height].","Triangle area uses integer division truncated toward zero: (base * height) / 2."}',
    2,
    110,
    '{"interfaces"}',
    true,
    'seed-interfaces-generics-shape-area-dispatch',
    '## Shape Area Dispatch

Imagine a `Shape` interface with an `Area() int` method, implemented by `Rectangle` (dims `[width, height]`), `Square` (dims `[side]`), and `Triangle` (dims `[base, height]`, area computed as `base * height / 2` using integer division). Write a function `ComputeShapeArea(shapeType string, dims []int) int` that returns the area for the given shape type and dimensions, standing in for calling `Area()` on the corresponding implementation. Return -1 for an unrecognized shape type.

**Function signature**

```go
func ComputeShapeArea(shapeType string, dims []int) int
```

**Examples**

- `ComputeShapeArea("Rectangle", [4, 5])` returns `20`
- `ComputeShapeArea("Square", [6])` returns `36`

**Constraints**

- dims has exactly the length each shape type expects
- 0 <= dims[i] <= 10000

**Learning objective:** Model interface-based dispatch where each implementation also has its own internal computation.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'shape-area-dispatch'), '["Rectangle",[4,5]]'::jsonb, '20', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'shape-area-dispatch'), '["Square",[6]]'::jsonb, '36', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'shape-area-dispatch'), '["Triangle",[8,3]]'::jsonb, '12', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'shape-area-dispatch'), '["Circle",[5]]'::jsonb, '-1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'shape-area-dispatch'), '["Rectangle",[0,10]]'::jsonb, '0', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- interfaces-generics :: Generic Filter (Even Numbers) (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'generic-filter-even',
    'interfaces-generics',
    'function',
    'go',
    'Generic Filter (Even Numbers)',
    'A generic `Filter[T any](s []T, keep func(T) bool) []T` returns only the elements of `s` for which `keep` returns true. Write `FilterEven(nums []int) []int`, modeling `Filter` instantiated with `int` and called with an ''is even'' predicate, returning only the even numbers from `nums` in their original order.',
    '- 0 <= len(nums) <= 10000',
    'Understand how passing a function as a parameter lets one generic Filter implementation support any condition.',
    'FilterEven',
    '[]int',
    '{"[]int"}',
    '{"A generic Filter[T any](s []T, keep func(T) bool) []T works with any predicate function you hand it.","For this exercise, the predicate baked into the function is fixed: keep a number if it''s even.","Build the result slice by appending each element that satisfies the predicate, in its original order."}',
    3,
    150,
    '{"generics","arrays"}',
    true,
    'seed-interfaces-generics-generic-filter-even',
    '## Generic Filter (Even Numbers)

A generic `Filter[T any](s []T, keep func(T) bool) []T` returns only the elements of `s` for which `keep` returns true. Write `FilterEven(nums []int) []int`, modeling `Filter` instantiated with `int` and called with an ''is even'' predicate, returning only the even numbers from `nums` in their original order.

**Function signature**

```go
func FilterEven(nums []int) []int
```

**Examples**

- `FilterEven([1, 2, 3, 4, 5, 6])` returns `[2, 4, 6]`
- `FilterEven([1, 3, 5])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Understand how passing a function as a parameter lets one generic Filter implementation support any condition.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-filter-even'), '[[1,2,3,4,5,6]]'::jsonb, '[2,4,6]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-filter-even'), '[[1,3,5]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-filter-even'), '[[]]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-filter-even'), '[[2,4,6,8]]'::jsonb, '[2,4,6,8]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-filter-even'), '[[-4,-3,-2,-1]]'::jsonb, '[-4,-2]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- interfaces-generics :: Generic Map (Square) (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'generic-map-square',
    'interfaces-generics',
    'function',
    'go',
    'Generic Map (Square)',
    'A generic `Map[T, U any](s []T, f func(T) U) []U` applies `f` to every element of `s`, returning a new slice of the results. Write `MapSquare(nums []int) []int`, modeling `Map` instantiated with `int` for both type parameters and called with a squaring function, returning the square of every element of `nums` in order.',
    '- 0 <= len(nums) <= 10000
- -10^4 <= nums[i] <= 10^4',
    'See how Map''s two independent type parameters (input type and output type) support transformations, unlike Filter which always preserves the element type.',
    'MapSquare',
    '[]int',
    '{"[]int"}',
    '{"A generic Map[T, U any](s []T, f func(T) U) []U transforms every element independently, possibly into a different type U.","For this exercise, both T and U are int, and the transform baked into the function is squaring.","The result slice has exactly the same length as the input, with each element replaced by its transformed value."}',
    3,
    150,
    '{"generics","arrays"}',
    true,
    'seed-interfaces-generics-generic-map-square',
    '## Generic Map (Square)

A generic `Map[T, U any](s []T, f func(T) U) []U` applies `f` to every element of `s`, returning a new slice of the results. Write `MapSquare(nums []int) []int`, modeling `Map` instantiated with `int` for both type parameters and called with a squaring function, returning the square of every element of `nums` in order.

**Function signature**

```go
func MapSquare(nums []int) []int
```

**Examples**

- `MapSquare([1, 2, 3])` returns `[1, 4, 9]`
- `MapSquare([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 10000
- -10^4 <= nums[i] <= 10^4

**Learning objective:** See how Map''s two independent type parameters (input type and output type) support transformations, unlike Filter which always preserves the element type.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-map-square'), '[[1,2,3]]'::jsonb, '[1,4,9]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-map-square'), '[[]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-map-square'), '[[-2,0,2]]'::jsonb, '[4,0,4]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-map-square'), '[[5]]'::jsonb, '[25]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-map-square'), '[[10,-10,3]]'::jsonb, '[100,100,9]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- interfaces-generics :: Payment Method Dispatch (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'payment-method-dispatch',
    'interfaces-generics',
    'function',
    'go',
    'Payment Method Dispatch',
    'Imagine a `PaymentProcessor` interface with a `Process(amountCents int) string` method, implemented by `CreditCard` (returns `"Charged $X.XX to credit card"`), `PayPal` (returns `"Sent $X.XX via PayPal"`), and `Cash` (returns `"Received $X.XX in cash"`), where `X.XX` is `amountCents` formatted as dollars and cents. Write a function `ProcessPayment(method string, amountCents int) string` that returns the appropriate confirmation message, or `"Unsupported payment method"` for an unrecognized `method`.',
    '- 0 <= amountCents <= 10^9',
    'Combine interface-style dispatch with per-implementation formatting logic.',
    'ProcessPayment',
    'string',
    '{"string","int"}',
    '{"Imagine a PaymentProcessor interface with a Process(amountCents int) string method, implemented differently by CreditCard, PayPal, and Cash types.","Convert cents to a dollars-and-cents display by dividing by 100 for the whole dollars and taking the remainder for the cents, zero-padded to two digits.","Each implementation formats its own confirmation message; an unrecognized method name should report that the payment method isn''t supported."}',
    3,
    150,
    '{"interfaces"}',
    true,
    'seed-interfaces-generics-payment-method-dispatch',
    '## Payment Method Dispatch

Imagine a `PaymentProcessor` interface with a `Process(amountCents int) string` method, implemented by `CreditCard` (returns `"Charged $X.XX to credit card"`), `PayPal` (returns `"Sent $X.XX via PayPal"`), and `Cash` (returns `"Received $X.XX in cash"`), where `X.XX` is `amountCents` formatted as dollars and cents. Write a function `ProcessPayment(method string, amountCents int) string` that returns the appropriate confirmation message, or `"Unsupported payment method"` for an unrecognized `method`.

**Function signature**

```go
func ProcessPayment(method string, amountCents int) string
```

**Examples**

- `ProcessPayment("CreditCard", 1234)` returns `"Charged $12.34 to credit card"`
- `ProcessPayment("PayPal", 500)` returns `"Sent $5.00 via PayPal"`

**Constraints**

- 0 <= amountCents <= 10^9

**Learning objective:** Combine interface-style dispatch with per-implementation formatting logic.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'payment-method-dispatch'), '["CreditCard",1234]'::jsonb, 'Charged $12.34 to credit card', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'payment-method-dispatch'), '["PayPal",500]'::jsonb, 'Sent $5.00 via PayPal', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'payment-method-dispatch'), '["Cash",5]'::jsonb, 'Received $0.05 in cash', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'payment-method-dispatch'), '["Bitcoin",100]'::jsonb, 'Unsupported payment method', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'payment-method-dispatch'), '["Cash",0]'::jsonb, 'Received $0.00 in cash', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- interfaces-generics :: Generic Reduce (Sum) (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'generic-reduce-sum',
    'interfaces-generics',
    'function',
    'go',
    'Generic Reduce (Sum)',
    'A generic `Reduce[T, U any](s []T, initial U, combine func(U, T) U) U` folds `s` into a single value by repeatedly combining an accumulator (starting at `initial`) with each element. Write `ReduceSum(nums []int) int`, modeling `Reduce` instantiated with `int` for both type parameters, an initial accumulator of 0, and addition as the combining function — returning the sum of `nums`.',
    '- 0 <= len(nums) <= 10000',
    'Recognize Reduce/fold as the most general of the generic collection operations, capable of expressing sum, product, max, and more.',
    'ReduceSum',
    'int',
    '{"[]int"}',
    '{"A generic Reduce[T, U any](s []T, initial U, combine func(U, T) U) U folds a slice down to a single accumulated value.","For this exercise, both T and U are int, the initial accumulator is 0, and the combining function is addition.","Process the slice left to right, updating the accumulator with each element in turn."}',
    4,
    190,
    '{"generics","arrays"}',
    true,
    'seed-interfaces-generics-generic-reduce-sum',
    '## Generic Reduce (Sum)

A generic `Reduce[T, U any](s []T, initial U, combine func(U, T) U) U` folds `s` into a single value by repeatedly combining an accumulator (starting at `initial`) with each element. Write `ReduceSum(nums []int) int`, modeling `Reduce` instantiated with `int` for both type parameters, an initial accumulator of 0, and addition as the combining function — returning the sum of `nums`.

**Function signature**

```go
func ReduceSum(nums []int) int
```

**Examples**

- `ReduceSum([1, 2, 3, 4])` returns `10`
- `ReduceSum([])` returns `0`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Recognize Reduce/fold as the most general of the generic collection operations, capable of expressing sum, product, max, and more.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-reduce-sum'), '[[1,2,3,4]]'::jsonb, '10', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-reduce-sum'), '[[]]'::jsonb, '0', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-reduce-sum'), '[[10]]'::jsonb, '10', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-reduce-sum'), '[[-5,5,-5,5]]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-reduce-sum'), '[[100,200,300]]'::jsonb, '600', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- interfaces-generics :: Generic Find Index (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'generic-find-index',
    'interfaces-generics',
    'function',
    'go',
    'Generic Find Index',
    'Write a generic function `FindIndex[T comparable](s []T, target T) int` that returns the index of the first occurrence of `target` in `s`, or -1 if it is not present. For grading, it is instantiated and called with a slice of `int`.',
    '- 0 <= len(nums) <= 10000',
    'Reapply the comparable constraint from Contains to a slightly richer query (position, not just presence).',
    'GenericFindIndex',
    'int',
    '{"[]int","int"}',
    '{"A generic FindIndex[T comparable](s []T, target T) int scans for the first matching element and reports where it was found.","The comparable constraint is exactly what''s needed here, since the only operation performed on elements is an equality check.","Return -1 if no element in the slice equals target, following the same not-found convention as ordinary linear search."}',
    4,
    190,
    '{"generics","arrays"}',
    true,
    'seed-interfaces-generics-generic-find-index',
    '## Generic Find Index

Write a generic function `FindIndex[T comparable](s []T, target T) int` that returns the index of the first occurrence of `target` in `s`, or -1 if it is not present. For grading, it is instantiated and called with a slice of `int`.

**Function signature**

```go
func GenericFindIndex(nums []int, target int) int
```

**Examples**

- `GenericFindIndex([4, 2, 7, 1], 7)` returns `2`
- `GenericFindIndex([1, 2, 3], 9)` returns `-1`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Reapply the comparable constraint from Contains to a slightly richer query (position, not just presence).'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-find-index'), '[[4,2,7,1],7]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-find-index'), '[[1,2,3],9]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-find-index'), '[[],5]'::jsonb, '-1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-find-index'), '[[5,5,5],5]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-find-index'), '[[10,20,30,40],40]'::jsonb, '3', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- interfaces-generics :: Sorter Strategy Dispatch (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'sorter-strategy-dispatch',
    'interfaces-generics',
    'function',
    'go',
    'Sorter Strategy Dispatch',
    'Imagine a `Sorter` interface with a `Sort(nums []int) []int` method, implemented by an `AscendingSorter` (strategy `"asc"`) and a `DescendingSorter` (strategy `"desc"`). Write a function `SortWithStrategy(nums []int, strategy string) []int` that returns `nums` sorted according to the named strategy, standing in for calling `Sort()` on the corresponding implementation. For any unrecognized strategy, return the elements in their original order, unchanged.',
    '- 0 <= len(nums) <= 10000',
    'Model the strategy pattern (interchangeable algorithms behind one interface) with a documented fallback for the unrecognized case.',
    'SortWithStrategy',
    '[]int',
    '{"[]int","string"}',
    '{"Imagine a Sorter interface with a Sort(nums []int) []int method, implemented differently by an AscendingSorter and a DescendingSorter.","The strategy name selects which implementation''s Sort method would be called; an unrecognized strategy should be treated as a no-op that leaves the input unchanged.","The original slice must not be mutated in place if the strategy is unrecognized — return a copy in the original order."}',
    4,
    190,
    '{"interfaces"}',
    true,
    'seed-interfaces-generics-sorter-strategy-dispatch',
    '## Sorter Strategy Dispatch

Imagine a `Sorter` interface with a `Sort(nums []int) []int` method, implemented by an `AscendingSorter` (strategy `"asc"`) and a `DescendingSorter` (strategy `"desc"`). Write a function `SortWithStrategy(nums []int, strategy string) []int` that returns `nums` sorted according to the named strategy, standing in for calling `Sort()` on the corresponding implementation. For any unrecognized strategy, return the elements in their original order, unchanged.

**Function signature**

```go
func SortWithStrategy(nums []int, strategy string) []int
```

**Examples**

- `SortWithStrategy([3, 1, 2], "asc")` returns `[1, 2, 3]`
- `SortWithStrategy([3, 1, 2], "desc")` returns `[3, 2, 1]`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Model the strategy pattern (interchangeable algorithms behind one interface) with a documented fallback for the unrecognized case.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sorter-strategy-dispatch'), '[[3,1,2],"asc"]'::jsonb, '[1,2,3]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sorter-strategy-dispatch'), '[[3,1,2],"desc"]'::jsonb, '[3,2,1]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sorter-strategy-dispatch'), '[[5,4,6],"unknown"]'::jsonb, '[5,4,6]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sorter-strategy-dispatch'), '[[],"asc"]'::jsonb, '[]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sorter-strategy-dispatch'), '[[9,9,1],"desc"]'::jsonb, '[9,9,1]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- interfaces-generics :: Generic Unique (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'generic-unique',
    'interfaces-generics',
    'function',
    'go',
    'Generic Unique',
    'Write a generic function `Unique[T comparable](s []T) []T` that returns the elements of `s` with later duplicates removed, preserving the order of first occurrence. The input is not assumed to be sorted. For grading, it is instantiated and called with a slice of `int`.',
    '- 0 <= len(nums) <= 10000',
    'Extend the comparable constraint to a stateful, order-preserving deduplication over unsorted data.',
    'GenericUnique',
    '[]int',
    '{"[]int"}',
    '{"A generic Unique[T comparable](s []T) []T removes later duplicates while keeping each value''s first occurrence in place.","Track which values have already been seen (the comparable constraint is exactly what makes this trackable), and only keep a value the first time it appears.","Unlike deduplicating a sorted slice, the input here is not assumed to be sorted, so duplicates may not be adjacent."}',
    5,
    220,
    '{"generics","arrays"}',
    true,
    'seed-interfaces-generics-generic-unique',
    '## Generic Unique

Write a generic function `Unique[T comparable](s []T) []T` that returns the elements of `s` with later duplicates removed, preserving the order of first occurrence. The input is not assumed to be sorted. For grading, it is instantiated and called with a slice of `int`.

**Function signature**

```go
func GenericUnique(nums []int) []int
```

**Examples**

- `GenericUnique([1, 2, 2, 3, 1, 4])` returns `[1, 2, 3, 4]`
- `GenericUnique([5, 5, 5])` returns `[5]`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Extend the comparable constraint to a stateful, order-preserving deduplication over unsorted data.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-unique'), '[[1,2,2,3,1,4]]'::jsonb, '[1,2,3,4]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-unique'), '[[5,5,5]]'::jsonb, '[5]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-unique'), '[[]]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-unique'), '[[1,2,3]]'::jsonb, '[1,2,3]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'generic-unique'), '[[9,1,9,2,1,3]]'::jsonb, '[9,1,2,3]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- interfaces-generics :: Notification Channel Dispatch (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'notification-channel-dispatch',
    'interfaces-generics',
    'function',
    'go',
    'Notification Channel Dispatch',
    'Imagine a `Notifier` interface with a `Format(message string) string` method, implemented by `Email` (prefix `"[EMAIL]"`), `SMS` (prefix `"[SMS]"`), and `Push` (prefix `"[PUSH]"`). Write a function `FormatNotification(channel, message string) string` that returns `message` prefixed with the tag for the named channel (as `"<tag> <message>"`), standing in for calling `Format()` on the corresponding implementation. Use `"[UNKNOWN]"` as the prefix for any unrecognized channel.',
    '- 0 <= len(message) <= 500',
    'Combine interface dispatch with string formatting, and design a sensible fallback for the unmapped case.',
    'FormatNotification',
    'string',
    '{"string","string"}',
    '{"Imagine a Notifier interface with a Format(message string) string method, implemented differently by Email, SMS, and Push notifier types.","Each implementation prefixes the message with its own channel tag, so the same message renders differently depending on which Notifier formats it.","An unrecognized channel should fall back to a generic \"[UNKNOWN]\" tag rather than failing outright."}',
    5,
    220,
    '{"interfaces"}',
    true,
    'seed-interfaces-generics-notification-channel-dispatch',
    '## Notification Channel Dispatch

Imagine a `Notifier` interface with a `Format(message string) string` method, implemented by `Email` (prefix `"[EMAIL]"`), `SMS` (prefix `"[SMS]"`), and `Push` (prefix `"[PUSH]"`). Write a function `FormatNotification(channel, message string) string` that returns `message` prefixed with the tag for the named channel (as `"<tag> <message>"`), standing in for calling `Format()` on the corresponding implementation. Use `"[UNKNOWN]"` as the prefix for any unrecognized channel.

**Function signature**

```go
func FormatNotification(channel string, message string) string
```

**Examples**

- `FormatNotification("Email", "Server is down")` returns `"[EMAIL] Server is down"`
- `FormatNotification("SMS", "Code: 4821")` returns `"[SMS] Code: 4821"`

**Constraints**

- 0 <= len(message) <= 500

**Learning objective:** Combine interface dispatch with string formatting, and design a sensible fallback for the unmapped case.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'notification-channel-dispatch'), '["Email","Server is down"]'::jsonb, '[EMAIL] Server is down', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'notification-channel-dispatch'), '["SMS","Code: 4821"]'::jsonb, '[SMS] Code: 4821', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'notification-channel-dispatch'), '["Push","New message"]'::jsonb, '[PUSH] New message', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'notification-channel-dispatch'), '["Fax","Old school"]'::jsonb, '[UNKNOWN] Old school', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'notification-channel-dispatch'), '["Push",""]'::jsonb, '[PUSH] ', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- interfaces-generics :: Shape Perimeter Classification (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'shape-perimeter-classify',
    'interfaces-generics',
    'function',
    'go',
    'Shape Perimeter Classification',
    'Building on the `Shape` interface idea, each shape also computes a perimeter: `Square` (dims `[side]`, perimeter `4 * side`), `Rectangle` (dims `[width, height]`, perimeter `2 * (width + height)`), and `Triangle` (dims `[a, b, c]`, perimeter `a + b + c`). Write a function `ClassifyShapePerimeter(shapeType string, dims []int) string` that computes the perimeter for the given shape and classifies it as `"small"` (< 10), `"medium"` (10 to 30 inclusive), or `"large"` (> 30). Return `"invalid"` for an unrecognized shape type.',
    '- dims has exactly the length each shape type expects
- 0 <= dims[i] <= 10000',
    'Chain an interface-dispatched computation into a follow-up classification step, combining two of this module''s ideas in one problem.',
    'ClassifyShapePerimeter',
    'string',
    '{"string","[]int"}',
    '{"First compute the perimeter using the same interface-dispatch idea as the shape area exercise, just with a different formula per shape.","Square perimeter is 4 times its side; Rectangle perimeter is twice the sum of width and height; Triangle perimeter is the sum of its three given side lengths.","Once you have the perimeter, classify it against the thresholds: below 10 is \"small\", from 10 up to and including 30 is \"medium\", and above 30 is \"large\"."}',
    5,
    220,
    '{"interfaces"}',
    true,
    'seed-interfaces-generics-shape-perimeter-classify',
    '## Shape Perimeter Classification

Building on the `Shape` interface idea, each shape also computes a perimeter: `Square` (dims `[side]`, perimeter `4 * side`), `Rectangle` (dims `[width, height]`, perimeter `2 * (width + height)`), and `Triangle` (dims `[a, b, c]`, perimeter `a + b + c`). Write a function `ClassifyShapePerimeter(shapeType string, dims []int) string` that computes the perimeter for the given shape and classifies it as `"small"` (< 10), `"medium"` (10 to 30 inclusive), or `"large"` (> 30). Return `"invalid"` for an unrecognized shape type.

**Function signature**

```go
func ClassifyShapePerimeter(shapeType string, dims []int) string
```

**Examples**

- `ClassifyShapePerimeter("Square", [3])` returns `"medium"`
- `ClassifyShapePerimeter("Rectangle", [10, 10])` returns `"large"`

**Constraints**

- dims has exactly the length each shape type expects
- 0 <= dims[i] <= 10000

**Learning objective:** Chain an interface-dispatched computation into a follow-up classification step, combining two of this module''s ideas in one problem.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'shape-perimeter-classify'), '["Square",[3]]'::jsonb, 'medium', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'shape-perimeter-classify'), '["Rectangle",[10,10]]'::jsonb, 'large', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'shape-perimeter-classify'), '["Triangle",[3,4,5]]'::jsonb, 'medium', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'shape-perimeter-classify'), '["Circle",[5]]'::jsonb, 'invalid', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'shape-perimeter-classify'), '["Square",[20]]'::jsonb, 'large', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

COMMIT;

-- ---- Verification: problem count per module (expect 15 / 15) ----
SELECT module, COUNT(*) AS problem_count
FROM problems
WHERE module IN ('error-handling', 'interfaces-generics')
GROUP BY module
ORDER BY module;

-- ---- Verification: test case count per problem (expect 5 for every row) ----
SELECT p.slug, COUNT(tc.id) AS test_case_count
FROM problems p
JOIN test_cases tc ON tc.problem_id = p.id
WHERE p.module IN ('error-handling', 'interfaces-generics')
GROUP BY p.slug
HAVING COUNT(tc.id) <> 5
ORDER BY p.slug;
-- An empty result set above confirms every problem has exactly 5 test cases.