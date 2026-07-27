-- Generated: 2026-07-27 06:22:30
-- Module: python-practice
-- Problems: 30

UPDATE problems SET
	statement = 'Calculating an **average** is one of the most common operations performed on numerical data. By summing a collection of values and dividing by the count, you can determine a single value that represents the overall result.

In this challenge, your task is to write a function that computes the **arithmetic mean** of a list of numbers. If the list is empty, your function must handle this edge case gracefully by returning `0.0` instead of triggering a division-by-zero error.

For example:

- Calling `average_calculator([1, 2, 3, 4])` returns **`2.5`**, since `(1 + 2 + 3 + 4) / 4 = 2.5`.
- Calling `average_calculator([-2, 2])` returns **`0.0`**, as the positive and negative values cancel each other out.
- Calling `average_calculator([])` returns **`0.0`**, handling the empty input safely.

Your function should return the mathematical mean as a floating-point number.

This exercise reinforces several important programming concepts:

- Working with **lists** of numeric values.
- Calculating the **sum** and **average** of a collection.
- Handling **edge cases**, such as an empty list.
- Using **conditional guards** to prevent runtime errors.

Computing averages is a fundamental programming technique used in statistics, analytics, reporting, gaming, and many other real-world applications.',
	param_names = '{numbers}'
WHERE slug = 'py-avg-calculator';
UPDATE problems SET
	statement = 'Python''s **string slicing** syntax is one of the language''s most elegant features, allowing you to extract substrings, skip characters, and even reverse text with minimal code.

In this challenge, your task is to use string slicing to remove the very first and very last character from a given string, effectively revealing its inner content while discarding the boundaries.

For example:

- Calling `trim_ends("hello")` returns **`"ell"`**, removing the `h` from the front and the `o` from the back.
- Calling `trim_ends("ab")` returns **`""`**, an empty string with only two characters to remove.
- Calling `trim_ends("a")` returns **`""`**, since a single-character string has no inner content.

Your function should return the trimmed substring, or an empty string if the input has fewer than two characters.

This exercise reinforces several important programming concepts:

- Using Python''s **slice notation** with negative indices.
- Understanding how slicing behaves at **boundaries**.
- Handling **undersized inputs** gracefully.
- Writing concise, expressive string manipulation code.

String slicing is heavily used in data cleaning, text processing, log parsing, and any application that needs to extract or modify portions of text.',
	param_names = '{text}'
WHERE slug = 'py-trim-ends';
UPDATE problems SET
	statement = 'Python''s **`in`** operator provides a clean, readable way to check whether a value exists within a collection. Understanding how membership testing works across different data types is essential for writing correct search logic.

In this challenge, your task is to implement a search function that checks whether a target value exists within a **heterogeneous list** — one that may contain integers, strings, booleans, and other types mixed together. The check should use Python''s standard value equality (`==`) semantics.

For example:

- Calling `contains_value([1, "2", 3], 1)` returns **`True`**, since the integer `1` is present as an element.
- Calling `contains_value([1, "2", 3], "2")` returns **`True`**, matching the string `"2"` value.
- Calling `contains_value([1, "2", 3], 2)` returns **`False`**, because neither the integer `2` nor the value `2` appears in the list.

Your function should return `True` if the target exists in the list, and `False` otherwise.

This exercise reinforces several important programming concepts:

- Using Python''s **`in`** operator for membership testing.
- Understanding **value equality** vs identity in Python.
- Working with **heterogeneous** data collections.
- Searching through lists efficiently.

Membership testing is one of the most frequently used operations in programming, appearing everywhere from input validation to data filtering and search algorithms.',
	param_names = '{items,target}'
WHERE slug = 'py-contains-value';
UPDATE problems SET
	statement = 'When analyzing numerical data, it is often useful to compute **multiple statistics** in a single pass through the data rather than making several separate passes. This is both more efficient and a cleaner way to organize your logic.

In this challenge, your task is to write a function that processes a list of integers and produces a two-part statistical summary. In a single pass, compute the **count of numbers strictly greater than zero** and the **sum of numbers strictly less than zero**. The value zero is neutral and contributes to neither metric.

For example:

- Calling `positives_negatives_summary([1, 2, 3, 4, -5, -2])` returns **`[4, -7]`**: four positive numbers and a negative sum of `-7`.
- Calling `positives_negatives_summary([0, 0, 0])` returns **`[0, 0]`**, since no values are positive or negative.
- Calling `positives_negatives_summary([])` returns **`[]`**, an empty list for empty input.

Your function should return a list containing `[positive_count, negative_sum]`, or an empty list if the input is empty.

This exercise reinforces several important programming concepts:

