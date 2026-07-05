-- ============================================================================
-- Koder :: Problem Seed Migration (Batch 4)
-- Hash Maps & Sets / Linked Lists / Trees & Graphs / Dynamic Programming
-- (15 problems each)
-- Every expected test-case value below is computed programmatically from a
-- Python reference implementation of the intended Go solution before being
-- written into this script, so a correct submission is guaranteed to pass.
-- 
-- Representation conventions:
--   * Linked lists are slices of node values in head-to-tail order, except where a
--     problem needs pointer-level indirection (a `next` index slice), matching the
--     convention already used in the data-structures module.
--   * Binary trees are level-order slices (root at 0, children of i at 2i+1/2i+2,
--     -1 = missing node), matching the convention already used for tree problems.
--   * Graphs are n nodes plus a flattened edge-pair slice [u0,v0,u1,v1,...].
-- ============================================================================

BEGIN;

-- ---- hashmaps-sets :: Contains Duplicate (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'contains-duplicate',
    'hashmaps-sets',
    'function',
    'go',
    'Contains Duplicate',
    'Write a function that returns whether any value appears more than once in a slice `nums`, using a set for O(n) time.',
    '- 0 <= len(nums) <= 10000',
    'Use set membership as the fastest way to answer a ''has this been seen before?'' question.',
    'ContainsDuplicate',
    'bool',
    '{"[]int"}',
    '{"A set only ever stores each distinct value once, no matter how many times it''s inserted.","If the set built from the slice ends up smaller than the slice itself, some value must have repeated.","This check runs in a single pass and avoids the need for nested loops or sorting."}',
    1,
    70,
    '{"hash-sets","beginner"}',
    true,
    'seed-hashmaps-sets-contains-duplicate',
    '## Contains Duplicate

Write a function that returns whether any value appears more than once in a slice `nums`, using a set for O(n) time.

**Function signature**

```go
func ContainsDuplicate(nums []int) bool
```

**Examples**

- `ContainsDuplicate([1, 2, 3, 1])` returns `true`
- `ContainsDuplicate([1, 2, 3, 4])` returns `false`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Use set membership as the fastest way to answer a ''has this been seen before?'' question.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'contains-duplicate'), '[[1,2,3,1]]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'contains-duplicate'), '[[1,2,3,4]]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'contains-duplicate'), '[[]]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'contains-duplicate'), '[[7,7]]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'contains-duplicate'), '[[5]]'::jsonb, 'false', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- hashmaps-sets :: Count Distinct Elements (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'count-distinct',
    'hashmaps-sets',
    'function',
    'go',
    'Count Distinct Elements',
    'Write a function that returns the number of distinct values in a slice `nums`, using a set.',
    '- 0 <= len(nums) <= 10000',
    'Practice using set size as a direct answer to a counting question.',
    'CountDistinct',
    'int',
    '{"[]int"}',
    '{"Inserting every element of the slice into a set automatically discards duplicates.","The size of the resulting set is the number of distinct values.","An empty slice has zero distinct elements."}',
    1,
    70,
    '{"hash-sets","beginner"}',
    true,
    'seed-hashmaps-sets-count-distinct',
    '## Count Distinct Elements

Write a function that returns the number of distinct values in a slice `nums`, using a set.

**Function signature**

```go
func CountDistinct(nums []int) int
```

**Examples**

- `CountDistinct([1, 2, 2, 3])` returns `3`
- `CountDistinct([])` returns `0`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Practice using set size as a direct answer to a counting question.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-distinct'), '[[1,2,2,3]]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-distinct'), '[[]]'::jsonb, '0', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-distinct'), '[[5,5,5]]'::jsonb, '1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-distinct'), '[[1,2,3,4,5]]'::jsonb, '5', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-distinct'), '[[-1,-1,0,1]]'::jsonb, '3', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- hashmaps-sets :: First Unique Character (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'first-unique-char',
    'hashmaps-sets',
    'function',
    'go',
    'First Unique Character',
    'Write a function that returns the index of the first character in a string `s` that does not repeat anywhere else in `s`, or -1 if every character repeats.',
    '- 0 <= len(s) <= 10000',
    'Combine a frequency map with a second ordered pass to answer a ''first occurrence'' question.',
    'FirstUniqueChar',
    'int',
    '{"string"}',
    '{"A frequency map built in one pass tells you exactly how many times each character occurs.","Scan the string a second time, in order, and return the index of the first character whose count is exactly 1.","If no character has a count of exactly 1, return -1."}',
    1,
    70,
    '{"hash-maps","strings","beginner"}',
    true,
    'seed-hashmaps-sets-first-unique-char',
    '## First Unique Character

Write a function that returns the index of the first character in a string `s` that does not repeat anywhere else in `s`, or -1 if every character repeats.

**Function signature**

```go
func FirstUniqueChar(s string) int
```

**Examples**

- `FirstUniqueChar("leetcode")` returns `0`
- `FirstUniqueChar("aabb")` returns `-1`

**Constraints**

- 0 <= len(s) <= 10000

**Learning objective:** Combine a frequency map with a second ordered pass to answer a ''first occurrence'' question.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'first-unique-char'), '["leetcode"]'::jsonb, '0', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'first-unique-char'), '["aabb"]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'first-unique-char'), '[""]'::jsonb, '-1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'first-unique-char'), '["z"]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'first-unique-char'), '["loveleetcode"]'::jsonb, '2', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- hashmaps-sets :: Set Intersection (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'intersection-unique',
    'hashmaps-sets',
    'function',
    'go',
    'Set Intersection',
    'Write a function `IntersectionUnique(a, b []int) []int` that returns the distinct values that appear in both `a` and `b`, sorted in ascending order, using sets rather than nested loops.',
    '- 0 <= len(a), len(b) <= 10000',
    'Use set intersection as the natural operation for ''appears in both'' queries, distinct from the sorted two-pointer approach used elsewhere.',
    'IntersectionUnique',
    '[]int',
    '{"[]int","[]int"}',
    '{"Building a set from each slice lets you compare membership in O(1) instead of scanning repeatedly.","The intersection contains only values present in both sets, with each value appearing once regardless of how many times it repeated in either input.","Sort the result before returning it so there''s exactly one correct, deterministic order."}',
    2,
    110,
    '{"hash-sets","arrays"}',
    true,
    'seed-hashmaps-sets-intersection-unique',
    '## Set Intersection

Write a function `IntersectionUnique(a, b []int) []int` that returns the distinct values that appear in both `a` and `b`, sorted in ascending order, using sets rather than nested loops.

**Function signature**

```go
func IntersectionUnique(a []int, b []int) []int
```

**Examples**

- `IntersectionUnique([1, 2, 2, 1], [2, 2])` returns `[2]`
- `IntersectionUnique([4, 9, 5], [9, 4, 9, 8, 4])` returns `[4, 9]`

**Constraints**

- 0 <= len(a), len(b) <= 10000

**Learning objective:** Use set intersection as the natural operation for ''appears in both'' queries, distinct from the sorted two-pointer approach used elsewhere.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'intersection-unique'), '[[1,2,2,1],[2,2]]'::jsonb, '[2]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'intersection-unique'), '[[4,9,5],[9,4,9,8,4]]'::jsonb, '[4,9]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'intersection-unique'), '[[1,2],[3,4]]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'intersection-unique'), '[[],[1,2]]'::jsonb, '[]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'intersection-unique'), '[[5,5,5],[5]]'::jsonb, '[5]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- hashmaps-sets :: Set Union (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'union-unique',
    'hashmaps-sets',
    'function',
    'go',
    'Set Union',
    'Write a function `UnionUnique(a, b []int) []int` that returns the distinct values that appear in `a`, `b`, or both, sorted in ascending order, using sets.',
    '- 0 <= len(a), len(b) <= 10000',
    'Combine two collections into a deduplicated whole using set union rather than manual merging.',
    'UnionUnique',
    '[]int',
    '{"[]int","[]int"}',
    '{"A set naturally merges two collections while discarding duplicates.","Combine both slices into one set, then convert it back into a sorted slice for a deterministic result.","Values that appear in only one of the two inputs still belong in the union, exactly as if they were shared."}',
    2,
    110,
    '{"hash-sets","arrays"}',
    true,
    'seed-hashmaps-sets-union-unique',
    '## Set Union

Write a function `UnionUnique(a, b []int) []int` that returns the distinct values that appear in `a`, `b`, or both, sorted in ascending order, using sets.

**Function signature**

```go
func UnionUnique(a []int, b []int) []int
```

**Examples**

- `UnionUnique([1, 2, 3], [2, 3, 4])` returns `[1, 2, 3, 4]`
- `UnionUnique([], [1, 2])` returns `[1, 2]`

**Constraints**

- 0 <= len(a), len(b) <= 10000

**Learning objective:** Combine two collections into a deduplicated whole using set union rather than manual merging.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'union-unique'), '[[1,2,3],[2,3,4]]'::jsonb, '[1,2,3,4]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'union-unique'), '[[],[1,2]]'::jsonb, '[1,2]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'union-unique'), '[[5],[]]'::jsonb, '[5]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'union-unique'), '[[1,1,1],[1,1]]'::jsonb, '[1]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'union-unique'), '[[-2,-1],[1,2]]'::jsonb, '[-2,-1,1,2]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- hashmaps-sets :: Isomorphic Strings (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'is-isomorphic',
    'hashmaps-sets',
    'function',
    'go',
    'Isomorphic Strings',
    'Write a function `IsIsomorphic(s, t string) bool` that determines whether the characters in `s` can be consistently replaced (one-to-one, in both directions) to obtain `t`.',
    '- len(s) == len(t)
- 0 <= len(s) <= 10000',
    'Use two hash maps together to enforce a bijective (one-to-one, onto) character mapping.',
    'IsIsomorphic',
    'bool',
    '{"string","string"}',
    '{"Two strings are isomorphic if there''s a consistent one-to-one mapping from every character in one to a character in the other.","You need two maps, not just one — one direction alone can''t catch a character in t being reused for two different characters in s.","As you scan both strings together, check (and record) both the forward and backward mapping for every character pair."}',
    2,
    110,
    '{"hash-maps","strings"}',
    true,
    'seed-hashmaps-sets-is-isomorphic',
    '## Isomorphic Strings

Write a function `IsIsomorphic(s, t string) bool` that determines whether the characters in `s` can be consistently replaced (one-to-one, in both directions) to obtain `t`.

**Function signature**

```go
func IsIsomorphic(s string, t string) bool
```

**Examples**

- `IsIsomorphic("egg", "add")` returns `true`
- `IsIsomorphic("foo", "bar")` returns `false`

**Constraints**

- len(s) == len(t)
- 0 <= len(s) <= 10000

**Learning objective:** Use two hash maps together to enforce a bijective (one-to-one, onto) character mapping.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-isomorphic'), '["egg","add"]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-isomorphic'), '["foo","bar"]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-isomorphic'), '["paper","title"]'::jsonb, 'true', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-isomorphic'), '["badc","baba"]'::jsonb, 'false', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-isomorphic'), '["",""]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- hashmaps-sets :: Word Pattern Matching (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'word-pattern-matches',
    'hashmaps-sets',
    'function',
    'go',
    'Word Pattern Matching',
    'Write a function `WordPatternMatches(pattern string, s string) bool` that determines whether the space-separated words in `s` follow the same pattern as `pattern` — each pattern character must map to exactly one distinct word, and each word must map back to exactly one pattern character.',
    '- 0 <= len(pattern) <= 1000
- 0 <= len(s) <= 10000',
    'Extend the two-way hash map bijection technique from characters to whole tokens.',
    'WordPatternMatches',
    'bool',
    '{"string","string"}',
    '{"Split the sentence into words the same way you''d split any space-separated string.","The number of words must match the number of pattern characters, or the match fails immediately.","This is the same bijective-mapping idea as isomorphic strings, just matching pattern characters to whole words instead of characters to characters."}',
    3,
    150,
    '{"hash-maps","strings"}',
    true,
    'seed-hashmaps-sets-word-pattern-matches',
    '## Word Pattern Matching

Write a function `WordPatternMatches(pattern string, s string) bool` that determines whether the space-separated words in `s` follow the same pattern as `pattern` — each pattern character must map to exactly one distinct word, and each word must map back to exactly one pattern character.

**Function signature**

```go
func WordPatternMatches(pattern string, s string) bool
```

**Examples**

- `WordPatternMatches("abba", "dog cat cat dog")` returns `true`
- `WordPatternMatches("abba", "dog cat cat fish")` returns `false`

**Constraints**

- 0 <= len(pattern) <= 1000
- 0 <= len(s) <= 10000

**Learning objective:** Extend the two-way hash map bijection technique from characters to whole tokens.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'word-pattern-matches'), '["abba","dog cat cat dog"]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'word-pattern-matches'), '["abba","dog cat cat fish"]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'word-pattern-matches'), '["aaaa","dog cat cat dog"]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'word-pattern-matches'), '["abc","dog dog dog"]'::jsonb, 'false', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'word-pattern-matches'), '["",""]'::jsonb, 'false', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- hashmaps-sets :: Count Anagram Groups (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'count-anagram-groups',
    'hashmaps-sets',
    'function',
    'go',
    'Count Anagram Groups',
    'Write a function that returns the number of distinct anagram groups among the strings in `words` — two words belong to the same group if one can be rearranged into the other.',
    '- 0 <= len(words) <= 10000',
    'Use a canonical form (sorted characters) as a hash map key to group related items.',
    'CountAnagramGroups',
    'int',
    '{"[]string"}',
    '{"Two words are anagrams of each other exactly when their sorted letters are identical.","Using each word''s sorted-letters form as a key naturally groups every anagram together under the same key.","The number of distinct keys is the number of distinct anagram groups, regardless of how many words fall into each group."}',
    3,
    150,
    '{"hash-maps","strings"}',
    true,
    'seed-hashmaps-sets-count-anagram-groups',
    '## Count Anagram Groups

Write a function that returns the number of distinct anagram groups among the strings in `words` — two words belong to the same group if one can be rearranged into the other.

**Function signature**

```go
func CountAnagramGroups(words []string) int
```

**Examples**

- `CountAnagramGroups(["eat", "tea", "tan", "ate", "nat", "bat"])` returns `3`
- `CountAnagramGroups(["a"])` returns `1`

**Constraints**

- 0 <= len(words) <= 10000

