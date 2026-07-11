# Koder — Professional Codebase Index

## Project Overview

**Koder** is a zero-cost, production-grade automated code-grading platform for Go (and now Python) programming curricula. Students solve problems in a Monaco editor workspace, submit code, and receive instant pass/fail results with diff output. AI (Gemini/Groq) enriches raw problem specs into structured test cases. Runs entirely on free-tier infrastructure.

- **Stack:** Go 1.26 backend (chi router, pgx/v5) + Next.js 15 frontend (App Router, React 19)
- **Infrastructure:** Go monolith on Render/Oracle (ARM64) + remote Go sandbox on Railway + Supabase Postgres + Vercel frontend
- **Core Constraint:** $0/month operating budget with hard resource limits (500MB Postgres, 50 Gemini calls/day, 6 concurrent executions max)

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Go 1.26, chi/v5 | HTTP server, routing, middleware |
| **Database** | PostgreSQL 15 (Supabase), pgx/v5 | Raw SQL, connection pooling (10 max) |
| **Auth** | golang-jwt/v5, bcrypt, Google Identity Services | JWT tokens, password hashing, OAuth |
| **AI** | Gemini API (genai), Groq API (Llama) | Test case generation from problem specs |
| **Execution** | Docker (local) or remote sandbox | Isolated `go test` / `python3` execution |
| **Real-time** | gorilla/websocket, in-memory pub/sub | Live admin dashboard updates |
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4 | App Router, server components, shadcn/ui |
| **Editor** | Monaco Editor (local workers) | In-browser Go & Python code editing |
| **Sandbox** | Standalone Go binary (zero deps) | Railway-hosted Go + Python execution |

---

## Repository Structure

