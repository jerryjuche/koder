# Rephrase Review — Module: python-arrays-strings

> **7 problems** | Generated: 2026-07-26
> Each entry shows: current statement → proposed rephrase + descriptive param name

---

## 1. py-arr-str-count-vowels — Count Vowels

**Current param name:** `arg1`
**Proposed param name:** `s`

### Current Statement

> A **string** is a sequence of characters that can be processed one character at a time.
>
> By iterating through a string, you can inspect each character and perform operations based on specific conditions.
>
> In this challenge, your task is to count the number of **vowels** in a given string.
>
> A vowel is any of the following characters: `a`, `e`, `i`, `o`, or `u`.
> Both **uppercase** and **lowercase** vowels should be included in the final count.
>
> As you examine each character, determine whether it is a vowel. If it is, increase your count and continue until every character in the string has been processed.
>
> This exercise helps reinforce several core programming concepts:
>
> - Iterating through a **string** one character at a time.
> - Using **conditional statements** to test each character.
> - Maintaining a **running count** while processing data.
> - Solving a common text-processing problem found in many real-world applications.
>
> Character counting is a fundamental technique used in text analysis, data validation, search algorithms, and many other programming tasks.

### Proposed Rephrase

> Raw text often contains patterns that reveal important information about its content.
> One of the simplest yet most useful patterns to identify is the presence of **vowels** — the characters `a`, `e`, `i`, `o`, and `u`.
>
> In this challenge, your task is to count how many vowels appear in a given string.
> Both **uppercase** and **lowercase** vowels must be included in the final count.
>
> Your function should examine the string one character at a time, determine whether each character is a vowel, and return the total number of vowels found.
>
> For example:
>
> - `count_vowels("hello")` returns `2` (the vowels `e` and `o`).
> - `count_vowels("AEIOU")` returns `5` (all five uppercase vowels).
> - `count_vowels("rhythm")` returns `0` (no vowels at all).
>
> This exercise reinforces several important programming concepts:
>
> - Iterating through a **string** one character at a time.
> - Using **conditional logic** to classify each character.
> - Maintaining a **running counter** while processing sequential data.
> - Normalizing input (e.g., converting case) to simplify comparisons.
>
> Character counting is a fundamental technique used in text analysis, data validation, search algorithms, and many other real-world applications.

---

## 2. py-arr-str-count-words — Count Words

**Current param name:** `arg1`
**Proposed param name:** `sentence`

### Current Statement

> A **sentence** is a sequence of words separated by whitespace.
> Processing text often begins by identifying and working with these individual words.
>
> In this challenge, your task is to determine how many **words** are contained in a given sentence.
>
> A word is any sequence of non-whitespace characters separated by one or more spaces.
>
> Your function should return the total number of words in the sentence.
> It should correctly handle sentences with multiple spaces, as well as leading or trailing whitespace.
>
> This exercise reinforces several important programming concepts:
>
> - Working with **strings** and text data.
> - Splitting a string into individual words.
> - Counting the number of elements in a collection.
> - Breaking a larger problem into smaller, manageable steps.
>
> Word counting is a fundamental text-processing operation that is widely used in search engines, document analysis, natural language processing, and many other real-world applications.

### Proposed Rephrase

> Text is often composed of **words** separated by whitespace, and many text-processing tasks begin by identifying and counting these individual words.
>
> In this challenge, your task is to determine the number of words contained in a given sentence.
> A **word** is defined as any sequence of non-whitespace characters separated by one or more spaces, tabs, or other whitespace characters.
>
> Your function should correctly handle:
>
> - **Multiple consecutive spaces** between words.
> - **Leading or trailing whitespace** at the beginning or end of the sentence.
> - **Empty strings**, which contain zero words.
>
> For example:
>
> - `count_words("Hello world")` returns `2`.
> - `count_words("  One   two   three  ")` returns `3`.
> - `count_words("")` returns `0`.
>
> This exercise reinforces several important programming concepts:
>
> - Working with **strings** and text data.
> - Using built-in string methods to parse and split text.
> - Counting the number of elements in the resulting collection.
> - Handling **edge cases** such as empty input and irregular whitespace.
>
> Word counting is a fundamental text-processing operation used in search engines, document analysis, natural language processing, and many other real-world applications.

---

## 3. py-arr-str-find-max — Find Maximum Element

**Current param name:** `arg1`
**Proposed param name:** `nums`

### Current Statement

> A **list** is an ordered collection that allows you to store multiple values in a single variable.
> Each element has a specific position, known as its **index**, making it easy to access and process individual items.
>
> In this challenge, your task is to find the **largest value** in a list of numbers.
> As you iterate through the list, compare each element with the current largest value found so far, updating your result whenever a larger number is encountered.
>
> Your function should return the maximum value contained in the list.
>
> This exercise reinforces several important programming concepts:
>
> - Working with **lists** and indexed collections.
> - Iterating through a sequence one element at a time.
> - Comparing values using **conditional logic**.
> - Tracking and updating a result while processing data.
>
> Finding the largest value in a collection is a fundamental programming technique that forms the basis of many real-world applications, including statistical analysis, data processing, and search algorithms.

