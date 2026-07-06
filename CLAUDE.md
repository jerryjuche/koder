# Koder — Codebase Index

## Project Overview

**Koder** is a zero-cost, production-grade automated code-grading platform for Go programming curricula. It runs on Oracle Cloud's free ARM64 tier and uses Gemini API for AI-powered test enrichment.

- **Stack:** Go 1.26 backend (chi router, pgx/v5 for PostgreSQL) + Next.js 14 frontend (Vercel free tier)
- **Infrastructure:** Go monolith on Oracle Ampere A1 (ARM64) + standalone Go sandbox on Railway (ARM64) + Supabase Postgres + Vercel frontend
- **Core Constraint:** $0/month operating budget with hard resource limits (500MB Postgres, 50 Gemini API calls/day, 2 concurrent executions max)

---

## Repository Structure

```
koder/
├── cmd/server/main.go              # Entry point; HTTP server setup, route registration
├── internal/                        # Core business logic
│   ├── api/                        # HTTP handlers (chi router endpoints)
│   │   ├── router.go               # Route registration
│   │   ├── auth.go                 # Login, register, JWT middleware
│   │   ├── change_password.go      # POST /auth/change-password (PIN-verified)
│   │   ├── pin_reset.go            # PIN-based forgot-password flow
│   │   ├── problems.go             # GET /problems, GET /problems/:slug
│   │   ├── admin.go                # Admin endpoints (ingest, enrich, stats, publish)
│   │   ├── leaderboard.go          # Leaderboard rankings
│   │   ├── profile.go              # User profile, stats
│   │   ├── me.go                   # Current user info
│   │   ├── submissions.go          # POST /submit
│   │   ├── test.go                 # POST /test (no-scoring execution)
│   │   ├── community.go            # Community solutions, likes
│   │   ├── contributions.go        # User-submitted problems
│   │   ├── activity.go             # Activity feed
│   │   ├── notifications.go        # Unread notifications
│   │   ├── feedback.go             # Feedback & bug report handler
│   │   ├── broadcasts.go           # Broadcast CRUD handlers
│   │   ├── cache.go                # Response caching utility
│   │   ├── middleware.go           # Auth checks, error handling
│   │   └── responses.go            # Shared response structs
│   ├── store/                      # Database access (raw pgx/v5)
│   │   ├── store.go                # DB pool initialization
│   │   ├── errors.go               # FriendlyError type + unique constraint violation detection
│   │   ├── users.go                # User CRUD
│   │   ├── problems.go             # Problem definitions, metadata
│   │   ├── submissions.go          # Student code submissions
│   │   ├── progress.go             # Submission results
│   │   ├── testcases.go            # Generated test cases from enricher
│   │   ├── admin.go                # Admin operations
│   │   ├── feedback.go             # Feedback/bug report CRUD
│   │   ├── broadcasts.go           # Broadcast CRUD store methods
│   │   ├── user_problems.go        # User-submitted problem staging & approval
│   │   └── types.go                # Shared types
│   ├── executor/                   # Code execution engine
│   │   ├── executor.go             # Main execution orchestrator (Docker + HTTP sandbox)
│   │   ├── sandbox_client.go       # HTTP client for remote sandbox service
│   │   ├── sandbox.go              # Docker spawn logic
│   │   ├── templates.go            # Go test file generation
│   │   └── types.go                # Test & result structs
│   ├── enricher/enricher.go        # Gemini API integration for test generation
│   ├── parser/parser.go            # Parse GitHub curriculum YAML
│   ├── auth/                       # JWT & password hashing
│   │   ├── jwt.go
│   │   └── password.go
│   └── config/config.go            # Environment variables & startup checks
├── frontend/                       # Next.js 14 (App Router)
│   ├── app/
│   │   ├── (auth)/                # Login/register pages
│   │   ├── (main)/                # Protected routes
│   │   │   ├── page.tsx           # Dashboard
│   │   │   ├── leaderboard/       # Leaderboard
│   │   │   ├── profile/           # User profile
│   │   │   └── admin/             # Admin panel
│   │   ├── problems/[slug]/       # Problem workspace (Monaco editor)
│   │   └── layout.tsx             # Root layout
│   ├── components/                # Reusable React components
│   │   ├── auth/                  # Auth form components (GoogleButton, AuthDivider, LabelInputContainer, BottomGradient)
│   │   ├── base/input/            # PinInput component (input-otp based, mask support)
│   │   ├── TestResultPanel.tsx    # Test output display
│   │   ├── GoogleLinkBanner.tsx   # Google account linking banner (links to Settings)
│   │   ├── FeedbackButton.tsx     # Floating feedback button + modal (all pages)
│   │   └── ...                    # UI components (shadcn/ui-based)
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-mobile.ts          # Mobile detection hook
│   │   └── use-google-one-tap.ts  # Shared GIS singleton (initialize once, prompt + renderButton)
│   ├── lib/
│   │   ├── api.ts                 # Backend API client
│   │   ├── types.ts               # Shared TypeScript types
│   │   ├── utils.ts               # cn(), getUserColor(), etc.
│   │   ├── achievements.ts        # Shared achievement definitions
│   │   ├── UserContext.tsx        # Auth/user context provider
│   │   ├── toast.tsx              # Toast notification component
│   │   └── index.ts               # Re-exports
│   └── next.config.ts             # Next.js config
├── migrations/                    # SQL schema (Supabase migrations)
├── scripts/                       # Utility scripts (seed data, etc.)
├── go.mod / go.sum               # Go dependencies
├── sandbox/                      # Standalone code execution service (Railway)
│   ├── main.go                   # HTTP server: /health, /version, /execute
│   ├── ratelimit.go              # Per-IP sliding window rate limiter
│   ├── secure.go                 # Pre-exec malicious code validation
│   ├── secure_unix.go            # rlimit, process group isolation
│   ├── secure_other.go           # Noop for non-Unix
│   ├── Dockerfile                # Two-stage arm64 build
│   └── go.mod                    # Standalone module, zero deps
└── CLAUDE.md                     # This file
```