- Performing **single-pass** data analysis.
- Using **conditional branching** to categorize values.
- Handling **neutral values** that should be ignored.
- Distinguishing between empty and zero-valued results.

Single-pass aggregation is widely used in data processing, real-time analytics, and performance-sensitive applications.',
	param_names = '{numbers}'
WHERE slug = 'py-positives-negatives';
UPDATE problems SET
	statement = 'Data cleaning is an essential skill in software development. Raw user input often contains unwanted characters that must be stripped before the data can be processed or stored reliably.

In this challenge, your task is to implement a character-level filter that scans an incoming string and removes every exclamation mark (`!`), returning a pristine, sanitized version of the original text. All other characters — letters, digits, spaces, punctuation — must remain untouched.

For example:

- Calling `sanitize_exclamations("Hello! World!")` returns **`"Hello World"`**, with both exclamation marks removed.
- Calling `sanitize_exclamations("!!!")` returns **`""`**, an empty string with only exclamation marks to remove.
- Calling `sanitize_exclamations("No exclamations here")` returns **`"No exclamations here"`**, unchanged since there are no exclamation marks.

Your function should return the sanitized string with all exclamation marks removed.

This exercise reinforces several important programming concepts:

- Using **`str.replace()`** for character-level substitution.
- Building **string filters** with comprehensions.
- Handling **edge cases** like empty input or all-target strings.
- Writing clean, readable data cleaning utilities.

String sanitization is used everywhere from form validation and chat applications to log processing and database input cleaning.',
	param_names = '{text}'
WHERE slug = 'py-sanitize-exclamations';
UPDATE problems SET
	statement = 'Geometric formulas are a great way to practice applying mathematical equations in code. The volume of a rectangular box (cuboid) is one of the simplest and most intuitive geometric calculations.

In this challenge, your task is to write a function that calculates the **volume** of a rectangular box given its three dimensions: length, width, and height. The formula is straightforward: Volume = length × width × height.

For example:

- Calling `cuboid_volume(10, 5, 2)` returns **`100`**, since `10 × 5 × 2 = 100`.
- Calling `cuboid_volume(1, 1, 1)` returns **`1`**, a unit cube with volume 1.
- Calling `cuboid_volume(0, 5, 2)` returns **`0`**, because a zero dimension produces zero volume.

Your function should return the computed volume, preserving the numeric type of the inputs.

This exercise reinforces several important programming concepts:

- Applying a **geometric formula** in code.
- Working with **multiple numeric parameters**.
- Understanding **type preservation** in arithmetic operations.
- Handling **zero values** correctly in calculations.

Volume calculations are used in shipping logistics, packaging design, construction, fluid dynamics, and many engineering applications.',
	param_names = '{length,width,height}'
WHERE slug = 'py-cuboid-volume';
UPDATE problems SET
	statement = 'Digit manipulation is a classic programming exercise that combines **string conversion**, **iteration**, and **mathematical operations** into a single, satisfying pipeline.

In this challenge, your task is to transform an integer by isolating each of its digits, squaring each digit independently, and concatenating the resulting squared values in their original order to form a new integer.

For example:

- Calling `square_concat_digits(9119)` returns **`811181`**: digits are `9, 1, 1, 9`, squares are `81, 1, 1, 81`, concatenated as `811181`.
- Calling `square_concat_digits(0)` returns **`0`**, the square of zero.
- Calling `square_concat_digits(3)` returns **`9`**, the square of the single digit `3`.

Your function should return the concatenated squared result as an integer.

This exercise reinforces several important programming concepts:

- Converting between **integers and strings**.
- **Iterating** over the digits of a number.
- Performing per-element **mathematical transformations**.
- **Concatenating** string representations of numbers.

Digit-based transformations appear in checksum algorithms, data encoding, number theory problems, and various coding challenges.',
	param_names = '{n}'
WHERE slug = 'py-square-concat-digits';
UPDATE problems SET
	statement = 'Parsing structured text into usable data is a fundamental programming skill. Raw strings often encode information that must be extracted, converted, and analyzed before it becomes useful.

In this challenge, your task is to parse a space-separated string of integers, identify the **maximum** and **minimum** values, and return them formatted as a string in `"MAX MIN"` order.

For example:

- Calling `min_max_range("1 9 3 4 -5")` returns **`"9 -5"`**: the maximum is `9` and the minimum is `-5`.
- Calling `min_max_range("42")` returns **`"42 42"`**, since a single value is both the maximum and minimum.
- Calling `min_max_range("-10 -20 -30")` returns **`"-10 -30"`**: max is `-10`, min is `-30`.

Your function should return the formatted string with the maximum and minimum separated by a single space.

This exercise reinforces several important programming concepts:

- **Splitting** strings into component parts.
- **Converting** string representations to numeric types.
- Using built-in **`max()`** and **`min()`** functions.
- **Formatting** results back into strings.

