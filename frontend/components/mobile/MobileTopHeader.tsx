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
    <header className="min-h-12 pt-[env(safe-area-inset-top,0px)] border-b border-brand-charcoal-border bg-brand-charcoal-card/95 backdrop-blur-md shrink-0 flex items-center justify-between px-2.5 z-30">
      {/* Left: Back & Home buttons */}
      <div className="flex items-center gap-1 min-w-0 flex-1">
        <Link
          href={returnTo}
          className="flex h-10 w-10 -my-1 items-center justify-center rounded-lg text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover active:bg-brand-charcoal-border transition-colors shrink-0"
          title="Back"
        >
          <ChevronLeft size={20} />
        </Link>

        <Link
          href="/home"
          className="flex h-10 w-10 -my-1 items-center justify-center rounded-lg text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover transition-colors shrink-0"
          title="Dashboard"
        >
          <Home size={16} />
        </Link>

        <div className="w-px h-4 bg-brand-charcoal-border shrink-0 mx-1" />

        {/* Problem Title & Module */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-xs text-brand-offwhite truncate">
            {problem.title}
          </span>
          {problem.solved && (
            <span title="Solved" className="inline-flex items-center shrink-0">
              <CheckCircle2
                size={13}
                className="text-brand-success"
              />
            </span>
          )}
        </div>
      </div>

      {/* Right: XP badge & Admin Edit */}
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {isAdmin && onOpenEdit && (
          <button
            onClick={onOpenEdit}
            className="flex h-10 w-10 -my-1 items-center justify-center rounded-md text-brand-offwhite-muted hover:text-brand-accent-teal hover:bg-brand-charcoal-hover transition-colors"
            title="Edit problem"
          >
            <Edit3 size={16} />
          </button>
        )}

        <div className="flex items-center gap-1 text-brand-muted-gold text-[11px] font-bold bg-brand-muted-gold/10 px-2 py-0.5 rounded-md border border-brand-muted-gold/20">
          <svg width="8" height="10" viewBox="0 0 12 16" fill="currentColor">
            <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
          </svg>
          +{problem.xpReward}
        </div>
      </div>
    </header>
  );
}
