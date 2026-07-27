-- Generated: 2026-07-27 06:01:34
-- Module: python-intermediate
-- Problems: 30

UPDATE problems SET
	statement = 'Functions in Python can carry hidden state with them through a powerful mechanism known as **closures**. When an inner function references a variable from its enclosing scope, that variable persists across calls, even after the outer function has finished executing.

In this challenge, your task is to create a closure-based bank account. The outer function should initialize a private `balance` variable at `0`. It should return two inner functions:

- **`deposit(amount)`** — adds the given amount to the balance.
- **`get_balance()`** — returns the current balance.

The balance must remain **private** — it should not be accessible as a global variable or attribute, only through the two returned functions.

For example:

- After depositing `100` and then `50`, calling **`get_balance()`** returns **`150`**.
- A new account with no deposits returns **`0`**.

Your function should return a **tuple** containing the two inner functions `(deposit, get_balance)`.

This exercise reinforces several important programming concepts:

- Creating **closures** that retain access to enclosing scope variables.
- Using the **`nonlocal`** keyword to modify outer variables from within an inner function.
- Implementing **private state** that can only be modified through controlled interfaces.
- Returning multiple functions from a single function call.

Closures are widely used in Python for data encapsulation, decorators, callbacks, and many other patterns where functions need to remember contextual information.'
WHERE slug = 'py-inter-bank-account';
UPDATE problems SET
	statement = 'Data often arrives in nested structures — lists containing other lists, which may themselves contain more lists. Processing such structures requires an approach that can handle **arbitrary levels of nesting**.

In this challenge, your task is to flatten a nested list into a single-level list containing every non-list element in their original order.

The nesting can be arbitrarily deep, meaning a list may contain lists that contain lists, and so on.

For example:

- **`[1, [2, [3, 4], 5], 6]`** becomes **`[1, 2, 3, 4, 5, 6]`**.
- A list with **no nesting**, such as `[1, 2, 3]`, remains **`[1, 2, 3]`**.
- An **empty list** returns **`[]`**.

Your function should return a **new flat list** with all nested levels collapsed into one.

This exercise reinforces several important programming concepts:

- Using **recursion** to process structures of unknown depth.
- Identifying **base cases** that stop the recursion.
- Distinguishing between **lists** and non-list values using **`isinstance`**.
- Building a result list by combining recursive and direct results.

Recursive flattening is a fundamental technique used in processing JSON data, handling tree structures, parsing configuration files, and many other real-world applications where data is naturally nested.',
	param_names = '{nested}'
WHERE slug = 'py-inter-flatten-list';
UPDATE problems SET
	statement = 'Functional programming techniques allow you to process collections of data by composing operations rather than writing explicit loops.

In this challenge, your task is to process a list of integers using `filter()` and `map()` with **lambda functions**:

1. **Filter** out any numbers that are negative or divisible by 3.
2. **Map** the remaining numbers to their squares.
3. Return the result as a new list, preserving the original order.

For example:

- **`[1, 2, 3, 4, 5, 6]`** — `3` and `6` are divisible by 3 (removed); `1, 2, 4, 5` remain and become **`[1, 4, 16, 25]`**.
- **`[-1, 2, -3, 4]`** — `-1` and `-3` are negative (removed); `2` and `4` become **`[4, 16]`**.

Your function should return the **new transformed list**.

This exercise reinforces several important programming concepts:

- Creating anonymous functions with **`lambda`**.
- Using **`filter()`** to select elements that satisfy a condition.
- Using **`map()`** to transform selected elements.
- Chaining functional operations for clean, expressive data processing.

The combination of `filter()`, `map()`, and lambda functions is a common functional programming pattern used in data processing pipelines, event-driven systems, and many other contexts where collections must be transformed declaratively rather than with explicit loops.',
	param_names = '{nums}'
WHERE slug = 'py-inter-map-filter';
UPDATE problems SET
	statement = 'A naive recursive Fibonacci function is extremely inefficient because it recomputes the same values many times. For example, computing `fib(5)` calls `fib(3)` multiple times through different recursive branches, wasting effort on identical work.

In this challenge, your task is to implement the Fibonacci sequence using **recursion with memoization**. Memoization caches the result of each Fibonacci calculation the first time it is computed, so any subsequent request for the same value is an instant dictionary lookup instead of a full recomputation.

The sequence is **zero-indexed**: `fib(0) == 0`, `fib(1) == 1`.

For example:

- **`fib_memo(0)`** returns **`0`**.
- **`fib_memo(1)`** returns **`1`**.
- **`fib_memo(10)`** returns **`55`**.
- **`fib_memo(30)`** returns **`832040`** (still fast, thanks to memoization).

Your function should return the **n-th Fibonacci number**.

This exercise reinforces several important programming concepts:

- Understanding the performance problems of **naive recursion**.
- Using a **cache** (dictionary) to store previously computed results.
- Checking the cache before performing recursive work.
- Transforming an exponential-time algorithm into a linear-time one.

Memoization is one of the most impactful optimizations in computer science and forms the foundation of **dynamic programming**. Python even provides a built-in decorator, `functools.lru_cache`, that adds memoization to any function automatically.',
	param_names = '{n}'
WHERE slug = 'py-inter-memoized-fib';
UPDATE problems SET
	statement = 'Dictionaries are often combined when aggregating data from multiple sources. When the same key appears in both dictionaries, the values must be merged rather than simply overwritten.

In this challenge, your task is to merge two dictionaries. When both dictionaries contain the same key, the merged result should contain the **sum** of their values for that key. Keys that appear in only one dictionary should keep their original value.

The original dictionaries must not be modified; the function should create and return a **new dictionary**.

For example:

- Merging **`{"a": 1, "b": 2}`** with **`{"b": 3, "c": 4}`** produces **`{"a": 1, "b": 5, "c": 4}`**.
- Merging **`{"x": 10}`** with an **empty dictionary** produces **`{"x": 10}`**.

Your function should return the **merged dictionary** with summed values for shared keys.

This exercise reinforces several important programming concepts:

- Working with **dictionaries** and key-value pairs.
- Iterating over dictionary items using **`.items()`**.
- Checking for key existence and combining values.
- Avoiding mutation of input data by creating a **new dictionary**.

Dictionary merging with custom conflict resolution is a common operation in data aggregation, configuration management, event processing, and many other applications where information from multiple sources needs to be combined.',
	param_names = '{dict_a,dict_b}'
WHERE slug = 'py-inter-merge-dicts';
UPDATE problems SET
	statement = 'Python''s built-in `range()` function is a powerful tool for generating sequences of numbers. But have you ever wondered how it works under the hood?

In this challenge, your task is to implement your own version of `range()` using a **generator function** with `yield`. Your generator should produce numbers starting from `start`, incrementing by `step`, up to (but not including) `stop`.

If `step` is positive and `start >= stop`, the generator should yield no values. If `step` is negative and `start <= stop`, it should also yield nothing.

For example:

- **`list(my_range(1, 5, 1))`** produces **`[1, 2, 3, 4]`**.
- **`list(my_range(5, 1, -1))`** produces **`[5, 4, 3, 2]`**.
- **`list(my_range(0, 3, 5))`** produces **`[0]`**.

Your function should be a **generator** that yields each value one at a time.

This exercise reinforces several important programming concepts:

- Defining **generator functions** using `yield`.
- Understanding how generators produce values **lazily**.
- Handling different **step directions** (positive and negative).
- Implementing the same logic as a built-in Python function.

Generators are a fundamental part of Python''s iteration system and are used extensively in data streaming, file processing, and any scenario where memory-efficient production of sequences is required.',
	param_names = '{start,stop,step}'
WHERE slug = 'py-inter-range-generator';
UPDATE problems SET
	statement = 'Manipulating text at the **word level** is a common task in natural language processing, text formatting, and data transformation.

In this challenge, your task is to reverse the **order of the words** in a sentence while keeping each word itself intact and in its original casing.

For example:

- **`"hello world"`** reversed becomes **`"world hello"`**.
- **`"Python is fun"`** reversed becomes **`"fun is Python"`**.
- A **single word** like **`"a"`** remains **`"a"`**.

Your function should return the **reversed sentence** as a single string with words separated by spaces.

This exercise reinforces several important programming concepts:

- **Splitting** a string into a list of words.
- **Reversing** the order of elements in a list.
- **Joining** a list of words back into a single string.
- Manipulating text at the word level rather than the character level.

Reversing the order of words in a sentence is a classic interview problem that demonstrates your understanding of string splitting, list manipulation, and joining techniques.',
	param_names = '{sentence}'
WHERE slug = 'py-inter-reverse-words';
UPDATE problems SET
	statement = 'Sets in Python support powerful mathematical operations that make it easy to compare collections of data.

In this challenge, your task is to compute four set operations on two lists and return the results as a dictionary:

