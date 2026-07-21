# Curriculum CMS Schema — AI Seed Data Guide

## Overview

8 tables forming a tree: **Courses → Modules → Lessons → (Sections, Projects, Dependencies)**.
Plus 2 progress tables with user FK.

```
courses
 └── modules (FK course_id)
      └── lessons (FK module_id)
           ├── lesson_sections (FK lesson_id) — typed content blocks
           ├── projects (FK lesson_id) — hands-on coding
           └── lesson_dependencies (FK lesson_id, depends_on_lesson_id) — prereq DAG

course_progress (FK user_id, course_id)
lesson_progress (FK user_id, lesson_id)
```

---

## Table: `courses`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` | Auto-generated |
| `slug` | `TEXT` | `NOT NULL UNIQUE` | URL-safe identifier e.g. `go-fundamentals` |
| `title` | `TEXT` | `NOT NULL` | Human-readable e.g. "Go Fundamentals" |
| `description` | `TEXT` | `NOT NULL DEFAULT ''` | Short paragraph |
| `image_url` | `TEXT` | nullable | Course card image |
| `icon` | `TEXT` | nullable | Emoji or icon name |
| `difficulty_level` | `INTEGER` | `1-5` | 1=Beginner, 5=Expert |
| `estimated_hours` | `INTEGER` | `NOT NULL DEFAULT 0` | Total hours to complete |
| `order_number` | `INTEGER` | `NOT NULL DEFAULT 0` | Display order |
| `visible` | `BOOLEAN` | `NOT NULL DEFAULT false` | Published flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

---

## Table: `modules`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `course_id` | `UUID` | `NOT NULL REFERENCES courses(id) ON DELETE CASCADE` | Parent course |
| `slug` | `TEXT` | `NOT NULL` | Unique per course: `variables`, `functions` |
| `title` | `TEXT` | `NOT NULL` | |
| `description` | `TEXT` | `NOT NULL DEFAULT ''` | |
| `image_url` | `TEXT` | nullable | |
| `order_number` | `INTEGER` | `NOT NULL DEFAULT 0` | |
| `visible` | `BOOLEAN` | `NOT NULL DEFAULT false` | |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

**Unique:** `(course_id, slug)`

---

## Table: `lessons`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `module_id` | `UUID` | `NOT NULL REFERENCES modules(id) ON DELETE CASCADE` | Parent module |
| `slug` | `TEXT` | `NOT NULL` | Unique per module: `intro-to-variables` |
| `title` | `TEXT` | `NOT NULL` | |
| `description` | `TEXT` | `NOT NULL DEFAULT ''` | |
| `raw_readme` | `TEXT` | `NOT NULL DEFAULT ''` | Optional markdown readme |
| `difficulty` | `INTEGER` | `1-5` | |
| `estimated_minutes` | `INTEGER` | `NOT NULL DEFAULT 10` | |
| `xp_reward` | `INTEGER` | `NOT NULL DEFAULT 50` | XP awarded on completion |
| `order_number` | `INTEGER` | `NOT NULL DEFAULT 0` | |
| `visible` | `BOOLEAN` | `NOT NULL DEFAULT false` | |
| `problem_references` | `TEXT[]` | `NOT NULL DEFAULT '{}'` | Array of problem slugs from `problems` table |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

**Unique:** `(module_id, slug)`

**Note on `problem_references`:** This is a `TEXT[]` array of slugs from the `problems` table (e.g. `ARRAY['hello-world', 'fizzbuzz']`). The frontend renders these as inline coding exercises. Link to existing problems or leave empty if no coding exercise.

---

## Table: `lesson_dependencies`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `lesson_id` | `UUID` | `NOT NULL REFERENCES lessons(id) ON DELETE CASCADE` | The lesson that depends on another |
| `depends_on_lesson_id` | `UUID` | `NOT NULL REFERENCES lessons(id) ON DELETE CASCADE` | The prerequisite lesson |

**PK:** `(lesson_id, depends_on_lesson_id)`
**Check:** `lesson_id <> depends_on_lesson_id` (no self-reference)

Creates a DAG of prerequisites. A lesson is locked until all dependencies are completed.

---

## Table: `lesson_sections`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `lesson_id` | `UUID` | `NOT NULL REFERENCES lessons(id) ON DELETE CASCADE` | Parent lesson |
| `section_type` | `lesson_section_type` | `NOT NULL` | Enum (11 types, see below) |
| `title` | `TEXT` | `NOT NULL DEFAULT ''` | Section heading |
| `content` | `TEXT` | `NOT NULL DEFAULT ''` | Markdown/HTML content |
| `metadata` | `JSONB` | `NOT NULL DEFAULT '{}'::jsonb` | Type-specific data (see below) |
| `order_number` | `INTEGER` | `NOT NULL DEFAULT 0` | Display order within lesson |

