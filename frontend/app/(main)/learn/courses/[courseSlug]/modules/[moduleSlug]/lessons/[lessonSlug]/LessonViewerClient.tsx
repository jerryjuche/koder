"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchLesson, fetchModule, completeLesson } from "@/lib/api";
import { LessonWithSections, ModuleWithLessons, Lesson } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, Zap,
  Loader2, BookOpen, Sparkles, ChevronLeft, ChevronRight,
  GraduationCap,
} from "lucide-react";
import SectionRenderer from "@/components/learn/SectionRenderer";
import LessonSidebar from "@/components/learn/LessonSidebar";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
  const courseSlug = params.courseSlug as string;
  const moduleSlug = params.moduleSlug as string;
  const lessonSlug = params.lessonSlug as string;

  const lessonLanguage = courseSlug.includes("python")
    ? "python"
    : courseSlug.includes("-go") || courseSlug.startsWith("go-")
      ? "go"
      : "python";

  const [lessonData, setLessonData] = useState<LessonWithSections | null>(null);
  const [moduleData, setModuleData] = useState<ModuleWithLessons | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const load = useCallback(async () => {
    const [lessonRes, moduleRes] = await Promise.all([
      fetchLesson(courseSlug, moduleSlug, lessonSlug),
      fetchModule(courseSlug, moduleSlug),
    ]);
    if (lessonRes.success && lessonRes.data) {
      setLessonData(lessonRes.data);
      setCompleted(lessonRes.data.progress?.completed ?? false);
    }
    if (moduleRes.success && moduleRes.data) {
      setModuleData(moduleRes.data);
    }
    setLoading(false);
  }, [courseSlug, moduleSlug, lessonSlug]);

  useEffect(() => {
    load();
  }, [load]);

  // Scroll-spy: track which section is in view
  useEffect(() => {
    if (!lessonData?.sections?.length) return;

    const ids = lessonData.sections.map((s) => `section-${s.id}`);
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
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    elements.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [lessonData?.sections]);

  const handleComplete = async () => {
    if (!lessonData || completed) return;
    setCompleting(true);
    const res = await completeLesson(lessonData.id);
    if (res.success) {
      setCompleted(true);
      toast.success("Lesson completed!");
      setLessonData((prev) =>
        prev
          ? {
              ...prev,
              progress: {
                user_id: "",
                lesson_id: prev.id,
                completed: true,
                xp_awarded: prev.xp_reward,
              },
            }
          : prev,
      );
    } else {
      toast.error(res.error?.message || "Failed to complete lesson");
    }
    setCompleting(false);
  };

  // Navigation
  const allLessons = moduleData?.lessons || [];
  const currentIndex = allLessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

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

  if (!lessonData) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground">Lesson not found</p>
        <Link
          href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
          className="text-primary hover:underline mt-2 inline-block"
        >
          Back to module
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left sidebar */}
      <LessonSidebar
        courseSlug={courseSlug}
        moduleSlug={moduleSlug}
        moduleTitle={moduleData?.module?.title || moduleSlug}
        lessons={allLessons}
        currentSlug={lessonSlug}
        dependencies={lessonData.dependencies || []}
        progress={lessonData.progress}
        estimatedMinutes={lessonData.estimated_minutes}
        xpReward={lessonData.xp_reward}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Top Nav Bar ── */}
        <header className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 md:px-6 py-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title="Back to module"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  <Link href={`/learn/courses/${courseSlug}`} className="hover:text-foreground transition-colors truncate">
                    {courseSlug.replace(/-/g, " ")}
                  </Link>
                  <span className="shrink-0">/</span>
                  <Link
                    href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
                    className="hover:text-foreground transition-colors truncate"
                  >
                    {moduleData?.module?.title || moduleSlug}
                  </Link>
                </div>
                <h1 className="text-sm font-semibold truncate mt-0.5">
                  {lessonData.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Badge variant="outline" className="text-[11px] font-mono gap-1">
                <Zap className="h-3 w-3 text-amber-500" />
                {lessonData.xp_reward} XP
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lessonData.estimated_minutes}min
              </span>
              <Badge variant="secondary" className="text-[10px]">
                Diff {lessonData.difficulty}
              </Badge>
              {completed && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[11px] gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8">
            {/* Sections */}
            <div className="space-y-8 mb-8">
              {(!lessonData.sections || lessonData.sections.length === 0) && (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                  <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No content sections yet</p>
                </div>
              )}
              {(lessonData.sections || []).map((section, idx) => (
                <motion.section
                  key={section.id}
                  id={`section-${section.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={cn(
                    "scroll-mt-24 relative rounded-xl p-6 md:p-8 border transition-all duration-300",
                    sectionTypeGradients[section.section_type] || "from-muted/10",
                    activeSectionId === section.id
                      ? "border-primary/20 shadow-md shadow-primary/5 bg-gradient-to-br"
                      : "border-border/50 bg-gradient-to-br",
                  )}
                >
                  <SectionRenderer
                    key={section.id}
                    section={section}
                    problemReferences={lessonData.problem_references}
                    language={lessonLanguage}
                  />
                </motion.section>
              ))}
            </div>

            {/* ── Bottom Navigation ── */}
            <div className="border-t pt-6 pb-8">
              <div className="flex items-center justify-between gap-4">
                {/* Previous */}
                <div className="min-w-0 flex-1">
                  {prevLesson ? (
                    <Link
                      href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${prevLesson.slug}`}
                      className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-[11px] text-muted-foreground/60">Previous</p>
                        <p className="text-sm font-medium truncate">{prevLesson.title}</p>
                      </div>
                    </Link>
                  ) : (
                    <div />
                  )}
                </div>

                {/* Mark Complete */}
                <Button
                  onClick={handleComplete}
                  disabled={completing || completed || !lessonData.prerequisites_met}
                  size="lg"
                  className={cn(
                    "min-w-[160px] transition-all shrink-0",
                    completed && "bg-green-600 hover:bg-green-700 cursor-default",
                  )}
                >
                  {completing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : completed ? (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {completed ? "Completed" : "Mark Complete"}
                </Button>

                {/* Next */}
                <div className="min-w-0 flex-1 flex justify-end">
                  {nextLesson ? (
                    <Link
                      href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${nextLesson.slug}`}
                      className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-right"
                    >
                      <div className="text-right min-w-0">
                        <p className="text-[11px] text-muted-foreground/60">Next</p>
                        <p className="text-sm font-medium truncate">{nextLesson.title}</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all shrink-0">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Link>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
