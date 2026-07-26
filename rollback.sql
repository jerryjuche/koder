-- ROLLBACK — Generated: 2026-07-26 23:34:27
-- Module: python-arrays-strings
-- Problems: 7

UPDATE problems SET
	statement = 'A **string** is a sequence of characters that can be processed one character at a time. 

By iterating through a string, you can inspect each character and perform operations based on specific conditions.

In this challenge, your task is to count the number of **vowels** in a given string. 

A vowel is any of the following characters: `a`, `e`, `i`, `o`, or `u`. 
Both **uppercase** and **lowercase** vowels should be included in the final count.

As you examine each character, determine whether it is a vowel. If it is, increase your count and continue until every character in the string has been processed.

This exercise helps reinforce several core programming concepts:

- Iterating through a **string** one character at a time.
- Using **conditional statements** to test each character.
- Maintaining a **running count** while processing data.
- Solving a common text-processing problem found in many real-world applications.

Character counting is a fundamental technique used in text analysis, data validation, search algorithms, and many other programming tasks.',
	param_names = '{}'
WHERE slug = 'py-arr-str-count-vowels';
UPDATE problems SET
	statement = 'A **sentence** is a sequence of words separated by whitespace. 
Processing text often begins by identifying and working with these individual words.

In this challenge, your task is to determine how many **words** are contained in a given sentence. 

A word is any sequence of non-whitespace characters separated by one or more spaces.

Your function should return the total number of words in the sentence. 
It should correctly handle sentences with multiple spaces, as well as leading or trailing whitespace.

This exercise reinforces several important programming concepts:

- Working with **strings** and text data.
- Splitting a string into individual words.
- Counting the number of elements in a collection.
- Breaking a larger problem into smaller, manageable steps.

Word counting is a fundamental text-processing operation that is widely used in search engines, document analysis, natural language processing, and many other real-world applications.',
	param_names = '{}'
WHERE slug = 'py-arr-str-count-words';
UPDATE problems SET
	statement = 'A **list** is an ordered collection that allows you to store multiple values in a single variable. 
Each element has a specific position, known as its **index**, making it easy to access and process individual items.

In this challenge, your task is to find the **largest value** in a list of numbers. 
As you iterate through the list, compare each element with the current largest value found so far, updating your result whenever a larger number is encountered.

Your function should return the maximum value contained in the list.

This exercise reinforces several important programming concepts:

- Working with **lists** and indexed collections.
- Iterating through a sequence one element at a time.
- Comparing values using **conditional logic**.
- Tracking and updating a result while processing data.

Finding the largest value in a collection is a fundamental programming technique that forms the basis of many real-world applications, including statistical analysis, data processing, and search algorithms.',
	param_names = '{}'
WHERE slug = 'py-arr-str-find-max';
UPDATE problems SET
	statement = 'A **list** is an ordered collection of values that can be processed one element at a time. 
One of the most common operations performed on a list is calculating the **sum** of all its elements.

In this challenge, your task is to iterate through a list of numbers and compute their total. 
As you process each element, add its value to a running total until every item in the list has been included.

Your function should return the final sum of all the numbers in the list.

This exercise reinforces several important programming concepts:

- Iterating through a **list** one element at a time.
- Maintaining a **running total** while processing data.
- Performing arithmetic operations within a loop.
- Producing a single result by combining multiple values.

Calculating the sum of a collection is a fundamental programming technique that serves as the basis for many other operations, including counting, averaging, statistical analysis, and data aggregation.',
	param_names = '{}'
WHERE slug = 'py-arr-str-list-sum';
UPDATE problems SET
	statement = 'A **palindrome** is a word, phrase, or sequence of characters that reads the same forwards and backwards. 

Examples include `racecar`, `madam`, and `level`.

In this challenge, your task is to determine whether a given string is a **palindrome**. 

A string is considered a palindrome if its characters appear in the same order when read from left to right and from right to left.

To solve this problem, compare the original string with its reversed version. If both are identical, the string is a palindrome. 
Otherwise, it is not.

This exercise reinforces several important programming concepts:

- Working with **strings** and character sequences.
- Comparing two values to determine equality.
- Understanding how reversing a sequence changes the order of its elements.
- Solving a common pattern recognition problem used in algorithms and technical interviews.

Palindrome checking is a fundamental exercise that helps build confidence with string manipulation and logical comparisons, making it an excellent introduction to sequence-based problem solving.',
	param_names = '{}'
WHERE slug = 'py-arr-str-palindrome';
UPDATE problems SET
	statement = 'A **list** is an ordered collection that can contain multiple values, including duplicate elements. 

While duplicates are sometimes useful, there are many situations where you need to work with only the unique values in a collection.

In this challenge, your task is to remove all duplicate values from a list while preserving the order in which each value first appears. 

The first occurrence of every value should be kept, and any subsequent occurrences should be discarded.

Your function should return a **new list** containing each unique value exactly once, without modifying the original ordering of the remaining elements.

This exercise reinforces several important programming concepts:

- Working with **lists** and ordered collections.
- Iterating through a sequence one element at a time.
- Identifying and handling **duplicate** values.
- Building a new collection while preserving the original order of unique elements.

Removing duplicates while maintaining order is a common operation in data processing, data cleaning, and many real-world programming tasks.',
	param_names = '{}'
WHERE slug = 'py-arr-str-remove-duplicates';
UPDATE problems SET
	statement = 'A **string** is an ordered sequence of characters used to represent text. Each character has a numeric **index**, starting at `0`, which allows you to access and manipulate individual characters.

In this challenge, your task is to reverse a string by arranging its characters in the opposite order. 
After reversing, the first character should become the last, the second should become the second-to-last, and this pattern should continue until the entire string has been reversed.

Your function should return a **new string** containing all of the original characters in reverse order.

This exercise reinforces several important programming concepts:

- Working with **strings** as ordered sequences.
- Understanding how character positions change within a sequence.
- Transforming existing data to produce a new result.
- Practicing a fundamental text-processing operation used in many programming tasks.

Reversing a string is a common programming exercise that helps build confidence with sequence manipulation and serves as the foundation for many algorithms involving text processing and data transformation.',
	param_names = '{}'
WHERE slug = 'py-arr-str-reverse-string';
