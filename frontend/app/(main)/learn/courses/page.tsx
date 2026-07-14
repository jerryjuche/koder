"use client";

import { useState, useEffect } from "react";
import { fetchCourses } from "@/lib/api";
import { Course } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, BarChart3 } from "lucide-react";

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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Courses</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-40" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const difficultyLabel = (d: number) => {
    if (d <= 2) return { label: "Beginner", color: "bg-green-100 text-green-800" };
    if (d <= 3) return { label: "Intermediate", color: "bg-amber-100 text-amber-800" };
    return { label: "Advanced", color: "bg-red-100 text-red-800" };
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="text-muted-foreground mt-2">Choose a course to start learning</p>
      </div>

      {courses.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">No courses published yet</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const diff = difficultyLabel(course.difficulty_level);
          return (
            <Link key={course.id} href={`/learn/courses/${course.slug}`}>
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{course.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">{course.description || "No description"}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge className={diff.color}>{diff.label}</Badge>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.estimated_hours}h</span>
                    <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Lvl {course.difficulty_level}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
