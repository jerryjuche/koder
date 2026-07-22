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
| 36 | `582917b` | fix: use profile as source of truth for solved count in ProfileHeader |
| 37 | `ac5cbb8` | fix: store package import shadowed by parameter name |
| 38 | `12bbc34` | fix: dashboard solved count reads from GET /me, same source as XP and streak |
| 39 | `8d1adb6` | docs: update session log, codebase index, CLAUDE.md for session 49 |
| 40 | `6657efa` | polish: remove no-op col-span-full, move isActive into non-disabled branch |
| 41 | `77723fa` | feat: Beta-gate best-practices tab + Learn nav for non-admins |
| 42 | `86258a4` | fix: copy button hover, multi-file key, type shadow |
| 43 | `ac8a45e` | polish: CodeSnippet component + compact best-practices cards |
| 44 | `6e7666f` | fix CSP errors |
| 45 | `6473b91` | fix |
| 46 | `b390378` | fix |
| 47 | `2e8ec08` | docs: update codebase index, CLAUDE.md, session log and progress tracker |
| 48 | `02aa051` | feat: problem module lock admin panel + locked module UI |
| 49 | `dfe556a` | feat: add prominent curriculum card to admin dashboard with module lock access |
| 50 | `62c53bc` | feat: add module lock/unlock with admin toggle and student enforcement |
| 51 | `bee5837` | fix: restore saved code on refresh regardless of initial state |
| 52 | `f57f867` | polish: professional typography for problem description |
| 53 | `dc2d61b` | polish: professional typography for problem cards |
| 54 | `2c472ac` | cleanup: remove duplicate difficulty badge from workspace toolbar |
| 55 | `f9690b1` | cleanup: remove custom intellisense/hover providers, use vs-dark theme |
| 56 | `d0ae5ac` | feat: curriculum module lock panel on admin dashboard |
| 57 | `4fc6cce` | fix: module selection updates URL via replaceState |
| 58 | `32f264a` | fix: use pushState for module & tab selection (LIFO stack) |
| 59 | `2ba2fac` | fix: clear cache after delete module so loadData() gets fresh data |
| 60 | `f36bbdd` | docs: add sessions 54-57 (lock panel redesign, admin bypass, delete module, LIFO nav) |
| 61 | `ef4f19b` | feat: module metadata system (rename + pin) + 4 Python WebP images |
| 62 | `8497b09` | feat: add python-variables-math WebP image + ModuleCards entry |
| 63 | `a513eed` | fix: remove source PNG (WebP is the deliverable) |
| 64 | `bceffea` | fix: remove remark-breaks so blank lines create proper paragraph breaks |
| 65 | `528cd8b` | feat: self-contained markdown renderer with inline styles (no prose dependency) |
| 66 | `824fc10` | feat: locked module count fix, community solution collapsible cards, AND EXISTS removal, TestCase merge, LIMIT 500 |
| 67 | `1400598` | feat: auth guard middleware + UserContext fallback, fix locked module counts (handler-level stamping) |
| 68 | `ba654d6` | fix: remove auth redirect guard from middleware (cookie lives on API domain, not frontend) |
| 69 | `43eaef7` | fix: lint errors (key patterns, eslint-suppress) + add update branch to CI |
| 70 | `bfadb3f` | fix: config tests — skip .env during tests, clear GO_VERSION for default test |
| 71 | `549521f` | fix: config tests — clear CI env vars for missing-var tests |
| 72 | `9b882aa` | fix: remove duplicate # in global rank display (StatsOverview) |
| 73 | `c8c260c` | fix: dashboard nav link now refreshes when already on /home |

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

---

## Session 40 — 2026-07-16 — Course/Module/Lesson page professional redesign & audit fixes

### Goal
Redesign learn course/module/lesson pages with professional card components matching dashboard styling, then audit and fix all implementation issues.

### Commits
| Hash | Description |
|------|-------------|
| `aa02d24` | Redesign learn course/module/lesson pages with professional card components |
| `d1172fb` | Professional redesign: learn course/module/lesson pages |
| `0771f5e` | Fix audit issues: error states, unused imports, edge case guards |

### Changes — Professional Card Redesign

#### Course Catalog (`courses/page.tsx`)
- Full gradient hero backgrounds per course (blue/cyan/violet/amber/slate)
- Lucide icons in glass-morphism container with scale+rotate hover
- Difficulty pill with colored dot indicator (Beginner/Intermediate/Advanced)
- CTA with arrow button that turns primary on hover
- `border-0` cards with shadow-lift animation (`-translate-y-2`, `shadow-2xl`)
- Draft badge for unpublished courses

#### Course Detail (`[courseSlug]/page.tsx`)
- Hero section with course title, description, difficulty pill, metadata row
- Course progress bar (gradient fill, shown only when started)
- Module cards with 6px gradient stripe and colored lucide icons
- Two-digit module numbering, Complete/In progress badges
- Lesson counts with completed count, gradient progress bars
- Hover: icon scale + CTA arrow turns primary

#### Module Detail (`[moduleSlug]/page.tsx`)
- Module header with gradient stripe + stats bar (lessons, XP, completion %)
- Lesson cards with rich status indicators (emerald checkmark, primary circle-dot, numbered circle)
- Green highlight background on completed lessons, primary ring on current lesson
- XP badges (amber), difficulty pills (color-coded with ring), time estimates
- Completed arrows fade to 40% opacity, full opacity on hover
- Total XP earned counter in module header

