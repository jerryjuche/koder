# Koder

> A zero-cost, production-grade automated code-grading platform for Go programming curricula.  
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

**Koder** is a self-hosted, automated programming assignment grader. It ingests a GitHub-based Go curriculum, processes raw exercise definitions through a generative AI enrichment pipeline, and evaluates student function submissions inside ephemeral, isolated Docker containers — all at **$0/month** operating cost.

### Primary Constraints (Non-Negotiable)

| Constraint | Implication |
|---|---|---|
| $0/month operating budget | Every infrastructure choice must target a free tier |
| ARM64 host (Oracle Ampere A1) | All Docker images and binaries must be ARM64-compatible |
| 500MB Supabase storage | No bloated JSONB, no redundant columns |
| 50 Gemini API calls/day | Ingest + Enrich must be idempotent with SHA256 change detection |
| 2 req/min Gemini rate | Sequential enrichment with enforced sleep between calls |
| 4 concurrent executions max | Buffered-channel semaphore (configurable via EXECUTOR_MAX_CONCURRENCY) |
| 5 submissions per 45s per user | Per-user sliding window rate limiter; admins exempt |

### What This System Is Not

- It is **not** a general-purpose LeetCode clone. It grades Go functions against a known, AI-enriched spec.
- It is **not** async. The execution pipeline is synchronous and blocking by design. Adding Redis, queues, or goroutine pools would violate the simplicity and resource constraints.
- It is **not** multi-language at launch. Language field exists for future extension; only `go` is implemented in Phase 1–4.

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

### ADR-004: Structured Outputs over Prompt Parsing
**Decision:** Use Gemini SDK's `ResponseSchema` configuration, never parse fenced markdown from raw text responses.  
**Rationale:** Markdown-wrapped JSON parsing is brittle, breaks on model version updates, and introduces error surfaces on every field. Structured outputs give compile-time-equivalent guarantees on the shape of AI responses.

### ADR-005: Go `text/template` for Test File Generation
**Decision:** Generate `main_test.go` at runtime from a compiled Go template, not string concatenation.  
**Rationale:** Test generation requires type-safe conditional logic (primitive `==` vs `reflect.DeepEqual` for slices). String concatenation produces unmaintainable, injection-prone code generation. Templates are auditable and testable independently.

---

## 3. Infrastructure Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        Student Browser                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────────────┐
│               Vercel Hobby Tier (Frontend)                      │
│         Next.js 14 App Router + Tailwind + Monaco               │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS REST API
┌─────────────────────────▼───────────────────────────────────────┐
│        Oracle Cloud Free Tier — Ampere A1 (ARM64)               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Go Monolith (Port 8080)                       │   │
│  │  ┌────────────┐  ┌───────────────┐  ┌────────────────┐  │   │
│  │  │  Pipeline  │  │   Pipeline    │  │   Pipeline     │  │   │
│  │  │  1: Ingest │  │  2: Enrich    │  │  3: Execute    │  │   │
│  │  └────────────┘  └───────┬───────┘  └───────┬────────┘  │   │
│  └──────────────────────────┼───────────────────┼──────────┘   │
│                             │ Gemini API         │ docker run   │
│  ┌──────────────────────────┼───────────────────▼──────────┐   │
│  │                          │      Docker Daemon           │   │
│  │                          │   golang:1.22-alpine         │   │
│  │                          │   /tmp/koder/<uuid>/     │   │
│  └──────────────────────────┼──────────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼──────────────────────────────────┐
│              Supabase Free Tier (Postgres)                      │
│         users / problems / test_cases / submissions / progress  │
└─────────────────────────────────────────────────────────────────┘
                               │ REST
┌──────────────────────────────▼──────────────────────────────────┐
│            Google AI Studio Free Tier                           │
│              gemini-2.5-pro (Structured Outputs)               │
│         50 req/day · 2 req/min · 32k TPM                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Repository Structure

