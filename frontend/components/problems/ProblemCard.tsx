"use client";

import Link from "next/link";
import Image from "next/image";
import { BarChart2, CheckCircle2, Clock, Code } from "lucide-react";
import { LanguageLogo, type Language } from "@/components/LanguageLogo";
import { renderMarkdown } from "@/lib/markdown";
import type { Problem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const CARD_BACKGROUND = "/ChatGPT%20Image%20Jul%209%2C%202026%2C%2009_07_32%20PM.png";

const DIFFICULTY_PILL: Record<number, string> = {
  1: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  2: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  3: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  4: "text-red-400 bg-red-500/10 border-red-500/25",
  5: "text-purple-400 bg-purple-500/10 border-purple-500/25",
};

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Beginner",
  2: "Easy",
  3: "Medium",
  4: "Hard",
  5: "Expert",
};

interface ProblemCardProps {
  problem: Problem;
  /** 1-based position rendered as the `#NNN` index on the card. */
  position: number;
  /** Staggered entrance delay in milliseconds. */
  delay?: number;
  /** Show the submissions / success-rate metrics next to the time chip. */
  metrics?: boolean;
}

export default function ProblemCard({
  problem,
  position,
  delay = 0,
  metrics = false,
}: ProblemCardProps) {
  const d = problem.difficulty as keyof typeof DIFFICULTY_PILL;
  const langs: Language[] = problem.language_versions
    ? Object.entries(problem.language_versions)
        .filter(([, spec]) => spec.func_name)
        .map(([lang]) => lang as Language)
    : [];

  return (
    <Link
      href={`/problems/${problem.slug}`}
      onClick={() =>
        sessionStorage.setItem(
          "return_to",
          window.location.href.replace(window.location.origin, ""),
        )
      }
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
      style={{ animationFillMode: "both", animationDelay: `${delay}ms` }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300 h-full flex flex-col rounded-xl border shadow-sm hover:shadow-xl hover:shadow-primary/8",
          "hover:-translate-y-1.5 hover:border-primary/30",
          "animate-in fade-in slide-in-from-bottom-2",
          problem.solved && "border-emerald-500/30 hover:border-emerald-500/50",
        )}
      >
        {/* Background image with gradient fade */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <Image
            src={CARD_BACKGROUND}
            alt=""
            fill
            className="object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300 scale-105 group-hover:scale-100"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-[#141414]/95" />
        </div>

        {/* Solved accent line */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-0.5 transition-colors duration-300 z-10",
            problem.solved ? "bg-emerald-500" : "bg-transparent",
          )}
        />

        {/* Header */}
        <CardHeader className="flex-row items-start justify-between p-5 pb-2 space-y-0 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground/50 font-bold tabular-nums">
              #{String(position).padStart(3, "0")}
            </span>
            <span
              className={cn(
                "text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider",
                DIFFICULTY_PILL[d] || DIFFICULTY_PILL[3],
              )}
            >
              {DIFFICULTY_LABEL[d] || "Medium"}
            </span>
          </div>
          {problem.solved ? (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/15 mt-0.5 shrink-0" />
          )}
        </CardHeader>

        {/* Body */}
        <CardContent className="px-5 pb-2 flex-1 flex flex-col relative z-10">
          <div className="flex items-start justify-between gap-3 mb-2">
            <CardTitle className="text-base font-extrabold md:text-lg tracking-tight text-foreground group-hover:text-brand-muted-gold transition-colors leading-snug">
              {problem.title}
            </CardTitle>
            {langs.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                {langs.map((lang) => (
                  <span
                    key={lang}
                    className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-background/40 backdrop-blur-[2px]"
                  >
                    <LanguageLogo language={lang} size={20} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="text-sm md:text-base text-muted-foreground/80 leading-relaxed line-clamp-2 mb-auto space-y-0 [&_p]:inline [&_p]:m-0 [&_p]:text-muted-foreground/80 [&_strong]:text-foreground/80 [&_code]:text-[13px] [&_code]:bg-white/[0.04] [&_code]:px-1 [&_code]:py-[1px] [&_code]:rounded [&_code]:font-mono [&_ul]:inline [&_ul]:m-0 [&_ol]:inline [&_ol]:m-0 [&_li]:inline [&_li]:m-0 [&_h1]:inline [&_h2]:inline [&_h3]:inline [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_h1]:text-inherit [&_h2]:text-inherit [&_h3]:text-inherit">
            {problem.statement ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(
                    problem.statement.split(/\n\s*\n/)[0],
                  ).replace(/\sstyle="[^"]*"/g, ""),
                }}
              />
            ) : (
              <span className="italic">No description</span>
            )}
          </div>

          {problem.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {problem.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-muted-foreground/80 bg-background/40 px-2 py-0.5 rounded-md border border-border/20 backdrop-blur-[2px]"
                >
                  {tag}
                </span>
              ))}
              {problem.tags.length > 3 && (
                <span className="text-xs text-muted-foreground/60 font-semibold px-1">
                  +{problem.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="px-5 py-3.5 border-t border-border/20 relative z-10 bg-background/40 backdrop-blur-[2px]">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 text-xs text-muted-foreground/80 font-semibold">
              {metrics && (
                <>
                  <span className="flex items-center gap-1.5">
                    <Code size={13} className="shrink-0 text-muted-foreground/50" />
                    {problem.total_submissions || 0}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BarChart2 size={13} className="shrink-0 text-muted-foreground/50" />
                    {Math.round(problem.success_rate || 0)}%
                  </span>
                </>
              )}
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="shrink-0 text-muted-foreground/50" />
                {problem.estTimeMinutes || 0}m
              </span>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md transition-all",
                problem.solved
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-primary/5 text-primary group-hover:bg-primary/10",
              )}
            >
              <svg width="10" height="13" viewBox="0 0 12 16" fill="currentColor" className="shrink-0">
                <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
              </svg>
              <span className="font-bold text-xs tabular-nums">+{problem.xpReward ?? 0}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}