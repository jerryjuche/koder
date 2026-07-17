"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { fetchModule } from "@/lib/api";
import { ModuleWithLessons } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LearningCard } from "@/components/ui/learning-card";
import { useWebSocket } from "@/lib/event";
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

  const refetch = useCallback(async () => {
    const res = await fetchModule(courseSlug, moduleSlug);
    if (res.success && res.data) {
      setData(res.data);
    }
  }, [courseSlug, moduleSlug]);

  useEffect(() => {
    const load = async () => {
      setError(null);
      await refetch();
      setLoading(false);
    };
    load();
  }, [refetch]);

  useWebSocket({
    "lesson.completed": useCallback(() => refetch(), [refetch]),
    "user.xp.updated": useCallback(() => refetch(), [refetch]),
    "progress.updated": useCallback(() => refetch(), [refetch]),
  });

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
        className="group relative mb-6"
      >
        <div className={cn(
          "absolute rounded-xl bg-brand-charcoal-card/60 border border-brand-charcoal-border/20 backdrop-blur-sm",
          "transition-all duration-200 ease-out -z-10",
          "top-2 left-2 right-[-0.5rem] bottom-[-0.5rem]",
          "group-hover:top-[-0.5rem] group-hover:left-[-0.5rem] group-hover:right-[-0.5rem] group-hover:bottom-[-0.5rem] group-hover:bg-brand-charcoal-card/80 group-hover:border-brand-charcoal-border/40 group-hover:shadow-lg"
        )} />
        <div className={cn(
          "relative w-full",
          "bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl overflow-hidden",
          "transition-all duration-200 ease-out",
          "group-hover:shadow-[0_4px_16px_rgb(0,0,0,0.35)] group-hover:border-brand-charcoal-border/70"
        )}>
          <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r z-10", gradient)} />
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-violet-500/10 via-violet-500/5 to-transparent opacity-40 z-0" />

          <div className="relative z-10 p-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 backdrop-blur-md shadow-inner shrink-0 bg-gradient-to-br from-violet-500/20 to-violet-500/5">
                <GraduationCap className="w-4 h-4 text-white/90" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base md:text-lg font-semibold text-brand-offwhite">{data.module.title}</h1>
                {data.module.description && (
                  <p className="text-xs text-brand-offwhite-muted mt-0.5 leading-relaxed whitespace-pre-line line-clamp-2">{data.module.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-charcoal-card/80 text-brand-offwhite-muted border border-brand-charcoal-border inline-flex items-center gap-0.5">
                <FileText className="w-2.5 h-2.5" />{totalCount} {totalCount === 1 ? "lesson" : "lessons"}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-charcoal-card/80 text-brand-offwhite-muted border border-brand-charcoal-border inline-flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 text-brand-muted-gold" />{earnedXp}/{totalXp} XP
              </span>
              {completedCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-success/15 text-brand-success border border-brand-success/30">
                  {Math.round(pct)}% complete
                </span>
              )}
            </div>

            {totalCount > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-brand-offwhite-muted uppercase tracking-wider">Progress</span>
                  <span className="text-[10px] font-bold text-brand-muted-gold">{Math.round(pct)}%</span>
                </div>
                <div className="h-1 w-full bg-brand-charcoal-card rounded-full overflow-hidden border border-brand-charcoal-border/30">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out",
                      pct >= 100
                        ? "bg-gradient-to-r from-brand-success to-emerald-400"
                        : "bg-gradient-to-r from-brand-muted-gold to-brand-muted-gold-dark"
                    )}
                    style={{ width: `${Math.round(pct)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
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