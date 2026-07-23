# Koder — Professional Codebase Index

## Project Overview

**Koder** is a zero-cost, production-grade automated code-grading platform for Go and Python programming curricula. Students solve problems in a Monaco editor workspace, submit code, and receive instant pass/fail results with diff output. AI (NVIDIA NIM / DeepSeek V4 Flash) enriches raw problem specs into structured test cases. Runs entirely on free-tier infrastructure.

- **Stack:** Go 1.26 backend (chi router, pgx/v5) + Next.js 15 frontend (App Router, React 19)
- **Infrastructure:** Go monolith on Render/Oracle (ARM64) + remote sandbox on Railway + Supabase Postgres + Vercel frontend
- **Core Constraint:** $0/month operating budget with hard resource limits (500MB Postgres, NVIDIA NIM API quota, 6 concurrent executions max)
- **Codebase:** 79 Go source+test files (18,760 LOC), 158 frontend source files (29,120 LOC), 47 migration SQL files (16,480 LOC), ~2,000 LOC scripts/docs/config — **~66,360 LOC total across all tracked source files**
- **Fresh-scan verified (2026-07-22):** ~16,031 LOC Go source + ~2,729 LOC Go test = 79 files; ~25,361 LOC .tsx + ~2,220 LOC .ts + ~1,539 LOC CSS/config = 158 frontend files; ~16,480 LOC SQL (47 migrations); ~2,000 LOC scripts/config/md = ~66,360 total

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Go 1.26, chi/v5 | HTTP server, routing, middleware |
| **Database** | PostgreSQL 15 (Supabase), pgx/v5 | Raw SQL, connection pooling (10 max) |
| **Auth** | golang-jwt/v5, bcrypt, Google Identity Services | JWT tokens, password hashing, OAuth |
| **AI** | NVIDIA NIM (DeepSeek V4 Flash) | Test case generation + admin AI assist |
| **Execution** | Docker (local) or remote sandbox (Railway) | Isolated `go test` / `python3` execution |
| **Real-time** | gorilla/websocket, in-memory pub/sub | Live XP/progress/broadcast updates |
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4 | App Router, server components, shadcn/ui |
| **Editor** | Monaco Editor (local workers) | In-browser Go & Python code editing |
| **Sandbox** | Standalone Go binary (zero deps) | Railway-hosted Go + Python execution |
| **Client Python** | Pyodide v0.27.4 (CDN) | In-browser Python playground & exercises |

---

## Repository Structure

