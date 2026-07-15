"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  Terminal,
  Trash2,
  Copy,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import type { ConsoleLine } from "@/hooks/usePyodide";

interface PyodideConsoleProps {
  lines: ConsoleLine[];
  onClear: () => void;
  isLoading?: boolean;
  className?: string;
}

const LINE_TYPE_STYLES: Record<ConsoleLine["type"], string> = {
  output: "text-brand-success",
  error: "text-brand-error",
  info: "text-blue-400",
  input: "text-amber-400/70",
  system: "text-brand-offwhite-muted italic",
};

const LINE_TYPE_PREFIX: Record<ConsoleLine["type"], string> = {
  output: "",
  error: "✗ ",
  info: "ℹ ",
  input: "❯ ",
  system: "",
};

export default function PyodideConsole({
  lines,
  onClear,
  isLoading = false,
  className,
}: PyodideConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, autoScroll]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setAutoScroll(atBottom);
  }, []);

  const handleCopyAll = useCallback(() => {
    const text = lines
      .map((l) => `${l.type === "input" ? "❯ " : ""}${l.text}`)
      .join("\n");
    navigator.clipboard.writeText(text).then(
      () => toast.success("Console output copied"),
      () => toast.error("Failed to copy"),
    );
  }, [lines]);

  return (
    <div
      className={cn(
        "flex flex-col bg-[#0D0D14] border-l border-brand-charcoal-border h-full",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-brand-charcoal-border bg-brand-charcoal-panel shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-brand-muted-gold" />
          <span className="text-xs font-bold text-brand-offwhite-muted tracking-wider uppercase">
            Python Console
          </span>
          {isLoading && (
            <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyAll}
            className="p-1 rounded text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover transition-colors"
            title="Copy all output"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClear}
            className="p-1 rounded text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover transition-colors"
            title="Clear console"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-brand-offwhite-muted animate-in fade-in">
          <div className="relative">
            <Loader2 className="h-6 w-6 animate-spin text-brand-muted-gold" />
            <span className="absolute top-0 left-0 h-6 w-6 rounded-full border-2 border-brand-muted-gold/30 animate-ping" />
          </div>
          <div className="text-xs font-mono text-center">
            <div className="text-brand-muted-gold font-bold mb-1">
              Initializing Python Environment
            </div>
            <div className="text-brand-offwhite-muted/60">
              Loading Pyodide WebAssembly (~20-30MB first load)
            </div>
            <div className="mt-2 text-[10px] text-brand-offwhite-muted/40">
              This only happens once — subsequent loads are instant
            </div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {!isLoading && lines.length <= 1 && lines[0]?.type === "error" && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 animate-in fade-in">
          <AlertCircle className="h-6 w-6 text-brand-error" />
          <div className="text-xs text-brand-offwhite-muted text-center px-4">
            {lines[0].text}
          </div>
        </div>
      )}

      {/* Terminal output */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto font-mono text-[13px] leading-relaxed p-3 custom-scrollbar"
      >
        {lines.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-brand-offwhite-muted/40 text-xs gap-2">
            <Terminal className="h-5 w-5" />
            <span>Run your code with Ctrl+Enter ⚡</span>
          </div>
        )}

        {lines.map((line) => (
          <div
            key={line.id}
            className={cn(
              "whitespace-pre-wrap break-words py-[1px]",
              LINE_TYPE_STYLES[line.type],
            )}
          >
            {LINE_TYPE_PREFIX[line.type]}
            {line.text || " "}
          </div>
        ))}

        {/* End marker for auto-scroll anchor */}
        <div className="h-px" />
      </div>

      {/* Scroll indicator */}
      {!autoScroll && lines.length > 10 && (
        <button
          onClick={() => {
            setAutoScroll(true);
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: "smooth",
            });
          }}
          className="absolute bottom-2 right-2 text-[10px] text-brand-muted-gold bg-brand-charcoal-card border border-brand-charcoal-border px-2 py-1 rounded shadow-lg hover:bg-brand-charcoal-hover transition-colors"
        >
          ↓ Scroll to bottom
        </button>
      )}
    </div>
  );
}
