-- ============================================================================
-- Koder :: Problem Seed Migration
-- Math & Recursion / Arrays & Strings / Data Structures (15 problems each)
-- Every expected test-case value below is computed programmatically from a
-- Python reference implementation of the intended Go solution before being
-- written into this script, so a correct submission is guaranteed to pass.
-- ============================================================================

BEGIN;

-- ---- math-recursion :: Sum of Digits (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'sum-of-digits',
    'math-recursion',
    'function',
    'go',
    'Sum of Digits',
    'Write a recursive function that computes the sum of the decimal digits of a non-negative integer `n`. This is a classic first exercise in recursive thinking: every recursive call should work on a strictly smaller version of the problem (fewer digits) until it reaches a base case it can answer directly.',
    '- 0 <= n <= 10^9
- The function must be implemented recursively, not with a loop.',
    'Identify a base case and a recursive case; reduce a problem''s size on every call.',
    'SumOfDigits',
    'int',
    '{"int"}',
    '{"Think about what happens to a number when you strip off its last digit with integer division by 10.","The base case is a single-digit number — it is its own digit sum.","Combine the last digit (n % 10) with the recursive result on the remaining digits (n / 10)."}',
    1,
    70,
    '{"math","recursion","beginner"}',
    true,
    'seed-math-recursion-sum-of-digits',
    '## Sum of Digits

Write a recursive function that computes the sum of the decimal digits of a non-negative integer `n`. This is a classic first exercise in recursive thinking: every recursive call should work on a strictly smaller version of the problem (fewer digits) until it reaches a base case it can answer directly.

**Function signature**

```go
func SumOfDigits(n int) int
```

**Examples**

- `SumOfDigits(0)` returns `0`
- `SumOfDigits(7)` returns `7`

**Constraints**

- 0 <= n <= 10^9
- The function must be implemented recursively, not with a loop.

**Learning objective:** Identify a base case and a recursive case; reduce a problem''s size on every call.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-of-digits'), '[0]'::jsonb, '0', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-of-digits'), '[7]'::jsonb, '7', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-of-digits'), '[12345]'::jsonb, '15', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-of-digits'), '[100]'::jsonb, '1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-of-digits'), '[999999]'::jsonb, '54', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- math-recursion :: Factorial (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'factorial',
    'math-recursion',
    'function',
    'go',
    'Factorial',
    'Write a recursive function that computes `n!` (n factorial) for a non-negative integer `n`. Factorial is the product of all positive integers up to `n`, and it is the textbook example of a function whose recursive definition mirrors its mathematical definition almost exactly.',
    '- 0 <= n <= 12 (kept small to avoid overflow on 64-bit ints)',
    'Translate a mathematical recurrence relation directly into recursive code.',
    'Factorial',
    'int',
    '{"int"}',
    '{"Recall that n! = n * (n-1)!.","0! and 1! are both defined to be 1 — that''s your base case.","Make sure the recursive call always moves n closer to the base case (n-1, not n)."}',
    1,
    70,
    '{"math","recursion","beginner"}',
    true,
    'seed-math-recursion-factorial',
    '## Factorial

Write a recursive function that computes `n!` (n factorial) for a non-negative integer `n`. Factorial is the product of all positive integers up to `n`, and it is the textbook example of a function whose recursive definition mirrors its mathematical definition almost exactly.

**Function signature**

```go
func Factorial(n int) int
```

**Examples**

- `Factorial(0)` returns `1`
- `Factorial(1)` returns `1`

**Constraints**

- 0 <= n <= 12 (kept small to avoid overflow on 64-bit ints)

**Learning objective:** Translate a mathematical recurrence relation directly into recursive code.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'factorial'), '[0]'::jsonb, '1', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'factorial'), '[1]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'factorial'), '[5]'::jsonb, '120', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'factorial'), '[10]'::jsonb, '3628800', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'factorial'), '[12]'::jsonb, '479001600', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- math-recursion :: Integer Power (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'power-recursive',
    'math-recursion',
    'function',
    'go',
    'Integer Power',
    'Write a recursive function `Power(base, exp int) int` that computes `base` raised to the power `exp`, where `exp` is a non-negative integer. Do not use `math.Pow` — the point of this exercise is practicing recursion over repeated multiplication.',
    '- -20 <= base <= 20
- 0 <= exp <= 15',
    'Model repeated multiplication as a recursive process with a numeric countdown.',
    'Power',
    'int',
    '{"int","int"}',
    '{"base^exp means multiplying base by itself exp times — think of exp as a countdown.","base^0 is always 1, regardless of base. That''s your base case.","Each recursive call should reduce exp by exactly 1."}',
    1,
    70,
    '{"math","recursion","beginner"}',
    true,
    'seed-math-recursion-power-recursive',
    '## Integer Power

Write a recursive function `Power(base, exp int) int` that computes `base` raised to the power `exp`, where `exp` is a non-negative integer. Do not use `math.Pow` — the point of this exercise is practicing recursion over repeated multiplication.

**Function signature**

```go
func Power(base int, exp int) int
```

**Examples**

- `Power(2, 10)` returns `1024`
- `Power(3, 0)` returns `1`

**Constraints**

- -20 <= base <= 20
- 0 <= exp <= 15

**Learning objective:** Model repeated multiplication as a recursive process with a numeric countdown.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'power-recursive'), '[2,10]'::jsonb, '1024', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'power-recursive'), '[3,0]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'power-recursive'), '[5,3]'::jsonb, '125', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'power-recursive'), '[-2,3]'::jsonb, '-8', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'power-recursive'), '[1,15]'::jsonb, '1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- math-recursion :: Count Digits (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'count-digits',
    'math-recursion',
    'function',
    'go',
    'Count Digits',
    'Write a recursive function that returns how many decimal digits an integer `n` has. Negative numbers should be counted using the digit count of their absolute value — the sign itself is not a digit.',
    '- -10^9 <= n <= 10^9',
    'Handle sign normalization before applying a recursive digit-stripping strategy.',
    'CountDigits',
    'int',
    '{"int"}',
    '{"Every integer division by 10 removes exactly one digit from the right.","A single-digit number (positive or negative, once you drop the sign) always has a digit count of 1.","Take the absolute value first so a negative sign doesn''t get counted as a digit."}',
    2,
    110,
    '{"math","recursion"}',
    true,
    'seed-math-recursion-count-digits',
    '## Count Digits

Write a recursive function that returns how many decimal digits an integer `n` has. Negative numbers should be counted using the digit count of their absolute value — the sign itself is not a digit.

**Function signature**

```go
func CountDigits(n int) int
```

**Examples**

- `CountDigits(0)` returns `1`
- `CountDigits(9)` returns `1`

**Constraints**

- -10^9 <= n <= 10^9

**Learning objective:** Handle sign normalization before applying a recursive digit-stripping strategy.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-digits'), '[0]'::jsonb, '1', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-digits'), '[9]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-digits'), '[-482]'::jsonb, '3', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-digits'), '[1000000]'::jsonb, '7', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-digits'), '[-7]'::jsonb, '1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- math-recursion :: Reverse Integer (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'reverse-integer',
    'math-recursion',
    'function',
    'go',
    'Reverse Integer',
    'Write a function that reverses the decimal digits of an integer `n`, preserving its sign. For example, reversing 120 gives 21 (the trailing zero disappears), and reversing -453 gives -354.',
    '- -2^31 <= n <= 2^31-1
- You may assume the reversed value fits in a standard 64-bit int.',
    'Extract and rebuild digit sequences using modulo and integer division.',
    'ReverseInteger',
    'int',
    '{"int"}',
    '{"Repeatedly peel off the last digit with n % 10 and build the reversed number by multiplying an accumulator by 10.","Track the sign separately, then work with the absolute value.","Stop the loop once the remaining value reaches 0."}',
    2,
    110,
    '{"math","iteration"}',
    true,
    'seed-math-recursion-reverse-integer',
    '## Reverse Integer

Write a function that reverses the decimal digits of an integer `n`, preserving its sign. For example, reversing 120 gives 21 (the trailing zero disappears), and reversing -453 gives -354.

**Function signature**

```go
func ReverseInteger(n int) int
```

**Examples**

- `ReverseInteger(120)` returns `21`
- `ReverseInteger(-453)` returns `-354`

**Constraints**

- -2^31 <= n <= 2^31-1
- You may assume the reversed value fits in a standard 64-bit int.

**Learning objective:** Extract and rebuild digit sequences using modulo and integer division.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-integer'), '[120]'::jsonb, '21', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-integer'), '[-453]'::jsonb, '-354', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-integer'), '[7]'::jsonb, '7', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-integer'), '[100]'::jsonb, '1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-integer'), '[-8000]'::jsonb, '-8', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- math-recursion :: Sum of Natural Numbers (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'sum-natural-recursive',
    'math-recursion',
    'function',
    'go',
    'Sum of Natural Numbers',
    'Write a recursive function that returns the sum 1 + 2 + ... + n for a non-negative integer `n`. If `n` is 0, the sum is 0.',
    '- 0 <= n <= 10000',
    'Build additive accumulation through recursive calls instead of a closed-form formula.',
    'SumNatural',
    'int',
    '{"int"}',
    '{"The sum of the first n natural numbers is n plus the sum of the first (n-1).","When n reaches 0, there is nothing left to add — that''s your base case.","This mirrors the classic formula n*(n+1)/2, but you must compute it recursively, not with the formula."}',
    2,
    110,
    '{"math","recursion"}',
    true,
    'seed-math-recursion-sum-natural-recursive',
    '## Sum of Natural Numbers

Write a recursive function that returns the sum 1 + 2 + ... + n for a non-negative integer `n`. If `n` is 0, the sum is 0.

**Function signature**

```go
func SumNatural(n int) int
```

**Examples**

- `SumNatural(0)` returns `0`
- `SumNatural(1)` returns `1`

**Constraints**

- 0 <= n <= 10000

**Learning objective:** Build additive accumulation through recursive calls instead of a closed-form formula.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-natural-recursive'), '[0]'::jsonb, '0', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-natural-recursive'), '[1]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-natural-recursive'), '[10]'::jsonb, '55', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-natural-recursive'), '[100]'::jsonb, '5050', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-natural-recursive'), '[500]'::jsonb, '125250', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- math-recursion :: Nth Fibonacci Number (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'fibonacci-nth',
    'math-recursion',
    'function',
    'go',
    'Nth Fibonacci Number',
    'Write a function that returns the `n`-th Fibonacci number (0-indexed, with F(0) = 0 and F(1) = 1). Because `n` can be moderately large, an efficient iterative or memoized approach is expected — a naive exponential double recursion may time out.',
    '- 0 <= n <= 40',
    'Recognize when naive recursion becomes inefficient and convert it into an iterative or memoized solution.',
    'Fibonacci',
    'int',
    '{"int"}',
    '{"The sequence starts 0, 1, 1, 2, 3, 5, 8... where each term is the sum of the two before it.","A naive double-recursive solution is exponential — consider iterating or memoizing for larger n.","F(0) = 0 and F(1) = 1 are the two base cases you need."}',
    3,
    150,
    '{"math","recursion","dynamic-programming"}',
    true,
    'seed-math-recursion-fibonacci-nth',
    '## Nth Fibonacci Number

Write a function that returns the `n`-th Fibonacci number (0-indexed, with F(0) = 0 and F(1) = 1). Because `n` can be moderately large, an efficient iterative or memoized approach is expected — a naive exponential double recursion may time out.

**Function signature**

```go
func Fibonacci(n int) int
```

**Examples**

- `Fibonacci(0)` returns `0`
- `Fibonacci(1)` returns `1`

**Constraints**

- 0 <= n <= 40

**Learning objective:** Recognize when naive recursion becomes inefficient and convert it into an iterative or memoized solution.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'fibonacci-nth'), '[0]'::jsonb, '0', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'fibonacci-nth'), '[1]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'fibonacci-nth'), '[10]'::jsonb, '55', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'fibonacci-nth'), '[20]'::jsonb, '6765', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'fibonacci-nth'), '[30]'::jsonb, '832040', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- math-recursion :: Greatest Common Divisor (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'gcd-euclidean',
    'math-recursion',
    'function',
    'go',
    'Greatest Common Divisor',
    'Write a recursive function that computes the greatest common divisor of two integers `a` and `b` using the Euclidean algorithm. The result should always be non-negative.',
    '- -10^6 <= a, b <= 10^6