---

## Key Architecture Decisions

| Decision | Implementation | Why |
|----------|---|---|
| **Monolithic Go Backend** | Single binary, single process | 4 ARM cores, 24GB RAM; microservices overhead too expensive |
| **Raw pgx/v5 (not GORM)** | Handwritten SQL | Full control over queries, predictable performance, smaller footprint |
| **Docker Subprocess** | `os/exec` + `docker run --network=none` | gVisor not available on Oracle free tier; WASM not ready for Go |
| **Sandbox HTTP Service** | Standalone Go binary on Railway | Default execution path avoids Docker-in-Docker nesting on Oracle OCI; cuts cold start to ~800ms; falls back to local Docker when `SANDBOX_URL` is empty |
| **Structured Outputs (Gemini)** | `ResponseSchema` API | Guaranteed response shape; no markdown parsing brittleness |
| **Go `text/template` for Tests** | Template compilation | Type-safe conditionals (primitive vs `reflect.DeepEqual`); injection-proof |
| **Synchronous Execution** | Buffered channel semaphore (max 2) | Simplifies resource management; avoids queue/Redis complexity |

---

## Core Pipeline

The system has **three sequential pipelines**:

### 1. **Ingest** (`admin.go` → `store.go`)
- Fetches GitHub YAML curriculum
- Stores raw problem definitions
- SHA256 idempotency check prevents duplicate processing

### 2. **Enrich** (`enricher.go` → Gemini API)
- Takes raw problem spec
- Calls Gemini with `ResponseSchema` to generate test cases
- Stores generated tests in `test_cases` table
- **Rate limit:** 2 req/min with enforced sleep between calls
- Respects 50 calls/day quota

### 3. **Execute** (`executor.go` → Docker / Sandbox)
- Student submits code
- Executor renders `main_test.go` from template + writes `solution.go`
- **Primary path:** Sends code to remote HTTP sandbox (`SANDBOX_URL`) — runs `go test` in Railway-hosted container
- **Fallback path:** Spawns local Docker container with `golang:1.23-alpine` + generated test file
- Returns pass/fail + coverage metrics
- **Concurrency limit:** 6 concurrent executions (buffered channel semaphore, configurable)

---

## Database Schema (High-Level)

**Key tables** (see `migrations/` for full DDL):

- `users` — Username, hashed password, role (student/admin)
- `problems` — Slug, difficulty, raw spec
- `test_cases` — Generated by enricher; JSON structure with test inputs/expected outputs
- `submissions` — Student code + language + timestamp
- `progress` — User ID + Problem ID (composite PK) → solved/stars/attempts/best_runtime/xp_awarded
- `user_progress` — Cached: user ID → problems solved → last activity
- `feedback` — User feedback & bug reports; type (general/bug/feature), priority, status, optional screenshot (base64), admin notes
- `broadcasts` — Admin-created broadcast announcements (type, priority, title, message, optional CTA, active flag)
- `user_broadcast_status` — Per-user broadcast dismissal tracking (user_id, broadcast_id, dismissed, dismissed_at)

**Storage constraint:** 500MB total; no bloated JSONB or redundant columns.

---

## API Endpoints

### Auth
- `POST /auth/register` — Create account (name, email, password, 6-digit PIN); issues JWT with `onboarding: true`
- `POST /auth/login` — JWT token (accepts username/email/student_id)
- `POST /auth/google` — Google Sign-In with ID token
- `POST /auth/complete-google` — Set username after Google onboarding (legacy alias)
- `POST /auth/complete-onboarding` — Set username + student_id after onboarding (for all auth methods)
- `POST /auth/link-google` — Link Google account to existing authenticated user
- `POST /auth/forgot-password` — Email-based reset link (Resend API; currently disabled in frontend)
- `POST /auth/reset-password` — Complete email-based reset with token
- `POST /auth/forgot-password-pin` — PIN-based: email + 6-digit PIN → short-lived JWT (5 min)
- `POST /auth/reset-password-pin` — PIN-based: JWT + new password → update
- `POST /auth/change-password` — Authenticated: verify PIN + set new password
- `GET /auth/check-username?username=xxx` — Username availability check (public)
- `GET /me` — Current user + stats

