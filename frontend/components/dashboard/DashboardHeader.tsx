"use client";

import { CheckCircle2, Flame, Hash } from "lucide-react";
import ProgressRing from "@/components/dashboard/ProgressRing";
import { cn } from "@/lib/utils";

/** XP needed for one level. Mirrors the profile header's progress math. */
const XP_PER_LEVEL = 1000;

interface DashboardHeaderProps {
  greeting: string;
  name: string;
  level: number;
  xp: number;
  solved: number;
  streak: number;
  /** Global rank, or null when the user is outside the leaderboard window. */
  rank: number | null;
  /** True when the leaderboard is full and the user sits below it. */
  rankCapped?: boolean;
  /** Hide the greeting/identity row on module detail views to save height. */
  showGreeting?: boolean;
}

function Metric({
  icon: Icon,
  label,
  value,
  iconClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconClass: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-l border-border/60 px-3 py-2.5 first:border-l-0 sm:px-4">
      <dt className="flex items-center gap-1.5 text-micro font-semibold uppercase tracking-wider text-brand-offwhite-muted">
        <Icon size={12} className={cn("shrink-0", iconClass)} aria-hidden="true" />
        {label}
      </dt>
      <dd className="text-lg font-extrabold leading-none tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}

/**
 * Dashboard identity + progress band.
 *
 * One composed surface instead of four equal stat tiles: the level ring carries
 * XP progress (so XP is never repeated as a separate number), and the metric
 * strip below reports the three counts that change with play. Every figure here
 * is real data — the rank falls back to an em dash only when the leaderboard
 * genuinely cannot place the user.
 */
export default function DashboardHeader({
  greeting,
  name,
  level,
  xp,
  solved,
  streak,
  rank,
  rankCapped = false,
  showGreeting = true,
}: DashboardHeaderProps) {
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpPercent = xpInLevel / XP_PER_LEVEL;
  const rankLabel = rank !== null ? `#${rank}` : rankCapped ? "100+" : "—";

  return (
    <section aria-label="Your progress" className="space-y-3">
      {showGreeting && (
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-brand-muted-gold">
              {greeting}
            </p>
            <h1 className="mt-1 truncate text-[26px] font-extrabold leading-none tracking-tight text-foreground nav:text-3xl">
              {name}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right">
              <p className="text-micro font-semibold uppercase tracking-wider text-brand-offwhite-muted">
                Level
              </p>
              <p className="mt-0.5 text-micro tabular-nums text-brand-offwhite-muted/80">
                {xpInLevel.toLocaleString()} / {XP_PER_LEVEL.toLocaleString()} XP
              </p>
            </div>
            <ProgressRing value={xpPercent} size={56} strokeWidth={4}>
              <span className="text-lg font-extrabold leading-none tabular-nums text-foreground">
                {level}
              </span>
            </ProgressRing>
          </div>
        </div>
      )}

      <dl className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border bg-brand-charcoal-card">
        <Metric
          icon={CheckCircle2}
          label="Solved"
          value={solved}
          iconClass="text-emerald-400"
        />
        <Metric icon={Flame} label="Streak" value={streak} iconClass="text-orange-400" />
        <Metric icon={Hash} label="Rank" value={rankLabel} iconClass="text-brand-muted-gold" />
      </dl>
    </section>
  );
}
