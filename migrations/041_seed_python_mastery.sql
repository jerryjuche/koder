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
       1, 10, 30, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-variables-types', 'Variables & Data Types',
       'Learn about integers, floats, strings, booleans, and None. Master variable assignment, dynamic typing, and the type() function.',
       1, 15, 40, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-strings-basics', 'Strings & String Methods',
       'Master Python string manipulation: indexing, slicing, concatenation, f-strings, and dozens of built-in string methods.',
       1, 20, 50, 3, false, ARRAY[]::TEXT[]
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
       1, 15, 40, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-loops', 'Loops & Iteration',
       'for loops over ranges, lists, strings, and dicts. while loops, break, continue, else clauses, and the enumerate() and zip() functions.',
       2, 20, 50, 2, false, ARRAY[]::TEXT[]
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
       2, 20, 50, 1, false, ARRAY[]::TEXT[]
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
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-welcome')
ON CONFLICT DO NOTHING;

-- py-strings-basics depends on py-variables-types
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types')
ON CONFLICT DO NOTHING;

-- py-user-input depends on py-strings-basics
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-user-input'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics')
ON CONFLICT DO NOTHING;

-- py-conditionals depends on py-variables-types
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types')
ON CONFLICT DO NOTHING;

-- py-loops depends on py-conditionals
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals')
ON CONFLICT DO NOTHING;

-- py-lists-tuples depends on py-loops
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops')
ON CONFLICT DO NOTHING;

-- py-functions depends on py-lists-tuples
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples')
ON CONFLICT DO NOTHING;

-- py-dicts-sets depends on py-functions
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-dicts-sets'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions')
ON CONFLICT DO NOTHING;

-- py-comprehensions depends on py-dicts-sets
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-comprehensions'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-dicts-sets')
ON CONFLICT DO NOTHING;

-- py-file-io depends on py-functions
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-file-io'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions')
ON CONFLICT DO NOTHING;

-- py-error-handling depends on py-file-io
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-file-io')
ON CONFLICT DO NOTHING;

-- py-capstone depends on py-error-handling
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-capstone'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. LESSON SECTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════ LESSON 1: py-welcome ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What is Python?',
$py$Python is a high-level, interpreted programming language known for its readability and versatility. Created by Guido van Rossum and first released in 1991, Python has grown into one of the world's most popular programming languages.

**Why Python?**
- Readable syntax that reads like English
- Works everywhere: web, data science, automation, games
- Huge standard library ("batteries included")
- Massive community and ecosystem
- Great first language for beginners$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-welcome';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Your First Program',
$py$The tradition is to start with "Hello, World!" — a program that prints that exact phrase.

```python
print("Hello, World!")
```

**How it works:**
- `print()` is a built-in Python function
- It takes whatever you put inside the parentheses and displays it
- Text inside quotes is called a **string**
- The program runs line by line from top to bottom

**Try it yourself:** In the exercise panel on the right, type the code above and click "Run in Browser".$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-welcome';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'More Print Examples',
$py$```python
# A single message
print("Hello, World!")

# Multiple arguments — automatically separated by space
print("Hello", "World", "from", "Python")

# Numbers don't need quotes
print(42)
print(3.14159)

# You can mix types
print("The answer is", 42)

# Empty print adds a blank line
print()
print("After a blank line")

# The newline character \n
print("Line 1\nLine 2\nLine 3")
```

<div class="tip">You can use single quotes ' or double quotes "" for strings in Python — both work the same way. Just stay consistent!</div>$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-welcome';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Quick Check',
$py$$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-welcome';

UPDATE lesson_sections SET metadata = '{"question": "What does print(\"Hello\" + \" \" + \"World\") output?", "options": ["Hello World", "Hello+ +World", "Hello World (with extra spaces)", "Error"], "correct_index": 0, "explanation": "The + operator concatenates strings, joining them together. print() then displays the result: Hello World."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Quick Check'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-welcome');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Your Turn: Double It',
$py$Write a Python program that:
1. Creates a variable `number` with the value 7
2. Creates a variable `doubled` that holds `number * 2`
3. Prints `"The double is: "` followed by the doubled value

**Hint:** Use the `print()` function with a comma to mix text and numbers.$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-welcome';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'What You Learned',
$py$- Python is a readable, beginner-friendly programming language
- `print()` displays output to the screen
- Strings are text enclosed in quotes
- Python runs code line by line from top to bottom
- Comments start with `#` and are ignored by Python$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-welcome';

-- ═══════════════ LESSON 2: py-variables-types ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Variables & Types',
$py$Variables are named containers that store data. Python is **dynamically typed** — you don't need to declare what type a variable holds. The type is inferred from the value you assign.

**In this lesson:**
- Creating and naming variables
- Python's basic data types
- The `type()` function
- Type conversion between types$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Basic Data Types',
$py$Python has four fundamental data types you will use every day:

**int** — Whole numbers
```python
age = 25
count = -3
big = 1_000_000  # underscores improve readability
```

**float** — Decimal numbers
```python
price = 19.99
pi = 3.14159
scientific = 1.5e-4  # 0.00015
```

**str** — Text (strings)
```python
name = "Alice"
greeting = 'Hello'
multiline = """This spans
multiple lines"""
```

**bool** — True or False
```python
is_active = True
is_done = False
```

**NoneType** — Represents "no value"
```python
result = None
```

Use the `type()` function to check any variable's type:
```python
print(type(42))        # <class 'int'>
print(type("hello"))   # <class 'str'>
print(type(True))      # <class 'bool'>
```$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Variable Naming & Assignment',
$py$```python
# Valid variable names
name = "Alice"
age = 25
my_name = "Bob"
name2 = "Charlie"
_user_name = "Dave"

# Invalid variable names (will cause errors)
# 2name = "Eve"       # Cannot start with a number
# my-name = "Frank"    # Hyphens not allowed
# class = "Math"       # Reserved keyword

# Reassigning variables
temperature = 30
print(temperature)   # 30
temperature = "hot"
print(temperature)   # "hot" — type changed!

# Multiple assignment
x, y, z = 1, 2, 3
print(x, y, z)  # 1 2 3

# Swapping variables (Pythonic!)
a, b = 10, 20
a, b = b, a
print(a, b)  # 20 10
```

