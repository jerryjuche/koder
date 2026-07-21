# Professional Redesign: Learn/Curriculum UI

## Brand Foundation

### Colors (Tailwind v4 `@theme`)
```css
--color-brand-muted-gold: #D4AF37;
--color-brand-muted-gold-dark: #C5A059;
--color-brand-charcoal-base: #1A1A24;
--color-brand-charcoal-card: #242430;
--color-brand-charcoal-panel: #1E1E2A;
--color-brand-charcoal-hover: rgba(255, 255, 255, 0.05);
--color-brand-charcoal-border: rgba(255, 255, 255, 0.07);
--color-brand-offwhite: #D1D1D8;
--color-brand-offwhite-muted: #88889A;
--color-brand-success: #22C55E;
--color-brand-error: #ef4444;
--color-brand-cool-accent: #7B8CBB;
--color-brand-cool-accent-muted: #5A6A94;
```
Tailwind v4 generates: `bg-brand-charcoal-base`, `text-brand-muted-gold`, `border-brand-charcoal-border`, etc.

### Shadcn/ui CSS Variables (dark theme)
- Background: `#1A1A24`
- Foreground: `#D1D1D8`
- Card: `#242430`
- Primary: `#D4AF37` (gold)
- Primary foreground: `#1A1A24`
- Muted-foreground: `#88889A`
- Border: `rgba(255, 255, 255, 0.07)`
- Ring: `#D4AF37`
- Border radius: `0.45rem`
- Sidebar: `#161618`

### Typography
- Sans: `Inter` (body, headings)
- Mono: `Fira Code` (code)
- Headings: `tracking-tight` for large titles
- Body: `text-sm` or `text-xs` for secondary

### Design Language
- **Dark theme** with charcoal base + gold primary accent
- **Gradient hero sections** with `bg-gradient-to-br` from section type colors
- **Glass morphism** icons: `bg-card/90 backdrop-blur-sm ring-1 ring-white/20`
- **Shadow back plates** on hover: `bg-black/12 dark:bg-white/[0.08]` positioned `-inset-2` with `blur-[0.5px]` → `blur-0` on hover
- **Badge colors** per section type: blue, sky, violet, emerald, rose, amber, orange, teal, purple, indigo, fuchsia
- **Framer Motion** animations: staggered fade-in-up (opacity + y offset), AnimatePresence for section transitions (x: ±20), progress bar width animations
- **Progress bars**: `h-2 bg-muted/80 rounded-full overflow-hidden` with gradient fill `from-primary to-primary/70`

### Available shadcn/ui Components
avatar, badge, button, card, dialog, dropdown-menu, hover-card, input, input-otp, label, progress, select, tabs, textarea, tooltip, multi-step-loader, activity-gauge

### Layout Wrapper (`(main)/layout.tsx`)
Every page inside `(main)/` already has: TopNav, BroadcastBanner, FeedbackButton, UserProvider, PyodidePreloader, `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`. The learn pages need their own bespoke layout — do NOT double-wrap content.

---

## Pages to Redesign

### 1. Course Catalog Page (`courses/page.tsx`)
**Route:** `/learn/courses`

**What it shows:** All published courses in a grid; each card has a gradient hero, icon, title, description, difficulty badge, hours.

**Issues to fix:**
- Cards feel flat — need more visual depth and polish
- Description has newline rendering issues (make sure `whitespace-pre-line` is used)
- No loading.tsx or error.tsx files exist (add them, follow leaderboard/top pattern in next section)
- Hover transitions could be more polished

**Design notes:**
- Use `grid md:grid-cols-2 lg:grid-cols-3 gap-8`
- Course hero: 48px color-coded gradient bar at top (blue, cyan, violet, amber) — listed below
- Glass icon: `bg-card/90 backdrop-blur-sm ring-1 ring-white/20`
- Card body: title, description (`whitespace-pre-line`), difficulty badge, hours
- Bottom row: "Start learning" text + arrow icon button with hover animation
- Hover: card lifts (`-translate-y-2`), shadow intensifies, back plate becomes visible
- Course gradient map: `python-fundamentals` → blue, `go-fundamentals` → cyan, `python-intermediate` → violet, `data-structures` → amber, fallback → slate
- Difficulty badges: Beginner (emerald), Intermediate (amber), Advanced (red)