Text parsing and numeric extraction are essential skills used in log analysis, configuration files, data import, and many other real-world scenarios.',
	param_names = '{numbers_str}'
WHERE slug = 'py-min-max-range';
UPDATE problems SET
	statement = 'Algebraic relationships appear frequently in programming problems. Modeling a real-world relationship — such as age difference over time — with a simple equation is a great way to practice translating word problems into code.

In this challenge, your task is to calculate how many years it will take (or has taken) for a parent to be **exactly twice as old** as their child, given their current ages. The result should always be a non-negative integer, regardless of whether this moment lies in the past or the future.

For example:

- Calling `years_to_double_age(30, 5)` returns **`20`**: in 20 years, the parent will be 50 and the child will be 25.
- Calling `years_to_double_age(40, 20)` returns **`0`**: the parent is already exactly twice as old as the child.
- Calling `years_to_double_age(50, 30)` returns **`10`**: 10 years ago, the parent was 40 and the child was 20.

Your function should return the non-negative number of years until (or since) the parent is exactly twice the child''s age.

This exercise reinforces several important programming concepts:

- Translating a **word problem** into a mathematical equation.
- Using **algebra** to model linear relationships.
- Computing **absolute values** to guarantee non-negative results.
- Understanding that time differences can be bidirectional.

Age relationship problems are a classic introduction to algorithmic thinking and are commonly used in coding interviews and math competitions.',
	param_names = '{parent_age,child_age}'
WHERE slug = 'py-years-to-double';
UPDATE problems SET
	statement = 'Filtering data based on conditions is one of the most common operations in programming. Whether you are selecting valid records, removing outliers, or isolating specific categories, conditional filtering is a skill you will use constantly.

In this challenge, your task is to write a function that extracts only the **positive** elements from a list of numbers. If the list contains exclusively non-positive values (negatives and zeros), or is empty, your function should return an empty list.

For example:

- Calling `extract_positives([-1, 0, 3, 5, -2])` returns **`[3, 5]`**, keeping only the positive values.
- Calling `extract_positives([-1, -5, 0])` returns **`[]`**, since no values are positive.
- Calling `extract_positives([])` returns **`[]`**, an empty list from empty input.

Your function should return a new list containing only the positive elements, preserving their original order.

This exercise reinforces several important programming concepts:

- Using **list comprehensions** for filtering.
- Applying **conditional guards** to select elements.
- Understanding that **zero is not positive**.
- Returning a **new list** without mutating the original.

Data filtering is essential in data analysis, search systems, report generation, and any application that processes collections of records.',
	param_names = '{numbers}'
WHERE slug = 'py-extract-positives';
UPDATE problems SET
	statement = 'Generalizing a simple operation to accept **parameters** is a key step in building reusable, flexible functions. A fixed trim becomes far more useful when the number of characters to remove is configurable.

In this challenge, your task is to upgrade the basic string-trimming concept. Write a function that takes a string and an integer `n`, and removes `n` characters from both the front and the back of the string. If `2 × n` equals or exceeds the string length, return an empty string.

For example:

- Calling `trim_variable_ends("hello world", 3)` returns **`"lo wo"`**, removing three characters from each end.
- Calling `trim_variable_ends("hello world", 0)` returns **`"hello world"`** unchanged.
- Calling `trim_variable_ends("abcd", 2)` returns **`""`**, since removing two from each end consumes the entire string.

Your function should return the trimmed string, or an empty string if the trim amount is too large.

This exercise reinforces several important programming concepts:

- **Generalizing** functions with configurable parameters.
- Using **string slicing** with variable indices.
- Handling **boundary conditions** where the trim exceeds the string length.
- Understanding the relationship between string length and safe slicing ranges.

Configurable string operations are used in text formatting, data truncation, log processing, and user interface design.',
	param_names = '{text,n}'
WHERE slug = 'py-trim-variable-ends';
UPDATE problems SET
	statement = 'Python''s dynamic typing system is powerful, but it can lead to surprising behavior when comparing values of different types. Understanding the difference between **value equality** and **type identity** is crucial for writing robust search logic.

In this challenge, your task is to implement a strict search function that checks whether a target value exists in a list using both **value equality** AND **type matching**. The string `"5"` should NOT match the number `5`, and the boolean `True` should NOT match the integer `1`.

For example:

- Calling `strict_deep_equals([1, "2", 3], 1)` returns **`True`**: the integer `1` matches in both value and type.
- Calling `strict_deep_equals([1, "2", 3], "1")` returns **`False`**: the string `"1"` does not match the integer `1`.
- Calling `strict_deep_equals([True, 0], 1)` returns **`False`**: `True` is a bool, not an int, even though `True == 1` in Python.

