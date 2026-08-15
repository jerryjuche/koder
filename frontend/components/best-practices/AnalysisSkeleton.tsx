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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Shimmer className="h-20" />
        <Shimmer className="h-20" />
        <Shimmer className="h-20" />
        <Shimmer className="h-20" />
      </div>

      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <Shimmer className="h-36" />
        <div className="space-y-2">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-5/6" />
          <Shimmer className="h-3 w-2/3" />
        </div>
      </div>

      <Shimmer className="h-16" />
    </div>
  );
}
