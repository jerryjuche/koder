"use client";

import { renderMarkdown } from "@/lib/markdown";
import { AnalysisLabel } from "./AnalysisLabel";

export function AnalysisApproach({ approach }: { approach: string }) {
  return (
    <div>
      <AnalysisLabel>Approach</AnalysisLabel>
      <div
        className="text-sm leading-relaxed text-brand-offwhite/90"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(approach) }}
      />
    </div>
  );
}