**Loading skeleton:** 3 animated pulse cards with gradient hero placeholder areas
**Empty state:** BookOpen icon centered
**Error state:** AlertTriangle icon + retry button (Card-centered)

---

### 2. Course Detail Page (`courses/[courseSlug]/page.tsx`)
**Route:** `/learn/courses/{courseSlug}`

**What it shows:** Course hero with title, description, stats, progress bar; list of modules with gradient stripes, icons, status, lesson progress.

**Issues to fix:**
- Module cards feel cramped — more breathing room needed
- Progress bar animation should be smoother
- No way to quickly see "how many hours this module takes"
- Module card hover states could be more premium

**Hero section (gradient + decorative):**
- `rounded-2xl bg-gradient-to-br from-primary/5 via-card to-card border p-8`
- Decorative radial gradient circle in top right corner
- `GraduationCap` icon in `rounded-2xl` container with `bg-gradient-to-br from-primary/20 to-primary/5`
- Title (large, bold)
- Description (`whitespace-pre-line`)
- Stats row: difficulty badge, hours, module count, completed lesson count
- Progress bar: `h-2.5 bg-muted/80` with gradient fill

**Module cards:**
- Gradient stripe on top: `h-1.5 w-full bg-gradient-to-r {slug-based colors}`
- Module icon in 12×12 `rounded-xl` with gradient background
- Number badge, title, status badges (Complete / In progress / Locked)
- Description text
- Lesson progress: `h-2 bg-muted/80` with gradient fill + count label ("5 lessons · 3 done")
- Arrow chevron on right with hover animation
- Current module: `ring-2 ring-primary/40 shadow-lg shadow-primary/10`
- Completed module: `shadow-emerald-500/5`
- Module branding: `python` → teal, `go` → sky, `data` → violet, `web` → amber, `algo` → rose, `misc` → slate

**States needed:** Loading skeleton (card pulse), error with retry, not-found with back link

---

### 3. Module Detail Page (`modules/[moduleSlug]/page.tsx`)
**Route:** `/learn/courses/{courseSlug}/modules/{moduleSlug}`

**What it shows:** Module header with gradient stripe, title, description, stats; lessons list with rich status indicators, badges, navigation.

**Issues to fix:**
- Lesson cards need better differentiation (complete, current, locked)
- The "current lesson" visual state is weak
- No estimated total time shown at module level
- Hover/preview states on lesson cards lack depth

**Module header:**
- `rounded-2xl border-0 shadow-sm` with `h-2 w-full bg-gradient-to-r` top stripe (module-branded color)
- `GraduationCap` icon in 12×12 `rounded-2xl` container
- Module title (bold, large), description
- Stats bar: lessons count, XP earned/total, completion %
- Progress bar: `h-2.5 bg-muted/80` — `from-emerald-500 to-green-400` when 100%, else `from-primary/70 to-primary`

**Lesson cards:**
- Three visual states for status indicator (left circle/icon):
  - **Completed:** `CheckCircle2` in `bg-emerald-500/15 ring-1 ring-emerald-500/25` — card border green-tinted
  - **Current (active):** `CircleDot` in `bg-primary/15 ring-1 ring-primary/30` — card highlights with `ring-1 ring-primary/20 shadow-md shadow-primary/10`
  - **Pending:** Number badge in `bg-muted/60 ring-1 ring-border` — card is neutral
- **Locked:** Lock icon in muted background, card opacity reduced slightly
- Content: title (emerald tint when complete), "Done"/"Current"/badges, description, XP badge (amber), minutes, difficulty
- Arrow: 8×8 `rounded-xl` with hover color/transform effects
- Completed lesson border: `border-emerald-200/60 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10`

**UX states:**
- Only the first incomplete lesson and all before it are accessible; lessons beyond require sequential completion
- Heading changes: "Lessons" → "All lessons complete!" (Trophy icon) → "Continue learning" (PlayCircle icon)
- Computed from `completedCount`, `totalCount`, `pct`, `firstIncomplete`, `totalXp`, `earnedXp`

---

### 4. Lesson Viewer (`lessons/[lessonSlug]/LessonViewerClient.tsx`)
**Route:** `/learn/courses/{courseSlug}/modules/{moduleSlug}/lessons/{lessonSlug}`

