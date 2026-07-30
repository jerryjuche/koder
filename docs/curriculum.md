# Koder Curriculum CMS — Seed & Fetch Reference

> **Audience:** AI agents generating courses, or administrators seeding data.
> **Supersedes:** `docs/curriculum-schema-for-ai.md`

---

## 1. System Overview

```
curriculum.json          # AI-generated JSON (course, modules, lessons, sections, projects)
       │
       ▼
cmd/generate-curriculum  # Go CLI tool — reads JSON, writes SQL migration
       │
       ▼
migrations/0NN_seed_*.sql  # Idempotent SQL (BEGIN/COMMIT, ON CONFLICT DO NOTHING)
       │
       ▼
psql / Supabase SQL Editor  # Run against PostgreSQL
       │
       ▼
8 curriculum tables + 2 progress tables
```

**Key principles:**
- All INSERTs use `ON CONFLICT DO NOTHING` — safe to re-run
- All entities default to `visible=false` — admins publish manually
- Every UUID is `gen_random_uuid()` — never hardcode IDs
- Use `BEGIN; ... COMMIT;` wrapping for atomicity

---

## 2. Database Schema

### 2.1 ENUM

```sql
CREATE TYPE lesson_section_type AS ENUM (
  'overview', 'explanation', 'examples', 'best_practices',
  'common_mistakes', 'summary', 'quiz', 'exercises',
  'mini_project', 'assessment', 'ai_review'
);
```

### 2.2 Tables

#### `courses`
| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` |
| `slug` | `TEXT` | `NOT NULL UNIQUE` |
| `title` | `TEXT` | `NOT NULL` |
| `description` | `TEXT` | `NOT NULL DEFAULT ''` |
| `image_url` | `TEXT` | nullable |
| `icon` | `TEXT` | nullable |
| `difficulty_level` | `INTEGER` | `NOT NULL DEFAULT 1, CHECK (1-5)` |
| `estimated_hours` | `INTEGER` | `NOT NULL DEFAULT 0` |
| `order_number` | `INTEGER` | `NOT NULL DEFAULT 0` |
| `visible` | `BOOLEAN` | `NOT NULL DEFAULT false` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` |

#### `modules`
| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` |
| `course_id` | `UUID` | `NOT NULL REFERENCES courses(id) ON DELETE CASCADE` |
| `slug` | `TEXT` | `NOT NULL` |
| `title` | `TEXT` | `NOT NULL` |
| `description` | `TEXT` | `NOT NULL DEFAULT ''` |
| `image_url` | `TEXT` | nullable |
| `order_number` | `INTEGER` | `NOT NULL DEFAULT 0` |
| `visible` | `BOOLEAN` | `NOT NULL DEFAULT false` |
| `locked` | `BOOLEAN` | `NOT NULL DEFAULT false` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` |
| **UNIQUE** | `(course_id, slug)` | |

#### `lessons`
| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` |
| `module_id` | `UUID` | `NOT NULL REFERENCES modules(id) ON DELETE CASCADE` |
| `slug` | `TEXT` | `NOT NULL` |
| `title` | `TEXT` | `NOT NULL` |
| `description` | `TEXT` | `NOT NULL DEFAULT ''` |
| `raw_readme` | `TEXT` | `NOT NULL DEFAULT ''` |
| `difficulty` | `INTEGER` | `NOT NULL DEFAULT 1, CHECK (1-5)` |
| `estimated_minutes` | `INTEGER` | `NOT NULL DEFAULT 10` |
| `xp_reward` | `INTEGER` | `NOT NULL DEFAULT 50` |
| `order_number` | `INTEGER` | `NOT NULL DEFAULT 0` |
| `visible` | `BOOLEAN` | `NOT NULL DEFAULT false` |
| `problem_references` | `TEXT[]` | `NOT NULL DEFAULT '{}'` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` |
| **UNIQUE** | `(module_id, slug)` | |