```
koder/
├── cmd/server/main.go                        # Entry point: server bootstrap, graceful shutdown
├── internal/
│   ├── api/                                   # HTTP handlers (chi router)
│   │   ├── router.go                          # Route registration, middleware wiring, lifecycle
│   │   │                                        ~55 student routes + ~34 admin routes
│   │   ├── auth.go                            # POST /auth/register, /login, /google, /refresh
│   │   │                                        /logout, check-username, complete-onboarding, link-google
│   │   ├── me.go                              # GET /me, PUT /me/username, /language, /delete-account, /export-data
│   │   ├── change_password.go                 # POST /auth/change-password, /verify-pin, /set-pin
│   │   │                                        (pinRateLimiter: 5 attempts/15min)
│   │   ├── pin_reset.go                       # POST /auth/forgot-password-pin, /reset-password-pin
│   │   │                                        (domain-separated JWT: HMAC-SHA256(JWTSecret, "koder-pin-reset-v1"))
│   │   ├── password_reset.go                  # POST /auth/forgot-password, /reset-password (Resend API)
│   │   ├── problems.go                        # GET /problems?language=, GET /problems/:slug
│   │   │                                        (language_versions-aware, func_name empty check)
│   │   ├── submissions.go                     # POST /submit (rate-limited, scoring, language validation)
│   │   │                                        Publishes user.xp.updated + progress.updated on solve
│   │   ├── test.go                            # POST /test (no-scoring execution, ExecuteVisibleOnly)
│   │   ├── admin.go                           # Admin: ingest, enrich, enrich-all, stats, publish
│   │   │                                        AI assist, user search/verify, visibility, update
│   │   │                                        List/ Toggle problem module locks
│   │   ├── leaderboard.go                     # GET /leaderboard?period= (30s cache)
│   │   ├── profile.go                         # GET/PUT /me/profile (30s cache, stored procedure)
│   │   ├── community.go                       # GET community solutions, best-practices
│   │   │                                        POST/DELETE likes
│   │   ├── contributions.go                   # POST /user-problems (verified_contributor+)
│   │   │                                        GET /me/contributions
│   │   ├── activity.go                        # GET /me/activity?year=
│   │   ├── users.go                           # GET /users/{id} public data
│   │   ├── notifications.go                   # GET /notifications, /recent, POST read-all, read
│   │   ├── feedback.go                        # POST /feedback (10MB, Resend email notify)
│   │   │                                        GET admin/mine, PATCH status, GET problem-reports
│   │   ├── broadcasts.go                      # CRUD + dismiss for broadcast announcements
│   │   │                                        (broker events for real-time updates)
│   │   ├── cache.go                           # In-memory caches: profile, user, leaderboard (30s TTL)
│   │   ├── ws.go                              # WebSocket upgrade (gorilla, broker pub/sub)
│   │   ├── middleware.go                      # RequestLogging (crypto/rand IDs), Recovery, CORS,
│   │   │                                        SecurityHeaders (CSP nonces), Auth, AdminOnly,
│   │   │                                        VerifiedContributorOnly, RateLimit(5/45s),
│   │   │                                        IPRateLimiter(10/min), AIRateLimit(15/60s),
│   │   │                                        BodySizeLimit (loggingResponseWriter impl Hijacker)
│   │   ├── middleware_test.go                 # 23+ test functions for all middleware
│   │   ├── responses.go                       # RespondSuccess, RespondCreated, RespondError
│   │   │                                        SetAuthCookie, ClearAuthCookie
│   │   ├── responses_test.go                  # 10 test functions
│   │   └── cms.go                             # Curriculum CMS: 6 student + 22 admin endpoints
│   │                                            Courses/Modules/Lessons/Sections/Projects CRUD
│   │                                            Progress tracking, prerequisite checks
│   │                                            Public GET routes (no auth), enriched detail
│   ├── store/                                 # Database access layer (pgx/v5)
│   │   ├── store.go                           # Store interface (~125 methods) + PostgresStore struct
│   │   │                                        pgxpool: MaxConns=10, MinConns=2, 30m lifetime
│   │   │                                        QueryExecModeSimpleProtocol (PgBouncer compat)
│   │   ├── types.go                           # All data types (~40 structs, ~620 lines)
│   │   │                                        User, Problem, Submission, Progress, Feedback
│   │   │                                        Broadcast, UserProblem, AIUsageLog, RefreshToken
│   │   │                                        Course, Module, Lesson, LessonSection, Project
│   │   │                                        LanguageSpec, FlexibleBool, FlexibleStrings
│   │   │                                        QuizMetadata, CourseWithModules, LessonWithSections
│   │   ├── errors.go                          # FriendlyError (Code + Message)
│   │   │                                        IsUniqueViolation (pg 23505), constraint->message map
│   │   │                                        NewDuplicateError, NewNotFoundError, NewValidationError
│   │   ├── users.go                           # 30+ CRUD functions (1357 lines)
│   │   │                                        CreateUser (bcrypt cost=12), GetUserByLogin (3-field)
│   │   │                                        GetUserPublicData (hover cards), GetLeaderboard (period)
│   │   │                                        CalculateStreak (gaps-and-islands DENSE_RANK)
│   │   │                                        DeleteUser (cascade), GetUserExportData
│   │   │                                        CompleteUserOnboarding (atomic tx)
│   │   ├── problems.go                        # 12+ CRUD functions (777 lines)
│   │   │                                        ListVisibleProblems (LATERAL JOIN for stats)
│   │   │                                        UpsertEnrichedProblem (atomic tx)
│   │   │                                        unmarshalLanguageVersions (slog.Warn on fail)
│   │   │                                        json.RawMessage for JSONB (NOT []byte — pgx codec)
│   │   ├── submissions.go                     # CreateSubmission (90d TTL), GetProblemWithTestCases
│   │   │                                        LikeSubmission, UnlikeSubmission
│   │   │                                        GetTopCommunitySolutions, GetBestPractices
│   │   ├── progress.go                        # UpsertProgress (153 lines)
│   │   │                                        pg_advisory_xact_lock for race prevention
│   │   │                                        Stars: 3 (1st), 2 (2nd), 1 (rest); XP only on first solve
│   │   ├── admin.go                           # LogActivity, GetAdminStats, SearchUsers, ToggleUserVerified
│   │   │                                        isRelationNotExist graceful degradation
│   │   ├── testcases.go                       # GetTestCasesForProblem, GetVisibleTestCasesForProblem
│   │   ├── curriculum.go                      # ~30 CMS functions (1050+ lines)
│   │   │                                        Course/Module/Lesson/Section/Project CRUD
│   │   │                                        CreateLessonWithSections (tx: insert + bulk sections + deps)
│   │   │                                        GetLessonDependenciesByLessonIDs (bulk batch query)
│   │   │                                        Progress: UpsertCourseProgress, UpsertLessonProgress
│   │   │                                        AddUserXP (GREATEST for never-decrease)
│   │   ├── profile.go                         # GetFullProfile (stored proc), GetUserActivity
│   │   ├── feedback.go                        # CreateFeedback, GetAdminFeedback (dynamic WHERE)
│   │   │                                        GetProblemReports, CountFeedbackByStatus
│   │   ├── broadcasts.go                      # Create/Get/Deactivate/Activate/Delete/Dismiss
│   │   │                                        GetActiveBroadcasts (latest 1 only)
│   │   ├── notifications.go                   # Create, GetUnread (50), GetRecent (20)
│   │   │                                        MarkRead, MarkAll, NotifyAdmins, NotifyAllUsers
│   │   │                                        ReplaceBroadcastNotifications
│   │   ├── user_problems.go                   # Community contribution CRUD + approve/reject (358 lines)
│   │   │                                        ApproveUserProblem (5-step tx with FOR UPDATE)
│   │   │                                        generateDualLanguageSpec, pascalToSnake, goTypeToPython
│   │   ├── token_blacklist.go                  # JWT revocation (ON CONFLICT DO NOTHING)
│   │   ├── refresh_tokens.go                   # Token rotation (SHA-256 hash, revoke/revoke-all)
│   │   ├── ai_usage.go                         # LogAIUsage, GetAIUsageStats (graceful on missing table)
│   │   ├── password_reset.go                   # Create/Get/MarkUsed/Cleanup reset tokens
│   │   ├── module_locks.go                     # Problem module locks: List/Toggle/IsLocked
│   │   └── errors_test.go, types_test.go, users_test.go
│   ├── executor/                              # Code execution engine (7 files, ~2,334 lines)
│   │   ├── executor.go                        # Execute/ExecuteVisibleOnly (semaphore=6)
│   │   │                                        formatGoLiteral (recursive, primitives/slices/maps)
│   │   │                                        formatPythonLiteral (null→None, bool→True/False)
│   │   │                                        executePython (resolve func name, templates)
│   │   │                                        resolveProblemLanguageMeta (LanguageVersions lookup)
│   │   │                                        goToSnakeCase (camelCase→snake_case, idempotent)
│   │   │                                        EnhancePythonError (tips for NameError/TypeError/SyntaxError)
│   │   │                                        isPythonErrorLine, extractPyErrorContext
│   │   ├── parser.go                          # ParseTestOutput — state machine for GOT/WANT
│   │   │                                        5 regex patterns, multi-line buffer accumulation
│   │   ├── sandbox.go                         # PrepareSandbox — temp dir, go.mod, solution.go, main_test.go
│   │   │                                        package regex: force package koder
│   │   ├── sandbox_client.go                  # HTTP client for remote Railway sandbox
│   │   │                                        3 attempts, exponential backoff (2^attempt*500ms)
│   │   │                                        FormatFriendlySandboxError (user-friendly messages)
│   │   ├── templates.go                       # mainTestTemplate (Go: reflect.DeepEqual for non-primitives)
│   │   │                                        pythonTestTemplate (Python: json.loads(expected) == result)
│   │   ├── types.go                           # ExecutionRequest, ExecutionResult, TestResult
│   │   └── executor_test.go                   # 14 test functions (533 lines)
│   ├── enricher/                              # AI test generation (2 files, ~1167 lines)
│   │   ├── enricher.go                        # EnrichProblem, AIAssistProblem
│   │   │                                        NVIDIA NIM provider: HTTP POST, 120s timeout
│   │   │                                        Retry: 3 attempts, backoff 2/4/8s on 429/503
│   │   │                                        Rate limit: 1s between requests (mutex)
│   │   │                                        cleanResponse (markdown fence stripping)
│   │   │                                        normalizeTestCaseInput (string/object/array)
│   │   │                                        validateEnrichedProblem (14 checks)
│   │   │                                        toSnakeCase, toPythonType (comprehensive mapping)
│   │   │                                        8 AIAssistAction types for targeted AI editing
│   │   └── enricher_test.go                    # 4 test functions (231 lines)
│   ├── broker/                                # In-memory pub/sub (2 files, ~254 lines)
│   │   ├── broker.go                          # Subscribe (UUID, cap 32), Publish (non-blocking)
│   │   │                                        Unsubscribe, PublishEvent
│   │   └── broker_test.go                     # 10 test functions
│   ├── parser/                                # GitHub YAML curriculum parser (2 files, ~717 lines)
│   │   ├── parser.go                          # IngestGitHubRepo (git clone --depth 1)
│   │   │                                        Sparse checkout for subpath URLs
│   │   │                                        SHA-256 idempotency, URL parsing (HTTPS+SSH)
│   │   │                                        isReadmeFile, detectProblemType, computeSourceHash
│   │   │                                        normalizeSlug, normalizeModule, cleanRepoURL
│   │   └── parser_test.go                     # 13 test functions (346 lines)
│   ├── auth/                                  # Auth primitives (5 files, ~684 lines)
│   │   ├── jwt.go                             # SignToken (HS256), VerifyToken, GenerateRefreshToken
│   │   │                                        SHA256Hash, strict parameter validation
│   │   ├── oauth.go                           # VerifyGoogleToken (JWKS, 1h cache)
│   │   │                                        jwksKeyToPublicKey (RSA round-trip)
│   │   │                                        isExpectedAudience, isExpectedIssuer
│   │   ├── password.go                        # HashPassword (bcrypt cost=12), ComparePassword
│   │   ├── auth_test.go                       # 15 test functions
│   │   └── oauth_test.go                      # 5 test functions
│   └── config/config.go                       # Env loading, fails-fast validation
│                                            .env file support, defaults for 30+ vars
├── frontend/                                  # Next.js 15 App Router
│   ├── app/
│   │   ├── layout.tsx                         # Root: fonts (Inter, Fira Code), UserProvider, Toast
│   │   ├── page.tsx                           # Loading guard (checking state) → /landing or /home
│   │   ├── not-found.tsx                      # Custom 404 with Terminal icon + actions
│   │   ├── global-error.tsx                   # Root error boundary
│   │   ├── globals.css                        # Tailwind CSS 4 + theme variables
│   │   ├── landing/page.tsx                   # Marketing landing page
│   │   ├── oauth/callback/page.tsx            # OAuth callback → /home
│   │   ├── (auth)/                            # Unauthenticated routes
│   │   │   ├── layout.tsx                     # Centered card layout
│   │   │   ├── login/page.tsx                 # Google-first + email form
│   │   │   ├── register/page.tsx              # Google-first + registration form
│   │   │   ├── forgot-password/page.tsx       # PIN-based flow
│   │   │   ├── reset-password/page.tsx        # Token-based reset
│   │   │   └── onboarding/page.tsx            # Username/student_id/language setup
│   │   ├── (main)/                            # Authenticated routes
│   │   │   ├── layout.tsx                     # TopNav + BroadcastBanner + FeedbackButton
│   │   │   ├── error.tsx                      # Main error boundary
│   │   │   ├── home/page.tsx                  # Dashboard: problem grid, language filter, pagination
│   │   │   ├── home/loading.tsx               # Skeleton grid
│   │   │   ├── home/error.tsx                 # Dashboard error boundary
│   │   │   ├── problems/                      # Problems listing page
│   │   │   │   ├── page.tsx                   # /problems: search, lang filter, solved filter, difficulty/XP sliders
│   │   │   │   └── layout.tsx                 # With TopNav + FeedbackButton
│   │   │   ├── leaderboard/
│   │   │   │   ├── page.tsx                   # Server component
│   │   │   │   ├── LeaderboardClient.tsx      # Period filter, podium, custom Avatar
│   │   │   │   ├── loading.tsx                # Skeleton
│   │   │   │   └── error.tsx                  # Error boundary
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx                   # Server component
│   │   │   │   ├── ProfileClient.tsx          # Tabs: stats, activity, achievements, contributions
│   │   │   │   ├── loading.tsx, error.tsx
│   │   │   │   └── components/               # ProfileHeader, StatsOverview, ProgressMetrics
│   │   │   │       Achievements, RecentActivity, ActivityFeed, ContributionGraphSection, MyContributions
│   │   │   ├── settings/page.tsx              # Profile/Security/Notifications tabs
│   │   │   ├── settings/error.tsx
│   │   │   ├── contribute/page.tsx            # Community problem submission
│   │   │   ├── contribute/error.tsx
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx                   # Dashboard: stats + tabs
│   │   │   │   ├── FeedbackPanel.tsx          # Status filters, inline resolve
│   │   │   │   ├── BroadcastPanel.tsx         # Create/edit, toggle switches
│   │   │   │   ├── PendingContributions.tsx   # Approval/rejection queue
│   │   │   │   ├── ProblemEditPanel.tsx       # Full problem editor + preview
│   │   │   │   ├── ProblemReports.tsx         # Grouped/flat, search, resolved filter
│   │   │   │   ├── UserVerificationPanel.tsx  # Search users, toggle verified (300ms debounce)
│   │   │   │   ├── AIAssistantPanel.tsx       # AI chat with 8 action types
│   │   │   │   ├── error.tsx
│   │   │   │   └── curriculum/page.tsx        # 3-panel CMS: course/module/lesson editor
│   │   │   └── learn/                         # Curriculum CMS (student view)
│   │   │       ├── layout.tsx                 # Minimal wrapper (eagerLoadPyodide)
│   │   │       ├── loading.tsx                # Skeleton course catalog grid
│   │   │       ├── error.tsx                  # Error boundary with retry button
│   │   │       ├── courses/
│   │   │       │   ├── page.tsx               # Course catalog grid (LearningCard, branded gradients)
│   │   │       │   ├── loading.tsx            # Skeleton card grid with pulse placeholders
│   │   │       │   ├── error.tsx              # Error boundary with retry
│   │   │       │   └── [courseSlug]/
│   │   │       │       ├── page.tsx           # Hero + progress bar + module cards with status badges
│   │   │       │       ├── loading.tsx        # Skeleton hero + module outlines
│   │   │       │       ├── error.tsx          # Error boundary with retry
│   │   │       │       └── modules/
│   │   │       │           └── [moduleSlug]/
│   │   │       │               ├── page.tsx   # Gradient header + stats bar + lesson cards
│   │   │       │               ├── loading.tsx # Skeleton header + 5 lesson outlines
│   │   │       │               ├── error.tsx  # Error boundary with retry
│   │   │       │               └── lessons/
│   │   │       │                   └── [lessonSlug]/
│   │   │       │                       ├── page.tsx   # Server shell → LessonViewerClient
│   │   │       │                       ├── loading.tsx # Skeleton sidebar + progress bar
│   │   │       │                       ├── error.tsx   # Error boundary with retry
│   │   │       │                       ├── LessonViewerClient.tsx # Step-by-step, quiz review, keyboard nav
│   │   │       │                       └── success/page.tsx # Confetti, "What You Covered", next lesson
│   │   ├── problems/[slug]/                   # Problem workspace
│   │   │   ├── page.tsx                       # Server component
│   │   │   ├── DynamicWorkspace.tsx           # next/dynamic wrapper
│   │   │   ├── ProblemWorkspaceClient.tsx     # Monaco editor, submit/test, language toggle
│   │   │   │                                    Per-language localStorage, Console toggle, confetti
│   │   │   ├── error.tsx                      # Workspace error boundary
│   │   │   └── success/page.tsx               # Post-submission success screen
│   │   └── (legal)/
│   │       ├── layout.tsx                     # Legal pages layout
│   │       ├── privacy/page.tsx               # Privacy policy
│   │       └── terms/page.tsx                 # Terms of service
│   ├── components/
│   │   ├── layout/TopNav.tsx                  # Logo, Dashboard/Problems/Learn links, notif bell
│   │   │                                        Avatar menu, verified badge, settings, logout
│   │   ├── BroadcastBanner.tsx                # Color-coded, 30s polling, per-user dismiss
│   │   ├── FeedbackButton.tsx                 # Floating FAB, 3 tabs, screenshot upload, priority selector
│   │   ├── FeedbackButtonWrapper.tsx           # Route-conditionally renders FeedbackButton (new)
│   │   ├── GoogleLinkBanner.tsx               # Amber banner to link Google
│   │   ├── LandingContent.tsx                 # Landing page content
│   │   ├── LanguageLogo.tsx                   # Go/Python SVG icon renderer
│   │   ├── LanguageSelector.tsx               # Full-screen Go/Python onboarding picker
│   │   ├── TestResultPanel.tsx                # LCS unified diff, green/red line highlighting
│   │   ├── PyodideConsole.tsx                 # Terminal-style console, Fira Code, colored output
│   │   ├── ResizableSplitPane.tsx             # Drag-resizable horizontal split with grip handle
│   │   ├── MultiFileEditor.tsx                # Multi-file tabbed editor for exercises
│   │   ├── multi-step-loader-demo.tsx
│   │   ├── application/code-snippet/          # Professional Shiki code block, collapsed/expand, multi-file, copy
│   │   ├── icons/                             # (reserved directory)
│   │   ├── PyodidePreloader.tsx               # Eager CDN Pyodide load on page mount
│   │   ├── auth/                              # google-button, bottom-gradient, label-input-container
│   │   │                                        auth-divider, index.ts (re-exports)
│   │   ├── base/avatar/avatar.tsx             # src/initials fallback, sizes sm/md/lg/xl/podium
│   │   │                                        Verified gold badge (SVG circle + checkmark)
│   │   ├── base/input/pin-input.tsx           # OTP PIN input with mask
│   │   ├── dashboard/ModuleCards.tsx          # Image grid, skeleton, WebP, locked module padlock overlay
│   │   ├── kibo-ui/
│   │   │   ├── code-block/index.tsx           # Shiki syntax highlighting (dark mode fix)
│   │   │   ├── code-block/server.tsx          # Server-side rendering
│   │   │   └── contribution-graph/index.tsx   # GitHub-style heatmap
│   │   ├── profile/ProfileHoverCard.tsx       # XP bar, stats, verified badge
│   │   ├── landing/                           # Hero, Features, Stats, HowItWorks, Testimonials, Footer
│   │   ├── learn/                             # Curriculum CMS components
│   │   │   ├── SectionRenderer.tsx            # Routes section_type → sub-renderer
│   │   │   ├── SectionQuiz.tsx                # Inline quiz from metadata JSONB
│   │   │   ├── SectionExercise.tsx            # Monaco Editor + POST /test (60/40 split)
│   │   │   │                                    Multi-file support, Run in Browser + Ctrl+Enter
│   │   │   └── LessonSidebar.tsx              # Progress + sections + prereqs (locked state)
│   │   │   ├── admin/curriculum/
│   │   │   │   ├── MarkdownPreview.tsx        # Live GFM preview with custom callout blocks
│   │   │   │   ├── ProblemBank.tsx            # Searchable problem selector for lesson attachments
│   │   │   │   ├── AdminCards.tsx             # AdminCourseCard, AdminModuleCard, AdminLessonCard,
│   │   │   │   │                                AdminProjectCard — CodePen shadow back plates, 16:9
│   │   │   │   └── MultiFileConfigPanel.tsx   # Visual multi-file editor for exercise/assessment/mini_project
│   │   └── ui/                                # 15+ shadcn/ui components
│   │       avatar, badge, button, card, dialog, dropdown-menu, input, input-otp
│   │       label, progress, select, tabs, textarea, tooltip, activity-gauge
│   │       hover-card, multi-step-loader, learning-card, rating-badge
│   ├── hooks/
│   │   ├── use-google-one-tap.ts              # GIS singleton (init once, prompt + renderButton)
│   │   ├── use-has-mounted.ts                 # SSR-safe mount detection
│   │   ├── use-mobile.ts                      # Mobile viewport detection
│   │   └── usePyodide.ts                      # Pyodide state hook: ready, execute, consoleLines
│   ├── lib/
│   │   ├── api.ts                             # fetchApi wrapper, 60+ endpoint functions
│   │   │                                        tryRefreshToken (singleton queue, 401 interceptor)
│   │   ├── types.ts                           # 40+ TypeScript interfaces matching backend
│   │   ├── utils.ts                           # cn(), getUserColor(), format helpers
│   │   ├── cache.ts                           # sessionStorage with 30s TTL
│   │   ├── monaco-setup.ts                    # loader.init() singleton for Monaco workers
│   │   ├── monaco-theme.ts                    # VS Code Dark+ theme registration
│   │   ├── event.ts                           # useWebSocket (auto-reconnect, exponential backoff)
│   │   │                                        5 event types: user.xp.updated, progress.updated,
│   │   │                                        lesson.completed, admin.broadcast.*, admin.feedback.*
│   │   ├── achievements.ts                    # Achievement definitions
│   │   ├── UserContext.tsx                     # Auth state + fetchUser + WebSocket XP refresh
│   │   ├── useNotifications.ts                # 5s polling, cache invalidation on markRead
│   │   ├── pyodide.ts                         # CDN Pyodide singleton + executePython() + multi-file exec
│   │   │                                        FS.writeFile, FS.readFile, FS.mkdir, executeMultiFile
│   │   ├── toast.tsx                          # Sonner toast setup
│   │   └── index.ts                           # Re-exports
│   ├── styles/                                # globals.css, theme.css (856 vars), typography.css (430 lines)
│   ├── scripts/copy-monaco.mjs                # Copy Monaco workers to public/vs/
│   ├── public/                                # logo.png, modules/*.webp (13), vs/ (Monaco workers)
│   ├── middleware.ts                          # CSP headers (nonce, worker-src blob:)
│   ├── next.config.ts                         # With strict CSP via headers()
│   ├── tailwind.config.ts, tsconfig.json, postcss.config.mjs
│   ├── components.json                        # shadcn/ui config
│   └── package.json                           # Dependencies: Next 15, React 19, Monaco, shadcn, Pyodide
├── sandbox/                                   # Standalone Go binary (zero deps, ~1211 LOC)
│   ├── main.go                                # HTTP server: /health, /version, /execute
│   │                                            Dispatches by language (python→pyrunner, fallback→Go)
│   │                                            compileErrorMessage (3-pass: Go errors, Python traceback, fallback)
│   │                                            classifyOutput (4 regex patterns)
│   ├── ratelimit.go                           # Per-IP sliding window, 10 req/min, 5min cleanup
│   ├── secure.go                              # 14 Go dangerous patterns, 17 Python patterns
│   │                                            validateCode (Go), validatePythonCode
│   ├── secure_unix.go                         # Setpgid isolate, resourceLimits: NPROC=6, NOFILE=1024, FSIZE=64MB
│   │                                            killProcessGroup (SIGKILL to -PID), reapProcess
│   ├── secure_other.go                        # No-op stubs for non-Unix
│   ├── runtest_go.go                          # Go runner: go.mod, solution.go, main_test.go, go test -v
│   │                                            forcePackageKoder, GOPROXY=off, GOTOOLCHAIN=local
│   ├── pyrunner.go                            # Python runner: 2-layer security (regex + AST)
│   │                                            findPythonBin (python3→python fallback)
│   │                                            cappedBuffer (64KB output cap)
│   │                                            validatePythonAST (ast.parse subprocess, 10s timeout)
│   ├── security_message_test.go               # 3 test cases
│   ├── Dockerfile                             # 2-stage ARM64 build, includes python3
│   └── go.mod                                 # Zero external deps
├── migrations/                                # 46 migration files (44 numbered + 1 test seed + 045 module locks)
│   ├── 001_init.sql                           # Core schema: users, problems, test_cases, submissions, progress
│   ├── 002_indexes.sql                        # 12 initial indexes
│   ├── 003_activity_logs.sql                  # activity_logs table
│   ├── 005_community_contributions.sql        # user_problems, verified flag, author_id
│   ├── 006_notifications.sql                  # notifications table
│   ├── 007_submission_likes.sql               # submission_likes (UNIQUE pair)
│   ├── 008_user_profile.sql                   # bio on users
│   ├── 009_get_full_profile.sql               # Stored proc: full profile + activity heatmap
│   ├── 010_add_gitea_auth.sql                 # [OBSOLETE] Gitea OAuth fields
│   ├── 011_add_gitea_token.sql                # [OBSOLETE] Gitea PAT storage
│   ├── 012_add_google_auth.sql                # Google OAuth + username/email columns
│   ├── 013_fix_rank_tiebreaker.sql            # Rank: xp DESC, solved_count DESC, id ASC
│   ├── 014_feedback.sql                       # feedback table (type/priority/status CHECK)
│   ├── 015_broadcasts.sql                     # broadcasts + user_broadcast_status
│   ├── 016_add_streak_index.sql               # submissions(user_id, status, created_at)
│   ├── 017_optimization_indexes.sql           # 16 composite indexes
│   ├── 019_seed_problems1.sql                 # 45 problems: math-recursion, arrays-strings, data-structures
│   ├── 019_seed_problems2.sql                 # 45 problems: bit-manipulation, sorting-searching, pointers
│   ├── 019_seed_problems3.sql                 # 45 problems: error-handling, interfaces-generics
│   ├── 019_seed_problems4.sql                 # 60 problems: hashmaps-sets, linked-lists, trees-graphs, DP
│   ├── 020_token_blacklist.sql                # JWT blacklist (jti PK)
│   ├── 021_password_reset.sql                 # password_reset_tokens
│   ├── 022_add_pin_hash.sql                   # pin_hash on users
│   ├── 023_split_problem_fields.sql           # constraints + learning_objective
│   ├── 024_add_username_set.sql               # username_set flag
│   ├── 025_report_issue_fields.sql            # problem_slug, code_snippet, error_message on feedback
│   ├── 026_output_logs_ttl.sql                # output_logs_expires_at (90d)
│   ├── 027_language_versions.sql              # language_versions JSONB + primary_language
│   ├── 028_backfill_language_versions.sql     # PL/pgSQL: koder_to_snake_case, koder_go_type_to_python
│   ├── 029_ensure_language_versions.sql       # Guarantees Go+Python entries for ALL problems
│   ├── 031_python_intermediate_seed.sql       # 10 Python intermediate problems
│   ├── 032_python_variables_math_seed.sql     # 1 Python variables & math problem
│   ├── 033_add_user_problems_language_versions.sql  # language_versions on user_problems
│   ├── 034_python_arrays_strings_seed.sql     # 7 Python arrays & strings problems
│   ├── 035_ai_usage_logs.sql                  # ai_usage_logs table
│   ├── 036_refresh_tokens.sql                 # refresh_tokens table
│   ├── 037_seed_go_fundamentals.sql           # 5 Go fundamentals problems
│   ├── 038_curriculum_cms.sql                 # 8 tables: courses, modules, lessons, sections, deps, projects, progress
│   ├── 039_seed_curriculum.sql                # Initial curriculum structure seeding
│   ├── 040_complete_curriculum_content.sql    # Comprehensive curriculum content seeding
│   ├── 041_seed_python_mastery.sql            # Python Mastery: Zero to Hero course (4 modules, 14 lessons)
│   ├── 042_seed_python_mastery_games.sql      # Python Mastery: Build Your Own Games (2 modules, 6 lessons)
│   ├── 043_seed_python_mastery_practice.sql   # Python Mastery: Practice & Review (1 module, 5 lessons)
│   ├── 044_add_module_locked.sql              # locked BOOLEAN on modules table (curriculum module gating)
│   ├── 045_add_module_locks.sql               # module_locks table for problem category locking
│   └── 999_seed_python_test.sql               # Python pipeline test seed (py-double-it)
├── scripts/
│   ├── reset_data.sql                         # Safe DELETE-order data reset (11 tables)
│   ├── wipe_all_except_admin.sql              # Wipe all users & data except admin
│   ├── setup-docker-cache.sh                  # Go build cache pre-warm
│   └── transform-seeds.mjs                    # Seed transformation (statement splitting)
├── go.mod, go.sum                             # Go module definition (github.com/jerryjuche/koder)
├── Procfile                                   # Render: web: ./koder
├── build.sh                                   # Cross-compile backend + sandbox
├── .env.example                               # 20 documented env vars
├── .github/workflows/ci.yml                   # 4-job CI (backend, frontend, deploy-backend, deploy-sandbox)
├── .github/copilot-instructions.md            # AI coding standards [PARTIALLY OUTDATED — see Known Issues]
├── BRAIN.md                                   # Agent session protocol
├── PLAN.md                                    # Curriculum CMS plan (all phases complete)
├── implementation.md                          # CMS implementation plan (all done)
├── SCHEMA_CURRICULUM.md                       # Curriculum schema + API reference
├── docs/curriculum-schema-for-ai.md           # AI seed data guide
├── docs/learn-ui-redesign-prompt.md           # Professional learn UI design system & component spec
├── pyint.md                                   # Pyodide client-side Python playground plan
├── CODEBASE_INDEX.md                          # Line-level file inventory
├── CODEBASE_ANALYSIS.md                       # Architectural analysis
├── SESSION_LOG.md                             # 57+ session log (June 28 - July 22)
├── progress.md                                # Curriculum CMS progress tracker
└── CLAUDE.md                                  # This file — professional codebase index
```

