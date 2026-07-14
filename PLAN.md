# Koder Curriculum CMS — Implementation Plan & Progress

> A structured curriculum management system built on top of Koder's existing code-grading platform. Enables instructors to design courses composed of modules, lessons, and projects, linked to existing coding problems.

---

## 1. Goal

Build a complete **Curriculum Management System** with:
- **Admin panel** for creating and organizing courses, modules, lessons, sections, and projects
- **Student-facing learn pages** for browsing courses, viewing lessons with rich content (quizzes, code exercises), and tracking progress
- **Full CRUD** for all entity types with professional UI, proper error handling, and loading states

---

## 2. Database Schema

### Migration `038_curriculum_cms.sql`

| Table | Purpose | Key Columns | Constraints |
|---|---|---|---|
| `courses` | Course catalog entry | id PK, slug UNIQUE, title, description, image_url, icon, difficulty_level (1-5), estimated_hours, order_number, visible | `slug UNIQUE` |
| `modules` | Grouping within a course | id PK, course_id FK, slug, title, description, image_url, order_number, visible | `(course_id, slug) UNIQUE`, CASCADE on course delete |
| `lessons` | Individual lesson within a module | id PK, module_id FK, slug, title, description, raw_readme, difficulty (1-5), estimated_minutes, xp_reward, order_number, visible, problem_references TEXT[] | `(module_id, slug) UNIQUE`, CASCADE on module delete |
| `lesson_dependencies` | Prerequisite DAG | lesson_id FK, depends_on_lesson_id FK | PK `(lesson_id, depends_on_lesson_id)`, CHECK `lesson_id <> depends_on_lesson_id` |
| `lesson_sections` | Typed content blocks | id PK, lesson_id FK, section_type (ENUM-like), title, content TEXT, metadata JSONB, order_number | CASCADE on lesson delete |
| `projects` | Hands-on coding projects | id PK, lesson_id FK, slug, title, description, requirements, starter_code, difficulty (1-5), xp_reward, hints TEXT[], order_number, visible | `(lesson_id, slug) UNIQUE`, CASCADE on lesson delete |
| `course_progress` | Per-user course tracking | user_id + course_id PK, started_at, completed_at, progress_pct REAL | FK to users + courses |
| `lesson_progress` | Per-user lesson tracking | user_id + lesson_id PK, completed, xp_awarded, completed_at | FK to users + lessons |

**15 composite indexes** covering all query patterns (lookups by slug, FK joins, ordering, completion status).

---

## 3. Architecture

### Backend Layers

```
Router (chi)
  └─ CMHandler (internal/api/cms.go)
       ├─ 7 Student endpoints (authenticated)
       │    GET  /learn/courses           → ListPublishedCourses
       │    GET  /learn/courses/{slug}    → GetCourseDetail (course + modules + progress)
       │    GET  .../modules/{modSlug}    → GetModuleDetail (module + lessons + progress)
       │    GET  .../lessons/{lessonSlug} → GetLessonDetail (lesson + sections + deps + projects)
       │    POST /learn/lessons/{id}/complete → CompleteLesson (awards XP, updates progress)
       │    GET  /learn/progress          → GetAllProgress (full user progress)
       └─ 22 Admin endpoints (admin-only)
            CRUD for courses, modules, lessons, sections, projects
            + visibility toggles for all entity types
            + lesson creation with bulk sections + dependency insert
       └─ Store (internal/store/curriculum.go)
            28 methods implementing the Store interface
            All using pgx/v5, UUIDs, proper error handling
            CreateLessonWithSections uses a transaction
```

### Frontend Routes

```
Admin:
  /admin/curriculum        → Full SPA: 3-column CRUD panel (1177 lines)

Student Learn:
  /learn/courses                          → Course catalog (card grid)
  /learn/courses/[courseSlug]             → Course detail (module list + progress bar)
  /learn/courses/[slug]/modules/[modSlug] → Module detail (lesson list + completion)
  /learn/courses/[slug]/modules/[...]/lessons/[lessonSlug] → Lesson viewer

Shared Components:
  SectionRenderer.tsx   → Conditionally renders quiz/code/markdown
  SectionQuiz.tsx       → Interactive multiple-choice with feedback
  SectionExercise.tsx   → Monaco editor with test/submit
  LessonSidebar.tsx     → Section navigation + progress + prerequisites
```

### Data Flow

```
Admin creates:
  Course → Modules → Lessons → Sections (quiz/exercise/markdown)
                              → Projects (coding projects)
                              → Problem References (links to existing Koder problems)

Student sees:
  Course catalog (visible=true) → Module list → Lesson viewer
    ├─ Sections rendered by type (quiz → interactive, exercise → code editor)
    ├─ "Mark Complete" button → awards XP → updates users.xp → updates course_progress
    └─ Prerequisites checked before allowing completion
```

---

## 4. Implementation Phases

### Phase 1: Database & Store (Complete)
- Migration `038_curriculum_cms.sql` with 6+2 tables, 15 indexes
- All 28 store methods in `internal/store/curriculum.go`
- Interface methods in `internal/store/store.go`
- Proper error handling: `pgx.ErrNoRows`, uniqueness violations, row-affect checks

### Phase 2: Backend API (Complete)
- 29 handlers in `internal/api/cms.go`
- Route registration in `internal/api/router.go`
- All with proper auth, validation, error logging, and response formatting
- Transactional lesson creation (sections + dependencies in one transaction)

### Phase 3: Admin Frontend (Complete)
- `/admin/curriculum` — full CRUD for all 5 entity types
- Forms: course, module, lesson (with raw_readme), section (11 types + quiz config), project
- Visibility toggles for courses, modules, lessons, projects (Eye/EyeOff buttons)
- Loading states for modules and lessons
- Error toasts on API failures
- Expandable course cards with nested module list