```
koder/
├── README.md                        # This file
├── SESSION_LOG.md                   # Session logbook (AI pairing context)
├── CLAUDE.md                        # Project index for AI assistants
├── .env.example                     # All required environment variables documented
├── .gitignore
├── go.mod                           # module github.com/jerryjuche/koder
├── go.sum
│
├── cmd/server/
│   └── main.go                      # Entry point: wires deps, starts HTTP server
│
├── internal/
│   ├── config/
│   │   └── config.go                # Loads and validates all env vars at startup
│   │
│   ├── store/                       # DATABASE LAYER — pure pgx/v5, no ORM
│   │   ├── store.go                 # Store interface + postgres implementation
│   │   ├── users.go                 # User CRUD, bcrypt auth, Gitea linking
│   │   ├── problems.go              # Problem queries + visibility management
│   │   ├── testcases.go             # Test case queries with JSONB handling
│   │   ├── submissions.go           # Submission insert + history queries
│   │   ├── progress.go              # Upsert progress, XP logic
│   │   ├── admin.go                 # Admin-level DB operations
│   │   └── types.go                 # FullProfile, ActivityEntry, LeaderboardUser, shared types
│   │
│   ├── parser/                      # PIPELINE 1: Ingest
│   │   ├── parser.go                # Git clone/pull, directory walk
│   │   ├── extractor.go             # Markdown parsing, SHA256 hashing
│   │   └── types.go                 # RawExercise struct
│   │
│   ├── enricher/                    # PIPELINE 2: Enrich
│   │   ├── enricher.go              # Gemini API calls, structured output schema
│   │   ├── schema.go                # ResponseSchema definitions for SDK
│   │   ├── ratelimiter.go           # 2 req/min enforcer (time.Ticker)
│   │   └── types.go                 # EnrichedProblem struct
│   │
│   ├── executor/                    # PIPELINE 3: Execute
│   │   ├── executor.go              # Semaphore, docker invocation, output parsing
│   │   ├── templates.go             # Go text/template for main_test.go generation
│   │   ├── sandbox.go               # File orchestration, cleanup
│   │   └── types.go                 # ExecutionResult struct
│   │
│   ├── api/                         # HTTP LAYER
│   │   ├── router.go                # Route registration (chi)
│   │   ├── middleware.go            # Auth JWT, rate limiting, CORS
│   │   ├── auth.go                  # Login, register, Gitea PAT linking handlers
│   │   ├── problems.go              # GET /problems, GET /problems/:slug
│   │   ├── admin.go                 # POST /admin/ingest, POST /admin/enrich
│   │   ├── leaderboard.go           # GET /leaderboard
│   │   ├── profile.go               # GET /me/profile (single get_full_profile() call)
│   │   ├── me.go                    # GET /me, GET /me/activity (cached)
│   │   └── responses.go             # Standardized JSON response helpers
│   │
│   └── auth/
│       ├── jwt.go                   # JWT sign/verify (HS256)
│       ├── password.go              # bcrypt wrap
│       └── oauth.go                 # Gitea API fetch, EncryptToken/DecryptToken (AES-256-GCM)
│
├── migrations/
│   ├── 001_init.sql                 # Full schema from spec
│   ├── 002_indexes.sql              # All performance indexes
│   ├── 009_get_full_profile.sql     # Collapsed 7 queries into get_full_profile()
│   ├── 010_add_gitea_auth.sql       # Gitea OAuth identity fields
│   └── 011_add_gitea_token.sql      # Gitea PAT encrypted token storage
│
├── frontend/                        # Next.js App Router project
│   ├── app/
│   │   ├── layout.tsx
│   │   │   ├── oauth/                # OAuth callback (token capture + replaceState scrub)
│   │   ├── (auth)/                  # Login/register pages
│   │   ├── (main)/
│   │   │   ├── page.tsx             # Dashboard / problem grid
│   │   │   ├── leaderboard/        # Leaderboard with podium + table
│   │   │   │   ├── page.tsx         # Server wrapper
│   │   │   │   ├── LeaderboardClient.tsx  # Full leaderboard UI
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   ├── profile/            # Profile page with tabs
│   │   │   │   ├── page.tsx         # Server wrapper
│   │   │   │   ├── ProfileClient.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── ProfileHeader.tsx
│   │   │   │   │   ├── StatsOverview.tsx
│   │   │   │   │   ├── ProgressMetrics.tsx
│   │   │   │   │   ├── Achievements.tsx
│   │   │   │   │   ├── MyContributions.tsx
│   │   │   │   │   ├── ActivityFeed.tsx
│   │   │   │   │   └── ContributionGraphSection.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   └── admin/              # Admin panel
│   │   ├── problems/[slug]/         # Monaco Editor workspace
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives
│   │   │   ├── activity-gauge.tsx   # Radial bar chart gauge (recharts)
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── tooltip.tsx
│   │   ├── Editor.tsx               # Monaco Editor wrapper
│   │   ├── TestResultPanel.tsx
│   │   ├── HintAccordion.tsx
│   │   ├── ProblemCard.tsx
│   │   └── kibo-ui/
│   │       └── contribution-graph.tsx # GitHub-style activity graph
│   ├── hooks/
│   │   └── ...                      # Custom React hooks
│   ├── lib/
│   │   ├── api.ts                   # Typed fetch wrappers for backend
│   │   ├── types.ts                 # Shared TypeScript types
│   │   ├── utils.ts                 # cn(), getUserColor(), etc.
│   │   └── UserContext.tsx          # Auth/user context provider
│   ├── next.config.ts
│   └── package.json
│
├── scripts/
│   ├── seed.sql                     # Dev seed data
│   └── setup-docker-cache.sh        # Pre-warms /tmp/go-build-cache on host
│
└── docs/
    ├── adr/                         # Architecture Decision Records
    └── diagrams/                    # System diagrams (Mermaid source)
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
    visible      BOOLEAN DEFAULT FALSE,  -- Admin must approve before students see it
    source_hash  TEXT NOT NULL,          -- SHA256 of raw README.md — change detection
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

-- Performance indexes
CREATE INDEX idx_submissions_user    ON submissions(user_id);
CREATE INDEX idx_submissions_problem ON submissions(problem_id);
CREATE INDEX idx_progress_user       ON progress(user_id);
```

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
For each problem (rate-limited: 1 call per 30s):
      │
      ▼
