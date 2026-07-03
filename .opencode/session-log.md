# Session Log

## 2026-07-03 — Full Codebase Re-index

### Done
- Read all 7 markdown files: BRAIN.md, README.md, CLAUDE.md, CODEBASE_ANALYSIS.md, SESSION_LOG.md, reference.md, frontend/README.md
- Explored complete directory structure: 30+ directories across cmd/, internal/, frontend/, sandbox/, migrations/, scripts/, docs/
- Read key source files: cmd/server/main.go (entry point), internal/api/router.go (route table), internal/store/store.go (106-method Store interface), internal/store/types.go (all data models)
- Globbed and mapped: 36 frontend page/component files, 21 shadcn/ui components, 8 lib files, 2 hooks
- Verified codebase state aligns with README.md and CLAUDE.md documentation

### Mental Model Summary
- **Architecture:** Go monolith (Oracle ARM64) + Next.js 14 frontend (Vercel) + Supabase Postgres
- **3 Pipelines:** Ingest (GitHub YAML) → Enrich (Gemini/Groq AI) → Execute (Docker/sandbox)
- **Store Interface:** 106 methods across users, problems, submissions, progress, admin, notifications, community
- **Auth:** email/password (bcrypt) + Google OAuth (GIS), JWT HS256, onboarding flow
- **Executor:** semaphore-based concurrency (default 6), dual-path (remote HTTP sandbox or local Docker)
- **Frontend:** 36 page/component files, shadcn/ui, Monaco Editor, dark mode, motion animations
- **Latest changes:** Google Sign-In migration, account deletion, GIS hook, profile redesign, leaderboard redesign

### Next Steps
- Awaiting user direction for development work

### Done
- Created `BRAIN.md` — session primer for onboarding/resuming work
- Created `.opencode/session-log.md` — session log file

### Decisions
- BRAIN.md placed at project root for discoverability
- Session log stored in `.opencode/` to keep root clean

---

## 2026-07-02 — Full Codebase Indexing & Documentation

### Done
- Indexed the entire codebase: 173 source files across 40+ directories
- Read and analyzed all source files:
  - **Entry point:** `cmd/server/main.go` (105 lines) — structured logging, config load, DB init, executor warmup, HTTP server with graceful shutdown
  - **Config:** `internal/config/config.go` (250 lines) — dual-provider enrichment (Gemini/Groq), 20+ env vars with validation
  - **Store:** 12 files covering 106-method interface (`Store`), user CRUD, problems, submissions, progress, admin, notifications, community contributions, full-profile PL/pgSQL function
  - **API:** 16 handlers across router, auth, problems, submissions, test, admin, me, profile, leaderboard, community, contributions, activity, notifications, cache
  - **Auth:** JWT HS256 sign/verify, bcrypt cost=12, Google OAuth token verification via `tokeninfo` endpoint
  - **Executor:** Full grading pipeline with semaphore (configurable concurrency), dual-path execution (remote sandbox HTTP or local Docker), regex-based `go test` output parser, `text/template` test generation
  - **Enricher:** Dual-provider (Gemini with `ResponseSchema`, Groq with `json_object`), rate-limited, validated structured output
  - **Parser:** GitHub repo ingestion, sparse clone, SHA256 dedup
  - **Sandbox:** Standalone Go binary, pre-exec validation, `setrlimit` isolation, per-IP rate limiter
  - **Frontend:** Next.js 14 with App Router, 40+ page/component files, shadcn/ui, Monaco Editor, GIS Google auth
  - **Migrations:** 12 SQL migration files covering full schema evolution
  - **Docs:** README (1152 lines), CLAUDE.md (403 lines), CODEBASE_ANALYSIS.md (885 lines), SESSION_LOG.md (319 lines), UPDATE_LOG.txt, reference.md, copilot-instructions.md

### Key Architecture Discovered
- **Monolithic Go backend** on Oracle ARM64 + Next.js on Vercel + Supabase Postgres
- **Three pipelines:** Ingest → Enrich → Execute
- **$0/month constraint** drives every architectural decision
- **Dual execution path:** Remote HTTP sandbox (default, Railway) or local Docker (fallback)
- **Dual AI provider:** Gemini (structured outputs) or Groq (JSON mode)
- **Concurrency:** Buffered channel semaphore (default 6)
- **Auth:** Email/password + Google OAuth (GIS), JWT HS256, onboarding flow
- **Community:** User-submitted problems with moderation pipeline (pending→approve/reject)

### Next Steps
- Verify CLAUDE.md reflects current codebase state
- Update README if any inaccuracies found
- Continue development as directed

---

## 2026-07-02 — Landing Page Redirect Bug Fix

### Done
- Diagnosed root cause: `fetchUser()` in `frontend/lib/api.ts` had a JWT local-decode fallback that returned `success: true` for any localStorage token, even when the backend `/me` endpoint failed
- This caused `app/page.tsx` to redirect unauthenticated users from `/` to `/home`
- **Fix:** Removed the JWT local-decode fallback (original lines 164-198). `fetchUser()` now only returns `success: true` when the backend confirms the token
- Added proper error return for the case when `/me` endpoint fails
- **Second fix:** Added loading state (`checking`) in `app/page.tsx` so authenticated users don't see a flash of the landing page before redirect — `return null` while checking auth, only render `<LandingContent>` after confirmed unauthenticated
- Verified TypeScript compiles cleanly on both changes