```
koder/
├── cmd/server/main.go                        # Entry point: server bootstrap, graceful shutdown
├── internal/
│   ├── api/                                   # HTTP handlers (chi router)
│   │   ├── router.go                          # Route registration, middleware wiring, lifecycle
│   │   ├── auth.go                            # POST /auth/register, /login, /google, /logout, check-username
│   │   ├── me.go                              # GET /me, PUT /me/username, POST /me/delete-account
│   │   ├── change_password.go                 # POST /auth/change-password, /verify-pin, /set-pin
│   │   ├── pin_reset.go                       # POST /auth/forgot-password-pin, /reset-password-pin
│   │   ├── password_reset.go                  # POST /auth/forgot-password, /reset-password (email-based)
│   │   ├── problems.go                        # GET /problems, GET /problems/:slug
│   │   ├── submissions.go                     # POST /submit (rate-limited, scoring)
│   │   ├── test.go                            # POST /test (no-scoring execution)
│   │   ├── admin.go                           # Admin endpoints: ingest, enrich, stats, publish, visibility
│   │   ├── leaderboard.go                     # GET /leaderboard?period=
│   │   ├── profile.go                         # GET/PUT /me/profile
│   │   ├── community.go                       # GET community solutions, POST/DELETE likes
│   │   ├── contributions.go                   # POST /user-problems, GET /me/contributions
│   │   ├── activity.go                        # GET /me/activity?year=
│   │   ├── notifications.go                   # GET /notifications, POST read-all, POST read
│   │   ├── feedback.go                        # POST /feedback, GET admin/mine, PATCH status
│   │   ├── broadcasts.go                      # CRUD + dismiss for broadcast announcements
│   │   ├── cache.go                           # In-memory response cache with TTL + stop channel
│   │   ├── ws.go                              # WebSocket upgrade handler (gorilla/websocket)
│   │   ├── middleware.go                      # AuthMiddleware, AdminOnly, RateLimit, CORS, Recovery, SecurityHeaders
│   │   └── responses.go                       # RespondSuccess, RespondError shared helpers
│   ├── store/                                 # Database access layer (pgx/v5)
│   │   ├── store.go                           # Store interface (full DB contract) + PostgresStore impl
│   │   ├── types.go                           # All data types: User, Problem, Submission, Progress, etc.
│   │   ├── errors.go                          # FriendlyError type, unique constraint violation mapping
│   │   ├── users.go                           # CreateUser, GetUserBy*, LinkGoogleToUser, DeleteUser
│   │   ├── problems.go                        # ListVisibleProblems, GetProblemBySlug, Upsert/Update
│   │   ├── submissions.go                     # CreateSubmission, get for community/reports
│   │   ├── progress.go                        # UpsertProgress, GetSolvedCount, CalculateStreak
│   │   ├── testcases.go                       # GetTestCasesForProblem, UpsertTestCasesForProblem
│   │   ├── admin.go                           # GetAdminStats, LogActivity, PublishAllDrafts
│   │   ├── feedback.go                        # CreateFeedback, GetAdmin/User Feedback, Counts, ProblemReports
│   │   ├── broadcasts.go                      # Create/Get/Deactivate/Activate/Delete/Dismiss broadcasts
│   │   ├── notifications.go                   # Create, GetUnread, GetRecent, MarkRead, NotifyAllUsers
│   │   ├── user_problems.go                   # Community contribution CRUD + approve/reject
│   │   ├── profile.go                         # GetFullProfile, GetModuleProficiency, GetRecentSubmissions
│   │   ├── token_blacklist.go                 # JWT revocation for logout
│   │   └── password_reset.go                  # PIN + email password reset tokens
│   ├── executor/                              # Code execution engine
│   │   ├── executor.go                        # Execute() and ExecuteVisibleOnly() — orchestrator
│   │   ├── parser.go                          # ParseTestOutput — GOT/WANT regex extraction
│   │   ├── sandbox.go                         # PrepareSandbox — temp dir setup, file writes
│   │   ├── sandbox_client.go                  # HTTP client for remote Railway sandbox
│   │   ├── templates.go                       # Go text/template for main_test.go generation
│   │   └── types.go                           # ExecutionRequest, ExecutionResult, TestResult
│   ├── enricher/enricher.go                   # AI test generation (Gemini + Groq providers)
│   ├── broker/broker.go                       # In-memory pub/sub for WebSocket events
│   ├── parser/parser.go                       # GitHub YAML curriculum parser
│   ├── auth/
│   │   ├── jwt.go                             # GenerateToken, ValidateToken, SetAuthCookie
│   │   ├── oauth.go                           # Google ID token verification (JWKS)
│   │   └── password.go                        # HashPassword, CheckPassword (bcrypt)
│   └── config/config.go                       # Env var loading, startup validation, defaults
├── frontend/                                  # Next.js 15 App Router
│   ├── app/
│   │   ├── layout.tsx                         # Root layout: fonts, metadata, providers
│   │   ├── page.tsx                           # Landing page (redirects to /landing)
│   │   ├── not-found.tsx                      # Custom 404 with Terminal icon + actions
│   │   ├── globals.css                        # Tailwind CSS 4 imports + theme variables
│   │   ├── landing/page.tsx                   # Marketing landing page
│   │   ├── oauth/callback/page.tsx            # OAuth callback handler
│   │   ├── (auth)/                            # Unauthenticated routes
│   │   │   ├── layout.tsx                     # Auth pages layout
│   │   │   ├── login/page.tsx                 # Login page (Google-first + email form)
│   │   │   ├── register/page.tsx              # Register page (Google-first + form)
│   │   │   ├── forgot-password/page.tsx       # PIN-based forgot password flow
│   │   │   ├── reset-password/page.tsx        # Password reset from token
│   │   │   └── onboarding/page.tsx            # Post-registration username/student_id setup
│   │   ├── (main)/                            # Authenticated routes
│   │   │   ├── layout.tsx                     # Main layout: TopNav + BroadcastBanner
│   │   │   ├── home/page.tsx                  # Dashboard: problem grid, module cards, pagination
│   │   │   ├── leaderboard/
│   │   │   │   ├── page.tsx                   # Leaderboard server component
│   │   │   │   ├── LeaderboardClient.tsx      # Client component with period filter
│   │   │   │   ├── loading.tsx                # Skeleton loading state
│   │   │   │   └── error.tsx                  # Error boundary
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx                   # Profile server component
│   │   │   │   ├── ProfileClient.tsx          # Profile with tabs, stats, activity
│   │   │   │   ├── loading.tsx                # Skeleton loading
│   │   │   │   ├── error.tsx                  # Error boundary
│   │   │   │   └── components/
│   │   │   │       ├── ProfileHeader.tsx      # Avatar, name, rank, XP
│   │   │   │       ├── StatsOverview.tsx      # Solved, streak, best runtime
│   │   │   │       ├── ProgressMetrics.tsx    # Difficulty breakdown charts
│   │   │   │       ├── Achievements.tsx       # Achievement badges grid
│   │   │   │       ├── RecentActivity.tsx     # Last submissions list
│   │   │   │       ├── ActivityFeed.tsx       # User activity timeline
│   │   │   │       ├── ContributionGraphSection.tsx  # GitHub-style heatmap
│   │   │   │       └── MyContributions.tsx    # User-submitted problem list
│   │   │   ├── settings/page.tsx              # Settings: profile, security, notifications tabs
│   │   │   ├── contribute/page.tsx            # Community problem contribution form
│   │   │   ├── problems/[slug]/success/page.tsx  # Post-submission success screen
│   │   │   └── admin/
│   │   │       ├── page.tsx                   # Admin dashboard: tabs for each section
│   │   │       ├── FeedbackPanel.tsx          # Feedback list with status filters
│   │   │       ├── BroadcastPanel.tsx         # Broadcast CRUD with toggle switches
│   │   │       ├── PendingContributions.tsx   # Community problem approval queue
│   │   │       ├── ProblemEditPanel.tsx       # Full problem editor with preview
│   │   │       └── ProblemReports.tsx         # Bug reports grouped by problem
│   │   ├── problems/[slug]/
│   │   │   ├── page.tsx                       # Workspace server component
│   │   │   ├── DynamicWorkspace.tsx           # Client component wrapper (next/dynamic)
│   │   │   └── ProblemWorkspaceClient.tsx     # Monaco editor, submit/test, results
│   │   └── (legal)/
│   │       ├── layout.tsx                     # Legal pages layout
│   │       ├── privacy/page.tsx               # Privacy policy
│   │       └── terms/page.tsx                 # Terms of service
│   ├── components/
│   │   ├── BroadcastBanner.tsx                # Color-coded dismissable banner with 5s polling
│   │   ├── FeedbackButton.tsx                 # Floating feedback modal (general/bug/feature)
│   │   ├── GoogleLinkBanner.tsx               # Amber banner to link Google account
│   │   ├── LandingContent.tsx                 # Landing page marketing content
│   │   ├── TestResultPanel.tsx                # LCS-based unified diff display
│   │   ├── multi-step-loader-demo.tsx         # Loading animation demo
│   │   ├── auth/                              # Auth form components
│   │   │   ├── google-button.tsx              # Dark Google Sign-In button with SVG
│   │   │   ├── bottom-gradient.tsx            # Amber gradient hover animation
│   │   │   ├── label-input-container.tsx      # Input + label spacing (Aceternity)
│   │   │   ├── auth-divider.tsx               # "or" divider with border
│   │   │   └── index.ts                       # Re-exports
│   │   ├── base/avatar/avatar.tsx             # Avatar with src/initials fallback + verified gold badge
│   │   ├── base/input/pin-input.tsx           # OTP-based PIN input with mask support
│   │   ├── dashboard/ModuleCards.tsx          # Module grid with images, loading skeleton
│   │   ├── kibo-ui/
│   │   │   ├── code-block/index.tsx           # Shiki syntax highlighting component
│   │   │   ├── code-block/server.tsx          # Server-side code block rendering
│   │   │   └── contribution-graph/index.tsx   # GitHub-style contribution heatmap
│   │   ├── layout/TopNav.tsx                  # Top navigation: logo, links, notifications, user menu
│   │   └── ui/                                # shadcn/ui components
│   │       ├── avatar.tsx, badge.tsx, button.tsx, card.tsx
│   │       ├── dialog.tsx, dropdown-menu.tsx, input.tsx
│   │       ├── input-otp.tsx, label.tsx, progress.tsx
│   │       ├── select.tsx, tabs.tsx, textarea.tsx
│   │       ├── tooltip.tsx, activity-gauge.tsx
│   │       └── multi-step-loader.tsx
│   ├── hooks/
│   │   ├── use-google-one-tap.ts              # Shared GIS singleton (init once, prompt + renderButton)
│   │   ├── use-has-mounted.ts                 # SSR-safe mounted check (replaces useState+useEffect pattern)
│   │   └── use-mobile.ts                      # Mobile viewport detection
│   ├── lib/
│   │   ├── api.ts                             # fetchApi wrapper + all endpoint functions
│   │   ├── types.ts                           # TypeScript interfaces matching backend
│   │   ├── utils.ts                           # cn(), getUserColor(), format helpers
│   │   ├── cache.ts                           # sessionStorage cache with 30s TTL
│   │   ├── event.ts                           # useWebSocket hook with auto-reconnect
│   │   ├── achievements.ts                    # Achievement definitions and logic
│   │   ├── UserContext.tsx                     # Auth state context provider
│   │   ├── useNotifications.ts                # Notification polling hook
│   │   ├── toast.tsx                          # Sonner toast setup
│   │   └── index.ts                           # Re-exports
│   ├── styles/
│   │   ├── globals.css                        # Global styles
│   │   ├── theme.css                          # Theme variables
│   │   └── typography.css                     # Typography scale
│   ├── scripts/copy-monaco.mjs                # Copy Monaco workers to public/vs/
│   ├── public/
│   │   ├── logo.png                           # App logo
│   │   ├── modules/*.webp                     # Module card images (13 modules, WebP)
│   │   └── vs/                                # Local Monaco Editor workers
│   ├── next.config.ts                         # Next.js config with CSP headers
│   ├── tailwind.config.ts                     # Tailwind config (v4 via v3 compat)
│   ├── tsconfig.json                          # TypeScript config
│   ├── postcss.config.mjs                     # PostCSS config
│   ├── components.json                        # shadcn/ui config
│   └── package.json                           # Dependencies and scripts
├── sandbox/                                   # Remote code execution service (Railway)
│   ├── main.go                                # HTTP server: /health, /version, /execute
│   ├── ratelimit.go                           # Per-IP sliding window: 10 req/min
│   ├── secure.go                              # Pre-exec malicious code validation
│   ├── secure_unix.go                         # setrlimit, process group isolation
│   ├── secure_other.go                        # Noop for non-Unix platforms
│   ├── Dockerfile                             # Two-stage ARM64 build
│   └── go.mod                                 # Standalone module, zero external deps
├── migrations/                                # Database migrations (ordered, idempotent)
│   ├── 001_init.sql                           # Core schema: users, problems, submissions, progress
│   ├── 002_indexes.sql                        # Performance indexes
│   ├── 003_activity_logs.sql                  # activity_logs table
│   ├── 005_community_contributions.sql        # user_problems table
│   ├── 006_notifications.sql                  # notifications table
│   ├── 007_submission_likes.sql               # submission_likes table
│   ├── 008_user_profile.sql                   # Profile fields (bio, etc.)
│   ├── 009_get_full_profile.sql               # Full profile stored proc
│   ├── 010_add_gitea_auth.sql                 # Gitea OAuth fields (legacy)
│   ├── 011_add_gitea_token.sql                # Gitea token storage
│   ├── 012_add_google_auth.sql                # Google OAuth fields
│   ├── 013_fix_rank_tiebreaker.sql            # Rank ordering fix
│   ├── 014_feedback.sql                       # feedback table with type/priority/status/screenshot
│   ├── 015_broadcasts.sql                     # broadcasts + user_broadcast_status tables
│   ├── 016_add_streak_index.sql               # Composite index for streak queries
│   ├── 017_optimization_indexes.sql           # 16 performance indexes
│   ├── 019_seed_problems1.sql                 # 45 problems: math-recursion, arrays-strings, data-structures
│   ├── 019_seed_problems2.sql                 # 45 problems: bit-manipulation, sorting-searching, pointers
│   ├── 019_seed_problems3.sql                 # 45 problems: strings-runes, concurrency, dynamic-programming
│   ├── 019_seed_problems4.sql                 # 45 problems: error-handling, hashmaps-sets, linked-lists, trees-graphs
│   ├── 020_token_blacklist.sql                # JWT blacklist table
│   ├── 021_password_reset.sql                 # Password reset tokens table
│   ├── 022_add_pin_hash.sql                   # pin_hash column for PIN auth
│   ├── 023_split_problem_fields.sql           # constraints + learning_objective columns
│   ├── 024_add_username_set.sql               # username_set flag for onboarding
│   ├── 025_report_issue_fields.sql            # problem_slug, code_snippet, error_message on feedback
│   └── 026_output_logs_ttl.sql                # TTL cleanup for old output logs
├── scripts/
│   ├── reset_data.sql                         # Safe DELETE-order data reset (keeps users)
│   ├── setup-docker-cache.sh                  # Docker build cache setup
│   └── transform-seeds.mjs                    # Seed data transformation script
├── cmd/server/main.go                         #[symlink] Entry point
├── go.mod                                     # Go module definition
├── go.sum                                     # Go dependency checksums
├── Procfile                                   # Render/Heroku process definition
├── build.sh                                   # Deployment build script
├── .env.example                               # Environment variable template
├── .github/workflows/ci.yml                   # CI pipeline
├── .github/copilot-instructions.md            # GitHub Copilot context
└── BRAIN.md                                   # Architecture decisions log
```

