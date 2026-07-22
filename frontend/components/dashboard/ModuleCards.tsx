"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, BookOpen, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ModuleMeta = {
  image: string;
  description: string;
  barColor: string;
};

const MODULE_IMAGE = "/modules/arrays-strings.webp";

const MODULE_META: Record<string, ModuleMeta> = {
  "arrays-strings": {
    image: "/modules/arrays-strings.webp",
    description: "Array operations, slice manipulation, capacity & len",
    barColor: "bg-gradient-to-r from-blue-500 to-cyan-400",
  },
  "strings-runes": {
    image: "/modules/strings-runes.webp",
    description: "String manipulation, Unicode, runes, concatenation",
    barColor: "bg-gradient-to-r from-emerald-500 to-green-400",
  },
  "math-recursion": {
    image: "/modules/math-recursion.webp",
    description: "Mathematical operations, recursive algorithms, number theory",
    barColor: "bg-gradient-to-r from-purple-500 to-violet-400",
  },
  "data-structures": {
    image: "/modules/data-structures.webp",
    description: "Data structures: stacks, queues, linked lists, trees, heaps, graphs",
    barColor: "bg-gradient-to-r from-amber-500 to-yellow-400",
  },
  "sorting-searching": {
    image: "/modules/sorting-searching.webp",
    description: "Sorting algorithms, binary search, two-pointer techniques",
    barColor: "bg-gradient-to-r from-rose-500 to-pink-400",
  },
  "hashmaps-sets": {
    image: "/modules/hashmaps-sets.webp",
    description: "Key-value stores, set operations, frequency counting",
    barColor: "bg-gradient-to-r from-violet-500 to-purple-400",
  },
  concurrency: {
    image: "/modules/concurrency.webp",
    description: "Goroutines, channels, mutexes, sync primitives",
    barColor: "bg-gradient-to-r from-cyan-500 to-sky-400",
  },
  "dynamic-programming": {
    image: "/modules/dynamic-programming.webp",
    description: "Memoization, tabulation, optimization, subsequence problems",
    barColor: "bg-gradient-to-r from-fuchsia-500 to-pink-400",
  },
  "bit-manipulation": {
    image: "/modules/bit-manipulation.webp",
    description: "Bitwise operations, flags, XOR tricks, bit masking",
    barColor: "bg-gradient-to-r from-slate-500 to-gray-400",
  },
  "trees-graphs": {
    image: "/modules/trees-graphs.webp",
    description: "Binary trees, BST, graph traversals, shortest path",
    barColor: "bg-gradient-to-r from-green-500 to-emerald-400",
  },
  "error-handling": {
    image: "/modules/error-handling.webp",
    description: "Error types, custom errors, panics, recover",
    barColor: "bg-gradient-to-r from-red-500 to-rose-400",
  },
  testing: {
    image: MODULE_IMAGE,
    description: "Table-driven tests, benchmarks, mocking, coverage",
    barColor: "bg-gradient-to-r from-teal-500 to-cyan-400",
  },
  "file-io": {
    image: MODULE_IMAGE,
    description: "Reading/writing files, formats, buffered I/O",
    barColor: "bg-gradient-to-r from-orange-500 to-amber-400",
  },
  networking: {
    image: MODULE_IMAGE,
    description: "HTTP clients/servers, TCP, WebSockets, APIs",
    barColor: "bg-gradient-to-r from-indigo-500 to-blue-400",
  },
  "interfaces-generics": {
    image: MODULE_IMAGE,
    description: "Interface patterns, type parameters, constraints",
    barColor: "bg-gradient-to-r from-pink-500 to-rose-400",
  },
  pointers: {
    image: "/modules/pointers.webp",
    description: "Pointer arithmetic, memory management, references",
    barColor: "bg-gradient-to-r from-stone-500 to-neutral-400",
  },
  "oop-composition": {
    image: MODULE_IMAGE,
    description: "Struct embedding, methods, composition over inheritance",
    barColor: "bg-gradient-to-r from-lime-500 to-green-400",
  },
  "design-patterns": {
    image: MODULE_IMAGE,
    description: "Common Go idioms, factory, singleton, observer patterns",
    barColor: "bg-gradient-to-r from-yellow-500 to-amber-400",
  },
  "encoding-serialization": {
    image: MODULE_IMAGE,
    description: "JSON, XML, Gob, protobuf, binary encoding",
    barColor: "bg-gradient-to-r from-sky-500 to-blue-400",
  },
  "linked-lists": {
    image: "/modules/linked-lists.webp",
    description: "Singly/doubly linked lists, cycle detection, mergers",
    barColor: "bg-gradient-to-r from-gray-500 to-slate-400",
  },
};

