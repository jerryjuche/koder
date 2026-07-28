-- ROLLBACK — Generated: 2026-07-27 06:26:24
-- Module: python-practicals
-- Problems: 25

UPDATE problems SET
	statement = 'An alarm clock app''s snooze button needs to calculate a new alarm time by adding a fixed delay onto the current time — including correctly handling the case where that delay pushes the time past midnight into the next day.

Write the snooze calculation logic for such an alarm app. Given the current hour (0 to 23), current minute (0 to 59), and a snooze duration in minutes, calculate the new alarm time after snoozing, formatted as "HH:MM", correctly wrapping around to the next day if the snooze pushes past midnight.

For example, snoozing for 15 minutes starting from 7:50 results in a new alarm time of "08:05". Snoozing for 20 minutes starting from 23:50 results in a new alarm time of "00:10", correctly rolling over into the next day.',
	param_names = '{}'
WHERE slug = 'python-practical-alarm-snooze';
UPDATE problems SET
	statement = 'An alarm clock app that supports multiple configured alarms needs to check, on every tick of the clock, whether the current time matches any one of them.

Write the trigger-checking logic for such an app. Given the current time and a list of configured alarm times (both formatted consistently, such as "HH:MM"), determine whether the current time exactly matches any of the configured alarms.

For example, a current time of "07:00" checked against configured alarms of "06:30", "07:00", and "08:00" should trigger, since it exactly matches the second alarm in the list.',
	param_names = '{}'
WHERE slug = 'python-practical-alarm-trigger';
UPDATE problems SET
	statement = 'A fitness or health-tracking app commonly reports a user''s Body Mass Index (BMI) alongside its standard health category, calculated from the user''s weight and height.

Write the BMI calculation logic for such an app. Given a person''s weight in kilograms and height in meters, calculate their BMI and categorize it as "Underweight" (below 18.5), "Normal" (18.5 up to 25), "Overweight" (25 up to 30), or "Obese" (30 and above).

For example, a weight of 70 kilograms and a height of 1.75 meters produces a BMI of approximately 22.86, which falls in the "Normal" category.',
	param_names = '{}'
WHERE slug = 'python-practical-bmi-calculator';
UPDATE problems SET
	statement = 'Understanding how sorting actually works under the hood, rather than just calling a built-in function, is one of the most valuable exercises for building real algorithmic intuition.

Write a function that sorts a list of numbers into ascending order using the bubble sort technique — repeatedly comparing neighboring elements and swapping them if they are out of order — without using Python''s built-in `sort()` or `sorted()`.

For example, the list containing 5, 3, 8, 1, and 2, sorted using this technique, becomes 1, 2, 3, 5, and 8.',
	param_names = '{}'
WHERE slug = 'python-practical-bubble-sort';
UPDATE problems SET
	statement = 'A personal budgeting app''s core feature is simple to describe but genuinely useful: track everything coming in, track everything going out, and report the current balance.

Write the balance calculation logic for such an app. Given a list of income amounts and a list of expense amounts, calculate the overall balance — total income minus total expenses — rounded to two decimal places.

For example, income entries of 1000.00 and 500.00 combined with expense entries of 200.00, 150.00, and 50.00 produce a balance of 1100.00.',
	param_names = '{}'
WHERE slug = 'python-practical-budget-tracker';
UPDATE problems SET
	statement = 'Every encryption technique needs a matching way to reverse it, or the encoded message would be permanently unreadable. This project builds the companion decryption function for the Caesar cipher.

Write a text decryption function. Given a message that was encrypted using the Caesar cipher with a specific shift amount, recover and return the original message by shifting every letter backward by that same amount, wrapping around the alphabet as needed and preserving casing exactly.

For example, decrypting "Khoor, Zruog!" with a shift of 3 recovers the original message, "Hello, World!".',
	param_names = '{}'
WHERE slug = 'python-practical-caesar-decrypt';
UPDATE problems SET
	statement = 'This project recreates one of the oldest known encryption techniques, the Caesar cipher, which encodes a message by shifting every letter forward through the alphabet by a fixed amount.

Write a text encryption generator. Given a message and a shift amount, replace every letter in the message with the letter that many positions later in the alphabet, wrapping back around to the start if the shift goes past ''z'' or ''Z''. Preserve the original casing and leave non-letter characters unchanged.

