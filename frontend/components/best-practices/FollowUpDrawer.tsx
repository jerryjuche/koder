"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Loader2, MessagesSquare, Send, X } from "lucide-react";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

export type FollowUpMessage = {
  role: "user" | "ai";
  content: string;
};

const EASE = [0.32, 0.72, 0, 1] as const;

export function FollowUpDrawer({
  open,
  onClose,
  title,
  messages,
  loading,
  question,
  onQuestionChange,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  messages: FollowUpMessage[];
  loading: boolean;
  question: string;
  onQuestionChange: (q: string) => void;
  onSend: () => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Portals need a mounted client before document.body exists (SSR-safe).
  const mounted = useHasMounted();

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus the composer once the drawer mounts (deferred so the effect does
  // not run while the browser is still painting the panel).
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => textareaRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  // Keep the latest message in view.
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  // Auto-grow the composer up to 4 rows.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [question]);

  const submit = () => {
    if (!question.trim() || loading) return;
    onSend();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="followup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[2px]"
          />
          <motion.aside
            key="followup-drawer"
            data-followup-drawer
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="AI follow-up chat"
            className="fixed inset-y-0 right-0 z-[100] flex w-full max-w-[420px] flex-col border-l border-border bg-brand-charcoal-panel shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-600/15">
                <Bot size={16} className="text-purple-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold leading-tight text-foreground">
                  AI follow-up
                </div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {title}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close chat"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                  <MessagesSquare size={20} className="text-purple-400/50" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Ask anything about this solution — the AI will answer based
                    on its analysis above.
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[88%] rounded-xl px-3 py-2 text-[13px] leading-relaxed",
                    m.role === "user"
                      ? "ml-auto border border-purple-500/30 bg-purple-600/20 text-brand-offwhite"
                      : "mr-auto border border-border/60 bg-muted/40 text-brand-offwhite/90",
                  )}
                >
                  {m.role === "ai" ? (
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                  ) : (
                    m.content
                  )}
                </div>
              ))}
              {loading && (
                <div className="mr-auto inline-flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-[13px] text-muted-foreground">
                  <Loader2 size={13} className="animate-spin" />
                  Thinking…
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-border bg-brand-charcoal-card p-3">
              <div
                className="aura aura-md aura-dual w-full text-purple-400"
                style={{ ["--aura-radius" as string]: "0.75rem" }}
              >
                <div className="flex items-end gap-2 rounded-xl bg-brand-charcoal-card px-3 py-2">
                  <textarea
                    ref={textareaRef}
                    value={question}
                    onChange={(e) => onQuestionChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submit();
                      }
                    }}
                    rows={1}
                    placeholder="Ask anything about this solution…"
                    className="max-h-[112px] flex-1 resize-none bg-transparent text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!question.trim() || loading}
                    aria-label="Send question"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white transition-colors hover:bg-purple-500 disabled:opacity-40"
                  >
                    <Send size={13} />
                  </button>
                </div>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                Enter to send · Shift+Enter for a new line
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
