import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RatingBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number
  maxRating?: number
  title?: string
  subtitle?: string
  reviewCount?: number
  size?: "sm" | "default" | "lg"
}

export function RatingBadge({
  rating,
  maxRating = 5,
  title,
  subtitle,
  reviewCount,
  size = "default",
  className,
  ...props
}: RatingBadgeProps) {
  const iconSize = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";
  const displaySubtitle = subtitle || (reviewCount ? `(${reviewCount} reviews)` : undefined);

  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {Array.from({ length: maxRating }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                iconSize,
                i < Math.floor(rating)
                  ? "fill-brand-muted-gold text-brand-muted-gold"
                  : i < rating
                  ? "fill-brand-muted-gold/50 text-brand-muted-gold"
                  : "fill-brand-charcoal-hover text-brand-charcoal-border"
              )}
            />
          ))}
        </div>
        <span className={cn("font-semibold text-brand-offwhite", textSize)}>{rating.toFixed(1)}</span>
        {!title && displaySubtitle && <span className={cn("text-brand-offwhite-muted ml-1", textSize)}>{displaySubtitle}</span>}
      </div>
      {(title || (displaySubtitle && title)) && (
        <div className="flex flex-col text-sm">
          {title && <span className="font-medium text-brand-offwhite">{title}</span>}
          {displaySubtitle && title && <span className="text-brand-offwhite-muted">{displaySubtitle}</span>}
        </div>
      )}
    </div>
  )
}
