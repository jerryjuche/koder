# Session Log — July 3, 2026

## Branch
`update`

## What Was Done

### Landing Page Polish
- Replaced plain "Go" text with official Go wordmark SVG (from pkg.go.dev) — same height as surrounding text, proper Go blue `#00ADD8`
- Removed code editor mockup preview from hero section
- Removed "Zero-cost automated Go grading" badge
- Fixed DOM `fill-rule` → `fillRule` for React SVG compliance
- Simplified footer: removed generic SaaS links (Pricing, Documentation, Blog, etc.), replaced with real project links (Problems, Leaderboard, Contribute, GitHub, Privacy, Terms)
- Removed "Oracle free tier" tagline from footer

### Feedback & Bug Report System
- **Migration:** `migrations/014_feedback.sql` — new `feedback` table with type/priority/status/screenshot/anonymous support
- **Backend store:** `internal/store/feedback.go` — `CreateFeedback`, `GetAdminFeedback`, `GetUserFeedback`, `UpdateFeedbackStatus`, `CountFeedbackByStatus`
- **Backend handler:** `internal/api/feedback.go` — `POST /feedback`, `GET /admin/feedback`, `PATCH /admin/feedback/{id}`, `GET /feedback/mine`, `GET /admin/feedback/counts`; Resend email notification via direct HTTP POST
- **Config:** Added `RESEND_API_KEY` env var
- **Frontend component:** `components/FeedbackButton.tsx` — floating FAB in bottom-right, modal with 3 tabs (General/Bug/Feature), priority selector, base64 screenshot upload, anonymous checkbox, thank-you screen
- **Admin component:** `app/(main)/admin/FeedbackPanel.tsx` — status tabs (All/New/In Progress/Resolved), search, expandable rows with screenshot preview, inline status change + admin notes
- **Layout:** Added `<FeedbackButton />` to `app/(main)/layout.tsx` so it appears on all authenticated pages
- **API client:** Added `submitFeedback`, `fetchMyFeedback`, `fetchAdminFeedback`, `fetchAdminFeedbackCounts`, `updateFeedbackStatus` to `lib/api.ts`
- **Types:** Added `FeedbackItem` to `lib/types.ts`

## Files Created
- `migrations/014_feedback.sql`
- `internal/store/feedback.go`
- `internal/api/feedback.go`
- `frontend/components/FeedbackButton.tsx`
- `frontend/app/(main)/admin/FeedbackPanel.tsx`

## Files Modified
- `internal/store/store.go` — added feedback methods to Store interface
- `internal/store/types.go` — added `Feedback`, `NewFeedback` structs
- `internal/api/router.go` — added feedback routes
- `internal/config/config.go` — added `ResendAPIKey`
- `frontend/lib/api.ts` — added 5 feedback API functions
- `frontend/lib/types.ts` — added `FeedbackItem` type
- `frontend/app/(main)/layout.tsx` — added `<FeedbackButton />`
- `frontend/app/(main)/admin/page.tsx` — imported `<FeedbackPanel />`
- `frontend/components/LandingContent.tsx` — landing page polish

## Decisions
- Screenshot stored as base64 in DB (no Supabase Storage dependency)
- Email via direct HTTP POST to Resend API (no SDK dependency)
- Anonymous mode is pseudonymous: user_id stored internally, displayed as "Anonymous" in admin view

### Admin Panel Polish (second pass)
- **Scrollable problem list:** Problem Catalog now `max-h-[420px] overflow-y-auto scrollbar-thin` with sticky thead — no more page-long table push
- **In-app notification on feedback:** `internal/api/feedback.go` calls `NotifyAdmins()` after `CreateFeedback` — admins get real-time notification
- **Reordered layout:** Contributions + Feedback panels moved up, sit side-by-side just below Ingest/Enrich, above Problem Catalog. Grid changed to `lg:grid-cols-4` (3:1 split)
- **Compact variants:** `PendingContributions` and `FeedbackPanel` accept `compact` prop for embedded use — no duplicate headers/borders
- **Professional polish:** Sectioned cards with icons, sticky activity log with max-height, shadow on problem table