---

## Architecture

### Request Lifecycle

```
Client → chi Router → Middleware Stack → Handler → Store → PostgreSQL
                                                 → Executor → Docker/Sandbox
                                                 → Enricher → NVIDIA NIM
                                                 → Broker → WebSocket clients
```

### Middleware Chain (in order)

| Middleware | Source | Purpose |
|---|---|---|
| `RequestLoggingMiddleware` | `middleware.go:38` | Logs method/path/status/duration/correlation ID (8-byte crypto/rand hex) |
| `RecoveryMiddleware` | `middleware.go:446` | Catches panics → JSON 500 |
| `CORSMiddleware` | `middleware.go:217` | Wildcard/specific/multi-origin, OPTIONS 200, null origin support |
| `SecurityHeadersMiddleware` | `middleware.go:467` | CSP (nonce per-request), XFO DENY, XCTO nosniff, HSTS, Referrer-Policy |
| `BodySizeLimitMiddleware` | `middleware.go:433` | Per-route body size limits (256KB–10MB) |
| `AuthMiddleware` | `middleware.go:256` | JWT validation from Bearer header or koder_token cookie; checks blacklist |
| `AdminOnly` | `middleware.go:305` | Role check: admin required |
| `VerifiedContributorOnly` | `middleware.go:317` | Role check: verified_contributor+ |
| `RateLimitMiddleware` | `middleware.go:161` | Per-user sliding window (5 req/45s), admin bypass |
| `IPRateLimiter` | `middleware.go:406` | Per-IP auth endpoint limiter (10 req/min) |
| `AIRateLimitMiddleware` | `middleware.go:192` | Per-admin AI assist limiter (15 req/60s, NO bypass) |

---

## Core Pipelines

### 1. Ingest Pipeline (`admin.go` → `parser.go` → `store.go`)
```
POST /admin/ingest { repo_url }
  → Fetch GitHub YAML curriculum (sparse checkout if subpath)
  → Parse YAML into Problem structs
  → SHA256 hash for idempotency check
  → Upsert into `problems` table (visible=false, draft)
  → Log activity
```

### 2. Enrich Pipeline (`enricher.go` → NVIDIA NIM)
```
POST /admin/enrich (single) | POST /admin/enrich-all (batch)
  → Fetch problems needing enrichment (source_hash mismatch)
  → Send raw README to AI with structured system prompt (no response_format)
  → Parse ResponseSchema JSON output
  → Validate: title, func_name, 3 hints, 5+ test cases, language_versions (Go + Python)
  → Auto-generate Python entry via toSnakeCase()/toPythonType() if AI omits it
  → Upsert enriched problem + test cases in single transaction
  → Cache result via source_hash
```

