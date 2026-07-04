-- ============================================================================
-- Koder :: Problem Seed Migration (Batch 2)
-- Bit Manipulation / Sorting & Searching / Pointers (15 problems each)
-- Every expected test-case value below is computed programmatically from a
-- Python reference implementation of the intended Go solution before being
-- written into this script, so a correct submission is guaranteed to pass.
-- ============================================================================

BEGIN;

-- ---- bit-manipulation :: Count Set Bits (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'count-set-bits',
    'bit-manipulation',
    'function',
    'go',
    'Count Set Bits',
    '## Count Set Bits

Write a function that returns the number of set bits (1s) in the binary representation of a non-negative integer `n`. This is also known as the Hamming weight of `n`.

**Function signature**

```go
func CountSetBits(n int) int
```

**Examples**

- `CountSetBits(0)` returns `0`
- `CountSetBits(7)` returns `3`

**Constraints**

- 0 <= n <= 2^31 - 1

**Learning objective:** Learn to inspect individual bits of an integer using shifts and masks.',
    'CountSetBits',
    'int',
    '{"int"}',
    '{"A number''s binary representation is a sequence of 0s and 1s — you just need to count the 1s.","You can check the lowest bit with n & 1, then shift n right by one to inspect the next bit.","Keep a counter and repeat until n becomes 0."}',
    1,
    70,
    '{"bit-manipulation","beginner"}',
    true,
    'seed-bit-manipulation-count-set-bits',
    '## Count Set Bits

Write a function that returns the number of set bits (1s) in the binary representation of a non-negative integer `n`. This is also known as the Hamming weight of `n`.

**Function signature**

```go
func CountSetBits(n int) int
```

**Examples**

- `CountSetBits(0)` returns `0`
- `CountSetBits(7)` returns `3`

**Constraints**

- 0 <= n <= 2^31 - 1

**Learning objective:** Learn to inspect individual bits of an integer using shifts and masks.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-set-bits'), '[0]'::jsonb, '0', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-set-bits'), '[7]'::jsonb, '3', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-set-bits'), '[8]'::jsonb, '1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-set-bits'), '[255]'::jsonb, '8', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-set-bits'), '[1023]'::jsonb, '10', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- bit-manipulation :: Power of Two Check (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'is-power-of-two',
    'bit-manipulation',
    'function',
    'go',
    'Power of Two Check',
    '## Power of Two Check

Write a function that determines whether an integer `n` is a power of two, using bitwise operations rather than repeated division.

**Function signature**

```go
func IsPowerOfTwo(n int) bool
```

**Examples**

- `IsPowerOfTwo(1)` returns `true`
- `IsPowerOfTwo(16)` returns `true`

**Constraints**

- -2^31 <= n <= 2^31 - 1

**Learning objective:** Recognize the classic n & (n-1) trick for detecting a single set bit.',
    'IsPowerOfTwo',
    'bool',
    '{"int"}',
    '{"A power of two has exactly one set bit in its binary representation.","The expression n & (n-1) clears the lowest set bit of n — for a power of two, that leaves 0.","Zero and negative numbers are never powers of two, so handle them as a special case first."}',
    1,
    70,
    '{"bit-manipulation","beginner"}',
    true,
    'seed-bit-manipulation-is-power-of-two',
    '## Power of Two Check

Write a function that determines whether an integer `n` is a power of two, using bitwise operations rather than repeated division.

**Function signature**

```go
func IsPowerOfTwo(n int) bool
```

**Examples**

- `IsPowerOfTwo(1)` returns `true`
- `IsPowerOfTwo(16)` returns `true`

**Constraints**

- -2^31 <= n <= 2^31 - 1

**Learning objective:** Recognize the classic n & (n-1) trick for detecting a single set bit.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-power-of-two'), '[1]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-power-of-two'), '[16]'::jsonb, 'true', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-power-of-two'), '[18]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-power-of-two'), '[0]'::jsonb, 'false', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-power-of-two'), '[1024]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- bit-manipulation :: Get Bit at Position (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'get-bit',
    'bit-manipulation',
    'function',
    'go',
    'Get Bit at Position',
    '## Get Bit at Position

Write a function `GetBit(n, pos int) int` that returns the bit of `n` at 0-indexed position `pos` (counting from the least significant bit), as either 0 or 1.

**Function signature**

```go
func GetBit(n int, pos int) int
```

**Examples**

- `GetBit(5, 0)` returns `1`
- `GetBit(5, 1)` returns `0`

**Constraints**

- 0 <= n <= 2^31 - 1
- 0 <= pos <= 30

**Learning objective:** Combine right-shift and mask operations to extract a single bit.',
    'GetBit',
    'int',
    '{"int","int"}',
    '{"Shifting n right by pos moves the bit you care about into the lowest position.","Once the target bit is at position 0, masking with & 1 isolates it.","Bit positions are 0-indexed from the least significant bit."}',
    1,
    70,
    '{"bit-manipulation","beginner"}',
    true,
    'seed-bit-manipulation-get-bit',
    '## Get Bit at Position

Write a function `GetBit(n, pos int) int` that returns the bit of `n` at 0-indexed position `pos` (counting from the least significant bit), as either 0 or 1.

**Function signature**

```go
func GetBit(n int, pos int) int
```

**Examples**

- `GetBit(5, 0)` returns `1`
- `GetBit(5, 1)` returns `0`

**Constraints**

- 0 <= n <= 2^31 - 1
- 0 <= pos <= 30

**Learning objective:** Combine right-shift and mask operations to extract a single bit.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'get-bit'), '[5,0]'::jsonb, '1', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'get-bit'), '[5,1]'::jsonb, '0', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'get-bit'), '[5,2]'::jsonb, '1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'get-bit'), '[8,3]'::jsonb, '1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'get-bit'), '[0,5]'::jsonb, '0', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- bit-manipulation :: Set Bit at Position (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'set-bit',
    'bit-manipulation',
    'function',
    'go',
    'Set Bit at Position',
    '## Set Bit at Position

Write a function `SetBit(n, pos int) int` that returns `n` with the bit at 0-indexed position `pos` set to 1, leaving all other bits unchanged.

**Function signature**

```go
func SetBit(n int, pos int) int
```

**Examples**

- `SetBit(0, 0)` returns `1`
- `SetBit(5, 1)` returns `7`

**Constraints**

- 0 <= n <= 2^31 - 1
- 0 <= pos <= 30

**Learning objective:** Use a shifted mask combined with bitwise OR to modify a single bit deterministically.',
    'SetBit',
    'int',
    '{"int","int"}',
    '{"A left-shifted 1 (1 << pos) is a mask with only the target bit turned on.","OR-ing n with that mask turns the target bit on without disturbing any other bit.","If the bit is already 1, setting it again has no effect — that''s expected."}',
    2,
    110,
    '{"bit-manipulation"}',
    true,
    'seed-bit-manipulation-set-bit',
    '## Set Bit at Position

Write a function `SetBit(n, pos int) int` that returns `n` with the bit at 0-indexed position `pos` set to 1, leaving all other bits unchanged.

**Function signature**

```go
func SetBit(n int, pos int) int
```

**Examples**

- `SetBit(0, 0)` returns `1`
- `SetBit(5, 1)` returns `7`

**Constraints**

- 0 <= n <= 2^31 - 1
- 0 <= pos <= 30

**Learning objective:** Use a shifted mask combined with bitwise OR to modify a single bit deterministically.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'set-bit'), '[0,0]'::jsonb, '1', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'set-bit'), '[5,1]'::jsonb, '7', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'set-bit'), '[8,0]'::jsonb, '9', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'set-bit'), '[16,4]'::jsonb, '16', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'set-bit'), '[1,3]'::jsonb, '9', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- bit-manipulation :: Clear Bit at Position (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'clear-bit',
    'bit-manipulation',
    'function',
    'go',
    'Clear Bit at Position',
    '## Clear Bit at Position

Write a function `ClearBit(n, pos int) int` that returns `n` with the bit at 0-indexed position `pos` cleared to 0, leaving all other bits unchanged.

**Function signature**

```go
func ClearBit(n int, pos int) int
```

**Examples**

- `ClearBit(5, 0)` returns `4`
- `ClearBit(7, 1)` returns `5`

**Constraints**

- 0 <= n <= 2^31 - 1
- 0 <= pos <= 30

**Learning objective:** Use an inverted, shifted mask combined with bitwise AND to force a single bit to 0.',
    'ClearBit',
    'int',
    '{"int","int"}',
    '{"A left-shifted 1 (1 << pos) marks the target bit; inverting that mask marks every other bit instead.","AND-ing n with the inverted mask forces the target bit to 0 while leaving everything else untouched.","If the target bit is already 0, clearing it again has no effect."}',
    2,
    110,
    '{"bit-manipulation"}',
    true,
    'seed-bit-manipulation-clear-bit',
    '## Clear Bit at Position

Write a function `ClearBit(n, pos int) int` that returns `n` with the bit at 0-indexed position `pos` cleared to 0, leaving all other bits unchanged.

**Function signature**

```go
func ClearBit(n int, pos int) int
```

**Examples**

- `ClearBit(5, 0)` returns `4`
- `ClearBit(7, 1)` returns `5`

**Constraints**

- 0 <= n <= 2^31 - 1
- 0 <= pos <= 30

**Learning objective:** Use an inverted, shifted mask combined with bitwise AND to force a single bit to 0.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'clear-bit'), '[5,0]'::jsonb, '4', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'clear-bit'), '[7,1]'::jsonb, '5', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'clear-bit'), '[8,3]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'clear-bit'), '[255,4]'::jsonb, '239', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'clear-bit'), '[1,0]'::jsonb, '0', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- bit-manipulation :: Toggle Bit at Position (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'toggle-bit',
    'bit-manipulation',
    'function',
    'go',
    'Toggle Bit at Position',
    '## Toggle Bit at Position

Write a function `ToggleBit(n, pos int) int` that returns `n` with the bit at 0-indexed position `pos` flipped: 0 becomes 1 and 1 becomes 0, while all other bits stay the same.

**Function signature**

```go
func ToggleBit(n int, pos int) int
```

**Examples**

- `ToggleBit(5, 0)` returns `4`
- `ToggleBit(5, 1)` returns `7`

**Constraints**

- 0 <= n <= 2^31 - 1
- 0 <= pos <= 30

**Learning objective:** Use bitwise XOR with a shifted mask to flip a single targeted bit.',
    'ToggleBit',
    'int',
    '{"int","int"}',
    '{"XOR-ing a bit with 1 flips it: 0 becomes 1, and 1 becomes 0.","A left-shifted 1 (1 << pos) isolates the target bit so only that bit is affected.","XOR-ing n with the shifted mask toggles exactly that one bit."}',
    2,
    110,
    '{"bit-manipulation"}',
    true,
    'seed-bit-manipulation-toggle-bit',
    '## Toggle Bit at Position

Write a function `ToggleBit(n, pos int) int` that returns `n` with the bit at 0-indexed position `pos` flipped: 0 becomes 1 and 1 becomes 0, while all other bits stay the same.

**Function signature**

```go
func ToggleBit(n int, pos int) int
```

**Examples**

- `ToggleBit(5, 0)` returns `4`
- `ToggleBit(5, 1)` returns `7`

**Constraints**

- 0 <= n <= 2^31 - 1
- 0 <= pos <= 30

