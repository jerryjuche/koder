-- ROLLBACK — Generated: 2026-07-27 06:22:30
-- Module: python-practice
-- Problems: 30

UPDATE problems SET
	statement = 'Write a function `average_calculator` that takes a list of numbers and returns its mathematical mean.

Your system must remain stable even when handed an empty dataset — a rogue empty list must never trigger a division-by-zero error.

**Examples:**
- `average_calculator([1, 2, 3, 4])` → `2.5`
- `average_calculator([-2, 2])` → `0.0`
- `average_calculator([])` → `0.0`',
	param_names = '{}'
WHERE slug = 'py-avg-calculator';
UPDATE problems SET
	statement = 'Write a function `trim_ends` that removes the very first and very last character from a string, revealing its inner content.

Think of it as peeling away the outermost shell of data to reach the core.

**Examples:**
- `trim_ends("hello")` → `"ell"`
- `trim_ends("ab")` → `""`
- `trim_ends("a")` → `""`',
	param_names = '{}'
WHERE slug = 'py-trim-ends';
UPDATE problems SET
	statement = 'Build a search module `contains_value` that inspects a heterogeneous list — one mixing integers, strings, booleans, and other types — to determine whether a target value exists within it.

The check must use value equality (==), not identity (is), but must respect Python''s natural type coercion rules.

**Examples:**
- `contains_value([1, "2", 3], 1)` → `True`
- `contains_value([1, "2", 3], "2")` → `True`
- `contains_value([1, "2", 3], 2)` → `False`',
	param_names = '{}'
WHERE slug = 'py-contains-value';
UPDATE problems SET
	statement = 'Process a sequence of integers with `positives_negatives_summary` and produce a two-part statistical report.

Your function must compute two distinct metrics in a single pass: the count of all numbers strictly greater than zero, and the sum of all numbers strictly less than zero.

Zero is neutral — it contributes to neither metric and must be silently ignored.

**Examples:**
- `positives_negatives_summary([1, 2, 3, 4, -5, -2])` → `[4, -7]`
- `positives_negatives_summary([0, 0, 0])` → `[0, 0]`
- `positives_negatives_summary([])` → `[]`',
	param_names = '{}'
WHERE slug = 'py-positives-negatives';
UPDATE problems SET
	statement = 'Data cleaning is an essential software skill. Write a function `sanitize_exclamations` that scans an incoming string and ruthlessly strips every single exclamation mark (`!`), returning a pristine, sanitized version of the text.

**Examples:**
- `sanitize_exclamations("Hello! World!")` → `"Hello World"`
- `sanitize_exclamations("!!!")` → `""`
- `sanitize_exclamations("No exclamations here")` → `"No exclamations here"`',
	param_names = '{}'
WHERE slug = 'py-sanitize-exclamations';
UPDATE problems SET
	statement = 'A logistics warehouse needs to automate packaging. Write a function `cuboid_volume` that accepts three dimensions of a rectangular box — length, width, and height — and calculates its total volumetric space.

**Examples:**
- `cuboid_volume(10, 5, 2)` → `100`
- `cuboid_volume(1, 1, 1)` → `1`
- `cuboid_volume(0, 5, 2)` → `0`',
	param_names = '{}'
WHERE slug = 'py-cuboid-volume';
UPDATE problems SET
	statement = 'Transform an integer by isolating each of its digits, squaring each one independently, and concatenating the resulting squares in their original order to form a new integer.

For example, 9119 becomes 9²=81, 1²=1, 1²=1, 9²=81 → concatenated as 811181.

**Examples:**
- `square_concat_digits(9119)` → `811181`
- `square_concat_digits(0)` → `0`
- `square_concat_digits(3)` → `9`',
	param_names = '{}'
WHERE slug = 'py-square-concat-digits';
UPDATE problems SET
	statement = 'You are given a raw text string of numbers separated by single spaces. Parse this string, identify the maximum and minimum values, and return them formatted as `"MAX MIN"`.

**Examples:**
- `min_max_range("1 9 3 4 -5")` → `"9 -5"`
- `min_max_range("42")` → `"42 42"`
- `min_max_range("-10 -20 -30")` → `"-10 -30"`',
	param_names = '{}'
