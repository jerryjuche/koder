# Session Logbook — June 28 – July 6, 2026 (Sessions 1–37)

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
| 13 | `842ea60` | Add mandatory 6-digit PIN recovery during registration + PIN-based forgot-password flow |
| 14 | `5a251b3` | Professional change password + PIN UX overhaul |
| 15 | `d4fc76d` | Fix auth cookie for cross-origin dev server + CSP |
| 16 | `d03af87` | Split monolithic problem statement into structured fields |
| 17 | `972dfd0` | Fix Monaco Editor: local npm workers, CSP blob, Next.js 15 dynamic |
| 18 | `98edab3` | Add pagination to problem listing (18 per page, page nav controls) |
| 19 | `28f8334` | Back button preserves module via ?module= query param |
| 20 | `6b864f2` | Boost confetti (60 particles, faster bursts) 2s toast duration |
| 21 | `11526ba` | Sync confetti with page load — fire when data is ready |
| 22 | `741d305` | Cache problems in sessionStorage — skip fetch when cached |
| 23 | `ab6e195` | Performance optimization pass: API cache, useMemo, React.memo, preconnect |
| 24 | `1a0d235` | July 6 — Error handling overhaul + registration race condition fix |
| 25 | `9e25ac9` | Fix GetUserByID scan mismatch — missing UsernameSet in Scan targets |
| 26 | `8c69707` | Add POST /auth/verify-pin endpoint + fix change-password PIN flow |
| 27 | `a04dcc9` | Fix PIN change flow: add pin_hash to GetUserByID + add /auth/set-pin endpoint |
| 28 | `b3663db` | Polish PIN input UI: professional design with error states and shake animation |
| 29 | `eb58ecf` | Restore resetPassword export — used by reset-password landing page |
| 30 | `226426e` | Professional 404 page: layered visual hierarchy, responsive layout, Home + Go Back actions |
| 31 | `59f805f` | Professional got/want TerminalDiff + solved guard + error standardization |
| 32 | `f2605dc` | Fix Google auth 502: remove nil pem.Encode in jwksKeyToPublicKey, add RecoveryMiddleware |
| 33 | `5f73879` | Fix module card image loading: align MODULE_META keys with API slugs, add display name mapping, use local arrays-strings image |
| 34 | `c093540` | Replace arrays-strings module image with professional version |
| 35 | `0ecd5ef` | Use local image for all module cards |

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

---

## 21. Session 11 (July 3, cont.) — Broadcast Polish + Performance Optimization Sprint

### Changes

#### Broadcast System Fixes & Polish
| File | Change |
|------|--------|
| `internal/api/broadcasts.go` | `NewBroadcast.Message`/`Priority` made optional (`omitempty`); handler defaults priority→"medium", message→title; goroutine uses `context.Background()` (not canceled request ctx) |
| `internal/store/notifications.go` | `ReplaceBroadcastNotifications()` — atomic DELETE+INSERT in single transaction, replaces old `ClearBroadcastNotifications` + `NotifyAllUsers` pattern |
| `internal/store/broadcasts.go` | `GetActiveBroadcasts` — subquery ensures only latest broadcast shows; `NOT EXISTS` dismissal check prevents resurfacing older ones |
| `frontend/components/BroadcastBanner.tsx` | Slim centered card: `px-4 py-2.5`, `size-8` icon, `w-fit mx-auto`, no message text, "Admin" label, 5s live polling |
| `frontend/app/(main)/admin/BroadcastPanel.tsx` | Compact form (type/title/priority/CTA only), history list with delete button, shows "Admin" |
| `frontend/lib/useNotifications.ts` | Polling interval reduced 30s → 5s |

#### Query Optimization
| File | Change |
|------|--------|
| `internal/store/problems.go` | `ListVisibleProblems`: replaced 3 correlated subqueries with single `LATERAL` join; dropped `statement`/`raw_readme` from listing query; `ListProblemsNeedingEnrichment`: added `LIMIT 100` |
| `internal/store/users.go` | `GetUserStats`: split into two queries — no `LEFT JOIN submissions` (avoided 50× row multiplication); `CalculateStreak` extracted as shared helper |
| `internal/store/submissions.go` | `GetBestPractices`: replaced `HAVING COUNT(sl.id) > 0` with `EXISTS (SELECT 1 FROM submission_likes ...)` |
| `internal/store/broadcasts.go` | `GetAllBroadcasts`: added `LIMIT 200` |
| `internal/store/testcases.go` | `GetTestCasesForProblem`/`GetVisibleTestCasesForProblem`: added `LIMIT 200` |
| `internal/store/user_problems.go` | User problem lists: added `LIMIT 100` |

#### Bulk INSERT Optimization
| File | Change |
|------|--------|
| `internal/store/problems.go` | `UpsertEnrichedProblem`/`UpsertTestCasesForProblem`: resolve `problem_id` once, single multi-row `VALUES` INSERT instead of N round-trips |