<div class="tip">Python uses snake_case for variable names — all lowercase with underscores between words. This is a community convention, not a rule.</div>$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'common_mistakes', 'Common Pitfalls',
$py$**1. Using undefined variables**
```python
print(x)  # NameError: name 'x' is not defined
```
Always assign a value before using a variable.

**2. Confusing = and ==**
```python
x = 10    # assignment
x == 10   # comparison (returns True/False)
```

**3. Type errors from mixing types**
```python
print("Age: " + 25)  # TypeError: can only concatenate str (not "int") to str
# Fix: convert with str()
print("Age: " + str(25))
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Check Your Understanding',
$py$$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types';

UPDATE lesson_sections SET metadata = '{"question": "What will print(type(3.14)) display?", "options": ["<class ''int''>", "<class ''float''>", "<class ''str''>", "<class ''decimal''>"], "correct_index": 1, "explanation": "3.14 has a decimal point, so Python treats it as a float. type() returns <class ''float''>."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Check Your Understanding'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Variables',
$py$Write a Python program that:
1. Creates a variable `length` set to 10
2. Creates a variable `width` set to 5
3. Calculates `area = length * width`
4. Prints `"Area: "` followed by the area

Then add:
5. Create `perimeter = 2 * (length + width)`
6. Print `"Perimeter: "` followed by the perimeter

<div class="tip">Use `print("Area:", area)` to print label and value together.</div>$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- Variables store data and are created with the `=` operator
- Python is dynamically typed: variables can change type
- Main types: int, float, str, bool, NoneType
- Use `type()` to check a variable's type
- Variable names follow snake_case convention
- Multiple assignment and swapping make Python code clean$py$, 7
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-variables-types';

-- ═══════════════ LESSON 3: py-strings-basics ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Working with Strings',
$py$Strings are one of the most common data types in Python. This lesson covers everything you need to manipulate text: indexing, slicing, methods, and f-strings — Python's modern string formatting.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Indexing & Slicing',
$py$**String indexing**
Each character in a string has a position (index), starting from 0.

```python
message = "Python"
# Index:  0 1 2 3 4 5
print(message[0])  # P
print(message[3])  # h
print(message[-1]) # n  (negative = from end)
print(message[-2]) # o
```

**String slicing** — extract a portion with `[start:end:step]`
```python
text = "Hello, World!"
print(text[0:5])    # Hello  (indices 0 to 4)
print(text[7:])     # World! (index 7 to end)
print(text[:5])     # Hello  (start to index 4)
print(text[::2])    # Hlo ol! (every 2nd char)
print(text[::-1])   # !dlroW ,olleH (reversed!)
```$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'String Methods & f-strings',
$py$**Common string methods:**
```python
text = "  hello, World!  "
print(text.upper())        # "  HELLO, WORLD!  "
print(text.lower())        # "  hello, world!  "
print(text.strip())        # "hello, World!"  (removes leading/trailing spaces)
print(text.replace("o", "0")) # "  hell0, W0rld!  "
print(text.split(","))     # ["  hello", " World!  "]
print("-".join(["a","b","c"])) # "a-b-c"
print(text.startswith("  he")) # True
print("abc123".isalpha())    # False (has digits)
print("abc".isalpha())       # True
```

**f-strings (Python 3.6+)** — the modern way to format strings:
```python
name = "Alice"
age = 25
print(f"My name is {name} and I am {age} years old.")
# My name is Alice and I am 25 years old.

# Expressions inside f-strings
print(f"In 5 years, {name} will be {age + 5}.")
# In 5 years, Alice will be 30.

# Format specifiers
pi = 3.14159
print(f"Pi to 2 decimals: {pi:.2f}")  # Pi to 2 decimals: 3.14
print(f"Pad with zeros: {42:05d}")    # Pad with zeros: 00042
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'best_practices', 'String Tips',
$py$- **Use f-strings** for formatting — they are faster and more readable than % formatting or .format()
- **Prefer .join() over +** when concatenating many strings: `"".join(items)` is much faster than `s += item` in a loop
- **Strings are immutable** — methods like .upper() return a NEW string, they don't modify the original
- **Use triple quotes** for multi-line strings or docstrings
- **Escape special characters** with backslash: `\n` for newline, `\t` for tab, `\\` for backslash itself$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'String Quiz',
$py$$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics';

UPDATE lesson_sections SET metadata = '{"question": "What does ''Python''[::-1] evaluate to?", "options": ["''Python''", "''nohtyP''", "''P''", "TypeError"], "correct_index": 1, "explanation": "The slice [::-1] reverses the string by stepping backward from end to start. ''Python'' reversed is ''nohtyP''."}'::jsonb
WHERE section_type = 'quiz' AND title = 'String Quiz'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: String Manipulation',
$py$Write a Python program that:
1. Creates a variable `text = "Python programming is fun!"`
2. Prints the length of the string
3. Prints the string in all uppercase
4. Prints the string with 'fun' replaced by 'amazing'
5. Prints the first 6 characters (the word "Python")
6. Prints the string reversed

**Bonus:** Count how many times the letter `"n"` appears in the original string.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- Strings are indexed starting from 0; negative indices count from the end
- Slicing `[start:end:step]` extracts portions of a string
- String methods like .upper(), .strip(), .split() return new strings
- f-strings provide clean, readable string formatting
- Strings are immutable — all operations create new strings$py$, 7
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-strings-basics';

-- ═══════════════ LESSON 4: py-user-input ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Interactive Programs',
$py$A program that only prints output is limited. With `input()`, your programs can ask the user for information and respond dynamically.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-user-input';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Using input()',
$py$```python
name = input("What is your name? ")
print(f"Hello, {name}! Nice to meet you.")
```

