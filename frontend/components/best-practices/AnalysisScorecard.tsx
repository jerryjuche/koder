"use client";

import { Eye, ShieldCheck, ThumbsUp, Zap } from "lucide-react";
import type { SolutionExplanation } from "@/lib/types";
import { gradeScore, QualityGauge } from "./QualityGauge";
import { ScoreRadar } from "./ScoreRadar";
import { MetricTile } from "./MetricTile";

export function AnalysisScorecard({
  explanation,
}: {
  explanation: SolutionExplanation;
}) {
  const hasSubScores =
    (explanation.efficiency_score ?? 0) +
      (explanation.readability_score ?? 0) +
      (explanation.correctness_score ?? 0) +
      (explanation.best_practices_score ?? 0) >
    0;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
        <QualityGauge score={explanation.quality_score} label="Overall quality" />
        <ScoreRadar
          efficiency={explanation.efficiency_score}
          readability={explanation.readability_score}
          correctness={explanation.correctness_score}
          bestPractices={explanation.best_practices_score}
        />
      </div>

      {hasSubScores && (
        <div className="stats">
          <MetricTile
            icon={Zap}
            label="Efficiency"
            value={`${explanation.efficiency_score}/100`}
            sublabel={gradeScore(explanation.efficiency_score).label}
            tone="emerald"
          />
          <MetricTile
            icon={Eye}
            label="Readability"
            value={`${explanation.readability_score}/100`}
            sublabel={gradeScore(explanation.readability_score).label}
          />
          <MetricTile
            icon={ShieldCheck}
            label="Correctness"
            value={`${explanation.correctness_score}/100`}
            sublabel={gradeScore(explanation.correctness_score).label}
          />
          <MetricTile
            icon={ThumbsUp}
            label="Best practices"
            value={`${explanation.best_practices_score}/100`}
            sublabel={gradeScore(explanation.best_practices_score).label}
          />
        </div>
      )}
    </div>
  );
}