### 3. Execute Pipeline (`executor.go` → Docker/Sandbox)
```
POST /submit (scoring) | POST /test (no-score)
  → Acquire semaphore slot (max 6 concurrent)
  → Fetch problem + test cases from DB
  → Resolve language-specific metadata from LanguageVersions
  → Route to language-specific executor (Go or Python):

  Go path:
  → Format test case inputs as Go literals (formatGoLiteral — recursive)
  → Generate main_test.go via text/template
  → Write solution.go (force package koder) + main_test.go to temp dir

  Python path:
  → Format test case inputs as Python literals (formatPythonLiteral — null→None)
  → Generate run_tests.py via pythonTestTemplate
  → Write solution.py + run_tests.py to temp dir

  → Execute:
      PRIMARY: HTTP POST to remote sandbox (3 retries, exponential backoff)
      FALLBACK: docker run (--network=none --memory=256m --cpus=1.0)
  → Parse Go-compatible test output (GOT/WANT regex state machine)
  → Classify: passed/failed/compiler_error/timeout
  → Record submission + update progress in DB (advisory lock for race prevention)
  → Publish WebSocket events: user.xp.updated, progress.updated
  → Return ExecutionResult with per-test-case diff
```

---

## Database Schema (47 migration files: 46 numbered + 1 test seed)

### Core Tables (`001_init.sql` + incremental)

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | Accounts & auth | id, username, email, password, role, xp, pin_hash, google_id, username_set, color_index, verified, primary_language |
| `problems` | Exercise definitions | id, slug, module, title, statement, func_name, return_type, param_types, hints, difficulty, xp_reward, tags, visible, source_hash, constraints, learning_objective, language_versions (JSONB) |
| `test_cases` | AI-generated test data | id, problem_id, input (JSONB), expected, is_hidden, ordinal |
| `submissions` | Student solution attempts | id, user_id, problem_id, code, status, passed_count, total_count, output_logs, runtime_ms, output_logs_expires_at |
| `progress` | Per-user problem state | user_id + problem_id (PK), solved, stars, attempts, best_runtime, xp_awarded |

### Secondary Tables

| Table | Purpose | Key Feature |
|---|---|---|
| `activity_logs` | Admin audit trail | type, message, color, icon |
| `user_problems` | Community contributions | status (pending/approved/rejected), language_versions JSONB |
| `notifications` | User alerts | is_read, related_id, 50-count unread limit |
| `submission_likes` | Community solution likes | UNIQUE(submission_id, user_id) |
| `feedback` | Bug reports & feature requests | type CHECK, priority CHECK, status CHECK, screenshot_url, problem_slug |
| `broadcasts` | System announcements | active, priority, action_label/action_url, type CHECK |
| `user_broadcast_status` | Per-user dismissal | PK(user_id, broadcast_id) |
| `token_blacklist` | JWT revocation | jti PK, ON CONFLICT DO NOTHING |
| `password_reset_tokens` | Email password reset | token_hash PK, used flag, 1h expiry |
| `refresh_tokens` | Token rotation | token_hash UNIQUE, revoked, cleanup |
| `ai_usage_logs` | AI usage monitoring | user_id, action, tokens, success, response_time_ms |

### Curriculum CMS Tables (`038_curriculum_cms.sql`)

| Table | Purpose | Key Columns |
|---|---|---|
| `courses` | Top-level curriculum | slug UNIQUE, difficulty_level (1-5), visible=false default |
| `modules` | Course chapters | UNIQUE(course_id, slug), visible=false default |
| `lessons` | Individual lessons | UNIQUE(module_id, slug), visible=false, problem_references TEXT[] |
| `lesson_dependencies` | Prerequisite DAG | PK(lesson_id, depends_on_lesson_id), CHECK no self-ref |
| `lesson_sections` | Typed content blocks | section_type ENUM (11 types), metadata JSONB, order_number |
| `projects` | Hands-on coding | UNIQUE(lesson_id, slug), difficulty (1-5), hints TEXT[], visible=false |
| `course_progress` | User course progress | PK(user_id, course_id), progress_pct REAL (0-100) |
| `lesson_progress` | User lesson completion | PK(user_id, lesson_id), completed, xp_awarded |

### Seed Data Summary

| Migration | Problems | Module |
|---|---|---|
| `019_seed_problems1` | 45 | math-recursion, arrays-strings, data-structures |
| `019_seed_problems2` | 45 | bit-manipulation, sorting-searching, pointers |
| `019_seed_problems3` | 30 | error-handling, interfaces-generics |
| `019_seed_problems4` | 60 | hashmaps-sets, linked-lists, trees-graphs, DP |
| `031_python_intermediate` | 10 | python-intermediate |
| `032_python_variables_math` | 1 | python-variables-math |
| `034_python_arrays_strings` | 7 | python-arrays-strings |
| `037_seed_go_fundamentals` | 5 | go-fundamentals |
| `041_seed_python_mastery` | 14 | python-mastery |
| `042_seed_python_mastery_games` | 6 | python-mastery-games |
| `043_seed_python_mastery_practice` | 5 | python-mastery-practice |
| **Total seed problems** | **~228** | |

### Storage Rules
- 500MB hard limit: no JSONB bloat, normalized schema
- All SELECT queries have LIMIT (100-200 per table)
- Composite indexes for all query patterns (migrations 002 + 017 + 038)
- See `scripts/reset_data.sql` for safe delete order (11 tables)

---

## API Endpoints (~89 total)

### Auth (IP rate-limited: 10 req/min, body size: 256KB)
| Method | Path | Handler | Description |
|---|---|---|---|
| POST | /auth/register | `auth.go:Register` | Create account (name, email, password, PIN); returns JWT + refresh_token with onboarding=true |
| POST | /auth/login | `auth.go:Login` | JWT token (accepts username/email/student_id) |
| POST | /auth/google | `auth.go:GoogleAuth` | Google Sign-In with ID token; auto-creates or links |
| POST | /auth/complete-onboarding | `auth.go:CompleteOnboarding` | Set username + student_id post-registration |
| POST | /auth/complete-google | (alias) | Delegates to CompleteOnboarding |
| POST | /auth/link-google | `auth.go:LinkGoogle` | Link Google to existing authenticated user |
| POST | /auth/forgot-password | `password_reset.go:ForgotPassword` | Email-based reset (Resend API); always returns success |
| POST | /auth/reset-password | `password_reset.go:ResetPassword` | Complete email reset with token (SHA-256, 1h expiry) |
| POST | /auth/forgot-password-pin | `pin_reset.go:ForgotPasswordPin` | PIN-based: email + PIN → short-lived JWT (5 min) |
| POST | /auth/reset-password-pin | `pin_reset.go:ResetPasswordPin` | PIN-based: JWT + new password |
| POST | /auth/change-password | `change_password.go:ChangePassword` | Authenticated: verify PIN + set new password |
| POST | /auth/verify-pin | `change_password.go:VerifyPin` | Verify current PIN (rate-limited: 5/15min) |
| POST | /auth/set-pin | `change_password.go:SetPin` | Set initial PIN |
| POST | /auth/refresh | `auth.go:RefreshToken` | Rotate refresh token; reuse detection revokes ALL sessions |
| POST | /auth/logout | `auth.go:Logout` | Revoke JWT + all refresh tokens |
| GET | /auth/check-username | `auth.go:CheckUsername` | Username availability (public) |

### User (authenticated)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /me | `me.go:GetMe` | Current user with stats, cached (30s), level = xp/1000 + 1 |
| PUT | /me/username | `me.go:SetUsername` | One-time username set (403 if already set) |
| PUT | /me/language | `me.go:UpdateLanguage` | Set primary language preference |
| POST | /me/delete-account | `me.go:DeleteAccount` | Transactional cascade delete (revokes refresh tokens first) |
| GET | /me/profile | `profile.go:GetProfile` | Full profile (stored proc), cached (30s) |
| PUT | /me/profile | `profile.go:UpdateProfile` | Update name and bio |
| GET | /me/activity | `activity.go:GetActivity` | Contribution graph data by year |
| GET | /me/contributions | `contributions.go:GetMyContributions` | User's submitted problems |
| GET | /me/export-data | `me.go:ExportData` | Full account data export (JSON attachment) |

### Problems (authenticated, body: 10MB for submit/test)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /problems | `problems.go:ListVisibleProblems` | All visible problems with solved status, LATERAL JOIN; ?language= filter |
| GET | /problems/:slug | `problems.go:GetProblemBySlug` | Problem details + test case examples + user progress |
| POST | /submit | `submissions.go:Submit` | Submit code for scoring (rate-limited: 5/45s); blocks if already solved; publishes WS events |
| POST | /test | `test.go:Test` | Test code without scoring or progress update |

### Community (authenticated)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /problems/:slug/community-solutions | `community.go:GetCommunitySolutions` | Top solutions (default 3, ?limit=N) |
| GET | /best-practices | `community.go:GetBestPractices` | Best practice solutions across all problems (default 20) |
| POST | /submissions/:id/like | `community.go:LikeSubmission` | Like a solution (ON CONFLICT DO NOTHING) |
| DELETE | /submissions/:id/like | `community.go:UnlikeSubmission` | Unlike a solution |

### Contributions (verified_contributor+)
| Method | Path | Handler | Description |
|---|---|---|---|
| POST | /user-problems | `contributions.go:PostContribution` | Submit a community problem (body: 5MB) |

### Notifications (authenticated)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /notifications | `notifications.go:GetUnreadNotifications` | Unread notifications count + list (max 50) |
| GET | /notifications/recent | `notifications.go:GetRecentNotifications` | Last 20 notifications (read + unread) |
| POST | /notifications/read-all | `notifications.go:MarkAllAsRead` | Mark all as read |
| POST | /notifications/:id/read | `notifications.go:MarkAsRead` | Mark single as read |

### Broadcasts (authenticated)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /me/broadcasts | `broadcasts.go:ListActive` | Active non-dismissed broadcasts (latest 1) |
| POST | /me/broadcasts/:id/dismiss | `broadcasts.go:Dismiss` | Dismiss broadcast for current user |

### Feedback (authenticated, body: 10MB)
| Method | Path | Handler | Description |
|---|---|---|---|
| POST | /feedback | `feedback.go:Submit` | Submit feedback/bug report; notifies admins (email + in-app) |
| GET | /feedback/mine | `feedback.go:ListMine` | User's own submissions |

### Users (public)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /users/{id} | `users.go:GetUserPublicData` | Public user data for hover cards |

### Curriculum CMS (public routes — no auth)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /learn/courses | `cms.go:ListPublishedCourses` | Only visible courses |
| GET | /learn/courses/{courseSlug} | `cms.go:GetCourseDetail` | Course with modules + per-module lesson count/progress |
| GET | /learn/courses/{courseSlug}/modules/{moduleSlug} | `cms.go:GetModuleDetail` | Module with lessons + completion (auth optional) |
| GET | /learn/courses/.../modules/.../lessons/{lessonSlug} | `cms.go:GetLessonDetail` | Full lesson with sections, deps, projects, prereq check |

### Curriculum CMS (authenticated, student)
| Method | Path | Handler | Description |
|---|---|---|---|
| POST | /learn/lessons/{lessonId}/complete | `cms.go:CompleteLesson` | Mark complete + award XP; 403 if prereqs not met; publishes WS events |
| GET | /learn/progress | `cms.go:GetAllProgress` | All courses with progress |

### Leaderboard (authenticated)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /leaderboard | `leaderboard.go:GetLeaderboard` | Top 100 by XP; ?period=all\|weekly\|monthly (30s cache) |

### WebSocket (authenticated)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /ws | `ws.go:ServeHTTP` | WebSocket upgrade; gorilla/websocket with broker pub/sub |

### Admin (admin-only)

