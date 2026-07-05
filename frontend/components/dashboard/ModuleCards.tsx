"use client";

import React from "react";
import {
  LayoutList,
  Type,
  Calculator,
  Binary,
  ArrowUpDown,
  Hash,
  GitFork,
  Blocks,
  Cpu,
  GitBranch,
  ShieldAlert,
  FlaskConical,
  FileSpreadsheet,
  Globe,
  Puzzle,
  Crosshair,
  Box,
  Sparkles,
  Braces,
  Link,
  LucideIcon,
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
  icon: LucideIcon;
  description: string;
  accent: string;
  gradientFrom: string;
  gradientTo: string;
  iconBg: string;
  iconColor: string;
  barColor: string;
  badgeVariant: "default" | "secondary" | "outline";
};

const MODULE_META: Record<string, ModuleMeta> = {
  "Arrays & Slices": {
    icon: LayoutList, description: "Array operations, slice manipulation, capacity & len",
    accent: "blue", gradientFrom: "from-blue-500", gradientTo: "to-cyan-400",
    iconBg: "bg-gradient-to-br from-blue-500/20 to-cyan-400/10", iconColor: "text-blue-400",
    barColor: "bg-gradient-to-r from-blue-500 to-cyan-400", badgeVariant: "secondary",
  },
  "Strings & Runes": {
    icon: Type, description: "String manipulation, Unicode, runes, concatenation",
    accent: "emerald", gradientFrom: "from-emerald-500", gradientTo: "to-green-400",
    iconBg: "bg-gradient-to-br from-emerald-500/20 to-green-400/10", iconColor: "text-emerald-400",
    barColor: "bg-gradient-to-r from-emerald-500 to-green-400", badgeVariant: "secondary",
  },
  "Math & Recursion": {
    icon: Calculator, description: "Mathematical operations, recursive algorithms, number theory",
    accent: "purple", gradientFrom: "from-purple-500", gradientTo: "to-violet-400",
    iconBg: "bg-gradient-to-br from-purple-500/20 to-violet-400/10", iconColor: "text-purple-400",
    barColor: "bg-gradient-to-r from-purple-500 to-violet-400", badgeVariant: "secondary",
  },
  "Data Structures": {
    icon: Binary, description: "Stacks, queues, linked lists, trees, heaps, graphs",
    accent: "amber", gradientFrom: "from-amber-500", gradientTo: "to-yellow-400",
    iconBg: "bg-gradient-to-br from-amber-500/20 to-yellow-400/10", iconColor: "text-amber-400",
    barColor: "bg-gradient-to-r from-amber-500 to-yellow-400", badgeVariant: "secondary",
  },
  "Sorting & Searching": {
    icon: ArrowUpDown, description: "Sorting algorithms, binary search, two-pointer techniques",
    accent: "rose", gradientFrom: "from-rose-500", gradientTo: "to-pink-400",
    iconBg: "bg-gradient-to-br from-rose-500/20 to-pink-400/10", iconColor: "text-rose-400",
    barColor: "bg-gradient-to-r from-rose-500 to-pink-400", badgeVariant: "secondary",
  },
  "Hash Maps & Sets": {
    icon: Hash, description: "Key-value stores, set operations, frequency counting",
    accent: "violet", gradientFrom: "from-violet-500", gradientTo: "to-purple-400",
    iconBg: "bg-gradient-to-br from-violet-500/20 to-purple-400/10", iconColor: "text-violet-400",
    barColor: "bg-gradient-to-r from-violet-500 to-purple-400", badgeVariant: "secondary",
  },
  "Concurrency": {
    icon: GitFork, description: "Goroutines, channels, mutexes, sync primitives",
    accent: "cyan", gradientFrom: "from-cyan-500", gradientTo: "to-sky-400",
    iconBg: "bg-gradient-to-br from-cyan-500/20 to-sky-400/10", iconColor: "text-cyan-400",
    barColor: "bg-gradient-to-r from-cyan-500 to-sky-400", badgeVariant: "secondary",
  },
  "Dynamic Programming": {
    icon: Blocks, description: "Memoization, tabulation, optimization, subsequence problems",
    accent: "fuchsia", gradientFrom: "from-fuchsia-500", gradientTo: "to-pink-400",
    iconBg: "bg-gradient-to-br from-fuchsia-500/20 to-pink-400/10", iconColor: "text-fuchsia-400",
    barColor: "bg-gradient-to-r from-fuchsia-500 to-pink-400", badgeVariant: "secondary",
  },
  "Bit Manipulation": {
    icon: Cpu, description: "Bitwise operations, flags, XOR tricks, bit masking",
    accent: "slate", gradientFrom: "from-slate-500", gradientTo: "to-gray-400",
    iconBg: "bg-gradient-to-br from-slate-500/20 to-gray-400/10", iconColor: "text-slate-400",
    barColor: "bg-gradient-to-r from-slate-500 to-gray-400", badgeVariant: "secondary",
  },
  "Trees & Graphs": {
    icon: GitBranch, description: "Binary trees, BST, graph traversals, shortest path",
    accent: "green", gradientFrom: "from-green-500", gradientTo: "to-emerald-400",
    iconBg: "bg-gradient-to-br from-green-500/20 to-emerald-400/10", iconColor: "text-green-400",
    barColor: "bg-gradient-to-r from-green-500 to-emerald-400", badgeVariant: "secondary",
  },
  "Error Handling": {
    icon: ShieldAlert, description: "Error types, custom errors, panics, recover",
    accent: "red", gradientFrom: "from-red-500", gradientTo: "to-rose-400",
    iconBg: "bg-gradient-to-br from-red-500/20 to-rose-400/10", iconColor: "text-red-400",
    barColor: "bg-gradient-to-r from-red-500 to-rose-400", badgeVariant: "secondary",
  },
  "Testing": {
    icon: FlaskConical, description: "Table-driven tests, benchmarks, mocking, coverage",
    accent: "teal", gradientFrom: "from-teal-500", gradientTo: "to-cyan-400",
    iconBg: "bg-gradient-to-br from-teal-500/20 to-cyan-400/10", iconColor: "text-teal-400",
    barColor: "bg-gradient-to-r from-teal-500 to-cyan-400", badgeVariant: "secondary",
  },
  "File I/O": {
    icon: FileSpreadsheet, description: "Reading/writing files, formats, buffered I/O",
    accent: "orange", gradientFrom: "from-orange-500", gradientTo: "to-amber-400",
    iconBg: "bg-gradient-to-br from-orange-500/20 to-amber-400/10", iconColor: "text-orange-400",
    barColor: "bg-gradient-to-r from-orange-500 to-amber-400", badgeVariant: "secondary",
  },
  "Networking": {
    icon: Globe, description: "HTTP clients/servers, TCP, WebSockets, APIs",
    accent: "indigo", gradientFrom: "from-indigo-500", gradientTo: "to-blue-400",
    iconBg: "bg-gradient-to-br from-indigo-500/20 to-blue-400/10", iconColor: "text-indigo-400",
    barColor: "bg-gradient-to-r from-indigo-500 to-blue-400", badgeVariant: "secondary",
  },
  "Interfaces & Generics": {
    icon: Puzzle, description: "Interface patterns, type parameters, constraints",
    accent: "pink", gradientFrom: "from-pink-500", gradientTo: "to-rose-400",
    iconBg: "bg-gradient-to-br from-pink-500/20 to-rose-400/10", iconColor: "text-pink-400",
    barColor: "bg-gradient-to-r from-pink-500 to-rose-400", badgeVariant: "secondary",
  },
  "Pointers": {
    icon: Crosshair, description: "Pointer arithmetic, memory management, references",
    accent: "stone", gradientFrom: "from-stone-500", gradientTo: "to-neutral-400",
    iconBg: "bg-gradient-to-br from-stone-500/20 to-neutral-400/10", iconColor: "text-stone-400",
    barColor: "bg-gradient-to-r from-stone-500 to-neutral-400", badgeVariant: "secondary",
  },
  "OOP & Composition": {
    icon: Box, description: "Struct embedding, methods, composition over inheritance",
    accent: "lime", gradientFrom: "from-lime-500", gradientTo: "to-green-400",
    iconBg: "bg-gradient-to-br from-lime-500/20 to-green-400/10", iconColor: "text-lime-400",
    barColor: "bg-gradient-to-r from-lime-500 to-green-400", badgeVariant: "secondary",
  },
  "Design Patterns": {
    icon: Sparkles, description: "Common Go idioms, factory, singleton, observer patterns",
    accent: "yellow", gradientFrom: "from-yellow-500", gradientTo: "to-amber-400",
    iconBg: "bg-gradient-to-br from-yellow-500/20 to-amber-400/10", iconColor: "text-yellow-400",
    barColor: "bg-gradient-to-r from-yellow-500 to-amber-400", badgeVariant: "secondary",
  },
  "Encoding & Serialization": {
    icon: Braces, description: "JSON, XML, Gob, protobuf, binary encoding",
    accent: "sky", gradientFrom: "from-sky-500", gradientTo: "to-blue-400",
    iconBg: "bg-gradient-to-br from-sky-500/20 to-blue-400/10", iconColor: "text-sky-400",
    barColor: "bg-gradient-to-r from-sky-500 to-blue-400", badgeVariant: "secondary",
  },
  "Linked Lists": {
    icon: Link, description: "Singly/doubly linked lists, cycle detection, mergers",
    accent: "gray", gradientFrom: "from-gray-500", gradientTo: "to-slate-400",
    iconBg: "bg-gradient-to-br from-gray-500/20 to-slate-400/10", iconColor: "text-gray-400",
    barColor: "bg-gradient-to-r from-gray-500 to-slate-400", badgeVariant: "secondary",
  },
};

