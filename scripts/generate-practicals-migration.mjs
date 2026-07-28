import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const problems = JSON.parse(readFileSync(join(ROOT, "problems_python-practicals.json"), "utf8"));

// ── Helpers ────────────────────────────────────────────────────────────────

function esc(text) {
  return text.replace(/'/g, "''");
}

function pgArray(arr) {
  const inner = arr.map((e) => `"${esc(e.replace(/"/g, '\\"').replace(/\n/g, "\\n"))}"`).join(",");
  return `'{${inner}}'`;
}

function pgLiteral(str) {
  return `E'${esc(str.replace(/\n/g, "\\n"))}'`;
}

function pgJSON(val) {
  return JSON.stringify(val);
}

// ── Test case definitions ──────────────────────────────────────────────────

const TEST_CASES = {
  "python-practical-alarm-snooze": [
    [false, 1, [7, 50, 15], "08:05"],
    [false, 2, [23, 50, 20], "00:10"],
    [false, 3, [14, 30, 0], "14:30"],
    [true, 4, [0, 0, 1440], "00:00"],
    [true, 5, [12, 0, 60], "13:00"],
    [true, 6, [23, 59, 1], "00:00"],
    [true, 7, [5, 0, 0], "05:00"],
  ],
  "python-practical-alarm-trigger": [
    [false, 1, ["07:00", ["06:30", "07:00", "08:00"]], true],
    [false, 2, ["07:30", ["06:30", "07:00", "08:00"]], false],
    [false, 3, ["12:00", []], false],
    [true, 4, ["00:00", ["00:00"]], true],
    [true, 5, ["23:59", ["00:00", "23:59"]], true],
    [true, 6, ["10:00", ["10:00", "10:00"]], true],
    [true, 7, ["10:00", ["10:01"]], false],
  ],
  "python-practical-bmi-calculator": [
    [false, 1, [70, 1.75], "Normal"],
    [false, 2, [95, 1.75], "Obese"],
    [false, 3, [50, 1.75], "Underweight"],
    [true, 4, [85, 1.7], "Overweight"],
    [true, 5, [45, 1.6], "Underweight"],
    [true, 6, [100, 1.8], "Obese"],
    [true, 7, [60, 1.7], "Normal"],
  ],
  "python-practical-bubble-sort": [
    [false, 1, [[5, 3, 8, 1, 2]], [1, 2, 3, 5, 8]],
    [false, 2, [[1, 2, 3, 4, 5]], [1, 2, 3, 4, 5]],
    [false, 3, [[]], []],
    [true, 4, [[1]], [1]],
    [true, 5, [[3, 3, 3, 3]], [3, 3, 3, 3]],
    [true, 6, [[9, 8, 7, 6, 5]], [5, 6, 7, 8, 9]],
    [true, 7, [[-3, -1, -5, -2]], [-5, -3, -2, -1]],
  ],
  "python-practical-budget-tracker": [
    [false, 1, [[1000, 500], [200, 150, 50]], 1100.0],
    [false, 2, [[500], [600]], -100.0],
    [false, 3, [[], []], 0.0],
    [true, 4, [[100], [100]], 0.0],
    [true, 5, [[1000], []], 1000.0],
    [true, 6, [[], [500]], -500.0],
    [true, 7, [[10, 20, 30], [5, 15]], 40.0],
  ],
  "python-practical-caesar-decrypt": [
    [false, 1, ["Khoor, Zruog!", 3], "Hello, World!"],
    [false, 2, ["Bmfy f xywnsl!", 5], "What a string!"],
    [false, 3, ["Hello", 0], "Hello"],
    [true, 4, ["Abc", 1], "Zab"],
    [true, 5, ["Xyz", 26], "Xyz"],
    [true, 6, ["a", 25], "b"],
    [true, 7, [",.!", 10], ",.!"],
  ],
  "python-practical-caesar-encrypt": [
    [false, 1, ["Hello, World!", 3], "Khoor, Zruog!"],
    [false, 2, ["abc", 1], "bcd"],
    [false, 3, ["xyz", 3], "abc"],
    [true, 4, ["ABC", 1], "BCD"],
    [true, 5, ["xyz", 26], "xyz"],
    [true, 6, ["z", 1], "a"],
    [true, 7, ["Test 123!", 5], "Yjxy 123!"],
  ],
  "python-practical-click-counter": [
    [false, 1, [["increment", "increment", "decrement"]], 1],
    [false, 2, [["reset", "increment"]], 1],
    [false, 3, [[]], 0],
    [true, 4, [["increment", "increment", "increment", "increment", "increment"]], 5],
    [true, 5, [["increment", "decrement", "increment", "decrement", "increment", "decrement"]], 0],
    [true, 6, [["decrement", "decrement"]], -2],
    [true, 7, [["increment", "reset", "increment", "increment"]], 2],
  ],
  "python-practical-countdown-calculator": [
    [false, 1, ["2024-01-01", "2024-01-10"], 9],
    [false, 2, ["2024-03-01", "2024-03-01"], 0],
    [false, 3, ["2024-12-25", "2024-01-01"], 359],
    [true, 4, ["2024-01-10", "2024-01-01"], 9],
    [true, 5, ["2023-01-01", "2024-01-01"], 365],
    [true, 6, ["2024-01-01", "2025-01-01"], 366],
    [true, 7, ["2020-01-01", "2020-12-31"], 365],
  ],
  "python-practical-countdown-formatter": [
    [false, 1, [3725], "01:02:05"],
    [false, 2, [0], "00:00:00"],
    [false, 3, [3661], "01:01:01"],
    [true, 4, [3600], "01:00:00"],
    [true, 5, [86399], "23:59:59"],
    [true, 6, [59], "00:00:59"],
    [true, 7, [100000], "27:46:40"],
  ],
  "python-practical-dice-average": [
    [false, 1, [[3, 5, 2, 6, 4]], 4.0],
    [false, 2, [[1, 1, 1, 1, 1, 1]], 1.0],
    [false, 3, [[]], 0.0],
    [true, 4, [[6]], 6.0],
    [true, 5, [[1, 6]], 3.5],
    [true, 6, [[4, 4, 4, 4, 4]], 4.0],
    [true, 7, [[2, 3]], 2.5],
  ],
  "python-practical-guess-feedback": [
    [false, 1, [50, 30], "higher"],
    [false, 2, [50, 75], "lower"],
    [false, 3, [50, 50], "correct"],
    [true, 4, [0, -5], "higher"],
    [true, 5, [0, 5], "lower"],
    [true, 6, [-10, -10], "correct"],
    [true, 7, [100, 0], "higher"],
  ],
  "python-practical-hangman-display": [
    [false, 1, ["python", ["p", "y", "z"]], "py____"],
    [false, 2, ["hello", ["h", "e"]], "he___"],
    [false, 3, ["hello", ["h", "e", "l", "o"]], "hello"],
    [true, 4, ["a", ["a"]], "a"],
    [true, 5, ["test", []], "____"],
    [true, 6, ["bookkeeper", ["o", "k", "e"]], "_o_k_ee_e_"],
    [true, 7, ["abc", ["a", "b", "c"]], "abc"],
  ],
  "python-practical-length-converter": [
    [false, 1, [10.0, "cm"], 25.4],
    [false, 2, [25.4, "in"], 10.0],
    [false, 3, [0.0, "cm"], 0.0],
    [true, 4, [1.0, "cm"], 2.54],
    [true, 5, [2.54, "in"], 1.0],
    [true, 6, [100.0, "cm"], 254.0],
    [true, 7, [50.0, "in"], 19.69],
  ],
  "python-practical-library-due-date": [
    [false, 1, ["2024-01-20", 14], "2024-02-03"],
    [false, 2, ["2024-12-20", 20], "2025-01-09"],
    [false, 3, ["2024-02-28", 1], "2024-02-29"],
    [true, 4, ["2023-02-28", 1], "2023-03-01"],
    [true, 5, ["2024-01-01", 365], "2024-12-31"],
    [true, 6, ["2024-12-31", 1], "2025-01-01"],
    [true, 7, ["2024-06-15", 0], "2024-06-15"],
  ],
  "python-practical-mad-libs": [
    [false, 1, ["The {0} jumped over the {1}.", ["cat", "moon"]], "The cat jumped over the moon."],
    [false, 2, ["Once upon a {0}, there was a {1} who loved {2}.", ["time", "princess", "dancing"]], "Once upon a time, there was a princess who loved dancing."],
    [false, 3, ["Hello, {0}!", ["world"]], "Hello, world!"],
    [true, 4, ["{0}", ["test"]], "test"],
    [true, 5, ["No placeholders.", []], "No placeholders."],
    [true, 6, ["{0} {1} {0}", ["a", "b"]], "a b a"],
    [true, 7, ["", []], ""],
  ],
  "python-practical-personality-quiz": [
    [false, 1, [[3, 5, 2, 1]], "Captain America"],
    [false, 2, [[8, 1, 3, 2]], "Iron Man"],
    [false, 3, [[1, 1, 1, 1]], "Iron Man"],
    [true, 4, [[0, 0, 0, 10]], "Hulk"],
    [true, 5, [[10, 0, 0, 0]], "Iron Man"],
    [true, 6, [[0, 10, 0, 0]], "Captain America"],
    [true, 7, [[5, 5, 5, 5]], "Iron Man"],
  ],
  "python-practical-quiz-score": [
    [false, 1, [["A", "B", "C"], ["A", "B", "D"]], 2],
    [false, 2, [["A", "B", "C"], ["A", "B", "C"]], 3],
    [false, 3, [["A", "B", "C"], ["D", "E", "F"]], 0],
    [true, 4, [[], []], 0],
    [true, 5, [["A"], ["A"]], 1],
    [true, 6, [["a", "b", "c"], ["A", "B", "C"]], 0],
    [true, 7, [["1", "2"], ["1", "2"]], 2],
  ],
  "python-practical-rock-paper-scissors": [
    [false, 1, ["rock", "scissors"], "Player 1"],
    [false, 2, ["scissors", "rock"], "Player 2"],
    [false, 3, ["rock", "rock"], "Tie"],
    [true, 4, ["paper", "rock"], "Player 1"],
    [true, 5, ["scissors", "paper"], "Player 1"],
    [true, 6, ["paper", "scissors"], "Player 2"],
    [true, 7, ["paper", "paper"], "Tie"],
  ],
  "python-practical-selection-sort": [
    [false, 1, [[64, 25, 12, 22, 11]], [11, 12, 22, 25, 64]],
    [false, 2, [[1, 2, 3, 4, 5]], [1, 2, 3, 4, 5]],
    [false, 3, [[]], []],
    [true, 4, [[42]], [42]],
    [true, 5, [[5, 4, 3, 2, 1]], [1, 2, 3, 4, 5]],
    [true, 6, [[-5, -10, 0, 10]], [-10, -5, 0, 10]],
    [true, 7, [[7, 7, 7]], [7, 7, 7]],
  ],
  "python-practical-simple-calculator": [
    [false, 1, [10.0, 3.0, "/"], 3.3333333333333335],
    [false, 2, [10.0, 0.0, "/"], 0.0],
    [false, 3, [5.0, 3.0, "+"], 8.0],
    [true, 4, [10.0, 3.0, "-"], 7.0],
    [true, 5, [5.0, 3.0, "*"], 15.0],
    [true, 6, [0.0, 5.0, "*"], 0.0],
    [true, 7, [10.0, 4.0, "/"], 2.5],
  ],
  "python-practical-temperature-converter": [
    [false, 1, [212.0, "C"], 100.0],
    [false, 2, [100.0, "F"], 212.0],
    [false, 3, [-40.0, "C"], -40.0],
    [true, 4, [0.0, "C"], -17.78],
    [true, 5, [-40.0, "F"], -40.0],
    [true, 6, [32.0, "C"], 0.0],
    [true, 7, [0.0, "F"], 32.0],
  ],
  "python-practical-tip-split": [
    [false, 1, [100.0, 15.0, 4], 28.75],
    [false, 2, [50.0, 20.0, 2], 30.0],
    [false, 3, [0.0, 10.0, 1], 0.0],
    [true, 4, [100.0, 0.0, 1], 100.0],
    [true, 5, [200.0, 10.0, 2], 110.0],
    [true, 6, [75.0, 15.0, 3], 28.75],
    [true, 7, [50.0, 25.0, 5], 12.5],
  ],
  "python-practical-todo-list": [
    [false, 1, [["add buy milk", "add walk dog", "complete buy milk"]], ["walk dog"]],
    [false, 2, [["add task A", "add task B"]], ["task A", "task B"]],
    [false, 3, [["add task A", "remove task A", "remove task A"]], []],
    [true, 4, [["add a", "remove a", "add a"]], ["a"]],
    [true, 5, [["add x", "complete x", "add x"]], ["x"]],
    [true, 6, [[]], []],
    [true, 7, [["add 1", "add 2", "remove 2", "add 3"]], ["1", "3"]],
  ],
  "python-practical-word-counter": [
    [false, 1, ["the quick brown fox jumps over the lazy dog. The dog barks."], "the"],
    [false, 2, ["apple apple banana banana"], "apple"],
    [false, 3, ["Hello world!"], "hello"],
    [true, 4, ["a a a b b b"], "a"],
    [true, 5, ["Python, python, PYTHON!"], "python"],
    [true, 6, ["word word word."], "word"],
    [true, 7, ["test"], "test"],
  ],
};

// ── Problem metadata ───────────────────────────────────────────────────────

const CONSTRAINTS = {
  "python-practical-alarm-snooze": "- Input hour range: 0 ≤ hour ≤ 23\\n- Input minute range: 0 ≤ minute ≤ 59\\n- Snooze duration range: 0 ≤ snooze ≤ 10_000\\n- Return a string in \"HH:MM\" format with zero-padded components",
  "python-practical-alarm-trigger": "- Current time is a string in \"HH:MM\" 24-hour format\\n- Alarm times list length: 0 ≤ len(alarm_times) ≤ 100\\n- Each alarm time is in \"HH:MM\" 24-hour format\\n- Return a boolean True/False",
  "python-practical-bmi-calculator": "- Weight range: 1 ≤ weight_kg ≤ 500 (positive weight in kilograms)\\n- Height range: 0.5 ≤ height_m ≤ 2.5 (height in meters)\\n- Return one of: \"Underweight\", \"Normal\", \"Overweight\", \"Obese\"\\n- BMI thresholds: <18.5 Underweight, 18.5-24.999 Normal, 25-29.999 Overweight, >=30 Obese",
  "python-practical-bubble-sort": "- Input list length: 0 ≤ len(numbers) ≤ 1_000\\n- Element range: -10_000 ≤ numbers[i] ≤ 10_000\\n- Elements are integers\\n- Must NOT use Python's built-in sort() or sorted()",
  "python-practical-budget-tracker": "- Each list length: 0 ≤ len(list) ≤ 1_000\\n- Individual amounts: -100_000 ≤ amount ≤ 100_000\\n- Return a float rounded to two decimal places\\n- Empty lists are valid inputs (balance = 0.0)",
  "python-practical-caesar-decrypt": "- Message length: 0 ≤ len(message) ≤ 10_000\\n- Shift range: 0 ≤ shift ≤ 10_000 (any non-negative integer)\\n- Only letters are shifted; preserve casing\\n- Non-letter characters pass through unchanged",
  "python-practical-caesar-encrypt": "- Message length: 0 ≤ len(message) ≤ 10_000\\n- Shift range: 0 ≤ shift ≤ 10_000\\n- Only letters are shifted; preserve casing\\n- Non-letter characters pass through unchanged",  
  "python-practical-click-counter": "- Actions list length: 0 ≤ len(actions) ≤ 1_000\\n- Each action is one of: \"increment\", \"decrement\", \"reset\"\\n- Counter starts at 0\\n- Counter may go negative",
  "python-practical-countdown-calculator": "- Dates are strings in \"YYYY-MM-DD\" format\\n- Valid Gregorian calendar dates only (year 1900-2100)\\n- Return a non-negative integer (absolute difference)\\n- Same date returns 0",
  "python-practical-countdown-formatter": "- Input range: 0 ≤ total_seconds ≤ 1_000_000\\n- Return a string in \"HH:MM:SS\" format\\n- Each component is zero-padded to exactly 2 digits\\n- 0 seconds returns \"00:00:00\"",
  "python-practical-dice-average": "- Rolls list length: 0 ≤ len(rolls) ≤ 10_000\\n- Each roll value: 1 ≤ roll ≤ 6 (standard six-sided die)\\n- Return a float rounded to two decimal places\\n- Empty list returns 0.0",
  "python-practical-guess-feedback": "- Integer values only (no range restrictions)\\n- Return one of: \"higher\", \"lower\", \"correct\"\\n- Guess may equal, be less than, or be greater than secret\\n- Mathematically exact comparison is used",
  "python-practical-hangman-display": "- Secret word length: 1 ≤ len(secret_word) ≤ 100\\n- Guessed letters list length: 0 ≤ len(guessed_letters) ≤ 52\\n- Letters are single alphabetic characters (a-z, A-Z)\\n- Duplicate guessed letters are acceptable",
  "python-practical-length-converter": "- Input value range: -1_000_000 ≤ value ≤ 1_000_000\\n- Target unit is one of: \"cm\" (centimeters), \"in\" (inches)\\n- Return a float rounded to two decimal places\\n- 1 inch = 2.54 centimeters exactly",
  "python-practical-library-due-date": "- Checkout date in \"YYYY-MM-DD\" format\\n- Loan days range: 0 ≤ loan_days ≤ 365\\n- Return a string in \"YYYY-MM-DD\" format\\n- Handles leap years and month/year boundaries",
  "python-practical-mad-libs": "- Template length: 0 ≤ len(template) ≤ 1_000\\n- Words list length: 0 ≤ len(words) ≤ 100\\n- Placeholders are numbered: {0}, {1}, {2}, ...\\n- Each placeholder is replaced with the word at the matching index",
  "python-practical-personality-quiz": "- Scores list always has exactly 4 elements\\n- Score range: 0 ≤ score ≤ 1_000\\n- Returns one of: \"Iron Man\", \"Captain America\", \"Thor\", \"Hulk\"\\n- Ties go to the first character with that score",
  "python-practical-quiz-score": "- Both lists have the same length: 0 ≤ len(answers) ≤ 100\\n- Each answer is a string (case-sensitive)\\n- Return an integer count of matching answers\\n- Empty lists return 0",
  "python-practical-rock-paper-scissors": "- Each move is one of: \"rock\", \"paper\", \"scissors\"\\n- Case-sensitive input (lowercase only)\\n- Return one of: \"Player 1\", \"Player 2\", \"Tie\"\\n- Same move always results in a tie",
  "python-practical-selection-sort": "- Input list length: 0 ≤ len(numbers) ≤ 1_000\\n- Element range: -10_000 ≤ numbers[i] ≤ 10_000\\n- Elements are integers\\n- Must NOT use Python's built-in sort() or sorted()",
  "python-practical-simple-calculator": "- Input values are floats (any valid float range)\\n- Operator is one of: \"+\", \"-\", \"*\", \"/\"\\n- Return a float (the computed result)\\n- Division by zero returns 0.0 (does not raise an error)",
  "python-practical-temperature-converter": "- Temperature range: -459.67 ≤ value ≤ 10_000\\n- Target unit is one of: \"C\" (Celsius), \"F\" (Fahrenheit)\\n- Return a float rounded to two decimal places\\n- Formula: F → C = (value - 32) × 5/9; C → F = value × 9/5 + 32",
  "python-practical-tip-split": "- Bill total range: 0 ≤ bill_total ≤ 100_000\\n- Tip percent range: 0 ≤ tip_percent ≤ 100\\n- Number of people range: 1 ≤ num_people ≤ 1_000\\n- Return a float rounded to two decimal places",
  "python-practical-todo-list": "- Operations list length: 0 ≤ len(operations) ≤ 1_000\\n- Each operation format: \"add <task>\", \"remove <task>\", or \"complete <task>\"\\n- Tasks are non-empty strings (no leading/trailing spaces)\\n- Removing a non-existent task has no effect",
  "python-practical-word-counter": "- Paragraph length: 1 ≤ len(paragraph) ≤ 10_000\\n- Words are separated by whitespace\\n- Punctuation attached to words is stripped\\n- Comparison is case-insensitive; return in lowercase",
};

const LEARNING_OBJECTIVES = {
  "python-practical-alarm-snooze": "Convert between time units (hours/minutes → total minutes), apply modulo arithmetic for wrap-around, and format output with zero-padded strings.",
  "python-practical-alarm-trigger": "Perform membership testing in lists using the `in` operator, iterate over collections, and handle empty-list edge cases.",
  "python-practical-bmi-calculator": "Apply a mathematical formula (BMI = weight / height²), chain conditional statements for categorical classification, and handle boundary inclusivity correctly.",
  "python-practical-bubble-sort": "Implement comparison-based sorting from scratch using nested loops, swap operations, and early-termination optimization.",
  "python-practical-budget-tracker": "Sum numerical values across multiple collections, compute a net difference, and round financial results to standard precision.",
  "python-practical-caesar-decrypt": "Reverse a character-level transformation using modular arithmetic, preserve casing during inverse operations, and leave non-alphabetic characters untouched.",
  "python-practical-caesar-encrypt": "Apply a character-shifting cipher using modular arithmetic, preserve original casing, and selectively transform only alphabetic characters.",
  "python-practical-click-counter": "Process a sequence of commands sequentially, maintain running state across multiple operations, and dispatch actions based on string identifiers.",
  "python-practical-countdown-calculator": "Parse date strings with Python's datetime module, compute timedelta differences, and use abs() to guarantee non-negative results.",
  "python-practical-countdown-formatter": "Convert raw seconds into hours/minutes/seconds using integer division and modulo, and format components with zero-padded strings.",
  "python-practical-dice-average": "Calculate the arithmetic mean of a numerical collection, guard against division by zero on empty input, and round results to a specified precision.",
  "python-practical-guess-feedback": "Compare two integer values and return directional feedback using conditional statements covering all three comparison outcomes.",
  "python-practical-hangman-display": "Iterate over string characters, perform membership testing in a list of known values, and build a result string with conditional masking.",
  "python-practical-length-converter": "Apply a fixed conversion factor in both directions using conditional multiplication/division, and round results to a specified precision.",
  "python-practical-library-due-date": "Perform date arithmetic using Python's datetime and timedelta, correctly handling month boundaries, year boundaries, and leap years.",
  "python-practical-mad-libs": "Replace numbered placeholders in a template string with provided values using progressive string replacement and index-based lookup.",
  "python-practical-personality-quiz": "Find the maximum value in a list, track the index of the maximum, map indices to corresponding labels, and handle ties by selecting the first occurrence.",
  "python-practical-quiz-score": "Compare two parallel lists position by position using zip, count matching elements with an accumulator, and return an integer score.",
  "python-practical-rock-paper-scissors": "Implement rule-based game logic using conditional statements, model pairwise relationships with a lookup structure, and handle tie detection.",
  "python-practical-selection-sort": "Implement selection sort from scratch using nested loops, minimum-finding with index tracking, and in-place swap operations.",
  "python-practical-simple-calculator": "Dispatch arithmetic operations based on string operators, handle division-by-zero as a controlled edge case, and work with floating-point arithmetic.",
  "python-practical-temperature-converter": "Apply inverse temperature conversion formulas, conditionally select the correct formula based on target unit, and round to standard precision.",
  "python-practical-tip-split": "Calculate a percentage-based surcharge, divide totals evenly among participants, and round monetary values to two decimal places.",
  "python-practical-todo-list": "Parse structured command strings, maintain a mutable collection across sequential operations, and handle idempotent removals gracefully.",
  "python-practical-word-counter": "Tokenize text by splitting on whitespace, clean tokens by removing punctuation and normalizing case, count frequencies with a dictionary, and find the maximum entry.",
};

const TAGS = {
  "python-practical-alarm-snooze": '{"python","practicals","time","arithmetic","strings"}',
  "python-practical-alarm-trigger": '{"python","practicals","lists","membership","strings"}',
  "python-practical-bmi-calculator": '{"python","practicals","math","conditionals","health"}',
  "python-practical-bubble-sort": '{"python","practicals","sorting","algorithms","loops"}',
  "python-practical-budget-tracker": '{"python","practicals","math","lists","finance"}',
  "python-practical-caesar-decrypt": '{"python","practicals","strings","cryptography","loops"}',
  "python-practical-caesar-encrypt": '{"python","practicals","strings","cryptography","loops"}',
  "python-practical-click-counter": '{"python","practicals","conditionals","strings","state"}',
  "python-practical-countdown-calculator": '{"python","practicals","datetime","math","strings"}',
  "python-practical-countdown-formatter": '{"python","practicals","math","strings","formatting"}',
  "python-practical-dice-average": '{"python","practicals","math","lists","statistics"}',
  "python-practical-guess-feedback": '{"python","practicals","conditionals","comparison","games"}',
  "python-practical-hangman-display": '{"python","practicals","strings","loops","games"}',
  "python-practical-length-converter": '{"python","practicals","math","conditionals","conversion"}',
  "python-practical-library-due-date": '{"python","practicals","datetime","arithmetic","strings"}',
  "python-practical-mad-libs": '{"python","practicals","strings","templates","loops"}',
  "python-practical-personality-quiz": '{"python","practicals","lists","conditionals","games"}',
  "python-practical-quiz-score": '{"python","practicals","lists","loops","comparison"}',
  "python-practical-rock-paper-scissors": '{"python","practicals","conditionals","games","logic"}',
  "python-practical-selection-sort": '{"python","practicals","sorting","algorithms","loops"}',
  "python-practical-simple-calculator": '{"python","practicals","math","conditionals","arithmetic"}',
  "python-practical-temperature-converter": '{"python","practicals","math","conditionals","conversion"}',
  "python-practical-tip-split": '{"python","practicals","math","arithmetic","finance"}',
  "python-practical-todo-list": '{"python","practicals","strings","lists","state"}',
  "python-practical-word-counter": '{"python","practicals","strings","dictionaries","text"}',
};

// ── Test case JSON generation ─────────────────────────────────────────────

function jsonForInput(input) {
  if (input === null) return "'[]'::jsonb";
  if (Array.isArray(input)) return `'${esc(JSON.stringify(input))}'::jsonb`;
  if (typeof input === "string") return `'${esc(JSON.stringify(input))}'::jsonb`;
  return `'${esc(JSON.stringify(input))}'::jsonb`;
}

function jsonForExpected(expected) {
  if (typeof expected === "string") return `'${esc(expected)}'`;
  if (typeof expected === "boolean") return expected ? "'true'" : "'false'";
  if (Array.isArray(expected)) return `'${esc(JSON.stringify(expected))}'`;
  // number
  return String(expected);
}

// ── Generate SQL ──────────────────────────────────────────────────────────

let sql = `-- 047_seed_python_practicals.sql
-- 25 Professional Python Practical Exercises (Mini-Projects)
-- Difficulty: 1–4 (Beginner → Intermediate)
--
-- Each problem includes:
--   - A descriptive statement with real-world analogy
--   - Constraints, learning objective, 3 hints
--   - 5–7 test cases (3 visible examples + 3–4 hidden edge cases)
--   - Single-language Python (language_versions contains only "python")

-- ────────────────────────────────────────────────────────────────────────────
-- Module metadata
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO module_meta (module_name, display_name) VALUES
    ('python-practice', 'Python Practice'),
    ('python-practicals', 'Python Practicals')
ON CONFLICT (module_name) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- HELPER: attach test cases to a problem slug
-- ────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    prob_id UUID;
BEGIN

`;


// Group problems by difficulty for organized output
const byDifficulty = { 1: [], 2: [], 3: [], 4: [] };
const diffLabels = { 1: "BEGINNER", 2: "EASY", 3: "INTERMEDIATE", 4: "ADVANCED" };
const diffRanges = { 1: "1–6", 2: "7–13", 3: "14–19", 4: "20–25" };

for (const p of problems) {
  byDifficulty[p.difficulty]?.push(p) ?? byDifficulty[4].push(p);
}

let probIndex = 0;
for (const diff of [1, 2, 3, 4]) {
  const group = byDifficulty[diff];
  if (group.length === 0) continue;

  sql += `
-- ════════════════════════════════════════════════════════════════════════════
-- 🟢 ${diffLabels[diff]} (${diffRanges[diff]}) — difficulty ${diff}
-- ════════════════════════════════════════════════════════════════════════════
`;

  for (const p of group) {
    probIndex++;
    const slug = p.slug;
    const tc = TEST_CASES[slug];
    if (!tc) throw new Error(`Missing test cases for ${slug}`);

    const lv = { python: { func_name: p.func_name, return_type: p.return_type, param_types: p.param_types } };
    const rawReadme = p.statement.split("\n\n")[0]; // First paragraph as raw_readme
    const constraints = CONSTRAINTS[slug];
    const learningObjective = LEARNING_OBJECTIVES[slug];
    const tags = TAGS[slug];

    sql += `
-- ────────────────────────────────────────────────────────────────────────────
-- ${probIndex}. ${p.title}
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    '${slug}',
    '${p.module}',
    'function',
    'python',
    ${pgLiteral(p.title)},
    ${pgLiteral(p.statement)},
    ${pgLiteral(constraints)},
    ${pgLiteral(learningObjective)},
    '${p.func_name}',
    '${p.return_type}',
    ${pgArray(p.param_types)},
    ${pgArray(p.hints)},
    ${p.difficulty},
    ${p.xp_reward},
    '${tags}',
    true,
    'seed-${slug}',
    ${pgLiteral(rawReadme)},
    '${JSON.stringify(lv)}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = '${slug}';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
`;

    for (let i = 0; i < tc.length; i++) {
      const [hidden, ordinal, input, expected] = tc[i];
      const comma = i < tc.length - 1 ? "," : "";
      sql += `    (prob_id, ${jsonForInput(input)}, ${jsonForExpected(expected)}, ${hidden ? "true" : "false"}, ${ordinal})${comma}\n`;
    }
    sql += 'ON CONFLICT (problem_id, ordinal) DO NOTHING;\n';
  }
}

sql += '\nEND $$;\n';

// Write output
const outPath = join(ROOT, "migrations", "047_seed_python_practicals.sql");
writeFileSync(outPath, sql, "utf8");
console.log(`Written: ${outPath}`);
console.log(`Problems: ${probIndex}`);
console.log(`Size: ${(sql.length / 1024).toFixed(1)} KB`);