**What it shows:** Sidebar + step-by-step lesson sections, quiz review, progress bar, bottom navigation with complete/next.

**Issues to fix:**
- The "Complete" → "Next Lesson" flow should be seamless — after completing, redirect to next lesson directly (not success page). If last lesson, go to module overview.
- "Next Lesson" / "Next" buttons must show on ALL steps when lesson is already completed, not just the last step.
- Sidebar needs better visual hierarchy for lesson statuses
- Keyboard navigation indicator could be more visible
- Missing error boundary (add `<LessonViewerClient />` wrapping with error.tsx)
- The bottom bar "Previous" / step label / "Next" layout could be more polished with better spacing

**Layout:**
- `flex h-[calc(100vh-3.5rem)]` — sidebar + main content (full height)
- Left sidebar: `w-72 border-r bg-muted/5 shrink-0`
  - Module header: back link, module title (uppercase `tracking-wider`), lesson count
  - Scrollable lesson list with status (green checkmark, active number badge, gray pending badge), title, minutes
  - Active state: `bg-primary/10 text-primary font-medium shadow-sm`
  - Bottom pinned: prerequisites (lock icon with check/lock states), stats (Clock + Zap), progress bar

- Main content: `flex-1 flex flex-col min-w-0 overflow-hidden`
  - **Top nav bar:** `border-b bg-background/95 backdrop-blur` — breadcrumb (course/module), lesson title, meta badges (XP, minutes, difficulty, completed badge)
  - **Progress bar:** `h-1.5 bg-muted` with framer-motion animated fill + step dots (current = `bg-primary w-6`, previous = `bg-primary/40 w-2`, future = `bg-muted-foreground/20 w-2`)
  - **Content area (scrollable):** `max-w-4xl mx-auto` with AnimatePresence for section transitions

**Section type gradients:**
- overview: `from-blue-500/10 via-blue-500/5 to-transparent border-blue-200/30`
- explanation: `from-sky-500/[..]` similar
- examples: `from-violet-500/[..]`
- best_practices: `from-emerald-500/[..]`
- common_mistakes: `from-rose-500/[..]`
- summary: `from-amber-500/[..]`
- quiz: `from-orange-500/[..]`
- exercises: `from-teal-500/[..]`
- mini_project: `from-purple-500/[..]`
- assessment: `from-indigo-500/[..]`
- ai_review: `from-fuchsia-500/[..]`
- quiz-review: `from-orange-500/10 via-amber-500/5`

**Bottom navigation:**
- `flex items-center justify-between gap-3 mt-8 mb-4`
- **Previous:** outline button, disabled on step 0
- **Step label:** `text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full`
- **Action button:**
  - When `completed` → "Next Lesson" (primary, goes to next) or "Module Complete" (green outline, goes to module overview)
  - When `isLastStep` → "Complete" (primary with Sparkles icon)
  - Otherwise → "Next" (primary, goes to next step)

**Keyboard shortcuts:**
- ArrowRight / Space: next step
- ArrowLeft: previous step
- Add `title` attribute hint on first focus

**Completion flow:**
1. User clicks "Complete" on last step
2. API call `POST /learn/lessons/{id}/complete`
3. On success → fire confetti, `sessionStorage.setItem("koder_lesson_completed_{slug}", ...)`, dispatch `user-updated` event
4. Redirect to next lesson (`router.push`) if exists, otherwise redirect to module overview page
5. Keep success page route at `.../success` for manual access but do NOT auto-redirect there

**States:** Loading (skeleton pulse — 4 lines), not-found (back to module link), error boundary

---

### 5. Lesson Success Page (`lessons/[lessonSlug]/success/page.tsx`)
**Route:** `/learn/courses/{courseSlug}/modules/{moduleSlug}/lessons/{lessonSlug}/success`

**What it shows:** Celebration page after lesson completion with confetti, "What You Covered" summary, XP earned, module progress, next lesson preview.

**Issues to fix:**
- Less critical now (not auto-redirected), but keep as manually navigable route
- Ensure it uses brand colors consistently (charcoal + gold + green)
- Loading state must handle both cached and fresh data paths

