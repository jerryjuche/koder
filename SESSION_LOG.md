# Session Logbook — June 28, 2026

---

## Overview
Full profile page redesign + leaderboard redesign + backend performance optimization. Replaced flat progress bars with radial activity gauges, redesigned achievements as GitHub-style badge grid, removed recent activity section, built a recharts-powered contribution graph, and collapsed 7 database queries into a single `get_full_profile()` call with in-memory caching.

---

## Commits (chronological)

| Commit | Hash | Description |
|--------|------|-------------|
| 1 | `fd306e8` | feat: profile page redesign with shadcn/ui and CSS variables |
| 2 | `e8a49e8` | perf: collapse 7 DB queries to 1, add caching, rewrite profile page with shadcn/ui |
| 3 | `946ce46` | feat: leaderboard redesign with shadcn Avatar, top 15 display, no emoji podium |
| 4 | `6648477` | profile: activity gauge radial charts, achievement badge grid, remove recent activity |

Branch: **`update`**

---

## 1. Backend Performance Work (commit `e8a49e8`)

### Migration: `migrations/009_get_full_profile.sql`
- Created **`get_full_profile()`** — single PL/pgSQL function replacing 7 separate DB round-trips:
  - Returns: user info, stats, module proficiency, difficulty breakdown, level, xp, rank, streak, best runtime, contributions, achievements
- Created **`get_user_activity()`** — daily activity counts for the contribution graph (date, submissions, solved, tests_run)

### Store Layer (`internal/store/`)
- Added `GetFullProfile(userID string) (*types.FullProfile, error)` — calls `get_full_profile()`
- Added `GetUserActivity(userID string) ([]types.ActivityEntry, error)` — calls `get_user_activity()`

### Handlers
- **`api/profile.go`** — `/me/profile` now uses `GetFullProfile` (single call)
- **`api/me.go`** — `/me` uses `GetFullProfile`
- Added **`/me/activity`** endpoint → returns daily activity entries

### Caching Layer
- In-memory cache with **30-second TTL** for `/me` and `/me/profile`
- Uses `sync.Map` + `time.Time` expiry checks
- Cache invalidated by `user-updated` window event

### Types (`internal/store/types.go`)
- Added `FullProfile` struct (everything in one payload)
- Added `ActivityEntry` struct (date, submissions, solved, tests_run)
- Added `ModuleProficiency` map field, `DifficultyBreakdown`, `ContributionSummary`

---

## 2. Profile Page Redesign (commits `fd306e8` + `e8a49e8`)

### Files Created/Modified

```
frontend/app/(main)/profile/
├── ProfileClient.tsx             # Rewritten — tabs, loading, error states
├── loading.tsx                   # Full skeleton matching new layout
├── error.tsx                     # Error boundary with retry
└── components/
    ├── ProfileHeader.tsx         # Rewritten — gradient accent, rank badge, copy link
    ├── StatsOverview.tsx         # Rewritten — 6 stat cards with tooltips
    ├── ProgressMetrics.tsx       # Rewritten — difficulty breakdown + module gauges
    ├── Achievements.tsx          # Rewritten ×2 (see below)
    ├── ContributionGraphSection.tsx  # NEW — GitHub-style contribution graph
    └── MyContributions.tsx       # Unchanged (external feature)
```

### Key Components

#### ProfileHeader.tsx
- Gradient accent line at top (`from-primary/80 via-primary to-amber-400/80`)
- Colored avatar circle with initials + `userColor` helper
- Global rank badge card (gold gradient with trophy icon)
- Copy profile link button
- Settings link, bio with left accent bar

#### StatsOverview.tsx
- 6-column grid of stat cards: Level, Global Rank, Solved, Success Rate, Streak, Best Runtime
- Each card is a shadcn `Card` with icon, label, value, optional progress bar (Level XP)
- All cards wrapped in shadcn `Tooltip` for definition on hover
- XP bar: `progress={Math.min(100, Math.max(5, (xp % 1000) / 1000 * 100))}`

