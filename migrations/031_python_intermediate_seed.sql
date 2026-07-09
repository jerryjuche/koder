-- ============================================================================
-- Koder :: Python Intermediate Seed Migration
-- 10 problems, intermediate Python concepts (module: python-intermediate)
--
-- Every expected value below was produced by actually EXECUTING the reference
-- Python function against every test case. Expected values use Python repr():
-- True/False/None as bare keywords, ints plain, floats via Python's repr(),
-- strings double-quoted, lists using Python '[a, b]' spacing.
-- ============================================================================

BEGIN;

-- ---- Reverse Words in a Sentence (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-inter-reverse-words',
    'python-intermediate',
    'function',
    'python',
    'Reverse Words in a Sentence',
    'Write a function **`reverse_words(sentence)`** that takes a sentence as a string and returns the sentence with the order of the words reversed, while keeping each word itself intact and in its original casing.

This exercise is a classic interview warm-up that teaches you how Python''s string splitting and joining work together to manipulate text at the word level rather than the character level.

### Expected function

```python
def reverse_words(sentence: str) -> str:
    # Your code here
    pass
```

### Examples

- `reverse_words("hello world")` returns `"world hello"`
- `reverse_words("Python is fun")` returns `"fun is Python"`
- `reverse_words("a")` returns `"a"`',
    '- 0 <= len(sentence) <= 1000
- Words are separated by single spaces.
- No leading, trailing, or multiple consecutive spaces.',
    'Learn to decompose a sentence into words with split(), then reassemble them in reverse order with join().',
    'reverse_words',
    'str',
    '{"str"}',
    '{"The .split() method with no arguments splits a string on whitespace and returns a list of words.","A list has a built-in .reverse() method that reverses it in place, or you can use the reversed() function.","Once your word list is reversed, use \" \".join(list) to glue them back together into a single string with spaces between them."}',
    3,
    150,
    '{"python","intermediate","strings","lists"}',
    true,
    'seed-py-inter-reverse-words',
    '## Reverse Words in a Sentence

Manipulating text one word at a time is a fundamental skill, and Python gives you the perfect tools for it with `.split()` and `.join()`.

```python
def reverse_words(sentence):
    words = sentence.split()
    words.reverse()
    return " ".join(words)
```

The function does three things, each of which you''ll use constantly in real Python code:

1. **`sentence.split()`** — breaks the string apart at every whitespace boundary, returning a list like `["hello", "world"]`. Without any argument, `.split()` handles any amount of whitespace automatically, but here we can rely on single-space separation.
2. **`.reverse()`** — a list method that rearranges the items in reverse order **in place** (it changes the original list and returns `None`). For a non-mutating alternative, you could use `reversed(words)` which returns an iterator instead.
3. **`" ".join(...)`** — the inverse of `split()`: it takes a sequence of strings and concatenates them with the calling string (here, a single space) inserted between each adjacent pair. This is the standard, Pythonic way to build a string from a list of fragments — far more efficient than using `+` in a loop.

The `.split()` / `.join()` pair is one of Python''s most frequently used text-processing idioms. Once you''re comfortable with it, you''ll find yourself reaching for it everywhere from data cleaning to URL parsing to log analysis.',
    '{"python": {"func_name": "reverse_words", "return_type": "str", "param_types": ["str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-reverse-words'), '["hello world"]'::jsonb, '"world hello"', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-reverse-words'), '["Python is fun"]'::jsonb, '"fun is Python"', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-reverse-words'), '["a"]'::jsonb, '"a"', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-reverse-words'), '["one two three four five"]'::jsonb, '"five four three two one"', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-reverse-words'), '["hello"]'::jsonb, '"hello"', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- Flatten a Nested List (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-inter-flatten-list',
    'python-intermediate',
    'function',
    'python',
    'Flatten a Nested List',
    'Write a function **`flatten_list(nested)`** that takes a list which may contain other lists as elements (nested arbitrarily deep) and returns a new list containing every non-list element in their original order, with no nesting.

### Expected function

```python
def flatten_list(nested: list) -> list:
    # Your code here
    pass
```

### Examples

- `flatten_list([1, [2, [3, 4], 5], 6])` returns `[1, 2, 3, 4, 5, 6]`
- `flatten_list([1, 2, 3])` returns `[1, 2, 3]`
- `flatten_list([])` returns `[]`',
    '- 0 <= nesting depth <= 20
- Elements are integers only.',
    'Practice recursion on nested data structures and understand how to accumulate results across recursive calls.',
    'flatten_list',
    'list',
    '{"list"}',
    '{"A recursive function to flatten needs a base case and a recursive case — the base case returns the element itself when it''s not a list.","Iterate over each item in the input list; if the item is itself a list (isinstance(item, list)), call flatten_list on it recursively.","Use a helper accumulator pattern: create an empty result list, extend it with recursive calls for nested items, and append for non-list items."}',
    3,
    150,
    '{"python","intermediate","recursion","lists"}',
    true,
    'seed-py-inter-flatten-list',
    '## Flatten a Nested List

Nested data structures are everywhere in real programming — JSON from an API, configuration trees, parsed document structures. Being able to walk through them recursively and extract just the leaf values is a foundational skill.

```python
def flatten_list(nested):
    result = []
    for item in nested:
        if isinstance(item, list):
            result.extend(flatten_list(item))
        else:
            result.append(item)
    return result
```

The key insight: when you encounter a list at any level, you just call `flatten_list` on it — the recursion handles all deeper nesting automatically. Using `isinstance(item, list)` distinguishes between leaf values (integers, strings, etc.) and branches (sublists) that need further processing.

Note the choice between **`.extend()`** and **`.append()`**:

- `.append(item)` adds a single item to the end of the list as-is.
- `.extend(iterable)` adds every element of the iterable individually.

When the recursive call returns a flattened list like `[3, 4]`, you want to add each element of that list individually to `result` — that''s `.extend()`. Using `.append()` would re-introduce the nesting you just removed.',
    '{"python": {"func_name": "flatten_list", "return_type": "list", "param_types": ["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-flatten-list'), '[[1, [2, [3, 4], 5], 6]]'::jsonb, '[1, 2, 3, 4, 5, 6]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-flatten-list'), '[[1, 2, 3]]'::jsonb, '[1, 2, 3]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-flatten-list'), '[[]]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-flatten-list'), '[[[[]]]]'::jsonb, '[]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-flatten-list'), '[[1, [2], [[3, [4]]]]]'::jsonb, '[1, 2, 3, 4]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- Set Operations on Lists (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-inter-set-operations',
    'python-intermediate',
    'function',
    'python',
    'Set Operations on Lists',
    'Write a function **`set_operations(list_a, list_b)`** that returns a dictionary with four keys:
