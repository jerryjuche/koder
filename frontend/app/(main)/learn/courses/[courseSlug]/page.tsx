"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchCourse } from "@/lib/api";
import { CourseWithModules } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LearningCard } from "@/components/ui/learning-card";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Layers,
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
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-20 bg-muted rounded-lg" />
          <div className="h-28 bg-muted rounded-2xl" />
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
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-destructive/10 flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-destructive" />
        </div>
        <p className="text-destructive font-medium mb-1">Failed to load course</p>
        <p className="text-xs text-muted-foreground mb-4">{error}</p>
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
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground mb-3">Course not found</p>
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
    <div className="max-w-6xl mx-auto px-4 py-6 md:px-6">
      {/* Back */}
      <Link
        href="/learn/courses"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 group"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        All courses
      </Link>

      {/* Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-card to-card border p-6 mb-8 shadow-md"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/[0.04] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-primary/20">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">{data.title}</h1>
              {data.description && (
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed whitespace-pre-line">{data.description}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
              diff.bgColor,
              diff.textColor,
            )}>
              <span className={cn("w-1 h-1 rounded-full", diff.textColor.replace("text-", "bg-"))} />
              {diff.label}
            </div>
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
              <Clock className="h-3.5 w-3.5" /> {data.estimated_hours}h
            </span>
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
              <Layers className="h-3.5 w-3.5" /> {data.modules.length} modules
            </span>
            {completedText && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium px-2 py-0.5 bg-emerald-500/10 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5" /> {completedText}
              </span>
            )}
          </div>

          {pct > 0 && (
            <div className="mt-4 p-3 bg-background/50 rounded-lg border border-border/50">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Course progress
                </span>
                <span className="font-bold tabular-nums text-primary">{Math.round(pct)}%</span>
              </div>
              <div className="h-2 bg-muted/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modules */}
      <div className="relative">
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          {pct === 0 ? (
            <>
              <Sparkles className="h-4 w-4 text-amber-500" />
              Modules
            </>
          ) : (
            <>
              <Trophy className="h-4 w-4 text-primary" />
              Continue learning
            </>
          )}
        </h2>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {data.modules.length === 0 && (
            <div className="col-span-full text-center py-8 border-2 border-dashed rounded-xl">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">No modules published yet</p>
            </div>
          )}

          {data.modules.map((mod, idx) => {
            const completed = mod.completed_lessons ?? 0;
            const total = mod.lesson_count ?? 0;
            const modPct = total > 0 ? (completed / total) * 100 : 0;
            const isComplete = modPct >= 100;
            const brand = resolveModuleBrand(mod.slug);
            const isCurrent = firstIncomplete && mod.id === firstIncomplete.id && !isComplete;

            let status: "locked" | "in-progress" | "completed" | "available" = "available";
            if (isComplete) status = "completed";
            else if (isCurrent) status = "in-progress";

            return (
              <motion.div key={mod.id} variants={itemVariants} className="h-full">
                <LearningCard
                  type="module"
                  title={mod.title}
                  description={mod.description}
                  href={`/learn/courses/${courseSlug}/modules/${mod.slug}`}
                  status={status}
                  index={idx + 1}
                  icon={brand.icon}
                  meta={{
                    progress: modPct,
                    count: `${total} lesson${total !== 1 ? 's' : ''}` + (completed > 0 ? ` · ${completed} done` : ''),
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