-- ROLLBACK — Generated: 2026-07-27 06:01:34
-- Module: python-intermediate
-- Problems: 30

UPDATE problems SET
	statement = 'Write a function **`bank_account()`** that returns a tuple of two functions: `deposit(amount)` and `get_balance()`. The deposit function should add the given amount to a balance that persists across calls, and get_balance should return the current balance.

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
	param_names = '{}'
WHERE slug = 'py-inter-bank-account';
UPDATE problems SET
	statement = 'Write a function **`flatten_list(nested)`** that takes a list which may contain other lists as elements (nested arbitrarily deep) and returns a new list containing every non-list element in their original order, with no nesting.

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
	param_names = '{}'
WHERE slug = 'py-inter-flatten-list';
UPDATE problems SET
	statement = 'Write a function **`process_numbers(nums)`** that takes a list of integers and:
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
	param_names = '{}'
WHERE slug = 'py-inter-map-filter';
UPDATE problems SET
	statement = 'Write a function **`fib_memo(n)`** that returns the `n`-th Fibonacci number (0-indexed: `fib_memo(0) == 0`, `fib_memo(1) == 1`) using **recursion with memoization**. A naive recursive Fibonacci is exponential — memoization stores already-computed results so each number is only calculated once.

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
	param_names = '{}'
WHERE slug = 'py-inter-memoized-fib';
UPDATE problems SET
	statement = 'Write a function **`merge_dicts(dict_a, dict_b)`** that merges two dictionaries. When both dictionaries have the same key, the merged result should contain the **sum** of their values for that key. Keys that appear in only one dictionary should keep their original value.

### Expected function

```python
def merge_dicts(dict_a: dict, dict_b: dict) -> dict:
    # Your code here
    pass
```

### Examples

- `merge_dicts({"a": 1, "b": 2}, {"b": 3, "c": 4})` returns `{"a": 1, "b": 5, "c": 4}`
- `merge_dicts({"x": 10}, {})` returns `{"x": 10}`',
	param_names = '{}'
WHERE slug = 'py-inter-merge-dicts';
UPDATE problems SET
	statement = 'Write a **generator function** **`my_range(start, stop, step)`** that yields numbers from `start` up to (but not including) `stop`, incrementing by `step` each time. It should behave like the built-in `range()` but implemented using `yield`.

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
	param_names = '{}'
WHERE slug = 'py-inter-range-generator';
UPDATE problems SET
	statement = 'Write a function **`reverse_words(sentence)`** that takes a sentence as a string and returns the sentence with the order of the words reversed, while keeping each word itself intact and in its original casing.

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
	param_names = '{}'
WHERE slug = 'py-inter-reverse-words';
UPDATE problems SET
	statement = 'Write a function **`set_operations(list_a, list_b)`** that returns a dictionary with four keys:
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
	param_names = '{}'
WHERE slug = 'py-inter-set-operations';
UPDATE problems SET
	statement = 'Write a function **`make_bold(func)`** that takes a function as an argument and returns a **new function** that wraps the original. The wrapper should call the original function, take its return value (a string), and return it wrapped in `<b>` and `</b>` tags.

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
	param_names = '{}'
WHERE slug = 'py-inter-simple-decorator';
UPDATE problems SET
	statement = 'Write a function **`title_case_except(title, exceptions)`** that converts a string to title case (first letter of each word capitalized, the rest lowercase), **except** for words that appear in the `exceptions` list — those should remain entirely in lowercase.

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
	param_names = '{}'
WHERE slug = 'py-inter-title-case';
UPDATE problems SET
	statement = 'Python''s **`itertools`** module provides a collection of efficient tools for working with iterators and sequences. 
These utilities make it easy to solve common iteration problems without implementing the underlying algorithms yourself.

In this challenge, your task is to use **`itertools.combinations`** to determine how many unique ways there are to choose `k` items from a list. Since combinations are **order-independent**, selecting `(1, 2)` is considered the same as selecting `(2, 1)`, and each element in the list can only be selected once.