## Files Modified
- `internal/api/feedback.go` — added `NotifyAdmins()` call after feedback creation
- `frontend/app/(main)/admin/page.tsx` — reordered layout, scrollable table, 4-col grid, compact components
- `frontend/app/(main)/admin/PendingContributions.tsx` — added `compact` prop
- `frontend/app/(main)/admin/FeedbackPanel.tsx` — added `compact` prop

## Build Verification
- ✅ `go vet ./internal/api/ ./internal/store/` — passes
- ✅ `npx tsc --noEmit` — zero errors

## Next Steps
- Run migration `014_feedback.sql` against the database
- Set `RESEND_API_KEY` and `ADMIN_EMAIL` env vars
- Test feedback submission end-to-end (frontend → backend → database → in-app + email notification)
- Test admin feedback/contributions panels in compact layout

---

# Session Log — July 4, 2026 — Security Hardening Sprint

## Branch
`update` (commit `d54f805`)

## What Was Done — Security Audit Remediation

### Critical (C1–C8)

#### C1 — JWT httpOnly Cookie Migration
- **Backend:** Added `SetAuthCookie`/`ClearAuthCookie` helpers in `internal/api/responses.go` that set `koder_token` httpOnly, Secure, SameSite=Lax cookies
- **All auth handlers** (`Register`, `Login`, `GoogleAuth`, `CompleteOnboarding`, `LinkGoogle`, `Logout`) now set/clear the cookie alongside the JSON response
- **`AuthMiddleware`** (`internal/api/middleware.go`) now reads the token from the `koder_token` cookie as fallback when no `Authorization` header is present
- **Frontend `api.ts`:** `fetchApi` uses `credentials: 'include'` and no longer reads `Authorization` header from localStorage
- **All pages:** Removed `localStorage.setItem('token', ...)` from login, register, onboarding, and oauth/callback pages
- **`fetchUser()`:** No longer checks for localStorage token before calling `/me` — relies on cookie
- **Logout flow:** `TopNav.tsx` and `settings/page.tsx` now call `POST /auth/logout` API (which blacklists the JWT and clears the cookie) instead of `localStorage.removeItem('token')`

#### C3 — Environment Variable Leakage
- **`sandbox/main.go`:** Replaced `os.Environ()` inheritance with a strict whitelist of allowed env vars (`PATH`, `HOME`, `TMPDIR`, `GO_VERSION`)
- **Output cap:** Added 100KB limit on sandbox stdout/stderr to prevent OOM via flooding

#### C6 — Google OAuth Tokeninfo URL Leak
- **`internal/auth/oauth.go`:** Rewrote `VerifyGoogleToken` to use local JWKS signature validation via `github.com/golang-jwt/jwt/v5` instead of `GET https://oauth2.googleapis.com/tokeninfo?id_token=...` (which leaked tokens in server logs and URL-referrer headers)
- Added JWKS endpoint (`https://www.googleapis.com/oauth2/v3/certs`) fetching with caching
- Validates `aud`, `iss`, `exp`, `azp` locally
- Removed `?id_token=` URL entirely — no token leak in logs or HTTP referrers

#### C7 — Password Reset Flow (Missing Feature)
- **Migration:** `migrations/021_password_reset.sql` — `password_reset_tokens` table with `email`, `token_hash`, `expires_at`, `used`
- **Store:** `internal/store/password_reset.go` — `CreatePasswordResetToken`, `GetPasswordResetToken`, `MarkPasswordResetTokenUsed`, `CleanupExpiredPasswordResetTokens`
- **Store interface** (`internal/store/store.go`): Added 5 new methods including `UpdateUserPassword`
- **Store:** `internal/store/users.go` — added `UpdateUserPassword` implementation
- **Config:** Added `FRONTEND_URL` env var for reset links in emails
- **Handler:** `internal/api/password_reset.go` — `ForgotPassword` (generates 32-byte random token, stores SHA-256 hash, sends email via Resend), `ResetPassword` (validates token hash, checks expiry/used, updates password, marks token consumed)
- **Email:** Direct HTTP POST to Resend API (same pattern as feedback), async goroutine, masked email in logs
- **Frontend pages:** `forgot-password/page.tsx` (email input, success state) and `reset-password/page.tsx` (token from URL param, new password + confirm, success redirect)
- **Login page:** "Forgot password?" link updated from `#` to `/auth/forgot-password`
- **API client:** Added `forgotPassword()` and `resetPassword()` functions
- **Rate limiting:** Both endpoints placed under the `/auth` IP-based rate limiter (10 req/min)

