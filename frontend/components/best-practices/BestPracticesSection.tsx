"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, SearchX, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { CommunitySolution } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { BestPracticesHeader } from "./BestPracticesHeader";
import { BestPracticesToolbar, BpLang, BpSort } from "./BestPracticesToolbar";
import { SolutionList } from "./SolutionList";
import { BestPracticesSkeleton } from "./BestPracticesSkeleton";

const byTop = (a: CommunitySolution, b: CommunitySolution) =>
  b.likes - a.likes || b.created_at.localeCompare(a.created_at);

const byFastest = (a: CommunitySolution, b: CommunitySolution) =>
  a.runtime_ms - b.runtime_ms;

const byNewest = (a: CommunitySolution, b: CommunitySolution) =>
  b.created_at.localeCompare(a.created_at);

const sorters: Record<BpSort, (a: CommunitySolution, b: CommunitySolution) => number> = {
  top: byTop,
  fastest: byFastest,
  newest: byNewest,
};

export function BestPracticesSection({
  solutions,
  loading,
  mine,
  onMineChange,
  onLike,
}: {
  solutions: CommunitySolution[];
  loading: boolean;
  mine: boolean;
  onMineChange: (m: boolean) => void;
  onLike: (id: string, currentlyLiked: boolean) => void;
}) {
  const [lang, setLang] = useState<BpLang>(() => {
    if (typeof window === "undefined") return "all";
    const p = new URLSearchParams(window.location.search).get("bp_lang");
    return p === "go" || p === "python" ? p : "all";
  });
  const [sort, setSort] = useState<BpSort>(() => {
    if (typeof window === "undefined") return "top";
    const p = new URLSearchParams(window.location.search).get("bp_sort");
    return p === "fastest" || p === "newest" ? p : "top";
  });
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return solutions.filter((s) => {
      if (lang !== "all" && s.language !== lang) return false;
      if (!q) return true;
      return (
        s.user_name.toLowerCase().includes(q) ||
        (s.problem_slug || "").toLowerCase().includes(q) ||
        (s.problem_title || "").toLowerCase().includes(q)
      );
    });
  }, [solutions, lang, query]);

  const ranks = useMemo(() => {
    const map = new Map<string, number>();
    [...filtered].sort(byTop).forEach((s, i) => map.set(s.id, i + 1));
    return map;
  }, [filtered]);

  const ordered = useMemo(() => {
    return [...filtered].sort(sorters[sort]);
  }, [filtered, sort]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (lang === "all") params.delete("bp_lang");
    else params.set("bp_lang", lang);
    if (sort === "top") params.delete("bp_sort");
    else params.set("bp_sort", sort);
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [lang, sort]);

  const handleLangChange = useCallback((l: BpLang) => setLang(l), []);
  const handleSortChange = useCallback((s: BpSort) => setSort(s), []);
  const handleQueryChange = useCallback((q: string) => setQuery(q), []);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <BestPracticesHeader solutions={solutions} mine={mine} />

      <BestPracticesToolbar
        mine={mine}
        onMineChange={onMineChange}
        lang={lang}
        onLangChange={handleLangChange}
        sort={sort}
        onSortChange={handleSortChange}
        query={query}
        onQueryChange={handleQueryChange}
        resultCount={filtered.length}
      />

      {loading ? (
        <BestPracticesSkeleton />
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-12 text-center border-dashed border-white/10 bg-card/50">
            {solutions.length === 0 && mine ? (
              <>
                <Heart className="mx-auto mb-4 text-rose-500/20" size={48} />
                <h3 className="text-lg font-bold text-foreground mb-2">No liked solutions yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Like solutions you find in the community to save them here — switch to the All
                  view to browse and start building your library.
                </p>
              </>
            ) : solutions.length === 0 ? (
              <>
                <Trophy className="mx-auto mb-4 text-muted-foreground/20" size={48} />
                <h3 className="text-lg font-bold text-foreground mb-2">No Best Practices Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Solve problems and get likes to feature here — great solutions rise to the top.
                </p>
              </>
            ) : (
              <>
                <SearchX className="mx-auto mb-4 text-muted-foreground/20" size={48} />
                <h3 className="text-lg font-bold text-foreground mb-2">No solutions match</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Try a different language, sort order, or search term.
                </p>
              </>
            )}
          </Card>
        </motion.div>
      ) : (
        <SolutionList solutions={ordered} ranks={ranks} onLike={onLike} />
      )}
    </div>
  );
}