#### `lesson_sections`
| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` |
| `lesson_id` | `UUID` | `NOT NULL REFERENCES lessons(id) ON DELETE CASCADE` |
| `section_type` | `lesson_section_type` | `NOT NULL` (11-value ENUM) |
| `title` | `TEXT` | `NOT NULL DEFAULT ''` |
| `content` | `TEXT` | `NOT NULL DEFAULT ''` (markdown) |
| `metadata` | `JSONB` | `NOT NULL DEFAULT '{}'::jsonb` |
| `order_number` | `INTEGER` | `NOT NULL DEFAULT 0` |

#### `projects`
| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` |
| `lesson_id` | `UUID` | `NOT NULL REFERENCES lessons(id) ON DELETE CASCADE` |
| `slug` | `TEXT` | `NOT NULL` |
| `title` | `TEXT` | `NOT NULL` |
| `description` | `TEXT` | `NOT NULL DEFAULT ''` |
| `requirements` | `TEXT` | `NOT NULL DEFAULT ''` (markdown) |
| `starter_code` | `TEXT` | `NOT NULL DEFAULT ''` |
| `difficulty` | `INTEGER` | `NOT NULL DEFAULT 1, CHECK (1-5)` |
| `xp_reward` | `INTEGER` | `NOT NULL DEFAULT 100` |
| `hints` | `TEXT[]` | `NOT NULL DEFAULT '{}'` |
| `order_number` | `INTEGER` | `NOT NULL DEFAULT 0` |
| `visible` | `BOOLEAN` | `NOT NULL DEFAULT false` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` |
| **UNIQUE** | `(lesson_id, slug)` | |

#### `lesson_dependencies`
| Column | Type | Constraints |
|---|---|---|
| `lesson_id` | `UUID` | `NOT NULL REFERENCES lessons(id) ON DELETE CASCADE` |
| `depends_on_lesson_id` | `UUID` | `NOT NULL REFERENCES lessons(id) ON DELETE CASCADE` |
| **PK** | `(lesson_id, depends_on_lesson_id)` | |
| **CHECK** | `lesson_id <> depends_on_lesson_id` | |

#### `course_progress`
| Column | Type | Constraints |
|---|---|---|
| `user_id` | `UUID` | `NOT NULL REFERENCES users(id) ON DELETE CASCADE` |
| `course_id` | `UUID` | `NOT NULL REFERENCES courses(id) ON DELETE CASCADE` |
| `started_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` |
| `completed_at` | `TIMESTAMPTZ` | nullable |
| `progress_pct` | `REAL` | `NOT NULL DEFAULT 0, CHECK (0-100)` |
| **PK** | `(user_id, course_id)` | |

#### `lesson_progress`
| Column | Type | Constraints |
|---|---|---|
| `user_id` | `UUID` | `NOT NULL REFERENCES users(id) ON DELETE CASCADE` |
| `lesson_id` | `UUID` | `NOT NULL REFERENCES lessons(id) ON DELETE CASCADE` |
| `completed` | `BOOLEAN` | `NOT NULL DEFAULT false` |
| `xp_awarded` | `INTEGER` | `NOT NULL DEFAULT 0` |
| `completed_at` | `TIMESTAMPTZ` | nullable |
| **PK** | `(user_id, lesson_id)` | |

---

## 3. SQL Queries Used to Fetch Data

All queries are in `internal/store/curriculum.go`. Here is every SELECT used by the backend.

### 3.1 List Courses (student + admin)
```sql
SELECT id, slug, title, description, image_url, icon,
       difficulty_level, estimated_hours, order_number, visible,
       created_at, updated_at
FROM courses
ORDER BY order_number;
```
Student context adds `WHERE visible = true` in the handler (Go filter).

### 3.2 Get Course by Slug
```sql
SELECT id, slug, title, description, image_url, icon,
       difficulty_level, estimated_hours, order_number, visible,
       created_at, updated_at
FROM courses
WHERE slug = $1;
```

### 3.3 List Modules for Course
```sql
SELECT m.id, m.course_id, m.slug, m.title, m.description, m.image_url,
       m.order_number, m.visible, m.locked, m.created_at, m.updated_at
