"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Copy, Zap } from "lucide-react";
import { CommunitySolution } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import { CodeSnippet } from "@/components/application/code-snippet";
import { AnalysisModal } from "./AnalysisModal";
import {
  AIAnalysisPill,
  LikeButton,
  ProblemLink,
  SolutionAuthorRow,
  solutionFilename,
  solutionLanguage,
} from "./parts";

const languageDot: Record<string, string> = {
  go: "bg-cyan-400",
  python: "bg-sky-400",
};

const languageLabel: Record<string, string> = { go: "Go", python: "Python" };

const languagePill: Record<string, string> = {
  go: "bg-cyan-400/10 text-cyan-300 border-cyan-400/30",
  python: "bg-sky-400/10 text-sky-300 border-sky-400/30",
};

// Interactive descendants that must never toggle the accordion.
const INTERACTIVE_SELECTOR =
  'input, textarea, button, a, select, [data-interactive], [data-followup-drawer]';

export function SolutionCard({
  solution,
  rank,
  index = 0,
  onLike,
}: {
  solution: CommunitySolution;
  rank: number;
  index?: number;
  onLike: (id: string, currentlyLiked: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const toggleExpanded = () => setExpanded((v) => !v);

  const copyCode = async () => {
    if (!navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(solution.code);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: "easeOut" }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${expanded ? "Collapse" : "Expand"} solution by ${solution.user_name}`}
        onClick={(e) => {
          // Ignore clicks originating inside interactive children or the
          // follow-up drawer (its clicks bubble up through this root).
          const target = e.target as HTMLElement;
          if (target.closest(INTERACTIVE_SELECTOR)) return;
          toggleExpanded();
        }}
        onKeyDown={(e) => {
          // Only the root itself may trigger via keyboard — otherwise Enter
          // / Space typed in the chat composer would collapse the card.
          if (e.target !== e.currentTarget) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleExpanded();
          }
        }}
        className="group flex flex-col overflow-hidden rounded-lg border border-border bg-brand-charcoal-card transition-all duration-150 hover:border-white/15 hover:bg-[#222222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="w-8 shrink-0 text-center font-mono text-xs font-medium text-muted-foreground">
            #{String(rank).padStart(2, "0")}
          </span>

          <div className="shrink-0">
            <SolutionAuthorRow solution={solution} avatarSize="sm" />
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <ProblemLink solution={solution} />
            {solution.module && (
              <span className="hidden shrink-0 rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-flex">
                {solution.module}
              </span>
            )}
            {!expanded && (
              <AIAnalysisPill hasAnalysis onClick={() => setAnalysisOpen(true)} />
            )}
          </div>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className={cn("h-1.5 w-1.5 rounded-full", languageDot[solution.language] || "bg-muted-foreground")} />
              {languageLabel[solution.language] || solution.language}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-emerald-400">
              <Zap size={12} className="fill-emerald-400/60" />
              {solution.runtime_ms} ms
            </span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(solution.created_at)}
            </span>
          </div>

          <div className="shrink-0">
            <LikeButton solution={solution} onLike={onLike} size="xs" />
          </div>

          <span className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors group-hover:text-foreground">
            <ChevronDown
              size={16}
              className={cn("transition-transform duration-200", expanded && "rotate-180")}
            />
          </span>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="code"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div
                role="presentation"
                className="border-t border-border bg-brand-charcoal-panel p-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mockup-window">
                  <div className="mockup-window-titlebar">
                    <span className="mockup-window-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    <span className="truncate font-mono text-[11px] text-muted-foreground">
                      {solutionFilename(solution.language)}
                    </span>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase leading-none tracking-wide border",
                        languagePill[solution.language] ||
                          "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      {languageLabel[solution.language] || solution.language}
                    </span>
                    <button
                      type="button"
                      onClick={copyCode}
                      aria-label={copied ? "Copied" : "Copy solution code"}
                      title="Copy code"
                      className={cn(
                        "ml-auto flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                        copied
                          ? "text-emerald-400"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      {copied ? (
                        <>
                          <Check size={12} />
                          <span className="hidden sm:inline">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span className="hidden sm:inline">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <CodeSnippet
                    files={[
                      {
                        language: solutionLanguage(solution.language),
                        filename: solutionFilename(solution.language),
                        code: solution.code,
                      },
                    ]}
                    collapsed
                    maxHeight={200}
                    lineNumbers
                    hideHeader
                    style={{
                      border: "none",
                      borderRadius: 0,
                      boxShadow: "none",
                      background: "transparent",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnalysisModal
        solution={solution}
        open={analysisOpen}
        onOpenChange={setAnalysisOpen}
      />
    </motion.div>
  );
}
