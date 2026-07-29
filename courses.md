# Koder Curriculum CMS — Full Reference for AI Seeding

## 1. Hierarchy Overview

Course → Module → Lesson → Section (ordered)
                      → Project (optional, per lesson)
                      → Dependencies (prerequisite DAG between lessons)

```
courses (1)
  └── modules (N)            [UNIQUE(course_id, slug)]
        └── lessons (N)      [UNIQUE(module_id, slug)]
              ├── lesson_sections (N)  [ordered by order_number]
              │     └── metadata JSONB (quiz questions, multi-file config)
              ├── lesson_dependencies  [prerequisite DAG]
              ├── projects (N)        [optional capstone per lesson]
              └── problem_references  [TEXT[] linking to existing problems table]
```

## 2. Database Schema

### ENUM: lesson_section_type
11 values:
`overview`, `explanation`, `examples`, `best_practices`, `common_mistakes`, `summary`,
`quiz`, `exercises`, `mini_project`, `assessment`, `ai_review`

### courses
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | UUID | PK, gen_random_uuid() | |
| slug | TEXT | NOT NULL, UNIQUE | |
| title | TEXT | NOT NULL | |
| description | TEXT | NOT NULL | '' |
| image_url | TEXT | | NULL |
| icon | TEXT | | NULL |
| difficulty_level | INTEGER | CHECK 1-5 | 1 |
| estimated_hours | INTEGER | NOT NULL | 0 |
| order_number | INTEGER | NOT NULL | 0 |
| visible | BOOLEAN | NOT NULL | false |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() |

### modules
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | UUID | PK, gen_random_uuid() | |
| course_id | UUID | FK → courses(id) ON DELETE CASCADE | |
| slug | TEXT | NOT NULL | |
| title | TEXT | NOT NULL | |
| description | TEXT | NOT NULL | '' |
| image_url | TEXT | | NULL |
| order_number | INTEGER | NOT NULL | 0 |
| visible | BOOLEAN | NOT NULL | false |
| locked | BOOLEAN | NOT NULL | false |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() |
| UNIQUE | (course_id, slug) | | |

### lessons
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | UUID | PK, gen_random_uuid() | |
| module_id | UUID | FK → modules(id) ON DELETE CASCADE | |
| slug | TEXT | NOT NULL | |
| title | TEXT | NOT NULL | |
| description | TEXT | NOT NULL | '' |
| raw_readme | TEXT | NOT NULL | '' |
| difficulty | INTEGER | CHECK 1-5 | 1 |
| estimated_minutes | INTEGER | NOT NULL | 10 |
| xp_reward | INTEGER | NOT NULL | 50 |
| order_number | INTEGER | NOT NULL | 0 |
| visible | BOOLEAN | NOT NULL | false |
| problem_references | TEXT[] | NOT NULL | '{}' |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() |
| UNIQUE | (module_id, slug) | | |

### lesson_dependencies
| Column | Type | Constraints |
|---|---|---|
| lesson_id | UUID | FK → lessons(id) ON DELETE CASCADE |
| depends_on_lesson_id | UUID | FK → lessons(id) ON DELETE CASCADE |
| PRIMARY KEY | (lesson_id, depends_on_lesson_id) | |
| CHECK | lesson_id != depends_on_lesson_id | |

### lesson_sections
| Column | Type | Constraints |
|---|---|---|
| id | UUID PK | gen_random_uuid() |
| lesson_id | UUID | FK → lessons(id) ON DELETE CASCADE |
| section_type | lesson_section_type | NOT NULL (ENUM) |
| title | TEXT | NOT NULL DEFAULT '' |
| content | TEXT | NOT NULL DEFAULT '' |
| metadata | JSONB | NOT NULL DEFAULT '{}' |
| order_number | INTEGER | NOT NULL DEFAULT 0 |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### projects
| Column | Type | Constraints | Default |
|---|---|---|---|
| id | UUID PK | gen_random_uuid() | |
| lesson_id | UUID | FK → lessons(id) ON DELETE CASCADE | |
| slug | TEXT | NOT NULL | |
| title | TEXT | NOT NULL | |
| description | TEXT | NOT NULL | '' |
| requirements | TEXT | NOT NULL | '' |
| starter_code | TEXT | NOT NULL | '' |
| difficulty | INTEGER | CHECK 1-5 | 1 |
| xp_reward | INTEGER | NOT NULL | 100 |
| hints | TEXT[] | NOT NULL | '{}' |
| order_number | INTEGER | NOT NULL | 0 |
| visible | BOOLEAN | NOT NULL | false |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() |
| UNIQUE | (lesson_id, slug) | | |

