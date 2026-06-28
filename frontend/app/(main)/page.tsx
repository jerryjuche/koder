"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { fetchProblems, fetchUser, fetchBestPractices, likeSubmission, unlikeSubmission } from "@/lib/api";
import { Problem, User, CommunitySolution } from "@/lib/types";
import {
  cn,
  getDifficultyColor,
  getDifficultyLabel,
  getUserColor,
} from "@/lib/utils";
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-brand-offwhite">
            Dashboard
          </h1>
          <p className="text-brand-offwhite-muted">
            {solvedCount} of {problems.length} problems solved
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-3 rounded-2xl border border-brand-charcoal-border bg-brand-charcoal-card px-4 py-3 shadow-sm">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-inner",
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
            <div>
              <div className="text-sm font-semibold text-brand-offwhite">
                {user.name}
              </div>
              <div className="text-xs text-brand-offwhite-muted">
                Student profile accent
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
            <CheckCircle2 className="text-brand-success" size={20} />
            <div>
              <div className="text-sm font-bold leading-none mb-1">
                {solvedCount}
              </div>
              <div className="text-xs text-brand-offwhite-muted font-medium">
                Solved
              </div>
            </div>
          </div>
          <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
            <svg
              width="20"
              height="20"
              viewBox="0 0 12 16"
              className="text-brand-muted-gold"
              fill="currentColor"
            >
              <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
            </svg>
            <div>
              <div className="text-sm font-bold leading-none mb-1">
                {user?.xp?.toLocaleString() || 0}
              </div>
              <div className="text-xs text-brand-offwhite-muted font-medium">
                XP Earned
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-brand-charcoal-border">
        <button
          onClick={() => setActiveTab("problems")}
          className={cn(
            "pb-3 text-sm font-bold transition-colors relative flex items-center gap-2",
            activeTab === "problems" ? "text-brand-offwhite" : "text-brand-offwhite-muted hover:text-brand-offwhite"
          )}
        >
          <Code size={16} className={cn(activeTab === "problems" && "text-brand-muted-gold")} />
          Problem Set
          {activeTab === "problems" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-muted-gold"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("best-practices")}
          className={cn(
            "pb-3 text-sm font-bold transition-colors relative flex items-center gap-2",
            activeTab === "best-practices" ? "text-brand-offwhite" : "text-brand-offwhite-muted hover:text-brand-offwhite"
          )}
        >
          <Trophy size={16} className={cn(activeTab === "best-practices" && "text-brand-muted-gold")} />
          Best Practices
          {activeTab === "best-practices" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-muted-gold"></div>
          )}
        </button>
      </div>

      {activeTab === "problems" ? (
        <>
          {showTopicCards ? (
            /* ── Topic Card Grid ── */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-brand-muted-gold/10 flex items-center justify-center">
                  <BookOpen size={18} className="text-brand-muted-gold" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-brand-offwhite">Choose a topic to practice</h2>
                  <p className="text-xs text-brand-offwhite-muted mt-0.5">
                    Select a module to view its problems and track your progress
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-36 bg-brand-charcoal-card rounded-2xl animate-pulse border border-brand-charcoal-border" />
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
                    className="flex items-center gap-1.5 text-sm text-brand-offwhite-muted hover:text-brand-offwhite transition-colors font-medium"
                  >
                    <ArrowLeft size={16} />
                    Back to topics
                  </button>
                  <div className="w-px h-5 bg-brand-charcoal-border" />
                  <div>
                    <h2 className="text-lg font-bold text-brand-offwhite">{selectedModule}</h2>
                    <p className="text-xs text-brand-offwhite-muted">
                      {moduleProgress[selectedModule]?.solved || 0} / {moduleProgress[selectedModule]?.total || 0} solved
                    </p>
                  </div>
                </div>
              </div>

              {/* Filters (no module dropdown) */}
              <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-4 flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-offwhite-muted"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search problems or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-brand-offwhite placeholder:text-brand-offwhite-muted focus:outline-none focus:border-brand-muted-gold transition-colors"
                  />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="appearance-none bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg pl-4 pr-10 py-2.5 text-sm text-brand-offwhite-muted focus:outline-none focus:border-brand-muted-gold transition-colors"
                    >
                      {difficulties.map((d) => (
                        <option key={d} value={d}>{d === "All" ? "All Levels" : d}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-offwhite-muted pointer-events-none" size={14} />
                  </div>

                  <div className="flex items-center bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg p-1">
                    {(["all", "solved", "unsolved"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                          "px-5 py-1.5 rounded text-sm font-medium transition-colors capitalize",
                          statusFilter === status
                            ? "bg-brand-charcoal-hover text-brand-offwhite shadow-sm"
                            : "text-brand-offwhite-muted hover:text-brand-offwhite"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-sm text-brand-offwhite-muted font-medium">
                Showing {filteredProblems.length} of {problems.length} problems
              </div>

              {/* Problem Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-56 bg-brand-charcoal-card rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProblems.length === 0 ? (
                    <div className="col-span-full bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-10 text-center">
                      <p className="text-brand-offwhite-muted">No problems found for the current filters.</p>
                    </div>
                  ) : (
                    filteredProblems.map((problem, i) => (
                      <Link
                        key={problem.id}
                        href={`/problems/${problem.slug}`}
                        className="group block bg-brand-charcoal-card border border-brand-charcoal-border hover:border-brand-muted-gold/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-brand-muted-gold/5 hover:-translate-y-1 relative overflow-hidden"
                        style={{
                          animationFillMode: "both",
                          animationDelay: i * 50 + "ms",
                        }}
                      >
                        {problem.solved && (
                          <div className="absolute top-0 left-0 w-full h-1 bg-brand-success"></div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-brand-offwhite-muted">
                              #{problem.slug === "hello-world" ? "001" : "00" + (i + 1)}
                            </span>
                            <span className="bg-brand-charcoal-hover text-brand-offwhite-muted px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-brand-charcoal-border">
                              {problem.module}
                            </span>
                          </div>
                          {problem.solved ? (
                            <CheckCircle2 className="text-brand-success" size={20} />
                          ) : (
                            <Circle
                              className="text-brand-charcoal-border group-hover:text-brand-muted-gold/40 transition-colors"
                              size={20}
                            />
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-brand-offwhite mb-2 group-hover:text-brand-muted-gold transition-colors">
                          {problem.title}
                        </h3>

                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, j) => (
                            <Flame
                              key={j}
                              size={14}
                              className={
                                j < problem.difficulty
                                  ? "text-brand-error"
                                  : "text-brand-charcoal-border"
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

                        <p className="text-sm text-brand-offwhite-muted line-clamp-2 h-10 mb-5">
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

                        <div className="flex flex-wrap gap-2 mb-4">
                          {problem.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-brand-charcoal-hover text-brand-offwhite-muted px-2 py-1 rounded-md border border-brand-charcoal-border"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {problem.author_name && (
                          <div className="text-xs text-brand-offwhite-muted mb-6 flex items-center gap-1 font-mono">
                            by <span className="text-brand-muted-gold">@{problem.author_name}</span>
                            <CheckCircle2 className="w-3 h-3 text-brand-muted-gold" />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-brand-offwhite-muted pt-4 border-t border-brand-charcoal-border/50">
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
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-muted-gold/5 border border-brand-muted-gold/20">
                            <svg
                              width="14"
                              height="18"
                              viewBox="0 0 12 16"
                              fill="currentColor"
                              className="text-brand-muted-gold flex-shrink-0"
                            >
                              <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
                            </svg>
                            <span className="font-semibold text-sm text-brand-muted-gold whitespace-nowrap">
                              +{problem.xpReward ?? 0} XP
                            </span>
                          </div>
                        </div>
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
                <div key={i} className="h-[320px] bg-brand-charcoal-card rounded-2xl animate-pulse border border-brand-charcoal-border"></div>
              ))}
            </div>
          ) : bestPractices.length === 0 ? (
            <div className="col-span-full bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-12 text-center text-brand-offwhite-muted">
              <Trophy className="mx-auto mb-4 opacity-20" size={48} />
              <h3 className="text-lg font-bold text-brand-offwhite mb-2">No Best Practices Yet</h3>
              <p>Solve problems and get likes to feature here!</p>
            </div>
          ) : (
            bestPractices.map((sol) => (
              <div
                key={sol.id}
                className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden hover:border-brand-charcoal-border/80 transition-colors flex flex-col"
              >
                <div className="p-4 flex items-center justify-between border-b border-brand-charcoal-border/50 bg-brand-charcoal-base/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-muted-gold/10 text-brand-muted-gold flex items-center justify-center font-bold text-sm border border-brand-muted-gold/20">
                      {sol.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-brand-offwhite flex items-center gap-2">
                        {sol.user_name}
                        {sol.problem_slug && (
                          <Link href={`/problems/${sol.problem_slug}`} className="text-xs text-brand-muted-gold hover:underline font-mono">
                            in {sol.problem_slug}
                          </Link>
                        )}
                      </div>
                      <div className="text-xs text-brand-offwhite-muted font-mono flex items-center gap-2 mt-0.5">
                        <Clock size={12} /> {sol.runtime_ms}ms
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLike(sol.id, sol.has_liked)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold",
                      sol.has_liked
                        ? "bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20"
                        : "bg-brand-charcoal-hover text-brand-offwhite-muted border-brand-charcoal-border hover:bg-brand-charcoal-base hover:text-brand-offwhite"
                    )}
                  >
                    <Heart
                      size={14}
                      fill={sol.has_liked ? "currentColor" : "none"}
                      className={cn(sol.has_liked && "text-rose-500")}
                    />
                    {sol.likes}
                  </button>
                </div>
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
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
