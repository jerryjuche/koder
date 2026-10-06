"use client";

import React, { useCallback } from "react";
import { Copy, RotateCcw, Check } from "lucide-react";
import { LanguageLogo } from "@/components/LanguageLogo";
import { CodeEditor } from "@/components/CodeEditor";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

interface MobileCodeTabProps {
  code: string;
  onCodeChange: (value: string) => void;
  onEditorMount: (editor: any, monaco: any) => void;
  getInitialValue: () => string;
  activeLanguage: string;
  availableLanguages: string[];
  onLanguageChange: (lang: string) => void;
  resetKey: number;
  saved: boolean;
  scaffoldAtToggle: string;
  handleFormat: () => void;
  handleReset: () => void;
  editorRef: React.MutableRefObject<any>;
}

/**
 * Key groups, in the order a symbol row should be scanned: whitespace first,
 * then brackets, then operators. 23 undifferentiated chips was unscannable.
 */
const KEY_GROUPS: { id: string; items: { label: string; insert: string }[] }[] = [
  {
    id: "structure",
    items: [{ label: "Tab", insert: "    " }],
  },
  {
    id: "brackets",
    items: [
      { label: "(", insert: "(" },
      { label: ")", insert: ")" },
      { label: "{", insert: "{" },
      { label: "}", insert: "}" },
      { label: "[", insert: "[" },
      { label: "]", insert: "]" },
      { label: '"', insert: '"' },
      { label: "'", insert: "'" },
    ],
  },
  {
    id: "operators",
    items: [
      { label: "=", insert: " = " },
      { label: "==", insert: " == " },
      { label: "!=", insert: " != " },
      { label: "<=", insert: " <= " },
      { label: ">=", insert: " >= " },
      { label: "->", insert: " -> " },
      { label: "+", insert: " + " },
      { label: "-", insert: " - " },
      { label: "*", insert: " * " },
      { label: "/", insert: " / " },
      { label: ".", insert: "." },
      { label: ",", insert: ", " },
      { label: "_", insert: "_" },
    ],
  },
];

/* ---------------------------------------------------------------------------
   Touch targets.

   Toolbar / segmented controls render at a true 44px, so they need no trickery.

   The key chips render at 32px for density and carry a transparent `after`
   pseudo-element that expands the hit area to 44x44. That expansion is only
   safe because the gap matches it: 6px of reach per side needs a >= 12px gap
   (`gap-3`). A smaller gap would overlap neighbouring hit areas, which turns a
   miss into the wrong action rather than no action.

   `touch-manipulation` drops the 300ms tap delay.
--------------------------------------------------------------------------- */
const KEY_CHIP_HIT =
  "relative after:absolute after:content-[''] after:-inset-1.5 touch-manipulation";

