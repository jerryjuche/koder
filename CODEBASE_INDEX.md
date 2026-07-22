# Koder — Professional Codebase Index

> Comprehensive, line-level inventory of the zero-cost, production-grade automated code-grading platform for Go & Python curricula.
>
> **Generated:** 2026-07-22 | **Branch:** `update` | **Verified:** `go vet` clean, 126+ Go tests passing, ESLint 0 errors, TypeScript 0 errors

---

## 1. Project Overview

| Field | Value |
|---|---|
| **Name** | Koder |
| **Purpose** | Zero-cost automated code-grading for Go & Python curricula — students solve problems in Monaco Editor, submit code, receive instant pass/fail with diff output |
| **Repository** | `github.com/jerryjuche/koder` |
| **Budget** | $0/month (Oracle Ampere A1 + Supabase Free + Vercel Hobby + Railway Starter) |
| **Stack** | Go 1.26 (chi, pgx/v5) + Next.js 15 (React 19, Tailwind 4) + PostgreSQL 15 + NVIDIA NIM (DeepSeek V4 Flash) |
| **Sandbox** | Standalone Go binary, zero external dependencies, Railway-hosted |

---

## 2. Repository Statistics (Verified)

| Category | Files | Lines of Code | Notes |
|---|---|---|---|
| **Go Backend** (`cmd/` + `internal/`) | 70 source | **19,961** | 50 source + 13 test + 7 executor/sandbox-cli |
| **Go Sandbox** (`sandbox/`) | 8 source | **1,189** | Zero external deps, 10-layer defense-in-depth |
| **Frontend** (`app/`, `components/`, `hooks/`, `lib/`, `styles/`, config) | ~280 files | **30,783** | 70 app pages + 57 components + 19 config/style |
| **SQL Migrations** (`migrations/`) | 46 files | **19,963** | 45 numbered + 1 test seed, ~18 tables |
| **Scripts** (`scripts/`) | 4 files | ~350 | data reset, build cache, seed transform |
| **Documentation** | 14 files | ~8,500 | CLAUDE.md, SESSION_LOG.md, etc. |
| **Config/Build** | 12 files | ~700 | go.mod, Procfile, build.sh, CI, env |
| **Public Assets** | ~131 files | Binary/Monaco JS | 13 module WebP images, 2 icons, 113 Monaco workers |
| **Total (tracked source)** | **~400** | **~72,000** | Source code + migrations + assets |

---

## 3. Directory Architecture

```
koder/
├── cmd/server/main.go                      # Entry point: config, store pool, executor, chi router, graceful shutdown
├── internal/
│   ├── api/              (26 files, ~7,801 LOC)  # HTTP handlers, middleware, response helpers, WebSocket
│   ├── store/            (23 files, ~6,476 LOC)  # Database access layer, 125+ methods on Store interface
│   ├── executor/         (7 files, ~2,334 LOC)   # Code execution engine, sandbox orchestration, output parsing
│   ├── enricher/         (2 files, ~1,169 LOC)   # AI test generation (NVIDIA NIM / DeepSeek V4 Flash)
│   ├── auth/             (5 files, ~684 LOC)     # JWT (HS256), Google OAuth (JWKS), bcrypt
│   ├── broker/           (2 files, ~254 LOC)     # In-memory pub/sub (cap 32, non-blocking)
│   ├── parser/           (2 files, ~717 LOC)     # GitHub YAML curriculum parser
│   └── config/           (1 file, ~347 LOC)      # Env var loader (30+ vars, fails-fast validation)
├── sandbox/              (8 files, ~1,189 LOC)   # Remote execution service (zero deps)
├── frontend/
│   ├── app/              (70 .tsx files, ~19,500 LOC)  # App Router pages (7 route groups)
│   ├── components/       (57 files, ~7,900 LOC)  # Shared components + shadcn/ui primitives
│   ├── hooks/            (4 files, ~374 LOC)     # useGoogleOneTap, usePyodide, useHasMounted, useMobile
│   ├── lib/              (11 files, ~2,173 LOC)  # api.ts (60+ endpoints), types.ts (40+ interfaces), pyodide.ts
│   └── styles/           (3 files, ~1,364 LOC)   # globals.css, theme.css (856 var tokens), typography.css (430 lines)
├── migrations/           (46 files, ~19,963 LOC)  # Full schema + seed data
├── .github/workflows/ci.yml                     # 4-job CI: backend → frontend → deploy-backend → deploy-sandbox
└── build.sh                                     # Cross-compile ARM64 deployment
```

---

## 4. Go Backend — Complete File Inventory

### 4.1 Entry Point

| File | Lines | Package | Purpose |
|---|---|---|---|
| `cmd/server/main.go` | ~125 | `main` | Bootstrap: LoadConfig → NewPostgresStore → NewExecutor → NewRouter → http.ListenAndServe → graceful shutdown with signal handling |

### 4.2 API Handlers (`internal/api/` — 26 files, ~7,801 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `router.go` | 259 | `App` struct, `NewRouter()` (~89 routes), `Shutdown()` |
| `middleware.go` | 510 | 9 middleware: RequestLogging, Recovery, CORS (multi-origin), SecurityHeaders (CSP nonces), BodySizeLimit, AuthMiddleware (JWT + blacklist), AdminOnly, VerifiedContributorOnly, RateLimit (5/45s), IPRateLimiter (10/min), AIRateLimit (15/60s) |
| `middleware_test.go` | 618 | 23+ tests: rate limiter edge cases, CORS variants, IP extraction, role enforcement |
| `auth.go` | 623 | Register, Login (3-field), GoogleAuth (auto-create+link), CompleteOnboarding, LinkGoogle, RefreshToken (rotation), Logout, CheckUsername |
| `me.go` | 360 | GetMe (cached, level=xp/1000+1), SetUsername (one-time), UpdateLanguage, ExportData, DeleteAccount |
| `change_password.go` | 266 | SetPin, VerifyPin (rate-limited 5/15min), ChangePassword (PIN + new password) |
| `pin_reset.go` | 257 | ForgotPasswordPin (email+PIN → short-lived JWT), ResetPasswordPin (domain-separated HMAC-SHA256) |
| `password_reset.go` | 255 | ForgotPassword (Resend email, always-ok), ResetPassword (SHA-256 token validation) |
| `problems.go` | 154 | ListVisibleProblems (language filter, locked module filtering), GetProblemBySlug (403 MODULE_LOCKED) |
| `submissions.go` | 159 | Submit (rate-limited, scoring, progress update, WS events `user.xp.updated` + `progress.updated`) |
| `test.go` | 123 | Test (no-scoring, visible-only execution, no DB writes) |
| `admin.go` | 698 | Ingest (SHA-256 dedup), Enrich/EnrichAll, AIAssist (8 actions), stats, activity, problem vis/publish, approve/reject contributions, user search/verify, module locks |
| `leaderboard.go` | 40 | GetLeaderboard (30s cache, 3 periods) |
| `profile.go` | 257 | GetProfile (stored procedure, 30s cache), UpdateProfile (invalidates cache) |
| `activity.go` | 54 | GetActivity (contribution heatmap by year) |
| `community.go` | 139 | LikeSubmission, UnlikeSubmission, GetCommunitySolutions, GetBestPractices |
| `contributions.go` | 85 | PostContribution (verified_contributor+), GetMyContributions |
| `broadcasts.go` | 237 | CRUD + activate/deactivate/dismiss + ReplaceBroadcastNotifications |
| `feedback.go` | 345 | Submit (10MB, screenshot base64), ListAdmin/Mine, UpdateStatus, ProblemReports, email notification |
| `notifications.go` | 115 | GetUnread (50), GetRecent (20), MarkRead, MarkAllRead |
| `cache.go` | 132 | Generic TTL cache (30s) with cleanup goroutines: profileCache, userCacheMap, leaderboardCache |
| `ws.go` | 75 | WebSocket upgrade (gorilla), broker subscribe/unsubscribe, write pump with 10s deadline |
| `responses.go` | 95 | RespondSuccess/Created/Error, SetAuthCookie/ClearAuthCookie (httpOnly, Secure) |
| `responses_test.go` | 214 | 10 tests: response envelope, cookie settings (HTTP vs HTTPS), content-type |
| `cms.go` | 1,419 | **Largest file**: 28 handlers — student (ListPublishedCourses, GetCourseDetail, GetModuleDetail, GetLessonDetail, CompleteLesson, GetAllProgress) + admin CRUD (courses, modules, lessons, sections, projects, dependencies, problem links) |

