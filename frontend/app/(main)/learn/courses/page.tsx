"use client";

import { useState, useEffect } from "react";
import { fetchCourses } from "@/lib/api";
import { Course } from "@/lib/types";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground mt-1">Choose a course to start your learning journey</p>
          </div>
        </div>
      </div>

      {courses.length === 0 && (
        <div className="text-center py-24">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-muted flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Courses will appear here once they are published by your instructor.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course, idx) => {
          const diff = difficultyMeta(course.difficulty_level ?? 1);
          const brand = courseBranding[course.slug] || fallbackBranding;
          const Icon = brand.icon;

          return (
            <Link
              key={course.id}
              href={`/learn/courses/${course.slug}`}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <Card
                className={cn(
                  "relative overflow-hidden transition-all duration-500 pt-0 border-0 shadow-md",
                  "hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10",
                  "h-full flex flex-col",
                  "animate-in fade-in slide-in-from-bottom-4",
                )}
              >
                {/* Gradient hero */}
                <div className={cn(
                  "relative h-48 bg-gradient-to-br flex items-center justify-center overflow-hidden",
                  brand.gradient,
                )}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent" />
                  <div className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl",
                    "bg-white/90 dark:bg-card/90 backdrop-blur-sm ring-1 ring-white/20",
                    "transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3",
                  )}>
                    <Icon className="h-10 w-10 text-foreground" />
                  </div>
                  {course.visible === false && (
                    <Badge variant="secondary" className="absolute top-4 right-4 text-[11px] font-medium shadow-sm">
                      Draft
                    </Badge>
                  )}
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-5">
                      {course.description}
                    </p>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-3 flex-wrap mb-5">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                      diff.bgColor,
                      diff.textColor,
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        diff.textColor.replace("text-", "bg-"),
                      )} />
                      {diff.label}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {course.estimated_hours ?? 0} hours
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                      Start learning
                    </span>
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                      "bg-muted/60 group-hover:bg-primary group-hover:text-primary-foreground",
                      "text-muted-foreground group-hover:translate-x-1 group-hover:shadow-lg group-hover:shadow-primary/20",
                    )}>
                      <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}