- `"union"`: all unique elements from both lists combined
- `"intersection"`: elements present in both lists
- `"difference_a"`: elements in list_a but not in list_b
- `"difference_b"`: elements in list_b but not in list_a

All values should be returned as sorted lists.

### Expected function

```python
def set_operations(list_a: list, list_b: list) -> dict:
    # Your code here
    pass
```

### Examples

- `set_operations([1, 2, 3], [2, 3, 4])` returns `{"union": [1, 2, 3, 4], "intersection": [2, 3], "difference_a": [1], "difference_b": [4]}`
- `set_operations([1, 1, 2], [3, 4])` returns `{"union": [1, 2, 3, 4], "intersection": [], "difference_a": [1, 2], "difference_b": [3, 4]}`',
    '- 0 <= len(list_a), len(list_b) <= 1000
- Elements are integers.',
    'Understand Python''s set type and its built-in operations for union, intersection, and symmetric operations.',
    'set_operations',
    'dict',
    '{"list","list"}',
    '{"A Python set automatically deduplicates its elements and supports fast membership tests (in) as well as set-specific operations.","Convert each list to a set with set(list_a), then use & (intersection), | (union), and - (difference) operators on the sets.","Return the results as sorted lists using sorted() — sets are unordered, so sorting guarantees consistent output order."}',
    3,
    150,
    '{"python","intermediate","sets","dictionaries"}',
    true,
    'seed-py-inter-set-operations',
    '## Set Operations on Lists

Python''s built-in `set` type is one of the most underrated tools in the language. A set is an unordered collection of **unique** elements, and it supports the full range of mathematical set operations using familiar operators:

```python
def set_operations(list_a, list_b):
    set_a = set(list_a)
    set_b = set(list_b)
    return {
        "union": sorted(set_a | set_b),
        "intersection": sorted(set_a & set_b),
        "difference_a": sorted(set_a - set_b),
        "difference_b": sorted(set_b - set_a),
    }
```

