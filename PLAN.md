# AI Assistant Panel Redesign Plan

## Goal
Redesign the AI Assistant Panel to be a professional, split-layout tool with live preview, regenerate buttons, and structured response display.

---

## Current State
- **Panel width:** 380px (too narrow for split layout)
- **Layout:** Single-column chat interface
- **Preview:** Statement truncated to 2 lines, other fields show counts only
- **Regenerate:** Only retry on error (no action-specific regenerate)
- **Quick Actions:** 4 actions + difficulty adjust (missing `add_edge_cases`, `regenerate_test_cases`)
- **Dialog:** Expands from `max-w-4xl` to `max-w-6xl` when panel opens

---

## Design Decisions

### 1. Panel Width: 380px → 520px
- The dialog already expands to `max-w-6xl` (1152px) when AI panel is open
- 520px gives enough room for split layout (260px preview + 260px chat)
- Remaining form area stays ~632px (still usable)

### 2. Split Layout: Preview Left + Chat Right
```
┌────────────────────────────────────────────────────────┐
│ AI Assistant  [Rephrase] [Hints] [Tests] [Sigs]   [X] │
├──────────────────────┬─────────────────────────────────┤
│                      │                                 │
│  PREVIEW             │  CHAT                           │
│  (260px)             │  (260px)                        │
│                      │                                 │
│  Statement (4-7 ln)  │  Messages...                    │
│  Hints (collapsible) │                                 │
│  Test Cases (table)  │                                 │
│  Signature (code)    │                                 │
│  Difficulty (badge)  │                                 │
│                      │                                 │
│  [Apply] [Revert]    │  [Input] [Send]                 │
└──────────────────────┴─────────────────────────────────┘
```

### 3. Quick Actions → Regenerate Buttons
Each action gets a regenerate button in the preview header:
- `⟳ Rephrase` → re-runs `rephrase_statement`
- `⟳ Hints` → re-runs `improve_hints`
- `⟳ Test Cases` → re-runs `generate_test_cases`
- `⟳ Signatures` → re-runs `fix_signatures`

### 4. Preview Section Structure
```
PREVIEW (scrollable, left side)
├── Statement (4-7 lines, markdown rendered)
├── Hints (3 numbered, collapsible)
├── Test Cases (table: input, expected, hidden)
├── Signature (code block: func_name(params) → return)
├── Language Versions (Go/Python side-by-side)
├── Difficulty (badge + XP)
└── [Apply All] [Revert] buttons
```

### 5. Chat Section Structure
```
CHAT (scrollable, right side)
├── Messages (user/assistant bubbles)
├── Loading state (skeleton)
├── Error state (retry button)
└── Input bar (textarea + send button)
```

---

## Files to Modify

### 1. `frontend/components/admin/AIAssistantPanel.tsx` (Primary)
**Changes:**
- Increase panel width from 380px to 520px
- Add split layout: preview (left) + chat (right)
- Add preview section with structured display:
  - Statement: 4-7 lines with markdown rendering
  - Hints: Numbered list with expand/collapse
  - Test Cases: Table with input/expected/hidden columns
  - Signature: Code block with language formatting
  - Language Versions: Go/Python side-by-side
  - Difficulty: Badge with XP reward
- Add regenerate buttons for each action type
- Keep existing chat functionality
- Add Apply/Revert buttons in preview footer

### 2. `frontend/app/(main)/admin/ProblemEditPanel.tsx` (Minor)
**Changes:**
- Update dialog max-width from `max-w-6xl` to `max-w-7xl` (optional, if 520px feels cramped)
- No changes to `handleAIApply` (it already handles all fields)

### 3. `frontend/lib/types.ts` (No changes needed)
- `AIAssistResponse` already has all required fields
- `ChatMessage` already supports `response` field

---

## Implementation Details

### Step 1: Increase Panel Width
```tsx
// Line 252: Change width from 380 to 520
animate={{ width: 520, opacity: 1 }}
```

### Step 2: Add Split Layout Structure
```tsx
<div className="flex-1 flex overflow-hidden">
  {/* Left: Preview (260px) */}
  <div className="w-[260px] shrink-0 border-r border-brand-charcoal-border/50 overflow-y-auto">
    {/* Preview content */}
  </div>
  
  {/* Right: Chat (flex-1) */}
  <div className="flex-1 flex flex-col min-w-0">
    {/* Chat messages + input */}
  </div>
</div>
```

### Step 3: Preview Section Components

#### Statement Preview
```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <h4 className="text-xs font-medium text-brand-offwhite-muted uppercase tracking-wider">Statement</h4>
    <button onClick={() => handleRegenerate('rephrase_statement')} className="text-[10px] text-brand-muted-gold hover:text-brand-muted-gold/80">
      <RefreshCw size={10} /> Regenerate
    </button>
  </div>
  <div className="text-xs text-brand-offwhite leading-relaxed whitespace-pre-wrap line-clamp-7">
    {previewStatement || problem.statement}
  </div>
</div>
```