**Key points:**
- `input()` ALWAYS returns a string
- The prompt string is optional but helpful
- The program PAUSES at `input()` until the user types something and presses Enter

**Converting input:** Because input() returns a string, you need to convert it for math:
```python
age_str = input("How old are you? ")
age = int(age_str)  # convert string to int
next_year = age + 1
print(f"Next year you will be {next_year}.")

# Shorter version — nest the conversion
age = int(input("How old are you? "))
```

**Safe conversion with try/except:**
```python
try:
    age = int(input("Age: "))
    print(f"Next year: {age + 1}")
except ValueError:
    print("That was not a valid number!")
```$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-user-input';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Interactive Examples',
$py$```python
# Example 1: Simple greeting
name = input("Enter your name: ")
print(f"Hello, {name}!")  

# Example 2: Number input and calculation
try:
    num1 = float(input("Enter first number: "))
    num2 = float(input("Enter second number: "))
    print(f"{num1} + {num2} = {num1 + num2}")
except ValueError:
    print("Please enter valid numbers.")

# Example 3: Mad Libs style
adjective = input("Enter an adjective: ")
noun = input("Enter a noun: ")
verb = input("Enter a verb: ")
print(f"The {adjective} {noun} loves to {verb}!")
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-user-input';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Build an Interactive Calculator',
$py$Write a program that:
1. Asks the user for their name
2. Asks for two numbers
3. Prints a greeting with their name
4. Prints the sum, difference, product, and quotient of the two numbers
5. Handles invalid input gracefully (prints an error instead of crashing)

**Example output:**
```
What is your name? Alice
Enter number 1: 15
Enter number 2: 4

Hello, Alice! Here are your results:
15 + 4 = 19
15 - 4 = 11
15 * 4 = 60
15 / 4 = 3.75
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-user-input';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- `input()` reads user input as a string
- Always convert input to the needed type with int(), float(), etc.
- Use try/except to handle invalid input gracefully
- f-strings make it easy to combine text with variables
- Interactive programs respond dynamically to user input$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-foundations' AND l.slug = 'py-user-input';

-- ═══════════════ LESSON 5: py-conditionals ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Making Decisions',
$py$Your programs need to make decisions. With conditionals, you can execute different code paths based on conditions — responding differently to different inputs, data, or states.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'if/elif/else',
$py$```python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Your grade is {grade}")
```

**Rules:**
- `if` is required, `elif` and `else` are optional
- You can have any number of `elif` blocks
- `else` catches everything that didn't match above
- The colon `:` is required after each condition
- The body MUST be indented (4 spaces by convention)

**Comparison operators:**
| Operator | Meaning |
|----------|--------|
| == | Equal to |
| != | Not equal to |
| <, > | Less than, greater than |
| <=, >= | Less/greater than or equal |

**Boolean operators:**
```python
if age >= 18 and has_license:
    print("You can drive!")

if day == "Saturday" or day == "Sunday":
    print("Weekend!")

if not is_raining:
    print("No umbrella needed!")
```

**Truthiness:** Values that evaluate to False in a boolean context:
- `None`, `False`, `0`, `0.0`, empty strings, empty lists, empty dicts, empty sets
- Everything else is True$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Conditional Examples',
$py$```python
# Example 1: Even or odd
number = 7
if number % 2 == 0:
    print("Even")
else:
    print("Odd")

# Example 2: Ternary (conditional expression)
age = 20
status = "adult" if age >= 18 else "minor"
print(status)  # "adult"

# Example 3: Nested conditionals
temperature = 25
if temperature > 30:
    print("Hot day!")
    if temperature > 40:
        print("Extreme heat warning!")
elif temperature > 20:
    print("Nice weather.")
else:
    print("Cool day.")

# Example 4: Using truthiness
name = input("Enter your name: ")
if name:  # True if name is not empty
    print(f"Hello, {name}!")
else:
    print("You didn't enter a name.")
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'common_mistakes', 'Conditional Pitfalls',
$py$**1. Using = instead of ==**
```python
if x = 10:   # SyntaxError! = is assignment
if x == 10:  # Correct — comparison
```

**2. Forgetting the colon**
```python
if x > 5    # SyntaxError!
if x > 5:   # Correct
```

**3. Inconsistent indentation**
```python
if x > 5:
print("Big")    # IndentationError
```

**4. elif after else**
```python
if x > 0:
    print("Positive")
else:
    print("Not positive")
elif x == 0:  # SyntaxError! elif must come before else
    print("Zero")
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Conditionals Quiz',
$py$$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals';

UPDATE lesson_sections SET metadata = '{"question": "What does this code print?\n\nx = 15\nif x > 20:\n    print(\"A\")\nelif x > 10:\n    print(\"B\")\nelif x > 5:\n    print(\"C\")\nelse:\n    print(\"D\")", "options": ["A", "B", "C", "D"], "correct_index": 1, "explanation": "x is 15. First condition (x > 20) is False. Second condition (x > 10) is True, so it prints ''B'' and skips the rest."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Conditionals Quiz'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Conditionals',
$py$Write a program that:
1. Asks the user for a number
2. Checks if it's positive, negative, or zero
3. Checks if it's even or odd
4. Checks if it's a multiple of 5

**Example output:**
```
Enter a number: 15
15 is positive
15 is odd
15 is a multiple of 5
```$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- Use if/elif/else to create decision branches in your code
- Conditions use comparison operators (==, !=, <, >, <=, >=)
- Combine conditions with and, or, not
- Every value has a truthiness — empty/zero/None are False
- Indentation (4 spaces) determines which code belongs to each branch
- Use the ternary `x if condition else y` for simple conditionals$py$, 7
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-conditionals';

