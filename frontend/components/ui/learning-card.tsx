"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { Heart, MessageSquare, Eye, Play, BookOpen, Clock, Target, Lock } from "lucide-react"
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
  
  const badges = explicitBadges || []
  if (!explicitBadges && meta?.difficulty) {
    badges.push(meta.difficulty)
  }

  const typeColors = {
    course: "from-blue-500/10 via-blue-500/5 to-transparent",
    module: "from-violet-500/10 via-violet-500/5 to-transparent",
    lesson: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    section: "from-amber-500/10 via-amber-500/5 to-transparent",
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
      <div 
        className={cn(
          "absolute rounded-xl bg-brand-charcoal-card/60 border border-brand-charcoal-border/20 backdrop-blur-sm",
          "transition-all duration-200 ease-out -z-10",
          "top-2 left-2 right-[-0.5rem] bottom-[-0.5rem]", 
          !isLocked && "group-hover:top-[-0.5rem] group-hover:left-[-0.5rem] group-hover:right-[-0.5rem] group-hover:bottom-[-0.5rem] group-hover:bg-brand-charcoal-card/80 group-hover:border-brand-charcoal-border/40 group-hover:shadow-lg"
        )} 
      />
      <div 
        className={cn(
          "relative flex flex-col justify-between w-full",
          size === "lg" ? "min-h-[120px]" : "aspect-[16/9]",
          "bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl overflow-hidden",
          "transition-all duration-200 ease-out",
          !isLocked && "group-hover:shadow-[0_4px_16px_rgb(0,0,0,0.35)] group-hover:border-brand-charcoal-border/70"
        )}>
        {imageUrl ? (
          <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal-base via-brand-charcoal-base/70 to-brand-charcoal-base/30" />
          </div>
        ) : (
          <div className={cn("absolute top-0 left-0 right-0 h-12 bg-gradient-to-b opacity-40 z-0", typeColors[type])} />
        )}

        <div className={cn("relative z-10 flex flex-col h-full", size === "lg" ? "p-4 md:p-5" : "p-3")}>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className={cn(
              "flex items-center justify-center rounded-lg border border-white/10 backdrop-blur-md shadow-inner shrink-0",
              typeGradients[type],
              size === "lg" ? "w-10 h-10" : "w-8 h-8",
              !isLocked && "group-hover:scale-110 transition-transform duration-200"
            )}>
              {isLocked ? (
                <Lock className="w-3.5 h-3.5 text-white/50" />
              ) : icon ? (
                React.isValidElement(icon) ? icon : React.createElement(icon as React.ElementType, { className: cn("text-white/90", size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5") })
              ) : index != null ? (
                <span className={cn("font-bold text-white/90", size === "lg" ? "text-sm" : "text-xs")}>{index}</span>
              ) : (
                <BookOpen className={cn("text-white/90", size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5")} />
              )}
            </div>
            
            <div className="flex items-center gap-1 flex-wrap justify-end">
              {status === "completed" && (
                <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-success/15 text-brand-success border border-brand-success/30">
                  Done
                </div>
              )}
              {status === "in-progress" && (
                <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-muted-gold/15 text-brand-muted-gold border border-brand-muted-gold/30">
                  Active
                </div>
              )}
              {status === "locked" && (
                <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-charcoal-card text-brand-offwhite-muted border border-brand-charcoal-border">
                  Locked
                </div>
              )}
              {badges?.map(badge => (
                <div key={badge} className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-charcoal-card/80 text-brand-offwhite-muted border border-brand-charcoal-border">
                  {badge}
                </div>
              ))}
              {!isLocked && (
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-brand-charcoal-hover opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-brand-charcoal-border shrink-0">
                  <Play className="w-3 h-3 text-brand-offwhite pl-0.5" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-brand-offwhite transition-colors duration-200",
              size === "lg" ? "text-base md:text-lg" : "text-sm",
              !isLocked && "group-hover:text-brand-muted-gold",
              size !== "lg" && "truncate"
            )}>
              {title}
            </h3>
            {description && (
              <p className={cn(
                "text-brand-offwhite-muted mt-0.5 leading-relaxed",
                size === "lg" ? "text-xs" : "text-[11px] truncate"
              )}>
                {description}
              </p>
            )}
          </div>

          {(progress !== undefined || displaySubtitle || stats) && (
            <div className="mt-auto pt-1.5">
              {progress !== undefined && (
                <div className="mb-1">
                  {size === "lg" && (
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-brand-offwhite-muted uppercase tracking-wider">Progress</span>
                      <span className="text-[10px] font-bold text-brand-muted-gold">{Math.round(progress)}%</span>
                    </div>
                  )}
                  <div className="h-1 w-full bg-brand-charcoal-card rounded-full overflow-hidden border border-brand-charcoal-border/30">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        status === 'completed' ? "bg-gradient-to-r from-brand-success to-emerald-400" : "bg-gradient-to-r from-brand-muted-gold to-brand-muted-gold-dark"
                      )}
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                {displaySubtitle && (
                  <span className="text-[10px] font-semibold text-brand-offwhite-muted uppercase tracking-wider truncate">{displaySubtitle}</span>
                )}
                {meta?.minutes && !displaySubtitle && (
                  <span className="text-[10px] font-semibold text-brand-offwhite-muted uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {meta.minutes} MIN
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {stats?.xp !== undefined && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-charcoal-card border border-brand-charcoal-border text-[9px] font-bold text-brand-muted-gold">
                      <Target className="w-2.5 h-2.5" />
                      <span>{stats.xp} XP</span>
                    </div>
                  )}
                  {stats?.likes !== undefined && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-charcoal-hover border border-brand-charcoal-border text-[9px] font-medium text-brand-offwhite opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Heart className="w-2.5 h-2.5 text-rose-400" />
                      <span>{stats.likes}</span>
                    </div>
                  )}
                  {stats?.comments !== undefined && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-charcoal-hover border border-brand-charcoal-border text-[9px] font-medium text-brand-offwhite opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <MessageSquare className="w-2.5 h-2.5 text-sky-400" />
                      <span>{stats.comments}</span>
                    </div>
                  )}
                  {stats?.views !== undefined && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-charcoal-hover border border-brand-charcoal-border text-[9px] font-medium text-brand-offwhite opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Eye className="w-2.5 h-2.5 text-emerald-400" />
                      <span>{stats.views}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
