"use client";

import { useMemo } from "react";
import { CommunitySolution } from "@/lib/types";

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-[72px] px-4 py-2.5 text-center">
      <div className="font-mono text-sm font-bold text-foreground tabular-nums leading-none">
        {value}
      </div>
      <div className="mt-1 text-[10px] font-medium uppercase leading-none tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

export function BestPracticesHeader({
  solutions,
  mine = false,
}: {
  solutions: CommunitySolution[];
  mine?: boolean;
}) {
  const stats = useMemo(() => {
    const total = solutions.length;
    const goCount = solutions.filter((s) => s.language === "go").length;
    const pyCount = solutions.filter((s) => s.language === "python").length;
    const totalLikes = solutions.reduce((acc, s) => acc + s.likes, 0);
    const best = solutions.length
      ? Math.min(...solutions.map((s) => s.runtime_ms))
      : null;
    return { total, goCount, pyCount, totalLikes, best };
  }, [solutions]);

  return (
    <div className="rounded-xl border border-border/60 bg-brand-charcoal-card">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            {mine ? "Personal Library" : "Community Showcase"}
          </p>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            Best Practices
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            {mine
              ? "The solutions you have liked, ranked exactly like the community leaderboard — your reference library of great code."
              : "The most-liked, fastest solutions from the Koder community, ranked by engagement. Open any entry to read the code behind it."}
          </p>
        </div>

        {stats.total > 0 && (
          <div className="flex shrink-0 items-stretch divide-x divide-border/60 overflow-hidden rounded-lg border border-border/60 bg-background/40">
            <Metric value={String(stats.total)} label="solutions" />
            <Metric value={String(stats.goCount)} label="go" />
            <Metric value={String(stats.pyCount)} label="python" />
            <Metric value={String(stats.totalLikes)} label="likes" />
            {stats.best !== null && (
              <Metric value={`${stats.best}ms`} label="best" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
