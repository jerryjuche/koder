"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { fetchModule } from "@/lib/api";
import { ModuleWithLessons } from "@/lib/types";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LearningCard } from "@/components/ui/learning-card";
import { type Language } from "@/components/LanguageLogo";
import { useWebSocket } from "@/lib/event";
import {
  ArrowLeft,
  BookOpen,
  PlayCircle,
  Trophy,
  Sparkles,
  Lock,
  Clock,
  Zap,
  Target,
  CheckCircle2,
} from "lucide-react";

const difficultyMeta = (d: number) => {
  if (d <= 2)
    return {
      label: "Beginner",
      color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    };
  if (d <= 3)
    return {
      label: "Intermediate",
      color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    };
  return {
    label: "Advanced",
    color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  };
};

function detectLanguage(slug: string): Language | undefined {
  if (slug.includes("python")) return "python";
  if (slug.includes("go")) return "go";
  return undefined;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
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
      setError(null);
    } else {
      setError(
        res.error?.code === "MODULE_LOCKED"
          ? "This module is locked by the instructor"
          : res.error?.message || "Failed to load module",
      );
    }
  }, [courseSlug, moduleSlug]);

  useEffect(() => {
    const load = async () => {
      setError(null);
      setLoading(true);
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
      <div className="max-w-screen-2xl mx-auto px-4 py-8 md:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-20 bg-muted rounded-lg" />
          <div className="h-36 bg-muted rounded-3xl" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isLocked = error === "This module is locked by the instructor";
    return (
      <div className="max-w-screen-2xl mx-auto px-4 py-16 text-center">
        <div
          className={cn(
            "w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center border",
            isLocked
              ? "bg-amber-500/10 border-amber-500/20"
              : "bg-destructive/10 border-destructive/20",
          )}
        >
          {isLocked ? (
            <Lock className="h-7 w-7 text-amber-500" />
          ) : (
            <BookOpen className="h-7 w-7 text-destructive" />
          )}
        </div>
        <h3 className="text-lg font-bold mb-1">
          {isLocked ? "Module Locked" : "Failed to load"}
        </h3>
        <p className="text-xs text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            refetch().then(() => setLoading(false));
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center border border-border">
          <BookOpen className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground mb-3">Module not found</p>
        <Link
          href={`/learn/courses/${courseSlug}`}
          className="text-primary hover:underline font-medium text-sm"
        >
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
  const earnedXp = data.lessons
    .filter((l) => l.completed)
    .reduce((sum, l) => sum + l.xp_reward, 0);
  const moduleLang =
    detectLanguage(data.module.slug) ?? detectLanguage(courseSlug);

  // Also check sessionStorage for recently completed lessons (fixes prereq race)
  const getSessionCompleted = (): string[] => {
    try {
      const raw = sessionStorage.getItem("koder_completed_lessons");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8 md:px-6">
      {/* Back */}
      <Link
        href={`/learn/courses/${courseSlug}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 group font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to course
      </Link>

      {/* ── Glassmorphic Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="relative rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card/90 to-card/60 p-5 md:p-6 shadow-lg overflow-hidden">
          {/* Top accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500" />
          {/* Radial ambient glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1 max-w-3xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/10 border border-violet-500/30 flex items-center justify-center backdrop-blur-md shadow-inner shrink-0">
                  <BookOpen className="w-5 h-5 text-violet-400" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl font-semibold tracking-tight text-foreground truncate">
                    {data.module.title}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {data.module.description}
                  </p>
                </div>
              </div>

              {/* Metadata chips */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-violet-500/15 text-violet-400 border-violet-500/30 shadow-sm">
                  Module {(data.module.order_number ?? 0) + 1}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" /> {totalCount} lessons
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" /> {earnedXp}/
                  {totalXp} XP
                </span>
                {pct > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />{" "}
                    {Math.round(pct)}% complete
                  </span>
                )}
              </div>

              {/* Progress Block */}
              <div className="bg-background/50 backdrop-blur-sm p-3 rounded-xl border border-border/50 max-w-lg">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                      Module Progress
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {completedCount}/{totalCount} lessons completed
                    </p>
                  </div>
                  <span className="text-lg font-bold text-violet-400">
                    {Math.round(pct)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden border border-border/40">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out",
                      pct >= 100
                        ? "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                        : "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.3)]",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Continue Learning CTA */}
            {firstIncomplete && pct > 0 && (
              <Link
                href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${firstIncomplete.slug}`}
                className="hidden lg:flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-bold text-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-violet-600/20 shrink-0"
              >
                <PlayCircle className="w-5 h-5" />
                Continue
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
            Lessons
          </p>
          <p className="text-2xl font-bold text-foreground">
            {completedCount}/{totalCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Finished / total
          </p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
            Progress
          </p>
          <p className="text-2xl font-bold text-foreground">
            {Math.round(pct)}%
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Module completion
          </p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
            XP
          </p>
          <p className="text-2xl font-bold text-foreground">
            {earnedXp}
            <span className="text-base text-muted-foreground font-normal">
              /{totalXp}
            </span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Earned so far
          </p>
        </div>
      </div>

      {/* ── Lesson Cards ── */}
      <div className="relative">
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
          {pct === 0 ? (
            <>
              <Sparkles className="h-4 w-4 text-amber-500" /> Lessons
            </>
          ) : pct >= 100 ? (
            <>
              <Trophy className="h-4 w-4 text-emerald-500" /> All done
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 text-violet-500" /> Continue
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
            <div className="col-span-full text-center py-12 border-2 border-dashed border-border/40 rounded-2xl bg-card/30">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">
                No lessons published yet
              </p>
            </div>
          )}

          {data.lessons.map((lesson, idx) => {
            const isComplete = lesson.completed;
            const isCurrent =
              firstIncomplete &&
              lesson.id === firstIncomplete.id &&
              !isComplete;
            const diff = difficultyMeta(lesson.difficulty);
            const lessonHref = `/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${lesson.slug}`;

            const deps = lesson.dependencies || [];
            const sessionCompleted = getSessionCompleted();
            const isLocked =
              !isComplete &&
              deps.length > 0 &&
              deps.some((d) => {
                const depLesson = data.lessons.find(
                  (l) => l.id === d.depends_on_lesson_id,
                );
                return (
                  depLesson &&
                  !depLesson.completed &&
                  !sessionCompleted.includes(d.depends_on_lesson_id)
                );
              });

            let status: "locked" | "in-progress" | "completed" | "available" =
              "available";
            if (isComplete) status = "completed";
            else if (isLocked) status = "locked";
            else if (isCurrent) status = "in-progress";

            return (
              <motion.div
                key={lesson.id}
                variants={itemVariants}
                className="h-full"
              >
                <LearningCard
                  type="lesson"
                  title={lesson.title}
                  description={lesson.description}
                  href={lessonHref}
                  language={moduleLang}
                  status={status}
                  index={idx + 1}
                  subtitle={`${diff.label} · ${lesson.xp_reward} XP · ${lesson.estimated_minutes}min`}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
