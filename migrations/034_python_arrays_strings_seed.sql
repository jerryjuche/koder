-- ============================================================================
-- Koder :: Python Arrays & Strings Seed Migration
-- 7 problems covering list and string operations (module: python-arrays-strings)
--
-- Difficulty progression: 1-2 (70-100 XP)
-- ============================================================================

BEGIN;

-- ============================================================================
-- Problem 1: Find Maximum Element (difficulty 1, 70 XP)
-- ============================================================================
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-arr-str-find-max',
    'python-arrays-strings',
    'function',
    'python',
    'Find Maximum Element',
    'A list is one of the most versatile data structures in Python. It allows you to store multiple values in a single variable and access them by their position, or index. Lists are ordered, meaning the elements have a defined sequence that is preserved.

Working with lists often involves examining each element to find one with a particular property. One of the most common tasks is finding the largest value — the maximum — in a collection of numbers. This requires iterating through the list, comparing each element against the best candidate found so far, and updating that candidate when a larger value appears.

The ability to track a running value across iterations is a fundamental programming pattern that appears in countless real-world applications, from calculating statistics to processing sensor data.',
    '- The list will contain at least one element
- Elements are integers between -10^6 and 10^6',
    'Learn to iterate through a list while tracking a running maximum value using comparison and variable reassignment.',
    'find_max',
    'int',
    '{"int[]"}',
    '{"Start by assuming the first element is the maximum, then iterate through the rest of the list.","Use a for loop to examine each element and update your candidate whenever you find a larger value.","Think about what happens with negative numbers — the same comparison logic works for all integers."}',
    1,
    70,
    '{"python","arrays","beginner","iteration"}',
    true,
    'seed-py-arr-str-find-max',
    '## Find Maximum Element

A list is one of the most versatile data structures in Python. It allows you to store multiple values in a single variable and access them by their position, or index. Lists are ordered, meaning the elements have a defined sequence that is preserved.

Working with lists often involves examining each element to find one with a particular property. One of the most common tasks is finding the largest value — the maximum — in a collection of numbers.

### Expected function

```python
def find_max(arr: list) -> int:
    # Your code here
    pass
```

### Examples

- `find_max([3, 7, 2, 9, 1])` returns `9`
- `find_max([-5, -2, -10])` returns `-2`
- `find_max([42])` returns `42`

### Constraints

- The list will contain at least one element
- Elements are integers between -10^6 and 10^6

### Reference solution

```python
def find_max(arr):
    maximum = arr[0]
    for num in arr:
        if num > maximum:
            maximum = num
    return maximum
```

The solution initializes `maximum` with the first element, then iterates through every element. Each time a larger value is found, the candidate is updated. After the loop, `maximum` holds the largest value in the list.',
    '{"python": {"func_name": "find_max", "return_type": "int", "param_types": ["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-find-max'), '[[3, 7, 2, 9, 1]]'::jsonb, '9', false, 1)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-find-max'), '[[-5, -2, -10, -1]]'::jsonb, '-1', false, 2)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-find-max'), '[[42]]'::jsonb, '42', false, 3)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-find-max'), '[[0, 0, 0]]'::jsonb, '0', false, 4)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-find-max'), '[[100, 200, 50, 150]]'::jsonb, '200', true, 5)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-find-max'), '[[-1, -5, -3]]'::jsonb, '-1', true, 6)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ============================================================================
-- Problem 2: Reverse a String (difficulty 1, 70 XP)
-- ============================================================================
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-arr-str-reverse-string',
    'python-arrays-strings',
    'function',
    'python',
    'Reverse a String',
    'Strings in Python are sequences of characters that can be accessed, sliced, and manipulated in many ways. Like lists, strings are ordered collections where each character has a numeric index, starting from zero.

Reversing a string is a classic exercise that teaches you how to work with character positions and understand the relationship between a string''s start and end. When you reverse a string, the first character becomes the last, the second becomes the second-to-last, and so on.

There are multiple approaches to reversing a string in Python, from using Python''s powerful slicing syntax to building the result character by character in a loop. Each approach reinforces a different aspect of Python''s sequence model.',
    '- The string length is between 0 and 1000 characters
