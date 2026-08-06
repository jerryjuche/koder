"use client";

import {
  CheckCircle2,
  XCircle,
  Terminal,
  Copy,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  Clock,
  Bug,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useState } from "react";
import ValueDiff from "./test-results/ValueDiff";

type TestResult = {
  id: string;
  name: string;
  passed: boolean;
  executionTimeMs: number;
  output?: string;
  expectedOutput?: string;
  ordinal?: number;
  isHidden?: boolean;
  input?: string;
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
  mode?: "test" | "submit";
};

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
      className="relative inline-flex items-center justify-center shrink-0"
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

function Chip({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "success" | "error" | "gold" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border whitespace-nowrap",
        tone === "success" &&
          "bg-brand-success/10 text-brand-success border-brand-success/25",
        tone === "error" &&
          "bg-brand-error/10 text-brand-error border-brand-error/25",
        tone === "gold" &&
          "bg-brand-muted-gold/10 text-brand-muted-gold border-brand-muted-gold/25",
        tone === "muted" &&
          "bg-brand-charcoal-hover text-brand-offwhite-muted border-brand-charcoal-border",
      )}
    >
      {children}
    </span>
  );
}

export default function TestResultPanel({
  results,
  execution,
  errorMsg,
  expanded,
  onToggle,
  mode = "submit",
}: Props) {
  const [showRawLogs, setShowRawLogs] = useState(
    execution?.status === "compiler_error",
  );
  const [showWhitespace, setShowWhitespace] = useState(true);

  const testsPassed = results?.filter((r) => r.passed).length ?? 0;
  const testsTotal = results?.length ?? 0;
  const allPassed = testsTotal > 0 && testsPassed === testsTotal;
  const hasResults = results && results.length > 0;
  const isCompilerError = execution?.status === "compiler_error";
  const isTimeout = execution?.status === "timeout";

  const firstFailedIdx = results?.findIndex((r) => !r.passed);
  const firstFailedName =
    firstFailedIdx !== undefined && firstFailedIdx >= 0
      ? results?.[firstFailedIdx]?.name
      : undefined;

  // Extract server-provided tip if present in friendly_message (server appends " — Tip: ...")
  const serverMessage = execution?.friendly_message ?? "";
  const tipSeparator = " — Tip: ";
  const serverTip = serverMessage.includes(tipSeparator)
    ? serverMessage.split(tipSeparator)[1]
    : "";
  const serverMainMessage = serverMessage.includes(tipSeparator)
    ? serverMessage.split(tipSeparator)[0]
    : serverMessage;

  return (
    <div
      className={cn(
        "border-t border-brand-charcoal-border bg-brand-charcoal-base transition-all duration-300 flex flex-col",
        expanded ? "h-[26rem]" : "h-12",
      )}
    >
      {/* Header */}
      <div
        className="h-12 flex items-center justify-between px-4 cursor-pointer hover:bg-brand-charcoal-hover/50 select-none shrink-0 group"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 min-w-0">
          <ChevronRight
            size={16}
            className={cn(
              "text-brand-offwhite-muted transition-transform duration-200 shrink-0",
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
          {mode === "test" && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-muted-gold/10 text-brand-muted-gold border border-brand-muted-gold/20">
              Test run
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
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
          {/* Test-run disclosure */}
          {mode === "test" && hasResults && (
            <div className="bg-brand-muted-gold/10 border border-brand-muted-gold/20 p-3 rounded-xl flex items-start gap-2.5 animate-in fade-in">
              <Eye size={14} className="text-brand-muted-gold mt-0.5 shrink-0" />
              <p className="text-xs text-brand-offwhite-muted leading-relaxed">
                You ran the <span className="font-semibold text-brand-muted-gold">Test</span>{" "}
                action — only the visible example cases were executed. Hidden
                edge cases run when you <span className="font-semibold text-brand-muted-gold">Submit</span>.
              </p>
            </div>
          )}

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
                  <div className="flex items-center justify-between mb-1.5 gap-2">
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
                  <div className="bg-[#1A1A1A] rounded-lg border border-brand-error/15 p-3 font-mono text-xs text-brand-error leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-52 overflow-y-auto">
                    {serverMainMessage ||
                      execution?.friendly_message ||
                      "Unknown compilation error"}
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
                      {firstFailedName
                        ? `First failure at ${firstFailedName}. `
                        : ""}
                      {testsTotal - testsPassed} test
                      {testsTotal - testsPassed !== 1 ? "s" : ""} failed —
                      compare your output against the expected value below.
                    </div>
                  </div>
                )}
                <div className="text-[11px] font-mono text-brand-offwhite-muted mt-1.5">
                  Total: {execution ? formatRuntime(execution.runtime_ms) : ""}
                </div>
              </div>
            </div>
          )}

          {/* Whitespace toggle */}
          {hasResults && !allPassed && (
            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowWhitespace(!showWhitespace)}
                className="flex items-center gap-1.5 text-[11px] font-medium text-brand-offwhite-muted hover:text-brand-offwhite transition-colors"
                title={
                  showWhitespace
                    ? "Hide whitespace markers (spaces → ·)"
                    : "Show whitespace markers (spaces → ·)"
                }
              >
                {showWhitespace ? (
                  <EyeOff size={13} />
                ) : (
                  <Eye size={13} />
                )}
                {showWhitespace ? "Hide" : "Show"} whitespace
              </button>
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
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {res.passed ? (
                    <CheckCircle2
                      size={17}
                      className="text-brand-success shrink-0"
                    />
                  ) : (
                    <XCircle size={17} className="text-brand-error shrink-0" />
                  )}
                  <span
                    className={cn(
                      "font-mono text-sm font-semibold shrink-0",
                      res.passed ? "text-brand-success" : "text-brand-error",
                    )}
                  >
                    {res.name}
                  </span>
                  {res.passed ? (
                    <Chip tone="success">
                      <CheckCircle2 size={10} /> PASSED
                    </Chip>
                  ) : (
                    <Chip tone="error">
                      <XCircle size={10} /> FAILED
                    </Chip>
                  )}
                  {res.isHidden && <Chip tone="gold">Hidden</Chip>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {res.input !== undefined && res.input !== "" && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(res.input!);
                        toast.success("Input copied");
                      }}
                      className="flex items-center gap-1.5 text-[11px] font-mono text-brand-offwhite-muted bg-brand-charcoal-hover border border-brand-charcoal-border hover:text-brand-offwhite px-2 py-1 rounded-lg transition-colors max-w-[16rem] truncate"
                      title={`Input: ${res.input}`}
                    >
                      <Bug size={11} className="text-brand-muted-gold shrink-0" />
                      <span className="truncate">{res.input}</span>
                    </button>
                  )}
                  {!res.passed && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(res.output ?? "");
                        toast.success("Output copied");
                      }}
                      className="flex items-center gap-1.5 text-[11px] bg-brand-charcoal-hover text-brand-offwhite-muted hover:text-brand-offwhite px-2 py-1 rounded-lg border border-brand-charcoal-border transition-colors"
                      title="Copy your output"
                    >
                      <Copy size={11} /> Copy
                    </button>
                  )}
                </div>
              </div>

              {/* Failed Test Details — Your Output vs Expected */}
              {!res.passed && (
                <div className="px-3 pb-3 space-y-2.5">
                  <div className="h-px bg-brand-error/15" />
                  <ValueDiff
                    got={res.output ?? ""}
                    want={res.expectedOutput ?? ""}
                    showWhitespace={showWhitespace}
                  />
                </div>
              )}
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
