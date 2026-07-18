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
  Sparkles, GraduationCap
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
  overview: "from-blue-500/10 via-blue-500/5 to-transparent border-blue-200/30 dark:border-blue-800/30",
  explanation: "from-sky-500/10 via-sky-500/5 to-transparent border-sky-200/30 dark:border-sky-800/30",
  examples: "from-violet-500/10 via-violet-500/5 to-transparent border-violet-200/30 dark:border-violet-800/30",
  best_practices: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200/30 dark:border-emerald-800/30",
  common_mistakes: "from-rose-500/10 via-rose-500/5 to-transparent border-rose-200/30 dark:border-rose-800/30",
  summary: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/30 dark:border-amber-800/30",
  quiz: "from-orange-500/10 via-orange-500/5 to-transparent border-orange-200/30 dark:border-orange-800/30",
  exercises: "from-teal-500/10 via-teal-500/5 to-transparent border-teal-200/30 dark:border-teal-800/30",
  mini_project: "from-purple-500/10 via-purple-500/5 to-transparent border-purple-200/30 dark:border-purple-800/30",
  assessment: "from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-200/30 dark:border-indigo-800/30",
  ai_review: "from-fuchsia-500/10 via-fuchsia-500/5 to-transparent border-fuchsia-200/30 dark:border-fuchsia-800/30",
};

const quizReviewGradient = "from-orange-500/10 via-amber-500/5 to-transparent border-orange-200/30 dark:border-orange-800/30";



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

  useEffect(() => {
    setCurrentStep(0);
  }, [lessonSlug]);

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

    // Add quiz review step at the end if there are quizzes
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
      if (e.key === "ArrowRight" || e.key === " ") {
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



  // Polling fallback: refresh data every 5 seconds
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useEffect(() => {
    const interval = setInterval(() => loadRef.current(), 5000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket: listen for lesson.completed events to refresh data
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
  const allLessons = moduleData?.lessons || [];
  const currentIndex = allLessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const isLastStep = currentStep === totalSteps - 1;

  // Loading state
  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-8 w-96 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  // Not found
  if (!lessonData) {
    return (
      <div className="max-w-screen-2xl mx-auto p-6 text-center">
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

          {/* ── Progress bar ── */}
          {totalSteps > 0 && (
            <div className="px-4 md:px-6 pb-2.5">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium tabular-nums shrink-0">
                  {currentStep + 1} / {totalSteps}
                </span>
              </div>
              {/* Step dots */}
              <div className="flex items-center gap-1.5 mt-2">
                {steps.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === currentStep
                        ? "bg-primary w-6"
                        : i < currentStep
                          ? "bg-primary/40 w-2 hover:bg-primary/60"
                          : "bg-muted-foreground/20 w-2 hover:bg-muted-foreground/40",
                    )}
                    aria-label={`Go to step ${i + 1}: ${step.label}`}
                  />
                ))}
              </div>
            </div>
          )}
        </header>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-6 md:py-8">
            <AnimatePresence mode="wait">
              {currentStepData?.type === "quiz-review" && currentStepData.sections ? (
                /* ── Quiz Review Page ── */
                <motion.div
                  key="quiz-review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <div className={cn(
                    "rounded-xl border bg-gradient-to-br p-6 md:p-8",
                    quizReviewGradient,
                  )}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">Quiz Review</h2>
                        <p className="text-sm text-muted-foreground">
                          {currentStepData.sections.length} question{currentStepData.sections.length > 1 ? "s" : ""} to test your knowledge
                        </p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      {currentStepData.sections.map((quizSection, qIdx) => (
                        <div key={quizSection.id} className="rounded-lg border bg-card/50 p-5">
                          {quizSection.title && (
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 whitespace-pre-line">
                              <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-xs flex items-center justify-center font-bold text-orange-600 dark:text-orange-400 shrink-0">
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
                /* ── Individual Section Page ── */
                <motion.div
                  key={currentStepData.section.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <div className={cn(
                    "rounded-xl border bg-gradient-to-br p-6 md:p-8",
                    sectionTypeGradients[currentStepData.section.section_type] || "from-muted/10 border-border/50",
                  )}>
                    <SectionRenderer
                      section={currentStepData.section}
                      problemReferences={lessonData.problem_references}
                      language={lessonLanguage}
                    />
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                  <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No content sections yet</p>
                </div>
              )}
            </AnimatePresence>

            {/* ── Bottom Navigation ── */}
            <div className="mt-8 mb-4">
              <div className="flex items-center justify-between gap-3">
                {/* Previous */}
                <Button
                  variant="outline"
                  onClick={currentStep > 0 ? goPrev : undefined}
                  disabled={currentStep === 0}
                  className="gap-1.5 min-w-[100px]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                {/* Step label */}
                <div className="text-center shrink-0">
                  <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                    {currentStepData?.label || ""}
                  </span>
                </div>

                {/* Next or Complete */}
                {completed ? (
                  nextLesson ? (
                    <Link
                      href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${nextLesson.slug}`}
                    >
                      <Button className="gap-1.5 min-w-[120px]">
                        Next Lesson
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}>
                      <Button variant="outline" className="gap-1.5 min-w-[120px] bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Module Complete
                      </Button>
                    </Link>
                  )
                ) : isLastStep ? (
                  <Button
                    onClick={handleComplete}
                    disabled={completing || !lessonData.prerequisites_met}
                    className="gap-1.5 min-w-[100px]"
                  >
                    {completing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Complete
                  </Button>
                ) : (
                  <Button onClick={goNext} className="gap-1.5 min-w-[100px]">
                    <span className="hidden sm:inline">Next</span>
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
