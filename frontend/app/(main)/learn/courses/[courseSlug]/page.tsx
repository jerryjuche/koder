"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { fetchCourse } from "@/lib/api";
import { CourseWithModules } from "@/lib/types";
import Link from "next/link";
import { motion } from "framer-motion";
import { LearningCard } from "@/components/ui/learning-card";
import { type Language } from "@/components/LanguageLogo";
import { useWebSocket } from "@/lib/event";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Sparkles,
  Trophy,
  Clock,
  Target,
  Zap,
  PlayCircle,
} from "lucide-react";

const difficultyMeta = (d: number) => {
  if (d <= 2) return { label: "Beginner", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
  if (d <= 3) return { label: "Intermediate", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
  return { label: "Advanced", color: "bg-rose-500/15 text-rose-400 border-rose-500/30" };
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
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function CourseDetail() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const [data, setData] = useState<CourseWithModules | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const res = await fetchCourse(courseSlug);
    if (res.success && res.data) {
      setData(res.data);
    }
  }, [courseSlug]);

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
      <div className="max-w-screen-2xl mx-auto px-4 py-8 md:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-20 bg-muted rounded-lg" />
          <div className="h-40 bg-muted rounded-3xl" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (<div key={i} className="h-24 bg-muted rounded-2xl" />))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (<div key={i} className="h-52 bg-muted rounded-2xl" />))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <BookOpen className="h-7 w-7 text-destructive" />
        </div>
        <h3 className="text-lg font-bold mb-1">Failed to load course</h3>
        <p className="text-xs text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); refetch().then(() => setLoading(false)); }}
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
        <p className="text-muted-foreground mb-3">Course not found</p>
        <Link href="/learn/courses" className="text-primary hover:underline font-medium text-sm">
          Back to courses
        </Link>
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
    <div className="max-w-screen-2xl mx-auto px-4 py-8 md:px-6">
      {/* Back */}
      <Link
        href="/learn/courses"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 group font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        All courses
      </Link>

      {/* ── Glassmorphic Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="relative rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card/90 to-card/60 p-6 md:p-8 shadow-xl overflow-hidden">
          {/* Radial ambient glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1 max-w-3xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center backdrop-blur-md shadow-inner shrink-0">
                  <GraduationCap className="w-7 h-7 text-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground truncate">
                    {data.title}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {data.description}
                  </p>
                </div>
              </div>

              {/* Metadata chips */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className={cn("px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-sm", diff.color)}>
                  {diff.label}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {data.estimated_hours}h total
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> {data.modules.length} modules
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" /> {data.total_lessons} lessons
                </span>
              </div>

              {/* Progress Block */}
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-2xl border border-border/50 max-w-lg">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Your Progress</p>
                    <p className="text-xs text-muted-foreground">{completedText || "Start learning now"}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">{Math.round(pct)}%</span>
                </div>
                <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden border border-border/40">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out",
                      pct >= 100
                        ? "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                        : "bg-gradient-to-r from-primary via-amber-400 to-amber-500 shadow-[0_0_8px_rgba(212,175,55,0.3)]",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Continue Learning CTA */}
            {firstIncomplete && pct > 0 && (
              <Link
                href={`/learn/courses/${courseSlug}/modules/${firstIncomplete.slug}`}
                className="hidden lg:flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20 shrink-0"
              >
                <PlayCircle className="w-5 h-5" />
                Continue Learning
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid gap-3 sm:grid-cols-3 mb-8">
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Progress</p>
          <p className="text-2xl font-bold text-foreground">{Math.round(pct)}%</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Overall course progress</p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Lessons</p>
          <p className="text-2xl font-bold text-foreground">{data.completed_lessons}/{data.total_lessons}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{completedText || "Start learning now"}</p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Estimated</p>
          <p className="text-2xl font-bold text-foreground">{data.estimated_hours}h</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Time to complete</p>
        </div>
      </div>

      {/* ── Module Cards ── */}
      <div className="relative">
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
          {pct === 0 ? (
            <><Sparkles className="h-4 w-4 text-amber-500" /> Modules</>
          ) : pct >= 100 ? (
            <><Trophy className="h-4 w-4 text-emerald-500" /> All modules complete</>
          ) : (
            <><Zap className="h-4 w-4 text-primary" /> Continue learning</>
          )}
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {data.modules.length === 0 && (
            <div className="col-span-full text-center py-12 border-2 border-dashed border-border/40 rounded-2xl bg-card/30">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">No modules published yet</p>
            </div>
          )}

          {data.modules.map((mod, idx) => {
            const completed = mod.completed_lessons ?? 0;
            const total = mod.lesson_count ?? 0;
            const modPct = total > 0 ? (completed / total) * 100 : 0;
            const isComplete = modPct >= 100;
            const lang = detectLanguage(mod.slug) ?? detectLanguage(data.slug);
            const isCurrent = firstIncomplete && mod.id === firstIncomplete.id && !isComplete;

            let status: "locked" | "in-progress" | "completed" | "available" = "available";
            if (mod.locked) status = "locked";
            else if (isComplete) status = "completed";
            else if (isCurrent) status = "in-progress";

            return (
              <motion.div key={mod.id} variants={itemVariants} className="h-full">
                <LearningCard
                  type="module"
                  title={mod.title}
                  description={mod.description}
                  imageUrl={mod.image_url || undefined}
                  href={`/learn/courses/${courseSlug}/modules/${mod.slug}`}
                  language={lang}
                  status={status}
                  index={idx + 1}
                  progress={modPct > 0 ? modPct : undefined}
                  subtitle={`${total} lesson${total !== 1 ? "s" : ""}` + (completed > 0 ? ` · ${completed} done` : "")}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