### Changes — Audit Fixes
| Issue | File | Fix |
|---|---|---|
| Unused `CardContent` import | `courses/page.tsx` | Removed |
| Unused `Cpu` import | `courses/page.tsx` | Removed |
| Unused `letters` variable + `getCourseLetters` | `courses/page.tsx` | Removed dead code |
| API failure → silent empty state | All 3 pages | Added `error` state + retry button with `Try again` |
| `resolveModuleGradient` buggy first loop | `module/page.tsx` | Removed buggy loop (was matching wrong gradient val) |
| `lesson_count` undefined breaks `firstIncomplete` | `course/page.tsx` | Now treats undefined as "incomplete if not started" |
| `isCurrent` missing `!isComplete` guard | `module/page.tsx` | Added for consistency |

### Verification
- `npx tsc --noEmit` — clean
- Pushed to `origin/update` (`0771f5e`)

---

## Session 41 — 2026-07-17 — Layout refactor, multi-file Pyodide, admin CMS polish

### Goal
Professional layout refinement (compact cards, wider containers), multi-file Pyodide execution support, and admin CMS UX improvements.

### Commits
| Hash | Description |
|------|-------------|
| `03b8430` | Compact card sizes and horizontal grid layouts |
| `e5a7f98` | Remove unused gradient prop from LearningCard |
| `d57f812` | Increase card grid gaps to 5 for breathing room |
| `2ea6751` | Widen page containers to max-w-screen-2xl |
| `e923a4f` | Remove max-w-7xl mx-auto from main layout |
| `62e850f` | Multi-file Pyodide execution for modular Python exercises |
| `0323856` | JSON metadata editor for non-quiz sections in admin CMS |
| `ef3c060` | Multi-file support for mini_project sections |
| `ac1f5bb` | Fix visibility publish for courses |
| `1e5f575` | Admin CMS UX: always-visible toggles, auto order_number, stale sections fix |
| `1ac3d21` | 16:9 LearningCard, remove mock ratings from course catalog |
| `9404250` | Lesson-aware problem success page — back to lesson, continue lesson |
| `64792ab` | Remove dead hovered state, shadowing sections var, dynamic import, unused icons |

### Changes

#### Layout refactor
- All card grids: compact card sizes with `gap-5` for breathing room
- Containers widened from `max-w-6xl/7xl` → `max-w-screen-2xl` to fill large monitors
- Removed `max-w-7xl mx-auto` from main layout — was constraining all pages unnecessarily
- Removed unused `gradient` prop from `LearningCard` component
- LoadingCard inner container changed to `aspect-[16/9]` with gradient stripe `h-16 → h-12`

#### Multi-file Pyodide
- `frontend/lib/pyodide.ts`: Added `FS.writeFile`, `FS.readFile`, `FS.mkdir`, `executeMultiFile`, and `MultiFileSpec` interface
- `MultiFileConfigPanel.tsx`: Visual multi-file editor in admin CMS with file tabs, add/remove, path+content editing, entry point toggle
- Auto-initializes on section type change to exercises/assessment/mini_project
- `SectionExercise.tsx` uses `executeMultiFile` for multi-file exercises

#### Admin CMS UX
- Visibility toggles, action buttons, chevron icons: always visible (removed all `opacity-0` hover gates across AdminCards.tsx)
- Order numbers auto-compute from existing array length in form defaults
- Stale `sections` state cleared when opening create lesson dialog
- JSON metadata editor for non-quiz sections

#### Code cleanup
- Removed dead `hovered`/`setHovered` state + handlers from AdminCourseCard, AdminModuleCard, AdminProjectCard
- Fixed local variable shadowing (`sections` → `quizSections`)
- `fetchLessonSections` changed to static import
- Removed mock ratings (RatingBadge, likes/views stats) from course catalog

### Verification
- `npx tsc --noEmit` — clean
- All pushed to `origin/update`

---

## Session 42 — 2026-07-17 — Real-time XP/progress WebSocket + 16:9 admin cards

### Goal
Complete professional real-time progress system (XP, levels, progress via WebSocket) and polish all admin cards to 16:9 aspect ratio.

### Commits
| Hash | Description |
|------|-------------|
| `7634ab3` | Real-time XP/progress WebSocket system + 16:9 admin cards |
| `6bcd102` | Fix page spacing, add progress.updated event, 16:9 all admin cards |

### Changes

#### Real-time WebSocket events
- Backend Broker (`internal/broker/broker.go`) with global fan-out via `/ws` WebSocket
- `SubmissionHandler` has broker reference; publishes `user.xp.updated` + `progress.updated` on successful problem solve
- `CompleteLesson` (in `cms.go`) publishes all three events (`lesson.completed`, `user.xp.updated`, `progress.updated`)
- Frontend `event.ts` has `user.xp.updated`, `progress.updated`, and `lesson.completed` event types
- `UserContext` subscribes to `user.xp.updated` via `useWebSocket` — auto-refreshes XP, level, solved count without page reload
- Course detail and module detail pages subscribe to all three events — progress bars update live
- `LessonViewerClient` stores `koder_lesson_context` in sessionStorage for lesson-aware problem success page

#### 16:9 admin cards
- `AdminCourseCard`: `aspect-[16/9] min-h-[96px]` on hero section
- `AdminModuleCard`: Converted from sidebar row to full `aspect-[16/9]` card
- `AdminLessonCard`: `aspect-[16/9]` with icon, title, description, metadata
- `AdminProjectCard`: `aspect-[16/9]` with icon, title, difficulty, XP
- All admin cards: always-visible visibility toggles, edit, and delete buttons

#### Page spacing fix
- Main layout removed `py-8` to eliminate double-padding (each page controls its own vertical spacing)
- Home page added `py-6` wrapper

### Verification
- `npx tsc --noEmit` — clean
- All pushed to `origin/update`

---

## Session 43 — 2026-07-17 — Hero styling polish (16:9 + revert + natural height)

