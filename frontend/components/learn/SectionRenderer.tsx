"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { LessonSection } from "@/lib/types";
import SectionQuiz from "./SectionQuiz";
import SectionExercise from "./SectionExercise";
import { CodeBlockContent } from "@/components/kibo-ui/code-block";
import type { MultiFileSpec } from "@/lib/pyodide";
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

function preprocessCallouts(markdown: string): string {
  return markdown
    .replace(/<div class="tip">([\s\S]*?)<\/div>/gi,
      '<div class="custom-callout callout-tip">$1</div>')
    .replace(/<div class="example">([\s\S]*?)<\/div>/gi,
      '<div class="custom-callout callout-example">$1</div>')
    .replace(/<div class="warning">([\s\S]*?)<\/div>/gi,
      '<div class="custom-callout callout-warning">$1</div>')
    .replace(/<div class="info">([\s\S]*?)<\/div>/gi,
      '<div class="custom-callout callout-info">$1</div>');
}

export default function SectionRenderer({ section, problemReferences, language }: SectionRendererProps) {
  const sectionType = section.section_type;
  const Icon = sectionTypeIcons[sectionType] || <FileText className="h-4 w-4" />;
  const label = sectionTypeLabels[sectionType] || sectionType;
  const badgeStyle = sectionTypeBadges[sectionType] || "bg-muted text-muted-foreground border-muted";

  const renderMarkdown = (content: string) => {
    const processed = preprocessCallouts(content);
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-a:text-primary prose-code:before:content-none prose-code:after:content-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !match;
              if (isInline) {
                return (
                  <code
                    className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground/80 before:content-none after:content-none"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              const lang = match[1];
              const code = String(children).replace(/\n$/, "");
              return (
                <div className="my-4 rounded-xl border border-border overflow-hidden">
                  <div className="text-sm">
                    <CodeBlockContent language={lang as any} syntaxHighlighting>
                      {code}
                    </CodeBlockContent>
                  </div>
                </div>
              );
            },
            pre({ children }) {
              return <>{children}</>;
            },
            table({ children }) {
              return (
                <div className="overflow-x-auto my-4 rounded-xl border border-border">
                  <table className="min-w-full divide-y divide-border text-sm">
                    {children}
                  </table>
                </div>
              );
            },
            th({ children }) {
              return (
                <th className="px-4 py-2 text-left font-medium text-muted-foreground bg-muted/30">
                  {children}
                </th>
              );
            },
            td({ children }) {
              return (
                <td className="px-4 py-2 border-t border-border">
                  {children}
                </td>
              );
            },
            blockquote({ children }) {
              return (
                <blockquote className="border-l-4 border-primary/30 bg-muted/30 rounded-r-lg px-4 py-3 my-4 italic text-muted-foreground">
                  {children}
                </blockquote>
              );
            },
            a({ href, children }) {
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {children}
                </a>
              );
            },
            hr() {
              return <hr className="my-6 border-border" />;
            },
            div({ className, children, ...props }) {
              if (className?.startsWith("custom-callout")) {
                const calloutType = className.replace("custom-callout ", "");
                const styles: Record<string, string> = {
                  "callout-tip": "bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-400 text-amber-900 dark:text-amber-200",
                  "callout-example": "bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-400 text-blue-900 dark:text-blue-200",
                  "callout-warning": "bg-red-50 dark:bg-red-950/30 border-l-4 border-red-400 text-red-900 dark:text-red-200",
                  "callout-info": "bg-sky-50 dark:bg-sky-950/30 border-l-4 border-sky-400 text-sky-900 dark:text-sky-200",
                };
                const labels: Record<string, string> = {
                  "callout-tip": "💡 Tip",
                  "callout-example": "📝 Example",
                  "callout-warning": "⚠️ Warning",
                  "callout-info": "ℹ️ Info",
                };
                return (
                  <div className={`p-4 rounded-lg my-4 text-sm ${styles[calloutType] || ""}`} {...props}>
                    <strong className="block mb-1">{labels[calloutType] || ""}</strong>
                    {children}
                  </div>
                );
              }
              return <div className={className} {...props}>{children}</div>;
            },
          }}
        >
          {processed}
        </ReactMarkdown>
      </div>
    );
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
          {section.title && <h2 className="text-xl font-semibold mb-4 whitespace-pre-line">{section.title}</h2>}
          <SectionQuiz metadata={section.metadata} />
        </div>
      );

    case "exercises":
    case "assessment": {
      const multiFileMeta = (section.metadata as unknown as Record<string, unknown>)?.multiFile as MultiFileSpec | undefined;
      return (
        <div>
          {renderSectionHeader()}
          {section.title && <h2 className="text-xl font-semibold mb-4 whitespace-pre-line">{section.title}</h2>}
          {section.content && <div className="mb-6">{renderMarkdown(section.content)}</div>}
          <SectionExercise problemReferences={problemReferences} language={language} multiFile={multiFileMeta} />
        </div>
      );
    }

    case "mini_project": {
      const multiFileMeta = (section.metadata as unknown as Record<string, unknown>)?.multiFile as MultiFileSpec | undefined;
      return (
        <div>
          {renderSectionHeader()}
          {section.title && <h2 className="text-xl font-semibold mb-4 whitespace-pre-line">{section.title}</h2>}
          {section.content && <div className="mb-6">{renderMarkdown(section.content)}</div>}
          <SectionExercise problemReferences={problemReferences} language={language} miniProject multiFile={multiFileMeta} />
        </div>
      );
    }

    case "summary":
      return (
        <div>
          {renderSectionHeader()}
          {section.title && <h2 className="text-xl font-semibold mb-4 whitespace-pre-line">{section.title}</h2>}
          {section.content && renderMarkdown(section.content)}
        </div>
      );

    default:
      return (
        <div>
          {renderSectionHeader()}
          {section.title && <h2 className="text-xl font-semibold mb-4 whitespace-pre-line">{section.title}</h2>}
          {section.content && renderMarkdown(section.content)}
        </div>
      );
  }
}
