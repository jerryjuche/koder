"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchLesson, fetchModule, completeLesson } from "@/lib/api";
import { LessonWithSections, ModuleWithLessons, LessonSection } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, Zap,
  Loader2, BookOpen, ChevronLeft,
  Sparkles, GraduationCap, Lock, AlertTriangle
} from "lucide-react";
import SectionRenderer from "@/components/learn/SectionRenderer";
import SectionQuiz from "@/components/learn/SectionQuiz";
import LessonSidebar from "@/components/learn/LessonSidebar";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/lib/event";
import confetti from "canvas-confetti";

interface Step {
  type: "section" | "quiz-review";
  label: string;
  icon?: string;
  sections?: LessonSection[];
  section?: LessonSection;
}

const stepLabels: Record<string, string> = {
  overview: "Overview",
  explanation: "Learn",
  examples: "Examples",
  best_practices: "Best Practices",
  common_mistakes: "Common Mistakes",
  summary: "Summary",
  quiz: "Quiz",
  exercises: "Practice",
  mini_project: "Project",
  assessment: "Assessment",
  ai_review: "AI Review",
};

const sectionTypeGradients: Record<string, string> = {
  overview: "from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20",
  explanation: "from-sky-500/10 via-sky-500/5 to-transparent border-sky-500/20",
  examples: "from-violet-500/10 via-violet-500/5 to-transparent border-violet-500/20",
  best_practices: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20",
  common_mistakes: "from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20",
  summary: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20",
  quiz: "from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20",
  exercises: "from-teal-500/10 via-teal-500/5 to-transparent border-teal-500/20",
  mini_project: "from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20",
  assessment: "from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/20",
  ai_review: "from-fuchsia-500/10 via-fuchsia-500/5 to-transparent border-fuchsia-500/20",
};

