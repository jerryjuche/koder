# Session Logbook — June 28 – July 3, 2026

---

## Commits (chronological, branch `update`)

| # | Hash | Description |
|---|------|-------------|
| 1 | `fd306e8` | feat: profile page redesign with shadcn/ui and CSS variables |
| 2 | `e8a49e8` | perf: collapse 7 DB queries to 1, add caching, rewrite profile page with shadcn/ui |
| 3 | `946ce46` | feat: leaderboard redesign with shadcn Avatar, top 15 display, no emoji podium |
| 4 | `6648477` | profile: activity gauge radial charts, achievement badge grid, remove recent activity |
| 5 | `a823b2f` | Fix: simplify Gitea request headers to avoid Cloudflare bot detection |
| 6 | `ad750f5` | Add Gitea proxy endpoint to sandbox |
| 7 | `99cb7cf` | Complete Google Sign-In migration + frontend polish (achievements, gauges, auto-publish) |
| 8 | `696dde8` | Add /privacy route with professional privacy policy page |
| 9 | `8216377` | Add /terms route with professional Terms of Service page |
| 10 | `b61597c` | Add aud claim validation to Google token verification |
| 11 | `f8177bf` | Fix Google token email_verified parsing + full profile page redesign |
| 12 | `b9d06df` | Professional review: color reduction, onboarding flow, google sync, leaderboard username display |

---

## 1–4. Session 1 (June 28) — Profile Redesign + Performance
See `git log` for details. Key outcomes: radial activity gauges, contribution graph, `get_full_profile()` PL/pgSQL function.

---

## 5–6. Gitea API Fixes
Cloudflare was blocking Go's default HTTP client. Added `User-Agent`, `Accept` headers, gzip decompression, and a sandbox proxy endpoint. (Archived — Gitea later removed entirely.)

---

## 7. Google Sign-In Migration (June 30, Session 4)

### Backend Changes
| File | Change |
|------|--------|
| `migrations/012_add_google_auth.sql` | Added `google_id`, `google_email`, `google_avatar_url`, `username`, `email` columns; backfilled data; updated `get_full_profile()` |
| `internal/auth/oauth.go` | `VerifyGoogleToken()` — calls `oauth2.googleapis.com/tokeninfo?id_token=...`, validates sub/aud/email_verified |
| `internal/auth/jwt.go` | JWT claims include `Username` + `Onboarding` (bool) |
| `internal/store/types.go` | `GoogleUserInfo` struct; updated `User`/`NewUser`/`LeaderboardUser` with Google fields + `Username` |
| `internal/store/users.go` | `GetUserByLogin`, `GetUserByUsername`, `GetUserByEmail`, `GetUserByGoogleID`, `CreateUserFromGoogle`, `LinkGoogleToUser`, `UpdateUserUsername`, `UpdateUserGoogleAvatar` |
| `internal/api/auth.go` | `GoogleAuth`, `CompleteGoogle`, `CheckUsername` handlers; `Login` checks 3 fields (username, email, student_id); removed Gitea handlers |
| `internal/api/me.go` | Returns `username` + `google_avatar_url` |
| `internal/api/profile.go` | Returns `username` + `google_avatar_url` |
| `internal/api/router.go` | Google routes added; all Gitea routes removed |
| `internal/config/config.go` | Added `GoogleClientID`; removed Gitea vars |