Your function should return `True` only if the target value is found with an exact type match.

This exercise reinforces several important programming concepts:

- Understanding **type identity** with `type()` versus value equality with `==`.
- Recognizing Python''s **bool-to-int** coercion behavior.
- Implementing **type-aware search** logic.
- Distinguishing between related but distinct data types.

Type-aware comparison is important in data validation, strict search systems, configuration checking, and any context where type safety matters.',
	param_names = '{items,target}'
WHERE slug = 'py-strict-deep-equals';
UPDATE problems SET
	statement = 'Financial calculations are a practical and rewarding domain for practicing **aggregation** and **conditional classification**. Tracking income and expenses is a core feature of countless applications.

In this challenge, your task is to write a function that analyzes a list of financial transactions — where positive integers represent **deposits** and negative integers represent **withdrawals** — and returns a dictionary with the net balance and an account status.

For example:

- Calling `account_ledger([100, -50, 200, -30])` returns **`{"net_balance": 220, "status": "PROFIT"}`**: net balance is 220, which is positive.
- Calling `account_ledger([-100, -50])` returns **`{"net_balance": -150, "status": "DEBT"}`**: net balance is -150, which is negative.
- Calling `account_ledger([10, -10, 0])` returns **`{"net_balance": 0, "status": "BALANCED"}`**: net balance is exactly zero.

Your function should return a dictionary with keys `"net_balance"` (int) and `"status"` (one of `"PROFIT"`, `"DEBT"`, or `"BALANCED"`).

This exercise reinforces several important programming concepts:

- **Summing** values across a collection.
- Using **conditional logic** to classify outcomes.
- Building and returning **structured dictionaries**.
- Applying **real-world business rules** to data.

Financial aggregation is used in banking apps, budgeting tools, accounting software, and any system that tracks monetary flows.',
	param_names = '{transactions}'
WHERE slug = 'py-account-ledger';
UPDATE problems SET
	statement = 'Building **reusable** and **configurable** utilities is a hallmark of good software design. A function that removes a hardcoded character becomes far more useful when the target character can be specified dynamically.

In this challenge, your task is to create a dynamic cleaning function that takes a text string and a **target character**, and removes every occurrence of that character from the text. If the target is an empty string, return the original text unchanged.

For example:

- Calling `erase_target_char("Hello, World!", ",")` returns **`"Hello World!"`**, removing the comma.
- Calling `erase_target_char("banana", "a")` returns **`"bnn"`**, stripping every `a` from the word.
- Calling `erase_target_char("Mississippi", "s")` returns **`"Miiippi"`**, removing all `s` characters.

Your function should return the sanitized string with all occurrences of the target character removed.

This exercise reinforces several important programming concepts:

- Using **`str.replace()`** for global character removal.
- Handling **edge cases** such as an empty target string.
- Making functions **configurable** through parameters.
- Understanding **string immutability** and the need to return new strings.

Dynamic character removal is used in text sanitization, input cleaning, data preprocessing, and formatting pipelines.',
	param_names = '{text,target}'
WHERE slug = 'py-erase-target-char';
UPDATE problems SET
	statement = 'Combining **geometry** and **physics** formulas in code is a great way to practice multi-step mathematical functions. Density is a fundamental physical property that relates mass and volume.

In this challenge, your task is to write a function that calculates the **density** of a material given its three dimensions (length, width, height) and its mass. The formula is: Density = Mass / Volume, where Volume = length × width × height. The result should be rounded to exactly two decimal places.

For example:

- Calling `calculate_density(10, 5, 2, 100)` returns **`1.0`**: volume is `100`, density is `100 / 100 = 1.0`.
- Calling `calculate_density(1, 1, 1, 10)` returns **`10.0`**: volume is `1`, density is `10 / 1 = 10.0`.
- Calling `calculate_density(3, 3, 3, 27)` returns **`1.0`**: volume is `27`, density is `27 / 27 = 1.0`.

Your function should return the density rounded to two decimal places.

This exercise reinforces several important programming concepts:

- Applying **multi-step mathematical formulas**.
- Computing **volume** from three dimensions.
- Using **`round()`** for output formatting.
- Working with **multiple parameters** of the same type.

Density calculations are used in materials science, engineering, quality control, and logistics for determining material properties and shipping weights.',
	param_names = '{length,width,height,mass}'
WHERE slug = 'py-calculate-density';
UPDATE problems SET
	statement = 'Combining **iteration**, **transformation**, and **reversal** into a single pipeline is a fun way to practice multi-step data processing. Small variations on a theme can produce entirely different results.

In this challenge, your task is to build on the digit-squaring concept but with a twist: after squaring each digit of an integer, concatenate the squared values in **reverse order** before converting back to an integer.

