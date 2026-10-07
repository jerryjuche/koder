"use client";

import { UserProfile } from "@/lib/types";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { motion } from "motion/react";
import { Layers } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProgressMetricsProps {
  profile: UserProfile;
}

const difficultyConfig: Record<string, { label: string; color: string; barColor: string }> = {
  easy: { label: "Easy", color: "text-amber-400", barColor: "bg-amber-400" },
  medium: { label: "Medium", color: "text-amber-500", barColor: "bg-amber-500" },
  hard: { label: "Hard", color: "text-rose-400", barColor: "bg-rose-400" },
};

function AnimatedBar({ percent, color }: { percent: number; color: string }) {
  const mounted = useHasMounted();
  return (
    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
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
  const totalSolved = Object.values(diffProgress).reduce((sum, d) => sum + d.solved, 0);
  const totalProblems = Object.values(diffProgress).reduce((sum, d) => sum + d.total, 0);
  const overallPercent = totalProblems > 0 ? (totalSolved / totalProblems) * 100 : 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      className="space-y-4"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 16 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
        }}
      >
        <Card className="p-4 sm:p-5 bg-brand-charcoal-card border border-border/50">
          <div className="flex items-center gap-2.5 mb-4">
            <Layers size={18} className="text-[#7B8CBB] shrink-0" />
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">
                Difficulty Breakdown
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Progress across problem difficulty levels
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(diffProgress).map(([key, stats]) => {
              const config = difficultyConfig[key] || {
                label: key,
                color: "text-muted-foreground",
                barColor: "bg-white/30",
              };
              const percentage = stats.total === 0 ? 0 : (stats.solved / stats.total) * 100;
              return (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs font-mono tabular-nums text-muted-foreground">
                        {stats.solved}/{stats.total}
                      </span>
                    </div>
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <AnimatedBar percent={percentage} color={config.barColor} />
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-border/40">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-semibold text-foreground">Overall Progress</span>
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                {totalSolved}/{totalProblems}
              </span>
            </div>
            <AnimatedBar
              percent={overallPercent}
              color="bg-gradient-to-r from-amber-600 to-amber-400"
            />
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}