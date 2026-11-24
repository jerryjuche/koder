"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BrainCircuit,
  Check,
  ChevronLeft,
  Clock,
  Copy,
  Loader2,
  MessageSquarePlus,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
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
  const [query, setQuery] = useState("");
  const [atBottom, setAtBottom] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
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
    // The resulting scroll event updates `atBottom` through handleScroll.
  }, [messages, streamText, loadingThread]);

  // Keep the composer's height tracking its content, like a real chat box.
  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [question]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAtBottom(distance < 80);
  }, []);

  const jumpToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setAtBottom(true);
  }, []);

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
      if (
        !window.confirm("Delete this conversation? The saved answers go with it.")
      ) {
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

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) => (t.title || "").toLowerCase().includes(q));
  }, [query, threads]);

  const hasMessages = messages.length > 0 || streaming;
  const activeThread = threads.find((t) => t.id === activeId);
  const periodLabel =
    period === "all"
      ? "all time"
      : (PERIODS.find((p) => p.value === period)?.label ?? "today").toLowerCase();

  return (
    <div className="relative flex h-[calc(100dvh-8.5rem)] min-h-[540px] flex-col overflow-hidden rounded-2xl border border-brand-charcoal-border bg-brand-charcoal-card shadow-2xl shadow-black/40 lg:h-[calc(100dvh-6rem)]">
      {/* Header */}
      <header className="flex flex-col gap-3 border-b border-brand-charcoal-border bg-brand-charcoal-panel/60 px-3 py-3 sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open conversations"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-charcoal-border text-brand-offwhite-muted transition hover:text-brand-offwhite lg:hidden"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cool-accent/30 to-brand-muted-gold/20 ring-1 ring-brand-cool-accent/30">
              <BrainCircuit size={19} className="text-brand-cool-accent" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-brand-charcoal-card bg-brand-success" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <h1 className="text-base font-bold leading-tight text-brand-offwhite">
                  Atlas
                </h1>
                <span className="hidden text-[11px] font-medium uppercase tracking-wider text-brand-offwhite-muted/50 sm:inline">
                  platform analyst
                </span>
              </div>
              <p className="truncate text-[11px] text-brand-offwhite-muted/70">
                Grounded in your database · remembers every thread
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {activeThread && (
              <span className="hidden max-w-[220px] truncate rounded-full border border-brand-charcoal-border px-3 py-1.5 text-[11px] text-brand-offwhite-muted md:inline">
                {activeThread.title}
              </span>
            )}
            <button
              type="button"
              onClick={newChat}
              disabled={streaming}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-muted-gold px-3 py-2 text-xs font-semibold text-brand-charcoal-base transition hover:brightness-110 disabled:opacity-50"
            >
              <Plus size={13} />
              New chat
            </button>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <span className="hidden shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand-offwhite-muted/40 sm:inline-flex">
            <Clock size={10} />
            Window
          </span>
          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-brand-charcoal-border bg-brand-charcoal-base/60 p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => changePeriod(p.value)}
                disabled={streaming}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-50",
                  period === p.value
                    ? "bg-brand-cool-accent/15 text-brand-cool-accent"
                    : "text-brand-offwhite-muted hover:text-brand-offwhite",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Mobile drawer backdrop */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close conversations"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 z-20 bg-black/60 lg:hidden"
          />
        )}

        {/* Thread rail */}
        <aside
          className={cn(
            "absolute inset-y-0 left-0 z-30 flex w-[276px] flex-col border-r border-brand-charcoal-border bg-brand-charcoal-panel transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between px-3 pb-2 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-offwhite-muted/50">
              Conversations
            </span>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-brand-charcoal-base/70 px-1.5 py-0.5 text-[10px] text-brand-offwhite-muted/60">
                {threads.length}
              </span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close conversations"
                className="rounded p-1 text-brand-offwhite-muted/60 hover:text-brand-offwhite lg:hidden"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div className="px-2.5 pb-2">
            <div className="relative">
              <Search
                size={12}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-offwhite-muted/40"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats"
                className="w-full rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base/60 py-1.5 pl-7 pr-2 text-[11px] text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus:border-brand-cool-accent/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin">
            {loadingThreads ? (
              <div className="space-y-1.5 px-1 pt-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-10 animate-pulse rounded-lg bg-brand-charcoal-hover/60"
                  />
                ))}
              </div>
            ) : filteredThreads.length === 0 ? (
              <p className="px-2 py-3 text-[11px] leading-relaxed text-brand-offwhite-muted/50">
                {threads.length === 0
                  ? "Your questions and answers are saved here."
                  : "No conversation matches that search."}
              </p>
            ) : (
              <ul className="space-y-0.5">
                {filteredThreads.map((thread) => (
                  <li key={thread.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => openThread(thread.id)}
                      className={cn(
                        "w-full rounded-lg px-2.5 py-2 text-left transition-colors",
                        activeId === thread.id
                          ? "bg-brand-cool-accent/10 text-brand-offwhite"
                          : "text-brand-offwhite-muted hover:bg-brand-charcoal-hover/60 hover:text-brand-offwhite",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-brand-cool-accent transition-opacity",
                          activeId === thread.id ? "opacity-100" : "opacity-0",
                        )}
                      />
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
                      className="absolute right-1 top-2 rounded p-1 text-brand-offwhite-muted/40 opacity-0 transition hover:text-brand-error group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <Trash2 size={11} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-brand-charcoal-border/70 p-2.5">
            <button
              type="button"
              onClick={newChat}
              disabled={streaming}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base/50 px-2 py-2 text-[11px] font-medium text-brand-offwhite-muted transition hover:border-brand-cool-accent/30 hover:text-brand-offwhite disabled:opacity-50"
            >
              <MessageSquarePlus size={12} />
              Start a new conversation
            </button>
          </div>
        </aside>

        {/* Conversation */}
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="min-h-0 flex-1 overflow-y-auto scrollbar-thin"
          >
            <div className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-5">
              {loadingThread ? (
                <div className="animate-pulse space-y-3">
                  <div className="ml-auto h-9 w-2/5 rounded-2xl bg-brand-charcoal-hover" />
                  <div className="h-3 w-1/2 rounded bg-brand-charcoal-hover" />
                  <div className="h-3 w-full rounded bg-brand-charcoal-hover" />
                  <div className="h-3 w-4/5 rounded bg-brand-charcoal-hover" />
                  <div className="grid grid-cols-2 gap-2 pt-2 lg:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-20 rounded-xl bg-brand-charcoal-hover/70"
                      />
                    ))}
                  </div>
                </div>
              ) : !hasMessages ? (
                <Welcome onPick={send} periodLabel={periodLabel} />
              ) : (
                <div className="space-y-6">
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
                      <div className="min-w-0 flex-1">
                        <div className="rounded-2xl rounded-tl-md border border-brand-charcoal-border bg-brand-charcoal-base/50 px-4 py-3">
                          {streamText ? (
                            <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-p:leading-relaxed prose-headings:mt-3 prose-headings:mb-1 prose-headings:text-brand-offwhite prose-p:text-brand-offwhite-muted prose-li:text-brand-offwhite-muted prose-strong:text-brand-muted-gold">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {streamText}
                              </ReactMarkdown>
                              <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-brand-cool-accent align-text-bottom" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-brand-offwhite-muted/70">
                              <Loader2
                                size={13}
                                className="animate-spin text-brand-cool-accent"
                              />
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
          </div>

          {!atBottom && hasMessages && (
            <button
              type="button"
              onClick={jumpToBottom}
              className="absolute bottom-[132px] left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-brand-charcoal-border bg-brand-charcoal-panel/95 px-3 py-1.5 text-[11px] text-brand-offwhite-muted shadow-lg backdrop-blur transition hover:text-brand-offwhite"
            >
              <ArrowDown size={11} />
              Latest
            </button>
          )}

          {/* Composer */}
          <div className="border-t border-brand-charcoal-border bg-brand-charcoal-panel/40 px-3 py-3 sm:px-5">
            <div className="mx-auto w-full max-w-3xl">
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
              <div className="rounded-2xl border border-brand-charcoal-border bg-brand-charcoal-base transition focus-within:border-brand-cool-accent/50 focus-within:shadow-lg focus-within:shadow-brand-cool-accent/5">
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
                  rows={1}
                  maxLength={500}
                  disabled={streaming}
                  placeholder="Ask Atlas anything — today's activity, top performers, who is slipping, XP trends…"
                  className="max-h-[168px] w-full resize-none bg-transparent px-4 pb-1 pt-3 text-sm leading-relaxed text-brand-offwhite placeholder:text-brand-offwhite-muted/50 focus:outline-none disabled:opacity-60"
                />
                <div className="flex items-center justify-between gap-2 px-2.5 pb-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-1 text-[10px] text-brand-offwhite-muted/40">
                    <span className="hidden items-center gap-1 sm:inline-flex">
                      <Clock size={9} />
                      {periodLabel}
                    </span>
                    <span className="hidden sm:inline">
                      Enter to send · Shift+Enter for a new line
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={streaming || !question.trim()}
                    aria-label="Send question"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-muted-gold text-brand-charcoal-base transition hover:brightness-110 disabled:opacity-40"
                  >
                    {streaming ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ArrowUp size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-cool-accent/30 to-brand-muted-gold/20 ring-1 ring-brand-cool-accent/20">
      <Sparkles size={13} className="text-brand-cool-accent" />
    </div>
  );
}

function Welcome({
  onPick,
  periodLabel,
}: {
  onPick: (prompt: string) => void;
  periodLabel: string;
}) {
  return (
    <div className="flex flex-col items-center py-6 text-center sm:py-10">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cool-accent/25 to-brand-muted-gold/15 ring-1 ring-brand-cool-accent/25">
        <BrainCircuit size={26} className="text-brand-cool-accent" />
      </div>
      <h2 className="text-lg font-bold text-brand-offwhite">
        What do you want to know about the platform?
      </h2>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-brand-offwhite-muted/70">
        Atlas reads submissions, XP and levels, streaks, at-risk students, skill
        gaps and curriculum progress for{" "}
        <span className="text-brand-offwhite">{periodLabel}</span>. Ask a
        question, then keep asking — it remembers the thread.
      </p>
      <div className="mt-5 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="group flex items-center justify-between gap-2 rounded-xl border border-brand-charcoal-border bg-brand-charcoal-base/50 px-3 py-2.5 text-left text-xs text-brand-offwhite-muted transition hover:border-brand-cool-accent/30 hover:bg-brand-charcoal-hover/50 hover:text-brand-offwhite"
          >
            <span>{prompt}</span>
            <ArrowUp
              size={12}
              className="shrink-0 rotate-45 text-brand-offwhite-muted/30 transition group-hover:text-brand-cool-accent"
            />
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
  const [copied, setCopied] = useState(false);

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md border border-brand-cool-accent/25 bg-brand-cool-accent/10 px-4 py-2.5 text-sm leading-relaxed text-brand-offwhite">
          {message.content}
        </div>
      </div>
    );
  }

  const report: AdminInsightReport | null = message.report ?? null;
  const snapshot: AdminInsightsSnapshotExtended | null =
    message.snapshot ?? null;
  const subject: StudentInsight | null = message.subject ?? null;

  const copyAnswer = async () => {
    try {
      await navigator.clipboard.writeText(
        report?.summary || message.content || "",
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard is unavailable outside secure contexts; nothing to do.
    }
  };

  return (
    <div className="flex items-start gap-2.5">
      <Avatar />
      <div className="min-w-0 flex-1">
        <div className="group rounded-2xl rounded-tl-md border border-brand-charcoal-border bg-brand-charcoal-base/50 px-4 py-3">
          <div className="mb-1.5 flex items-start justify-between gap-3">
            {report?.headline ? (
              <h3 className="text-sm font-bold leading-snug text-brand-offwhite">
                {report.headline}
              </h3>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => void copyAnswer()}
              aria-label="Copy answer"
              className="shrink-0 rounded p-1 text-brand-offwhite-muted/30 opacity-0 transition hover:text-brand-offwhite group-hover:opacity-100 focus-visible:opacity-100"
            >
              {copied ? (
                <Check size={12} className="text-brand-success" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          </div>
          <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-headings:mt-3 prose-headings:mb-1 prose-headings:text-brand-offwhite prose-headings:text-sm prose-p:text-brand-offwhite-muted prose-li:my-0.5 prose-li:text-brand-offwhite-muted prose-strong:text-brand-muted-gold">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {report?.summary || message.content}
            </ReactMarkdown>
          </div>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[10px] text-brand-offwhite-muted/40">
          <span>{relativeTime(message.created_at)}</span>
          {snapshot && (
            <span>
              {new Date(snapshot.window_start).toLocaleDateString()} →{" "}
              {new Date(snapshot.window_end).toLocaleString()}
            </span>
          )}
          {snapshot && (
            <span>
              {formatNumber(snapshot.totals.submissions)} submissions ·{" "}
              {snapshot.totals.pass_rate}% pass
            </span>
          )}
          {message.model && <span className="font-mono">{message.model}</span>}
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
