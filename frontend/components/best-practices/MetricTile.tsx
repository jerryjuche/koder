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
    <div className="stat">
      <div className="flex items-center gap-1.5">
        <Icon size={13} className={toneClasses} />
        <span className="stat-title">{label}</span>
      </div>
      <div className="stat-value">{value}</div>
      {sublabel && <div className="stat-desc">{sublabel}</div>}
    </div>
  );
}
