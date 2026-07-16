"use client";

import { type ElementType, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  CheckCircle2,
  CircleDot,
  ChevronRight,
  Clock,
} from "lucide-react";

type CardStatus = "locked" | "in-progress" | "completed" | "available";

interface LearningCardProps {
  type: "course" | "module" | "lesson" | "section";
  title: string;
  description?: string;
  href: string;
  status?: CardStatus;
  index?: number;
  icon?: ElementType;
  gradient?: string;
  meta?: {
    xp?: number;
    minutes?: number;
    difficulty?: string;
    count?: string;
    progress?: number;
  };
  children?: ReactNode;
  className?: string;
}

const typeGradients: Record<string, string> = {
  course: "from-blue-600 to-sky-500",
  module: "from-violet-600 to-purple-500",
  lesson: "from-emerald-600 to-teal-500",
  section: "from-amber-600 to-yellow-500",
};

interface StatusStyle {
  border: string;
  bg: string;
  icon: ElementType | null;
  iconBg: string;
  badge: { label: string; variant: "default" | "outline"; className: string } | null;
  interactive: boolean;
}

const statusConfig: Record<string, StatusStyle> = {
  "locked": {
    border: "border-border/40 opacity-60",
    bg: "",
    icon: Lock,
    iconBg: "bg-muted/40 text-muted-foreground/40 ring-border/30",
    badge: null,
    interactive: false,
  },
  "in-progress": {
    border: "border-primary/40 ring-1 ring-primary/20 shadow-md shadow-primary/10",
    bg: "",
    icon: CircleDot,
    iconBg: "bg-primary/15 text-primary ring-primary/30",
    badge: { label: "In progress", variant: "default", className: "bg-primary/10 text-primary border-0" },
    interactive: true,
  },
  "completed": {
    border: "border-emerald-200/60 dark:border-emerald-900/30",
    bg: "bg-emerald-50/30 dark:bg-emerald-950/10",
    icon: CheckCircle2,
    iconBg: "bg-emerald-500/15 text-emerald-500 ring-emerald-500/25",
    badge: { label: "Done", variant: "outline", className: "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" },
    interactive: true,
  },
  "available": {
    border: "",
    bg: "",
    icon: null,
    iconBg: "bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-primary/10",
    badge: null,
    interactive: true,
  },
};

export function LearningCard({
  type = "lesson",
  title,
  description,
  href,
  status = "available",
  index,
  icon: Icon,
  gradient,
  meta,
  children,
  className,
}: LearningCardProps) {
  const sc = statusConfig[status];
  const resolvedGradient = gradient || typeGradients[type];
  const isLocked = !sc.interactive;
  const StatusIcon = sc.icon;

  const content = (
    <div className={cn(
      "relative overflow-hidden transition-all duration-300 border animate-in fade-in slide-in-from-bottom-3",
      "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5",
      sc.border,
      sc.bg,
      isLocked && "cursor-default",
      !isLocked && "group",
      className,
    )}>
      {/* Shadow back plate — only on unlocked hover */}
      {!isLocked && (
        <div className="absolute -inset-1.5 rounded-2xl bg-black/12 dark:bg-white/[0.08] opacity-0 scale-[0.96] -z-10 blur-[0.5px] transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-1 group-hover:blur-0" />
      )}

      {/* Gradient stripe (not for courses — courses use full gradient hero) */}
      {type !== "course" && (
        <div className={cn("h-1.5 w-full bg-gradient-to-r", resolvedGradient)} />
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Status/Icon indicator */}
          <div className="shrink-0 pt-0.5">
            {StatusIcon ? (
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center ring-1 transition-all duration-200",
                sc.iconBg,
                !isLocked && "group-hover:scale-110 group-hover:shadow-md",
              )}>
                <StatusIcon className="h-5 w-5" />
              </div>
            ) : (
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ring-1 transition-all duration-200",
                sc.iconBg,
                "group-hover:bg-primary/10 group-hover:text-primary/60 group-hover:ring-primary/20",
              )}>
                {index ?? 1}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-0.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <h3 className={cn(
                  "font-semibold text-[15px] group-hover:text-primary transition-colors truncate",
                  status === "completed" && "text-emerald-700 dark:text-emerald-300",
                  isLocked && "text-muted-foreground/60",
                )}>
                  {title}
                </h3>
                {sc.badge && (
                  <Badge variant={sc.badge.variant} className={cn("shrink-0 text-[10px] px-2 py-0 h-5 font-semibold", sc.badge.className)}>
                    {sc.badge.label}
                  </Badge>
                )}
              </div>
            </div>

            {description && (
              <p className={cn(
                "text-xs leading-relaxed mt-1 mb-3 whitespace-pre-line",
                isLocked ? "text-muted-foreground/40" : "text-muted-foreground",
              )}>
                {description}
              </p>
            )}

            {/* Meta badges */}
            <div className="flex items-center gap-3 flex-wrap">
              {meta?.xp != null && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
                  <svg width="10" height="14" viewBox="0 0 12 16" fill="currentColor">
                    <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
                  </svg>
                  {meta.xp} XP
                </div>
              )}
              {meta?.minutes != null && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {meta.minutes} min
                </span>
              )}
              {meta?.difficulty && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full ring-1 ring-border text-muted-foreground">
                  {meta.difficulty}
                </span>
              )}
              {meta?.count && (
                <span className="text-[11px] text-muted-foreground">{meta.count}</span>
              )}
            </div>

            {/* Progress bar */}
            {meta?.progress != null && meta.progress > 0 && (
              <div className="mt-3" role="progressbar" aria-valuenow={Math.round(meta.progress)} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-1.5 bg-muted/80 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out",
                      meta.progress >= 100
                        ? "bg-gradient-to-r from-emerald-500 to-green-400"
                        : "bg-gradient-to-r from-primary/70 to-primary",
                    )}
                    style={{ width: `${Math.round(meta.progress)}%` }}
                  />
                </div>
              </div>
            )}

            {children}
          </div>

          {/* Arrow — hidden for locked */}
          {!isLocked && (
            <div className="shrink-0 flex items-center self-center">
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
                "bg-muted/50 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20",
                "text-muted-foreground",
                status === "completed" && "opacity-40 group-hover:opacity-100",
              )}>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLocked) {
    return <div className="relative">{content}</div>;
  }

  return (
    <Link
      href={href}
      className="relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
    >
      {content}
    </Link>
  );
}