Gemini API Call:
  System: "You are a Go programming tutor..."
  User: {raw_readme}
  ResponseSchema: EnrichedProblem {
    title: string
    statement: string       -- Rephrased clean markdown
    func_name: string
    return_type: string
    param_types: []string
    test_cases: []TestCaseInput {
      input: []any           -- Ordered args
      expected: string
      is_hidden: bool
    }
    hints: [3]string         -- Progressive difficulty
    difficulty: int (1-5)
    xp_reward: int
    tags: []string
  }
      │
      ▼
Validate response (non-empty func_name if type=function, len(hints)==3)
      │
      ▼
UPDATE problems SET statement, func_name, return_type, param_types,
                    hints, difficulty, xp_reward, tags, updated_at
DELETE + INSERT test_cases for this problem_id
```

**Critical Gemini prompt rules:**
- Explicitly instruct the model to replace all `z01.PrintRune` calls with `fmt.Printf("%c", r)`
- Explicitly instruct the model to use only standard library imports in test inputs
- Instruct the model that `expected` values are always stringified Go literals (e.g., `"42"` not `42`)

### Pipeline 3 — Execute (Student-Triggered, Real-Time)

```
POST /submit {problem_slug, code, language}
      │
      ▼
Acquire semaphore (buffered channel cap=2) — blocks if 2 workers active
      │
      ▼
Load problem + test_cases from DB
      │
      ▼
Create /tmp/koder/<uuid>/
Write solution.go:
  package piscine
  <student code>
      │
Write go.mod:
  module sandbox
  go 1.22
      │
