"use client";

import { Loader2 } from "lucide-react";
import type { SolutionExplanation } from "@/lib/types";
import { AnalysisSummary } from "./AnalysisSummary";
import { AnalysisApproach } from "./AnalysisApproach";
import { AnalysisScorecard } from "./AnalysisScorecard";
import { AnalysisComplexity } from "./AnalysisComplexity";

function Shimmer({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted/40 ${className ?? ""}`} />;
}

export function AnalysisHydration({
  partial,
}: {
  partial: Partial<SolutionExplanation> | null;
}) {
  return (
    <div className="space-y-3">
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
          <Shimmer className="h-3 w-16" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-5/6" />
        </div>
      )}

      {partial?.quality_score != null ? (
        <AnalysisScorecard explanation={partial as SolutionExplanation} />
      ) : (
        <Shimmer className="h-16 w-full" />
      )}

      {partial?.approach ? (
        <AnalysisApproach approach={partial.approach} />
      ) : (
        <div className="space-y-2">
          <Shimmer className="h-3 w-14" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-2/3" />
        </div>
      )}

      {partial?.time_complexity && partial?.space_complexity ? (
        <AnalysisComplexity
          time={partial.time_complexity}
          space={partial.space_complexity}
        />
      ) : (
        <Shimmer className="h-7 w-52" />
      )}
    </div>
  );
}