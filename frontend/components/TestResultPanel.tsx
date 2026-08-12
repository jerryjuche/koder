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
import { useEffect, useRef, useState } from "react";
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
};

const MIN_HEIGHT = 160;
const DEFAULT_HEIGHT = 288;
const HEIGHT_STORAGE_KEY = "koder_tests_height";

function clampHeight(px: number): number {
  const max = Math.min(
    600,
    Math.round((typeof window !== "undefined" ? window.innerHeight : 600) * 0.65),
  );
  return Math.min(max, Math.max(MIN_HEIGHT, px));
}

function formatRuntime(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function CircularProgress({
  passed,
  total,
  size = 40,
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
          "absolute text-[10px] font-bold",
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
}: Props) {
  const [showRawLogs, setShowRawLogs] = useState(
    execution?.status === "compiler_error",
  );
  const [showWhitespace, setShowWhitespace] = useState(true);
  const [collapsedCase, setCollapsedCase] = useState<Set<string>>(new Set());
  const [height, setHeight] = useState<number>(() => {
    if (typeof window === "undefined") return DEFAULT_HEIGHT;
    try {
      const stored = Number(sessionStorage.getItem(HEIGHT_STORAGE_KEY));
      if (Number.isFinite(stored)) return clampHeight(stored);
    } catch {
      // sessionStorage unavailable (private mode) — fall back to default
    }
    return DEFAULT_HEIGHT;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(HEIGHT_STORAGE_KEY, String(clampHeight(height)));
    } catch {
      // ignore — height simply won't persist
    }
  }, [height]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setHeight(clampHeight(rect.bottom - e.clientY));
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  const toggleCase = (key: string) => {
    setCollapsedCase((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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
      ref={containerRef}
      className={cn(
        "border-t border-brand-charcoal-border bg-brand-charcoal-base flex flex-col shrink-0 overflow-hidden",
        expanded ? "" : "h-12",
      )}
      style={expanded ? { height } : undefined}
    >
      {/* Resize handle */}
      {expanded && (
        <div
          onMouseDown={handleDragStart}
          role="separator"
          aria-orientation="horizontal"
          title="Drag to resize results panel"
          className="group h-[6px] shrink-0 flex items-center justify-center cursor-row-resize border-b border-brand-charcoal-border/70"
        >
          <div className="h-[2px] w-10 rounded-full bg-brand-charcoal-border transition-colors group-hover:bg-brand-muted-gold/70 group-active:bg-brand-muted-gold" />
        </div>
      )}

      {/* Header */}
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls="test-results-body"
        title={expanded ? "Collapse results" : "Expand results"}
        className="h-12 flex w-full items-center justify-between px-4 cursor-pointer hover:bg-brand-charcoal-hover/50 select-none shrink-0 group text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-sm font-bold text-brand-offwhite">
            Test Results
          </span>
          {hasResults && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
                allPassed
                  ? "bg-brand-success/15 text-brand-success"
                  : "bg-brand-error/15 text-brand-error",
              )}
            >
              {allPassed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {allPassed ? `All ${testsTotal} passed` : `${testsPassed}/${testsTotal}`}
            </span>
          )}
          {isCompilerError && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-brand-error/15 text-brand-error whitespace-nowrap">
              <Terminal size={12} /> Compile Error
            </span>
          )}
          {isTimeout && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-brand-error/15 text-brand-error whitespace-nowrap">
              <Clock size={12} /> Timeout
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
            size={15}
            className={cn(
              "text-brand-offwhite-muted transition-transform duration-200 group-hover:text-brand-offwhite",
              expanded && "rotate-180",
            )}
          />
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div
          id="test-results-body"
          className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 custom-scrollbar"
        >
          {/* System Error */}
          {errorMsg && !execution && (
            <div className="bg-brand-error/15 border border-brand-error/30 p-3 rounded-xl flex items-start gap-3 shadow-sm shadow-brand-error/5 animate-in fade-in">
              <AlertCircle
                size={16}
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
            <div className="space-y-2 animate-in fade-in">
              <div className="bg-brand-error/10 border border-brand-error/25 p-3 rounded-xl flex items-start gap-3">
                <Terminal
                  size={18}
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
                  <div className="bg-[#1A1A1A] rounded-lg border border-brand-error/15 p-3 font-mono text-xs text-brand-error leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-36 overflow-y-auto">
                    {serverMainMessage ||
                      execution?.friendly_message ||
                      "Unknown compilation error"}
                  </div>
                </div>
              </div>

              <div className="bg-brand-muted-gold/10 border border-brand-muted-gold/20 p-3 rounded-xl flex items-start gap-3">
                <Lightbulb
                  size={16}
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
                    size={13}
                    className={cn(
                      "transition-transform",
                      showRawLogs && "rotate-90",
                    )}
                  />
                  Full Compiler Output
                </button>
                {showRawLogs && (
                  <div className="mt-2 bg-[#1A1A1A] rounded-xl p-3 text-xs font-mono text-brand-offwhite-muted border border-brand-charcoal-border overflow-x-auto whitespace-pre-wrap max-h-36 overflow-y-auto animate-in fade-in">
                    {execution?.output_logs}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeout */}
          {isTimeout && (
            <div className="space-y-2 animate-in fade-in">
              <div className="bg-brand-error/10 border border-brand-error/25 p-3 rounded-xl flex items-start gap-3">
                <Clock size={18} className="text-brand-error mt-0.5 shrink-0" />
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

              <div className="bg-brand-muted-gold/10 border border-brand-muted-gold/20 p-3 rounded-xl flex items-start gap-3">
                <Lightbulb
                  size={16}
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
                "flex items-center gap-3 p-3 rounded-xl border",
                allPassed
                  ? "bg-brand-success/5 border-brand-success/20"
                  : "bg-brand-error/5 border-brand-error/20",
              )}
            >
              <CircularProgress passed={testsPassed} total={testsTotal} />
              <div className="flex-1 min-w-0">
                {allPassed ? (
                  <div className="flex items-center gap-2 text-brand-success font-bold">
                    <CheckCircle2 size={16} />
                    <span>All {testsTotal} tests passed successfully!</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 text-brand-error font-bold">
                      <XCircle size={16} />
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
                <div className="text-[11px] font-mono text-brand-offwhite-muted mt-1">
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
          {results?.map((res, i) => {
            const caseKey = res.id || `t${i}`;
            const isCaseCollapsed = collapsedCase.has(caseKey);
            return (
              <div
                key={caseKey}
                className={cn(
                  "rounded-xl border transition-colors duration-200 overflow-hidden",
                  res.passed
                    ? "bg-brand-success/5 border-brand-success/15 hover:border-brand-success/30"
                    : "bg-brand-error/5 border-brand-error/25 hover:border-brand-error/40",
                )}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between gap-2 p-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {res.passed ? (
                      <CheckCircle2
                        size={16}
                        className="text-brand-success shrink-0"
                      />
                    ) : (
                      <XCircle size={16} className="text-brand-error shrink-0" />
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
                    {!res.passed && (
                      <button
                        onClick={() => toggleCase(caseKey)}
                        className="p-1 text-brand-offwhite-muted hover:text-brand-offwhite rounded-lg transition-colors"
                        title={
                          isCaseCollapsed ? "Expand diff" : "Collapse diff"
                        }
                        aria-expanded={!isCaseCollapsed}
                      >
                        <ChevronRight
                          size={13}
                          className={cn(
                            "transition-transform duration-200",
                            !isCaseCollapsed && "rotate-90",
                          )}
                        />
                      </button>
                    )}
                    {res.input !== undefined && res.input !== "" && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(res.input!);
                          toast.success("Input copied");
                        }}
                        className="flex items-center gap-1.5 text-[11px] font-mono text-brand-offwhite-muted bg-brand-charcoal-hover border border-brand-charcoal-border hover:text-brand-offwhite px-2 py-1 rounded-lg transition-colors max-w-[14rem] truncate"
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
                  <div className="px-2.5 pb-2.5 space-y-2">
                    <div className="h-px bg-brand-error/15" />
                    {!isCaseCollapsed && (
                      <ValueDiff
                        got={res.output ?? ""}
                        want={res.expectedOutput ?? ""}
                        showWhitespace={showWhitespace}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty State */}
          {!hasResults && !isCompilerError && !isTimeout && !errorMsg && (
            <div className="flex flex-col items-center justify-center py-10 text-brand-offwhite-muted">
              <Terminal size={22} className="mb-2 opacity-40" />
              <p className="text-sm">
                No results yet — run the tests or submit to see them here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}