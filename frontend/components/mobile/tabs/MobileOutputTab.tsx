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

export default function MobileOutputTab({
  results,
  execution,
  errorMsg,
  submitting,
  onRunTest,
  cooldown,
}: MobileOutputTabProps) {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [showRawLogs, setShowRawLogs] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);

  // If submitting / running
  if (submitting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-brand-charcoal-base pb-6">
        <div className="w-12 h-12 rounded-2xl bg-brand-muted-gold/10 border border-brand-muted-gold/30 flex items-center justify-center mb-4">
          <div className="w-6 h-6 border-2 border-brand-muted-gold border-t-transparent rounded-full animate-spin" />
        </div>
        <h3 className="text-base font-bold text-brand-offwhite mb-1">
          Executing Code...
        </h3>
        <p className="text-xs text-brand-offwhite-muted max-w-xs leading-relaxed">
          Running your code in the secure sandbox environment. This usually takes
          1-3 seconds.
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
        <div className="w-14 h-14 rounded-2xl bg-brand-charcoal-card border border-brand-charcoal-border flex items-center justify-center mb-4 text-brand-offwhite-muted">
          <Terminal size={28} />
        </div>
        <h3 className="text-base font-bold text-brand-offwhite mb-1">
          No Results Yet
        </h3>
        <p className="text-xs text-brand-offwhite-muted max-w-xs leading-relaxed mb-5">
          Run your code against test cases to see compiler diagnostics, inputs,
          expected outputs, and runtime diffs.
        </p>
        <button
          onClick={onRunTest}
          disabled={cooldown > 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-charcoal-card hover:bg-brand-charcoal-hover border border-brand-charcoal-border text-sm font-semibold text-brand-offwhite transition-colors"
        >
          <Play size={15} fill="currentColor" className="text-brand-muted-gold" />
          {cooldown > 0 ? `Wait ${cooldown}s` : "Run Tests Now"}
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
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar pb-6 bg-brand-charcoal-base">
      {/* Top Status Banner */}
      <div
        className={cn(
          "rounded-xl border p-4 shadow-sm",
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
              <div className="w-8 h-8 rounded-lg bg-brand-success/20 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} className="text-brand-success" />
              </div>
            ) : isCompilerError ? (
              <div className="w-8 h-8 rounded-lg bg-brand-error/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-brand-error" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <XCircle size={18} className="text-amber-400" />
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-brand-offwhite">
                {allPassed
                  ? "All Test Cases Passed!"
                  : isCompilerError
                    ? execution?.status === "timeout"
                      ? "Execution Timed Out"
                      : "Compiler / Runtime Error"
                    : `${testsPassed} of ${testsTotal} Cases Passed`}
              </h3>
              <p className="text-xs text-brand-offwhite-muted mt-0.5">
                {allPassed
                  ? "Your solution meets all test requirements."
                  : isCompilerError
                    ? execution?.friendly_message || errorMsg || "Please fix syntax or runtime errors."
                    : "Some test cases did not match expected output."}
              </p>
            </div>
          </div>

          {execution?.runtime_ms !== undefined && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-brand-offwhite-muted bg-brand-charcoal-card/80 px-2 py-1 rounded-md border border-brand-charcoal-border shrink-0">
              <Clock size={11} /> {execution.runtime_ms}ms
            </span>
          )}
        </div>
      </div>

      {/* Compiler / Error Output Details */}
      {(isCompilerError || execution?.output_logs) && (
        <div className="rounded-xl border border-brand-charcoal-border bg-[#0A0C0F] overflow-hidden">
          <div className="px-3.5 py-2 bg-brand-charcoal-card/80 border-b border-brand-charcoal-border flex items-center justify-between">
            <span className="text-xs font-bold text-brand-offwhite-muted flex items-center gap-1.5 uppercase tracking-wider">
              <Terminal size={13} /> Output Logs
            </span>
            <button
              onClick={copyLogs}
              className="flex items-center gap-1 text-[11px] text-brand-offwhite-muted hover:text-brand-offwhite transition-colors"
            >
              {copiedLogs ? (
                <Check size={12} className="text-brand-success" />
              ) : (
                <Copy size={12} />
              )}
              <span>{copiedLogs ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <div className="p-3 font-mono text-xs text-brand-error bg-[#050608] whitespace-pre-wrap break-all leading-relaxed overflow-x-auto max-h-60">
            {execution?.output_logs || execution?.friendly_message || errorMsg}
          </div>
        </div>
      )}

      {/* Test Case Carousel / Pills */}
      {hasResults && results && (
        <div className="space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-widest text-brand-offwhite-muted flex items-center justify-between">
            <span>Test Cases</span>
            <span className="text-[10px] text-brand-offwhite-muted/70">
              {testsPassed}/{testsTotal} Passed
            </span>
          </div>

          {/* Horizontal scrollable case selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {results.map((tc, idx) => (
              <button
                key={tc.id || idx}
                onClick={() => setSelectedCaseIdx(idx)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shrink-0 transition-all",
                  selectedCaseIdx === idx
                    ? "bg-brand-charcoal-card border-brand-muted-gold text-brand-offwhite shadow-sm ring-1 ring-brand-muted-gold/30"
                    : "bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-card",
                )}
              >
                {tc.passed ? (
                  <CheckCircle2 size={13} className="text-brand-success" />
                ) : (
                  <XCircle size={13} className="text-brand-error" />
                )}
                <span>Case {tc.ordinal || idx + 1}</span>
                {tc.isHidden && (
                  <EyeOff size={11} className="text-brand-offwhite-muted ml-0.5" />
                )}
              </button>
            ))}
          </div>

          {/* Current Case Detail View */}
          {currentCase && (
            <div className="rounded-xl border border-brand-charcoal-border bg-[#0C0E12] overflow-hidden space-y-3 p-3.5">
              <div className="flex items-center justify-between border-b border-brand-charcoal-border/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-offwhite">
                    Case {currentCase.ordinal || selectedCaseIdx + 1}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      currentCase.passed
                        ? "bg-brand-success/10 text-brand-success border-brand-success/30"
                        : "bg-brand-error/10 text-brand-error border-brand-error/30",
                    )}
                  >
                    {currentCase.passed ? "Passed" : "Failed"}
                  </span>
                </div>

                {currentCase.isHidden && (
                  <span className="text-[10px] text-brand-offwhite-muted flex items-center gap-1 bg-brand-charcoal-card px-2 py-0.5 rounded border border-brand-charcoal-border">
                    <EyeOff size={11} /> Hidden Case
                  </span>
                )}
              </div>

              {/* Case Input (if available) */}
              {currentCase.input && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-brand-offwhite-muted/70 mb-1">
                    Input
                  </div>
                  <div className="font-mono text-xs text-brand-offwhite bg-[#050608] p-2.5 rounded-lg border border-brand-charcoal-border/50 break-words whitespace-pre-wrap">
                    {currentCase.input}
                  </div>
                </div>
              )}

              {/* Output vs Expected diff */}
              {currentCase.expectedOutput !== undefined && currentCase.output !== undefined ? (
                <div className="space-y-3">
                  {currentCase.passed ? (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-brand-success/80 mb-1">
                        Output
                      </div>
                      <div className="font-mono text-xs text-brand-success bg-[#050608] p-2.5 rounded-lg border border-brand-success/20 break-words whitespace-pre-wrap">
                        {currentCase.output}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-brand-offwhite-muted/70">
                        Diff Comparison
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
                <div className="p-3 text-center text-xs text-brand-offwhite-muted/70 italic bg-brand-charcoal-card/40 rounded-lg">
                  Input and output details are hidden for this test case.
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