- **`"union"`**: all unique elements from both lists combined.
- **`"intersection"`**: elements present in both lists.
- **`"difference_a"`**: elements in `list_a` but not in `list_b`.
- **`"difference_b"`**: elements in `list_b` but not in `list_a`.

All result lists should be **sorted in ascending order**.

For example:

- For **`[1, 2, 3]`** and **`[2, 3, 4]`**: union is `[1, 2, 3, 4]`, intersection is `[2, 3]`, difference_a is `[1]`, difference_b is `[4]`.
- For **`[1, 1, 2]`** and **`[3, 4]`**: union is `[1, 2, 3, 4]`, intersection is `[]`, difference_a is `[1, 2]`, difference_b is `[3, 4]`.

Your function should return a **dictionary** with the four keys described above.

This exercise reinforces several important programming concepts:

- Converting lists to **sets** for efficient comparison.
- Using set operators: **`|`** (union), **`&`** (intersection), **`-`** (difference).
- Converting sets back to **sorted lists**.
- Organizing multiple related results into a **structured return value**.

Set operations are essential in data analysis, database queries, access control systems, and any application where comparing collections of items is required.',
	param_names = '{list_a,list_b}'
WHERE slug = 'py-inter-set-operations';
UPDATE problems SET
	statement = 'Python''s ability to treat functions as **first-class objects** means you can pass them to other functions, return them, and assign them to variables. A **decorator** is a function that takes a function as input and returns a new, enhanced version of it.

In this challenge, your task is to create a decorator function `make_bold(func)` that wraps any function so that its return value is wrapped in HTML bold tags.

The wrapper should:
1. Call the original function.
2. Capture its return value.
3. Return the value wrapped in `<b>` and `</b>` tags.

You do not need to use the `@` syntax — simply call `make_bold` on a function and then call the result.

For example:

- Applying `make_bold` to a lambda that returns **`"hello"`** produces **`"<b>hello</b>"`**.
- Applying it to a lambda that returns **`"test"`** produces **`"<b>test</b>"`**.

Your function should return the **wrapped result** as a string with bold tags.

This exercise reinforces several important programming concepts:

- Understanding that functions are **first-class objects**.
- Creating a **wrapper function** inside another function.
- Calling the original function from within the wrapper.
- Modifying the return value of a function without altering its code.

Decorators are a fundamental Python feature used extensively in web frameworks (Flask, Django), logging, access control, caching, and many other cross-cutting concerns.',
	param_names = '{func}'
WHERE slug = 'py-inter-simple-decorator';
UPDATE problems SET
	statement = 'Converting text to title case (capitalizing the first letter of each word) is a common formatting operation. However, real title case rules have exceptions — certain short words like articles and prepositions should remain lowercase unless they appear at the beginning or end of the title.

In this challenge, your task is to convert a string to title case, except for words that appear in a provided `exceptions` list. Those exception words should remain entirely in lowercase, unless they are the **first** or **last** word of the title, in which case they must always be capitalized.

For example:

- **`"the lord of the rings"`** with exceptions `["the", "of"]` becomes **`"The Lord of the Rings"`**.
- **`"a tale of two cities"`** with exceptions `["a", "of"]` becomes **`"A Tale of Two Cities"`**.
- With an **empty exceptions list**, every word is capitalized: **`"To Kill A Mockingbird"`**.

Your function should return the **formatted title string**.

This exercise reinforces several important programming concepts:

- **Splitting** strings into words for individual processing.
- Applying **conditional formatting** based on word position.
- Using a **set** for fast exception lookup.
- Handling special rules for first and last words.
- Building a properly formatted result string.

Title case conversion with exceptions is a practical real-world problem encountered in content management systems, publishing platforms, bibliography tools, and any application that formats titles according to style guides.',
	param_names = '{title,exceptions}'
WHERE slug = 'py-inter-title-case';
UPDATE problems SET
	statement = 'Python''s **`itertools`** module provides a collection of efficient tools for working with iterators and sequences. 
These utilities make it easy to solve common iteration problems without implementing the underlying algorithms yourself.

In this challenge, your task is to use **`itertools.combinations`** to determine how many unique ways there are to choose `k` items from a list. Since combinations are **order-independent**, selecting `(1, 2)` is considered the same as selecting `(2, 1)`, and each element in the list can only be selected once.

For example:

- **Calling ** returns ****, representing the six unique pairs that can be formed from four items.
- **Calling ** returns ****, since choosing one item from three gives three possibilities.
- **Calling ** returns ****, because there is no way to choose five items from a list of only two.

Your function should return the total number of distinct combinations that can be formed.

