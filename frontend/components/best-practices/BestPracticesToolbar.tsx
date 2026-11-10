"use client";

import { ArrowDownWideNarrow, Heart, Search, Trophy, Users } from "lucide-react";
import { LanguageLogo } from "@/components/LanguageLogo";
import { cn } from "@/lib/utils";

export type BpLang = "all" | "go" | "python";
export type BpSort = "top" | "fastest" | "newest";

const langs: { value: BpLang; label: string }[] = [
  { value: "all", label: "All" },
  { value: "go", label: "Go" },
  { value: "python", label: "Python" },
];

const sorts: { value: BpSort; label: string }[] = [
  { value: "top", label: "Top rated" },
  { value: "fastest", label: "Fastest" },
  { value: "newest", label: "Newest" },
];

export function BestPracticesToolbar({
  mine,
  onMineChange,
  lang,
  onLangChange,
  sort,
  onSortChange,
  query,
  onQueryChange,
  resultCount,
}: {
  mine: boolean;
  onMineChange: (m: boolean) => void;
  lang: BpLang;
  onLangChange: (l: BpLang) => void;
  sort: BpSort;
  onSortChange: (s: BpSort) => void;
  query: string;
  onQueryChange: (q: string) => void;
  resultCount: number;
}) {
  return (
    <div className="space-y-2.5">
      {/* Row 1: scope + language */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-0.5 bg-card border border-border/60 rounded-xl p-1">
          <button
            onClick={() => onMineChange(false)}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
              !mine
                ? "bg-muted text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Users size={14} />
            All
          </button>
          <button
            onClick={() => onMineChange(true)}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
              mine
                ? "bg-muted text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Heart size={14} />
            Mine
          </button>
        </div>

        <div className="flex items-center gap-0.5 bg-card border border-border/60 rounded-xl p-1">
          {langs.map((l) => (
            <button
              key={l.value}
              onClick={() => onLangChange(l.value)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-semibold transition-all capitalize flex items-center gap-1.5",
                lang === l.value
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.value !== "all" && (
                <LanguageLogo language={l.value as "go" | "python"} size={12} />
              )}
              {l.value === "all" && <Trophy size={12} />}
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: sort + search */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="flex items-center gap-0.5 bg-card border border-border/60 rounded-xl p-1 w-fit">
          <ArrowDownWideNarrow size={14} className="ml-2 text-muted-foreground shrink-0" />
          {sorts.map((s) => (
            <button
              key={s.value}
              onClick={() => onSortChange(s.value)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                sort === s.value
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-0">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search author or problem"
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {resultCount >= 0 && (
        <p className="text-xs text-muted-foreground tabular-nums">
          {resultCount} solution{resultCount === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
