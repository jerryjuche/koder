"use client";

import { AnalysisLabel } from "./AnalysisLabel";

export function AnalysisPoints({
  strengths,
  improvements,
}: {
  strengths: string[];
  improvements: string[];
}) {
  if (!strengths.length && !improvements.length) return null;
  return (
    <div className="space-y-1.5">
      {strengths.length > 0 && (
        <div>
          <AnalysisLabel>Strengths</AnalysisLabel>
          <p className="text-[13px] leading-relaxed text-brand-offwhite/80">
            {strengths.map((s, i) => (
              <span key={i} className="me-2 inline-flex items-start gap-1.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span>{s}</span>
              </span>
            ))}
          </p>
        </div>
      )}
      {improvements.length > 0 && (
        <div>
          <AnalysisLabel>Improvements</AnalysisLabel>
          <p className="text-[13px] leading-relaxed text-brand-offwhite/80">
            {improvements.map((s, i) => (
              <span key={i} className="me-2 inline-flex items-start gap-1.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-300" />
                <span>{s}</span>
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}