-- Generated: 2026-07-27 05:29:58
-- Module: python-challenges
-- Problems: 30

UPDATE problems SET
	statement = 'Every text string has a beginning and an end. Sometimes the outermost characters are just a boundary — markers that need to be discarded to reveal the actual content underneath.

String trimming is a fundamental operation in text processing, data cleaning, and input validation, where only the interior portion of a string matters.

In this challenge, your task is to remove the very first character and the very last character from a string, and return whatever remains in between.
The input string is guaranteed to be at least two characters long.

For example:

- **“hello”** becomes **“ell”** after removing the first (‘h’) and last (‘o’) characters.
- **“ab”** becomes **“”** (an empty string), since removing both characters leaves nothing behind.
- This should work correctly for letters, digits, symbols, and any other characters.

Your function should return the **remaining substring** after both ends have been trimmed away.

This exercise reinforces several important programming concepts:

- Working with **strings** and character positions.
- Understanding how **indexing** identifies individual characters.
- Extracting a **substring** using slicing.
- Handling edge cases where trimming consumes the entire string.

Trimming the outermost characters from a string is a foundational text-processing technique used in **parsing**, **data extraction**, **input sanitization**, and many other real-world applications.',
	param_names = '{s}'
WHERE slug = 'python-challenge-trim-outer-characters';
UPDATE problems SET
	statement = 'Text data often contains unwanted characters that need to be removed before it can be processed or displayed. 

Cleaning and transforming strings is one of the most common tasks in software development.

In this challenge, your task is to remove every **exclamation mark** (`!`) from a given string. 
All other characters, including letters, numbers, spaces, and punctuation, should remain unchanged.

Your function should return a **new string** with all exclamation marks removed while preserving the original order of the remaining characters.

This exercise reinforces several important programming concepts:

- Working with **strings** and text data.
- Identifying and removing specific characters from a string.
- Creating a new string from an existing one.
- Performing basic text-cleaning operations.

String sanitization is a fundamental technique used in data processing, user input validation, text formatting, and many other real-world programming applications.',
	param_names = '{s}'
WHERE slug = 'python-challenge-remove-exclamations';
UPDATE problems SET
	statement = 'One of the most basic questions you can ask about a collection of data is whether a particular value exists somewhere inside it.

This yes-or-no question forms the foundation of search functionality in databases, file systems, and nearly every software application that manages data.

In this challenge, your task is to determine whether a given **target integer** appears anywhere within a **list of integers**.
The value is either present somewhere in the list, or it is not — there are only two possible outcomes.

For example:

- Searching for the value **`3`** in the list **`[1, 2, 3, 4]`** should confirm that it is present, returning **`True`**.
- Searching for the value **`9`** in the same list should confirm that it is **not** present, returning **`False`**.

Your function should return **`True`** if the target value appears at least once in the list, or **`False`** otherwise.

This exercise reinforces several important programming concepts:

- Working with **lists** and collections.
- Performing **membership testing** to determine if a value exists.
- Returning a **boolean result** based on a search operation.
- Understanding the fundamental building block of **search algorithms**.

Value containment checking is the simplest form of search and is used in **data validation**, **access control**, **filtering systems**, and countless other applications where you need to know whether something exists in a dataset.',
	param_names = '{nums,target}'
WHERE slug = 'python-challenge-contains-value';
UPDATE problems SET
	statement = 'Calculating the volume of a three-dimensional object is a fundamental operation in mathematics, engineering, and logistics. 

It helps determine how much space an object occupies and is widely used in packaging, storage, and shipping.

In this challenge, your task is to calculate the **volume** of a rectangular box using its **length**, **width**, and **height**.

Your function should return the total volume of the box, which is obtained by multiplying its three dimensions together.

This exercise reinforces several important programming concepts:

- Working with numeric values and arithmetic operations.
- Performing calculations using multiple inputs.
- Returning the result of a mathematical expression.
- Applying a simple geometric formula to solve a practical problem.

Volume calculations are commonly used in inventory management, warehouse planning, manufacturing, and many other real-world applications.',
	param_names = '{length,width,height}'
WHERE slug = 'python-challenge-cuboid-volume';
UPDATE problems SET
	statement = 'Numbers can be broken down into their individual digits, and each digit can be transformed independently before being reassembled into a new value.

This digit-by-digit approach is a common building block for many numeric puzzles, data transformations, and algorithmic challenges.

In this challenge, your task is to **isolate each digit** of an integer, **square each digit** independently, and then **concatenate the squared results** back together — in their original order — to form a single new integer.

For example:

- The number **`9119`** has digits `9`, `1`, `1`, and `9`.
- Squaring each digit gives **`81`**, **`1`**, **`1`**, and **`81`**.
- Concatenating those squared results in order produces **`811181`**.

