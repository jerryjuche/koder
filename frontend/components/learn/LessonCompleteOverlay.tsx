"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  CheckCircle2, Zap, ArrowRight, RotateCcw,
  BookOpen, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface LessonCompleteOverlayProps {
  show: boolean;
  xpReward: number;
  lessonTitle: string;
  sectionsCount: number;
  quizCount: number;
  exerciseCount: number;
  nextLessonHref?: string;
  nextLessonTitle?: string;
  moduleHref: string;
  moduleTitle: string;
  moduleProgress: number;
  onReview: () => void;
  onClose: () => void;
}

export default function LessonCompleteOverlay({
  show, xpReward, lessonTitle,
  sectionsCount, quizCount, exerciseCount,
  nextLessonHref, nextLessonTitle,
  moduleHref, moduleTitle, moduleProgress,
  onReview, onClose,
}: LessonCompleteOverlayProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!show) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (dismissRef.current) clearTimeout(dismissRef.current);
      return;
    }

    const fire = () => {
      confetti({
        particleCount: 60, spread: 360, ticks: 60, zIndex: 100,
        origin: { x: 0.5, y: 0.5 }, colors: ["#ffd700", "#fbbf24", "#f59e0b"],
      });
      confetti({
        particleCount: 40, spread: 80, ticks: 60, zIndex: 100,
        origin: { x: 0.2, y: 0.4 }, angle: 60,
        colors: ["#4ade80", "#22c55e"],
      });
      confetti({
        particleCount: 40, spread: 80, ticks: 60, zIndex: 100,
        origin: { x: 0.8, y: 0.4 }, angle: 120,
        colors: ["#60a5fa", "#3b82f6"],
      });
    };

    fire();
    intervalRef.current = setInterval(fire, 200);
    const timeout = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }, 3500);

    dismissRef.current = setTimeout(onClose, 6000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (dismissRef.current) clearTimeout(dismissRef.current);
      clearTimeout(timeout);
    };
  }, [show, onClose]);

  const statCount = 1 + (quizCount > 0 ? 1 : 0) + (exerciseCount > 0 ? 1 : 0);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className={cn(
              "relative w-full rounded-2xl border border-border/50",
              "bg-gradient-to-br from-card via-card to-card/95 shadow-2xl overflow-hidden",
              xpReward >= 100 ? "max-w-lg" : "max-w-md",
            )}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="h-1.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400" />

            <div className="p-6 md:p-8 text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-500/5 flex items-center justify-center shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/20">
                <CheckCircle2 className="h-8 w-8 text-amber-500" />
              </div>

              <h2 className="text-2xl font-bold tracking-tight mb-1">Lesson Completed!</h2>
              <p className="text-sm text-muted-foreground mb-5 line-clamp-1">{lessonTitle}</p>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/20 mb-6">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span className="text-xl font-bold text-amber-500">+{xpReward} XP</span>
                <Zap className="h-4 w-4 text-amber-500" />
              </div>

              <div className={cn("grid gap-3 mb-6", statCount === 1 ? "grid-cols-1" : statCount === 2 ? "grid-cols-2" : "grid-cols-3")}>
                <div className="rounded-xl bg-muted/50 p-3">
                  <BookOpen className="h-4 w-4 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold tabular-nums">{sectionsCount}</p>
                  <p className="text-[10px] text-muted-foreground">Section{sectionsCount !== 1 ? "s" : ""}</p>
                </div>
                {quizCount > 0 && (
                  <div className="rounded-xl bg-muted/50 p-3">
                    <Sparkles className="h-4 w-4 mx-auto text-amber-500 mb-1" />
                    <p className="text-lg font-bold tabular-nums">{quizCount}</p>
                    <p className="text-[10px] text-muted-foreground">Quiz{quizCount !== 1 ? "zes" : ""}</p>
                  </div>
                )}
                {exerciseCount > 0 && (
                  <div className="rounded-xl bg-muted/50 p-3">
                    <Zap className="h-4 w-4 mx-auto text-emerald-500 mb-1" />
                    <p className="text-lg font-bold tabular-nums">{exerciseCount}</p>
                    <p className="text-[10px] text-muted-foreground">Exercise{exerciseCount !== 1 ? "s" : ""}</p>
                  </div>
                )}
              </div>

              <div className="mb-6 text-left">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-medium truncate">{moduleTitle}</span>
                  <span className="font-bold tabular-nums">{Math.round(moduleProgress)}%</span>
                </div>
                <div className="h-2 bg-muted/80 rounded-full overflow-hidden ring-1 ring-white/[0.03]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000 ease-out"
                    style={{ width: `${Math.round(moduleProgress)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {nextLessonHref ? (
                  <Link href={nextLessonHref}>
                    <Button className="w-full gap-1.5 h-10 text-sm">
                      Next Lesson {nextLessonTitle && <span className="text-muted-foreground truncate ml-auto max-w-[120px]">— {nextLessonTitle}</span>}
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={moduleHref}>
                    <Button className="w-full gap-1.5 h-10 text-sm" variant="secondary">
                      Module Complete — Back to Overview
                    </Button>
                  </Link>
                )}
                <div className="flex gap-2.5">
                  <Button variant="outline" onClick={onReview} className="flex-1 gap-1.5 h-9 text-xs">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Review Lesson
                  </Button>
                  {nextLessonHref && (
                    <Link href={moduleHref} className="flex-1">
                      <Button variant="ghost" className="w-full gap-1.5 h-9 text-xs text-muted-foreground">
                        Module Overview
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground/40 mt-4">
                This overlay will auto-dismiss
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