#### ProgressMetrics.tsx
- Two sections in a vertical stack:
  1. **Difficulty Breakdown** — 3 progress bars (Easy/Medium/Hard) with emerald/amber/rose colors, badge counts, percentage
  2. **Module Proficiency** — 2×3 grid of radial gauges (see activity-gauge below)
- Overall progress bar at bottom of difficulty section
- Falls back to default module data if `module_proficiency` is empty

#### ContributionGraphSection.tsx
- Uses `kibo-ui/contribution-graph` components
- Maps `ActivityEntry[]` to graph data with 5 activity levels
- Wraps each block in shadcn `Tooltip` showing date + submission/solved/tests counts
- Handles empty state: "No activity data yet"

#### ProfileClient.tsx
- Two tabs: **Overview** | **My Contributions**
- Overview tab layout:
  ```
  ProfileHeader
  StatsOverview (6-column grid)
  ContributionGraphSection
  grid: [ProgressMetrics (2 cols)] [Achievements (1 col)]
  ```
- Uses `TooltipProvider` at top level
- Fetches both profile + activity data in parallel via `Promise.all`
- Listens for `user-updated` events to refresh data
- Full loading skeleton + error states

---

## 3. Activity Gauge Component (commit `6648477`)

### `frontend/components/ui/activity-gauge.tsx` — NEW

A reusable radial bar chart gauge built on `recharts`:

```tsx
interface ActivityGaugeProps {
  value: number;
  max: number;
  label: string;
}
```

**Design decisions:**
- **Single gold color** — `fill-primary` / `fill-primary/10` background (no rotating palette)
- **Percentage only** in center — large `text-3xl font-bold` gold text
- **No secondary text** — removed `{value} / {max} solved` line
- **Animation** — `isAnimationActive` with 1200ms ease-out
- **Dimensions** — `innerRadius={48}`, `outerRadius={76}`, `startAngle={90}`, `endAngle={450}`, `barSize={12}`
- **Layout** — Wrapped in shadcn `Card`, centered, label below chart
- **Height** — `ResponsiveContainer` at 170px height

---

## 4. Achievements Redesign (commit `6648477`)

### `frontend/app/(main)/profile/components/Achievements.tsx` — Rewritten

**Before:** Full-width card rows with horizontal layout per achievement

**After:** GitHub-style round badge grid

**Layout:**
- `grid grid-cols-3 gap-3` — 3-column grid of 52px circular buttons
- Each badge is a `<button>` with aspect-square, rounded-full, border
- Header with badge icon, "Achievements" title, and `{unlocked}/{total}` counter badge

**States:**
- **Unlocked:** `bg-card border-border`, on hover → `ring-2 ring-primary/50`, subtle lift (`-translate-y-0.5`), shadow
- **Locked:** `bg-muted/30 border-border opacity-30 grayscale`

**Interactions:**
- **Hover:** shadcn `Tooltip` shows title + description + green checkmark if unlocked
- **Click:** Opens same detail `Dialog` as before (icon, title, unlocked/locked badge, criteria description, Close button)

**Achievement definitions (6 total):**
| ID | Title | Criteria | Icon Color |
|----|-------|----------|------------|
| first_blood | First Blood | solved_count >= 1 | emerald-400 |
| hot_streak | Hot Streak | streak >= 3 days | orange-400 |
| perfectionist | Perfectionist | avg quality >= 2.5 | primary (gold) |
| speed_demon | Speed Demon | best runtime < 10ms | cyan-400 |
| veteran | Veteran Coder | level >= 10 | purple-400 |
| completionist | Completionist | solved_count >= 50 | blue-400 |

---

## 5. Leaderboard Redesign (commit `946ce46`)

### `frontend/app/(main)/leaderboard/LeaderboardClient.tsx` — Rewritten