---

## Architecture

### Request Lifecycle

```
Client → chi Router → Middleware Stack → Handler → Store → PostgreSQL
                                                 → Executor → Docker/Sandbox
                                                 → Enricher → Gemini/Groq
                                                 → Broker → WebSocket clients
```

### Middleware Chain (in order)

| Middleware | Source | Purpose |
|---|---|---|
| `RecoveryMiddleware` | `middleware.go:15` | Catches panics → JSON 500 |
| `CORSMiddleware` | `middleware.go:62` | Cross-origin headers for frontend |
| `SecurityHeadersMiddleware` | `middleware.go:120` | CSP, X-Frame-Options, etc. |
| `BodySizeLimitMiddleware` | `middleware.go:143` | Per-route body size limits (256KB–10MB) |
| `AuthMiddleware` | `middleware.go:29` | JWT validation, sets `user_id` in context |
| `AdminOnly` | `middleware.go:105` | Role check: admin required |
| `VerifiedContributorOnly` | `middleware.go:113` | Role check: verified_contributor+ |
| `RateLimitMiddleware` | `middleware.go:195` | Per-user sliding window (5 req/45s) |
| `IPRateLimiter` | `middleware.go:170` | Per-IP auth endpoint limiter (10 req/min) |

---

## Core Pipelines

### 1. Ingest Pipeline (`admin.go` → `parser.go` → `store.go`)
```
POST /admin/ingest { repo_url }
  → Fetch GitHub YAML curriculum
  → Parse YAML into Problem structs
  → SHA256 hash for idempotency check
  → Upsert into `problems` table (visible=false, draft)
  → Log activity
```

### 2. Enrich Pipeline (`enricher.go` → Gemini/Groq)
```
POST /admin/enrich (single) | POST /admin/enrich-all (batch)
  → Fetch problems needing enrichment (source_hash mismatch)
  → Rate limit: 30s Gemini / 2s Groq between calls
  → Send raw README to AI with structured schema
  → Parse ResponseSchema JSON output
  → Validate: title, func_name, 3 hints, 5+ test cases
  → Upsert enriched problem + test cases in single transaction
  → Cache result via source_hash
```

### 3. Execute Pipeline (`executor.go` → Docker/Sandbox)
```
POST /submit (scoring) | POST /test (no-score)
  → Acquire semaphore slot (max 6 concurrent)
  → Fetch problem + test cases from DB
  → Format test case inputs as Go literals
  → Generate main_test.go via text/template
  → Write solution.go + main_test.go to temp dir
  → Execute:
      PRIMARY: HTTP POST to remote sandbox (Railway)
      FALLBACK: docker run golang:1.23-alpine (local)
  → Parse `go test -v` output (GOT/WANT regex)
  → Classify: passed/failed/compiler_error/timeout
  → Record submission + update progress in DB
  → Return ExecutionResult with per-test-case diff
```

---

## Database Schema

### Tables (`migrations/001_init.sql` + incremental)

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | Accounts & auth | id, username, email, password, role, xp, pin_hash, google_id, username_set, color_index |
| `problems` | Exercise definitions | id, slug, module, title, statement, func_name, return_type, param_types, hints, difficulty, xp_reward, tags, visible, source_hash, constraints, learning_objective |
| `test_cases` | AI-generated test data | id, problem_id, input (JSON), expected, is_hidden, ordinal |
| `submissions` | Student solution attempts | id, user_id, problem_id, code, status, passed_count, total_count, output_logs, runtime_ms |
| `progress` | Per-user problem state | user_id + problem_id (PK), solved, stars, attempts, best_runtime, xp_awarded |
| `activity_logs` | Admin audit trail | id, type, message, color, icon |
| `user_problems` | Community contributions | id, user_id, slug, title, statement, test_cases (JSON), status (pending/approved/rejected) |
| `notifications` | User alerts | id, user_id, type, message, related_id, is_read |
| `submission_likes` | Community solution likes | user_id + submission_id (PK) |
| `feedback` | Bug reports & feature requests | id, type, priority, status, screenshot_url, problem_slug, code_snippet, error_message |
| `broadcasts` | System-wide announcements | id, type, priority, title, message, action_label/url, active |
| `user_broadcast_status` | Per-user dismissal tracking | user_id + broadcast_id (PK), dismissed_at |
| `password_reset_tokens` | Email-based password reset | email, token_hash, expires_at, used |
| `token_blacklist` | JWT revocation | jti, expires_at |