#### Hints Preview
```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <h4 className="text-xs font-medium text-brand-offwhite-muted uppercase tracking-wider">Hints</h4>
    <button onClick={() => handleRegenerate('improve_hints')} className="text-[10px] text-brand-muted-gold hover:text-brand-muted-gold/80">
      <RefreshCw size={10} /> Regenerate
    </button>
  </div>
  <div className="space-y-1">
    {(previewHints || problem.hints || []).map((hint, i) => (
      <div key={i} className="text-[11px] text-brand-offwhite-muted">
        <span className="text-brand-muted-gold font-medium">{i + 1}.</span> {hint}
      </div>
    ))}
  </div>
</div>
```

#### Test Cases Preview
```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <h4 className="text-xs font-medium text-brand-offwhite-muted uppercase tracking-wider">Test Cases</h4>
    <button onClick={() => handleRegenerate('generate_test_cases')} className="text-[10px] text-brand-muted-gold hover:text-brand-muted-gold/80">
      <RefreshCw size={10} /> Regenerate
    </button>
  </div>
  <div className="text-[11px] text-brand-offwhite-muted">
    {previewTestCases?.length || problem.test_cases?.length || 0} test cases
    <span className="text-brand-offwhite-muted/50 ml-2">
      ({previewTestCases || problem.test_cases || []).filter(tc => !tc.is_hidden).length} visible
    </span>
  </div>
</div>
```

#### Signature Preview
```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <h4 className="text-xs font-medium text-brand-offwhite-muted uppercase tracking-wider">Signature</h4>
    <button onClick={() => handleRegenerate('fix_signatures')} className="text-[10px] text-brand-muted-gold hover:text-brand-muted-gold/80">
      <RefreshCw size={10} /> Regenerate
    </button>
  </div>
  <div className="bg-brand-charcoal-base rounded-lg p-2 font-mono text-[11px] text-brand-offwhite">
    <span className="text-brand-muted-gold">func</span> {previewFuncName || problem.func_name}({previewParamTypes || problem.param_types?.join(', ')}) <span className="text-brand-muted-gold">→</span> {previewReturnType || problem.return_type}
  </div>
</div>
```

### Step 4: Add Regenerate Handler
```tsx
const handleRegenerate = useCallback((action: AIActionType) => {
  const labels: Record<string, string> = {
    rephrase_statement: 'Rephrase the statement',
    improve_hints: 'Improve the hints',
    generate_test_cases: 'Generate test cases',
    fix_signatures: 'Fix Go/Python function signatures',
  };
  sendMessage(labels[action] || action, action);
}, [sendMessage]);
```

### Step 5: Apply/Revert Buttons
```tsx
<div className="shrink-0 px-4 py-3 border-t border-brand-charcoal-border/50">
  <div className="flex gap-2">
    <button
      onClick={() => onApply(currentPreview)}
      disabled={!hasChanges}
      className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-brand-success/10 text-brand-success border border-brand-success/20 hover:bg-brand-success/20 transition-colors disabled:opacity-40"
    >
      Apply All Changes
    </button>
    <button
      onClick={handleRevert}
      disabled={!hasChanges}
      className="px-3 py-2 rounded-lg text-xs font-medium bg-brand-charcoal-base text-brand-offwhite-muted border border-brand-charcoal-border hover:bg-brand-charcoal-hover transition-colors disabled:opacity-40"
    >
      Revert
    </button>
  </div>
</div>
```

---

## Keyboard Shortcuts
- `Ctrl+Enter` → Apply all changes
- `Escape` → Close panel
- `Tab` → Cycle through focusable elements (existing)

---

## Testing Checklist
- [ ] Panel opens at 520px width
- [ ] Split layout renders correctly (preview left, chat right)
- [ ] Preview shows 4-7 lines of statement
- [ ] All 6 quick actions work (rephrase, hints, test cases, signatures, difficulty, chat)
- [ ] Regenerate buttons trigger re-run for each action
- [ ] Apply button updates ProblemEditPanel fields
- [ ] Revert button clears preview changes
- [ ] Chat messages display correctly
- [ ] Loading state shows skeleton
- [ ] Error state shows retry button
- [ ] Keyboard navigation works (Tab, Escape, Ctrl+Enter)
- [ ] Panel animates in/out smoothly
- [ ] Dialog width adjusts correctly (max-w-4xl → max-w-7xl)

---

## Edge Cases
1. **Empty preview:** Show placeholder text ("No changes yet")
2. **Partial changes:** Only show changed fields in preview
3. **Multiple actions:** Preview updates with each action (stacks changes)
4. **Revert:** Reset preview to original problem state
5. **Apply:** Push all preview fields to ProblemEditPanel, clear preview