Render main_test.go from template:
  - Loops over test_cases
  - Uses == for primitives, reflect.DeepEqual for slices
  - Each test is a named subtest: t.Run("case_1", ...)
      │
      ▼
context.WithTimeout(5 * time.Second)
exec.CommandContext(ctx, "docker", "run",
  "--rm", "--network=none", "--memory=64m", "--cpus=0.5",
  "-v", "/tmp/koder/<uuid>:/app",
  "-v", "/tmp/go-build-cache:/root/.cache/go-build",
  "-w", "/app",
  "golang:1.22-alpine", "go", "test", "./...", "-v")
      │
      ▼
Parse stdout line by line:
  "--- PASS: TestCase_N" → passed[N] = true
  "--- FAIL: TestCase_N" → failed[N] = true
  Exit code != 0 + no PASS/FAIL lines → compiler_error
  Context deadline exceeded → timeout
      │
      ▼
INSERT submissions row
UPSERT progress row (solved, stars, attempts, best_runtime, xp_awarded)
UPDATE users.xp (if first solve)
      │
      ▼
os.RemoveAll(/tmp/koder/<uuid>)
Release semaphore
      │
      ▼
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

### Build Cache Strategy

Before first run, the host must warm the cache:

```bash
# scripts/setup-docker-cache.sh
mkdir -p /tmp/go-build-cache
docker run --rm \
  -v /tmp/go-build-cache:/root/.cache/go-build \
  golang:1.22-alpine \
  go build std
```

This drops per-submission cold start from ~2000ms to ~150–250ms by caching the Go standard library compilation artifacts.

---

## 8. API Reference

All endpoints return `application/json`. All protected endpoints require `Authorization: Bearer <jwt>`.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | None | Create student account |
| POST | `/auth/login` | None | Returns JWT |
| GET | `/auth/gitea/login` | None | OAuth2 redirect to Gitea (dormant — requires admin setup) |
| GET | `/auth/gitea/callback` | None | OAuth2 callback handler (dormant) |
| POST | `/auth/gitea/link` | Student | Link Gitea account via PAT (AES-256-GCM encrypted) |
| DELETE | `/auth/gitea/link` | Student | Unlink Gitea account |
| GET | `/auth/gitea/status` | Student | Get Gitea linking status |
| POST | `/auth/gitea/sync` | Student | Re-fetch Gitea profile from stored PAT |

### Problems

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/problems` | Student | List visible problems with progress overlay |
| GET | `/problems/:slug` | Student | Full problem detail + non-hidden test cases |
| POST | `/problems/:slug/submit` | Student | Submit code for grading |

### User / Profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/me` | Student | User profile + XP (cached 30s) |
| GET | `/me/profile` | Student | Full profile (stats, modules, difficulty, contributions — single `get_full_profile()` call, cached 30s) |
| GET | `/me/activity` | Student | Daily activity entries for contribution graph |
| GET | `/profile/:username` | Student | Another user's profile |
| GET | `/profile/:username/stats` | Student | Another user's performance stats |

### Leaderboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/leaderboard` | Student | Top N users by XP |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/admin/ingest` | Admin | Trigger Pipeline 1 against GitHub repo |
| POST | `/admin/enrich` | Admin | Trigger Pipeline 2 for pending problems |
| POST | `/admin/execute` | Admin | Manually trigger execution for testing |
| PATCH | `/admin/problems/:id/visibility` | Admin | Toggle `visible` flag |
| GET | `/admin/problems` | Admin | All problems including hidden |

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

- **Next.js 14** (App Router, Server Components where appropriate)
- **Tailwind CSS** with CSS variables (brand primary `#D4AF37` mapped to `fill-primary`, `stroke-primary`, etc.)
- **shadcn/ui** (component library — Card, Badge, Button, Avatar, Dialog, Tabs, Tooltip, DropdownMenu, Input, Progress)
- **recharts** (radial bar charts for activity gauges)
- **Monaco Editor** (VS Code editor engine, Go language support)
- **Vercel Hobby Tier** (static/SSR hybrid deployment)

### State Management