### Storage Rules
- 500MB hard limit: no JSONB bloat, normalized schema
- All SELECT queries have LIMIT (100-200 per table)
- Composite indexes for all query patterns (migration 017)

---

## API Endpoints

### Auth (IP rate-limited: 10 req/min)
| Method | Path | Handler | Description |
|---|---|---|---|
| POST | /auth/register | `auth.go:Register` | Create account (name, email, password, PIN); returns JWT with onboarding=true |
| POST | /auth/login | `auth.go:Login` | JWT token (accepts username/email/student_id) |
| POST | /auth/google | `auth.go:GoogleAuth` | Google Sign-In with ID token; 404 if not linked |
| POST | /auth/complete-onboarding | `auth.go:CompleteOnboarding` | Set username + student_id post-registration |
| POST | /auth/complete-google | (alias) | Delegates to CompleteOnboarding |
| POST | /auth/link-google | `auth.go:LinkGoogle` | Link Google to existing authenticated user |
| POST | /auth/forgot-password | `password_reset.go:ForgotPassword` | Email-based reset (Resend API) |
| POST | /auth/reset-password | `password_reset.go:ResetPassword` | Complete email reset with token |
| POST | /auth/forgot-password-pin | `pin_reset.go:ForgotPasswordPin` | PIN-based: email + PIN → short-lived JWT (5 min) |
| POST | /auth/reset-password-pin | `pin_reset.go:ResetPasswordPin` | PIN-based: JWT + new password |
| POST | /auth/change-password | `change_password.go:ChangePassword` | Authenticated: verify PIN + set new password |
| POST | /auth/verify-pin | `change_password.go:VerifyPin` | Verify current PIN |
| POST | /auth/set-pin | `change_password.go:SetPin` | Set initial PIN |
| POST | /auth/logout | `auth.go:Logout` | Revoke JWT (blacklist) |
| GET | /auth/check-username | `auth.go:CheckUsername` | Username availability (public) |

### User (authenticated)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /me | `me.go:GetMe` | Current user with stats, google_linked, username_set |
| PUT | /me/username | `me.go:SetUsername` | One-time username set (403 if already set) |
| POST | /me/delete-account | `me.go:DeleteAccount` | Transactional cascade delete |
| GET | /me/profile | `profile.go:GetProfile` | Full profile with rank, stats, module proficiency |
| PUT | /me/profile | `profile.go:UpdateProfile` | Update name and bio |
| GET | /me/activity | `activity.go:GetActivity` | Contribution graph data by year |
| GET | /me/contributions | `contributions.go:GetMyContributions` | User's submitted problems |

### Problems (authenticated)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /problems | `problems.go:ListVisibleProblems` | All visible problems (paginated, with solved status) |
| GET | /problems/:slug | `problems.go:GetProblemBySlug` | Problem details + test cases + user progress |
| POST | /submit | `submissions.go:Submit` | Submit code for scoring (rate-limited: 5 req/45s) |
| POST | /test | `test.go:Test` | Test code without scoring or progress update |

### Community (authenticated)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /problems/:slug/community-solutions | `community.go:GetCommunitySolutions` | Top solutions for a problem |
| GET | /best-practices | `community.go:GetBestPractices` | Best practice solutions across all problems |
| POST | /submissions/:id/like | `community.go:LikeSubmission` | Like a solution |
| DELETE | /submissions/:id/like | `community.go:UnlikeSubmission` | Unlike a solution |

### Contributions (verified_contributor+)
| Method | Path | Handler | Description |
|---|---|---|---|
| POST | /user-problems | `contributions.go:PostContribution` | Submit a community problem |

### Notifications (authenticated)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /notifications | `notifications.go:GetUnreadNotifications` | Unread notifications count + list |
| GET | /notifications/recent | `notifications.go:GetRecentNotifications` | Last 20 notifications (read + unread) |
| POST | /notifications/read-all | `notifications.go:MarkAllAsRead` | Mark all as read |
| POST | /notifications/:id/read | `notifications.go:MarkAsRead` | Mark single as read |

### Broadcasts
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /me/broadcasts | `broadcasts.go:ListActive` | Active non-dismissed broadcasts |
| POST | /me/broadcasts/:id/dismiss | `broadcasts.go:Dismiss` | Dismiss broadcast for current user |

### Feedback (authenticated)
| Method | Path | Handler | Description |
|---|---|---|---|
| POST | /feedback | `feedback.go:Submit` | Submit feedback/bug report (10MB limit) |
| GET | /feedback/mine | `feedback.go:ListMine` | User's own submissions |

### Leaderboard (authenticated)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /leaderboard | `leaderboard.go:GetLeaderboard` | Top 100 by XP; ?period=all|weekly|monthly |

### WebSocket (authenticated)
| Method | Path | Handler | Description |
|---|---|---|---|
| GET | /ws | `ws.go:ServeHTTP` | WebSocket upgrade, subscribes to broker events |

### Admin (admin-only)
| Method | Path | Handler | Description |
|---|---|---|---|
| POST | /admin/ingest | `admin.go:Ingest` | Trigger GitHub YAML ingest |
| POST | /admin/enrich | `admin.go:Enrich` | Enrich single problem via AI |
| POST | /admin/enrich-all | `admin.go:EnrichAll` | Batch enrich all pending problems |
| GET | /admin/stats | `admin.go:GetAdminStats` | Dashboard stats |
| GET | /admin/activity | `admin.go:GetAdminActivity` | Recent activity log |
| GET | /admin/problems | `admin.go:ListAllProblems` | All problems (including invisible) |
| PATCH | /admin/problems/:id/visibility | `admin.go:ToggleVisibility` | Toggle problem visibility |
| PUT | /admin/problems/:id | `admin.go:UpdateProblem` | Update problem fields (partial) |
| POST | /admin/problems/publish-all | `admin.go:PublishAllDrafts` | Single UPDATE all invisible → visible |
| GET | /admin/user-problems/pending | `admin.go:ListPendingUserProblems` | Pending community submissions |
| PATCH | /admin/user-problems/:id/approve | `admin.go:ApproveUserProblem` | Approve + notify all users |
| PATCH | /admin/user-problems/:id/reject | `admin.go:RejectUserProblem` | Reject with admin notes |
| POST | /admin/broadcasts | `broadcasts.go:Create` | Create broadcast + notify all users |
| GET | /admin/broadcasts | `broadcasts.go:ListAll` | All broadcasts (200 limit) |
| PATCH | /admin/broadcasts/:id/deactivate | `broadcasts.go:Deactivate` | Deactivate broadcast |
| PATCH | /admin/broadcasts/:id/activate | `broadcasts.go:Activate` | Activate broadcast |
| DELETE | /admin/broadcasts/:id | `broadcasts.go:Delete` | Delete broadcast permanently |
| GET | /admin/feedback | `feedback.go:ListAdmin` | Feedback with status filter |
| GET | /admin/feedback/counts | `feedback.go:Counts` | Feedback counts by status |
| PATCH | /admin/feedback/:id | `feedback.go:UpdateStatus` | Update feedback status + notes |
| GET | /admin/problem-reports | `feedback.go:ListProblemReports` | Bug reports grouped by slug |

---

## Key Engine Components

