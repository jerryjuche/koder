"use client";

import { UserProfile } from "@/lib/types";
import { Hash, Target, Zap } from "lucide-react";

interface StatsOverviewProps {
  profile: UserProfile;
}

export default function StatsOverview({ profile }: StatsOverviewProps) {
  const attemptedCount = profile.stats.attempted_count;
  const solvedCount = profile.stats.solved_count;
  const successRate = attemptedCount > 0
    ? parseFloat(((solvedCount / attemptedCount) * 100).toFixed(1))
    : 0;

  const formatRuntime = (ms: number) => {
    if (ms <= 0) return "—";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="rounded-xl bg-[#242430]/60 backdrop-blur-sm border border-white/6 overflow-hidden">
      <div className="flex items-stretch divide-x divide-white/10">
        <div className="flex-1 flex flex-col items-center justify-center py-4 px-2 gap-1">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Rank</span>
          <div className="flex items-center gap-1.5">
            <Hash size={13} className="text-[#7B8CBB]" />
            <span className="text-lg font-extrabold font-mono text-[#7B8CBB]">{profile.global_rank ?? "-"}</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-4 px-2 gap-1">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Success Rate</span>
          <div className="flex items-center gap-1.5">
            <Target size={13} className="text-amber-400" />
            <span className="text-lg font-extrabold font-mono text-amber-400">{successRate}%</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-4 px-2 gap-1">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Best Runtime</span>
          <div className="flex items-center gap-1.5">
            <Zap size={13} className="text-amber-400" />
            <span className="text-lg font-extrabold font-mono text-amber-400">{formatRuntime(profile.stats.best_runtime_ms)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
