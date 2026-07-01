"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ModuleMeta = {
  icon: LucideIcon;
  description: string;
  accent: string;
  borderAccent: string;
  iconBg: string;
  iconColor: string;
  barColor: string;
  glowColor: string;
};

const MODULE_META: Record<string, ModuleMeta> = {
  "Arrays & Slices": {
    icon: LayoutList, description: "Array operations, slice manipulation, capacity & len",
    accent: "blue", borderAccent: "border-l-blue-500/50", iconBg: "bg-blue-500/10", iconColor: "text-blue-400", barColor: "bg-blue-500", glowColor: "shadow-blue-500/10",
  },
  "Strings & Runes": {
    icon: Type, description: "String manipulation, Unicode, runes, concatenation",
    accent: "emerald", borderAccent: "border-l-emerald-500/50", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400", barColor: "bg-emerald-500", glowColor: "shadow-emerald-500/10",
  },
  "Math & Recursion": {
    icon: Calculator, description: "Mathematical operations, recursive algorithms, number theory",
    accent: "purple", borderAccent: "border-l-purple-500/50", iconBg: "bg-purple-500/10", iconColor: "text-purple-400", barColor: "bg-purple-500", glowColor: "shadow-purple-500/10",
  },
  "Data Structures": {
    icon: Binary, description: "Stacks, queues, linked lists, trees, heaps, graphs",
    accent: "amber", borderAccent: "border-l-amber-500/50", iconBg: "bg-amber-500/10", iconColor: "text-amber-400", barColor: "bg-amber-500", glowColor: "shadow-amber-500/10",
  },
  "Sorting & Searching": {
    icon: ArrowUpDown, description: "Sorting algorithms, binary search, two-pointer techniques",
    accent: "rose", borderAccent: "border-l-rose-500/50", iconBg: "bg-rose-500/10", iconColor: "text-rose-400", barColor: "bg-rose-500", glowColor: "shadow-rose-500/10",
  },
  "Hash Maps & Sets": {
    icon: Hash, description: "Key-value stores, set operations, frequency counting",
    accent: "violet", borderAccent: "border-l-violet-500/50", iconBg: "bg-violet-500/10", iconColor: "text-violet-400", barColor: "bg-violet-500", glowColor: "shadow-violet-500/10",
  },
  "Concurrency": {
    icon: GitFork, description: "Goroutines, channels, mutexes, sync primitives",
    accent: "cyan", borderAccent: "border-l-cyan-500/50", iconBg: "bg-cyan-500/10", iconColor: "text-cyan-400", barColor: "bg-cyan-500", glowColor: "shadow-cyan-500/10",
  },
  "Dynamic Programming": {
    icon: Blocks, description: "Memoization, tabulation, optimization, subsequence problems",
    accent: "fuchsia", borderAccent: "border-l-fuchsia-500/50", iconBg: "bg-fuchsia-500/10", iconColor: "text-fuchsia-400", barColor: "bg-fuchsia-500", glowColor: "shadow-fuchsia-500/10",
  },
  "Bit Manipulation": {
    icon: Cpu, description: "Bitwise operations, flags, XOR tricks, bit masking",
    accent: "slate", borderAccent: "border-l-slate-500/50", iconBg: "bg-slate-500/10", iconColor: "text-slate-400", barColor: "bg-slate-500", glowColor: "shadow-slate-500/10",
  },
  "Trees & Graphs": {
    icon: GitBranch, description: "Binary trees, BST, graph traversals, shortest path",
    accent: "green", borderAccent: "border-l-green-500/50", iconBg: "bg-green-500/10", iconColor: "text-green-400", barColor: "bg-green-500", glowColor: "shadow-green-500/10",
  },
  "Error Handling": {
    icon: ShieldAlert, description: "Error types, custom errors, panics, recover",
    accent: "red", borderAccent: "border-l-red-500/50", iconBg: "bg-red-500/10", iconColor: "text-red-400", barColor: "bg-red-500", glowColor: "shadow-red-500/10",
  },
  "Testing": {
    icon: FlaskConical, description: "Table-driven tests, benchmarks, mocking, coverage",
    accent: "teal", borderAccent: "border-l-teal-500/50", iconBg: "bg-teal-500/10", iconColor: "text-teal-400", barColor: "bg-teal-500", glowColor: "shadow-teal-500/10",
  },
  "File I/O": {
    icon: FileSpreadsheet, description: "Reading/writing files, formats, buffered I/O",
    accent: "orange", borderAccent: "border-l-orange-500/50", iconBg: "bg-orange-500/10", iconColor: "text-orange-400", barColor: "bg-orange-500", glowColor: "shadow-orange-500/10",
  },
  "Networking": {
    icon: Globe, description: "HTTP clients/servers, TCP, WebSockets, APIs",
    accent: "indigo", borderAccent: "border-l-indigo-500/50", iconBg: "bg-indigo-500/10", iconColor: "text-indigo-400", barColor: "bg-indigo-500", glowColor: "shadow-indigo-500/10",
  },
  "Interfaces & Generics": {
    icon: Puzzle, description: "Interface patterns, type parameters, constraints",
    accent: "pink", borderAccent: "border-l-pink-500/50", iconBg: "bg-pink-500/10", iconColor: "text-pink-400", barColor: "bg-pink-500", glowColor: "shadow-pink-500/10",
  },
  "Pointers": {
    icon: Crosshair, description: "Pointer arithmetic, memory management, references",
    accent: "stone", borderAccent: "border-l-stone-500/50", iconBg: "bg-stone-500/10", iconColor: "text-stone-400", barColor: "bg-stone-500", glowColor: "shadow-stone-500/10",
  },
  "OOP & Composition": {
    icon: Box, description: "Struct embedding, methods, composition over inheritance",
    accent: "lime", borderAccent: "border-l-lime-500/50", iconBg: "bg-lime-500/10", iconColor: "text-lime-400", barColor: "bg-lime-500", glowColor: "shadow-lime-500/10",
  },
  "Design Patterns": {
    icon: Sparkles, description: "Common Go idioms, factory, singleton, observer patterns",
    accent: "yellow", borderAccent: "border-l-yellow-500/50", iconBg: "bg-yellow-500/10", iconColor: "text-yellow-400", barColor: "bg-yellow-500", glowColor: "shadow-yellow-500/10",
  },
  "Encoding & Serialization": {
    icon: Braces, description: "JSON, XML, Gob, protobuf, binary encoding",
    accent: "sky", borderAccent: "border-l-sky-500/50", iconBg: "bg-sky-500/10", iconColor: "text-sky-400", barColor: "bg-sky-500", glowColor: "shadow-sky-500/10",
  },
  "Linked Lists": {
    icon: Link, description: "Singly/doubly linked lists, cycle detection, mergers",
    accent: "gray", borderAccent: "border-l-gray-500/50", iconBg: "bg-gray-500/10", iconColor: "text-gray-400", barColor: "bg-gray-500", glowColor: "shadow-gray-500/10",
  },
};

