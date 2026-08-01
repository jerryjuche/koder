"use client";

import { useState, useEffect } from "react";
import { Lesson, LessonPrereq, LessonProgress } from "@/lib/types";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Zap,
  Lock,
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LessonSidebarProps {
  courseSlug: string;
  moduleSlug: string;
  moduleTitle: string;
  lessons: (Lesson & { completed: boolean; dependencies?: LessonPrereq[] })[];
  currentSlug: string;
  dependencies: LessonPrereq[];
  progress?: LessonProgress | null;
  estimatedMinutes: number;
  xpReward: number;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function LessonSidebar({
  courseSlug,
  moduleSlug,
  moduleTitle,
  lessons,
  currentSlug,
  dependencies,
  progress,
  estimatedMinutes,
  xpReward,
  onClose,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse: externalOnToggleCollapse,
}: LessonSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("koder_lesson_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const isCollapsed = externalIsCollapsed ?? internalCollapsed;

  const toggleCollapse = () => {
    if (externalOnToggleCollapse) {
      externalOnToggleCollapse();
    } else {
      setInternalCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("koder_lesson_sidebar_collapsed", String(next));
        } catch {}
        return next;
      });
    }
  };

  const [sessionCompleted, setSessionCompleted] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("koder_completed_lessons");
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSessionCompleted(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const completedCount = lessons.filter(
    (l) => l.completed || sessionCompleted.includes(l.id)
  ).length;
  const pct = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "border-r border-border/60 bg-card/50 backdrop-blur-xl shrink-0 flex flex-col h-full overflow-hidden shadow-xl transition-all duration-300 relative z-20",
          isCollapsed ? "w-16" : "w-72 lg:w-80"
        )}
      >
        {/* Module Header & Toggle Bar */}
        <div
          className={cn(
            "border-b border-border/50 shrink-0 bg-card/80 transition-all",
            isCollapsed ? "p-3 flex flex-col items-center gap-3" : "p-4 md:p-5"
          )}
        >
          {isCollapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleCollapse}
                    className="w-10 h-10 rounded-xl bg-muted/60 hover:bg-amber-500/10 hover:text-amber-400 text-muted-foreground border border-border/60 flex items-center justify-center transition-all"
                    aria-label="Expand sidebar"
                  >
                    <PanelLeftOpen className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-semibold">
                  Expand Sidebar
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
                    className="w-10 h-10 rounded-xl bg-muted/40 hover:bg-accent text-muted-foreground flex items-center justify-center transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  Back to {moduleTitle}
                </TooltipContent>
              </Tooltip>

              {/* Minimal Progress Indicator */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative w-10 h-10 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center">
                    <span className="text-[11px] font-extrabold text-amber-400">
                      {Math.round(pct)}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Module Progress: {completedCount}/{lessons.length} Lessons ({Math.round(pct)}%)
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 mb-3">
                <Link
                  href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold group"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Back to module
                </Link>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleCollapse}
                      className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 flex items-center justify-center transition-colors"
                      aria-label="Collapse sidebar"
                    >
                      <PanelLeftClose className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="font-semibold">
                    Collapse Sidebar
                  </TooltipContent>
                </Tooltip>
              </div>

              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate mb-2.5 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{moduleTitle}</span>
              </h3>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">
                    {completedCount} of {lessons.length} Completed
                  </span>
                  <span className="text-amber-400 font-extrabold">{Math.round(pct)}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden border border-border/40">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Lesson Navigation List */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1.5">
          {lessons.map((lesson, idx) => {
            const isActive = lesson.slug === currentSlug;
            const isDone = lesson.completed || sessionCompleted.includes(lesson.id);
            const deps = lesson.dependencies || [];

            const isLocked =
              !isDone &&
              deps.length > 0 &&
              deps.some((d) => {
                const depLesson = lessons.find((l) => l.id === d.depends_on_lesson_id);
                return (
                  depLesson &&
                  !depLesson.completed &&
                  !sessionCompleted.includes(d.depends_on_lesson_id)
                );
              });

            const lessonHref = `/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${lesson.slug}`;

            if (isCollapsed) {
              return (
                <Tooltip key={lesson.id}>
                  <TooltipTrigger asChild>
                    <div>
                      {isLocked ? (
                        <div className="w-12 h-10 mx-auto rounded-xl flex items-center justify-center text-muted-foreground/40 opacity-50 cursor-not-allowed border border-transparent">
                          <Lock className="h-4 w-4" />
                        </div>
                      ) : (
                        <Link
                          href={lessonHref}
                          onClick={onClose}
                          className={cn(
                            "w-12 h-10 mx-auto rounded-xl flex items-center justify-center transition-all duration-200 border",
                            isActive
                              ? "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-sm"
                              : isDone
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-card/40 border-border/40 text-muted-foreground hover:bg-accent hover:text-foreground"
                          )}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <span
                              className={cn(
                                "text-xs font-bold font-mono",
                                isActive ? "text-amber-400" : "text-muted-foreground"
                              )}
                            >
                              {idx + 1}
                            </span>
                          )}
                        </Link>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs space-y-1">
                    <p className="font-bold text-xs">{lesson.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{lesson.estimated_minutes} min</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">+{lesson.xp_reward} XP</span>
                      {isDone && <span className="text-emerald-400 font-bold">• Completed</span>}
                      {isLocked && <span className="text-amber-400 font-bold">• Locked</span>}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <div key={lesson.id}>
                {isLocked ? (
                  <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs cursor-not-allowed opacity-50 border border-transparent select-none"
                    title="Complete prerequisites to unlock"
                  >
                    <span className="shrink-0">
                      <Lock className="h-4 w-4 text-muted-foreground/50" />
                    </span>
                    <span className="truncate flex-1 font-medium text-muted-foreground/60">
                      {lesson.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 shrink-0 font-mono">
                      {lesson.estimated_minutes}m
                    </span>
                  </div>
                ) : (
                  <Link
                    href={lessonHref}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 group border",
                      isActive
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold shadow-md shadow-amber-500/5"
                        : isDone
                        ? "bg-emerald-500/5 border-emerald-500/10 text-foreground hover:bg-emerald-500/10 hover:border-emerald-500/20"
                        : "bg-transparent border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    )}
                  >
                    <span className="shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : isActive ? (
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-extrabold shadow-sm">
                          {idx + 1}
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center text-[10px] font-medium">
                          {idx + 1}
                        </span>
                      )}
                    </span>

                    <span className="truncate flex-1 font-semibold leading-snug">
                      {lesson.title}
                    </span>

                    <span className="text-[10px] text-muted-foreground/60 shrink-0 flex items-center gap-1 font-mono">
                      <Clock className="h-2.5 w-2.5" />
                      {lesson.estimated_minutes}m
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Pinned XP & Metadata */}
        {!isCollapsed && (
          <div className="p-4 border-t border-border/50 bg-card/70 shrink-0 space-y-3">
            {/* Prerequisites Status Badge if any */}
            {dependencies.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-amber-400" />
                  Prerequisites
                </h4>
                {dependencies.map((dep, idx) => {
                  const depLesson = lessons.find((l) => l.id === dep.depends_on_lesson_id);
                  const isMet =
                    depLesson?.completed || sessionCompleted.includes(dep.depends_on_lesson_id);
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-2 text-[11px] py-1.5 px-2.5 rounded-lg border",
                        isMet
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      )}
                    >
                      {isMet ? (
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                      ) : (
                        <Lock className="h-3 w-3 shrink-0" />
                      )}
                      <span className="truncate font-medium">
                        {depLesson?.title || "Prerequisite lesson"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Current Lesson Metadata */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <Clock className="h-3.5 w-3.5" />
                {estimatedMinutes} mins
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 text-[11px]">
                <Zap className="h-3 w-3 fill-current" />
                +{xpReward} XP
              </span>
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
