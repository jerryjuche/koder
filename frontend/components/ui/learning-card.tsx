"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageSquare,
  Eye,
  Play,
  BookOpen,
  Clock,
  Target,
  Lock,
  CheckCircle2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { LanguageLogo, type Language } from "@/components/LanguageLogo";

export interface LearningCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  icon?: React.ReactNode | React.ElementType;
  type?: "course" | "module" | "lesson" | "section";
  status?: "locked" | "available" | "completed" | "in-progress" | "coming-soon";
  progress?: number;
  stats?: {
    likes?: number;
    comments?: number;
    views?: number;
    xp?: number;
  };
  badges?: string[];
  className?: string;
  onClick?: () => void;
  href?: string;
  meta?: {
    xp?: number;
    minutes?: number;
    difficulty?: string;
    count?: string;
    progress?: number;
  };
  index?: number;
  size?: "default" | "lg";
  language?: Language;
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
  size = "default",
  language,
}: LearningCardProps) {
  const isLocked = status === "locked";
  const progress = explicitProgress ?? meta?.progress;
  const stats = explicitStats ?? (meta?.xp ? { xp: meta.xp } : undefined);
  const displaySubtitle = subtitle ?? meta?.count;

  const allBadges = explicitBadges || [];
  if (!explicitBadges && meta?.difficulty) {
    allBadges.push(meta.difficulty);
  }

  const typeColors = {
    course: "from-blue-500/20 via-blue-500/10 to-transparent",
    module: "from-violet-500/20 via-violet-500/10 to-transparent",
    lesson: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    section: "from-amber-500/20 via-amber-500/10 to-transparent",
  };

  const typeGradients = {
    course: "bg-gradient-to-br from-blue-500/30 to-blue-500/10 border-blue-500/30",
    module: "bg-gradient-to-br from-violet-500/30 to-violet-500/10 border-violet-500/30",
    lesson: "bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 border-emerald-500/30",
    section: "bg-gradient-to-br from-amber-500/30 to-amber-500/10 border-amber-500/30",
  };

  const content = (
    <div
      className={cn(
        "group relative z-10 w-full block",
        isLocked ? "cursor-not-allowed opacity-75" : "cursor-pointer",
        className,
      )}
      onClick={isLocked ? undefined : onClick}
    >
      {/* 3D Tactile Back Plate */}
      <div
        className={cn(
          "absolute rounded-2xl bg-card/80 border border-border/40 backdrop-blur-sm",
          "transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] -z-10",
          "top-3 left-3 right-[-0.75rem] bottom-[-0.75rem]",
          !isLocked &&
            "group-hover:top-[-0.5rem] group-hover:left-[-0.5rem] group-hover:right-[-0.5rem] group-hover:bottom-[-0.5rem] group-hover:bg-card/95 group-hover:border-primary/40 group-hover:shadow-2xl",
        )}
      />

      {/* Main Front Card */}
      <div
        className={cn(
          "relative flex flex-col justify-between h-full w-full",
          size === "lg" ? "min-h-[160px]" : "min-h-[220px]",
          "bg-card/95 border border-border/60 rounded-2xl overflow-hidden shadow-lg",
          "transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
          !isLocked &&
            "group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] group-hover:border-primary/50",
        )}
      >
        {/* Background Image Layer if provided */}
        {imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity z-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-35"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        )}

        {/* Top Decorative Gradient Stripe */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-24 bg-gradient-to-b opacity-60 z-0 pointer-events-none",
            typeColors[type],
          )}
        />

        <div className="relative z-10 p-5 flex flex-col h-full">
          {/* Top Row: Icon & Status / Badges */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <div
              className={cn(
                "flex items-center justify-center rounded-xl border backdrop-blur-md shadow-inner transition-transform duration-300 shrink-0",
                typeGradients[type],
                size === "lg" ? "w-12 h-12" : "w-11 h-11",
                !isLocked && "group-hover:scale-110",
              )}
            >
              {isLocked ? (
                <Lock className="w-5 h-5 text-amber-500/80" />
              ) : language ? (
                <LanguageLogo language={language} size={22} />
              ) : icon ? (
                React.isValidElement(icon) ? (
                  icon
                ) : (
                  React.createElement(icon as React.ElementType, {
                    className: "w-5 h-5 text-foreground",
                  })
                )
              ) : (
                <BookOpen className="w-5 h-5 text-primary" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 justify-end">
              {status === "completed" && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </span>
              )}
              {status === "in-progress" && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> In Progress
                </span>
              )}
              {status === "locked" && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
              {status === "coming-soon" && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Coming Soon
                </span>
              )}
              {allBadges.map((badge) => (
                <span
                  key={badge}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-muted/60 text-muted-foreground border border-border"
                >
                  {badge}
                </span>
              ))}

              {!isLocked && (
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/20 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-primary/30 shadow-md">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div className="flex-1 mt-1">
            <h3
              className={cn(
                "text-base font-bold text-foreground mb-1.5 transition-colors duration-300 line-clamp-2",
                !isLocked && "group-hover:text-primary",
              )}
            >
              {title}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                {description}
              </p>
            )}
          </div>

          {/* Bottom Area: Progress & Metadata */}
          <div className="mt-4 pt-3 flex flex-col gap-2.5 border-t border-border/40">
            {progress !== undefined && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Progress</span>
                  <span className="text-foreground font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden border border-border/40">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out",
                      status === "completed"
                        ? "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                        : "bg-gradient-to-r from-primary via-amber-400 to-amber-500 shadow-[0_0_8px_rgba(212,175,55,0.4)]",
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              {displaySubtitle && (
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {displaySubtitle}
                </span>
              )}

              {stats?.xp !== undefined && (
                <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold">
                  <Target className="w-3 h-3 text-amber-400" />
                  {stats.xp} XP
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (href && !isLocked) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