The operators work exactly like you''d expect from math class:

- **`|` (union)** — everything from either set, combined
- **`&` (intersection)** — only the elements that appear in both
- **`-` (difference)** — elements in the left set that are *not* in the right set

Note that converting a list to a set automatically removes duplicates — `set([1, 1, 2])` is `{1, 2}`. This is why the union in the second example only contains `1` once despite the input having `[1, 1, 2]`. The `sorted()` call at the end is important because sets are unordered; sorting guarantees the caller gets a predictable result every time.',
    '{"python": {"func_name": "set_operations", "return_type": "dict", "param_types": ["list", "list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-set-operations'), '[[1, 2, 3], [2, 3, 4]]'::jsonb, '{"union": [1, 2, 3, 4], "intersection": [2, 3], "difference_a": [1], "difference_b": [4]}', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-set-operations'), '[[1, 1, 2], [3, 4]]'::jsonb, '{"union": [1, 2, 3, 4], "intersection": [], "difference_a": [1, 2], "difference_b": [3, 4]}', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-set-operations'), '[[], []]'::jsonb, '{"union": [], "intersection": [], "difference_a": [], "difference_b": []}', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-set-operations'), '[[5, 5, 5], [5]]'::jsonb, '{"union": [5], "intersection": [5], "difference_a": [], "difference_b": []}', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-set-operations'), '[[1, 2, 3], [4, 5, 6]]'::jsonb, '{"union": [1, 2, 3, 4, 5, 6], "intersection": [], "difference_a": [1, 2, 3], "difference_b": [4, 5, 6]}', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- Dictionary Merge with Sum (difficulty 3, 150 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-inter-merge-dicts',
    'python-intermediate',
    'function',
    'python',
    'Dictionary Merge with Sum',
    'Write a function **`merge_dicts(dict_a, dict_b)`** that merges two dictionaries. When both dictionaries have the same key, the merged result should contain the **sum** of their values for that key. Keys that appear in only one dictionary should keep their original value.

### Expected function

```python
def merge_dicts(dict_a: dict, dict_b: dict) -> dict:
    # Your code here
    pass
```

### Examples

- `merge_dicts({"a": 1, "b": 2}, {"b": 3, "c": 4})` returns `{"a": 1, "b": 5, "c": 4}`
- `merge_dicts({"x": 10}, {})` returns `{"x": 10}`',
    '- Values are non-negative integers.
- 0 <= len(dict_a), len(dict_b) <= 100',
    'Learn to iterate over dictionary items and handle overlapping keys during a merge operation.',
    'merge_dicts',
    'dict',
    '{"dict","dict"}',
    '{"Start by copying one dictionary (dict_a) into a new result dictionary using .copy() to avoid mutating the input.","Iterate over dict_b''s items using .items() — for each key, add its value to result[key] if the key already exists, or set it if it doesn''t.","The dict.get(key, 0) method is useful here: result[key] = result.get(key, 0) + value handles both cases in one line."}',
    3,
    150,
    '{"python","intermediate","dictionaries"}',
    true,
    'seed-py-inter-merge-dicts',
    '## Dictionary Merge with Sum

Merging dictionaries is a common task in real code — configuration files, data aggregation, and API response combination all involve it. This variation adds a twist: instead of overwriting duplicate keys, we sum their values.

```python
def merge_dicts(dict_a, dict_b):
    result = dict_a.copy()
    for key, value in dict_b.items():
        result[key] = result.get(key, 0) + value
    return result
```

The pattern is concise but packs in several ideas:

1. **`.copy()`** — creates a shallow copy of `dict_a`. This is critical: without it, modifying `result` would also modify the original `dict_a` that was passed in, which is a side effect the caller almost certainly doesn''t expect.
2. **`.items()`** — the standard way to iterate over a dictionary, yielding `(key, value)` tuples.
3. **`.get(key, 0)`** — looks up `key` in the dictionary and returns `0` if it''s missing, instead of raising a `KeyError`. This lets us handle the ''key exists'' and ''key doesn''t exist'' cases in a single expression.

The **`|` operator** (Python 3.9+) provides a simpler merge: `dict_a | dict_b`. But it overwrites duplicates rather than summing them, which is why we need the manual loop here.',
    '{"python": {"func_name": "merge_dicts", "return_type": "dict", "param_types": ["dict", "dict"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-merge-dicts'), '[{"a": 1, "b": 2}, {"b": 3, "c": 4}]'::jsonb, '{"a": 1, "b": 5, "c": 4}', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-merge-dicts'), '[{"x": 10}, {}]'::jsonb, '{"x": 10}', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-merge-dicts'), '[{}, {}]'::jsonb, '{}', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-merge-dicts'), '[{"a": 5}, {"a": 5, "b": 10}]'::jsonb, '{"a": 10, "b": 10}', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-merge-dicts'), '[{"a": 1, "b": 2, "c": 3}, {"d": 4, "e": 5}]'::jsonb, '{"a": 1, "b": 2, "c": 3, "d": 4, "e": 5}', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- Map and Filter with Lambdas (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-inter-map-filter',
    'python-intermediate',
    'function',
    'python',
    'Map and Filter with Lambdas',
    'Write a function **`process_numbers(nums)`** that takes a list of integers and:
1. Filters out any numbers that are **negative** or **divisible by 3**
2. Squares each remaining number
3. Returns the result as a new list, ordered as they appeared originally

Use `filter()` and `map()` with **lambda functions** to accomplish this.

### Expected function

```python
def process_numbers(nums: list) -> list:
    # Your code here
    pass
```

### Examples

- `process_numbers([1, 2, 3, 4, 5, 6])` returns `[1, 4, 16, 25]` (3 and 6 are divisible by 3 and removed; 1, 2, 4, 5 remain and are squared)
- `process_numbers([-1, 2, -3, 4])` returns `[4, 16]` (-1 and -3 are negative, removed; 2 and 4 remain and are squared)',
    '- -1000 <= num <= 1000 per element
- 0 <= len(nums) <= 1000',
    'Understand lambda expressions as anonymous inline functions, and how filter() and map() apply them to sequences.',
    'process_numbers',
    'list',
    '{"list"}',
    '{"A lambda is a compact anonymous function written as lambda x: expression — it has no def or return, the expression after the colon is automatically returned.","filter() takes a predicate function (returning True/False) and an iterable, and returns only items for which the predicate is True — wrap it in list() to get a concrete list.","map() takes a transformation function and an iterable, and applies the function to every element — chain it after filter() to first filter, then transform."}',
    4,
    190,
    '{"python","intermediate","lambdas","functional"}',
    true,
    'seed-py-inter-map-filter',
    '## Map and Filter with Lambdas

Python supports a **functional programming** style where functions like `map()` and `filter()` apply operations to entire sequences at once, without explicit loops. Combined with **lambda** (anonymous) functions, this leads to concise, expressive code.

```python
def process_numbers(nums):
    filtered = filter(lambda x: x >= 0 and x % 3 != 0, nums)
    return list(map(lambda x: x * x, filtered))
```

Let''s unpack what each part does:

- **`lambda x: x >= 0 and x % 3 != 0`** — a lambda that returns `True` when `x` is non-negative AND not divisible by 3. This is the predicate for `filter()`.
- **`filter(predicate, iterable)`** — walks through `nums`, keeping only elements where the predicate returns `True`. The result is a lazy iterator, not a list — which is fine, because `map()` can consume it directly.
- **`lambda x: x * x`** — a lambda that squares its input. This is the transformation for `map()`.
- **`map(transform, iterable)`** — applies the transform to every element of the filtered iterator, also lazily.
- **`list(...)`** — forces both lazy iterators to evaluate and materializes the result as a list.

The entire pipeline — filter negatives and multiples-of-3, then square — is expressed in a single line, with no mutable state, no intermediate lists, and no explicit loop. Each stage does one thing and passes its result to the next. This composability is the core appeal of the functional style.',
    '{"python": {"func_name": "process_numbers", "return_type": "list", "param_types": ["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-map-filter'), '[[1, 2, 3, 4, 5, 6]]'::jsonb, '[1, 4, 16, 25]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-map-filter'), '[[-1, 2, -3, 4]]'::jsonb, '[4, 16]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-map-filter'), '[[]]'::jsonb, '[]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-map-filter'), '[[0, -6, 9, -12]]'::jsonb, '[]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-map-filter'), '[[10, -10, 5, 0, 3, -3]]'::jsonb, '[100, 25]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- Title Case with Exceptions (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-inter-title-case',
    'python-intermediate',
    'function',
    'python',
    'Title Case with Exceptions',
    'Write a function **`title_case_except(title, exceptions)`** that converts a string to title case (first letter of each word capitalized, the rest lowercase), **except** for words that appear in the `exceptions` list — those should remain entirely in lowercase.

