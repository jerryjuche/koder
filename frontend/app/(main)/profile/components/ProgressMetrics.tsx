"use client";

import { useMemo, useEffect, useState } from "react";
import { UserProfile } from "@/lib/types";
import { motion } from "motion/react";
import { BookOpen, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ActivityGauge } from "@/components/ui/activity-gauge";

interface ProgressMetricsProps {
  profile: UserProfile;
}

const difficultyConfig: Record<string, { label: string; color: string; barColor: string; gradient: string }> = {
  easy: { label: "Easy", color: "text-amber-400", barColor: "bg-amber-400", gradient: "from-amber-500/10 to-amber-600/5" },
  medium: { label: "Medium", color: "text-amber-500", barColor: "bg-amber-500", gradient: "from-amber-500/10 to-amber-600/5" },
  hard: { label: "Hard", color: "text-rose-400", barColor: "bg-rose-400", gradient: "from-rose-500/10 to-rose-600/5" },
};

const MODULE_GAUGE_COLORS: Record<string, string> = {
  "Arrays & Slices": "fill-blue-500 stroke-blue-500",
  "Strings & Runes": "fill-teal-500 stroke-teal-500",
  "Math & Recursion": "fill-purple-500 stroke-purple-500",
  "Data Structures": "fill-amber-500 stroke-amber-500",
  "Sorting & Searching": "fill-rose-500 stroke-rose-500",
  "Hash Maps & Sets": "fill-violet-500 stroke-violet-500",
  "Concurrency": "fill-cyan-500 stroke-cyan-500",
  "Dynamic Programming": "fill-fuchsia-500 stroke-fuchsia-500",
  "Bit Manipulation": "fill-slate-500 stroke-slate-500",
  "Trees & Graphs": "fill-sky-500 stroke-sky-500",
  "Error Handling": "fill-red-500 stroke-red-500",
  "Testing": "fill-teal-500 stroke-teal-500",
  "File I/O": "fill-orange-500 stroke-orange-500",
  "Networking": "fill-indigo-500 stroke-indigo-500",
  "Interfaces & Generics": "fill-pink-500 stroke-pink-500",
  "Pointers": "fill-stone-500 stroke-stone-500",
  "OOP & Composition": "fill-lime-500 stroke-lime-500",
  "Design Patterns": "fill-yellow-500 stroke-yellow-500",
};

function AnimatedBar({ percent, color }: { percent: number; color: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return (
    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={mounted ? { width: `${percent}%` } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

export default function ProgressMetrics({ profile }: ProgressMetricsProps) {
  const diffProgress = profile.progress_by_difficulty;

  const displayModules = useMemo(() => {
    if (!profile.module_proficiency || Object.keys(profile.module_proficiency).length === 0) {
      return [];
    }
    return Object.entries(profile.module_proficiency)
      .sort(([a], [b]) => a.localeCompare(b));
  }, [profile.module_proficiency]);

  const totalSolved = Object.values(diffProgress).reduce(
    (sum, d) => sum + d.solved,
    0
  );
  const totalProblems = Object.values(diffProgress).reduce(
    (sum, d) => sum + d.total,
    0
  );
  const overallPercent = totalProblems > 0 ? (totalSolved / totalProblems) * 100 : 0;

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      className="space-y-6"
    >
      {/* Difficulty Breakdown */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
        }}
      >
        <Card className="p-6 bg-black/20 backdrop-blur-sm border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Layers size={18} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Difficulty Breakdown</h3>
              <p className="text-xs text-white/40">Progress across problem difficulty levels</p>
            </div>
          </div>

          <div className="space-y-5">
            {Object.entries(diffProgress).map(([key, stats]) => {
              const config = difficultyConfig[key] || {
                label: key,
                color: "text-white/60",
                barColor: "bg-white/30",
                gradient: "from-white/5 to-white/5",
              };
              const percentage = stats.total === 0 ? 0 : (stats.solved / stats.total) * 100;
              return (
                <div key={key} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-sm font-semibold ${config.color}`}>
                        {config.label}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-white/50 bg-white/5">
                        {stats.solved}/{stats.total}
                      </Badge>
                    </div>
                    <span className="text-xs text-white/40 font-mono">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <AnimatedBar percent={percentage} color={config.barColor} />
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-white">Overall Progress</span>
              <span className="text-xs text-white/50 font-mono">
                {totalSolved}/{totalProblems}
              </span>
            </div>
            <AnimatedBar percent={overallPercent} color="bg-gradient-to-r from-amber-600 to-amber-400" />
          </div>
        </Card>
      </motion.div>

      {/* Module Proficiency */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
        }}
      >
        <Card className="p-6 bg-black/20 backdrop-blur-sm border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <BookOpen size={18} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Module Proficiency</h3>
              <p className="text-xs text-white/40">Your mastery by topic area</p>
            </div>
          </div>

          {displayModules.length === 0 ? (
            <div className="text-center py-10 text-white/40 text-sm border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
              <BookOpen size={32} className="mx-auto mb-3 text-white/20" />
              No modules available yet. Problems will appear here once the curriculum is ingested.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
              {displayModules.map(([moduleName, stats]) => (
                <ActivityGauge
                  key={moduleName}
                  value={stats.solved}
                  max={stats.total}
                  label={moduleName}
                  colorClass={MODULE_GAUGE_COLORS[moduleName]}
                />
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