### progress tables

#### course_progress
| Column | Type | Constraints |
|---|---|---|
| user_id | UUID | FK → users(id) ON DELETE CASCADE |
| course_id | UUID | FK → courses(id) ON DELETE CASCADE |
| started_at | TIMESTAMPTZ | DEFAULT NOW() |
| completed_at | TIMESTAMPTZ | NULL |
| progress_pct | REAL | CHECK 0-100, DEFAULT 0 |
| PK | (user_id, course_id) | |

#### lesson_progress
| Column | Type | Constraints |
|---|---|---|
| user_id | UUID | FK → users(id) ON DELETE CASCADE |
| lesson_id | UUID | FK → lessons(id) ON DELETE CASCADE |
| completed | BOOLEAN | DEFAULT false |
| xp_awarded | INTEGER | DEFAULT 0 |
| completed_at | TIMESTAMPTZ | NULL |
| PK | (user_id, lesson_id) | |

## 3. Implementation Details

### 3.1 Problem References
- `problem_references` is a TEXT[] column on lessons referencing problem slugs from the `problems` table (not FK)
- DB-level cleanup via COALESCE+UNNEST+EXISTS in all lesson queries
- Frontend SectionExercise fetches problems by slug → renders LearningCard links
- Empty references → code playground with Pyodide (Python) or standalone editor (Go)

### 3.2 Section Content
- All content is Markdown, rendered with react-markdown + remark-gfm + rehype-raw
- Custom callouts via HTML divs:
  ```html
  <div class="tip">content</div>
  <div class="example">content</div>
  <div class="warning">content</div>
  <div class="info">content</div>
  ```
- Code blocks get Shiki syntax highlighting

### 3.3 Quiz Metadata (JSONB)
```json
{
  "question": "What is the correct syntax?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_index": 0,
  "explanation": "Because X is the correct approach."
}
```
- `correct_index` is 0-based
- Frontend: lettered (A/B/C/D) option cards, correct=green, wrong=red, feedback panel

### 3.4 Multi-File Exercises (metadata JSONB)
```json
{
  "multiFile": {
    "files": [
      {"path": "main.py", "content": "print('hello')\n"},
      {"path": "utils.py", "content": "def helper():\n    pass\n"}
    ],
    "entryPoint": "main.py"
  }
}
```
- Present → tabbed multi-file Monaco editor + PyodideConsole split
- Absent + Python → single-file editor + PyodideConsole split
- Absent + Go → standalone editor only

### 3.5 Section Behavior by Type
- **exercises / assessment**: problem_references → LearningCard links; empty → code playground
- **mini_project**: same as exercises but themed differently (badge/icon)
- **quiz**: renders MCQ from metadata JSONB
- All other types: render markdown content with type-specific gradient header

### 3.6 Dependency Graph
- DAG via `lesson_dependencies` table with self-reference CHECK constraint
- CompleteLesson endpoint: 403 PREREQ_NOT_MET if any prereq incomplete
- XP only on first completion (GREATEST pattern)
- Client-side optimistic unlock via sessionStorage `koder_completed_lessons`

### 3.7 Progress Tracking
- **Lesson**: `lesson_progress` — completed, xp_awarded (GREATEST), completed_at
- **Course**: `course_progress` — progress_pct (GREATEST), completed_at
- **User XP**: `users.xp += xp` — simple accumulation
- Course pct = completed_visible_lessons / total_visible_lessons * 100

### 3.8 WebSocket Events (on CompleteLesson)
1. `lesson.completed` → { user_id, lesson_id, xp_awarded }
2. `user.xp.updated` → { user_id, xp_awarded }
3. `progress.updated` → { user_id, lesson_id, xp_awarded, progress_pct }

### 3.9 Visibility System
All entities default `visible=false`. Students see only visible=true. Admins see all. Enables draft/publish workflow.

## 4. Go Types

