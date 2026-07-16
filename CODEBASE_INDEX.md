# Koder — Professional Codebase Index

> Comprehensive, line-level inventory of the zero-cost, production-grade automated code-grading platform for Go & Python curricula.
>
> Generated: 2026-07-16 | Branch: `update` | Tests: **126 passing**, `go vet` clean, ESLint 0 errors, TypeScript 0 errors

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Name** | Koder |
| **Purpose** | Automated code-grading platform for Go & Python programming curricula |
| **Repository** | `github.com/jerryjuche/koder` |
| **Go Module** | `github.com/jerryjuche/koder` (Go 1.26.1) |
| **Sandbox Go Module** | `github.com/jerryjuche/koder/sandbox` (Go 1.23, **zero external deps**) |
| **Frontend** | Next.js 15.5.19 + React 19.2.7 + Tailwind CSS 4.1.11 |
| **Database** | PostgreSQL 15 (Supabase, 500MB) — 24 tables, 39 migrations |
| **Test Suite** | 126 Go tests + frontend ESLint/TypeScript — 0 failures |
| **Budget** | $0/month (Oracle Ampere A1 + Supabase Free + Vercel Hobby + Railway Starter) |
| **Active Branch** | `update` (all Pyodide + curriculum CMS + redesign phases complete) |

---

## 2. Repository Statistics

| Category | Files | Lines of Code |
|---|---|---|
| **Go Backend** (`cmd/` + `internal/`) | 49 source + 13 test | **16,852** |
| **Go Sandbox** (`sandbox/`) | 8 source | **1,185** |
| **Frontend Source** (`app/`, `components/`, `hooks/`, `lib/`, `styles/`) | 105 | **20,151** |
| **SQL Migrations** (`migrations/`) | 39 | **~15,000** |
| **Scripts** (`scripts/`) | 3 | **329** |
| **Documentation** (`.md`) | 13 | **~7,500** |
| **Configuration** (root configs, CI, frontend configs) | 12 | **~680** |
| **Public Assets** (images, icons, Monaco workers) | 131 | Binary/~71 KB JS |
| **Total (tracked source)** | **~210** | **~51,000** |

---

## 3. Directory Map

```
koder/
├── cmd/server/main.go                      # Entry point: bootstrap, chi router, DB pool, graceful shutdown
│
├── internal/
│   ├── api/                                # HTTP handlers — 24 source files, 4,621 lines
│   ├── auth/                               # JWT, OAuth, password — 5 files, 663 lines
│   ├── broker/                             # In-memory pub/sub — 2 files, 254 lines
│   ├── config/                             # Env var loading/validation — 2 files, 566 lines
│   ├── enricher/                           # AI test generation — 2 files, 979 lines
│   ├── executor/                           # Code execution engine — 7 files, 2,326 lines
│   ├── parser/                             # GitHub YAML curriculum parser — 2 files, 717 lines
│   └── store/                              # Database access layer — 19 files, 4,497 lines
│
├── sandbox/                                # Remote execution service (Railway)
│   └── 8 source files, 1,185 lines, zero external deps
│
├── frontend/                               # Next.js 15 App Router
│   ├── app/                                # 12 route groups — 32 files
│   ├── components/                         # 35 shared components
│   ├── hooks/                              # 3 custom hooks
│   ├── lib/                                # 10 modules (api, types, cache, event, UserContext...)
│   ├── styles/                             # 3 CSS files (theme, typography, globals)
│   └── public/                             # Images, Monaco workers, module icons
│
├── migrations/                             # SQL schema — 31 migrations
├── scripts/                                # 3 utility scripts
├── .github/workflows/ci.yml               # CI pipeline — 4 jobs
├── build.sh                                # Cross-compile deployment
└── Procfile                                # Render process definition
```

---

## 4. Go Backend — Complete File Inventory

### 4.1 Entry Point

| File | Lines | Package | Purpose |
|---|---|---|---|
| `cmd/server/main.go` | 125 | `main` | Server bootstrap: config → store → executor → router → graceful shutdown |

### 4.2 API Handlers (`internal/api/`)

