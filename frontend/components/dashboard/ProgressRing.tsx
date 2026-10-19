"use client";

import { cn } from "@/lib/utils";

interface ProgressRingProps {
  /** Progress from 0 to 1. Values outside the range are clamped. */
  value: number;
  /** Outer diameter in pixels. */
  size?: number;
  /** Ring thickness in pixels. */
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Circular progress meter used by the dashboard identity block.
 *
 * Draws two circles: a flat track and a gold arc whose length is `value` of the
 * circumference. `strokeDasharray` is animated (not `strokeDashoffset`) so the
 * arc grows from 12 o'clock without the path rotating mid-transition; motion
 * is disabled under `prefers-reduced-motion`.
 *
 * The ring is decorative — callers pass the readable number as `children` and
 * the surrounding text carries the meaning for assistive tech.
 */
export default function ProgressRing({
  value,
  size = 56,
  strokeWidth = 4,
  className,
  children,
}: ProgressRingProps) {
  const clamped = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * clamped;

  return (
    <div
      className={cn("relative grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/[0.07]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference - arc}`}
          className="text-brand-muted-gold transition-[stroke-dasharray] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
