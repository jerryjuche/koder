"use client";

import { useState, useEffect } from "react";
import { fetchCourses } from "@/lib/api";
import { Course } from "@/lib/types";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { LearningCard } from "@/components/ui/learning-card";
import { RatingBadge } from "@/components/ui/rating-badge";
import {
  BookOpen,
  Clock,
  ArrowRight,
  GraduationCap,
  Code2,
  Terminal,
  Database,
  Globe,
  Brain,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const difficultyMeta = (d: number) => {
  if (d <= 2) return { label: "Beginner", color: "from-emerald-500 to-green-600", textColor: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" };
  if (d <= 3) return { label: "Intermediate", color: "from-amber-500 to-orange-600", textColor: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30" };
  return { label: "Advanced", color: "from-red-500 to-rose-600", textColor: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30" };
};

const courseBranding: Record<string, { gradient: string; icon: typeof Code2; lightBg: string }> = {
  "python-fundamentals": {
    gradient: "from-blue-600 via-blue-500 to-sky-400",
    icon: Code2,
    lightBg: "bg-blue-50 dark:bg-blue-950/30",
  },
  "go-fundamentals": {
    gradient: "from-cyan-600 via-cyan-500 to-teal-400",
    icon: Terminal,
    lightBg: "bg-cyan-50 dark:bg-cyan-950/30",
  },
  "python-intermediate": {
    gradient: "from-violet-600 via-violet-500 to-purple-400",
    icon: Brain,
    lightBg: "bg-violet-50 dark:bg-violet-950/30",
  },
  "data-structures": {
    gradient: "from-amber-600 via-amber-500 to-yellow-400",
    icon: Database,
    lightBg: "bg-amber-50 dark:bg-amber-950/30",
  },
};

const fallbackBranding = {
  gradient: "from-slate-600 via-slate-500 to-gray-400",
  icon: Globe,
  lightBg: "bg-slate-50 dark:bg-slate-950/30",
};

// Generates a mock rating between 4.5 and 5.0 for premium feel
const generateMockRating = (slug: string) => {
  const hash = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 4.5 + (hash % 5) / 10;
};

// Generates a mock review count between 120 and 999
const generateMockReviews = (slug: string) => {
  const hash = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 120 + (hash % 880);
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
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      const res = await fetchCourses();
      if (res.success && res.data) {
        setCourses(res.data);
      } else {
        setError(res.error?.message ?? "Failed to load courses");
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
            <Card key={i} className="overflow-hidden animate-pulse pt-0 border-0 shadow-sm">
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
        <p className="text-destructive font-medium mb-1">Failed to load courses</p>
        <p className="text-xs text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); fetchCourses().then(res => { if (res.success && res.data) setCourses(res.data); else setError(res.error?.message ?? "Failed to load courses"); setLoading(false); }); }}
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
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Courses</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Choose a course to start learning
            </p>
          </div>
        </div>
      </motion.div>

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
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
      >
        {courses.map((course) => {
          const diff = difficultyMeta(course.difficulty_level ?? 1);
          const brand = courseBranding[course.slug] || fallbackBranding;
          const Icon = brand.icon;
          const rating = generateMockRating(course.slug);
          const reviews = generateMockReviews(course.slug);

          return (
            <motion.div key={course.id} variants={itemVariants} className="h-full relative">
              <LearningCard
                type="course"
                title={course.title}
                description={course.description}
                href={`/learn/courses/${course.slug}`}
                icon={<Icon className="w-4 h-4 text-white/90" />}
                meta={{
                  difficulty: diff.label,
                }}
                subtitle={`${course.estimated_hours ?? 0}h`}
                badges={course.visible === false ? ["Draft"] : undefined}
                stats={{
                  likes: reviews,
                  views: Math.floor(reviews * 3.5),
                }}
              />
              <div className="absolute top-2 right-2 z-30 pointer-events-none">
                <div className="bg-brand-charcoal-card/80 backdrop-blur-sm rounded-full px-2 py-0.5 border border-brand-charcoal-border shadow flex items-center">
                  <RatingBadge rating={rating} reviewCount={reviews} size="sm" className="text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}