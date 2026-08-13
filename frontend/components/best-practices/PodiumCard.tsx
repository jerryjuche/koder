"use client";

import { Crown } from "lucide-react";
import { motion } from "framer-motion";
import { CommunitySolution } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CodeSnippet } from "@/components/application/code-snippet";
import {
  LikeButton,
  RankBadge,
  SolutionAuthorRow,
  SolutionMetaRow,
  solutionFilename,
  solutionLanguage,
} from "./BestPracticeCard";

const accent = {
  1: {
    card: "border-amber-400/40 shadow-[0_0_48px_-16px_rgba(212,175,55,0.45)]",
    bar: "from-amber-300 via-amber-400 to-amber-600",
    label: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  },
  2: {
    card: "border-slate-300/30 shadow-[0_0_40px_-16px_rgba(148,163,184,0.4)]",
    bar: "from-slate-300 via-slate-300 to-slate-500",
    label: "text-slate-300 border-slate-300/30 bg-slate-300/10",
  },
  3: {
    card: "border-amber-700/40 shadow-[0_0_40px_-16px_rgba(180,83,9,0.4)]",
    bar: "from-amber-500 via-amber-700 to-amber-900",
    label: "text-amber-600 border-amber-600/30 bg-amber-600/10",
  },
} as const;

const placeLabel: Record<number, string> = {
  1: "Top Solution",
  2: "Runner-Up",
  3: "Third Place",
};

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
  const a = accent[rank];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.45, ease: "easeOut" }}
      className={cn("h-full", featured && "lg:-mt-4")}
    >
      <div
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-xl border bg-brand-charcoal-card transition-all duration-300 hover:-translate-y-1",
          a.card,
        )}
      >
        <div
          className={cn(
            "h-1 w-full bg-gradient-to-r",
            a.bar,
          )}
        />

        <div className="flex items-center gap-3 p-4 pb-3">
          <RankBadge rank={rank} size="lg" />
          <div className="flex-1 min-w-0">
            <SolutionAuthorRow solution={solution} />
          </div>
          <span
            className={cn(
              "hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border leading-none",
              a.label,
            )}
          >
            {rank === 1 && <Crown size={10} />}
            {placeLabel[rank]}
          </span>
          <LikeButton solution={solution} onLike={onLike} />
        </div>

        <div className="px-4 pb-3">
          <SolutionMetaRow solution={solution} />
        </div>

        <div className="px-4 pb-4 flex-1">
          <CodeSnippet
            files={[
              {
                language: solutionLanguage(solution.language),
                filename: solutionFilename(solution.language),
                code: solution.code,
              },
            ]}
            collapsed
            maxHeight={260}
            lineNumbers
            className="rounded-lg shadow-none"
          />
        </div>
      </div>
    </motion.div>
  );
}