**Learning objective:** Use a canonical form (sorted characters) as a hash map key to group related items.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-anagram-groups'), '[["eat","tea","tan","ate","nat","bat"]]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-anagram-groups'), '[["a"]]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-anagram-groups'), '[[]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-anagram-groups'), '[["abc","bca","cab"]]'::jsonb, '1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-anagram-groups'), '[["x","y","z"]]'::jsonb, '3', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- hashmaps-sets :: Longest Consecutive Sequence (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'longest-consecutive-sequence',
    'hashmaps-sets',
    'function',
    'go',
    'Longest Consecutive Sequence',
    'Write a function that returns the length of the longest run of consecutive integers that can be formed from the values in `nums` (the values do not need to be adjacent in `nums` itself), using a set and achieving O(n) time overall.',
    '- 0 <= len(nums) <= 10000',
    'Use set membership checks to find sequence runs in linear time, avoiding an O(n log n) sort.',
    'LongestConsecutiveSequence',
    'int',
    '{"[]int"}',
    '{"Put every value into a set first so you can check whether any given value is present in O(1).","Only start counting a run from a value x if x-1 is not in the set — that guarantees x is the start of its run, so no run gets counted more than once.","From each valid starting point, keep checking x+1, x+2, ... as long as they''re in the set, tracking the longest run found."}',
    3,
    150,
    '{"hash-sets","arrays"}',
    true,
    'seed-hashmaps-sets-longest-consecutive-sequence',
    '## Longest Consecutive Sequence

Write a function that returns the length of the longest run of consecutive integers that can be formed from the values in `nums` (the values do not need to be adjacent in `nums` itself), using a set and achieving O(n) time overall.

**Function signature**

```go
func LongestConsecutiveSequence(nums []int) int
```

**Examples**

- `LongestConsecutiveSequence([100, 4, 200, 1, 3, 2])` returns `4`
- `LongestConsecutiveSequence([])` returns `0`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Use set membership checks to find sequence runs in linear time, avoiding an O(n log n) sort.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-consecutive-sequence'), '[[100,4,200,1,3,2]]'::jsonb, '4', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-consecutive-sequence'), '[[]]'::jsonb, '0', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-consecutive-sequence'), '[[1,2,0,1]]'::jsonb, '3', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-consecutive-sequence'), '[[9,1,4,7,3,-1,0,5,8,-1,6]]'::jsonb, '7', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-consecutive-sequence'), '[[5]]'::jsonb, '1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- hashmaps-sets :: Subarray Sum Equals K (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'subarray-sum-equals-k',
    'hashmaps-sets',
    'function',
    'go',
    'Subarray Sum Equals K',
    'Write a function `SubarraySumEqualsK(nums []int, k int) int` that returns the number of contiguous subarrays of `nums` whose elements sum to `k`, using a running prefix sum and a hash map in O(n) time.',
    '- 0 <= len(nums) <= 10000
- -1000 <= nums[i] <= 1000',
    'Combine the prefix-sum technique with a hash map of counts to count subarrays in linear time.',
    'SubarraySumEqualsK',
    'int',
    '{"[]int","int"}',
    '{"A running prefix sum lets you express any subarray''s sum as the difference of two prefix sums.","A subarray ending at index i sums to k exactly when some earlier prefix sum equals (current prefix sum - k) — track how many times each prefix sum has occurred.","Seed your frequency map with {0: 1} before scanning, so subarrays starting at index 0 are counted correctly."}',
    4,
    190,
    '{"hash-maps","prefix-sum"}',
    true,
    'seed-hashmaps-sets-subarray-sum-equals-k',
    '## Subarray Sum Equals K

Write a function `SubarraySumEqualsK(nums []int, k int) int` that returns the number of contiguous subarrays of `nums` whose elements sum to `k`, using a running prefix sum and a hash map in O(n) time.

**Function signature**

```go
func SubarraySumEqualsK(nums []int, k int) int
```

**Examples**

- `SubarraySumEqualsK([1, 1, 1], 2)` returns `2`
- `SubarraySumEqualsK([1, 2, 3], 3)` returns `2`

**Constraints**

- 0 <= len(nums) <= 10000
- -1000 <= nums[i] <= 1000

**Learning objective:** Combine the prefix-sum technique with a hash map of counts to count subarrays in linear time.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'subarray-sum-equals-k'), '[[1,1,1],2]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'subarray-sum-equals-k'), '[[1,2,3],3]'::jsonb, '2', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'subarray-sum-equals-k'), '[[1],0]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'subarray-sum-equals-k'), '[[1,-1,0],0]'::jsonb, '3', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'subarray-sum-equals-k'), '[[3,4,7,2,-3,1,4,2],7]'::jsonb, '4', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- hashmaps-sets :: Contains Nearby Duplicate (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'contains-nearby-duplicate',
    'hashmaps-sets',
    'function',
    'go',
    'Contains Nearby Duplicate',
    'Write a function `ContainsNearbyDuplicate(nums []int, k int) bool` that returns whether there exist two equal values in `nums` at indices `i` and `j` with `abs(i - j) <= k`.',
    '- 0 <= len(nums) <= 10000
- 0 <= k <= 10000',
    'Track the most recent index of each value in a hash map to answer a proximity-constrained duplicate question in one pass.',
    'ContainsNearbyDuplicate',
    'bool',
    '{"[]int","int"}',
    '{"A hash map from value to its most recent index lets you check the distance to a previous occurrence in O(1).","Whenever you encounter a value you''ve seen before, compare the current index to its last-seen index.","Update the last-seen index for every value as you scan, whether or not it triggers a match."}',
    4,
    190,
    '{"hash-maps","arrays"}',
    true,
    'seed-hashmaps-sets-contains-nearby-duplicate',
    '## Contains Nearby Duplicate

Write a function `ContainsNearbyDuplicate(nums []int, k int) bool` that returns whether there exist two equal values in `nums` at indices `i` and `j` with `abs(i - j) <= k`.

**Function signature**

```go
func ContainsNearbyDuplicate(nums []int, k int) bool
```

**Examples**

- `ContainsNearbyDuplicate([1, 2, 3, 1], 3)` returns `true`
- `ContainsNearbyDuplicate([1, 0, 1, 1], 1)` returns `true`

**Constraints**

- 0 <= len(nums) <= 10000
- 0 <= k <= 10000

**Learning objective:** Track the most recent index of each value in a hash map to answer a proximity-constrained duplicate question in one pass.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'contains-nearby-duplicate'), '[[1,2,3,1],3]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'contains-nearby-duplicate'), '[[1,0,1,1],1]'::jsonb, 'true', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'contains-nearby-duplicate'), '[[1,2,3,1,2,3],2]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'contains-nearby-duplicate'), '[[],5]'::jsonb, 'false', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'contains-nearby-duplicate'), '[[9,9],0]'::jsonb, 'false', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- hashmaps-sets :: Most Frequent Element (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'most-frequent-element',
    'hashmaps-sets',
    'function',
    'go',
    'Most Frequent Element',
    'Write a function that returns the value that occurs most frequently in `nums`. If multiple values are tied for the highest frequency, return the smallest of them.',
    '- 1 <= len(nums) <= 10000',
    'Use a frequency map together with an explicit, documented tie-breaking rule.',
    'MostFrequentElement',
    'int',
    '{"[]int"}',
    '{"A frequency map built in one pass tells you exactly how often each value occurs.","When multiple values tie for the highest frequency, the smallest such value should be reported, so break ties by scanning candidates in ascending order.","An empty slice never occurs in the test data for this problem, so there''s always a well-defined answer."}',
    4,
    190,
    '{"hash-maps","arrays"}',
    true,
    'seed-hashmaps-sets-most-frequent-element',
    '## Most Frequent Element

Write a function that returns the value that occurs most frequently in `nums`. If multiple values are tied for the highest frequency, return the smallest of them.

**Function signature**

```go
func MostFrequentElement(nums []int) int
```

**Examples**

- `MostFrequentElement([1, 3, 2, 3, 1, 3])` returns `3`
- `MostFrequentElement([5])` returns `5`

**Constraints**

- 1 <= len(nums) <= 10000

**Learning objective:** Use a frequency map together with an explicit, documented tie-breaking rule.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'most-frequent-element'), '[[1,3,2,3,1,3]]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'most-frequent-element'), '[[5]]'::jsonb, '5', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'most-frequent-element'), '[[4,4,6,6]]'::jsonb, '4', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'most-frequent-element'), '[[7,8,9]]'::jsonb, '7', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'most-frequent-element'), '[[-1,-1,-2,-2,-2]]'::jsonb, '-2', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- hashmaps-sets :: Longest Subarray With Equal 0s and 1s (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'longest-equal-binary-subarray',
    'hashmaps-sets',
    'function',
    'go',
    'Longest Subarray With Equal 0s and 1s',
    'Given a slice `nums` containing only 0s and 1s, write a function that returns the length of the longest contiguous subarray containing an equal number of 0s and 1s, using a running sum and a hash map of first-seen positions.',
    '- 0 <= len(nums) <= 10000
- Every value in nums is 0 or 1',
    'Convert a counting-balance condition into a repeated-prefix-sum lookup, a versatile hash map pattern.',
    'LongestEqualBinarySubarray',
    'int',
    '{"[]int"}',
    '{"Treat each 0 as -1 and each 1 as +1, and track a running total as you scan — a subarray has equal 0s and 1s exactly when its running total is unchanged from start to end.","Record the first index at which each running-total value occurs; seed index -1 with a running total of 0 to correctly handle subarrays starting at position 0.","Whenever the running total repeats a previously seen value, the subarray between those two indices has an equal count of 0s and 1s — track the longest such span."}',
    5,
    220,
    '{"hash-maps","prefix-sum"}',
    true,
    'seed-hashmaps-sets-longest-equal-binary-subarray',
    '## Longest Subarray With Equal 0s and 1s

Given a slice `nums` containing only 0s and 1s, write a function that returns the length of the longest contiguous subarray containing an equal number of 0s and 1s, using a running sum and a hash map of first-seen positions.

**Function signature**

```go
func LongestEqualBinarySubarray(nums []int) int
```

**Examples**

- `LongestEqualBinarySubarray([0, 1])` returns `2`
- `LongestEqualBinarySubarray([0, 1, 0])` returns `2`

**Constraints**

- 0 <= len(nums) <= 10000
- Every value in nums is 0 or 1

**Learning objective:** Convert a counting-balance condition into a repeated-prefix-sum lookup, a versatile hash map pattern.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-equal-binary-subarray'), '[[0,1]]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-equal-binary-subarray'), '[[0,1,0]]'::jsonb, '2', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-equal-binary-subarray'), '[[0,0,1,0,0,0,1,1]]'::jsonb, '6', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-equal-binary-subarray'), '[[]]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-equal-binary-subarray'), '[[1,1,1,0]]'::jsonb, '2', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- hashmaps-sets :: Four Sum Count II (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'four-sum-count',
    'hashmaps-sets',
    'function',
    'go',
    'Four Sum Count II',
    'Given four slices `a`, `b`, `c`, `d` of equal length `n`, write a function that returns the number of index tuples `(i, j, k, l)` such that `a[i] + b[j] + c[k] + d[l] == 0`, using hash maps to avoid an O(n^4) brute force.',
    '- 0 <= len(a) == len(b) == len(c) == len(d) <= 200',
    'Split a four-way combinatorial search into two two-way searches joined through a hash map, a classic complexity-reduction technique.',
    'FourSumCount',
    'int',
    '{"[]int","[]int","[]int","[]int"}',
    '{"Instead of checking every combination of four elements directly (which would be far too slow), precompute every possible pairwise sum from the first two slices.","A hash map of {sum: count} for all a[i]+b[j] pairs lets you check how many pairs produce any given total in O(1).","For each pair from the remaining two slices, the number of valid quadruplets it completes is exactly the count of pairs from the first two slices whose sum is the negation of the current pair''s sum."}',
    5,
    220,
    '{"hash-maps","arrays"}',
    true,
    'seed-hashmaps-sets-four-sum-count',
    '## Four Sum Count II

Given four slices `a`, `b`, `c`, `d` of equal length `n`, write a function that returns the number of index tuples `(i, j, k, l)` such that `a[i] + b[j] + c[k] + d[l] == 0`, using hash maps to avoid an O(n^4) brute force.

**Function signature**

```go
func FourSumCount(a []int, b []int, c []int, d []int) int
```

**Examples**

- `FourSumCount([1, 2], [-2, -1], [-1, 2], [0, 2])` returns `2`
- `FourSumCount([0], [0], [0], [0])` returns `1`

**Constraints**

- 0 <= len(a) == len(b) == len(c) == len(d) <= 200

**Learning objective:** Split a four-way combinatorial search into two two-way searches joined through a hash map, a classic complexity-reduction technique.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'four-sum-count'), '[[1,2],[-2,-1],[-1,2],[0,2]]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'four-sum-count'), '[[0],[0],[0],[0]]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'four-sum-count'), '[[],[],[],[]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'four-sum-count'), '[[1,-1],[1,-1],[1,-1],[1,-1]]'::jsonb, '6', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'four-sum-count'), '[[2,2],[-1,-1],[-1,-1],[0,0]]'::jsonb, '16', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- hashmaps-sets :: Subarray Sum a Multiple of K (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'check-subarray-sum-multiple',
    'hashmaps-sets',
    'function',
    'go',
    'Subarray Sum a Multiple of K',
    'Write a function `CheckSubarraySumMultiple(nums []int, k int) bool` that returns whether `nums` contains a contiguous subarray of length at least 2 whose sum is a multiple of `k`, using prefix sums and a hash map of remainders in O(n) time.',
    '- 0 <= len(nums) <= 10000
- 0 <= nums[i] <= 10^5
- 0 <= k <= 10^5',
    'Apply the modular-prefix-sum hash map pattern to a divisibility condition instead of an exact-sum condition.',
    'CheckSubarraySumMultiple',
    'bool',
    '{"[]int","int"}',
    '{"Two prefix sums that leave the same remainder modulo k mean the subarray between them sums to a multiple of k.","Track only the first index at which each remainder occurs — a later occurrence at the same remainder immediately gives you a valid subarray.","The subarray must have length at least 2, so check the distance between the two matching indices before accepting a match, but don''t overwrite the first-seen index once it''s recorded."}',
    5,
    220,
    '{"hash-maps","prefix-sum"}',
    true,
    'seed-hashmaps-sets-check-subarray-sum-multiple',
    '## Subarray Sum a Multiple of K

Write a function `CheckSubarraySumMultiple(nums []int, k int) bool` that returns whether `nums` contains a contiguous subarray of length at least 2 whose sum is a multiple of `k`, using prefix sums and a hash map of remainders in O(n) time.

**Function signature**

```go
func CheckSubarraySumMultiple(nums []int, k int) bool
```

**Examples**

- `CheckSubarraySumMultiple([23, 2, 4, 6, 7], 6)` returns `true`
- `CheckSubarraySumMultiple([23, 2, 6, 4, 7], 6)` returns `true`

**Constraints**

- 0 <= len(nums) <= 10000
- 0 <= nums[i] <= 10^5
- 0 <= k <= 10^5

**Learning objective:** Apply the modular-prefix-sum hash map pattern to a divisibility condition instead of an exact-sum condition.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'check-subarray-sum-multiple'), '[[23,2,4,6,7],6]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'check-subarray-sum-multiple'), '[[23,2,6,4,7],6]'::jsonb, 'true', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'check-subarray-sum-multiple'), '[[1,0],2]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'check-subarray-sum-multiple'), '[[],5]'::jsonb, 'false', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'check-subarray-sum-multiple'), '[[5,0,0],3]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- linked-lists :: Linked List Length (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'linked-list-length',
    'linked-lists',
    'function',
    'go',
    'Linked List Length',
    'A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function that returns the number of nodes in the list.',
    '- 0 <= len(nums) <= 10000',
    'Establish the basic traversal-and-count pattern that every other linked-list exercise builds on.',
    'LinkedListLength',
    'int',
    '{"[]int"}',
    '{"A singly linked list can only be measured by walking it node by node from the head.","Each step along the list increases a running counter by one.","An empty list (no nodes at all) has a length of 0."}',
    1,
    70,
    '{"linked-lists","beginner"}',
    true,
    'seed-linked-lists-linked-list-length',
    '## Linked List Length