Your function should return the **new integer** formed by concatenating each squared digit.

This exercise reinforces several important programming concepts:

- Working with **numeric values** and their decimal representation.
- Extracting individual **digits** from a number.
- Applying a mathematical operation to each digit independently.
- Building a new value by **concatenating** transformed results.
- Understanding the difference between arithmetic addition and string concatenation.

Digit-by-digit transformation is a fundamental technique used in **number theory**, **checksum algorithms**, **data encoding**, and many mathematical and cryptographic applications.',
	param_names = '{num}'
WHERE slug = 'python-challenge-squared-digits';
UPDATE problems SET
	statement = 'Filtering a collection to include only the elements that meet a specific condition is one of the most fundamental data-processing operations.

Whether you''re cleaning sensor readings, processing survey responses, or analyzing financial transactions, you frequently need to select only the values that satisfy a particular criterion.

In this challenge, your task is to return a **new list** containing only the numbers that are **strictly greater than zero** from the input list.
The relative order of the remaining elements must be preserved.

If no values meet the condition — for example, if the list contains only negative numbers, only zeros, or some combination of the two — your function should return an **empty list**.

For example:

- **`[-1, 2, 0, -3, 4]`** should produce the filtered result **`[2, 4]`**.
- **`[-1, 0, -2]`** contains no positive values, so the result is **`[]`**.

Your function should return a **new list** containing only the positive numbers, in their original order.

This exercise reinforces several important programming concepts:

- Working with **lists** and ordered collections.
- Using **conditional logic** to select elements.
- Building a **new list** from filtered results.
- Handling edge cases where the result is **empty**.
- Understanding the difference between strict and non-strict comparisons.

Filtering is a core operation in **data analysis**, **ETL pipelines**, **query systems**, and virtually every application that processes collections of data.',
	param_names = '{nums}'
WHERE slug = 'python-challenge-filter-positives';
UPDATE problems SET
	statement = 'A sanitizer built to remove one specific, hardcoded character is useful, but a configurable version that can remove whichever character is needed at the time is considerably more flexible and reusable.

This pattern of **parameterized text processing** appears throughout software development, from input validation to data transformation.

In this challenge, your task is to remove **every occurrence** of a specified **target character** from a text string.
Unlike a fixed sanitizer that always removes the same character, this function receives the character to remove as a parameter, making it adaptable to different cleaning needs.

All other characters — including letters, numbers, spaces, and other symbols — should remain unchanged and in their original order.

For example:

- Removing every occurrence of **`"a"`** from **`"banana"`** should produce **`"bnn"`**.
- Removing **`"z"`** from **`"hello"`** should leave the string unchanged as **`"hello"`**, since the target character does not appear.

Your function should return the **cleaned string** with all occurrences of the target character removed.

This exercise reinforces several important programming concepts:

- Working with **strings** and character sequences.
- Accepting **parameters** to control behavior dynamically.
- Removing specific characters while preserving others.
- Generalizing a solution so it works for any input.

Configurable text sanitization is a fundamental technique used in **form validation**, **data cleaning**, **search indexing**, and many other real-world applications where the characters to remove vary depending on the context.',
	param_names = '{text,target}'
WHERE slug = 'python-challenge-target-eraser';
UPDATE problems SET
	statement = 'Understanding how much mass is packed into a given volume is a fundamental concept in materials science and engineering.

Density calculations help determine whether an object will float, how much material is needed for manufacturing, and how to identify unknown substances.

In this challenge, your task is to calculate the **density** of a rectangular object.
You are given its **length**, **width**, **height**, and **total mass**.

First, calculate the **volume** of the object by multiplying its three dimensions together.
Then, calculate the **density** by dividing the mass by the volume.

Your function should return the density **rounded to exactly two decimal places**.

For example:

- An object with dimensions **`2`**, **`2`**, **`2`** has a volume of **`8`**.
- If its mass is **`20`**, the density is `20 / 8`, which rounds to **`2.5`**.

Your function should return the **density** as a floating-point number, rounded to two decimal places.

This exercise reinforces several important programming concepts:

- Working with **multiple numeric inputs** of different types (integers and floats).
- Performing a multi-step calculation (volume, then density).
- Using **division** to compute a ratio.
- **Rounding** a result to a specific number of decimal places.
- Applying a scientific formula to solve a practical problem.

Density calculations are essential in **materials science**, **quality control**, **shipping and logistics**, **manufacturing**, and many other fields where the relationship between mass and volume matters.',
	param_names = '{length,width,height,mass}'
WHERE slug = 'python-challenge-material-density';
UPDATE problems SET
	statement = 'This challenge extends digit-based transformation with a crucial twist: instead of preserving the original order of the digits, they must be processed in reverse.

