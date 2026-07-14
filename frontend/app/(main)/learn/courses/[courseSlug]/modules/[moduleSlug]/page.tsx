"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchModule } from "@/lib/api";
import { ModuleWithLessons } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, Zap } from "lucide-react";

export default function ModuleDetail() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const moduleSlug = params.moduleSlug as string;
  const [data, setData] = useState<ModuleWithLessons | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetchModule(courseSlug, moduleSlug);
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    };
    load();
  }, [courseSlug, moduleSlug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-muted-foreground">Module not found</p>
        <Link href={`/learn/courses/${courseSlug}`} className="text-primary hover:underline mt-2 inline-block">Back to course</Link>
      </div>
    );
  }

  const completedCount = data.lessons.filter((l) => l.completed).length;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link href={`/learn/courses/${courseSlug}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-6">
        <ArrowLeft className="h-3 w-3" /> Back to course
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">{data.module.title}</h1>
        {data.module.description && <p className="text-muted-foreground mt-2">{data.module.description}</p>}
        <p className="text-sm text-muted-foreground mt-2">
          {completedCount}/{data.lessons.length} lessons completed
        </p>
      </div>

      <div className="space-y-3">
        {data.lessons.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No lessons published yet</p>
        )}
        {data.lessons.map((lesson, idx) => (
          <Link key={lesson.id} href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${lesson.slug}`}>
            <Card className={`hover:border-primary/40 transition-colors cursor-pointer ${lesson.completed ? "border-green-500/30" : ""}`}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-muted-foreground w-8">{idx + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{lesson.title}</span>
                      {lesson.completed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <Badge variant="outline" className="text-xs">Diff {lesson.difficulty}</Badge>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.estimated_minutes}min</span>
                      <span className="flex items-center gap-1 text-amber-500"><Zap className="h-3 w-3" /> {lesson.xp_reward} XP</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