| File | Lines | Purpose |
|---|---|---|
| `router.go` | 196 | Chi route registration, middleware wiring, lifecycle endpoints (`/health`, `/version`) |
| `middleware.go` | 441 | 9 middleware: Recovery, CORS, SecurityHeaders (CSP), BodySizeLimit, AuthMiddleware, AdminOnly, VerifiedContributorOnly, RateLimit, IPRateLimiter, RequestLogging |
| `middleware_test.go` | 618 | 23 tests: rate limiter, IP rate limiter, claims extraction, role checks, body limits, CORS variants, recovery |
| `auth.go` | 496 | Register, Login, Google OAuth, complete-onboarding, link-google, logout (JWT blacklist), check-username |
| `me.go` | 322 | GET /me, PUT /me/username (one-time), PUT /me/profile, POST /me/delete-account, PUT /me/language |
| `change_password.go` | 266 | POST /auth/change-password, /verify-pin, /set-pin |
| `pin_reset.go` | 257 | POST /auth/forgot-password-pin, /reset-password-pin |
| `password_reset.go` | 255 | POST /auth/forgot-password (Resend email), /reset-password (token) |
| `problems.go` | 131 | GET /problems (paginated, language filter, solved status), GET /problems/:slug |
| `submissions.go` | 140 | POST /submit — rate-limited, language-aware, scoring + progress update |
| `test.go` | 117 | POST /test — no-scoring execution, language inference |
| `admin.go` | 503 | Ingest GitHub YAML, enrich (single/batch), stats, activity, visibility toggle, publish-all, approve/reject contributions |
| `leaderboard.go` | 40 | GET /leaderboard?period=all\|weekly\|monthly — cache-first (30s TTL) |
| `profile.go` | 257 | GET /me/profile (full profile with rank/stats), PUT /me/profile |
| `activity.go` | 54 | GET /me/activity?year= — contribution heatmap data |
| `community.go` | 139 | GET community solutions, GET best-practices, POST/DELETE likes |
| `contributions.go` | 85 | POST /user-problems, GET /me/contributions |
| `broadcasts.go` | 237 | Admin CRUD + activate/deactivate + user list/dismiss |
| `feedback.go` | 345 | Submit feedback, list mine, admin list/counts/status-update, problem reports |
| `notifications.go` | 115 | GET unread/recent, POST read-all, POST read |
| `cache.go` | 132 | In-memory TTL cache with stop channel + user/leaderboard variants |
| `ws.go` | 75 | WebSocket upgrade handler (gorilla/websocket) + broker subscription |
| `responses.go` | 95 | RespondSuccess, RespondCreated, RespondError, SetAuthCookie, ClearAuthCookie |
| `responses_test.go` | 214 | 9 tests: response helpers, cookie setting (HTTP/HTTPS), content-type |

### 4.3 Auth (`internal/auth/`)

| File | Lines | Purpose |
|---|---|---|
| `jwt.go` | 99 | GenerateToken (HS256, claims), ValidateToken, SetAuthCookie |
| `oauth.go` | 216 | Google ID token verification via JWKS (key rotation, RSA extraction, audience/issuer) |
| `password.go` | 28 | HashPassword (bcrypt), CheckPassword |
| `auth_test.go` | 209 | 15 tests: JWT generation/validation (valid/expired/invalid), bcrypt correct/incorrect |
| `oauth_test.go` | 111 | 5 tests: audience/issuer validation, JWKS key round-trip |

### 4.4 Broker (`internal/broker/`)

| File | Lines | Purpose |
|---|---|---|
| `broker.go` | 68 | In-memory pub/sub: map of client ID → buffered channel (32), non-blocking publish |
| `broker_test.go` | 186 | 10 tests: subscribe uniqueness, publish delivery (1/N), overflow, concurrent |

### 4.5 Config (`internal/config/`)

| File | Lines | Purpose |
|---|---|---|
| `config.go` | 307 | Loads 30+ env vars: DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, GROQ_API_KEY, SANDBOX_URL, ADMIN_EMAIL, etc. |
| `config_test.go` | 259 | 15 tests: missing keys, provider selection, timeout validation, JWT expiry |

### 4.6 Enricher (`internal/enricher/`)

| File | Lines | Purpose |
|---|---|---|
| `enricher.go` | 748 | AI test case generation: Gemini (ResponseSchema) + Groq (JSON mode), dual-language prompts, rate-limited (30s/2s), retry with backoff, LanguageVersions population |
| `enricher_test.go` | 231 | 4 tests: provider config, response parsing, schema generation |

### 4.7 Executor (`internal/executor/`)

| File | Lines | Purpose |
|---|---|---|
| `executor.go` | 1,306 | Core engine: semaphore (max 6), Go/Python execution, formatGoLiteral/formatPythonLiteral, sandbox orchestration, scoring, EnhancePythonError |
| `executor_test.go` | 533 | 16 tests: Go literal formatting (all types), Python literal formatting (incl. null/None), output parsing, orchestration |
| `parser.go` | 111 | Regex extraction of PASS/FAIL/GOT/WANT from `go test -v` output |
| `sandbox.go` | 72 | Per-execution UUID temp dir creation + deferred cleanup |
| `sandbox_client.go` | 166 | HTTP client for remote Railway sandbox with timeout and retry |
| `templates.go` | 104 | Go text/template: goTestTemplate (reflect.DeepEqual), pythonTestTemplate (json.loads compare) |
| `types.go` | 34 | ExecutionRequest, ExecutionResult, TestResult structs |