For example, encrypting "Hello, World!" with a shift of 3 produces "Khoor, Zruog!" — each letter has moved 3 positions forward, while punctuation remains untouched.',
	param_names = '{}'
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
	param_names = '{}'
WHERE slug = 'python-practical-click-counter';
UPDATE problems SET
	statement = 'Counting down (or up) to an important date is a genuinely useful little tool, and a great introduction to Python''s datetime module, which handles all of the tricky calendar arithmetic (leap years, varying month lengths, and so on) automatically.

Write a countdown calculator. Given two dates, each formatted as a string in "YYYY-MM-DD" form, calculate the number of days between them. The result should always be a non-negative number of days, regardless of which of the two dates comes first chronologically.

For example, the dates "2024-01-01" and "2024-01-10" are 9 days apart.',
	param_names = '{}'
WHERE slug = 'python-practical-countdown-calculator';
UPDATE problems SET
	statement = 'Every countdown timer, whether in a cooking app, a workout app, or a game, needs to convert a raw number of seconds into a familiar hours-minutes-seconds display.

Write the display-formatting logic for such a timer. Given a total number of seconds remaining, format it as a string in the form "HH:MM:SS", with each component padded to exactly two digits using a leading zero where necessary.

For example, 3725 seconds is exactly 1 hour, 2 minutes, and 5 seconds, so it should be formatted as "01:02:05".',
	param_names = '{}'
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
	param_names = '{}'
WHERE slug = 'python-practical-dice-average';
UPDATE problems SET
	statement = 'The number-guessing game is a beginner classic: the program picks a secret number, and the player guesses repeatedly, receiving feedback after each attempt until they find it.

Write the feedback logic for such a game. Given the secret number and the player''s current guess, return "higher" if the player needs to guess a higher number next, "lower" if they need to guess a lower number, or "correct" if they have guessed exactly right.

For example, with a secret number of 50, a guess of 30 should receive the feedback "higher", since the player needs to guess higher to get closer to 50.',
	param_names = '{}'
WHERE slug = 'python-practical-guess-feedback';
UPDATE problems SET
	statement = 'The Hangman word-guessing game constantly needs to redraw its display: revealing letters the player has already guessed correctly, and masking every letter they have not guessed yet.

Write the display logic for a Hangman game. Given the secret word and a list of letters the player has guessed so far, return a string showing every correctly guessed letter in its proper position, with every not-yet-guessed letter replaced by an underscore.

For example, the word "python" with guessed letters "p", "y", and "z" should display as "py____", since only the letters "p" and "y" have been guessed so far.',
	param_names = '{}'
WHERE slug = 'python-practical-hangman-display';
UPDATE problems SET
	statement = 'Extending the idea of a unit converter to a different kind of measurement is a great way to notice how much of the underlying structure stays the same, even though the actual conversion formula changes completely.

Write the underlying conversion logic for a length converter. Given a value and a target unit — either "cm" for centimeters or "in" for inches — convert the value into that target unit, rounded to two decimal places, assuming the given value is expressed in whichever unit is not the target.

For example, converting the value 10.0 to "cm" produces 25.4, since one inch equals exactly 2.54 centimeters. Converting the value 25.4 to "in" produces exactly 10.0 again.',
	param_names = '{}'
WHERE slug = 'python-practical-length-converter';
UPDATE problems SET
	statement = 'Library systems, equipment rental services, and countless other applications need to calculate a future due date by adding a fixed loan period onto a starting date, correctly handling every month and year boundary along the way.

Write a due-date calculator. Given a checkout date formatted as "YYYY-MM-DD" and a loan period in days, calculate the due date and return it in that same date format.

For example, a book checked out on "2024-01-20" with a 14-day loan period is due on "2024-02-03" — the calculation correctly carries the date over from January into February.',
	param_names = '{}'
WHERE slug = 'python-practical-library-due-date';
UPDATE problems SET
	statement = 'Mad Libs — the game where you supply random words to fill in the blanks of a story without knowing what it says, producing a silly result — is a lighthearted, genuinely fun first project for practicing string templates and substitution.

Write a Mad Libs filler. Given a story template containing numbered placeholders in the form "{0}", "{1}", and so on, and a list of words to fill them in with, replace each placeholder with the word at the matching position in the list, and return the completed story.

For example, the template "The {0} jumped over the {1}." filled in with the words "cat" and "moon" produces "The cat jumped over the moon."',
	param_names = '{}'
