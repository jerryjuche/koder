"use client";

import { ComplexityBadge } from "./ComplexityBadge";

export function AnalysisComplexity({
  time,
  space,
}: {
  time: string;
  space: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <ComplexityBadge label="Time" value={time} />
      <ComplexityBadge label="Space" value={space} />
    </div>
  );
}