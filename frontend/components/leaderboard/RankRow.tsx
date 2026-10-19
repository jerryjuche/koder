"use client";

import { Zap } from "lucide-react";
import { Avatar } from "@/components/base/avatar/avatar";
import { ProfileHoverCard } from "@/components/profile/ProfileHoverCard";
import type { LeaderboardEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Rank number treatment — medal colours for the top three, muted below. */
const RANK_CLASS: Record<number, string> = {
  1: "text-amber-400 font-extrabold",
  2: "text-slate-300 font-bold",
  3: "text-orange-400 font-bold",
};

interface RankRowProps {
  entry: LeaderboardEntry;
  /** 1-based position in the currently displayed list. */
  rank: number;
  /** The signed-in student. */
  isMe: boolean;
  /** Preformatted "12ms" / "—" for the best-run metadata. */
  bestLabel: string;
}

/**
 * One row of the ranked list.
 *
 * The rank is a bare number rather than a filled badge so fifteen rows keep a
 * single vertical column of text instead of fifteen boxes; colour carries the
 * medal ranking. XP sits right-aligned as a gold number with no repeated
 * "XP" caption under it — the icon plus the gold is already the label.
 */
export default function RankRow({ entry, rank, isMe, bestLabel }: RankRowProps) {
  const person = entry.user;
  const solved = person?.solvedCount ?? 0;
  const meta = bestLabel !== "—" ? `${solved} solved · best ${bestLabel}` : `${solved} solved`;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-3 transition-colors sm:px-4",
        isMe && "bg-primary/[0.07]",
      )}
    >
      <span
        className={cn(
          "w-6 shrink-0 text-center text-sm tabular-nums",
          RANK_CLASS[rank] ?? "font-semibold text-brand-offwhite-muted",
        )}
      >
        {rank}
      </span>

      <Avatar
        src={person?.google_avatar_url}
        name={person?.name || "?"}
        colorIndex={person?.colorIndex}
        size="md"
        verified={person?.verified}
        className="shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <ProfileHoverCard user={person}>
            <p className="cursor-pointer truncate text-[15px] font-semibold text-foreground">
              {person?.username || person?.name || "—"}
            </p>
          </ProfileHoverCard>
          {isMe && (
            <span className="shrink-0 rounded-md border border-primary/30 bg-primary/10 px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-primary">
              You
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs tabular-nums text-brand-offwhite-muted">{meta}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1 font-bold tabular-nums text-primary">
        <Zap size={13} aria-hidden="true" />
        {(person?.xp || 0).toLocaleString()}
      </div>
    </div>
  );
}