A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function that returns the number of nodes in the list.

**Function signature**

```go
func LinkedListLength(nums []int) int
```

**Examples**

- `LinkedListLength([1, 2, 3])` returns `3`
- `LinkedListLength([])` returns `0`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Establish the basic traversal-and-count pattern that every other linked-list exercise builds on.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'linked-list-length'), '[[1,2,3]]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'linked-list-length'), '[[]]'::jsonb, '0', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'linked-list-length'), '[[9]]'::jsonb, '1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'linked-list-length'), '[[1,2,3,4,5]]'::jsonb, '5', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'linked-list-length'), '[[0,0]]'::jsonb, '2', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- linked-lists :: Get Nth Node (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'get-nth-node',
    'linked-lists',
    'function',
    'go',
    'Get Nth Node',
    'A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function `GetNthNode(nums []int, n int) int` that returns the value at the 0-indexed position `n`, or -1 if `n` is out of bounds.',
    '- 0 <= len(nums) <= 10000',
    'Practice positional traversal, the building block for every indexed linked-list operation.',
    'GetNthNode',
    'int',
    '{"[]int","int"}',
    '{"Walking n steps forward from the head lands you exactly on the node at position n (0-indexed).","Always check that n is a valid position before returning a value.","Return -1 for any n that falls outside the list''s bounds, including negative values."}',
    1,
    70,
    '{"linked-lists","beginner"}',
    true,
    'seed-linked-lists-get-nth-node',
    '## Get Nth Node

A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function `GetNthNode(nums []int, n int) int` that returns the value at the 0-indexed position `n`, or -1 if `n` is out of bounds.

**Function signature**

```go
func GetNthNode(nums []int, n int) int
```

**Examples**

- `GetNthNode([10, 20, 30], 1)` returns `20`
- `GetNthNode([10, 20, 30], 5)` returns `-1`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Practice positional traversal, the building block for every indexed linked-list operation.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'get-nth-node'), '[[10,20,30],1]'::jsonb, '20', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'get-nth-node'), '[[10,20,30],5]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'get-nth-node'), '[[10,20,30],-1]'::jsonb, '-1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'get-nth-node'), '[[7],0]'::jsonb, '7', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'get-nth-node'), '[[],0]'::jsonb, '-1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- linked-lists :: Sum of Linked List Values (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'linked-list-sum',
    'linked-lists',
    'function',
    'go',
    'Sum of Linked List Values',
    'A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function that returns the sum of all node values.',
    '- 0 <= len(nums) <= 10000
- -10^6 <= nums[i] <= 10^6',
    'Apply the accumulator pattern to a traversal-based structure instead of a plain array.',
    'LinkedListSum',
    'int',
    '{"[]int"}',
    '{"Walking the list once and adding up each node''s value along the way gives the total.","An accumulator initialized to 0 handles the empty-list case correctly without any special casing.","This is the same accumulator pattern used for summing a plain slice, applied to a linked structure."}',
    1,
    70,
    '{"linked-lists","beginner"}',
    true,
    'seed-linked-lists-linked-list-sum',
    '## Sum of Linked List Values

A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function that returns the sum of all node values.

**Function signature**

```go
func LinkedListSum(nums []int) int
```

**Examples**

- `LinkedListSum([1, 2, 3])` returns `6`
- `LinkedListSum([])` returns `0`

**Constraints**

- 0 <= len(nums) <= 10000
- -10^6 <= nums[i] <= 10^6

**Learning objective:** Apply the accumulator pattern to a traversal-based structure instead of a plain array.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'linked-list-sum'), '[[1,2,3]]'::jsonb, '6', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'linked-list-sum'), '[[]]'::jsonb, '0', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'linked-list-sum'), '[[-5,5]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'linked-list-sum'), '[[100]]'::jsonb, '100', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'linked-list-sum'), '[[10,20,30,40]]'::jsonb, '100', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- linked-lists :: Delete Node by Value (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'delete-node-by-value',
    'linked-lists',
    'function',
    'go',
    'Delete Node by Value',
    'A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function `DeleteNodeByValue(nums []int, val int) []int` that removes the first node with value `val` and returns the resulting list. If no node has that value, return the list unchanged.',
    '- 0 <= len(nums) <= 10000',
    'Practice splicing a single node out of a linked structure by value rather than by position.',
    'DeleteNodeByValue',
    '[]int',
    '{"[]int","int"}',
    '{"Walk the list looking for the first node whose value matches, and splice it out once found.","Only the first matching node should be removed — later nodes with the same value are left untouched.","If no node matches, the list should come back completely unchanged."}',
    2,
    110,
    '{"linked-lists"}',
    true,
    'seed-linked-lists-delete-node-by-value',
    '## Delete Node by Value

A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function `DeleteNodeByValue(nums []int, val int) []int` that removes the first node with value `val` and returns the resulting list. If no node has that value, return the list unchanged.

**Function signature**

```go
func DeleteNodeByValue(nums []int, val int) []int
```

**Examples**

- `DeleteNodeByValue([1, 2, 3, 2], 2)` returns `[1, 3, 2]`
- `DeleteNodeByValue([5, 5, 5], 9)` returns `[5, 5, 5]`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Practice splicing a single node out of a linked structure by value rather than by position.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'delete-node-by-value'), '[[1,2,3,2],2]'::jsonb, '[1,3,2]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'delete-node-by-value'), '[[5,5,5],9]'::jsonb, '[5,5,5]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'delete-node-by-value'), '[[],1]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'delete-node-by-value'), '[[1],1]'::jsonb, '[]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'delete-node-by-value'), '[[4,5,6],6]'::jsonb, '[4,5]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- linked-lists :: Insert at Position (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'insert-at-position',
    'linked-lists',
    'function',
    'go',
    'Insert at Position',
    'A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function `InsertAtPosition(nums []int, val, pos int) []int` that inserts a new node with value `val` at 0-indexed position `pos` and returns the resulting list. If `pos` is greater than the list''s length, insert at the end; if it''s negative, insert at the head.',
    '- 0 <= len(nums) <= 10000',
    'Handle the three distinct insertion cases — head, middle, and tail — with a single clamped position.',
    'InsertAtPosition',
    '[]int',
    '{"[]int","int","int"}',
    '{"Walking to the node just before the target position lets you splice a new node in right after it.","A position of 0 means inserting at the very head of the list, before any existing node.","If the requested position is beyond the end of the list, clamp it so the new node is simply appended at the tail."}',
    2,
    110,
    '{"linked-lists"}',
    true,
    'seed-linked-lists-insert-at-position',
    '## Insert at Position

A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function `InsertAtPosition(nums []int, val, pos int) []int` that inserts a new node with value `val` at 0-indexed position `pos` and returns the resulting list. If `pos` is greater than the list''s length, insert at the end; if it''s negative, insert at the head.

**Function signature**

```go
func InsertAtPosition(nums []int, val int, pos int) []int
```

**Examples**

- `InsertAtPosition([1, 2, 3], 99, 1)` returns `[1, 99, 2, 3]`
- `InsertAtPosition([1, 2, 3], 0, 0)` returns `[0, 1, 2, 3]`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Handle the three distinct insertion cases — head, middle, and tail — with a single clamped position.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'insert-at-position'), '[[1,2,3],99,1]'::jsonb, '[1,99,2,3]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'insert-at-position'), '[[1,2,3],0,0]'::jsonb, '[0,1,2,3]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'insert-at-position'), '[[1,2,3],4,10]'::jsonb, '[1,2,3,4]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'insert-at-position'), '[[],5,0]'::jsonb, '[5]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'insert-at-position'), '[[1,2],0,-3]'::jsonb, '[0,1,2]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- linked-lists :: Swap Nodes in Pairs (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'swap-pairs',
    'linked-lists',
    'function',
    'go',
    'Swap Nodes in Pairs',
    'A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function that swaps every pair of adjacent nodes and returns the resulting list. If the list has an odd number of nodes, the last node is left in its original position.',
    '- 0 <= len(nums) <= 10000',
    'Practice pairwise structural rearrangement, a common warm-up for more advanced linked-list manipulation.',
    'SwapPairsInLinkedList',
    '[]int',
    '{"[]int"}',
    '{"Process the list two nodes at a time, swapping each adjacent pair.","If the list has an odd number of nodes, the very last one has no partner and stays in place.","This is a structural rearrangement, not a value-based one — the swap happens purely based on position."}',
    2,
    110,
    '{"linked-lists"}',
    true,
    'seed-linked-lists-swap-pairs',
    '## Swap Nodes in Pairs

A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function that swaps every pair of adjacent nodes and returns the resulting list. If the list has an odd number of nodes, the last node is left in its original position.

**Function signature**

```go
func SwapPairsInLinkedList(nums []int) []int
```

**Examples**

- `SwapPairsInLinkedList([1, 2, 3, 4])` returns `[2, 1, 4, 3]`
- `SwapPairsInLinkedList([1, 2, 3])` returns `[2, 1, 3]`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Practice pairwise structural rearrangement, a common warm-up for more advanced linked-list manipulation.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'swap-pairs'), '[[1,2,3,4]]'::jsonb, '[2,1,4,3]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'swap-pairs'), '[[1,2,3]]'::jsonb, '[2,1,3]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'swap-pairs'), '[[]]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'swap-pairs'), '[[1]]'::jsonb, '[1]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'swap-pairs'), '[[1,2,3,4,5,6]]'::jsonb, '[2,1,4,3,6,5]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- linked-lists :: Nth Node From the End (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'nth-from-end',
    'linked-lists',
    'function',
    'go',
    'Nth Node From the End',
    'A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function `NthFromEnd(nums []int, n int) int` that returns the value of the `n`-th node from the end (1-indexed, so n=1 is the last node), or -1 if `n` exceeds the list''s length.',
    '- 0 <= len(nums) <= 10000
- n >= 1',
    'Apply the two-pointer offset technique to locate a position relative to the end without knowing the length up front.',
    'NthFromEnd',
    'int',
    '{"[]int","int"}',
    '{"The nth node from the end (1-indexed) is at a fixed offset from the head, once you know the list''s total length.","A two-pointer approach can find this in a single pass: advance one pointer n steps ahead, then move both pointers together until the lead pointer reaches the end.","If n is larger than the list''s length, there is no valid answer — return -1."}',
    3,
    150,
    '{"linked-lists","two-pointers"}',
    true,
    'seed-linked-lists-nth-from-end',
    '## Nth Node From the End

A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function `NthFromEnd(nums []int, n int) int` that returns the value of the `n`-th node from the end (1-indexed, so n=1 is the last node), or -1 if `n` exceeds the list''s length.

**Function signature**

```go
func NthFromEnd(nums []int, n int) int
```

**Examples**

- `NthFromEnd([1, 2, 3, 4, 5], 2)` returns `4`
- `NthFromEnd([1, 2, 3], 5)` returns `-1`

**Constraints**

- 0 <= len(nums) <= 10000
- n >= 1

**Learning objective:** Apply the two-pointer offset technique to locate a position relative to the end without knowing the length up front.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'nth-from-end'), '[[1,2,3,4,5],2]'::jsonb, '4', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'nth-from-end'), '[[1,2,3],5]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'nth-from-end'), '[[7],1]'::jsonb, '7', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'nth-from-end'), '[[],1]'::jsonb, '-1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'nth-from-end'), '[[1,2,3,4],4]'::jsonb, '1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- linked-lists :: Remove Nth Node From End (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'remove-nth-from-end',
    'linked-lists',
    'function',
    'go',
    'Remove Nth Node From End',
    'A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function `RemoveNthFromEnd(nums []int, n int) []int` that removes the `n`-th node from the end (1-indexed) and returns the resulting list. If `n` is out of range, return the list unchanged.',
    '- 0 <= len(nums) <= 10000
- n >= 1',
    'Combine positional location with structural removal in a single coherent operation.',
    'RemoveNthFromEnd',
    '[]int',
    '{"[]int","int"}',
    '{"This builds directly on finding the nth node from the end — once you can locate it, removing it is a matter of splicing it out.","The two-pointer offset technique still applies: advance a lead pointer n steps first, then move both pointers together to find the removal point in one pass.","If n is out of range for the given list, leave the list unchanged rather than attempting an invalid removal."}',
    3,
    150,
    '{"linked-lists","two-pointers"}',
    true,
    'seed-linked-lists-remove-nth-from-end',
    '## Remove Nth Node From End

A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function `RemoveNthFromEnd(nums []int, n int) []int` that removes the `n`-th node from the end (1-indexed) and returns the resulting list. If `n` is out of range, return the list unchanged.

**Function signature**

```go
func RemoveNthFromEnd(nums []int, n int) []int
```

**Examples**

- `RemoveNthFromEnd([1, 2, 3, 4, 5], 2)` returns `[1, 2, 3, 5]`
- `RemoveNthFromEnd([1], 1)` returns `[]`

**Constraints**

- 0 <= len(nums) <= 10000
- n >= 1

**Learning objective:** Combine positional location with structural removal in a single coherent operation.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-nth-from-end'), '[[1,2,3,4,5],2]'::jsonb, '[1,2,3,5]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-nth-from-end'), '[[1],1]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-nth-from-end'), '[[1,2,3],5]'::jsonb, '[1,2,3]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-nth-from-end'), '[[],1]'::jsonb, '[]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'remove-nth-from-end'), '[[5,6],2]'::jsonb, '[6]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- linked-lists :: Linked List Palindrome (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'is-linked-list-palindrome',
    'linked-lists',
    'function',
    'go',
    'Linked List Palindrome',
    'A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function that determines whether the list is a palindrome, ideally using the find-middle-then-reverse-half technique rather than extra storage proportional to the whole list.',
    '- 0 <= len(nums) <= 10000',
    'Apply the slow/fast pointer and reversal techniques together to check palindrome structure without full extra storage.',
    'IsLinkedListPalindrome',
    'bool',
    '{"[]int"}',
    '{"A palindromic linked list reads the same from head to tail as it does from tail to head.","One approach: find the middle of the list, reverse the second half, then compare it against the first half node by node.","An empty list, and a single-node list, are both trivially palindromes."}',
    3,
    150,
    '{"linked-lists","two-pointers"}',
    true,
    'seed-linked-lists-is-linked-list-palindrome',
    '## Linked List Palindrome

A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function that determines whether the list is a palindrome, ideally using the find-middle-then-reverse-half technique rather than extra storage proportional to the whole list.

**Function signature**

```go
func IsLinkedListPalindrome(nums []int) bool
```

**Examples**