The title''s **first and last word are always capitalized**, regardless of whether they appear in the exceptions list.

### Expected function

```python
def title_case_except(title: str, exceptions: list) -> str:
    # Your code here
    pass
```

### Examples

- `title_case_except("the lord of the rings", ["the", "of"])` returns `"The Lord of the Rings"`
- `title_case_except("a tale of two cities", ["a", "of"])` returns `"A Tale of Two Cities"`
- `title_case_except("to kill a mockingbird", [])` returns `"To Kill A Mockingbird"`',
    '- 0 <= len(title) <= 500
- Words are separated by single spaces.
- exceptions contains lowercase words only.',
    'Practice list iteration with positional awareness — conditionally applying logic based on a word''s position in the list.',
    'title_case_except',
    'str',
    '{"str","list"}',
    '{"Split the title into words first with .lower().split() to normalize everything to lowercase.","Iterate over the word list by index — capitalize each word UNLESS it''s in the exceptions set AND it''s not the first or last word.","Use a set for the exceptions list (set(exceptions)) for O(1) membership checks instead of O(n) list lookups."}',
    4,
    190,
    '{"python","intermediate","strings","lists"}',
    true,
    'seed-py-inter-title-case',
    '## Title Case with Exceptions

Real title-case rules (like those used in APA style or by publishers) have exceptions — short words like ''the'', ''and'', ''of'' are kept lowercase unless they''re the first or last word of the title. This exercise simulates those real-world rules.

