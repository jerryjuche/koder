# AI Curriculum Generation Prompt — Koder LMS

You are generating curriculum content for **Koder**, a zero-cost automated programming assignment grader for Go & Python curricula. This document explains the entire /learn course system so you can produce correct, production-ready JSON that passes the `cmd/generate-curriculum/main.go` pipeline.

---

## 1. Platform Identity

- **Purpose:** Students solve coding problems in a Monaco editor workspace, submit code, receive instant pass/fail results. The /learn section provides structured courses (Course → Module → Lesson → Section) with quizzes and in-browser code playgrounds.
- **Stack:** Go 1.26 backend (chi/v5, pgx/v5), Next.js 15 frontend (React 19, Tailwind CSS 4), PostgreSQL 15.
- **In-browser Python execution:** Pyodide v0.27.4 (loaded from CDN). Go execution requires backend submission against test cases.
- **Student journey:** Dashboard (`/home`) → Problem workspace (`/problems/{slug}`) → Learn courses (`/learn/courses`).

---

## 2. Curriculum Data Model

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

### Key column notes

| Entity | Key Columns | Notes |
|--------|-------------|-------|
| `courses` | slug UNIQUE, difficulty_level 1-5, estimated_hours, order_number, visible=false | Slug is globally unique |
| `modules` | course_id FK, slug UNIQUE PER COURSE, order_number, visible=false | Unique: (course_id, slug) |
| `lessons` | module_id FK, slug UNIQUE PER MODULE, difficulty 1-5, estimated_minutes, xp_reward (default 50), problem_references TEXT[], visible=false | Unique: (module_id, slug) |
| `lesson_sections` | lesson_id FK, section_type ENUM (11 types), content TEXT, metadata JSONB, order_number | Ordered by order_number |
| `projects` | lesson_id FK, slug UNIQUE PER LESSON, requirements, starter_code, hints TEXT[], difficulty, xp_reward (default 100), visible=false | Unique: (lesson_id, slug) |
| `lesson_dependencies` | lesson_id FK, depends_on_lesson_id FK | DAG, no self-ref |
| `course_progress` | (user_id, course_id) PK, progress_pct REAL (0-100) | |
| `lesson_progress` | (user_id, lesson_id) PK, completed BOOL, xp_awarded | |

---

## 3. Section Types — Complete Rendering Reference

There are **11 section types** (`lesson_section_type` ENUM). Each renders differently:

| Type | Badge Color | Icon | Description | Content Field | Notes |
|------|-------------|------|-------------|---------------|-------|
| `overview` | Blue | BookText | Learning objectives, "what you'll learn" | Markdown | Always first |
| `explanation` | Sky | FileText | Core concept teaching | Markdown with code blocks | |
| `examples` | Violet | Puzzle | Code walkthroughs | Markdown with code blocks | Multiple examples |
| `best_practices` | Emerald | Star | Idiomatic patterns | Markdown | Optional |
| `common_mistakes` | Rose | AlertTriangle | Pitfalls to avoid | Markdown | Optional |
| `exercises` | Teal | FlaskConical | Practice coding | Markdown instructions | **Exercise Mode Router** (see §4) |
| `assessment` | Indigo | FileCode | Formal assessment | Markdown instructions | Same router as exercises, different badge |
| `mini_project` | Purple | Target | Small capstone project | Markdown instructions | Same router as exercises, different badge |
| `quiz` | Orange | BrainCircuit | MCQ knowledge check | **Empty string** | Data in metadata JSONB (see §5) |
| `summary` | Amber | ScrollText | Key takeaways | Markdown (3-5 bullets) | Always last content section |
| `ai_review` | Fuchsia | Sparkles | AI-generated review | Markdown | Rarely used |

**Gradient styling per type** (used as card background): Each section type has a gradient like `from-{color}-500/10 via-{color}-500/5 to-transparent`.

### Callout Div Support

Content fields can use HTML callout divs that transform into styled boxes:

```html
<div class="tip">💡 Tip content here</div>
<div class="example">📝 Example content here</div>
<div class="warning">⚠️ Warning content here</div>
<div class="info">ℹ️ Info content here</div>
```

These render with a colored left border, background tint, and label header. Use them throughout content for emphasis.

### Content Markdown Rules

