"use client";

import { LucideIcon } from "lucide-react";

export function MetricTile({
  icon: Icon,
  label,
  value,
  sublabel,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel?: string;
  tone?: "default" | "gold" | "emerald";
}) {
  const toneClasses =
    tone === "gold"
      ? "text-amber-400"
      : tone === "emerald"
        ? "text-emerald-400"
        : "text-purple-300";

  return (
    <div className="flex flex-col items-start gap-1 rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon size={11} className={toneClasses} />
        {label}
      </div>
      <div className="text-sm font-bold text-foreground leading-tight">{value}</div>
      {sublabel && (
        <div className="text-[10px] text-muted-foreground leading-tight">{sublabel}</div>
      )}
    </div>
  );
}