### Phase 4: Student Learn Pages (Complete)
- `/learn/courses` — card grid with gradient headers, difficulty badges, loading skeleton
- `/learn/courses/[slug]` — progress bar, module list with "View" links
- `/learn/[slug]/modules/[modSlug]` — lesson list with completion checkmarks
- `/learn/[slug]/modules/[slug]/lessons/[slug]` — lesson viewer with:
  - Sidebar navigation (sections list, prerequisites, progress)
  - SectionRenderer: quiz (interactive), exercise (Monaco editor), markdown
  - "Mark Complete" button with prerequisite gate

### Phase 5: Bugfixes & Polish (Complete)
- Course creation difficulty_level CHECK constraint fix
- DeleteCourse return value fix
- Error handling + loading states for loadModules/loadLessons
- raw_readme column population on lesson create/update
- XP propagation from lesson → users.xp table
- Course progress auto-calculation on lesson completion
- Module/Lesson/Project visibility toggle endpoints + UI

---

## 5. File Inventory

### Backend
```
internal/store/curriculum.go   — 1002 lines, 28 store methods
internal/api/cms.go            — 1100 lines, 29 handlers + helpers
internal/api/router.go         — 3 new route groups
internal/store/store.go        — Interface: 28 curriculum methods
internal/store/types.go        — Types: Course, Module, Lesson, Project, etc.
migrations/038_curriculum_cms.sql — 6+2 tables, 15 indexes
```

### Frontend (Admin)
```
app/(main)/admin/curriculum/page.tsx  — 1230 lines, SPA CRUD panel
```

### Frontend (Student)
```
app/(main)/learn/layout.tsx                                                  — 7 lines
app/(main)/learn/courses/page.tsx                                            — 147 lines
app/(main)/learn/courses/[courseSlug]/page.tsx                               — 92 lines
app/(main)/learn/courses/[courseSlug]/modules/[moduleSlug]/page.tsx          — 98 lines
app/(main)/learn/courses/[...]/modules/[...]/lessons/[lessonSlug]/page.tsx   — 5 lines
app/(main)/learn/courses/[...]/modules/[...]/lessons/[...]/LessonViewerClient.tsx — 145 lines
```

### Frontend (Shared Components)
```
components/learn/SectionRenderer.tsx   — 66 lines
components/learn/SectionQuiz.tsx       — 89 lines
components/learn/SectionExercise.tsx   — 134 lines
components/learn/LessonSidebar.tsx     — 93 lines
```

### Frontend (API & Types)
```
lib/api.ts     — 26 curriculum API functions (622-780)
lib/types.ts   — 15 curriculum interfaces (372-599)
```

---

## 6. Current State

### Fully Implemented
- [x] Course CRUD (admin create/read/update/delete + visibility toggle)
- [x] Module CRUD (admin create/read/update/delete + visibility toggle)
- [x] Lesson CRUD (admin create with sections+deps, read, update, delete + visibility toggle)
- [x] Section CRUD (admin create/read/update/delete, 11 section types)
- [x] Project CRUD (admin create/read/update/delete + visibility toggle)
- [x] Student course catalog (visible courses only, card grid)
- [x] Student course detail (modules + progress bar + lesson counts)
- [x] Student module detail (lesson list + completion status)
- [x] Student lesson viewer (sections, quiz, code exercise, sidebar)
- [x] Lesson completion (XP award to users.xp, course_progress update)
- [x] Prerequisite checking (server-side, gates completion button)
- [x] All loading states, error toasts, empty states
- [x] raw_readme persistence on lesson create/update

### Known Gaps (Non-Critical)
- [ ] N+1 query pattern in GetCourseDetail/GetModuleDetail (performance, not correctness)
- [ ] No section reordering endpoint (drag-to-reorder)
- [ ] No lesson dependency management after creation (add/remove deps)
- [ ] fetchProgress() is defined but unused on frontend (available for future use)

---

## 7. Design Decisions

| Decision | Rationale |
|---|---|
| **Full PUT instead of PATCH** | Simpler implementation; frontend always sends the full entity. Risk of zero-valued missing fields mitigated by frontend sending complete objects. |
| **Monolithic admin component (1230 lines)** | All CRUD shares the same Dialog modal. Extracting into sub-components would add unnecessary complexity for a single-page admin tool. |
| **N+1 query pattern** | Acceptable for curriculum data (small datasets: <50 modules, <200 lessons per course). Avoids premature optimization that would complicate the codebase. |
| **Hardcoded 50 XP fallback** | If `lesson.xp_reward` is 0 or unset, defaults to 50. Prevents silent 0-XP completions for legacy data. |
| **Error string matching for 404** | Inconsistent with `pgx.ErrNoRows` but consistent across all existing CMS handlers. Changing would require touching all handlers — acceptable technical debt. |

---

## 8. Migration History

| Migration | Description |
|---|---|
| `038_curriculum_cms.sql` | Initial schema: courses, modules, lessons, lesson_dependencies, lesson_sections, projects, course_progress, lesson_progress. 15 indexes. |
| All post-038 changes are code-only (no schema changes) | raw_readme fix, XP propagation, visibility toggles — all handled in Go code |

---

## 9. Key Metrics

| Metric | Value |
|---|---|
| Backend handlers | 29 (22 admin + 7 student) |
| Store methods | 28 |
| Frontend API functions | 26 |
| TypeScript interfaces | 15 |
| DB tables | 8 |
| DB indexes | 15 |
| Admin page lines | 1230 |
| Student page lines (total) | 494 |
| Shared component lines (total) | 382 |
| Total new code | ~3500 lines |
