# Koder — Professional Codebase Index

> Zero-cost, production-grade automated code-grading platform for Go & Python curricula.
> Students solve problems in a Monaco editor workspace, submit code, receive instant pass/fail results with diff output. AI (NVIDIA NIM / DeepSeek V4 Flash) enriches raw problem specs into structured test cases. Runs entirely on free-tier infrastructure.
>
> **Branch:** `update` | **Last indexed:** 2026-08-01 | **Verified:** `go vet` clean (13/13 packages incl. sandbox), 10/10 Go test suites passing (136 tests, zero failures), ESLint 0 errors, `tsc --noEmit` 0 errors | **Working tree:** clean (untracked: `.kilo/`)

---

## 1. Project Overview

| Field | Value |
|---|---|
| **Repository** | `github.com/jerryjuche/koder` |
| **Purpose** | Self-hosted automated programming assignment grader for Go & Python |
| **Budget** | $0/month (Render Free + Supabase Free + Vercel Hobby + Azure Container Apps/GHCR) |
| **Stack** | Go 1.26 (chi/v5, pgx/v5) + Next.js 15 (React 19, Tailwind CSS 4) + PostgreSQL 15 + NVIDIA NIM (DeepSeek V4 Flash) |
| **Sandbox** | Standalone Go binary, zero external dependencies, Azure Container Apps + GHCR |

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Go 1.26, chi/v5 router, pgx/v5 | HTTP server, routing, middleware, database access |
| **Database** | PostgreSQL 15 (Supabase), pgx/v5 | Raw SQL, connection pooling (10 max, SimpleProtocol for PgBouncer) |
| **Auth** | golang-jwt/v5 (HS256), bcrypt (cost=12), Google Identity Services | JWT tokens with rotation, password hashing, OAuth |
| **AI** | NVIDIA NIM (DeepSeek V4 Flash) | Test case generation + 8-action admin AI assist |
| **Execution** | Remote sandbox (Azure Container Apps) + local Docker fallback | Isolated `go test` / `python3` execution, semaphore=6 |
| **Real-time** | gorilla/websocket, in-memory pub/sub | Live XP/progress/broadcast WebSocket events |
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4 | App Router, server components, shadcn/ui, Monaco Editor |
| **Client Python** | Pyodide v0.27.4 (CDN) | In-browser Python playground & lesson exercises |

---

## 3. Repository Statistics (Verified: 2026-07-31)

| Category | Files | Lines of Code | Notes |
|---|---|---|---|
| **Go Backend** (`cmd/` + `internal/`) | 64 source + 15 test | ~18,200 + ~3,330 | 8 packages, 152 Store interface methods, 118 API endpoints; includes 4 cmd tools |
| **Go Sandbox** (`sandbox/`) | 8 source + 2 test + Dockerfile + fly.toml | ~1,253 + ~149 + ~58 | Zero external deps, 4-layer defense-in-depth, pinned black formatter |
| **SQL Migrations** (`migrations/`) | 51 | ~27,470 | 33 schema + 17 seed/content + 1 content-refresh, 25 tables |
| **Frontend App** (`app/`) | 73 `.tsx` | ~17,718 | 7 route groups, all with loading + error boundaries (+ `globals.css`, 216 LOC) |
| **Frontend Components** (`components/`) | 63 | ~10,039 | 20 shadcn/ui + 43 custom |
| **Frontend Lib/Hooks** (`lib/`, `hooks/`) | 23 | ~3,942 | 60+ API functions, 40+ TS interfaces, 4 hooks || **Frontend Styles** (`styles/` + `app/globals.css`) | 4 | ~1,598 | theme.css (856 vars), typography.css (430 lines) |
| **Documentation** | 17 | ~9,143 | 4 docs/ + 13 root docs files |
| **Scripts** | 7 | ~904 | data reset, build cache, seed transform, curriculum cleanup, practicals migration generator |
| **Config/Build** | 14 | ~699 | go.mod, go.sum, Procfile, build.sh, CI, env, env example, frontend configs |
| **Root Data (JSON, SQL)** | 28 | ~12,678 | Problem JSONs, rollback/update SQL, curriculum JSON, audit logs |
| **Total (tracked source)** | **~362** | **~106,000** | Source code + migrations + docs + config + scripts + root data files |

---

## 4. Repository Structure

```
koder/
├── cmd/server/main.go                       # Entry point (125 lines)
├── cmd/extract-problems/main.go             # CL tool — extract problems from repository
├── cmd/generate-sql/main.go                 # CL tool — generate seed SQL from problem JSON
├── cmd/generate-curriculum/main.go          # CL tool — generate curriculum SQL from AI JSON
├── internal/
│   ├── api/              (24 files, 7,009 LOC)  # HTTP handlers, middleware, WebSocket, test endpoint
│   ├── store/            (21 files, 6,398 LOC)  # Database access layer — pgx/v5, 152 Store methods
│   ├── executor/         (6 files, 1,805 LOC)   # Code execution engine, sandbox orchestration, output parsing
│   ├── enricher/         (1 file, 942 LOC)      # AI test generation — NVIDIA NIM (DeepSeek V4 Flash)
│   ├── auth/             (3 files, 364 LOC)     # JWT (HS256), Google OAuth (JWKS), bcrypt
│   ├── broker/           (1 file, 68 LOC)       # In-memory pub/sub (cap 32, non-blocking)
│   ├── parser/           (1 file, 371 LOC)      # GitHub YAML curriculum parser
│   └── config/           (1 file, 366 LOC)      # Env var loader (33 vars, fails-fast validation)
├── sandbox/              (7 source + 1 test + Dockerfile + fly.toml, ~1,244 LOC)  # Remote execution — zero external deps
├── frontend/
│   ├── app/              (73 .tsx, ~17,718 LOC) # App Router pages (7 route groups)
│   ├── components/       (63 files, ~10,039 LOC) # Shared components + shadcn/ui primitives
│   ├── hooks/            (4 files, ~374 LOC)    # usePyodide, useGoogleOneTap, useHasMounted, useMobile
│   ├── lib/              (18 files, ~3,528 LOC) # API client, types, cache, event bus, markdown, pyodide, monaco + TextMate
│   ├── styles/           (3 files, ~1,382 LOC)  # theme.css (856 var tokens), typography.css (430 lines)
│   └── public/           (28 assets)            # module WebP images (18), icons, logo, OG image
├── migrations/           (51 files, ~27,470 LOC) # Full schema + seed data — 25 tables
├── scripts/              (7 files)              # reset_data.sql, transform-seeds.mjs, setup-docker-cache.sh, generate-practicals-migration.mjs
├── docs/                                        # curriculum-schema-for-ai.md, learn-ui-redesign-prompt.md, curriculum.md, ai-curriculum-prompt.md
├── .github/workflows/ci.yml                     # 2-job CI: backend + frontend
└── build.sh                                     # Cross-compile linux/amd64 deployment script (15 lines)
```

---

## 5. Architecture Overview

### 5.1 Request Lifecycle

```
Client → chi Router → Middleware Stack → Handler → Store → PostgreSQL
                                                 → Executor → Docker/Sandbox
                                                 → Enricher → NVIDIA NIM
                                                 → Broker → WebSocket clients
```

### 5.2 Middleware Chain (in order)

| Middleware | File | Purpose |
|---|---|---|
| `RequestLoggingMiddleware` | `middleware.go` | Logs method/path/status/duration/correlation ID (8-byte crypto/rand hex) |
| `RecoveryMiddleware` | `middleware.go` | Catches panics → JSON 500 |
| `CORSMiddleware` | `middleware.go` | Multi-origin, OPTIONS 200, null origin support |
| `SecurityHeadersMiddleware` | `middleware.go` | CSP (nonce per-request), XFO DENY, XCTO nosniff, HSTS, Referrer-Policy |
| `BodySizeLimitMiddleware` | `middleware.go` | Per-route body size limits (256KB–10MB) |
| `AuthMiddleware` | `middleware.go` | JWT validation from Bearer header or koder_token cookie; checks blacklist |
| `AdminOnly` | `middleware.go` | Role check: admin required |
| `VerifiedContributorOnly` | `middleware.go` | Role check: verified_contributor+ |
| `RateLimitMiddleware` | `middleware.go` | Per-user sliding window (5 req/45s), admin bypass |
| `IPRateLimiter` | `middleware.go` | Per-IP auth endpoint limiter (10 req/min) |
| `AIRateLimitMiddleware` | `middleware.go` | Per-admin AI assist limiter (15 req/60s, NO bypass) |

### 5.3 Defense-in-Depth Security (4 Layers)

| Layer | Sandbox File | Mechanism |
|---|---|---|
| 1 — Static Analysis | `secure.go` | Regex blocklist: 14 Go dangerous patterns (cgo, os/exec, syscall, unsafe), 17 Python dangerous patterns (os, subprocess, socket, eval, ctypes) |
| 2 — AST Validation | `pyrunner.go` | Python-only: walks AST of submitted code to block malicious imports and attribute calls |
| 3 — Kernel Limits | `secure_unix.go` | `setrlimit`: NPROC=6, NOFILE=1024, FSIZE=64MB, RLIMIT_AS=512MB; `Setpgid` process isolation |
| 4 — Container | Docker/ACA | `--network=none`, minimal capabilities, 256MB memory limit, 30s timeout |

---

## 6. Go Backend — Complete File Inventory

### 6.1 Entry Point

| File | Lines | Package | Purpose |
|---|---|---|---|
| `cmd/server/main.go` | 125 | `main` | Bootstrap: LoadConfig → NewPostgresStore → NewExecutor → NewBroker → NewRouter → http.ListenAndServe → graceful shutdown (10s deadline), `-ldflags` for commit/build time |
| `cmd/extract-problems/main.go` | 131 | `main` | CLI — extract problems from GitHub repo READMEs |
| `cmd/generate-sql/main.go` | 116 | `main` | CLI — generate seed SQL INSERTs from problem JSON |
| `cmd/generate-curriculum/main.go` | 398 | `main` | CLI — generate curriculum SQL from AI-generated JSON (CREATE + UPDATE modes) |

### 6.2 API Handlers (`internal/api/` — 25 files, 7,082 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `router.go` | 299 | `App` struct, `NewRouter()` (~118 routes), `Shutdown()` |
| `middleware.go` | 540 | 11 middleware functions, `GetClaims(ctx)`, `GetRequestID(ctx)` |
| `auth.go` | 612 | `AuthHandler` — Register, Login (3-field), GoogleAuth (JWKS), CompleteOnboarding, LinkGoogle, RefreshToken (rotation), Logout, CheckUsername |
| `admin.go` | 883 | `AdminHandler` — Ingest, Enrich, EnrichAll, AIAssist (8 actions), GetAdminStats, GetAIUsage, ListAllProblems, ToggleVisibility, UpdateProblem, PublishAllDrafts, Approve/Reject contributions, SearchUsers, ToggleUserVerified, ListModuleMeta, UpsertModuleMeta, SetModulePin, ListAllModules, List/Toggle ProblemModuleLocks, DeleteProblemModule |
| `cms.go` | 1,428 | `CMHandler` — 6 student routes (ListPublishedCourses, GetCourseDetail, GetModuleDetail, GetLessonDetail, CompleteLesson, GetAllProgress) + 22 admin routes (full CRUD for courses/modules/lessons/sections/projects/dependencies) |
| `me.go` | 360 | `MeHandler` — GetMe (cached 30s), SetUsername (one-time 403), UpdateLanguage, DeleteAccount (cascade), ExportData (JSON) |
| `change_password.go` | 266 | `ChangePasswordHandler` — SetPin, VerifyPin (5/15min rate-limit), ChangePassword |
| `pin_reset.go` | 257 | `PINResetHandler` — ForgotPasswordPin (email+PIN → short-lived JWT), ResetPasswordPin (domain-separated HMAC-SHA256) |
| `password_reset.go` | 255 | `PasswordResetHandler` — ForgotPassword (Resend API, always-ok), ResetPassword (SHA-256 token) |
| `broadcasts.go` | 237 | `BroadcastsHandler` — ListActive, Dismiss (student); ListAll, Create, Deactivate, Activate, Delete (admin) |
| `feedback.go` | 345 | `FeedbackHandler` — Submit (10MB, screenshot, Resend + in-app notification), ListMyFeedback, ListAdmin (status filter), Counts, UpdateStatus, ListProblemReports |
| `problems.go` | 202 | `ProblemHandler` — ListVisibleProblems (LATERAL JOIN, locked-module stamping), GetProblemBySlug (403 MODULE_LOCKED), optional auth bypass |
| `submissions.go` | 168 | `SubmissionHandler` — Submit (5/45s ratelimit, scoring, WS events: `user.xp.updated` + `progress.updated`) |
| `profile.go` | 257 | `ProfileHandler` — GetProfile (stored proc, 30s cache), UpdateProfile |
| `test.go` | 132 | `TestHandler` — Direct test case execution without scoring |
| `format.go` | 73 | `FormatHandler` — POST /api/format (gofmt in-process / black via sandbox; 422 syntax, 502 sandbox-down) |
| `activity.go` | 54 | `ActivityHandler` — GetActivity (contribution heatmap by year) |
| `notifications.go` | 115 | `NotificationsHandler` — GetUnread (50), GetRecent (20), MarkRead, MarkAllRead |
| `community.go` | 139 | `CommunityHandler` — GetCommunitySolutions, GetBestPractices, LikeSubmission, UnlikeSubmission |
| `contributions.go` | 85 | `ContributionsHandler` — PostContribution (verified_contributor+), GetMyContributions |
| `leaderboard.go` | 40 | `LeaderboardHandler` — GetLeaderboard (?period=, 30s cache) |
| `users.go` | 33 | `UsersHandler` — GetUserPublicData |
| `ws.go` | 75 | `WSHandler` — WebSocket upgrade (gorilla), broker subscribe/unsubscribe, write pump (30s pong) |
| `cache.go` | 132 | Generic TTL cache (30s): `userCache`, `profileCache`, `leaderboardCache`, `problemsCache` + `StopCaches()` |
| `responses.go` | 95 | `APIError`, `APIResponse`, `RespondSuccess`/`Created`/`Error`, `SetAuthCookie`/`ClearAuthCookie` |