### Section Types (enum `lesson_section_type`)

| Type | Purpose | Content format | Metadata |
|---|---|---|---|
| `overview` | Section intro / learning goals | Markdown | none |
| `explanation` | Detailed concept teaching | Markdown | none |
| `examples` | Code examples with walkthrough | Markdown | none |
| `best_practices` | Idiomatic patterns | Markdown | none |
| `common_mistakes` | Pitfalls to avoid | Markdown | none |
| `summary` | Recap of key points | Markdown | none |
| `quiz` | Multiple-choice question | Markdown (optional) | `QuizMetadata` JSONB |
| `exercises` | Coding exercise | Markdown (instructions) | Uses `problem_references` from lesson |
| `mini_project` | Small project | Markdown (instructions) | Uses `problem_references` from lesson |
| `assessment` | Graded coding test | Markdown (instructions) | Uses `problem_references` from lesson |
| `ai_review` | AI-generated review section | Markdown | none |

### QuizMetadata JSONB structure (for `quiz` sections)

```json
{
  "question": "What is a variable in Go?",
  "options": [
    "A named storage location",
    "A function parameter",
    "A package import",
    "A control structure"
  ],
  "correct_index": 0,
  "explanation": "A variable is a named storage location that holds a value of a specific type."
}
```

| Field | Type | Constraints |
|---|---|---|
| `question` | string | Required |
| `options` | string[] | Required, 2-6 options |
| `correct_index` | integer | Required, 0-based index into options |
| `explanation` | string | Required, shown after answer |

---

## Table: `projects`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `lesson_id` | `UUID` | `NOT NULL REFERENCES lessons(id) ON DELETE CASCADE` | Parent lesson |
| `slug` | `TEXT` | `NOT NULL` | Unique per lesson |
| `title` | `TEXT` | `NOT NULL` | |
| `description` | `TEXT` | `NOT NULL DEFAULT ''` | Overview |
| `requirements` | `TEXT` | `NOT NULL DEFAULT ''` | Detailed specs in markdown |
| `starter_code` | `TEXT` | `NOT NULL DEFAULT ''` | Boilerplate code |
| `difficulty` | `INTEGER` | `1-5` | |
| `xp_reward` | `INTEGER` | `NOT NULL DEFAULT 100` | |
| `hints` | `TEXT[]` | `NOT NULL DEFAULT '{}'` | Array of hint strings |
| `order_number` | `INTEGER` | `NOT NULL DEFAULT 0` | |
| `visible` | `BOOLEAN` | `NOT NULL DEFAULT false` | |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

**Unique:** `(lesson_id, slug)`

---

## Table: `course_progress`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `user_id` | `UUID` | `NOT NULL REFERENCES users(id) ON DELETE CASCADE` | |
| `course_id` | `UUID` | `NOT NULL REFERENCES courses(id) ON DELETE CASCADE` | |
| `started_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `completed_at` | `TIMESTAMPTZ` | nullable | |
| `progress_pct` | `REAL` | `0-100` | |

**PK:** `(user_id, course_id)`

---

## Table: `lesson_progress`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `user_id` | `UUID` | `NOT NULL REFERENCES users(id) ON DELETE CASCADE` | |
| `lesson_id` | `UUID` | `NOT NULL REFERENCES lessons(id) ON DELETE CASCADE` | |
| `completed` | `BOOLEAN` | `NOT NULL DEFAULT false` | |
| `xp_awarded` | `INTEGER` | `NOT NULL DEFAULT 0` | |
| `completed_at` | `TIMESTAMPTZ` | nullable | |

**PK:** `(user_id, lesson_id)`

---

## Seed SQL: Best Practices

### 1. Use `gen_random_uuid()` for all IDs

Let PostgreSQL generate UUIDs. Reference them in CTEs:

```sql
WITH course AS (
  INSERT INTO courses (slug, title, description, difficulty_level, estimated_hours, order_number, visible)
  VALUES ('go-fundamentals', 'Go Fundamentals', 'Learn Go from scratch...', 1, 20, 1, true)
  RETURNING id
)
```

### 2. Chain CTEs for hierarchical inserts

```sql
WITH
course AS (
  INSERT INTO courses (...) VALUES (...) RETURNING id
),
module AS (
  INSERT INTO modules (course_id, slug, title, order_number, visible)
  SELECT id, 'variables', 'Variables & Types', 1, true FROM course
  RETURNING id
),
lesson AS (
  INSERT INTO lessons (module_id, slug, title, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
  SELECT id, 'intro-to-variables', 'Introduction to Variables', 1, 15, 50, 1, true, ARRAY['hello-world']::TEXT[]
  FROM module
  RETURNING id
)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, metadata, order_number)
SELECT id, 'explanation', 'What is a Variable?', 'A variable is...', '{}'::jsonb, 1 FROM lesson;
```

### 3. For quizzes, inject JSONB inline

```sql
INSERT INTO lesson_sections (lesson_id, section_type, title, content, metadata, order_number)
SELECT id, 'quiz', 'Quick Check', '',
  '{"question": "What keyword declares a variable in Go?", "options": ["var", "let", "const", "def"], "correct_index": 0, "explanation": "Go uses ''var'' to declare variables."}'::jsonb,
  2