Reversing the order of elements before performing a transformation is a common pattern in algorithm design and data processing.

In this challenge, your task is to **reverse the digits** of an integer, **square each digit** independently, and then **concatenate the squared results** together in the reversed order to form a single new integer.

For example:

- The number **`34`** has digits `3` and `4`.
- Reversed, the digit order becomes `4` then `3`.
- Squaring each gives **`16`** and **`9`**.
- Concatenating those in the reversed order produces **`169`**.

Your function should return the **new integer** formed by concatenating each squared digit in reversed order.

This exercise reinforces several important programming concepts:

- Working with **numeric values** and their decimal representation.
- Extracting individual **digits** from a number.
- **Reversing** the order of a sequence.
- Applying an operation to each element independently.
- Building a new value by concatenating transformed results.

Digit reversal with transformation is a technique used in **numeric puzzles**, **palindrome checking**, **radix conversion**, and many algorithmic challenges.',
	param_names = '{num}'
WHERE slug = 'python-challenge-digit-inversion';
UPDATE problems SET
	statement = 'Extreme values can distort the analysis of a dataset, and it is often useful to identify and set aside the most extreme readings before working with the remaining data.

This technique, known as **outlier removal**, is commonly used in statistical analysis, sensor data processing, and quality control.

In this challenge, your task is to parse a **space-separated string of numbers**, identify the **maximum** value and the **minimum** value, remove **exactly one occurrence** of each from the set, and return the remaining numbers as a new space-separated string in their original relative order.

If the input contains **fewer than three numbers**, there are not enough values remaining after removing two extremes, so your function should return an **empty string**.

For example:

- The input **`"1 9 3 4 -5"`** has a maximum of `9` and a minimum of `-5`.
- Removing one instance of each leaves **`"1 3 4"`**.
- The input **`"5 5 5"`** has both maximum and minimum equal to `5` — removing two separate occurrences leaves **`"5"`**.

Your function should return the **remaining numbers** as a single space-separated string, or an empty string if insufficient data remains.

This exercise reinforces several important programming concepts:

- **Parsing** space-separated text into individual values.
- Converting **strings** to numbers for comparison.
- Identifying the **maximum** and **minimum** values in a collection.
- Removing specific elements from a data set.
- Handling **edge cases** involving insufficient data.
- Formatting results back into a **string**.

Outlier removal is a fundamental data-cleaning technique used in **statistics**, **data science**, **quality assurance**, **financial analysis**, and many other fields where extreme values can skew results.',
	param_names = '{s}'
WHERE slug = 'python-challenge-extreme-outlier-remover';
UPDATE problems SET
	statement = 'Age-related problems are a classic way to practice translating a **real-world scenario** into a mathematical solution.
By analyzing how two people''s ages change over time, you can determine when a specific relationship between them becomes true.

In this challenge, your task is to determine the number of **years** until—or since—the father''s age is **exactly twice** the son''s age.
Both the father and the son age at the same rate, so the difference between their ages remains constant over time.
The required moment may have occurred **in the past** or may happen **in the future**.

Your function should **return the number of years** between the present and the moment when the father''s age is exactly **twice** the son''s age.
The result should always be a **non-negative integer**, regardless of whether that moment has already passed or is yet to come.

For example:

- A father aged `50` and a son aged `20` will reach the two-to-one age ratio **10 years from now**, so the correct result is **`10`**.
- A father aged `40` and a son aged `20` are already at the required ratio, so the correct result is **`0`**.

This exercise reinforces several important programming concepts:

- Solving **age-based mathematical problems**.
- Performing arithmetic calculations with multiple values.
- Reasoning about events in both the **past** and the **future**.
- Working with **absolute differences** to produce a non-negative result.
- Translating a real-world scenario into an algorithm.

Age comparison problems are commonly used to strengthen **logical reasoning**, **algebraic thinking**, and **problem-solving skills**, making them a popular exercise in mathematics and programming alike.',
	param_names = '{father_age,son_age}'
WHERE slug = 'python-challenge-age-relativity';
UPDATE problems SET
	statement = 'Averages provide a useful summary of a collection of numbers, but unusually high or low values—known as **outliers**—can significantly influence the result. 
One way to reduce this effect is by calculating a **trimmed average**, which excludes the most extreme values before computing the average.

In this challenge, your task is to calculate the average of a list of numbers after removing **exactly one occurrence** of the overall **minimum** value and **exactly one occurrence** of the overall **maximum** value.

If the list contains **two or fewer elements**, there are not enough values remaining to calculate an average after removing both extremes. 
In this case, your function should return `0`.

Your function should return the average of the remaining values after the required elements have been removed.

This exercise reinforces several important programming concepts:

- Working with **lists** of numeric values.
- Identifying the minimum and maximum elements in a collection.
- Removing specific values from a dataset.
- Calculating the average of a filtered collection.
- Handling edge cases involving small input sizes.

Trimmed averages are commonly used in statistics, data analysis, scientific research, and performance evaluation to reduce the impact of outliers and produce more representative results.',
	param_names = '{nums}'
WHERE slug = 'python-challenge-trimmed-average';
UPDATE problems SET
	statement = 'Real-world data is frequently organized in two dimensions — rows and columns — rather than a single flat list.

Tables, spreadsheets, images, game boards, and many other structures use a grid layout that requires you to navigate both dimensions to find specific information.

In this challenge, your task is to search for a **target value** within a **nested list** (a grid of numbers) and return its position.

The grid is represented as a list of rows, where each row is itself a list of integers.

Scan the grid from the **top row downward**, and within each row from **left to right**, to find the first occurrence of the target value.

For example:

- In a grid where the first row contains `[1, 2, 3]` and the second row contains `[4, 5, 6]`, searching for the value **`5`** should report row **`1`** and column **`1`** (using zero-based counting for both rows and columns).
- If the target does not appear anywhere in the grid, return the pair **`[-1, -1]`** instead.

Your function should return a **two-element list** containing the row index followed by the column index.

This exercise reinforces several important programming concepts:

- Working with **nested lists** and two-dimensional data structures.
- Using **nested loops** to traverse multiple dimensions.
- Understanding **row-major** traversal order.
- Using **zero-based indexing** for positions.
- Handling the case where a value is **not found**.

Searching through two-dimensional data is a fundamental skill used in **image processing**, **game development**, **spreadsheet applications**, **matrix mathematics**, and many other real-world applications.',
	param_names = '{grid,target}'
WHERE slug = 'python-challenge-matrix-indexer';
UPDATE problems SET
	statement = 'Breaking a long sequence of data into fixed-size segments and analyzing each segment independently is a common technique for summarizing and processing large datasets in more manageable pieces.

This approach is widely used in **batch processing**, **data streaming**, and **signal processing**, where data arrives or is processed in chunks.

In this challenge, your task is to partition a list of integers into **consecutive chunks** of a given size `k`, and then calculate two metrics for each chunk: the **count of positive numbers** and the **sum of negative numbers**.

The final chunk may contain **fewer than `k` elements** if the list does not divide evenly.

Return all of these per-chunk summaries as a **nested list**, in the same order as the original chunks.

For example:

- Given the list **`[1, -2, 3, -4, 5, -6, 7]`** with chunk size **`3`**:
  - First chunk `[1, -2, 3]` has **1 positive** and a negative sum of **-2**.
  - Second chunk `[-4, 5, -6]` has **1 positive** and a negative sum of **-10**.
  - Third chunk `[7]` has **1 positive** and a negative sum of **0**.
  - The result is **`[[1, -2], [1, -10], [1, 0]]`**.

Your function should return a **list of pairs**, one pair for each chunk.

This exercise reinforces several important programming concepts:

- Working with **lists** and **slicing** to create partitions.
- Using **loops** to process each chunk independently.
- Calculating multiple metrics in a **single pass** through each chunk.
- Building a **nested data structure** to organize results.
- Handling **partial final chunks** when the division is uneven.

Segment-based analysis is a fundamental technique used in **time-series analysis**, **audio processing**, **network packet analysis**, **financial market data**, and many other applications that process sequential data.',
	param_names = '{nums,k}'
WHERE slug = 'python-challenge-segment-parity';
UPDATE problems SET
	statement = 'This challenge extends digit manipulation by focusing on only the two most extreme digits within a number, rather than transforming every single digit.

Selectively targeting specific elements within a collection—such as the highest and lowest values—is a common pattern in data analysis and algorithmic problem solving.

In this challenge, your task is to **identify the highest digit** and the **lowest digit** within a large integer, **square each of these two extreme digits** independently, and then **concatenate the squared results** together, with the result from the highest digit listed first, to form a new integer.

For example:

- The number **`2817`** has digits `2`, `8`, `1`, and `7`.
- Its highest digit is **`8`**, which squares to **`64`**.
- Its lowest digit is **`1`**, which squares to **`1`**.
- Concatenating those together, highest first, produces **`641`**.

Your function should return the **new integer** formed by concatenating the squared highest digit with the squared lowest digit.

This exercise reinforces several important programming concepts:

- Extracting individual **digits** from a number.
- Finding the **maximum** and **minimum** values in a collection.
- Applying a **selective transformation** to only specific elements.
- **Concatenating** results in a specific order.
- Combining multiple algorithmic steps into a single solution.

Selective element transformation is a technique used in **data normalization**, **feature extraction**, **signal processing**, and many other applications where only certain values within a dataset need to be processed.',
	param_names = '{num}'