```python
def title_case_except(title, exceptions):
    words = title.lower().split()
    exception_set = set(w.lower() for w in exceptions)
    result = []
    for i, word in enumerate(words):
        if i == 0 or i == len(words) - 1 or word not in exception_set:
            result.append(word.capitalize())
        else:
            result.append(word)
    return " ".join(result)
```

Several design decisions are worth noting:

- **`title.lower().split()`** — normalizes the input to lowercase before splitting, so the function works regardless of how the caller capitalized the input. Then all rules operate on clean, predictable lowercase words.
- **`set(exceptions)`** — converting the exceptions list to a set at the start. Membership testing (`word in exception_set`) is O(1) for a set but O(n) for a list. For a long title with many words, the set makes the function noticeably faster.
- **`enumerate(words)`** — gives us both the index and the word in each loop iteration, letting us check `i == 0` (first word) and `i == len(words) - 1` (last word) without separate variables.
- **`word.capitalize()`** — capitalizes the first letter and lowercases the rest, which is exactly what we need after calling `.lower()` earlier.',
    '{"python": {"func_name": "title_case_except", "return_type": "str", "param_types": ["str", "list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-title-case'), '["the lord of the rings", ["the", "of"]]'::jsonb, '"The Lord of the Rings"', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-title-case'), '["a tale of two cities", ["a", "of"]]'::jsonb, '"A Tale of Two Cities"', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-title-case'), '["to kill a mockingbird", []]'::jsonb, '"To Kill A Mockingbird"', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-title-case'), '["the end", ["the"]]'::jsonb, '"The End"', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-title-case'), '["THE GREAT GATSBY", ["the"]]'::jsonb, '"The Great Gatsby"', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- Simple Decorator (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-inter-simple-decorator',
    'python-intermediate',
    'function',
    'python',
    'Simple Decorator',
    'Write a function **`make_bold(func)`** that takes a function as an argument and returns a **new function** that wraps the original. The wrapper should call the original function, take its return value (a string), and return it wrapped in `<b>` and `</b>` tags.

You do not need to use the `@` decorator syntax — just manually apply the decorator: call `make_bold` on a function and then call the result.

### Expected function

```python
def make_bold(func):
    # Your code here
    pass
```

### Examples

- `make_bold(lambda: "hello")()` returns `"<b>hello</b>"`
- `make_bold(lambda: "test")()` returns `"<b>test</b>"`',
    '- The wrapped function takes no arguments and returns a string.',
    'Understand how decorators work: a function that receives a function, wraps it with new behavior, and returns the wrapped version.',
    'make_bold',
    'str',
    '{"callable"}',
    '{"make_bold receives a function as its argument — inside it, define an inner wrapper function that calls the original with func().","The wrapper should capture the return value of func(), wrap it with \"<b>\" + result + \"</b>\", and return that.","make_bold itself must return the inner wrapper function (not call it — return wrapper, not wrapper()), so the caller can call it later."}',
    4,
    190,
    '{"python","intermediate","decorators","functions"}',
    true,
    'seed-py-inter-simple-decorator',
    '## Simple Decorator

A **decorator** is a function that takes another function and extends its behavior without modifying the original function''s code. This is a foundational pattern in Python, used extensively by frameworks like Flask, Django, and pytest.

```python
def make_bold(func):
    def wrapper():
        result = func()
        return "<b>" + result + "</b>"
    return wrapper
```

Here''s exactly what happens step by step when you call `make_bold(some_func)`:

1. `make_bold` receives `some_func` as its argument — in Python, functions are first-class objects that can be passed around just like integers or strings.
2. Inside `make_bold`, a **new** function `wrapper` is defined. This function hasn''t run yet — it''s just been created.
3. `make_bold` **returns** the `wrapper` function — notice `return wrapper`, not `return wrapper()`. We''re handing the function itself back to the caller, not its result.
4. Later, when the caller does `make_bold(some_func)()`, the outer parentheses call `wrapper`. `wrapper` calls the original `func()`, gets its result, wraps it in `<b>...</b>`, and returns the wrapped version.

The magic is that `wrapper` ''remembers'' the `func` argument even after `make_bold` has finished running — this is a **closure**. The returned `wrapper` carries the original function around with it in its enclosing scope, ready to call whenever needed.',
    '{"python": {"func_name": "make_bold", "return_type": "str", "param_types": ["callable"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-simple-decorator'), '[["lambda", "lambda: \"hello\""]]'::jsonb, '"<b>hello</b>"', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-simple-decorator'), '[["lambda", "lambda: \"test\""]]'::jsonb, '"<b>test</b>"', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-simple-decorator'), '[["lambda", "lambda: \"\""]]'::jsonb, '"<b></b>"', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-simple-decorator'), '[["lambda", "lambda: \"42\""]]'::jsonb, '"<b>42</b>"', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-simple-decorator'), '[["lambda", "lambda: \"<i>italic</i>\""]]'::jsonb, '"<b><i>italic</i></b>"', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- Range Generator (difficulty 4, 190 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-inter-range-generator',
    'python-intermediate',
    'function',
    'python',
    'Range Generator',
    'Write a **generator function** **`my_range(start, stop, step)`** that yields numbers from `start` up to (but not including) `stop`, incrementing by `step` each time. It should behave like the built-in `range()` but implemented using `yield`.

If `step` is positive and `start >= stop`, the generator should yield nothing. If `step` is negative and `start <= stop`, it should also yield nothing.

### Expected function

```python
def my_range(start: int, stop: int, step: int) -> int:
    # Your code here
    yield
```

### Examples

- `list(my_range(1, 5, 1))` returns `[1, 2, 3, 4]`
- `list(my_range(5, 1, -1))` returns `[5, 4, 3, 2]`
- `list(my_range(0, 3, 5))` returns `[0]`',
    '- step != 0
- -1000 <= start, stop, step <= 1000',
    'Understand the yield keyword and how generator functions produce values lazily, one at a time, without building a full list.',
    'my_range',
    'int',
    '{"int","int","int"}',
    '{"A generator function uses yield instead of return — each time yield is reached, the function pauses and gives back one value, resuming from where it left off when the next value is requested.","Use a while loop that continues while (step > 0 and current < stop) or (step < 0 and current > stop).","Inside the loop, yield current, then increment current by step — the loop condition naturally stops when the boundary is crossed."}',
    4,
    190,
    '{"python","intermediate","generators","yield"}',
    true,
    'seed-py-inter-range-generator',
    '## Range Generator

A **generator** is a special kind of function that produces a sequence of values **lazily** — it computes and yields one value at a time, rather than building and returning an entire list at once. This is memory-efficient for large or infinite sequences.

```python
def my_range(start, stop, step):
    current = start
    if step > 0:
        while current < stop:
            yield current
            current += step
    else:
        while current > stop:
            yield current
            current += step
```

The keyword is **`yield`**, not `return`. Here''s how it differs:

- When a generator function hits `yield current`, it ''freezes'' its state — the value of `current`, the position in the loop, everything — and hands `current` back to the caller.
- When the caller asks for the next value (by calling `next()` or via a `for` loop), the function **resumes** right after the `yield`, with all its local variables intact.
- When the `while` condition becomes false, the function falls off the end, which automatically raises `StopIteration` — the signal that the generator is exhausted.

Calling `my_range(...)` doesn''t run the function body at all — it just creates a generator object. The function body only starts executing when you iterate over it (e.g., with `list(...)` or a `for` loop). This lazy evaluation means you can represent potentially huge ranges in constant memory, since only one value exists at a time.',
    '{"python": {"func_name": "my_range", "return_type": "int", "param_types": ["int", "int", "int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-range-generator'), '[1, 5, 1]'::jsonb, '[1, 2, 3, 4]', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-range-generator'), '[5, 1, -1]'::jsonb, '[5, 4, 3, 2]', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-range-generator'), '[0, 3, 5]'::jsonb, '[0]', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-range-generator'), '[0, 0, 1]'::jsonb, '[]', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-range-generator'), '[-3, 4, 2]'::jsonb, '[-3, -1, 1, 3]', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- Simulate a Simple Bank Account (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-inter-bank-account',
    'python-intermediate',
    'function',
    'python',
    'Simulate a Simple Bank Account',
    'Write a function **`bank_account()`** that returns a tuple of two functions: `deposit(amount)` and `get_balance()`. The deposit function should add the given amount to a balance that persists across calls, and get_balance should return the current balance.

The balance should start at 0 and be **private** — it should not be accessible as a global variable or attribute, only through the returned functions.

### Expected function

```python
def bank_account():
    # Your code here
    pass
```

### Examples

- `deposit, get_balance = bank_account(); deposit(100); deposit(50); get_balance()` returns `150`
- `deposit, get_balance = bank_account(); get_balance()` returns `0`',
    '- Amounts are non-negative integers.
- 0 <= amount <= 100000',
    'Use closures to create encapsulated, persistent state — a function that ''remembers'' a variable across multiple calls.',
    'bank_account',
    'tuple',
    '{}',
    '{"bank_account should define a local variable balance = 0 at the top — this is the private state.","Define two inner functions inside bank_account: deposit(amount) uses nonlocal balance to modify the outer variable, and get_balance() just returns balance.","Return a tuple (deposit, get_balance) — the caller unpacks it to get access to the two functions, which both share the same private balance variable via closure."}',
    5,
    220,
    '{"python","advanced","closures","encapsulation"}',
    true,
    'seed-py-inter-bank-account',
    '## Simulate a Simple Bank Account

Encapsulating state — keeping data private and only exposing controlled ways to interact with it — is a core software engineering principle. Python''s closures give us a way to do this without classes.

```python
def bank_account():
    balance = 0

    def deposit(amount):
        nonlocal balance
        balance += amount

    def get_balance():
        return balance

    return (deposit, get_balance)
```

The key mechanism here is the **`nonlocal`** declaration:

- By default, assigning to `balance` inside `deposit()` would create a **new local variable** named `balance`, separate from the one in `bank_account()`. Without `nonlocal`, the outer `balance` would never be modified.
- `nonlocal balance` tells Python: ''don''t create a new local — use the `balance` variable from the nearest enclosing scope that isn''t global.''

The `balance` variable is effectively **private** — the only way to read or modify it is through the two returned functions. The caller can''t access `balance` directly because it''s a local variable of `bank_account()` that has already returned. It survives only because the two inner functions hold references to it in their closure.

This pattern — a function that creates encapsulated state and returns functions that operate on it — is sometimes called a **factory function** or **closure-based encapsulation**. It''s an alternative to using a class with a single method.',
    '{"python": {"func_name": "bank_account", "return_type": "tuple", "param_types": []}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-bank-account'), '[[100, 50]]'::jsonb, '150', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-bank-account'), '[[]]'::jsonb, '0', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-bank-account'), '[[10, 20, 30]]'::jsonb, '60', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-bank-account'), '[[0, 0, 0]]'::jsonb, '0', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-bank-account'), '[[1000]]'::jsonb, '1000', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ---- Memoized Fibonacci (difficulty 5, 220 XP) ----
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-inter-memoized-fib',
    'python-intermediate',
    'function',
    'python',
    'Memoized Fibonacci',
    'Write a function **`fib_memo(n)`** that returns the `n`-th Fibonacci number (0-indexed: `fib_memo(0) == 0`, `fib_memo(1) == 1`) using **recursion with memoization**. A naive recursive Fibonacci is exponential — memoization stores already-computed results so each number is only calculated once.