### 4.8 Parser (`internal/parser/`)

| File | Lines | Purpose |
|---|---|---|
| `parser.go` | 371 | GitHub YAML curriculum parser: clone repo, detect problem type, normalize slug/module, SHA256 idempotency |
| `parser_test.go` | 346 | 13 tests: isReadmeFile, detectProblemType, normalizeSlug, computeSourceHash, parseGitHubURL, parseSSHURL |

### 4.9 Store (`internal/store/`)

| File | Lines | Purpose |
|---|---|---|
| `store.go` | 202 | Store interface (60+ methods) + PostgresStore, NewPostgresStore (pool: MinConns=2, MaxConns=10), Ping |
| `types.go` | 337 | All data types: User, Problem, Submission, Progress, TestCase, Feedback, Broadcast, Notification, UserProblem, Profile, LanguageVersions, FlexibleBool |
| `types_test.go` | 47 | 2 tests: FlexibleBool JSON marshal/unmarshal |
| `errors.go` | 67 | FriendlyError type + NewDuplicate/NotFound/Validation + IsUniqueViolation (Postgres code 23505) |
| `errors_test.go` | 102 | 7 tests: FriendlyError wrapping, unique violation detection |
| `users.go` | 1,185 | User CRUD: Create, GetByEmail/Username/ID/StudentID/GoogleID, Update, SetPassword, LinkGoogle, SetPinHash, SetUsername, GetAllIDs, DeleteUser (cascade) |
| `users_test.go` | 154 | 4 tests: CreateUser, GetByEmail, duplicate email, GetByID |
| `problems.go` | 770 | Problem queries: ListVisibleProblems (paginated, solved status, language filter), GetProblemBySlug, Upsert/Update, UpsertEnrichedProblem, ListAllProblems |
| `submissions.go` | 224 | CreateSubmission (with output_logs TTL), GetBestSubmission, GetCommunitySolutions, GetBestPractices |
| `progress.go` | 153 | UpsertProgress (solved, stars, best_runtime, XP), GetSolvedCount, CalculateStreak |
| `testcases.go` | 94 | GetTestCasesForProblem, UpsertTestCasesForProblem (transactional replace) |
| `admin.go` | 71 | GetAdminStats, LogActivity, PublishAllDrafts |
| `feedback.go` | 192 | CreateFeedback, GetUserFeedback, GetAdminFeedback (with filters), GetCounts, UpdateStatus, ListProblemReports |
| `broadcasts.go` | 168 | Create, GetActive (with dismissal), GetAdmin, Deactivate/Activate/Delete, Dismiss, NotifyAllUsers |
| `notifications.go` | 190 | Create (single/all), GetUnread, GetRecent, MarkRead/MarkAllAsRead |
| `user_problems.go` | 358 | Community contributions: Create, GetPending, Approve (transactional + notify), Reject, GetMyContributions |
| `profile.go` | 112 | GetFullProfile (rank/XP/stars), GetModuleProficiency, GetRecentSubmissions, GetSolvedCount/Streak |
| `token_blacklist.go` | 33 | AddToBlacklist, IsBlacklisted, expired cleanup |
| `password_reset.go` | 48 | CreateResetToken, ValidateResetToken, MarkTokenUsed |

---

## 5. Go Sandbox (`sandbox/`) — Remote Execution Service

| File | Lines | Purpose |
|---|---|---|
| `main.go` | 384 | HTTP server: /health, /version, /execute; language-aware routing; security message signing |
| `pyrunner.go` | 265 | Python runner: findPythonBin (PATH discovery), validatePythonAST (with timeout), runPythonTests, compileErrorMessage with file/line extraction |
| `runtest_go.go` | 148 | Go test runner: stdout/stderr capture, compileErrorMessage |
| `ratelimit.go` | 156 | Per-IP sliding window: 10 req/min, 429 with Retry-After |
| `secure.go` | 111 | Go + Python dangerous pattern validation (regex blocklist) |
| `secure_unix.go` | 64 | setrlimit: NPROC=6, NOFILE=1024, FSIZE=64MB, RLIMIT_AS=512MB, Setpgid |
| `secure_other.go` | 25 | Noop stubs for non-Unix |
| `security_message_test.go` | 32 | 3 tests: security message validation |
| `Dockerfile` | 19 | Two-stage ARM64 build, adds python3 |
| `go.mod` | 3 | Standalone module, zero external deps (stdlib only) |