| Method | Path | Handler | Description |
|---|---|---|---|
| POST | /admin/ingest | `admin.go:Ingest` | GitHub YAML ingest (SHA256 dedup) |
| POST | /admin/enrich | `admin.go:Enrich` | Single problem AI enrichment |
| POST | /admin/enrich-all | `admin.go:EnrichAll` | Batch enrich all pending; continues on per-problem failure |
| POST | /admin/ai/assist | `admin.go:AIAssist` | AI admin assistant (15 req/60s); logs usage on success + failure |
| GET | /admin/ai/usage | `admin.go:GetAIUsage` | AI usage statistics |
| GET | /admin/stats | `admin.go:GetAdminStats` | Dashboard stats (includes AI call counts) |
| GET | /admin/activity | `admin.go:GetAdminActivity` | Recent activity log (50) |
| GET | /admin/problems | `admin.go:ListAllProblems` | All problems including invisible |
| PATCH | /admin/problems/{id}/visibility | `admin.go:ToggleVisibility` | Toggle visibility (publishes broker event) |
| PUT | /admin/problems/{id} | `admin.go:UpdateProblem` | Partial update (16 fields, merge semantics) |
| POST | /admin/problems/publish-all | `admin.go:PublishAllDrafts` | Single UPDATE all invisible → visible |
| GET | /admin/user-problems/pending | `admin.go:ListPendingUserProblems` | Pending community submissions |
| PATCH | /admin/user-problems/{id}/approve | `admin.go:ApproveUserProblem` | Approve + notify all users |
| PATCH | /admin/user-problems/{id}/reject | `admin.go:RejectUserProblem` | Reject with required admin notes |
| GET | /admin/users/search | `admin.go:SearchUsers` | ILIKE search (min 2 chars, max 20 results) |
| PATCH | /admin/users/{id}/verified | `admin.go:ToggleUserVerified` | Toggle verified status + cache invalidation |
| GET | /admin/broadcasts | `broadcasts.go:ListAll` | All broadcasts (200 limit) |
| POST | /admin/broadcasts | `broadcasts.go:Create` | Create + notify all users |
| PATCH | /admin/broadcasts/{id}/deactivate | `broadcasts.go:Deactivate` | Deactivate |
| PATCH | /admin/broadcasts/{id}/activate | `broadcasts.go:Activate` | Activate |
| DELETE | /admin/broadcasts/{id} | `broadcasts.go:Delete` | Permanent delete |
| GET | /admin/feedback | `feedback.go:ListAdmin` | Feedback with status filter (100) |
| GET | /admin/feedback/counts | `feedback.go:Counts` | Feedback counts by status |
| PATCH | /admin/feedback/{id} | `feedback.go:UpdateStatus` | Update status + admin notes |
| GET | /admin/problem-reports | `feedback.go:ListProblemReports` | Bug reports grouped by slug |
| GET | /admin/courses | `cms.go:ListAllCourses` | All courses (including invisible) |
| POST | /admin/courses | `cms.go:CreateCourse` | Create course |
| PUT | /admin/courses/{courseId} | `cms.go:UpdateCourse` | Update course |
| DELETE | /admin/courses/{courseId} | `cms.go:DeleteCourse` | Delete course (CASCADE) |
| PATCH | /admin/courses/{courseId}/visibility | `cms.go:ToggleCourseVisibility` | Toggle course visibility |
| GET | /admin/courses/{courseId}/modules | `cms.go:ListModules` | List modules for course |
| POST | /admin/courses/{courseId}/modules | `cms.go:CreateModule` | Create module (visible=false default) |
| PUT | /admin/modules/{moduleId} | `cms.go:UpdateModule` | Update module |
| DELETE | /admin/modules/{moduleId} | `cms.go:DeleteModule` | Delete module |
| PATCH | /admin/modules/{moduleId}/visibility | `cms.go:ToggleModuleVisibility` | Toggle module visibility |
| PATCH | /admin/modules/{moduleId}/lock | `cms.go:ToggleModuleLock` | Toggle curriculum module lock (amber badge + 403 enforcement) |
| GET | /admin/modules/{moduleId}/lessons | `cms.go:ListLessons` | List lessons for module |
| POST | /admin/modules/{moduleId}/lessons | `cms.go:CreateLesson` | Create lesson with sections + dependencies |
| PUT | /admin/lessons/{lessonId} | `cms.go:UpdateLesson` | Update lesson |
| DELETE | /admin/lessons/{lessonId} | `cms.go:DeleteLesson` | Delete lesson |
| PATCH | /admin/lessons/{lessonId}/visibility | `cms.go:ToggleLessonVisibility` | Toggle lesson visibility |
| GET | /admin/lessons/{lessonId}/sections | `cms.go:ListLessonSections` | List sections for lesson |
| POST | /admin/lessons/{lessonId}/sections | `cms.go:CreateSection` | Create section |
| PUT | /admin/sections/{sectionId} | `cms.go:UpdateSection` | Update section |
| DELETE | /admin/sections/{sectionId} | `cms.go:DeleteSection` | Delete section |
| PUT | /admin/lessons/{lessonId}/sections/reorder | `cms.go:ReorderSections` | Reorder sections (accepts ordered array of section IDs) |
| POST | /admin/lessons/{lessonId}/problems | `cms.go:LinkProblemToLesson` | Link a problem to a lesson |
| PUT | /admin/lessons/{lessonId}/dependencies | `cms.go:UpdateLessonDependencies` | Update lesson prerequisites |
| GET | /admin/lessons/{lessonId}/projects | `cms.go:ListProjects` | List projects for lesson |
| POST | /admin/lessons/{lessonId}/projects | `cms.go:CreateProject` | Create project |
| PUT | /admin/projects/{projectId} | `cms.go:UpdateProject` | Update project |
| DELETE | /admin/projects/{projectId} | `cms.go:DeleteProject` | Delete project |
| PATCH | /admin/projects/{projectId}/visibility | `cms.go:ToggleProjectVisibility` | Toggle project visibility |
| GET | /admin/module-locks | `admin.go:ListProblemModuleLocks` | List all locked problem modules |
| POST | /admin/module-locks/{moduleName} | `admin.go:ToggleProblemModuleLock` | Toggle problem module lock (insert/delete) |

### Module Locks (authenticated, student)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /me/module-locks | inline (router.go:249) | List all locked problem modules for student dashboard enforcement |

### Utility (no auth)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /health | inline | DB ping, sandbox URL, environment, response time |
| GET | /version | inline | Build commit, time, Go version |

---

## Key Engine Components

### Enricher (`internal/enricher/enricher.go`)
- **Provider:** NVIDIA NIM (DeepSeek V4 Flash) via HTTP POST
- **Dual-language schema:** Generates both Go + Python entries in `language_versions` via system prompt
- **Response format:** System prompt enforces JSON (no `response_format: json_object` — unreliable on DeepSeek)
- **Rate limiting:** 1 second minimum between requests (mutex)
- **Retry:** 3 attempts with exponential backoff (2s/4s/8s) on 429 and 503
- **FlexibleStrings:** Custom unmarshaler accepts both `"int"` and `["int"]` for `param_types`
- **Schema validation:** 14 checks: non-nil, title, func_name, 3 hints, difficulty 1-5, XP > 0, ≥1 tag, `language_versions` with "go" entry with non-empty func_name, ≥1 test case
- **Input normalization:** Handles string/object/array test case inputs via recursive JSON marshaling
- **Output cleaning:** Strips markdown fences, extracts first `{...}` JSON block
- **AIAssist:** 8 action types: rephrase_statement, improve_hints, generate_test_cases, regenerate_test_cases, adjust_difficulty, fix_signatures, add_edge_cases, chat

### Executor (`internal/executor/executor.go`)
- **Semaphore:** Buffered channel (default 6) controls concurrency
- **Type system:** Recursive `formatGoLiteral()` handles primitives, slices, maps; `formatPythonLiteral()` handles null→None, bool→True/False
- **Template engine:** Go `text/template` generates deterministic `main_test.go` with `reflect.DeepEqual` for non-primitives
- **Output parsing:** State machine regex extracts PASS/FAIL, GOT/WANT per ordinal (5 regex patterns, multi-line buffer accumulation)
- **Sandbox directory:** Per-execution UUID temp dir with `solution.go` + `main_test.go` or `solution.py` + `run_tests.py`
- **Build cache isolation:** Per-execution cache directory prevents cross-user poisoning
- **Cleanup:** Deferred `os.RemoveAll` for sandbox + cache directories
- **Language routing:** Simple `if req.Language == "python"` check; defaults to Go
- **Output capping:** All outputs capped at 100KB
- **Status classification:** sandbox status → timeout → OOM (137) → compiler_error → passed → failed

### Remote Sandbox (`sandbox/`, 8 source files, ~1211 LOC, zero external deps)
- **10-layer defense-in-depth:** regex blocklist → AST validation (Python) → setrlimit (NPROC=6, NOFILE=1024, FSIZE=64MB) → Setpgid → GOPROXY=off → cappedBuffer (64KB) → MaxBytesReader (100KB) → rate limiter (10 req/min) → temp dir randomization → deferred cleanup
- **Health endpoints:** `/health` and `/version` bypass rate limiter
- **Python runner:** 2-layer security (regex + subprocess AST parse), `python3` → `python` fallback
- **Go runner:** `go test -v -count=1 -gcflags=-l`, GOFLAGS=-buildvcs=false, GOTOOLCHAIN=local
- **Error classification:** `classifyOutput()` with 4 regex patterns, `compileErrorMessage()` 3-pass extraction
- **OOM detection:** Catches `cannot allocate memory` / `out of memory` / `Killed` → friendly message
- **Zombie reaping:** `reapProcess` with 5s timeout to prevent zombies

### Broker (`internal/broker/broker.go`)
- **In-memory pub/sub:** Map of client ID → buffered channel (32)
- **Non-blocking publish:** Slow clients miss events (channel full → default case)
- **Events:** `admin.problem.updated`, `admin.broadcast.created/updated/deleted`, `admin.feedback.submitted`, `admin.publish-all`, `user.xp.updated`, `progress.updated`, `lesson.completed`

### WebSocket (`internal/api/ws.go`)
- **Upgrade:** gorilla/websocket with auth middleware
- **Read loop:** Reads control messages (pings/pongs) only
- **Write loop:** Selects on broker channel + ticker for periodic pings
- **Cleanup:** Defers Unsubscribe + close connection

### Parser (`internal/parser/parser.go`)
- **Ingest:** `git clone --depth 1` (standard), `--filter=blob:none --sparse` + `sparse-checkout set` for subpath URLs
- **Idempotency:** SHA-256 hash of raw README content
- **URL parsing:** Handles HTTPS, SSH, tree/blob subpaths

### Pyodide Client-Side Python (`frontend/lib/pyodide.ts` + `hooks/usePyodide.ts`)
- **CDN loader:** Singleton Pyodide v0.27.4 from `cdn.jsdelivr.net`
- **Pre-loads:** `numpy`, `matplotlib`
- **`executePython()`:** Captures stdout/stderr, returns `ExecutionResult`, 10s timeout
- **Multi-file execution:** `FS.writeFile`, `FS.readFile`, `FS.mkdir`, `executeMultiFile(code, files)` for modular exercises
- **`usePyodide` hook:** Exposes `ready`, `loading`, `error`, `execute(code)`, `clearConsole()`, `consoleLines[]`
- **`PyodideConsole.tsx`:** Terminal UI with `#0D0D14` dark bg, Fira Code, colored output/error/input/system, auto-scroll, 500-line cap
- **`input()` shim:** `window.prompt()` shim installed at Pyodide init time

---

## Frontend Architecture

### App Router Structure
- **Root layout** (`layout.tsx`): UserContext provider, Inter + Fira Code fonts, Toast (Sonner)
- **Auth layout** (`(auth)/layout.tsx`): Centered card layout for login/register/onboarding
- **Main layout** (`(main)/layout.tsx`): TopNav, BroadcastBanner, FeedbackButton, PyodidePreloader
- **Problems layout** (`problems/layout.tsx`): Minimal layout with TopNav (workspace has no max-width container)
- **Learn layout** (`(main)/learn/layout.tsx`): Minimal wrapper for CMS pages
- **Legal layout** (`(legal)/layout.tsx`): Simple prose layout for privacy/terms

### State Management
- **UserContext:** React context with user state, fetchUser on mount, periodic refresh (no JWT local-decode fallback); subscribes to `user.xp.updated` WebSocket event for auto XP/level refresh
- **useNotifications:** 5s polling for unread count; cache invalidation on markAsRead
- **useWebSocket:** Auto-reconnect with exponential backoff (`event.ts`); 7 event types
- **SessionStorage cache:** 30s TTL for GET responses (`cache.ts`)
- **Per-language localStorage:** `koder_code_{slug}_{lang}` for save & switch