- `IsLinkedListPalindrome([1, 2, 2, 1])` returns `true`
- `IsLinkedListPalindrome([1, 2, 3])` returns `false`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Apply the slow/fast pointer and reversal techniques together to check palindrome structure without full extra storage.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-linked-list-palindrome'), '[[1,2,2,1]]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-linked-list-palindrome'), '[[1,2,3]]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-linked-list-palindrome'), '[[]]'::jsonb, 'true', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-linked-list-palindrome'), '[[7]]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-linked-list-palindrome'), '[[1,2,3,2,1]]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- linked-lists :: Intersection of Two Linked Lists (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'intersection-value',
    'linked-lists',
    'function',
    'go',
    'Intersection of Two Linked Lists',
    'Two singly linked lists are represented as slices `a` and `b` in head-to-tail order. If they share a common tail (representing two separate lists that merge into shared nodes), write a function that returns the value of the first shared node. If the two lists share no common tail, return -1.',
    '- 0 <= len(a), len(b) <= 10000',
    'Reformulate the intersection-point problem as a longest-common-suffix comparison.',
    'IntersectionValue',
    'int',
    '{"[]int","[]int"}',
    '{"Two lists that intersect always share a common tail — once the lists merge at a node, they stay merged all the way to the end.","Working from the tail of each list backward (comparing the longest common suffix) finds where that shared tail begins.","If the two lists don''t share any common tail at all, they don''t intersect — report that with -1."}',
    4,
    190,
    '{"linked-lists"}',
    true,
    'seed-linked-lists-intersection-value',
    '## Intersection of Two Linked Lists

Two singly linked lists are represented as slices `a` and `b` in head-to-tail order. If they share a common tail (representing two separate lists that merge into shared nodes), write a function that returns the value of the first shared node. If the two lists share no common tail, return -1.

**Function signature**

```go
func IntersectionValue(a []int, b []int) int
```

**Examples**

- `IntersectionValue([4, 1, 8, 4, 5], [5, 6, 1, 8, 4, 5])` returns `1`
- `IntersectionValue([1, 2, 3], [4, 5, 6])` returns `-1`

**Constraints**

- 0 <= len(a), len(b) <= 10000

**Learning objective:** Reformulate the intersection-point problem as a longest-common-suffix comparison.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'intersection-value'), '[[4,1,8,4,5],[5,6,1,8,4,5]]'::jsonb, '1', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'intersection-value'), '[[1,2,3],[4,5,6]]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'intersection-value'), '[[],[1,2]]'::jsonb, '-1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'intersection-value'), '[[9,9],[9,9]]'::jsonb, '9', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'intersection-value'), '[[1,2,3],[9,2,3]]'::jsonb, '2', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- linked-lists :: Partition Linked List (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'partition-linked-list',
    'linked-lists',
    'function',
    'go',
    'Partition Linked List',
    'A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function `PartitionLinkedList(nums []int, x int) []int` that rearranges the list so that all nodes with values less than `x` come before all nodes with values greater than or equal to `x`, preserving the relative order within each group, and returns the resulting list.',
    '- 0 <= len(nums) <= 10000',
    'Apply stable partitioning to a linked structure, mirroring the array-based partition exercise in a new context.',
    'PartitionLinkedList',
    '[]int',
    '{"[]int","int"}',
    '{"Every node belongs to exactly one of two groups: strictly less than x, or greater than or equal to x.","Building two separate lists (one per group) while preserving each group''s original relative order, then joining them, avoids any tricky in-place juggling.","The value x does not need to actually appear in the list for the partition to make sense."}',
    4,
    190,
    '{"linked-lists"}',
    true,
    'seed-linked-lists-partition-linked-list',
    '## Partition Linked List

A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function `PartitionLinkedList(nums []int, x int) []int` that rearranges the list so that all nodes with values less than `x` come before all nodes with values greater than or equal to `x`, preserving the relative order within each group, and returns the resulting list.

**Function signature**

```go
func PartitionLinkedList(nums []int, x int) []int
```

**Examples**

- `PartitionLinkedList([1, 4, 3, 2, 5, 2], 3)` returns `[1, 2, 2, 4, 3, 5]`
- `PartitionLinkedList([2, 1], 2)` returns `[1, 2]`

**Constraints**

- 0 <= len(nums) <= 10000

**Learning objective:** Apply stable partitioning to a linked structure, mirroring the array-based partition exercise in a new context.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'partition-linked-list'), '[[1,4,3,2,5,2],3]'::jsonb, '[1,2,2,4,3,5]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'partition-linked-list'), '[[2,1],2]'::jsonb, '[1,2]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'partition-linked-list'), '[[],5]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'partition-linked-list'), '[[5,5,5],5]'::jsonb, '[5,5,5]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'partition-linked-list'), '[[9,8,7,6],100]'::jsonb, '[9,8,7,6]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- linked-lists :: Add Two Numbers (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'add-two-numbers',
    'linked-lists',
    'function',
    'go',
    'Add Two Numbers',
    'Two non-negative integers are represented as singly linked lists `a` and `b`, where each node holds a single digit and the digits are stored least-significant-digit first. Write a function `AddTwoNumbers(a, b []int) []int` that returns the sum of the two numbers, in the same least-significant-digit-first representation.',
    '- 0 <= len(a), len(b) <= 20
- Each digit is between 0 and 9',
    'Simulate manual digit-by-digit addition with carry propagation across two linked structures of possibly different lengths.',
    'AddTwoNumbers',
    '[]int',
    '{"[]int","[]int"}',
    '{"Each list stores the digits of a number with the least significant digit first — process both lists from their heads, which conveniently lines up with adding from the ones place.","Track a running carry, the same way you would adding two numbers by hand, and continue as long as either list has digits left or there''s a carry remaining.","The result should also be in least-significant-digit-first order, and should not have a leading zero digit at the end unless the sum itself is exactly zero."}',
    4,
    190,
    '{"linked-lists","math"}',
    true,
    'seed-linked-lists-add-two-numbers',
    '## Add Two Numbers

Two non-negative integers are represented as singly linked lists `a` and `b`, where each node holds a single digit and the digits are stored least-significant-digit first. Write a function `AddTwoNumbers(a, b []int) []int` that returns the sum of the two numbers, in the same least-significant-digit-first representation.

**Function signature**

```go
func AddTwoNumbers(a []int, b []int) []int
```

**Examples**

- `AddTwoNumbers([2, 4, 3], [5, 6, 4])` returns `[7, 0, 8]`
- `AddTwoNumbers([0], [0])` returns `[0]`

**Constraints**

- 0 <= len(a), len(b) <= 20
- Each digit is between 0 and 9

**Learning objective:** Simulate manual digit-by-digit addition with carry propagation across two linked structures of possibly different lengths.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'add-two-numbers'), '[[2,4,3],[5,6,4]]'::jsonb, '[7,0,8]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'add-two-numbers'), '[[0],[0]]'::jsonb, '[0]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'add-two-numbers'), '[[9,9],[1]]'::jsonb, '[0,0,1]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'add-two-numbers'), '[[],[1,2,3]]'::jsonb, '[1,2,3]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'add-two-numbers'), '[[9,9,9],[1]]'::jsonb, '[0,0,0,1]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- linked-lists :: Reverse Nodes in K-Group (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'reverse-in-groups-of-k',
    'linked-lists',
    'function',
    'go',
    'Reverse Nodes in K-Group',
    'A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function `ReverseInGroupsOfK(nums []int, k int) []int` that reverses the nodes of the list `k` at a time and returns the resulting list. If the number of nodes remaining at the end is less than `k`, leave that final group as-is, unreversed.',
    '- 0 <= len(nums) <= 10000
- 1 <= k <= 10000',
    'Combine chunked traversal with per-chunk reversal, a technique that generalizes basic list reversal into a repeated, bounded operation.',
    'ReverseInGroupsOfK',
    '[]int',
    '{"[]int","int"}',
    '{"Process the list in consecutive chunks of exactly k nodes, reversing each full chunk in place.","A trailing group with fewer than k nodes should be left in its original order, not reversed.","Reversing each individual group is the same operation as reversing a whole list — you''re just applying it repeatedly to fixed-size windows."}',
    5,
    220,
    '{"linked-lists"}',
    true,
    'seed-linked-lists-reverse-in-groups-of-k',
    '## Reverse Nodes in K-Group

A singly linked list is represented as a slice `nums` in head-to-tail order. Write a function `ReverseInGroupsOfK(nums []int, k int) []int` that reverses the nodes of the list `k` at a time and returns the resulting list. If the number of nodes remaining at the end is less than `k`, leave that final group as-is, unreversed.

**Function signature**

```go
func ReverseInGroupsOfK(nums []int, k int) []int
```

**Examples**

- `ReverseInGroupsOfK([1, 2, 3, 4, 5], 2)` returns `[2, 1, 4, 3, 5]`
- `ReverseInGroupsOfK([1, 2, 3, 4, 5], 3)` returns `[3, 2, 1, 4, 5]`

**Constraints**

- 0 <= len(nums) <= 10000
- 1 <= k <= 10000

**Learning objective:** Combine chunked traversal with per-chunk reversal, a technique that generalizes basic list reversal into a repeated, bounded operation.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-in-groups-of-k'), '[[1,2,3,4,5],2]'::jsonb, '[2,1,4,3,5]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-in-groups-of-k'), '[[1,2,3,4,5],3]'::jsonb, '[3,2,1,4,5]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-in-groups-of-k'), '[[1,2,3],1]'::jsonb, '[1,2,3]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-in-groups-of-k'), '[[],2]'::jsonb, '[]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'reverse-in-groups-of-k'), '[[1,2,3,4],5]'::jsonb, '[1,2,3,4]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- linked-lists :: Linked List Cycle Start (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'cycle-start-value',
    'linked-lists',
    'function',
    'go',
    'Linked List Cycle Start',
    'A singly linked list is represented by a `next` slice, where `next[i]` is the index of the node following node `i`, or -1 if node `i` is the last node. Given the `next` array and a `start` index, write a function that returns the index at which a cycle begins, using Floyd''s tortoise-and-hare algorithm, or -1 if there is no cycle.',
    '- 0 <= len(next) <= 10000
- -1 <= next[i] < len(next)',
    'Extend basic cycle detection into full cycle-start localization, the second phase of Floyd''s algorithm.',
    'CycleStartValue',
    'int',
    '{"[]int","int"}',
    '{"Floyd''s algorithm has two phases: first detect whether a cycle exists using slow/fast pointers, then locate exactly where it begins.","Once the slow and fast pointers meet inside the cycle, resetting one pointer to the head and advancing both one step at a time will make them meet again exactly at the cycle''s starting node.","A value of -1 in the `next` array marks the end of the list — if the fast pointer ever reaches it, there is no cycle at all."}',
    5,
    220,
    '{"linked-lists","two-pointers"}',
    true,
    'seed-linked-lists-cycle-start-value',
    '## Linked List Cycle Start

A singly linked list is represented by a `next` slice, where `next[i]` is the index of the node following node `i`, or -1 if node `i` is the last node. Given the `next` array and a `start` index, write a function that returns the index at which a cycle begins, using Floyd''s tortoise-and-hare algorithm, or -1 if there is no cycle.

**Function signature**

```go
func CycleStartValue(next []int, start int) int
```

**Examples**

- `CycleStartValue([1, 2, 3, 1], 0)` returns `1`
- `CycleStartValue([1, 2, -1], 0)` returns `-1`

**Constraints**

- 0 <= len(next) <= 10000
- -1 <= next[i] < len(next)

**Learning objective:** Extend basic cycle detection into full cycle-start localization, the second phase of Floyd''s algorithm.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'cycle-start-value'), '[[1,2,3,1],0]'::jsonb, '1', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'cycle-start-value'), '[[1,2,-1],0]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'cycle-start-value'), '[[-1],0]'::jsonb, '-1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'cycle-start-value'), '[[1,0],0]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'cycle-start-value'), '[[1,2,3,4,2],0]'::jsonb, '2', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- linked-lists :: Merge K Sorted Lists (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'merge-k-sorted-lists',
    'linked-lists',
    'function',
    'go',
    'Merge K Sorted Lists',
    '`k` sorted singly linked lists are represented as one flattened slice `values` (all k lists'' node values, back to back) together with a `lengths` slice recording how many nodes belong to each list in order. Write a function `MergeKSortedLists(values, lengths []int) []int` that returns all the values merged into a single sorted sequence.',
    '- 0 <= len(lengths) <= 100
- sum(lengths) == len(values)
- Each individual list is sorted in ascending order',
    'Generalize the two-list merge pattern to an arbitrary number of pre-sorted lists.',
    'MergeKSortedLists',
    '[]int',
    '{"[]int","[]int"}',
    '{"The k individual sorted lists are given back to back in one flattened slice, with a separate slice recording each list''s length.","Slicing the flattened values according to the recorded lengths recovers each individual sorted list.","Once you have all k lists, merging them into one fully sorted result is the same problem as merging any collection of sorted sequences into one."}',
    5,
    220,
    '{"linked-lists","sorting"}',
    true,
    'seed-linked-lists-merge-k-sorted-lists',
    '## Merge K Sorted Lists

`k` sorted singly linked lists are represented as one flattened slice `values` (all k lists'' node values, back to back) together with a `lengths` slice recording how many nodes belong to each list in order. Write a function `MergeKSortedLists(values, lengths []int) []int` that returns all the values merged into a single sorted sequence.

**Function signature**

```go
func MergeKSortedLists(values []int, lengths []int) []int
```

**Examples**

- `MergeKSortedLists([1, 4, 5, 1, 3, 4, 2, 6], [2, 3, 1, 2])` returns `[1, 1, 2, 3, 4, 4, 5, 6]`
- `MergeKSortedLists([], [0])` returns `[]`

**Constraints**

- 0 <= len(lengths) <= 100
- sum(lengths) == len(values)
- Each individual list is sorted in ascending order

**Learning objective:** Generalize the two-list merge pattern to an arbitrary number of pre-sorted lists.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-k-sorted-lists'), '[[1,4,5,1,3,4,2,6],[2,3,1,2]]'::jsonb, '[1,1,2,3,4,4,5,6]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-k-sorted-lists'), '[[],[0]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-k-sorted-lists'), '[[],[]]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-k-sorted-lists'), '[[5,10,15,1,2,3],[3,3]]'::jsonb, '[1,2,3,5,10,15]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'merge-k-sorted-lists'), '[[1,1,1],[1,1,1]]'::jsonb, '[1,1,1]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- trees-graphs :: Count Tree Nodes (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'count-tree-nodes',
    'trees-graphs',
    'function',
    'go',
    'Count Tree Nodes',
    'A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a function that returns the total number of actual nodes in the tree.',
    '- 0 <= len(nodes) <= 1000
- Node values are non-negative; -1 marks a missing node',
    'Get comfortable with the level-order array representation before moving to traversal and recursion.',
    'CountTreeNodes',
    'int',
    '{"[]int"}',
    '{"The tree is given in level-order array form: root at index 0, left child of node i at 2i+1, right child at 2i+2, and -1 marking a missing node.","Every position that isn''t -1 represents one real node in the tree.","A simple scan counting non-sentinel entries answers the question directly."}',
    1,
    70,
    '{"trees","beginner"}',
    true,
    'seed-trees-graphs-count-tree-nodes',
    '## Count Tree Nodes

A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a function that returns the total number of actual nodes in the tree.

**Function signature**

```go
func CountTreeNodes(nodes []int) int
```

**Examples**

- `CountTreeNodes([1, 2, 3])` returns `3`
- `CountTreeNodes([1, -1, 2])` returns `2`

