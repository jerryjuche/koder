"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { fetchLesson, completeLesson } from "@/lib/api";
import { LessonWithSections, LessonSection, LessonPrereq } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, Clock, Zap, ChevronRight, Loader2 } from "lucide-react";
import SectionRenderer from "@/components/learn/SectionRenderer";
import LessonSidebar from "@/components/learn/LessonSidebar";
import { toast } from "@/lib/toast";

export default function LessonViewerClient() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const moduleSlug = params.moduleSlug as string;
  const lessonSlug = params.lessonSlug as string;

  const [data, setData] = useState<LessonWithSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const load = useCallback(async () => {
    const res = await fetchLesson(courseSlug, moduleSlug, lessonSlug);
    if (res.success && res.data) {
      setData(res.data);
      setCompleted(res.data.progress?.completed ?? false);
    }
    setLoading(false);
  }, [courseSlug, moduleSlug, lessonSlug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleComplete = async () => {
    if (!data || completed) return;
    setCompleting(true);
    const res = await completeLesson(data.id);
    if (res.success) {
      setCompleted(true);
      toast.success("Lesson completed!");
      // Optimistic update
      setData((prev) => prev ? { ...prev, progress: { ...prev.progress!, completed: true, xp_awarded: prev.xp_reward, user_id: "", lesson_id: prev.id } } : prev);
    } else {
      toast.error(res.error?.message || "Failed to complete lesson");
    }
    setCompleting(false);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-8 w-96 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-muted-foreground">Lesson not found</p>
        <Link href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`} className="text-primary hover:underline mt-2 inline-block">Back to module</Link>
      </div>
    );
  }

  const allPrereqsMet = data.prerequisites_met;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      {sidebarOpen && (
        <LessonSidebar
          sections={data.sections}
          dependencies={data.dependencies}
          completed={completed}
          progress={data.progress}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to module
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            </Button>
          </div>

          <h1 className="text-2xl font-bold">{data.title}</h1>
          {data.description && <p className="text-muted-foreground mt-2">{data.description}</p>}

          <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground flex-wrap">
            <Badge variant="outline">Diff {data.difficulty}</Badge>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {data.estimated_minutes}min</span>
            <span className="flex items-center gap-1 text-amber-500"><Zap className="h-3 w-3" /> {data.xp_reward} XP</span>
            {completed && <Badge className="bg-green-100 text-green-800">Completed</Badge>}
            {!allPrereqsMet && <Badge variant="secondary">Prerequisites required</Badge>}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10 mb-12">
          {data.sections.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No content sections yet</p>
          )}
          {data.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} problemReferences={data.problem_references} language="python" />
          ))}
        </div>

        {/* Complete button */}
        <div className="border-t pt-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {completed ? "You have completed this lesson" : "Mark this lesson as complete when you are done"}
          </div>
          <Button
            onClick={handleComplete}
            disabled={completing || completed || !allPrereqsMet}
            className={completed ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {completing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : completed ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            {completed ? "Completed" : "Mark Complete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