- The string may contain any printable ASCII characters',
    'Practice reversing a string using Python''s slicing syntax or a manual loop to build familiarity with sequence indexing.',
    'reverse_string',
    'str',
    '{"text"}',
    '{"Python strings support slicing with the syntax [start:stop:step] — a step of -1 reverses the string.","If you iterate manually, track the index from the end of the string and build the result one character at a time.","An empty string reversed is still an empty string — handle that edge case naturally."}',
    1,
    70,
    '{"python","strings","beginner","slicing"}',
    true,
    'seed-py-arr-str-reverse-string',
    '## Reverse a String

Strings in Python are sequences of characters that can be accessed, sliced, and manipulated in many ways. Like lists, strings are ordered collections where each character has a numeric index, starting from zero.

Reversing a string is a classic exercise that teaches you how to work with character positions and understand the relationship between a string''s start and end.

### Expected function

```python
def reverse_string(s: str) -> str:
    # Your code here
    pass
```

### Examples

- `reverse_string("hello")` returns `"olleh"`
- `reverse_string("Python")` returns `"nohtyP"`
- `reverse_string("a")` returns `"a"`
- `reverse_string("")` returns `""`

### Constraints

- The string length is between 0 and 1000 characters

### Reference solution

```python
def reverse_string(s):
    return s[::-1]
```

Python''s slice notation `[::-1]` creates a reversed copy of the string. The start and stop values are omitted (meaning the entire string), and the step of -1 makes Python traverse the string from end to start. This is the most Pythonic and efficient way to reverse a string.',
    '{"python": {"func_name": "reverse_string", "return_type": "str", "param_types": ["str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-reverse-string'), '["hello"]'::jsonb, '"olleh"', false, 1)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-reverse-string'), '["Python"]'::jsonb, '"nohtyP"', false, 2)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-reverse-string'), '["a"]'::jsonb, '"a"', false, 3)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-reverse-string'), '[""]'::jsonb, '""', false, 4)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-reverse-string'), '["racecar"]'::jsonb, '"racecar"', true, 5)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-reverse-string'), '["12345"]'::jsonb, '"54321"', true, 6)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ============================================================================
-- Problem 3: Count Vowels (difficulty 1, 70 XP)
-- ============================================================================
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-arr-str-count-vowels',
    'python-arrays-strings',
    'function',
    'python',
    'Count Vowels',
    'Strings contain characters, and you will often need to examine those characters one at a time to perform a count or find a match. Iterating through a string with a loop gives you access to each character in sequence.

A common task is counting specific types of characters, such as vowels (a, e, i, o, u). This requires checking each character against a set of target values and incrementing a counter whenever a match is found. Both uppercase and lowercase vowels should be included in the count, which means you will need to handle case differences.

This pattern — iterating, testing, and counting — is one of the most frequently used techniques in programming, forming the basis for everything from text analysis to data validation.',
    '- The string length is between 0 and 1000 characters
- Vowels are: a, e, i, o, u (both uppercase and lowercase)
- The letter y is not considered a vowel',
    'Practice character iteration and conditional counting by identifying vowel characters in a string.',
    'count_vowels',
    'int',
    '{"text"}',
    '{"Convert the string to lowercase with .lower() before checking so you only need to compare against lowercase vowels.","Use the in operator to check if a character is in the string \"aeiou\".","Initialize a counter variable to zero, then increment it for each vowel you find."}',
    1,
    70,
    '{"python","strings","beginner","counting"}',
    true,
    'seed-py-arr-str-count-vowels',
    '## Count Vowels

Strings contain characters, and you will often need to examine those characters one at a time to perform a count or find a match. Iterating through a string with a loop gives you access to each character in sequence.

### Expected function

```python
def count_vowels(s: str) -> int:
    # Your code here
    pass
```

### Examples

- `count_vowels("hello")` returns `2`
- `count_vowels("AEIOU")` returns `5`
- `count_vowels("rhythm")` returns `0`
- `count_vowels("")` returns `0`

### Constraints

- Vowels are: a, e, i, o, u (both cases)
- The letter y is not considered a vowel

