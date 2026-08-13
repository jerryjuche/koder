"use client";

import { useMemo } from "react";
import { FlaskConical, Heart, Timer, Trophy, Zap } from "lucide-react";
import { CommunitySolution } from "@/lib/types";

function StatChip({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/60 border border-border/60">
      <Icon size={13} className={color} />
      <span className="text-sm font-extrabold text-foreground tabular-nums leading-none">{value}</span>
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-none">
        {label}
      </span>
    </div>
  );
}

export function BestPracticesHeader({ solutions }: { solutions: CommunitySolution[] }) {
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
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-brand-charcoal-card via-brand-charcoal-card to-primary/[0.06]">
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="relative p-5 sm:p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#53389E] via-[#7F56D9] to-[#9E77ED] flex items-center justify-center shadow-lg shadow-primary/20">
              <Trophy size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                Community Best Practices
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Top-liked solutions from the Koder community — see how others solve problems cleanly and fast.
              </p>
            </div>
          </div>
          {stats.total > 0 && (
            <div className="flex items-center gap-2 flex-wrap ml-auto">
              <StatChip icon={FlaskConical} value={String(stats.total)} label="solutions" color="text-primary" />
              <StatChip icon={Zap} value={String(stats.goCount)} label="go" color="text-cyan-400" />
              <StatChip icon={Zap} value={String(stats.pyCount)} label="python" color="text-blue-400" />
              <StatChip icon={Heart} value={String(stats.totalLikes)} label="likes" color="text-rose-400" />
              {stats.best !== null && (
                <StatChip icon={Timer} value={`${stats.best}ms`} label="best" color="text-emerald-400" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
