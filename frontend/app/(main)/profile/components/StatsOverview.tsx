"use client";

import { useEffect, useRef, useState } from "react";
import { UserProfile } from "@/lib/types";
import { motion, useMotionValue, animate } from "motion/react";
import {
  Trophy,
  Hash,
  CheckCircle2,
  Target,
  Flame,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  profile: UserProfile;
}

function AnimatedNumber({ from = 0, to, duration = 2 }: { from?: number; to: number; duration?: number }) {
  const motionValue = useMotionValue(from);
  const [displayValue, setDisplayValue] = useState(from);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (v) => {
      setDisplayValue(Math.round(v));
    });
    return unsubscribe;
  }, [motionValue]);

  useEffect(() => {
    if (!hasAnimated) {
      setHasAnimated(true);
      const controls = animate(motionValue, to, {
        duration,
        ease: [0.16, 1, 0.3, 1],
      });
      return controls.stop;
    }
  }, [to, duration, motionValue, hasAnimated]);

  return <span className="tabular-nums">{displayValue}</span>;
}

type StatDef = {
  label: string;
  icon: React.ElementType;
  gradient: string;
  borderGlow: string;
  iconBg: string;
  iconColor: string;
  tooltip: string;
};

const statConfigs: StatDef[] = [
  {
    label: "Level",
    icon: Trophy,
    gradient: "from-amber-500/20 to-amber-600/5",
    borderGlow: "hover:border-amber-500/30",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    tooltip: "Your current level is based on total XP earned. Each level requires 1,000 XP.",
  },
  {
    label: "Global Rank",
    icon: Hash,
    gradient: "from-blue-500/20 to-blue-600/5",
    borderGlow: "hover:border-blue-500/30",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    tooltip: "Your position on the leaderboard among all students.",
  },
  {
    label: "Solved",
    icon: CheckCircle2,
    gradient: "from-emerald-500/20 to-emerald-600/5",
    borderGlow: "hover:border-emerald-500/30",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    tooltip: "Problems you've solved out of total attempted.",
  },
  {
    label: "Success Rate",
    icon: Target,
    gradient: "from-cyan-500/20 to-cyan-600/5",
    borderGlow: "hover:border-cyan-500/30",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    tooltip: "Percentage of attempted problems that you've successfully solved.",
  },
  {
    label: "Streak",
    icon: Flame,
    gradient: "from-orange-500/20 to-orange-600/5",
    borderGlow: "hover:border-orange-500/30",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-400",
    tooltip: "Consecutive days with at least one passed submission.",
  },
  {
    label: "Best Runtime",
    icon: Zap,
    gradient: "from-purple-500/20 to-purple-600/5",
    borderGlow: "hover:border-purple-500/30",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    tooltip: "Your fastest solution execution time across all problems.",
  },
];

export default function StatsOverview({ profile }: StatsOverviewProps) {
  const successRate = profile.stats.attempted_count > 0
    ? parseFloat(((profile.stats.solved_count / profile.stats.attempted_count) * 100).toFixed(1))
    : 0;

  const formatRuntime = (ms: number) => {
    if (ms <= 0) return "—";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const items: {
    config: StatDef;
    value: string;
    num?: number;
    sub?: string;
  }[] = [
    { config: statConfigs[0], value: String(profile.level), num: profile.level, sub: `${profile.xp.toLocaleString()} Total XP` },
    { config: statConfigs[1], value: `#${profile.global_rank || "-"}` },
    { config: statConfigs[2], value: String(profile.stats.solved_count), num: profile.stats.solved_count, sub: `${profile.stats.attempted_count} attempted` },
    { config: statConfigs[3], value: `${successRate}%` },
    { config: statConfigs[4], value: `${profile.stats.current_streak_days}d`, num: profile.stats.current_streak_days },
    { config: statConfigs[5], value: formatRuntime(profile.stats.best_runtime_ms) },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07 } },
      }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
    >
      {items.map(({ config, value, num, sub }) => (
        <motion.div
          key={config.label}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Card className={cn(
                  "p-5 relative overflow-hidden cursor-default",
                  "bg-black/20 backdrop-blur-sm border border-white/5",
                  "transition-shadow duration-300",
                  "hover:shadow-xl hover:shadow-black/20",
                  config.borderGlow
                )}>
                  <div className={cn(
                    "absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br pointer-events-none",
                    config.gradient
                  )} />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn("p-2 rounded-lg", config.iconBg)}>
                        <config.icon size={15} className={config.iconColor} />
                      </div>
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        {config.label}
                      </span>
                    </div>
                    <div className={cn("text-2xl font-bold font-mono", config.iconColor)}>
                      {num !== undefined ? (
                        <AnimatedNumber to={num} duration={1.5} />
                      ) : (
                        <span className="tabular-nums">{value}</span>
                      )}
                    </div>
                    {sub && (
                      <p className="text-xs text-white/40 mt-1">{sub}</p>
                    )}
                  </div>
                </Card>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[200px] text-xs bg-black/90 border border-white/10 text-white/80 backdrop-blur-md">
              {config.tooltip}
            </TooltipContent>
          </Tooltip>
        </motion.div>
      ))}
    </motion.div>
  );
}