**Total API: 26 files, ~7,801 LOC, ~89 endpoints**

### 4.3 Store Layer (`internal/store/` — 23 files, ~6,476 LOC)

| File | Lines | Key Exports (on `PostgresStore`) |
|---|---|---|
| `store.go` | 277 | `Store` interface (~125 methods), `PostgresStore` struct, `NewPostgresStore` (MaxConns=10, MinConns=2, 30m lifetime, SimpleProtocol) |
| `types.go` | 628 | ~40 structs: User, Problem, TestCase, Submission, Progress + curriculum types + custom unmarshalers (FlexibleBool, FlexibleStrings) + LanguageSpec, QuizMetadata |
| `errors.go` | 67 | `FriendlyError` (Code+Message), `IsUniqueViolation` (23505), NewDuplicateError/NotFound/Validation |
| `users.go` | 1,358 | **Largest store file**: 30+ functions — Create/Get/Update/Delete user, GetLeaderboard (period, top 100), GetUserStats, streak calculation (gaps-and-islands DENSE_RANK), CompleteUserOnboarding (atomic tx) |
| `problems.go` | 777 | 12+ functions — ListVisibleProblems (LATERAL JOIN), UpsertEnrichedProblem (tx), unmarshalLanguageVersions |
| `submissions.go` | 226 | CreateSubmission (90d TTL), GetProblemWithTestCases, Like/UnlikeSubmission, GetTopCommunitySolutions, GetBestPractices |
| `progress.go` | 153 | UpsertProgress (pg_advisory_xact_lock, stars 3/2/1 logic, XP only on first solve) |
| `admin.go` | 152 | LogActivity, GetRecentActivity, GetAdminStats, SearchUsers (ILIKE, 2-20 chars), ToggleUserVerified |
| `testcases.go` | 94 | GetTestCasesForProblem (all), GetVisibleTestCasesForProblem |
| `curriculum.go` | 1,137 | 30+ functions — Full CMS CRUD for courses/modules/lessons/sections/projects + dependency management + progress tracking (UpsertCourseProgress, UpsertLessonProgress, AddUserXP) |
| `profile.go` | 112 | GetFullProfile (stored proc), GetUserActivity (heatmap) |
| `feedback.go` | 192 | CreateFeedback, GetAdminFeedback (dynamic WHERE), GetProblemReports, UpdateFeedbackStatus |
| `broadcasts.go` | 168 | CRUD + activate/deactivate + dismiss + GetActiveBroadcasts (non-dismissed, latest 1) |
| `notifications.go` | 190 | Create, GetUnread (50), GetRecent (20), MarkRead/All, NotifyAdmins, NotifyAllUsers, ReplaceBroadcastNotifications |
| `user_problems.go` | 358 | CreateUserProblem, ListPending, Approve (5-step tx), Reject, generateDualLanguageSpec, pascalToSnake, goTypeToPython |
| `token_blacklist.go` | 33 | BlacklistToken, IsTokenBlacklisted, CleanupExpired |
| `refresh_tokens.go` | 68 | Create, Get, Revoke (single), RevokeAll (user), CleanupExpired |
| `ai_usage.go` | 59 | LogAIUsage, GetAIUsageStats (graceful on missing table) |
| `password_reset.go` | 48 | Create, Get, MarkUsed, CleanupExpired |
| `module_locks.go` | 62 | ListLockedModules, ToggleProblemModuleLock (toggle), IsModuleLocked |
| `errors_test.go` | 102 | 7 tests |
| `types_test.go` | 47 | 2 tests (FlexibleBool) |
| `users_test.go` | 154 | 4 tests |

**Total Store: 23 files, ~6,476 LOC**

### 4.4 Auth (`internal/auth/` — 5 files, ~684 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `jwt.go` | 120 | `Claims` struct, `SignToken` (HS256, strict validation), `VerifyToken`, `GenerateRefreshToken` (32-byte), `SHA256Hash` |
| `oauth.go` | 216 | `VerifyGoogleToken` (JWKS fetch+1h cache, RSA key reconstruction, audience/issuer/email check), returns `*store.GoogleUserInfo` |
| `password.go` | 28 | `HashPassword` (bcrypt cost=12, rejects empty), `ComparePassword` |
| `auth_test.go` | 209 | 15 tests: JWT sign/verify (valid/expired/wrong secret), bcrypt |
| `oauth_test.go` | 111 | 5 tests: audience/issuer validation, JWKS key round-trip |

### 4.5 Enricher (`internal/enricher/` — 2 files, ~1,169 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `enricher.go` | 938 | `Enricher` struct, `NewEnricher`, `EnrichProblem` (NVIDIA NIM, dual-language prompts, rate-limited 1s), `AIAssistProblem` (8 actions), `toSnakeCase`, `toPythonType`, `validateEnrichedProblem` (14 checks) |
| `enricher_test.go` | 231 | 4 tests: toSnakeCase (10 cases), toPythonType (13 mappings), cleanResponse (5 cases), validateEnrichedProblem (11 sub-tests) |

### 4.6 Executor (`internal/executor/` — 7 files, ~2,334 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `executor.go` | 1,314 | `Executor` struct (semaphore=6), `Execute` (scoring), `ExecuteVisibleOnly` (test-only), `formatGoLiteral` (recursive), `formatPythonLiteral` (null→None), `EnhancePythonError`, `goToSnakeCase` |
| `parser.go` | 111 | `ParseTestOutput` (state machine, 5 regex patterns for GOT/WANT multi-line parsing) |
| `sandbox.go` | 72 | `PrepareSandbox` (temp dir, go.mod, solution.go, main_test.go, forcePackageKoder) |
| `sandbox_client.go` | 166 | `SandboxRequest`/`SandboxResponse` structs, HTTP client (3 retries, exp backoff), `FormatFriendlySandboxError` |
| `templates.go` | 104 | `TemplateRenderData`, `PyTestCaseRenderData`, `mainTestTemplate` (reflect.DeepEqual for non-primitives), `pythonTestTemplate` (json.loads compare) |
| `types.go` | 34 | `ExecutionRequest`, `ExecutionResult`, `TestResult` |
| `executor_test.go` | 533 | 16 tests: literal formatting, template rendering, output parsing (all-pass, mixed, multi-line, errors), Python pipeline |

