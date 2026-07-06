# Koder — Professional Codebase Index

> **Koder** is a zero-cost, production-grade automated code-grading platform for Go programming curricula.
> Stack: Go 1.26 backend (chi router, pgx/v5 PostgreSQL) · Next.js 14 frontend · Oracle Cloud ARM64 · Railway sandbox · Supabase Postgres · Gemini AI

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Backend — Go Monolith](#2-backend--go-monolith)
   - [Entry Point](#21-entry-point)
   - [Configuration](#22-configuration)
   - [HTTP Router & API Handlers](#23-http-router--api-handlers)
   - [Authentication Layer](#24-authentication-layer)
   - [Database Layer (Store)](#25-database-layer-store)
   - [Code Execution Engine](#26-code-execution-engine)
   - [AI Enricher](#27-ai-enricher)
   - [GitHub Curriculum Parser](#28-github-curriculum-parser)
3. [Sandbox Service (Standalone)](#3-sandbox-service-standalone)
4. [Frontend — Next.js 14](#4-frontend--nextjs-14)
   - [Core Libraries](#41-core-libraries)
   - [Auth Pages](#42-auth-pages)
   - [Main Pages](#43-main-pages)
   - [Profile Pages](#44-profile-pages)
   - [Shared Components](#45-shared-components)
5. [Database Migrations](#5-database-migrations)
6. [Infrastructure & Constraints](#6-infrastructure--constraints)
7. [Request Flow Diagrams](#7-request-flow-diagrams)

---

## 1. Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Vercel)                          │
│  Next.js 14 SSR · Monaco Editor · Tailwind CSS · shadcn/ui  │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS (API calls)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│          Backend (Oracle Cloud Ampere A1 — ARM64)            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  cmd/server/main.go  →  chi HTTP router (:8080)       │  │
│  │  ┌─────────────────┐  ┌────────────────────────┐      │  │
│  │  │ internal/api/    │  │ internal/auth/         │      │  │
│  │  │  20 handler files│  │  JWT · bcrypt · OAuth  │      │  │
│  │  └────────┬────────┘  └────────────────────────┘      │  │
│  │           ▼                                             │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ internal/store/  (pgx/v5 — 14 CRUD files)         │  │  │
│  │  │                                                     │  │  │
│  │  │ internal/executor/  (Docker / HTTP sandbox)         │  │  │
│  │  │ internal/enricher/  (Gemini / Groq AI)              │  │  │
│  │  │ internal/parser/    (GitHub YAML ingestion)         │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                                │
              ▼                                ▼
┌─────────────────────────┐    ┌────────────────────────────┐
│  Supabase PostgreSQL    │    │  Sandbox (Railway ARM64)    │
│  10-pool connections    │    │  ┌────────────────────────┐ │
│  500MB storage limit    │    │  │ sandbox/main.go        │ │
│  24 migration files     │    │  │ go test -v executor    │ │
└─────────────────────────┘    │  │ setrlimit sandboxing   │ │
                               │  │ per-IP rate limiter    │ │
                               └────────────────────────────┘
```

---

## 2. Backend — Go Monolith

### 2.1 Entry Point

**File:** `cmd/server/main.go`

| Function | Purpose |
|---|---|
| `main()` | Loads config → connects DB pgxpool (MaxConns=10) → initializes Executor → creates chi Router (60s timeouts) → starts HTTP → graceful shutdown (SIGINT/SIGTERM) |

Startup flow:
1. `config.Load()` — reads env vars from `.env` / environment (validates all required)
2. `store.NewPostgresStore()` — pgxpool with `MaxConns=10`, `MinConns=2`, PgBouncer-compat mode
3. `executor.NewExecutor()` — creates buffered semaphore channel for concurrency control
4. If `SANDBOX_URL` is empty → background Docker warmup (pull image + go build std)
5. `api.NewRouter()` — registers all routes, middleware, handlers
6. HTTP server starts on `$PORT` (default 8080)

---

### 2.2 Configuration

**File:** `internal/config/config.go`

| Struct | Fields | Purpose |
|---|---|---|
| `Config` | 28 fields | Single config object loaded from env vars |

**Key configuration fields:**

| Field | Env Var | Default | Purpose |
|---|---|---|---|
| `DatabaseURL` | `DATABASE_URL` | _required_ | Supabase PostgreSQL connection string |
| `JWTSecret` | `JWT_SECRET` | _required (≥32 chars)_ | HS256 JWT signing key |
| `JWTExpiryHours` | `JWT_EXPIRY_HOURS` | `24` | Token lifetime |
| `EnrichmentProvider` | `ENRICHMENT_PROVIDER` | gemini/groq auto-detect | AI backend selection |
| `GeminiAPIKey` | `GEMINI_API_KEY` | _conditional_ | Google AI Studio key |
| `GeminiModel` | `GEMINI_MODEL` | `gemini-2.5-pro` | Model name |
| `GroqAPIKey` | `GROQ_API_KEY` | _conditional_ | Groq API key |
| `GroqModel` | `GROQ_MODEL` | `llama-3.3-70b-versatile` | Model name |
| `ExecutorMaxConcurrency` | `EXECUTOR_MAX_CONCURRENCY` | `6` | Max concurrent code executions |
| `ExecutorTimeoutSeconds` | `EXECUTOR_TIMEOUT_SECONDS` | `30` | Per-execution timeout |
| `DockerImage` | `DOCKER_IMAGE` | `golang:1.23-alpine` | Docker image for local execution |
| `SandboxURL` | `SANDBOX_URL` | `` (empty = local Docker) | Remote sandbox endpoint |
| `GoogleClientID` | `GOOGLE_CLIENT_ID` | _optional_ | Google OAuth client ID |
| `ResendAPIKey` | `RESEND_API_KEY` | _optional_ | Email notification service |
| `FrontendURL` | `FRONTEND_URL` | `http://localhost:3000` | For reset links |
| `GoVersion` | `GO_VERSION` | `1.23` | Go version directive |

---

### 2.3 HTTP Router & API Handlers

#### 2.3.1 Router

**File:** `internal/api/router.go`

| Function | Purpose |
|---|---|
| `NewRouter(cfg, store, exec) (http.Handler, error)` | Builds complete chi router with all middleware + route groups |

**Route groups:**

```
GET  /health                                          # Health check (no auth)
POST /auth/register        POST /auth/login           # Auth (IP rate limited: 10/min)
POST /auth/google          GET  /auth/check-username
POST /auth/forgot-password POST /auth/reset-password
POST /auth/forgot-password-pin POST /auth/reset-password-pin

— AuthMiddleware (JWT required) — ALL ROUTES BELOW —

GET  /me                   PUT  /me/username          # Current user
POST /me/delete-account    POST /auth/logout
POST /auth/complete-google POST /auth/complete-onboarding  # Onboarding
POST /auth/link-google     POST /auth/change-password      # Google link + PIN pw change
POST /auth/set-pin         POST /auth/verify-pin

GET  /me/profile           PUT  /me/profile           # Profile
GET  /me/activity          GET  /me/contributions     # Activity + contributions
GET  /notifications        GET  /notifications/recent # Notifications
POST /notifications/read-all  POST /notifications/{id}/read

GET  /me/broadcasts        POST /me/broadcasts/{id}/dismiss  # Broadcasts
POST /feedback             GET  /feedback/mine               # Feedback

GET  /leaderboard                                        # Leaderboard
GET  /problems              GET  /problems/{slug}         # Problems
GET  /problems/{slug}/community-solutions  GET  /best-practices  # Community
POST /submissions/{id}/like DELETE /submissions/{id}/like

POST /submit (rate limited: 5/45s)   POST /test           # Submissions

— AdminOnly middleware —
POST /admin/ingest          POST /admin/enrich            # Pipeline management
POST /admin/enrich-all      POST /admin/problems/publish-all
GET  /admin/stats           GET  /admin/activity
GET  /admin/problems        PATCH /admin/problems/{id}/visibility
GET  /admin/user-problems/pending
PATCH /admin/user-problems/{id}/approve
PATCH /admin/user-problems/{id}/reject
GET  /admin/broadcasts      POST /admin/broadcasts
PATCH /admin/broadcasts/{id}/deactivate  DELETE /admin/broadcasts/{id}
GET  /admin/feedback        GET  /admin/feedback/counts
PATCH /admin/feedback/{id}
```

#### 2.3.2 Middleware

**File:** `internal/api/middleware.go`

| Type/Function | Purpose |
|---|---|
| `RateLimiter` | Per-user sliding window (5 req / 45s) with periodic stale cleanup |
| `NewRateLimiter(maxReqs, window)` | Creates limiter |
| `(rl *RateLimiter) Allow(userID) (bool, Duration)` | Rate check |
| `RateLimitMiddleware(rl)` | HTTP middleware (admins exempt) |
| `CORSMiddleware(cfg)` | CORS headers from `ALLOWED_ORIGIN` |
| `AuthMiddleware(cfg, store)` | JWT validation from Authorization header or `koder_token` cookie; checks token blacklist |
| `AdminOnly` | Role-based guard for `admin` |
| `VerifiedContributorOnly` | Role guard for `admin` or `verified_contributor` |
| `IPRateLimiter` | Per-IP sliding window for auth endpoints (10/min) |
| `BodySizeLimitMiddleware(maxBytes)` | Request body size enforcement |
| `SecurityHeadersMiddleware` | `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Strict-Transport-Security` |
| `GetClaims(ctx)` | Extracts JWT claims from context |

#### 2.3.3 Response Format

**File:** `internal/api/responses.go`

All API responses use a uniform envelope:
```json
{ "success": true, "data": ..., "error": null }
{ "success": false, "data": null, "error": { "code": "...", "message": "...", "details": ... } }
```

| Function | Purpose |
|---|---|
| `RespondSuccess(w, data)` | 200 OK |
| `RespondCreated(w, data)` | 201 Created |
| `RespondError(w, status, code, message, details)` | Error response |
| `SetAuthCookie(w, r, token, cfg)` | Sets httpOnly `koder_token` cookie (TLS-aware) |
| `ClearAuthCookie(w, r)` | Unsets cookie |

#### 2.3.4 In-Memory Cache

**File:** `internal/api/cache.go`

| Type/Function | Purpose |
|---|---|
| `cacheEntry[T]` | Generic cache entry with TTL |
| `userCache[T]` | Thread-safe generic TTL cache with cleanup goroutine |
| `profileCache` | Global: `/me/profile`, 30s TTL |
| `userCacheMap` | Global: `/me`, 30s TTL |
| `InvalidateUserCache(userID)` | Clears both caches for a user (called on mutations) |

#### 2.3.5 Handler Files Summary (20 files)

| File | Handler | Key Endpoints | Dependencies |
|---|---|---|---|
| `auth.go` | `AuthHandler` | Register, Login, GoogleAuth, CompleteOnboarding, LinkGoogle, CheckUsername, Logout | store, auth, config |
| `admin.go` | `AdminHandler` | Ingest, Enrich, EnrichAll, GetAdminStats, ListAllProblems, ToggleVisibility, PublishAllDrafts, ApproveUserProblem, RejectUserProblem | parser, enricher, store |
| `submissions.go` | `SubmissionHandler` | Submit (graded) | executor, store |
| `test.go` | `TestHandler` | Test (no-scoring) | executor, store |
| `problems.go` | `ProblemHandler` | ListVisibleProblems, GetProblemBySlug | store |
| `me.go` | `MeHandler` | GetMe (cached), SetUsername, DeleteAccount | store |
| `profile.go` | `ProfileHandler` | GetProfile (cached), UpdateProfile | store |
| `leaderboard.go` | `LeaderboardHandler` | GetLeaderboard | store |
| `community.go` | `CommunityHandler` | GetCommunitySolutions, GetBestPractices, LikeSubmission, UnlikeSubmission | store |
| `contributions.go` | `ContributionsHandler` | PostContribution, GetMyContributions | store |
| `activity.go` | `ActivityHandler` | GetActivity | store |
| `notifications.go` | `NotificationsHandler` | GetUnread, GetRecent, MarkAsRead, MarkAllAsRead | store |
| `broadcasts.go` | `BroadcastsHandler` | Create, ListActive, Dismiss, ListAll, Deactivate, Delete | store |
| `feedback.go` | `FeedbackHandler` | Submit (with email notif), ListAdmin, UpdateStatus, ListMine, Counts | store, config |
| `change_password.go` | `ChangePasswordHandler` | SetPin, VerifyPin (rate-limited), ChangePassword | store, config, auth |
| `password_reset.go` | `PasswordResetHandler` | ForgotPassword (email), ResetPassword | store, config, auth |
| `pin_reset.go` | `PINResetHandler` | ForgotPasswordPin (PIN+email → 5-min JWT), ResetPasswordPin | store, config, auth |

---

### 2.4 Authentication Layer

**Package:** `internal/auth/` (3 files)

#### `jwt.go`

| Function | Purpose |
|---|---|
| `Claims{UserID, StudentID, Username, Role, Onboarding, RegisteredClaims}` | JWT claims structure with jti (UUID) |
| `SignToken(userID, studentID, username, role, secret, expiry, onboarding) (string, error)` | Creates HS256 JWT with jti for revocation |
| `VerifyToken(tokenString, secret) (*Claims, error)` | Parses + validates JWT, checks expiry |

#### `password.go`

| Function | Purpose |
|---|---|
| `HashPassword(password) (string, error)` | bcrypt cost=12 |
| `ComparePassword(hashed, plain) bool` | bcrypt comparison |

#### `oauth.go`

| Function | Purpose |
|---|---|
| `VerifyGoogleToken(idToken, expectedClientID) (*GoogleUserInfo, error)` | Validates Google ID token via JWKS (RSA). Caches keys for 1h. Validates aud, iss, email_verified |
| `getJWKS()` | Fetches Google public keys from `oauth2/v3/certs` |

---

### 2.5 Database Layer (Store)

**Package:** `internal/store/` (17 files, ~120+ methods)

#### 2.5.1 Store Interface (`store.go`)

The `Store` interface defines ~70 methods across 11 categories. `PostgresStore` implements all using raw pgx/v5 SQL.

**Pool Configuration:**
- `MaxConns=10`, `MinConns=2`, `MaxConnLifetime=30m`, `MaxConnIdleTime=5m`
- `pgx.QueryExecModeSimpleProtocol` for PgBouncer compatibility

#### 2.5.2 Core Types (`types.go`)

| Type | Key Fields | Purpose |
|---|---|---|
| `User` | ID, Username, Name, Email, Role, XP, ColorIndex, GoogleID, PINHash, UsernameSet | System user |
| `Problem` | Slug, Module, Type, Statement, Constraints, LearningObjective, FuncName, ParamTypes, Difficulty, XPReward, Visible, SourceHash | Exercise definition |
| `TestCase` | Input (JSONB), Expected, IsHidden, Ordinal | Test input/output |
| `Submission` | UserID, ProblemID, Code, Status, PassedCount, TotalCount, OutputLogs, RuntimeMs | Graded attempt |
| `Progress` | UserID, ProblemID, Solved, Stars, Attempts, BestRuntime, XPAwarded | User progress |
| `Feedback` | Type, Title, Description, Priority, ScreenshotURL, Status, IsAnonymous | User feedback |
| `Broadcast` | Type, Priority, Title, Message, ActionLabel, ActionURL, Active | Admin announcement |
| `Notification` | Type, Message, RelatedID, IsRead | User alert |
| `CommunitySolution` | UserName, Code, RuntimeMs, Likes, HasLiked | Community solution |
| `UserProblem` | Slug, Title, Statement, FuncName, TestCases (JSONB), Status | Pending contribution |
| `AdminStats` | TotalProblems, ActiveProblems, TotalSubmissions | Dashboard stats |
| `LeaderboardEntry` | Rank, User (embedded), BestTimeMs, RankDelta | Leaderboard row |

#### 2.5.3 Store Implementation Files

| File | Key Methods | Purpose |
|---|---|---|
| `users.go` (25 methods) | CreateUser, GetUserByLogin, GetUserByID, GetUserByGoogleID, UpdateUserPassword, UpdateUserPINHash, LinkGoogleToUser, DeleteUser, CompleteUserOnboarding, GetLeaderboard (period), GetUserStats, CalculateStreak, GetModuleProficiency, GetRecentSubmissions | Full user lifecycle + leaderboard + stats |
| `problems.go` (10 methods) | ListVisibleProblems (LATERAL join), GetProblemBySlug, UpsertEnrichedProblem (transactional), UpsertTestCasesForProblem (batch), ListProblemsNeedingEnrichment, ListAllProblemsAdmin | Problem lifecycle (ingest → enrich → publish) |
| `submissions.go` (6 methods) | CreateSubmission, GetProblemWithTestCases, LikeSubmission, UnlikeSubmission, GetTopCommunitySolutionsForProblem, GetBestPractices | Submission + community features |
| `progress.go` (1 method) | UpsertProgress — transactional: first-solve XP award, star calculation (1-3 based on attempts), best runtime tracking, row locking for race safety | Student progress tracking |
| `profile.go` (2 methods) | GetFullProfile (calls DB function `get_full_profile` returning JSON), GetUserActivity (yearly contribution graph data) | Full profile aggregation |
| `notifications.go` (8 methods) | CreateNotification, GetUnread, GetRecent, MarkAsRead, MarkAllAsRead, NotifyAdmins, NotifyAllUsers, ReplaceBroadcastNotifications | Full notification system |
| `broadcasts.go` (7 methods) | CreateBroadcast, GetActiveBroadcasts (with dismissal check), GetAllBroadcasts, Deactivate, Delete, MarkBroadcastDismissed | Broadcast CRUD |
| `feedback.go` (5 methods) | CreateFeedback, GetAdminFeedback (status filter), GetUserFeedback, UpdateFeedbackStatus, CountFeedbackByStatus | Feedback management |
| `user_problems.go` (6 methods) | CreateUserProblem, ListPendingUserProblems, ApproveUserProblem (moves to problems table + notifies all), RejectUserProblem | Community contributions |
| `admin.go` (3 methods) | LogActivity, GetRecentActivity, GetAdminStats | Admin operations |
| `password_reset.go` (5 methods) | CreatePasswordResetToken, GetPasswordResetToken, MarkPasswordResetTokenUsed, CleanupExpired | Email-based password reset |
| `token_blacklist.go` (3 methods) | BlacklistToken, IsTokenBlacklisted, CleanupExpiredBlacklistedTokens | JWT revocation |
| `testcases.go` (2 methods) | GetTestCasesForProblem, GetVisibleTestCasesForProblem | Test case queries |
| `errors.go` (4 helpers) | IsUniqueViolation, IsFriendlyError, NewDuplicateError, NewNotFoundError, NewValidationError | Error handling (PG constraint → friendly message) |

---

### 2.6 Code Execution Engine

**Package:** `internal/executor/` (6 files)

#### 2.6.1 Orchestrator (`executor.go`)

| Type/Function | Purpose |
|---|---|
| `Executor{cfg, store, semaphore}` | Main engine — buffered channel semaphore for concurrency |
| `NewExecutor(cfg, store)` | Creates with configurable max concurrency |
| `Warmup(ctx)` | Pulls Docker image + pre-builds stdlib cache |
| `Execute(ctx, req) (*ExecutionResult, error)` | **Full grading flow** — fetches problem + test cases, formats Go literals, creates sandbox dir, executes (remote or Docker), parses test output, saves submission + progress, returns results |
| `ExecuteVisibleOnly(ctx, req) (*ExecutionResult, error)` | **Test-only flow** — no DB writes, visible test cases only |
| `IsPrimitiveType(t) bool` | Checks if Go type is a primitive (int/string/bool/etc) |
| `formatGoLiteral(paramType, data) (string, error)` | Converts JSON → Go literal (supports int, string, bool, float, slices, maps) |
| `parseCompilerError(output) string` | Extracts meaningful compile error from `go test` output |

**Execution flow:**
1. Acquire semaphore slot (block if at capacity)
2. Fetch `problem` + `testCases` from DB
3. Format each test case: parse JSON input → format as Go literals
4. Create sandbox directory with `solution.go` + `main_test.go` + `go.mod`
5. **Primary path** (`SANDBOX_URL` set): POST to remote sandbox HTTP service
6. **Fallback path** (no `SANDBOX_URL`): `docker run --rm --network=none --memory=256m --cpus=1.0 ...` with golang image
7. Parse `go test -v` output for pass/fail/GOT/WANT per test case ordinal
8. Classify status: `passed` / `failed` / `compiler_error` / `timeout`
9. Save `Submission` to DB (full output, counts, runtime)
10. Upsert `Progress` (triggers XP award on first solve, star calculation)
11. Return `ExecutionResult{Status, FriendlyMessage, PassedCount, TotalCount, OutputLogs, RuntimeMs, TestResults}`

#### 2.6.2 Sandbox Setup (`sandbox.go`)

| Function | Purpose |
|---|---|
| `PrepareSandbox(baseDir, uuid, code, renderData, goVersion) (path, error)` | Creates temp dir, writes `solution.go` (forces package piscine), `go.mod`, `main_test.go` (from template) |

#### 2.6.3 Remote Sandbox Client (`sandbox_client.go`)

| Type/Function | Purpose |
|---|---|
| `sandboxClient{httpClient, baseURL, timeoutSec}` | HTTP client for remote sandbox |
| `SandboxRequest{Code, TestCode, TimeoutSec, GoVersion}` | Request payload |
| `SandboxResponse{Status, Stdout, Stderr, PassedCount, TotalCount, RuntimeMs}` | Response from sandbox |
| `(c *sandboxClient) execute(ctx, code, testCode, goVersion) (*SandboxResponse, error)` | POST with exponential backoff (2 retries) |

#### 2.6.4 Test Templates (`templates.go`)

**`mainTestTemplate`** — Go text/template generates compilable `main_test.go`:
- Uses `reflect.DeepEqual` for non-primitive return types
- Uses direct `!=` comparison for primitives
- Reports GOT/WANT on failure via `t.Errorf`

#### 2.6.5 Types (`types.go`)

| Type | Purpose |
|---|---|
| `ExecutionRequest{UserID, ProblemID, Code, Language}` | Input |
| `TestResult{TestCaseID, Ordinal, Passed, Got, Expected, IsHidden}` | Per-test-case result |
| `ExecutionResult{Status, FriendlyMessage, PassedCount, TotalCount, OutputLogs, RuntimeMs, TestResults}` | Full output |

---

### 2.7 AI Enricher

**File:** `internal/enricher/enricher.go`

| Type/Function | Purpose |
|---|---|
| `Enricher{cfg, provider, mu, lastRequest}` | AI-powered test case generation |
| `enrichmentProvider` interface | Pluggable AI backend (`Name()`, `GenerateContent()`) |
| `geminiProvider{client, model}` | Gemini API via `google.golang.org/genai` with structured output (`ResponseSchema`) |
| `groqProvider{apiKey, model, httpClient}` | Groq API via HTTP (OpenAI-compatible endpoint) |
| `NewEnricher(ctx, cfg)` | Creates provider based on config |
| `EnrichProblem(ctx, rawReadme) (*Problem, []TestCase, error)` | **Core** — sends README to AI, parses JSON response, validates, returns |
| `enrichmentSchema()` | Gemini structured output schema (10 required fields, test_cases array) |
| `normalizeTestCaseInput(raw any) ([]byte, error)` | Normalizes LLM input to canonical JSON |
| `validateEnrichedProblem(problem, testCases) error` | Validates all required fields, hint count (3), difficulty range, test case structure |

**Rate limiting:** Gemini 30s between calls, Groq 2s. Enforced via mutex + `lastRequest` timestamp.

**System prompt:** Exhaustive (3500+ chars) covering JSON schema, production rules, example output, field requirements.

---

### 2.8 GitHub Curriculum Parser

**File:** `internal/parser/parser.go`

| Type/Function | Purpose |
|---|---|
| `Parser{baseDir}` | GitHub YAML curriculum scraper |
| `RawProblem{Slug, Module, SourceHash, RawReadme, Type}` | Unprocessed problem data |
| `NewParser(baseDir)` | Creates with temp dir for clones |
| `IngestGitHubRepo(ctx, url) ([]*RawProblem, error)` | Main pipeline: parse URL → sparse clone → walk READMEs → collect → hash-dedup |
| `parseGitHubURL(input) (repoURL, subPath, err)` | Handles HTTPS/SSH URLs, `tree/blob` branches, subfolder extraction |
| `cloneRepository(ctx, url, subPath) (path, cleanup, err)` | `git clone --depth 1 --filter=blob:none --sparse` for fast subfolder cloning |
| `collectExerciseReadmes(targetPath, ...) ([]*RawProblem, error)` | Recursive README discovery |
| `computeSourceHash(rawReadme) string` | SHA256 for idempotency |
| `parseRepoMetadata(url) (slug, module, err)` | Extracts repo info from URL |
| `normalizeSlug(name) string` | Lowercase, strip non-alphanumeric, replace with `-` |

---

## 3. Sandbox Service (Standalone)

**Directory:** `sandbox/` — Deployed separately on Railway (ARM64)

**Files:** 7 files, standalone Go module (zero external deps)

### 3.1 Main Server (`main.go`)

| Function | Purpose |
|---|---|
| `main()` | Server on `$PORT` (default 8080), rate limiter middleware, 10s read / 70s write timeouts |
| `healthHandler` | `GET /health` → `{"status":"ok"}` (bypasses rate limiter) |
| `versionHandler` | `GET /version` → `{"commit":"..."}` (build-time ldflag) |
| `executeHandler` | `POST /execute` → validates → `runTests()` → JSON response |
| `runTests(ctx, req) ExecuteResponse` | Writes temp `solution.go` + `main_test.go` + `go.mod`, runs `go test -v` with `setrlimit`, classifies output |
| `classifyOutput(output, timedOut, cmdErr) parseResult` | Parses `=== RUN`/`--- PASS`/`--- FAIL` lines for pass/fail counts |
| `forcePackagePiscine(code) string` | Replaces package declaration with `package piscine` |
| `compileErrorMessage(status, output) string` | Extracts first `solution.go:*` error line |

### 3.2 Security (`secure.go`)

| Function | Purpose |
|---|---|
| `validateCode(code) error` | 20 regex patterns blocking: CGO, `os/exec`, `syscall`, `unsafe`, `net`, `embed`, filesystem writes, network dial, process control, reflection abuse, runtime manipulation |

### 3.3 Unix Security (`secure_unix.go`)

| Function | Purpose |
|---|---|
| `setProcessAttributes(cmd, timeoutSec)` | `Setpgid=true`, `setrlimit`: NPROC=6, NOFILE=1024, FSIZE=64MB, CPU=60s |
| `killProcessGroup(cmd)` | `SIGKILL` entire process group |
| `reapProcess(cmd)` | Wait for process to prevent zombies |

### 3.4 Rate Limiter (`ratelimit.go`)

| Function | Purpose |
|---|---|
| `NewRateLimiter(maxReqs, window, cleanupInterval)` | Per-IP sliding window (10 req/min) |
| `(rl *RateLimiter) Middleware(next)` | HTTP 429 with `Retry-After` header |

---

## 4. Frontend — Next.js 14

### 4.1 Core Libraries

#### `lib/api.ts` (45+ exported functions)

| Category | Functions |
|---|---|
| **Auth** | `login`, `register`, `googleLogin`, `resetPassword`, `forgotPasswordPin`, `resetPasswordPin`, `completeOnboarding`, `linkGoogle`, `logout`, `checkUsername`, `changePassword`, `verifyPin`, `setPin` |
| **User** | `fetchUser`, `updateUsername`, `deleteAccount`, `fetchUserProfile`, `updateUserProfile`, `updateUserName` |
| **Problems** | `fetchProblems`, `fetchProblem`, `submitSolution`, `testCode` |
| **Community** | `fetchCommunitySolutions`, `fetchBestPractices`, `likeSubmission`, `unlikeSubmission`, `submitContribution` |
| **Admin** | `ingestGitHubRepo`, `enrichAllProblems`, `fetchAdminStats`, `fetchAdminActivity`, `fetchAllProblemsAdmin`, `toggleProblemVisibility`, `publishAllDrafts`, `fetchPendingContributions`, `approveContribution`, `rejectContribution` |
| **Feedback** | `submitFeedback`, `fetchMyFeedback`, `fetchAdminFeedback`, `fetchAdminFeedbackCounts`, `updateFeedbackStatus` |
| **Broadcasts** | `fetchActiveBroadcasts`, `dismissBroadcast`, `fetchAllBroadcasts`, `createBroadcast`, `deactivateBroadcast`, `deleteBroadcast` |
| **Notifications** | `fetchRecentNotifications` |
| **Leaderboard** | `fetchLeaderboard` |
| **Activity** | `fetchUserActivity`, `fetchMyContributions` |

**Features:** Generic GET caching via `sessionStorage` (30s TTL), `credentials: "include"` for cookies, debounced cache invalidation on `user-updated` events.

#### `lib/types.ts` (22 exported interfaces)

Core types: `User`, `Problem`, `UserProblem`, `UserProfile`, `ExecutionResult`, `TestResult`, `BackendTestResult`, `CommunitySolution`, `LeaderboardEntry`, `NotificationItem`, `FeedbackItem`, `Broadcast`, `ActivityEntry`, `AdminStats`, `ActivityLog`, `ApiResponse`

#### `lib/utils.ts`

| Function | Purpose |
|---|---|
| `cn(...inputs)` | Tailwind class merge (clsx + twMerge) |
| `getUserColor(index) → bg class` | 6-color palette (Gold, Terracotta, Silver, Grey, Steel, Bronze) |
| `getDifficultyColor(d) → text class` | Per-level (1-5) coloring |
| `getDifficultyLabel(d) → string` | "Beginner" through "Expert" |

#### `lib/cache.ts`

| Function | Purpose |
|---|---|
| `getCache<T>(key, ttl?) → T | null` | Reads sessionStorage with TTL |
| `setCache<T>(key, data)` | Writes to sessionStorage |
| `clearCache(pattern?)` | Clears `kc_*` prefixed keys |

#### `lib/UserContext.tsx`

| Export | Purpose |
|---|---|
| `UserProvider` | React context — fetches user on mount, listens for `user-updated` events |
| `useUser() → { user, loading, refreshUser }` | Hook for current auth state |

#### `lib/useNotifications.ts`

| Export | Purpose |
|---|---|
| `useNotifications() → { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }` | Polls `/notifications` every 5s (visible) / 60s (hidden) |

#### `lib/achievements.ts`

| Achievement | Criteria |
|---|---|
| First Blood | 1 solved problem |
| Hot Streak | 3-day streak |
| Perfectionist | ≥2.5 avg stars |
| Speed Demon | <10ms runtime |
| Veteran Coder | Level 10 |
| Completionist | 50 solved |

#### `lib/toast.tsx`

Custom toast system using `sonner`: 4 methods (`success`, `error`, `info`, `warning`), slide-in cards with progress bar, icon, title, description, close button.

#### `hooks/use-google-one-tap.ts`

| Export | Purpose |
|---|---|
| `useGoogleOneTap(onSuccess)` | Singleton GIS hook — loads script once, exposes `prompt()`, `renderButton(element)`, `ready` state |

---

### 4.2 Auth Pages

| Page | Components | Key State/Logic |
|---|---|---|
| `login/page.tsx` | GoogleButton, AuthDivider, LabelInputContainer | Google-first layout, framer-motion animations, GIS popup fallback if FedCM fails |
| `register/page.tsx` | Multi-step wizard (4 steps) | Step 1: name/email/password, Step 2: 6-digit PIN (masked via PinInput), Step 3: username with debounced availability check, Step 4: success |
| `onboarding/page.tsx` | Username input | Post-registration username selection with `checkUsername` API |
| `forgot-password/page.tsx` | PinInput, 2-tab layout | PIN-based reset (active), Email reset (disabled, legacy). 2-step: email+PIN → verify → new password |
| `reset-password/page.tsx` | Password form | Legacy email-based reset from link (?token=) |

### 4.3 Main Pages

| Page | Key Features |
|---|---|
| **Dashboard** (`home/page.tsx`) | Module topic cards → filtered problem grid with pagination (18/page), search/difficulty/status filters, solved-first sorting, Best Practices tab with like buttons, XP/streak/solved stats |
| **Admin** (`admin/page.tsx`) | Stats cards, GitHub ingest textarea, enrich/publish buttons, BroadcastPanel, FeedbackPanel, PendingContributions, problem catalog with visibility toggles, activity log sidebar (15s polling) |
| **Leaderboard** (`leaderboard/page.tsx`) | Podium (top 3), searchable/sortable table, period toggle (weekly/monthly/all-time), 30s polling, Google avatar fallback |
| **Settings** (`settings/page.tsx`) | 4 tabs: Profile (name/bio/username), Appearance (dark theme), Notifications (history + mark-all-read), Security (PIN-verified password change, Google linking, account deletion) |
| **Contribute** (`contribute/page.tsx`) | Form: title/slug/statement, Go function signature, test cases editor (add/remove/JSON input/expected/hidden), edit mode from query param |
| **Problem Workspace** (`problems/[slug]/ProblemWorkspaceClient.tsx`) | Full IDE: 3-column layout (description + Monaco editor + hints), local Monaco workers, Go autocomplete, Test/Submit buttons, rate-limit cooldown, test results panel with GOT/WANT diff, keyboard shortcuts |
| **Success Page** (`problems/[slug]/success/page.tsx`) | Confetti animation, XP reward, community solutions with like buttons, next problem link with module context preserved |

### 4.4 Profile Pages

| Component | Features |
|---|---|
| `ProfileClient.tsx` | Orchestrator: skeleton loading, error retry, 2 tabs (Overview / My Contributions) |
| `ProfileHeader.tsx` | Avatar (Google or initials), XP ring SVG, rank badge, mini-stats, XP bar, edit/share buttons |
| `StatsOverview.tsx` | Global rank, success rate, best runtime |
| `ProgressMetrics.tsx` | Difficulty breakdown (Easy/Medium/Hard) with animated progress bars |
| `Achievements.tsx` | Badge grid with lock/unlock states, detail dialog |
| `ActivityFeed.tsx` | Timeline of daily solved/submissions with colored dots |
| `ContributionGraphSection.tsx` | GitHub-style heatmap calendar |
| `MyContributions.tsx` | User's submitted problems with sortable table + detail dialog |
| `RecentActivity.tsx` | Recent submissions timeline with status colors |

### 4.5 Shared Components

| Component | Purpose |
|---|---|
| **TopNav.tsx** | Sticky header: logo, nav links, XP/level bar, "Add Problem" (verified_contributor/admin), notification dropdown (bell icon, scrollable list, mark-all-read), user avatar dropdown (Profile/Settings/Sign Out) |
| **TestResultPanel.tsx** | Collapsible test results: pass/fail percentage circle, individual test cards, GOT/WANT line diff for multi-line, compiler error with copy+tip, timeout/system error states |
| **BroadcastBanner.tsx** | Color-coded per type (info/warning/update/new_feature/maintenance/announcement), type icon, priority badge, dismiss, CTA link, 5s polling |
| **FeedbackButton.tsx** | Floating gold button → modal with 3 tabs (General/Bug/Feature), priority selector, base64 screenshot upload (max 5MB), anonymous toggle |
| **GoogleLinkBanner.tsx** | Amber gradient banner, links to Settings security tab, dismissible (localStorage), auto-hides when google_linked=true |
| **ModuleCards.tsx** | Dashboard module topic cards with solved/total counts, memorized (React.memo) |
| **LandingContent.tsx** | Full marketing landing: animated hero, feature cards, stats, CTA, footer |
| **Auth components** | GoogleButton (dark, SVG logo, shadow-input), BottomGradient (amber line on hover), LabelInputContainer, AuthDivider (Aceternity patterns) |
| **UI components** | 15+ shadcn-based: Button, Input, InputOTP, PinInput, Label, Card, Dialog, DropdownMenu, Tabs, Select, Badge, Avatar, Progress, Textarea, Tooltip, ActivityGauge, MultiStepLoader |

---

## 5. Database Migrations

**Directory:** `migrations/` (24 files)

| # | File | Purpose |
|---|---|---|
| 001 | `001_init.sql` | Core schema: users, problems, submissions, progress, activity_logs |
| 002 | `002_indexes.sql` | Initial performance indexes |
| 003 | `003_activity_logs.sql` | Activity log formatting |
| 005 | `005_community_contributions.sql` | user_problems staging table with JSONB test_cases |
| 006 | `006_notifications.sql` | notifications table |
| 007 | `007_submission_likes.sql` | submission_likes table |
| 008 | `008_user_profile.sql` | bio column on users |
| 009 | `009_get_full_profile.sql` | `get_full_profile()` PostgreSQL function |
| 010 | `010_add_gitea_auth.sql` | (Legacy) Gitea auth columns |
| 011 | `011_add_gitea_token.sql` | (Legacy) Gitea token |
| 012 | `012_add_google_auth.sql` | Google OAuth columns (google_id, google_email, google_avatar_url) |
| 013 | `013_fix_rank_tiebreaker.sql` | Rank tiebreaker fix in leaderboard query |
| 014 | `014_feedback.sql` | feedback table with screenshot, priority, is_anonymous |
| 015 | `015_broadcasts.sql` | broadcasts + user_broadcast_status tables |
| 016 | `016_add_streak_index.sql` | Composite index for streak calculation |
| 017 | `017_optimization_indexes.sql` | 16 performance indexes (users, submissions, problems, progress, test_cases, feedback, broadcasts) |
| 019 | `019_seed_problems1.sql` | 45 Go problems (math-recursion, arrays-strings, data-structures) |
| 019 | `019_seed_problems2.sql` | 45 Go problems (bit-manipulation, sorting-searching, pointers) |
| 019 | `019_seed_problems3.sql` | 45 Go problems (functions, structs-interfaces, error-handling) |
| 019 | `019_seed_problems4.sql` | 45 Go problems (concurrency, generics, testing-benchmarking) |
| 020 | `020_token_blacklist.sql` | JWT revocation blacklist table |
| 021 | `021_password_reset.sql` | Password reset token table |
| 022 | `022_add_pin_hash.sql` | pin_hash column on users |
| 023 | `023_split_problem_fields.sql` | constraints + learning_objective columns on problems |
| 024 | `024_add_username_set.sql` | username_set boolean on users |

---

## 6. Infrastructure & Constraints

| Resource | Limit | Mitigation |
|---|---|---|
| **Gemini API** | 50 calls/day, 2 req/min | SHA256 change detection, enforced sleep between calls |
| **Postgres** | 500MB total | Normalized schema, no JSONB bloat, LIMIT on all queries |
| **Pool connections** | 15 (Supabase free tier) | MaxConns=10, MinConns=2 |
| **Code execution** | 6 concurrent | Buffered channel semaphore |
| **Submission rate** | 5 req / 45s per user | Sliding window rate limiter |
| **Auth rate** | 10 req / min per IP | Sliding window rate limiter |
| **Memory** | 256MB per Docker container | `--memory=256m`, output capped at 100KB |
| **Storage** | 500MB Postgres | Archive old submissions quarterly |

---

## 7. Request Flow Diagrams

### 7.1 Submission Flow

```
User Code  →  POST /submit  →  AuthMiddleware (JWT)
                                    │
                                    ▼
                              RateLimitMiddleware (5/45s)
                                    │
                                    ▼
                              Fetch Problem by slug
                                    │
                                    ▼
                              Check problem.Solved (409 if already solved)
                                    │
                                    ▼
                              Executor.Execute()
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                                ▼
           remote sandbox?                   local Docker
           POST /execute                     docker run ...
                    │                                │
                    └───────────────┬───────────────┘
                                    ▼
                              Parse go test output
                              (pass/fail/GOT/WANT)
                                    │
                                    ▼
                              Classify status
                              (passed/failed/compiler_error/timeout)
                                    │
                                    ▼
                              Save Submission to DB
                                    │
                                    ▼
                              Upsert Progress (XP award, stars)
                                    │
                                    ▼
                              Return ExecutionResult JSON
```

### 7.2 Enrichment Flow (Admin)

```
Admin Click  →  POST /admin/enrich-all  →  AdminOnly middleware
                                                    │
                                                    ▼
                                              ListProblemsNeedingEnrichment()
                                              (WHERE source_hash != enriched_hash)
                                                    │
                                                    ▼
                                              For each problem (sequential, rate-limited):
                                                    │
                                                    ▼
                                              Enricher.EnrichProblem(rawReadme)
                                                    │
                                                    ▼
                                              AI Provider (Gemini/Groq)
                                              System prompt + structured output schema
                                                    │
                                                    ▼
                                              Parse JSON → enrichedResponse
                                                    │
                                                    ▼
                                              validateEnrichedProblem() (10 checks)
                                                    │
                                                    ▼
                                              UpsertEnrichedProblem (transactional)
                                              - Update problem fields
                                              - Batch INSERT test_cases
                                                    │
                                                    ▼
                                              Continue next problem (30s sleep)
```

### 7.3 Ingest Flow (Admin)

```
Admin Click  →  POST /admin/ingest  →  AdminOnly middleware
                                                  │
                                                  ▼
                                            Parser.IngestGitHubRepo(url)
                                                  │
                                                  ▼
                                            parseGitHubURL → (repoURL, subPath)
                                                  │
                                                  ▼
                                            cloneRepository (sparse checkout)
                                                  │
                                                  ▼
                                            collectExerciseReadmes()
                                            Walk directory → find README files
                                                  │
                                                  ▼
                                            For each README:
                                            - computeSourceHash (SHA256)
                                            - Check existing problem (hash comparison)
                                            - UpsertProblem (if changed/new)
                                                  │
                                                  ▼
                                            LogActivity → Return results
```

### 7.4 Authentication Flow

```
User Credentials  →  POST /auth/login  →  IPRateLimiter (10/min)
                                                  │
                                                  ▼
                                            GetUserByLogin (username/email/student_id)
                                                  │
                                                  ▼
                                            bcrypt ComparePassword
                                                  │
                                                  ▼
                                            SignToken (HS256, 24h, jti UUID)
                                                  │
                                                  ▼
                                            SetAuthCookie (httpOnly, TLS-aware)
                                                  │
                                                  ▼
                                            Return { token, onboarding: !usernameSet }
```

---

## Appendix: File Count Summary

| Category | File Count | Lines of Code |
|---|---|---|
| **Backend (Go)** | 53 source files | ~15,000 |
| — `internal/api/` | 20 handlers | ~5,000 |
| — `internal/store/` | 17 files | ~7,000 |
| — `internal/executor/` | 6 files | ~1,200 |
| — `internal/enricher/` | 1 file | ~600 |
| — `internal/parser/` | 1 file | ~370 |
| — `internal/auth/` | 3 files | ~350 |
| — `internal/config/` | 2 files | ~260 |
| — `cmd/server/` | 1 file | ~105 |
| **Sandbox** | 7 files | ~1,200 |
| **Frontend (TSX/TS)** | 73 source files | ~15,000 |
| — `app/` pages | 35 files | ~8,500 |
| — `components/` | 19 files | ~4,500 |
| — `lib/` | 9 files | ~2,000 |
| — `hooks/` | 2 files | ~400 |
| **Database** | 24 migrations | ~18,000 (incl. 180 seeded problems) |
| **Config/Scripts** | 12 files | ~2,000 |
| **Total** | **~170 source files** | **~50,000 lines** |
