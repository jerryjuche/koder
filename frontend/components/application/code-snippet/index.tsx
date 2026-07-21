"use client";

import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { CheckIcon, CopyIcon, ChevronDown, ChevronUp, FileCode, Terminal } from "lucide-react";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { createElement } from "react";
import {
  SiGo,
  SiJavascript,
  SiTypescript,
  SiPython,
  SiRust,
  SiCss,
  SiHtml5,
  SiJson,
  SiMarkdown,
  SiGnubash,
  SiDocker,
} from "react-icons/si";
import {
  type BundledLanguage,
  type CodeOptionsMultipleThemes,
  codeToHtml,
} from "shiki";
import { cn } from "@/lib/utils";

const filenameIconMap: Record<string, IconType> = {
  "*.go": SiGo,
  "*.js": SiJavascript,
  "*.jsx": SiJavascript,
  "*.ts": SiTypescript,
  "*.tsx": SiTypescript,
  "*.py": SiPython,
  "*.rs": SiRust,
  "*.css": SiCss,
  "*.html": SiHtml5,
  "*.json": SiJson,
  "*.md": SiMarkdown,
  "*.sh": SiGnubash,
  Dockerfile: SiDocker,
};

const languageColorMap: Record<string, string> = {
  go: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  python: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  py: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  javascript: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  js: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  typescript: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ts: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  rust: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  rs: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  css: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  html: "bg-red-500/10 text-red-500 border-red-500/20",
  json: "bg-green-500/10 text-green-500 border-green-500/20",
  markdown: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
  md: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
  bash: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
  sh: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
  docker: "bg-sky-500/10 text-sky-500 border-sky-500/20",
};

const codeBlockClassName = cn(
  "mt-0 text-sm",
  "[&_pre]:py-4 [&_pre]:px-0",
  "[&_.shiki]:!bg-transparent",
  "[&_code]:w-full [&_code]:grid [&_code]:overflow-x-auto [&_code]:bg-transparent",
  "[&_.line]:px-5 [&_.line]:w-full [&_.line]:relative"
);

const lineNumberClassNames = cn(
  "[&_code]:[counter-reset:line]",
  "[&_code]:[counter-increment:line_0]",
  "[&_.line]:before:content-[counter(line)]",
  "[&_.line]:before:inline-block",
  "[&_.line]:before:[counter-increment:line]",
  "[&_.line]:before:w-[1.75rem]",
  "[&_.line]:before:mr-5",
  "[&_.line]:before:text-[13px]",
  "[&_.line]:before:text-right",
  "[&_.line]:before:text-muted-foreground/30",
  "[&_.line]:before:font-mono",
  "[&_.line]:before:select-none"
);

const darkModeClassNames = cn(
  "dark:[&_.shiki]:!text-[var(--shiki-dark)]",
  "dark:[&_.shiki]:![font-style:var(--shiki-dark-font-style)]",
  "dark:[&_.shiki]:![font-weight:var(--shiki-dark-font-weight)]",
  "dark:[&_.shiki]:![text-decoration:var(--shiki-dark-text-decoration)]",
  "dark:[&_.shiki_span]:!text-[var(--shiki-dark)]",
  "dark:[&_.shiki_span]:![font-style:var(--shiki-dark-font-style)]",
  "dark:[&_.shiki_span]:![font-weight:var(--shiki-dark-font-weight)]",
  "dark:[&_.shiki_span]:![text-decoration:var(--shiki-dark-text-decoration)]"
);

const lineHighlightClassNames = cn(
  "[&_.line.highlighted]:bg-blue-500/5",
  "[&_.line.highlighted]:after:bg-blue-500",
  "[&_.line.highlighted]:after:absolute",
  "[&_.line.highlighted]:after:left-0",
  "[&_.line.highlighted]:after:top-0",
  "[&_.line.highlighted]:after:bottom-0",
  "[&_.line.highlighted]:after:w-0.5",
  "dark:[&_.line.highlighted]:!bg-blue-500/10"
);

const highlight = (
  html: string,
  language?: BundledLanguage,
  themes?: CodeOptionsMultipleThemes["themes"]
) =>
  codeToHtml(html, {
    lang: language ?? "go",
    themes: themes ?? {
      light: "github-light",
      dark: "github-dark-default",
    },
    transformers: [
      transformerNotationDiff({ matchAlgorithm: "v3" }),
      transformerNotationHighlight({ matchAlgorithm: "v3" }),
      transformerNotationWordHighlight({ matchAlgorithm: "v3" }),
      transformerNotationFocus({ matchAlgorithm: "v3" }),
      transformerNotationErrorLevel({ matchAlgorithm: "v3" }),
    ],
  });