### 6.3 Store Layer (`internal/store/` — 21 files, 6,398 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `store.go` | 285 | `Store` interface (~152 methods), `PostgresStore` struct, `NewPostgresStore` (MaxConns=10, MinConns=2, 30m lifetime, SimpleProtocol) |
| `types.go` | 650 | ~50 structs: User, Problem, Submission, Progress, TestCase, Feedback, Broadcast, Notification, Course, Module, Lesson, LessonSection, Project, LanguageSpec, ModuleMeta, ModuleLock, RefreshToken, AIUsageStats, AdminStats, LeaderboardEntry, FlexibleBool, FlexibleStrings, GoogleUserInfo |
| `users.go` | 1,371 | 30+ functions: CreateUser (bcrypt cost 12), GetUserByLogin (3-field), GetLeaderboard (period, top 100), CalculateStreak (gaps-and-islands DENSE_RANK), CompleteUserOnboarding (atomic tx), DeleteAccount (cascade) |
| `problems.go` | 809 | 12+ functions: ListVisibleProblems (LATERAL JOIN, `NOT EXISTS` + `EXISTS` locking), UpsertEnrichedProblem (tx), UpdateProblem (16 fields, merge semantics) |
| `curriculum.go` | 1,146 | 30+ functions: Full CMS CRUD for courses/modules/lessons/sections/projects + dependency management + progress tracking (UpsertCourseProgress, UpsertLessonProgress with GREATER NEVER DECREASE) |
| `user_problems.go` | 358 | CreateUserProblem, ListPending, Approve (5-step tx with FOR UPDATE), Reject, generateDualLanguageSpec, pascalToSnake, goTypeToPython |
| `submissions.go` | 229 | CreateSubmission (90d TTL), GetProblemWithTestCases (JOIN), GetRecentSubmissionForProblem |
| `progress.go` | 153 | UpsertProgress — pg_advisory_xact_lock for race prevention, stars 3/2/1 logic, XP only on first solve |
| `admin.go` | 152 | LogActivity, GetRecentActivity (50), GetAdminStats |
| `profile.go` | 112 | GetFullProfile (stored proc call), GetUserActivity |
| `feedback.go` | 192 | CreateFeedback, GetAdminFeedback (dynamic WHERE), GetProblemReports, UpdateFeedbackStatus |
| `broadcasts.go` | 168 | CRUD + activate/deactivate + dismiss + GetActiveBroadcasts (latest 1, not dismissed) |
| `notifications.go` | 190 | Create, GetUnread (50), GetRecent (20), MarkRead/All, NotifyAdmins/All, ReplaceBroadcastNotifications |
| `module_meta.go` | 110 | ListModuleMeta, UpsertModuleMeta, SetModulePin, GetModuleMeta |
| `module_locks.go` | 104 | ListLockedModules, ToggleProblemModuleLock, IsModuleLocked, LockModule, UnlockModule |
| `refresh_tokens.go` | 68 | Create, Get, Revoke, RevokeAll, CleanupExpired |
| `testcases.go` | 94 | GetTestCasesForProblem (all), GetVisibleTestCasesForProblem |
| `ai_usage.go` | 59 | LogAIUsage, GetAIUsageStats (graceful on missing table) |
| `errors.go` | 67 | `FriendlyError` (Code+Message), `IsUniqueViolation` (23505), constraint→message map |
| `token_blacklist.go` | 33 | BlacklistToken, IsTokenBlacklisted, CleanupExpired |
| `password_reset.go` | 48 | Create, Get, MarkUsed, CleanupExpired |

### 6.4 Auth (`internal/auth/` — 3 source + 2 test files, 364 + 320 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `jwt.go` | 120 | `Claims` struct, `SignToken` (HS256, 7 args), `ValidateToken`, `GenerateRefreshToken` (32-byte crypto/rand), `SHA256Hash` |
| `oauth.go` | 216 | `VerifyGoogleIDToken` (JWKS fetch + 1h cache, RSA key reconstruction, audience/issuer/email check) |
| `password.go` | 28 | `HashPassword` (bcrypt cost=12), `ComparePassword` |
| `auth_test.go` | 209 | 15 tests: JWT sign/verify, bcrypt hash/compare |
| `oauth_test.go` | 111 | 5 tests: audience/issuer validation, JWKS key round-trip |

### 6.5 Enricher (`internal/enricher/` — 1 source + 1 test file, 942 + 231 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `enricher.go` | 942 | `Enricher` struct, `NewEnricher`, `EnrichProblem` (NVIDIA NIM, dual-language prompts, 1s rate-limit), `AIAssistProblem` (8 action types), `toSnakeCase`, `toPythonType`, `validateEnrichedProblem` (14 checks), `cleanResponse` (markdown fence stripping), `normalizeTestCaseInput` |
| `enricher_test.go` | 231 | 4 tests: toSnakeCase (10 cases), toPythonType (13 mappings), cleanResponse (5 cases), validateEnrichedProblem (11 sub-tests) |

### 6.6 Executor (`internal/executor/` — 7 source + 2 test files, 1,858 + 674 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `executor.go` | 1,314 | `Executor` (semaphore=6), `Execute` (scoring), `ExecuteVisibleOnly` (test-only), `formatGoLiteral` (recursive), `formatPythonLiteral` (null→None), `goToSnakeCase`, `EnhancePythonError`, `parseCompilerError` (3-pass) |
| `format.go` | 53 | `FormatCode` (go/format.Source in-process / black via sandbox), `FormatSyntaxError` |
| `parser.go` | 111 | `ParseTestOutput` — 5 regex patterns, state machine for GOT/WANT multi-line parsing |
| `templates.go` | 104 | `mainTestTemplate` (Go: `==` / `reflect.DeepEqual`), `pythonTestTemplate` (Python: `json.loads`) |
| `sandbox.go` | 72 | `PrepareSandbox` (temp dir, go.mod, solution.go, main_test.go, forcePackageKoder regex) |
| `sandbox_client.go` | 170 | `SandboxRequest/Response`, HTTP client (3 retries, exp backoff 2ⁿ×500ms, request timeout = `timeout_sec + requestTimeoutExtra`), `FormatFriendlySandboxError` |
| `types.go` | 34 | `ExecutionRequest`, `ExecutionResult`, `TestResult` |
| `executor_test.go` | 533 | 16 tests: literal formatting, template rendering, output parsing (all-pass, mixed, multi-line, errors), Python pipeline |
| `format_test.go` | 141 | 7 tests: gofmt valid/syntax/empty, sandbox formatting (fake server), black error mapping, stub-signature regression |

### 6.7 Broker (`internal/broker/` — 1 source + 1 test file, 68 + 186 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `broker.go` | 68 | `Event` struct, `Broker` (sync.RWMutex + map of cap-32 channels), `New`, `Subscribe` (UUID), `Unsubscribe`, `Publish` (non-blocking), `PublishEvent` |
| `broker_test.go` | 186 | 10 tests: subscribe uniqueness, delivery (1/M), overflow (cap 32), concurrent (10 goroutines) |

### 6.8 Parser (`internal/parser/` — 1 source + 1 test file, 371 + 346 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `parser.go` | 371 | `Parser` struct, `RawProblem`, `IngestGitHubRepo` (clone + sparse checkout, SHA-256 idempotency), `ParseProblem`, `normalizeSlug`, `normalizeModule`, `cleanRepoURL` |
| `parser_test.go` | 346 | 13 tests: isReadmeFile, detectProblemType, normalizeSlug, computeSourceHash, URL parsing (HTTPS+SSH) |

### 6.9 Config (`internal/config/` — 1 source + 1 test file, 366 + 355 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `config.go` | 366 | `Config` struct (33 fields), `Load()` — env + .env file, fails-fast validation (JWT_MIN_LENGTH=32, port 1-65535), `SANDBOX_REQUEST_TIMEOUT_EXTRA_SECONDS` (default 20) |
| `config_test.go` | 355 | 24 tests: missing vars, invalid port, environment validation |

### 6.10 Dependencies (`go.mod`)

| Direct Dep | Version | Purpose |
|---|---|---|
| `chi/v5` | v5.3.0 | HTTP router, middleware chaining |
| `jwt/v5` | v5.2.0 | HS256 token signing/validation |
| `gorilla/websocket` | v1.5.3 | WebSocket upgrade and read/write pumps |
| `pgx/v5` | v5.5.5 | PostgreSQL driver, connection pooling |
| `golang.org/x/crypto` | v0.36.0 | bcrypt password hashing |
| `golang.org/x/text` | v0.23.0 | Text transformations |
| `google/uuid` | v1.6.0 | UUID generation |

---

## 7. Sandbox (`sandbox/` — 8 source + 2 test + Dockerfile + fly.toml, ~1,457 LOC, Zero External Dependencies)

| File | Lines | Purpose |
|---|---|---|
| `main.go` | 388 | HTTP server on `:$PORT` — `/health`, `/version`, `/execute`, `/format`; language dispatcher; `classifyOutput` (4 regex patterns); `compileErrorMessage` (3-pass) |
| `format.go` | 96 | `POST /format` — Python formatting via pinned black (`black -q -`, 30s timeout) → `{formatted, error}` |
| `pyrunner.go` | 265 | Python runner: 2-layer security (regex + AST via subprocess), `findPythonBin` (python3→python), `cappedBuffer` (64KB), OOM detection |
| `ratelimit.go` | 156 | Per-IP sliding window (10 req/min), 429 Retry-After, 5min cleanup goroutine |
| `runtest_go.go` | 148 | Go runner: go.mod, solution.go (forced `package koder`), `go test -v -count=1 -gcflags=-l`, `GOPROXY=off`, `GOTOOLCHAIN=local` |
| `secure.go` | 111 | 14 Go dangerous patterns (cgo, os/exec, syscall, unsafe), 17 Python dangerous patterns (os, subprocess, socket, eval) |
| `secure_unix.go` | 64 | Setpgid isolation, setrlimit (NPROC=6, NOFILE=1024, FSIZE=64MB, RLIMIT_AS=512MB), killProcessGroup (SIGKILL), reapProcess (5s) |
| `secure_other.go` | 25 | No-op stubs for non-Unix (Windows) |
| `security_message_test.go` | 32 | 3 tests: dangerous-pattern detection message quality |
| `format_test.go` | 117 | 5 tests: black formatting (valid/syntax/empty/unsupported-language/quote-normalization), black-gated |
| `Dockerfile` | 33 | 2-stage build based on `golang:1.26-alpine`, includes python3 + pinned `black==25.1.0`, bakes Go build cache via `/warmup` (cold first-compile ~23s → ~2s) |
| `fly.toml` | 25 | Legacy Fly.io config (fallback; Azure deployment lives in `sandbox/azure/`) |

---

## 8. Frontend — Complete File Inventory

### 8.1 App Router Pages (`frontend/app/` — 73 `.tsx` files + 1 CSS, ~17,934 LOC)

#### Root (4 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 67 | Server | Dark mode, Inter+Fira Code fonts, Sonner Toaster, Vercel Analytics, DesktopOnlyOverlay, OG metadata |
| `page.tsx` | 85 | Client | Loading guard → fetchUser → MultiStepLoader → `/home` or `/landing` |
| `not-found.tsx` | 70 | Client | Animated 404 with Terminal icon, Home + Go Back |
| `global-error.tsx` | 33 | Client | 500 error boundary with reset button |

#### Landing & OAuth (2 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `landing/page.tsx` | 5 | Server | Renders `<LandingContent />` |
| `oauth/callback/page.tsx` | 52 | Client | Extract token/error → redirect to `/home` or `/onboarding` |

#### Auth `(auth)/` (6 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 18 | Server | Centered card layout |
| `login/page.tsx` | 249 | Client | Google-first + email form, react-hook-form + zod, show/hide password |
| `register/page.tsx` | 291 | Client | Google-first or email/password, Go/Python language choice, PIN setup |
| `forgot-password/page.tsx` | 344 | Client | PIN-based flow: 6-digit input, email verification, security code |
| `reset-password/page.tsx` | 228 | Client | Token-based password reset from JWT |
| `onboarding/page.tsx` | 344 | Client | Username setup + LanguageSelector with Go/Python grid |