WHERE slug = 'python-challenge-high-low-digit-reducer';
UPDATE problems SET
	statement = 'Efficiently packing items into a fixed space is a common problem in **logistics**, **warehousing**, and **shipping**.
Determining how many boxes can fit inside a container helps maximize storage capacity and optimize transportation.

In this challenge, your task is to calculate the **maximum number of product boxes** that can fit inside a rectangular **container**.
Both the container and the product box are represented as lists containing their **length**, **width**, and **height**.

Each box must remain in the **same orientation** as the container, meaning **rotation is not allowed**.
Determine how many boxes fit along **each dimension**, then calculate the **total number of boxes** that can be packed inside the container.

For example:

- A container with dimensions **`[10, 10, 10]`** and boxes with dimensions **`[3, 3, 3]`** can fit `3` boxes along each dimension.
- The total number of boxes is **`3 × 3 × 3 = 27`**.

Your function should **return the maximum number of boxes** that can fit without exceeding the container''s dimensions.

This exercise reinforces several important programming concepts:

- Working with **lists** to represent structured data.
- Using **integer division** to determine how many items fit along each dimension.
- Combining multiple calculations to compute a final result.
- Solving a practical **optimization problem** using arithmetic and logical reasoning.

Packing calculations are widely used in **inventory management**, **warehouse automation**, **shipping systems**, **manufacturing**, and other applications that optimize the use of physical space.',
	param_names = '{container,box}'
WHERE slug = 'python-challenge-shipping-optimization';
UPDATE problems SET
	statement = 'Repetitive data can often be represented far more compactly by recording how many times each value repeats consecutively, rather than writing out every single repetition explicitly.

This is the core idea behind **run-length encoding**, a simple but genuinely useful data compression technique used in image formats, data transmission, and storage optimization.

In this challenge, your task is to compress a string using run-length encoding.
Replace every **run** of one or more identical consecutive characters with that character followed by the **count** of how many times it occurred in that run.

For example:

- The string **`"aaabbc"`** contains a run of three `a`s, a run of two `b`s, and a run of one `c`.
- Encoded, this becomes **`"a3b2c1"`**.
- A string with no consecutive repeats, such as **`"abc"`**, becomes **`"a1b1c1"`**.

Your function should return the **encoded string** where each run is replaced by the character and its count.

This exercise reinforces several important programming concepts:

- Iterating through a **string** one character at a time.
- Identifying **consecutive runs** of identical characters.
- Maintaining a **running count** during iteration.
- Building a **new string** from processed data.
- Understanding the fundamentals of **data compression**.

Run-length encoding is a foundational compression technique used in **BMP and TIFF image formats**, **fax machines**, **simple data transmission protocols**, and many other applications where reducing repetitive data saves space.',
	param_names = '{s}'
WHERE slug = 'python-challenge-run-length-encoder';
UPDATE problems SET
	statement = 'Parentheses are commonly used to group expressions and represent **nested structures** in programming, mathematics, and many text-based formats.
Determining how deeply these groups are nested is an important technique used in **parsing**, **syntax validation**, and expression evaluation.

In this challenge, your task is to determine the **maximum nesting depth** of a string containing only parenthesis characters.
As you process the string from **left to right**, keep track of the current nesting level and identify the **greatest depth** reached at any point.

The input is considered **valid** only if every opening parenthesis has a matching closing parenthesis, and no closing parenthesis appears before its corresponding opening parenthesis.
If the parentheses are **not properly balanced**, your function should **return `-1`**.

For example:

- The string **`"(()(()))"`** has a maximum nesting depth of **`3`**.
- The string **`"()()"`** has a maximum nesting depth of **`1`**.
- The string **`"(()"`** is not balanced, so the function should return **`-1`**.

This exercise reinforces several important programming concepts:

- Processing a **string** one character at a time.
- Maintaining a **running state** while iterating through data.
- Validating **balanced pairs** of opening and closing symbols.
- Tracking the **maximum value** reached during an iteration.
- Handling **invalid input** by detecting unmatched parentheses.

Checking balanced parentheses and measuring nesting depth are fundamental techniques used in **compilers**, **expression evaluators**, **syntax highlighters**, and many other applications that process structured text.',
	param_names = '{s}'
WHERE slug = 'python-challenge-bracket-depth';
UPDATE problems SET
	statement = 'Lists often contain values that appear multiple times in succession.
Identifying the **longest sequence of consecutive identical values** is a common task in **data analysis**, **pattern recognition**, and sequence processing.

In this challenge, your task is to **find the length of the longest consecutive run** of identical integers in a **list**.
A **run** is a sequence of one or more **adjacent elements** that all contain the same value.
For example, in the list `[4, 4, 4, 2, 2, 7, 7, 7, 7, 1]`, the longest run is the four consecutive `7`s, so the correct result is `4`.