---

## 6. Frontend — Complete File Inventory

### 6.1 App Router Pages (`frontend/app/`)

#### Route Group: Root & Landing

| File | Lines | Purpose |
|---|---|---|
| `layout.tsx` | 35 | Root layout: fonts, metadata, providers, toast |
| `page.tsx` | 3 | Root page: redirects to /landing |
| `globals.css` | 78 | Tailwind CSS 4 imports + CSS variables |
| `not-found.tsx` | 33 | Custom 404 page with terminal icon |
| `global-error.tsx` | 26 | Global error boundary |
| `landing/page.tsx` | 9 | Marketing landing page server component |

#### Route Group: `(auth)` — Unauthenticated

| File | Lines | Purpose |
|---|---|---|
| `(auth)/layout.tsx` | 12 | Centered card layout |
| `(auth)/login/page.tsx` | 175 | Login page: Google-first + email form |
| `(auth)/register/page.tsx` | 212 | Registration: Google-first + form |
| `(auth)/onboarding/page.tsx` | 59 | Post-registration: username + language setup |
| `(auth)/forgot-password/page.tsx` | 125 | PIN-based forgot password flow |
| `(auth)/reset-password/page.tsx` | 100 | Password reset with token |

#### Route Group: `(main)` — Authenticated

| File | Lines | Purpose |
|---|---|---|
| `(main)/layout.tsx` | 24 | Main layout: TopNav + BroadcastBanner + FeedbackButton |
| `(main)/error.tsx` | 22 | Main-level error boundary |
| `(main)/home/page.tsx` | 227 | Dashboard: problem grid, language filter tabs, module cards, pagination |
| `(main)/home/loading.tsx` | 31 | Home page skeleton loader |
| `(main)/home/error.tsx` | 22 | Home page error boundary |
| `(main)/leaderboard/page.tsx` | 57 | Leaderboard server component |
| `(main)/leaderboard/LeaderboardClient.tsx` | 267 | Leaderboard client: podium, table, period filter |
| `(main)/leaderboard/loading.tsx` | 23 | Leaderboard skeleton |
| `(main)/leaderboard/error.tsx` | 12 | Leaderboard error boundary |
| `(main)/profile/page.tsx` | 23 | Profile server component |
| `(main)/profile/ProfileClient.tsx` | 164 | Profile: tabs, stats, activity |
| `(main)/profile/loading.tsx` | 27 | Profile skeleton |
| `(main)/profile/error.tsx` | 12 | Profile error boundary |
| `(main)/profile/components/ProfileHeader.tsx` | 112 | Avatar, name, rank, XP, verified badge |
| `(main)/profile/components/StatsOverview.tsx` | 71 | Solved count, streak, best runtime |
| `(main)/profile/components/ProgressMetrics.tsx` | 84 | Difficulty breakdown charts |
| `(main)/profile/components/Achievements.tsx` | 84 | Achievement badges grid |
| `(main)/profile/components/RecentActivity.tsx` | 80 | Last submissions list |
| `(main)/profile/components/ActivityFeed.tsx` | 86 | User activity timeline |
| `(main)/profile/components/ContributionGraphSection.tsx` | 36 | GitHub-style heatmap wrapper |
| `(main)/profile/components/MyContributions.tsx` | 75 | User-submitted problem list |
| `(main)/settings/page.tsx` | 320 | Settings: profile, security, notifications tabs |
| `(main)/settings/error.tsx` | 12 | Settings error boundary |
| `(main)/contribute/page.tsx` | 127 | Community problem contribution form |
| `(main)/contribute/error.tsx` | 12 | Contribute error boundary |
| `(main)/problems/[slug]/success/page.tsx` | 131 | Post-submission success/celebration |
| `(main)/admin/page.tsx` | 73 | Admin dashboard with tabs |
| `(main)/admin/error.tsx` | 12 | Admin error boundary |
| `(main)/admin/FeedbackPanel.tsx` | 203 | Feedback list with status/type/priority filters |
| `(main)/admin/BroadcastPanel.tsx` | 139 | Broadcast CRUD with toggle switches |
| `(main)/admin/PendingContributions.tsx` | 139 | Community problem approval queue |
| `(main)/admin/ProblemEditPanel.tsx` | 255 | Full problem editor with preview |
| `(main)/admin/ProblemReports.tsx` | 301 | Bug reports grouped by slug, grouped/flat toggle |

#### Route Group: `(legal)`