- Processed via react-markdown + remark-gfm + rehype-raw
- Code blocks: triple backticks with language (` ```python `, ` ```go `)
- Inline code: single backticks
- Tables, lists, blockquotes all render natively
- Links open in new tabs
- Content can contain HTML (including callout divs)
- Dollar-quoting syntax (`$py$...$py$`) used in SQL for multi-line content

---

## 4. Exercise Mode Decision Tree (CRITICAL)

This is the most important section. The `exercises`, `assessment`, and `mini_project` section types all use the same `SectionExercise` component, which has **four distinct modes** depending on the lesson's properties.

### Mode A: Problem References (problem_references array populated)

- **Condition:** `lesson.problem_references` is non-empty (e.g. `["hello-world", "fizzbuzz"]`)
- **Rendering:** Fetches problem data by slug → renders a grid of `LearningCard` components
- **Each card:** Shows title, truncated description, difficulty badge, XP, link to `/problems/{slug}`
- **Execution:** Problems are solved in the full workspace (`/problems/{slug}`), not inline
- **Use when:** You want students to solve existing problems from the problems table

### Mode B: Inline Python Playground (no refs, Python)

- **Condition:** `problem_references` is empty, `language=python`, no `multiFile` metadata
- **Rendering:** 60/40 resizable split pane: Monaco editor (60%) + PyodideConsole (40%)
- **Execution:** In-browser via Pyodide. Ctrl+Enter runs code. "Run in Browser" button available
- **Default code template:** `# Write Python code here\nprint("Hello, Python!")\n`
- **Use when:** Teaching concepts where students should experiment with code inline

### Mode C: Standalone Go Editor (no refs, Go)

- **Condition:** `problem_references` is empty, `language=go`
- **Rendering:** Standalone Monaco editor only (no console, no execution)
- **Execution:** NOT available in-browser. Go execution requires backend submission with test cases
- **Use when:** You must use problem_references for any Go executable exercise
- **IMPORTANT:** Go exercises should ALWAYS use Mode A (problem_references). Mode C is essentially read-only code exploration.

### Mode D: Multi-File Editor (multiFile metadata present)

- **Condition:** `section.metadata.multiFile` is truthy
- **Rendering:** Tabbed `MultiFileEditor` (Monaco tabs for each file) + PyodideConsole
- **Execution:** All files written to virtual Pyodide FS, entry point `exec`'d
- **Constraints:** Python-only (Pyodide execution)
- **Use when:** The exercise requires multiple files (e.g. module with imports, separate data/config file)
- **MultiFile metadata shape:**

```json
{
  "multiFile": {
    "files": [
      { "path": "main.py", "content": "from utils import helper\n\nresult = helper()\nprint(result)\n" },
      { "path": "utils.py", "content": "def helper():\n    return 'Hello from utils!'\n" }
    ],
    "entryPoint": "main.py"
  }
}
```

### How to Decide Per Exercise

1. If the exercise maps to an **existing problem** in the problems table → use Mode A (add slug to `problem_references`)
2. If the exercise is **Python, single-file, exploratory** (e.g. "try printing your name") → use Mode B (empty refs, Python)
3. If the exercise is **Python, multi-file** (e.g. separate test/data/config file) → use Mode D (add `multiFile` to metadata)
4. If the exercise is **Go** and needs execution → Mode A is the only option (add slug to `problem_references`)
5. If the exercise is **Go, read-only** (e.g. "examine this code") → Mode C (empty refs, Go) — rarely used

---

## 5. Quiz Metadata Contract

Quiz sections must have `content: ""` (empty string). All data goes in `metadata` JSONB:

```json
{
  "question": "What keyword declares a variable in Go?",
  "options": [
    "var",
    "let",
    "const",
    "def"
  ],
  "correct_index": 0,
  "explanation": "Go uses 'var' to declare variables, or ':=' for type inference."
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `question` | string | Required, supports markdown |
| `options` | string[] | Required, **exactly 4** preferred (A/B/C/D convention) |
| `correct_index` | integer | Required, **0-based** index into options array |
| `explanation` | string | Required, shown after answer submission |

### Rendering behavior
- Options displayed as A/B/C/D letter buttons (letter = `String.fromCharCode(65 + idx)`)
- Student clicks option → clicks "Submit Answer" → sees correct/incorrect feedback
- Correct: green checkmark, "Spot on!" message
- Incorrect: red X, "Not quite right." message, explanation shown, "Try Again" button
- If metadata is missing or malformed, shows "Quiz content unavailable" fallback

### Quiz Grouping
All quiz sections within a lesson are **grouped into a single "Quiz Review" step** at the end of the lesson flow, regardless of their `order_number`. Non-quiz sections maintain their declared order.

---

## 6. Projects Entity

Projects are standalone coding exercises attached to a lesson. They have their own database table:

```json
{
  "lesson_slug": "lesson-slug-here",
  "module_slug": "module-slug-here",
  "slug": "project-slug-here",
  "title": "Project Title",
  "description": "Short overview",
  "requirements": "1. Requirement one\n2. Requirement two\n3. Requirement three",
  "starter_code": "def main():\n    pass\n\nif __name__ == '__main__':\n    main()",
  "difficulty": 2,
  "xp_reward": 150,
  "hints": ["Hint one", "Hint two", "Hint three"],
  "order_number": 1
}
```

Projects are rendered via a dedicated component in the lesson viewer. They include completion tracking and XP rewards.

---

## 7. Dependencies System

- Lessons can declare dependencies on other lessons **within the same module** via the `dependencies` field (array of lesson slug strings)
- Backend returns `prerequisites_met: false` + 403 if any prereq is incomplete
- Frontend shows a locked overlay with unmet prerequisites listed
- **SessionStorage optimistic unlock:** When a lesson is completed, its ID is added to `sessionStorage["koder_completed_lessons"]` so that prerequisite checks update immediately without waiting for DB propagation
- **No self-dependencies allowed** (enforced by DB CHECK)
- **Cross-module dependencies within the same course** are fully supported. The `lesson_dependencies` table references `lessons.id` globally, and the SQL generation tool resolves the join via `courses` → `modules` → `lessons` — so Module 1's capstone can gate Module 2's opener without issue. Use this for cohesive curriculum design.
- Dependencies are lesson slugs, resolved to IDs by the SQL generation tool

---

## 8. Existing Course Catalog (DO NOT DUPLICATE)

These courses already exist with their `order_number`. New courses use `order_number >= 13`:

| order_number | Course Slug | Title | Language |
|---|---|---|---|
| 1 | `go-fundamentals` | Go Fundamentals | Go |
| 2 | `python-basics` | Python Basics | Python |
| 3 | `data-structures-go` | Data Structures in Go | Go |
| 4 | `python-intermediate` | Python Intermediate | Python |
| 5 | `algorithms` | Algorithms & Problem Solving | Go |
| 10 | `python-mastery` | Python Mastery: From Zero to Hero | Python |
| 11 | `python-practice` | Python Practice | Python |
| 12 | `python-mastery-games` | Python Mastery: Build Your Own Games | Python |
| — | `python-practicals` | Python Practicals | Python |

### Existing module slugs (for reference when setting dependencies or avoiding overlap)

**go-fundamentals:** `go-intro`, `go-variables-types`, `go-control-flow`, `go-functions`, `go-packages`
**python-basics:** `py-hello`, `py-variables`, `py-control`, `py-functions`
**data-structures-go:** `ds-arrays-slices`, `ds-maps`, `ds-linked-lists`, `ds-trees-graphs`
**python-intermediate:** `py-errors`, `py-comprehensions`, `py-file-io`
**algorithms:** `alg-sorting`, `alg-searching`, `alg-dp`, `alg-graphs`
**python-mastery:** `py-mastery-foundations`, `py-mastery-control-flow`, `py-mastery-functions-dicts`, `py-mastery-real-world`
**python-mastery-games:** `py-games-classics`, `py-games-worldbuilding`
**python-practice:** (single module)
**python-practicals:** (single module)

---

## 9. Existing Problem Slugs (For Mode A Exercise References)

Key problems available by module. Reference these via `problem_references` array:

**math-recursion:** `fibonacci`, `factorial`, `gcd`, `is-power-of-two`, `sum-natural-numbers`, `count-digits`, `reverse-number`, `collatz-conjecture`, `is-palindrome-number`, `tribonacci`, `ackermann`, `josephus`, `run-length-encoding`, `nth-root`, `modular-exponentiation`, `fast-exponentiation`, `sieve-of-eratosthenes`, `prime-factors`, `is-perfect-number`, `is-armstrong-number`, `newman-conway-sequence`, `look-and-say`, `pascals-triangle`, `catalan-number`, `happy-number`, `harshad-number`, `is-ugly-number`, `is-disarium-number`, `kaprekar-constant`

**arrays-strings:** `reverse-string`, `is-palindrome`, `max-min`, `two-sum`, `remove-duplicates`, `rotate-array`, `is-anagram`, `first-non-repeating`, `merge-sorted-arrays`, `missing-number`, `contains-duplicate`, `best-time-stock`, `plus-one`, `move-zeroes`, `valid-parentheses`, `longest-common-prefix`, `count-vowels`, `string-compression`, `is-subsequence`, `array-intersection`, `majority-element`, `third-max`, `find-disappeared-numbers`, `max-consecutive-ones`, `height-checker`, `relative-sort-array`, `sort-array-by-parity`, `valid-mountain-array`, `replace-elements`, `decompress-list`

**sorting-searching:** `binary-search`, `first-bad-version`, `search-insert-position`, `peak-index-in-mountain`, `sqrtx`, `guess-number`, `kth-missing-positive`, `intersection-of-two-arrays`, `valid-perfect-square`, `search-in-rotated-sorted`, `find-minimum-rotated`, `two-sum-ii`, `arranging-coins`, `is-subsequence-binary`, `find-smallest-letter`, `count-negative-in-grid`

**error-handling, interfaces-generics:** `error-message-for-code`, `safe-division`, `type-switch-sum`, `json-validator`

**hashing:** `two-sum-hash`, `first-repeating-character`, `count-frequency`, `group-anagrams`, `subarray-sum-equals-k`, `longest-consecutive-sequence`, `top-k-frequent`, `valid-sudoku`, `intersection-of-arrays`, `happy-number-hash`, `isomorphic-strings`, `word-pattern`, `find-duplicate-subtrees`, `set-matrix-zeroes`, `spiral-matrix`, `rotate-image`

**linked-lists:** `reverse-linked-list`, `middle-of-linked-list`, `detect-cycle`, `merge-two-sorted-lists`, `remove-nth-from-end`, `palindrome-linked-list`, `intersection-of-lists`, `odd-even-linked-list`, `swap-nodes-in-pairs`, `flatten-multilevel`

**trees-graphs:** `max-depth-binary-tree`, `invert-tree`, `validate-bst`, `level-order-traversal`, `symmetri-tree`, `diameter-tree`, `sorted-array-to-bst`, `same-tree`, `is-balanced`, `lowest-common-ancestor`, `binary-tree-paths`, `sum-left-leaves`, `path-sum`, `count-nodes`, `merge-trees`, `average-levels`, `find-mode-bst`, `minimum-depth-binary-tree`, `convert-bst-greater`, `flatten-tree-to-list`

**dynamic-programming:** `fibonacci-dp`, `climbing-stairs`, `min-cost-climbing`, `house-robber`, `max-subarray`, `coin-change`, `longest-increasing-subsequence`, `edit-distance`, `unique-paths`, `knapsack`, `partition-equal-subset`, `decode-ways`, `palindromic-substrings`, `count-bits`, `nth-tribonacci`, `min-path-sum`, `longest-palindromic-subsequence`, `two-keys-keyboard`, `counting-bits-cli`, `delete-and-earn`

**Python-only:** `py-hello-world`, `py-even-or-odd`, `py-reverse-string`, `py-sum-list`, `py-palindrome-check`, `py-factorial`, `py-double-it`, `py-vars-math-calc`, `py-avg-calculator`, `py-trim-ends`, + many more in python-practice and python-practicals modules.

---

## 10. Business Rules — REQUIRED CHECKLIST

1. **All entities default `visible=false`.** Students only see visible=true items. Admins publish via toggle. Invisible items return 404 to students.
2. **`ON CONFLICT DO NOTHING`** on all INSERTs for idempotency. Re-running the seed is safe.
3. **XP is awarded only on first completion.** Re-completing a lesson grants 0 XP. Default lesson XP = 50, default project XP = 100.
4. **Progress never decreases.** Uses `GREATEST()` SQL pattern. `completed_at` is preserved on re-completion.
5. **Course progress formula:** `completed_visible_lessons / total_visible_lessons * 100`.
6. **Quizzes are frontend-grouped** into one "Quiz Review" step at the end regardless of `order_number`. Non-quiz sections maintain their order.
7. **Difficulty scale:** 1=Beginner, 2=Easy, 3=Medium, 4=Hard, 5=Expert.
8. **Canonical section order:** overview → explanation → examples → [best_practices] → [common_mistakes] → exercises/assessment/mini_project → [quiz] → summary. Bracketed items are optional.
9. **Language detection per course:** If `course.slug` contains "python" → language="python". If it contains "-go" or starts with "go-" → language="go". Default = "python".
10. **Dollar-quoting for multi-line content:** Use `$py$...$py$` for content with embedded single quotes or newlines. Use `$json$...$json$` for JSONB metadata.
11. **Slugs:** lowercase, hyphen-separated, unique within parent scope.
12. **Module language field:** Used only for exercise mode routing. Not stored in DB (computed by frontend from course slug pattern).

---

## 11. Expected JSON Input Format (For `generate-curriculum` CLI Tool)

```json
{
  "course": {
    "slug": "python-advanced",
    "title": "Python Advanced",
    "description": "Advanced Python concepts including decorators, generators, context managers...",
    "difficulty_level": 3,
    "estimated_hours": 20,
    "order_number": 13
  },
  "modules": [
    {
      "slug": "py-advanced-decorators",
      "title": "Decorators & Closures",
      "description": "Master decorators from scratch...",
      "order_number": 1,
      "language": "python",
      "lessons": [
        {
          "slug": "intro-to-decorators",
          "title": "Introduction to Decorators",
          "description": "What decorators are and why they matter...",
          "difficulty": 2,
          "estimated_minutes": 20,
          "xp_reward": 50,
          "order_number": 1,
          "problem_references": [],
          "dependencies": [],
          "sections": [
            {
              "section_type": "overview",
              "title": "What You'll Learn",
              "content": "In this lesson, you will learn:\n\n- What decorators are\n- How to write a simple decorator\n- The @ syntax"
            },
            {
              "section_type": "quiz",
              "title": "Quick Check",
              "content": "",
              "metadata": {
                "question": "What symbol is used to apply a decorator?",
                "options": ["@", "#", "$", "&"],
                "correct_index": 0,
                "explanation": "The @ symbol is syntactic sugar for applying a decorator to a function."
              }
            }
          ]
        }
      ]
    }
  ],
  "projects": [
    {
      "lesson_slug": "intro-to-decorators",
      "module_slug": "py-advanced-decorators",
      "slug": "timing-decorator",
      "title": "Build a Timing Decorator",
      "description": "Create a decorator that measures execution time...",
      "requirements": "1. Create a @timer decorator\n2. Use it on a slow Fibonacci function\n3. Support optional precision parameter",
      "starter_code": "def timer(func):\n    pass\n\n@timer\ndef slow_fib(n):\n    if n <= 1:\n        return n\n    return slow_fib(n-1) + slow_fib(n-2)\n",
      "difficulty": 2,
      "xp_reward": 150,
      "hints": ["Use time.perf_counter()", "functools.wraps is your friend"],
      "order_number": 1
    }
  ]
}
```

This JSON feeds into `cmd/generate-curriculum/main.go` via `--in curriculum.json --out seed.sql`.

---

## 12. Quality Checklist (AI Self-Verification)

Before marking a curriculum generation task as complete, verify:

- [ ] Course `order_number` is 13+ (no overlap with existing courses 1-12)
- [ ] All entity slugs are unique within their scope
- [ ] `problem_references` slugs exist in the problems table (or are left empty for playground mode)
- [ ] Exercise mode decision is correct per §4 — Go exercises have problem_references, Python playgrounds have empty refs
- [ ] Quiz sections have `content: ""` and valid `metadata` with 0-based `correct_index`
- [ ] Quiz `correct_index` is valid for the `options` array length
- [ ] Multi-file exercises use correct `metadata.multiFile` shape with valid `entryPoint`
- [ ] Dependencies reference lesson slugs within the same course (cross-module is fine)
- [ ] Dependency lessons have lower `order_number` than the dependent lesson (within their module)
- [ ] Content fields use callout divs appropriately (tips, warnings, examples, info)
- [ ] Content uses proper markdown code blocks with language tags (```python, ```go)
- [ ] Lesson sections follow canonical order (overview → explanation → examples → ... → summary)
- [ ] XP rewards: 40-60 for lessons, 100-200 for projects
- [ ] Difficulty scores are 1-5
- [ ] Short, concise descriptions (1-2 sentences) that tell the student what they'll achieve
- [ ] Projects include `lesson_slug` and `module_slug` that match actual lesson/module slugs
- [ ] Every `visible` field is `false` (admins publish manually)