#### Infrastructure Hardening
| File | Change |
|------|--------|
| `internal/store/store.go` | pgxpool tuned: `MaxConns=10`, `MinConns=2`, `MaxConnLifetime=30m`, `MaxConnIdleTime=5m` |
| `internal/api/middleware.go` | Rate limiter periodic cleanup goroutine — evicts stale entries every 2× window duration |
| `internal/api/cache.go` | `userCache` added `stopCh` for graceful goroutine shutdown |
| `internal/api/feedback.go` | Feedback email uses `&http.Client{Timeout: 10 * time.Second}` (was no timeout) |

#### Migration
| File | Change |
|------|--------|
| `migrations/017_optimization_indexes.sql` | **NEW** — 16 performance indexes on all key query columns |

### Build Verification
- ✅ `go vet ./internal/...`
- ✅ `npx tsc --noEmit`
- ✅ `npx next build`

---

## 22. Session 11 fixup (July 3) — SQL Bug Fix + Frontend Field Mismatch

### Bug 1: LATERAL Join SQL Error
`ROUND(AVG(runtime_ms)) FILTER (WHERE status = 'passed')` — `FILTER` can only attach to aggregate functions, but `ROUND()` is scalar. PostgreSQL errored with `FILTER specified, but round is not an aggregate function`.

**Fix:** Moved `FILTER` inside `AVG()`: `ROUND(AVG(runtime_ms) FILTER (WHERE status = 'passed'))`

### Bug 2: Frontend successRate camelCase Mismatch
`frontend/app/(main)/home/page.tsx:489` used `problem.successRate` (camelCase) but backend JSON key is `success_rate` (snake_case). Acceptance rate always showed `0%`.

**Fix:** Changed to `problem.success_rate`.

### Build Verification
- ✅ `go vet ./internal/...`
- ✅ `npx tsc --noEmit`

---

## 23. Session 12 (July 3, cont.) — Database Reset + 45 Problem Seed

### Changes
| File | Change |
|------|--------|
| `migrations/018_seed_problems.sql` | **NEW** — 45 professional Go problems across 3 modules (Math & Recursion, Arrays & Strings, Data Structures) |
| *(cleaned)* | Removed `server`/`main` binaries, `senior_role.txt`, `reset.sql`, `reset_all.sql`, `tmp/` |

### Build Verification
- ✅ `go vet ./internal/...`
- ✅ `npx tsc --noEmit`

---

## 24. Session 13 (July 5) — PinInput, Change Password, Auth Cookie Fix

### Backend
| File | Change |
|------|--------|
| `internal/api/change_password.go` | **NEW** — `POST /auth/change-password`: verifies 6-digit PIN via bcrypt + updates password |
| `internal/api/pin_reset.go` | PIN-based forgot-password flow with 5-attempt/15-min rate limiter |
| `internal/api/responses.go` | `isHTTPS()` helper — checks `X-Forwarded-Proto` (Render proxy) + `r.TLS` |
| `internal/api/router.go` | Added change-password route; reset-password-pin route |
| `migrations/022_add_pin_hash.sql` | **NEW** — Adds `pin_hash TEXT` column to users |

### Frontend
| File | Change |
|------|--------|
| `components/base/input/pin-input.tsx` | **NEW** — shadcn/input-otp based PinInput with `mask` prop |
| `components/ui/input-otp.tsx` | **NEW** — shadcn InputOTP component |
| `app/(main)/settings/page.tsx` | 3-step change-password dialog (PIN → new password → success checkmark) |
| `app/(auth)/forgot-password/page.tsx` | Recovery PIN tab default; email reset tab disabled with `Ban` icon |

### Auth Cookie Fix
| File | Change |
|------|--------|
| `internal/api/responses.go` | `SetAuthCookie`/`ClearAuthCookie` — dynamic `Secure` + `SameSite: None` when HTTPS |
| `internal/config/config.go` | Added `isHTTPS()` check |


## 25. Session 14 (July 5) — Problem Field Split, Monaco, CSP

### Problem Field Split
| File | Change |
|------|--------|
| `migrations/023_split_problem_fields.sql` | **NEW** — Adds `constraints TEXT`, `learning_objective TEXT` |
| `internal/store/types.go` | `Problem.Constraints`, `Problem.LearningObjective` |
| `internal/store/problems.go` | All 5 SELECT queries include new fields |
| `internal/api/responses.go` | API response includes `constraints`/`learningObjective` |
| `frontend/lib/types.ts` | `constraints?`, `learningObjective?` |
| `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` | Learning Objective callout + Constraints section |
| Seed files 1–4 (180 problems) | `statement` cleaned, structured fields populated |

### Monaco Editor Local Workers
| File | Change |
|------|--------|
| `scripts/copy-monaco.mjs` | **NEW** — copies Monaco web workers to `public/vs/` pre-build |
| `frontend/app/problems/[slug]/DynamicWorkspace.tsx` | **NEW** — Client Component wrapper for `next/dynamic` |
| `frontend/app/problems/[slug]/page.tsx` | Server component wraps `DynamicWorkspace` in `Suspense` |
| `frontend/next.config.ts` | CSP: `worker-src 'self' blob:` for Monaco workers |

