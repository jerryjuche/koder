"use client";

import { UserProfile } from "@/lib/types";
import { Trophy, Hash, CheckCircle2, Target, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      sub: `${profile.xp.toLocaleString()} Total XP`,
      progress: xpPercent,
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
          <Card
            key={card.label}
            className={cn(
              "p-5 hover:-translate-y-0.5 transition-all duration-300 shadow-lg",
              card.border
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("p-2 rounded-lg", card.bg)}>
                <Icon size={16} className={card.color} />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {card.label}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">
              {card.value}
            </div>
            {card.sub && (
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            )}
            {"progress" in card && (
              <div className="mt-3">
                <Progress value={card.progress as number} className="h-1.5" />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
