"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { fetchCourse } from "@/lib/api";
import { CourseWithModules } from "@/lib/types";
import Link from "next/link";
import { motion } from "framer-motion";
import { LearningCard } from "@/components/ui/learning-card";
import { useWebSocket } from "@/lib/event";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
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
      <div className="max-w-screen-2xl mx-auto px-4 py-6 md:px-6">
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
      <div className="max-w-screen-2xl mx-auto px-4 py-12 text-center">
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
      <div className="max-w-screen-2xl mx-auto px-4 py-12 text-center">
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
    <div className="max-w-screen-2xl mx-auto px-4 py-6 md:px-6">
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
        className="mb-8"
      >
        <LearningCard
          type="course"
          size="lg"
          title={data.title}
          description={data.description}
          imageUrl={data.image_url || undefined}
          icon={<GraduationCap className="w-4 h-4 text-white/90" />}
          progress={pct > 0 ? pct : undefined}
          badges={[
            diff.label,
            `${data.estimated_hours}h`,
            `${data.modules.length} modules`,
            ...(completedText ? [completedText] : []),
          ]}
        />
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
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
                  imageUrl={mod.image_url || undefined}
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