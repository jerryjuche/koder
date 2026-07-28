-- Generated: 2026-07-27 05:49:44
-- Module: python-fundamentals
-- Problems: 20

UPDATE problems SET
	statement = 'Building a list one element at a time and then arranging its contents in order are two of the most common operations performed on collections in programming.

From organizing search results to maintaining sorted records, the ability to add data and then sort it is essential in almost every software application.

In this challenge, your task is to add a new value to the end of a list and then sort the resulting list in ascending order.

It is important to avoid modifying the original list directly. Instead, create a copy of the input list before making any changes, so the caller''s data remains unaffected.

For example:

- Adding **`2`** to the list **`[3, 1, 4]`** and sorting produces **`[1, 2, 3, 4]`**.
- Adding **`5`** to an **empty list** produces **`[5]`**.

Your function should return the **new sorted list** containing the original values plus the new value.

This exercise reinforces several important programming concepts:

- Working with **lists** and their contents.
- **Appending** a new element to a list.
- **Sorting** a list in ascending order.
- Avoiding unintended side effects by working on a **copy** of the input.

List manipulation and sorting are fundamental skills used in data processing, search functionality, reporting systems, and countless real-world applications where information must be organized and maintained in order.',
	param_names = '{nums,value}'
WHERE slug = 'python-add-and-sort';
UPDATE problems SET
	statement = 'Functions in Python are **first-class objects**, which means they can be created, passed around, and even returned by other functions. 
This makes it possible to build functions that remember information from the scope in which they were created.

In this challenge, your task is to create a function that **internally defines and uses another function** to multiply a value by a given factor. The inner function should remember the provided `factor` and use it to calculate the final result.

Your function should return the product of `value` and `factor`.

This exercise reinforces several important programming concepts:

- Defining a **function inside another function**.
- Understanding how inner functions can access variables from their enclosing scope.
- Using functions as values in Python.
- Applying closures to create reusable behavior.

Nested functions and closures are powerful features that are widely used in decorators, callbacks, higher-order functions, and functional programming patterns.',
	param_names = '{factor,value}'
WHERE slug = 'python-apply-multiplier';
UPDATE problems SET
	statement = 'Conditional statements allow a program to make decisions by evaluating whether a condition is **true** or **false**. 
They enable your code to perform different actions depending on the values it receives.

In this challenge, your task is to determine whether a given number is **positive**, **negative**, or **zero**. Compare the value of `n` against `0` and return the appropriate classification based on the result.

Your function should return one of the following strings:

- `"positive"` if `n` is greater than `0`.
- `"negative"` if `n` is less than `0`.
- `"zero"` if `n` is exactly `0`.

This exercise reinforces several important programming concepts:

- Using **conditional statements** to control program flow.
- Comparing numeric values with relational operators.
- Returning different results based on multiple conditions.
- Handling mutually exclusive cases in a clear and logical way.

Classifying values based on conditions is a fundamental programming skill that appears in validation, decision-making, data processing, and countless real-world applications.',
	param_names = '{n}'
WHERE slug = 'python-classify-number';
UPDATE problems SET
	statement = 'Real-world text input is often messy, containing extra spaces, inconsistent capitalization, or formatting that must be cleaned before it can be used.

String cleaning and normalization are fundamental operations in text processing, form validation, and data preparation.

In this challenge, your task is to clean up a string by first removing any leading or trailing whitespace (spaces, tabs, newlines), and then capitalizing it so the first letter is uppercase and the remaining letters are lowercase.

For example:

- **`"  hELLO  "`** becomes **`"Hello"`** after stripping whitespace and capitalizing.
- **`"python"`** becomes **`"Python"`**.

Your function should return the **cleaned and capitalized string**.

This exercise reinforces several important programming concepts:

- Working with **strings** and text data.
- Using string methods to **strip** unwanted whitespace.
- Using string methods to **capitalize** text with proper casing.
- **Chaining** multiple method calls to perform sequential transformations.

String cleaning and normalization are essential techniques used in user input processing, data pipelines, search indexing, content management, and many other real-world applications where text quality matters.',
	param_names = '{s}'
WHERE slug = 'python-clean-and-capitalize';
UPDATE problems SET
	statement = 'Programs often need to combine different types of information—such as text and numbers—into a single, readable message.