```go
type Course struct {
    ID               pgtype.UUID
    Slug             string
    Title            string
    Description      string
    ImageURL         *string
    Icon             *string
    DifficultyLevel  int    // 1-5
    EstimatedHours   int
    OrderNumber      int
    Visible          bool
    CreatedAt        time.Time
    UpdatedAt        time.Time
}

type Module struct {
    ID          pgtype.UUID
    CourseID    pgtype.UUID
    Slug        string
    Title       string
    Description string
    ImageURL    *string
    OrderNumber int
    Visible     bool
    Locked      bool
    CreatedAt   time.Time
    UpdatedAt   time.Time
}

type Lesson struct {
    ID                pgtype.UUID
    ModuleID          pgtype.UUID
    Slug              string
    Title             string
    Description       string
    RawReadme         string
    Difficulty        int      // 1-5
    EstimatedMinutes  int
    XPReward          int
    OrderNumber       int
    Visible           bool
    ProblemReferences []string
    CreatedAt         time.Time
    UpdatedAt         time.Time
}

type LessonSection struct {
    ID          pgtype.UUID
    LessonID    pgtype.UUID
    SectionType string           // ENUM value
    Title       string
    Content     string           // Markdown
    Metadata    json.RawMessage  // JSONB
    OrderNumber int
    CreatedAt   time.Time
}

type Project struct {
    ID           pgtype.UUID
    LessonID     pgtype.UUID
    Slug         string
    Title        string
    Description  string
    Requirements string
    StarterCode  string
    Difficulty   int      // 1-5
    XPReward     int
    Hints        []string
    OrderNumber  int
    Visible      bool
    CreatedAt    time.Time
    UpdatedAt    time.Time
}

type LessonPrereq struct {
    LessonID          pgtype.UUID
    DependsOnLessonID pgtype.UUID
}

type QuizMetadata struct {
    Question     string   `json:"question"`
    Options      []string `json:"options"`
    CorrectIndex int      `json:"correct_index"`
    Explanation  string   `json:"explanation"`
}

type CourseWithModules struct {
    Course
    Modules          []Module
    Progress         *CourseProgress
    TotalLessons     int
    CompletedLessons int
}

type LessonWithSections struct {
    Lesson
    Sections         []LessonSection
    Dependencies     []LessonPrereq
    Projects         []Project
    Progress         *LessonProgress
    PrerequisitesMet bool
}

type NewCourse struct {
    Slug            string  `json:"slug"`
    Title           string  `json:"title"`
    Description     string  `json:"description,omitempty"`
    ImageURL        *string `json:"image_url,omitempty"`
    Icon            *string `json:"icon,omitempty"`
    DifficultyLevel int     `json:"difficulty_level"`
    EstimatedHours  int     `json:"estimated_hours"`
    OrderNumber     int     `json:"order_number"`
}

type NewModule struct {
    CourseID    string  `json:"course_id"`
    Slug        string  `json:"slug"`
    Title       string  `json:"title"`
    Description string  `json:"description,omitempty"`
    ImageURL    *string `json:"image_url,omitempty"`
    OrderNumber int     `json:"order_number"`
}

type NewLesson struct {
    ModuleID          string   `json:"module_id"`
    Slug              string   `json:"slug"`
    Title             string   `json:"title"`
    Description       string   `json:"description,omitempty"`
    RawReadme         string   `json:"raw_readme,omitempty"`
    Difficulty        int      `json:"difficulty"`
    EstimatedMinutes  int      `json:"estimated_minutes"`
    XPReward          int      `json:"xp_reward"`
    OrderNumber       int      `json:"order_number"`
    ProblemReferences []string `json:"problem_references,omitempty"`
    Visible           bool     `json:"visible"`
}

type NewLessonSection struct {
    SectionType string          `json:"section_type"`
    Title       string          `json:"title,omitempty"`
    Content     string          `json:"content,omitempty"`
    Metadata    json.RawMessage `json:"metadata,omitempty"`
    OrderNumber int             `json:"order_number"`
}

type NewProject struct {
    LessonID     string   `json:"lesson_id"`
    Slug         string   `json:"slug"`
    Title        string   `json:"title"`
    Description  string   `json:"description,omitempty"`
    Requirements string   `json:"requirements,omitempty"`
    StarterCode  string   `json:"starter_code,omitempty"`
    Difficulty   int      `json:"difficulty"`
    XPReward     int      `json:"xp_reward"`
    Hints        []string `json:"hints,omitempty"`
    OrderNumber  int      `json:"order_number"`
}
```

## 5. TypeScript Types

