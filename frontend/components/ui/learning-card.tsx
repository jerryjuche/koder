"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { Heart, MessageSquare, Eye, Play, BookOpen, Clock, Target, Lock, CheckCircle2, Zap } from "lucide-react"
import Link from "next/link"

export interface LearningCardProps {
  title: string
  subtitle?: string
  description?: string
  imageUrl?: string
  icon?: React.ReactNode | React.ElementType
  type?: "course" | "module" | "lesson" | "section"
  status?: "locked" | "available" | "completed" | "in-progress"
  progress?: number
  stats?: {
    likes?: number
    comments?: number
    views?: number
    xp?: number
  }
  badges?: string[]
  className?: string
  onClick?: () => void
  href?: string
  meta?: {
    xp?: number
    minutes?: number
    difficulty?: string
    count?: string
    progress?: number
  }
  index?: number
  size?: "default" | "lg"
}

export function LearningCard({
  title,
  subtitle,
  description,
  imageUrl,
  icon,
  type = "course",
  status = "available",
  progress: explicitProgress,
  stats: explicitStats,
  badges: explicitBadges,
  className,
  onClick,
  href,
  meta,
  index,
  size = "default"
}: LearningCardProps) {
  const isLocked = status === "locked"

  const progress = explicitProgress ?? meta?.progress
  const stats = explicitStats ?? (meta?.xp ? { xp: meta.xp } : undefined)
  const displaySubtitle = subtitle ?? meta?.count

  const allBadges = explicitBadges || []
  if (!explicitBadges && meta?.difficulty) {
    allBadges.push(meta.difficulty)
  }

  const typeColors = {
    course: "from-blue-600/30 via-blue-500/15 to-transparent",
    module: "from-violet-600/30 via-violet-500/15 to-transparent",
    lesson: "from-emerald-600/30 via-emerald-500/15 to-transparent",
    section: "from-amber-600/30 via-amber-500/15 to-transparent",
  }

  const typeAccents = {
    course: "from-blue-500 to-blue-600",
    module: "from-violet-500 to-violet-600",
    lesson: "from-emerald-500 to-emerald-600",
    section: "from-amber-500 to-amber-600",
  }

  const typeGradients = {
    course: "bg-gradient-to-br from-blue-500/20 to-blue-500/5",
    module: "bg-gradient-to-br from-violet-500/20 to-violet-500/5",
    lesson: "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5",
    section: "bg-gradient-to-br from-amber-500/20 to-amber-500/5",
  }

  const content = (
    <div
      className={cn(
        "group relative z-10 w-full block",
        isLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer",
        className
      )}
      onClick={isLocked ? undefined : onClick}
    >
      {/* Shadow back plate */}
      <div
        className={cn(
          "absolute rounded-xl bg-brand-charcoal-card/60 border border-brand-charcoal-border/20 backdrop-blur-sm",
          "transition-all duration-300 ease-out -z-10",
          "top-2 left-2 right-[-0.5rem] bottom-[-0.5rem]",
          !isLocked && "group-hover:top-[-0.5rem] group-hover:left-[-0.5rem] group-hover:right-[-0.5rem] group-hover:bottom-[-0.5rem] group-hover:bg-brand-charcoal-card/80 group-hover:border-brand-charcoal-border/40 group-hover:shadow-lg"
        )}
      />

      {/* Card body */}
      <div
        className={cn(
          "relative flex flex-col w-full",
          size === "lg" ? "min-h-[140px]" : type === "course" ? "aspect-[3/4]" : "aspect-[16/9]",
          "bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl overflow-hidden",
          "transition-all duration-300 ease-out",
          !isLocked && "group-hover:shadow-[0_4px_20px_rgb(0,0,0,0.4)] group-hover:border-brand-charcoal-border/70"
        )}
      >
        {/* ── Top visual area: gradient + icon overlay ── */}
        <div className="relative shrink-0">
          {imageUrl ? (
            <div
              className={cn(
                "w-full bg-cover bg-center",
                size === "lg" ? "h-16" : type === "course" ? "h-20" : "h-14"
              )}
              style={{ backgroundImage: `url(${imageUrl})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal-base via-brand-charcoal-base/60 to-transparent" />
            </div>
          ) : (
            <div className={cn(
              "w-full bg-gradient-to-br",
              typeColors[type],
              size === "lg" ? "h-16" : type === "course" ? "h-20" : "h-14"
            )}>
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal-base via-brand-charcoal-base/40 to-transparent" />
            </div>
          )}

          {/* Icon overlay */}
          <div className={cn(
            "absolute bottom-0 left-3 translate-y-1/2",
            "flex items-center justify-center rounded-xl border-2 border-brand-charcoal-base shadow-lg",
            typeGradients[type],
            size === "lg" ? "w-11 h-11" : type === "course" ? "w-10 h-10" : "w-9 h-9",
            !isLocked && "group-hover:scale-110 group-hover:shadow-xl transition-all duration-300"
          )}>
            {isLocked ? (
              <Lock className="text-white/50" style={{ width: size === "lg" ? 18 : 15, height: size === "lg" ? 18 : 15 }} />
            ) : icon ? (
              React.isValidElement(icon) ? icon : React.createElement(icon as React.ElementType, { className: cn("text-white/90", size === "lg" ? "w-5 h-5" : "w-4 h-4") })
            ) : index != null ? (
              <span className={cn("font-bold text-white/90", size === "lg" ? "text-sm" : "text-xs")}>{index}</span>
            ) : (
              <BookOpen className={cn("text-white/90", size === "lg" ? "w-5 h-5" : "w-4 h-4")} />
            )}
          </div>

          {/* Status + badges — top right */}
          <div className="absolute top-2 right-2 flex items-center gap-1 flex-wrap justify-end">
            {status === "completed" && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-brand-success/20 text-brand-success border border-brand-success/30 backdrop-blur-sm">
                <CheckCircle2 className="w-2.5 h-2.5" /> Done
              </div>
            )}
            {status === "in-progress" && (
              <div className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-brand-muted-gold/20 text-brand-muted-gold border border-brand-muted-gold/30 backdrop-blur-sm">
                Active
              </div>
            )}
            {status === "locked" && (
              <div className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-brand-charcoal-card/80 text-brand-offwhite-muted border border-brand-charcoal-border backdrop-blur-sm">
                Locked
              </div>
            )}
            {allBadges?.map(badge => (
              <div key={badge} className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-brand-charcoal-card/80 text-brand-offwhite-muted border border-brand-charcoal-border backdrop-blur-sm">
                {badge}
              </div>
            ))}
            {!isLocked && (
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-brand-charcoal-hover/80 opacity-0 group-hover:opacity-100 transition-all duration-200 border border-brand-charcoal-border backdrop-blur-sm shrink-0">
                <Play className="w-3 h-3 text-brand-offwhite pl-0.5" />
              </div>
            )}
          </div>

          {/* Accent stripe at very top */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r",
            typeAccents[type],
            "opacity-60"
          )} />
        </div>

        {/* ── Bottom content area ── */}
        <div className={cn("relative z-10 flex flex-col flex-1", size === "lg" ? "px-3.5 pt-5 pb-3" : type === "course" ? "px-3.5 pt-5 pb-3" : "px-3 pt-5 pb-2.5")}>
          {/* Title */}
          <h3 className={cn(
            "font-bold text-brand-offwhite leading-snug transition-colors duration-200 whitespace-pre-line",
            size === "lg" ? "text-base md:text-lg" : type === "course" ? "text-[15px]" : "text-sm",
            !isLocked && "group-hover:text-brand-muted-gold",
            size !== "lg" && "line-clamp-2"
          )}>
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className={cn(
              "text-brand-offwhite-muted leading-relaxed whitespace-pre-line mt-1",
              size === "lg" ? "text-xs line-clamp-2" : type === "course" ? "text-xs line-clamp-4" : "text-[11px] line-clamp-2"
            )}>
              {description}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1 min-h-[6px]" />

          {/* Progress bar */}
          {progress !== undefined && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-brand-offwhite-muted uppercase tracking-wider">Progress</span>
                <span className="text-[10px] font-bold text-brand-muted-gold">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-brand-charcoal-card rounded-full overflow-hidden border border-brand-charcoal-border/30">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    status === 'completed'
                      ? "bg-gradient-to-r from-brand-success to-emerald-400"
                      : "bg-gradient-to-r from-brand-muted-gold to-brand-muted-gold-dark"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Bottom meta row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              {displaySubtitle && (
                <span className="text-[10px] font-semibold text-brand-offwhite-muted uppercase tracking-wider truncate">{displaySubtitle}</span>
              )}
              {meta?.minutes && (
                <span className="text-[10px] font-medium text-brand-offwhite-muted flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />{meta.minutes}m
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {stats?.xp !== undefined && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-brand-charcoal-card border border-brand-charcoal-border text-[9px] font-bold text-brand-muted-gold">
                  <Zap className="w-2.5 h-2.5" />
                  <span>{stats.xp}</span>
                </div>
              )}
              {stats?.likes !== undefined && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-brand-charcoal-hover border border-brand-charcoal-border text-[9px] font-medium text-brand-offwhite opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Heart className="w-2.5 h-2.5 text-rose-400" />
                  <span>{stats.likes}</span>
                </div>
              )}
              {stats?.views !== undefined && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-brand-charcoal-hover border border-brand-charcoal-border text-[9px] font-medium text-brand-offwhite opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Eye className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{stats.views}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (href && !isLocked) {
    return (
      <Link href={href} className="block w-full">
        {content}
      </Link>
    )
  }

  return content
}
