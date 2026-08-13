# Session Log

## Session 1 — 2026-07-08

### Goal
Begin Python curricula integration. Phase 0 (Schema & Configuration) is already complete. 
Start Phase 1 (User Language Preference).

### Tasks Completed

1. **Codebase Indexing**
   - Read and understood all ~50+ source files across backend, frontend, sandbox, and config
   - Documented current state of Python integration scaffolding
   - Verified Phase 0 completeness: migration 027, config fields, types, .env.example

2. **Phase 1 — User Language Preference (IN PROGRESS)**
   - Added `UpdateUserPrimaryLanguage` to Store interface (`store.go`)
   - Added `primary_language` to all GetUserBy* queries and CreateUser (`users.go`)
   - Implemented `UpdateUserPrimaryLanguage` method
   - Added `PrimaryLanguage` to `meResponse` struct and `GetMe` handler
   - Added `UpdateLanguage` handler with validation
   - Registered `PUT /me/language` route

### Decisions
- Language validation accepts `"go"` or `"python"` only
- `UpdateLanguage` invalidates user cache and returns full user response
- Uses `InvalidateUserCache` pattern matching existing handlers

### Next Steps
- Phase 2: Problem Language Versions (add language_versions to problem queries + language filter)
- Phase 3: Language in Submit/Test

### Open Issues
- None so far

## Session 16 — 2026-07-09

### Goal
Fix Python compiler error formatting.

### Tasks Completed
1. Updated `sandbox/main.go` with robust exception detection logic.
2. Fixed variable shadowing in `executor.go` to correctly propagate `sandboxError`.
3. Verified compilation and test suite (124 tests).

## Session 112 — 2026-08-10 (reindex)

### Goal
Professionally reindex the codebase after 3 new frontend commits (Sessions 110–112).

### Tasks Completed
1. Audited `f15dd00` (paste guard), `95d391f` (test-results panel, dashboard cards, auth deep-links, TextMate hardening), `b99b305` (setResults fix).
2. Verified `go vet` clean, 9/9 backend suites (169 tests) + sandbox (11 tests), ESLint 0 errors, `tsc --noEmit` 0 errors.
3. Updated CLAUDE.md (header, §3, §6.2/6.3, §8.1/8.2/8.4, §17, §20), SESSION_LOG.md (commit rows #172–175 + Sessions 110–112), UPDATE_LOG.txt, README.md file-tree fixes, CODEBASE_INDEX.md, BRAIN.md.

### Decisions
- This file (`.opencode/session-log.md`) remains a stale historical duplicate; the canonical log is `SESSION_LOG.md` (see CLAUDE.md Known Issue #3).

### Next Steps
- Merge `b99b305`/`95d391f` to staging/main; re-run Supabase migrations as needed.

### Open Issues
- None

## Session 114 — 2026-08-12 (CI fix + reindex)

### Goal
Fix the CI `npm ci` failure after `git pull origin update`, then professionally reindex the codebase.

### Tasks Completed
1. Pulled `b99b305` → `fdbf615` (incoming `8d8908a` admin problem-reminder emails + `fdbf615` lock-sync).
2. Removed unused devDependency `firebase-tools@^15.0.0` from `frontend/package.json` — cleared the EBADENGINE warnings (node `>=22`-only transitive deps) and dropped 442 packages from the lock.
3. Verified `npm ci` + `npm ci --dry-run` clean, ESLint 0, `tsc --noEmit` 0, `next build` ok, `go vet` clean, `go build ./cmd/server` ok, `go test ./internal/...` 9/9 suites (171 tests), sandbox green (11 tests).
4. Reindexed CLAUDE.md (header badge 2026-08-12 / 171+11 tests, §3/§4/§6/§8/§12/§15/§17/§19/§20), SESSION_LOG.md (rows #176–178 + Sessions 113/114), README.md, UPDATE_LOG.txt, CODEBASE_INDEX.md.
5. Committed `7d0091e` (fix) + docs commit to `update` only — no staging/main merge (CI triggers on main/staging pushes; fix validated on next merge).

### Decisions
- "Update only" — no staging/main merge per user decision.
- This file remains a stale duplicate; canonical log is `SESSION_LOG.md`.

### Next Steps
- Merge `update` into staging/main to trigger CI validation of the `npm ci` fix.
- Backfill SESSION_LOG.md commit row #179 (docs hash) next session.

### Open Issues
- None

## Session 116 — 2026-08-13 (Monaco warm-up + /vs prune + listings density + bug-report auto-draft)

### Goal
Professional polish pass over the uncommitted working tree: Monaco warm-up, `/vs` asset prune, denser problem cards, and the incoming bug-report auto-draft feature.

### Tasks Completed
1. **Monaco warm-up** — `components/MonacoPreloader.tsx` + `lib/monaco-warm.ts`: idle background load of the Monaco AMD build + TextMate/onig.wasm before first editor mount (mounted in `(main)/layout.tsx` + `app/problems/layout.tsx`); same init path as editors so the `initialized` guard skips duplicate registration on later mounts.
2. **`/vs` prune** — `scripts/copy-monaco.mjs` (16→48 LOC) regenerates `public/vs` each run and drops ts/css/html/json workers + non-English NLS → 15.4 MB → 5.19 MB (105 files). `public/vs` is gitignored, so the win is Vercel payload + local disk.
3. **Problems listings** — `/problems` passes `metrics`; `ProblemCard.tsx` densified (p-4 header, 15px title, fixed 2-line description clamp, py-3 footer, `mb-auto` removed); dead `Problem.successRate` dropped from `lib/types.ts`.
4. **Bug-report auto-draft (WIP, fixed)** — `internal/store/feedback.go` inverted UPDATE guard fixed: `HideProblemOnReportThreshold` now sets `visible=false` at the 2-reporter threshold (was returning drafted without hiding); workspace dialog + 4s auto-advance with Stay/Next + `clearCache("/problems")` verified; handler + fake-store tests green.
5. **Docs** — SESSION_LOG.md (Session 116), CLAUDE.md (badges, §3/§8/§17/§20).

### Decisions
- `public/vs` stays gitignored; the prune benefit is deployment payload.
- Uncommitted; staged for the `update` branch on approval.

### Next Steps
- Commit to `update` on approval; then merge update → staging/main per CI flow.
- Migration-free; no Supabase changes required for the auto-draft feature.

### Open Issues
- None
