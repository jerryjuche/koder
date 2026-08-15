"use client";

import { MessageSquare } from "lucide-react";

export function AnalysisFooter({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <div className="space-y-3 pt-1">
      <div className="divider">Have a question?</div>
      <button
        type="button"
        onClick={onOpenChat}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
      >
        <MessageSquare size={13} />
        Ask a follow-up in chat
      </button>
    </div>
  );
}