-- ═══════════════ LESSON 6: py-loops ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Repeating with Loops',
$py$Loops let you repeat code efficiently. Instead of writing the same operation 10 times, write it once inside a loop and let Python handle the repetition.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'For Loops & While Loops',
$py$**The `for` loop** — iterate over a sequence:
```python
# Over a range
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# range(start, stop, step)
for i in range(2, 10, 2):
    print(i)  # 2, 4, 6, 8

# Over a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# Over a string
for char in "Python":
    print(char)  # P, y, t, h, o, n

# With enumerate (get index and value)
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")
```

**The `while` loop** — repeat until condition is False:
```python
count = 0
while count < 5:
    print(count)
    count += 1  # don't forget to update!

# Infinite loop with break
while True:
    response = input("Type 'quit' to exit: ")
    if response == "quit":
        break  # exit the loop
```

**Loop control:**
- `break` — exit the loop immediately
- `continue` — skip to the next iteration
- `else` — runs ONLY if the loop completed normally (no break)

```python
for n in range(2, 10):
    for x in range(2, n):
        if n % x == 0:
            print(f"{n} = {x} * {n//x}")
            break
    else:
        print(f"{n} is prime")  # no break = prime
```$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Loop Examples',
$py$```python
# Example 1: Sum all numbers 1 to N
n = int(input("Sum up to: "))
total = 0
for i in range(1, n + 1):
    total += i
print(f"Sum 1 to {n} = {total}")

# Example 2: Find the first even number
numbers = [3, 7, 5, 12, 8, 9]
for num in numbers:
    if num % 2 == 0:
        print(f"First even: {num}")
        break

# Example 3: Skip vowels
word = "hello world"
result = ""
for char in word:
    if char in "aeiou":
        continue  # skip vowels
    result += char
print(result)  # "hll wrld"

# Example 4: While with sentinel value
total = 0
while True:
    value = input("Enter a number (blank to quit): ")
    if value == "":
        break
    total += float(value)
print(f"Total: {total}")
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Loops Quiz',
$py$$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops';

UPDATE lesson_sections SET metadata = '{"question": "How many times does print() execute in this loop?\n\nfor i in range(10):\n    if i % 2 == 0:\n        continue\n    print(i)", "options": ["10", "5", "4", "9"], "correct_index": 1, "explanation": "range(10) gives 0 through 9. When i is even (0, 2, 4, 6, 8), continue skips the print. When i is odd (1, 3, 5, 7, 9), print executes. That is 5 times total."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Loops Quiz'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Loops',
$py$Write a program that:
1. Asks the user for a positive integer N
2. Prints all numbers from 1 to N
3. For multiples of 3, print "Fizz" instead
4. For multiples of 5, print "Buzz" instead
5. For multiples of both 3 and 5, print "FizzBuzz"

**Example (N=15):**
```
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
```$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- `for` loops iterate over sequences (range, list, string, dict)
- `while` loops continue until a condition becomes False
- `range(start, stop, step)` generates number sequences
- `break` exits a loop early; `continue` skips to the next iteration
- `else` on a loop runs only if no `break` occurred
- `enumerate()` gives you both index and value when iterating$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-loops';

-- ═══════════════ LESSON 7: py-lists-tuples ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Lists & Tuples',
$py$Lists and tuples are ordered collections — sequences of items you can iterate over, index, and slice. Lists are mutable (changeable), tuples are immutable (fixed).$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Lists vs Tuples',
$py$**Lists** `[1, 2, 3]` — mutable, can be changed
```python
fruits = ["apple", "banana", "cherry"]
fruits.append("date")     # ["apple", "banana", "cherry", "date"]
fruits.insert(0, "apricot") # insert at position 0
fruits.remove("banana")   # remove by value
popped = fruits.pop()     # remove and return last item
fruits.sort()             # sort in place
fruits.reverse()          # reverse in place
print(len(fruits))        # number of items
print(fruits[0])          # first item
print(fruits[-1])         # last item
```

**Tuples** `(1, 2, 3)` — immutable, cannot be changed
```python
point = (3, 4)
x, y = point  # unpacking
print(x)  # 3
print(y)  # 4

# Tuples are often used for fixed data
rgb = (255, 128, 0)  # (red, green, blue)
print(rgb[1])  # 128
```

**When to use each:**
- Use lists when the data can change (adding/removing items)
- Use tuples for fixed data (coordinates, RGB values, function return values)
- Tuples are faster and use less memory
- Tuples can be used as dictionary keys; lists cannot$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'List Operations',
$py$```python
# Slicing works just like strings
nums = [0, 1, 2, 3, 4, 5]
print(nums[1:4])   # [1, 2, 3]
print(nums[::2])   # [0, 2, 4]
print(nums[::-1])  # [5, 4, 3, 2, 1, 0]

# List concatenation and repetition
print([1, 2] + [3, 4])  # [1, 2, 3, 4]
print([0] * 5)          # [0, 0, 0, 0, 0]

# Checking membership
print(3 in [1, 2, 3])    # True
print(5 not in [1, 2])   # True

# Nested lists (matrices)
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
print(matrix[1][2])  # 6 (row 1, col 2)

# List comprehensions (preview — more later!)
squares = [x**2 for x in range(10)]
print(squares)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

evens = [x for x in range(20) if x % 2 == 0]
print(evens)  # [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'common_mistakes', 'List Pitfalls',
$py$**1. Modifying a list while iterating**
```python
# WRONG — skips items!
numbers = [1, 2, 3, 4, 5]
for n in numbers:
    if n % 2 == 0:
        numbers.remove(n)
print(numbers)  # [1, 3, 5]??? Actually [1, 3, 4, 5]

# RIGHT — iterate over a copy
for n in numbers[:]:
    if n % 2 == 0:
        numbers.remove(n)
```

**2. List aliasing**
```python
a = [1, 2, 3]
b = a       # b is a reference to the SAME list
b.append(4)
print(a)    # [1, 2, 3, 4] — a changed too!

# Use copy to avoid this
b = a.copy()   # or b = a[:]
b.append(5)
print(a)    # [1, 2, 3, 4] — unchanged
```