**Design (matches problem success page pattern):**
- Header: `bg-gradient-to-b from-brand-success/10 to-transparent` with large `CheckCircle2` icon (80px, green glow `shadow-[0_0_40px_rgba(34,197,94,0.3)]`), "Lesson Completed!" title, XP gold badge
- Two CTAs: "Back to Module" (card-colored ghost) + "Continue to {next}" (gold primary with glow `shadow-[0_0_20px_rgba(212,175,55,0.2)]`)
- Two-column grid: left = "What You Covered" (section list with type icons + green checkmarks), right = "Module Progress" (gradient progress bar + next lesson preview card + XP summary)
- Confetti: cannons from left (angle 60) + right (angle 120), gold/green/white colors, 150ms interval for 3.5s
- Fallback to sessionStorage cache then API

**Section type icons (map):** overview=BookOpen, explanation=FileText, examples=Puzzle, best_practices=Star, common_mistakes=AlertTriangle, summary=ScrollText, quiz=BrainCircuit, exercises=FlaskConical, mini_project=Target, assessment=FileCode, ai_review=Sparkles

---

### 6. SectionRenderer Component
**File:** `components/learn/SectionRenderer.tsx`

Renders each lesson section via ReactMarkdown with type-specific headers.

**Already has:**
- `remarkGfm`, `remarkBreaks`, `rehypeRaw` plugins (remarkBreaks added for newline rendering)
- Color-coded type badge (pill icon + label)
- Code blocks (inline vs. Shiki-highlighted blocks)
- Tables with overflow-x-auto wrapper
- Blockquotes with left accent border
- Custom callout divs (tip, example, warning, info)

**No changes needed unless the AI improves the markdown rendering polish (e.g., callout emoji labels could be icon-based instead of emoji, code block header aesthetics).**

---

### 7. SectionQuiz Component
**File:** `components/learn/SectionQuiz.tsx`

Multiple-choice quiz with letter options (A/B/C/D), submit/retry, green/red feedback.

**Already functional.** Could be polished:
- Letter circles should use `cn()` instead of inline template strings for class logic
- Add framer-motion for answer reveal animation
- Use icon-based feedback rather than emoji

---

### 8. SectionExercise Component
**File:** `components/learn/SectionExercise.tsx`

Monaco Editor with backend test or Pyodide execution, split pane for Python, results panel.

**No major issues.** Could be polished:
- Results panel transitions between states
- Error display formatting
- Loading state during test

---

### 9. Admin Curriculum Editor (`admin/curriculum/page.tsx`)
**Not for student-facing redesign.** This is the CMS. Only consider polish if the AI has capacity: consistent dialog widths, better tab animations, section reorder UI polish.

---

## Critical UX Patterns to Implement

### Loading States
Every page needs a `loading.tsx` file in the route directory (not inline):
- **Course catalog:** Skeleton grid (3 cards with hero bar + text lines)
- **Course detail:** Skeleton hero + 3 module card outlines
- **Module detail:** Skeleton header + 5 lesson card outlines
- **Lesson viewer:** Skeleton sidebar + progress bar + 3 content sections

### Error Boundaries
Every page needs an `error.tsx` file (matching the pattern from `admin/error.tsx`):
- `AlertTriangle` icon
- "Failed to load" title
- "Something went wrong" description
- "Try Again" button calling `reset()`

### Empty States
- No courses: BookOpen icon + "No courses available yet"
- No modules: BookOpen icon + "This course has no modules yet"
- No lessons: FileText icon + "This module has no lessons yet"
- No sections: BookOpen icon + "No lesson sections available"

### Transition Animations
- Page transitions: fade-in-up (opacity 0→1, y: 8→0, 0.2s)
- List items stagger: each card fades in with 0.05s delay per item
- Progress bars: framer-motion width animation 0.3s easeOut
- Section changes in lesson viewer: AnimatePresence mode="wait" with x: ±20

---

## File Structure Reference

