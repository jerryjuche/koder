"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  Flame,
  Code,
  Trophy,
  ArrowLeft,
  BookOpen,
  Zap,
  Hash,
  Play,
} from "lucide-react";
import { LanguageLogo } from "@/components/LanguageLogo";
import GoogleLinkBanner from "@/components/GoogleLinkBanner";
import ProblemCard from "@/components/problems/ProblemCard";
import { fetchProblems, fetchUser, fetchBestPractices, likeSubmission, unlikeSubmission, fetchModuleLocks, fetchModuleMeta, ModuleMeta } from "@/lib/api";
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
      Promise.all([fetchProblems(lang), fetchUser(), fetchBestPractices(20, bpMine), fetchModuleLocks(), fetchModuleMeta()]).then(
        ([probRes, userRes, bpRes, locksRes, metaRes]) => {
          if (!mounted) return;
          if (probRes.success) {
            setProblems(probRes.data || []);
            sessionStorage.setItem("koder_all_problems", JSON.stringify(probRes.data));
          }
          if (userRes.success) setUser(userRes.data);
          if (bpRes.success) setBestPractices(bpRes.data || []);
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
    <div className="max-w-7xl mx-auto space-y-8 pt-4 pb-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      {/* ── Mobile-first dashboard header (Prototype 1) ── */}
      <div className="space-y-5">
        {/* Greeting + level */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{greeting}</p>
            <h1 className="text-2xl nav:text-3xl font-bold tracking-tight text-foreground truncate">
              {displayName}
            </h1>
          </div>
          {user && (
            <div className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/25 px-3 py-1.5 text-primary">
              <Zap size={14} className="fill-primary/20" />
              <span className="text-xs font-bold tabular-nums">Lv. {user.level}</span>
            </div>
          )}
        </div>

        {/* 2×2 stat tiles */}
        <div className="grid grid-cols-2 nav:grid-cols-4 gap-2.5">
          <div className="rounded-xl bg-brand-charcoal-card border border-border/60 px-3.5 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap size={14} className="text-primary" />
              <span className="text-micro font-medium uppercase tracking-wider text-muted-foreground">Total XP</span>
            </div>
            <p className="text-lg font-bold tabular-nums text-foreground leading-none">
              {(user?.xp ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-brand-charcoal-card border border-border/60 px-3.5 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Flame size={14} className="text-orange-400" />
              <span className="text-micro font-medium uppercase tracking-wider text-muted-foreground">Day streak</span>
            </div>
            <p className="text-lg font-bold tabular-nums text-foreground leading-none">
              {user?.streak ?? 0}
            </p>
          </div>
          <div className="rounded-xl bg-brand-charcoal-card border border-border/60 px-3.5 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-micro font-medium uppercase tracking-wider text-muted-foreground">Solved</span>
            </div>
            <p className="text-lg font-bold tabular-nums text-foreground leading-none">
              {totalSolved}
            </p>
          </div>
          <div className="rounded-xl bg-brand-charcoal-card border border-border/60 px-3.5 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Hash size={14} className="text-primary" />
              <span className="text-micro font-medium uppercase tracking-wider text-muted-foreground">Rank</span>
            </div>
            <p className="text-lg font-bold tabular-nums text-foreground leading-none">—</p>
          </div>
        </div>
      </div>

      <GoogleLinkBanner />

      {/* Tabs — full on desktop; compact on mobile */}
      <div className="flex items-center gap-6 border-b border-border">
        <button
          onClick={() => setActiveTab("problems")}
          className={cn(
            "pb-3 text-sm font-bold transition-colors relative flex items-center gap-2",
            activeTab === "problems" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Code size={16} className={cn(activeTab === "problems" && "text-primary")} />
          Problem Set
          {activeTab === "problems" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("best-practices")}
          className={cn(
            "pb-3 text-sm font-bold transition-colors relative flex items-center gap-2",
            activeTab === "best-practices"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Trophy size={16} className={cn(activeTab === "best-practices" && "text-primary")} />
          Best Practices
          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Beta
          </span>
          {activeTab === "best-practices" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
          )}
        </button>
      </div>

      {activeTab === "problems" ? (
        <>
          {showTopicCards ? (
            /* ── Topic list (Prototype 1 stack) ── */
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Search + language/status chips */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search problems, modules..."
                      className="w-full h-11 rounded-xl bg-brand-charcoal-card border border-border/60 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                  {([
                    { id: "all", label: "All" },
                    { id: "go", label: "Go" },
                    { id: "python", label: "Python" },
                  ] as const).map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => {
                        const lang = chip.id;
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
                      }}
                      className={cn(
                        "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                        languageFilter === chip.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-brand-charcoal-card border border-border/60 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {chip.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setStatusFilter(statusFilter === "solved" ? "all" : "solved")}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                      statusFilter === "solved"
                        ? "bg-primary text-primary-foreground"
                        : "bg-brand-charcoal-card border border-border/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Solved
                  </button>
                </div>
              </div>

              {/* Continue learning */}
              {continueModule && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Continue learning</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectModule(continueModule.mod)}
                    className="w-full text-left rounded-2xl border border-border/60 bg-gradient-to-br from-teal-500/10 via-brand-charcoal-card to-brand-charcoal-card p-4 transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-400">
                        <BookOpen size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">
                          {moduleDisplayName(continueModule.mod)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {continueModule.solved} of {continueModule.total} solved
                        </p>
                        <div className="mt-2.5 flex items-center gap-3">
                          <div className="h-1.5 flex-1 rounded-full bg-muted/80 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${continueModule.pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold tabular-nums text-primary">
                            {continueModule.pct}%
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                        <Play size={12} className="fill-current" />
                        Resume
                      </span>
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
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Back button + module header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setSelectedModule(null);
                      const params = new URLSearchParams(window.location.search);
                      params.delete("module");
                      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
                      window.history.pushState({}, "", newUrl);
                    }}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    <ArrowLeft size={16} />
                    Back to topics
                  </button>
                  <div className="w-px h-5 bg-border" />
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{selectedModule}</h2>
                    <p className="text-xs text-muted-foreground">
                      {moduleProgress[selectedModule]?.solved || 0} / {moduleProgress[selectedModule]?.total || 0} solved
                    </p>
                  </div>
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
                      window.history.pushState({}, "", newUrl);
                      clearCache("/problems" + (lang !== "all" ? `?language=${lang}` : ""));
                      setLoading(true);
                      fetchProblems(lang !== "all" ? lang : undefined).then((res) => {
                        if (res.success) setProblems(res.data || []);
                        setLoading(false);
                      });
                    }}
                    className={cn(
                      "px-4 py-1.5 rounded text-sm font-medium transition-all capitalize flex items-center gap-1.5",
                      languageFilter === lang
                        ? "bg-muted text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {lang === "go" && <LanguageLogo language="go" size={16} />}
                    {lang === "python" && <LanguageLogo language="python" size={16} />}
                    {lang === "all" ? "All" : lang === "go" ? "Go" : "Python"}
                  </button>
                ))}
              </div>

              {/* Filters (no module dropdown) */}
              <Card className="p-4 flex flex-col lg:flex-row gap-4">
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
                <div className="flex items-center gap-3 flex-wrap">
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
                          "px-5 py-1.5 rounded text-sm font-medium transition-colors capitalize",
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
                <div className="grid grid-cols-1 min-[560px]:grid-cols-2 nav:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="h-56 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 min-[560px]:grid-cols-2 nav:grid-cols-3 gap-6">
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