**Key changes:**
- **CSS variables** instead of hardcoded emoji/colors
- **Top 15 display** (`DISPLAY_LIMIT = 15`) instead of full list
- **Podium** — 3-card display (1st center taller, 2nd/3rd flanking) with:
  - Gold/slate/orange gradient card backgrounds
  - Rank badge pill (Crown/Medal icons + ordinal suffix)
  - shadcn `Avatar` with colored ring (amber/slate/orange)
  - XP + solved count
- **"You" badge** — shadcn `Badge` variant with `border-primary/30 bg-primary/5` on current user's row
- **Rank delta** — Tooltip on `TrendingUp`/`TrendingDown`/`Minus` icons showing rank change
- **Search** — Filters by name or studentId
- **Period filter** — Weekly/Monthly/All Time toggle buttons
- **Loading skeleton** — Podium + table skeleton matching final layout
- **My Ranking banner** — Card at top showing your rank, avatar, XP, solved, best time
- **Table** — Rank (1-3 with special styling), delta, student (avatar + name + ID), XP, solved, best time

**Dependencies added:** `recharts@3.9.0`

---

## 6. Gitea OAuth2 Integration (June 28, Session 2)

### Overview
Added "Sign in with Gitea" OAuth2 flow. Pure Go `golang.org/x/oauth2` — no Supabase Auth. Discards Gitea token after fetching profile (username, email, avatar URL). Uses same JWT system as password login.

### Files Created
| File | Purpose |
|------|---------|
| `migrations/010_add_gitea_auth.sql` | Adds `gitea_id` (BIGINT UNIQUE), `gitea_username`, `gitea_email`, `gitea_avatar_url` to `users` |
| `internal/auth/oauth.go` | HMAC-signed state generation/verification, Gitea OAuth config factory, `FetchGiteaUser()` API call |
| `frontend/app/oauth/callback/page.tsx` | Token capture from URL, `replaceState()` scrub, Suspense boundary |

### Files Modified
| File | Change |
|------|--------|
| `internal/config/config.go` | Added `GiteaURL`, `GiteaClientID`, `GiteaClientSecret`, `GiteaRedirectURL` with HTTPS validation in production |
| `.env.example` | Added Gitea OAuth vars |
| `.env` | Updated with real Gitea creds, PORT=8080, JWT_EXPIRY_HOURS=72 |
| `internal/store/types.go` | Added Gitea fields to `User` struct (pointer types for nullable), `GiteaUserInfo` struct |
| `internal/store/store.go` | Added `GetUserByGiteaID`, `CreateUserFromGitea`, `LinkGiteaToUser` to interface |
| `internal/store/users.go` | Implemented all 3: lookup by Gitea ID, create from Gitea profile, link to existing user |
| `internal/api/auth.go` | Added `giteaOAuth` field, `SetGiteaOAuthConfig()`, `GiteaLogin`, `GiteaCallback` handlers |
| `internal/api/router.go` | Creates OAuth config in `NewRouter()`, registers `GET /auth/gitea/login` + `/auth/gitea/callback` (public, no auth middleware) |
| `frontend/lib/api.ts` | Exported `API_BASE` for OAuth button href |
| `frontend/app/(auth)/login/page.tsx` | Added "Sign in with Gitea" button with `or` divider, imports `GitBranch` icon |

### OAuth Flow
```
Login Page → /auth/gitea/login → redirect to Gitea OAuth consent
  → gitea.com/login/oauth/authorize
  → user approves → redirect to /auth/gitea/callback?code=X&state=Y
  → verify HMAC state (CSRF check)
  → exchange code for token
  → GET gitea.com/api/v1/user with token → {id, login, full_name, email, avatar_url}
  → DISCARD token (not stored)
  → lookup user by gitea_id OR create from Gitea profile OR link to existing student_id
  → sign same JWT as password login
  → redirect to /oauth/callback?token=JWT
  → frontend saves token to localStorage, replaceState scrubs URL, redirect to /
```

