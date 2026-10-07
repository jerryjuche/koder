"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Terminal,
  Play,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import { TestResult, ExecutionResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import ValueDiff from "@/components/test-results/ValueDiff";
import { deriveOutputState } from "@/lib/mobile-workspace";
import { toast } from "@/lib/toast";

interface MobileOutputTabProps {
  results: TestResult[] | null;
  execution: ExecutionResult | null;
  errorMsg: string | null;
  submitting: boolean;
  onRunTest: () => void;
  cooldown: number;
}


/** Parse runner logs into readable lines (UI only — does not change execution data). */
function formatLogLines(raw: string): { kind: "fail" | "got" | "want" | "run" | "meta" | "plain"; text: string }[] {
  if (!raw?.trim()) return [];
  return raw.split(/\r?\n/).filter(Boolean).map((line) => {
    const t = line.trimEnd();
    const u = t.toUpperCase();
    if (u.startsWith("GOT:")) return { kind: "got" as const, text: t };
    if (u.startsWith("WANT:") || u.startsWith("EXPECTED:")) return { kind: "want" as const, text: t };
    if (u.includes("FAIL") || u.startsWith("--- FAIL") || u.startsWith("=== FAIL"))
      return { kind: "fail" as const, text: t };
    if (u.startsWith("=== RUN") || u.startsWith("--- PASS") || u.includes("PASS:"))
      return { kind: "run" as const, text: t };
    if (u.startsWith("===") || u.startsWith("---")) return { kind: "meta" as const, text: t };
    return { kind: "plain" as const, text: t };
  });
}

export default function MobileOutputTab({
  results,
  execution,
  errorMsg,
  submitting,
  onRunTest,
  cooldown,
}: MobileOutputTabProps) {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [copiedLogs, setCopiedLogs] = useState(false);

  // If submitting / running
  if (submitting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-brand-charcoal-base pb-6">
        <div className="size-12 rounded-2xl bg-brand-muted-gold/10 border border-brand-muted-gold/30 flex items-center justify-center mb-4">
          <div className="size-6 border-2 border-brand-muted-gold border-t-transparent rounded-full animate-spin" />
        </div>
        <h3 className="text-base font-bold text-brand-offwhite mb-1">
          Running your code…
        </h3>
        <p className="text-xs text-brand-offwhite-muted max-w-xs leading-relaxed">
          Executing in the secure sandbox. This usually takes 1–3 seconds.
        </p>
      </div>
    );
  }

  // Shared derivation — keep in sync with MobileBottomTabs via deriveOutputState
  const {
    hasResults,
    testsPassed,
    testsTotal,
    allPassed,
    hasError: isCompilerError,
  } = deriveOutputState(results, execution, errorMsg);

  // If no results and no error
  if (!hasResults && !isCompilerError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-brand-charcoal-base pb-6">
        <div className="size-14 rounded-2xl bg-brand-charcoal-card border border-brand-charcoal-border flex items-center justify-center mb-4 text-brand-offwhite-muted">
          <Terminal size={28} />
        </div>
        <h3 className="text-base font-bold text-brand-offwhite mb-1">
          No results yet
        </h3>
        <p className="text-xs text-brand-offwhite-muted max-w-xs leading-relaxed mb-5">
          Tap Test code to run your solution. Results, diffs, and helpful
          messages will show up here.
        </p>
        <button
          type="button"
          onClick={onRunTest}
          disabled={cooldown > 0}
          className="inline-flex h-11 items-center gap-2 px-5 rounded-xl bg-brand-charcoal-card hover:bg-brand-charcoal-hover border border-brand-charcoal-border text-sm font-semibold text-brand-offwhite transition-colors disabled:opacity-50"
        >
          <Play size={15} fill="currentColor" className="text-brand-muted-gold" />
          {cooldown > 0 ? `Wait ${cooldown}s` : "Run tests"}
        </button>
      </div>
    );
  }

  const currentCase = results?.[selectedCaseIdx] || results?.[0];

  const copyLogs = () => {
    const text = execution?.output_logs || errorMsg || "";
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLogs(true);
      toast.success("Logs copied");
      setTimeout(() => setCopiedLogs(false), 2000);
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-brand-charcoal-base">
      {/* Pinned case selector. Previously these pills lived inside the scroll
          container, so selecting a later case pushed the selector off-screen
          and you had to scroll back up to change case again. */}
      {hasResults && results && (
        <div className="shrink-0 h-12 pl-4 pr-3 flex items-center gap-3 border-b border-brand-charcoal-border select-none">
          <div className="flex-1 flex items-center gap-2 overflow-x-auto custom-scrollbar">
            {results.map((tc, idx) => (
              <button
                key={tc.id || idx}
                type="button"
                onClick={() => setSelectedCaseIdx(idx)}
                aria-pressed={selectedCaseIdx === idx}
                className={cn(
                  "flex h-9 items-center gap-1.5 px-3 rounded-lg border text-xs font-semibold shrink-0 transition-colors touch-manipulation",
                  selectedCaseIdx === idx
                    ? "bg-brand-charcoal-raised border-brand-muted-gold text-brand-offwhite ring-1 ring-brand-muted-gold/30"
                    : "bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-card",
                )}
              >
                {tc.passed ? (
                  <CheckCircle2 size={14} className="text-brand-success" />
                ) : (
                  <XCircle size={14} className="text-brand-error" />
                )}
                <span>Case {tc.ordinal || idx + 1}</span>
                {tc.isHidden && (
                  <EyeOff size={12} className="text-brand-offwhite-muted" />
                )}
              </button>
            ))}
          </div>

          <span className="shrink-0 text-micro font-bold text-brand-offwhite-muted tabular-nums">
            {testsPassed}/{testsTotal}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar pb-6">
        {/* Status banner */}
        <div
          className={cn(
            "rounded-xl border p-4",
            allPassed
              ? "bg-brand-success/10 border-brand-success/30"
              : isCompilerError
                ? "bg-brand-error/10 border-brand-error/30"
                : "bg-amber-500/10 border-amber-500/30",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {allPassed ? (
                <div className="size-8 rounded-lg bg-brand-success/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} className="text-brand-success" />
                </div>
              ) : isCompilerError ? (
                <div className="size-8 rounded-lg bg-brand-error/20 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-brand-error" />
                </div>
              ) : (
                <div className="size-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                  <XCircle size={18} className="text-amber-400" />
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-brand-offwhite">
                  {allPassed
                    ? "All test cases passed"
                    : isCompilerError
                      ? execution?.status === "timeout"
                        ? "Execution timed out"
                        : "Compiler / runtime error"
                      : `${testsPassed} of ${testsTotal} cases passed`}
                </h3>
                <p className="text-xs text-brand-offwhite-muted mt-0.5 leading-relaxed">
                  {allPassed
                    ? "Your solution meets every test requirement."
                    : isCompilerError
                      ? execution?.friendly_message ||
                        errorMsg ||
                        "Check the run details below, fix the issue, then test again."
                      : "Compare your output with the expected value for each failed case below."}
                </p>
              </div>
            </div>

            {execution?.runtime_ms !== undefined && (
              <span className="flex items-center gap-1 text-micro font-mono text-brand-offwhite-muted bg-brand-charcoal-card px-2 py-1 rounded-md border border-brand-charcoal-border shrink-0 tabular-nums">
                <Clock size={11} /> {execution.runtime_ms}ms
              </span>
            )}
          </div>
        </div>

        {/* Compiler / error output details */}
        {(isCompilerError || execution?.output_logs) && (
          <div className="rounded-xl border border-border/60 bg-brand-charcoal-card overflow-hidden">
            <div className="px-3 h-10 border-b border-border/50 flex items-center justify-between bg-brand-charcoal-panel/60">
              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Terminal size={12} /> Run details
              </span>
              <button
                type="button"
                onClick={copyLogs}
                className="flex h-8 items-center gap-1 px-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedLogs ? (
                  <Check size={12} className="text-emerald-400" />
                ) : (
                  <Copy size={12} />
                )}
                <span>{copiedLogs ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="p-2.5 space-y-0.5 overflow-x-auto max-h-56 font-mono text-[11px] leading-relaxed">
              {formatLogLines(
                execution?.output_logs || execution?.friendly_message || errorMsg || ""
              ).map((row, i) => (
                <div
                  key={i}
                  className={cn(
                    "px-2 py-0.5 rounded break-words whitespace-pre-wrap",
                    row.kind === "fail" && "text-red-400 bg-red-500/5",
                    row.kind === "got" && "text-amber-300",
                    row.kind === "want" && "text-emerald-400",
                    row.kind === "run" && "text-sky-400/90",
                    row.kind === "meta" && "text-muted-foreground/70",
                    row.kind === "plain" && "text-foreground/85",
                  )}
                >
                  {row.kind === "got" && (
                    <span className="text-[10px] font-sans font-semibold text-amber-400/80 mr-1.5">
                      Your result
                    </span>
                  )}
                  {row.kind === "want" && (
                    <span className="text-[10px] font-sans font-semibold text-emerald-400/80 mr-1.5">
                      Expected
                    </span>
                  )}
                  {row.text}
                </div>
              ))}
              {formatLogLines(
                execution?.output_logs || execution?.friendly_message || errorMsg || ""
              ).length === 0 && (
                <p className="text-xs text-muted-foreground px-2 py-1">No log output.</p>
              )}
            </div>
          </div>
        )}

        {/* Selected case detail */}
        {currentCase && (
          <div className="rounded-xl border border-brand-charcoal-border bg-brand-charcoal-code overflow-hidden space-y-3 p-3.5">
            <div className="flex items-center justify-between border-b border-brand-charcoal-border pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-offwhite">
                  Case {currentCase.ordinal || selectedCaseIdx + 1}
                </span>
                <span
                  className={cn(
                    "text-micro font-bold px-2 py-0.5 rounded-full border",
                    currentCase.passed
                      ? "bg-brand-success/10 text-brand-success border-brand-success/30"
                      : "bg-brand-error/10 text-brand-error border-brand-error/30",
                  )}
                >
                  {currentCase.passed ? "Passed" : "Failed"}
                </span>
              </div>

              {currentCase.isHidden && (
                <span className="text-micro text-brand-offwhite-muted flex items-center gap-1 bg-brand-charcoal-card px-2 py-0.5 rounded border border-brand-charcoal-border">
                  <EyeOff size={11} /> Hidden
                </span>
              )}
            </div>

            {currentCase.input && (
              <div>
                <div className="text-micro font-bold uppercase tracking-wider text-brand-offwhite-muted mb-1">
                  Input
                </div>
                <div className="font-mono text-xs text-brand-offwhite bg-brand-charcoal-inset p-2.5 rounded-lg border border-brand-charcoal-border break-words whitespace-pre-wrap">
                  {currentCase.input}
                </div>
              </div>
            )}

            {currentCase.expectedOutput !== undefined &&
            currentCase.output !== undefined ? (
              <div className="space-y-3">
                {currentCase.passed ? (
                  <div>
                    <div className="text-micro font-bold uppercase tracking-wider text-brand-success/80 mb-1">
                      Output
                    </div>
                    <div className="font-mono text-xs text-brand-success bg-brand-charcoal-inset p-2.5 rounded-lg border border-brand-success/20 break-words whitespace-pre-wrap">
                      {currentCase.output}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-micro font-bold uppercase tracking-wider text-brand-offwhite-muted">
                      Diff comparison
                    </div>
                    <ValueDiff
                      got={currentCase.output || ""}
                      want={currentCase.expectedOutput || ""}
                      showWhitespace
                    />
                  </div>
                )}
              </div>
            ) : currentCase.isHidden ? (
              <div className="p-3 text-center text-xs text-brand-offwhite-muted italic bg-brand-charcoal-card/40 rounded-lg">
                Input and output details are hidden for this test case.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