| File | Lines | Purpose |
|---|---|---|
| `(legal)/layout.tsx` | 9 | Legal pages layout |
| `(legal)/privacy/page.tsx` | 151 | Privacy policy |
| `(legal)/terms/page.tsx` | 109 | Terms of service |

#### Problems (no route group — `app/problems/`)

| File | Lines | Purpose |
|---|---|---|
| `problems/[slug]/page.tsx` | 21 | Workspace server component |
| `problems/[slug]/DynamicWorkspace.tsx` | 8 | Client wrapper (next/dynamic) |
| `problems/[slug]/ProblemWorkspaceClient.tsx` | 1,877 | Monaco editor, language toggle, submit/test, results, fullscreen, bug report |
| `problems/[slug]/error.tsx` | 13 | Workspace error boundary |

#### OAuth

| File | Lines | Purpose |
|---|---|---|
| `oauth/callback/page.tsx` | 9 | OAuth callback handler |

### 6.2 Shared Components (`frontend/components/`)

#### Feature Components

| File | Lines | Purpose |
|---|---|---|
| `BroadcastBanner.tsx` | 109 | Color-coded dismissable banner, 30s polling |
| `FeedbackButton.tsx` | 294 | Floating action button → modal (General/Bug/Feature), screenshot upload |
| `GoogleLinkBanner.tsx` | 18 | Amber banner to link Google account |
| `LandingContent.tsx` | 54 | Marketing landing page content |
| `LanguageLogo.tsx` | 50 | Renders Go/Python SVG icons |
| `LanguageSelector.tsx` | 115 | Full-screen Go/Python onboarding language picker |
| `multi-step-loader-demo.tsx` | 68 | Loading animation demo |
| `TestResultPanel.tsx` | 313 | LCS-based unified diff, per-test pass/fail cards, Python debugging tips |

#### Auth Components (`components/auth/`)

| File | Lines | Purpose |
|---|---|---|
| `google-button.tsx` | 37 | Dark Google Sign-In button with SVG |
| `bottom-gradient.tsx` | 8 | Amber gradient hover animation |
| `label-input-container.tsx` | 16 | Input + label spacing |
| `auth-divider.tsx` | 11 | "or" divider with border |
| `index.ts` | 9 | Re-exports |

#### Base Components (`components/base/`)

| File | Lines | Purpose |
|---|---|---|
| `avatar/avatar.tsx` | 103 | Avatar: src/initials fallback, sizes (sm/md/lg/xl), verified gold badge |
| `input/pin-input.tsx` | 49 | OTP-based PIN input with mask support |

#### Dashboard Components (`components/dashboard/`)

| File | Lines | Purpose |
|---|---|---|
| `ModuleCards.tsx` | 259 | Module grid with WebP images, loading skeleton, fade-in |

#### Kibo UI (`components/kibo-ui/`)

| File | Lines | Purpose |
|---|---|---|
| `code-block/index.tsx` | 100 | Shiki syntax highlighting component |
| `code-block/server.tsx` | 27 | Server-side code block rendering |
| `contribution-graph/index.tsx` | 202 | GitHub-style contribution heatmap |

#### Layout (`components/layout/`)

| File | Lines | Purpose |
|---|---|---|
| `TopNav.tsx` | 310 | Navigation: logo, links, notification bell, language switcher, admin badge, user menu |

#### shadcn/ui Primitives (`components/ui/`)

| File | Lines | Purpose |
|---|---|---|
| `avatar.tsx` | 47 | Radix Avatar wrapper |
| `badge.tsx` | 28 | Badge with variants |
| `button.tsx` | 50 | Button with variants/sizes |
| `card.tsx` | 35 | Card layout component |
| `dialog.tsx` | 61 | Radix Dialog wrapper |
| `dropdown-menu.tsx` | 187 | Radix Dropdown Menu |
| `input.tsx` | 22 | Input component |
| `input-otp.tsx` | 50 | OTP input pattern |
| `label.tsx` | 16 | Label component |
| `progress.tsx` | 26 | Progress bar |
| `select.tsx` | 110 | Radix Select |
| `tabs.tsx` | 35 | Radix Tabs |
| `textarea.tsx` | 18 | Textarea component |
| `tooltip.tsx` | 27 | Radix Tooltip |
| `activity-gauge.tsx` | 76 | Gauge chart component |
| `multi-step-loader.tsx` | 166 | Animated multi-step loading |

### 6.3 Custom Hooks (`frontend/hooks/`)

| File | Lines | Purpose |
|---|---|---|
| `use-google-one-tap.ts` | 102 | Shared GIS singleton: init once, prompt + renderButton |
| `use-has-mounted.ts` | 9 | SSR-safe mount detection (replaces useState+useEffect pattern) |
| `use-mobile.ts` | 12 | Mobile viewport detection |