const FALLBACK: ModuleMeta = {
  icon: Binary, description: "Programming fundamentals",
  accent: "gray", borderAccent: "border-l-gray-500/50", iconBg: "bg-gray-500/10", iconColor: "text-gray-400", barColor: "bg-gray-500", glowColor: "shadow-gray-500/10",
};

interface ModuleCardsProps {
  modules: string[];
  moduleProgress: Record<string, { solved: number; total: number }>;
  onSelect: (module: string) => void;
}

export default function ModuleCards({ modules, moduleProgress, onSelect }: ModuleCardsProps) {
  if (modules.length === 0) {
    return (
      <Card className="p-10 text-center border-dashed border-white/10 bg-card/50">
        <p className="text-muted-foreground">No modules available yet.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {modules.map((mod, i) => {
        const meta = MODULE_META[mod] || FALLBACK;
        const Icon = meta.icon;
        const progress = moduleProgress[mod];
        const solved = progress?.solved ?? 0;
        const total = progress?.total ?? 0;
        const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

        return (
          <button
            key={mod}
            onClick={() => onSelect(mod)}
            className="w-full text-left"
          >
            <Card
              style={{ animationDelay: `${i * 50}ms` }}
              className={cn(
                "relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
                "hover:-translate-y-1 hover:shadow-xl",
                meta.borderAccent,
                "border-l-4",
                meta.glowColor,
              )}
            >
              <CardHeader className="p-5 pb-0 flex-row items-start gap-3.5 space-y-0">
                <div className={cn(
                  "p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105",
                  meta.iconBg,
                )}>
                  <Icon size={22} className={meta.iconColor} />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm font-bold text-foreground truncate">
                    {mod}
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                    {meta.description}
                  </p>
                </div>
              </CardHeader>

              <CardFooter className="p-5 flex-col items-stretch gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700 ease-out", meta.barColor)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-muted-foreground shrink-0 tabular-nums">
                    {solved}/{total}
                  </span>
                </div>
              </CardFooter>

              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Explore →</span>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