### UI Polish
| File | Change |
|------|--------|
| `frontend/app/(main)/home/page.tsx` | Card excerpts strip markdown (`#`, `**`, code fences) |
| `frontend/app/problems/[slug]/success/page.tsx` | Confetti: 60 particles/side, 150ms interval, 3.5s duration, fires on data ready |
| `frontend/lib/toast.tsx` | Default duration 2s (was 4s) |

### Build Verification
- ✅ `go build ./cmd/server/`
- ✅ `go vet ./internal/...`


## 26. Session 15 (July 5) — Pagination, Back Button, Cache, Performance

### Pagination
| File | Change |
|------|--------|
| `frontend/app/(main)/home/page.tsx` | 18 items/page, first/prev/next/last nav, smart ellipsis, resets on filter |

### Back Button Module Context
| File | Change |
|------|--------|
| `frontend/app/(main)/home/page.tsx` | Reads `?module=` from URL on mount |
| `frontend/app/(main)/problems/[slug]/success/page.tsx` | Links use `/home?module=...` |
| `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` | Navigation preserves module context |

### SessionStorage Caching
| File | Change |
|------|--------|
| `frontend/lib/cache.ts` | **NEW** — generic sessionStorage cache with 30s TTL |
| `frontend/lib/api.ts` | `fetchApi` cached GET responses; `user-updated` handler debounced 300ms |
| `frontend/app/(main)/home/page.tsx` | Stores all problems in `koder_all_problems` |
| `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` | Stores problem in `koder_problem_{slug}` |

### Performance
| File | Change |
|------|--------|
| `frontend/app/(main)/home/page.tsx` | `filteredProblems` wrapped in `useMemo`; `handleSelectModule` in `useCallback` |
| `frontend/components/dashboard/ModuleCards.tsx` | Wrapped in `React.memo` |
| `frontend/app/layout.tsx` | `<link rel="preconnect">` for API domain |

### Build Verification
- ✅ `go build ./cmd/server/`


## 27. Session 16 (July 6) — Error Handling Overhaul

### Friendly Errors
| File | Change |
|------|--------|
| `internal/store/errors.go` | **NEW** — `FriendlyError` type with `DUPLICATE_RESOURCE`/`NOT_FOUND`/`VALIDATION_ERROR` codes |
| `internal/store/errors.go` | `IsUniqueViolation()` — maps PG constraint names to human-readable messages |
| `internal/store/users.go` | `CreateUser`, `CreateUserFromGoogle` return `NewDuplicateError` on unique violations |
| `internal/api/auth.go` | Register handler propagates `DUPLICATE_RESOURCE` with HTTP 409 |

### Build Verification
- ✅ `go build ./cmd/server/`
- ✅ `go vet ./internal/api/... ./internal/store/...`


## 28. Session 17 (July 6) — username_set Column + Registration Race Condition Fix

### Migration & Store
| File | Change |
|------|--------|
| `migrations/024_add_username_set.sql` | **NEW** — `ALTER TABLE users ADD COLUMN username_set BOOLEAN NOT NULL DEFAULT false` |
| `internal/store/types.go` | `User.UsernameSet bool`, `NewUser.UsernameSet bool` |
| `internal/store/store.go` | `UpdateUserUsernameSet()` added to Store interface |
| `internal/store/users.go` | All 7 SELECT queries include `username_set`; `UpdateUserUsernameSet()` implementation; `CreateUser`/`CreateUserFromGoogle` return `UsernameSet` value |

### Auth Flow
| File | Change |
|------|--------|
| `internal/api/auth.go` | Login/Google auth uses `!user.UsernameSet` instead of `strings.HasPrefix` heuristic; `CompleteOnboarding` sets `username_set = true` |
| `internal/api/me.go` | `PUT /me/username` — validates username, checks uniqueness, sets `username_set = true`; returns 403 if already set |
| `internal/api/router.go` | `PUT /me/username` route added |

### Frontend
| File | Change |
|------|--------|
| `frontend/lib/types.ts` | `usernameSet?: boolean` added to `User` type |
| `frontend/lib/api.ts` | `fetchUser` maps `username_set`; `updateUsername()` function |
| `frontend/app/(main)/settings/page.tsx` | Editable username field when `usernameSet === false`; read-only when set |

### Build Verification
- ✅ `go build ./cmd/server/`
- ✅ `go vet ./internal/...`

---

## 29. Session 18 (July 6) — 404 Page, GOT/WANT Fix, Solved Guard, TerminalDiff, Error Standardization

### Commits
| Hash | Description |
|------|-------------|
| `226426e` | Professional 404 page: layered visual hierarchy, responsive layout, Home + Go Back actions |
| `59f805f` | Professional got/want TerminalDiff + solved guard + error standardization |