Your function should return the total number of distinct combinations that can be formed.

This exercise reinforces several important programming concepts:

- Importing and using functions from Python''s **standard library**.
- Working with **iterators** and lazy evaluation.
- Understanding the concept of **combinations**, where order does not matter.
- Leveraging built-in tools to write clean, efficient, and idiomatic Python code.

The `itertools` module is widely used in data analysis, algorithm design, and combinatorial problems, making it an essential part of every Python developer''s toolkit.',
	param_names = '{}'
WHERE slug = 'python-intermediate-count-combinations';
UPDATE problems SET
	statement = 'Python''s **`lambda`** keyword allows you to create small, anonymous functions without using the `def` keyword. 
These functions are commonly used when a short, one-time function is needed, especially when working with higher-order functions such as **`map()`**.

In this challenge, your task is to use a **`lambda`** function together with **`map()`** to create a new list in which every number has been doubled. Your solution should avoid using an explicit loop or a list comprehension.

Your function should return a **new list** containing the transformed values while leaving the original list unchanged.

This exercise reinforces several important programming concepts:

- Creating anonymous functions with **`lambda`**.
- Using **`map()`** to apply a function to every element of a sequence.
- Transforming data without modifying the original collection.
- Writing concise and idiomatic Python code using functional programming techniques.

The combination of `lambda` and `map()` is a common pattern in Python that enables clean, expressive solutions for applying simple transformations to collections of data.',
	param_names = '{}'
WHERE slug = 'python-intermediate-double-with-lambda';
UPDATE problems SET
	statement = 'Python''s **`re`** module provides support for **regular expressions (regex)**, a powerful way to search, match, and extract text based on patterns. 
Regular expressions allow you to locate specific types of characters or text without manually inspecting each character in a string.

In this challenge, your task is to use the **`re`** module to extract every **digit** from a given string. The extracted digits should remain in their original order and be combined into a single string.

Your function should return a string containing only the digit characters found in the input. If the string contains no digits, return an empty string.

This exercise reinforces several important programming concepts:

- Using Python''s **`re`** module for pattern matching.
- Extracting specific characters from a larger body of text.
- Working with strings and regular expressions.
- Leveraging built-in libraries to solve text-processing problems efficiently.

Regular expressions are widely used in software development for parsing logs, validating user input, processing documents, and extracting structured information from unstructured text.',
	param_names = '{}'
WHERE slug = 'python-intermediate-extract-digits';
UPDATE problems SET
	statement = 'You''ve already written a generator *function* using `yield`. This exercise shows the lower-level machinery that generators are built on top of: any class that implements `__iter__` and `__next__` becomes a fully functional custom **iterator**, usable anywhere Python expects an iterable — including `for` loops and `list(...)`.

Write a function **`generate_fibonacci_sequence(n)`** that defines a `FibonacciIterator` class producing exactly `n` Fibonacci numbers (starting `0, 1, 1, 2, 3, ...`) one at a time via `__next__`, and returns all `n` of them collected into a list.

### Expected function

```python
def generate_fibonacci_sequence(n: int) -> list:
    # Your code here
    pass
```

### Examples

- `generate_fibonacci_sequence(5)` returns `[0, 1, 1, 2, 3]`
- `generate_fibonacci_sequence(0)` returns `[]`

### Why this matters

Every `for` loop you''ve ever written in Python — over a list, a string, a `range()`, or a dictionary — works because the thing being looped over implements this exact `__iter__`/`__next__` protocol somewhere under the hood. Understanding it directly demystifies how Python''s entire iteration system actually works.',
	param_names = '{}'
WHERE slug = 'python-intermediate-fibonacci-iterator-class';
UPDATE problems SET
	statement = 'You wrote a plain recursive Fibonacci function back in the Fundamentals track. For larger inputs, that naive approach becomes extremely slow, because it recomputes the exact same smaller Fibonacci values over and over again. **Memoization** — caching results you''ve already computed — fixes this.

