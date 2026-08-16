"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import type { CommunitySolution, SolutionExplanation } from "@/lib/types";
import {
  explainSolutionStream,
  explainSolutionChatStream,
} from "@/lib/api";
import { toast } from "@/lib/toast";
import { AnalysisHeader } from "./AnalysisHeader";
import { AnalysisHydration } from "./AnalysisHydration";
import { AnalysisError, type ExplainErrorInfo } from "./AnalysisError";
import { AnalysisSummary } from "./AnalysisSummary";
import { AnalysisScorecard } from "./AnalysisScorecard";
import { AnalysisApproach } from "./AnalysisApproach";
import { AnalysisComplexity } from "./AnalysisComplexity";
import { AnalysisTechniques } from "./AnalysisTechniques";
import { AnalysisPoints } from "./AnalysisPoints";
import { AnalysisFooter } from "./AnalysisFooter";
import { FollowUpDrawer } from "./FollowUpDrawer";
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

export function ExplainPanel({
  solution,
  autoStart = false,
}: {
  solution: CommunitySolution;
  autoStart?: boolean;
}) {
  const [explanation, setExplanation] = useState<SolutionExplanation | null>(null);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ExplainErrorInfo | null>(null);
  const [partial, setPartial] = useState<Partial<SolutionExplanation> | null>(null);
  const rawRef = useRef("");

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [streamingAnswer, setStreamingAnswer] = useState<string | null>(null);
  const pendingAnswerRef = useRef("");

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

  // The analysis only starts when the user asks for it — either via the
  // "Run AI Analysis" button or the autoStart signal from the AI pill.
  useEffect(() => {
    if (!autoStart) return;
    const t = setTimeout(() => {
      loadExplanation();
    }, 0);
    return () => clearTimeout(t);
  }, [autoStart, loadExplanation]);

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
    } catch {
      toast.error("Could not copy analysis");
    }
  };

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-border bg-brand-charcoal-panel">
      {!loading && !explanation && !error && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles size={15} className="text-purple-300" />
            AI Analysis
            <span className="rounded-md border border-purple-700/40 bg-purple-900/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-200">
              NIM
            </span>
          </div>
          <button
            onClick={loadExplanation}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            <Bot size={13} />
            Run AI Analysis
          </button>
        </div>
      )}

      {loading && !explanation && (
        <div className="px-4 py-4">
          <AnalysisHydration partial={partial} />
        </div>
      )}

      {!loading && !explanation && error && (
        <div className="px-4 py-3">
          <AnalysisError error={error} onRetry={loadExplanation} />
        </div>
      )}

      {explanation && (
        <div className="space-y-4 px-4 py-4">
          <AnalysisHeader cached={cached} onCopy={copyAnalysis} />
          <AnalysisSummary summary={explanation.summary} />
          <AnalysisScorecard explanation={explanation} />
          <AnalysisApproach approach={explanation.approach} />
          <AnalysisComplexity
            time={explanation.time_complexity}
            space={explanation.space_complexity}
          />
          <AnalysisTechniques techniques={explanation.key_techniques} />
          <AnalysisPoints
            strengths={explanation.strengths}
            improvements={explanation.improvements}
          />
          <AnalysisFooter onOpenChat={() => setChatOpen(true)} />
        </div>
      )}

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
    </div>
  );
}
