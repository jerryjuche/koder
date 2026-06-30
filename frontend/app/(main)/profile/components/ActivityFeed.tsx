"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  Trophy,
  CheckCircle2,
  GitPullRequest,
  Zap,
  Code,
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <div className="p-5 rounded-xl bg-black/20 backdrop-blur-sm border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              <h3 className="font-semibold text-white text-sm">Achievements</h3>
            </div>
            <span className="text-xs text-white/40 font-mono bg-white/5 px-2 py-1 rounded-md">
              {unlockedCount} / {achievements.length}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {achievements.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.05 + i * 0.04 }}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                    a.unlocked
                      ? "hover:bg-white/5 cursor-default"
                      : "opacity-25 grayscale"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border",
                      a.unlocked
                        ? a.bg + " " + a.border
                        : "bg-transparent border-white/5"
                    )}
                  >
                    <Icon size={18} className={a.unlocked ? a.color : "text-white/30"} />
                  </div>
                  <span className="text-[9px] font-medium text-center text-white/40 leading-tight">
                    {a.title}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Recent activity — Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        <div className="p-5 rounded-xl bg-black/20 backdrop-blur-sm border border-white/5">
          <div className="flex items-center gap-2 mb-5">
            <Zap size={16} className="text-amber-400" />
            <h3 className="font-semibold text-white text-sm">Recent Activity</h3>
          </div>

          {recentActivity.length === 0 && contributionCount === 0 ? (
            <div className="text-center py-8 text-white/40 text-sm border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
              <Code size={28} className="mx-auto mb-2 text-white/20" />
              No activity yet. Start solving problems to see your progress.
            </div>
          ) : (
            <div className="relative">
              {/* Timeline vertical line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-amber-500/30 via-white/10 to-transparent" />

              <div className="space-y-0">
                {recentActivity.map((day) => {
                  const date = new Date(day.date);
                  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                  const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  return (
                    <div key={day.date} className="flex items-start gap-4 relative py-2 group">
                      {/* Timeline dot */}
                      <div className={cn(
                        "relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        "border-2 transition-all duration-200",
                        day.solved > 0
                          ? "border-amber-500/50 bg-amber-500/20 group-hover:bg-amber-500/30 group-hover:shadow-lg group-hover:shadow-amber-500/10"
                          : "border-white/10 bg-white/5"
                      )}>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          day.solved > 0 ? "bg-amber-400" : "bg-white/20"
                        )} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/30 font-mono">
                            {dayName}
                          </span>
                          <span className="text-xs text-white/50 font-mono">
                            {monthDay}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {day.solved > 0 && (
                            <span className="text-xs font-medium text-amber-400 flex items-center gap-1">
                              <CheckCircle2 size={11} />
                              {day.solved} solved
                            </span>
                          )}
                          {day.submissions > 0 && (
                            <span className="text-xs text-white/40 flex items-center gap-1">
                              <Code size={11} />
                              {day.submissions} attempt{day.submissions !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {contributionCount > 0 && (
                <div className="flex items-start gap-4 relative py-2 group">
                  <div className="relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 border-amber-500/50 bg-amber-500/20">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                      <GitPullRequest size={12} />
                      <span>{contributionCount} problem contribution{contributionCount !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