### Enricher (`internal/enricher/enricher.go`)
- **Dual provider:** Gemini (genai SDK, ResponseSchema) or Groq (HTTP, JSON mode)
- **Rate limiting:** 30s Gemini / 2s Groq enforced via mutex + time.Since
- **Retry:** 3 attempts with exponential backoff on transient failures
- **Schema validation:** Requires title, func_name, 3 hints, 5+ test cases, difficulty 1-5
- **Input normalization:** Handles string/object/array test case inputs via recursive JSON marshaling
- **Output cleaning:** Strips markdown fences, extracts first `{...}` JSON block

### Executor (`internal/executor/executor.go`)
- **Semaphore:** Buffered channel (default 6) controls concurrency
- **Type system:** Recursive `formatGoLiteral()` handles primitives, slices, maps
- **Template engine:** Go `text/template` generates deterministic `main_test.go` with `reflect.DeepEqual` for non-primitives
- **Output parsing:** Regex extracts PASS/FAIL, GOT/WANT per ordinal from `go test -v`
- **Sandbox directory:** Per-execution UUID temp dir with `solution.go` + `main_test.go`
- **Build cache isolation:** Per-execution cache directory prevents cross-user poisoning
- **Cleanup:** Deferred `os.RemoveAll` for sandbox + cache directories

### Remote Sandbox (`sandbox/main.go`)
- **Zero external deps:** Standalone Go binary, only std library
- **Pre-exec security:** Blocks `os/exec`, `syscall`, `unsafe`, `net`, filesystem writes
- **Unix isolation:** `setrlimit` (NPROC=6, NOFILE=1024, FSIZE=64MB) + `Setpgid` process group
- **Rate limiter:** Per-IP sliding window, 10 req/min, HTTP 429 with `Retry-After`
- **Health endpoints:** `/health` and `/version` bypass rate limiter

### Broker (`internal/broker/broker.go`)
- **In-memory pub/sub:** Map of client ID → buffered channel (32)
- **Non-blocking publish:** Slow clients miss events (channel full → default case)
- **Events:** `admin.problem.updated`, `admin.broadcast.created/updated/deleted`, `admin.feedback.submitted`, `admin.publish-all`

### WebSocket (`internal/api/ws.go`)
- **Upgrade:** gorilla/websocket with auth middleware
- **Read loop:** Reads control messages (pings/pongs) only
- **Write loop:** Selects on broker channel + ticker for periodic pings
- **Cleanup:** Defers Unsubscribe + close connection

---

## Frontend Architecture

### App Router Structure
- **Root layout** (`layout.tsx`): Providers (UserContext), fonts, metadata, Toast, preconnect
- **Auth layout** (`(auth)/layout.tsx`): Centered card layout for login/register/onboarding
- **Main layout** (`(main)/layout.tsx`): TopNav, BroadcastBanner, FeedbackButton, sidebar
- **Legal layout** (`(legal)/layout.tsx`): Simple prose layout for privacy/terms

### State Management
- **UserContext:** React context with user state, fetchUser on mount, periodic refresh
- **useNotifications:** 5s polling for unread count, markAsRead helper
- **useWebSocket:** Auto-reconnect with exponential backoff (event.ts)
- **SessionStorage cache:** 30s TTL for GET responses (cache.ts)

### Key Components
- **ProblemWorkspaceClient:** Monaco editor (Go language), split pane with TestResultPanel, submit/test buttons with solved guard, confetti on success, report bug dialog
- **ModuleCards:** Image grid with loading skeleton, WebP images, fade-in on load
- **TestResultPanel:** LCS-based unified diff with green/red line highlighting, side-by-side for single-line
- **BroadcastBanner:** Color-coded by type, fit-to-content, 5s polling, per-user dismiss
- **FeedbackButton:** Floating action button, 3-tab modal (General/Bug/Feature), screenshot upload, priority selector
- **TopNav:** Logo, nav links, notification bell with count, user avatar/menu

---

## Configuration & Environment

### Backend (`config.go`)
| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | Supabase PostgreSQL connection string |
| `JWT_SECRET` | — | HS256 signing key (min 32 chars) |
| `GEMINI_API_KEY` | — | Google AI Studio API key |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model name |
| `ENRICHMENT_PROVIDER` | `gemini` | `gemini` or `groq` |
| `GROQ_API_KEY` | — | Groq API key |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model |
| `GOOGLE_CLIENT_ID` | — | Google OAuth client ID |
| `ADMIN_EMAIL` | — | Admin account email |
| `ADMIN_PASSWORD` | — | Admin account password |
| `SANDBOX_URL` | — | Remote sandbox URL (empty = local Docker) |
| `RESEND_API_KEY` | — | Resend email API key |
| `GO_VERSION` | `1.23` | Go version for sandbox execution |
| `EXECUTOR_MAX_CONCURRENCY` | `6` | Max concurrent code executions |
| `EXECUTOR_TIMEOUT_SECONDS` | `30` | Per-execution timeout |
| `DOCKER_IMAGE` | `golang:1.23-alpine` | Sandbox Docker image |
| `SANDBOX_BASE_DIR` | `/tmp/koder-sandbox` | Temp directory for sandbox files |
| `BUILD_CACHE_DIR` | `/tmp/koder-cache` | Go build cache directory |

### Frontend (`next.config.ts`)
| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Backend API base URL |
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
go test ./internal/...              # Unit tests
go test ./internal/executor/...     # Integration tests (requires Docker)
npm run lint                        # ESLint frontend
```

### Database Migrations
```bash
# Add new migration file to migrations/
# Apply via Supabase dashboard SQL editor or CLI
# Never delete/reorder existing migrations
```

### Build & Deploy
```bash
# Backend
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o server cmd/server/main.go
./build.sh  # Full deployment script