#### Main `(main)/` — Dashboard & Navigation (6 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 22 | Server | TopNav, BroadcastBanner, FeedbackButtonWrapper, PyodidePreloader |
| `error.tsx` | 32 | Client | AlertTriangle + retry |
| `home/page.tsx` | 831 | Client | Dashboard: ModuleCards grid, language filter, URL-persisted module filter, search, pagination (18/page), best practices tab, locked module support, user stats bar |
| `home/loading.tsx` | 17 | Server | Skeleton grid |
| `home/error.tsx` | 32 | Client | Error boundary |
| `settings/page.tsx` | 1,104 | Client | 4 tabs: Profile (name/bio), Security (PIN/password/Google link/delete), Notifications, Appearance |

#### Profile `(main)/profile/` (12 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `page.tsx` | 11 | Server | Shell → `<ProfileClient />` |
| `ProfileClient.tsx` | 221 | Client | Tabs: Stats, Activity, Achievements, Contributions |
| `loading.tsx` | 50 | Server | Skeleton |
| `error.tsx` | 32 | Client | Error boundary |
| `components/ProfileHeader.tsx` | 201 | Client | Avatar, XP bar (xpInLevel/1000), level, stats, bio |
| `components/StatsOverview.tsx` | 50 | Client | 3-column stats: solved, streak, rank |
| `components/ProgressMetrics.tsx` | 121 | Client | Difficulty breakdown bars |
| `components/Achievements.tsx` | 188 | Client | 6 achievement badges with detail dialogs |
| `components/RecentActivity.tsx` | 184 | Client | Recent submissions list |
| `components/ActivityFeed.tsx` | 179 | Client | Chronological activity entries |
| `components/ContributionGraphSection.tsx` | 154 | Client | GitHub-style heatmap |
| `components/MyContributions.tsx` | 379 | Client | User-submitted problems, edit/delete |

#### Leaderboard `(main)/leaderboard/` (4 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `page.tsx` | 11 | Server | Metadata wrapper |
| `LeaderboardClient.tsx` | 589 | Client | Top-3 podium, searchable ranked table, period filter, ProfileHoverCard |
| `loading.tsx` | 41 | Server | Skeleton |
| `error.tsx` | 32 | Client | Error boundary |

#### Problems Listing `(main)/problems/` + Workspace `app/problems/` (8 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `app/problems/layout.tsx` | 16 | Server | UserProvider + FeedbackButton + PyodidePreloader |
| `(main)/problems/page.tsx` | 687 | Client | (BETA-gated) Search/filter: language tabs, status/difficulty/XP range, seeded random ordering per user, mobile sidebar |
| `app/problems/[slug]/page.tsx` | 54 | Server | Shell → Suspense → DynamicWorkspace, OG metadata per-problem |
| `app/problems/[slug]/DynamicWorkspace.tsx` | 40 | Client | next/dynamic no-SSR wrapper |
| `app/problems/[slug]/ProblemWorkspaceClient.tsx` | 1,650 | Client | Monaco Editor (Go/Python), language toggle with Save & Switch, submit/test, renderMarkdown statement, confetti, sessionStorage navigation, formatCode, hints panel, bug report, admin edit |
| `app/problems/[slug]/error.tsx` | 32 | Client | Error boundary |
| `(main)/problems/[slug]/success/page.tsx` | 427 | Client | Post-submission: confetti, CodeBlock, community likes, next problem |

#### Contribute (2 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `page.tsx` | 372 | Client | Community problem submission form, test cases, language_versions |
| `error.tsx` | 32 | Client | Error boundary |

#### Admin `(main)/admin/` (9 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `page.tsx` | 957 | Client | Dashboard: tabs for Stats, Ingest, Activity, Problems, Feedback, Broadcasts, Pending Contributions, Problem Reports, User Verification, Module Settings, Problem Module Locks, Curriculum Module Locks |
| `error.tsx` | 32 | Client | Error boundary |
| `BroadcastPanel.tsx` | 334 | Client | Create/edit broadcasts, activate/deactivate toggles |
| `FeedbackPanel.tsx` | 276 | Client | Status filters, inline resolve |
| `PendingContributions.tsx` | 268 | Client | Approval/rejection queue |
| `ProblemEditPanel.tsx` | 666 | Client | 16-field editor, renderMarkdown preview, AI assist |
| `ProblemReports.tsx` | 681 | Client | Grouped/flat bug reports, search, resolved filter |
| `UserVerificationPanel.tsx` | 211 | Client | Debounced search (300ms), verified toggle |
| `curriculum/page.tsx` | 1,857 | Client | 3-panel CMS: course list → modules → lesson editor; full section CRUD, quiz metadata, dependency picker, multi-file config, project CRUD |

#### Learn `(main)/learn/` (17 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 16 | Client | Eager Pyodide load |
| `loading.tsx` | 24 | Server | Skeleton grid |
| `error.tsx` | 30 | Client | Error boundary |
| `courses/page.tsx` | 334 | Client | Course catalog grid with LearningCard, gradient heroes, difficulty pills |
| `courses/loading.tsx` | 24 | Server | Skeleton |
| `courses/error.tsx` | 30 | Client | Error boundary |
| `courses/[courseSlug]/page.tsx` | 303 | Client | Course detail: hero + progress bar + module cards with status |
| `courses/[courseSlug]/loading.tsx` | 13 | Server | Skeleton |
| `courses/[courseSlug]/error.tsx` | 30 | Client | Error boundary |
| `.../modules/[moduleSlug]/page.tsx` | 426 | Client | Module detail: gradient header + stats + lesson cards with XP badges |
| `.../modules/[moduleSlug]/loading.tsx` | 13 | Server | Skeleton |
| `.../modules/[moduleSlug]/error.tsx` | 30 | Client | Error boundary |
| `.../lessons/[lessonSlug]/page.tsx` | 5 | Server | Shell → LessonViewerClient |
| `.../lessons/[lessonSlug]/LessonViewerClient.tsx` | 733 | Client | Step-by-step nav (AnimatePresence), keyboard shortcuts, quiz review, progress dots, locked overlay |
| `.../lessons/[lessonSlug]/loading.tsx` | 22 | Server | Skeleton |
| `.../lessons/[lessonSlug]/error.tsx` | 30 | Client | Error boundary |
| `.../lessons/[lessonSlug]/success/page.tsx` | 433 | Client | Confetti, "What You Covered", next lesson nav |

#### Legal `(legal)/` (3 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 24 | Server | Prose container |
| `privacy/page.tsx` | 149 | Server | Privacy policy |
| `terms/page.tsx` | 159 | Server | Terms of service |

### 8.2 Shared Components (`frontend/components/` — 63 files, ~10,039 LOC)

#### shadcn/ui Primitives (20 files, ~1,515 LOC)
| File | Lines | Purpose |
|---|---|---|
| `ui/accordion.tsx` | 64 | Radix Accordion (animated entry/exit) |
| `ui/button.tsx` | 65 | CVA variants + sizes (xs→icon-lg) |
| `ui/card.tsx` | 66 | Header/Title/Description/Content/Footer |
| `ui/dialog.tsx` | 168 | Radix Dialog, backdrop blur, zoom/fade animation |
| `ui/dropdown-menu.tsx` | 99 | Radix Dropdown, rounded-xl, animated entry/exit |
| `ui/tabs.tsx` | 90 | Radix Tabs, default/line variants |
| `ui/input.tsx` | 24 | Border + focus ring + disabled state |
| `ui/textarea.tsx` | 23 | Min-height, focus ring |
| `ui/select.tsx` | 86 | Radix Select + chevron |
| `ui/label.tsx` | 25 | Radix Label + peer-disabled |
| `ui/avatar.tsx` | 49 | Radix Avatar (Root/Image/Fallback) |
| `ui/badge.tsx` | 49 | CVA variants (default/secondary/destructive/outline) |
| `ui/hover-card.tsx` | 31 | Radix HoverCard, dark blur bg |
| `ui/tooltip.tsx` | 29 | Radix Tooltip + Provider |
| `ui/progress.tsx` | 31 | Radix Progress bar |
| `ui/input-otp.tsx` | 87 | input-otp wrapper, fake caret animation |
| `ui/multi-step-loader.tsx` | 142 | Full-screen animated loader, checkmark icons |
| `ui/learning-card.tsx` | 263 | 3D tactile design, type-based gradients, status badges, hover stats |
| `ui/rating-badge.tsx` | 57 | Filled/half/empty stars, sizes, review count |
| `ui/activity-gauge.tsx` | 98 | Recharts radial gauge, color arcs |

#### Layout & Navigation (1 file)
| File | Lines | Purpose |
|---|---|---|
| `layout/TopNav.tsx` | 344 | Logo, Dashboard/Problems/Learn links (BETA badges), notification bell, avatar menu, XP bar, Google link trigger |

