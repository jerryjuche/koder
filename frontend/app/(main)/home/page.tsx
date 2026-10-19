"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Code,
  Trophy,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import GoogleLinkBanner from "@/components/GoogleLinkBanner";
import ProblemCard from "@/components/problems/ProblemCard";
import { fetchProblems, fetchUser, fetchBestPractices, likeSubmission, unlikeSubmission, fetchModuleLocks, fetchModuleMeta, fetchLeaderboard, ModuleMeta } from "@/lib/api";
import { clearCache } from "@/lib/cache";
import { Problem, User, CommunitySolution } from "@/lib/types";
import {
  cn,
  getDifficultyLabel,
} from "@/lib/utils";
import {
  Card,
} from "@/components/ui/card";
import { toast } from "@/lib/toast";
import ModuleCards from "@/components/dashboard/ModuleCards";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LanguageSegmented, { type LanguageFilterValue } from "@/components/dashboard/LanguageSegmented";
import { BestPracticesSection } from "@/components/best-practices";

export default function Dashboard() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [lockedModules, setLockedModules] = useState<Set<string>>(new Set());
  const [moduleMeta, setModuleMeta] = useState<Record<string, { display_name: string; is_pinned: boolean }>>({});

  const [bestPractices, setBestPractices] = useState<CommunitySolution[]>([]);
  const [bpMine, setBpMine] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const p = new URLSearchParams(window.location.search).get("bp_mine");
    return p === "1" || p === "true";
  });
  const [loading, setLoading] = useState(true);
  // Global rank for the header. Resolved from the cached top-100 leaderboard:
  // `value` is the exact rank, `capped` means the user sits below the window.
  const [rank, setRank] = useState<{ value: number | null; capped: boolean }>({
    value: null,
    capped: false,
  });

  // View state
  const [activeTab, setActiveTab] = useState<"problems" | "best-practices">("problems");
  const [selectedModule, setSelectedModule] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("module") || null;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "solved" | "unsolved">("all");
  const [languageFilter, setLanguageFilter] = useState<string>(() => {
    if (typeof window === "undefined") return "all";
    const tabParam = new URLSearchParams(window.location.search).get("tab");
    return tabParam === "go" || tabParam === "python" ? tabParam : "all";
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 18;

  // Sync state with browser back/forward
  useEffect(() => {
    const handlePop = () => {
      const params = new URLSearchParams(window.location.search);
      const mod = params.get("module");
      const tab = params.get("tab");
      setSelectedModule(mod);
      setLanguageFilter(tab === "go" || tab === "python" ? tab : "all");
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  // Persist best-practices scope (?bp_mine=) in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (bpMine) params.set("bp_mine", "1");
    else params.delete("bp_mine");
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [bpMine]);

  useEffect(() => {
    let mounted = true;
    const loadData = () => {
      setLoading(true);
      const langParam = new URLSearchParams(window.location.search).get("tab");
      const lang = langParam === "go" || langParam === "python" ? langParam : undefined;
      Promise.all([fetchProblems(lang), fetchUser(), fetchBestPractices(20, bpMine), fetchModuleLocks(), fetchModuleMeta(), fetchLeaderboard("all")]).then(
        ([probRes, userRes, bpRes, locksRes, metaRes, lbRes]) => {
          if (!mounted) return;
          if (probRes.success) {
            setProblems(probRes.data || []);
            sessionStorage.setItem("koder_all_problems", JSON.stringify(probRes.data));
          }
          if (userRes.success) setUser(userRes.data);
          if (bpRes.success) setBestPractices(bpRes.data || []);
          if (lbRes.success && lbRes.data) {
            const me = userRes.success ? userRes.data : null;
            const mine = me
              ? lbRes.data.find(
                  (entry) =>
                    entry.user &&
                    (entry.user.id === me.id ||
                      (!!me.username && entry.user.username === me.username)),
                )
              : undefined;
            setRank({
              value: mine?.rank ?? null,
              capped: !mine && lbRes.data.length >= 100,
            });
          }
          if (locksRes.success && locksRes.data) {
            setLockedModules(new Set(locksRes.data.map((l) => l.module_name)));
          }
          if (metaRes.success && metaRes.data) {
            const metaMap: Record<string, { display_name: string; is_pinned: boolean }> = {};
            for (const m of metaRes.data) {
              metaMap[m.module_name] = { display_name: m.display_name, is_pinned: m.is_pinned };
            }
            setModuleMeta(metaMap);
          }
          setLoading(false);
        }
      );
    };

    loadData();

    // Debounced reload on user-updated — clear stale cache, then fetch fresh data
    let debounceTimer: ReturnType<typeof setTimeout>;
    const handleUserUpdated = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        clearCache("/problems" + (languageFilter !== "all" ? `?language=${languageFilter}` : ""));
        clearCache("/me");
        clearCache("/best-practices");
        loadData();
      }, 300);
    };

    window.addEventListener("user-updated", handleUserUpdated);

    // Refresh moduleMeta when returning from another tab (e.g. admin renamed/pinned modules)
    const handleFocus = () => {
      clearCache("/me/module-meta");
      fetchModuleMeta().then((res) => {
        if (mounted && res.success && res.data) {
          const metaMap: Record<string, { display_name: string; is_pinned: boolean }> = {};
          for (const m of res.data) {
            metaMap[m.module_name] = { display_name: m.display_name, is_pinned: m.is_pinned };
          }
          setModuleMeta(metaMap);
        }
      });
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      mounted = false;
      window.removeEventListener("user-updated", handleUserUpdated);
      window.removeEventListener("focus", handleFocus);
      clearTimeout(debounceTimer);
    };
  }, [languageFilter, bpMine]);

  const handleLike = async (id: string, currentlyLiked: boolean) => {
    const original = [...bestPractices];
    setBestPractices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, has_liked: !currentlyLiked, likes: currentlyLiked ? s.likes - 1 : s.likes + 1 } : s
      )
    );

    try {
      const res = currentlyLiked ? await unlikeSubmission(id) : await likeSubmission(id);
      if (!res.success) throw new Error("Failed to update like");
      if (bpMine && currentlyLiked) {
        setBestPractices((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err: any) {
      setBestPractices(original);
      toast.error({
        title: "Like failed",
        description: err.message || "Could not update like status.",
      });
    }
  };

  // One handler for every language control on the page: URL state, cache
  // invalidation and refetch stay identical wherever the filter is rendered.
  const handleLanguageChange = useCallback((lang: LanguageFilterValue) => {
    setLanguageFilter(lang);
    setCurrentPage(1);
    const params = new URLSearchParams(window.location.search);
    if (lang === "all") params.delete("tab");
    else params.set("tab", lang);
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.pushState({}, "", newUrl);
    clearCache("/problems" + (lang !== "all" ? `?language=${lang}` : ""));
    setLoading(true);
    fetchProblems(lang !== "all" ? lang : undefined).then((res) => {
      if (res.success) setProblems(res.data || []);
      setLoading(false);
    });
  }, []);

  const modules = useMemo(
    () => Array.from(new Set([...problems.map((p) => p.module), ...Array.from(lockedModules)])).sort(),
    [problems, lockedModules]
  );

  const moduleProgress = useMemo(() => {
    const progress: Record<string, { solved: number; total: number }> = {};
    for (const p of problems) {
      if (!progress[p.module]) progress[p.module] = { solved: 0, total: 0 };
      progress[p.module].total++;
      if (p.solved) progress[p.module].solved++;
    }
    return progress;
  }, [problems]);

  const difficulties = ["All", "Beginner", "Easy", "Medium", "Hard", "Expert"];

  const filteredProblems = useMemo(() => problems
    .filter((p) => {
      if (p.locked) return false;
      if (selectedModule && p.module !== selectedModule) return false;
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
      if (difficultyFilter !== "All" && getDifficultyLabel(p.difficulty) !== difficultyFilter) return false;
      if (statusFilter === "solved" && !p.solved) return false;
      if (statusFilter === "unsolved" && p.solved) return false;
      return true;
    })
    .sort((a, b) => Number(a.solved) - Number(b.solved)), [problems, selectedModule, searchQuery, difficultyFilter, statusFilter]);

  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedProblems = filteredProblems.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const visibleSolved = problems.filter((p) => p.solved).length;
  const totalSolved = user?.solvedCount ?? visibleSolved;

  // Reset to page 1 when filters change
  const filtersKey = `${selectedModule}-${searchQuery}-${difficultyFilter}-${statusFilter}`;
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);
  if (filtersKey !== prevFiltersKey) {
    setPrevFiltersKey(filtersKey);
    setCurrentPage(1);
  }

  const handleSelectModule = useCallback((mod: string) => {
    setSelectedModule(mod);
    setSearchQuery("");
    setDifficultyFilter("All");
    setStatusFilter("all");
    const params = new URLSearchParams(window.location.search);
    params.set("module", mod);
    window.history.pushState({}, "", `?${params.toString()}`);
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const displayName = user?.name?.split(" ")[0] || user?.username || "there";

  // Highest incomplete module for "Continue learning" (UI only — uses existing progress)
  const continueModule = (() => {
    let best: { mod: string; solved: number; total: number; pct: number } | null = null;
    for (const mod of modules) {
      if (lockedModules.has(mod)) continue;
      const p = moduleProgress[mod];
      if (!p || p.total === 0) continue;
      if (p.solved >= p.total) continue;
      const pct = Math.round((p.solved / p.total) * 100);
      if (!best || pct > best.pct || (pct === best.pct && p.solved > best.solved)) {
        best = { mod, solved: p.solved, total: p.total, pct };
      }
    }
    return best;
  })();

  const moduleDisplayName = (slug: string) =>
    moduleMeta[slug]?.display_name ||
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const showTopicCards = !selectedModule || lockedModules.has(selectedModule);

  return (
    <div className="max-w-7xl mx-auto space-y-4 pt-3 pb-6 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <DashboardHeader
        greeting={greeting}
        name={displayName}
        level={user?.level ?? 1}
        xp={user?.xp ?? 0}
        solved={totalSolved}
        streak={user?.streak ?? 0}
        rank={rank.value}
        rankCapped={rank.capped}
        showGreeting={showTopicCards}
      />

      <GoogleLinkBanner />

      {/* View switcher — in-page tabs: the selected tab owns the panel below.
          Distinct from the filter segments further down so the two never read
          as the same kind of control. */}
      <div
        role="tablist"
        aria-label="Dashboard view"
        className="flex items-center gap-6 border-b border-border"
      >
        {([
          { id: "problems", label: "Problem Set", icon: Code, beta: false },
          { id: "best-practices", label: "Best Practices", icon: Trophy, beta: true },
        ] as const).map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "group relative -mb-px flex items-center gap-2 rounded-t pb-2.5 pt-1 text-sm font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                active ? "text-foreground" : "text-brand-offwhite-muted hover:text-foreground",
              )}
            >
              <Icon
                size={15}
                aria-hidden="true"
                className={cn(
                  "transition-colors",
                  active
                    ? "text-brand-muted-gold"
                    : "text-brand-offwhite-muted/70 group-hover:text-foreground",
                )}
              />
              {tab.label}
              {tab.beta && (
                <span className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider text-brand-offwhite-muted">
                  Beta
                </span>
              )}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-muted-gold"
                />
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "problems" ? (
        <>
          {showTopicCards ? (
            /* ── Topic list (Prototype 1 stack) ── */
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Search + filters — two rows, two dimensions: the segmented
                  control changes language, the toggle filters by status. */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search
                    size={15}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-offwhite-muted"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search problems, modules…"
                    aria-label="Search problems and modules"
                    className="h-10 w-full rounded-xl border border-border bg-brand-charcoal-card pl-9 pr-10 text-sm font-medium text-foreground transition-colors placeholder:text-brand-offwhite-muted/80 hover:border-white/[0.12] focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 [&::-webkit-search-cancel-button]:appearance-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-brand-offwhite-muted transition-colors hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <LanguageSegmented value={languageFilter} onChange={handleLanguageChange} />
                </div>
              </div>

              {/* Continue learning — one compact row; the whole card is the
                  Resume affordance, so no second gold button competes with it */}
              {continueModule && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Continue learning</h2>
                    <span className="text-xs font-bold tabular-nums text-brand-muted-gold">
                      {continueModule.pct}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectModule(continueModule.mod)}
                    className="group w-full rounded-2xl border border-border bg-brand-charcoal-card px-3 py-3 text-left transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
                      >
                        <BookOpen size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {moduleDisplayName(continueModule.mod)}
                        </span>
                        <span className="mt-0.5 block text-xs tabular-nums text-brand-offwhite-muted">
                          {continueModule.solved} of {continueModule.total} solved
                        </span>
                        <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                          <span
                            className="block h-full rounded-full bg-primary transition-all"
                            style={{ width: `${continueModule.pct}%` }}
                          />
                        </span>
                      </span>
                      <ChevronRight
                        size={16}
                        aria-hidden="true"
                        className="shrink-0 text-brand-offwhite-muted transition-colors group-hover:text-brand-muted-gold"
                      />
                    </div>
                  </button>
                </div>
              )}

              {/* Modules */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Modules</h2>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {modules.length} total
                  </span>
                </div>
              {loading ? (
                <div className="grid grid-cols-1 min-[560px]:grid-cols-2 nav:grid-cols-3 xl:grid-cols-4 gap-5">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="h-56 animate-pulse" />
                  ))}
                </div>
              ) : (
                <ModuleCards
                  modules={modules}
                  moduleMeta={moduleMeta}
                  moduleProgress={moduleProgress}
                  lockedModules={lockedModules}
                  onSelect={handleSelectModule}
                />
              )}
              </div>
            </div>

          ) : (
            /* ── Filtered Problems ── */
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Back + module title */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => {
                    setSelectedModule(null);
                    const params = new URLSearchParams(window.location.search);
                    params.delete("module");
                    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
                    window.history.pushState({}, "", newUrl);
                  }}
                  className="shrink-0 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden min-[380px]:inline">Topics</span>
                </button>
                <div className="w-px h-5 bg-border shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-foreground truncate leading-tight">
                    {selectedModule ? moduleDisplayName(selectedModule) : ""}
                  </h2>
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    {moduleProgress[selectedModule!]?.solved || 0} of {moduleProgress[selectedModule!]?.total || 0} solved
                  </p>
                </div>
              </div>

              {/* Language filter — same control as the topics view */}
              <LanguageSegmented value={languageFilter} onChange={handleLanguageChange} />

              {/* Filters (no module dropdown) */}
              <Card className="p-3 flex flex-col gap-2.5">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search problems or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="appearance-none bg-background border border-border rounded-lg pl-4 pr-10 py-2.5 text-sm text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    >
                      {difficulties.map((d) => (
                        <option key={d} value={d}>{d === "All" ? "All Levels" : d}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                  </div>

                  <div className="flex items-center bg-background border border-border rounded-lg p-1">
                    {(["all", "solved", "unsolved"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                          statusFilter === status
                            ? "bg-muted text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <p className="text-sm text-muted-foreground font-medium">
                Showing {paginatedProblems.length} of {filteredProblems.length} problems
                {totalPages > 1 && (
                  <span className="text-muted-foreground/50"> &middot; Page {safePage} of {totalPages}</span>
                )}
              </p>

              {/* Problem Grid */}
              {loading ? (
                <div className="grid grid-cols-1 min-[560px]:grid-cols-2 nav:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="h-56 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 min-[560px]:grid-cols-2 nav:grid-cols-3 gap-3">
                  {filteredProblems.length === 0 ? (
                    <div className="col-span-full">
                      <Card className="p-10 text-center border-dashed border-white/10 bg-card/50">
                        <p className="text-muted-foreground">No problems found for the current filters.</p>
                      </Card>
                    </div>
                  ) : (
                    paginatedProblems.map((problem, i) => (
                      <ProblemCard
                        key={problem.id}
                        problem={problem}
                        position={i + 1}
                        delay={i * 50}
                        metrics
                      />
                    ))
                  )}
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 pt-4 pb-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={safePage <= 1}
                  className="p-2 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  aria-label="First page"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(safePage - 1)}
                  disabled={safePage <= 1}
                  className="p-2 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    const distance = Math.abs(p - safePage);
                    return distance === 0 || distance === 1 || distance === 2 || p === 1 || p === totalPages;
                  })
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground/40 text-sm">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={cn(
                          "min-w-[36px] h-9 rounded-lg border text-sm font-medium transition-all",
                          p === safePage
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50",
                        )}
                      >
                        {p}
                      </button>
                    ),
                  )}

                <button
                  onClick={() => setCurrentPage(safePage + 1)}
                  disabled={safePage >= totalPages}
                  className="p-2 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safePage >= totalPages}
                  className="p-2 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  aria-label="Last page"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <BestPracticesSection
          solutions={bestPractices}
          loading={loading}
          mine={bpMine}
          onMineChange={setBpMine}
          onLike={handleLike}
        />
      )}
    </div>
  );
}