**Learning objective:** Use bitwise XOR with a shifted mask to flip a single targeted bit.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'toggle-bit'), '[5,0]'::jsonb, '4', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'toggle-bit'), '[5,1]'::jsonb, '7', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'toggle-bit'), '[0,3]'::jsonb, '8', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'toggle-bit'), '[15,2]'::jsonb, '11', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'toggle-bit'), '[255,7]'::jsonb, '127', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- bit-manipulation :: Swap Two Numbers Using XOR (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'swap-xor',
    'bit-manipulation',
    'function',
    'go',
    'Swap Two Numbers Using XOR',
    '## Swap Two Numbers Using XOR

Write a function `SwapXOR(a, b int) []int` that returns `[a, b]` after conceptually swapping their values using only XOR operations (no temporary variable, no arithmetic addition/subtraction).

**Function signature**

```go
func SwapXOR(a int, b int) []int
```

**Examples**

- `SwapXOR(3, 5)` returns `[5, 3]`
- `SwapXOR(0, 7)` returns `[7, 0]`

**Constraints**

- -10^6 <= a, b <= 10^6

**Learning objective:** Understand why XOR is its own inverse, and how that property enables swapping without extra storage.',
    'SwapXOR',
    '[]int',
    '{"int","int"}',
    '{"The XOR swap trick avoids a temporary variable: a = a^b, then b = a^b, then a = a^b.","Trace through the three assignments carefully — after the first, a holds the XOR of the originals.","Return the two values in the order [swapped-a, swapped-b], i.e. [original-b, original-a]."}',
    3,
    150,
    '{"bit-manipulation","classic-trick"}',
    true,
    'seed-bit-manipulation-swap-xor',
    '## Swap Two Numbers Using XOR

Write a function `SwapXOR(a, b int) []int` that returns `[a, b]` after conceptually swapping their values using only XOR operations (no temporary variable, no arithmetic addition/subtraction).

**Function signature**

```go
func SwapXOR(a int, b int) []int
```

**Examples**

- `SwapXOR(3, 5)` returns `[5, 3]`
- `SwapXOR(0, 7)` returns `[7, 0]`

**Constraints**

- -10^6 <= a, b <= 10^6

**Learning objective:** Understand why XOR is its own inverse, and how that property enables swapping without extra storage.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'swap-xor'), '[3,5]'::jsonb, '[5,3]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'swap-xor'), '[0,7]'::jsonb, '[7,0]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'swap-xor'), '[-2,9]'::jsonb, '[9,-2]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'swap-xor'), '[100,100]'::jsonb, '[100,100]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'swap-xor'), '[-5,-9]'::jsonb, '[-9,-5]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- bit-manipulation :: Single Number (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'single-number',
    'bit-manipulation',
    'function',
    'go',
    'Single Number',
    '## Single Number

Every element in a slice `nums` appears exactly twice, except for one element which appears exactly once. Write a function that finds and returns that single element, using O(1) extra space.

**Function signature**

```go
func SingleNumber(nums []int) int
```

**Examples**

- `SingleNumber([2, 2, 1])` returns `1`
- `SingleNumber([4, 1, 2, 1, 2])` returns `4`

**Constraints**

- 1 <= len(nums) <= 10000

**Learning objective:** Apply the self-cancelling property of XOR to solve a search problem without extra memory.',
    'SingleNumber',
    'int',
    '{"[]int"}',
    '{"XOR-ing a number with itself always yields 0, and XOR-ing with 0 leaves a number unchanged.","If every value except one appears exactly twice, XOR-ing the entire slice together cancels all the pairs out.","Whatever remains after XOR-ing everything is the single non-paired value."}',
    3,
    150,
    '{"bit-manipulation","arrays"}',
    true,
    'seed-bit-manipulation-single-number',
    '## Single Number

Every element in a slice `nums` appears exactly twice, except for one element which appears exactly once. Write a function that finds and returns that single element, using O(1) extra space.

**Function signature**

```go
func SingleNumber(nums []int) int
```

**Examples**

- `SingleNumber([2, 2, 1])` returns `1`
- `SingleNumber([4, 1, 2, 1, 2])` returns `4`

**Constraints**

- 1 <= len(nums) <= 10000

**Learning objective:** Apply the self-cancelling property of XOR to solve a search problem without extra memory.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'single-number'), '[[2,2,1]]'::jsonb, '1', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'single-number'), '[[4,1,2,1,2]]'::jsonb, '4', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'single-number'), '[[1]]'::jsonb, '1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'single-number'), '[[7,3,7,3,9]]'::jsonb, '9', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'single-number'), '[[10,20,10]]'::jsonb, '20', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- bit-manipulation :: Hamming Distance (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'hamming-distance',
    'bit-manipulation',
    'function',
    'go',
    'Hamming Distance',
    '## Hamming Distance

Write a function `HammingDistance(a, b int) int` that returns the number of bit positions at which the binary representations of `a` and `b` differ.

**Function signature**

```go
func HammingDistance(a int, b int) int
```

**Examples**

- `HammingDistance(1, 4)` returns `2`
- `HammingDistance(3, 1)` returns `1`

**Constraints**

- 0 <= a, b <= 2^31 - 1

**Learning objective:** Combine XOR (to find differing bits) with bit-counting (to tally them) into a two-step technique.',
    'HammingDistance',
    'int',
    '{"int","int"}',
    '{"The Hamming distance between two integers is the number of bit positions where they differ.","XOR-ing the two numbers produces a 1 at exactly the positions where they differ, and 0 elsewhere.","Counting the set bits of that XOR result gives the answer directly."}',
    3,
    150,
    '{"bit-manipulation"}',
    true,
    'seed-bit-manipulation-hamming-distance',
    '## Hamming Distance

Write a function `HammingDistance(a, b int) int` that returns the number of bit positions at which the binary representations of `a` and `b` differ.

**Function signature**

```go
func HammingDistance(a int, b int) int
```

**Examples**

- `HammingDistance(1, 4)` returns `2`
- `HammingDistance(3, 1)` returns `1`

**Constraints**

- 0 <= a, b <= 2^31 - 1

**Learning objective:** Combine XOR (to find differing bits) with bit-counting (to tally them) into a two-step technique.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'hamming-distance'), '[1,4]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'hamming-distance'), '[3,1]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'hamming-distance'), '[0,0]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'hamming-distance'), '[255,0]'::jsonb, '8', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'hamming-distance'), '[1023,1]'::jsonb, '9', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- bit-manipulation :: Reverse an 8-Bit Number (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'reverse-bits-8',
    'bit-manipulation',
    'function',
    'go',
    'Reverse an 8-Bit Number',
    '## Reverse an 8-Bit Number

Write a function `ReverseBits8(n int) int` that treats `n` as an 8-bit unsigned integer and returns the value obtained by reversing the order of its 8 bits.

**Function signature**

```go
func ReverseBits8(n int) int
```

**Examples**

- `ReverseBits8(1)` returns `128`
- `ReverseBits8(128)` returns `1`

**Constraints**

- 0 <= n <= 255

**Learning objective:** Work with a fixed-width bit pattern, a stepping stone toward general 32/64-bit bit-reversal routines.',
    'ReverseBits8',
    'int',
    '{"int"}',
    '{"Represent n as an 8-bit binary string, padded with leading zeroes, so every reversal is unambiguous.","Reversing the string of bits gives you the new bit pattern directly.","Parse the reversed bit string back into an integer using base 2."}',
    4,
    190,
    '{"bit-manipulation"}',
    true,
    'seed-bit-manipulation-reverse-bits-8',
    '## Reverse an 8-Bit Number

Write a function `ReverseBits8(n int) int` that treats `n` as an 8-bit unsigned integer and returns the value obtained by reversing the order of its 8 bits.

**Function signature**

```go
func ReverseBits8(n int) int
```

**Examples**

- `ReverseBits8(1)` returns `128`
- `ReverseBits8(128)` returns `1`

**Constraints**

- 0 <= n <= 255

**Learning objective:** Work with a fixed-width bit pattern, a stepping stone toward general 32/64-bit bit-reversal routines.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-bits-8'), '[1]'::jsonb, '128', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-bits-8'), '[128]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-bits-8'), '[0]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-bits-8'), '[170]'::jsonb, '85', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-bits-8'), '[255]'::jsonb, '255', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- bit-manipulation :: Alternating Bits (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'is-alternating-bits',
    'bit-manipulation',
    'function',
    'go',
    'Alternating Bits',
    '## Alternating Bits

Write a function that determines whether the binary representation of a positive integer `n` has alternating bits — meaning no two adjacent bits have the same value.

**Function signature**

```go
func IsAlternatingBits(n int) bool
```

**Examples**

- `IsAlternatingBits(5)` returns `true`
- `IsAlternatingBits(7)` returns `false`

**Constraints**

- 1 <= n <= 2^31 - 1

**Learning objective:** Reformulate an adjacency condition on bits as a comparison you can check with shifts and XOR.',
    'IsAlternatingBits',
    'bool',
    '{"int"}',
    '{"Look at the binary representation of n without any leading zeroes.","Alternating means every adjacent pair of bits differs: 0 next to 1, or 1 next to 0.","You can check this by comparing n''s bits to a right-shifted copy of n using XOR — if the pattern truly alternates, that XOR produces all 1s across the relevant width."}',
    4,
    190,
    '{"bit-manipulation"}',
    true,
    'seed-bit-manipulation-is-alternating-bits',
    '## Alternating Bits

Write a function that determines whether the binary representation of a positive integer `n` has alternating bits — meaning no two adjacent bits have the same value.

**Function signature**

```go
func IsAlternatingBits(n int) bool
```

**Examples**

- `IsAlternatingBits(5)` returns `true`
- `IsAlternatingBits(7)` returns `false`

**Constraints**

- 1 <= n <= 2^31 - 1

