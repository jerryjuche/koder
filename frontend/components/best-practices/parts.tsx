"use client";

import Link from "next/link";
import { ExternalLink, Heart, Sparkles } from "lucide-react";
import { CommunitySolution } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/base/avatar/avatar";
import { ProfileHoverCard } from "@/components/profile/ProfileHoverCard";

export function solutionFilename(language: string): string {
  return `solution.${language === "python" ? "py" : "go"}`;
}

export function solutionLanguage(language: string): "go" | "python" {
  return language === "python" ? "python" : "go";
}

export function ProblemLink({ solution }: { solution: CommunitySolution }) {
  if (!solution.problem_slug) return null;
  const display = solution.problem_title || solution.problem_slug;
  return (
    <span
      className="inline-flex min-w-0 items-center gap-1"
      title={`Problem: ${display}`}
    >
      <span className="truncate text-muted-foreground">{display}</span>
      <Link
        href={`/problems/${solution.problem_slug}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open problem ${display} in a new tab`}
        onClick={(e) => {
          e.stopPropagation();
          sessionStorage.setItem(
            "return_to",
            window.location.href.replace(window.location.origin, ""),
          );
        }}
        className="shrink-0 rounded p-0.5 text-muted-foreground/70 transition-colors hover:bg-muted/40 hover:text-foreground"
      >
        <ExternalLink size={12} />
      </Link>
    </span>
  );
}

export function AIAnalysisPill({
  hasAnalysis,
  onClick,
}: {
  hasAnalysis: boolean;
  onClick: () => void;
}) {
  if (!hasAnalysis) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-500/35 bg-violet-500/10 px-2.5 py-1.5 text-[11px] font-bold text-violet-300 transition-colors hover:bg-violet-500/20 active:scale-[0.98]"
      aria-label="Open AI analysis"
    >
      <Sparkles size={12} className="fill-violet-400/50 shrink-0" />
      <span>AI Analysis</span>
    </button>
  );
}

export function SolutionAuthorRow({
  solution,
  avatarSize = "sm",
}: {
  solution: CommunitySolution;
  avatarSize?: "sm" | "md" | "lg" | "podium" | "xl";
}) {
  return (
    <ProfileHoverCard userId={solution.user_id} side="bottom" align="start">
      <div
        className="flex items-center gap-2.5 cursor-pointer min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Avatar
          src={solution.user_avatar_url}
          name={solution.user_name}
          size={avatarSize}
          verified={solution.verified}
        />
        <div className="min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">
            {solution.user_name}
          </span>
        </div>
      </div>
    </ProfileHoverCard>
  );
}

export function LikeButton({
  solution,
  onLike,
  size = "sm",
}: {
  solution: CommunitySolution;
  onLike: (id: string, currentlyLiked: boolean) => void;
  size?: "sm" | "xs";
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onLike(solution.id, solution.has_liked);
      }}
      aria-label={solution.has_liked ? "Unlike solution" : "Like solution"}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border transition-all font-bold shrink-0",
        size === "xs" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs",
        solution.has_liked
          ? "bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20"
          : "bg-transparent text-muted-foreground border-border/50 hover:bg-muted/40 hover:text-foreground",
      )}
    >
      <Heart
        size={size === "xs" ? 12 : 13}
        fill={solution.has_liked ? "currentColor" : "none"}
        className={cn(solution.has_liked && "text-rose-500")}
      />
      <span className="tabular-nums">{solution.likes}</span>
    </button>
  );
}
