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
│   │   ├── problems.go             # GET /problems, GET /problems/:slug
│   │   ├── admin.go                # Admin endpoints (ingest, enrich, execute)
│   │   ├── leaderboard.go          # Leaderboard rankings
│   │   ├── profile.go              # User profile, stats
│   │   ├── me.go                   # Current user info
│   │   ├── middleware.go           # Auth checks, error handling
│   │   └── responses.go            # Shared response structs
│   ├── store/                      # Database access (raw pgx/v5)
│   │   ├── store.go                # DB pool initialization
│   │   ├── users.go                # User CRUD
│   │   ├── problems.go             # Problem definitions, metadata
│   │   ├── submissions.go          # Student code submissions
│   │   ├── progress.go             # Submission results
│   │   ├── testcases.go            # Generated test cases from enricher
│   │   ├── admin.go                # Admin operations
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
│   ├── hooks/                     # Custom React hooks
│   ├── lib/
│   │   ├── api.ts                 # Backend API client
│   │   ├── types.ts               # Shared TypeScript types
│   │   └── utils.ts               # Utilities
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
- `progress` — Submission ID → pass/fail/coverage/created_at
- `user_progress` — Cached: user ID → problems solved → last activity

**Storage constraint:** 500MB total; no bloated JSONB or redundant columns.

---

## API Endpoints

### Auth
- `POST /auth/register` — Create account (username, email, password)
- `POST /auth/login` — JWT token (accepts username/email/student_id)
- `POST /auth/google` — Google Sign-In with ID token
- `POST /auth/complete-google` — Set username after Google onboarding
- `GET /auth/check-username?username=xxx` — Username availability check
- `GET /me` — Current user + stats

### Problems
- `GET /problems` — List all problems (paginated)
- `GET /problems/:slug` — Problem details + test cases
- `POST /problems/:slug/submit` — Submit code (admin queue to executor)

### Admin
- `POST /admin/ingest` — Trigger GitHub ingest pipeline
- `POST /admin/enrich` — Trigger Gemini enrichment pipeline
- `POST /admin/execute` — Manually trigger execution (for testing)

### Leaderboard
- `GET /leaderboard` — Top 100 users by problems solved + time

### Profile
- `GET /profile/:username` — User profile + activity
- `GET /profile/:username/stats` — Performance metrics

---

## Frontend Key Files

| File | Purpose |
|---|---|
| `app/problems/[slug]/ProblemWorkspaceClient.tsx` | Monaco editor, code submission, real-time feedback |
| `app/(main)/leaderboard/page.tsx` | Leaderboard with sorting, filtering |
| `app/(main)/profile/page.tsx` | User stats, problem history, performance graphs |
| `app/(main)/admin/page.tsx` | Admin panel for ingest/enrich/execute triggers |
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
ADMIN_PASSWORD=...                 # Admin panel access
SANDBOX_URL=...                    # Remote sandbox URL (optional; empty = local Docker)

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
| **Rate limiting (submissions)** | Per-user sliding window: 5 req / 45s; admins exempt |
| **500MB Postgres storage** | No JSONB bloat; normalized schema; archive old submissions quarterly |
| **ARM64 only** | All Docker images multi-arch or explicitly ARM64; no `x86_64`-only binaries |

---

## Recent Changes

- **Profile page redesign:**
  - All 6 components overhauled: glassmorphism (`backdrop-blur-xl`, `bg-black/40`), animated gradient backgrounds
  - SVG XP ring with `stroke-dashoffset` animation around level badge
  - `AnimatedNumber` counters using `motion/react` `useMotionValue` + `animate` with staggered entrance
  - Timeline activity feed with vertical gradient line + animated dots
  - Shimmer skeleton with `@keyframes shimmer` replacing pulse skeleton
  - `pulse-slow` + `shimmer` animations added to `globals.css`
  - Hover lift with `whileHover`, per-stat gradient overlays
  - Premium achievement dialog with `backdrop-blur-xl`
- **Legal pages:** `/privacy` and `/terms` routes in `(legal)` layout group; auth footer links
- **Google token fix:** Added `FlexibleBool` custom JSON unmarshaler for `email_verified` (Google's `tokeninfo` endpoint returns string `"true"` not bool `true`); added `aud` claim validation
- **Google Sign-In migration (replaced Gitea):**
  - Backend: Migration 012 with `google_id`/`google_email`/`google_avatar_url`/`username`/`email` columns; all Google store methods; removed all Gitea code
  - Auth: `VerifyGoogleToken` via `oauth2.googleapis.com/tokeninfo`; JWT includes `Username` + `Onboarding` claims; `Login` accepts username/email/student_id
  - API: `POST /auth/google`, `POST /auth/complete-google`, `GET /auth/check-username`
  - Frontend: GIS button on login; `/onboarding` page with debounced username check; all surfaces use `username`/`google_avatar_url`
  - Settings page: Removed Gitea section; username read-only
- **Problem auto-publish:** Enrichment now sets `visible=true`; `POST /admin/problems/publish-all` endpoint + button
- **Shared achievements:** `lib/achievements.ts` module imported by both Achievements.tsx and ActivityFeed.tsx
- **Module proficiency gauges:** ResizeObserver responsive sizing, 16-color module palette, empty state

---

## Next Steps & Future Work

- **Phase 2:** Multi-language support (Python, Rust)
- **Phase 3:** Plagiarism detection via AST diffing
- **Phase 4:** Student peer review system

---

## Quick Reference: Common Tasks

### Add a New Problem
1. Update GitHub curriculum YAML
2. Trigger `POST /admin/ingest` (fetches + stores)
3. Trigger `POST /admin/enrich` (generates tests via Gemini)

### Debug a Failed Submission
1. Check `submissions` table for student code
2. Manually call `POST /admin/execute` with submission ID
3. View Docker logs in stdout/stderr output

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
