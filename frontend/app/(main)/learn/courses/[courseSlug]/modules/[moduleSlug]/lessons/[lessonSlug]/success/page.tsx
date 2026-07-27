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
import { cn } from "@/lib/utils";
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
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#10b981", "#f59e0b", "#3b82f6"]
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#10b981", "#f59e0b", "#3b82f6"]
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
    }, 150);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero Celebration Banner */}
      <div className="relative max-w-screen-xl mx-auto px-4 md:px-6 pt-8">
        <div className="relative rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card/90 to-card/60 p-8 md:p-10 shadow-2xl overflow-hidden text-center">
          {/* Top ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">
              Lesson Completed!
            </h1>

            <p className="text-base text-muted-foreground font-medium mb-4">
              &quot;{title}&quot;
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-sm mb-6 shadow-sm">
              <Trophy className="w-4 h-4 fill-current" />
              +{xpReward} XP Earned!
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
              <Link
                href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-accent text-xs font-bold text-foreground transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Back to Module
              </Link>

              {nextLesson ? (
                <Link
                  href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${nextLesson.slug}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all"
                >
                  Next: {nextLesson.title}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Module Complete!
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: What You Covered */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="text-amber-400" size={20} />
            What You Covered
          </h2>

          {sections.length === 0 ? (
            <div className="bg-card border border-border/60 rounded-2xl p-6 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-2 opacity-30" size={28} />
              <p className="text-xs font-medium">{sectionsCount} sections completed</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sections.map((sec, i) => {
                const Icon = SECTION_TYPE_ICONS[sec.section_type] || FileText;
                const label = SECTION_TYPE_LABELS[sec.section_type] || sec.section_type;
                return (
                  <div
                    key={sec.id || i}
                    className="flex items-center gap-3 bg-card border border-border/60 rounded-xl p-3.5 hover:border-amber-500/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{sec.title || label}</p>
                      <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    </div>
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
              <BookOpen className="mx-auto h-4 w-4 text-amber-400 mb-1" />
              <p className="text-xl font-extrabold text-foreground">{sectionsCount}</p>
              <p className="text-[11px] text-muted-foreground font-medium">Sections</p>
            </div>
            {quizCount > 0 && (
              <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
                <BrainCircuit className="mx-auto h-4 w-4 text-orange-400 mb-1" />
                <p className="text-xl font-extrabold text-foreground">{quizCount}</p>
                <p className="text-[11px] text-muted-foreground font-medium">Quizzes</p>
              </div>
            )}
            {exerciseCount > 0 && (
              <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
                <FlaskConical className="mx-auto h-4 w-4 text-teal-400 mb-1" />
                <p className="text-xl font-extrabold text-foreground">{exerciseCount}</p>
                <p className="text-[11px] text-muted-foreground font-medium">Exercises</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Module Progress & Next Lesson */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Layers className="text-amber-400" size={20} />
            Module Progress
          </h2>

          <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-6 shadow-sm">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="truncate text-foreground">{moduleTitle}</span>
                <span className="text-amber-400">{Math.round(moduleProgress)}%</span>
              </div>
              <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden border border-border/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700 ease-out"
                  style={{ width: `${Math.round(moduleProgress)}%` }}
                />
              </div>
            </div>

            {/* Next Lesson Box */}
            {nextLesson ? (
              <div className="pt-2 border-t border-border/40">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Up Next
                </span>
                <Link
                  href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${nextLesson.slug}`}
                  className="flex items-center gap-3 bg-background border border-border/60 rounded-xl p-4 hover:border-amber-500/40 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-foreground truncate group-hover:text-amber-400 transition-colors">
                      {nextLesson.title}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 font-medium">
                      {nextLesson.estimated_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {nextLesson.estimated_minutes}m
                        </span>
                      )}
                      {nextLesson.xp_reward && (
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Zap size={11} /> +{nextLesson.xp_reward} XP
                        </span>
                      )}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground group-hover:text-amber-400 transition-colors shrink-0" />
                </Link>
              </div>
            ) : (
              <div className="pt-2 border-t border-border/40 text-center py-4">
                <Trophy className="mx-auto mb-2 text-amber-400" size={28} />
                <h4 className="font-bold text-sm text-foreground">Module Complete!</h4>
                <p className="text-xs text-muted-foreground mt-0.5">You&apos;ve mastered all lessons in this module.</p>
              </div>
            )}
          </div>

          {/* XP Reward Summary Box */}
          <div className="bg-card border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-card to-card rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Zap size={20} className="fill-current" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">XP Awarded</p>
                <p className="text-xs text-muted-foreground">Added to your global profile</p>
              </div>
            </div>
            <span className="text-2xl font-extrabold text-amber-400">+{xpReward} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