- `UserContext` (`lib/UserContext.tsx`) — wraps `fetchUser()` with `user-updated` event listener for reactive auth state
- No Redux. React Server Components for read-heavy pages, `useState` + `fetch` for interactive flows
- JWT stored in `localStorage`, sent via `Authorization: Bearer` header

### Key Pages

**`/` — Dashboard**  
Problem grid filtered by module. Shows per-card: difficulty, XP reward, solved/unsolved state. Filterable by tag and module.

**`/problems/[slug]` — Problem Workspace**  
Split-pane: left = problem statement (react-markdown), right = Monaco Editor. Below: Submit button, per-case pass/fail results, 3-level hint accordion.

**`/leaderboard` — Rankings with Podium**  
- Top 3 displayed as cards with gradient backgrounds, shadcn Avatars, rank badges (Crown/Medal)
- Top 15 table with shadcn Avatar + name/ID, XP, solved count, best time
- "You" badge on current user's row, rank delta tooltip (up/down/unchanged)
- Weekly/Monthly/All Time period filter, search by name or student ID
- Loading skeleton, error boundary, 30-second auto-polling

**`/profile` — User Profile with Tabs**  
Two tabs: **Overview** | **My Contributions**

Overview layout:
1. **ProfileHeader** — Gitea avatar via `<Image>` (fallback to colored initials circle), gradient accent bar, global rank badge, bio, copy link; shows `@gitea_username` badge if linked
2. **StatsOverview** — 6-column grid: Level (XP progress bar), Global Rank, Solved, Success Rate, Streak, Best Runtime (all with tooltips)
3. **ContributionGraphSection** — GitHub-style activity heatmap (recharts-based `kibo-ui` graph)
4. Two-column grid:
   - **ProgressMetrics** — Difficulty breakdown (Easy/Medium/Hard bars) + Module Proficiency (2×3 radial activity gauges)
   - **Achievements** — GitHub-style circular badge grid with tooltips on hover + detail dialog on click

My Contributions layout:  
3-column grid: `MyContributions` (user-submitted problems list, 2 cols) + `ActivityFeed` sidebar (achievement grid + recent activity timeline)

**`/settings` — Account Settings with Tabs**  
Two tabs: **Profile** | **Security**  
Security tab contains **Gitea Account** section: PAT input, Link/Unlink/Sync buttons, avatar preview, encrypted storage notice

**`/admin` — Admin Dashboard**  
Trigger ingest/enrich with live log streaming. Problem approval table with visibility toggle. Only accessible if JWT role = `admin`.

### Key Components

#### Activity Gauge (`components/ui/activity-gauge.tsx`)
- `recharts` `RadialBarChart` with single gold color (`fill-primary`)
- Percentage only in center (large `text-3xl font-bold`)
- `innerRadius={48}`, `outerRadius={76}`, `startAngle={90}`, `endAngle={450}`, `barSize={12}`
- 1200ms ease-out animation
- Wrapped in shadcn `Card`, used in `ProgressMetrics` module proficiency section

#### Achievements (`profile/components/Achievements.tsx`)
- 3-column grid of circular 52px badge buttons
- **Unlocked:** `opacity-100 grayscale-0`, hover → `ring-2 ring-primary/50`
- **Locked:** `opacity-30 grayscale`
- Hover → shadcn `Tooltip` showing title + description + checkmark
- Click → shadcn `Dialog` with icon, unlocked/locked badge, criteria, close button
- 6 hardcoded achievements: First Blood, Hot Streak, Perfectionist, Speed Demon, Veteran Coder, Completionist

#### Contribution Graph (`profile/components/ContributionGraphSection.tsx`)
- Uses `kibo-ui/contribution-graph` components
- 5 activity levels mapped from daily submission counts
- Each block wrapped in shadcn `Tooltip` (date, submissions, solved, tests_run)

---

## 10. Development Phases

Each phase ends with a **Definition of Done** checklist. Do not begin the next phase until all checks pass.

---