### Reference solution

```python
def count_vowels(s):
    vowels = "aeiou"
    count = 0
    for char in s.lower():
        if char in vowels:
            count += 1
    return count
```

The solution converts the string to lowercase once using `.lower()`, then iterates through each character. The `in` operator checks whether the character is one of the five vowels, and the counter increments for each match.',
    '{"python": {"func_name": "count_vowels", "return_type": "int", "param_types": ["str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-count-vowels'), '["hello"]'::jsonb, '2', false, 1)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-count-vowels'), '["AEIOU"]'::jsonb, '5', false, 2)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-count-vowels'), '["rhythm"]'::jsonb, '0', false, 3)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-count-vowels'), '[""]'::jsonb, '0', false, 4)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-count-vowels'), '["Python is fun"]'::jsonb, '4', true, 5)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-count-vowels'), '["aEiOu"]'::jsonb, '5', true, 6)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ============================================================================
-- Problem 4: Palindrome Check (difficulty 2, 100 XP)
-- ============================================================================
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-arr-str-palindrome',
    'python-arrays-strings',
    'function',
    'python',
    'Palindrome Check',
    'A palindrome is a word, phrase, or sequence that reads the same forwards and backwards. Common examples include "racecar", "madam", and "level". Checking whether a string is a palindrome is a classic programming problem that reinforces your understanding of string indexing and comparison.

To determine if a string is a palindrome, you compare characters from both ends moving inward: the first character against the last, the second against the second-to-last, and so on. If all pairs match, the string is a palindrome.

This exercise builds on your ability to access individual characters by index and to write comparisons that test symmetry. The simplest approach uses Python''s slicing to reverse the string and compare it to the original.',
    '- The string length is between 0 and 1000 characters
- The comparison is case-sensitive and includes all characters, including spaces and punctuation',
    'Understand palindrome detection by comparing a string to its reverse, reinforcing sequence comparison and boolean return values.',
    'is_palindrome',
    'bool',
    '{"text"}',
    '{"The most concise approach: reverse the string with [::-1] and check if it equals the original with ==.","A palindrome reads the same forwards and backwards — an empty string and a single character are both palindromes.","If you use a loop, compare characters from the start and end moving inward, and return False as soon as a mismatch is found."}',
    2,
    100,
    '{"python","strings","palindrome","comparison"}',
    true,
    'seed-py-arr-str-palindrome',
    '## Palindrome Check

A palindrome is a word, phrase, or sequence that reads the same forwards and backwards. Common examples include "racecar", "madam", and "level".

### Expected function

```python
def is_palindrome(s: str) -> bool:
    # Your code here
    pass
```

### Examples

- `is_palindrome("racecar")` returns `True`
- `is_palindrome("hello")` returns `False`
- `is_palindrome("a")` returns `True`
- `is_palindrome("")` returns `True`

### Constraints

- The comparison is case-sensitive and exact
- Spaces and punctuation are included in the comparison

### Reference solution

```python
def is_palindrome(s):
    return s == s[::-1]
```

Reversing the string with slicing and comparing it to the original is the most Pythonic approach. If the reversed string is identical to the original, the string is a palindrome.',
    '{"python": {"func_name": "is_palindrome", "return_type": "bool", "param_types": ["str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-palindrome'), '["racecar"]'::jsonb, 'true', false, 1)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-palindrome'), '["hello"]'::jsonb, 'false', false, 2)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-palindrome'), '["a"]'::jsonb, 'true', false, 3)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-palindrome'), '[""]'::jsonb, 'true', false, 4)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-palindrome'), '["madam"]'::jsonb, 'true', true, 5)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-palindrome'), '["Python"]'::jsonb, 'false', true, 6)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ============================================================================
-- Problem 5: List Sum (difficulty 1, 70 XP)
-- ============================================================================
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-arr-str-list-sum',
    'python-arrays-strings',
    'function',
    'python',
    'List Sum',
    'Computing the sum of all elements in a list is one of the most fundamental list-processing operations. Whether you are calculating a total score, adding up expenses, or aggregating measurements, the ability to accumulate a running total as you iterate through a list is essential.