FROM modules m
WHERE m.course_id = $1
ORDER BY m.order_number;
```

### 3.4 Get Module by Slug
```sql
SELECT m.id, m.course_id, m.slug, m.title, m.description, m.image_url,
       m.order_number, m.visible, m.locked, m.created_at, m.updated_at
FROM modules m
JOIN courses c ON c.id = m.course_id
WHERE c.slug = $1 AND m.slug = $2;
```

### 3.5 List Lessons for Module (with stale problem_references cleanup)
```sql
SELECT l.id, l.module_id, l.slug, l.title, l.description, l.raw_readme,
       l.difficulty, l.estimated_minutes, l.xp_reward, l.order_number, l.visible,
       COALESCE(
         (SELECT ARRAY_AGG(ref)
          FROM UNNEST(l.problem_references) ref
          WHERE EXISTS (SELECT 1 FROM problems p WHERE p.slug = ref)),
         '{}'::text[]
       ) AS problem_references,
       l.created_at, l.updated_at
FROM lessons l
WHERE l.module_id = $1
ORDER BY l.order_number;
```

### 3.6 Get Lesson by Slug
```sql
SELECT l.id, l.module_id, l.slug, l.title, l.description, l.raw_readme,
       l.difficulty, l.estimated_minutes, l.xp_reward, l.order_number, l.visible,
       COALESCE(
         (SELECT ARRAY_AGG(ref)
          FROM UNNEST(l.problem_references) ref
          WHERE EXISTS (SELECT 1 FROM problems p WHERE p.slug = ref)),
         '{}'::text[]
       ) AS problem_references,
       l.created_at, l.updated_at
FROM lessons l
JOIN modules m ON m.id = l.module_id
JOIN courses c ON c.id = m.course_id
WHERE c.slug = $1 AND m.slug = $2 AND l.slug = $3;
```

### 3.7 List Lesson Sections
```sql
SELECT id, lesson_id, section_type, title, content,
       metadata, order_number, created_at
FROM lesson_sections
WHERE lesson_id = $1
ORDER BY order_number;
```

### 3.8 List Dependencies for a Lesson
```sql
SELECT lesson_id, depends_on_lesson_id
FROM lesson_dependencies
WHERE lesson_id = $1;
```

### 3.9 List Dependencies for Multiple Lessons (batch)
```sql
SELECT lesson_id, depends_on_lesson_id
FROM lesson_dependencies
WHERE lesson_id = ANY($1);
```

### 3.10 List Projects for a Lesson
```sql
SELECT id, lesson_id, slug, title, description, requirements,
       starter_code, difficulty, xp_reward, hints, order_number, visible,
       created_at, updated_at
FROM projects
WHERE lesson_id = $1
ORDER BY order_number;
```

### 3.11 Get Course Progress
```sql
SELECT user_id, course_id, started_at, completed_at, progress_pct
FROM course_progress
WHERE user_id = $1 AND course_id = $2;
```

### 3.12 Get Lesson Progress
```sql
SELECT user_id, lesson_id, completed, xp_awarded, completed_at
FROM lesson_progress
WHERE user_id = $1 AND lesson_id = $2;
```

### 3.13 Upsert Course Progress (never decreases)
```sql
INSERT INTO course_progress (user_id, course_id, started_at, completed_at, progress_pct)
VALUES ($1, $2, NOW(), $3, $4)
ON CONFLICT (user_id, course_id) DO UPDATE SET
  progress_pct = GREATEST(course_progress.progress_pct, $4),
  completed_at = CASE
    WHEN $3 IS NOT NULL AND course_progress.completed_at IS NULL
    THEN NOW()
    ELSE course_progress.completed_at
  END;
```

### 3.14 Upsert Lesson Progress (never decreases, XP only on first)
```sql
INSERT INTO lesson_progress (user_id, lesson_id, completed, xp_awarded, completed_at)
VALUES ($1, $2, true, $3, NOW())
ON CONFLICT (user_id, lesson_id) DO UPDATE SET
  completed = true,
  xp_awarded = GREATEST(lesson_progress.xp_awarded, $3),
  completed_at = CASE
    WHEN lesson_progress.completed_at IS NULL
    THEN NOW()
    ELSE lesson_progress.completed_at
  END
