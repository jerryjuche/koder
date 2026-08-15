"use client";

import { Sparkles } from "lucide-react";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/40 ${className ?? ""}`}
    />
  );
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={15} className="text-purple-300" />
        <Shimmer className="h-4 w-24" />
      </div>

      <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-muted/40 p-3">
          <Shimmer className="h-28 w-28 rounded-full" />
          <Shimmer className="h-3 w-24" />
        </div>
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border/60 bg-muted/40 p-3">
          <Shimmer className="h-28 w-44" />
          <Shimmer className="h-3 w-20" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Shimmer className="h-20" />
        <Shimmer className="h-20" />
        <Shimmer className="h-20" />
        <Shimmer className="h-20" />
      </div>

      <div className="space-y-2">
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-5/6" />
        <Shimmer className="h-3 w-2/3" />
      </div>

      <Shimmer className="h-16" />
    </div>
  );
}