### Professional 404 Page
| File | Change |
|------|--------|
| `frontend/app/not-found.tsx` | **NEW** — Terminal icon, gradient "404" heading, HelpCircle subtitle, Home + Go Back buttons, shadcn Card |

### GOT/WANT Parser Fix (Broken Since Inception)
**Problem:** `t.Errorf` prefixes each output line with `\tfile:line: `. The anchor `^GOT:` never matched these prefixed lines. `gotMap`/`wantMap` were always empty.

| File | Change |
|------|--------|
| `internal/executor/executor.go` | `^GOT:` → `(?:\s|^)GOT:\s+` in both `Execute` and `ExecuteVisibleOnly`; same for `WANT:` and `=== FAIL: Case` |
| `internal/executor/executor.go` | Multi-line got/want: empty lines preserved instead of skipped |
| `internal/executor/executor.go` | `friendly_message` for compiler errors and timeouts added |

### Solved Status Guard
| File | Change |
|------|--------|
| `internal/store/store.go` | `GetProblemBySlug(ctx, slug, userID)` signature updated |
| `internal/store/problems.go` | SQL: `LEFT JOIN progress ... user_id = $2`, `COALESCE(pr.solved, false)` |
| `internal/api/submissions.go` | Returns `409 ALREADY_SOLVED` when solved |
| `internal/api/test.go` | Passes userID but no solved guard |
| `internal/api/community.go` | Passes `uuid.Nil` to updated signature |
| `frontend/.../ProblemWorkspaceClient.tsx` | Submit `disabled` when solved, `CheckCircle2` + "Solved" badge; Test stays active |

### TerminalDiff Component
| File | Change |
|------|--------|
| `frontend/components/TestResultPanel.tsx` | LCS `computeLineDiff()` + `TerminalDiff`: git-style `-/+` unified diff with line numbers |
| | Single-line: side-by-side `Got → Expected` grid |
| | Multi-line: unified diff with dual line numbering |
| | Removed `computeWordDiff()`, `ArrowRight` SVG, `AlertTriangle` import |

### Error Message Standardization
| File | Change |
|------|--------|
| `frontend/app/(main)/contribute/page.tsx` | P0: `setError(err.message)` → `setError(err.message \|\| "Failed to submit contribution")` |
| `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` | P1: `toast.error(res.error.message)` → `toast.error(res.error?.message \|\| "...")` |
| All 6 auth/settings pages | `'Network error'` → `'Unable to connect. Please try again.'` |
| `internal/api/pin_reset.go` | `"Try again later"` → `"Please wait 15 minutes"` |

### Build Verification
- ✅ `go vet ./internal/...`
- ✅ `npx tsc --noEmit`
- ✅ `git push` (commit `59f805f`)

---

## 30. Session 19 (July 5) — PIN-based Password Management (Professional Flow)

### Backend
| File | Change |
|------|--------|
| `internal/api/change_password.go` | **NEW** — `POST /auth/change-password`: verifies 6-digit PIN via bcrypt + updates password |
| `internal/api/pin_reset.go` | PIN-based forgot-password flow with 5-attempt/15-min rate limiter |
| `internal/api/responses.go` | `isHTTPS()` helper — checks `X-Forwarded-Proto` (Render proxy) + `r.TLS` |
| `internal/api/router.go` | Added change-password route; reset-password-pin route |
| `migrations/022_add_pin_hash.sql` | **NEW** — Adds `pin_hash TEXT` column to users |

### Frontend
| File | Change |
|------|--------|
| `components/base/input/pin-input.tsx` | **NEW** — shadcn/input-otp based PinInput with `mask` prop |
| `components/ui/input-otp.tsx` | **NEW** — shadcn InputOTP component |
| `app/(main)/settings/page.tsx` | 3-step change-password dialog (PIN → new password → success checkmark) |
| `app/(auth)/forgot-password/page.tsx` | Recovery PIN tab default; email reset tab disabled with `Ban` icon |

### Auth Cookie Fix
| File | Change |
|------|--------|
| `internal/api/responses.go` | `SetAuthCookie`/`ClearAuthCookie` — dynamic `Secure` + `SameSite: None` when HTTPS |
| `internal/config/config.go` | Added `isHTTPS()` check |

### Build Verification
- ✅ `go build ./cmd/server/`
- ✅ `go vet ./internal/...`

---

## 31. Session 20 (July 5) — Problem Field Split, Monaco Local, CSP, Confetti, Pagination

### Problem Field Split
| File | Change |
|------|--------|
| `migrations/023_split_problem_fields.sql` | **NEW** — Adds `constraints TEXT`, `learning_objective TEXT` |
| `internal/store/types.go` | `Problem.Constraints`, `Problem.LearningObjective` |
| `internal/store/problems.go` | All 5 SELECT queries include new fields |
| `internal/api/responses.go` | API response includes `constraints`/`learningObjective` |
| `frontend/lib/types.ts` | `constraints?`, `learningObjective?` |
| `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` | Learning Objective callout + Constraints section |
| Seed files 1–4 (180 problems) | `statement` cleaned, structured fields populated |

