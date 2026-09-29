"use client";

import React from "react";
import Link from "next/link";
import {
  Home,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Bug,
  Edit3,
  BookOpen,
  Info,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { Problem } from "@/lib/types";
import { getDifficultyColor, getDifficultyLabel } from "@/lib/utils";
import { toast } from "@/lib/toast";

interface MobileMoreTabProps {
  problem: Problem;
  nextProblem: Problem | null;
  returnTo: string;
  handleReset: () => void;
  onOpenReport: () => void;
  onOpenEdit?: () => void;
  isAdmin: boolean;
}

export default function MobileMoreTab({
  problem,
  nextProblem,
  returnTo,
  handleReset,
  onOpenReport,
  onOpenEdit,
  isAdmin,
}: MobileMoreTabProps) {
  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success("Problem link copied to clipboard");
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 custom-scrollbar pb-6 bg-brand-charcoal-base">
      {/* Navigation Group */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-widest text-brand-offwhite-muted">
          Navigation
        </div>
        <div className="rounded-xl border border-brand-charcoal-border bg-brand-charcoal-card/80 overflow-hidden divide-y divide-brand-charcoal-border/50">
          <Link
            href="/home"
            className="flex items-center justify-between p-3.5 hover:bg-brand-charcoal-hover transition-colors text-brand-offwhite"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Home size={16} />
              </div>
              <div>
                <span className="text-xs font-semibold block">Dashboard</span>
                <span className="text-[10px] text-brand-offwhite-muted block">
                  Return to your learning overview
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-brand-offwhite-muted" />
          </Link>

          <Link
            href={returnTo}
            className="flex items-center justify-between p-3.5 hover:bg-brand-charcoal-hover transition-colors text-brand-offwhite"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-charcoal-base text-brand-offwhite-muted flex items-center justify-center">
                <ChevronLeft size={16} />
              </div>
              <div>
                <span className="text-xs font-semibold block">Back to List</span>
                <span className="text-[10px] text-brand-offwhite-muted block">
                  Return to problem catalog
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-brand-offwhite-muted" />
          </Link>

          {nextProblem && (
            <Link
              href={`/problems/${nextProblem.slug}`}
              className="flex items-center justify-between p-3.5 hover:bg-brand-charcoal-hover transition-colors text-brand-offwhite"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-brand-muted-gold/10 text-brand-muted-gold flex items-center justify-center shrink-0">
                  <BookOpen size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold block truncate">
                    Next: {nextProblem.title}
                  </span>
                  <span className="text-[10px] text-brand-muted-gold font-medium block">
                    +{nextProblem.xpReward} XP available
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-brand-offwhite-muted shrink-0" />
            </Link>
          )}
        </div>
      </div>

      {/* Problem Actions Group */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-widest text-brand-offwhite-muted">
          Workspace Actions
        </div>
        <div className="rounded-xl border border-brand-charcoal-border bg-brand-charcoal-card/80 overflow-hidden divide-y divide-brand-charcoal-border/50">
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-between p-3.5 hover:bg-brand-charcoal-hover transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-charcoal-base text-brand-offwhite-muted flex items-center justify-center">
                <RotateCcw size={16} />
              </div>
              <div>
                <span className="text-xs font-semibold text-brand-offwhite block">
                  Reset Code
                </span>
                <span className="text-[10px] text-brand-offwhite-muted block">
                  Revert to original boilerplate scaffold
                </span>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="w-full flex items-center justify-between p-3.5 hover:bg-brand-charcoal-hover transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-charcoal-base text-brand-offwhite-muted flex items-center justify-center">
                <Share2 size={16} />
              </div>
              <div>
                <span className="text-xs font-semibold text-brand-offwhite block">
                  Share Problem
                </span>
                <span className="text-[10px] text-brand-offwhite-muted block">
                  Copy direct problem link to clipboard
                </span>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenReport}
            className="w-full flex items-center justify-between p-3.5 hover:bg-brand-charcoal-hover transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-error/10 text-brand-error flex items-center justify-center">
                <Bug size={16} />
              </div>
              <div>
                <span className="text-xs font-semibold text-brand-offwhite block">
                  Report Bug
                </span>
                <span className="text-[10px] text-brand-offwhite-muted block">
                  Report an issue with test cases or statement
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-brand-offwhite-muted" />
          </button>

          {isAdmin && onOpenEdit && (
            <button
              type="button"
              onClick={onOpenEdit}
              className="w-full flex items-center justify-between p-3.5 hover:bg-brand-charcoal-hover transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-accent-teal/10 text-brand-accent-teal flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-brand-offwhite block">
                    Edit Problem (Admin)
                  </span>
                  <span className="text-[10px] text-brand-offwhite-muted block">
                    Update statement, difficulty, or constraints
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-brand-offwhite-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Problem Summary Card */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-widest text-brand-offwhite-muted flex items-center gap-1.5">
          <Info size={12} /> Problem Details
        </div>
        <div className="rounded-xl border border-brand-charcoal-border bg-brand-charcoal-card/50 p-4 space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-brand-charcoal-border/40">
            <span className="text-brand-offwhite-muted">Module</span>
            <span className="font-semibold text-brand-offwhite">{problem.module}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-brand-charcoal-border/40">
            <span className="text-brand-offwhite-muted">Difficulty</span>
            <span className={getDifficultyColor(problem.difficulty)}>
              {getDifficultyLabel(problem.difficulty)}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-brand-charcoal-border/40">
            <span className="text-brand-offwhite-muted">Slug</span>
            <span className="font-mono text-brand-offwhite-muted">{problem.slug}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-brand-offwhite-muted">Reward</span>
            <span className="font-bold text-brand-muted-gold">+{problem.xpReward} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
