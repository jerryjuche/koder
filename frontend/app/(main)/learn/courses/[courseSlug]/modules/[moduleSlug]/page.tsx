"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchModule } from "@/lib/api";
import { ModuleWithLessons } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle2, Clock, Zap,
  BookOpen, Circle, CircleDot, Lock,
  GraduationCap, Sparkles, ChevronRight,
  Star, PlayCircle,
} from "lucide-react";

const MODULE_GRADIENTS: Record<string, string> = {
  python: "from-blue-600/20 via-sky-500/10",
  go: "from-cyan-600/20 via-teal-500/10",
  data: "from-amber-600/20 via-yellow-500/10",
  web: "from-violet-600/20 via-purple-500/10",
  algo: "from-rose-600/20 via-pink-500/10",
};

function moduleGradient(slug: string): string {
  for (const [key, val] of Object.entries(MODULE_GRADIENTS)) {
    if (slug.includes(key)) return val;
  }
  return "from-primary/15 via-primary/5";
}

const difficultyMeta = (d: number) => {
  if (d <= 2) return { label: "Beginner", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
  if (d <= 3) return { label: "Intermediate", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
  return { label: "Advanced", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
};

export default function ModuleDetail() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const moduleSlug = params.moduleSlug as string;
  const [data, setData] = useState<ModuleWithLessons | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetchModule(courseSlug, moduleSlug);
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    };
    load();
  }, [courseSlug, moduleSlug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground">Module not found</p>
        <Link href={`/learn/courses/${courseSlug}`} className="text-primary hover:underline mt-2 inline-block">
          Back to course
        </Link>
      </div>
    );
  }

  const completedCount = data.lessons.filter((l) => l.completed).length;
  const totalCount = data.lessons.length;
  const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const gradient = moduleGradient(moduleSlug);
  const firstIncomplete = data.lessons.find((l) => !l.completed);

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      {/* Back */}
      <Link
        href={`/learn/courses/${courseSlug}`}
        className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-6 transition-colors group"
      >
        <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" /> Back to course
      </Link>

      {/* Module Header */}
      <div className="relative overflow-hidden rounded-2xl border mb-8">
        <div className={cn(
          "h-2 w-full bg-gradient-to-r",
          gradient,
        )} />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 shadow-sm">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold">{data.module.title}</h1>
              {data.module.description && (
                <p className="text-sm text-muted-foreground mt-1">{data.module.description}</p>
              )}
            </div>
          </div>

          {/* Progress bar + stats */}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 text-foreground">
              <CircleDot className="h-4 w-4 text-primary" />
              {completedCount}/{totalCount} completed
            </span>
            {pct > 0 && (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                {Math.round(pct)}% done
              </span>
            )}
          </div>
          {totalCount > 0 && (
            <div className="mt-3">
              <div
                role="progressbar"
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 bg-muted/80 rounded-full overflow-hidden ring-1 ring-white/[0.03]"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    pct >= 100
                      ? "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_6px_rgba(52,211,153,0.3)]"
                      : "bg-gradient-to-r from-primary/60 to-primary",
                  )}
                  style={{ width: `${Math.round(pct)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lessons */}
      <div className="relative">
        <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
          {pct === 0 ? (
            <>
              <Sparkles className="h-4 w-4 text-amber-500" />
              Lessons
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 text-primary" />
              Continue Learning
            </>
          )}
        </h2>

        <div className="space-y-3">
          {totalCount === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No lessons published yet</p>
            </div>
          )}

          {data.lessons.map((lesson, idx) => {
            const isComplete = lesson.completed;
            const isCurrent = firstIncomplete && lesson.id === firstIncomplete.id;
            const diff = difficultyMeta(lesson.difficulty);
            const lessonHref = `/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${lesson.slug}`;

            return (
              <Link
                key={lesson.id}
                href={lessonHref}
                className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <Card
                  className={cn(
                    "relative overflow-hidden transition-all duration-300",
                    "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5",
                    "animate-in fade-in slide-in-from-bottom-3",
                    isComplete && "ring-1 ring-emerald-500/20",
                    isCurrent && "ring-2 ring-primary/30",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Status icon */}
                      <div className="shrink-0 pt-0.5">
                        {isComplete ? (
                          <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center ring-1 ring-emerald-500/20">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center ring-1 ring-primary/30">
                            <CircleDot className="h-5 w-5 text-primary" />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center text-sm font-bold text-muted-foreground/40 group-hover:bg-primary/10 group-hover:text-primary/60 transition-colors">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={cn(
                            "font-semibold text-sm group-hover:text-primary transition-colors",
                            isComplete && "text-emerald-600 dark:text-emerald-400",
                          )}>
                            {lesson.title}
                          </h3>
                          {isComplete && (
                            <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                              Done
                            </Badge>
                          )}
                          {isCurrent && (
                            <Badge className="shrink-0 text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">
                              Current
                            </Badge>
                          )}
                        </div>
                        {lesson.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2.5">{lesson.description}</p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="text-[10px] font-mono bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400">
                            <Zap className="h-2.5 w-2.5 mr-0.5" />
                            {lesson.xp_reward} XP
                          </Badge>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {lesson.estimated_minutes}min
                          </span>
                          <span className={cn(
                            "text-[11px] font-medium px-1.5 py-0.5 rounded-full",
                            diff.color,
                          )}>
                            {diff.label}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="shrink-0 flex items-center self-center">
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200",
                          "bg-muted/30 group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5",
                        )}>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  {/* Hover glow */}
                  {!isComplete && (
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.03] rounded-full -translate-y-1/2 translate-x-1/2" />
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}