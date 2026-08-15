"use client";

import { Clock, MemoryStick } from "lucide-react";

const COMPLEXITY_TONE: Array<{ re: RegExp; cls: string }> = [
  { re: /^O\(1\)/i, cls: "text-emerald-400" },
  { re: /^O\(log\s*n\)/i, cls: "text-teal-400" },
  { re: /^O\(n\s*log\s*n\)/i, cls: "text-orange-400" },
  { re: /^O\(n\^?2\)/i, cls: "text-orange-400" },
  { re: /^O\(n\)/i, cls: "text-amber-400" },
  { re: /^O\(2\^?n\)/i, cls: "text-rose-400" },
  { re: /^O\(n!\)/i, cls: "text-rose-400" },
];

function toneFor(raw: string): string {
  const head = (raw || "").trim();
  for (const t of COMPLEXITY_TONE) {
    if (t.re.test(head)) return t.cls;
  }
  return "text-purple-300";
}

export function ComplexityBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5">
      {label === "Time" ? (
        <Clock size={13} className="text-purple-300 shrink-0" />
      ) : (
        <MemoryStick size={13} className="text-purple-300 shrink-0" />
      )}
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <code className={`font-mono text-xs font-semibold ${toneFor(value)}`}>{value}</code>
    </div>
  );
}
