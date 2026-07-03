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

## Build Verification
- ✅ `go vet ./internal/api/ ./internal/store/ ./internal/config/` — passes
- ✅ `npx tsc --noEmit` — zero errors
- ✅ `npx next build` — compiled, types checked, all 17 pages generated

## Next Steps
- Run migration `014_feedback.sql` against the database
- Set `RESEND_API_KEY` and `ADMIN_EMAIL` env vars
- Test feedback submission end-to-end (frontend → backend → database → email)
- Test admin feedback panel (status change, notes, screenshot preview)