For example:

- Calling `reverse_square_concat(34)` returns **`169`**: digits are `3` and `4`, squares are `9` and `16`, reversed concatenation is `169`.
- Calling `reverse_square_concat(0)` returns **`0`**, the square of zero.
- Calling `reverse_square_concat(10)` returns **`1`**: digits are `1` and `0`, squares are `1` and `0`, reversed is `01` → `1`.

Your function should return the concatenated result as an integer.

This exercise reinforces several important programming concepts:

- **Reversing** sequences in Python.
- Building **processing pipelines** with multiple steps.
- Converting between **numeric and string representations**.
- Understanding how **leading zeros** behave in integer conversion.

Multi-step digit transformations are used in checksum algorithms, data encoding schemes, and various mathematical puzzles.',
	param_names = '{n}'
WHERE slug = 'py-reverse-square-concat';
UPDATE problems SET
	statement = 'Outlier removal is a common technique in **statistical analysis** and **data cleaning**. By stripping away extreme values, you can analyze the central tendency of a dataset without being skewed by anomalies.

In this challenge, your task is to parse a space-separated string of integers, identify the maximum and minimum values, remove **all occurrences** of both extremes, and return the remaining numbers as a new space-separated string. If fewer than three numbers are provided, return an empty string.

For example:

- Calling `remove_extremes("3 1 4 1 5 9")` returns **`"3 4 1 5"`**: removes the max `9` and the min `1` (both occurrences).
- Calling `remove_extremes("1 2")` returns **`""`**, since fewer than three numbers cannot spare the extremes.
- Calling `remove_extremes("5 5 5 5")` returns **`"5 5"`**: after removing all `5`s (both max and min), only the middle values remain.

Your function should return the filtered string with extremes removed, or an empty string if input has fewer than three numbers.

This exercise reinforces several important programming concepts:

- **Parsing** structured text into numeric data.
- Computing **extrema** with `max()` and `min()`.
- **Filtering** out all occurrences of specific values.
- Handling **insufficient data** edge cases.

Extreme value removal is used in scientific data analysis, survey processing, financial modeling, and quality control applications.',
	param_names = '{numbers_str}'
WHERE slug = 'py-remove-extremes';
UPDATE problems SET
	statement = 'Working with **multiple data points** and projecting relationships into **future time** combines several important programming skills: finding extremes, applying formulas, and computing calendar years.

In this challenge, your task is to extend the age-ratio concept to multi-person datasets. Given a list of family member ages and the current calendar year, determine the exact future year when the **oldest** member will be exactly twice as old as the **youngest** member.

For example:

- Calling `century_milestone([30, 5], 2026)` returns **`2046`**: oldest (30→50) will be twice youngest (5→25) in 20 years.
- Calling `century_milestone([40, 20], 2026)` returns **`2026`**: the ages are already in the exact double relationship.
- Calling `century_milestone([10, 5, 15], 2026)` returns **`2036`**: oldest (15→25) and youngest (5→15) reach the milestone in 10 years.

Your function should return the calendar year as an integer.

This exercise reinforces several important programming concepts:

- Finding **extrema** across a collection with `max()` and `min()`.
- Applying **algebraic formulas** to time-based problems.
- Computing **future dates** from mathematical relationships.
- Handling **already-met** conditions correctly.

Time-projection problems appear in financial planning, demographic analysis, project scheduling, and retirement calculators.',
	param_names = '{ages,current_year}'
WHERE slug = 'py-century-milestone';
UPDATE problems SET
	statement = '**Robust statistics** are designed to resist the influence of outliers. The trimmed mean — which discards the highest and lowest values before averaging — is a classic example of a statistical estimator that reduces sensitivity to extreme data points.

In this challenge, your task is to implement a trimmed mean calculation: remove a single occurrence of the **maximum** value and a single occurrence of the **minimum** value from a list, then compute the average of the remaining elements. If the resulting list has two or fewer elements, return `0.0`.

For example:

- Calling `trimmed_average([1, 2, 3, 4, 100])` returns **`3.0`**: removes `1` and `100`, averages `[2, 3, 4]`.
- Calling `trimmed_average([5, 5, 5])` returns **`5.0`**: removes one `5` (max) and one `5` (min), averages `[5]`.
- Calling `trimmed_average([1, 2])` returns **`0.0`**: after removing extremes, too few elements remain.

Your function should return the trimmed mean as a floating-point number, or `0.0` for insufficient data.

This exercise reinforces several important programming concepts:

- Using **`.remove()`** to delete specific elements from a list.
- Computing **averages** after filtering.
- Handling **small dataset** edge cases.
- Implementing **robust statistical** estimators.