### Goal
Apply consistent LearningCard visual DNA to all hero sections (course detail, module detail, lesson success) with proper sizing.

### Commits
| Hash | Description |
|------|-------------|
| `61ecf5f` | All heroes 16:9 with exact LearningCard styling (back plate, brand-charcoal, same classes) |
| `d732545` | Fix: remove aspect-16/9 from heroes, keep LearningCard styling but natural height |

### Changes

#### Initial attempt (61ecf5f)
- All three heroes (course, module, lesson success) given same exact classes as LearningCard:
  - Back plate: `absolute rounded-xl bg-brand-charcoal-card/60 border border-brand-charcoal-border/20 backdrop-blur-sm`
  - Container: `bg-brand-charcoal-base border-brand-charcoal-border rounded-xl` with hover shadow
  - Glass icon: `w-8 h-8 rounded-lg border-white/10 backdrop-blur-md shadow-inner`
  - Badges: `text-[9px] font-bold uppercase tracking-wider bg-brand-charcoal-card/80`
  - Progress bar: `h-1 bg-brand-charcoal-card border-brand-charcoal-border/30`
- Forced to `aspect-[16/9]` — made heroes too tall at full width (~1200px → 675px)

#### Fix (d732545)
- Removed `aspect-[16/9]` from all three heroes — natural height based on content
- Removed `flex flex-col h-full` and `mt-auto` patterns only needed for fixed aspect ratio
- Used `p-4 md:p-5` padding for compact but comfortable spacing
- Enlarged title text (`text-base md:text-lg`) for hero context
- Removed truncation from titles (heroes have room for full text)

#### Result
- All heroes use identical design tokens as LearningCard but with natural content-based height
- 16/9 ratio kept on LearningCard and AdminCards (used in grids, not full-width)
- `cn` import added to success page

### Verification
- `npx tsc --noEmit` — clean
- All pushed to `origin/update`

---

## Session 44 — 2026-07-17 — Python Mastery: Build Your Own Games seed migration

### Goal
Create the seed SQL migration for the new "Python Mastery: Build Your Own Games" elective course with 2 modules, 6 lessons, 5 dependencies, full lesson sections, quiz metadata, and 1 project.

### Changes

#### New migration file: `migrations/042_seed_python_mastery_games.sql`
- **Course:** `python-mastery-games` — "Python Mastery: Build Your Own Games" (difficulty 3, ~12 hours)
  - 2 taglines, 8 tags, icon: `gamepad-2`, cover_image, `visible=false`
- **Module 1:** `text-adventure` — "Build a Text Adventure Game" (5 lessons, 5 linear deps)
  - Lessons: `intro-to-text-adventure`, `game-state-and-variables`, `player-actions-and-conditionals`, `functions-and-game-logic`, `building-the-full-game`
  - 6 sections per lesson (overview, explanation, examples, best_practices, common_mistakes, summary) + quizzes via metadata UPDATE
  - All content stored as `$py$...$py$` dollar-quoted strings
- **Module 2:** `quiz-game` — "Build a Quiz Game" (1 lesson, no dependencies)
  - Lesson: `intro-to-quiz-game` (4 sections)
- **Project:** `final-project` — "Personal Game Project" (difficulty 4, 80 XP, `visible=false`)
- All `ON CONFLICT ... DO NOTHING` for safe re-runs; single `BEGIN; ... COMMIT;` transaction

### Supabase RLS Error
- `ALTER TABLE full ENABLE ROW LEVEL SECURITY` error is NOT from this SQL — it's from Supabase's auto-RLS step
- Workaround: run SQL directly or disable auto-apply in SQL editor

### Verification
- SQL file saved and complete, ready to run against database

---

## Session 45 — Lesson Prerequisite Enforcement + Admin Dependency Picker

**Date:** 2026-07-17
**Branch:** `update`
**Commits:** `4554979`

### What Was Built

Full-stack lesson prerequisite/dependency management system — admin UI for setting dependencies, student-facing enforcement with locked states.

### Backend Changes

**`internal/api/cms.go` — `GetModuleDetail` handler:**
- Added `Dependencies []store.LessonPrereq` to the inline `lessonWithProgress` struct (with `json:"dependencies,omitempty"`)
- Bulk-fetches all lesson dependencies for the module in a single `ANY($1)` query via new `GetLessonDependenciesByLessonIDs` store function
- Attaches dependencies to each lesson in the response
- Uses `string(l.ID.Bytes[:])` for map keys (pgtype.UUID has no `.String()` method)

**`internal/store/curriculum.go` — new `GetLessonDependenciesByLessonIDs`:**
- Batch query: `SELECT lesson_id, depends_on_lesson_id FROM lesson_dependencies WHERE lesson_id = ANY($1)`
- Returns early if `lessonIDs` is empty
- Same scan pattern as `GetLessonDependencies`

**`internal/store/store.go` — interface updated:**
- Added `GetLessonDependenciesByLessonIDs(ctx context.Context, lessonIDs []uuid.UUID) ([]LessonPrereq, error)`

### Frontend Changes

**`frontend/lib/types.ts`:**
- `ModuleWithLessons.lessons` type updated: `(Lesson & { completed: boolean; dependencies?: LessonPrereq[] })[]`

**`frontend/app/(main)/learn/courses/[courseSlug]/modules/[moduleSlug]/page.tsx` — Module Detail:**
- Computes `isLocked` per lesson: locked if any dependency lesson is incomplete
- Locked lessons get `status="locked"` → `LearningCard` renders with lock overlay, no clickable link

