"use client";

import { renderMarkdown } from "@/lib/markdown";
import { AnalysisSection } from "./AnalysisSection";

export function AnalysisApproach({ approach }: { approach: string }) {
  return (
    <AnalysisSection label="Approach">
      <div
        className="text-sm leading-relaxed text-brand-offwhite/90"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(approach) }}
      />
    </AnalysisSection>
  );
}