### 6.4 Lib Modules (`frontend/lib/`)

| File | Lines | Purpose |
|---|---|---|
| `api.ts` | 499 | fetchApi wrapper + 40+ endpoint functions (auth, problems, submissions, admin, etc.) |
| `types.ts` | 426 | TypeScript interfaces matching backend: User, Problem, Submission, Feedback, etc. |
| `utils.ts` | 79 | cn(), getUserColor(), formatRelativeTime, formatNumber |
| `cache.ts` | 66 | sessionStorage cache with 30s TTL + invalidation helpers |
| `event.ts` | 79 | WebSocket hook with auto-reconnect + exponential backoff |
| `UserContext.tsx` | 98 | Auth state context provider with periodic refresh + event-based invalidation |
| `useNotifications.ts` | 59 | Notification polling hook (15s) + markAsRead with cache clear |
| `achievements.ts` | 38 | Achievement definitions and unlock logic |
| `toast.tsx` | 15 | Sonner toast setup |
| `index.ts` | 11 | Re-exports |

### 6.5 Styles (`frontend/styles/`)

| File | Lines | Purpose |
|---|---|---|
| `globals.css` | 78 | Global CSS reset + Tailwind directives |
| `theme.css` | 856 | Theme variables: colors, spacing, typography tokens |
| `typography.css` | 430 | Typography scale: headings, body, code blocks |

### 6.6 Config & Scripts

| File | Lines | Purpose |
|---|---|---|
| `next.config.ts` | 86 | CSP headers, image optimization, package transpilation |
| `tsconfig.json` | 34 | TypeScript: ES2017, bundler, strict, JSX preserve |
| `tailwind.config.ts` | (v4) | Tailwind CSS 4 config |
| `postcss.config.mjs` | 9 | PostCSS: Tailwind + Autoprefixer |
| `.eslintrc.json` | 3 | ESLint: extends next |
| `eslint.config.mjs` | (new) | ESLint flat config |
| `components.json` | 25 | shadcn/ui config (Radix Rhea, Zinc) |
| `package.json` | 66 | Dependencies: Next.js 15, React 19, Monaco, shadcn, Framer Motion, Recharts, Shiki, Sonner |
| `scripts/copy-monaco.mjs` | 16 | Copies Monaco workers to public/vs/ |

---

## 7. Database Migrations (`migrations/`)

### 7.1 Schema Migrations

| Migration | Lines | Purpose |
|---|---|---|
| `001_init.sql` | 77 | Core schema: users, problems, test_cases, submissions, progress |
| `002_indexes.sql` | 33 | Performance indexes: student_id, slug, submission lookups |
| `003_activity_logs.sql` | 10 | Admin audit: activity_logs table |
| `005_community_contributions.sql` | 35 | user_problems table + verified role |
| `006_notifications.sql` | 14 | notifications table |
| `007_submission_likes.sql` | 12 | submission_likes unique constraint |
| `008_user_profile.sql` | 4 | bio column on users |
| `009_get_full_profile.sql` | 167 | PL/pgSQL get_full_profile stored procedure |
| `010_add_gitea_auth.sql` | 5 | Gitea OAuth columns (legacy) |
| `011_add_gitea_token.sql` | 2 | Gitea PAT column |
| `012_add_google_auth.sql` | 138 | Google OAuth: google_id, google_email, username, email schema |
| `013_fix_rank_tiebreaker.sql` | 145 | Rank ordering: XP DESC, solved_count DESC |
| `014_feedback.sql` | 18 | feedback table: type, priority, status, screenshot |
| `015_broadcasts.sql` | 25 | broadcasts + user_broadcast_status |
| `016_add_streak_index.sql` | 3 | Composite index for streak queries |
| `017_optimization_indexes.sql` | 26 | 16 high-impact performance indexes |
| `020_token_blacklist.sql` | 9 | JWT revocation table |
| `021_password_reset.sql` | 11 | password_reset_tokens table |
| `022_add_pin_hash.sql` | 2 | PIN hash column for recovery |
| `023_split_problem_fields.sql` | 9 | constraints + learning_objective columns |
| `024_add_username_set.sql` | 4 | username_set flag for onboarding |
| `025_report_issue_fields.sql` | 10 | problem_slug, code_snippet, error_message on feedback |
| `026_output_logs_ttl.sql` | 7 | output_logs_expires_at (90-day TTL) |
| `027_language_versions.sql` | 16 | primary_language on users, language_versions JSONB on problems |
| `028_backfill_language_versions.sql` | 111 | PL/pgSQL helpers: koder_to_snake_case, koder_go_type_to_python |
| `029_ensure_language_versions.sql` | 163 | Guarantee all problems have Go + Python language_versions |
| `031_python_intermediate_seed.sql` | — | 10 Python intermediate problems |
| `032_python_variables_math_seed.sql` | — | 1 Python variables & math problem |
| `033_add_user_problems_language_versions.sql` | — | language_versions on user_problems |
| `034_python_arrays_strings_seed.sql` | — | 7 Python arrays & strings problems |
| `035_ai_usage_logs.sql` | — | ai_usage_logs table |
| `036_refresh_tokens.sql` | — | refresh_tokens table |
| `037_seed_go_fundamentals.sql` | — | 5 Go fundamentals problems |
| `038_curriculum_cms.sql` | — | 8 tables: courses→modules→lessons→sections+projects+deps+progress |

