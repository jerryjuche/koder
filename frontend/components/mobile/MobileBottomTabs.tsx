"use client";

import React from "react";
import {
  FileText,
  Code2,
  Terminal,
  Lightbulb,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TestResult, ExecutionResult } from "@/lib/types";
import { deriveOutputState } from "@/lib/mobile-workspace";

export type MobileTab = "problem" | "code" | "output" | "hints" | "more";

interface MobileBottomTabsProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  results: TestResult[] | null;
  execution: ExecutionResult | null;
  errorMsg: string | null;
  hintsViewed: number;
  submitting?: boolean;
}

export default function MobileBottomTabs({
  activeTab,
  onSelectTab,
  results,
  execution,
  errorMsg,
  hintsViewed,
  submitting = false,
}: MobileBottomTabsProps) {
  // Shared derivation — keep in sync with MobileOutputTab via deriveOutputState
  const { hasResults, allPassed, hasError } = deriveOutputState(
    results,
    execution,
    errorMsg,
  );

  const tabs: {
    id: MobileTab;
    label: string;
    icon: React.ElementType;
    badge?: React.ReactNode;
  }[] = [
    {
      id: "problem",
      label: "Problem",
      icon: FileText,
    },
    {
      id: "code",
      label: "Code",
      icon: Code2,
    },
    {
      id: "output",
      label: "Output",
      icon: Terminal,
      badge: submitting ? (
        <span className="block size-2 rounded-full bg-brand-muted-gold animate-pulse" />
      ) : hasResults ? (
        <span
          className={cn(
            "block size-2 rounded-full",
            allPassed ? "bg-brand-success" : "bg-brand-error",
          )}
        />
      ) : hasError ? (
        <span className="block size-2 rounded-full bg-brand-warning" />
      ) : null,
    },
    {
      id: "hints",
      label: "Hints",
      icon: Lightbulb,
      // Solid gold on charcoal, not gold-on-gold-tint: the 9px translucent
      // pill it replaced sat around 2.8:1, below the floor for any text size.
      badge:
        hintsViewed > 0 ? (
          <span className="flex min-w-4 h-4 items-center justify-center rounded-full bg-brand-muted-gold px-1 text-micro font-bold text-brand-charcoal-base tabular-nums">
            {hintsViewed}
          </span>
        ) : null,
    },
    {
      id: "more",
      label: "More",
      icon: MoreHorizontal,
    },
  ];

  return (
    /* The safe-area inset lives on this outer element, which has NO height of
       its own, so the inset grows the bar instead of eating into it. The
       previous `h-16 pb-[env(safe-area-inset-bottom)]` put both on one element;
       under `box-sizing: border-box` that subtracts the 34px home-indicator
       inset from the 64px height, leaving a 30px content box for a 32px
       icon+label stack — which squashed on exactly the notched devices it was
       meant to protect. */
    <nav className="shrink-0 z-30 select-none border-t border-brand-charcoal-border bg-brand-charcoal-chrome pb-[env(safe-area-inset-bottom,0px)]">
      <div className="h-14 grid grid-cols-5 items-stretch">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                // 78 x 56 per destination — comfortably past the 44px minimum.
                "relative flex flex-col items-center justify-center gap-1 transition-colors duration-150 active:scale-[0.97] cursor-pointer",
                isActive
                  ? "text-brand-muted-gold"
                  : "text-brand-offwhite-muted hover:text-brand-offwhite",
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-brand-muted-gold" />
              )}

              <span className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.2 : 2} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </span>

              <span
                className={cn(
                  "text-micro leading-none",
                  isActive ? "font-bold" : "font-medium",
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
