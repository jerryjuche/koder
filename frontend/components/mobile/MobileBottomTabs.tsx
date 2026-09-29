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
        <span className="w-2 h-2 rounded-full bg-brand-muted-gold animate-pulse ring-2 ring-brand-charcoal-card" />
      ) : hasResults ? (
        <span
          className={cn(
            "w-2 h-2 rounded-full ring-2 ring-brand-charcoal-card",
            allPassed ? "bg-brand-success" : "bg-brand-error",
          )}
        />
      ) : hasError ? (
        <span className="w-2 h-2 rounded-full bg-brand-warning ring-2 ring-brand-charcoal-card" />
      ) : null,
    },
    {
      id: "hints",
      label: "Hints",
      icon: Lightbulb,
      badge:
        hintsViewed > 0 ? (
          <span className="text-[9px] font-bold px-1 rounded-full bg-brand-muted-gold/20 text-brand-muted-gold leading-tight">
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
    <nav className="h-16 pb-[env(safe-area-inset-bottom,0px)] border-t border-brand-charcoal-border bg-[#101010] grid grid-cols-5 items-stretch shrink-0 z-30 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-95 relative cursor-pointer",
              isActive
                ? "text-brand-muted-gold"
                : "text-brand-offwhite-muted/70 hover:text-brand-offwhite",
            )}
          >
            {/* Active Top Bar Indicator */}
            {isActive && (
              <span className="absolute top-0 inset-x-3 h-0.5 bg-brand-muted-gold rounded-full" />
            )}

            <div className="relative">
              <Icon size={18} className={cn(isActive && "stroke-[2.2]")} />
              {tab.badge && (
                <div className="absolute -top-1 -right-2 flex items-center justify-center">
                  {tab.badge}
                </div>
              )}
            </div>

            <span
              className={cn(
                "text-[10px] tracking-tight leading-none",
                isActive ? "font-bold text-brand-muted-gold" : "font-medium",
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
