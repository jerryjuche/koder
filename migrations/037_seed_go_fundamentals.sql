-- ============================================================================
-- Koder :: Go Fundamentals Seed Migration
-- 5 Go-only problems (module: go-fundamentals)
--
-- Each problem tests core Go language features: slices, maps, control flow,
-- multiple return values, and the map-comma-ok idiom. No Python entries in
-- language_versions — these are Go-only concepts.
-- ============================================================================

BEGIN;

-- ---- Even Squares (difficulty 2, 90 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'even-squares',
    'go-fundamentals',
    'function',
    'go',
    'Even Squares',
    'Write a function **`EvenSquares(nums []int) []int`** that takes a slice of integers, filters out the odd numbers, squares each remaining even number, and returns the resulting slice in the same relative order.

Slices are Go''s dynamically-sized array type. You create them with `make()` or slice literals, append elements with the built-in `append()` function, and iterate with `for _, v := range` syntax.

To square a number `x`, use `x * x` — Go has no built-in `pow` for integers, but multiplication is the idiomatic approach for small powers.

When filtering, the common Go pattern is to create an empty result slice and `append` matching elements to it:

    result := []int{}
    for _, v := range nums {
        if v%2 == 0 {
            result = append(result, v*v)
        }
    }

For an input of `[1, 2, 3, 4, 5]`, the function should return `[4, 16]` (the evens 2 and 4, squared).',
    '- 0 <= len(nums) <= 1000
- Each element is in the range -10^5 to 10^5
- The result must preserve the original order of the even elements.',
    'Practice slice appending in a loop, using the modulus operator for even/odd checks, and building a result slice incrementally.',
    'EvenSquares',
    '[]int',
    '{"[]int"}',
    '{"Use v%2 == 0 to test if a number is even.","Preallocate the result slice with make([]int, 0, len(nums)/2) for better performance.","Append the squared value: result = append(result, v*v)."}',
    2,
    90,
    '{"go","slices","loops","beginner"}',
    true,
    'seed-go-fund-even-squares',
    '## Even Squares

Given a slice of integers, return a new slice containing the squares of the even numbers, preserving order.

### Why this exercise matters

This problem teaches three fundamental Go patterns in one compact function:
1. **Filtering** — selecting elements that satisfy a condition (evenness)
2. **Mapping** — transforming each selected element (squaring)
3. **Slice building** — using `append()` to construct a result dynamically

These three patterns (filter, map, reduce) are the backbone of data-processing code in any language, but Go expresses them explicitly with loops rather than with higher-order functions. Learning to think in terms of `for` + `append` is essential for writing idiomatic Go.

### Examples

- `EvenSquares([]int{1, 2, 3, 4, 5})` → `[]int{4, 16}`
- `EvenSquares([]int{7, 11})` → `[]int{}`
- `EvenSquares([]int{-2, -1, 0, 1, 2})` → `[]int{4, 0, 4}`
- `EvenSquares([]int{})` → `[]int{}`

### Reference solution

    func EvenSquares(nums []int) []int {
        result := make([]int, 0, len(nums)/2+1)
        for _, v := range nums {
            if v%2 == 0 {
                result = append(result, v*v)
            }
        }
        return result
    }',
    '{"go": {"func_name": "EvenSquares", "return_type": "[]int", "param_types": ["[]int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'even-squares'), '[[1,2,3,4,5]]'::jsonb, '[4,16]', false, 1)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'even-squares'), '[[7,11]]'::jsonb, '[]', false, 2)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'even-squares'), '[[-2,-1,0,1,2]]'::jsonb, '[4,0,4]', false, 3)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'even-squares'), '[[]]'::jsonb, '[]', true, 4)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'even-squares'), '[[10,15,20,25,30]]'::jsonb, '[100,400,900]', true, 5)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- Word Count (difficulty 3, 130 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'word-count',
    'go-fundamentals',
    'function',
    'go',
    'Word Count',
    'Write a function **`WordCount(s string) map[string]int`** that takes a sentence and returns a map where each key is a unique word from the sentence (case-sensitive, lowercased) and each value is the number of times that word appears.

Maps in Go are reference types that associate keys with values. You declare them with `map[KeyType]ValueType` and create them with `make(map[string]int)` or a map literal.

The comma-ok idiom is Go''s way of checking whether a key exists in a map:

    count, ok := m["hello"]
    if ok {
        // key "hello" exists, count holds its value
    }

To split a string into words, use `strings.Fields(s)` — it splits on whitespace and handles multiple spaces, tabs, and newlines automatically. Remember to import `"strings"` at the top of your file.

The typical Go pattern for counting is:

    m := make(map[string]int)
    for _, word := range strings.Fields(s) {
        m[word]++
    }

Note that accessing `m[word]` on a map returns the zero value (0 for int) if the key doesn''t exist, so `m[word]++` works even for the first occurrence.

For the input `"the cat and the dog"`, the function should return `map[string]int{"the": 2, "cat": 1, "and": 1, "dog": 1}`.',
    '- 0 <= len(s) <= 5000
- Words are separated by whitespace (spaces, tabs, newlines)
- Words are case-sensitive, so "Go" and "go" are different words.',
    'Learn map creation, insertion, and the increment idiom — one of the most common Go patterns.',
    'WordCount',
    'map[string]int',
    '{"string"}',
    '{"Use strings.Fields(s) to split the sentence into words.","Remember that accessing a missing map key returns the zero value — m[word]++ works on first access.","Return the map directly; the test will check key-by-key equivalence."}',
    3,
    130,
    '{"go","maps","strings","intermediate"}',
    true,
    'seed-go-fund-word-count',
    '## Word Count

Given a sentence, return a map of word frequencies. Words are defined by whitespace boundaries.

### Why this exercise matters

The map counting idiom (`m[key]++`) is one of the most frequently used patterns in Go. It appears in everything from log analysis to API request tracking to text processing. This exercise builds muscle memory for:

1. **Map creation** — `make(map[string]int)`
2. **Auto-vivification** — Go maps return the zero value for missing keys
3. **String splitting** — `strings.Fields()` is the idiomatic whitespace splitter
4. **Range over slices** — `for _, word := range words`

### Examples

- `WordCount("the cat and the dog")` → `map[string]int{"the": 2, "cat": 1, "and": 1, "dog": 1}`
- `WordCount("")` → `map[string]int{}`
- `WordCount("a a a")` → `map[string]int{"a": 3}`
- `WordCount("Go go gopher")` → `map[string]int{"Go": 1, "go": 1, "gopher": 1}`

### Reference solution

    import "strings"

    func WordCount(s string) map[string]int {
        m := make(map[string]int)
        for _, word := range strings.Fields(s) {
            m[word]++
        }
        return m
    }',
    '{"go": {"func_name": "WordCount", "return_type": "map[string]int", "param_types": ["string"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'word-count'), '["the cat and the dog"]'::jsonb, '{"the":2,"cat":1,"and":1,"dog":1}', false, 1)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'word-count'), '[""]'::jsonb, '{}', false, 2)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'word-count'), '["a a a"]'::jsonb, '{"a":3}', false, 3)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'word-count'), '["Go go gopher"]'::jsonb, '{"Go":1,"go":1,"gopher":1}', true, 4)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'word-count'), '["one two one two three one"]'::jsonb, '{"one":3,"two":2,"three":1}', true, 5)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- FizzBuzz (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'fizzbuzz',
    'go-fundamentals',
    'function',
    'go',
    'FizzBuzz',
    'Write a function **`FizzBuzz(n int) []string`** that returns a slice of strings representing the classic FizzBuzz sequence from 1 to n inclusive.

For each number from 1 to n:
- If the number is divisible by both 3 and 5, append `"FizzBuzz"`.
- If the number is divisible by 3 (but not 5), append `"Fizz"`.
- If the number is divisible by 5 (but not 3), append `"Buzz"`.
- Otherwise, append the number as a string.

Go''s `strconv.Itoa(n)` converts an integer to its string representation. You''ll need `import "strconv"` at the top of your file.

The `%` (modulus) operator gives the remainder after division: `n % 3 == 0` means n is divisible by 3.

A common Go pattern for building a slice of known size is to pre-allocate with `make([]string, n)` and assign by index rather than appending:

    result := make([]string, n)
    for i := 1; i <= n; i++ {
        if i%15 == 0 {
            result[i-1] = "FizzBuzz"
        } else if i%3 == 0 {
            result[i-1] = "Fizz"
        } else if i%5 == 0 {
            result[i-1] = "Buzz"
        } else {
            result[i-1] = strconv.Itoa(i)
        }
    }

For `n = 5`, the function should return `["1", "2", "Fizz", "4", "Buzz"]`.',
    '- 1 <= n <= 1000
- Check multiples of 15 (3*5) before checking 3 or 5 individually to avoid incorrect matches.',
    'Practice slice pre-allocation, modulus arithmetic, and if-else chain ordering.',
    'FizzBuzz',
    '[]string',
    '{"int"}',
    '{"Test divisibility by 15 first (i%15==0) to avoid matching both 3 and 5 separately.","Use make([]string, n) to pre-allocate and assign by index.","Convert numbers with strconv.Itoa(i) — remember to import strconv."}',
    1,
    70,
    '{"go","control-flow","beginner"}',
    true,
    'seed-go-fund-fizzbuzz',
    '## FizzBuzz

Generate the classic FizzBuzz sequence from 1 to n.

### Why this exercise matters

FizzBuzz is the quintessential programming interview screen for a reason: it tests whether you can translate a simple specification into correct control flow. In Go specifically, it exercises:

1. **For loops** — the only loop construct in Go
2. **If-else chains** — ordering conditions correctly
3. **Slice pre-allocation** — using indices rather than `append` when the size is known
4. **String conversion** — `strconv.Itoa`
5. **Modulus operator** — divisibility checks

### Examples

- `FizzBuzz(5)` → `[]string{"1", "2", "Fizz", "4", "Buzz"}`
- `FizzBuzz(15)` → `[]string{"1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"}`
- `FizzBuzz(1)` → `[]string{"1"}`

### Reference solution

    import "strconv"

    func FizzBuzz(n int) []string {
        result := make([]string, n)
        for i := 1; i <= n; i++ {
            switch {
            case i%15 == 0:
                result[i-1] = "FizzBuzz"
            case i%3 == 0:
                result[i-1] = "Fizz"
            case i%5 == 0:
                result[i-1] = "Buzz"
            default:
                result[i-1] = strconv.Itoa(i)
            }
        }
        return result
    }',
    '{"go": {"func_name": "FizzBuzz", "return_type": "[]string", "param_types": ["int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'fizzbuzz'), '[5]'::jsonb, '["1","2","Fizz","4","Buzz"]', false, 1)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'fizzbuzz'), '[1]'::jsonb, '["1"]', false, 2)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'fizzbuzz'), '[3]'::jsonb, '["1","2","Fizz"]', false, 3)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'fizzbuzz'), '[15]'::jsonb, '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', true, 4)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'fizzbuzz'), '[30]'::jsonb, '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz","16","17","Fizz","19","Buzz","Fizz","22","23","Fizz","Buzz","26","Fizz","28","29","FizzBuzz"]', true, 5)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- Unique (difficulty 3, 120 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'unique',
    'go-fundamentals',
    'function',
    'go',
    'Unique',
    'Write a function **`Unique(nums []int) []int`** that removes duplicate values from a slice while preserving the original order of first occurrences.

The Go idiomatic solution uses a `map[int]bool` to track seen values. The comma-ok idiom (`_, ok := m[v]`) lets you check whether a value has been seen before:

    seen := make(map[int]bool)
    for _, v := range nums {
        if !seen[v] {
            seen[v] = true
            result = append(result, v)
        }
    }

The `map[int]bool` pattern is Go''s standard "set" approximation — the boolean value is never read, only written to. Checking `!seen[v]` works because accessing a missing map key returns the zero value (`false` for bool), so the first occurrence is always included.

This approach is O(n) time and O(n) space, which is optimal for this problem. A naive O(n²) approach using nested loops would also work but is significantly slower for large inputs.

For the input `[4, 2, 4, 3, 2, 1]`, the function should return `[4, 2, 3, 1]`.',
    '- 0 <= len(nums) <= 2000
- Each element is in the range -10^5 to 10^5
- The result must preserve the order of first occurrences.',
    'Master the map[type]bool idiom for deduplication — the most common Go set pattern.',
    'Unique',
    '[]int',
    '{"[]int"}',
    '{"Use make(map[int]bool) to track seen values.","Check with if !seen[v] — accessing a missing key returns false.","Always append on first encounter, then mark as seen."}',
    3,
    120,
    '{"go","maps","slices","intermediate"}',
    true,
    'seed-go-fund-unique',
    '## Unique

Remove duplicate values from a slice while preserving the order of first occurrences.

### Why this exercise matters

The `map[K]bool` pattern is Go''s idiomatic replacement for a set data structure. It appears constantly in production Go code for:

1. **Deduplication** — removing duplicate entries from data streams
2. **Membership testing** — "have I seen this before?" lookups
3. **Intersection/union** — set operations between collections
4. **Cycle detection** — tracking visited nodes in graph algorithms

Mastering this pattern is essential for writing efficient Go code.

### Examples

- `Unique([]int{4, 2, 4, 3, 2, 1})` → `[]int{4, 2, 3, 1}`
- `Unique([]int{})` → `[]int{}`
- `Unique([]int{1, 1, 1, 1})` → `[]int{1}`
- `Unique([]int{5, 4, 3, 2, 1})` → `[]int{5, 4, 3, 2, 1}`

### Reference solution

    func Unique(nums []int) []int {
        seen := make(map[int]bool)
        result := make([]int, 0, len(nums))
        for _, v := range nums {
            if !seen[v] {
                seen[v] = true
                result = append(result, v)
            }
        }
        return result
    }',
    '{"go": {"func_name": "Unique", "return_type": "[]int", "param_types": ["[]int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'unique'), '[[4,2,4,3,2,1]]'::jsonb, '[4,2,3,1]', false, 1)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'unique'), '[[]]'::jsonb, '[]', false, 2)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'unique'), '[[1,1,1,1]]'::jsonb, '[1]', false, 3)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'unique'), '[[-3,-1,-3,0,2,0]]'::jsonb, '[-3,-1,0,2]', true, 4)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'unique'), '[[100,200,100,200,300,100]]'::jsonb, '[100,200,300]', true, 5)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- Max and Min (difficulty 2, 100 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'max-min',
    'go-fundamentals',
    'function',
    'go',
    'Max and Min',
    'Write a function **`MaxMin(nums []int) []int`** that takes a slice of integers and returns a new slice containing the maximum and minimum values as a two-element slice `{max, min}`.

Go''s slices are the foundation of most data-processing code. This exercise combines two core patterns: iterating over a slice to find extreme values, and building a result slice.

A convenient Go idiom is to initialize the max and min candidates to the first element, then iterate over the rest:

    if len(nums) == 0 {
        return []int{0, 0}
    }
    max, min := nums[0], nums[0]
    for _, v := range nums[1:] {
        if v > max {
            max = v
        }
        if v < min {
            min = v
        }
    }
    return []int{max, min}

The slice expression `nums[1:]` creates a sub-slice starting at index 1, skipping the first element that was already used for initialization.

For the input `[3, 7, 2, 9, 1]`, the function should return `[]int{9, 1}`.',
    '- 0 <= len(nums) <= 1000
- Each element is in the range -10^5 to 10^5
- An empty slice should return []int{0, 0}.',
    'Learn slice iteration, re-slicing with nums[1:], and building a result slice.',
    'MaxMin',
    '[]int',
    '{"[]int"}',
    '{"Initialize both max and min to the first element nums[0].","Use nums[1:] to skip the first element in the loop.","Return the result as a two-element slice: return []int{max, min}."}',
    2,
    100,
    '{"go","slices","loops","beginner"}',
    true,
    'seed-go-fund-max-min',
    '## Max and Min

Return the maximum and minimum values from a slice as a two-element slice `[]int{max, min}`.

### Why this exercise matters

This exercise teaches three fundamental Go slice patterns in one compact function:

1. **Slice iteration** — `for _, v := range nums`
2. **Slice re-slicing** — `nums[1:]` to skip the first element
3. **Result slice construction** — `return []int{max, min}`

These patterns appear constantly in Go data-processing code, from analytics pipelines to API response builders.

### Examples

- `MaxMin([]int{3, 7, 2, 9, 1})` → `[]int{9, 1}`
- `MaxMin([]int{5})` → `[]int{5, 5}`
- `MaxMin([]int{})` → `[]int{0, 0}`
- `MaxMin([]int{-5, -1, -10, -3})` → `[]int{-1, -10}`

### Reference solution

    func MaxMin(nums []int) []int {
        if len(nums) == 0 {
            return []int{0, 0}
        }
        max, min := nums[0], nums[0]
        for _, v := range nums[1:] {
            if v > max {
                max = v
            }
            if v < min {
                min = v
            }
        }
        return []int{max, min}
    }',
    '{"go": {"func_name": "MaxMin", "return_type": "[]int", "param_types": ["[]int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'max-min'), '[[3,7,2,9,1]]'::jsonb, '[9,1]', false, 1)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'max-min'), '[[5]]'::jsonb, '[5,5]', false, 2)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'max-min'), '[[]]'::jsonb, '[0,0]', false, 3)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'max-min'), '[[-5,-1,-10,-3]]'::jsonb, '[-1,-10]', true, 4)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'max-min'), '[[1000,-1000,500,0,-500]]'::jsonb, '[1000,-1000]', true, 5)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

COMMIT;
