"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertTriangle,
  ArrowUp,
  BrainCircuit,
  ChevronLeft,
  Clock,
  Loader2,
  MessageSquarePlus,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  createInsightThread,
  deleteInsightThread,
  fetchInsightThread,
  fetchInsightThreads,
  streamInsightMessage,
  updateInsightThread,
} from "@/lib/api";
import type {
  AdminInsightPeriod,
  AdminInsightReport,
  AdminInsightsSnapshotExtended,
  InsightMessage,
  InsightThread,
  InsightTurnResult,
  StudentInsight,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import AdminInsightCards from "./AdminInsightCards";

const PERIODS: { value: AdminInsightPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "7 days" },
  { value: "month", label: "30 days" },
  { value: "all", label: "All time" },
];

const QUICK_PROMPTS = [
  "How was today?",
  "Who is performing best and why?",
  "Which skills are weakest right now?",
  "Who has gone quiet this week?",
  "How is XP growing this month?",
  "What should I fix this week?",
];

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

type ChatMessage = InsightMessage & {
  pending?: boolean;
};

export default function AdminInsightsPanel() {
  const [threads, setThreads] = useState<InsightThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [period, setPeriod] = useState<AdminInsightPeriod>("today");
  const [question, setQuestion] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const loadThreads = useCallback(async (): Promise<InsightThread[]> => {
    const res = await fetchInsightThreads();
    if (res.success && res.data) {
      setThreads(res.data);
      return res.data;
    }
    return [];
  }, []);

  const openThread = useCallback(async (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
    setError(null);
    setLoadingThread(true);
    const res = await fetchInsightThread(id);
    if (res.success && res.data) {
      setMessages(res.data.messages as ChatMessage[]);
      setPeriod(res.data.thread.period);
    } else {
      setError(res.error?.message || "Could not open that conversation.");
      setMessages([]);
    }
    setLoadingThread(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await loadThreads();
      if (cancelled) return;
      setLoadingThreads(false);
      if (list.length > 0) {
        void openThread(list[0].id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadThreads, openThread]);

  useEffect(() => {
    if (loadingThread) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streamText, loadingThread]);

  const changePeriod = useCallback(
    (next: AdminInsightPeriod) => {
      setPeriod(next);
      if (activeId) {
        void updateInsightThread(activeId, { period: next });
        setThreads((prev) =>
          prev.map((t) => (t.id === activeId ? { ...t, period: next } : t)),
        );
      }
    },
    [activeId],
  );

  const newChat = useCallback(() => {
    setActiveId(null);
    setMessages([]);
    setQuestion("");
    setError(null);
    setStreamText("");
    setSidebarOpen(false);
    composerRef.current?.focus();
  }, []);

  const removeThread = useCallback(
    async (id: string) => {
      if (!window.confirm("Delete this conversation? The saved answers go with it.")) {
        return;
      }
      const res = await deleteInsightThread(id);
      if (!res.success) {
        setError(res.error?.message || "Could not delete the conversation.");
        return;
      }
      const remaining = threads.filter((t) => t.id !== id);
      setThreads(remaining);
      if (activeId === id) {
        if (remaining.length > 0) {
          void openThread(remaining[0].id);
        } else {
          newChat();
        }
      }
    },
    [activeId, newChat, openThread, threads],
  );

  const send = useCallback(
    async (override?: string) => {
      const prompt = (override ?? question).trim();
      if (!prompt || streaming) return;

      setError(null);
      setQuestion("");
      setStreaming(true);
      setStreamText("");

      // Create the thread lazily so an empty chat never leaves clutter behind.
      let threadId = activeId;
      if (!threadId) {
        const created = await createInsightThread({ period });
        if (!created.success || !created.data) {
          setStreaming(false);
          setQuestion(prompt);
          setError(created.error?.message || "Could not start a conversation.");
          return;
        }
        threadId = created.data.id;
        setActiveId(threadId);
        setThreads((prev) => [created.data!, ...prev]);
      }

      const optimistic: ChatMessage = {
        id: `pending-user-${Date.now()}`,
        thread_id: threadId,
        role: "user",
        content: prompt,
        created_at: new Date().toISOString(),
        pending: true,
      };
      setMessages((prev) => [...prev, optimistic]);

      	      const id = threadId;
      const turn = await new Promise<{
        final: InsightTurnResult | null;
        errorMessage: string | null;
      }>((resolve) => {
        let final: InsightTurnResult | null = null;
        let errorMessage: string | null = null;
        void streamInsightMessage(
          id,
          { question: prompt, period },
          {
            onDelta: (delta) => setStreamText((prev) => prev + delta),
            onFinal: (result) => {
              final = result;
            },
            onError: (_code, message) => {
              errorMessage = message;
              setError(message);
            },
          },
        ).then(() => resolve({ final, errorMessage }));
      });

      setStreaming(false);
      setStreamText("");

      if (turn.final) {
        const result = turn.final;
        const assistant: ChatMessage = {
          id: result.message_id || `assistant-${Date.now()}`,
          thread_id: id,
          role: "assistant",
          content: result.report.summary,
          report: result.report,
          snapshot: result.snapshot,
          subject: result.subject ?? null,
          model: result.model,
          created_at: result.generated_at,
        };
        setMessages((prev) => [
          ...prev.map((m) =>
            m.id === optimistic.id ? { ...m, pending: false } : m,
          ),
          assistant,
        ]);
        // The server names a fresh thread from its first question.
        void loadThreads().then((list) => {
          if (list.length > 0) {
            setThreads((prev) =>
              prev.map((t) => list.find((l) => l.id === t.id) ?? t),
            );
          }
        });
      } else {
        // Nothing was persisted server-side; put the question back for a retry.
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setQuestion(prompt);
        if (!turn.errorMessage) {
          setError("The analyst could not finish that answer. Please try again.");
        }
      }
    },
    [activeId, loadThreads, period, question, streaming],
  );

  const hasMessages = messages.length > 0 || streaming;
  const activeThread = threads.find((t) => t.id === activeId);

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-cool-accent/25 bg-brand-charcoal-card">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-brand-charcoal-border bg-gradient-to-r from-brand-charcoal-panel/60 to-transparent p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-cool-accent/15">
            <BrainCircuit size={20} className="text-brand-cool-accent" />
          </div>
          <div>
            <h2 className="text-base font-bold text-brand-offwhite">
              Atlas · ask the platform
            </h2>
            <p className="mt-0.5 text-xs text-brand-offwhite-muted/70">
              Every number is read from the database; Atlas explains it and
              remembers the conversation.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => changePeriod(p.value)}
                disabled={streaming}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors disabled:opacity-50",
                  period === p.value
                    ? "border-brand-cool-accent/40 bg-brand-cool-accent/15 text-brand-cool-accent"
                    : "border-brand-charcoal-border bg-brand-charcoal-base/50 text-brand-offwhite-muted hover:text-brand-offwhite",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={newChat}
            disabled={streaming}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-muted-gold px-3 py-1.5 text-[11px] font-semibold text-brand-charcoal-base transition hover:brightness-110 disabled:opacity-50"
          >
            <Plus size={12} />
            New chat
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[230px_1fr]">
        {/* Thread rail (desktop) */}
        <aside className="hidden border-r border-brand-charcoal-border/70 bg-brand-charcoal-base/20 p-2.5 lg:block">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-offwhite-muted/50">
              Conversations
            </span>
            {loadingThreads && <Loader2 size={11} className="animate-spin text-brand-offwhite-muted/50" />}
          </div>
          {threads.length === 0 ? (
            <p className="px-1 text-[11px] leading-relaxed text-brand-offwhite-muted/50">
              Your questions and answers are saved here.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {threads.map((thread) => (
                <li key={thread.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => openThread(thread.id)}
                    className={cn(
                      "w-full rounded-lg px-2 py-2 text-left transition-colors",
                      activeId === thread.id
                        ? "bg-brand-cool-accent/10 text-brand-offwhite"
                        : "text-brand-offwhite-muted hover:bg-brand-charcoal-hover/60 hover:text-brand-offwhite",
                    )}
                  >
                    <span className="block truncate pr-5 text-xs font-medium">
                      {thread.title || "New conversation"}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-brand-offwhite-muted/50">
                      {thread.message_count > 0
                        ? `${thread.message_count} messages · `
                        : ""}
                      {relativeTime(thread.updated_at)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeThread(thread.id)}
                    aria-label="Delete conversation"
                    className="absolute right-1 top-2 rounded p-1 text-brand-offwhite-muted/40 opacity-0 transition hover:text-brand-error group-hover:opacity-100"
                  >
                    <Trash2 size={11} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Conversation */}
        <div className="flex min-h-[520px] flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="mb-3 flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen((v) => !v)}
                className="inline-flex items-center gap-1 rounded-lg border border-brand-charcoal-border px-2 py-1.5 text-[11px] text-brand-offwhite-muted"
              >
                <ChevronLeft
                  size={12}
                  className={cn("transition-transform", sidebarOpen && "-rotate-90")}
                />
                {threads.length} chats
              </button>
              {activeThread && (
                <span className="truncate text-[11px] text-brand-offwhite-muted/60">
                  {activeThread.title}
                </span>
              )}
            </div>

            {sidebarOpen && (
              <ul className="mb-3 space-y-1 rounded-xl border border-brand-charcoal-border bg-brand-charcoal-base/40 p-2 lg:hidden">
                {threads.map((thread) => (
                  <li key={thread.id}>
                    <button
                      type="button"
                      onClick={() => openThread(thread.id)}
                      className={cn(
                        "w-full rounded-lg px-2 py-1.5 text-left text-[11px]",
                        activeId === thread.id
                          ? "bg-brand-cool-accent/10 text-brand-offwhite"
                          : "text-brand-offwhite-muted",
                      )}
                    >
                      <span className="block truncate">{thread.title}</span>
                      <span className="text-[10px] text-brand-offwhite-muted/40">
                        {relativeTime(thread.updated_at)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {loadingThread ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 w-1/2 rounded bg-brand-charcoal-hover" />
                <div className="h-3 w-full rounded bg-brand-charcoal-hover" />
                <div className="h-3 w-4/5 rounded bg-brand-charcoal-hover" />
              </div>
            ) : !hasMessages ? (
              <Welcome onPick={send} />
            ) : (
              <div className="space-y-5">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onAsk={send}
                    busy={streaming}
                  />
                ))}

                {streaming && (
                  <div className="flex items-start gap-2.5">
                    <Avatar />
                    <div className="min-w-0 max-w-[92%] flex-1">
                      <div className="rounded-xl border border-brand-charcoal-border bg-brand-charcoal-base/40 px-3.5 py-2.5">
                        {streamText ? (
                          <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-p:leading-relaxed prose-headings:mt-3 prose-headings:mb-1 prose-headings:text-brand-offwhite prose-p:text-brand-offwhite-muted prose-li:text-brand-offwhite-muted prose-strong:text-brand-muted-gold">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {streamText}
                            </ReactMarkdown>
                            <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-brand-cool-accent align-text-bottom" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-brand-offwhite-muted/70">
                            <Loader2 size={13} className="animate-spin text-brand-cool-accent" />
                            Reading the database and thinking…
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-brand-charcoal-border/70 bg-brand-charcoal-base/20 px-4 py-3">
            {error && (
              <div className="mb-2 flex items-start gap-2 rounded-xl border border-brand-error/30 bg-brand-error/10 px-3 py-2 text-[11px] text-brand-error">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                <span className="flex-1">{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-brand-error/70 hover:text-brand-error"
                >
                  dismiss
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={composerRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={2}
                maxLength={500}
                disabled={streaming}
                placeholder="Ask anything: how was today, who is slipping, how is Aisha doing, where are we losing XP…"
                className="max-h-32 min-h-[46px] flex-1 resize-none rounded-xl border border-brand-charcoal-border bg-brand-charcoal-base px-3.5 py-2.5 text-sm text-brand-offwhite placeholder:text-brand-offwhite-muted/50 focus:border-brand-cool-accent/50 focus:outline-none disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={streaming || !question.trim()}
                className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-brand-muted-gold text-brand-charcoal-base transition hover:brightness-110 disabled:opacity-40"
                aria-label="Send question"
              >
                {streaming ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <ArrowUp size={17} />
                )}
              </button>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-brand-offwhite-muted/40">
              <span>Enter to send · Shift+Enter for a new line</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={9} />
                {period === "all" ? "all time" : PERIODS.find((p) => p.value === period)?.label}
              </span>
              {activeThread && <span>thread saved automatically</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-cool-accent/30 to-brand-muted-gold/20">
      <Sparkles size={13} className="text-brand-cool-accent" />
    </div>
  );
}

function Welcome({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="rounded-xl border border-dashed border-brand-charcoal-border px-4 py-7 text-center">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-cool-accent/10">
        <BrainCircuit size={20} className="text-brand-cool-accent" />
      </div>
      <h3 className="text-sm font-semibold text-brand-offwhite">
        What do you want to know?
      </h3>
      <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-brand-offwhite-muted/70">
        Atlas reads today&apos;s submissions, XP and levels, streaks, at-risk
        students, skill gaps and curriculum progress. Ask a question, then keep
        asking — it remembers the thread.
      </p>
      <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-1.5">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="rounded-full border border-brand-charcoal-border bg-brand-charcoal-base/60 px-2.5 py-1 text-[11px] text-brand-offwhite-muted transition hover:border-brand-cool-accent/30 hover:text-brand-offwhite"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onAsk,
  busy,
}: {
  message: ChatMessage;
  onAsk: (prompt: string) => void;
  busy: boolean;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-brand-cool-accent/25 bg-brand-cool-accent/10 px-3.5 py-2 text-sm text-brand-offwhite">
          {message.content}
        </div>
      </div>
    );
  }

  const report: AdminInsightReport | null = message.report ?? null;
  const snapshot: AdminInsightsSnapshotExtended | null =
    message.snapshot ?? null;
  const subject: StudentInsight | null = message.subject ?? null;

  return (
    <div className="flex items-start gap-2.5">
      <Avatar />
      <div className="min-w-0 flex-1">
        <div className="rounded-xl border border-brand-charcoal-border bg-brand-charcoal-base/40 px-3.5 py-2.5">
          {report?.headline && (
            <h3 className="mb-1 text-sm font-bold leading-snug text-brand-offwhite">
              {report.headline}
            </h3>
          )}
          <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-headings:mt-3 prose-headings:mb-1 prose-headings:text-brand-offwhite prose-headings:text-sm prose-p:text-brand-offwhite-muted prose-li:my-0.5 prose-li:text-brand-offwhite-muted prose-strong:text-brand-muted-gold">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {report?.summary || message.content}
            </ReactMarkdown>
          </div>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[10px] text-brand-offwhite-muted/40">
          <span>{relativeTime(message.created_at)}</span>
          {snapshot && (
            <span>
              {new Date(snapshot.window_start).toLocaleDateString()} →{" "}
              {new Date(snapshot.window_end).toLocaleString()}
            </span>
          )}
          {message.model && <span className="font-mono">{message.model}</span>}
          {snapshot && (
            <span>
              {formatNumber(snapshot.totals.submissions)} submissions ·{" "}
              {snapshot.totals.pass_rate}% pass
            </span>
          )}
        </div>

        {report && snapshot && (
          <AdminInsightCards
            report={report}
            snapshot={snapshot}
            subject={subject}
            onAsk={onAsk}
            disabled={busy}
          />
        )}

        {report && report.follow_ups.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] text-brand-offwhite-muted/50">
              <MessageSquarePlus size={10} />
              Ask next
            </span>
            {report.follow_ups.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onAsk(q)}
                disabled={busy}
                className="rounded-full border border-brand-cool-accent/20 bg-brand-cool-accent/10 px-2.5 py-1 text-[11px] text-brand-cool-accent transition hover:bg-brand-cool-accent/20 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
