"use client";

import {
  transformerNotationDiff,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import { CheckIcon, CopyIcon, ChevronDown, ChevronUp, FileCode } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  type BundledLanguage,
  type CodeOptionsMultipleThemes,
  codeToHtml,
} from "shiki";
import { cn } from "@/lib/utils";

const langLabel: Record<string, string> = {
  go: "Go", py: "Python", python: "Python", js: "JS", javascript: "JS",
  ts: "TS", typescript: "TS", rs: "Rust", rust: "Rust",
  css: "CSS", html: "HTML", json: "JSON", md: "MD", markdown: "Markdown",
  sh: "Bash", bash: "Bash", docker: "Dockerfile",
};

const langColor: Record<string, string> = {
  go: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  python: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  py: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  javascript: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  js: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  typescript: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  ts: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  rust: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  rs: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  css: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  html: "text-red-500 bg-red-500/10 border-red-500/20",
  json: "text-green-500 bg-green-500/10 border-green-500/20",
  sh: "text-neutral-500 bg-neutral-500/10 border-neutral-500/20",
  bash: "text-neutral-500 bg-neutral-500/10 border-neutral-500/20",
  docker: "text-sky-500 bg-sky-500/10 border-sky-500/20",
};

const shikiClassNames = cn(
  "text-sm leading-relaxed",
  "[&_pre]:py-3 [&_pre]:px-0 [&_pre]:m-0",
  "[&_.shiki]:!bg-transparent",
  "[&_code]:w-full [&_code]:grid [&_code]:overflow-x-auto [&_code]:bg-transparent",
  "[&_.line]:px-4 [&_.line]:w-full [&_.line]:relative"
);

const lineNumbersCN = cn(
  "[&_code]:[counter-reset:line]",
  "[&_code]:[counter-increment:line_0]",
  "[&_.line]:before:[counter-increment:line]",
  "[&_.line]:before:content-[counter(line)]",
  "[&_.line]:before:inline-block",
  "[&_.line]:before:w-[1.5rem]",
  "[&_.line]:before:mr-4",
  "[&_.line]:before:text-xs",
  "[&_.line]:before:text-right",
  "[&_.line]:before:text-muted-foreground/25",
  "[&_.line]:before:font-mono",
  "[&_.line]:before:select-none"
);

const darkCN = cn(
  "dark:[&_.shiki]:!text-[var(--shiki-dark)]",
  "dark:[&_.shiki]:![font-style:var(--shiki-dark-font-style)]",
  "dark:[&_.shiki]:![font-weight:var(--shiki-dark-font-weight)]",
  "dark:[&_.shiki_span]:!text-[var(--shiki-dark)]",
  "dark:[&_.shiki_span]:![font-style:var(--shiki-dark-font-style)]",
  "dark:[&_.shiki_span]:![font-weight:var(--shiki-dark-font-weight)]"
);

function highlightCode(
  code: string,
  language?: BundledLanguage,
  themes?: CodeOptionsMultipleThemes["themes"]
) {
  return codeToHtml(code, {
    lang: language ?? "go",
    themes: themes ?? { light: "github-light", dark: "github-dark-default" },
    transformers: [
      transformerNotationDiff({ matchAlgorithm: "v3" }),
      transformerNotationHighlight({ matchAlgorithm: "v3" }),
    ],
  });
}

export type SnippetFile = {
  language: string;
  filename: string;
  code: string;
};

type SnippetCtx = { value: string; onValueChange: (v: string) => void; files: SnippetFile[] };
const SnippetCtx = createContext<SnippetCtx>({ value: "", onValueChange: () => {}, files: [] });

export type CodeSnippetProps = {
  files: SnippetFile[];
  value?: string;
  onValueChange?: (v: string) => void;
  collapsed?: boolean;
  maxHeight?: number;
  lineNumbers?: boolean;
  className?: string;
};

