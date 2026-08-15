"use client";

import { CheckCircle2, Copy, Check, Sparkles } from "lucide-react";
import { useState } from "react";

export function AnalysisHeader({
  cached,
  onCopy,
}: {
  cached: boolean;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Sparkles size={15} className="text-purple-300" />
        AI Analysis
        <span className="rounded-md bg-purple-900/50 border border-purple-700/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-200">
          NIM
        </span>
      </div>
      {cached && (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
          <CheckCircle2 size={11} />
          cached
        </span>
      )}
      <button
        onClick={copy}
        className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Copy analysis"
      >
        {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
