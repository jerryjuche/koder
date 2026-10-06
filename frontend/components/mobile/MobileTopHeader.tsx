"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, Home, CheckCircle2, Edit3 } from "lucide-react";
import { Problem } from "@/lib/types";

interface MobileTopHeaderProps {
  problem: Problem;
  returnTo: string;
  nextProblem: Problem | null;
  isAdmin: boolean;
  onOpenEdit?: () => void;
}

export default function MobileTopHeader({
  problem,
  returnTo,
  nextProblem,
  isAdmin,
  onOpenEdit,
}: MobileTopHeaderProps) {
  return (
    /* `min-h` + `pt` is the additive pattern (the bar grows with the inset),
       which is why the header never had the squash bug the tab bar did. */
    <header className="min-h-14 pt-[env(safe-area-inset-top,0px)] border-b border-brand-charcoal-border bg-brand-charcoal-chrome shrink-0 flex items-center justify-between px-2.5 z-30">
      {/* Left: Back & Home. 44px targets, centred by `items-center` — the old
          `h-10 w-10 -my-1` faked centring with a negative margin that fought the
          header's own min-height. */}
      <div className="flex items-center gap-1 min-w-0 flex-1">
        <Link
          href={returnTo}
          aria-label="Back to problem list"
          className="flex size-11 items-center justify-center rounded-lg text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover active:bg-brand-charcoal-border transition-colors shrink-0"
        >
          <ChevronLeft size={22} />
        </Link>

        <Link
          href="/home"
          aria-label="Dashboard"
          className="flex size-11 items-center justify-center rounded-lg text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover transition-colors shrink-0"
        >
          <Home size={18} />
        </Link>

        <div className="w-px h-5 bg-brand-charcoal-border shrink-0 mx-0.5" />

        <div className="flex flex-col justify-center min-w-0">
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-sm text-brand-offwhite truncate">
              {problem.title}
            </span>
            {problem.solved && (
              <CheckCircle2
                size={13}
                className="text-brand-success shrink-0"
                aria-label="Solved"
              />
            )}
          </span>
          {problem.module && (
            <span className="text-micro font-medium uppercase tracking-wider text-brand-offwhite-muted truncate leading-tight">
              {problem.module}
            </span>
          )}
        </div>
      </div>

      {/* Right: XP badge & Admin Edit */}
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {isAdmin && onOpenEdit && (
          <button
            type="button"
            onClick={onOpenEdit}
            aria-label="Edit problem"
            className="flex size-11 items-center justify-center rounded-lg text-brand-offwhite-muted hover:text-brand-accent-teal hover:bg-brand-charcoal-hover transition-colors"
          >
            <Edit3 size={18} />
          </button>
        )}

        <div className="flex items-center gap-1 text-brand-muted-gold text-xs font-bold bg-brand-muted-gold/10 px-2 h-7 rounded-md border border-brand-muted-gold/25">
          <svg width="8" height="10" viewBox="0 0 12 16" fill="currentColor" aria-hidden="true">
            <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
          </svg>
          <span className="tabular-nums">+{problem.xpReward}</span>
        </div>
      </div>
    </header>
  );
}
