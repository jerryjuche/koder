"use client";

import { AnalysisLabel } from "./AnalysisLabel";

export function AnalysisSummary({ summary }: { summary: string }) {
  return (
    <div>
      <AnalysisLabel>Summary</AnalysisLabel>
      <p className="text-sm leading-relaxed text-brand-offwhite/90">{summary}</p>
    </div>
  );
}