### Proposed Rephrase

> Raw data often arrives as a **collection of numbers** that must be analyzed to extract meaningful insights.
> One of the most fundamental analytical operations is identifying the **largest value** within the collection.
>
> In this challenge, your task is to find the maximum element in a list of integers.
>
> Your function should examine each number in the list, keep track of the largest value encountered so far, and return that value once all elements have been processed.
>
> For example:
>
> - `find_max([3, 7, 2, 9, 5])` returns `9`.
> - `find_max([-5, -2, -8, -1])` returns `-1`.
> - `find_max([100])` returns `100`.
>
> This exercise reinforces several important programming concepts:
>
> - Iterating through a **list** to examine each element.
> - Using **comparison operators** to evaluate values against a running candidate.
> - Maintaining **state** (the current maximum) across loop iterations.
> - Understanding how the algorithm behaves with **negative numbers** and **single-element lists**.
>
> Finding the maximum value in a collection is a cornerstone technique used in statistical analysis, data processing, search algorithms, and many other real-world applications.

---

## 4. py-arr-str-list-sum — List Sum

**Current param name:** `arg1`
**Proposed param name:** `numbers`

### Current Statement

> A **list** is an ordered collection of values that can be processed one element at a time.
> One of the most common operations performed on a list is calculating the **sum** of all its elements.
>
> In this challenge, your task is to iterate through a list of numbers and compute their total.
> As you process each element, add its value to a running total until every item in the list has been included.
>
> Your function should return the final sum of all the numbers in the list.
>
> This exercise reinforces several important programming concepts:
>
> - Iterating through a **list** one element at a time.
> - Maintaining a **running total** while processing data.
> - Performing arithmetic operations within a loop.
> - Producing a single result by combining multiple values.
>
> Calculating the sum of a collection is a fundamental programming technique that serves as the basis for many other operations, including counting, averaging, statistical analysis, and data aggregation.

### Proposed Rephrase

> Many real-world problems involve combining multiple values into a single result.
> The simplest and most common of these operations is the **sum** — adding every element in a collection together.
>
> In this challenge, your task is to compute the sum of all numbers in a given list.
>
> Your function should iterate through the list, add each element to a running total, and return the final sum once all elements have been processed.
>
> For example:
>
> - `list_sum([1, 2, 3, 4, 5])` returns `15`.
> - `list_sum([-10, 20, -30])` returns `-20`.
> - `list_sum([])` returns `0`.
>
> This exercise reinforces several important programming concepts:
>
> - Iterating through a **list** to access each element.
> - Maintaining a **running total** using an accumulator variable.
> - Performing **arithmetic operations** within a loop.
> - Handling **edge cases** such as empty lists and negative numbers.
>
> Calculating the sum of a collection is a fundamental building block used in averaging, statistical analysis, financial calculations, and many other areas.

---

## 5. py-arr-str-palindrome — Palindrome Check

**Current param name:** `arg1`
**Proposed param name:** `s`

### Current Statement

> A **palindrome** is a word, phrase, or sequence of characters that reads the same forwards and backwards.
>
> Examples include `racecar`, `madam`, and `level`.
>
> In this challenge, your task is to determine whether a given string is a **palindrome**.
>
> A string is considered a palindrome if its characters appear in the same order when read from left to right and from right to left.
>
> To solve this problem, compare the original string with its reversed version. If both are identical, the string is a palindrome.
> Otherwise, it is not.
>
> This exercise reinforces several important programming concepts:
>
> - Working with **strings** and character sequences.
> - Comparing two values to determine equality.
> - Understanding how reversing a sequence changes the order of its elements.
> - Solving a common pattern recognition problem used in algorithms and technical interviews.
>
> Palindrome checking is a fundamental exercise that helps build confidence with string manipulation and logical comparisons, making it an excellent introduction to sequence-based problem solving.

### Proposed Rephrase

> A **palindrome** is a word, phrase, or sequence that reads the same forwards and backwards.
> Common examples include `racecar`, `madam`, `level`, and `"A man, a plan, a canal: Panama"`.
>
> In this challenge, your task is to determine whether a given string is a palindrome.
>
> Your function should compare the string with its reverse. If both are identical, the string is a palindrome and the function should return `True`. Otherwise, it should return `False`.
>
> For example:
>
> - `is_palindrome("racecar")` returns `True`.
> - `is_palindrome("hello")` returns `False`.
> - `is_palindrome("a")` returns `True`.
> - `is_palindrome("")` returns `True`.
>
> **Note:** The comparison is **case-sensitive** and includes all characters, including spaces and punctuation.
>
> This exercise reinforces several important programming concepts:
>
> - Working with **strings** as ordered sequences of characters.
> - **Reversing** a sequence to compare it with the original.
> - Using **equality operators** to compare two values.
> - Solving a classic pattern-recognition problem frequently encountered in algorithms and technical interviews.
>
> Palindrome checking is a fundamental exercise that builds confidence with string manipulation and logical comparison, and it serves as a gentle introduction to sequence-based problem solving.

---

## 6. py-arr-str-remove-duplicates — Remove Duplicates

**Current param name:** `arg1`
**Proposed param name:** `nums`

