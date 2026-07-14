"use client";

import { useState } from "react";
import { QuizMetadata } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface SectionQuizProps {
  metadata?: QuizMetadata;
}

export default function SectionQuiz({ metadata }: SectionQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!metadata) {
    return <p className="text-sm text-muted-foreground">Quiz metadata not available</p>;
  }

  const isCorrect = selected === metadata.correct_index;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleRetry = () => {
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <div className="border rounded-lg p-6 bg-card">
      <p className="font-medium mb-4">{metadata.question}</p>

      <div className="space-y-2">
        {metadata.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => { if (!submitted) setSelected(idx); }}
            disabled={submitted}
            className={`w-full text-left p-3 rounded border transition-colors ${
              submitted
                ? idx === metadata.correct_index
                  ? "border-green-500 bg-green-50 text-green-900"
                  : idx === selected
                    ? "border-red-500 bg-red-50 text-red-900"
                    : "border-border text-muted-foreground"
                : selected === idx
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{option}</span>
              {submitted && idx === metadata.correct_index && <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto shrink-0" />}
              {submitted && idx === selected && idx !== metadata.correct_index && <XCircle className="h-4 w-4 text-red-500 ml-auto shrink-0" />}
            </div>
          </button>
        ))}
      </div>

      {!submitted && (
        <Button onClick={handleSubmit} disabled={selected === null} className="mt-4">
          Check Answer
        </Button>
      )}

      {submitted && (
        <div className="mt-4 space-y-3">
          <div className={`p-3 rounded ${isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            <p className="font-medium flex items-center gap-2">
              {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>
            {metadata.explanation && (
              <p className="text-sm mt-1">{metadata.explanation}</p>
            )}
          </div>
          {!isCorrect && (
            <Button variant="outline" onClick={handleRetry}>Try Again</Button>
          )}
        </div>
      )}
    </div>
  );
}
