"use client";

import { LayoutGrid } from "lucide-react";
import { LanguageLogo } from "@/components/LanguageLogo";
import { cn } from "@/lib/utils";

export type LanguageFilterValue = "all" | "go" | "python";

const OPTIONS: { id: LanguageFilterValue; label: string }[] = [
  { id: "all", label: "All" },
  { id: "go", label: "Go" },
  { id: "python", label: "Python" },
];

interface LanguageSegmentedProps {
  value: string;
  onChange: (value: LanguageFilterValue) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Segmented control for the language filter.
 *
 * A segmented control — not tabs — because it changes how the same list is
 * presented without navigating anywhere (NN/g: tabs switch views, segments
 * adjust the current one). Each option carries an icon so the three segments
 * share one visual language, and the active tile uses a tinted fill plus weight
 * so the selection survives dark-mode contrast.
 */
export default function LanguageSegmented({
  value,
  onChange,
  className,
  ariaLabel = "Filter by language",
}: LanguageSegmentedProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-border bg-brand-charcoal-card p-1",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "inline-flex h-7 min-w-[58px] items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              active
                ? "bg-primary/15 text-primary ring-1 ring-primary/25"
                : "text-brand-offwhite-muted hover:bg-white/[0.04] hover:text-foreground",
            )}
          >
            {option.id === "all" ? (
              <LayoutGrid size={12} aria-hidden="true" />
            ) : (
              <LanguageLogo language={option.id} size={12} />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