This exercise reinforces several important programming concepts:

- Importing and using functions from Python''s **standard library**.
- Working with **iterators** and lazy evaluation.
- Understanding the concept of **combinations**, where order does not matter.
- Leveraging built-in tools to write clean, efficient, and idiomatic Python code.

The `itertools` module is widely used in data analysis, algorithm design, and combinatorial problems, making it an essential part of every Python developer''s toolkit.',
	param_names = '{nums,k}'
WHERE slug = 'python-intermediate-count-combinations';
UPDATE problems SET
	statement = 'Python''s **`lambda`** keyword allows you to create small, anonymous functions without using the `def` keyword. 
These functions are commonly used when a short, one-time function is needed, especially when working with higher-order functions such as **`map()`**.

In this challenge, your task is to use a **`lambda`** function together with **`map()`** to create a new list in which every number has been doubled. Your solution should avoid using an explicit loop or a list comprehension.

Your function should return a **new list** containing the transformed values while leaving the original list unchanged.

For example:

- **Calling ** returns ****, with every element doubled.
- **Calling ** returns ****, producing an empty list from an empty input.

This exercise reinforces several important programming concepts:

- Creating anonymous functions with **`lambda`**.
- Using **`map()`** to apply a function to every element of a sequence.
- Transforming data without modifying the original collection.
- Writing concise and idiomatic Python code using functional programming techniques.

The combination of `lambda` and `map()` is a common pattern in Python that enables clean, expressive solutions for applying simple transformations to collections of data.',
	param_names = '{nums}'
WHERE slug = 'python-intermediate-double-with-lambda';
UPDATE problems SET
	statement = 'Python''s **`re`** module provides support for **regular expressions (regex)**, a powerful way to search, match, and extract text based on patterns. 
Regular expressions allow you to locate specific types of characters or text without manually inspecting each character in a string.

In this challenge, your task is to use the **`re`** module to extract every **digit** from a given string. The extracted digits should remain in their original order and be combined into a single string.

Your function should return a string containing only the digit characters found in the input. If the string contains no digits, return an empty string.

For example:

- **Calling ** returns ****, extracting only the digit characters in order.
- **Calling ** returns ****, since there are no digits to extract.

This exercise reinforces several important programming concepts:

- Using Python''s **`re`** module for pattern matching.
- Extracting specific characters from a larger body of text.
- Working with strings and regular expressions.
- Leveraging built-in libraries to solve text-processing problems efficiently.

Regular expressions are widely used in software development for parsing logs, validating user input, processing documents, and extracting structured information from unstructured text.',
	param_names = '{s}'
WHERE slug = 'python-intermediate-extract-digits';
UPDATE problems SET
	statement = 'Every `for` loop in Python works because the thing being looped over implements a specific protocol. Understanding this protocol reveals how Python''s entire iteration system works under the hood.

In this challenge, your task is to implement a **custom iterator class** that produces Fibonacci numbers. Define a `FibonacciIterator` class that implements the iterator protocol:

- **`__iter__`** — returns the iterator object itself.
- **`__next__`** — returns the next Fibonacci number in the sequence (`0, 1, 1, 2, 3, 5, ...`), one at a time, and raises `StopIteration` when `n` values have been produced.

The function `generate_fibonacci_sequence(n)` should create an instance of this iterator and collect all produced values into a list.

For example:

- **`generate_fibonacci_sequence(5)`** returns **`[0, 1, 1, 2, 3]`**.
- **`generate_fibonacci_sequence(0)`** returns **`[]`**.

This exercise reinforces several important programming concepts:

- Defining a class that implements the **iterator protocol**.
- Understanding the roles of **`__iter__`** and **`__next__`**.
- Using **`StopIteration`** to signal the end of iteration.
- Maintaining **state** between successive calls to `__next__`.

Every iterable in Python — lists, strings, ranges, dictionaries — works because it implements this exact protocol. Building a custom iterator from scratch demystifies how Python''s `for` loops actually operate.',
	param_names = '{n}'
WHERE slug = 'python-intermediate-fibonacci-iterator-class';
UPDATE problems SET
	statement = 'A plain recursive Fibonacci function becomes extremely slow for larger inputs because it recomputes the same values over and over. **Memoization** — caching results that have already been computed — fixes this by ensuring no Fibonacci value is ever calculated more than once.

In this challenge, your task is to implement the Fibonacci sequence using recursion combined with a memoization cache (a dictionary that stores results already computed).

The sequence is **zero-indexed**: `fib(0) == 0`, `fib(1) == 1`.

