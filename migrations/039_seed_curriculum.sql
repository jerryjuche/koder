-- ============================================================================
-- Koder :: Curriculum CMS Seed Data
-- Courses → Modules → Lessons → Sections / Projects / Dependencies
-- ============================================================================
-- NOTE: Run 038_curriculum_cms.sql first. This seed depends on existing
-- problems from 019_seed_problems*.sql, 031-037 python/go seed files.
-- ============================================================================

BEGIN;

-- ── 1. COURSES ─────────────────────────────────────────────────────────────

INSERT INTO courses (slug, title, description, difficulty_level, estimated_hours, order_number, visible)
VALUES
('go-fundamentals',      'Go Fundamentals',              'Master Go syntax, control flow, functions, and packages. Perfect for beginners new to Go or programming.',                                2, 20, 1, false),
('python-basics',        'Python Basics',                'Learn Python from scratch: variables, data types, loops, functions, and standard library essentials.',                                   1, 18, 2, false),
('data-structures-go',   'Data Structures in Go',        'Deep dive into arrays, slices, maps, linked lists, stacks, queues, trees, and graphs — all in Go.',                                       3, 30, 3, false),
('python-intermediate',  'Python Intermediate',          'Functions, modules, file I/O, error handling, comprehensions, and working with popular standard library modules.',                         2, 22, 4, false),
('algorithms',           'Algorithms & Problem Solving', 'Sorting, searching, recursion, dynamic programming, and graph algorithms with practical exercises.',                                         4, 35, 5, false)
ON CONFLICT (slug) DO NOTHING;

-- ── 2. MODULES ─────────────────────────────────────────────────────────────

-- Go Fundamentals → 5 modules
INSERT INTO modules (course_id, slug, title, description, order_number, visible)
SELECT c.id, 'go-intro',          'Introduction to Go',          'Getting started with Go: installation, workspace setup, and your first program.',          1, false FROM courses c WHERE c.slug = 'go-fundamentals'
UNION ALL
SELECT c.id, 'go-variables-types','Variables, Types & Constants', 'Understanding Go''s type system: primitives, zero values, type inference, and constants.',   2, false FROM courses c WHERE c.slug = 'go-fundamentals'
UNION ALL
SELECT c.id, 'go-control-flow',   'Control Flow',                'Conditional statements, loops, switch, and defer — Go''s control structures in depth.',       3, false FROM courses c WHERE c.slug = 'go-fundamentals'
UNION ALL
SELECT c.id, 'go-functions',      'Functions & Methods',         'Declaring functions, variadic params, named returns, methods on types, and closures.',       4, false FROM courses c WHERE c.slug = 'go-fundamentals'
UNION ALL
SELECT c.id, 'go-packages',       'Packages & Modules',          'Organising code with packages, go modules, exporting symbols, and dependency management.',    5, false FROM courses c WHERE c.slug = 'go-fundamentals'
ON CONFLICT (course_id, slug) DO NOTHING;

-- Python Basics → 4 modules
INSERT INTO modules (course_id, slug, title, description, order_number, visible)
SELECT c.id, 'py-hello',          'Hello, Python!',              'Your first Python program: the REPL, running scripts, print, and basic input.',              1, false FROM courses c WHERE c.slug = 'python-basics'
UNION ALL
SELECT c.id, 'py-variables',      'Variables & Data Types',       'Python types: int, float, str, bool, None, type conversion, and dynamic typing.',            2, false FROM courses c WHERE c.slug = 'python-basics'
UNION ALL
SELECT c.id, 'py-control',        'Control Flow in Python',       'if/elif/else, for loops over ranges and iterables, while loops, break, continue, pass.',    3, false FROM courses c WHERE c.slug = 'python-basics'
UNION ALL
SELECT c.id, 'py-functions',      'Python Functions',             'Def functions, parameters, return values, scope, lambda, and built-in functions.',           4, false FROM courses c WHERE c.slug = 'python-basics'
ON CONFLICT (course_id, slug) DO NOTHING;