**3. Confusing append and extend**
```python
items = [1, 2]
items.append([3, 4])  # [1, 2, [3, 4]] — nested list!
items.extend([5, 6])  # [1, 2, [3, 4], 5, 6] — adds each element
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Lists Quiz',
$py$$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples';

UPDATE lesson_sections SET metadata = '{"question": "What is the result of [1, 2, 3, 4, 5][-2:]?", "options": ["[4, 5]", "[3, 4]", "[3, 4, 5]", "[4]"], "correct_index": 0, "explanation": "Negative indices count from the end. -2 is the second-to-last element (4), and [:-2:] goes from there to the end, giving [4, 5]."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Lists Quiz'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: List Operations',
$py$Write a program that:
1. Creates a list of 5 numbers (ask the user for each)
2. Prints the list, the sum, the average, the largest, and the smallest
3. Creates a new list with only the even numbers
4. Reverses the list and prints it

**Bonus:** Ask the user for a number and tell them if it is in the list.$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- Lists are mutable ordered collections; tuples are immutable
- Indexing and slicing works the same as with strings
- Common list methods: append, extend, insert, remove, pop, sort, reverse
- Use `.copy()` or `[:]` to create independent copies of a list
- Tuples are great for fixed data and can be dictionary keys
- List comprehensions provide a concise way to create lists$py$, 7
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-control-flow' AND l.slug = 'py-lists-tuples';

-- ═══════════════ LESSON 8: py-functions ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Functions: Reusable Code',
$py$Functions let you bundle code into named, reusable blocks. They are the foundation of organised, maintainable Python programs.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Def & Return',
$py$```python
def greet(name):
    """Return a friendly greeting."""  # docstring
    return f"Hello, {name}!"

message = greet("Alice")
print(message)  # Hello, Alice!
```

**Anatomy of a function:**
- `def` — keyword that starts the definition
- `greet` — function name (snake_case)
- `(name)` — parameters (inputs)
- `"""docstring"""` — optional documentation string
- `return` — sends a value back to the caller (optional)

**Parameters and arguments:**
```python
# Default parameters
def power(base, exponent=2):
    return base ** exponent

print(power(5))      # 25 (exponent defaults to 2)
print(power(5, 3))   # 125

# Keyword arguments (order doesn't matter)
def introduce(name, age, city):
    print(f"{name} is {age} years old from {city}")

introduce(city="Paris", age=30, name="Bob")

# *args — variable number of positional arguments
def sum_all(*nums):
    return sum(nums)

print(sum_all(1, 2, 3, 4, 5))  # 15

# **kwargs — variable number of keyword arguments
def print_info(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=25, job="Engineer")
```$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Function Examples',
$py$```python
# Example 1: Multiple return values (as tuple)
def min_max(items):
    return min(items), max(items)

low, high = min_max([3, 1, 7, 2, 9])
print(f"Low: {low}, High: {high}")

# Example 2: Recursive function
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))  # 120

# Example 3: Function as argument
def apply_twice(func, value):
    return func(func(value))

def add_one(x):
    return x + 1

print(apply_twice(add_one, 5))  # 7

# Example 4: Type hints (Python 3.5+)
def calculate_bmi(weight_kg: float, height_m: float) -> float:
    """Calculate BMI from weight (kg) and height (m)."""
    return weight_kg / (height_m ** 2)

print(calculate_bmi(70, 1.75))  # 22.86...
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Functions Quiz',
$py$$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions';

UPDATE lesson_sections SET metadata = '{"question": "What does this code print?\n\ndef mystery(x, y=2, z=3):\n    return (x + y) * z\n\nprint(mystery(5))", "options": ["21", "25", "13", "Error"], "correct_index": 0, "explanation": "x=5, y defaults to 2, z defaults to 3. (5 + 2) * 3 = 7 * 3 = 21."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Functions Quiz'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Functions',
$py$Write functions to solve these problems. Test each one by calling it with sample arguments.

1. **is_palindrome(text)** — returns True if the string is the same forwards and backwards
2. **count_vowels(text)** — returns the number of vowels (a, e, i, o, u) in a string
3. **fibonacci(n)** — returns the nth Fibonacci number (F(0)=0, F(1)=1)
4. **filter_long_words(words, max_len)** — returns a list of words shorter than max_len

**Example output:**
```python
print(is_palindrome("racecar"))  # True
print(count_vowels("hello"))     # 2
print(fibonacci(10))             # 55
print(filter_long_words(["hi", "hello", "a", "world"], 4))  # ["hi", "a"]
```$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- Functions are defined with `def` and named in snake_case
- Use `return` to send a value back; functions without return return None
- Parameters can have default values: `def func(x, y=10)`
- `*args` captures extra positional args; `**kwargs` captures extra keyword args
- Docstrings document what a function does
- Type hints improve readability and enable static checking
- Functions are first-class objects — they can be passed as arguments$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-functions';

-- ═══════════════ LESSON 9: py-dicts-sets ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Dictionaries & Sets',
$py$Dictionaries map keys to values — think of them as labelled storage boxes. Sets store unique unordered items. Together, they handle most structured data needs.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-dicts-sets';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Dict & Set Basics',
$py$**Dictionaries** `{key: value}`
```python
# Creating dicts
student = {
    "name": "Alice",
    "age": 20,
    "courses": ["Math", "CS"]
}

# Accessing and modifying
print(student["name"])      # Alice
print(student.get("grade", "N/A"))  # N/A (safe access with default)
student["age"] = 21        # update
student["grade"] = "A"     # add new key

# Dict methods
print(student.keys())    # dict_keys(['name', 'age', ...])
print(student.values())  # dict_values(['Alice', 21, ...])
print(student.items())   # dict_items([('name', 'Alice'), ...])

# Iterating
for key, value in student.items():
    print(f"{key}: {value}")

# Check if key exists
if "name" in student:
    print("Name present")

# Merge dicts (Python 3.9+)
merged = {**dict1, **dict2}
merged = dict1 | dict2
```