This is one of the most common tasks in software development, appearing in user interfaces, reports, notifications, and logging systems.

In this challenge, your task is to combine a person''s **name** (a string) and their **age** (an integer) into a single descriptive sentence.

For example:

- A person named **`"Jerry"`** aged **`28`** should produce the sentence **`"Jerry is 28 years old."`**
- A person named **`"Ada"`** aged **`36`** should produce **`"Ada is 36 years old."`**

Your function should return a **properly formatted sentence** containing both pieces of information.

This exercise reinforces several important programming concepts:

- Working with **different data types** (strings and integers) in the same function.
- **Combining values** of different types into a single result.
- Using **f-strings** for clean and readable string formatting.
- Formatting output that matches an exact specification.

Combining different types of information into formatted text is a fundamental programming skill used in generating reports, sending emails, creating user messages, logging events, and countless other real-world applications.',
	param_names = '{name,age}'
WHERE slug = 'python-combine-info';
UPDATE problems SET
	statement = 'Recursion is a powerful programming technique in which a function solves a problem by **calling itself** with a smaller or simpler version of the same problem.

It is especially useful for problems that can be broken down into identical sub-problems, such as mathematical sequences, tree traversals, and divide-and-conquer algorithms.

In this challenge, your task is to implement the **Fibonacci sequence** using recursion.
The Fibonacci sequence begins with `0` and `1`, and each subsequent number is the sum of the two numbers that precede it:
`0, 1, 1, 2, 3, 5, 8, 13, ...`

Your function should be **zero-indexed**, meaning:

- `fibonacci(0)` returns **`0`**
- `fibonacci(1)` returns **`1`**
- `fibonacci(6)` returns **`8`**

For any `n` greater than `1`, the result is the sum of the two preceding Fibonacci numbers, which you must compute by making **recursive calls** to the same function.

Your function should return the **n-th Fibonacci number**.

This exercise reinforces several important programming concepts:

- Understanding how **recursion** works.
- Identifying and implementing **base cases** that stop the recursion.
- Making **recursive calls** to break down a larger problem.
- Recognizing when recursion is an appropriate solution.

Recursion is a fundamental technique in computer science used in tree and graph traversal, search algorithms, divide-and-conquer strategies, and many mathematical computations.',
	param_names = '{n}'
WHERE slug = 'python-fibonacci-recursive';
UPDATE problems SET
	statement = 'Every string is an ordered sequence of characters, and each character occupies a specific position known as its **index**.

Accessing individual characters by their position is a fundamental skill in text processing, data parsing, and string manipulation.

In this challenge, your task is to extract the **first character** and the **last character** from a string and combine them into a single two-character string.

The first character is always at index `0`, and the last character can be accessed using the index `-1`, which Python provides as a convenient way to refer to the end of a sequence.

For example:

- The string **`"python"`** has first character `''p''` and last character `''n''`, producing **`"pn"`**.
- The string **`"a"`** has the same character for both first and last, producing **`"aa"`**.

Your function should return a **new string** consisting of the first character followed by the last character.

This exercise reinforces several important programming concepts:

- Understanding how **string indexing** works.
- Using **positive indices** to access characters from the beginning.
- Using **negative indices** to access characters from the end.
- **Concatenating** strings to combine extracted characters.

Accessing characters by index is a foundational skill used in text processing, data extraction, file parsing, and virtually every application that works with strings.',
	param_names = '{s}'
WHERE slug = 'python-first-and-last';
UPDATE problems SET
	statement = 'Displaying monetary values correctly is essential in e-commerce, financial software, and any application that involves pricing.

Currency values must always be shown with exactly two decimal places, even when the amount is a round number, to ensure clarity and professionalism.

In this challenge, your task is to format a product name and price into a price tag string.

The price must be displayed with exactly **two digits after the decimal point**, preceded by a dollar sign.

For example:

- A coffee priced at **`4.5`** should appear as **`"Coffee: $4.50"`**.
- A notebook priced at **`2.0`** should appear as **`"Notebook: $2.00"`**.

Your function should return a **formatted string** following the exact pattern `"<name>: $<price>"`.

This exercise reinforces several important programming concepts:

- Working with **strings** and numeric values together.
- Using **f-strings** with format specifiers to control number display.
- Formatting **floating-point** values to a fixed number of decimal places.
- Producing output that matches an exact specification.

