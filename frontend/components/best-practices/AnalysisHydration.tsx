"use client";

import { Loader2 } from "lucide-react";
import type { SolutionExplanation } from "@/lib/types";
import { AnalysisSummary } from "./AnalysisSummary";
import { AnalysisApproach } from "./AnalysisApproach";
import { AnalysisScorecard } from "./AnalysisScorecard";

function Shimmer({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted/40 ${className ?? ""}`} />;
}

export function AnalysisHydration({
  partial,
}: {
  partial: Partial<SolutionExplanation> | null;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Loader2 size={15} className="animate-spin text-purple-300" />
        Generating analysis
        <span className="rounded-md border border-purple-700/40 bg-purple-900/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-200">
          NIM
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted/40">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-purple-500/60" />
      </div>

      {partial?.summary ? (
        <AnalysisSummary summary={partial.summary} />
      ) : (
        <div className="space-y-2">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-5/6" />
        </div>
      )}

      {partial?.quality_score != null ? (
        <AnalysisScorecard explanation={partial as SolutionExplanation} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-muted/40 p-3">
            <Shimmer className="h-28 w-28 rounded-full" />
            <Shimmer className="h-3 w-24" />
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border/60 bg-muted/40 p-3">
            <Shimmer className="h-28 w-44" />
            <Shimmer className="h-3 w-20" />
          </div>
        </div>
      )}

      {partial?.approach ? (
        <AnalysisApproach approach={partial.approach} />
      ) : (
        <div className="space-y-2">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-2/3" />
        </div>
      )}
    </div>
  );
}
