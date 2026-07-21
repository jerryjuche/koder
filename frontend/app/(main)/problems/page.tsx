"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  List,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { LanguageLogo, type Language } from "@/components/LanguageLogo";
import { fetchProblems } from "@/lib/api";
import { Problem } from "@/lib/types";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 18;

const diffColor: Record<number, string> = {
  1: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  2: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  3: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  4: "text-orange-400 bg-orange-500/10 border-orange-500/25",
  5: "text-purple-400 bg-purple-500/10 border-purple-500/25",
};

const diffLabel: Record<number, string> = {
  1: "Beginner", 2: "Easy", 3: "Medium", 4: "Hard", 5: "Expert",
};

const diffDot: Record<number, string> = {
  1: "bg-emerald-500",
  2: "bg-sky-500",
  3: "bg-amber-500",
  4: "bg-orange-500",
  5: "bg-purple-500",
};

type SolvedFilter = "all" | "solved" | "unsolved";
type DifficultyFilter = "all" | 1 | 2 | 3 | 4 | 5;
type LangFilter = "all" | "go" | "python";

export default function ProblemsPage() {
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
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

  const solvedCount = useMemo(
    () => allProblems.filter((p) => p.solved).length,
    [allProblems],
  );

  const filterSidebar = (
    <div className="space-y-1">
      {/* Status */}
      <div className="px-1 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Status
        </span>
      </div>

      <button
        onClick={() => { setSolvedFilter("all"); setCurrentPage(1); }}
        className={cn(
          "group flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
          solvedFilter === "all"
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
        )}
      >
        <span className={cn(
          "flex items-center justify-center w-4 h-4 rounded transition-colors shrink-0",
          solvedFilter === "all" ? "text-sidebar-primary" : "text-sidebar-foreground/40",
        )}>
          <List size={14} />
        </span>
        <span className="flex-1 text-left">All</span>
        <span className="text-[11px] tabular-nums text-sidebar-foreground/40">{allProblems.length}</span>
      </button>

      <button
        onClick={() => { setSolvedFilter("unsolved"); setCurrentPage(1); }}
        className={cn(
          "group flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
          solvedFilter === "unsolved"
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
        )}
      >
        <span className={cn(
          "flex items-center justify-center w-4 h-4 rounded transition-colors shrink-0",
          solvedFilter === "unsolved" ? "text-sidebar-primary" : "text-sidebar-foreground/40",
        )}>
          <Circle size={14} />
        </span>
        <span className="flex-1 text-left">Unsolved</span>
        <span className="text-[11px] tabular-nums text-sidebar-foreground/40">{allProblems.length - solvedCount}</span>
      </button>

      <button
        onClick={() => { setSolvedFilter("solved"); setCurrentPage(1); }}
        className={cn(
          "group flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
          solvedFilter === "solved"
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
        )}
      >
        <span className={cn(
          "flex items-center justify-center w-4 h-4 rounded transition-colors shrink-0",
          solvedFilter === "solved" ? "text-emerald-400" : "text-sidebar-foreground/40",
        )}>
          <CheckCircle2 size={14} />
        </span>
        <span className="flex-1 text-left">Solved</span>
        <span className="text-[11px] tabular-nums text-sidebar-foreground/40">{solvedCount}</span>
      </button>

      <div className="my-2 mx-1 h-px bg-sidebar-border" />

      {/* Difficulty */}
      <div className="px-1 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Difficulty
        </span>
      </div>

      <button
        onClick={() => { setDiffFilter("all"); setCurrentPage(1); }}
        className={cn(
          "group flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
          diffFilter === "all"
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-sidebar-foreground/30 shrink-0" />
        <span>All Levels</span>
      </button>

      {([1, 2, 3, 4, 5] as const).map((d) => (
        <button
          key={d}
          onClick={() => { setDiffFilter(d); setCurrentPage(1); }}
          className={cn(
            "group flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
            diffFilter === d
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
          )}
        >
          <span className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            diffDot[d],
          )} />
          <span>{diffLabel[d]}</span>
        </button>
      ))}

      <div className="my-2 mx-1 h-px bg-sidebar-border" />

      {/* XP Range */}
      <div className="px-1 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          XP Range
        </span>
      </div>

      <div className="px-1">
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            placeholder="Min"
            value={xpMin}
            onChange={(e) => { setXpMin(e.target.value); setCurrentPage(1); }}
            className="w-full min-w-0 px-2.5 py-1.5 rounded-md border border-sidebar-border bg-sidebar-accent/30 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:outline-none focus:border-sidebar-ring/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-sidebar-foreground/30 text-xs">—</span>
          <input
            type="number"
            placeholder="Max"
            value={xpMax}
            onChange={(e) => { setXpMax(e.target.value); setCurrentPage(1); }}
            className="w-full min-w-0 px-2.5 py-1.5 rounded-md border border-sidebar-border bg-sidebar-accent/30 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:outline-none focus:border-sidebar-ring/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      {activeFilterCount > 0 && (
        <>
          <div className="my-2 mx-1 h-px bg-sidebar-border" />
          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-1 w-full px-2.5 py-1.5 text-xs font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground rounded-lg hover:bg-sidebar-accent/50 transition-colors"
          >
            <X size={12} /> Clear filters
          </button>
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-24 rounded-xl border border-sidebar-border bg-sidebar p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-semibold text-sidebar-foreground flex items-center gap-1.5">
              <Filter size={13} /> Filters
            </h3>
            {activeFilterCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sidebar-primary/10 text-sidebar-primary">
                {activeFilterCount}
              </span>
            )}
          </div>
          {filterSidebar}
        </div>
      </aside>

      {/* Mobile filter overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border p-5 overflow-y-auto animate-in slide-in-from-left">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-sidebar-foreground flex items-center gap-2">
                <Filter size={15} /> Filters
              </h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {filterSidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Top bar: title, search, filter toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Problems</h1>
            <span className="text-xs text-muted-foreground/60 font-mono tabular-nums">
              {filtered.length} problem{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search problems..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle filters"
            >
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Language filter tabs */}
        <div className="flex items-center gap-1 bg-card border border-border/60 rounded-lg p-1 w-fit">
          {(["all", "go", "python"] as LangFilter[]).map((lang) => (
            <button
              key={lang}
              onClick={() => { setLangFilter(lang); setCurrentPage(1); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                langFilter === lang
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
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
            const d = problem.difficulty as keyof typeof diffColor;
            const langs = problem.language_versions
              ? Object.entries(problem.language_versions)
                  .filter(([_, spec]) => spec.func_name)
                  .map(([lang]) => lang as Language)
              : [];

            return (
              <Link
                key={problem.id}
                href={`/problems/${problem.slug}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
              >
                <div
                  className={cn(
                    "group relative overflow-hidden transition-all duration-300 h-full flex flex-col rounded-xl border hover:border-primary/30",
                    "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/6",
                    "animate-in fade-in slide-in-from-bottom-2",
                    problem.solved && "border-emerald-500/30 hover:border-emerald-500/50",
                    "bg-card",
                  )}
                >
                  <div className="absolute inset-0 pointer-events-none">
                    <Image
                      src="/ChatGPT%20Image%20Jul%209%2C%202026%2C%2009_07_32%20PM.png"
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background" />
                  </div>

                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-0.5 transition-colors duration-300 z-10",
                      problem.solved ? "bg-emerald-500" : "bg-transparent",
                    )}
                  />

                  <div className="flex flex-row items-start justify-between p-5 pb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground/30 font-semibold tabular-nums">
                        #{String(i + 1 + (safePage - 1) * ITEMS_PER_PAGE).padStart(3, "0")}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                          diffColor[d] || diffColor[3],
                        )}
                      >
                        {diffLabel[d] || "Medium"}
                      </span>
                    </div>

                    {langs.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        {langs.map((lang) => (
                          <div
                            key={lang}
                            className="w-[34px] h-[34px] flex items-center justify-center rounded-lg border border-border/50 bg-background/40 backdrop-blur-sm"
                          >
                            <LanguageLogo language={lang} size={18} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="px-5 pb-5 flex-1 flex flex-col relative z-10">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
                      {problem.title}
                    </h3>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2 mb-3">
                      {problem.statement?.replace(/<[^>]*>/g, "").slice(0, 120)}
                    </p>

                    <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
                      {problem.xpReward > 0 && (
                        <span className="font-semibold text-primary">
                          {problem.xpReward} XP
                        </span>
                      )}
                      {problem.solved && (
                        <span className="text-emerald-400 font-medium">Solved</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {paginated.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">No problems found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage(safePage - 1)}
              disabled={safePage <= 1}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-sm text-muted-foreground px-4 tabular-nums">
              Page {safePage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
