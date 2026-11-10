"use client";

import { useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatComposer({
  question,
  onQuestionChange,
  onSend,
  loading,
}: {
  question: string;
  onQuestionChange: (q: string) => void;
  onSend: () => void;
  loading: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the composer up to 4 rows.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [question]);

  // Focus the textarea after the FollowUpDrawer's slide-in animation completes.
  // Uses double-rAF to wait for the browser to paint the drawer in its final
  // position before attempting focus — more reliable than a fixed setTimeout.
  useEffect(() => {
    let raf: number;
    let timer: ReturnType<typeof setTimeout>;
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        timer = setTimeout(() => {
          textareaRef.current?.focus({ preventScroll: true });
        }, 50);
      });
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  const submit = () => {
    if (!question.trim() || loading) return;
    onSend();
  };

  return (
    <div
      className="border-t border-border bg-brand-charcoal-card p-3 cursor-text"
      onClick={() => textareaRef.current?.focus()}
    >
      <div
        className={cn(
          "w-full rounded-xl transition-all duration-200",
          loading
            ? "aura aura-md aura-dual text-purple-400 aura-spin"
            : "border border-border focus-within:border-purple-500/50",
        )}
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
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
        Enter to send · Shift+Enter for a new line
      </p>
    </div>
  );
}
