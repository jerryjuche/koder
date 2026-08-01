import type { editor } from "monaco-editor";

const MONO_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const MONACO_EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontSize: 16,
  fontWeight: "600",
  fontFamily: MONO_STACK,
  lineHeight: 24,
  padding: { top: 16, bottom: 16 },
  renderLineHighlight: "all",
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "explicit",
  smoothScrolling: true,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  scrollbar: {
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
    alwaysConsumeMouseWheel: false,
  },
  overviewRulerLanes: 3,
  overviewRulerBorder: false,
  hideCursorInOverviewRuler: false,
  bracketPairColorization: {
    enabled: true,
    independentColorPoolPerBracketType: true,
  },
  matchBrackets: "always",
  autoClosingBrackets: "always",
  autoClosingQuotes: "always",
  autoIndent: "full",
  formatOnPaste: false,
  formatOnType: true,
  tabSize: 4,
  insertSpaces: true,
  quickSuggestions: {
    other: true,
    comments: false,
    strings: false,
  },
  snippetSuggestions: "top",
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: "smart",
  suggestSelection: "first",
  suggest: {
    preview: true,
  },
  wordBasedSuggestions: "currentDocument",
  tabCompletion: "on",
  fixedOverflowWidgets: true,
  wordWrap: "off",
  folding: true,
  foldingHighlight: true,
  foldingStrategy: "indentation",
  guides: {
    bracketPairs: true,
    indentation: true,
  },
};