**Constraints**

- 0 <= len(nodes) <= 1000
- Node values are non-negative; -1 marks a missing node

**Learning objective:** Get comfortable with the level-order array representation before moving to traversal and recursion.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-tree-nodes'), '[[1,2,3]]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-tree-nodes'), '[[1,-1,2]]'::jsonb, '2', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-tree-nodes'), '[[-1]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-tree-nodes'), '[[5,3,8,-1,-1,7,9]]'::jsonb, '5', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-tree-nodes'), '[[1]]'::jsonb, '1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- trees-graphs :: Maximum Value in a Tree (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'max-tree-value',
    'trees-graphs',
    'function',
    'go',
    'Maximum Value in a Tree',
    'A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a function that returns the maximum node value in the tree, or -1 if the tree is empty.',
    '- 0 <= len(nodes) <= 1000',
    'Practice ignoring sentinel values while scanning a structural array for an aggregate answer.',
    'MaxTreeValue',
    'int',
    '{"[]int"}',
    '{"Every position that isn''t -1 represents a real node''s value.","Scanning all non-sentinel positions and tracking a running maximum answers the question directly, no traversal logic required.","An empty tree (only the sentinel at the root) has no defined maximum — return -1 in that case."}',
    1,
    70,
    '{"trees","beginner"}',
    true,
    'seed-trees-graphs-max-tree-value',
    '## Maximum Value in a Tree

A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a function that returns the maximum node value in the tree, or -1 if the tree is empty.

**Function signature**

```go
func MaxTreeValue(nodes []int) int
```

**Examples**

- `MaxTreeValue([5, 3, 8])` returns `8`
- `MaxTreeValue([-1])` returns `-1`

**Constraints**

- 0 <= len(nodes) <= 1000

**Learning objective:** Practice ignoring sentinel values while scanning a structural array for an aggregate answer.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'max-tree-value'), '[[5,3,8]]'::jsonb, '8', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'max-tree-value'), '[[-1]]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'max-tree-value'), '[[1,-1,-1]]'::jsonb, '1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'max-tree-value'), '[[10,20,5,-1,-1,-1,30]]'::jsonb, '30', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'max-tree-value'), '[[7]]'::jsonb, '7', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- trees-graphs :: Tree Height (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'tree-height',
    'trees-graphs',
    'function',
    'go',
    'Tree Height',
    'A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a recursive function that returns the height of the tree, defined as the number of levels (an empty tree has height 0, a single-node tree has height 1).',
    '- 0 <= len(nodes) <= 1000',
    'Write your first recursive tree function: combine two recursive subtree results into one answer for the whole tree.',
    'TreeHeight',
    'int',
    '{"[]int"}',
    '{"A tree''s height is one more than the taller of its two subtrees'' heights.","An empty subtree (a -1 position) contributes a height of 0, since there''s nothing there to count.","A single-node tree has a height of 1, by this level-counting convention."}',
    1,
    70,
    '{"trees","recursion","beginner"}',
    true,
    'seed-trees-graphs-tree-height',
    '## Tree Height

A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a recursive function that returns the height of the tree, defined as the number of levels (an empty tree has height 0, a single-node tree has height 1).

**Function signature**

```go
func TreeHeight(nodes []int) int
```

**Examples**

- `TreeHeight([-1])` returns `0`
- `TreeHeight([1])` returns `1`

**Constraints**

- 0 <= len(nodes) <= 1000

**Learning objective:** Write your first recursive tree function: combine two recursive subtree results into one answer for the whole tree.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'tree-height'), '[[-1]]'::jsonb, '0', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'tree-height'), '[[1]]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'tree-height'), '[[1,2,3]]'::jsonb, '2', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'tree-height'), '[[1,2,-1,3]]'::jsonb, '3', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'tree-height'), '[[3,9,20,-1,-1,15,7]]'::jsonb, '3', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- trees-graphs :: Inorder Traversal (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'inorder-traversal',
    'trees-graphs',
    'function',
    'go',
    'Inorder Traversal',
    'A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a recursive function that returns the values of the tree in inorder (left, node, right) traversal order.',
    '- 0 <= len(nodes) <= 1000',
    'Implement the classic recursive left-node-right traversal pattern.',
    'InorderTraversal',
    '[]int',
    '{"[]int"}',
    '{"Inorder traversal visits a node''s entire left subtree, then the node itself, then its entire right subtree.","Applying that same rule recursively to every subtree naturally produces the full traversal order.","For a binary search tree this order would be sorted, but this problem doesn''t assume any BST ordering property."}',
    2,
    110,
    '{"trees","recursion"}',
    true,
    'seed-trees-graphs-inorder-traversal',
    '## Inorder Traversal

A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a recursive function that returns the values of the tree in inorder (left, node, right) traversal order.

**Function signature**

```go
func InorderTraversal(nodes []int) []int
```

**Examples**

- `InorderTraversal([1, -1, 2, -1, -1, 3])` returns `[1, 3, 2]`
- `InorderTraversal([-1])` returns `[]`

**Constraints**

- 0 <= len(nodes) <= 1000

**Learning objective:** Implement the classic recursive left-node-right traversal pattern.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'inorder-traversal'), '[[1,-1,2,-1,-1,3]]'::jsonb, '[1,3,2]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'inorder-traversal'), '[[-1]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'inorder-traversal'), '[[1]]'::jsonb, '[1]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'inorder-traversal'), '[[5,3,8,1,4]]'::jsonb, '[1,3,4,5,8]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'inorder-traversal'), '[[4,2,6,1,3,5,7]]'::jsonb, '[1,2,3,4,5,6,7]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- trees-graphs :: Preorder Traversal (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'preorder-traversal',
    'trees-graphs',
    'function',
    'go',
    'Preorder Traversal',
    'A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a recursive function that returns the values of the tree in preorder (node, left, right) traversal order.',
    '- 0 <= len(nodes) <= 1000',
    'Practice a second recursive traversal order and notice how it differs structurally from inorder.',
    'PreorderTraversal',
    '[]int',
    '{"[]int"}',
    '{"Preorder traversal visits a node itself first, then its entire left subtree, then its entire right subtree.","Applying that rule recursively at every level naturally produces the traversal order.","The root is always the first value in a preorder traversal, which is a useful sanity check on your output."}',
    2,
    110,
    '{"trees","recursion"}',
    true,
    'seed-trees-graphs-preorder-traversal',
    '## Preorder Traversal

A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a recursive function that returns the values of the tree in preorder (node, left, right) traversal order.

**Function signature**

```go
func PreorderTraversal(nodes []int) []int
```

**Examples**

- `PreorderTraversal([1, -1, 2, -1, -1, 3])` returns `[1, 2, 3]`
- `PreorderTraversal([-1])` returns `[]`

**Constraints**

- 0 <= len(nodes) <= 1000

**Learning objective:** Practice a second recursive traversal order and notice how it differs structurally from inorder.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'preorder-traversal'), '[[1,-1,2,-1,-1,3]]'::jsonb, '[1,2,3]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'preorder-traversal'), '[[-1]]'::jsonb, '[]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'preorder-traversal'), '[[1]]'::jsonb, '[1]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'preorder-traversal'), '[[5,3,8,1,4]]'::jsonb, '[5,3,1,4,8]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'preorder-traversal'), '[[4,2,6,1,3,5,7]]'::jsonb, '[4,2,1,3,6,5,7]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- trees-graphs :: Count Leaf Nodes (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'count-leaf-nodes',
    'trees-graphs',
    'function',
    'go',
    'Count Leaf Nodes',
    'A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a recursive function that returns the number of leaf nodes (nodes with no children) in the tree.',
    '- 0 <= len(nodes) <= 1000',
    'Combine a structural condition (no children) with a full-tree traversal to count qualifying nodes.',
    'CountLeafNodes',
    'int',
    '{"[]int"}',
    '{"A leaf is a node with no children at all — both its left and right positions are missing.","Visit every node in the tree and check, for each one, whether both of its child positions are absent.","An empty tree has zero leaves."}',
    2,
    110,
    '{"trees","recursion"}',
    true,
    'seed-trees-graphs-count-leaf-nodes',
    '## Count Leaf Nodes

A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a recursive function that returns the number of leaf nodes (nodes with no children) in the tree.

**Function signature**

```go
func CountLeafNodes(nodes []int) int
```

**Examples**

- `CountLeafNodes([1, 2, 3])` returns `2`
- `CountLeafNodes([1])` returns `1`

**Constraints**

- 0 <= len(nodes) <= 1000

**Learning objective:** Combine a structural condition (no children) with a full-tree traversal to count qualifying nodes.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-leaf-nodes'), '[[1,2,3]]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-leaf-nodes'), '[[1]]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-leaf-nodes'), '[[-1]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-leaf-nodes'), '[[1,2,-1,3,4]]'::jsonb, '2', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-leaf-nodes'), '[[5,3,8,1,4,7,9]]'::jsonb, '4', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- trees-graphs :: Symmetric Tree (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'is-symmetric-tree',
    'trees-graphs',
    'function',
    'go',
    'Symmetric Tree',
    'A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a recursive function that determines whether the tree is a mirror image of itself around its center.',
    '- 0 <= len(nodes) <= 1000',
    'Recurse over two subtrees simultaneously, comparing them against each other rather than against a single expected shape.',
    'IsSymmetricTree',
    'bool',
    '{"[]int"}',
    '{"A tree is symmetric if its left and right subtrees are mirror images of each other.","Two subtrees are mirrors when their root values match, and each one''s left subtree mirrors the other''s right subtree (and vice versa).","Compare the tree''s left child against its right child using this mirror rule, recursively."}',
    3,
    150,
    '{"trees","recursion"}',
    true,
    'seed-trees-graphs-is-symmetric-tree',
    '## Symmetric Tree

A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a recursive function that determines whether the tree is a mirror image of itself around its center.

**Function signature**

```go
func IsSymmetricTree(nodes []int) bool
```

**Examples**

- `IsSymmetricTree([1, 2, 2, 3, 4, 4, 3])` returns `true`
- `IsSymmetricTree([1, 2, 2, -1, 3, -1, 3])` returns `false`

**Constraints**

- 0 <= len(nodes) <= 1000

**Learning objective:** Recurse over two subtrees simultaneously, comparing them against each other rather than against a single expected shape.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-symmetric-tree'), '[[1,2,2,3,4,4,3]]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-symmetric-tree'), '[[1,2,2,-1,3,-1,3]]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-symmetric-tree'), '[[-1]]'::jsonb, 'true', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-symmetric-tree'), '[[1]]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-symmetric-tree'), '[[1,2,2]]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- trees-graphs :: Path Sum (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'has-path-sum',
    'trees-graphs',
    'function',
    'go',
    'Path Sum',
    'A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a recursive function `HasPathSum(nodes []int, target int) bool` that determines whether the tree has any root-to-leaf path whose values sum to exactly `target`.',
    '- 0 <= len(nodes) <= 1000',
    'Thread an accumulating target value through a recursive traversal, checking it only at valid leaf endpoints.',
    'HasPathSum',
    'bool',
    '{"[]int","int"}',
    '{"A root-to-leaf path''s sum is the total of every node''s value along that single path from the root down to a leaf.","At each node, subtract its value from the remaining target and recurse into its children with the updated target.","Only check the remaining target against 0 once you reach an actual leaf — an internal node with no children in one direction should not be treated as a valid path endpoint."}',
    3,
    150,
    '{"trees","recursion"}',
    true,
    'seed-trees-graphs-has-path-sum',
    '## Path Sum

A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a recursive function `HasPathSum(nodes []int, target int) bool` that determines whether the tree has any root-to-leaf path whose values sum to exactly `target`.

**Function signature**

```go
func HasPathSum(nodes []int, target int) bool
```

**Examples**

- `HasPathSum([5, 4, 8, 11, -1, 13, 4, 7, 2], 22)` returns `true`
- `HasPathSum([1, 2, 3], 5)` returns `false`

**Constraints**

- 0 <= len(nodes) <= 1000

**Learning objective:** Thread an accumulating target value through a recursive traversal, checking it only at valid leaf endpoints.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'has-path-sum'), '[[5,4,8,11,-1,13,4,7,2],22]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'has-path-sum'), '[[1,2,3],5]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'has-path-sum'), '[[-1],0]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'has-path-sum'), '[[1,2],3]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'has-path-sum'), '[[1],1]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- trees-graphs :: Diameter of a Binary Tree (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'tree-diameter',
    'trees-graphs',
    'function',
    'go',
    'Diameter of a Binary Tree',
    'A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a recursive function that returns the diameter of the tree — the length, in edges, of the longest path between any two nodes (which may or may not pass through the root).',
    '- 0 <= len(nodes) <= 1000',
    'Compute a global answer as a side effect of a per-node height recursion, a technique that shows up throughout tree algorithms.',
    'TreeDiameter',
    'int',
    '{"[]int"}',
    '{"The diameter is the length (in edges) of the longest path between any two nodes, and that path does not need to pass through the root.","For any given node, the longest path passing through it is the sum of its left and right subtree heights — track the best such sum seen anywhere in the tree.","A single recursive height computation can also update a running ''best diameter seen so far'' value as a side effect, avoiding a separate pass for every node."}',
    4,
    190,
    '{"trees","recursion"}',
    true,
    'seed-trees-graphs-tree-diameter',
    '## Diameter of a Binary Tree

A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. Write a recursive function that returns the diameter of the tree — the length, in edges, of the longest path between any two nodes (which may or may not pass through the root).

**Function signature**

```go
func TreeDiameter(nodes []int) int
```

**Examples**

- `TreeDiameter([1, 2, 3, 4, 5])` returns `3`
- `TreeDiameter([1])` returns `0`

**Constraints**

- 0 <= len(nodes) <= 1000

