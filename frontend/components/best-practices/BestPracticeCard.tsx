"use client";

import Link from "next/link";
import { Clock, Heart, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { CommunitySolution } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/base/avatar/avatar";
import { ProfileHoverCard } from "@/components/profile/ProfileHoverCard";
import { CodeSnippet } from "@/components/application/code-snippet";

export function solutionFilename(language: string): string {
  return `solution.${language === "python" ? "py" : "go"}`;
}

export function solutionLanguage(language: string): "go" | "python" {
  return language === "python" ? "python" : "go";
}

const langPill: Record<string, string> = {
  go: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  python: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const langLabel: Record<string, string> = { go: "Go", python: "Python" };

export function ProblemLink({ solution }: { solution: CommunitySolution }) {
  if (!solution.problem_slug) return null;
  const display = solution.problem_title || solution.problem_slug;
  return (
    <Link
      href={`/problems/${solution.problem_slug}`}
      onClick={() =>
        sessionStorage.setItem(
          "return_to",
          window.location.href.replace(window.location.origin, ""),
        )
      }
      className="group/link inline-flex items-center gap-1 text-primary/90 hover:text-primary transition-colors min-w-0"
    >
      <span className="truncate">{display}</span>
      <span className="opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0">→</span>
    </Link>
  );
}

export function SolutionAuthorRow({ solution }: { solution: CommunitySolution }) {
  return (
    <ProfileHoverCard userId={solution.user_id} side="bottom" align="start">
      <div className="flex items-center gap-2.5 cursor-pointer min-w-0">
        <Avatar
          src={solution.user_avatar_url}
          name={solution.user_name}
          size="sm"
          verified={solution.verified}
        />
          <div className="min-w-0 flex-1">
            <span className="text-sm font-bold text-foreground truncate">
              {solution.user_name}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono min-w-0">
              <span className="truncate">solved</span>
              <ProblemLink solution={solution} />
            </div>
          </div>
      </div>
    </ProfileHoverCard>
  );
}

export function SolutionMetaRow({ solution }: { solution: CommunitySolution }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border leading-none",
          langPill[solution.language] || "bg-muted text-muted-foreground border-border",
        )}
      >
        {langLabel[solution.language] || solution.language}
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 leading-none">
        <Zap size={10} className="fill-emerald-400/60" />
        {solution.runtime_ms}ms
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-muted-foreground bg-muted/40 border border-border/40 leading-none">
        <Clock size={10} />
        {formatRelativeTime(solution.created_at)}
      </span>
    </div>
  );
}

export function LikeButton({
  solution,
  onLike,
}: {
  solution: CommunitySolution;
  onLike: (id: string, currentlyLiked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onLike(solution.id, solution.has_liked)}
      aria-label={solution.has_liked ? "Unlike solution" : "Like solution"}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-bold shrink-0",
        solution.has_liked
          ? "bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20"
          : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground",
      )}
    >
      <Heart
        size={13}
        fill={solution.has_liked ? "currentColor" : "none"}
        className={cn(solution.has_liked && "text-rose-500")}
      />
      <span className="tabular-nums">{solution.likes}</span>
    </button>
  );
}

export function RankBadge({ rank, size = "md" }: { rank: number; size?: "md" | "lg" }) {
  const base = cn(
    "shrink-0 flex items-center justify-center rounded-lg font-mono font-black leading-none select-none",
    size === "lg" ? "w-12 h-12 text-lg" : "w-9 h-9 text-sm",
  );
  const style =
    rank === 1
      ? "bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-black shadow-[0_0_16px_-2px_rgba(212,175,55,0.55)]"
      : rank === 2
        ? "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-500 text-black shadow-[0_0_12px_-2px_rgba(148,163,184,0.5)]"
        : rank === 3
          ? "bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-amber-100 shadow-[0_0_12px_-2px_rgba(180,83,9,0.5)]"
          : "bg-muted/60 text-muted-foreground border border-border/60";
  return (
    <span className={cn(base, style)}>
      <span className="translate-y-[1px]">#{rank}</span>
    </span>
  );
}

export function BestPracticeCard({
  solution,
  rank,
  index = 0,
  onLike,
}: {
  solution: CommunitySolution;
  rank: number;
  index?: number;
  onLike: (id: string, currentlyLiked: boolean) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
    >
      <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-brand-charcoal-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-center gap-3 p-4 pb-3 border-b border-border/40">
          <RankBadge rank={rank} />
          <div className="flex-1 min-w-0">
            <SolutionAuthorRow solution={solution} />
          </div>
          <LikeButton solution={solution} onLike={onLike} />
        </div>

        <div className="px-4 pt-3 pb-3">
          <SolutionMetaRow solution={solution} />
        </div>

        <div className="px-4 pb-4">
          <CodeSnippet
            files={[
              {
                language: solutionLanguage(solution.language),
                filename: solutionFilename(solution.language),
                code: solution.code,
              },
            ]}
            collapsed
            maxHeight={180}
            lineNumbers
            className="rounded-lg shadow-none"
          />
        </div>
      </div>
    </motion.div>
  );
}