### Monaco Editor Local Workers
| File | Change |
|------|--------|
| `scripts/copy-monaco.mjs` | **NEW** — copies Monaco web workers to `public/vs/` pre-build |
| `frontend/app/problems/[slug]/DynamicWorkspace.tsx` | **NEW** — Client Component wrapper for `next/dynamic` |
| `frontend/app/problems/[slug]/page.tsx` | Server component wraps `DynamicWorkspace` in `Suspense` |
| `frontend/next.config.ts` | CSP: `worker-src 'self' blob:` for Monaco workers |

### UI Polish
| File | Change |
|------|--------|
| `frontend/app/(main)/home/page.tsx` | Card excerpts strip markdown (`#`, `**`, code fences) |
| `frontend/app/problems/[slug]/success/page.tsx` | Confetti: 60 particles/side, 150ms interval, 3.5s duration, fires on data ready |
| `frontend/lib/toast.tsx` | Default duration 2s (was 4s) |

### Build Verification
- ✅ `go build ./cmd/server/`
- ✅ `go vet ./internal/...`

---

## 32. Session 21 (July 5) — Pagination, Back Button, Cache, Performance

### Pagination
| File | Change |
|------|--------|
| `frontend/app/(main)/home/page.tsx` | 18 items/page, first/prev/next/last nav, smart ellipsis, resets on filter |

### Back Button Module Context
| File | Change |
|------|--------|
| `frontend/app/(main)/home/page.tsx` | Reads `?module=` from URL on mount |
| `frontend/app/(main)/problems/[slug]/success/page.tsx` | Links use `/home?module=...` |
| `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` | Navigation preserves module context |

### SessionStorage Caching
| File | Change |
|------|--------|
| `frontend/lib/cache.ts` | **NEW** — generic sessionStorage cache with 30s TTL |
| `frontend/lib/api.ts` | `fetchApi` caches GET responses; `user-updated` handler debounced 300ms |
| `frontend/app/(main)/home/page.tsx` | Stores all problems in `koder_all_problems` |
| `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` | Stores problem in `koder_problem_{slug}` |

### Performance
| File | Change |
|------|--------|
| `frontend/app/(main)/home/page.tsx` | `filteredProblems` in `useMemo`; `handleSelectModule` in `useCallback` |
| `frontend/components/dashboard/ModuleCards.tsx` | `React.memo` wrapper |
| `frontend/app/layout.tsx` | `<link rel="preconnect">` for API domain |

### Build Verification
- ✅ `go build ./cmd/server/`

---

## 33. Session 22 (July 6) — Error Handling Overhaul + Registration Race Condition Fix

### Friendly Errors
| File | Change |
|------|--------|
| `internal/store/errors.go` | **NEW** — `FriendlyError` type with `DUPLICATE_RESOURCE`/`NOT_FOUND`/`VALIDATION_ERROR` codes |
| `internal/store/errors.go` | `IsUniqueViolation()` — maps PG constraint names to human-readable messages |
| `internal/store/users.go` | `CreateUser`, `CreateUserFromGoogle` return `NewDuplicateError` on unique violations |
| `internal/api/auth.go` | Register handler propagates `DUPLICATE_RESOURCE` with HTTP 409 |

### username_set Column
| File | Change |
|------|--------|
| `migrations/024_add_username_set.sql` | **NEW** — `ALTER TABLE users ADD COLUMN username_set BOOLEAN NOT NULL DEFAULT false` |
| `internal/store/types.go` | `User.UsernameSet`, `NewUser.UsernameSet` |
| `internal/store/store.go` | `UpdateUserUsernameSet()` added to Store interface |
| `internal/store/users.go` | All 7 SELECT queries include `username_set` |
| `internal/api/auth.go` | Login uses `!user.UsernameSet` instead of `strings.HasPrefix` |
| `internal/api/me.go` | `PUT /me/username` — sets username_set = true; 403 if already set |
| `frontend/lib/types.ts` | `usernameSet?: boolean` |
| `frontend/app/(main)/settings/page.tsx` | Editable username when `usernameSet === false` |

### Build Verification
- ✅ `go build ./cmd/server/`
- ✅ `go vet ./internal/...`

---

## 34. Session 23 (July 6) — 404 Page, GOT/WANT Fix, Solved Guard, TerminalDiff, Error Standardization

### Commits
| Hash | Description |
|------|-------------|
| `226426e` | Professional 404 page: layered visual hierarchy, responsive layout, Home + Go Back actions |
| `59f805f` | Professional got/want TerminalDiff + solved guard + error standardization |

### Professional 404 Page
| File | Change |
|------|--------|
| `frontend/app/not-found.tsx` | **NEW** — Terminal icon, gradient "404" heading, HelpCircle subtitle, Home + Go Back buttons, shadcn Card |

