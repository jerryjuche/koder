# Koder Codebase - Complete Analysis

## Project Overview
Koder is a zero-cost, production-grade automated code-grading platform for Go programming curricula. It runs on Oracle Cloud ARM64 free tier with a $0/month budget.

---

## BACKEND (Go) - Complete Analysis

### 1. ENTRY POINT: cmd/server/main.go
**Initialization Flow:**
- Sets up structured logging via `slog` (output to stdout)
- Loads config from environment via `config.Load()`
- Creates PostgreSQL connection pool via `store.NewPostgresStore(ctx, cfg.DatabaseURL)`
- Initializes `executor.NewExecutor(cfg, storeInstance)` with concurrency semaphore
- Spawns warmup goroutine: pulls Docker image and pre-populates Go build cache
- Creates HTTP router via `api.NewRouter(cfg, storeInstance, execInstance)`
- Starts HTTP server on `cfg.Port` (default 8080) with timeouts: ReadTimeout, WriteTimeout, IdleTimeout all 60s
- Gracefully shuts down on SIGINT/SIGTERM with 10s timeout

**Key Variables:**
- `logger` - structured logger instance
- `cfg` - Config struct with all env vars
- `storeInstance` - PostgreSQL store for DB operations
- `execInstance` - Executor for sandboxed code execution
- `router` - HTTP request router
- `server` - HTTP server instance

### 2. CONFIG: internal/config/config.go
**Config Struct Fields:**
- **Database**: `DatabaseURL` (required, Supabase connection string)
- **Auth**: 
  - `JWTSecret` (required, min 32 chars, used for HS256 signing)
  - `JWTExpiryHours` (default 24)
- **Gemini**: 
  - `GeminiAPIKey` (required)
  - `GeminiModel` (default "gemini-2.5-pro")
- **Execution**:
  - `ExecutorMaxConcurrency` (default 2, via buffered channel semaphore)
  - `ExecutorTimeoutSeconds` (default 30, context timeout for each execution)
  - `DockerImage` (default "golang:1.22-alpine")
  - `SandboxBaseDir` (default "/tmp/koder", unique UUID per submission)
  - `BuildCacheDir` (default "/tmp/go-build-cache", pre-warmed Go cache)
- **Server**:
  - `Port` (default 8080, validated 1-65535)
  - `Environment` ("development" or "production")
- **CORS**:
  - `AllowedOrigin` (default "http://localhost:3000")
- **Admin**:
  - `AdminEmail`, `AdminPassword` (env-based credentials)

**Load() Function:**
1. Attempts to load `.env` file (non-blocking if missing)
2. Reads all env vars with defaults
3. Validates required fields and ranges
4. Provides `ExecutorTimeout()` and `JWTExpiry()` helper methods returning `time.Duration`

### 3. DATA STORE: internal/store/

#### types.go - Data Models
**User**:
- `ID` (UUID, primary key)
- `StudentID` (string, unique, email or identifier)
- `Name`, `Password` (bcrypt hash), `Role` ("student"|"admin")
- `ColorIndex` (0-5 for avatar colors), `XP`, `CreatedAt`

**Problem**:
- `ID`, `Slug` (unique), `Module`, `Type`, `Language` ("go")
- `Title`, `Statement` (markdown), `FuncName`, `ReturnType`, `ParamTypes` ([]string)
- `Hints` ([]string, exactly 3 from AI), `Difficulty` (1-5), `XPReward`, `Tags` ([]string)
- `Visible` (false = draft, pending enrichment), `SourceHash` (SHA256 of README for dedup)
- `RawReadme` (original GitHub README), `CreatedAt`, `UpdatedAt`
- **UI Fields**: `Solved`, `Stars` (1-3 based on attempts), `Attempts`, `TotalSubmissions`, `SuccessRate`

**TestCase**:
- `ID`, `ProblemID`, `Input` ([]byte = JSON array), `Expected` (string)
- `IsHidden` (true = not shown on fail), `Ordinal` (1-indexed position)