**Learning objective:** Reformulate an adjacency condition on bits as a comparison you can check with shifts and XOR.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-alternating-bits'), '[5]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-alternating-bits'), '[7]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-alternating-bits'), '[11]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-alternating-bits'), '[10]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-alternating-bits'), '[2]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- bit-manipulation :: Missing Number (XOR Approach) (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'missing-number-xor',
    'bit-manipulation',
    'function',
    'go',
    'Missing Number (XOR Approach)',
    '## Missing Number (XOR Approach)

A slice `nums` contains `n` distinct integers taken from the range `[0, n]`, meaning exactly one value in that range is missing from `nums`. Write a function that finds the missing value using XOR, in O(n) time and O(1) extra space.

**Function signature**

```go
func MissingNumberXOR(nums []int) int
```

**Examples**

- `MissingNumberXOR([3, 0, 1])` returns `2`
- `MissingNumberXOR([0, 1])` returns `2`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Extend the single-number XOR trick to a range-based missing-element search.',
    'MissingNumberXOR',
    'int',
    '{"[]int"}',
    '{"A slice of length n containing distinct values from the range 0..n is missing exactly one value from that range.","XOR-ing every index from 0 to n together with every value in the slice cancels out every value that''s present.","Whatever value survives the cancellation is the missing number."}',
    4,
    190,
    '{"bit-manipulation","arrays"}',
    true,
    'seed-bit-manipulation-missing-number-xor',
    '## Missing Number (XOR Approach)

A slice `nums` contains `n` distinct integers taken from the range `[0, n]`, meaning exactly one value in that range is missing from `nums`. Write a function that finds the missing value using XOR, in O(n) time and O(1) extra space.

**Function signature**

```go
func MissingNumberXOR(nums []int) int
```

**Examples**

- `MissingNumberXOR([3, 0, 1])` returns `2`
- `MissingNumberXOR([0, 1])` returns `2`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Extend the single-number XOR trick to a range-based missing-element search.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'missing-number-xor'), '[[3,0,1]]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'missing-number-xor'), '[[0,1]]'::jsonb, '2', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'missing-number-xor'), '[[9,6,4,2,3,5,7,0,1]]'::jsonb, '8', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'missing-number-xor'), '[[0]]'::jsonb, '1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'missing-number-xor'), '[[1,0]]'::jsonb, '2', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- bit-manipulation :: Total Set Bits from 1 to N (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'count-set-bits-up-to',
    'bit-manipulation',
    'function',
    'go',
    'Total Set Bits from 1 to N',
    '## Total Set Bits from 1 to N

Write a function `CountSetBitsUpTo(n int) int` that returns the total number of set bits across the binary representations of every integer from 1 to `n` (inclusive). Return 0 if `n` is 0.

**Function signature**

```go
func CountSetBitsUpTo(n int) int
```

**Examples**

- `CountSetBitsUpTo(0)` returns `0`
- `CountSetBitsUpTo(1)` returns `1`

**Constraints**

- 0 <= n <= 100000

**Learning objective:** Extend a single-number bit-counting routine into an aggregate computation over a range.',
    'CountSetBitsUpTo',
    'int',
    '{"int"}',
    '{"A brute-force approach counts the set bits of every integer from 1 to n and sums them.","For each number, its set-bit count can be found the same way as in the basic Hamming weight problem.","Larger inputs reward smarter approaches (such as a per-bit-position counting formula), but a correct brute-force result is what''s being verified here."}',
    5,
    220,
    '{"bit-manipulation","math"}',
    true,
    'seed-bit-manipulation-count-set-bits-up-to',
    '## Total Set Bits from 1 to N

Write a function `CountSetBitsUpTo(n int) int` that returns the total number of set bits across the binary representations of every integer from 1 to `n` (inclusive). Return 0 if `n` is 0.

**Function signature**

```go
func CountSetBitsUpTo(n int) int
```

**Examples**

- `CountSetBitsUpTo(0)` returns `0`
- `CountSetBitsUpTo(1)` returns `1`

**Constraints**

- 0 <= n <= 100000

**Learning objective:** Extend a single-number bit-counting routine into an aggregate computation over a range.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-set-bits-up-to'), '[0]'::jsonb, '0', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-set-bits-up-to'), '[1]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-set-bits-up-to'), '[5]'::jsonb, '7', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-set-bits-up-to'), '[16]'::jsonb, '33', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-set-bits-up-to'), '[100]'::jsonb, '319', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- bit-manipulation :: Two Single Numbers (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'two-single-numbers',
    'bit-manipulation',
    'function',
    'go',
    'Two Single Numbers',
    '## Two Single Numbers

Every element in a slice `nums` appears exactly twice, except for exactly two elements which each appear exactly once. Write a function that returns those two elements, sorted in ascending order, using O(1) extra space beyond the output.

**Function signature**

```go
func TwoSingleNumbers(nums []int) []int
```

**Examples**

- `TwoSingleNumbers([1, 2, 1, 3, 2, 5])` returns `[3, 5]`
- `TwoSingleNumbers([4, 1, 4, 2])` returns `[1, 2]`

**Constraints**

- 2 <= len(nums) <= 10000

**Learning objective:** Extend the XOR single-number trick to separate two unknowns using a bit-partitioning strategy.',
    'TwoSingleNumbers',
    '[]int',
    '{"[]int"}',
    '{"XOR-ing the whole slice cancels every pair, leaving the XOR of the two unique values.","Any set bit in that combined XOR must differ between the two unique values — pick the lowest such bit as a partition key.","Split the slice into two groups based on that bit, and XOR each group separately to isolate one unique value per group."}',
    5,
    220,
    '{"bit-manipulation","arrays"}',
    true,
    'seed-bit-manipulation-two-single-numbers',
    '## Two Single Numbers

Every element in a slice `nums` appears exactly twice, except for exactly two elements which each appear exactly once. Write a function that returns those two elements, sorted in ascending order, using O(1) extra space beyond the output.

**Function signature**

```go
func TwoSingleNumbers(nums []int) []int
```

**Examples**

- `TwoSingleNumbers([1, 2, 1, 3, 2, 5])` returns `[3, 5]`
- `TwoSingleNumbers([4, 1, 4, 2])` returns `[1, 2]`

**Constraints**

- 2 <= len(nums) <= 10000

**Learning objective:** Extend the XOR single-number trick to separate two unknowns using a bit-partitioning strategy.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'two-single-numbers'), '[[1,2,1,3,2,5]]'::jsonb, '[3,5]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'two-single-numbers'), '[[4,1,4,2]]'::jsonb, '[1,2]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'two-single-numbers'), '[[0,1]]'::jsonb, '[0,1]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'two-single-numbers'), '[[10,20,10,30,40,20]]'::jsonb, '[30,40]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'two-single-numbers'), '[[-1,-2,-1,5]]'::jsonb, '[-2,5]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- bit-manipulation :: Sum of Subset XOR Totals (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'subset-xor-sum',
    'bit-manipulation',
    'function',
    'go',
    'Sum of Subset XOR Totals',
    '## Sum of Subset XOR Totals

For a slice `nums`, the XOR total of a subset is the XOR of all its elements (0 for the empty subset). Write a function that returns the sum, over every possible subset of `nums`, of that subset''s XOR total.

**Function signature**

```go
func SubsetXORSum(nums []int) int
```

**Examples**

- `SubsetXORSum([1, 3])` returns `6`
- `SubsetXORSum([5, 1, 6])` returns `28`

**Constraints**

- 0 <= len(nums) <= 12
- 0 <= nums[i] <= 1000

**Learning objective:** Practice enumerating all subsets of a collection using bitmasking over indices.',
    'SubsetXORSum',
    'int',
    '{"[]int"}',
    '{"Every subset of the slice, including the empty subset, contributes one XOR value to the total.","A subset can be represented as a bitmask over the slice''s indices: bit i set means element i is included.","Enumerating all 2^n bitmasks and XOR-ing the selected elements for each one gives every subset''s XOR value directly."}',
    5,
    220,
    '{"bit-manipulation","recursion"}',
    true,
    'seed-bit-manipulation-subset-xor-sum',
    '## Sum of Subset XOR Totals

For a slice `nums`, the XOR total of a subset is the XOR of all its elements (0 for the empty subset). Write a function that returns the sum, over every possible subset of `nums`, of that subset''s XOR total.

**Function signature**

```go
func SubsetXORSum(nums []int) int
```

**Examples**

- `SubsetXORSum([1, 3])` returns `6`
- `SubsetXORSum([5, 1, 6])` returns `28`

**Constraints**

- 0 <= len(nums) <= 12
- 0 <= nums[i] <= 1000

**Learning objective:** Practice enumerating all subsets of a collection using bitmasking over indices.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'subset-xor-sum'), '[[1,3]]'::jsonb, '6', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'subset-xor-sum'), '[[5,1,6]]'::jsonb, '28', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'subset-xor-sum'), '[[]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'subset-xor-sum'), '[[3,4,5,6,7,8]]'::jsonb, '480', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'subset-xor-sum'), '[[1]]'::jsonb, '1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- sorting-searching :: Bubble Sort (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'bubble-sort',
    'sorting-searching',
    'function',
    'go',
    'Bubble Sort',
    '## Bubble Sort

Write a function that sorts a slice of integers `nums` in ascending order using the bubble sort algorithm, and returns the sorted slice.

**Function signature**

```go
func BubbleSort(nums []int) []int
```

**Examples**

- `BubbleSort([5, 2, 4, 1, 3])` returns `[1, 2, 3, 4, 5]`
- `BubbleSort([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 5000

**Learning objective:** Understand the mechanics of the simplest comparison-based sorting algorithm.',
    'BubbleSort',
    '[]int',
    '{"[]int"}',
    '{"Repeatedly compare adjacent elements and swap them if they''re in the wrong order.","After each full pass through the slice, the largest unsorted element ''bubbles up'' to its correct position at the end.","You can stop early once a full pass makes no swaps — the slice is already sorted."}',
    1,
    70,
    '{"sorting","beginner"}',
    true,
    'seed-sorting-searching-bubble-sort',
    '## Bubble Sort

Write a function that sorts a slice of integers `nums` in ascending order using the bubble sort algorithm, and returns the sorted slice.

**Function signature**

```go
func BubbleSort(nums []int) []int
```

**Examples**

- `BubbleSort([5, 2, 4, 1, 3])` returns `[1, 2, 3, 4, 5]`
- `BubbleSort([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 5000

**Learning objective:** Understand the mechanics of the simplest comparison-based sorting algorithm.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'bubble-sort'), '[[5,2,4,1,3]]'::jsonb, '[1,2,3,4,5]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'bubble-sort'), '[[]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'bubble-sort'), '[[1]]'::jsonb, '[1]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'bubble-sort'), '[[3,3,2,1,2]]'::jsonb, '[1,2,2,3,3]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'bubble-sort'), '[[9,8,7,6,5]]'::jsonb, '[5,6,7,8,9]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- sorting-searching :: Selection Sort (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'selection-sort',
    'sorting-searching',
    'function',
    'go',
    'Selection Sort',
    '## Selection Sort

Write a function that sorts a slice of integers `nums` in ascending order using the selection sort algorithm, and returns the sorted slice.

**Function signature**

```go
func SelectionSort(nums []int) []int
```

**Examples**

- `SelectionSort([64, 25, 12, 22, 11])` returns `[11, 12, 22, 25, 64]`
- `SelectionSort([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 5000

**Learning objective:** Practice the repeated-selection-of-minimum pattern that defines selection sort.',
    'SelectionSort',
    '[]int',
    '{"[]int"}',
    '{"On each pass, scan the unsorted portion of the slice to find its minimum value.","Swap that minimum into the front of the unsorted portion, growing the sorted prefix by one.","Repeat until the unsorted portion has at most one element left."}',
    1,
    70,
    '{"sorting","beginner"}',
    true,
    'seed-sorting-searching-selection-sort',
    '## Selection Sort

Write a function that sorts a slice of integers `nums` in ascending order using the selection sort algorithm, and returns the sorted slice.

**Function signature**

```go
func SelectionSort(nums []int) []int
```

**Examples**

- `SelectionSort([64, 25, 12, 22, 11])` returns `[11, 12, 22, 25, 64]`
- `SelectionSort([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 5000

**Learning objective:** Practice the repeated-selection-of-minimum pattern that defines selection sort.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'selection-sort'), '[[64,25,12,22,11]]'::jsonb, '[11,12,22,25,64]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'selection-sort'), '[[]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'selection-sort'), '[[1,2]]'::jsonb, '[1,2]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'selection-sort'), '[[5,5,5,5]]'::jsonb, '[5,5,5,5]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'selection-sort'), '[[-3,-1,-7,2]]'::jsonb, '[-7,-3,-1,2]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- sorting-searching :: Linear Search (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'linear-search',
    'sorting-searching',
    'function',
    'go',
    'Linear Search',
    '## Linear Search

Write a function `LinearSearch(nums []int, target int) int` that returns the index of the first occurrence of `target` in `nums`, scanning from left to right, or -1 if `target` is not present.

**Function signature**

```go
func LinearSearch(nums []int, target int) int
```

**Examples**

- `LinearSearch([4, 2, 7, 1], 7)` returns `2`
- `LinearSearch([1, 2, 3], 9)` returns `-1`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Establish the baseline O(n) search technique that binary search improves upon for sorted data.',
    'LinearSearch',
    'int',
    '{"[]int","int"}',
    '{"Check each element one at a time, from the beginning of the slice.","Return the index the moment you find a match — there''s no need to keep scanning.","If you reach the end without finding the target, return -1."}',
    1,
    70,
    '{"searching","beginner"}',
    true,
    'seed-sorting-searching-linear-search',
    '## Linear Search

Write a function `LinearSearch(nums []int, target int) int` that returns the index of the first occurrence of `target` in `nums`, scanning from left to right, or -1 if `target` is not present.

**Function signature**

```go
func LinearSearch(nums []int, target int) int
```

**Examples**

- `LinearSearch([4, 2, 7, 1], 7)` returns `2`
- `LinearSearch([1, 2, 3], 9)` returns `-1`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Establish the baseline O(n) search technique that binary search improves upon for sorted data.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'linear-search'), '[[4,2,7,1],7]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'linear-search'), '[[1,2,3],9]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'linear-search'), '[[],5]'::jsonb, '-1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'linear-search'), '[[5,5,5],5]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'linear-search'), '[[10,20,30,40],40]'::jsonb, '3', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- sorting-searching :: Insertion Sort (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'insertion-sort',
    'sorting-searching',
    'function',
    'go',
    'Insertion Sort',
    '## Insertion Sort

Write a function that sorts a slice of integers `nums` in ascending order using the insertion sort algorithm, and returns the sorted slice.

**Function signature**

```go
func InsertionSort(nums []int) []int
```

**Examples**

- `InsertionSort([12, 11, 13, 5, 6])` returns `[5, 6, 11, 12, 13]`
- `InsertionSort([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 5000

**Learning objective:** Understand why insertion sort performs well on nearly-sorted data despite its worst-case O(n^2) cost.',
    'InsertionSort',
    '[]int',
    '{"[]int"}',
    '{"Build up a sorted prefix one element at a time, starting from a single-element prefix.","For each new element, shift larger elements in the sorted prefix to the right to make room for it.","Insert the new element into the gap you just created."}',
    2,
    110,
    '{"sorting"}',
    true,
    'seed-sorting-searching-insertion-sort',
    '## Insertion Sort

Write a function that sorts a slice of integers `nums` in ascending order using the insertion sort algorithm, and returns the sorted slice.

**Function signature**

```go
func InsertionSort(nums []int) []int
```

**Examples**

- `InsertionSort([12, 11, 13, 5, 6])` returns `[5, 6, 11, 12, 13]`
- `InsertionSort([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 5000

**Learning objective:** Understand why insertion sort performs well on nearly-sorted data despite its worst-case O(n^2) cost.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'insertion-sort'), '[[12,11,13,5,6]]'::jsonb, '[5,6,11,12,13]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'insertion-sort'), '[[]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'insertion-sort'), '[[1]]'::jsonb, '[1]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'insertion-sort'), '[[2,1]]'::jsonb, '[1,2]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'insertion-sort'), '[[4,3,2,1,0]]'::jsonb, '[0,1,2,3,4]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- sorting-searching :: Search Insert Position (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'search-insert-position',
    'sorting-searching',
    'function',
    'go',
    'Search Insert Position',
    '## Search Insert Position

Write a function `SearchInsertPosition(nums []int, target int) int` that returns the index where `target` is found in the sorted slice `nums`, or the index where it would be inserted to keep `nums` sorted if it isn''t present.

**Function signature**

```go
func SearchInsertPosition(nums []int, target int) int
```

**Examples**

- `SearchInsertPosition([1, 3, 5, 6], 5)` returns `2`
- `SearchInsertPosition([1, 3, 5, 6], 2)` returns `1`

**Constraints**

- 0 <= len(nums) <= 10000
- nums is sorted in ascending order with no duplicates

**Learning objective:** Adapt binary search to answer an insertion-point question rather than a simple membership question.',
    'SearchInsertPosition',
    'int',
    '{"[]int","int"}',
    '{"Because the slice is sorted, binary search can find the correct insertion point in O(log n).","If the target is present, its own index is a valid insertion point.","The insertion point is always the count of elements strictly less than the target."}',
    2,
    110,
    '{"searching","binary-search"}',
    true,
    'seed-sorting-searching-search-insert-position',
    '## Search Insert Position

Write a function `SearchInsertPosition(nums []int, target int) int` that returns the index where `target` is found in the sorted slice `nums`, or the index where it would be inserted to keep `nums` sorted if it isn''t present.

**Function signature**

```go
func SearchInsertPosition(nums []int, target int) int
```

**Examples**

- `SearchInsertPosition([1, 3, 5, 6], 5)` returns `2`
- `SearchInsertPosition([1, 3, 5, 6], 2)` returns `1`

**Constraints**

- 0 <= len(nums) <= 10000
- nums is sorted in ascending order with no duplicates

**Learning objective:** Adapt binary search to answer an insertion-point question rather than a simple membership question.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'search-insert-position'), '[[1,3,5,6],5]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'search-insert-position'), '[[1,3,5,6],2]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'search-insert-position'), '[[1,3,5,6],7]'::jsonb, '4', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'search-insert-position'), '[[],3]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'search-insert-position'), '[[1,3,5,6],0]'::jsonb, '0', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- sorting-searching :: First and Last Position in Sorted Array (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'find-first-last',
    'sorting-searching',
    'function',
    'go',
    'First and Last Position in Sorted Array',
    '## First and Last Position in Sorted Array