### GOT/WANT Parser Fix (Broken Since Inception)
| File | Change |
|------|--------|
| `internal/executor/executor.go` | `^GOT:` → `(?:\s\|^)GOT:\s+`; same for `WANT:` and `=== FAIL: Case`; multi-line accumulation fixed |

### Solved Status Guard
| File | Change |
|------|--------|
| `internal/store/store.go` | `GetProblemBySlug(ctx, slug, userID)` signature updated |
| `internal/store/problems.go` | SQL: `LEFT JOIN progress ... user_id = $2`, `COALESCE(pr.solved, false)` |
| `internal/api/submissions.go` | Returns `409 ALREADY_SOLVED` when solved |
| `frontend/.../ProblemWorkspaceClient.tsx` | Submit `disabled` when solved, `CheckCircle2` + "Solved" badge |

### TerminalDiff Component
| File | Change |
|------|--------|
| `frontend/components/TestResultPanel.tsx` | LCS `computeLineDiff()` + `TerminalDiff`: git-style `-/+` unified diff with line numbers |

### Error Message Standardization
| File | Change |
|------|--------|
| All auth pages | `'Network error'` → `'Unable to connect. Please try again.'` |
| `internal/api/pin_reset.go` | `"Try again later"` → `"Please wait 15 minutes"` |

### Build Verification
- ✅ `go vet ./internal/...`
- ✅ `npx tsc --noEmit`
- ✅ `git push` (commit `59f805f`)

---

## 35. Session 24 (July 6, cont.) — Admin Problem Editor, Report Issues, Broadcast Toggle, WebSocket Live Updates

### Commits
| Hash | Description |
|------|-------------|
| `bcf84ea` | Professional WebSocket live updates + optimized publish-all |

### Admin Problem Editor
| File | Change |
|------|--------|
| `internal/api/admin.go` | `UpdateProblem` handler — partial merge via pointer-optional fields; publishes `problem.updated` event |
| `internal/store/store.go` | Added `UpdateProblem(ctx, *Problem) (*Problem, error)` to Store interface |
| `internal/store/problems.go` | `UpdateProblem` implementation + `PublishAllDrafts` (single UPDATE, no N round-trips) |
| `internal/store/problems.go` | `GetProblemByID` implementation |
| `frontend/app/(main)/admin/ProblemEditPanel.tsx` | **NEW** — full dialog (Basic Info, Description, Func Signature, Hints, Visibility, live preview toggle) |
| `frontend/app/(main)/admin/page.tsx` | Pencil edit button per problem; WebSocket subscriptions replace 15s polling |

### Problem Reporting System
| File | Change |
|------|--------|
| `migrations/025_report_issue_fields.sql` | **NEW** — adds `problem_slug`, `code_snippet`, `error_message` to feedback table |
| `internal/store/feedback.go` | `GetProblemReports` — filters bug-type feedback by problem slug |
| `internal/api/feedback.go` | `ListProblemReports` handler + `feedback.submitted` event publishing |
| `frontend/app/(main)/admin/ProblemReports.tsx` | **NEW** — grouped by problem slug, status filters, expandable rows, inline code/error |
| `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` | "Report Bug" button always visible in toolbar + dialog with pre-filled context |

### Broadcast Toggle System
| File | Change |
|------|--------|
| `internal/store/broadcasts.go` | `ActivateBroadcast` store method |
| `internal/api/broadcasts.go` | `Activate` handler + `PATCH /admin/broadcasts/{id}/activate` route |
| `frontend/app/(main)/admin/BroadcastPanel.tsx` | Redesigned with per-broadcast toggle switch, WebSocket subscriptions, optimistic UI |

### WebSocket Live Updates
| File | Change |
|------|--------|
| `internal/broker/broker.go` | **NEW** — in-memory pub/sub with Subscribe/Unsubscribe/Publish, non-blocking sends |
| `internal/api/ws.go` | **NEW** — WebSocket upgrade handler using gorilla/websocket (auth-protected) |
| `internal/api/router.go` | Registers `GET /ws` + passes broker to AdminHandler, BroadcastsHandler, FeedbackHandler |
| `cmd/server/main.go` | Creates broker, passes to `NewRouter` |
| `frontend/lib/event.ts` | **NEW** — typed `useWebSocket` hook with auto-reconnect and exponential backoff |
| `frontend/app/(main)/admin/page.tsx` | Uses `useWebSocket` subscriptions; optimistic visibility toggles (update local state immediately, revert on error) |

### Performance
| File | Change |
|------|--------|
| `internal/store/problems.go` | `PublishAllDrafts` — single `UPDATE SET visible = true WHERE NOT visible` instead of fetch-all + N round trips |
| `frontend/app/(main)/admin/page.tsx` | Polling reduced from 15s to 60s (WebSocket handles real-time); `loadData` wrapped in `useCallback` |

### Build Verification
- ✅ `go build ./...`
- ✅ `npx tsc --noEmit`

---

## 36. Session 25 (July 6) — Google Auth 502 Fix + RecoveryMiddleware