**Submission**:
- `ID`, `UserID`, `ProblemID`, `Language`, `Code`, `Status` ("passed"|"failed"|"compiler_error"|"timeout")
- `PassedCount`, `TotalCount`, `OutputLogs`, `RuntimeMs`, `CreatedAt`

**Progress**:
- `UserID`, `ProblemID` (composite PK)
- `Solved`, `Stars`, `Attempts`, `BestRuntime` (int), `XPAwarded`

**ActivityLog**:
- `ID`, `Type`, `Message`, `Color`, `Icon`, `CreatedAt`
- Used for admin dashboard real-time activity feed

**LeaderboardEntry**:
- `Rank`, `User` (embedded LeaderboardUser), `BestTimeMs`, `RankDelta`

#### store.go - Interface & Connection
**Store Interface**: Defines all database operations contract
- User ops, Problem ops, Submission ops, Admin ops
- All methods take `context.Context` as first arg

**PostgresStore**:
- `pool *pgxpool.Pool` - pgx v5 connection pool (no prepared statement cache for Supabase compatibility)
- `NewPostgresStore()` - parses DB URL, pings connection, returns store
- `Close()` - closes pool

#### users.go - User Operations
**CreateUser()**:
- Hashes password with `bcrypt.GenerateFromPassword(password, 12)`
- Validates role ("student"|"admin"), returns generated UUID
- Query: INSERT with RETURNING id, created_at

**GetUserByStudentID()** / **GetUserByID()**:
- Explicit field scanning (11 fields scanned manually)
- Returns pgx.ErrNoRows wrapped in formatted error

**UpdateUserRole()**:
- Simple UPDATE with role validation
- Checks RowsAffected() to detect "user not found"

**GetLeaderboard()**:
- Complex SQL: LEFT JOIN users with progress
- Filters out admin role, groups by user, orders by xp DESC, solved_count DESC
- Calculates level = (XP / 1000) + 1
- Returns top 100 entries with ranks

**GetSolvedCount()**:
- COUNT(*) WHERE user_id AND solved = true

#### problems.go - Problem Operations
**ListVisibleProblems()**:
- LEFT JOIN problems with progress ON user_id
- Filters `visible = true`, orders by `created_at DESC`
- Returns 22 fields including progress overlay (solved, stars, attempts)

**GetProblemBySlug()** / **GetProblemBySlugAny()**:
- Similar structure, one filters `visible = true`, other doesn't
- Calculates `success_rate = COUNT(successful_subs) / COUNT(total_subs) * 100`
- **GetProblemBySlugAny** used by admin for enrichment

**UpsertProblem()**:
- INSERT ON CONFLICT (slug) DO UPDATE
- Upserts all 16 fields including visible, source_hash, raw_readme
- Updates timestamps to NOW()

**ListProblemsNeedingEnrichment()**:
- Filters `visible = false`, orders by `created_at ASC`
- Used by admin to batch-enrich unpublished problems

#### submissions.go - Submission Operations
**CreateSubmission()**:
- Inserts submission with RETURNING id, created_at
- 9 fields: user_id, problem_id, language, code, status, passed_count, total_count, output_logs, runtime_ms

**GetProblemWithTestCases()**:
- Fetches problem by ID, then calls `GetTestCasesForProblem()`
- Returns tuple (*Problem, []TestCase, error)

#### testcases.go - Test Case Operations
**GetTestCasesForProblem()**:
- SELECT * ORDER BY ordinal ASC
- Returns all 6 fields (id, problem_id, input, expected, is_hidden, ordinal)

#### progress.go - Progress Tracking (Complex)
**UpsertProgress()**:
- **Transaction-based atomic operation**
1. Gets problem's `xp_reward`
2. Queries existing progress (if none, creates new)
3. Calculates:
   - `newAttempts = currentAttempts + 1`
   - `newSolved = currentSolved OR prog.Solved` (once solved, stays solved)
   - **Stars logic**: 
     - If solved: 1st attempt = 3 stars, 2nd = 2 stars, 3rd+ = 1 star
     - Only increase stars, never decrease
   - `newBestRuntime = MIN(current, prog.BestRuntime)`
   - `xpToAward = xpReward` if `newSolved && !currentSolved` (only award on first solve)
