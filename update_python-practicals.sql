-- Generated: 2026-07-27 06:26:24
-- Module: python-practicals
-- Problems: 25

UPDATE problems SET
	statement = 'Time calculations often need to handle **wrap-around** behavior — when adding a duration pushes a value past its maximum and it cycles back to the beginning. This is common in clock, calendar, and scheduling applications.

In this challenge, your task is to calculate a new alarm time after a snooze delay. Given the current hour (0 to 23), current minute (0 to 59), and a snooze duration in minutes, calculate the new time formatted as "HH:MM", correctly wrapping around to the next day if the snooze pushes past midnight.

For example:

- Snoozing for **15 minutes** starting from **7:50** results in a new alarm time of **"08:05"**.
- Snoozing for **20 minutes** starting from **23:50** wraps past midnight to **"00:10"**.
- Snoozing for **0 minutes** starting from **14:30** leaves the time unchanged at **"14:30"**.

Your function should return the new alarm time as a string in "HH:MM" format, with each component padded to two digits.

This exercise reinforces several important programming concepts:

- Converting time to a **single unit** (minutes since midnight) for simpler arithmetic.
- Using the **modulo operator** to handle wrap-around behavior.
- Formatting output with **zero-padded** digits.
- Applying **real-world scheduling** logic in code.

Time arithmetic with wrap-around is widely used in alarm clocks, countdown timers, scheduling systems, and any application that works with cyclical time values.',
	param_names = '{current_hour,current_minute,snooze_minutes}'
WHERE slug = 'python-practical-alarm-snooze';
UPDATE problems SET
	statement = '**Membership testing** — checking whether a value exists in a collection — is a fundamental operation in programming. When multiple items need to be checked in a single operation, efficient lookup becomes important.

In this challenge, your task is to implement the trigger-checking logic for a multi-alarm clock app. Given the current time as a string and a list of configured alarm times (both formatted as "HH:MM"), determine whether the current time matches any of the configured alarms.

For example:

- A current time of **"07:00"** checked against **["06:30", "07:00", "08:00"]** returns **True**, since it exactly matches the second alarm.
- A current time of **"07:30"** checked against the same list returns **False**, since no alarm is set for that time.
- An empty alarm list with any current time returns **False**.

Your function should return `True` if the current time matches any configured alarm, `False` otherwise.

This exercise reinforces several important programming concepts:

- Using the **`in` operator** for membership testing in lists.
- Checking **string equality** for exact matches.
- Handling **empty collections** gracefully.
- Building real-world **event-triggering** logic.

Membership-based triggering is used in alarm systems, notification services, calendar reminders, and event scheduling applications.',
	param_names = '{current_time,alarm_times}'
WHERE slug = 'python-practical-alarm-trigger';
UPDATE problems SET
	statement = '**Health and fitness calculations** combine mathematical formulas with categorical classification. Body Mass Index (BMI) is a widely used health metric that relates weight and height to standard weight categories.

In this challenge, your task is to calculate a person''s BMI from their weight in kilograms and height in meters, then classify it into one of four standard categories: "Underweight" (below 18.5), "Normal" (18.5 up to 25), "Overweight" (25 up to 30), or "Obese" (30 and above).

For example:

- A weight of **70 kg** and height of **1.75 m** produces a BMI of about **22.86**, which falls in the **"Normal"** category.
- A weight of **95 kg** and height of **1.75 m** produces a BMI of about **31.02**, which falls in the **"Obese"** category.
- A weight of **50 kg** and height of **1.75 m** produces a BMI of about **16.33**, which falls in the **"Underweight"** category.

Your function should return the category name as a string.

This exercise reinforces several important programming concepts:

- Applying a **mathematical formula** (BMI = weight / height²).
- Using **conditional chains** to classify continuous values.
- Understanding **boundary inclusivity** (`< 18.5` vs `>= 30`).
- Translating **health standards** into code logic.

Health classification systems are used in fitness apps, medical software, insurance calculations, and wellness tracking platforms.',
	param_names = '{weight_kg,height_m}'
WHERE slug = 'python-practical-bmi-calculator';
UPDATE problems SET
	statement = '**Sorting algorithms** are fundamental to computer science. Implementing a sorting algorithm from scratch — rather than calling a built-in function — builds deep understanding of how data organization actually works.

