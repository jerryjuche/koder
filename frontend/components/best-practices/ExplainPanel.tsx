"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bot,
  Eye,
  Send,
  Loader2,
  RotateCcw,
  ShieldCheck,
  ThumbsUp,
  Zap,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { CommunitySolution, SolutionExplanation } from "@/lib/types";
import { explainSolution, explainSolutionChat } from "@/lib/api";
import { renderMarkdown } from "@/lib/markdown";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { AnalysisHeader } from "./AnalysisHeader";
import { AnalysisSkeleton } from "./AnalysisSkeleton";
import { QualityGauge } from "./QualityGauge";
import { ScoreRadar } from "./ScoreRadar";
import { MetricTile } from "./MetricTile";
import { ComplexityBadge } from "./ComplexityBadge";
import { ComplexityScale } from "./ComplexityScale";

type ChatMessage = {
  role: "user" | "ai";
  content: string;
};

type ExplainError = {
  message: string;
  details?: string;
  code?: string;
};

function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h4 className={cn("text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2", className)}>
      {children}
    </h4>
  );
}

function AnalysisError({
  error,
  onRetry,
}: {
  error: ExplainError;
  onRetry: () => void;
}) {
  const upstream = error.details === "upstream_error";
  const rateLimited = error.code === "AI_RATE_LIMITED";
  const title = rateLimited
    ? "Too many AI requests"
    : upstream
      ? "The AI service is temporarily busy"
      : "AI analysis unavailable";
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
        <AlertTriangle size={15} />
        {title}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {rateLimited
          ? "You have used up the AI analysis quota for this minute. Wait a moment, then retry."
          : upstream
            ? "The AI provider did not respond in time. Wait a moment, then retry."
            : error.message}
      </p>
      <button
        onClick={onRetry}
        className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-purple-600/40 bg-purple-600/10 px-2.5 py-1 text-xs font-semibold text-purple-200 transition-colors hover:bg-purple-600/20"
      >
        <RotateCcw size={12} />
        Retry
      </button>
    </div>
  );
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
  const [error, setError] = useState<ExplainError | null>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const loadExplanation = useCallback(async () => {
    if (explanation || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await explainSolution(solution.id);
      if (res.success && res.data) {
        setExplanation(res.data.explanation);
        setCached(!!res.data.cached);
      } else {
        setError({
          message: res.error?.message || "The AI could not analyze this solution.",
          details: res.error?.details,
          code: res.error?.code,
        });
      }
    } catch {
      setError({ message: "AI analysis unavailable — please try again." });
    } finally {
      setLoading(false);
    }
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
    try {
      const res = await explainSolutionChat(solution.id, q);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, { role: "ai", content: res.data!.answer }]);
      } else {
        toast.error(res.error?.message || "Failed to get an answer");
      }
    } catch {
      toast.error("AI chat unavailable — please try again");
    } finally {
      setChatLoading(false);
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

  const hasSubScores =
    (explanation?.efficiency_score ?? 0) +
      (explanation?.readability_score ?? 0) +
      (explanation?.correctness_score ?? 0) +
      (explanation?.best_practices_score ?? 0) >
    0;

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-purple-900/40 bg-gradient-to-br from-purple-950/60 to-brand-charcoal-panel">
      {!loading && !explanation && !error && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles size={15} className="text-purple-300" />
            AI Analysis
            <span className="rounded-md bg-purple-900/50 border border-purple-700/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-200">
              NIM
            </span>
          </div>
          <button
            onClick={loadExplanation}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-purple-600/40 bg-purple-600/10 px-2.5 py-1 text-xs font-semibold text-purple-200 transition-colors hover:bg-purple-600/20"
          >
            <Bot size={13} />
            Run AI Analysis
          </button>
        </div>
      )}

      {loading && !explanation && (
        <div className="px-4 py-4">
          <AnalysisSkeleton />
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

          <div>
            <SectionLabel>Summary</SectionLabel>
            <p className="text-sm leading-relaxed text-brand-offwhite/90">{explanation.summary}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[190px_1fr]">
            <QualityGauge score={explanation.quality_score} label="Overall quality" />
            <ScoreRadar
              efficiency={explanation.efficiency_score}
              readability={explanation.readability_score}
              correctness={explanation.correctness_score}
              bestPractices={explanation.best_practices_score}
            />
          </div>

          {hasSubScores && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MetricTile
                icon={Zap}
                label="Efficiency"
                value={`${explanation.efficiency_score}/100`}
                tone="emerald"
              />
              <MetricTile icon={Eye} label="Readability" value={`${explanation.readability_score}/100`} />
              <MetricTile icon={ShieldCheck} label="Correctness" value={`${explanation.correctness_score}/100`} />
              <MetricTile
                icon={ThumbsUp}
                label="Best practices"
                value={`${explanation.best_practices_score}/100`}
              />
            </div>
          )}

          <div>
            <SectionLabel>Approach</SectionLabel>
            <div
              className="text-sm leading-relaxed text-brand-offwhite/90"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(explanation.approach) }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <ComplexityBadge label="Time" value={explanation.time_complexity} />
            <ComplexityBadge label="Space" value={explanation.space_complexity} />
          </div>

          <ComplexityScale />

          {explanation.key_techniques.length > 0 && (
            <div>
              <SectionLabel>Key Techniques</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {explanation.key_techniques.map((t, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {explanation.strengths.length > 0 && (
              <div>
                <SectionLabel>Strengths</SectionLabel>
                <ul className="space-y-1.5">
                  {explanation.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-brand-offwhite/80">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {explanation.improvements.length > 0 && (
              <div>
                <SectionLabel>Improvements</SectionLabel>
                <ul className="space-y-1.5">
                  {explanation.improvements.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-brand-offwhite/80">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-purple-300" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="border-t border-border/60 pt-3">
            <button
              onClick={() => setChatOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 hover:text-purple-100 transition-colors"
            >
              <Bot size={13} />
              Ask a follow-up
              <span className="text-muted-foreground font-normal">
                {chatOpen ? "▾" : "▸"}
              </span>
            </button>

            {chatOpen && (
              <div className="mt-3 space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "max-w-[90%] rounded-lg px-3 py-2 text-[13px] leading-relaxed",
                      m.role === "user"
                        ? "ml-auto bg-purple-600/20 border border-purple-500/30 text-brand-offwhite"
                        : "mr-auto bg-muted/40 border border-border/60 text-brand-offwhite/90",
                    )}
                  >
                    {m.role === "ai" ? (
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                    ) : (
                      m.content
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="mr-auto inline-flex items-center gap-2 rounded-lg bg-muted/40 border border-border/60 px-3 py-2 text-[13px] text-muted-foreground">
                    <Loader2 size={13} className="animate-spin" />
                    Thinking…
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendChat();
                      }
                    }}
                    placeholder="Ask anything about this solution…"
                    className="flex-1 rounded-md border border-border/70 bg-brand-charcoal-card px-3 py-1.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    onClick={sendChat}
                    disabled={!question.trim() || chatLoading}
                    className="inline-flex items-center gap-1.5 rounded-md border border-purple-600/40 bg-purple-600/10 px-2.5 py-1.5 text-xs font-semibold text-purple-200 transition-colors hover:bg-purple-600/20 disabled:opacity-50"
                  >
                    <Send size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
