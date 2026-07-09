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