### 4.7 Broker (`internal/broker/` — 2 files, ~254 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `broker.go` | 68 | `Event` struct, `Broker` struct, `New`, `Subscribe` (UUID, cap 32), `Unsubscribe`, `Publish` (non-blocking), `PublishEvent` |
| `broker_test.go` | 186 | 10 tests: subscribe uniqueness, delivery (1/M), overflow (cap 32), concurrent (10 goroutines) |

### 4.8 Parser (`internal/parser/` — 2 files, ~717 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `parser.go` | 371 | `Parser` struct, `RawProblem` struct, `IngestGitHubRepo` (clone+sparse checkout, SHA-256 idempotency), `normalizeSlug`, `normalizeModule` |
| `parser_test.go` | 346 | 13 tests: isReadmeFile, detectProblemType, normalizeSlug, computeSourceHash, URL parsing (HTTPS+SSH) |

### 4.9 Config (`internal/config/config.go` — 1 file, ~347 LOC)

| Config | 347 | `Config` struct (27 fields), `Load()` (env + .env file, fails-fast validation: JWT_SECRET min 32, port 1-65535, valid environment), helper methods for duration conversion |

### 5.0 `go.mod`

| File | Direct Deps | Purpose |
|---|---|---|
| `go.mod` | 7 | chi/v5, jwt/v5, gorilla/websocket, pgx/v5, crypto, genai (legacy — may be unused after NVIDIA migration) |

---

## 5. Sandbox (`sandbox/` — 8 files, ~1,189 LOC, Zero External Dependencies)

| File | Lines | Purpose |
|---|---|---|
| `main.go` | 388 | HTTP server on :8080 — `/health`, `/version`, `/execute`; language dispatcher; output classification (4 regex patterns); compileErrorMessage (3-pass) |
| `pyrunner.go` | 265 | Python runner: 2-layer security (regex + subprocess AST parse, 10s timeout), findPythonBin (python3→python), cappedBuffer (64KB), runPythonTests (OOM detection) |
| `runtest_go.go` | 148 | Go runner: go.mod, solution.go (force package koder), go test -v -count=1, GOPROXY=off, GOTOOLCHAIN=local |
| `ratelimit.go` | 156 | Per-IP sliding window (10 req/min), 429 Retry-After, 5min cleanup goroutine |
| `secure.go` | 111 | 14 Go dangerous patterns (cgo, os/exec, syscall, unsafe, net), 17 Python dangerous patterns (os, subprocess, socket, ctypes, eval) |
| `secure_unix.go` | 64 | Setpgid process isolation, setrlimit (NPROC=6, NOFILE=1024, FSIZE=64MB), killProcessGroup (SIGKILL), reapProcess (5s timeout) |
| `secure_other.go` | 25 | No-op stubs for non-Unix |
| `security_message_test.go` | 32 | 3 tests |
| `Dockerfile` | 19 | 2-stage ARM64 build, includes python3 |

---

## 6. Frontend — Complete File Inventory

### 6.1 App Router Pages (`frontend/app/` — 70 `.tsx` files, ~19,500 LOC)

#### Root (4 files)

| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 39 | Server | Root layout: dark mode, Inter+Fira Code fonts, Sonner Toaster, Vercel Analytics |
| `page.tsx` | 85 | Client | Loading guard → fetchUser → `/home` or LandingContent with MultiStepLoader |
| `not-found.tsx` | 70 | Client | Animated 404 with FileQuestion icon, back/home buttons |
| `global-error.tsx` | 33 | Client | 500 error boundary with reset |

#### Landing & OAuth (2 files)

| File | Lines | Type | Purpose |
|---|---|---|---|
| `landing/page.tsx` | 5 | Server | Renders `<LandingContent />` |
| `oauth/callback/page.tsx` | ~55 | Client | Extract token/error from URL params, redirect |

#### Auth `(auth)/` (6 files)

| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 18 | Server | Centered card with bg blur |
| `login/page.tsx` | ~310 | Client | Zod form, Google One Tap, show/hide password, onboarding redirect |
| `register/page.tsx` | ~620 | Client | 3-step wizard (credentials → school → PIN verify), username check, Google |
| `forgot-password/page.tsx` | ~480 | Client | Email/PIN tabs, 6-digit PIN input, reset form |
| `reset-password/page.tsx` | ~280 | Client | Token from params, Zod password validation |
| `onboarding/page.tsx` | ~430 | Client | 2-step wizard (username → language selector with LanguageLogo) |

#### Main `(main)/` — Dashboard & Navigation (6 files)

| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 22 | Server | UserProvider, TopNav, BroadcastBanner, FeedbackButton, PyodidePreloader |
| `error.tsx` | 32 | Client | AlertTriangle + retry |
| `home/page.tsx` | ~900 | Client | Dashboard: ModuleCards grid, language filter, pagination, search, best practices |
| `home/loading.tsx` | 17 | Server | Skeleton grid |
| `home/error.tsx` | 32 | Client | Dashboard error boundary |

#### Problems Listing `(main)/problems/` (2 files)

| File | Lines | Type | Purpose |
|---|---|---|---|
| `page.tsx` | 532 | Client | Paginated (18/page), sidebar filters (difficulty 1-5, solved/unsolved, XP range), language tabs, search |
| `[slug]/success/page.tsx` | 415 | Client | Post-submission: confetti, CodeBlock solution, community best practices likes, next problem |

#### Leaderboard `(main)/leaderboard/` (4 files)

| File | Lines | Type | Purpose |
|---|---|---|---|
| `page.tsx` | 11 | Server | Metadata wrapper |
| `LeaderboardClient.tsx` | ~670 | Client | Podium top-3, searchable ranked table, period filter, Avatar + ProfileHoverCard |
| `loading.tsx` | 41 | Server | Podium + table skeleton |
| `error.tsx` | 32 | Client | Error boundary |

#### Profile `(main)/profile/` (11 files)

| File | Lines | Type | Purpose |
|---|---|---|---|
| `page.tsx` | 11 | Server | Metadata wrapper |
| `ProfileClient.tsx` | ~190 | Client | Tabs: stats, activity, achievements, contributions |
| `loading.tsx` | ~90 | Server | Detailed skeleton |
| `error.tsx` | 32 | Client | Error boundary |
| `components/ProfileHeader.tsx` | ~210 | Client | Avatar, name, XP bar, level, verified badge |
| `components/StatsOverview.tsx` | ~40 | Client | Rank, success rate, avg runtime stat cards |
| `components/ProgressMetrics.tsx` | ~100 | Client | Per-difficulty animated bars |
| `components/Achievements.tsx` | ~200 | Client | 6 achievement badges with detail dialogs |
| `components/ActivityFeed.tsx` | ~190 | Client | Summary card + recent activity list |
| `components/RecentActivity.tsx` | ~170 | Client | Recent submissions table, expandable |
| `components/ContributionGraphSection.tsx` | ~130 | Client | GitHub-style heatmap |
| `components/MyContributions.tsx` | ~400 | Client | User-submitted problems, sortable, markdown preview |