# Frontend
cd frontend
npm run build   # Builds static + server components
```

---

## Constraints & Performance Mitigations

| Constraint | Mitigation |
|---|---|
| **50 Gemini calls/day** | SHA256 change detection, cached results, skip-reenrich |
| **30s Gemini rate limit** | Mutex + time.Sleep between calls |
| **6 concurrent executions** | Buffered channel semaphore |
| **10 DB pool connections** | pgxpool MaxConns=10, MinConns=2, 30m lifetime |
| **500MB Postgres limit** | Normalized schema, no JSONB bloat, LIMIT on all queries |
| **Unbounded output** | 100KB cap on execution output, output_logs TTL |
| **ARM64 only** | All Docker images multi-arch or explicitly ARM64 |
| **5 req/45s submissions** | Per-user sliding window rate limiter |
| **JWT revocation** | Token blacklist table with cleanup goroutine |
| **Cache invalidation** | user-updated event clears sessionStorage keys |
| **WebSocket reliability** | Exponential backoff reconnect, 60s fallback polling |

---

## Useful Links

- **Repository:** https://github.com/jerryjuche/koder
- **Frontend:** Deployed on Vercel (`vercel deploy`)
- **Backend:** Render/Oracle Cloud Ampere A1
- **Database:** Supabase dashboard
- **Issues:** Linear "KODER" project

---

## Session Log

### 2026-07-09 — Full codebase indexing on python-curricula branch

**Context:** Switched from `update` branch to `origin/python-curricula`. All 12 multi-language phases complete. 122 tests, `go vet` clean.

**Key differences from `update`:**
- `sandbox/pyrunner.go` — Python test runner with AST validation
- `sandbox/runtest_go.go` — Extracted Go runner
- `internal/executor/executor.go` — `executePython`, `formatPythonLiteral`, `resolveProblemLanguageMeta`
- `internal/executor/templates.go` — `pythonTestTemplate`
- `internal/enricher/enricher.go` — Dual Go/Python system prompt, `toSnakeCase`, `toPythonType`, fallback
- `internal/store/types.go` — `PrimaryLanguage`, `LanguageVersions`, `LanguageSpec`
- `migrations/027_language_versions.sql` — Schema for multi-language
- `migrations/028_backfill_language_versions.sql` — Backfill for 180 seed problems
- `internal/api/me.go` — `UpdateLanguage` handler
- `internal/api/problems.go` — `?language=` query filter
- `internal/api/submissions.go`, `test.go` — Language validation/inference
- `internal/api/admin.go` — `language_versions` in write paths
- `frontend/components/LanguageSelector.tsx` — Onboarding language selection
- `frontend/lib/types.ts`, `api.ts`, `UserContext.tsx` — Language-aware state
- `frontend/components/layout/TopNav.tsx` — Language switcher dropdown
- `frontend/app/(main)/home/page.tsx` — Language filter tabs (All/Go/Python)
- `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` — Dynamic Monaco language/scaffold
- `PROGRESS.txt` — Completion tracking

**Sandbox Python additions:**
- `sandbox/Dockerfile` — Added `python3` install
- `sandbox/secure.go` — `pythonDangerousPatterns` + `validatePythonCode`
- `sandbox/secure_unix.go` — `setPythonRlimits` (RLIMIT_AS=512MB)
- `sandbox/main.go` — Language routing in `executeHandler`

### 2026-07-08 — Professional UI polish & fixes

**Changes:**
- **ProblemReports.tsx** — Full redesign: grouped/flat view toggle, search, resolved filter, priority badges, inline status buttons (New/In Progress/Resolved), expanded detail cards with error/code/screenshot sections, `timeAgo` helper, collapsible problem groups
- **Avatar component** — Created `components/base/avatar/avatar.tsx` with `src`/`initials` fallback, `size` (sm/md/lg/xl), `verified` prop (custom gold SVG circle badge with white checkmark, dark ring overlap)
- **TopNav.tsx** — Replaced inline avatar rendering with Avatar component, added gold "Admin" label + verified badge for admin users
- **ProfileHeader.tsx** — Replaced inline avatar with Avatar component, shows verified badge for admin users
- **Settings page** — Professional polish: profile preview card with avatar, icon-labeled form sections, char counter on bio, username setup flow with info box, framer-motion tab animations, Security section redesigned with icon headers, polished Danger Zone
- **Contribution graph year fix** — `index.tsx`: changed `data[0].date` → `data[data.length - 1].date` to show current year (2026) instead of last year
- **Notification cache bug** — `useNotifications.ts`: added `clearCache("/notifications")` after `markAsRead`/`markAllAsRead` to prevent stale sessionStorage cache from restoring old unread notification state after mutation

### 2026-07-08 — Multi-language audit bugfixes

**Changes:**
- **Phase 11 bugfix** — `ProblemWorkspaceClient.tsx:56`: fixed `DEFAULT_CODE` → `GO_CODE` (undefined constant)
- **Phase 3 critical gap** — `submit.go:89-96`, `test.go:73-80`: infer language from `LanguageVersions` when `problem.Language` is empty (handles Python-only problems)
- **Phase 2 Gap 1** — `problems.go:99`: added `language_versions` to `GetProblemBySlug` JSON response payload
- **Phase 2 language filter** — `problems.go:44-53`: `ListVisibleProblems` now checks `LanguageVersions` when `Language` column is empty

### 2026-07-08 — Professional fixes for multi-language pipeline

**Changes:**
- **Silent error handling** — All 7 `json.Unmarshal` calls for `language_versions` now log failures via `slog.Warn` instead of silently ignoring errors (added `unmarshalLanguageVersions` helper)
- **Deterministic language inference** — `submit.go` + `test.go`: when inferring language from `LanguageVersions`, prefer "go" → "python" → first key instead of non-deterministic map iteration
- **Write path completeness** — Added `language_versions` column to `UpsertProblem`, `UpsertEnrichedProblem`, `UpdateProblem`, and community contribution insert queries (was missing from all write paths)
- **Executor metadata resolution** — Added `resolveProblemLanguageMeta()` helper called in both `Execute` and `ExecuteVisibleOnly`; resolves `FuncName`/`ReturnType`/`ParamTypes` from `LanguageVersions` before routing to language-specific executor
- **Admin handler** — `UpdateProblem` now accepts and persists `language_versions` field

### 2026-07-08 — Bugfix sweep: Phase 4 enricher + 8 error fixes

**Phase 4 — Enricher now populates `LanguageVersions`:**
- Added `LanguageVersions` field to `enrichedResponse` struct (`enricher.go:44`)
- Updated system prompt example JSON and production rules to include `language_versions`
- `EnrichProblem` builds `LanguageVersions` from AI response or falls back to top-level Go fields (`enricher.go:187-197`)
- Added validation requiring Go entry with non-empty `func_name` (`enricher.go:601-608`)

**Bug fixes from comprehensive audit:**

| Severity | File | Bug | Fix |
|---|---|---|---|
| **CRITICAL** | `admin.go:154-163` | Enrich/EnrichAll discard AI-generated `LanguageVersions` | Added copy to problem before save |
| **CRITICAL** | `templates.go:44` | Python `str(result) == str(expected)` fails for bools/strings/complex types | Switched to `json.loads(expected)` + `==` |
| **BUG** | `ProblemWorkspaceClient.tsx:702` | Language toggle doesn't reset code scaffold | Added `setCode(newLang === "python" ? PYTHON_CODE : GO_CODE)` |
| **BUG** | `ProblemWorkspaceClient.tsx:320` | Bug report always uses ```go fencing | Changed to `` ```${activeLanguage} `` |
| **MEDIUM** | `submissions.go:83-88` | Unmarshal runs before Scan error check | Moved after `if err != nil` |
| **MEDIUM** | `ProblemWorkspaceClient.tsx:706` | `updatePrimaryLanguage()` called without `await` | Added `await` |
| **LOW** | `LanguageSelector.tsx:41` | Skip doesn't persist language to backend | Changed to `await setPrimaryLanguage("go")` |
| **LOW** | `user_problems.go:207` | `json.Marshal` error discarded | Now checks err

### 2026-07-08 — Phase 12: Multi-language enrichment

**Changes:**
- **System prompt** — Rewrote from "Go curriculum author" → "programming curriculum author"; example JSON now includes Python entry (`fish_and_chips`, `str`, `["int"]`) alongside Go
- **Production rules** — Rule #11 now **REQUIRED** with both `go` and `python` entries, includes Go→Python type translation table
- **Gemini ResponseSchema** — Added `language_versions` as `TypeObject` with `go` (required) and `python` (optional) sub-objects via reusable `languageSpecSchema()` helper
- **Fallback generation** — AI-provided `language_versions` used when available; fallback now auto-generates Python entry via `toSnakeCase()` (PascalCase→snake_case) and `toPythonType()` (Go types→Python equivalents)
- **Validation** — Requires `language_versions` with at least a `go` entry that has non-empty `func_name` |

### 2026-07-09 — Python compiler_error: formatPythonLiteral + snake_case fallback

**Bug:** All Python submissions returned `compiler_error` even for valid code like `def double_it(x): return x * 2`. Sandbox logs showed "compiler didnt output anything".

**Root causes & fixes:**
1. **Raw JSON → Python literal mismatch** (`executor.go` + `templates.go`): The Python test template embedded raw JSON directly via `test_cases = {{.TestCasesJSON}}`. JSON uses `true`/`false`/`null` but Python requires `True`/`False`/`None`, causing `NameError` at module load time for any boolean/null inputs. The `formatPythonLiteral()` function existed but was dead code (never called). Fixed by replacing `TestCasesJSON` (raw JSON) with `PyTestCases` (pre-formatted Python tuple literals using `formatPythonLiteral()`).
2. **Go camelCase → snake_case fallback** (`executor.go`): When `LanguageVersions["python"]` is missing (e.g., seeds without backfill migration), `problem.FuncName` retained the Go camelCase name (e.g., `doubleIt`), causing `ImportError` since student code uses `def double_it(...)`. Added `goToSnakeCase()` as fallback that's idempotent for already-snake_case names.

### 2026-07-09 — ESLint rule compliance sweep

**Changes:** Fixed 0→0 ESLint errors across the entire frontend (`npx eslint --quiet` passes clean on `app/`, `components/`, `hooks/`, `lib/`).

**Patterns fixed:**
- **`react-hooks/set-state-in-effect`** (~15 files): Replaced synchronous `setState` in `useEffect` bodies with either lazy `useState` initializers (for `localStorage`/`sessionStorage`/URL param reads) or render-time `useState` tracking of previous values for prop-derived state (e.g., `[prevKey, setPrevKey] = useState(prop)` + `if (prop !== prevKey) { setPrevKey(prop); setDerived(…); }`).
- **`react-hooks/refs`** (2 files): Replaced `useRef`-based previous-value tracking with `useState` tracking (refs cannot be accessed during render per React 19 rules).
- **`react-hooks/no-hoisted-functions`** (2 files): Converted hoisted `async function` declarations into `useCallback` defined before use, or into `function` declarations (which are properly hoisted).
- **`react/no-unescaped-entities`** (1 file): Escaped `'` → `&apos;` in JSX.