- a and b are not both zero',
    'Implement one of the oldest known algorithms and appreciate how a simple recurrence solves a non-trivial problem.',
    'GCD',
    'int',
    '{"int","int"}',
    '{"The Euclidean algorithm: gcd(a, b) = gcd(b, a mod b).","The base case is when b reaches 0 — at that point a is the answer.","Take absolute values up front so negative inputs behave the same as positive ones."}',
    3,
    150,
    '{"math","recursion","euclidean-algorithm"}',
    true,
    'seed-math-recursion-gcd-euclidean',
    '## Greatest Common Divisor

Write a recursive function that computes the greatest common divisor of two integers `a` and `b` using the Euclidean algorithm. The result should always be non-negative.

**Function signature**

```go
func GCD(a int, b int) int
```

**Examples**

- `GCD(48, 18)` returns `6`
- `GCD(17, 5)` returns `1`

**Constraints**

- -10^6 <= a, b <= 10^6
- a and b are not both zero

**Learning objective:** Implement one of the oldest known algorithms and appreciate how a simple recurrence solves a non-trivial problem.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'gcd-euclidean'), '[48,18]'::jsonb, '6', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'gcd-euclidean'), '[17,5]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'gcd-euclidean'), '[0,9]'::jsonb, '9', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'gcd-euclidean'), '[-36,24]'::jsonb, '12', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'gcd-euclidean'), '[1071,462]'::jsonb, '21', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- math-recursion :: Palindrome Number (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'is-palindrome-number',
    'math-recursion',
    'function',
    'go',
    'Palindrome Number',
    'Write a function that determines whether an integer `n` reads the same forwards and backwards. Negative numbers should always return false.',
    '- -2^31 <= n <= 2^31-1',
    'Combine numeric edge-case reasoning (sign, trailing zeros) with simple string comparison.',
    'IsPalindromeNumber',
    'bool',
    '{"int"}',
    '{"Negative numbers can never be palindromes because of the leading minus sign.","Converting the number to a string lets you compare it against its own reverse easily.","Watch out for numbers ending in 0 (other than 0 itself) — they can''t be palindromes either, which falls out naturally from the string comparison."}',
    3,
    150,
    '{"math","strings"}',
    true,
    'seed-math-recursion-is-palindrome-number',
    '## Palindrome Number

Write a function that determines whether an integer `n` reads the same forwards and backwards. Negative numbers should always return false.

**Function signature**

```go
func IsPalindromeNumber(n int) bool
```

**Examples**

- `IsPalindromeNumber(121)` returns `true`
- `IsPalindromeNumber(-121)` returns `false`

**Constraints**

- -2^31 <= n <= 2^31-1

**Learning objective:** Combine numeric edge-case reasoning (sign, trailing zeros) with simple string comparison.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-palindrome-number'), '[121]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-palindrome-number'), '[-121]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-palindrome-number'), '[10]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-palindrome-number'), '[12321]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-palindrome-number'), '[0]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- math-recursion :: Is Prime (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'is-prime',
    'math-recursion',
    'function',
    'go',
    'Is Prime',
    'Write a function that determines whether an integer `n` is a prime number. A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself. For efficiency, trial division should only go up to the square root of `n`, not all the way to `n`.',
    '- 0 <= n <= 10^7',
    'Apply the square-root optimization to trial division — a foundational technique in number theory algorithms.',
    'IsPrime',
    'bool',
    '{"int"}',
    '{"Numbers less than 2 are never prime.","You only need to test divisors up to the square root of n — anything beyond that has a matching smaller factor.","Handle 2 correctly: it''s the only even prime, so don''t accidentally exclude it."}',
    4,
    190,
    '{"math","algorithms"}',
    true,
    'seed-math-recursion-is-prime',
    '## Is Prime

Write a function that determines whether an integer `n` is a prime number. A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself. For efficiency, trial division should only go up to the square root of `n`, not all the way to `n`.

**Function signature**

```go
func IsPrime(n int) bool
```

**Examples**

- `IsPrime(2)` returns `true`
- `IsPrime(17)` returns `true`

**Constraints**

- 0 <= n <= 10^7

**Learning objective:** Apply the square-root optimization to trial division — a foundational technique in number theory algorithms.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-prime'), '[2]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-prime'), '[17]'::jsonb, 'true', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-prime'), '[1]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-prime'), '[97]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-prime'), '[1000003]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- math-recursion :: Least Common Multiple (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'lcm-two-numbers',
    'math-recursion',
    'function',
    'go',
    'Least Common Multiple',
    'Write a function that computes the least common multiple of two positive integers `a` and `b`, building on the GCD/Euclidean algorithm.',
    '- 1 <= a, b <= 10^5',
    'Compose a new algorithm (LCM) out of a previously solved building block (GCD).',
    'LCM',
    'int',
    '{"int","int"}',
    '{"Recall the identity lcm(a, b) = |a * b| / gcd(a, b).","Reuse (or reimplement) the Euclidean algorithm to compute gcd first.","Divide before multiplying isn''t required here, but always divide by gcd last to avoid returning a non-integer result conceptually."}',
    4,
    190,
    '{"math","recursion","euclidean-algorithm"}',
    true,
    'seed-math-recursion-lcm-two-numbers',
    '## Least Common Multiple

Write a function that computes the least common multiple of two positive integers `a` and `b`, building on the GCD/Euclidean algorithm.

**Function signature**

```go
func LCM(a int, b int) int
```

**Examples**

- `LCM(4, 6)` returns `12`
- `LCM(21, 6)` returns `42`

**Constraints**

- 1 <= a, b <= 10^5

