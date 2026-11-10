"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export type ExplainErrorInfo = {
  message: string;
  details?: string;
  code?: string;
};

export function AnalysisError({
  error,
  onRetry,
}: {
  error: ExplainErrorInfo;
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
        className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
      >
        <RotateCcw size={12} />
        Retry
      </button>
    </div>
  );
}