For example:

- **`fibonacci_memoized(10)`** returns **`55`**.
- **`fibonacci_memoized(30)`** returns **`832040`** (still fast, thanks to memoization).

Your function should return the **n-th Fibonacci number**.

This exercise reinforces several important programming concepts:

- Recognizing the **performance problem** with naive recursion.
- Using a **cache dictionary** to store and retrieve computed results.
- Checking the cache before performing recursive work.
- Understanding how memoization turns exponential time into linear time.

Memoization is one of the most impactful optimizations in programming. It is the foundation of **dynamic programming**, and Python even includes a built-in decorator, `functools.lru_cache`, that adds memoization to any function automatically.',
	param_names = '{n}'
WHERE slug = 'python-intermediate-fibonacci-memoized';
UPDATE problems SET
	statement = 'Data doesn''t always come in a neat, flat structure. JSON documents, file system trees, HTML structures, and abstract syntax trees are all naturally **nested**, and the nesting depth is rarely known in advance.

In this challenge, your task is to flatten an arbitrarily nested list structure into a single flat list containing every non-list value, in their original left-to-right order.

Use **recursion** to handle any depth of nesting. When you encounter a nested list, flatten it first and then merge its contents into the overall result. When you encounter a non-list value, simply include it directly.

For example:

- **`[1, [2, 3], [4, [5, 6]]]`** becomes **`[1, 2, 3, 4, 5, 6]`**.
- An **empty list** returns **`[]`**.

Your function should return a **new flat list** with all nesting removed.

This exercise reinforces several important programming concepts:

- Using **recursion** to process data of unknown depth.
- Distinguishing between **lists** and atomic values with **`isinstance`**.
- Combining recursive results using **`extend`** vs **`append`**.
- Building a flat result from a hierarchical structure.

Recursive flattening is a fundamental technique used in processing JSON data, navigating file systems, parsing markup languages, and any application that handles hierarchical or nested data structures.',
	param_names = '{nested}'
WHERE slug = 'python-intermediate-flatten-nested-list';
UPDATE problems SET
	statement = 'When looping over a list, you often need to know the **position** of each item, not just its value. Python''s `enumerate()` function solves this cleanly by producing a sequence of `(index, value)` pairs.

In this challenge, your task is to use `enumerate()` to create a new list where each element of the input has been turned into a string of the form `"<index>:<word>"`, using **0-based indexing**.

For example:

- **`["apple", "banana", "cherry"]`** becomes **`["0:apple", "1:banana", "2:cherry"]`**.
- An **empty list** returns **`[]`**.

Your function should return the **new list** of formatted strings.

This exercise reinforces several important programming concepts:

- Using **`enumerate()`** to access both index and value in a loop.
- Formatting strings with **f-strings**.
- Building a new list from a transformation of an existing one.
- Writing idiomatic Python that replaces manual counter tracking.

`enumerate()` is the standard, Pythonic way to loop with an index, replacing the older pattern of manually maintaining a counter variable. It is used constantly in real codebases for cleaner and less error-prone iteration.',
	param_names = '{words}'
WHERE slug = 'python-intermediate-indexed-items';
UPDATE problems SET
	statement = 'Counting how often items occur is such a common task that Python''s standard library includes a purpose-built tool for it: **`collections.Counter`**, a specialized dictionary that tallies occurrences automatically.

In this challenge, your task is to use `collections.Counter` to find the most frequently occurring word in a list. If there is a tie, return whichever of the tied words appears **first** in the original list.

For example:

- In **`["a", "b", "a", "c", "a"]`**, the word **`"a"`** appears 3 times and is the most common.
- In **`["x", "y", "y", "x"]`**, both `"x"` and `"y"` appear twice, but **`"x"`** appears first, so it is returned.

Your function should return the **most common word** as a string.

This exercise reinforces several important programming concepts:

- Using **`collections.Counter`** for frequency counting.
- Using the **`.most_common()`** method to find the top element.
- Understanding tie-breaking rules for frequency-based selection.
- Leveraging Python''s standard library instead of writing manual counting code.

`Counter` replaces the manual pattern of maintaining a dictionary and incrementing counts yourself. It is considered standard, idiomatic Python whenever you need frequency counts.',
	param_names = '{words}'
WHERE slug = 'python-intermediate-most-common-word';
UPDATE problems SET
	statement = 'It is common to have two related lists that line up position by position — a list of names and a matching list of scores, for example. Python''s **`zip()`** function makes it easy to walk through both together without manual indexing.

