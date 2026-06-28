"use client";

import { UserProfile } from "@/lib/types";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressMetricsProps {
  profile: UserProfile;
}

export default function ProgressMetrics({ profile }: ProgressMetricsProps) {
  const defaultModules = {
    "Math & Recursion": { solved: 5, total: 10 },
    "Arrays & Strings": { solved: 12, total: 20 },
    "Data Structures": { solved: 3, total: 15 },
    Concurrency: { solved: 1, total: 5 },
  };

  const displayModules =
    profile.module_proficiency &&
    Object.keys(profile.module_proficiency).length > 0
      ? profile.module_proficiency
      : defaultModules;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen size={18} className="text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Module Proficiency
        </h3>
      </div>

      <div className="space-y-5">
        {Object.entries(displayModules).map(([moduleName, stats]) => {
          const percentage =
            stats.total === 0 ? 0 : (stats.solved / stats.total) * 100;
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
  );
}
