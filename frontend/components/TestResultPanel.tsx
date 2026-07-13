"use client";

import {
  CheckCircle2,
  XCircle,
  Lock,
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

function computeLineDiff(
  got: string,
  want: string,
): { type: "equal" | "delete" | "insert"; line: string }[] {
  const gotLines = got.split("\n");
  const wantLines = want.split("\n");

  const m = gotLines.length;
  const n = wantLines.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (gotLines[i - 1] === wantLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result: { type: "equal" | "delete" | "insert"; line: string }[] = [];
  let i = m,
    j = n;
  const temp: typeof result = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && gotLines[i - 1] === wantLines[j - 1]) {
      temp.push({ type: "equal", line: gotLines[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      temp.push({ type: "insert", line: wantLines[j - 1] });
      j--;
    } else {
      temp.push({ type: "delete", line: gotLines[i - 1] });
      i--;
    }
  }

  for (let k = temp.length - 1; k >= 0; k--) {
    result.push(temp[k]);
  }

  return result;
}

function TerminalDiff({ got, want }: { got: string; want: string }) {
  if (got === want) {
    return (
      <div className="bg-brand-success/10 border border-brand-success/20 rounded-lg p-3 flex items-center gap-2">
        <CheckCircle2 size={14} className="text-brand-success shrink-0" />
        <span className="text-xs text-brand-success font-medium">
          Output matches expected value
        </span>
      </div>
    );
  }

  const isMultiLine =
    got.includes("\n") ||
    want.includes("\n") ||
    got.length > 60 ||
    want.length > 60;

  if (!isMultiLine) {
    return (
      <div className="bg-[#0D0D0D] rounded-lg border border-brand-charcoal-border overflow-hidden font-mono text-xs">
        <div className="flex items-center gap-3 px-3 py-1.5 bg-brand-charcoal-hover/30 border-b border-brand-charcoal-border/50">
          <span className="text-brand-error/80 font-bold text-[10px] uppercase tracking-wider">
            Got
          </span>
          <span className="text-brand-offwhite-muted/30">|</span>
          <span className="text-brand-success/80 font-bold text-[10px] uppercase tracking-wider">
            Expected
          </span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-0 p-0">
          <div className="px-3 py-2 bg-brand-error/5 text-brand-error whitespace-pre-wrap break-all leading-relaxed">
            {got || <span className="italic opacity-50">no output</span>}
          </div>
          <div className="px-2 py-2 flex items-center text-brand-offwhite-muted/30 bg-[#0D0D0D] select-none">
            →
          </div>
          <div className="px-3 py-2 bg-brand-success/5 text-brand-success whitespace-pre-wrap break-all leading-relaxed">
            {want || <span className="italic opacity-50">empty</span>}
          </div>
        </div>
      </div>
    );
  }

  const diff = computeLineDiff(got, want);
  let gotLine = 1,
    wantLine = 1;

  return (
    <div className="bg-[#0D0D0D] rounded-lg border border-brand-charcoal-border overflow-hidden font-mono text-xs">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-charcoal-hover/30 border-b border-brand-charcoal-border/50 text-[10px] text-brand-offwhite-muted/60">
        <span className="text-brand-error/70">━</span> Got vs Expected
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-0">
          {diff.map((d, i) => {
            let prefix = " ";
            let bg = "";
            let fg = "text-brand-offwhite/80";
            if (d.type === "delete") {
              prefix = "-";
              bg = "bg-brand-error/8";
              fg = "text-brand-error";
            } else if (d.type === "insert") {
              prefix = "+";
              bg = "bg-brand-success/8";
              fg = "text-brand-success";
            }

            const gotNum = d.type === "insert" ? "" : String(gotLine++);
            const wantNum = d.type === "delete" ? "" : String(wantLine++);

            return (
              <div key={i} className={`flex ${bg}`}>
                <span className="w-[3ch] shrink-0 text-right pr-1.5 text-brand-offwhite-muted/25 select-none text-[10px]">
                  {gotNum}
                </span>
                <span className="w-[3ch] shrink-0 text-right pr-1.5 text-brand-offwhite-muted/25 select-none text-[10px]">
                  {wantNum}
                </span>
                <span className="w-[1ch] shrink-0 select-none font-bold text-[11px] leading-relaxed pt-px">
                  {prefix}
                </span>
                <span
                  className={`flex-1 px-1 py-0 leading-relaxed whitespace-pre-wrap break-all text-[11px] ${fg}`}
                >
                  {d.line || " "}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatRuntime(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function CircularProgress({
  passed,
  total,
  size = 48,
}: {
  passed: number;
  total: number;
  size?: number;
}) {
  const pct = total > 0 ? (passed / total) * 100 : 0;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
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
      <span
        className={cn(
          "absolute text-xs font-bold",
          pct >= 100 ? "text-brand-success" : "text-brand-error",
        )}
      >
        {Math.round(pct)}%
      </span>
    </div>
  );
}

export default function TestResultPanel({
  results,
  execution,
  errorMsg,
  expanded,
  onToggle,
}: Props) {
  const [showRawLogs, setShowRawLogs] = useState(execution?.status === "compiler_error");

  const testsPassed = results?.filter((r) => r.passed).length ?? 0;
  const testsTotal = results?.length ?? 0;
  const allPassed = testsTotal > 0 && testsPassed === testsTotal;
  const hasResults = results && results.length > 0;
  const isCompilerError = execution?.status === "compiler_error";
  const isTimeout = execution?.status === "timeout";
  // Extract server-provided tip if present in friendly_message (server appends " — Tip: ...")
  const serverMessage = execution?.friendly_message ?? "";
  const tipSeparator = " — Tip: ";
  const serverTip = serverMessage.includes(tipSeparator)
    ? serverMessage.split(tipSeparator)[1]
    : "";
  const serverMainMessage = serverMessage.includes(tipSeparator)
    ? serverMessage.split(tipSeparator)[0]
    : serverMessage;

  function renderGotWantDiff(got: string, want: string) {
    if (!got && !want) return null;
    return <TerminalDiff got={got} want={want} />;
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
          <span className="text-sm font-bold text-brand-offwhite">
            Test Results
          </span>
          {hasResults && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full",
                allPassed
                  ? "bg-brand-success/15 text-brand-success"
                  : "bg-brand-error/15 text-brand-error",
              )}
            >
              {allPassed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
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
              <AlertCircle
                size={18}
                className="text-brand-error mt-0.5 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-bold text-brand-error/70 mb-0.5">
                  System Error
                </div>
                <div className="text-sm text-brand-offwhite">{errorMsg}</div>
              </div>
            </div>
          )}

          {/* Compiler Error */}
          {isCompilerError && (
            <div className="space-y-3 animate-in fade-in">
              <div className="bg-brand-error/10 border border-brand-error/25 p-4 rounded-xl flex items-start gap-3">
                <Terminal
                  size={20}
                  className="text-brand-error mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-brand-error font-bold text-sm">
                      Compilation Failed
                    </h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          execution?.output_logs ?? "",
                        );
                        toast.success("Compiler output copied");
                      }}
                      className="text-[11px] bg-brand-charcoal-hover text-brand-offwhite-muted hover:text-brand-offwhite px-2.5 py-1 rounded-lg border border-brand-charcoal-border hover:bg-brand-charcoal-panel transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Copy size={11} /> Copy
                    </button>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-lg border border-brand-error/15 p-3 font-mono text-xs text-brand-error leading-relaxed whitespace-pre-wrap overflow-x-auto">
                    {serverMainMessage || execution?.friendly_message || "Unknown compilation error"}
                  </div>
                </div>
              </div>

              <div className="bg-brand-muted-gold/10 border border-brand-muted-gold/20 p-4 rounded-xl flex items-start gap-3">
                <Lightbulb
                  size={18}
                  className="text-brand-muted-gold mt-0.5 shrink-0"
                />
                <div>
                  <h4 className="text-brand-muted-gold font-bold text-xs mb-1 uppercase tracking-wider">
                    Debugging Tip
                  </h4>
                  <p className="text-brand-offwhite-muted text-sm leading-relaxed">
                    {serverTip || (
                      <>
                        Check the line number in the error message above. Common
                        issues include missing imports, mismatched brackets,
                        typos, or invalid type assignments. Ensure your function
                        signature matches the expected parameters.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setShowRawLogs(!showRawLogs)}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-brand-offwhite-muted hover:text-brand-offwhite transition-colors"
                >
                  <ChevronRight
                    size={14}
                    className={cn(
                      "transition-transform",
                      showRawLogs && "rotate-90",
                    )}
                  />
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
                  <h4 className="text-brand-error font-bold text-sm mb-1">
                    Execution Timed Out
                  </h4>
                  <p className="text-brand-offwhite text-sm leading-relaxed">
                    {execution?.friendly_message ||
                      "Your code exceeded the time limit for this problem."}
                  </p>
                </div>
              </div>

              <div className="bg-brand-muted-gold/10 border border-brand-muted-gold/20 p-4 rounded-xl flex items-start gap-3">
                <Lightbulb
                  size={18}
                  className="text-brand-muted-gold mt-0.5 shrink-0"
                />
                <div>
                  <h4 className="text-brand-muted-gold font-bold text-xs mb-1 uppercase tracking-wider">
                    Debugging Tip
                  </h4>
                  <p className="text-brand-offwhite-muted text-sm leading-relaxed">
                    Timeouts are usually caused by infinite loops or inefficient
                    algorithms. Check your loop conditions and consider
                    optimizing your approach (e.g., using a hash map instead of
                    nested loops).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Summary */}
          {hasResults && (
            <div
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border",
                allPassed
                  ? "bg-brand-success/5 border-brand-success/20"
                  : "bg-brand-error/5 border-brand-error/20",
              )}
            >
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
                      <span>
                        {testsPassed}/{testsTotal} tests passed
                      </span>
                    </div>
                    <div className="text-xs text-brand-offwhite-muted mt-0.5">
                      {testsTotal - testsPassed} test
                      {testsTotal - testsPassed !== 1 ? "s" : ""} failed —
                      review the details below
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
                    <CheckCircle2
                      size={18}
                      className="text-brand-success shrink-0"
                    />
                  ) : (
                    <XCircle size={18} className="text-brand-error shrink-0" />
                  )}
                  <span
                    className={cn(
                      "font-mono text-sm font-semibold",
                      res.passed ? "text-brand-success" : "text-brand-error",
                    )}
                  >
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
                      <Lock
                        size={16}
                        className="text-brand-muted-gold mt-0.5 shrink-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-brand-muted-gold mb-0.5">
                          Hidden Test Case
                        </div>
                        <p className="text-xs text-brand-offwhite-muted leading-relaxed">
                          This test case is intentionally hidden. Review your
                          logic and ensure your solution handles all edge cases
                          correctly.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {res.output !== undefined && res.output !== "" && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Bug size={12} className="text-brand-error/70" />
                            <span className="text-[10px] uppercase tracking-wider font-bold text-brand-error/70">
                              Your Output
                            </span>
                          </div>
                          <div className="bg-[#1A1A1A] rounded-lg border border-brand-error/15 p-3 font-mono text-xs text-brand-error leading-relaxed whitespace-pre-wrap break-all">
                            {res.output}
                          </div>
                        </div>
                      )}

                      {res.expectedOutput && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <CheckCircle2
                              size={12}
                              className="text-brand-success/70"
                            />
                            <span className="text-[10px] uppercase tracking-wider font-bold text-brand-success/70">
                              Expected
                            </span>
                          </div>
                          <div className="bg-[#1A1A1A] rounded-lg border border-brand-success/15 p-3 font-mono text-xs text-brand-success leading-relaxed whitespace-pre-wrap break-all">
                            {res.expectedOutput}
                          </div>
                        </div>
                      )}

                      {/* Diff View */}
                      {res.output &&
                        res.expectedOutput &&
                        res.output !== res.expectedOutput && (
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