**New shared hook:** `hooks/use-has-mounted.ts` — SSR-safe mount detection extracted from the repeated `useState(false)` + `useEffect({ setMounted(true) })` pattern found in 4 auth/profile components. Uses a single `// eslint-disable-next-line react-hooks/set-state-in-effect` suppression.

### 2026-07-08 — Comprehensive test suite audit & expansion

**Changes:**
- **`internal/broker/broker_test.go`** (new, 10 tests) — Subscribe uniqueness, Publish delivery to 1/N subscribers, PublishEvent, Unsubscribe (remove + non-existent), slow client buffer overflow, timestamp on publish, concurrent pub/sub
- **`internal/parser/parser_test.go`** (new, 13 tests) — isReadmeFile, detectProblemType, normalizeSlug/module, computeSourceHash, cleanRepoURL, parseGitHubURL (tree/blob/SSH), parseRepoMetadata, parseGitSSHURL, NewParser, IngestGitHubRepo empty URL
- **`internal/auth/oauth_test.go`** (new, 5 tests) — isExpectedAudience, isExpectedIssuer, jwksKeyToPublicKey (real RSA round-trip, invalid base64 modulus/exponent)
- **`internal/store/errors_test.go`** (new, 7 tests) — FriendlyError, NewDuplicate/NotFound/Validation, IsFriendlyError (nil/plain/wrapped), IsUniqueViolation (non-pg/nil)
- **`internal/store/types_test.go`** (new, 2 tests) — FlexibleBool valid + invalid UnmarshalJSON
- **`internal/api/middleware_test.go`** (expanded +23 tests) — RateLimiter (under/over/isolation/window/stop), IPRateLimiter, GetClaims, AdminOnly, VerifiedContributorOnly, BodySizeLimit, SecurityHeaders, RecoveryMiddleware, CORSMiddleware (wildcard/specific/no-origin/OPTIONS/null/multi-origin), IPRateLimiter.Middleware (under/over/extraction), RateLimitMiddleware (no-claims/admin-bypass/under/over)
- **`internal/api/responses_test.go`** (new, 10 tests) — RespondSuccess, RespondCreated, RespondError (with/without details), isHTTPS, SetAuthCookie (HTTP/HTTPS), ClearAuthCookie, ContentType
- **`internal/config/config_test.go`** (expanded +7 tests) — MissingGeminiKey, GroqDefaults, ProviderSelection, ProviderSwitch, InvalidJWTExpiry, EmptyAllowedOrigin, ExecutorTimeout, PythonTimeout, JWTExpiry

**Result:** 122 tests, 0 failures, `go vet` clean across all 8 internal packages

### 2026-07-08 — CI/CD pipeline

**Changes:**
- **`.github/workflows/ci.yml`** (new) — 4-job GitHub Actions workflow:
  - `backend` — `go vet`, `go test` (with minimal env vars), `go build` (main + sandbox)
  - `frontend` — `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run build` (with minimal env vars)
  - `deploy-backend` — Render deploy hook trigger (main branch only, after backend tests pass)
  - `deploy-sandbox` — Railway deploy hook trigger (main branch only, after backend tests pass)
- **`build.sh`** — Updated to build both backend and sandbox with explicit GOOS/GOARCH

### 2026-07-08 — Dual-language seed backfill migration

**Changes:**
- **`migrations/028_backfill_language_versions.sql`** (new) — Backfills the `language_versions` JSONB column for all 180 seed problems that were inserted without it (migration 027 added the column but seeds ran before the backfill could populate them). Adds two PL/pgSQL helpers:
  - `koder_to_snake_case()` — converts PascalCase Go function names to Python snake_case
  - `koder_go_type_to_python()` — translates Go type annotations to Python equivalents
- Runs as an idempotent UPDATE targeting problems with `language = 'go'` that lack a `'python'` key in `language_versions`

### 2026-07-09 — Python sandbox: python3 availability check + meaningful error messages

**Bug:** Railway sandbox returned `compiler_error` with empty `output_logs` when `python3` was unavailable. The sandbox hardcoded `"python3"` everywhere with no fallback, and the `Error` field was never populated in the `ExecuteResponse` for Python (only Go had it via `compileErrorMessage`). The backend had no way to surface the real error.

**Fixes:**

| File | Change |
|---|---|
| `sandbox/pyrunner.go` | Added `findPythonBin()` helper: checks `PATH` for `python3`, falls back to `python`, returns empty string if neither |
| `sandbox/pyrunner.go` | `validatePythonAST()` uses `findPythonBin()` instead of hardcoded `"python3"` |
| `sandbox/pyrunner.go` | `runPythonTests()` uses `findPythonBin()` with early return + clear error response when Python missing; logs binary used; adds `Error` field via `compileErrorMessage()` matching `runGoTests` |
| `internal/executor/executor.go` | Forwards sandbox `Error` to output when `compiler_error` with empty stdout |

**Verification:**
- Go: `go test -count=1 ./...` — 122 tests, 0 failures, `go vet` clean
- Sandbox: `go vet ./...` + `go build` — clean
- Frontend: ESLint — 0 errors, TypeScript — 0 errors, `npm run build` — clean

### 2026-07-09 — Audit-driven critical fixes (sessions 14)

