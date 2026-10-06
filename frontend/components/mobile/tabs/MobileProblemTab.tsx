"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Target,
  Copy,
  Check,
  Tag,
  Code2,
  ArrowRight,
} from "lucide-react";
import { Problem } from "@/lib/types";
import { cn, getDifficultyColor, getDifficultyLabel } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import { toast } from "@/lib/toast";

interface MobileProblemTabProps {
  problem: Problem;
  onStartCoding?: () => void;
}

export default function MobileProblemTab({
  problem,
  onStartCoding,
}: MobileProblemTabProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyExampleInput = (input: string, idx: number) => {
    navigator.clipboard.writeText(input).then(() => {
      setCopiedIdx(idx);
      toast.success("Example input copied");
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 custom-scrollbar pb-6">
      {/* Problem Header Info */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-xs font-bold px-2.5 py-0.5 rounded-full",
              getDifficultyColor(problem.difficulty),
            )}
          >
            {getDifficultyLabel(problem.difficulty)}
          </span>

          <span className="text-micro font-bold uppercase tracking-wider bg-brand-charcoal-card text-brand-offwhite-muted px-2 py-0.5 rounded border border-brand-charcoal-border">
            {problem.module}
          </span>

          {problem.solved && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-success bg-brand-success/10 px-2 py-0.5 rounded border border-brand-success/30">
              <CheckCircle2 size={12} /> Solved
            </span>
          )}

          <div className="ml-auto flex items-center gap-1 text-brand-muted-gold text-xs font-bold bg-brand-muted-gold/10 px-2.5 py-0.5 rounded border border-brand-muted-gold/20">
            <svg width="10" height="12" viewBox="0 0 12 16" fill="currentColor">
              <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
            </svg>
            +{problem.xpReward} XP
          </div>
        </div>

        <h1 className="text-xl font-bold text-brand-offwhite leading-tight">
          {problem.title}
        </h1>
      </div>

      {/* Problem metrics — one 44px strip, not three stacked cards. The cards
          spent ~72px of the first viewport to show three numbers and pushed the
          statement below the fold. */}
      <div className="grid grid-cols-3 items-center h-11 rounded-xl border border-brand-charcoal-border bg-brand-charcoal-panel divide-x divide-brand-charcoal-border">
        <div className="text-center">
          <span className="block text-sm font-bold text-brand-offwhite tabular-nums leading-tight">
            {problem.success_rate !== undefined
              ? `${Math.round(problem.success_rate)}%`
              : "—"}
          </span>
          <span className="block text-micro font-medium uppercase tracking-wider text-brand-offwhite-muted leading-tight">
            Accept.
          </span>
        </div>
        <div className="text-center">
          <span className="block text-sm font-bold text-brand-offwhite tabular-nums leading-tight">
            {problem.total_submissions || 0}
          </span>
          <span className="block text-micro font-medium uppercase tracking-wider text-brand-offwhite-muted leading-tight">
            Subs
          </span>
        </div>
        <div className="text-center">
          <span className="block text-sm font-bold text-brand-muted-gold tabular-nums leading-tight">
            {problem.estTimeMinutes ||
              (problem.difficulty === 1 ? 15 : problem.difficulty === 2 ? 30 : 60)}
            m
          </span>
          <span className="block text-micro font-medium uppercase tracking-wider text-brand-offwhite-muted leading-tight">
            Est. time
          </span>
        </div>
      </div>

      {/* Problem Statement Markdown */}
      <div className="space-y-2">
        <div className="text-micro font-bold uppercase tracking-wider text-brand-offwhite-muted flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-muted-gold shadow-[0_0_8px_rgba(238,197,126,0.8)]" />
          Problem Description
        </div>
        {/* No `prose` classes here: renderMarkdown() emits inline styles, so the
            Tailwind typography plugin can never reach the nodes it renders and
            the classes only ever added dead specificity. */}
        <div className="relative rounded-xl border border-brand-charcoal-border bg-brand-charcoal-card p-4 overflow-hidden text-sm leading-relaxed text-brand-offwhite">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-muted-gold to-transparent opacity-70" />
          <div
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(
                problem?.statement ||
                  problem?.descriptionMarkdown ||
                  "No problem statement available yet.",
              ),
            }}
          />
        </div>
      </div>

      {/* Examples Section */}
      {problem.examples && problem.examples.length > 0 && (
        <div className="space-y-3">
          <div className="text-micro font-bold uppercase tracking-wider text-brand-offwhite-muted flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-success shadow-[0_0_8px_rgba(62,207,142,0.8)]" />
            Examples ({problem.examples.length})
          </div>

          <div className="space-y-3">
            {problem.examples.map((ex, idx) => (
              <div
                key={ex.id || idx}
                className="rounded-xl border border-brand-charcoal-border bg-brand-charcoal-code overflow-hidden"
              >
                <div className="px-3.5 py-2 bg-brand-charcoal-card/70 border-b border-brand-charcoal-border/60 flex items-center justify-between">
                  <span className="text-micro font-bold tracking-wide text-brand-offwhite uppercase">
                    Example {idx + 1}
                  </span>
                  <button
                    onClick={() => copyExampleInput(ex.input, idx)}
                    className="flex h-9 items-center gap-1 px-2 -mr-2 text-micro text-brand-offwhite-muted hover:text-brand-offwhite transition-colors"
                    title="Copy input"
                  >
                    {copiedIdx === idx ? (
                      <Check size={12} className="text-brand-success" />
                    ) : (
                      <Copy size={12} />
                    )}
                    <span>{copiedIdx === idx ? "Copied" : "Copy Input"}</span>
                  </button>
                </div>

                <div className="p-3.5 space-y-3 text-xs">
                  <div>
                    <div className="text-micro font-bold uppercase tracking-wider text-brand-offwhite-muted mb-1.5">
                      Input
                    </div>
                    <div className="font-mono text-xs text-brand-offwhite bg-brand-charcoal-inset p-2.5 rounded-lg border border-brand-charcoal-border break-words whitespace-pre-wrap leading-relaxed">
                      {ex.input}
                    </div>
                  </div>

                  <div>
                    <div className="text-micro font-bold uppercase tracking-wider text-brand-offwhite-muted mb-1.5">
                      Expected Output
                    </div>
                    <div className="font-mono text-xs text-brand-success bg-brand-charcoal-inset p-2.5 rounded-lg border border-brand-success/20 break-words whitespace-pre-wrap leading-relaxed">
                      {ex.expected}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Constraints Section */}
      <div className="space-y-2">
        <div className="text-micro font-bold uppercase tracking-wider text-brand-offwhite-muted flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-charcoal-border" />
          Constraints &amp; Signatures
        </div>
        <div className="rounded-xl border border-brand-charcoal-border bg-brand-charcoal-card/60 p-3.5">
          <ul className="space-y-2 text-xs text-brand-offwhite-muted">
            {problem.param_types && problem.param_types.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-brand-muted-gold font-bold">◆</span>
                <span>
                  <strong className="text-brand-offwhite font-mono">Parameters:</strong>{" "}
                  {problem.param_types.join(", ")}
                </span>
              </li>
            )}
            {problem.return_type && (
              <li className="flex items-start gap-2">
                <span className="text-brand-muted-gold font-bold">◆</span>
                <span>
                  <strong className="text-brand-offwhite font-mono">Return Type:</strong>{" "}
                  {problem.return_type}
                </span>
              </li>
            )}
            {problem.constraints && (
              <li className="flex items-start gap-2">
                <span className="text-brand-muted-gold font-bold">◆</span>
                <span className="whitespace-pre-line">{problem.constraints}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Learning Objective */}
      {problem.learningObjective && (
        <div className="space-y-2">
          <div className="text-micro font-bold uppercase tracking-wider text-brand-offwhite-muted flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            Learning Objective
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-start gap-3">
            <div className="mt-0.5 shrink-0 w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Target size={14} className="text-emerald-400" />
            </div>
            <p className="text-xs text-brand-offwhite/90 leading-relaxed">
              {problem.learningObjective}
            </p>
          </div>
        </div>
      )}

      {/* Topics / Tags */}
      {problem.tags && problem.tags.length > 0 && (
        <div className="space-y-2">
          <div className="text-micro font-bold uppercase tracking-wider text-brand-offwhite-muted flex items-center gap-2">
            <Tag size={12} /> Topics
          </div>
          <div className="flex flex-wrap gap-1.5">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="text-micro uppercase tracking-wider bg-brand-muted-gold/10 text-brand-muted-gold px-2.5 py-1 rounded-full border border-brand-muted-gold/25 font-bold"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA Button to navigate directly to Code Editor */}
      {onStartCoding && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onStartCoding}
            className="w-full h-11 rounded-xl bg-brand-muted-gold hover:bg-brand-muted-gold-dark active:scale-[0.99] text-brand-charcoal-base font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-muted-gold/15 transition-all cursor-pointer"
          >
            <Code2 size={16} />
            <span>Open Code Editor</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
