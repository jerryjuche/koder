"use client";

import { useState, useEffect } from "react";
import { fetchAllProblemsAdmin } from "@/lib/api";
import type { Problem } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Check, Code2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProblemBankProps {
  selectedSlugs: string[];
  onToggleSlug: (slug: string) => void;
}

export default function ProblemBank({ selectedSlugs, onToggleSlug }: ProblemBankProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProblemsAdmin().then((res) => {
      if (res.success && res.data) setProblems(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = problems.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.slug.toLowerCase().includes(q) ||
      (p.title || "").toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, slug, or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="border rounded-lg divide-y max-h-72 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading problems...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {search ? "No matching problems" : "No problems found"}
          </div>
        )}
        {filtered.map((p) => {
          const selected = selectedSlugs.includes(p.slug);
          return (
            <div
              key={p.id}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-muted/50",
                selected && "bg-primary/5 hover:bg-primary/10"
              )}
              onClick={() => onToggleSlug(p.slug)}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                  selected ? "bg-primary border-primary" : "border-muted-foreground/30"
                )}
              >
                {selected && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              <Code2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title || p.slug}</p>
                <p className="text-xs text-muted-foreground truncate">{p.slug}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="outline" className="text-[10px]">Diff {p.difficulty}</Badge>
                <Badge variant="secondary" className="text-[10px]">{p.xpReward} XP</Badge>
              </div>
            </div>
          );
        })}
      </div>
      {selectedSlugs.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground mr-1">Attached:</span>
          {selectedSlugs.map((slug) => (
            <Badge key={slug} variant="secondary" className="text-[10px] gap-1 cursor-pointer" onClick={() => onToggleSlug(slug)}>
              {slug}
              <span className="text-muted-foreground/50 hover:text-foreground ml-0.5">×</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
