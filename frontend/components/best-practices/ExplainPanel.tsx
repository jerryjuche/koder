"use client";

import { useState } from "react";
import {
  Sparkles,
  Bot,
  Clock,
  MemoryStick,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { CommunitySolution, SolutionExplanation } from "@/lib/types";
import { explainSolution, explainSolutionChat } from "@/lib/api";
import { renderMarkdown } from "@/lib/markdown";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "ai";
  content: string;
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

function ComplexityBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5">
      {label === "Time" ? (
        <Clock size={13} className="text-purple-300 shrink-0" />
      ) : (
        <MemoryStick size={13} className="text-purple-300 shrink-0" />
      )}
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <code className="font-mono text-xs font-semibold text-emerald-400">{value}</code>
    </div>
  );
}

export function ExplainPanel({ solution }: { solution: CommunitySolution }) {
  const [explanation, setExplanation] = useState<SolutionExplanation | null>(null);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const loadExplanation = async () => {
    if (explanation || loading) return;
    setLoading(true);
    try {
      const res = await explainSolution(solution.id);
      if (res.success && res.data) {
        setExplanation(res.data.explanation);
        setCached(!!res.data.cached);
      } else {
        toast.error(res.error?.message || "Failed to analyze solution");
      }
    } catch {
      toast.error("AI analysis unavailable — please try again");
    } finally {
      setLoading(false);
    }
  };

  const sendChat = async () => {
    const q = question.trim();
    if (!q || chatLoading) return;
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setChatLoading(true);
    try {
      const res = await explainSolutionChat(solution.id, q);
      if (res.success && res.data) {
        const answer = res.data.answer;
        setMessages((prev) => [...prev, { role: "ai", content: answer }]);
      } else {
        toast.error(res.error?.message || "Failed to get an answer");
      }
    } catch {
      toast.error("AI chat unavailable — please try again");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-purple-900/40 bg-gradient-to-br from-purple-950/60 to-brand-charcoal-panel">
      {!explanation && (
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles size={15} className="text-purple-300" />
            AI Explain
            <span className="rounded-md bg-purple-900/50 border border-purple-700/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-200">
              NIM
            </span>
          </div>
          <button
            onClick={loadExplanation}
            disabled={loading}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-purple-600/40 bg-purple-600/10 px-2.5 py-1 text-xs font-semibold text-purple-200 transition-colors hover:bg-purple-600/20 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Bot size={13} />
                Explain this solution
              </>
            )}
          </button>
        </div>
      )}

      {explanation && (
        <div className="space-y-4 px-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-purple-300" />
            <span className="text-sm font-bold text-foreground">AI Explain</span>
            {cached && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                <CheckCircle2 size={11} />
                cached
              </span>
            )}
          </div>

          <div>
            <SectionLabel>Summary</SectionLabel>
            <p className="text-sm leading-relaxed text-brand-offwhite/90">{explanation.summary}</p>
          </div>

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