export function CodeSnippet({
  files,
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  collapsed = false,
  maxHeight = 180,
  lineNumbers = true,
  className,
}: CodeSnippetProps) {
  const [internal, setInternal] = useState(files[0]?.language ?? "");
  const activeValue = controlledValue ?? internal;
  const setValue = (v: string) => { setInternal(v); controlledOnValueChange?.(v); };
  const activeFile = files.find((f) => f.language === activeValue) ?? files[0];

  return (
    <SnippetCtx.Provider value={{ value: activeValue, onValueChange: setValue, files }}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm",
          className
        )}
      >
        {files.length > 1 ? (
          <div className="flex items-center justify-between px-1.5 py-1 border-b border-border/40 bg-muted/30">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {files.map((f) => {
                const isActive = f.language === activeValue;
                return (
                  <button
                    key={f.language}
                    onClick={() => setValue(f.language)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0",
                      isActive
                        ? "bg-background text-foreground shadow-sm border border-border/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <FileCode size={12} />
                    <span className="truncate max-w-[100px]">{f.filename}</span>
                  </button>
                );
              })}
            </div>
            <CopyButton />
          </div>
        ) : activeFile ? (
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40 bg-muted/30">
            <div className="flex items-center gap-2 min-w-0">
              <FileCode size={13} className="text-muted-foreground shrink-0" />
              <span className="text-xs font-mono text-muted-foreground truncate">{activeFile.filename}</span>
              <span className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border leading-none",
                langColor[activeFile.language] || "bg-muted text-muted-foreground border-border"
              )}>
                {langLabel[activeFile.language] || activeFile.language}
              </span>
            </div>
            <CopyButton />
          </div>
        ) : null}
        <SnippetBody collapsed={collapsed} maxHeight={maxHeight} lineNumbers={lineNumbers} />
      </div>
    </SnippetCtx.Provider>
  );
}

function SnippetBody({
  collapsed,
  maxHeight,
  lineNumbers,
}: {
  collapsed: boolean;
  maxHeight: number;
  lineNumbers: boolean;
}) {
  const { value, files } = useContext(SnippetCtx);
  const activeFile = files.find((f) => f.language === value) ?? files[0];
  const [expanded, setExpanded] = useState(!collapsed);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (collapsed && ref.current) setOverflowing(ref.current.scrollHeight > maxHeight);
  }, [activeFile?.code, collapsed, maxHeight]);

  if (!activeFile) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <FileCode size={20} className="opacity-30" />
        <span className="ml-2 text-xs">No code</span>
      </div>
    );
  }

  const showFade = !expanded && collapsed && overflowing;

  return (
    <div className="relative">
      <div
        ref={ref}
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: expanded ? "none" : maxHeight }}
      >
        <ShikiRenderer
          language={activeFile.language as BundledLanguage}
          lineNumbers={lineNumbers}
          code={activeFile.code}
        />
      </div>
      {showFade && (
        <>
          <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
          <button
            onClick={() => setExpanded(true)}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-background border border-border shadow-sm hover:shadow-md hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
          >
            <ChevronDown size={12} />
            Show more
          </button>
        </>
      )}
      {expanded && overflowing && (
        <div className="flex justify-center py-1.5 border-t border-border/40 bg-muted/20">
          <button
            onClick={() => setExpanded(false)}
            className="flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            <ChevronUp size={12} />
            Show less
          </button>
        </div>
      )}
    </div>
  );
}

function ShikiRenderer({
  code,
  language,
  lineNumbers,
}: {
  code: string;
  language: BundledLanguage;
  lineNumbers: boolean;
}) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    highlightCode(code, language).then(setHtml).catch(console.error);
  }, [code, language]);

  if (!html) {
    return (
      <div className="relative">
        <pre className="w-full overflow-x-auto py-3 m-0">
          <code className="text-sm font-mono text-foreground/80 dark:text-gray-300 leading-relaxed block">
            {code.split("\n").map((line, i) => (
              <span className="line block px-4" key={i}>
                {line || "\u00A0"}
              </span>
            ))}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <div
      className={cn(shikiClassNames, darkCN, lineNumbers && lineNumbersCN)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function CopyButton({ timeout = 2000 }: { timeout?: number }) {
  const [copied, setCopied] = useState(false);
  const { value, files } = useContext(SnippetCtx);
  const code = files.find((f) => f.language === value)?.code;

  const copy = () => {
    if (!navigator.clipboard?.writeText || !code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    });
  };

  return (
    <button
      onClick={copy}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all shrink-0",
        copied
          ? "text-emerald-500 bg-emerald-500/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50 opacity-0 group-hover:opacity-100 focus:opacity-100"
      )}
      title="Copy code"
    >
      {copied ? (
        <><CheckIcon size={12} /><span>Copied</span></>
      ) : (
        <><CopyIcon size={12} /><span className="hidden sm:inline">Copy</span></>
      )}
    </button>
  );
}
