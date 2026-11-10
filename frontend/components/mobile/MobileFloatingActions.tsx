"use client";

import React from "react";
import { Play, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileFloatingActionsProps {
  onTest: () => void;
  onSubmit: () => void;
  submitting: boolean;
  cooldown: number;
  solved: boolean;
}

export default function MobileFloatingActions({
  onTest,
  onSubmit,
  submitting,
  cooldown,
  solved,
}: MobileFloatingActionsProps) {
  const locked = submitting || cooldown > 0;

  return (
    /* 48px row (py-0.5 + 44px button + 0.5). The previous `py-2` made it 60px
       and it rendered on all five tabs; MobileWorkspace now only mounts it on
       Code and Output, which is where Test/Submit can actually be acted on. */
    <div className="shrink-0 h-12 px-3 bg-brand-charcoal-base border-t border-brand-charcoal-border flex items-center gap-2.5 z-20">
      {/* Test Button (Secondary) */}
      <button
        type="button"
        onClick={onTest}
        disabled={locked}
        className="flex-1 h-11 rounded-xl border border-brand-charcoal-border bg-brand-charcoal-card hover:bg-brand-charcoal-hover active:bg-brand-charcoal-border text-brand-offwhite text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cooldown > 0 ? (
          <span className="font-mono text-brand-muted-gold font-bold tabular-nums">
            Wait {cooldown}s
          </span>
        ) : submitting ? (
          <>
            <span
              className="size-3.5 border-2 border-brand-charcoal-border border-t-brand-offwhite rounded-full animate-spin"
              aria-hidden="true"
            />
            <span>Running</span>
          </>
        ) : (
          <>
            <Play size={14} fill="currentColor" className="text-brand-offwhite-muted" />
            <span>Test code</span>
          </>
        )}
      </button>

      {/* Submit Button (Primary) */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={locked || solved}
        className={cn(
          "flex-1 h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-[transform,background-color]",
          solved
            ? "bg-brand-success/15 text-brand-success border border-brand-success/30 cursor-not-allowed"
            : "bg-brand-muted-gold hover:bg-brand-muted-gold-dark active:scale-[0.98] text-brand-charcoal-base",
          locked && !solved && "opacity-70",
        )}
      >
        {solved ? (
          <>
            <CheckCircle2 size={15} />
            <span>Solved</span>
          </>
        ) : cooldown > 0 ? (
          <span className="font-mono font-bold tabular-nums">{cooldown}s</span>
        ) : submitting ? (
          <>
            <span
              className="size-3.5 border-2 border-brand-charcoal-base/40 border-t-brand-charcoal-base rounded-full animate-spin"
              aria-hidden="true"
            />
            <span>Grading…</span>
          </>
        ) : (
          <>
            <Play size={14} fill="currentColor" />
            <span>Submit</span>
          </>
        )}
      </button>
    </div>
  );
}