### Frontend Changes
| File | Change |
|------|--------|
| `lib/types.ts` | `User`/`UserProfile` use `username`/`google_avatar_url` |
| `lib/api.ts` | `googleLogin`, `completeGoogleOnboarding`, `checkUsername`, `publishAllDrafts` |
| `lib/achievements.ts` | **NEW** — shared `Achievement` type + `getAchievements()` |
| `app/(auth)/login/page.tsx` | GIS button; "Username or Email" field |
| `app/(auth)/register/page.tsx` | Username + email fields |
| `app/(auth)/onboarding/page.tsx` | **NEW** — debounced username check with visual feedback |
| `components/layout/TopNav.tsx` | `google_avatar_url` + `@{username}` |
| `app/(main)/admin/page.tsx` | "Publish All Drafts" + enriched status column |
| `app/(main)/profile/components/Achievements.tsx` | Shared module import |
| `app/(main)/profile/components/ActivityFeed.tsx` | Shared module import |
| `app/(main)/profile/components/ProgressMetrics.tsx` | Module colors, sorted, empty state |
| `components/ui/activity-gauge.tsx` | ResizeObserver + 16-color palette |
| `app/(main)/settings/page.tsx` | Gitea section removed, username read-only |
| `app/(main)/leaderboard/LeaderboardClient.tsx` | `google_avatar_url` |

### Google Sign-In Flow
```
Login Page → GIS button → Google popup → user selects account
  → Google returns ID token (JWT)
  → POST /auth/google {id_token}
  → VerifyGoogleToken() → GET oauth2.googleapis.com/tokeninfo?id_token=...
  → Check user by google_id OR email OR create new
  → New user gets temp username "g_<sub[:8]>" + onboarding=True JWT
  → Onboarding page → set permanent username → POST /auth/complete-google
  → New JWT without onboarding → redirect to /
```

### Build Verification
- ✅ `go build ./cmd/server/`
- ✅ `npx tsc --noEmit`
- ✅ `npm run build` (4.3 min)

---

## 8–9. Legal Pages (June 30)

- **`/privacy`** — Professional privacy policy covering data collection, Google OAuth, code submissions, security, retention, user rights
- **`/terms`** — Terms of Service covering eligibility, acceptable use, IP, leaderboard visibility, termination, disclaimers, governing law (Nigeria)
- Both pages use the `(legal)` layout group with branded amber-charcoal aesthetic
- Auth layout footer now shows "Privacy · Terms" links

---

## 10. Security Fix: `aud` Claim Validation

`VerifyGoogleToken()` was not checking the `aud` (audience) field — any app's Google ID token would be accepted. Fixed: added `info.Audience != expectedClientID` check after discovering the `aud` field in the tokeninfo response.

---

## 11. Profile Page Redesign (June 30, Final Session)

### Components Overhauled

| Component | Changes |
|-----------|---------|
| **ProfileHeader** | Glassmorphism (`backdrop-blur-xl`, `bg-black/40`), animated gradient background pulsing, SVG XP ring with stroke-dashoffset animation, inline mini-stats row (Rank/Solved/Rate/Streak), gold accent line, pulsing glow ring around avatar |
| **StatsOverview** | `AnimatedNumber` counter using `motion/react` `useMotionValue` + `animate`, unique gradient per stat card (amber/blue/emerald/cyan/orange/purple), hover lift with `whileHover`, staggered 0.07s entrance, glass cards with `bg-black/20 backdrop-blur-sm` |
| **ProgressMetrics** | `AnimatedBar` with smooth width animation, difficulty colors with gradient hover, amber-themed icons, immersive empty state with icon, section description text |
| **Achievements** | Motion stagger + scale entrance per badge, hover lift with colored shadow, premium `backdrop-blur-xl` dialog, refined locked opacity, purple accent header |
| **ActivityFeed** | Timeline with vertical gradient line + colored dots, dot pulsing on hover, motion scale per achievement badge, amber-themed headers |
| **ProfileClient** | Shimmer skeleton with gradient animation (`@keyframes shimmer`), `motion.div` entry for page title, error state with fade animation |

### New CSS Animations (`globals.css`)
```css
@keyframes pulse-slow { ... }    /* subtle glow breathing */
@keyframes shimmer { ... }       /* skeleton loading sweep */
```

### Misc
- `go build ./cmd/server/` — still passes
- `npx tsc --noEmit` — passes
- `npm run build` — passes (profile page: 113 kB → 162 kB, +motion library)

---

---

## 12. Session 6 (July 1) — Professional Review: Color Reduction, Onboarding Flow, Google Sync