Write a function **`fibonacci_memoized(n)`** that returns the `n`-th Fibonacci number using recursion combined with a memoization cache (a dictionary storing results you''ve already computed), so that no Fibonacci value is ever computed more than once.

### Expected function

```python
def fibonacci_memoized(n: int) -> int:
    # Your code here
    pass
```

### Examples

- `fibonacci_memoized(10)` returns `55`
- `fibonacci_memoized(30)` returns `832040`

### Why this matters

Memoization is one of the most impactful optimizations in all of programming — turning an exponential-time recursive function into a linear-time one, just by remembering answers you''ve already worked out. It''s the foundation of dynamic programming, and Python even has a built-in decorator, `functools.lru_cache`, that adds memoization to any function automatically.',
	param_names = '{}'
WHERE slug = 'python-intermediate-fibonacci-memoized';
UPDATE problems SET
	statement = 'Data doesn''t always come in a neat, flat list — sometimes it''s nested arbitrarily deep, like a list containing other lists, which might themselves contain more lists. **Recursion** is the natural tool for processing structures like this, since you don''t know the nesting depth in advance.

Write a function **`flatten_nested_list(nested)`** that returns a single flat list containing every non-list value found anywhere inside `nested`, no matter how deeply it was nested, in their original left-to-right order.

### Expected function

```python
def flatten_nested_list(nested: list) -> list:
    # Your code here
    pass
```

### Examples

- `flatten_nested_list([1, [2, 3], [4, [5, 6]]])` returns `[1, 2, 3, 4, 5, 6]`
- `flatten_nested_list([])` returns `[]`

### Why this matters

Arbitrarily nested data shows up constantly in the real world — JSON documents, file system directory trees, HTML/XML structures, and abstract syntax trees are all naturally nested, and recursion is the standard, general-purpose tool for processing any of them without hardcoding a fixed depth.',
	param_names = '{}'
WHERE slug = 'python-intermediate-flatten-nested-list';
UPDATE problems SET
	statement = 'When you loop over a list, you often need to know **where** an item is, not just what it is. Python''s built-in `enumerate()` function solves this cleanly: instead of looping over a list''s values alone, `enumerate(words)` produces a sequence of `(index, value)` pairs, letting you unpack both directly in your loop header.

Write a function **`indexed_items(words)`** that returns a new list where each element of `words` has been turned into a string of the form `"<index>:<word>"`, using 0-based indexing.

### Expected function

```python
def indexed_items(words: list) -> list:
    # Your code here
    pass
```

### Examples

- `indexed_items(["apple", "banana", "cherry"])` returns `["0:apple", "1:banana", "2:cherry"]`
- `indexed_items([])` returns `[]`

### Why this matters

`enumerate()` replaces the older, clunkier pattern of manually tracking a counter variable (`i = 0`, then `i += 1` inside the loop). It''s more readable, less error-prone, and it''s considered the idiomatic way to loop with an index in Python — you''ll see it constantly in real codebases.',
	param_names = '{}'
WHERE slug = 'python-intermediate-indexed-items';
UPDATE problems SET
	statement = 'Counting how often items occur is such a common task that Python''s standard library has a purpose-built tool for it: **`collections.Counter`**, a specialized dictionary that tallies occurrences for you automatically.

Write a function **`most_common_word(words)`** that returns whichever string occurs most frequently in the list `words`, using `collections.Counter`. If there''s a tie, return whichever of the tied words appears first in `words`.

### Expected function

```python
def most_common_word(words: list) -> str:
    # Your code here
    pass
```

### Examples

- `most_common_word(["a", "b", "a", "c", "a"])` returns `"a"`
- `most_common_word(["x", "y", "y", "x"])` returns `"x"` (tie, but x appeared first)

### Why this matters

`Counter` replaces a whole pattern of manually maintaining a dictionary and incrementing counts by hand (the exact pattern you used earlier in the Fundamentals track''s letter-frequency exercise). Reaching for `Counter` when you need frequency counts is considered standard, idiomatic Python.',
	param_names = '{}'