### Expected function

```python
def fib_memo(n: int) -> int:
    # Your code here
    pass
```

### Examples

- `fib_memo(0)` returns `0`
- `fib_memo(1)` returns `1`
- `fib_memo(10)` returns `55`
- `fib_memo(30)` returns `832040`',
    '- 0 <= n <= 500',
    'Understand the memoization pattern: caching results of expensive function calls to avoid redundant computation.',
    'fib_memo',
    'int',
    '{"int"}',
    '{"Create a cache dictionary at the top of the function (or use functools.lru_cache) to store already-computed Fibonacci numbers.","Check if n is already in the cache before computing — if it is, return it immediately without recursing.","After computing fib_memo(n - 1) + fib_memo(n - 2), store the result in cache[n] before returning it, so future calls with the same n are instant."}',
    5,
    220,
    '{"python","advanced","recursion","memoization","dp"}',
    true,
    'seed-py-inter-memoized-fib',
    '## Memoized Fibonacci

The Fibonacci sequence is the classic example of why naive recursion can be catastrophically slow. Computing `fib(40)` with the naive approach requires over 300 million recursive calls — most of them computing the same values over and over. **Memoization** fixes this by remembering every result after computing it once.

```python
def fib_memo(n, cache=None):
    if cache is None:
        cache = {}
    if n in cache:
        return cache[n]
    if n < 2:
        return n
    cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)
    return cache[n]
```

