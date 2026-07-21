# Pyodide Client-Side Python Playground — Implementation

## Architecture

```
lib/pyodide.ts          ── Pyodide CDN singleton loader + execute()
hooks/usePyodide.ts     ── React hook wrapping Pyodide state
components/PyodideConsole.tsx    ── Terminal-style output UI
components/ResizableSplitPane.tsx ── Drag-resizable horizontal split
components/learn/SectionExercise.tsx    ── Modified: split view with console
app/problems/[slug]/ProblemWorkspaceClient.tsx ── Modified: console toggle + toolbar
```

**CDN:** `cdn.jsdelivr.net/pyodide/v0.27.4/full/`
**Pre-load:** `numpy`, `matplotlib`
**Console:** Toggleable panel in workspace (Hints ↔ Console). Side-by-side split in lesson viewer.

---

## Phase 1: Dependencies + Core Library

**Files:** `package.json`, `lib/pyodide.ts`

### package.json — add pyodide

```bash
npm install pyodide@0.27.4
```

### lib/pyodide.ts — CDN loader & executor

```typescript
// Singleton Pyodide loader from CDN
// executePython() captures stdout/stderr, returns ExecutionResult
// loadPyodidePackages() allows opt-in package loading
```

---

## Phase 2: React Hook

**File:** `hooks/usePyodide.ts`

Wraps `lib/pyodide.ts` as a React hook:
- `ready`, `loading`, `error` states
- `execute(code)` → pushes ConsoleLine[] to local state
- `clearConsole()`, `consoleLines`
- Singleton pattern — shares one Pyodide instance across consumers

---

## Phase 3: PyodideConsole Component

**File:** `components/PyodideConsole.tsx`

Terminal-style console with:
- Dark background (`#0D0D14`), Fira Code monospace 13px
- Colored output types: output (green), error (red), info (blue), input (gold), system (muted)
- Auto-scroll to bottom, scroll lock on user scroll-up
- Clear button, copy all button
- Loading overlay with cursor animation
- Truncation at 500 lines

---

## Phase 4: ResizableSplitPane Component

**File:** `components/ResizableSplitPane.tsx`

CSS grid-based drag-resize:
- Horizontal split with 6px drag handle with grip dots
- Mouse + touch support
- Min 30% left, 20% right
- `cursor-col-resize` on handle

---

## Phase 5: SectionExercise Integration

**File:** `components/learn/SectionExercise.tsx`

When `language === "python"`:
- 60/40 split with ResizableSplitPane: Editor left, Console right
- Header: "Run in Browser ▶" button (Play icon, gold accent)
- Ctrl+Enter → Pyodide run
- Backend Test button still available
- Test results at bottom

When `language === "go"`: current layout unchanged.

---

## Phase 6: ProblemWorkspaceClient Integration

**File:** `app/problems/[slug]/ProblemWorkspaceClient.tsx`

When `activeLanguage === "python"`:
- Right panel gets tab bar: **Hints** | **Console**
- Console tab shows PyodideConsole
- Toolbar: "Run in Browser ▶" button next to Test
- Ctrl+Enter → Pyodide run (remapped from backend Test)
- Ctrl+Shift+Enter → backend Submit (unchanged)
- Test button → backend `/test` (unchanged)

When `activeLanguage === "go"`: no console option, right panel stays Hints only.

---

## Phase 7: Verify

- `npm run lint && npx tsc --noEmit` — 0 errors
- `npm run build` — compiles
- Manual review: all 7 files checked for correctness

---

## Progress

| Phase | File | Status |
|-------|------|--------|
| 1 | `package.json`, `lib/pyodide.ts` | ✅ Complete |
| 2 | `hooks/usePyodide.ts` | ✅ Complete |
| 3 | `components/PyodideConsole.tsx` | ✅ Complete |
| 4 | `components/ResizableSplitPane.tsx` | ✅ Complete |
| 5 | `components/learn/SectionExercise.tsx` | ✅ Complete |
| 6 | `app/problems/[slug]/ProblemWorkspaceClient.tsx` | ✅ Complete |
| 7 | Verify (lint, tsc, build) | ✅ Complete |
