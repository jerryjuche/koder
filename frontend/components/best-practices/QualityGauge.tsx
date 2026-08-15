"use client";

import type { CSSProperties } from "react";
import { RatingBadge } from "@/components/ui/rating-badge";

export function gradeScore(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Excellent", color: "#10b981" };
  if (score >= 70) return { label: "Good", color: "#14b8a6" };
  if (score >= 50) return { label: "Fair", color: "#f59e0b" };
  return { label: "Needs work", color: "#f43f5e" };
}

export function QualityGauge({ score, label }: { score: number; label: string }) {
  const g = gradeScore(score);
  const stars = Math.round((score / 100) * 5 * 2) / 2;

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border/60 bg-muted/40 p-3">
      <div
        className="radial-progress"
        role="img"
        aria-label={`${label}: ${score} out of 100 — ${g.label}`}
        style={
          {
            "--value": score,
            "--size": "6.5rem",
            "--thickness": "0.5rem",
            color: g.color,
          } as CSSProperties
        }
      >
        <div className="flex flex-col items-center leading-none">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {score}
          </span>
          <span
            className="mt-1 text-[9px] font-semibold uppercase tracking-wider"
            style={{ color: g.color }}
          >
            {g.label}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <RatingBadge rating={stars} maxRating={5} size="sm" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}