In this challenge, your task is to implement the **bubble sort** algorithm. This technique repeatedly steps through a list, compares adjacent elements, and swaps them if they are in the wrong order. After each full pass, the next largest element "bubbles up" to its correct position at the end. You must not use Python''s built-in `sort()` or `sorted()`.

For example:

- Sorting **[5, 3, 8, 1, 2]** using bubble sort produces **[1, 2, 3, 5, 8]**.
- Sorting **[1, 2, 3, 4, 5]** (already sorted) produces **[1, 2, 3, 4, 5]** with no swaps needed.
- Sorting **[]** or **[1]** produces the same list unchanged.

Your function should return a new list sorted in ascending order.

This exercise reinforces several important programming concepts:

- Implementing **comparison-based sorting** from scratch.
- Using **nested loops** for iterative refinement.
- Understanding **swap operations** and temporary variables.
- Recognizing **algorithm efficiency** and termination conditions.

Bubble sort, while not the most efficient for large datasets, is an excellent teaching tool for understanding the fundamental concepts behind all comparison-based sorting algorithms.',
	param_names = '{numbers}'
WHERE slug = 'python-practical-bubble-sort';
UPDATE problems SET
	statement = '**Financial calculations** are among the most practical applications of programming. Tracking income and expenses to compute a balance is a core feature of budgeting and accounting software.

In this challenge, your task is to calculate the overall balance for a personal budget. Given a list of income amounts and a list of expense amounts, compute the net balance — total income minus total expenses — rounded to two decimal places.

For example:

- **Income: [1000.00, 500.00]** and **expenses: [200.00, 150.00, 50.00]** produce a balance of **1100.00**.
- **Income: [500.00]** and **expenses: [600.00]** produce a balance of **-100.00** (overspent).
- **Income: []** and **expenses: []** produce a balance of **0.00**.

Your function should return the balance as a floating-point number rounded to two decimal places.

This exercise reinforces several important programming concepts:

- **Summing** values across multiple collections.
- **Subtracting** totals to compute a net value.
- **Rounding** financial results to a standard precision.
- Building **money-aware** arithmetic logic.

Budget calculations are used in personal finance apps, business accounting software, expense trackers, and financial planning tools.',
	param_names = '{incomes,expenses}'
WHERE slug = 'python-practical-budget-tracker';
UPDATE problems SET
	statement = '**Encryption and decryption** are mirror-image operations. Understanding how to reverse a transformation is just as important as applying it in the first place — and teaches symmetry in algorithm design.

In this challenge, your task is to implement the **decryption** companion for the Caesar cipher. Given an encrypted message and the shift amount used to encrypt it, recover the original message by shifting every letter backward by that same amount, wrapping around the alphabet and preserving casing.

For example:

- Decrypting **"Khoor, Zruog!"** with shift **3** recovers **"Hello, World!"**.
- Decrypting **"Bmfy f xywnsl!"** with shift **5** recovers **"What a string!"**.
- Decrypting **"Hello"** with shift **0** returns **"Hello"** unchanged.

Your function should return the decrypted message with all letters restored to their original positions.

This exercise reinforces several important programming concepts:

- Performing the **inverse operation** of an encryption algorithm.
- Using **modular arithmetic** for alphabet wrapping.
- **Preserving casing** during character transformations.
- Leaving **non-letter characters** untouched.

Decryption algorithms are fundamental to data security, secure communications, password storage, and information protection systems.',
	param_names = '{message,shift}'
WHERE slug = 'python-practical-caesar-decrypt';
UPDATE problems SET
	statement = 'The **Caesar cipher** is one of the oldest known encryption techniques, dating back to ancient Rome. Despite its simplicity, it introduces core concepts that carry forward to modern cryptography.

In this challenge, your task is to implement a Caesar cipher encryption function. Given a message and a shift amount, replace every letter with the letter that many positions later in the alphabet, wrapping back to the beginning after ''z'' or ''Z''. Preserve the original casing of each letter and leave non-letter characters (spaces, punctuation, digits) unchanged.

For example:

- Encrypting **"Hello, World!"** with shift **3** produces **"Khoor, Zruog!"**.
- Encrypting **"abc"** with shift **1** produces **"bcd"**.
- Encrypting **"xyz"** with shift **3** wraps around to produce **"abc"**.

Your function should return the encrypted message with all letters shifted and non-letters preserved.

This exercise reinforces several important programming concepts:

- Using **character codes** and arithmetic for letter shifting.
- Applying the **modulo operator** for wrap-around behavior.
- **Preserving casing** during character transformation.
- **Selectively transforming** only certain characters in a string.

The Caesar cipher introduces fundamental ideas about encryption that apply to more complex cryptographic systems used in secure communications today.',
	param_names = '{message,shift}'
WHERE slug = 'python-practical-caesar-encrypt';
UPDATE problems SET
	statement = 'Counters are commonly used to track values that change over time, such as button clicks, scores, inventory levels, or user interactions. 
By processing a sequence of actions in order, you can determine the final state of the counter.

In this challenge, your task is to process a list of counter actions. Each action will be one of the following:

- `increment` — Increase the counter by `1`.
- `decrement` — Decrease the counter by `1`.
- `reset` — Set the counter back to `0`.

Starting from an initial count of `0`, apply each action in the order it appears and determine the final value of the counter.

Your function should return the counter''s final value after all actions have been processed.

This exercise reinforces several important programming concepts:

- Iterating through a **list** of instructions.
- Updating a value based on different conditions.
- Using **conditional statements** to control program flow.
- Maintaining and modifying a running state throughout a sequence of operations.

Processing sequential actions is a common programming pattern used in interactive applications, games, event-driven systems, and state management.',
	param_names = '{actions}'
WHERE slug = 'python-practical-click-counter';
UPDATE problems SET
	statement = 'Working with **dates and calendars** involves complex rules — varying month lengths, leap years, and time zones. Python''s `datetime` module handles all of this complexity, making date arithmetic straightforward.

In this challenge, your task is to calculate the number of days between two dates. Given two date strings in "YYYY-MM-DD" format, compute the absolute difference in days. The result should always be non-negative, regardless of which date comes first chronologically.

For example:

- Between **"2024-01-01"** and **"2024-01-10"** there are **9** days.
- Between **"2024-03-01"** and **"2024-03-01"** (same date) there are **0** days.
- Between **"2024-12-25"** and **"2024-01-01"** there are **359** days (absolute value).

Your function should return the number of days as an integer.

This exercise reinforces several important programming concepts:

- Using Python''s **`datetime` module** for date parsing and arithmetic.
- Computing **`timedelta`** differences between dates.
- Using **`abs()`** to guarantee non-negative results.
- Handling **calendar complexity** through built-in libraries.

Date difference calculations are used in booking systems, project planning, age calculation, countdown apps, and deadline tracking.',
	param_names = '{date1,date2}'
WHERE slug = 'python-practical-countdown-calculator';
UPDATE problems SET
	statement = '**Time format conversion** is a common task in application development. Displaying a raw number of seconds as a human-readable hours:minutes:seconds string requires division, remainder, and zero-padded formatting.

In this challenge, your task is to convert a total number of seconds into a formatted time string in "HH:MM:SS" format, with each component padded to exactly two digits using leading zeros where necessary.

For example:

- **3725** seconds formats as **"01:02:05"** (1 hour, 2 minutes, 5 seconds).
- **0** seconds formats as **"00:00:00"**.
- **3661** seconds formats as **"01:01:01"** (1 hour, 1 minute, 1 second).

Your function should return the formatted time string.

This exercise reinforces several important programming concepts:

- Using **integer division** (`//`) to extract whole units.
- Using the **modulo operator** (`%`) to find remainders.
- **Zero-padding** values with `str.zfill()` or format strings.
- Converting between **raw units and display format**.

Time formatting is used in video players, cooking timers, workout apps, dashboards, and any application that displays durations.',
	param_names = '{total_seconds}'
WHERE slug = 'python-practical-countdown-formatter';
UPDATE problems SET
	statement = 'Calculating an **average** is one of the most common operations performed on numerical data. By combining the values in a collection and dividing by the total number of items, you can determine a value that represents the overall result.

In this challenge, your task is to calculate the **average** of a list of dice roll results. The average should be rounded to **two decimal places**. If the list contains no values, your function should return `0.0`.

