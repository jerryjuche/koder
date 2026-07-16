"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface RatingBadgeProps {
  rating: number;
  maxRating?: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function FullStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("shrink-0", className)} fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function EmptyStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
    </svg>
  );
}

function PartialStar({ fraction, id, className }: { fraction: number; id: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("shrink-0", className)}>
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={`${fraction * 24}`} height="24" />
        </clipPath>
      </defs>
      <EmptyStar className={className} />
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="currentColor"
        clipPath={`url(#${id})`}
      />
    </svg>
  );
}

export function RatingBadge({
  rating,
  maxRating = 5,
  reviewCount = 0,
  size = "md",
  className,
}: RatingBadgeProps) {
  const uid = useId();
  const clamped = Math.max(0, Math.min(rating, maxRating));
  const fullStars = Math.floor(clamped);
  const partialFraction = clamped - fullStars;
  const emptyStars = maxRating - fullStars - (partialFraction > 0 ? 1 : 0);

  const sizeClasses = {
    sm: "text-xs gap-0.5",
    md: "text-sm gap-1",
    lg: "text-base gap-1",
  };

  const starSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className={cn("inline-flex items-center", sizeClasses[size])}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <FullStar key={`full-${i}`} className={cn(starSizes[size], "text-amber-400")} />
        ))}
        {partialFraction > 0 && (
          <PartialStar
            key="partial"
            fraction={partialFraction}
            id={`${uid}-partial`}
            className={cn(starSizes[size], "text-amber-400")}
          />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <EmptyStar key={`empty-${i}`} className={cn(starSizes[size], "text-muted-foreground/20")} />
        ))}
      </div>
      <span className="font-semibold tabular-nums text-foreground">{clamped.toFixed(1)}</span>
      {reviewCount > 0 && (
        <span className="text-muted-foreground">({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
}
