"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchModule } from "@/lib/api";
import { ModuleWithLessons } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, Clock, Zap,
  BookOpen, Circle, CircleDot, Lock,
  GraduationCap, Sparkles,
} from "lucide-react";

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
            <div key={i} className="h-20 bg-muted rounded-xl" />
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
        <Link href={`/learn/courses/${courseSlug}`} className="text-primary hover:underline mt-2 inline-block">Back to course</Link>
      </div>
    );
  }

  const completedCount = data.lessons.filter((l) => l.completed).length;
  const pct = data.lessons.length > 0 ? (completedCount / data.lessons.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      {/* Back */}
      <Link
        href={`/learn/courses/${courseSlug}`}
        className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-6 transition-colors"
      >
        <ArrowLeft className="h-3 w-3" /> Back to course
      </Link>

      {/* Module Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{data.module.title}</h1>
            {data.module.description && (
              <p className="text-sm text-muted-foreground mt-1">{data.module.description}</p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1 text-foreground">
            <CircleDot className="h-4 w-4 text-primary" />
            {completedCount}/{data.lessons.length} completed
          </span>
          {pct > 0 && (
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              {Math.round(pct)}% done
            </span>
          )}
        </div>
        {pct > 0 && (
          <Progress value={pct} className="h-2 mt-3" />
        )}
      </motion.div>

      {/* Lessons */}
      <div className="space-y-3">
        {data.lessons.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No lessons published yet</p>
          </div>
        )}
        {data.lessons.map((lesson, idx) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link
              href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${lesson.slug}`}
              className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
            >
              <Card
                className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                  lesson.completed
                    ? "border-green-300/50 hover:border-green-400/70"
                    : "hover:border-primary/30"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className="shrink-0 pt-0.5">
                      {lesson.completed ? (
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-sm font-bold text-muted-foreground/40 group-hover:bg-primary/10 group-hover:text-primary/60 transition-colors">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold text-sm group-hover:text-primary transition-colors ${lesson.completed ? "text-green-700 dark:text-green-400" : ""}`}>
                          {lesson.title}
                        </h3>
                      </div>
                      {lesson.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{lesson.description}</p>
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          <Zap className="h-2.5 w-2.5 mr-0.5 text-amber-500" />
                          {lesson.xp_reward} XP
                        </Badge>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {lesson.estimated_minutes}min
                        </span>
                        <Badge variant="secondary" className="text-[10px]">Diff {lesson.difficulty}</Badge>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="shrink-0 flex items-center">
                      <div className="w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center transition-all group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
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
  );
}
