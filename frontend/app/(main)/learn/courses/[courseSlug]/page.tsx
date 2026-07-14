"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchCourse } from "@/lib/api";
import { CourseWithModules, Module } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowLeft, Clock, BarChart3, CheckCircle2, Lock,
  BookOpen, GraduationCap, Sparkles, ChevronRight,
  Layers, Zap, FileText,
} from "lucide-react";

const difficultyMeta = (d: number) => {
  if (d <= 2) return { label: "Beginner", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
  if (d <= 3) return { label: "Intermediate", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
  return { label: "Advanced", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
};

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
              <div key={i} className="h-24 bg-muted rounded-xl" />
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

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      {/* Back */}
      <Link href="/learn/courses" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-6 transition-colors">
        <ArrowLeft className="h-3 w-3" /> Back to courses
      </Link>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-6 md:p-8 mb-8"
      >
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
            <Badge className={`${diff.color} border-0 text-xs font-medium`}>{diff.label}</Badge>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {data.estimated_hours}h
            </span>
            {completedText && (
              <span className="text-green-600 flex items-center gap-1">
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
      </motion.div>

      {/* Modules Timeline */}
      <div className="relative">
        {pct === 0 && (
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className="text-lg font-semibold">Choose where to start</h2>
          </div>
        )}
        {pct > 0 && (
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Continue Learning
          </h2>
        )}

        <div className="space-y-4">
          {data.modules.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No modules published yet</p>
            </div>
          )}
          {data.modules.map((mod, idx) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <Link
                href={`/learn/courses/${courseSlug}/modules/${mod.slug}`}
                className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
              >
                <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-l-[3px] border-l-primary/30 hover:border-l-primary">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Timeline number */}
                      <div className="hidden sm:flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                          {idx + 1}
                        </div>
                        {idx < data.modules.length - 1 && (
                          <div className="w-px flex-1 bg-muted-foreground/10 min-h-[2rem]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                              {mod.title}
                            </h3>
                            {mod.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{mod.description}</p>
                            )}
                          </div>
                        </div>
                        {mod.lesson_count !== undefined && (
                          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" /> {mod.lesson_count} lessons
                            </span>
                            {mod.completed_lessons != null && mod.completed_lessons > 0 && (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> {mod.completed_lessons} done
                              </span>
                            )}
                          </div>
                        )}
                        {mod.completed_lessons != null && mod.lesson_count != null && mod.lesson_count > 0 && (
                          <Progress
                            value={(mod.completed_lessons / mod.lesson_count) * 100}
                            className="h-1.5 mt-2"
                          />
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="shrink-0 flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center transition-all group-hover:bg-primary/10 group-hover:text-primary text-muted-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