**Context:** Comprehensive audit identified 5 critical issues. 2 were false alarms (rate limiting already present on `/test`, community approval flow correctly preserves `language_versions`). 3 real issues fixed.

**Changes:**

| Issue | File | Fix |
|---|---|---|
| `formatPythonLiteral` null → `NameError` | `internal/executor/executor.go:809-812` | Added early `bytes.Equal(data, []byte("null"))` → `"None"` before type dispatch |
| No timeout on `validatePythonAST` | `sandbox/pyrunner.go:78-80` | Added `context.WithTimeout(context.Background(), 10*time.Second)` with deferred cancel |
| Language toggle loses unsaved code | `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` | Added `scaffoldAtToggle` tracking; shows confirmation dialog when code differs from scaffold; only switches on explicit confirmation |

**Audit findings (2 false alarms):**
- `/test` rate limiting: Already had `RateLimitMiddleware(rateLimiter)` at `router.go:135` (same 5 req/45s as `/submit`)
- Community approvals wiping `language_versions`: Code correctly preserves `language_versions` through approval transaction (only falls back to `generateDualLanguageSpec` when nil/empty)

**New test:** `TestFormatPythonLiteral` (9 cases inc. null/None for all types)

**Verification:**
- Go: `go test -count=1 ./...` — **123 tests, 0 failures**, `go vet` clean
- Sandbox: `go vet ./...` + `go build` — clean
- Frontend: ESLint — 0 errors, TypeScript — 0 errors

### 2026-07-09 — Production Polish: Monitoring, Performance, Error UX, Security (Session 15)

**Monitoring & Observability:**
- **`cmd/server/main.go`** — Switched from `TextHandler` to `JSONHandler` for machine-parseable logs. Added `commit`/`buildAt` ldflags vars. Startup log now includes commit, build time, Go version, arch, OS.
- **`internal/api/middleware.go`** — Added `RequestLoggingMiddleware` (logs method, path, status code, duration_ms, correlation ID via `X-Request-ID` header, remote IP). Uses `generateRequestID()` with crypto/rand (8 bytes → hex). `loggingResponseWriter` wrapper captures status code from `WriteHeader`.
- **`internal/api/router.go`** — `/health` endpoint now includes `db_status` (ping result), `db_ms` (latency), `sandbox_url`, `environment`. New `/version` endpoint returns `commit`, `build`, `go` version.
- **`internal/store/store.go`** — Added `Ping(ctx)` method to `Store` interface and `PostgresStore` (wraps `pool.Ping`).

**Performance:**
- **`internal/api/cache.go`** — Added `leaderboardCache` (30s TTL) and `InvalidateLeaderboardCache()`. Keyed by period (all/weekly/monthly).
- **`internal/api/leaderboard.go`** — Cache-first pattern: returns cached leaderboard when fresh, falls back to DB query.
- **`internal/api/submissions.go`** — `InvalidateLeaderboardCache()` called on solved submission (alongside existing `InvalidateUserCache`).
- **`frontend/lib/useNotifications.ts`** — Polling interval reduced from 5s to 15s (3x fewer DB queries).
- **`frontend/components/BroadcastBanner.tsx`** — Polling interval reduced from 5s to 30s (6x fewer DB queries).

**Error UX:**
- Added 7 new `error.tsx` boundaries: `(main)/`, `home/`, `settings/`, `contribute/`, `admin/`, `problems/[slug]/`, and `global-error.tsx` at root level.
- Added `home/loading.tsx` with skeleton grid (6 problem cards, filter pills, title).

**Security:**
- **`internal/api/middleware.go`** — Added `Content-Security-Policy` header to `SecurityHeadersMiddleware` (default-src 'self'; script/style/font/img/connect-src with Google OAuth support).|

**Verification:**
- Go: `go test -count=1 ./...` — 123 tests, 0 failures, `go vet` clean
- Sandbox: `go vet ./...` + `go build` — clean
- Frontend: ESLint — 0 errors, TypeScript — 0 errors|

### 2026-07-09 — Python compiler error context extraction fix

**Context:** Python compiler errors and tracebacks were lacking line numbers in the backend because the fallback regex was bypassed.

**Changes:**
- `sandbox/main.go`: Updated `isPythonErrorLine` with a robust colon-based heuristic. `compileErrorMessage` now scans bottom-up and extracts exact file/line context via `extractPyFileLine` to match Go's output format.
- `internal/executor/executor.go`: Fixed a variable shadowing bug in the `executePython` path where `sandboxError` was inadvertently scoped to an `if` block, preventing the properly formatted sandbox error from being propagated to the frontend.

**Verification:**
- Go: `go test -count=1 ./...` — **124 tests, 0 failures**, `go vet` clean
- Sandbox: `go vet ./...` + `go build` — clean

### 2026-07-09 — Professional codebase indexing & final polish

**Context:** Comprehensive full-codebase indexing session. Pulled latest (9 new commits since last index: sandbox error messaging, Go logo icons, Python sandbox isolation alignment, language filter bugfix, migration 029, fullscreen toggle, logo fixes).

**New/modified files since last session log:**
| File | Change |
|---|---|
| `sandbox/main.go` | Python error messaging improvements, `use Out.String()` for Go output capture |
| `sandbox/pyrunner.go` | `validatePythonAST` output capture, process group isolation alignment |
| `sandbox/runtest_go.go` | `use Out.String()` for stdout capture |
| `sandbox/secure_unix.go` | Align Python `Setpgid` with Go runner pattern |
| `sandbox/sandbox-runner` | Binary updated (new) |
| `sandbox/security_message_test.go` | New: validates sandbox security messages |
| `internal/executor/executor.go` | `EnhancePythonError` for human-readable Python exceptions with debugging tips |
| `frontend/components/TestResultPanel.tsx` | Show server-provided Python debugging tips |
| `frontend/components/LanguageLogo.tsx` | New: renders Go/Python SVG icons |
| `frontend/public/icons/go.svg` | New: real Go gopher logo (SVG) |
| `frontend/public/icons/python.svg` | New: real Python logo (SVG) |
| `frontend/app/(main)/home/page.tsx` | Language filter bugfix |
| `migrations/029_ensure_language_versions.sql` | New: guarantees every problem has both Go and Python entries |
| `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` | Fullscreen toggle |

**Frontend file inventory (post-indexing):**
- **52 app router files** across 12 route groups (root, landing, oauth, auth, main, home, leaderboard, profile, settings, contribute, admin, problems, legal)
- **37 shared components** (14 shadcn/ui, 5 auth, 3 kibo-ui, 2 base, 7 feature, 1 dashboard, 1 layout, 2 language, 1 demo, 1 test result)
- **3 custom hooks** (use-google-one-tap, use-has-mounted, use-mobile)
- **10 lib modules** (api client w/ 40+ endpoints, types, utils, cache, event/WebSocket, UserContext, useNotifications, toast, achievements, index)
- **3 style files** (globals, theme vars 856 lines, typography 430 lines)

**Backend file inventory (post-indexing):**
- **7 internal packages**: api (24 source files), auth (3), broker (1), config (1), enricher (1), executor (6), parser (1), store (18 source files)
- **13 test files** across 7 packages, 124 tests total
- **29 migrations** from 001_init to 029_ensure_language_versions
- **Sandbox**: 8 source files (zero external dependencies), standalone Go binary
