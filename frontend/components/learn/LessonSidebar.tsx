"use client";

import { Lesson, LessonPrereq, LessonProgress } from "@/lib/types";
import Link from "next/link";
import {
  CheckCircle2, Circle, Clock, Zap,
  Lock, ArrowLeft, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonSidebarProps {
  courseSlug: string;
  moduleSlug: string;
  moduleTitle: string;
  lessons: (Lesson & { completed: boolean })[];
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
  const pct = progress?.completed ? 100 : 0;
  const completedCount = lessons.filter((l) => l.completed).length;

  return (
    <aside className="w-72 border-r bg-muted/5 shrink-0 flex flex-col h-full overflow-hidden">
      {/* Module context header */}
      <div className="p-4 border-b shrink-0">
        <Link
          href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-2 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to module
        </Link>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
          {moduleTitle}
        </h3>
        <p className="text-[11px] text-muted-foreground/60 mt-0.5">
          {completedCount}/{lessons.length} lessons
        </p>
      </div>

      {/* Lesson list - scrollable */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {lessons.map((lesson, idx) => {
          const isActive = lesson.slug === currentSlug;
          return (
            <Link
              key={lesson.id}
              href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${lesson.slug}`}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              {/* Status icon */}
              <span className="shrink-0">
                {lesson.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : isActive ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                    {idx + 1}
                  </span>
                ) : (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted/50 text-[10px] font-medium text-muted-foreground/50">
                    {idx + 1}
                  </span>
                )}
              </span>

              {/* Title */}
              <span className="truncate flex-1">{lesson.title}</span>

              {/* Duration */}
              <span className="text-[10px] text-muted-foreground/40 shrink-0 flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {lesson.estimated_minutes}m
              </span>
            </Link>
          );
        })}
      </div>

      {/* Current lesson meta */}
      <div className="p-4 border-t shrink-0 space-y-3">
        {/* Prerequisites */}
        {dependencies.length > 0 && (
          <div>
            <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              Prerequisites
            </h4>
            <div className="space-y-1">
              {dependencies.map((dep, idx) => {
                const depLesson = lessons.find((l) => l.id === dep.depends_on_lesson_id);
                const isMet = depLesson?.completed;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center gap-2 text-[11px] py-1.5 px-2 rounded",
                      isMet
                        ? "bg-green-50/50 dark:bg-green-900/10 text-green-700 dark:text-green-400"
                        : "bg-amber-50/50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400",
                    )}
                  >
                    {isMet ? (
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                    ) : (
                      <Lock className="h-3 w-3 shrink-0" />
                    )}
                    <span className="truncate">{depLesson?.title || "Unknown lesson"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {estimatedMinutes}min
          </span>
          <span className="flex items-center gap-1 text-amber-500">
            <Zap className="h-3 w-3" />
            {xpReward} XP
          </span>
        </div>

        {/* Progress indicator */}
        {pct > 0 && (
          <div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {progress?.completed ? "Completed" : `${pct}% done`}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