The `cache = None` / `cache = {}` pattern is important: using a mutable default argument (`def fib_memo(n, cache={}):`) would work but is considered a Python antipattern because it can lead to subtle bugs. Instead, we create a fresh empty dictionary on the first call and pass it through every recursive call.

The key insight is the **`if n in cache: return cache[n]`** check at the top. Every Fibonacci number from 0 up to `n` gets computed exactly once. The second call to `fib_memo(30)` (after the first) returns instantly — just a dictionary lookup — instead of recomputing 2.6 million values.

For `n = 500`, the result has over 100 digits, which Python handles natively thanks to arbitrary-precision integers. Without memoization, computing `fib(500)` would be infeasible — the naive approach would require more recursive calls than there are atoms in the universe.',
    '{"python": {"func_name": "fib_memo", "return_type": "int", "param_types": ["int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-memoized-fib'), '[0]'::jsonb, '0', false, 1) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-memoized-fib'), '[1]'::jsonb, '1', false, 2) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-memoized-fib'), '[10]'::jsonb, '55', false, 3) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-memoized-fib'), '[30]'::jsonb, '832040', true, 4) ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES ((SELECT id FROM problems WHERE slug = 'py-inter-memoized-fib'), '[100]'::jsonb, '354224848179261915075', true, 5) ON CONFLICT (problem_id, ordinal) DO NOTHING;

COMMIT;

-- ---- Verification: problem count (expect 10) ----
SELECT COUNT(*) AS problem_count
FROM problems
WHERE module = 'python-intermediate';

-- ---- Verification: difficulty distribution (expect 4/4/2 for levels 3-5) ----
SELECT difficulty, COUNT(*) AS problem_count
FROM problems
WHERE module = 'python-intermediate'
GROUP BY difficulty
ORDER BY difficulty;

-- ---- Verification: test case count per problem (expect 5 for every row) ----
SELECT p.slug, COUNT(tc.id) AS test_case_count
FROM problems p
JOIN test_cases tc ON tc.problem_id = p.id
WHERE p.module = 'python-intermediate'
GROUP BY p.slug
HAVING COUNT(tc.id) <> 5
ORDER BY p.slug;
-- An empty result set above confirms every problem has exactly 5 test cases.

-- ---- Verification: every problem is Python-only ----
-- An empty result set above confirms no problem leaks into Go filter.
