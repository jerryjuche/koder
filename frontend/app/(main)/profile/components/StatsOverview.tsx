"use client";

import { UserProfile } from "@/lib/types";
import { Hash, Target, Zap } from "lucide-react";

interface StatsOverviewProps {
  profile: UserProfile;
}

export default function StatsOverview({ profile }: StatsOverviewProps) {
  const attemptedCount = profile.stats.attempted_count;
  const solvedCount = profile.stats.solved_count;
  const successRate =
    attemptedCount > 0
      ? parseFloat(((solvedCount / attemptedCount) * 100).toFixed(1))
      : 0;

  const formatRuntime = (ms: number) => {
    if (ms <= 0) return "—";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="rounded-xl bg-brand-charcoal-card border border-border/60 overflow-hidden h-full">
      <div className="flex items-stretch divide-x divide-border/50 h-full min-h-[72px]">
        <div className="flex-1 flex flex-col items-center justify-center py-3 px-2 gap-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Rank
          </span>
          <div className="flex items-center gap-1">
            <Hash size={12} className="text-primary" />
            <span className="text-base font-bold tabular-nums text-foreground">
              {profile.global_rank ?? "—"}
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-3 px-2 gap-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Rate
          </span>
          <div className="flex items-center gap-1">
            <Target size={12} className="text-primary" />
            <span className="text-base font-bold tabular-nums text-foreground">
              {successRate}%
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-3 px-2 gap-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Best
          </span>
          <div className="flex items-center gap-1">
            <Zap size={12} className="text-primary" />
            <span className="text-base font-bold tabular-nums text-foreground">
              {formatRuntime(profile.stats.best_runtime_ms)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