**Learning objective:** Compose a new algorithm (LCM) out of a previously solved building block (GCD).'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'lcm-two-numbers'), '[4,6]'::jsonb, '12', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'lcm-two-numbers'), '[21,6]'::jsonb, '42', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'lcm-two-numbers'), '[1,1]'::jsonb, '1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'lcm-two-numbers'), '[15,25]'::jsonb, '75', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'lcm-two-numbers'), '[7,13]'::jsonb, '91', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- math-recursion :: Recursive Array Sum (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'sum-array-recursive',
    'math-recursion',
    'function',
    'go',
    'Recursive Array Sum',
    'Write a recursive function that returns the sum of all integers in a slice `nums`, without using a loop. This exercise bridges recursion and array processing, a pattern that generalizes to trees and linked lists.',
    '- 0 <= len(nums) <= 1000
- -10^6 <= nums[i] <= 10^6',
    'Apply recursive divide-and-conquer style thinking to a slice instead of a plain integer.',
    'SumArrayRecursive',
    'int',
    '{"[]int"}',
    '{"Think of the sum of a slice as its first element plus the sum of everything after it.","An empty slice sums to 0 — that''s the base case that stops the recursion.","Slicing off the first element on each call (nums[1:]) shrinks the problem toward the base case."}',
    4,
    190,
    '{"recursion","arrays"}',
    true,
    'seed-math-recursion-sum-array-recursive',
    '## Recursive Array Sum

Write a recursive function that returns the sum of all integers in a slice `nums`, without using a loop. This exercise bridges recursion and array processing, a pattern that generalizes to trees and linked lists.

**Function signature**

```go
func SumArrayRecursive(nums []int) int
```

**Examples**

- `SumArrayRecursive([])` returns `0`
- `SumArrayRecursive([5])` returns `5`

**Constraints**

- 0 <= len(nums) <= 1000
- -10^6 <= nums[i] <= 10^6

**Learning objective:** Apply recursive divide-and-conquer style thinking to a slice instead of a plain integer.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-array-recursive'), '[[]]'::jsonb, '0', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-array-recursive'), '[[5]]'::jsonb, '5', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-array-recursive'), '[[1,2,3,4,5]]'::jsonb, '15', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-array-recursive'), '[[-3,3,-3,3]]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-array-recursive'), '[[10,20,30,40,50]]'::jsonb, '150', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- math-recursion :: Binomial Coefficient (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'binomial-coefficient',
    'math-recursion',
    'function',
    'go',
    'Binomial Coefficient',
    'Write a function `BinomialCoefficient(n, k int) int` that returns C(n, k), the number of ways to choose `k` items from `n` items without regard to order. Implement it recursively using Pascal''s identity rather than a direct factorial formula, to reinforce combinatorial recursion.',
    '- 0 <= n <= 30
- k can be any integer; return 0 if k < 0 or k > n',
    'Encode a well-known combinatorial identity (Pascal''s triangle) as a recursive function.',
    'BinomialCoefficient',
    'int',
    '{"int","int"}',
    '{"Pascal''s identity: C(n, k) = C(n-1, k-1) + C(n-1, k).","Base cases: C(n, 0) = 1 and C(n, n) = 1 for any n.","Return 0 immediately when k is negative or greater than n."}',
    5,
    220,
    '{"math","recursion","combinatorics"}',
    true,
    'seed-math-recursion-binomial-coefficient',
    '## Binomial Coefficient

Write a function `BinomialCoefficient(n, k int) int` that returns C(n, k), the number of ways to choose `k` items from `n` items without regard to order. Implement it recursively using Pascal''s identity rather than a direct factorial formula, to reinforce combinatorial recursion.

**Function signature**

```go
func BinomialCoefficient(n int, k int) int
```

**Examples**

- `BinomialCoefficient(5, 2)` returns `10`
- `BinomialCoefficient(6, 0)` returns `1`

**Constraints**

- 0 <= n <= 30
- k can be any integer; return 0 if k < 0 or k > n

**Learning objective:** Encode a well-known combinatorial identity (Pascal''s triangle) as a recursive function.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'binomial-coefficient'), '[5,2]'::jsonb, '10', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'binomial-coefficient'), '[6,0]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'binomial-coefficient'), '[6,6]'::jsonb, '1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'binomial-coefficient'), '[10,3]'::jsonb, '120', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'binomial-coefficient'), '[7,8]'::jsonb, '0', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- math-recursion :: Collatz Sequence Length (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'collatz-steps',
    'math-recursion',
    'function',
    'go',
    'Collatz Sequence Length',
    'Write a function that returns the number of steps it takes for the Collatz sequence starting at a positive integer `n` to reach 1. At each step: if the current value is even, divide it by 2; if it''s odd, multiply it by 3 and add 1.',
    '- 1 <= n <= 10^6',
    'Simulate an iterative mathematical process and reason about loop termination on an open conjecture.',
    'CollatzSteps',
    'int',
    '{"int"}',
    '{"Apply the rule: if n is even, n = n/2; if n is odd, n = 3n+1. Repeat until n reaches 1.","Count every application of the rule as one step.","The sequence is conjectured (but not proven) to always reach 1 — trust it for the input range given."}',
    5,
    220,
    '{"math","iteration"}',
    true,
    'seed-math-recursion-collatz-steps',
    '## Collatz Sequence Length

Write a function that returns the number of steps it takes for the Collatz sequence starting at a positive integer `n` to reach 1. At each step: if the current value is even, divide it by 2; if it''s odd, multiply it by 3 and add 1.

**Function signature**

```go
func CollatzSteps(n int) int
```

**Examples**

- `CollatzSteps(1)` returns `0`
- `CollatzSteps(6)` returns `8`

**Constraints**

- 1 <= n <= 10^6

**Learning objective:** Simulate an iterative mathematical process and reason about loop termination on an open conjecture.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'collatz-steps'), '[1]'::jsonb, '0', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'collatz-steps'), '[6]'::jsonb, '8', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'collatz-steps'), '[27]'::jsonb, '111', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'collatz-steps'), '[97]'::jsonb, '118', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'collatz-steps'), '[1000000]'::jsonb, '152', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- math-recursion :: Tower of Hanoi Move Count (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'tower-of-hanoi-moves',
    'math-recursion',
    'function',
    'go',
    'Tower of Hanoi Move Count',
    'The Tower of Hanoi is a classic puzzle: move `n` disks from one peg to another, using a third peg as auxiliary, moving one disk at a time and never placing a larger disk on a smaller one. Write a recursive function that returns the minimum number of moves required to solve the puzzle for `n` disks.',
    '- 0 <= n <= 30',
    'Derive and implement a recurrence relation for a classic recursive puzzle.',
    'HanoiMoves',
    'int',
    '{"int"}',
    '{"Solving Hanoi for n disks requires solving it for n-1 disks twice, plus one move for the largest disk.","That recurrence gives moves(n) = 2 * moves(n-1) + 1, with moves(0) = 0.","You do not need to print the actual moves, only count how many there are."}',
    5,
    220,
    '{"math","recursion","classic-problem"}',
    true,
    'seed-math-recursion-tower-of-hanoi-moves',
    '## Tower of Hanoi Move Count

The Tower of Hanoi is a classic puzzle: move `n` disks from one peg to another, using a third peg as auxiliary, moving one disk at a time and never placing a larger disk on a smaller one. Write a recursive function that returns the minimum number of moves required to solve the puzzle for `n` disks.

**Function signature**

```go
func HanoiMoves(n int) int
```

**Examples**

- `HanoiMoves(0)` returns `0`
- `HanoiMoves(1)` returns `1`

**Constraints**

- 0 <= n <= 30

**Learning objective:** Derive and implement a recurrence relation for a classic recursive puzzle.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'tower-of-hanoi-moves'), '[0]'::jsonb, '0', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'tower-of-hanoi-moves'), '[1]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'tower-of-hanoi-moves'), '[4]'::jsonb, '15', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'tower-of-hanoi-moves'), '[10]'::jsonb, '1023', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'tower-of-hanoi-moves'), '[20]'::jsonb, '1048575', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- arrays-strings :: Find Maximum in Array (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'find-max-in-array',
    'arrays-strings',
    'function',
    'go',
    'Find Maximum in Array',
    'Write a function that returns the largest value in a non-empty slice of integers `nums`.',
    '- 1 <= len(nums) <= 1000
- -10^6 <= nums[i] <= 10^6',
    'Practice the single-pass running-maximum pattern that underlies many array algorithms.',
    'FindMax',
    'int',
    '{"[]int"}',
    '{"Start by assuming the first element is the largest, then scan the rest.","Compare each element to your running maximum and update it when you find something bigger.","The slice is guaranteed non-empty, so you never need to handle a zero-length case."}',
    1,
    70,
    '{"arrays","iteration","beginner"}',
    true,
    'seed-arrays-strings-find-max-in-array',
    '## Find Maximum in Array

Write a function that returns the largest value in a non-empty slice of integers `nums`.

**Function signature**

```go
func FindMax(nums []int) int
```

**Examples**

- `FindMax([3, 1, 4, 1, 5])` returns `5`
- `FindMax([-5, -1, -10])` returns `-1`

**Constraints**

- 1 <= len(nums) <= 1000
- -10^6 <= nums[i] <= 10^6

**Learning objective:** Practice the single-pass running-maximum pattern that underlies many array algorithms.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-max-in-array'), '[[3,1,4,1,5]]'::jsonb, '5', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-max-in-array'), '[[-5,-1,-10]]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-max-in-array'), '[[7]]'::jsonb, '7', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-max-in-array'), '[[2,2,2,2]]'::jsonb, '2', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-max-in-array'), '[[100,-100,50,99]]'::jsonb, '100', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- arrays-strings :: Reverse a String (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'reverse-string',
    'arrays-strings',
    'function',
    'go',
    'Reverse a String',
    'Write a function that returns the reverse of a string `s`.',
    '- 0 <= len(s) <= 10000
- s contains only printable ASCII characters',
    'Manipulate strings as sequences of characters and practice two-pointer reversal.',
    'ReverseString',
    'string',
    '{"string"}',
    '{"A string can be treated as a slice of runes or bytes for reversal.","Swapping characters from both ends toward the middle is the classic in-place technique.","An empty string and a single-character string should both reverse to themselves."}',
    1,
    70,
    '{"strings","beginner"}',
    true,
    'seed-arrays-strings-reverse-string',
    '## Reverse a String

Write a function that returns the reverse of a string `s`.

**Function signature**

```go
func ReverseString(s string) string
```

**Examples**

- `ReverseString("hello")` returns `"olleh"`
- `ReverseString("")` returns `""`

**Constraints**

- 0 <= len(s) <= 10000
- s contains only printable ASCII characters

**Learning objective:** Manipulate strings as sequences of characters and practice two-pointer reversal.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-string'), '["hello"]'::jsonb, 'olleh', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-string'), '[""]'::jsonb, '', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-string'), '["a"]'::jsonb, 'a', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-string'), '["racecar"]'::jsonb, 'racecar', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-string'), '["Koder!"]'::jsonb, '!redoK', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- arrays-strings :: Count Vowels (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'count-vowels',
    'arrays-strings',
    'function',
    'go',
    'Count Vowels',
    'Write a function that counts how many vowels (a, e, i, o, u, case-insensitive) appear in a string `s`.',
    '- 0 <= len(s) <= 10000',
    'Combine simple character classification with a linear scan.',
    'CountVowels',
    'int',
    '{"string"}',
    '{"The vowels are a, e, i, o, u — remember to handle both uppercase and lowercase.","Normalize the string to lowercase first so you only need to check five characters.","Iterate once through the string, incrementing a counter for each vowel found."}',
    1,
    70,
    '{"strings","beginner"}',
    true,
    'seed-arrays-strings-count-vowels',
    '## Count Vowels

Write a function that counts how many vowels (a, e, i, o, u, case-insensitive) appear in a string `s`.

**Function signature**

```go
func CountVowels(s string) int
```

**Examples**

- `CountVowels("hello")` returns `2`
- `CountVowels("xyz")` returns `0`

**Constraints**

- 0 <= len(s) <= 10000

**Learning objective:** Combine simple character classification with a linear scan.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-vowels'), '["hello"]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-vowels'), '["xyz"]'::jsonb, '0', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-vowels'), '["AEIOU"]'::jsonb, '5', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-vowels'), '["The Quick Brown Fox"]'::jsonb, '5', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-vowels'), '[""]'::jsonb, '0', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- arrays-strings :: Palindrome String (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'is-palindrome-string',
    'arrays-strings',
    'function',
    'go',
    'Palindrome String',
    'Write a function that determines whether a string `s` is a palindrome, considering only alphanumeric characters and ignoring case. For example, "A man a plan a canal Panama" is a palindrome once spaces and case are ignored.',
    '- 0 <= len(s) <= 10000',
    'Preprocess input to normalize it before applying a core comparison algorithm.',
    'IsPalindromeString',
    'bool',
    '{"string"}',
    '{"Ignore anything that isn''t a letter or digit, and compare case-insensitively.","Build a cleaned version of the string first, then check it against its own reverse.","An empty string (after cleaning) counts as a palindrome."}',
    2,
    110,
    '{"strings","two-pointers"}',
    true,
    'seed-arrays-strings-is-palindrome-string',
    '## Palindrome String

Write a function that determines whether a string `s` is a palindrome, considering only alphanumeric characters and ignoring case. For example, "A man a plan a canal Panama" is a palindrome once spaces and case are ignored.

**Function signature**

```go
func IsPalindromeString(s string) bool
```

**Examples**

- `IsPalindromeString("racecar")` returns `true`
- `IsPalindromeString("hello")` returns `false`

**Constraints**

- 0 <= len(s) <= 10000

**Learning objective:** Preprocess input to normalize it before applying a core comparison algorithm.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-palindrome-string'), '["racecar"]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-palindrome-string'), '["hello"]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-palindrome-string'), '["A man a plan a canal Panama"]'::jsonb, 'true', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-palindrome-string'), '["12321"]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-palindrome-string'), '["Was it a car or a cat I saw"]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- arrays-strings :: Sum of Array (Iterative) (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'sum-of-array',
    'arrays-strings',
    'function',
    'go',
    'Sum of Array (Iterative)',
    'Write a function that returns the sum of all integers in a slice `nums`, using iteration (not recursion).',
    '- 0 <= len(nums) <= 10000