export type SnippetFile = {
  language: string;
  filename: string;
  code: string;
};

type CodeSnippetContextType = {
  value: string;
  onValueChange: (value: string) => void;
  files: SnippetFile[];
};

const CodeSnippetContext = createContext<CodeSnippetContextType>({
  value: "",
  onValueChange: () => {},
  files: [],
});

export type CodeSnippetProps = {
  files: SnippetFile[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  showMore?: boolean;
  maxCollapsedHeight?: number;
  showLineNumbers?: boolean;
  variant?: "default" | "minimal";
  className?: string;
};

export const CodeSnippet = ({
  files,
  defaultValue,
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  showMore = false,
  maxCollapsedHeight = 300,
  showLineNumbers = true,
  variant = "default",
  className,
}: CodeSnippetProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue ?? files[0]?.language ?? "");
  const value = controlledValue ?? internalValue;
  const onValueChange = (v: string) => {
    setInternalValue(v);
    controlledOnValueChange?.(v);
  };

  return (
    <CodeSnippetContext.Provider value={{ value, onValueChange, files }}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all duration-300",
          variant === "default" && "hover:shadow-md hover:border-border/80",
          variant === "minimal" && "border-0 shadow-none",
          className
        )}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CodeSnippetHeader variant={variant} />
        <CodeSnippetBody
          showMore={showMore}
          maxCollapsedHeight={maxCollapsedHeight}
          showLineNumbers={showLineNumbers}
        />
      </div>
    </CodeSnippetContext.Provider>
  );
};

const getFileIcon = (filename: string): IconType | undefined => {
  return Object.entries(filenameIconMap).find(([pattern]) => {
    const regex = new RegExp(
      `^${pattern.replace(/\\/g, "\\\\").replace(/\./g, "\\.").replace(/\*/g, ".*")}$`
    );
    return regex.test(filename);
  })?.[1];
};

const getLanguageLabel = (lang: string) => {
  const map: Record<string, string> = {
    go: "Go", py: "Python", python: "Python", js: "JS", javascript: "JS",
    ts: "TS", typescript: "TS", rs: "Rust", rust: "Rust",
    css: "CSS", html: "HTML", json: "JSON", md: "MD", markdown: "Markdown",
    sh: "Bash", bash: "Bash", docker: "Docker",
  };
  return map[lang] ?? lang;
};

export type CodeSnippetHeaderProps = {
  variant?: "default" | "minimal";
};

