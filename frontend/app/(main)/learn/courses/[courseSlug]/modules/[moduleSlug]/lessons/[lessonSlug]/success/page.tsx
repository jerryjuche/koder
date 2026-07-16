"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  CheckCircle2, Trophy, ArrowRight, LayoutDashboard,
  BookOpen, FileText, Puzzle, Star, AlertTriangle,
  ScrollText, BrainCircuit, FlaskConical, Target, FileCode,
  Sparkles, Clock, Layers, Zap,
} from "lucide-react";
import { fetchLesson, fetchModule } from "@/lib/api";
import type { LessonWithSections, ModuleWithLessons } from "@/lib/types";

interface LessonCompleteCache {
  xpReward: number;
  title: string;
  sectionsCount: number;
  quizCount: number;
  exerciseCount: number;
  moduleProgress: number;
  moduleTitle: string;
  nextLessonSlug: string | null;
  nextLessonTitle: string | null;
}

const SECTION_TYPE_ICONS: Record<string, typeof BookOpen> = {
  overview: BookOpen,
  explanation: FileText,
  examples: Puzzle,
  best_practices: Star,
  common_mistakes: AlertTriangle,
  summary: ScrollText,
  quiz: BrainCircuit,
  exercises: FlaskConical,
  mini_project: Target,
  assessment: FileCode,
  ai_review: Sparkles,
};

const SECTION_TYPE_LABELS: Record<string, string> = {
  overview: "Overview",
  explanation: "Explanation",
  examples: "Examples",
  best_practices: "Best Practices",
  common_mistakes: "Common Mistakes",
  summary: "Summary",
  quiz: "Quiz",
  exercises: "Exercises",
  mini_project: "Mini Project",
  assessment: "Assessment",
  ai_review: "AI Review",
};

