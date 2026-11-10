"use client";

import { Loader2 } from "lucide-react";
import type { SolutionExplanation } from "@/lib/types";
import { AnalysisSummary } from "./AnalysisSummary";
import { AnalysisComplexity } from "./AnalysisComplexity";
import { QualityGauge, QualityGaugeSkeleton } from "./QualityGauge";
import { ScoreRadar } from "./ScoreRadar";

function Shimmer({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted/40 ${className ?? ""}`} />;
}

export function AnalysisHydration({
  partial,
}: {
  partial: Partial<SolutionExplanation> | null;
}) {
  const hasRadar =
    partial &&
    partial.efficiency_score != null &&
    partial.readability_score != null &&
    partial.correctness_score != null &&
    partial.best_practices_score != null;

  return (
    <div className="flex flex-col space-y-4">
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

      {/* Telemetry shimmer grid — mirrors the rendered layout */}
      <div className="grid shrink-0 grid-cols-2 gap-3">
        {partial?.quality_score != null ? (
          <QualityGauge score={partial.quality_score} />
        ) : (
          <QualityGaugeSkeleton />
        )}
        {hasRadar ? (
          <ScoreRadar
            efficiency={partial!.efficiency_score!}
            readability={partial!.readability_score!}
            correctness={partial!.correctness_score!}
            bestPractices={partial!.best_practices_score!}
          />
        ) : (
          <div className="flex flex-col rounded-xl border border-border bg-card/60 p-2.5">
            <Shimmer className="mb-2 h-2.5 w-24" />
            <Shimmer className="h-[150px] w-full rounded-lg" />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {partial?.summary ? (
          <AnalysisSummary summary={partial.summary} />
        ) : (
          <div className="space-y-2">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-5/6" />
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
    </div>
  );
}