### Phase 1 — Foundation & Database ✅ Gateway

**Goal:** A running Go server that connects to Supabase and can execute raw queries.

**Tasks:**
1. Initialize Go module: `go mod init github.com/jerryjuche/koder`
2. Add dependencies: `jackc/pgx/v5`, `golang-jwt/jwt/v5`, `golang.org/x/crypto`
3. Implement `internal/config/config.go` — fail fast on missing env vars
4. Implement `internal/store/store.go` — pgx connection pool, ping on startup
5. Write and apply `migrations/001_init.sql` against Supabase
6. Implement `internal/store/users.go` — `CreateUser`, `GetUserByStudentID`
7. Implement `internal/auth/` — bcrypt wrap, JWT sign/verify

**Definition of Done:**
- [ ] `go build ./...` passes with zero errors
- [ ] `cmd/server/main.go` starts, pings Supabase, logs `"database: connected"`
- [ ] `CreateUser` and `GetUserByStudentID` have passing unit tests with `pgxmock`
- [ ] JWT round-trip (sign → verify → extract claims) tested

---

### Phase 2 — Auth API & Problem Store ✅ Gateway

**Goal:** Working login/register endpoints, and the ability to CRUD problems from the database.

**Tasks:**
1. Implement `internal/api/router.go` using `net/http` + `chi` router
2. Implement `internal/api/middleware.go` — JWT auth middleware, CORS
3. Implement `internal/api/handlers/auth.go` — POST `/auth/register`, POST `/auth/login`
4. Implement `internal/store/problems.go` — `ListVisibleProblems`, `GetProblemBySlug`, `UpsertProblem`
5. Implement `internal/store/testcases.go` — `GetTestCasesForProblem`, `UpsertTestCasesForProblem`
6. Implement `internal/api/handlers/problems.go` — GET `/problems`, GET `/problems/:slug`

**Definition of Done:**
- [ ] `POST /auth/register` creates a bcrypt-hashed user, returns JWT
- [ ] `POST /auth/login` validates credentials, returns JWT
- [ ] `GET /problems` returns empty array (no problems yet) with 200
- [ ] JWT middleware rejects requests with missing/invalid tokens with 401
- [ ] All handlers tested with `httptest.NewRecorder`

---

### Phase 3 — Ingest & Enrich Pipelines ✅ Gateway

**Goal:** Admin can trigger GitHub ingestion and Gemini enrichment. Problems appear in DB.

**Tasks:**
1. Implement `internal/parser/parser.go` — git clone/pull via `os/exec git`
2. Implement `internal/parser/extractor.go` — README.md walk, SHA256 hash, type detection
3. Implement `internal/enricher/schema.go` — Gemini `ResponseSchema` for `EnrichedProblem`
4. Implement `internal/enricher/ratelimiter.go` — 2 req/min enforcer
5. Implement `internal/enricher/enricher.go` — Gemini API call, validate response, store
6. Implement `internal/api/handlers/admin.go` — POST `/admin/ingest`, POST `/admin/enrich`
7. Test against a real 01-edu exercise to validate full Ingest→Enrich→DB flow

**Definition of Done:**
- [ ] `POST /admin/ingest` against a test repo populates `problems` table with `visible=false`
- [ ] `POST /admin/enrich` enriches one problem: `func_name`, `return_type`, `param_types`, `hints` all non-empty
- [ ] Re-running ingest on unchanged files skips processing (SHA256 check verified via logs)
- [ ] Gemini call uses `ResponseSchema` — no string parsing of markdown blocks
- [ ] Rate limiter enforces ≥30s between calls (tested with two rapid calls)

---

### Phase 4 — Execution Engine ✅ Gateway

**Goal:** Students can submit code and receive per-test-case graded results.

