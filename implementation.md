# Koder — Multi-Language Curriculum Integration

**Python Support alongside Go**

Architecture Review, Design Decisions, and Implementation Plan

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Review](#2-architecture-review)  
   2.1 [Current Architecture](#21-current-architecture)  
   2.2 [Strengths](#22-strengths)  
   2.3 [Weaknesses](#23-weaknesses)  
   2.4 [Scalability Considerations](#24-scalability-considerations)
3. [Design Decisions](#3-design-decisions)  
   3.1 [Decision Register](#31-decision-register)  
   3.2 [JSONB Schema](#32-jsonb-schema)  
   3.3 [Backward Compatibility](#33-backward-compatibility)
4. [Implementation Phases](#4-implementation-phases)  
   4.1 [Phase 0 — Schema & Configuration](#41-phase-0--schema--configuration)  
   4.2 [Phase 1 — User Language Preference](#42-phase-1--user-language-preference)  
   4.3 [Phase 2 — Problem Language Versions](#43-phase-2--problem-language-versions)  
   4.4 [Phase 3 — Language in Submit/Test](#44-phase-3--language-in-submittest)  
   4.5 [Phase 4 — Python Test Template](#45-phase-4--python-test-template)  
   4.6 [Phase 5 — Multi-Language Sandbox](#46-phase-5--multi-language-sandbox)  
   4.7 [Phase 6 — Python Security](#47-phase-6--python-security)  
   4.8 [Phase 7 — Frontend Types & State](#48-phase-7--frontend-types--state)  
   4.9 [Phase 8 — LanguageSelector Component](#49-phase-8--languageselector-component)  
   4.10 [Phase 9 — TopNav Language Switcher](#410-phase-9--topnav-language-switcher)  
   4.11 [Phase 10 — Language-Aware Dashboard](#411-phase-10--language-aware-dashboard)  
   4.12 [Phase 11 — Language-Aware Workspace](#412-phase-11--language-aware-workspace)  
   4.13 [Phase 12 — Multi-Language Enrichment](#413-phase-12--multi-language-enrichment)
5. [File Change Summary](#5-file-change-summary)
6. [Backward Compatibility Checklist](#6-backward-compatibility-checklist)
7. [Risk Register & Mitigations](#7-risk-register--mitigations)
8. [Effort Estimates](#8-effort-estimates)

---

## 1. Executive Summary

Koder currently supports Go exclusively. This document defines a production-grade plan to add Python as a second curriculum language while maintaining full backward compatibility for existing Go users.

**Key design principles:**

- **Zero disruption** — existing Go users, problems, submissions, and progress remain untouched
- **Parser agnosticism** — the custom Python test runner emits Go-compatible output format, requiring zero changes to `parser.go`
- **Schema scalability** — a single `language_versions JSONB` column on `problems` replaces per-language column expansion, scaling to N languages without further schema changes
- **Defense in depth** — Python code security employs four layers: regex blocklist → AST analysis → Docker hardening → resource limits
- **Incremental delivery** — 12 phases, each independently testable and deployable

**Total estimated effort:** 8–12 days for a single engineer.

---

## 2. Architecture Review

### 2.1 Current Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
│  UserContext → fetchApi → /me, /problems, /submit         │
│  Monaco Editor (Go language)                               │
│  TestResultPanel (LCS diff)                                │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP + JWT cookies
┌────────────────────────▼─────────────────────────────────┐
│                 Backend (Go + Chi)                         │
│  Middleware: Recovery → CORS → Security → Auth             │
│  ┌──────────┐ ┌──────────┐ ┌────────────────────────┐    │
│  │ Auth     │ │ Problems │ │ Executor               │    │
│  │ /login   │ │ /list    │ │ → sandbox_client       │    │
│  │ /me      │ │ /:slug   │ │ → Docker/Sandbox       │    │
│  └──────────┘ └──────────┘ └───────────┬────────────┘    │
│  ┌──────────┐ ┌──────────┐             │                  │
│  │ Enricher │ │ Admin    │             │                  │
│  │ Gemini   │ │ /stats   │             │                  │
│  │ Groq     │ │ /ingest  │             │                  │
│  └──────────┘ └──────────┘             │                  │
└─────────────────────────────────────────┼────────────────┘
                                          │
┌─────────────────────────────────────────▼────────────────┐
│                  PostgreSQL (Supabase)                     │
│  users, problems, test_cases, submissions,                │
│  progress, activity_logs, notifications, feedback         │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│                  Sandbox (Railway)                         │
│  HTTP server: /execute /health /version                    │
│  Go compilation + go test execution                        │
│  Security: regex → setrlimit → Docker isolation            │
└───────────────────────────────────────────────────────────┘
```

### 2.2 Strengths

| Area | Assessment |
|------|-----------|
| **Schema Design** | `problems.language TEXT NOT NULL` and `submissions.language TEXT NOT NULL` already exist. Index `idx_problems_language` is already in place. |
| **Executor Type System** | `ExecutionRequest.Language string` exists in the type system — it is persisted to submissions but never branched on, providing a natural extension point. |
| **Sandbox Isolation** | Four-layer security model: regex pattern blocking → Docker container (`--network none`, `--read-only`) → setrlimit (NPROC=6, NOFILE=1024, FSIZE=64MB) → process group isolation. |
| **Backend Layering** | Clean separation through the `store.Store` interface. All database operations are behind a single interface, making query changes localized. |
| **Frontend State** | `UserContext` + `fetchApi` wrapper with 30s sessionStorage TTL and event-driven refresh (`window.dispatchEvent(new Event('user-updated'))`). |
| **Parser Agnosticism** | `parser.go` matches generic patterns (`=== RUN`, `GOT:`, `WANT:`) — a custom Python test runner emitting the same format requires zero changes. |
| **CI Pipeline** | `.github/workflows/ci.yml`: Go vet → Go test → npm ci → TypeScript check → Next.js build. Catches regressions early. |

### 2.3 Weaknesses

| Area | Current State |
|------|---------------|
| **No User Language Preference** | `users` table has no `preferred_language` column. All `GetUserBy*` queries omit language entirely. |
| **Sandbox is Go-Monolithic** | Single `runTests()` function writes `go.mod`, `solution.go`, `main_test.go` and runs `go test` — no language routing. |
| **Sandbox Request Schema is Go-Specific** | `ExecuteRequest` has `GoModule` and `GoVersion` but no `Language` discriminator. |
| **Security Blocklist is Go-Only** | `secure.go` only blocks Go patterns (`os/exec`, `syscall`, `unsafe`, `reflect.*`). No Python-equivalent validation exists. |
| **Frontend Editor Go-Hardcoded** | Monaco language set to `"go"`, scaffold generates `package piscine`, badge strings are hardcoded `"Go"`, snippet completions are Go-specific. |
| **Enricher is Go-Only** | System prompt generates Go function signatures only. `enrichedResponse` struct has no Python variant. |
| **Template System is Go-Only** | Only `mainTestTemplate` exists — no `pythonTestTemplate`. |
| **Single Docker Image Config** | One `DockerImage` config variable (default `golang:1.23-alpine`). |
| **No Language Filtering** | `ListVisibleProblems` has no `language` filter parameter. Dashboard shows all languages mixed. |
| **No Onboarding Language Choice** | `onboarding/page.tsx` only sets username — no language selection step. |
| **No Separate Python Timeout** | Single `ExecutorTimeoutSeconds` (default 30s). Python may require longer timeouts. |

### 2.4 Scalability Considerations

| Concern | Mitigation |
|---------|------------|
| **Column Explosion** | Per-language columns (`py_func_name`, `py_return_type`, ...) don't scale to Rust, JS, etc. A single `language_versions JSONB` column accommodates N languages without further schema changes. |
| **Sandbox Single-Binary** | Python execution via a separate Railway service (recommended) or Docker-in-Docker from the existing Go binary. MVP uses separate service for complete isolation. |
| **500MB Postgres Limit** | `language_versions JSONB` adds ~500 bytes/problem. At 200 problems = 100KB — negligible impact. |
| **Gemini 50 calls/day** | Multi-language enrichment doubles theoretical demand. Mitigation: round-robin per-language enrichment, one language per AI call. |
| **6 Concurrent Executions** | Python and Go share the same semaphore for MVP. A second semaphore can be introduced if Python needs independent limits. |

---

## 3. Design Decisions

### 3.1 Decision Register

| ID | Decision | Rationale |
|----|----------|-----------|
| D1 | `primary_language TEXT DEFAULT 'go'` on `users` | Fast user-level default with no JOIN needed. All existing rows inherit `'go'` automatically. |
| D2 | `language_versions JSONB` on `problems` | Single column holds `{"go": {...}, "python": {...}}`. Scales to N languages without schema changes. |
| D3 | Custom Python test runner | Emits Go-compatible output format (`=== RUN`, `--- PASS/FAIL`, `GOT:`, `WANT:`). Zero changes to `parser.go`. |
| D4 | Python AST validation as Layer 2 security | More robust than regex alone — walks AST tree banning `ast.Import`, `ast.Call` nodes. Catches obfuscated imports. |
| D5 | Separate Python Docker image | `python:3.12-slim` with identical security posture (`--network none`, `--read-only`, `--user 1000:1000`). |
| D6 | Separate Python timeout config | `PYTHON_EXECUTOR_TIMEOUT_SECONDS` allows longer timeouts for Python without affecting Go. |
| D7 | `PUT /me/language` endpoint | Clean RESTful update returning the full user object. No new sub-resource needed. |
| D8 | No changes to `parser.go` | Single biggest time saver — no parser changes, no test harness changes, no backend output-processing changes. |
| D9 | Filter in Go, not SQL (MVP) | `ListVisibleProblems` fetches all visible problems and filters in the handler. Can be optimized to SQL-level filtering later. |
| D10 | localStorage + API persistence | Frontend writes to localStorage for immediate reactivity, then calls API for server-side persistence. Falls back gracefully on API failure. |

### 3.2 JSONB Schema

The `language_versions` column stores per-language function metadata and test cases:

```json
{
  "go": {
    "func_name": "IsPrime",
    "return_type": "bool",
    "param_types": ["int"]
  },
  "python": {
    "func_name": "is_prime",
    "return_type": "bool",
    "param_types": ["int"]
  }
}
```

### 3.3 Backward Compatibility

The migration backfills `language_versions` from existing per-problem columns:

```sql
UPDATE problems
SET language_versions = jsonb_build_object(
  'go', jsonb_build_object(
    'func_name', COALESCE(func_name, ''),
    'return_type', COALESCE(return_type, ''),
    'param_types', COALESCE(param_types, '[]'::text[])
  )
)
WHERE language = 'go'
  AND language_versions = '{"go": {"func_name": "", "return_type": "", "param_types": []}}'::jsonb;
```

Existing submissions reference `problems.language = 'go'` and `submissions.language = 'go'` — these continue to work without modification.

---

## 4. Implementation Phases

### 4.1 Phase 0 — Schema & Configuration

**Objective:** Add `primary_language` to users, `language_versions` to problems, and Python-specific configuration variables.

#### 4.1.1 Migration: `migrations/027_language_versions.sql`

```sql
ALTER TABLE users ADD COLUMN primary_language TEXT NOT NULL DEFAULT 'go';
CREATE INDEX idx_users_primary_language ON users (primary_language);

ALTER TABLE problems ADD COLUMN language_versions JSONB NOT NULL
  DEFAULT '{"go": {"func_name": "", "return_type": "", "param_types": []}}'::jsonb;

UPDATE problems SET language_versions = jsonb_build_object(
  'go', jsonb_build_object(
    'func_name', COALESCE(func_name, ''),
    'return_type', COALESCE(return_type, ''),
    'param_types', COALESCE(param_types, '[]'::text[])
  )
) WHERE language = 'go'
  AND language_versions = '{"go": {"func_name": "", "return_type": "", "param_types": []}}'::jsonb;
```

**Rollback:**
```sql
ALTER TABLE users DROP COLUMN IF EXISTS primary_language;
DROP INDEX IF EXISTS idx_users_primary_language;
ALTER TABLE problems DROP COLUMN IF EXISTS language_versions;
```

#### 4.1.2 Configuration: `internal/config/config.go`

Add to `Config` struct:

```go
// Python execution
PythonDockerImage     string // default: "python:3.12-slim"
PythonExecutorTimeout int    // default: 60
PythonSandboxURL      string // optional separate Python sandbox
```

Add loading in `Load()`:

```go
cfg.PythonDockerImage = os.Getenv("PYTHON_DOCKER_IMAGE")
if cfg.PythonDockerImage == "" {
    cfg.PythonDockerImage = "python:3.12-slim"
}

pythonTimeoutStr := os.Getenv("PYTHON_EXECUTOR_TIMEOUT_SECONDS")
if pythonTimeoutStr == "" {
    pythonTimeoutStr = "60"
}
pythonTimeout, err := strconv.Atoi(pythonTimeoutStr)
if err != nil {
    return nil, fmt.Errorf("PYTHON_EXECUTOR_TIMEOUT_SECONDS must be a valid integer: %w", err)
}
cfg.PythonExecutorTimeout = pythonTimeout

cfg.PythonSandboxURL = os.Getenv("PYTHON_SANDBOX_URL")
```

#### 4.1.3 Environment: `.env.example`

```
PYTHON_DOCKER_IMAGE=python:3.12-slim
PYTHON_EXECUTOR_TIMEOUT_SECONDS=60
PYTHON_SANDBOX_URL=
```

#### 4.1.4 Types: `internal/store/types.go`

Add to `User` struct:
```go
PrimaryLanguage string `db:"primary_language" json:"primary_language"`
```

Add to `NewUser` struct:
```go
PrimaryLanguage string // default "go"
```

Add to `Problem` struct:
```go
LanguageVersions map[string]LanguageSpec `db:"language_versions" json:"language_versions"`
```

Add new type:
```go
type LanguageSpec struct {
    FuncName   string   `json:"func_name"`
    ReturnType string   `json:"return_type"`
    ParamTypes []string `json:"param_types"`
}
```

---

### 4.2 Phase 1 — User Language Preference

**Objective:** Persist and expose `primary_language` on the user profile with an API endpoint for updates.

#### 4.2.1 Store Interface

Add to `Store` interface in `internal/store/store.go`:
```go
UpdateUserPrimaryLanguage(ctx context.Context, id uuid.UUID, language string) error
```

#### 4.2.2 Store Implementation: `internal/store/users.go`

- Add `primary_language` to all `GetUserBy*` SELECT and Scan operations (7 queries total)
- Add `primary_language` to `CreateUser` INSERT with default `'go'`
- Implement `UpdateUserPrimaryLanguage`:
  - Validate language is `"go"` or `"python"`
  - Execute `UPDATE users SET primary_language = $1 WHERE id = $2`
  - Return error if zero rows affected

#### 4.2.3 API Handler: `internal/api/me.go`

Add `PrimaryLanguage` to `meResponse` struct. In `GetMe`, populate from `user.PrimaryLanguage`, defaulting to `"go"` when empty.

Add new handler:
```go
func (h *MeHandler) UpdateLanguage(w http.ResponseWriter, r *http.Request)
```
- Parse and validate `{"language": "go|python"}` request body
- Call `store.UpdateUserPrimaryLanguage`
- Invalidate user cache
- Return updated user via `meResponse`

#### 4.2.4 Route Registration: `internal/api/router.go`

```
r.With(BodySizeLimitMiddleware(256 * 1024)).Put("/me/language", meHandler.UpdateLanguage)
```

---

### 4.3 Phase 2 — Problem Language Versions

**Objective:** Expose `language_versions` from the problems API and add `?language=` query parameter filtering.

#### 4.3.1 Store Queries: `internal/store/problems.go`

Add `language_versions` to SELECT and Scan in:
- `ListVisibleProblems`
- `GetProblemBySlug`
- `GetProblemBySlugAny`
- `ListAllProblemsAdmin`

Scan JSONB as `[]byte` and unmarshal into `map[string]LanguageSpec`.

#### 4.3.2 Language Filtering: `internal/api/problems.go`

In `ListVisibleProblems` handler:
```go
languageFilter := r.URL.Query().Get("language")
if languageFilter != "" && languageFilter != "go" && languageFilter != "python" {
    languageFilter = ""
}
```

Filter problems in Go after store fetch (MVP approach — can be pushed to SQL if performance requires):
```go
if languageFilter != "" {
    var filtered []store.Problem
    for _, p := range problems {
        if p.Language == languageFilter {
            filtered = append(filtered, p)
        }
    }
    problems = filtered
}
```

---

### 4.4 Phase 3 — Language in Submit/Test

**Objective:** Accept `language` in submission and test executions, propagate it through the executor.

#### 4.4.1 Submit Handler: `internal/api/submissions.go`

Add `Language string` to `submitRequest`. In `Submit`:
- Default to `problem.Language` if not provided
- Validate the problem supports the requested language via `LanguageVersions`
- Pass language through `ExecutionRequest`

#### 4.4.2 Test Handler: `internal/api/test.go`

Same changes: add `Language` to request struct, validate, propagate.

#### 4.4.3 Executor Branching: `internal/executor/executor.go`

In `Execute` and `ExecuteVisibleOnly`:
```go
if req.Language == "python" {
    return e.executePython(ctx, req, problem, testCases)
}
// Default: Go execution path (existing code)
```

Initial stub for `executePython`:
```go
func (e *Executor) executePython(...) (*ExecutionResult, error) {
    return nil, fmt.Errorf("python execution not yet implemented")
}
```

---

### 4.5 Phase 4 — Python Test Template

**Objective:** Create a Python test runner that emits Go-compatible output for zero-impact parsing.

#### 4.5.1 Template: `internal/executor/templates.go`

```python
import sys, json

sys.path.insert(0, '.')
from solution import {{.FuncName}}

test_cases = {{.TestCasesJSON}}

print("=== RUN TestSolution")

passed = 0
total = len(test_cases)

for tc in test_cases:
    ordinal = tc["ordinal"]
    inputs = tc["input_json"]
    expected = tc["expected"]
    try:
        result = {{.FuncName}}(*inputs)
        status = "PASS" if str(result) == str(expected) else "FAIL"
        if status == "PASS":
            passed += 1
        print(f"--- {status}: TestSolution/case_{ordinal}")
        if status == "FAIL":
            print(f"=== FAIL: Case {ordinal}")
            print(f"GOT: {result}")
            print(f"WANT: {expected}")
    except Exception as e:
        print(f"--- FAIL: TestSolution/case_{ordinal}")
        print(f"=== FAIL: Case {ordinal}")
        print(f"GOT: (exception) {e}")
        print(f"WANT: {expected}")

print(f"--- PASS: TestSolution" if passed == total else f"--- FAIL: TestSolution")
```

#### 4.5.2 Template Data

Add `TestCasesJSON string` to `TemplateRenderData`:
```go
type TemplateRenderData struct {
    FuncName      string
    ParamTypes    []string
    ReturnType    string
    IsPrimitive   bool
    NeedsReflect  bool
    TestCases     []TestCaseRenderData
    TestCasesJSON string // JSON-encoded test cases for Python template
}
```

#### 4.5.3 Python Literal Formatting: `internal/executor/executor.go`

Implement `formatPythonLiteral` — maps Go types to Python literal syntax:
- `int` types → Python `int`
- `float` types → Python `float`
- `string` → quoted Python string
- `bool` → `True`/`False`

---

### 4.6 Phase 5 — Multi-Language Sandbox

**Objective:** Extend the Railway sandbox (or create a separate service) to support Python execution.

#### 4.6.1 Request/Response Types: `sandbox/main.go`

Add `Language string` to `ExecuteRequest`:
```go
type ExecuteRequest struct {
    Language   string `json:"language"`     // "go" | "python"
    Code       string `json:"code"`
    TestCode   string `json:"test_code"`
    TimeoutSec int    `json:"timeout_sec"`
    GoModule   string `json:"go_module,omitempty"`
    GoVersion  string `json:"go_version,omitempty"`
}
```

#### 4.6.2 Language Routing

In `executeHandler`, route based on `req.Language`:
```go
switch req.Language {
case "python":
    result = runPythonTests(ctx, req)
default:
    result = runGoTests(ctx, req)
}
```

#### 4.6.3 Go Runner Extraction: `sandbox/runtest_go.go` (NEW)

Extract existing `runTests` into `runGoTests` in its own file.

#### 4.6.4 Python Runner: `sandbox/pyrunner.go` (NEW)

Implement `runPythonTests`:
- Validate Python code (regex + AST)
- Create temp directory
- Write `solution.py` (strip shebang, normalize)
- Write `run_tests.py` (generated test script)
- Execute `python3 -u run_tests.py` with process isolation
- Parse output via existing `classifyOutput` (Go-compatible format)
- Return `ExecuteResponse`

#### 4.6.5 Docker Configuration

**Option A (Recommended — MVP):** Separate Railway service with `Dockerfile.python`:
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY sandbox-runner /usr/local/bin/
EXPOSE 8080
CMD ["sandbox-runner"]
```

**Option B (Production — Single Service):** Extend the Go binary to shell out to Docker for Python execution. Requires Docker-in-Docker setup.

#### 4.6.6 Sandbox Client: `internal/executor/sandbox_client.go`

Add `Language` to `SandboxRequest`. Update `execute` method to accept and forward language. Update callers in `executor.go`.

---

### 4.7 Phase 6 — Python Security

**Objective:** Implement defense-in-depth security for Python code execution across four layers.

#### 4.7.1 Layer 1 — Regex Blocklist: `sandbox/secure.go`

Define `pythonDangerousPatterns` blocking:
- Dangerous imports: `os`, `subprocess`, `ctypes`, `socket`, `shutil`, `pickle`, `code`, `importlib`
- Dynamic execution: `eval(`, `exec(`, `compile(`, `__import__(`
- File I/O: `open` (entirely banned)
- Module attribute access: `os.`, `subprocess.`, `socket.`, `ctypes.`
- Introspection: `getattr(`, `setattr(`, `globals(`, `locals(`
- Deserialization: `pickle.`, `marshal.`, `shelve.`

```go
func validatePythonCode(code string) error {
    for _, d := range pythonDangerousPatterns {
        if d.re.MatchString(code) {
            return fmt.Errorf("security: %s", d.msg)
        }
    }
    return nil
}
```

#### 4.7.2 Layer 2 — AST Validation: `sandbox/pyrunner.go`

Before executing the Python script, run AST validation via a subprocess:
- Parse `ast.parse()` on the submitted code
- Walk the tree banning:
  - `ast.Import` / `ast.ImportFrom` for dangerous modules
  - `ast.Call` nodes matching dangerous function names
  - Attribute calls matching dangerous methods

Catches obfuscated imports like `__import__("os")` that bypass regex.

#### 4.7.3 Layer 3 — Docker Hardening

For local Docker execution of Python:
```go
cmd := exec.CommandContext(runCtx, "docker", "run",
    "--rm",
    "--user=65534:65534",
    "--cap-drop=ALL",
    "--security-opt=no-new-privileges",
    "--network=none",
    "--memory=512m",
    "--cpus=1.0",
    "--pids-limit=512",
    "--read-only",
    "--env", "PYTHONDONTWRITEBYTECODE=1",
    "-v", fmt.Sprintf("%s:/app:ro", sandboxPath),
    "-w", "/app",
    e.cfg.PythonDockerImage,
    "python3", "-u", "run_tests.py",
)
```

#### 4.7.4 Layer 4 — Resource Limits: `sandbox/secure_unix.go`

Add `RLIMIT_AS` (virtual memory limit) — critical for Python:
```go
// RLIMIT_AS on linux/arm64 = 9
{9, 512 << 20, 512 << 20}, // 512MB virtual memory cap
```
`RLIMIT_AS` was intentionally omitted for Go because the Go runtime reserves large virtual address spaces. Python does not have this requirement, making `RLIMIT_AS` safe and essential.

---

### 4.8 Phase 7 — Frontend Types & State

**Objective:** Update TypeScript types, API functions, and React context for language awareness.

#### 4.8.1 Types: `frontend/lib/types.ts`

```ts
// Add to User
primaryLanguage?: string;

// Add to Problem
language_versions?: Record<string, {
  func_name: string;
  return_type: string;
  param_types: string[];
}>;
```

#### 4.8.2 API Layer: `frontend/lib/api.ts`

```ts
export async function updatePrimaryLanguage(language: string): Promise<ApiResponse<User>> {
  return fetchApi<User>("/me/language", {
    method: "PUT",
    body: JSON.stringify({ language }),
  });
}
```

Update `fetchProblems` with optional language filter:
```ts
export async function fetchProblems(language?: string): Promise<ApiResponse<Problem[]>> {
  const params = language ? `?language=${language}` : "";
  return fetchApi<Problem[]>(`/problems${params}`);
}
```

Update `submitSolution` and `testCode` to accept `language` parameter, defaulting to `"go"`.

#### 4.8.3 UserContext: `frontend/lib/UserContext.tsx`

Add `setPrimaryLanguage` to context type:
```ts
type UserContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => void;
  setPrimaryLanguage: (lang: string) => Promise<void>;
};
```

Implementation in provider:
```ts
const setPrimaryLanguage = useCallback(async (lang: string) => {
  try {
    localStorage.setItem("koder_language", lang);
    await updatePrimaryLanguage(lang);
    window.dispatchEvent(new Event("user-updated"));
  } catch {
    console.error("Failed to save language preference");
  }
}, []);
```

---

### 4.9 Phase 8 — LanguageSelector Component

**Objective:** Full-screen onboarding component for first-time language selection.

**File:** `frontend/components/LanguageSelector.tsx` (NEW)

**Design:**
- Full-screen modal overlay with gradient background (`#0A0C0F` → `#0F1115`)
- Two large selection cards in a responsive grid:
  - **Go card:** Blue/dark theme with Gopher emoji, key features (fast compilation, goroutines, static typing), "Start Learning Go" CTA
  - **Python card:** Green/teal theme with snake emoji, key features (readable syntax, vast ecosystem, dynamic typing), "Start Learning Python" CTA
- Framer Motion animations: staggered entrance, hover scale, tap feedback
- "Skip" link for users who want to decide later (defaults to `localStorage.setItem("koder_language", "go")`)
- LocalStorage write for immediate reactivity + API call via `setPrimaryLanguage`
- Navigation to `/home` on completion

**Usage in `onboarding/page.tsx`:**
- Integrate language selection step after username setup
- On completion, navigate to `/home`

---

### 4.10 Phase 9 — TopNav Language Switcher

**Objective:** Add a language switcher dropdown to the navigation bar.

**File:** `frontend/components/layout/TopNav.tsx`

**Design:**
- Dropdown menu between notification bell and user avatar
- Current language displayed as badge/icon
- Options: Go (blue dot) | Python (green dot)
- On selection:
  1. Update localStorage immediately
  2. Call `updatePrimaryLanguage` API
  3. Dispatch `user-updated` event to refresh dependent components
  4. Re-fetch problems with new language filter
- Show active language with checkmark indicator

---

### 4.11 Phase 10 — Language-Aware Dashboard

**Objective:** Add language filter tabs to the home page problem grid.

**File:** `frontend/app/(main)/home/page.tsx`

**Design:**
- Tab bar at top of problem grid: **All** | **Go** | **Python**
- Active tab styled with underline + accent color
- On tab change:
  1. Set active filter state
  2. Re-fetch problems with `?language=` parameter
  3. Update URL search params for shareability
- "All" tab fetches without language filter, showing every problem
- Tab order: All → Go → Python (matching usage frequency)
- Persist active tab in URL search params (`?tab=go`)

---

### 4.12 Phase 11 — Language-Aware Workspace

**Objective:** Make the problem workspace dynamically adapt to the selected language.

**File:** `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx`

**Changes:**

| Element | Go | Python |
|---------|-----|--------|
| Monaco language | `"go"` | `"python"` |
| Code scaffold | `package piscine` | `def function_name():` |
| Language badge | `"Go"` (blue) | `"Python"` (green) |
| Snippet completions | Go-specific | Python-specific |
| Report bug snippet | ` ```go ` | ` ```python ` |

**Logic:**
- Read language from `problem.language_versions` keys
- Allow user to override with active workspace language
- Dynamic scaffold generation based on active language:
  ```ts
  const scaffold = activeLanguage === "python"
    ? `def ${funcName}(${params}):\n    pass`
    : `package piscine\n\nfunc ${funcName}(${params}) ${returnType} {\n\n}`;
  ```
- Update Monaco editor model language on switch
- Persist workspace language choice per-problem in localStorage

---

### 4.13 Phase 12 — Multi-Language Enrichment

**Objective:** Extend the AI enrichment pipeline to generate both Go and Python test cases.

**File:** `internal/enricher/enricher.go`

**Changes:**
- Extend system prompt to request both Go and Python function signatures and test cases
- Update `enrichedResponse`:
  ```go
  type enrichedResponse struct {
      Go     languageResponse `json:"go"`
      Python languageResponse `json:"python"`
  }

  type languageResponse struct {
      Title      string   `json:"title"`
      FuncName   string   `json:"func_name"`
      ReturnType string   `json:"return_type"`
      ParamTypes []string `json:"param_types"`
      Hints      []string `json:"hints"`
      Difficulty int      `json:"difficulty"`
      TestCases  []struct {
          Input    json.RawMessage `json:"input"`
          Expected string          `json:"expected"`
          IsHidden bool            `json:"is_hidden"`
      } `json:"test_cases"`
  }
  ```
- Round-robin enrichment: one language per AI call to stay within token limits
- Generate combined `language_versions JSONB` on enrichment result
- Fall back gracefully if one language's generation fails

---

## 5. File Change Summary

### Backend (10 files)

| File | Action | Phase |
|------|--------|-------|
| `migrations/027_language_versions.sql` | **NEW** | 0 |
| `internal/config/config.go` | Modify | 0 |
| `internal/store/types.go` | Modify | 0 |
| `internal/store/store.go` | Modify | 1 |
| `internal/store/users.go` | Modify | 1 |
| `internal/store/problems.go` | Modify | 2 |
| `internal/api/me.go` | Modify | 1 |
| `internal/api/router.go` | Modify | 1 |
| `internal/api/problems.go` | Modify | 2 |
| `internal/api/submissions.go` | Modify | 3 |
| `internal/api/test.go` | Modify | 3 |
| `internal/executor/executor.go` | Modify | 3, 4 |
| `internal/executor/templates.go` | Modify | 4 |
| `internal/executor/sandbox_client.go` | Modify | 5 |
| `internal/enricher/enricher.go` | Modify | 12 |
| `.env.example` | Modify | 0 |

### Sandbox (5 files)

| File | Action | Phase |
|------|--------|-------|
| `sandbox/main.go` | Modify | 5 |
| `sandbox/runtest_go.go` | **NEW** | 5 |
| `sandbox/pyrunner.go` | **NEW** | 5, 6 |
| `sandbox/secure.go` | Modify | 6 |
| `sandbox/secure_unix.go` | Modify | 6 |
| `sandbox/Dockerfile.python` | **NEW** | 5 |

### Frontend (7 files)

| File | Action | Phase |
|------|--------|-------|
| `frontend/lib/types.ts` | Modify | 7 |
| `frontend/lib/api.ts` | Modify | 7 |
| `frontend/lib/UserContext.tsx` | Modify | 7 |
| `frontend/components/LanguageSelector.tsx` | **NEW** | 8 |
| `frontend/components/layout/TopNav.tsx` | Modify | 9 |
| `frontend/app/(main)/home/page.tsx` | Modify | 10 |
| `frontend/app/problems/[slug]/ProblemWorkspaceClient.tsx` | Modify | 11 |
| `frontend/app/(auth)/onboarding/page.tsx` | Modify | 8 |

---

## 6. Backward Compatibility Checklist

- [ ] **All existing Go problems remain visible and functional** — `problems.language = 'go'` unchanged; `language_versions` backfilled from existing columns
- [ ] **All existing Go submissions remain accessible** — `submissions.language = 'go'` unchanged; no schema changes to submissions table
- [ ] **All existing user progress is preserved** — `progress` table untouched
- [ ] **All existing user accounts retain Go as default** — `primary_language DEFAULT 'go'` applies to all existing rows
- [ ] **Existing API clients continue to work** — new fields in responses are additive; default parameters unchanged
- [ ] **Existing frontend builds without errors** — new types are additive; existing components ignore unknown fields
- [ ] **CI pipeline passes at each phase** — each phase is independently testable
- [ ] **Rollback is possible at phase boundaries** — migration revert scripts provided for Phase 0

---

## 7. Risk Register & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Python AST validation misses obfuscated code | Low | High | 4-layer defense ensures no single layer is the sole protection |
| Python memory consumption exceeds limits | Medium | Medium | `RLIMIT_AS` (512MB) + `--memory=512m` Docker limit; tested with memory-intensive algorithms |
| `language_versions` query performance degrades | Low | Low | JSONB indexing available if needed; column is read in all problem queries alongside existing columns |
| Enricher hits Gemini 50-call limit with dual-language enrichment | Medium | Medium | Round-robin scheduling: one language per call; SHA256 change detection prevents redundant enrichment |
| Frontend language state gets out of sync | Low | Medium | localStorage as source of truth with API as fallback; `user-updated` event synchronizes components |
| Python sandbox unavailable during transition | Low | High | Backend falls back to Go execution; Python users see graceful error message with retry option |

---

## 8. Effort Estimates

| Phase | Description | Estimated Time |
|-------|-------------|---------------|
| 0 | Schema & Configuration | 0.5 day |
| 1 | User Language Preference | 0.5 day |
| 2 | Problem Language Versions | 0.5 day |
| 3 | Language in Submit/Test | 0.5 day |
| 4 | Python Test Template | 1.0 day |
| 5 | Multi-Language Sandbox | 2.0 days |
| 6 | Python Security | 1.0 day |
| 7 | Frontend Types & State | 0.5 day |
| 8 | LanguageSelector Component | 1.0 day |
| 9 | TopNav Language Switcher | 0.5 day |
| 10 | Language-Aware Dashboard | 0.5 day |
| 11 | Language-Aware Workspace | 1.0 day |
| 12 | Multi-Language Enrichment | 1.5 days |
| **Total** | | **10.5 days** |

---

*Document version: 1.0*
*Last updated: 2026-07-08*