### Backend Changes
| File | Change |
|------|--------|
| `internal/api/auth.go` | Register: removed `Username` field; generates temp `u_<uuid[:8]>` username; issues JWT with `onboarding: true`; renamed `CompleteGoogle` → `CompleteOnboarding`; now updates `student_id` to match username; added `POST /auth/link-google` endpoint for existing users to sync Google account |
| `internal/api/router.go` | Added `/auth/complete-onboarding` (alias for `/auth/complete-google`) and `/auth/link-google` as protected routes |
| `internal/store/store.go` | Added `UpdateUserStudentID` to Store interface |
| `internal/store/users.go` | Added `UpdateUserStudentID()` method; removed duplicate `UpdateUserUsername` |

### Frontend — Auth Pages
| File | Change |
|------|--------|
| `app/(auth)/register/page.tsx` | Removed Username field; added required "I agree to Terms of Service and Privacy Policy" checkbox; redirects to `/onboarding` after registration when `onboarding: true` |
| `app/(auth)/login/page.tsx` | Fixed Google Sign-In button layout shift with skeleton loading state; professional "By signing in, you agree to our Terms/Privacy" footer |
| `app/(auth)/onboarding/page.tsx` | Works for all auth methods (not just Google); uses `completeOnboarding()` API call; replaced emerald indicators with amber-400 |
| `lib/api.ts` | Added `completeOnboarding()` and `linkGoogle()` functions; updated `register()` return type with onboarding flag |

### Frontend — Profile Color Reduction (All 7 Components)
| Component | Change |
|-----------|--------|
| **ProfileHeader** | All 4 mini-stats use uniform amber-400 (not emerald/cyan/orange); removed `@` prefix from username badge; removed `student_id` from display line; Copied checkmark uses amber |
| **StatsOverview** | All 6 stat cards use uniform amber gradient/icon/text — no more blue/emerald/cyan/orange/purple per-stat colors; unified `hover:border-amber-500/30` |
| **ProgressMetrics** | Easy difficulty uses amber-400; Strings & Runes uses teal; Trees & Graphs uses sky; module header icon uses amber |
| **Achievements** | Icon header uses amber; checkmark uses amber; unlocked badge uses amber |
| **ActivityFeed** | Timeline dots and "solved" text use amber (not emerald) |
| **RecentActivity** | "Passed" status uses amber-400; badge styles use amber |
| **MyContributions** | All emerald-400/border-emerald/bg-emerald replaced with amber variants |

### Frontend — Global Green Removal & @ Prefix
| File | Change |
|------|--------|
| `app/globals.css` | `--color-brand-success` changed from `#22c55e` to `#F59E0B` (amber) |
| `lib/utils.ts` | `getUserColor()` index 3 changed from green to steel; duplicate gold entries fixed; `getDifficultyColor()` Easy changed from `#52B788` to `text-amber-400` |
| `app/(main)/page.tsx` | Dashboard username display: `text-emerald-400` removed; `@{username}` → plain `{username}`; `@{author_name}` → plain; added `GoogleSyncBanner` component for unlinked Google users |
| `components/layout/TopNav.tsx` | `text-emerald-400` → `text-amber-400`; `@{username}` → plain `{username || studentId}` |
| `app/(main)/admin/PendingContributions.tsx` | Green dot/code/approve button → amber variants |

### Frontend — Leaderboard (Username Primary)
| Change | Detail |
|--------|--------|
| Podium | Shows `username` (monospace) with full `name` in tooltip |
| "Your Ranking" | Shows `username` as primary, `studentId` as secondary, name in tooltip |
| Table rows | Shows `username` with name in tooltip; search searches by username/name/studentId |
| Table header | "Username" column; all `text-emerald-400` → `text-amber-400`; `@` prefix removed |

### Build Verification
- ✅ `go build ./internal/...` — passes
- ✅ `npx tsc --noEmit` — passes
- ✅ `git push` — commit `b9d06df`

---

## 13. Known Issues & Next Steps