WHERE slug = 'py-min-max-range';
UPDATE problems SET
	statement = 'Given the current age of a parent and the current age of a child, calculate how many years it will take (or has taken) for the parent to be exactly twice as old as the child.

The result must always be a non-negative integer, regardless of whether this moment is in the past or the future.

**Examples:**
- `years_to_double_age(30, 5)` → `20` (in 20 years, father is 50, son is 25)
- `years_to_double_age(40, 20)` → `0` (right now, father is exactly twice as old)
- `years_to_double_age(50, 30)` → `10` (10 years ago, father was 40, son was 20)',
	param_names = '{}'
WHERE slug = 'py-years-to-double';
UPDATE problems SET
	statement = 'Write a function `extract_positives` that processes a list of numbers and extracts only the positive elements. If the list contains exclusively non-positive numbers (negatives and zeros), return an empty list as a system flag.

**Examples:**
- `extract_positives([-1, 0, 3, 5, -2])` → `[3, 5]`
- `extract_positives([-1, -5, 0])` → `[]`
- `extract_positives([])` → `[]`',
	param_names = '{}'
WHERE slug = 'py-extract-positives';
UPDATE problems SET
	statement = 'Upgrade the basic string-trimming concept. Write `trim_variable_ends` that takes a string and an integer `n`, and removes `n` characters from the front and `n` characters from the back.

**Examples:**
- `trim_variable_ends("hello world", 3)` → `"lo wo"`
- `trim_variable_ends("hello world", 0)` → `"hello world"`
- `trim_variable_ends("abcd", 2)` → `""`',
	param_names = '{}'
WHERE slug = 'py-trim-variable-ends';
UPDATE problems SET
	statement = 'Standard inclusion checks can fail due to weak type matching. Create a strict search function `strict_deep_equals` that ensures both the value AND the data type match exactly.

The string `"5"` should NOT match the number `5`. The boolean `True` should NOT match the integer `1`.

**Examples:**
- `strict_deep_equals([1, "2", 3], 1)` → `True`
- `strict_deep_equals([1, "2", 3], "1")` → `False` (string "1" !== int 1)
- `strict_deep_equals([True, 0], 1)` → `False` (True is bool, 1 is int)',
	param_names = '{}'
WHERE slug = 'py-strict-deep-equals';
UPDATE problems SET
	statement = 'Imagine a financial tracking app. Positive integers are deposits, negative integers are withdrawals. Write `account_ledger` that analyzes transaction history and returns a dictionary with the net balance and an account status.

**Examples:**
- `account_ledger([100, -50, 200, -30])` → `{"net_balance": 220, "status": "PROFIT"}`
- `account_ledger([-100, -50])` → `{"net_balance": -150, "status": "DEBT"}`
- `account_ledger([10, -10, 0])` → `{"net_balance": 0, "status": "BALANCED"}`',
	param_names = '{}'
WHERE slug = 'py-account-ledger';
UPDATE problems SET
	statement = 'Expand the sanitization engine. Instead of hardcoding a specific character, create a dynamic cleaning function `erase_target_char` that takes a text string and a target character to eliminate globally.

**Examples:**
- `erase_target_char("Hello, World!", ",")` → `"Hello World!"`
- `erase_target_char("banana", "a")` → `"bnn"`
- `erase_target_char("Mississippi", "s")` → `"Miiippi"`',
	param_names = '{}'
WHERE slug = 'py-erase-target-char';
UPDATE problems SET
	statement = 'Advance the volume calculator into a physics utility. Write `calculate_density` that uses three dimensions (length, width, height) and a mass value to compute the material''s density.

Density = Mass / Volume, where Volume = length × width × height.

Return the density rounded to exactly two decimal places.

**Examples:**
- `calculate_density(10, 5, 2, 100)` → `1.0`
- `calculate_density(1, 1, 1, 10)` → `10.0`
- `calculate_density(3, 3, 3, 27)` → `1.0`',
	param_names = '{}'
WHERE slug = 'py-calculate-density';
UPDATE problems SET
	statement = 'Receive an integer, separate it into its individual digits, square each digit, and concatenate the squared values in REVERSE order.

For 34: digits are 3 and 4. Squares are 9 and 16. Reversed concatenation: 169.