The accumulation pattern involves initializing a variable (often called total) to zero, then adding each element''s value to that variable as you iterate through the list. After the loop completes, the variable holds the sum of all elements.

This pattern extends beyond simple addition — you can use the same approach to compute products, concatenate strings, or build any aggregate value from a sequence of inputs.',
    '- The list may be empty (sum of an empty list is 0)
- Elements are integers between -10^6 and 10^6',
    'Master the accumulation pattern by summing list elements with a running total variable.',
    'list_sum',
    'int',
    '{"int[]"}',
    '{"Initialize a variable to 0 before the loop — this will hold your running total.","Add each element to your total inside the loop using the += operator.","An empty list should return 0 — the loop body simply never executes, so the initial value is returned."}',
    1,
    70,
    '{"python","arrays","beginner","accumulation"}',
    true,
    'seed-py-arr-str-list-sum',
    '## List Sum

Computing the sum of all elements in a list is one of the most fundamental list-processing operations. The accumulation pattern — initializing a variable and updating it inside a loop — appears in nearly every program you will write.

### Expected function

```python
def list_sum(arr: list) -> int:
    # Your code here
    pass
```

### Examples

- `list_sum([1, 2, 3, 4, 5])` returns `15`
- `list_sum([-10, 10])` returns `0`
- `list_sum([])` returns `0`

### Constraints

- The list may be empty (sum is 0)
- Elements are integers between -10^6 and 10^6

### Reference solution

```python
def list_sum(arr):
    total = 0
    for num in arr:
        total += num
    return total
```

The solution uses a `total` variable initialized to zero. Each element is added to `total` using the `+=` augmented assignment operator. After the loop, `total` holds the sum of all elements. If the list is empty, the loop never runs and `0` is returned.',
    '{"python": {"func_name": "list_sum", "return_type": "int", "param_types": ["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-list-sum'), '[[1, 2, 3, 4, 5]]'::jsonb, '15', false, 1)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-list-sum'), '[[-10, 10]]'::jsonb, '0', false, 2)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-list-sum'), '[[0, 0, 0]]'::jsonb, '0', false, 3)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-list-sum'), '[[]]'::jsonb, '0', false, 4)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-list-sum'), '[[1, -2, 3, -4, 5]]'::jsonb, '3', true, 5)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-list-sum'), '[[100]]'::jsonb, '100', true, 6)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ============================================================================
-- Problem 6: Count Words (difficulty 2, 100 XP)
-- ============================================================================
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-arr-str-count-words',
    'python-arrays-strings',
    'function',
    'python',
    'Count Words',
    'A sentence is a string that contains words separated by whitespace. Counting the number of words in a sentence is a common text-processing task that requires you to split the string into its component parts.

Python provides a built-in way to break a string into a list of words using the split() method. When called without arguments, split() divides the string at every whitespace boundary and returns a list of the resulting words. It automatically handles multiple consecutive spaces as well as leading and trailing whitespace.

Once you have the list of words, determining the count is a simple matter of measuring the list length. This problem teaches you to decompose a text-processing task into discrete steps: separating the input, examining the parts, and producing a result.',
    '- The string length is between 0 and 1000 characters
- Words are separated by whitespace (spaces, tabs, etc.)
- An empty string contains zero words',
    'Practice using Python''s split() method to tokenize a string and work with the resulting list.',
    'count_words',
    'int',
    '{"text"}',
    '{"The split() method with no arguments splits on any whitespace and handles multiple spaces automatically.","Calling split() on an empty string returns an empty list, which has length 0.","After splitting, use the len() function to count the number of words in the resulting list."}',
    2,
    100,
    '{"python","strings","splitting","counting"}',
    true,
    'seed-py-arr-str-count-words',
    '## Count Words

A sentence is a string that contains words separated by whitespace. Counting words is a common text-processing task that teaches you how to split strings and work with the resulting lists.

### Expected function

```python
def count_words(s: str) -> int:
    # Your code here
    pass
```

### Examples

- `count_words("hello world")` returns `2`
- `count_words("Python is fun")` returns `3`
- `count_words("")` returns `0`

