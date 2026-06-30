"use client";

import { useMemo } from "react";
import {
  Trophy,
  CheckCircle2,
  GitPullRequest,
} from "lucide-react";
import { UserProfile, ActivityEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getAchievements } from "@/lib/achievements";

interface ActivityFeedProps {
  profile: UserProfile;
  activity: ActivityEntry[];
  contributionCount: number;
}

export default function ActivityFeed({ profile, activity, contributionCount }: ActivityFeedProps) {
  const achievements = useMemo(() => getAchievements(profile), [profile]);
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
                    ? "hover:bg-muted/50"
                    : "opacity-30 grayscale"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    a.unlocked ? a.bg + " " + a.border : "bg-transparent"
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