4. Upserts progress row (INSERT or UPDATE)
5. Updates user's total XP if xpToAward > 0
6. Commits transaction
7. Updates caller's Progress struct with actual DB state

#### admin.go - Admin Operations
**LogActivity()**:
- Simple INSERT into activity_logs table (4 fields)

**GetRecentActivity()**:
- SELECT * ORDER BY created_at DESC LIMIT $1
- Ensures returns empty array, not nil

**GetAdminStats()**:
- Single query with 3 COUNT subqueries:
  - Total problems
  - Active problems (visible = true)
  - Total submissions

### 4. API HANDLERS: internal/api/

#### router.go - HTTP Routing
**NewRouter()**:
- Creates chi router with CORS middleware
- Handlers: Auth, Problem, Submission, Admin, Me, Leaderboard
- Routes:
  - `GET /health` - health check
  - `POST /auth/register`, `POST /auth/login` - public
  - Protected routes (via AuthMiddleware):
    - `GET /me` - user profile
    - `GET /leaderboard` - leaderboard
    - `GET /problems` - list visible problems
    - `GET /problems/{slug}` - get problem details
    - `POST /submit` - submit solution
    - Admin only (via AdminOnly):
      - `POST /admin/ingest` - ingest GitHub repo
      - `POST /admin/enrich` - enrich single problem
      - `POST /admin/enrich-all` - batch enrichment
      - `GET /admin/stats`, `/admin/activity`, `/admin/problems`

#### middleware.go - Request Processing
**CORSMiddleware()**:
- Sets headers: Access-Control-Allow-Origin, Methods (GET, POST, OPTIONS), Headers (Authorization, Content-Type)
- Handles preflight OPTIONS requests
- Uses `cfg.AllowedOrigin`

**AuthMiddleware()**:
- Checks Authorization header (Bearer token format)
- Verifies JWT via `auth.VerifyToken()`
- Attaches claims to request context via `claimsContextKey`
- Returns 401 if missing/invalid

**AdminOnly()**:
- Checks `claims.Role == "admin"`
- Returns 403 Forbidden if not admin

**GetClaims()**:
- Extracts Claims from context

#### responses.go - HTTP Envelope
**APIResponse**:
- `Success` (bool), `Data` (any), `Error` (APIError or nil)
- All responses use this envelope structure

**RespondSuccess()** / **RespondCreated()** / **RespondError()**:
- Write JSON with status code
- RespondSuccess = 200, RespondCreated = 201
- RespondError = custom status + structured APIError

#### auth.go - Authentication Handler
**RegisterRequest**: `student_id`, `name`, `password`
**LoginRequest**: `student_id`, `password`

**Register()**:
- Parses JSON, validates fields
- **Admin detection**: if `ADMIN_EMAIL` env set and studentId/password match, role="admin"
- Creates user via store.CreateUser()
- Signs JWT token via `auth.SignToken(userID, studentID, role, secret, expiry)`
- Returns token in authResponse

**Login()**:
- Gets user by studentId
- Compares password via `auth.ComparePassword(hashedPassword, plainPassword)`
- **Dynamic admin upgrade**: if credentials match ADMIN_EMAIL/ADMIN_PASSWORD, promotes to admin
- Signs and returns token

#### problems.go - Problem Handler
**ListVisibleProblems()**:
- Gets claims, parses userID
- Calls `store.ListVisibleProblems(ctx, userID)` with progress overlay
- Returns []Problem

**GetProblemBySlug()**:
- Gets problem from slug (visible only)
- Returns single Problem with metadata

#### submissions.go - Submission Handler (Core Grading)
**SubmitRequest**: `problem_slug`, `code`

**Submit()**:
1. Gets claims, validates auth
2. Parses request JSON, validates code (50KB limit for security)
3. Fetches problem by slug
4. Creates ExecutionRequest struct
5. Calls `executor.Execute(ctx, execReq)` - **blocks on semaphore**
6. Logs activity on success/timeout
7. Creates Submission record in DB
8. Calls `store.UpsertProgress()` to update user progress atomically
9. Returns ExecutionResult with test results

