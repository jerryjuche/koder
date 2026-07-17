"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchModule } from "@/lib/api";
import { ModuleWithLessons } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LearningCard } from "@/components/ui/learning-card";
import {
  ArrowLeft,
  CheckCircle2,
  Zap,
  BookOpen,
  GraduationCap,
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
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
    <div className="max-w-screen-2xl mx-auto px-4 py-6 md:px-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-20 bg-muted rounded-lg" />
          <div className="h-24 bg-muted rounded-xl mb-2" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-destructive/10 flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-destructive" />
        </div>
        <p className="text-destructive font-medium mb-1">Failed to load module</p>
        <p className="text-xs text-muted-foreground mb-4">{error}</p>
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
      <div className="max-w-screen-2xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground mb-3">Module not found</p>
        <Link href={`/learn/courses/${courseSlug}`} className="text-primary hover:underline font-medium text-sm">
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
    <div className="max-w-screen-2xl mx-auto px-6 py-10 md:px-8">
      {/* Back */}
      <Link
        href={`/learn/courses/${courseSlug}`}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 group"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to course
      </Link>

      {/* Module header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-xl border-0 shadow-sm mb-6 bg-card"
      >
        <div className={cn("h-1.5 w-full bg-gradient-to-r", gradient)} />
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-primary/20">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base md:text-lg font-bold tracking-tight">{data.module.title}</h1>
              {data.module.description && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">{data.module.description}</p>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium px-2 py-0.5 bg-muted/50 rounded-full">
              <FileText className="h-3.5 w-3.5 text-primary" />
              {totalCount} {totalCount === 1 ? "lesson" : "lessons"}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-full">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              {earnedXp}/{totalXp} XP
            </span>
            {completedCount > 0 && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium px-2 py-0.5 bg-emerald-500/10 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {Math.round(pct)}% complete
              </span>
            )}
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="mt-3 p-3 bg-background/50 rounded-lg border border-border/50">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Module progress
                </span>
                <span className="font-bold tabular-nums text-primary">{Math.round(pct)}%</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 bg-muted/80 rounded-full overflow-hidden"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    pct >= 100
                      ? "bg-gradient-to-r from-emerald-500 to-green-400"
                      : "bg-gradient-to-r from-primary/70 to-primary",
                  )}
                  style={{ width: `${Math.round(pct)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Lessons */}
      <div className="relative">
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          {pct === 0 ? (
            <>
              <Sparkles className="h-4 w-4 text-amber-500" />
              Lessons
            </>
          ) : pct >= 100 ? (
            <>
              <Trophy className="h-4 w-4 text-emerald-500" />
              All done
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 text-primary" />
              Continue
            </>
          )}
        </h2>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {totalCount === 0 && (
            <div className="col-span-full text-center py-8 border-2 border-dashed rounded-xl">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">No lessons published yet</p>
            </div>
          )}

          {data.lessons.map((lesson, idx) => {
            const isComplete = lesson.completed;
            const isCurrent = firstIncomplete && lesson.id === firstIncomplete.id && !isComplete;
            const diff = difficultyMeta(lesson.difficulty);
            const lessonHref = `/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${lesson.slug}`;

            let status: "locked" | "in-progress" | "completed" | "available" = "available";
            if (isComplete) status = "completed";
            else if (isCurrent) status = "in-progress";

            return (
              <motion.div key={lesson.id} variants={itemVariants} className="h-full">
                <LearningCard
                  type="lesson"
                  title={lesson.title}
                  description={lesson.description}
                  href={lessonHref}
                  status={status}
                  index={idx + 1}
                  meta={{
                    xp: lesson.xp_reward,
                    minutes: lesson.estimated_minutes,
                    difficulty: diff.label,
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}