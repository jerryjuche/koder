# Koder Codebase — Complete Analysis

## Project Overview

**Koder** is a zero-cost, production-grade automated code-grading platform for Go programming curricula. It runs on Oracle Cloud's free ARM64 tier and uses Gemini (default) or Groq for AI-powered test enrichment.

- **Stack:** Go 1.26 backend (chi router, pgx/v5 PostgreSQL) + Next.js 14 frontend (Vercel free tier)
- **Infrastructure:** Go monolith on Oracle Ampere A1 (ARM64) + standalone Go sandbox on Railway (ARM64) + Supabase Postgres + Vercel frontend
- **Core Constraint:** $0/month operating budget with hard resource limits (500MB Postgres, 50 Gemini API calls/day, 6 concurrent executions max)

---

## BACKEND (Go) — Complete Analysis

### 1. ENTRY POINT: `cmd/server/main.go`

**Initialization Flow:**
1. Sets up structured logging via `slog` (text handler → stdout)
2. Loads config from environment via `config.Load()` — also reads `.env` file if present
3. Creates PostgreSQL connection pool via `store.NewPostgresStore(ctx, cfg.DatabaseURL)`
   - Uses `pgxpool` with `QueryExecModeSimpleProtocol` (for Supabase/PgBouncer compatibility)
   - Pings DB immediately to fail fast
4. Initializes `executor.NewExecutor(cfg, storeInstance)` — sets up buffered semaphore channel of capacity `cfg.ExecutorMaxConcurrency` (default 6)
5. Optional warmup goroutine (only when no `SANDBOX_URL`): pulls `golang:1.23-alpine` Docker image + pre-populates Go build cache under `BUILD_CACHE_DIR`
6. Creates HTTP router via `api.NewRouter(cfg, storeInstance, execInstance)`
7. Starts HTTP server on `cfg.Port` (default 8080) with timeouts: Read=60s, Write=60s, Idle=60s
8. Graceful shutdown on SIGINT/SIGTERM with 10s timeout

---

### 2. CONFIG: `internal/config/config.go`

**Config struct fields:**

| Category | Field | Default | Required | Notes |
|----------|-------|---------|----------|-------|
| **Database** | `DatabaseURL` | — | Yes | Supabase connection string |
| **Auth** | `JWTSecret` | — | Yes | Min 32 chars, HS256 |
| | `JWTExpiryHours` | 24 | No | |
| | `GoogleClientID` | — | No | OAuth audience verification |
| **Enrichment** | `EnrichmentProvider` | `"gemini"` | No | `"gemini"` or `"groq"`; auto-detected if `GROQ_API_KEY` set |
| | `GeminiAPIKey` | — | Yes* | Required if provider=gemini |
| | `GeminiModel` | `gemini-2.5-pro` | No | |
| | `GroqAPIKey` | — | Yes* | Required if provider=groq |
| | `GroqModel` | `llama-3.3-70b-versatile` | No | |
| **Execution** | `ExecutorMaxConcurrency` | 6 | No | Buffered semaphore capacity |
| | `ExecutorTimeoutSeconds` | 30 | No | Per-execution context timeout |
| | `DockerImage` | `golang:1.23-alpine` | No | ARM64-compatible |
| | `SandboxBaseDir` | `/tmp/koder` | No | Per-submission UUID directory |
| | `BuildCacheDir` | `/tmp/go-build-cache` | No | Pre-warmed Go module cache |
| | `SandboxURL` | `""` | No | Empty = use local Docker |
| | `GoVersion` | `"1.23"` | No | Go directive in generated `go.mod` |
| **Server** | `Port` | 8080 | No | Validated 1–65535 |
| | `Environment` | `development` | No | `development` or `production` |
| **CORS** | `AllowedOrigin` | `http://localhost:3000` | No | |
| **Admin** | `AdminEmail` | — | No | For role detection |
| | `AdminPassword` | — | No | For role detection |

**`Load()` function:**
1. Tries to read `.env` file (non-fatal if missing) — sets env vars that aren't already set
2. Reads all env vars with defaults shown above
3. Validates required fields (empty check) and ranges (port, concurrency)
4. Provides `ExecutorTimeout()` and `JWTExpiry()` as `time.Duration` helpers

---

### 3. DATA STORE: `internal/store/`

#### `types.go` — All Data Models

**User** (id, student_id, username, name, bio?, email?, password hash, role, color_index, xp, verified?, verified_at?, google_id?, google_email?, google_avatar_url?, created_at)
- `role`: `"student"`, `"verified_contributor"`, or `"admin"`
- `color_index`: 0–5, randomly assigned on creation, used for avatar color
- `FlexibleBool`: custom JSON unmarshaler that accepts both boolean `true` and string `"true"` (fixes Google tokeninfo inconsistency)

**GoogleUserInfo** (sub, email, name, picture, email_verified FlexibleBool, aud)
- Parsed from Google tokeninfo endpoint

**Problem** (id, slug, module, type, language, title, statement, func_name, return_type, param_types[], hints[], difficulty, xp_reward, tags[], visible, source_hash, raw_readme, author_id?, author_name?, created_at, updated_at)
- **Runtime-computed fields**: solved, stars, attempts, total_submissions, success_rate, avg_runtime_ms, est_time_minutes, examples (first 3 visible test cases)

**TestCase** (id, problem_id, input JSONB, expected string, is_hidden bool, ordinal int)
- `input`: JSON array of arguments (e.g. `[5, 3]` for a two-param function)
- `expected`: stringified Go literal (e.g. `"8"` for int, `"hello"` for string)

**Submission** (id, user_id, problem_id, language, code, status, passed_count, total_count, output_logs, runtime_ms, created_at)
- `status`: `"passed"` | `"failed"` | `"compiler_error"` | `"timeout"`

**Progress** (user_id, problem_id) — composite PK
- solved, stars (1–3), attempts, best_runtime, xp_awarded
- Stars: 1st attempt = 3 stars, 2nd = 2, 3rd+ = 1 (never decreases)