### Constraints

- Words are separated by whitespace
- Multiple consecutive spaces should be handled correctly
- An empty string contains zero words

### Reference solution

```python
def count_words(s):
    words = s.split()
    return len(words)
```

The `split()` method with no arguments breaks the string on any whitespace and handles multiple spaces, tabs, and leading or trailing whitespace automatically. The `len()` function returns the number of elements in the resulting list.',
    '{"python": {"func_name": "count_words", "return_type": "int", "param_types": ["str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-count-words'), '["hello world"]'::jsonb, '2', false, 1)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-count-words'), '["Python is fun"]'::jsonb, '3', false, 2)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-count-words'), '["one"]'::jsonb, '1', false, 3)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-count-words'), '[""]'::jsonb, '0', false, 4)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-count-words'), '["  hello   world  "]'::jsonb, '2', true, 5)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-count-words'), '["a b c d e"]'::jsonb, '5', true, 6)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ============================================================================
-- Problem 7: Remove Duplicates (difficulty 2, 100 XP)
-- ============================================================================
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'py-arr-str-remove-duplicates',
    'python-arrays-strings',
    'function',
    'python',
    'Remove Duplicates',
    'When working with lists, you will often encounter duplicate values that need to be removed. The goal is to produce a new list that contains each value only once, while preserving the order in which the values first appeared.

Removing duplicates requires you to keep track of which values have already been seen. As you iterate through the original list, you check each element against the collection of previously encountered values. If it has not been seen before, you add it to the result list and record it as seen.

This combination of iteration, membership testing, and conditional addition is a fundamental pattern that appears in data cleaning, duplicate detection, and maintaining unique collections across many programming domains.',
    '- The list may be empty
- Elements are integers between -10^6 and 10^6
- The original order of first occurrences must be preserved',
    'Learn to track seen values with a set while building a deduplicated list that preserves insertion order.',
    'remove_duplicates',
    'list',
    '{"int[]"}',
    '{"Use a set to track which values you have already seen — membership testing with a set is fast.","Build a new result list by appending elements that are not yet in the seen set, then add them to the set.","An empty list should return an empty list — no iterations means nothing to add."}',
    2,
    100,
    '{"python","arrays","sets","duplicates"}',
    true,
    'seed-py-arr-str-remove-duplicates',
    '## Remove Duplicates

When working with lists, you will often encounter duplicate values that need to be removed while preserving the original order.

### Expected function

```python
def remove_duplicates(arr: list) -> list:
    # Your code here
    pass
```

### Examples

- `remove_duplicates([1, 2, 2, 3, 3, 3])` returns `[1, 2, 3]`
- `remove_duplicates([1, 1, 1])` returns `[1]`
- `remove_duplicates([])` returns `[]`

### Constraints

- Elements are integers
- The original order of first occurrences must be preserved

### Reference solution

```python
def remove_duplicates(arr):
    seen = set()
    result = []
    for item in arr:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result
```

The solution uses a `set` to track seen values (sets provide O(1) membership testing) and a `list` to build the result in order. As each element is processed, it is checked against the set. First-time elements are added to both structures; duplicates are silently skipped.',
    '{"python": {"func_name": "remove_duplicates", "return_type": "list", "param_types": ["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-remove-duplicates'), '[[1, 2, 2, 3, 3, 3]]'::jsonb, '[1, 2, 3]', false, 1)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-remove-duplicates'), '[[1, 1, 1, 1]]'::jsonb, '[1]', false, 2)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-remove-duplicates'), '[[]]'::jsonb, '[]', false, 3)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-remove-duplicates'), '[[1, 2, 3]]'::jsonb, '[1, 2, 3]', false, 4)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-remove-duplicates'), '[[3, 1, 2, 1, 3, 2]]'::jsonb, '[3, 1, 2]', true, 5)
ON CONFLICT (problem_id, ordinal) DO NOTHING;
INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
((SELECT id FROM problems WHERE slug = 'py-arr-str-remove-duplicates'), '[[5]]'::jsonb, '[5]', true, 6)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

COMMIT;
