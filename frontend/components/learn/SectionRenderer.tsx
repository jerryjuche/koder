"use client";

import { LessonSection } from "@/lib/types";
import SectionQuiz from "./SectionQuiz";
import SectionExercise from "./SectionExercise";

interface SectionRendererProps {
  section: LessonSection;
  problemReferences: string[];
  language?: string;
}

export default function SectionRenderer({ section, problemReferences, language }: SectionRendererProps) {
  const sectionType = section.section_type;

  // Styles for custom HTML blocks (:::tip, :::example, etc. — stored as raw HTML in markdown)
  const renderMarkdown = (content: string) => {
    // Replace custom block markers with styled HTML
    let html = content
      // :::tip → styled tip block
      .replace(/<div class="tip">([\s\S]*?)<\/div>/gi, '<div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded my-3 text-amber-900"><strong>Tip:</strong> $1</div>')
      // :::example → styled example block
      .replace(/<div class="example">([\s\S]*?)<\/div>/gi, '<div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded my-3 text-blue-900"><strong>Example:</strong> $1</div>')
      // :::warning → styled warning block
      .replace(/<div class="warning">([\s\S]*?)<\/div>/gi, '<div class="bg-red-50 border-l-4 border-red-400 p-4 rounded my-3 text-red-900"><strong>Warning:</strong> $1</div>');

    return <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  switch (sectionType) {
    case "quiz":
      return (
        <section className="scroll-mt-20">
          <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
          <SectionQuiz metadata={section.metadata} />
        </section>
      );

    case "exercises":
    case "assessment":
      return (
        <section className="scroll-mt-20">
          <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
          {renderMarkdown(section.content)}
          <SectionExercise problemReferences={problemReferences} language={language} />
        </section>
      );

    case "mini_project":
      return (
        <section className="scroll-mt-20">
          <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
          <div className="mb-4">{renderMarkdown(section.content)}</div>
          <SectionExercise problemReferences={problemReferences} language={language} miniProject />
        </section>
      );

    default:
      return (
        <section className="scroll-mt-20">
          <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
          {renderMarkdown(section.content)}
        </section>
      );
  }
}