In this challenge, your task is to pair up two lists and combine each pair into a formatted string `"<name>:<score>"`.

If the two lists have different lengths, only pair up as many items as the **shorter** list allows — any extra items in the longer list should be ignored.

For example:

- **`["Ada", "Grace"]`** and **`[95, 88]`** produces **`["Ada:95", "Grace:88"]`**.
- **`["A"]`** and **`[1, 2, 3]`** produces **`["A:1"]`** (stops at the shorter list).

Your function should return a **new list** of formatted strings.

This exercise reinforces several important programming concepts:

- Using **`zip()`** to iterate over multiple sequences simultaneously.
- Understanding that `zip()` stops at the **shortest** input.
- Handling lists of **different lengths** gracefully.
- Combining data from parallel lists into formatted output.

`zip()` appears constantly whenever you need to process two or more related sequences together — combining column data, matching keys to values, or comparing elements position by position.',
	param_names = '{names,scores}'
WHERE slug = 'python-intermediate-pair-up';
UPDATE problems SET
	statement = 'This exercise introduces **object-oriented programming (OOP)** in Python — organizing code around **classes**, which are blueprints for creating objects that bundle together both data and the behavior that operates on that data.

In this challenge, your task is to define a `Person` class with an **`__init__`** method that stores `name` and `age`, and a **`greet()`** method that returns a greeting sentence using those stored values.

Create a `Person` instance and return the result of calling its `greet()` method.

For example:

- A person named **`"Jerry"`** aged **`28`** returns **`"Hi, I''m Jerry and I''m 28 years old."`**.
- A person named **`"Ada"`** aged **`36`** returns **`"Hi, I''m Ada and I''m 36 years old."`**.

This exercise reinforces several important programming concepts:

- Defining a **class** with the `class` keyword.
- Understanding the **`__init__`** constructor method.
- Using **`self`** to refer to the current instance.
- Creating **instance methods** that access stored attributes.
- **Instantiating** an object from a class blueprint.

Classes are the foundation of object-oriented Python and appear everywhere in real code — from web framework models to data structures. Understanding `__init__`, `self`, and instance methods is the single biggest unlock for reading and writing intermediate Python.',
	param_names = '{name,age}'
WHERE slug = 'python-intermediate-person-greeting';
UPDATE problems SET
	statement = 'Finding all prime numbers up to a limit is a classic problem in computer science. The **Sieve of Eratosthenes** is one of the most efficient algorithms for this task, finding every prime up to `n` in roughly **O(n log log n)** time by eliminating multiples in bulk rather than testing each candidate individually.

In this challenge, your task is to implement the Sieve of Eratosthenes as a **generator function** using `yield`, and return every prime number from `2` up to and including `n` as a list.

The algorithm works by:
1. Creating a boolean array marking all numbers from `2` to `n` as potential primes.
2. Starting from `2`, marking all multiples of each prime as non-prime.
3. Yielding each number that remains unmarked as a prime.

For example:

- **`primes_up_to_n(10)`** returns **`[2, 3, 5, 7]`**.
- **`primes_up_to_n(1)`** returns **`[]`** (no primes less than 2).

This exercise reinforces several important programming concepts:

- Implementing the **Sieve of Eratosthenes** algorithm.
- Using a **generator function** with `yield` to produce values lazily.
- Optimizing by starting the marking process from `i * i`.
- Understanding why the sieve is dramatically faster than trial division.

Prime sieves are a fundamental algorithmic technique used in number theory, cryptography, and many mathematical computing applications.',
	param_names = '{n}'
WHERE slug = 'python-intermediate-primes-up-to-n';
UPDATE problems SET
	statement = 'You have used `sum()` to add up a list. **`functools.reduce()`** generalizes that idea to any combining operation, not just addition — it repeatedly applies a function to collapse an entire sequence down into a single final value.

In this challenge, your task is to use `functools.reduce()` to compute the product of every number in a list (all multiplied together).

An empty list should return `1`, matching the mathematical convention that an empty product equals `1`.

For example:

- **`[1, 2, 3, 4]`** multiplied together equals **`24`**.
- An **empty list** returns **`1`**.

Your function should return the **product** of all numbers in the list.

This exercise reinforces several important programming concepts:

- Understanding how **`reduce()`** accumulates a result across a sequence.
- Using **`lambda`** functions with `reduce()`.
- Specifying an **initial value** for the accumulator.
- Recognizing the pattern of collapsing a sequence into a single value.