**Examples:**
- `reverse_square_concat(34)` → `169`
- `reverse_square_concat(0)` → `0`
- `reverse_square_concat(10)` → `1`',
	param_names = '{}'
WHERE slug = 'py-reverse-square-concat';
UPDATE problems SET
	statement = 'Given a space-separated string of integers, identify the maximum and minimum values, remove them completely, and return a new string of the remaining numbers.

If fewer than 3 numbers are provided, return an empty string — there are not enough elements to sacrifice the extremes.

**Examples:**
- `remove_extremes("3 1 4 1 5 9")` → `"3 4 1 5"`
- `remove_extremes("1 2")` → `""`
- `remove_extremes("5 5 5 5")` → `"5 5"`',
	param_names = '{}'
WHERE slug = 'py-remove-extremes';
UPDATE problems SET
	statement = 'Given a list of family member ages and the current calendar year, determine the exact future year when the oldest member will be exactly twice as old as the youngest member.

**Examples:**
- `century_milestone([30, 5], 2026)` → `2046` (oldest 30→50, youngest 5→25 in 20 years)
- `century_milestone([40, 20], 2026)` → `2026` (already exactly double)
- `century_milestone([10, 5, 15], 2026)` → `2036` (oldest 15→25, youngest 5→15)',
	param_names = '{}'
WHERE slug = 'py-century-milestone';
UPDATE problems SET
	statement = 'Calculate a robust average by stripping away the single highest and single lowest values before computing the mean. This outlier-resistant technique is used in scientific data analysis.

If removing the extremes leaves 2 or fewer elements (or the array was empty), return 0 — there is not enough data for a meaningful average.

**Examples:**
- `trimmed_average([1, 2, 3, 4, 100])` → `3.0` (removes 1 and 100, averages [2,3,4])
- `trimmed_average([5, 5, 5])` → `5.0` (removes 5 and 5, averages [5])
- `trimmed_average([1, 2])` → `0.0` (only 2 elements after trimming → 0)',
	param_names = '{}'
WHERE slug = 'py-trimmed-average';
UPDATE problems SET
	statement = 'Create an advanced string parser. Given a primary string and a target substring, locate the first occurrence of that substring, then remove the characters immediately preceding and following it.

If the target is not found, return the original string unchanged.

**Examples:**
- `remove_around_substring("abcdefg", "cd")` → `"abfg"` (removes "cde" — "c" before, "cd" target, "e" after)
- `remove_around_substring("hello world", "lo wo")` → `"held"` (removes "lo wo" and its neighbors)
- `remove_around_substring("abcdefg", "xyz")` → `"abcdefg"` (not found)',
	param_names = '{}'
WHERE slug = 'py-remove-around-substring';
UPDATE problems SET
	statement = 'Upgrade the containment check to handle nested data. Write `find_in_nested` that searches a 2D matrix (list of lists) for a target value and returns its `[row, column]` coordinates.

If the target does not exist, return `[-1, -1]`.

**Examples:**
- `find_in_nested([[1, 2], [3, 4]], 3)` → `[1, 0]`
- `find_in_nested([[1, 2], [3, 4]], 5)` → `[-1, -1]`
- `find_in_nested([[5]], 5)` → `[0, 0]`',
	param_names = '{}'
WHERE slug = 'py-find-in-nested';
UPDATE problems SET
	statement = 'Partition an array of integers into consecutive chunks of size `k`. For each chunk, calculate: the count of positive numbers and the sum of negative numbers. Return these summaries as a list of `[pos_count, neg_sum]` pairs.

The final chunk may be smaller than `k` if the array length is not evenly divisible.

**Examples:**
- `chunked_parity_summary([1, -2, 3, -4, 5, -6], 2)` → `[[1, -2], [1, -4], [1, -6]]`
- `chunked_parity_summary([1, -1, 2, -2, 3], 3)` → `[[1, -1], [1, -2]]`',
	param_names = '{}'
WHERE slug = 'py-chunked-parity';
UPDATE problems SET
	statement = 'Write a clean-up function that scans text for consecutive repeated `!` or `?` marks and collapses each run into a single instance.

This normalizes messy user inputs like "Hello!!! What???" into clean "Hello! What?" without affecting other repeated characters.