### 7.2 Seed Migrations

| Migration | Lines | Purpose |
|---|---|---|
| `019_seed_problems1.sql` | 2,380 | 45 problems: math-recursion, arrays-strings, data-structures |
| `019_seed_problems2.sql` | 2,360 | 45 problems: bit-manipulation, sorting-searching, pointers |
| `019_seed_problems3.sql` | 1,576 | 45 problems: error-handling, interfaces-generics |
| `019_seed_problems4.sql` | 3,162 | 45 problems: hashmaps-sets, linked-lists, trees-graphs, dynamic-programming |
| `031_python_intermediate_seed.sql` | — | 10 Python intermediate problems |
| `032_python_variables_math_seed.sql` | — | 1 Python variables & math problem |
| `034_python_arrays_strings_seed.sql` | — | 7 Python arrays & strings problems |
| `037_seed_go_fundamentals.sql` | — | 5 Go fundamentals problems |
| `999_seed_python_test.sql` | 62 | Python test problem for pipeline verification |

---

## 8. Configuration & Environment

### 8.1 Backend Config (`internal/config/config.go`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | Supabase PostgreSQL connection string |
| `JWT_SECRET` | — | HS256 signing key (min 32 chars) |
| `GEMINI_API_KEY` | — | Google AI Studio API key |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model |
| `ENRICHMENT_PROVIDER` | `gemini` | gemini or groq |
| `GROQ_API_KEY` | — | Groq API key |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model |
| `GOOGLE_CLIENT_ID` | — | Google OAuth client ID |
| `ADMIN_EMAIL` | — | Admin account email |
| `ADMIN_PASSWORD` | — | Admin account password |
| `SANDBOX_URL` | — | Remote sandbox URL (empty = local Docker) |
| `RESEND_API_KEY` | — | Resend email API |
| `GO_VERSION` | `1.23` | Go version for sandbox |
| `EXECUTOR_MAX_CONCURRENCY` | `6` | Max concurrent executions |
| `EXECUTOR_TIMEOUT_SECONDS` | `30` | Per-execution timeout |
| `DOCKER_IMAGE` | `golang:1.23-alpine` | Sandbox Docker image |
| `SANDBOX_BASE_DIR` | `/tmp/koder-sandbox` | Temp directory |
| `BUILD_CACHE_DIR` | `/tmp/koder-cache` | Go build cache |

### 8.2 Frontend Config

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | — | Google OAuth client ID |

### 8.3 Key Dependencies

| Go Dependency | Version | Purpose |
|---|---|---|
| `github.com/go-chi/chi/v5` | 5.3.0 | HTTP router |
| `github.com/golang-jwt/jwt/v5` | 5.2.0 | JWT auth |
| `github.com/gorilla/websocket` | 1.5.3 | WebSocket |
| `github.com/jackc/pgx/v5` | 5.5.5 | PostgreSQL |
| `golang.org/x/crypto` | 0.36.0 | bcrypt |
| `google.golang.org/genai` | 1.60.0 | Gemini AI |

| Frontend Dependency | Purpose |
|---|---|
| `next` 15.5.19 | Framework |
| `react` / `react-dom` 19.2.7 | UI |
| `@monaco-editor/react` 4.7.0 | Code editor |
| `framer-motion` 12.23.24 | Animations |
| `recharts` 3.9.0 | Charts |
| `shiki` 3.4.1 | Syntax highlighting |
| `sonner` 2.0.3 | Toast notifications |
| `canvas-confetti` 1.9.3 | Celebration effects |
| `lucide-react` / `@radix-ui/*` / `tailwind-merge` | shadcn/ui deps |

---

## 9. CI/CD Pipeline (`.github/workflows/ci.yml`)

