"use client";

import { useMemo } from "react";
import { UserProfile } from "@/lib/types";
import { BookOpen, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ActivityGauge } from "@/components/ui/activity-gauge";

interface ProgressMetricsProps {
  profile: UserProfile;
}

const difficultyConfig: Record<string, { label: string; color: string; barColor: string }> = {
  easy: { label: "Easy", color: "text-emerald-400", barColor: "bg-emerald-400" },
  medium: { label: "Medium", color: "text-amber-400", barColor: "bg-amber-400" },
  hard: { label: "Hard", color: "text-rose-400", barColor: "bg-rose-400" },
};

const MODULE_GAUGE_COLORS: Record<string, string> = {
  "Arrays & Slices": "fill-blue-500 stroke-blue-500",
  "Strings & Runes": "fill-emerald-500 stroke-emerald-500",
  "Math & Recursion": "fill-purple-500 stroke-purple-500",
  "Data Structures": "fill-amber-500 stroke-amber-500",
  "Sorting & Searching": "fill-rose-500 stroke-rose-500",
  "Hash Maps & Sets": "fill-violet-500 stroke-violet-500",
  "Concurrency": "fill-cyan-500 stroke-cyan-500",
  "Dynamic Programming": "fill-fuchsia-500 stroke-fuchsia-500",
  "Bit Manipulation": "fill-slate-500 stroke-slate-500",
  "Trees & Graphs": "fill-green-500 stroke-green-500",
  "Error Handling": "fill-red-500 stroke-red-500",
  "Testing": "fill-teal-500 stroke-teal-500",
  "File I/O": "fill-orange-500 stroke-orange-500",
  "Networking": "fill-indigo-500 stroke-indigo-500",
  "Interfaces & Generics": "fill-pink-500 stroke-pink-500",
  "Pointers": "fill-stone-500 stroke-stone-500",
  "OOP & Composition": "fill-lime-500 stroke-lime-500",
  "Design Patterns": "fill-yellow-500 stroke-yellow-500",
};

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

  return (
    <div className="space-y-6">
      {/* Difficulty Breakdown */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
            <Layers size={18} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Difficulty Breakdown</h3>
        </div>

        <div className="space-y-4">
          {Object.entries(diffProgress).map(([key, stats]) => {
            const config = difficultyConfig[key] || {
              label: key,
              color: "text-muted-foreground",
              barColor: "bg-muted-foreground",
            };
            const percentage = stats.total === 0 ? 0 : (stats.solved / stats.total) * 100;
            return (
              <div key={key} className="group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${config.color}`}>
                      {config.label}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {stats.solved}/{stats.total}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${config.barColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground">Overall Progress</span>
            <span className="text-xs text-muted-foreground font-mono">
              {totalSolved}/{totalProblems} ({overallPercent.toFixed(0)}%)
            </span>
          </div>
          <Progress value={overallPercent} className="h-2 mt-2" />
        </div>
      </Card>

      {/* Module Proficiency */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
            <BookOpen size={18} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Module Proficiency</h3>
        </div>

        {displayModules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
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
    </div>
  );
}
