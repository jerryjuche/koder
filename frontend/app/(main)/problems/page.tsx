"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  List,
  Circle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { LanguageLogo, type Language } from "@/components/LanguageLogo";
import { fetchProblems } from "@/lib/api";
import type { Problem } from "@/lib/types";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 18;

const diffMeta: Record<number, { label: string; color: string; bar: string }> = {
  1: { label: "Beginner", color: "text-emerald-400", bar: "bg-emerald-500" },
  2: { label: "Easy", color: "text-sky-400", bar: "bg-sky-500" },
  3: { label: "Medium", color: "text-amber-400", bar: "bg-amber-500" },
  4: { label: "Hard", color: "text-orange-400", bar: "bg-orange-500" },
  5: { label: "Expert", color: "text-purple-400", bar: "bg-purple-500" },
};

const difficultyOptions = [
  { value: "all" as const, label: "All Levels" },
  { value: 1 as const, label: "Beginner" },
  { value: 2 as const, label: "Easy" },
  { value: 3 as const, label: "Medium" },
  { value: 4 as const, label: "Hard" },
  { value: 5 as const, label: "Expert" },
];

type SolvedFilter = "all" | "solved" | "unsolved";
type DifficultyFilter = "all" | 1 | 2 | 3 | 4 | 5;
type LangFilter = "all" | "go" | "python";