Currency formatting is a critical skill in financial software, e-commerce platforms, billing systems, and any application where monetary values must be displayed clearly and consistently.',
	param_names = '{name,price}'
WHERE slug = 'python-format-price';
UPDATE problems SET
	statement = 'Strings are often combined to create larger pieces of text, such as names, sentences, file paths, or messages. 
This process is known as **string concatenation**, and it is one of the most common operations performed on text data.

In this challenge, your task is to combine a person''s **first name** and **last name** into a single string. 
The two names should be separated by exactly one space to produce a properly formatted full name.

Your function should return the completed full name as a single string.

This exercise reinforces several important programming concepts:

- Working with **strings** and text values.
- Combining multiple strings into a single result.
- Formatting text with the correct spacing.
- Returning a newly constructed string from a function.

String concatenation is a fundamental programming skill that is widely used for formatting output, generating user-friendly messages, processing text, and displaying information in real-world applications.',
	param_names = '{first,last}'
WHERE slug = 'python-full-name';
UPDATE problems SET
	statement = 'Every Python program is built from **functions**, which are reusable blocks of code designed to perform a specific task. 
Functions help organize your code, improve readability, and make programs easier to maintain.

In this challenge, your task is to create a function named `greet()` that returns the string **`"Hello, World!"`**.

Although this is a simple exercise, it introduces several fundamental programming concepts that you will use throughout your Python journey.

This exercise reinforces several important programming concepts:

- Defining a function using the **`def`** keyword.
- Returning a value with the **`return`** statement.
- Understanding the difference between **returning** a value and **printing** it.
- Writing and calling your first Python function.

Creating a simple greeting function is a traditional first step in learning a programming language and provides the foundation for building more complex functions in future challenges.'
WHERE slug = 'python-greet';
UPDATE problems SET
	statement = 'Validation is the process of checking whether a value meets a set of predefined rules before it is accepted or processed. 
Performing validation helps prevent invalid data from causing errors or unexpected behavior in a program.

In this challenge, your task is to determine whether a given age falls within a valid range. An age is considered **valid** if it is between `0` and `120`, inclusive.

Your function should return `True` for valid ages and `False` for any value outside the allowed range.

This exercise reinforces several important programming concepts:

- Using **comparison operators** to evaluate numeric ranges.
- Combining conditions with **logical operators**.
- Returning **Boolean** values based on the result of a condition.
- Implementing simple input validation.

Input validation is an essential programming practice used in forms, databases, APIs, and countless real-world applications to ensure that data is accurate and reliable before it is processed.',
	param_names = '{age}'
WHERE slug = 'python-is-valid-age';
UPDATE problems SET
	statement = 'Counting how often each character appears in a piece of text is a fundamental operation in text analysis, cryptography, and data compression.

Dictionaries are the ideal data structure for this task, as they allow you to associate each character with its running count.

In this challenge, your task is to count how many times a specific character appears in a string.

First, build a dictionary that maps every character in the string to its frequency. Then, look up the requested letter in that dictionary and return its count.

If the letter does not appear in the string at all, the count should be `0`.

For example:

- In the string **`"banana"`**, the letter **`"a"`** appears **`3`** times.
- In the string **`"hello"`**, the letter **`"z"`** appears **`0`** times.

Your function should return the **count** of the specified letter in the string.

This exercise reinforces several important programming concepts:

- Working with **dictionaries** to store key-value pairs.
- Building a frequency map by iterating through a sequence.
- Using dictionary methods to safely look up values.
- Counting occurrences of specific elements.

Character frequency analysis is a fundamental technique used in text analysis, spell checkers, search engines, compression algorithms, and many other real-world applications.',
	param_names = '{s,letter}'
WHERE slug = 'python-letter-frequency';
UPDATE problems SET
	statement = 'A multiplication table is a classic example of two-dimensional data, where every cell is the product of its row number and column number.

Computing the sum of all entries in such a table requires **nested loops** — one loop for the rows and another loop inside it for the columns.

In this challenge, your task is to compute the sum of every entry in an `n` by `n` multiplication table.

For rows `i` and columns `k` ranging from `1` to `n`, each cell contains the value `i * k`. You must add every single cell to produce a total sum.

