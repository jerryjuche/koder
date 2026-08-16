"use client";

import { useState } from "react";
import type { SolutionExplanation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnalysisHydration } from "./AnalysisHydration";
import { AnalysisError, type ExplainErrorInfo } from "./AnalysisError";
import { QualityGauge } from "./QualityGauge";
import { ScoreRadar } from "./ScoreRadar";
import { AnalysisSummary } from "./AnalysisSummary";
import { AnalysisApproach } from "./AnalysisApproach";
import { AnalysisTechniques } from "./AnalysisTechniques";
import { AnalysisPoints } from "./AnalysisPoints";
import { AnalysisComplexity } from "./AnalysisComplexity";
import { ComplexityScale } from "./ComplexityScale";

type TabType = "overview" | "approach" | "points";

const TABS: Array<{ id: TabType; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "approach", label: "Approach" },
  { id: "points", label: "Pros & Cons" },
];

export function ExplainPanel({
  explanation,
  loading,
  error,
  partial,
  onRetry,
}: {
  explanation: SolutionExplanation | null;
  loading: boolean;
  error: ExplainErrorInfo | null;
  partial: Partial<SolutionExplanation> | null;
  onRetry: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  if (loading && !explanation) {
    return <AnalysisHydration partial={partial} />;
  }

  if (!loading && !explanation && error) {
    return <AnalysisError error={error} onRetry={onRetry} />;
  }

  if (!explanation) return null;

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Top Telemetry: Quality Gauge + Score Radar */}
      <div className="grid shrink-0 grid-cols-2 gap-3">
        <QualityGauge score={explanation.quality_score} />
        <ScoreRadar
          efficiency={explanation.efficiency_score}
          readability={explanation.readability_score}
          correctness={explanation.correctness_score}
          bestPractices={explanation.best_practices_score}
        />
      </div>

      {/* Tab Controls */}
      <div className="flex shrink-0 items-center gap-1 border-b border-border/80 pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              activeTab === tab.id
                ? "border border-[#7F56D9]/30 bg-[#7F56D9]/20 text-[#9E77ED]"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable Tab Content */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {activeTab === "overview" && (
          <>
            <AnalysisSummary summary={explanation.summary} />
            <AnalysisComplexity
              time={explanation.time_complexity}
              space={explanation.space_complexity}
            />
            <ComplexityScale />
          </>
        )}

        {activeTab === "approach" && (
          <>
            <AnalysisApproach approach={explanation.approach} />
            <AnalysisTechniques techniques={explanation.key_techniques} />
          </>
        )}

        {activeTab === "points" && (
          <AnalysisPoints
            strengths={explanation.strengths}
            improvements={explanation.improvements}
          />
        )}
      </div>
    </div>
  );
}