#### C8 — Token Blacklist + JWT jti + Logout Endpoint
- **Migration:** `migrations/020_token_blacklist.sql` — `token_blacklist` table with `jti`, `expires_at`, `created_at`
- **JWT:** `internal/auth/jwt.go` — added `jti` (UUID v4) to `Claims` struct; `SignToken` generates and embeds it; `Claims.ID` stores the jti
- **Store:** `internal/store/token_blacklist.go` — `BlacklistToken`, `IsTokenBlacklisted`, `CleanupExpiredBlacklistedTokens`
- **Middleware:** `internal/api/middleware.go` — `AuthMiddleware` now checks `IsTokenBlacklisted` for every request with a non-empty `jti`
- **Handler:** `POST /auth/logout` in `internal/api/auth.go` — extracts `jti` from claims, adds to blacklist, clears cookie
- **Route:** Registered `POST /auth/logout` in `internal/api/router.go` (authenticated)

### High (H1–H7)

#### H1 — Internal Error Leakage
- **63+ `RespondError` calls** across all handler files: replaced `err.Error()` (leaks internal details like file paths, SQL errors) with `nil` for the details parameter
- Files: `admin.go`, `auth.go`, `submissions.go`, `test.go`, `community.go`, `contributions.go`, `activity.go`, `me.go`, `profile.go`, `feedback.go`, `broadcasts.go`, `notifications.go`, `password_reset.go`, `leaderboard.go`, `problems.go`

#### H4 — Screenshot Validation (Feedback)
- **`internal/api/feedback.go`:** Added 5MB size limit on base64 screenshot, MIME type validation (only `image/png`, `image/jpeg`, `image/webp`, `image/gif`), title max 200 chars, description max 5000 chars, HTML escaping via `html.EscapeString`

#### H5 — Docker `/app` Mount Writable
- **`internal/executor/executor.go`:** Changed volume mount from `${SANDBOX_BASE_DIR}/code:${workDir}` to `${SANDBOX_BASE_DIR}/code:${workDir}:ro`; added `--tmpfs /tmp:size=16m,noexec,nosuid,nodev` for writable temp

#### H6 — Shared Go Build Cache
- **`internal/executor/executor.go`:** Changed from shared `${BUILD_CACHE_DIR}` mount to per-execution temp directories (`os.MkdirTemp`), cleaned up after execution

#### H7 — `os.Exit` Not Blocked
- **`sandbox/secure.go`:** Added `"os.Exit"` and variations (`"os. Exit"`, `"os.Exit("`, backtick variants) to `dangerousPatterns` list

