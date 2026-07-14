"use client";

import { useEffect, useState } from "react";
import { LessonSection, LessonPrereq, LessonProgress } from "@/lib/types";
import {
  X, CheckCircle2, Circle, ListOrdered,
  BookText, FileText, Puzzle, Star, AlertTriangle,
  ScrollText, BrainCircuit, FlaskConical, Target,
  FileCode, Sparkles,
} from "lucide-react";

interface LessonSidebarProps {
  sections: LessonSection[];
  dependencies: LessonPrereq[];
  completed: boolean;
  progress?: LessonProgress | null;
  onClose: () => void;
  activeSectionId?: string | null;
}

const sectionTypeLabels: Record<string, string> = {
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

const sectionTypeIcons: Record<string, React.ReactNode> = {
  overview: <BookText className="h-3 w-3" />,
  explanation: <FileText className="h-3 w-3" />,
  examples: <Puzzle className="h-3 w-3" />,
  best_practices: <Star className="h-3 w-3" />,
  common_mistakes: <AlertTriangle className="h-3 w-3" />,
  summary: <ScrollText className="h-3 w-3" />,
  quiz: <BrainCircuit className="h-3 w-3" />,
  exercises: <FlaskConical className="h-3 w-3" />,
  mini_project: <Target className="h-3 w-3" />,
  assessment: <FileCode className="h-3 w-3" />,
  ai_review: <Sparkles className="h-3 w-3" />,
};

export default function LessonSidebar({ sections, dependencies, completed, progress, onClose, activeSectionId }: LessonSidebarProps) {
  const computedPct = sections.length > 0
    ? Math.round(sections.filter(s => s.section_type === 'summary' || s.section_type === 'quiz').length / sections.length * 100)
    : 0;
  const pct = progress?.completed ? 100 : completed ? 100 : computedPct;

  return (
    <aside className="w-72 border-r bg-muted/10 p-4 overflow-y-auto shrink-0 hidden md:flex md:flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-primary" />
          Lesson Progress
        </h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors rounded p-0.5 hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${completed ? "bg-green-500" : "bg-primary"}`}
            style={{ width: `${completed ? 100 : pct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {completed ? "Complete!" : `${pct}% done`}
        </p>
      </div>

      {/* Dependencies */}
      {dependencies.length > 0 && (
        <div className="mb-5">
          <h4 className="text-xs font-medium text-muted-foreground mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
            <ListOrdered className="h-3 w-3" />
            Prerequisites
          </h4>
          <div className="space-y-1.5">
            {dependencies.map((dep, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-green-50/50 dark:bg-green-900/10">
                <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                <span className="text-muted-foreground truncate">Lesson {dep.depends_on_lesson_id.slice(0, 8)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sections list */}
      <div className="flex-1 min-h-0">
        <h4 className="text-xs font-medium text-muted-foreground mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
          <ListOrdered className="h-3 w-3" />
          Sections
        </h4>
        <div className="space-y-0.5">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#section-${section.id}`}
              className={`flex items-center gap-2.5 text-xs py-2 px-2.5 rounded-lg transition-all duration-200 ${
                activeSectionId === section.id
                  ? "bg-primary/10 text-primary font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <span className={`shrink-0 ${activeSectionId === section.id ? "text-primary" : "text-muted-foreground/50"}`}>
                {sectionTypeIcons[section.section_type] || <Circle className="h-3 w-3" />}
              </span>
              <span className="truncate">{sectionTypeLabels[section.section_type] || section.section_type}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
