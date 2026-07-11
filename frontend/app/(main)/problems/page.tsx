"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { LanguageLogo } from "@/components/LanguageLogo";
import { fetchProblems } from "@/lib/api";
import { clearCache } from "@/lib/cache";
import { Problem } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

const ITEMS_PER_PAGE = 18;

export default function ProblemsPage() {
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState<"all" | "go" | "python">(
    () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab") as "all" | "go" | "python" | null;
        if (tab && ["all", "go", "python"].includes(tab)) return tab;
      }
      return "all";
    }
  );
  const [prevFilter, setPrevFilter] = useState(languageFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  if (languageFilter !== prevFilter) {
    setPrevFilter(languageFilter);
    setLoading(true);
  }

  useEffect(() => {
    const lang = languageFilter !== "all" ? languageFilter : undefined;
    fetchProblems(lang).then((res) => {
      if (res.success) setAllProblems(res.data || []);
      setLoading(false);
    });
  }, [languageFilter]);

  const filtered = useMemo(() => {
    let list = allProblems;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || p.module?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allProblems, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Problems</h1>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search problems..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Language Filter Tabs */}
      <div className="flex items-center gap-1 bg-card border border-border/60 rounded-lg p-1 w-fit">
        {(["all", "go", "python"] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => {
              setLanguageFilter(lang);
              setCurrentPage(1);
              const params = new URLSearchParams(window.location.search);
              if (lang === "all") {
                params.delete("tab");
              } else {
                params.set("tab", lang);
              }
              const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
              window.history.replaceState({}, "", newUrl);
              clearCache("/problems" + (lang !== "all" ? `?language=${lang}` : ""));
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
              languageFilter === lang
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            {lang !== "all" && <LanguageLogo language={lang} size={14} />}
            {lang === "all" ? "All" : lang}
          </button>
        ))}
      </div>

      {/* Problem Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map((problem, i) => {
          const d = problem.difficulty as keyof typeof diffColor;
          const langs = problem.language_versions
            ? Object.entries(problem.language_versions)
                .filter(([_, spec]) => spec.func_name)
                .map(([lang]) => lang)
            : [];

          return (
            <Link
              key={problem.id}
              href={`/problems/${problem.slug}`}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
            >
              <Card
                className={cn(
                  "group relative overflow-hidden transition-all duration-300 h-full flex flex-col rounded-xl border hover:border-primary/30",
                  "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/6",
                  "animate-in fade-in slide-in-from-bottom-2",
                  problem.solved && "border-emerald-500/30 hover:border-emerald-500/50",
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

                <div className={cn(
                  "absolute top-0 left-0 right-0 h-0.5 transition-colors duration-300 z-10",
                  problem.solved ? "bg-emerald-500" : "bg-transparent",
                )} />

                <CardHeader className="flex-row items-start justify-between p-5 pb-3 space-y-0 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground/30 font-semibold tabular-nums">
                      #{String(i + 1 + (safePage - 1) * ITEMS_PER_PAGE).padStart(3, "0")}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                      diffColor[d] || diffColor[3],
                    )}>
                      {diffLabel[d] || "Medium"}
                    </span>
                  </div>

                  {/* Language icons */}
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
                </CardHeader>

                <CardContent className="p-5 pt-0 flex-1 flex flex-col relative z-10">
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
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {paginated.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No problems found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={safePage <= 1}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="First page"
          >
            <ChevronLeft size={16} className="opacity-50" />
            <ChevronLeft size={16} className="-ml-2.5" />
          </button>
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
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={safePage >= totalPages}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Last page"
          >
            <ChevronRight size={16} className="opacity-50" />
            <ChevronRight size={16} className="-ml-2.5" />
          </button>
        </div>
      )}
    </div>
  );
}
