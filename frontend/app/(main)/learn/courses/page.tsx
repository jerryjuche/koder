"use client";

import { useState, useEffect } from "react";
import { fetchCourses, fetchProgress } from "@/lib/api";
import { Course } from "@/lib/types";
import { useUser } from "@/lib/UserContext";
import { motion } from "framer-motion";
import { LearningCard } from "@/components/ui/learning-card";
import { Card } from "@/components/ui/card";
import { type Language } from "@/components/LanguageLogo";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";

function detectLanguage(slug: string): Language | undefined {
  if (slug.includes("python")) return "python";
  if (slug.includes("go")) return "go";
  return undefined;
}

const difficultyMeta = (d: number) => {
  if (d <= 2)
    return {
      label: "Beginner",
      color: "from-emerald-500 to-green-600",
      textColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    };
  if (d <= 3)
    return {
      label: "Intermediate",
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    };
  return {
    label: "Advanced",
    color: "from-red-500 to-rose-600",
    textColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  };
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export default function CourseCatalog() {
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressBySlug, setProgressBySlug] = useState<Record<string, number>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalCourses = courses.length;
  const completedCourses = courses.filter(
    (course) => (progressBySlug[course.slug] ?? 0) >= 100,
  ).length;
  const activeCourses = courses.filter((course) => {
    const pct = progressBySlug[course.slug] ?? 0;
    return pct > 0 && pct < 100;
  }).length;

  useEffect(() => {
    const load = async () => {
      setError(null);
      const [coursesRes, progressRes] = await Promise.all([
        fetchCourses(),
        fetchProgress().catch(() => ({ success: false }) as const),
      ]);

      if (coursesRes.success && coursesRes.data) {
        setCourses(coursesRes.data);
      } else {
        setError(coursesRes.error?.message ?? "Failed to load courses");
      }

      if (progressRes.success && progressRes.data) {
        const map: Record<string, number> = {};
        for (const entry of progressRes.data.courses) {
          map[entry.course_slug] = entry.progress_pct;
        }
        setProgressBySlug(map);
      }

      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 py-6 md:px-6">
        <div className="mb-6">
          <div className="h-6 w-24 bg-muted rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-40 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card
              key={i}
              className="overflow-hidden animate-pulse pt-0 border-0 shadow-sm"
            >
              <div className="h-24 bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded" />
              </div>
            </Card>
          ))}
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
        <p className="text-destructive font-medium mb-1">
          Failed to load courses
        </p>
        <p className="text-xs text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchCourses().then((res) => {
              if (res.success && res.data) setCourses(res.data);
              else setError(res.error?.message ?? "Failed to load courses");
              setLoading(false);
            });
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shadow shadow-primary/20 ring-1 ring-white/10">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Courses
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Choose a course to
              start learning
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] mb-6">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Your learning profile
          </p>
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-amber-400/10 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mb-2">
                Current level
              </p>
              <p className="text-3xl font-bold">Level {user?.level ?? 1}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-background p-3 border border-border">
                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
                  Courses
                </p>
                <p className="mt-2 text-lg font-semibold">{totalCourses}</p>
              </div>
              <div className="rounded-2xl bg-background p-3 border border-border">
                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
                  Active
                </p>
                <p className="mt-2 text-lg font-semibold">{activeCourses}</p>
              </div>
              <div className="rounded-2xl bg-background p-3 border border-border">
                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
                  Completed
                </p>
                <p className="mt-2 text-lg font-semibold">{completedCourses}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Ready to learn
          </p>
          <p className="text-sm leading-6 text-foreground/80">
            Browse the course catalog and pick a track with the skills you want
            to build. Your progress updates automatically when lessons are
            completed.
          </p>
        </div>
      </div>

      {courses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
            <BookOpen className="h-7 w-7 text-muted-foreground/30" />
          </div>
          <h3 className="text-base font-semibold mb-1">No courses yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Courses will appear here once they are published by your instructor.
          </p>
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
      >
        {courses.map((course) => {
          const diff = difficultyMeta(course.difficulty_level ?? 1);
          const lang = detectLanguage(course.slug);

          return (
            <motion.div
              key={course.id}
              variants={itemVariants}
              className="h-full"
            >
              <LearningCard
                type="course"
                title={course.title}
                description={course.description}
                imageUrl={course.image_url || undefined}
                href={`/learn/courses/${course.slug}`}
                language={lang}
                progress={progressBySlug[course.slug]}
                meta={{
                  difficulty: diff.label,
                  count:
                    progressBySlug[course.slug] !== undefined
                      ? `${Math.round(progressBySlug[course.slug])}% complete`
                      : `${course.estimated_hours ?? 0}h`,
                }}
                subtitle={`${course.estimated_hours ?? 0}h`}
                badges={course.visible === false ? ["Draft"] : undefined}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
