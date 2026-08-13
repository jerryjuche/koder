"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
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
    <Link
      href={`/problems/${solution.problem_slug}`}
      onClick={() =>
        sessionStorage.setItem(
          "return_to",
          window.location.href.replace(window.location.origin, ""),
        )
      }
      className="group/link inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors min-w-0"
    >
      <span className="truncate">{display}</span>
      <span className="opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0">→</span>
    </Link>
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
      <div className="flex items-center gap-2.5 cursor-pointer min-w-0">
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
      onClick={() => onLike(solution.id, solution.has_liked)}
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

export function RankBadge({ rank, size = "md" }: { rank: number; size?: "md" | "lg" }) {
  const base = cn(
    "shrink-0 flex items-center justify-center rounded-lg font-mono font-bold leading-none select-none border",
    size === "lg" ? "w-10 h-10 text-base" : "w-9 h-9 text-sm",
  );
  const style =
    rank === 1
      ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
      : rank === 2
        ? "bg-slate-400/10 text-slate-300 border-slate-400/30"
        : rank === 3
          ? "bg-amber-700/10 text-amber-600 border-amber-700/30"
          : "bg-muted/40 text-muted-foreground border-border/60";
  return (
    <span className={cn(base, style)}>
      #{rank}
    </span>
  );
}