**ActivityLog** (id, type, message, color, icon, created_at) — admin feed

**Notification** (id, user_id, type, message, related_id?, is_read, created_at)

**UserProblem** — staging table for community contributions (status: pending | approved | rejected)

**LeaderboardEntry** — rank, user (LeaderboardUser), best_time_ms, rank_delta

#### `store.go` — Interface & Connection

- **Store interface**: Contract for ALL database operations (106 methods)
- **PostgresStore**: Wraps `*pgxpool.Pool`
- `NewPostgresStore()`: Parses URL with `pgxpool.ParseConfig`, disables prepared statement cache (Supabase transaction pooler compatibility), pings, returns store
- `Close()`: Closes pool

#### `users.go` — User CRUD (972 lines)

**Key methods:**

| Method | SQL Pattern | Notes |
|--------|------------|-------|
| `CreateUser` | INSERT ... RETURNING id, created_at | bcrypt hash cost=12, random color_index 0–5 |
| `GetUserByLogin` | WHERE username=$1 OR email=$1 OR student_id=$1 | Unified login lookup |
| `GetUserByGoogleID` | WHERE google_id=$1 | |
| `CreateUserFromGoogle` | INSERT with temp username `g_<sub[:8]>` | Placeholder bcrypt hash, student_id = Google email |
| `LinkGoogleToUser` | UPDATE user google fields | Links existing account to Google |
| `UpdateUserUsername` | UPDATE SET username=$1 | |
| `UpdateUserStudentID` | UPDATE SET student_id=$1 | Called during onboarding |
| `UpdateUserProfileWithReturn` | UPDATE name, bio ... RETURNING * | Returns updated User |
| `LinkGoogleToUser` | UPDATE SET google_id, google_email, google_avatar_url | Links existing account to Google |
| `GetUserWithSolvedCount` | LEFT JOIN subquery | Single-query user + solved count |
| `UpdateUserGoogleAvatar` | UPDATE google_avatar_url=$1 | |
| `GetLeaderboard` | Complex GROUP BY with period filtering | Top 100, excludes admins, rank 1-indexed |
| `GetUserStats` | Multi-query: solved/attempted, progress by difficulty, streak | |
| `GetModuleProficiency` | GROUP BY module, LEFT JOIN progress | |
| `GetRecentSubmissions` | ORDER BY created_at DESC LIMIT $1 | |

#### `problems.go` — Problem CRUD (455 lines)

| Method | SQL Pattern | Notes |
|--------|------------|-------|
| `ListVisibleProblems` | WHERE visible=true, LEFT JOIN progress | 22-field scan, success_rate calculated |
| `GetProblemBySlug` | WHERE slug=$1 AND visible=true | Loads first 3 visible test cases as examples |
| `GetProblemBySlugAny` | WHERE slug=$1 (no visible filter) | For admin enrichment |
| `UpsertProblem` | INSERT ... ON CONFLICT (slug) DO UPDATE | Full upsert of 16 problem fields |
| `ListProblemsNeedingEnrichment` | WHERE visible=false ORDER BY created_at | |
| `UpdateProblemVisibility` | UPDATE SET visible=$1 | |
| `ListAllProblemsAdmin` | ORDER BY module, difficulty | All problems including drafts |

#### `submissions.go` — Submission & Community (210 lines)

| Method | SQL Pattern | Notes |
|--------|------------|-------|
| `CreateSubmission` | INSERT ... RETURNING id, created_at | 9 fields |
| `GetProblemWithTestCases` | Two queries: problem + test_cases | Used by executor |
| `LikeSubmission` | INSERT ... ON CONFLICT DO NOTHING | Prevents duplicates |
| `UnlikeSubmission` | DELETE WHERE submission_id=$1 AND user_id=$2 | |
| `GetTopCommunitySolutionsForProblem` | JOIN with submission_likes, GROUP BY, HAVING | Ordered by likes DESC, runtime ASC |
| `GetBestPractices` | Cross-problem, only visible, HAVING likes > 0 | |

#### `progress.go` — Atomic Progress Tracking (130 lines)

**`UpsertProgress`** (transaction):
1. Get problem `xp_reward`
2. Query existing progress row
3. Calculate: new_attempts, new_solved (stays true forever), new_stars (max of old/calculated), new_best_runtime (MIN)
4. `xpToAward = xpReward` only on first solve
5. Upsert progress row (INSERT or UPDATE)
6. `UPDATE users SET xp = xp + $1` if XP awarded
7. COMMIT

#### `admin.go` — Admin Operations (71 lines)

- `LogActivity`: INSERT into activity_logs
- `GetRecentActivity`: SELECT ORDER BY created_at DESC LIMIT $1
- `GetAdminStats`: Single query with 3 COUNT subqueries

#### `testcases.go` — Test Case Queries (92 lines)

- `GetTestCasesForProblem`: All cases ORDER BY ordinal
- `GetVisibleTestCasesForProblem`: WHERE is_hidden = false

#### `profile.go` — Full Profile Query (112 lines)

- `GetFullProfile`: Calls PostgreSQL function `get_full_profile($1)` which returns a JSON aggregate — single round trip for all profile data
- `GetUserActivity`: Calls `get_user_activity($1, $2)` — contribution graph data

#### `notifications.go` — Notification System (113 lines)

- `CreateNotification`: INSERT for single user
- `NotifyAdmins`: INSERT ... SELECT id FROM users WHERE role='admin'
- `NotifyAllUsers`: INSERT ... SELECT id FROM users (no WHERE) — broadcast to every user
- `GetUnreadNotifications`: WHERE is_read=FALSE LIMIT 50
- `GetRecentNotifications`: Same as unread but without is_read filter — returns last N (read + unread)
- `MarkAsRead`, `MarkAllAsRead`: UPDATE SET is_read=TRUE

#### `user_problems.go` — Community Contribution Pipeline (249 lines)