**Learning objective:** Compute a global answer as a side effect of a per-node height recursion, a technique that shows up throughout tree algorithms.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'tree-diameter'), '[[1,2,3,4,5]]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'tree-diameter'), '[[1]]'::jsonb, '0', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'tree-diameter'), '[[-1]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'tree-diameter'), '[[1,2,-1,3,-1,4]]'::jsonb, '2', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'tree-diameter'), '[[1,2,3,4,5,-1,-1,6]]'::jsonb, '4', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- trees-graphs :: Lowest Common Ancestor Value (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'lowest-common-ancestor-value',
    'trees-graphs',
    'function',
    'go',
    'Lowest Common Ancestor Value',
    'A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node and all node values are distinct. Write a recursive function `LowestCommonAncestorValue(nodes []int, p, q int) int` that returns the value of the lowest common ancestor of the two nodes with values `p` and `q`. Both values are guaranteed to be present in the tree.',
    '- 0 <= len(nodes) <= 1000
- All node values are distinct
- p and q are both present in the tree',
    'Implement the general (non-BST) lowest-common-ancestor algorithm, which works on any binary tree shape.',
    'LowestCommonAncestorValue',
    'int',
    '{"[]int","int","int"}',
    '{"The lowest common ancestor of two nodes is the deepest node that has both of them somewhere in its subtree (possibly being one of them itself).","A recursive search that looks for either target value in the left and right subtrees separately will find the split point where the two searches diverge — that split point is the answer.","If a node itself matches one of the two target values, it immediately qualifies as a candidate ancestor for that search branch, without needing to search further beneath it."}',
    4,
    190,
    '{"trees","recursion"}',
    true,
    'seed-trees-graphs-lowest-common-ancestor-value',
    '## Lowest Common Ancestor Value

A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node and all node values are distinct. Write a recursive function `LowestCommonAncestorValue(nodes []int, p, q int) int` that returns the value of the lowest common ancestor of the two nodes with values `p` and `q`. Both values are guaranteed to be present in the tree.

**Function signature**

```go
func LowestCommonAncestorValue(nodes []int, p int, q int) int
```

**Examples**

- `LowestCommonAncestorValue([3, 5, 1, 6, 2, 0, 8, -1, -1, 7, 4], 5, 1)` returns `3`
- `LowestCommonAncestorValue([3, 5, 1, 6, 2, 0, 8, -1, -1, 7, 4], 5, 4)` returns `5`

**Constraints**

- 0 <= len(nodes) <= 1000
- All node values are distinct
- p and q are both present in the tree

**Learning objective:** Implement the general (non-BST) lowest-common-ancestor algorithm, which works on any binary tree shape.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'lowest-common-ancestor-value'), '[[3,5,1,6,2,0,8,-1,-1,7,4],5,1]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'lowest-common-ancestor-value'), '[[3,5,1,6,2,0,8,-1,-1,7,4],5,4]'::jsonb, '5', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'lowest-common-ancestor-value'), '[[1,2],1,2]'::jsonb, '1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'lowest-common-ancestor-value'), '[[1,2,3],2,3]'::jsonb, '1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'lowest-common-ancestor-value'), '[[5,3,8,1,4,7,9],1,4]'::jsonb, '3', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- trees-graphs :: Shortest Path in an Unweighted Graph (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'shortest-path-length',
    'trees-graphs',
    'function',
    'go',
    'Shortest Path in an Unweighted Graph',
    'An undirected graph has `n` nodes labeled 0 to n-1, with edges given as a flattened slice `edges` (each consecutive pair is one edge). Write a function `ShortestPathLength(n int, edges []int, src, dst int) int` that returns the length (number of edges) of the shortest path from `src` to `dst` using breadth-first search, or -1 if `dst` is unreachable from `src`.',
    '- 1 <= n <= 1000
- len(edges) is always even
- 0 <= edges[i], src, dst < n',
    'Implement BFS as the standard technique for shortest paths in unweighted graphs.',
    'ShortestPathLength',
    'int',
    '{"int","[]int","int","int"}',
    '{"In an unweighted graph, breadth-first search always finds the shortest path (fewest edges) between two nodes.","Track each node''s distance from the source as you discover it, and stop as soon as you reach the destination.","If the destination is never reached during the search, it isn''t reachable from the source at all — report that with -1."}',
    4,
    190,
    '{"graphs","bfs"}',
    true,
    'seed-trees-graphs-shortest-path-length',
    '## Shortest Path in an Unweighted Graph

An undirected graph has `n` nodes labeled 0 to n-1, with edges given as a flattened slice `edges` (each consecutive pair is one edge). Write a function `ShortestPathLength(n int, edges []int, src, dst int) int` that returns the length (number of edges) of the shortest path from `src` to `dst` using breadth-first search, or -1 if `dst` is unreachable from `src`.

**Function signature**

```go
func ShortestPathLength(n int, edges []int, src int, dst int) int
```

**Examples**

- `ShortestPathLength(5, [0, 1, 1, 2, 2, 3, 3, 4], 0, 4)` returns `4`
- `ShortestPathLength(3, [0, 1], 0, 2)` returns `-1`

**Constraints**

- 1 <= n <= 1000
- len(edges) is always even
- 0 <= edges[i], src, dst < n

**Learning objective:** Implement BFS as the standard technique for shortest paths in unweighted graphs.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'shortest-path-length'), '[5,[0,1,1,2,2,3,3,4],0,4]'::jsonb, '4', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'shortest-path-length'), '[3,[0,1],0,2]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'shortest-path-length'), '[1,[],0,0]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'shortest-path-length'), '[4,[0,1,2,3],0,3]'::jsonb, '-1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'shortest-path-length'), '[6,[0,1,1,2,3,4,4,5],0,5]'::jsonb, '-1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- trees-graphs :: Detect Cycle in an Undirected Graph (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'graph-has-cycle',
    'trees-graphs',
    'function',
    'go',
    'Detect Cycle in an Undirected Graph',
    'An undirected graph has `n` nodes labeled 0 to n-1, with edges given as a flattened slice `edges` (each consecutive pair is one edge). Write a function `GraphHasCycle(n int, edges []int) bool` that determines whether the graph contains a cycle, using a union-find (disjoint set) structure.',
    '- 0 <= n <= 1000
- len(edges) is always even',
    'Recognize that union-find naturally detects cycles as a side effect of tracking connectivity.',
    'GraphHasCycle',
    'bool',
    '{"int","[]int"}',
    '{"Union-Find lets you check, for each edge, whether its two endpoints are already connected before adding the edge.","If an edge connects two nodes that are already in the same connected component, adding it would create a cycle.","A single pass over the edges, checking and then unioning, both detects the cycle and builds the full connectivity structure."}',
    3,
    150,
    '{"graphs","union-find"}',
    true,
    'seed-trees-graphs-graph-has-cycle',
    '## Detect Cycle in an Undirected Graph

An undirected graph has `n` nodes labeled 0 to n-1, with edges given as a flattened slice `edges` (each consecutive pair is one edge). Write a function `GraphHasCycle(n int, edges []int) bool` that determines whether the graph contains a cycle, using a union-find (disjoint set) structure.

**Function signature**

```go
func GraphHasCycle(n int, edges []int) bool
```

**Examples**

- `GraphHasCycle(5, [0, 1, 1, 2, 3, 4])` returns `false`
- `GraphHasCycle(3, [0, 1, 1, 2, 2, 0])` returns `true`

**Constraints**

- 0 <= n <= 1000
- len(edges) is always even

**Learning objective:** Recognize that union-find naturally detects cycles as a side effect of tracking connectivity.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'graph-has-cycle'), '[5,[0,1,1,2,3,4]]'::jsonb, 'false', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'graph-has-cycle'), '[3,[0,1,1,2,2,0]]'::jsonb, 'true', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'graph-has-cycle'), '[4,[]]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'graph-has-cycle'), '[2,[0,1,0,1]]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'graph-has-cycle'), '[1,[]]'::jsonb, 'false', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- trees-graphs :: Bipartite Graph Check (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'is-bipartite',
    'trees-graphs',
    'function',
    'go',
    'Bipartite Graph Check',
    'An undirected graph has `n` nodes labeled 0 to n-1, with edges given as a flattened slice `edges` (each consecutive pair is one edge, and the graph may be disconnected). Write a function `IsBipartite(n int, edges []int) bool` that determines whether the graph''s nodes can be 2-colored so that no edge connects two nodes of the same color.',
    '- 0 <= n <= 1000
- len(edges) is always even',
    'Apply BFS-based graph coloring across every connected component, not just a single starting point.',
    'IsBipartite',
    'bool',
    '{"int","[]int"}',
    '{"A graph is bipartite if its nodes can be split into two groups such that every edge connects nodes from different groups.","Attempting to 2-color the graph via BFS — alternating colors between adjacent nodes — either succeeds completely or reveals a conflict.","The graph may be disconnected, so make sure every component gets checked, not just the one containing node 0."}',
    5,
    220,
    '{"graphs","bfs","graph-coloring"}',
    true,
    'seed-trees-graphs-is-bipartite',
    '## Bipartite Graph Check

An undirected graph has `n` nodes labeled 0 to n-1, with edges given as a flattened slice `edges` (each consecutive pair is one edge, and the graph may be disconnected). Write a function `IsBipartite(n int, edges []int) bool` that determines whether the graph''s nodes can be 2-colored so that no edge connects two nodes of the same color.

**Function signature**

```go
func IsBipartite(n int, edges []int) bool
```

**Examples**

- `IsBipartite(4, [0, 1, 1, 2, 2, 3, 3, 0])` returns `true`
- `IsBipartite(3, [0, 1, 1, 2, 2, 0])` returns `false`

**Constraints**

- 0 <= n <= 1000
- len(edges) is always even

**Learning objective:** Apply BFS-based graph coloring across every connected component, not just a single starting point.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-bipartite'), '[4,[0,1,1,2,2,3,3,0]]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-bipartite'), '[3,[0,1,1,2,2,0]]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-bipartite'), '[2,[]]'::jsonb, 'true', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-bipartite'), '[5,[0,1,0,2,0,3,0,4]]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'is-bipartite'), '[1,[]]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- trees-graphs :: Count Good Nodes in a Binary Tree (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'count-good-nodes',
    'trees-graphs',
    'function',
    'go',
    'Count Good Nodes in a Binary Tree',
    'A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. A node is considered ''good'' if its value is greater than or equal to every value along the path from the root to that node. Write a recursive function that returns the total number of good nodes in the tree.',
    '- 0 <= len(nodes) <= 1000',
    'Thread an accumulating ''best value seen so far'' down through a recursive traversal, a pattern distinct from accumulating a target from has-path-sum.',
    'CountGoodNodes',
    'int',
    '{"[]int"}',
    '{"A node is ''good'' if its value is greater than or equal to every value on the path from the root down to it, including the root itself.","Passing the maximum value seen so far down through the recursion (updated at each step) lets every node check itself against that running maximum directly.","The root is always good, since there are no ancestors above it to exceed its value."}',
    5,
    220,
    '{"trees","recursion"}',
    true,
    'seed-trees-graphs-count-good-nodes',
    '## Count Good Nodes in a Binary Tree

A binary tree is given as a level-order slice `nodes`, where -1 marks a missing node. A node is considered ''good'' if its value is greater than or equal to every value along the path from the root to that node. Write a recursive function that returns the total number of good nodes in the tree.

**Function signature**

```go
func CountGoodNodes(nodes []int) int
```

**Examples**

- `CountGoodNodes([3, 1, 4, 3, -1, 1, 5])` returns `4`
- `CountGoodNodes([1])` returns `1`

**Constraints**

- 0 <= len(nodes) <= 1000

**Learning objective:** Thread an accumulating ''best value seen so far'' down through a recursive traversal, a pattern distinct from accumulating a target from has-path-sum.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-good-nodes'), '[[3,1,4,3,-1,1,5]]'::jsonb, '4', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-good-nodes'), '[[1]]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-good-nodes'), '[[-1]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-good-nodes'), '[[3,3,-1,4,2]]'::jsonb, '3', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'count-good-nodes'), '[[10,5,15,3,8,-1,20]]'::jsonb, '3', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- trees-graphs :: Course Schedule (Task Ordering) (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'can-finish-tasks',
    'trees-graphs',
    'function',
    'go',
    'Course Schedule (Task Ordering)',
    'There are `numTasks` tasks labeled 0 to numTasks-1, and a flattened slice `prerequisites` where each consecutive pair `(a, b)` means task `a` requires task `b` to be completed first. Write a function `CanFinishTasks(numTasks int, prerequisites []int) bool` that determines whether it''s possible to complete all tasks in some order, using topological sort (Kahn''s algorithm) to detect a cycle in the dependency graph.',
    '- 0 <= numTasks <= 1000
- len(prerequisites) is always even',
    'Recognize ''can these dependencies all be satisfied'' as a cycle-detection question on a directed graph.',
    'CanFinishTasks',
    'bool',
    '{"int","[]int"}',
    '{"Each prerequisite pair means one task must be completed before another — model this as a directed edge in a graph.","A valid completion order exists if and only if the directed graph of dependencies contains no cycle.","Kahn''s algorithm (repeatedly removing tasks with no remaining prerequisites) either processes every task, confirming no cycle, or gets stuck with tasks left over, confirming one exists."}',
    5,
    220,
    '{"graphs","topological-sort"}',
    true,
    'seed-trees-graphs-can-finish-tasks',
    '## Course Schedule (Task Ordering)

There are `numTasks` tasks labeled 0 to numTasks-1, and a flattened slice `prerequisites` where each consecutive pair `(a, b)` means task `a` requires task `b` to be completed first. Write a function `CanFinishTasks(numTasks int, prerequisites []int) bool` that determines whether it''s possible to complete all tasks in some order, using topological sort (Kahn''s algorithm) to detect a cycle in the dependency graph.

**Function signature**

```go
func CanFinishTasks(numTasks int, prerequisites []int) bool
```

**Examples**

- `CanFinishTasks(2, [1, 0])` returns `true`
- `CanFinishTasks(2, [1, 0, 0, 1])` returns `false`

**Constraints**

- 0 <= numTasks <= 1000
- len(prerequisites) is always even

**Learning objective:** Recognize ''can these dependencies all be satisfied'' as a cycle-detection question on a directed graph.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'can-finish-tasks'), '[2,[1,0]]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'can-finish-tasks'), '[2,[1,0,0,1]]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'can-finish-tasks'), '[1,[]]'::jsonb, 'true', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'can-finish-tasks'), '[3,[1,0,2,1]]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'can-finish-tasks'), '[4,[1,0,2,0,3,1,3,2,0,3]]'::jsonb, 'false', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- dynamic-programming :: Climbing Stairs (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'climb-stairs',
    'dynamic-programming',
    'function',
    'go',
    'Climbing Stairs',
    'You are climbing a staircase with `n` steps, and at each move you can climb either 1 or 2 steps. Write a function that returns the number of distinct ways to reach the top.',
    '- 0 <= n <= 45',
    'Recognize a counting problem as a Fibonacci-shaped recurrence, the simplest entry point into dynamic programming.',
    'ClimbStairs',
    'int',
    '{"int"}',
    '{"From any given stair, you can only have arrived by taking a final step of 1 or 2 stairs.","That means the number of ways to reach stair n is the sum of the ways to reach stair n-1 and stair n-2 — the same recurrence as Fibonacci.","There is exactly 1 way to be already standing at the ground (stair 0) or to reach stair 1."}',
    1,
    70,
    '{"dynamic-programming","beginner"}',
    true,
    'seed-dynamic-programming-climb-stairs',
    '## Climbing Stairs

You are climbing a staircase with `n` steps, and at each move you can climb either 1 or 2 steps. Write a function that returns the number of distinct ways to reach the top.

**Function signature**

```go
func ClimbStairs(n int) int
```

**Examples**

- `ClimbStairs(2)` returns `2`
- `ClimbStairs(3)` returns `3`

**Constraints**

- 0 <= n <= 45

**Learning objective:** Recognize a counting problem as a Fibonacci-shaped recurrence, the simplest entry point into dynamic programming.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'climb-stairs'), '[2]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'climb-stairs'), '[3]'::jsonb, '3', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'climb-stairs'), '[0]'::jsonb, '1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'climb-stairs'), '[1]'::jsonb, '1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'climb-stairs'), '[10]'::jsonb, '89', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- dynamic-programming :: House Robber (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'house-robber',
    'dynamic-programming',
    'function',
    'go',
    'House Robber',
    'A row of houses each hold some amount of money, given in `nums`. Write a function that returns the maximum total amount you can rob without ever robbing two adjacent houses.',
    '- 0 <= len(nums) <= 10000
