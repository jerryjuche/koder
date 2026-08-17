"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import type { CommunitySolution, SolutionExplanation } from "@/lib/types";
import {
  explainSolutionChatStream,
  explainSolutionStream,
} from "@/lib/api";
import { toast } from "@/lib/toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CodeSnippet } from "@/components/application/code-snippet";
import { ExplainPanel } from "./ExplainPanel";
import { FollowUpDrawer } from "./FollowUpDrawer";
import { solutionFilename, solutionLanguage } from "./parts";
import type { ExplainErrorInfo } from "./AnalysisError";
import type { ChatMessage } from "./chat/types";

const STRING_FIELDS = [
  "summary",
  "approach",
  "time_complexity",
  "space_complexity",
] as const;
const ARRAY_FIELDS = [
  "key_techniques",
  "strengths",
  "improvements",
] as const;
const SCORE_FIELDS = [
  "quality_score",
  "efficiency_score",
  "readability_score",
  "correctness_score",
  "best_practices_score",
] as const;

// Best-effort progressive parse of the accumulating JSON. The server streams
// the analysis in a single JSON object, so until the closing brace arrives
// JSON.parse always fails — instead we scan for complete field values so the
// panel can hydrate live while generation is still running.
function hydratePartial(raw: string): Partial<SolutionExplanation> | null {
  if (!raw.trim()) return null;
  const out: Partial<SolutionExplanation> = {};
  let any = false;

  for (const key of STRING_FIELDS) {
    const m = raw.match(
      new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`),
    );
    if (m) {
      try {
        out[key] = JSON.parse(`"${m[1]}"`);
        any = true;
      } catch {
        // incomplete escape — keep waiting
      }
    }
  }

  for (const key of ARRAY_FIELDS) {
    const m = raw.match(new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]*)\\]`));
    if (m) {
      const items =
        m[1]
          .match(/"((?:[^"\\]|\\.)*)"/g)
          ?.map((tok) => {
            try {
              return JSON.parse(tok) as unknown;
            } catch {
              return null;
            }
          })
          .filter((x): x is string => typeof x === "string") ?? [];
      if (items.length) {
        out[key] = items;
        any = true;
      }
    }
  }

  for (const key of SCORE_FIELDS) {
    const m = raw.match(new RegExp(`"${key}"\\s*:\\s*(\\d+)`));
    if (m) {
      out[key] = Number(m[1]);
      any = true;
    }
  }

  return any ? out : null;
}

