"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { fetchModule } from "@/lib/api";
import { ModuleWithLessons } from "@/lib/types";
import Link from "next/link";
import { motion } from "framer-motion";
import { LearningCard } from "@/components/ui/learning-card";
import { useWebSocket } from "@/lib/event";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  PlayCircle,
  Trophy,
  Sparkles,
} from "lucide-react";

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
        className="mb-6"
      >
        <LearningCard
          type="module"
          size="lg"
          title={data.module.title}
          description={data.module.description}
          icon={<GraduationCap className="w-4 h-4 text-white/90" />}
          progress={totalCount > 0 ? pct : undefined}
          badges={[
            `${totalCount} ${totalCount === 1 ? "lesson" : "lessons"}`,
            `${earnedXp}/${totalXp} XP`,
            ...(completedCount > 0 ? [`${Math.round(pct)}% complete`] : []),
          ]}
        />
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