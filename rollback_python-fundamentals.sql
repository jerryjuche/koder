-- ROLLBACK — Generated: 2026-07-27 05:49:44
-- Module: python-fundamentals
-- Problems: 20

UPDATE problems SET
	statement = 'Write a function **`add_and_sort(nums, value)`** that adds `value` to the end of the list `nums`, sorts the resulting list in ascending order, and returns it.

### Expected function

```python
def add_and_sort(nums: list, value: int) -> list:
    # Your code here
    pass
```

### Examples

- `add_and_sort([3, 1, 4], 2)` returns `[1, 2, 3, 4]`
- `add_and_sort([], 5)` returns `[5]`',
	param_names = '{}'
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
	param_names = '{}'
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
	param_names = '{}'
WHERE slug = 'python-classify-number';
UPDATE problems SET
	statement = 'Write a function **`clean_and_capitalize(s)`** that removes any leading or trailing whitespace from `s`, then capitalizes it so the first letter is uppercase and the rest are lowercase.

### Expected function

```python
def clean_and_capitalize(s: str) -> str:
    # Your code here
    pass
```

### Examples

- `clean_and_capitalize("  hELLO  ")` returns `"Hello"`
- `clean_and_capitalize("python")` returns `"Python"`',
	param_names = '{}'
WHERE slug = 'python-clean-and-capitalize';
UPDATE problems SET
	statement = 'Write a function **`combine_info(name, age)`** that takes a person''s `name` (a string) and their `age` (an integer) and returns a sentence describing them.

This introduces two of Python''s most common variable **types** working together in one function:
- `str` — text, like `"Jerry"`
- `int` — whole numbers, like `28`

### Expected function

```python
def combine_info(name: str, age: int) -> str:
    # Your code here
    pass
```

### Examples

- `combine_info("Jerry", 28)` returns `"Jerry is 28 years old."`
- `combine_info("Ada", 36)` returns `"Ada is 36 years old."`',
	param_names = '{}'
WHERE slug = 'python-combine-info';
UPDATE problems SET
	statement = 'Write a **recursive** function **`fibonacci_recursive(n)`** that returns the `n`-th number in the Fibonacci sequence (0-indexed, where `fibonacci_recursive(0) == 0` and `fibonacci_recursive(1) == 1`), calling itself rather than using a loop.

### Expected function

```python
def fibonacci_recursive(n: int) -> int:
    # Your code here
    pass
```

### Examples

- `fibonacci_recursive(0)` returns `0`
- `fibonacci_recursive(1)` returns `1`
- `fibonacci_recursive(6)` returns `8`',
	param_names = '{}'
WHERE slug = 'python-fibonacci-recursive';
UPDATE problems SET
	statement = 'Write a function **`get_first_and_last(s)`** that returns a two-character string made of the first and last characters of `s`.

### Expected function

```python
def get_first_and_last(s: str) -> str:
    # Your code here
    pass
```

### Examples

- `get_first_and_last("python")` returns `"pn"`
- `get_first_and_last("a")` returns `"aa"`',
	param_names = '{}'
WHERE slug = 'python-first-and-last';
UPDATE problems SET
	statement = 'Write a function **`format_price(name, price)`** that returns a price tag string in the exact form `"<name>: $<price>"`, where `<price>` is always shown with exactly two digits after the decimal point.

### Expected function

```python
def format_price(name: str, price: float) -> str:
    # Your code here
    pass
```

### Examples

- `format_price("Coffee", 4.5)` returns `"Coffee: $4.50"`
- `format_price("Notebook", 2.0)` returns `"Notebook: $2.00"`',
	param_names = '{}'
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
	param_names = '{}'
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

Creating a simple greeting function is a traditional first step in learning a programming language and provides the foundation for building more complex functions in future challenges.',
	param_names = '{}'
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
	param_names = '{}'
WHERE slug = 'python-is-valid-age';
UPDATE problems SET
	statement = 'Write a function **`letter_frequency_of(s, letter)`** that counts how many times the single character `letter` appears in the string `s`, using a **dictionary** to tally up character counts.

### Expected function

```python
def letter_frequency_of(s: str, letter: str) -> int:
    # Your code here
    pass
```