#### Feature Components (12 files)
| File | Lines | Purpose |
|---|---|---|
| `BroadcastBanner.tsx` | 198 | Color-coded, 30s polling, per-user dismiss |
| `FeedbackButton.tsx` | 282 | Floating FAB, 3 tabs, priority selector, screenshot (5MB) |
| `FeedbackButtonWrapper.tsx` | 18 | Route-conditioned FeedbackButton render |
| `GoogleLinkBanner.tsx` | 77 | Amber dismissible banner |
| `LandingContent.tsx` | 141 | Landing page composition |
| `LanguageLogo.tsx` | 32 | Go/Python SVG icon renderer |
| `TestResultPanel.tsx` | 652 | LCS unified diff, circular progress, compiler error tips |
| `PyodideConsole.tsx` | 186 | Terminal-style (#0D0D14), Fira Code, colored output, auto-scroll |
| `ResizableSplitPane.tsx` | 107 | Drag-resizable horizontal split |
| `PyodidePreloader.tsx` | 11 | Eager CDN Pyodide load |
| `DesktopOnlyOverlay.tsx` | 59 | SSR-safe mobile overlay (< 900px), rAF debounced resize, body scroll lock |
| `MultiFileEditor.tsx` | 279 | Tabbed multi-file editor, entry point markers |
| `multi-step-loader-demo.tsx` | 62 | Standalone demo of MultiStepLoader variants |

#### Auth Components (5 files)
| File | Lines | Purpose |
|---|---|---|
| `auth/google-button.tsx` | 102 | GIS button overlay with spinner |
| `auth/bottom-gradient.tsx` | 8 | Hover gradient effect |
| `auth/label-input-container.tsx` | 15 | Form input wrapper |
| `auth/auth-divider.tsx` | 22 | "or continue with" divider |
| `auth/index.ts` | 4 | Barrel re-exports |

#### Base Components (2 files)
| File | Lines | Purpose |
|---|---|---|
| `base/avatar/avatar.tsx` | 115 | 5 sizes, initials fallback, verified gold badge |
| `base/input/pin-input.tsx` | 172 | OTP PIN input, mask mode, shake animation |

#### Learning Components (4 files, ~1,275 LOC)
| File | Lines | Purpose |
|---|---|---|
| `learn/SectionRenderer.tsx` | 342 | Routes 11 section types → sub-renderers, color badges, icons |
| `learn/SectionQuiz.tsx` | 214 | MCQ from JSONB metadata, selection/feedback/retry |
| `learn/SectionExercise.tsx` | 509 | Monaco + PyodideConsole 60/40 split, multi-file, Ctrl+Enter, backend test |
| `learn/LessonSidebar.tsx` | 210 | Progress bar, section nav, prerequisite checklist with locked state |

#### Dashboard Components (1 file)
| File | Lines | Purpose |
|---|---|---|
| `dashboard/ModuleCards.tsx` | 454 | Module grid, WebP images, progress bars, locked padlock overlay, pinned sort |

#### Profile Components (1 file)
| File | Lines | Purpose |
|---|---|---|
| `profile/ProfileHoverCard.tsx` | 153 | XP progress bar, 3-column stats, verified badge |

#### Admin Curriculum Components (5 files)
| File | Lines | Purpose |
|---|---|---|
| `admin/curriculum/AdminCards.tsx` | 473 | 4 card variants (Course/Module/Lesson/Project), CodePen shadow, 16:9, visibility/lock toggles |
| `admin/curriculum/MarkdownPreview.tsx` | 147 | Live GFM preview with custom callout blocks |
| `admin/curriculum/ProblemBank.tsx` | 106 | Searchable problem selector |
| `admin/curriculum/MultiFileConfigPanel.tsx` | 288 | Visual multi-file config for exercises |
| `admin/AIAssistantPanel.tsx` | 845 | AI chat with 8 action types, streaming markdown responses |

#### Application Components (2 files)
| File | Lines | Purpose |
|---|---|---|
| `application/code-snippet/index.tsx` | 314 | Professional Shiki code block, multi-file tabs, copy, collapsed mode |
| `application/code-snippet/code-snippet.story.tsx` | 30 | Standalone storybook-style demo of the code snippet component |

#### Kibo UI (3 files)
| File | Lines | Purpose |
|---|---|---|
| `kibo-ui/code-block/index.tsx` | 480 | Shiki syntax highlighting, diff/highlight/error transforms, dual theme |
| `kibo-ui/code-block/server.tsx` | 52 | Server-side Shiki rendering |
| `kibo-ui/contribution-graph/index.tsx` | 438 | GitHub-style SVG heatmap, month labels, tooltips |

#### Landing Sub-components (6 files)
| File | Lines | Purpose |
|---|---|---|
| `landing/Hero.tsx` | 121 | Animated headline, gradient CTAs, glow orbs |
| `landing/Features.tsx` | 87 | 6 feature cards with stagger animation |
| `landing/Stats.tsx` | 81 | 4 animated counters |
| `landing/HowItWorks.tsx` | 78 | 4-step (Choose-Write-Run-Rank) with connection line |
| `landing/Testimonials.tsx` | 90 | 3-column testimonial cards |
| `landing/Footer.tsx` | 89 | 3 link groups, copyright, tech stack credit |

### 8.3 Custom Hooks (`frontend/hooks/` — 4 files, ~374 LOC)

| File | Lines | Purpose |
|---|---|---|
| `usePyodide.ts` | 179 | Pyodide state hook: ready/loading/error, execute(code), consoleLines (500 cap), clearConsole, loadPackages |
| `use-google-one-tap.ts` | 163 | GIS singleton: init once, prompt + renderButton, ready state |
| `use-mobile.ts` | 22 | `useIsMobile()` with matchMedia listener (768px breakpoint) |
| `use-has-mounted.ts` | 10 | SSR-safe mount detection |

### 8.4 Library Modules (`frontend/lib/` — 19 files, ~3,568 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `api.ts` | 907 | `fetchApi<T>()` (auth+refresh+retry+30s cache), `tryRefreshToken()` (singleton queue), **60+ endpoint functions** covering all backend APIs |
| `types.ts` | 619 | **40+ TypeScript interfaces**: User, Problem, Submission, ExecutionResult, Course, Module, Lesson, Section, QuizMetadata, AllModule, ModuleLock, AdminStats, all New* payload types, ApiResponse<T> |
| `monaco-python.ts` | 496 | Monaco Python IntelliSense language configuration |
| `pyodide.ts` | 234 | `eagerLoadPyodide()`, `executePython(code, timeout?)` (10s), `executeMultiFile(spec)`, CDN v0.27.4 |
| `event.ts` | 136 | `subscribe(type, callback)`, `useWebSocket(handlers, deps)`, 9 event types, auto-reconnect |
| `UserContext.tsx` | 103 | `UserProvider`, `useUser()`, `refreshUser()`, `setPrimaryLanguage()`, WebSocket XP auto-refresh |
| `useNotifications.ts` | 98 | `useNotifications()`, 15s/60s polling, markAsRead (optimistic), markAllAsRead |
| `toast.tsx` | 91 | Sonner toast wrapper: success/error/info/warning, Lucide icons, progress bar |
| `achievements.ts` | 86 | `getAchievements(profile)`, 6 badges (First Blood, Hot Streak, Perfectionist, Speed Demon, Veteran Coder, Completionist) |
| `utils.ts` | 70 | `cn()` (clsx+tailwind-merge), `getUserColor()` (6-color palette), `getDifficultyColor()`, `getDifficultyLabel()`, `seededRandom()` (mulberry32), `shuffleArray()` (Fisher-Yates) |
| `markdown.ts` | 63 | Self-contained markdown renderer (headings, paragraphs, bold/italic/code/links, ul/ol lists) — all inline styles, no CSS dependency |
| `monaco-options.ts` | 63 | Monaco editor default options |
| `monaco-setup.ts` | 65 | Monaco AMD loader config + `initMonacoEditor` (theme, python/go features, TextMate wiring) |
| `monaco-textmate.ts` | 68 | Real TextMate tokenization: Registry + oniguruma WASM, encoded-tokens providers for Go/Python |
| `monaco-format.ts` | 40 | Real formatting: `registerDocumentFormattingEditProvider` (go/python) → `editor.action.formatDocument` via POST /api/format |
| `monaco-theme.ts` | 57 | VS Code Dark+ theme registration (169-rule generated theme + charcoal surfaces) |
| `monaco-intellisense.ts` | 348 | Go static completion + hover providers (25 keywords + predeclared builtins + stdlib modules) |
| `cache.ts` | 41 | `getCache<T>()` / `setCache<T>()` / `clearCache()`, 30s TTL, `kc_` prefix, sessionStorage |
| `index.ts` | 2 | Barrel: cn, getUserColor, getDifficultyColor, getDifficultyLabel |

### 8.5 Styles (`frontend/styles/` + `app/globals.css` — 4 files, ~1,598 LOC)

| File | Lines | Purpose |
|---|---|---|
| `theme.css` | 856 | 857 CSS variables: brand purple palette (950-50), 16 semantic text colors, 7 border colors, 26 bg colors, 15 component tokens, 7 shadow levels, dark mode inversion |
| `typography.css` | 430 | Prose typography: CSS variables mapped to design tokens, h1-h4 sizing, inline code pill, blockquote, responsive md:prose-lg |
| `styles/globals.css` | 96 | Tailwind 4 entry, @tailwindcss/typography, custom variants, scrollbar-hide, caret-blink animation |
| `app/globals.css` | 216 | App-wide base styles |

### 8.6 Frontend Configuration (14 files)

| File | Lines | Purpose |
|---|---|---|
| `package.json` | 69 | 52 runtime + 15 dev dependencies |
| `next.config.ts` | 79 | Strict mode, image remote patterns, security headers |
| `tsconfig.json` | 33 | ES2017 + strict + bundler, 6 path aliases |
| `postcss.config.mjs` | 9 | @tailwindcss/postcss + autoprefixer |
| `eslint.config.mjs` | 12 | Flat config: next + ignores |
| `.eslintrc.json` | 4 | Legacy ESLint config (superseded by flat config) |
| `middleware.ts` | 41 | Edge CSP (Google, Vercel, jsDelivr, blob: workers), HSTS, XFO, XCTO |
| `components.json` | 25 | shadcn/ui config |
| `next-env.d.ts` | 6 | Auto-generated TS declarations |
| `metadata.json` | 6 | Project metadata |
| `scripts/copy-monaco.mjs` | 16 | Copies Monaco worker files into public/ |
| `.env` | 2 | Active vars (API URL + Google client ID) |
| `.env.example` | 8 | Template with all 25+ env vars documented |
| `package-lock.json` | 20,934 | Auto-generated (excluded from tracked LOC) |

---

## 9. Database Migrations (`migrations/` — 51 files, ~27,470 LOC)

### 9.1 Schema Migrations (33 files)

| # | File | Lines | Description |
|---|---|---|---|
| 001 | `001_init.sql` | 77 | Core schema: users, problems, test_cases, submissions, progress (4 FK constraints) |
| 002 | `002_indexes.sql` | 33 | 12 initial performance indexes |
| 003 | `003_activity_logs.sql` | 10 | activity_logs table for admin audit trail |
| 004 | `005_community_contributions.sql` | 35 | user_problems + verified flag on users |
| 005 | `006_notifications.sql` | 14 | notifications table (type, related_id, is_read) |
| 006 | `007_submission_likes.sql` | 12 | submission_likes with UNIQUE(submission_id, user_id) |
| 007 | `008_user_profile.sql` | 4 | bio column on users |
| 008 | `009_get_full_profile.sql` | 167 | PL/pgSQL stored procedure — full profile + DENSE_RANK streak + heatmap |
| 009 | `010_add_gitea_auth.sql` | 5 | **[OBSOLETE]** Gitea OAuth columns (legacy) |
| 010 | `011_add_gitea_token.sql` | 2 | **[OBSOLETE]** Gitea PAT column (legacy) |
| 011 | `012_add_google_auth.sql` | 138 | Google OAuth: google_id, google_email, google_avatar_url, username, email |
| 012 | `013_fix_rank_tiebreaker.sql` | 145 | Rank ordering: xp DESC, solved_count DESC, id ASC |
| 013 | `014_feedback.sql` | 18 | feedback table with type/priority/status CHECK constraints |
| 014 | `015_broadcasts.sql` | 25 | broadcasts + user_broadcast_status (per-user dismissal PK) |
| 015 | `016_add_streak_index.sql` | 3 | Composite submissions index for streak calculation |
| 016 | `017_optimization_indexes.sql` | 26 | 16 performance indexes for production |
| 017 | `020_token_blacklist.sql` | 9 | JWT blacklist (jti PK, ON CONFLICT DO NOTHING) |
| 018 | `021_password_reset.sql` | 11 | password_reset_tokens (SHA-256, 1h expiry) |
| 019 | `022_add_pin_hash.sql` | 2 | pin_hash on users (bcrypt, for PIN recovery) |
| 020 | `023_split_problem_fields.sql` | 9 | constraints + learning_objective columns |
| 021 | `024_add_username_set.sql` | 4 | username_set flag (one-time onboarding guard) |
| 022 | `025_report_issue_fields.sql` | 10 | problem_slug, code_snippet, error_message on feedback |
| 023 | `026_output_logs_ttl.sql` | 7 | output_logs_expires_at (90-day TTL) |
| 024 | `027_language_versions.sql` | 16 | primary_language on users, language_versions JSONB on problems |
| 025 | `028_backfill_language_versions.sql` | 111 | PL/pgSQL: koder_to_snake_case, koder_go_type_to_python — backfill all problems |
| 026 | `029_ensure_language_versions.sql` | 163 | Guarantee ALL problems have Go + Python language_versions entries |
| 027 | `033_add_user_problems_language_versions.sql` | 4 | language_versions JSONB on user_problems |
| 028 | `035_ai_usage_logs.sql` | 12 | ai_usage_logs (tokens, response_time, success, error_message) |
| 029 | `036_refresh_tokens.sql` | 9 | refresh_tokens (token_hash UNIQUE, revoked, rotation) |
| 030 | `038_curriculum_cms.sql` | 169 | 8 CMS tables + 11-value ENUM + 14 indexes |
| 031 | `044_add_module_locked.sql` | 5 | locked BOOLEAN on modules (curriculum gating) |
| 032 | `045_add_module_locks.sql` | 5 | module_locks table (problem category locking) |
| 033 | `047_add_param_names.sql` | 17 | param_names TEXT[] on problems for descriptive parameter names in scaffold generation |

### 9.2 Seed Data Migrations (17 files)

| # | File | Lines | Problems | Module(s) |
|---|---|---|---|---|
| 034 | `019_seed_problems1.sql` | 2,380 | 45 | math-recursion, arrays-strings, data-structures |
| 035 | `019_seed_problems2.sql` | 2,360 | 45 | bit-manipulation, sorting-searching, pointers |
| 036 | `019_seed_problems3.sql` | 1,576 | 30 | error-handling, interfaces-generics |
| 037 | `019_seed_problems4.sql` | 3,162 | 60 | hashmaps-sets, linked-lists, trees-graphs, dynamic-programming |
| 038 | `031_python_intermediate_seed.sql` | 751 | 10 | python-intermediate |
| 039 | `032_python_variables_math_seed.sql` | 174 | 1 | python-variables-math |
| 040 | `034_python_arrays_strings_seed.sql` | 627 | 7 | python-arrays-strings |
| 041 | `037_seed_go_fundamentals.sql` | 513 | 5 | go-fundamentals |
| 042 | `039_seed_curriculum.sql` | 589 | N/A | 5 courses, 20+ modules, 60+ lessons |
| 043 | `040_complete_curriculum_content.sql` | 1,745 | N/A | Full sections, quizzes, exercises for all lessons |
| 044 | `041_seed_python_mastery.sql` | 1,992 | N/A | Python Mastery course (4 modules, 14 lessons) |
| 045 | `042_seed_python_mastery_games.sql` | 1,347 | N/A | Games course (2 modules, 6 lessons, 1 project) |
| 046 | `043_seed_python_mastery_practice.sql` | 1,434 | 30 | python-practice (difficulty 1-5, Python-only) |
| 047 | `046_module_meta.sql` | 37 | N/A | module_meta seed for 26 modules (display_name, is_pinned) |
| 048 | `047_seed_python_practicals.sql` | 1,095 | 25 | python-practicals seed: full INSERTs with 5–7 test cases each, module_meta for python-practice + python-practicals |
| 049 | `048_seed_ai_fluency.sql` | 3,140 | N/A | ai-fluency course seed: 13 modules, lessons with problem references, sections, projects |
| — | `049_refresh_ai_fluency.sql` | 3,223 | N/A | **[UPDATE-mode]** idempotent ai-fluency content refresh — in-place UPDATEs preserve user progress; sections/projects/deps re-inserted |
| — | `999_seed_python_test.sql` | 62 | 1 | py-double-it (pipeline verification) |
| **Total seeded** | | | **259 problems** | **16+ modules** |

---

## 10. Database Schema (25 Tables)

### 10.1 Core Tables (6)

| Table | PK | Key Columns |
|---|---|---|
| `users` | `id UUID` | username, email, password (bcrypt), role, xp, pin_hash, google_id, verified, username_set, color_index, primary_language |
| `problems` | `id UUID` | slug UNIQUE, module, title, statement, func_name, hints, difficulty, xp_reward, visible, source_hash, constraints, learning_objective, language_versions JSONB, param_names TEXT[] |
| `test_cases` | `id UUID` | problem_id FK, input JSONB, expected, is_hidden, ordinal, UNIQUE(problem_id, ordinal) |
| `submissions` | `id UUID` | user_id FK, problem_id FK, code, status, passed_count, total_count, output_logs (90d TTL) |
| `progress` | `(user_id, problem_id)` | solved, stars (3/2/1), attempts, best_runtime, xp_awarded |
| `activity_logs` | `id` | type, message, color, icon |

### 10.2 Secondary Tables (11)

| Table | PK | Purpose |
|---|---|---|
| `user_problems` | `id UUID` | Community contributions: status (pending/approved/rejected), language_versions JSONB |
| `notifications` | `id UUID` | User alerts: type, message, related_id, is_read, 50-count unread limit |
| `submission_likes` | `id` | UNIQUE(submission_id, user_id) |
| `feedback` | `id UUID` | type/general/bug/feature, priority, status, screenshot, admin_notes |
| `broadcasts` | `id UUID` | type, priority, title, message, action_label/url, active |
| `user_broadcast_status` | `(user_id, broadcast_id)` | Dismissal tracking |
| `token_blacklist` | `jti TEXT` | JWT revocation, ON CONFLICT DO NOTHING |
| `password_reset_tokens` | `token_hash TEXT` | Email reset, 1h expiry |
| `refresh_tokens` | `id UUID` | token_hash UNIQUE, revoked (rotation) |
| `ai_usage_logs` | `id UUID` | action, tokens, response_time_ms, success, error_message |
| `module_locks` | `module_name TEXT` | Problem category locking |

### 10.3 Curriculum CMS Tables (8)

| Table | PK | Key Columns |
|---|---|---|
| `courses` | `id UUID` | slug UNIQUE, difficulty_level (1-5), estimated_hours, visible=false |
| `modules` | `id UUID` | UNIQUE(course_id, slug), locked=false, visible=false |
| `lessons` | `id UUID` | UNIQUE(module_id, slug), problem_references TEXT[], estimated_minutes, xp_reward, visible=false |
| `lesson_dependencies` | `(lesson_id, depends_on_lesson_id)` | CHECK no self-ref |
| `lesson_sections` | `id UUID` | section_type ENUM (11 types), metadata JSONB, order_number |
| `projects` | `id UUID` | UNIQUE(lesson_id, slug), requirements, starter_code, hints TEXT[] |
| `course_progress` | `(user_id, course_id)` | progress_pct REAL (0-100), started_at, completed_at |
| `lesson_progress` | `(user_id, lesson_id)` | completed, xp_awarded, completed_at |

---

## 11. Core Pipelines

### 11.1 Ingest (Admin-Triggered)

```
POST /admin/ingest { repo_url }
  → git clone --depth 1 (or sparse checkout for subpath URLs)
  → Walk /exercises/** for README.md files
  → SHA256 hash for idempotency check (skip if unchanged)
  → Extract: slug, module, type, raw_readme
  → INSERT/UPDATE INTO problems (visible=false)
```

### 11.2 Enrich (Admin-Triggered, Rate-Limited)

```
POST /admin/enrich (single) | POST /admin/enrich-all (batch)
  → Fetch problems needing enrichment (source_hash mismatch or null statement)
  → NVIDIA NIM API call (DeepSeek V4 Flash, 3-retry exp backoff: 2s/4s/8s)
  → System prompt enforces dual-language JSON output (Go + Python in language_versions)
  → Strip markdown fences, extract first {...} JSON block
  → Validate: title, func_name (Go), 3 hints, 5+ test cases, difficulty 1-5, XP > 0
  → Auto-generate Python entries via toSnakeCase()/toPythonType() if AI omits them
  → Upsert enriched problem + test cases in single transaction
  → Minimum 1s gap between requests (mutex-enforced)
```

### 11.3 Execute (Student-Triggered)

```
POST /submit {problem_slug, code, language} (5 req/45s per user, admin bypass)
  → Solved guard (409 ALREADY_SOLVED if progress.solved = true)
  → Acquire semaphore slot (buffered chan, cap=6) — blocks if full
  → Load problem + test_cases from DB
  → Resolve language-specific metadata from LanguageVersions JSONB
  → Route to Go or Python pipeline:

  Go:  → formatGoLiteral() for test inputs → main_test.go via text/template
       → Write solution.go (force package koder) + go.mod
  Python: → formatPythonLiteral() (null→None, bool→True/False)
          → Write solution.py + run_tests.py

  → Execute: remote sandbox (HTTP POST, 3 retries, 2ⁿ×500ms backoff) OR local Docker
  → Parse GOT/WANT regex output (5 patterns, state machine)
  → Classify: passed/failed/compiler_error/timeout
  → Record submission + UpsertProgress (pg_advisory_xact_lock for race prevention)
  → Publish WebSocket events: user.xp.updated, progress.updated
  → Return ExecutionResult with per-test-case diff
```

---

## 12. API Endpoints (~118 Total)

### 12.1 Auth (15 endpoints, IP-rate-limited: 10 req/min)

| Method | Path | Handler | File |
|---|---|---|---|
| POST | `/auth/register` | Register | `auth.go` |
| POST | `/auth/login` | Login (3-field lookup) | `auth.go` |
| POST | `/auth/google` | GoogleAuth (JWKS) | `auth.go` |
| POST | `/auth/complete-onboarding` | CompleteOnboarding | `auth.go` |
| POST | `/auth/link-google` | LinkGoogle | `auth.go` |
| POST | `/auth/forgot-password` | ForgotPassword | `password_reset.go` |
| POST | `/auth/reset-password` | ResetPassword | `password_reset.go` |
| POST | `/auth/forgot-password-pin` | ForgotPasswordPin | `pin_reset.go` |
| POST | `/auth/reset-password-pin` | ResetPasswordPin | `pin_reset.go` |
| POST | `/auth/change-password` | ChangePassword | `change_password.go` |
| POST | `/auth/verify-pin` | VerifyPin | `change_password.go` |
| POST | `/auth/set-pin` | SetPin | `change_password.go` |
| POST | `/auth/refresh` | RefreshToken | `auth.go` |
| POST | `/auth/logout` | Logout | `auth.go` |
| GET | `/auth/check-username` | CheckUsername | `auth.go` |

### 12.2 User (9 endpoints, authenticates)

| Method | Path | Handler | File |
|---|---|---|---|
| GET | `/me` | GetMe | `me.go` |
| PUT | `/me/username` | SetUsername | `me.go` |
| PUT | `/me/language` | UpdateLanguage | `me.go` |
| POST | `/me/delete-account` | DeleteAccount | `me.go` |
| GET | `/me/export-data` | ExportData | `me.go` |
| GET | `/me/profile` | GetProfile | `profile.go` |
| PUT | `/me/profile` | UpdateProfile | `profile.go` |
| GET | `/me/activity` | GetActivity | `activity.go` |
| GET | `/me/contributions` | GetMyContributions | `contributions.go` |

### 12.3 Problems & Submissions (4 endpoints)

| Method | Path | Handler | File |
|---|---|---|---|
| GET | `/problems` | ListVisibleProblems | `problems.go` |
| GET | `/problems/:slug` | GetProblemBySlug | `problems.go` |
| POST | `/submit` | Submit | `submissions.go` |
| POST | `/test` | Test | `test.go` |

### 12.4 Community (5 endpoints)

| Method | Path | Handler | File |
|---|---|---|---|
| GET | `/problems/:slug/community-solutions` | GetCommunitySolutions | `community.go` |
| GET | `/best-practices` | GetBestPractices | `community.go` |
| POST | `/submissions/:id/like` | LikeSubmission | `community.go` |
| DELETE | `/submissions/:id/like` | UnlikeSubmission | `community.go` |
| POST | `/user-problems` | PostContribution | `contributions.go` |

### 12.5 Feedback, Broadcasts, Notifications (13 endpoints)

| Method | Path | Handler | File |
|---|---|---|---|
| POST | `/feedback` | Submit | `feedback.go` |
| GET | `/feedback/mine` | ListMine | `feedback.go` |
| GET | `/notifications` | GetUnread | `notifications.go` |
| GET | `/notifications/recent` | GetRecent | `notifications.go` |
| POST | `/notifications/read-all` | MarkAllAsRead | `notifications.go` |
| POST | `/notifications/:id/read` | MarkAsRead | `notifications.go` |
| GET | `/me/broadcasts` | ListActive | `broadcasts.go` |
| POST | `/me/broadcasts/:id/dismiss` | Dismiss | `broadcasts.go` |
| GET | `/me/module-locks` | inline | `router.go` |
| GET | `/me/module-meta` | inline | `router.go` |

### 12.6 Leaderboard & Users (2 endpoints)

| Method | Path | Handler | File |
|---|---|---|---|
| GET | `/leaderboard` | GetLeaderboard | `leaderboard.go` |
| GET | `/users/{id}` | GetUserPublicData | `users.go` |

### 12.7 Curriculum CMS — Student (6 endpoints)

| Method | Path | Handler | File |
|---|---|---|---|
| GET | `/learn/courses` | ListPublishedCourses | `cms.go` |
| GET | `/learn/courses/{courseSlug}` | GetCourseDetail | `cms.go` |
| GET | `/learn/courses/{courseSlug}/modules/{moduleSlug}` | GetModuleDetail (403 LOCKED) | `cms.go` |
| GET | `/learn/courses/.../lessons/{lessonSlug}` | GetLessonDetail (prereq check) | `cms.go` |
| POST | `/learn/lessons/{lessonId}/complete` | CompleteLesson (XP + WS) | `cms.go` |
| GET | `/learn/progress` | GetAllProgress | `cms.go` |

### 12.8 Admin (32+ endpoints)

| Method | Path | Handler | File |
|---|---|---|---|
| POST | `/admin/ingest` | Ingest | `admin.go` |
| POST | `/admin/enrich` | Enrich | `admin.go` |
| POST | `/admin/enrich-all` | EnrichAll | `admin.go` |
| POST | `/admin/ai/assist` | AIAssist (8 actions, 15 req/60s) | `admin.go` |
| GET | `/admin/ai/usage` | GetAIUsage | `admin.go` |
| GET | `/admin/stats` | GetAdminStats | `admin.go` |
| GET | `/admin/activity` | GetAdminActivity | `admin.go` |
| GET | `/admin/problems` | ListAllProblems | `admin.go` |
| PATCH | `/admin/problems/{id}/visibility` | ToggleVisibility | `admin.go` |
| PUT | `/admin/problems/{id}` | UpdateProblem (16 fields) | `admin.go` |
| POST | `/admin/problems/publish-all` | PublishAllDrafts | `admin.go` |
| GET | `/admin/user-problems/pending` | ListPending | `admin.go` |
| PATCH | `/admin/user-problems/{id}/approve` | ApproveUserProblem | `admin.go` |
| PATCH | `/admin/user-problems/{id}/reject` | RejectUserProblem | `admin.go` |
| GET | `/admin/users/search` | SearchUsers | `admin.go` |
| PATCH | `/admin/users/{id}/verified` | ToggleUserVerified | `admin.go` |
| GET | `/admin/module-locks` | ListProblemModuleLocks | `admin.go` |
| POST | `/admin/module-locks/{moduleName}` | ToggleProblemModuleLock | `admin.go` |
| DELETE | `/admin/problem-modules/{moduleName}` | DeleteProblemModule | `admin.go` |
| GET | `/admin/module-meta` | ListModuleMeta | `admin.go` |
| PUT | `/admin/module-meta` | UpsertModuleMeta | `admin.go` |
| PATCH | `/admin/module-meta/{name}` | SetModulePin | `admin.go` |
| GET | `/admin/all-modules` | ListAllModules | `admin.go` |
| GET/POST | `/admin/courses` | ListAll/Create | `cms.go` |
| PUT/DELETE | `/admin/courses/{id}` | Update/Delete | `cms.go` |
| PATCH | `/admin/courses/{id}/visibility` | ToggleCourseVisibility | `cms.go` |
| GET/POST | `/admin/courses/{id}/modules` | List/Create | `cms.go` |
| PUT/DELETE | `/admin/modules/{id}` | Update/Delete | `cms.go` |
| PATCH | `/admin/modules/{id}/visibility` | ToggleModuleVisibility | `cms.go` |
| PATCH | `/admin/modules/{id}/lock` | ToggleModuleLock | `cms.go` |
| GET/POST | `/admin/modules/{id}/lessons` | List/Create | `cms.go` |
| PUT/DELETE | `/admin/lessons/{id}` | Update/Delete | `cms.go` |
| PATCH | `/admin/lessons/{id}/visibility` | ToggleLessonVisibility | `cms.go` |
| PUT | `/admin/lessons/{id}/dependencies` | UpdateDependencies | `cms.go` |
| POST | `/admin/lessons/{id}/problems` | LinkProblemToLesson | `cms.go` |
| GET/POST | `/admin/lessons/{id}/projects` | List/Create | `cms.go` |
| PUT/DELETE | `/admin/projects/{id}` | Update/Delete | `cms.go` |
| PATCH | `/admin/projects/{id}/visibility` | ToggleProjectVisibility | `cms.go` |
| GET/POST | `/admin/lessons/{id}/sections` | List/Create | `cms.go` |
| PUT/DELETE | `/admin/sections/{id}` | Update/Delete | `cms.go` |
| PUT | `/admin/lessons/{id}/sections/reorder` | ReorderSections | `cms.go` |
| GET/PATCH | `/admin/feedback` / `/{id}` | List/Update | `feedback.go` |
| GET | `/admin/feedback/counts` | Counts | `feedback.go` |
| GET | `/admin/problem-reports` | ListProblemReports | `feedback.go` |
| GET | `/admin/broadcasts` | ListAll | `broadcasts.go` |
| POST | `/admin/broadcasts` | Create | `broadcasts.go` |
| PATCH | `/admin/broadcasts/{id}/deactivate` | Deactivate | `broadcasts.go` |
| PATCH | `/admin/broadcasts/{id}/activate` | Activate | `broadcasts.go` |
| DELETE | `/admin/broadcasts/{id}` | Delete | `broadcasts.go` |

### 12.9 WebSocket & Utility (3 endpoints)

| Method | Path | Handler | File |
|---|---|---|---|
| GET | `/ws` | WebSocket (gorilla + broker) | `ws.go` |
| GET | `/health` | inline | `router.go` |
| POST | `/api/format` | Format (auth; gofmt in-process / black via sandbox) | `format.go` |

---

## 13. Real-Time Events (Broker + WebSocket — 9 Event Types)

| Event Type | Source | Consumers |
|---|---|---|
| `user.xp.updated` | Submit handler, CompleteLesson | UserContext (auto-refresh XP/level) |
| `progress.updated` | Submit handler | WebSocket clients |
| `lesson.completed` | CompleteLesson handler | WebSocket clients, progress caches |
| `admin.problem.updated` | Admin handlers (visibility, update) | Connected admin pages |
| `admin.broadcast.created/updated/deleted` | Broadcast CRUD | BroadcastPanel, active clients |
| `admin.feedback.submitted` | Feedback Submit | Admin dashboards |
| `admin.publish-all` | PublishAllDrafts | Problem list caches |

---

## 14. CI/CD Pipeline (`.github/workflows/ci.yml`)

| Job | Triggers | Commands |
|---|---|---|
| **backend** | Push/PR to main, staging | `go vet ./internal/...` → `go test ./internal/... -count=1 -timeout 120s -v` → `go build ./cmd/server` → sandbox vet/test/build |
| **frontend** | Push/PR to main, staging | `npm ci` → `npm run lint` → `npx tsc --noEmit` → `npm run build` |

---

## 15. Testing Strategy (14 test files, ~3,170 LOC, 136 tests)

| Package | Test File | Tests |
|---|---|---|
| `internal/api` | `middleware_test.go` (618 LOC) | 23 |
| `internal/api` | `problems_test.go` (35 LOC) | 1 |
| `internal/api` | `responses_test.go` (214 LOC) | 9 |
| `internal/auth` | `auth_test.go` (209 LOC) | 15 |
| `internal/auth` | `oauth_test.go` (111 LOC) | 5 |
| `internal/broker` | `broker_test.go` (186 LOC) | 10 |
| `internal/config` | `config_test.go` (355 LOC) | 24 |
| `internal/enricher` | `enricher_test.go` (231 LOC) | 4 |
| `internal/executor` | `executor_test.go` (533 LOC) | 16 |
| `internal/parser` | `parser_test.go` (346 LOC) | 13 |
| `internal/store` | `errors_test.go` (102 LOC) | 7 |
| `internal/store` | `types_test.go` (47 LOC) | 2 |
| `internal/store` | `users_test.go` (154 LOC) | 4 |
| `sandbox` | `security_message_test.go` (32 LOC) | 3 |
| **Total** | **14 files (~3,170 LOC)** | **136 tests** |

---

## 16. Architecture Decision Records

| ADR | Decision | Rationale |
|---|---|---|
| ADR-001 | Monolithic Go backend | Single binary; no orchestration overhead for small cohort |
| ADR-002 | Raw pgx/v5 over ORM | Predictable SQL, smaller footprint, explicit query design |
| ADR-003 | Docker subprocess for execution | gVisor unavailable on free-tier hosts; WASM immature for Go |
| ADR-004 | System prompt JSON (NVIDIA NIM) | DeepSeek V4 Flash doesn't support `response_format` reliably |
| ADR-005 | Go text/template for test gen | Type-safe conditional logic; auditable independently |
| ADR-006 | Remote HTTP Sandbox (Azure Container Apps, was Fly.io) | Eliminates Docker-in-Docker; consistent isolation, faster cold start |
| ADR-007 | NVIDIA NIM (DeepSeek V4 Flash) single provider | Free-tier API; consolidated from dual-provider (Gemini+Groq) |
| ADR-008 | `language_versions` JSONB | Single column for multi-language schema; avoids EAV antipattern |
| ADR-009 | In-memory cache over Redis | Zero-cost; 30s TTL sufficient for leaderboard/profile |
| ADR-010 | Pyodide CDN over server-side Python | Zero-cost browser-side execution; singleton loader prevents duplicates |
| ADR-011 | Per-language localStorage (`koder_code_{slug}_{lang}`) | Save & switch between Go/Python scaffolds |
| ADR-012 | Bulk lesson dependency via `ANY($1)` | Single query; avoids N+1 per-lesson |
| ADR-013 | Client-side dependency locking | No extra backend calls; instant UI feedback |
| ADR-014 | Separate module lock systems | Curriculum `locked` column vs problem `module_locks` table |
| ADR-015 | pg_advisory_xact_lock for progress race prevention | Prevents XP double-award without table-level locks |
| ADR-016 | Self-contained markdown renderer (no react-markdown) | Eliminates `@tailwindcss/typography` dependency; deterministic styling |

---

## 17. Key Metrics

| Metric | Value |
|---|---|
| **Go source files** | 69 (62 backend + 7 sandbox) |
| **Go LOC** | ~22,478 (18,093 backend source + 3,141 backend test + 1,157 sandbox source + 32 sandbox test + 55 Dockerfile/fly.toml) |
| **Go test files** | 14 (~3,170 LOC, 136 tests) |
| **Frontend TSX/TS files** | 156 (~31,143 LOC) |
| **Total tracked source LOC** | ~106,000 |
| **API endpoints** | ~118 |
| **Database tables** | 25 |
| **Database indexes** | ~60 |
| **Seed problems** | ~259 (180 Go, 53 Python, 25 Python-practicals, 1 pipeline) |
| **Middleware chain depth** | 11 (including rate limiters) |
| **WebSocket event types** | 9 |
| **Curriculum lessons** | ~200+ across 6 courses |
| **Curriculum section types** | 11 (ENUM) |
| **AI assist actions** | 8 |
| **shadcn/ui primitives** | 20 |
| **Custom components** | 43 |
| **External Go deps** | 7 |
| **Sandbox external deps** | 0 (stdlib only) |
| **Module WebP images** | 18 |
| **Monaco worker files** | ~113 |

---

## 18. Known Issues & Stale Documentation

1. **`.github/copilot-instructions.md`** — References Gemini genai SDK (removed), httpOnly cookies (JWT in localStorage), semaphore cap=2 (now 6), timeout 5s (now 30s), Docker memory 64m (now 256m). Needs full rewrite.
2. **`@tanstack/react-virtual`** — Listed in `frontend/package.json` but unused. Should be removed.
3. **Session log duplication** — `.opencode/session-log.md` (44 lines) is stale; canonical log is `SESSION_LOG.md` (2,528 lines).
4. **`sandbox/secure_unix.go`** — `resourceLimits` uses raw numeric values for `RLIMIT_NPROC` (6) instead of `syscall.RLIMIT_NPROC`. Works on linux/amd64 but brittle.
5. **`forcePackageKoder` regex duplication** — `packageRegexp` pattern duplicated in both `sandbox/runtest_go.go` (`\w+`) and `internal/executor/sandbox.go` (`[a-zA-Z0-9_]+`). Functionally identical but diverges.
6. **`@google/genai` dep** — Listed in `go.mod` (indirect) but may be unused after NVIDIA NIM migration.
7. **Empty `docs/` subdirectories** — `docs/adr/` and `docs/diagrams/` are placeholders with no content.
8. **Migration gap** — Migration numbers jump from 017 to 019 (no 018), and from 029 to 033 (no 030-032). Not harmful but breaks sequential readability.
9. **`CODEBASE_INDEX.md`** — Superseded by this file (`CLAUDE.md`). Kept as a redirect pointer for existing references; will be removed in a future cleanup.
10. **`sandbox/sandbox-runner` binary (9.4 MB)** — Tracked in git. Should be in `.gitignore` for a Go project.
11. **Root data files (JSON, SQL)** — 28 files (~12,678 LOC) tracked in the root directory, including problem JSONs, rollback/update SQL, and curriculum JSONs. Consider subdirectory organization.
12. **`.bak` file tracked** — `041_seed_python_mastery.sql.bak` (658 lines) tracked in git under `migrations/`. Should be removed.
13. **`.next/trace` tracked** — Build artifact committed to git under `.next/`. Should be in `.gitignore`.
14. **`docs/adr/` and `docs/diagrams/`** — Empty placeholder directories with zero content.
15. **`react-markdown`, `remark-gfm`, `rehype-raw`, `rehype-sanitize`, `remark-breaks`** — Listed in `package.json` runtime deps but superseded by self-contained `renderMarkdown()` in `lib/markdown.ts`. Should be removed.
16. **Pyright Python autocomplete deferred** — `monaco-pyright-lsp` (webpack-bundled pyright WASM worker, pyodide-based) is the prescribed upgrade for type-aware Python completions/diagnostics, but was deliberately skipped in Session 99. Risks to resolve before adopting: ~10–20MB WASM worker download on first Python editor mount, possible Next.js webpack/dual-monaco (AMD vs ESM) conflicts, and a worst case where pyright requires `crossOriginIsolated` (COOP/COEP headers on Vercel) that could break Google Identity / Pyodide CDN loading. Current Python completions remain the static 157-entry list in `lib/monaco-python.ts`.
17. **`session-log.md` line count** — `SESSION_LOG.md` has grown to ~2,700+ lines (canonical log, kept whole; the git table at the top is chronological and updated per session).

---

## 19. Production Deployments

| Branch | Frontend (Vercel) | Backend API (Render) | Sandbox (Azure Container Apps, live) |
|---|---|---|---|
| **main** | `https://koder.sbs` | `https://api.koder.sbs` | `https://koder-sandbox.ashysmoke-c753df92.westeurope.azurecontainerapps.io` |
| **staging** | `https://staging.koder.sbs` | `https://stagingapi.koder.sbs` | `https://koder-sandbox.ashysmoke-c753df92.westeurope.azurecontainerapps.io` |
| **update** | `https://update.koder.sbs` | shares staging | shares staging |

> **Azure Container Apps is live (2026-07-31):** sandbox deployed on ACA
> consumption plan — resource group `koder-sandbox`, environment `sandbox-env`,
> app `koder-sandbox` (0.5 vCPU/1.0Gi, scale min 1 / max 4, HTTPS → port 8080,
> `SANDBOX_RATE_LIMIT_PER_MIN=60`), pulling the public GHCR image
> `ghcr.io/jerryjuche/koder-sandbox`. Set
> `SANDBOX_URL=https://koder-sandbox.ashysmoke-c753df92.westeurope.azurecontainerapps.io`
> on Render for each branch (`PYTHON_SANDBOX_URL` stays empty — single var
> covers both languages). Deploy scripts/manifest: `sandbox/azure/`; runbook:
> `docs/azure-sandbox-deploy.md`. Rollback: `cd sandbox && fly deploy`
> (Fly.io `https://koder-sandbox.fly.dev` preserved) + clear `SANDBOX_URL`.
> Always-warm via `minReplicas: 1` (~$18–22/mo) means the first submission is
> fast with no cold start; `SANDBOX_REQUEST_TIMEOUT_EXTRA_SECONDS` (default 20)
> only absorbs brief revision churn. Revert to scale-to-zero ($0 + cold start)
> by setting `MIN_REPLICAS=0`.

### Required Backend Environment
```bash
ENVIRONMENT=production
FRONTEND_URL=https://koder.sbs
ALLOWED_ORIGINS=https://koder.sbs,https://staging.koder.sbs,https://update.koder.sbs,http://localhost:3000
```

### Required Frontend Environment
```bash
NEXT_PUBLIC_API_URL=https://api.koder.sbs    # or https://stagingapi.koder.sbs
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-client-id>
```

---

## 20. Session Log (Recent)

### 2026-08-01 — Session 99: Real formatting (gofmt + pinned black) via POST /api/format
- **Sandbox `POST /format`** (`sandbox/format.go`, 96 LOC): pipes Python source through pinned `black==25.1.0` (`black -q -`, 30s timeout) → `{formatted, error}`; empty → empty; route added next to `/execute`; Dockerfile installs black via `py3-pip` so output is byte-stable across image rebuilds
- **`executor.FormatCode`** (`internal/executor/format.go`, 53 LOC): Go formatted **in-process** with `go/format.Source()` (gofmt canonicalizer, no new dep); Python → sandbox `/format` via new `sandboxClient.format()` (same 3-attempt exp-backoff as execute, tolerates ACA cold starts); parse failures typed as `*FormatSyntaxError`
- **`POST /api/format`** (`internal/api/format.go`, 73 LOC): auth-required, `code ≤ 50KB`; syntax error → 422, sandbox unreachable → 502 friendly, success → `{formatted}`; registered in authenticated group (256KB body limit, no tight per-user rate limiter)
- **Frontend** `lib/monaco-format.ts` (40 LOC): `registerDocumentFormattingEditProvider` for Go/Python → `editor.action.formatDocument` (Shift+Alt+F); `lib/api.ts` `formatCode()`; workspace Ctrl+S button calls `/api/format` (async) with local `indentCode` fallback only on NETWORK_ERROR — syntax errors toast and never rewrite the buffer
- **Go completions:** added `complex`, `imag`, `real`, `print`, `println` to `GO_STATIC_COMPLETIONS` (+ gopls-over-WASM upgrade note)
- **Tests:** sandbox 5 (black-gated), executor 7 (incl. stub-signature regression guard), api 6 (via scriptable `Formatter` interface); full `go test ./internal/...` green; lint/tsc 0 errors
- **Deployment:** Python formatting needs republished sandbox image (black + `/format`) + ACA redeploy; until then workspace degrades to local indenter (Go works immediately — in-process)

### 2026-08-01 — Session 98: Phase 1 complete — real TextMate tokenization (Dark+ fidelity)
- **Exact VS Code Dark+ tokenization for Go + Python** via vscode-textmate + vscode-oniguruma wired into Monaco's binary token path — pixel-identical to VS Code
- `frontend/lib/monaco-textmate.ts` (new, 67 LOC): `Registry({ onigLib, loadGrammar })` → `setTheme(rawTheme, null)` → `monaco.languages.setColorMap(registry.getColorMap())` → `setTokensProvider("python"|"go", { getInitialState, tokenizeEncoded })`; routes through Monaco's `EncodedTokenizationSupportAdapter` (verified in AMD source) so vscode-textmate color ids render directly against the registry color map
- `frontend/scripts/build-monaco-assets.mjs`: emits 4 tracked artifacts — `lib/dark-plus-theme.generated.json` (Monaco theme), `lib/dark-plus-textmate.generated.json` (raw `IRawTheme` with prepended scope-less default rule `#D4D4D4`/`#1E1E1E` so uncolored tokens inherit Dark+ editor.foreground instead of vscode-textmate's `#000000` fallback), `lib/grammars/python.tmLanguage.json` (MagicPython), `lib/grammars/go.tmLanguage.json`; vendored sources under `scripts/vendor/` stay gitignored build inputs
- `frontend/lib/monaco-theme.ts`: consumes 169-rule/28-color generated Dark+ theme, keeps charcoal widget surfaces (Sessions 95–97) as `CHARCOAL_SURFACES` overrides
- `frontend/scripts/copy-monaco.mjs`: copies onig.wasm → `public/vs/onig.wasm` unconditionally
- `frontend/types/vscode-textmate.d.ts` + `vscode-oniguruma.d.ts` (new): ambient re-exports (packages ship `.d.ts` but no `types` field)
- **Runtime-safety:** both CJS packages have `__esModule: true` with no `.default` — namespace imports (`import * as tm`) required, default imports would resolve to `undefined`
- Verified: Node e2e probe (Registry → tokenizeLine2 → `(meta >>> 15) & 0x1ff` → colorMap) produces exact Dark+ colors for all token classes incl. `#4FC1FF` Go consts and plain-source `List` in imports (matches real MagicPython); colorMap[1] = #D4D4D4 after default-rule fix; Monaco AMD `setColorMap`/`setTokensProvider`/`tokenizeEncoded` present; ESLint 0 errors, `tsc --noEmit` 0 errors, `next build` success

### 2026-08-01 — Session 97: Neutralize residual blue-tinted chrome + Monaco tints
- Follow-up to Session 96: neutralized the remaining cool blue-gray grays that clashed with the neutral `#141414` charcoal
- `frontend/lib/monaco-theme.ts` — 12 supporting tints → neutral: selection `#3A3A4A→#3D3D3D`, inactive selection `#2E2E3E→#2E2E2E`, indent guides `#2A2A3A→#2A2A2A` + `#3A3A50→#3A3A3A`, widget borders `#33334A→#333333` ×4, line numbers `#555568→#565656`, scrollbar `#33334A55→#33333355` + `#44445F88→#44444488`
- Chrome surfaces: google-button (`#1C1C28→#1C1C1C`, `#2A2A3A→#2A2A2A`, `#252535→#252525`), hover-card (`#1C1C28→#1C1C1C`), DesktopOnlyOverlay (`#0D0D14→#0D0D0D`, `#2A2A3A→#2A2A2A` ×3), error boundaries ×2 (`#0A0A0F→#0A0A0A`), workspace editor toolbar (`#0F1115→#121212` ×2)
- Kept intentionally dark: code/console surfaces (workspace code preview `#0F1115`/`#0A0C0F`/`#050608`, PyodideConsole `#0D0D14`, admin previews `#0d1117`/`#161b22`, success tint `#1A2521`)
- Verified: grep sweep clean, ESLint 0 errors, `tsc --noEmit` 0 errors, `next build` success

### 2026-08-01 — Session 96: Neutral charcoal theme retune (#141414)
- Retuned the entire charcoal palette to neutral gray, removing the blue-violet cast of `#1A1A24`: base `#141414`, panel `#191919`, card `#1E1E1E`, sidebar `#111113` (hover/border rgba unchanged)
- `frontend/app/globals.css` — 17 lines: `@theme` `--color-brand-charcoal-{base,card,panel}` + `:root`/`.dark` shadcn vars (`--background`, `--card`, `--popover`, `--primary-foreground`, `--secondary`, `--accent`, `--sidebar`)
- `frontend/lib/monaco-theme.ts` — 7 editor surface colors aligned to panel/card (`editor.background`/`SuggestWidget`/`HoverWidget`/`Gutter`, `lineHighlight`/`Widget`/`input`)
- Swapped 16 hard-coded palette literals for `brand-charcoal-*` tokens across 11 component files (profile, achievements, activity feed, contribution graph, avatar, CodeEditor, DesktopOnlyOverlay)
- `frontend/styles/theme.css` — mapped dark `--color-bg-*` off Tailwind `neutral-*` → `brand-charcoal-*` tokens (file orphaned/never imported; future-proofing only)
- Intentionally left unchanged: near-black code/console surfaces (`#0D0D0D`, `#0F1115`, `#0A0C0F`, `#050608`, `#0D0D14`)
- Verified: ESLint 0 errors, `tsc --noEmit` 0 errors, `next build` success

### 2026-08-01 — Session 95: Docs + session-log sync for Azure sandbox go-live
- Synced the canonical `SESSION_LOG.md` logbook — appended Sessions 90–94 (CLAUDE.md numbering) that post-dated its last entry (Session 88) with an alignment note for the 85–88 consolidation
- Updated `CLAUDE.md` inventory for the cold-start commit `6b576dd`: sandbox total ~1,233 → ~1,244 LOC (`Dockerfile` 19 → 30, baked Go cache), `config.go` 350 → 366 (33 fields), `config_test.go` 352 → 355, `sandbox_client.go` 166 → 170, executor 1,801 → 1,805, Go LOC ~22,444 → ~22,478
- Added `SANDBOX_REQUEST_TIMEOUT_EXTRA_SECONDS` (default 90) + cold-start timing note to §19; bumped "Last indexed" to 2026-08-01
- Verified: `go vet` clean (backend + sandbox), 8/8 backend suites + sandbox suite passing, `go build ./cmd/server` + sandbox OK
- Pushed to `origin/update`

### 2026-08-01 — Session 94: Sandbox cold-start reliability at $0 (scale-to-zero retained)
- Root-caused a real production bug: the first Go submission after ~5 min idle **failed** (backend client timeout `30s + 10 = 40s` < ACA cold start ~30–60s + first `go test` compile ~23s = 53–83s)
- Decoupled the sandbox HTTP client timeout from the execution timeout — new `SANDBOX_REQUEST_TIMEOUT_EXTRA_SECONDS` (default **90**) covers scale-to-zero cold starts while `timeout_sec` (30s Go / 60s Python) still hard-caps student code runs (`sandbox_client.go`, `executor.go` ×3 call sites, `config.go`)
- Raised `http.Server` read/write/idle timeouts 60s → 180s so `WriteTimeout` cannot kill a cold-start request (`cmd/server/main.go`)
- Baked the Go build cache into the sandbox image using the runner's exact `-gcflags=-l`/env flags → cold-container first compile drops ~23s → ~2s (`sandbox/Dockerfile`); validated locally: warmup compile clean, a separate module reuses the cache in ~1s
- Added a default-assertion test for `SandboxRequestTimeoutExtra` (`config_test.go`)
- Verified: `go vet` clean (backend + sandbox), 8/8 backend suites + sandbox suite passing, `go build ./cmd/server` + sandbox OK
- **Cold-path expectation at $0:** first submission after idle ≈35s and succeeds; every subsequent submission <2s

### 2026-07-31 — Session 93: Azure Container Apps sandbox go-live
- Merged `3123b73` (Azure migration) to `staging` via PR #170 (`2a906bf`); CI + sandbox-publish workflow passed
- `sandbox-publish.yml` builds/pushes `ghcr.io/jerryjuche/koder-sandbox:latest` + `:sha-2a906bfb934f` (public) — **image only, no Azure resources**
- Deployed via `sandbox/azure/deploy.sh --yes` in Azure Cloud Shell: RG `koder-sandbox`, env `sandbox-env`, app `koder-sandbox` (0.5 vCPU/1.0Gi, min 0/max 4, HTTPS→8080, rate limit 60/min)
- **Actual FQDN:** `https://koder-sandbox.ashysmoke-c753df92.westeurope.azurecontainerapps.io` (ACA assigns a random environment suffix — the docs' predicted `sandbox-env.westeurope` URL is NOT used)
- Verified from repo root: `/health` ok, `/version` = commit `2a906bf`, `/execute` Python passed (71ms), Go passed (717ms warm / ~23s first compile on 0.5 vCPU)
- Updated `CLAUDE.md` §19 + `docs/azure-sandbox-deploy.md` + `README.md` with the live URL (Fly.io preserved as rollback)
- **Next:** set `SANDBOX_URL` on Render (staging + main) and test a real Go + Python submission end-to-end

### 2026-07-31 — Session 92: Professional codebase reindex — full verified audit
- Full automated audit: `go vet` (12/12 root packages + sandbox = 13 clean), `go test` (10/10 suites, 136 tests, zero failures), ESLint 0 errors, `tsc --noEmit` 0 errors, sandbox `go build` + `go test` clean
- Verified Go backend: 62 source + 13 test files, 21,211 LOC (18,073 source + 3,138 test) — api 7,009, store 6,398, executor 1,801, enricher 942, auth 364, config 350, parser 371, broker 68 + 4 cmd tools 770
- Verified Go sandbox: 7 source + 1 test + Dockerfile + fly.toml, 1,233 LOC, zero external deps
- Verified frontend: 160 source files, 32,741 LOC (73 app pages 17,718 + 1 CSS 216, 63 components 10,039, 4 hooks 374, 16 lib 3,012, 4 styles 1,598)
- Verified migrations: 51 files (27,470 LOC) — 33 schema + 17 seed/content + 1 content-refresh (`049_refresh_ai_fluency.sql`, 3,223 LOC, new)
- Verified docs: 17 files (9,143 LOC), scripts: 7 files (904 LOC), config/build: 14 files (699 LOC)
- Root data: 28 files (12,678 LOC); total tracked source: ~362 files, ~106,000 LOC
- Added migration `049_refresh_ai_fluency.sql` to index; corrected seeded-problem total to 259 (INSERT INTO problems)
- Fixed per-file LOC across all inventory tables; added new components (multi-step-loader-demo, code-snippet.story), `.eslintrc.json`, `scripts/copy-monaco.mjs`, `fly.toml`
- Known Issues: removed #13 (`server.exe`/`main.exe` no longer tracked), added `.next/trace` tracked (new #13)

### 2026-07-26 — Session 80: Professional codebase reindex — accurate file counts and LOC
- Audited all 294+ source files across Go backend (59 source, 17,306 LOC), sandbox, frontend (73 app, 60 components, 18 lib/hooks), migrations (47), docs (6), scripts (6)
- Updated CLAUDE.md with verified counts: backend 17,306 LOC (was ~15,500), tests 3,135 LOC (was ~3,535), lib 2,458 LOC (was ~2,906), migrations 47 (was 46)
- Fixed documentation count: 6 files, 5,639 LOC (was 14 files, ~12,000)
- Updated Key Metrics section: 66 Go source files, ~21,630 total Go LOC, ~71,000 total tracked source

### 2026-07-24 — Session 79: Leaderboard tiebreaker + codebase index consolidation
- Leaderboard ties broken by most recent passing submission time DESC (weekly, monthly, all-time)
- Added LEFT JOIN subquery for latest_submission_at, ORDER BY updated with NULLS LAST
- Consolidated CODEBASE_INDEX.md into redirect pointer to CLAUDE.md

### 2026-07-24 — Session 78: Problem card polish — larger text, rendered markdown
- Title: `text-sm font-bold` → `text-base font-extrabold md:text-lg tracking-tight`, gold on hover
- Description: replaced regex-stripped text with `renderMarkdown()` via `dangerouslySetInnerHTML`
- **Inline style fix:** `renderMarkdown()` injected `style="..."` attributes that overrode card Tailwind — stripped via `.replace(/\sstyle="[^"]*"/g, '')`
- All text sizes bumped: difficulty `text-[10px]`→`text-[11px]`, tags `text-[10px]`→`text-xs`, footer `text-[11px]`→`text-xs`, icons `size={11}`→`size={13}`
- Card base: added `shadow-sm`, hover `hover:shadow-xl hover:shadow-primary/8`, lift `hover:-translate-y-1.5`
- Grid gap `gap-5`→`gap-6`, spacing adjustments

### 2026-07-24 — Session 77: PixelSnow WebGL experiment (reverted)
- Added `three@0.185.1`, created `PixelSnow.tsx` with Three.js snowflake shader
- Tried root layout (`z-10`), then main layout (`z-0`) — didn't fit brand
- **Reverted entirely** — component deleted, deps uninstalled, layouts restored

### 2026-07-23 — Session 76: Data reset script for testing
- `scripts/reset_data.sql` clears `submissions`, `submission_likes`, `feedback`, `activity_logs` only
- Preserves accounts, XP, progress, problems, curriculum

### 2026-07-23 — Session 75: Desktop-only overlay for mobile screens
- `DesktopOnlyOverlay.tsx` — SSR-safe mobile overlay (< 900px), rAF debounced resize, body scroll lock
- Uses `useState(false)` for SSR safety (no `next/dynamic`)
- Static import in root layout

### 2026-07-23 — Session 74: Register single-step + concurrency fix
- `tryRefreshToken` missing `isRefreshing = true;` caused concurrent refresh → token revoked → sign-out
- Register page simplified to single-step (name/email/password), redirects to `/onboarding`
- 466 → 291 lines

### 2026-07-23 — Session 70: Problem edit dialog UX polish
- **ProblemEditPanel:** Expanded from `max-w-3xl` to `max-w-5xl`, tightened spacing between fields, enlarged statement textarea, compact footer with save/cancel buttons side by side
- **Delete orphan module_meta:** Fixed `DeleteProblemModule` to also delete `module_meta` entry — prevented orphan rows from re-appearing in admin UI after deletion

### 2026-07-23 — Session 69: Admin module management redesign — auto-discover new modules
- **Backend:** New `GET /admin/all-modules` endpoint returns `SELECT DISTINCT p.module` from problems, COALESCEd with `module_meta`, joined with `module_locks`, UNION for orphans (5 files: `types.go`, `store.go`, `module_meta.go`, `admin.go`, `router.go`)
- **Frontend:** `AllModule` type, `fetchAllModules()`, redesigned Problem Module Locks panel with shadcn Tabs (Go/Python) + grid of module cards, Curriculum Module Locks with collapsible courses, Module Settings with inline rename/pin toggle

### 2026-07-22 — Session 68: Locked modules sort to bottom
- `ModuleCards.tsx`: Locked modules always sort after all unlocked modules (pinned unlocked → alpha unlocked → pinned locked → alpha locked)

### 2026-07-22 — Session 67: Admin preview markdown fix
- Extracted `renderMarkdown()`, `inlineMd()`, `escapeHtml()` into shared `frontend/lib/markdown.ts`
- Admin ProblemEditPanel Preview now renders markdown + examples section (was raw text)

### 2026-07-22 — Session 66: Seeded shuffle + filter bar redesign + beta gate
- `seededRandom()` (mulberry32 PRNG) + `shuffleArray()` (Fisher-Yates) per UUID for consistent ordering
- Filter bar redesigned: top-mounted card vs sidebar, Status/Difficulty Select dropdowns, XP range inputs, active filter chips
- `/problems` page BETA-gated behind admin-only (same pattern as Learn + Best Practices)

### 2026-07-22 — Session 65: Dashboard nav correct + scrollable success
- Changed nav refresh to `window.dispatchEvent(new Event("user-updated"))` — triggers dashboard's 300ms debounced re-fetch
- Success page code previews: removed collapse/expand, use `max-h-[220px] overflow-y-auto`

### 2026-07-22 — Session 64: Config test fixes + global rank fix
- `loadEnvFile()` skips `.env` during tests (checks `os.Args[0]` for `.test` suffix)
- Config test 3 missing-var tests clear CI env vars
- Global rank display: removed duplicate `#` prefix (Hash icon already serves as symbol)

### 2026-07-22 — Session 63: ESLint fixes + staging CI/CD + branch rename
- Fixed 6 ESLint errors: key-based re-mount in ProblemEditPanel, URL-based initial state in home/page.tsx, key={lessonSlug} for LessonViewerClient remount
- Added `update` branch to CI triggers

### 2026-07-22 — Session 62: Middleware auth redirect fix
- Removed auth redirect guard from `frontend/middleware.ts` — cookie lives on API domain, not frontend
- Auth remains client-side via UserContext 401 fallback

### 2026-07-22 — Session 61: Locked module count fix + community solutions
- Added `Locked bool` to Problem struct; SQL includes `EXISTS (SELECT 1 FROM module_locks WHERE module_name = p.module) AS is_locked`
- ModuleCards derive correct progress counts from ALL problems (including locked)
- Community solutions: removed `AND EXISTS (submission_likes)` — solutions with 0 likes now surface; cards now auto-height with collapse

### 2026-07-22 — Session 60: Self-contained markdown renderer
- Removed `react-markdown` / `remark-gfm` — replaced with `renderMarkdown()` + `inlineMd()` in `frontend/lib/markdown.ts`
- All styling via inline `style=` attributes — deterministic, no `@tailwindcss/typography` dependency
- Fixes problem statement rendering (Tailwind CSS 4 + prose incompatibility)

---

### 2026-07-27 — Session 81: Professional codebase reindex — verified file counts and LOC
- Audited all 300+ source files across Go backend (59 source, 17,453 LOC), sandbox (8 source, 1,197 LOC), frontend (73 app, 61 components, 18 lib/hooks), migrations (49), docs (6), scripts (7)
- Updated CLAUDE.md with verified counts: backend 17,453 LOC (was ~17,306), tests 3,115 LOC (was ~3,135), frontend app 17,400 LOC (was ~17,177), components 61 files 9,978 LOC (was 60, ~9,927), config 10 files (was 12), migrations 49 (was 48), docs 5,691 LOC (was 5,639)
- Fixed sandbox count: 8 source files, 1,197 LOC (was 7, ~1,157)
- Fixed Key Metrics: Go LOC ~21,798 (was ~21,630), frontend TSX/TS ~30,256 LOC (was ~24,800)
- Total tracked source: ~300 files, ~72,000 LOC (was ~294, ~71,000)

### 2026-07-27 — Session 82: param_names scaffold generation
- Added `param_names TEXT[]` column to problems schema (migration `047_add_param_names.sql`, 16 lines)
- Updated all problem SQL queries to include param_names — scaffold uses real names not arg1/arg2
- Backend: `problems.go` (ListProblemWithTestCases), `admin.go` (UpdateProblem), `enricher.go` (param_names in generation) — 5 files total

### 2026-07-27 — Session 83: Professional OG metadata with module images
- Added Open Graph / Twitter Card meta tags to root layout, per-problem pages
- `frontend/app/layout.tsx` — og:image, twitter:card, theme-color, module-specific preview images
- `frontend/app/problems/[slug]/page.tsx` — per-problem OG metadata with module-specific WebP images

### 2026-07-27 — Session 84: Learn UI 3D tactile redesign + quiz/prerequisite overhaul
- Complete overhaul of course/module/lesson pages with 3D tactile design system
- `learning-card.tsx` (379→258 LOC): redesigned with depth, shadows, and type-based gradients
- `SectionQuiz.tsx` (109→195 LOC): redesigned MCQ with dynamic feedback and review mode
- `LessonSidebar.tsx` (196→210 LOC): prerequisite locking visualization, collapsible sections
- `LessonViewerClient.tsx` (606→630 LOC): AnimatePresence transitions, keyboard shortcuts
- `courses/page.tsx` (285→315 LOC): LearningCard grid with difficulty pills and gradient heroes
- Backend: curriculum.go — filter deleted problem references at DB level using problem_references cleanup; middleware.go — optional auth bypass for problem details

### 2026-07-27 — Session 85: python-practicals seed + migration generator + fix stale scaffold
- `migrations/047_seed_python_practicals.sql` (1,095 LOC): 25 problems with 5–7 test cases each
- `scripts/generate-practicals-migration.mjs` (478 LOC): automated migration generator for practicals
- Scaffold generation: auto-detect stale arg1/arg2 scaffolds and replace with real param_names on load
- Fixed `ProblemWorkspaceClient.tsx` — clears sessionStorage cache before problem fetch, preserves tokens on transient server errors

### 2026-07-29 — Session 86: Professional codebase reindex
- Audited all 308+ source files: Go backend (61 source, 17,646 LOC), sandbox (7 source + Dockerfile, 1,176 LOC), frontend (73 app, 61 components, 18 lib/hooks, 3 styles), migrations (49, 21,112 LOC), docs (6, 5,695 LOC), scripts (7, 904 LOC), config (14, 596 LOC)
- Updated CLAUDE.md with verified counts across all sections
- Added `047_add_param_names.sql` to schema migrations (33 total schema, 16 seed)
- Added `param_names TEXT[]` to `problems` schema documentation
- Updated Key Metrics: Go LOC ~21,817, frontend TSX/TS ~30,303, total ~81,800
- Added session logs for Sessions 82–85
- Fixed sandbox, cmd tools, and frontend component line counts to match current files

### 2026-07-29 — Session 87: Locked-module problems filtered from workspace and listings
- Backend: `internal/api/problems.go` — filters locked problems from response for non-admin users
- Frontend workspace: `ProblemWorkspaceClient.tsx` — `nextProblem` scans past locked items
- Frontend success page: `success/page.tsx` — next-problem logic excludes `p.locked`
- Frontend problems listing: `problems/page.tsx` — `!p.locked` filter added
- Defense-in-depth: home page already had `p.locked` guard (now redundant but harmless)

### 2026-07-29 — Session 88: Remove Learning Progress section from dashboard
- Removed entire "Learning Progress" section (courses grid) from `/home` — courses have dedicated `/learn/courses`
- Cleaned up dead imports: `useWebSocket`, `fetchProgress`, `CourseProgressEntry`
- Removed `courseProgress` state, `progRes` from Promise.all, WebSocket event handlers
- File: 917→831 lines

### 2026-07-29 — Session 89: Enable Python IntelliSense in problem workspace editor
- Changed 7 disabled Monaco editor options to enable: auto-closing brackets/quotes, quick suggestions, snippet suggestions, trigger characters, accept-on-Enter, parameter hints, suggest selection
- Switched theme from `"vs-dark"` to `"vs-dark-plus"` (custom theme with richer token colors)
- Added `registerVSCodeDarkPlusTheme` import and `onMount` call
- Now matches the Learn section editors (`MultiFileEditor`, `SectionExercise`)

---

### 2026-07-30 — Session 90: Professional codebase reindex — all MD files read, accurate LOC verified
- Read and catalogued all 17 markdown files across the repository
- Discovered 4 new docs: `docs/curriculum.md` (937 LOC), `docs/ai-curriculum-prompt.md` (387 LOC), `courses.md` (607 LOC), `rephrase-review.md` (393 LOC)
- Discovered new CLI tool: `cmd/generate-curriculum/main.go` (280 LOC) — reads AI JSON, writes curriculum SQL
- Discovered new migration: `048_seed_ai_fluency.sql` (1,995 LOC, ~30 problems)
- Updated total counts: 366 tracked source files, ~89,700 total LOC across all categories
- Updated all section headers with verified file counts and LOC
- Added Known Issues #10 (sandbox-runner binary tracked) and #11 (root data file organization)
- Verified working tree clean on `update` branch with `git status`

### 2026-07-31 — Session 91: Professional codebase reindex — all Go/frontend files verified
- Full automated audit: `go vet` (10/10 packages clean), `go test` (9/9 suites passing), `tsc --noEmit` (0 errors), ESLint (0 errors)
- Verified Go backend: 62 source + 14 test files, ~18,518 LOC (15,784 source + 2,734 test)
- Verified Go sandbox: 7 source + 1 test + 1 Dockerfile, ~1,052 LOC, zero external deps
- Verified frontend: 159 files, ~30,238 LOC (73 app pages, 63 components, 20 lib/hooks, 3 styles)
- Verified migrations: 50 files (~20,431 LOC) — 32 schema + 18 seed
- Verified docs: 17 files (~8,377 LOC), scripts: 7 files (~817 LOC), config: 14 files (~581 LOC)
- Updated root data file count: ~29 files (~10,315 LOC) tracked at root
- Total tracked: ~376 files, ~90,300 LOC
- Fixed API route count: 118 (was ~89), Store interface methods: 152 (was ~125)
- Added Known Issues #12–15 (`.bak` file, `.exe` binaries, empty `docs/` dirs, unused markdown deps)

---

*Last indexed: 2026-07-31 | Branch: `update` | Pre-verified: `go vet` clean (13/13 packages incl. sandbox), 10/10 Go test suites passing (136 tests, zero failures), ESLint 0 errors, `tsc --noEmit` 0 errors | Working tree: clean*