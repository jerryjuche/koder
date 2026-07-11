# Koder — Professional Codebase Analysis & Understanding

> A deep dive into the architectural philosophy, constraints, and engineering decisions behind the zero-cost automated code-grading platform.

---

## 1. Executive Summary & Architectural Philosophy

**Koder** is an automated code-grading platform engineered with an extreme philosophy: **zero-cost operation under severe resource constraints.**

The system is not just a LeetCode clone; it is a highly specialized, synchronous evaluation pipeline designed for a specific cohort size (20-30 students) on a strict $0/month budget. This fundamental constraint drives every technical decision in the codebase.

The architecture rejects modern microservice sprawl in favor of a **monolithic Go backend** (for minimal memory footprint) paired with a **Next.js App Router frontend** (statically hosted where possible). Data persistence relies entirely on a free-tier PostgreSQL instance (Supabase), eschewing caching layers like Redis entirely.

The engineering culture is evident in the `.github/copilot-instructions.md`: explicit over magical. The project relies on raw SQL over ORMs, `text/template` code generation over string concatenation, and native Go concurrency patterns (channels and semaphores) over external message queues.

## 2. The Impact of Constraints

The system's design is best understood through the lens of its constraints:

| Constraint | Architectural Decision & Impact |
|---|---|
| **$0/month Budget** | Forced the use of Oracle Ampere A1 (ARM64) for the backend, Supabase free tier for the DB, and Railway/Vercel for execution and frontend. All components must be lightweight. |
| **500MB DB Limit** | Prohibits large JSONB blobs. Problem statements and metadata must be normalized. No binary storage in the database. |
| **50 AI Calls/Day** | Gemini API is used for test case generation. To avoid hitting the limit, the system uses SHA256 hashing to detect unchanged problem definitions, skipping redundant API calls. A Groq fallback (Llama 3.3 70B) is implemented to bypass the strict Gemini limit entirely if needed. |
| **2 AI Calls/Minute** | The `enricher` component enforces a hard `time.Sleep(30 * time.Second)` between Gemini API requests. |
| **Limited Compute (ARM64)** | Concurrent student code executions are strictly throttled by a Go channel semaphore (`EXECUTOR_MAX_CONCURRENCY`, defaulting to 6) to prevent OOM errors and CPU starvation. |

## 3. Defense-in-Depth Security Model

Executing untrusted student code requires robust security. Koder implements a multi-layered approach, recognizing that no single boundary is infallible:

1.  **Static Analysis (Layer 1):** A regex blocklist (`secure.go`) scans incoming code for explicitly dangerous patterns (e.g., `os/exec`, `unsafe` in Go; `subprocess`, `eval` in Python).
2.  **AST Validation (Layer 2 - Python):** Because regex can be bypassed in dynamic languages, Python submissions undergo Abstract Syntax Tree (AST) parsing (`pyrunner.go`) to walk the tree and block malicious imports or attribute calls.
3.  **Kernel-Level Limits (Layer 3):** The sandbox uses Unix `setrlimit` (`secure_unix.go`) to cap file descriptors, process counts, and critically, virtual memory (`RLIMIT_AS` set to 512MB for Python).
4.  **Container Isolation (Layer 4):** Execution happens within isolated Docker containers (or a remote Railway sandbox) with no network access (`--network=none`), minimal memory (`--memory=64m`), and restricted capabilities.

## 4. The Three Core Pipelines

The backend's business logic is structured around three distinct pipelines:

### 4.1 Ingest (Admin)
Pulls a curriculum repository from GitHub, walks the directory tree looking for `README.md` files, hashes them, and upserts the raw markdown into the database as hidden draft problems. It's idempotent by design.

### 4.2 Enrich (Admin)
Takes raw problem markdown and feeds it to an AI provider (Gemini or Groq) using **Structured Outputs** (JSON schemas). The AI parses the human-readable instructions and generates a formal function signature, return types, parameter types, and a comprehensive suite of test cases (inputs and expected stringified outputs).

*Crucial Design Choice:* The use of structured outputs guarantees the shape of the AI response, avoiding the brittle nature of regex-parsing markdown blocks from standard LLM completions.

### 4.3 Execute (Student)
A synchronous, blocking pipeline. When a student submits code:
1.  A semaphore slot is acquired.
2.  A temporary directory is created.
3.  A deterministic `main_test.go` (or `run_tests.py`) is generated via Go `text/template`, injecting the AI-generated test cases.
4.  The code runs in the isolated sandbox.
5.  Standard output is parsed line-by-line (looking for `--- PASS:` or `--- FAIL:` markers).
6.  Results are recorded, XP is awarded, and the semaphore is released.

## 5. Multi-Language Expansion (Python Integration)

The `python-curricula` branch demonstrates a sophisticated, backward-compatible rollout of Python support across 12 distinct phases.

**The Scalability Challenge:** Adding per-language columns (e.g., `py_func_name`, `go_func_name`) to the database would lead to schema explosion.

**The Elegant Solution:**
*   A single `language_versions` JSONB column was added to the `problems` table, mapping language keys (`"go"`, `"python"`) to `LanguageSpec` structs.
*   The system uses the existing `ExecutionRequest.Language` string to route execution logic.
*   **Parser Agnosticism:** The most brilliant decision in the Python expansion was writing a custom Python test runner that emits output exactly matching the Go testing output format (`=== RUN`, `--- PASS`). This meant the backend output parsing logic (`parser.go`) required **zero modifications** to support a completely new language.

## 6. Technical Debt & Observability

Recent sessions focus heavily on "Production Polish":
*   **Logging:** Transitioned from text logs to machine-parseable JSON logs (`slog`), injecting request correlation IDs via middleware.
*   **Performance:** Implemented TTL caching for the leaderboard and user profiles to reduce database load during traffic spikes.
*   **Resilience:** Added comprehensive React Error Boundaries (`error.tsx`) across the Next.js frontend to ensure a single component crash doesn't bring down the entire SPA.

## 7. Conclusion

Koder is a masterclass in pragmatic, constraint-driven engineering. By strictly adhering to its $0 budget limitation, the architecture remains lean and understandable. It avoids the premature optimization and distributed systems complexity that often plague modern web applications, proving that a well-designed monolith with carefully managed concurrency and a robust data model can deliver a highly complex service (AI enrichment + remote code execution) effectively and securely.