#### Settings & Contribute (4 files)

| File | Lines | Type | Purpose |
|---|---|---|---|
| `settings/page.tsx` | ~1,300 | Client | 4 tabs (profile/appearance/notifications/security): edit name/username, Google link, PIN, delete account |
| `settings/error.tsx` | 32 | Client | Error boundary |
| `contribute/page.tsx` | ~450 | Client | Form: slug/title/statement/func signature/params/hints/difficulty/tags/test cases; `?edit=<id>` support |
| `contribute/error.tsx` | 32 | Client | Error boundary |

#### Admin `(main)/admin/` (9 files)

| File | Lines | Type | Purpose |
|---|---|---|---|
| `page.tsx` | ~850 | Client | Dashboard: stats, activity log, AI usage, module lock toggles, sub-panels |
| `error.tsx` | 32 | Client | Error boundary |
| `FeedbackPanel.tsx` | ~370 | Client | Feedback fetch/update, status tabs, priority colors, inline edit |
| `BroadcastPanel.tsx` | ~440 | Client | Broadcast CRUD, toggle switches, WebSocket updates |
| `PendingContributions.tsx` | ~420 | Client | Approval/rejection queue, markdown preview |
| `ProblemEditPanel.tsx` | ~560 | Client | Modal: 16 editable fields, AI assist integration |
| `ProblemReports.tsx` | ~740 | Client | Grouped/flat bug reports, status filters, ProblemEditPanel link |
| `UserVerificationPanel.tsx` | ~250 | Client | Debounced search (300ms), verified toggle, PIN set |
| `curriculum/page.tsx` | ~1,600 | Client | **Largest frontend file**: 3-panel CMS (course list → modules → lesson editor), full section CRUD, dependency picker, MarkdownPreview, multi-file config |

#### Learn CMS `(main)/learn/` (20 files)

| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 16 | Client | Eager Pyodide load |
| `loading.tsx` | 24 | Server | 3-card skeleton |
| `error.tsx` | 30 | Client | Error boundary |
| `courses/page.tsx` | 285 | Client | Animated LearningCard grid, difficulty badges, learning profile sidebar |
| `courses/loading.tsx` | 24 | Server | Skeleton |
| `courses/error.tsx` | 30 | Client | Error boundary |
| `courses/[courseSlug]/page.tsx` | 313 | Client | Hero LearningCard, stats grid, module cards with status, WebSocket refresh |
| `courses/[courseSlug]/loading.tsx` | 13 | Server | Skeleton |
| `courses/[courseSlug]/error.tsx` | 30 | Client | Error boundary |
| `courses/[courseSlug]/modules/[moduleSlug]/page.tsx` | 328 | Client | Module detail: header card, stats grid, lesson grid with dependency lock |
| `courses/[courseSlug]/modules/[moduleSlug]/loading.tsx` | 13 | Server | Skeleton |
| `courses/[courseSlug]/modules/[moduleSlug]/error.tsx` | 30 | Client | Error boundary |
| `.../lessons/[lessonSlug]/page.tsx` | 5 | Server | Thin wrapper → LessonViewerClient |
| `.../lessons/[lessonSlug]/LessonViewerClient.tsx` | 610 | Client | Step-by-step nav (AnimatePresence), quiz review, progress dots, keyboard nav, lock overlay, confetti |
| `.../lessons/[lessonSlug]/loading.tsx` | 22 | Server | Skeleton |
| `.../lessons/[lessonSlug]/error.tsx` | 30 | Client | Error boundary |
| `.../lessons/[lessonSlug]/success/page.tsx` | 378 | Client | Confetti, XP reward, "What You Covered" list, next lesson, module progress |

#### Problem Workspace `app/problems/` (4 files)

| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 16 | Server | UserProvider + FeedbackButton + PyodidePreloader |
| `[slug]/page.tsx` | 11 | Server/Async | Suspense → DynamicWorkspace |
| `[slug]/DynamicWorkspace.tsx` | 40 | Client | next/dynamic no-SSR wrapper |
| `[slug]/ProblemWorkspaceClient.tsx` | 2,241 | Client | **Monaco Editor**: Go/Python with per-language localStorage, submit/test (Ctrl+Enter/Shift+Ctrl+Enter), formatCode, hints panel, bug report, admin edit, Monaco snippets/completions, language toggle with "Save & Switch", rate-limit cooldown |

#### Legal `(legal)/` (3 files)

| File | Lines | Type | Purpose |
|---|---|---|---|
| `layout.tsx` | 24 | Server | Header + footer, max-w-3xl prose |
| `privacy/page.tsx` | ~185 | Server | Structured metadata + markdown sections |
| `terms/page.tsx` | ~200 | Server | Same pattern |

### 6.2 Shared Components (`frontend/components/` — 57 files, ~7,900 LOC)

#### Feature Components (10 files)