- `CreateUserProblem`: INSERT with JSONB[] test_cases, ON CONFLICT (slug) DO UPDATE (same author only)
- `ApproveUserProblem` (transaction):
  1. Fetch user problem FOR UPDATE (row lock)
  2. Get author name
  3. INSERT into main problems table with `source_hash = "COMMUNITY:{uuid}"`
  4. INSERT all test cases into test_cases table
  5. UPDATE user_problems status = 'approved'
  6. COMMIT
- `RejectUserProblem`: UPDATE status = 'rejected'

---

### 4. API HANDLERS: `internal/api/`

#### `router.go` — Route Registration (110 lines)

Uses `chi` router with:
- CORS middleware (configurable origin, GET/POST/PUT/PATCH/DELETE/OPTIONS)
- Auth middleware (Bearer JWT)
- AdminOnly middleware
- Rate limit middleware on `/submit` and `/test`

**Route table:**

| Method | Path | Handler | Middleware |
|--------|------|---------|------------|
| GET | `/health` | inline | None |
| POST | `/auth/register` | `authHandler.Register` | None |
| POST | `/auth/login` | `authHandler.Login` | None |
| POST | `/auth/google` | `authHandler.GoogleAuth` | None |
| GET | `/me` | `meHandler.GetMe` | Auth |
| GET | `/me/profile` | `profileHandler.GetProfile` | Auth |
| PUT | `/me/profile` | `profileHandler.UpdateProfile` | Auth |
| GET | `/me/activity` | `activityHandler.GetActivity` | Auth |
| GET | `/me/contributions` | `contributionsHandler.GetMyContributions` | Auth |
| POST | `/user-problems` | `contributionsHandler.PostContribution` | Auth + VerifiedContributor |
| POST | `/auth/complete-onboarding` | `authHandler.CompleteOnboarding` | Auth |
| POST | `/auth/link-google` | `authHandler.LinkGoogle` | Auth |
| GET | `/auth/check-username?username=xxx` | `authHandler.CheckUsername` | Auth |
| GET | `/notifications` | `notificationsHandler.GetUnreadNotifications` | Auth |
| GET | `/notifications/recent` | `notificationsHandler.GetRecentNotifications` | Auth |
| POST | `/notifications/read-all` | `notificationsHandler.MarkAllAsRead` | Auth |
| POST | `/notifications/{id}/read` | `notificationsHandler.MarkAsRead` | Auth |
| POST | `/me/delete-account` | `meHandler.DeleteAccount` | Auth |
| GET | `/leaderboard` | `leaderboardHandler.GetLeaderboard` | Auth |
| GET | `/problems` | `problemHandler.ListVisibleProblems` | Auth |
| GET | `/problems/{slug}` | `problemHandler.GetProblemBySlug` | Auth |
| GET | `/problems/{slug}/community-solutions` | `communityHandler.GetCommunitySolutions` | Auth |
| GET | `/best-practices` | `communityHandler.GetBestPractices` | Auth |
| POST | `/submit` | `submissionHandler.Submit` | Auth + RateLimit |
| POST | `/test` | `testHandler.Test` | Auth + RateLimit |
| POST | `/submissions/{id}/like` | `communityHandler.LikeSubmission` | Auth |
| DELETE | `/submissions/{id}/like` | `communityHandler.UnlikeSubmission` | Auth |
| POST | `/admin/ingest` | `adminHandler.Ingest` | Auth + AdminOnly |
| POST | `/admin/enrich` | `adminHandler.Enrich` | Auth + AdminOnly |
| POST | `/admin/enrich-all` | `adminHandler.EnrichAll` | Auth + AdminOnly |
| GET | `/admin/stats` | `adminHandler.GetAdminStats` | Auth + AdminOnly |
| GET | `/admin/activity` | `adminHandler.GetAdminActivity` | Auth + AdminOnly |
| GET | `/admin/problems` | `adminHandler.ListAllProblems` | Auth + AdminOnly |
| PATCH | `/admin/problems/{id}/visibility` | `adminHandler.ToggleVisibility` | Auth + AdminOnly |
| POST | `/admin/problems/publish-all` | `adminHandler.PublishAllDrafts` | Auth + AdminOnly |
| GET | `/admin/user-problems/pending` | `adminHandler.ListPendingUserProblems` | Auth + AdminOnly |
| PATCH | `/admin/user-problems/{id}/approve` | `adminHandler.ApproveUserProblem` | Auth + AdminOnly |
| PATCH | `/admin/user-problems/{id}/reject` | `adminHandler.RejectUserProblem` | Auth + AdminOnly |

#### `middleware.go` — Request Middleware (173 lines)

**`CORSMiddleware(cfg)`**: Sets `Access-Control-Allow-Origin` from config, handles OPTIONS preflight

**`AuthMiddleware(cfg)`**: Extracts Bearer token, calls `auth.VerifyToken()`, stores Claims in context via `context.WithValue`

**`AdminOnly`**: Checks `claims.Role == "admin"`, returns 403

**`VerifiedContributorOnly`**: Checks `claims.Role == "admin" || claims.Role == "verified_contributor"`

**`RateLimitMiddleware(rl)`**: Per-user sliding window rate limiter. Admin users are exempt. Default: 5 requests per 45 seconds. Returns `Retry-After` header + 429 on throttle.

**`RateLimiter`**: In-memory `map[string]*userRateLimit` with `{count, windowStart}`. Sliding window resets when `now - windowStart >= window`.

#### `responses.go` — Response Envelope (51 lines)

Standardized `APIResponse` envelope: `{success: bool, data: any, error: {code, message, details?}}`

Helper functions: `RespondSuccess(w, data)` → 200, `RespondCreated(w, data)` → 201, `RespondError(w, status, code, message, details)`

#### `auth.go` — Authentication Handler (422 lines)

**Registration flow:**
1. Validate `name` and `password` required
2. Generate temp username `u_<uuid[:8]>`
3. Admin detection: if email matches `ADMIN_EMAIL` and password matches `ADMIN_PASSWORD`, role = `"admin"`
4. Create user with `student_id = username`, `username = tempUsername`
5. Issue JWT with `onboarding: true`

