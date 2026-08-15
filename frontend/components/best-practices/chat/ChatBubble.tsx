"use client";

import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

export function ChatBubble({
  role,
  content,
  streaming,
}: {
  role: "user" | "ai";
  content: string;
  streaming?: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-[88%] rounded-xl px-3 py-2 text-[13px] leading-relaxed",
        role === "user"
          ? "ml-auto border border-primary/40 bg-primary/10 text-brand-offwhite"
          : "mr-auto border border-border/60 bg-muted/40 text-brand-offwhite/90",
      )}
    >
      {role === "ai" ? (
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
      ) : (
        content
      )}
      {streaming && (
        <span className="ml-0.5 inline-block h-3.5 w-[3px] animate-pulse rounded-sm bg-purple-300 align-middle" />
      )}
    </div>
  );
}