### Key Components
- **ProblemWorkspaceClient:** Monaco Editor (Go/Python), split pane with TestResultPanel, submit/test with solved guard (409), confetti on success, report bug dialog, language toggle with scaffold preservation + confirmation dialog, Console toggle (Hints↔Console) for Python with Run in Browser button, Ctrl+Enter → Pyodide, Ctrl+Shift+Enter → backend Submit
- **LessonViewerClient:** Step-by-step section navigation with prev/next buttons, ArrowLeft/Right/Space keyboard shortcuts, quiz consolidation into Quiz Review step at end, progress bar with step indicator dots, AnimatePresence transitions, locked overlay when prerequisites not met, sessionStorage lesson context for success page
- **Admin curriculum page:** 3-panel CMS: course list (left) → module list (center) → lesson editor (right); full section CRUD with type dropdown, quiz metadata editor, dependency management (searchable checkbox picker), multi-file config for exercises, JSON metadata editor for non-quiz sections
- **LearningCard:** Reusable card with 3D back plate effect, type-based gradients (course/module/lesson/section), status badges (locked/available/completed/in-progress), staggered hover stats reveal, 16:9 aspect ratio, CodePen shadow back plates, LanguageLogo overlay
- **RatingBadge:** Star rating component with half-star support, review count display
- **AdminCards:** 4 admin card variants (Course/Module/Lesson/Project) with CodePen shadow back plates, always-visible visibility toggles/actions, 16:9 aspect ratio
- **SectionExercise:** Monaco Editor with 60/40 PyodideConsole split (Python), Run in Browser + Ctrl+Enter, Backend Test button, multi-file support via MultiFileEditor
- **MultiFileEditor:** Tabbed multi-file editor (add/remove files, path+content editing, entry point toggle), used by exercise/assessment/mini_project sections
- **MultiFileConfigPanel:** Admin visual multi-file editor for configuring exercise files at lesson creation time
- **LessonSidebar:** Progress indicator, section nav, prerequisites checklist with locked state (`opacity-50 cursor-not-allowed`)
- **ProfileHoverCard:** XP progress bar `(xpInLevel/1000)`, 3-column stats, verified status label
- **All learn routes:** Dedicated `loading.tsx` (skeleton pulse patterns) and `error.tsx` (AlertTriangle + retry button) at every route level

---

## Configuration & Environment

### Backend (`config.go`)
| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | Supabase PostgreSQL connection string (required) |
| `JWT_SECRET` | — | HS256 signing key (min 32 chars, required) |
| `JWT_EXPIRY_HOURS` | `24` | Legacy JWT expiry (unused with refresh tokens) |
| `ACCESS_TOKEN_EXPIRY_MINUTES` | `15` | JWT access token lifetime (> 0) |
| `REFRESH_TOKEN_EXPIRY_DAYS` | `7` | Refresh token lifetime (> 0, rotated on use) |
| `ENRICHMENT_PROVIDER` | `nvidia` | Must be `nvidia` (only supported) |
| `NVIDIA_API_KEY` | — | NVIDIA NIM API key (required) |
| `NVIDIA_MODEL` | deepseek-ai/deepseek-v4-flash | NVIDIA model name |
| `NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` | NVIDIA NIM API base URL |
| `EXECUTOR_MAX_CONCURRENCY` | `6` | Max concurrent code executions |
| `EXECUTOR_TIMEOUT_SECONDS` | `30` | Per-execution timeout |
| `PYTHON_EXECUTOR_TIMEOUT_SECONDS` | `60` | Python timeout |
| `DOCKER_IMAGE` | `golang:1.23-alpine` | Sandbox Docker image |
| `PYTHON_DOCKER_IMAGE` | `python:3.12-slim` | Python Docker image |
| `SANDBOX_URL` | — | Remote sandbox URL (empty = local Docker) |
| `PYTHON_SANDBOX_URL` | — | Optional separate Python sandbox URL |
| `GO_VERSION` | `1.23` | Go version for go.mod generation |
| `GOOGLE_CLIENT_ID` | — | Google OAuth client ID |
| `ADMIN_EMAIL` | — | Admin account email |
| `ADMIN_PASSWORD` | — | Admin account password |
| `RESEND_API_KEY` | — | Resend email API key (optional) |
| `EMAIL_FROM` | `Koder <noreply@koder.sbs>` | Verified sender address in Resend |
| `FRONTEND_URL` | `http://localhost:3000` (must set in production) | Frontend URL for password reset links |
| `ALLOWED_ORIGINS` | `http://localhost:3000` (must set explicitly in production) | CORS origins (comma-separated); also reads `ALLOWED_ORIGIN` (legacy single-value) |
| `ENVIRONMENT` | `development` | `development` or `production` |
| `PORT` | `8080` | Server port (1-65535) |
| `SANDBOX_BASE_DIR` | `/tmp/koder` | Temp directory for sandbox files |
| `BUILD_CACHE_DIR` | `/tmp/go-build-cache` | Go build cache directory |

### Frontend (`next.config.ts`)
| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` (must set explicitly in production) | Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | — | Google OAuth client ID |

---

## Development Workflow

### Local Setup
```bash
# Backend (from root)
cp .env.example .env       # Fill in DATABASE_URL, JWT_SECRET, etc.
go run cmd/server/main.go  # Starts on :8080

# Frontend
cd frontend
cp .env.example .env.local  # Set NEXT_PUBLIC_API_URL
npm install
npm run dev                 # Starts on :3000
```

### Testing
```bash
go test ./internal/...              # 9 packages pass
go test ./internal/executor/...     # Integration tests (requires Docker)
go vet ./internal/...               # 0 issues
cd sandbox && go test ./... && go build ./...  # Sandbox tests + build
cd frontend && npm run lint && npx tsc --noEmit  # ESLint 0, TS 0
cd frontend && npm run build        # Next.js build (runs copy-monaco.mjs first)
```

### Database Migrations
```bash
# Add new migration file to migrations/ (next number)
# Apply via Supabase dashboard SQL editor or CLI
# Never delete/reorder existing migrations
```

### Build & Deploy
```bash
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o server cmd/server/main.go
./build.sh  # Full deployment script (builds backend + sandbox)