WHERE slug = 'python-intermediate-most-common-word';
UPDATE problems SET
	statement = 'It''s common to have two related lists that line up position by position — a list of names and a matching list of scores, for example. Python''s **`zip()`** function makes it easy to walk through both together, without manual indexing.

Write a function **`pair_up(names, scores)`** that returns a list of strings, each formatted as `"<name>:<score>"`, pairing up `names[i]` with `scores[i]` for every position `i`. If the two lists have different lengths, only pair up as many items as the shorter list allows.

### Expected function

```python
def pair_up(names: list, scores: list) -> list:
    # Your code here
    pass
```

### Examples

- `pair_up(["Ada", "Grace"], [95, 88])` returns `["Ada:95", "Grace:88"]`
- `pair_up(["A"], [1, 2, 3])` returns `["A:1"]` (stops at the shorter list)

### Why this matters

`zip()` shows up constantly whenever you''re processing two (or more) related sequences together — combining column data, matching keys to values before building a dictionary, or comparing two versions of the same list element by element.',
	param_names = '{}'
WHERE slug = 'python-intermediate-pair-up';
UPDATE problems SET
	statement = 'This exercise introduces **object-oriented programming (OOP)** in Python — organizing code around **classes**, which are blueprints for creating objects that bundle together both data and the behavior that acts on that data.

Write a function **`create_person_greeting(name, age)`** that defines a `Person` class with an `__init__` method (which stores `name` and `age`) and a `greet()` method (which returns a greeting sentence using those stored values), then creates a `Person` instance and returns the result of calling `greet()` on it.

### Expected function

```python
def create_person_greeting(name: str, age: int) -> str:
    # Your code here
    pass
```

### Examples

- `create_person_greeting("Jerry", 28)` returns `"Hi, I''m Jerry and I''m 28 years old."`
- `create_person_greeting("Ada", 36)` returns `"Hi, I''m Ada and I''m 36 years old."`

### Why this matters

Classes are the foundation of object-oriented Python, and they''re everywhere in real code — from Django models to the exceptions you''ll define later in this track. Understanding `__init__`, `self`, and instance methods is the single biggest unlock for reading and writing intermediate Python.',
	param_names = '{}'
WHERE slug = 'python-intermediate-person-greeting';
UPDATE problems SET
	statement = '
Write a function that returns a list of every prime number from 2 up to and including `n`, using a generator function that implements the Sieve of Eratosthenes.

### Expected function

```python
def primes_up_to_n(n: int) -> list:
    # Your code here
    pass
```

### Examples

- `primes_up_to_n(10)` returns `[2, 3, 5, 7]`
- `primes_up_to_n(1)` returns `[]`

### Why this matters

The sieve is dramatically faster than checking every number individually for primality (the trial-division approach you may have written earlier in the Go curriculum) — it finds every prime up to a limit in roughly `O(n log log n)` time by eliminating multiples in bulk, rather than testing each candidate from scratch. Combining it with a generator ties together this entire track''s themes: efficient algorithms, and Python''s lazy-evaluation tools.',
	param_names = '{}'
WHERE slug = 'python-intermediate-primes-up-to-n';
UPDATE problems SET
	statement = 'You''ve used `sum()` to add up a list. **`functools.reduce()`** generalizes that idea to *any* combining operation, not just addition — repeatedly applying a function to collapse an entire sequence down into one final value.

Write a function **`product_of_list(nums)`** that returns the product of every number in `nums` (multiplied together), using `functools.reduce`. An empty list should return `1`, matching the mathematical convention that an empty product equals 1.

### Expected function

```python
def product_of_list(nums: list) -> int:
    # Your code here
    pass
```

### Examples

- `product_of_list([1, 2, 3, 4])` returns `24`
- `product_of_list([])` returns `1`

### Why this matters

`reduce()` is the most general of Python''s functional-programming tools — `sum()`, and even (in spirit) `max()` and `min()`, are really just specific, common cases of the same underlying reduce-a-sequence-to-one-value idea. Recognizing that pattern helps you spot when `reduce()` is the right tool for a problem that doesn''t have its own dedicated built-in function.',
	param_names = '{}'
