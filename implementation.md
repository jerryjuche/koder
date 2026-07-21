# Curriculum CMS — Implementation Plan

## Architecture

**Separation of concerns:** Curriculum (Courses → Modules → Lessons) is completely separate from the Problem Bank (`problems` table). Lessons reference problems via `problem_references TEXT[]` column for exercise sections.

**Lesson Sections:** A `lesson_sections` table with an ENUM type provides flexibility — sections can be overview, explanation, quiz, exercise, etc. without schema changes. Each section stores its content as markdown + optional JSONB metadata (quiz answers, exercise config).

**Student Flow:** `/learn/courses` → course catalog → course overview with module timeline → module overview → lesson viewer (sidebar + dynamic section renderer).

**Admin Flow:** `/admin/curriculum` → full-page CMS for courses/modules/lessons/sections/projects.

---

## Database Schema (`migrations/038_curriculum_cms.sql`)

| Table | Purpose | Key Columns |
|---|---|---|
| `courses` | Top-level curriculum groupings | `slug` (UNIQUE), `title`, `description`, `difficulty_level`, `estimated_hours`, `order_number`, `visible` |
| `modules` | Course chapters/units | `course_id` (FK→courses), `slug` (UNIQUE per course), `title`, `order_number`, `visible` |
| `lessons` | Individual lessons | `module_id` (FK→modules), `slug`, `title`, `difficulty`, `estimated_minutes`, `xp_reward`, `order_number`, `visible`, `problem_references TEXT[]` |
| `lesson_sections` | Typed content blocks | `lesson_id` (FK→lessons), `section_type` (ENUM: 11 types), `content` (TEXT), `metadata` (JSONB), `order_number` |
| `lesson_dependencies` | Prerequisite DAG | `lesson_id` + `depends_on_lesson_id` (composite PK, self-referencing FK) |
| `projects` | Hands-on coding projects | `lesson_id` (FK→lessons), `slug`, `requirements`, `starter_code`, `difficulty`, `xp_reward`, `hints TEXT[]`, `order_number`, `visible` |
| `course_progress` | Per-user course tracking | `user_id` + `course_id` (composite PK), `started_at`, `completed_at`, `progress_pct` |
| `lesson_progress` | Per-user lesson completion | `user_id` + `lesson_id` (composite PK), `completed`, `xp_awarded`, `completed_at` |

---

## Execution Plan (6 Phases)

### Phase 1: Database Migration & Go Types (Backend Foundation)
**Files:**
- `migrations/038_curriculum_cms.sql` (new) — Full schema: 8 tables + ENUM + 13 indexes
- `internal/store/types.go` (modified) — +16 structs: Course, Module, Lesson, LessonSection, LessonPrereq, Project, NewCourse, NewModule, NewLesson, NewLessonSection, NewProject, QuizMetadata, CourseWithModules, LessonWithSections, CourseProgress, LessonProgress
- `internal/store/store.go` (modified) — +25 method signatures in Store interface (incl. 3 section CRUD)
- `internal/store/curriculum.go` (new) — Full CRUD implementations with transactional CreateLessonWithSections

### Phase 2: Backend API Layer
**Files:**
- `internal/api/cms.go` (new) — CMHandler with 26 endpoints (6 student, 20 admin, incl. 4 section CRUD)
- `internal/api/router.go` (modified) — Register all routes under AuthMiddleware + AdminOnly groups

### Phase 3: Frontend API Client & Types
**Files:**
- `frontend/lib/types.ts` (modified) — +16 TypeScript interfaces (incl. 5 New* payload types)
- `frontend/lib/api.ts` (modified) — +22 endpoint functions

### Phase 4: Admin Curriculum CMS
**Files:**
- `frontend/app/(main)/admin/curriculum/page.tsx` (new) — Full-page CMS with course/module/lesson tree, inline editors, section builder, project editor, prerequisite picker
- `frontend/components/layout/TopNav.tsx` (modified) — Add "Learn" link with BookOpen icon