#### leaderboard.go - Leaderboard Handler
**GetLeaderboard()**:
- Calls `store.GetLeaderboard()`
- Returns []LeaderboardEntry ordered by XP DESC

#### me.go - User Profile Handler
**meResponse**: ID, StudentID, Name, Role, ColorIndex, XP, Level, SolvedCount
**GetMe()**:
- Gets user from JWT claims
- Fetches user from DB by UUID
- Calculates solved count, level = (XP/1000)+1
- Returns safe response (no password)

#### admin.go - Admin Operations Handler
**Ingest()**:
1. Parses repo_url from request
2. Calls `parser.IngestGitHubRepo(ctx, repoURL)` - clones repo, extracts READMEs
3. For each raw problem:
   - Checks if exists via `GetProblemBySlugAny()` with SHA256 hash comparison
   - If unchanged (same hash), returns "unchanged" status
   - Otherwise creates Problem with `visible=false`, stores raw_readme
   - Upserts to DB
4. Logs activity
5. Returns ingestion responses

**Enrich()**:
1. Gets problem by slug
2. Calls `enricher.EnrichProblem(ctx, problem.RawReadme)` - **calls Gemini API**
3. Updates problem with enriched data (title, statement, FuncName, ParamTypes, Hints, Difficulty, XPReward, Tags)
4. Upserts problem
5. Calls `UpsertTestCasesForProblem()` to save test cases
6. Returns slug

**EnrichAll()**:
- Gets all hidden (unenriched) problems
- Iterates through each, enriches sequentially (respects 30s rate limit)
- Logs batch completion with count

**GetAdminStats()**, **GetAdminActivity()**, **ListAllProblems()**:
- Simple store queries, return JSON responses

### 5. AUTHENTICATION: internal/auth/

#### jwt.go - JWT Operations
**Claims Struct**:
- `UserID` (string), `StudentID` (string), `Role` (string)
- Embeds `jwt.RegisteredClaims` (IssuedAt, ExpiresAt, NotBefore)

**SignToken()**:
- Validates all inputs (non-empty, positive expiry)
- Creates Claims with current time + expiryDuration
- Signs with HS256 (HMAC-SHA256)
- Returns signed token string

**VerifyToken()**:
- Parses JWT with `jwt.ParseWithClaims()`
- Validates signing method is HMAC
- Checks token.Valid
- Explicitly checks expiry via claims.ExpiresAt.Before(now)
- Returns Claims or error

#### password.go - Password Hashing
**HashPassword()**:
- Uses `bcrypt.GenerateFromPassword(password, 12)` - cost=12
- Returns hash string

**ComparePassword()**:
- Uses `bcrypt.CompareHashAndPassword()`
- Returns true/false, suppresses error

### 6. EXECUTOR: internal/executor/ - Core Grading Engine

#### types.go - Execution Types
**ExecutionRequest**:
- `UserID`, `ProblemID` (UUIDs), `Code` (student submission), `Language` ("go")

**TestResult**:
- `TestCaseID`, `Ordinal`, `Passed`, `Got`, `Expected`, `IsHidden`

**ExecutionResult**:
- `Status` ("passed"|"failed"|"compiler_error"|"timeout")
- `PassedCount`, `TotalCount`, `RuntimeMs`, `OutputLogs`, `TestResults` ([]TestResult)

#### executor.go - Main Execution Logic
**Executor Struct**:
- `cfg *config.Config`
- `store store.Store`
- `semaphore chan struct{}` - **buffered to MaxConcurrency (default 2)**

**Warmup()**:
1. Pulls Docker image via `docker pull`
2. Creates build cache directory
3. Runs dummy container to populate Go build cache

**Execute()**:
1. **Acquires semaphore** - blocks if at capacity (max 2 concurrent)
2. Fetches problem + test cases from DB
3. Determines if `reflect` needed (non-primitive return types)
4. For each test case:
   - Parses JSON input ([]json.RawMessage)
   - Validates param count matches problem ParamTypes
   - Formats each arg to Go literal via `formatGoLiteral()`