**Sets** `{1, 2, 3}` — unique, unordered
```python
fruits = {"apple", "banana", "cherry"}
fruits.add("date")
fruits.remove("banana")

# Set operations
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(a | b)  # union: {1, 2, 3, 4, 5, 6}
print(a & b)  # intersection: {3, 4}
print(a - b)  # difference: {1, 2}
print(a ^ b)  # symmetric diff: {1, 2, 5, 6}

# Fast membership testing (O(1))
print(3 in a)  # True
```$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-dicts-sets';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'best_practices', 'Dict & Set Tips',
$py$- **Use .get() for safe access** — `value = my_dict.get(key, default)` avoids KeyError
- **Use `in` to check keys** — much faster than catching KeyError
- **Sets are ideal for deduplication** — `unique = set(my_list)`
- **Dict keys must be immutable** — strings, numbers, tuples (not lists)
- **Default dict** — `from collections import defaultdict` for auto-initialising values
- **Ordered dicts** — since Python 3.7, regular dicts maintain insertion order (officially guaranteed)$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-dicts-sets';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Word Counter',
$py$Write a program that:
1. Asks the user for a sentence
2. Counts how many times each word appears (case-insensitive)
3. Prints each word and its count, sorted alphabetically
4. Prints the most common word and how many times it appears

**Bonus:** Use a set to find all unique words. Use a dict to store counts.

**Example:**
```
Enter a sentence: the cat and the dog and the bird
Word counts:
  and: 2
  bird: 1
  cat: 1
  dog: 1
  the: 3
Most common: 'the' (3 times)
```$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-dicts-sets';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- Dicts store key-value pairs; keys must be immutable
- Use `dict[key]` to access, `dict[key] = value` to assign
- `.get(key, default)` provides safe access
- `.keys()`, `.values()`, `.items()` provide views into dict data
- Sets store unique elements with O(1) membership testing
- Set operations: union (|), intersection (&), difference (-)$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-dicts-sets';

-- ═══════════════ LESSON 10: py-comprehensions ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Comprehensions & Lambda',
$py$Python provides elegant, concise ways to create collections and write small anonymous functions. Comprehensions and lambdas are hallmarks of Pythonic code.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-comprehensions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Comprehension Syntax',
$py$**List comprehensions:**
```python
# Basic: [expression for item in iterable]
squares = [x**2 for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# With condition: [expression for item in iterable if condition]
evens = [x for x in range(20) if x % 2 == 0]
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# With transformation and condition
negatives_squared = [x**2 for x in range(-5, 6) if x < 0]
# [25, 16, 9, 4, 1]

# Nested comprehension (flatten matrix)
matrix = [[1, 2], [3, 4], [5, 6]]
flat = [num for row in matrix for num in row]
# [1, 2, 3, 4, 5, 6]
```

**Dict comprehensions:**
```python
squares_dict = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

word_lengths = {word: len(word) for word in ["hello", "world", "python"]}
# {'hello': 5, 'world': 5, 'python': 6}
```

**Set comprehensions:**
```python
unique_lengths = {len(word) for word in ["hi", "hello", "a", "world"]}
# {1, 2, 5}
```

**Generator expressions** (memory-efficient, lazy):
```python
total = sum(x**2 for x in range(1000000))  # no intermediate list!
```$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-comprehensions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Lambda & Functional Tools',
$py$**Lambda functions:** small anonymous functions
```python
# Syntax: lambda args: expression
square = lambda x: x**2
print(square(5))  # 25

# Often used with map, filter, sorted
numbers = [1, 4, 2, 8, 5, 3]

# map — apply function to every item
doubled = list(map(lambda x: x * 2, numbers))
# [2, 8, 4, 16, 10, 6]

# filter — keep items where condition is True
big = list(filter(lambda x: x > 4, numbers))
# [8, 5]

# sorted with custom key
words = ["banana", "apple", "cherry", "date"]
sorted_by_len = sorted(words, key=lambda w: len(w))
# ['date', 'apple', 'banana', 'cherry']

# sorted by last character
sorted_by_last = sorted(words, key=lambda w: w[-1])
# ['banana', 'apple', 'date', 'cherry']
```

<div class="tip">Prefer comprehensions over map/filter/lambda when possible — they are usually more readable. Use lambda when you need an inline function for something like sorted() or max().</div>$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-comprehensions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Comprehensions Quiz',
$py$$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-comprehensions';

UPDATE lesson_sections SET metadata = '{"question": "What does [x for x in range(10) if x % 3 == 0] produce?", "options": ["[0, 3, 6, 9]", "[3, 6, 9]", "[1, 4, 7, 10]", "[0, 3, 6, 9, 12]"], "correct_index": 0, "explanation": "range(10) gives 0-9. The condition x % 3 == 0 keeps numbers divisible by 3: 0, 3, 6, 9."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Comprehensions Quiz'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-comprehensions');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Comprehensions',
$py$Use comprehensions to solve each problem in ONE line each:

1. Create a list of the first 10 cubes (1, 8, 27, ...)
2. From a list of numbers, create a list of only the positive numbers
3. Create a dict mapping each word to its length for a given sentence
4. Create a set of all unique characters in a string
5. Use a generator expression to sum the squares of 1 to 100_000

**Starter code:**
```python
numbers = [5, -3, 12, -7, 0, 8, -1, 4]
text = "hello world"
sentence = "Python comprehensions are powerful"

# Your solutions here
```$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-comprehensions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- Comprehensions provide a concise way to create lists, dicts, and sets
- Format: `[expression for item in iterable if condition]`
- Generator expressions use `(...)` instead of `[...]` — lazy evaluation
- Lambda creates anonymous functions: `lambda args: expression`
- Use comprehensions over map/filter for readability
- Use sorted() with key for custom sorting$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-functions-dicts' AND l.slug = 'py-comprehensions';