Trimmed means are widely used in scientific research, economic indicators, performance benchmarking, and any analysis where outliers can distort results.',
	param_names = '{numbers}'
WHERE slug = 'py-trimmed-average';
UPDATE problems SET
	statement = 'Advanced string manipulation often requires **precise index arithmetic** to locate and extract or remove specific portions of text. Combining search with slicing is a powerful technique for text processing.

In this challenge, your task is to create a function that locates the **first occurrence** of a target substring within a source string, then removes the characters immediately preceding and following it — along with the target itself. If the target is not found, return the original string unchanged.

For example:

- Calling `remove_around_substring("abcdefg", "cd")` returns **`"abfg"`**: removes `c` (before), `cd` (target), and `e` (after).
- Calling `remove_around_substring("hello world", "lo wo")` returns **`"held"`**: removes the target and its neighboring characters.
- Calling `remove_around_substring("abcdefg", "xyz")` returns **`"abcdefg"`**: unchanged because the target was not found.

Your function should return the modified string after removing the target and its neighbors.

This exercise reinforces several important programming concepts:

- Using **`.find()`** to locate substrings.
- Performing **index-based slicing** with boundary awareness.
- Handling edge cases where the target is at the **start or end** of the string.
- Combining **search and replace** logic.

Precision string manipulation is used in text editors, parsers, search-and-replace tools, and data extraction systems.',
	param_names = '{source,target}'
WHERE slug = 'py-remove-around-substring';
UPDATE problems SET
	statement = '**Nested data structures** are common in real-world programming. A matrix (list of lists) can represent grids, tables, images, or any two-dimensional dataset. Searching such structures requires navigating multiple levels of indexing.

In this challenge, your task is to search a 2D matrix — a list of lists — for a target value and return its coordinates as `[row, column]`. If the target does not exist anywhere in the matrix, return `[-1, -1]`.

For example:

- Calling `find_in_nested([[1, 2], [3, 4]], 3)` returns **`[1, 0]`**: row `1`, column `0`.
- Calling `find_in_nested([[1, 2], [3, 4]], 5)` returns **`[-1, -1]`**: the target is not present.
- Calling `find_in_nested([[5]], 5)` returns **`[0, 0]`**: the only element in the matrix.

Your function should return a list containing the row and column indices of the first occurrence, or `[-1, -1]` if not found.

This exercise reinforces several important programming concepts:

- Using **nested loops** to traverse 2D structures.
- Tracking **positional indices** during iteration.
- Returning **coordinates** rather than the value itself.
- Handling **empty or absent** search results.

2D searching is used in game development (grid-based games), image processing (pixel coordinates), data analysis (spreadsheets), and robotics (grid navigation).',
	param_names = '{matrix,target}'
WHERE slug = 'py-find-in-nested';
UPDATE problems SET
	statement = '**Chunking** data into fixed-size segments and analyzing each segment independently is a common pattern in data processing. It combines list slicing, iteration with steps, and per-segment aggregation.

In this challenge, your task is to partition an array of integers into consecutive chunks of size `k`. For each chunk, calculate two metrics: the **count of positive numbers** and the **sum of negative numbers**. Return these as a list of `[pos_count, neg_sum]` pairs. The final chunk may be smaller than `k` if the array length is not evenly divisible.

For example:

- Calling `chunked_parity_summary([1, -2, 3, -4, 5, -6], 2)` returns **`[[1, -2], [1, -4], [1, -6]]`**: three chunks of size 2.
- Calling `chunked_parity_summary([1, -1, 2, -2, 3], 3)` returns **`[[1, -1], [1, -2]]`**: two chunks, the last being smaller.

Your function should return a list of `[pos_count, neg_sum]` pairs for each chunk.

This exercise reinforces several important programming concepts:

- **Slicing** lists into fixed-size chunks.
- Iterating with a **step value** using `range()`.
- Computing **per-chunk statistics**.
- Handling **partial final chunks** correctly.

Chunked data processing is used in batch processing, pagination, signal processing, data streaming, and distributed computing.',
	param_names = '{numbers,k}'
WHERE slug = 'py-chunked-parity';
UPDATE problems SET
	statement = '**Regular expressions** provide a powerful way to search for and manipulate text patterns. While simple string methods handle many cases, regex becomes essential for pattern-based transformations like collapsing repeated characters.

In this challenge, your task is to write a function that scans text for consecutive repeated exclamation marks (`!`) or question marks (`?`) and collapses each run into a single instance. Other repeated characters — like letters or digits — must remain completely unchanged.

For example:

- Calling `condense_punctuation("Hello!!! What???")` returns **`"Hello! What?"`**: three `!` become one, three `?` become one.
- Calling `condense_punctuation("No change")` returns **`"No change"`**: no punctuation to condense.
- Calling `condense_punctuation("!!!???!!!")` returns **`"!?"`**: each run collapses to a single character.