| File | Lines | Purpose |
|---|---|---|
| `BroadcastBanner.tsx` | 191 | Color-coded, 30s polling, per-user dismiss, critical priority ring |
| `FeedbackButton.tsx` | 282 | Floating FAB, 3 tabs (General/Bug/Feature), screenshot (5MB), priority selector |
| `GoogleLinkBanner.tsx` | 77 | Amber banner, localStorage per-session dismiss |
| `LandingContent.tsx` | 141 | Hero + Stats + Features + HowItWorks + Testimonials + Footer |
| `LanguageLogo.tsx` | 32 | Go/Python SVG icon renderer |
| `TestResultPanel.tsx` | 652 | LCS unified diff, circular progress, compiler error with tips, runtime format |
| `PyodideConsole.tsx` | 186 | Terminal-style (#0D0D14), Fira Code, colored output, auto-scroll, 500-line cap |
| `ResizableSplitPane.tsx` | 107 | Drag-resizable horizontal split, grip handle, clamp min/max |
| `MultiFileEditor.tsx` | 311 | Tabbed multi-file editor, entry point markers, PyodideConsole split |
| `PyodidePreloader.tsx` | 11 | Triggers eager CDN Pyodide load |

#### Landing Sub-components (6 files)

| File | Lines | Purpose |
|---|---|---|
| `landing/Hero.tsx` | 121 | Animated headline, gradient CTAs, glow orbs, parallax |
| `landing/Features.tsx` | 87 | 6 feature cards with stagger animation |
| `landing/Stats.tsx` | 81 | 4 animated counters (50K+, 10K+, 500+, 99.9%) |
| `landing/HowItWorks.tsx` | 78 | 4-step (Choose-Write-Run-Rank) with connection line |
| `landing/Testimonials.tsx` | 90 | 3-column testimonial cards |
| `landing/Footer.tsx` | 89 | 3 link groups, copyright, tech stack credit |

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
| `base/avatar/avatar.tsx` | 115 | 5 sizes (sm/md/lg/podium/xl), initials fallback, verified gold badge |
| `base/input/pin-input.tsx` | 172 | OTP PIN input, mask mode, shake on error, caret blink |

#### Dashboard (1 file)

| File | Lines | Purpose |
|---|---|---|
| `dashboard/ModuleCards.tsx` | 386 | Module grid with WebP images, progress bars, locked padlock overlay |

#### Layout (1 file)

| File | Lines | Purpose |
|---|---|---|
| `layout/TopNav.tsx` | 316 | Logo, links (Dashboard/Problems/Learn/Leaderboard/Admin), XP bar, notification bell dropdown, avatar menu |

#### Learn Components (4 files)

| File | Lines | Purpose |
|---|---|---|
| `learn/SectionRenderer.tsx` | 254 | Routes 11 section types → sub-renderers, color badges, icons |
| `learn/SectionQuiz.tsx` | 109 | MCQ from JSONB metadata, selection/feedback/retry |
| `learn/SectionExercise.tsx` | 542 | Monaco + PyodideConsole 60/40 split, multi-file, Ctrl+Enter, backend test |
| `learn/LessonSidebar.tsx` | 196 | Progress bar, section nav, prerequisite checklist with locked state |

#### Admin Curriculum (4 files)

| File | Lines | Purpose |
|---|---|---|
| `admin/curriculum/AdminCards.tsx` | 473 | 4 card variants (Course/Module/Lesson/Project), CodePen shadow, 16:9, visibility/lock toggles |
| `admin/curriculum/MarkdownPreview.tsx` | 146 | Live GFM preview with custom callout blocks, Shiki code highlighting |
| `admin/curriculum/ProblemBank.tsx` | 106 | Searchable problem selector, checkboxes with difficulty/XP badges |
| `admin/curriculum/MultiFileConfigPanel.tsx` | 284 | Visual multi-file config, add/remove/entry-point, tabbed editing |

#### Kibo UI (3 files)

| File | Lines | Purpose |
|---|---|---|
| `kibo-ui/code-block/index.tsx` | 480 | Shiki syntax highlighting, multi-file tabs, diff/error/focus transforms, copy, dark mode |
| `kibo-ui/code-block/server.tsx` | 52 | Server-side Shiki rendering |
| `kibo-ui/contribution-graph/index.tsx` | 438 | GitHub-style SVG heatmap, month labels, legend, custom render props |

#### shadcn/ui Primitives (17 files)

| File | Lines | Purpose |
|---|---|---|
| `ui/avatar.tsx` | 49 | Radix Avatar (Root/Image/Fallback) |
| `ui/badge.tsx` | 49 | CVA variants (default/secondary/destructive/outline/ghost) |
| `ui/button.tsx` | 65 | CVA variants + sizes (xs→icon-lg) |
| `ui/card.tsx` | 66 | Header/Title/Description/Content/Footer |
| `ui/dialog.tsx` | 168 | Radix, backdrop blur, zoom/fade animation, optional close |
| `ui/dropdown-menu.tsx` | 99 | Radix, rounded-xl, animated entry/exit |
| `ui/hover-card.tsx` | 31 | Radix, dark blur bg |
| `ui/input.tsx` | 24 | Border + focus ring + disabled |
| `ui/input-otp.tsx` | 87 | input-otp wrapper, fake caret |
| `ui/label.tsx` | 25 | Radix Label + peer-disabled |
| `ui/learning-card.tsx` | 379 | Back plate, type-based gradients, LanguageLogo, status badges, hover stats |
| `ui/multi-step-loader.tsx` | 142 | Full-screen animated loader, checkmark icons |
| `ui/progress.tsx` | 31 | Radix Progress |
| `ui/rating-badge.tsx` | 57 | Filled/half/empty stars, sizes, review count |
| `ui/select.tsx` | 86 | Radix Select + chevron |
| `ui/tabs.tsx` | 90 | Radix Tabs, default/line variants |
| `ui/textarea.tsx` | 23 | Min-height, focus ring |
| `ui/tooltip.tsx` | 29 | Radix Tooltip + Provider |
| `ui/activity-gauge.tsx` | 98 | Recharts radial gauge, color arcs |

### 6.3 Custom Hooks (`frontend/hooks/` — 4 files, ~374 LOC)

| File | Lines | Purpose |
|---|---|---|
| `use-google-one-tap.ts` | 163 | GIS singleton: init once, prompt + renderButton, ready state |
| `use-has-mounted.ts` | 10 | SSR-safe mount detection |
| `use-mobile.ts` | 22 | Mobile <768px detection with matchMedia |
| `usePyodide.ts` | 179 | Python-in-browser: ready/loading/error states, execute(code), consoleLines (500 cap), clearConsole |

### 6.4 Lib Modules (`frontend/lib/` — 11 files, ~2,173 LOC)

| File | Lines | Key Exports |
|---|---|---|
| `api.ts` | 841 | `fetchApi<T>()` (auth+refresh+retry+30s cache), `tryRefreshToken()` (singleton queue), **60+ endpoint functions** covering all backend APIs |
| `types.ts` | 604 | **40+ interfaces**: User, Problem, Submission, ExecutionResult, Course, Module, Lesson, Section, QuizMetadata, all New* payloads, ApiResponse<T> |
| `utils.ts` | 47 | `cn()` (clsx+tailwind-merge), `getUserColor()` (6-color palette), `getDifficultyColor()`, `getDifficultyLabel()` |
| `cache.ts` | 40 | `getCache<T>()` / `setCache<T>()` / `clearCache()`, 30s TTL, `kc_` prefix |
| `event.ts` | 135 | `subscribe(type, callback)`, `useWebSocket(handlers, deps)`, 9 event types, auto-reconnect (1s-30s exp backoff) |
| `pyodide.ts` | 233 | `eagerLoadPyodide()`, `executePython(code, timeout?)` (10s), `executeMultiFile(spec)`, `writeFile()`, CDN v0.27.4 + numpy+matplotlib |
| `UserContext.tsx` | 87 | `UserProvider`, `useUser()`, `refreshUser()`, `setPrimaryLanguage()`, WebSocket XP auto-refresh |
| `useNotifications.ts` | 97 | `useNotifications()`, 15s/60s polling, markAsRead (optimistic), markAllAsRead |
| `achievements.ts` | 85 | `getAchievements(profile)`, `Achievement` interface, 6 badges (First Blood, Hot Streak, Perfectionist, Speed Demon, Veteran Coder, Completionist) |
| `toast.tsx` | 90 | `toast.success/error/info/warning`, animated cards with progress bar |
| `index.ts` | 1 | Barrel: cn, getUserColor, getDifficultyColor, getDifficultyLabel |

### 6.5 Styles (`frontend/styles/` — 3 files, ~1,364 LOC)

| File | Lines | Purpose |
|---|---|---|
| `globals.css` | 78 | Tailwind 4 entry, `@tailwindcss/typography`, custom variants (dark, label), scrollbar-hide, caret-blink animation |
| `theme.css` | 856 | **Design token system**: 950-50 brand purple palette, 16 semantic text colors, 7 border colors, 26 bg colors, 15 component tokens, 7 shadow levels, iPhone mockup shadows, dark mode inversion |
| `typography.css` | 430 | Prose typography: CSS variables mapped to design tokens, h1-h4 sizing, inline code pill, blockquote styles, responsive `md:prose-lg` |

### 6.6 Frontend Configuration (14 files, ~450 LOC)

| File | Lines | Purpose |
|---|---|---|
| `package.json` | 69 | 52 runtime + 15 dev deps |
| `next.config.ts` | 79 | Strict mode, image remote patterns (4 hosts), security headers, HMR disable |
| `tsconfig.json` | 34 | ES2017 + strict + bundler, 6 path aliases |
| `postcss.config.mjs` | 9 | @tailwindcss/postcss + autoprefixer |
| `middleware.ts` | 41 | Edge CSP (Google, Vercel, jsDelivr, blob: workers), HSTS, XFO, XCTO |
| `components.json` | 25 | shadcn/ui: radix-rhea style, CSS vars, zinc base |
| `eslint.config.mjs` | 12 | Flat config: next + ignores public/vs/ |
| `.eslintrc.json` | 4 | Legacy config |
| `.env` | 2 | Active vars (API URL + Google client ID) |
| `.env.local` | 2 | Local override |
| `.env.example` | 8 | Template |
| `.gitignore` | 10 | node_modules, .next, .env*, public/vs/ |
| `next-env.d.ts` | 6 | Auto-generated TS declarations |
| `scripts/copy-monaco.mjs` | 16 | Build script: copies Monaco workers to public/vs/ |

---

## 7. Database Migrations (`migrations/` — 46 files, ~19,963 LOC)

### 7.1 Schema Migrations

| Migration | Lines | Purpose |
|---|---|---|
| `001_init.sql` | 77 | **Core schema**: users, problems, test_cases, submissions, progress (4 FK constraints) |
| `002_indexes.sql` | 33 | 12 performance indexes |
| `003_activity_logs.sql` | 10 | activity_logs table for admin audit |
| `005_community_contributions.sql` | 35 | user_problems + verified role |
| `006_notifications.sql` | 14 | notifications table (type, related_id) |
| `007_submission_likes.sql` | 12 | submission_likes with UNIQUE(submission_id, user_id) |
| `008_user_profile.sql` | 4 | bio column on users |
| `009_get_full_profile.sql` | 167 | PL/pgSQL stored procedure: full profile with rank, streak (DENSE_RANK gaps-and-islands), module proficiency |
| `010_add_gitea_auth.sql` | 5 | **[OBSOLETE]** Gitea OAuth columns |
| `011_add_gitea_token.sql` | 2 | **[OBSOLETE]** Gitea PAT column |
| `012_add_google_auth.sql` | 138 | Google OAuth: google_id, google_email, google_avatar_url, username, email |
| `013_fix_rank_tiebreaker.sql` | 145 | Rank: xp DESC, solved_count DESC, id ASC |
| `014_feedback.sql` | 18 | feedback table: type/general/bug/feature, priority, status, screenshot |
| `015_broadcasts.sql` | 25 | broadcasts + user_broadcast_status (PK dismissal) |
| `016_add_streak_index.sql` | 3 | Composite: submissions(user_id, status, created_at) |
| `017_optimization_indexes.sql` | 26 | 16 composite indexes for production |
| `020_token_blacklist.sql` | 9 | JWT blacklist (jti PK, ON CONFLICT DO NOTHING) |
| `021_password_reset.sql` | 11 | password_reset_tokens (SHA-256 hash, 1h expiry) |
| `022_add_pin_hash.sql` | 2 | pin_hash on users (bcrypt, for PIN recovery) |
| `023_split_problem_fields.sql` | 9 | constraints + learning_objective columns |
| `024_add_username_set.sql` | 4 | username_set flag (one-time onboarding) |
| `025_report_issue_fields.sql` | 10 | problem_slug, code_snippet, error_message on feedback |
| `026_output_logs_ttl.sql` | 7 | output_logs_expires_at (90-day TTL) |
| `027_language_versions.sql` | 16 | primary_language on users, language_versions JSONB on problems |
| `028_backfill_language_versions.sql` | 111 | PL/pgSQL: koder_to_snake_case, koder_go_type_to_python — backfill 180 problems |
| `029_ensure_language_versions.sql` | 163 | Guarantee ALL problems have Go + Python language_versions entries |
| `033_add_user_problems_language_versions.sql` | 4 | language_versions JSONB on user_problems table |
| `035_ai_usage_logs.sql` | 12 | ai_usage_logs (tokens, response_time, success, error_message) |
| `036_refresh_tokens.sql` | 9 | refresh_tokens (token_hash UNIQUE, revoked flag, rotation) |
| `038_curriculum_cms.sql` | 169 | **8 tables**: courses→modules→lessons→lesson_dependencies→lesson_sections→projects→course_progress→lesson_progress + lesson_section_type ENUM (11 values) + 14 indexes |
| `044_add_module_locked.sql` | 5 | locked BOOLEAN on modules (curriculum module lock/unlock) |
| `045_add_module_locks.sql` | 5 | module_locks table (problem category locking, module_name PK) |

### 7.2 Seed Migrations

| Migration | Lines | Problems | Module(s) |
|---|---|---|---|
| `019_seed_problems1.sql` | 2,380 | 45 | math-recursion, arrays-strings, data-structures |
| `019_seed_problems2.sql` | 2,360 | 45 | bit-manipulation, sorting-searching, pointers |
| `019_seed_problems3.sql` | 1,576 | 30 | error-handling, interfaces-generics |
| `019_seed_problems4.sql` | 3,162 | 60 | hashmaps-sets, linked-lists, trees-graphs, dynamic-programming |
| `031_python_intermediate_seed.sql` | ~800 | 10 | python-intermediate |
| `032_python_variables_math_seed.sql` | ~80 | 1 | python-variables-math |
| `034_python_arrays_strings_seed.sql` | ~600 | 7 | python-arrays-strings |
| `037_seed_go_fundamentals.sql` | ~400 | 5 | go-fundamentals |
| `039_seed_curriculum.sql` | ~400 | N/A | 5 courses, 21 modules, structure |
| `040_complete_curriculum_content.sql` | ~4,000 | N/A | Full sections, quizzes, exercises for all lessons |
| `041_seed_python_mastery.sql` | ~2,500 | N/A | Python Mastery course (4 modules, 14 lessons) |
| `042_seed_python_mastery_games.sql` | ~1,000 | N/A | Games course (2 modules, 6 lessons, 1 project) |
| `043_seed_python_mastery_practice.sql` | ~2,000 | 30 | python-practice (difficulty 1-5, Python-only) |
| `999_seed_python_test.sql` | 62 | 1 | py-double-it (pipeline verification) |
| **Total seeded** | **~19,300** | **~228 problems** | **14 modules** |

---

## 8. Database Schema (25 Tables)

### Core Tables (6)

| Table | PK | Key Columns | Indexes |
|---|---|---|---|
| `users` | `id UUID` | username, email, password, role, xp, pin_hash, google_id, verified, primary_language | 12 |
| `problems` | `id UUID` | slug UNIQUE, module, title, func_name, hints, difficulty, xp_reward, visible, language_versions JSONB | 12 |
| `test_cases` | `id UUID` | problem_id FK, input JSONB, expected, is_hidden, ordinal, UNIQUE(problem_id, ordinal) | 3 |
| `submissions` | `id UUID` | user_id FK, problem_id FK, code, status, passed_count, total_count, output_logs, output_logs_expires_at | 8 |
| `progress` | `(user_id, problem_id)` | solved, stars (3/2/1), attempts, best_runtime, xp_awarded | 3 |
| `activity_logs` | `id` | type, message, color, icon | 1 |

### Secondary Tables (11)

| Table | PK | Purpose |
|---|---|---|
| `user_problems` | `id UUID` | Community contributions: status (pending/approved/rejected), language_versions JSONB |
| `notifications` | `id UUID` | User alerts: type, message, related_id, is_read |
| `submission_likes` | `id` | UNIQUE(submission_id, user_id) |
| `feedback` | `id UUID` | type CHECK, priority CHECK, status CHECK, problem_slug, screenshot_url |
| `broadcasts` | `id UUID` | type CHECK, priority, action_label/url, active |
| `user_broadcast_status` | `(user_id, broadcast_id)` | Dismissal tracking |
| `token_blacklist` | `jti TEXT` | JWT revocation, ON CONFLICT DO NOTHING |
| `password_reset_tokens` | `token_hash TEXT` | Email reset, used flag, 1h expiry |
| `refresh_tokens` | `id UUID` | token_hash UNIQUE, revoked, cleanup |
| `ai_usage_logs` | `id UUID` | user_id, action, tokens, response_time_ms, success |
| `module_locks` | `module_name TEXT` | Problem category locking (FK-free) |

### Curriculum CMS Tables (8)

| Table | PK | Key Columns |
|---|---|---|
| `courses` | `id UUID` | slug UNIQUE, difficulty_level (1-5), visible=false default |
| `modules` | `id UUID` | UNIQUE(course_id, slug), visible=false, locked=false |
| `lessons` | `id UUID` | UNIQUE(module_id, slug), visible=false, problem_references TEXT[] |
| `lesson_dependencies` | `(lesson_id, depends_on_lesson_id)` | CHECK no self-ref |
| `lesson_sections` | `id UUID` | section_type ENUM (11 types), metadata JSONB, order_number |
| `projects` | `id UUID` | UNIQUE(lesson_id, slug), difficulty (1-5), hints TEXT[], visible=false |
| `course_progress` | `(user_id, course_id)` | progress_pct REAL (0-100) |
| `lesson_progress` | `(user_id, lesson_id)` | completed, xp_awarded |

---

## 9. API Endpoints (~89 Total)

### Auth (14 endpoints, IP-rate-limited: 10/min)

| Method | Path | Handler |
|---|---|---|
| POST | `/auth/register` | Register (name, email, password, PIN) |
| POST | `/auth/login` | Login (username/email/student_id) |
| POST | `/auth/google` | GoogleAuth (auto-create/link) |
| POST | `/auth/complete-onboarding` | CompleteOnboarding (username + student_id) |
| POST | `/auth/link-google` | LinkGoogle (authenticated user) |
| POST | `/auth/forgot-password` | ForgotPassword (Resend email) |
| POST | `/auth/reset-password` | ResetPassword (token) |
| POST | `/auth/forgot-password-pin` | ForgotPasswordPin (email + PIN) |
| POST | `/auth/reset-password-pin` | ResetPasswordPin (JWT + new password) |
| POST | `/auth/change-password` | ChangePassword (authenticated, PIN + new) |
| POST | `/auth/verify-pin` | VerifyPin (rate-limited: 5/15min) |
| POST | `/auth/set-pin` | SetPin (initial 6-digit) |
| POST | `/auth/refresh` | RefreshToken (rotation + reuse detection) |
| POST | `/auth/logout` | Logout (blacklist + revoke all) |
| GET | `/auth/check-username` | CheckUsername (public) |

### User (6 endpoints, authenticated)

| Method | Path | Handler |
|---|---|---|
| GET | `/me` | GetMe (cached 30s) |
| PUT | `/me/username` | SetUsername (one-time) |
| PUT | `/me/language` | UpdateLanguage |
| POST | `/me/delete-account` | DeleteAccount (cascade) |
| GET | `/me/profile` | GetProfile (stored procedure, cached 30s) |
| PUT | `/me/profile` | UpdateProfile |
| GET | `/me/activity` | GetActivity (heatmap by year) |
| GET | `/me/contributions` | GetMyContributions |
| GET | `/me/export-data` | ExportData (JSON attachment) |

### Problems & Submissions (4 endpoints, submit rate-limited: 5/45s)

| Method | Path | Handler |
|---|---|---|
| GET | `/problems` | ListVisibleProblems (?language= filter) |
| GET | `/problems/:slug` | GetProblemBySlug (403 MODULE_LOCKED) |
| POST | `/submit` | Submit (scoring, WS events) |
| POST | `/test` | Test (visible-only, no DB writes) |

### Community (5 endpoints)

| Method | Path | Handler |
|---|---|---|
| GET | `/problems/:slug/community-solutions` | GetCommunitySolutions |
| GET | `/best-practices` | GetBestPractices |
| POST | `/submissions/:id/like` | LikeSubmission |
| DELETE | `/submissions/:id/like` | UnlikeSubmission |
| POST | `/user-problems` | PostContribution (verified_contributor+) |

### Feedback & Broadcasts & Notifications (13 endpoints)

| Method | Path | Handler |
|---|---|---|
| POST | `/feedback` | SubmitFeedback |
| GET | `/feedback/mine` | ListMine |
| GET | `/notifications` | GetUnread |
| GET | `/notifications/recent` | GetRecent |
| POST | `/notifications/read-all` | MarkAllAsRead |
| POST | `/notifications/:id/read` | MarkAsRead |
| GET | `/me/broadcasts` | ListActive |
| POST | `/me/broadcasts/:id/dismiss` | Dismiss |

### Leaderboard & Users (2 endpoints)

| Method | Path | Handler |
|---|---|---|
| GET | `/leaderboard` | GetLeaderboard (?period=, cached 30s) |
| GET | `/users/{id}` | GetUserPublicData |

### Curriculum CMS — Student (6 endpoints)

| Method | Path | Handler |
|---|---|---|
| GET | `/learn/courses` | ListPublishedCourses |
| GET | `/learn/courses/{courseSlug}` | GetCourseDetail |
| GET | `/learn/courses/{courseSlug}/modules/{moduleSlug}` | GetModuleDetail (403 LOCKED) |
| GET | `/learn/courses/.../lessons/{lessonSlug}` | GetLessonDetail (prerequisite check) |
| POST | `/learn/lessons/{lessonId}/complete` | CompleteLesson (XP award, WS events) |
| GET | `/learn/progress` | GetAllProgress |

### Admin (32 endpoints)

| Method | Path | Handler |
|---|---|---|
| POST | `/admin/ingest` | Ingest (GitHub YAML) |
| POST | `/admin/enrich` | Enrich (single AI) |
| POST | `/admin/enrich-all` | EnrichAll (batch) |
| POST | `/admin/ai/assist` | AIAssist (8 actions, 15 req/60s) |
| GET | `/admin/ai/usage` | GetAIUsage |
| GET | `/admin/stats` | GetAdminStats |
| GET | `/admin/activity` | GetAdminActivity |
| GET | `/admin/problems` | ListAllProblems |
| PATCH | `/admin/problems/{id}/visibility` | ToggleVisibility |
| PUT | `/admin/problems/{id}` | UpdateProblem (16 fields) |
| POST | `/admin/problems/publish-all` | PublishAllDrafts |
| GET | `/admin/user-problems/pending` | ListPendingUserProblems |
| PATCH | `/admin/user-problems/{id}/approve` | ApproveUserProblem (5-step tx) |
| PATCH | `/admin/user-problems/{id}/reject` | RejectUserProblem |
| GET | `/admin/users/search` | SearchUsers (ILIKE) |
| PATCH | `/admin/users/{id}/verified` | ToggleUserVerified |
| GET/POST | `/admin/broadcasts` | ListAll / Create |
| PATCH/DELETE | `/admin/broadcasts/{id}` | Deactivate/Activate/Delete |
| GET | `/admin/feedback` / `/feedback/counts` | ListAdmin / Counts |
| PATCH | `/admin/feedback/{id}` | UpdateStatus |
| GET | `/admin/problem-reports` | ListProblemReports |
| **Curriculum Admin (22):** | `/admin/courses/`, `modules/`, `lessons/`, `sections/`, `projects/` | Full CRUD + visibility + lock |
| GET/POST | `/admin/module-locks` | List / Toggle |

### WebSocket & Utility (2 endpoints)

| Method | Path | Handler |
|---|---|---|
| GET | `/ws` | WebSocket (gorilla + broker) |
| GET | `/health` | Ping + DB status |

---

## 10. Real-Time Events (Broker + WebSocket)

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

## 11. CI/CD Pipeline (`.github/workflows/ci.yml`)

| Job | Triggers | Commands |
|---|---|---|
| **backend** | Push to main/python-curricula, PR to main | `go vet ./...` → `go test ./internal/... -count=1` → `go build ./cmd/server` + `go build ./sandbox` |
| **frontend** | Push to main/python-curricula, PR to main | `npm ci` → `npm run lint` → `npx tsc --noEmit` → `npm run build` |
| **deploy-backend** | main branch only (after backend test) | Render deploy webhook |
| **deploy-sandbox** | main branch only (after backend test) | Railway deploy webhook |

---

## 12. Test Coverage Summary (13 test files, 126+ tests)

| Package | Test File | Tests |
|---|---|---|
| `internal/api` | `middleware_test.go` | 23+ |
| `internal/api` | `responses_test.go` | 10 |
| `internal/auth` | `auth_test.go` | 15 |
| `internal/auth` | `oauth_test.go` | 5 |
| `internal/broker` | `broker_test.go` | 10 |
| `internal/config` | `config_test.go` | 15 |
| `internal/enricher` | `enricher_test.go` | 4 |
| `internal/executor` | `executor_test.go` | 16 |
| `internal/parser` | `parser_test.go` | 13 |
| `internal/store` | `errors_test.go` | 7 |
| `internal/store` | `types_test.go` | 2 |
| `internal/store` | `users_test.go` | 4 |
| `sandbox` | `security_message_test.go` | 3 |
| **Total** | **13 files** | **126+ tests** |

---

## 13. Key Metrics

| Metric | Value |
|---|---|
| **Go source files** | 78 (70 backend + 8 sandbox) |
| **Go LOC** | ~21,150 (19,961 backend + 1,189 sandbox) |
| **Frontend TS/TSX LOC** | ~30,783 |
| **SQL migration lines** | ~19,963 |
| **Total tracked source LOC** | ~72,000 |
| **Go tests (passing)** | 126+ |
| **Frontend lint errors** | 0 |
| **API endpoints** | ~89 |
| **Database tables** | 25 |
| **Database indexes** | ~60 |
| **Seed problems** | ~228 (180 Go, 48 Python) |
| **Middleware chain depth** | 9 (11 counting rate limiters) |
| **WebSocket events** | 9 types |
| **Curriculum lessons** | ~200+ across 6 courses |
| **Curriculum section types** | 11 (ENUM) |
| **AI assist actions** | 8 (rephrase, hints, test cases, regenerate, difficulty, signatures, edge cases, chat) |
| **shadcn/ui primitives** | 17 |
| **Custom components** | 57 |
| **External Go deps** | 7 |
| **Sandbox external deps** | 0 (stdlib only) |

---

## 14. Architecture Decision Records

| ADR | Decision | Rationale |
|---|---|---|
| ADR-001 | Monolithic Go backend | Single binary; no orchestration overhead for small cohort |
| ADR-002 | Raw pgx/v5 over ORM | Predictable SQL, smaller footprint, explicit query design |
| ADR-003 | Docker subprocess for execution | gVisor unavailable on Oracle free tier; WASM immature for Go |
| ADR-004 | System Prompt JSON (NVIDIA NIM) | DeepSeek V4 Flash doesn't support `response_format` reliably |
| ADR-005 | Go text/template for test gen | Type-safe conditional logic; auditable independently |
| ADR-006 | Remote HTTP Sandbox (Railway) | Eliminates Docker-in-Docker; consistent isolation |
| ADR-007 | NVIDIA NIM (DeepSeek V4 Flash) single provider | Free-tier API; consolidated from dual-provider (Gemini+Groq) |
| ADR-008 | `language_versions` JSONB | Single column for multi-language schema; avoids EAV antipattern |
| ADR-009 | In-memory cache over Redis | Zero-cost; 30s TTL sufficient for leaderboard/notifications |
| ADR-010 | Pyodide CDN over server-side Python | Zero-cost browser-side execution; singleton loader prevents duplicates |
| ADR-011 | Per-language localStorage (`koder_code_{slug}_{lang}`) | Save & switch between Go/Python scaffolds in workspace |
| ADR-012 | Bulk lesson dependency via `ANY($1)` | Single query; avoids N+1 per-lesson |
| ADR-013 | Client-side dependency locking | No extra backend calls; instant UI feedback |
| ADR-014 | Public lesson detail endpoint for admin dep picker | Reuses existing endpoint; no separate admin endpoint needed |
| ADR-015 | Separate module lock systems | Curriculum `locked` column vs problem `module_locks` table — two different "module" concepts |
| ADR-016 | pg_advisory_xact_lock for progress race prevention | Prevents XP double-award on concurrent first-solve without table-level locks |

---

## 15. Known Issues & Stale Documentation

1. **`.github/copilot-instructions.md`** — References Gemini genai SDK (removed), httpOnly cookies (JWT in localStorage), semaphore cap=2 (now 6), timeout 5s (now 30s), Docker memory 64m (now 256m). Needs full rewrite.
2. **`@tanstack/react-virtual`** — Listed in `frontend/package.json` but unused. Should be removed.
3. **Session log duplication** — `.opencode/session-log.md` is stale (last entry July 9). Canonical log is `SESSION_LOG.md`.
4. **`sandbox/secure_unix.go`** — `resourceLimits` uses raw numeric values for `RLIMIT_NPROC` (6) and `RLIMIT_NOFILE` (7) instead of `syscall.RLIMIT_NPROC` / `syscall.RLIMIT_NOFILE`. Works on linux/arm64 but needs verification.
5. **`sandbox/main.go`** — `forcePackageKoder` regex is duplicated in both `sandbox/runtest_go.go` and `internal/executor/sandbox.go`. Should be shared.
6. **`@google/genai`** dep — Listed in `go.mod` but may be unused after NVIDIA NIM migration.
7. **`internal/config/config_test.go`** — Referenced in CODEBASE_INDEX.md but may need verification of test count (15 tests listed but could be missing).

---

*Generated: 2026-07-22 | Branch: `update` | Fully verified: `go vet`, `go test`, ESLint, `tsc --noEmit`*