### Problems
- `GET /problems` — List all problems (paginated)
- `GET /problems/:slug` — Problem details + test cases
- `POST /submit` — Submit code (rate limited: 5 req/45s)
- `POST /test` — Test code without scoring

### Admin
- `POST /admin/ingest` — Trigger GitHub ingest pipeline
- `POST /admin/enrich` — Trigger Gemini enrichment pipeline
- `POST /admin/enrich-all` — Batch enrich all pending problems
- `POST /admin/problems/publish-all` — Publish all draft problems
- `GET /admin/stats` — Admin dashboard stats
- `GET /admin/activity` — Recent activity log
- `GET /admin/problems` — List all problems (including invisible)
- `PATCH /admin/problems/{id}/visibility` — Toggle problem visibility
- `GET /admin/user-problems/pending` — List pending user submissions
- `PATCH /admin/user-problems/{id}/approve` — Approve user problem
- `PATCH /admin/user-problems/{id}/reject` — Reject user problem

### Leaderboard
- `GET /leaderboard?period=all|weekly|monthly` — Top 100 users by XP + solved count

### Profile & Activity
- `GET /me/profile` — Full user profile with stats, module proficiency, achievements
- `PUT /me/profile` — Update name and bio
- `PUT /me/username` — Set username (one-time, only when `username_set` is false)
- `GET /me/activity?year=2026` — Contribution graph data
- `GET /me/contributions` — User's problem contribution submissions

### Community
- `GET /problems/{slug}/community-solutions` — Top community solutions
- `GET /best-practices` — Best practice solutions
- `POST /submissions/{id}/like` — Like a community solution
- `DELETE /submissions/{id}/like` — Unlike a community solution

### Contributions
- `POST /me/user-problems` — Submit a user-created problem
- `GET /me/contributions` — User's submitted problems

### Feedback
- `POST /feedback` — Submit feedback/bug report
- `GET /feedback/mine` — Current user's submitted feedback
- `GET /admin/feedback?status=new` — Admin list with optional status filter
- `GET /admin/feedback/counts` — Feedback counts by status
- `PATCH /admin/feedback/{id}` — Update status and admin notes

### Broadcasts
- `POST /admin/broadcasts` — Create a broadcast (type, title, priority, optional CTA)
- `GET /admin/broadcasts` — List all broadcasts (admin)
- `PATCH /admin/broadcasts/{id}/deactivate` — Deactivate a broadcast
- `DELETE /admin/broadcasts/{id}` — Permanently delete a broadcast
- `GET /me/broadcasts` — List active (non-dismissed) broadcasts for current user
- `POST /me/broadcasts/{id}/dismiss` — Dismiss a broadcast for current user

### Notifications
- `GET /notifications` — Unread notifications
- `POST /notifications/read-all` — Mark all as read
- `POST /notifications/{id}/read` — Mark single as read

---

## Frontend Key Files

| File | Purpose |
|---|---|---|
| `app/problems/[slug]/ProblemWorkspaceClient.tsx` | Monaco editor, code submission, real-time feedback |
| `app/(main)/leaderboard/page.tsx` | Leaderboard with sorting, filtering |
| `app/(main)/profile/page.tsx` | User stats, problem history, performance graphs |
| `app/(main)/admin/page.tsx` | Admin panel for ingest/enrich/stats/approvals |
| `app/(main)/admin/FeedbackPanel.tsx` | Admin feedback section with status filters, screenshot preview |
| `components/BroadcastBanner.tsx` | Color-coded, dismissable broadcast banner (type icon, priority badge, title, CTA) |
| `app/(main)/admin/BroadcastPanel.tsx` | Admin panel to create, list, and delete broadcasts |
| `components/auth/google-button.tsx` | Custom dark Google Sign-In button with SVG logo + shadow-input |
| `components/auth/bottom-gradient.tsx` | Amber gradient line animation on button hover |
| `components/auth/label-input-container.tsx` | Input + label spacing wrapper (Aceternity pattern) |
| `components/auth/auth-divider.tsx` | "or" divider with border and muted text |
| `components/base/input/pin-input.tsx` | PinInput component with mask support, size variants, shadcn/input-otp-based |
| `components/ui/label.tsx` | shadcn Label component with Radix + CVA |
| `components/ui/input-otp.tsx` | shadcn InputOTP component (used by PinInput) |
| `lib/api.ts` | Fetch wrapper for backend endpoints |
| `lib/types.ts` | TypeScript interfaces (shared with backend via documentation) |

---

## Environment Variables