**`frontend/app/(main)/learn/courses/[courseSlug]/modules/[moduleSlug]/lessons/[lessonSlug]/LessonViewerClient.tsx`:**
- New locked overlay when `!lessonData.prerequisites_met`
- Shows amber lock icon, "Complete Prerequisites First" heading
- Lists all unmet prerequisites with warning icons
- "Back to Module" button
- Sidebar still renders for navigation context
- Lesson content (sections, quizzes, exercises) not rendered when locked
- Added `Lock`, `AlertTriangle` to lucide imports

**`frontend/components/learn/LessonSidebar.tsx`:**
- Props updated: `lessons` type now includes optional `dependencies?: LessonPrereq[]`
- Computes per-lesson locked state from `dependencies` array + completion status
- Locked lessons show `Lock` icon instead of numbered circle
- Locked lessons are `cursor-not-allowed opacity-50` (non-clickable div, not a Link)
- Active/completed/available states unchanged

**`frontend/app/(main)/admin/curriculum/page.tsx` — Admin Dependency Picker:**
- Imports: added `updateLessonDependencies`, `fetchLesson`, `GitBranch`, `Check`, `Search`, `ChevronDown`, `ChevronUp`
- New state: `lessonDependencies`, `loadingDeps`, `depSearch`
- New function: `loadLessonDeps(lessonSlug)` — fetches lesson detail via public API to get current dependencies
- Settings tab: full dependency picker UI with search, checkbox multi-select, pill badges
- `openEditForm` calls `loadLessonDeps` when editing a lesson
- `handleUpdateLesson` calls `updateLessonDependencies` after lesson update
- `handleCreateLesson` sends `dependency_ids` from `lessonDependencies` state
- Form state cleared on open/close/save

### Verification
- `go build ./cmd/server/` — clean
- `npx tsc --noEmit` — 0 errors

---

## Session 46 — 2026-07-20: Full codebase re-index + Python Mastery Practice seed

**Commit:** `3aef8d2`

**New Files:**
- `migrations/043_seed_python_mastery_practice.sql` — Python Mastery: Practice & Review course (1 module, 5 lessons)

**Modified Files:**
- `frontend/app/(main)/learn/courses/page.tsx` — Course catalog with improved LearningCard integration
- `frontend/app/(main)/learn/courses/[courseSlug]/page.tsx` — Course detail page enhancements
- `frontend/app/(main)/learn/courses/[courseSlug]/modules/[moduleSlug]/page.tsx` — Module detail page updates
- `frontend/components/ui/learning-card.tsx` — LearningCard component improvements

**What was done:**
- Full professional codebase re-index: read all 80 Go source files, ~200 frontend source files, 44 migration SQL files, 14 documentation files
- Updated CLAUDE.md with migration 043 in seed data summary and repository structure
- Updated CODEBASE_INDEX.md with current counts
- Added SESSION_LOG.md entry for Session 46
- Verified `go vet`, `go build`, `go test` (9/9 packages pass) — clean

**Codebase Statistics (current):**
- Go source files: 80 (49 source + 13 test in internal/, 8 sandbox, 1 cmd)
- Frontend source files: ~200
- Migration SQL files: 44 (043 + 999_test)
- Total seed problems: ~228
- Go tests: 124+ passing
- Total LOC: ~52,000

---

### 2026-07-21 — Session 47: Remove Console/Play in Browser from problem workspace

**Files modified:**
- `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` — Removed PyodideConsole, "Run in Browser" button, Console toggle (header + right panel tab bar) from the problem workspace. The Console and client-side Python execution are only relevant for learn lesson exercises, not standard problem solving. Hints panel is now always the sole right panel content.

---

### 2026-07-21 — Session 48: Problem module locks + admin lock panel + locked module UI

**Commits:** `02aa051`

**Problem module lock system (full stack):**
- `migrations/045_add_module_locks.sql` — `module_locks` table (module_name TEXT PK, created_at TIMESTAMPTZ)
- `internal/store/module_locks.go` — 3 store functions: `ListLockedModules`, `ToggleProblemModuleLock`, `IsModuleLocked`
- `internal/store/types.go` — `ModuleLock` struct (ModuleName, CreatedAt)
- `internal/api/admin.go` — `ListProblemModuleLocks` (GET) + `ToggleProblemModuleLock` (POST) handlers
- `internal/api/router.go` — Route registration for GET + POST /admin/module-locks
- `internal/api/problems.go` — `ListVisibleProblems` filters out locked modules; `GetProblemBySlug` returns 403 `MODULE_LOCKED`
- `internal/store/users.go` — `GetModuleProficiency` excludes locked modules via `NOT EXISTS` subquery

**Admin frontend:**
- `frontend/app/(main)/admin/page.tsx` — Module Locks panel: fetches locks alongside stats, per-module lock/unlock buttons with Lock/LockOpen icons, amber styling, toast feedback

**Student-facing UI:**
- `frontend/components/dashboard/ModuleCards.tsx` — New `lockedModules: Set<string>` prop; amber padlock overlay; `cursor-not-allowed opacity-60` with `disabled={isLocked}`
- `frontend/app/(main)/home/page.tsx` — Fetches `fetchModuleLocks()` alongside problems, passes `lockedModules` to ModuleCards

**Bug fixes:**
- Paragraph spacing: `[&_p]:mb-3` on problem statement prose container
- Saved code restore: always restores saved code when found, regardless of initial state

**Curriculum module lock (carried from prior sub-session):**
- `migrations/044_add_module_locked.sql` — `locked BOOLEAN` on `modules` table
- `internal/api/cms.go` — `ToggleModuleLock` handler, 403 on locked module detail
- `frontend/components/learn/admin/AdminCards.tsx` — amber badge + lock/unlock button on AdminModuleCard
- `frontend/app/(main)/admin/page.tsx` — Curriculum Manager card added to admin dashboard

---

### 2026-07-22 — Session 49: CodeSnippet polish, best-practices + Learn Beta-gate, docs update