**Login flow:**
1. Get user by login (checks username, email, student_id)
2. bcrypt password comparison
3. Dynamic admin upgrade (if env vars changed after user creation)
4. Issue JWT with `onboarding: false`

**GoogleAuth flow:**
1. Verify Google ID token against `oauth2.googleapis.com/tokeninfo` (with audience validation)
2. If existing Google user → sync avatar, issue token
3. If email matches existing user → link Google, issue token
4. New user → create with temp username `g_<sub[:8]>`, issue token with `onboarding: true`

**CompleteOnboarding** (canonical endpoint for all auth methods):
1. Requires valid JWT with any claims
2. Validates username (min 3 chars, uniqueness check)
3. Sets both `username` and `student_id` to the chosen value
4. Returns fresh JWT without `onboarding` flag

**LinkGoogle**: Links Google account to already-authenticated user (prevents double-linking, conflicts)

**CheckUsername**: GET query parameter → `{username, available: bool}`

#### `problems.go` — Problem Handler (103 lines)

- `ListVisibleProblems`: Returns problems with `visible=true`, includes user's progress overlay
- `GetProblemBySlug`: Returns single problem with examples (first 3 visible test cases as formatted JSON)

#### `submissions.go` — Submission Handler (102 lines)

**Submit flow:**
1. Authenticate, parse `{problem_slug, code}`
2. Validate code ≤ 50KB (HTTP 413)
3. Fetch problem by slug
4. Build `ExecutionRequest{UserID, ProblemID, Code, Language}`
5. Call `executor.Execute()` (blocks on semaphore if at capacity)
6. Log activity (success/timeout)
7. Return `ExecutionResult`

#### `test.go` — No-Scoring Test Handler (87 lines)

Same flow as Submit but calls `executor.ExecuteVisibleOnly()` instead — runs tests against visible test cases only, no DB writes (no submission record, no progress update)

#### `admin.go` — Admin Operations (386 lines)

**Ingest**: Clones GitHub repo, walks directory tree for README files, creates Problem records with `visible=false`, SHA256 dedup

**Enrich**: Calls `enricher.EnrichProblem()` with problem's `raw_readme`, updates problem fields + test cases, sets `visible=true`

**EnrichAll**: Iterates all unenriched problems, enriches each sequentially (respects 30s Gemini rate limit)

**PublishAllDrafts**: Sets `visible=true` for all hidden problems

**ToggleVisibility**: PATCH to flip `visible` boolean on a problem

**ApproveUserProblem / RejectUserProblem**: Community contribution moderation with admin notes + notification to submitter

#### `me.go` — Current User Handler (129 lines)

Returns `{id, student_id, username, name, role, color_index, xp, level, solved_count, google_avatar_url?, google_linked}`. `google_linked` is derived from `user.GoogleID != nil`. `color_index` is persisted per-user (0–5). Uses in-memory cache (30s TTL) with `cacheUser`/`getCachedUser`. Level = `(XP / 1000) + 1`.

**`DeleteAccount(w, r)`**: Calls `store.DeleteUser()` — transactional cascade cleanup of submissions, progress, and user record. Returns `{"message": "Account permanently deleted"}`.

#### `profile.go` — Full Profile Handler (257 lines)

Calls `store.GetFullProfile()` (single DB round trip via `get_full_profile()` PostgreSQL function). Returns detailed profile with stats, progress by difficulty, module proficiency, recent submissions. Also uses 30s cache.

#### `leaderboard.go` — Leaderboard Handler (34 lines)

Simple delegation to `store.GetLeaderboard(period)`. Period filter: `all`, `weekly`, `monthly`.

#### `community.go` — Community Solutions (139 lines)

- `GetCommunitySolutions`: Top 3 liked + best runtime solutions for a problem (configurable limit)
- `GetBestPractices`: Cross-problem top solutions with likes > 0
- `LikeSubmission` / `UnlikeSubmission`: INSERT/DELETE on `submission_likes` table

#### `contributions.go` — User-Submitted Problems (85 lines)

- `PostContribution`: Creates `UserProblem` in staging table with status `pending`, notifies admins
- `GetMyContributions`: Returns user's submitted problems with their review status

#### `activity.go` — Contribution Graph (54 lines)

Returns daily activity (`ActivityEntry[]`: date, submissions, solved, tests_run, level) for the contribution heatmap. Defaults to current year, configurable via `?year=` query param.

#### `notifications.go` — Notification Handler (115 lines)

- `GetUnreadNotifications`: Returns unread notifications for current user
- `GetRecentNotifications`: Returns last 20 notifications (read + unread) for settings page
- `MarkAsRead`: Marks single notification
- `MarkAllAsRead`: Marks all unread as read

#### `cache.go` — In-Memory Response Cache (98 lines)

Generic typed cache with TTL + background cleanup goroutine. Two caches:
- `profileCache`: 30s TTL for profile responses
- `userCacheMap`: 30s TTL for me responses

`InvalidateUserCache(userID)` called on profile/username updates.

---

### 5. AUTHENTICATION: `internal/auth/`

#### `jwt.go` — JWT Operations (97 lines)

**Claims**: `{user_id, student_id, username, role, onboarding}` + `jwt.RegisteredClaims` (iat, exp, nbf)

**SignToken**: Validates all inputs → creates Claims → signs with HS256 → returns token string

**VerifyToken**: Parses with `jwt.ParseWithClaims` → validates HMAC signing method → checks `token.Valid` → explicit expiry check → returns Claims

#### `password.go` — Password Hashing (28 lines)

- `HashPassword`: bcrypt cost=12
- `ComparePassword`: bcrypt.CompareHashAndPassword, returns bool

#### `oauth.go` — Google Token Verification

- `VerifyGoogleToken(idToken, clientID)`: Fetches `https://oauth2.googleapis.com/tokeninfo?id_token={token}`, validates `aud` matches `clientID`, parses into `GoogleUserInfo` (with `FlexibleBool` for `email_verified`)

---

### 6. EXECUTOR: `internal/executor/` — Core Grading Engine