- -10^6 <= nums[i] <= 10^6',
    'Build comfort with the accumulator pattern, the iterative counterpart to the recursive sum exercise.',
    'SumArray',
    'int',
    '{"[]int"}',
    '{"A single loop with a running total accumulator is all you need.","Initialize your accumulator to 0 before the loop begins.","An empty slice should sum to 0."}',
    2,
    110,
    '{"arrays","iteration"}',
    true,
    'seed-arrays-strings-sum-of-array',
    '## Sum of Array (Iterative)

Write a function that returns the sum of all integers in a slice `nums`, using iteration (not recursion).

**Function signature**

```go
func SumArray(nums []int) int
```

**Examples**

- `SumArray([1, 2, 3])` returns `6`
- `SumArray([])` returns `0`

**Constraints**

- 0 <= len(nums) <= 10000
- -10^6 <= nums[i] <= 10^6

**Learning objective:** Build comfort with the accumulator pattern, the iterative counterpart to the recursive sum exercise.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-of-array'), '[[1,2,3]]'::jsonb, '6', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-of-array'), '[[]]'::jsonb, '0', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-of-array'), '[[-5,5]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-of-array'), '[[10,20,30,40]]'::jsonb, '100', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sum-of-array'), '[[1000,-1000,500]]'::jsonb, '500', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- arrays-strings :: Title Case a Sentence (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'title-case',
    'arrays-strings',
    'function',
    'go',
    'Title Case a Sentence',
    'Write a function that converts a sentence `s` to title case: the first letter of every space-separated word is capitalized, and the remaining letters of each word are lowercased.',
    '- 0 <= len(s) <= 10000
- Words are separated by single spaces',
    'Practice splitting, transforming, and rejoining strings — a very common real-world text-processing pattern.',
    'TitleCase',
    'string',
    '{"string"}',
    '{"Split the input on single spaces to get individual words.","For each word, uppercase the first character and lowercase the rest.","Re-join the transformed words with single spaces, preserving empty words if they occur from consecutive spaces."}',
    2,
    110,
    '{"strings"}',
    true,
    'seed-arrays-strings-title-case',
    '## Title Case a Sentence

Write a function that converts a sentence `s` to title case: the first letter of every space-separated word is capitalized, and the remaining letters of each word are lowercased.

**Function signature**

```go
func TitleCase(s string) string
```

**Examples**

- `TitleCase("hello world")` returns `"Hello World"`
- `TitleCase("THE QUICK FOX")` returns `"The Quick Fox"`

**Constraints**

- 0 <= len(s) <= 10000
- Words are separated by single spaces

**Learning objective:** Practice splitting, transforming, and rejoining strings — a very common real-world text-processing pattern.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'title-case'), '["hello world"]'::jsonb, 'Hello World', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'title-case'), '["THE QUICK FOX"]'::jsonb, 'The Quick Fox', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'title-case'), '["a"]'::jsonb, 'A', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'title-case'), '["go IS fun"]'::jsonb, 'Go Is Fun', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'title-case'), '[""]'::jsonb, '', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- arrays-strings :: Valid Anagram (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'is-anagram',
    'arrays-strings',
    'function',
    'go',
    'Valid Anagram',
    'Write a function that determines whether two strings `a` and `b` are anagrams of each other — i.e. one can be rearranged to form the other, ignoring case.',
    '- 0 <= len(a), len(b) <= 10000',
    'Recognize when sorting or frequency-counting is the right tool for comparing unordered content.',
    'IsAnagram',
    'bool',
    '{"string","string"}',
    '{"Two strings are anagrams if they contain exactly the same characters with the same frequencies.","Sorting both strings and comparing the results is a simple, reliable approach.","Compare case-insensitively so ''Listen'' and ''Silent'' are recognized as anagrams."}',
    3,
    150,
    '{"strings","hashing"}',
    true,
    'seed-arrays-strings-is-anagram',
    '## Valid Anagram

Write a function that determines whether two strings `a` and `b` are anagrams of each other — i.e. one can be rearranged to form the other, ignoring case.

**Function signature**

```go
func IsAnagram(a string, b string) bool
```

**Examples**

- `IsAnagram("listen", "silent")` returns `true`
- `IsAnagram("hello", "world")` returns `false`

**Constraints**

- 0 <= len(a), len(b) <= 10000

**Learning objective:** Recognize when sorting or frequency-counting is the right tool for comparing unordered content.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-anagram'), '["listen","silent"]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-anagram'), '["hello","world"]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-anagram'), '["Dormitory","dirtyroom"]'::jsonb, 'true', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-anagram'), '["",""]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-anagram'), '["aabbcc","abcabc"]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- arrays-strings :: Remove Duplicates from Sorted Array (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'remove-duplicates-sorted',
    'arrays-strings',
    'function',
    'go',
    'Remove Duplicates from Sorted Array',
    'Write a function that removes duplicate values from a sorted slice `nums` and returns the deduplicated slice, preserving order.',
    '- 0 <= len(nums) <= 10000
- nums is sorted in non-decreasing order',
    'Exploit the sorted-order invariant to solve deduplication in a single linear pass.',
    'RemoveDuplicates',
    'int',
    '{"[]int"}',
    '{"Because the array is sorted, duplicate values are always adjacent to each other.","Compare each element only to the last one you kept, not the whole result so far.","Build a new result slice rather than trying to mutate in place, to keep the logic simple."}',
    3,
    150,
    '{"arrays","two-pointers"}',
    true,
    'seed-arrays-strings-remove-duplicates-sorted',
    '## Remove Duplicates from Sorted Array

Write a function that removes duplicate values from a sorted slice `nums` and returns the deduplicated slice, preserving order.

**Function signature**

```go
func RemoveDuplicates(nums []int) int
```

**Examples**

