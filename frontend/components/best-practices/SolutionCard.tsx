"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Zap } from "lucide-react";
import { CommunitySolution } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import { CodeSnippet } from "@/components/application/code-snippet";
import { ExplainPanel } from "./ExplainPanel";
import {
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
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
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
                  className="rounded-lg shadow-none"
                />
                <ExplainPanel solution={solution} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