5. Calls `PrepareSandbox()` to create temp directory structure with:
   - `solution.go` (student code, forces package piscine)
   - `go.mod` (module sandbox, go 1.22)
   - `main_test.go` (generated from template with test cases)
6. **Runs Docker**:
   ```
   docker run --rm --network=none --memory=256m --cpus=1.0 \
     -v /sandbox:/app \
     -v /build-cache:/root/.cache/go-build \
     golang:1.22-alpine \
     go test ./... -v
   ```
   - Timeout: `cfg.ExecutorTimeout()` (default 30s)
   - **Isolation**: no network, 256MB memory, 1 CPU
7. Parses `go test` output:
   - Regex: `=== RUN TestSolution/case_X` (track current test)
   - Regex: `KODER_FAILED_START||got||expected||KODER_FAILED_END` (capture failure details)
   - Regex: `--- PASS: TestSolution/case_X` (mark as passed)
   - Regex: `--- FAIL: TestSolution/case_X` (mark as failed)
8. **Classifies status**:
   - `context.DeadlineExceeded` = "timeout"
   - `cmdErr != nil && len(passedMap) == 0` = "compiler_error"
   - `passedCount == totalCount` = "passed"
   - else = "failed"
9. Records Submission in DB
10. Updates Progress atomically via `UpsertProgress()`
11. Returns ExecutionResult with test results

**IsPrimitiveType()**:
- Checks if type is int, uint, float, string, bool, rune, byte
- Used to decide between `==` comparison vs `reflect.DeepEqual()`

**formatGoLiteral()**:
- Converts JSON to Go literal:
  - Integer types → `strconv.FormatInt(val, 10)` (NOT `fmt.Sprintf` to avoid scientific notation)
  - Float types → `strconv.FormatFloat(val, 'f', -1, 64)`
  - String types → `strconv.Quote(val)`
  - Slice types → formatted as `[]T{...}`
  - Struct/Map types → JSON marshaled as string

#### sandbox.go - Sandbox Preparation
**PrepareSandbox()**:
1. Creates `/tmp/koder/{uuid}` directory
2. Writes `solution.go`:
   - Forces `package piscine` (regex replaces any package declaration)
   - If no package, prepends `package piscine\n\n`
3. Writes `go.mod`: `module sandbox\ngo 1.22\n`
4. Renders `main_test.go` from template with test cases
5. Returns sandboxPath (caller must clean via os.RemoveAll())

#### templates.go - Test Generation Template
**TemplateRenderData**:
- `FuncName`, `ParamTypes`, `ReturnType`, `IsPrimitive`, `NeedsReflect`, `TestCases`

