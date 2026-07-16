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
    confetti({
      particleCount: 60, angle: 60, spread: 90,
      origin: { x: 0, y: 0.6 },
      colors: ["#D4AF37", "#22C55E", "#FFFFFF"],
      startVelocity: 45,
    });
    confetti({
      particleCount: 60, angle: 120, spread: 90,
      origin: { x: 1, y: 0.6 },
      colors: ["#D4AF37", "#22C55E", "#FFFFFF"],
      startVelocity: 45,
    });
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
  const nextLesson = (() => {
    if (moduleData?.lessons) {
      const idx = moduleData.lessons.findIndex((l) => l.slug === lessonSlug);
      if (idx >= 0 && idx < moduleData.lessons.length - 1) {
        return moduleData.lessons[idx + 1];
      }
    }
    if (cachedData?.nextLessonSlug) {
      return { slug: cachedData.nextLessonSlug, title: cachedData.nextLessonTitle };
    }
    return null;
  })();

  const sections = lessonData?.sections || [];

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
      const interval = setInterval(burstConfetti, 150);
      setTimeout(() => clearInterval(interval), 3500);
    }, 200);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-charcoal-base flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-muted-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-charcoal-base text-brand-offwhite pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-brand-success/10 to-transparent border-b border-brand-charcoal-border pt-20 pb-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-success/20 text-brand-success mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          Lesson Completed!
        </h1>
        <div className="flex items-center justify-center gap-2 text-brand-offwhite-muted mb-6">
          <span className="max-w-[300px] truncate">{title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-charcoal-border" />
          <span className="flex items-center gap-1 text-brand-muted-gold">
            <Trophy size={14} /> +{xpReward} XP
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6">
          <Link
            href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-charcoal-card border border-brand-charcoal-border hover:bg-brand-charcoal-hover transition-colors font-bold text-sm"
          >
            <LayoutDashboard size={18} />
            Back to Module
          </Link>
          {nextLesson ? (
            <Link
              href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${nextLesson.slug}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base transition-colors font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Continue to {(nextLesson as any).title || "Next Lesson"}
              <ArrowRight size={18} />
            </Link>
          ) : (
            <Link
              href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base transition-colors font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.2)]"
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
            <BookOpen className="text-brand-muted-gold" size={22} />
            What You Covered
          </h2>

          {sections.length === 0 ? (
            <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-8 text-center text-brand-offwhite-muted">
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
                    className="flex items-center gap-3 bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl p-3.5 hover:border-brand-charcoal-border/80 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-brand-success/10 text-brand-success flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{sec.title || label}</p>
                      <p className="text-xs text-brand-offwhite-muted">{label}</p>
                    </div>
                    <CheckCircle2 size={16} className="text-brand-success shrink-0" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl p-4 text-center">
              <BookOpen className="mx-auto h-5 w-5 text-brand-muted-gold mb-1.5" />
              <p className="text-2xl font-bold tabular-nums">{sectionsCount}</p>
              <p className="text-xs text-brand-offwhite-muted">Section{sectionsCount !== 1 ? "s" : ""}</p>
            </div>
            {quizCount > 0 && (
              <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl p-4 text-center">
                <BrainCircuit className="mx-auto h-5 w-5 text-orange-400 mb-1.5" />
                <p className="text-2xl font-bold tabular-nums">{quizCount}</p>
                <p className="text-xs text-brand-offwhite-muted">Quiz{quizCount !== 1 ? "zes" : ""}</p>
              </div>
            )}
            {exerciseCount > 0 && (
              <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl p-4 text-center">
                <FlaskConical className="mx-auto h-5 w-5 text-teal-400 mb-1.5" />
                <p className="text-2xl font-bold tabular-nums">{exerciseCount}</p>
                <p className="text-xs text-brand-offwhite-muted">Exercise{exerciseCount !== 1 ? "s" : ""}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Module Progress */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layers className="text-brand-muted-gold" size={22} />
              Module Progress
            </h2>
          </div>

          <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-6">
            <div className="mb-5">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-semibold truncate">{moduleTitle}</span>
                <span className="font-bold tabular-nums text-brand-muted-gold">
                  {Math.round(moduleProgress)}%
                </span>
              </div>
              <div className="h-2.5 bg-brand-charcoal-base rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-success to-green-400 transition-all duration-1000 ease-out shadow-[0_0_6px_rgba(34,197,94,0.3)]"
                  style={{ width: `${Math.round(moduleProgress)}%` }}
                />
              </div>
            </div>

            {/* Next lesson preview */}
            {nextLesson ? (
              <div>
                <p className="text-xs text-brand-offwhite-muted font-medium mb-3 flex items-center gap-1.5">
                  <ArrowRight size={12} />
                  Next lesson
                </p>
                <Link
                  href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${nextLesson.slug}`}
                  className="flex items-center gap-3 bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl p-4 hover:bg-brand-charcoal-hover transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-muted-gold/10 flex items-center justify-center shrink-0 group-hover:bg-brand-muted-gold/20 transition-colors">
                    <BookOpen size={18} className="text-brand-muted-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate group-hover:text-brand-muted-gold transition-colors">
                      {(nextLesson as any).title || "Next Lesson"}
                    </p>
                    <p className="text-xs text-brand-offwhite-muted flex items-center gap-2 mt-0.5">
                      {(nextLesson as any).estimated_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {(nextLesson as any).estimated_minutes}min
                        </span>
                      )}
                      {(nextLesson as any).xp_reward && (
                        <span className="flex items-center gap-1 text-brand-muted-gold">
                          <Zap size={11} /> +{(nextLesson as any).xp_reward} XP
                        </span>
                      )}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-brand-offwhite-muted group-hover:text-brand-muted-gold transition-colors shrink-0" />
                </Link>
              </div>
            ) : (
              <div className="bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl p-5 text-center">
                <Trophy className="mx-auto mb-2 text-brand-muted-gold" size={28} />
                <p className="font-semibold text-sm">All lessons complete!</p>
                <p className="text-xs text-brand-offwhite-muted mt-1">You finished this module.</p>
              </div>
            )}
          </div>

          {/* XP summary */}
          <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-5 mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-muted-gold/10 flex items-center justify-center">
                <Zap size={20} className="text-brand-muted-gold" />
              </div>
              <div>
                <p className="font-bold text-sm">XP Earned</p>
                <p className="text-xs text-brand-offwhite-muted">This lesson</p>
              </div>
            </div>
            <span className="text-xl font-bold text-brand-muted-gold">+{xpReward}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