-- Data Structures in Go → 4 modules
INSERT INTO modules (course_id, slug, title, description, order_number, visible)
SELECT c.id, 'ds-arrays-slices',  'Arrays & Slices',             'Fixed-size arrays, dynamic slices, slice tricks, append, copy, and slicing operations.',     1, false FROM courses c WHERE c.slug = 'data-structures-go'
UNION ALL
SELECT c.id, 'ds-maps',           'Maps & Structs',              'Hash maps, struct composition, embedding, tags, and when to use each.',                      2, false FROM courses c WHERE c.slug = 'data-structures-go'
UNION ALL
SELECT c.id, 'ds-linked-lists',   'Linked Lists',                'Singly and doubly linked lists: traversal, insertion, deletion, reversal.',                 3, false FROM courses c WHERE c.slug = 'data-structures-go'
UNION ALL
SELECT c.id, 'ds-trees-graphs',   'Trees & Graphs',              'Binary trees, BST, graph representations, DFS, BFS, and traversal orders.',                 4, false FROM courses c WHERE c.slug = 'data-structures-go'
ON CONFLICT (course_id, slug) DO NOTHING;

-- Python Intermediate → 3 modules
INSERT INTO modules (course_id, slug, title, description, order_number, visible)
SELECT c.id, 'py-errors',         'Error Handling',              'try/except/else/finally, raising exceptions, custom exceptions, and context managers.',      1, false FROM courses c WHERE c.slug = 'python-intermediate'
UNION ALL
SELECT c.id, 'py-comprehensions', 'Comprehensions & Itertools',  'List/dict/set comprehensions, generator expressions, and the itertools module.',            2, false FROM courses c WHERE c.slug = 'python-intermediate'
UNION ALL
SELECT c.id, 'py-file-io',        'File I/O & Modules',          'Reading and writing files, the pathlib module, organising code into modules and packages.',  3, false FROM courses c WHERE c.slug = 'python-intermediate'
ON CONFLICT (course_id, slug) DO NOTHING;

-- Algorithms → 4 modules
INSERT INTO modules (course_id, slug, title, description, order_number, visible)
SELECT c.id, 'alg-sorting',       'Sorting',                     'Bubble, selection, insertion, merge, quick sort — implementations and complexity analysis.', 1, false FROM courses c WHERE c.slug = 'algorithms'
UNION ALL
SELECT c.id, 'alg-searching',     'Searching',                   'Linear search, binary search, interpolation search, and search in rotated arrays.',          2, false FROM courses c WHERE c.slug = 'algorithms'
UNION ALL
SELECT c.id, 'alg-dp',            'Dynamic Programming',         'Memoization, tabulation, knapsack, LCS, edit distance, and classic DP patterns.',            3, false FROM courses c WHERE c.slug = 'algorithms'
UNION ALL
SELECT c.id, 'alg-graphs',        'Graph Algorithms',            'Dijkstra, Bellman-Ford, Floyd-Warshall, topological sort, union-find, and MST (Kruskal/Prim).', 4, false FROM courses c WHERE c.slug = 'algorithms'
ON CONFLICT (course_id, slug) DO NOTHING;

-- ── 3. LESSONS ─────────────────────────────────────────────────────────────