WHERE slug = 'python-practical-mad-libs';
UPDATE problems SET
	statement = '"Which character are you?" personality quizzes are a genuinely fun beginner project: behind the playful presentation, they are really just a straightforward scoring system that tracks points for each possible outcome and reports whichever one accumulated the most.

Write the result-picking logic for such a quiz, matching a user''s answers to one of four Avengers: Iron Man, Captain America, Thor, and Hulk. Given a list of four scores — one for each character, in that order — determine which character the user matches best by returning the name of the character with the highest score.

For example, scores of 3, 5, 2, and 1 indicate the user matches Captain America most closely, since that score is the highest.',
	param_names = '{}'
WHERE slug = 'python-practical-personality-quiz';
UPDATE problems SET
	statement = 'Every interactive quiz application, however elaborate its interface, comes down to the same core logic underneath: compare what the user answered against the correct answers, and tally up the score.

Write the scoring logic for a quiz application. Given a list of a quiz-taker''s submitted answers and a matching list of correct answers, calculate how many questions were answered correctly.

For example, submitted answers of "A", "B", and "C" compared against correct answers of "A", "B", and "D" produce a score of 2, since the first two answers match and the third does not.',
	param_names = '{}'
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
	param_names = '{}'
WHERE slug = 'python-practical-rock-paper-scissors';
UPDATE problems SET
	statement = 'This project builds a second sorting algorithm from scratch, using a completely different strategy than bubble sort, which is a great way to notice that "sorting" is not just one single technique.

Write a function that sorts a list of numbers into ascending order using the selection sort technique — repeatedly finding the minimum value in the unsorted portion of the list and moving it into place — without using Python''s built-in `sort()` or `sorted()`.

For example, the list containing 64, 25, 12, 22, and 11, sorted using this technique, becomes 11, 12, 22, 25, and 64.',
	param_names = '{}'
WHERE slug = 'python-practical-selection-sort';
UPDATE problems SET
	statement = 'Every calculator app, no matter how many advanced features it eventually grows, starts from the same small core: given two numbers and an operator, compute the result.

Write the calculation engine for a simple calculator. Given two numbers and an operator — one of "+", "-", "*", or "/" — compute and return the result of applying that operator to the two numbers. If the operator is "/" and the second number is zero, return 0.0 instead of attempting an impossible division.

For example, evaluating 10.0, 3.0, with the operator "/" produces approximately 3.33.',
	param_names = '{}'
WHERE slug = 'python-practical-simple-calculator';
UPDATE problems SET
	statement = 'This is a classic first project for getting comfortable with conditional logic and simple mathematical formulas: a converter that translates a temperature reading between Fahrenheit and Celsius in either direction.

Write the underlying conversion logic for a temperature converter. Given a temperature value and a target unit — either "C" for Celsius or "F" for Fahrenheit — convert the value into that target unit, rounded to two decimal places. The function should assume the given value is already expressed in whichever unit is not the target.

For example, converting the value 212.0 to "C" produces 100.0, since 212 degrees Fahrenheit is exactly the boiling point of water in Celsius. Converting the value 100.0 to "F" produces 212.0.',
	param_names = '{}'
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
	param_names = '{}'
WHERE slug = 'python-practical-tip-split';
UPDATE problems SET
	statement = 'Every to-do list app, no matter how polished its interface, is built on the same underlying logic: a running list of tasks that grows when items are added and shrinks when they are removed or marked complete.

Write the task-management logic for such an app. Given a sequence of operations, each formatted as "add <task>", "remove <task>", or "complete <task>", process them in order and return the final list of tasks still remaining (neither removed nor completed), in the order they were originally added.

For example, the operations "add buy milk", "add walk dog", and "complete buy milk" leave only "walk dog" remaining on the list.',
	param_names = '{}'
WHERE slug = 'python-practical-todo-list';
UPDATE problems SET
	statement = 'A word-frequency counter is a clean, classic beginner project for practicing string processing, loops, and dictionaries together — and it is genuinely useful for basic text analysis.

Write a word counter. Given a paragraph of text, split it into individual words, ignore case differences and any attached punctuation, and determine which word appears most frequently. Return that most frequent word in lowercase. If there is a tie, return whichever of the tied words appears first in the paragraph.

For example, the paragraph "the quick brown fox jumps over the lazy dog. The dog barks." contains the word "the" three times, more than any other word, so "the" should be returned.',
	param_names = '{}'
WHERE slug = 'python-practical-word-counter';
