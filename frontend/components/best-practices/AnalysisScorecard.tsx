"use client";

import type { CSSProperties } from "react";
import { Progress } from "@/components/ui/progress";
import type { SolutionExplanation } from "@/lib/types";

export function gradeScore(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Excellent", color: "#10b981" };
  if (score >= 70) return { label: "Good", color: "#14b8a6" };
  if (score >= 50) return { label: "Fair", color: "#f59e0b" };
  return { label: "Needs work", color: "#f43f5e" };
}

const DIMENSIONS: Array<{
  label: string;
  score: (e: SolutionExplanation) => number;
}> = [
  { label: "Efficiency", score: (e) => e.efficiency_score },
  { label: "Readability", score: (e) => e.readability_score },
  { label: "Correctness", score: (e) => e.correctness_score },
  { label: "Best practices", score: (e) => e.best_practices_score },
];

export function AnalysisScorecard({
  explanation,
}: {
  explanation: SolutionExplanation;
}) {
  const overall = gradeScore(explanation.quality_score);

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold leading-none tabular-nums text-foreground">
          {explanation.quality_score}
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: overall.color }}
        >
          {overall.label}
        </span>
        <Progress
          value={explanation.quality_score}
          className="h-1.5 flex-1 [&>div]:bg-[var(--quality-color)]"
          style={{ "--quality-color": overall.color } as CSSProperties}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {DIMENSIONS.map((d) => {
          const g = gradeScore(d.score(explanation));
          return (
            <span
              key={d.label}
              className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: g.color }}
              />
              <span>{d.label}</span>
              <span className="font-semibold tabular-nums text-foreground">
                {d.score(explanation)}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}