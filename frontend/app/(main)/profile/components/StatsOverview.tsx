"use client";

import { UserProfile } from "@/lib/types";
import {
  Trophy,
  Hash,
  CheckCircle2,
  Target,
  Flame,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatsOverviewProps {
  profile: UserProfile;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  progress?: number;
  tooltip: string;
}

function StatCard({ label, value, icon: Icon, sub, progress, tooltip }: StatCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="p-5 hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-300 shadow-sm cursor-default">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-muted/50">
              <Icon size={15} className="text-muted-foreground" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {label}
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono tabular-nums">
            {value}
          </div>
          {sub && (
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          )}
          {progress !== undefined && (
            <div className="mt-3">
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
        </Card>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px] text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export default function StatsOverview({ profile }: StatsOverviewProps) {
  const successRate = profile.stats.attempted_count > 0
    ? ((profile.stats.solved_count / profile.stats.attempted_count) * 100).toFixed(1)
    : "0.0";
  const xpProgress = profile.xp % 1000;
  const xpPercent = Math.min(100, Math.max(5, (xpProgress / 1000) * 100));

  const formatRuntime = (ms: number) => {
    if (ms <= 0) return "—";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const stats: StatCardProps[] = [
    {
      label: "Level",
      value: profile.level,
      icon: Trophy,
      sub: `${profile.xp.toLocaleString()} Total XP`,
      progress: xpPercent,
      tooltip: "Your current level is based on total XP earned. Each level requires 1,000 XP.",
    },
    {
      label: "Global Rank",
      value: `#${profile.global_rank || "-"}`,
      icon: Hash,
      tooltip: "Your position on the leaderboard among all students.",
    },
    {
      label: "Solved",
      value: profile.stats.solved_count,
      icon: CheckCircle2,
      sub: `${profile.stats.attempted_count} attempted`,
      tooltip: "Problems you've solved out of total attempted.",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      icon: Target,
      tooltip: "Percentage of attempted problems that you've successfully solved.",
    },
    {
      label: "Streak",
      value: `${profile.stats.current_streak_days}d`,
      icon: Flame,
      tooltip: "Consecutive days with at least one passed submission.",
    },
    {
      label: "Best Runtime",
      value: formatRuntime(profile.stats.best_runtime_ms),
      icon: Zap,
      tooltip: "Your fastest solution execution time across all problems.",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
