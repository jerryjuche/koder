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

const COMMON_SYMBOLS = [
  { label: "Tab", insert: "    " },
  { label: ":", insert: ":" },
  { label: "(", insert: "(" },
  { label: ")", insert: ")" },
  { label: "{", insert: "{" },
  { label: "}", insert: "}" },
  { label: "[", insert: "[" },
  { label: "]", insert: "]" },
  { label: "=", insert: " = " },
  { label: '"', insert: '"' },
  { label: "'", insert: "'" },
  { label: ".", insert: "." },
  { label: ",", insert: ", " },
  { label: "+", insert: " + " },
  { label: "-", insert: " - " },
  { label: "*", insert: " * " },
  { label: "/", insert: " / " },
  { label: "_", insert: "_" },
  { label: "->", insert: " -> " },
  { label: "==", insert: " == " },
  { label: "!=", insert: " != " },
  { label: "<=", insert: " <= " },
  { label: ">=", insert: " >= " },
];

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
        replacement = pairMap[textToInsert] || `${textToInsert}${selectedText}${textToInsert}`;
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

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#121212] overflow-hidden">
      {/* Mini Header / Toolbar */}
      <div className="h-10 px-3 bg-brand-charcoal-card/90 border-b border-brand-charcoal-border flex items-center justify-between shrink-0">
        {/* Language Tabs */}
        <div className="flex items-center gap-2">
          {availableLanguages.length > 1 ? (
            <div className="flex rounded-md border border-brand-charcoal-border overflow-hidden bg-brand-charcoal-base">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 text-xs font-semibold transition-colors",
                    activeLanguage === lang
                      ? "bg-primary/20 text-primary"
                      : "text-brand-offwhite-muted hover:text-brand-offwhite",
                  )}
                >
                  <LanguageLogo language={lang as "go" | "python"} size={14} />
                  <span className="capitalize">{lang}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-offwhite-muted">
              <LanguageLogo
                language={(availableLanguages[0] || "go") as "go" | "python"}
                size={14}
              />
              <span className="capitalize">{availableLanguages[0] || "go"}</span>
            </div>
          )}

          <span className="text-[11px] font-mono text-brand-offwhite-muted/70 truncate hidden min-[420px]:inline">
            solution.{activeLanguage === "python" ? "py" : "go"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {!saved && (
            <span className="text-[10px] text-brand-muted-gold animate-pulse mr-1 font-medium">
              ● Unsaved
            </span>
          )}
          {saved && code !== scaffoldAtToggle && (
            <span className="text-[10px] text-brand-success mr-1 font-medium">
              ● Saved
            </span>
          )}

          {/* Format button */}
          <button
            onClick={handleFormat}
            className="h-7 px-2 rounded bg-brand-charcoal-base border border-brand-charcoal-border text-brand-offwhite-muted hover:text-brand-offwhite text-xs font-mono transition-colors flex items-center gap-1"
            title="Format Code"
          >
            {`{ }`}
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="w-7 h-7 rounded bg-brand-charcoal-base border border-brand-charcoal-border text-brand-offwhite-muted hover:text-brand-offwhite flex items-center justify-center transition-colors"
            title="Copy code"
          >
            {copied ? (
              <Check size={13} className="text-brand-success" />
            ) : (
              <Copy size={13} />
            )}
          </button>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="w-7 h-7 rounded bg-brand-charcoal-base border border-brand-charcoal-border text-brand-offwhite-muted hover:text-brand-offwhite flex items-center justify-center transition-colors"
            title="Reset to starter scaffold"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Symbol Bar for fast mobile coding */}
      <div className="h-9 px-2 bg-[#0E1013] border-b border-brand-charcoal-border/70 flex items-center gap-1 overflow-x-auto custom-scrollbar shrink-0 select-none">
        <span className="text-[9px] uppercase font-bold text-brand-offwhite-muted/50 tracking-wider pl-1 pr-1 shrink-0">
          Keys:
        </span>
        {COMMON_SYMBOLS.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => insertSymbol(s.insert)}
            className="h-7 min-w-8 px-1.5 rounded bg-brand-charcoal-card border border-brand-charcoal-border/80 text-brand-offwhite hover:bg-brand-charcoal-hover active:bg-brand-muted-gold/20 active:text-brand-muted-gold text-xs font-mono shrink-0 transition-colors flex items-center justify-center"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Editor Instance */}
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
                <div className="w-7 h-7 rounded-full border-2 border-brand-muted-gold border-t-transparent animate-spin" />
                <p className="text-xs text-brand-offwhite-muted">
                  Loading editor...
                </p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
