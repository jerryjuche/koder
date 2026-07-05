"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
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
import {
  CheckCircle2,
  ChevronRight,
  Heart,
  LayoutDashboard,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchProblem,
  fetchProblems,
  fetchCommunitySolutions,
  likeSubmission,
  unlikeSubmission,
} from "@/lib/api";
import { Problem, CommunitySolution } from "@/lib/types";
import { toast } from "@/lib/toast";

export default function SuccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = React.use(params);

  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>("");
  const [nextProblem, setNextProblem] = useState<Problem | null>(null);
  const [communitySolutions, setCommunitySolutions] = useState<
    CommunitySolution[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trigger confetti on mount — fire immediately, then interval bursts
    const burst = () => {
      try {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 90,
          origin: { x: 0, y: 0.6 },
          colors: ["#D4AF37", "#22C55E", "#FFFFFF"],
          startVelocity: 45,
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 90,
          origin: { x: 1, y: 0.6 },
          colors: ["#D4AF37", "#22C55E", "#FFFFFF"],
          startVelocity: 45,
        });
      } catch (e) {
        console.error("Confetti failed", e);
      }
    };

    burst();

    const interval = setInterval(burst, 150);
    const timeout = setTimeout(() => clearInterval(interval), 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    // Get code from session storage
    const savedCode = sessionStorage.getItem(`koder_solution_${slug}`);
    if (savedCode) {
      setCode(savedCode);
    }

    // Fetch data
    const loadData = async () => {
      try {
        const [probRes, allProbRes, solutionsRes] = await Promise.all([
          fetchProblem(slug),
          fetchProblems(),
          fetchCommunitySolutions(slug),
        ]);

        if (probRes.success && probRes.data) {
          setProblem(probRes.data);
          const currentProb = probRes.data;

          if (allProbRes.success && allProbRes.data) {
            const moduleProblems = allProbRes.data.filter(
              (p) => p.module === currentProb.module && p.id !== currentProb.id,
            );
            const unsolved = moduleProblems.find((p) => !p.solved);
            setNextProblem(unsolved || moduleProblems[0] || null);
          }
        }

        if (solutionsRes.success && solutionsRes.data) {
          setCommunitySolutions(solutionsRes.data);
        }
      } catch (err) {
        console.error("Failed to load success page data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  const handleLike = async (id: string, currentlyLiked: boolean) => {
    const originalSolutions = [...communitySolutions];

    // Optimistic update
    setCommunitySolutions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            has_liked: !currentlyLiked,
            likes: currentlyLiked ? s.likes - 1 : s.likes + 1,
          };
        }
        return s;
      }),
    );

    try {
      const res = currentlyLiked
        ? await unlikeSubmission(id)
        : await likeSubmission(id);

      if (!res.success) {
        throw new Error(res.error?.message || "Failed to update like");
      }
    } catch (err: any) {
      // Revert on error
      setCommunitySolutions(originalSolutions);
      toast.error(err.message || "Failed to like solution");
    }
  };

  if (loading || !problem) {
    return (
      <div className="min-h-screen bg-brand-charcoal-base flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-muted-gold border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-charcoal-base text-brand-offwhite pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-brand-success/10 to-transparent border-b border-brand-charcoal-border pt-20 pb-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-success/20 text-brand-success mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          Solution Accepted!
        </h1>
        <div className="flex items-center justify-center gap-2 text-brand-offwhite-muted mb-8">
          <span>{problem.title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-charcoal-border"></span>
          <span className="flex items-center gap-1 text-brand-muted-gold">
            <Trophy size={14} /> +{problem.xpReward} XP
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6">
          <Link
            href={`/home?module=${encodeURIComponent(problem.module)}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-charcoal-card border border-brand-charcoal-border hover:bg-brand-charcoal-hover transition-colors font-bold text-sm"
          >
            <LayoutDashboard size={18} />
            Back to Dashboard
          </Link>
          {nextProblem ? (
            <Link
              href={`/problems/${nextProblem.slug}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base transition-colors font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Continue to {nextProblem.title}
              <ArrowRight size={18} />
            </Link>
          ) : (
            <Link
              href={`/home?module=${encodeURIComponent(problem.module)}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base transition-colors font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Module Complete! Explore more
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Your Solution */}
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            Your Solution
          </h2>
          <CodeBlock
            data={[
              {
                language: "go",
                filename: "solution.go",
                code,
              },
            ]}
            defaultValue="go"
            className="h-[400px]"
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
                <CodeBlockItem key={item.language} value={item.language}>
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

        {/* Right: Community Solutions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Community Best Practices
            </h2>
          </div>

          <div className="space-y-4">
            {communitySolutions.length === 0 ? (
              <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-8 text-center text-brand-offwhite-muted">
                <Trophy className="mx-auto mb-3 opacity-20" size={32} />
                <p>No community solutions yet.</p>
                <p className="text-sm mt-1">Be the first to get liked!</p>
              </div>
            ) : (
              communitySolutions.map((sol, idx) => (
                <div
                  key={sol.id}
                  className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden hover:border-brand-charcoal-border/80 transition-colors"
                >
                  <div className="p-4 flex items-center justify-between border-b border-brand-charcoal-border/50 bg-brand-charcoal-base/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-muted-gold/10 text-brand-muted-gold flex items-center justify-center font-bold text-xs border border-brand-muted-gold/20">
                        {sol.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{sol.user_name}</div>
                        <div className="text-xs text-brand-offwhite-muted font-mono flex items-center gap-2">
                          <span>{sol.runtime_ms}ms</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLike(sol.id, sol.has_liked)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold",
                        sol.has_liked
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20"
                          : "bg-brand-charcoal-hover text-brand-offwhite-muted border-brand-charcoal-border hover:bg-brand-charcoal-base hover:text-brand-offwhite",
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
                    className="h-[200px]"
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
        </div>
      </div>
    </div>
  );
}
