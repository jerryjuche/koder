"use client";

import { UserProfile } from "@/lib/types";
import {
  Target,
  CheckCircle2,
  Flame,
  Zap,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface PerformanceStatsProps {
  profile: UserProfile;
}

export default function PerformanceStats({ profile }: PerformanceStatsProps) {
  const { stats } = profile;

  const StatCard = ({
    label,
    value,
    unit = "",
    IconComponent,
  }: {
    label: string;
    value: string | number;
    unit?: string;
    IconComponent?: React.ComponentType<{ size: number; className: string }>;
  }) => (
    <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-6">
      {IconComponent && (
        <IconComponent
          size={20}
          className="text-brand-muted-gold mb-4"
        />
      )}
      <p className="text-brand-offwhite-muted text-sm font-medium mb-2">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-brand-offwhite">{value}</span>
        {unit && (
          <span className="text-brand-offwhite-muted text-sm">{unit}</span>
        )}
      </div>
    </div>
  );

  const formatRuntime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="bg-brand-charcoal-card rounded-xl border border-brand-charcoal-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp size={24} className="text-brand-muted-gold" />
        <h3 className="text-lg font-semibold text-brand-offwhite">
          Performance Statistics
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Attempts"
          value={stats.attempted_count}
          IconComponent={Target}
        />
        <StatCard
          label="Problems Solved"
          value={stats.solved_count}
          IconComponent={CheckCircle2}
        />
        <StatCard
          label="Current Streak"
          value={stats.current_streak_days}
          unit="days"
          IconComponent={Flame}
        />
        <StatCard
          label="Best Runtime"
          value={formatRuntime(stats.best_runtime_ms)}
          IconComponent={Zap}
        />
      </div>

      {/* Insights */}
      <div className="p-4 bg-brand-charcoal-panel rounded-lg border border-brand-charcoal-border">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={18} className="text-brand-muted-gold" />
          <h4 className="font-semibold text-brand-offwhite">Performance Insights</h4>
        </div>
        <ul className="space-y-2 text-sm text-brand-offwhite-muted">
          {stats.attempted_count === 0 ? (
            <li className="text-brand-offwhite-muted">
              Start solving problems to build your profile
            </li>
          ) : (
            <>
              {stats.current_streak_days > 0 && (
                <li>
                  Active streak of {stats.current_streak_days} day
                  {stats.current_streak_days > 1 ? "s" : ""}
                </li>
              )}
              {stats.solved_count === 1 && (
                <li>Great start with your first problem solved</li>
              )}
              {stats.solved_count > 5 && <li>Solid progress building momentum</li>}
              {stats.solved_count > 10 && (
                <li>Excellent commitment to problem-solving</li>
              )}
              <li>
                Success rate:{" "}
                <span className="text-brand-muted-gold font-semibold">
                  {((stats.solved_count / stats.attempted_count) * 100).toFixed(
                    0
                  )}%
                </span>{" "}
                of attempts succeed
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
