"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { Heart, MessageSquare, Eye, Play, BookOpen, Clock, Code, Target, Lock } from "lucide-react"
import Link from "next/link"

export interface LearningCardProps {
  title: string
  subtitle?: string
  description?: string
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
  gradient?: string
  meta?: {
    xp?: number
    minutes?: number
    difficulty?: string
    count?: string
    progress?: number
  }
  index?: number
}

export function LearningCard({
  title,
  subtitle,
  description,
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
  index
}: LearningCardProps) {
  const isLocked = status === "locked"

  const progress = explicitProgress ?? meta?.progress
  const stats = explicitStats ?? (meta?.xp ? { xp: meta.xp } : undefined)
  const displaySubtitle = subtitle ?? meta?.count
  
  const badges = explicitBadges || []
  if (!explicitBadges && meta?.difficulty) {
    badges.push(meta.difficulty)
  }

  // Background colors depending on type
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
        isLocked ? "cursor-not-allowed opacity-75" : "cursor-pointer",
        className
      )}
      onClick={isLocked ? undefined : onClick}
    >
      {/* 3D Back Plate */}
      <div 
        className={cn(
          "absolute rounded-2xl bg-brand-charcoal-card/80 border border-brand-charcoal-border/30 backdrop-blur-sm",
          "transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] -z-10",
          "top-4 left-4 right-[-1rem] bottom-[-1rem]", 
          !isLocked && "group-hover:top-[-1rem] group-hover:left-[-1rem] group-hover:right-[-1rem] group-hover:bottom-[-1rem] group-hover:bg-brand-charcoal-card/90 group-hover:border-brand-charcoal-border/50 group-hover:shadow-2xl"
        )} 
      />
      
      {/* Main Front Card */}
      <div className={cn(
        "relative flex flex-col justify-between h-full w-full min-h-[16rem]",
        "bg-brand-charcoal-base border border-brand-charcoal-border rounded-2xl overflow-hidden",
        "transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
        !isLocked && "group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] group-hover:border-brand-charcoal-border/80"
      )}>
        
        {/* Decorative Top Gradient Stripe */}
        <div className={cn("absolute top-0 left-0 right-0 h-32 bg-gradient-to-b opacity-50 z-0", typeColors[type])} />

        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Top Row: Icon & Status / Badges */}
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "flex items-center justify-center w-14 h-14 rounded-xl border border-white/10 backdrop-blur-md shadow-inner transition-transform duration-300",
              typeGradients[type],
              !isLocked && "group-hover:scale-110"
            )}>
              {isLocked ? (
                <Lock className="w-6 h-6 text-white/50" />
              ) : icon ? (
                React.isValidElement(icon) ? icon : React.createElement(icon as React.ElementType, { className: "w-6 h-6 text-white/90" })
              ) : index != null ? (
                <span className="text-xl font-bold text-white/90">{index}</span>
              ) : (
                <BookOpen className="w-6 h-6 text-white/90" />
              )}
            </div>
            
            <div className="flex gap-2">
              {status === "completed" && (
                <div className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-success/15 text-brand-success border border-brand-success/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                  Completed
                </div>
              )}
              {status === "in-progress" && (
                <div className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-muted-gold/15 text-brand-muted-gold border border-brand-muted-gold/30 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                  In Progress
                </div>
              )}
              {status === "locked" && (
                <div className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-charcoal-card text-brand-offwhite-muted border border-brand-charcoal-border">
                  Locked
                </div>
              )}
              {badges?.map(badge => (
                <div key={badge} className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-charcoal-card/80 text-brand-offwhite-muted border border-brand-charcoal-border">
                  {badge}
                </div>
              ))}
              
              {/* Fullscreen/Action trigger on hover */}
              {!isLocked && (
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-charcoal-hover opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-brand-charcoal-border shadow-md">
                  <Play className="w-4 h-4 text-brand-offwhite pl-0.5" />
                </div>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div className="flex-1 mt-2">
            <h3 className={cn(
              "text-xl font-bold text-brand-offwhite mb-2 transition-colors duration-300 line-clamp-2",
              !isLocked && "group-hover:text-brand-muted-gold"
            )}>
              {title}
            </h3>
            {description && (
              <p className="text-sm text-brand-offwhite-muted line-clamp-2 mb-4 leading-relaxed font-medium">
                {description}
              </p>
            )}
          </div>

          {/* Bottom Area: Progress or Stats */}
          <div className="mt-auto pt-5 flex flex-col gap-4 border-t border-brand-charcoal-border/40">
            {progress !== undefined && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-brand-offwhite-muted font-bold uppercase tracking-wider">
                  <span>Progress</span>
                  <span className="text-brand-offwhite">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-brand-charcoal-card rounded-full overflow-hidden border border-brand-charcoal-border/50">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out",
                      status === 'completed' ? "bg-gradient-to-r from-brand-success to-emerald-400" : "bg-gradient-to-r from-brand-muted-gold to-brand-muted-gold-dark"
                    )}
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              {/* Author / Subtitle */}
              <div className="flex items-center gap-2">
                {displaySubtitle && <span className="text-xs font-bold text-brand-offwhite-muted uppercase tracking-wider">{displaySubtitle}</span>}
                {meta?.minutes && !displaySubtitle && (
                  <span className="text-xs font-bold text-brand-offwhite-muted uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {meta.minutes} MIN
                  </span>
                )}
              </div>

              {/* Stats */}
              {stats && (
                <div className="flex items-center gap-2 transition-all duration-300">
                  {stats.xp !== undefined && (
                    <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-charcoal-card border border-brand-charcoal-border text-xs font-bold text-brand-muted-gold shadow-sm">
                      <Target className="w-3.5 h-3.5" />
                      <span>{stats.xp} XP</span>
                    </div>
                  )}
                  {stats.likes !== undefined && (
                    <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-charcoal-hover border border-brand-charcoal-border text-xs font-medium text-brand-offwhite opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-[50ms]">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>{stats.likes}</span>
                    </div>
                  )}
                  {stats.comments !== undefined && (
                    <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-charcoal-hover border border-brand-charcoal-border text-xs font-medium text-brand-offwhite opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                      <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                      <span>{stats.comments}</span>
                    </div>
                  )}
                  {stats.views !== undefined && (
                    <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-charcoal-hover border border-brand-charcoal-border text-xs font-medium text-brand-offwhite opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-[150ms]">
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{stats.views}</span>
                    </div>
                  )}
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
