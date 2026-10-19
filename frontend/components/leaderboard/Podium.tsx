"use client";

import { CheckCircle2, Crown, Medal, Zap } from "lucide-react";
import { Avatar } from "@/components/base/avatar/avatar";
import { ProfileHoverCard } from "@/components/profile/ProfileHoverCard";
import type { LeaderboardEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Podium placement — the winner sits in the middle column. */
const ORDER: Array<1 | 2 | 3> = [2, 1, 3];

const RANK_STYLES: Record<
  1 | 2 | 3,
  {
    label: string;
    icon: React.ElementType;
    plate: string;
    card: string;
    ring: string;
    height: string;
    avatar: "lg" | "md";
    nameClass: string;
  }
> = {
  1: {
    label: "1st",
    icon: Crown,
    plate: "bg-brand-muted-gold text-brand-charcoal-base",
    card: "border-primary/30 bg-gradient-to-b from-primary/12 via-brand-charcoal-card to-brand-charcoal-card",
    ring: "ring-primary",
    height: "min-h-[10.5rem] sm:min-h-[11.5rem]",
    avatar: "lg",
    nameClass: "text-sm sm:text-base text-foreground font-extrabold",
  },
  2: {
    label: "2nd",
    icon: Medal,
    plate: "bg-white/[0.08] text-slate-200",
    card: "border-border bg-brand-charcoal-card",
    ring: "ring-slate-400",
    height: "min-h-[8.75rem] sm:min-h-[9.5rem]",
    avatar: "md",
    nameClass: "text-xs sm:text-sm text-foreground font-bold",
  },
  3: {
    label: "3rd",
    icon: Medal,
    plate: "bg-white/[0.08] text-orange-300",
    card: "border-border bg-brand-charcoal-card",
    ring: "ring-orange-500",
    height: "min-h-[8.75rem] sm:min-h-[9.5rem]",
    avatar: "md",
    nameClass: "text-xs sm:text-sm text-foreground font-bold",
  },
};

interface PodiumProps {
  /** Top three entries in placement order: [2nd, 1st, 3rd]. */
  entries: (LeaderboardEntry | undefined)[];
}

/**
 * Top-three podium.
 *
 * Gold is spent only on the winner (plate, avatar ring, tinted card) so first
 * place is the single dominant element; second and third share one charcoal
 * treatment with silver and bronze rings for tie-breaking. Columns are equal
 * width and sized to content, so the block stays ~10rem tall at 320px instead
 * of forcing fixed-height cards that leave dead space on desktop.
 */
export default function Podium({ entries }: PodiumProps) {
  return (
    <ol
      aria-label="Top three students"
      className="grid grid-cols-3 items-end gap-2 pb-1 pt-5 sm:gap-3"
    >
      {entries.map((entry, i) => {
        const rank = ORDER[i];
        const style = RANK_STYLES[rank];
        const RankIcon = style.icon;

        if (!entry?.user) {
          return (
            <li
              key={`empty-${rank}`}
              aria-hidden="true"
              className={cn("w-full rounded-2xl border border-border/40", style.height)}
            />
          );
        }

        return (
          <li
            key={entry.user.id}
            className={cn(
              "relative flex w-full flex-col items-center rounded-2xl border px-2 pb-3 pt-7 transition-transform duration-200 hover:-translate-y-1",
              style.card,
              style.height,
            )}
          >
            <span
              className={cn(
                "absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold shadow-md",
                style.plate,
              )}
            >
              <RankIcon size={12} aria-hidden="true" />
              {style.label}
            </span>

            <Avatar
              src={entry.user.google_avatar_url}
              name={entry.user.name}
              colorIndex={entry.user.colorIndex || 0}
              size={style.avatar}
              verified={entry.user.verified}
              className={cn("ring-[3px] ring-offset-2 ring-offset-background", style.ring)}
            />

            <div className="mt-2.5 w-full text-center">
              <ProfileHoverCard user={entry.user}>
                <p className={cn("mx-auto cursor-pointer truncate", style.nameClass)}>
                  {entry.user.name}
                </p>
              </ProfileHoverCard>

              <div className="mt-1 flex items-center justify-center gap-1 text-primary">
                <Zap size={11} aria-hidden="true" />
                <span className="text-xs font-bold tabular-nums sm:text-sm">
                  {(entry.user.xp || 0).toLocaleString()}
                </span>
              </div>

              <div className="mt-1 flex items-center justify-center gap-1 text-brand-offwhite-muted">
                <CheckCircle2 size={10} className="shrink-0 text-emerald-400" aria-hidden="true" />
                <span className="text-[11px] tabular-nums">{entry.user.solvedCount ?? 0} solved</span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