Your function should return the normalized string with consecutive `!` and `?` collapsed.

This exercise reinforces several important programming concepts:

- Using the **`re` module** for pattern-based substitution.
- Working with **backreferences** in regular expressions.
- Building **text normalization** utilities.
- Understanding the difference between **character-level and pattern-level** operations.

Text normalization is used in chat applications, search engines, data cleaning pipelines, and natural language processing systems.',
	param_names = '{text}'
WHERE slug = 'py-condense-punctuation';
UPDATE problems SET
	statement = '**Optimization problems** that involve fitting items into a limited space are common in logistics, manufacturing, and resource allocation. Even a simple version of such a problem teaches important lessons about integer division and constraints.

In this challenge, your task is to calculate the maximum number of identical boxes that can fit inside a rectangular container — assuming all boxes are packed in the same orientation (no rotation). Given the container dimensions `[L, W, H]` and box dimensions `[l, w, h]`, compute how many boxes fit along each axis using integer division.

For example:

- Calling `max_boxes_in_container([10, 10, 10], [2, 2, 2])` returns **`125`**: `5 × 5 × 5 = 125` boxes.
- Calling `max_boxes_in_container([10, 10, 10], [3, 3, 3])` returns **`27`**: `3 × 3 × 3 = 27` boxes.
- Calling `max_boxes_in_container([5, 5, 5], [6, 1, 1])` returns **`0`**: the box is too long for the container.

Your function should return the maximum number of boxes that can fit, or `0` if the box cannot fit at all.

This exercise reinforces several important programming concepts:

- Using **integer division** (`//`) for discrete packing.
- Solving **constrained optimization** problems.
- Handling **infeasible** configurations gracefully.
- Translating real-world **spatial reasoning** into code.

Container packing calculations are used in shipping logistics, warehouse management, packaging design, and inventory planning.',
	param_names = '{container,box}'
WHERE slug = 'py-max-boxes-in-container';
UPDATE problems SET
	statement = 'Combining **extreme value detection** with digit manipulation creates an interesting multi-step pipeline that exercises several core programming skills at once.

In this challenge, your task is to isolate the digits of an integer, find the **highest** and **lowest** digit values, square each of these two extreme digits, concatenate the squared results (high first, then low), and convert back to an integer.

For example:

- Calling `high_low_square_map(2817)` returns **`641`**: digits are `2, 8, 1, 7`, highest is `8` (`64`), lowest is `1` (`1`), concatenated as `641`.
- Calling `high_low_square_map(5)` returns **`2525`**: highest and lowest are both `5` (`25`), concatenated twice gives `2525`.
- Calling `high_low_square_map(100)` returns **`10`**: digits are `1, 0, 0`, highest is `1` (`1`), lowest is `0` (`0`), concatenated as `10`.

Your function should return the concatenated squared result as an integer.

This exercise reinforces several important programming concepts:

- Finding **extreme digits** within a number.
- Building **multi-step processing pipelines**.
- Converting between **strings and integers** repeatedly.
- Handling **identical min and max** values correctly.

Extreme digit analysis appears in checksum algorithms, number theory problems, and various data encoding schemes.',
	param_names = '{n}'
WHERE slug = 'py-high-low-square-map';
UPDATE problems SET
	statement = 'A **palindrome** is a word, phrase, or sequence that reads the same forwards and backwards. Palindrome checking is a classic programming exercise that combines string cleaning, case normalization, and comparison.

In this challenge, your task is to write a function that checks whether a given string is a palindrome, **ignoring case** and **non-alphanumeric characters**. Empty strings should be considered trivially palindrome.

For example:

- Calling `is_palindrome("A man, a plan, a canal: Panama")` returns **`True`**: after removing spaces and punctuation and ignoring case, it reads the same forwards and backwards.
- Calling `is_palindrome("race a car")` returns **`False`**: the cleaned string is not symmetric.
- Calling `is_palindrome("")` returns **`True`**: an empty string is trivially a palindrome.

Your function should return `True` if the string is a palindrome, `False` otherwise.

This exercise reinforces several important programming concepts:

- **Filtering** strings to keep only alphanumeric characters.
- Performing **case-insensitive** comparisons.
- **Reversing** strings with slicing.
- Handling **edge cases** like empty input.

Palindrome checking is a classic coding interview problem that tests string manipulation, filtering, and algorithmic thinking.',
	param_names = '{s}'
WHERE slug = 'py-is-palindrome';
UPDATE problems SET
	statement = 'Character classification and counting is a fundamental string processing skill. Determining how many vowels appear in a piece of text is a simple but instructive exercise in **iteration**, **membership testing**, and **accumulation**.