**Examples:**
- `condense_punctuation("Hello!!! What???")` → `"Hello! What?"`
- `condense_punctuation("No change")` → `"No change"`
- `condense_punctuation("!!!???!!!")` → `"!?"`',
	param_names = '{}'
WHERE slug = 'py-condense-punctuation';
UPDATE problems SET
	statement = 'A logistics company needs to maximize container utilization. Given container dimensions `[L, W, H]` and product box dimensions `[l, w, h]`, calculate the maximum number of boxes that can fit inside the container — assuming all boxes are packed in the same orientation.

**Examples:**
- `max_boxes_in_container([10, 10, 10], [2, 2, 2])` → `125` (5×5×5 = 125 boxes)
- `max_boxes_in_container([10, 10, 10], [3, 3, 3])` → `27` (3×3×3 = 27 boxes)
- `max_boxes_in_container([5, 5, 5], [6, 1, 1])` → `0`',
	param_names = '{}'
WHERE slug = 'py-max-boxes-in-container';
UPDATE problems SET
	statement = 'Given a large integer, isolate its digits, find the highest and lowest digit values. Square these two extreme digits, concatenate the squared results, and convert back to an integer.

For 2817: digits are 2, 8, 1, 7. Highest is 8 → 64. Lowest is 1 → 1. Concatenated: 641.

**Examples:**
- `high_low_square_map(2817)` → `641`
- `high_low_square_map(5)` → `2525` (highest=5, lowest=5 → 25 concatenated with 25 = 2525)
- `high_low_square_map(100)` → `10`',
	param_names = '{}'
WHERE slug = 'py-high-low-square-map';
UPDATE problems SET
	statement = 'A palindrome reads the same forwards and backwards. Write `is_palindrome` that checks whether a given string is a palindrome, ignoring case and non-alphanumeric characters.

**Examples:**
- `is_palindrome("A man, a plan, a canal: Panama")` → `True`
- `is_palindrome("race a car")` → `False`
- `is_palindrome("")` → `True` (empty string is trivially a palindrome)',
	param_names = '{}'
WHERE slug = 'py-is-palindrome';
UPDATE problems SET
	statement = 'Write a function `count_vowels` that returns the total number of vowels (a, e, i, o, u) in a given string. The count must be case-insensitive.

**Examples:**
- `count_vowels("Hello World")` → `3`
- `count_vowels("PYTHON")` → `1`
- `count_vowels("Rhythm")` → `0`',
	param_names = '{}'
WHERE slug = 'py-count-vowels';
UPDATE problems SET
	statement = 'Given two lists of integers, write `array_intersection` that returns a sorted list of elements common to both lists — with no duplicates.

**Examples:**
- `array_intersection([1, 2, 3, 4], [3, 4, 5, 6])` → `[3, 4]`
- `array_intersection([1, 2, 3], [4, 5, 6])` → `[]`
- `array_intersection([1, 1, 2, 2], [1, 2])` → `[1, 2]`',
	param_names = '{}'
WHERE slug = 'py-array-intersection';
UPDATE problems SET
	statement = 'Generate the FizzBuzz sequence up to `n`. For each number from 1 to n:
- If divisible by 3 and 5: `"FizzBuzz"`
- If divisible by 3 only: `"Fizz"`
- If divisible by 5 only: `"Buzz"`
- Otherwise: the number as a string

Return the results as a list of strings.

**Examples:**
- `fizzbuzz_sequence(5)` → `["1", "2", "Fizz", "4", "Buzz"]`
- `fizzbuzz_sequence(15)` → `["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]`
- `fizzbuzz_sequence(0)` → `[]`',
	param_names = '{}'
WHERE slug = 'py-fizzbuzz-sequence';
UPDATE problems SET
	statement = 'Two strings are anagrams if they contain the same characters in the same frequency. Write `anagram_checker` that determines whether two strings are anagrams, ignoring case and non-alphanumeric characters.

**Examples:**
- `anagram_checker("listen", "silent")` → `True`
- `anagram_checker("Hello", "Ole! h!")` → `True`
- `anagram_checker("hello", "world")` → `False`',
	param_names = '{}'
WHERE slug = 'py-anagram-checker';
