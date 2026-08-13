"use client";

import { Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { CommunitySolution } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";
import { CodeSnippet } from "@/components/application/code-snippet";
import {
  LikeButton,
  SolutionAuthorRow,
  ProblemLink,
  solutionFilename,
  solutionLanguage,
} from "./parts";

const rankAccent = {
  1: {
    card: "border-amber-400/40 bg-gradient-to-b from-amber-500/5 via-brand-charcoal-card to-brand-charcoal-card hover:border-amber-400/70",
    pill: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  },
  2: {
    card: "border-slate-400/30 hover:border-slate-400/50",
    pill: "bg-slate-400/10 text-slate-300 border-slate-400/30",
  },
  3: {
    card: "border-amber-700/30 hover:border-amber-700/50",
    pill: "bg-amber-700/10 text-amber-600 border-amber-700/30",
  },
} as const;

const languageDot: Record<string, string> = {
  go: "bg-cyan-400",
  python: "bg-sky-400",
};

const languageLabel: Record<string, string> = { go: "Go", python: "Python" };

export function PodiumCard({
  solution,
  rank,
  index = 0,
  featured = false,
  onLike,
}: {
  solution: CommunitySolution;
  rank: 1 | 2 | 3;
  index?: number;
  featured?: boolean;
  onLike: (id: string, currentlyLiked: boolean) => void;
}) {
  const a = rankAccent[rank];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.45, ease: "easeOut" }}
      className={cn("h-full", featured && "lg:-mt-4")}
    >
      <div
        className={cn(
          "relative flex h-full flex-col justify-between rounded-xl border bg-brand-charcoal-card p-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/50",
          a.card,
        )}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-xs font-semibold",
                a.pill,
              )}
            >
              #{rank}
            </span>
            <LikeButton solution={solution} onLike={onLike} />
          </div>

          <div className="min-w-0">
            <SolutionAuthorRow solution={solution} avatarSize="sm" />
            <div className="mt-1.5 text-xs font-medium text-muted-foreground truncate">
              <ProblemLink solution={solution} />
            </div>
          </div>

          <div className="pt-1">
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
              hideCopy
              className="rounded-lg shadow-none"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs">
          <span className="inline-flex items-center gap-1 font-mono font-medium text-emerald-400">
            <Zap size={12} className="fill-emerald-400/60" />
            {solution.runtime_ms} ms
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full", languageDot[solution.language] || "bg-muted-foreground")} />
            {languageLabel[solution.language] || solution.language}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock size={12} />
            {formatRelativeTime(solution.created_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
