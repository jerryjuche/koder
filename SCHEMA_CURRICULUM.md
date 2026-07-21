# Curriculum CMS — Schema & API Reference

## Entity Relationship Diagram

```
courses (1) ──→ (N) modules (1) ──→ (N) lessons 
                                         │
                                         ├──→ (N) lesson_sections
                                         ├──→ (N) projects
                                         └──→ (N) lesson_dependencies (DAG)

users (1) ──→ (N) course_progress (N) ──→ (1) courses
users (1) ──→ (N) lesson_progress (N) ──→ (1) lessons
```

## 1. `courses`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK, `gen_random_uuid()` | Auto-generated |
| `slug` | TEXT | NOT NULL, UNIQUE | URL-safe identifier, e.g. `'go-fundamentals'` |
| `title` | TEXT | NOT NULL | Display name |
| `description` | TEXT | DEFAULT `''` | Markdown-supported |
| `image_url` | TEXT? | NULLABLE | Course card image |
| `icon` | TEXT? | NULLABLE | Icon identifier |
| `difficulty_level` | INT | NOT NULL, CHECK(1–5) | 1=easiest, 5=hardest |
| `estimated_hours` | INT | NOT NULL, DEFAULT 0 | Total time to complete |
| `order_number` | INT | NOT NULL, DEFAULT 0 | Display sort order |
| `visible` | BOOLEAN | NOT NULL, DEFAULT `false` | Student visibility |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Auto |
| `updated_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Auto |

## 2. `modules`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK, `gen_random_uuid()` | Auto-generated |
| `course_id` | UUID | NOT NULL, FK → courses(id) ON DELETE CASCADE | Parent course |
| `slug` | TEXT | NOT NULL | URL-safe, UNIQUE per course |
| `title` | TEXT | NOT NULL | Display name |
| `description` | TEXT | DEFAULT `''` | Markdown-supported |
| `image_url` | TEXT? | NULLABLE | Module card image |
| `order_number` | INT | NOT NULL, DEFAULT 0 | Display sort order |
| `visible` | BOOLEAN | NOT NULL, DEFAULT `false` | Student visibility |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Auto |
| `updated_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Auto |

**UNIQUE constraint:** `(course_id, slug)`

## 3. `lessons`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK, `gen_random_uuid()` | Auto-generated |
| `module_id` | UUID | NOT NULL, FK → modules(id) ON DELETE CASCADE | Parent module |
| `slug` | TEXT | NOT NULL | URL-safe, UNIQUE per module |
| `title` | TEXT | NOT NULL | Display name |
| `description` | TEXT | DEFAULT `''` | Short summary |
| `raw_readme` | TEXT | DEFAULT `''` | Full markdown body |
| `difficulty` | INT | NOT NULL, CHECK(1–5) | 1=easiest, 5=hardest |
| `estimated_minutes` | INT | NOT NULL, DEFAULT 10 | Time to complete |
| `xp_reward` | INT | NOT NULL, DEFAULT 50 | XP earned on completion |
| `order_number` | INT | NOT NULL, DEFAULT 0 | Display sort order |
| `visible` | BOOLEAN | NOT NULL, DEFAULT `false` | Student visibility |
| `problem_references` | TEXT[] | NOT NULL, DEFAULT `'{}'` | Array of **problem slugs** from the `problems` table |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Auto |
| `updated_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Auto |

**UNIQUE constraint:** `(module_id, slug)`

## 4. `lesson_sections`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK, `gen_random_uuid()` | Auto-generated |
| `lesson_id` | UUID | NOT NULL, FK → lessons(id) ON DELETE CASCADE | Parent lesson |
| `section_type` | ENUM | NOT NULL | One of 11 types (see below) |
| `title` | TEXT | DEFAULT `''` | Section heading |
| `content` | TEXT | DEFAULT `''` | Markdown body |
| `metadata` | JSONB | NOT NULL, DEFAULT `'{}'` | Quiz questions, exercise config |
| `order_number` | INT | NOT NULL, DEFAULT 0 | Display sort order |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Auto |

**`section_type` ENUM values:** `overview`, `explanation`, `examples`, `best_practices`, `common_mistakes`, `summary`, `quiz`, `exercises`, `mini_project`, `assessment`, `ai_review`

**`metadata` JSONB for quiz sections:**
```json
{
  "question": "What does the following code print?",
  "options": ["A", "B", "C", "D"],
  "correct_index": 2,
  "explanation": "Option B is correct because..."
}
```

## 5. `lesson_dependencies` (Prerequisite DAG)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `lesson_id` | UUID | NOT NULL, FK → lessons(id) ON DELETE CASCADE | The dependent lesson |
| `depends_on_lesson_id` | UUID | NOT NULL, FK → lessons(id) ON DELETE CASCADE | The prerequisite lesson |

**PK:** `(lesson_id, depends_on_lesson_id)`
**CHECK:** `lesson_id <> depends_on_lesson_id` (no self-references)

## 6. `projects`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK, `gen_random_uuid()` | Auto-generated |
| `lesson_id` | UUID | NOT NULL, FK → lessons(id) ON DELETE CASCADE | Parent lesson |
| `slug` | TEXT | NOT NULL | URL-safe, UNIQUE per lesson |
| `title` | TEXT | NOT NULL | Display name |
| `description` | TEXT | DEFAULT `''` | Project overview |
| `requirements` | TEXT | DEFAULT `''` | Bullet-list requirements |
| `starter_code` | TEXT | DEFAULT `''` | Boilerplate code |
| `difficulty` | INT | NOT NULL, CHECK(1–5) | 1=easiest, 5=hardest |
| `xp_reward` | INT | NOT NULL, DEFAULT 100 | XP earned on completion |
| `hints` | TEXT[] | NOT NULL, DEFAULT `'{}'` | Ordered hints array |
| `order_number` | INT | NOT NULL, DEFAULT 0 | Display sort order |
| `visible` | BOOLEAN | NOT NULL, DEFAULT `false` | Student visibility |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Auto |
| `updated_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Auto |

