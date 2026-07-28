-- Generated: 2026-07-26 23:34:27
-- Module: python-arrays-strings
-- Problems: 7

UPDATE problems SET
	statement = 'Text processing is one of the most common tasks in software development.

Whether you''re building a search engine, validating user input, or analyzing documents, you''ll often need to examine a **string** one character at a time to identify specific patterns.

In this challenge, your task is to count the total number of **vowels** in a given string.

A vowel is any of the following characters: `a`, `e`, `i`, `o`, or `u`.
Both **uppercase** and **lowercase** vowels must be included in the final count.

As you iterate through the string, examine each character individually.
Whenever you encounter a vowel, **increase your running count**.
Continue until every character has been processed.

For example:

- **`"Hello World"`** contains **`3`** vowels (`e`, `o`, `o`).
- **`"PYTHON"`** contains **`1`** vowel (`O`).
- **`"rhythm"`** contains **`0`** vowels.

Your function should return the **total number of vowels** found in the string.

This exercise reinforces several important programming concepts:

- Iterating through a **string** one character at a time.
- Using **conditional statements** to evaluate characters.
- Maintaining a **running counter** while processing data.
- Comparing characters against a predefined set of values.

Character-by-character processing is a fundamental technique used in **text analysis**, **data validation**, **search engines**, **natural language processing**, and many other real-world software applications.',
	param_names = '{s}'
WHERE slug = 'py-arr-str-count-vowels';
UPDATE problems SET
	statement = 'Applications that work with text frequently need to determine **how many words** a piece of content contains.

Word counting is a fundamental operation used in document editors, blogging platforms, search engines, and natural language processing systems.

In this challenge, your task is to count the total number of **words** contained in a sentence.

A word is any sequence of non-whitespace characters separated by one or more whitespace characters.
Your solution should correctly handle **multiple consecutive spaces**, as well as **leading** and **trailing whitespace**.

For example:

- **`"Python makes programming fun"`** contains **`4`** words.
- **`"  hello   world  "`** contains **`2`** words, even though extra spaces appear between and around the words.
- An **empty string** contains **`0`** words.

Your function should return the **total number of words** found in the input string.

This exercise reinforces several important programming concepts:

- Working with **strings** and textual data.
- Separating text into individual **words**.
- Counting the number of elements in a collection.
- Handling **edge cases** involving empty input and irregular whitespace.

Word counting is a foundational text-processing technique used in **document analysis**, **search indexing**, **content management systems**, **AI applications**, and many other real-world software systems.',
	param_names = '{sentence}'
WHERE slug = 'py-arr-str-count-words';
UPDATE problems SET
	statement = 'Finding the **largest value** in a collection is one of the most fundamental operations in programming.

Whether you''re identifying the highest exam score, the warmest temperature, or the largest financial transaction, the underlying approach remains the same: examine each value and keep track of the **best candidate** found so far.

In this challenge, your task is to determine the **maximum value** in a list of integers.

Starting with an initial candidate, compare each element in the list against the current largest value.
Whenever you encounter a larger number, **update your result** and continue processing the remaining elements.

For example:

- **`[5, 2, 9, 1]`** has a maximum value of **`9`**.
- **`[-8, -2, -15]`** has a maximum value of **`-2`**.
- **`[7]`** has a maximum value of **`7`**.

Your function should return the **largest integer** contained in the list.

This exercise reinforces several important programming concepts:

- Working with **lists** and indexed collections.
- Iterating through a sequence one element at a time.
- Using **conditional comparisons** to evaluate values.
- Tracking and updating a **running maximum** while processing data.

Finding the maximum value is a core programming pattern used in **data analysis**, **search algorithms**, **report generation**, **performance monitoring**, and countless other real-world applications.',
	param_names = '{nums}'
WHERE slug = 'py-arr-str-find-max';
UPDATE problems SET
	statement = 'Combining multiple values into a single total is one of the most common operations performed in programming.

From calculating shopping expenses and game scores to summarizing sales reports and sensor readings, developers frequently need to process a collection by accumulating its values into a **running total**.

In this challenge, your task is to calculate the **sum** of all the integers in a list.

Process each element one at a time, adding its value to a running total until every item has been included.
If the list is **empty**, there are no values to add, so the result should be **`0`**.

For example:

- **`[1, 2, 3, 4]`** produces a total of **`10`**.
- **`[-5, 10, -2]`** produces **`3`**.
- **`[]`** returns **`0`**.

Your function should return the **sum of every value** in the list.

This exercise reinforces several important programming concepts:

- Iterating through a **list** one element at a time.
- Maintaining a **running total** while processing data.
- Performing arithmetic operations inside a loop.
- Producing a single result by combining multiple values.

Accumulating values is a fundamental programming technique used in **financial software**, **analytics platforms**, **scientific computing**, **reporting systems**, and many other real-world applications.',
	param_names = '{numbers}'
WHERE slug = 'py-arr-str-list-sum';
UPDATE problems SET
	statement = 'Some words, numbers, and sequences have a unique property: they read exactly the same **forwards** and **backwards**.

These sequences are known as **palindromes** and are commonly encountered in word puzzles, algorithmic challenges, and string-processing exercises.

In this challenge, your task is to determine whether a given **string** is a palindrome.

A string is considered a palindrome if reversing its characters produces **exactly the same sequence** as the original.
Every character matters, including **uppercase and lowercase letters**, **spaces**, and **punctuation**.

For example:

- **`"racecar"`** is a palindrome because it reads the same in both directions.
- **`"level"`** is also a palindrome.
- **`"Python"`** is **not** a palindrome because its reversed form is different.

Your function should return **`True`** if the input string is a palindrome, or **`False`** otherwise.

This exercise reinforces several important programming concepts:

- Working with **strings** and ordered sequences.
- Comparing two values for **equality**.
- Understanding how reversing a sequence changes character positions.
- Solving a classic **pattern-recognition** problem.

Palindrome detection is a fundamental programming exercise that strengthens your understanding of **string manipulation**, **sequence processing**, and **logical reasoning**, making it a common interview question and an excellent introduction to text-based algorithms.',
	param_names = '{s}'
WHERE slug = 'py-arr-str-palindrome';
UPDATE problems SET
	statement = 'Real-world datasets often contain **duplicate values**.

Before data can be analyzed, displayed, or stored efficiently, these repeated entries frequently need to be removed while preserving the original order of meaningful information.

In this challenge, your task is to remove **duplicate values** from a list while preserving the order of their **first appearance**.

The **first occurrence** of each value should be kept.
Any subsequent occurrences of the same value should be ignored.
The relative order of the remaining elements must remain unchanged.

For example:

- **`[1, 2, 2, 3, 1, 4]`** becomes **`[1, 2, 3, 4]`**.
- **`[5, 5, 5]`** becomes **`[5]`**.
- **`[]`** remains **`[]`**.

Your function should return a **new list** containing each unique value **exactly once**.

This exercise reinforces several important programming concepts:

- Working with **lists** and ordered collections.
- Identifying and filtering **duplicate** values.
- Tracking previously encountered elements.
- Building a new collection while preserving the original ordering.

Removing duplicates while maintaining order is a common operation in **data cleaning**, **ETL pipelines**, **database processing**, **analytics systems**, and many other real-world software applications.',
	param_names = '{nums}'
WHERE slug = 'py-arr-str-remove-duplicates';
UPDATE problems SET
	statement = 'Reordering text is one of the most common operations performed when working with **strings**.

Reversing a string is a classic programming exercise that helps you understand how characters are stored in sequence and how their positions can be manipulated to produce new results.

In this challenge, your task is to create a **new string** whose characters appear in the **reverse order** of the original.

The **first character** should become the **last**, the **second** should become the **second-to-last**, and this pattern should continue until every character has been reversed.

For example:

- **`"hello"`** becomes **`"olleh"`**.
- **`"Python"`** becomes **`"nohtyP"`**.
- Reversing **`"a"`** still produces **`"a"`**.

Your function should return a **new string** containing all of the original characters in reverse order.

This exercise reinforces several important programming concepts:

- Working with **strings** as ordered sequences.
- Understanding **character positions** and indexing.
- Transforming existing data to produce a new result.
- Practicing a fundamental text-processing operation.

String reversal is a foundational technique used in **algorithm design**, **data transformation**, **text processing**, and many coding interviews, making it an essential skill for every programmer.',
	param_names = '{s}'
WHERE slug = 'py-arr-str-reverse-string';