#### `types.go` — Execution Types (34 lines)

```go
ExecutionRequest { UserID, ProblemID uuid.UUID, Code, Language string }
TestResult       { TestCaseID, Ordinal, Passed bool, Got, Expected string, IsHidden bool }
ExecutionResult  { Status, FriendlyMessage, PassedCount, TotalCount, OutputLogs string, RuntimeMs int, TestResults }
```

#### `executor.go` — Main Execution Logic (820 lines)

**`Executor` struct**: `cfg`, `store`, `semaphore chan struct{}` (buffered, size = `ExecutorMaxConcurrency`, default 6)

**`Warmup()`**: Pulls Docker image → runs dummy container to populate Go build cache → reduces cold-start latency

**`Execute()`** (the primary grading pipeline):

1. **Semaphore acquire** — blocks if at capacity (select on ctx.Done() for cancellation)
2. **Fetch problem + test cases** from DB
3. **Format test cases**:
   - Parse each `tc.Input` as JSON array of `json.RawMessage`
   - Validate arg count matches `problem.ParamTypes`
   - Call `formatGoLiteral(type, rawArg)` for each arg
   - Format expected value similarly
   - Determine if `reflect.DeepEqual` needed (non-primitive return type)
4. **Prepare sandbox** via `PrepareSandbox()` — writes `solution.go`, `go.mod`, `main_test.go`
5. **Execute** (two paths):
   - **Remote sandbox** (if `SANDBOX_URL` set): HTTP POST with code + test_code → parse response
   - **Local Docker** (default): `docker run --rm --network=none --memory=256m --cpus=1.0 --pids-limit=512 --read-only -v sandbox:/app golang:1.23-alpine go test -v -count=1 -gcflags=-l ./...`
6. **Parse output**: Regex-based parsing of `go test -v` output:
   - `=== RUN TestSolution/case_X` → track current ordinal
   - `--- PASS: TestSolution/case_X` → mark passed
   - `--- FAIL: TestSolution/case_X` → mark failed
   - `=== FAIL: Case X` → alternative fail marker
   - `GOT: ...` / `WANT: ...` → capture got/want values
7. **Classify status**:
   - Sandbox returned `status` → use it directly (timeout, compiler_error, security_error)
   - `context.DeadlineExceeded` → `"timeout"`
   - Exit status 137 (OOM) → `"timeout"`
   - `cmdErr != nil && len(passedMap) == 0` → `"compiler_error"`
   - `passedCount == totalCount && totalCount > 0` → `"passed"`
   - Else → `"failed"`
8. **Record submission** in DB
9. **Update progress** atomically via `UpsertProgress()`
10. **Map results** → `ExecutionResult` with per-test-case details (hidden cases masked on fail)

**`ExecuteVisibleOnly()`**: Same as above but filters to only visible (`is_hidden = false`) test cases, no DB writes

**`IsPrimitiveType(t)`**: Returns true for int/uint/float/string/bool/rune/byte

**`formatGoLiteral(paramType, data)`**: Converts JSON bytes → Go literal:
- Integer types → `strconv.FormatInt/FormatUint`
- Float types → `strconv.FormatFloat`
- String → `fmt.Sprintf("%q", val)` (quoted)
- Bool → `"true"` / `"false"`
- Slice `[]T` → `[]T{...}` (recursive)
- Map `map[K]V` → `map[K]V{key: val, ...}` (recursive)

#### `sandbox.go` — Sandbox Preparation (70 lines)

**`PrepareSandbox(baseDir, uuidStr, code, renderData)`**:

1. Creates `{baseDir}/{uuidStr}/` directory
2. Writes `solution.go`: forces `package piscine` (regex replaces any existing package decl)
3. Writes `go.mod`: `module sandbox\n\ngo 1.23\n`
4. Renders `main_test.go` from Go template
5. Returns sandbox path (caller must `os.RemoveAll()`)

#### `templates.go` — Test Generation Template (53 lines)

**`mainTestTemplate`**: Go `text/template` that generates:
```go
package piscine

import (
    "testing"
    {{if .NeedsReflect}}"reflect"{{end}}
)

func TestSolution(t *testing.T) {
    {{range $i, $tc := .TestCases}}
    t.Run("case_{{$tc.Ordinal}}", func(t *testing.T) {
        {{if $.ReturnType}}
        got := {{$.FuncName}}({{$tc.Args}})
        want := {{$tc.Expected}}
        {{if $.IsPrimitive}}
        if got != want { t.Errorf("=== FAIL: Case %d\nGOT: %#v\nWANT: %#v\n", ...) }
        {{else}}
        if !reflect.DeepEqual(got, want) { ... }
        {{end}}
        {{else}}
        {{$.FuncName}}({{$tc.Args}}) // void function
        {{end}}
    })
    {{end}}
}
```

#### `sandbox_client.go` — Remote Sandbox HTTP Client (133 lines)

- `SandboxRequest`: `{code, test_code, timeout_sec}`
- `SandboxResponse`: `{status, stdout, stderr, passed_count, total_count, runtime_ms, error}`
- Retry: up to 2 retries with exponential backoff (500ms → 1s)
- Timeout: `timeoutSec + 10s` (buffer for network latency)

---

### 7. ENRICHER: `internal/enricher/enricher.go` — Dual-Provider AI Pipeline

**Architecture**: Abstracted behind `enrichmentProvider` interface:

```go
type enrichmentProvider interface {
    Name() string
    GenerateContent(ctx context.Context, systemPrompt, userPrompt string) (string, error)
}
```

Two implementations:
- **`geminiProvider`** — uses `google.golang.org/genai` SDK, Gemini API with `ResponseMIMEType: "application/json"`, structured `ResponseSchema`, `Temperature: 0.0`, `MaxOutputTokens: 8192`
- **`groqProvider`** — REST POST to `https://api.groq.com/openai/v1/chat/completions` with `{"type": "json_object"}` format, `Temperature: 0.0`, `MaxTokens: 8192`, automatic retry on HTTP 429 (reads `Retry-After` header)