| Job | Commands | Trigger |
|---|---|---|
| **backend** | `go vet ./...` → `go test ./... -count=1` → `go build ./cmd/server` + `go build ./sandbox` | Push to main/python-curricula, PR to main |
| **frontend** | `npm ci` → `npm run lint` → `npx tsc --noEmit` → `npm run build` | Push to main/python-curricula, PR to main |
| **deploy-backend** | Render deploy webhook | main branch only, after backend |
| **deploy-sandbox** | Railway deploy webhook | main branch only, after backend |

---

## 10. Test Coverage Summary

| Package | Test File | Tests |
|---|---|---|
| `internal/api` | `middleware_test.go` | 23 |
| `internal/api` | `responses_test.go` | 9 |
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
| **Total** | **13 test files** | **126 tests** |

---

## 11. Frontend Public Assets

| Directory | Files | Description |
|---|---|---|
| `frontend/public/modules/*.webp` | 13 | Module card images (WebP) for each of 13 modules |
| `frontend/public/icons/*.svg` | 2 | Go gopher logo + Python logo |
| `frontend/public/logo.png` | 1 | App logo (52 KB) |
| `frontend/public/vs/*.js` | 113 | Monaco Editor workers (80+ languages, localization, core) |

---

## 12. Documentation Files

| File | Lines | Purpose |
|---|---|---|
| `CLAUDE.md` | 884 | AI session context primer — complete project reference |
| `README.md` | 1,244 | Full project documentation |
| `BRAIN.md` | 54 | Agent startup guide / session instructions |
| `implementation.md` | 898 | Multi-language 12-phase implementation plan |
| `CODEBASE_INDEX.md` | (this) | Comprehensive file-by-file codebase index |
| `CODEBASE_ANALYSIS.md` | 79 | Deep architecture analysis |
| `SESSION_LOG.md` | 1,038 | Chronological session logbook |
| `PROGRESS.txt` | 214 | Multi-language phase completion tracker |
| `UPDATE_LOG.txt` | 253 | Full changelog since inception |

---

## 13. Key Metrics

| Metric | Value |
|---|---|
| **Go source files** | 72 (49 source + 13 test + 10 config/build) |
| **Go lines of code** | 16,852 |
| **Frontend source files** | 105 |
| **Frontend lines of code** | 20,151 |
| **SQL migrations** | 39 (15,000+ lines) |
| **Total tracked source LOC** | ~55,000 |
| **Go tests** | 126 — all passing |
| **API endpoints** | 89+ |
| **Database tables** | 24 |
| **Database indexes** | 45+ |
| **Seed problems** | 198 (185 Go + 13 Python) |
| **Middleware chain depth** | 11 middleware |
| **Frontend route groups** | 7 (root, landing, auth, main, problems, legal, oauth) |
| **Custom components** | 40+ |
| **shadcn/ui primitives** | 17 (incl. multi-step-loader) |
| **Public assets** | 131 (images, icons, Monaco workers) |
| **External Go deps** | 7 direct |
| **Sandbox external deps** | 0 (stdlib only) |

---

## 14. Architecture Decision Records

| ADR | Decision | Rationale |
|---|---|---|
| ADR-001 | Monolithic Go backend | Single binary for small cohort; no orchestration overhead |
| ADR-002 | Raw pgx/v5 over ORM | Predictable SQL, smaller footprint, explicit query design |
| ADR-003 | Docker subprocess for execution | gVisor unavailable on Oracle free tier; WASM immature for Go |
| ADR-004 | System Prompt JSON (NVIDIA NIM) | DeepSeek V4 Flash doesn't support response_format reliably; prompt enforcement + post-validation instead |
| ADR-005 | Go text/template for test gen | Type-safe conditional logic; auditable independently |
| ADR-006 | Remote HTTP Sandbox | Eliminates Docker-in-Docker; consistent isolation; Railway free tier |
| ADR-007 | NVIDIA NIM (DeepSeek V4 Flash) single provider | Enforces free-tier API with rate-limit backoff; consolidated from dual-provider (Gemini+Groq) |
| ADR-008 | language_versions JSONB | Single column for multi-language schema; avoids EAV antipattern |
| ADR-009 | In-memory cache over Redis | Zero-cost; 30s TTL sufficient for leaderboard/notifications |
| ADR-010 | Pyodide CDN over server-side Python | Zero-cost; browser-side Python execution for instant feedback; singleton loader prevents duplicate loads |
| ADR-011 | Per-language localStorage for code persistence | Enables save & switch between Go/Python scaffolds in workspace; keyed as `koder_code_{slug}_{lang}` |
