# Session Reference

## Goal
Google Sign-In migration → Gitea removal → legal pages → profile redesign → token fix.

## Progress

### Done — Backend
- Google Sign-In (auth handler, store, config, migration 012, JWT claims)
- Gitea fully removed (handlers, store methods, config, types, migrations)
- Enrichment auto-publishes problems (`visible=true`); `POST /admin/problems/publish-all`
- `aud` claim validation on Google tokens
- `FlexibleBool` type for `email_verified` (accepts both `true` and `"true"` from JSON)
- `go build ./cmd/server/` ✅

### Done — Frontend
- Legal pages: `/privacy` and `/terms` in `(legal)` layout group
- Auth footer: "Privacy · Terms" links
- Profile page redesigned: glassmorphism, motion animations, animated counters, SVG XP ring, timeline activity feed, shimmer skeleton, pulse-slow and shimmer CSS keyframes
- Shared `lib/achievements.ts` module
- Module proficiency gauges: ResizeObserver + 16-color palette
- Publish All Drafts button in admin
- GIS button on login, username onboarding page
- `npx tsc --noEmit` ✅ + `npm run build` ✅

### Pending
- Run migration 012 against the database
- Set `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env vars
- Test Google Sign-In end-to-end
- Test existing email/password login

## Key Decisions
| Decision | Rationale |
|----------|-----------|
| `tokeninfo` endpoint (not SDK) | Zero extra Go deps; simple HTTP GET |
| `username` column (not replace student_id) | Backward compat |
| Google avatar synced on every login | Profile stays current |
| `g_<sub[:8]>` temp username | Guarantees uniqueness |
| `GetUserByLogin` checks 3 fields | Username, email, OR student_id |
| Enrichment auto-publishes | No manual toggle needed |
| Achievements in shared module | DRY, no copy-paste drift |
| `FlexibleBool` custom JSON unmarshal | Google tokeninfo returns `email_verified` as string sometimes |
| Motion for animations | Already in deps as `motion` package |
| Glassmorphism (`backdrop-blur-xl`, `bg-black/40`) | Premium dark aesthetic, consistent with brand |

## Relevant Files

### Backend
| File | Purpose |
|------|---------|
| `migrations/012_add_google_auth.sql` | Google OAuth columns + username + email |
| `internal/auth/oauth.go` | `VerifyGoogleToken` with `aud` check + FlexibleBool |
| `internal/auth/jwt.go` | JWT with Username + Onboarding claims |
| `internal/store/types.go` | `GoogleUserInfo` with `FlexibleBool`, `User`/`NewUser`/`LeaderboardUser` |
| `internal/store/users.go` | All Google+login methods, no Gitea |
| `internal/api/auth.go` | GoogleAuth, CompleteGoogle, CheckUsername, updated Login/Register |
| `internal/api/router.go` | Google routes, removed Gitea routes |
| `internal/api/me.go` | `username` + `google_avatar_url` |
| `internal/api/profile.go` | `username` + `google_avatar_url` |
| `internal/api/admin.go` | Enrich auto-publishes, PublishAllDrafts |
| `internal/config/config.go` | `GoogleClientID` |

### Frontend
| File | Purpose |
|------|---------|
| `app/(legal)/layout.tsx` | Branded layout for legal pages |
| `app/(legal)/privacy/page.tsx` | Privacy policy |
| `app/(legal)/terms/page.tsx` | Terms of service |
| `app/(auth)/layout.tsx` | Footer with Privacy · Terms links |
| `app/(main)/profile/ProfileClient.tsx` | Shimmer skeleton, stagger entrance |
| `app/(main)/profile/components/ProfileHeader.tsx` | Glassmorphism, XP ring, animated glow, mini-stats |
| `app/(main)/profile/components/StatsOverview.tsx` | `AnimatedNumber` counters, gradient per card, stagger |
| `app/(main)/profile/components/ProgressMetrics.tsx` | `AnimatedBar`, module gauges, empty state |
| `app/(main)/profile/components/Achievements.tsx` | Motion scale entrance, glass dialog |
| `app/(main)/profile/components/ActivityFeed.tsx` | Timeline with vertical line + dots |
| `components/ui/activity-gauge.tsx` | ResizeObserver, 16-color palette |
| `lib/achievements.ts` | Shared Achievement type + getAchievements() |
| `lib/types.ts` | `username`/`google_avatar_url` |
| `lib/api.ts` | Google + publish endpoints |
| `app/globals.css` | `pulse-slow` + `shimmer` keyframes |