function burstConfetti() {
  try {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#22c55e", "#3b82f6", "#eab308"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#22c55e", "#3b82f6", "#eab308"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  } catch {}
}

export default function LessonSuccessPage() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const moduleSlug = params.moduleSlug as string;
  const lessonSlug = params.lessonSlug as string;

  const cached = typeof window !== "undefined"
    ? sessionStorage.getItem(`koder_lesson_completed_${lessonSlug}`)
    : null;
  const cachedData: LessonCompleteCache | null = cached ? JSON.parse(cached) : null;

  const [lessonData, setLessonData] = useState<LessonWithSections | null>(null);
  const [moduleData, setModuleData] = useState<ModuleWithLessons | null>(null);
  const [loading, setLoading] = useState(!cachedData);

  const title = lessonData?.title || cachedData?.title || lessonSlug;
  const xpReward = lessonData?.xp_reward || cachedData?.xpReward || 0;
  const sectionsCount = lessonData?.sections?.length || cachedData?.sectionsCount || 0;
  const quizCount = lessonData?.sections?.filter((s) => s.section_type === "quiz").length || cachedData?.quizCount || 0;
  const exerciseCount = lessonData?.sections?.filter((s) => s.section_type === "exercises").length || cachedData?.exerciseCount || 0;
  const moduleTitle = moduleData?.module?.title || cachedData?.moduleTitle || moduleSlug;
  const moduleProgress = (() => {
    if (moduleData?.lessons) {
      const total = moduleData.lessons.length;
      const completed = moduleData.lessons.filter((l) => l.completed).length;
      return total > 0 ? (completed / total) * 100 : 0;
    }
    return cachedData?.moduleProgress ?? 0;
  })();
  interface NextLessonInfo {
    slug: string;
    title: string;
    estimated_minutes?: number;
    xp_reward?: number;
  }

  const nextLesson: NextLessonInfo | null = (() => {
    if (moduleData?.lessons) {
      const idx = moduleData.lessons.findIndex((l) => l.slug === lessonSlug);
      if (idx >= 0 && idx < moduleData.lessons.length - 1) {
        return moduleData.lessons[idx + 1];
      }
    }
    if (cachedData?.nextLessonSlug) {
      return { slug: cachedData.nextLessonSlug, title: cachedData.nextLessonTitle ?? "Next Lesson" };
    }
    return null;
  })();

  const sections = lessonData?.sections || [];
  const statCount = 1 + (quizCount > 0 ? 1 : 0) + (exerciseCount > 0 ? 1 : 0);

  useEffect(() => {
    const load = async () => {
      try {
        const [lessonRes, moduleRes] = await Promise.all([
          fetchLesson(courseSlug, moduleSlug, lessonSlug),
          fetchModule(courseSlug, moduleSlug),
        ]);
        if (lessonRes.success && lessonRes.data) setLessonData(lessonRes.data);
        if (moduleRes.success && moduleRes.data) setModuleData(moduleRes.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, [courseSlug, moduleSlug, lessonSlug]);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      burstConfetti();
    }, 200);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-emerald-500/10 to-transparent border-b border-border pt-20 pb-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          Lesson Completed!
        </h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
          <span className="max-w-[300px] truncate">{title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-border" />
          <span className="flex items-center gap-1 text-primary font-medium">
            <Trophy size={14} /> +{xpReward} XP
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6">
          <Link
            href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors font-bold text-sm"
          >
            <LayoutDashboard size={18} />
            Back to Module
          </Link>
          {nextLesson ? (
            <Link
              href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${nextLesson.slug}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Continue to {nextLesson.title}
              <ArrowRight size={18} />
            </Link>
          ) : (
            <Link
              href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Module Complete! Back to Overview
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: What You Covered */}
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="text-primary" size={22} />
            What You Covered
          </h2>

          {sections.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-3 opacity-20" size={32} />
              <p>{sectionsCount} section{sectionsCount !== 1 ? "s" : ""} completed</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sections.map((sec, i) => {
                const Icon = SECTION_TYPE_ICONS[sec.section_type] || FileText;
                const label = SECTION_TYPE_LABELS[sec.section_type] || sec.section_type;
                return (
                  <div
                    key={sec.id || i}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:border-border/80 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{sec.title || label}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary stats */}
          <div className={`grid gap-3 mt-6 ${statCount === 1 ? "grid-cols-1" : statCount === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <BookOpen className="mx-auto h-5 w-5 text-primary mb-1.5" />
              <p className="text-2xl font-bold tabular-nums">{sectionsCount}</p>
              <p className="text-xs text-muted-foreground">Section{sectionsCount !== 1 ? "s" : ""}</p>
            </div>
            {quizCount > 0 && (
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <BrainCircuit className="mx-auto h-5 w-5 text-orange-400 mb-1.5" />
                <p className="text-2xl font-bold tabular-nums">{quizCount}</p>
                <p className="text-xs text-muted-foreground">Quiz{quizCount !== 1 ? "zes" : ""}</p>
              </div>
            )}
            {exerciseCount > 0 && (
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <FlaskConical className="mx-auto h-5 w-5 text-teal-400 mb-1.5" />
                <p className="text-2xl font-bold tabular-nums">{exerciseCount}</p>
                <p className="text-xs text-muted-foreground">Exercise{exerciseCount !== 1 ? "s" : ""}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Module Progress */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layers className="text-primary" size={22} />
              Module Progress
            </h2>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="mb-5">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-semibold truncate">{moduleTitle}</span>
                <span className="font-bold tabular-nums text-primary">
                  {Math.round(moduleProgress)}%
                </span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-1000 ease-out shadow-[0_0_6px_rgba(34,197,94,0.3)]"
                  style={{ width: `${Math.round(moduleProgress)}%` }}
                />
              </div>
            </div>

            {/* Next lesson preview */}
            {nextLesson ? (
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-3 flex items-center gap-1.5">
                  <ArrowRight size={12} />
                  Next lesson
                </p>
                <Link
                  href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${nextLesson.slug}`}
                  className="flex items-center gap-3 bg-background border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <BookOpen size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {nextLesson.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      {nextLesson.estimated_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {nextLesson.estimated_minutes}min
                        </span>
                      )}
                      {nextLesson.xp_reward && (
                        <span className="flex items-center gap-1 text-primary">
                          <Zap size={11} /> +{nextLesson.xp_reward} XP
                        </span>
                      )}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              </div>
            ) : (
              <div className="bg-background border border-border rounded-xl p-5 text-center">
                <Trophy className="mx-auto mb-2 text-primary" size={28} />
                <p className="font-semibold text-sm">All lessons complete!</p>
                <p className="text-xs text-muted-foreground mt-1">You finished this module.</p>
              </div>
            )}
          </div>

          {/* XP summary */}
          <div className="bg-card border border-border rounded-2xl p-5 mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm">XP Earned</p>
                <p className="text-xs text-muted-foreground">This lesson</p>
              </div>
            </div>
            <span className="text-xl font-bold text-primary">+{xpReward}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