### Security (All 8 Measures)
| # | Risk | Mitigation | Where |
|---|------|-----------|-------|
| 1 | OAuth CSRF | HMAC-signed state (SHA256, JWT_SECRET as key) | `auth/oauth.go` |
| 2 | Open redirect | Redirect target is always `ALLOWED_ORIGIN` from config | `api/auth.go` callback |
| 3 | Code leak | Code exchanged server-side, never in URL/logs | `api/auth.go` callback |
| 4 | JWT in URL | `window.history.replaceState()` scrubs immediately | `oauth/callback/page.tsx` |
| 5 | User enumeration | All outcomes redirect to same `/oauth/callback?error=X` | `api/auth.go` callback |
| 6 | Gitea compromise | Admin unlinks via DB, link-to-existing on matching student_id | `store/users.go` |
| 7 | Weak secret | Uses JWT_SECRET (enforced ≥32 chars by config) | `auth/oauth.go` |
| 8 | Plaintext HTTP | Production config rejects non-HTTPS GITEA_URL and GITEA_REDIRECT_URL | `config/config.go` |

### Key Config Values (Final `.env`)
```
PORT=8080
JWT_SECRET=eQGEM/CNxUIlxpZ7tfcKpbHfQje8vU+mbkgt8huwVIY=
JWT_EXPIRY_HOURS=72
ENVIRONMENT=development
GITEA_URL=https://gitea.com
GITEA_CLIENT_ID=fba60a7e-45be-443d-9f25-518b34248ad8
GITEA_CLIENT_SECRET=gto_p4j2vlckajw5t7avsvax3kms5eijhfmgs7i63wjglyv2xwdl6xcq
GITEA_REDIRECT_URL=http://localhost:8080/auth/gitea/callback
ALLOWED_ORIGIN=http://localhost:3000
```

### Build Verification
- Backend: `go build ./cmd/server/...` — ✅ compiles clean
- Frontend: `npx next build` — ✅ `✓ Compiled successfully`, 13/13 static pages generated
- `/oauth/callback` page: 696 bytes, prerendered as static content

---

## 7. Infrastructure Changes

### Dependencies
- `frontend/package.json`: Added `recharts@^3.9.0`
- `frontend/next.config.ts`: Added `optimizePackageImports` for recharts
- Installed `@tanstack/react-virtual` (not currently used — available for future)

### Fonts
- Replaced `next/font/google` Inter with **system font stack** to avoid Google Fonts build issues

### Nav/UI
- `frontend/components/layout/TopNav.tsx` — Replaced custom dropdown with shadcn `DropdownMenu` for popup fix

### Context
- `frontend/lib/UserContext.tsx` — NEW: `UserProvider` + `useUser()` hook wrapping `fetchUser()` with `user-updated` event listener

---

## 8. Files Removed
- `frontend/app/(main)/profile/components/PerformanceStats.tsx` — Replaced by `ProgressMetrics.tsx`
- `frontend/app/(main)/profile/components/RankStats.tsx` — Absorbed into `StatsOverview.tsx`
- `frontend/app/(main)/profile/components/RecentActivity.tsx` — Removed entirely (profile no longer shows recent submissions)
- All Gitea PAT linking handlers, store methods, migration files (archived in migrations/)

---

## 9. Build Notes

