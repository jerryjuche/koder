# Session Logbook — June 28–30, 2026

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

## 12. Known Issues & Next Steps

- [ ] Run migration `012_add_google_auth.sql` against the database
- [ ] Set `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env vars
- [ ] `GetFullProfile` SQL function returns username/google_avatar_url but `rawProfileJSON` in `profile.go` doesn't parse them — separate `GetUserByID` call is used instead (two DB calls; acceptable)
- [ ] Test Google Sign-In end-to-end (login → onboarding → dashboard)
- [ ] Test existing email/password login still works
- [ ] Clean up unused `@tanstack/react-virtual` dependency if not needed
