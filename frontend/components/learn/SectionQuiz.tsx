"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { QuizMetadata } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Sparkles, HelpCircle, RotateCcw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionQuizProps {
  metadata?: Record<string, unknown>;
}

export default function SectionQuiz({ metadata }: SectionQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const quizMeta = metadata as QuizMetadata | undefined;

  if (!quizMeta || !quizMeta.question || !quizMeta.options) {
    return (
      <div className="p-6 rounded-2xl bg-card border border-border text-center">
        <HelpCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground font-medium">Quiz content unavailable</p>
      </div>
    );
  }

  const isCorrect = selected === quizMeta.correct_index;

  const handleSelect = (idx: number) => {
    if (!submitted) {
      setSelected(idx);
    }
  };

  const handleReset = () => {
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <div className="relative rounded-2xl bg-card/80 border border-border/60 p-6 md:p-8 backdrop-blur-sm shadow-xl overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm shrink-0">
          ?
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block mb-0.5">
            Knowledge Check
          </span>
          <h3 className="text-base md:text-lg font-semibold text-foreground leading-snug">
            {quizMeta.question}
          </h3>
        </div>
      </div>

      {/* Options Stack */}
      <div className="space-y-3 mb-6">
        {quizMeta.options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelectedOption = selected === idx;
          const isCorrectOption = idx === quizMeta.correct_index;

          let stateStyle = "border-border/60 bg-card/60 hover:bg-accent/40 hover:border-border";
          let badgeStyle = "bg-muted text-muted-foreground border-border";

          if (submitted) {
            if (isCorrectOption) {
              stateStyle = "border-emerald-500/80 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
              badgeStyle = "bg-emerald-500 text-slate-950 font-bold border-emerald-400";
            } else if (isSelectedOption) {
              stateStyle = "border-rose-500/80 bg-rose-500/10 text-rose-300";
              badgeStyle = "bg-rose-500 text-white font-bold border-rose-400";
            } else {
              stateStyle = "border-border/30 bg-muted/10 opacity-50";
            }
          } else if (isSelectedOption) {
            stateStyle = "border-amber-500/80 bg-amber-500/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
            badgeStyle = "bg-amber-500 text-slate-950 font-bold border-amber-400";
          }

          return (
            <motion.button
              key={idx}
              whileHover={!submitted ? { scale: 1.01, x: 2 } : {}}
              whileTap={!submitted ? { scale: 0.99 } : {}}
              onClick={() => handleSelect(idx)}
              disabled={submitted}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5 relative group",
                stateStyle,
                !submitted && "cursor-pointer"
              )}
            >
              <span
                className={cn(
                  "w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-semibold shrink-0 transition-colors mt-0.5",
                  badgeStyle
                )}
              >
                {letter}
              </span>
              <span className="flex-1 text-sm md:text-base leading-relaxed pt-0.5 text-foreground/90 font-medium">
                {option}
              </span>

              {/* Status Icons */}
              {submitted && isCorrectOption && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
              )}
              {submitted && isSelectedOption && !isCorrectOption && (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-1" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Action & Feedback Footer */}
      {!submitted && (
        <div className="flex justify-end">
          <Button
            onClick={() => setSubmitted(true)}
            disabled={selected === null}
            className="gap-2 px-6 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Submit Answer
          </Button>
        </div>
      )}

      {/* Animated Feedback Result */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            className="space-y-4 pt-2"
          >
            <div
              className={cn(
                "p-5 rounded-2xl border flex items-start gap-3.5 backdrop-blur-md shadow-lg",
                isCorrect
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              )}
            >
              {isCorrect ? (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5 text-rose-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-base mb-1 flex items-center gap-2">
                  {isCorrect ? "Spot on! That's correct." : "Not quite right."}
                </h4>
                {quizMeta.explanation && (
                  <p className="text-sm leading-relaxed opacity-90 font-normal">
                    {quizMeta.explanation}
                  </p>
                )}
              </div>
            </div>

            {!isCorrect && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  size="sm"
                  className="gap-2 rounded-xl border-border text-foreground hover:bg-muted font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Try Again
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