`reduce()` is the most general of Python''s functional programming tools — `sum()`, `max()`, and `min()` are really just specific cases of the same underlying pattern. Recognizing this pattern helps you spot when `reduce()` is the right tool for a problem that doesn''t have its own dedicated built-in function.',
	param_names = '{nums}'
WHERE slug = 'python-intermediate-product-of-list';
UPDATE problems SET
	statement = 'A class''s methods can do more than simply report stored data back — they can **compute** new values from that data on demand.

In this challenge, your task is to define a `Rectangle` class that stores `width` and `height` in `__init__`, with an **`area()`** method that computes and returns the rectangle''s area (`width × height`).

Create a `Rectangle` instance and return the result of calling its `area()` method.

For example:

- A rectangle with width **`4`** and height **`5`** has an area of **`20`**.
- A rectangle with width **`1`** and height **`1`** has an area of **`1`**.

This exercise reinforces several important programming concepts:

- Defining a class with **attributes** stored in `__init__`.
- Creating **methods** that compute values from instance data.
- Understanding the difference between stored data and computed results.
- Building reusable objects with built-in behavior.

This pattern — attributes storing raw data, methods computing derived values from that data on demand — is at the heart of good object-oriented design. It keeps related data and the logic that operates on it in one place, instead of scattered across separate variables and standalone functions.',
	param_names = '{width,height}'
WHERE slug = 'python-intermediate-rectangle-area-class';
UPDATE problems SET
	statement = 'The `with` statement in Python is used to ensure that resources are properly managed — opened, used, and then cleaned up, even if an error occurs. This pattern is powered by **context managers**, objects that define `__enter__` and `__exit__` methods.

In this challenge, your task is to define a `Resource` class that implements `__enter__` and `__exit__`, use it in a `with` block that deliberately raises an error when `shouldFail` is `True`, and have the `__exit__` method catch and suppress that error so the function itself does not crash.

Your function should return a status string:

- If no error occurs: **`"opened and closed successfully"`**
- If an error occurs and is handled: **`"opened, error occurred, closed safely"`**

This exercise reinforces several important programming concepts:

- Implementing **`__enter__`** and **`__exit__`** methods.
- Understanding how the `with` statement manages resources.
- Handling exceptions inside **`__exit__`**.
- Returning `True` from `__exit__` to suppress exceptions.

This is exactly the mechanism behind `with open("file.txt") as f:` — the file''s context manager guarantees the file is closed in `__exit__`, whether the code inside the block finished normally or crashed partway through. Understanding this pattern demystifies one of Python''s most commonly used features.',
	param_names = '{shouldFail}'
WHERE slug = 'python-intermediate-resource-context-manager';
UPDATE problems SET
	statement = '**Inheritance** is a fundamental object-oriented programming (OOP) concept that allows one class to inherit attributes and methods from another. 

This promotes **code reuse**, reduces duplication, and makes it easier to organize related classes that share common behavior.

In this challenge, your task is to create a base **`Shape`** class and define three subclasses: **`Square`**, **`Rectangle`**, and **`Triangle`**. Each subclass should provide its own implementation of the **`area()`** method using the appropriate formula for that shape.

Based on the provided `shapeType`, create an instance of the corresponding subclass and return the result of calling its **`area()`** method. If the given shape type is not recognized, your function should return `-1`.

This exercise also introduces **polymorphism**, where different objects respond to the same method call in their own way.

For example:

- **Calling `compute_shape_area_oop("square", [4])`** returns **`16`**, the area of a 4 by 4 square.
- **Calling `compute_shape_area_oop("rectangle", [3, 5])`** returns **`15`**, the area of a 3 by 5 rectangle.
- **Calling `compute_shape_area_oop("triangle", [4, 5])`** returns **`10`**, the area of a triangle with base 4 and height 5.

Regardless of which shape is created, your code should calculate its area by calling the same **`area()`** method, allowing the correct implementation to be selected automatically.

This exercise reinforces several important programming concepts:

- Creating classes and **subclasses** using inheritance.
- Overriding methods to provide specialized behavior.
- Using **polymorphism** to write flexible and reusable code.
- Selecting and instantiating objects based on runtime input.
- Applying object-oriented design principles to solve real-world problems.

Inheritance and polymorphism are core principles of object-oriented programming and are widely used to build scalable, maintainable, and extensible software systems.',
	param_names = '{shapeType,args}'
WHERE slug = 'python-intermediate-shape-area-oop';
UPDATE problems SET
	statement = 'Python lists of names and ages need to be combined and sorted by multiple criteria. Sorting by one criterion is common, but real-world sorting often requires **tiebreaking** — using a secondary sort key when the primary key is equal.

