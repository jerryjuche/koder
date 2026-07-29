"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchCourses, fetchProgress } from "@/lib/api";
import { Course } from "@/lib/types";
import { useUser } from "@/lib/UserContext";
import { motion } from "framer-motion";
import { LearningCard } from "@/components/ui/learning-card";
import { Card } from "@/components/ui/card";
import { type Language } from "@/components/LanguageLogo";
import { useWebSocket } from "@/lib/event";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Trophy,
  Zap,
  Target,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

function detectLanguage(slug: string): Language | undefined {
  if (slug.includes("python")) return "python";
  if (slug.includes("go")) return "go";
  return undefined;
}

const difficultyMeta = (d: number) => {
  if (d <= 2)
    return {
      label: "Beginner",
    };
  if (d <= 3)
    return {
      label: "Intermediate",
    };
  return {
    label: "Advanced",
  };
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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
  const [progressBySlug, setProgressBySlug] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [enrolledSlugs, setEnrolledSlugs] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("koder_enrolled_courses") || "[]");
    } catch {
      return [];
    }
  });

  const toggleEnroll = (slug: string, title: string) => {
    setEnrolledSlugs((prev) => {
      const isEnrolled = prev.includes(slug);
      const next = isEnrolled ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        localStorage.setItem("koder_enrolled_courses", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const totalCourses = courses.length;
  const completedCourses = courses.filter(
    (course) => (progressBySlug[course.slug] ?? 0) >= 100,
  ).length;
  const activeCourses = courses.filter((course) => {
    const pct = progressBySlug[course.slug] ?? 0;
    return pct > 0 && pct < 100;
  }).length;

  const refetchProgress = useCallback(async () => {
    const [coursesRes, progressRes] = await Promise.all([
      fetchCourses(),
      fetchProgress(),
    ]);

    if (coursesRes.success && coursesRes.data) {
      setCourses(coursesRes.data);
      setError(null);
    } else if (!coursesRes.success) {
      setError(coursesRes.error?.message ?? "Failed to load courses");
    }

    if (progressRes.success && progressRes.data) {
      const map: Record<string, number> = {};
      for (const entry of progressRes.data.courses) {
        map[entry.course_slug] = entry.progress_pct;
      }
      setProgressBySlug(map);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setError(null);
      await refetchProgress();
      setLoading(false);
    };
    load();
  }, [refetchProgress]);

  useWebSocket({
    "lesson.completed": useCallback(() => refetchProgress(), [refetchProgress]),
    "user.xp.updated": useCallback(() => refetchProgress(), [refetchProgress]),
    "progress.updated": useCallback(() => refetchProgress(), [refetchProgress]),
  });

  useEffect(() => {
    const handler = () => refetchProgress();
    window.addEventListener("user-updated", handler);
    return () => window.removeEventListener("user-updated", handler);
  }, [refetchProgress]);

  const filteredCourses = courses.filter((course) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "python") return course.slug.includes("python");
    if (activeFilter === "go") return course.slug.includes("go");
    if (activeFilter === "beginner") return (course.difficulty_level ?? 1) <= 2;
    if (activeFilter === "intermediate") return (course.difficulty_level ?? 1) === 3;
    if (activeFilter === "advanced") return (course.difficulty_level ?? 1) >= 4;
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 py-8 md:px-6">
        <div className="mb-8 space-y-3">
          <div className="h-8 w-40 bg-muted rounded-xl animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className="h-60 overflow-hidden animate-pulse border-border/40 bg-card/50 rounded-2xl"
            />
          ))}
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
        <h3 className="text-lg font-bold text-foreground mb-1">Failed to load courses</h3>
        <p className="text-xs text-muted-foreground mb-6 max-w-sm mx-auto">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            refetchProgress().then(() => setLoading(false));
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8 md:px-6">
      {/* ── Glassmorphic Learning Profile Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8 relative rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card/90 to-card/60 p-6 md:p-8 shadow-xl overflow-hidden"
      >
        {/* Radial ambient glow background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  Course Catalog
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/30 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Explore
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground max-w-xl">
                Master modern engineering skills through structured, hands-on courses designed with interactive code exercises and projects.
              </p>
            </div>
          </div>

          {/* User Progress Stats Grid */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="rounded-2xl bg-background/60 backdrop-blur-md p-3.5 border border-border/50 text-center shadow-sm">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">
                Level
              </span>
              <span className="text-xl font-extrabold text-foreground flex items-center justify-center gap-1">
                <Trophy className="h-4 w-4 text-amber-400" />
                {user?.level ?? 1}
              </span>
            </div>
            <div className="rounded-2xl bg-background/60 backdrop-blur-md p-3.5 border border-border/50 text-center shadow-sm">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">
                Active
              </span>
              <span className="text-xl font-extrabold text-amber-400 flex items-center justify-center gap-1">
                <Zap className="h-4 w-4 text-amber-400" />
                {activeCourses}
              </span>
            </div>
            <div className="rounded-2xl bg-background/60 backdrop-blur-md p-3.5 border border-border/50 text-center shadow-sm">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">
                Completed
              </span>
              <span className="text-xl font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                <Target className="h-4 w-4 text-emerald-400" />
                {completedCourses}
              </span>
            </div>
          </div>
        </div>

        {/* Category & Difficulty Filter Pills */}
        <div className="mt-6 pt-6 border-t border-border/40 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>
          {[
            { id: "all", label: "All Tracks" },
            { id: "python", label: "Python" },
            { id: "go", label: "Golang" },
            { id: "beginner", label: "Beginner" },
            { id: "intermediate", label: "Intermediate" },
            { id: "advanced", label: "Advanced" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border",
                activeFilter === f.id
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                  : "bg-background/40 text-muted-foreground border-border hover:bg-card hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Empty State ── */}
      {filteredCourses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-card/30 rounded-3xl border border-border/40"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/60 flex items-center justify-center border border-border">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-base font-bold mb-1">No matching courses</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your active filter options above.
          </p>
        </motion.div>
      )}

      {/* ── 3D Learning Cards Grid ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {filteredCourses.map((course) => {
          const diff = difficultyMeta(course.difficulty_level ?? 1);
          const lang = detectLanguage(course.slug);
          const pct = progressBySlug[course.slug];
          const isCompleted = pct !== undefined && pct >= 100;
          const isInProgress = pct !== undefined && pct > 0 && pct < 100;

          return (
            <motion.div key={course.id} variants={itemVariants} className="h-full">
              <LearningCard
                type="course"
                title={course.title}
                description={course.description}
                imageUrl={course.image_url || undefined}
                href={`/learn/courses/${course.slug}`}
                language={lang}
                progress={pct}
                status={isCompleted ? "completed" : isInProgress ? "in-progress" : "available"}
                subtitle={`${course.estimated_hours ?? 0}h total`}
                badges={[diff.label]}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