### Commits
| Hash | Description |
|------|-------------|
| `f2605dc` | Fix Google auth 502: remove nil pem.Encode in jwksKeyToPublicKey, add RecoveryMiddleware |

### Problem
`POST /auth/google` returned HTTP 502 when Google's JWKS endpoint returned multiple keys. `jwksKeyToPublicKey` called `pem.Encode(nil, ...)` which panics because Go's `pem` package cannot write to a nil writer. The panic crashed the goroutine, causing a 502.

### Fixes
| File | Change |
|------|--------|
| `internal/auth/oauth.go` | Removed `pem.Encode(nil, ...)` panic; removed unused `crypto/x509` and `encoding/pem` imports; replaced with raw `x509.ParsePKIXPublicKey` |
| `internal/api/middleware.go` | Added `RecoveryMiddleware` that catches panics and returns JSON 500 with `PANIC` error code |
| `internal/api/router.go` | Registered `RecoveryMiddleware` as first middleware |

### Build Verification
- ✅ `go build ./...`
- ✅ `npx tsc --noEmit`

---

## 37. Session 26 (July 6) — Module Card Images: Key Alignment, Local Image, All Modules

### Commits
| Hash | Description |
|------|-------------|
| `5f73879` | Fix module card image loading: align MODULE_META keys with API slugs, add display name mapping, use local arrays-strings image |
| `c093540` | Replace arrays-strings module image with professional version |
| `0ecd5ef` | Use local image for all module cards |

### Root Cause
`MODULE_META` keys were display names (`"Arrays & Slices"`) but the API returns lowercase hypenated slugs (`"arrays-strings"`). Every module fell through to the Unsplash fallback — module images never showed for any module.

### Fixes
| File | Change |
|------|--------|
| `frontend/components/dashboard/ModuleCards.tsx` | Changed all `MODULE_META` keys from display names to lowercase-hyphenated slugs; added `MODULE_DISPLAY_NAMES` mapping for card titles; replaced all Unsplash URLs with `MODULE_IMAGE` constant pointing to `/modules/arrays-strings.png`; updated fallback to use same local image |
| `frontend/public/modules/arrays-strings.png` | Replaced with professional ChatGPT-generated image |

### Build Verification
- ✅ Pushed to `update` branch (`0ecd5ef`)

---

## 38. Session 27 (July 11) — Google Auto-Registration, Navigation Redux, Refresh Token Fix

### Goal
Enable Google auto-registration for new users (no 404) while keeping email/password auth intact. Fix browser back button navigation to behave as a proper stack (not skipping to home).

### Changes

#### Google Auto-Registration
| File | Change |
|------|--------|
| `internal/api/auth.go:257-278` | Auto-create branch now uses `h.issueTokens(...)` instead of raw `auth.SignToken` — fixes **critical bug** where new Google users got no refresh token and were logged out after 15 min |
| `internal/store/users.go:81-142` | `CreateUserFromGoogle()` — creates account with temp username, no PIN, `username_set=false` |
| `internal/store/store.go:44` | Added `CreateUserFromGoogle` to Store interface |
| `internal/store/types.go:82-93` | `NewUser` struct with `GoogleID`, `GoogleAvatarURL` fields |

#### Navigation Fixes
| File | Change |
|------|--------|
| `frontend/app/(auth)/login/page.tsx` | `router.push('/')` → `router.push('/home')` (2 places) |
| `frontend/app/(auth)/register/page.tsx` | `router.push('/')` → `router.push('/home')` (2 places) |
| `frontend/app/(main)/admin/page.tsx` | `router.push('/')` → `router.push('/home')` |
| `frontend/app/oauth/callback/page.tsx` | `router.push('/')` → `router.push('/home')` |
| `frontend/components/layout/TopNav.tsx:68` | Problems link href changed from `/` → `/problems` |
| `frontend/app/(main)/contribute/page.tsx` | Removed `router.replace`+`setTimeout` chain, direct `router.push("/profile")` |

#### New `/problems` Listing Page
| File | Change |
|------|--------|
| `frontend/app/(main)/problems/page.tsx` | **NEW** — 282-line client component with search, language filter tabs (All/Go/Python), pagination (18/page), header image |

#### Workspace Layout
| File | Change |
|------|--------|
| `frontend/app/problems/layout.tsx` | **NEW** — minimal layout with `UserProvider` + `TopNav` + `FeedbackButton` (no max-width container for full-screen editor) |

#### Bug Fixes (Audit-Driven)
| Fix | File |
|-----|------|
| Settings logout redirect `/auth/login` (404) → `/login` | `settings/page.tsx:226,234` |
| Success page hardcoded `language: "go"` → dynamic from localStorage | `success/page.tsx:247-248, 335-336` |
| Removed unused `ChevronRight` import | `success/page.tsx:20` |
| Removed unused `getDifficultyLabel` import | `problems/page.tsx:17` |