const quizReviewGradient = "from-orange-500/10 via-amber-500/5 to-transparent border-orange-500/20";

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
  const [currentStep, setCurrentStep] = useState(0);

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

  // Store lesson context so problem success page can link back
  useEffect(() => {
    sessionStorage.setItem("koder_lesson_context", JSON.stringify({
      courseSlug,
      moduleSlug,
      lessonSlug,
    }));
  }, [courseSlug, moduleSlug, lessonSlug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Build steps from sections, grouping quizzes into one review step
  const steps = useMemo<Step[]>(() => {
    if (!lessonData?.sections) return [];

    const quizSections: LessonSection[] = [];
    const result: Step[] = [];

    for (const section of lessonData.sections) {
      if (section.section_type === "quiz") {
        quizSections.push(section);
      } else {
        const label = stepLabels[section.section_type] || section.section_type;
        result.push({ type: "section", label, section });
      }
    }

    if (quizSections.length > 0) {
      result.push({
        type: "quiz-review",
        label: "Quiz Review",
        sections: quizSections,
      });
    }

    return result;
  }, [lessonData]);

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];
  const progressPercent = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) setCurrentStep((s) => s + 1);
  }, [currentStep, totalSteps]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept arrow keys if target is inside an input/textarea/monaco editor
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable || target.closest(".monaco-editor"))) {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  const fireConfetti = useCallback(() => {
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
    confetti({ ...defaults, particleCount: 50, origin: { x: 0.5, y: 0.6 } });
    confetti({ ...defaults, particleCount: 30, origin: { x: 0.3, y: 0.5 }, colors: ["#ffd700", "#ff6b6b"] });
    confetti({ ...defaults, particleCount: 30, origin: { x: 0.7, y: 0.5 }, colors: ["#4ecdc4", "#45b7d1"] });
  }, []);

  const handleComplete = async () => {
    if (!lessonData || completed) return;
    setCompleting(true);
    const res = await completeLesson(lessonData.id);

    // Save optimistic completion to sessionStorage to solve DB race condition for prerequisites
    try {
      const completedList: string[] = JSON.parse(
        sessionStorage.getItem("koder_completed_lessons") || "[]"
      );
      if (!completedList.includes(lessonData.id)) {
        completedList.push(lessonData.id);
        sessionStorage.setItem("koder_completed_lessons", JSON.stringify(completedList));
      }
    } catch {}

    if (res.success) {
      setCompleted(true);
      fireConfetti();
      window.dispatchEvent(new Event("user-updated"));

      const total = moduleData?.lessons?.length || 0;
      const done = (moduleData?.lessons?.filter((l) => l.completed || l.id === lessonData.id).length || 0) + 1;
      const progress = total > 0 ? (done / total) * 100 : 0;

      sessionStorage.setItem(
        `koder_lesson_completed_${lessonSlug}`,
        JSON.stringify({
          xpReward: lessonData.xp_reward,
          title: lessonData.title,
          sectionsCount: lessonData.sections.length,
          quizCount: lessonData.sections.filter((s) => s.section_type === "quiz").length,
          exerciseCount: lessonData.sections.filter((s) => s.section_type === "exercises").length,
          moduleProgress: progress,
          moduleTitle: moduleData?.module?.title || moduleSlug,
          nextLessonSlug: nextLesson?.slug || null,
          nextLessonTitle: nextLesson?.title || null,
        }),
      );

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
      setModuleData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lessons: prev.lessons.map((l) =>
            l.id === lessonData.id ? { ...l, completed: true } : l
          ),
        };
      });

      router.push(`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${lessonSlug}/success`);
    } else {
      toast.error(res.error?.message || "Failed to complete lesson");
    }
    setCompleting(false);
  };

  // Polling fallback
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useEffect(() => {
    const interval = setInterval(() => loadRef.current(), 5000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket
  const wsLessonIdRef = useRef(lessonData?.id);
  useEffect(() => {
    wsLessonIdRef.current = lessonData?.id;
  }, [lessonData?.id]);

  useWebSocket({
    "lesson.completed": (data: any) => {
      if (data?.lesson_id && data.lesson_id === wsLessonIdRef.current) {
        loadRef.current();
      }
    },
  }, []);

  // Navigation
  const allLessons = useMemo(() => moduleData?.lessons || [], [moduleData?.lessons]);
  const currentIndex = allLessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const isLastStep = currentStep === totalSteps - 1;

  // Check optimistic completion in sessionStorage
  const isSessionUnlocked = useMemo(() => {
    if (!lessonData) return false;
    try {
      const list: string[] = JSON.parse(sessionStorage.getItem("koder_completed_lessons") || "[]");
      const deps = lessonData.dependencies || [];
      if (deps.length === 0) return true;
      return deps.every((d) => {
        const depLesson = allLessons.find((l) => l.id === d.depends_on_lesson_id);
        return (depLesson && depLesson.completed) || list.includes(d.depends_on_lesson_id);
      });
    } catch {
      return false;
    }
  }, [lessonData, allLessons]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto p-6 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-48 bg-muted rounded-lg" />
          <div className="h-10 w-96 bg-muted rounded-xl" />
          <div className="h-64 bg-card border border-border/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Not found
  if (!lessonData) {
    return (
      <div className="max-w-screen-2xl mx-auto p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center border border-border">
          <BookOpen className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <h3 className="text-lg font-bold mb-1">Lesson not found</h3>
        <p className="text-sm text-muted-foreground mb-6">The requested lesson could not be loaded.</p>
        <Link
          href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all"
        >
          Back to module
        </Link>
      </div>
    );
  }

  // Prerequisites not met (check backend flag AND session cache override)
  if (!lessonData.prerequisites_met && !isSessionUnlocked) {
    const unmetDeps = (lessonData.dependencies || []).filter((d) => {
      const depLesson = allLessons.find((l) => l.id === d.depends_on_lesson_id);
      return depLesson && !depLesson.completed;
    });
    return (
      <div className="flex h-[calc(100vh-3.5rem)]">
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
        <div className="flex-1 flex items-center justify-center p-6 bg-background">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center bg-card border border-border p-8 rounded-2xl shadow-xl"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-foreground">Complete Prerequisites First</h2>
            <p className="text-sm text-muted-foreground mb-6">
              You need to finish the prerequisite lessons before this one unlocks.
            </p>
            <div className="space-y-2 mb-6 text-left">
              {unmetDeps.map((d) => {
                const depLesson = allLessons.find((l) => l.id === d.depends_on_lesson_id);
                return (
                  <div
                    key={d.depends_on_lesson_id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/60"
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">{depLesson?.title || "Prerequisite lesson"}</span>
                    <span className="ml-auto text-[10px] font-bold uppercase text-amber-400 shrink-0 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Locked
                    </span>
                  </div>
                );
              })}
            </div>
            <Link href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                <ChevronLeft className="h-4 w-4" />
                Back to Module
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div key={lessonSlug} className="flex h-[calc(100vh-3.5rem)] bg-background">
      {/* Left Sidebar */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="shrink-0 border-b border-border/60 bg-card/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title="Back to module"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
                <h1 className="text-sm font-bold text-foreground truncate mt-0.5">
                  {lessonData.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Badge variant="outline" className="text-xs font-bold gap-1 bg-amber-500/10 text-amber-400 border-amber-500/30">
                <Zap className="h-3.5 w-3.5 fill-current" />
                {lessonData.xp_reward} XP
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                <Clock className="h-3.5 w-3.5" />
                {lessonData.estimated_minutes}m
              </span>
              {completed && (
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs gap-1 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {totalSteps > 0 && (
            <div className="px-6 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-muted/60 rounded-full overflow-hidden border border-border/40">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground font-bold tabular-nums shrink-0">
                  {currentStep + 1} / {totalSteps}
                </span>
              </div>

              {/* Step Dots */}
              <div className="flex items-center gap-1.5 mt-2">
                {steps.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === currentStep
                        ? "bg-amber-400 w-6 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                        : i < currentStep
                          ? "bg-amber-400/40 w-2 hover:bg-amber-400/60"
                          : "bg-muted-foreground/20 w-2 hover:bg-muted-foreground/40"
                    )}
                    aria-label={`Go to step ${i + 1}: ${step.label}`}
                  />
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto px-6 md:px-10 py-8">
            <AnimatePresence mode="wait">
              {currentStepData?.type === "quiz-review" && currentStepData.sections ? (
                /* Quiz Review Step */
                <motion.div
                  key="quiz-review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 md:p-8 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-foreground">Knowledge Check</h2>
                        <p className="text-xs text-muted-foreground">
                          {currentStepData.sections.length} question{currentStepData.sections.length > 1 ? "s" : ""} to solidify your understanding
                        </p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {currentStepData.sections.map((quizSection, qIdx) => (
                        <div key={quizSection.id} className="rounded-xl border border-border/60 bg-card/60 p-6 shadow-sm">
                          {quizSection.title && (
                            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-xs flex items-center justify-center font-bold text-amber-400 shrink-0">
                                {qIdx + 1}
                              </span>
                              {quizSection.title}
                            </h3>
                          )}
                          <SectionQuiz metadata={quizSection.metadata} />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : currentStepData?.section ? (
                /* Individual Section Step */
                <motion.div
                  key={currentStepData.section.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div
                    className={cn(
                      "rounded-2xl border bg-gradient-to-br p-6 md:p-8 shadow-xl",
                      sectionTypeGradients[currentStepData.section.section_type] || "from-muted/10 border-border/50"
                    )}
                  >
                    <SectionRenderer
                      section={currentStepData.section}
                      problemReferences={lessonData.problem_references}
                      language={lessonLanguage}
                    />
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-2xl border-border/40">
                  <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No content sections available</p>
                </div>
              )}
            </AnimatePresence>

            {/* Bottom Controls */}
            <div className="mt-8 mb-4">
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={currentStep > 0 ? goPrev : undefined}
                  disabled={currentStep === 0}
                  className="gap-2 min-w-[110px] rounded-xl font-semibold border-border"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="text-center shrink-0">
                  <span className="text-xs font-bold text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full border border-border/40">
                    {currentStepData?.label || ""}
                  </span>
                </div>

                {completed ? (
                  nextLesson ? (
                    <Link
                      href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${nextLesson.slug}`}
                    >
                      <Button className="gap-2 min-w-[130px] rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md">
                        Next Lesson
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}>
                      <Button variant="outline" className="gap-2 min-w-[130px] rounded-xl font-bold bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20">
                        <CheckCircle2 className="h-4 w-4" />
                        Module Overview
                      </Button>
                    </Link>
                  )
                ) : isLastStep ? (
                  <Button
                    onClick={handleComplete}
                    disabled={completing}
                    className="gap-2 min-w-[130px] rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                  >
                    {completing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Complete Lesson
                  </Button>
                ) : (
                  <Button onClick={goNext} className="gap-2 min-w-[110px] rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