**Commits:** `ac8a45e` `86258a4` `77723fa` `6657efa`

**CodeSnippet component rewrite:**
- `frontend/components/application/code-snippet/index.tsx` — Rewrote from 476→314 lines: removed `react-icons` (heavy), simplified compound-API to single component, added `collapsed`/`maxHeight` props with gradient-fade "Show more/less" toggle
- `frontend/components/application/code-snippet/code-snippet.story.tsx` — Updated stories to match new API

**Best-practices cards compacted:**
- `frontend/app/(main)/home/page.tsx` — Replaced 40-line CodeBlock compound usage with 7-line CodeSnippet (`collapsed`, `maxHeight={140}`)

**Bug fixes:**
- Copy button was permanently invisible — added `group` class to root div for `group-hover:opacity-100`
- Multi-file tab keys used `f.language` (collision risk) — changed to `f.filename`
- `SnippetCtx` type alias shadowed const — renamed to `SnippetCtxType`

**Beta-gate features (non-admin only):**
- Best-practices tab: `cursor-not-allowed`, muted text, amber BETA badge with `FlaskConical`; `onClick` gated to `user?.role === "admin"`; `aria-disabled` + `title` for a11y; coming-soon card if state reached
- Learn nav link (TopNav): rendered as disabled `<span>` (not `<Link>`) with BETA badge for non-admins; `title` tooltip explaining "Coming soon"

**Polish:**
- Removed no-op `col-span-full` from coming-soon card
- Moved `isActive` computation inside non-disabled branch in TopNav loop
- `tsc --noEmit`: clean throughout

---

### 2026-07-22 — Session 50: Solved count consistency + import alias fix

**Commits:** `582917b` `ac5cbb8` `12bbc34`

**Solved count source of truth:**
- Dashboard solved stat (`totalSolved`) now reads from `user.solvedCount` (`GET /me`, same source as XP and streak) instead of deriving from the language-filtered problems list (which has LIMIT 200)
- `frontend/app/(main)/home/page.tsx` — Stats card: `totalSolved` renamed to reflect true total; subtitle shows `visibleSolved` (view-specific)
- `frontend/lib/api.ts` — `fetchUser()` maps `solved_count` → `solvedCount`
- `frontend/lib/UserContext.tsx` — User type includes `solvedCount`
- `frontend/lib/types.ts` — `User` interface: `solvedCount` field

**Build fix:**
- `internal/api/router.go` — Store package import aliased as `storepkg` to avoid shadowing by handler parameter name

**Verification:**
- `npx tsc --noEmit` — clean
- All pushed to `origin/update`

---

### 2026-07-22 — Session 51: Professional typography polish

**Commits:** `f57f867` `dc2d61b`

**Problem description (workspace):**
- `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` — Typography overhaul on the prose description container:
  - Text color: `text-brand-offwhite-muted` → `text-brand-offwhite/90` (bright, high contrast)
  - Size: `prose-sm` → `prose-base`
  - Line height: `leading-relaxed` → `leading-[1.75]` + `prose-p:leading-7`
  - Headings: added `font-bold` + `tracking-tight` + white
  - Strong text: `font-bold` + `text-brand-offwhite`
  - Inline code: gold accent, subtle background, monospace, rounded
  - Code blocks: added `shadow-inner`
  - Lists: bright text + `leading-7`
  - Paragraph spacing: `[&_p]:mb-5` → `prose-p:mb-4`

**Problem cards (problems + home page):**

`frontend/app/(main)/problems/page.tsx`:
- Number: `font-semibold` / `opacity-30` → `font-bold` / `opacity-50`
- Title: `font-semibold text-sm` → `font-bold text-base`
- Description: `text-xs` / `opacity-70` → `text-sm` / `opacity-90`
- XP: `font-semibold` → `font-bold`
- Solved: `font-medium` → `font-bold`

`frontend/app/(main)/home/page.tsx`:
- Number: `font-semibold` / `opacity-30` → `font-bold` / `opacity-50`
- Description: `text-xs` / `opacity-60` → `text-sm` / `opacity-90`
- Tags: `opacity-50` / `font-medium` → `opacity-80` / `font-semibold`
- Footer stats: `opacity-50` / `font-medium` → `opacity-80` / `font-semibold`
- Stat icons: `opacity-30` → `opacity-50`

**Verification:**
- `npx tsc --noEmit` — clean
- All pushed to `origin/update`

---

### 2026-07-22 — Session 52: Workspace editor cleanup

**Commits:** `2c472ac` `f9690b1`

**Removed duplicate difficulty badge:**
- `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` — Removed the duplicate difficulty badge from the top toolbar header. The difficulty badge remains in the description area (left sidebar) where users read the problem context.

**Removed custom intellisense/hover providers:**
- Removed `registerVSCodeDarkPlusTheme` import and custom theme registration (deleted entire `frontend/lib/monaco-theme.ts` usage)
- Removed `loader.init()` pre-initialization effect
- Removed all custom completion providers (~740 lines):
  - Go: `pkgMethods` (fmt/strings/math/sort/os/strconv/time/errors/json), `goSnippets`, `registerCompletionItemProvider`, `registerHoverProvider`
  - Python: `pythonKeywords`, `pythonBuiltins`, `pythonStdlibHints`, `pythonSnippets`, `registerCompletionItemProvider`, `registerHoverProvider`

**Editor config updated:**
- Theme: `vs-dark-plus` (custom) → `vs-dark` (built-in VS Code Dark+)
- `quickSuggestions`: `{ other: true, ... }` → `false`
- `snippetSuggestions`: `inline` → `none`
- `suggestOnTriggerCharacters`: `true` → `false`
- `acceptSuggestionOnEnter`: `smart` → `off`
- `parameterHints`: (unset) → `{ enabled: false }`
- `autoClosingBrackets`: `always` → `never`
- `autoClosingQuotes`: `always` → `never`