**Tasks:**
1. Implement `internal/executor/templates.go` — `main_test.go` template with primitive/slice branching
2. Implement `internal/executor/sandbox.go` — directory creation, file writes, cleanup
3. Implement `internal/executor/executor.go` — semaphore, docker invocation, output parsing
4. Implement `internal/store/submissions.go` — insert submission row
5. Implement `internal/store/progress.go` — upsert progress, XP award logic
6. Implement `internal/api/handlers/submissions.go` — POST `/submit`
7. Run `scripts/setup-docker-cache.sh` on host to warm build cache
8. Test with a known-correct and known-incorrect Go function

**Definition of Done:**
- [ ] Correct `Itoa` implementation receives `status: "passed"`, all test cases green
- [ ] Deliberate wrong implementation receives `status: "failed"` with specific failing cases
- [ ] Code with syntax error receives `status: "compiler_error"`
- [ ] Execution of an infinite loop receives `status: "timeout"` within 5s
- [ ] Two concurrent submissions do not crash the VM (semaphore verified under load)
- [ ] `/tmp/koder/<uuid>` directory is cleaned up after every execution path
- [ ] Execution time logged; with warm cache, clean solution runs in <500ms

---

### Phase 5 — Frontend ✅ Gateway

**Goal:** Students can log in, browse problems, write code, and see results.

**Tasks:**
1. Initialize Next.js project in `frontend/` with Tailwind
2. Install Monaco Editor (`@monaco-editor/react`)
3. Implement `lib/api.ts` — typed fetch wrappers for all backend endpoints
4. Build `app/page.tsx` — problem grid dashboard
5. Build `app/problems/[slug]/page.tsx` — Monaco editor + problem statement + submit
6. Build `components/TestResultPanel.tsx` — per-case pass/fail with icons
7. Build `components/HintAccordion.tsx` — 3-level progressive hints
8. Build `app/leaderboard/page.tsx`
9. Build `app/admin/page.tsx` — ingest/enrich triggers + problem approval table
10. Deploy to Vercel, configure `NEXT_PUBLIC_API_URL` environment variable

**Definition of Done:**
- [ ] Student can log in and see problem list
- [ ] Monaco Editor loads with Go syntax highlighting
- [ ] Submit flow shows loading state, then per-test-case results
- [ ] Hints unlock progressively (hint 2 only after hint 1 viewed)
- [ ] Admin page triggers ingest and shows live status
- [ ] Vercel deployment succeeds; frontend talks to Oracle VM backend

---

### Phase 6 — Hardening & Production Readiness

**Goal:** The system is secure, observable, and survivable under real student load.

