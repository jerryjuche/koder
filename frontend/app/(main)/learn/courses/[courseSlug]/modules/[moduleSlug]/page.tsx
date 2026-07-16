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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border-0 shadow-lg mb-10 bg-card"
      >
        <div className={cn("h-2 w-full bg-gradient-to-r", gradient)} />
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 shadow-md ring-1 ring-primary/20">
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
            <span className="flex items-center gap-1.5 font-medium px-3 py-1 bg-muted/50 rounded-full">
              <FileText className="h-4 w-4 text-primary" />
              {totalCount} {totalCount === 1 ? "lesson" : "lessons"}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground px-3 py-1 bg-muted/50 rounded-full">
              <Zap className="h-4 w-4 text-amber-500" />
              {earnedXp}/{totalXp} XP
            </span>
            {completedCount > 0 && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium px-3 py-1 bg-emerald-500/10 rounded-full">
                <CheckCircle2 className="h-4 w-4" />
                {Math.round(pct)}% complete
              </span>
            )}
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="mt-6 p-4 bg-background/50 rounded-xl border border-border/50">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" /> Module progress
                </span>
                <span className="font-bold tabular-nums text-primary">{Math.round(pct)}%</span>
              </div>
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
                      : "bg-gradient-to-r from-primary/70 to-primary shadow-[0_0_8px_rgba(var(--primary),0.3)]",
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

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
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

            let status: "locked" | "in-progress" | "completed" | "available" = "available";
            if (isComplete) status = "completed";
            else if (isCurrent) status = "in-progress";

            return (
              <motion.div key={lesson.id} variants={itemVariants}>
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