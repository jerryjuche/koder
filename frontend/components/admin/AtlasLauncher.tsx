"use client";

import Link from "next/link";
import { ArrowUpRight, BrainCircuit, Sparkles } from "lucide-react";

// Compact entry point on /admin. The real console lives at /admin/insights so
// the dashboard stays a dashboard instead of hosting a chat window inside it.
export default function AtlasLauncher() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-cool-accent/25 bg-brand-charcoal-card">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-56 bg-gradient-to-l from-brand-cool-accent/10 to-transparent" />
      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cool-accent/25 to-brand-muted-gold/15 ring-1 ring-brand-cool-accent/25">
            <BrainCircuit size={20} className="text-brand-cool-accent" />
          </div>
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-brand-offwhite">Atlas</h2>
              <span className="rounded-full border border-brand-cool-accent/25 bg-brand-cool-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-cool-accent">
                AI analyst
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-brand-offwhite-muted/80">
              Ask about XP, top performers, streaks, at-risk students, skill gaps
              and curriculum progress. Every number is read from the database —
              Atlas explains it, charts it and remembers the conversation.
            </p>
          </div>
        </div>

        <Link
          href="/admin/insights"
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-muted-gold px-4 py-2.5 text-sm font-semibold text-brand-charcoal-base transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-muted-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-charcoal-card"
        >
          <Sparkles size={15} />
          Open Atlas
          <ArrowUpRight
            size={15}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </div>
  );
}
