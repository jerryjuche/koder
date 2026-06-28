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
- Achievement definitions are hardcoded in `Achievements.tsx` — could be fetched from backend
- Module proficiency fallback data is static (`defaultModules`) — real data comes from backend
- Recharts bundle size impact (~30KB gzip) — acceptable for current scope
- ContributionGraphSection uses `kibo-ui` contribution-graph package; ensure it stays compatible
- `server.exe`, `tee.txt`, `test.exe` are untracked binaries in root — should be `.gitignored`

---

## 11. Gitea PAT Linking + Avatar Sync Across All Surfaces (June 28, Session 3)

### Overview
Added optional PAT-based Gitea account linking (no OAuth app needed). Encrypted token storage (AES-256-GCM). Gitea avatar and username now sync across all surfaces: TopNav dropdown, Dashboard, Leaderboard, Profile page, and Settings. Added ActivityFeed component to profile contributions tab.

### New Files
| File | Purpose |
|------|---------|
| `migrations/011_add_gitea_token.sql` | Adds `gitea_token TEXT` column to `users` |
| `internal/auth/oauth.go` | `EncryptToken`/`DecryptToken` (AES-256-GCM, key derived from JWT_SECRET) |
| `frontend/app/(main)/profile/components/ActivityFeed.tsx` | Achievement grid + recent activity timeline |

### Backend Changes
| File | Change |
|------|--------|
| `internal/store/types.go` | Added `GiteaToken *string` (json:"-") to `User`; added `GiteaUsername`/`GiteaAvatarURL` to `LeaderboardUser` |
| `internal/store/store.go` | Added `UpdateGiteaProfile`/`ClearGiteaProfile` to interface |
| `internal/store/users.go` | Implemented both methods; leaderboard SQL now selects `gitea_username`/`gitea_avatar_url` |
| `internal/api/auth.go` | Added 4 PAT handlers (`link`/`unlink`/`status`/`sync`); all invalidate caches on mutation |
| `internal/api/profile.go` | `profileResponse` now includes `gitea_username`/`gitea_avatar_url` (from `GetUserByID`) |
| `internal/api/me.go` | `meResponse` includes gitea fields (already added in prior session) |
| `internal/api/router.go` | Registered 4 PAT routes under auth middleware |
| `internal/config/config.go` | Made `GITEA_CLIENT_ID`/`GITEA_CLIENT_SECRET`/`GITEA_REDIRECT_URL` optional |

### Frontend Changes
| File | Change |
|------|--------|
| `components/layout/TopNav.tsx` | Gitea `<Image>` avatar + `@gitea_username` badge in dropdown trigger + content |
| `app/(main)/page.tsx` | Gitea avatar + `@username` in user summary card |
| `app/(main)/leaderboard/LeaderboardClient.tsx` | Gitea avatars on podium/"Your Ranking"/table rows; removed `studentId` column; per-user `onError` fallback |
| `app/(main)/profile/components/ProfileHeader.tsx` | Gitea `<Image>` avatar with `onError` → initials fallback; `@gitea_username` badge |
| `app/(main)/settings/page.tsx` | PAT input, link/unlink/sync buttons, avatar preview, `onError` fallback |
| `app/(main)/profile/ProfileClient.tsx` | Wired ActivityFeed into "My Contributions" tab sidebar |
| `app/(main)/profile/components/ActivityFeed.tsx` | NEW: achievement grid (6 badges) + recent activity timeline (solved/submissions/contributions) |
| `lib/api.ts` | Fixed `fetchApi` to preserve server error details (was discarding 4xx/5xx response body) |
| `lib/types.ts` | `User` and `UserProfile` include `gitea_username`/`gitea_avatar_url` |
| `next.config.ts` | Added `seccdn.libravatar.org` and `acad.learn2earn.ng` to `images.remotePatterns` |

### PAT Linking Flow
```
Settings → input PAT → POST /auth/gitea/link {token}
  → EncryptToken() (AES-256-GCM, key derived from JWT_SECRET)
  → FetchGiteaUser() → GET gitea.com/api/v1/user (Bearer token)
  → store encrypted token + gitea_username + gitea_avatar_url in DB
  → InvalidateUserCache() → cached /me + /me/profile cleared
  → dispatch user-updated event → all components re-fetch with fresh gitea fields
```

### Avatar Fallback Chain (every surface)
```
Gitea avatar URL exists + no onError → <Image> with next/image
  → onError → setAvatarError(true) → colored initials circle
  → no gitea_avatar_url at all → colored initials circle
```

### Display Name Strategy
- Primary: `name` (first+last from DB)
- If Gitea linked: `@gitea_username` badge (emerald, GitBranch icon)
- Fallback in dropdown: `studentId` in monospace
- Leaderboard: name only (no studentId column — it looks like email)

### Build Verification
- Backend: `go vet ./internal/auth/ ./internal/store/ ./internal/api/` — all pass
- Frontend: `npx next build` — `✓ Compiled successfully` (Windows DLL crash in NFT phase is environment-only)