### Environment & Config
- `.env.example`: Added `RESEND_API_KEY`, `FRONTEND_URL`; Redacted real `GOOGLE_CLIENT_ID`; Added `SANDBOX_URL` default
- `frontend/.env.example`: Redacted real `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Additional Security Hardening
- **CORS**: `Access-Control-Allow-Credentials: true` already set in `CORSMiddleware`
- **Security headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 0`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security: max-age=31536000; includeSubDomains` via `SecurityHeadersMiddleware`
- **Frontend `next.config.ts`:** Added `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` headers

## New Files Created
- `migrations/020_token_blacklist.sql` — JWT revocation table
- `migrations/021_password_reset.sql` — password reset tokens table
- `internal/store/token_blacklist.go` — blacklist CRUD
- `internal/store/password_reset.go` — password reset token CRUD
- `internal/api/password_reset.go` — forgot/reset password handlers + email
- `frontend/app/(auth)/forgot-password/page.tsx` — forgot password form
- `frontend/app/(auth)/reset-password/page.tsx` — reset password form

## Files Modified
- `internal/api/responses.go` — added `SetAuthCookie`, `ClearAuthCookie`, `config` import
- `internal/api/middleware.go` — cookie fallback in `AuthMiddleware`
- `internal/api/auth.go` — cookie set/clear in all handlers, `Logout` handler, password/username validation refactored
- `internal/api/router.go` — wired logout route, password reset routes, `PasswordResetHandler`
- `internal/api/feedback.go` — screenshot validation (size, MIME, length caps, HTML escape)
- `internal/api/admin.go` — `err.Error()` → `nil` (error leakage fix)
- `internal/api/submissions.go` — `err.Error()` → `nil`
- `internal/api/test.go` — `err.Error()` → `nil`
- `internal/api/community.go` — `err.Error()` → `nil`
- `internal/api/activity.go` — `err.Error()` → `nil`
- `internal/api/me.go` — `err.Error()` → `nil`
- `internal/api/profile.go` — `err.Error()` → `nil`
- `internal/api/leaderboard.go` — `err.Error()` → `nil`
- `internal/api/problems.go` — `err.Error()` → `nil`
- `internal/api/contributions.go` — `err.Error()` → `nil`
- `internal/api/broadcasts.go` — `err.Error()` → `nil`
- `internal/api/notifications.go` — `err.Error()` → `nil`
- `internal/api/cache.go` — `err.Error()` → `nil`
- `internal/auth/jwt.go` — added `jti` UUID to claims, bumped version
- `internal/auth/oauth.go` — rewritten to local JWKS validation
- `internal/store/store.go` — added blacklist + password reset methods to interface
- `internal/store/users.go` — added `UpdateUserPassword`
- `internal/config/config.go` — added `FrontendURL`, `ResendAPIKey`
- `internal/executor/executor.go` — `:ro` mount, `--tmpfs`, per-exec build cache, output cap
- `sandbox/main.go` — env whitelist, output cap, CGO_ENABLED=0
- `sandbox/secure.go` — added `os.Exit` patterns
- `frontend/lib/api.ts` — `credentials: 'include'`, removed `Authorization` header, removed localStorage token, added `logout()`, `forgotPassword()`, `resetPassword()` functions, simplified `fetchUser()`
- `frontend/lib/UserContext.tsx` — no longer reads token from localStorage
- `frontend/app/(auth)/login/page.tsx` — removed `localStorage.setItem`, updated forgot-password link
- `frontend/app/(auth)/register/page.tsx` — removed `localStorage.setItem`
- `frontend/app/(auth)/onboarding/page.tsx` — removed `localStorage.getItem`/`setItem`
- `frontend/app/oauth/callback/page.tsx` — removed `localStorage.setItem`
- `frontend/app/(main)/settings/page.tsx` — logout calls API instead of `localStorage.removeItem`
- `frontend/components/layout/TopNav.tsx` — logout calls API instead of `localStorage.removeItem`
- `.env.example` — added `RESEND_API_KEY`, `FRONTEND_URL`, redacted Google Client ID
- `frontend/.env.example` — redacted Google Client ID
- `frontend/next.config.ts` — security headers

## Build Verification
- ✅ `go vet ./internal/...` — passes
- ✅ `go vet ./sandbox/...` — passes (separate module)
- ✅ `npx tsc --noEmit` — zero errors

## Key Decisions
- **Cookie name:** `koder_token` — httpOnly, Secure, SameSite=Lax, Path=/
- **Dual auth:** Middleware reads `Authorization: Bearer` header first, falls back to cookie — enables gradual frontend migration
- **Auth rate limiting:** Forgot-password and reset-password endpoints share the existing `/auth` IP rate limiter (10 req/min) to prevent abuse
- **Password reset token:** 32 bytes random → 64 hex chars; stored as SHA-256 hash; 1 hour expiry; one-time use
- **Email delivery:** Direct HTTP POST to Resend API in async goroutine (same pattern as feedback), no SDK dependency
- **No auto-clear on old tokens:** `CleanupExpiredPasswordResetTokens` runs on demand; expired tokens remain for audit but ignored by validation
- **JWKS cache:** Fetched once per process start; no background refresh (Google keys rotate infrequently; restart clears cache)
- **Output cap:** 100KB on both sandbox paths (Docker `docker logs` and remote sandbox HTTP) to prevent resource exhaustion

## Remaining Items (All Addressed)
- ~~M4: `rehype-sanitize` for `react-markdown` (prevent XSS in rendered problem descriptions)~~ ✅
- ~~M5: Remove `dangerouslySetInnerHTML` usage~~ ✅
- ~~M6: `CheckUsername` enumeration (still reveals availability; needs constant-time response)~~ ✅
- ~~M7: Broadcast FK cascade (`ON DELETE CASCADE` on `user_broadcast_status.broadcast_id`)~~ ✅ (already present)

### Medium Items Added (This Session)

#### M4 — rehype-sanitize for react-markdown
- Installed `rehype-sanitize` package
- Added `rehypePlugins={[rehypeSanitize]}` to all 4 `ReactMarkdown` usages:
  - `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` (problem statement viewer)
  - `frontend/app/(main)/profile/components/MyContributions.tsx` (user contribution preview)
  - `frontend/app/(main)/admin/PendingContributions.tsx` (admin review, 2 instances)

#### M5 — dangerouslySetInnerHTML remediation
- **`frontend/app/(main)/home/page.tsx`**: Replaced `dangerouslySetInnerHTML` with plain `<span>` — the code already stripped all HTML tags via `.replace(/<[^>]*>/g, "")` and rendered a plain-text excerpt, so the unsafe API was unnecessary
- **`frontend/components/kibo-ui/code-block/index.tsx`** + **`server.tsx`**: Left as-is — these render `shiki` syntax-highlighted output from trusted code tokens; `shiki` generates safe HTML token-by-token and is a well-known trusted rendering pipeline; no equivalent React-native API exists

#### M6 — CheckUsername constant-time
- **`internal/api/auth.go`**: `CheckUsername` now always returns `available: true` regardless of whether the username exists in the database. This eliminates the DB query timing side-channel that could be used for username enumeration. Uniqueness validation happens server-side when the user submits the onboarding form. Frontend `available` check becomes a client-side convenience only (validates format, not uniqueness)

#### M7 — Broadcast FK Cascade
- Already implemented in `migrations/015_broadcasts.sql` — both `user_id` and `broadcast_id` in `user_broadcast_status` already have `ON DELETE CASCADE`. No migration needed.

### Build Verification
- ✅ `npx tsc --noEmit` — zero errors

---

# Session Log — July 5, 2026 — PIN Auth, Monaco Local, Problem Restructure

## Branch
`update` (commit `d03af87`)

## What Was Done

### PIN-Based Password Management
- **Backend `POST /auth/change-password`:** Authenticated endpoint accepting `{ pin, new_password }` — verifies 6-digit PIN against bcrypt `pin_hash`, updates password
- **Settings change password:** 3-step dialog (masked PIN → new password + confirm → success checkmark)
- **Forgot password redesign:** Email tab disabled with `Ban` icon; Recovery PIN tab default; PIN digits masked via `mask` prop
- **PinInput `mask` prop:** When `true`, displays `•` instead of digits
- **Migration `022_add_pin_hash.sql`:** Adds `pin_hash TEXT` column to users table
- **PIN rate limiting:** 5 attempts per 15 minutes per email on forgot-password-pin
- **shadcn InputOTP installed** as foundation for PinInput component

### Auth Cookie Fix for Cross-Origin Dev Server
- `isHTTPS()` helper checks both `r.TLS` and `X-Forwarded-Proto` header (Render proxy terminates TLS)
- `SetAuthCookie`/`ClearAuthCookie` dynamically set `Secure`/`SameSite` based on protocol

### CSP Fix
- Added `https://accounts.google.com` to `style-src` in `next.config.ts`

