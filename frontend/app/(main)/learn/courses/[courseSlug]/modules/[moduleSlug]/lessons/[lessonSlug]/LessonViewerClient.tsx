"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { fetchLesson, completeLesson } from "@/lib/api";
import { LessonWithSections, LessonSection } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, Clock, Zap, ChevronRight, Loader2,
  BookOpen, GraduationCap, PanelRightOpen, PanelRightClose,
  Sparkles,
} from "lucide-react";
import SectionRenderer from "@/components/learn/SectionRenderer";
import LessonSidebar from "@/components/learn/LessonSidebar";
import { toast } from "@/lib/toast";

const sectionTypeGradients: Record<string, string> = {
  overview: "from-blue-500/5 via-transparent to-transparent",
  explanation: "from-sky-500/5 via-transparent to-transparent",
  examples: "from-violet-500/5 via-transparent to-transparent",
  best_practices: "from-emerald-500/5 via-transparent to-transparent",
  common_mistakes: "from-rose-500/5 via-transparent to-transparent",
  summary: "from-amber-500/5 via-transparent to-transparent",
  quiz: "from-orange-500/5 via-transparent to-transparent",
  exercises: "from-teal-500/5 via-transparent to-transparent",
  mini_project: "from-purple-500/5 via-transparent to-transparent",
  assessment: "from-indigo-500/5 via-transparent to-transparent",
  ai_review: "from-fuchsia-500/5 via-transparent to-transparent",
};

export default function LessonViewerClient() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const moduleSlug = params.moduleSlug as string;
  const lessonSlug = params.lessonSlug as string;

  // Infer lesson language from course slug, not user preference
  const lessonLanguage = courseSlug.includes("python")
    ? "python"
    : courseSlug.includes("-go") || courseSlug.startsWith("go-")
      ? "go"
      : "python";

  const [data, setData] = useState<LessonWithSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

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

  // Scroll-spy: track which section is in view
  useEffect(() => {
    if (!data?.sections?.length) return;

    const ids = data.sections.map((s) => `section-${s.id}`);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id.replace("section-", "");
          setActiveSectionId(id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    elements.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [data?.sections]);

  const handleComplete = async () => {
    if (!data || completed) return;
    setCompleting(true);
    const res = await completeLesson(data.id);
    if (res.success) {
      setCompleted(true);
      toast.success("Lesson completed!");
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
          <div className="h-4 w-64 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground">Lesson not found</p>
        <Link href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`} className="text-primary hover:underline mt-2 inline-block">Back to module</Link>
      </div>
    );
  }

  const allPrereqsMet = data.prerequisites_met;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <LessonSidebar
        sections={data.sections || []}
        dependencies={data.dependencies || []}
        completed={completed}
        progress={data.progress}
        onClose={() => setSidebarOpen(false)}
        activeSectionId={activeSectionId}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <Link
                href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
                className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" /> Back to module
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex gap-1.5"
              >
                {sidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                {sidebarOpen ? "Hide" : "Sections"}
              </Button>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold">{data.title}</h1>
            {data.description && (
              <p className="text-muted-foreground mt-2 leading-relaxed">{data.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
              <Badge variant="outline" className="text-xs font-mono">
                <Zap className="h-3 w-3 mr-1 text-amber-500" />
                {data.xp_reward} XP
              </Badge>
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {data.estimated_minutes}min
              </span>
              <Badge variant="secondary" className="text-xs">Diff {data.difficulty}</Badge>
              {completed && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                </Badge>
              )}
              {!allPrereqsMet && (
                <Badge variant="secondary" className="text-xs">
                  Prerequisites required
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-12 mb-12">
            {(!data.sections || data.sections.length === 0) && (
              <div className="text-center py-16 border-2 border-dashed rounded-xl">
                <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No content sections yet</p>
              </div>
            )}
            {(data.sections || []).map((section, idx) => (
              <motion.section
                key={section.id}
                id={`section-${section.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`scroll-mt-24 relative rounded-xl p-6 md:p-8 border bg-gradient-to-br ${sectionTypeGradients[section.section_type] || "from-muted/10"} transition-all duration-300 ${
                  activeSectionId === section.id ? "border-primary/20 shadow-md shadow-primary/5" : "border-border/50"
                }`}
              >
                <SectionRenderer key={section.id} section={section} problemReferences={data.problem_references} language={lessonLanguage} />
              </motion.section>
            ))}
          </div>

          {/* Complete button */}
          <div className="border-t pt-6 pb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-muted-foreground">
                {completed ? (
                  <span className="flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle2 className="h-4 w-4" /> You have completed this lesson
                  </span>
                ) : (
                  "Mark this lesson as complete when you are done"
                )}
              </div>
              <Button
                onClick={handleComplete}
                disabled={completing || completed || !allPrereqsMet}
                size="lg"
                className={`min-w-[160px] transition-all ${
                  completed
                    ? "bg-green-600 hover:bg-green-700 cursor-default"
                    : ""
                }`}
              >
                {completing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : completed ? (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {completed ? "Completed" : "Mark Complete"}
                {!completed && !completing && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
