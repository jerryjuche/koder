"use client";

import React, { useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
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

const MODULE_META: Record<string, ModuleMeta> = {
  "Arrays & Slices": {
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=338&fit=crop&auto=format",
    description: "Array operations, slice manipulation, capacity & len",
    barColor: "bg-gradient-to-r from-blue-500 to-cyan-400",
  },
  "Strings & Runes": {
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=338&fit=crop&auto=format",
    description: "String manipulation, Unicode, runes, concatenation",
    barColor: "bg-gradient-to-r from-emerald-500 to-green-400",
  },
  "Math & Recursion": {
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=338&fit=crop&auto=format",
    description: "Mathematical operations, recursive algorithms, number theory",
    barColor: "bg-gradient-to-r from-purple-500 to-violet-400",
  },
  "Data Structures": {
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=338&fit=crop&auto=format",
    description: "Stacks, queues, linked lists, trees, heaps, graphs",
    barColor: "bg-gradient-to-r from-amber-500 to-yellow-400",
  },
  "Sorting & Searching": {
    image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=338&fit=crop&auto=format",
    description: "Sorting algorithms, binary search, two-pointer techniques",
    barColor: "bg-gradient-to-r from-rose-500 to-pink-400",
  },
  "Hash Maps & Sets": {
    image: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=600&h=338&fit=crop&auto=format",
    description: "Key-value stores, set operations, frequency counting",
    barColor: "bg-gradient-to-r from-violet-500 to-purple-400",
  },
  "Concurrency": {
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=338&fit=crop&auto=format",
    description: "Goroutines, channels, mutexes, sync primitives",
    barColor: "bg-gradient-to-r from-cyan-500 to-sky-400",
  },
  "Dynamic Programming": {
    image: "https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?w=600&h=338&fit=crop&auto=format",
    description: "Memoization, tabulation, optimization, subsequence problems",
    barColor: "bg-gradient-to-r from-fuchsia-500 to-pink-400",
  },
  "Bit Manipulation": {
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=338&fit=crop&auto=format",
    description: "Bitwise operations, flags, XOR tricks, bit masking",
    barColor: "bg-gradient-to-r from-slate-500 to-gray-400",
  },
  "Trees & Graphs": {
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=338&fit=crop&auto=format",
    description: "Binary trees, BST, graph traversals, shortest path",
    barColor: "bg-gradient-to-r from-green-500 to-emerald-400",
  },
  "Error Handling": {
    image: "https://images.unsplash.com/photo-1550433905-8c3a1e5f8d6e?w=600&h=338&fit=crop&auto=format",
    description: "Error types, custom errors, panics, recover",
    barColor: "bg-gradient-to-r from-red-500 to-rose-400",
  },
  "Testing": {
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=338&fit=crop&auto=format",
    description: "Table-driven tests, benchmarks, mocking, coverage",
    barColor: "bg-gradient-to-r from-teal-500 to-cyan-400",
  },
  "File I/O": {
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=338&fit=crop&auto=format",
    description: "Reading/writing files, formats, buffered I/O",
    barColor: "bg-gradient-to-r from-orange-500 to-amber-400",
  },
  "Networking": {
    image: "https://images.unsplash.com/photo-M5tzZtFCOfs?w=600&h=338&fit=crop&auto=format",
    description: "HTTP clients/servers, TCP, WebSockets, APIs",
    barColor: "bg-gradient-to-r from-indigo-500 to-blue-400",
  },
  "Interfaces & Generics": {
    image: "https://images.unsplash.com/photo-1611996575749-79a3a250f1f0?w=600&h=338&fit=crop&auto=format",
    description: "Interface patterns, type parameters, constraints",
    barColor: "bg-gradient-to-r from-pink-500 to-rose-400",
  },
  "Pointers": {
    image: "https://images.unsplash.com/photo-1513829593944-44d6b1f8f4e0?w=600&h=338&fit=crop&auto=format",
    description: "Pointer arithmetic, memory management, references",
    barColor: "bg-gradient-to-r from-stone-500 to-neutral-400",
  },
  "OOP & Composition": {
    image: "https://images.unsplash.com/photo-1523240804260-45f9b0b6f8b0?w=600&h=338&fit=crop&auto=format",
    description: "Struct embedding, methods, composition over inheritance",
    barColor: "bg-gradient-to-r from-lime-500 to-green-400",
  },
  "Design Patterns": {
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=338&fit=crop&auto=format",
    description: "Common Go idioms, factory, singleton, observer patterns",
    barColor: "bg-gradient-to-r from-yellow-500 to-amber-400",
  },
  "Encoding & Serialization": {
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=338&fit=crop&auto=format",
    description: "JSON, XML, Gob, protobuf, binary encoding",
    barColor: "bg-gradient-to-r from-sky-500 to-blue-400",
  },
  "Linked Lists": {
    image: "https://images.unsplash.com/photo-1477959850042-67f8c58e3cb3?w=600&h=338&fit=crop&auto=format",
    description: "Singly/doubly linked lists, cycle detection, mergers",
    barColor: "bg-gradient-to-r from-gray-500 to-slate-400",
  },
};

const FALLBACK: ModuleMeta = {
  image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&h=338&fit=crop&auto=format",
  description: "Programming fundamentals",
  barColor: "bg-gradient-to-r from-gray-500 to-slate-400",
};

const MODULE_COLORS: Record<string, string> = {
  "Arrays & Slices": "bg-blue-500/20 text-blue-400",
  "Strings & Runes": "bg-emerald-500/20 text-emerald-400",
  "Math & Recursion": "bg-purple-500/20 text-purple-400",
  "Data Structures": "bg-amber-500/20 text-amber-400",
  "Sorting & Searching": "bg-rose-500/20 text-rose-400",
  "Hash Maps & Sets": "bg-violet-500/20 text-violet-400",
  "Concurrency": "bg-cyan-500/20 text-cyan-400",
  "Dynamic Programming": "bg-fuchsia-500/20 text-fuchsia-400",
  "Bit Manipulation": "bg-slate-500/20 text-slate-400",
  "Trees & Graphs": "bg-green-500/20 text-green-400",
  "Error Handling": "bg-red-500/20 text-red-400",
  "Testing": "bg-teal-500/20 text-teal-400",
  "File I/O": "bg-orange-500/20 text-orange-400",
  "Networking": "bg-indigo-500/20 text-indigo-400",
  "Interfaces & Generics": "bg-pink-500/20 text-pink-400",
  "Pointers": "bg-stone-500/20 text-stone-400",
  "OOP & Composition": "bg-lime-500/20 text-lime-400",
  "Design Patterns": "bg-yellow-500/20 text-yellow-400",
  "Encoding & Serialization": "bg-sky-500/20 text-sky-400",
  "Linked Lists": "bg-gray-500/20 text-gray-400",
};

const FALLBACK_COLOR = "bg-gray-500/20 text-gray-400";

function ModuleImage({ src, alt, initial }: { src: string; alt: string; initial: string }) {
  const [error, setError] = useState(false);

  if (error) {
    const colorClass = MODULE_COLORS[alt] || FALLBACK_COLOR;
    return (
      <div className={cn("aspect-video flex items-center justify-center", colorClass.split(" ")[0])}>
        <span className={cn("text-3xl font-bold", colorClass.split(" ")[1])}>
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
                <ModuleImage src={meta.image} alt={mod} initial={mod[0]} />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
              </div>

              <CardHeader className="p-5 pb-2 relative z-10">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-bold text-foreground leading-tight">
                    {mod}
                  </CardTitle>
                  {isComplete && (
                    <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 h-5 border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                      Done
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed line-clamp-2">
                  {meta.description}
                </p>
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