Provider selection: `config.EnrichmentProvider` (default `"gemini"`); auto-detected as `"groq"` if `GROQ_API_KEY` env var is set.

**`Enricher` struct**: `cfg`, `enrichmentProvider`, `sync.Mutex` + `lastRequest time.Time` for rate limiting

**`EnrichProblem(rawReadme)`**:
1. **Provider-adaptive rate limiting**:
   - Gemini: 30s between calls (2 req/min, ≤ 50/day)
   - Groq: 2s between calls
2. System instruction: "Expert Go curriculum author, output valid JSON, rewrite z01.PrintRune → fmt.Printf"
3. User prompt: includes full README
4. Calls selected provider's `GenerateContent()`
5. Cleans response via `cleanResponse()` (strips non-JSON text by finding first `{` and last `}`)
6. Parses JSON into `enrichedResponse{title, statement, func_name, return_type, param_types[], hints[3], difficulty, xp_reward, tags[], test_cases[]}`
7. Normalizes test case inputs via `normalizeTestCaseInput()`
8. Validates all required fields via `validateEnrichedProblem()`
9. Returns `(*Problem, []TestCase)`

**`enrichmentSchema()`**: JSON Schema for Gemini `ResponseSchema` — defines all required fields with types, constraints (min/max items)

**`normalizeTestCaseInput(raw)`**: If raw is string, try to parse as JSON; if already object, marshal to JSON

**`validateEnrichedProblem()`**: Ensures:
- Title, statement, func_name, return_type non-empty
- param_types non-empty, exactly 3 hints
- difficulty 1–5, xp_reward > 0, at least 1 tag
- At least 1 test case, each with input, expected, positive ordinal

---

### 8. PARSER: `internal/parser/parser.go` — Repository Ingestion (371 lines)

**`Parser`**: Wraps `baseDir` for temp clones

**`IngestGitHubRepo(inputURL)`**:
1. Parse GitHub URL → extract repo URL + optional subpath (supports `/tree/branch/subpath`)
2. Parse repo metadata → slug, module name
3. Clone repo (sparse if subpath, depth=1)
4. Walk directory tree, collect README files
5. For each: compute SHA256 hash, extract content, detect problem type
6. Return `[]*RawProblem`

**Key functions:**
- `parseGitHubURL`: Handles `https://github.com/user/repo`, `git@github.com:user/repo.git`, subpath extraction
- `cloneRepository`: `git clone --depth 1` with optional `--filter=blob:none --sparse` + `git sparse-checkout set`
- `collectExerciseReadmes`: `filepath.WalkDir`, filters README* files, generates slugs
- `computeSourceHash`: SHA256 → hex
- `normalizeSlug`: lowercase, replace non-alphanumeric with `-`
- `detectProblemType`: `"function"` if README contains "expected function", else `"program"`

---

### 9. SANDBOX SERVICE: `sandbox/` — Standalone Execution Service

**Purpose**: Default execution path that avoids Docker-in-Docker. Deployed separately on Railway (ARM64). When `SANDBOX_URL` is set, the backend sends code via HTTP instead of spawning Docker locally.

#### `main.go` — HTTP Server (460 lines)

**Endpoints:**
- `GET /health` → `{"status":"ok"}` (bypasses rate limiter)
- `GET /version` → `{"commit":"..."}` (set via -ldflags, bypasses rate limiter)
- `POST /execute` → Run `go test`, return result (rate limited: 10 req/min per IP)
- `POST /gitea-proxy` → Legacy proxy endpoint (bypasses rate limiter)

**Execution flow (`runTests`)**:
1. Validate code for dangerous patterns via `validateCode()` (from `secure.go`)
2. Create temp directory, write `go.mod`, `solution.go` (force `package piscine`), `main_test.go`
3. `go test -v -count=1 -gcflags=-l ./...` with context timeout
4. Apply OS-level resource limits via `setProcessAttributes()` (rlimit, process group)
5. Kill process group + reap on timeout
6. Parse output and classify status (passed/failed/compiler_error/timeout)
7. Return `ExecuteResponse{status, stdout, stderr, passed_count, total_count, runtime_ms, error}`

#### `secure.go` — Pre-execution Code Validation

Blocks dangerous patterns:
- `os/exec`, `os/Remove`, `os/RemoveAll`, `os/Chmod`, `os/Chown`, `os/Chtimes`, `os/Truncate`, `os/Mkdir`, `os/MkdirAll`, `os/Rename`, `os/Symlink`, `os/Readlink`, `os/Link`, `os/Setenv`, `os/Unsetenv`, `os/Clearenv`, `os/Exit`
- `syscall` package (all)
- `net` package (all)
- `unsafe` package
- Filesystem writes: `ioutil.WriteFile`, `os.WriteFile`, file creation in Go

Returns `security_error` if any blocked pattern detected.

#### `secure_unix.go` — Unix Resource Limits

- `setProcessAttributes(cmd, timeoutSec)`: Sets `Setpgid=true` (process group), applies `setrlimit`: NPROC=6, NOFILE=1024, FSIZE=64MB
- `killProcessGroup(cmd)`: Sends SIGKILL to process group
- `reapProcess(cmd)`: Waits for process to avoid zombies

#### `secure_other.go` — Noop for non-Unix (Windows dev)

#### `ratelimit.go` — Per-IP Rate Limiter

- Sliding window per IP address
- Default: 10 requests per minute
- Purges stale entries every 5 minutes
- Returns HTTP 429 with `Retry-After` header

---

### 10. FRONTEND: `frontend/` — Next.js 14 App

#### Architecture

- **Next.js 14** with App Router
- **Dark mode** by default (`<html className="dark">`)
- **shadcn/ui** component system (Radix UI primitives + Tailwind)
- **Monaco Editor** for code editing (Go syntax highlighting)
- **framer-motion** for animations
- **sonner** for toast notifications

#### Route Structure