export default function MobileCodeTab({
  code,
  onCodeChange,
  onEditorMount,
  getInitialValue,
  activeLanguage,
  availableLanguages,
  onLanguageChange,
  resetKey,
  saved,
  scaffoldAtToggle,
  handleFormat,
  handleReset,
  editorRef,
}: MobileCodeTabProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true);
        toast.success("Code copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error("Failed to copy code"));
  };

  const insertSymbol = useCallback(
    (textToInsert: string) => {
      const ed = editorRef.current;
      if (!ed) return;
      const selection = ed.getSelection();
      const model = ed.getModel();
      if (!selection || !model) return;

      const selectedText = model.getValueInRange(selection);
      const isEnclosingPair =
        selectedText.length > 0 &&
        (textToInsert === "(" ||
          textToInsert === "{" ||
          textToInsert === "[" ||
          textToInsert === '"' ||
          textToInsert === "'");

      let replacement = textToInsert;
      if (isEnclosingPair) {
        const pairMap: Record<string, string> = {
          "(": `(${selectedText})`,
          "{": `{${selectedText}}`,
          "[": `[${selectedText}]`,
          '"': `"${selectedText}"`,
          "'": `'${selectedText}'`,
        };
        replacement =
          pairMap[textToInsert] || `${textToInsert}${selectedText}${textToInsert}`;
      }

      ed.executeEdits("symbol-insert", [
        {
          range: selection,
          text: replacement,
          forceMoveMarkers: true,
        },
      ]);
      ed.focus();
    },
    [editorRef],
  );

  const tokenName = `solution.${activeLanguage === "python" ? "py" : "go"}`;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-brand-charcoal-code overflow-hidden">
      {/* Toolbar — 48px so every control inside can be a true 44px target */}
      <div className="h-12 px-3 bg-brand-charcoal-chrome border-b border-brand-charcoal-border flex items-center justify-between gap-2 shrink-0">
        {/* Language switcher */}
        <div className="flex items-center gap-2 min-w-0">
          {availableLanguages.length > 1 ? (
            <div className="flex h-11 rounded-lg border border-brand-charcoal-border overflow-hidden bg-brand-charcoal-base shrink-0">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onLanguageChange(lang)}
                  aria-pressed={activeLanguage === lang}
                  className={cn(
                    "flex h-full items-center gap-1.5 px-3.5 text-xs font-semibold transition-colors touch-manipulation",
                    activeLanguage === lang
                      ? "bg-brand-muted-gold/20 text-brand-muted-gold"
                      : "text-brand-offwhite-muted hover:text-brand-offwhite",
                  )}
                >
                  <LanguageLogo language={lang as "go" | "python"} size={14} />
                  <span className="capitalize">{lang}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex h-11 items-center gap-1.5 px-1 text-xs font-semibold text-brand-offwhite-muted shrink-0">
              <LanguageLogo
                language={(availableLanguages[0] || "go") as "go" | "python"}
                size={14}
              />
              <span className="capitalize">{availableLanguages[0] || "go"}</span>
            </div>
          )}

          <span className="text-micro font-mono text-brand-offwhite-muted truncate hidden min-[480px]:inline">
            {tokenName}
          </span>
        </div>

        {/* Save state + actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!saved && (
            <span className="text-micro text-brand-muted-gold font-medium hidden min-[420px]:inline">
              ● Unsaved
            </span>
          )}
          {saved && code !== scaffoldAtToggle && (
            <span className="text-micro text-brand-success font-medium hidden min-[420px]:inline">
              ● Saved
            </span>
          )}

          <button
            type="button"
            onClick={handleFormat}
            aria-label="Format code"
            className="flex size-11 items-center justify-center rounded-lg bg-brand-charcoal-card border border-brand-charcoal-border text-brand-offwhite-muted hover:text-brand-offwhite transition-colors font-mono text-xs touch-manipulation"
          >
            {"{ }"}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy code"
            className="flex size-11 items-center justify-center rounded-lg bg-brand-charcoal-card border border-brand-charcoal-border text-brand-offwhite-muted hover:text-brand-offwhite transition-colors touch-manipulation"
          >
            {copied ? (
              <Check size={16} className="text-brand-success" />
            ) : (
              <Copy size={16} />
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset to starter scaffold"
            className="flex size-11 items-center justify-center rounded-lg bg-brand-charcoal-card border border-brand-charcoal-border text-brand-offwhite-muted hover:text-brand-offwhite transition-colors touch-manipulation"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Symbol row — 40px, chips 32px visual / 44px hit */}
      <div className="h-10 px-2 bg-brand-charcoal-code border-b border-brand-charcoal-border flex items-center gap-3 overflow-x-auto custom-scrollbar shrink-0 select-none">
        <span className="text-micro font-bold uppercase tracking-wider text-brand-offwhite-muted shrink-0 pl-1">
          Keys
        </span>

        {KEY_GROUPS.map((group, gi) => (
          <React.Fragment key={group.id}>
            {gi > 0 && (
              <span
                className="w-px h-5 bg-brand-charcoal-border shrink-0"
                aria-hidden="true"
              />
            )}
            <div className="flex items-center gap-3 shrink-0">
              {group.items.map((s) => (
                <button
                  key={`${group.id}-${s.label}`}
                  type="button"
                  onClick={() => insertSymbol(s.insert)}
                  className={cn(
                    "h-8 min-w-9 px-2 rounded-lg bg-brand-charcoal-card border border-brand-charcoal-border/80 text-brand-offwhite hover:bg-brand-charcoal-hover active:bg-brand-muted-gold/20 active:text-brand-muted-gold text-xs font-mono shrink-0 transition-colors flex items-center justify-center",
                    KEY_CHIP_HIT,
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <CodeEditor
          key={`mobile-${activeLanguage}-${resetKey}`}
          getInitialValue={getInitialValue}
          onChange={onCodeChange}
          onMount={onEditorMount}
          language={activeLanguage}
          options={{
            fontSize: 14,
            lineHeight: 22,
            wordWrap: "on",
            minimap: { enabled: false },
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: false,
            overviewRulerLanes: 0,
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 16 },
          }}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <div className="size-7 rounded-full border-2 border-brand-muted-gold border-t-transparent animate-spin" />
                <p className="text-xs text-brand-offwhite-muted">
                  Loading editor…
                </p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
