"use client";

import { LessonSection } from "@/lib/types";
import SectionQuiz from "./SectionQuiz";
import SectionExercise from "./SectionExercise";
import {
  BookText, FileText, Puzzle, Star, AlertTriangle,
  ScrollText, BrainCircuit, FlaskConical, Target,
  FileCode, Sparkles,
} from "lucide-react";

interface SectionRendererProps {
  section: LessonSection;
  problemReferences: string[];
  language?: string;
}

const sectionTypeIcons: Record<string, React.ReactNode> = {
  overview: <BookText className="h-4 w-4" />,
  explanation: <FileText className="h-4 w-4" />,
  examples: <Puzzle className="h-4 w-4" />,
  best_practices: <Star className="h-4 w-4" />,
  common_mistakes: <AlertTriangle className="h-4 w-4" />,
  summary: <ScrollText className="h-4 w-4" />,
  quiz: <BrainCircuit className="h-4 w-4" />,
  exercises: <FlaskConical className="h-4 w-4" />,
  mini_project: <Target className="h-4 w-4" />,
  assessment: <FileCode className="h-4 w-4" />,
  ai_review: <Sparkles className="h-4 w-4" />,
};

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

const sectionTypeBadges: Record<string, string> = {
  overview: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  explanation: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800",
  examples: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  best_practices: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  common_mistakes: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  summary: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  quiz: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  exercises: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800",
  mini_project: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  assessment: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  ai_review: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-800",
};

export default function SectionRenderer({ section, problemReferences, language }: SectionRendererProps) {
  const sectionType = section.section_type;
  const Icon = sectionTypeIcons[sectionType] || <FileText className="h-4 w-4" />;
  const label = sectionTypeLabels[sectionType] || sectionType;
  const badgeStyle = sectionTypeBadges[sectionType] || "bg-muted text-muted-foreground border-muted";

  const renderMarkdown = (content: string) => {
    let html = content
      .replace(/<div class="tip">([\s\S]*?)<\/div>/gi,
        '<div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg my-4 text-amber-900 text-sm"><strong class="block mb-1">💡 Tip</strong> $1</div>')
      .replace(/<div class="example">([\s\S]*?)<\/div>/gi,
        '<div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg my-4 text-blue-900 text-sm"><strong class="block mb-1">📝 Example</strong> $1</div>')
      .replace(/<div class="warning">([\s\S]*?)<\/div>/gi,
        '<div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg my-4 text-red-900 text-sm"><strong class="block mb-1">⚠️ Warning</strong> $1</div>')
      .replace(/<div class="info">([\s\S]*?)<\/div>/gi,
        '<div class="bg-sky-50 border-l-4 border-sky-400 p-4 rounded-lg my-4 text-sky-900 text-sm"><strong class="block mb-1">ℹ️ Info</strong> $1</div>');

    return <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-a:text-primary prose-code:text-primary prose-pre:bg-muted/50 prose-pre:border" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const renderSectionHeader = () => (
    <div className="flex items-center gap-2 mb-4">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${badgeStyle}`}>
        {Icon}
        {label}
      </span>
    </div>
  );

  switch (sectionType) {
    case "quiz":
      return (
        <div>
          {renderSectionHeader()}
          {section.title && <h2 className="text-xl font-semibold mb-4">{section.title}</h2>}
          <SectionQuiz metadata={section.metadata} />
        </div>
      );

    case "exercises":
    case "assessment":
      return (
        <div>
          {renderSectionHeader()}
          {section.title && <h2 className="text-xl font-semibold mb-4">{section.title}</h2>}
          {section.content && <div className="mb-6">{renderMarkdown(section.content)}</div>}
          <SectionExercise problemReferences={problemReferences} language={language} />
        </div>
      );

    case "mini_project":
      return (
        <div>
          {renderSectionHeader()}
          {section.title && <h2 className="text-xl font-semibold mb-4">{section.title}</h2>}
          {section.content && <div className="mb-6">{renderMarkdown(section.content)}</div>}
          <SectionExercise problemReferences={problemReferences} language={language} miniProject />
        </div>
      );

    case "summary":
      return (
        <div>
          {renderSectionHeader()}
          {section.title && <h2 className="text-xl font-semibold mb-4">{section.title}</h2>}
          {section.content && renderMarkdown(section.content)}
        </div>
      );

    default:
      return (
        <div>
          {renderSectionHeader()}
          {section.title && <h2 className="text-xl font-semibold mb-4">{section.title}</h2>}
          {section.content && renderMarkdown(section.content)}
        </div>
      );
  }
}
