"use client";

import React from "react";
import {
  ArrowRight,
} from "lucide-react";
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
  accent: string;
  gradientFrom: string;
  gradientTo: string;
  barColor: string;
  badgeVariant: "default" | "secondary" | "outline";
};

const slug = (name: string) =>
  name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const MODULE_META: Record<string, ModuleMeta> = {
  "Arrays & Slices": {
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=338&fit=crop&auto=format",
    description: "Array operations, slice manipulation, capacity & len",
    accent: "blue", gradientFrom: "from-blue-500", gradientTo: "to-cyan-400",
    barColor: "bg-gradient-to-r from-blue-500 to-cyan-400", badgeVariant: "secondary",
  },
  "Strings & Runes": {
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=338&fit=crop&auto=format",
    description: "String manipulation, Unicode, runes, concatenation",
    accent: "emerald", gradientFrom: "from-emerald-500", gradientTo: "to-green-400",
    barColor: "bg-gradient-to-r from-emerald-500 to-green-400", badgeVariant: "secondary",
  },
  "Math & Recursion": {
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=338&fit=crop&auto=format",
    description: "Mathematical operations, recursive algorithms, number theory",
    accent: "purple", gradientFrom: "from-purple-500", gradientTo: "to-violet-400",
    barColor: "bg-gradient-to-r from-purple-500 to-violet-400", badgeVariant: "secondary",
  },
  "Data Structures": {
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=338&fit=crop&auto=format",
    description: "Stacks, queues, linked lists, trees, heaps, graphs",
    accent: "amber", gradientFrom: "from-amber-500", gradientTo: "to-yellow-400",
    barColor: "bg-gradient-to-r from-amber-500 to-yellow-400", badgeVariant: "secondary",
  },
  "Sorting & Searching": {
    image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=338&fit=crop&auto=format",
    description: "Sorting algorithms, binary search, two-pointer techniques",
    accent: "rose", gradientFrom: "from-rose-500", gradientTo: "to-pink-400",
    barColor: "bg-gradient-to-r from-rose-500 to-pink-400", badgeVariant: "secondary",
  },
  "Hash Maps & Sets": {
    image: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=600&h=338&fit=crop&auto=format",
    description: "Key-value stores, set operations, frequency counting",
    accent: "violet", gradientFrom: "from-violet-500", gradientTo: "to-purple-400",
    barColor: "bg-gradient-to-r from-violet-500 to-purple-400", badgeVariant: "secondary",
  },
  "Concurrency": {
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=338&fit=crop&auto=format",
    description: "Goroutines, channels, mutexes, sync primitives",
    accent: "cyan", gradientFrom: "from-cyan-500", gradientTo: "to-sky-400",
    barColor: "bg-gradient-to-r from-cyan-500 to-sky-400", badgeVariant: "secondary",
  },
  "Dynamic Programming": {
    image: "https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?w=600&h=338&fit=crop&auto=format",
    description: "Memoization, tabulation, optimization, subsequence problems",
    accent: "fuchsia", gradientFrom: "from-fuchsia-500", gradientTo: "to-pink-400",
    barColor: "bg-gradient-to-r from-fuchsia-500 to-pink-400", badgeVariant: "secondary",
  },
  "Bit Manipulation": {
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=338&fit=crop&auto=format",
    description: "Bitwise operations, flags, XOR tricks, bit masking",
    accent: "slate", gradientFrom: "from-slate-500", gradientTo: "to-gray-400",
    barColor: "bg-gradient-to-r from-slate-500 to-gray-400", badgeVariant: "secondary",
  },
  "Trees & Graphs": {
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=338&fit=crop&auto=format",
    description: "Binary trees, BST, graph traversals, shortest path",
    accent: "green", gradientFrom: "from-green-500", gradientTo: "to-emerald-400",
    barColor: "bg-gradient-to-r from-green-500 to-emerald-400", badgeVariant: "secondary",
  },
  "Error Handling": {
    image: "https://images.unsplash.com/photo-1550433905-8c3a1e5f8d6e?w=600&h=338&fit=crop&auto=format",
    description: "Error types, custom errors, panics, recover",
    accent: "red", gradientFrom: "from-red-500", gradientTo: "to-rose-400",
    barColor: "bg-gradient-to-r from-red-500 to-rose-400", badgeVariant: "secondary",
  },
  "Testing": {
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=338&fit=crop&auto=format",
    description: "Table-driven tests, benchmarks, mocking, coverage",
    accent: "teal", gradientFrom: "from-teal-500", gradientTo: "to-cyan-400",
    barColor: "bg-gradient-to-r from-teal-500 to-cyan-400", badgeVariant: "secondary",
  },
  "File I/O": {
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=338&fit=crop&auto=format",
    description: "Reading/writing files, formats, buffered I/O",
    accent: "orange", gradientFrom: "from-orange-500", gradientTo: "to-amber-400",
    barColor: "bg-gradient-to-r from-orange-500 to-amber-400", badgeVariant: "secondary",
  },
  "Networking": {
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=338&fit=crop&auto=format",
    description: "HTTP clients/servers, TCP, WebSockets, APIs",
    accent: "indigo", gradientFrom: "from-indigo-500", gradientTo: "to-blue-400",
    barColor: "bg-gradient-to-r from-indigo-500 to-blue-400", badgeVariant: "secondary",
  },
  "Interfaces & Generics": {
    image: "https://images.unsplash.com/photo-1611996575749-79a3a250f1f0?w=600&h=338&fit=crop&auto=format",
    description: "Interface patterns, type parameters, constraints",
    accent: "pink", gradientFrom: "from-pink-500", gradientTo: "to-rose-400",
    barColor: "bg-gradient-to-r from-pink-500 to-rose-400", badgeVariant: "secondary",
  },
  "Pointers": {
    image: "https://images.unsplash.com/photo-1513829593944-44d6b1f8f4e0?w=600&h=338&fit=crop&auto=format",
    description: "Pointer arithmetic, memory management, references",
    accent: "stone", gradientFrom: "from-stone-500", gradientTo: "to-neutral-400",
    barColor: "bg-gradient-to-r from-stone-500 to-neutral-400", badgeVariant: "secondary",
  },
  "OOP & Composition": {
    image: "https://images.unsplash.com/photo-1523240804260-45f9b0b6f8b0?w=600&h=338&fit=crop&auto=format",
    description: "Struct embedding, methods, composition over inheritance",
    accent: "lime", gradientFrom: "from-lime-500", gradientTo: "to-green-400",
    barColor: "bg-gradient-to-r from-lime-500 to-green-400", badgeVariant: "secondary",
  },
  "Design Patterns": {
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=338&fit=crop&auto=format",
    description: "Common Go idioms, factory, singleton, observer patterns",
    accent: "yellow", gradientFrom: "from-yellow-500", gradientTo: "to-amber-400",
    barColor: "bg-gradient-to-r from-yellow-500 to-amber-400", badgeVariant: "secondary",
  },
  "Encoding & Serialization": {
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=338&fit=crop&auto=format",
    description: "JSON, XML, Gob, protobuf, binary encoding",
    accent: "sky", gradientFrom: "from-sky-500", gradientTo: "to-blue-400",
    barColor: "bg-gradient-to-r from-sky-500 to-blue-400", badgeVariant: "secondary",
  },
  "Linked Lists": {
    image: "https://images.unsplash.com/photo-1477959850042-67f8c58e3cb3?w=600&h=338&fit=crop&auto=format",
    description: "Singly/doubly linked lists, cycle detection, mergers",
    accent: "gray", gradientFrom: "from-gray-500", gradientTo: "to-slate-400",
    barColor: "bg-gradient-to-r from-gray-500 to-slate-400", badgeVariant: "secondary",
  },
};

const FALLBACK: ModuleMeta = {
  image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&h=338&fit=crop&auto=format",
  description: "Programming fundamentals",
  accent: "gray", gradientFrom: "from-gray-500", gradientTo: "to-slate-400",
  barColor: "bg-gradient-to-r from-gray-500 to-slate-400", badgeVariant: "secondary",
};

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
          <ArrowRight size={24} className="text-muted-foreground/40" />
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
                <img
                  src={meta.image}
                  alt={mod}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
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

                <div className="h-2 bg-muted/80 rounded-full overflow-hidden ring-1 ring-white/[0.03]">
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
