"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const TIERS: Array<{ label: string; desc: string; width: string; barCls: string }> = [
  { label: "O(1)", desc: "Constant — one operation, regardless of input", width: "8%", barCls: "bg-emerald-500" },
  { label: "O(log n)", desc: "Logarithmic — halves the input each step (binary search)", width: "20%", barCls: "bg-teal-500" },
  { label: "O(n)", desc: "Linear — one pass over the input", width: "45%", barCls: "bg-amber-500" },
  { label: "O(n log n)", desc: "Linearithmic — efficient sorts (merge sort)", width: "62%", barCls: "bg-orange-500" },
  { label: "O(n²)", desc: "Quadratic — nested loops over the input", width: "78%", barCls: "bg-orange-500" },
  { label: "O(2ⁿ)", desc: "Exponential — doubles per extra element", width: "90%", barCls: "bg-rose-500" },
  { label: "O(n!)", desc: "Factorial — permutations of the input", width: "100%", barCls: "bg-rose-500" },
];

export function ComplexityScale() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border/60 bg-muted/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="uppercase tracking-wider">How complexity grows</span>
        <ChevronDown size={13} className={cn("ml-auto transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-2.5 border-t border-border/60 px-3 py-3">
          {TIERS.map((t) => (
            <div key={t.label} className="flex items-center gap-3">
              <code className="w-16 shrink-0 text-right font-mono text-[11px] font-bold text-foreground">
                {t.label}
              </code>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                <div className={cn("h-full rounded-full", t.barCls)} style={{ width: t.width }} />
              </div>
              <span className="hidden w-56 shrink-0 text-[10px] leading-tight text-muted-foreground sm:block">
                {t.desc}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
