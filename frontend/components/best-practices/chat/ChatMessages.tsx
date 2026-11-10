"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MessagesSquare } from "lucide-react";
import { ChatBubble } from "./ChatBubble";
import type { ChatMessage } from "./types";

const NEAR_BOTTOM_PX = 64;

export function ChatMessages({
  messages,
  streaming,
  loading,
}: {
  messages: ChatMessage[];
  streaming: string | null;
  loading: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);

  // Track whether the user is reading older content so streaming only
  // auto-scrolls when they are already at (or near) the bottom.
  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    nearBottomRef.current = distance < NEAR_BOTTOM_PX;
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (nearBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, streaming, loading]);

  return (
    <div
      ref={listRef}
      onScroll={onScroll}
      aria-live="polite"
      className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
    >
      {messages.length === 0 && !streaming && (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
          <MessagesSquare size={20} className="text-purple-400/50" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Ask anything about this solution — the AI will answer based on its
            analysis above.
          </p>
        </div>
      )}

      {messages.map((m, i) => (
        <ChatBubble key={i} role={m.role} content={m.content} />
      ))}

      {streaming && <ChatBubble role="ai" content={streaming} streaming />}

      {loading && !streaming && (
        <div className="mr-auto inline-flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-[13px] text-muted-foreground">
          <Loader2 size={13} className="animate-spin" />
          Thinking…
        </div>
      )}
    </div>
  );
}