FROM lesson;
```

### 4. For dependencies, use pair CTEs

```sql
WITH
lesson1 AS (INSERT INTO lessons ... RETURNING id),
lesson2 AS (INSERT INTO lessons ... RETURNING id)
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT l2.id, l1.id FROM lesson1 l1, lesson2 l2;
```

### 5. Complete real-world pattern

```sql
BEGIN;

WITH
course AS (
  INSERT INTO courses (slug, title, description, difficulty_level, estimated_hours, order_number, visible)
  VALUES (
    'python-fundamentals',
    'Python Fundamentals',
    'Master Python programming from variables to functions. Perfect for beginners.',
    1, 15, 1, true
  )
  RETURNING id
),
module1 AS (
  INSERT INTO modules (course_id, slug, title, description, order_number, visible)
  SELECT id, 'basics', 'Python Basics', 'Variables, data types, and basic I/O', 1, true
  FROM course
  RETURNING id
),
lesson1 AS (
  INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
  SELECT id, 'hello-python', 'Hello, Python!',
    'Write your first Python program and learn about the print() function.',
    1, 10, 50, 1, true, ARRAY['py-hello-world']::TEXT[]
  FROM module1
  RETURNING id
)
INSERT INTO lesson_sections (lesson_id, section_type, title, content, metadata, order_number)
SELECT id, 'overview', 'What You''ll Learn',
  '<p>In this lesson, you will:</p><ul><li>Write your first Python program</li><li>Use the <code>print()</code> function</li><li>Understand comments</li></ul>',
  '{}'::jsonb, 1
FROM lesson1;

INSERT INTO lesson_sections (lesson_id, section_type, title, content, metadata, order_number)
SELECT id, 'explanation', 'The print() Function',
  '<p>The <code>print()</code> function outputs text to the console.</p><div class="example"><p><strong>Example:</strong></p><pre><code>print("Hello, World!")</code></pre></div>',
  '{}'::jsonb, 2
FROM lesson1;

INSERT INTO lesson_sections (lesson_id, section_type, title, content, metadata, order_number)
SELECT id, 'quiz', 'Quick Check', '',
  '{"question": "What does print() do?", "options": ["Reads input", "Outputs text", "Creates a variable", "Imports a module"], "correct_index": 1, "explanation": "print() outputs text to the console."}'::jsonb,
  3
FROM lesson1;

INSERT INTO lesson_sections (lesson_id, section_type, title, content, metadata, order_number)
SELECT id, 'exercises', 'Your Turn!',
  '<p>Write a program that prints your name.</p>',
  '{}'::jsonb, 4
FROM lesson1;

INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT id, 'greeting-app', 'Greeting App',
  'Build a program that asks for the user''s name and prints a greeting.',
  '- Use input() to read a name\n- Use print() to display "Hello, [name]!"',
  'name = input("Enter your name: ")\n',
  1, 100, ARRAY['Store the input in a variable', 'Use f-strings for formatting'], 1, true
FROM lesson1;

COMMIT;
```

### 6. Important rules

- **Always wrap in `BEGIN;` / `COMMIT;`** — all or nothing
- **Set `visible = true` only on final seed** — start with `false` during development
- **`problem_references`** must match existing `problems.slug` values (from migrations 019, 031, 032, 034, 037)
- **Lesson sections within a lesson:** order by `order_number` ascending
- **Projects within a lesson:** order by `order_number` ascending
- **Modules within a course:** order by `order_number` ascending
- **Lessons within a module:** order by `order_number` ascending
- **Slugs:** lowercase, hyphen-separated, unique within their parent scope
- **Dependencies:** only add for lessons that truly build on prior lessons
- **Quiz `correct_index`:** must be a valid index into the `options` array (0-based)
- **XP rewards:** 50 for lessons, 100 for projects (defaults are fine)
- **Content HTML:** use simple HTML with supported div classes: `tip`, `example`, `warning`, `info` (rendered as styled callout boxes)