For example:

- A `2` by `2` table contains the values: `1×1=1`, `1×2=2`, `2×1=2`, `2×2=4`. The total sum is **`9`**.
- A `1` by `1` table contains only **`1`**.

Your function should return the **sum of every entry** in the multiplication table.

This exercise reinforces several important programming concepts:

- Using **nested loops** — a loop inside another loop.
- Understanding how the inner loop runs completely for every iteration of the outer loop.
- Performing arithmetic operations within nested loops.
- Calculating a **running total** across multiple dimensions.

Nested loops are a fundamental programming pattern used in matrix operations, image processing, grid-based algorithms, game development, and many other applications that involve multi-dimensional data.',
	param_names = '{n}'
WHERE slug = 'python-multiplication-table-sum';
UPDATE problems SET
	statement = 'Division by zero is a common runtime error that will crash a program if left unhandled.

Robust software anticipates and handles such exceptional situations gracefully using **error handling** techniques.

In this challenge, your task is to perform division while safely handling the case where the divisor is zero.

Use a `try`/`except` block to attempt the division. If a `ZeroDivisionError` occurs, return the fallback value `-1.0` instead of letting the program crash.

For example:

- **`10 / 2`** equals **`5.0`**.
- **`7 / 0`** would normally cause an error, but your function should safely return **`-1.0`**.

Your function should return the **result of the division** as a floating-point number, or **`-1.0`** if the division cannot be performed.

This exercise reinforces several important programming concepts:

- Understanding **runtime errors** and why they occur.
- Using **`try`/`except`** blocks to handle exceptions gracefully.
- Providing a **fallback value** when an operation cannot be completed.
- Writing defensive code that anticipates potential failures.

Error handling is a critical skill in building reliable software, used in file operations, network requests, user input processing, and countless other scenarios where operations can fail unexpectedly.',
	param_names = '{a,b}'
WHERE slug = 'python-safe-divide';
UPDATE problems SET
	statement = 'Data can be sorted according to different criteria depending on the needs of the application.

While alphabetical order is common, there are many situations where you need to sort by other attributes, such as the length of each item.

In this challenge, your task is to sort a list of words by their **length**, from shortest to longest.

Python''s `sorted()` function accepts a `key` argument that lets you specify how each element should be compared. By passing the `len` function as the key, the sorting will compare words by their character count rather than their alphabetical order.

The original list must not be modified; the function should return a **new sorted list**.

For example:

- The list **`["banana", "kiwi", "fig"]`** sorted by length becomes **`["fig", "kiwi", "banana"]`**.
- An **empty list** should return **`[]`**.

Your function should return the **new list** sorted by word length in ascending order.

This exercise reinforces several important programming concepts:

- Using Python''s built-in **`sorted()`** function.
- Understanding the **`key`** argument for custom sorting logic.
- Passing a **function as an argument** to another function.
- Returning a **new collection** without modifying the original.

Custom sorting is a fundamental technique used in data analysis, report generation, search results, user interfaces, and many other applications where data must be organized by specific attributes.',
	param_names = '{words}'
WHERE slug = 'python-sort-by-length';
UPDATE problems SET
	statement = 'Transforming and filtering data in a single step is a common pattern in data processing.

Python''s **list comprehensions** provide a concise and readable way to apply a transformation to each element in a collection while optionally filtering out elements that don''t meet a condition.

In this challenge, your task is to create a new list containing the **square of every even number** from the input list, preserving their original order.

For example:

- The list **`[1, 2, 3, 4, 5]`** contains even numbers `2` and `4`. Their squares are **`4`** and **`16`**, producing **`[4, 16]`**.
- The list **`[1, 3, 5]`** contains no even numbers, so the result is an **empty list** `[]`.

Your function should return the **new list** of squared even numbers.

This exercise reinforces several important programming concepts:

- Using **list comprehensions** for concise data transformation.
- Combining **filtering** and **transformation** in a single expression.
- Identifying even numbers using the **modulo operator**.
- Building a new list from existing data without modifying the original.

List comprehensions with filtering are widely used in data analysis, scientific computing, ETL pipelines, and many other real-world applications where data needs to be both selected and transformed efficiently.',
	param_names = '{nums}'