### Phase 5: Student Lesson Viewer
**Files:**
- `frontend/app/(main)/learn/layout.tsx` (new) — Learn layout with breadcrumbs
- `frontend/app/(main)/learn/courses/page.tsx` (new) — Course catalog grid
- `frontend/app/(main)/learn/courses/[courseSlug]/page.tsx` (new) — Course detail + module timeline
- `frontend/app/(main)/learn/courses/[courseSlug]/modules/[moduleSlug]/page.tsx` (new) — Module overview + lesson list
- `frontend/app/(main)/learn/courses/[courseSlug]/modules/[moduleSlug]/lessons/[lessonSlug]/page.tsx` (new) — Lesson viewer server component
- `frontend/app/(main)/learn/courses/[courseSlug]/modules/[moduleSlug]/lessons/[lessonSlug]/LessonViewerClient.tsx` (new) — Dynamic section rendering, sidebar, progress

### Phase 6: Shared Lesson Components
**Files:**
- `frontend/components/learn/SectionRenderer.tsx` (new) — Routes section_type to sub-renderer
- `frontend/components/learn/SectionQuiz.tsx` (new) — Inline quiz widget from metadata JSONB
- `frontend/components/learn/SectionExercise.tsx` (new) — Monaco inline exercise calling /test; miniProject prop for full editor mode
- `frontend/components/learn/LessonSidebar.tsx` (new) — Progress indicator, section nav, prerequisites checklist

---

## Key Design Decisions

1. **Exercise UX:** Lightweight inline component (`SectionExercise.tsx`) calling only `POST /test` — no full workspace chrome, no submit/score
2. **Progress persistence:** DB-backed via `course_progress`/`lesson_progress` with optimistic client cache (revert on API error)
3. **Admin CMS:** Separate route `/admin/curriculum` (not a tab in the existing admin page)
4. **Custom markdown blocks:** Stored as raw HTML in the markdown content (no preprocessor needed — react-markdown renders raw HTML by default, Tailwind styles handle presentation)
5. **Problem references:** `TEXT[]` column on `lessons` table referencing `problems.slug` — no junction table needed

---

## File Change Summary

| Layer | Files | Status |
|---|---|---|---|
| **New DB migration** | `migrations/038_curriculum_cms.sql` | done |
| **New Go store** | `internal/store/curriculum.go` | done |
| **Modified Go types** | `internal/store/types.go` | done |
| **Modified Go interface** | `internal/store/store.go` | done |
| **New Go handler** | `internal/api/cms.go` | done |
| **Modified Go router** | `internal/api/router.go` | done |
| **Modified TS types** | `frontend/lib/types.ts` | done |
| **Modified TS api** | `frontend/lib/api.ts` | done |
| **New Admin CMS page** | `frontend/app/(main)/admin/curriculum/page.tsx` | done |
| **Modified TopNav** | `frontend/components/layout/TopNav.tsx` | done |
| **New Learn layout** | `frontend/app/(main)/learn/layout.tsx` | done |
| **New Course catalog** | `frontend/app/(main)/learn/courses/page.tsx` | done |
| **New Course detail** | `frontend/app/(main)/learn/courses/[courseSlug]/page.tsx` | done |
| **New Module detail** | `frontend/app/(main)/learn/courses/[courseSlug]/modules/[moduleSlug]/page.tsx` | done |
| **New Lesson viewer** | `frontend/app/(main)/learn/courses/[courseSlug]/modules/[moduleSlug]/lessons/[lessonSlug]/page.tsx` | done |
| **New Lesson client** | `frontend/app/(main)/learn/courses/[courseSlug]/modules/[moduleSlug]/lessons/[lessonSlug]/LessonViewerClient.tsx` | done |
| **New Learn components** | `frontend/components/learn/SectionRenderer.tsx` | done |
| | `frontend/components/learn/SectionQuiz.tsx` | done |
| | `frontend/components/learn/SectionExercise.tsx` | done |
| | `frontend/components/learn/SectionMiniProject.tsx` | merged → `SectionExercise.tsx:miniProject` prop |
| | `frontend/components/learn/LessonSidebar.tsx` | done |

---

## Audit Gates

| Phase | Verification Command |
|---|---|
| 1 | `go vet ./internal/...` + `go build ./...` |
| 2 | `go vet ./internal/...` + `go test ./internal/...` |
| 3 | `cd frontend && npx tsc --noEmit` |
| 4 | `cd frontend && npm run lint` |
| 5 | `cd frontend && npm run build` |
| 6 | Full integration flow test on `:3000` |
