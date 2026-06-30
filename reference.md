# Session Reference

## Goal
Implement Google Sign-In with username onboarding and synced avatars, remove all Gitea code, then fix three frontend issues (problem visibility, achievements, module proficiency sizing).

## Constraints & Preferences
- Users sign in with email/password OR Google; email must never be exposed in leaderboard or profile
- Gitea account linking, avatars, and all related code must be removed
- Username is the public identifier shown everywhere (leaderboard, search, profile)
- New Google users are prompted to choose a unique username during first-time onboarding
- Google profile picture is synced on every login and displayed everywhere

## Progress

### Done
- Google Sign-In implemented: backend (auth handler, store, config, migration, JWT claims) + frontend (login, onboarding, register pages)
- Gitea fully removed from backend (handlers, store methods, config, types) and frontend (types, api, all components)
- Settings page cleaned up — Gitea section removed, username shown as read-only
- **Issue 1 — Problem visibility**: enriched problems auto-publish (`visible=true`), "Publish All Drafts" button in admin, enriched status column
- **Issue 2 — Achievements**: shared `lib/achievements.ts` module, imported by both Achievements.tsx and ActivityFeed.tsx
- **Issue 3 — Module proficiency**: responsive gauge sizing (ResizeObserver), module-specific colors, sorted modules, empty state
- Backend: `go build ./cmd/server/` ✅
- Frontend: `npx tsc --noEmit` ✅ + `npm run build` ✅

### Pending
- Run migration 012 against the database
- Set `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env vars
- Test Google Sign-In end-to-end (login → onboarding → dashboard)
- Test existing email/password login still works

## Key Decisions
- Google token verification via `oauth2.googleapis.com/tokeninfo?id_token=` (zero extra Go deps)
- `username` column keeps existing `student_id` for backward compat; `Login` checks 3 fields
- `g_<sub[:8]>` temp username for new Google users; permanent name set on `/onboarding`
- Google avatar synced on every login via `UpdateUserGoogleAvatar`
- Enrichment auto-publishes problems (`visible=true` after enrichment)
- Achievements extracted to shared `lib/achievements.ts` to prevent code duplication
- Module gauges use `ResizeObserver` for responsive sizing + 16-color palette

## Relevant Files

### Backend
| File | Purpose |
|------|---------|
| `migrations/012_add_google_auth.sql` | Google OAuth columns + username + email |
| `internal/auth/oauth.go` | `VerifyGoogleToken` via tokeninfo endpoint |
| `internal/auth/jwt.go` | JWT with Username + Onboarding claims |
| `internal/store/types.go` | User/NewUser/LeaderboardUser with Google fields |
| `internal/store/users.go` | All Google+login methods, no Gitea |
| `internal/api/auth.go` | GoogleAuth, CompleteGoogle, CheckUsername, updated Login/Register |
| `internal/api/router.go` | Google routes, removed Gitea routes |
| `internal/api/me.go` | meResponse with Username/GoogleAvatarURL |
| `internal/api/profile.go` | profileResponse with Username/GoogleAvatarURL |
| `internal/api/admin.go` | Enrich auto-publishes, PublishAllDrafts handler |
| `internal/config/config.go` | GoogleClientID env var |

### Frontend
| File | Purpose |
|------|---------|
| `lib/types.ts` | `username`/`google_avatar_url` instead of gitea fields |
| `lib/api.ts` | `googleLogin`, `completeGoogleOnboarding`, `checkUsername`, `publishAllDrafts` |
| `lib/achievements.ts` | Shared `Achievement` type + `getAchievements()` |
| `app/(auth)/login/page.tsx` | Google Sign-In (GIS) + Username or Email form |
| `app/(auth)/onboarding/page.tsx` | Username setup page with debounced check |
| `app/(auth)/register/page.tsx` | Username + email fields |
| `components/layout/TopNav.tsx` | `@{username}` + `google_avatar_url` |
| `app/(main)/admin/page.tsx` | Publish All Drafts button, enriched status column |
| `app/(main)/profile/components/Achievements.tsx` | Uses shared `lib/achievements.ts` |
| `app/(main)/profile/components/ActivityFeed.tsx` | Uses shared `lib/achievements.ts` |
| `app/(main)/profile/components/ProgressMetrics.tsx` | Module colors, sorted, no fallback data |
| `components/ui/activity-gauge.tsx` | Responsive sizing via ResizeObserver, module colors |
| `app/(main)/settings/page.tsx` | No Gitea section, username read-only |