WHERE slug = 'python-intermediate-product-of-list';
UPDATE problems SET
	statement = 'Building on the previous exercise, a class''s methods don''t just have to report back stored data — they can **compute** new values from it, on demand.

Write a function **`compute_rectangle_area(width, height)`** that defines a `Rectangle` class (storing `width` and `height` in `__init__`) with an `area()` method that computes and returns the rectangle''s area, then creates a `Rectangle` instance and returns the result of calling `area()` on it.

### Expected function

```python
def compute_rectangle_area(width: int, height: int) -> int:
    # Your code here
    pass
```

### Examples

- `compute_rectangle_area(4, 5)` returns `20`
- `compute_rectangle_area(1, 1)` returns `1`

### Why this matters

This pattern — attributes storing raw data, methods computing derived values from that data on demand — is at the heart of good object-oriented design. It keeps related data and the logic that operates on it in one place, instead of scattered across separate variables and standalone functions.',
	param_names = '{}'
WHERE slug = 'python-intermediate-rectangle-area-class';
UPDATE problems SET
	statement = 'You''ve used `with` statements before (for example, when opening files in other languages or tutorials) without necessarily seeing how they work under the hood. A **context manager** is any object that defines `__enter__` and `__exit__`, making it usable in a `with` block — guaranteeing cleanup code runs even if something goes wrong inside.

Write a function **`simulate_resource_usage(shouldFail)`** that defines a `Resource` class implementing `__enter__` and `__exit__`, uses it in a `with` block that deliberately raises an error when `shouldFail` is `True`, and returns a status string describing what happened — the `__exit__` method should catch and suppress that error so the function itself doesn''t crash.

### Expected function

```python
def simulate_resource_usage(shouldFail: bool) -> str:
    # Your code here
    pass
```

### Examples

- `simulate_resource_usage(False)` returns `"opened and closed successfully"`
- `simulate_resource_usage(True)` returns `"opened, error occurred, closed safely"`

### Why this matters

This is exactly the mechanism behind `with open("file.txt") as f:` — the file''s context manager guarantees the file gets closed in `__exit__`, whether the code inside the block finished normally or crashed partway through. Understanding this pattern demystifies one of Python''s most-used features.',
	param_names = '{}'
WHERE slug = 'python-intermediate-resource-context-manager';
UPDATE problems SET
	statement = '**Inheritance** is a fundamental object-oriented programming (OOP) concept that allows one class to inherit attributes and methods from another. 

This promotes **code reuse**, reduces duplication, and makes it easier to organize related classes that share common behavior.

In this challenge, your task is to create a base **`Shape`** class and define three subclasses: **`Square`**, **`Rectangle`**, and **`Triangle`**. Each subclass should provide its own implementation of the **`area()`** method using the appropriate formula for that shape.

Based on the provided `shapeType`, create an instance of the corresponding subclass and return the result of calling its **`area()`** method. If the given shape type is not recognized, your function should return `-1`.

This exercise also introduces **polymorphism**, where different objects respond to the same method call in their own way. 
Regardless of which shape is created, your code should calculate its area by calling the same **`area()`** method, allowing the correct implementation to be selected automatically.

This exercise reinforces several important programming concepts:

- Creating classes and **subclasses** using inheritance.
- Overriding methods to provide specialized behavior.
- Using **polymorphism** to write flexible and reusable code.
- Selecting and instantiating objects based on runtime input.
- Applying object-oriented design principles to solve real-world problems.

Inheritance and polymorphism are core principles of object-oriented programming and are widely used to build scalable, maintainable, and extensible software systems.',
	param_names = '{}'
WHERE slug = 'python-intermediate-shape-area-oop';
UPDATE problems SET
	statement = '
Write a function that pairs up each name with its corresponding age (matched by position), sorts the people primarily by age (youngest first) and uses alphabetical name order to break ties, and returns just the names in that sorted order.
',
	param_names = '{}'