WHERE slug = 'python-squares-of-evens';
UPDATE problems SET
	statement = 'Sometimes a function needs to accept a variable number of arguments without knowing in advance how many will be provided.

Python''s `*args` syntax allows a function to collect any number of positional arguments into a single tuple, making it easy to write flexible and reusable functions.

In this challenge, your task is to write a function that accepts a list of numbers and returns their total sum.

Although the function receives the numbers as a single list (for grading purposes), its internal logic should demonstrate the same concept as a variadic function: processing a collection of unknown size and summing every element.

For example:

- The numbers **`[1, 2, 3]`** sum to **`6`**.
- An **empty list** `[]` should return **`0`**.

Your function should return the **total sum** of all numbers in the list.

This exercise reinforces several important programming concepts:

- Understanding how **`*args`** collects variable numbers of arguments.
- Using Python''s built-in **`sum()`** function.
- Processing collections of any size.
- Handling edge cases such as **empty input**.

Variadic functions are widely used in Python for flexible APIs, mathematical operations, logging functions, and many other situations where the number of inputs cannot be determined in advance.',
	param_names = '{nums}'
WHERE slug = 'python-sum-all';
UPDATE problems SET
	statement = 'Not all loops iterate over every element in a sequence — sometimes you need more control over how the loop progresses.

A `while` loop continues executing as long as a specified condition remains true, giving you the flexibility to control the step size and termination condition manually.

In this challenge, your task is to sum every even number from `2` up to and including `n` using a **`while` loop**.

Start at `2` (the first even number) and increase by `2` each iteration to ensure you only encounter even numbers. Continue until the current value exceeds `n`.

For example:

- Summing even numbers up to **`6`** gives **`2 + 4 + 6 = 12`**.
- There are no even numbers up to **`1`**, so the result is **`0`**.

Your function should return the **sum of all even numbers** in the specified range.

This exercise reinforces several important programming concepts:

- Using a **`while` loop** with a manually controlled counter.
- Understanding loop **conditions** and when the loop terminates.
- Using a custom **step size** to skip unwanted values.
- Accumulating a **running total** within a loop.

The `while` loop is an essential tool for situations where the number of iterations is not known in advance, such as reading data until a condition is met, implementing game loops, or processing user input.',
	param_names = '{n}'
WHERE slug = 'python-sum-even-numbers';
UPDATE problems SET
	statement = 'A **loop** allows you to execute a block of code repeatedly, making it ideal for problems that involve processing a sequence of values. 
One common use of a loop is to calculate a **running total** by adding numbers one at a time.

In this challenge, your task is to write a function that calculates the sum of every whole number from `1` up to and including `n` using a **`for` loop**. If `n` is `0`, the function should return `0`.

Your function should return the total sum of all whole numbers within the specified range.

This exercise reinforces several important programming concepts:

- Using a **`for` loop** to iterate through a sequence of numbers.
- Maintaining a **running total** while processing values.
- Working with numeric ranges and inclusive bounds.
- Handling simple edge cases, such as when the input is `0`.

Summing a sequence of numbers is a fundamental programming task that forms the basis for many algorithms involving counting, accumulation, and numerical analysis.',
	param_names = '{n}'
WHERE slug = 'python-sum-up-to';
UPDATE problems SET
	statement = 'Swapping the values of two variables is a common operation in sorting algorithms, data rearrangement, and many other programming tasks.

In many programming languages, swapping requires a temporary third variable. Python, however, offers a more elegant approach using **tuple unpacking**.

In this challenge, your task is to swap the values of two integers and return them as a two-element list in their new order.

For example:

- Swapping **`1`** and **`2`** produces **`[2, 1]`**.
- Swapping **`5`** and **`5`** (identical values) still produces **`[5, 5]`**.

Your function should return the **swapped values** as a list `[b, a]`.

This exercise reinforces several important programming concepts:

- Understanding how **variable assignment** works.
- Using **tuple unpacking** to swap values in a single line.
- Recognizing how Python evaluates the right-hand side before performing any assignment.
- Returning multiple values as a single structured result.

Tuple unpacking for swapping is a Pythonic technique that demonstrates the language''s expressive power and is commonly used in sorting algorithms, data processing, and functional programming patterns.',
	param_names = '{a,b}'
WHERE slug = 'python-swap-values';