const FALLBACK: ModuleMeta = {
  icon: Binary, description: "Programming fundamentals",
  accent: "gray", gradientFrom: "from-gray-500", gradientTo: "to-slate-400",
  iconBg: "bg-gradient-to-br from-gray-500/20 to-slate-400/10", iconColor: "text-gray-400",
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
          <Binary size={24} className="text-muted-foreground/40" />
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
        const Icon = meta.icon;
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
                "relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-3",
                "hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5",
                "h-full flex flex-col",
                isComplete && "ring-1 ring-emerald-500/20",
              )}
            >
              {/* Top accent gradient bar */}
              <div className={cn(
                "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-80",
                meta.gradientFrom, meta.gradientTo,
              )} />

              {/* Background radial glow */}
              <div className={cn(
                "absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500",
                meta.iconBg,
              )} />

              <CardHeader className="p-5 pb-3 flex-row items-start gap-4 space-y-0 relative z-10">
                <div className={cn(
                  "p-3 rounded-2xl shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg",
                  meta.iconBg,
                  "ring-1 ring-white/[0.06]",
                )}>
                  <Icon size={24} className={cn("transition-transform duration-300", meta.iconColor)} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold text-foreground truncate leading-tight">
                      {mod}
                    </CardTitle>
                    {isComplete && (
                      <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 h-5 border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                        Done
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-1.5 leading-relaxed line-clamp-2">
                    {meta.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="px-5 pb-0 relative z-10 flex-1">
                {/* Problem stats row */}
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

                {/* Progress bar */}
                <div className="h-2.5 bg-muted/80 rounded-full overflow-hidden ring-1 ring-white/[0.03]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out relative",
                      meta.barColor,
                      pct > 0 && "shadow-sm",
                      isComplete && "shadow-[0_0_8px_rgba(52,211,153,0.3)]",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Mini solved counters */}
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