export default function ProblemsPage() {
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [langFilter, setLangFilter] = useState<LangFilter>("all");
  const [solvedFilter, setSolvedFilter] = useState<SolvedFilter>("unsolved");
  const [diffFilter, setDiffFilter] = useState<DifficultyFilter>("all");
  const [xpMin, setXpMin] = useState("");
  const [xpMax, setXpMax] = useState("");

  useEffect(() => {
    fetchProblems().then((res) => {
      if (res.success) setAllProblems(res.data || []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let list = allProblems;

    if (langFilter !== "all") {
      list = list.filter((p) => {
        if (!p.language_versions) return false;
        const spec = p.language_versions[langFilter];
        return spec && spec.func_name && spec.func_name.length > 0;
      });
    }

    if (solvedFilter === "solved") {
      list = list.filter((p) => p.solved);
    } else if (solvedFilter === "unsolved") {
      list = list.filter((p) => !p.solved);
    }

    if (diffFilter !== "all") {
      list = list.filter((p) => p.difficulty === diffFilter);
    }

    if (xpMin !== "") {
      const min = parseInt(xpMin, 10);
      if (!isNaN(min)) list = list.filter((p) => p.xpReward >= min);
    }
    if (xpMax !== "") {
      const max = parseInt(xpMax, 10);
      if (!isNaN(max)) list = list.filter((p) => p.xpReward <= max);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.module?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [allProblems, langFilter, solvedFilter, diffFilter, xpMin, xpMax, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const activeFilterCount =
    (solvedFilter !== "all" ? 1 : 0) +
    (diffFilter !== "all" ? 1 : 0) +
    (xpMin !== "" || xpMax !== "" ? 1 : 0);

  function resetFilters() {
    setSolvedFilter("unsolved");
    setDiffFilter("all");
    setXpMin("");
    setXpMax("");
    setSearchQuery("");
    setCurrentPage(1);
  }

  const solvedCount = useMemo(() => {
    if (langFilter === "all") return allProblems.filter((p) => p.solved).length;
    return allProblems.filter((p) => {
      if (!p.language_versions) return false;
      const spec = p.language_versions[langFilter];
      return spec && spec.func_name && spec.func_name.length > 0 && p.solved;
    }).length;
  }, [allProblems, langFilter]);

  const unsolvedCount = useMemo(() => {
    if (langFilter === "all") return allProblems.filter((p) => !p.solved).length;
    return allProblems.filter((p) => {
      if (!p.language_versions) return false;
      const spec = p.language_versions[langFilter];
      return spec && spec.func_name && spec.func_name.length > 0 && !p.solved;
    }).length;
  }, [allProblems, langFilter]);

  const filterSidebar = (
    <div className="space-y-1">
      {/* Section: Status */}
      <div className="px-3 pb-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/50">
          Status
        </span>
      </div>

      <button
        onClick={() => { setSolvedFilter("all"); setCurrentPage(1); }}
        className={cn(
          "group flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          solvedFilter === "all"
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
        )}
      >
        <span className={cn(
          "flex items-center justify-center w-5 h-5 rounded-md transition-colors",
          solvedFilter === "all"
            ? "text-sidebar-primary"
            : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60",
        )}>
          <List size={16} />
        </span>
        <span className="flex-1 text-left">All</span>
        <span className="text-[11px] font-medium tabular-nums text-sidebar-foreground/40">
          {allProblems.length}
        </span>
      </button>

      <button
        onClick={() => { setSolvedFilter("unsolved"); setCurrentPage(1); }}
        className={cn(
          "group flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          solvedFilter === "unsolved"
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
        )}
      >
        <span className={cn(
          "flex items-center justify-center w-5 h-5 rounded-md transition-colors",
          solvedFilter === "unsolved"
            ? "text-sidebar-primary"
            : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60",
        )}>
          <Circle size={16} />
        </span>
        <span className="flex-1 text-left">Unsolved</span>
        <span className="text-[11px] font-medium tabular-nums text-sidebar-foreground/40">
          {unsolvedCount}
        </span>
      </button>

      <button
        onClick={() => { setSolvedFilter("solved"); setCurrentPage(1); }}
        className={cn(
          "group flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          solvedFilter === "solved"
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
        )}
      >
        <span className={cn(
          "flex items-center justify-center w-5 h-5 rounded-md transition-colors",
          solvedFilter === "solved"
            ? "text-emerald-400"
            : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60",
        )}>
          <CheckCircle2 size={16} />
        </span>
        <span className="flex-1 text-left">Solved</span>
        <span className="text-[11px] font-medium tabular-nums text-sidebar-foreground/40">
          {solvedCount}
        </span>
      </button>

      {/* Divider */}
      <div className="my-3 mx-3 h-px bg-sidebar-border" />

      {/* Section: Difficulty */}
      <div className="px-3 pb-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/50">
          Difficulty
        </span>
      </div>

      {difficultyOptions.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => { setDiffFilter(opt.value); setCurrentPage(1); }}
          className={cn(
            "group flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            diffFilter === opt.value
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
          )}
        >
          <span className={cn(
            "w-2 h-2 rounded-full shrink-0 transition-colors",
            opt.value === "all"
              ? "bg-sidebar-foreground/30"
              : diffMeta[opt.value].bar,
            diffFilter === opt.value ? "ring-2 ring-sidebar-ring ring-offset-1 ring-offset-sidebar" : "",
          )} />
          <span className="flex-1 text-left">{opt.label}</span>
        </button>
      ))}

      {/* Divider */}
      <div className="my-3 mx-3 h-px bg-sidebar-border" />

      {/* Section: XP Range */}
      <div className="px-3 pb-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/50">
          XP Range
        </span>
      </div>

      <div className="px-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={xpMin}
            onChange={(e) => { setXpMin(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-1.5 rounded-md border border-sidebar-border bg-sidebar-accent/30 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:outline-none focus:border-sidebar-ring/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-sidebar-foreground/30 text-sm">—</span>
          <input
            type="number"
            placeholder="Max"
            value={xpMax}
            onChange={(e) => { setXpMax(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-1.5 rounded-md border border-sidebar-border bg-sidebar-accent/30 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:outline-none focus:border-sidebar-ring/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      {/* Reset */}
      {activeFilterCount > 0 && (
        <>
          <div className="my-3 mx-3 h-px bg-sidebar-border" />
          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground rounded-lg hover:bg-sidebar-accent/50 transition-colors"
          >
            <span className="text-sidebar-foreground/30">×</span> Clear all filters
          </button>
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 py-6">
        <div className="h-7 w-56 bg-sidebar-accent rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-sidebar-accent rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-8 py-6">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-24 rounded-xl border border-sidebar-border bg-sidebar p-4 shadow-sm">
          {filterSidebar}
        </div>
      </aside>

      {/* Mobile filter overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border p-5 overflow-y-auto animate-in slide-in-from-left">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-semibold text-sidebar-foreground">Filters</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>
            {filterSidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Problems</h1>
            <span className="text-sm text-muted-foreground/50 font-mono tabular-nums">
              {filtered.length} problem{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search problems..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card/50 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
              aria-label="Toggle filters"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4h12M4 8h8M6 12h4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Language filter tabs */}
        <div className="flex items-center gap-1 bg-card border border-border/60 rounded-xl p-1 w-fit shadow-sm">
          {(["all", "go", "python"] as LangFilter[]).map((lang) => (
            <button
              key={lang}
              onClick={() => { setLangFilter(lang); setCurrentPage(1); }}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                langFilter === lang
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {lang !== "all" && <LanguageLogo language={lang} size={14} />}
              {lang === "all" ? "All" : lang}
            </button>
          ))}
        </div>

        {/* Problem grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((problem, i) => {
            const d = problem.difficulty as keyof typeof diffMeta;
            const meta = diffMeta[d] || diffMeta[3];
            const langs = problem.language_versions
              ? Object.entries(problem.language_versions)
                  .filter(([_, spec]) => spec.func_name)
                  .map(([lang]) => lang as Language)
              : [];

            return (
              <Link
                key={problem.id}
                href={`/problems/${problem.slug}`}
                className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
              >
                <div
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 h-full flex flex-col rounded-xl border",
                    "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5",
                    "bg-card",
                    problem.solved
                      ? "border-emerald-500/20 hover:border-emerald-500/40"
                      : "border-border hover:border-primary/20",
                  )}
                >
                  {/* Top accent bar */}
                  <div
                    className={cn(
                      "h-0.5 w-full transition-colors duration-300",
                      problem.solved ? "bg-emerald-500" : meta.bar,
                    )}
                  />

                  <div className="flex items-start justify-between p-4 pb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-mono text-muted-foreground/25 font-semibold tabular-nums">
                        #{String(i + 1 + (safePage - 1) * ITEMS_PER_PAGE).padStart(3, "0")}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider",
                          meta.color,
                          `border-${meta.color.split("-")[1]}-500/20`,
                        )}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {langs.length > 0 && (
                      <div className="flex items-center gap-1">
                        {langs.map((lang) => (
                          <div
                            key={lang}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-border/40 bg-background/60"
                          >
                            <LanguageLogo language={lang} size={14} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="px-4 pb-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug mb-1.5 line-clamp-2">
                      {problem.title}
                    </h3>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2 mb-3">
                      {problem.statement?.replace(/<[^>]*>/g, "").slice(0, 120)}
                    </p>

                    <div className="mt-auto flex items-center gap-3 text-xs">
                      {problem.xpReward > 0 && (
                        <span className="inline-flex items-center gap-1 font-semibold text-primary/80">
                          <Zap size={12} className="text-primary/60" />
                          {problem.xpReward} XP
                        </span>
                      )}
                      {problem.solved && (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 size={12} />
                          Solved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {paginated.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-xl bg-sidebar-accent flex items-center justify-center mb-4">
              <Search size={20} className="text-muted-foreground/50" />
            </div>
            <p className="text-base font-medium text-foreground/80">No problems found</p>
            <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm">
              No problems match your current filters. Try adjusting your search criteria.
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 pb-4">
            <span className="text-sm text-muted-foreground/50 tabular-nums">
              Page {safePage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(safePage - 1)}
                disabled={safePage <= 1}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card border border-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(safePage + 1)}
                disabled={safePage >= totalPages}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card border border-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
