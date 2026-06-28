"use client";

import { useMemo } from "react";
import {
  Trophy,
  Target,
  Flame,
  Star,
  Zap,
  Award,
  Code,
  CheckCircle2,
  GitPullRequest,
} from "lucide-react";
import { UserProfile, ActivityEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  unlocked: boolean;
}

function allAchievements(profile: UserProfile): Achievement[] {
  const stats = profile.stats;
  return [
    {
      id: "first_blood",
      title: "First Blood",
      description: "Solved your first problem",
      icon: Target,
      color: "text-emerald-400",
      unlocked: stats.solved_count >= 1,
    },
    {
      id: "hot_streak",
      title: "Hot Streak",
      description: "Maintained a 3-day streak",
      icon: Flame,
      color: "text-orange-400",
      unlocked: stats.current_streak_days >= 3,
    },
    {
      id: "perfectionist",
      title: "Perfectionist",
      description: "Average quality score of 2.5+",
      icon: Star,
      color: "text-primary",
      unlocked: stats.average_stars >= 2.5 && stats.solved_count > 0,
    },
    {
      id: "speed_demon",
      title: "Speed Demon",
      description: "Submitted a solution under 10ms",
      icon: Zap,
      color: "text-cyan-400",
      unlocked: stats.best_runtime_ms > 0 && stats.best_runtime_ms < 10,
    },
    {
      id: "veteran",
      title: "Veteran Coder",
      description: "Reached level 10",
      icon: Award,
      color: "text-purple-400",
      unlocked: profile.level >= 10,
    },
    {
      id: "completionist",
      title: "Completionist",
      description: "Solved 50 problems",
      icon: Code,
      color: "text-blue-400",
      unlocked: stats.solved_count >= 50,
    },
  ];
}

interface ActivityFeedProps {
  profile: UserProfile;
  activity: ActivityEntry[];
  contributionCount: number;
}

export default function ActivityFeed({ profile, activity, contributionCount }: ActivityFeedProps) {
  const achievements = useMemo(() => allAchievements(profile), [profile]);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const recentActivity = useMemo(() => {
    return activity
      .filter((a) => a.solved > 0 || a.submissions > 0)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);
  }, [activity]);

  return (
    <div className="space-y-6">
      {/* Achievements summary */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">Achievements</h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md">
            {unlockedCount} / {achievements.length}
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {achievements.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.id}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                  a.unlocked
                    ? "bg-muted/30 hover:bg-muted/50"
                    : "opacity-30 grayscale"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    a.unlocked ? "bg-muted" : "bg-transparent"
                  )}
                >
                  <Icon size={18} className={a.unlocked ? a.color : "text-muted-foreground"} />
                </div>
                <span className="text-[9px] font-medium text-center text-muted-foreground leading-tight">
                  {a.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
          </div>
        </div>
        {recentActivity.length === 0 && contributionCount === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No activity yet. Start solving problems to see your progress.
          </div>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((day) => (
              <div
                key={day.date}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    day.solved > 0 ? "bg-emerald-400" : "bg-muted-foreground/30"
                  )}
                />
                <span className="text-xs text-muted-foreground w-24 shrink-0 font-mono">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex items-center gap-3 text-xs">
                  {day.solved > 0 && (
                    <span className="text-emerald-400 font-medium">
                      {day.solved} solved
                    </span>
                  )}
                  {day.submissions > 0 && (
                    <span className="text-muted-foreground">
                      {day.submissions} attempt{day.submissions !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {contributionCount > 0 && (
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="w-2 h-2 rounded-full shrink-0 bg-primary" />
                <span className="text-xs text-muted-foreground w-24 shrink-0 font-mono">
                  —
                </span>
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <GitPullRequest size={12} />
                  <span>{contributionCount} problem{contributionCount !== 1 ? "s" : ""} submitted</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
