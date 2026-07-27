"use client";

import { useState, useEffect } from "react";
import { Lesson, LessonPrereq, LessonProgress } from "@/lib/types";
import Link from "next/link";
import {
  CheckCircle2, Circle, Clock, Zap,
  Lock, ArrowLeft, BookOpen, ChevronRight, Target
} from "lucide-react";
import { cn } from "@/lib/utils";

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
}: LessonSidebarProps) {
  // Read session completed lessons for optimistic unlock (prereq race fix)
  const [sessionCompleted, setSessionCompleted] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("koder_completed_lessons");
      if (raw) {
        setSessionCompleted(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const completedCount = lessons.filter(
    (l) => l.completed || sessionCompleted.includes(l.id)
  ).length;
  const pct = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <aside className="w-72 border-r border-border/60 bg-card/40 backdrop-blur-md shrink-0 flex flex-col h-full overflow-hidden shadow-lg">
      {/* Module Context Header */}
      <div className="p-5 border-b border-border/50 shrink-0 bg-card/60">
        <Link
          href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium mb-3 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to module
        </Link>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate mb-1">
          {moduleTitle}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
          <span>{completedCount} / {lessons.length} Lessons</span>
          <span className="text-amber-400 font-bold">{Math.round(pct)}%</span>
        </div>
      </div>

      {/* Lesson List - Scrollable */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
        {lessons.map((lesson, idx) => {
          const isActive = lesson.slug === currentSlug;
          const isDone = lesson.completed || sessionCompleted.includes(lesson.id);
          const deps = lesson.dependencies || [];

          // Is locked if not done, not session completed, and has unfulfilled deps
          const isLocked =
            !isDone &&
            deps.length > 0 &&
            deps.some((d) => {
              const depLesson = lessons.find((l) => l.id === d.depends_on_lesson_id);
              return depLesson && !depLesson.completed && !sessionCompleted.includes(d.depends_on_lesson_id);
            });

          const lessonHref = `/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${lesson.slug}`;

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
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 group border",
                    isActive
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold shadow-sm"
                      : isDone
                      ? "bg-emerald-500/5 border-transparent text-foreground hover:bg-emerald-500/10 hover:border-emerald-500/20"
                      : "bg-transparent border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
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

                  <span className="truncate flex-1 font-medium leading-snug">
                    {lesson.title}
                  </span>

                  <span className="text-[10px] text-muted-foreground/60 shrink-0 flex items-center gap-0.5 font-mono">
                    <Clock className="h-2.5 w-2.5" />
                    {lesson.estimated_minutes}m
                  </span>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Pinned Metadata */}
      <div className="p-4 border-t border-border/50 bg-card/60 shrink-0 space-y-3">
        {/* Prerequisites Status Badge if any */}
        {dependencies.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-amber-400" />
              Prerequisites
            </h4>
            {dependencies.map((dep, idx) => {
              const depLesson = lessons.find((l) => l.id === dep.depends_on_lesson_id);
              const isMet = depLesson?.completed || sessionCompleted.includes(dep.depends_on_lesson_id);
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-2 text-[11px] py-1 px-2 rounded-lg border",
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
                  <span className="truncate font-medium">{depLesson?.title || "Prerequisite lesson"}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Current Lesson XP & Duration */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="flex items-center gap-1 text-muted-foreground font-medium">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {estimatedMinutes} mins
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-[11px]">
            <Zap className="h-3 w-3 fill-current" />
            +{xpReward} XP
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden border border-border/40">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
