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
    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
      <div className="flex items-center gap-1 bg-card border border-border/60 rounded-lg p-1 w-fit">
        <button
          onClick={() => onMineChange(false)}
          className={cn(
            "px-3.5 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5",
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
            "px-3.5 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5",
            mine
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Heart size={14} />
          Mine
        </button>
      </div>

      <div className="flex items-center gap-1 bg-card border border-border/60 rounded-lg p-1 w-fit">
        {langs.map((l) => (
          <button
            key={l.value}
            onClick={() => onLangChange(l.value)}
            className={cn(
              "px-3.5 py-1.5 rounded text-sm font-medium transition-all capitalize flex items-center gap-1.5",
              lang === l.value
                ? "bg-muted text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {l.value === "go" && <LanguageLogo language="go" size={14} />}
            {l.value === "python" && <LanguageLogo language="python" size={14} />}
            {l.value === "all" && <Trophy size={14} />}
            {l.label}
          </button>
        ))}
      </div>

      <div className="relative w-fit">
        <ArrowDownWideNarrow className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as BpSort)}
          aria-label="Sort solutions"
          className="appearance-none bg-card border border-border/60 rounded-lg pl-9 pr-9 py-2 text-sm text-foreground font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
        >
          {sorts.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="relative flex-1 lg:max-w-xs ml-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={15} />
        <input
          type="text"
          placeholder="Search author or problem..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full bg-card border border-border/60 rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <p className="text-xs text-muted-foreground font-medium shrink-0">
        {resultCount} {resultCount === 1 ? "solution" : "solutions"}
      </p>
    </div>
  );
}