```
app/
├── layout.tsx              # Root layout: dark mode, Toaster
├── globals.css             # Global styles + custom keyframes
├── (auth)/                 # Auth group (no sidebar)
│   ├── layout.tsx
│   ├── login/page.tsx      # Login with email/password + Google
│   └── register/page.tsx   # Registration form
├── (legal)/                # Legal pages
│   ├── privacy/page.tsx    # Privacy policy
│   └── terms/page.tsx      # Terms of service
├── (main)/                 # Authenticated routes (with sidebar)
│   ├── layout.tsx          # TopNav + sidebar
│   ├── page.tsx            # Dashboard: problem grid with filters
│   ├── leaderboard/page.tsx # Leaderboard with podium + table
│   └── admin/page.tsx      # Admin panel: ingest, enrich, stats
├── problems/[slug]/
│   ├── page.tsx            # SSR wrapper
│   └── ProblemWorkspaceClient.tsx  # Monaco editor + test results
├── landing/page.tsx        # Landing page
└── onboarding/page.tsx     # Username selection for new users
```

#### `hooks/use-google-one-tap.ts` — Shared GIS Singleton Hook (122 lines)

Module-level singleton Google Identity Services (GIS) hook:
- **`loadGsiScript()`**: Creates `<script>` tag for `https://accounts.google.com/gsi/client`, fires registered load listeners
- **`ensureInitialized(clientId)`**: Calls `google.accounts.id.initialize()` with client ID, wrapped in try-catch (FedCM throws on localhost); always fires init listeners even on throw (popup `renderButton` works without successful init)
- **Returns**: `{ prompt, renderButton, ready }` — `ready` is a dynamic `useState` that flips `true` after script load + init attempt
- **`prompt()`**: Calls `google.accounts.id.prompt()` (One Tap), wrapped in try-catch
- **`renderButton(element, options?)`**: Calls `google.accounts.id.renderButton()` with explicit numeric width (350px), standard theme/size/text options
- All errors logged with `[GIS]` prefix; clean `useEffect` cleanup

#### `lib/api.ts` — API Client (346 lines)

Generic `fetchApi<T>()` wrapper:
- Reads JWT from `localStorage`
- Adds `Authorization: Bearer` header
- Parses `ApiResponse` envelope
- Falls back to JWT decode for `/me` if API call fails

All endpoint functions return `Promise<ApiResponse<T>>`

#### `lib/types.ts` — TypeScript Types (199 lines)

Mirrors backend types: User, Problem, Submission, ExecutionResult, TestResult, LeaderboardEntry, UserProfile, CommunitySolution, ActivityEntry, UserProblem, AdminStats, ActivityLog

#### `lib/utils.ts` — Utility Functions

- `cn()`: Tailwind class merge (clsx + tailwind-merge)
- `getUserColor(index)`: Maps 0–5 to background colors (gold, terracotta, silver, green, grey, bronze)
- `getDifficultyColor(difficulty)`: Maps 1–5 to text colors
- `getDifficultyLabel(difficulty)`: Maps 1–5 to labels (Beginner → Expert)

#### `lib/achievements.ts` — Shared Achievement Definitions

Single source of truth for achievement types and `getAchievements(profile)` function. Used by both Achievements.tsx and ActivityFeed.tsx.

#### Key UI Components

**ProblemWorkspaceClient.tsx** — Three-panel layout:
1. Left: Problem statement (rendered markdown) + metadata
2. Center: Monaco Editor with Go scaffold, function signature
3. Right: Hints accordion (3 hints) + collapsible test results panel

**Dashboard (main/page.tsx)** — Problem grid with:
- Header stats (solved, XP)
- Search + module/difficulty filters
- Solved/unsolved tabs
- Animated stagger load

**Leaderboard** — Three sections:
1. Podium (1st/2nd/3rd with gold/silver/bronze)
2. Current user stats bar
3. Full table with search, period filters (weekly/monthly/all), rank deltas

**Settings (main/settings/page.tsx)** — Tabbed layout with four tabs:
1. **Profile**: Edit name/bio, username display, account info
2. **Appearance**: Theme preferences
3. **Notifications**: Last 20 notifications with type-colored icons, unread indicators, "Mark all as read", relative timestamps
4. **Security**: Account deletion (two-step confirmation dialog), Google account linking via GIS prompt

**GoogleLinkBanner** — Amber-gradient banner at top of layout:
- `AlertTriangle` icon with "Secure your account" + "Recommended" badge
- Description explaining Google linking benefits
- Action button links to `/settings?tab=security` (notifications clickable too)
- Dismissable with state persisted in localStorage
- Auto-hides when `user.google_linked` is true

**Admin Panel** — Two-column layout:
1. Stats cards + action buttons (ingest, enrich, publish)
2. Problems table with visibility toggles + community contribution moderation

---

## DATABASE SCHEMA (PostgreSQL)

### Tables

| Table | PK | FKs | Key Columns |
|-------|----|-----|-------------|
| `users` | id (uuid) | — | student_id, username, email, password, role, color_index, xp, google_id, google_email, google_avatar_url |
| `problems` | id (uuid) | author_id → users | slug (unique), module, title, statement, func_name, param_types[], hints[], difficulty, xp_reward, tags[], visible, source_hash, raw_readme |
| `test_cases` | id (uuid) | problem_id → problems | input JSONB, expected, is_hidden, ordinal |
| `submissions` | id (uuid) | user_id, problem_id | code, status, passed_count, total_count, output_logs, runtime_ms |
| `progress` | (user_id, problem_id) | user_id, problem_id | solved, stars, attempts, best_runtime, xp_awarded |
| `activity_logs` | id (uuid) | — | type, message, color, icon |
| `submission_likes` | (submission_id, user_id) | submission_id, user_id | — |
| `notifications` | id (uuid) | user_id | type, message, related_id, is_read |
| `user_problems` | id (uuid) | user_id | slug, title, statement, test_cases JSONB[], status, admin_notes |

### Key Migrations

