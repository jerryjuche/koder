"use client";

import { UserProfile } from "@/lib/types";
import { BookOpen } from "lucide-react";

interface ProgressMetricsProps {
  profile: UserProfile;
}

export default function ProgressMetrics({ profile }: ProgressMetricsProps) {
  // Aggregate default modules if empty for visual consistency
  const defaultModules = {
    "Math & Recursion": { solved: 5, total: 10 },
    "Arrays & Strings": { solved: 12, total: 20 },
    "Data Structures": { solved: 3, total: 15 },
    "Concurrency": { solved: 1, total: 5 },
  };

  const displayModules = 
    profile.module_proficiency && Object.keys(profile.module_proficiency).length > 0 
      ? profile.module_proficiency 
      : defaultModules;

  return (
    <div className="bg-brand-charcoal-card rounded-2xl border border-brand-charcoal-border p-6 hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-brand-charcoal-border/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded bg-brand-muted-gold/10 flex items-center justify-center">
          <BookOpen size={18} className="text-brand-muted-gold" />
        </div>
        <h3 className="text-lg font-bold text-brand-offwhite">
          Module Proficiency
        </h3>
      </div>

      <div className="space-y-5">
        {Object.entries(displayModules).map(([moduleName, stats]) => {
          const percentage = stats.total === 0 ? 0 : (stats.solved / stats.total) * 100;
          return (
            <div key={moduleName} className="group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-brand-offwhite group-hover:text-brand-muted-gold transition-colors">
                  {moduleName}
                </span>
                <span className="text-xs text-brand-offwhite-muted font-mono bg-brand-charcoal-base px-2 py-0.5 rounded-full border border-brand-charcoal-border">
                  {percentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-brand-charcoal-base rounded-full h-1.5 overflow-hidden border border-brand-charcoal-border/50 relative">
                <div
                  className="absolute inset-y-0 left-0 bg-brand-muted-gold/20 blur-[2px]"
                  style={{ width: `${percentage}%` }}
                />
                <div
                  className="bg-brand-muted-gold h-full rounded-full transition-all duration-1000 ease-out relative z-10"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-brand-offwhite-muted uppercase tracking-wider">{stats.solved} solved</span>
                <span className="text-[10px] text-brand-offwhite-muted uppercase tracking-wider">{stats.total} total</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
