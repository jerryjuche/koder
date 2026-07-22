"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  Clock,
  Flame,
  BarChart2,
  Code,
  Heart,
  Trophy,
  ArrowLeft,
  BookOpen,
  FlaskConical,
} from "lucide-react";
import { LanguageLogo } from "@/components/LanguageLogo";
import GoogleLinkBanner from "@/components/GoogleLinkBanner";
import { fetchProblems, fetchUser, fetchBestPractices, likeSubmission, unlikeSubmission, fetchModuleLocks } from "@/lib/api";
import { clearCache } from "@/lib/cache";
import { Problem, User, CommunitySolution } from "@/lib/types";
import {
  cn,
  getDifficultyLabel,
} from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeSnippet } from "@/components/application/code-snippet";
import { toast } from "@/lib/toast";
import ModuleCards from "@/components/dashboard/ModuleCards";
import { ProfileHoverCard } from "@/components/profile/ProfileHoverCard";
import { Avatar } from "@/components/base/avatar/avatar";

export default function Dashboard() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [lockedModules, setLockedModules] = useState<Set<string>>(new Set());

  const [bestPractices, setBestPractices] = useState<CommunitySolution[]>([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [activeTab, setActiveTab] = useState<"problems" | "best-practices">("problems");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
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

  // Read module from URL search params after client-side mount (avoids hydration mismatch)
  useEffect(() => {
    const moduleParam = new URLSearchParams(window.location.search).get("module");
    if (moduleParam) setSelectedModule(moduleParam);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadData = () => {
      const langParam = new URLSearchParams(window.location.search).get("tab");
      const lang = langParam === "go" || langParam === "python" ? langParam : undefined;
      Promise.all([fetchProblems(lang), fetchUser(), fetchBestPractices(20), fetchModuleLocks()]).then(
        ([probRes, userRes, bpRes, locksRes]) => {
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
    return () => {
      mounted = false;
      window.removeEventListener("user-updated", handleUserUpdated);
      clearTimeout(debounceTimer);
    };
  }, [languageFilter]);

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
    } catch (err: any) {
      setBestPractices(original);
      toast.error({
        title: "Like failed",
        description: err.message || "Could not update like status.",
      });
    }
  };

  const modules = useMemo(
    () => Array.from(new Set(problems.map((p) => p.module))).sort(),
    [problems]
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

  const solvedCount = problems.filter((p) => p.solved).length;

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
  }, []);

  const showTopicCards = !selectedModule;

  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              {solvedCount} of {problems.length} problems solved
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-card border border-border/60 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <div className="text-right">
              <div className="text-sm font-bold leading-none mb-0.5 text-foreground">
                {solvedCount}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Solved
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-card border border-border/60 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg
                width="14"
                height="16"
                viewBox="0 0 12 16"
                className="text-primary"
                fill="currentColor"
              >
                <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold leading-none mb-0.5 text-foreground">
                {user?.xp?.toLocaleString() || 0}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                XP Earned
              </div>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-card border border-border/60 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Flame size={16} className="text-orange-400" />
              </div>
              <div className="text-right">
                <div className="text-sm font-bold leading-none mb-0.5 text-foreground">
                  {user.streak}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Day Streak
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <GoogleLinkBanner />

      {/* Tabs */}
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
          onClick={() => { if (user?.role === "admin") setActiveTab("best-practices"); }}
          className={cn(
            "pb-3 text-sm font-bold transition-colors relative flex items-center gap-2",
            activeTab === "best-practices"
              ? "text-foreground"
              : user?.role === "admin"
                ? "text-muted-foreground hover:text-foreground"
                : "text-muted-foreground/40 cursor-not-allowed select-none"
          )}
        >
          <Trophy size={16} className={cn(activeTab === "best-practices" && "text-primary")} />
          Best Practices
          {user?.role !== "admin" && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold leading-none bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <FlaskConical size={10} />
              BETA
            </span>
          )}
          {activeTab === "best-practices" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
          )}
        </button>
      </div>

      {activeTab === "problems" ? (
        <>
          {showTopicCards ? (
            /* ── Topic Card Grid ── */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                  <BookOpen size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Choose a topic to practice</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select a module to view its problems and track your progress
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="h-56 animate-pulse" />
                  ))}
                </div>
              ) : (
                <ModuleCards
                  modules={modules}
                  moduleProgress={moduleProgress}
                  lockedModules={lockedModules}
                  onSelect={handleSelectModule}
                />
              )}
            </div>
          ) : (
            /* ── Filtered Problems ── */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Back button + module header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedModule(null)}
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
                      window.history.replaceState({}, "", newUrl);
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="h-56 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProblems.length === 0 ? (
                    <div className="col-span-full">
                      <Card className="p-10 text-center border-dashed border-white/10 bg-card/50">
                        <p className="text-muted-foreground">No problems found for the current filters.</p>
                      </Card>
                    </div>
                  ) : (
                    paginatedProblems.map((problem, i) => {
                      const diffColor: Record<number, string> = {
                        1: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
                        2: "text-sky-400 bg-sky-500/10 border-sky-500/25",
                        3: "text-amber-400 bg-amber-500/10 border-amber-500/25",
                        4: "text-red-400 bg-red-500/10 border-red-500/25",
                        5: "text-purple-400 bg-purple-500/10 border-purple-500/25",
                      };
                      const diffLabel: Record<number, string> = {
                        1: "Beginner", 2: "Easy", 3: "Medium", 4: "Hard", 5: "Expert",
                      };
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
                        style={{
                          animationFillMode: "both",
                          animationDelay: i * 50 + "ms",
                        }}
                      >
                        <Card
                          className={cn(
                            "group relative overflow-hidden transition-all duration-300 h-full flex flex-col rounded-xl border hover:border-primary/30",
                            "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/6",
                            "animate-in fade-in slide-in-from-bottom-2",
                            problem.solved && "border-emerald-500/30 hover:border-emerald-500/50",
                          )}
                        >
                          {/* Background image with gradient fade */}
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

                          {/* Solved accent line */}
                          <div className={cn(
                            "absolute top-0 left-0 right-0 h-0.5 transition-colors duration-300 z-10",
                            problem.solved ? "bg-emerald-500" : "bg-transparent",
                          )} />

                          {/* Header */}
                          <CardHeader className="flex-row items-start justify-between p-5 pb-3 space-y-0 relative z-10">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-muted-foreground/30 font-semibold tabular-nums">
                                #{String(i + 1).padStart(3, "0")}
                              </span>
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                                diffColor[d] || diffColor[3],
                              )}>
                                {diffLabel[d] || "Medium"}
                              </span>
                            </div>
                            {problem.solved ? (
                              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/15 mt-0.5 shrink-0" />
                            )}
                          </CardHeader>

                          {/* Body */}
                          <CardContent className="px-5 pb-3 flex-1 flex flex-col relative z-10">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <CardTitle className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                                {problem.title}
                              </CardTitle>
                              {langs.length > 0 && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {langs.map((lang) => (
                                    <span key={lang} className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-background/40 backdrop-blur-[2px]">
                                      <LanguageLogo language={lang as "go" | "python"} size={20} />
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2 mb-auto">
                              {problem.statement ? (
                                problem.statement
                                  .replace(/<[^>]*>/g, "").replace(/^#+\s+/gm, "")
                                  .replace(/\*\*/g, "").replace(/```[\s\S]*?```/g, "")
                                  .split("\n").filter(Boolean).slice(0, 2).join(" ").trim().substring(0, 120)
                              ) : (
                                <span className="italic">No description</span>
                              )}
                            </p>

                            {problem.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {problem.tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="text-[10px] font-medium text-muted-foreground/50 bg-background/40 px-2 py-0.5 rounded-md border border-border/20 backdrop-blur-[2px]">
                                    {tag}
                                  </span>
                                ))}
                                {problem.tags.length > 3 && (
                                  <span className="text-[10px] text-muted-foreground/30 font-medium px-1">+{problem.tags.length - 3}</span>
                                )}
                              </div>
                            )}
                          </CardContent>

                          {/* Footer */}
                          <CardFooter className="px-5 py-3 border-t border-border/20 relative z-10 bg-background/40 backdrop-blur-[2px]">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground/50 font-medium">
                                <span className="flex items-center gap-1">
                                  <Code size={11} className="shrink-0 text-muted-foreground/30" />
                                  {problem.total_submissions || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <BarChart2 size={11} className="shrink-0 text-muted-foreground/30" />
                                  {Math.round(problem.success_rate || 0)}%
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={11} className="shrink-0 text-muted-foreground/30" />
                                  {problem.estTimeMinutes || 0}m
                                </span>
                              </div>
                              <div className={cn(
                                "flex items-center gap-1 px-2 py-1 rounded-md transition-all",
                                problem.solved
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-primary/5 text-primary group-hover:bg-primary/10",
                              )}>
                                <svg width="10" height="13" viewBox="0 0 12 16" fill="currentColor" className="shrink-0">
                                  <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
                                </svg>
                                <span className="font-bold text-[11px] tabular-nums">+{problem.xpReward ?? 0}</span>
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      </Link>
                      );
                    })
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
      ) : user?.role !== "admin" ? (
        <div className="col-span-full">
          <Card className="p-12 text-center border-dashed border-white/10 bg-card/50">
            <FlaskConical className="mx-auto mb-4 text-amber-500/30" size={48} />
            <h3 className="text-lg font-bold text-foreground mb-2">Best Practices — Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This feature is in private beta and currently available to administrators only.
              Stay tuned for the public release.
            </p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-[320px] animate-pulse" />
              ))}
            </div>
          ) : bestPractices.length === 0 ? (
            <div className="col-span-full">
              <Card className="p-12 text-center border-dashed border-white/10 bg-card/50">
                <Trophy className="mx-auto mb-4 text-muted-foreground/20" size={48} />
                <h3 className="text-lg font-bold text-foreground mb-2">No Best Practices Yet</h3>
                <p className="text-muted-foreground">Solve problems and get likes to feature here!</p>
              </Card>
            </div>
          ) : (
            bestPractices.map((sol) => (
              <Card
                key={sol.id}
                className="overflow-hidden flex flex-col gap-0 p-0"
              >
                <CardHeader className="p-4 flex-row items-center justify-between space-y-0 border-b border-border/50 bg-muted/20">
                  <ProfileHoverCard userId={sol.user_id} side="bottom" align="start">
                    <div className="flex items-center gap-3 cursor-pointer">
                      <Avatar
                        src={sol.user_avatar_url}
                        name={sol.user_name}
                        size="sm"
                        verified={sol.verified}
                      />
                      <div>
                        <div className="font-bold text-sm text-foreground flex items-center gap-2">
                          {sol.user_name}
                        {sol.problem_slug && (
                          <Link href={`/problems/${sol.problem_slug}`} className="text-xs text-primary hover:underline font-mono">
                            in {sol.problem_slug}
                          </Link>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono flex items-center gap-2 mt-0.5">
                        <Clock size={12} /> {sol.runtime_ms}ms
                      </div>
                    </div>
                  </div>
                  </ProfileHoverCard>
                  <button
                    onClick={() => handleLike(sol.id, sol.has_liked)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold shrink-0",
                      sol.has_liked
                        ? "bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20"
                        : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Heart
                      size={14}
                      fill={sol.has_liked ? "currentColor" : "none"}
                      className={cn(sol.has_liked && "text-rose-500")}
                    />
                    {sol.likes}
                  </button>
                </CardHeader>
                <CardContent className="p-0">
                  <CodeSnippet
                    files={[{
                      language: "go",
                      filename: "solution.go",
                      code: sol.code,
                    }]}
                    collapsed
                    maxHeight={140}
                    className="rounded-none border-0 shadow-none"
                  />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