Write a function `FindFirstLast(nums []int, target int) []int` that returns a two-element slice `[first, last]` giving the first and last index of `target` in the sorted slice `nums`. If `target` does not appear, return `[-1, -1]`.

**Function signature**

```go
func FindFirstLast(nums []int, target int) []int
```

**Examples**

- `FindFirstLast([5, 7, 7, 8, 8, 10], 8)` returns `[3, 4]`
- `FindFirstLast([5, 7, 7, 8, 8, 10], 6)` returns `[-1, -1]`

**Constraints**

- 0 <= len(nums) <= 10000
- nums is sorted in ascending order

**Learning objective:** Apply binary search twice with slightly different tie-breaking rules to bound a range of duplicates.',
    'FindFirstLast',
    '[]int',
    '{"[]int","int"}',
    '{"Two separate binary searches can find the leftmost and rightmost occurrence of the target respectively.","The leftmost occurrence is the smallest index whose value is not less than the target.","If the target isn''t present at all, both positions should be reported as -1."}',
    2,
    110,
    '{"searching","binary-search"}',
    true,
    'seed-sorting-searching-find-first-last',
    '## First and Last Position in Sorted Array

Write a function `FindFirstLast(nums []int, target int) []int` that returns a two-element slice `[first, last]` giving the first and last index of `target` in the sorted slice `nums`. If `target` does not appear, return `[-1, -1]`.

**Function signature**

```go
func FindFirstLast(nums []int, target int) []int
```

**Examples**

- `FindFirstLast([5, 7, 7, 8, 8, 10], 8)` returns `[3, 4]`
- `FindFirstLast([5, 7, 7, 8, 8, 10], 6)` returns `[-1, -1]`

**Constraints**

- 0 <= len(nums) <= 10000
- nums is sorted in ascending order