In this challenge, your task is to write a function that counts the total number of vowels (`a, e, i, o, u`) in a given string, ignoring case. The letter `y` is not considered a vowel.

For example:

- Calling `count_vowels("Hello World")` returns **`3`**: vowels are `e`, `o`, and `o`.
- Calling `count_vowels("PYTHON")` returns **`1`**: only the letter `O` is a vowel.
- Calling `count_vowels("Rhythm")` returns **`0`**: no vowel characters found.

Your function should return the integer count of vowels in the string.

This exercise reinforces several important programming concepts:

- Defining a **set** of target characters for efficient lookup.
- **Iterating** through characters in a string.
- Performing **case-insensitive** comparisons.
- **Accumulating** a count through summation.

Vowel counting is a common warm-up exercise for string processing and appears in text analysis, language processing, and educational software.',
	param_names = '{s}'
WHERE slug = 'py-count-vowels';
UPDATE problems SET
	statement = 'Set operations are a powerful tool for working with collections of data. Finding the **intersection** of two lists — the elements they have in common — is a fundamental operation in data analysis and search.

In this challenge, your task is to write a function that takes two lists of integers and returns a **sorted list of the elements common to both lists**, with no duplicates. The order of the original lists should not affect the result.

For example:

- Calling `array_intersection([1, 2, 3, 4], [3, 4, 5, 6])` returns **`[3, 4]`**: the common elements.
- Calling `array_intersection([1, 2, 3], [4, 5, 6])` returns **`[]`**: no elements in common.
- Calling `array_intersection([1, 1, 2, 2], [1, 2])` returns **`[1, 2]`**: duplicates are removed.

Your function should return a sorted list of unique common elements.

This exercise reinforces several important programming concepts:

- Converting lists to **sets** for efficient operations.
- Using the **intersection operator** (`&`) for set operations.
- Removing **duplicates** from results.
- **Sorting** the final output.

Set intersection is used in database queries, search engines, recommendation systems, and any application that compares collections of items.',
	param_names = '{a,b}'
WHERE slug = 'py-array-intersection';
UPDATE problems SET
	statement = '**FizzBuzz** is one of the most famous programming exercises, and for good reason: it elegantly tests your ability to combine **modular arithmetic**, **conditional chaining**, and **list accumulation** in a small amount of code.

In this challenge, your task is to generate the FizzBuzz sequence up to a given number `n`. For each number from `1` to `n`, determine its value:
- If divisible by **both 3 and 5**: `"FizzBuzz"`
- If divisible by **3 only**: `"Fizz"`
- If divisible by **5 only**: `"Buzz"`
- Otherwise: the number itself as a string

Return the results as a list of strings.

For example:

- Calling `fizzbuzz_sequence(5)` returns **`["1", "2", "Fizz", "4", "Buzz"]`**: the first five entries.
- Calling `fizzbuzz_sequence(15)` returns a 15-element list ending with **`"FizzBuzz"`** at position 15.
- Calling `fizzbuzz_sequence(0)` returns **`[]`**: no numbers to evaluate.

Your function should return a list of strings representing the FizzBuzz sequence.

This exercise reinforces several important programming concepts:

- Using the **modulo operator** (`%`) for divisibility checks.
- Chaining **conditional checks** in the correct order.
- Converting numbers to **string representations**.
- Building a **list progressively** through iteration.

FizzBuzz is famously used in programming interviews as a quick filter test and is an excellent benchmark of basic coding proficiency.',
	param_names = '{n}'
WHERE slug = 'py-fizzbuzz-sequence';
UPDATE problems SET
	statement = 'Two strings are **anagrams** if they contain the same characters in the same frequency. Anagram checking is a classic problem that tests string processing, sorting, and frequency analysis.

In this challenge, your task is to write a function that determines whether two strings are anagrams of each other. The comparison should **ignore case** and **ignore non-alphanumeric characters**. Empty strings are trivially anagrams of each other.

For example:

- Calling `anagram_checker("listen", "silent")` returns **`True`**: both contain the same letters in the same frequency.
- Calling `anagram_checker("Hello", "Ole! h!")` returns **`True`**: after cleaning and lowercasing, both reduce to `"hello"`.
- Calling `anagram_checker("hello", "world")` returns **`False`**: the character sets are entirely different.

Your function should return `True` if the strings are anagrams, `False` otherwise.

This exercise reinforces several important programming concepts:

- **Normalizing** strings by removing unwanted characters.
- Performing **case-insensitive** comparisons.
- Using **sorting** or **frequency counting** for comparison.
- Handling **edge cases** like empty strings.

Anagram checking is used in word games, spell checkers, cryptography, and natural language processing applications.',
	param_names = '{a,b}'
WHERE slug = 'py-anagram-checker';