### Verification
- ✅ `go vet ./internal/...` — clean
- ✅ `go test ./internal/...` — all 124 pass, 0 failures
- ✅ `go build ./cmd/server/...` — clean
- ✅ `go vet ./sandbox/...` + `go build ./sandbox/...` — clean
- ✅ Commit `ef86884` pushed to `python-curricula`

---

## Known Issues & Next Steps

### Commits
| Hash | Description |
|------|-------------|
| `5f73879` | Fix module card image loading: align MODULE_META keys with API slugs, add display name mapping, use local arrays-strings image |
| `c093540` | Replace arrays-strings module image with professional version |
| `0ecd5ef` | Use local image for all module cards |

### Root Cause
`MODULE_META` keys were display names (`"Arrays & Slices"`) but the API returns lowercase hypenated slugs (`"arrays-strings"`). Every module fell through to the Unsplash fallback — module images never showed for any module.

### Fixes
| File | Change |
|------|--------|
| `frontend/components/dashboard/ModuleCards.tsx` | Changed all `MODULE_META` keys from display names to lowercase-hyphenated slugs; added `MODULE_DISPLAY_NAMES` mapping for card titles; replaced all Unsplash URLs with `MODULE_IMAGE` constant pointing to `/modules/arrays-strings.png`; updated fallback to use same local image |
| `frontend/public/modules/arrays-strings.png` | Replaced with professional ChatGPT-generated image |

### Build Verification
- ✅ Pushed to `update` branch (`0ecd5ef`)

---

## Known Issues & Next Steps

- [ ] Run migration `022_add_pin_hash.sql` against the database
- [ ] Run migration `023_split_problem_fields.sql` against the database
- [ ] Run migration `024_add_username_set.sql`
- [ ] Run migration `025_report_issue_fields.sql`
- [ ] Set `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env vars
- [ ] Add `http://localhost:3000` and Vercel domain to Authorized JavaScript origins in Google Cloud Console
- [ ] Test Google Sign-In on production HTTPS URL
- [ ] Test account deletion end-to-end
- [ ] Merge `update` branch into `main` to deploy to production

---

## Session 16 — 2026-07-09

### Goal
Fix Python compiler error formatting so tracebacks and syntax errors show proper line numbers.

### Tasks Completed
1. Fixed `isPythonErrorLine` in `sandbox/main.go` to use a colon-based heuristic for Python exceptions.
2. Fixed a variable shadowing bug in `internal/executor/executor.go` where `sandboxError` was scoped locally inside an `if` block, preventing propagation.
3. Verified full test suite passes (124 tests).

---

## Session 39 — 2026-07-16 — Lesson step-by-step navigation, Pyodide polish, code block dark mode fix

### Goal
Restructure lesson viewer to show sections as individual step-by-step pages with quiz consolidation, fix Pyodide execution issues, and repair code block dark mode rendering.

### Commits
| Hash | Description |
|------|-------------|
| `8e6f7d1` | Implement input() via window.prompt in Pyodide |
| `3434279` | Fix no-output in free-form Python: use standalone print templates |
| `472554f` | Block input() in Pyodide with friendly error message |
| `4b4bb4e` | Fix double prompt prefix in Pyodide console output |
| `d947af5` | Fix Run in Browser disabled state & match editor theme with ProblemWorkspaceClient |
| `005ccc8` | Rewrite lesson as step-by-step page with quiz consolidation |
| `12b7a45` | Fix code block dark mode & exercise results spacing |

### Changes

#### Lesson step-by-step navigation
- Sections shown one at a time with prev/next buttons and ArrowLeft/Right/Space keyboard shortcuts
- All quizzes consolidated into a single Quiz Review step at the end with gradient card
- Progress bar with step indicator dots and step counter
- Professional gradient-bordered card component per section type with AnimatePresence transitions

#### Pyodide console & execution fixes
- `input()` now works via `window.prompt()` shim installed at init time (removed blocking check)
- Removed `!pyodideReady` guard on Run in Browser button so lazy Pyodide can be triggered
- Fixed `handlePyodideRun` with try/finally `setTesting(true/false)`
- Fixed double prompt prefix (`> >>>` → `> `)
- Replaced emoji/special char console prefixes (`✗`/`ℹ`/`❯` → `[error]`/`[info]`/`>`)
- Free-form Python defaults to standalone `print()` templates

#### Editor theme & spacing alignment
- Editor options aligned with ProblemWorkspaceClient (fontFamily, bracketPairColorization, smoothScrolling)
- Results panel now shows for all languages (not just non-Python)
- Results padding increased (`px-1`→`px-2`, `mt-4`→`mt-5`)

#### Code block dark mode fix
- Added `darkModeClassNames` + `codeBlockClassName` + `lineHighlightClassNames` to `CodeBlockContent` rendered div (was rendering Shiki HTML without dark mode CSS)
- Fixed `CodeBlockFallback` with proper dark mode text color, padding, overflow

### Verification
- `npx tsc --noEmit` — clean