```bash
# Backend (Go)
DATABASE_URL=postgres://...        # Supabase connection string
GEMINI_API_KEY=...                 # Google AI Studio key
JWT_SECRET=...                     # For token signing
GOOGLE_CLIENT_ID=...               # Google OAuth client ID (for Sign-In)
ADMIN_EMAIL=...                    # Admin email for feedback notifications
ADMIN_PASSWORD=...                 # Admin panel access
SANDBOX_URL=...                    # Remote sandbox URL (optional; empty = local Docker)
RESEND_API_KEY=...                 # Resend API key for feedback email notifications

# Frontend (Next.js)
NEXT_PUBLIC_API_URL=...            # Backend domain (used by fetch)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...   # Same as GOOGLE_CLIENT_ID (for GIS button)
```

See `.env.example` for full template.

---

## Development Workflow

### Local Development

1. **Backend:**
   ```bash
   go run cmd/server/main.go
   ```
   Starts HTTP server on `:8080`

2. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Starts Next.js on `:3000`

3. **Database:**
   - Use Supabase GUI or `supabase db push` for migrations

### Testing

- **Unit tests:** `go test ./internal/...`
- **Integration tests:** Executor tests spawn real Docker containers
- See `internal/executor/executor_test.go` for test patterns

### Database Migrations

- Add SQL files to `migrations/` (Supabase convention)
- Push via Supabase CLI or manual SQL execution

---

## Key Implementation Notes

### Execution Sandbox (`executor/sandbox.go`)
- Docker image: `golang:1.23-alpine` (ARM64-compatible)
- Resource limits: `--memory=64m`, `--network=none`
- Test file generated at runtime from Go template
- Output captured via `docker logs` and parsed for pass/fail counts

### Remote Sandbox Service (`sandbox/`)
- Standalone Go binary, zero external deps, deployed on Railway
- `POST /execute` receives `{code, test_code, timeout_sec}`, writes temp `main_test.go`, runs `go test -v`  
- Pre-exec validation blocks dangerous patterns (`os/exec`, `syscall`, `unsafe`, `net`, filesystem writes)
- `setrlimit` sandboxing: NPROC=6, NOFILE=1024, FSIZE=64MB; `Setpgid` for process group kill
- Per-IP sliding window rate limiter: 10 req/min, HTTP 429 with `Retry-After`
- Health (`GET /health`) and version (`GET /version`) endpoints bypass rate limiter
- Backend branches on `SANDBOX_URL` — sends `solution.go` + `main_test.go` via HTTP, falls back to local Docker when unset

### Test Generation (`executor/templates.go`)
- Uses Go's `text/template` package
- Dynamically handles:
  - Primitive types (`int`, `string`, `bool`) → direct comparison
  - Slices/arrays → `reflect.DeepEqual`
  - Custom structs → `reflect.DeepEqual` or custom comparators
- Generated `main_test.go` is deterministic and auditable

### Enricher (`enricher/enricher.go`)
- Single responsibility: Convert raw problem spec to test cases via Gemini
- `ResponseSchema` ensures deterministic output shape
- Results cached in DB; only re-runs if spec changes (SHA256 check)

### Authentication (`auth/jwt.go`)
- JWT tokens signed with `HS256` (shared secret in `JWT_SECRET`)
- Token expiry: 24 hours (configurable)
- Middleware in `api/middleware.go` validates on protected routes

---

## Constraints & Performance Mitigations

| Limit | Mitigation |
|---|---|
| **50 Gemini calls/day** | Idempotent enrichment with SHA256 change detection; cache results |
| **2 req/min Gemini** | Enforced `time.Sleep(30s)` between calls; queued requests |
| **6 concurrent executions** | Buffered channel semaphore (configurable via `EXECUTOR_MAX_CONCURRENCY`) |
| **10 pool connections** | pgxpool `MaxConns=10`, `MinConns=2`, tuned for Supabase 15-conn free tier limit |
| **Unbounded queries** | `LIMIT` added to all row-returning SELECTs (100–200 per table) |
| **Rate limiting (submissions)** | Per-user sliding window: 5 req / 45s; admins exempt |
| **500MB Postgres storage** | No JSONB bloat; normalized schema; archive old submissions quarterly |
| **ARM64 only** | All Docker images multi-arch or explicitly ARM64; no `x86_64`-only binaries |

---

## Recent Changes

- **July 4 — Data reset + professional seed (45 problems):**
  - `scripts/reset_data.sql` — Safe DELETE-order reset script (clears 128 problems, 234 test cases, submissions, progress, activity, broadcasts, feedback, notifications; resets all user XP to 0; keeps user accounts intact)
  - `migrations/019_seed_problems1.sql` — 45 hand-crafted Go problems across 3 modules (math-recursion, arrays-strings, data-structures), 15 problems each, 5 test cases per problem, `ON CONFLICT (slug) DO NOTHING` safe
  - `migrations/019_seed_problems2.sql` — 45 additional Go problems across 3 modules (bit-manipulation, sorting-searching, pointers), 15 problems each, 5 test cases per problem
  - Removed `migrations/018_seed_problems.sql` (old/replaced seed)