- 0 <= nums[i] <= 10000',
    'Learn the two-running-values technique for ''choose or skip, but not two in a row'' optimization problems.',
    'HouseRobber',
    'int',
    '{"[]int"}',
    '{"Robbing two adjacent houses isn''t allowed, so at every house you choose between skipping it or robbing it (which means the previous house had to be skipped).","Track two running values as you scan: the best total if you don''t rob the current house, and the best total if you do.","The final answer is the better of the two running values after considering every house."}',
    1,
    70,
    '{"dynamic-programming","beginner"}',
    true,
    'seed-dynamic-programming-house-robber',
    '## House Robber

A row of houses each hold some amount of money, given in `nums`. Write a function that returns the maximum total amount you can rob without ever robbing two adjacent houses.

**Function signature**

```go
func HouseRobber(nums []int) int
```

**Examples**

- `HouseRobber([1, 2, 3, 1])` returns `4`
- `HouseRobber([2, 7, 9, 3, 1])` returns `12`

**Constraints**

- 0 <= len(nums) <= 10000
- 0 <= nums[i] <= 10000

**Learning objective:** Learn the two-running-values technique for ''choose or skip, but not two in a row'' optimization problems.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'house-robber'), '[[1,2,3,1]]'::jsonb, '4', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'house-robber'), '[[2,7,9,3,1]]'::jsonb, '12', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'house-robber'), '[[]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'house-robber'), '[[5]]'::jsonb, '5', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'house-robber'), '[[2,1,1,2]]'::jsonb, '4', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- dynamic-programming :: Minimum Cost Climbing Stairs (difficulty 1, 70 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'min-cost-climbing-stairs',
    'dynamic-programming',
    'function',
    'go',
    'Minimum Cost Climbing Stairs',
    'Given a slice `cost` where `cost[i]` is the cost of stepping on stair `i`, and you can climb 1 or 2 steps at a time starting from stair 0 or stair 1, write a function that returns the minimum total cost to reach the top (one step past the last stair).',
    '- 2 <= len(cost) <= 10000
- 0 <= cost[i] <= 1000',
    'Apply the running-minimum dynamic programming pattern to a cost-minimization variant of climbing stairs.',
    'MinCostClimbingStairs',
    'int',
    '{"[]int"}',
    '{"You can begin your climb standing at either step 0 or step 1, whichever is cheaper overall.","Reaching any step costs that step''s value plus the cheaper of the two ways to have reached one of the two steps just below it.","The top of the staircase is one step past the last index, so the answer is the cheaper of finishing from either of the last two steps."}',
    1,
    70,
    '{"dynamic-programming","beginner"}',
    true,
    'seed-dynamic-programming-min-cost-climbing-stairs',
    '## Minimum Cost Climbing Stairs

Given a slice `cost` where `cost[i]` is the cost of stepping on stair `i`, and you can climb 1 or 2 steps at a time starting from stair 0 or stair 1, write a function that returns the minimum total cost to reach the top (one step past the last stair).

**Function signature**

```go
func MinCostClimbingStairs(cost []int) int
```

**Examples**

- `MinCostClimbingStairs([10, 15, 20])` returns `15`
- `MinCostClimbingStairs([1, 100, 1, 1, 1, 100, 1, 1, 100, 1])` returns `6`

**Constraints**

- 2 <= len(cost) <= 10000
- 0 <= cost[i] <= 1000

**Learning objective:** Apply the running-minimum dynamic programming pattern to a cost-minimization variant of climbing stairs.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-cost-climbing-stairs'), '[[10,15,20]]'::jsonb, '15', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-cost-climbing-stairs'), '[[1,100,1,1,1,100,1,1,100,1]]'::jsonb, '6', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-cost-climbing-stairs'), '[[0,0]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-cost-climbing-stairs'), '[[5,5]]'::jsonb, '5', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-cost-climbing-stairs'), '[[1,2,3,4,5]]'::jsonb, '6', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- dynamic-programming :: Coin Change (Minimum Coins) (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'coin-change-min-coins',
    'dynamic-programming',
    'function',
    'go',
    'Coin Change (Minimum Coins)',
    'Given a slice `coins` representing available coin denominations (each available in unlimited supply) and a target `amount`, write a function that returns the fewest coins needed to make up exactly `amount`, or -1 if it cannot be made with the given coins.',
    '- 1 <= len(coins) <= 20
- 1 <= coins[i] <= 1000
- 0 <= amount <= 10000',
    'Build a classic unbounded-knapsack-style dynamic programming table from smaller subproblems upward.',
    'CoinChangeMinCoins',
    'int',
    '{"[]int","int"}',
    '{"Build up the answer for every amount from 0 to the target, using answers for smaller amounts you''ve already solved.","For each amount, try using one of each available coin denomination and see which leaves the cheapest remainder to solve.","If no combination of coins can make an amount exactly, that amount (and the target, if it''s among them) has no valid answer — report -1."}',
    2,
    110,
    '{"dynamic-programming"}',
    true,
    'seed-dynamic-programming-coin-change-min-coins',
    '## Coin Change (Minimum Coins)

Given a slice `coins` representing available coin denominations (each available in unlimited supply) and a target `amount`, write a function that returns the fewest coins needed to make up exactly `amount`, or -1 if it cannot be made with the given coins.

**Function signature**

```go
func CoinChangeMinCoins(coins []int, amount int) int
```

**Examples**

- `CoinChangeMinCoins([1, 2, 5], 11)` returns `3`
- `CoinChangeMinCoins([2], 3)` returns `-1`

**Constraints**

- 1 <= len(coins) <= 20
- 1 <= coins[i] <= 1000
- 0 <= amount <= 10000

**Learning objective:** Build a classic unbounded-knapsack-style dynamic programming table from smaller subproblems upward.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'coin-change-min-coins'), '[[1,2,5],11]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'coin-change-min-coins'), '[[2],3]'::jsonb, '-1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'coin-change-min-coins'), '[[1],0]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'coin-change-min-coins'), '[[1,5,10,25],63]'::jsonb, '6', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'coin-change-min-coins'), '[[3,7],11]'::jsonb, '-1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- dynamic-programming :: Longest Increasing Subsequence (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'longest-increasing-subsequence',
    'dynamic-programming',
    'function',
    'go',
    'Longest Increasing Subsequence',
    'Write a function that returns the length of the longest strictly increasing subsequence of `nums` (elements do not need to be contiguous, only in increasing order and original relative sequence).',
    '- 0 <= len(nums) <= 2000',
    'Practice building a per-position dynamic programming table where each entry depends on multiple earlier entries, not just the one immediately before it.',
    'LongestIncreasingSubsequenceLength',
    'int',
    '{"[]int"}',
    '{"A subsequence doesn''t need its elements to be adjacent in the original slice — only in the same relative order.","For each position, the longest increasing run ending there is one more than the best run ending at any earlier, smaller element.","Trying every earlier position as a potential predecessor for each element gives a correct, if not the fastest possible, solution."}',
    2,
    110,
    '{"dynamic-programming"}',
    true,
    'seed-dynamic-programming-longest-increasing-subsequence',
    '## Longest Increasing Subsequence

Write a function that returns the length of the longest strictly increasing subsequence of `nums` (elements do not need to be contiguous, only in increasing order and original relative sequence).

**Function signature**

```go
func LongestIncreasingSubsequenceLength(nums []int) int
```

**Examples**

- `LongestIncreasingSubsequenceLength([10, 9, 2, 5, 3, 7, 101, 18])` returns `4`
- `LongestIncreasingSubsequenceLength([0, 1, 0, 3, 2, 3])` returns `4`

**Constraints**

- 0 <= len(nums) <= 2000

**Learning objective:** Practice building a per-position dynamic programming table where each entry depends on multiple earlier entries, not just the one immediately before it.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-increasing-subsequence'), '[[10,9,2,5,3,7,101,18]]'::jsonb, '4', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-increasing-subsequence'), '[[0,1,0,3,2,3]]'::jsonb, '4', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-increasing-subsequence'), '[[]]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-increasing-subsequence'), '[[7,7,7,7]]'::jsonb, '1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-increasing-subsequence'), '[[1,2,3,4,5]]'::jsonb, '5', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- dynamic-programming :: Unique Paths in a Grid (difficulty 2, 110 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'unique-paths-grid',
    'dynamic-programming',
    'function',
    'go',
    'Unique Paths in a Grid',
    'A robot starts at the top-left corner of an `m` x `n` grid and can only move right or down at each step. Write a function `UniquePaths(m, n int) int` that returns the number of distinct paths to reach the bottom-right corner.',
    '- 1 <= m, n <= 20',
    'Build a two-dimensional dynamic programming table where each cell combines results from its two immediate predecessors.',
    'UniquePaths',
    'int',
    '{"int","int"}',
    '{"At every cell, the number of ways to arrive is the sum of the ways to arrive at the cell directly above it and the cell directly to its left.","The entire top row and entire left column can only be reached one way each: by moving straight across or straight down.","Filling the grid row by row, using previously computed cells, builds up to the answer for the bottom-right corner."}',
    2,
    110,
    '{"dynamic-programming"}',
    true,
    'seed-dynamic-programming-unique-paths-grid',
    '## Unique Paths in a Grid

A robot starts at the top-left corner of an `m` x `n` grid and can only move right or down at each step. Write a function `UniquePaths(m, n int) int` that returns the number of distinct paths to reach the bottom-right corner.

**Function signature**

```go
func UniquePaths(m int, n int) int
```

**Examples**

- `UniquePaths(3, 7)` returns `28`
- `UniquePaths(3, 2)` returns `3`

**Constraints**

- 1 <= m, n <= 20

**Learning objective:** Build a two-dimensional dynamic programming table where each cell combines results from its two immediate predecessors.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'unique-paths-grid'), '[3,7]'::jsonb, '28', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'unique-paths-grid'), '[3,2]'::jsonb, '3', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'unique-paths-grid'), '[1,1]'::jsonb, '1', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'unique-paths-grid'), '[1,10]'::jsonb, '1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'unique-paths-grid'), '[10,10]'::jsonb, '48620', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- dynamic-programming :: Longest Common Subsequence (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'longest-common-subsequence-length',
    'dynamic-programming',
    'function',
    'go',
    'Longest Common Subsequence',
    'Write a function `LongestCommonSubsequenceLength(a, b string) int` that returns the length of the longest subsequence common to both `a` and `b` (characters need not be contiguous in either string, but must appear in the same relative order).',
    '- 0 <= len(a), len(b) <= 1000',
    'Build the classic two-string dynamic programming table, foundational for diff tools and DNA sequence comparison.',
    'LongestCommonSubsequenceLength',
    'int',
    '{"string","string"}',
    '{"A subsequence in each string can skip characters but must preserve their relative order — the two subsequences don''t need to be contiguous in either original string.","Build a table where each cell represents the LCS length for a prefix of each string; when the current characters match, extend the diagonal result; otherwise take the better of ignoring one character from either string.","The final answer sits in the cell representing the full length of both strings."}',
    3,
    150,
    '{"dynamic-programming","strings"}',
    true,
    'seed-dynamic-programming-longest-common-subsequence-length',
    '## Longest Common Subsequence

Write a function `LongestCommonSubsequenceLength(a, b string) int` that returns the length of the longest subsequence common to both `a` and `b` (characters need not be contiguous in either string, but must appear in the same relative order).

**Function signature**

```go
func LongestCommonSubsequenceLength(a string, b string) int
```

**Examples**

- `LongestCommonSubsequenceLength("abcde", "ace")` returns `3`
- `LongestCommonSubsequenceLength("abc", "abc")` returns `3`

**Constraints**

- 0 <= len(a), len(b) <= 1000

**Learning objective:** Build the classic two-string dynamic programming table, foundational for diff tools and DNA sequence comparison.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-common-subsequence-length'), '["abcde","ace"]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-common-subsequence-length'), '["abc","abc"]'::jsonb, '3', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-common-subsequence-length'), '["abc","def"]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-common-subsequence-length'), '["","abc"]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-common-subsequence-length'), '["bsbininm","jmjkbkjkv"]'::jsonb, '1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- dynamic-programming :: Edit Distance (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'edit-distance',
    'dynamic-programming',
    'function',
    'go',
    'Edit Distance',
    'Write a function `EditDistance(a, b string) int` that returns the minimum number of single-character insertions, deletions, or replacements required to transform `a` into `b` (the Levenshtein distance).',
    '- 0 <= len(a), len(b) <= 500',
    'Implement the classic Levenshtein distance dynamic programming table, widely used in spell-checking and diff tools.',
    'EditDistance',
    'int',
    '{"string","string"}',
    '{"The three allowed operations — insert, delete, replace a single character — each correspond to a specific move in the dynamic programming table.","When the current characters of both strings match, no operation is needed there — carry forward the diagonal result unchanged.","When they don''t match, take the cheapest of the three neighboring subproblems (representing insert, delete, and replace) and add one operation for the current step."}',
    3,
    150,
    '{"dynamic-programming","strings"}',
    true,
    'seed-dynamic-programming-edit-distance',
    '## Edit Distance

Write a function `EditDistance(a, b string) int` that returns the minimum number of single-character insertions, deletions, or replacements required to transform `a` into `b` (the Levenshtein distance).

**Function signature**

```go
func EditDistance(a string, b string) int
```

**Examples**

- `EditDistance("horse", "ros")` returns `3`
- `EditDistance("intention", "execution")` returns `5`

**Constraints**

- 0 <= len(a), len(b) <= 500

**Learning objective:** Implement the classic Levenshtein distance dynamic programming table, widely used in spell-checking and diff tools.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'edit-distance'), '["horse","ros"]'::jsonb, '3', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'edit-distance'), '["intention","execution"]'::jsonb, '5', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'edit-distance'), '["",""]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'edit-distance'), '["abc","abc"]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'edit-distance'), '["a",""]'::jsonb, '1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- dynamic-programming :: Partition Equal Subset Sum (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'can-partition-equal-subset-sum',
    'dynamic-programming',
    'function',
    'go',
    'Partition Equal Subset Sum',
    'Write a function that determines whether a slice `nums` of positive integers can be partitioned into two subsets with equal sums.',
    '- 0 <= len(nums) <= 200
- 0 <= nums[i] <= 1000',
    'Reduce a partitioning question to the classic subset-sum dynamic programming pattern.',
    'CanPartitionEqualSubsetSum',
    'bool',
    '{"[]int"}',
    '{"If the total sum of all elements is odd, it''s mathematically impossible to split them into two equal halves.","This reduces to a subset-sum question: can some subset of the elements add up to exactly half the total?","A boolean dynamic programming table over achievable sums, updated one element at a time from the largest target down to the smallest, avoids reusing the same element twice."}',
    3,
    150,
    '{"dynamic-programming"}',
    true,
    'seed-dynamic-programming-can-partition-equal-subset-sum',
    '## Partition Equal Subset Sum

Write a function that determines whether a slice `nums` of positive integers can be partitioned into two subsets with equal sums.

**Function signature**

```go
func CanPartitionEqualSubsetSum(nums []int) bool
```

**Examples**

