"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchLesson, fetchModule, completeLesson } from "@/lib/api";
import {
  LessonWithSections,
  ModuleWithLessons,
  LessonSection,
} from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  Loader2,
  BookOpen,
  ChevronLeft,
  Sparkles,
  GraduationCap,
  Lock,
  AlertTriangle,
  PanelLeftOpen,
  PanelLeftClose,
  FileText,
  Puzzle,
  Star,
  ScrollText,
  BrainCircuit,
  FlaskConical,
  Target,
  FileCode,
} from "lucide-react";
import SectionRenderer from "@/components/learn/SectionRenderer";
import SectionQuiz from "@/components/learn/SectionQuiz";
import LessonSidebar from "@/components/learn/LessonSidebar";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/lib/event";
import confetti from "canvas-confetti";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Step {
  type: "section" | "quiz-review";
  label: string;
  icon?: React.ReactNode;
  sections?: LessonSection[];
  section?: LessonSection;
}

const stepLabels: Record<string, string> = {
  overview: "Overview",
  explanation: "Explanation",
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

const stepIcons: Record<string, React.ReactNode> = {
  overview: <BookOpen className="h-3.5 w-3.5" />,
  explanation: <FileText className="h-3.5 w-3.5" />,
  examples: <Puzzle className="h-3.5 w-3.5" />,
  best_practices: <Star className="h-3.5 w-3.5" />,
  common_mistakes: <AlertTriangle className="h-3.5 w-3.5" />,
  summary: <ScrollText className="h-3.5 w-3.5" />,
  quiz: <BrainCircuit className="h-3.5 w-3.5" />,
  exercises: <FlaskConical className="h-3.5 w-3.5" />,
  mini_project: <Target className="h-3.5 w-3.5" />,
  assessment: <FileCode className="h-3.5 w-3.5" />,
  ai_review: <Sparkles className="h-3.5 w-3.5" />,
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
  const [currentStep, setCurrentStep] = useState(0);

  // Sidebar Collapsed State
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("koder_lesson_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("koder_lesson_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

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
    sessionStorage.setItem(
      "koder_lesson_context",
      JSON.stringify({
        courseSlug,
        moduleSlug,
        lessonSlug,
      })
    );
  }, [courseSlug, moduleSlug, lessonSlug]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchLesson(courseSlug, moduleSlug, lessonSlug),
      fetchModule(courseSlug, moduleSlug),
    ]).then(([lessonRes, moduleRes]) => {
      if (!active) return;
      if (lessonRes.success && lessonRes.data) {
        setLessonData(lessonRes.data);
        setCompleted(lessonRes.data.progress?.completed ?? false);
      }
      if (moduleRes.success && moduleRes.data) {
        setModuleData(moduleRes.data);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [courseSlug, moduleSlug, lessonSlug]);

  // Group steps from sections; quiz sections grouped into one interactive review step
  const steps = useMemo<Step[]>(() => {
    if (!lessonData?.sections) return [];

    const quizSections: LessonSection[] = [];
    const result: Step[] = [];

    for (const section of lessonData.sections) {
      if (section.section_type === "quiz") {
        quizSections.push(section);
      } else {
        const label = stepLabels[section.section_type] || section.section_type;
        const icon = stepIcons[section.section_type] || <FileText className="h-3.5 w-3.5" />;
        result.push({ type: "section", label, icon, section });
      }
    }

    if (quizSections.length > 0) {
      result.push({
        type: "quiz-review",
        label: "Knowledge Quiz",
        icon: <BrainCircuit className="h-3.5 w-3.5" />,
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

  // Global Keyboard Navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest(".monaco-editor"))
      ) {
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
    confetti({
      ...defaults,
      particleCount: 30,
      origin: { x: 0.3, y: 0.5 },
      colors: ["#ffd700", "#ff6b6b"],
    });
    confetti({
      ...defaults,
      particleCount: 30,
      origin: { x: 0.7, y: 0.5 },
      colors: ["#4ecdc4", "#45b7d1"],
    });
  }, []);

  const handleComplete = async () => {
    if (!lessonData || completed) return;
    setCompleting(true);
    const res = await completeLesson(lessonData.id);

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
      const done =
        (moduleData?.lessons?.filter(
          (l) => l.completed || l.id === lessonData.id
        ).length || 0) + 1;
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
        })
      );

      router.push(
        `/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${lessonSlug}/success`
      );
    } else {
      toast.error(res.error?.message || "Failed to complete lesson");
    }
    setCompleting(false);
  };

  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useEffect(() => {
    const interval = setInterval(() => loadRef.current(), 5000);
    return () => clearInterval(interval);
  }, []);

  const wsLessonIdRef = useRef(lessonData?.id);
  useEffect(() => {
    wsLessonIdRef.current = lessonData?.id;
  }, [lessonData?.id]);

  useWebSocket(
    {
      "lesson.completed": (data: any) => {
        if (data?.lesson_id && data.lesson_id === wsLessonIdRef.current) {
          loadRef.current();
        }
      },
    },
    []
  );

  const allLessons = useMemo(() => moduleData?.lessons || [], [moduleData?.lessons]);
  const currentIndex = allLessons.findIndex((l) => l.slug === lessonSlug);
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const isLastStep = currentStep === totalSteps - 1;

  const isSessionUnlocked = useMemo(() => {
    if (!lessonData) return false;
    try {
      const list: string[] = JSON.parse(
        sessionStorage.getItem("koder_completed_lessons") || "[]"
      );
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

  if (loading) {
    return (
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 h-[calc(100vh-3.5rem)] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground animate-pulse">
            Loading Lesson Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6 bg-background">
        <div className="max-w-md text-center p-8 rounded-2xl bg-card border border-border">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-bold mb-1">Lesson Not Found</h3>
          <p className="text-xs text-muted-foreground mb-5">
            The requested lesson could not be found or loaded.
          </p>
          <Link href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}>
            <Button size="sm" className="rounded-xl font-bold text-xs">
              Back to Module
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!lessonData.prerequisites_met && !isSessionUnlocked) {
    return (
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 h-[calc(100vh-3.5rem)] flex bg-background">
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
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center bg-card border border-border p-7 rounded-2xl shadow-lg"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Lock className="h-7 w-7 text-amber-500" />
            </div>
            <h2 className="text-lg font-bold mb-1.5 text-foreground">
              Complete Prerequisites First
            </h2>
            <p className="text-xs text-muted-foreground mb-5">
              Please finish the required prerequisite lessons to unlock this lesson.
            </p>
            <Link href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs font-semibold">
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
    <TooltipProvider delayDuration={150}>
      {/* Edge-to-Edge Full Bleed Workspace Layout (Fixes 4-Corner Margins) */}
      <div key={lessonSlug} className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 h-[calc(100vh-3.5rem)] flex bg-transparent overflow-hidden relative z-10">
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
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-transparent">
          {/* Glassmorphic Top Toolbar */}
          <header className="shrink-0 border-b border-border/60 bg-card/60 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-4 z-10">
            <div className="flex items-center gap-3 min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleSidebar}
                    className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 flex items-center justify-center transition-colors shrink-0"
                    aria-label="Toggle Sidebar"
                  >
                    {sidebarCollapsed ? (
                      <PanelLeftOpen className="h-4 w-4" />
                    ) : (
                      <PanelLeftClose className="h-4 w-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="font-semibold text-xs">
                  {sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                </TooltipContent>
              </Tooltip>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <Link
                    href={`/learn/courses/${courseSlug}`}
                    className="hover:text-foreground transition-colors truncate max-w-[120px]"
                  >
                    {courseSlug.replace(/-/g, " ")}
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
                    className="hover:text-foreground transition-colors truncate max-w-[160px]"
                  >
                    {moduleData?.module?.title || moduleSlug}
                  </Link>
                </div>
                <h1 className="text-sm md:text-base font-extrabold text-foreground truncate mt-0.5">
                  {lessonData.title}
                </h1>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Badge
                variant="outline"
                className="text-xs font-extrabold gap-1 bg-amber-500/10 text-amber-400 border-amber-500/30 px-2.5 py-1"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                +{lessonData.xp_reward} XP
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold bg-muted/40 px-2.5 py-1 rounded-md border border-border/40">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {lessonData.estimated_minutes}m
              </span>
              {completed && (
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs gap-1 font-extrabold px-2.5 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </Badge>
              )}
            </div>
          </header>

          {/* Stepper Header Bar */}
          {totalSteps > 0 && (
            <div className="shrink-0 border-b border-border/40 bg-card/30 backdrop-blur-sm px-4 py-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
                {steps.map((step, idx) => {
                  const isActive = idx === currentStep;
                  const isPast = idx < currentStep;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0 border",
                        isActive
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-xs"
                          : isPast
                          ? "bg-emerald-500/5 border-emerald-500/20 text-muted-foreground hover:text-foreground"
                          : "bg-transparent border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {step.icon}
                      <span>{step.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-bold text-muted-foreground tabular-nums shrink-0 bg-muted/60 px-2.5 py-1 rounded-md border border-border/50">
                {currentStep + 1} / {totalSteps}
              </span>
            </div>
          )}

          {/* Scrollable Content Viewport */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 pb-6">
            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                {currentStepData?.type === "quiz-review" && currentStepData.sections ? (
                  <motion.div
                    key="quiz-review"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SectionQuiz quizSections={currentStepData.sections} />
                  </motion.div>
                ) : currentStepData?.section ? (
                  <motion.div
                    key={currentStepData.section.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SectionRenderer
                      section={currentStepData.section}
                      problemReferences={lessonData.problem_references}
                      language={lessonLanguage}
                    />
                  </motion.div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground text-xs">
                    No section content available.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Fixed Floating Control Dock */}
          <footer className="shrink-0 border-t border-border/60 bg-card/80 backdrop-blur-md px-4 py-3 z-20 flex items-center justify-between gap-4 shadow-lg">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentStep === 0}
              size="sm"
              className="gap-2 rounded-xl font-semibold border-border text-xs px-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {currentStepData?.label || ""}
              </span>
              <span className="text-[10px] text-muted-foreground/60 font-mono">
                (Press ← / →)
              </span>
            </div>

            {completed ? (
              nextLesson ? (
                <Link
                  href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${nextLesson.slug}`}
                >
                  <Button size="sm" className="gap-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md text-xs px-5">
                    Next Lesson
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl font-bold bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs px-5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Module Overview
                  </Button>
                </Link>
              )
            ) : isLastStep ? (
              <Button
                onClick={handleComplete}
                disabled={completing}
                size="sm"
                className="gap-2 rounded-xl font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 text-xs px-6"
              >
                {completing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Complete Lesson
              </Button>
            ) : (
              <Button
                onClick={goNext}
                size="sm"
                className="gap-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md text-xs px-5"
              >
                Next Section
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}
