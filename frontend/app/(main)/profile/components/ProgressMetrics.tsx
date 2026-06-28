"use client";

import { UserProfile } from "@/lib/types";
import { BookOpen, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProgressMetricsProps {
  profile: UserProfile;
}

const difficultyConfig: Record<string, { label: string; color: string; barColor: string }> = {
  easy: { label: "Easy", color: "text-emerald-400", barColor: "bg-emerald-400" },
  medium: { label: "Medium", color: "text-amber-400", barColor: "bg-amber-400" },
  hard: { label: "Hard", color: "text-rose-400", barColor: "bg-rose-400" },
};

export default function ProgressMetrics({ profile }: ProgressMetricsProps) {
  const diffProgress = profile.progress_by_difficulty;

  const defaultModules: Record<string, { solved: number; total: number }> = {
    "Math & Recursion": { solved: 5, total: 10 },
    "Arrays & Strings": { solved: 12, total: 20 },
    "Data Structures": { solved: 3, total: 15 },
    Concurrency: { solved: 1, total: 5 },
  };

  const displayModules =
    profile.module_proficiency && Object.keys(profile.module_proficiency).length > 0
      ? profile.module_proficiency
      : defaultModules;

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

        <div className="space-y-5">
          {Object.entries(displayModules).map(([moduleName, stats]) => {
            const percentage = stats.total === 0 ? 0 : (stats.solved / stats.total) * 100;
            return (
              <div key={moduleName} className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {moduleName}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded-full border border-border">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <Progress value={percentage} className="h-1.5" />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {stats.solved} solved
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {stats.total} total
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