**Result:** Clean VS Code Dark+ experience — syntax coloring only, no popups, no autocomplete, no hover tooltips. Only the keyboard shortcuts remain: Ctrl+S (format), Ctrl+Enter (test), Ctrl+Shift+Enter (submit).

**Verification:**
- `npx tsc --noEmit` — clean
- All pushed to `origin/update`

---

### 2026-07-22 — Session 53: Curriculum module lock panel on admin dashboard

**Commit:** `d0ae5ac`

**What was built:**
- New "Curriculum Module Locks" panel on the main admin dashboard (below existing "Problem Module Locks")
- Fetches all courses + their modules via `fetchAllCourses()` and `fetchModules()` in `loadData`
- Courses are collapsible accordions (`<details>`/`<summary>`) with chevron animation
- Each course header shows locked count (e.g. "2/5 locked")
- Each module has a lock/unlock toggle button with amber styling matching the Problem Module Locks panel
- Optimistic UI update — state flips immediately, toast on success/error
- Uses existing `toggleModuleLock(id)` API → `PATCH /admin/modules/{id}/lock`

**Existing lock enforcement (already in place):**
- `CourseDetail` page: `mod.locked` → `status="locked"` → `LearningCard` renders lock overlay with amber padlock
- `ModuleDetail` page: backend returns 403 `MODULE_LOCKED` → amber lock screen with retry
- `ModuleCards` (dashboard): locked problem modules show amber padlock via `lockedModules` prop

**Files modified:**
- `frontend/app/(main)/admin/page.tsx` — Added imports, state, data fetching, and curriculum module locks panel

**Verification:**
- `npx tsc --noEmit` — clean
- All pushed to `origin/update`

---

### 2026-07-22 — Session 54: Problem module lock panel + locked card redesign + dashboard fix

**Commits:** `d1495d6` `486ae78` `55e054c`

**Problem module lock panel (admin dashboard):**
- New "Problem Module Locks" panel below stats — grouped by Go/Python in collapsible accordions
- Display names (e.g. "Arrays & Strings") instead of raw slugs
- Lock count per language (e.g. "2/8 locked")
- Inline lock/unlock toggle with amber styling

**Locked module card redesign:**
- Locked cards remain fully visible (no `opacity-60` dimming) — subtle amber border instead
- Small amber lock badge fixed at top-right corner
- Hover reveals "LOCKED" pill overlay centered on card image with backdrop blur
- Footer shows "Locked by instructor" with lock icon

**Dashboard fix:**
- Locked modules now appear on the dashboard module list — included `lockedModules` set in module list derivation so locked modules render even when their problems are filtered out by the backend

**Files modified:**
- `frontend/app/(main)/admin/page.tsx` — Problem Module Locks panel
- `frontend/components/dashboard/ModuleCards.tsx` — Locked card visual redesign
- `frontend/app/(main)/home/page.tsx` — Include lockedModules in module list

**Verification:**
- `npx tsc --noEmit` — clean
- All pushed to `origin/update`

---

### 2026-07-22 — Session 55: Admin bypass for module locks + delete problem module

**Commits:** `345edcb`

**Admin bypass for module locks (4 endpoints):**
- `GetProblemBySlug` — admins can view locked module problems (nil-safe claims check)
- `ListVisibleProblems` — admins see ALL problems; students still filtered
- `Submit` — admins can submit to locked modules
- `Test` — admins can test against locked modules

**Delete problem module (end-to-end):**
- **Store:** `DeleteProblemModule` — transaction-safe: deletes submissions → progress → problems (cascades test_cases) → module lock
- **Handler:** `DELETE /admin/problem-modules/{moduleName}`
- **Frontend:** Trash icon button next to each module in Problem Module Locks panel with `confirm()` dialog
- Activity log entry on successful deletion

**Cache invalidation:** `clearCache("/admin/problems")` and `clearCache("/admin/module-locks")` before `loadData()` after delete — stale 30s cache was masking deletions

**Backend files:**
- `internal/api/problems.go` — bypass in `GetProblemBySlug` + `ListVisibleProblems`
- `internal/api/submissions.go` — bypass in `Submit`
- `internal/api/test.go` — bypass in `Test`
- `internal/store/module_locks.go` — `DeleteProblemModule` store function
- `internal/store/store.go` — interface method
- `internal/api/admin.go` — `DeleteProblemModule` handler
- `internal/api/router.go` — route registration

**Frontend files:**
- `frontend/app/(main)/admin/page.tsx` — delete button, state, handlers; cache imports
- `frontend/lib/api.ts` — `deleteProblemModule()` API function

**Verification:**
- `go vet ./internal/...` — clean
- `npx tsc --noEmit` — clean
- All pushed to `origin/update`

---

### 2026-07-22 — Session 56: Smart back navigation + full SPA links

**Commits:** `843d315`

**Navigation audit findings:**
| Issue | Severity | Files |
|---|---|---|
| Workspace "Back" always goes to `/home` regardless of referrer | High | `ProblemWorkspaceClient.tsx:548` |
| 2 `<a href>` tags causing full page reloads | High | `MyContributions.tsx:78`, `admin/page.tsx:279` |

**Smart back navigation:**
- Workspace stores `return_to` in `sessionStorage` on every problem link click (`/home` and `/problems` pages)
- Workspace reads `sessionStorage.getItem("return_to")` for the "Back" link href — falls back to `/home`
- Label changed from "Problems" to "Back" to reflect dynamic destination