RETURNING user_id, lesson_id, completed, xp_awarded, completed_at;
```

---

## 4. Input JSON Format (for `cmd/generate-curriculum`)

### 4.1 Top-Level Structure

```json
{
  "course": { ... },
  "modules": [ ... ],
  "projects": [ ... ]
}
```

### 4.2 Course Object

```json
{
  "slug": "course-slug",
  "title": "Course Title",
  "description": "Short description of the course.",
  "difficulty_level": 1,
  "estimated_hours": 20,
  "order_number": 13
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `slug` | string | yes | lowercase, hyphen-separated, URL-safe, unique |
| `title` | string | yes | human-readable |
| `description` | string | no | brief overview |
| `difficulty_level` | integer | no | 1-5 (default 1) |
| `estimated_hours` | integer | no | total hours to complete |
| `order_number` | integer | no | display order; **new courses must be >= 13** |

### 4.3 Module Object

```json
{
  "slug": "module-slug",
  "title": "Module Title",
  "description": "Module description.",
  "order_number": 1,
  "language": "python",
  "lessons": [ ... ]
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `slug` | string | yes | unique per course |
| `title` | string | yes | |
| `description` | string | no | |
| `order_number` | integer | no | display order within course |
| `language` | string | no | `"python"` or `"go"` (used for exercise routing, NOT stored in DB) |
| `lessons` | array | yes | array of Lesson objects, at least 1 |

### 4.4 Lesson Object

```json
{
  "slug": "lesson-slug",
  "title": "Lesson Title",
  "description": "What the student will learn.",
  "difficulty": 1,
  "estimated_minutes": 15,
  "xp_reward": 50,
  "order_number": 1,
  "problem_references": ["existing-problem-slug"],
  "dependencies": ["prior-lesson-slug"],
  "sections": [ ... ]
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `slug` | string | yes | unique per module |
| `title` | string | yes | |
| `description` | string | no | |
| `difficulty` | integer | no | 1-5 (default 1) |
| `estimated_minutes` | integer | no | default 10 |
| `xp_reward` | integer | no | default 50 |
| `order_number` | integer | no | display order within module |
| `problem_references` | string[] | no | slugs from `problems` table (Mode A exercises) |
| `dependencies` | string[] | no | lesson slugs **within same course** (can cross modules) |
| `sections` | array | yes | array of Section objects, at least 1 |

### 4.5 Section Object

```json
{
  "section_type": "explanation",
  "title": "Section Title",
  "content": "Markdown content here...",
  "metadata": null
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `section_type` | string | yes | one of 11 ENUM values |
| `title` | string | no | section heading |
| `content` | string | no | markdown (empty `""` for quizzes) |
| `metadata` | JSON or null | no | quiz data or multiFile config |

### 4.6 Project Object

```json
{
  "lesson_slug": "target-lesson-slug",
  "module_slug": "target-module-slug",
  "slug": "project-slug",
  "title": "Project Title",
  "description": "Project overview.",
  "requirements": "Detailed markdown requirements.",
  "starter_code": "Code template here...",
  "difficulty": 2,
  "xp_reward": 100,
  "hints": ["Hint one", "Hint two"],
  "order_number": 1
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `lesson_slug` | string | yes | references lesson in the same course |
| `module_slug` | string | yes | references module in the same course |
| `slug` | string | yes | unique per lesson |
| `title` | string | yes | |
| `description` | string | no | |
| `requirements` | string | no | markdown |
| `starter_code` | string | no | code template |
| `difficulty` | integer | no | 1-5 |
| `xp_reward` | integer | no | default 100 |
| `hints` | string[] | no | |
| `order_number` | integer | no | |

---

## 5. Quiz Metadata Contract

Stored in `lesson_sections.metadata` as JSONB for `section_type = 'quiz'`:

```json
{
  "question": "What keyword declares a variable in Go?",
  "options": ["var", "let", "const", "def"],
  "correct_index": 0,
  "explanation": "Go uses 'var' to declare variables."
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `question` | string | yes | supports inline markdown |
| `options` | string[] | yes | 4 preferred (A/B/C/D), min 2 |
| `correct_index` | integer | yes | **0-based** index into `options` |
| `explanation` | string | yes | shown after answering |

---

## 6. Multi-File Exercise Metadata

Stored in `lesson_sections.metadata` for `section_type = 'exercises'` or `'mini_project'`:

```json
{
  "multiFile": {
    "files": [
      {
        "path": "main.py",
        "content": "from utils import helper\n\nresult = helper()\nprint(result)\n"
      },
      {
        "path": "utils.py",
        "content": "def helper():\n    return 'Hello from utils!'\n"
      }
    ],
    "entryPoint": "main.py"
  }
}
```

When `metadata.multiFile` is truthy, the frontend renders a **tabbed MultiFileEditor** + PyodideConsole split instead of the simple single-file Monaco editor.

---

## 7. Exercise Mode Decision Tree

The frontend `SectionExercise` component renders exercises in 4 modes:

| Mode | Condition | Rendering |
|---|---|---|
| **A — Problem References** | `lesson.problem_references` non-empty | Grid of LearningCards linking to `/problems/{slug}` |
| **B — Inline Python** | Empty refs, `language=python`, no `multiFile` metadata | 60/40 Monaco + PyodideConsole split |
| **C — Standalone Go** | Empty refs, `language=go` | Read-only Monaco (no in-browser execution) |
| **D — Multi-File** | `section.metadata.multiFile` is truthy | Tabbed MultiFileEditor + PyodideConsole |

---

## 8. CLI Tool Usage

```sh
go run cmd/generate-curriculum/main.go --in curriculum.json --out migrations/seed.sql
```

**Flags:**

| Flag | Default | Description |
|---|---|---|
| `--in` | `curriculum.json` | Input JSON file path |
| `--out` | `seed.sql` | Output SQL migration file path |

**Validation:**
- `course.slug` is required
- At least 1 module required
- Sections without content use empty `INSERT` (no dollar-quoting)
- Sections with content use `$py$...$py$` dollar quoting
- Metadata JSONB uses `$json$...$json$` dollar quoting
- Auto-increments dollar-quote delimiter if content contains the delimiter string

**Idempotency:**
- Every INSERT has `ON CONFLICT DO NOTHING`
- Safe to re-run against the same database

---

## 9. SQL Generation Patterns

### 9.1 Course INSERT
```sql
INSERT INTO courses (slug, title, description, difficulty_level, estimated_hours, order_number, visible)
VALUES ('course-slug', 'Course Title', 'Description...', 1, 20, 13, false)
ON CONFLICT (slug) DO NOTHING;
```

### 9.2 Module INSERT (UNION ALL)
```sql
INSERT INTO modules (course_id, slug, title, description, order_number, visible)
SELECT c.id, 'module-1', 'Module 1', 'Description', 1, false
FROM courses c WHERE c.slug = 'course-slug'
UNION ALL
SELECT c.id, 'module-2', 'Module 2', 'Description', 2, false
FROM courses c WHERE c.slug = 'course-slug'
ON CONFLICT (course_id, slug) DO NOTHING;
```

### 9.3 Lesson INSERT (UNION ALL with JOIN)
```sql
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'lesson-slug', 'Lesson Title', 'Description', 1, 15, 50, 1, false, ARRAY['existing-problem']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'course-slug' AND m.slug = 'module-slug'
ON CONFLICT (module_id, slug) DO NOTHING;
```

### 9.4 Section INSERT (with $py$ dollar quoting for content)
```sql
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'explanation', 'Section Title',
$py$Markdown content here...
```go
fmt.Println("hello")
```
$py$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'course-slug' AND m.slug = 'module-slug' AND l.slug = 'lesson-slug';
```

### 9.5 Quiz Metadata UPDATE
```sql
UPDATE lesson_sections
SET metadata = $json${
  "question": "What is...",
  "options": ["A", "B", "C", "D"],
  "correct_index": 0,
  "explanation": "Explanation text."
}$json$::jsonb
WHERE section_type = 'quiz' AND title = 'Quick Check'
  AND lesson_id = (SELECT l2.id FROM lessons l2
    JOIN modules m2 ON l2.module_id = m2.id
    JOIN courses c2 ON m2.course_id = c2.id
    WHERE c2.slug = 'course-slug' AND m2.slug = 'module-slug' AND l2.slug = 'lesson-slug');
```

### 9.6 Dependency INSERT (cross-module supported)
```sql
-- Same-module dependency:
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'course-slug' AND m.slug = 'module-1' AND l.slug = 'lesson-2'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'course-slug' AND l.slug = 'lesson-1')  -- course-wide search (no m.slug filter)
ON CONFLICT DO NOTHING;

-- Cross-module dependency:
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'course-slug' AND m.slug = 'module-2' AND l.slug = 'lesson-3'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'course-slug' AND l.slug = 'lesson-1')  -- no m.slug = course-wide lookup
ON CONFLICT DO NOTHING;
```

The prerequisite subquery **drops the `m.slug` filter** — it searches the entire course. This means `lesson-1` in `module-1` can be a prerequisite for `lesson-3` in `module-2`.

### 9.7 Project INSERT
```sql
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'project-slug', 'Project Title', 'Description',
$py$## Requirements
1. First step
2. Second step
$py$,
$py$def starter():
    pass
$py$,
2, 100, ARRAY['Hint one', 'Hint two']::TEXT[], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'course-slug' AND m.slug = 'module-slug' AND l.slug = 'lesson-slug'
ON CONFLICT (lesson_id, slug) DO NOTHING;
```

---

## 10. Existing Course Catalog

| order_number | Slug | Title | Language | Modules | Lessons |
|---|---|---|---|---|---|
| 1 | `go-fundamentals` | Go Fundamentals | Go | 5 | 12+ |
| 2 | `python-basics` | Python Basics | Python | 4 | 8+ |
| 3 | `data-structures-go` | Data Structures in Go | Go | 4 | 8+ |
| 4 | `python-intermediate` | Python Intermediate | Python | 3 | 6+ |
| 5 | `algorithms` | Algorithms & Problem Solving | Go | 4 | 8+ |
| 10 | `python-mastery` | Python Mastery: From Zero to Hero | Python | 4 | 14+ |
| 11 | `python-practice` | Python Practice | Python | 1 | varies |
| 12 | `python-mastery-games` | Python Mastery: Build Your Own Games | Python | 2 | 6+ |
| 13 | `ai-fluency` | AI Fluency: Foundations for AI Engineering | Python | 5 | 25 |

> **New courses must use `order_number >= 13`.**

---

## 11. Business Rules

### Difficulty Scale
| Value | Label |
|---|---|
| 1 | Beginner |
| 2 | Easy |
| 3 | Medium |
| 4 | Hard |
| 5 | Expert |

### XP Defaults
- Lessons: `xp_reward = 50` (can override)
- Projects: `xp_reward = 100` (can override)
- XP is awarded **only on first completion** (GREATEST pattern in upsert)

### Section Canonical Order
The recommended section order within a lesson:

```
overview → explanation → examples
→ [best_practices] → [common_mistakes]
→ exercises/assessment/mini_project
→ [quiz] → summary
```

Sections in brackets are optional.

### Visibility
- All entities (`courses`, `modules`, `lessons`, `projects`) default to `visible = false`
- Admins toggle visibility via admin panel
- Student-facing endpoints filter by `visible = true`

### Slug Conventions
- Lowercase, hyphen-separated, URL-safe
- Unique within parent scope:
  - `courses.slug` — globally unique
  - `modules.slug` — unique per course
  - `lessons.slug` — unique per module
  - `projects.slug` — unique per lesson

### Language Detection
The system doesn't store language on entities. Language is inferred from the course/module context:
- Course slug contains `"python"` or module `language` field = `"python"` → Python
- Course slug looks like `"go-fundamentals"` → Go
- Used for exercise mode routing only

### Progress Rules
- **Never decreases**: `GREATEST()` on `progress_pct` and `xp_awarded`
- **Course progress formula**: `completed_visible_lessons / total_visible_lessons * 100`
- **First completion only**: XP awarded once; re-completing a lesson grants 0 XP
- **sessionStorage**: Completed lesson IDs stored in `koder_completed_lessons` for immediate UI update

### Dependency Rules
- Creates a DAG — a lesson is locked until all dependencies are completed
- Dependencies can cross modules (within the same course)
- Self-referencing dependencies are blocked by CHECK constraint
- Always use `ON CONFLICT DO NOTHING`

### Section Type Descriptions

| Type | Purpose | Content | Metadata |
|---|---|---|---|
| `overview` | Learning goals / intro | Markdown | none |
| `explanation` | Teaching the concept | Markdown with examples | none |
| `examples` | Code walkthroughs | Markdown | none |
| `best_practices` | Idiomatic patterns | Markdown | none |
| `common_mistakes` | Pitfalls | Markdown | none |
| `summary` | Recap | Markdown | none |
| `quiz` | MCQ | Empty `""` | `QuizMetadata` JSONB |
| `exercises` | Coding exercise | Markdown instructions | `multiFile` JSONB (optional) |
| `mini_project` | Small project | Markdown instructions | `multiFile` JSONB (optional) |
| `assessment` | Graded test | Markdown instructions | `multiFile` JSONB (optional) |
| `ai_review` | AI-generated review | Markdown | none |

### Dollar-Quoting Rules
- Multi-line content → `$py$...$py$` delimiters (auto-increments to `$py0$`, `$py1$` if content contains `$py$`)
- JSONB metadata → `$json$...$json$` delimiters (same auto-increment logic)
- Empty content → `''` (no dollar-quoting)

---

## 12. Complete Minimal Example

A 2-module, 6-lesson course with all section types, one quiz, one multi-file exercise, one project, and a cross-module dependency:

**Input (`example.json`):**
```json
{
  "course": {
    "slug": "python-scripting",
    "title": "Python Scripting Fundamentals",
    "description": "Learn Python scripting from scratch.",
    "difficulty_level": 1,
    "estimated_hours": 8,
    "order_number": 14
  },
  "modules": [
    {
      "slug": "basics",
      "title": "Python Basics",
      "description": "Variables, I/O, and control flow.",
      "order_number": 1,
      "language": "python",
      "lessons": [
        {
          "slug": "hello-python",
          "title": "Hello, Python!",
          "description": "First program and print().",
          "difficulty": 1,
          "estimated_minutes": 10,
          "xp_reward": 50,
          "order_number": 1,
          "problem_references": [],
          "dependencies": [],
          "sections": [
            {
              "section_type": "overview",
              "title": "What You'll Learn",
              "content": "Write your first Python program using `print()`.",
              "metadata": null
            },
            {
              "section_type": "explanation",
              "title": "The print() Function",
              "content": "`print()` outputs text to the console.\n\n```python\nprint(\"Hello, World!\")\n```",
              "metadata": null
            },
            {
              "section_type": "quiz",
              "title": "Quick Check",
              "content": "",
              "metadata": {
                "question": "What does print() do?",
                "options": ["Reads input", "Outputs text", "Creates a variable", "Imports a module"],
                "correct_index": 1,
                "explanation": "print() outputs text to the console."
              }
            },
            {
              "section_type": "summary",
              "title": "Key Points",
              "content": "- print() outputs text\n- Strings go in quotes\n- Parentheses are required",
              "metadata": null
            }
          ]
        },
        {
          "slug": "variables",
          "title": "Variables & Data Types",
          "description": "Storing and using data.",
          "difficulty": 1,
          "estimated_minutes": 15,
          "xp_reward": 50,
          "order_number": 2,
          "problem_references": ["py-variables"],
          "dependencies": ["hello-python"],
          "sections": [
            {
              "section_type": "overview",
              "title": "What You'll Learn",
              "content": "Variables, strings, numbers, and booleans.",
              "metadata": null
            },
            {
              "section_type": "explanation",
              "title": "Variables",
              "content": "```python\nname = \"Alice\"\nage = 25\n```",
              "metadata": null
            },
            {
              "section_type": "exercises",
              "title": "Your Turn",
              "content": "Create a variable with your name and print it.",
              "metadata": null
            }
          ]
        }
      ]
    },
    {
      "slug": "functions",
      "title": "Functions",
      "description": "Writing reusable code.",
      "order_number": 2,
      "language": "python",
      "lessons": [
        {
          "slug": "defining-functions",
          "title": "Defining Functions",
          "description": "Write your own functions.",
          "difficulty": 2,
          "estimated_minutes": 15,
          "xp_reward": 50,
          "order_number": 1,
          "problem_references": [],
          "dependencies": ["variables"],
          "sections": [
            {
              "section_type": "overview",
              "title": "Introduction",
              "content": "Functions group reusable code with `def`.",
              "metadata": null
            },
            {
              "section_type": "explanation",
              "title": "def Keyword",
              "content": "```python\ndef greet(name):\n    return f\"Hello, {name}!\"\n```",
              "metadata": null
            },
            {
              "section_type": "exercises",
              "title": "Multi-File Exercise",
              "content": "Write a helper module and import it.",
              "metadata": {
                "multiFile": {
                  "files": [
                    {"path": "main.py", "content": "from helpers import greet\n\nprint(greet(\"Alice\"))\n"},
                    {"path": "helpers.py", "content": "def greet(name):\n    return f\"Hello, {name}!\"\n"}
                  ],
                  "entryPoint": "main.py"
                }
              }
            }
          ]
        }
      ]
    }
  ],
  "projects": [
    {
      "lesson_slug": "defining-functions",
      "module_slug": "functions",
      "slug": "greeting-cli",
      "title": "Interactive Greeting CLI",
      "description": "Build a CLI that asks for a name and greets the user.",
      "requirements": "## Requirements\n1. Prompt the user for their name\n2. Print a personalized greeting\n3. Handle empty input gracefully",
      "starter_code": "name = input(\"Enter your name: \")\n",
      "difficulty": 1,
      "xp_reward": 100,
      "hints": ["Use input() to read the name", "Use f-strings for the greeting"],
      "order_number": 1
    }
  ]
}
```

Generate:
```sh
go run cmd/generate-curriculum/main.go --in example.json --out migrations/049_seed_python_scripting.sql
```

Review the output SQL, then run against your database:
```sql
-- In Supabase SQL Editor or psql:
\i migrations/049_seed_python_scripting.sql
```

Make visible to students:
```sql
UPDATE courses SET visible = true WHERE slug = 'python-scripting';
```

---

## Files in the Pipeline

| File | LOC | Role |
|---|---|---|
| `migrations/038_curriculum_cms.sql` | 149 | Schema — 8 tables + ENUM + 15 indexes |
| `migrations/044_add_module_locked.sql` | 5 | Adds `locked` column to modules |
| `migrations/045_add_module_locks.sql` | 5 | Problem-module locking (separate from curriculum) |
| `migrations/039_seed_curriculum.sql` | 589 | 5 starter courses |
| `migrations/040_complete_curriculum_content.sql` | 1,745 | Full content for all lessons |
| `migrations/041_seed_python_mastery.sql` | 1,992 | Python Mastery course |
| `migrations/042_seed_python_mastery_games.sql` | 1,347 | Games course |
| `migrations/043_seed_python_mastery_practice.sql` | 1,434 | Practice problems |
| `migrations/048_seed_ai_fluency.sql` | 3,140 | AI Fluency course (generated from JSON) |
| `cmd/generate-curriculum/main.go` | 318 | JSON-to-SQL generator CLI tool |
| `internal/store/curriculum.go` | 1,146 | All Store methods (35+) for curriculum + progress |
| `internal/store/types.go` | 225 | Go structs: Course, Module, Lesson, LessonSection, Project, etc. |
| `internal/api/cms.go` | 1,428 | 35+ student + admin API handlers |
| `internal/api/router.go` | — | Route registrations for all CMS endpoints |
| `frontend/lib/types.ts` | 244 | TypeScript interfaces mirroring Go structs |