**UNIQUE constraint:** `(lesson_id, slug)`

## 7. `course_progress`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `user_id` | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE | Student |
| `course_id` | UUID | NOT NULL, FK → courses(id) ON DELETE CASCADE | Course |
| `started_at` | TIMESTAMPTZ | DEFAULT `NOW()` | When user started |
| `completed_at` | TIMESTAMPTZ? | NULLABLE | When user finished |
| `progress_pct` | REAL | NOT NULL, CHECK(0–100) | 0 to 100 |

**PK:** `(user_id, course_id)`

## 8. `lesson_progress`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `user_id` | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE | Student |
| `lesson_id` | UUID | NOT NULL, FK → lessons(id) ON DELETE CASCADE | Lesson |
| `completed` | BOOLEAN | NOT NULL, DEFAULT `false` | Completion flag |
| `xp_awarded` | INT | NOT NULL, DEFAULT 0 | XP awarded |
| `completed_at` | TIMESTAMPTZ? | NULLABLE | When completed |

**PK:** `(user_id, lesson_id)`

---

## API Payload Formats

### Create Course
```
POST /admin/courses
{
  "slug": "go-fundamentals",
  "title": "Go Fundamentals",
  "description": "Master Go syntax...",
  "difficulty_level": 2,
  "estimated_hours": 20,
  "order_number": 1
}
```

### Create Module
```
POST /admin/courses/{courseId}/modules
{
  "course_id": "<course-uuid>",
  "slug": "go-intro",
  "title": "Introduction to Go",
  "description": "Getting started...",
  "order_number": 1
}
```

### Create Lesson (with sections + dependencies)
```
POST /admin/modules/{moduleId}/lessons
{
  "lesson": {
    "module_id": "<module-uuid>",
    "slug": "hello-world",
    "title": "Hello, World!",
    "description": "Write and run your first Go program.",
    "difficulty": 1,
    "estimated_minutes": 10,
    "xp_reward": 30,
    "order_number": 1,
    "visible": false,
    "problem_references": ["fizzbuzz", "max-min"]
  },
  "sections": [
    {
      "section_type": "overview",
      "title": "What is Go?",
      "content": "Go is a...",
      "order_number": 1
    },
    {
      "section_type": "quiz",
      "title": "Test Your Knowledge",
      "content": "",
      "metadata": {
        "question": "What does x := 5 do?",
        "options": ["Declares a constant", "Declares a variable", "Calls a function"],
        "correct_index": 1,
        "explanation": ":= declares and initialises a variable."
      },
      "order_number": 2
    }
  ],
  "dependency_ids": ["<prerequisite-lesson-uuid>"]
}
```

### Create Project
```
POST /admin/lessons/{lessonId}/projects
{
  "lesson_id": "<lesson-uuid>",
  "slug": "hello-cli",
  "title": "Interactive Greeting CLI",
  "description": "Build a CLI greeting app",
  "requirements": "1. Print a prompt\n2. Read input\n3. Print greeting",
  "starter_code": "package main\n\nfunc main() {}",
  "difficulty": 1,
  "xp_reward": 100,
  "hints": ["Use fmt.Scan", "Remember &"],
  "order_number": 1
}
```

---

## Existing Problem Slugs (for `problem_references`)

| Module | Sample Slugs |
|--------|-------------|
| **math-recursion** | `sum-of-digits`, `factorial`, `power-recursive`, `count-digits`, `reverse-integer`, `fibonacci-nth`, `gcd-euclidean`, `tower-of-hanoi-moves`, `collatz-steps` |
| **arrays-strings** | `sum-of-array`, `find-max-in-array`, `reverse-string`, `count-vowels`, `merge-sorted-arrays`, `rotate-array`, `two-sum-indices`, `longest-common-prefix`, `title-case` |
| **data-structures** | `binary-search`, `kth-largest`, `merge-sorted-lists`, `middle-element`, `min-in-stack`, `queue-front-after-dequeues`, `simulate-queue-ops`, `evaluate-postfix`, `find-majority-element` |
| **go-fundamentals** | `fizzbuzz`, `max-min`, `unique`, `word-count`, `even-squares` |
| **error-handling** | `safe-divide`, `validate-age`, `safe-array-get`, `parse-non-negative-int`, `is-valid-email`, `count-connected-components` |
| **sorting-searching** | `binary-search`, `remove-duplicates-sorted`, `move-zeroes`, `kth-largest`, `merge-sorted-arrays` |
| **python-intro** | `py-double-it`, `py-even-or-odd`, `py-factorial` |
| **python-arrays-strings** | `py-sum-list`, `py-reverse-string`, `py-palindrome-check` |

---

## Key Constraints & Business Rules

1. **`visible` defaults to `false`** — all content is draft by default. Toggle to `true` to publish.
2. **Slugs must be URL-safe** — lowercase, hyphens, no spaces. UNIQUE per parent.
3. **`problem_references`** — stores problem *slugs* (not IDs). The frontend looks up problems by slug.
4. **Dependencies** — `lesson_dependencies` creates a DAG. The backend checks loops via `lesson_id <> depends_on_lesson_id`.
5. **Sections order** — `order_number` determines render order. Reorder via `PUT /admin/sections/reorder`.
6. **Progress cascade** — completing all lessons in a module updates `course_progress.progress_pct`.
7. **XP is awarded once** — `UpsertLessonProgress` uses `GREATEST` to never decrease XP.
8. **Delete cascade** — deleting a course removes all modules, lessons, sections, projects, and dependencies.