### Current Statement

> A **list** is an ordered collection that can contain multiple values, including duplicate elements.
>
> While duplicates are sometimes useful, there are many situations where you need to work with only the unique values in a collection.
>
> In this challenge, your task is to remove all duplicate values from a list while preserving the order in which each value first appears.
>
> The first occurrence of every value should be kept, and any subsequent occurrences should be discarded.
>
> Your function should return a **new list** containing each unique value exactly once, without modifying the original ordering of the remaining elements.
>
> This exercise reinforces several important programming concepts:
>
> - Working with **lists** and ordered collections.
> - Iterating through a sequence one element at a time.
> - Identifying and handling **duplicate** values.
> - Building a new collection while preserving the original order of unique elements.
>
> Removing duplicates while maintaining order is a common operation in data processing, data cleaning, and many real-world programming tasks.

### Proposed Rephrase

> Collections of data often contain **duplicate values** that must be removed before analysis can proceed.
> However, simply eliminating duplicates is not enough — the **relative order** of the remaining values must usually be preserved.
>
> In this challenge, your task is to remove all duplicate elements from a list while maintaining the original order in which each unique value first appears.
>
> The first occurrence of each value should be kept. Any subsequent occurrence of the same value should be discarded.
>
> For example:
>
> - `remove_duplicates([1, 2, 2, 3, 1, 4])` returns `[1, 2, 3, 4]`.
> - `remove_duplicates([5, 5, 5, 5])` returns `[5]`.
> - `remove_duplicates([])` returns `[]`.
>
> This exercise reinforces several important programming concepts:
>
> - Iterating through a **list** to examine each element.
> - Using a **set** or similar data structure to track previously seen values.
> - Building a **new list** that preserves order while excluding duplicates.
> - Handling **edge cases** such as empty input and all-identical values.
>
> Removing duplicates while preserving order is a common data-cleaning operation used in data processing pipelines, database normalization, and many real-world applications.

---

## 7. py-arr-str-reverse-string — Reverse a String

**Current param name:** `arg1`
**Proposed param name:** `s`

### Current Statement

> A **string** is an ordered sequence of characters used to represent text. Each character has a numeric **index**, starting at `0`, which allows you to access and manipulate individual characters.
>
> In this challenge, your task is to reverse a string by arranging its characters in the opposite order.
> After reversing, the first character should become the last, the second should become the second-to-last, and this pattern should continue until the entire string has been reversed.
>
> Your function should return a **new string** containing all of the original characters in reverse order.
>
> This exercise reinforces several important programming concepts:
>
> - Working with **strings** as ordered sequences.
> - Understanding how character positions change within a sequence.
> - Transforming existing data to produce a new result.
> - Practicing a fundamental text-processing operation used in many programming tasks.
>
> Reversing a string is a common programming exercise that helps build confidence with sequence manipulation and serves as the foundation for many algorithms involving text processing and data transformation.

### Proposed Rephrase

> Strings in Python are sequences of characters that can be accessed, sliced, and manipulated in many ways.
> Like lists, strings are ordered collections where each character has a numeric index, starting from zero.
>
> Reversing a string is a classic exercise that teaches you how to work with character positions and understand the relationship between a string's start and end.
>
> In this challenge, your task is to reverse a given string by arranging its characters in the opposite order.
> The first character should become the last, the second should become the second-to-last, and so on, until the entire string has been reversed.
>
> Your function should return a **new string** containing all of the original characters in reverse order.
>
> For example:
>
> - `reverse_string("hello")` returns `"olleh"`.
> - `reverse_string("Python")` returns `"nohtyP"`.
> - `reverse_string("a")` returns `"a"`.
> - `reverse_string("")` returns `""`.
>
> This exercise reinforces several important programming concepts:
>
> - Working with **strings** as ordered sequences of characters.
> - Understanding how **indices** map to character positions within a sequence.
> - **Transforming** existing data to produce a new result.
> - Practicing a fundamental text-processing operation used in many programming tasks.
>
> Reversing a string is a common exercise that builds confidence with sequence manipulation and serves as the foundation for many algorithms involving text processing, data transformation, and palindrome detection.

---

## Summary of Changes

| # | Slug | Current Param | Proposed Param | Statement |
|---|---|---|---|---|
| 1 | py-arr-str-count-vowels | `arg1` | `s` | ✅ Rephrased |
| 2 | py-arr-str-count-words | `arg1` | `sentence` | ✅ Rephrased |
| 3 | py-arr-str-find-max | `arg1` | `nums` | ✅ Rephrased |
| 4 | py-arr-str-list-sum | `arg1` | `numbers` | ✅ Rephrased |
| 5 | py-arr-str-palindrome | `arg1` | `s` | ✅ Rephrased |
| 6 | py-arr-str-remove-duplicates | `arg1` | `nums` | ✅ Rephrased |
| 7 | py-arr-str-reverse-string | `arg1` | `s` | ✅ Rephrased |

---

*Review the proposed changes above. If everything looks good, let me know and I'll generate the SQL files (`update.sql` + `rollback.sql`) and the updated `problems_updated.json` ready to apply to Supabase.*
