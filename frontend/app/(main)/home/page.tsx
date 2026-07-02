"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ChevronDown,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  BarChart2,
  Code,
  Heart,
  Trophy,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import GoogleLinkBanner from "@/components/GoogleLinkBanner";
import { fetchProblems, fetchUser, fetchBestPractices, likeSubmission, unlikeSubmission } from "@/lib/api";
import { Problem, User, CommunitySolution } from "@/lib/types";
import {
  cn,
  getDifficultyColor,
  getDifficultyLabel,
  getUserColor,
} from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/kibo-ui/code-block";
import type { BundledLanguage } from "@/components/kibo-ui/code-block";
import { toast } from "@/lib/toast";
import ModuleCards from "@/components/dashboard/ModuleCards";

export default function Dashboard() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [bestPractices, setBestPractices] = useState<CommunitySolution[]>([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [activeTab, setActiveTab] = useState<"problems" | "best-practices">("problems");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "solved" | "unsolved">("all");

  useEffect(() => {
    let mounted = true;
    const loadData = () => {
      Promise.all([fetchProblems(), fetchUser(), fetchBestPractices(20)]).then(
        ([probRes, userRes, bpRes]) => {
          if (!mounted) return;
          if (probRes.success) setProblems(probRes.data || []);
          if (userRes.success) setUser(userRes.data);
          if (bpRes.success) setBestPractices(bpRes.data || []);
          setLoading(false);
        }
      );
    };

    loadData();

    window.addEventListener("user-updated", loadData);
    return () => {
      mounted = false;
      window.removeEventListener("user-updated", loadData);
    };
  }, []);

  // Reset avatarError when user data changes (e.g. after Google sync)
  useEffect(() => {
    setAvatarError(false);
  }, [user?.google_avatar_url]);

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

  const filteredProblems = problems.filter((p) => {
    if (selectedModule && p.module !== selectedModule) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
    if (difficultyFilter !== "All" && getDifficultyLabel(p.difficulty) !== difficultyFilter) return false;
    if (statusFilter === "solved" && !p.solved) return false;
    if (statusFilter === "unsolved" && p.solved) return false;
    return true;
  });

  const solvedCount = problems.filter((p) => p.solved).length;

  const handleSelectModule = (mod: string) => {
    setSelectedModule(mod);
    setSearchQuery("");
    setDifficultyFilter("All");
    setStatusFilter("all");
  };

  const showTopicCards = !selectedModule;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-4 pr-4 border-r border-border/60">
              {user.google_avatar_url && !avatarError ? (
                <div className="relative shrink-0">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/30 via-amber-400/20 to-transparent rounded-full blur-sm" />
                  <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-border/80">
                    <Image
                      src={user.google_avatar_url}
                      alt={user.username ?? "Avatar"}
                      width={44}
                      height={44}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-border/80 shrink-0",
                    getUserColor(user.colorIndex),
                  )}
                >
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate max-w-[140px] leading-tight">
                  {user.name}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    @{user.username || "student"}
                  </span>
                  <span className="size-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Lvl {user.level || Math.floor((user.xp || 0) / 1000) + 1}
                  </span>
                </div>
              </div>
            </div>
          )}

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
          </div>
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
          onClick={() => setActiveTab("best-practices")}
          className={cn(
            "pb-3 text-sm font-bold transition-colors relative flex items-center gap-2",
            activeTab === "best-practices" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Trophy size={16} className={cn(activeTab === "best-practices" && "text-primary")} />
          Best Practices
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="h-36 animate-pulse" />
                  ))}
                </div>
              ) : (
                <ModuleCards
                  modules={modules}
                  moduleProgress={moduleProgress}
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
                Showing {filteredProblems.length} of {problems.length} problems
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
                    filteredProblems.map((problem, i) => (
                      <Link
                        key={problem.id}
                        href={`/problems/${problem.slug}`}
                        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
                        style={{
                          animationFillMode: "both",
                          animationDelay: i * 50 + "ms",
                        }}
                      >
                        <Card
                          className={cn(
                            "group relative overflow-hidden transition-all duration-300",
                            "hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5",
                            "animate-in fade-in slide-in-from-bottom-2",
                          )}
                        >
                          {problem.solved && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-success to-amber-400" />
                          )}

                          <CardHeader className="flex-row items-center justify-between p-5 pb-0 space-y-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-muted-foreground">
                                #{problem.slug === "hello-world" ? "001" : "00" + (i + 1)}
                              </span>
                              <span className="bg-muted/50 text-muted-foreground px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-border/50">
                                {problem.module}
                              </span>
                            </div>
                            {problem.solved ? (
                              <CheckCircle2 className="text-brand-success" size={20} />
                            ) : (
                              <Circle
                                className="text-muted-foreground/30 group-hover:text-primary/40 transition-colors"
                                size={20}
                              />
                            )}
                          </CardHeader>

                          <CardContent className="p-5 pt-3">
                            <CardTitle className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {problem.title}
                            </CardTitle>

                            <div className="flex items-center gap-1 mb-3">
                              {[...Array(5)].map((_, j) => (
                                <Flame
                                  key={j}
                                  size={14}
                                  className={
                                    j < problem.difficulty
                                      ? "text-destructive"
                                      : "text-border"
                                  }
                                />
                              ))}
                              <span
                                className={cn(
                                  "text-xs font-bold ml-2",
                                  getDifficultyColor(problem.difficulty)
                                )}
                              >
                                {getDifficultyLabel(problem.difficulty)}
                              </span>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {problem.statement ? (
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: problem.statement
                                      .split("\n")
                                      .slice(0, 2)
                                      .join(" "),
                                  }}
                                />
                              ) : (
                                <span>No short description available.</span>
                              )}
                            </p>

                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {problem.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[11px] bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-md border border-border/50"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {problem.author_name && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                                by <span className="text-primary">{problem.author_name}</span>
                                <CheckCircle2 className="w-3 h-3 text-primary" />
                              </div>
                            )}
                          </CardContent>

                          <CardFooter className="p-5 pt-0 border-t border-border/50 mt-1">
                            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Code size={14} /> {problem.total_submissions || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <BarChart2 size={14} />{" "}
                                  {Math.round(problem.successRate || 0)}%
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={14} /> {problem.estTimeMinutes || 0}m
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/5 border border-primary/20">
                                <svg
                                  width="14"
                                  height="18"
                                  viewBox="0 0 12 16"
                                  fill="currentColor"
                                  className="text-primary flex-shrink-0"
                                >
                                  <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
                                </svg>
                                <span className="font-semibold text-sm text-primary whitespace-nowrap">
                                  +{problem.xpReward ?? 0} XP
                                </span>
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </>
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
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                      {sol.user_name.charAt(0).toUpperCase()}
                    </div>
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
                  <CodeBlock
                    data={[
                      {
                        language: "go",
                        filename: "solution.go",
                        code: sol.code,
                      },
                    ]}
                    defaultValue="go"
                    className="h-[250px]"
                  >
                    <CodeBlockHeader>
                      <CodeBlockFiles>
                        {(item) => (
                          <CodeBlockFilename
                            key={item.language}
                            value={item.language}
                          >
                            {item.filename}
                          </CodeBlockFilename>
                        )}
                      </CodeBlockFiles>
                      <CodeBlockCopyButton />
                    </CodeBlockHeader>
                    <CodeBlockBody>
                      {(item) => (
                        <CodeBlockItem
                          key={item.language}
                          value={item.language}
                        >
                          <CodeBlockContent
                            language={item.language as BundledLanguage}
                          >
                            {item.code}
                          </CodeBlockContent>
                        </CodeBlockItem>
                      )}
                    </CodeBlockBody>
                  </CodeBlock>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