- **Build command:** `npx next build` (NOT `npm run build` — the latter crashes with Windows DLL exit code 3221225794)
- **Build passes:** `✓ Compiled successfully` + type check passes
- **CSS variables** approach used throughout — no hardcoded color values except brand gold `#D4AF37` mapped to `fill-primary`/`stroke-primary`
- **recharts** usage is isolated to `ActivityGauge` component only
- All shadcn components used: `Card`, `Badge`, `Button`, `Avatar`, `AvatarFallback`, `Progress`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`, `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`, `Input`, `DropdownMenu`, etc.

---

## 10. Unresolved / Future

- `@tanstack/react-virtual` installed but not used (candidate for virtualized leaderboard for large datasets)
- Ranks 4+ in leaderboard show flat numbers without special styling
- Achievement definitions are hardcoded in `lib/achievements.ts` — could be fetched from backend
- Recharts bundle size impact (~30KB gzip) — acceptable for current scope
- ContributionGraphSection uses `kibo-ui` contribution-graph package; ensure it stays compatible
- `server.exe`, `tee.txt`, `test.exe` are untracked binaries in root — should be `.gitignored`

---

## 11. Problem Statements & Workspace Polish

### Overview
Updated all problem descriptions to be professional and elaborate, and overhauled the frontend workspace to look highly premium and dynamic.

### Backend Changes
- Updated `statement` for 11 core problems (including `edit-distance`) in the database with rich markdown, detailed considerations, examples, and realistic solve-time estimates.

### Frontend Changes
- `ProblemWorkspaceClient.tsx`: Upgraded the Problem Description and Examples sections to use a glassmorphic design, dynamic glowing dots, gradients, and `@tailwindcss/typography` (`remarkGfm`) for better markdown styling.

---

## 12. Google Sign-In Migration (June 29, Session 4 — CURRENT)

### Overview
Replaced Gitea OAuth + PAT linking with pure Google Sign-In. Uses Google Identity Services (GIS) for the frontend button and `oauth2.googleapis.com/tokeninfo` endpoint for server-side ID token verification — zero extra Go deps. Google users get a temporary tag-based username (`g_<sub[:8]>`) and must set a permanent username on the `/onboarding` page.

### New Files
| File | Purpose |
|------|---------|
| `migrations/012_add_google_auth.sql` | Adds `google_id`, `google_email`, `google_avatar_url`, `username`, `email` columns; backfills existing users |
| `frontend/app/(auth)/onboarding/page.tsx` | Username setup page for new Google users (debounced availability check) |

### Backend Changes
| File | Change |
|------|--------|
| `internal/auth/oauth.go` | Replaced Gitea code with `VerifyGoogleToken()` using `https://oauth2.googleapis.com/tokeninfo?id_token=...` |
| `internal/auth/jwt.go` | Added `Username` + `Onboarding` claims to JWT |
| `internal/store/types.go` | Added `GoogleID`, `GoogleEmail`, `GoogleAvatarURL`, `Username` to `User`; `GoogleUserInfo` struct; removed all Gitea fields |
| `internal/store/store.go` | Added `GetUserByGoogleID`, `CreateUserFromGoogle`, `LinkGoogleToUser`, `GetUserByLogin`, `GetUserByEmail`, `UpdateUserUsername`, `UpdateUserGoogleAvatar`; removed all Gitea methods |
| `internal/store/users.go` | Implemented all new methods; leaderboard SQL selects `google_avatar_url` instead of gitea fields |
| `internal/api/auth.go` | Added `GoogleAuth`, `CompleteGoogle`, `CheckUsername` handlers; updated `Register` (accepts username), `Login` (accepts username/email/student_id) |
| `internal/api/me.go` | `meResponse` uses `Username`/`GoogleAvatarURL` instead of Gitea fields |
| `internal/api/profile.go` | `profileResponse` uses `Username`/`GoogleAvatarURL` |
| `internal/api/router.go` | `/auth/google` public; `/auth/complete-google` + `/auth/check-username` protected; removed all Gitea routes |
| `internal/config/config.go` | Added `GoogleClientID` env var; removed Gitea vars |