Your function should return the average value of all recorded dice rolls.

This exercise reinforces several important programming concepts:

- Working with **lists** of numeric values.
- Calculating the **sum** and **average** of a collection.
- Handling edge cases, such as an empty list.
- Rounding numeric results to a specified number of decimal places.

Computing averages is a fundamental programming technique used in statistics, analytics, reporting, gaming, and many other real-world applications.',
	param_names = '{rolls}'
WHERE slug = 'python-practical-dice-average';
UPDATE problems SET
	statement = '**Comparison logic** with three possible outcomes is a fundamental programming pattern. Number-guessing games provide a simple, intuitive context for practicing conditional branching.

In this challenge, your task is to implement the feedback system for a number-guessing game. Given a secret number and the player''s guess, return "higher" if the guess is too low (the player needs to guess higher), "lower" if the guess is too high, or "correct" if the guess is exactly right.

For example:

- Secret **50** and guess **30** returns **"higher"** (guess 30 is too low).
- Secret **50** and guess **75** returns **"lower"** (guess 75 is too high).
- Secret **50** and guess **50** returns **"correct"**.

Your function should return the appropriate feedback string.

This exercise reinforces several important programming concepts:

- Using **conditional statements** to compare two values.
- Providing **directional feedback** that guides the user.
- Implementing **exact-match detection**.
- Covering all three possible **comparison outcomes**.

Comparison-based feedback is used in games, search algorithms, optimization problems, and any interactive system where user input needs evaluation.',
	param_names = '{secret,guess}'
WHERE slug = 'python-practical-guess-feedback';
UPDATE problems SET
	statement = '**String transformation** based on character-by-character conditions is a common pattern in text-based games and data processing. Revealing information selectively based on user input creates engaging interactive experiences.

In this challenge, your task is to implement the display logic for a Hangman word-guessing game. Given the secret word and a list of letters the player has guessed so far, return a string where every correctly guessed letter is shown in its proper position and every not-yet-guessed letter is replaced by an underscore.

For example:

- Word **"python"** with guessed letters **["p", "y", "z"]** displays as **"py____"**.
- Word **"hello"** with guessed letters **["h", "e"]** displays as **"he___"**.
- Word **"hello"** with guessed letters **["h", "e", "l", "o"]** displays as **"hello"**.

Your function should return the display string with underscores masking unguessed letters.

This exercise reinforces several important programming concepts:

- **Iterating** through each character of a string.
- **Membership testing** in a list of guessed letters.
- **Building** a result string character by character.
- Handling **duplicate letters** correctly.

Selective character display is used in word games, password masking, text-reveal animations, and any application where information is progressively revealed.',
	param_names = '{secret_word,guessed_letters}'
WHERE slug = 'python-practical-hangman-display';
UPDATE problems SET
	statement = '**Unit conversion** is a practical programming task that appears in countless applications. A single conversion factor connects two measurement systems, and the direction of conversion determines whether you multiply or divide.

In this challenge, your task is to implement a length converter that converts between inches and centimeters. Given a numeric value and a target unit ("cm" or "in"), convert the value into that target unit, rounded to two decimal places. Assume the given value is expressed in the opposite unit.

For example:

- Converting **10.0** to **"cm"** returns **25.4** (1 inch = 2.54 cm).
- Converting **25.4** to **"in"** returns **10.0** (the inverse operation).
- Converting **0.0** to **"cm"** returns **0.0**.

Your function should return the converted value rounded to two decimal places.

This exercise reinforces several important programming concepts:

- Using a **conversion factor** to translate between units.
- **Conditionally** multiplying or dividing based on target unit.
- **Rounding** results to a specified precision.
- Understanding **inverse operations** in measurement conversion.

Unit conversion is used in scientific computing, engineering applications, cooking apps, mapping software, and international commerce.',
	param_names = '{value,target_unit}'
WHERE slug = 'python-practical-length-converter';
UPDATE problems SET
	statement = '**Date arithmetic** is essential in many real-world applications. Calculating due dates, expiration dates, and deadlines requires correctly handling month boundaries, year boundaries, and varying month lengths.

