"use client";

import { AnalysisLabel } from "./AnalysisLabel";

export function AnalysisTechniques({ techniques }: { techniques: string[] }) {
  if (!techniques.length) return null;
  return (
    <div>
      <AnalysisLabel>Key techniques</AnalysisLabel>
      <div className="flex flex-wrap gap-1.5">
        {techniques.map((t, i) => (
          <span
            key={i}
            className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}