### Route Fix
- `GET /auth/check-username` moved outside `AuthMiddleware` group — user has no JWT during registration

### Monaco Editor Local Workers
- Installed `monaco-editor` as direct dependency
- `@monaco-editor/loader` configured with `paths: { vs: "/vs" }` for local npm workers
- `frontend/scripts/copy-monaco.mjs` — copies `node_modules/monaco-editor/min/vs` → `public/vs/` at build time
- `DynamicWorkspace.tsx` — Client Component wrapper using `next/dynamic` with `ssr: false` + loading skeleton
- `page.tsx` — wraps `DynamicWorkspace` in `Suspense` boundary

### Problem Statement Restructure
- **Migration `023_split_problem_fields.sql`:** Adds `constraints TEXT`, `learning_objective TEXT` to problems
- **Go types:** `Problem.Constraints string`, `Problem.LearningObjective string` with proper JSON tags
- **Store queries:** All 5 SELECT queries include new columns with matching Scan in positional order
- **API response:** Includes `constraints` and `learningObjective` in problem payload
- **Frontend types:** `Problem.constraints?: string`, `Problem.learningObjective?: string`
- **Workspace:** Learning Objective callout (emerald, `Target` icon) renders `learningObjective`; Constraints section
- **Home card excerpt:** Strips `#` headings, `**` bold, ``` code fences, empty lines before first 120 chars
- **Seed files 1-4:** Transformed via `scripts/transform-seeds.mjs` — `statement` is clean description, `constraints`/`learning_objective` populated, `raw_readme` preserves full markdown

### Confetti Fix (Success Page)
- Split monolithic `useEffect` into confetti effect (empty deps) + data loading effect (`[slug]`)
- Replaced `requestAnimationFrame` loop with `setInterval` for cleaner lifecycle
- Increased `particleCount` 5→12 per side, wider `spread` 70, `startVelocity: 35`
- Added `try/catch` error handling around confetti calls
- Proper cleanup on unmount (`clearInterval`/`clearTimeout`)

## Files Created
- `migrations/022_add_pin_hash.sql`
- `migrations/023_split_problem_fields.sql`
- `frontend/app/problems/[slug]/DynamicWorkspace.tsx`
- `frontend/scripts/copy-monaco.mjs`
- `frontend/components/base/input/pin-input.tsx`
- `frontend/components/ui/input-otp.tsx`
- `frontend/components/ui/label.tsx`
- `scripts/transform-seeds.mjs`

## Files Modified
- `internal/store/types.go` — `Constraints`, `LearningObjective` fields
- `internal/store/problems.go` — All 5 SELECTs + Scans updated
- `internal/api/problems.go` — Response payload includes new fields
- `internal/api/change_password.go` — **NEW** change-password handler
- `internal/api/pin_reset.go` — **NEW** PIN-based forgot/reset handlers
- `internal/api/responses.go` — `isHTTPS()`, dynamic `SetAuthCookie`/`ClearAuthCookie`
- `internal/api/router.go` — PIN reset + change-password routes; check-username outside middleware
- `frontend/next.config.ts` — CSP `style-src` includes `https://accounts.google.com`
- `frontend/lib/api.ts` — PIN-related API functions
- `frontend/lib/types.ts` — `constraints`, `learningObjective` in Problem type
- `frontend/app/(auth)/register/page.tsx` — Step 2 redesigned with masked PinInputs
- `frontend/app/(auth)/forgot-password/page.tsx` — Email tab disabled; PIN tab default with mask
- `frontend/app/(main)/settings/page.tsx` — 3-step change-password dialog
- `frontend/app/(main)/home/page.tsx` — Card excerpt strips markdown headers/bold/code fences
- `frontend/app/problems/[slug]/page.tsx` — Wraps DynamicWorkspace in Suspense
- `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` — Learning Objective callout, Constraints section
- `frontend/app/(main)/problems/[slug]/success/page.tsx` — Confetti fix (separate effect, setInterval, try/catch)
- `migrations/019_seed_problems1-4.sql` — Transformed with structured fields

## Build Verification
- ✅ `go vet ./internal/...` — passes
- ✅ `go build ./...` — passes
- ✅ `npx tsc --noEmit` — zero errors
- ✅ `go clean -cache` — performed
