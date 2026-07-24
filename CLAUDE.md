# Koder — Professional Codebase Index

> Zero-cost, production-grade automated code-grading platform for Go & Python curricula.
> Students solve problems in a Monaco editor workspace, submit code, receive instant pass/fail results with diff output. AI (NVIDIA NIM / DeepSeek V4 Flash) enriches raw problem specs into structured test cases. Runs entirely on free-tier infrastructure.
>
> **Branch:** `update` | **Last indexed:** 2026-07-24 | **Verified:** `go vet` clean, 126+ Go tests passing, ESLint 0 errors, `tsc --noEmit` 0 errors

---

## 1. Project Overview

| Field | Value |
|---|---|
| **Repository** | `github.com/jerryjuche/koder` |
| **Purpose** | Self-hosted automated programming assignment grader for Go & Python |
| **Budget** | $0/month (Oracle Ampere A1 + Supabase Free + Vercel Hobby + Railway Starter) |
| **Stack** | Go 1.26 (chi/v5, pgx/v5) + Next.js 15 (React 19, Tailwind CSS 4) + PostgreSQL 15 + NVIDIA NIM (DeepSeek V4 Flash) |
| **Sandbox** | Standalone Go binary, zero external dependencies, Railway-hosted |

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Go 1.26, chi/v5 router, pgx/v5 | HTTP server, routing, middleware, database access |
| **Database** | PostgreSQL 15 (Supabase), pgx/v5 | Raw SQL, connection pooling (10 max, SimpleProtocol for PgBouncer) |
| **Auth** | golang-jwt/v5 (HS256), bcrypt (cost=12), Google Identity Services | JWT tokens with rotation, password hashing, OAuth |
| **AI** | NVIDIA NIM (DeepSeek V4 Flash) | Test case generation + 8-action admin AI assist |
| **Execution** | Remote sandbox (Railway) + local Docker fallback | Isolated `go test` / `python3` execution, semaphore=6 |
| **Real-time** | gorilla/websocket, in-memory pub/sub | Live XP/progress/broadcast WebSocket events |
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4 | App Router, server components, shadcn/ui, Monaco Editor |
| **Client Python** | Pyodide v0.27.4 (CDN) | In-browser Python playground & lesson exercises |

---

## 3. Repository Statistics (Verified: 2026-07-24)

| Category | Files | Lines of Code | Notes |
|---|---|---|---|
| **Go Backend** (`cmd/` + `internal/`) | 60 source + 13 test | ~15,500 + ~3,535 | 8 packages, ~125 Store interface methods, ~89 API endpoints |
| **Go Sandbox** (`sandbox/`) | 7 source + 1 test | ~1,157 + ~32 | Zero external deps, 10-layer defense-in-depth |
| **SQL Migrations** (`migrations/`) | 46 | ~20,000 | 32 schema + 14 seed, ~25 tables |
| **Frontend App** (`app/`) | 74 `.tsx` | ~17,177 | 7 route groups, all with loading + error boundaries |
| **Frontend Components** (`components/`) | 60 | ~9,835 | 19 shadcn/ui + 41 custom |
| **Frontend Lib/Hooks** (`lib/`, `hooks/`) | 18 | ~2,906 | 60+ API functions, 40+ TS interfaces, 4 hooks |
| **Frontend Styles/Config** | 15 | ~1,646 | theme.css (856 vars), typography.css (430 lines), 12 config files |
| **Documentation** | 14 | ~12,000 | CLAUDE.md, README.md, SESSION_LOG.md, PLAN.md, etc. |
| **Scripts** | 6 | ~450 | data reset, build cache, seed transform, curriculum cleanup |
| **Config/Build** | 12 | ~700 | go.mod, Procfile, build.sh, CI, env |
| **Total (tracked source)** | **~300** | **~68,000** | Source code + migrations + docs |

---

## 4. Repository Structure