- `RemoveDuplicates([1, 1, 2])` returns `[1, 2]`
- `RemoveDuplicates([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 10000
- nums is sorted in non-decreasing order

**Learning objective:** Exploit the sorted-order invariant to solve deduplication in a single linear pass.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-duplicates-sorted'), '[[1,1,2]]'::jsonb, '[1, 2]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-duplicates-sorted'), '[[]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-duplicates-sorted'), '[[1,1,1,1]]'::jsonb, '[1]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-duplicates-sorted'), '[[1,2,2,3,3,3,4]]'::jsonb, '[1, 2, 3, 4]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-duplicates-sorted'), '[[5]]'::jsonb, '[5]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- arrays-strings :: Two Sum (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'two-sum-indices',
    'arrays-strings',
    'function',
    'go',
    'Two Sum',
    'Write a function `TwoSum(nums []int, target int) []int` that returns the indices of the two numbers in `nums` that add up to `target`. You may assume exactly one valid pair exists. If none is found, return `[-1, -1]`.',
    '- 2 <= len(nums) <= 10000
- -10^6 <= nums[i], target <= 10^6',
    'Use a hash map to reduce a quadratic search to a single linear pass — a foundational optimization pattern.',
    'TwoSum',
    '[]int',
    '{"[]int","int"}',
    '{"A brute-force nested loop works but is O(n^2) — try to do better with a hash map.","For each element, check whether (target - element) has already been seen, and record indices as you go.","Return the indices in the order you found them: the earlier index first, then the later one."}',
    3,
    150,
    '{"arrays","hashing"}',
    true,
    'seed-arrays-strings-two-sum-indices',
    '## Two Sum

Write a function `TwoSum(nums []int, target int) []int` that returns the indices of the two numbers in `nums` that add up to `target`. You may assume exactly one valid pair exists. If none is found, return `[-1, -1]`.

**Function signature**

```go
func TwoSum(nums []int, target int) []int
```

**Examples**

- `TwoSum([2, 7, 11, 15], 9)` returns `[0, 1]`
- `TwoSum([3, 2, 4], 6)` returns `[1, 2]`

**Constraints**

- 2 <= len(nums) <= 10000
- -10^6 <= nums[i], target <= 10^6

**Learning objective:** Use a hash map to reduce a quadratic search to a single linear pass — a foundational optimization pattern.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'two-sum-indices'), '[[2,7,11,15],9]'::jsonb, '[0,1]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'two-sum-indices'), '[[3,2,4],6]'::jsonb, '[1,2]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'two-sum-indices'), '[[3,3],6]'::jsonb, '[0,1]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'two-sum-indices'), '[[1,5,3,8],11]'::jsonb, '[2,3]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'two-sum-indices'), '[[-3,4,3,90],0]'::jsonb, '[0,2]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- arrays-strings :: Rotate Array (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'rotate-array',
    'arrays-strings',
    'function',
    'go',
    'Rotate Array',
    'Write a function `RotateArray(nums []int, k int) []int` that rotates `nums` to the right by `k` positions and returns the rotated slice. `k` may be larger than `len(nums)`.',
    '- 0 <= len(nums) <= 10000
- 0 <= k <= 10^9',
    'Reason about modular arithmetic when an offset can exceed the size of the underlying collection.',
    'RotateArray',
    '[]int',
    '{"[]int","int"}',
    '{"Rotating right by k is the same as rotating right by (k mod len(nums)) — handle k larger than the slice length.","The last k elements end up at the front, and everything else shifts right to fill the rest.","An empty slice, or k that''s a multiple of the length, should leave the array unchanged."}',
    4,
    190,
    '{"arrays"}',
    true,
    'seed-arrays-strings-rotate-array',
    '## Rotate Array

Write a function `RotateArray(nums []int, k int) []int` that rotates `nums` to the right by `k` positions and returns the rotated slice. `k` may be larger than `len(nums)`.

**Function signature**

```go
func RotateArray(nums []int, k int) []int
```

**Examples**

- `RotateArray([1, 2, 3, 4, 5], 2)` returns `[4, 5, 1, 2, 3]`
- `RotateArray([1, 2, 3], 4)` returns `[3, 1, 2]`

**Constraints**

- 0 <= len(nums) <= 10000
- 0 <= k <= 10^9

**Learning objective:** Reason about modular arithmetic when an offset can exceed the size of the underlying collection.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'rotate-array'), '[[1,2,3,4,5],2]'::jsonb, '[4,5,1,2,3]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'rotate-array'), '[[1,2,3],4]'::jsonb, '[3,1,2]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'rotate-array'), '[[],3]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'rotate-array'), '[[1,2,3,4],0]'::jsonb, '[1,2,3,4]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'rotate-array'), '[[7,8,9],3]'::jsonb, '[7,8,9]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- arrays-strings :: Merge Two Sorted Arrays (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'merge-sorted-arrays',
    'arrays-strings',
    'function',
    'go',
    'Merge Two Sorted Arrays',
    'Write a function `MergeSorted(a, b []int) []int` that merges two sorted slices `a` and `b` into a single sorted slice.',
    '- 0 <= len(a), len(b) <= 10000
- a and b are each sorted in non-decreasing order',
    'Implement the classic merge step used in merge sort as a standalone building block.',
    'MergeSorted',
    '[]int',
    '{"[]int","[]int"}',
    '{"Since both inputs are already sorted, a two-pointer merge (like the merge step of merge sort) runs in linear time.","At each step, compare the current elements of both slices and take the smaller one.","Once one slice is exhausted, append the rest of the other slice directly."}',
    4,
    190,
    '{"arrays","two-pointers"}',
    true,
    'seed-arrays-strings-merge-sorted-arrays',
    '## Merge Two Sorted Arrays

Write a function `MergeSorted(a, b []int) []int` that merges two sorted slices `a` and `b` into a single sorted slice.

**Function signature**

```go
func MergeSorted(a []int, b []int) []int
```

**Examples**

- `MergeSorted([1, 3, 5], [2, 4, 6])` returns `[1, 2, 3, 4, 5, 6]`
- `MergeSorted([], [1, 2, 3])` returns `[1, 2, 3]`

**Constraints**

- 0 <= len(a), len(b) <= 10000
- a and b are each sorted in non-decreasing order

**Learning objective:** Implement the classic merge step used in merge sort as a standalone building block.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-sorted-arrays'), '[[1,3,5],[2,4,6]]'::jsonb, '[1,2,3,4,5,6]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-sorted-arrays'), '[[],[1,2,3]]'::jsonb, '[1,2,3]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-sorted-arrays'), '[[1,1,1],[1,1]]'::jsonb, '[1,1,1,1,1]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-sorted-arrays'), '[[-5,0,5],[-3,2,10]]'::jsonb, '[-5,-3,0,2,5,10]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-sorted-arrays'), '[[9],[]]'::jsonb, '[9]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- arrays-strings :: Longest Common Prefix (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'longest-common-prefix',
    'arrays-strings',
    'function',
    'go',
    'Longest Common Prefix',
    'Write a function that returns the longest common prefix string shared by all strings in a slice `strs`. If there is no common prefix, or the slice is empty, return an empty string.',
    '- 0 <= len(strs) <= 200
- 0 <= len(strs[i]) <= 200',
    'Iteratively narrow a candidate answer instead of comparing every pair of strings directly.',
    'LongestCommonPrefix',
    'string',
    '{"[]string"}',
    '{"Start by assuming the first string is the whole prefix, then shrink it as you check the rest.","For each subsequent string, trim your candidate prefix from the end until it actually matches the start of that string.","If the candidate prefix ever becomes empty, you can stop early — the answer is the empty string."}',
    4,
    190,
    '{"strings","arrays"}',
    true,
    'seed-arrays-strings-longest-common-prefix',
    '## Longest Common Prefix

Write a function that returns the longest common prefix string shared by all strings in a slice `strs`. If there is no common prefix, or the slice is empty, return an empty string.

**Function signature**

```go
func LongestCommonPrefix(strs []string) string
```

**Examples**

- `LongestCommonPrefix(["flower", "flow", "flight"])` returns `"fl"`
- `LongestCommonPrefix(["dog", "racecar", "car"])` returns `""`

**Constraints**

- 0 <= len(strs) <= 200
- 0 <= len(strs[i]) <= 200

**Learning objective:** Iteratively narrow a candidate answer instead of comparing every pair of strings directly.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-common-prefix'), '[["flower","flow","flight"]]'::jsonb, 'fl', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-common-prefix'), '[["dog","racecar","car"]]'::jsonb, '', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-common-prefix'), '[[]]'::jsonb, '', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-common-prefix'), '[["interspecies","interstellar","interstate"]]'::jsonb, 'inters', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-common-prefix'), '[["single"]]'::jsonb, 'single', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- arrays-strings :: Move Zeroes to End (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'move-zeroes',
    'arrays-strings',
    'function',
    'go',
    'Move Zeroes to End',
    'Write a function that moves all zeroes in a slice `nums` to the end while maintaining the relative order of the non-zero elements, and returns the resulting slice.',
    '- 0 <= len(nums) <= 10000
- -10^6 <= nums[i] <= 10^6',
    'Practice stable partitioning of a collection while preserving relative order of the elements that remain.',
    'MoveZeroes',
    '[]int',
    '{"[]int"}',
    '{"The relative order of the non-zero elements must be preserved — this rules out simple sorting.","Collecting all non-zero elements first, then padding with zeroes, is a simple two-pass approach.","The number of trailing zeroes in the result equals the number of zeroes in the original slice."}',
    5,
    220,
    '{"arrays","two-pointers"}',
    true,
    'seed-arrays-strings-move-zeroes',
    '## Move Zeroes to End

Write a function that moves all zeroes in a slice `nums` to the end while maintaining the relative order of the non-zero elements, and returns the resulting slice.

**Function signature**

```go
func MoveZeroes(nums []int) []int
```

**Examples**

- `MoveZeroes([0, 1, 0, 3, 12])` returns `[1, 3, 12, 0, 0]`
- `MoveZeroes([0, 0, 0])` returns `[0, 0, 0]`

**Constraints**

- 0 <= len(nums) <= 10000
- -10^6 <= nums[i] <= 10^6

**Learning objective:** Practice stable partitioning of a collection while preserving relative order of the elements that remain.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'move-zeroes'), '[[0,1,0,3,12]]'::jsonb, '[1,3,12,0,0]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'move-zeroes'), '[[0,0,0]]'::jsonb, '[0,0,0]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'move-zeroes'), '[[1,2,3]]'::jsonb, '[1,2,3]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'move-zeroes'), '[[4,0,5,0,6]]'::jsonb, '[4,5,6,0,0]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'move-zeroes'), '[[]]'::jsonb, '[]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- arrays-strings :: Majority Element (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'find-majority-element',
    'arrays-strings',
    'function',
    'go',
    'Majority Element',
    'Write a function that returns the majority element of a slice `nums` — the element that appears more than `len(nums) / 2` times. You may assume the majority element always exists. Solve it using the Boyer-Moore voting algorithm for full credit.',
    '- 1 <= len(nums) <= 10000
- A majority element is guaranteed to exist',
    'Learn the Boyer-Moore voting algorithm, an elegant O(n) time, O(1) space technique.',
    'MajorityElement',
    'int',
    '{"[]int"}',
    '{"The majority element appears more than len(nums)/2 times, which guarantees it exists if the problem states so.","The Boyer-Moore voting algorithm tracks a candidate and a running count, resetting the candidate when the count hits zero.","You only need a single linear pass and constant extra space — no sorting or hash map required."}',
    5,
    220,
    '{"arrays","algorithms"}',
    true,
    'seed-arrays-strings-find-majority-element',
    '## Majority Element

Write a function that returns the majority element of a slice `nums` — the element that appears more than `len(nums) / 2` times. You may assume the majority element always exists. Solve it using the Boyer-Moore voting algorithm for full credit.

**Function signature**

```go
func MajorityElement(nums []int) int
```

**Examples**

- `MajorityElement([3, 2, 3])` returns `3`
- `MajorityElement([2, 2, 1, 1, 1, 2, 2])` returns `2`

**Constraints**

- 1 <= len(nums) <= 10000
- A majority element is guaranteed to exist

**Learning objective:** Learn the Boyer-Moore voting algorithm, an elegant O(n) time, O(1) space technique.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-majority-element'), '[[3,2,3]]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-majority-element'), '[[2,2,1,1,1,2,2]]'::jsonb, '2', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-majority-element'), '[[1]]'::jsonb, '1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-majority-element'), '[[6,5,5,5,5,6,6,5,5]]'::jsonb, '5', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-majority-element'), '[[9,9,9,1,2]]'::jsonb, '9', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- arrays-strings :: Most Frequent Character (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'most-frequent-char',
    'arrays-strings',
    'function',
    'go',
    'Most Frequent Character',
    'Write a function that returns the most frequently occurring character in a string `s`. If there is a tie, return whichever of the tied characters appears first in `s`. Return an empty string if `s` is empty.',
    '- 0 <= len(s) <= 10000',
    'Combine frequency counting with tie-breaking logic tied to original input order.',
    'MostFrequentChar',
    'string',
    '{"string"}',
    '{"A frequency map (character to count) lets you tally occurrences in a single pass.","When counts tie, the character that first reaches the highest count while scanning left to right should win.","Iterate the string a second time to find the earliest character whose count equals the maximum you found."}',
    5,
    220,
    '{"strings","hashing"}',
    true,
    'seed-arrays-strings-most-frequent-char',
    '## Most Frequent Character

Write a function that returns the most frequently occurring character in a string `s`. If there is a tie, return whichever of the tied characters appears first in `s`. Return an empty string if `s` is empty.

**Function signature**

```go
func MostFrequentChar(s string) string
```

**Examples**

- `MostFrequentChar("aabbbcc")` returns `"b"`
- `MostFrequentChar("xyz")` returns `"x"`

**Constraints**

- 0 <= len(s) <= 10000

**Learning objective:** Combine frequency counting with tie-breaking logic tied to original input order.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'most-frequent-char'), '["aabbbcc"]'::jsonb, 'b', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'most-frequent-char'), '["xyz"]'::jsonb, 'x', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'most-frequent-char'), '[""]'::jsonb, '', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'most-frequent-char'), '["mississippi"]'::jsonb, 'i', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'most-frequent-char'), '["aabb"]'::jsonb, 'a', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- data-structures :: Valid Parentheses (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'valid-parentheses',
    'data-structures',
    'function',
    'go',
    'Valid Parentheses',
    'Write a function that determines whether a string `s` containing only the characters ''('', '')'', ''{'', ''}'', ''['' and '']'' is valid — every opening bracket must be closed by the same type of bracket, in the correct order. This is the canonical introduction to using a stack as a matching device.',
    '- 0 <= len(s) <= 10000
- s contains only bracket characters',
    'Use a stack (LIFO) to validate nested, ordered structure.',
    'ValidParentheses',
    'bool',
    '{"string"}',
    '{"Push every opening bracket you see onto a stack.","When you hit a closing bracket, it must match the type of bracket on top of the stack — otherwise the string is invalid.","After processing the whole string, the stack must be empty for the string to be valid."}',
    1,
    70,
    '{"stacks","strings","beginner"}',
    true,
    'seed-data-structures-valid-parentheses',
    '## Valid Parentheses

Write a function that determines whether a string `s` containing only the characters ''('', '')'', ''{'', ''}'', ''['' and '']'' is valid — every opening bracket must be closed by the same type of bracket, in the correct order. This is the canonical introduction to using a stack as a matching device.

**Function signature**

```go
func ValidParentheses(s string) bool
```

**Examples**

- `ValidParentheses("()")` returns `true`
- `ValidParentheses("()[]{}")` returns `true`

**Constraints**

- 0 <= len(s) <= 10000
- s contains only bracket characters

**Learning objective:** Use a stack (LIFO) to validate nested, ordered structure.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'valid-parentheses'), '["()"]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'valid-parentheses'), '["()[]{}"]'::jsonb, 'true', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'valid-parentheses'), '["(]"]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'valid-parentheses'), '["([{}])"]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'valid-parentheses'), '["((("]'::jsonb, 'false', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- data-structures :: Stack Top After Pushes (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'min-in-stack',
    'data-structures',
    'function',
    'go',
    'Stack Top After Pushes',
    'Given a slice `nums` representing values pushed onto an initially empty stack in order, write a function that returns the value currently on top of the stack. If `nums` is empty, return -1.',
    '- 0 <= len(nums) <= 10000',
    'Build intuition for LIFO ordering, the defining property of the stack data structure.',
    'StackTop',
    'int',
    '{"[]int"}',
    '{"A stack is Last-In-First-Out: the most recently pushed value is always on top.","If you push values in the given order, the top of the stack is simply the last value pushed.","An empty sequence of pushes leaves the stack empty — return -1 in that case."}',
    1,
    70,
    '{"stacks","beginner"}',
    true,
    'seed-data-structures-min-in-stack',
    '## Stack Top After Pushes

Given a slice `nums` representing values pushed onto an initially empty stack in order, write a function that returns the value currently on top of the stack. If `nums` is empty, return -1.

**Function signature**

```go
func StackTop(nums []int) int
```

**Examples**

- `StackTop([1, 2, 3])` returns `3`
- `StackTop([])` returns `-1`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Build intuition for LIFO ordering, the defining property of the stack data structure.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-in-stack'), '[[1,2,3]]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-in-stack'), '[[]]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-in-stack'), '[[42]]'::jsonb, '42', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-in-stack'), '[[5,4,3,2,1]]'::jsonb, '1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-in-stack'), '[[-1,-2,-3]]'::jsonb, '-3', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- data-structures :: Queue Front After Dequeues (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'queue-front-after-dequeues',
    'data-structures',
    'function',
    'go',
    'Queue Front After Dequeues',
    'Given a slice `nums` representing values enqueued in order into an initially empty queue, and an integer `dequeues` representing how many dequeue operations are then performed, write a function that returns the value at the front of the queue afterward. Return -1 if the queue is empty at that point.',
    '- 0 <= len(nums) <= 10000
- 0 <= dequeues <= 10000',
    'Build intuition for FIFO ordering, the defining property of the queue data structure.',
    'QueueFront',
    'int',
    '{"[]int","int"}',
    '{"A queue is First-In-First-Out: the earliest-enqueued element leaves first.","If elements are enqueued in the order given by `nums`, dequeuing `d` times removes the first `d` elements.","The new front is simply nums[d] — but check that the queue isn''t empty first."}',
    1,
    70,
    '{"queues","beginner"}',
    true,
    'seed-data-structures-queue-front-after-dequeues',
    '## Queue Front After Dequeues

Given a slice `nums` representing values enqueued in order into an initially empty queue, and an integer `dequeues` representing how many dequeue operations are then performed, write a function that returns the value at the front of the queue afterward. Return -1 if the queue is empty at that point.

**Function signature**

```go
func QueueFront(nums []int, dequeues int) int
```

**Examples**

- `QueueFront([10, 20, 30], 1)` returns `20`
- `QueueFront([1, 2, 3], 0)` returns `1`

**Constraints**

- 0 <= len(nums) <= 10000
- 0 <= dequeues <= 10000

**Learning objective:** Build intuition for FIFO ordering, the defining property of the queue data structure.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'queue-front-after-dequeues'), '[[10,20,30],1]'::jsonb, '20', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'queue-front-after-dequeues'), '[[1,2,3],0]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'queue-front-after-dequeues'), '[[5],1]'::jsonb, '-1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'queue-front-after-dequeues'), '[[1,2,3,4,5],3]'::jsonb, '4', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'queue-front-after-dequeues'), '[[7,8],5]'::jsonb, '-1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- data-structures :: Reverse a Linked List (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'reverse-linked-list-array',
    'data-structures',
    'function',
    'go',
    'Reverse a Linked List',
    'A singly linked list is represented here as a slice `nums`, where `nums[i]` is the value of the `i`-th node when the list is traversed from head to tail. Write a function that returns the values of the list after it has been reversed, in traversal order.',
    '- 0 <= len(nums) <= 10000',
    'Translate a pointer-reversal concept from linked lists into an equivalent array operation.',
    'ReverseLinkedList',
    '[]int',
    '{"[]int"}',
    '{"A linked list traversed from head to tail visits nodes in the order they were linked.","Reversing the list means the traversal order (and therefore the value order) is simply flipped.","This array representation lets you focus on the reversal logic without pointer manipulation."}',
    2,
    110,
    '{"linked-lists"}',
    true,
    'seed-data-structures-reverse-linked-list-array',
    '## Reverse a Linked List

A singly linked list is represented here as a slice `nums`, where `nums[i]` is the value of the `i`-th node when the list is traversed from head to tail. Write a function that returns the values of the list after it has been reversed, in traversal order.

**Function signature**

```go
func ReverseLinkedList(nums []int) []int
```

**Examples**

- `ReverseLinkedList([1, 2, 3, 4])` returns `[4, 3, 2, 1]`
- `ReverseLinkedList([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Translate a pointer-reversal concept from linked lists into an equivalent array operation.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-linked-list-array'), '[[1,2,3,4]]'::jsonb, '[4,3,2,1]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-linked-list-array'), '[[]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-linked-list-array'), '[[9]]'::jsonb, '[9]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-linked-list-array'), '[[1,2]]'::jsonb, '[2,1]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-linked-list-array'), '[[5,4,3,2,1]]'::jsonb, '[1,2,3,4,5]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- data-structures :: Remove Duplicates from Sorted Linked List (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'remove-dup-linked-list',
    'data-structures',
    'function',
    'go',
    'Remove Duplicates from Sorted Linked List',
    'A sorted singly linked list is represented as a slice `nums` in head-to-tail order. Write a function that removes duplicate values so each distinct value appears only once, and returns the resulting sequence of node values.',
    '- 0 <= len(nums) <= 10000
- nums is sorted in non-decreasing order',
    'Recognize that many array algorithms apply directly to linked lists once you think in terms of a linear traversal.',
    'RemoveDuplicatesFromLinkedList',
    '[]int',
    '{"[]int"}',
    '{"A sorted linked list only ever has duplicate values in adjacent nodes.","Walk the list once, keeping a node only if its value differs from the previously kept node''s value.","This is structurally identical to deduplicating a sorted array — the linked list is just represented as one here."}',
    2,
    110,
    '{"linked-lists"}',
    true,
    'seed-data-structures-remove-dup-linked-list',
    '## Remove Duplicates from Sorted Linked List

A sorted singly linked list is represented as a slice `nums` in head-to-tail order. Write a function that removes duplicate values so each distinct value appears only once, and returns the resulting sequence of node values.

**Function signature**

```go
func RemoveDuplicatesFromLinkedList(nums []int) []int
```

**Examples**

- `RemoveDuplicatesFromLinkedList([1, 1, 2, 3, 3])` returns `[1, 2, 3]`
- `RemoveDuplicatesFromLinkedList([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 10000
- nums is sorted in non-decreasing order

**Learning objective:** Recognize that many array algorithms apply directly to linked lists once you think in terms of a linear traversal.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-dup-linked-list'), '[[1,1,2,3,3]]'::jsonb, '[1,2,3]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-dup-linked-list'), '[[]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-dup-linked-list'), '[[1,1,1,1]]'::jsonb, '[1]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-dup-linked-list'), '[[1,2,3,4]]'::jsonb, '[1,2,3,4]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-dup-linked-list'), '[[2,2,2,5,5,8]]'::jsonb, '[2,5,8]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- data-structures :: Simulate Queue Operations (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'simulate-queue-ops',
    'data-structures',
    'function',
    'go',
    'Simulate Queue Operations',
    'Write a function `SimulateQueueOperations(ops []string) []int` that simulates a queue by processing a sequence of string commands, each either `"enqueue x"` (where x is an integer) or `"dequeue"`. Return the final contents of the queue, from front to back, after all operations have been applied.',
    '- 0 <= len(ops) <= 10000
- Each op is exactly "enqueue <int>" or "dequeue"',
    'Translate a sequence of textual commands into state transitions on an underlying data structure.',
    'SimulateQueueOperations',
    '[]int',
    '{"[]string"}',
    '{"Process the operations strings one at a time, in order, mutating a growing slice that represents the queue.","An \"enqueue x\" operation appends x to the back; a \"dequeue\" operation removes from the front.","A \"dequeue\" on an empty queue should simply be ignored — it must not panic or remove anything that isn''t there."}',
    2,
    110,
    '{"queues"}',
    true,
    'seed-data-structures-simulate-queue-ops',
    '## Simulate Queue Operations

Write a function `SimulateQueueOperations(ops []string) []int` that simulates a queue by processing a sequence of string commands, each either `"enqueue x"` (where x is an integer) or `"dequeue"`. Return the final contents of the queue, from front to back, after all operations have been applied.

**Function signature**

```go
func SimulateQueueOperations(ops []string) []int
```

**Examples**

- `SimulateQueueOperations(["enqueue 1", "enqueue 2", "dequeue", "enqueue 3"])` returns `[2, 3]`
- `SimulateQueueOperations(["dequeue", "dequeue"])` returns `[]`

**Constraints**

- 0 <= len(ops) <= 10000
- Each op is exactly "enqueue <int>" or "dequeue"

**Learning objective:** Translate a sequence of textual commands into state transitions on an underlying data structure.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'simulate-queue-ops'), '[["enqueue 1","enqueue 2","dequeue","enqueue 3"]]'::jsonb, '[2,3]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'simulate-queue-ops'), '[["dequeue","dequeue"]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'simulate-queue-ops'), '[["enqueue 5"]]'::jsonb, '[5]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'simulate-queue-ops'), '[["enqueue 1","enqueue 2","enqueue 3","dequeue","dequeue","dequeue","dequeue"]]'::jsonb, '[]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'simulate-queue-ops'), '[[]]'::jsonb, '[]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- data-structures :: Linked List Cycle Detection (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'has-cycle',
    'data-structures',
    'function',
    'go',
    'Linked List Cycle Detection',
    'A singly linked list is represented by a `next` slice, where `next[i]` is the index of the node that follows node `i`, or -1 if node `i` is the last node. Given the `next` array and a `start` index, write a function that determines whether the list starting at `start` contains a cycle. Use Floyd''s tortoise-and-hare algorithm for O(1) extra space.',
    '- 0 <= len(next) <= 10000
- -1 <= next[i] < len(next)
- 0 <= start < len(next), unless next is empty',
    'Implement Floyd''s cycle detection algorithm, a classic two-pointer technique for linked structures.',
    'HasCycle',
    'bool',
    '{"[]int","int"}',
    '{"Floyd''s cycle detection (''tortoise and hare'') uses two pointers moving at different speeds.","If a fast pointer (moving two steps at a time) ever equals a slow pointer (moving one step at a time), there is a cycle.","A value of -1 in the `next` array represents a null pointer — following it means the list ends with no cycle."}',
    3,
    150,
    '{"linked-lists","two-pointers"}',
    true,
    'seed-data-structures-has-cycle',
    '## Linked List Cycle Detection

A singly linked list is represented by a `next` slice, where `next[i]` is the index of the node that follows node `i`, or -1 if node `i` is the last node. Given the `next` array and a `start` index, write a function that determines whether the list starting at `start` contains a cycle. Use Floyd''s tortoise-and-hare algorithm for O(1) extra space.

**Function signature**

```go
func HasCycle(next []int, start int) bool
```

**Examples**

- `HasCycle([1, 2, -1], 0)` returns `false`
- `HasCycle([1, 2, 0], 0)` returns `true`

**Constraints**

- 0 <= len(next) <= 10000
- -1 <= next[i] < len(next)
- 0 <= start < len(next), unless next is empty

**Learning objective:** Implement Floyd''s cycle detection algorithm, a classic two-pointer technique for linked structures.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'has-cycle'), '[[1,2,-1],0]'::jsonb, 'false', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'has-cycle'), '[[1,2,0],0]'::jsonb, 'true', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'has-cycle'), '[[-1],0]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'has-cycle'), '[[1,2,3,1],0]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'has-cycle'), '[[1,-1],0]'::jsonb, 'false', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- data-structures :: Middle of a Linked List (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'middle-element',
    'data-structures',
    'function',
    'go',
    'Middle of a Linked List',
    'A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function that returns the value of the middle node. If there are two middle nodes (even length), return the value of the second one.',
    '- 1 <= len(nums) <= 10000',
    'Apply the slow/fast pointer technique to locate a structural midpoint in one pass.',
    'MiddleElement',
    'int',
    '{"[]int"}',
    '{"The slow/fast pointer technique finds the middle in a single pass: advance slow by one and fast by two.","When fast reaches the end, slow is at the middle.","For an even-length list, this technique naturally lands on the second of the two middle nodes."}',
    3,
    150,
    '{"linked-lists","two-pointers"}',
    true,
    'seed-data-structures-middle-element',
    '## Middle of a Linked List

A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function that returns the value of the middle node. If there are two middle nodes (even length), return the value of the second one.

**Function signature**

```go
func MiddleElement(nums []int) int
```

**Examples**

- `MiddleElement([1, 2, 3, 4, 5])` returns `3`
- `MiddleElement([1, 2, 3, 4])` returns `3`

**Constraints**

- 1 <= len(nums) <= 10000

**Learning objective:** Apply the slow/fast pointer technique to locate a structural midpoint in one pass.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'middle-element'), '[[1,2,3,4,5]]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'middle-element'), '[[1,2,3,4]]'::jsonb, '3', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'middle-element'), '[[7]]'::jsonb, '7', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'middle-element'), '[[1,2,3,4,5,6]]'::jsonb, '4', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'middle-element'), '[[10,20]]'::jsonb, '20', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- data-structures :: Binary Search (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'binary-search',
    'data-structures',
    'function',
    'go',
    'Binary Search',
    'Write a function `BinarySearch(nums []int, target int) int` that returns the index of `target` in a sorted slice `nums`, or -1 if it is not present. Implement it iteratively in O(log n) time.',
    '- 0 <= len(nums) <= 100000
- nums is sorted in non-decreasing order',
    'Implement the foundational O(log n) search algorithm that underlies balanced trees and sorted-structure lookups.',
    'BinarySearch',
    'int',
    '{"[]int","int"}',
    '{"Binary search only works on a sorted slice — always confirm that precondition.","At each step, compare the target to the middle element and discard the half that can''t contain it.","Track the search range with two boundaries and stop when they cross, returning -1 if the target is never found."}',
    3,
    150,
    '{"algorithms","searching"}',
    true,
    'seed-data-structures-binary-search',
    '## Binary Search

Write a function `BinarySearch(nums []int, target int) int` that returns the index of `target` in a sorted slice `nums`, or -1 if it is not present. Implement it iteratively in O(log n) time.

**Function signature**

```go
func BinarySearch(nums []int, target int) int
```

**Examples**

- `BinarySearch([1, 3, 5, 7, 9], 5)` returns `2`
- `BinarySearch([1, 2, 3], 4)` returns `-1`

**Constraints**

- 0 <= len(nums) <= 100000
- nums is sorted in non-decreasing order

**Learning objective:** Implement the foundational O(log n) search algorithm that underlies balanced trees and sorted-structure lookups.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'binary-search'), '[[1,3,5,7,9],5]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'binary-search'), '[[1,2,3],4]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'binary-search'), '[[],1]'::jsonb, '-1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'binary-search'), '[[2,4,6,8,10,12],12]'::jsonb, '5', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'binary-search'), '[[-5,-1,0,3,8],-1]'::jsonb, '1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- data-structures :: Merge Two Sorted Linked Lists (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'merge-sorted-lists',
    'data-structures',
    'function',
    'go',
    'Merge Two Sorted Linked Lists',
    'Two sorted singly linked lists are represented as slices `a` and `b` in head-to-tail order. Write a function that merges them into a single sorted sequence of values, as if splicing the two linked lists together node by node.',
    '- 0 <= len(a), len(b) <= 10000',
    'Reapply the merge-step pattern in the context of linked lists rather than plain arrays.',
    'MergeSortedLists',
    '[]int',
    '{"[]int","[]int"}',
    '{"This is structurally the same problem as merging two sorted arrays — the linked list is just represented as a slice here.","Compare the current heads of both lists and take the smaller one first.","Once one list is exhausted, append the remainder of the other directly."}',
    4,
    190,
    '{"linked-lists","two-pointers"}',
    true,
    'seed-data-structures-merge-sorted-lists',
    '## Merge Two Sorted Linked Lists

Two sorted singly linked lists are represented as slices `a` and `b` in head-to-tail order. Write a function that merges them into a single sorted sequence of values, as if splicing the two linked lists together node by node.

**Function signature**

```go
func MergeSortedLists(a []int, b []int) []int
```

**Examples**

- `MergeSortedLists([1, 2, 4], [1, 3, 4])` returns `[1, 1, 2, 3, 4, 4]`
- `MergeSortedLists([], [0])` returns `[0]`

**Constraints**

- 0 <= len(a), len(b) <= 10000

**Learning objective:** Reapply the merge-step pattern in the context of linked lists rather than plain arrays.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-sorted-lists'), '[[1,2,4],[1,3,4]]'::jsonb, '[1,1,2,3,4,4]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-sorted-lists'), '[[],[0]]'::jsonb, '[0]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-sorted-lists'), '[[],[]]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-sorted-lists'), '[[5,10,15],[1,2,3]]'::jsonb, '[1,2,3,5,10,15]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-sorted-lists'), '[[2,2,2],[1,3]]'::jsonb, '[1,2,2,2,3]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- data-structures :: Evaluate Postfix Expression (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'evaluate-postfix',
    'data-structures',
    'function',
    'go',
    'Evaluate Postfix Expression',
    'Write a function that evaluates a postfix (Reverse Polish Notation) arithmetic expression given as a slice of tokens `tokens`, where each token is either an integer literal or one of the operators ''+'', ''-'', ''*'', ''/''. Division should truncate toward zero, matching Go''s integer division.',
    '- 1 <= len(tokens) <= 1000
- The expression is always well-formed and valid',
    'Use a stack to evaluate expressions without needing to parse operator precedence or parentheses.',
    'EvaluatePostfix',
    'int',
    '{"[]string"}',
    '{"Scan the tokens left to right, pushing numbers onto a stack.","When you encounter an operator, pop the top two values, apply the operator, and push the result back.","Order matters for subtraction and division: the value popped second is the left-hand operand."}',
    4,
    190,
    '{"stacks","algorithms"}',
    true,
    'seed-data-structures-evaluate-postfix',
    '## Evaluate Postfix Expression

Write a function that evaluates a postfix (Reverse Polish Notation) arithmetic expression given as a slice of tokens `tokens`, where each token is either an integer literal or one of the operators ''+'', ''-'', ''*'', ''/''. Division should truncate toward zero, matching Go''s integer division.

**Function signature**

```go
func EvaluatePostfix(tokens []string) int
```

**Examples**

- `EvaluatePostfix(["2", "3", "+"])` returns `5`
- `EvaluatePostfix(["4", "13", "5", "/", "+"])` returns `6`

**Constraints**

- 1 <= len(tokens) <= 1000
- The expression is always well-formed and valid

**Learning objective:** Use a stack to evaluate expressions without needing to parse operator precedence or parentheses.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'evaluate-postfix'), '[["2","3","+"]]'::jsonb, '5', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'evaluate-postfix'), '[["4","13","5","/","+"]]'::jsonb, '6', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'evaluate-postfix'), '[["5","1","2","+","4","*","+","3","-"]]'::jsonb, '14', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'evaluate-postfix'), '[["10","2","/"]]'::jsonb, '5', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'evaluate-postfix'), '[["6","2","3","*","-"]]'::jsonb, '0', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- data-structures :: Kth Largest Element (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'kth-largest',
    'data-structures',
    'function',
    'go',
    'Kth Largest Element',
    'Write a function `KthLargest(nums []int, k int) int` that returns the `k`-th largest element in `nums` (the 1st largest is the maximum, the 2nd largest is the second maximum, and so on). This mirrors the core operation behind a priority queue''s `extract-max` behavior.',
    '- 1 <= k <= len(nums) <= 10000',
    'Connect the abstract idea of a priority queue to a concrete, testable ranking operation.',
    'KthLargest',
    'int',
    '{"[]int","int"}',
    '{"The kth largest element is the element that would be at index k-1 if the slice were sorted in descending order.","Sorting the slice is the simplest correct approach; a heap-based approach is more efficient but not required here.","k is guaranteed to be within the valid range for the given slice."}',
    4,
    190,
    '{"algorithms","sorting"}',
    true,
    'seed-data-structures-kth-largest',
    '## Kth Largest Element

Write a function `KthLargest(nums []int, k int) int` that returns the `k`-th largest element in `nums` (the 1st largest is the maximum, the 2nd largest is the second maximum, and so on). This mirrors the core operation behind a priority queue''s `extract-max` behavior.

**Function signature**

```go
func KthLargest(nums []int, k int) int
```

**Examples**

- `KthLargest([3, 2, 1, 5, 6, 4], 2)` returns `5`
- `KthLargest([1], 1)` returns `1`

**Constraints**

- 1 <= k <= len(nums) <= 10000

**Learning objective:** Connect the abstract idea of a priority queue to a concrete, testable ranking operation.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'kth-largest'), '[[3,2,1,5,6,4],2]'::jsonb, '5', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'kth-largest'), '[[1],1]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'kth-largest'), '[[7,7,7],2]'::jsonb, '7', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'kth-largest'), '[[9,3,2,4,8],1]'::jsonb, '9', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'kth-largest'), '[[1,2,3,4,5,6,7],4]'::jsonb, '4', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- data-structures :: Balanced Binary Tree (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'is-balanced-tree',
    'data-structures',
    'function',
    'go',
    'Balanced Binary Tree',
    'A binary tree is given as a level-order slice `nodes`, where the root is at index 0, and for a node at index `i`, its left child is at `2i+1` and its right child is at `2i+2`. A value of -1 means that position has no node. Write a function that determines whether the tree is height-balanced: for every node, the heights of its left and right subtrees differ by no more than 1.',
    '- 0 <= len(nodes) <= 1000
- nodes[0] == -1 represents an empty tree, which is considered balanced',
    'Perform recursive tree analysis using a height-computation-with-early-exit pattern, a technique that generalizes to many tree problems.',
    'IsBalancedTree',
    'bool',
    '{"[]int"}',
    '{"The tree is given in level-order array form (like a binary heap): node i''s children are at 2i+1 and 2i+2, and -1 marks a missing node.","A tree is height-balanced if, for every node, the heights of its left and right subtrees differ by at most 1.","A clean recursive helper should return -1 as a sentinel the moment it detects an imbalance, so the check can short-circuit instead of recomputing heights repeatedly."}',
    5,
    220,
    '{"trees","recursion"}',
    true,
    'seed-data-structures-is-balanced-tree',
    '## Balanced Binary Tree

A binary tree is given as a level-order slice `nodes`, where the root is at index 0, and for a node at index `i`, its left child is at `2i+1` and its right child is at `2i+2`. A value of -1 means that position has no node. Write a function that determines whether the tree is height-balanced: for every node, the heights of its left and right subtrees differ by no more than 1.

**Function signature**

```go
func IsBalancedTree(nodes []int) bool
```

**Examples**

- `IsBalancedTree([3, 9, 20, -1, -1, 15, 7])` returns `true`
- `IsBalancedTree([1, 2, 2, 3, 3, -1, -1, 4, 4])` returns `false`

**Constraints**

- 0 <= len(nodes) <= 1000
- nodes[0] == -1 represents an empty tree, which is considered balanced

**Learning objective:** Perform recursive tree analysis using a height-computation-with-early-exit pattern, a technique that generalizes to many tree problems.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-balanced-tree'), '[[3,9,20,-1,-1,15,7]]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-balanced-tree'), '[[1,2,2,3,3,-1,-1,4,4]]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-balanced-tree'), '[[-1]]'::jsonb, 'true', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-balanced-tree'), '[[1,2,-1,3,-1]]'::jsonb, 'false', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-balanced-tree'), '[[1,-1,2,-1,-1,-1,3]]'::jsonb, 'false', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- data-structures :: Count Connected Components in a Graph (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'count-connected-components',
    'data-structures',
    'function',
    'go',
    'Count Connected Components in a Graph',
    'An undirected graph has `n` nodes labeled 0 to n-1, and its edges are given as a flattened slice `edges` where each consecutive pair `(edges[2i], edges[2i+1])` represents one edge. Write a function `CountComponents(n int, edges []int) int` that returns the number of connected components in the graph, ideally using a union-find (disjoint set) data structure.',
    '- 0 <= n <= 1000
- len(edges) is always even
- 0 <= edges[i] < n',
    'Implement union-find, the standard efficient structure for tracking connectivity in a dynamic graph.',
    'CountComponents',
    'int',
    '{"int","[]int"}',
    '{"Union-Find (disjoint set union) merges nodes that share an edge into the same group efficiently.","Every edge is given as a pair of consecutive integers in the flattened `edges` slice: edges[0]-edges[1] is the first edge, edges[2]-edges[3] the second, and so on.","After processing all edges, the number of distinct root parents across all n nodes is the number of connected components."}',
    5,
    220,
    '{"graphs","union-find"}',
    true,
    'seed-data-structures-count-connected-components',
    '## Count Connected Components in a Graph

An undirected graph has `n` nodes labeled 0 to n-1, and its edges are given as a flattened slice `edges` where each consecutive pair `(edges[2i], edges[2i+1])` represents one edge. Write a function `CountComponents(n int, edges []int) int` that returns the number of connected components in the graph, ideally using a union-find (disjoint set) data structure.

**Function signature**

```go
func CountComponents(n int, edges []int) int
```

**Examples**

- `CountComponents(5, [0, 1, 1, 2, 3, 4])` returns `2`
- `CountComponents(4, [])` returns `4`

**Constraints**

- 0 <= n <= 1000
- len(edges) is always even
- 0 <= edges[i] < n

**Learning objective:** Implement union-find, the standard efficient structure for tracking connectivity in a dynamic graph.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-connected-components'), '[5,[0,1,1,2,3,4]]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-connected-components'), '[4,[]]'::jsonb, '4', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-connected-components'), '[1,[]]'::jsonb, '1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-connected-components'), '[6,[0,1,2,3,4,5]]'::jsonb, '3', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-connected-components'), '[3,[0,1,1,2]]'::jsonb, '1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- data-structures :: Count Words With Prefix (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'count-words-with-prefix',
    'data-structures',
    'function',
    'go',
    'Count Words With Prefix',
    'Write a function `CountWordsWithPrefix(words []string, prefix string) int` that returns how many strings in `words` start with `prefix`. This models the core query a trie (prefix tree) is built to answer efficiently, and is a natural bridge from arrays of strings toward trie-based data structures.',
    '- 0 <= len(words) <= 10000
- 0 <= len(prefix) <= 100',
    'Understand the query a trie is designed to answer, as a foundation for implementing one later.',
    'CountWordsWithPrefix',
    'int',
    '{"[]string","string"}',
    '{"A trie stores words character by character in a shared tree so that all words sharing a prefix share a path.","Conceptually, counting words with a given prefix means counting how many words pass through the trie node at the end of that prefix.","You don''t need to build an explicit trie to solve this correctly — checking each word''s prefix directly achieves the same result and is a fine reference solution — but think about how you''d generalize it if there were millions of words."}',
    5,
    220,
    '{"tries","strings"}',
    true,
    'seed-data-structures-count-words-with-prefix',
    '## Count Words With Prefix

Write a function `CountWordsWithPrefix(words []string, prefix string) int` that returns how many strings in `words` start with `prefix`. This models the core query a trie (prefix tree) is built to answer efficiently, and is a natural bridge from arrays of strings toward trie-based data structures.

**Function signature**

```go
func CountWordsWithPrefix(words []string, prefix string) int
```

**Examples**

- `CountWordsWithPrefix(["apple", "app", "application", "banana"], "app")` returns `3`
- `CountWordsWithPrefix(["dog", "cat", "bird"], "z")` returns `0`

**Constraints**

- 0 <= len(words) <= 10000
- 0 <= len(prefix) <= 100

**Learning objective:** Understand the query a trie is designed to answer, as a foundation for implementing one later.'
) ON CONFLICT (slug) DO NOTHING;




INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-words-with-prefix'), '[["apple","app","application","banana"],"app"]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-words-with-prefix'), '[["dog","cat","bird"],"z"]'::jsonb, '0', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-words-with-prefix'), '[[],"a"]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-words-with-prefix'), '[["go","golang","google","gopher","java"],"go"]'::jsonb, '4', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-words-with-prefix'), '[["test"],""]'::jsonb, '1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

COMMIT;

-- ---- Verification: problem count per module (expect 15 / 15 / 15) ----
SELECT module, COUNT(*) AS problem_count
FROM problems
WHERE module IN ('math-recursion', 'arrays-strings', 'data-structures')
GROUP BY module
ORDER BY module;

-- ---- Verification: test case count per problem (expect 5 for every row) ----
SELECT p.slug, COUNT(tc.id) AS test_case_count
FROM problems p
JOIN test_cases tc ON tc.problem_id = p.id
WHERE p.module IN ('math-recursion', 'arrays-strings', 'data-structures')
GROUP BY p.slug
HAVING COUNT(tc.id) <> 5
ORDER BY p.slug;
-- An empty result set above confirms every problem has exactly 5 test cases.