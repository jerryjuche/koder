"use client";

import { UserProfile } from "@/lib/types";
import { Trophy, Hash, CheckCircle2, Target, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  profile: UserProfile;
}

export default function StatsOverview({ profile }: StatsOverviewProps) {
  const successRate = profile.stats.attempted_count > 0
    ? ((profile.stats.solved_count / profile.stats.attempted_count) * 100).toFixed(1)
    : "0.0";
  const xpProgress = profile.xp % 1000;
  const xpPercent = Math.min(100, Math.max(5, (xpProgress / 1000) * 100));

  const statCards = [
    {
      label: "Current Level",
      value: profile.level,
      icon: Trophy,
      color: "text-brand-muted-gold",
      bg: "bg-brand-muted-gold/10",
      border: "border-brand-muted-gold/20",
      sub: `${profile.xp.toLocaleString()} Total XP`,
      progress: true,
      progressValue: xpPercent,
      progressLabel: `${Math.floor(xpPercent)}%`,
    },
    {
      label: "Global Rank",
      value: `#${profile.global_rank || "-"}`,
      icon: Hash,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
    },
    {
      label: "Total Solved",
      value: profile.stats.solved_count,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      icon: Target,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      border: "border-rose-400/20",
    },
    {
      label: "Current Streak",
      value: `${profile.stats.current_streak_days} Day${profile.stats.current_streak_days !== 1 ? "s" : ""}`,
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      border: "border-orange-400/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={cn(
              "bg-brand-charcoal-card rounded-2xl border p-5",
              "hover:-translate-y-0.5 transition-all duration-300",
              "shadow-lg shadow-brand-charcoal-border/5",
              card.border
            )}
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("p-2 rounded-lg", card.bg)}>
                  <Icon size={16} className={card.color} />
                </div>
                <span className="text-[10px] font-bold text-brand-offwhite-muted uppercase tracking-widest">
                  {card.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-brand-offwhite font-mono">
                {card.value}
              </div>
              {card.sub && (
                <p className="text-xs text-brand-offwhite-muted mt-1">{card.sub}</p>
              )}
              {card.progress && (
                <div className="mt-3">
                  <div className="w-full bg-brand-charcoal-base rounded-full h-1.5 overflow-hidden border border-brand-charcoal-border/50">
                    <div
                      className="bg-brand-muted-gold h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                      style={{ width: `${card.progressValue}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