const MODULE_DISPLAY_NAMES: Record<string, string> = {
  "arrays-strings": "Arrays & Strings",
  "strings-runes": "Strings & Runes",
  "math-recursion": "Math & Recursion",
  "data-structures": "Data Structures",
  "sorting-searching": "Sorting & Searching",
  "hashmaps-sets": "Hash Maps & Sets",
  concurrency: "Concurrency",
  "dynamic-programming": "Dynamic Programming",
  "bit-manipulation": "Bit Manipulation",
  "trees-graphs": "Trees & Graphs",
  "error-handling": "Error Handling",
  testing: "Testing",
  "file-io": "File I/O",
  networking: "Networking",
  "interfaces-generics": "Interfaces & Generics",
  pointers: "Pointers",
  "oop-composition": "OOP & Composition",
  "design-patterns": "Design Patterns",
  "encoding-serialization": "Encoding & Serialization",
  "linked-lists": "Linked Lists",
};

const FALLBACK: ModuleMeta = {
  image: MODULE_IMAGE,
  description: "Programming fundamentals",
  barColor: "bg-gradient-to-r from-gray-500 to-slate-400",
};

const MODULE_COLORS: Record<string, { bg: string; text: string }> = {
  "arrays-strings": { bg: "bg-blue-500/20", text: "text-blue-400" },
  "strings-runes": { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  "math-recursion": { bg: "bg-purple-500/20", text: "text-purple-400" },
  "data-structures": { bg: "bg-amber-500/20", text: "text-amber-400" },
  "sorting-searching": { bg: "bg-rose-500/20", text: "text-rose-400" },
  "hashmaps-sets": { bg: "bg-violet-500/20", text: "text-violet-400" },
  concurrency: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
  "dynamic-programming": { bg: "bg-fuchsia-500/20", text: "text-fuchsia-400" },
  "bit-manipulation": { bg: "bg-slate-500/20", text: "text-slate-400" },
  "trees-graphs": { bg: "bg-green-500/20", text: "text-green-400" },
  "error-handling": { bg: "bg-red-500/20", text: "text-red-400" },
  testing: { bg: "bg-teal-500/20", text: "text-teal-400" },
  "file-io": { bg: "bg-orange-500/20", text: "text-orange-400" },
  networking: { bg: "bg-indigo-500/20", text: "text-indigo-400" },
  "interfaces-generics": { bg: "bg-pink-500/20", text: "text-pink-400" },
  pointers: { bg: "bg-stone-500/20", text: "text-stone-400" },
  "oop-composition": { bg: "bg-lime-500/20", text: "text-lime-400" },
  "design-patterns": { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  "encoding-serialization": { bg: "bg-sky-500/20", text: "text-sky-400" },
  "linked-lists": { bg: "bg-gray-500/20", text: "text-gray-400" },
};

const FALLBACK_COLOR = { bg: "bg-gray-500/20", text: "text-gray-400" };

function ModuleImage({ src, alt, initial }: { src: string; alt: string; initial: string }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const color = MODULE_COLORS[alt] || FALLBACK_COLOR;

  if (error) {
    return (
      <div className={cn("aspect-video flex items-center justify-center", color.bg)}>
        <span className={cn("text-3xl font-bold", color.text)}>
          {initial}
        </span>
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden">
      {!loaded && (
        <div className={cn("absolute inset-0 flex items-center justify-center animate-pulse", color.bg)}>
          <span className={cn("text-3xl font-bold", color.text)}>
            {initial}
          </span>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={400}
        height={225}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          "h-full w-full object-cover transition-all duration-500 group-hover:scale-105",
        )}
      />
    </div>
  );
}

function displayName(slug: string): string {
  return MODULE_DISPLAY_NAMES[slug] || slug;
}

interface ModuleCardsProps {
  modules: string[];
  moduleProgress: Record<string, { solved: number; total: number }>;
  lockedModules: Set<string>;
  onSelect: (module: string) => void;
}

export default React.memo(function ModuleCards({ modules, moduleProgress, lockedModules, onSelect }: ModuleCardsProps) {
  if (modules.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed border-border/50 bg-card/50">
        <div className="mx-auto w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
          <BookOpen size={24} className="text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground font-medium">No modules available yet.</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Modules will appear once problems are loaded.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {modules.map((mod, i) => {
        const name = displayName(mod);
        const meta = MODULE_META[mod] || FALLBACK;
        const progress = moduleProgress[mod];
        const solved = progress?.solved ?? 0;
        const total = progress?.total ?? 0;
        const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
        const isComplete = solved > 0 && solved === total;
        const isLocked = lockedModules.has(mod);

        return (
          <button
            key={mod}
            onClick={() => { if (!isLocked) onSelect(mod); }}
            disabled={isLocked}
            className={cn(
              "group w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl",
              isLocked && "cursor-not-allowed",
            )}
          >
            <Card
              style={{ animationDelay: `${i * 60}ms` }}
              className={cn(
                "relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 pt-0",
                "hover:-translate-y-1.5 hover:shadow-xl",
                "h-full flex flex-col",
                isComplete && "ring-1 ring-emerald-500/20",
                isLocked && "border-amber-500/20 hover:shadow-amber-500/10 hover:border-amber-500/30",
              )}
            >
              <div className="relative">
                <ModuleImage src={meta.image} alt={name} initial={name[0]} />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent pointer-events-none" />
                {isLocked && (
                  <>
                    <div className="absolute top-2 right-2 z-20 w-7 h-7 rounded-lg bg-amber-500/20 backdrop-blur-sm flex items-center justify-center shadow-sm">
                      <Lock size={14} className="text-amber-400" />
                    </div>
                    <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-amber-950/20 backdrop-blur-[1px]">
                      <div className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-950/70 backdrop-blur-sm border border-amber-500/30 shadow-lg">
                        <Lock size={18} className="text-amber-400" />
                        <span className="text-[11px] font-bold text-amber-300 tracking-wide uppercase">Locked</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <CardHeader className="p-5 pb-2 relative z-10">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-bold text-foreground leading-tight">
                    {name}
                  </CardTitle>
                  {isComplete && (
                    <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 h-5 border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                      Done
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs mt-1 leading-relaxed line-clamp-2 whitespace-pre-line">
                  {meta.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-5 pb-0 relative z-10 flex-1">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <span className="text-xs text-muted-foreground font-medium">
                    {total} {total === 1 ? "problem" : "problems"}
                  </span>
                  {total > 0 && (
                    <span className={cn(
                      "text-xs font-bold tabular-nums",
                      pct === 100 ? "text-emerald-400" : pct > 0 ? "text-foreground" : "text-muted-foreground/50",
                    )}>
                      {pct}%
                    </span>
                  )}
                </div>

                <div
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2 bg-muted/80 rounded-full overflow-hidden ring-1 ring-white/[0.03]"
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out",
                      meta.barColor,
                      pct > 0 && "shadow-sm",
                      isComplete && "shadow-[0_0_8px_rgba(52,211,153,0.3)]",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {total > 0 && (
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <div className="flex-1 flex items-center gap-1">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        solved > 0 ? "bg-emerald-500" : "bg-muted-foreground/20",
                      )} />
                      <span className={cn(
                        "text-[11px] font-medium",
                        solved > 0 ? "text-emerald-400/80" : "text-muted-foreground/40",
                      )}>
                        {solved} solved
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
                      <span className="text-[11px] text-muted-foreground/40 font-medium">
                        {total - solved} remaining
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-5 pt-3.5 relative z-10">
                <div className="flex items-center justify-between w-full">
                  <span className={cn(
                    "text-xs font-semibold tracking-wide transition-colors duration-200",
                    isLocked
                      ? "text-amber-400/60"
                      : "text-muted-foreground group-hover:text-primary",
                  )}>
                    {isLocked ? "Locked by instructor" : isComplete ? "Review problems" : "Start practicing"}
                  </span>
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200",
                    isLocked
                      ? "bg-amber-500/10 text-amber-400/60"
                      : "bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary group-hover:translate-x-0.5 text-muted-foreground",
                  )}>
                    {isLocked ? <Lock size={12} /> : <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />}
                  </div>
                </div>
              </CardFooter>
            </Card>
          </button>
        );
      })}
    </div>
  );
});