- **Account deletion:** `POST /me/delete-account` endpoint with transactional cascade cleanup (submissions → progress → user); Settings page two-step confirmation dialog; `deleteAccount()` API function
- **Go version configurable:** `GO_VERSION` env var (default `"1.23"`) wired through `PrepareSandbox`, sandbox client, and `.env.example`
- **Dead code removal:** Removed `cmd/sandbox/main.go` placeholder; removed Gitea proxy handler from `sandbox/main.go`; replaced deprecated `strings.Title` with `cases.Title`
- **Google auth hardening:** `GoogleAuth` no longer auto-creates accounts — returns `404 GOOGLE_NOT_LINKED` on unknown Google profiles; added `google_linked: bool` to `/me` response
- **Shared GIS hook:** `hooks/use-google-one-tap.ts` — module-level singleton that loads GIS script once and calls `initialize()` once; all 4 consumers (login, register, settings, banner) share it
- **Popover-based Google linking:** `renderButton()` exposed from hook (popup, no FedCM dependency); banner and settings use it instead of `prompt()`; fixed invalid `width: '100%'` → numeric 350
- **GoogleLinkBanner component:** Professional amber-gradient banner with `AlertTriangle` icon, localStorage dismiss, auto-hides when `google_linked` is true; replaces old `GoogleSyncBanner`
- **Hydration mismatch fix:** `mounted` state pattern on login/register pages prevents server/client mismatch caused by `ready` flipping from `false` to `true` post-hydration
- **FedCM robustness:** `initialize()` and `prompt()` wrapped in try-catch; `itp_support: true` added for browser compatibility
- **July 1 professional review — auth rework:**
  - Registration flow: `POST /auth/register` now creates user with `student_id = username` (was separate field); issues JWT with `onboarding: true` (was `false`)
  - New endpoint `POST /auth/complete-onboarding`: sets both `username` and `student_id` after registration; unified handler for all auth methods (replaces `complete-google` as the canonical path)
  - New endpoint `POST /auth/link-google`: links Google account to an already-authenticated user
  - `POST /auth/complete-google` now an alias that delegates to `complete-onboarding`
  - Store: added `UpdateUserStudentID(userID, studentID)` method; `CreateUser` and `CreateUserFromGoogle` no longer set `student_id` on creation
  - `GetUserByLogin` now also checks `username`, `email`, AND `student_id` fields
  - Profile colors: `ColorIndex` now persisted per-user with endpoint-based assignment (4-color palette), stored in `color_index` column