In this challenge, your task is to calculate a future due date given a checkout date and a loan period in days. Given a starting date in "YYYY-MM-DD" format and the number of days in the loan period, compute and return the due date in the same date format.

For example:

- Checkout **"2024-01-20"** with a **14-day** loan produces a due date of **"2024-02-03"**.
- Checkout **"2024-12-20"** with a **20-day** loan produces **"2025-01-09"** (crosses into the new year).
- Checkout **"2024-02-28"** with a **1-day** loan produces **"2024-02-29"** (correctly handles leap year 2024).

Your function should return the due date as a string in "YYYY-MM-DD" format.

This exercise reinforces several important programming concepts:

- Using Python''s **`datetime` module** for date arithmetic.
- Adding a **`timedelta`** to a date object.
- Formatting dates back to **string representation**.
- Handling **calendar complexities** through built-in libraries.

Due date calculations are used in library systems, rental services, subscription billing, project management, and legal deadline tracking.',
	param_names = '{checkout_date,loan_days}'
WHERE slug = 'python-practical-library-due-date';
UPDATE problems SET
	statement = '**String substitution** is a fundamental text processing operation. Replacing placeholders in a template with provided values is used everywhere from form letters to code generation.

In this challenge, your task is to implement a Mad Libs story filler. Given a story template containing numbered placeholders like "{0}", "{1}", etc., and a list of words to fill them in with, replace each placeholder with the word at the matching position in the list.

For example:

- Template **"The {0} jumped over the {1}."** with words **["cat", "moon"]** produces **"The cat jumped over the moon."**.
- Template **"Once upon a {0}, there was a {1} who loved {2}."** with words **["time", "princess", "dancing"]** produces **"Once upon a time, there was a princess who loved dancing."**.
- Template **"Hello, {0}!"** with words **["world"]** produces **"Hello, world!"**.

Your function should return the completed story string.

This exercise reinforces several important programming concepts:

- Using **`str.replace()`** for placeholder substitution.
- **Iterating** through placeholders and replacement values together.
- Building a result string by **progressive replacement**.
- Understanding **string immutability** in Python.

Template substitution is used in document generation, email templates, reporting systems, code generation, and content management systems.',
	param_names = '{template,words}'
WHERE slug = 'python-practical-mad-libs';
UPDATE problems SET
	statement = '**Scoring and ranking** are fundamental data processing tasks. Personality quizzes and recommendation systems both rely on the same underlying logic: tally scores for each option and pick the winner.

In this challenge, your task is to implement the result-picking logic for a personality quiz. Given a list of four scores — representing Iron Man, Captain America, Thor, and Hulk in that order — determine which character has the highest score and return their name.

For example:

- Scores **[3, 5, 2, 1]** indicate **Captain America** (score 5) is the closest match.
- Scores **[8, 1, 3, 2]** indicate **Iron Man** (score 8) is the closest match.
- Scores **[1, 1, 1, 1]** (all tied) indicate **Iron Man** is the closest match (first among equals).

Your function should return the name of the character with the highest score.

This exercise reinforces several important programming concepts:

- Finding the **maximum value** in a list.
- **Tracking the index** of the maximum value.
- **Mapping indices** to corresponding labels.
- Handling **ties** by selecting the first occurrence.

Maximum-based selection is used in recommendation systems, voting applications, personality assessments, and any system that ranks multiple candidates.',
	param_names = '{scores}'
WHERE slug = 'python-practical-personality-quiz';
UPDATE problems SET
	statement = '**Comparing parallel lists** position by position is a common data processing pattern. Grading systems, survey analysis, and test scoring all rely on matching answers against answer keys.

In this challenge, your task is to implement the scoring logic for a quiz application. Given a list of a quiz-taker''s submitted answers and a matching list of correct answers, calculate how many questions were answered correctly by comparing them position by position.

For example:

- Submitted **["A", "B", "C"]** against correct **["A", "B", "D"]** produces a score of **2**.
- Submitted **["A", "B", "C"]** against correct **["A", "B", "C"]** produces a perfect score of **3**.
- Submitted **["A", "B", "C"]** against correct **["D", "E", "F"]** produces a score of **0**.

Your function should return the number of correct answers as an integer.

This exercise reinforces several important programming concepts:

