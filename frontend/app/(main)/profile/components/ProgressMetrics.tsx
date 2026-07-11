"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/types";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { motion } from "motion/react";
import { Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProgressMetricsProps {
  profile: UserProfile;
}

const difficultyConfig: Record<string, { label: string; color: string; barColor: string; gradient: string }> = {
  easy: { label: "Easy", color: "text-amber-400", barColor: "bg-amber-400", gradient: "from-amber-500/10 to-amber-600/5" },
  medium: { label: "Medium", color: "text-amber-500", barColor: "bg-amber-500", gradient: "from-amber-500/10 to-amber-600/5" },
  hard: { label: "Hard", color: "text-rose-400", barColor: "bg-rose-400", gradient: "from-rose-500/10 to-rose-600/5" },
};

function AnimatedBar({ percent, color }: { percent: number; color: string }) {
  const mounted = useHasMounted();
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

  const totalSolved = Object.values(diffProgress).reduce(
    (sum, d) => sum + d.solved,
    0
  );
  const totalProblems = Object.values(diffProgress).reduce(
    (sum, d) => sum + d.total,
    0
  );
  const overallPercent = totalProblems > 0 ? (totalSolved / totalProblems) * 100 : 0;

  const mounted = useHasMounted();

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
        <Card className="p-6 bg-[#242430]/60 backdrop-blur-sm border border-white/6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#7B8CBB]/10 flex items-center justify-center border border-[#7B8CBB]/20">
              <Layers size={18} className="text-[#7B8CBB]" />
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

          <div className="mt-5 pt-4 border-t border-white/6">
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
    </motion.div>
  );
}
