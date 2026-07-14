"use client";

import { LessonSection, LessonPrereq, LessonProgress } from "@/lib/types";
import { X, CheckCircle2, Circle, ListOrdered } from "lucide-react";

interface LessonSidebarProps {
  sections: LessonSection[];
  dependencies: LessonPrereq[];
  completed: boolean;
  progress?: LessonProgress | null;
  onClose: () => void;
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

export default function LessonSidebar({ sections, dependencies, completed, progress, onClose }: LessonSidebarProps) {
  const pct = progress?.completed ? 100 : sections.length > 0 ? Math.round((sections.filter(s => s.section_type === 'summary' || s.section_type === 'quiz').length / sections.length) * 100) : 0;

  return (
    <aside className="w-72 border-r bg-muted/10 p-4 overflow-y-auto shrink-0 hidden md:block">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Lesson Progress</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${completed ? "bg-green-500" : "bg-primary"}`}
            style={{ width: `${completed ? 100 : pct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {completed ? "Complete!" : `${pct}% done`}
        </p>
      </div>

      {/* Dependencies */}
      {dependencies.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <ListOrdered className="h-3 w-3" /> Prerequisites
          </h4>
          <div className="space-y-1">
            {dependencies.map((dep, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>Lesson {dep.depends_on_lesson_id.slice(0, 8)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sections list */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <ListOrdered className="h-3 w-3" /> Sections
        </h4>
        <div className="space-y-1">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              className="flex items-center gap-2 text-xs py-1 px-2 rounded hover:bg-accent/50 cursor-pointer"
            >
              {section.section_type === "quiz" || section.section_type === "exercises" ? (
                <Circle className="h-3 w-3 text-muted-foreground" />
              ) : (
                <div className="h-3 w-3 rounded-full border border-muted-foreground" />
              )}
              <span className="truncate">{sectionTypeLabels[section.section_type] || section.section_type}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
