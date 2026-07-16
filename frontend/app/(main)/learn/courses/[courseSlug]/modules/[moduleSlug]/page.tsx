"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchModule } from "@/lib/api";
import { ModuleWithLessons } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Zap,
  BookOpen,
  CircleDot,
  GraduationCap,
  ChevronRight,
  PlayCircle,
  Trophy,
  Sparkles,
  FileText,
} from "lucide-react";

const moduleBranding: Record<string, { gradient: string }> = {
  python: { gradient: "from-blue-600 to-sky-500" },
  go: { gradient: "from-cyan-600 to-teal-500" },
  data: { gradient: "from-amber-600 to-yellow-500" },
  web: { gradient: "from-violet-600 to-purple-500" },
  algo: { gradient: "from-rose-600 to-pink-500" },
  misc: { gradient: "from-slate-600 to-gray-500" },
};

function resolveModuleGradient(slug: string): string {
  for (const [key, val] of Object.entries(moduleBranding)) {
    if (slug.includes(key)) return val.gradient;
  }
  return moduleBranding.misc.gradient;
}

const difficultyMeta = (d: number) => {
  if (d <= 2) return { label: "Beginner", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800/30 ring-emerald-500/20" };
  if (d <= 3) return { label: "Intermediate", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800/30 ring-amber-500/20" };
  return { label: "Advanced", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-800/30 ring-red-500/20" };
};

export default function ModuleDetail() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const moduleSlug = params.moduleSlug as string;
  const [data, setData] = useState<ModuleWithLessons | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      const res = await fetchModule(courseSlug, moduleSlug);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error?.message ?? "Failed to load module");
      }
      setLoading(false);
    };
    load();
  }, [courseSlug, moduleSlug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 md:px-8">
        <div className="animate-pulse space-y-5">
          <div className="h-5 w-28 bg-muted rounded-lg" />
          <div className="h-32 bg-muted rounded-2xl mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive font-medium mb-1">Failed to load module</p>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); fetchModule(courseSlug, moduleSlug).then(res => { if (res.success && res.data) setData(res.data); else setError(res.error?.message ?? "Failed to load module"); setLoading(false); }); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground mb-4">Module not found</p>
        <Link href={`/learn/courses/${courseSlug}`} className="text-primary hover:underline font-medium">
          Back to course
        </Link>
      </div>
    );
  }

  const completedCount = data.lessons.filter((l) => l.completed).length;
  const totalCount = data.lessons.length;
  const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const gradient = resolveModuleGradient(moduleSlug);
  const firstIncomplete = data.lessons.find((l) => !l.completed);
  const totalXp = data.lessons.reduce((sum, l) => sum + l.xp_reward, 0);
  const earnedXp = data.lessons.filter((l) => l.completed).reduce((sum, l) => sum + l.xp_reward, 0);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 md:px-8">
      {/* Back */}
      <Link
        href={`/learn/courses/${courseSlug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to course
      </Link>

      {/* Module header */}
      <div className="relative overflow-hidden rounded-2xl border-0 shadow-sm mb-10">
        <div className={cn("h-2 w-full bg-gradient-to-r", gradient)} />
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">{data.module.title}</h1>
              {data.module.description && (
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-line">{data.module.description}</p>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-4 text-sm mt-5 pt-5 border-t border-border/50">
            <span className="flex items-center gap-1.5 font-medium">
              <FileText className="h-4 w-4 text-primary" />
              {totalCount} {totalCount === 1 ? "lesson" : "lessons"}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="h-4 w-4 text-amber-500" />
              {earnedXp}/{totalXp} XP
            </span>
            {completedCount > 0 && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                {Math.round(pct)}% complete
              </span>
            )}
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="mt-4">
              <div
                role="progressbar"
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2.5 bg-muted/80 rounded-full overflow-hidden ring-1 ring-white/[0.03]"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    pct >= 100
                      ? "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                      : "bg-gradient-to-r from-primary/70 to-primary",
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
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2.5">
          {pct === 0 ? (
            <>
              <Sparkles className="h-5 w-5 text-amber-500" />
              Lessons
            </>
          ) : pct >= 100 ? (
            <>
              <Trophy className="h-5 w-5 text-emerald-500" />
              All lessons complete
            </>
          ) : (
            <>
              <PlayCircle className="h-5 w-5 text-primary" />
              Continue learning
            </>
          )}
        </h2>

        <div className="space-y-3">
          {totalCount === 0 && (
            <div className="text-center py-16 border-2 border-dashed rounded-xl">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No lessons published yet</p>
            </div>
          )}

          {data.lessons.map((lesson, idx) => {
            const isComplete = lesson.completed;
            const isCurrent = firstIncomplete && lesson.id === firstIncomplete.id && !isComplete;
            const diff = difficultyMeta(lesson.difficulty);
            const lessonHref = `/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${lesson.slug}`;

            return (
              <Link
                key={lesson.id}
                href={lessonHref}
                className="relative group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Shadow back plate — CodePen-inspired elevation */}
                <div className="absolute -inset-1.5 rounded-2xl bg-black/12 dark:bg-white/[0.08] opacity-0 scale-[0.96] -z-10 blur-[0.5px] transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-0.5 group-hover:blur-0" />

                <Card
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 border",
                    "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5",
                    "animate-in fade-in slide-in-from-bottom-3",
                    isComplete && [
                      "border-emerald-200/60 dark:border-emerald-900/30",
                      "bg-emerald-50/30 dark:bg-emerald-950/10",
                      "hover:shadow-emerald-500/5",
                    ],
                    isCurrent && [
                      "border-primary/40",
                      "ring-1 ring-primary/20",
                      "shadow-md shadow-primary/10",
                    ],
                    !isComplete && !isCurrent && "hover:border-border",
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Status indicator */}
                      <div className="shrink-0 pt-0.5">
                        {isComplete ? (
                          <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center ring-1 ring-emerald-500/25">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center ring-1 ring-primary/30">
                            <CircleDot className="h-5 w-5 text-primary" />
                          </div>
                        ) : (
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                            "bg-muted/60 text-muted-foreground/30",
                            "ring-1 ring-border",
                            "group-hover:bg-primary/10 group-hover:text-primary/60 group-hover:ring-primary/20",
                            "transition-all duration-200",
                          )}>
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <h3 className={cn(
                              "font-semibold text-[15px] group-hover:text-primary transition-colors truncate",
                              isComplete && "text-emerald-700 dark:text-emerald-300",
                            )}>
                              {lesson.title}
                            </h3>
                            {isComplete && (
                              <Badge variant="outline" className="shrink-0 text-[10px] px-2 py-0 h-5 border-emerald-500/30 text-emerald-500 bg-emerald-500/5 font-semibold">
                                Done
                              </Badge>
                            )}
                            {isCurrent && (
                              <Badge className="shrink-0 text-[10px] px-2 py-0 h-5 bg-primary/10 text-primary border-0 font-semibold">
                                Current
                              </Badge>
                            )}
                          </div>
                        </div>
                        {lesson.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1 mb-3 whitespace-pre-line">
                            {lesson.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
                            <Zap className="h-3 w-3" />
                            {lesson.xp_reward} XP
                          </div>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {lesson.estimated_minutes} min
                          </span>
                          <span className={cn(
                            "text-[11px] font-medium px-2 py-0.5 rounded-full ring-1",
                            diff.color,
                          )}>
                            {diff.label}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="shrink-0 flex items-center self-center">
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
                          "bg-muted/50 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20",
                          "text-muted-foreground",
                          isComplete && "opacity-40 group-hover:opacity-100",
                        )}>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}