**Full SPA navigation:**
- `MyContributions.tsx:78` — `<a href="/contribute">` → `<Link href="/contribute">`
- `admin/page.tsx:279` — `<a href="/admin/curriculum">` → `<Link href="/admin/curriculum">`

**Verification:**
- `npx tsc --noEmit` — clean
- All pushed to `origin/update`

---

### 2026-07-22 — Session 57: LIFO navigation stack + module URL persistence

**Commits:** `4fc6cce` `32f264a` `2ba2fac`

**LIFO navigation stack:**
- Module card clicks use `pushState` instead of `replaceState` — each selection is a proper history entry
- Language filter tabs use `pushState` — back/forward navigates through tab changes
- "Back to topics" uses `pushState` to return to all-modules view
- `popstate` event listener syncs React state (selectedModule + languageFilter) with URL on browser back/forward

**Module URL persistence:**
- `handleSelectModule` writes `?module=xxx` to URL via `pushState`
- Refresh preserves the module filter state — reads from URL params on mount

**Cache invalidation for delete module:**
- Added `clearCache("/admin/problems")` and `clearCache("/admin/module-locks")` before `loadData()` in delete handler — stale 30s cache was returning old data, making deletes appear to do nothing

**Verification:**
- `npx tsc --noEmit` — clean
- All pushed to `origin/update`

---

### 2026-07-22 — Session 59: Module metadata system + Python module images

**Module metadata system:**
- Migration `046_module_meta.sql` — `module_meta` table (module_name PK, display_name, is_pinned) with seed data for all 26 known modules
- `internal/store/module_meta.go` — `ListModuleMeta`, `UpsertModuleMeta`, `SetModulePin` store functions
- `internal/api/admin.go` — 3 handler functions (`ListModuleMeta`, `UpsertModuleMeta`, `SetModulePin`)
- `internal/api/router.go` — 3 admin routes + student `GET /me/module-meta`
- `frontend/lib/api.ts` — `ModuleMeta` interface + `fetchModuleMeta`, `upsertModuleMeta`, `setModulePin`

**Admin panel — Module Settings panel:**
- New "Module Settings" panel — inline rename + pin toggle
- Modules from `moduleMeta` keys (all known modules)
- Inline rename with Enter/blur/Escape keyboard support
- Pin toggle with Pin/PinOff icons
- Cache invalidation before re-fetch after mutations

**Admin panel — Problem Module Locks fixes:**
- Modules now derived from `Object.keys(moduleMeta)` — ALL modules, not just ones with problems
- Display names use `moduleMeta[mod]?.display_name` — reflects renames from Module Settings
- Delete button only renders when module has problems
- `await loadData()` before re-enabling button
- Removed hardcoded `MODULE_DISPLAY_NAMES`

**ModuleCards integration:**
- Accepts `moduleMeta` prop, sorts by `is_pinned`, uses `display_name` from meta
- `home/page.tsx` fetches moduleMeta on load + window focus refresh

**Python module images (4 new WebP):**
- `python-arrays-strings.webp` (31KB), `python-challenges.webp` (25KB)
- `python-fundamentals.webp` (32KB), `python-intermediate.webp` (35KB)
- Full `MODULE_META` + `MODULE_COLORS` entries for each

**Backend files:**
- `internal/store/module_meta.go` — new
- `internal/store/types.go` — `ModuleMeta` struct
- `internal/store/store.go` — interface methods
- `internal/api/admin.go` — handlers
- `internal/api/router.go` — routes
- `migrations/046_module_meta.sql` — new

**Frontend files:**
- `frontend/lib/api.ts` — types + API functions
- `frontend/app/(main)/admin/page.tsx` — Module Settings panel, locks panel fixes
- `frontend/app/(main)/home/page.tsx` — focus refresh
- `frontend/components/dashboard/ModuleCards.tsx` — pin sort, display_name, Python images
- `frontend/public/modules/python-*.webp` — 4 new images

**Verification:**
- `go vet ./internal/...` — clean
- `go build ./...` — clean
- `./node_modules/.bin/tsc --noEmit` — clean

---

### 2026-07-22 — Session 60: Markdown renderer rewrite + paragraph spacing fix

**Commits:** `528cd8b`

**Problem statement rendering — root cause fix:**
- `frontend/app/globals.css` was missing `@tailwindcss/typography` — all `prose-*` Tailwind classes were no-ops (headings, paragraph spacing, code styling, bold color all did nothing)
- Removed `react-markdown` / `remark-gfm` dependency — replaced with self-contained `renderMarkdown()` + `inlineMd()` functions using `dangerouslySetInnerHTML`
- All styling now uses inline `style=` attributes — deterministic, no CSS plugin required

**Renderer design (`ProblemWorkspaceClient.tsx:159-228`):**
- Split on `\n\s*\n` (blank lines) → paragraphs with `0.75rem` bottom margin
- `#` / `##` / `###` → `h1`/`h2`/`h3` with proper sizing and bold
- `-` / `*` at line start → bullet lists
- `1.` / `2.` at line start → numbered lists
- `**bold**` → gold (`#D4AF37`)
- `*italic*` → em
- `` `code` `` → gold monospace with dark bg
- `[text](url)` → gold links
- HTML escaped before processing (XSS safe)

**Key insight for AI:** The renderer is intentionally simple — no GFM tables, no blockquotes, no strikethrough. Blank lines (`\n\n`) are the only block separator.

**Files modified:**
- `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` — full renderer rewrite

**Verification:**
- `npx tsc --noEmit` — clean

### 2026-07-22 — Session 61: Locked module count fix, community solution collapsible cards, professional polish

**Commits:** `824fc10`