In this challenge, your task is to pair up each name with its corresponding age (matched by position), sort the people primarily by age (youngest first), and use alphabetical name order to break ties.

Return just the names in the sorted order.

For example:

- Names **`["Jerry", "Ada", "Grace"]`** with ages **`[28, 36, 28]`**: sorted by age gives Ada (36), then Jerry and Grace (both 28). Among Jerry and Grace, alphabetical order puts Grace first: **`["Grace", "Jerry", "Ada"]`**.

Your function should return a **list of names** in the sorted order.

This exercise reinforces several important programming concepts:

- Using **`zip()`** to pair parallel lists together.
- Performing **multi-key sorting** with tuple keys.
- Understanding that Python compares tuples **element by element**.
- Using **`sorted()`** with a custom `key` function.

Multi-key sorting is essential in data analysis, reporting, user interfaces, and any application where data must be organized by multiple attributes with clear precedence rules.',
	param_names = '{names,ages}'
WHERE slug = 'python-intermediate-sort-people';
UPDATE problems SET
	statement = 'Generators provide an efficient way to produce values **one at a time** instead of creating and storing an entire collection in memory. 
They are commonly used when working with sequences that can be processed incrementally.

In this challenge, your task is to define a **generator function** that yields the square of every whole number from `1` up to and including `n`.
Once the generator has produced all of its values, calculate and return the sum of the generated squares.

Your function should return the total of all squared values produced by the generator.

For example:

- **Calling ** returns ****, because 1² + 2² + 3² = 1 + 4 + 9 = 14.
- **Calling ** returns ****, since 1² = 1.

This exercise reinforces several important programming concepts:

- Defining and using **generator functions**.
- Producing values with the `yield` keyword.
- Iterating over generated sequences.
- Combining generated values into a single result through accumulation.

Generators are a powerful feature of Python that enable memory-efficient data processing and are widely used for streaming data, large datasets, and lazy evaluation.',
	param_names = '{n}'
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
	param_names = '{a,b}'
WHERE slug = 'python-intermediate-unique-common-elements';
UPDATE problems SET
	statement = 'A **decorator** is one of Python''s most powerful features: a function that takes another function as input and returns a modified version of it, adding new behavior without changing the original function''s own code.

In this challenge, your task is to define a decorator `uppercase_result` that wraps any function so that its return value is automatically converted to uppercase. Apply it to a small `greet(name)` function using the `@` syntax, then call the decorated function and return the result.

For example:

- Calling with **`"jerry"`** returns **`"HELLO, JERRY"`**.
- Calling with **`"Ada"`** returns **`"HELLO, ADA"`**.

Your function should return the **uppercased greeting string**.

This exercise reinforces several important programming concepts:

- Defining a **decorator function** that wraps another function.
- Using the **`@decorator_name`** syntax.
- Understanding how decorators transform function behavior.
- Working with **`*args`** and **`**kwargs`** in wrapper functions.

Decorators are everywhere in real Python code — from Flask''s `@app.route(...)` to `@property` and `@staticmethod` in classes to `@functools.lru_cache`. Understanding how a decorator wraps a function is the key to understanding all of them.',
	param_names = '{name}'
WHERE slug = 'python-intermediate-uppercase-decorator';
UPDATE problems SET
	statement = 'Python allows you to create **custom exceptions** by defining your own exception classes. 
Custom exceptions make your code more expressive by allowing you to represent specific error conditions that are unique to your application.

In this challenge, your task is to define a custom exception named **`NegativeValueError`**. When a helper function receives a negative number, it should raise this exception. 
Use a **`try`/`except`** block to catch the exception and return the appropriate result based on whether an error occurred.

Your function should return `"valid"` if the input is non-negative, or `"invalid"` if the custom exception is raised.

For example:

- **Calling ** returns ****, because 5 is a non-negative number.
- **Calling ** returns ****, because the negative value triggers the custom exception.

This exercise reinforces several important programming concepts:

- Creating **custom exception classes** by inheriting from `Exception`.
- Raising exceptions with the **`raise`** statement.
- Handling exceptions using **`try`** and **`except`**.
- Separating normal program flow from error-handling logic.

Custom exceptions are widely used in professional software development to make programs easier to debug, improve code readability, and provide meaningful error messages that accurately describe specific failure conditions.',
	param_names = '{n}'
WHERE slug = 'python-intermediate-validate-positive';
