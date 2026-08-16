"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE = 110;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function gradeScore(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Excellent", color: "#10b981" };
  if (score >= 70) return { label: "Good", color: "#14b8a6" };
  if (score >= 50) return { label: "Fair", color: "#f59e0b" };
  return { label: "Needs work", color: "#f43f5e" };
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-[3px]" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-flex h-3 w-3">
            <Star size={12} className="absolute inset-0 fill-white/10 text-white/15" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star size={12} className="fill-brand-muted-gold text-brand-muted-gold" />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function QualityGauge({ score }: { score: number }) {
  const grade = gradeScore(score);
  const stars = (score / 100) * 5;

  return (
    <div
      className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-border bg-card/60 p-3"
      aria-label={`Quality score: ${score} out of 100 - ${grade.label}`}
    >
      <div className="relative flex h-[110px] w-[110px] items-center justify-center">
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={grade.color}
            strokeWidth={STROKE}
            strokeDasharray={`${(CIRCUMFERENCE * score) / 100} ${CIRCUMFERENCE}`}
            strokeDashoffset={CIRCUMFERENCE * 0.25}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold leading-none tabular-nums text-foreground">
            {score}
          </span>
          <span
            className="mt-1 text-[9px] font-bold uppercase tracking-[0.08em]"
            style={{ color: grade.color }}
          >
            {grade.label}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <Stars value={stars} />
        <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Quality Score
        </span>
      </div>
    </div>
  );
}

export function QualityGaugeSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2.5 rounded-xl border border-border bg-card/60 p-3",
        className,
      )}
    >
      <div className="relative flex h-[110px] w-[110px] items-center justify-center">
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE}
            strokeDasharray="120 174"
            strokeDashoffset={CIRCUMFERENCE * 0.25}
            strokeLinecap="round"
            className="animate-pulse"
          />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="h-3 w-14 animate-pulse rounded-full bg-muted/40" />
        <div className="h-2 w-16 animate-pulse rounded-full bg-muted/30" />
      </div>
    </div>
  );
}