- [ ] Run migration `012_add_google_auth.sql` against the database
- [ ] Set `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env vars
- [ ] `GetFullProfile` SQL function returns username/google_avatar_url but `rawProfileJSON` in `profile.go` doesn't parse them — separate `GetUserByID` call is used instead (two DB calls; acceptable)
- [ ] Test Google Sign-In end-to-end (login → onboarding → dashboard)
- [ ] Test existing email/password login still works
- [ ] Test new registration flow (register → onboarding → dashboard)
- [ ] Test Google link for existing users (/auth/link-google)
- [ ] Clean up unused `@tanstack/react-virtual` dependency if not needed

---

## 14. Session 7 (July 1) — Codebase Cleanup, Google Auth Hardening, Account Deletion

### Backend Changes
| File | Change |
|------|--------|
| `cmd/sandbox/main.go` | **REMOVED** — dead placeholder (`select {}`) |
| `sandbox/main.go` | Removed Gitea proxy handler, route, rate-limiter bypass; dead code removal |
| `internal/api/admin.go` | Replaced deprecated `strings.Title` → `cases.Title(language.English).String()` |
| `internal/config/config.go` | Added `GoVersion` field, `GO_VERSION` env var (default `"1.23"`) |
| `internal/executor/executor.go` | Wired `goVersion` through `PrepareSandbox` and sandbox client |
| `internal/executor/sandbox.go` | `PrepareSandbox` accepts `goVersion string` param |
| `internal/executor/sandbox_client.go` | `SandboxRequest` includes `GoVersion` field |
| `internal/store/store.go` | Added `DeleteUser` + `GetVisibleTestCasesForProblem` to Store interface |
| `internal/store/users.go` | New `DeleteUser()` — transactional cleanup: submissions → progress → user (cascades to notifications, submission_likes, user_problems) |
| `internal/api/auth.go` | `GoogleAuth` returns `404 GOOGLE_NOT_LINKED` instead of auto-creating accounts; prevents silent duplicates |
| `internal/api/me.go` | Added `google_linked: bool` to `/me`; new `DeleteAccount` handler |
| `internal/api/router.go` | Added `POST /me/delete-account` route (auth-protected) |
| `internal/auth/auth_test.go` | Updated all 10 `SignToken()` calls to match 7-argument signature |
| `.env.example` | Added `GO_VERSION` |

### Frontend — Shared GIS Hook (NEW)
| File | Change |
|------|--------|
| `hooks/use-google-one-tap.ts` | **NEW** — module-level singleton: loads GIS script once, calls `initialize()` once, exposes `prompt()` + `renderButton()`. FedCM calls wrapped in try-catch with `itp_support: true`. `renderButton()` uses popup flow (no FedCM dep) |

### Frontend — Google Link Banner (NEW)
| File | Change |
|------|--------|
| `components/GoogleLinkBanner.tsx` | **NEW** — replaces old `GoogleSyncBanner`; amber gradient, `AlertTriangle` icon, localStorage dismiss, auto-hides when `google_linked` is true; uses `renderButton` (popup) for linking |
| `app/(main)/page.tsx` | Swapped `GoogleSyncBanner` → `GoogleLinkBanner` |

### Frontend — Login & Register Pages
| File | Change |
|------|--------|
| `app/(auth)/login/page.tsx` | Adopted shared hook; `renderButton` (popup, numeric 350 width) replaces direct GIS call with `width: '100%'`; `mounted` state pattern fixes hydration mismatch |
| `app/(auth)/register/page.tsx` | Same fixes as login: shared hook, numeric width, `mounted` pattern |

### Frontend — Settings Page
| File | Change |
|------|--------|
| `app/(main)/settings/page.tsx` | Delete Account: two-step confirmation dialog → `deleteAccount()` API call → clears token → redirects to `/auth/login`. Google linking uses `renderButton` (popup) instead of `prompt()` (FedCM) |

### Frontend — API & Types
| File | Change |
|------|--------|
| `lib/api.ts` | Added `deleteAccount()` function |
| `lib/types.ts` | Added `google_linked: boolean` to `User` type |

### Git
- Branch: `update`
- Commits: `06c0590` (codebase cleanup + account deletion + shared hook), `dd5fcbb` (migration trailing newline), `239c886` (dynamic ready state), `7425582` (direct GIS button rendering), `6c05b84` (ready independent of init success), `1d19bb3` (explicit 350x40 container + fallback)

### Build Verification
- ✅ `go build ./...`
- ✅ `npx tsc --noEmit`

---

## 15. Session 7 (cont.) — GIS Button Reliability Fixes

### Problem
The "Link Google Account" button in Settings and the banner didn't trigger Google authentication. Multiple root causes:
1. `ready` was a static expression (`typeof window !== "undefined"`) — true immediately on client, but GIS script hadn't loaded
2. When `ready` was changed to `useState` that required `initialize()` success, `initialize()` threw on localhost (FedCM AbortError) and `ready` stayed `false` forever
3. `cancel_on_tap_outside` + `itp_support` in `initialize()` triggered FedCM mediation during init, causing throws on localhost
4. GIS `renderButton()` requires a numeric pixel width (not `100%`)
5. GIS refuses to render into `display: none` elements (hidden div approach)
6. Cross-Origin-Opener-Policy blocked popup postMessage on localhost
7. `/gsi/status` endpoint returned 403 (origin not authorized in Google Cloud Console)

### Fixes Applied
| Commit | Fix |
|--------|-----|
| `239c886` | `ready` changed to `useState` — flips `true` only after init attempt completes (script load + init called). Previously static `typeof window !== "undefined"` |
| `7425582` | Removed hidden div + programmatic click approach. GIS `renderButton()` now renders directly into a visible container |
| `6c05b84` | `ready` fires after init attempt regardless of success/failure. Removed `cancel_on_tap_outside` + `itp_support` from `initialize()` |
| `1d19bb3` | Explicit 350×40px container (was `width: 100%`). 500ms timeout checks `childElementCount` after render; falls back to `prompt()` (One Tap) if zero. All GIS errors logged to console with `[GIS]` prefix |

### Modified Files
| File | Change |
|------|--------|
| `hooks/use-google-one-tap.ts` | Dynamic `ready` state; init error logging; `renderButton` logging; removed FedCM-specific init options |
| `app/(main)/settings/page.tsx` | Explicit 350×40px container; `gisFailed` detection; fallback button with `prompt()` |
| `components/GoogleLinkBanner.tsx` | Same pattern as settings: explicit dimensions, fallback detection, prompt fallback |

### Build Verification
- ✅ `npx tsc --noEmit`

---

## 16. Current Session — GIS FedCM Error Resolution & Avatar Fix (July 1)

### Problem
GIS `initialize()` throws `TypeError: Required member is undefined` on `navigator.credentials.get()` — FedCM detection fails because `providers` property is missing in the browser context. This error propagates out of `initialize()` and is caught by our try-catch.

### What We Tried (and Why)
1. **`ready` state from hook** — Settings/Banner JSX used `ready && !gisFailed` to conditionally render GIS container. FedCM error caused `initialized = false`, `ready` never fired → container never mounted → polling effect never ran.
2. **Polling in Settings/Banner** — Switched from `ready` to polling every 200ms for `window.google?.accounts?.id`. But JSX still guarded by `ready` → circular dependency.
3. **Removed `ready` from JSX** — Always render GIS container, polling drives rendering. Added 5s timeout fallback. This worked (console showed `children after render: 1`).

### Final Approach
- **Banner** → Simply navigates to `/settings?tab=security` — no GIS rendering at all. Clean amber notification with link.
- **Settings** → Plain "Link Google Account" button that calls `prompt()` (One Tap via FedCM). No GIS `renderButton`, no polling, no fallback states. Works on production HTTPS.
- **TopNav** → Replaced `<Image>` with `<img>` for Google avatars to fix 500 error from Next.js image optimization proxy.

### Changed Files
| File | Change |
|------|--------|
| `components/GoogleLinkBanner.tsx` | Stripped all GIS complexity — now just an info banner with link to `/settings?tab=security` |
| `app/(main)/settings/page.tsx` | Removed GIS `renderButton`/polling/gisFailed — plain button calling `prompt()`. Reads `?tab=` query param via `useSearchParams` |
| `components/layout/TopNav.tsx` | Replaced `<Image>` → `<img>` for Google avatar URLs to avoid `/_next/image` 500 errors |

### Build Verification
- ✅ `npx tsc --noEmit`

---

## 17. Known Issues & Next Steps

- [ ] Run migration `012_add_google_auth.sql` against the database
- [ ] Set `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env vars
- [ ] Add `http://localhost:3000` and Vercel domain to Authorized JavaScript origins in Google Cloud Console
- [ ] Test Google Sign-In on production HTTPS URL (not localhost — FedCM/COOP issues are localhost-only)
- [ ] Test account deletion end-to-end

