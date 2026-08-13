"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Zap } from "lucide-react";
import { CommunitySolution } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/base/avatar/avatar";
import { ProfileHoverCard } from "@/components/profile/ProfileHoverCard";
import { CodeSnippet } from "@/components/application/code-snippet";
import { LikeButton, ProblemLink, solutionFilename, solutionLanguage } from "./parts";

const languageDot: Record<string, string> = {
  go: "bg-cyan-400",
  python: "bg-sky-400",
};

const languageLabel: Record<string, string> = { go: "Go", python: "Python" };

export function SolutionRow({
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
  const preview = solution.code.split("\n").find((l) => l.trim()) || solution.code;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: "easeOut" }}
    >
      <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-brand-charcoal-card transition-all duration-150 hover:border-white/15 hover:bg-[#222222]">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <span className="w-8 shrink-0 text-center font-mono text-xs font-medium text-muted-foreground">
            #{String(rank).padStart(2, "0")}
          </span>

          <ProfileHoverCard userId={solution.user_id} side="bottom" align="start">
            <div className="flex min-w-0 cursor-pointer items-center gap-2">
              <Avatar
                src={solution.user_avatar_url}
                name={solution.user_name}
                size="sm"
                verified={solution.verified}
              />
              <span className="truncate text-sm font-medium text-foreground">
                {solution.user_name}
              </span>
            </div>
          </ProfileHoverCard>

          <div className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">
            <ProblemLink solution={solution} />
          </div>

          <span className="hidden shrink-0 items-center gap-1.5 sm:inline-flex text-xs font-medium text-muted-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full", languageDot[solution.language] || "bg-muted-foreground")} />
            {languageLabel[solution.language] || solution.language}
          </span>

          <span className="hidden shrink-0 items-center gap-1 font-mono text-xs font-medium text-emerald-400 md:inline-flex">
            <Zap size={12} className="fill-emerald-400/60" />
            {solution.runtime_ms} ms
          </span>

          <div className="shrink-0">
            <LikeButton solution={solution} onLike={onLike} size="xs" />
          </div>

          <span className="hidden shrink-0 max-w-[240px] truncate font-mono text-xs text-muted-foreground opacity-70 transition-opacity group-hover:opacity-100 lg:block">
            {preview}
          </span>

          <button
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? "Hide code" : "Show code"}
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <ChevronDown
              size={16}
              className={cn("transition-transform duration-200", expanded && "rotate-180")}
            />
          </button>
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
              <div className="border-t border-border bg-brand-charcoal-panel p-3">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
