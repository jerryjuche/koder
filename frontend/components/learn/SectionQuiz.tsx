"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { QuizMetadata } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionQuizProps {
  metadata?: Record<string, unknown>;
}

export default function SectionQuiz({ metadata }: SectionQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const quizMeta = metadata as QuizMetadata | undefined;

  if (!quizMeta) {
    return <p className="text-sm text-muted-foreground">Quiz metadata not available</p>;
  }

  const isCorrect = selected === quizMeta.correct_index;

  return (
    <div className="border rounded-lg p-6 bg-card">
      <p className="font-medium mb-4">{quizMeta.question}</p>

      <div className="space-y-2">
        {quizMeta.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => { if (!submitted) setSelected(idx); }}
            disabled={submitted}
            className={cn(
              "w-full text-left p-3 rounded-lg border transition-all duration-200",
              submitted
                ? idx === quizMeta.correct_index
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300"
                  : idx === selected
                    ? "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300"
                    : "border-border text-muted-foreground"
                : selected === idx
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/50 hover:bg-muted/30",
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(
                "w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium shrink-0 transition-colors",
                submitted && idx === quizMeta.correct_index && "border-green-500 bg-green-500 text-white",
                submitted && idx === selected && idx !== quizMeta.correct_index && "border-red-500 bg-red-500 text-white",
              )}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1">{option}</span>
              {submitted && idx === quizMeta.correct_index && (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              )}
              {submitted && idx === selected && idx !== quizMeta.correct_index && (
                <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      {!submitted && (
        <Button onClick={() => setSubmitted(true)} disabled={selected === null} className="mt-4">
          Check Answer
        </Button>
      )}

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 space-y-3"
        >
          <div className={cn(
            "p-3 rounded-lg flex items-start gap-2",
            isCorrect
              ? "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300"
              : "bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300",
          )}>
            {isCorrect ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium text-sm">{isCorrect ? "Correct!" : "Incorrect"}</p>
              {quizMeta.explanation && (
                <p className="text-sm mt-1 opacity-80">{quizMeta.explanation}</p>
              )}
            </div>
          </div>
          {!isCorrect && (
            <Button variant="outline" onClick={() => { setSelected(null); setSubmitted(false); }} size="sm">
              Try Again
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
