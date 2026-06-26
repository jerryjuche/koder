"use client";

import {
  CheckCircle2,
  XCircle,
  Lock,
  AlertTriangle,
  Terminal,
  Copy,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  Clock,
  Bug,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useState } from "react";

type TestResult = {
  id: string;
  name: string;
  passed: boolean;
  executionTimeMs: number;
  output?: string;
  expectedOutput?: string;
};

type ExecutionInfo = {
  status: "passed" | "failed" | "compiler_error" | "timeout";
  friendly_message?: string;
  passed_count: number;
  total_count: number;
  runtime_ms: number;
  output_logs: string;
};

type Props = {
  results: TestResult[] | null;
  execution: ExecutionInfo | null;
  errorMsg: string | null;
  expanded: boolean;
  onToggle: () => void;
};

function computeWordDiff(got: string, want: string) {
  if (got === want) return null;
  const gotWords = got.split(/(\s+)/);
  const wantWords = want.split(/(\s+)/);
  const maxLen = Math.max(gotWords.length, wantWords.length);
  const diff: { got: string; want: string; changed: boolean }[] = [];
  for (let i = 0; i < maxLen; i++) {
    const gw = gotWords[i] ?? "";
    const ww = wantWords[i] ?? "";
    diff.push({ got: gw, want: ww, changed: gw !== ww });
  }
  return diff;
}