```typescript
type SectionType =
  | "overview" | "explanation" | "examples" | "best_practices"
  | "common_mistakes" | "summary" | "quiz" | "exercises"
  | "mini_project" | "assessment" | "ai_review";

interface Course {
  id: string; slug: string; title: string; description: string;
  image_url?: string; icon?: string; difficulty_level: number;
  estimated_hours: number; order_number: number; visible: boolean;
  created_at: string; updated_at: string;
}

interface Module {
  id: string; course_id: string; slug: string; title: string;
  description: string; image_url?: string; order_number: number;
  visible: boolean; locked: boolean; created_at: string; updated_at: string;
  // response-only:
  lessons?: Lesson[]; lesson_count?: number; completed_lessons?: number;
}

interface Lesson {
  id: string; module_id: string; slug: string; title: string;
  description: string; raw_readme: string; difficulty: number;
  estimated_minutes: number; xp_reward: number; order_number: number;
  visible: boolean; problem_references: string[];
  created_at: string; updated_at: string;
}

interface LessonSection {
  id: string; lesson_id: string; section_type: SectionType;
  title: string; content: string; metadata?: Record<string, unknown>;
  order_number: number; created_at: string;
}

interface Project {
  id: string; lesson_id: string; slug: string; title: string;
  description: string; requirements: string; starter_code: string;
  difficulty: number; xp_reward: number; hints: string[];
  order_number: number; visible: boolean;
  created_at: string; updated_at: string;
}

interface QuizMetadata {
  question: string; options: string[]; correct_index: number;
  explanation: string;
}

interface CourseWithModules extends Course {
  modules: Module[]; progress?: CourseProgress;
  total_lessons: number; completed_lessons: number;
}

interface LessonWithSections extends Lesson {
  sections: LessonSection[]; dependencies: LessonPrereq[];
  projects: Project[]; progress?: LessonProgress;
  prerequisites_met: boolean;
}
```

## 6. API Endpoints

### Student Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /learn/courses | List visible courses |
| GET | /learn/courses/{courseSlug} | Course detail with module progress |
| GET | /learn/courses/{courseSlug}/modules/{moduleSlug} | Module detail with lesson deps (403 if locked) |
| GET | /learn/courses/{courseSlug}/modules/{moduleSlug}/lessons/{lessonSlug} | Full lesson + sections + deps + progress |
| POST | /learn/lessons/{lessonId}/complete | Complete lesson → XP + WS events |
| GET | /learn/progress | All course progress for user |

### Admin Endpoints

| Method | Path | Description |
|---|---|---|
| GET/POST | /admin/courses | List all / Create |
| PUT/DELETE | /admin/courses/{courseId} | Update / Delete |
| PATCH | /admin/courses/{courseId}/visibility | Toggle |
| GET/POST | /admin/courses/{courseId}/modules | List / Create |
| PUT/DELETE | /admin/modules/{moduleId} | Update / Delete |
| PATCH | /admin/modules/{moduleId}/visibility | Toggle |
| PATCH | /admin/modules/{moduleId}/lock | Toggle locked |
| GET/POST | /admin/modules/{moduleId}/lessons | List / Create (with sections + deps) |
| PUT/DELETE | /admin/lessons/{lessonId} | Update / Delete |
| PATCH | /admin/lessons/{lessonId}/visibility | Toggle |
| PUT | /admin/lessons/{lessonId}/dependencies | Update prereqs |
| POST | /admin/lessons/{lessonId}/problems | Link problem slug |
| GET/POST | /admin/lessons/{lessonId}/projects | List / Create |
| PUT/DELETE | /admin/projects/{projectId} | Update / Delete |
| PATCH | /admin/projects/{projectId}/visibility | Toggle |
| GET/POST | /admin/lessons/{lessonId}/sections | List / Create |
| PUT/DELETE | /admin/sections/{sectionId} | Update / Delete |
| PUT | /admin/lessons/{lessonId}/sections/reorder | Reorder sections |

### Create Lesson Payload (POST /admin/modules/{moduleId}/lessons)
```json
{
  "lesson": {
    "module_id": "uuid...",
    "slug": "lesson-slug",
    "title": "Lesson Title",
    "description": "...",
    "difficulty": 1,
    "estimated_minutes": 15,
    "xp_reward": 50,
    "order_number": 1,
    "visible": false,
    "problem_references": ["problem-slug-1"]
  },
  "sections": [
    {
      "section_type": "overview",
      "title": "Overview",
      "content": "Markdown content...",
      "order_number": 1
    }
  ],
  "dependency_ids": ["uuid-of-prereq-lesson"]
}
```

## 7. Seed SQL Patterns

### Course
```sql
INSERT INTO courses (slug, title, description, difficulty_level, estimated_hours, order_number, visible)
VALUES ('course-slug', 'Course Title', 'Description...', 2, 20, 1, false)
ON CONFLICT (slug) DO NOTHING;
```