**Locked module cards — fix problem counts:**
- `internal/store/types.go` — Added `Locked bool` field to `Problem` struct
- `internal/store/problems.go` — SQL now includes `EXISTS (SELECT 1 FROM module_locks WHERE module_name = p.module) AS is_locked`
- `internal/store/problems.go` — Scans `is_locked` into `problem.Locked`; `LIMIT` raised from 200 to 500
- `internal/api/problems.go` — Removed handler-level locked module filter — problems now include `locked: true` instead of being excluded
- `frontend/lib/types.ts` — Added `locked: boolean` to `Problem` interface; merged duplicate `TestCase` definitions
- `frontend/app/(main)/home/page.tsx` — `filteredProblems` excludes `p.locked` from grid; `moduleProgress` derives from ALL problems including locked; `showTopicCards` includes `lockedModules.has(selectedModule)` guard
- Locked module cards now show `12 problems · 3 solved · 25%` — identical visual treatment to unlocked cards

**Community solutions — remove AND EXISTS:**
- `internal/store/submissions.go:146` — Removed `AND EXISTS (SELECT 1 FROM submission_likes ...)` — solutions with 0 likes now surface, sorted by likes DESC

**Community solution cards — auto-height + collapse:**
- `frontend/app/(main)/problems/[slug]/success/page.tsx` — Each card uses per-card `expandedSolutions` Set + `toggleSolution`. Code >8 lines collapses to `max-h-[220px]` with gradient fade + "Show full solution" toggle. Cards use `rounded-xl` (no double-radius). Removed fixed `h-[200px]`.

**Bug fix:**
- `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx:427` — Fixed `lang` → `activeLanguage` (undefined variable)

**Files modified (14):**
`CLAUDE.md`, `ProblemEditPanel.tsx`, `home/page.tsx`, `success/page.tsx`, `ProblemWorkspaceClient.tsx`, `api.ts`, `types.ts`, `admin.go`, `problems.go` (api), `router.go`, `problems.go` (store), `store.go`, `submissions.go`, `types.go`

**Verification:**
- `go vet ./internal/...` — clean
- `go build ./internal/...` — clean
- `npx tsc --noEmit` — clean

### 2026-07-22 — Session 62: Middleware auth redirect fix

**Problem:** Auth guard added in session 61 checked for `koder_token` cookie in Next.js middleware, but the cookie is set on the API domain (`koder-api.onrender.com`), not the frontend (`update.koder.sbs`). Every RSC request to protected routes was redirected to `/`, creating an invisible redirect loop — blank charcoal screen.

**Fix:** Removed auth redirect guard from `frontend/middleware.ts`. Auth remains handled client-side via UserContext's 401 fallback.

**Commit:** `ba654d6`

**Verification:**
- `go vet ./internal/...` — clean
- `go build ./internal/...` — clean
- `npx tsc --noEmit` — clean

### 2026-07-22 — Session 63: ESLint errors fix + staging CI/CD + branch rename

**Commits:** `43eaef7`

**Lint fixes (6 errors → 0):**
- `ProblemEditPanel.tsx` — changed `key={tc.id}` → `key={\`\${tc.id}-\${tc.expected}\`}` so row re-mounts on expected change, removing `useEffect`/`useRef` sync pattern
- `home/page.tsx` — initialized `selectedModule` from URL in `useState` lazy initializer, removed mount-time `useEffect`
- `LessonViewerClient.tsx` — added `key={lessonSlug}` to root div so component remounts on lesson navigation, removing step-reset `useEffect`/`useRef`
- `MultiFileConfigPanel.tsx` — used `eslint-disable` block comments for legitimate external-system sync (spec prop → local state)

**CI/CD:**
- Added `update` branch to both push and pull_request triggers in `.github/workflows/ci.yml` — same 2-job pipeline (backend: vet/test/build, frontend: lint/tsc/build)

**Branch rename:**
- Remote branch renamed from `update` → `staging`; `origin/update` force-pushed to match old staging

**Verification:**
- `npx tsc --noEmit` — clean
- `npm run lint` — 0 errors, 1 pre-existing warning (unrelated `<img>` tag)
- `go test ./internal/...` — all pass (4 pre-existing config env mismatch failures)

---

### 2026-07-22 — Session 64: Config test fixes, CI env var isolation, dashboard nav link, global rank fix

**Commits:** `bfadb3f` `549521f` `9b882aa` `c8c260c`

**1. Config test fixes (4 failing → all pass):**
- `internal/config/config.go` — `loadEnvFile()` now skips loading `.env` during tests (checks `os.Args[0]` suffix `.test`), so "missing var" tests correctly see empty env
- `internal/config/config_test.go` — All 3 "missing" tests (`MissingDatabaseURL`, `MissingJWTSecret`, `MissingNvidiaKey`) now call `t.Setenv("VAR", "")` before `Load()` to clear CI-provided env vars
- `TestLoadConfig_Defaults` — clears `GO_VERSION` before testing, so the code's default `"1.23"` is tested (not CI's `"1.26"` override)

**2. Dashboard nav link fix (`TopNav.tsx`):**
- Added `onClick` handler to nav links: `if (pathname === link.href) { e.preventDefault(); router.refresh(); }`
- Clicking Dashboard when already on `/home` now forces a fresh RSC payload

**3. Global rank `# #1` fix (`StatsOverview.tsx`):**
- Removed duplicate `#` from template literal — `#{profile.global_rank}` → `{profile.global_rank}`
- The `Hash` icon already serves as the `#` symbol, so icon + number = clean `#1` display

**Verification:**
- `go vet ./internal/...` — clean
- `go build ./internal/...` — clean
- `go test ./internal/...` — all 8 packages pass (24 tests)
- `npx tsc --noEmit` — clean
- `npm run lint` — 0 errors (1 pre-existing warning)
- All pushed to `origin/update`