**mainTestTemplate**:
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
    if got != want {
      t.Errorf("KODER_FAILED_START||%#v||%#v||KODER_FAILED_END", got, want)
    }
    {{else}}
    if !reflect.DeepEqual(got, want) {
      t.Errorf("KODER_FAILED_START||%#v||%#v||KODER_FAILED_END", got, want)
    }
    {{end}}
    {{else}}
    {{$.FuncName}}({{$tc.Args}})
    {{end}}
  })
  {{end}}
}
```
- Uses conditional template logic for optional imports/comparisons
- Generates unique subtest per case for parallel execution & fine-grained failure reporting

### 7. ENRICHER: internal/enricher/enricher.go - AI Pipeline

**Enricher Struct**:
- `cfg *config.Config`
- `client *genai.Client` (Gemini SDK)
- `mu sync.Mutex`, `lastRequest time.Time` (rate limiting state)

**EnrichProblem()**:
1. **Rate limiting**: enforces 30s sleep between API calls (2 req/min = max 50/day)
2. Prepares system instruction (rewrite z01.PrintRune → fmt.Printf, etc.)
3. Prepares user prompt with raw README
4. **Calls Gemini API** with:
   - `ResponseMIMEType: "application/json"`
   - `ResponseSchema: enrichmentSchema()` - validates structured output
   - `Temperature: 0.0` (deterministic)
   - `MaxOutputTokens: 2500`
5. Parses JSON response into `enrichedResponse`
6. Maps to `store.Problem` and `[]store.TestCase`
7. Normalizes test case inputs via `normalizeTestCaseInput()` (handles string or JSON)
8. Validates all fields via `validateEnrichedProblem()`

**enrichmentSchema()**:
- Defines JSON schema with all required fields:
  - title, statement, func_name, return_type, param_types (array of strings)
  - hints (array, min 3, max 3), difficulty, xp_reward, tags (array)
  - test_cases (array of objects with input_json, expected, is_hidden, ordinal)

**normalizeTestCaseInput()**:
- If string: tries to parse as JSON, else wraps as quoted string
- If object/null: marshals to JSON

**validateEnrichedProblem()**:
- Checks all required fields are non-empty
- Validates difficulty 1-5, xp_reward > 0
- Ensures exactly 3 hints, at least 1 tag, at least 1 test case
- Validates each test case has input, expected, positive ordinal

### 8. PARSER: internal/parser/parser.go - Repository Ingestion

**RawProblem Struct**:
- `Slug`, `Module`, `SourceHash` (SHA256), `RawReadme`, `RepoURL`, `Type`

**Parser.IngestGitHubRepo()**:
1. Parses repo metadata via `parseRepoMetadata()` → (slug, module)
2. Clones repo to temp directory via `cloneRepository()` (git clone --depth 1)
3. Walks directory tree collecting README files via `collectExerciseReadmes()`
4. If no exercises found, uses root README
5. Returns array of RawProblems

**collectExerciseReadmes()**:
- Walks file tree, finds README* files
- Filters for paths containing "exercises/" folder
- Generates slug from repo + relative path
- Computes SHA256 hash of content
- Detects problem type (function vs program)

**computeSourceHash()**:
- `SHA256(rawReadme)` → hex string
- Used for deduplication (unchanged = skip)

**parseRepoMetadata()**:
- Handles git SSH URLs (git@github.com:user/repo.git)
- Handles HTTPS URLs
- Extracts repository name as slug, path as module
- Normalizes to lowercase with `-` separators

**normalizeSlug()** / **normalizeModule()**:
- Removes `.git`, special chars, converts to lowercase

---

## FRONTEND (TypeScript/React) - Complete Analysis

### 1. LAYOUT STRUCTURE
```
app/
├── layout.tsx - Root RSC
├── (auth)/
│   ├── layout.tsx
│   ├── login/page.tsx
│   └── register/page.tsx
├── (main)/
│   ├── layout.tsx
│   ├── page.tsx (dashboard)
│   ├── leaderboard/page.tsx
│   └── admin/page.tsx
└── problems/
    └── [slug]/
        ├── page.tsx (SSR wrapper)
        └── ProblemWorkspaceClient.tsx (use client)