-- ══════════ GO FUNDAMENTALS ══════════
-- Module: go-intro (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'hello-world',     'Hello, World!',                 'Write and run your first Go program. Understand package main, import, func main, and fmt.Println.',                                  1, 10, 30, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'go-playground',   'The Go Playground & Tooling',   'Explore go fmt, go build, go run, go test, and the online Go playground for quick experiments.',                                   1, 15, 40, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro'
ON CONFLICT (module_id, slug) DO NOTHING;

-- Module: go-variables-types (3 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'basic-types',     'Basic Types & Zero Values',     'Explore int, float64, string, bool, and their zero values. Learn about type inference with := and explicit declarations.',         1, 15, 40, 1, false, ARRAY['max-min', 'fizzbuzz']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'constants-iota',  'Constants & Iota',              'Declaring constants with const, using iota for enumerations, and typed vs untyped constants.',                                     2, 20, 50, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'type-conversion', 'Type Conversion & Coercion',    'Converting between numeric types, string to rune slices, strconv, and common pitfalls with mixed-type expressions.',               2, 25, 60, 3, false, ARRAY['sum-of-digits', 'reverse-integer']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types'
ON CONFLICT (module_id, slug) DO NOTHING;

-- Module: go-control-flow (3 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'if-switch',       'If, Else & Switch',             'Conditional logic: if/else if/else, switch statements with expressionless and type-switch forms.',                                 2, 20, 50, 1, false, ARRAY['even-squares', 'word-count']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'for-loops',       'For Loops & Range',             'Go''s single loop keyword: classic for, while-style, infinite, and ranging over slices, maps, strings, and channels.',            2, 25, 60, 2, false, ARRAY['sum-of-array', 'count-vowels']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'defer-panic',     'Defer, Panic & Recover',        'Deferred function calls, panic/recover mechanism, and practical patterns for cleanup and error recovery.',                         3, 30, 70, 3, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow'
ON CONFLICT (module_id, slug) DO NOTHING;

-- Module: go-functions (3 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'func-decl',       'Function Declarations',         'Syntax: parameters, return types, named returns, variadic functions, and passing functions as values.',                            2, 20, 50, 1, false, ARRAY['factorial', 'gcd-euclidean']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'methods',         'Methods & Receivers',           'Attaching methods to types, pointer vs value receivers, and when to use each. Method sets and interfaces.',                        3, 25, 60, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'closures-anon',   'Closures & Anonymous Functions','Capturing variables, closure gotchas, goroutine closures, and functional patterns like map/filter in Go.',                         3, 30, 70, 3, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions'
ON CONFLICT (module_id, slug) DO NOTHING;

-- Module: go-packages (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'creating-packages','Creating & Importing Packages', 'Organising code into packages, exporting vs unexported names, internal packages, and package naming conventions.',               2, 25, 50, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-packages'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'go-modules',      'Go Modules & Dependency Mgmt', 'Initialising modules with go mod init, adding dependencies, versioning, vendoring, and go mod tidy / go mod download.',           3, 30, 70, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-packages'
ON CONFLICT (module_id, slug) DO NOTHING;

-- ══════════ PYTHON BASICS ══════════
-- Module: py-hello (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-first-program', 'Your First Python Program',    'Write and run your first Python script. Understand the Python REPL, print(), and basic program structure.',                        1, 10, 30, 1, false, ARRAY['py-double-it']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-input-output', 'User Input & Output',           'Reading user input with input(), converting types, f-strings, and formatting output with f-strings and .format().',                1, 15, 40, 2, false, ARRAY['py-even-or-odd']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello'
ON CONFLICT (module_id, slug) DO NOTHING;

-- Module: py-variables (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-numbers-strings','Numbers & Strings',           'Working with int, float, str types. String operations, slicing, formatting, and common methods like .split(), .join(), .strip().', 1, 15, 40, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-lists-tuples', 'Lists & Tuples',                'Ordered collections: creating, indexing, slicing lists and tuples. List methods: append, extend, insert, remove, sort, reverse.',  1, 20, 50, 2, false, ARRAY['py-reverse-string', 'py-sum-list']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables'
ON CONFLICT (module_id, slug) DO NOTHING;

-- Module: py-control (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-conditionals', 'Conditionals & Boolean Logic',  'if/elif/else, boolean operators (and, or, not), truthiness, and conditional expressions (ternary) in Python.',                     1, 15, 40, 1, false, ARRAY['py-palindrome-check']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-loops',        'Loops & Iteration',             'for loops over ranges, lists, strings, and dicts. While loops, break, continue, else on loops, and the range() function.',        2, 20, 50, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control'
ON CONFLICT (module_id, slug) DO NOTHING;

-- Module: py-functions (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-def-functions', 'Defining Functions',           'def keyword, parameters, return values, default arguments, keyword arguments, *args and **kwargs, and docstrings.',               2, 20, 50, 1, false, ARRAY['py-factorial']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-functions'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-scope-lambda', 'Scope, Lambda & Built-ins',    'Variable scope (LEGB), global/nonlocal, lambda functions, map/filter/sorted, and common built-in functions.',                    2, 25, 60, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-functions'
ON CONFLICT (module_id, slug) DO NOTHING;

-- ══════════ PYTHON INTERMEDIATE ══════════
-- Module: py-errors (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-try-except',   'Try / Except / Finally',       'Handling exceptions with try/except/else/finally. Catching specific exception types, raising exceptions, and the assert statement.', 2, 20, 50, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-errors'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-custom-exceptions', 'Custom Exceptions & Context Managers', 'Creating custom exception classes, with statements, context manager protocol (__enter__/__exit__), and contextlib utilities.', 3, 30, 70, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-errors'
ON CONFLICT (module_id, slug) DO NOTHING;

-- Module: py-comprehensions (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-list-comprehensions', 'List/Dict/Set Comprehensions', 'List comprehensions, dict comprehensions, set comprehensions, nested comprehensions, and conditional comprehensions.',         2, 20, 50, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-generators',   'Generators & Itertools',        'Generator functions with yield, generator expressions, itertools: chain, cycle, permutations, combinations, groupby, product.',   3, 30, 70, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions'
ON CONFLICT (module_id, slug) DO NOTHING;

-- Module: py-file-io (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-file-reading', 'Reading & Writing Files',       'Opening files with open(), read/write/append modes, reading line by line, with statement for auto-close, and encoding handling.', 2, 25, 60, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'py-pathlib-json', 'Pathlib & JSON',               'Working with file paths using pathlib.Path, reading/writing JSON with the json module, and working with CSV files.',              2, 25, 60, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io'
ON CONFLICT (module_id, slug) DO NOTHING;

-- ══════════ DATA STRUCTURES IN GO ══════════
-- Module: ds-arrays-slices (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'ds-array-basics', 'Arrays & Slices Fundamentals', 'Fixed-size arrays, slice internals (ptr, len, cap), making slices, append, copy, and sub-slicing with shared backing arrays.',    2, 25, 50, 1, false, ARRAY['sum-of-array', 'find-max-in-array']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'ds-slice-tricks', 'Slice Tricks & Patterns',      'Common slice operations: filter, map, deduplicate, reverse, rotate, and variadic slice tricks for efficient algorithms.',         3, 30, 70, 2, false, ARRAY['remove-duplicates-sorted', 'rotate-array']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices'
ON CONFLICT (module_id, slug) DO NOTHING;

-- Module: ds-maps (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'ds-map-basics',   'Maps Fundamentals',            'Creating maps, reading/writing/deleting entries, comma-ok idiom, iterating over maps, and map vs slice performance trade-offs.',   2, 25, 50, 1, false, ARRAY['two-sum-indices', 'most-frequent-char']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-maps'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'ds-structs',      'Structs & Composition',        'Defining struct types, fields, tags for JSON/serialisation, embedding for composition, and constructor functions.',              3, 30, 60, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-maps'
ON CONFLICT (module_id, slug) DO NOTHING;


-- ── 4. LESSON SECTIONS ─────────────────────────────────────────────────────

-- ══════════ GO: hello-world (4 sections) ══════════
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview',    'What is Go?',                   E'Go is a statically typed, compiled programming language designed at Google by Robert Griesemer, Rob Pike, and Ken Thompson.\n\nIt combines the efficiency and safety of a statically typed language with the ease of programming of a dynamically typed interpreted language.\n\n**Key features:**\n- Fast compilation and execution\n- Built-in concurrency (goroutines, channels)\n- Garbage collected\n- Simple, readable syntax', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'hello-world';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Your First Program',           E'Every Go program starts with a package declaration. The `main` package is special — it defines the entry point of the program.\n\n```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n```\n\n**Breaking it down:**\n- `package main` — this program belongs to the main package\n- `import "fmt"` — brings in the formatted I/O package\n- `func main()` — the function that runs when the program starts\n- `fmt.Println(...)` — prints text followed by a newline', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'hello-world';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples',    'More Print Examples',           E'```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n    fmt.Print("No newline here ")\n    fmt.Printf("Formatted: %s is %d years old\\n", "Go", 15)\n    fmt.Println("Go", "is", "awesome!")\n}\n```\n\nTry changing the message and running the program again.', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'hello-world';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary',     'What You Learned',               E'In this lesson, you:\n- Learned what Go is and its key features\n- Wrote and ran your first Go program\n- Used `fmt.Println`, `fmt.Print`, and `fmt.Printf`\n- Understood the `package main` and `func main()` conventions\n- Saw how Go comments work with `//`', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'hello-world';

-- ══════════ GO: basic-types (4 sections) ══════════
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview',    'Types in Go',                   E'Go is statically typed — every variable has a known type at compile time.\n\n**Basic types:**\n- `bool` — true or false\n- `string` — text (UTF-8 encoded)\n- `int`, `int8`, `int16`, `int32`, `int64` — signed integers\n- `uint`, `uint8`, `uint16`, `uint32`, `uint64` — unsigned integers\n- `float32`, `float64` — floating-point numbers\n- `byte` — alias for uint8\n- `rune` — alias for int32 (Unicode code point)', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'basic-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Declaration & Zero Values',     E'**Ways to declare variables:**\n```go\nvar x int           // declaration, x = 0 (zero value)\nvar y int = 10      // declaration with initialiser\nvar z = 10           // type inference\nw := 10              // short declaration (inside functions only)\n```\n\n**Zero values:**\n| Type | Zero Value |\n|------|-----------|\n| int, float | 0 |\n| bool | false |\n| string | "" |\n| pointer, slice, map, chan, interface | nil |', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'basic-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples',    'Type Inference in Action',      E'```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    var name string = "Go"\n    version := 1.23  // float64 (inferred)\n    isFun := true    // bool (inferred)\n\n    fmt.Printf("%s version %.2f — Is it fun? %t\\n", name, version, isFun)\n\n    x, y := 10, "hello"\n    fmt.Println(x, y)\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'basic-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary',     'Key Takeaways',                 E'- Go is statically typed — types are checked at compile time\n- Every variable has a zero value — no undefined state\n- Use `var` for declarations, `:=` for short declarations inside functions\n- `byte` = `uint8`, `rune` = `int32`', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'basic-types';

-- ══════════ GO: if-switch (quiz section) ══════════
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview',    'Conditional Logic',             E'Go provides the familiar `if`/`else` and `switch` statements with some unique features like the init statement and expressionless switch.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'if-switch';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz',         'Test Your Knowledge',          E'', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'if-switch';

UPDATE lesson_sections SET metadata = '{
    "question": "What does this Go code print?\n\nx := 5\nif x > 10 {\n    fmt.Println(\"big\")\n} else if x > 3 {\n    fmt.Println(\"medium\")\n} else {\n    fmt.Println(\"small\")\n}",
    "options": ["big", "medium", "small", "compilation error"],
    "correct_index": 1,
    "explanation": "x is 5, which is not > 10, so the first branch is skipped. x is > 3, so the else if branch executes and prints \"medium\"."
}'::jsonb
WHERE section_type = 'quiz' AND title = 'Test Your Knowledge';

-- ══════════ PYTHON: py-first-program (3 sections) ══════════
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview',    'What is Python?',               E'Python is a high-level, interpreted programming language known for its readability and simplicity.\n\n**Key features:**\n- Readable, expressive syntax\n- Dynamically typed — no type declarations needed\n- Interpreted (no compile step)\n- Extensive standard library ("batteries included")\n- Great for beginners and experts alike', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-first-program';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Your First Python Script',     E'Open a Python REPL by typing `python3` in your terminal, or create a file called `hello.py`.\n\n```python\n# hello.py\nprint("Hello, World!")\n\nname = input("What is your name? ")\nprint(f"Nice to meet you, {name}!")\n```\n\nRun it: `python3 hello.py`\n\n**Breaking it down:**\n- `print()` — outputs text to the console\n- `input()` — reads a line of text from the user\n- `f"..."` — f-string for embedding variables in text\n- `#` — single-line comment', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-first-program';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary',     'Key Takeaways',                 E'- Python is interpreted, dynamically typed, and beginner-friendly\n- Use `print()` to output, `input()` to read input\n- f-strings (f"...{variable}...") are the modern way to format strings\n- Run Python files with `python3 filename.py`\n- The REPL is great for quick experiments', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-first-program';

-- ══════════ PYTHON: py-numbers-strings (3 sections) ══════════
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview',    'Numbers & Strings in Python',   E'Python has three main numeric types: `int`, `float`, and `complex`. Strings are immutable sequences of Unicode characters.\n\n**Numeric operations:** `+`, `-`, `*`, `/`, `//` (floor division), `%` (modulo), `**` (power)', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-numbers-strings';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'String Operations',             E'```python\n# String basics\ntext = "Hello, Python!"\nprint(len(text))          # 14\nprint(text.upper())       # HELLO, PYTHON!\nprint(text.lower())       # hello, python!\nprint(text.split(","))    # ["Hello", " Python!"]\n\n# Slicing\nprint(text[0:5])          # Hello\nprint(text[7:])           # Python!\nprint(text[::-1])         # !nohtyP ,olleH (reversed)\n\n# f-strings\nname = "Alice"\nage = 25\nprint(f"{name} is {age} years old")  # Alice is 25 years old\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-numbers-strings';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary',     'Key Takeaways',                 E'- Python has dynamic typing — variables don''t declare their type\n- Strings support many built-in methods: `.upper()`, `.split()`, `.strip()`, etc.\n- Slicing syntax: `string[start:stop:step]`\n- f-strings are the preferred string formatting method\n- `len()` returns the length of a sequence', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-numbers-strings';

-- ══════════ PYTHON: py-conditionals (3 sections) ══════════
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview',    'Conditional Logic',             E'Python uses `if`, `elif`, and `else` for conditional branching. Indentation defines blocks — no curly braces needed.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-conditionals';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'If/Elif/Else',                  E'```python\nscore = 85\n\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelif score >= 70:\n    grade = "C"\nelse:\n    grade = "F"\n\nprint(f"Grade: {grade}")\n\n# Boolean operators\nage = 20\nhas_license = True\n\nif age >= 18 and has_license:\n    print("You can drive")\n\n# Ternary (conditional expression)\nstatus = "adult" if age >= 18 else "minor"\n```\n\n**Truthiness:** In Python, these are falsy: `False`, `None`, `0`, `""`, `[]`, `{}`, `()`. Everything else is truthy.', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-conditionals';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz',         'Quick Check',                   E'', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-conditionals';

UPDATE lesson_sections SET metadata = '{
    "question": "What does this Python code print?\n\nx = 7\nif x % 2 == 0:\n    print(\"even\")\nelse:\n    print(\"odd\")",
    "options": ["even", "odd", "Error", "nothing"],
    "correct_index": 1,
    "explanation": "7 %% 2 is 1, which is not equal to 0, so the else branch executes and prints \"odd\"."
}'::jsonb
WHERE section_type = 'quiz' AND title = 'Quick Check';

-- ══════════ PYTHON: py-def-functions (3 sections) ══════════
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview',    'Functions in Python',           E'Functions let you encapsulate reusable logic. Use the `def` keyword to define a function.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-functions' AND l.slug = 'py-def-functions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples',    'Function Examples',             E'```python\n# Basic function\ndef greet(name):\n    """Return a greeting message."""\n    return f"Hello, {name}!"\n\nprint(greet("Alice"))  # Hello, Alice!\n\n# Default arguments\ndef power(base, exp=2):\n    return base ** exp\n\nprint(power(3))     # 9 (3^2)\nprint(power(3, 3))  # 27 (3^3)\n\n# *args and **kwargs\ndef summarize(*args, **kwargs):\n    print(f"Positional: {args}")\n    print(f"Keyword: {kwargs}")\n\nsummarize(1, 2, 3, name="Alice", age=25)\n```\n\nFunctions are first-class objects — they can be passed around, stored in variables, and returned from other functions.', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-functions' AND l.slug = 'py-def-functions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary',     'Key Takeaways',                 E'- Define functions with `def name(params):`\n- Use `return` to send a value back to the caller\n- Default parameter values: `def f(x=10):`\n- `*args` captures extra positional args as a tuple\n- `**kwargs` captures extra keyword args as a dict\n- Docstrings (triple-quoted string after def) document your function', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-functions' AND l.slug = 'py-def-functions';

-- ══════════ PYTHON INTERMEDIATE: py-file-reading (3 sections) ══════════
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview',    'File I/O in Python',            E'Python makes file I/O easy with the built-in `open()` function and the `with` statement for automatic resource management.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io' AND l.slug = 'py-file-reading';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples',    'Reading & Writing',             E'```python\n# Writing to a file\nwith open("notes.txt", "w") as f:\n    f.write("Hello, file!\\n")\n    f.write("Second line\\n")\n\n# Reading the entire file\nwith open("notes.txt", "r") as f:\n    content = f.read()\n    print(content)\n\n# Reading line by line\nwith open("notes.txt", "r") as f:\n    for line in f:\n        print(line.strip())\n\n# Appending\nwith open("notes.txt", "a") as f:\n    f.write("Third line\\n")\n\n# Binary mode\nwith open("image.jpg", "rb") as f:\n    data = f.read()\n```\n\nThe `with` statement automatically closes the file, even if an exception occurs.', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io' AND l.slug = 'py-file-reading';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary',     'Key Takeaways',                 E'- Use `open(filename, mode)` to open files\n- Modes: "r" (read), "w" (write/overwrite), "a" (append), "rb" (read binary)\n- Always use `with open(...) as f:` for auto-closing\n- Read all: `f.read()`, read lines: `f.readlines()`, iterate: `for line in f:`\n- Write: `f.write(string)`, `f.writelines(list)`', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io' AND l.slug = 'py-file-reading';

-- ══════════ DATA STRUCTURES: ds-array-basics (3 sections) ══════════
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview',    'Arrays vs Slices',              E'Go has two array-like types: fixed-size **arrays** and dynamic **slices**. Slices are far more common in practice — they are Go''s equivalent of dynamic arrays.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices' AND l.slug = 'ds-array-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Slice Internals',               E'```go\n// Array: fixed size\nvar arr [5]int = [5]int{1, 2, 3, 4, 5}\n\n// Slice: dynamic\nvar s []int = []int{1, 2, 3}\ns = append(s, 4, 5)\n\n// Slice internals: ptr, len, cap\ns2 := make([]int, 3, 10)  // len=3, cap=10\nfmt.Println(len(s2), cap(s2))  // 3 10\n\n// Sub-slicing (shares backing array)\noriginal := []int{1, 2, 3, 4, 5}\nsub := original[1:4]\nsub[0] = 99\nfmt.Println(original[1])  // 99 (shared!)\n\n// Copy to avoid aliasing\ncopied := make([]int, len(original))\ncopy(copied, original)\n```\n\nUnderstanding slice headers (ptr, len, cap) is crucial for writing efficient Go.', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices' AND l.slug = 'ds-array-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary',     'Key Takeaways',                 E'- Arrays have fixed length; slices are dynamic\n- Use `make([]T, len, cap)` to create slices with capacity\n- `append()` grows the slice, doubling capacity each time\n- Sub-slices share the backing array — use `copy()` to detach\n- `len()` and `cap()` give length and capacity', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices' AND l.slug = 'ds-array-basics';

-- ── 5. PROJECTS ────────────────────────────────────────────────────────────

-- ══════════ GO: hello-world projects (2) ══════════
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'hello-cli', 'Interactive Greeting CLI',
       'Build a command-line program that asks for the user''s name and age, then prints a personalised greeting.',
       '1. Use fmt.Print to prompt for input\n2. Use fmt.Scan to read user input\n3. Store the name in a string variable and age in an int variable\n4. Print: "Hello, [name]! You are [age] years old."\n5. Format the output cleanly using fmt.Printf',
       'package main\n\nimport "fmt"\n\nfunc main() {\n    // Your code here\n}',
       1, 100, ARRAY['Use fmt.Print for prompts, not fmt.Println', 'Remember &: fmt.Scan(&variable)', 'Use fmt.Printf with %s for strings and %d for integers'], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'hello-world'
ON CONFLICT (lesson_id, slug) DO NOTHING;

INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'temp-converter', 'Temperature Converter',
       'Write a program that converts Celsius to Fahrenheit and vice versa based on user input.',
       '1. Prompt the user to choose conversion direction (C→F or F→C)\n2. Read the temperature value\n3. Apply the conversion formula\n4. Print the result with one decimal place\n5. Handle invalid input gracefully',
       'package main\n\nimport "fmt"\n\nfunc main() {\n    // Your code here\n}',
       2, 150, ARRAY['C→F: (c * 9/5) + 32', 'F→C: (f - 32) * 5/9', 'Use %.1f to format to one decimal place'], 2, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'hello-world'
ON CONFLICT (lesson_id, slug) DO NOTHING;

-- ══════════ PYTHON: py-first-program projects (1) ══════════
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'py-greeting', 'Personalised Greeting',
       'Write a Python script that asks for the user''s name and favourite colour, then prints a personalised message.',
       '1. Use input() to ask for name and favourite colour\n2. Store the answers in variables\n3. Print a message: "[name]''s favourite colour is [colour]!"\n4. Use an f-string for formatting',
       '# Your code here\nname = input("What is your name? ")\n', 1, 80, ARRAY['Use input(prompt) to read user input', 'Use f-strings: f"Hello, {name}!"', 'Variables in Python don''t need type declarations'], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-first-program'
ON CONFLICT (lesson_id, slug) DO NOTHING;

-- ══════════ PYTHON: py-numbers-strings projects (1) ══════════
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'py-word-counter', 'Word Counter',
       'Write a function that takes a sentence and returns a dictionary with word counts.',
       '1. Define a function count_words(sentence: str) -> dict\n2. Split the sentence into words using .split()\n3. Count each word using a dictionary\n4. Return the dictionary\n5. Handle empty strings and punctuation',
       'def count_words(sentence: str) -> dict:\n    # Your code here\n    pass', 2, 120, ARRAY['Use .split() to split the sentence into words', 'Use .strip(".,!?") to remove punctuation from each word', 'Use a dict or collections.Counter for counting'], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-numbers-strings'
ON CONFLICT (lesson_id, slug) DO NOTHING;

-- ══════════ PYTHON INTERMEDIATE: py-file-reading projects (1) ══════════
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'py-note-app', 'Note-Taking App',
       'Build a simple command-line note-taking app that can create, list, and delete notes stored in a file.',
       '1. Show a menu: (1) New note (2) List notes (3) Delete note (4) Exit\n2. Store notes as one-per-line in a text file\n3. Each note has a timestamp\n4. Handle file not existing gracefully\n5. Delete by line number',
       'import os\nNOTES_FILE = "notes.txt"\n\ndef show_menu():\n    print("\\n=== Notes App ===")\n    print("1. New note")\n    print("2. List notes")\n    print("3. Delete note")\n    print("4. Exit")\n', 3, 200, ARRAY['Use "a" mode for appending notes', 'Use "r" mode for reading all lines', 'Use os.path.exists() to check if the file exists'], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io' AND l.slug = 'py-file-reading'
ON CONFLICT (lesson_id, slug) DO NOTHING;

-- ── 6. LESSON DEPENDENCIES ────────────────────────────────────────────────
-- NOTE: CROSS JOIN to avoid PostgreSQL's comma-before-JOIN precedence issue.

-- ══════════ GO DEPENDENCIES ══════════
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'go-fundamentals' AND c2.slug = 'go-fundamentals'
  AND m1.slug = 'go-variables-types' AND m2.slug = 'go-variables-types'
  AND l1.slug = 'constants-iota' AND l2.slug = 'basic-types'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'go-fundamentals' AND c2.slug = 'go-fundamentals'
  AND m1.slug = 'go-variables-types' AND m2.slug = 'go-variables-types'
  AND l1.slug = 'type-conversion' AND l2.slug = 'basic-types'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'go-fundamentals' AND c2.slug = 'go-fundamentals'
  AND m1.slug = 'go-control-flow' AND m2.slug = 'go-control-flow'
  AND l1.slug = 'for-loops' AND l2.slug = 'if-switch'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'go-fundamentals' AND c2.slug = 'go-fundamentals'
  AND m1.slug = 'go-functions' AND m2.slug = 'go-functions'
  AND l1.slug = 'methods' AND l2.slug = 'func-decl'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'go-fundamentals' AND c2.slug = 'go-fundamentals'
  AND m1.slug = 'go-functions' AND m2.slug = 'go-functions'
  AND l1.slug = 'closures-anon' AND l2.slug = 'methods'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'go-fundamentals' AND c2.slug = 'go-fundamentals'
  AND m1.slug = 'go-intro' AND m2.slug = 'go-intro'
  AND l1.slug = 'go-playground' AND l2.slug = 'hello-world'
ON CONFLICT DO NOTHING;

-- ══════════ PYTHON BASICS DEPENDENCIES ══════════
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'python-basics' AND c2.slug = 'python-basics'
  AND m1.slug = 'py-hello' AND m2.slug = 'py-hello'
  AND l1.slug = 'py-input-output' AND l2.slug = 'py-first-program'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'python-basics' AND c2.slug = 'python-basics'
  AND m1.slug = 'py-variables' AND m2.slug = 'py-variables'
  AND l1.slug = 'py-lists-tuples' AND l2.slug = 'py-numbers-strings'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'python-basics' AND c2.slug = 'python-basics'
  AND m1.slug = 'py-control' AND m2.slug = 'py-control'
  AND l1.slug = 'py-loops' AND l2.slug = 'py-conditionals'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'python-basics' AND c2.slug = 'python-basics'
  AND m1.slug = 'py-functions' AND m2.slug = 'py-functions'
  AND l1.slug = 'py-scope-lambda' AND l2.slug = 'py-def-functions'
ON CONFLICT DO NOTHING;

-- ══════════ PYTHON INTERMEDIATE DEPENDENCIES ══════════
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'python-intermediate' AND c2.slug = 'python-intermediate'
  AND m1.slug = 'py-errors' AND m2.slug = 'py-errors'
  AND l1.slug = 'py-custom-exceptions' AND l2.slug = 'py-try-except'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'python-intermediate' AND c2.slug = 'python-intermediate'
  AND m1.slug = 'py-comprehensions' AND m2.slug = 'py-comprehensions'
  AND l1.slug = 'py-generators' AND l2.slug = 'py-list-comprehensions'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'python-intermediate' AND c2.slug = 'python-intermediate'
  AND m1.slug = 'py-file-io' AND m2.slug = 'py-file-io'
  AND l1.slug = 'py-pathlib-json' AND l2.slug = 'py-file-reading'
ON CONFLICT DO NOTHING;

-- ══════════ CROSS-COURSE: Data Structures depends on Go Fundamentals ══════════
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'data-structures-go' AND c2.slug = 'go-fundamentals'
  AND m1.slug = 'ds-arrays-slices' AND m2.slug = 'go-functions'
  AND l1.slug = 'ds-array-basics' AND l2.slug = 'func-decl'
ON CONFLICT DO NOTHING;

COMMIT;
