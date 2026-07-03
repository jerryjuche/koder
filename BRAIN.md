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

## Recent Changes (July 2026)

- **Landing page redirect fix**: Removed JWT local-decode fallback in `frontend/lib/api.ts:fetchUser()` — was returning `success: true` for any localStorage token even when backend `/me` failed. Now only returns success when backend confirms the token.
- **Loading guard on `/`**: Added `checking` state in `frontend/app/page.tsx` — renders `null` while checking auth, prevents flash of landing page for authenticated users before redirect to `/home`.