- `CanPartitionEqualSubsetSum([1, 5, 11, 5])` returns `true`
- `CanPartitionEqualSubsetSum([1, 2, 3, 5])` returns `false`

**Constraints**

- 0 <= len(nums) <= 200
- 0 <= nums[i] <= 1000

**Learning objective:** Reduce a partitioning question to the classic subset-sum dynamic programming pattern.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'can-partition-equal-subset-sum'), '[[1,5,11,5]]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'can-partition-equal-subset-sum'), '[[1,2,3,5]]'::jsonb, 'false', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'can-partition-equal-subset-sum'), '[[]]'::jsonb, 'true', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'can-partition-equal-subset-sum'), '[[1,1]]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'can-partition-equal-subset-sum'), '[[2,2,3,5]]'::jsonb, 'false', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- dynamic-programming :: Word Break (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'word-break',
    'dynamic-programming',
    'function',
    'go',
    'Word Break',
    'Given a string `s` and a slice of words `wordDict`, write a function `WordBreak(s string, wordDict []string) bool` that determines whether `s` can be segmented into a sequence of one or more dictionary words (words may be reused any number of times).',
    '- 0 <= len(s) <= 1000
- 0 <= len(wordDict) <= 1000',
    'Build a segmentation dynamic programming table where each prefix''s answer depends on all shorter segmentable prefixes.',
    'WordBreak',
    'bool',
    '{"string","[]string"}',
    '{"Think of the string as something that can be split at various points into pieces, each of which must be a dictionary word.","A boolean table where entry i means ''the first i characters can be fully segmented'' can be built up from smaller prefixes.","Prefix i is segmentable if there''s some earlier segmentable prefix k such that the substring between k and i is itself a dictionary word."}',
    4,
    190,
    '{"dynamic-programming","strings"}',
    true,
    'seed-dynamic-programming-word-break',
    '## Word Break

Given a string `s` and a slice of words `wordDict`, write a function `WordBreak(s string, wordDict []string) bool` that determines whether `s` can be segmented into a sequence of one or more dictionary words (words may be reused any number of times).

**Function signature**

```go
func WordBreak(s string, wordDict []string) bool
```

**Examples**

- `WordBreak("leetcode", ["leet", "code"])` returns `true`
- `WordBreak("applepenapple", ["apple", "pen"])` returns `true`

**Constraints**

- 0 <= len(s) <= 1000
- 0 <= len(wordDict) <= 1000

**Learning objective:** Build a segmentation dynamic programming table where each prefix''s answer depends on all shorter segmentable prefixes.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'word-break'), '["leetcode",["leet","code"]]'::jsonb, 'true', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'word-break'), '["applepenapple",["apple","pen"]]'::jsonb, 'true', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'word-break'), '["catsandog",["cats","dog","sand","and","cat"]]'::jsonb, 'false', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'word-break'), '["",["a"]]'::jsonb, 'true', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'word-break'), '["aaaaaaa",["aaaa","aaa"]]'::jsonb, 'true', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- dynamic-programming :: Longest Palindromic Subsequence (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'longest-palindromic-subsequence-length',
    'dynamic-programming',
    'function',
    'go',
    'Longest Palindromic Subsequence',
    'Write a function that returns the length of the longest subsequence of `s` (characters need not be contiguous) that reads the same forwards and backwards.',
    '- 0 <= len(s) <= 1000',
    'Extend interval dynamic programming (working outward from smaller substrings to larger ones) to a subsequence rather than substring problem.',
    'LongestPalindromicSubsequenceLength',
    'int',
    '{"string"}',
    '{"Unlike a palindromic substring, a palindromic subsequence''s characters don''t need to be contiguous — only in the same relative order, reading the same forwards and backwards.","If the first and last characters of a substring match, they can both be included, adding 2 to the best answer for the substring between them.","If they don''t match, the best answer is the better of dropping either the first or the last character and solving the smaller substring."}',
    4,
    190,
    '{"dynamic-programming","strings"}',
    true,
    'seed-dynamic-programming-longest-palindromic-subsequence-length',
    '## Longest Palindromic Subsequence

Write a function that returns the length of the longest subsequence of `s` (characters need not be contiguous) that reads the same forwards and backwards.

**Function signature**

```go
func LongestPalindromicSubsequenceLength(s string) int
```

**Examples**

- `LongestPalindromicSubsequenceLength("bbbab")` returns `4`
- `LongestPalindromicSubsequenceLength("cbbd")` returns `2`

**Constraints**

- 0 <= len(s) <= 1000

**Learning objective:** Extend interval dynamic programming (working outward from smaller substrings to larger ones) to a subsequence rather than substring problem.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-palindromic-subsequence-length'), '["bbbab"]'::jsonb, '4', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-palindromic-subsequence-length'), '["cbbd"]'::jsonb, '2', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-palindromic-subsequence-length'), '[""]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-palindromic-subsequence-length'), '["a"]'::jsonb, '1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-palindromic-subsequence-length'), '["agbcba"]'::jsonb, '5', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- dynamic-programming :: Maximum Subarray Sum (Kadane's Algorithm) (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'max-subarray-sum',
    'dynamic-programming',
    'function',
    'go',
    'Maximum Subarray Sum (Kadane''s Algorithm)',
    'Write a function that returns the maximum possible sum of a contiguous subarray of `nums` (which must contain at least one element), using Kadane''s algorithm in O(n) time.',
    '- 1 <= len(nums) <= 10000
- -10^4 <= nums[i] <= 10^4',
    'Learn Kadane''s algorithm, one of the most widely applicable single-pass dynamic programming techniques.',
    'MaxSubarraySum',
    'int',
    '{"[]int"}',
    '{"At each position, the best contiguous subarray ending exactly there either extends the best subarray ending at the previous position, or starts fresh at the current element.","Whenever continuing the previous run would make things worse than starting over, starting fresh becomes the better choice.","Track the best subarray sum found ending at any position as you scan, and remember the overall best seen so far."}',
    4,
    190,
    '{"dynamic-programming","arrays"}',
    true,
    'seed-dynamic-programming-max-subarray-sum',
    '## Maximum Subarray Sum (Kadane''s Algorithm)

Write a function that returns the maximum possible sum of a contiguous subarray of `nums` (which must contain at least one element), using Kadane''s algorithm in O(n) time.

**Function signature**

```go
func MaxSubarraySum(nums []int) int
```

**Examples**

- `MaxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4])` returns `6`
- `MaxSubarraySum([1])` returns `1`

**Constraints**

- 1 <= len(nums) <= 10000
- -10^4 <= nums[i] <= 10^4

**Learning objective:** Learn Kadane''s algorithm, one of the most widely applicable single-pass dynamic programming techniques.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'max-subarray-sum'), '[[-2,1,-3,4,-1,2,1,-5,4]]'::jsonb, '6', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'max-subarray-sum'), '[[1]]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'max-subarray-sum'), '[[5,4,-1,7,8]]'::jsonb, '23', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'max-subarray-sum'), '[[-3,-1,-2]]'::jsonb, '-1', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'max-subarray-sum'), '[[-1]]'::jsonb, '-1', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- dynamic-programming :: 0/1 Knapsack (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'knapsack-01',
    'dynamic-programming',
    'function',
    'go',
    '0/1 Knapsack',
    'Given slices `weights` and `values` (of equal length, describing `n` items) and a knapsack `capacity`, write a function `Knapsack01(weights, values []int, capacity int) int` that returns the maximum total value achievable by selecting a subset of items whose combined weight does not exceed `capacity`, where each item may be chosen at most once.',
    '- 0 <= len(weights) == len(values) <= 200
- 0 <= weights[i], values[i] <= 1000
- 0 <= capacity <= 10000',
    'Implement the canonical 0/1 knapsack dynamic programming table, foundational for a huge family of selection-under-constraint problems.',
    'Knapsack01',
    'int',
    '{"[]int","[]int","int"}',
    '{"Each item can either be included in the knapsack or left out entirely — there''s no partial or repeated selection.","For each item, decide whether including it (if it fits) improves the best achievable value at its weight, compared to leaving it out.","Processing capacities from the largest down to the smallest for each item, rather than smallest up, ensures each item is only counted once."}',
    5,
    220,
    '{"dynamic-programming"}',
    true,
    'seed-dynamic-programming-knapsack-01',
    '## 0/1 Knapsack

Given slices `weights` and `values` (of equal length, describing `n` items) and a knapsack `capacity`, write a function `Knapsack01(weights, values []int, capacity int) int` that returns the maximum total value achievable by selecting a subset of items whose combined weight does not exceed `capacity`, where each item may be chosen at most once.

**Function signature**

```go
func Knapsack01(weights []int, values []int, capacity int) int
```

**Examples**

- `Knapsack01([1, 3, 4, 5], [1, 4, 5, 7], 7)` returns `9`
- `Knapsack01([1, 2, 3], [6, 10, 12], 5)` returns `22`

**Constraints**

- 0 <= len(weights) == len(values) <= 200
- 0 <= weights[i], values[i] <= 1000
- 0 <= capacity <= 10000

**Learning objective:** Implement the canonical 0/1 knapsack dynamic programming table, foundational for a huge family of selection-under-constraint problems.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'knapsack-01'), '[[1,3,4,5],[1,4,5,7],7]'::jsonb, '9', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'knapsack-01'), '[[1,2,3],[6,10,12],5]'::jsonb, '22', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'knapsack-01'), '[[],[],10]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'knapsack-01'), '[[5],[10],3]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'knapsack-01'), '[[2,2,2],[3,3,3],6]'::jsonb, '9', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- dynamic-programming :: Longest Common Substring (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'longest-common-substring-length',
    'dynamic-programming',
    'function',
    'go',
    'Longest Common Substring',
    'Write a function `LongestCommonSubstringLength(a, b string) int` that returns the length of the longest contiguous substring common to both `a` and `b`, contrasting with the longest common *subsequence*, which allows gaps.',
    '- 0 <= len(a), len(b) <= 1000',
    'Compare the substring dynamic programming recurrence (which resets on a mismatch) against the subsequence recurrence (which never resets), reinforcing why the two problems need different tables.',
    'LongestCommonSubstringLength',
    'int',
    '{"string","string"}',
    '{"Unlike a common subsequence, a common substring must be contiguous in both strings — no skipped characters allowed.","A table tracking ''the length of a common substring ending exactly at these two positions'' resets to 0 the moment characters stop matching, rather than falling back to an earlier best.","The overall answer is the largest value that ever appears anywhere in that table, not necessarily the value in its final cell."}',
    5,
    220,
    '{"dynamic-programming","strings"}',
    true,
    'seed-dynamic-programming-longest-common-substring-length',
    '## Longest Common Substring

Write a function `LongestCommonSubstringLength(a, b string) int` that returns the length of the longest contiguous substring common to both `a` and `b`, contrasting with the longest common *subsequence*, which allows gaps.

**Function signature**

```go
func LongestCommonSubstringLength(a string, b string) int
```

**Examples**

- `LongestCommonSubstringLength("abcde", "abfce")` returns `2`
- `LongestCommonSubstringLength("abcdef", "zabcf")` returns `3`

**Constraints**

- 0 <= len(a), len(b) <= 1000

**Learning objective:** Compare the substring dynamic programming recurrence (which resets on a mismatch) against the subsequence recurrence (which never resets), reinforcing why the two problems need different tables.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-common-substring-length'), '["abcde","abfce"]'::jsonb, '2', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-common-substring-length'), '["abcdef","zabcf"]'::jsonb, '3', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-common-substring-length'), '["abc","def"]'::jsonb, '0', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-common-substring-length'), '["","abc"]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'longest-common-substring-length'), '["aaaa","aa"]'::jsonb, '2', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- dynamic-programming :: Minimum Path Sum in a Grid (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints, learning_objective, func_name, return_type,
    param_types, hints, difficulty, xp_reward, tags, visible, source_hash, raw_readme
) VALUES (
    'min-path-sum-grid',
    'dynamic-programming',
    'function',
    'go',
    'Minimum Path Sum in a Grid',
    'A grid of non-negative integers is given as a flattened, row-major slice `grid` with dimensions `rows` x `cols`. Starting at the top-left cell and moving only right or down, write a function `MinPathSumGrid(grid []int, rows, cols int) int` that returns the minimum possible sum of values along a path to the bottom-right cell.',
    '- 1 <= rows, cols <= 200
- 0 <= grid[i] <= 1000',
    'Adapt the unique-paths grid recurrence from a counting problem into a cost-minimization problem.',
    'MinPathSumGrid',
    'int',
    '{"[]int","int","int"}',
    '{"The grid is given as one flattened row-major slice, so cell (r, c) sits at index r * cols + c.","Just as with counting unique paths, movement is restricted to right or down, so each cell''s best path sum builds on the cheaper of the cell above it and the cell to its left.","The top row and left column each have only one possible way in (straight across, or straight down), so their path sums accumulate directly rather than choosing between two options."}',
    5,
    220,
    '{"dynamic-programming"}',
    true,
    'seed-dynamic-programming-min-path-sum-grid',
    '## Minimum Path Sum in a Grid

A grid of non-negative integers is given as a flattened, row-major slice `grid` with dimensions `rows` x `cols`. Starting at the top-left cell and moving only right or down, write a function `MinPathSumGrid(grid []int, rows, cols int) int` that returns the minimum possible sum of values along a path to the bottom-right cell.

**Function signature**

```go
func MinPathSumGrid(grid []int, rows int, cols int) int
```

**Examples**

- `MinPathSumGrid([1, 3, 1, 1, 5, 1, 4, 2, 1], 3, 3)` returns `7`
- `MinPathSumGrid([1, 2, 3], 1, 3)` returns `6`

**Constraints**

- 1 <= rows, cols <= 200
- 0 <= grid[i] <= 1000

**Learning objective:** Adapt the unique-paths grid recurrence from a counting problem into a cost-minimization problem.'
) ON CONFLICT (slug) DO NOTHING;


INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-path-sum-grid'), '[[1,3,1,1,5,1,4,2,1],3,3]'::jsonb, '7', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-path-sum-grid'), '[[1,2,3],1,3]'::jsonb, '6', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-path-sum-grid'), '[[5],1,1]'::jsonb, '5', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-path-sum-grid'), '[[1,2,5,3,2,1],2,3]'::jsonb, '6', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'min-path-sum-grid'), '[[9,1,4,8],2,2]'::jsonb, '18', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

COMMIT;

-- ---- Verification: problem count per module (expect 15 / 15 / 15 / 15) ----
SELECT module, COUNT(*) AS problem_count
FROM problems
WHERE module IN ('hashmaps-sets', 'linked-lists', 'trees-graphs', 'dynamic-programming')
GROUP BY module
ORDER BY module;

-- ---- Verification: test case count per problem (expect 5 for every row) ----
SELECT p.slug, COUNT(tc.id) AS test_case_count
FROM problems p
JOIN test_cases tc ON tc.problem_id = p.id
WHERE p.module IN ('hashmaps-sets', 'linked-lists', 'trees-graphs', 'dynamic-programming')
GROUP BY p.slug
HAVING COUNT(tc.id) <> 5
ORDER BY p.slug;
-- An empty result set above confirms every problem has exactly 5 test cases.