- **Zipping** or pairing two lists for parallel iteration.
- Comparing **corresponding elements** position by position.
- **Counting** matches with an accumulator.
- Handling **equal-length** list comparison.

Parallel list comparison is used in automated grading, survey processing, data validation, and any system that checks answers against a key.',
	param_names = '{submitted_answers,correct_answers}'
WHERE slug = 'python-practical-quiz-score';
UPDATE problems SET
	statement = 'Rock-paper-scissors is a classic game that is often used to practice **conditional logic** and decision-making in programming.

Each round follows a simple set of rules that determine the winner based on the choices made by two players.

In this challenge, your task is to implement the referee logic for a two-player game of **rock-paper-scissors**.
Each player will choose one of three possible moves: `rock`, `paper`, or `scissors`.

Your function should compare both moves and return the appropriate result:

- `"Player 1"` if the first player''s move wins.
- `"Player 2"` if the second player''s move wins.
- `"Tie"` if both players choose the same move.

This exercise reinforces several important programming concepts:

- Using **conditional statements** to evaluate multiple outcomes.
- Comparing values to determine a result.
- Implementing rule-based decision logic.
- Translating real-world game rules into clear and maintainable code.

Building simple game logic is an excellent way to develop problem-solving skills and practice writing code that handles multiple conditions correctly.',
	param_names = '{player1,player2}'
WHERE slug = 'python-practical-rock-paper-scissors';
UPDATE problems SET
	statement = '**Selection sort** is a fundamental sorting algorithm that works by repeatedly finding the minimum element from the unsorted portion of a list and moving it to the front. Understanding different sorting strategies builds deeper algorithmic intuition.

In this challenge, your task is to implement the **selection sort** algorithm without using Python''s built-in `sort()` or `sorted()`. Scan the unsorted portion of the list for the smallest remaining value, swap it into the correct position, and repeat until the entire list is sorted.

For example:

- Sorting **[64, 25, 12, 22, 11]** produces **[11, 12, 22, 25, 64]**.
- Sorting **[1, 2, 3, 4, 5]** (already sorted) produces **[1, 2, 3, 4, 5]**.
- Sorting **[]** or **[42]** returns the list unchanged.

Your function should return a new list sorted in ascending order.

This exercise reinforces several important programming concepts:

- Using **nested loops** for repeated scanning.
- Finding the **minimum value** in a sublist.
- Performing **swap operations** with index tracking.
- Understanding the **algorithm structure** of in-place sorting.

Selection sort teaches the fundamental "find and place" strategy that underlies more advanced algorithms used in data processing and database systems.',
	param_names = '{numbers}'
WHERE slug = 'python-practical-selection-sort';
UPDATE problems SET
	statement = '**Arithmetic operations** are the foundation of all computational mathematics. A calculator engine must handle each operation correctly and guard against error conditions like division by zero.

In this challenge, your task is to implement the core calculation engine for a simple calculator. Given two numbers and an operator — one of "+", "-", "*", or "/" — compute and return the result. If the operator is "/" and the second number is zero, return `0.0` instead of attempting the division.

For example:

- Evaluating **10.0, 3.0, "/"** returns approximately **3.3333333333333335** (the standard floating-point result).
- Evaluating **10.0, 0.0, "/"** returns **0.0** (safe division-by-zero handling).
- Evaluating **5.0, 3.0, "+"** returns **8.0**.

Your function should return the computed numeric result.

This exercise reinforces several important programming concepts:

- Using **conditional branching** to select the correct operation.
- Handling the **division-by-zero** edge case safely.
- Working with **floating-point arithmetic**.
- Building a clean **operator dispatch** structure.

Calculator engines are used in spreadsheet software, financial applications, scientific computing, and every system that performs mathematical computations.',
	param_names = '{a,b,operator}'
WHERE slug = 'python-practical-simple-calculator';
UPDATE problems SET
	statement = '**Temperature conversion** is a classic beginner project that teaches conditional logic and formula application. Converting between Fahrenheit and Celsius requires understanding two different mathematical relationships.

In this challenge, your task is to implement a temperature converter. Given a temperature value and a target unit ("C" for Celsius or "F" for Fahrenheit), convert the value into that target unit, rounded to two decimal places. Assume the given value is expressed in the opposite unit.