export const CodeSnippetHeader = ({ variant = "default" }: CodeSnippetHeaderProps) => {
  const { files, value, onValueChange } = useContext(CodeSnippetContext);
  const activeFile = files.find((f) => f.language === value) ?? files[0];

  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          {activeFile && (
            <>
              {getFileIcon(activeFile.filename) ? (
                <span className="text-muted-foreground">
                  {createElement(getFileIcon(activeFile.filename)!, { size: 14 })}
                </span>
              ) : (
                <FileCode size={14} className="text-muted-foreground shrink-0" />
              )}
              <span className="text-xs font-mono text-muted-foreground truncate">
                {activeFile.filename}
              </span>
            </>
          )}
        </div>
        <CodeSnippetCopyButton />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-1.5 py-1.5 border-b border-border/40 bg-muted/30">
      <div className="flex items-center gap-1 min-w-0 overflow-x-auto scrollbar-hide">
        {files.length > 1 ? (
          files.map((file) => {
            const isActive = file.language === value;
            const Icon = getFileIcon(file.filename);
            return (
              <button
                key={file.language}
                onClick={() => onValueChange(file.language)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shrink-0",
                  isActive
                    ? "bg-background text-foreground shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {Icon && <Icon size={13} className={cn(isActive ? "text-foreground" : "text-muted-foreground")} />}
                <span className="truncate max-w-[120px]">{file.filename}</span>
              </button>
            );
          })
        ) : activeFile ? (
          <div className="flex items-center gap-2 px-3 py-1">
            {getFileIcon(activeFile.filename) ? (
              <span className="text-muted-foreground">
                {createElement(getFileIcon(activeFile.filename)!, { size: 14 })}
              </span>
            ) : (
              <FileCode size={14} className="text-muted-foreground shrink-0" />
            )}
            <span className="text-xs font-medium text-foreground/80">{activeFile.filename}</span>
            <span className={cn(
              "ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border",
              languageColorMap[activeFile.language] || "bg-muted text-muted-foreground border-border"
            )}>
              {getLanguageLabel(activeFile.language)}
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <CodeSnippetCopyButton />
      </div>
    </div>
  );
};

export type CodeSnippetBodyProps = {
  showMore?: boolean;
  maxCollapsedHeight?: number;
  showLineNumbers?: boolean;
};

export const CodeSnippetBody = ({
  showMore = false,
  maxCollapsedHeight = 300,
  showLineNumbers = true,
}: CodeSnippetBodyProps) => {
  const { value, files } = useContext(CodeSnippetContext);
  const activeFile = files.find((f) => f.language === value) ?? files[0];
  const [expanded, setExpanded] = useState(!showMore);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showMore && contentRef.current) {
      const scrollH = contentRef.current.scrollHeight;
      setIsOverflowing(scrollH > maxCollapsedHeight);
    }
  }, [activeFile?.code, showMore, maxCollapsedHeight]);

  if (!activeFile) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Terminal size={24} className="opacity-30" />
        <span className="ml-2 text-sm">No code to display</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className={cn(
          "overflow-hidden transition-all duration-500 ease-in-out",
          !expanded && showMore && isOverflowing && "relative"
        )}
        style={{
          maxHeight: expanded ? "none" : showMore && isOverflowing ? maxCollapsedHeight : "none",
        }}
      >
        <CodeSnippetContent
          language={activeFile.language as BundledLanguage}
          showLineNumbers={showLineNumbers}
        >
          {activeFile.code}
        </CodeSnippetContent>
      </div>
      {!expanded && isOverflowing && (
        <>
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
          <button
            onClick={() => setExpanded(true)}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-background border border-border shadow-sm hover:shadow-md hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground"
          >
            <ChevronDown size={14} />
            Show more
          </button>
        </>
      )}
      {expanded && isOverflowing && (
        <div className="flex justify-center py-2 border-t border-border/40 bg-muted/20">
          <button
            onClick={() => setExpanded(false)}
            className="flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
          >
            <ChevronUp size={14} />
            Show less
          </button>
        </div>
      )}
    </div>
  );
};

export type CodeSnippetContentProps = {
  language?: BundledLanguage;
  showLineNumbers?: boolean;
  children: string;
};

const CodeSnippetFallback = ({ children: code }: { children: string }) => (
  <div className="relative">
    <pre className="w-full overflow-x-auto py-4">
      <code className="text-sm font-mono text-foreground/80 dark:text-gray-300 leading-relaxed block">
        {code.split("\n").map((line, i) => (
          <span className="line block px-5" key={i}>
            {line || "\u00A0"}
          </span>
        ))}
      </code>
    </pre>
  </div>
);

export const CodeSnippetContent = ({
  children,
  language,
  showLineNumbers = true,
}: CodeSnippetContentProps) => {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    highlight(children, language)
      .then(setHtml)
      .catch(console.error);
  }, [children, language]);

  if (!html) {
    return <CodeSnippetFallback>{children}</CodeSnippetFallback>;
  }

  return (
    <div
      className={cn(
        codeBlockClassName,
        darkModeClassNames,
        lineHighlightClassNames,
        showLineNumbers && lineNumberClassNames
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export type CodeSnippetCopyButtonProps = {
  timeout?: number;
};

export const CodeSnippetCopyButton = ({ timeout = 2000 }: CodeSnippetCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { value, files } = useContext(CodeSnippetContext);
  const activeFile = files.find((f) => f.language === value) ?? files[0];
  const code = activeFile?.code;

  const copyToClipboard = () => {
    if (typeof window === "undefined" || !navigator.clipboard.writeText || !code) return;
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), timeout);
    });
  };

  return (
    <button
      onClick={copyToClipboard}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
        isCopied
          ? "text-emerald-500 bg-emerald-500/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50 opacity-0 group-hover:opacity-100 focus:opacity-100"
      )}
      title="Copy code"
    >
      {isCopied ? (
        <>
          <CheckIcon size={13} />
          <span>Copied</span>
        </>
      ) : (
        <>
          <CopyIcon size={13} />
          <span className="hidden sm:inline">Copy</span>
        </>
      )}
    </button>
  );
};