-- ═══════════════ LESSON 11: py-file-io ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Working with Files',
$py$Real programs need to read and write files. Python makes file I/O simple and safe with the `open()` function and the `with` statement.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-file-io';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Reading & Writing Files',
$py$```python
# Writing to a file
with open("output.txt", "w") as f:
    f.write("Hello, World!\n")
    f.write("Second line\n")
    f.writelines(["Line 3\n", "Line 4\n"])
# File auto-closes after with block

# Reading a file
with open("output.txt", "r") as f:
    content = f.read()        # entire file as string
    lines = f.readlines()     # list of lines

# Reading line by line (memory efficient for large files)
with open("large_file.txt", "r") as f:
    for line in f:
        print(line.strip())  # strip removes \n
```

**File modes:**
| Mode | Description |
|------|------------|
| `"r"` | Read (default) |
| `"w"` | Write (overwrites existing file) |
| `"a"` | Append (adds to end of file) |
| `"x"` | Exclusive creation (fails if file exists) |
| `"r+"` | Read and write |
| `"b"` | Binary mode (add to other modes, e.g. `"rb"`) |

**Working with JSON:**
```python
import json

# Write
person = {
    "name": "Alice",
    "age": 30,
    "skills": ["Python", "Data"]
}
with open("person.json", "w") as f:
    json.dump(person, f, indent=2)

# Read
with open("person.json", "r") as f:
    data = json.load(f)
    print(data["name"])  # Alice
```$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-file-io';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'best_practices', 'File I/O Tips',
$py$- **Always use `with`** — it guarantees the file is closed, even if an exception occurs
- **Use `for line in f`** for large files instead of `.read()` or `.readlines()`
- **Specify encoding** with `open(..., encoding="utf-8")` to avoid platform-dependent behaviour
- **Use pathlib** for modern path handling: `from pathlib import Path`, then `Path("data/file.txt").read_text()`
- **Check if file exists** with `os.path.exists("file.txt")` or `Path("file.txt").exists()`$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-file-io';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: File Operations',
$py$Write a program that:
1. Creates a file called "notes.txt"
2. Writes 3 lines of text to it
3. Reads the file back and prints each line with a line number
4. Appends another line to the file
5. Reads the file again to confirm the new content
6. Writes the same data as a JSON file

**Bonus:** Ask the user for a filename and a word, then count how many times that word appears in the file.

<div class="info">Since we're in a browser environment, use Pyodide's virtual file system — it behaves exactly like real files.</div>$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-file-io';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- `open(filename, mode)` opens a file; always use `with` for auto-closing
- Modes: "r" read, "w" write, "a" append, "b" binary
- `json.dump()` writes JSON; `json.load()` reads JSON
- Use `for line in f` for memory-efficient reading
- pathlib provides a modern, object-oriented approach to file paths
- Always specify encoding="utf-8" for cross-platform compatibility$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-file-io';

-- ═══════════════ LESSON 12: py-error-handling ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Handling Errors Gracefully',
$py$Errors happen — files get deleted, users type "abc" when asked for a number, networks fail. Professional code anticipates and handles these situations gracefully.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Try / Except / Else / Finally',
$py$```python
try:
    # Code that might raise an exception
    num = int(input("Enter a number: "))
    result = 10 / num
    print(f"Result: {result}")
except ValueError:
    # Runs if ValueError is raised
    print("That was not a valid number!")
except ZeroDivisionError:
    # Runs if ZeroDivisionError is raised
    print("Cannot divide by zero!")
except Exception:
    # Catches any other exception (use sparingly)
    print("Something went wrong.")
else:
    # Runs ONLY if no exception occurred
    print("Everything worked perfectly!")
finally:
    # ALWAYS runs (cleanup code)
    print("This runs no matter what.")
```

**Common built-in exceptions:**
| Exception | Cause |
|-----------|-------|
| ValueError | Invalid value for a type |
| TypeError | Operation on incompatible type |
| IndexError | List index out of range |
| KeyError | Dict key not found |
| FileNotFoundError | File does not exist |
| ZeroDivisionError | Division by zero |
| AttributeError | Object has no such attribute |

**Raising exceptions:**
```python
def set_age(age):
    if age < 0:
        raise ValueError("Age cannot be negative!")
    if age > 150:
        raise ValueError(f"{age} is unrealistic")
    print(f"Age set to {age}")
```

**Custom exceptions:**
```python
class InsufficientFundsError(Exception):
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        super().__init__(f"Insufficient funds: ${balance} < ${amount}")

class BankAccount:
    def withdraw(self, amount):
        if amount > self.balance:
            raise InsufficientFundsError(self.balance, amount)
        self.balance -= amount
```$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'common_mistakes', 'Error Handling Pitfalls',
$py$**1. Bare except (too broad)**
```python
try:
    # risky code
except:  # catches ANYTHING, including KeyboardInterrupt!
    pass

# Better — catch specific exceptions
except ValueError:
    pass
```

**2. Swallowing exceptions silently**
```python
try:
    result = risky_operation()
except Exception:
    pass  # BAD! We'll never know it failed

# At least log or print
    print("Operation failed, continuing...")
```

**3. Not using finally for cleanup**
```python
f = open("file.txt")
try:
    # process file
except:
    pass
f.close()  # WON'T RUN if exception occurs above! Use finally
```$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Error Handling Quiz',
$py$$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling';

UPDATE lesson_sections SET metadata = '{"question": "What runs when you divide by zero in a try block with both except and finally?\n\ntry:\n    x = 10 / 0\nexcept ZeroDivisionError:\n    print(\"E\")\nfinally:\n    print(\"F\")", "options": ["E then F", "F only", "E only", "Neither (program crashes)"], "correct_index": 0, "explanation": "ZeroDivisionError is raised, caught by except which prints ''E''. The finally block always runs, so ''F'' prints next. Output: E then F."}'::jsonb
WHERE section_type = 'quiz' AND title = 'Error Handling Quiz'
AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling');

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercises', 'Practice: Error Handling',
$py$Write a program that:
1. Asks the user for a filename
2. Tries to read the file and print its contents
3. Handles FileNotFoundError with a friendly message
4. Handles PermissionError (no permission to read)
5. Handles IsADirectoryError (user gave a directory name)
6. Has a finally block that always prints "File operation attempted"

