-- ============================================================================
-- Koder :: Curriculum CMS Content Completion
-- Adds ALL sections, exercises, quizzes, and projects to EVERY lesson.
-- Also creates lessons for modules missing them + 8 Algorithms lessons.
-- ============================================================================
-- NOTE: Run 038_curriculum_cms.sql and 039_seed_curriculum.sql first.
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 0: Clear existing content
-- ============================================================================
DELETE FROM lesson_sections;
DELETE FROM projects;

-- ============================================================================
-- STEP 1: INSERT NEW LESSONS (for modules that have none yet)
-- ============================================================================

-- data-structures-go: ds-linked-lists (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'ds-singly-linked-list', 'Singly Linked Lists', 'Building linked lists in Go: nodes, traversal, insertion at head/tail, deletion, and reversal.', 3, 30, 70, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-linked-lists'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'ds-doubly-linked-list', 'Doubly Linked Lists', 'Doubly linked lists: prev/next pointers, bidirectional traversal, and practical applications like LRU caches.', 3, 35, 80, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-linked-lists'
ON CONFLICT (module_id, slug) DO NOTHING;

-- data-structures-go: ds-trees-graphs (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'ds-binary-trees', 'Binary Trees & BST', 'Binary tree traversal (inorder/preorder/postorder/level-order), binary search trees, insertion, search, deletion.', 3, 35, 80, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-trees-graphs'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'ds-graph-basics', 'Graph Fundamentals', 'Graph representations (adjacency matrix/list), DFS, BFS, connected components, and cycle detection.', 4, 40, 90, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-trees-graphs'
ON CONFLICT (module_id, slug) DO NOTHING;

-- algorithms: alg-sorting (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'sorting-basics', 'Sorting Fundamentals', 'Bubble sort, selection sort, insertion sort: implementations, time complexity, and stability analysis.', 3, 30, 70, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-sorting'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'sorting-compare', 'Merge & Quick Sort', 'Divide-and-conquer: merge sort and quicksort. Best/worst/average case, in-place vs stable, and comparisons.', 4, 35, 80, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-sorting'
ON CONFLICT (module_id, slug) DO NOTHING;

-- algorithms: alg-searching (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'linear-binary', 'Linear & Binary Search', 'Linear search on unsorted data and binary search on sorted arrays. Binary search variations and edge cases.', 3, 30, 70, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-searching'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'search-advanced', 'Advanced Search Techniques', 'Search in rotated arrays, find first/last occurrence, interpolation search, and ternary search.', 4, 35, 80, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-searching'
ON CONFLICT (module_id, slug) DO NOTHING;

-- algorithms: alg-dp (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'dp-intro', 'Introduction to DP', 'Memoization and tabulation: Fibonacci, climbing stairs, grid traveller. Top-down vs bottom-up approaches.', 4, 35, 80, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-dp'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'dp-patterns', 'DP Patterns', 'Classic DP: 0/1 knapsack, longest common subsequence, edit distance, coin change, and subset sum.', 5, 45, 100, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-dp'
ON CONFLICT (module_id, slug) DO NOTHING;

-- algorithms: alg-graphs (2 lessons)
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'graph-basics', 'Graph Traversal', 'DFS and BFS on graphs: iterative and recursive, connected components, bipartite checking, topological sort.', 4, 35, 80, 1, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-graphs'
ON CONFLICT (module_id, slug) DO NOTHING;

INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'graph-algorithms', 'Shortest Paths & MST', 'Dijkstra, Bellman-Ford, Floyd-Warshall, union-find (DSU), Kruskal and Prim for minimum spanning trees.', 5, 45, 100, 2, false, ARRAY[]::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-graphs'
ON CONFLICT (module_id, slug) DO NOTHING;

-- ============================================================================
-- STEP 2: UPDATE problem_references on existing lessons
-- ============================================================================
UPDATE lessons l SET problem_references = ARRAY['max-min', 'fizzbuzz']::TEXT[]
FROM modules m, courses c WHERE l.module_id = m.id AND m.course_id = c.id AND c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'basic-types';

UPDATE lessons l SET problem_references = ARRAY['sum-of-digits', 'reverse-integer']::TEXT[]
FROM modules m, courses c WHERE l.module_id = m.id AND m.course_id = c.id AND c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'type-conversion';

UPDATE lessons l SET problem_references = ARRAY['even-squares', 'word-count']::TEXT[]
FROM modules m, courses c WHERE l.module_id = m.id AND m.course_id = c.id AND c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'if-switch';

UPDATE lessons l SET problem_references = ARRAY['sum-of-array', 'count-vowels']::TEXT[]
FROM modules m, courses c WHERE l.module_id = m.id AND m.course_id = c.id AND c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'for-loops';

UPDATE lessons l SET problem_references = ARRAY['factorial', 'gcd-euclidean']::TEXT[]
FROM modules m, courses c WHERE l.module_id = m.id AND m.course_id = c.id AND c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'func-decl';

UPDATE lessons l SET problem_references = ARRAY['py-double-it']::TEXT[]
FROM modules m, courses c WHERE l.module_id = m.id AND m.course_id = c.id AND c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-first-program';

UPDATE lessons l SET problem_references = ARRAY['python-greet', 'python-full-name']::TEXT[]
FROM modules m, courses c WHERE l.module_id = m.id AND m.course_id = c.id AND c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-input-output';

UPDATE lessons l SET problem_references = ARRAY['py-arr-str-reverse-string', 'py-arr-str-list-sum']::TEXT[]
FROM modules m, courses c WHERE l.module_id = m.id AND m.course_id = c.id AND c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-lists-tuples';

UPDATE lessons l SET problem_references = ARRAY['py-sum-up-to', 'py-sum-even-numbers']::TEXT[]
FROM modules m, courses c WHERE l.module_id = m.id AND m.course_id = c.id AND c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-loops';

UPDATE lessons l SET problem_references = ARRAY['py-inter-bank-account']::TEXT[]
FROM modules m, courses c WHERE l.module_id = m.id AND m.course_id = c.id AND c.slug = 'python-intermediate' AND m.slug = 'py-errors' AND l.slug = 'py-custom-exceptions';

UPDATE lessons l SET problem_references = ARRAY['py-inter-map-filter', 'py-inter-reverse-words']::TEXT[]
FROM modules m, courses c WHERE l.module_id = m.id AND m.course_id = c.id AND c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions' AND l.slug = 'py-list-comprehensions';

UPDATE lessons l SET problem_references = ARRAY['py-inter-range-generator', 'py-inter-memoized-fib']::TEXT[]
FROM modules m, courses c WHERE l.module_id = m.id AND m.course_id = c.id AND c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions' AND l.slug = 'py-generators';

UPDATE lessons l SET problem_references = ARRAY['sum-of-array', 'find-max-in-array']::TEXT[]
FROM modules m, courses c WHERE l.module_id = m.id AND m.course_id = c.id AND c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices' AND l.slug = 'ds-array-basics';

UPDATE lessons l SET problem_references = ARRAY['remove-duplicates-sorted', 'rotate-array']::TEXT[]
FROM modules m, courses c WHERE l.module_id = m.id AND m.course_id = c.id AND c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices' AND l.slug = 'ds-slice-tricks';

UPDATE lessons l SET problem_references = ARRAY['two-sum-indices', 'most-frequent-char']::TEXT[]
FROM modules m, courses c WHERE l.module_id = m.id AND m.course_id = c.id AND c.slug = 'data-structures-go' AND m.slug = 'ds-maps' AND l.slug = 'ds-map-basics';

-- ============================================================================
-- STEP 3: INSERT ALL LESSON SECTIONS
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- COURSE: GO FUNDAMENTALS
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Module: go-intro ──

-- hello-world (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What is Go?',
E'Go is a statically typed, compiled programming language designed at Google by Robert Griesemer, Rob Pike, and Ken Thompson.\n\nIt combines the efficiency of a compiled language with the ease of programming of an interpreted language.\n\n**Key features:**\n- Fast compilation and execution\n- Built-in concurrency (goroutines, channels)\n- Garbage collected\n- Simple, readable syntax\n- Rich standard library', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'hello-world';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Your First Program',
E'Every Go program starts with a package declaration. The `main` package is special — it defines the program entry point.\n\n```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n```\n\n**Breaking it down:**\n- `package main` — this program belongs to the main package\n- `import "fmt"` — brings in the formatted I/O package\n- `func main()` — the function that runs when the program starts\n- `fmt.Println(...)` — prints text followed by a newline\n\nRun it: `go run main.go`', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'hello-world';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Print Variations',
E'```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Print with newline\n    fmt.Println("Hello, World!")\n\n    // Print without newline\n    fmt.Print("No newline here ")\n\n    // Formatted print\n    name := "Go"\n    version := 1.23\n    fmt.Printf("%s version %.2f\\n", name, version)\n\n    // Print multiple values\n    fmt.Println("Go", "is", "awesome!")\n}\n```\n\n**Output:**\n```\nHello, World!\nNo newline here Go version 1.23\nGo is awesome!\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'hello-world';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Print a Greeting',
E'Write a Go program that prints a personalised greeting to the console.\n\n**Requirements:**\n1. Declare variables for your name and age\n2. Use `fmt.Printf` to print `"Hi, I am [name] and I am [age] years old."`\n3. Use both `string` and `int` types\n\n**Starter code:**\n```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    var name string = "Alice"\n    var age int = 25\n    // Your code here\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'hello-world';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'In this lesson you learned:\n- Go is a compiled, statically typed language with built-in concurrency\n- Every Go program needs a `package main` declaration and a `func main()` entry point\n- `fmt.Println()` prints with a newline, `fmt.Print()` without, `fmt.Printf()` with formatting\n- Use `go run filename.go` to execute your program\n- Go uses `//` for single-line comments and `/* */` for multi-line', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'hello-world';

-- go-playground (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Go Tooling Overview',
E'Go comes with a powerful set of built-in tools for formatting, building, testing, and managing code.\n\nThe official Go playground at `https://go.dev/play/` lets you write and run Go code in your browser without installing anything.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'go-playground';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Essential Go Commands',
E'**`go fmt`** — Formats your code according to Go standards (gofmt).\n```bash\ngo fmt ./...\n```\n\n**`go build`** — Compiles your program.\n```bash\ngo build -o myapp main.go\n```\n\n**`go run`** — Compiles and runs without producing a binary.\n```bash\ngo run main.go\n```\n\n**`go test`** — Runs tests.\n```bash\ngo test -v ./...\n```\n\n**`go vet`** — Reports suspicious constructs.\n```bash\ngo vet ./...\n```\n\n**`go mod`** — Dependency management.\n```bash\ngo mod init mymodule\ngo mod tidy\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'go-playground';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Playground Examples',
E'The Go Playground is perfect for quick experiments:\n\n```go\npackage main\n\nimport (\n    "fmt"\n    "time"\n)\n\nfunc main() {\n    fmt.Println("Welcome to the Go Playground!")\n    fmt.Println("The time is:", time.Now())\n}\n```\n\nYou can share playground snippets via generated URLs — great for asking questions on forums and Stack Overflow.', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'go-playground';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Format and Build',
E'Create a simple Go program and use the tooling commands.\n\n**Tasks:**\n1. Write a program that prints `"Go tooling is powerful!"`\n2. Run `go fmt` to format your code\n3. Run `go build` to compile\n4. Run `go vet` on your code\n\n**Starter code:**\n```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Your code here\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'go-playground';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- `go fmt` auto-formats your code to standard style\n- `go build` compiles to a binary, `go run` compiles and runs in one step\n- `go test` runs tests, `go vet` checks for suspicious code\n- The Go Playground (go.dev/play/) is great for quick experiments and sharing code\n- `go mod init` starts a new module, `go mod tidy` cleans up dependencies', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'go-playground';
-- ── Module: go-variables-types ──

-- basic-types (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Types in Go',
E'Go is statically typed — every variable has a known type at compile time.\n\n**Basic types:**\n- `bool` — true or false\n- `string` — text (UTF-8 encoded)\n- `int`, `int8`, `int16`, `int32`, `int64` — signed integers\n- `float32`, `float64` — floating-point numbers\n- `byte` — alias for uint8\n- `rune` — alias for int32 (Unicode code point)', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'basic-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Declaration & Zero Values',
E'**Variable declaration:**\n```go\nvar x int           // declaration, x = 0 (zero value)\nvar y int = 10      // declaration with initialiser\nvar z = 10          // type inference\nw := 10              // short declaration (function scope)\n```\n\n**Zero values:** Every type has a default zero value — no undefined state.\n| Type | Zero Value |\n|------|-----------|\n| int, float | 0 |\n| bool | false |\n| string | "" (empty string) |\n| pointer, slice, map, chan, interface | nil |\n\n**Multiple variables:**\n```go\nvar x, y int = 1, 2\nname, age := "Alice", 30\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'basic-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Type Inference in Action',
E'```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    var name string = "Go"\n    version := 1.23        // float64 (inferred)\n    isFun := true          // bool (inferred)\n    var x, y = 100, "hello"\n\n    fmt.Printf("%s version %.2f — Is it fun? %t\\n", name, version, isFun)\n    fmt.Println(x, y)\n\n    // Zero values in action\n    var count int\n    var active bool\n    var message string\n    fmt.Printf("int: %d, bool: %t, string: %q\\n", count, active, message)\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'basic-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Variable Practice',
E'Write a Go program that declares variables of different types and prints their values and zero values.\n\n**Tasks:**\n1. Declare an `int`, a `float64`, a `string`, and a `bool` without initial values\n2. Print each zero value\n3. Assign values and print again\n4. Use both `var` and `:=` styles\n\n**Starter code:**\n```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    var a int\n    var b float64\n    var c string\n    var d bool\n\n    fmt.Printf("Zero values: %d, %.1f, %q, %t\\n", a, b, c, d)\n\n    // Assign values below:\n    a = 42\n    // Your code here\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'basic-types';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Go is statically typed — types are checked at compile time\n- Every variable has a zero value — no undefined state\n- Use `var name type = value` for explicit declarations\n- Use `:=` for short declarations (inside functions only)\n- `byte` = `uint8`, `rune` = `int32`\n- Type inference works with `:=` and `var name = value`', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'basic-types';

-- constants-iota (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Constants in Go',
E'Constants are immutable values known at compile time. Go supports typed and untyped constants, plus the powerful `iota` enumerator.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'constants-iota';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Const Declaration & Iota',
E'**Declaring constants:**\n```go\nconst Pi = 3.14159              // untyped\nconst SpeedOfLight = 299792458  // untyped\nconst Greeting string = "Hello" // typed\n```\n\n**Iota enumerator:**\n```go\nconst (\n    Sunday = iota  // 0\n    Monday         // 1\n    Tuesday        // 2\n    Wednesday      // 3\n    Thursday       // 4\n    Friday         // 5\n    Saturday       // 6\n)\n```\n\n**Iota with expressions:**\n```go\nconst (\n    _  = iota             // 0 (discarded)\n    KB = 1 << (10 * iota) // 1024\n    MB                    // 1048576\n    GB                    // 1073741824\n)\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'constants-iota';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Constants in Practice',
E'```go\npackage main\n\nimport "fmt"\n\nconst (\n    StatusActive = iota + 1  // 1\n    StatusInactive           // 2\n    StatusBanned             // 3\n)\n\nconst (\n    WritePermission = 1 << iota  // 1\n    ReadPermission               // 2\n    ExecutePermission            // 4\n)\n\nfunc main() {\n    fmt.Println(StatusActive, StatusInactive, StatusBanned)  // 1 2 3\n    fmt.Println(WritePermission, ReadPermission, ExecutePermission) // 1 2 4\n}\n```\n\nUntyped constants can be used with any compatible type, while typed constants are restricted to their specific type.', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'constants-iota';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Iota Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'constants-iota';

UPDATE lesson_sections SET metadata = '{"question": "What value does Friday have in this iota enumeration?\n\nconst (\n    Sunday = iota\n    Monday\n    Tuesday\n    Wednesday\n    Thursday\n    Friday\n    Saturday\n)", "options": ["5", "6", "7", "0"], "correct_index": 0, "explanation": "iota starts at 0 for Sunday, and increments by 1 each step. Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6."}'::jsonb WHERE section_type = 'quiz' AND title = 'Iota Quiz';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Constants are declared with `const` and cannot be changed\n- Untyped constants work with any compatible type; typed constants are restricted\n- `iota` generates sequential integer constants, starting at 0\n- Use `_` to skip values in an iota sequence\n- Iota can be used with expressions like `1 << (10 * iota)` for powers of 2', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'constants-iota';

-- type-conversion (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Why Type Conversion?',
E'Go does not perform implicit type conversion. Even between `int` and `float64`, you must convert explicitly. This prevents subtle bugs common in languages with implicit coercion.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'type-conversion';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Conversion Syntax',
E'**Numeric conversions:**\n```go\nvar x int = 42\nvar y float64 = float64(x)   // explicit conversion\nvar z int = int(y)            // back to int (truncates)\n\nvar a int64 = 100\nvar b int = int(a)            // must convert even between int sizes\n```\n\n**String conversions (strconv):**\n```go\nimport "strconv"\n\ns := strconv.Itoa(42)         // "42"\ni, err := strconv.Atoi("42")  // 42, nil\nf, _ := strconv.ParseFloat("3.14", 64)\ns := strconv.FormatFloat(3.14, '\''f'\'', -1, 64)\n```\n\n**Rune slices:**\n```go\ns := "Hello, 世界"\nrunes := []rune(s)\nfmt.Println(len(runes))       // 9\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'type-conversion';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Conversion Examples',
E'```go\npackage main\n\nimport (\n    "fmt"\n    "strconv"\n)\n\nfunc main() {\n    // Numeric\n    pi := 3.14159\n    truncated := int(pi)\n    fmt.Printf("float64→int: %d\\n", truncated)\n\n    // String to int\n    num, _ := strconv.Atoi("256")\n    fmt.Printf("string→int: %d\\n", num)\n\n    // int to string\n    s := strconv.Itoa(1024)\n    fmt.Printf("int→string: %s\\n", s)\n\n    // Byte slice to string\n    bytes := []byte{72, 101, 108, 108, 111}\n    fmt.Printf("bytes→string: %s\\n", string(bytes))\n\n    // String to byte slice\n    text := "Go"\n    fmt.Printf("string→bytes: %v\\n", []byte(text))\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'type-conversion';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Type Conversion Practice',
E'Write a function that converts a string containing an integer to its float64 representation, then performs arithmetic.\n\n**Starter code:**\n```go\npackage main\n\nimport (\n    "fmt"\n    "strconv"\n)\n\nfunc main() {\n    str := "42"\n    // Convert str to int, then to float64\n    // Divide by 2 and print the result\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'type-conversion';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Go requires explicit conversions for all type changes\n- Use `Type(value)` syntax for numeric conversions\n- Use `strconv` package for string↔number conversions\n- `int` to `float64` and back may lose precision\n- `[]rune(s)` handles multi-byte Unicode characters correctly', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-variables-types' AND l.slug = 'type-conversion';
-- ── Module: go-control-flow ──

-- if-switch (6 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Conditional Logic',
E'Go provides `if`/`else` and `switch` statements. A unique feature is the **init statement** — you can run a short statement before the condition, and its scope is limited to the if/else block.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'if-switch';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'If, Else & Switch',
E'**If with init statement:**\n```go\nif x := compute(); x > 10 {\n    fmt.Println("Big:", x)\n} else {\n    fmt.Println("Small:", x)\n}\n// x is not accessible here\n```\n\n**Switch statement:**\n```go\nswitch day {\ncase "Monday", "Tuesday":\n    fmt.Println("Weekday")\ncase "Saturday", "Sunday":\n    fmt.Println("Weekend")\ndefault:\n    fmt.Println("Midweek")\n}\n```\n\n**Expressionless switch (if/else if cleaner):**\n```go\nswitch {\ncase score >= 90:\n    grade = "A"\ncase score >= 80:\n    grade = "B"\ncase score >= 70:\n    grade = "C"\ndefault:\n    grade = "F"\n}\n```\n\n**Type switch:**\n```go\nvar v interface{} = 42\nswitch v.(type) {\ncase int:\n    fmt.Println("int")\ncase string:\n    fmt.Println("string")\ndefault:\n    fmt.Println("unknown")\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'if-switch';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Conditional Examples',
E'```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Init statement\n    if num := 7; num%2 == 0 {\n        fmt.Println(num, "is even")\n    } else {\n        fmt.Println(num, "is odd")\n    }\n\n    // Switch with multiple cases\n    char := '\''a'\''\n    switch char {\n    case '\''a'\'', '\''e'\'', '\''i'\'', '\''o'\'', '\''u'\'':\n        fmt.Println("Vowel")\n    default:\n        fmt.Println("Consonant")\n    }\n\n    // Expressionless switch\n    age := 25\n    switch {\n    case age < 13:\n        fmt.Println("Child")\n    case age < 20:\n        fmt.Println("Teen")\n    case age < 65:\n        fmt.Println("Adult")\n    default:\n        fmt.Println("Senior")\n    }\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'if-switch';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'If/Switch Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'if-switch';

UPDATE lesson_sections SET metadata = '{"question": "What does this Go code print?\n\nx := 5\nif x > 10 {\n    fmt.Println(\"big\")\n} else if x > 3 {\n    fmt.Println(\"medium\")\n} else {\n    fmt.Println(\"small\")\n}", "options": ["big", "medium", "small", "compilation error"], "correct_index": 1, "explanation": "x is 5, not > 10 so first branch is skipped. x is > 3, so the else if branch executes and prints \"medium\"."}'::jsonb WHERE section_type = 'quiz' AND title = 'If/Switch Quiz';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Grade Classifier',
E'Write a program that reads a numeric score (0-100) and prints the corresponding letter grade.\n\n**Grade rules:**\n- 90-100: A\n- 80-89: B\n- 70-79: C\n- 60-69: D\n- 0-59: F\n\nUse both `if/else` and `switch` versions.\n\n**Starter code:**\n```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    score := 85\n    var grade string\n    // Your code here\n    fmt.Println("Grade:", grade)\n}\n```', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'if-switch';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- `if` supports an init statement with block-scoped variables\n- No parentheses around conditions, but braces are required\n- `switch` cases break automatically (no fallthrough by default)\n- Expressionless `switch` is a cleaner alternative to if/else chains\n- Type switches let you inspect interface dynamic types', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'if-switch';

-- for-loops (6 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'The Only Loop',
E'Go has a single looping keyword: `for`. It can be used in three forms: classic for, while-style, and infinite. The `range` keyword adds powerful iteration over collections.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'for-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'For Loop Forms',
E'**Classic for:**\n```go\nfor i := 0; i < 10; i++ {\n    fmt.Println(i)\n}\n```\n\n**While-style:**\n```go\nn := 0\nfor n < 10 {\n    fmt.Println(n)\n    n++\n}\n```\n\n**Infinite loop:**\n```go\nfor {\n    // runs until break/return\n}\n```\n\n**Range over collections:**\n```go\nnums := []int{10, 20, 30}\nfor i, v := range nums {\n    fmt.Printf("index=%d value=%d\\n", i, v)\n}\n\n// Range over map\nm := map[string]int{"a": 1, "b": 2}\nfor k, v := range m {\n    fmt.Printf("%s → %d\\n", k, v)\n}\n\n// Range over string (runes)\nfor i, r := range "Hello" {\n    fmt.Printf("%d → %c\\n", i, r)\n}\n```\n\n**Break and continue:**\n```go\nfor i := 0; i < 10; i++ {\n    if i%2 == 0 {\n        continue\n    }\n    if i > 7 {\n        break\n    }\n    fmt.Println(i)\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'for-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Loop Examples',
E'```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Classic for — sum 1 to 10\n    sum := 0\n    for i := 1; i <= 10; i++ {\n        sum += i\n    }\n    fmt.Println("Sum 1-10:", sum)\n\n    // While-style — double until > 100\n    n := 1\n    for n < 100 {\n        n *= 2\n    }\n    fmt.Println("Doubled past 100:", n)\n\n    // Range over slice\n    fruits := []string{"apple", "banana", "cherry"}\n    for _, fruit := range fruits {\n        fmt.Println(fruit)\n    }\n\n    // Range over map\n    ages := map[string]int{"Alice": 30, "Bob": 25}\n    for name, age := range ages {\n        fmt.Printf("%s is %d\\n", name, age)\n    }\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'for-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Loop Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'for-loops';

UPDATE lesson_sections SET metadata = '{"question": "How many times does \"Hello\" print?\n\nfor i := 0; i < 5; i++ {\n    fmt.Println(\"Hello\")\n}", "options": ["4", "5", "6", "Infinite"], "correct_index": 1, "explanation": "The loop starts at 0 and runs while i < 5. It executes for i=0,1,2,3,4 — that is 5 iterations total."}'::jsonb WHERE section_type = 'quiz' AND title = 'Loop Quiz';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Sum Calculator',
E'Write a program that sums numbers from 1 to N and also computes the average.\n\n**Starter code:**\n```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    N := 100\n    sum := 0\n    // Your loop here\n    // Print sum and average\n}\n```', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'for-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Go has only `for` — no `while` or `do-while`\n- Classic: `for init; condition; post { }`\n- While-style: `for condition { }`\n- Infinite: `for { }`\n- `range` iterates over slices, maps, strings, and channels\n- `break` exits the loop, `continue` skips to the next iteration\n- Use `_` to ignore the index or value in range', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'for-loops';

-- defer-panic (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Defer & Panic',
E'Go has three unique control mechanisms: `defer`, `panic`, and `recover`. `defer` schedules a function call to run after the surrounding function returns. `panic` stops normal execution, and `recover` regains control.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'defer-panic';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Defer, Panic & Recover',
E'**Defer — cleanup and resource management:**\n```go\nfunc readFile(name string) error {\n    f, err := os.Open(name)\n    if err != nil {\n        return err\n    }\n    defer f.Close()  // runs when readFile returns\n    // use f...\n}\n```\n\nDeferred calls are LIFO:\n```go\nfunc main() {\n    defer fmt.Println("first")\n    defer fmt.Println("second")\n    defer fmt.Println("third")\n    fmt.Println("hello")\n}\n// Output:\n// hello\n// third\n// second\n// first\n```\n\n**Panic and Recover:**\n```go\ndefer func() {\n    if r := recover(); r != nil {\n        fmt.Println("Recovered from:", r)\n    }\n}()\npanic("something went wrong")\n```\n\nDeferred functions can modify named return values:\n```go\nfunc count() (n int) {\n    defer func() { n++ }()\n    return 1\n}\n// count() returns 2\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'defer-panic';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Defer in Practice',
E'```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    defer fmt.Println("1")\n    defer fmt.Println("2")\n    defer fmt.Println("3")\n    fmt.Println("Start")\n\n    safeDivide(10, 0)\n    safeDivide(10, 2)\n}\n\nfunc safeDivide(a, b int) {\n    defer func() {\n        if r := recover(); r != nil {\n            fmt.Println("Recovered:", r)\n        }\n    }()\n    if b == 0 {\n        panic("division by zero")\n    }\n    fmt.Println("Result:", a/b)\n}\n```\n\n**Output:**\n```\nStart\n3\n2\n1\nRecovered: division by zero\nResult: 5\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'defer-panic';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Defer Order',
E'Write a program demonstrating LIFO defer order and safe division with recover.\n\n**Starter code:**\n```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Starting")\n    // Add three deferred prints here\n    // Call safeDivide for 5/0 and 5/2\n}\n\nfunc safeDivide(a, b int) {\n    // Add recover here\n    // Divide and print\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'defer-panic';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- `defer` schedules a call to run when the function returns\n- Deferred calls execute in LIFO order\n- `panic` stops normal execution and unwinds the stack\n- `recover` inside a deferred function regains control\n- Common use: closing files, unlocking mutexes, error handling\n- Named return values can be modified by deferred functions', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'defer-panic';
-- ── Module: go-functions ──

-- func-decl (6 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Functions in Go',
E'Functions are first-class citizens in Go. They can be declared with multiple return values, named returns, variadic parameters, and can be passed around as values.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'func-decl';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Function Syntax',
E'**Basic function:**\n```go\nfunc add(a int, b int) int {\n    return a + b\n}\n\n// Same-type params can be collapsed:\nfunc add(a, b int) int {\n    return a + b\n}\n```\n\n**Multiple return values:**\n```go\nfunc divide(a, b int) (int, error) {\n    if b == 0 {\n        return 0, errors.New("division by zero")\n    }\n    return a / b, nil\n}\n```\n\n**Named return values:**\n```go\nfunc split(sum int) (x, y int) {\n    x = sum * 4 / 9\n    y = sum - x\n    return  // naked return\n}\n```\n\n**Variadic functions:**\n```go\nfunc sum(nums ...int) int {\n    total := 0\n    for _, n := range nums {\n        total += n\n    }\n    return total\n}\n```\n\n**Function as value:**\n```go\nfn := func(a, b int) int { return a + b }\nresult := fn(3, 4)  // 7\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'func-decl';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Function Examples',
E'```go\npackage main\n\nimport (\n    "errors"\n    "fmt"\n)\n\nfunc divide(a, b float64) (float64, error) {\n    if b == 0 {\n        return 0, errors.New("cannot divide by zero")\n    }\n    return a / b, nil\n}\n\nfunc sum(nums ...int) int {\n    total := 0\n    for _, n := range nums {\n        total += n\n    }\n    return total\n}\n\nfunc fibonacci(n int) int {\n    if n <= 1 {\n        return n\n    }\n    return fibonacci(n-1) + fibonacci(n-2)\n}\n\nfunc main() {\n    result, err := divide(10, 3)\n    if err != nil {\n        fmt.Println(err)\n    } else {\n        fmt.Printf("10/3 = %.2f\\n", result)\n    }\n    fmt.Println(sum(1, 2, 3, 4, 5))\n    fmt.Println(fibonacci(10))\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'func-decl';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Functions Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'func-decl';

UPDATE lesson_sections SET metadata = '{"question": "What does this Go code print?\n\nfunc add(a, b int) int {\n    return a + b\n}\n\nfunc main() {\n    fmt.Println(add(5, 7))\n}", "options": ["57", "12", "35", "Compilation error"], "correct_index": 1, "explanation": "The function adds the two integers: 5 + 7 = 12."}'::jsonb WHERE section_type = 'quiz' AND title = 'Functions Quiz';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Calculator Functions',
E'Write arithmetic functions (add, subtract, multiply, divide) and call them from main.\n\n**Starter code:**\n```go\npackage main\n\nimport "fmt"\n\nfunc add(a, b int) int {\n    return a + b\n}\n\nfunc subtract(a, b int) int {\n    return a - b\n}\n\nfunc multiply(a, b int) int {\n    return a * b\n}\n\nfunc divide(a, b int) (int, error) {\n    // Your code here\n}\n\nfunc main() {\n    // Test all four functions\n}\n```', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'func-decl';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Functions use `func name(params) returnType { }`\n- Multiple return values are a core Go feature\n- Named returns enable naked returns (`return` without values)\n- Variadic params (`...T`) accept zero or more arguments\n- Functions are values — can be assigned to variables and passed around\n- Recursion is supported', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'func-decl';

-- methods (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Methods on Types',
E'Go allows you to define methods on types. A method is a function with a special **receiver** parameter that appears between `func` and the method name.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'methods';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Value vs Pointer Receivers',
E'**Value receiver:** works on a copy\n```go\ntype Rectangle struct {\n    Width, Height float64\n}\n\nfunc (r Rectangle) Area() float64 {\n    return r.Width * r.Height\n}\n\nfunc (r Rectangle) Scale(factor float64) {\n    r.Width *= factor  // only modifies the copy!\n}\n```\n\n**Pointer receiver:** modifies the original\n```go\nfunc (r *Rectangle) Scale(factor float64) {\n    r.Width *= factor\n    r.Height *= factor\n}\n```\n\n**When to use pointer receiver:**\n1. To modify the receiver\n2. For large structs (avoids copying)\n3. Consistency\n\n**Method on any type:**\n```go\ntype MyInt int\n\nfunc (m MyInt) Double() MyInt {\n    return m * 2\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'methods';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Method Examples',
E'```go\npackage main\n\nimport "fmt"\n\ntype Rectangle struct {\n    Width, Height float64\n}\n\nfunc (r Rectangle) Area() float64 {\n    return r.Width * r.Height\n}\n\nfunc (r *Rectangle) Scale(factor float64) {\n    r.Width *= factor\n    r.Height *= factor\n}\n\ntype Celsius float64\n\nfunc (c Celsius) ToFahrenheit() float64 {\n    return float64(c)*9/5 + 32\n}\n\nfunc main() {\n    r := Rectangle{Width: 10, Height: 5}\n    fmt.Println("Area:", r.Area())\n    r.Scale(2)\n    fmt.Println("After scale:", r.Width, r.Height)\n    temp := Celsius(100)\n    fmt.Println("100°C =", temp.ToFahrenheit(), "°F")\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'methods';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Method Practice',
E'Define a `Circle` struct with methods to compute area and circumference.\n\n**Starter code:**\n```go\npackage main\n\nimport (\n    "fmt"\n    "math"\n)\n\ntype Circle struct {\n    Radius float64\n}\n\nfunc (c Circle) Area() float64 {\n    // Your code here\n}\n\nfunc (c Circle) Circumference() float64 {\n    // Your code here\n}\n\nfunc main() {\n    c := Circle{Radius: 5}\n    fmt.Println("Area:", c.Area())\n    fmt.Println("Circumference:", c.Circumference())\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'methods';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Methods are functions with a receiver parameter\n- Value receivers work on a copy; pointer receivers modify the original\n- Pointer receivers avoid copying large structs\n- Methods can be defined on any type, not just structs\n- Go automatically handles `&` and `*` when calling methods', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'methods';

-- closures-anon (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Anonymous Functions & Closures',
E'Go supports anonymous functions that can be defined inline and assigned to variables. When an anonymous function captures variables from its surrounding scope, it becomes a **closure**.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'closures-anon';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Closures Explained',
E'**Anonymous function:**\n```go\nfunc main() {\n    add := func(a, b int) int {\n        return a + b\n    }\n    fmt.Println(add(3, 4))  // 7\n}\n```\n\n**Closure capturing variables:**\n```go\nfunc makeAdder(x int) func(int) int {\n    return func(y int) int {\n        return x + y\n    }\n}\n\nfunc main() {\n    add5 := makeAdder(5)\n    fmt.Println(add5(3))  // 8\n}\n```\n\n**Closure gotcha — loop variable capture:**\n```go\nfor i := 0; i < 3; i++ {\n    defer func() {\n        fmt.Println(i)  // prints 3, 3, 3!\n    }()\n}\n```\n\n**Fix — capture a copy:**\n```go\nfor i := 0; i < 3; i++ {\n    i := i\n    defer func() {\n        fmt.Println(i)  // prints 2, 1, 0\n    }()\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'closures-anon';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Closure Examples',
E'```go\npackage main\n\nimport "fmt"\n\nfunc fibonacci() func() int {\n    a, b := 0, 1\n    return func() int {\n        result := a\n        a, b = b, a+b\n        return result\n    }\n}\n\nfunc filter(nums []int, fn func(int) bool) []int {\n    var result []int\n    for _, n := range nums {\n        if fn(n) {\n            result = append(result, n)\n        }\n    }\n    return result\n}\n\nfunc main() {\n    fib := fibonacci()\n    for i := 0; i < 10; i++ {\n        fmt.Print(fib(), " ")\n    }\n    fmt.Println()\n\n    nums := []int{1, 2, 3, 4, 5, 6}\n    evens := filter(nums, func(n int) bool { return n%2 == 0 })\n    fmt.Println("Evens:", evens)\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'closures-anon';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Closure Counter',
E'Write a closure that creates a counter starting from a given value, incrementing by 1 each call.\n\n**Starter code:**\n```go\npackage main\n\nimport "fmt"\n\nfunc makeCounter(start int) func() int {\n    // Return a closure that increments and returns\n}\n\nfunc main() {\n    counter := makeCounter(10)\n    fmt.Println(counter()) // 10\n    fmt.Println(counter()) // 11\n    fmt.Println(counter()) // 12\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'closures-anon';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Anonymous functions are defined inline with no name\n- Closures capture variables from the surrounding scope\n- Each closure instance has its own captured variables\n- Beware of loop variable capture — create a local copy\n- Closures enable functional patterns like map, filter, generators', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'closures-anon';
-- ── Module: go-packages ──

-- creating-packages (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Go Packages',
E'Every Go file belongs to a package. Packages are Go''s way of organising and reusing code. The package name matches the last element of the import path.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-packages' AND l.slug = 'creating-packages';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Exporting & Importing',
E'**Package structure:**\n```\nproject/\n├── main.go\n└── math/\n    └── math.go\n```\n\n**math/math.go:**\n```go\npackage math\n\nfunc Add(a, b int) int {     // Exported (uppercase)\n    return a + b\n}\n\nfunc subtract(a, b int) int { // Unexported (lowercase)\n    return a - b\n}\n```\n\n**main.go:**\n```go\npackage main\n\nimport (\n    "fmt"\n    "project/math"\n)\n\nfunc main() {\n    fmt.Println(math.Add(3, 4))\n    // math.subtract(5, 2) // ERROR: unexported\n}\n```\n\n**Naming conventions:**\n- Package name is lowercase, no underscores\n- Keep packages focused (single responsibility)\n- Use `internal/` directory for packages not importable outside', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-packages' AND l.slug = 'creating-packages';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Package Example',
E'```go\n// stringutil/reverse.go\npackage stringutil\n\nfunc Reverse(s string) string {\n    runes := []rune(s)\n    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {\n        runes[i], runes[j] = runes[j], runes[i]\n    }\n    return string(runes)\n}\n```\n\n```go\n// main.go\npackage main\n\nimport (\n    "fmt"\n    "example/stringutil"\n)\n\nfunc main() {\n    fmt.Println(stringutil.Reverse("Hello")) // olleH\n}\n```\n\n**Running:**\n```bash\ngo mod init example\ngo run main.go\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-packages' AND l.slug = 'creating-packages';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Create a Package',
E'Create a `calculator` package with exported Add, Subtract, Multiply functions and an unexported helper.\n\n**Starter code (calculator/calc.go):**\n```go\npackage calculator\n\nfunc Add(a, b int) int {\n    return a + b\n}\n\n// Add Subtract, Multiply\n// Add an unexported log helper\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-packages' AND l.slug = 'creating-packages';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Each Go file belongs to a package declared at the top\n- Exported names start with uppercase; unexported with lowercase\n- Import using the module path + package directory\n- Use `internal/` to restrict import visibility\n- Package names should be short and descriptive\n- Avoid circular imports between packages', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-packages' AND l.slug = 'creating-packages';

-- go-modules (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Go Modules',
E'Go modules are the built-in dependency management system. A module is a collection of packages versioned together, defined by a `go.mod` file.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-packages' AND l.slug = 'go-modules';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Module Basics',
E'**Initialising a module:**\n```bash\ngo mod init github.com/user/project\n```\n\nThis creates `go.mod`:\n```\nmodule github.com/user/project\n\ngo 1.23\n```\n\n**Adding dependencies:**\n```bash\ngo get github.com/gorilla/mux\n```\n\n**`go.sum`** contains cryptographic checksums for reproducible builds.\n\n**Essential commands:**\n- `go mod tidy` — adds missing, removes unused dependencies\n- `go mod download` — downloads all dependencies\n- `go mod vendor` — creates a `vendor/` directory\n- `go mod verify` — verifies dependencies haven''t been modified\n\n**Versioning:**\n- Go modules follow semantic versioning (`v1.2.3`)\n- `@latest` gets the latest tagged version\n- `@v1.2.3` gets a specific version', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-packages' AND l.slug = 'go-modules';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Module Workflow',
E'```bash\n# Start a new module\nmkdir myapp\ncd myapp\ngo mod init myapp\n\n# Add main.go\ncat > main.go << EOF\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from a module!")\n}\nEOF\n\n# Build and run\ngo build -o myapp\n./myapp\n```\n\n**Using external dependencies:**\n```bash\ngo get rsc.io/quote@v1.5.2\ngo mod tidy\n```\n\n**Upgrading:**\n```bash\ngo list -u -m all           # check for upgrades\ngo get -u ./...             # upgrade all\ngo get -u rsc.io/quote      # upgrade specific module\n```\n\n**Replace directive (local dev):**\n```\nreplace github.com/example/lib => ../lib\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-packages' AND l.slug = 'go-modules';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Module Practice',
E'Create a Go module that uses an external library.\n\n**main.go:**\n```go\npackage main\n\nimport (\n    "fmt"\n    "github.com/google/uuid"\n)\n\nfunc main() {\n    id := uuid.New()\n    fmt.Println("Generated UUID:", id.String())\n}\n```\n\n**Commands:**\n```bash\ngo mod init uuid-example\ngo get github.com/google/uuid\ngo run main.go\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-packages' AND l.slug = 'go-modules';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- `go mod init` creates a new module with go.mod\n- `go get` adds dependencies to go.mod\n- `go mod tidy` cleans up module files\n- `go.sum` ensures reproducible builds via checksums\n- Modules follow semantic versioning (`vMAJOR.MINOR.PATCH`)\n- `replace` directive allows local overrides for development', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-packages' AND l.slug = 'go-modules';

-- ═══════════════════════════════════════════════════════════════════════════
-- COURSE: PYTHON BASICS
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Module: py-hello ──

-- py-first-program (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'What is Python?',
E'Python is a high-level, interpreted programming language known for its readability and simplicity. Created by Guido van Rossum and first released in 1991, it is one of the world''s most popular programming languages.\n\n**Key features:**\n- Readable, expressive syntax\n- Dynamically typed — no type declarations needed\n- Interpreted (no compile step)\n- Extensive standard library ("batteries included")\n- Great for beginners and experts alike', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-first-program';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Your First Python Script',
E'Open a Python REPL by typing `python3` in your terminal, or create a file called `hello.py`.\n\n```python\n# hello.py\nprint("Hello, World!")\n\nname = input("What is your name? ")\nprint(f"Nice to meet you, {name}!")\n```\n\nRun it: `python3 hello.py`\n\n**Breaking it down:**\n- `print()` — outputs text to the console\n- `input()` — reads a line of text from the user\n- `f"..."` — f-string for embedding variables in text\n- `#` — single-line comment\n\n**The REPL:**\n```python\n>>> 2 + 2\n4\n>>> print("hello")\nhello\n>>> exit()\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-first-program';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Print & Input Examples',
E'```python\n# Multiple arguments to print\nprint("Hello", "World", "from", "Python!")\n\n# Print with separator\nprint("a", "b", "c", sep=", ")\n\n# Print without newline\nprint("Loading...", end="")\nprint(" Done!")\n\n# Reading input\nname = input("Enter your name: ")\nprint(f"Hello, {name}!")\n\n# Type conversion of input\nage = int(input("Enter your age: "))\nprint(f"Next year you will be {age + 1}")\n```\n\n**Output:**\n```\nHello World from Python!\na, b, c\nLoading... Done!\nEnter your name: Alice\nHello, Alice!\nEnter your age: 25\nNext year you will be 26\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-first-program';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Personalised Greeting',
E'Write a Python script that asks for a name and favourite hobby, then prints a message.\n\n**Starter code:**\n```python\nname = input("What is your name? ")\nhobby = input("What is your favourite hobby? ")\n# Print: "Alice loves painting!"\n# Your code here\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-first-program';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Python is interpreted, dynamically typed, and beginner-friendly\n- Use `print()` to output, `input()` to read input\n- f-strings (`f"...{variable}..."`) are the modern way to format strings\n- Run Python files with `python3 filename.py`\n- The REPL is great for quick experiments\n- Variables don''t need type declarations', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-first-program';
-- py-input-output (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Input & Output',
E'Python makes user interaction simple with `input()` for reading and `print()` for output. Properly handling user input and formatting output is a fundamental skill.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-input-output';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'String Formatting Methods',
E'**f-strings (Python 3.6+):**\n```python\nname = "Alice"\nage = 25\nprint(f"My name is {name} and I am {age}")  # best practice\nprint(f"Pi is approximately {math.pi:.2f}")\n```\n\n**`.format()` method:**\n```python\nprint("Hello, {}! You are {}.".format(name, age))\n```\n\n**%-formatting (old style):**\n```python\nprint("Name: %s, Age: %d" % (name, age))\n```\n\n**Reading and converting input:**\n```python\nraw = input("Enter a number: ")  # always returns a string\nnum = int(raw)                   # convert to int\n```\n\n**Multiple inputs on one line:**\n```python\na, b = input("Enter two numbers: ").split()\na, b = int(a), int(b)\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-input-output';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'I/O Examples',
E'```python\n# Simple calculator from terminal\nnum1 = float(input("Enter first number: "))\nnum2 = float(input("Enter second number: "))\nprint(f"{num1} + {num2} = {num1 + num2}")\nprint(f"{num1} - {num2} = {num1 - num2}")\nprint(f"{num1} * {num2} = {num1 * num2}")\n\n# Formatted table\nprint(f"{\"Item\":<10} {\"Price\":>8}")\nprint("-" * 18)\nprint(f"{\"Apple\":<10} {1.50:>8.2f}")\nprint(f"{\"Banana\":<10} {0.75:>8.2f}")\nprint(f"{\"Cherry\":<10} {3.00:>8.2f}")\n\n# Reading until empty\ntotal = 0\nwhile True:\n    line = input("Enter number (blank to quit): ")\n    if not line:\n        break\n    total += float(line)\nprint(f"Total: {total}")\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-input-output';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Simple Quiz',
E'Write a program that asks the user a question and checks their answer.\n\n**Starter code:**\n```python\nquestion = "What is the capital of France? "\nanswer = input(question)\n# Print "Correct!" or "Wrong, the answer is Paris"\n# Be case-insensitive\n# Your code here\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-input-output';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- `input()` always returns a string — use `int()` or `float()` to convert\n- f-strings (`f"{var}"`) are the preferred formatting style\n- `.format()` and `%` are older but still used\n- Use `.split()` to parse multiple inputs on one line\n- Format specifiers: `.2f` for 2 decimal places, `<`/`>` for alignment', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-input-output';

-- ── Module: py-variables ──

-- py-numbers-strings (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Numbers & Strings',
E'Python has three main numeric types: `int`, `float`, and `complex`. Strings are immutable sequences of Unicode characters. Both are fundamental building blocks.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-numbers-strings';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Numbers & String Operations',
E'**Numeric operations:**\n```python\na = 10\nb = 3\nprint(a + b)   # 13\nprint(a - b)   # 7\nprint(a * b)   # 30\nprint(a / b)   # 3.333...\nprint(a // b)  # 3 (floor division)\nprint(a % b)   # 1 (modulo)\nprint(a ** b)  # 1000 (power)\n```\n\n**String basics:**\n```python\ntext = "Hello, Python!"\nprint(len(text))          # 14\nprint(text.upper())       # HELLO, PYTHON!\nprint(text.split(","))    # ["Hello", " Python!"]\nprint(text.strip())       # remove whitespace\n```\n\n**String slicing:**\n```python\ns = "Hello, World!"\nprint(s[0:5])     # Hello\nprint(s[7:])      # World!\nprint(s[-6:-1])   # World\nprint(s[::2])     # Hlo ol!\nprint(s[::-1])    # !dlroW ,olleH (reversed)\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-numbers-strings';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Numbers & Strings in Action',
E'```python\n# Arithmetic and type\nresult = 10 / 3\nprint(f"10/3 = {result:.3f}")  # 10/3 = 3.333\nprint(type(result))            # <class '\''float'\''>\n\n# String methods\ntext = "  python is awesome!  "\nprint(text.strip().title())   # Python Is Awesome!\n\n# String joining\nwords = ["Hello", "World"]\nprint(" ".join(words))        # Hello World\n\n# f-strings with formatting\nname = "Alice"\nscore = 95.5\nprint(f"Student: {name:10} Score: {score:05.1f}")\n\n# Type conversion\ns = "42"\nn = int(s)\nprint(n * 2)  # 84\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-numbers-strings';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'String Processor',
E'Write a program that processes a user-provided sentence.\n\n**Starter code:**\n```python\nsentence = input("Enter a sentence: ")\n# Print:\n# 1. Number of characters\n# 2. Uppercase version\n# 3. Reversed sentence\n# 4. Words split into a list\n# Your code here\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-numbers-strings';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Python has dynamic typing — variables don''t declare their type\n- Numeric operators: `+`, `-`, `*`, `/`, `//`, `%`, `**`\n- Strings support many built-in methods\n- Slicing syntax: `string[start:stop:step]`\n- f-strings are the preferred string formatting method\n- `len()` returns the length of a sequence', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-numbers-strings';

-- py-lists-tuples (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Lists & Tuples',
E'Lists and tuples are ordered collections in Python. Lists are mutable (can be changed); tuples are immutable (cannot be changed after creation).', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-lists-tuples';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'List & Tuple Operations',
E'**Lists (mutable):**\n```python\nfruits = ["apple", "banana", "cherry"]\nfruits.append("date")      # add to end\nfruits.insert(1, "blueberry")  # insert at index\nfruits.remove("banana")    # remove by value\npopped = fruits.pop()      # remove and return last\nprint(fruits[0])           # indexing\nprint(fruits[-1])          # negative indexing\nprint(fruits[1:3])         # slicing\n```\n\n**Tuples (immutable):**\n```python\npoint = (3, 4)\nx, y = point              # unpacking\nprint(x)                  # 3\n\n# Tuples as dictionary keys\nlocations = {(0, 0): "origin", (1, 2): "target"}\n```\n\n**List methods:**\n```python\nnums = [3, 1, 4, 1, 5, 9, 2]\nnums.sort()               # in-place sort\nnums.reverse()            # reverse\nprint(nums.count(1))      # count occurrences\nprint(nums.index(4))      # find index\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-lists-tuples';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'List & Tuple Examples',
E'```python\n# Shopping list\ncart = []\ncart.append("milk")\ncart.append("bread")\ncart.append("eggs")\nprint("Cart:", cart)\n\nif "milk" in cart:\n    print("Milk is in the cart!")\n\ncart.remove("bread")\nprint("After removal:", cart)\n\n# Tuple unpacking\ncoordinates = [(1, 2), (3, 4), (5, 6)]\nfor x, y in coordinates:\n    print(f"Point ({x}, {y})")\n\n# List to tuple and back\nnums = [1, 2, 3]\nt = tuple(nums)           # (1, 2, 3)\nl = list(t)               # [1, 2, 3]\n\n# Nested lists\nmatrix = [\n    [1, 2, 3],\n    [4, 5, 6],\n    [7, 8, 9]\n]\nprint(matrix[1][2])       # 6\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-lists-tuples';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'List Operations',
E'Write a program that manages a list of numbers.\n\n**Starter code:**\n```python\nnumbers = [5, 2, 8, 1, 9, 3]\n# 1. Sort the list\n# 2. Add 7 to the end\n# 3. Remove the smallest number\n# 4. Print the sum of all numbers\n# 5. Create a tuple from the list\n# Your code here\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-lists-tuples';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Lists are mutable ordered collections: `[]`\n- Tuples are immutable ordered collections: `()`\n- Use `append()`, `insert()`, `remove()`, `pop()` to modify lists\n- Negative indices count from the end\n- Tuple unpacking: `x, y = (1, 2)`\n- Use `in` to check membership\n- `len()` works on both lists and tuples', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-lists-tuples';
-- ── Module: py-control ──

-- py-conditionals (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Conditional Logic in Python',
E'Python uses `if`, `elif`, and `else` for conditional branching. Indentation defines blocks — no curly braces or `endif` needed.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-conditionals';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'If/Elif/Else & Boolean Logic',
E'```python\nscore = 85\n\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelif score >= 70:\n    grade = "C"\nelse:\n    grade = "F"\n\nprint(f"Grade: {grade}")\n\n# Boolean operators\nage = 20\nhas_license = True\n\nif age >= 18 and has_license:\n    print("You can drive")\nelif age >= 18 and not has_license:\n    print("Get your license first")\nelse:\n    print("Too young")\n\n# Ternary (conditional expression)\nstatus = "adult" if age >= 18 else "minor"\n\n# Truthiness — falsy values\n# False, None, 0, "", [], {}, ()\nif not []:\n    print("Empty list is falsy")\n\n# Chained comparisons\nif 18 <= age < 65:\n    print("Working age")\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-conditionals';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Conditional Examples',
E'```python\n# Even/Odd with ternary\nn = 7\nresult = "even" if n % 2 == 0 else "odd"\nprint(f"{n} is {result}")\n\n# Nested conditionals\nx = 10\ny = 20\nif x > 5:\n    if y > 10:\n        print("Both conditions met")\n    else:\n        print("Only x is big")\nelse:\n    print("x is small")\n\n# Match-case (Python 3.10+)\ndef describe(value):\n    match value:\n        case 0:\n            return "zero"\n        case 1 | 2 | 3:\n            return "small"\n        case int():\n            return "integer"\n        case str():\n            return "string"\n        case _:\n            return "something else"\n\nprint(describe(42))  # integer\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-conditionals';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Conditionals Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-conditionals';

UPDATE lesson_sections SET metadata = '{"question": "What does this Python code print?\n\nx = 7\nif x % 2 == 0:\n    print(\"even\")\nelse:\n    print(\"odd\")", "options": ["even", "odd", "Error", "nothing"], "correct_index": 1, "explanation": "7 %% 2 is 1, which is not equal to 0, so the else branch executes and prints \"odd\"."}'::jsonb WHERE section_type = 'quiz' AND title = 'Conditionals Quiz';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- `if`/`elif`/`else` with colon and indented blocks\n- `and`, `or`, `not` for boolean logic\n- Falsy values: `False`, `None`, `0`, `""`, `[]`, `{}`, `()`\n- Ternary: `x if condition else y`\n- Chained comparisons: `a < x < b`\n- `match`/`case` (Python 3.10+) for pattern matching', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-conditionals';

-- py-loops (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Loops in Python',
E'Python has two loop types: `for` (iterating over sequences) and `while` (looping until a condition is False). Both support `break`, `continue`, and an optional `else` clause.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'For & While Loops',
E'**For loops:**\n```python\n# Range\nfor i in range(5):         # 0, 1, 2, 3, 4\n    print(i)\n\nfor i in range(2, 10, 3):  # 2, 5, 8\n    print(i)\n\n# Over a list\nfruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    print(fruit)\n\n# With index\nfor i, fruit in enumerate(fruits):\n    print(f"{i}: {fruit}")\n\n# Over a dictionary\nages = {"Alice": 30, "Bob": 25}\nfor name, age in ages.items():\n    print(f"{name} is {age}")\n```\n\n**While loops:**\n```python\ncount = 0\nwhile count < 5:\n    print(count)\n    count += 1\n\n# While with else (runs if no break)\nn = 0\nwhile n < 3:\n    print(n)\n    n += 1\nelse:\n    print("Loop ended normally")\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Loop Examples',
E'```python\n# Sum numbers up to N\ntotal = 0\nn = 100\nfor i in range(1, n + 1):\n    total += i\nprint(f"Sum 1 to {n}: {total}")\n\n# Find primes up to 50\nfor num in range(2, 51):\n    for i in range(2, int(num**0.5) + 1):\n        if num % i == 0:\n            break\n    else:\n        print(num, end=" ")\nprint()\n\n# While with sentinel\ntotal = 0\nwhile True:\n    value = input("Enter a number (q to quit): ")\n    if value.lower() == "q":\n        break\n    total += float(value)\nprint(f"Total: {total}")\n\n# Loop over two lists in parallel\nnames = ["Alice", "Bob", "Charlie"]\nscores = [85, 92, 78]\nfor name, score in zip(names, scores):\n    print(f"{name}: {score}")\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Python Loop Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-loops';

UPDATE lesson_sections SET metadata = '{"question": "How many times does this loop print?\n\nfor i in range(3):\n    print(i)", "options": ["2", "3", "4", "Infinite"], "correct_index": 1, "explanation": "range(3) generates 0, 1, 2 — three values, so the loop body runs 3 times."}'::jsonb WHERE section_type = 'quiz' AND title = 'Python Loop Quiz';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Loop Practice',
E'Write a program that asks the user to enter 5 numbers, stores them, and prints statistics.\n\n**Starter code:**\n```python\nnumbers = []\nfor i in range(5):\n    num = float(input(f"Enter number {i+1}: "))\n    numbers.append(num)\n# Print: sum, average, max, min\n# Your code here\n```', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-loops';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- `for item in sequence:` iterates over any iterable\n- `range(start, stop, step)` generates number sequences\n- `enumerate()` gives index + value pairs\n- `while condition:` loops until False\n- `break` exits the loop, `continue` skips to next iteration\n- `else` on loops runs only if no `break` occurred\n- `zip()` iterates over multiple sequences in parallel', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-loops';

-- ── Module: py-functions ──

-- py-def-functions (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Functions in Python',
E'Functions let you encapsulate reusable logic. Use the `def` keyword to define a function. Python functions support default arguments, keyword arguments, variable-length arguments, and annotations.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-functions' AND l.slug = 'py-def-functions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Function Syntax & Features',
E'```python\n# Basic function\ndef greet(name):\n    """Return a greeting message."""\n    return f"Hello, {name}!"\n\nprint(greet("Alice"))  # Hello, Alice!\n\n# Default arguments\ndef power(base, exp=2):\n    return base ** exp\n\nprint(power(3))     # 9\nprint(power(3, 3))  # 27\n\n# Keyword arguments\ndef describe(name, age, city):\n    print(f"{name} is {age}, from {city}")\n\ndescribe(age=25, name="Alice", city="London")\n\n# *args — variable positional arguments\ndef sum_all(*args):\n    return sum(args)\n\nprint(sum_all(1, 2, 3, 4))  # 10\n\n# **kwargs — variable keyword arguments\ndef print_info(**kwargs):\n    for key, value in kwargs.items():\n        print(f"{key}: {value}")\n\nprint_info(name="Alice", age=25)\n\n# Type annotations\ndef add(x: int, y: int) -> int:\n    return x + y\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-functions' AND l.slug = 'py-def-functions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Function Examples',
E'```python\n# Calculator functions\ndef add(a, b): return a + b\ndef subtract(a, b): return a - b\ndef multiply(a, b): return a * b\ndef divide(a, b):\n    if b == 0:\n        return "Cannot divide by zero"\n    return a / b\n\nprint(add(10, 5))        # 15\nprint(subtract(10, 5))   # 5\nprint(multiply(10, 5))   # 50\nprint(divide(10, 5))     # 2.0\n\n# Recursive function\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nprint([fibonacci(i) for i in range(10)])\n# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n\n# Returning multiple values\ndef min_max(nums):\n    return min(nums), max(nums)\n\nlow, high = min_max([3, 1, 4, 1, 5])\nprint(low, high)  # 1 5\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-functions' AND l.slug = 'py-def-functions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Py Functions Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-functions' AND l.slug = 'py-def-functions';

UPDATE lesson_sections SET metadata = '{"question": "What does this Python code return?\n\ndef add(a, b=5):\n    return a + b\n\nprint(add(3))", "options": ["8", "35", "Error", "None"], "correct_index": 0, "explanation": "b has a default value of 5. When add(3) is called, a=3 and b=5 (default), so 3 + 5 = 8."}'::jsonb WHERE section_type = 'quiz' AND title = 'Py Functions Quiz';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Define functions with `def name(params):`\n- Use `return` to send a value back to the caller\n- Default parameter values: `def f(x=10):`\n- `*args` captures extra positional args as a tuple\n- `**kwargs` captures extra keyword args as a dict\n- Functions can return multiple values as tuples\n- Docstrings document what the function does', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-functions' AND l.slug = 'py-def-functions';
-- py-scope-lambda (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Scope & Lambda',
E'Variable scope determines where a variable is accessible. Python follows the LEGB rule. Lambda functions are small anonymous functions that can be defined inline.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-functions' AND l.slug = 'py-scope-lambda';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'LEGB Scope & Lambda Syntax',
E'**LEGB Rule:**\n- **L**ocal — inside the current function\n- **E**nclosing — outer functions (closures)\n- **G**lobal — module level\n- **B**uilt-in — Python built-ins like `print`, `len`\n\n```python\nx = 10  # global\n\ndef outer():\n    y = 20  # enclosing\n    def inner():\n        z = 30  # local\n        print(x, y, z)\n    inner()\n\nouter()\n```\n\n**Global and nonlocal:**\n```python\ncount = 0\n\ndef increment():\n    global count\n    count += 1\n\ndef make_counter():\n    n = 0\n    def counter():\n        nonlocal n\n        n += 1\n        return n\n    return counter\n```\n\n**Lambda functions:**\n```python\nsquare = lambda x: x ** 2\nprint(square(5))  # 25\n\npairs = [(1, "one"), (3, "three"), (2, "two")]\npairs.sort(key=lambda pair: pair[0])\n\nnumbers = [1, 2, 3, 4, 5]\nevens = list(filter(lambda x: x % 2 == 0, numbers))\ndoubled = list(map(lambda x: x * 2, numbers))\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-functions' AND l.slug = 'py-scope-lambda';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Scope & Lambda Examples',
E'```python\n# Global scope example\nmessage = "Hello"\n\ndef greet(name):\n    message = "Hi"  # local — doesn''t change global\n    return f"{message}, {name}! "\n\nprint(greet("Alice"))  # Hi, Alice!\nprint(message)          # Hello (unchanged)\n\n# Closure with nonlocal\ndef make_multiplier(factor):\n    def multiply(x):\n        return x * factor\n    return multiply\n\ndouble = make_multiplier(2)\ntriple = make_multiplier(3)\nprint(double(5))  # 10\nprint(triple(5))  # 15\n\n# Lambda with sorted\nstudents = [\n    {"name": "Alice", "grade": 85},\n    {"name": "Bob", "grade": 72},\n    {"name": "Charlie", "grade": 95},\n]\nranked = sorted(students, key=lambda s: s["grade"], reverse=True)\nfor s in ranked:\n    print(f'{s["name"] }: {s["grade"] }')\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-functions' AND l.slug = 'py-scope-lambda';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Lambda & Scope Practice',
E'Create a list of tuples (name, age) and sort them using lambda.\n\n**Starter code:**\n```python\npeople = [("Alice", 30), ("Bob", 25), ("Charlie", 35)]\n# 1. Sort by age (ascending) using lambda\n# 2. Sort by name length using lambda\n# 3. Create a closure that greets by title\n# Your code here\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-functions' AND l.slug = 'py-scope-lambda';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- LEGB: Local → Enclosing → Global → Built-in\n- `global` inside a function modifies the module-level variable\n- `nonlocal` modifies variables in enclosing (nested) scope\n- Lambda: `lambda args: expression` — one-expression anonymous functions\n- Common with `sorted()`, `filter()`, `map()` as key functions\n- Closures are functions that capture enclosing scope variables', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-functions' AND l.slug = 'py-scope-lambda';

-- ═══════════════════════════════════════════════════════════════════════════
-- COURSE: DATA STRUCTURES IN GO
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Module: ds-arrays-slices ──

-- ds-array-basics (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Arrays vs Slices',
E'Go has two array-like types: fixed-size **arrays** and dynamic **slices**. Slices are far more common in practice — they are Go''s equivalent of dynamic arrays, built on top of arrays.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices' AND l.slug = 'ds-array-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Slice Internals & Operations',
E'**Array — fixed size:**\n```go\nvar arr [5]int = [5]int{1, 2, 3, 4, 5}\narr[0] = 10  // modify\n```\n\n**Slice — dynamic:**\n```go\nvar s []int = []int{1, 2, 3}\ns = append(s, 4, 5)\n\ns2 := make([]int, 3, 10)  // len=3, cap=10\nfmt.Println(len(s2), cap(s2))  // 3 10\n```\n\n**Slice header:**\n- **ptr** — pointer to underlying array\n- **len** — number of elements visible\n- **cap** — number available before reallocation\n\n**Sub-slicing (shares backing array):**\n```go\noriginal := []int{1, 2, 3, 4, 5}\nsub := original[1:4]     // [2, 3, 4]\nsub[0] = 99\nfmt.Println(original[1]) // 99 (shared!)\n\ncopied := make([]int, len(original))\ncopy(copied, original)\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices' AND l.slug = 'ds-array-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Slice Examples',
E'```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    var days [7]string = [7]string{\n        "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",\n    }\n    fmt.Println("Days:", days)\n\n    weekdays := days[0:5]\n    fmt.Println("Weekdays:", weekdays)\n\n    var nums []int\n    for i := 0; i < 10; i++ {\n        nums = append(nums, i)\n        fmt.Printf("len=%d cap=%d\\n", len(nums), cap(nums))\n    }\n\n    matrix := make([][]int, 3)\n    for i := range matrix {\n        matrix[i] = make([]int, 3)\n        for j := range matrix[i] {\n            matrix[i][j] = i*3 + j + 1\n        }\n    }\n    fmt.Println("Matrix:", matrix)\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices' AND l.slug = 'ds-array-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Slice Operations',
E'Write Go code that demonstrates slice growth and the sharing backing array issue.\n\n**Starter code:**\n```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Create a slice with make, len=3, cap=6\n    // Append 3 more elements\n    // Print len and cap before and after each append\n    // Show sub-slice modification affects original\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices' AND l.slug = 'ds-array-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Arrays have fixed length; slices are dynamic views over arrays\n- Use `make([]T, len, cap)` to pre-allocate slices\n- `append()` grows the slice, doubling capacity\n- Sub-slices share the backing array — use `copy()` to detach\n- Slices are described by a header: ptr, len, cap', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices' AND l.slug = 'ds-array-basics';

-- ds-slice-tricks (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Common Slice Patterns',
E'Certain slice operations are so common they have established patterns: copy, reverse, delete, filter, and deduplicate. Mastering these will make your Go code cleaner and more efficient.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices' AND l.slug = 'ds-slice-tricks';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Slice Tricks & Patterns',
E'**Delete element (preserve order):**\n```go\nfunc deleteAt[T any](s []T, i int) []T {\n    return append(s[:i], s[i+1:]...)\n}\n```\n\n**Filter:**\n```go\nfunc filter[T any](s []T, fn func(T) bool) []T {\n    var out []T\n    for _, v := range s {\n        if fn(v) {\n            out = append(out, v)\n        }\n    }\n    return out\n}\n```\n\n**Reverse in-place:**\n```go\nfunc reverse[T any](s []T) {\n    for i, j := 0, len(s)-1; i < j; i, j = i+1, j-1 {\n        s[i], s[j] = s[j], s[i]\n    }\n}\n```\n\n**Deduplicate (sorted):**\n```go\nfunc dedupSorted[T comparable](s []T) []T {\n    if len(s) == 0 { return s }\n    out := s[:1]\n    for _, v := range s[1:] {\n        if v != out[len(out)-1] {\n            out = append(out, v)\n        }\n    }\n    return out\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices' AND l.slug = 'ds-slice-tricks';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Slice Trick Examples',
E'```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    nums := []int{1, 2, 3, 4, 5, 6}\n    nums = append(nums[:2], nums[3:]...)\n    fmt.Println("After delete:", nums)\n\n    evens := filter(nums, func(n int) bool { return n%2 == 0 })\n    fmt.Println("Evens:", evens)\n\n    reverse(nums)\n    fmt.Println("Reversed:", nums)\n\n    dup := []int{1, 1, 2, 3, 3, 3, 4}\n    fmt.Println("Deduped:", dedupSorted(dup))\n}\n\nfunc filter[T any](s []T, fn func(T) bool) []T {\n    var out []T\n    for _, v := range s {\n        if fn(v) { out = append(out, v) }\n    }\n    return out\n}\n\nfunc reverse[T any](s []T) {\n    for i, j := 0, len(s)-1; i < j; i, j = i+1, j-1 {\n        s[i], s[j] = s[j], s[i]\n    }\n}\n\nfunc dedupSorted[T comparable](s []T) []T {\n    if len(s) == 0 { return s }\n    out := s[:1]\n    for _, v := range s[1:] {\n        if v != out[len(out)-1] { out = append(out, v) }\n    }\n    return out\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices' AND l.slug = 'ds-slice-tricks';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Slice Tricks Practice',
E'Implement a function that rotates a slice by k positions to the right.\n\n**Starter code:**\n```go\npackage main\n\nimport "fmt"\n\nfunc rotate(nums []int, k int) {\n    // Rotate the slice to the right by k positions\n}\n\nfunc main() {\n    nums := []int{1, 2, 3, 4, 5}\n    rotate(nums, 2)\n    fmt.Println(nums)  // [4 5 1 2 3]\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices' AND l.slug = 'ds-slice-tricks';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Delete: `append(s[:i], s[i+1:]...)`\n- Filter: iterate and collect matching elements\n- Reverse: swap pairs from both ends\n- Dedup (sorted): keep first, skip duplicates\n- These patterns are building blocks for algorithm problems', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-arrays-slices' AND l.slug = 'ds-slice-tricks';
-- ── Module: ds-maps ──

-- ds-map-basics (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Maps in Go',
E'Maps are Go''s built-in hash table data structure. They provide O(1) average-case lookups, inserts, and deletes. Maps are reference types — like slices, they are passed by reference.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-maps' AND l.slug = 'ds-map-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Map Operations & Patterns',
E'**Creating maps:**\n```go\n// Using make\nm := make(map[string]int)\n\n// Using literal\nm := map[string]int{"Alice": 30, "Bob": 25}\n```\n\n**Reading and writing:**\n```go\nm["Charlie"] = 35  // insert/update\nage := m["Alice\"]   // read (returns zero value if missing)\n\n// Comma-ok idiom\nage, ok := m["David\"]\nif !ok {\n    fmt.Println(\"David not found\")\n}\n\n// Delete\ndelete(m, \"Bob\")\n\n// Length\nfmt.Println(len(m))  // number of keys\n```\n\n**Iterating:**\n```go\nfor key, value := range m {\n    fmt.Printf(\"%s → %d\\n\", key, value)\n}\n\n// Keys only\nfor key := range m {\n    fmt.Println(key)\n}\n```\n\n**Important properties:**\n- Map iteration order is random\n- Maps are not comparable (can''t use == except with nil)\\n- The zero value is nil — writing to a nil map causes a panic', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-maps' AND l.slug = 'ds-map-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Map Examples',
E'```go\npackage main\n\nimport (\n    "fmt"\n    "sort"\n)\n\nfunc main() {\n    // Word frequency counter\n    text := "the quick brown fox jumps over the lazy dog"\n    freq := make(map[string]int)\n    words := strings.Fields(text)\n    for _, word := range words {\n        freq[word]++\n    }\n    fmt.Println("Word frequencies:", freq)\n\n    // Get keys in sorted order\n    keys := make([]string, 0, len(freq))\n    for k := range freq {\n        keys = append(keys, k)\n    }\n    sort.Strings(keys)\n    for _, k := range keys {\n        fmt.Printf("%s: %d\\n", k, freq[k])\n    }\n\n    // Comma-ok check\n    scores := map[string]int{\"Alice\": 95}\n    if score, ok := scores[\"Bob\"]; ok {\n        fmt.Println(\"Bob's score:\", score)\n    } else {\n        fmt.Println(\"Bob not found\")\n    }\n}\n', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-maps' AND l.slug = 'ds-map-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Maps Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-maps' AND l.slug = 'ds-map-basics';

UPDATE lesson_sections SET metadata = '{"question": "What does this Go code print?\n\nm := map[string]int{\"a\": 1}\nv, ok := m[\"b\"]\nfmt.Println(v, ok)", "options": ["0 false", "1 true", "0 true", "panic"], "correct_index": 0, "explanation": "When a key is not found in a Go map, the comma-ok idiom returns the zero value for the value type and false. For int, the zero value is 0."}'::jsonb WHERE section_type = 'quiz' AND title = 'Maps Quiz';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Map Frequency Counter',
E'Write a program that counts character frequencies in a string using a map.\n\n**Starter code:**\n```go\npackage main\n\nimport \"fmt\"\n\nfunc charFrequency(s string) map[rune]int {\n    // Return a map of character → count\n}\n\nfunc main() {\n    s := \"hello world\"\n    freq := charFrequency(s)\n    for char, count := range freq {\n        fmt.Printf(\"%c: %d\\n\", char, count)\n    }\n}\n```', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-maps' AND l.slug = 'ds-map-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Maps are reference types — use `make()` or literals to create\n- Comma-ok idiom: `value, ok := map[key]` to check existence\n- `delete(m, key)` removes an entry\n- Iteration order is random — sort keys for deterministic order\n- Never write to a nil map (causes panic)', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-maps' AND l.slug = 'ds-map-basics';

-- ds-structs (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Structs & Composition',
E'A struct is a collection of named fields. Go uses structs rather than classes — there is no inheritance, only composition via embedding.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-maps' AND l.slug = 'ds-structs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Defining & Using Structs',
E'**Basic struct:**\n```go\ntype Person struct {\n    Name string\n    Age  int\n}\n\np := Person{Name: \"Alice\", Age: 30}\nfmt.Println(p.Name)  // Alice\n```\n\n**Struct tags for JSON:**\n```go\ntype User struct {\n    ID    int    `json:\"id\"`\n    Email string `json:\"email\"`\n    Role  string `json:\"role,omitempty\"`\n}\n\n// Marshal to JSON\nuser := User{ID: 1, Email: \"a@b.com\"}\nb, _ := json.Marshal(user)\n// {"id":1,"email":"a@b.com"}\n```\n\n**Embedding (composition):**\n```go\ntype Address struct {\n    City, Country string\n}\n\ntype Person struct {\n    Name    string\n    Address // embedded — fields promoted\n}\n\np := Person{Name: \"Alice\", Address: Address{City: \"London\", Country: \"UK\"}}\nfmt.Println(p.City)  // promoted field!\n```\n\n**Constructor function pattern:**\n```go\nfunc NewPerson(name string, age int) *Person {\n    return &Person{Name: name, Age: age}\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-maps' AND l.slug = 'ds-structs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Struct Examples',
E'```go\npackage main\n\nimport (\n    "encoding/json"\n    "fmt"\n)\n\ntype Product struct {\n    Name  string  `json:\"name\"`\n    Price float64 `json:\"price\"`\n    Stock int     `json:\"stock\"`\n}\n\nfunc (p Product) TotalValue() float64 {\n    return p.Price * float64(p.Stock)\n}\n\nfunc main() {\n    p := Product{Name: \"Laptop\", Price: 999.99, Stock: 10}\n    fmt.Printf(\"Total value: $%.2f\\n\", p.TotalValue())\n\n    // JSON serialization\n    b, _ := json.MarshalIndent(p, \"\", \"  \")\n    fmt.Println(string(b))\n\n    // Composition\ntype Employee struct {\n    Person\n    Department string\n}\n\n    emp := Employee{\n        Person:     Person{Name: \"Alice\", Age: 30},\n        Department: \"Engineering\",\n    }\n    fmt.Println(emp.Name, emp.Department)\n}\n\ntype Person struct {\n    Name string\n    Age  int\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-maps' AND l.slug = 'ds-structs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Struct Practice',
E'Define a `Book` struct with title, author, year, and ISBN. Add a method to print book info.\n\n**Starter code:**\n```go\npackage main\n\nimport \"fmt\"\n\ntype Book struct {\n    // Your fields here\n}\n\nfunc (b Book) Info() string {\n    // Return formatted string\n}\n\nfunc main() {\n    b := Book{Title: \"Go Programming\", Author: \"Alice\", Year: 2024, ISBN: \"123-456\"}\n    fmt.Println(b.Info())\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-maps' AND l.slug = 'ds-structs';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Structs group related fields into a named type\n- Tags provide metadata (commonly for JSON serialization)\n- Embedding promotes fields and methods to the outer type\n- Go has composition over inheritance — use embedding\n- There are no classes, constructors, or inheritance in Go', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-maps' AND l.slug = 'ds-structs';

-- ── Module: ds-linked-lists ──

-- ds-singly-linked-list (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Singly Linked Lists',
E'A linked list is a linear data structure where each element (node) points to the next. Singly linked lists allow traversal in one direction — from head to tail.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-linked-lists' AND l.slug = 'ds-singly-linked-list';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Node Structure & Operations',
E'**Node definition:**\n```go\ntype Node struct {\n    Value int\n    Next  *Node\n}\n\ntype LinkedList struct {\n    Head *Node\n    Len  int\n}\n```\n\n**Insert at head:**\n```go\nfunc (l *LinkedList) InsertAtHead(value int) {\n    l.Head = &Node{Value: value, Next: l.Head}\n    l.Len++\n}\n```\n\n**Insert at tail:**\n```go\nfunc (l *LinkedList) InsertAtTail(value int) {\n    if l.Head == nil {\n        l.Head = &Node{Value: value}\n    } else {\n        current := l.Head\n        for current.Next != nil {\n            current = current.Next\n        }\n        current.Next = &Node{Value: value}\n    }\n    l.Len++\n}\n```\n\n**Delete by value:**\n```go\nfunc (l *LinkedList) Delete(value int) {\n    if l.Head == nil { return }\n    if l.Head.Value == value {\n        l.Head = l.Head.Next\n        l.Len--\n        return\n    }\n    current := l.Head\n    for current.Next != nil && current.Next.Value != value {\n        current = current.Next\n    }\n    if current.Next != nil {\n        current.Next = current.Next.Next\n        l.Len--\n    }\n}\n```\n\n**Traversal:**\n```go\nfunc (l *LinkedList) Traverse() []int {\n    var result []int\n    current := l.Head\n    for current != nil {\n        result = append(result, current.Value)\n        current = current.Next\n    }\n    return result\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-linked-lists' AND l.slug = 'ds-singly-linked-list';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Linked List Examples',
E'```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    list := &LinkedList{}\n    list.InsertAtHead(3)\n    list.InsertAtHead(2)\n    list.InsertAtHead(1)\n    fmt.Println(list.Traverse())\n\n    list.InsertAtTail(4)\n    fmt.Println(list.Traverse())\n\n    list.Delete(2)\n    fmt.Println(list.Traverse())\n\n    // Reverse\n    list.Head = reverseList(list.Head)\n    fmt.Println(list.Traverse())\n}\n\nfunc reverseList(head *Node) *Node {\n    var prev *Node\n    curr := head\n    for curr != nil {\n        next := curr.Next\n        curr.Next = prev\n        prev = curr\n        curr = next\n    }\n    return prev\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-linked-lists' AND l.slug = 'ds-singly-linked-list';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Linked List Practice',
E'Implement a method to find the middle node of a singly linked list using the two-pointer technique.\n\n**Starter code:**\n```go\nfunc (l *LinkedList) FindMiddle() *Node {\n    // Use slow and fast pointers\n    // Return the middle node\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-linked-lists' AND l.slug = 'ds-singly-linked-list';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Nodes contain value and pointer to next node\n- Insert at head is O(1); insert at tail is O(n)\n- Traversal follows Next pointers until nil\n- Reversal updates Next pointers to opposite direction\n- Two-pointer technique finds middle efficiently', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-linked-lists' AND l.slug = 'ds-singly-linked-list';

-- ds-doubly-linked-list (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Doubly Linked Lists',
E'A doubly linked list has nodes with pointers to both the next and previous nodes. This enables bidirectional traversal and O(1) deletion if you have a reference to the node.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-linked-lists' AND l.slug = 'ds-doubly-linked-list';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Doubly Linked List Structure',
E'**Node definition:**\n```go\ntype DNode struct {\n    Value int\n    Prev  *DNode\n    Next  *DNode\n}\n\ntype DoublyLinkedList struct {\n    Head *DNode\n    Tail *DNode\n    Len  int\n}\n```\n\n**Insert at head:**\n```go\nfunc (d *DoublyLinkedList) InsertAtHead(value int) {\n    node := &DNode{Value: value, Next: d.Head}\n    if d.Head != nil {\n        d.Head.Prev = node\n    } else {\n        d.Tail = node\n    }\n    d.Head = node\n    d.Len++\n}\n```\n\n**Insert at tail:**\n```go\nfunc (d *DoublyLinkedList) InsertAtTail(value int) {\n    node := &DNode{Value: value, Prev: d.Tail}\n    if d.Tail != nil {\n        d.Tail.Next = node\n    } else {\n        d.Head = node\n    }\n    d.Tail = node\n    d.Len++\n}\n```\n\n**Delete node (O(1) with reference):**\n```go\nfunc (d *DoublyLinkedList) Remove(node *DNode) {\n    if node.Prev != nil {\n        node.Prev.Next = node.Next\n    } else {\n        d.Head = node.Next\n    }\n    if node.Next != nil {\n        node.Next.Prev = node.Prev\n    } else {\n        d.Tail = node.Prev\n    }\n    d.Len--\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-linked-lists' AND l.slug = 'ds-doubly-linked-list';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Doubly Linked List Examples',
E'```go\nfunc main() {\n    dll := &DoublyLinkedList{}\n    dll.InsertAtTail(1)\n    dll.InsertAtTail(2)\n    dll.InsertAtTail(3)\n\n    // Forward traversal\n    for curr := dll.Head; curr != nil; curr = curr.Next {\n        fmt.Print(curr.Value, " ")\n    }\n    fmt.Println()\n\n    // Backward traversal\n    for curr := dll.Tail; curr != nil; curr = curr.Prev {\n        fmt.Print(curr.Value, " ")\n    }\n    fmt.Println()\n\n    // Remove middle node\n    dll.Remove(dll.Head.Next)  // removes 2\n    fmt.Println(dll.Head.Next.Value)  // 3\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-linked-lists' AND l.slug = 'ds-doubly-linked-list';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Doubly Linked List Practice',
E'Implement an LRU cache eviction policy using a doubly linked list. The most recently accessed item moves to the head.\n\n**Starter code:**\n```go\ntype LRUCache struct {\n    capacity int\n    items    map[int]*DNode\n    list     *DoublyLinkedList\n}\n\nfunc (c *LRUCache) Get(key int) int {\n    // Move accessed node to head, return value\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-linked-lists' AND l.slug = 'ds-doubly-linked-list';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Each node has prev and next pointers\n- Insert and delete at both ends are O(1)\n- Deletion with node reference is O(1)\n- Used in LRU caches, browser history, and text editors\n- Extra memory per node for the prev pointer', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-linked-lists' AND l.slug = 'ds-doubly-linked-list';
-- ── Module: ds-trees-graphs ──

-- ds-binary-trees (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Binary Trees & BST',
E'A binary tree is a hierarchical data structure where each node has at most two children. A Binary Search Tree (BST) maintains the invariant: left < parent < right.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-trees-graphs' AND l.slug = 'ds-binary-trees';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Tree Traversal & BST Operations',
E'**Node definition:**\n```go\ntype TreeNode struct {\n    Value int\n    Left  *TreeNode\n    Right *TreeNode\n}\n```\n\n**Inorder traversal (Left → Root → Right):**\n```go\nfunc inorder(node *TreeNode) {\n    if node == nil { return }\n    inorder(node.Left)\n    fmt.Println(node.Value)\n    inorder(node.Right)\n}\n```\n\n**BST Insert:**\n```go\nfunc insert(root *TreeNode, value int) *TreeNode {\n    if root == nil {\n        return &TreeNode{Value: value}\n    }\n    if value < root.Value {\n        root.Left = insert(root.Left, value)\n    } else {\n        root.Right = insert(root.Right, value)\n    }\n    return root\n}\n```\n\n**BST Search:**\n```go\nfunc search(root *TreeNode, value int) bool {\n    if root == nil { return false }\n    if value == root.Value { return true }\n    if value < root.Value {\n        return search(root.Left, value)\n    }\n    return search(root.Right, value)\n}\n```\n\n**Level-order (BFS):**\n```go\nfunc levelOrder(root *TreeNode) [][]int {\n    result := [][]int{}\n    queue := []*TreeNode{root}\n    for len(queue) > 0 {\n        level := []int{}\n        for _, n := range queue {\n            level = append(level, n.Value)\n        }\n        result = append(result, level)\n        // next level\n    }\n    return result\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-trees-graphs' AND l.slug = 'ds-binary-trees';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Tree Examples',
E'```go\nfunc main() {\n    var root *TreeNode\n    values := []int{5, 3, 7, 2, 4, 6, 8}\n    for _, v := range values {\n        root = insert(root, v)\n    }\n\n    fmt.Print(\"Inorder: \")\n    inorder(root)\n    fmt.Println()\n\n    fmt.Println(\"Search 4:\", search(root, 4))\n    fmt.Println(\"Search 9:\", search(root, 9))\n\n    fmt.Println(\"Level-order:\", levelOrder(root))\n}\n```\n\n**Output:**\n```\nInorder: 2 3 4 5 6 7 8\nSearch 4: true\nSearch 9: false\nLevel-order: [[5] [3 7] [2 4 6 8]]\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-trees-graphs' AND l.slug = 'ds-binary-trees';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'BST Practice',
E'Implement a function to find the minimum value in a BST.\n\n**Starter code:**\n```go\nfunc findMin(root *TreeNode) int {\n    // The minimum is the leftmost node\n}\n\nfunc findMax(root *TreeNode) int {\n    // The maximum is the rightmost node\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-trees-graphs' AND l.slug = 'ds-binary-trees';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Binary tree: each node has 0, 1, or 2 children\n- BST: left < parent < right for O(log n) operations\n- Traversal orders: inorder, preorder, postorder, level-order\n- Recursive insert and search are natural for trees\n- Balanced vs unbalanced trees affect performance', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-trees-graphs' AND l.slug = 'ds-binary-trees';

-- ds-graph-basics (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Graph Fundamentals',
E'A graph consists of vertices (nodes) and edges connecting them. Graphs can be directed or undirected, weighted or unweighted. They model networks, relationships, and paths.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-trees-graphs' AND l.slug = 'ds-graph-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Graph Representations & Traversal',
E'**Adjacency List (most common):**\n```go\ntype Graph struct {\n    vertices int\n    edges    map[int][]int\n}\n\nfunc NewGraph(v int) *Graph {\n    return &Graph{\n        vertices: v,\n        edges:    make(map[int][]int),\n    }\n}\n\nfunc (g *Graph) AddEdge(u, v int) {\n    g.edges[u] = append(g.edges[u], v)\n    g.edges[v] = append(g.edges[v], v) // undirected\n}\n```\n\n**DFS (Depth-First Search):**\n```go\nfunc (g *Graph) DFS(start int) []int {\n    visited := make(map[int]bool)\n    result := []int{}\n    var dfs func(v int)\n    dfs = func(v int) {\n        visited[v] = true\n        result = append(result, v)\n        for _, neighbor := range g.edges[v] {\n            if !visited[neighbor] {\n                dfs(neighbor)\n            }\n        }\n    }\n    dfs(start)\n    return result\n}\n```\n\n**BFS (Breadth-First Search):**\n```go\nfunc (g *Graph) BFS(start int) []int {\n    visited := make(map[int]bool)\n    queue := []int{start}\n    result := []int{}\n    visited[start] = true\n    for len(queue) > 0 {\n        v := queue[0]\n        queue = queue[1:]\n        result = append(result, v)\n        for _, neighbor := range g.edges[v] {\n            if !visited[neighbor] {\n                visited[neighbor] = true\n                queue = append(queue, neighbor)\n            }\n        }\n    }\n    return result\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-trees-graphs' AND l.slug = 'ds-graph-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Graph Examples',
E'```go\nfunc main() {\n    g := NewGraph(6)\n    g.AddEdge(0, 1)\n    g.AddEdge(0, 2)\n    g.AddEdge(1, 3)\n    g.AddEdge(1, 4)\n    g.AddEdge(2, 5)\n\n    fmt.Println(\"DFS:\", g.DFS(0))\n    fmt.Println(\"BFS:\", g.BFS(0))\n\n    // Cycle detection\n    fmt.Println(\"Has cycle:\", g.HasCycle())\n}\n\nfunc (g *Graph) HasCycle() bool {\n    visited := make(map[int]bool)\n    inStack := make(map[int]bool)\n    \n    var dfs func(v int) bool\n    dfs = func(v int) bool {\n        visited[v] = true\n        inStack[v] = true\n        for _, neighbor := range g.edges[v] {\n            if !visited[neighbor] {\n                if dfs(neighbor) { return true }\n            } else if inStack[neighbor] {\n                return true\n            }\n        }\n        inStack[v] = false\n        return false\n    }\n    \n    for i := 0; i < g.vertices; i++ {\n        if !visited[i] {\n            if dfs(i) { return true }\n        }\n    }\n    return false\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-trees-graphs' AND l.slug = 'ds-graph-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Graph Practice',
E'Implement a function that finds all connected components in an undirected graph.\n\n**Starter code:**\n```go\nfunc (g *Graph) ConnectedComponents() [][]int {\n    // Return all connected components\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-trees-graphs' AND l.slug = 'ds-graph-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Adjacency list is the most common graph representation\n- DFS uses recursion or stack; explores deep before wide\n- BFS uses a queue; finds shortest paths in unweighted graphs\n- `HasCycle` uses visit tracking + recursion stack\n- Connected components = number of DFS/BFS runs needed', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-trees-graphs' AND l.slug = 'ds-graph-basics';
-- ═══════════════════════════════════════════════════════════════════════════
-- COURSE: PYTHON INTERMEDIATE
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Module: py-errors ──

-- py-try-except (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Exception Handling',
E'Errors happen. Python''s exception handling with `try`/`except`/`else`/`finally` lets you manage errors gracefully without crashing your program.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-errors' AND l.slug = 'py-try-except';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Try/Except/Else/Finally',
E'**Basic try/except:**\n```python\ntry:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")\n```\n\n**Catching specific exceptions:**\n```python\ntry:\n    num = int(input("Enter a number: \"))\n    result = 100 / num\nexcept ValueError:\n    print("That was not a valid number")\nexcept ZeroDivisionError:\n    print("Number cannot be zero")\nexcept Exception as e:\n    print(f"Unexpected error: {e}")\n```\n\n**Else and Finally:**\n```python\ntry:\n    f = open("data.txt", "r")\n    content = f.read()\nexcept FileNotFoundError:\n    print("File not found")\nelse:\n    print(f"Read {len(content)} characters")\n    # Runs only if no exception\nfinally:\n    f.close()\n    # Always runs\n```\n\n**Raising exceptions:**\n```python\ndef withdraw(balance, amount):\n    if amount > balance:\n        raise ValueError(f"Insufficient funds: {amount} > {balance}")\n    return balance - amount\n```\n\n**Assert statement:**\n```python\ndef divide(a, b):\n    assert b != 0, "Division by zero"\n    return a / b\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-errors' AND l.slug = 'py-try-except';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Exception Handling Examples',
E'```python\n# Robust input handler\ndef get_number():\n    while True:\n        try:\n            num = int(input("Enter a number: \"))\n            return num\n        except ValueError:\n            print("Invalid input, try again")\n\n# File operations with error handling\nfilenames = ["data.txt", "missing.txt", "config.json"]\nfor fname in filenames:\n    try:\n        with open(fname) as f:\n            print(f.read()[:50])\n    except FileNotFoundError:\n        print(f"{fname} not found, skipping")\n    except PermissionError:\n        print(f"No permission to read {fname}")\n\n# Chaining exceptions (Python 3.11+)\ntry:\n    raise ValueError("original error")\nexcept ValueError as e:\n    raise RuntimeError("wrapped error") from e\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-errors' AND l.slug = 'py-try-except';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Exception Practice',
E'Write a function that safely parses a list of strings into integers, skipping invalid entries.\n\n**Starter code:**\n```python\ndef parse_ints(values: list[str]) -> list[int]:\n    # Convert strings to ints, skip invalid\n    # Return list of valid integers\n    pass\n\n# Test\nprint(parse_ints(["1", "2", "abc", "3", "xyz"]))\n# Expected: [1, 2, 3]\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-errors' AND l.slug = 'py-try-except';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- `try`/`except` catches exceptions; catch specific types first\n- `else` runs when no exception occurred\n- `finally` always runs (cleanup)\n- `raise` triggers an exception; `assert` is a debugging aid\n- Catch specific exceptions, not bare `except:`', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-errors' AND l.slug = 'py-try-except';

-- py-custom-exceptions (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Custom Exceptions & Context Managers',
E'Creating custom exception classes and using context managers (`with` statements) are essential Python patterns for writing clean, maintainable code.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-errors' AND l.slug = 'py-custom-exceptions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Custom Exceptions & Context Manager Protocol',
E'**Custom exceptions:**\n```python\nclass InsufficientFundsError(Exception):\n    """Raised when an account has insufficient funds."""\n    def __init__(self, balance, amount):\n        self.balance = balance\n        self.amount = amount\n        super().__init__(f"Insufficient funds: {balance} < {amount}")\n\nclass Account:\n    def __init__(self):\n        self.balance = 0\n    \n    def deposit(self, amount):\n        self.balance += amount\n    \n    def withdraw(self, amount):\n        if amount > self.balance:\n            raise InsufficientFundsError(self.balance, amount)\n        self.balance -= amount\n```\n\n**Context manager protocol (__enter__/__exit__):**\n```python\nclass ManagedFile:\n    def __init__(self, filename):\n        self.filename = filename\n    \n    def __enter__(self):\n        self.file = open(self.filename, "w")\n        return self.file\n    \n    def __exit__(self, exc_type, exc_val, exc_tb):\n        if self.file:\n            self.file.close()\n        return False  # don''t suppress exceptions\n\nwith ManagedFile("test.txt") as f:\n    f.write("Hello, context manager!")\n```\n\n**Using contextlib:**\n```python\nfrom contextlib import contextmanager\n\n@contextmanager\ndef managed_file(filename):\n    f = open(filename, "w")\n    try:\n        yield f\n    finally:\n        f.close()\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-errors' AND l.slug = 'py-custom-exceptions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Custom Exception Examples',
E'```python\n# Custom exception hierarchy\nclass DatabaseError(Exception):\n    pass\n\nclass ConnectionError(DatabaseError):\n    pass\n\nclass QueryError(DatabaseError):\n    def __init__(self, query, message):\n        self.query = query\n        super().__init__(f"{message}: {query}")\n\ndef execute_query(query):\n    if "DROP\" in query.upper():\n        raise QueryError(query, \"Destructive query blocked\")\n    return f"Executed: {query}\"\n\n# Context manager for database connection\nclass DatabaseConnection:\n    def __enter__(self):\n        print(\"Connecting to database...\")\n        return self\n    \n    def __exit__(self, *args):\n        print(\"Closing connection...\")\n        return False\n    \n    def query(self, sql):\n        return execute_query(sql)\n\nwith DatabaseConnection() as db:\n    print(db.query(\"SELECT * FROM users\"))\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-errors' AND l.slug = 'py-custom-exceptions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Custom Exception Practice',
E'Create a `BankAccount` class with a custom `OverdraftError` exception.\n\n**Starter code:**\n```python\nclass OverdraftError(Exception):\n    pass\n\nclass BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n    \n    def withdraw(self, amount):\n        # Raise OverdraftError if insufficient funds\n        pass\n    \n    def __enter__(self):\n        return self\n    \n    def __exit__(self, *args):\n        print(f\"Account closed. Final balance: {self.balance}\")\n        return False\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-errors' AND l.slug = 'py-custom-exceptions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Create custom exceptions by subclassing `Exception`\n- Custom exceptions can carry extra data (balance, query, etc.)\n- Context managers use `__enter__`/`__exit__` protocol\n- `contextlib.contextmanager` decorator for generator-based managers\n- `with` ensures cleanup even if exceptions occur', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-errors' AND l.slug = 'py-custom-exceptions';

-- ── Module: py-comprehensions ──

-- py-list-comprehensions (6 sections = add quiz)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'List/Dict/Set Comprehensions',
E'Comprehensions provide a concise way to create collections by iterating over sequences with optional filtering. They are more readable and faster than equivalent for-loop code.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions' AND l.slug = 'py-list-comprehensions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Comprehension Syntax',
E'**List comprehension:**\n```python\nsquares = [x**2 for x in range(10)]\n# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]\n\nevens = [x for x in range(20) if x % 2 == 0]\n# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]\n```\n\n**Dict comprehension:**\n```python\nsquare_dict = {x: x**2 for x in range(5)}\n# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}\n\nwords = [\"hello\", \"world\", \"python\"]\nword_lengths = {w: len(w) for w in words}\n# {\"hello\": 5, \"world\": 5, \"python\": 6}\n```\n\n**Set comprehension:**\n```python\nunique_lengths = {len(w) for w in words}\n# {5, 6}\n```\n\n**Nested comprehensions:**\n```python\nmatrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nflat = [x for row in matrix for x in row]\n# [1, 2, 3, 4, 5, 6, 7, 8, 9]\n```\n\n**Conditional (ternary in comprehension):**\n```python\nlabels = [\"even\" if x % 2 == 0 else \"odd\" for x in range(5)]\n# [\"even\", \"odd\", \"even\", \"odd\", \"even\"]\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions' AND l.slug = 'py-list-comprehensions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Comprehension Examples',
E'```python\n# Filter even squares\nresult = [x**2 for x in range(20) if x % 2 == 0]\nprint(result)\n\n# Map names to lengths, filter short names\nnames = [\"Alice\", \"Bob\", \"Charlie\", \"Diana\"]\nlong_names = {name: len(name) for name in names if len(name) > 4}\nprint(long_names)  # {\"Alice\": 5, \"Charlie\": 7, \"Diana\": 5}\n\n# Flatten matrix\nmatrix = [[1, 2], [3, 4], [5, 6]]\nflat = [x for row in matrix for x in row]\nprint(flat)  # [1, 2, 3, 4, 5, 6]\n\n# Transpose matrix\ntransposed = [[row[i] for row in matrix] for i in range(2)]\nprint(transposed)  # [[1, 3, 5], [2, 4, 6]]\n\n# Prime numbers with comprehension\ndef is_prime(n):\n    return n > 1 and all(n % i != 0 for i in range(2, int(n**0.5) + 1))\n\nprimes = [x for x in range(2, 50) if is_prime(x)]\nprint(primes)\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions' AND l.slug = 'py-list-comprehensions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Comprehensions Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions' AND l.slug = 'py-list-comprehensions';

UPDATE lesson_sections SET metadata = '{"question": "What does this list comprehension produce?\n\n[x for x in range(10) if x % 3 == 0]", "options": ["[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]", "[0, 3, 6, 9]", "[3, 6, 9]", "[1, 3, 6, 9]"], "correct_index": 1, "explanation": "x %% 3 == 0 filters for numbers divisible by 3. In range(10), these are 0, 3, 6, and 9."}'::jsonb WHERE section_type = 'quiz' AND title = 'Comprehensions Quiz';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Comprehension Practice',
E'Write comprehensions to solve these problems.\n\n**Starter code:**\n```python\nnumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\n\n# 1. Squares of all numbers\nevens = [x**2 for x in numbers if x % 2 == 0]\n\n# 2. Dict mapping number to \"even\" or \"odd\"\nparity = {x: \"even\" if x % 2 == 0 else \"odd\" for x in numbers}\n\n# 3. Set of unique characters in a string\nunique = {char for char in \"hello world\" if char != \" \"}\n\nprint(evens)\nprint(parity)\nprint(unique)\n```', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions' AND l.slug = 'py-list-comprehensions';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Comprehension: `[expr for item in iterable if condition]`\n- Dict comprehension: `{key: value for item in iterable}`\n- Set comprehension: `{expr for item in iterable}`\n- Nested comprehensions: `[x for row in matrix for x in row]`\n- Comprehensions are faster and more readable than loops', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions' AND l.slug = 'py-list-comprehensions';
-- py-generators (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Generators & Itertools',
E'Generators produce values lazily — one at a time on demand. They are memory-efficient for large sequences and enable infinite streams. The `itertools` module provides powerful iterator building blocks.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions' AND l.slug = 'py-generators';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Generators & Itertools',
E'**Generator functions (yield):**\n```python\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\nfor num in fibonacci(10):\n    print(num)\n# 0 1 1 2 3 5 8 13 21 34\n```\n\n**Generator expressions:**\n```python\nsquares = (x**2 for x in range(10))\nprint(next(squares))  # 0\nprint(next(squares))  # 1\nprint(list(squares))  # [4, 9, 16, 25, 36, 49, 64, 81]\n```\n\n**Useful itertools:**\n```python\nfrom itertools import count, cycle, repeat, chain, permutations\n\n# Infinite counter\nfor i in count(10):  # 10, 11, 12, ...\n    if i > 15: break\n\n# Cycle through a sequence\nfor item in cycle(\"AB\"):  # A, B, A, B, ...\n    break  # would be infinite\n\n# Chain iterables\ncombined = chain([1, 2], [3, 4])  # 1, 2, 3, 4\n\n# Permutations\nperms = list(permutations(\"ABC\", 2))\n# [(\"A\", \"B\"), (\"A\", \"C\"), (\"B\", \"A\"), (\"B\", \"C\"), (\"C\", \"A\"), (\"C\", \"B\")]\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions' AND l.slug = 'py-generators';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Generator Examples',
E'```python\nfrom itertools import groupby, product, combinations\n\n# Generators for large files — read line by line\ndef read_large_file(filename):\n    with open(filename) as f:\n        for line in f:\n            yield line.strip()\n\n# Infinite generator\ndef odd_numbers():\n    n = 1\n    while True:\n        yield n\n        n += 2\n\nodds = odd_numbers()\nfirst_10 = [next(odds) for _ in range(10)]\nprint(first_10)  # [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]\n\n# Groupby\ndata = [(\"A\", 1), (\"A\", 2), (\"B\", 3), (\"B\", 4)]\nfor key, group in groupby(data, key=lambda x: x[0]):\n    print(f\"{key}: {list(group)}\")\n\n# Product (cartesian product)\nprint(list(product([1, 2], [\"a\", \"b\"])))\n# [(1, \"a\"), (1, \"b\"), (2, \"a\"), (2, \"b\")]\n\n# Combinations\nprint(list(combinations(\"ABC\", 2)))\n# [(\"A\", \"B\"), (\"A\", \"C\"), (\"B\", \"C\")]\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions' AND l.slug = 'py-generators';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Generator Practice',
E'Write a generator that yields prime numbers indefinitely.\n\n**Starter code:**\n```python\ndef prime_generator():\n    \"\"\"Yield prime numbers one by one.\"\"\"\n    pass\n\nprimes = prime_generator()\nfirst_10 = [next(primes) for _ in range(10)]\nprint(first_10)  # [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions' AND l.slug = 'py-generators';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Generators use `yield` and produce values lazily\n- Generator expressions: `(x for x in iterable)`\n- Memory efficient — one item at a time\n- `itertools`: `count`, `cycle`, `chain`, `product`, `permutations`, `groupby`\n- Infinite generators are possible with `while True`', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions' AND l.slug = 'py-generators';

-- ── Module: py-file-io ──

-- py-file-reading (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'File I/O in Python',
E'Python makes file I/O easy with the built-in `open()` function and the `with` statement for automatic resource management. Understanding the different file modes is essential.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io' AND l.slug = 'py-file-reading';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'File Modes & Operations',
E'**File modes:**\n- `"r"` — read (default)\n- `"w"` — write (overwrite)\n- `"a"` — append\n- `"r+"` — read and write\n- `"b"` — binary mode (add to other modes: `"rb"`, `"wb"`)\n\n**Reading files:**\n```python\nwith open(\"data.txt\", \"r\") as f:\n    content = f.read()         # entire file as string\n    lines = f.readlines()      # list of lines\n    for line in f:             # iterate line by line\n        print(line.strip())\n```\n\n**Writing files:**\n```python\nwith open(\"output.txt\", \"w\") as f:\n    f.write(\"Hello, file!\\n\")\n    f.writelines([\"line1\\n\", \"line2\\n\"])\n```\n\n**Binary mode:**\n```python\nwith open(\"image.png\", \"rb\") as f:\n    data = f.read()  # bytes object\n\nwith open(\"copy.png\", \"wb\") as f:\n    f.write(data)\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io' AND l.slug = 'py-file-reading';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'File I/O Examples',
E'```python\n# Write multiple lines\nwith open(\"notes.txt\", \"w\") as f:\n    for i in range(1, 6):\n        f.write(f\"Note #{i}\\n\")\n\n# Read and process\nwith open(\"notes.txt\", \"r\") as f:\n    for line in f:\n        print(f\"Read: {line.strip()}\")\n\n# Append to existing file\nwith open(\"notes.txt\", \"a\") as f:\n    f.write(\"Additional note\\n\")\n\n# Copy file with context managers\nwith open(\"source.txt\", \"r\") as src, open(\"dest.txt\", \"w\") as dst:\n    for line in src:\n        dst.write(line.upper())\n\n# Working with CSV-like data\ndata = [\"name,age,city\", \"Alice,30,London\", \"Bob,25,Paris\"]\nwith open(\"people.csv\", \"w\") as f:\n    f.write(\"\\n\".join(data))\n\nwith open(\"people.csv\", \"r\") as f:\n    for line in f:\n        fields = line.strip().split(\",\")\n        print(fields)\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io' AND l.slug = 'py-file-reading';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'File I/O Practice',
E'Write a program that reads a text file and counts lines, words, and characters.\n\n**Starter code:**\n```python\ndef count_file(filename):\n    \"\"\"Return (lines, words, chars) for a file.\"\"\"\n    pass\n\n# Test with a file\nresult = count_file(\"sample.txt\")\nprint(f\"Lines: {result[0]}, Words: {result[1]}, Chars: {result[2]}\")\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io' AND l.slug = 'py-file-reading';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Use `open(filename, mode)` to open files\n- Always use `with open(...) as f:` for auto-closing\n- Modes: "r" (read), "w" (write), "a" (append), "rb" (read binary)\n- Read entire file: `f.read()`, read lines: `f.readlines()`\n- Write: `f.write(string)`, `f.writelines(list)`', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io' AND l.slug = 'py-file-reading';

-- py-pathlib-json (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Pathlib & JSON',
E'The `pathlib` module provides an object-oriented approach to filesystem paths. The `json` module handles JSON serialization and deserialization — essential for data exchange.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io' AND l.slug = 'py-pathlib-json';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Pathlib & JSON Operations',
E'**Pathlib basics:**\n```python\nfrom pathlib import Path\n\n# Create path\np = Path(\"/home/user/documents/file.txt\")\n\n# Path components\nprint(p.parent)     # /home/user/documents\nprint(p.name)       # file.txt\nprint(p.stem)       # file\nprint(p.suffix)     # .txt\n\n# Directory operations\ncurrent = Path(\".\")\nfor f in current.iterdir():\n    print(f)\n\n# Glob pattern matching\nfor py_file in current.glob(\"*.py\"):\n    print(py_file)\n\n# Read/write\nPath(\"hello.txt\").write_text(\"Hello, pathlib!\")\ncontent = Path(\"hello.txt\").read_text()\n```\n\n**JSON module:**\n```python\nimport json\n\n# Python → JSON string\ndata = {\"name\": \"Alice\", \"scores\": [95, 87, 91]}\njson_str = json.dumps(data, indent=2)\nprint(json_str)\n\n# JSON string → Python\nparsed = json.loads(json_str)\nprint(parsed[\"name\"])\n\n# Read JSON from file\nwith open(\"data.json\", \"r\") as f:\n    data = json.load(f)\n\n# Write JSON to file\nwith open(\"output.json\", \"w\") as f:\n    json.dump(data, f, indent=2)\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io' AND l.slug = 'py-pathlib-json';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Pathlib & JSON Examples',
E'```python\nimport json\nfrom pathlib import Path\n\n# Process all JSON files in a directory\ndata_dir = Path(\"data\")\ndata_dir.mkdir(exist_ok=True)\n\n# Create sample data\nsamples = [\n    {\"id\": 1, \"name\": \"Alice\", \"active\": True},\n    {\"id\": 2, \"name\": \"Bob\", \"active\": False},\n]\n\n# Write each as separate JSON file\nfor item in samples:\n    path = data_dir / f\"{item['\''id'\'']}.json\"\n    path.write_text(json.dumps(item, indent=2))\n    print(f\"Created: {path}\")\n\n# Read all JSON files\nfor json_file in data_dir.glob(\"*.json\"):\n    data = json.loads(json_file.read_text())\n    print(f\"{json_file.name}: {data['\''name'\'']}\")\n\n# Path operationsp = Path(\"temp/notes.txt\")\np.parent.mkdir(parents=True, exist_ok=True)\np.write_text(\"Hello\")\nprint(f\"Size: {p.stat().st_size} bytes\")\nprint(f\"Exists: {p.exists()}\")\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io' AND l.slug = 'py-pathlib-json';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Pathlib & JSON Practice',
E'Write a script that reads a JSON config file and processes it using pathlib.\n\n**Starter code:**\n```python\nimport json\nfrom pathlib import Path\n\ndef load_config(config_path: str) -> dict:\n    \"\"\"Load and validate a JSON config file.\"\"\"\n    path = Path(config_path)\n    if not path.exists():\n        return {\"error\": \"File not found\"}\n    # Load and return JSON data\n    pass\n\n# Test\nconfig = load_config(\"config.json\")\nprint(config)\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io' AND l.slug = 'py-pathlib-json';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- `pathlib.Path` provides object-oriented path handling\n- Common methods: `.read_text()`, `.write_text()`, `.glob()`, `.iterdir()`\n- JSON: `json.dumps()` (Python→string), `json.loads()` (string→Python)\n- File: `json.dump()` and `json.load()` for file I/O\n- `indent` parameter for pretty-printed JSON', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io' AND l.slug = 'py-pathlib-json';
-- ═══════════════════════════════════════════════════════════════════════════
-- COURSE: ALGORITHMS
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Module: alg-sorting ──

-- sorting-basics (6 sections = include quiz)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Sorting Fundamentals',
E'Sorting arranges elements in a specific order (ascending/descending). Understanding basic sorting algorithms — bubble, selection, insertion — builds intuition for algorithm analysis.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-sorting' AND l.slug = 'sorting-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Bubble, Selection & Insertion Sort',
E'**Bubble Sort — O(n²):**\n```go\nfunc bubbleSort(arr []int) {\n    n := len(arr)\n    for i := 0; i < n-1; i++ {\n        swapped := false\n        for j := 0; j < n-i-1; j++ {\n            if arr[j] > arr[j+1] {\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n                swapped = true\n            }\n        }\n        if !swapped { break }\n    }\n}\n```\n\n**Selection Sort — O(n²):**\n```go\nfunc selectionSort(arr []int) {\n    for i := 0; i < len(arr)-1; i++ {\n        minIdx := i\n        for j := i + 1; j < len(arr); j++ {\n            if arr[j] < arr[minIdx] {\n                minIdx = j\n            }\n        }\n        arr[i], arr[minIdx] = arr[minIdx], arr[i]\n    }\n}\n```\n\n**Insertion Sort — O(n²) average, O(n) best:**\n```go\nfunc insertionSort(arr []int) {\n    for i := 1; i < len(arr); i++ {\n        key := arr[i]\n        j := i - 1\n        for j >= 0 && arr[j] > key {\n            arr[j+1] = arr[j]\n            j--\n        }\n        arr[j+1] = key\n    }\n}\n```\n\n**Complexity comparison:**\n| Algorithm | Best | Average | Worst | Space | Stable |\n|-----------|------|---------|-------|-------|--------|\n| Bubble | O(n) | O(n²) | O(n²) | O(1) | Yes |\n| Selection | O(n²) | O(n²) | O(n²) | O(1) | No |\n| Insertion | O(n) | O(n²) | O(n²) | O(1) | Yes |', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-sorting' AND l.slug = 'sorting-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Sorting Examples',
E'```go\nfunc main() {\n    arr1 := []int{64, 34, 25, 12, 22, 11, 90}\n    bubbleSort(arr1)\n    fmt.Println(\"Bubble:\", arr1)\n\n    arr2 := []int{64, 25, 12, 22, 11}\n    selectionSort(arr2)\n    fmt.Println(\"Selection:\", arr2)\n\n    arr3 := []int{12, 11, 13, 5, 6}\n    insertionSort(arr3)\n    fmt.Println(\"Insertion:\", arr3)\n}\n\n// Output:\n// Bubble: [11 12 22 25 34 64 90]\n// Selection: [11 12 22 25 64]\n// Insertion: [5 6 11 12 13]\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-sorting' AND l.slug = 'sorting-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Sorting Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-sorting' AND l.slug = 'sorting-basics';

UPDATE lesson_sections SET metadata = '{"question": "What is the time complexity of insertion sort on an already sorted array?", "options": ["O(1)", "O(n)", "O(n log n)", "O(n²)"], "correct_index": 1, "explanation": "Insertion sort runs in O(n) on an already sorted array because the inner while loop never executes — each element is already in the correct position."}'::jsonb WHERE section_type = 'quiz' AND title = 'Sorting Quiz';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Sorting Practice',
E'Implement a function that sorts an array using bubble sort but optimises to early-exit when no swaps occur.\n\n**Starter code:**\n```go\nfunc bubbleSortOptimised(arr []int) {\n    // Your implementation\n}\n\nfunc main() {\n    nums := []int{5, 2, 8, 1, 9}\n    bubbleSortOptimised(nums)\n    fmt.Println(nums)\n}\n```', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-sorting' AND l.slug = 'sorting-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Bubble sort: repeatedly swap adjacent elements if out of order\n- Selection sort: find minimum and swap into position\n- Insertion sort: build sorted array one element at a time\n- All three are O(n²) on average — fine for small datasets\n- Insertion sort performs well on nearly-sorted data (O(n))', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-sorting' AND l.slug = 'sorting-basics';

-- sorting-compare (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Divide & Conquer Sorting',
E'Merge sort and quicksort use divide-and-conquer to achieve O(n log n) average time complexity. They are the practical workhorses of real-world sorting.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-sorting' AND l.slug = 'sorting-compare';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Merge Sort & Quicksort',
E'**Merge Sort — O(n log n), O(n) space:**\n```go\nfunc mergeSort(arr []int) []int {\n    if len(arr) <= 1 { return arr }\n    mid := len(arr) / 2\n    left := mergeSort(arr[:mid])\n    right := mergeSort(arr[mid:])\n    return merge(left, right)\n}\n\nfunc merge(left, right []int) []int {\n    result := make([]int, 0, len(left)+len(right))\n    i, j := 0, 0\n    for i < len(left) && j < len(right) {\n        if left[i] <= right[j] {\n            result = append(result, left[i])\n            i++\n        } else {\n            result = append(result, right[j])\n            j++\n        }\n    }\n    result = append(result, left[i:]...)\n    result = append(result, right[j:]...)\n    return result\n}\n```\n\n**Quicksort — O(n log n) average, O(n²) worst, O(log n) space:**\n```go\nfunc quickSort(arr []int, low, high int) {\n    if low < high {\n        p := partition(arr, low, high)\n        quickSort(arr, low, p-1)\n        quickSort(arr, p+1, high)\n    }\n}\n\nfunc partition(arr []int, low, high int) int {\n    pivot := arr[high]\n    i := low - 1\n    for j := low; j < high; j++ {\n        if arr[j] < pivot {\n            i++\n            arr[i], arr[j] = arr[j], arr[i]\n        }\n    }\n    arr[i+1], arr[high] = arr[high], arr[i+1]\n    return i + 1\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-sorting' AND l.slug = 'sorting-compare';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Sorting Comparison',
E'```go\nfunc main() {\n    data := []int{38, 27, 43, 3, 9, 82, 10}\n    sorted := mergeSort(data)\n    fmt.Println(\"Merge sort:\", sorted)\n\n    data2 := []int{38, 27, 43, 3, 9, 82, 10}\n    quickSort(data2, 0, len(data2)-1)\n    fmt.Println(\"Quick sort:\", data2)\n\n    // Benchmark comparison\n    n := 10000\n    nums1 := rand.Perm(n)\n    nums2 := make([]int, n)\n    copy(nums2, nums1)\n\n    start := time.Now()\n    mergeSort(nums1)\n    fmt.Println(\"Merge sort:\", time.Since(start))\n\n    start = time.Now()\n    quickSort(nums2, 0, n-1)\n    fmt.Println(\"Quick sort:\", time.Since(start))\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-sorting' AND l.slug = 'sorting-compare';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Implement Merge Sort',
E'Complete the merge function used by merge sort.\n\n**Starter code:**\n```go\nfunc merge(left, right []int) []int {\n    result := make([]int, 0, len(left)+len(right))\n    i, j := 0, 0\n    // Merge elements in sorted order\n    // Add remaining elements\n    return result\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-sorting' AND l.slug = 'sorting-compare';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Merge sort: O(n log n), stable, requires O(n) extra space\n- Quicksort: O(n log n) average, O(n²) worst, in-place\n- Partition picks a pivot and rearranges elements around it\n- Merge sort is preferred for linked lists and stable sorting\n- Quicksort is preferred for arrays with good pivot selection', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-sorting' AND l.slug = 'sorting-compare';
-- ── Module: alg-searching ──

-- linear-binary (6 sections = include quiz)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Searching Algorithms',
E'Searching is a fundamental operation. Linear search works on any data but is O(n). Binary search requires sorted data but achieves O(log n) — exponentially faster for large datasets.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-searching' AND l.slug = 'linear-binary';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Linear & Binary Search',
E'**Linear Search — O(n):**\n```go\nfunc linearSearch(arr []int, target int) int {\n    for i, v := range arr {\n        if v == target {\n            return i\n        }\n    }\n    return -1\n}\n```\n\n**Binary Search — O(log n):**\n```go\nfunc binarySearch(arr []int, target int) int {\n    left, right := 0, len(arr)-1\n    for left <= right {\n        mid := left + (right-left)/2\n        if arr[mid] == target {\n            return mid\n        } else if arr[mid] < target {\n            left = mid + 1\n        } else {\n            right = mid - 1\n        }\n    }\n    return -1\n}\n```\n\n**Binary search variations:**\n```go\n// First occurrence (lower bound)\nfunc findFirst(arr []int, target int) int {\n    left, right := 0, len(arr)-1\n    result := -1\n    for left <= right {\n        mid := left + (right-left)/2\n        if arr[mid] == target {\n            result = mid\n            right = mid - 1  // keep searching left\n        } else if arr[mid] < target {\n            left = mid + 1\n        } else {\n            right = mid - 1\n        }\n    }\n    return result\n}\n```\n\n**Recursive binary search:**\n```go\nfunc binarySearchRecursive(arr []int, target, left, right int) int {\n    if left > right { return -1 }\n    mid := left + (right-left)/2\n    if arr[mid] == target { return mid }\n    if arr[mid] < target {\n        return binarySearchRecursive(arr, target, mid+1, right)\n    }\n    return binarySearchRecursive(arr, target, left, mid-1)\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-searching' AND l.slug = 'linear-binary';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Search Examples',
E'```go\nfunc main() {\n    arr := []int{2, 5, 8, 12, 16, 23, 38, 56, 72, 91}\n\n    fmt.Println(\"Linear search 23:\", linearSearch(arr, 23))\n    fmt.Println(\"Binary search 23:\", binarySearch(arr, 23))\n    fmt.Println(\"Binary search 99:\", binarySearch(arr, 99))\n\n    // First/last occurrence\n    duplicates := []int{1, 2, 2, 2, 3, 4, 4, 5}\n    fmt.Println(\"First 2 at:\", findFirst(duplicates, 2))\n    fmt.Println(\"Last 4 at:\", findLast(duplicates, 4))\n}\n\nfunc findLast(arr []int, target int) int {\n    left, right := 0, len(arr)-1\n    result := -1\n    for left <= right {\n        mid := left + (right-left)/2\n        if arr[mid] == target {\n            result = mid\n            left = mid + 1  // keep searching right\n        } else if arr[mid] < target {\n            left = mid + 1\n        } else {\n            right = mid - 1\n        }\n    }\n    return result\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-searching' AND l.slug = 'linear-binary';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'Search Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-searching' AND l.slug = 'linear-binary';

UPDATE lesson_sections SET metadata = '{"question": "How many elements can binary search check in at most 10 iterations?", "options": ["100", "512", "1024", "10000"], "correct_index": 2, "explanation": "Binary search eliminates half the remaining elements each iteration. After 10 iterations it can handle up to 2¹⁰ = 1024 elements."}'::jsonb WHERE section_type = 'quiz' AND title = 'Search Quiz';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Binary Search Practice',
E'Implement binary search recursively.\n\n**Starter code:**\n```go\nfunc binarySearch(arr []int, target int) int {\n    // Recursive implementation\n}\n\nfunc main() {\n    arr := []int{1, 3, 5, 7, 9, 11, 13}\n    fmt.Println(binarySearch(arr, 7))  // 3\n    fmt.Println(binarySearch(arr, 4))  // -1\n}\n```', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-searching' AND l.slug = 'linear-binary';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Linear search: O(n), works on unsorted data\n- Binary search: O(log n), requires sorted data\n- `mid = left + (right-left)/2` avoids integer overflow\n- First/last occurrence: continue searching after a match\n- Binary search halves the search space each iteration', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-searching' AND l.slug = 'linear-binary';

-- search-advanced (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Advanced Search',
E'Real-world search problems go beyond simple sorted arrays. Rotated arrays, finding boundaries, and interpolation search expand the binary search toolkit.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-searching' AND l.slug = 'search-advanced';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Advanced Search Patterns',
E'**Search in rotated sorted array:**\n```go\nfunc searchRotated(arr []int, target int) int {\n    left, right := 0, len(arr)-1\n    for left <= right {\n        mid := left + (right-left)/2\n        if arr[mid] == target { return mid }\n\n        // Left half is sorted\n        if arr[left] <= arr[mid] {\n            if target >= arr[left] && target < arr[mid] {\n                right = mid - 1\n            } else {\n                left = mid + 1\n            }\n        } else {\n            // Right half is sorted\n            if target > arr[mid] && target <= arr[right] {\n                left = mid + 1\n            } else {\n                right = mid - 1\n            }\n        }\n    }\n    return -1\n}\n```\n\n**Interpolation search — O(log log n) average:**\n```go\nfunc interpolationSearch(arr []int, target int) int {\n    left, right := 0, len(arr)-1\n    for left <= right && target >= arr[left] && target <= arr[right] {\n        pos := left + ((target - arr[left]) * (right - left)) / (arr[right] - arr[left])\n        if arr[pos] == target { return pos }\n        if arr[pos] < target { left = pos + 1 } else { right = pos - 1 }\n    }\n    return -1\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-searching' AND l.slug = 'search-advanced';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Advanced Search Examples',
E'```go\nfunc main() {\n    // Rotated array\n    rotated := []int{4, 5, 6, 7, 0, 1, 2}\n    fmt.Println(\"Search 0:\", searchRotated(rotated, 0))  // 4\n    fmt.Println(\"Search 3:\", searchRotated(rotated, 3))  // -1\n\n    // Find peak element\n    peaks := []int{1, 2, 3, 5, 4, 3, 2}\n    fmt.Println(\"Peak:\", findPeak(peaks))  // 3 (value 5)\n\n    // Interpolation search\n    uniform := []int{10, 20, 30, 40, 50, 60, 70}\n    fmt.Println(\"Interpolation:\", interpolationSearch(uniform, 50))\n}\n\nfunc findPeak(arr []int) int {\n    left, right := 0, len(arr)-1\n    for left < right {\n        mid := left + (right-left)/2\n        if arr[mid] > arr[mid+1] {\n            right = mid\n        } else {\n            left = mid + 1\n        }\n    }\n    return left\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-searching' AND l.slug = 'search-advanced';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Rotated Search',
E'Complete the function to find the minimum element in a rotated sorted array.\n\n**Starter code:**\n```go\nfunc findMin(nums []int) int {\n    // Find the minimum in a rotated sorted array\n    // e.g., [4,5,6,7,0,1,2] → 0\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-searching' AND l.slug = 'search-advanced';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Rotated array search: identify which half is sorted, search accordingly\n- Interpolation search: probes at likely position (uniformly distributed data)\n- Peak finding: binary search variant comparing mid with mid+1\n- Advanced binary search handles complex conditions with O(log n)', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-searching' AND l.slug = 'search-advanced';

-- ── Module: alg-dp ──

-- dp-intro (6 sections = include quiz)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Introduction to DP',
E'Dynamic Programming (DP) solves complex problems by breaking them into overlapping subproblems. It is applicable when a problem has optimal substructure and overlapping subproblems.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-dp' AND l.slug = 'dp-intro';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Memoization & Tabulation',
E'**Top-down (memoization):** Fibonacci\n```go\nvar memo = make(map[int]int)\n\nfunc fib(n int) int {\n    if n <= 1 { return n }\n    if val, ok := memo[n]; ok { return val }\n    memo[n] = fib(n-1) + fib(n-2)\n    return memo[n]\n}\n```\n\n**Bottom-up (tabulation):** Fibonacci\n```go\nfunc fibTab(n int) int {\n    if n <= 1 { return n }\n    dp := make([]int, n+1)\n    dp[0], dp[1] = 0, 1\n    for i := 2; i <= n; i++ {\n        dp[i] = dp[i-1] + dp[i-2]\n    }\n    return dp[n]\n}\n```\n\n**Space optimisation:**\n```go\nfunc fibOpt(n int) int {\n    if n <= 1 { return n }\n    a, b := 0, 1\n    for i := 2; i <= n; i++ {\n        a, b = b, a+b\n    }\n    return b\n}\n```\n\n**Climbing stairs — count ways to reach n:**\n```go\nfunc climbStairs(n int) int {\n    if n <= 2 { return n }\n    dp := make([]int, n+1)\n    dp[1], dp[2] = 1, 2\n    for i := 3; i <= n; i++ {\n        dp[i] = dp[i-1] + dp[i-2]\n    }\n    return dp[n]\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-dp' AND l.slug = 'dp-intro';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'DP Examples',
E'```go\nfunc main() {\n    // Compare performance\n    n := 40\n    start := time.Now()\n    fmt.Println(\"fib(40) =\", fib(n))\n    fmt.Println(\"Memoization:\", time.Since(start))\n\n    start = time.Now()\n    fmt.Println(\"fibTab(40) =\", fibTab(n))\n    fmt.Println(\"Tabulation:\", time.Since(start))\n\n    // Grid traveller\n    fmt.Println(\"2×3 grid paths:\", gridTraveler(2, 3))  // 3\n    fmt.Println(\"3×3 grid paths:\", gridTraveler(3, 3))  // 6\n}\n\nfunc gridTraveler(m, n int) int {\n    memo := make(map[[2]int]int)\n    var travel func(m, n int) int\n    travel = func(m, n int) int {\n        if m == 1 || n == 1 { return 1 }\n        key := [2]int{m, n}\n        if val, ok := memo[key]; ok { return val }\n        memo[key] = travel(m-1, n) + travel(m, n-1)\n        return memo[key]\n    }\n    return travel(m, n)\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-dp' AND l.slug = 'dp-intro';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'quiz', 'DP Quiz',
E'', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-dp' AND l.slug = 'dp-intro';

UPDATE lesson_sections SET metadata = '{"question": "How many distinct ways can you climb a 3-step staircase (1 or 2 steps at a time)?", "options": ["2", "3", "4", "5"], "correct_index": 1, "explanation": "To reach step 3: 1+1+1, 1+2, 2+1 — that is 3 distinct ways. This follows the Fibonacci pattern: climbStairs(3) = climbStairs(2) + climbStairs(1) = 2 + 1 = 3."}'::jsonb WHERE section_type = 'quiz' AND title = 'DP Quiz';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'DP Practice',
E'Solve the grid traveller problem using tabulation (bottom-up).\n\n**Starter code:**\n```go\nfunc gridTravelerTab(m, n int) int {\n    // Create 2D DP table\n    // dp[i][j] = ways to reach (i, j)\n}\n```', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-dp' AND l.slug = 'dp-intro';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- DP = Recursion + Memoization (top-down) or Tabulation (bottom-up)\n- Overlapping subproblems: same subproblem solved multiple times\n- Optimal substructure: optimal solution uses optimal sub-solutions\n- Memoization: cache results of expensive function calls\n- Tabulation: fill a table iteratively from base cases', 6
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-dp' AND l.slug = 'dp-intro';
-- dp-patterns (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Classic DP Problems',
E'This lesson covers classic DP problems that appear frequently in assessments: 0/1 knapsack, longest common subsequence (LCS), edit distance, coin change, and subset sum.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-dp' AND l.slug = 'dp-patterns';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Common DP Patterns',
E'**0/1 Knapsack — O(n×W):**\n```go\nfunc knapsack(weights, values []int, capacity int) int {\n    n := len(weights)\n    dp := make([][]int, n+1)\n    for i := range dp {\n        dp[i] = make([]int, capacity+1)\n    }\n    for i := 1; i <= n; i++ {\n        for w := 0; w <= capacity; w++ {\n            if weights[i-1] <= w {\n                dp[i][w] = max(values[i-1]+dp[i-1][w-weights[i-1]], dp[i-1][w])\n            } else {\n                dp[i][w] = dp[i-1][w]\n            }\n        }\n    }\n    return dp[n][capacity]\n}\n```\n\n**Longest Common Subsequence — O(m×n):**\n```go\nfunc lcs(text1, text2 string) int {\n    m, n := len(text1), len(text2)\n    dp := make([][]int, m+1)\n    for i := range dp {\n        dp[i] = make([]int, n+1)\n    }\n    for i := 1; i <= m; i++ {\n        for j := 1; j <= n; j++ {\n            if text1[i-1] == text2[j-1] {\n                dp[i][j] = dp[i-1][j-1] + 1\n            } else {\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n            }\n        }\n    }\n    return dp[m][n]\n}\n```\n\n**Coin Change — minimum coins for amount:**\n```go\nfunc coinChange(coins []int, amount int) int {\n    dp := make([]int, amount+1)\n    for i := range dp {\n        dp[i] = amount + 1  // max value\n    }\n    dp[0] = 0\n    for i := 1; i <= amount; i++ {\n        for _, coin := range coins {\n            if coin <= i {\n                dp[i] = min(dp[i], dp[i-coin]+1)\n            }\n        }\n    }\n    if dp[amount] > amount { return -1 }\n    return dp[amount]\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-dp' AND l.slug = 'dp-patterns';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'DP Pattern Examples',
E'```go\nfunc main() {\n    // Knapsack\n    weights := []int{2, 3, 4, 5}\n    values := []int{3, 4, 5, 6}\n    fmt.Println(\"Knapsack (cap=5):\", knapsack(weights, values, 5))  // 7\n\n    // LCS\n    fmt.Println(\"LCS(abcde, ace):\", lcs(\"abcde\", \"ace\"))  // 3\n\n    // Coin change\n    fmt.Println(\"Coin change (1,2,5 → 11):\", coinChange([]int{1,2,5}, 11))  // 3\n\n    // Subset sum\n    nums := []int{3, 34, 4, 12, 5, 2}\n    fmt.Println(\"Subset sum (9):\", subsetSum(nums, 9))  // true\n}\n\nfunc subsetSum(nums []int, target int) bool {\n    dp := make([]bool, target+1)\n    dp[0] = true\n    for _, num := range nums {\n        for i := target; i >= num; i-- {\n            if dp[i-num] { dp[i] = true }\n        }\n    }\n    return dp[target]\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-dp' AND l.slug = 'dp-patterns';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Knapsack Practice',
E'Implement the 0/1 knapsack using a 1D DP array (space-optimised).\n\n**Starter code:**\n```go\nfunc knapsackOptimised(weights, values []int, capacity int) int {\n    dp := make([]int, capacity+1)\n    // Your implementation here\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-dp' AND l.slug = 'dp-patterns';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- 0/1 Knapsack: dp[i][w] = max(include, exclude)\n- LCS: if match → dp[i-1][j-1]+1, else → max(left, up)\n- Coin Change: min over all coin choices\n- Subset Sum: boolean DP, iterate target backward for 0/1\n- Many hard problems reduce to these patterns', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-dp' AND l.slug = 'dp-patterns';

-- ── Module: alg-graphs ──

-- graph-basics (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Graph Traversal Algorithms',
E'Graph traversal — DFS and BFS — is the foundation of graph algorithms. Topological sorting orders vertices in a DAG, and bipartite checking identifies two-colourable graphs.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-graphs' AND l.slug = 'graph-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'DFS, BFS & Topological Sort',
E'**Graph representation (weighted adjacency list):**\n```go\ntype Edge struct {\n    To     int\n    Weight int\n}\n\ntype Graph struct {\n    V   int\n    Adj [][]Edge\n}\n\nfunc NewGraph(v int) *Graph {\n    g := &Graph{V: v, Adj: make([][]Edge, v)}\n    return g\n}\n\nfunc (g *Graph) AddEdge(u, v, w int) {\n    g.Adj[u] = append(g.Adj[u], Edge{v, w})\n}\n```\n\n**DFS (iterative):**\n```go\nfunc (g *Graph) DFS(start int) []int {\n    visited := make([]bool, g.V)\n    stack := []int{start}\n    result := []int{}\n    for len(stack) > 0 {\n        v := stack[len(stack)-1]\n        stack = stack[:len(stack)-1]\n        if visited[v] { continue }\n        visited[v] = true\n        result = append(result, v)\n        for _, e := range g.Adj[v] {\n            if !visited[e.To] {\n                stack = append(stack, e.To)\n            }\n        }\n    }\n    return result\n}\n```\n\n**Topological Sort (Kahn''s algorithm):**\n```go\nfunc (g *Graph) TopologicalSort() []int {\n    inDegree := make([]int, g.V)\n    for u := 0; u < g.V; u++ {\n        for _, e := range g.Adj[u] {\n            inDegree[e.To]++\n        }\n    }\n    queue := []int{}\n    for i := 0; i < g.V; i++ {\n        if inDegree[i] == 0 { queue = append(queue, i) }\n    }\n    result := []int{}\n    for len(queue) > 0 {\n        u := queue[0]\n        queue = queue[1:]\n        result = append(result, u)\n        for _, e := range g.Adj[u] {\n            inDegree[e.To]--\n            if inDegree[e.To] == 0 { queue = append(queue, e.To) }\n        }\n    }\n    return result\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-graphs' AND l.slug = 'graph-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Graph Traversal Examples',
E'```go\nfunc main() {\n    g := NewGraph(6)\n    g.AddEdge(5, 2, 1)\n    g.AddEdge(5, 0, 1)\n    g.AddEdge(4, 0, 1)\n    g.AddEdge(4, 1, 1)\n    g.AddEdge(2, 3, 1)\n    g.AddEdge(3, 1, 1)\n\n    fmt.Println(\"Topological sort:\", g.TopologicalSort())\n\n    // Bipartite check\n    bg := NewGraph(4)\n    bg.AddEdge(0, 1, 1)\n    bg.AddEdge(1, 2, 1)\n    bg.AddEdge(2, 3, 1)\n    bg.AddEdge(3, 0, 1)\n    fmt.Println(\"Is bipartite:\", bg.IsBipartite())\n}\n\nfunc (g *Graph) IsBipartite() bool {\n    colors := make([]int, g.V)\n    for i := range colors { colors[i] = -1 }\n    for i := 0; i < g.V; i++ {\n        if colors[i] == -1 {\n            colors[i] = 0\n            queue := []int{i}\n            for len(queue) > 0 {\n                u := queue[0]\n                queue = queue[1:]\n                for _, e := range g.Adj[u] {\n                    if colors[e.To] == -1 {\n                        colors[e.To] = 1 - colors[u]\n                        queue = append(queue, e.To)\n                    } else if colors[e.To] == colors[u] {\n                        return false\n                    }\n                }\n            }\n        }\n    }\n    return true\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-graphs' AND l.slug = 'graph-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'Topological Sort',
E'Implement topological sort using DFS (instead of Kahn''s algorithm).\n\n**Starter code:**\n```go\nfunc (g *Graph) TopologicalSortDFS() []int {\n    visited := make([]bool, g.V)\n    result := []int{}\n    var dfs func(v int)\n    dfs = func(v int) {\n        // Mark visited, recurse neighbors, prepend to result\n    }\n    for i := 0; i < g.V; i++ {\n        if !visited[i] { dfs(i) }\n    }\n    return result\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-graphs' AND l.slug = 'graph-basics';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- DFS explores deep; BFS explores wide (shortest paths in unweighted)\n- Topological sort: Kahn''s (BFS) or DFS with post-order\n- Bipartite graph can be 2-coloured — check with BFS\n- DAGs have at least one topological order\n- Cycle detection: in-degree 0 removal finds cycles if not all processed', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-graphs' AND l.slug = 'graph-basics';
-- graph-algorithms (5 sections)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Shortest Paths & MST',
E'Finding shortest paths in weighted graphs and constructing minimum spanning trees are fundamental graph problems with numerous real-world applications.', 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-graphs' AND l.slug = 'graph-algorithms';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Dijkstra, Bellman-Ford & MST',
E'**Dijkstra — shortest path (no negative edges) — O((V+E) log V):**\n```go\nfunc (g *Graph) Dijkstra(src int) []int {\n    dist := make([]int, g.V)\n    visited := make([]bool, g.V)\n    for i := range dist { dist[i] = math.MaxInt32 }\n    dist[src] = 0\n\n    for count := 0; count < g.V-1; count++ {\n        u := minDistance(dist, visited)\n        visited[u] = true\n        for _, e := range g.Adj[u] {\n            if !visited[e.To] && dist[u] != math.MaxInt32 &&\n                dist[u]+e.Weight < dist[e.To] {\n                dist[e.To] = dist[u] + e.Weight\n            }\n        }\n    }\n    return dist\n}\n```\n\n**DSU (Union-Find):**\n```go\ntype DSU struct {\n    parent, rank []int\n}\n\nfunc NewDSU(n int) *DSU {\n    parent := make([]int, n)\n    for i := range parent { parent[i] = i }\n    return &DSU{parent, make([]int, n)}\n}\n\nfunc (d *DSU) Find(x int) int {\n    if d.parent[x] != x {\n        d.parent[x] = d.Find(d.parent[x])  // path compression\n    }\n    return d.parent[x]\n}\n\nfunc (d *DSU) Union(x, y int) {\n    xRoot, yRoot := d.Find(x), d.Find(y)\n    if xRoot == yRoot { return }\n    if d.rank[xRoot] < d.rank[yRoot] {\n        d.parent[xRoot] = yRoot\n    } else if d.rank[xRoot] > d.rank[yRoot] {\n        d.parent[yRoot] = xRoot\n    } else {\n        d.parent[yRoot] = xRoot\n        d.rank[xRoot]++\n    }\n}\n```\n\n**Kruskal''s MST — O(E log E):**\n```go\ntype Edge struct{ Src, Dst, Weight int }\n\nfunc kruskal(v int, edges []Edge) int {\n    sort.Slice(edges, func(i, j int) bool {\n        return edges[i].Weight < edges[j].Weight\n    })\n    dsu := NewDSU(v)\n    cost := 0\n    for _, e := range edges {\n        if dsu.Find(e.Src) != dsu.Find(e.Dst) {\n            dsu.Union(e.Src, e.Dst)\n            cost += e.Weight\n        }\n    }\n    return cost\n}\n```', 2
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-graphs' AND l.slug = 'graph-algorithms';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'examples', 'Shortest Path & MST Examples',
E'```go\nfunc main() {\n    g := NewGraph(5)\n    g.AddEdge(0, 1, 4)\n    g.AddEdge(0, 2, 1)\n    g.AddEdge(2, 1, 2)\n    g.AddEdge(1, 3, 1)\n    g.AddEdge(2, 3, 5)\n    g.AddEdge(3, 4, 3)\n\n    fmt.Println(\"Dijkstra from 0:\", g.Dijkstra(0))\n    // [0, 3, 1, 4, 7]\n\n    // Kruskal MST\n    edges := []Edge{\n        {0, 1, 10}, {0, 2, 6}, {0, 3, 5},\n        {1, 3, 15}, {2, 3, 4},\n    }\n    fmt.Println(\"MST cost:\", kruskal(4, edges))  // 19\n}\n\nfunc minDistance(dist []int, visited []bool) int {\n    min := math.MaxInt32\n    minIdx := -1\n    for v := 0; v < len(dist); v++ {\n        if !visited[v] && dist[v] <= min {\n            min = dist[v]\n            minIdx = v\n        }\n    }\n    return minIdx\n}\n```', 3
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-graphs' AND l.slug = 'graph-algorithms';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'exercise', 'MST Practice',
E'Implement Prim''s algorithm for MST.\n\n**Starter code:**\n```go\nfunc primMST(g *Graph) int {\n    // Prim''s algorithm for minimum spanning tree\n}\n```', 4
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-graphs' AND l.slug = 'graph-algorithms';

INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'summary', 'Key Takeaways',
E'- Dijkstra: O((V+E) log V), no negative edges\n- Bellman-Ford: O(VE), handles negative edges, detects negative cycles\n- Floyd-Warshall: O(V³), all-pairs shortest paths\n- DSU: near O(α(n)) with path compression + union by rank\n- Kruskal: O(E log E), uses DSU; Prim: O(V²) or O(E log V)', 5
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'algorithms' AND m.slug = 'alg-graphs' AND l.slug = 'graph-algorithms';

-- ============================================================================
-- STEP 4: INSERT PROJECTS
-- ============================================================================

-- hello-world: hello-cli
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'hello-cli', 'Interactive Greeting CLI',
'Build a command-line program that asks for the user''s name and age, then prints a personalised greeting.',
'1. Use fmt.Print to prompt for input\n2. Use fmt.Scan to read user input\n3. Store the name in a string variable and age in an int variable\n4. Print: "Hello, [name]! You are [age] years old."\n5. Format the output cleanly using fmt.Printf',
'package main\n\nimport "fmt"\n\nfunc main() {\n    var name string\n    var age int\n    fmt.Print("Enter your name: ")\n    fmt.Scan(&name)\n    fmt.Print("Enter your age: ")\n    fmt.Scan(&age)\n    fmt.Printf("Hello, %s! You are %d years old.\\n", name, age)\n}',
1, 100, ARRAY['Use fmt.Print for prompts, not fmt.Println', 'Remember &: fmt.Scan(&variable)', 'Use fmt.Printf with %%s for strings and %%d for integers'], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'hello-world'
ON CONFLICT (lesson_id, slug) DO NOTHING;

-- hello-world: temp-converter
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'temp-converter', 'Temperature Converter',
'Write a program that converts Celsius to Fahrenheit and vice versa based on user input.',
'1. Prompt the user to choose conversion direction (C→F or F→C)\n2. Read the temperature value\n3. Apply the conversion formula\n4. Print the result with one decimal place\n5. Handle invalid input gracefully',
'package main\n\nimport "fmt"\n\nfunc main() {\n    var choice int\n    var temp float64\n    fmt.Println("1. Celsius to Fahrenheit")\n    fmt.Println("2. Fahrenheit to Celsius")\n    fmt.Print("Choose (1/2): ")\n    fmt.Scan(&choice)\n    fmt.Print("Enter temperature: ")\n    fmt.Scan(&temp)\n    if choice == 1 {\n        fmt.Printf("%.1f°C = %.1f°F\\n", temp, temp*9/5+32)\n    } else {\n        fmt.Printf("%.1f°F = %.1f°C\\n", temp, (temp-32)*5/9)\n    }\n}',
2, 150, ARRAY['C→F: (c * 9/5) + 32', 'F→C: (f - 32) * 5/9', 'Use %.1f to format to one decimal place'], 2, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-intro' AND l.slug = 'hello-world'
ON CONFLICT (lesson_id, slug) DO NOTHING;

-- for-loops: sum-calculator
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'sum-calculator', 'Sum & Average Calculator',
'Build a program that reads numbers from the user until they enter 0, then displays the sum and average.',
'1. Use a for loop to read numbers continuously\n2. Stop when the user enters 0\n3. Track count and running total\n4. Print sum and average (handle empty input)',
'package main\n\nimport "fmt"\n\nfunc main() {\n    var num float64\n    sum := 0.0\n    count := 0\n    for {\n        fmt.Print("Enter a number (0 to quit): ")\n        fmt.Scan(&num)\n        if num == 0 { break }\n        sum += num\n        count++\n    }\n    if count > 0 {\n        fmt.Printf("Sum: %.2f, Average: %.2f\\n", sum, sum/float64(count))\n    }\n}',
2, 150, ARRAY['Use infinite for with break', 'Track count to calculate average', 'Handle division by zero with if guard'], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-control-flow' AND l.slug = 'for-loops'
ON CONFLICT (lesson_id, slug) DO NOTHING;

-- func-decl: calculator-cli
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'calculator-cli', 'Calculator CLI',
'Build a CLI calculator that supports add, subtract, multiply, and divide via separate functions.',
'1. Define add/subtract/multiply/divide as separate functions\n2. Prompt user for operation and two numbers\n3. Call the appropriate function\n4. Print the result\n5. Handle division by zero',
'package main\n\nimport "fmt"\n\nfunc add(a, b float64) float64 { return a + b }\nfunc subtract(a, b float64) float64 { return a - b }\nfunc multiply(a, b float64) float64 { return a * b }\nfunc divide(a, b float64) (float64, error) {\n    if b == 0 { return 0, fmt.Errorf("division by zero") }\n    return a / b, nil\n}\n\nfunc main() {\n    var op string\n    var a, b float64\n    fmt.Print("Enter operation (+, -, *, /): ")\n    fmt.Scan(&op)\n    fmt.Print("Enter two numbers: ")\n    fmt.Scan(&a, &b)\n    var result float64\n    switch op {\n    case "+": result = add(a, b)\n    case "-": result = subtract(a, b)\n    case "*": result = multiply(a, b)\n    case "/":\n        if r, err := divide(a, b); err == nil { result = r } else { fmt.Println(err); return }\n    }\n    fmt.Printf("Result: %.2f\\n", result)\n}',
2, 150, ARRAY['Define each operation as a separate function', 'Handle division by zero with error return', 'Use switch to select the operation'], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'go-fundamentals' AND m.slug = 'go-functions' AND l.slug = 'func-decl'
ON CONFLICT (lesson_id, slug) DO NOTHING;

-- py-first-program: py-greeting
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'py-greeting', 'Personalised Greeting',
'Write a Python script that asks for the user''s name and favourite colour, then prints a personalised message.',
'1. Use input() to ask for name and favourite colour\n2. Store the answers in variables\n3. Print a message: "[name]''s favourite colour is [colour]!"\n4. Use an f-string for formatting',
'name = input("What is your name? ")\ncolour = input("What is your favourite colour? ")\nprint(f"{name}''s favourite colour is {colour}!")',
1, 80, ARRAY['Use input(prompt) to read user input', 'Use f-strings: f"Hello, {name}!"', 'Variables in Python don''t need type declarations'], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-hello' AND l.slug = 'py-first-program'
ON CONFLICT (lesson_id, slug) DO NOTHING;

-- py-numbers-strings: py-word-counter
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'py-word-counter', 'Word Counter',
'Write a function that takes a sentence and returns a dictionary with word counts.',
'1. Define a function count_words(sentence: str) -> dict\n2. Split the sentence into words using .split()\n3. Count each word using a dictionary\n4. Return the dictionary\n5. Handle empty strings and punctuation',
'def count_words(sentence: str) -> dict:\n    words = sentence.lower().split()\n    freq = {}\n    for word in words:\n        word = word.strip(".,!?""''")\n        if word:\n            freq[word] = freq.get(word, 0) + 1\n    return freq',
2, 120, ARRAY['Use .split() to split the sentence into words', 'Use .strip(".,!?") to remove punctuation', 'Use dict.get(key, 0) for clean counting'], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-variables' AND l.slug = 'py-numbers-strings'
ON CONFLICT (lesson_id, slug) DO NOTHING;

-- py-conditionals: grade-calculator
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'grade-calculator', 'Grade Calculator',
'Write a program that converts a numerical score to a letter grade with +/- modifiers.',
'1. Ask user for a score (0-100)\n2. Determine letter grade: A (90+), B (80-89), C (70-79), D (60-69), F (<60)\n3. Add +/- modifiers: A+ (97+), A- (90-93), B+ (87-89), B- (80-83), etc.\n4. Print the final grade',
'score = int(input("Enter your score (0-100): "))\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelif score >= 70:\n    grade = "C"\nelif score >= 60:\n    grade = "D"\nelse:\n    grade = "F"\n# Add +/- modifiers\nif grade != "F":\n    last = score % 10\n    if last >= 7:\n        grade += "+"\n    elif last <= 3:\n        grade += "-"\nprint(f"Grade: {grade}")',
2, 120, ARRAY['Use modulo % to get the last digit for +/-', 'A+ = 97+, A- = 90-93', 'A score of 60-69 is a D'], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-basics' AND m.slug = 'py-control' AND l.slug = 'py-conditionals'
ON CONFLICT (lesson_id, slug) DO NOTHING;

-- ds-map-basics: phonebook
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'phonebook', 'Phonebook Manager',
'Build a CLI phonebook using a map to store name→phone number associations with add, lookup, and delete operations.',
'1. Use a map[string]string to store entries\n2. Show menu: (1) Add (2) Lookup (3) Delete (4) List All (5) Exit\n3. Handle lookups for non-existent entries gracefully\n4. Confirm before deleting',
'package main\n\nimport "fmt"\n\nfunc main() {\n    phonebook := make(map[string]string)\n    for {\n        fmt.Println("\\n=== Phonebook ===")\n        fmt.Println("1. Add entry")\n        fmt.Println("2. Lookup entry")\n        fmt.Println("3. Delete entry")\n        fmt.Println("4. List all")\n        fmt.Println("5. Exit")\n        var choice int\n        fmt.Scan(&choice)\n        switch choice {\n        case 1:\n            var name, phone string\n            fmt.Print("Name: ")\n            fmt.Scan(&name)\n            fmt.Print("Phone: ")\n            fmt.Scan(&phone)\n            phonebook[name] = phone\n        case 2:\n            var name string\n            fmt.Print("Name: ")\n            fmt.Scan(&name)\n            if phone, ok := phonebook[name]; ok {\n                fmt.Printf("%s: %s\\n", name, phone)\n            } else {\n                fmt.Println("Not found")\n            }\n        case 3:\n            var name string\n            fmt.Print("Name: ")\n            fmt.Scan(&name)\n            if _, ok := phonebook[name]; ok {\n                delete(phonebook, name)\n                fmt.Println("Deleted")\n            } else {\n                fmt.Println("Not found")\n            }\n        case 4:\n            for name, phone := range phonebook {\n                fmt.Printf("%s: %s\\n", name, phone)\n            }\n        case 5:\n            return\n        }\n    }\n}',
2, 150, ARRAY['Use comma-ok idiom for lookups', 'Use delete() built-in', 'Iterate with for range over map'], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'data-structures-go' AND m.slug = 'ds-maps' AND l.slug = 'ds-map-basics'
ON CONFLICT (lesson_id, slug) DO NOTHING;

-- py-list-comprehensions: data-processor
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'data-processor', 'Data Processor',
'Use comprehensions to filter, map, and reduce a dataset of numbers.',
'1. Generate a list of numbers from 1 to 50\n2. Use list comprehension for squares of even numbers\n3. Use dict comprehension for number→parity mapping\n4. Compute sum of filtered numbers using sum()\n5. Use set comprehension for unique remainders mod 5',
'numbers = list(range(1, 51))\n\n# 1. Squares of even numbers\neven_squares = [n**2 for n in numbers if n % 2 == 0]\nprint(f"Even squares: {even_squares[:10]}...")\n\n# 2. Number to parity mapping\nparity = {n: "even" if n % 2 == 0 else "odd" for n in numbers}\n\n# 3. Sum of all multiples of 3 or 5\nfiltered_sum = sum(n for n in numbers if n % 3 == 0 or n % 5 == 0)\nprint(f"Sum of multiples of 3 or 5: {filtered_sum}")\n\n# 4. Set of unique remainders when divided by 5\nremainders = {n % 5 for n in numbers}\nprint(f"Unique remainders mod 5: {remainders}")',
2, 120, ARRAY['Use [expr for item in iterable if cond] syntax', 'Generator expression: sum(x for x in iterable)', 'Set comprehension: {expr for item in iterable}'], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-comprehensions' AND l.slug = 'py-list-comprehensions'
ON CONFLICT (lesson_id, slug) DO NOTHING;

-- py-file-reading: py-note-app
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'py-note-app', 'Note-Taking App',
'Build a simple command-line note-taking app that can create, list, and delete notes stored in a file.',
'1. Show a menu: (1) New note (2) List notes (3) Delete note (4) Exit\n2. Store notes as one-per-line in a text file\n3. Each note has a timestamp\n4. Handle file not existing gracefully\n5. Delete by line number',
'import os\nfrom datetime import datetime\n\nNOTES_FILE = "notes.txt"\n\ndef add_note():\n    note = input("Enter note: ")\n    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")\n    with open(NOTES_FILE, "a") as f:\n        f.write(f"[{timestamp}] {note}\\n")\n    print("Note added!")\n\ndef list_notes():\n    if not os.path.exists(NOTES_FILE):\n        print("No notes found.")\n        return\n    with open(NOTES_FILE, "r") as f:\n        notes = f.readlines()\n    for i, note in enumerate(notes, 1):\n        print(f"{i}. {note.strip()}")\n\nwhile True:\n    print("\\n1. New note  2. List notes  3. Delete  4. Exit")\n    choice = input("Choose: ")\n    if choice == "1": add_note()\n    elif choice == "2": list_notes()\n    elif choice == "3": print("Feature coming soon")\n    elif choice == "4": break',
2, 150, ARRAY['Use "a" mode for appending notes', 'Use os.path.exists() to check if file exists', 'Use enumerate() to number notes for deletion'], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.slug = 'python-intermediate' AND m.slug = 'py-file-io' AND l.slug = 'py-file-reading'
ON CONFLICT (lesson_id, slug) DO NOTHING;
-- ============================================================================
-- STEP 5: LESSON DEPENDENCIES
-- ============================================================================

-- GO FUNDAMENTALS dependencies
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
  AND m1.slug = 'go-control-flow' AND m2.slug = 'go-control-flow'
  AND l1.slug = 'defer-panic' AND l2.slug = 'for-loops'
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

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'go-fundamentals' AND c2.slug = 'go-fundamentals'
  AND m1.slug = 'go-packages' AND m2.slug = 'go-packages'
  AND l1.slug = 'go-modules' AND l2.slug = 'creating-packages'
ON CONFLICT DO NOTHING;

-- PYTHON BASICS dependencies
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

-- PYTHON INTERMEDIATE dependencies
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

-- DATA STRUCTURES dependencies (build on Go Fundamentals)
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'data-structures-go' AND c2.slug = 'go-fundamentals'
  AND m1.slug = 'ds-arrays-slices' AND m2.slug = 'go-functions'
  AND l1.slug = 'ds-array-basics' AND l2.slug = 'func-decl'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'data-structures-go' AND c2.slug = 'data-structures-go'
  AND m1.slug = 'ds-arrays-slices' AND m2.slug = 'ds-arrays-slices'
  AND l1.slug = 'ds-slice-tricks' AND l2.slug = 'ds-array-basics'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'data-structures-go' AND c2.slug = 'data-structures-go'
  AND m1.slug = 'ds-maps' AND m2.slug = 'ds-maps'
  AND l1.slug = 'ds-structs' AND l2.slug = 'ds-map-basics'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'data-structures-go' AND c2.slug = 'data-structures-go'
  AND m1.slug = 'ds-linked-lists' AND m2.slug = 'ds-linked-lists'
  AND l1.slug = 'ds-doubly-linked-list' AND l2.slug = 'ds-singly-linked-list'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'data-structures-go' AND c2.slug = 'data-structures-go'
  AND m1.slug = 'ds-trees-graphs' AND m2.slug = 'ds-trees-graphs'
  AND l1.slug = 'ds-graph-basics' AND l2.slug = 'ds-binary-trees'
ON CONFLICT DO NOTHING;

-- ALGORITHMS dependencies
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'algorithms' AND c2.slug = 'algorithms'
  AND m1.slug = 'alg-sorting' AND m2.slug = 'alg-sorting'
  AND l1.slug = 'sorting-compare' AND l2.slug = 'sorting-basics'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'algorithms' AND c2.slug = 'algorithms'
  AND m1.slug = 'alg-searching' AND m2.slug = 'alg-searching'
  AND l1.slug = 'search-advanced' AND l2.slug = 'linear-binary'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'algorithms' AND c2.slug = 'algorithms'
  AND m1.slug = 'alg-dp' AND m2.slug = 'alg-dp'
  AND l1.slug = 'dp-patterns' AND l2.slug = 'dp-intro'
ON CONFLICT DO NOTHING;

INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'algorithms' AND c2.slug = 'algorithms'
  AND m1.slug = 'alg-graphs' AND m2.slug = 'alg-graphs'
  AND l1.slug = 'graph-algorithms' AND l2.slug = 'graph-basics'
ON CONFLICT DO NOTHING;

-- Algorithms depends on Go fundamentals
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'algorithms' AND c2.slug = 'go-fundamentals'
  AND m1.slug = 'alg-sorting' AND m2.slug = 'go-functions'
  AND l1.slug = 'sorting-basics' AND l2.slug = 'func-decl'
ON CONFLICT DO NOTHING;

-- Python Intermediate depends on Python Basics
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l1.id, l2.id
FROM lessons l1 CROSS JOIN lessons l2
JOIN modules m1 ON l1.module_id = m1.id JOIN modules m2 ON l2.module_id = m2.id
JOIN courses c1 ON m1.course_id = c1.id JOIN courses c2 ON m2.course_id = c2.id
WHERE c1.slug = 'python-intermediate' AND c2.slug = 'python-basics'
  AND m1.slug = 'py-errors' AND m2.slug = 'py-functions'
  AND l1.slug = 'py-try-except' AND l2.slug = 'py-def-functions'
ON CONFLICT DO NOTHING;

COMMIT;