For example:

- Converting **212.0** to **"C"** returns **100.0** (the boiling point of water in Celsius).
- Converting **100.0** to **"F"** returns **212.0** (the inverse conversion).
- Converting **-40.0** to **"C"** returns **-40.0** (the unique point where both scales meet).

Your function should return the converted temperature rounded to two decimal places.

This exercise reinforces several important programming concepts:

- Applying **different formulas** based on the target unit.
- Performing **multiplication and division** in the correct order.
- **Rounding** results to standard precision.
- Understanding **inverse transformations**.

Temperature conversion is used in weather apps, cooking applications, scientific software, and international commerce.',
	param_names = '{value,target_unit}'
WHERE slug = 'python-practical-temperature-converter';
UPDATE problems SET
	statement = 'Splitting a bill is a common financial calculation that combines percentages, arithmetic, and rounding. It is a practical problem that demonstrates how simple mathematical operations can be used to solve real-world tasks.

In this challenge, your task is to calculate how much each person should pay when a bill is split evenly among a group. The total bill should first be increased by the specified **tip percentage**, after which the final amount is divided equally among all participants.

Your function should return the amount each person owes, rounded to **two decimal places**.

This exercise reinforces several important programming concepts:

- Performing arithmetic calculations with multiple inputs.
- Calculating **percentages** and applying them to a total.
- Dividing a value evenly among a group.
- Rounding decimal values to a specified precision.

Bill splitting is a practical programming exercise that introduces financial calculations commonly used in payment systems, budgeting tools, expense trackers, and billing applications.',
	param_names = '{bill_total,tip_percent,num_people}'
WHERE slug = 'python-practical-tip-split';
UPDATE problems SET
	statement = '**State management** through a sequence of operations is a core programming pattern. A to-do list app''s underlying logic — add, remove, and mark complete — is a perfect example of maintaining and modifying a collection over time.

In this challenge, your task is to implement the task-management logic for a to-do list app. Given a list of operations, each formatted as "add <task>", "remove <task>", or "complete <task>", process them in order and return the final list of tasks still remaining, preserving their original addition order.

For example:

- Operations **["add buy milk", "add walk dog", "complete buy milk"]** leave only **["walk dog"]** remaining.
- Operations **["add task A", "add task B"]** (no removals) leave **["task A", "task B"]**.
- Operations **["add task A", "remove task A", "remove task A"]** leave **[]** (second removal has no effect).

Your function should return the list of remaining tasks in their original order.

This exercise reinforces several important programming concepts:

- **Parsing** structured command strings.
- **Modifying a list** by appending and removing elements.
- Handling **idempotent operations** (removing an already-removed item).
- **Sequential state updates** through a series of operations.

Task list management is used in project management tools, workflow systems, issue trackers, and personal organization applications.',
	param_names = '{operations}'
WHERE slug = 'python-practical-todo-list';
UPDATE problems SET
	statement = '**Text analysis** — splitting text into words, cleaning them, and counting frequencies — is a fundamental natural language processing skill. Word frequency analysis is used in search engines, document summarization, and content analysis.

In this challenge, your task is to build a word frequency counter. Given a paragraph of text, split it into individual words, ignore case differences and attached punctuation, and determine which word appears most frequently. Return that word in lowercase. If there is a tie, return whichever tied word appears first in the paragraph.

For example:

- The paragraph **"the quick brown fox jumps over the lazy dog. The dog barks."** has the word **"the"** appearing 3 times — more than any other word — so **"the"** is returned.
- The paragraph **"apple apple banana banana"** has a tie between **"apple"** and **"banana"** at 2 each, but **"apple"** appears first, so it is returned.
- The paragraph **"Hello world!"** returns **"hello"** after case normalization and punctuation removal.

Your function should return the most frequent word in lowercase.

This exercise reinforces several important programming concepts:

- **Splitting** text into tokens.
- **Cleaning** tokens by removing punctuation and normalizing case.
- **Counting** frequencies using a dictionary.
- Finding the **maximum value** in a frequency map.

Word frequency analysis is used in search engines, text classification, sentiment analysis, content recommendation, and information retrieval systems.',
	param_names = '{paragraph}'
WHERE slug = 'python-practical-word-counter';
