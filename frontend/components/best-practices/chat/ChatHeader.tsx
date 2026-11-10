"use client";

import { Bot, X } from "lucide-react";

export function ChatHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-600/15">
        <Bot size={16} className="text-purple-300" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold leading-tight text-foreground">
          AI follow-up
        </div>
        <div className="truncate text-[11px] text-muted-foreground">{title}</div>
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
  );
}