WHERE slug = 'python-intermediate-sort-people';
UPDATE problems SET
	statement = 'Generators provide an efficient way to produce values **one at a time** instead of creating and storing an entire collection in memory. 
They are commonly used when working with sequences that can be processed incrementally.

In this challenge, your task is to define a **generator function** that yields the square of every whole number from `1` up to and including `n`.
Once the generator has produced all of its values, calculate and return the sum of the generated squares.

Your function should return the total of all squared values produced by the generator.

This exercise reinforces several important programming concepts:

- Defining and using **generator functions**.
- Producing values with the `yield` keyword.
- Iterating over generated sequences.
- Combining generated values into a single result through accumulation.

Generators are a powerful feature of Python that enable memory-efficient data processing and are widely used for streaming data, large datasets, and lazy evaluation.',
	param_names = '{}'
WHERE slug = 'python-intermediate-sum-of-squares-generator';
UPDATE problems SET
	statement = 'A **set** in Python is an unordered collection of unique values — it automatically removes duplicates and supports fast membership testing and mathematical operations like union and intersection.

Write a function **`unique_common_elements(a, b)`** that returns a list of the distinct values that appear in **both** `a` and `b`, sorted in ascending order, using set operations rather than nested loops.

### Expected function

```python
def unique_common_elements(a: list, b: list) -> list:
    # Your code here
    pass
```

### Examples

- `unique_common_elements([1, 2, 2, 3], [2, 3, 3, 4])` returns `[2, 3]`
- `unique_common_elements([1, 2], [3, 4])` returns `[]`

### Why this matters

Sets are one of Python''s most underused data structures by beginners, but they''re exactly the right tool whenever you care about **membership** (''is this value present?'') or **uniqueness** (''give me every distinct value''), and they''re dramatically faster than lists for both.',
	param_names = '{}'
WHERE slug = 'python-intermediate-unique-common-elements';
UPDATE problems SET
	statement = 'A **decorator** is one of Python''s most powerful features: a function that takes another function as input and returns a modified version of it, adding new behavior without changing the original function''s own code.

Write a function **`apply_uppercase_decorator(name)`** that defines a decorator `uppercase_result`, which wraps any function so that its return value is automatically converted to uppercase, applies it to a small `greet(n)` function using the `@` syntax, and returns the result of calling the decorated `greet(name)`.

### Expected function

```python
def apply_uppercase_decorator(name: str) -> str:
    # Your code here
    pass
```

### Examples

- `apply_uppercase_decorator("jerry")` returns `"HELLO, JERRY"`
- `apply_uppercase_decorator("Ada")` returns `"HELLO, ADA"`

### Why this matters

Decorators are everywhere in real Python code — from Flask''s `@app.route(...)` to `@property` and `@staticmethod` in classes to `@functools.lru_cache` used later in this track. Understanding how a decorator wraps a function is the key to understanding all of them.',
	param_names = '{}'
WHERE slug = 'python-intermediate-uppercase-decorator';
UPDATE problems SET
	statement = 'Python allows you to create **custom exceptions** by defining your own exception classes. 
Custom exceptions make your code more expressive by allowing you to represent specific error conditions that are unique to your application.

In this challenge, your task is to define a custom exception named **`NegativeValueError`**. When a helper function receives a negative number, it should raise this exception. 
Use a **`try`/`except`** block to catch the exception and return the appropriate result based on whether an error occurred.

Your function should return `"valid"` if the input is non-negative, or `"invalid"` if the custom exception is raised.

This exercise reinforces several important programming concepts:

- Creating **custom exception classes** by inheriting from `Exception`.
- Raising exceptions with the **`raise`** statement.
- Handling exceptions using **`try`** and **`except`**.
- Separating normal program flow from error-handling logic.

Custom exceptions are widely used in professional software development to make programs easier to debug, improve code readability, and provide meaningful error messages that accurately describe specific failure conditions.',
	param_names = '{}'
WHERE slug = 'python-intermediate-validate-positive';