cd frontend
npm run build   # Builds static + server components
```

---

## Constraints & Performance Mitigations

| Constraint | Mitigation |
|---|---|
| **NVIDIA NIM API quota** | SHA256 change detection, cached results, skip-reenrich |
| **AI rate limits** | 15 req/min per-admin (AIRateLimitMiddleware); 1s client-side gap in enricher |
| **6 concurrent executions** | Buffered channel semaphore; 100KB output cap |
| **10 DB pool connections** | pgxpool MaxConns=10, MinConns=2, 30m lifetime, QueryExecModeSimpleProtocol |
| **500MB Postgres limit** | Normalized schema, no JSONB bloat, LIMIT on all queries, 90d output_logs TTL |
| **Unbounded output** | 100KB cap on execution output; cappedBuffer (64KB) in sandbox |
| **ARM64 only** | All Docker images multi-arch or explicitly ARM64; build.sh targets both |
| **5 req/45s submissions** | Per-user sliding window rate limiter; admin bypass |
| **10 req/min auth** | Per-IP sliding window rate limiter |
| **JWT revocation** | Token blacklist table with cleanup goroutine |
| **Refresh token rotation** | Old token revoked on use; reuse detection revokes ALL sessions |
| **Cache invalidation** | user-updated event clears profile + leaderboard caches; notifications clear sessionStorage |
| **WebSocket reliability** | Exponential backoff reconnect (event.ts); broker non-blocking publish (cap 32) |
| **Concurrent first-solve** | pg_advisory_xact_lock + FOR UPDATE prevents XP double-award |
| **Race conditions** | CompleteUserOnboarding explicit uniqueness check in tx; stale notifications cleared on mutation |
| **Pyodide CDN load** | Singleton loader prevents duplicate loads; 10s timeout with error handling |

---

## Known Issues & Stale Documentation

1. **`.github/copilot-instructions.md`** — References Gemini genai SDK (removed), httpOnly cookies (JWT in localStorage), semaphore cap=2 (now 6), timeout 5s (now 30s), Docker memory 64m (now 256m). Needs full rewrite to match codebase.
2. **`frontend/README.md`** — Now references NEXT_PUBLIC_API_URL and NEXT_PUBLIC_GOOGLE_CLIENT_ID setup (Gemini reference removed).
3. **`sandbox/secure_unix.go`** — `resourceLimits` uses raw numeric values for `RLIMIT_NPROC` (6) and `RLIMIT_NOFILE` (7) instead of `syscall.RLIMIT_NPROC` / `syscall.RLIMIT_NOFILE`. Works on linux/arm64 but may need verification.
4. **`sandbox/main.go`** — `forcePackageKoder` regex is duplicated in both `sandbox/runtest_go.go` and `internal/executor/sandbox.go`. Should be shared.
5. **`@tanstack/react-virtual`** — Listed in `frontend/package.json` but unused. Should be removed.
6. **Session log duplication** — `.opencode/session-log.md` is stale (last entry July 9). The canonical log is `SESSION_LOG.md`. The `.opencode` version should be removed or auto-synced.
7. **ADR-012 (Per-language localStorage)** — Documented in CODEBASE_INDEX.md but decision rationale is not captured in ADRs file. Keys are `koder_code_{slug}_{lang}`.
8. **Hydration mismatch on `/home` (FIXED 2026-07-21)** — `selectedModule` was moved from `useState` initializer to `useEffect`, resolving the server/client HTML mismatch in the dashboard header section. The `"All Problems"` clear-filter button no longer renders differently on server vs client.

---

## Session Log

### 2026-07-22 — Session 58: Full codebase re-index — fresh multi-agent scan

**Full re-index:** Deployed 2 parallel exploration agents to re-scan all 78 Go source files (21,248 LOC), all 128 `.tsx` + 22 `.ts` frontend files (~57,839 LOC), 4 CSS files, 46 migration SQL files (19,963 LOC), all 17 documentation/markdown files, all root configs.

**Verified counts:**
- **Go backend:** 78 files, 21,248 LOC — api (26/7,213), store (23/6,376), executor (7/2,334), enricher (2/1,169), auth (5/684), config (2/694), parser (2/717), broker (2/254), cmd (1/125), sandbox (8/1,189)
- **Frontend:** 128 `.tsx` (53,786 LOC) + 22 `.ts` (2,473 LOC) + 4 CSS (1,580 LOC) = 154 source files, ~57,839 LOC
- **Migrations:** 46 SQL files, ~1.5MB, 19,963 LOC
- **Grand total:** ~99,050 LOC

**Fixes applied to CLAUDE.md:**
- Updated codebase header with fresh verified counts
- Added missing `monaco-setup.ts`, `monaco-theme.ts` lib files
- Added `icons/` directory entry under components
- Fixed duplicate `contribution-graph` listing
- Updated executor section count (7 files, not 8)
- Updated `SESSION_LOG.md` reference (45+ → 57+ sessions)

### 2026-07-22 — Session 49: CodeSnippet polish, best-practices + Learn Beta-gate, docs update

**Commits:** `ac8a45e` `86258a4` `77723fa` `6657efa`

**CodeSnippet rewrite:**
- `frontend/components/application/code-snippet/index.tsx` — 476→314 lines: removed `react-icons`, simplified to single component, `collapsed`/`maxHeight` with gradient-fade toggle
- Carbon-copy button hover fix (missing `group`), multi-file key fix (`f.language`→`f.filename`), type shadow fix (`SnippetCtxType`)

**Best-practices cards:** Replaced 40-line CodeBlock compound with 7-line CodeSnippet (`collapsed`, `maxHeight={140}`)

**Beta-gate:** Best-practices tab + Learn nav link disabled for non-admins with amber BETA badge + `FlaskConical` icon; best-practices content guarded with coming-soon card; `aria-disabled` + `title` for accessibility

**Polish:** Removed no-op `col-span-full`; moved `isActive` into non-disabled branch; `tsc --noEmit` clean

### 2026-07-22 — Session 50: Solved count consistency + import alias fix

**Commits:** `582917b` `ac5cbb8` `12bbc34`

- Dashboard solved stat (`totalSolved`) reads from `user.solvedCount` (`GET /me`, same source as XP and streak) instead of language-filtered problems list
- `storepkg` alias in `router.go` to avoid package import / parameter name shadowing

### 2026-07-22 — Session 51: Professional typography polish

**Commits:** `f57f867` `dc2d61b`

- Problem description prose: `text-brand-offwhite-muted` → `text-brand-offwhite/90`, `prose-sm` → `prose-base`, bold headings, bright code blocks
- Problem cards: titles `font-bold text-base`, descriptions `text-sm opacity-90`, stats `font-semibold opacity-80`

### 2026-07-22 — Session 52: Workspace editor cleanup

**Commits:** `2c472ac` `f9690b1`

- Removed duplicate difficulty badge from toolbar (kept in description area)
- Removed all custom intellisense providers (~740 lines): Go/Python completion items, hover providers, snippets
- Theme: `vs-dark-plus` → `vs-dark` (Monaco built-in)
- Disabled all suggestions, parameter hints, auto-closing brackets/quotes

### 2026-07-22 — Session 53: Curriculum module lock panel on admin dashboard

**Commit:** `d0ae5ac`

- New "Curriculum Module Locks" panel on admin dashboard below "Problem Module Locks"
- Fetches all courses + per-course modules; collapsible accordion with locked count
- Each module has inline lock/unlock toggle button (amber styling)
- Uses existing `toggleModuleLock(id)` → `PATCH /admin/modules/{id}/lock`
- Student enforcement already in place: course detail shows locked overlay, module detail returns 403

### 2026-07-22 — Session 54: Problem module lock panel + locked card redesign + dashboard fix

**Commits:** `d1495d6` `486ae78` `55e054c`

- Problem module locks panel: grouped by Go/Python, display names, collapsible accordion
- Locked cards: full visibility, amber border, lock badge top-right, hover "LOCKED" overlay
- Dashboard fix: locked modules appear in module list even when backend filters their problems

### 2026-07-22 — Session 55: Admin bypass for module locks + delete problem module

**Commits:** `345edcb`

- Admin bypass (role != "admin" guard): GetProblemBySlug, ListVisibleProblems, Submit, Test
- DeleteProblemModule: transaction-safe (submissions → progress → problems → lock), DELETE /admin/problem-modules/{moduleName}, trash button with confirm dialog
- clearCache before loadData() after delete — stale 30s cache was masking deletions

### 2026-07-22 — Session 56: Smart back navigation + full SPA links

**Commit:** `843d315`

- Workspace stores `sessionStorage.return_to` on problem link click; reads it for Back link
- MyContributions.tsx + admin/page.tsx: `<a>` → `<Link>` for SPA navigation

### 2026-07-22 — Session 57: LIFO navigation stack + module URL persistence

**Commits:** `4fc6cce` `32f264a` `2ba2fac`

- `pushState` for module selection, language tabs, back-to-topics (proper history entries)
- `popstate` listener syncs React state with URL on browser back/forward
- Module filter reads from URL params on mount — refresh preserves state

### 2026-07-22 — Session 59: Module metadata system + Python module images

**Commits:** `528cd8b` (squashed)

**Module metadata system:**
- Migration `046_module_meta.sql` — `module_meta` table (module_name PK, display_name, is_pinned) with seed data for all 26 known modules
- `internal/store/module_meta.go` — `ListModuleMeta`, `UpsertModuleMeta`, `SetModulePin` store functions with INSERT ON CONFLICT
- `internal/api/admin.go` — 3 handler functions (`ListModuleMeta`, `UpsertModuleMeta`, `SetModulePin`)
- `internal/api/router.go` — 3 admin routes (`GET/PUT/PATCH`) + student `GET /me/module-meta`
- `frontend/lib/api.ts` — `ModuleMeta` interface + `fetchModuleMeta`, `upsertModuleMeta`, `setModulePin`

**Admin panel — Module Settings panel:**
- New "Module Settings" panel — inline rename + pin toggle
- Inline rename with Enter/blur/Escape keyboard support
- Pin toggle with Pin/PinOff icons, pinned modules sort first in ModuleCards
- Cache invalidation before re-fetch after mutations

**Admin panel — Problem Module Locks fixes:**
- Modules derived from `Object.keys(moduleMeta)` — ALL modules, not just ones with problems
- Display names use `moduleMeta[mod]?.display_name` — reflects renames
- Delete button only renders when module has problems
- Removed hardcoded `MODULE_DISPLAY_NAMES`

**ModuleCards integration:**
- Accepts `moduleMeta` prop, sorts by `is_pinned`, uses `display_name` from meta
- `home/page.tsx` fetches moduleMeta on load + window focus refresh

**Python module images (4 new WebP):**
- `python-arrays-strings.webp`, `python-challenges.webp`, `python-fundamentals.webp`, `python-intermediate.webp`
- 1.3MB PNG → ~30KB WebP (97% reduction)

**Backend files:** `internal/store/module_meta.go`, `internal/store/types.go`, `internal/store/store.go`, `internal/api/admin.go`, `internal/api/router.go`, `migrations/046_module_meta.sql`
**Frontend files:** `frontend/lib/api.ts`, `admin/page.tsx`, `home/page.tsx`, `ModuleCards.tsx`, `public/modules/python-*.webp`

**Verification:**
- `go vet ./internal/...` — clean
- `go build ./...` — clean
- `npx tsc --noEmit` — clean

### 2026-07-22 — Session 60: Markdown renderer rewrite + paragraph spacing fix

**Commits:** `528cd8b`

**Problem statement rendering — root cause fix:**
- `frontend/app/globals.css` was missing `@tailwindcss/typography` — all `prose-*` classes were no-ops
- Removed `react-markdown` / `remark-gfm` — replaced with self-contained `renderMarkdown()` + `inlineMd()` in `ProblemWorkspaceClient.tsx`
- All styling via inline `style=` attributes — deterministic, no CSS plugin dependency

**Files modified:**
- `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx`

**Verification:**
- `npx tsc --noEmit` — clean

### 2026-07-22 — Session 61: Locked module count fix, community solution collapsible cards, professional polish

**Commits:** `824fc10`

**Locked module cards — fix problem counts:**
- Added `Locked bool` to `Problem` struct; SQL includes `EXISTS (SELECT 1 FROM module_locks WHERE module_name = p.module) AS is_locked`; handler no longer filters locked problems — they return with `locked: true`
- `LIMIT` raised from 200 → 500; `frontend/lib/types.ts` adds `locked: boolean`
- `filteredProblems` excludes `p.locked` from grid; `moduleProgress` derives from ALL problems (including locked) so ModuleCards show correct counts
- Locked module cards now show `12 problems · 3 solved · 25%` with amber lock overlay

**Community solutions:**
- Removed `AND EXISTS (submission_likes)` — solutions with 0 likes now surface
- Community cards: auto-height + collapse (>8 lines → `max-h-[220px]` with gradient fade), `rounded-xl` (no double-radius), fixed `h-[200px]` removed

**Bug fix:** `ProblemWorkspaceClient.tsx:427` — `lang` → `activeLanguage`

**Verification:**
- `go vet ./internal/...` — clean
- `go build ./internal/...` — clean
- `npx tsc --noEmit` — clean

### 2026-07-22 — Session 62: Middleware auth redirect fix

**Commits:** `ba654d6`

**Problem:** Auth guard added in session 61 checked for `koder_token` cookie in Next.js middleware, but the cookie is set on the API domain (`koder-api.onrender.com`), not the frontend (`update.koder.sbs`). Every RSC request to protected routes was redirected to `/`, creating an invisible redirect loop — blank charcoal screen.

**Fix:** Removed auth redirect guard from `frontend/middleware.ts`. Auth remains handled client-side via UserContext's 401 fallback.

**Verification:**
- `go vet ./internal/...` — clean
- `go build ./internal/...` — clean
- `npx tsc --noEmit` — clean

### 2026-07-23 — Session 68: Locked modules sort to bottom of ModuleCards grid

**Commits:** `1e28c16`

**ModuleCards sort fix (`frontend/components/dashboard/ModuleCards.tsx`):**
- **Problem:** Locked and unlocked modules were mixed in alphabetical order. Users saw locked modules interspersed with active ones.
- **Fix:** Added lock-status check (`lockedModules.has()`) as the primary sort key — locked modules always appear after all unlocked modules
- **Sort order:** pinned unlocked → alphabetical unlocked → pinned locked → alphabetical locked

**Verification:**
- `npx tsc --noEmit` — clean
- `npm run lint` — 0 errors (1 pre-existing warning in MarkdownPreview.tsx)
- Pushed to `origin/update`

---

### 2026-07-22 — Session 67: Admin preview fix — render markdown + examples section

**Commits:** `cf5435e`

**Shared markdown module (`frontend/lib/markdown.ts` — NEW):**
- Extracted `renderMarkdown()`, `inlineMd()`, `escapeHtml()` from `ProblemWorkspaceClient.tsx` into shared utility
- ProblemWorkspaceClient now imports from the shared module instead of defining locally

**Admin preview fix (`ProblemEditPanel.tsx`):**
- **Root cause:** Admin Preview toggle never rendered examples — only statement, constraints, learning objective. Toggling Preview made examples look like they vanished.
- **Fix:** Preview now renders statement via `renderMarkdown()` (was `whitespace-pre-wrap` raw text), adds examples section from `problem.examples` with Input/Expected Output code blocks, constraints and learning objective also rendered via `renderMarkdown()`

---

### 2026-07-22 — Session 66: Seeded shuffle + filter bar redesign + beta gate for /problems

**Commits:** `b527df2` `ff88299` `4cefe19`

**Seeded random problem ordering (`frontend/lib/utils.ts`):**
- Added `seededRandom(seed)` — mulberry32 PRNG + `shuffleArray(arr, seed)` — Fisher-Yates shuffle
- Seed derived from first 8 hex chars of user UUID — each user gets a unique consistent ordering
- Removed `#001` numbering from problem cards (meaningless with random order)

**Filter bar redesign (`frontend/app/(main)/problems/page.tsx`):**
- Replaced sidebar `aside` with top-mounted card: search + language tabs + Status/Difficulty `Select` dropdowns + XP range inputs + active filter chips with dismiss + mobile slide-in drawer

**Beta gate — /problems admin-only (`TopNav.tsx` + `problems/page.tsx`):**
- TopNav: "Problems" nav link disabled for non-admins with amber BETA badge
- problems/page.tsx: non-admins see centered coming-soon card (`FlaskConical` icon)
- Matches existing Learn + Best Practices beta gate pattern

---

### 2026-07-22 — Session 65: Dashboard nav corrected (dispatchEvent) + scrollable success page previews

**Commits:** `c2f0efa`

**Dashboard nav link — fix corrected:**
- `router.refresh()` didn't work — it doesn't re-run client `useEffect` hooks, so the dashboard's data-fetching effect never re-fires
- Changed to `window.dispatchEvent(new Event("user-updated"))` — the dashboard (`home/page.tsx:118`) already listens for this event, clears cache, and re-fetches all data (problems, user, best practices, module locks, module meta) with 300ms debounce

**Success page — scrollable code previews:**
- Removed 141 lines of collapse/expand machinery (state, gradient overlays, toggle buttons)
- Both "Your Solution" and community solution code blocks now bounded at `max-h-[220px]` with `overflow-y-auto`; thin scrollbar visible on hover

### 2026-07-22 — Session 64: Config test fixes, dashboard nav link (original), global rank fix

**Commits:** `bfadb3f` `549521f` `9b882aa` `c8c260c`

**Config test fixes (4 failing → all pass):**
- `internal/config/config.go:loadEnvFile()` — skips `.env` during tests (`os.Args[0].test` suffix check)
- `internal/config/config_test.go` — 3 "missing" tests call `t.Setenv("VAR", "")` to clear CI env vars; `TestLoadConfig_Defaults` clears `GO_VERSION`
- Tested with CI env vars (`DATABASE_URL`, `JWT_SECRET`, `NVIDIA_API_KEY` set) — all pass

**Dashboard nav link no-op fix (original):**
- `TopNav.tsx` — added `onClick` handler with `router.refresh()` — later corrected to `dispatchEvent` in session 65

**Global rank `# #1` fix:**
- `StatsOverview.tsx:30` — removed `#` from template literal: `#{profile.global_rank}` → `{profile.global_rank}`
- `Hash` icon already serves as the `#` symbol — renders as clean `# 1`

### 2026-07-22 — Session 63: ESLint errors fix + staging CI/CD + branch rename

**Commits:** `43eaef7`

