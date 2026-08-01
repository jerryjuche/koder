"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { LessonSection } from "@/lib/types";
import SectionQuiz from "./SectionQuiz";
import SectionExercise from "./SectionExercise";
import { CodeBlockContent } from "@/components/kibo-ui/code-block";
import {
  BookText,
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
  CheckCircle2,
  XCircle,
  Lightbulb,
  Info,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const sectionTypeGradients: Record<string, string> = {
  overview: "from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20 text-blue-400",
  explanation: "from-sky-500/10 via-sky-500/5 to-transparent border-sky-500/20 text-sky-400",
  examples: "from-violet-500/10 via-violet-500/5 to-transparent border-violet-500/20 text-violet-400",
  best_practices: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 text-emerald-400",
  common_mistakes: "from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20 text-rose-400",
  summary: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 text-amber-400",
  quiz: "from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20 text-orange-400",
  exercises: "from-teal-500/10 via-teal-500/5 to-transparent border-teal-500/20 text-teal-400",
  mini_project: "from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20 text-purple-400",
  assessment: "from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/20 text-indigo-400",
  ai_review: "from-fuchsia-500/10 via-fuchsia-500/5 to-transparent border-fuchsia-500/20 text-fuchsia-400",
};

function preprocessCallouts(markdown: string): string {
  if (!markdown) return "";
  return markdown
    .replace(
      /<div class="tip">([\s\S]*?)<\/div>/gi,
      '<div class="custom-callout callout-tip">$1</div>'
    )
    .replace(
      /<div class="example">([\s\S]*?)<\/div>/gi,
      '<div class="custom-callout callout-example">$1</div>'
    )
    .replace(
      /<div class="warning">([\s\S]*?)<\/div>/gi,
      '<div class="custom-callout callout-warning">$1</div>'
    )
    .replace(
      /<div class="info">([\s\S]*?)<\/div>/gi,
      '<div class="custom-callout callout-info">$1</div>'
    );
}

export default function SectionRenderer({
  section,
  problemReferences,
  language = "python",
}: SectionRendererProps) {
  const sectionType = section.section_type;
  const Icon = sectionTypeIcons[sectionType] || <FileText className="h-4 w-4" />;
  const label = sectionTypeLabels[sectionType] || sectionType;
  const gradientStyle = sectionTypeGradients[sectionType] || "from-muted/10 border-border/50 text-foreground";

  // Dedicated Quiz Section Rendering
  if (sectionType === "quiz") {
    return <SectionQuiz metadata={section.metadata} />;
  }

  // Dedicated Exercise Section Rendering
  if (sectionType === "exercises") {
    return (
      <SectionExercise
        metadata={section.metadata}
        problemReferences={problemReferences}
        language={language}
      />
    );
  }

  const renderMarkdown = (content: string) => {
    const processed = preprocessCallouts(content);
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-a:text-amber-400 prose-a:underline hover:prose-a:text-amber-300 prose-code:before:content-none prose-code:after:content-none [&_p]:mb-3 [&_p:empty]:hidden [&_br]:block [&_br]:content-[''] [&_br]:mt-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !match;
              if (isInline) {
                return (
                  <code
                    className="bg-muted/80 border border-border/50 px-1.5 py-0.5 rounded text-xs font-mono text-amber-300 before:content-none after:content-none"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              const lang = match[1];
              const code = String(children).replace(/\n$/, "");
              return (
                <div className="my-4 rounded-xl border border-border/70 overflow-hidden shadow-sm">
                  <div className="text-xs">
                    <CodeBlockContent language={lang as any} syntaxHighlighting>
                      {code}
                    </CodeBlockContent>
                  </div>
                </div>
              );
            },
            div({ className, children, ...props }) {
              if (className?.includes("custom-callout")) {
                let badgeIcon = <Info className="h-4 w-4 text-blue-400" />;
                let borderStyle = "border-blue-500/30 bg-blue-500/10 text-blue-300";
                let badgeTitle = "Note";

                if (className.includes("callout-tip")) {
                  badgeIcon = <Lightbulb className="h-4 w-4 text-amber-400" />;
                  borderStyle = "border-amber-500/30 bg-amber-500/10 text-amber-300";
                  badgeTitle = "Pro Tip";
                } else if (className.includes("callout-warning")) {
                  badgeIcon = <AlertTriangle className="h-4 w-4 text-rose-400" />;
                  borderStyle = "border-rose-500/30 bg-rose-500/10 text-rose-300";
                  badgeTitle = "Warning";
                } else if (className.includes("callout-example")) {
                  badgeIcon = <Puzzle className="h-4 w-4 text-emerald-400" />;
                  borderStyle = "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
                  badgeTitle = "Example";
                }

                return (
                  <div className={cn("p-4 rounded-xl border my-4 shadow-xs flex gap-3 items-start", borderStyle)}>
                    <div className="mt-0.5 shrink-0">{badgeIcon}</div>
                    <div className="flex-1 min-w-0 text-xs md:text-sm leading-relaxed">
                      <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">
                        {badgeTitle}
                      </span>
                      {children}
                    </div>
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

  return (
    <div className="space-y-4">
      {/* Section Header Card */}
      <div className={cn("rounded-2xl border bg-gradient-to-br p-5 md:p-6 shadow-md relative overflow-hidden", gradientStyle)}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-card/80 border border-border/60 flex items-center justify-center shadow-xs">
            {Icon}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">
              {label}
            </span>
            <h2 className="text-base md:text-lg font-bold text-foreground leading-snug">
              {section.title || label}
            </h2>
          </div>
        </div>

        {/* Specialized Overview Header Banner */}
        {sectionType === "overview" && (
          <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Introduction & Core Concepts</span>
          </div>
        )}

        {/* Specialized Best Practices vs Common Mistakes Banners */}
        {sectionType === "best_practices" && (
          <div className="mt-3 pt-3 border-t border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Recommended Coding Standards & Clean Code Rules</span>
          </div>
        )}

        {sectionType === "common_mistakes" && (
          <div className="mt-3 pt-3 border-t border-rose-500/30 flex items-center gap-2 text-xs text-rose-400 font-semibold">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            <span>Pitfalls & Anti-Patterns to Avoid</span>
          </div>
        )}
      </div>

      {/* Section Content Body */}
      <div className="rounded-2xl border border-border/60 bg-card/80 p-5 md:p-7 shadow-sm">
        {section.content ? (
          renderMarkdown(section.content)
        ) : (
          <div className="text-center py-8 text-muted-foreground text-xs font-medium">
            No content specified for this section.
          </div>
        )}
      </div>
    </div>
  );
}
