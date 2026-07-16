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
      <div className="max-w-7xl mx-auto px-6 py-10 md:px-8">
        <div className="mb-12">
          <div className="h-9 w-56 bg-muted rounded-lg animate-pulse mb-3" />
          <div className="h-5 w-80 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse pt-0 border-0 shadow-lg">
              <div className="h-48 bg-muted" />
              <div className="p-6 space-y-4">
                <div className="h-5 w-3/4 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-2/3 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive font-medium mb-1">Failed to load courses</p>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); fetchCourses().then(res => { if (res.success && res.data) setCourses(res.data); else setError(res.error?.message ?? "Failed to load courses"); setLoading(false); }); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 md:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/10">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Curriculum Catalog
            </h1>
            <p className="text-muted-foreground mt-1 text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" /> Choose a course to start your learning journey
            </p>
          </div>
        </div>
      </motion.div>

      {courses.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-muted flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Courses will appear here once they are published by your instructor.
          </p>
        </motion.div>
      )}

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
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
                icon={<Icon className="w-8 h-8 text-white/90" />}
                meta={{
                  difficulty: diff.label,
                }}
                subtitle={`${course.estimated_hours ?? 0} HOURS`}
                badges={course.visible === false ? ["Draft"] : undefined}
                stats={{
                  likes: reviews,
                  views: Math.floor(reviews * 3.5),
                }}
              />
              <div className="absolute top-4 right-4 z-30 pointer-events-none">
                <div className="bg-brand-charcoal-card/80 backdrop-blur-md rounded-full px-3 py-1 border border-brand-charcoal-border shadow-lg flex items-center">
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