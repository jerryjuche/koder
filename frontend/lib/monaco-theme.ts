import generatedTheme from "@/lib/dark-plus-theme.generated.json";

// Neutral charcoal surfaces (Sessions 95–97) — applied as overrides on top of the
// generated Dark+ widget palette so the editor chrome matches the app chrome.
// Token colors are NOT overridden here: Go/Python use TextMate tokenization
// (lib/monaco-textmate.ts) driven by the raw theme + registry color map.
const CHARCOAL_SURFACES: Record<string, string> = {
  "editor.background": "#191919",
  "editor.foreground": "#D1D1D8",
  "editorLineNumber.foreground": "#565656",
  "editorLineNumber.activeForeground": "#D4AF37",
  "editorCursor.foreground": "#D4AF37",
  "editor.selectionBackground": "#3D3D3D",
  "editor.inactiveSelectionBackground": "#2E2E2E",
  "editor.lineHighlightBackground": "#1E1E1E",
  "editorIndentGuide.background1": "#2A2A2A",
  "editorIndentGuide.activeBackground1": "#3A3A3A",
  "editorBracketHighlight.foreground1": "#D4AF37",
  "editorBracketHighlight.foreground2": "#7B8CBB",
  "editorBracketHighlight.foreground3": "#22C55E",
  "editorBracketPairGuide.activeBackground1": "#D4AF37",
  "editorWidget.background": "#1E1E1E",
  "editorWidget.border": "#333333",
  "editorSuggestWidget.background": "#191919",
  "editorSuggestWidget.border": "#333333",
  "editorSuggestWidget.foreground": "#D1D1D8",
  "editorSuggestWidget.selectedBackground": "#3D3D3D",
  "editorSuggestWidget.highlightForeground": "#D4AF37",
  "editorHoverWidget.background": "#191919",
  "editorHoverWidget.border": "#333333",
  "editorGutter.background": "#191919",
  "editorOverviewRuler.border": "#00000000",
  "scrollbarSlider.background": "#33333355",
  "scrollbarSlider.hoverBackground": "#44444488",
  "scrollbarSlider.activeBackground": "#D4AF3755",
  "input.background": "#1E1E1E",
  "input.border": "#333333",
  "input.foreground": "#D1D1D8",
};

let registered = false;

export function registerVSCodeDarkPlusTheme(monaco: any) {
  if (registered) return;
  registered = true;

  monaco.editor.defineTheme("vs-dark-plus", {
    base: "vs-dark",
    inherit: true,
    rules: generatedTheme.rules,
    colors: {
      ...(generatedTheme.colors as Record<string, string>),
      ...CHARCOAL_SURFACES,
    },
  });
}