function formatRuntime(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function CircularProgress({ passed, total, size = 48 }: { passed: number; total: number; size?: number }) {
  const pct = total > 0 ? (passed / total) * 100 : 0;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={pct >= 100 ? "#22c55e" : "#ef4444"}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className={cn("absolute text-xs font-bold", pct >= 100 ? "text-brand-success" : "text-brand-error")}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

export default function TestResultPanel({ results, execution, errorMsg, expanded, onToggle }: Props) {
  const [showRawLogs, setShowRawLogs] = useState(false);

  const testsPassed = results?.filter((r) => r.passed).length ?? 0;
  const testsTotal = results?.length ?? 0;
  const allPassed = testsTotal > 0 && testsPassed === testsTotal;
  const hasResults = results && results.length > 0;
  const isCompilerError = execution?.status === "compiler_error";
  const isTimeout = execution?.status === "timeout";

  function renderGotWantDiff(got: string, want: string) {
    const diff = computeWordDiff(got, want);
    if (!diff) return null;

    const isMultiLine = got.includes("\n") || want.includes("\n") || got.length > 60 || want.length > 60;

    if (isMultiLine) {
      const gotLines = got.split("\n");
      const wantLines = want.split("\n");
      const maxLines = Math.max(gotLines.length, wantLines.length);

      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-error shrink-0" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-brand-error/80">Your Result</span>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg border border-brand-error/20 overflow-hidden">
              {gotLines.map((line, i) => {
                const wantLine = wantLines[i] ?? "";
                const changed = line !== wantLine;
                return (
                  <div
                    key={i}
                    className={cn(
                      "px-3 py-0.5 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all",
                      changed ? "bg-brand-error/10 text-brand-error" : "text-brand-offwhite/80",
                    )}
                  >
                    {line || "\u00A0"}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-success shrink-0" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-brand-success/80">Expected</span>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg border border-brand-success/20 overflow-hidden">
              {wantLines.map((line, i) => {
                const gotLine = gotLines[i] ?? "";
                const changed = line !== gotLine;
                return (
                  <div
                    key={i}
                    className={cn(
                      "px-3 py-0.5 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all",
                      changed ? "bg-brand-success/10 text-brand-success" : "text-brand-offwhite/80",
                    )}
                  >
                    {line || "\u00A0"}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    const detailRows = [];
    const maxWords = Math.max(diff.length, 1);
    const A = diff.map((d) => d.got);
    const B = diff.map((d) => d.want);

    for (let row = 0; row < maxWords; row++) {
      detailRows.push(
        <div key={row} className="flex items-start gap-2 py-0.5">
          <span className="flex-1 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">
            {A[row] !== undefined ? (
              <span className={diff[row]?.changed ? "text-brand-error" : "text-brand-offwhite/80"}>
                {A[row]}
              </span>
            ) : (
              <span className="text-brand-charcoal-border">&nbsp;</span>
            )}
          </span>
          <ArrowRight size={10} className="text-brand-offwhite-muted mt-1 shrink-0" />
          <span className="flex-1 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">
            {B[row] !== undefined ? (
              <span className={diff[row]?.changed ? "text-brand-success" : "text-brand-offwhite/80"}>
                {B[row]}
              </span>
            ) : (
              <span className="text-brand-charcoal-border">&nbsp;</span>
            )}
          </span>
        </div>,
      );
    }

    return (
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] uppercase tracking-wider font-bold text-brand-offwhite-muted">Comparison</span>
        </div>
        <div className="bg-[#1A1A1A] rounded-lg border border-brand-charcoal-border p-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-brand-charcoal-border/50">
            <span className="text-brand-error/70 text-[10px] font-bold uppercase tracking-wider">Got</span>
            <span className="text-brand-success/70 text-[10px] font-bold uppercase tracking-wider">Want</span>
          </div>
          {detailRows}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-t border-brand-charcoal-border bg-brand-charcoal-base transition-all duration-300 flex flex-col",
        expanded ? "h-72" : "h-12",
      )}
    >
      {/* Header */}
      <div
        className="h-12 flex items-center justify-between px-4 cursor-pointer hover:bg-brand-charcoal-hover/50 select-none shrink-0 group"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <ChevronRight
            size={16}
            className={cn(
              "text-brand-offwhite-muted transition-transform duration-200",
              expanded && "rotate-90",
            )}
          />
          <span className="text-sm font-bold text-brand-offwhite">Test Results</span>
          {hasResults && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full",
                allPassed
                  ? "bg-brand-success/15 text-brand-success"
                  : "bg-brand-error/15 text-brand-error",
              )}
            >
              {allPassed ? (
                <CheckCircle2 size={12} />
              ) : (
                <XCircle size={12} />
              )}
              {testsPassed}/{testsTotal}
            </span>
          )}
          {isCompilerError && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-brand-error/15 text-brand-error">
              <Terminal size={12} /> Compile Error
            </span>
          )}
          {isTimeout && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-brand-error/15 text-brand-error">
              <Clock size={12} /> Timeout
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {execution && (
            <span
              className={cn(
                "text-[11px] font-mono",
                execution.runtime_ms > 5000
                  ? "text-brand-error/70"
                  : execution.runtime_ms > 1000
                    ? "text-brand-muted-gold/70"
                    : "text-brand-offwhite-muted",
              )}
            >
              {formatRuntime(execution.runtime_ms)}
            </span>
          )}
          <ChevronDown
            size={14}
            className={cn(
              "text-brand-offwhite-muted transition-transform duration-200 group-hover:text-brand-offwhite",
              expanded && "rotate-180",
            )}
          />
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
          {/* System Error */}
          {errorMsg && !execution && (
            <div className="bg-brand-error/15 border border-brand-error/30 p-4 rounded-xl flex items-start gap-3 shadow-sm shadow-brand-error/5 animate-in fade-in">
              <AlertCircle size={18} className="text-brand-error mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-bold text-brand-error/70 mb-0.5">System Error</div>
                <div className="text-sm text-brand-offwhite">{errorMsg}</div>
              </div>
            </div>
          )}

          {/* Compiler Error */}
          {isCompilerError && (
            <div className="space-y-3 animate-in fade-in">
              <div className="bg-brand-error/10 border border-brand-error/25 p-4 rounded-xl flex items-start gap-3">
                <Terminal size={20} className="text-brand-error mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-brand-error font-bold text-sm">Compilation Failed</h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(execution?.output_logs ?? "");
                        toast.success("Compiler output copied");
                      }}
                      className="text-[11px] bg-brand-charcoal-hover text-brand-offwhite-muted hover:text-brand-offwhite px-2.5 py-1 rounded-lg border border-brand-charcoal-border hover:bg-brand-charcoal-panel transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Copy size={11} /> Copy
                    </button>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-lg border border-brand-error/15 p-3 font-mono text-xs text-brand-error leading-relaxed whitespace-pre-wrap overflow-x-auto">
                    {execution?.friendly_message || "Unknown compilation error"}
                  </div>
                </div>
              </div>

              <div className="bg-brand-muted-gold/10 border border-brand-muted-gold/20 p-4 rounded-xl flex items-start gap-3">
                <Lightbulb size={18} className="text-brand-muted-gold mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-brand-muted-gold font-bold text-xs mb-1 uppercase tracking-wider">Debugging Tip</h4>
                  <p className="text-brand-offwhite-muted text-sm leading-relaxed">
                    Check the line number in the error message above. Common issues include missing imports, mismatched braces, typos, or invalid type assignments. Ensure your function signature matches the expected parameters.
                  </p>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setShowRawLogs(!showRawLogs)}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-brand-offwhite-muted hover:text-brand-offwhite transition-colors"
                >
                  <ChevronRight size={14} className={cn("transition-transform", showRawLogs && "rotate-90")} />
                  Full Compiler Output
                </button>
                {showRawLogs && (
                  <div className="mt-2 bg-[#1A1A1A] rounded-xl p-3 text-xs font-mono text-brand-offwhite-muted border border-brand-charcoal-border overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto animate-in fade-in">
                    {execution?.output_logs}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeout */}
          {isTimeout && (
            <div className="space-y-3 animate-in fade-in">
              <div className="bg-brand-error/10 border border-brand-error/25 p-4 rounded-xl flex items-start gap-3">
                <Clock size={20} className="text-brand-error mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-brand-error font-bold text-sm mb-1">Execution Timed Out</h4>
                  <p className="text-brand-offwhite text-sm leading-relaxed">
                    {execution?.friendly_message || "Your code exceeded the time limit for this problem."}
                  </p>
                </div>
              </div>

              <div className="bg-brand-muted-gold/10 border border-brand-muted-gold/20 p-4 rounded-xl flex items-start gap-3">
                <Lightbulb size={18} className="text-brand-muted-gold mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-brand-muted-gold font-bold text-xs mb-1 uppercase tracking-wider">Debugging Tip</h4>
                  <p className="text-brand-offwhite-muted text-sm leading-relaxed">
                    Timeouts are usually caused by infinite loops or inefficient algorithms. Check your loop conditions and consider optimizing your approach (e.g., using a hash map instead of nested loops).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Summary */}
          {hasResults && (
            <div className={cn(
              "flex items-center gap-4 p-4 rounded-xl border",
              allPassed
                ? "bg-brand-success/5 border-brand-success/20"
                : "bg-brand-error/5 border-brand-error/20",
            )}>
              <CircularProgress passed={testsPassed} total={testsTotal} />
              <div className="flex-1 min-w-0">
                {allPassed ? (
                  <div className="flex items-center gap-2 text-brand-success font-bold">
                    <CheckCircle2 size={18} />
                    <span>All {testsTotal} tests passed successfully!</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 text-brand-error font-bold">
                      <XCircle size={18} />
                      <span>{testsPassed}/{testsTotal} tests passed</span>
                    </div>
                    <div className="text-xs text-brand-offwhite-muted mt-0.5">
                      {testsTotal - testsPassed} test{(testsTotal - testsPassed) !== 1 ? "s" : ""} failed — review the details below
                    </div>
                  </div>
                )}
                <div className="text-[11px] font-mono text-brand-offwhite-muted mt-1.5">
                  Total: {execution ? formatRuntime(execution.runtime_ms) : ""}
                </div>
              </div>
            </div>
          )}

          {/* Individual Test Results */}
          {results?.map((res, i) => (
            <div
              key={res.id || i}
              className={cn(
                "rounded-xl border transition-colors duration-200 overflow-hidden",
                res.passed
                  ? "bg-brand-success/5 border-brand-success/15 hover:border-brand-success/30"
                  : "bg-brand-error/5 border-brand-error/25 hover:border-brand-error/40",
              )}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  {res.passed ? (
                    <CheckCircle2 size={18} className="text-brand-success shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-brand-error shrink-0" />
                  )}
                  <span className={cn(
                    "font-mono text-sm font-semibold",
                    res.passed ? "text-brand-success" : "text-brand-error",
                  )}>
                    {res.name}
                  </span>
                  {res.passed && (
                    <span className="text-[10px] font-bold text-brand-success/70 px-1.5 py-0.5 rounded bg-brand-success/10 border border-brand-success/20">
                      PASSED
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-brand-offwhite-muted">
                    {formatRuntime(res.executionTimeMs)}
                  </span>
                </div>
              </div>

              {/* Failed Test Details — GOT vs WANT */}
              {!res.passed && (
                <div className="px-3.5 pb-3.5 space-y-3">
                  <div className="h-px bg-brand-error/15" />

                  {res.output === "(hidden test case)" ? (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-charcoal-card border border-brand-charcoal-border">
                      <Lock size={16} className="text-brand-muted-gold mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-brand-muted-gold mb-0.5">Hidden Test Case</div>
                        <p className="text-xs text-brand-offwhite-muted leading-relaxed">
                          This test case is intentionally hidden. Review your logic and ensure your solution handles all edge cases correctly.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {res.output !== undefined && res.output !== "" && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Bug size={12} className="text-brand-error/70" />
                            <span className="text-[10px] uppercase tracking-wider font-bold text-brand-error/70">Your Output</span>
                          </div>
                          <div className="bg-[#1A1A1A] rounded-lg border border-brand-error/15 p-3 font-mono text-xs text-brand-error leading-relaxed whitespace-pre-wrap break-all">
                            {res.output}
                          </div>
                        </div>
                      )}

                      {res.expectedOutput && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <CheckCircle2 size={12} className="text-brand-success/70" />
                            <span className="text-[10px] uppercase tracking-wider font-bold text-brand-success/70">Expected</span>
                          </div>
                          <div className="bg-[#1A1A1A] rounded-lg border border-brand-success/15 p-3 font-mono text-xs text-brand-success leading-relaxed whitespace-pre-wrap break-all">
                            {res.expectedOutput}
                          </div>
                        </div>
                      )}

                      {/* Diff View */}
                      {res.output && res.expectedOutput && res.output !== res.expectedOutput && (
                        <div className="pt-1">
                          {renderGotWantDiff(res.output, res.expectedOutput)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Passed test can show a subtle expandable detail if needed, but generally just the header is fine */}
            </div>
          ))}

          {/* Empty State */}
          {!hasResults && !isCompilerError && !isTimeout && !errorMsg && (
            <div className="flex flex-col items-center justify-center py-8 text-brand-offwhite-muted">
              <Terminal size={24} className="mb-2 opacity-40" />
              <p className="text-sm">Run your code to see test results here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ArrowRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