Your function should **return the length** of the longest run found anywhere in the list.
If the list is **empty**, return `0`, since there are no elements to form a run.

This exercise reinforces several important programming concepts:

- Iterating through a **list** one element at a time.
- Comparing **adjacent elements** to detect consecutive values.
- Tracking both the **current run** and the **longest run** encountered.
- Handling **edge cases**, such as an empty list.

Detecting consecutive sequences is a fundamental programming technique used in **data analysis**, **compression algorithms**, **event monitoring**, and many other applications that process ordered data.',
	param_names = '{nums}'
WHERE slug = 'python-challenge-longest-uniform-run';
UPDATE problems SET
	statement = 'Every **whole number** greater than `1` can be expressed as a unique product of **prime numbers**.
This process, known as **prime factorization**, is a fundamental concept in mathematics and forms the basis of many algorithms used in computer science and cryptography.

In this challenge, your task is to **determine the complete prime factorization** of a positive integer.
Identify every **prime factor**, count how many times it divides evenly into the original number, and represent the result using the required format.

Your function should **return a single string** where:

- Each **prime factor** is followed by its exponent using the format **`prime^count`**.
- Factors are joined together with `*`.
- All prime factors appear in **ascending numerical order**.

For example:

- `360` is equal to `2 × 2 × 2 × 3 × 3 × 5`.
- Its formatted prime factorization is **`"2^3*3^2*5^1"`**.

This exercise reinforces several important programming concepts:

- Working with **loops** to repeatedly divide a number.
- Identifying **prime numbers** and their factors.
- Counting repeated occurrences of the same factor.
- Building and formatting a **string** from computed results.
- Solving mathematical problems through algorithmic reasoning.

Prime factorization is a fundamental technique used in **number theory**, **cryptography**, **computer algebra systems**, and many mathematical algorithms that analyze the properties of integers.',
	param_names = '{n}'
WHERE slug = 'python-challenge-prime-factorization';
UPDATE problems SET
	statement = 'Calculating the **average** (or **mean**) of a collection of numbers is one of the most common operations in programming.
It provides a single value that represents the overall distribution of a dataset and is widely used in statistics, analytics, and reporting.

In this challenge, your task is to **calculate the mathematical average** of all the numbers in a list.
To find the average, add all the values together and divide the total by the number of elements in the list.

If the list is **empty**, there are no values to average.
In this case, your function should **return `0`** instead of attempting to divide by zero.

For example:

- The list `[1, 2, 3, 4]` has an average of **`2.5`**.
- An empty list `[]` should return **`0`**.

This exercise reinforces several important programming concepts:

- Working with **lists** of numeric values.
- Calculating the **sum** and **average** of a collection.
- Performing arithmetic operations safely.
- Handling **edge cases**, such as an empty list.
- Preventing common runtime errors, such as **division by zero**.

Calculating averages is a fundamental programming technique used in **data analysis**, **financial reporting**, **scientific computing**, **machine learning**, and countless other real-world applications.',
	param_names = '{nums}'
WHERE slug = 'python-challenge-array-average';
UPDATE problems SET
	statement = 'A single pass over a sequence of numbers can often reveal multiple useful statistics at once, combining analysis efficiently rather than requiring separate passes for each metric.

This technique of **multi-metric single-pass analysis** is widely used in data processing, reporting, and monitoring systems where performance matters.

In this challenge, your task is to compute **two metrics** from a list of integers in a single pass: the **count of positive numbers** (those strictly greater than zero) and the **sum of negative numbers** (those strictly less than zero).

Zero itself should not be counted toward either metric, since it is neither positive nor negative.

For example:

- The list **`[3, -2, 5, -7, 0]`** has **2** positive numbers (`3` and `5`) and a negative sum of **-9** (`-2` and `-7` combined).
- The result should be the pair **`[2, -9]`**.
- An **empty list** should return **`[]`**, since there is nothing to summarize.

Your function should return a **two-element list** containing the positive count followed by the negative sum, or an empty list if the input is empty.

This exercise reinforces several important programming concepts:

- Iterating through a **list** one element at a time.
- Using **conditional logic** to process values differently based on their sign.
- Calculating **multiple metrics** in a single pass.
- Handling values that should be **excluded** from both metrics (zero).
- Building and returning a **structured result**.

Multi-metric analysis is a fundamental technique used in **data dashboards**, **financial reporting**, **sensor monitoring**, **performance analysis**, and many other applications where multiple statistics must be derived from the same dataset.',
	param_names = '{nums}'
WHERE slug = 'python-challenge-positive-negative-summary';
UPDATE problems SET
	statement = 'Strings often need to be **trimmed** to remove unwanted characters from their beginning and end.
