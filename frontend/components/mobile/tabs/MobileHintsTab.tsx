"use client";

import React from "react";
import { Lightbulb, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileHintsTabProps {
  hints?: string[];
  hintsOpen: boolean[];
  setHintsOpen: React.Dispatch<React.SetStateAction<boolean[]>>;
}

export default function MobileHintsTab({
  hints,
  hintsOpen,
  setHintsOpen,
}: MobileHintsTabProps) {
  const activeHints = hints && hints.length > 0 ? hints : [];
  const unlockedCount = hintsOpen.filter(Boolean).length;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar pb-6 bg-brand-charcoal-base">
      {/* Header Info */}
      <div className="bg-brand-charcoal-card/80 border border-brand-charcoal-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand-muted-gold font-bold text-sm">
            <Lightbulb size={18} />
            <span>Progressive Hints</span>
          </div>
          <span className="text-xs text-brand-offwhite-muted bg-brand-charcoal-base px-2.5 py-1 rounded-md border border-brand-charcoal-border font-medium">
            {unlockedCount} of {activeHints.length} viewed
          </span>
        </div>
        <p className="text-xs text-brand-offwhite-muted mt-2 leading-relaxed">
          Hints are ordered from subtle nudges to structural solution guidance.
          Try thinking through each hint before unlocking the next one.
        </p>
      </div>

      {/* Empty State — no fabricated fallback hints */}
      {activeHints.length === 0 && (
        <div className="rounded-xl border border-brand-charcoal-border bg-brand-charcoal-card/50 p-6 text-center">
          <Lightbulb size={24} className="mx-auto text-brand-offwhite-muted/50 mb-2" />
          <p className="text-xs text-brand-offwhite-muted">
            No hints are available for this problem yet.
          </p>
        </div>
      )}

      {/* Hints Accordion */}
      <div className="space-y-3">
        {activeHints.map((hintText, idx) => {
          const isOpen = hintsOpen[idx];
          const isLocked = idx > 0 && !hintsOpen[idx - 1];

          return (
            <div
              key={idx}
              className={cn(
                "rounded-xl border transition-all duration-200 overflow-hidden",
                isOpen
                  ? "border-brand-muted-gold/60 bg-brand-muted-gold/5 shadow-sm"
                  : isLocked
                    ? "border-brand-charcoal-border/40 bg-brand-charcoal-base/40 opacity-60"
                    : "border-brand-charcoal-border bg-brand-charcoal-card/70 hover:border-brand-charcoal-border/80",
              )}
            >
              <button
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (isLocked) return;
                  const newOpen = [...hintsOpen];
                  newOpen[idx] = !newOpen[idx];
                  setHintsOpen(newOpen);
                }}
                className="w-full p-4 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
                      isOpen
                        ? "bg-brand-muted-gold/20 text-brand-muted-gold"
                        : isLocked
                          ? "bg-brand-charcoal-border/30 text-brand-offwhite-muted"
                          : "bg-brand-charcoal-card text-brand-offwhite",
                    )}
                  >
                    {isLocked ? <Lock size={13} /> : idx + 1}
                  </div>

                  <div>
                    <span
                      className={cn(
                        "text-xs font-bold block",
                        isOpen
                          ? "text-brand-muted-gold"
                          : isLocked
                            ? "text-brand-offwhite-muted"
                            : "text-brand-offwhite",
                      )}
                    >
                      Hint {idx + 1}
                    </span>
                    {!isOpen && !isLocked && (
                      <span className="text-[10px] text-brand-offwhite-muted/70 block">
                        Tap to reveal
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-[10px] text-brand-offwhite-muted/50 block">
                        Unlock Hint {idx} first
                      </span>
                    )}
                  </div>
                </div>

                {isLocked ? (
                  <Lock size={14} className="text-brand-offwhite-muted/40" />
                ) : isOpen ? (
                  <ChevronUp size={16} className="text-brand-muted-gold" />
                ) : (
                  <ChevronDown size={16} className="text-brand-offwhite-muted" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-brand-muted-gold/20 text-xs text-brand-offwhite/90 leading-relaxed font-sans animate-in fade-in duration-200">
                  {hintText}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