**Learning objective:** Apply binary search twice with slightly different tie-breaking rules to bound a range of duplicates.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-first-last'), '[[5,7,7,8,8,10],8]'::jsonb, '[3,4]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-first-last'), '[[5,7,7,8,8,10],6]'::jsonb, '[-1,-1]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-first-last'), '[[],0]'::jsonb, '[-1,-1]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-first-last'), '[[2,2,2,2],2]'::jsonb, '[0,3]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-first-last'), '[[1,2,3],3]'::jsonb, '[2,2]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- sorting-searching :: Merge Sort (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'merge-sort',
    'sorting-searching',
    'function',
    'go',
    'Merge Sort',
    '## Merge Sort

Write a function that sorts a slice of integers `nums` in ascending order using the merge sort algorithm (divide, recursively sort, then merge), and returns the sorted slice.

**Function signature**

```go
func MergeSort(nums []int) []int
```

**Examples**

- `MergeSort([38, 27, 43, 3, 9, 82, 10])` returns `[3, 9, 10, 27, 38, 43, 82]`
- `MergeSort([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 5000

**Learning objective:** Implement a classic divide-and-conquer algorithm with guaranteed O(n log n) performance.',
    'MergeSort',
    '[]int',
    '{"[]int"}',
    '{"Split the slice in half, sort each half recursively, then merge the two sorted halves.","The merge step walks both halves with a pointer each, always taking the smaller of the two current elements.","A slice of length 0 or 1 is already sorted — that''s your base case."}',
    3,
    150,
    '{"sorting","recursion","divide-and-conquer"}',
    true,
    'seed-sorting-searching-merge-sort',
    '## Merge Sort

Write a function that sorts a slice of integers `nums` in ascending order using the merge sort algorithm (divide, recursively sort, then merge), and returns the sorted slice.

**Function signature**

```go
func MergeSort(nums []int) []int
```

**Examples**

- `MergeSort([38, 27, 43, 3, 9, 82, 10])` returns `[3, 9, 10, 27, 38, 43, 82]`
- `MergeSort([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 5000

**Learning objective:** Implement a classic divide-and-conquer algorithm with guaranteed O(n log n) performance.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-sort'), '[[38,27,43,3,9,82,10]]'::jsonb, '[3,9,10,27,38,43,82]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-sort'), '[[]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-sort'), '[[1]]'::jsonb, '[1]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-sort'), '[[5,4,3,2,1]]'::jsonb, '[1,2,3,4,5]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-sort'), '[[1,1,1]]'::jsonb, '[1,1,1]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- sorting-searching :: Quick Sort (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'quick-sort',
    'sorting-searching',
    'function',
    'go',
    'Quick Sort',
    '## Quick Sort

Write a function that sorts a slice of integers `nums` in ascending order using the quick sort algorithm (partition around a pivot, then recursively sort each side), and returns the sorted slice.

**Function signature**

```go
func QuickSort(nums []int) []int
```

**Examples**

- `QuickSort([10, 7, 8, 9, 1, 5])` returns `[1, 5, 7, 8, 9, 10]`
- `QuickSort([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 5000

**Learning objective:** Implement a partition-based divide-and-conquer sort and reason about pivot choice.',
    'QuickSort',
    '[]int',
    '{"[]int"}',
    '{"Pick a pivot element, then partition the slice into elements less than the pivot and elements greater than or equal to it.","Recursively sort each partition, then combine them with the pivot placed in between.","A slice of length 0 or 1 is already sorted — that''s your base case."}',
    3,
    150,
    '{"sorting","recursion","divide-and-conquer"}',
    true,
    'seed-sorting-searching-quick-sort',
    '## Quick Sort

Write a function that sorts a slice of integers `nums` in ascending order using the quick sort algorithm (partition around a pivot, then recursively sort each side), and returns the sorted slice.

**Function signature**

```go
func QuickSort(nums []int) []int
```

**Examples**

- `QuickSort([10, 7, 8, 9, 1, 5])` returns `[1, 5, 7, 8, 9, 10]`
- `QuickSort([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 5000

**Learning objective:** Implement a partition-based divide-and-conquer sort and reason about pivot choice.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'quick-sort'), '[[10,7,8,9,1,5]]'::jsonb, '[1,5,7,8,9,10]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'quick-sort'), '[[]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'quick-sort'), '[[2,1]]'::jsonb, '[1,2]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'quick-sort'), '[[4,4,4,4]]'::jsonb, '[4,4,4,4]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'quick-sort'), '[[9,1,8,2,7,3]]'::jsonb, '[1,2,3,7,8,9]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- sorting-searching :: Count Inversions (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'count-inversions',
    'sorting-searching',
    'function',
    'go',
    'Count Inversions',
    '## Count Inversions

Write a function that counts the number of inversions in a slice `nums` — pairs of indices `(i, j)` with `i < j` and `nums[i] > nums[j]`.

**Function signature**

```go
func CountInversions(nums []int) int
```

**Examples**

- `CountInversions([2, 4, 1, 3, 5])` returns `3`
- `CountInversions([1, 2, 3])` returns `0`

**Constraints**

- 0 <= len(nums) <= 2000

**Learning objective:** Connect a counting problem to sortedness, and recognize it as a natural extension of merge sort''s merge step.',
    'CountInversions',
    'int',
    '{"[]int"}',
    '{"An inversion is a pair of indices i < j where nums[i] > nums[j] — it measures how far a slice is from being sorted.","A brute-force double loop checking every pair correctly counts inversions, just not efficiently for very large inputs.","A fully sorted slice has zero inversions; a fully reverse-sorted slice has the maximum possible number."}',
    3,
    150,
    '{"sorting","arrays"}',
    true,
    'seed-sorting-searching-count-inversions',
    '## Count Inversions

Write a function that counts the number of inversions in a slice `nums` — pairs of indices `(i, j)` with `i < j` and `nums[i] > nums[j]`.

**Function signature**

```go
func CountInversions(nums []int) int
```

**Examples**

- `CountInversions([2, 4, 1, 3, 5])` returns `3`
- `CountInversions([1, 2, 3])` returns `0`

**Constraints**

- 0 <= len(nums) <= 2000

**Learning objective:** Connect a counting problem to sortedness, and recognize it as a natural extension of merge sort''s merge step.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-inversions'), '[[2,4,1,3,5]]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-inversions'), '[[1,2,3]]'::jsonb, '0', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-inversions'), '[[3,2,1]]'::jsonb, '3', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-inversions'), '[[]]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-inversions'), '[[5,5,5]]'::jsonb, '0', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- sorting-searching :: Find Peak Element (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'find-peak-element',
    'sorting-searching',
    'function',
    'go',
    'Find Peak Element',
    '## Find Peak Element

Write a function that returns the index of a peak element in `nums` — an element strictly greater than both of its neighbors (or its one neighbor, if it''s at either end). Every test case for this problem is constructed with exactly one peak, so the answer is always unambiguous.

**Function signature**

```go
func FindPeakElement(nums []int) int
```

**Examples**

- `FindPeakElement([1, 2, 3, 1])` returns `2`
- `FindPeakElement([1, 2, 1, 3, 5, 6, 4])` returns `1`

**Constraints**

- 1 <= len(nums) <= 10000

**Learning objective:** Adapt binary search to a condition based on comparing an element to its neighbors rather than to a fixed target.',
    'FindPeakElement',
    'int',
    '{"[]int"}',
    '{"A peak element is strictly greater than its immediate neighbors, treating out-of-bounds neighbors as negative infinity.","For this exercise, every test case has exactly one such peak, so there is a single unambiguous correct index.","Binary search can locate a peak in O(log n) by always moving toward the side with the larger neighbor, but a linear scan will also find the right answer."}',
    4,
    190,
    '{"searching","binary-search"}',
    true,
    'seed-sorting-searching-find-peak-element',
    '## Find Peak Element

Write a function that returns the index of a peak element in `nums` — an element strictly greater than both of its neighbors (or its one neighbor, if it''s at either end). Every test case for this problem is constructed with exactly one peak, so the answer is always unambiguous.

**Function signature**

```go
func FindPeakElement(nums []int) int
```

**Examples**

- `FindPeakElement([1, 2, 3, 1])` returns `2`
- `FindPeakElement([1, 2, 1, 3, 5, 6, 4])` returns `1`

**Constraints**

- 1 <= len(nums) <= 10000

**Learning objective:** Adapt binary search to a condition based on comparing an element to its neighbors rather than to a fixed target.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-peak-element'), '[[1,2,3,1]]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-peak-element'), '[[1,2,1,3,5,6,4]]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-peak-element'), '[[5]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-peak-element'), '[[1,2,3,4,5,4,3]]'::jsonb, '4', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-peak-element'), '[[3,2,1]]'::jsonb, '0', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- sorting-searching :: Search in Rotated Sorted Array (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'search-rotated',
    'sorting-searching',
    'function',
    'go',
    'Search in Rotated Sorted Array',
    '## Search in Rotated Sorted Array

An ascending sorted slice with distinct values has been rotated at an unknown pivot. Write a function `SearchRotated(nums []int, target int) int` that returns the index of `target` in the rotated slice `nums`, or -1 if it is not present. Solve it in O(log n) time.

**Function signature**

```go
func SearchRotated(nums []int, target int) int
```

**Examples**

- `SearchRotated([4, 5, 6, 7, 0, 1, 2], 0)` returns `4`
- `SearchRotated([4, 5, 6, 7, 0, 1, 2], 3)` returns `-1`

**Constraints**

- 0 <= len(nums) <= 10000
- All values in nums are distinct

**Learning objective:** Extend binary search to handle a sorted-but-rotated invariant instead of a plain sorted one.',
    'SearchRotated',
    'int',
    '{"[]int","int"}',
    '{"At least one half of the slice (split at the midpoint) is always fully sorted — identify which half that is first.","If the target falls within the sorted half''s value range, search there; otherwise search the other half.","This still runs in O(log n), just like ordinary binary search, once you handle the extra case analysis."}',
    4,
    190,
    '{"searching","binary-search"}',
    true,
    'seed-sorting-searching-search-rotated',
    '## Search in Rotated Sorted Array

An ascending sorted slice with distinct values has been rotated at an unknown pivot. Write a function `SearchRotated(nums []int, target int) int` that returns the index of `target` in the rotated slice `nums`, or -1 if it is not present. Solve it in O(log n) time.

**Function signature**

```go
func SearchRotated(nums []int, target int) int
```

**Examples**

- `SearchRotated([4, 5, 6, 7, 0, 1, 2], 0)` returns `4`
- `SearchRotated([4, 5, 6, 7, 0, 1, 2], 3)` returns `-1`

**Constraints**

- 0 <= len(nums) <= 10000
- All values in nums are distinct

**Learning objective:** Extend binary search to handle a sorted-but-rotated invariant instead of a plain sorted one.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'search-rotated'), '[[4,5,6,7,0,1,2],0]'::jsonb, '4', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'search-rotated'), '[[4,5,6,7,0,1,2],3]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'search-rotated'), '[[1],0]'::jsonb, '-1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'search-rotated'), '[[6,7,0,1,2,4,5],2]'::jsonb, '4', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'search-rotated'), '[[],5]'::jsonb, '-1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- sorting-searching :: Kth Smallest Element (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'kth-smallest',
    'sorting-searching',
    'function',
    'go',
    'Kth Smallest Element',
    '## Kth Smallest Element

Write a function `KthSmallest(nums []int, k int) int` that returns the `k`-th smallest element in `nums` (1-indexed, so k=1 means the minimum).

**Function signature**

```go
func KthSmallest(nums []int, k int) int
```

**Examples**

- `KthSmallest([7, 10, 4, 3, 20, 15], 3)` returns `7`
- `KthSmallest([1], 1)` returns `1`

**Constraints**

- 1 <= k <= len(nums) <= 10000

**Learning objective:** Connect sorting to order-statistics queries like ''find the k-th smallest value''.',
    'KthSmallest',
    'int',
    '{"[]int","int"}',
    '{"The k-th smallest element (1-indexed) sits at index k-1 once the slice is sorted in ascending order.","Sorting the whole slice first is a simple, correct approach, even though more specialized selection algorithms exist.","k is guaranteed to be a valid index for the given slice."}',
    4,
    190,
    '{"sorting","searching"}',
    true,
    'seed-sorting-searching-kth-smallest',
    '## Kth Smallest Element

Write a function `KthSmallest(nums []int, k int) int` that returns the `k`-th smallest element in `nums` (1-indexed, so k=1 means the minimum).

**Function signature**

```go
func KthSmallest(nums []int, k int) int
```

**Examples**

- `KthSmallest([7, 10, 4, 3, 20, 15], 3)` returns `7`
- `KthSmallest([1], 1)` returns `1`

**Constraints**

- 1 <= k <= len(nums) <= 10000

**Learning objective:** Connect sorting to order-statistics queries like ''find the k-th smallest value''.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'kth-smallest'), '[[7,10,4,3,20,15],3]'::jsonb, '7', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'kth-smallest'), '[[1],1]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'kth-smallest'), '[[5,5,5],2]'::jsonb, '5', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'kth-smallest'), '[[9,3,7,1],1]'::jsonb, '1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'kth-smallest'), '[[12,8,5,20,3],4]'::jsonb, '12', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- sorting-searching :: Find Minimum in Rotated Sorted Array (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'find-min-rotated',
    'sorting-searching',
    'function',
    'go',
    'Find Minimum in Rotated Sorted Array',
    '## Find Minimum in Rotated Sorted Array

An ascending sorted slice with distinct values has been rotated at an unknown pivot. Write a function that returns the minimum element of the rotated slice `nums` in O(log n) time.

**Function signature**

```go
func FindMinRotated(nums []int) int
```

**Examples**

- `FindMinRotated([3, 4, 5, 1, 2])` returns `1`
- `FindMinRotated([4, 5, 6, 7, 0, 1, 2])` returns `0`

**Constraints**

- 1 <= len(nums) <= 10000
- All values in nums are distinct

**Learning objective:** Apply binary search to a structural property (where the rotation point is) rather than a direct value match.',
    'FindMinRotated',
    'int',
    '{"[]int"}',
    '{"The minimum element is the only value in the slice whose predecessor (in the original sorted order) is greater than it.","Compare the middle element to the rightmost element of your current search window: if the middle is greater, the minimum lies to its right; otherwise it lies at or to the left of the middle.","This runs in O(log n), narrowing the search window on every step rather than scanning linearly."}',
    5,
    220,
    '{"searching","binary-search"}',
    true,
    'seed-sorting-searching-find-min-rotated',
    '## Find Minimum in Rotated Sorted Array

An ascending sorted slice with distinct values has been rotated at an unknown pivot. Write a function that returns the minimum element of the rotated slice `nums` in O(log n) time.

**Function signature**

```go
func FindMinRotated(nums []int) int
```

**Examples**

- `FindMinRotated([3, 4, 5, 1, 2])` returns `1`
- `FindMinRotated([4, 5, 6, 7, 0, 1, 2])` returns `0`

**Constraints**

- 1 <= len(nums) <= 10000
- All values in nums are distinct

**Learning objective:** Apply binary search to a structural property (where the rotation point is) rather than a direct value match.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-min-rotated'), '[[3,4,5,1,2]]'::jsonb, '1', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-min-rotated'), '[[4,5,6,7,0,1,2]]'::jsonb, '0', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-min-rotated'), '[[11,13,15,17]]'::jsonb, '11', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-min-rotated'), '[[2,1]]'::jsonb, '1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'find-min-rotated'), '[[1]]'::jsonb, '1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- sorting-searching :: Median of Two Sorted Arrays (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'median-of-two-sorted',
    'sorting-searching',
    'function',
    'go',
    'Median of Two Sorted Arrays',
    '## Median of Two Sorted Arrays

Write a function `MedianOfTwoSortedArrays(a, b []int) int` that returns the median value of the combined elements of two sorted slices `a` and `b`. Every test case guarantees `len(a) + len(b)` is odd, so the median is always a single element with no averaging needed.

**Function signature**

```go
func MedianOfTwoSortedArrays(a []int, b []int) int
```

**Examples**

- `MedianOfTwoSortedArrays([1, 3], [2])` returns `2`
- `MedianOfTwoSortedArrays([1, 2], [3, 4, 5])` returns `3`

**Constraints**

- 0 <= len(a), len(b) <= 5000
- len(a) + len(b) is always odd and at least 1

**Learning objective:** Reason about order statistics across two separately sorted collections.',
    'MedianOfTwoSortedArrays',
    'int',
    '{"[]int","[]int"}',
    '{"Conceptually, merging the two sorted slices produces one combined sorted sequence.","For this exercise, the combined length of the two slices is always odd, so the median is a single well-defined middle element — no averaging is required.","You do not need to materialize the full merge to find the median efficiently, but a full merge followed by a direct index lookup is a perfectly valid reference approach."}',
    5,
    220,
    '{"searching","arrays"}',
    true,
    'seed-sorting-searching-median-of-two-sorted',
    '## Median of Two Sorted Arrays

Write a function `MedianOfTwoSortedArrays(a, b []int) int` that returns the median value of the combined elements of two sorted slices `a` and `b`. Every test case guarantees `len(a) + len(b)` is odd, so the median is always a single element with no averaging needed.

**Function signature**

```go
func MedianOfTwoSortedArrays(a []int, b []int) int
```

**Examples**

- `MedianOfTwoSortedArrays([1, 3], [2])` returns `2`
- `MedianOfTwoSortedArrays([1, 2], [3, 4, 5])` returns `3`

**Constraints**

- 0 <= len(a), len(b) <= 5000
- len(a) + len(b) is always odd and at least 1

**Learning objective:** Reason about order statistics across two separately sorted collections.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'median-of-two-sorted'), '[[1,3],[2]]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'median-of-two-sorted'), '[[1,2],[3,4,5]]'::jsonb, '3', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'median-of-two-sorted'), '[[],[1]]'::jsonb, '1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'median-of-two-sorted'), '[[6],[1,2,3,4]]'::jsonb, '3', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'median-of-two-sorted'), '[[5,10,15],[1,2]]'::jsonb, '5', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- sorting-searching :: Sort Colors (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'sort-colors',
    'sorting-searching',
    'function',
    'go',
    'Sort Colors',
    '## Sort Colors

Write a function that sorts a slice `nums` containing only the values 0, 1, and 2 (representing colors) in ascending order in a single pass, and returns the sorted slice. This is the classic Dutch national flag problem.

**Function signature**

```go
func SortColors(nums []int) []int
```

**Examples**

- `SortColors([2, 0, 2, 1, 1, 0])` returns `[0, 0, 1, 1, 2, 2]`
- `SortColors([2, 0, 1])` returns `[0, 1, 2]`

**Constraints**

- 0 <= len(nums) <= 10000
- Every value in nums is 0, 1, or 2

**Learning objective:** Implement the three-way partitioning technique that generalizes to quicksort''s partition step.',
    'SortColors',
    '[]int',
    '{"[]int"}',
    '{"The classic ''Dutch national flag'' problem restricts values to exactly 0, 1, and 2.","A three-pointer partitioning scheme can sort the slice in a single O(n) pass without a general-purpose sort.","Because only three distinct values exist, the final sorted order is unambiguous regardless of the technique used to reach it."}',
    5,
    220,
    '{"sorting","arrays","dutch-national-flag"}',
    true,
    'seed-sorting-searching-sort-colors',
    '## Sort Colors

Write a function that sorts a slice `nums` containing only the values 0, 1, and 2 (representing colors) in ascending order in a single pass, and returns the sorted slice. This is the classic Dutch national flag problem.

**Function signature**

```go
func SortColors(nums []int) []int
```

**Examples**

- `SortColors([2, 0, 2, 1, 1, 0])` returns `[0, 0, 1, 1, 2, 2]`
- `SortColors([2, 0, 1])` returns `[0, 1, 2]`

**Constraints**

- 0 <= len(nums) <= 10000
- Every value in nums is 0, 1, or 2

**Learning objective:** Implement the three-way partitioning technique that generalizes to quicksort''s partition step.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sort-colors'), '[[2,0,2,1,1,0]]'::jsonb, '[0,0,1,1,2,2]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sort-colors'), '[[2,0,1]]'::jsonb, '[0,1,2]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sort-colors'), '[[0]]'::jsonb, '[0]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sort-colors'), '[[1,1,1,1]]'::jsonb, '[1,1,1,1]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sort-colors'), '[[2,2,0,0,1]]'::jsonb, '[0,0,1,2,2]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- pointers :: Reverse an Array In Place (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'reverse-array-two-pointers',
    'pointers',
    'function',
    'go',
    'Reverse an Array In Place',
    '## Reverse an Array In Place

Write a function that reverses the order of elements in a slice `nums` using the two-pointer technique (one pointer from each end, swapping and converging toward the middle), and returns the reversed slice.

**Function signature**

```go
func ReverseArray(nums []int) []int
```

**Examples**

- `ReverseArray([1, 2, 3, 4, 5])` returns `[5, 4, 3, 2, 1]`
- `ReverseArray([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Learn the two-pointer convergence pattern, the foundation for many array algorithms in this module.',
    'ReverseArray',
    '[]int',
    '{"[]int"}',
    '{"Use one pointer starting at the front and another starting at the back.","Swap the elements at the two pointers, then move the front pointer forward and the back pointer backward.","Stop once the two pointers meet or cross."}',
    1,
    70,
    '{"two-pointers","arrays","beginner"}',
    true,
    'seed-pointers-reverse-array-two-pointers',
    '## Reverse an Array In Place

Write a function that reverses the order of elements in a slice `nums` using the two-pointer technique (one pointer from each end, swapping and converging toward the middle), and returns the reversed slice.

**Function signature**

```go
func ReverseArray(nums []int) []int
```

**Examples**

- `ReverseArray([1, 2, 3, 4, 5])` returns `[5, 4, 3, 2, 1]`
- `ReverseArray([])` returns `[]`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Learn the two-pointer convergence pattern, the foundation for many array algorithms in this module.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-array-two-pointers'), '[[1,2,3,4,5]]'::jsonb, '[5,4,3,2,1]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-array-two-pointers'), '[[]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-array-two-pointers'), '[[1]]'::jsonb, '[1]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-array-two-pointers'), '[[1,2]]'::jsonb, '[2,1]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-array-two-pointers'), '[[9,7,5,3,1]]'::jsonb, '[1,3,5,7,9]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- pointers :: Palindrome Array Check (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'is-palindrome-array',
    'pointers',
    'function',
    'go',
    'Palindrome Array Check',
    '## Palindrome Array Check

Write a function that determines whether a slice of integers `nums` reads the same forwards and backwards, using the two-pointer technique.

**Function signature**

```go
func IsPalindromeArray(nums []int) bool
```

**Examples**

- `IsPalindromeArray([1, 2, 3, 2, 1])` returns `true`
- `IsPalindromeArray([1, 2, 3])` returns `false`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Apply two-pointer convergence to a comparison problem instead of a mutation problem.',
    'IsPalindromeArray',
    'bool',
    '{"[]int"}',
    '{"Compare the element at the front pointer to the element at the back pointer.","If they ever differ, the slice is not a palindrome — you can stop immediately.","If the pointers meet or cross without finding a mismatch, the slice is a palindrome."}',
    1,
    70,
    '{"two-pointers","arrays","beginner"}',
    true,
    'seed-pointers-is-palindrome-array',
    '## Palindrome Array Check

Write a function that determines whether a slice of integers `nums` reads the same forwards and backwards, using the two-pointer technique.

**Function signature**

```go
func IsPalindromeArray(nums []int) bool
```

**Examples**

- `IsPalindromeArray([1, 2, 3, 2, 1])` returns `true`
- `IsPalindromeArray([1, 2, 3])` returns `false`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Apply two-pointer convergence to a comparison problem instead of a mutation problem.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-palindrome-array'), '[[1,2,3,2,1]]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-palindrome-array'), '[[1,2,3]]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-palindrome-array'), '[[]]'::jsonb, 'true', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-palindrome-array'), '[[7,7]]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-palindrome-array'), '[[5]]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- pointers :: Pair With Given Sum in Sorted Array (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'pair-with-sum-sorted',
    'pointers',
    'function',
    'go',
    'Pair With Given Sum in Sorted Array',
    '## Pair With Given Sum in Sorted Array

Given a slice `nums` sorted in ascending order and a target sum `target`, write a function `PairWithSum(nums []int, target int) []int` that returns the indices `[i, j]` (with i < j) of the pair of elements that add up to `target`, found using the two-pointer technique. Every test case guarantees exactly one valid pair. Return `[-1, -1]` if none exists.

**Function signature**

```go
func PairWithSum(nums []int, target int) []int
```

**Examples**

- `PairWithSum([1, 2, 3, 4, 6], 6)` returns `[1, 3]`
- `PairWithSum([2, 7, 11, 15], 9)` returns `[0, 1]`

**Constraints**

- 2 <= len(nums) <= 10000
- nums is sorted in ascending order

**Learning objective:** Use sortedness to replace a nested loop with a single linear two-pointer sweep.',
    'PairWithSum',
    '[]int',
    '{"[]int","int"}',
    '{"Because the slice is sorted, a pointer at each end lets you control the sum by moving inward.","If the current pair''s sum is too small, moving the left pointer forward increases it; if too large, moving the right pointer backward decreases it.","Every test case guarantees exactly one valid pair, so you can stop as soon as you find it."}',
    1,
    70,
    '{"two-pointers","arrays"}',
    true,
    'seed-pointers-pair-with-sum-sorted',
    '## Pair With Given Sum in Sorted Array

Given a slice `nums` sorted in ascending order and a target sum `target`, write a function `PairWithSum(nums []int, target int) []int` that returns the indices `[i, j]` (with i < j) of the pair of elements that add up to `target`, found using the two-pointer technique. Every test case guarantees exactly one valid pair. Return `[-1, -1]` if none exists.

**Function signature**

```go
func PairWithSum(nums []int, target int) []int
```

**Examples**

- `PairWithSum([1, 2, 3, 4, 6], 6)` returns `[1, 3]`
- `PairWithSum([2, 7, 11, 15], 9)` returns `[0, 1]`

**Constraints**

- 2 <= len(nums) <= 10000
- nums is sorted in ascending order

**Learning objective:** Use sortedness to replace a nested loop with a single linear two-pointer sweep.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'pair-with-sum-sorted'), '[[1,2,3,4,6],6]'::jsonb, '[1,3]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'pair-with-sum-sorted'), '[[2,7,11,15],9]'::jsonb, '[0,1]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'pair-with-sum-sorted'), '[[-3,-1,0,2,5],4]'::jsonb, '[1,4]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'pair-with-sum-sorted'), '[[1,3,5,7,9],12]'::jsonb, '[1,4]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'pair-with-sum-sorted'), '[[1,2],100]'::jsonb, '[-1,-1]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- pointers :: Remove Element In Place (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'remove-element',
    'pointers',
    'function',
    'go',
    'Remove Element In Place',
    '## Remove Element In Place

Write a function `RemoveElement(nums []int, val int) []int` that removes every occurrence of `val` from `nums` using the two-pointer technique, preserving the relative order of the remaining elements, and returns the resulting slice.

**Function signature**

```go
func RemoveElement(nums []int, val int) []int
```

**Examples**

- `RemoveElement([3, 2, 2, 3], 3)` returns `[2, 2]`
- `RemoveElement([0, 1, 2, 2, 3, 0, 4, 2], 2)` returns `[0, 1, 3, 0, 4]`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Practice the read-pointer / write-pointer pattern used for in-place filtering.',
    'RemoveElement',
    '[]int',
    '{"[]int","int"}',
    '{"A read pointer scans every element, while a write pointer tracks where the next kept element should go.","Whenever the read pointer finds an element that doesn''t match val, copy it to the write pointer''s position and advance both.","The relative order of the kept elements must be preserved."}',
    2,
    110,
    '{"two-pointers","arrays"}',
    true,
    'seed-pointers-remove-element',
    '## Remove Element In Place

Write a function `RemoveElement(nums []int, val int) []int` that removes every occurrence of `val` from `nums` using the two-pointer technique, preserving the relative order of the remaining elements, and returns the resulting slice.

**Function signature**

```go
func RemoveElement(nums []int, val int) []int
```

**Examples**

- `RemoveElement([3, 2, 2, 3], 3)` returns `[2, 2]`
- `RemoveElement([0, 1, 2, 2, 3, 0, 4, 2], 2)` returns `[0, 1, 3, 0, 4]`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Practice the read-pointer / write-pointer pattern used for in-place filtering.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-element'), '[[3,2,2,3],3]'::jsonb, '[2,2]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-element'), '[[0,1,2,2,3,0,4,2],2]'::jsonb, '[0,1,3,0,4]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-element'), '[[],5]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-element'), '[[1,1,1],1]'::jsonb, '[]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-element'), '[[4,5,6],9]'::jsonb, '[4,5,6]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- pointers :: Intersection of Two Sorted Arrays (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'intersection-sorted-arrays',
    'pointers',
    'function',
    'go',
    'Intersection of Two Sorted Arrays',
    '## Intersection of Two Sorted Arrays

Write a function `IntersectionSorted(a, b []int) []int` that returns the intersection of two sorted slices `a` and `b`, using the two-pointer technique. If a value appears multiple times in both slices, it should appear in the result as many times as it co-occurs (e.g. twice if it appears at least twice in each).

**Function signature**

```go
func IntersectionSorted(a []int, b []int) []int
```

**Examples**

- `IntersectionSorted([1, 2, 2, 3], [2, 2, 3, 5])` returns `[2, 2, 3]`
- `IntersectionSorted([1, 3, 5], [2, 4, 6])` returns `[]`

**Constraints**

- 0 <= len(a), len(b) <= 10000
- a and b are each sorted in ascending order

**Learning objective:** Apply two synchronized pointers to a set-like operation on sorted data.',
    'IntersectionSorted',
    '[]int',
    '{"[]int","[]int"}',
    '{"Walk both sorted slices with one pointer each, starting at the beginning of both.","Advance whichever pointer is behind in value; when both pointers see the same value, that''s a shared element.","A value''s number of appearances in the result matches how many times it co-occurs in both slices, not just whether it appears at all."}',
    2,
    110,
    '{"two-pointers","arrays"}',
    true,
    'seed-pointers-intersection-sorted-arrays',
    '## Intersection of Two Sorted Arrays

Write a function `IntersectionSorted(a, b []int) []int` that returns the intersection of two sorted slices `a` and `b`, using the two-pointer technique. If a value appears multiple times in both slices, it should appear in the result as many times as it co-occurs (e.g. twice if it appears at least twice in each).

**Function signature**

```go
func IntersectionSorted(a []int, b []int) []int
```

**Examples**

- `IntersectionSorted([1, 2, 2, 3], [2, 2, 3, 5])` returns `[2, 2, 3]`
- `IntersectionSorted([1, 3, 5], [2, 4, 6])` returns `[]`

**Constraints**

- 0 <= len(a), len(b) <= 10000
- a and b are each sorted in ascending order

**Learning objective:** Apply two synchronized pointers to a set-like operation on sorted data.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'intersection-sorted-arrays'), '[[1,2,2,3],[2,2,3,5]]'::jsonb, '[2,2,3]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'intersection-sorted-arrays'), '[[1,3,5],[2,4,6]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'intersection-sorted-arrays'), '[[],[1,2]]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'intersection-sorted-arrays'), '[[4,4,4],[4,4]]'::jsonb, '[4,4]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'intersection-sorted-arrays'), '[[1,2,3,4],[4]]'::jsonb, '[4]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- pointers :: Squares of a Sorted Array (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'sorted-squares',
    'pointers',
    'function',
    'go',
    'Squares of a Sorted Array',
    '## Squares of a Sorted Array

Given a slice `nums` sorted in ascending order (which may include negative numbers), write a function that returns a new slice of the squares of each number, also sorted in ascending order, using the two-pointer technique.

**Function signature**

```go
func SortedSquares(nums []int) []int
```

**Examples**

- `SortedSquares([-4, -1, 0, 3, 10])` returns `[0, 1, 9, 16, 100]`
- `SortedSquares([-7, -3, 2, 3, 11])` returns `[4, 9, 9, 49, 121]`

**Constraints**

- 0 <= len(nums) <= 10000
- nums is sorted in ascending order

**Learning objective:** Recognize when a two-pointer sweep from both ends outperforms squaring-then-sorting.',
    'SortedSquares',
    '[]int',
    '{"[]int"}',
    '{"Squaring can flip the relative order of negative numbers, so you can''t just square in place and keep the same order.","The largest square always comes from whichever end of the sorted slice is furthest from zero.","Compare the absolute values at both ends with two pointers, placing the larger square at the back of the result and working inward."}',
    2,
    110,
    '{"two-pointers","arrays"}',
    true,
    'seed-pointers-sorted-squares',
    '## Squares of a Sorted Array

Given a slice `nums` sorted in ascending order (which may include negative numbers), write a function that returns a new slice of the squares of each number, also sorted in ascending order, using the two-pointer technique.

**Function signature**

```go
func SortedSquares(nums []int) []int
```

**Examples**

- `SortedSquares([-4, -1, 0, 3, 10])` returns `[0, 1, 9, 16, 100]`
- `SortedSquares([-7, -3, 2, 3, 11])` returns `[4, 9, 9, 49, 121]`

**Constraints**

- 0 <= len(nums) <= 10000
- nums is sorted in ascending order

**Learning objective:** Recognize when a two-pointer sweep from both ends outperforms squaring-then-sorting.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sorted-squares'), '[[-4,-1,0,3,10]]'::jsonb, '[0,1,9,16,100]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sorted-squares'), '[[-7,-3,2,3,11]]'::jsonb, '[4,9,9,49,121]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sorted-squares'), '[[]]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sorted-squares'), '[[0]]'::jsonb, '[0]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'sorted-squares'), '[[-5,-4,-3,-2,-1]]'::jsonb, '[1,4,9,16,25]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- pointers :: Triplet Sum Exists (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'three-sum-exists',
    'pointers',
    'function',
    'go',
    'Triplet Sum Exists',
    '## Triplet Sum Exists

Write a function `ThreeSumExists(nums []int, target int) bool` that determines whether any three elements in `nums` (at three distinct indices) sum to `target`, using sorting plus the two-pointer technique.

**Function signature**

```go
func ThreeSumExists(nums []int, target int) bool
```

**Examples**

- `ThreeSumExists([1, 2, 3, 4, 5], 9)` returns `true`
- `ThreeSumExists([1, 2, 3], 100)` returns `false`

**Constraints**

- 0 <= len(nums) <= 500

**Learning objective:** Reduce a three-element search to a fixed element plus a two-pointer pair search.',
    'ThreeSumExists',
    'bool',
    '{"[]int","int"}',
    '{"Sort the slice first — sortedness is what makes the two-pointer scan for the remaining pair possible.","Fix one element at a time, then use two pointers on the rest of the slice to look for a pair that completes the target sum.","Move the low pointer up when the running sum is too small, and the high pointer down when it''s too large."}',
    3,
    150,
    '{"two-pointers","arrays"}',
    true,
    'seed-pointers-three-sum-exists',
    '## Triplet Sum Exists

Write a function `ThreeSumExists(nums []int, target int) bool` that determines whether any three elements in `nums` (at three distinct indices) sum to `target`, using sorting plus the two-pointer technique.

**Function signature**

```go
func ThreeSumExists(nums []int, target int) bool
```

**Examples**

- `ThreeSumExists([1, 2, 3, 4, 5], 9)` returns `true`
- `ThreeSumExists([1, 2, 3], 100)` returns `false`

**Constraints**

- 0 <= len(nums) <= 500

**Learning objective:** Reduce a three-element search to a fixed element plus a two-pointer pair search.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'three-sum-exists'), '[[1,2,3,4,5],9]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'three-sum-exists'), '[[1,2,3],100]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'three-sum-exists'), '[[0,0,0],0]'::jsonb, 'true', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'three-sum-exists'), '[[-1,0,1,2,-1,-4],0]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'three-sum-exists'), '[[5,10,15],12]'::jsonb, 'false', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- pointers :: Container With Most Water (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'max-water-container',
    'pointers',
    'function',
    'go',
    'Container With Most Water',
    '## Container With Most Water

Given a slice `heights` where `heights[i]` represents the height of a vertical line at position `i`, write a function that returns the maximum amount of water that can be contained between any two lines (the container''s capacity is width times the shorter of the two heights), using the two-pointer technique.

**Function signature**

```go
func MaxWaterContainer(heights []int) int
```

**Examples**

- `MaxWaterContainer([1, 8, 6, 2, 5, 4, 8, 3, 7])` returns `49`
- `MaxWaterContainer([1, 1])` returns `1`

**Constraints**

- 2 <= len(heights) <= 10000
- 0 <= heights[i] <= 10^4

**Learning objective:** Prove to yourself why moving the shorter pointer is always the correct greedy move in this technique.',
    'MaxWaterContainer',
    'int',
    '{"[]int"}',
    '{"Each pair of lines forms a container whose capacity is limited by the shorter of the two lines.","Starting with pointers at both ends maximizes the width; moving the pointer at the shorter line inward is the only move that can possibly increase capacity.","Keep track of the best capacity seen as the pointers converge."}',
    3,
    150,
    '{"two-pointers","arrays"}',
    true,
    'seed-pointers-max-water-container',
    '## Container With Most Water

Given a slice `heights` where `heights[i]` represents the height of a vertical line at position `i`, write a function that returns the maximum amount of water that can be contained between any two lines (the container''s capacity is width times the shorter of the two heights), using the two-pointer technique.

**Function signature**

```go
func MaxWaterContainer(heights []int) int
```

**Examples**

- `MaxWaterContainer([1, 8, 6, 2, 5, 4, 8, 3, 7])` returns `49`
- `MaxWaterContainer([1, 1])` returns `1`

**Constraints**

- 2 <= len(heights) <= 10000
- 0 <= heights[i] <= 10^4

**Learning objective:** Prove to yourself why moving the shorter pointer is always the correct greedy move in this technique.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'max-water-container'), '[[1,8,6,2,5,4,8,3,7]]'::jsonb, '49', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'max-water-container'), '[[1,1]]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'max-water-container'), '[[4,3,2,1,4]]'::jsonb, '16', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'max-water-container'), '[[1,2,1]]'::jsonb, '2', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'max-water-container'), '[[2,3,4,5,18,17,6]]'::jsonb, '17', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- pointers :: Partition Array Around a Pivot (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'partition-around-pivot',
    'pointers',
    'function',
    'go',
    'Partition Array Around a Pivot',
    '## Partition Array Around a Pivot

Write a function `PartitionAroundPivot(nums []int, pivot int) []int` that returns `nums` rearranged so every element less than `pivot` comes before every element greater than or equal to `pivot`, preserving the relative order within each group.

**Function signature**

```go
func PartitionAroundPivot(nums []int, pivot int) []int
```

**Examples**

- `PartitionAroundPivot([9, 12, 5, 10, 14, 3, 10], 10)` returns `[9, 5, 3, 12, 10, 14, 10]`
- `PartitionAroundPivot([1, 2, 3], 0)` returns `[1, 2, 3]`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Practice the stable partitioning technique that underlies the partition step of quicksort.',
    'PartitionAroundPivot',
    '[]int',
    '{"[]int","int"}',
    '{"Every element belongs to exactly one of two groups: strictly less than the pivot, or greater than or equal to it.","A two-pointer approach can build the partitioned result by scanning once for each group while preserving each group''s original relative order.","The pivot value itself does not need to appear in the slice for this operation to make sense."}',
    3,
    150,
    '{"two-pointers","arrays"}',
    true,
    'seed-pointers-partition-around-pivot',
    '## Partition Array Around a Pivot

Write a function `PartitionAroundPivot(nums []int, pivot int) []int` that returns `nums` rearranged so every element less than `pivot` comes before every element greater than or equal to `pivot`, preserving the relative order within each group.

**Function signature**

```go
func PartitionAroundPivot(nums []int, pivot int) []int
```

**Examples**

- `PartitionAroundPivot([9, 12, 5, 10, 14, 3, 10], 10)` returns `[9, 5, 3, 12, 10, 14, 10]`
- `PartitionAroundPivot([1, 2, 3], 0)` returns `[1, 2, 3]`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Practice the stable partitioning technique that underlies the partition step of quicksort.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'partition-around-pivot'), '[[9,12,5,10,14,3,10],10]'::jsonb, '[9,5,3,12,10,14,10]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'partition-around-pivot'), '[[1,2,3],0]'::jsonb, '[1,2,3]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'partition-around-pivot'), '[[],5]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'partition-around-pivot'), '[[5,5,5],5]'::jsonb, '[5,5,5]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'partition-around-pivot'), '[[8,1,6,3,9],5]'::jsonb, '[1,3,8,6,9]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- pointers :: Remove Duplicates (Allow At Most Two) (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'remove-duplicates-at-most-two',
    'pointers',
    'function',
    'go',
    'Remove Duplicates (Allow At Most Two)',
    '## Remove Duplicates (Allow At Most Two)

Given a slice `nums` sorted in ascending order, write a function that removes elements so that each distinct value appears at most twice, preserving relative order, and returns the resulting slice, using the two-pointer technique.

**Function signature**

```go
func RemoveDuplicatesAtMostTwo(nums []int) []int
```

**Examples**

- `RemoveDuplicatesAtMostTwo([1, 1, 1, 2, 2, 3])` returns `[1, 1, 2, 2, 3]`
- `RemoveDuplicatesAtMostTwo([0, 0, 1, 1, 1, 1, 2, 3, 3])` returns `[0, 0, 1, 1, 2, 3, 3]`

**Constraints**

- 0 <= len(nums) <= 10000
- nums is sorted in ascending order

**Learning objective:** Extend basic deduplication to a bounded-count variant using a read/write pointer pair.',
    'RemoveDuplicatesAtMostTwo',
    '[]int',
    '{"[]int"}',
    '{"A write pointer tracks how many elements have been kept so far; a read pointer scans the input.","An element can be kept if the result so far has fewer than two occurrences of it at the very end.","Comparing a candidate value to the element two positions back in the result (if it exists) tells you whether keeping it would exceed the limit of two."}',
    4,
    190,
    '{"two-pointers","arrays"}',
    true,
    'seed-pointers-remove-duplicates-at-most-two',
    '## Remove Duplicates (Allow At Most Two)

Given a slice `nums` sorted in ascending order, write a function that removes elements so that each distinct value appears at most twice, preserving relative order, and returns the resulting slice, using the two-pointer technique.

**Function signature**

```go
func RemoveDuplicatesAtMostTwo(nums []int) []int
```

**Examples**

- `RemoveDuplicatesAtMostTwo([1, 1, 1, 2, 2, 3])` returns `[1, 1, 2, 2, 3]`
- `RemoveDuplicatesAtMostTwo([0, 0, 1, 1, 1, 1, 2, 3, 3])` returns `[0, 0, 1, 1, 2, 3, 3]`

**Constraints**

- 0 <= len(nums) <= 10000
- nums is sorted in ascending order

**Learning objective:** Extend basic deduplication to a bounded-count variant using a read/write pointer pair.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-duplicates-at-most-two'), '[[1,1,1,2,2,3]]'::jsonb, '[1,1,2,2,3]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-duplicates-at-most-two'), '[[0,0,1,1,1,1,2,3,3]]'::jsonb, '[0,0,1,1,2,3,3]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-duplicates-at-most-two'), '[[]]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-duplicates-at-most-two'), '[[1,1,1,1]]'::jsonb, '[1,1]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-duplicates-at-most-two'), '[[5]]'::jsonb, '[5]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- pointers :: Minimum Size Subarray Sum (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'min-subarray-len',
    'pointers',
    'function',
    'go',
    'Minimum Size Subarray Sum',
    '## Minimum Size Subarray Sum

Given a target sum `target` and a slice of positive integers `nums`, write a function `MinSubArrayLen(target int, nums []int) int` that returns the length of the shortest contiguous subarray whose sum is greater than or equal to `target`, using the sliding-window two-pointer technique. Return 0 if no such subarray exists.

**Function signature**

```go
func MinSubArrayLen(target int, nums []int) int
```

**Examples**

- `MinSubArrayLen(7, [2, 3, 1, 2, 4, 3])` returns `2`
- `MinSubArrayLen(4, [1, 4, 4])` returns `1`

**Constraints**

- 1 <= len(nums) <= 10000
- 1 <= nums[i] <= 10000
- 1 <= target <= 10^9

**Learning objective:** Implement the classic variable-size sliding window pattern for subarray-sum problems.',
    'MinSubArrayLen',
    'int',
    '{"int","[]int"}',
    '{"A sliding window (two pointers marking its start and end) can track a running sum as it expands and contracts.","Grow the window by moving the end pointer forward, adding to the running sum.","Once the running sum meets or exceeds target, shrink the window from the start to look for a shorter valid window before continuing to grow it again."}',
    4,
    190,
    '{"two-pointers","sliding-window"}',
    true,
    'seed-pointers-min-subarray-len',
    '## Minimum Size Subarray Sum

Given a target sum `target` and a slice of positive integers `nums`, write a function `MinSubArrayLen(target int, nums []int) int` that returns the length of the shortest contiguous subarray whose sum is greater than or equal to `target`, using the sliding-window two-pointer technique. Return 0 if no such subarray exists.

**Function signature**

```go
func MinSubArrayLen(target int, nums []int) int
```

**Examples**

- `MinSubArrayLen(7, [2, 3, 1, 2, 4, 3])` returns `2`
- `MinSubArrayLen(4, [1, 4, 4])` returns `1`

**Constraints**

- 1 <= len(nums) <= 10000
- 1 <= nums[i] <= 10000
- 1 <= target <= 10^9

**Learning objective:** Implement the classic variable-size sliding window pattern for subarray-sum problems.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-subarray-len'), '[7,[2,3,1,2,4,3]]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-subarray-len'), '[4,[1,4,4]]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-subarray-len'), '[11,[1,1,1,1,1,1,1,1]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-subarray-len'), '[100,[1,2,3]]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-subarray-len'), '[15,[5,1,3,5,10,7,4,9,2,8]]'::jsonb, '2', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- pointers :: Longest Substring Without Repeating Characters (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'longest-unique-substring',
    'pointers',
    'function',
    'go',
    'Longest Substring Without Repeating Characters',
    '## Longest Substring Without Repeating Characters

Write a function that returns the length of the longest substring of `s` that contains no repeating characters, using the sliding-window two-pointer technique.

**Function signature**

```go
func LongestUniqueSubstring(s string) int
```

**Examples**

- `LongestUniqueSubstring("abcabcbb")` returns `3`
- `LongestUniqueSubstring("bbbbb")` returns `1`

**Constraints**

- 0 <= len(s) <= 10000

**Learning objective:** Apply the sliding-window pattern to a string uniqueness constraint instead of a numeric sum constraint.',
    'LongestUniqueSubstring',
    'int',
    '{"string"}',
    '{"A sliding window over the string can track the set (or last-seen positions) of characters currently inside it.","When you encounter a character already in the window, shrink the window from the left until the duplicate is removed.","Track the maximum window length seen as the window slides across the whole string."}',
    4,
    190,
    '{"two-pointers","sliding-window","strings"}',
    true,
    'seed-pointers-longest-unique-substring',
    '## Longest Substring Without Repeating Characters

Write a function that returns the length of the longest substring of `s` that contains no repeating characters, using the sliding-window two-pointer technique.

**Function signature**

```go
func LongestUniqueSubstring(s string) int
```

**Examples**

- `LongestUniqueSubstring("abcabcbb")` returns `3`
- `LongestUniqueSubstring("bbbbb")` returns `1`

**Constraints**

- 0 <= len(s) <= 10000

**Learning objective:** Apply the sliding-window pattern to a string uniqueness constraint instead of a numeric sum constraint.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-unique-substring'), '["abcabcbb"]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-unique-substring'), '["bbbbb"]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-unique-substring'), '["pwwkew"]'::jsonb, '3', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-unique-substring'), '[""]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-unique-substring'), '["abcdefg"]'::jsonb, '7', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- pointers :: Trapping Rain Water (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'trap-rain-water',
    'pointers',
    'function',
    'go',
    'Trapping Rain Water',
    '## Trapping Rain Water

Given a slice `heights` representing an elevation map where the width of each bar is 1, write a function that computes how much water it can trap after raining, using the two-pointer technique.

**Function signature**

```go
func TrapRainWater(heights []int) int
```

**Examples**

- `TrapRainWater([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])` returns `6`
- `TrapRainWater([4, 2, 0, 3, 2, 5])` returns `9`

**Constraints**

- 0 <= len(heights) <= 10000
- 0 <= heights[i] <= 10^5

**Learning objective:** Combine two boundary-tracking pointers into an elegant O(n) time, O(1) space solution to a classic hard problem.',
    'TrapRainWater',
    'int',
    '{"[]int"}',
    '{"Water trapped above any bar is limited by the shorter of the tallest bar to its left and the tallest bar to its right.","Two pointers starting at both ends, each tracking the maximum height seen so far on its side, can compute this in a single pass.","At each step, advance whichever side currently has the smaller max-height boundary, since that side''s water level is already fully determined."}',
    5,
    220,
    '{"two-pointers","arrays"}',
    true,
    'seed-pointers-trap-rain-water',
    '## Trapping Rain Water

Given a slice `heights` representing an elevation map where the width of each bar is 1, write a function that computes how much water it can trap after raining, using the two-pointer technique.

**Function signature**

```go
func TrapRainWater(heights []int) int
```

**Examples**

- `TrapRainWater([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])` returns `6`
- `TrapRainWater([4, 2, 0, 3, 2, 5])` returns `9`

**Constraints**

- 0 <= len(heights) <= 10000
- 0 <= heights[i] <= 10^5

**Learning objective:** Combine two boundary-tracking pointers into an elegant O(n) time, O(1) space solution to a classic hard problem.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'trap-rain-water'), '[[0,1,0,2,1,0,1,3,2,1,2,1]]'::jsonb, '6', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'trap-rain-water'), '[[4,2,0,3,2,5]]'::jsonb, '9', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'trap-rain-water'), '[[]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'trap-rain-water'), '[[1,1,1,1]]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'trap-rain-water'), '[[5,4,1,2]]'::jsonb, '1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- pointers :: 3Sum Closest (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'three-sum-closest',
    'pointers',
    'function',
    'go',
    '3Sum Closest',
    '## 3Sum Closest

Write a function `ThreeSumClosest(nums []int, target int) int` that returns the sum of the three integers in `nums` whose total is closest to `target`, using sorting plus the two-pointer technique. You may assume `nums` has at least three elements and exactly one closest sum exists.

**Function signature**

```go
func ThreeSumClosest(nums []int, target int) int
```

**Examples**

- `ThreeSumClosest([-1, 2, 1, -4], 1)` returns `2`
- `ThreeSumClosest([0, 0, 0], 1)` returns `0`

**Constraints**

- 3 <= len(nums) <= 500

**Learning objective:** Adapt the two-pointer pair search into an optimization (closest value) rather than an exact match.',
    'ThreeSumClosest',
    'int',
    '{"[]int","int"}',
    '{"Sort the slice first, then fix one element and use two pointers on the remainder to search for the closest matching pair.","At each step, compare the current triplet''s sum to target and remember the best (closest) sum seen so far.","Move the low pointer up when the current sum is below target, and the high pointer down when it''s above — this is the same convergence idea as pair-with-sum, applied one level deeper."}',
    5,
    220,
    '{"two-pointers","arrays"}',
    true,
    'seed-pointers-three-sum-closest',
    '## 3Sum Closest

Write a function `ThreeSumClosest(nums []int, target int) int` that returns the sum of the three integers in `nums` whose total is closest to `target`, using sorting plus the two-pointer technique. You may assume `nums` has at least three elements and exactly one closest sum exists.

**Function signature**

```go
func ThreeSumClosest(nums []int, target int) int
```

**Examples**

- `ThreeSumClosest([-1, 2, 1, -4], 1)` returns `2`
- `ThreeSumClosest([0, 0, 0], 1)` returns `0`

**Constraints**

- 3 <= len(nums) <= 500

**Learning objective:** Adapt the two-pointer pair search into an optimization (closest value) rather than an exact match.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'three-sum-closest'), '[[-1,2,1,-4],1]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'three-sum-closest'), '[[0,0,0],1]'::jsonb, '0', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'three-sum-closest'), '[[1,1,1,0],-100]'::jsonb, '2', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'three-sum-closest'), '[[4,0,5,-5,3,3,0,-4,-5],-2]'::jsonb, '-2', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'three-sum-closest'), '[[1,2,3,4],100]'::jsonb, '9', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- pointers :: Longest Palindromic Substring (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'longest-palindromic-substring',
    'pointers',
    'function',
    'go',
    'Longest Palindromic Substring',
    '## Longest Palindromic Substring

Write a function that returns the longest palindromic substring of `s`, using the expand-around-center two-pointer technique. If multiple substrings of the same maximum length qualify, return the one whose center is encountered first when scanning `s` from left to right.

**Function signature**

```go
func LongestPalindromicSubstring(s string) string
```

**Examples**

- `LongestPalindromicSubstring("babad")` returns `"bab"`
- `LongestPalindromicSubstring("cbbd")` returns `"bb"`

**Constraints**

- 0 <= len(s) <= 2000

**Learning objective:** Apply the expand-around-center technique and reason carefully about tie-breaking to keep results deterministic.',
    'LongestPalindromicSubstring',
    'string',
    '{"string"}',
    '{"Every palindrome has a center: either a single character (odd length) or a gap between two characters (even length).","Expanding outward with two pointers from a candidate center, as long as the characters on both sides match, finds the longest palindrome centered there.","Scanning every possible center from left to right and keeping the longest palindrome found (only replacing it on a strictly longer match) gives a single, unambiguous answer."}',
    5,
    220,
    '{"two-pointers","strings"}',
    true,
    'seed-pointers-longest-palindromic-substring',
    '## Longest Palindromic Substring

Write a function that returns the longest palindromic substring of `s`, using the expand-around-center two-pointer technique. If multiple substrings of the same maximum length qualify, return the one whose center is encountered first when scanning `s` from left to right.

**Function signature**

```go
func LongestPalindromicSubstring(s string) string
```

**Examples**

- `LongestPalindromicSubstring("babad")` returns `"bab"`
- `LongestPalindromicSubstring("cbbd")` returns `"bb"`

**Constraints**

- 0 <= len(s) <= 2000

**Learning objective:** Apply the expand-around-center technique and reason carefully about tie-breaking to keep results deterministic.'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-palindromic-substring'), '["babad"]'::jsonb, 'bab', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-palindromic-substring'), '["cbbd"]'::jsonb, 'bb', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-palindromic-substring'), '["a"]'::jsonb, 'a', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-palindromic-substring'), '["ac"]'::jsonb, 'a', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-palindromic-substring'), '["forgeeksskeegfor"]'::jsonb, 'geeksskeeg', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

COMMIT;

-- ---- Verification: problem count per module (expect 15 / 15 / 15) ----
SELECT module, COUNT(*) AS problem_count
FROM problems
WHERE module IN ('bit-manipulation', 'sorting-searching', 'pointers')
GROUP BY module
ORDER BY module;

-- ---- Verification: test case count per problem (expect 5 for every row) ----
SELECT p.slug, COUNT(tc.id) AS test_case_count
FROM problems p
JOIN test_cases tc ON tc.problem_id = p.id
WHERE p.module IN ('bit-manipulation', 'sorting-searching', 'pointers')
GROUP BY p.slug
HAVING COUNT(tc.id) <> 5
ORDER BY p.slug;
-- An empty result set above confirms every problem has exactly 5 test cases.