### Examples

- `letter_frequency_of("banana", "a")` returns `3`
- `letter_frequency_of("hello", "z")` returns `0`',
	param_names = '{}'
WHERE slug = 'python-letter-frequency';
UPDATE problems SET
	statement = 'Write a function **`multiplication_table_sum(n)`** that computes an `n` by `n` multiplication table (where the entry in row `i`, column `k` is `i * k`, for `i` and `k` from 1 to `n`) and returns the sum of every entry in that table, using two nested `for` loops.

### Expected function

```python
def multiplication_table_sum(n: int) -> int:
    # Your code here
    pass
```

### Examples

- `multiplication_table_sum(2)` returns `9` (1×1 + 1×2 + 2×1 + 2×2 = 1+2+2+4)
- `multiplication_table_sum(1)` returns `1`',
	param_names = '{}'
WHERE slug = 'python-multiplication-table-sum';
UPDATE problems SET
	statement = 'Write a function **`safe_divide(a, b)`** that returns `a / b` as a floating-point result, or `-1.0` if `b` is `0`, using a `try`/`except` block to handle the division-by-zero error instead of letting the program crash.

### Expected function

```python
def safe_divide(a: int, b: int) -> float:
    # Your code here
    pass
```

### Examples

- `safe_divide(10, 2)` returns `5.0`
- `safe_divide(7, 0)` returns `-1.0`',
	param_names = '{}'
WHERE slug = 'python-safe-divide';
UPDATE problems SET
	statement = 'Write a function **`sort_by_length(words)`** that returns a new list containing the strings in `words`, sorted from shortest to longest, using the `key` argument of Python''s `sorted()`.

### Expected function

```python
def sort_by_length(words: list) -> list:
    # Your code here
    pass
```

### Examples

- `sort_by_length(["banana", "kiwi", "fig"])` returns `["fig", "kiwi", "banana"]`
- `sort_by_length([])` returns `[]`',
	param_names = '{}'
WHERE slug = 'python-sort-by-length';
UPDATE problems SET
	statement = 'Write a function **`squares_of_evens(nums)`** that returns a new list containing the square of every even number in `nums`, in their original order, using a **list comprehension**.

### Expected function

```python
def squares_of_evens(nums: list) -> list:
    # Your code here
    pass
```

### Examples

- `squares_of_evens([1, 2, 3, 4, 5])` returns `[4, 16]`
- `squares_of_evens([1, 3, 5])` returns `[]`',
	param_names = '{}'
WHERE slug = 'python-squares-of-evens';
UPDATE problems SET
	statement = 'In Python, `*args` lets a function accept **any number** of positional arguments, collected together as a tuple. Write a function **`sum_all(nums)`** that models this: internally, it should call a `*args`-style function to add up every number, and return the total. `nums` represents the collected arguments as a list for grading purposes.

### Expected function

```python
def sum_all(nums: list) -> int:
    # Your code here
    pass
```

### Examples

- `sum_all([1, 2, 3])` returns `6`
- `sum_all([])` returns `0`',
	param_names = '{}'
WHERE slug = 'python-sum-all';
UPDATE problems SET
	statement = 'Write a function **`sum_even_numbers(n)`** that returns the sum of every even number from 2 up to and including `n`, using a `while` loop.

### Expected function

```python
def sum_even_numbers(n: int) -> int:
    # Your code here
    pass
```

### Examples

- `sum_even_numbers(6)` returns `12` (2 + 4 + 6)
- `sum_even_numbers(1)` returns `0` (no even numbers that small)',
	param_names = '{}'
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
	param_names = '{}'
WHERE slug = 'python-sum-up-to';
UPDATE problems SET
	statement = 'Write a function **`swap_values(a, b)`** that swaps the values of `a` and `b` using Python''s tuple unpacking, and returns them as a two-element list `[a, b]` in their new, swapped order.

### Expected function

```python
def swap_values(a: int, b: int) -> list:
    # Your code here
    pass
```

### Examples

- `swap_values(1, 2)` returns `[2, 1]`
- `swap_values(5, 5)` returns `[5, 5]`',
	param_names = '{}'
WHERE slug = 'python-swap-values';
