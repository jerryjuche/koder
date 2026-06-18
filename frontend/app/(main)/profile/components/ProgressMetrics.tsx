"use client";

import { UserProfile } from "@/lib/types";
import { BookOpen } from "lucide-react";

interface ProgressMetricsProps {
  profile: UserProfile;
}

const DifficultyCard = ({
  name,
  solved,
  total,
  color,
}: {
  name: string;
  solved: number;
  total: number;
  color: string;
}) => {
  const percentage = total === 0 ? 0 : (solved / total) * 100;
  const colorClasses = {
    Easy: "bg-brand-success/20 border-brand-success/30 text-brand-success",
    Medium:
      "bg-brand-muted-gold/20 border-brand-muted-gold/30 text-brand-muted-gold",
    Hard: "bg-brand-error/20 border-brand-error/30 text-brand-error",
  } as const;

  return (
    <div
      className={`rounded-2xl border p-4 ${colorClasses[name as keyof typeof colorClasses]}`}
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-sm">{name}</h4>
        <span className="text-lg font-bold">
          {solved}/{total}
        </span>
      </div>
      <div className="w-full bg-brand-charcoal-base rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            name === "Easy"
              ? "bg-brand-success"
              : name === "Medium"
                ? "bg-brand-muted-gold"
                : "bg-brand-error"
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs mt-2 font-medium opacity-75">
        {percentage.toFixed(0)}% Complete
      </p>
    </div>
  );
};

export default function ProgressMetrics({ profile }: ProgressMetricsProps) {
  const { progress_by_difficulty, stats } = profile;
  const totalSolved =
    progress_by_difficulty.easy.solved +
    progress_by_difficulty.medium.solved +
    progress_by_difficulty.hard.solved;
  const totalProblems =
    progress_by_difficulty.easy.total +
    progress_by_difficulty.medium.total +
    progress_by_difficulty.hard.total;



  return (
    <div className="bg-brand-charcoal-card rounded-2xl border border-brand-charcoal-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen size={24} className="text-brand-muted-gold" />
        <h3 className="text-lg font-semibold text-brand-offwhite">
          Problem Progress
        </h3>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-brand-charcoal-panel rounded-lg p-4 border border-brand-charcoal-border">
          <p className="text-brand-offwhite-muted text-xs font-semibold uppercase tracking-wider mb-2">
            Total Solved
          </p>
          <p className="text-3xl font-bold text-brand-muted-gold">
            {totalSolved}/{totalProblems}
          </p>
        </div>
        <div className="bg-brand-charcoal-panel rounded-lg p-4 border border-brand-charcoal-border">
          <p className="text-brand-offwhite-muted text-xs font-semibold uppercase tracking-wider mb-2">
            Success Rate
          </p>
          <p className="text-3xl font-bold text-brand-muted-gold">
            {stats.attempted_count === 0
              ? "0"
              : ((stats.solved_count / stats.attempted_count) * 100).toFixed(0)}
            %
          </p>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <DifficultyCard
          name="Easy"
          solved={progress_by_difficulty.easy.solved}
          total={progress_by_difficulty.easy.total}
          color="green"
        />
        <DifficultyCard
          name="Medium"
          solved={progress_by_difficulty.medium.solved}
          total={progress_by_difficulty.medium.total}
          color="yellow"
        />
        <DifficultyCard
          name="Hard"
          solved={progress_by_difficulty.hard.solved}
          total={progress_by_difficulty.hard.total}
          color="red"
        />
      </div>

      {/* Average Stars */}
      {stats.average_stars > 0 && (
        <div className="mt-6 bg-brand-charcoal-panel rounded-lg p-4 border border-brand-charcoal-border">
          <p className="text-brand-offwhite-muted text-xs font-semibold uppercase tracking-wider mb-2">
            Avg. Quality Score
          </p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-brand-muted-gold">
              {stats.average_stars.toFixed(1)}
            </span>
            <span className="text-xl text-brand-muted-gold">/3.0</span>
          </div>
        </div>
      )}
    </div>
  );
}