```

### 2. TYPES: frontend/lib/types.ts
**User**: id, name, studentId, role, avatarIndex, xp, level, solvedCount
**Problem**: id, slug, title, module, difficulty, xpReward, solved, status, visible, successRate, estTimeMinutes, tags, statement, descriptionMarkdown, func_name, return_type, param_types, total_submissions, success_rate
**ExecutionResult**: status, passed_count, total_count, runtime_ms, output_logs, test_results (array of BackendTestResult)
**LeaderboardEntry**: rank, user (User), bestTimeMs, rankDelta

### 3. API: frontend/lib/api.ts
**fetchApi<T>()**:
- Generic wrapper around fetch()
- Gets token from localStorage, adds Bearer header
- Parses ApiResponse envelope
- Returns typed response

**All Endpoints**:
- `login(data)`, `register(data)` - POST
- `fetchUser()` - GET /me (with JWT fallback decode)
- `fetchProblems()` - GET /problems
- `fetchProblem(slug)` - GET /problems/{slug}
- `submitSolution(slug, code)` - POST /submit
- `fetchLeaderboard()` - GET /leaderboard
- `ingestGitHubRepo(url)` - POST /admin/ingest
- `enrichAllProblems()` - POST /admin/enrich-all
- `fetchAdminStats()` - GET /admin/stats
- `fetchAdminActivity()` - GET /admin/activity
- `fetchAllProblemsAdmin()` - GET /admin/problems

### 4. UTILITIES: frontend/lib/utils.ts
**cn()**: Tailwind className merge (clsx + tailwind-merge)
**getUserColor(index)**: Maps avatar index (0-5) to bg color (gold, terracotta, silver, green, grey, bronze)
**getDifficultyColor(difficulty)**: Maps 1-5 to text colors (green, blue, gold, orange, red)
**getDifficultyLabel(difficulty)**: Maps 1-5 to labels ("Beginner", "Easy", "Medium", "Hard", "Expert")

### 5. AUTHENTICATION PAGES
**LoginPage** (app/(auth)/login/page.tsx):
- Form: studentId, password
- Calls `login()`, stores token in localStorage
- Redirects to `/` on success

**RegisterPage** (app/(auth)/register/page.tsx):
- Form: firstName, lastName, studentId (optional), email, password
- Creates user with name = `${firstName} ${lastName}`
- Uses email or studentId for student_id field
- Stores token, redirects to `/`

### 6. MAIN DASHBOARD: app/(main)/page.tsx
**State**:
- `problems` - all visible problems
- `user` - current user profile
- `loading` - initial load state

**Features**:
- Header stats: solved count, XP earned, streak (hardcoded 7 days)
- Filters: search, modules dropdown, levels dropdown, all/solved/unsolved tabs
- Problem grid (3 columns):
  - Problem number, module badge, solved check mark
  - Title, difficulty (flame icons), tags
  - Success rate, submission count (metadata)
- Animated stagger on load (100ms delay per card)

### 7. PROBLEM WORKSPACE: app/problems/[slug]/ProblemWorkspaceClient.tsx
**State**:
- `problem` - current problem details
- `code` - editor content (default scaffold with function signature)
- `panelMode` - "tests" or "hints"
- `hintsOpen` - array of 3 booleans for hint accordion
- `submitting` - submission in progress
- `results` - test results from last submission
- `errorMsg` - compiler/timeout error message

**Three-panel layout**:
1. **Left panel** (1/3 width):
   - Problem statement (Markdown)
   - Metadata: tags, submissions count, success rate, estimated time
2. **Middle panel** (flex-1):
   - Monaco Editor for Go code
   - Scaffold provided with function signature
3. **Right panel** (collapsible):
   - Hints with accordion (3 hints from Gemini)
   - Collapsible bottom panel with test results

**Submit Flow**:
1. Calls `submitSolution(slug, code)`
2. On success:
   - Maps `test_results` to local `TestResult` format
   - Hides output for hidden test cases that failed
   - Shows pass/fail icons, execution times
   - Dispatches 'user-updated' event to refresh leaderboard/profile
3. On failure:
   - Shows error message (compiler error, timeout, or failed tests)
   - Toast notification

### 8. LEADERBOARD: app/(main)/leaderboard/page.tsx
**State**:
- `leaderboard` - sorted entries from API
- `user` - current user profile

**Sections**:
1. **Podium** (top 3):
   - Center: 1st place (larger, gold border)
   - Left: 2nd place, Right: 3rd place
   - Avatar (initials), name, XP, rank badge
2. **Current user stats bar**:
   - Avatar, rank position, name
   - XP, solved count, best time
3. **Full leaderboard table**:
   - Search filter, time period buttons (weekly, monthly, all-time)
   - Columns: rank, rank delta (trending icon), student (avatar + name), XP, solved, best time
   - Highlights current user with gold left border

### 9. ADMIN DASHBOARD: app/(main)/admin/page.tsx
**Authorization**:
- Checks `fetchUser()` for role="admin"
- Redirects to `/` if not authorized

**State**:
- `stats` - AdminStats (total, active, submissions)
- `activityLogs` - real-time activity feed
- `problems` - all problems including drafts
- `searchTerm` - filter problems
- Reloads data every 15 seconds

**Two-column layout**:
1. **Left column**:
   - Top 3 stat cards (total problems, active problems, total submissions)
   - Two action cards:
     - **Ingest GitHub Repo**: text input, clones repo and ingests problems
     - **Enrich All Problems**: triggers Gemini enrichment on drafts
2. **Right column**:
   - **Problems table**:
     - Search, filters by title/slug
     - Columns: problem, module, difficulty, status, visible
     - Shows draft/enriched status

### 10. COMPONENTS: frontend/components/layout/TopNav.tsx
**State**:
- `user` - fetched via `fetchUser()` on mount
- `loading` - initial load state
- `userMenuOpen` - user menu dropdown

**Features**:
- Logo/brand (ZeroJudge)
- Navigation links: Problems, Leaderboard, Admin (admin only)
- XP bar: shows level + % progress to next level
- Notifications bell with red dot
- User menu dropdown (profile, settings, logout)
- Listens for 'user-updated' event to refresh profile

### 11. UTILITIES
**toast.ts**: Wrapper around `sonner` toast library (success, error, info, default)
**hooks/use-mobile.ts**: React hook to detect mobile viewport

---

## DATABASE SCHEMA (PostgreSQL)

### Tables & Indexes
1. **users** (PK: id)
   - Indexes: student_id, role
2. **problems** (PK: id)
   - Indexes: slug (unique), visible, module, language
3. **test_cases** (PK: id, FK: problem_id)
   - Indexes: problem_id (unique per ordinal)
4. **submissions** (PK: id, FK: user_id, problem_id)
   - Indexes: user_id, problem_id, status, created_at
5. **progress** (PK: user_id+problem_id)
   - Indexes: user_id, problem_id, solved
6. **activity_logs** (PK: id)
   - Indexes: created_at (DESC)

---

## CRITICAL CONSTRAINTS (Hard Limits)

| Constraint | Enforcement |
|-----------|------------|
| **Max 2 concurrent executions** | Buffered channel semaphore (capacity=2) |
| **Max 30 seconds per execution** | `context.WithTimeout()` on `exec.CommandContext()` |
| **Max 50 Gemini API calls/day** | 30-second enforced sleep between calls |
| **Max 50KB code submission** | HTTP 413 if exceeded |
| **Docker isolation** | `--network=none --memory=256m --cpus=1.0` |
| **1 bcrypt round cost** | 12 (industry standard) |

---

## CODE QUALITY PATTERNS

1. **Raw SQL** - No ORM, all queries hand-written with explicit field scanning
2. **No reflection** - Manual type conversions, avoids `reflect.DeepEqual` where possible
3. **Template-based code generation** - `text/template` for test files (type-safe, not string concat)
4. **Structured AI outputs** - Gemini ResponseSchema enforces shape, no markdown parsing
5. **Atomic transactions** - Progress updates wrapped in SQL transactions
6. **Error wrapping** - All errors wrapped with context via `fmt.Errorf("%w")`

---

## KEY ARCHITECTURAL DECISIONS

1. **No ORM**: All SQL hand-written for control + minimal memory footprint
2. **Raw string types**: Using strings for return_type, param_types, hints (not ENUM) for flexibility
3. **JSONB for inputs**: Test case inputs stored as JSONB for flexibility
4. **Explicit scanning**: Every field scanned manually to avoid reflection overhead
5. **Template-based test generation**: Type-safe Go code generation, not string concatenation
6. **Structured Gemini outputs**: ResponseSchema enforces shape, no parsing markdown
7. **Monolithic binary**: Single process on single host, no queue abstraction
8. **Direct Docker subprocess**: No gVisor, simpler isolation with `--network=none --memory=256m`


## Update: Problem Statements & Workspace Polish
- Updated `statement` for 11 core problems (including `edit-distance`) in the database with rich markdown, detailed considerations, examples, and realistic solve-time estimates.
- Overhauled `ProblemWorkspaceClient.tsx` to feature premium glassmorphic styling, dynamic hover states, glowing accents, and enhanced `@tailwindcss/typography` (`remarkGfm`) markdown styling.