---

## 18. Session 8 (July 3) — MultiStepLoader, Problem Sorting, Auth Form Redesign

### Commits
| Hash | Description |
|------|-------------|
| `e9cd9e8` | feat: add MultiStepLoader to root page, remove Module Proficiency from profile |
| `3488e09` | professional google sign-in layout + sort unsolved problems first |

### MultiStepLoader (Root Page)

| File | Change |
|------|--------|
| `components/ui/multi-step-loader.tsx` | **NEW** — full-screen overlay with animated check icons, backdrop blur, gradient mask, 5-state progress (7000ms total), `loop{false}` |
| `components/multi-step-loader-demo.tsx` | **NEW** — standalone demo page |
| `app/page.tsx` | RootPage shows MultiStepLoader with 5 states → navigates to `/home` (authenticated) or fades to `/landing` (unauthenticated) |
| `app/(main)/home/page.tsx` | Restored skeleton-card loading (no double-loader flash) |

- Uses project theme colors: `bg-background/95`, `text-primary` (amber), `text-foreground font-semibold` (active)
- `lucide-react` `X` icon (avoiding `@tabler/icons-react` TS7016 type declaration issues)
- `loop{false}` + `duration={1400}` × 5 states = 7000ms; auth check elapsed subtracted so navigation aligns with last step