### Module (using course slug)
```sql
INSERT INTO modules (course_id, slug, title, description, order_number, visible)
SELECT c.id, 'module-slug', 'Module Title', 'Description...', 1, false
FROM courses c WHERE c.slug = 'course-slug'
ON CONFLICT (course_id, slug) DO NOTHING;
```

### Lesson (using course + module slugs)
```sql
INSERT INTO lessons (module_id, slug, title, description, difficulty, estimated_minutes, xp_reward, order_number, visible, problem_references)
SELECT m.id, 'lesson-slug', 'Lesson Title', 'Description...', 1, 10, 50, 1, false, ARRAY['problem-slug']::TEXT[]
FROM modules m JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'course-slug' AND m.slug = 'module-slug'
ON CONFLICT (module_id, slug) DO NOTHING;
```

### Section (3-way JOIN)
```sql
INSERT INTO lesson_sections (lesson_id, section_type, title, content, order_number)
SELECT l.id, 'overview', 'Section Title',
$md$Content in markdown here...$md$, 1
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'course-slug' AND m.slug = 'module-slug' AND l.slug = 'lesson-slug';
```

### Quiz Metadata
```sql
UPDATE lesson_sections SET metadata = '{
  "question": "What is...?",
  "options": ["A", "B", "C", "D"],
  "correct_index": 0,
  "explanation": "Because..."
}'::jsonb
WHERE section_type = 'quiz'
  AND lesson_id = (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'course-slug' AND m.slug = 'module-slug' AND l.slug = 'lesson-slug');
```

### Dependency
```sql
INSERT INTO lesson_dependencies (lesson_id, depends_on_lesson_id)
SELECT
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'course-slug' AND m.slug = 'module-slug' AND l.slug = 'dependent-lesson'),
  (SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
    WHERE c.slug = 'course-slug' AND m.slug = 'module-slug' AND l.slug = 'prerequisite-lesson')
ON CONFLICT DO NOTHING;
```

### Project
```sql
INSERT INTO projects (lesson_id, slug, title, description, requirements, starter_code, difficulty, xp_reward, hints, order_number, visible)
SELECT l.id, 'project-slug', 'Project Title', '...', 'Requirements...', 'Starter code...', 2, 100, ARRAY['hint']::TEXT[], 1, false
FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id
WHERE c.slug = 'course-slug' AND m.slug = 'module-slug' AND l.slug = 'lesson-slug';
```

## 8. Canonical Lesson Section Order

1. **overview** — learning objectives, what you'll learn
2. **explanation** — core concepts, detailed teaching
3. **examples** — code examples with explanations
4. **best_practices** — tips & conventions (optional)
5. **common_mistakes** — pitfalls (optional)
6. **exercises** — practice problems (via problem_references or code playground)
7. **quiz** — MCQ (frontend groups all into a single review step)
8. **summary** — key takeaways
9. **mini_project** — optional capstone (alternative to exercises)
10. **assessment** — formal assessment (alternative to exercises)

Quizzes are frontend-grouped into one "Quiz Review" step regardless of order_number.

## 9. Existing Seed Courses

| Course Slug | Modules | Est. Lessons | Notes |
|---|---|---|---|
| go-fundamentals | 5 | ~20 | Go basics |
| python-basics | 4 | ~15 | Python from scratch |
| data-structures-go | 4 | ~15 | Go DS&A |
| python-intermediate | 3 | ~10 | Python intermediate |
| algorithms | 4 | ~15 | Problem-solving |
| python-mastery | 4 | 14 | Comprehensive Python |
| python-mastery-games | 2 | 6 | Games elective |

Seed files: `migrations/039-043`. Total ~200+ lessons.

## 10. Key Business Rules

1. **Slug uniqueness**: UNIQUE per parent (course globally, module per course, lesson per module, project per lesson)
2. **Order numbers**: 1-based sequential integers
3. **Visibility draft/publish**: all entities default visible=false; toggle via dedicated PATCH endpoints
4. **XP**: lesson default 50, project default 100; only on first completion
5. **Difficulty scale**: 1=Beg, 2=Ez, 3=Med, 4=Hard, 5=Exp
6. **Course progress %**: completed_visible / total_visible * 100 (GREATEST never decreases)
7. **Dependency DAG**: CHECK no self-ref; all prereqs must be completed before lesson complete
8. **XP anti-double-count**: UpsertLessonProgress uses `GREATEST(xp_awarded, $3)` + conditional `completed_at`
9. **Cascade deletes**: course → modules → lessons → sections/deps/projects/progress
10. **Idempotent seeds**: all `ON CONFLICT DO NOTHING`
