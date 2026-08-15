"use client";

import { AnalysisSection } from "./AnalysisSection";

export function AnalysisPoints({
  strengths,
  improvements,
}: {
  strengths: string[];
  improvements: string[];
}) {
  if (!strengths.length && !improvements.length) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {strengths.length > 0 && (
        <AnalysisSection label="Strengths">
          <ul className="space-y-1.5">
            {strengths.map((s, i) => (
              <li
                key={i}
                className="flex gap-2 text-[13px] leading-relaxed text-brand-offwhite/80"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                {s}
              </li>
            ))}
          </ul>
        </AnalysisSection>
      )}
      {improvements.length > 0 && (
        <AnalysisSection label="Improvements">
          <ul className="space-y-1.5">
            {improvements.map((s, i) => (
              <li
                key={i}
                className="flex gap-2 text-[13px] leading-relaxed text-brand-offwhite/80"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-purple-300" />
                {s}
              </li>
            ))}
          </ul>
        </AnalysisSection>
      )}
    </div>
  );
}