### Unsolved-First Problem Sorting
- `app/(main)/home/page.tsx` — Added `.sort((a, b) => Number(a.solved) - Number(b.solved))` to `filteredProblems` so unsolved problems appear at top of dashboard grid

### Professional Google-First Auth Layout

| File | Change |
|------|--------|
| `app/(auth)/login/page.tsx` | Google as primary action (top), custom dark button with Google SVG, `shadow-input` card, framer-motion staggered entrance, `BottomGradient` on submit, shadcn `Input`+`Label`, `AuthDivider` |
| `app/(auth)/register/page.tsx` | Same treatment: Google-first, professional form with two-column name layout, framer-motion |

### New Auth Components (`components/auth/`)

| File | Purpose |
|------|---------|
| `google-button.tsx` | Custom dark Google button with SVG logo, `shadow-input`, `group/btn` hover states, calls `prompt()` on click |
| `bottom-gradient.tsx` | Amber gradient line on button hover (`group-hover/btn:opacity-100`) |
| `label-input-container.tsx` | Wrapper for input + label vertical spacing |
| `auth-divider.tsx` | "or" divider with border line and muted centered text |
| `index.ts` | Barrel exports |

### Other New/Updated Files

| File | Change |
|------|--------|
| `components/ui/label.tsx` | **NEW** — shadcn Label with `@radix-ui/react-label` + CVA |
| `app/globals.css` | Added `--shadow-input` custom shadow to `@theme inline` block |

