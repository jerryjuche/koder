"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchCourse } from "@/lib/api";
import { CourseWithModules, Module } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Clock, BarChart3, CheckCircle2, Lock,
  BookOpen, GraduationCap, Sparkles, ChevronRight,
  Layers, FileText, PlayCircle,
} from "lucide-react";

const difficultyMeta = (d: number) => {
  if (d <= 2) return { label: "Beginner", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: "🌱" };
  if (d <= 3) return { label: "Intermediate", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: "🔥" };
  return { label: "Advanced", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: "⚡" };
};

const MODULE_GRADIENTS: Record<string, string> = {
  python: "from-blue-600/20 via-sky-500/10",
  go: "from-cyan-600/20 via-teal-500/10",
  data: "from-amber-600/20 via-yellow-500/10",
  web: "from-violet-600/20 via-purple-500/10",
  algo: "from-rose-600/20 via-pink-500/10",
};

const MODULE_ICONS: Record<string, string> = {
  "python-fundamentals": "🐍",
  "go-fundamentals": "🔷",
  "python-intermediate": "⚡",
  "data-structures": "🌲",
};

function moduleGradient(slug: string): string {
  for (const [key, val] of Object.entries(MODULE_GRADIENTS)) {
    if (slug.includes(key)) return val;
  }
  return "from-primary/15 via-primary/5";
}

function moduleInitial(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function CourseDetail() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const [data, setData] = useState<CourseWithModules | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetchCourse(courseSlug);
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    };
    load();
  }, [courseSlug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted rounded" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-muted rounded-xl" />
            ))}
          </div>
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
        <p className="text-muted-foreground">Course not found</p>
        <Link href="/learn/courses" className="text-primary hover:underline mt-2 inline-block">Back to courses</Link>
      </div>
    );
  }

  const diff = difficultyMeta(data.difficulty_level);
  const pct = data.progress?.progress_pct ?? 0;
  const completedText = data.total_lessons > 0 ? `${data.completed_lessons}/${data.total_lessons} lessons` : "";
  const firstIncomplete = data.modules.find((m) => (m.completed_lessons ?? 0) < (m.lesson_count ?? 0));

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      {/* Back */}
      <Link href="/learn/courses" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-6 transition-colors group">
        <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" /> Back to courses
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-6 md:p-8 mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.02] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 shadow-sm">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold">{data.title}</h1>
              {data.description && (
                <p className="text-muted-foreground mt-2 leading-relaxed">{data.description}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
            <Badge className={`${diff.color} border-0 text-xs font-medium`}>{diff.icon} {diff.label}</Badge>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {data.estimated_hours}h
            </span>
            {completedText && (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> {completedText}
              </span>
            )}
            <span className="text-muted-foreground flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" /> {data.modules.length} modules
            </span>
          </div>
          {pct > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Course Progress</span>
                <span className="font-medium">{Math.round(pct)}%</span>
              </div>
              <Progress value={pct} className="h-2.5" />
            </div>
          )}
        </div>
      </div>

      {/* Modules */}
      <div className="relative">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          {pct === 0 ? (
            <>
              <Sparkles className="h-4 w-4 text-amber-500" />
              Choose where to start
            </>
          ) : (
            <>
              <Layers className="h-4 w-4 text-primary" />
              Continue Learning
            </>
          )}
        </h2>

        <div className="grid gap-5">
          {data.modules.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No modules published yet</p>
            </div>
          )}

          {data.modules.map((mod, idx) => {
            const completed = mod.completed_lessons ?? 0;
            const total = mod.lesson_count ?? 0;
            const modPct = total > 0 ? (completed / total) * 100 : 0;
            const isComplete = modPct >= 100;
            const gradient = moduleGradient(mod.slug);
            const initials = moduleInitial(mod.slug);
            const isCurrent = firstIncomplete && mod.id === firstIncomplete.id && !isComplete;

            return (
              <Link
                key={mod.id}
                href={`/learn/courses/${courseSlug}/modules/${mod.slug}`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <Card
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 pt-0",
                    "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5",
                    "animate-in fade-in slide-in-from-bottom-3",
                    isComplete && "ring-1 ring-emerald-500/20",
                    isCurrent && "ring-2 ring-primary/30",
                  )}
                >
                  {/* Gradient top bar */}
                  <div className={cn(
                    "h-2 w-full bg-gradient-to-r",
                    gradient,
                  )} />

                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Module icon / number */}
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-200 group-hover:scale-105",
                        isComplete
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-gradient-to-br from-primary/20 to-primary/5 text-primary",
                      )}>
                        {MODULE_ICONS[mod.slug] ? (
                          <span className="text-lg">{MODULE_ICONS[mod.slug]}</span>
                        ) : (
                          <span className="text-sm font-bold">{idx + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                                {mod.title}
                              </h3>
                              {isComplete && (
                                <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 h-5 border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                                  Done
                                </Badge>
                              )}
                              {isCurrent && (
                                <Badge className="shrink-0 text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-0">
                                  Current
                                </Badge>
                              )}
                            </div>
                            {mod.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{mod.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Progress + meta */}
                        {total > 0 && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <FileText className="h-3 w-3" /> {total} {total === 1 ? "lesson" : "lessons"}
                              </span>
                              <span className={cn(
                                "text-xs font-bold tabular-nums",
                                isComplete ? "text-emerald-500" : "text-muted-foreground",
                              )}>
                                {Math.round(modPct)}%
                              </span>
                            </div>
                            <div
                              role="progressbar"
                              aria-valuenow={Math.round(modPct)}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              className="h-1.5 bg-muted/80 rounded-full overflow-hidden ring-1 ring-white/[0.03]"
                            >
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-1000 ease-out",
                                  isComplete
                                    ? "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_6px_rgba(52,211,153,0.3)]"
                                    : "bg-gradient-to-r from-primary/60 to-primary",
                                )}
                                style={{ width: `${Math.round(modPct)}%` }}
                              />
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                              {completed > 0 && (
                                <span className="text-emerald-500/80">{completed} completed</span>
                              )}
                              {total - completed > 0 && (
                                <span>{total - completed} remaining</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="shrink-0 flex items-center self-center">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                          "bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary text-muted-foreground group-hover:translate-x-0.5",
                        )}>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.03] rounded-full -translate-y-1/2 translate-x-1/2" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}