- **GIS button reliability fixes:**
  - `ready` signal made dynamic — `useState` that flips `true` only after script loads + init attempt completes (not on init success only, so FedCM localhost errors don't leave UI stuck at disabled fallback)
  - Removed `cancel_on_tap_outside`/`itp_support` from `initialize()` — these One Tap-specific options trigger FedCM mediation during init, causing throws on localhost; `renderButton()` (popup) doesn't need them
  - Explicit 350×40px container for GIS `renderButton` target (was `width: 100%` — GIS needs a concrete pixel width)
  - Fallback detection: 500ms timeout checks `childElementCount` after `renderButton()`; if zero, falls back to `prompt()` (One Tap)
  - All GIS errors now logged to console with `[GIS]` prefix (were silent — try-catch swallowed everything)
  - Removed hidden-div + programmatic-click approach (GIS refuses to render into `display: none`)
- **GIS simplification (July 1 finale):** FedCM `initialize()` throws `Required member is undefined` in Chrome — `ready` state never fired due to React batching race. Removed GIS `renderButton` from Settings entirely (plain button calling `prompt()` instead). Stripped all GIS code from `GoogleLinkBanner` (now simple info banner linking to `/settings?tab=security`). Settings page reads `?tab=` query param via `useSearchParams`.
- **Avatar 500 fix:** Replaced `<Image>` with native `<img>` for Google avatar URLs in `TopNav.tsx` — Next.js image optimization proxy was returning 500 on `lh3.googleusercontent.com` URLs.
- **Settings Notifications tab:** New tab showing last 20 notifications with type-colored icons, unread indicators, "Mark all as read", relative timestamps via date-fns, and empty state
- **Backend `GET /notifications/recent`:** Returns last 20 notifications (read + unread) for settings; new `GetRecentNotifications()` store method
- **Admin approve notifies all users:** `ApproveUserProblem` now also calls `NotifyAllUsers()` — every user gets a "New problem available: X" notification when a community problem is approved
- **Header notifications clickable:** Clicking a notification in the dropdown navigates to `/settings?tab=notifications` and marks it as read
- **New `NotifyAllUsers()` store method:** Inserts a notification for every user in the database
- **`ApproveUserProblem` returns new problem ID:** Changed signature from `(*UserProblem, error)` to `(*UserProblem, *uuid.UUID, error)` so the handler can reference the created problem in notifications
- **July 3 — Unsolved-first problem sorting:** Home page problem grid now sorts unsolved problems before solved ones via `sort((a, b) => Number(a.solved) - Number(b.solved))`
- **July 3 — Professional Google-first auth layout:** Both login and register pages redesigned with Google Sign-In as primary action, custom dark Google button with SVG logo + `shadow-input`, "or sign in with email" divider, framer-motion staggered entrance animations
- **July 3 — Professional auth form components:** New reusable component library in `components/auth/` — `GoogleButton`, `BottomGradient` (amber gradient line on button hover), `LabelInputContainer`, `AuthDivider`; new `components/ui/label.tsx` (shadcn Label with Radix + CVA); `--shadow-input` CSS variable added to globals.css
- **July 3 — Landing page polish:** Replaced "Go" text with official Go wordmark SVG from pkg.go.dev; removed editor mockup preview; simplified footer with real project links (Problems, Leaderboard, Contribute, GitHub, Privacy, Terms)
- **July 3 — Feedback & bug report system:**
  - New `migrations/014_feedback.sql` table with type/priority/status/screenshot support
  - `POST /feedback` endpoint with validation and Resend email notification to admin
  - `GET /admin/feedback` with status filtering, `PATCH /admin/feedback/{id}` for status/notes
  - `GET /feedback/mine` for users to track their own submissions
  - Floating `FeedbackButton` component with 3-tab modal (General/Bug/Feature), priority selector, base64 screenshot upload, anonymous toggle
  - `FeedbackPanel` in admin dashboard with status tabs, search, expandable rows, screenshot preview, inline status change
  - `RESEND_API_KEY` env var for email notifications
- **July 3 — Broadcast notification system:**
  - New `migrations/015_broadcasts.sql` — `broadcasts` + `user_broadcast_status` tables
  - Backend `internal/api/broadcasts.go` — 6 handlers for create/list-active/dismiss/list-all/deactivate/delete
  - Backend `internal/store/broadcasts.go` — all CRUD + user-dismiss store methods; `NotifyAllUsers()` called on broadcast creation
  - `BroadcastBanner.tsx` — compact, centered, color-coded banner per type (info/warning/update/new_feature/maintenance/announcement), fit-to-content width, per-user dismiss, live-polling every 5s
  - `BroadcastPanel.tsx` — compact admin form with type/priority/title/CTA, history list with delete, shows "Admin" not user name
  - `message` field optional (defaults to title), `priority` optional (defaults to medium)
  - `ReplaceBroadcastNotifications()` — atomic transaction that deletes old broadcast notifications and inserts new one, preventing stacking
  - `GetActiveBroadcasts` — subquery ensures only the single latest broadcast shows; dismissed broadcasts never resurface older ones
  - `useNotifications.ts` — polling interval reduced to 5s for instant notification badge updates
  - Goroutine uses `context.Background()` instead of canceled request context
- **July 3 — Streak refactor:**
  - Extracted `CalculateStreak()` shared helper on `PostgresStore` (single source of truth, replaces inline SQL in `GetUserStats`)
  - New `migrations/016_add_streak_index.sql` — composite index `idx_submissions_user_status_date` for efficient streak queries
  - Dashboard now shows streak card even when `0` (consistency with profile page)
  - `api.ts` fallback uses `?? 0` instead of `|| 0`
- **July 3 — Performance optimization sprint:**
  - **Broadcast fixes (post-launch):** `NewBroadcast.Message` and `Priority` made optional (`omitempty`); handler defaults priority→"medium", message→title; `ReplaceBroadcastNotifications` atomic (DELETE+INSERT in single transaction); **CRITICAL BUG FIXED** — was using `SELECT $1,$2,$3,$4 FROM users` instead of `SELECT id,$1,$2,$3 FROM users` (broadcast notifications now actually work)
  - **Banner & Panel redesign:** `BroadcastBanner` — slim card (px-4 py-2.5, size-8 icon), `w-fit mx-auto` centered, no message text, "Admin" label, 5s polling; `BroadcastPanel` — compact form + history list with delete buttons, shows "Admin"
  - **Query optimization:**
    - `ListVisibleProblems`: replaced 3 correlated subqueries with single `LATERAL` join; dropped `statement`/`raw_readme` from listing query
    - `GetUserStats`: split into two queries — no more `LEFT JOIN submissions` (avoided 50× row multiplication)
    - `GetBestPractices`: replaced `HAVING COUNT(sl.id) > 0` with `EXISTS (SELECT 1 FROM submission_likes ...)`
  - **Bulk INSERTs:** `UpsertEnrichedProblem` + `UpsertTestCasesForProblem` — resolve `problem_id` once, single multi-row `VALUES` INSERT instead of N round-trips
  - **LIMITs added everywhere:** `GetAllBroadcasts` 200, `ListVisibleProblems` 200, `ListProblemsNeedingEnrichment` 100, `ListAllProblemsAdmin` 200, `GetAdminFeedback` 100, `GetUserFeedback` 50, `GetTestCasesForProblem` 200, `GetVisibleTestCasesForProblem` 200, user problem lists 100
  - **pgxpool tuning:** `MaxConns=10`, `MinConns=2`, `MaxConnLifetime=30m`, `MaxConnIdleTime=5m` — tuned for Supabase 15-conn limit
  - **Infrastructure hardening:** Rate limiter periodic cleanup goroutine (evicts stale entries every 2× window); cache `stopCh` for graceful goroutine shutdown; feedback email `&http.Client{Timeout: 10 * time.Second}` (was no timeout)
  - **Migration 017** — `migrations/017_optimization_indexes.sql` — 16 performance indexes on all key query columns (users email UNIQUE, users xp DESC, submissions composites, notifications composites, problems visible+created, progress user WHERE solved, feedback, test_cases, broadcasts, problems author)

---

- **July 5 — PIN-based password management (professional flow):**
  - **Backend `POST /auth/change-password`:** New authenticated endpoint that accepts `{ pin, new_password }`, verifies 6-digit PIN against bcrypt `pin_hash`, and updates password
  - **Settings change password:** 3-step dialog modal (masked PIN entry → new password + confirm → success checkmark) with inline error handling
  - **Forgot password redesign:** Email reset tab disabled with `Ban` icon + "Email reset unavailable" message; default tab is Recovery PIN; PIN digits masked via new `mask` prop
  - **PinInput `mask` prop:** When `true`, displays `•` instead of digits (password-style input)
  - **Migration `022_add_pin_hash.sql`:** Adds `pin_hash TEXT` column to users table
  - **PIN rate limiting:** 5 attempts per 15 minutes per email (in-memory map) on forgot-password-pin
  - **shadcn InputOTP installed** as foundation for PinInput component
- **July 5 — Auth cookie fix for cross-origin dev server:**
  - Render proxy terminates TLS internally, so `r.TLS` is `nil` in the Go app — added `isHTTPS()` helper that checks both `r.TLS` and `X-Forwarded-Proto` header
  - `SetAuthCookie` and `ClearAuthCookie` now dynamically set `Secure` and `SameSite: None` when HTTPS, `Secure: false` and `SameSite: Lax` when HTTP
  - Fixes login on cross-origin setups (Vercel frontend → Render backend)
- **CSP fix:** Added `https://accounts.google.com` to `style-src` in `next.config.ts` (was blocking Google Sign-In stylesheet)
- **Route fix:** `GET /auth/check-username` moved outside `AuthMiddleware` group — was returning 401 during registration (user has no JWT yet)
- **July 5 — Problem field split:**
  - **Migration `023_split_problem_fields.sql`**: Adds `constraints TEXT` and `learning_objective TEXT` columns to `problems` table
  - `Problem.Constraints`/`Problem.LearningObjective` in Go struct, all 5 SELECT queries updated
  - Frontend: workspace shows Learning Objective callout + Constraints section
  - Seed files 1–4 (180 problems): `statement` is clean description, structured fields populated
- **July 5 — Monaco Editor local workers:**
  - Monaco served from `public/vs/` (local npm workers) instead of jsDelivr CDN
  - `scripts/copy-monaco.mjs` — copies Monaco web workers to `public/vs/` before `next build`
  - `DynamicWorkspace.tsx` — Client Component wrapper for `next/dynamic` (Next.js 15 constraint)
  - CSP `worker-src 'self' blob:` added for Monaco blob-based workers
- **July 5 — Card excerpt markdown stripping:**
  - Home page problem cards strip markdown syntax (`#`, `**`, code fences) from statement excerpts
- **July 5 — Confetti overhaul:**
  - Split confetti into its own `useEffect([])` with try-catch, `setInterval` bursts
  - 60 particles per side (was 12), spread 90, startVelocity 45, interval 150ms, duration 3.5s
  - Fires when data is ready (not on mount); toast duration reduced to 2s
- **July 5 — Pagination (home page):**
  - 18 items per page, first/prev/next/last buttons with smart page numbers and ellipsis
  - Resets to page 1 on module filter change
- **July 5 — Back button module context:**
  - Workspace/success links use `/home?module=<module>`; home page reads `?module=` from URL on mount
- **July 5 — SessionStorage caching:**
  - `lib/cache.ts` — generic sessionStorage cache with 30s TTL
  - `fetchApi` caches GET responses; `user-updated` handler debounced (300ms) clears stale keys
  - Dashboard stores all problems in `koder_all_problems`; workspace stores slug in `koder_problem_{slug}`
- **July 5 — Performance optimization pass:**
  - `filteredProblems` wrapped in `useMemo`; `ModuleCards` wrapped in `React.memo`
  - `handleSelectModule` wrapped in `useCallback`; `<link rel="preconnect">` for API domain in root layout
- **July 6 — Error handling overhaul:**
  - **New `internal/store/errors.go`**: `FriendlyError` type with `DUPLICATE_RESOURCE`/`NOT_FOUND`/`VALIDATION_ERROR` codes
  - `IsUniqueViolation()` helper maps PG constraint names to human-readable messages (e.g. `idx_users_email_unique` → "An account with this email already exists")
  - `CreateUser` and `CreateUserFromGoogle` return friendly errors instead of raw PG errors
  - Register handler propagates `DUPLICATE_RESOURCE` with proper HTTP 409
- **July 6 — username_set column (registration race condition fix):**
  - **Migration `024_add_username_set.sql`**: `ALTER TABLE users ADD COLUMN username_set BOOLEAN NOT NULL DEFAULT false`
  - `User.UsernameSet` / `NewUser.UsernameSet` in struct; all 7 SELECT queries include `username_set`
  - `UpdateUserUsernameSet()` store method; `CompleteOnboarding` sets `username_set = true`
  - Login/Google auth uses `!user.UsernameSet` instead of old `strings.HasPrefix` heuristic
  - `/me` endpoint returns `username_set`; frontend `User` type includes `usernameSet`
- **July 6 — Settings username editing:**
  - **Backend `PUT /me/username`**: Validates username, checks uniqueness, updates username + student_id, sets `username_set = true`. Returns 403 if already set
  - **Settings page**: Conditionally shows editable username field when `usernameSet === false` with inline validation and save button; read-only view with "Contact support" when already set
- **July 6 — Professional 404 page:**
  - `frontend/app/not-found.tsx` — layered visual hierarchy with Terminal icon, gradient text, shadcn semantic tokens, Home + Go Back actions
- **July 6 — GOT/WANT parser fix (broken since inception):**
  - `internal/executor/executor.go`: GOT/WANT regex changed from `^GOT:\s+(.*)$` to `(?:\s|^)GOT:\s+(.*)$` — Go's `t.Errorf` prefixes every line with `\tfile:line: `, so the start-of-string anchor never matched. `gotMap`/`wantMap` were always empty, making got/want identical and the diff invisible
  - Multi-line accumulation: empty lines within multi-line GOT/WANT values are now preserved instead of skipped
- **July 6 — Solved status guard:**
  - `GetProblemBySlug(..., userID)` now accepts `userID uuid.UUID`, does `LEFT JOIN progress`, returns `Solved`/`Stars`/`Attempts`
  - Submit handler returns `409 ALREADY_SOLVED` when `problem.Solved` is true
  - Test handler stays active (no solved guard on `/test`)
  - Frontend: Submit button disabled with `CheckCircle2` + "Solved" badge; test button stays clickable
  - `community.go` fixed to pass `uuid.Nil` to updated `GetProblemBySlug` signature
- **July 6 — Professional TerminalDiff component:**
  - `frontend/components/TestResultPanel.tsx`: LCS-based unified diff for multi-line got/want; side-by-side grid for single-line values
  - Git-style `-/+` gutter markers with red/green backgrounds and line numbers
  - Replaced old word-level diff (`computeWordDiff`) and side-by-side line comparison
- **July 6 — Error message standardization:**
  - `setError(err.message)` → `setError(err.message || "Failed to submit contribution")` in contribute page (P0 fix)
  - `toast.error(res.error.message)` → `toast.error(res.error?.message || "...")` with optional chaining in workspace (P1 fix)
  - All `'Network error'` fallbacks changed to `'Unable to connect. Please try again.'` across 7 files (login, register, onboarding, forgot-password, reset-password, settings)
- **July 6 — PIN rate limit message:**
  - `internal/api/pin_reset.go`: Changed "Try again later" → "Please wait 15 minutes"

---

## Quick Reference: Common Tasks

### Add a New Problem
1. Update GitHub curriculum YAML
2. Trigger `POST /admin/ingest` (fetches + stores)
3. Trigger `POST /admin/enrich` (generates tests via Gemini)

### Debug a Failed Submission
1. Check `submissions` table for student code
2. Reproduce by submitting the same code via the frontend
3. View execution logs in output_logs column or docker/sandbox stdout

### Extend the API
1. Add handler in `internal/api/` (e.g., `new_feature.go`)
2. Register route in `api/router.go`
3. Add database queries to `internal/store/` if needed

### Add Database Column
1. Create SQL migration in `migrations/`
2. Update Go struct in `internal/store/types.go`
3. Update all relevant CRUD queries

---

## Useful Links

- **Repo:** https://github.com/jerryjuche/koder
- **Frontend:** Deployed on Vercel (CLI: `vercel deploy`)
- **Backend:** Oracle Cloud Ampere A1 (SSH: `ssh ubuntu@...`)
- **Database:** Supabase Postgres (UI: Supabase dashboard)
- **Issues:** Linear project "KODER" (internal tracking)