This type of operation is commonly used in **text processing**, **data extraction**, and **input sanitization**, where only a specific portion of the original string is needed.

In this challenge, your task is to **remove a specified number of characters from both ends** of a string.
Given a string and an integer `n`, remove the first `n` characters and the last `n` characters, then **return the remaining portion** of the string.

If the string''s length is **less than or equal to `2 × n`**, there will be no characters left after trimming both ends.
In this case, your function should **return an empty string** (`""`).

For example:

- Trimming `"wonderful"` by `2` characters from each end returns **`"nder"`**.
- Trimming `"code"` by `2` characters from each end returns **`""`**, since every character is removed.

This exercise reinforces several important programming concepts:

- Working with **strings** and character positions.
- Extracting substrings using **indexing** or **slicing**.
- Performing precise **string manipulation** without modifying the original value.
- Handling **edge cases**, such as when the requested trim removes the entire string.

String trimming is a fundamental technique used in **text processing**, **data cleaning**, **file parsing**, and many other real-world applications where only a specific section of a string is required.',
	param_names = '{s,n}'
WHERE slug = 'python-challenge-variable-trim';
UPDATE problems SET
	statement = 'Searching for a value within a collection is one of the most common operations in programming. 
In many situations, an **exact match** is required, meaning every character—including uppercase and lowercase letters—must match perfectly.

In this challenge, your task is to determine whether a given **target string** exists in a list of words as an **exact, character-for-character match**. 
Differences in capitalization, whitespace, or any other character should be treated as a mismatch.

Your function should return whether the target string is present in the list exactly as provided.

This exercise reinforces several important programming concepts:

- Working with **lists** and collections of strings.
- Comparing strings for **exact equality**.
- Understanding **case-sensitive** comparisons.
- Searching for values within a collection.

Exact string matching is a fundamental operation used in authentication systems, data validation, searching, filtering, and many other real-world applications where precision is essential.',
	param_names = '{words,target}'
WHERE slug = 'python-challenge-exact-match';
UPDATE problems SET
	statement = 'Strings often contain repeated characters that may be unnecessary or the result of inconsistent input.
Reducing these repeated sequences makes text cleaner, more consistent, and easier to process.

In this challenge, your task is to **remove consecutive duplicate characters** from a string.
Whenever the same character appears **multiple times in a row**, it should be replaced with a **single occurrence** of that character.
Only **consecutive** duplicates should be removed, meaning identical characters separated by other characters must remain unchanged.

For example:

- **`"aaabbbccdaa"`** becomes **`"abcda"`**.
- **`"Wooow!!!"`** becomes **`"Wow!"`**.

Your function should **return a new string** where every sequence of repeated consecutive characters has been condensed into a single character, while preserving the original order of the remaining characters.

This exercise reinforces several important programming concepts:

- Working with **strings** and character sequences.
- Iterating through text **one character at a time**.
- Comparing **adjacent characters**.
- Building a **new string** based on specific conditions.
- Preserving the original order of characters while removing redundant repetitions.

Removing consecutive duplicate characters is a common text-processing technique used in **data cleaning**, **compression algorithms**, **input normalization**, and many other applications that process textual data.',
	param_names = '{s}'
WHERE slug = 'python-challenge-punctuation-condenser';
UPDATE problems SET
	statement = 'Age comparisons are a common programming exercise that combine **arithmetic** with **logical reasoning**.
By analyzing the relationship between different ages, you can determine when a specific condition will be true.

In this challenge, your task is to determine the **future calendar year** in which the **oldest** member of a family will be exactly **twice the age** of the **youngest** member.
The input consists of a **list of current ages** and the **current calendar year**.

Only the **oldest** and **youngest** ages are relevant to the calculation.
Any other ages in the list do **not** affect the final result.

For example:

- If the family ages are `[50, 20]` and the current year is `2024`, the oldest member will be exactly twice the youngest member''s age **10 years later**.
- The correct result is **`2034`**.

Your function should **return the calendar year** in which this double-age relationship occurs.

This exercise reinforces several important programming concepts:

- Working with **lists** to identify the **minimum** and **maximum** values.
- Performing arithmetic calculations using **age differences**.
- Solving **time-based** problems through logical reasoning.
- Combining multiple pieces of information to produce a single result.

Age-based calculations are commonly used to develop **problem-solving skills** and appear in scheduling systems, simulations, planning tools, and many other real-world applications.',
	param_names = '{ages,current_year}'
WHERE slug = 'python-challenge-milestone-planner';
UPDATE problems SET
	statement = 'A **two-dimensional grid** organizes data into rows and columns, making it useful for representing tables, matrices, game boards, and images. While grids are often processed row by row, some problems require following a specific traversal pattern to visit every element.