**Tasks:**
1. Add structured logging (`log/slog`) to all three pipelines and API handlers
2. Add request ID middleware — propagate through logs
3. Implement admin problem visibility toggle (`PATCH /admin/problems/:id/visibility`)
4. Add submission history endpoint (`GET /submissions`)
5. Add input validation on all handlers — reject oversized code submissions (>50KB)
6. Set up Supabase Row Level Security policies for student data isolation
7. Configure UFW firewall on Oracle VM — only expose ports 22, 80, 443, 8080
8. Set up nginx reverse proxy with TLS (Let's Encrypt) in front of Go server
9. Write `systemd` service unit for the Go binary with auto-restart
10. Stress test: simulate 5 concurrent students submitting simultaneously

**Definition of Done:**
- [ ] All log lines include request ID, user ID where applicable
- [ ] No student can read another student's submissions via API
- [ ] Server survives 5 concurrent submission requests without OOM or crash
- [ ] TLS termination working; all traffic over HTTPS
- [ ] `systemd` service restarts automatically after crash
- [ ] Submission code size >50KB rejected with 413

---

## 11. Environment Variables & Configuration

All configuration is injected via environment variables. The server must fail fast with a clear error if any required variable is missing.

```bash
# .env.example

# Database
DATABASE_URL=postgres://user:password@host:5432/postgres?sslmode=require

# Auth
JWT_SECRET=<min-32-char-random-string>
JWT_EXPIRY_HOURS=24

# Google Gemini
GEMINI_API_KEY=<google-ai-studio-api-key>
GEMINI_MODEL=gemini-2.5-pro

# Execution
EXECUTOR_MAX_CONCURRENCY=4
EXECUTOR_TIMEOUT_SECONDS=25
DOCKER_IMAGE=golang:1.22-alpine
SANDBOX_BASE_DIR=/tmp/koder
BUILD_CACHE_DIR=/tmp/go-build-cache

# Server
PORT=8080
ENVIRONMENT=production  # "development" | "production"

# CORS
ALLOWED_ORIGIN=https://koder.vercel.app

# Gitea (all optional — PAT linking works with just GITEA_URL)
GITEA_URL=https://gitea.com
GITEA_CLIENT_ID=              # OAuth only (dormant)
GITEA_CLIENT_SECRET=          # OAuth only (dormant)
GITEA_REDIRECT_URL=           # OAuth only (dormant)
```

---

## 12. Coding Standards & Conventions

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
| Code injection via student submission | `--network=none` container; no filesystem access outside `/app`; memory cap 64MB |
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
| Docker cold start | <250ms | `/tmp/go-build-cache` mounted volume pre-warmed with `go build std` |
| Gemini API rate limit | 2 req/min | Sequential enrichment with 30s sleep between calls; idempotent re-runs |
| Supabase 500MB cap | Never exceed | No binary storage; raw_readme + statement are the largest text fields |
| Oracle VM RAM | Never OOM | Semaphore cap=4; `--memory=256m` per container; Go server typically <50MB RSS |
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

- The semaphore is `chan struct{}`, capacity 2. Acquire = send, release = receive via defer.
- All `exec.CommandContext` calls must use a context from `context.WithTimeout(ctx, 5*time.Second)`
- The working directory is always `/tmp/koder/<uuid>` where `<uuid>` comes from `uuid.NewString()`
- Three files are always written: `solution.go`, `main_test.go`, `go.mod` — never more, never less
- Parse stdout with `bufio.Scanner`, match lines with `strings.HasPrefix(line, "--- PASS:")` and `strings.HasPrefix(line, "--- FAIL:")`

### When Writing Enricher Code

- Import `"google.golang.org/genai"` — not the old `google/generative-ai-go` package
- Use `client.Models.GenerateContent` with `genai.GenerateContentConfig{ResponseSchema: schema}`
- The `ResponseSchema` is a `*genai.Schema` struct, not a string or JSON literal
- Rate limiter is a simple `time.Sleep(30 * time.Second)` between calls — no token bucket needed at this scale

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
# Edit .env with your Supabase URL, Gemini key, JWT secret

# 3. Apply database migrations
psql $DATABASE_URL -f migrations/001_init.sql
psql $DATABASE_URL -f migrations/002_indexes.sql
psql $DATABASE_URL -f migrations/009_get_full_profile.sql
psql $DATABASE_URL -f migrations/010_add_gitea_auth.sql
psql $DATABASE_URL -f migrations/011_add_gitea_token.sql

# 4. Warm the Docker build cache
chmod +x scripts/setup-docker-cache.sh
./scripts/setup-docker-cache.sh

# 5. Run the Go server
go run ./cmd/server

# 6. Run the frontend (separate terminal)
cd frontend
npm install

# Build (use npx, not npm — Windows DLL crash on npm run build):
npx next build

# Dev mode:
npm run dev
```

Server starts on `http://localhost:8080`. Frontend on `http://localhost:3000`.

**Note:** On Windows, `npm run build` crashes with DLL exit code `3221225794`. Use `npx next build` instead.

---

## License

MIT

---

*This document is the single source of truth for Koder. Any deviation from the architecture, conventions, or constraints described here requires an explicit ADR entry explaining the reasoning.*


## Update: Problem Statements & Workspace Polish
- Updated `statement` for 11 core problems (including `edit-distance`) in the database with rich markdown, detailed considerations, examples, and realistic solve-time estimates.
- Overhauled `ProblemWorkspaceClient.tsx` to feature premium glassmorphic styling, dynamic hover states, glowing accents, and enhanced `@tailwindcss/typography` (`remarkGfm`) markdown styling.
