"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { charDiff } from "./charDiff";
import { computeAlignedLineDiff, countDiffLines } from "./lineDiff";

type ValueDiffProps = {
  got: string;
  want: string;
  showWhitespace?: boolean;
};

function display(line: string, showWhitespace: boolean): string {
  if (!showWhitespace) return line;
  let out = "";
  for (const ch of line) {
    if (ch === " ") out += "·";
    else if (ch === "\t") out += "→";
    else out += ch;
  }
  return out;
}

function EmptyNotice({ label }: { label: string }) {
  return (
    <span className="italic text-brand-offwhite-muted/60 text-xs">
      {label}
    </span>
  );
}

function SingleLineCompare({
  got,
  want,
  showWhitespace,
}: {
  got: string;
  want: string;
  showWhitespace: boolean;
}) {
  const d = charDiff(got, want);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-0">
      <div className="px-3 py-2.5 bg-brand-error/5 border border-brand-error/20 rounded-l-lg min-w-0">
        <div className="text-[10px] uppercase tracking-wider font-bold text-brand-error/80 mb-1.5">
          Your Output
        </div>
        <div className="font-mono text-xs text-brand-error break-all whitespace-pre-wrap leading-relaxed">
          {got === "" ? (
            <EmptyNotice label="no output produced" />
          ) : (
            <>
              {display(d.gotPrefix, showWhitespace)}
              {d.gotDiff !== "" && (
                <mark className="bg-brand-error/25 text-brand-error rounded-[3px] px-0.5 -mx-0.5">
                  {display(d.gotDiff, showWhitespace)}
                </mark>
              )}
              {display(d.gotSuffix, showWhitespace)}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center px-2.5 text-brand-offwhite-muted/40 text-xs font-bold select-none">
        vs
      </div>

      <div className="px-3 py-2.5 bg-brand-success/5 border border-brand-success/20 rounded-r-lg min-w-0">
        <div className="text-[10px] uppercase tracking-wider font-bold text-brand-success/80 mb-1.5">
          Expected
        </div>
        <div className="font-mono text-xs text-brand-success break-all whitespace-pre-wrap leading-relaxed">
          {want === "" ? (
            <EmptyNotice label="empty (no output expected)" />
          ) : (
            <>
              {display(d.wantPrefix, showWhitespace)}
              {d.wantDiff !== "" && (
                <mark className="bg-brand-success/25 text-brand-success rounded-[3px] px-0.5 -mx-0.5">
                  {display(d.wantDiff, showWhitespace)}
                </mark>
              )}
              {display(d.wantSuffix, showWhitespace)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MultiLineCompare({
  got,
  want,
  showWhitespace,
}: {
  got: string;
  want: string;
  showWhitespace: boolean;
}) {
  const rows = computeAlignedLineDiff(got, want);
  const differing = countDiffLines(rows);
  let gotNum = 0;
  let wantNum = 0;

  return (
    <div className="bg-[#0D0D0D] rounded-lg border border-brand-charcoal-border overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-brand-charcoal-hover/30 border-b border-brand-charcoal-border/50">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider select-none">
          <span className="flex items-center gap-1.5 text-brand-error/80">
            <span className="w-2 h-2 rounded-[2px] bg-brand-error" /> Your
            Output
          </span>
          <span className="text-brand-offwhite-muted/30">|</span>
          <span className="flex items-center gap-1.5 text-brand-success/80">
            <span className="w-2 h-2 rounded-[2px] bg-brand-success" /> Expected
          </span>
        </div>
        {differing > 0 && (
          <span className="text-[10px] text-brand-offwhite-muted/60 shrink-0">
            {differing} differing line{differing !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {got === "" && (
        <div className="px-3 py-1.5 text-[11px] italic text-brand-offwhite-muted/60 border-b border-brand-charcoal-border/40">
          Your code produced no output.
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {rows.map((row, i) => {
            const gotText =
              row.gotLine === null ? "" : display(row.gotLine, showWhitespace);
            const wantText =
              row.wantLine === null
                ? ""
                : display(row.wantLine, showWhitespace);
            const isGot = row.gotLine !== null;
            const isWant = row.wantLine !== null;

            return (
              <div
                key={i}
                className={cn(
                  "grid grid-cols-[3ch_1fr_3ch_1fr] min-w-full",
                  row.match
                    ? "bg-transparent"
                    : "bg-brand-error/8 border-t border-brand-charcoal-border/30 first:border-t-0",
                )}
              >
                <span
                  className={cn(
                    "text-right pr-1.5 text-[10px] select-none leading-5 shrink-0",
                    isGot ? "text-brand-offwhite-muted/30" : "text-transparent",
                  )}
                >
                  {isGot ? ++gotNum : ""}
                </span>
                <span
                  className={cn(
                    "px-1 py-0 leading-5 whitespace-pre-wrap break-all text-[11px] font-mono",
                    row.match ? "text-brand-offwhite/80" : "text-brand-error",
                  )}
                >
                  {gotText || " "}
                </span>
                <span
                  className={cn(
                    "text-right pr-1.5 text-[10px] select-none leading-5 shrink-0",
                    isWant ? "text-brand-offwhite-muted/30" : "text-transparent",
                  )}
                >
                  {isWant ? ++wantNum : ""}
                </span>
                <span
                  className={cn(
                    "px-1 py-0 leading-5 whitespace-pre-wrap break-all text-[11px] font-mono",
                    row.match ? "text-brand-offwhite/80" : "text-brand-success",
                  )}
                >
                  {wantText || " "}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ValueDiff({
  got,
  want,
  showWhitespace = true,
}: ValueDiffProps) {
  if (got === want) {
    return (
      <div className="bg-brand-success/10 border border-brand-success/20 rounded-lg p-3 flex items-center gap-2">
        <CheckCircle2 size={14} className="text-brand-success shrink-0" />
        <span className="text-xs text-brand-success font-medium">
          Output matches expected value
        </span>
      </div>
    );
  }

  const isSingleLine = !got.includes("\n") && !want.includes("\n");

  return isSingleLine ? (
    <SingleLineCompare got={got} want={want} showWhitespace={showWhitespace} />
  ) : (
    <MultiLineCompare got={got} want={want} showWhitespace={showWhitespace} />
  );
}