export function AnalysisModal({
  solution,
  open,
  onOpenChange,
}: {
  solution: CommunitySolution;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Analysis streaming state.
  const [explanation, setExplanation] = useState<SolutionExplanation | null>(null);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ExplainErrorInfo | null>(null);
  const [partial, setPartial] = useState<Partial<SolutionExplanation> | null>(null);
  const rawRef = useRef("");

  // Chat state (rendered via FollowUpDrawer).
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [streamingAnswer, setStreamingAnswer] = useState<string | null>(null);
  const pendingAnswerRef = useRef("");

  // Clipboard state.
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAnalysis, setCopiedAnalysis] = useState(false);
  const codeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analysisTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filename = solutionFilename(solution.language);
  const language = solutionLanguage(solution.language);

  useEffect(
    () => () => {
      if (codeTimer.current) clearTimeout(codeTimer.current);
      if (analysisTimer.current) clearTimeout(analysisTimer.current);
    },
    [],
  );

  const loadExplanation = useCallback(async () => {
    if (explanation || loading) return;
    setLoading(true);
    setError(null);
    rawRef.current = "";
    setPartial(null);

    await explainSolutionStream(solution.id, {
      onDelta: (delta) => {
        rawRef.current += delta;
        const p = hydratePartial(rawRef.current);
        if (p) setPartial(p);
      },
      onFinal: (exp, wasCached) => {
        setExplanation(exp);
        setCached(wasCached);
        setLoading(false);
      },
      onError: (code, message) => {
        setError({ message, code });
        setLoading(false);
      },
    });
  }, [explanation, loading, solution.id]);

  // The analysis starts the moment the modal opens — and only once.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      loadExplanation();
    }, 0);
    return () => clearTimeout(t);
  }, [open, loadExplanation]);

  const sendChat = async () => {
    const q = question.trim();
    if (!q || chatLoading) return;
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setChatLoading(true);
    pendingAnswerRef.current = "";
    setStreamingAnswer("");

    await explainSolutionChatStream(solution.id, q, {
      onDelta: (delta) => {
        pendingAnswerRef.current += delta;
        setStreamingAnswer(pendingAnswerRef.current);
      },
      onError: (code, message) => {
        if (code === "AUTH_REQUIRED") {
          toast.error(message);
        } else if (code === "AI_RATE_LIMITED") {
          toast.error("You have used up the AI chat quota for this minute. Wait a moment, then retry.");
        } else {
          toast.error(message || "Failed to get an answer");
        }
      },
    });

    // Snapshot the accumulated text before clearing the ref. Reading the ref
    // inside the setMessages updater would see "" instead: React batches these
    // state updates and runs the updater after this synchronous block, by which
    // point pendingAnswerRef has already been reset.
    const finalAnswer = pendingAnswerRef.current;
    pendingAnswerRef.current = "";
    setStreamingAnswer(null);
    setChatLoading(false);
    if (finalAnswer) {
      setMessages((prev) => [...prev, { role: "ai", content: finalAnswer }]);
    }
  };

  const copyCode = async () => {
    if (!navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(solution.code);
      setCopiedCode(true);
      if (codeTimer.current) clearTimeout(codeTimer.current);
      codeTimer.current = setTimeout(() => setCopiedCode(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const copyAnalysis = async () => {
    if (!explanation) return;
    const sections = [
      `AI Analysis — ${solution.problem_title || solution.problem_slug}`,
      "",
      `Summary: ${explanation.summary}`,
      "",
      `Approach: ${explanation.approach}`,
      "",
      `Time complexity: ${explanation.time_complexity}`,
      `Space complexity: ${explanation.space_complexity}`,
      "",
      `Scores — Quality: ${explanation.quality_score}/100, Efficiency: ${explanation.efficiency_score}/100, Readability: ${explanation.readability_score}/100, Correctness: ${explanation.correctness_score}/100, Best practices: ${explanation.best_practices_score}/100`,
    ];
    if (explanation.key_techniques.length) {
      sections.push("", `Key techniques: ${explanation.key_techniques.join(", ")}`);
    }
    if (explanation.strengths.length) {
      sections.push("", "Strengths:", ...explanation.strengths.map((s) => `- ${s}`));
    }
    if (explanation.improvements.length) {
      sections.push("", "Improvements:", ...explanation.improvements.map((s) => `- ${s}`));
    }
    try {
      await navigator.clipboard.writeText(sections.join("\n"));
      setCopiedAnalysis(true);
      if (analysisTimer.current) clearTimeout(analysisTimer.current);
      analysisTimer.current = setTimeout(() => setCopiedAnalysis(false), 1500);
    } catch {
      toast.error("Could not copy analysis");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} modal={!chatOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[85vh] max-h-[85vh] flex-col gap-0 overflow-hidden bg-[#141414] p-0 sm:max-w-[880px]"
        >
          {/* Header */}
          <DialogHeader className="flex shrink-0 flex-row items-center gap-2 border-b border-white/10 px-6 pb-4 pt-5">
            <Sparkles size={16} className="text-purple-300" />
            <DialogTitle className="text-base font-bold text-foreground">
              Solution Analysis
            </DialogTitle>
            <span className="rounded-md border border-purple-700/40 bg-purple-900/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-200">
              NIM
            </span>
            {cached && (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                <CheckCircle2 size={11} />
                cached
              </span>
            )}
            <DialogClose className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground">
              <span className="sr-only">Close</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </DialogClose>
          </DialogHeader>

          {/* 50/50 Split Body */}
          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-2">
            {/* LEFT: Code Viewer Pane */}
            <div className="flex min-h-0 flex-col overflow-hidden border-b border-white/10 bg-[#191919] max-md:h-[38%] md:border-b-0 md:border-r">
              <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-[#1E1E1E] px-4 py-2">
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {filename}
                </span>
                <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] uppercase text-foreground">
                  {language}
                </span>
                <button
                  type="button"
                  onClick={copyCode}
                  aria-label={copiedCode ? "Copied code" : "Copy code"}
                  className="ml-auto flex shrink-0 items-center gap-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  {copiedCode ? (
                    <Check size={13} className="text-emerald-400" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                <CodeSnippet
                  files={[{ language, filename, code: solution.code }]}
                  collapsed={false}
                  lineNumbers
                  hideHeader
                  style={{
                    border: "none",
                    borderRadius: 0,
                    boxShadow: "none",
                    background: "transparent",
                  }}
                />
              </div>
            </div>

            {/* RIGHT: Telemetry & Tabbed Analysis */}
            <div className="flex min-h-0 flex-col overflow-y-auto bg-[#141414] p-5">
              <ExplainPanel
                explanation={explanation}
                loading={loading}
                error={error}
                partial={partial}
                onRetry={loadExplanation}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-[#191919] px-6 py-3">
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              disabled={!explanation}
              className="inline-flex items-center gap-2 rounded-md border border-purple-500/30 bg-purple-600/20 px-3.5 py-1.5 text-xs font-semibold text-purple-300 transition-colors hover:bg-purple-600/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <MessageSquare size={14} />
              Ask AI
            </button>
            <button
              type="button"
              onClick={copyAnalysis}
              disabled={!explanation}
              aria-label={copiedAnalysis ? "Copied analysis" : "Copy analysis"}
              className="inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copiedAnalysis ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <Copy size={14} />
              )}
              {copiedAnalysis ? "Copied" : "Copy Analysis"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Follow-up chat — renders above the dialog (z-100 > z-50). */}
      <FollowUpDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title={solution.problem_title || solution.problem_slug || "Solution"}
        messages={messages}
        loading={chatLoading}
        streaming={streamingAnswer}
        question={question}
        onQuestionChange={setQuestion}
        onSend={sendChat}
      />
    </>
  );
}