```
koder/
├── cmd/server/main.go                       # Entry point (125 lines)
├── internal/
│   ├── api/              (27 files, 7,743 LOC)  # HTTP handlers, middleware, WebSocket, test endpoint
│   ├── store/            (24 files, 6,668 LOC)  # Database access layer — pgx/v5, 125+ Store methods
│   ├── executor/         (7 files, 2,334 LOC)   # Code execution engine, sandbox orchestration, output parsing
│   ├── enricher/         (2 files, 1,169 LOC)   # AI test generation — NVIDIA NIM (DeepSeek V4 Flash)
│   ├── auth/             (5 files, 684 LOC)     # JWT (HS256), Google OAuth (JWKS), bcrypt
│   ├── broker/           (2 files, 254 LOC)     # In-memory pub/sub (cap 32, non-blocking)
│   ├── parser/           (2 files, 717 LOC)     # GitHub YAML curriculum parser
│   └── config/           (2 files, 702 LOC)     # Env var loader (32+ vars, fails-fast validation)
├── sandbox/              (8 files, 1,189 LOC)   # Remote execution service — zero external deps
├── frontend/
│   ├── app/              (74 .tsx, ~17,177 LOC) # App Router pages (7 route groups)
│   ├── components/       (60 files, ~9,835 LOC) # Shared components + shadcn/ui primitives
│   ├── hooks/            (4 files, ~374 LOC)    # usePyodide, useGoogleOneTap, useHasMounted, useMobile
│   ├── lib/              (14 files, ~2,906 LOC) # API client, types, cache, event bus, markdown, pyodide
│   └── styles/           (3 files, ~1,364 LOC)  # theme.css (856 var tokens), typography.css (430 lines)
├── migrations/           (46 files, ~20,000 LOC) # Full schema + seed data — 25 tables
├── scripts/              (6 files)              # reset_data.sql, transform-seeds.mjs, setup-docker-cache.sh
├── docs/                                        # curriculum-schema-for-ai.md, learn-ui-redesign-prompt.md
├── .github/workflows/ci.yml                     # 2-job CI: backend + frontend
└── build.sh                                     # Cross-compile ARM64 deployment script (15 lines)
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
| 4 — Container | Docker/Railway | `--network=none`, minimal capabilities, 256MB memory limit, 30s timeout |

---

## 6. Go Backend — Complete File Inventory

### 6.1 Entry Point

| File | Lines | Package | Purpose |
|---|---|---|---|
| `cmd/server/main.go` | 125 | `main` | Bootstrap: LoadConfig → NewPostgresStore → NewExecutor → NewBroker → NewRouter → http.ListenAndServe → graceful shutdown (10s deadline), `-ldflags` for commit/build time |

### 6.2 API Handlers (`internal/api/` — 27 files, 7,743 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `router.go` | 296 | `App` struct, `NewRouter()` (~89 routes), `Shutdown()` |
| `middleware.go` | 511 | 11 middleware functions, `GetClaims(ctx)`, `GetRequestID(ctx)` |
| `auth.go` | 605 | `AuthHandler` — Register, Login (3-field), GoogleAuth (JWKS), CompleteOnboarding, LinkGoogle, RefreshToken (rotation), Logout, CheckUsername |
| `admin.go` | 879 | `AdminHandler` — Ingest, Enrich, EnrichAll, AIAssist (8 actions), GetAdminStats, GetAIUsage, ListAllProblems, ToggleVisibility, UpdateProblem, PublishAllDrafts, Approve/Reject contributions, SearchUsers, ToggleUserVerified, ListModuleMeta, UpsertModuleMeta, SetModulePin, ListAllModules, List/Toggle ProblemModuleLocks, DeleteProblemModule |
| `cms.go` | 1,419 | `CMHandler` — 6 student routes (ListPublishedCourses, GetCourseDetail, GetModuleDetail, GetLessonDetail, CompleteLesson, GetAllProgress) + 22 admin routes (full CRUD for courses/modules/lessons/sections/projects/dependencies) |
| `me.go` | 360 | `MeHandler` — GetMe (cached 30s), SetUsername (one-time 403), UpdateLanguage, DeleteAccount (cascade), ExportData (JSON) |
| `change_password.go` | 266 | `ChangePasswordHandler` — SetPin, VerifyPin (5/15min rate-limit), ChangePassword |
| `pin_reset.go` | 257 | `PINResetHandler` — ForgotPasswordPin (email+PIN → short-lived JWT), ResetPasswordPin (domain-separated HMAC-SHA256) |
| `password_reset.go` | 255 | `PasswordResetHandler` — ForgotPassword (Resend API, always-ok), ResetPassword (SHA-256 token) |
| `broadcasts.go` | 237 | `BroadcastsHandler` — ListActive, Dismiss (student); ListAll, Create, Deactivate, Activate, Delete (admin) |
| `feedback.go` | 345 | `FeedbackHandler` — Submit (10MB, screenshot, Resend + in-app notification), ListMyFeedback, ListAdmin (status filter), Counts, UpdateStatus, ListProblemReports |
| `problems.go` | 156 | `ProblemHandler` — ListVisibleProblems (LATERAL JOIN, locked-module stamping), GetProblemBySlug (403 MODULE_LOCKED) |
| `submissions.go` | 168 | `SubmissionHandler` — Submit (5/45s ratelimit, scoring, WS events: `user.xp.updated` + `progress.updated`) |
| `profile.go` | 257 | `ProfileHandler` — GetProfile (stored proc, 30s cache), UpdateProfile |
| `test.go` | 132 | `TestHandler` — Direct test case execution without scoring |
| `activity.go` | 54 | `ActivityHandler` — GetActivity (contribution heatmap by year) |
| `notifications.go` | 115 | `NotificationsHandler` — GetUnread (50), GetRecent (20), MarkRead, MarkAllRead |
| `community.go` | 139 | `CommunityHandler` — GetCommunitySolutions, GetBestPractices, LikeSubmission, UnlikeSubmission |
| `contributions.go` | 85 | `ContributionsHandler` — PostContribution (verified_contributor+), GetMyContributions |
| `leaderboard.go` | 40 | `LeaderboardHandler` — GetLeaderboard (?period=, 30s cache) |
| `users.go` | 33 | `UsersHandler` — GetUserPublicData |
| `ws.go` | 75 | `WSHandler` — WebSocket upgrade (gorilla), broker subscribe/unsubscribe, write pump (30s pong) |
| `cache.go` | 132 | Generic TTL cache (30s): `userCache`, `profileCache`, `leaderboardCache`, `problemsCache` + `StopCaches()` |
| `responses.go` | 95 | `APIError`, `APIResponse`, `RespondSuccess`/`Created`/`Error`, `SetAuthCookie`/`ClearAuthCookie` |

### 6.3 Store Layer (`internal/store/` — 24 files, 6,668 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `store.go` | 285 | `Store` interface (~125 methods), `PostgresStore` struct, `NewPostgresStore` (MaxConns=10, MinConns=2, 30m lifetime, SimpleProtocol) |
| `types.go` | 646 | ~50 structs: User, Problem, Submission, Progress, TestCase, Feedback, Broadcast, Notification, Course, Module, Lesson, LessonSection, Project, LanguageSpec, ModuleMeta, ModuleLock, RefreshToken, AIUsageStats, AdminStats, LeaderboardEntry, FlexibleBool, FlexibleStrings, GoogleUserInfo |
| `users.go` | 1,358 | 30+ functions: CreateUser (bcrypt cost 12), GetUserByLogin (3-field), GetLeaderboard (period, top 100), CalculateStreak (gaps-and-islands DENSE_RANK), CompleteUserOnboarding (atomic tx), DeleteAccount (cascade) |
| `problems.go` | 803 | 12+ functions: ListVisibleProblems (LATERAL JOIN, `NOT EXISTS` + `EXISTS` locking), UpsertEnrichedProblem (tx), UpdateProblem (16 fields, merge semantics) |
| `curriculum.go` | 1,137 | 30+ functions: Full CMS CRUD for courses/modules/lessons/sections/projects + dependency management + progress tracking (UpsertCourseProgress, UpsertLessonProgress with GREATER NEVER DECREASE) |
| `user_problems.go` | 358 | CreateUserProblem, ListPending, Approve (5-step tx with FOR UPDATE), Reject, generateDualLanguageSpec, pascalToSnake, goTypeToPython |
| `submissions.go` | 228 | CreateSubmission (90d TTL), GetProblemWithTestCases (JOIN), GetRecentSubmissionForProblem |
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

### 6.4 Auth (`internal/auth/` — 5 files, 684 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `jwt.go` | 120 | `Claims` struct, `SignToken` (HS256, 7 args), `ValidateToken`, `GenerateRefreshToken` (32-byte crypto/rand), `SHA256Hash` |
| `oauth.go` | 216 | `VerifyGoogleIDToken` (JWKS fetch + 1h cache, RSA key reconstruction, audience/issuer/email check) |
| `password.go` | 28 | `HashPassword` (bcrypt cost=12), `ComparePassword` |
| `auth_test.go` | 209 | 15 tests: JWT sign/verify, bcrypt hash/compare |
| `oauth_test.go` | 111 | 5 tests: audience/issuer validation, JWKS key round-trip |

### 6.5 Enricher (`internal/enricher/` — 2 files, 1,169 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `enricher.go` | 938 | `Enricher` struct, `NewEnricher`, `EnrichProblem` (NVIDIA NIM, dual-language prompts, 1s rate-limit), `AIAssistProblem` (8 action types), `toSnakeCase`, `toPythonType`, `validateEnrichedProblem` (14 checks), `cleanResponse` (markdown fence stripping), `normalizeTestCaseInput` |
| `enricher_test.go` | 231 | 4 tests: toSnakeCase (10 cases), toPythonType (13 mappings), cleanResponse (5 cases), validateEnrichedProblem (11 sub-tests) |

### 6.6 Executor (`internal/executor/` — 7 files, 2,334 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `executor.go` | 1,314 | `Executor` (semaphore=6), `Execute` (scoring), `ExecuteVisibleOnly` (test-only), `formatGoLiteral` (recursive), `formatPythonLiteral` (null→None), `goToSnakeCase`, `EnhancePythonError`, `parseCompilerError` (3-pass) |
| `parser.go` | 111 | `ParseTestOutput` — 5 regex patterns, state machine for GOT/WANT multi-line parsing |
| `templates.go` | 104 | `mainTestTemplate` (Go: `==` / `reflect.DeepEqual`), `pythonTestTemplate` (Python: `json.loads`) |
| `sandbox.go` | 72 | `PrepareSandbox` (temp dir, go.mod, solution.go, main_test.go, forcePackageKoder regex) |
| `sandbox_client.go` | 166 | `SandboxRequest/Response`, HTTP client (3 retries, exp backoff 2ⁿ×500ms), `FormatFriendlySandboxError` |
| `types.go` | 34 | `ExecutionRequest`, `ExecutionResult`, `TestResult` |
| `executor_test.go` | 533 | 16 tests: literal formatting, template rendering, output parsing (all-pass, mixed, multi-line, errors), Python pipeline |

### 6.7 Broker (`internal/broker/` — 2 files, 254 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `broker.go` | 68 | `Event` struct, `Broker` (sync.RWMutex + map of cap-32 channels), `New`, `Subscribe` (UUID), `Unsubscribe`, `Publish` (non-blocking), `PublishEvent` |
| `broker_test.go` | 186 | 10 tests: subscribe uniqueness, delivery (1/M), overflow (cap 32), concurrent (10 goroutines) |

### 6.8 Parser (`internal/parser/` — 2 files, 717 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `parser.go` | 371 | `Parser` struct, `RawProblem`, `IngestGitHubRepo` (clone + sparse checkout, SHA-256 idempotency), `ParseProblem`, `normalizeSlug`, `normalizeModule`, `cleanRepoURL` |
| `parser_test.go` | 346 | 13 tests: isReadmeFile, detectProblemType, normalizeSlug, computeSourceHash, URL parsing (HTTPS+SSH) |

### 6.9 Config (`internal/config/` — 2 files, 702 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `config.go` | 350 | `Config` struct (32 fields), `Load()` — env + .env file, fails-fast validation (JWT_MIN_LENGTH=32, port 1-65535) |
| `config_test.go` | 352 | 15 tests: missing vars, invalid port, environment validation |

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

## 7. Sandbox (`sandbox/` — 8 source files, 1,189 LOC, Zero External Dependencies)

| File | Lines | Purpose |
|---|---|---|
| `main.go` | 388 | HTTP server on `:$PORT` — `/health`, `/version`, `/execute`; language dispatcher; `classifyOutput` (4 regex patterns); `compileErrorMessage` (3-pass) |
| `pyrunner.go` | 265 | Python runner: 2-layer security (regex + AST via subprocess), `findPythonBin` (python3→python), `cappedBuffer` (64KB), OOM detection |
| `runtest_go.go` | 148 | Go runner: go.mod, solution.go (forced `package koder`), `go test -v -count=1 -gcflags=-l`, `GOPROXY=off`, `GOTOOLCHAIN=local` |
| `ratelimit.go` | 156 | Per-IP sliding window (10 req/min), 429 Retry-After, 5min cleanup goroutine |
| `secure.go` | 111 | 14 Go dangerous patterns (cgo, os/exec, syscall, unsafe), 17 Python dangerous patterns (os, subprocess, socket, eval) |
| `secure_unix.go` | 64 | Setpgid isolation, setrlimit (NPROC=6, NOFILE=1024, FSIZE=64MB, RLIMIT_AS=512MB), killProcessGroup (SIGKILL), reapProcess (5s) |
| `secure_other.go` | 25 | No-op stubs for non-Unix (Windows) |
| `Dockerfile` | 19 | 2-stage ARM64 build based on `golang:1.26-alpine`, includes python3 |

---

## 8. Frontend — Complete File Inventory

### 8.1 App Router Pages (`frontend/app/` — 74 `.tsx` files, ~17,177 LOC)

#### Root (4 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 41 | Server | Dark mode, Inter+Fira Code fonts, Sonner Toaster, Vercel Analytics, DesktopOnlyOverlay |
| `page.tsx` | 85 | Client | Loading guard → fetchUser → MultiStepLoader → `/home` or `/landing` |
| `not-found.tsx` | 70 | Client | Animated 404 with Terminal icon, Home + Go Back |
| `global-error.tsx` | 33 | Client | 500 error boundary with reset button |

#### Landing & OAuth (2 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `landing/page.tsx` | 5 | Server | Renders `<LandingContent />` |
| `oauth/callback/page.tsx` | 52 | Client | Extract token/error → redirect to `/home` or `/onboarding` |

#### Auth `(auth)/` (6 files, ~1,479 LOC)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 18 | Server | Centered card layout |
| `login/page.tsx` | 249 | Client | Google-first + email form, react-hook-form + zod, show/hide password |
| `register/page.tsx` | 291 | Client | Google-first or email/password, Go/Python language choice, PIN setup |
| `forgot-password/page.tsx` | 343 | Client | PIN-based flow: 6-digit input, email verification, security code |
| `reset-password/page.tsx` | 228 | Client | Token-based password reset from JWT |
| `onboarding/page.tsx` | 350 | Client | Username setup + LanguageSelector with Go/Python grid |

#### Main `(main)/` — Dashboard & Navigation (6 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 22 | Server | TopNav, BroadcastBanner, FeedbackButtonWrapper, PyodidePreloader |
| `error.tsx` | 32 | Client | AlertTriangle + retry |
| `home/page.tsx` | 831 | Client | Dashboard: ModuleCards grid, language filter, URL-persisted module filter, search, pagination (18/page), best practices tab, locked module support, user stats bar |
| `home/loading.tsx` | 17 | Server | Skeleton grid |
| `home/error.tsx` | 32 | Client | Error boundary |
| `settings/page.tsx` | 1,104 | Client | 4 tabs: Profile (name/bio), Security (PIN/password/Google link/delete), Notifications, Appearance |

#### Profile `(main)/profile/` (13 files)
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

#### Problems Listing `(main)/problems/` + Workspace `app/problems/` (7 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 16 | Server | UserProvider + FeedbackButton + PyodidePreloader |
| `page.tsx` | 698 | Client | (BETA-gated) Search/filter: language tabs, status/difficulty/XP range, seeded random ordering per user, mobile sidebar |
| `[slug]/page.tsx` | 11 | Server | Shell → Suspense → DynamicWorkspace |
| `[slug]/DynamicWorkspace.tsx` | 40 | Client | next/dynamic no-SSR wrapper |
| `[slug]/ProblemWorkspaceClient.tsx` | 1,504 | Client | Monaco Editor (Go/Python), language toggle with Save & Switch, submit/test, renderMarkdown statement, confetti, sessionStorage navigation, formatCode, hints panel, bug report, admin edit |
| `[slug]/error.tsx` | 32 | Client | Error boundary |
| `[slug]/success/page.tsx` | 427 | Client | Post-submission: confetti, CodeBlock, community likes, next problem |

#### Contribute (2 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `page.tsx` | 372 | Client | Community problem submission form, test cases, language_versions |
| `error.tsx` | 32 | Client | Error boundary |

#### Admin `(main)/admin/` (10 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `page.tsx` | 933 | Client | Dashboard: tabs for Stats, Ingest, Activity, Problems, Feedback, Broadcasts, Pending Contributions, Problem Reports, User Verification, Module Settings, Problem Module Locks, Curriculum Module Locks |
| `error.tsx` | 32 | Client | Error boundary |
| `BroadcastPanel.tsx` | 334 | Client | Create/edit broadcasts, activate/deactivate toggles |
| `FeedbackPanel.tsx` | 276 | Client | Status filters, inline resolve |
| `PendingContributions.tsx` | 268 | Client | Approval/rejection queue |
| `ProblemEditPanel.tsx` | 666 | Client | 16-field editor, renderMarkdown preview, AI assist |
| `ProblemReports.tsx` | 681 | Client | Grouped/flat bug reports, search, resolved filter |
| `UserVerificationPanel.tsx` | 211 | Client | Debounced search (300ms), verified toggle |
| `curriculum/page.tsx` | 1,857 | Client | 3-panel CMS: course list → modules → lesson editor; full section CRUD, quiz metadata, dependency picker, multi-file config, project CRUD |

#### Learn `(main)/learn/` (18 files)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 16 | Client | Eager Pyodide load |
| `loading.tsx` | 24 | Server | Skeleton grid |
| `error.tsx` | 30 | Client | Error boundary |
| `courses/page.tsx` | 285 | Client | Course catalog grid with LearningCard, gradient heroes, difficulty pills |
| `courses/loading.tsx` | 24 | Server | Skeleton |
| `courses/error.tsx` | 30 | Client | Error boundary |
| `courses/[courseSlug]/page.tsx` | 313 | Client | Course detail: hero + progress bar + module cards with status |
| `courses/[courseSlug]/loading.tsx` | 13 | Server | Skeleton |
| `courses/[courseSlug]/error.tsx` | 30 | Client | Error boundary |
| `.../modules/[moduleSlug]/page.tsx` | 328 | Client | Module detail: gradient header + stats + lesson cards with XP badges |
| `.../modules/[moduleSlug]/loading.tsx` | 13 | Server | Skeleton |
| `.../modules/[moduleSlug]/error.tsx` | 30 | Client | Error boundary |
| `.../lessons/[lessonSlug]/page.tsx` | 5 | Server | Shell → LessonViewerClient |
| `.../lessons/[lessonSlug]/LessonViewerClient.tsx` | 606 | Client | Step-by-step nav (AnimatePresence), keyboard shortcuts, quiz review, progress dots, locked overlay |
| `.../lessons/[lessonSlug]/loading.tsx` | 22 | Server | Skeleton |
| `.../lessons/[lessonSlug]/error.tsx` | 30 | Client | Error boundary |
| `.../lessons/[lessonSlug]/success/page.tsx` | 378 | Client | Confetti, "What You Covered", next lesson nav |

#### Legal `(legal)/` (3 files, ~332 LOC)
| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 24 | Server | Prose container |
| `privacy/page.tsx` | 149 | Server | Privacy policy |
| `terms/page.tsx` | 159 | Server | Terms of service |

### 8.2 Shared Components (`frontend/components/` — 60 files, ~9,835 LOC)

#### shadcn/ui Primitives (19 files, ~1,598 LOC)
| File | Lines | Purpose |
|---|---|---|
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
| `ui/learning-card.tsx` | 379 | Back plate, type-based gradients, status badges, hover stats |
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
| `MultiFileEditor.tsx` | 311 | Tabbed multi-file editor, entry point markers |

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

#### Learning Components (4 files, ~1,100 LOC)
| File | Lines | Purpose |
|---|---|---|
| `learn/SectionRenderer.tsx` | 253 | Routes 11 section types → sub-renderers, color badges, icons |
| `learn/SectionQuiz.tsx` | 109 | MCQ from JSONB metadata, selection/feedback/retry |
| `learn/SectionExercise.tsx` | 542 | Monaco + PyodideConsole 60/40 split, multi-file, Ctrl+Enter, backend test |
| `learn/LessonSidebar.tsx` | 196 | Progress bar, section nav, prerequisite checklist with locked state |

#### Dashboard Components (1 file)
| File | Lines | Purpose |
|---|---|---|
| `dashboard/ModuleCards.tsx` | 440 | Module grid, WebP images, progress bars, locked padlock overlay, pinned sort |

#### Profile Components (1 file)
| File | Lines | Purpose |
|---|---|---|
| `profile/ProfileHoverCard.tsx` | 153 | XP progress bar, 3-column stats, verified badge |

#### Admin Curriculum Components (5 files)
| File | Lines | Purpose |
|---|---|---|
| `admin/curriculum/AdminCards.tsx` | 473 | 4 card variants (Course/Module/Lesson/Project), CodePen shadow, 16:9, visibility/lock toggles |
| `admin/curriculum/MarkdownPreview.tsx` | 146 | Live GFM preview with custom callout blocks |
| `admin/curriculum/ProblemBank.tsx` | 106 | Searchable problem selector |
| `admin/curriculum/MultiFileConfigPanel.tsx` | 288 | Visual multi-file config for exercises |
| `admin/AIAssistantPanel.tsx` | 845 | AI chat with 8 action types, streaming markdown responses |

#### Application Components (1 file)
| File | Lines | Purpose |
|---|---|---|
| `application/code-snippet/index.tsx` | 314 | Professional Shiki code block, multi-file tabs, copy, collapsed mode |

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

### 8.4 Library Modules (`frontend/lib/` — 14 files, ~2,906 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `api.ts` | 897 | `fetchApi<T>()` (auth+refresh+retry+30s cache), `tryRefreshToken()` (singleton queue), **60+ endpoint functions** covering all backend APIs |
| `types.ts` | 614 | **40+ TypeScript interfaces**: User, Problem, Submission, ExecutionResult, Course, Module, Lesson, Section, QuizMetadata, AllModule, ModuleLock, AdminStats, all New* payload types, ApiResponse<T> |
| `utils.ts` | 69 | `cn()` (clsx+tailwind-merge), `getUserColor()` (6-color palette), `getDifficultyColor()`, `getDifficultyLabel()`, `seededRandom()` (mulberry32), `shuffleArray()` (Fisher-Yates) |
| `cache.ts` | 40 | `getCache<T>()` / `setCache<T>()` / `clearCache()`, 30s TTL, `kc_` prefix, sessionStorage |
| `event.ts` | 135 | `subscribe(type, callback)`, `useWebSocket(handlers, deps)`, 9 event types, auto-reconnect (1s-30s exp backoff) |
| `pyodide.ts` | 233 | `eagerLoadPyodide()`, `executePython(code, timeout?)` (10s), `executeMultiFile(spec)`, CDN v0.27.4 + numpy+matplotlib |
| `UserContext.tsx` | 102 | `UserProvider`, `useUser()`, `refreshUser()`, `setPrimaryLanguage()`, WebSocket XP auto-refresh |
| `useNotifications.ts` | 97 | `useNotifications()`, 15s/60s polling, markAsRead (optimistic), markAllAsRead |
| `achievements.ts` | 85 | `getAchievements(profile)`, 6 badges (First Blood, Hot Streak, Perfectionist, Speed Demon, Veteran Coder, Completionist) |
| `markdown.ts` | 62 | Self-contained markdown renderer (headings, paragraphs, bold/italic/code/links, ul/ol lists) — all inline styles, no CSS dependency |
| `toast.tsx` | 90 | Sonner toast wrapper: success/error/info/warning, Lucide icons, progress bar |
| `monaco-setup.ts` | 3 | Monaco CDN worker paths config (`loader.config`) |
| `monaco-theme.ts` | 30 | VS Code Dark+ theme registration (keyword/function/type/variable colors) |
| `index.ts` | 1 | Barrel: cn, getUserColor, getDifficultyColor, getDifficultyLabel |

### 8.5 Styles (`frontend/styles/` — 3 files, ~1,364 LOC)

| File | Lines | Purpose |
|---|---|---|
| `theme.css` | 856 | 856 CSS variables: brand purple palette (950-50), 16 semantic text colors, 7 border colors, 26 bg colors, 15 component tokens, 7 shadow levels, dark mode inversion |
| `typography.css` | 430 | Prose typography: CSS variables mapped to design tokens, h1-h4 sizing, inline code pill, blockquote, responsive md:prose-lg |
| `globals.css` | 78 | Tailwind 4 entry, @tailwindcss/typography, custom variants, scrollbar-hide, caret-blink animation |

### 8.6 Frontend Configuration (12 files)

| File | Lines | Purpose |
|---|---|---|
| `package.json` | 69 | 52 runtime + 15 dev dependencies |
| `next.config.ts` | 79 | Strict mode, image remote patterns, security headers |
| `tsconfig.json` | 34 | ES2017 + strict + bundler, 6 path aliases |
| `postcss.config.mjs` | 9 | @tailwindcss/postcss + autoprefixer |
| `eslint.config.mjs` | 12 | Flat config: next + ignores |
| `middleware.ts` | 41 | Edge CSP (Google, Vercel, jsDelivr, blob: workers), HSTS, XFO, XCTO |
| `components.json` | 25 | shadcn/ui config |
| `next-env.d.ts` | 6 | Auto-generated TS declarations |
| `metadata.json` | 6 | Project metadata |
| `.env` | 2 | Active vars (API URL + Google client ID) |
| `.env.example` | 59 | Template with all 25+ env vars documented |
| `package-lock.json` | 20,934 | Auto-generated (excluded from tracked LOC) |

---

## 9. Database Migrations (`migrations/` — 46 files, ~20,000 LOC)

### 9.1 Schema Migrations (32 files)

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

### 9.2 Seed Data Migrations (14 files)

| # | File | Lines | Problems | Module(s) |
|---|---|---|---|---|
| 033 | `019_seed_problems1.sql` | 2,380 | 45 | math-recursion, arrays-strings, data-structures |
| 034 | `019_seed_problems2.sql` | 2,360 | 45 | bit-manipulation, sorting-searching, pointers |
| 035 | `019_seed_problems3.sql` | 1,576 | 30 | error-handling, interfaces-generics |
| 036 | `019_seed_problems4.sql` | 3,162 | 60 | hashmaps-sets, linked-lists, trees-graphs, dynamic-programming |
| 037 | `031_python_intermediate_seed.sql` | 751 | 10 | python-intermediate |
| 038 | `032_python_variables_math_seed.sql` | 174 | 1 | python-variables-math |
| 039 | `034_python_arrays_strings_seed.sql` | 627 | 7 | python-arrays-strings |
| 040 | `037_seed_go_fundamentals.sql` | 513 | 5 | go-fundamentals |
| 041 | `039_seed_curriculum.sql` | 589 | N/A | 5 courses, 20+ modules, 60+ lessons |
| 042 | `040_complete_curriculum_content.sql` | 1,745 | N/A | Full sections, quizzes, exercises for all lessons |
| 043 | `041_seed_python_mastery.sql` | 1,992 | N/A | Python Mastery course (4 modules, 14 lessons) |
| 044 | `042_seed_python_mastery_games.sql` | 1,347 | N/A | Games course (2 modules, 6 lessons, 1 project) |
| 045 | `043_seed_python_mastery_practice.sql` | 1,434 | 30 | python-practice (difficulty 1-5, Python-only) |
| 046 | `046_module_meta.sql` | 37 | N/A | module_meta seed for 26 modules (display_name, is_pinned) |
| — | `999_seed_python_test.sql` | 62 | 1 | py-double-it (pipeline verification) |
| **Total seeded** | | | **~238 problems** | **14 modules** |

---

## 10. Database Schema (25 Tables)

### 10.1 Core Tables (6)

| Table | PK | Key Columns |
|---|---|---|
| `users` | `id UUID` | username, email, password (bcrypt), role, xp, pin_hash, google_id, verified, username_set, color_index, primary_language |
| `problems` | `id UUID` | slug UNIQUE, module, title, statement, func_name, hints, difficulty, xp_reward, visible, source_hash, constraints, learning_objective, language_versions JSONB |
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

## 12. API Endpoints (~89 Total)

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

### 12.9 WebSocket & Utility (2 endpoints)

| Method | Path | Handler | File |
|---|---|---|---|
| GET | `/ws` | WebSocket (gorilla + broker) | `ws.go` |
| GET | `/health` | inline | `router.go` |

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

## 15. Testing Strategy (13 test files, 126+ tests)

| Package | Test File | Tests |
|---|---|---|
| `internal/api` | `middleware_test.go` (618 LOC) | 23+ |
| `internal/api` | `responses_test.go` (214 LOC) | 10 |
| `internal/auth` | `auth_test.go` (209 LOC) | 15 |
| `internal/auth` | `oauth_test.go` (111 LOC) | 5 |
| `internal/broker` | `broker_test.go` (186 LOC) | 10 |
| `internal/config` | `config_test.go` (352 LOC) | 15 |
| `internal/enricher` | `enricher_test.go` (231 LOC) | 4 |
| `internal/executor` | `executor_test.go` (533 LOC) | 16 |
| `internal/parser` | `parser_test.go` (346 LOC) | 13 |
| `internal/store` | `errors_test.go` (102 LOC) | 7 |
| `internal/store` | `types_test.go` (47 LOC) | 2 |
| `internal/store` | `users_test.go` (154 LOC) | 4 |
| `sandbox` | `security_message_test.go` (32 LOC) | 3 |
| **Total** | **13 files (~3,535 LOC)** | **126+ tests** |

---

## 16. Architecture Decision Records

| ADR | Decision | Rationale |
|---|---|---|
| ADR-001 | Monolithic Go backend | Single binary; no orchestration overhead for small cohort |
| ADR-002 | Raw pgx/v5 over ORM | Predictable SQL, smaller footprint, explicit query design |
| ADR-003 | Docker subprocess for execution | gVisor unavailable on Oracle free tier; WASM immature for Go |
| ADR-004 | System prompt JSON (NVIDIA NIM) | DeepSeek V4 Flash doesn't support `response_format` reliably |
| ADR-005 | Go text/template for test gen | Type-safe conditional logic; auditable independently |
| ADR-006 | Remote HTTP Sandbox (Railway) | Eliminates Docker-in-Docker; consistent isolation, faster cold start |
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
| **Go source files** | 67 (60 backend + 7 sandbox) |
| **Go LOC** | ~19,000 (13,500 backend source + 3,535 test + 1,157 sandbox source + 32 sandbox test) |
| **Go test files** | 13 (~3,535 LOC, 126+ tests) |
| **Frontend TSX/TS files** | ~152 (~24,800 LOC) |
| **Total tracked source LOC** | ~68,000 |
| **API endpoints** | ~89 |
| **Database tables** | 25 |
| **Database indexes** | ~60 |
| **Seed problems** | ~238 (180 Go, 58 Python) |
| **Middleware chain depth** | 11 (including rate limiters) |
| **WebSocket event types** | 9 |
| **Curriculum lessons** | ~200+ across 6 courses |
| **Curriculum section types** | 11 (ENUM) |
| **AI assist actions** | 8 |
| **shadcn/ui primitives** | 19 |
| **Custom components** | 41 |
| **External Go deps** | 7 |
| **Sandbox external deps** | 0 (stdlib only) |
| **Module WebP images** | 17 |
| **Monaco worker files** | ~113 |

---

## 18. Known Issues & Stale Documentation

1. **`.github/copilot-instructions.md`** — References Gemini genai SDK (removed), httpOnly cookies (JWT in localStorage), semaphore cap=2 (now 6), timeout 5s (now 30s), Docker memory 64m (now 256m). Needs full rewrite.
2. **`@tanstack/react-virtual`** — Listed in `frontend/package.json` but unused. Should be removed.
3. **Session log duplication** — `.opencode/` directory exists but empty. Canonical log is `SESSION_LOG.md` (2,393 lines).
4. **`sandbox/secure_unix.go`** — `resourceLimits` uses raw numeric values for `RLIMIT_NPROC` (6) and `RLIMIT_NOFILE` (7) instead of `syscall.RLIMIT_NPROC` / `syscall.RLIMIT_NOFILE`. Works on linux/arm64 but needs verification.
5. **`sandbox/main.go`** — `forcePackageKoder` regex is duplicated in both `sandbox/runtest_go.go` and `internal/executor/sandbox.go`. Should be shared.
6. **`@google/genai` dep** — Listed in `go.mod` (indirect) but may be unused after NVIDIA NIM migration.
7. **Empty `docs/` subdirectories** — `docs/adr/` and `docs/diagrams/` are placeholders with no content.
8. **Migration gap** — Migration numbers jump from 017 to 019 (no 018), and from 029 to 031 (no 030). Not harmful but breaks sequential readability.
9. **`CODEBASE_INDEX.md`** — Superseded by this file (`CLAUDE.md`). Kept as a redirect for existing references; will be removed in a future cleanup.

---

## 19. Production Deployments

| Branch | Frontend | Backend API | Sandbox |
|---|---|---|---|
| **main** | `https://koder.sbs` | `https://api.koder.sbs` | Railway |
| **staging** | `https://staging.koder.sbs` | `https://stagingapi.koder.sbs` | Railway |
| **update** | `https://update.koder.sbs` | shares staging | shares staging |

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

*Last indexed: 2026-07-24 | Branch: `update` | Pre-verified: `go vet`, `go test`, ESLint, `tsc --noEmit`*