# BRAIN.md — Session Primer

## On Startup.

When beginning a new session or resuming after compaction, execute the following:

### 1. Index the Codebase
Read and understand every file and folder in the project. Build a complete mental model of the codebase structure, all modules, their responsibilities, and how they connect.

### 2. Read All Markdown Files
Read every `.md` file in the repository to capture context, conventions, constraints, architecture decisions, and recent changes.

### 3. Session Logging
Maintain a session log (`.opencode/session-log.md`) that records:
- What was done this session
- What was implemented or changed (with file paths)
- Decisions made and rationale
- Progress toward goals
- Open issues or blockers
- What should be done next

Update this log **before every compaction** so no context is lost.

### 4. Update README.md
Keep the README current with accurate project description, architecture overview, setup instructions, and any significant changes.

### 5. Update CLAUDE.md
Keep `CLAUDE.md` (the codebase index/guide) up to date with:
- Accurate file listings and module descriptions
- Architecture decisions and rationale
- Recent changes
- Next steps / roadmap

### 6. Professional Standards
All documentation, code, and communication must be clear, precise, and professionally written.

---

## Session Lifecycle

| Phase | Action |
|-------|--------|
| **Start** | Index codebase + read all `.md` files |
| **During** | Track progress, log decisions |
| **Pre-compaction** | Flush session log with complete summary |
| **Post-change** | Update README + CLAUDE.md if project structure changes |

---

## Recent Changes (August 2026)

- **CI npm ci fix + reindex (Aug 12)**: Removed unused `firebase-tools@^15.0.0` devDependency from `frontend/package.json` — cleared CI EBADENGINE warnings (node `>=22`-only transitive deps) and the `npm ci` lock-sync error (`7d0091e`). Pulled incoming `8d8908a` (admin problem-reminder email broadcasts — `POST /admin/broadcast-emails`, `internal/email/send.go`, `store.ListAllUserEmails`, `EmailBroadcastPanel.tsx`, 159 Store methods) and `fdbf615` (lock sync). Full reindex: CLAUDE.md header → 2026-08-12 / 171 backend + 11 sandbox tests, SESSION_LOG.md (#176–178 + Sessions 113/114), README.md, UPDATE_LOG.txt, CODEBASE_INDEX.md. Committed to `update` only.
- **Reindex (Aug 10)**: Full professional reindex covering Sessions 110–112 — `f15dd00` (strict paste guard in workspace editor via `lib/monaco-paste-guard.ts`), `95d391f` (test-results diff primitives in `components/test-results/`, dashboard-style problem cards, auth deep-links via `lib/auth-redirect.ts`, Monaco TextMate onig.wasm retry hardening), `b99b305` (restored `setResults` in submit/test handlers). CLAUDE.md, SESSION_LOG.md (#172–175), UPDATE_LOG.txt, README.md, CODEBASE_INDEX.md all updated.
- **Frequent-logout fix (Aug 5)**: Refresh-token rotation race — rotation-grace reuse detection (`REFRESH_TOKEN_ROTATED` for fresh reuse, revoke-all only on stale replay), `/auth/refresh` moved off the per-IP limiter, cookie MaxAge aligned to access-token expiry, default access-token TTL 15→60 min. See `SESSION_LOG.md` session 108.
- **PIN removal (Aug 5)**: 6-digit PIN recovery system fully removed — email-only recovery + current-password change flow. Migration `050_drop_pin_hash.sql`.

## Recent Changes (July 2026)

- **Landing page redirect fix**: Removed JWT local-decode fallback in `frontend/lib/api.ts:fetchUser()` — was returning `success: true` for any localStorage token even when backend `/me` failed. Now only returns success when backend confirms the token.
- **Loading guard on `/`**: Added `checking` state in `frontend/app/page.tsx` — renders `null` while checking auth, prevents flash of landing page for authenticated users before redirect to `/home`.
- **Optimization sprint (Jul 3)**: Broadcast system polish (optional fields, atomic notifications, latest-only banner, slim redesign); LATERAL join query optimization (ListVisibleProblems, GetUserStats split, EXISTS over HAVING); bulk INSERTs (UpsertEnrichedProblem); LIMITs on all unbounded SELECTs; pgxpool tuning (MaxConns=10, MinConns=2); migration 017 (16 indexes). See `SESSION_LOG.md` session 11 for full details.
