"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchCourse } from "@/lib/api";
import { CourseWithModules } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, BarChart3, CheckCircle2, Lock } from "lucide-react";

export default function CourseDetail() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const [data, setData] = useState<CourseWithModules | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetchCourse(courseSlug);
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    };
    load();
  }, [courseSlug]);

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8"><div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-4 w-96 bg-muted rounded" /><div className="h-32 bg-muted rounded" /></div></div>;
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-muted-foreground">Course not found</p>
        <Link href="/learn/courses" className="text-primary hover:underline mt-2 inline-block">Back to courses</Link>
      </div>
    );
  }

  const pct = data.progress?.progress_pct ?? 0;
  const completedText = data.total_lessons > 0 ? `${data.completed_lessons}/${data.total_lessons} lessons` : "";

  return (
    <div className="max-w-5xl mx-auto p-8">
      <Link href="/learn/courses" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-6">
        <ArrowLeft className="h-3 w-3" /> Back to courses
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{data.title}</h1>
        <p className="text-muted-foreground mt-2">{data.description}</p>
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <Badge variant="secondary">Level {data.difficulty_level}</Badge>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {data.estimated_hours}h estimated</span>
          {completedText && <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> {completedText}</span>}
        </div>
        {pct > 0 && (
          <div className="mt-4">
            <Progress value={pct} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{Math.round(pct)}% complete</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Modules ({data.modules.length})</h2>
        {data.modules.map((mod, idx) => (
          <Card key={mod.id} className="hover:border-primary/30 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    <span className="text-muted-foreground mr-2">Module {idx + 1}</span>
                    {mod.title}
                  </CardTitle>
                  {mod.description && <p className="text-sm text-muted-foreground mt-1">{mod.description}</p>}
                </div>
                <Link href={`/learn/courses/${courseSlug}/modules/${mod.slug}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
