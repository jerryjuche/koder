"use client";

import { UserProfile } from "@/lib/types";
import { Trophy, Star, Target, CheckCircle2, Flame, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  profile: UserProfile;
}

export default function StatsOverview({ profile }: StatsOverviewProps) {
  const stats = [
    {
      title: "Level",
      value: profile.level,
      icon: Star,
      color: "text-brand-muted-gold",
      bg: "bg-brand-muted-gold/10",
    },
    {
      title: "Total XP",
      value: profile.xp.toLocaleString(),
      icon: Award,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      title: "Global Rank",
      value: `#${profile.global_rank || "-"}`,
      icon: Trophy,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      title: "Total Solved",
      value: profile.stats.solved_count,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      title: "Success Rate",
      value: `${((profile.stats.solved_count / Math.max(1, profile.stats.attempted_count)) * 100).toFixed(1)}%`,
      icon: Target,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
    },
    {
      title: "Current Streak",
      value: `${profile.stats.current_streak_days} Days`,
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.title} 
            className="group hover:-translate-y-1 transition-transform duration-300 overflow-hidden relative border-brand-charcoal-border/50"
          >
            {/* Subtle gradient glow effect on hover */}
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300", stat.bg)}></div>
            <CardContent className="p-5 flex flex-col items-start gap-4">
              <div className={cn("p-2.5 rounded-xl border border-brand-charcoal-border/50", stat.bg)}>
                <Icon size={20} className={stat.color} />
              </div>
              <div>
                <p className="text-xs text-brand-offwhite-muted font-medium tracking-wide uppercase mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-brand-offwhite font-mono">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
