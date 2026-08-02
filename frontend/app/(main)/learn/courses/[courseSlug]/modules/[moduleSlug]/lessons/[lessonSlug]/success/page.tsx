"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Trophy,
  ArrowRight,
  BookOpen,
  FileText,
  Puzzle,
  Star,
  AlertTriangle,
  ScrollText,
  BrainCircuit,
  FlaskConical,
  Target,
  FileCode,
  Sparkles,
  Clock,
  Zap,
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
      particleCount: 60,
      angle: 60,
      spread: 90,
      origin: { x: 0, y: 0.6 },
      colors: ["#D4AF37", "#22C55E", "#FFFFFF"],
      startVelocity: 45,
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 90,
      origin: { x: 1, y: 0.6 },
      colors: ["#D4AF37", "#22C55E", "#FFFFFF"],
      startVelocity: 45,
    });
  } catch (e) {
    console.error("Confetti failed", e);
  }
}

export default function LessonSuccessPage() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const moduleSlug = params.moduleSlug as string;
  const lessonSlug = params.lessonSlug as string;

  const cached =
    typeof window !== "undefined"
      ? sessionStorage.getItem(`koder_lesson_completed_${lessonSlug}`)
      : null;
  const cachedData: LessonCompleteCache | null = cached
    ? JSON.parse(cached)
    : null;

  const [lessonData, setLessonData] = useState<LessonWithSections | null>(null);
  const [moduleData, setModuleData] = useState<ModuleWithLessons | null>(null);
  const [loading, setLoading] = useState(!cachedData);

  const title = lessonData?.title || cachedData?.title || lessonSlug;
  const xpReward = lessonData?.xp_reward || cachedData?.xpReward || 0;
  const sectionsCount =
    lessonData?.sections?.length || cachedData?.sectionsCount || 0;
  const quizCount =
    lessonData?.sections?.filter((s) => s.section_type === "quiz").length ||
    cachedData?.quizCount ||
    0;
  const exerciseCount =
    lessonData?.sections?.filter((s) => s.section_type === "exercises").length ||
    cachedData?.exerciseCount ||
    0;
  const moduleTitle =
    moduleData?.module?.title || cachedData?.moduleTitle || moduleSlug;
  const moduleProgress = (() => {
    if (moduleData?.lessons && moduleData.lessons.length > 0) {
      const total = moduleData.lessons.length;
      const completed = moduleData.lessons.filter(
        (l) => l.completed || l.slug === lessonSlug
      ).length;
      return (completed / total) * 100;
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
      return {
        slug: cachedData.nextLessonSlug,
        title: cachedData.nextLessonTitle ?? "Next Lesson",
      };
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
        <div className="w-8 h-8 rounded-full border-2 border-brand-muted-gold border-t-transparent animate-spin"></div>
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
        <div className="flex items-center justify-center gap-2 text-brand-offwhite-muted mb-8">
          <span>{title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-charcoal-border"></span>
          <span className="flex items-center gap-1 text-brand-muted-gold">
            <Trophy size={14} /> +{xpReward} XP
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6">
          <Link
            href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-charcoal-card border border-brand-charcoal-border hover:bg-brand-charcoal-hover transition-colors font-bold text-sm"
          >
            <BookOpen size={18} />
            Back to Module
          </Link>
          {nextLesson ? (
            <Link
              href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${nextLesson.slug}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base transition-colors font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Next: {nextLesson.title}
              <ArrowRight size={18} />
            </Link>
          ) : (
            <Link
              href={`/learn/courses/${courseSlug}/modules/${moduleSlug}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base transition-colors font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Module Complete!
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: What You Covered */}
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            What You Covered
          </h2>

          {sections.length === 0 ? (
            <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-8 text-center text-brand-offwhite-muted">
              <BookOpen className="mx-auto mb-3 opacity-20" size={32} />
              <p>{sectionsCount} sections completed</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sections.map((sec, i) => {
                const Icon = SECTION_TYPE_ICONS[sec.section_type] || FileText;
                const label =
                  SECTION_TYPE_LABELS[sec.section_type] || sec.section_type;
                return (
                  <div
                    key={sec.id || i}
                    className="flex items-center gap-3 bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl p-3.5 hover:border-brand-success/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-success/10 border border-brand-success/20 text-brand-success flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-brand-offwhite truncate">
                        {sec.title || label}
                      </p>
                      <p className="text-xs text-brand-offwhite-muted font-medium">
                        {label}
                      </p>
                    </div>
                    <CheckCircle2
                      size={16}
                      className="text-brand-success shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6">
            <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl p-3.5 text-center">
              <BookOpen className="mx-auto h-4 w-4 text-brand-muted-gold mb-1" />
              <p className="text-lg font-extrabold text-brand-offwhite">
                {sectionsCount}
              </p>
              <p className="text-[10px] text-brand-offwhite-muted font-semibold">
                Sections
              </p>
            </div>
            {quizCount > 0 && (
              <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl p-3.5 text-center">
                <BrainCircuit className="mx-auto h-4 w-4 text-orange-400 mb-1" />
                <p className="text-lg font-extrabold text-brand-offwhite">
                  {quizCount}
                </p>
                <p className="text-[10px] text-brand-offwhite-muted font-semibold">
                  Quizzes
                </p>
              </div>
            )}
            {exerciseCount > 0 && (
              <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl p-3.5 text-center">
                <FlaskConical className="mx-auto h-4 w-4 text-teal-400 mb-1" />
                <p className="text-lg font-extrabold text-brand-offwhite">
                  {exerciseCount}
                </p>
                <p className="text-[10px] text-brand-offwhite-muted font-semibold">
                  Exercises
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Module Progress & Next Lesson */}
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            Module Progress
          </h2>

          <div className="space-y-4">
            <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-extrabold mb-2">
                  <span className="truncate text-brand-offwhite">{moduleTitle}</span>
                  <span className="text-brand-muted-gold">
                    {Math.round(moduleProgress)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-brand-charcoal-hover rounded-full overflow-hidden border border-brand-charcoal-border/40">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-success to-green-400 transition-all duration-700 ease-out"
                    style={{ width: `${Math.round(moduleProgress)}%` }}
                  />
                </div>
              </div>

              {nextLesson ? (
                <div className="pt-3 border-t border-brand-charcoal-border/40">
                  <span className="text-[10px] font-bold text-brand-offwhite-muted uppercase tracking-wider block mb-2">
                    Up Next
                  </span>
                  <Link
                    href={`/learn/courses/${courseSlug}/modules/${moduleSlug}/lessons/${nextLesson.slug}`}
                    className="flex items-center gap-3 bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl p-3.5 hover:border-brand-muted-gold/40 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-muted-gold/10 border border-brand-muted-gold/20 text-brand-muted-gold flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <BookOpen size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-brand-offwhite truncate group-hover:text-brand-muted-gold transition-colors">
                        {nextLesson.title}
                      </h4>
                      <p className="text-[11px] text-brand-offwhite-muted flex items-center gap-2 mt-0.5 font-medium">
                        {nextLesson.estimated_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {nextLesson.estimated_minutes}m
                          </span>
                        )}
                        {nextLesson.xp_reward && (
                          <span className="flex items-center gap-1 text-brand-muted-gold font-bold">
                            <Zap size={11} /> +{nextLesson.xp_reward} XP
                          </span>
                        )}
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-brand-offwhite-muted group-hover:text-brand-muted-gold transition-colors shrink-0"
                    />
                  </Link>
                </div>
              ) : (
                <div className="pt-2 border-t border-brand-charcoal-border/40 text-center py-4">
                  <Trophy className="mx-auto mb-2 text-brand-muted-gold" size={24} />
                  <h4 className="font-bold text-sm text-brand-offwhite">
                    Module Complete!
                  </h4>
                  <p className="text-[11px] text-brand-offwhite-muted mt-0.5">
                    You&apos;ve completed all lessons in this module.
                  </p>
                </div>
              )}
            </div>

            {/* XP Reward Summary Box */}
            <div className="bg-brand-charcoal-card border border-brand-muted-gold/20 bg-gradient-to-r from-brand-muted-gold/10 via-brand-charcoal-card to-brand-charcoal-card rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-muted-gold/20 text-brand-muted-gold flex items-center justify-center">
                  <Zap size={18} className="fill-current" />
                </div>
                <div>
                  <p className="font-bold text-sm text-brand-offwhite">XP Awarded</p>
                  <p className="text-[11px] text-brand-offwhite-muted">
                    Added to your global profile
                  </p>
                </div>
              </div>
              <span className="text-xl font-extrabold text-brand-muted-gold">
                +{xpReward} XP
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
