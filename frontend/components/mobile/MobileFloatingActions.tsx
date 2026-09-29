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
  return (
    <div className="shrink-0 px-3 py-2 bg-[#141414]/95 backdrop-blur-md border-t border-brand-charcoal-border flex items-center gap-2.5 z-20">
      {/* Test Button (Secondary) */}
      <button
        type="button"
        onClick={onTest}
        disabled={submitting || cooldown > 0}
        className="flex-1 h-11 rounded-xl border border-brand-charcoal-border bg-brand-charcoal-card hover:bg-brand-charcoal-hover active:bg-brand-charcoal-border text-brand-offwhite text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        {cooldown > 0 ? (
          <span className="font-mono text-brand-muted-gold font-bold">
            Wait {cooldown}s
          </span>
        ) : submitting ? (
          <div className="w-4 h-4 border-2 border-brand-charcoal-border border-t-brand-offwhite rounded-full animate-spin" />
        ) : (
          <Play size={14} fill="currentColor" className="text-brand-offwhite-muted" />
        )}
        <span>{cooldown > 0 ? "" : "Test Code"}</span>
      </button>

      {/* Submit Button (Primary) */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || cooldown > 0 || solved}
        className={cn(
          "flex-1 h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all",
          solved
            ? "bg-brand-success/15 text-brand-success border border-brand-success/30 cursor-not-allowed"
            : "bg-brand-muted-gold hover:bg-brand-muted-gold-dark active:scale-[0.98] text-brand-charcoal-base shadow-brand-muted-gold/10",
          (submitting || cooldown > 0) && "opacity-70",
        )}
      >
        {solved ? (
          <>
            <CheckCircle2 size={15} />
            <span>Solved</span>
          </>
        ) : cooldown > 0 ? (
          <span className="font-mono font-bold">{cooldown}s</span>
        ) : submitting ? (
          <>
            <div className="w-4 h-4 border-2 border-brand-charcoal-base/40 border-t-brand-charcoal-base rounded-full animate-spin" />
            <span>Grading...</span>
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
