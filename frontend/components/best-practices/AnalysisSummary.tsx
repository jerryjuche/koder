"use client";

import { AnalysisSection } from "./AnalysisSection";

export function AnalysisSummary({ summary }: { summary: string }) {
  return (
    <AnalysisSection label="Summary">
      <p className="text-sm leading-relaxed text-brand-offwhite/90">{summary}</p>
    </AnalysisSection>
  );
}