**Lint fixes (6 eslint errors → 0):**
- `ProblemEditPanel.tsx` — key-based re-mount (`${tc.id}-${tc.expected}`) replacing useEffect/useRef sync
- `home/page.tsx` — `selectedModule` initialized from URL in useState, removed mount-time useEffect
- `LessonViewerClient.tsx` — `key={lessonSlug}` on root div remounts component on lesson nav
- `MultiFileConfigPanel.tsx` — eslint-disable block comments for legitimate external-system sync

**CI/CD:** Added `update` branch to push/PR triggers in `ci.yml` — identical pipeline as main

**Branch:** Remote renamed `update` → `staging`; `origin/update` force-pushed to match old staging

### 2026-07-21 (cont.) — Post-lock follow-up fixes + problems page polish + professional code-snippet component

**Commits:** `6473b91`, `b390378`, `da9e560`, `29ccff1`, `354b4ba`, `f2ce7f1`, `93618a3`, `2e8ec08`→`6e7666f`

- **New component:** `application/code-snippet/index.tsx` — Professional Shiki code block with copy button, language icons, error highlighting, line numbers (477 lines)
- **New component:** `FeedbackButtonWrapper.tsx` — Route-conditionally renders FeedbackButton
- **CSP fix:** Added `ws:` protocol for dev WebSocket connections; added `cdn.jsdelivr.net` + `va.vercel-scripts.com` to script sources
- **Hydration fix:** Moved `selectedModule` from `useState` initializer → `useEffect` on home page to resolve server/client HTML mismatch
- **New endpoint:** `GET /me/module-locks` — student-facing endpoint for locked problem modules
- Fix problem edit persistence (use response data + invalidate cache on save)
- Fix workspace header overflow with long titles (truncate + `shrink-0`)
- Professional UI polish for `/problems` filter sidebar with nav-item style section dividers
- Remove Pyodide console/Run in Browser from problem workspace (session 47)
- Restore saved code on refresh regardless of initial state
- Class spacing fix: `relative` on responsive filter container for proper sidebar layering

### 2026-07-21 — Problem module locks + admin lock panel + locked module UI

**Commits:** `02aa051`

**Problem module lock system:**
- Migration `045_add_module_locks.sql` — `module_locks` table (module_name PK, created_at)
- `internal/store/module_locks.go` — ListLockedModules, ToggleProblemModuleLock, IsModuleLocked
- Backend enforcement: ListVisibleProblems filters locked modules; GetProblemBySlug returns 403 MODULE_LOCKED; GetModuleProficiency excludes via NOT EXISTS
- Admin dashboard: module lock panel with lock/unlock toggle buttons for all problem categories
- ModuleCards: amber padlock overlay + disabled click on locked modules
- Home page: fetches locked modules alongside problems, passes to ModuleCards

**Also:**
- Paragraph spacing fix: `[&_p]:mb-3` for visible paragraph breaks in problem statement markdown
- Saved code restore fix: always restores saved code when found, regardless of initial state
- Curriculum module lock (previous session): migration `044_add_module_locked.sql`, lock/unlock API, amber badge on AdminModuleCard, backend 403 enforcement
- Curriculum Manager card added to admin dashboard

### 2026-07-20 — Professional full-codebase re-index (post-45 sessions)

**Pull:** `3aef8d2` — 45 migration SQL files, 80 Go source files, ~200 frontend source files

**Re-indexed:** All 80 Go source files, ~200 frontend source files, 45 migration SQL files, all 14 documentation files. Verified `go vet`, `go build`, `go test` (9/9 packages pass). Updated CLAUDE.md with migration 043, updated counts, and comprehensive re-index.

**New in this session:**
- `migrations/043_seed_python_mastery_practice.sql` — Python Mastery: Practice & Review (1 module, 5 lessons)
- Updated course catalog, course detail, module detail pages with improved LearningCard integration
- Full codebase re-read and documentation sync

### 2026-07-17 — Lesson Prerequisite Enforcement + Admin Dependency Picker

**Commits:** `4554979` (and 9 prior on this date)

**Backend:**
- `GetModuleDetail` handler includes per-lesson `dependencies` via batch `ANY($1)` query
- New `GetLessonDependenciesByLessonIDs` store function (bulk fetch, single query)
- Store interface updated

**Admin CMS:**
- Dependency picker in lesson Settings tab: searchable checkbox multi-select, pill badges
- Auto-loads current deps via `fetchLesson` (public detail endpoint)
- Saves deps on create (`dependency_ids` in POST body) and update (`PUT /admin/lessons/{id}/dependencies`)

**Student-facing enforcement:**
- Module detail page: `isLocked` per lesson from dependencies + completion → `status="locked"`
- `LessonViewerClient`: locked overlay when `!prerequisites_met` — amber lock, lists unmet deps
- `LessonSidebar`: locked lessons show Lock icon, `opacity-50 cursor-not-allowed`

**Also:**
- `042_seed_python_mastery_games.sql` — Python Mastery: Build Your Own Games (2 modules, 6 lessons, 1 project)
- Hero styling polish — all heroes use exact LearningCard visual DNA (back plate, glass icon, `text-[9px]` badges), natural height (not 16:9)
- `frontend/lib/event.ts` — 5 WebSocket event types: `user.xp.updated`, `progress.updated`, `lesson.completed`, plus existing broadcast/feedback
- `frontend/lib/UserContext.tsx` — subscribes to `user.xp.updated` for auto-refresh
- `MultiFileEditor.tsx`, `MultiFileConfigPanel.tsx` — multi-file Python exercise support

### 2026-07-16 — Lesson step-by-step navigation, Pyodide polish, code block dark mode fix

**Commits:** `8e6f7d1`, `3434279`, `472554f`, `4b4bb4e`, `d947af5`, `005ccc8`, `12b7a45`

**Lesson step-by-step navigation:**
- Sections shown one at a time with prev/next buttons and ArrowLeft/Right/Space keyboard shortcuts
- All quizzes consolidated into a single "Quiz Review" step at the end with gradient card
- Progress bar with step indicator dots and step counter
- Professional gradient-bordered card component per section type

**Pyodide fixes:**
- `input()` now works via `window.prompt()` shim installed at init time
- Removed `!pyodideReady` guard on "Run in Browser" button so lazy Pyodide can be triggered
- Fixed `handlePyodideRun` try/finally with `setTesting(true/false)`
- Fixed double prompt prefix in console output (`> >>>` → `> `)
- Removed emoji/special char console prefixes
- Free-form Python defaults to standalone `print()` templates

**Code block dark mode fix:**
- Added `darkModeClassNames` to `CodeBlockContent` for proper Shiki dual-theme
- Proper dark mode text color and padding to `CodeBlockFallback`

### 2026-07-16 — Course/Module/Lesson page professional redesign & audit fixes

**Commits:** `aa02d24`, `d1172fb`, `0771f5e`

**Professional Card Redesign:**
- Course catalog: gradient hero backgrounds, glass-morphism icons, difficulty pills, shadow-lift animations
- Course detail: hero section, progress bar, module cards with gradient stripe + lucide icons
- Module detail: gradient header + stats bar, lesson cards with rich status indicators, XP badges

**Audit fixes:**
- Removed unused imports
- Added error states + retry buttons to all 3 pages
- Fixed buggy `resolveModuleGradient` loop in module page
- Fixed `lesson_count` undefined → `firstIncomplete` logic

### 2026-07-15 — Pyodide client-side Python playground

**Files created (4):**
- `frontend/lib/pyodide.ts` — CDN Pyodide singleton loader + executePython() with 10s timeout
- `frontend/hooks/usePyodide.ts` — React hook: { ready, loading, execute, consoleLines, clearConsole }
- `frontend/components/PyodideConsole.tsx` — Terminal-style console with dark bg, Fira Code, colored output
- `frontend/components/ResizableSplitPane.tsx` — Drag-resizable horizontal split with grip handle

**Files modified (4):**
- `frontend/package.json` — +pyodide dependency
- `frontend/components/learn/SectionExercise.tsx` — Monaco + PyodideConsole 60/40 split
- `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` — Console toggle, Run in Browser toolbar
- `frontend/.../LessonViewerClient.tsx` — Dynamic language from UserContext

### 2026-07-14 — Professional full-codebase re-index (curriculum-cms)

- Read and indexed all 83 Go source files, all 105 frontend files, all 40 migration SQL files
- Updated CLAUDE.md with complete Curriculum CMS architecture, all ~89 API endpoints
- `go vet`, `go test (8/8)`, ESLint, `tsc --noEmit` all clean

### 2026-07-13 — Verified badge propagation (4-layer fix)

**Gaps fixed across 10 files:**
| Layer | Issue | Fix |
|---|---|---|
| Leaderboard struct/query | Missing `Verified` field + SQL SELECT | Added to `LeaderboardUser` struct and both leaderboard queries |
| Community solutions | Missing `u.verified` in SELECT + struct | Added to SQL scan + `CommunitySolution` struct |
| Frontend types | Missing `verified` on `CommunitySolution` | Added `verified: boolean` |
| GET /me | Missing SELECT + response field | Added to SQL, scan, and `meResponse` |
| Cache invalidation | Admin `ToggleUserVerified` didn't clear user cache | Added `InvalidateUserCache()` |

### 2026-07-13 — ProfileHoverCard redesign, admin user verification panel

- ProfileHoverCard: XP progress bar (xpInLevel/1,000), 3-column stats, verified status label
- UserVerificationPanel: Search with 300ms debounce, verified toggle button, ProfileHoverCard
- Leaderboard custom Avatar: "podium" size, verified checkmark

### 2026-07-12 — Save & Switch, Monaco theme, Go fundamentals seed, JSONB encoding fix

- Per-language localStorage keys, `applyLanguageSwitch`, confirmation dialog
- VS Code Dark+ theme via `defineTheme` (replaced 529-line custom koder-dark theme)
- Go fundamentals seed (037): 5 Go-only problems
- JSONB fix: `[]byte` → `json.RawMessage` for all `language_versions` parameters

### 2026-07-12 — Monaco editor, workspace layout, admin edit, ESLint sweep

- VS Code Dark+ theme registration via `loader.init()`
- CSP: `worker-src 'self' blob:` for Monaco workers
- `/problems` listing page with search/lang filter/pagination
- Admin edit problem dialog with 9 editable fields
- 8 ESLint warning fixes

### 2026-07-11 — Google auto-registration, navigation fix, refresh token fix

- `GoogleAuth` auto-creates accounts via `CreateUserFromGoogle` (no more 404)
- Refresh token issued for new Google users
- All `router.push('/')` → `router.push('/home')`
- Created `/problems` listing page

### 2026-07-10 — Refresh token rotation, AI usage logging, CSP, data export

- Refresh token rotation with reuse detection (revokes ALL sessions on reuse)
- AI usage logging (migration 035) + `AIRateLimitMiddleware` (15 req/60s)
- NVIDIA NIM migration (removed Gemini/Groq)
- CSP/security headers: nonce-based, worker-src blob:, gorilla/websocket Hijacker fix
- Account data export at GET /me/export-data

### 2026-07-10 — Python arrays & strings seed (034) + variables & math seed (032)

- 7 Python problems in `python-arrays-strings` (difficulty 1-2)
- 1 Python problem in `python-variables-math` (difficulty 1, 10 test cases)

### 2026-07-10 — Empty func_name filtering + python-intermediate seed

- Frontend/backend filter languages to only those with non-empty `func_name`
- 10 Python intermediate problems seeded (031)

### 2026-07-09 — Python sandbox fixes, production polish, ESLint compliance

- `findPythonBin()` with `python3` → `python` fallback
- `EnhancePythonError` for human-readable Python exceptions
- `compileErrorMessage` 3-pass extraction, `formatPythonLiteral` null→None fix
- AST validation timeout (10s)
- ESLint 0 errors, 124 Go tests

### 2026-07-09 — Python compiler_error fix

- `formatPythonLiteral()` dead code fix; replaced `TestCasesJSON` with `PyTestCases`
- `goToSnakeCase()` fallback when `LanguageVersions["python"]` is missing

### 2026-07-08 — Comprehensive CI/CD, test audit, multi-language seed backfill

- GitHub Actions CI: 4 jobs (backend tests/lint → frontend tests/lint → deploy-backend → deploy-sandbox)
- 122 total tests across 8 packages
- Migration 028: PL/pgSQL backfill for 180 seed problems
