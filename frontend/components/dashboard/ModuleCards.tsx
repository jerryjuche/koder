"use client";

import React, { useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
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

const MODULE_IMAGE = "/modules/arrays-strings.png";

const MODULE_META: Record<string, ModuleMeta> = {
  "arrays-strings": {
    image: "/modules/arrays-strings.png",
    description: "Array operations, slice manipulation, capacity & len",
    barColor: "bg-gradient-to-r from-blue-500 to-cyan-400",
  },
  "strings-runes": {
    image: "/modules/strings-runes.png",
    description: "String manipulation, Unicode, runes, concatenation",
    barColor: "bg-gradient-to-r from-emerald-500 to-green-400",
  },
  "math-recursion": {
    image: "/modules/math-recursion.png",
    description: "Mathematical operations, recursive algorithms, number theory",
    barColor: "bg-gradient-to-r from-purple-500 to-violet-400",
  },
  "data-structures": {
    image: "/modules/data-structures.png",
    description: "Data structures: stacks, queues, linked lists, trees, heaps, graphs",
    barColor: "bg-gradient-to-r from-amber-500 to-yellow-400",
  },
  "sorting-searching": {
    image: "/modules/sorting-searching.png",
    description: "Sorting algorithms, binary search, two-pointer techniques",
    barColor: "bg-gradient-to-r from-rose-500 to-pink-400",
  },
  "hashmaps-sets": {
    image: "/modules/hashmaps-sets.png",
    description: "Key-value stores, set operations, frequency counting",
    barColor: "bg-gradient-to-r from-violet-500 to-purple-400",
  },
  concurrency: {
    image: "/modules/concurrency.png",
    description: "Goroutines, channels, mutexes, sync primitives",
    barColor: "bg-gradient-to-r from-cyan-500 to-sky-400",
  },
  "dynamic-programming": {
    image: "/modules/dynamic-programming.png",
    description: "Memoization, tabulation, optimization, subsequence problems",
    barColor: "bg-gradient-to-r from-fuchsia-500 to-pink-400",
  },
  "bit-manipulation": {
    image: "/modules/bit-manipulation.png",
    description: "Bitwise operations, flags, XOR tricks, bit masking",
    barColor: "bg-gradient-to-r from-slate-500 to-gray-400",
  },
  "trees-graphs": {
    image: "/modules/trees-graphs.png",
    description: "Binary trees, BST, graph traversals, shortest path",
    barColor: "bg-gradient-to-r from-green-500 to-emerald-400",
  },
  "error-handling": {
    image: "/modules/error-handling.png",
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
    image: "/modules/pointers.png",
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
    image: "/modules/linked-lists.png",
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

  if (error) {
    const color = MODULE_COLORS[alt] || FALLBACK_COLOR;
    return (
      <div className={cn("aspect-video flex items-center justify-center", color.bg)}>
        <span className={cn("text-3xl font-bold", color.text)}>
          {initial}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

function displayName(slug: string): string {
  return MODULE_DISPLAY_NAMES[slug] || slug;
}

interface ModuleCardsProps {
  modules: string[];
  moduleProgress: Record<string, { solved: number; total: number }>;
  onSelect: (module: string) => void;
}

export default React.memo(function ModuleCards({ modules, moduleProgress, onSelect }: ModuleCardsProps) {
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

        return (
          <button
            key={mod}
            onClick={() => onSelect(mod)}
            className="group w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
          >
            <Card
              style={{ animationDelay: `${i * 60}ms` }}
              className={cn(
                "relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 pt-0",
                "hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5",
                "h-full flex flex-col",
                isComplete && "ring-1 ring-emerald-500/20",
              )}
            >
              <div className="relative overflow-hidden aspect-video">
                <ModuleImage src={meta.image} alt={name} initial={name[0]} />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
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
                <CardDescription className="text-xs mt-1 leading-relaxed line-clamp-2">
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
                    "text-muted-foreground group-hover:text-primary",
                  )}>
                    {isComplete ? "Review problems" : "Start practicing"}
                  </span>
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200",
                    "bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary",
                    "group-hover:translate-x-0.5",
                    "text-muted-foreground",
                  )}>
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
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