**Bonus:** Write a `safe_divide(a, b)` function that returns `None` if division is impossible, with the actual exception stored in a custom error object.$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
$py$- `try/except` catches and handles exceptions gracefully
- Catch specific exception types, not bare `except:`
- `else` runs only if no exception occurred
- `finally` always runs — use for cleanup (close files, release resources)
- `raise` manually triggers an exception
- Create custom exception classes by extending Exception
- Never swallow exceptions silently — at minimum log them$py$, 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-error-handling';

-- ═══════════════ LESSON 13: py-capstone ═══════════════

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Building a Contact Book',
$py$This capstone brings together everything you have learned: variables, conditionals, loops, lists, dicts, functions, file I/O, and error handling. You will build a working Contact Book application.$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-capstone';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Application Design',
$py$Your Contact Book will support these operations:

```
=== CONTACT BOOK ===
1. Add contact
2. Search contacts
3. View all contacts
4. Update contact
5. Delete contact
6. Save & Exit
====================
```

**Data structure:**
```python
# Each contact is a dict
{
    "name": "Alice Johnson",
    "phone": "555-1234",
    "email": "alice@example.com"
}

# All contacts stored in a list
contacts = []
```

**Functions to implement:**
| Function | Purpose |
|----------|---------|
| `load_contacts()` | Load from JSON file on startup |
| `save_contacts()` | Save to JSON file |
| `add_contact()` | Add new contact dict |
| `search_contacts()` | Search by name (case-insensitive) |
| `list_contacts()` | Display all contacts |
| `update_contact()` | Update a contact by name |
| `delete_contact()` | Remove a contact |
| `main()` | Main menu loop |$py$, 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-capstone';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Starter Code',
$py$```python
import json
import os

CONTACTS_FILE = "contacts.json"

def load_contacts():
    """Load contacts from JSON file."""
    if not os.path.exists(CONTACTS_FILE):
        return []
    with open(CONTACTS_FILE, "r") as f:
        return json.load(f)

def save_contacts(contacts):
    """Save contacts to JSON file."""
    with open(CONTACTS_FILE, "w") as f:
        json.dump(contacts, f, indent=2)
    print("Contacts saved!")

def add_contact(contacts):
    """Add a new contact."""
    print("\n--- Add New Contact ---")
    name = input("Name: ").strip()
    if not name:
        print("Name cannot be empty!")
        return
    phone = input("Phone: ").strip()
    email = input("Email: ").strip()
    contacts.append({"name": name, "phone": phone, "email": email})
    print(f"Contact '{name}' added!")
```

Continue building the remaining functions: search_contacts(), list_contacts(), update_contact(), delete_contact(), and main().$py$, 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-capstone';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'best_practices', 'Capstone Tips',
$py$- **Start simple** — implement one function at a time and test it
- **Use functions** — each operation should be its own function
- **Validate input** — check for empty names, duplicate contacts
- **Handle errors** — what if the JSON file is corrupted?
- **Use f-strings** for clean output formatting
- **Search case-insensitively** — use `.lower()` on both sides
- **Confirm destructive actions** — ask "Are you sure?" before deleting
- **Test edge cases** — empty contact book, not found, duplicate names$py$, 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-capstone';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'mini_project', 'Contact Book Project',
$py$Build and test the complete Contact Book application. Use the starter code provided and implement all functions.

**Requirements:**
1. Contacts persist between runs (saved to JSON)
2. Search finds partial matches (e.g. search "Ali" finds "Alice")
3. Update allows changing any field
4. Delete asks for confirmation
5. Graceful handling of corrupt or missing data
6. Clean, readable code with docstrings

**Stretch goals:**
- Add a "favourite" flag to contacts
- Sort contacts alphabetically
- Validate email format (must contain @)
- Add a "phone book" view showing only names and phone numbers$py$, 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-capstone';

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. PROJECTS
-- ═══════════════════════════════════════════════════════════════════════════

-- Project for capstone lesson
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'py-contacts-project', 'Contact Book Application',
'Build a fully functional contact book that stores, searches, and manages contacts. Data persists using JSON file I/O.',
$py$1. Implement all CRUD operations
2. Contacts persist between runs
3. Case-insensitive search
4. Handle missing/corrupt files
5. Clean menu-driven interface
6. Update allows partial field changes
7. Delete with confirmation$py$,
$py$import json
import os

CONTACTS_FILE = "contacts.json"

def load_contacts():
    if not os.path.exists(CONTACTS_FILE):
        return []
    try:
        with open(CONTACTS_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, PermissionError):
        print("Warning: Could not load contacts file. Starting fresh.")
        return []

def save_contacts(contacts):
    with open(CONTACTS_FILE, "w") as f:
        json.dump(contacts, f, indent=2)

def main():
    contacts = load_contacts()
    while True:
        print("\n=== CONTACT BOOK ===")
        print("1. Add contact")
        print("2. Search contacts")
        print("3. View all contacts")
        print("4. Update contact")
        print("5. Delete contact")
        print("6. Save & Exit")
        choice = input("\nChoice: ").strip()
        if choice == "1":
            # TODO: implement
            pass
        elif choice == "2":
            # TODO: implement
            pass
        elif choice == "3":
            # TODO: implement
            pass
        elif choice == "4":
            # TODO: implement
            pass
        elif choice == "5":
            # TODO: implement
            pass
        elif choice == "6":
            save_contacts(contacts)
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Try again.")

if __name__ == "__main__":
    main()$py$,
3, 150,
ARRAY['Implement search with name.lower() in query.lower()', 'Use enumerate() to show numbered list for update/delete', 'Use try/except around json.load() to handle corrupt data', 'Test with at least 3 sample contacts'],
1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'python-mastery' AND m.slug = 'py-mastery-real-world' AND l.slug = 'py-capstone'
ON CONFLICT (lesson_id, slug) DO NOTHING;

COMMIT;
