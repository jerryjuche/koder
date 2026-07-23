"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CodeBlockContent } from "@/components/kibo-ui/code-block";
import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

function preprocessCustomBlocks(markdown: string): string {
  return markdown
    .replace(
      /:::tip\s*\n([\s\S]*?):::/g,
      (_, content) =>
        `<div class="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-400 p-4 rounded-lg my-4 text-amber-900 dark:text-amber-200 text-sm"><strong class="block mb-1">💡 Tip</strong>${content.trim()}</div>`
    )
    .replace(
      /:::example\s*\n([\s\S]*?):::/g,
      (_, content) =>
        `<div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-400 p-4 rounded-lg my-4 text-blue-900 dark:text-blue-200 text-sm"><strong class="block mb-1">📝 Example</strong>${content.trim()}</div>`
    )
    .replace(
      /:::warning\s*\n([\s\S]*?):::/g,
      (_, content) =>
        `<div class="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-400 p-4 rounded-lg my-4 text-red-900 dark:text-red-200 text-sm"><strong class="block mb-1">⚠️ Warning</strong>${content.trim()}</div>`
    )
    .replace(
      /:::info\s*\n([\s\S]*?):::/g,
      (_, content) =>
        `<div class="bg-sky-50 dark:bg-sky-950/30 border-l-4 border-sky-400 p-4 rounded-lg my-4 text-sky-900 dark:text-sky-200 text-sm"><strong class="block mb-1">ℹ️ Info</strong>${content.trim()}</div>`
    );
}

export default function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const processed = useMemo(() => preprocessCustomBlocks(content || ""), [content]);

  if (!content?.trim()) {
    return (
      <div className={cn("flex items-center justify-center h-full text-muted-foreground/40 text-sm", className)}>
        <div className="text-center space-y-2">
          <div className="text-4xl opacity-40">✏️</div>
          <p>Nothing to preview</p>
          <p className="text-xs">Write markdown on the left</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none overflow-y-auto h-full p-6", className)}>
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
                {lang && (
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-muted/50 border-b border-border">
                    <span className="text-xs font-mono text-muted-foreground">{lang}</span>
                  </div>
                )}
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
          img({ src, alt }) {
            return (
              <div className="relative overflow-hidden rounded-lg border border-border my-4">
                <img src={src} alt={alt || ""} className="w-full h-auto object-cover" loading="lazy" />
              </div>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/30 bg-muted/30 rounded-r-lg px-4 py-3 my-4 italic text-muted-foreground">
                {children}
              </blockquote>
            );
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
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
