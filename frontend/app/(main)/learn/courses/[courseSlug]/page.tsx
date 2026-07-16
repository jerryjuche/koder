"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchCourse } from "@/lib/api";
import { CourseWithModules } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  ChevronRight,
  Layers,
  FileText,
  Code2,
  Terminal,
  Database,
  Globe,
  Brain,
  Cpu,
  Sparkles,
  Trophy,
} from "lucide-react";

const difficultyMeta = (d: number) => {
  if (d <= 2) return { label: "Beginner", color: "from-emerald-500 to-green-600", textColor: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", ringColor: "ring-emerald-500/30" };
  if (d <= 3) return { label: "Intermediate", color: "from-amber-500 to-orange-600", textColor: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30", ringColor: "ring-amber-500/30" };
  return { label: "Advanced", color: "from-red-500 to-rose-600", textColor: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", ringColor: "ring-red-500/30" };
};

const moduleBranding: Record<string, { gradient: string; icon: typeof Code2 }> = {
  python: { gradient: "from-blue-600 to-sky-500", icon: Code2 },
  go: { gradient: "from-cyan-600 to-teal-500", icon: Terminal },
  data: { gradient: "from-amber-600 to-yellow-500", icon: Database },
  web: { gradient: "from-violet-600 to-purple-500", icon: Globe },
  algo: { gradient: "from-rose-600 to-pink-500", icon: Brain },
  misc: { gradient: "from-slate-600 to-gray-500", icon: Cpu },
};

function resolveModuleBrand(slug: string) {
  for (const [key, val] of Object.entries(moduleBranding)) {
    if (slug.includes(key)) return val;
  }
  return moduleBranding.misc;
}

export default function CourseDetail() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const [data, setData] = useState<CourseWithModules | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      const res = await fetchCourse(courseSlug);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error?.message ?? "Failed to load course");
      }
      setLoading(false);
    };
    load();
  }, [courseSlug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 md:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-28 bg-muted rounded-lg" />
          <div className="h-48 bg-muted rounded-2xl" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive font-medium mb-1">Failed to load course</p>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); fetchCourse(courseSlug).then(res => { if (res.success && res.data) setData(res.data); else setError(res.error?.message ?? "Failed to load course"); setLoading(false); }); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground mb-4">Course not found</p>
        <Link href="/learn/courses" className="text-primary hover:underline font-medium">Back to courses</Link>
      </div>
    );
  }

  const diff = difficultyMeta(data.difficulty_level);
  const pct = data.progress?.progress_pct ?? 0;
  const completedText = data.total_lessons > 0 ? `${data.completed_lessons}/${data.total_lessons} lessons` : "";
  const firstIncomplete = data.modules.find((m) => {
    const completed = m.completed_lessons ?? 0;
    const total = m.lesson_count;
    return total === undefined ? completed === 0 : completed < total;
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 md:px-8">
      {/* Back */}
      <Link
        href="/learn/courses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        All courses
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-card to-card border p-8 mb-10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/[0.02] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative">
          <div className="flex items-start gap-5 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-primary/10">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{data.title}</h1>
              {data.description && (
                <p className="text-muted-foreground mt-2 leading-relaxed">{data.description}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
              diff.bgColor,
              diff.textColor,
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", diff.textColor.replace("text-", "bg-"))} />
              {diff.label}
            </div>
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {data.estimated_hours}h
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-4 w-4" /> {data.modules.length} modules
            </span>
            {completedText && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4" /> {completedText}
              </span>
            )}
          </div>

          {pct > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground font-medium">Course progress</span>
                <span className="font-bold tabular-nums">{Math.round(pct)}%</span>
              </div>
              <div className="h-2.5 bg-muted/80 rounded-full overflow-hidden ring-1 ring-white/[0.03]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modules */}
      <div className="relative">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          {pct === 0 ? (
            <>
              <Sparkles className="h-5 w-5 text-amber-500" />
              Course modules
            </>
          ) : (
            <>
              <Trophy className="h-5 w-5 text-primary" />
              Continue learning
            </>
          )}
        </h2>

        <div className="space-y-5">
          {data.modules.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed rounded-xl">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No modules published yet</p>
            </div>
          )}

          {data.modules.map((mod, idx) => {
            const completed = mod.completed_lessons ?? 0;
            const total = mod.lesson_count ?? 0;
            const modPct = total > 0 ? (completed / total) * 100 : 0;
            const isComplete = modPct >= 100;
            const brand = resolveModuleBrand(mod.slug);
            const Icon = brand.icon;
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
                    "relative overflow-hidden transition-all duration-300 pt-0 border-0 shadow-sm",
                    "hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5",
                    "animate-in fade-in slide-in-from-bottom-3",
                    isComplete && "shadow-emerald-500/5",
                    isCurrent && "ring-2 ring-primary/40 shadow-lg shadow-primary/10",
                  )}
                >
                  {/* Gradient stripe */}
                  <div className={cn("h-1.5 w-full bg-gradient-to-r", brand.gradient)} />

                  <CardContent className="p-6">
                    <div className="flex items-start gap-5">
                      {/* Module icon */}
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-300",
                        "ring-1 ring-white/[0.06]",
                        isComplete
                          ? "bg-emerald-500/15 text-emerald-500 ring-emerald-500/20"
                          : "bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-primary/10",
                        "group-hover:scale-110 group-hover:shadow-md",
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2.5 mb-1">
                              <span className="text-xs font-semibold text-muted-foreground/60 tabular-nums">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                                {mod.title}
                              </h3>
                              {isComplete && (
                                <Badge variant="outline" className="shrink-0 text-[10px] px-2 py-0.5 h-5 border-emerald-500/30 text-emerald-500 bg-emerald-500/5 font-semibold">
                                  Complete
                                </Badge>
                              )}
                              {isCurrent && (
                                <Badge className="shrink-0 text-[10px] px-2 py-0.5 h-5 bg-primary/10 text-primary border-0 font-semibold">
                                  In progress
                                </Badge>
                              )}
                            </div>
                            {mod.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                {mod.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Progress */}
                        {total > 0 && (
                          <div className="mt-4 space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" />
                                {total} {total === 1 ? "lesson" : "lessons"}
                                {completed > 0 && (
                                  <span className="text-emerald-500 ml-1">· {completed} done</span>
                                )}
                              </span>
                              <span className={cn(
                                "font-bold tabular-nums",
                                isComplete ? "text-emerald-500" : "text-muted-foreground/80",
                              )}>
                                {Math.round(modPct)}%
                              </span>
                            </div>
                            <div
                              role="progressbar"
                              aria-valuenow={Math.round(modPct)}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              className="h-2 bg-muted/80 rounded-full overflow-hidden ring-1 ring-white/[0.03]"
                            >
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-1000 ease-out",
                                  isComplete
                                    ? "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_6px_rgba(52,211,153,0.3)]"
                                    : "bg-gradient-to-r from-primary/70 to-primary",
                                )}
                                style={{ width: `${Math.round(modPct)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="shrink-0 flex items-center self-center">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                          "bg-muted/50 group-hover:bg-primary group-hover:text-primary-foreground",
                          "text-muted-foreground group-hover:shadow-lg group-hover:shadow-primary/20",
                          "group-hover:translate-x-0.5",
                        )}>
                          <ChevronRight className="h-5 w-5" />
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