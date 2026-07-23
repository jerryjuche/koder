# Koder

> A zero-cost, production-grade automated code-grading platform for **Go** and **Python** programming curricula.  
> Built for constraint. Engineered for correctness. Designed for scale within those constraints.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Decision Record](#2-architecture-decision-record)
3. [Infrastructure Map](#3-infrastructure-map)
4. [Repository Structure](#4-repository-structure)
5. [Database Schema & Data Model](#5-database-schema--data-model)
6. [Pipeline Architecture](#6-pipeline-architecture)
7. [Execution Engine Deep Dive](#7-execution-engine-deep-dive)
8. [API Reference](#8-api-reference)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Development Phases](#10-development-phases)
11. [Environment Variables & Configuration](#11-environment-variables--configuration)
12. [Coding Standards & Conventions](#12-coding-standards--conventions)
13. [Testing Strategy](#13-testing-strategy)
14. [Security Model](#14-security-model)
15. [Performance Constraints & Mitigations](#15-performance-constraints--mitigations)
16. [Copilot Context & AI Pairing Guide](#16-copilot-context--ai-pairing-guide)

---

## 1. Project Overview

**Koder** is a self-hosted, automated programming assignment grader supporting **Go** and **Python** curricula. It ingests curriculum definitions, processes raw exercise definitions through an AI enrichment pipeline (NVIDIA NIM / DeepSeek V4 Flash), and evaluates student function submissions inside ephemeral, isolated sandboxes — all at **$0/month** operating cost.

### Primary Constraints (Non-Negotiable)

| Constraint | Implication |
|---|---|---|
| $0/month operating budget | Every infrastructure choice must target a free tier |
| ARM64 host (Oracle Ampere A1) | All Docker images and binaries must be ARM64-compatible |
| 500MB Supabase storage | No bloated JSONB, no redundant columns |
| NVIDIA NIM API quota (DeepSeek V4 Flash) | Ingest + Enrich must be idempotent with SHA256 change detection |
| 3 retries with exponential backoff | 429/503 retry handling with 2s/4s/8s backoff |
| 6 concurrent executions max | Buffered-channel semaphore (configurable via EXECUTOR_MAX_CONCURRENCY) |
| 5 submissions per 45s per user | Per-user sliding window rate limiter; admins exempt |

### What This System Is Not

- It is **not** a general-purpose LeetCode clone. It grades Go functions against a known, AI-enriched spec.
- It is **not** async. The execution pipeline is synchronous and blocking by design. Adding Redis, queues, or goroutine pools would violate the simplicity and resource constraints.
- It is **not** a general-purpose LeetCode clone. It grades Go and Python functions against a known, AI-enriched spec.

---

## 2. Architecture Decision Record

### ADR-001: Monolithic Go Backend over Microservices
**Decision:** Single binary, single process, single host.  
**Rationale:** The VM has 4 ARM cores and 24GB RAM on the free tier, but network egress, container orchestration overhead, and service discovery would consume too many resources and add failure surfaces for a 20–30 student cohort.

### ADR-002: Raw pgx/v5 over GORM or sqlx
**Decision:** Write all SQL by hand using `jackc/pgx/v5` connection pools.  
**Rationale:** ORMs generate unpredictable queries, load reflection-heavy metadata at startup, and make it harder to reason about the exact SQL executed against Supabase's Postgres. `pgx/v5` is faster, has a smaller memory footprint, and forces explicit query design.

### ADR-003: Docker Subprocess over gVisor / WASM sandbox
**Decision:** `os/exec` + `docker run` for sandboxed execution.  
**Rationale:** gVisor requires kernel configuration the Oracle free tier does not support. WASM for Go is immature. Docker with `--network=none --memory=64m` provides sufficient isolation without custom kernel modules.

### ADR-004: System Prompt JSON over Structured Outputs  
**Decision:** Use system prompt enforcement of JSON output; NVIDIA NIM's DeepSeek V4 Flash does not reliably support `response_format: json_object` (returns schema instead of data).  
**Rationale:** A well-crafted system prompt with example JSON output, combined with post-response validation and JSON extraction (strip markdown fences, extract first `{...}` block), provides equivalent reliability without depending on API-side structured output support.

### ADR-005: Go `text/template` for Test File Generation
**Decision:** Generate `main_test.go` at runtime from a compiled Go template, not string concatenation.  
**Rationale:** Test generation requires type-safe conditional logic (primitive `==` vs `reflect.DeepEqual` for slices). String concatenation produces unmaintainable, injection-prone code generation. Templates are auditable and testable independently.

### ADR-006: Remote HTTP Sandbox over Docker-in-Docker
**Decision:** Standalone Go HTTP service on Railway as default execution path, local Docker fallback.  
**Rationale:** Running `docker run` inside the Oracle OCI VM creates a Docker-in-Docker pattern with cold-start issues (~2s per submission). A dedicated sandbox service on Railway eliminates Docker nesting, reduces cold start to ~800ms, and provides consistent resource isolation regardless of the backend host. Falls back transparently when `SANDBOX_URL` is empty.

---

## 3. Infrastructure Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        Student Browser                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────────────┐
│               Vercel Hobby Tier (Frontend)                      │
│         Next.js 15 App Router + Tailwind CSS 4 + Monaco         │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS REST API + WebSocket
┌─────────────────────────▼───────────────────────────────────────┐
│            Go Monolith — Render / Oracle (ARM64)                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  chi Router → Middleware → Handler → Store (pgx/v5)      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │   │
│  │  │ Ingest   │  │  Enrich  │  │     Execute           │   │   │
│  │  │ (parser) │  │ (NVIDIA) │  │ Go / Python sandbox   │   │   │
│  │  └──────────┘  └────┬─────┘  └──────────┬───────────┘   │   │
│  └─────────────────────┼───────────────────┼────────────────┘   │
│                        │ NVIDIA NIM API     │ HTTP              │
│                        │ (DeepSeek V4)      │ (Railway)         │
└────────────────────────┼───────────────────┼────────────────────┘
                         │                   │
┌────────────────────────▼───────────────────▼────────────────────┐
│  NVIDIA NIM Cloud API            Railway Sandbox Service        │
│  ai.api.nvidia.com              Go + Python execution          │
│  /v1/chat/completions           setrlimit, AST validation      │
└─────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│              Supabase Free Tier (Postgres 500MB)                │
│  users / problems / test_cases / submissions / progress         │
│  feedback / broadcasts / notifications / ai_usage_logs          │
│  refresh_tokens / curriculum CMS (courses→modules→lessons)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Repository Structure

```
koder/
├── README.md                        # This file
├── CLAUDE.md                        # Project index for AI assistants
├── audit.txt                        # Latest comprehensive audit report
├── implementation.md                # Curriculum CMS implementation plan
├── progress.md                      # Curriculum CMS progress tracker
├── .env.example                     # All required environment variables documented
├── .github/workflows/ci.yml         # CI: go vet, test, build; frontend lint, tsc, build
├── go.mod / go.sum                  # module github.com/jerryjuche/koder
│
├── cmd/server/
│   └── main.go                      # Entry point: JSON logging, graceful shutdown
│
├── internal/
│   ├── config/config.go             # Env var loading, startup validation, defaults
│   │
│   ├── store/                       # DATABASE LAYER — pure pgx/v5, no ORM
│   │   ├── store.go                 # Store interface (80+ methods) + PostgresStore impl
│   │   ├── errors.go                # FriendlyError type + unique constraint detection
│   │   ├── types.go                 # All data types: User, Problem, Submission, etc.
│   │   ├── users.go                 # User CRUD, bcrypt, Google linking, export, search
│   │   ├── problems.go              # Problem queries, JSONB language_versions encoding
│   │   ├── submissions.go           # Submission insert, community solutions, likes
│   │   ├── progress.go              # Upsert progress, XP, streak calculation
│   │   ├── testcases.go             # Test case queries with JSONB handling
│   │   ├── admin.go                 # Admin stats, activity, publish, user verify
│   │   ├── curriculum.go            # Curriculum CMS CRUD (courses→modules→lessons→sections)
│   │   ├── feedback.go              # Feedback/bug report CRUD
│   │   ├── broadcasts.go            # Broadcast CRUD store methods
│   │   ├── notifications.go         # Create, get, mark-read, notify-all
│   │   ├── user_problems.go         # Community problem staging & approval
│   │   ├── profile.go               # Full profile, module proficiency, recent submissions
│   │   ├── ai_usage.go              # AI usage logging and stats (graceful missing table)
│   │   ├── refresh_tokens.go        # Refresh token rotation + reuse detection
│   │   ├── password_reset.go        # PIN + email password reset tokens
│   │   └── token_blacklist.go       # JWT revocation for logout
│   │
│   ├── auth/
│   │   ├── jwt.go                   # JWT sign/verify (HS256), token refresh
│   │   ├── password.go              # bcrypt hash/check
│   │   └── oauth.go                 # Google ID token verification (JWKS)
│   │
│   ├── broker/broker.go             # In-memory pub/sub for WebSocket events
│   │
│   ├── parser/parser.go             # PIPELINE 1: GitHub YAML curriculum parsing
│   │
│   ├── enricher/enricher.go         # PIPELINE 2: NVIDIA NIM (DeepSeek V4 Flash) AI enrichment
│   │                                #   Dual-language: Go + Python in language_versions
│   │                                #   Fallback Python generation (toSnakeCase, toPythonType)
│   │
│   ├── executor/                    # PIPELINE 3: Execute (Go + Python)
│   │   ├── executor.go              # Semaphore, formatGoLiteral, formatPythonLiteral
│   │   ├── templates.go             # Go text/template + pythonTestTemplate
│   │   ├── sandbox.go               # Temp dir setup, file writes
│   │   ├── sandbox_client.go        # HTTP client for remote Railway sandbox
│   │   ├── parser.go                # GOT/WANT regex parsing
│   │   └── types.go                 # ExecutionRequest/Result, TestResult
│   │
│   └── api/                         # HTTP LAYER — chi router
│       ├── router.go                # Route registration, middleware wiring
│       ├── middleware.go            # RequestLogging, Recovery, CORS, SecurityHeaders,
│       │                               Auth, Admin, VerifiedContributor, RateLimit, IPRateLimit
│       ├── middleware_test.go       # RateLimiter, Auth, CORS, Recovery tests
│       ├── responses.go / _test.go  # Standardized JSON response helpers
│       ├── auth.go                  # Register, login, Google, logout, refresh, onboarding
│       ├── me.go                    # GET /me, set username/language, delete account, export
│       ├── change_password.go       # PIN verification and password change
│       ├── pin_reset.go             # PIN-based password recovery
│       ├── password_reset.go        # Email-based password reset (Resend)
│       ├── problems.go              # GET /problems, GET /problems/:slug (language_versions-aware)
│       ├── submissions.go           # POST /submit (rate-limited, scored)
│       ├── test.go                  # POST /test (no-scoring execution)
│       ├── admin.go                 # Ingest, enrich, enrich-all, stats, publish, visibility,
│       │                               AI assist, user search/verify, update
│       ├── leaderboard.go           # GET /leaderboard (cached)
│       ├── profile.go               # GET/PUT /me/profile
│       ├── community.go             # Community solutions, best-practices, likes
│       ├── contributions.go         # Community problem submissions
│       ├── activity.go              # Contribution graph data
│       ├── notifications.go         # Notifications CRUD
│       ├── feedback.go              # Feedback submit, admin list, status update
│       ├── broadcasts.go            # Broadcast CRUD + user dismiss
│       ├── cms.go                   # Curriculum CMS: 26 endpoints (6 student + 20 admin)
│       ├── cache.go                 # In-memory profile/leaderboard/user caches
│       └── ws.go                    # WebSocket upgrade (gorilla/websocket)
│
├── sandbox/                         # Standalone execution sandbox (Railway, zero external deps)
│   ├── main.go                      # HTTP server: /health, /version, /execute (language routing)
│   ├── ratelimit.go                 # Per-IP sliding window (10 req/min)
│   ├── secure.go                    # Pre-exec malicious code validation (Go + Python)
│   ├── secure_unix.go              # setrlimit NPROC/NOFILE/FSIZE, Setpgid
│   ├── secure_other.go              # Noop for non-Unix
│   ├── pyrunner.go                  # Python test runner (AST validation, run_tests.py)
│   ├── runtest_go.go                # Go test runner (go.mod, solution.go, main_test.go)
│   ├── security_message_test.go     # Sandbox security message tests
│   ├── Dockerfile                   # Two-stage ARM64 build (includes python3)
│   └── go.mod                       # Zero external deps
│
├── migrations/                      # 37 ordered, idempotent SQL migrations
│   ├── 001_init.sql                 # Core schema: users, problems, submissions, progress
│   ├── 002_indexes.sql              # Performance indexes
│   ├── 003_activity_logs.sql
│   ├── 005_community_contributions.sql
│   ├── 006_notifications.sql
│   ├── 007_submission_likes.sql
│   ├── 008_user_profile.sql
│   ├── 009_get_full_profile.sql
│   ├── 012_add_google_auth.sql
│   ├── 013_fix_rank_tiebreaker.sql
│   ├── 014_feedback.sql
│   ├── 015_broadcasts.sql
│   ├── 017_optimization_indexes.sql
│   ├── 019_seed_problems{1-4}.sql   # 180 seed problems (Go)
│   ├── 020_token_blacklist.sql
│   ├── 021_password_reset.sql
│   ├── 022_add_pin_hash.sql
│   ├── 027_language_versions.sql    # Multi-language JSONB column
│   ├── 028_backfill_language_versions.sql
│   ├── 031_python_intermediate_seed.sql
│   ├── 032_python_variables_math_seed.sql
│   ├── 034_python_arrays_strings_seed.sql
│   ├── 035_ai_usage_logs.sql
│   ├── 036_refresh_tokens.sql
│   ├── 037_seed_go_fundamentals.sql
│   └── 038_curriculum_cms.sql       # Courses → Modules → Lessons → Sections
│
├── frontend/                        # Next.js 15 App Router
│   ├── app/
│   │   ├── layout.tsx               # Root layout: fonts, metadata, UserContext
│   │   ├── globals.css              # Tailwind CSS 4 + theme variables
│   │   ├── not-found.tsx / error.tsx
│   │   ├── landing/page.tsx         # Marketing landing page
│   │   ├── oauth/callback/page.tsx
│   │   ├── (auth)/                  # Login, register, forgot-password, reset-password, onboarding
│   │   ├── (main)/
│   │   │   ├── layout.tsx           # TopNav + BroadcastBanner + FeedbackButton
│   │   │   ├── home/page.tsx        # Dashboard with module cards + pagination
│   │   │   ├── problems/            # Problem listing + [slug]/ workspace (Monaco)
│   │   │   ├── leaderboard/         # Top 100 with podium + period filter
│   │   │   ├── profile/             # Full profile: tabs, stats, activity heatmap
│   │   │   ├── settings/            # Profile, security, notifications tabs
│   │   │   ├── contribute/          # Community problem contribution form
│   │   │   ├── admin/               # Dashboard, BroadcastPanel, FeedbackPanel,
│   │   │   │                           PendingContributions, ProblemReports,
│   │   │   │                           UserVerificationPanel, curriculum/ CMS
│   │   │   └── learn/               # Curriculum CMS student view
│   │   │       ├── layout.tsx
│   │   │       ├── courses/         # Course catalog → detail → module → lesson viewer
│   │   │       └── .../[courseSlug]/modules/[moduleSlug]/lessons/[lessonSlug]/
│   │   └── (legal)/privacy, terms
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives (avatar, badge, button, card,
│   │   │                               dialog, dropdown-menu, input, input-otp, label,
│   │   │                               progress, select, tabs, textarea, tooltip, etc.)
│   │   ├── auth/                    # Google button, label-input, divider, gradient
│   │   ├── base/avatar.tsx          # Avatar with src/initials fallback + verified badge
│   │   ├── base/input/pin-input.tsx # OTP PIN input
│   │   ├── kibo-ui/                 # Code block (Shiki), contribution graph
│   │   ├── learn/                   # SectionRenderer, SectionQuiz, SectionExercise
│   │   │                               (Monaco), LessonSidebar
│   │   ├── BroadcastBanner.tsx
│   │   ├── FeedbackButton.tsx
│   │   ├── LanguageLogo.tsx         # Go/Python SVG icons
│   │   ├── LanguageSelector.tsx
│   │   ├── TestResultPanel.tsx      # LCS unified diff display
│   │   ├── layout/TopNav.tsx        # Nav: Dashboard, Problems, Learn, Leaderboard, Admin
│   │   └── dashboard/ModuleCards.tsx
│   ├── hooks/                       # use-google-one-tap, use-has-mounted, use-mobile
│   ├── lib/
│   │   ├── api.ts                   # 40+ typed endpoint functions
│   │   ├── types.ts                 # All TypeScript interfaces
│   │   ├── UserContext.tsx           # Auth state provider
│   │   ├── useNotifications.ts      # 15s polling for unread count
│   │   ├── event.ts                 # WebSocket hook with auto-reconnect
│   │   ├── cache.ts                 # sessionStorage cache with 30s TTL
│   │   ├── achievements.ts / utils.ts / toast.tsx / index.ts
│   │   └── monaco-theme.ts          # VS Code Dark+ theme registration
│   ├── middleware.ts                 # CSP security headers
│   └── package.json
│
└── scripts/                         # reset_data.sql, setup-docker-cache.sh
```

---

## 5. Database Schema & Data Model

### Schema

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users: students and admins
CREATE TABLE users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id   TEXT UNIQUE NOT NULL,
    name         TEXT NOT NULL,
    password     TEXT NOT NULL,          -- bcrypt hash, cost=12
    role         TEXT NOT NULL DEFAULT 'student', -- 'student' | 'admin'
    color_index  INT NOT NULL DEFAULT 0,           -- Avatar color slot 0-7
    xp           INT NOT NULL DEFAULT 0,
    pin_hash     TEXT,                    -- bcrypt of 6-digit recovery PIN
    username_set BOOLEAN NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Problems: AI-enriched exercise definitions
CREATE TABLE problems (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         TEXT UNIQUE NOT NULL,   -- URL-safe identifier e.g. "itoa"
    module       TEXT NOT NULL,          -- e.g. "piscine-go/quest01"
    type         TEXT NOT NULL,          -- "function" | "program"
    language     TEXT NOT NULL,          -- "go" | "js" (future)
    title        TEXT NOT NULL,
    statement    TEXT NOT NULL,          -- Cleaned markdown from Gemini
    func_name    TEXT,                   -- "Itoa" — nil if type=program
    return_type  TEXT,                   -- "string" | "int" | "bool" | "[]int" etc.
    param_types  TEXT[],                 -- Ordered: ["int"] for Itoa(n int)
    hints        TEXT[] NOT NULL,        -- Exactly 3 progressive hints
    difficulty   INT NOT NULL,           -- 1 (trivial) to 5 (hard)
    xp_reward    INT NOT NULL,
    tags         TEXT[],
    visible              BOOLEAN DEFAULT FALSE,  -- Admin must approve before students see it
    source_hash          TEXT NOT NULL,          -- SHA256 of raw README.md — change detection
    constraints          TEXT,                   -- Dedicated constraints section (split from statement)
    learning_objective   TEXT,                   -- Learning objective (split from statement)
    raw_readme   TEXT NOT NULL,          -- Original markdown preserved
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Test cases: generated by Gemini, stored as typed JSONB inputs
CREATE TABLE test_cases (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id   UUID REFERENCES problems(id) ON DELETE CASCADE,
    input        JSONB NOT NULL,         -- Ordered arg array: [12345] or ["hello", 2]
    expected     TEXT NOT NULL,          -- String representation of expected output
    is_hidden    BOOLEAN DEFAULT FALSE,  -- Hidden cases not shown to students
    ordinal      INT NOT NULL,           -- Execution order
    UNIQUE(problem_id, ordinal)
);

-- Submissions: each grading attempt
CREATE TABLE submissions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES users(id),
    problem_id   UUID REFERENCES problems(id),
    language     TEXT NOT NULL,
    code         TEXT NOT NULL,
    status       TEXT NOT NULL,          -- 'passed'|'failed'|'compiler_error'|'timeout'
    passed_count INT DEFAULT 0,
    total_count  INT DEFAULT 0,
    output_logs  TEXT,                   -- Raw docker stdout for debugging
    runtime_ms   INT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Progress: per-user per-problem solved state and XP
CREATE TABLE progress (
    user_id      UUID REFERENCES users(id),
    problem_id   UUID REFERENCES problems(id),
    solved       BOOLEAN DEFAULT FALSE,
    stars        INT DEFAULT 0,          -- 0–3 stars based on attempt count
    attempts     INT DEFAULT 0,
    best_runtime INT,
    xp_awarded   INT DEFAULT 0,
    PRIMARY KEY (user_id, problem_id)
);

-- Feedback & bug reports
CREATE TABLE feedback (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    type            TEXT NOT NULL DEFAULT 'general',    -- 'general'|'bug'|'feature'
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    priority        TEXT NOT NULL DEFAULT 'medium',     -- 'low'|'medium'|'high'|'critical'
    screenshot_url  TEXT,                               -- base64 encoded image
    status          TEXT NOT NULL DEFAULT 'new',        -- 'new'|'in_progress'|'resolved'
    admin_notes     TEXT,
    is_anonymous    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_submissions_user    ON submissions(user_id);
CREATE INDEX idx_submissions_problem ON submissions(problem_id);
CREATE INDEX idx_progress_user       ON progress(user_id);
```

### Additional Tables (Post-Phase 5)

| Table | Purpose | Key Columns |
|---|---|---|
| `feedback` | Bug reports & feature requests | type, priority, status, screenshot_url, problem_slug |
| `broadcasts` | System announcements | type, priority, title, message, action_label/url, active |
| `user_broadcast_status` | Per-user dismissal tracking | user_id + broadcast_id PK, dismissed_at |
| `notifications` | User alerts | type, message, related_id, is_read |
| `password_reset_tokens` | Email-based password reset | email, token_hash, expires_at, used |
| `token_blacklist` | JWT revocation | jti, expires_at |
| `refresh_tokens` | Refresh token rotation | user_id, token_hash, expires_at, revoked |
| `ai_usage_logs` | AI enrichment tracking | user_id, action, tokens_in/out, success |
| `courses` | Curriculum: top-level groupings | slug, title, description, difficulty_level, order_number |
| `modules` | Curriculum: course chapters | course_id FK, slug, title, order_number, visible |
| `lessons` | Curriculum: individual lessons | module_id FK, slug, title, xp_reward, problem_references |
| `lesson_sections` | Typed content blocks (11 types) | lesson_id FK, section_type ENUM, content, metadata JSONB |
| `lesson_dependencies` | Prerequisite DAG | lesson_id + depends_on_lesson_id (composite PK) |
| `projects` | Mini projects | lesson_id FK, slug, requirements, starter_code, hints |
| `course_progress` | Per-user course tracking | user_id + course_id PK, progress_pct |
| `lesson_progress` | Per-user lesson completion | user_id + lesson_id PK, completed, xp_awarded |

### Key Data Model Notes

**`test_cases.input` (JSONB)**  
Always an ordered JSON array of arguments matching `problems.param_types`. Examples:
- `Itoa(n int)` → `[12345]`
- `Concat(a, b string)` → `["hello", "world"]`
- `Sum(nums []int)` → `[[1,2,3]]`

Float values in this JSONB must be explicitly bounds-checked when deserializing to avoid scientific notation bleed into generated test code. Use `strconv.FormatInt` for integer arguments, never `fmt.Sprintf("%v")`.

**`problems.return_type` drives test generation logic:**
- Primitive types (`string`, `int`, `bool`, `float64`) → `==` comparison in template
- Slice/array types (`[]int`, `[]string`) → `reflect.DeepEqual` comparison in template

---

## 6. Pipeline Architecture

### Pipeline 1 — Ingest (Admin-Triggered)

```
GitHub Repo URL
      │
      ▼
git clone / git pull  ──────────────────────────────────────────┐
      │                                                          │
      ▼                                                     (no change)
Walk /exercises/** for README.md files                          │
      │                                                          │
      ▼                                                          │
SHA256(raw_readme) ──── matches stored source_hash? ────────────┘
      │ (changed or new)
      ▼
Extract:
  - slug (directory name)
  - module path
  - type ("function" if "Expected function" found in markdown)
  - raw_readme text
      │
      ▼
INSERT INTO problems (slug, raw_readme, source_hash, visible=false)
ON CONFLICT (slug) UPDATE raw_readme, source_hash, updated_at
```

### Pipeline 2 — Enrich (Admin-Triggered, Rate-Limited)

```
SELECT problems WHERE source_hash changed OR statement IS NULL
      │
      ▼
For each problem (NVIDIA NIM, 3-retry exponential backoff):
      │
      ▼
NVIDIA NIM API Call (DeepSeek V4 Flash):
  System: "You are a programming curriculum author..."
          (Dual-language prompt: Go + Python entries in language_versions)
  User: {raw_readme}
  Response: {JSON in markdown fence — stripped and parsed}
      │
      ▼
Parse + validate JSON:
  - Extract first {...} block from response
  - Validate: title, func_name (Go), 3 hints, 5+ test cases
  - Build LanguageVersions from AI output or fallback
      │
      ▼
Auto-generate Python entry if AI omitted it:
  - PascalCase → snake_case via toSnakeCase()
  - Go types → Python types via toPythonType()
      │
      ▼
Upsert enriched problem + test cases in single transaction:
  UPDATE problems SET statement, func_name, return_type, param_types,
                      hints, difficulty, xp_reward, tags, language_versions
  DELETE + INSERT test_cases for this problem_id
```

### Pipeline 3 — Execute (Student-Triggered, Real-Time)

```
POST /submit {problem_slug, code, language}
      │
      ▼
Solved guard + rate limit check (5 req/45s per user)
      │
      ▼
Acquire semaphore (buffered channel cap=6) — blocks if 6 workers active
      │
      ▼
Load problem + test_cases from DB
Resolve language metadata from LanguageVersions
      │
      ├── Go ─────────────────────────────────────────────────────┐
      │ Create /tmp/koder/<uuid>/                                  │
      │ Write solution.go (package piscine) + go.mod               │
      │ Render main_test.go from Go template:                      │
      │   text/template with == for primitives,                    │
      │   reflect.DeepEqual for slices                             │
      │                                                            │
      ├── Python ─────────────────────────────────────────────────┤
      │ Create /tmp/koder/<uuid>/                                  │
      │ Write solution.py                                          │
      │ Render run_tests.py from pythonTestTemplate:               │
      │   JSON tuple literals via formatPythonLiteral()            │
      │   Handles bools, None, nested types correctly             │
      │                                                            │
      ▼                                                            ▼
Is SANDBOX_URL set?
  ├── YES → POST /execute with {code, test_code, timeout_sec, language}
  │         2-retry exponential backoff
  └── NO  → exec.CommandContext with language-specific Docker image:
             golang:1.23-alpine or python:3.12-slim
      │                                         │
      ▼                                         ▼
Parse result:                              Parse SandboxResponse JSON:
  GOT/WANT regex extraction                  status, passed/total, stdout
  PASS/FAIL classification                   Error field for compile errors
      │                                         │
      └─────────────────┬───────────────────────┘
                        ▼
Record submission + update progress in DB
Return ExecutionResult JSON to client
```

---

## 7. Execution Engine Deep Dive

### Semaphore Implementation

```go
// internal/executor/executor.go
type Executor struct {
    semaphore chan struct{}
    // ...
}

func New(maxConcurrency int) *Executor {
    return &Executor{
        semaphore: make(chan struct{}, maxConcurrency), // cap=4 (configurable)
    }
}

func (e *Executor) Execute(ctx context.Context, req ExecutionRequest) (*ExecutionResult, error) {
    e.semaphore <- struct{}{}         // acquire — blocks if cap reached
    defer func() { <-e.semaphore }() // release on return
    // ...
}
```

### Test File Template

The template must handle two comparison modes driven by `return_type`:

```go
// internal/executor/templates.go
const testTemplate = `
package piscine

import (
    "testing"
    {{if .NeedsReflect}}"reflect"{{end}}
)

func TestSolution(t *testing.T) {
    {{range $i, $tc := .TestCases}}
    t.Run("case_{{$i}}", func(t *testing.T) {
        got := {{$.FuncName}}({{$tc.Args}})
        {{if $.IsPrimitive}}
        if got != {{$tc.Expected}} {
            t.Errorf("got %v, want {{$tc.Expected}}", got)
        }
        {{else}}
        want := {{$tc.Expected}}
        if !reflect.DeepEqual(got, want) {
            t.Errorf("got %v, want %v", got, want)
        }
        {{end}}
    })
    {{end}}
}
`
```

### Remote Sandbox Client (`sandbox_client.go`)

When `SANDBOX_URL` is set, `executor.go` routes execution through `sandboxClient`:

```go
type sandboxClient struct {
    httpClient *http.Client  // timeout = timeoutSec + 10s
    baseURL    string        // SANDBOX_URL
}

func (c *sandboxClient) execute(ctx, code, testCode) (*SandboxResponse, error)
```

- Retry policy: up to 2 retries with exponential backoff (500ms, 1s)
- Per-request timeout derived from `EXECUTOR_TIMEOUT_SECONDS` + 10s buffer
- Sends `{code, test_code, timeout_sec}` as JSON, parses `SandboxResponse` JSON
- Non-200 status codes → error returned to caller, retry attempted

### Build Cache Strategy

When using the local Docker path, the host must warm the cache:

```bash
# scripts/setup-docker-cache.sh
mkdir -p /tmp/go-build-cache
docker run --rm \
  -v /tmp/go-build-cache:/root/.cache/go-build \
  golang:1.23-alpine \
  go build std
```

This drops per-submission cold start from ~2000ms to ~150–250ms by caching the Go standard library compilation artifacts. When `SANDBOX_URL` is set, the build cache is handled by the sandbox service—no local warmup needed.

---

## 8. API Reference

All endpoints return `application/json`. All protected endpoints require `Authorization: Bearer <jwt>`.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | None | Create account (name + email + password + 6-digit PIN); JWT + refresh_token |
| POST | `/auth/login` | None | Returns JWT + refresh_token (accepts username/email/student_id) |
| POST | `/auth/google` | None | Google Sign-In with ID token; auto-creates account if new |
| POST | `/auth/complete-onboarding` | Student | Set username + student_id after any auth method |
| POST | `/auth/link-google` | Student | Link Google account to existing authenticated user |
| POST | `/auth/change-password` | Student | Verify PIN + set new password (authenticated) |
| POST | `/auth/verify-pin` | Student | Verify current PIN |
| POST | `/auth/set-pin` | Student | Set initial PIN |
| POST | `/auth/forgot-password` | None | Email-based reset link (Resend API) |
| POST | `/auth/reset-password` | None | Complete email-based reset with token |
| POST | `/auth/forgot-password-pin` | None | PIN-based: email + 6-digit PIN → short-lived JWT (5 min, rate limited) |
| POST | `/auth/reset-password-pin` | None | PIN-based: JWT + new password → update |
| POST | `/auth/refresh` | Student | Rotate refresh token; reuse detection revokes all sessions |
| POST | `/auth/logout` | Student | Revoke JWT + all refresh tokens |
| GET | `/auth/check-username?username=xxx` | None | Username availability check (public) |

### Problems

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/problems?language=` | Student | List visible problems with solved status; optional language filter |
| GET | `/problems/:slug` | Student | Full problem detail + non-hidden test cases + language_versions |
| POST | `/submit` | Student | Submit code for grading (rate limited: 5 req/45s, language validated) |
| POST | `/test` | Student | Test code without scoring (rate limited: 5 req/45s) |

### User / Profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/me` | Student | User profile + XP + username_set (cached 30s) |
| GET | `/me/profile` | Student | Full profile (stats, modules, achievements, difficulty, contributions) |
| PUT | `/me/profile` | Student | Update name and bio |
| PUT | `/me/username` | Student | Set username (one-time, only when `username_set` is false) |
| PUT | `/me/language` | Student | Set primary language preference (go/python) |
| POST | `/me/delete-account` | Student | Transactional cascade delete, revokes refresh tokens |
| GET | `/me/activity?year=2026` | Student | Daily activity entries for contribution graph |
| GET | `/me/contributions` | Student | User's problem contribution submissions |
| GET | `/me/export-data` | Student | Full account data export (JSON attachment) |
| GET | `/profile/:username` | Student | Another user's profile |
| GET | `/profile/:username/stats` | Student | Another user's performance stats |

### Leaderboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/leaderboard?period=all\|weekly\|monthly` | Student | Top 100 users by XP + solved count |

### Community

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/problems/{slug}/community-solutions` | Student | Top community solutions |
| GET | `/best-practices` | Student | Best practice solutions |
| POST | `/submissions/{id}/like` | Student | Like a community solution |
| DELETE | `/submissions/{id}/like` | Student | Unlike a community solution |

### Contributions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/me/user-problems` | Student | Submit a user-created problem |
| GET | `/me/contributions` | Student | User's submitted problems |

### Feedback

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/feedback` | Student | Submit feedback/bug report |
| GET | `/feedback/mine` | Student | Current user's submitted feedback |
| GET | `/admin/feedback` | Admin | List feedback with optional `?status=` filter |
| GET | `/admin/feedback/counts` | Admin | Feedback counts by status |
| PATCH | `/admin/feedback/{id}` | Admin | Update status and admin notes |

### Notifications & WebSocket

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | Student | Unread notifications |
| POST | `/notifications/read-all` | Student | Mark all as read |
| POST | `/notifications/{id}/read` | Student | Mark single as read |
| GET | `/ws` | Student | WebSocket connection for live events |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/admin/ingest` | Admin | Trigger Pipeline 1 against GitHub repo |
| POST | `/admin/enrich` | Admin | Trigger Pipeline 2 for a single problem |
| POST | `/admin/enrich-all` | Admin | Batch enrich all pending problems |
| POST | `/admin/ai/assist` | Admin | AI admin assistant (rate-limited: 15 req/60s) |
| GET | `/admin/stats` | Admin | Dashboard statistics (incl. AI call counts) |
| GET | `/admin/activity` | Admin | Recent activity log |
| GET | `/admin/ai/usage` | Admin | AI usage statistics (per-user, action, success/failure) |
| GET | `/admin/problems` | Admin | All problems including hidden |
| PATCH | `/admin/problems/{id}/visibility` | Admin | Toggle `visible` flag |
| PUT | `/admin/problems/{id}` | Admin | Update a problem's editable fields (includes language_versions) |
| POST | `/admin/problems/publish-all` | Admin | Publish all draft problems (single UPDATE) |
| GET | `/admin/users/search?q=` | Admin | Search users by name/username (min 2 chars) |
| PATCH | `/admin/users/{id}/verified` | Admin | Toggle user verified status |
| GET | `/admin/user-problems/pending` | Admin | List pending user submissions |
| PATCH | `/admin/user-problems/{id}/approve` | Admin | Approve user problem submission |
| PATCH | `/admin/user-problems/{id}/reject` | Admin | Reject user problem submission |
| POST | `/admin/broadcasts` | Admin | Create broadcast (type, title, priority, CTA) |
| GET | `/admin/broadcasts` | Admin | List all broadcasts |
| PATCH | `/admin/broadcasts/{id}/deactivate` | Admin | Deactivate a broadcast |
| PATCH | `/admin/broadcasts/{id}/activate` | Admin | Activate a broadcast |
| DELETE | `/admin/broadcasts/{id}` | Admin | Permanently delete a broadcast |
| GET | `/admin/feedback` | Admin | List feedback with optional `?status=` filter |
| GET | `/admin/feedback/counts` | Admin | Feedback counts by status |
| PATCH | `/admin/feedback/{id}` | Admin | Update status and admin notes |
| GET | `/admin/problem-reports` | Admin | Bug reports grouped by problem slug |
| GET | `/health` | None | Service health (db ping, env info) |
| GET | `/version` | None | Build commit + time + Go version |

### Curriculum — Student Learn

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/learn/courses` | Student | List visible courses ordered by order_number |
| GET | `/learn/courses/{courseSlug}` | Student | Course detail with modules, progress bar, lesson counts |
| GET | `/learn/courses/{courseSlug}/modules/{moduleSlug}` | Student | Module detail with lesson list + completion status |
| GET | `/learn/courses/{courseSlug}/modules/{moduleSlug}/lessons/{lessonSlug}` | Student | Full lesson with sections, deps, projects, progress |
| POST | `/learn/lessons/{lessonId}/complete` | Student | Mark lesson complete → award XP → update course progress |
| GET | `/learn/progress` | Student | Full aggregate progress across all courses |

### Curriculum — Admin CRUD

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/courses` | Admin | List all courses (visible + hidden) |
| POST | `/admin/courses` | Admin | Create course (slug, title, difficulty, estimated_hours) |
| PUT | `/admin/courses/{courseId}` | Admin | Update course (full entity) |
| DELETE | `/admin/courses/{courseId}` | Admin | Delete course (CASCADE to modules + lessons) |
| PATCH | `/admin/courses/{courseId}/visibility` | Admin | Toggle course visible flag |
| GET | `/admin/courses/{courseId}/modules` | Admin | List modules for a course |
| POST | `/admin/courses/{courseId}/modules` | Admin | Create module |
| PUT | `/admin/modules/{moduleId}` | Admin | Update module |
| DELETE | `/admin/modules/{moduleId}` | Admin | Delete module (CASCADE to lessons) |
| PATCH | `/admin/modules/{moduleId}/visibility` | Admin | Toggle module visible flag |
| GET | `/admin/modules/{moduleId}/lessons` | Admin | List lessons for a module |
| POST | `/admin/modules/{moduleId}/lessons` | Admin | Create lesson with sections + dependencies (transactional) |
| PUT | `/admin/lessons/{lessonId}` | Admin | Update lesson |
| DELETE | `/admin/lessons/{lessonId}` | Admin | Delete lesson (CASCADE to sections) |
| PATCH | `/admin/lessons/{lessonId}/visibility` | Admin | Toggle lesson visible flag |
| GET | `/admin/lessons/{lessonId}/projects` | Admin | List projects for a lesson |
| POST | `/admin/lessons/{lessonId}/projects` | Admin | Create project (slug, title, requirements, starter_code, hints) |
| PUT | `/admin/projects/{projectId}` | Admin | Update project |
| DELETE | `/admin/projects/{projectId}` | Admin | Delete project |
| PATCH | `/admin/projects/{projectId}/visibility` | Admin | Toggle project visible flag |
| GET | `/admin/lessons/{lessonId}/sections` | Admin | List sections for a lesson |
| POST | `/admin/lessons/{lessonId}/sections` | Admin | Create section (type: overview, quiz, exercise, etc.) |
| PUT | `/admin/sections/{sectionId}` | Admin | Update section |
| DELETE | `/admin/sections/{sectionId}` | Admin | Delete section |

### Response Envelope

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "SUBMISSION_TIMEOUT",
    "message": "Execution exceeded 5 second limit"
  }
}
```

---

## 9. Frontend Architecture

### Stack

- **Next.js 15** (App Router, Server Components where appropriate, React 19)
- **Tailwind CSS 4** with CSS variables
- **shadcn/ui** (component library — Avatar, Badge, Button, Card, Dialog, DropdownMenu, Tabs, etc.)
- **recharts** (radial bar charts for activity gauges)
- **Monaco Editor** (VS Code engine, Go + Python language support, VS Code Dark+ theme)
- **Vercel Hobby Tier** (static/SSR hybrid deployment)

### State Management

- `UserContext` — wraps `fetchUser()` with event listener for reactive auth state
- No Redux. Server Components for read-heavy pages, `useState` + `fetch` for interactive flows
- JWT in `localStorage`, refresh_token in `localStorage`, `Authorization: Bearer` header
- Refresh token rotation with singleton retry queue (prevents concurrent refresh storms)

### Key Pages

**`/home` — Dashboard**  
Problem grid with module cards, difficulty/XP tags, solved/unsolved state. Language filter tabs (All/Go/Python). Solved problems hidden by default.

**`/problems` — Problem Listing**  
Side panel filters: solved status, difficulty (1-5), XP range. Strict language tabs. Active filter count + reset.

**`/problems/[slug]` — Workspace**  
Monaco Editor (Go or Python depending on language_versions). Language toggle with save-and-switch per language. Submit/test buttons. LCS unified diff results. Confetti on success. Report bug dialog.

**`/learn/courses/...` — Curriculum CMS Student View**  
Course catalog → course detail with module timeline → module overview → lesson viewer (sidebar + Monaco exercises + quiz sections + progress tracking).

**`/profile` — User Profile**  
XP progress bar, rank, solved/streak/best-runtime stats, difficulty breakdown, module proficiency gauges, achievements, contribution heatmap, community contributions.

**`/leaderboard` — Rankings**  
Top 3 podium with gold/silver/bronze. Top 100 table. Weekly/Monthly/All Time filter. Search by name/ID. Custom Avatar component with verified gold checkmark.

**`/settings` — Account Settings**  
Profile tab (name, bio), security tab (PIN, password), notification tab. Preview card with custom Avatar.

**`/admin` — Admin Dashboard**  
Stats grid, ingest/enrich triggers, problem search + visibility toggle, broadcast CRUD, feedback management, user verification, AI usage stats, inline problem editor.

**`/admin/curriculum` — Curriculum CMS**  
Full-page course/module/lesson tree with inline editors. Section builder (11 types with metadata). Course progress tracking.

### Key Components

#### TestResultPanel
- LCS-based unified diff for multi-line got/want values with git-style markers
- Side-by-side grid for single-line values
- Compiler error, timeout states with Python-specific debugging tips
- Circular progress indicator per test suite

#### SectionRenderer + SectionExercise
- `SectionRenderer` routes all 11 lesson section types (quiz, exercises, assessment, mini_project, etc.)
- `SectionExercise` uses Monaco Editor (SSR-safe with textarea fallback), calls `POST /test`
- Dynamic language prop (defaults to python) with language badge header

#### LanguageSelector + LanguageLogo
- Language toggle for Go/Python with persistent per-language scaffold
- SVG icons for Go gopher and Python logo

---

## 10. Current Phase: Production Polish & Curriculum CMS

**Status:** All 6 foundational phases (Foundation, Auth/Problem Store, Ingest/Enrich, Execution Engine, Frontend, Hardening) completed. Current focus is on multi-language support, curriculum CMS, and production polish.

### Key Milestones Completed

| Milestone | Details |
|-----------|---------|
| Multi-language pipeline | Go + Python dual-language enrichment, execution, and editor support |
| Python sandbox | AST validation, snake_case fallback, meaningful error messages |
| Refresh token rotation | Reuse detection revokes all sessions on compromise |
| NVIDIA NIM migration | Replaced Gemini/Groq with DeepSeek V4 Flash via NVIDIA NIM |
| Curriculum CMS | Full CRUD for courses/modules/lessons/sections/projects with admin panel |
| Student learn pages | Course catalog, lesson viewer with quizzes/code exercises, progress tracking |
| XP propagation | Lesson completion awards XP to users.xp and updates course_progress |
| Visibility toggles | PATCH endpoints + frontend buttons for courses, modules, lessons, projects |
| AI usage logging | Per-user/action tracking with success/failure rates |
| Curriculum CMS | 8 tables, 25 Store methods, 26 API endpoints, full admin UI + student lesson viewer |
| CI/CD pipeline | GitHub Actions: backend vet/test/build, frontend lint/tsc/build, deploy hooks |
| Test suite | 124 tests across 8 internal packages, `go vet` clean |
| Security hardening | CSP headers, account data export, user search/verify, admin AI rate limiting |

---

## 11. Environment Variables & Configuration

All configuration is injected via environment variables. The server fails fast on missing required vars.

```bash
# Database
DATABASE_URL=postgres://user:password@host:5432/postgres?sslmode=require

# Auth
JWT_SECRET=<min-32-char-random-string>
GOOGLE_CLIENT_ID=             # Google Cloud Console → OAuth 2.0 Client ID

# Token expiry
ACCESS_TOKEN_EXPIRY_MINUTES=15
REFRESH_TOKEN_EXPIRY_DAYS=7

# NVIDIA NIM (required for enrichment)
NVIDIA_API_KEY=<nvidia-nim-api-key>
NVIDIA_MODEL=deepseek-ai/deepseek-v4-flash

# Execution
EXECUTOR_MAX_CONCURRENCY=6
EXECUTOR_TIMEOUT_SECONDS=30
DOCKER_IMAGE=golang:1.23-alpine
PYTHON_DOCKER_IMAGE=python:3.12-slim
SANDBOX_BASE_DIR=/tmp/koder-sandbox
BUILD_CACHE_DIR=/tmp/koder-cache
GO_VERSION=1.23
PYTHON_VERSION=3.12

# Server
PORT=8080
ENVIRONMENT=development  # "development" | "production"

# CORS — comma-separated origins
# Uses ALLOWED_ORIGINS (preferred) or ALLOWED_ORIGIN (legacy)
# Production: https://koder.sbs,https://www.koder.sbs,https://staging.koder.sbs,https://update.koder.sbs
# Development: http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000

# Sandbox (optional — empty = use local Docker)
# Railway-deployed sandbox endpoint for production
SANDBOX_URL=https://koder-sandbox.up.railway.app
PYTHON_SANDBOX_URL=                 # Separate URL for Python sandbox (optional)

# Admin account (created on first startup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<secure-password>

# Feedback emails (optional)
RESEND_API_KEY=               # Resend.com API key for transactional emails
EMAIL_FROM=Koder <noreply@koder.sbs>  # Verified sender in Resend

# Frontend env (in frontend/.env.local)
# Production (main):     https://api.koder.sbs
# Production (staging):  https://stagingapi.koder.sbs
# Development:           http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=  # Same value as GOOGLE_CLIENT_ID
```

---

## 12. Production & Preview Deployments

### Domains by Branch
| Branch | Frontend | Backend API | Sandbox/Railway |
|---|---|---|---|
| **main** | `https://koder.sbs` | `https://api.koder.sbs` | — |
| **staging** | `https://staging.koder.sbs` | `https://stagingapi.koder.sbs` | `https://koder-py.onrender.com` |
| **update** | `https://update.koder.sbs` | *share staging backend* | *share staging sandbox* |

### Required Backend Environment (Production)
```bash
ENVIRONMENT=production
FRONTEND_URL=https://koder.sbs                # must match the deploying branch's frontend
ALLOWED_ORIGINS=https://koder.sbs,https://www.koder.sbs,https://staging.koder.sbs,https://update.koder.sbs,http://localhost:3000
```

### Required Frontend Environment (per branch)
| Branch | `NEXT_PUBLIC_API_URL` |
|---|---|
| main | `https://api.koder.sbs` |
| staging | `https://stagingapi.koder.sbs` |
| update | `https://stagingapi.koder.sbs` |

### Google Cloud Console
Add all frontend origins to Authorized JavaScript origins:
- `https://koder.sbs`
- `https://www.koder.sbs`
- `https://staging.koder.sbs`
- `https://update.koder.sbs`
- `http://localhost:3000` (development)

---

## 13. Coding Standards & Conventions

### Go

- **Error handling:** Never discard errors. Always `return fmt.Errorf("context: %w", err)` to preserve the error chain.
- **Context propagation:** Every function that does I/O must accept a `context.Context` as its first parameter.
- **No global state:** Dependencies are injected via struct constructors. No `init()` functions that perform I/O.
- **SQL:** All queries use parameterized inputs (`$1`, `$2`). No string interpolation in SQL ever.
- **JSONB unmarshaling:** When deserializing `test_cases.input`, validate each element's type against `param_types` before use. Integer values: `strconv.FormatInt(int64(v), 10)`. Never rely on `%v` formatting for generated code.
- **File cleanup:** Every `os.MkdirAll` must have a paired `defer os.RemoveAll` within the same execution scope.

### TypeScript / Next.js

- **Typed API client:** Every endpoint in `lib/api.ts` has an explicit return type — no `any`.
- **Server vs Client:** Default to Server Components. Add `"use client"` only when interactivity requires it (Monaco, submission form).
- **Error boundaries:** Wrap the Monaco editor and submission panel in error boundaries. A broken editor must not crash the whole page.
- **No `console.log` in production:** Use environment-gated logging.

---

## 13. Testing Strategy

### Go — Unit Tests

- `internal/store/*`: Use `pgxmock` to test all DB interactions without a live database.
- `internal/executor/templates.go`: Generate test files for known problems and assert the rendered output string exactly.
- `internal/enricher/`: Mock the Gemini HTTP client. Test schema validation logic against malformed responses.
- `internal/auth/`: JWT round-trip tests. Bcrypt test with known hash.

### Go — Integration Tests

- `internal/executor/executor.go`: Run actual Docker containers against a trivial Go function. Requires Docker on CI runner. Tagged with `//go:build integration`.
- Full pipeline smoke test: ingest a local fixture directory (no GitHub call), enrich with a mocked Gemini response, execute a submission.

### Frontend — Tests

- `components/TestResultPanel.tsx`: Unit test rendering with passed/failed/mixed result fixtures.
- Submission flow: Mock `fetch` and assert loading state → result state transition.

### CI

GitHub Actions workflow:
1. `go vet ./...`
2. `go test ./... -race` (unit tests only, no `integration` tag)
3. `next build` — fail on TypeScript errors

---

## 14. Security Model

| Threat | Mitigation |
|--------|-----------|
| Code injection via student submission | `--network=none` container (Docker path) or pre-exec pattern validation (sandbox path); no filesystem access outside temp dir; memory cap 64MB |
| Malicious code (sandbox path) | Pre-exec check blocks `os/exec`, `syscall`, `unsafe`, `net`, filesystem writes, reflection abuse; `setrlimit` NPROC=6/NOFILE=1024/FSIZE=64MB; `Setpgid` process group kill on timeout |
| Container escape | Docker daemon not exposed; no privileged mode; no volume mounts to sensitive paths |
| Unauthorized admin access | Role checked in JWT claims on every `/admin/*` route |
| SQL injection | All queries use `pgx` parameterized inputs — never string interpolation |
| JWT tampering | HS256 with `JWT_SECRET` min 32 bytes; server-side expiry check on every request |
| Student data cross-access | Supabase RLS policies enforce `user_id = auth.uid()` on submissions and progress |
| Resource exhaustion | Semaphore cap=2; Docker memory and CPU limits; submission size cap 50KB |
| Build cache poisoning | Build cache is read/write but contains only compiled artifacts, no source code |

---

## 15. Performance Constraints & Mitigations

| Bottleneck | Target | Mitigation |
|---|---|---|---|---|
| Docker cold start | <250ms | `/tmp/go-build-cache` mounted volume pre-warmed with `go build std`; sandbox path avoids Docker entirely with persistent Railway container |
| Sandbox execution latency | <1s | Railway ARM64 container with pre-cached Go stdlib; HTTP request overhead ~100ms |
| Gemini API rate limit | 2 req/min | Sequential enrichment with 30s sleep between calls; idempotent re-runs |
| Supabase 500MB cap | Never exceed | No binary storage; raw_readme + statement are the largest text fields |
| Oracle VM RAM | Never OOM | Semaphore cap=6; `--memory=256m` per container; Go server typically <50MB RSS |
| Vercel cold start | <200ms | Minimize `"use client"` components; no heavy server-side data fetching on initial load |
| DB query latency (profile page) | <100ms | Collapsed 7 queries into single `get_full_profile()` PL/pgSQL function + in-memory lru cache (30s TTL) |
| Rate limiting (submissions) | 5 per 45s per user | Per-user sliding window rate limiter; admins exempt |

---

## 16. Copilot Context & AI Pairing Guide

This section exists specifically so GitHub Copilot and AI assistants have structured context to generate correct code without hallucinating.

### When Writing Store Layer Code

- Always import `"github.com/jackc/pgx/v5"` — not `database/sql`, not `gorm`
- Pool type is `*pgxpool.Pool` from `"github.com/jackc/pgx/v5/pgxpool"`
- Row scanning: `rows.Scan(&field1, &field2)` — no reflection-based scanning
- UUID fields map to `pgtype.UUID` or can be scanned directly as `[16]byte` — use `pgtype.UUID` for safety
- JSONB fields: scan as `[]byte`, then `json.Unmarshal`

### When Writing Executor Code

- The semaphore is `chan struct{}`, capacity 6 (configurable via `EXECUTOR_MAX_CONCURRENCY`). Acquire = send, release = receive via defer.
- Execution branches on `cfg.SandboxURL`:
  - If set: POST `solution.go` + `main_test.go` to `SandboxURL/execute` via `sandboxClient` (2-retry exponential backoff)
  - If empty: `exec.CommandContext` with `docker run --network=none --memory=64m golang:1.23-alpine`
- All `exec.CommandContext` calls must use a context from `context.WithTimeout(ctx, 30*time.Second)`
- The working directory is always `/tmp/koder/<uuid>` where `<uuid>` comes from `uuid.NewString()`
- Three files are always written: `solution.go`, `main_test.go`, `go.mod` — never more, never less
- Parse stdout with `bufio.Scanner`, match lines with `strings.HasPrefix(line, "--- PASS:")` and `strings.HasPrefix(line, "--- FAIL:")`
- When `SandboxURL` is set, the sandbox handles compilation, so the backend uses the sandbox's `SandboxResponse.Status` directly instead of parsing stdout

### When Writing Enricher Code

- The enricher uses NVIDIA NIM (DeepSeek V4 Flash) via HTTP POST to `https://ai.api.nvidia.com/v1/chat/completions`
- Do NOT use `response_format: {"type": "json_object"}` — DeepSeek via NVIDIA NIM returns schema instead of data
- System prompt alone enforces JSON output; strip markdown fences and extract first `{...}` block after response
- Retry on 429 and 503 with exponential backoff: 2s, 4s, 8s
- The `language_versions` JSONB column stores per-language metadata: `{"go": {"func_name":..., "param_types":...}, "python": {...}}`
- Use `FlexibleStrings` unmarshaler for `param_types` (accepts both `"int"` and `["int"]`)
- Fallback: auto-generate Python entry via `toSnakeCase()` (PascalCase→snake_case) and `toPythonType()` (Go→Python types)

### When Writing API Handlers

- Use `chi.URLParam(r, "slug")` for path parameters
- Response helper: always use the standardized envelope `{"success": bool, "data": any, "error": any}`
- Never write directly to `http.ResponseWriter` without setting `Content-Type: application/json` first
- Admin middleware must check `claims.Role == "admin"` — not just valid JWT

### What Copilot Must Never Do

- **Never** use `encoding/json` with `fmt.Sprintf` to build SQL queries
- **Never** add `go-redis`, `amqp`, or any queue/cache dependency
- **Never** create goroutines outside the executor semaphore pattern
- **Never** parse Gemini responses as raw strings — always use `ResponseSchema`
- **Never** store secrets in source code — all config via environment variables
- **Never** skip `defer os.RemoveAll` in any function that calls `os.MkdirAll` for a submission directory

---

## Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/jerryjuche/koder.git
cd koder

# 2. Copy and fill environment variables
cp .env.example .env
cp frontend/.env.example frontend/.env.local
# Edit .env with Supabase URL, NVIDIA API key, JWT secret, Google client ID

# 3. Apply database migrations (in order, via Supabase dashboard SQL editor)
# Or: for f in migrations/*.sql; do psql $DATABASE_URL -f "$f"; done

# 4. Run the Go server
go run ./cmd/server                       # Starts on :8080

# 5. Run the frontend (separate terminal)
cd frontend
npm install
npm run dev                                # Starts on :3000
```

Server starts on `http://localhost:8080`. Frontend on `http://localhost:3000`.

**Production URLs:** Frontend at `https://koder.sbs` (main), `https://staging.koder.sbs` (staging), `https://update.koder.sbs` (update). API at `https://api.koder.sbs` (main), `https://stagingapi.koder.sbs` (staging/preview).

**Note:** The frontend copies Monaco workers on first build via `node scripts/copy-monaco.mjs` (runs automatically in `postinstall` or `build`). See `frontend/README.md` for frontend-specific setup.

---

## License

MIT

---

*This document is the single source of truth for Koder. Any deviation from the architecture, conventions, or constraints described here requires an explicit ADR entry explaining the reasoning.*


