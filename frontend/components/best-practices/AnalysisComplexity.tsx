"use client";

import { ComplexityBadge } from "./ComplexityBadge";
import { ComplexityScale } from "./ComplexityScale";

export function AnalysisComplexity({
  time,
  space,
}: {
  time: string;
  space: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <ComplexityBadge label="Time" value={time} />
        <ComplexityBadge label="Space" value={space} />
      </div>
      <ComplexityScale />
    </div>
  );
}
