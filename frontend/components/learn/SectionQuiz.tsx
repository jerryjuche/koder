"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { QuizMetadata, LessonSection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Trophy,
  BrainCircuit,
  Check,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionQuizProps {
  metadata?: Record<string, unknown>;
  quizSections?: LessonSection[];
  onQuizComplete?: (results: { correct: number; total: number }) => void;
}

export default function SectionQuiz({
  metadata,
  quizSections,
  onQuizComplete,
}: SectionQuizProps) {
  // Normalize quizzes list
  const quizList: QuizMetadata[] = (quizSections && quizSections.length > 0)
    ? quizSections.map((s) => s.metadata as unknown as QuizMetadata).filter(Boolean)
    : metadata
    ? [metadata as unknown as QuizMetadata]
    : [];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const totalQuestions = quizList.length;
  const currentQuiz = quizList[currentIdx];

  const handleSelect = (idx: number) => {
    if (!submitted && !isQuizFinished) {
      setSelected(idx);
    }
  };

  const handleNextQuestion = useCallback(() => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setIsQuizFinished(true);
      if (onQuizComplete) {
        onQuizComplete({ correct: correctCount, total: totalQuestions });
      }
    }
  }, [currentIdx, totalQuestions, correctCount, onQuizComplete]);

  const handleSubmit = useCallback(() => {
    if (selected === null || submitted || !currentQuiz) return;
    const isCorrect = selected === currentQuiz.correct_index;
    setSubmitted(true);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setMissCount((m) => m + 1);
    }
  }, [selected, submitted, currentQuiz]);

  const handleResetQuiz = () => {
    setCurrentIdx(0);
    setSelected(null);
    setSubmitted(false);
    setCorrectCount(0);
    setMissCount(0);
    setIsQuizFinished(false);
  };

  // Keyboard navigation for options (1-4 / A-D) & Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

      if (isQuizFinished) return;

      if (!submitted) {
        if (e.key === "1" || e.key === "a" || e.key === "A") handleSelect(0);
        else if (e.key === "2" || e.key === "b" || e.key === "B") handleSelect(1);
        else if (e.key === "3" || e.key === "c" || e.key === "C") handleSelect(2);
        else if (e.key === "4" || e.key === "d" || e.key === "D") handleSelect(3);
        else if (e.key === "Enter" && selected !== null) handleSubmit();
      } else {
        if (e.key === "Enter") handleNextQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [submitted, selected, isQuizFinished, handleSubmit, handleNextQuestion]);

  if (totalQuestions === 0 || !currentQuiz || !currentQuiz.question || !currentQuiz.options) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border text-center max-w-xl mx-auto">
        <HelpCircle className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1.5" />
        <p className="text-xs text-muted-foreground font-medium">
          Quiz content unavailable
        </p>
      </div>
    );
  }

  const isCorrect = selected === currentQuiz.correct_index;
  const accuracyPct = Math.round((correctCount / Math.max(1, correctCount + missCount)) * 100);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Quiz Container */}
      <div className="relative rounded-2xl bg-card/90 border border-border/70 p-4 md:p-5 backdrop-blur-md shadow-md overflow-hidden">
        {/* Top Glow Background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

        {/* Finished State Summary View */}
        {isQuizFinished ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 px-4 space-y-5"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto shadow-md">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-foreground">
                Knowledge Check Completed!
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                You answered {correctCount} out of {totalQuestions} questions correctly.
              </p>
            </div>

            {/* Stats Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-center">
                <span className="text-xs font-semibold text-muted-foreground block mb-0.5">Score</span>
                <span className="text-lg font-extrabold text-emerald-400">{correctCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-center">
                <span className="text-xs font-semibold text-muted-foreground block mb-0.5">Missed</span>
                <span className="text-lg font-extrabold text-rose-400">{missCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-center">
                <span className="text-xs font-semibold text-muted-foreground block mb-0.5">Accuracy</span>
                <span className="text-lg font-extrabold text-amber-400">{accuracyPct}%</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleResetQuiz}
                size="sm"
                className="gap-2 rounded-xl border-border font-semibold text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Quiz
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Header: Progress, Scores, Question Counter */}
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                  <BrainCircuit className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Question {currentIdx + 1} of {totalQuestions}
                  </span>
                </div>
              </div>

              {/* Score Badges */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> {correctCount}
                </span>
                {missCount > 0 && (
                  <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> {missCount}
                  </span>
                )}
              </div>
            </div>

            {/* Question Text */}
            <h3 className="text-sm md:text-base font-bold text-foreground leading-snug mb-3.5">
              {currentQuiz.question}
            </h3>

            {/* Options Stack */}
            <div className="space-y-2 mb-4">
              {currentQuiz.options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelectedOption = selected === idx;
                const isCorrectOption = idx === currentQuiz.correct_index;

                let stateStyle =
                  "border-border/60 bg-card/60 hover:bg-accent/40 hover:border-border";
                let badgeStyle = "bg-muted text-muted-foreground border-border";

                if (submitted) {
                  if (isCorrectOption) {
                    stateStyle =
                      "border-emerald-500/80 bg-emerald-500/10 text-emerald-300 shadow-sm";
                    badgeStyle =
                      "bg-emerald-500 text-slate-950 font-bold border-emerald-400";
                  } else if (isSelectedOption) {
                    stateStyle = "border-rose-500/80 bg-rose-500/10 text-rose-300";
                    badgeStyle = "bg-rose-500 text-white font-bold border-rose-400";
                  } else {
                    stateStyle = "border-border/30 bg-muted/10 opacity-50";
                  }
                } else if (isSelectedOption) {
                  stateStyle =
                    "border-amber-500/80 bg-amber-500/10 text-amber-300 shadow-sm";
                  badgeStyle =
                    "bg-amber-500 text-slate-950 font-bold border-amber-400";
                }

                return (
                  <motion.button
                    key={idx}
                    whileHover={!submitted ? { scale: 1.005, x: 2 } : {}}
                    whileTap={!submitted ? { scale: 0.995 } : {}}
                    onClick={() => handleSelect(idx)}
                    disabled={submitted}
                    className={cn(
                      "w-full text-left py-2.5 px-3 rounded-xl border transition-all duration-200 flex items-center gap-3 relative group",
                      stateStyle,
                      !submitted && "cursor-pointer"
                    )}
                  >
                    <span
                      className={cn(
                        "w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                        badgeStyle
                      )}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 text-xs md:text-sm leading-relaxed text-foreground/90 font-medium">
                      {option}
                    </span>

                    {/* Status Icons */}
                    {submitted && isCorrectOption && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {submitted && isSelectedOption && !isCorrectOption && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Action Footer */}
            {!submitted ? (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
                  Press <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px] font-mono">1-4</kbd> to select, <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px] font-mono">Enter</kbd> to submit
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={selected === null}
                  size="sm"
                  className="gap-2 ml-auto px-5 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md disabled:opacity-50 transition-all text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Submit Answer
                </Button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-1"
                >
                  {/* Feedback Drawer */}
                  <div
                    className={cn(
                      "p-3.5 rounded-xl border flex items-start gap-3 backdrop-blur-md shadow-sm",
                      isCorrect
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    )}
                  >
                    {isCorrect ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 mt-0.5">
                        <XCircle className="w-4 h-4 text-rose-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs md:text-sm mb-0.5 flex items-center gap-2">
                        {isCorrect ? "Correct! Well done." : "Incorrect."}
                      </h4>
                      {currentQuiz.explanation && (
                        <p className="text-xs leading-relaxed opacity-90 font-normal">
                          {currentQuiz.explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Next Question CTA */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleNextQuestion}
                      size="sm"
                      className="gap-2 px-5 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md text-xs"
                    >
                      {currentIdx < totalQuestions - 1 ? (
                        <>
                          Next Question
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          Finish Quiz
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </>
        )}
      </div>
    </div>
  );
}
