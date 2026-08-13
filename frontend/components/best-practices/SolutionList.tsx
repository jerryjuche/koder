"use client";

import { CommunitySolution } from "@/lib/types";
import { SolutionRow } from "./SolutionRow";

export function SolutionList({
  solutions,
  ranks,
  onLike,
}: {
  solutions: CommunitySolution[];
  ranks: Map<string, number>;
  onLike: (id: string, currentlyLiked: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      {solutions.map((sol, i) => (
        <SolutionRow
          key={sol.id}
          solution={sol}
          rank={ranks.get(sol.id) ?? 0}
          index={i}
          onLike={onLike}
        />
      ))}
    </div>
  );
}