### Design Decisions
- GIS `renderButton` replaced with custom button + `prompt()` for full visual control
- `shadow-input` gives card a refined inset-like shadow matching Aceternity pattern
- Framer-motion staggered entrance: card → logo → Google button → divider → form → footer
- Amber gold `BottomGradient` (not cyan/indigo from Aceternity demo) — matches Koder's `brand-muted-gold`

### Build Verification
- ✅ `npx tsc --noEmit` — zero errors

---

## 19. Session 9 (July 3) — Landing Page Polish + Feedback System

### Commits
| Hash | Description |
|------|-------------|
| `608c956` | Landing page: replace Go text with official wordmark SVG, simplify footer links, remove editor mockup |
| `53a9ade` | Feedback & bug report system: floating button, modal, admin panel, email notifications |

### Landing Page Changes
| File | Change |
|------|--------|
| `frontend/components/LandingContent.tsx` | Replaced "Go" text with official Go wordmark SVG; removed editor mockup preview; removed "Zero-cost automated Go grading" badge; simplified footer links; removed "Oracle free tier" tagline |

### Feedback System — Backend
| File | Change |
|------|--------|
| `migrations/014_feedback.sql` | **NEW** — `feedback` table with type, priority, status, screenshot, admin_notes, is_anonymous |
| `internal/store/feedback.go` | **NEW** — CRUD methods for feedback |
| `internal/store/types.go` | Added `Feedback`, `NewFeedback` structs |
| `internal/store/store.go` | Added 5 feedback methods to Store interface |
| `internal/api/feedback.go` | **NEW** — handler with submit, admin list, status update, user list, counts; Resend email notification |
| `internal/api/router.go` | Added `/feedback`, `/feedback/mine`, `/admin/feedback`, `/admin/feedback/counts`, `/admin/feedback/{id}` routes |
| `internal/config/config.go` | Added `ResendAPIKey` config field |

### Feedback System — Frontend
| File | Change |
|------|--------|
| `frontend/components/FeedbackButton.tsx` | **NEW** — floating FAB, modal with 3 tabs, priority selector, screenshot upload, anonymous toggle |
| `frontend/app/(main)/admin/FeedbackPanel.tsx` | **NEW** — admin feedback table with status tabs, search, expandable rows, inline status/admin notes |
| `frontend/app/(main)/layout.tsx` | Added `<FeedbackButton />` |
| `frontend/app/(main)/admin/page.tsx` | Added `<FeedbackPanel />` |
| `frontend/lib/api.ts` | Added 5 feedback API functions |
| `frontend/lib/types.ts` | Added `FeedbackItem` type |

### Build Verification
- ✅ `go vet ./internal/api/ ./internal/store/ ./internal/config/`
- ✅ `npx tsc --noEmit`
- ✅ `npx next build` — compiled, types checked, all 17 pages generated

---

## 20. Session 10 (July 3, cont.) — Admin Polish: Scrollable Problems, In-App Feedback Notification, Reordered Layout

### Commits
| Hash | Description |
|------|-------------|
| `d78f2ba` | docs: session log, codebase index, feedback endpoints in README |
| *(next)* | admin polish: scrollable problems, in-app feedback notification, reordered layout |

### Changes

| File | Change |
|------|--------|
| `internal/api/feedback.go` | Added `NotifyAdmins()` call after `CreateFeedback` — admins get in-app notification when feedback is submitted |
| `frontend/app/(main)/admin/page.tsx` | Reordered layout (Contributions + Feedback panels below Ingest/Enrich, above Problem Catalog); changed grid to `lg:grid-cols-4` (3:1); made problem table scrollable (`max-h-[420px] overflow-y-auto` with sticky thead); professional card sections |
| `frontend/app/(main)/admin/PendingContributions.tsx` | Added `compact` prop — removes outer heading/border when embedded |
| `frontend/app/(main)/admin/FeedbackPanel.tsx` | Added `compact` prop — conditionally hides header/border, adds scrollable max-height |

### Build Verification
- ✅ `go vet ./internal/api/ ./internal/store/`
- ✅ `npx tsc --noEmit`
