-- 047_seed_python_practicals.sql
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


-- ════════════════════════════════════════════════════════════════════════════
-- 🟢 BEGINNER (1–6) — difficulty 1
-- ════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Mini-Project: Click Counter App Logic
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-click-counter',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Click Counter App Logic',
    E'Counters are commonly used to track values that change over time, such as button clicks, scores, inventory levels, or user interactions. \nBy processing a sequence of actions in order, you can determine the final state of the counter.\n\nIn this challenge, your task is to process a list of counter actions. Each action will be one of the following:\n\n- `increment` — Increase the counter by `1`.\n- `decrement` — Decrease the counter by `1`.\n- `reset` — Set the counter back to `0`.\n\nStarting from an initial count of `0`, apply each action in the order it appears and determine the final value of the counter.\n\nYour function should return the counter''s final value after all actions have been processed.\n\nThis exercise reinforces several important programming concepts:\n\n- Iterating through a **list** of instructions.\n- Updating a value based on different conditions.\n- Using **conditional statements** to control program flow.\n- Maintaining and modifying a running state throughout a sequence of operations.\n\nProcessing sequential actions is a common programming pattern used in interactive applications, games, event-driven systems, and state management.',
    E'- Actions list length: 0 ≤ len(actions) ≤ 1_000\n- Each action is one of: "increment", "decrement", "reset"\n- Counter starts at 0\n- Counter may go negative',
    E'Process a sequence of commands sequentially, maintain running state across multiple operations, and dispatch actions based on string identifiers.',
    'simulate_click_counter',
    'int',
    '{"list"}',
    '{"The function processes a list of string commands one at a time, maintaining a running count throughout.","The three possible commands cover every operation a simple counter needs: increase, decrease, and reset.","Starting from zero and processing commands in order exactly mirrors how a real click-counter app behaves over time."}',
    1,
    70,
    '{"python","practicals","conditionals","strings","state"}',
    true,
    'seed-python-practical-click-counter',
    E'Counters are commonly used to track values that change over time, such as button clicks, scores, inventory levels, or user interactions. \nBy processing a sequence of actions in order, you can determine the final state of the counter.',
    '{"python":{"func_name":"simulate_click_counter","return_type":"int","param_types":["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-click-counter';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[["increment","increment","decrement"]]'::jsonb, 1, false, 1),
    (prob_id, '[["reset","increment"]]'::jsonb, 1, false, 2),
    (prob_id, '[[]]'::jsonb, 0, false, 3),
    (prob_id, '[["increment","increment","increment","increment","increment"]]'::jsonb, 5, true, 4),
    (prob_id, '[["increment","decrement","increment","decrement","increment","decrement"]]'::jsonb, 0, true, 5),
    (prob_id, '[["decrement","decrement"]]'::jsonb, -2, true, 6),
    (prob_id, '[["increment","reset","increment","increment"]]'::jsonb, 2, true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Mini-Project: Countdown Timer Display Formatter
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-countdown-formatter',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Countdown Timer Display Formatter',
    E'**Time format conversion** is a common task in application development. Displaying a raw number of seconds as a human-readable hours:minutes:seconds string requires division, remainder, and zero-padded formatting.\n\nIn this challenge, your task is to convert a total number of seconds into a formatted time string in "HH:MM:SS" format, with each component padded to exactly two digits using leading zeros where necessary.\n\nFor example:\n\n- **3725** seconds formats as **"01:02:05"** (1 hour, 2 minutes, 5 seconds).\n- **0** seconds formats as **"00:00:00"**.\n- **3661** seconds formats as **"01:01:01"** (1 hour, 1 minute, 1 second).\n\nYour function should return the formatted time string.\n\nThis exercise reinforces several important programming concepts:\n\n- Using **integer division** (`//`) to extract whole units.\n- Using the **modulo operator** (`%`) to find remainders.\n- **Zero-padding** values with `str.zfill()` or format strings.\n- Converting between **raw units and display format**.\n\nTime formatting is used in video players, cooking timers, workout apps, dashboards, and any application that displays durations.',
    E'- Input range: 0 ≤ total_seconds ≤ 1_000_000\n- Return a string in "HH:MM:SS" format\n- Each component is zero-padded to exactly 2 digits\n- 0 seconds returns "00:00:00"',
    E'Convert raw seconds into hours/minutes/seconds using integer division and modulo, and format components with zero-padded strings.',
    'format_countdown_timer',
    'str',
    '{"int"}',
    '{"An hour is 3600 seconds, so the number of whole hours in a duration is found by integer-dividing the total seconds by 3600.","Once the hours have been accounted for, the number of whole minutes remaining is found the same way, using whatever seconds are left over after removing the hours.","Formatting each of the three components (hours, minutes, seconds) with a fixed width of two digits, padding with a leading zero where needed, produces the familiar HH:MM:SS display."}',
    1,
    70,
    '{"python","practicals","math","strings","formatting"}',
    true,
    'seed-python-practical-countdown-formatter',
    E'**Time format conversion** is a common task in application development. Displaying a raw number of seconds as a human-readable hours:minutes:seconds string requires division, remainder, and zero-padded formatting.',
    '{"python":{"func_name":"format_countdown_timer","return_type":"str","param_types":["int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-countdown-formatter';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[3725]'::jsonb, '01:02:05', false, 1),
    (prob_id, '[0]'::jsonb, '00:00:00', false, 2),
    (prob_id, '[3661]'::jsonb, '01:01:01', false, 3),
    (prob_id, '[3600]'::jsonb, '01:00:00', true, 4),
    (prob_id, '[86399]'::jsonb, '23:59:59', true, 5),
    (prob_id, '[59]'::jsonb, '00:00:59', true, 6),
    (prob_id, '[100000]'::jsonb, '27:46:40', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Mini-Project: Dice Roll Statistics Tracker
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-dice-average',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Dice Roll Statistics Tracker',
    E'Calculating an **average** is one of the most common operations performed on numerical data. By combining the values in a collection and dividing by the total number of items, you can determine a value that represents the overall result.\n\nIn this challenge, your task is to calculate the **average** of a list of dice roll results. The average should be rounded to **two decimal places**. If the list contains no values, your function should return `0.0`.\n\nYour function should return the average value of all recorded dice rolls.\n\nThis exercise reinforces several important programming concepts:\n\n- Working with **lists** of numeric values.\n- Calculating the **sum** and **average** of a collection.\n- Handling edge cases, such as an empty list.\n- Rounding numeric results to a specified number of decimal places.\n\nComputing averages is a fundamental programming technique used in statistics, analytics, reporting, gaming, and many other real-world applications.',
    E'- Rolls list length: 0 ≤ len(rolls) ≤ 10_000\n- Each roll value: 1 ≤ roll ≤ 6 (standard six-sided die)\n- Return a float rounded to two decimal places\n- Empty list returns 0.0',
    E'Calculate the arithmetic mean of a numerical collection, guard against division by zero on empty input, and round results to a specified precision.',
    'calculate_average_roll',
    'float',
    '{"list"}',
    '{"The average of a set of dice rolls is simply the total of every roll divided by how many rolls there were.","A completely empty history of rolls has no meaningful average to report, so that case needs to be guarded against before any division is attempted.","As with any statistic meant for display, the final average should be rounded to two decimal places rather than left with excessive decimal precision."}',
    1,
    70,
    '{"python","practicals","math","lists","statistics"}',
    true,
    'seed-python-practical-dice-average',
    E'Calculating an **average** is one of the most common operations performed on numerical data. By combining the values in a collection and dividing by the total number of items, you can determine a value that represents the overall result.',
    '{"python":{"func_name":"calculate_average_roll","return_type":"float","param_types":["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-dice-average';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[[3,5,2,6,4]]'::jsonb, 4, false, 1),
    (prob_id, '[[1,1,1,1,1,1]]'::jsonb, 1, false, 2),
    (prob_id, '[[]]'::jsonb, 0, false, 3),
    (prob_id, '[[6]]'::jsonb, 6, true, 4),
    (prob_id, '[[1,6]]'::jsonb, 3.5, true, 5),
    (prob_id, '[[4,4,4,4,4]]'::jsonb, 4, true, 6),
    (prob_id, '[[2,3]]'::jsonb, 2.5, true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Mini-Project: Length Unit Converter
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-length-converter',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Length Unit Converter',
    E'**Unit conversion** is a practical programming task that appears in countless applications. A single conversion factor connects two measurement systems, and the direction of conversion determines whether you multiply or divide.\n\nIn this challenge, your task is to implement a length converter that converts between inches and centimeters. Given a numeric value and a target unit ("cm" or "in"), convert the value into that target unit, rounded to two decimal places. Assume the given value is expressed in the opposite unit.\n\nFor example:\n\n- Converting **10.0** to **"cm"** returns **25.4** (1 inch = 2.54 cm).\n- Converting **25.4** to **"in"** returns **10.0** (the inverse operation).\n- Converting **0.0** to **"cm"** returns **0.0**.\n\nYour function should return the converted value rounded to two decimal places.\n\nThis exercise reinforces several important programming concepts:\n\n- Using a **conversion factor** to translate between units.\n- **Conditionally** multiplying or dividing based on target unit.\n- **Rounding** results to a specified precision.\n- Understanding **inverse operations** in measurement conversion.\n\nUnit conversion is used in scientific computing, engineering applications, cooking apps, mapping software, and international commerce.',
    E'- Input value range: -1_000_000 ≤ value ≤ 1_000_000\n- Target unit is one of: "cm" (centimeters), "in" (inches)\n- Return a float rounded to two decimal places\n- 1 inch = 2.54 centimeters exactly',
    E'Apply a fixed conversion factor in both directions using conditional multiplication/division, and round results to a specified precision.',
    'convert_length',
    'float',
    '{"float","str"}',
    '{"One inch is defined as exactly 2.54 centimeters, which is the single conversion factor this entire problem is built around.","Converting inches to centimeters means multiplying by that factor; converting centimeters to inches means dividing by it — the two operations are exact inverses of each other.","As with the temperature converter, the result should be rounded to two decimal places for a clean, realistic display."}',
    1,
    70,
    '{"python","practicals","math","conditionals","conversion"}',
    true,
    'seed-python-practical-length-converter',
    E'**Unit conversion** is a practical programming task that appears in countless applications. A single conversion factor connects two measurement systems, and the direction of conversion determines whether you multiply or divide.',
    '{"python":{"func_name":"convert_length","return_type":"float","param_types":["float","str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-length-converter';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[10,"cm"]'::jsonb, 25.4, false, 1),
    (prob_id, '[25.4,"in"]'::jsonb, 10, false, 2),
    (prob_id, '[0,"cm"]'::jsonb, 0, false, 3),
    (prob_id, '[1,"cm"]'::jsonb, 2.54, true, 4),
    (prob_id, '[2.54,"in"]'::jsonb, 1, true, 5),
    (prob_id, '[100,"cm"]'::jsonb, 254, true, 6),
    (prob_id, '[50,"in"]'::jsonb, 19.69, true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Mini-Project: Rock-Paper-Scissors Referee
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-rock-paper-scissors',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Rock-Paper-Scissors Referee',
    E'Rock-paper-scissors is a classic game that is often used to practice **conditional logic** and decision-making in programming.\n\nEach round follows a simple set of rules that determine the winner based on the choices made by two players.\n\nIn this challenge, your task is to implement the referee logic for a two-player game of **rock-paper-scissors**.\nEach player will choose one of three possible moves: `rock`, `paper`, or `scissors`.\n\nYour function should compare both moves and return the appropriate result:\n\n- `"Player 1"` if the first player''s move wins.\n- `"Player 2"` if the second player''s move wins.\n- `"Tie"` if both players choose the same move.\n\nThis exercise reinforces several important programming concepts:\n\n- Using **conditional statements** to evaluate multiple outcomes.\n- Comparing values to determine a result.\n- Implementing rule-based decision logic.\n- Translating real-world game rules into clear and maintainable code.\n\nBuilding simple game logic is an excellent way to develop problem-solving skills and practice writing code that handles multiple conditions correctly.',
    E'- Each move is one of: "rock", "paper", "scissors"\n- Case-sensitive input (lowercase only)\n- Return one of: "Player 1", "Player 2", "Tie"\n- Same move always results in a tie',
    E'Implement rule-based game logic using conditional statements, model pairwise relationships with a lookup structure, and handle tie detection.',
    'determine_rps_winner',
    'str',
    '{"str","str"}',
    '{"Before checking who wins, first rule out the simplest case: both players choosing the exact same move always results in a tie.","A small lookup describing what each move beats (rock beats scissors, scissors beats paper, paper beats rock) captures the entire rule set of the game in one place.","If player one''s move does not beat player two''s move, and it is not a tie, then player two must be the winner by elimination."}',
    1,
    70,
    '{"python","practicals","conditionals","games","logic"}',
    true,
    'seed-python-practical-rock-paper-scissors',
    E'Rock-paper-scissors is a classic game that is often used to practice **conditional logic** and decision-making in programming.',
    '{"python":{"func_name":"determine_rps_winner","return_type":"str","param_types":["str","str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-rock-paper-scissors';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '["rock","scissors"]'::jsonb, 'Player 1', false, 1),
    (prob_id, '["scissors","rock"]'::jsonb, 'Player 2', false, 2),
    (prob_id, '["rock","rock"]'::jsonb, 'Tie', false, 3),
    (prob_id, '["paper","rock"]'::jsonb, 'Player 1', true, 4),
    (prob_id, '["scissors","paper"]'::jsonb, 'Player 1', true, 5),
    (prob_id, '["paper","scissors"]'::jsonb, 'Player 2', true, 6),
    (prob_id, '["paper","paper"]'::jsonb, 'Tie', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 6. Mini-Project: Temperature Converter
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-temperature-converter',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Temperature Converter',
    E'**Temperature conversion** is a classic beginner project that teaches conditional logic and formula application. Converting between Fahrenheit and Celsius requires understanding two different mathematical relationships.\n\nIn this challenge, your task is to implement a temperature converter. Given a temperature value and a target unit ("C" for Celsius or "F" for Fahrenheit), convert the value into that target unit, rounded to two decimal places. Assume the given value is expressed in the opposite unit.\n\nFor example:\n\n- Converting **212.0** to **"C"** returns **100.0** (the boiling point of water in Celsius).\n- Converting **100.0** to **"F"** returns **212.0** (the inverse conversion).\n- Converting **-40.0** to **"C"** returns **-40.0** (the unique point where both scales meet).\n\nYour function should return the converted temperature rounded to two decimal places.\n\nThis exercise reinforces several important programming concepts:\n\n- Applying **different formulas** based on the target unit.\n- Performing **multiplication and division** in the correct order.\n- **Rounding** results to standard precision.\n- Understanding **inverse transformations**.\n\nTemperature conversion is used in weather apps, cooking applications, scientific software, and international commerce.',
    E'- Temperature range: -459.67 ≤ value ≤ 10_000\n- Target unit is one of: "C" (Celsius), "F" (Fahrenheit)\n- Return a float rounded to two decimal places\n- Formula: F → C = (value - 32) × 5/9; C → F = value × 9/5 + 32',
    E'Apply inverse temperature conversion formulas, conditionally select the correct formula based on target unit, and round to standard precision.',
    'convert_temperature',
    'float',
    '{"float","str"}',
    '{"Converting Fahrenheit to Celsius and converting Celsius to Fahrenheit are two different formulas, so the target unit needs to determine which one runs.","The standard Fahrenheit-to-Celsius formula subtracts 32 first, then multiplies by five-ninths; the Celsius-to-Fahrenheit formula multiplies by nine-fifths first, then adds 32.","The result should be rounded to two decimal places, matching how a real temperature display would show it."}',
    1,
    70,
    '{"python","practicals","math","conditionals","conversion"}',
    true,
    'seed-python-practical-temperature-converter',
    E'**Temperature conversion** is a classic beginner project that teaches conditional logic and formula application. Converting between Fahrenheit and Celsius requires understanding two different mathematical relationships.',
    '{"python":{"func_name":"convert_temperature","return_type":"float","param_types":["float","str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-temperature-converter';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[212,"C"]'::jsonb, 100, false, 1),
    (prob_id, '[100,"F"]'::jsonb, 212, false, 2),
    (prob_id, '[-40,"C"]'::jsonb, -40, false, 3),
    (prob_id, '[0,"C"]'::jsonb, -17.78, true, 4),
    (prob_id, '[-40,"F"]'::jsonb, -40, true, 5),
    (prob_id, '[32,"C"]'::jsonb, 0, true, 6),
    (prob_id, '[0,"F"]'::jsonb, 32, true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════
-- 🟢 EASY (7–13) — difficulty 2
-- ════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 7. Mini-Project: BMI Health Calculator
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-bmi-calculator',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: BMI Health Calculator',
    E'**Health and fitness calculations** combine mathematical formulas with categorical classification. Body Mass Index (BMI) is a widely used health metric that relates weight and height to standard weight categories.\n\nIn this challenge, your task is to calculate a person''s BMI from their weight in kilograms and height in meters, then classify it into one of four standard categories: "Underweight" (below 18.5), "Normal" (18.5 up to 25), "Overweight" (25 up to 30), or "Obese" (30 and above).\n\nFor example:\n\n- A weight of **70 kg** and height of **1.75 m** produces a BMI of about **22.86**, which falls in the **"Normal"** category.\n- A weight of **95 kg** and height of **1.75 m** produces a BMI of about **31.02**, which falls in the **"Obese"** category.\n- A weight of **50 kg** and height of **1.75 m** produces a BMI of about **16.33**, which falls in the **"Underweight"** category.\n\nYour function should return the category name as a string.\n\nThis exercise reinforces several important programming concepts:\n\n- Applying a **mathematical formula** (BMI = weight / height²).\n- Using **conditional chains** to classify continuous values.\n- Understanding **boundary inclusivity** (`< 18.5` vs `>= 30`).\n- Translating **health standards** into code logic.\n\nHealth classification systems are used in fitness apps, medical software, insurance calculations, and wellness tracking platforms.',
    E'- Weight range: 1 ≤ weight_kg ≤ 500 (positive weight in kilograms)\n- Height range: 0.5 ≤ height_m ≤ 2.5 (height in meters)\n- Return one of: "Underweight", "Normal", "Overweight", "Obese"\n- BMI thresholds: <18.5 Underweight, 18.5-24.999 Normal, 25-29.999 Overweight, >=30 Obese',
    E'Apply a mathematical formula (BMI = weight / height²), chain conditional statements for categorical classification, and handle boundary inclusivity correctly.',
    'calculate_bmi_category',
    'str',
    '{"float","float"}',
    '{"Body Mass Index is calculated as weight in kilograms divided by the square of height in meters.","Once the BMI value itself has been calculated, it needs to be checked against a series of standard threshold ranges to determine which category it falls into.","Checking the lowest threshold first, then progressively higher ones, means each check only needs to compare against its own upper bound — by the time a later check runs, every lower category has already been ruled out."}',
    2,
    110,
    '{"python","practicals","math","conditionals","health"}',
    true,
    'seed-python-practical-bmi-calculator',
    E'**Health and fitness calculations** combine mathematical formulas with categorical classification. Body Mass Index (BMI) is a widely used health metric that relates weight and height to standard weight categories.',
    '{"python":{"func_name":"calculate_bmi_category","return_type":"str","param_types":["float","float"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-bmi-calculator';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[70,1.75]'::jsonb, 'Normal', false, 1),
    (prob_id, '[95,1.75]'::jsonb, 'Obese', false, 2),
    (prob_id, '[50,1.75]'::jsonb, 'Underweight', false, 3),
    (prob_id, '[85,1.7]'::jsonb, 'Overweight', true, 4),
    (prob_id, '[45,1.6]'::jsonb, 'Underweight', true, 5),
    (prob_id, '[100,1.8]'::jsonb, 'Obese', true, 6),
    (prob_id, '[60,1.7]'::jsonb, 'Normal', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 8. Mini-Project: Personal Budget Tracker
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-budget-tracker',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Personal Budget Tracker',
    E'**Financial calculations** are among the most practical applications of programming. Tracking income and expenses to compute a balance is a core feature of budgeting and accounting software.\n\nIn this challenge, your task is to calculate the overall balance for a personal budget. Given a list of income amounts and a list of expense amounts, compute the net balance — total income minus total expenses — rounded to two decimal places.\n\nFor example:\n\n- **Income: [1000.00, 500.00]** and **expenses: [200.00, 150.00, 50.00]** produce a balance of **1100.00**.\n- **Income: [500.00]** and **expenses: [600.00]** produce a balance of **-100.00** (overspent).\n- **Income: []** and **expenses: []** produce a balance of **0.00**.\n\nYour function should return the balance as a floating-point number rounded to two decimal places.\n\nThis exercise reinforces several important programming concepts:\n\n- **Summing** values across multiple collections.\n- **Subtracting** totals to compute a net value.\n- **Rounding** financial results to a standard precision.\n- Building **money-aware** arithmetic logic.\n\nBudget calculations are used in personal finance apps, business accounting software, expense trackers, and financial planning tools.',
    E'- Each list length: 0 ≤ len(list) ≤ 1_000\n- Individual amounts: -100_000 ≤ amount ≤ 100_000\n- Return a float rounded to two decimal places\n- Empty lists are valid inputs (balance = 0.0)',
    E'Sum numerical values across multiple collections, compute a net difference, and round financial results to standard precision.',
    'calculate_budget_balance',
    'float',
    '{"list","list"}',
    '{"A budget''s overall balance is the total of every source of income, minus the total of every recorded expense.","Every individual income entry contributes positively to the balance, and every individual expense entry reduces it, regardless of how many entries there are on either side.","The final balance should be rounded to two decimal places, matching how real currency amounts are normally displayed."}',
    2,
    110,
    '{"python","practicals","math","lists","finance"}',
    true,
    'seed-python-practical-budget-tracker',
    E'**Financial calculations** are among the most practical applications of programming. Tracking income and expenses to compute a balance is a core feature of budgeting and accounting software.',
    '{"python":{"func_name":"calculate_budget_balance","return_type":"float","param_types":["list","list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-budget-tracker';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[[1000,500],[200,150,50]]'::jsonb, 1100, false, 1),
    (prob_id, '[[500],[600]]'::jsonb, -100, false, 2),
    (prob_id, '[[],[]]'::jsonb, 0, false, 3),
    (prob_id, '[[100],[100]]'::jsonb, 0, true, 4),
    (prob_id, '[[1000],[]]'::jsonb, 1000, true, 5),
    (prob_id, '[[],[500]]'::jsonb, -500, true, 6),
    (prob_id, '[[10,20,30],[5,15]]'::jsonb, 40, true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 9. Mini-Project: Text Decryption Companion
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-caesar-decrypt',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Text Decryption Companion',
    E'**Encryption and decryption** are mirror-image operations. Understanding how to reverse a transformation is just as important as applying it in the first place — and teaches symmetry in algorithm design.\n\nIn this challenge, your task is to implement the **decryption** companion for the Caesar cipher. Given an encrypted message and the shift amount used to encrypt it, recover the original message by shifting every letter backward by that same amount, wrapping around the alphabet and preserving casing.\n\nFor example:\n\n- Decrypting **"Khoor, Zruog!"** with shift **3** recovers **"Hello, World!"**.\n- Decrypting **"Bmfy f xywnsl!"** with shift **5** recovers **"What a string!"**.\n- Decrypting **"Hello"** with shift **0** returns **"Hello"** unchanged.\n\nYour function should return the decrypted message with all letters restored to their original positions.\n\nThis exercise reinforces several important programming concepts:\n\n- Performing the **inverse operation** of an encryption algorithm.\n- Using **modular arithmetic** for alphabet wrapping.\n- **Preserving casing** during character transformations.\n- Leaving **non-letter characters** untouched.\n\nDecryption algorithms are fundamental to data security, secure communications, password storage, and information protection systems.',
    E'- Message length: 0 ≤ len(message) ≤ 10_000\n- Shift range: 0 ≤ shift ≤ 10_000 (any non-negative integer)\n- Only letters are shifted; preserve casing\n- Non-letter characters pass through unchanged',
    E'Reverse a character-level transformation using modular arithmetic, preserve casing during inverse operations, and leave non-alphabetic characters untouched.',
    'decrypt_message',
    'str',
    '{"str","int"}',
    '{"Decrypting a Caesar-shifted message is really the exact same shifting operation as encrypting it, just performed with the shift amount reversed.","Shifting backward by a given amount is mathematically identical to shifting forward by that same amount subtracted from the full alphabet length, which sidesteps needing to handle negative shift values as a completely separate case.","A message that was encrypted with a particular shift should, when decrypted with that exact same shift, come back out exactly as it started, letter for letter and character for character."}',
    2,
    110,
    '{"python","practicals","strings","cryptography","loops"}',
    true,
    'seed-python-practical-caesar-decrypt',
    E'**Encryption and decryption** are mirror-image operations. Understanding how to reverse a transformation is just as important as applying it in the first place — and teaches symmetry in algorithm design.',
    '{"python":{"func_name":"decrypt_message","return_type":"str","param_types":["str","int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-caesar-decrypt';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '["Khoor, Zruog!",3]'::jsonb, 'Hello, World!', false, 1),
    (prob_id, '["Bmfy f xywnsl!",5]'::jsonb, 'What a string!', false, 2),
    (prob_id, '["Hello",0]'::jsonb, 'Hello', false, 3),
    (prob_id, '["Abc",1]'::jsonb, 'Zab', true, 4),
    (prob_id, '["Xyz",26]'::jsonb, 'Xyz', true, 5),
    (prob_id, '["a",25]'::jsonb, 'b', true, 6),
    (prob_id, '[",.!",10]'::jsonb, ',.!', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 10. Mini-Project: Text Encryption Generator
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-caesar-encrypt',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Text Encryption Generator',
    E'The **Caesar cipher** is one of the oldest known encryption techniques, dating back to ancient Rome. Despite its simplicity, it introduces core concepts that carry forward to modern cryptography.\n\nIn this challenge, your task is to implement a Caesar cipher encryption function. Given a message and a shift amount, replace every letter with the letter that many positions later in the alphabet, wrapping back to the beginning after ''z'' or ''Z''. Preserve the original casing of each letter and leave non-letter characters (spaces, punctuation, digits) unchanged.\n\nFor example:\n\n- Encrypting **"Hello, World!"** with shift **3** produces **"Khoor, Zruog!"**.\n- Encrypting **"abc"** with shift **1** produces **"bcd"**.\n- Encrypting **"xyz"** with shift **3** wraps around to produce **"abc"**.\n\nYour function should return the encrypted message with all letters shifted and non-letters preserved.\n\nThis exercise reinforces several important programming concepts:\n\n- Using **character codes** and arithmetic for letter shifting.\n- Applying the **modulo operator** for wrap-around behavior.\n- **Preserving casing** during character transformation.\n- **Selectively transforming** only certain characters in a string.\n\nThe Caesar cipher introduces fundamental ideas about encryption that apply to more complex cryptographic systems used in secure communications today.',
    E'- Message length: 0 ≤ len(message) ≤ 10_000\n- Shift range: 0 ≤ shift ≤ 10_000\n- Only letters are shifted; preserve casing\n- Non-letter characters pass through unchanged',
    E'Apply a character-shifting cipher using modular arithmetic, preserve original casing, and selectively transform only alphabetic characters.',
    'encrypt_message',
    'str',
    '{"str","int"}',
    '{"Only letters should actually be shifted — spaces, punctuation, and any other non-letter characters should pass through completely unchanged.","Preserving the original casing of each letter matters: an uppercase letter should shift to another uppercase letter, and a lowercase letter should shift to another lowercase letter.","The alphabet wraps around: shifting the letter z forward should cycle back around to the beginning of the alphabet rather than falling off the end, which is exactly what the modulo operator is for."}',
    2,
    110,
    '{"python","practicals","strings","cryptography","loops"}',
    true,
    'seed-python-practical-caesar-encrypt',
    E'The **Caesar cipher** is one of the oldest known encryption techniques, dating back to ancient Rome. Despite its simplicity, it introduces core concepts that carry forward to modern cryptography.',
    '{"python":{"func_name":"encrypt_message","return_type":"str","param_types":["str","int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-caesar-encrypt';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '["Hello, World!",3]'::jsonb, 'Khoor, Zruog!', false, 1),
    (prob_id, '["abc",1]'::jsonb, 'bcd', false, 2),
    (prob_id, '["xyz",3]'::jsonb, 'abc', false, 3),
    (prob_id, '["ABC",1]'::jsonb, 'BCD', true, 4),
    (prob_id, '["xyz",26]'::jsonb, 'xyz', true, 5),
    (prob_id, '["z",1]'::jsonb, 'a', true, 6),
    (prob_id, '["Test 123!",5]'::jsonb, 'Yjxy 123!', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 11. Mini-Project: Number-Guessing Game Feedback
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-guess-feedback',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Number-Guessing Game Feedback',
    E'**Comparison logic** with three possible outcomes is a fundamental programming pattern. Number-guessing games provide a simple, intuitive context for practicing conditional branching.\n\nIn this challenge, your task is to implement the feedback system for a number-guessing game. Given a secret number and the player''s guess, return "higher" if the guess is too low (the player needs to guess higher), "lower" if the guess is too high, or "correct" if the guess is exactly right.\n\nFor example:\n\n- Secret **50** and guess **30** returns **"higher"** (guess 30 is too low).\n- Secret **50** and guess **75** returns **"lower"** (guess 75 is too high).\n- Secret **50** and guess **50** returns **"correct"**.\n\nYour function should return the appropriate feedback string.\n\nThis exercise reinforces several important programming concepts:\n\n- Using **conditional statements** to compare two values.\n- Providing **directional feedback** that guides the user.\n- Implementing **exact-match detection**.\n- Covering all three possible **comparison outcomes**.\n\nComparison-based feedback is used in games, search algorithms, optimization problems, and any interactive system where user input needs evaluation.',
    E'- Integer values only (no range restrictions)\n- Return one of: "higher", "lower", "correct"\n- Guess may equal, be less than, or be greater than secret\n- Mathematically exact comparison is used',
    E'Compare two integer values and return directional feedback using conditional statements covering all three comparison outcomes.',
    'guess_feedback',
    'str',
    '{"int","int"}',
    '{"There are exactly three possible relationships between the guess and the secret number: the guess is too low, too high, or exactly right.","If the guess is lower than the secret number, the player needs to guess higher next time — the feedback message should point the player in the direction of the correct answer.","The exact-match case should be checked in a way that is reached only once the other two possibilities have already been ruled out, since a value cannot simultaneously be too low and too high."}',
    2,
    110,
    '{"python","practicals","conditionals","comparison","games"}',
    true,
    'seed-python-practical-guess-feedback',
    E'**Comparison logic** with three possible outcomes is a fundamental programming pattern. Number-guessing games provide a simple, intuitive context for practicing conditional branching.',
    '{"python":{"func_name":"guess_feedback","return_type":"str","param_types":["int","int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-guess-feedback';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[50,30]'::jsonb, 'higher', false, 1),
    (prob_id, '[50,75]'::jsonb, 'lower', false, 2),
    (prob_id, '[50,50]'::jsonb, 'correct', false, 3),
    (prob_id, '[0,-5]'::jsonb, 'higher', true, 4),
    (prob_id, '[0,5]'::jsonb, 'lower', true, 5),
    (prob_id, '[-10,-10]'::jsonb, 'correct', true, 6),
    (prob_id, '[100,0]'::jsonb, 'higher', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 12. Mini-Project: Interactive Quiz Scorer
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-quiz-score',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Interactive Quiz Scorer',
    E'**Comparing parallel lists** position by position is a common data processing pattern. Grading systems, survey analysis, and test scoring all rely on matching answers against answer keys.\n\nIn this challenge, your task is to implement the scoring logic for a quiz application. Given a list of a quiz-taker''s submitted answers and a matching list of correct answers, calculate how many questions were answered correctly by comparing them position by position.\n\nFor example:\n\n- Submitted **["A", "B", "C"]** against correct **["A", "B", "D"]** produces a score of **2**.\n- Submitted **["A", "B", "C"]** against correct **["A", "B", "C"]** produces a perfect score of **3**.\n- Submitted **["A", "B", "C"]** against correct **["D", "E", "F"]** produces a score of **0**.\n\nYour function should return the number of correct answers as an integer.\n\nThis exercise reinforces several important programming concepts:\n\n- **Zipping** or pairing two lists for parallel iteration.\n- Comparing **corresponding elements** position by position.\n- **Counting** matches with an accumulator.\n- Handling **equal-length** list comparison.\n\nParallel list comparison is used in automated grading, survey processing, data validation, and any system that checks answers against a key.',
    E'- Both lists have the same length: 0 ≤ len(answers) ≤ 100\n- Each answer is a string (case-sensitive)\n- Return an integer count of matching answers\n- Empty lists return 0',
    E'Compare two parallel lists position by position using zip, count matching elements with an accumulator, and return an integer score.',
    'calculate_quiz_score',
    'int',
    '{"list","list"}',
    '{"Every one of a quiz-taker''s answers needs to be compared against the correct answer for that same question, position by position.","Pairing up the two parallel lists — the submitted answers and the correct answers — position by position is exactly what is needed before any comparison can happen.","The final score is simply a running count of how many of those position-by-position comparisons came out equal."}',
    2,
    110,
    '{"python","practicals","lists","loops","comparison"}',
    true,
    'seed-python-practical-quiz-score',
    E'**Comparing parallel lists** position by position is a common data processing pattern. Grading systems, survey analysis, and test scoring all rely on matching answers against answer keys.',
    '{"python":{"func_name":"calculate_quiz_score","return_type":"int","param_types":["list","list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-quiz-score';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[["A","B","C"],["A","B","D"]]'::jsonb, 2, false, 1),
    (prob_id, '[["A","B","C"],["A","B","C"]]'::jsonb, 3, false, 2),
    (prob_id, '[["A","B","C"],["D","E","F"]]'::jsonb, 0, false, 3),
    (prob_id, '[[],[]]'::jsonb, 0, true, 4),
    (prob_id, '[["A"],["A"]]'::jsonb, 1, true, 5),
    (prob_id, '[["a","b","c"],["A","B","C"]]'::jsonb, 0, true, 6),
    (prob_id, '[["1","2"],["1","2"]]'::jsonb, 2, true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 13. Mini-Project: Restaurant Tip Splitter
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-tip-split',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Restaurant Tip Splitter',
    E'Splitting a bill is a common financial calculation that combines percentages, arithmetic, and rounding. It is a practical problem that demonstrates how simple mathematical operations can be used to solve real-world tasks.\n\nIn this challenge, your task is to calculate how much each person should pay when a bill is split evenly among a group. The total bill should first be increased by the specified **tip percentage**, after which the final amount is divided equally among all participants.\n\nYour function should return the amount each person owes, rounded to **two decimal places**.\n\nThis exercise reinforces several important programming concepts:\n\n- Performing arithmetic calculations with multiple inputs.\n- Calculating **percentages** and applying them to a total.\n- Dividing a value evenly among a group.\n- Rounding decimal values to a specified precision.\n\nBill splitting is a practical programming exercise that introduces financial calculations commonly used in payment systems, budgeting tools, expense trackers, and billing applications.',
    E'- Bill total range: 0 ≤ bill_total ≤ 100_000\n- Tip percent range: 0 ≤ tip_percent ≤ 100\n- Number of people range: 1 ≤ num_people ≤ 1_000\n- Return a float rounded to two decimal places',
    E'Calculate a percentage-based surcharge, divide totals evenly among participants, and round monetary values to two decimal places.',
    'calculate_tip_split',
    'float',
    '{"float","float","int"}',
    '{"The total amount owed, including the tip, is found by adding the tip percentage on top of the original bill total.","Once the full amount including tip is known, splitting it evenly among a group simply means dividing that total by however many people are sharing it.","As with any calculation involving money, the final per-person amount should be rounded to exactly two decimal places."}',
    2,
    110,
    '{"python","practicals","math","arithmetic","finance"}',
    true,
    'seed-python-practical-tip-split',
    E'Splitting a bill is a common financial calculation that combines percentages, arithmetic, and rounding. It is a practical problem that demonstrates how simple mathematical operations can be used to solve real-world tasks.',
    '{"python":{"func_name":"calculate_tip_split","return_type":"float","param_types":["float","float","int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-tip-split';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[100,15,4]'::jsonb, 28.75, false, 1),
    (prob_id, '[50,20,2]'::jsonb, 30, false, 2),
    (prob_id, '[0,10,1]'::jsonb, 0, false, 3),
    (prob_id, '[100,0,1]'::jsonb, 100, true, 4),
    (prob_id, '[200,10,2]'::jsonb, 110, true, 5),
    (prob_id, '[75,15,3]'::jsonb, 28.75, true, 6),
    (prob_id, '[50,25,5]'::jsonb, 12.5, true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════
-- 🟢 INTERMEDIATE (14–19) — difficulty 3
-- ════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 14. Mini-Project: Sorting From Scratch (Bubble Sort)
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-bubble-sort',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Sorting From Scratch (Bubble Sort)',
    E'**Sorting algorithms** are fundamental to computer science. Implementing a sorting algorithm from scratch — rather than calling a built-in function — builds deep understanding of how data organization actually works.\n\nIn this challenge, your task is to implement the **bubble sort** algorithm. This technique repeatedly steps through a list, compares adjacent elements, and swaps them if they are in the wrong order. After each full pass, the next largest element "bubbles up" to its correct position at the end. You must not use Python''s built-in `sort()` or `sorted()`.\n\nFor example:\n\n- Sorting **[5, 3, 8, 1, 2]** using bubble sort produces **[1, 2, 3, 5, 8]**.\n- Sorting **[1, 2, 3, 4, 5]** (already sorted) produces **[1, 2, 3, 4, 5]** with no swaps needed.\n- Sorting **[]** or **[1]** produces the same list unchanged.\n\nYour function should return a new list sorted in ascending order.\n\nThis exercise reinforces several important programming concepts:\n\n- Implementing **comparison-based sorting** from scratch.\n- Using **nested loops** for iterative refinement.\n- Understanding **swap operations** and temporary variables.\n- Recognizing **algorithm efficiency** and termination conditions.\n\nBubble sort, while not the most efficient for large datasets, is an excellent teaching tool for understanding the fundamental concepts behind all comparison-based sorting algorithms.',
    E'- Input list length: 0 ≤ len(numbers) ≤ 1_000\n- Element range: -10_000 ≤ numbers[i] ≤ 10_000\n- Elements are integers\n- Must NOT use Python''s built-in sort() or sorted()',
    E'Implement comparison-based sorting from scratch using nested loops, swap operations, and early-termination optimization.',
    'bubble_sort_ascending',
    'list',
    '{"list"}',
    '{"The core idea is to repeatedly compare two neighboring elements and swap them if they are in the wrong order, without ever relying on Python''s own built-in sort() method.","One full pass through the list, comparing and swapping every neighboring pair along the way, bubbles the single largest remaining value all the way to the end of the unsorted portion.","After each full pass, one more element at the end of the list is guaranteed to be in its final, correct position, so the next pass never needs to look at it again."}',
    3,
    150,
    '{"python","practicals","sorting","algorithms","loops"}',
    true,
    'seed-python-practical-bubble-sort',
    E'**Sorting algorithms** are fundamental to computer science. Implementing a sorting algorithm from scratch — rather than calling a built-in function — builds deep understanding of how data organization actually works.',
    '{"python":{"func_name":"bubble_sort_ascending","return_type":"list","param_types":["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-bubble-sort';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[[5,3,8,1,2]]'::jsonb, '[1,2,3,5,8]', false, 1),
    (prob_id, '[[1,2,3,4,5]]'::jsonb, '[1,2,3,4,5]', false, 2),
    (prob_id, '[[]]'::jsonb, '[]', false, 3),
    (prob_id, '[[1]]'::jsonb, '[1]', true, 4),
    (prob_id, '[[3,3,3,3]]'::jsonb, '[3,3,3,3]', true, 5),
    (prob_id, '[[9,8,7,6,5]]'::jsonb, '[5,6,7,8,9]', true, 6),
    (prob_id, '[[-3,-1,-5,-2]]'::jsonb, '[-5,-3,-2,-1]', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 15. Mini-Project: Date Countdown Calculator
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-countdown-calculator',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Date Countdown Calculator',
    E'Working with **dates and calendars** involves complex rules — varying month lengths, leap years, and time zones. Python''s `datetime` module handles all of this complexity, making date arithmetic straightforward.\n\nIn this challenge, your task is to calculate the number of days between two dates. Given two date strings in "YYYY-MM-DD" format, compute the absolute difference in days. The result should always be non-negative, regardless of which date comes first chronologically.\n\nFor example:\n\n- Between **"2024-01-01"** and **"2024-01-10"** there are **9** days.\n- Between **"2024-03-01"** and **"2024-03-01"** (same date) there are **0** days.\n- Between **"2024-12-25"** and **"2024-01-01"** there are **359** days (absolute value).\n\nYour function should return the number of days as an integer.\n\nThis exercise reinforces several important programming concepts:\n\n- Using Python''s **`datetime` module** for date parsing and arithmetic.\n- Computing **`timedelta`** differences between dates.\n- Using **`abs()`** to guarantee non-negative results.\n- Handling **calendar complexity** through built-in libraries.\n\nDate difference calculations are used in booking systems, project planning, age calculation, countdown apps, and deadline tracking.',
    E'- Dates are strings in "YYYY-MM-DD" format\n- Valid Gregorian calendar dates only (year 1900-2100)\n- Return a non-negative integer (absolute difference)\n- Same date returns 0',
    E'Parse date strings with Python''s datetime module, compute timedelta differences, and use abs() to guarantee non-negative results.',
    'days_between_dates',
    'int',
    '{"str","str"}',
    '{"Python''s built-in datetime module can parse a date string like \"2024-01-01\" directly into an actual date object that supports arithmetic, rather than needing to manually split the string apart and calculate calendar math by hand.","Subtracting one datetime object from another produces a timedelta object, which has a .days attribute giving the exact number of whole days between them.","The two given dates might be provided in either chronological order, so wrapping the final result in an absolute-value function guarantees a sensible, non-negative day count regardless of which date comes first."}',
    3,
    150,
    '{"python","practicals","datetime","math","strings"}',
    true,
    'seed-python-practical-countdown-calculator',
    E'Working with **dates and calendars** involves complex rules — varying month lengths, leap years, and time zones. Python''s `datetime` module handles all of this complexity, making date arithmetic straightforward.',
    '{"python":{"func_name":"days_between_dates","return_type":"int","param_types":["str","str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-countdown-calculator';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '["2024-01-01","2024-01-10"]'::jsonb, 9, false, 1),
    (prob_id, '["2024-03-01","2024-03-01"]'::jsonb, 0, false, 2),
    (prob_id, '["2024-12-25","2024-01-01"]'::jsonb, 359, false, 3),
    (prob_id, '["2024-01-10","2024-01-01"]'::jsonb, 9, true, 4),
    (prob_id, '["2023-01-01","2024-01-01"]'::jsonb, 365, true, 5),
    (prob_id, '["2024-01-01","2025-01-01"]'::jsonb, 366, true, 6),
    (prob_id, '["2020-01-01","2020-12-31"]'::jsonb, 365, true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 16. Mini-Project: Hangman Word Display
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-hangman-display',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Hangman Word Display',
    E'**String transformation** based on character-by-character conditions is a common pattern in text-based games and data processing. Revealing information selectively based on user input creates engaging interactive experiences.\n\nIn this challenge, your task is to implement the display logic for a Hangman word-guessing game. Given the secret word and a list of letters the player has guessed so far, return a string where every correctly guessed letter is shown in its proper position and every not-yet-guessed letter is replaced by an underscore.\n\nFor example:\n\n- Word **"python"** with guessed letters **["p", "y", "z"]** displays as **"py____"**.\n- Word **"hello"** with guessed letters **["h", "e"]** displays as **"he___"**.\n- Word **"hello"** with guessed letters **["h", "e", "l", "o"]** displays as **"hello"**.\n\nYour function should return the display string with underscores masking unguessed letters.\n\nThis exercise reinforces several important programming concepts:\n\n- **Iterating** through each character of a string.\n- **Membership testing** in a list of guessed letters.\n- **Building** a result string character by character.\n- Handling **duplicate letters** correctly.\n\nSelective character display is used in word games, password masking, text-reveal animations, and any application where information is progressively revealed.',
    E'- Secret word length: 1 ≤ len(secret_word) ≤ 100\n- Guessed letters list length: 0 ≤ len(guessed_letters) ≤ 52\n- Letters are single alphabetic characters (a-z, A-Z)\n- Duplicate guessed letters are acceptable',
    E'Iterate over string characters, perform membership testing in a list of known values, and build a result string with conditional masking.',
    'hangman_display',
    'str',
    '{"str","list"}',
    '{"Every letter in the secret word needs to be checked individually against the set of letters guessed so far, since a letter might have been guessed while others have not.","A letter that has already been guessed should be revealed in the display exactly as it is in the word; any letter that has not been guessed yet should be masked as a single underscore.","The relative positions of the letters matter, including any duplicate letters — every occurrence of a correctly guessed letter should be revealed everywhere it appears in the word."}',
    3,
    150,
    '{"python","practicals","strings","loops","games"}',
    true,
    'seed-python-practical-hangman-display',
    E'**String transformation** based on character-by-character conditions is a common pattern in text-based games and data processing. Revealing information selectively based on user input creates engaging interactive experiences.',
    '{"python":{"func_name":"hangman_display","return_type":"str","param_types":["str","list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-hangman-display';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '["python",["p","y","z"]]'::jsonb, 'py____', false, 1),
    (prob_id, '["hello",["h","e"]]'::jsonb, 'he___', false, 2),
    (prob_id, '["hello",["h","e","l","o"]]'::jsonb, 'hello', false, 3),
    (prob_id, '["a",["a"]]'::jsonb, 'a', true, 4),
    (prob_id, '["test",[]]'::jsonb, '____', true, 5),
    (prob_id, '["bookkeeper",["o","k","e"]]'::jsonb, '_o_k_ee_e_', true, 6),
    (prob_id, '["abc",["a","b","c"]]'::jsonb, 'abc', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 17. Mini-Project: Library Book Due Date Calculator
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-library-due-date',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Library Book Due Date Calculator',
    E'**Date arithmetic** is essential in many real-world applications. Calculating due dates, expiration dates, and deadlines requires correctly handling month boundaries, year boundaries, and varying month lengths.\n\nIn this challenge, your task is to calculate a future due date given a checkout date and a loan period in days. Given a starting date in "YYYY-MM-DD" format and the number of days in the loan period, compute and return the due date in the same date format.\n\nFor example:\n\n- Checkout **"2024-01-20"** with a **14-day** loan produces a due date of **"2024-02-03"**.\n- Checkout **"2024-12-20"** with a **20-day** loan produces **"2025-01-09"** (crosses into the new year).\n- Checkout **"2024-02-28"** with a **1-day** loan produces **"2024-02-29"** (correctly handles leap year 2024).\n\nYour function should return the due date as a string in "YYYY-MM-DD" format.\n\nThis exercise reinforces several important programming concepts:\n\n- Using Python''s **`datetime` module** for date arithmetic.\n- Adding a **`timedelta`** to a date object.\n- Formatting dates back to **string representation**.\n- Handling **calendar complexities** through built-in libraries.\n\nDue date calculations are used in library systems, rental services, subscription billing, project management, and legal deadline tracking.',
    E'- Checkout date in "YYYY-MM-DD" format\n- Loan days range: 0 ≤ loan_days ≤ 365\n- Return a string in "YYYY-MM-DD" format\n- Handles leap years and month/year boundaries',
    E'Perform date arithmetic using Python''s datetime and timedelta, correctly handling month boundaries, year boundaries, and leap years.',
    'calculate_due_date',
    'str',
    '{"str","int"}',
    '{"Adding a number of days onto a specific calendar date requires genuine calendar arithmetic, correctly handling month boundaries (and even year boundaries) rather than simple digit addition.","Python''s datetime module supports adding a timedelta representing a number of days directly onto a parsed date, producing a new, correctly calculated date.","The result needs to be formatted back into the same \"YYYY-MM-DD\" string style as the original input, so the output stays consistent with how dates are represented throughout this problem."}',
    3,
    150,
    '{"python","practicals","datetime","arithmetic","strings"}',
    true,
    'seed-python-practical-library-due-date',
    E'**Date arithmetic** is essential in many real-world applications. Calculating due dates, expiration dates, and deadlines requires correctly handling month boundaries, year boundaries, and varying month lengths.',
    '{"python":{"func_name":"calculate_due_date","return_type":"str","param_types":["str","int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-library-due-date';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '["2024-01-20",14]'::jsonb, '2024-02-03', false, 1),
    (prob_id, '["2024-12-20",20]'::jsonb, '2025-01-09', false, 2),
    (prob_id, '["2024-02-28",1]'::jsonb, '2024-02-29', false, 3),
    (prob_id, '["2023-02-28",1]'::jsonb, '2023-03-01', true, 4),
    (prob_id, '["2024-01-01",365]'::jsonb, '2024-12-31', true, 5),
    (prob_id, '["2024-12-31",1]'::jsonb, '2025-01-01', true, 6),
    (prob_id, '["2024-06-15",0]'::jsonb, '2024-06-15', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 18. Mini-Project: Mad Libs Story Filler
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-mad-libs',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Mad Libs Story Filler',
    E'**String substitution** is a fundamental text processing operation. Replacing placeholders in a template with provided values is used everywhere from form letters to code generation.\n\nIn this challenge, your task is to implement a Mad Libs story filler. Given a story template containing numbered placeholders like "{0}", "{1}", etc., and a list of words to fill them in with, replace each placeholder with the word at the matching position in the list.\n\nFor example:\n\n- Template **"The {0} jumped over the {1}."** with words **["cat", "moon"]** produces **"The cat jumped over the moon."**.\n- Template **"Once upon a {0}, there was a {1} who loved {2}."** with words **["time", "princess", "dancing"]** produces **"Once upon a time, there was a princess who loved dancing."**.\n- Template **"Hello, {0}!"** with words **["world"]** produces **"Hello, world!"**.\n\nYour function should return the completed story string.\n\nThis exercise reinforces several important programming concepts:\n\n- Using **`str.replace()`** for placeholder substitution.\n- **Iterating** through placeholders and replacement values together.\n- Building a result string by **progressive replacement**.\n- Understanding **string immutability** in Python.\n\nTemplate substitution is used in document generation, email templates, reporting systems, code generation, and content management systems.',
    E'- Template length: 0 ≤ len(template) ≤ 1_000\n- Words list length: 0 ≤ len(words) ≤ 100\n- Placeholders are numbered: {0}, {1}, {2}, ...\n- Each placeholder is replaced with the word at the matching index',
    E'Replace numbered placeholders in a template string with provided values using progressive string replacement and index-based lookup.',
    'fill_mad_libs_template',
    'str',
    '{"str","list"}',
    '{"The template contains numbered placeholders like {0} and {1}, each marking exactly where one of the supplied words should be inserted.","Every placeholder needs to be replaced with the word at the matching position in the supplied word list — placeholder {0} with the first word, {1} with the second, and so on.","Processing the placeholders one at a time, replacing each one in the template before moving on to the next, builds up the final filled-in story correctly regardless of how many blanks the template contains."}',
    3,
    150,
    '{"python","practicals","strings","templates","loops"}',
    true,
    'seed-python-practical-mad-libs',
    E'**String substitution** is a fundamental text processing operation. Replacing placeholders in a template with provided values is used everywhere from form letters to code generation.',
    '{"python":{"func_name":"fill_mad_libs_template","return_type":"str","param_types":["str","list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-mad-libs';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '["The {0} jumped over the {1}.",["cat","moon"]]'::jsonb, 'The cat jumped over the moon.', false, 1),
    (prob_id, '["Once upon a {0}, there was a {1} who loved {2}.",["time","princess","dancing"]]'::jsonb, 'Once upon a time, there was a princess who loved dancing.', false, 2),
    (prob_id, '["Hello, {0}!",["world"]]'::jsonb, 'Hello, world!', false, 3),
    (prob_id, '["{0}",["test"]]'::jsonb, 'test', true, 4),
    (prob_id, '["No placeholders.",[]]'::jsonb, 'No placeholders.', true, 5),
    (prob_id, '["{0} {1} {0}",["a","b"]]'::jsonb, 'a b a', true, 6),
    (prob_id, '["",[]]'::jsonb, '', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 19. Mini-Project: Sorting From Scratch (Selection Sort)
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-selection-sort',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Sorting From Scratch (Selection Sort)',
    E'**Selection sort** is a fundamental sorting algorithm that works by repeatedly finding the minimum element from the unsorted portion of a list and moving it to the front. Understanding different sorting strategies builds deeper algorithmic intuition.\n\nIn this challenge, your task is to implement the **selection sort** algorithm without using Python''s built-in `sort()` or `sorted()`. Scan the unsorted portion of the list for the smallest remaining value, swap it into the correct position, and repeat until the entire list is sorted.\n\nFor example:\n\n- Sorting **[64, 25, 12, 22, 11]** produces **[11, 12, 22, 25, 64]**.\n- Sorting **[1, 2, 3, 4, 5]** (already sorted) produces **[1, 2, 3, 4, 5]**.\n- Sorting **[]** or **[42]** returns the list unchanged.\n\nYour function should return a new list sorted in ascending order.\n\nThis exercise reinforces several important programming concepts:\n\n- Using **nested loops** for repeated scanning.\n- Finding the **minimum value** in a sublist.\n- Performing **swap operations** with index tracking.\n- Understanding the **algorithm structure** of in-place sorting.\n\nSelection sort teaches the fundamental "find and place" strategy that underlies more advanced algorithms used in data processing and database systems.',
    E'- Input list length: 0 ≤ len(numbers) ≤ 1_000\n- Element range: -10_000 ≤ numbers[i] ≤ 10_000\n- Elements are integers\n- Must NOT use Python''s built-in sort() or sorted()',
    E'Implement selection sort from scratch using nested loops, minimum-finding with index tracking, and in-place swap operations.',
    'selection_sort_ascending',
    'list',
    '{"list"}',
    '{"This technique repeatedly scans the still-unsorted portion of the list to find its single smallest remaining value, without ever calling Python''s built-in sort() method.","Once the smallest remaining value has been located, it gets swapped into the front position of the unsorted portion, which grows the sorted portion by exactly one element.","Each pass only needs to scan the portion of the list that has not been sorted yet — everything before that point is already known to be in its correct final position."}',
    3,
    150,
    '{"python","practicals","sorting","algorithms","loops"}',
    true,
    'seed-python-practical-selection-sort',
    E'**Selection sort** is a fundamental sorting algorithm that works by repeatedly finding the minimum element from the unsorted portion of a list and moving it to the front. Understanding different sorting strategies builds deeper algorithmic intuition.',
    '{"python":{"func_name":"selection_sort_ascending","return_type":"list","param_types":["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-selection-sort';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[[64,25,12,22,11]]'::jsonb, '[11,12,22,25,64]', false, 1),
    (prob_id, '[[1,2,3,4,5]]'::jsonb, '[1,2,3,4,5]', false, 2),
    (prob_id, '[[]]'::jsonb, '[]', false, 3),
    (prob_id, '[[42]]'::jsonb, '[42]', true, 4),
    (prob_id, '[[5,4,3,2,1]]'::jsonb, '[1,2,3,4,5]', true, 5),
    (prob_id, '[[-5,-10,0,10]]'::jsonb, '[-10,-5,0,10]', true, 6),
    (prob_id, '[[7,7,7]]'::jsonb, '[7,7,7]', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════
-- 🟢 ADVANCED (20–25) — difficulty 4
-- ════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 20. Mini-Project: Alarm Clock Snooze Calculator
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-alarm-snooze',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Alarm Clock Snooze Calculator',
    E'Time calculations often need to handle **wrap-around** behavior — when adding a duration pushes a value past its maximum and it cycles back to the beginning. This is common in clock, calendar, and scheduling applications.\n\nIn this challenge, your task is to calculate a new alarm time after a snooze delay. Given the current hour (0 to 23), current minute (0 to 59), and a snooze duration in minutes, calculate the new time formatted as "HH:MM", correctly wrapping around to the next day if the snooze pushes past midnight.\n\nFor example:\n\n- Snoozing for **15 minutes** starting from **7:50** results in a new alarm time of **"08:05"**.\n- Snoozing for **20 minutes** starting from **23:50** wraps past midnight to **"00:10"**.\n- Snoozing for **0 minutes** starting from **14:30** leaves the time unchanged at **"14:30"**.\n\nYour function should return the new alarm time as a string in "HH:MM" format, with each component padded to two digits.\n\nThis exercise reinforces several important programming concepts:\n\n- Converting time to a **single unit** (minutes since midnight) for simpler arithmetic.\n- Using the **modulo operator** to handle wrap-around behavior.\n- Formatting output with **zero-padded** digits.\n- Applying **real-world scheduling** logic in code.\n\nTime arithmetic with wrap-around is widely used in alarm clocks, countdown timers, scheduling systems, and any application that works with cyclical time values.',
    E'- Input hour range: 0 ≤ hour ≤ 23\n- Input minute range: 0 ≤ minute ≤ 59\n- Snooze duration range: 0 ≤ snooze ≤ 10_000\n- Return a string in "HH:MM" format with zero-padded components',
    E'Convert between time units (hours/minutes → total minutes), apply modulo arithmetic for wrap-around, and format output with zero-padded strings.',
    'calculate_snooze_time',
    'str',
    '{"int","int","int"}',
    '{"Converting the current time into a single total number of minutes since midnight makes adding a snooze duration a simple addition, rather than juggling hours and minutes as two separate values.","Snoozing late at night can push the time past midnight and into the next day — wrapping the total number of minutes using the number of minutes in a full day correctly handles that day rollover.","Once the new total minutes since midnight is known, converting it back into separate hours and minutes, each padded to two digits, produces the final displayed alarm time."}',
    4,
    190,
    '{"python","practicals","time","arithmetic","strings"}',
    true,
    'seed-python-practical-alarm-snooze',
    E'Time calculations often need to handle **wrap-around** behavior — when adding a duration pushes a value past its maximum and it cycles back to the beginning. This is common in clock, calendar, and scheduling applications.',
    '{"python":{"func_name":"calculate_snooze_time","return_type":"str","param_types":["int","int","int"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-alarm-snooze';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[7,50,15]'::jsonb, '08:05', false, 1),
    (prob_id, '[23,50,20]'::jsonb, '00:10', false, 2),
    (prob_id, '[14,30,0]'::jsonb, '14:30', false, 3),
    (prob_id, '[0,0,1440]'::jsonb, '00:00', true, 4),
    (prob_id, '[12,0,60]'::jsonb, '13:00', true, 5),
    (prob_id, '[23,59,1]'::jsonb, '00:00', true, 6),
    (prob_id, '[5,0,0]'::jsonb, '05:00', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 21. Mini-Project: Alarm Trigger Checker
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-alarm-trigger',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Alarm Trigger Checker',
    E'**Membership testing** — checking whether a value exists in a collection — is a fundamental operation in programming. When multiple items need to be checked in a single operation, efficient lookup becomes important.\n\nIn this challenge, your task is to implement the trigger-checking logic for a multi-alarm clock app. Given the current time as a string and a list of configured alarm times (both formatted as "HH:MM"), determine whether the current time matches any of the configured alarms.\n\nFor example:\n\n- A current time of **"07:00"** checked against **["06:30", "07:00", "08:00"]** returns **True**, since it exactly matches the second alarm.\n- A current time of **"07:30"** checked against the same list returns **False**, since no alarm is set for that time.\n- An empty alarm list with any current time returns **False**.\n\nYour function should return `True` if the current time matches any configured alarm, `False` otherwise.\n\nThis exercise reinforces several important programming concepts:\n\n- Using the **`in` operator** for membership testing in lists.\n- Checking **string equality** for exact matches.\n- Handling **empty collections** gracefully.\n- Building real-world **event-triggering** logic.\n\nMembership-based triggering is used in alarm systems, notification services, calendar reminders, and event scheduling applications.',
    E'- Current time is a string in "HH:MM" 24-hour format\n- Alarm times list length: 0 ≤ len(alarm_times) ≤ 100\n- Each alarm time is in "HH:MM" 24-hour format\n- Return a boolean True/False',
    E'Perform membership testing in lists using the `in` operator, iterate over collections, and handle empty-list edge cases.',
    'is_alarm_triggered',
    'bool',
    '{"str","list"}',
    '{"An alarm clock app typically supports several separate alarms set for different times, all of which need to be checked at once against the current time.","The alarm should trigger the moment the current time matches any one of the configured alarm times exactly — it does not matter which specific alarm matched, only that at least one of them did.","Checking membership in a list of alarm times directly answers exactly this question, without needing to loop through and compare each alarm time individually by hand."}',
    4,
    190,
    '{"python","practicals","lists","membership","strings"}',
    true,
    'seed-python-practical-alarm-trigger',
    E'**Membership testing** — checking whether a value exists in a collection — is a fundamental operation in programming. When multiple items need to be checked in a single operation, efficient lookup becomes important.',
    '{"python":{"func_name":"is_alarm_triggered","return_type":"bool","param_types":["str","list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-alarm-trigger';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '["07:00",["06:30","07:00","08:00"]]'::jsonb, 'true', false, 1),
    (prob_id, '["07:30",["06:30","07:00","08:00"]]'::jsonb, 'false', false, 2),
    (prob_id, '["12:00",[]]'::jsonb, 'false', false, 3),
    (prob_id, '["00:00",["00:00"]]'::jsonb, 'true', true, 4),
    (prob_id, '["23:59",["00:00","23:59"]]'::jsonb, 'true', true, 5),
    (prob_id, '["10:00",["10:00","10:00"]]'::jsonb, 'true', true, 6),
    (prob_id, '["10:00",["10:01"]]'::jsonb, 'false', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 22. Mini-Project: "Which Avenger Are You?" Result Picker
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-personality-quiz',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: "Which Avenger Are You?" Result Picker',
    E'**Scoring and ranking** are fundamental data processing tasks. Personality quizzes and recommendation systems both rely on the same underlying logic: tally scores for each option and pick the winner.\n\nIn this challenge, your task is to implement the result-picking logic for a personality quiz. Given a list of four scores — representing Iron Man, Captain America, Thor, and Hulk in that order — determine which character has the highest score and return their name.\n\nFor example:\n\n- Scores **[3, 5, 2, 1]** indicate **Captain America** (score 5) is the closest match.\n- Scores **[8, 1, 3, 2]** indicate **Iron Man** (score 8) is the closest match.\n- Scores **[1, 1, 1, 1]** (all tied) indicate **Iron Man** is the closest match (first among equals).\n\nYour function should return the name of the character with the highest score.\n\nThis exercise reinforces several important programming concepts:\n\n- Finding the **maximum value** in a list.\n- **Tracking the index** of the maximum value.\n- **Mapping indices** to corresponding labels.\n- Handling **ties** by selecting the first occurrence.\n\nMaximum-based selection is used in recommendation systems, voting applications, personality assessments, and any system that ranks multiple candidates.',
    E'- Scores list always has exactly 4 elements\n- Score range: 0 ≤ score ≤ 1_000\n- Returns one of: "Iron Man", "Captain America", "Thor", "Hulk"\n- Ties go to the first character with that score',
    E'Find the maximum value in a list, track the index of the maximum, map indices to corresponding labels, and handle ties by selecting the first occurrence.',
    'determine_personality_result',
    'str',
    '{"list"}',
    '{"Behind the scenes, a personality quiz like this tallies up a running score for each possible result as the user answers questions, and the highest-scoring result at the end becomes the final outcome.","The four possible results correspond, in order, to the four scores provided — the first score belongs to the first character, the second score to the second character, and so on.","Scanning through the scores while tracking both the best score seen so far and which character it belongs to, updating only when a strictly higher score appears, correctly picks out the single highest-scoring result."}',
    4,
    190,
    '{"python","practicals","lists","conditionals","games"}',
    true,
    'seed-python-practical-personality-quiz',
    E'**Scoring and ranking** are fundamental data processing tasks. Personality quizzes and recommendation systems both rely on the same underlying logic: tally scores for each option and pick the winner.',
    '{"python":{"func_name":"determine_personality_result","return_type":"str","param_types":["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-personality-quiz';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[[3,5,2,1]]'::jsonb, 'Captain America', false, 1),
    (prob_id, '[[8,1,3,2]]'::jsonb, 'Iron Man', false, 2),
    (prob_id, '[[1,1,1,1]]'::jsonb, 'Iron Man', false, 3),
    (prob_id, '[[0,0,0,10]]'::jsonb, 'Hulk', true, 4),
    (prob_id, '[[10,0,0,0]]'::jsonb, 'Iron Man', true, 5),
    (prob_id, '[[0,10,0,0]]'::jsonb, 'Captain America', true, 6),
    (prob_id, '[[5,5,5,5]]'::jsonb, 'Iron Man', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 23. Mini-Project: Simple Calculator Engine
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-simple-calculator',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Simple Calculator Engine',
    E'**Arithmetic operations** are the foundation of all computational mathematics. A calculator engine must handle each operation correctly and guard against error conditions like division by zero.\n\nIn this challenge, your task is to implement the core calculation engine for a simple calculator. Given two numbers and an operator — one of "+", "-", "*", or "/" — compute and return the result. If the operator is "/" and the second number is zero, return `0.0` instead of attempting the division.\n\nFor example:\n\n- Evaluating **10.0, 3.0, "/"** returns approximately **3.3333333333333335** (the standard floating-point result).\n- Evaluating **10.0, 0.0, "/"** returns **0.0** (safe division-by-zero handling).\n- Evaluating **5.0, 3.0, "+"** returns **8.0**.\n\nYour function should return the computed numeric result.\n\nThis exercise reinforces several important programming concepts:\n\n- Using **conditional branching** to select the correct operation.\n- Handling the **division-by-zero** edge case safely.\n- Working with **floating-point arithmetic**.\n- Building a clean **operator dispatch** structure.\n\nCalculator engines are used in spreadsheet software, financial applications, scientific computing, and every system that performs mathematical computations.',
    E'- Input values are floats (any valid float range)\n- Operator is one of: "+", "-", "*", "/"\n- Return a float (the computed result)\n- Division by zero returns 0.0 (does not raise an error)',
    E'Dispatch arithmetic operations based on string operators, handle division-by-zero as a controlled edge case, and work with floating-point arithmetic.',
    'evaluate_simple_expression',
    'float',
    '{"float","float","str"}',
    '{"Each of the four basic arithmetic operators needs its own branch, since addition, subtraction, multiplication, and division are all fundamentally different operations.","Division is the one operator among the four that can fail outright — dividing by zero is mathematically undefined, and needs to be explicitly guarded against before the division is attempted.","Rather than letting a division by zero crash the whole calculator, returning a safe, documented fallback value keeps the calculator usable even when it is given an invalid expression to evaluate."}',
    4,
    190,
    '{"python","practicals","math","conditionals","arithmetic"}',
    true,
    'seed-python-practical-simple-calculator',
    E'**Arithmetic operations** are the foundation of all computational mathematics. A calculator engine must handle each operation correctly and guard against error conditions like division by zero.',
    '{"python":{"func_name":"evaluate_simple_expression","return_type":"float","param_types":["float","float","str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-simple-calculator';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[10,3,"/"]'::jsonb, 3.3333333333333335, false, 1),
    (prob_id, '[10,0,"/"]'::jsonb, 0, false, 2),
    (prob_id, '[5,3,"+"]'::jsonb, 8, false, 3),
    (prob_id, '[10,3,"-"]'::jsonb, 7, true, 4),
    (prob_id, '[5,3,"*"]'::jsonb, 15, true, 5),
    (prob_id, '[0,5,"*"]'::jsonb, 0, true, 6),
    (prob_id, '[10,4,"/"]'::jsonb, 2.5, true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 24. Mini-Project: To-Do List Manager
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-todo-list',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: To-Do List Manager',
    E'**State management** through a sequence of operations is a core programming pattern. A to-do list app''s underlying logic — add, remove, and mark complete — is a perfect example of maintaining and modifying a collection over time.\n\nIn this challenge, your task is to implement the task-management logic for a to-do list app. Given a list of operations, each formatted as "add <task>", "remove <task>", or "complete <task>", process them in order and return the final list of tasks still remaining, preserving their original addition order.\n\nFor example:\n\n- Operations **["add buy milk", "add walk dog", "complete buy milk"]** leave only **["walk dog"]** remaining.\n- Operations **["add task A", "add task B"]** (no removals) leave **["task A", "task B"]**.\n- Operations **["add task A", "remove task A", "remove task A"]** leave **[]** (second removal has no effect).\n\nYour function should return the list of remaining tasks in their original order.\n\nThis exercise reinforces several important programming concepts:\n\n- **Parsing** structured command strings.\n- **Modifying a list** by appending and removing elements.\n- Handling **idempotent operations** (removing an already-removed item).\n- **Sequential state updates** through a series of operations.\n\nTask list management is used in project management tools, workflow systems, issue trackers, and personal organization applications.',
    E'- Operations list length: 0 ≤ len(operations) ≤ 1_000\n- Each operation format: "add <task>", "remove <task>", or "complete <task>"\n- Tasks are non-empty strings (no leading/trailing spaces)\n- Removing a non-existent task has no effect',
    E'Parse structured command strings, maintain a mutable collection across sequential operations, and handle idempotent removals gracefully.',
    'process_todo_operations',
    'list',
    '{"list"}',
    '{"Every command in the operation log follows the same basic shape: an action word, followed by the specific task it applies to.","Adding a task means appending it to the running task list; both removing a task and marking one complete have the identical effect of taking it out of that list entirely.","Attempting to remove or complete a task that was never added, or was already removed, should simply have no effect, rather than causing an error."}',
    4,
    190,
    '{"python","practicals","strings","lists","state"}',
    true,
    'seed-python-practical-todo-list',
    E'**State management** through a sequence of operations is a core programming pattern. A to-do list app''s underlying logic — add, remove, and mark complete — is a perfect example of maintaining and modifying a collection over time.',
    '{"python":{"func_name":"process_todo_operations","return_type":"list","param_types":["list"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-todo-list';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '[["add buy milk","add walk dog","complete buy milk"]]'::jsonb, '["walk dog"]', false, 1),
    (prob_id, '[["add task A","add task B"]]'::jsonb, '["task A","task B"]', false, 2),
    (prob_id, '[["add task A","remove task A","remove task A"]]'::jsonb, '[]', false, 3),
    (prob_id, '[["add a","remove a","add a"]]'::jsonb, '["a"]', true, 4),
    (prob_id, '[["add x","complete x","add x"]]'::jsonb, '["x"]', true, 5),
    (prob_id, '[[]]'::jsonb, '[]', true, 6),
    (prob_id, '[["add 1","add 2","remove 2","add 3"]]'::jsonb, '["1","3"]', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 25. Mini-Project: Paragraph Word Counter
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO problems (
    slug, module, type, language, title, statement, constraints,
    learning_objective, func_name, return_type, param_types, hints,
    difficulty, xp_reward, tags, visible, source_hash, raw_readme,
    language_versions
) VALUES (
    'python-practical-word-counter',
    'python-practicals',
    'function',
    'python',
    E'Mini-Project: Paragraph Word Counter',
    E'**Text analysis** — splitting text into words, cleaning them, and counting frequencies — is a fundamental natural language processing skill. Word frequency analysis is used in search engines, document summarization, and content analysis.\n\nIn this challenge, your task is to build a word frequency counter. Given a paragraph of text, split it into individual words, ignore case differences and attached punctuation, and determine which word appears most frequently. Return that word in lowercase. If there is a tie, return whichever tied word appears first in the paragraph.\n\nFor example:\n\n- The paragraph **"the quick brown fox jumps over the lazy dog. The dog barks."** has the word **"the"** appearing 3 times — more than any other word — so **"the"** is returned.\n- The paragraph **"apple apple banana banana"** has a tie between **"apple"** and **"banana"** at 2 each, but **"apple"** appears first, so it is returned.\n- The paragraph **"Hello world!"** returns **"hello"** after case normalization and punctuation removal.\n\nYour function should return the most frequent word in lowercase.\n\nThis exercise reinforces several important programming concepts:\n\n- **Splitting** text into tokens.\n- **Cleaning** tokens by removing punctuation and normalizing case.\n- **Counting** frequencies using a dictionary.\n- Finding the **maximum value** in a frequency map.\n\nWord frequency analysis is used in search engines, text classification, sentiment analysis, content recommendation, and information retrieval systems.',
    E'- Paragraph length: 1 ≤ len(paragraph) ≤ 10_000\n- Words are separated by whitespace\n- Punctuation attached to words is stripped\n- Comparison is case-insensitive; return in lowercase',
    E'Tokenize text by splitting on whitespace, clean tokens by removing punctuation and normalizing case, count frequencies with a dictionary, and find the maximum entry.',
    'word_counter_top_word',
    'str',
    '{"str"}',
    '{"Splitting a paragraph on whitespace produces a list of raw words, but those words may still carry attached punctuation that needs to be stripped away before counting.","Comparing words in a case-insensitive way (converting everything to lowercase first) ensures that \"The\" and \"the\" are correctly counted as the same word.","A running dictionary mapping each cleaned word to how many times it has appeared so far is the natural way to tally frequencies, and the most frequent entry in that dictionary is the answer."}',
    4,
    190,
    '{"python","practicals","strings","dictionaries","text"}',
    true,
    'seed-python-practical-word-counter',
    E'**Text analysis** — splitting text into words, cleaning them, and counting frequencies — is a fundamental natural language processing skill. Word frequency analysis is used in search engines, document summarization, and content analysis.',
    '{"python":{"func_name":"word_counter_top_word","return_type":"str","param_types":["str"]}}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

SELECT id INTO prob_id FROM problems WHERE slug = 'python-practical-word-counter';

INSERT INTO test_cases (problem_id, input, expected, is_hidden, ordinal) VALUES
    (prob_id, '["the quick brown fox jumps over the lazy dog. The dog barks."]'::jsonb, 'the', false, 1),
    (prob_id, '["apple apple banana banana"]'::jsonb, 'apple', false, 2),
    (prob_id, '["Hello world!"]'::jsonb, 'hello', false, 3),
    (prob_id, '["a a a b b b"]'::jsonb, 'a', true, 4),
    (prob_id, '["Python, python, PYTHON!"]'::jsonb, 'python', true, 5),
    (prob_id, '["word word word."]'::jsonb, 'word', true, 6),
    (prob_id, '["test"]'::jsonb, 'test', true, 7)
ON CONFLICT (problem_id, ordinal) DO NOTHING;

END $$;