### Frontend Changes
| File | Change |
|------|--------|
| `lib/types.ts` | `User` and `UserProfile` use `username`/`google_avatar_url` (replaced `gitea_username`/`gitea_avatar_url`) |
| `lib/api.ts` | Added `googleLogin`, `completeGoogleOnboarding`, `checkUsername`; removed `linkGiteaToken`, `unlinkGitea`, `getGiteaStatus`, `syncGiteaProfile` |
| `lib/achievements.ts` | **NEW** — shared `Achievement` type + `getAchievements()` utility (DRY source for both Achievements.tsx and ActivityFeed.tsx) |
| `app/(auth)/login/page.tsx` | Google Sign-In button via GIS CDN; login field accepts "Username or Email" |
| `app/(auth)/register/page.tsx` | Username field + email field (replaced student_id) |
| `app/(auth)/onboarding/page.tsx` | **NEW** — debounced username check, submit button, error/success states |
| `components/layout/TopNav.tsx` | `google_avatar_url` for avatar, `@{username}` badge |
| `app/(main)/page.tsx` | Google avatar + `@{username}` in user summary |
| `app/(main)/leaderboard/LeaderboardClient.tsx` | `google_avatar_url` for avatars, `username` for display |
| `app/(main)/profile/components/ProfileHeader.tsx` | Google avatar + `@{username}` badge |
| `app/(main)/settings/page.tsx` | Removed Gitea PAT section; username is read-only |

### Google Sign-In Flow
```
Login Page → Google Sign-In button (GIS)
  → Google popup → user selects account
  → Google returns ID token (JWT)
  → POST /auth/google {id_token}
  → VerifyGoogleToken() → GET oauth2.googleapis.com/tokeninfo?id_token=...
  → Check user by google_id (existing) OR email (link) OR create new
  → New user gets temp username "g_<sub[:8]>" + onboarding=True JWT claim
  → Onboarding page → set permanent username → POST /auth/complete-google
  → New JWT without onboarding claim → redirect to /
```

### Key Design Decisions
| Decision | Rationale |
|----------|-----------|
| `tokeninfo` endpoint (not Google SDK) | Zero extra Go dependencies; simple HTTP GET |
| `username` column (not replace student_id) | Backward compatibility with existing users who have email-like student_ids |
| Google avatar synced on every login | Profile picture stays current; `UpdateUserGoogleAvatar` called on every Google auth |
| `g_<sub[:8]>` temp username | Guarantees uniqueness; user must choose permanent name on `/onboarding` |
| `GetUserByLogin` checks 3 fields | Accepts username, email, OR student_id for backward compat |

### Build Verification
- ✅ `go build ./cmd/server/` — backend compiles
- ✅ `npx tsc --noEmit` — frontend type-checks
- ✅ `npm run build` — frontend builds (4.3 min)

---

## 13. Frontend Polish: Visibility, Achievements, Module Proficiency (June 30, Session 5)

### Issue 1 — Problem Visibility After Ingestion
Previously, ingested problems were created with `visible=false` and remained hidden after enrichment. The admin had to manually toggle each one.

**Fixes:**
- `internal/api/admin.go`: `Enrich` and `EnrichAll` now set `visible=true` after successful enrichment
- New endpoint `POST /admin/problems/publish-all` — bulk-publishes all draft problems
- `frontend/app/(main)/admin/page.tsx`: Added "Publish All Drafts (N)" button; status column now shows `published` (green), `pending enrich` (amber), or `draft` (muted)
- No more manual toggle needed — enrichment auto-publishes

### Issue 2 — Shared Achievements Module
Achievement definitions were copy-pasted identically in `Achievements.tsx` and `ActivityFeed.tsx`, leading to drift risk.

**Fixes:**
- Created `frontend/lib/achievements.ts` — single source of truth for `Achievement` type + `getAchievements()` function with 6 achievements
- Both `Achievements.tsx` and `ActivityFeed.tsx` now import from shared module
- Added `criteria` field, improved dialog with colored border/bg in icon circle

### Issue 3 — Module Proficiency Gauge Sizing
`ActivityGauge.tsx` used fixed `height={170}` with absolute radii — unresponsive at different card widths.

**Fixes:**
- Gauge height now scales to 85% of card width (clamped 120-200px) via `ResizeObserver`
- `innerRadius`, `outerRadius`, `barSize` scale proportionally to height
- 16-color module palette replaces single `fill-primary` (module-specific gauge colors)
- `line-clamp-2` prevents long module name overflow
- Modules sorted alphabetically; empty state shows "No modules available yet"
- Removed static fallback data (`defaultModules`)