- `001_init.sql`: Core schema (users, problems, test_cases, submissions, progress)
- `002_indexes.sql`: Performance indexes on foreign keys + lookup columns
- `003_activity_logs.sql`: Admin activity feed
- `005_community_contributions.sql`: submission_likes table
- `006_notifications.sql`: Notification system
- `007_submission_likes.sql`: Community likes
- `008_user_profile.sql`: Profile-related function
- `009_get_full_profile.sql`: `get_full_profile()` PostgreSQL function (JSON aggregation)
- `010_add_gitea_auth.sql` → deprecated
- `011_add_gitea_token.sql` → deprecated
- `012_add_google_auth.sql`: Google Sign-In columns (google_id, google_email, google_avatar_url, username, email)
- `013_fix_rank_tiebreaker.sql`: Updated `get_full_profile()` function — rank ordering now `xp DESC, solved_count DESC, id` (was arbitrary, prevented rank jumping)

---

## CORE PIPELINES (Three Sequential Stages)

### 1. Ingest (`admin.go` → `parser.go`)
1. Admin provides GitHub repo URL
2. Clone repo (shallow, sparse if subpath)
3. Walk directory tree for README files
4. SHA256 hash for dedup/idempotency
5. Create Problem records with `visible=false`

### 2. Enrich (`admin.go` → `enricher.go` → Gemini/Groq API)
1. Fetch problem with `raw_readme`
2. Call configured AI provider (Gemini with ResponseSchema, or Groq with `json_object` format)
3. Parse response → problem fields + test cases
4. Upsert enriched problem + test cases
5. Set `visible=true` (auto-publish)
6. Rate limited: 30s between calls (Gemini) or 2s (Groq)

### 3. Execute (`submissions.go` → `executor.go` → sandbox)
1. Student submits code
2. Executor renders `solution.go` + `main_test.go` from template
3. **Primary path**: Send to remote sandbox via HTTP (`SANDBOX_URL`)
4. **Fallback path**: Spawn local Docker container with resource limits
5. Parse `go test` output
6. Classify status (passed/failed/compiler_error/timeout)
7. Record submission + update progress atomically
8. Return per-test-case results

---

## KEY ARCHITECTURAL DECISIONS

| Decision | Implementation | Why |
|----------|---------------|-----|
| **No ORM** | Handwritten pgx/v5 queries | Full control, predictable performance, minimal footprint |
| **No Reflection in tests** | Template generates type-specific comparisons | `==` for primitives, `reflect.DeepEqual` for complex types |
| **Template-based code gen** | Go `text/template` for `main_test.go` | Injection-proof, type-safe, deterministic |
| **Structured AI outputs** | Gemini ResponseSchema | Guaranteed JSON shape, no markdown parsing |
| **Remote sandbox first** | HTTP sandbox service on Railway | Avoids Docker-in-Docker on Oracle OCI, ~800ms cold start |
| **In-memory rate limiter** | Sliding window per user | No Redis dependency, fine for single-process |
| **In-memory cache** | Generic typed cache with TTL | Reduces DB load for frequently accessed profile/me |
| **Atomic progress** | SQL transaction | Prevents race conditions on XP/stars/attempts |

---

## HARD CONSTRAINTS & LIMITS

| Constraint | Enforcement | Location |
|-----------|-------------|----------|
| **6 concurrent executions** | Buffered channel semaphore (configurable) | `executor.go:26` |
| **30s per execution** | `context.WithTimeout` | `executor.go:177` |
| **50 Gemini calls/day** | 30s enforced sleep (Gemini) or 2s (Groq) | `enricher.go` |
| **50KB code size** | HTTP 413 check | `submissions.go:65` |
| **Docker isolation** | `--network=none --memory=256m --cpus=1.0` | `executor.go:181-184` |
| **5 req/45s submissions** | Per-user sliding window | `middleware.go:26` |
| **10 req/min sandbox** | Per-IP sliding window | `sandbox/ratelimit.go` |
| **Security block** | Pre-exec regex validation | `sandbox/secure.go` |

---

## ERROR HANDLING PATTERNS

- **API layer**: Standardized `APIResponse` envelope with `{success, data, error}`
- **Store layer**: All errors wrapped with `fmt.Errorf("context: %w", err)`
- **Executor**: Friendly messages for common failures (timeout, OOM, compiler errors)
- **Docker**: Exit status 137 = OOM, `context.DeadlineExceeded` = timeout
- **Sandbox**: Returns structured `ExecuteResponse` with status + optional error message

---

## TESTING

- **Backend unit tests**: `go test ./internal/...`
- **Auth tests**: `internal/auth/auth_test.go`
- **Config tests**: `internal/config/config_test.go`
- **Store tests**: `internal/store/users_test.go`
- **Executor tests**: `internal/executor/executor_test.go` (spawns real Docker containers)
- **Frontend**: No test files found in current codebase

---

## ENVIRONMENT VARIABLES

```bash
# Required
DATABASE_URL=postgres://...        # Supabase connection string
JWT_SECRET=...                     # Min 32 chars
GEMINI_API_KEY=...                 # Google AI Studio (required if provider=gemini)

# Optional (with defaults)
PORT=8080
ENVIRONMENT=development
ALLOWED_ORIGIN=http://localhost:3000
JWT_EXPIRY_HOURS=24

# AI Enrichment (dual provider)
ENRICHMENT_PROVIDER=gemini         # "gemini" or "groq"
GEMINI_MODEL=gemini-2.5-pro
GROQ_API_KEY=                      # Required if provider=groq
GROQ_MODEL=llama-3.3-70b-versatile

# Execution
EXECUTOR_MAX_CONCURRENCY=6
EXECUTOR_TIMEOUT_SECONDS=30
DOCKER_IMAGE=golang:1.23-alpine
SANDBOX_BASE_DIR=/tmp/koder
BUILD_CACHE_DIR=/tmp/go-build-cache
SANDBOX_URL=                       # Empty = use local Docker
GO_VERSION=1.23

# Auth
GOOGLE_CLIENT_ID=                  # For Google Sign-In
ADMIN_EMAIL=                       # For admin role detection
ADMIN_PASSWORD=                    # For admin role detection
```