```
app/(main)/learn/
├── layout.tsx                          # Minimal wrapper (eagerLoadPyodide)
├── loading.tsx                         # NEW: catalog skeleton
├── error.tsx                           # NEW: catalog error boundary
├── courses/
│   ├── page.tsx                        # Course catalog grid
│   ├── loading.tsx                     # NEW: skeleton
│   ├── error.tsx                       # NEW: error boundary
│   └── [courseSlug]/
│       ├── page.tsx                    # Course detail + module list
│       ├── loading.tsx                 # NEW: skeleton
│       ├── error.tsx                   # NEW: error boundary
│       └── modules/
│           └── [moduleSlug]/
│               ├── page.tsx            # Module detail + lesson list
│               ├── loading.tsx         # NEW: skeleton
│               ├── error.tsx           # NEW: error boundary
│               └── lessons/
│                   └── [lessonSlug]/
│                       ├── page.tsx    # Server shell → LessonViewerClient
│                       ├── loading.tsx # NEW: skeleton
│                       ├── error.tsx   # NEW: error boundary
│                       ├── LessonViewerClient.tsx
│                       └── success/
│                           └── page.tsx  # Celebration page (manual only)

components/learn/
├── SectionRenderer.tsx
├── SectionQuiz.tsx
├── SectionExercise.tsx
├── LessonSidebar.tsx
```

---

## What to NOT Change
- The underlying data fetching pattern (`fetchCourses`, `fetchCourse`, `fetchModule`, `fetchLesson`, `completeLesson`)
- The backend API contracts
- The section rendering logic (ReactMarkdown pipeline)
- The sessionStorage caching pattern (matches problem workspace)
- The lesson completion handler flow (redirects to next lesson)
- The Pyodide integration in SectionExercise
- Monaco Editor configuration and theme
- Component filenames and exports

---

## Deliverables Checklist

### New Files
- [ ] `app/(main)/learn/loading.tsx` — Course catalog skeleton
- [ ] `app/(main)/learn/error.tsx` — Course catalog error boundary
- [ ] `app/(main)/learn/courses/loading.tsx` — Catalog skeleton
- [ ] `app/(main)/learn/courses/error.tsx` — Catalog error boundary
- [ ] `app/(main)/learn/courses/[courseSlug]/loading.tsx` — Course detail skeleton
- [ ] `app/(main)/learn/courses/[courseSlug]/error.tsx` — Course detail error boundary
- [ ] `app/(main)/learn/courses/[courseSlug]/modules/[moduleSlug]/loading.tsx` — Module skeleton
- [ ] `app/(main)/learn/courses/[courseSlug]/modules/[moduleSlug]/error.tsx` — Module error boundary
- [ ] `app/(main)/learn/courses/[courseSlug]/modules/[moduleSlug]/lessons/[lessonSlug]/loading.tsx` — Lesson skeleton
- [ ] `app/(main)/learn/courses/[courseSlug]/modules/[moduleSlug]/lessons/[lessonSlug]/error.tsx` — Lesson error boundary

### Modified Files
- [ ] `courses/page.tsx` — Polish cards, hover states, empty/loading/error states
- [ ] `courses/[courseSlug]/page.tsx` — Polish hero, module cards, progress
- [ ] `courses/[courseSlug]/modules/[moduleSlug]/page.tsx` — Polish lesson cards, locked states
- [ ] `lessons/[lessonSlug]/LessonViewerClient.tsx` — Navigation polish, all-step completed nav, transitions
- [ ] `components/learn/SectionQuiz.tsx` — Polish option buttons, add animations, use cn()
- [ ] `lessons/[lessonSlug]/success/page.tsx` — Ensure brand consistency, polish layout
- [ ] `components/learn/LessonSidebar.tsx` — Polish lesson status indicators
- [ ] `components/learn/SectionRenderer.tsx` — Polish markdown rendering (emoji→icon callouts)
- [ ] `components/learn/SectionExercise.tsx` — Results panel transition polish

---

## Code Quality Requirements
1. Only use emojis if explicitly referenced in existing code
2. Use `cn()` for conditional class joining, NOT template strings
3. Follow Tailwind v4 syntax (no `@apply` custom utilities unless needed)
4. Use framer-motion `AnimatePresence mode="wait"` for step transitions
5. All button/icon hover states should use `transition-colors` or `transition-all`
6. Import types from `@/lib/types`, API from `@/lib/api`
7. Loading skeletons: use `animate-pulse` with `bg-muted` placeholders
8. Error boundaries: `"use client"`, accept `{ error, reset }` props
9. Use semantic HTML (headings hierarchy, ARIA labels on step dots/buttons)
10. Mobile-responsive: use responsive grid columns (`md:`, `lg:` prefixes)
