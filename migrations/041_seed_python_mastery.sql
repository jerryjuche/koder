-- ============================================================================
-- Koder :: Python Mastery: From Zero to Hero
-- A complete, production-grade Python course testing all CMS features.
-- ============================================================================
-- Tests:
--   ✓ Course → Module → Lesson → Section pipeline
--   ✓ lesson_dependencies (prerequisites)
--   ✓ All 11 section types
--   ✓ Quizzes with JSONB metadata
--   ✓ Exercises with problem_references (Pyodide playground)
--   ✓ Projects with hints and starter_code
--   ✓ Progress tracking
-- ============================================================================
-- Requires: migrations 001-038, 039, 040
-- Python problems: py-double-it, py-even-or-odd, py-reverse-string,
--   py-sum-list, py-palindrome-check, py-factorial, py-vars-math-calc
-- ============================================================================

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. COURSE: Python Mastery
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO courses (slug, title, description, difficulty_level, estimated_hours, order_number, visible)
VALUES (
  'python-mastery',
  'Python Mastery: From Zero to Hero',
  'A comprehensive Python course covering everything from your first print() statement through functions, data structures, file I/O, and error handling. Perfect for beginners — no prior experience needed. Every concept is reinforced with quizzes, coding exercises you can run in your browser, and real-world mini-projects.',
  1, 24, 10, false
)
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. MODULES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO modules (course_id, slug, title, description, order_number, visible)
SELECT c.id, 'py-mastery-foundations', 'Python Foundations',
       'Your journey begins here. Learn how Python thinks: variables, types, strings, numbers, and how to talk back to the user. By the end, you will write your first interactive Python script.',
       1, false FROM courses c WHERE c.slug = 'python-mastery'
UNION ALL
SELECT c.id, 'py-mastery-control-flow', 'Control Flow & Collections',
       'Make your programs make decisions. Master conditionals, loops, lists, tuples, and the art of iteration. Build programs that actually do different things based on input.',
       2, false FROM courses c WHERE c.slug = 'python-mastery'
UNION ALL
SELECT c.id, 'py-mastery-functions-dicts', 'Functions & Dictionaries',
       'Write reusable code with functions and store structured data with dictionaries and sets. Learn scope, unpacking, and the Pythonic way to organise logic.',
       3, false FROM courses c WHERE c.slug = 'python-mastery'
UNION ALL
SELECT c.id, 'py-mastery-real-world', 'Real-World Python',
       'Read and write files, handle errors like a pro, and combine everything into a complete capstone project. This module prepares you for real Python development.',
       4, false FROM courses c WHERE c.slug = 'python-mastery'
