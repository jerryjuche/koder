"use client";

import { useState, useEffect } from "react";
import { fetchCourses } from "@/lib/api";
import { Course } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, ArrowRight, GraduationCap, Sparkles, Star } from "lucide-react";

export default function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetchCourses();
      if (res.success && res.data) {
        setCourses(res.data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const difficultyMeta = (d: number) => {
    if (d <= 2) return { label: "Beginner", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: "🌱" };
    if (d <= 3) return { label: "Intermediate", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: "🔥" };
    return { label: "Advanced", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: "⚡" };
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-10">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-72 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="h-32 bg-muted" />
              <CardContent className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-2/3 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        </div>
        <p className="text-muted-foreground ml-11">Choose a course to start your learning journey</p>
      </div>

      {/* Empty state */}
      {courses.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No courses yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Courses will appear here once they are published by your instructor.
          </p>
        </div>
      )}

      {/* Course grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, idx) => {
          const diff = difficultyMeta(course.difficulty_level ?? 1);
          return (
            <Link key={course.id} href={`/learn/courses/${course.slug}`} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl">
              <Card className="relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 h-full flex flex-col pt-0 animate-in fade-in slide-in-from-bottom-3" style={{ animationDelay: `${idx * 80}ms` }}>
                {/* Gradient header */}
                <div className="relative h-32 bg-gradient-to-br from-primary/15 via-primary/5 to-muted flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent pointer-events-none" />
                  {course.image_url ? (
                    <div className="w-16 h-16 rounded-2xl bg-background/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
                      <BookOpen className="h-8 w-8 text-primary/50" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-background/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
                      <BookOpen className="h-8 w-8 text-primary/50" />
                    </div>
                  )}
                  {course.visible === false && (
                    <Badge variant="secondary" className="absolute top-3 right-3 text-[10px] opacity-0">
                      Draft
                    </Badge>
                  )}
                </div>

                <CardHeader className="p-5 pb-2 relative z-10">
                  <CardTitle className="text-base font-bold leading-tight group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                  {course.description && (
                    <CardDescription className="text-xs mt-1.5 leading-relaxed line-clamp-2">
                      {course.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="px-5 pb-0 relative z-10 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${diff.color} text-[10px] font-medium border-0`}>
                      {diff.icon} {diff.label}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {course.estimated_hours ?? 0}h
                    </span>
                    <span className="text-[11px] text-amber-500 flex items-center gap-0.5">
                      <Star className="h-3 w-3" /> Lvl {course.difficulty_level ?? 1}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-3 relative z-10">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground group-hover:text-primary transition-colors">
                      Start learning
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center transition-all duration-200 group-hover:bg-primary/10 group-hover:text-primary group-hover:translate-x-0.5 text-muted-foreground">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