In this challenge, your task is to traverse a grid in **spiral order**. The grid is provided as a flattened list in **row-major order**, along with its number of rows and columns.

Begin at the **top-left corner** and visit the elements by moving:

- Across the top row from left to right.
- Down the rightmost column.
- Across the bottom row from right to left.
- Up the leftmost column.

Continue this pattern, moving inward one layer at a time, until every value in the grid has been visited exactly once.

Your function should return a list containing the values in the order they were visited during the spiral traversal.

This exercise reinforces several important programming concepts:

- Working with **two-dimensional data** represented in a one-dimensional structure.
- Traversing a matrix using changing boundaries.
- Managing row and column indices.
- Processing every element exactly once using a non-linear traversal pattern.

Spiral traversal is a classic algorithmic problem that appears in technical interviews and is commonly used to strengthen matrix manipulation and traversal skills.',
	param_names = '{grid,rows,cols}'
WHERE slug = 'python-challenge-spiral-matrix';
UPDATE problems SET
	statement = 'Strings often need to be processed by locating specific pieces of text and modifying only the characters around them.
This type of **targeted string manipulation** is commonly used in **text parsing**, **data cleaning**, **search utilities**, and other applications that transform structured text.

In this challenge, your task is to locate the **first occurrence** of a target substring within a source string.
Once the target has been found, remove the single character immediately **before** it and the single character immediately **after** it, if those characters exist.
The **target substring itself must remain unchanged**, and every other character in the source string should be preserved.

If the target substring **does not exist** in the source string, your function should **return the original string unchanged**.

For example:

- Removing the surrounding characters of **`"XYZ"`** in **`"helloXYZworld"`** produces **`"hellXYZorld"`**.
- If the target substring cannot be found, the original string should be returned without any modifications.

Your function should return the **modified string** after applying the required transformation.

This exercise reinforces several important programming concepts:

- Searching for the **first occurrence** of a substring.
- Working with **string indices** and character positions.
- Manipulating text while preserving unaffected content.
- Handling **edge cases**, such as missing surrounding characters or an absent target substring.

Targeted string manipulation is a fundamental programming technique used in **text processing**, **parsers**, **search engines**, **code editors**, and many other real-world applications where precise modifications to text are required.',
	param_names = '{source,target}'
WHERE slug = 'python-challenge-substring-boundary-eraser';
UPDATE problems SET
	statement = 'Financial systems record every **transaction** that affects an account''s balance.
By combining all deposits and withdrawals, you can determine the account''s **net balance** and evaluate its overall financial status.

In this challenge, your task is to **calculate the net balance** from a list of transactions.
Each **positive integer** represents a **deposit**, while each **negative integer** represents a **withdrawal**.
After calculating the total balance, determine the account''s status based on the final result.

Your function should **return a two-element list** containing:

- The **net balance**.
- A status label:
  - **`"PROFIT"`** if the balance is greater than `0`.
  - **`"DEBT"`** if the balance is less than `0`.
  - **`"BALANCED"`** if the balance is exactly `0`.

For example, the transaction history `[100, -30, -20]` produces a net balance of `50`, so the function should return `[50, "PROFIT"]`.

This exercise reinforces several important programming concepts:

- Iterating through a **list** of numeric values.
- Calculating a **running total** from multiple transactions.
- Using **conditional statements** to classify the final result.
- Returning multiple related values in a single collection.

Processing transaction histories is a fundamental technique used in **banking systems**, **expense trackers**, **accounting software**, and other financial applications where balances must be calculated and evaluated accurately.',
	param_names = '{transactions}'
WHERE slug = 'python-challenge-account-ledger';
UPDATE problems SET
	statement = 'Raw data often arrives as a **single line of text** rather than a ready-to-use collection of values.
Before performing calculations, the data must first be **parsed** into a format that your program can process.

In this challenge, your task is to parse a string containing **space-separated numbers**.
After converting the values into numbers, identify the **largest (maximum)** value and the **smallest (minimum)** value in the collection.

Your function should **return a single string** containing the maximum value followed by the minimum value, separated by a single space.

For example:

- The input **`"1 9 3 4 -5"`** contains a maximum value of **`9`** and a minimum value of **`-5`**.
- The correct result is **`"9 -5"`**.

This exercise reinforces several important programming concepts:

- Parsing **space-separated** text into individual values.
- Converting **strings** into numeric data.
- Finding the **maximum** and **minimum** values in a collection.
- Formatting multiple results into a **single string**.
- Combining text processing with numeric operations.

Parsing textual data is a fundamental programming skill used in **data processing**, **configuration files**, **command-line tools**, **log analysis**, and many other real-world applications.',
	param_names = '{s}'
WHERE slug = 'python-challenge-extreme-bounds';