ON CONFLICT (course_id, slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. LESSONS
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Module 1: Python Foundations (4 lessons) ──

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-welcome', 'Welcome to Python',
       'Write your first Python program. Understand the REPL, scripts, and the print() function. No prior programming experience needed.',
       1, 10, 30, 1, false, ARRAY['py-double-it']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-variables-types', 'Variables & Data Types',
       'Learn about integers, floats, strings, booleans, and None. Master variable assignment, dynamic typing, and the type() function.',
       1, 15, 40, 2, false, ARRAY['py-vars-math-calc']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-strings-basics', 'Strings & String Methods',
       'Master Python string manipulation: indexing, slicing, concatenation, f-strings, and dozens of built-in string methods.',
       1, 20, 50, 3, false, ARRAY['py-reverse-string', 'py-even-or-odd']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-user-input', 'User Input & Type Conversion',
       'Make interactive programs with input(). Convert between types safely. Format output with f-strings and format specifiers.',
       1, 15, 40, 4, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations'
ON CONFLICT (module_id, slug) DO NOTHING;

-- ── Module 2: Control Flow & Collections (3 lessons) ──

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-conditionals', 'Conditionals & Boolean Logic',
       'if/elif/else, boolean operators (and, or, not), truthiness, and conditional expressions. Make decisions in your code.',
       1, 15, 40, 1, false, ARRAY['py-palindrome-check']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-loops', 'Loops & Iteration',
       'for loops over ranges, lists, strings, and dicts. while loops, break, continue, else clauses, and the enumerate() and zip() functions.',
       2, 20, 50, 2, false, ARRAY['py-sum-list']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-lists-tuples', 'Lists & Tuples',
       'Ordered collections: creating, indexing, slicing. List methods (append, sort, reverse, remove). Tuples as immutable sequences. Nested lists and matrix operations.',
       2, 25, 60, 3, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow'
ON CONFLICT (module_id, slug) DO NOTHING;

-- ── Module 3: Functions & Dictionaries (3 lessons) ──

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-functions', 'Defining Functions',
       'def, parameters, return values, default arguments, keyword arguments, *args and **kwargs. Write clean, reusable code with functions.',
       2, 20, 50, 1, false, ARRAY['py-factorial']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-dicts-sets', 'Dictionaries & Sets',
       'Key-value stores with dicts. Hash sets for unique collections. Dictionary methods, set operations, and when to use each. Nested data structures.',
       2, 25, 60, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-comprehensions', 'Comprehensions & Lambda',
       'List comprehensions, dict comprehensions, set comprehensions, generator expressions. Lambda functions with map, filter, and sorted.',
       3, 25, 60, 3, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts'
ON CONFLICT (module_id, slug) DO NOTHING;

-- ── Module 4: Real-World Python (3 lessons) ──

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-file-io', 'File Input & Output',
       'Read and write files with open(). Text and binary modes. The with statement for auto-cleanup. Reading CSVs and writing JSON.',
       2, 25, 60, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-error-handling', 'Error Handling & Exceptions',
       'try/except/else/finally. Catching specific exceptions. Raising exceptions with raise. Creating custom exception classes. Defensive programming patterns.',
       2, 20, 50, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-capstone', 'Capstone: Contact Book',
       'Build a complete contact book application that stores, searches, and manages contacts. Combines everything: functions, file I/O, error handling, dicts, and lists.',
       3, 40, 150, 3, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world'
ON CONFLICT (module_id, slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. LESSON DEPENDENCIES (Prerequisites)
-- ═══════════════════════════════════════════════════════════════════════════

-- py-variables-types depends on py-welcome
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1, lessons l2
JOIN modules m1 ON l1.module_id = m1.id
JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c ON m1.course_id = c.id AND m2.course_id = c.id
WHERE c.slug = 'python-mastery'
  AND l1.slug = 'py-variables-types' AND l2.slug = 'py-welcome'
ON CONFLICT DO NOTHING;

-- py-strings-basics depends on py-variables-types
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1, lessons l2
JOIN modules m1 ON l1.module_id = m1.id
JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c ON m1.course_id = c.id AND m2.course_id = c.id
WHERE c.slug = 'python-mastery'
  AND l1.slug = 'py-strings-basics' AND l2.slug = 'py-variables-types'
ON CONFLICT DO NOTHING;

-- py-user-input depends on py-strings-basics
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1, lessons l2
JOIN modules m1 ON l1.module_id = m1.id
JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c ON m1.course_id = c.id AND m2.course_id = c.id
WHERE c.slug = 'python-mastery'
  AND l1.slug = 'py-user-input' AND l2.slug = 'py-strings-basics'
ON CONFLICT DO NOTHING;

-- py-conditionals depends on py-variables-types
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1, lessons l2
JOIN modules m1 ON l1.module_id = m1.id
JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c ON m1.course_id = c.id AND m2.course_id = c.id
WHERE c.slug = 'python-mastery'
  AND l1.slug = 'py-conditionals' AND l2.slug = 'py-variables-types'
ON CONFLICT DO NOTHING;

-- py-loops depends on py-conditionals
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1, lessons l2
JOIN modules m1 ON l1.module_id = m1.id
JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c ON m1.course_id = c.id AND m2.course_id = c.id
WHERE c.slug = 'python-mastery'
  AND l1.slug = 'py-loops' AND l2.slug = 'py-conditionals'
ON CONFLICT DO NOTHING;

-- py-lists-tuples depends on py-loops
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1, lessons l2
JOIN modules m1 ON l1.module_id = m1.id
JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c ON m1.course_id = c.id AND m2.course_id = c.id
WHERE c.slug = 'python-mastery'
  AND l1.slug = 'py-lists-tuples' AND l2.slug = 'py-loops'
ON CONFLICT DO NOTHING;

-- py-functions depends on py-lists-tuples
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1, lessons l2
JOIN modules m1 ON l1.module_id = m1.id
JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c ON m1.course_id = c.id AND m2.course_id = c.id
WHERE c.slug = 'python-mastery'
  AND l1.slug = 'py-functions' AND l2.slug = 'py-lists-tuples'
ON CONFLICT DO NOTHING;

-- py-dicts-sets depends on py-functions
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1, lessons l2
JOIN modules m1 ON l1.module_id = m1.id
JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c ON m1.course_id = c.id AND m2.course_id = c.id
WHERE c.slug = 'python-mastery'
  AND l1.slug = 'py-dicts-sets' AND l2.slug = 'py-functions'
ON CONFLICT DO NOTHING;

-- py-comprehensions depends on py-dicts-sets
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1, lessons l2
JOIN modules m1 ON l1.module_id = m1.id
JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c ON m1.course_id = c.id AND m2.course_id = c.id
WHERE c.slug = 'python-mastery'
  AND l1.slug = 'py-comprehensions' AND l2.slug = 'py-dicts-sets'
ON CONFLICT DO NOTHING;

-- py-file-io depends on py-functions
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1, lessons l2
JOIN modules m1 ON l1.module_id = m1.id
JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c ON m1.course_id = c.id AND m2.course_id = c.id
WHERE c.slug = 'python-mastery'
  AND l1.slug = 'py-file-io' AND l2.slug = 'py-functions'
ON CONFLICT DO NOTHING;

-- py-error-handling depends on py-file-io
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1, lessons l2
JOIN modules m1 ON l1.module_id = m1.id
JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c ON m1.course_id = c.id AND m2.course_id = c.id
WHERE c.slug = 'python-mastery'
  AND l1.slug = 'py-error-handling' AND l2.slug = 'py-file-io'
ON CONFLICT DO NOTHING;

-- py-capstone depends on py-error-handling
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1, lessons l2
JOIN modules m1 ON l1.module_id = m1.id
JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c ON m1.course_id = c.id AND m2.course_id = c.id
WHERE c.slug = 'python-mastery'
  AND l1.slug = 'py-capstone' AND l2.slug = 'py-error-handling'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. LESSON SECTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════ LESSON 1: py-welcome ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What is Python?',
E'Python is a high-level, interpreted programming language known for its readability and versatility. Created by Guido van Rossum and first released in 1991, Python has grown into one of the world''s most popular programming languages.\n\n**Why Python?**\n- Readable syntax that reads like English\n- Works everywhere: web, data science, automation, games\n- Huge standard library ("batteries included")\n- Massive community and ecosystem\n- Great first language for beginners', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-welcome';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Your First Program',
E'The tradition is to start with "Hello, World!" — a program that prints that exact phrase.\n\n```python\nprint("Hello, World!")\n```\n\n**How it works:**\n- `print()` is a built-in Python function\n- It takes whatever you put inside the parentheses and displays it\n- Text inside quotes is called a **string**\n- The program runs line by line from top to bottom\n\n**Try it yourself:** In the exercise panel on the right, type the code above and click "Run in Browser".', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-welcome';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'More Print Examples',
E'```python\n# A single message\nprint("Hello, World!")\n\n# Multiple arguments — automatically separated by space\nprint("Hello", "World", "from", "Python")\n\n# Numbers don''t need quotes\nprint(42)\nprint(3.14159)\n\n# You can mix types\nprint("The answer is", 42)\n\n# Empty print adds a blank line\nprint()\nprint("After a blank line")\n\n# The newline character \\n\nprint("Line 1\\nLine 2\\nLine 3")\n```\n\n<div class="tip">You can use single quotes '' or double quotes "" for strings in Python — both work the same way. Just stay consistent!</div>', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-welcome';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Quick Check',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-welcome';

UPDATE lesson_sections SET metadata = '{"question": "What does print(\"Hello\" + \" \" + \"World\") output?", "options": ["Hello World", "Hello+ +World", "Hello World (with extra spaces)", "Error"], "correct_index": 0, "explanation": "The + operator concatenates strings, joining them together. print() then displays the result: Hello World."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Quick Check'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-welcome');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Your Turn: Double It',
E'Write a Python program that:\n1. Creates a variable `number` with the value 7\n2. Creates a variable `doubled` that holds `number * 2`\n3. Prints `"The double is: "` followed by the doubled value\n\n**Hint:** Use the `print()` function with a comma to mix text and numbers.', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-welcome';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'What You Learned',
E'- Python is a readable, beginner-friendly programming language\n- `print()` displays output to the screen\n- Strings are text enclosed in quotes\n- Python runs code line by line from top to bottom\n- Comments start with `#` and are ignored by Python', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-welcome';

-- ═══════════════ LESSON 2: py-variables-types ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Variables & Types',
E'Variables are named containers that store data. Python is **dynamically typed** — you don''t need to declare what type a variable holds. The type is inferred from the value you assign.\n\n**In this lesson:**\n- Creating and naming variables\n- Python''s basic data types\n- The `type()` function\n- Type conversion between types', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Basic Data Types',
E'Python has four fundamental data types you will use every day:\n\n**int** — Whole numbers\n```python\nage = 25\ncount = -3\nbig = 1_000_000  # underscores improve readability\n```\n\n**float** — Decimal numbers\n```python\nprice = 19.99\npi = 3.14159\nscientific = 1.5e-4  # 0.00015\n```\n\n**str** — Text (strings)\n```python\nname = "Alice"\ngreeting = \'Hello\'\nmultiline = """This spans\nmultiple lines"""\n```\n\n**bool** — True or False\n```python\nis_active = True\nis_done = False\n```\n\n**NoneType** — Represents "no value"\n```python\nresult = None\n```\n\nUse the `type()` function to check any variable''s type:\n```python\nprint(type(42))        # <class ''int''>\nprint(type("hello"))   # <class ''str''>\nprint(type(True))      # <class ''bool''>\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Variable Naming & Assignment',
E'```python\n# Valid variable names\nname = "Alice"\nage = 25\nmy_name = "Bob"\nname2 = "Charlie"\n_user_name = "Dave"\n\n# Invalid variable names (will cause errors)\n# 2name = "Eve"       # Cannot start with a number\n# my-name = "Frank"    # Hyphens not allowed\n# class = "Math"       # Reserved keyword\n\n# Reassigning variables\ntemperature = 30\nprint(temperature)   # 30\ntemperature = "hot"\nprint(temperature)   # "hot" — type changed!\n\n# Multiple assignment\nx, y, z = 1, 2, 3\nprint(x, y, z)  # 1 2 3\n\n# Swapping variables (Pythonic!)\na, b = 10, 20\na, b = b, a\nprint(a, b)  # 20 10\n```\n\n<div class="tip">Python uses snake_case for variable names — all lowercase with underscores between words. This is a community convention, not a rule.</div>', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'common_mistakes', 'Common Pitfalls',
E'**1. Using undefined variables**\n```python\nprint(x)  # NameError: name ''x'' is not defined\n```\nAlways assign a value before using a variable.\n\n**2. Confusing = and ==**\n```python\nx = 10    # assignment\nx == 10   # comparison (returns True/False)\n```\n\n**3. Type errors from mixing types**\n```python\nprint("Age: " + 25)  # TypeError: can only concatenate str (not "int") to str\n# Fix: convert with str()\nprint("Age: " + str(25))\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding',
E'', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types';

UPDATE lesson_sections SET metadata = '{"question": "What will print(type(3.14)) display?", "options": ["<class ''int''>", "<class ''float''>", "<class ''str''>", "<class ''decimal''>"], "correct_index": 1, "explanation": "3.14 has a decimal point, so Python treats it as a float. type() returns <class ''float''>."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Variables',
E'Write a Python program that:\n1. Creates a variable `length` set to 10\n2. Creates a variable `width` set to 5\n3. Calculates `area = length * width`\n4. Prints `"Area: "` followed by the area\n\nThen add:\n5. Create `perimeter = 2 * (length + width)`\n6. Print `"Perimeter: "` followed by the perimeter\n\n<div class="tip">Use `print("Area:", area)` to print label and value together.</div>', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Variables store data and are created with the `=` operator\n- Python is dynamically typed: variables can change type\n- Main types: int, float, str, bool, NoneType\n- Use `type()` to check a variable''s type\n- Variable names follow snake_case convention\n- Multiple assignment and swapping make Python code clean', 7
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types';

-- ═══════════════ LESSON 3: py-strings-basics ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Working with Strings',
E'Strings are one of the most common data types in Python. This lesson covers everything you need to manipulate text: indexing, slicing, methods, and f-strings — Python''s modern string formatting.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Indexing & Slicing',
E'**String indexing**\nEach character in a string has a position (index), starting from 0.\n\n```python\nmessage = "Python"\n# Index:  0 1 2 3 4 5\nprint(message[0])  # P\nprint(message[3])  # h\nprint(message[-1]) # n  (negative = from end)\nprint(message[-2]) # o\n```\n\n**String slicing** — extract a portion with `[start:end:step]`\n```python\ntext = "Hello, World!"\nprint(text[0:5])    # Hello  (indices 0 to 4)\nprint(text[7:])     # World! (index 7 to end)\nprint(text[:5])     # Hello  (start to index 4)\nprint(text[::2])    # Hlo ol! (every 2nd char)\nprint(text[::-1])   # !dlroW ,olleH (reversed!)\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'String Methods & f-strings',
E'**Common string methods:**\n```python\ntext = "  hello, World!  "\nprint(text.upper())        # "  HELLO, WORLD!  "\nprint(text.lower())        # "  hello, world!  "\nprint(text.strip())        # "hello, World!"  (removes leading/trailing spaces)\nprint(text.replace("o", "0")) # "  hell0, W0rld!  "\nprint(text.split(","))     # ["  hello", " World!  "]\nprint("-".join(["a","b","c"])) # "a-b-c"\nprint(text.startswith("  he")) # True\nprint("abc123".isalpha())    # False (has digits)\nprint("abc".isalpha())       # True\n```\n\n**f-strings (Python 3.6+)** — the modern way to format strings:\n```python\nname = "Alice"\nage = 25\nprint(f"My name is {name} and I am {age} years old.")\n# My name is Alice and I am 25 years old.\n\n# Expressions inside f-strings\nprint(f"In 5 years, {name} will be {age + 5}.")\n# In 5 years, Alice will be 30.\n\n# Format specifiers\npi = 3.14159\nprint(f"Pi to 2 decimals: {pi:.2f}")  # Pi to 2 decimals: 3.14\nprint(f"Pad with zeros: {42:05d}")    # Pad with zeros: 00042\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'best_practices', 'String Tips',
E'- **Use f-strings** for formatting — they are faster and more readable than % formatting or .format()\n- **Prefer .join() over +** when concatenating many strings: `"".join(items)` is much faster than `s += item` in a loop\n- **Strings are immutable** — methods like .upper() return a NEW string, they don''t modify the original\n- **Use triple quotes** for multi-line strings or docstrings\n- **Escape special characters** with backslash: `\\n` for newline, `\\t` for tab, `\\\\` for backslash itself', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'String Quiz',
E'', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics';

UPDATE lesson_sections SET metadata = '{"question": "What does ''Python''[::-1] evaluate to?", "options": ["''Python''", "''nohtyP''", "''P''", "TypeError"], "correct_index": 1, "explanation": "The slice [::-1] reverses the string by stepping backward from end to start. ''Python'' reversed is ''nohtyP''."}'::jsonb
WHERE section_type = 'quiz' AND title = 'String Quiz'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: String Manipulation',
E'Write a Python program that:\n1. Creates a variable `text = "Python programming is fun!"`\n2. Prints the length of the string\n3. Prints the string in all uppercase\n4. Prints the string with ''fun'' replaced by ''amazing''\n5. Prints the first 6 characters (the word "Python")\n6. Prints the string reversed\n\n**Bonus:** Count how many times the letter `"n"` appears in the original string.', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Strings are indexed starting from 0; negative indices count from the end\n- Slicing `[start:end:step]` extracts portions of a string\n- String methods like .upper(), .strip(), .split() return new strings\n- f-strings provide clean, readable string formatting\n- Strings are immutable — all operations create new strings', 7
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics';

-- ═══════════════ LESSON 4: py-user-input ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Interactive Programs',
E'A program that only prints output is limited. With `input()`, your programs can ask the user for information and respond dynamically.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-user-input';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Using input()',
E'```python\nname = input("What is your name? ")\nprint(f"Hello, {name}! Nice to meet you.")\n```\n\n**Key points:**\n- `input()` ALWAYS returns a string\n- The prompt string is optional but helpful\n- The program PAUSES at `input()` until the user types something and presses Enter\n\n**Converting input:** Because input() returns a string, you need to convert it for math:\n```python\nage_str = input("How old are you? ")\nage = int(age_str)  # convert string to int\nnext_year = age + 1\nprint(f"Next year you will be {next_year}.")\n\n# Shorter version — nest the conversion\nage = int(input("How old are you? "))\n```\n\n**Safe conversion with try/except:**\n```python\ntry:\n    age = int(input("Age: "))\n    print(f"Next year: {age + 1}")\nexcept ValueError:\n    print("That was not a valid number!")\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-user-input';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Interactive Examples',
E'```python\n# Example 1: Simple greeting\nname = input("Enter your name: ")\nprint(f"Hello, {name}!")  \n\n# Example 2: Number input and calculation\ntry:\n    num1 = float(input("Enter first number: "))\n    num2 = float(input("Enter second number: "))\n    print(f"{num1} + {num2} = {num1 + num2}")\nexcept ValueError:\n    print("Please enter valid numbers.")\n\n# Example 3: Mad Libs style\nadjective = input("Enter an adjective: ")\nnoun = input("Enter a noun: ")\nverb = input("Enter a verb: ")\nprint(f"The {adjective} {noun} loves to {verb}!")\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-user-input';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Build an Interactive Calculator',
E'Write a program that:\n1. Asks the user for their name\n2. Asks for two numbers\n3. Prints a greeting with their name\n4. Prints the sum, difference, product, and quotient of the two numbers\n5. Handles invalid input gracefully (prints an error instead of crashing)\n\n**Example output:**\n```\nWhat is your name? Alice\nEnter number 1: 15\nEnter number 2: 4\n\nHello, Alice! Here are your results:\n15 + 4 = 19\n15 - 4 = 11\n15 * 4 = 60\n15 / 4 = 3.75\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-user-input';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- `input()` reads user input as a string\n- Always convert input to the needed type with int(), float(), etc.\n- Use try/except to handle invalid input gracefully\n- f-strings make it easy to combine text with variables\n- Interactive programs respond dynamically to user input', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-user-input';

-- ═══════════════ LESSON 5: py-conditionals ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Making Decisions',
E'Your programs need to make decisions. With conditionals, you can execute different code paths based on conditions — responding differently to different inputs, data, or states.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'if/elif/else',
E'```python\nscore = 85\n\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelif score >= 70:\n    grade = "C"\nelif score >= 60:\n    grade = "D"\nelse:\n    grade = "F"\n\nprint(f"Your grade is {grade}")\n```\n\n**Rules:**\n- `if` is required, `elif` and `else` are optional\n- You can have any number of `elif` blocks\n- `else` catches everything that didn''t match above\n- The colon `:` is required after each condition\n- The body MUST be indented (4 spaces by convention)\n\n**Comparison operators:**\n| Operator | Meaning |\n|----------|--------|\n| == | Equal to |\n| != | Not equal to |\n| <, > | Less than, greater than |\n| <=, >= | Less/greater than or equal |\n\n**Boolean operators:**\n```python\nif age >= 18 and has_license:\n    print("You can drive!")\n\nif day == "Saturday" or day == "Sunday":\n    print("Weekend!")\n\nif not is_raining:\n    print("No umbrella needed!")\n```\n\n**Truthiness:** Values that evaluate to False in a boolean context:\n- `None`, `False`, `0`, `0.0`, empty strings, empty lists, empty dicts, empty sets\n- Everything else is True', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Conditional Examples',
E'```python\n# Example 1: Even or odd\nnumber = 7\nif number % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")\n\n# Example 2: Ternary (conditional expression)\nage = 20\nstatus = "adult" if age >= 18 else "minor"\nprint(status)  # "adult"\n\n# Example 3: Nested conditionals\ntemperature = 25\nif temperature > 30:\n    print("Hot day!")\n    if temperature > 40:\n        print("Extreme heat warning!")\nelif temperature > 20:\n    print("Nice weather.")\nelse:\n    print("Cool day.")\n\n# Example 4: Using truthiness\nname = input("Enter your name: ")\nif name:  # True if name is not empty\n    print(f"Hello, {name}!")\nelse:\n    print("You didn''t enter a name.")\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'common_mistakes', 'Conditional Pitfalls',
E'**1. Using = instead of ==**\n```python\nif x = 10:   # SyntaxError! = is assignment\nif x == 10:  # Correct — comparison\n```\n\n**2. Forgetting the colon**\n```python\nif x > 5    # SyntaxError!\nif x > 5:   # Correct\n```\n\n**3. Inconsistent indentation**\n```python\nif x > 5:\nprint("Big")    # IndentationError\n```\n\n**4. elif after else**\n```python\nif x > 0:\n    print("Positive")\nelse:\n    print("Not positive")\nelif x == 0:  # SyntaxError! elif must come before else\n    print("Zero")\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Conditionals Quiz',
E'', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals';

UPDATE lesson_sections SET metadata = '{"question": "What does this code print?\n\nx = 15\nif x > 20:\n    print(\"A\")\nelif x > 10:\n    print(\"B\")\nelif x > 5:\n    print(\"C\")\nelse:\n    print(\"D\")", "options": ["A", "B", "C", "D"], "correct_index": 1, "explanation": "x is 15. First condition (x > 20) is False. Second condition (x > 10) is True, so it prints ''B'' and skips the rest."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Conditionals Quiz'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Conditionals',
E'Write a program that:\n1. Asks the user for a number\n2. Checks if it''s positive, negative, or zero\n3. Checks if it''s even or odd\n4. Checks if it''s a multiple of 5\n\n**Example output:**\n```\nEnter a number: 15\n15 is positive\n15 is odd\n15 is a multiple of 5\n```', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Use if/elif/else to create decision branches in your code\n- Conditions use comparison operators (==, !=, <, >, <=, >=)\n- Combine conditions with and, or, not\n- Every value has a truthiness — empty/zero/None are False\n- Indentation (4 spaces) determines which code belongs to each branch\n- Use the ternary `x if condition else y` for simple conditionals', 7
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals';

-- ═══════════════ LESSON 6: py-loops ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Repeating with Loops',
E'Loops let you repeat code efficiently. Instead of writing the same operation 10 times, write it once inside a loop and let Python handle the repetition.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'For Loops & While Loops',
E'**The `for` loop** — iterate over a sequence:\n```python\n# Over a range\nfor i in range(5):\n    print(i)  # 0, 1, 2, 3, 4\n\n# range(start, stop, step)\nfor i in range(2, 10, 2):\n    print(i)  # 2, 4, 6, 8\n\n# Over a list\nfruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    print(fruit)\n\n# Over a string\nfor char in "Python":\n    print(char)  # P, y, t, h, o, n\n\n# With enumerate (get index and value)\nfor i, fruit in enumerate(fruits):\n    print(f"{i}: {fruit}")\n```\n\n**The `while` loop** — repeat until condition is False:\n```python\ncount = 0\nwhile count < 5:\n    print(count)\n    count += 1  # don''t forget to update!\n\n# Infinite loop with break\nwhile True:\n    response = input("Type ''quit'' to exit: \")\n    if response == \"quit\":\n        break  # exit the loop\n```\n\n**Loop control:**\n- `break` — exit the loop immediately\n- `continue` — skip to the next iteration\n- `else` — runs ONLY if the loop completed normally (no break)\n\n```python\nfor n in range(2, 10):\n    for x in range(2, n):\n        if n % x == 0:\n            print(f"{n} = {x} * {n//x}\")\n            break\n    else:\n        print(f"{n} is prime\")  # no break = prime\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Loop Examples',
E'```python\n# Example 1: Sum all numbers 1 to N\nn = int(input(\"Sum up to: \"))\ntotal = 0\nfor i in range(1, n + 1):\n    total += i\nprint(f\"Sum 1 to {n} = {total}\")\n\n# Example 2: Find the first even number\nnumbers = [3, 7, 5, 12, 8, 9]\nfor num in numbers:\n    if num % 2 == 0:\n        print(f\"First even: {num}\")\n        break\n\n# Example 3: Skip vowels\nword = \"hello world\"\nresult = \"\"\nfor char in word:\n    if char in \"aeiou\":\n        continue  # skip vowels\n    result += char\nprint(result)  # \"hll wrld\"\n\n# Example 4: While with sentinel value\ntotal = 0\nwhile True:\n    value = input(\"Enter a number (blank to quit): \")\n    if value == \"\":\n        break\n    total += float(value)\nprint(f\"Total: {total}\")\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Loops Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops';

UPDATE lesson_sections SET metadata = '{"question": "How many times does print() execute in this loop?\n\nfor i in range(10):\n    if i % 2 == 0:\n        continue\n    print(i)", "options": ["10", "5", "4", "9"], "correct_index": 1, "explanation": "range(10) gives 0 through 9. When i is even (0, 2, 4, 6, 8), continue skips the print. When i is odd (1, 3, 5, 7, 9), print executes. That is 5 times total."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Loops Quiz'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Loops',
E'Write a program that:\n1. Asks the user for a positive integer N\n2. Prints all numbers from 1 to N\n3. For multiples of 3, print "Fizz" instead\n4. For multiples of 5, print "Buzz" instead\n5. For multiples of both 3 and 5, print "FizzBuzz"\n\n**Example (N=15):**\n```\n1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n```', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- `for` loops iterate over sequences (range, list, string, dict)\n- `while` loops continue until a condition becomes False\n- `range(start, stop, step)` generates number sequences\n- `break` exits a loop early; `continue` skips to the next iteration\n- `else` on a loop runs only if no `break` occurred\n- `enumerate()` gives you both index and value when iterating', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops';

-- ═══════════════ LESSON 7: py-lists-tuples ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Lists & Tuples',
E'Lists and tuples are ordered collections — sequences of items you can iterate over, index, and slice. Lists are mutable (changeable), tuples are immutable (fixed).', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Lists vs Tuples',
E'**Lists** `[1, 2, 3]` — mutable, can be changed\n```python\nfruits = ["apple", "banana", "cherry"]\nfruits.append("date\")     # ["apple", \"banana\", \"cherry\", \"date\"]\nfruits.insert(0, \"apricot\") # insert at position 0\nfruits.remove(\"banana\")   # remove by value\npopped = f`ruits.pop()     # remove and return last item\nfruits.sort()             # sort in place\nfruits.reverse()          # reverse in place\nprint(len(fruits))        # number of items\nprint(fruits[0])          # first item\nprint(fruits[-1])         # last item\n```\n\n**Tuples** `(1, 2, 3)` — immutable, cannot be changed\n```python\npoint = (3, 4)\nx, y = point  # unpacking\nprint(x)  # 3\nprint(y)  # 4\n\n# Tuples are often used for fixed data\nrgb = (255, 128, 0)  # (red, green, blue)\nprint(rgb[1])  # 128\n```\n\n**When to use each:**\n- Use lists when the data can change (adding/removing items)\n- Use tuples for fixed data (coordinates, RGB values, function return values)\n- Tuples are faster and use less memory\n- Tuples can be used as dictionary keys; lists cannot', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'List Operations',
E'```python\n# Slicing works just like strings\nnums = [0, 1, 2, 3, 4, 5]\nprint(nums[1:4])   # [1, 2, 3]\nprint(nums[::2])   # [0, 2, 4]\nprint(nums[::-1])  # [5, 4, 3, 2, 1, 0]\n\n# List concatenation and repetition\nprint([1, 2] + [3, 4])  # [1, 2, 3, 4]\nprint([0] * 5)          # [0, 0, 0, 0, 0]\n\n# Checking membership\nprint(3 in [1, 2, 3])    # True\nprint(5 not in [1, 2])   # True\n\n# Nested lists (matrices)\nmatrix = [\n    [1, 2, 3],\n    [4, 5, 6],\n    [7, 8, 9]\n]\nprint(matrix[1][2])  # 6 (row 1, col 2)\n\n# List comprehensions (preview — more later!)\nsquares = [x**2 for x in range(10)]\nprint(squares)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]\n\nevens = [x for x in range(20) if x % 2 == 0]\nprint(evens)  # [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'common_mistakes', 'List Pitfalls',
E'**1. Modifying a list while iterating**\n```python\n# WRONG — skips items!\nnumbers = [1, 2, 3, 4, 5]\nfor n in numbers:\n    if n % 2 == 0:\n        numbers.remove(n)\nprint(numbers)  # [1, 3, 5]??? Actually [1, 3, 4, 5]\n\n# RIGHT — iterate over a copy\nfor n in numbers[:]:\n    if n % 2 == 0:\n        numbers.remove(n)\n```\n\n**2. List aliasing**\n```python\na = [1, 2, 3]\nb = a       # b is a reference to the SAME list\nb.append(4)\nprint(a)    # [1, 2, 3, 4] — a changed too!\n\n# Use copy to avoid this\nb = a.copy()   # or b = a[:]\nb.append(5)\nprint(a)    # [1, 2, 3, 4] — unchanged\n```\n\n**3. Confusing append and extend**\n```python\nitems = [1, 2]\nitems.append([3, 4])  # [1, 2, [3, 4]] — nested list!\nitems.extend([5, 6])  # [1, 2, [3, 4], 5, 6] — adds each element\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Lists Quiz',
E'', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples';

UPDATE lesson_sections SET metadata = '{"question": "What is the result of [1, 2, 3, 4, 5][-2:]?", "options": ["[4, 5]", "[3, 4]", "[3, 4, 5]", "[4]"], "correct_index": 0, "explanation": "Negative indices count from the end. -2 is the second-to-last element (4), and [:-2:] goes from there to the end, giving [4, 5]."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Lists Quiz'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: List Operations',
E'Write a program that:\n1. Creates a list of 5 numbers (ask the user for each)\n2. Prints the list, the sum, the average, the largest, and the smallest\n3. Creates a new list with only the even numbers\n4. Reverses the list and prints it\n\n**Bonus:** Ask the user for a number and tell them if it is in the list.', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Lists are mutable ordered collections; tuples are immutable\n- Indexing and slicing works the same as with strings\n- Common list methods: append, extend, insert, remove, pop, sort, reverse\n- Use `.copy()` or `[:]` to create independent copies of a list\n- Tuples are great for fixed data and can be dictionary keys\n- List comprehensions provide a concise way to create lists', 7
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples';

-- ═══════════════ LESSON 8: py-functions ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Functions: Reusable Code',
E'Functions let you bundle code into named, reusable blocks. They are the foundation of organised, maintainable Python programs.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Def & Return',
E'```python\ndef greet(name):\n    """Return a friendly greeting."""  # docstring\n    return f"Hello, {name}!\"\n\nmessage = greet(\"Alice\")\nprint(message)  # Hello, Alice!\n```\n\n**Anatomy of a function:**\n- `def` — keyword that starts the definition\n- `greet` — function name (snake_case)\n- `(name)` — parameters (inputs)\n- `"""docstring"""` — optional documentation string\n- `return` — sends a value back to the caller (optional)\n\n**Parameters and arguments:**\n```python\n# Default parameters\ndef power(base, exponent=2):\n    return base ** exponent\n\nprint(power(5))      # 25 (exponent defaults to 2)\nprint(power(5, 3))   # 125\n\n# Keyword arguments (order doesn''t matter)\ndef introduce(name, age, city):\n    print(f\"{name} is {age} years old from {city}\")\n\nintroduce(city=\"Paris\", age=30, name=\"Bob\")\n\n# *args — variable number of positional arguments\ndef sum_all(*nums):\n    return sum(nums)\n\nprint(sum_all(1, 2, 3, 4, 5))  # 15\n\n# **kwargs — variable number of keyword arguments\ndef print_info(**info):\n    for key, value in info.items():\n        print(f\"{key}: {value}\")\n\nprint_info(name=\"Alice\", age=25, job=\"Engineer\")\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Function Examples',
E'```python\n# Example 1: Multiple return values (as tuple)\ndef min_max(items):\n    return min(items), max(items)\n\nlow, high = min_max([3, 1, 7, 2, 9])\nprint(f\"Low: {low}, High: {high}\")\n\n# Example 2: Recursive function\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))  # 120\n\n# Example 3: Function as argument\ndef apply_twice(func, value):\n    return func(func(value))\n\ndef add_one(x):\n    return x + 1\n\nprint(apply_twice(add_one, 5))  # 7\n\n# Example 4: Type hints (Python 3.5+)\ndef calculate_bmi(weight_kg: float, height_m: float) -> float:\n    """Calculate BMI from weight (kg) and height (m).\"\"\"\n    return weight_kg / (height_m ** 2)\n\nprint(calculate_bmi(70, 1.75))  # 22.86...\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Functions Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions';

UPDATE lesson_sections SET metadata = '{"question": "What does this code print?\n\ndef mystery(x, y=2, z=3):\n    return (x + y) * z\n\nprint(mystery(5))", "options": ["21", "25", "13", "Error"], "correct_index": 0, "explanation": "x=5, y defaults to 2, z defaults to 3. (5 + 2) * 3 = 7 * 3 = 21."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Functions Quiz'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Functions',
E'Write functions to solve these problems. Test each one by calling it with sample arguments.\n\n1. **is_palindrome(text)** — returns True if the string is the same forwards and backwards\n2. **count_vowels(text)** — returns the number of vowels (a, e, i, o, u) in a string\n3. **fibonacci(n)** — returns the nth Fibonacci number (F(0)=0, F(1)=1)\n4. **filter_long_words(words, max_len)** — returns a list of words shorter than max_len\n\n**Example output:**\n```python\nprint(is_palindrome(\"racecar\"))  # True\nprint(count_vowels(\"hello\"))     # 2\nprint(fibonacci(10))             # 55\nprint(filter_long_words([\"hi\", \"hello\", \"a\", \"world\"], 4))  # [\"hi\", \"a\"]\n```', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Functions are defined with `def` and named in snake_case\n- Use `return` to send a value back; functions without return return None\n- Parameters can have default values: `def func(x, y=10)`\n- `*args` captures extra positional args; `**kwargs` captures extra keyword args\n- Docstrings document what a function does\n- Type hints improve readability and enable static checking\n- Functions are first-class objects — they can be passed as arguments', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions';

-- ═══════════════ LESSON 9: py-dicts-sets ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Dictionaries & Sets',
E'Dictionaries map keys to values — think of them as labelled storage boxes. Sets store unique unordered items. Together, they handle most structured data needs.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-dicts-sets';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Dict & Set Basics',
E'**Dictionaries** `{key: value}`\n```python\n# Creating dicts\nstudent = {\n    "name": "Alice",\n    "age": 20,\n    "courses": ["Math", "CS"]\n}\n\n# Accessing and modifying\nprint(student["name\"])      # Alice\nprint(student.get(\"grade\", \"N/A\"))  # N/A (safe access with default)\nstudent[\"age\"] = 21        # update\nstudent[\"grade\"] = \"A\"     # add new key\n\n# Dict methods\nprint(student.keys())    # dict_keys([''name'', ''age'', ...])\nprint(student.values())  # dict_values([''Alice'', 21, ...])\nprint(student.items())   # dict_items([(''name'', ''Alice''), ...])\n\n# Iterating\nfor key, value in student.items():\n    print(f\"{key}: {value}\")\n\n# Check if key exists\nif \"name\" in student:\n    print(\"Name present\")\n\n# Merge dicts (Python 3.9+)\nmerged = {**dict1, **dict2}\nmerged = dict1 | dict2\n```\n\n**Sets** `{1, 2, 3}` — unique, unordered\n```python\nfruits = {\"apple\", \"banana\", \"cherry\"}\nfruits.add(\"date\")\nfruits.remove(\"banana\")\n\n# Set operations\na = {1, 2, 3, 4}\nb = {3, 4, 5, 6}\nprint(a | b)  # union: {1, 2, 3, 4, 5, 6}\nprint(a & b)  # intersection: {3, 4}\nprint(a - b)  # difference: {1, 2}\nprint(a ^ b)  # symmetric diff: {1, 2, 5, 6}\n\n# Fast membership testing (O(1))\nprint(3 in a)  # True\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-dicts-sets';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'best_practices', 'Dict & Set Tips',
E'- **Use .get() for safe access** — `value = my_dict.get(key, default)` avoids KeyError\n- **Use `in` to check keys** — much faster than catching KeyError\n- **Sets are ideal for deduplication** — `unique = set(my_list)`\n- **Dict keys must be immutable** — strings, numbers, tuples (not lists)\n- **Default dict** — `from collections import defaultdict` for auto-initialising values\n- **Ordered dicts** — since Python 3.7, regular dicts maintain insertion order (officially guaranteed)', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-dicts-sets';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Word Counter',
E'Write a program that:\n1. Asks the user for a sentence\n2. Counts how many times each word appears (case-insensitive)\n3. Prints each word and its count, sorted alphabetically\n4. Prints the most common word and how many times it appears\n\n**Bonus:** Use a set to find all unique words. Use a dict to store counts.\n\n**Example:**\n```\nEnter a sentence: the cat and the dog and the bird\nWord counts:\n  and: 2\n  bird: 1\n  cat: 1\n  dog: 1\n  the: 3\nMost common: ''the'' (3 times)\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-dicts-sets';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Dicts store key-value pairs; keys must be immutable\n- Use `dict[key]` to access, `dict[key] = value` to assign\n- `.get(key, default)` provides safe access\n- `.keys()`, `.values()`, `.items()` provide views into dict data\n- Sets store unique elements with O(1) membership testing\n- Set operations: union (|), intersection (&), difference (-)', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-dicts-sets';

-- ═══════════════ LESSON 10: py-comprehensions ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Comprehensions & Lambda',
E'Python provides elegant, concise ways to create collections and write small anonymous functions. Comprehensions and lambdas are hallmarks of Pythonic code.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-comprehensions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Comprehension Syntax',
E'**List comprehensions:**\n```python\n# Basic: [expression for item in iterable]\nsquares = [x**2 for x in range(10)]\n# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]\n\n# With condition: [expression for item in iterable if condition]\nevens = [x for x in range(20) if x % 2 == 0]\n# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]\n\n# With transformation and condition\nnegatives_squared = [x**2 for x in range(-5, 6) if x < 0]\n# [25, 16, 9, 4, 1]\n\n# Nested comprehension (flatten matrix)\nmatrix = [[1, 2], [3, 4], [5, 6]]\nflat = [num for row in matrix for num in row]\n# [1, 2, 3, 4, 5, 6]\n```\n\n**Dict comprehensions:**\n```python\nsquares_dict = {x: x**2 for x in range(5)}\n# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}\n\nword_lengths = {word: len(word) for word in [\"hello\", \"world\", \"python\"]}\n# {''hello'': 5, ''world'': 5, ''python'': 6}\n```\n\n**Set comprehensions:**\n```python\nunique_lengths = {len(word) for word in [\"hi\", \"hello\", \"a\", \"world\"]}\n# {1, 2, 5}\n```\n\n**Generator expressions** (memory-efficient, lazy):\n```python\ntotal = sum(x**2 for x in range(1000000))  # no intermediate list!\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-comprehensions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Lambda & Functional Tools',
E'**Lambda functions:** small anonymous functions\n```python\n# Syntax: lambda args: expression\nsquare = lambda x: x**2\nprint(square(5))  # 25\n\n# Often used with map, filter, sorted\nnumbers = [1, 4, 2, 8, 5, 3]\n\n# map — apply function to every item\ndoubled = list(map(lambda x: x * 2, numbers))\n# [2, 8, 4, 16, 10, 6]\n\n# filter — keep items where condition is True\nbig = list(filter(lambda x: x > 4, numbers))\n# [8, 5]\n\n# sorted with custom key\nwords = [\"banana\", \"apple\", \"cherry\", \"date\"]\nsorted_by_len = sorted(words, key=lambda w: len(w))\n# [''date'', ''apple'', ''banana'', ''cherry'']\n\n# sorted by last character\nsorted_by_last = sorted(words, key=lambda w: w[-1])\n# [''banana'', ''apple'', ''date'', ''cherry'']\n```\n\n<div class="tip">Prefer comprehensions over map/filter/lambda when possible — they are usually more readable. Use lambda when you need an inline function for something like sorted() or max().</div>', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-comprehensions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Comprehensions Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-comprehensions';

UPDATE lesson_sections SET metadata = '{"question": "What does [x for x in range(10) if x % 3 == 0] produce?", "options": ["[0, 3, 6, 9]", "[3, 6, 9]", "[1, 4, 7, 10]", "[0, 3, 6, 9, 12]"], "correct_index": 0, "explanation": "range(10) gives 0-9. The condition x % 3 == 0 keeps numbers divisible by 3: 0, 3, 6, 9."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Comprehensions Quiz'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-comprehensions');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Comprehensions',
E'Use comprehensions to solve each problem in ONE line each:\n\n1. Create a list of the first 10 cubes (1, 8, 27, ...)\n2. From a list of numbers, create a list of only the positive numbers\n3. Create a dict mapping each word to its length for a given sentence\n4. Create a set of all unique characters in a string\n5. Use a generator expression to sum the squares of 1 to 100_000\n\n**Starter code:**\n```python\nnumbers = [5, -3, 12, -7, 0, 8, -1, 4]\ntext = "hello world"\nsentence = "Python comprehensions are powerful"\n\n# Your solutions here\n```', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-comprehensions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Comprehensions provide a concise way to create lists, dicts, and sets\n- Format: `[expression for item in iterable if condition]`\n- Generator expressions use `(...)` instead of `[...]` — lazy evaluation\n- Lambda creates anonymous functions: `lambda args: expression`\n- Use comprehensions over map/filter for readability\n- Use sorted() with key for custom sorting', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-comprehensions';

-- ═══════════════ LESSON 11: py-file-io ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Working with Files',
E'Real programs need to read and write files. Python makes file I/O simple and safe with the `open()` function and the `with` statement.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-file-io';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Reading & Writing Files',
E'```python\n# Writing to a file\nwith open("output.txt", "w") as f:\n    f.write("Hello, World!\\n")\n    f.write("Second line\\n")\n    f.writelines([\"Line 3\\n\", \"Line 4\\n\"])\n# File auto-closes after with block\n\n# Reading a file\nwith open("output.txt", "r") as f:\n    content = f.read()        # entire file as string\n    lines = f.readlines()     # list of lines\n\n# Reading line by line (memory efficient for large files)\nwith open("large_file.txt", \"r\") as f:\n    for line in f:\n        print(line.strip())  # strip removes \\n\n```\n\n**File modes:**\n| Mode | Description |\n|------|------------|\n| `"r"` | Read (default) |\n| `"w"` | Write (overwrites existing file) |\n| `"a"` | Append (adds to end of file) |\n| `"x"` | Exclusive creation (fails if file exists) |\n| `"r+"` | Read and write |\n| `"b"` | Binary mode (add to other modes, e.g. `"rb\"`) |\n\n**Working with JSON:**\n```python\nimport json\n\n# Write\nperson = {\n    \"name\": \"Alice\",\n    \"age\": 30,\n    \"skills\": [\"Python\", \"Data\"]\n}\nwith open(\"person.json\", \"w\") as f:\n    json.dump(person, f, indent=2)\n\n# Read\nwith open(\"person.json\", \"r\") as f:\n    data = json.load(f)\n    print(data[\"name\"])  # Alice\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-file-io';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'best_practices', 'File I/O Tips',
E'- **Always use `with`** — it guarantees the file is closed, even if an exception occurs\n- **Use `for line in f`** for large files instead of `.read()` or `.readlines()`\n- **Specify encoding** with `open(..., encoding=\"utf-8\")` to avoid platform-dependent behaviour\n- **Use pathlib** for modern path handling: `from pathlib import Path`, then `Path(\"data/file.txt\").read_text()`\n- **Check if file exists** with `os.path.exists(\"file.txt\")` or `Path(\"file.txt\").exists()`', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-file-io';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: File Operations',
E'Write a program that:\n1. Creates a file called "notes.txt"\n2. Writes 3 lines of text to it\n3. Reads the file back and prints each line with a line number\n4. Appends another line to the file\n5. Reads the file again to confirm the new content\n6. Writes the same data as a JSON file\n\n**Bonus:** Ask the user for a filename and a word, then count how many times that word appears in the file.\n\n<div class="info">Since we''re in a browser environment, use Pyodide''s virtual file system — it behaves exactly like real files.</div>', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-file-io';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- `open(filename, mode)` opens a file; always use `with` for auto-closing\n- Modes: "r" read, "w" write, "a" append, "b" binary\n- `json.dump()` writes JSON; `json.load()` reads JSON\n- Use `for line in f` for memory-efficient reading\n- pathlib provides a modern, object-oriented approach to file paths\n- Always specify encoding="utf-8" for cross-platform compatibility', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-file-io';

-- ═══════════════ LESSON 12: py-error-handling ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Handling Errors Gracefully',
E'Errors happen — files get deleted, users type "abc" when asked for a number, networks fail. Professional code anticipates and handles these situations gracefully.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Try / Except / Else / Finally',
E'```python\ntry:\n    # Code that might raise an exception\n    num = int(input(\"Enter a number: \"))\n    result = 10 / num\n    print(f\"Result: {result}\")\nexcept ValueError:\n    # Runs if ValueError is raised\n    print(\"That was not a valid number!\")\nexcept ZeroDivisionError:\n    # Runs if ZeroDivisionError is raised\n    print(\"Cannot divide by zero!\")\nexcept Exception:\n    # Catches any other exception (use sparingly)\n    print(\"Something went wrong.\")\nelse:\n    # Runs ONLY if no exception occurred\n    print(\"Everything worked perfectly!\")\nfinally:\n    # ALWAYS runs (cleanup code)\n    print(\"This runs no matter what.\")\n```\n\n**Common built-in exceptions:**\n| Exception | Cause |\n|-----------|-------|\n| ValueError | Invalid value for a type |\n| TypeError | Operation on incompatible type |\n| IndexError | List index out of range |\n| KeyError | Dict key not found |\n| FileNotFoundError | File does not exist |\n| ZeroDivisionError | Division by zero |\n| AttributeError | Object has no such attribute |\n\n**Raising exceptions:**\n```python\ndef set_age(age):\n    if age < 0:\n        raise ValueError(\"Age cannot be negative!\")\n    if age > 150:\n        raise ValueError(f\"{age} is unrealistic\")\n    print(f\"Age set to {age}\")\n```\n\n**Custom exceptions:**\n```python\nclass InsufficientFundsError(Exception):\n    def __init__(self, balance, amount):\n        self.balance = balance\n        self.amount = amount\n        super().__init__(f\"Insufficient funds: ${balance} < ${amount}\")\n\nclass BankAccount:\n    def withdraw(self, amount):\n        if amount > self.balance:\n            raise InsufficientFundsError(self.balance, amount)\n        self.balance -= amount\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'common_mistakes', 'Error Handling Pitfalls',
E'**1. Bare except (too broad)**\n```python\ntry:\n    # risky code\nexcept:  # catches ANYTHING, including KeyboardInterrupt!\n    pass\n\n# Better — catch specific exceptions\nexcept ValueError:\n    pass\n```\n\n**2. Swallowing exceptions silently**\n```python\ntry:\n    result = risky_operation()\nexcept Exception:\n    pass  # BAD! We''ll never know it failed\n\n# At least log or print\n    print(\"Operation failed, continuing...\")\n```\n\n**3. Not using finally for cleanup**\n```python\nf = open(\"file.txt\")\ntry:\n    # process file\nexcept:\n    pass\nf.close()  # WON''T RUN if exception occurs above! Use finally\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Error Handling Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling';

UPDATE lesson_sections SET metadata = '{"question": "What runs when you divide by zero in a try block with both except and finally?\n\ntry:\n    x = 10 / 0\nexcept ZeroDivisionError:\n    print(\"E\")\nfinally:\n    print(\"F\")", "options": ["E then F", "F only", "E only", "Neither (program crashes)"], "correct_index": 0, "explanation": "ZeroDivisionError is raised, caught by except which prints ''E''. The finally block always runs, so ''F'' prints next. Output: E then F."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Error Handling Quiz'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Error Handling',
E'Write a program that:\n1. Asks the user for a filename\n2. Tries to read the file and print its contents\n3. Handles FileNotFoundError with a friendly message\n4. Handles PermissionError (no permission to read)\n5. Handles IsADirectoryError (user gave a directory name)\n6. Has a finally block that always prints "File operation attempted"\n\n**Bonus:** Write a `safe_divide(a, b)` function that returns `None` if division is impossible, with the actual exception stored in a custom error object.', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- `try/except` catches and handles exceptions gracefully\n- Catch specific exception types, not bare `except:`\n- `else` runs only if no exception occurred\n- `finally` always runs — use for cleanup (close files, release resources)\n- `raise` manually triggers an exception\n- Create custom exception classes by extending Exception\n- Never swallow exceptions silently — at minimum log them', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling';

-- ═══════════════ LESSON 13: py-capstone ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Building a Contact Book',
E'This capstone brings together everything you have learned: variables, conditionals, loops, lists, dicts, functions, file I/O, and error handling. You will build a working Contact Book application.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-capstone';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Application Design',
E'Your Contact Book will support these operations:\n\n```\n=== CONTACT BOOK ===\n1. Add contact\n2. Search contacts\n3. View all contacts\n4. Update contact\n5. Delete contact\n6. Save & Exit\n====================\n```\n\n**Data structure:**\n```python\n# Each contact is a dict\n{\n    "name": "Alice Johnson",\n    "phone": "555-1234",\n    "email": "alice@example.com"\n}\n\n# All contacts stored in a list\ncontacts = []\n```\n\n**Functions to implement:**\n| Function | Purpose |\n|----------|---------|\n| `load_contacts()` | Load from JSON file on startup |\n| `save_contacts()` | Save to JSON file |\n| `add_contact()` | Add new contact dict |\n| `search_contacts()` | Search by name (case-insensitive) |\n| `list_contacts()` | Display all contacts |\n| `update_contact()` | Update a contact by name |\n| `delete_contact()` | Remove a contact |\n| `main()` | Main menu loop |', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-capstone';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Starter Code',
E'```python\nimport json\nimport os\n\nCONTACTS_FILE = "contacts.json"\n\ndef load_contacts():\n    """Load contacts from JSON file."""\n    if not os.path.exists(CONTACTS_FILE):\n        return []\n    with open(CONTACTS_FILE, "r") as f:\n        return json.load(f)\n\ndef save_contacts(contacts):\n    """Save contacts to JSON file."""\n    with open(CONTACTS_FILE, "w") as f:\n        json.dump(contacts, f, indent=2)\n    print("Contacts saved!")\n\ndef add_contact(contacts):\n    """Add a new contact."""\n    print("\\n--- Add New Contact ---")\n    name = input("Name: ").strip()\n    if not name:\n        print("Name cannot be empty!")\n        return\n    phone = input("Phone: \").strip()\n    email = input(\"Email: \").strip()\n    contacts.append({"name": name, "phone": phone, "email": email})\n    print(f"Contact ''{name}'' added!\")\n```\n\nContinue building the remaining functions: search_contacts(), list_contacts(), update_contact(), delete_contact(), and main().', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-capstone';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'best_practices', 'Capstone Tips',
E'- **Start simple** — implement one function at a time and test it\n- **Use functions** — each operation should be its own function\n- **Validate input** — check for empty names, duplicate contacts\n- **Handle errors** — what if the JSON file is corrupted?\n- **Use f-strings** for clean output formatting\n- **Search case-insensitively** — use `.lower()` on both sides\n- **Confirm destructive actions** — ask "Are you sure?" before deleting\n- **Test edge cases** — empty contact book, not found, duplicate names', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-capstone';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'mini_project', 'Contact Book Project',
E'Build and test the complete Contact Book application. Use the starter code provided and implement all functions.\n\n**Requirements:**\n1. Contacts persist between runs (saved to JSON)\n2. Search finds partial matches (e.g. search "Ali" finds "Alice")\n3. Update allows changing any field\n4. Delete asks for confirmation\n5. Graceful handling of corrupt or missing data\n6. Clean, readable code with docstrings\n\n**Stretch goals:**\n- Add a "favourite" flag to contacts\n- Sort contacts alphabetically\n- Validate email format (must contain @)\n- Add a "phone book" view showing only names and phone numbers', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-capstone';

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. PROJECTS
-- ═══════════════════════════════════════════════════════════════════════════

-- Project for capstone lesson
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'py-contacts-project', 'Contact Book Application',
'Build a fully functional contact book that stores, searches, and manages contacts. Data persists using JSON file I/O.',
E'1. Implement all CRUD operations\n2. Contacts persist between runs\n3. Case-insensitive search\n4. Handle missing/corrupt files\n5. Clean menu-driven interface\n6. Update allows partial field changes\n7. Delete with confirmation',
E'import json\nimport os\n\nCONTACTS_FILE = "contacts.json"\n\ndef load_contacts():\n    if not os.path.exists(CONTACTS_FILE):\n        return []\n    try:\n        with open(CONTACTS_FILE, "r") as f:\n            return json.load(f)\n    except (json.JSONDecodeError, PermissionError):\n        print("Warning: Could not load contacts file. Starting fresh.")\n        return []\n\ndef save_contacts(contacts):\n    with open(CONTACTS_FILE, "w") as f:\n        json.dump(contacts, f, indent=2)\n\ndef main():\n    contacts = load_contacts()\n    while True:\n        print("\\n=== CONTACT BOOK ===")\n        print("1. Add contact")\n        print("2. Search contacts")\n        print("3. View all contacts")\n        print("4. Update contact")\n        print("5. Delete contact")\n        print("6. Save & Exit")\n        choice = input("\\nChoice: ").strip()\n        if choice == "1":\n            # TODO: implement\n            pass\n        elif choice == "2":\n            # TODO: implement\n            pass\n        elif choice == "3":\n            # TODO: implement\n            pass\n        elif choice == "4":\n            # TODO: implement\n            pass\n        elif choice == "5":\n            # TODO: implement\n            pass\n        elif choice == "6":\n            save_contacts(contacts)\n            print("Goodbye!")\n            break\n        else:\n            print("Invalid choice. Try again.")\n\nif __name__ == "__main__":\n    main()',
3, 150,
ARRAY['Implement search with name.lower() in query.lower()', 'Use enumerate() to show numbered list for update/delete', 'Use try/except around json.load() to handle corrupt data', 'Test with at least 3 sample contacts'],
1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-capstone'
ON CONFLICT (lesson_id, slug) DO NOTHING;

COMMIT;
