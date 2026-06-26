"use client";

import { UserProfile } from "@/lib/types";
import { Trophy, Award } from "lucide-react";

interface RankStatsProps {
  profile: UserProfile;
}

export default function RankStats({ profile }: RankStatsProps) {
  const getTierBadge = (xp: number) => {
    if (xp >= 10000)
      return { label: "Legendary", color: "from-yellow-400 to-orange-500" };
    if (xp >= 5000)
      return { label: "Gold", color: "from-yellow-400 to-amber-500" };
    if (xp >= 2000)
      return { label: "Silver", color: "from-gray-300 to-slate-400" };
    if (xp >= 500)
      return { label: "Bronze", color: "from-orange-600 to-orange-700" };
    return { label: "Novice", color: "from-slate-500 to-slate-600" };
  };

  const tier = getTierBadge(profile.xp);
  const nextThreshold =
    profile.xp >= 10000
      ? 10000
      : profile.xp >= 5000
        ? 10000
        : profile.xp >= 2000
          ? 5000
          : profile.xp >= 500
            ? 2000
            : 500;
  const xpProgress = (profile.xp % nextThreshold) / nextThreshold;

  return (
    <div className="bg-brand-charcoal-card rounded-2xl border border-brand-charcoal-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy size={24} className="text-brand-muted-gold" />
        <h3 className="text-lg font-semibold text-brand-offwhite">
          Rank & Progression
        </h3>
      </div>

      {/* Tier Badge */}
      <div className="mb-6 p-4 bg-brand-charcoal-panel rounded-lg border border-brand-charcoal-border">
        <p className="text-brand-offwhite-muted text-xs font-semibold uppercase tracking-wider mb-2">
          Current Tier
        </p>
        <div
          className={`inline-block bg-gradient-to-r ${tier.color} text-brand-charcoal-base px-4 py-2 rounded-lg font-bold text-sm`}
        >
          {tier.label}
        </div>
      </div>

      {/* Level and Rank Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Level */}
        <div className="bg-brand-charcoal-panel rounded-lg p-4 border border-brand-charcoal-border">
          <p className="text-brand-offwhite-muted text-xs font-semibold uppercase tracking-wider mb-2">
            Level
          </p>
          <p className="text-3xl font-bold text-brand-muted-gold">
            {profile.level}
          </p>
        </div>

        {/* Global Rank */}
        <div className="bg-brand-charcoal-panel rounded-lg p-4 border border-brand-charcoal-border">
          <p className="text-brand-offwhite-muted text-xs font-semibold uppercase tracking-wider mb-2">
            Global Rank
          </p>
          <p className="text-3xl font-bold text-brand-offwhite">
            #{profile.global_rank}
          </p>
        </div>
      </div>

      {/* XP Progress */}
      <div className="bg-brand-charcoal-panel rounded-lg p-4 border border-brand-charcoal-border">
        <div className="flex justify-between items-center mb-3">
          <p className="text-brand-offwhite-muted text-xs font-semibold uppercase tracking-wider">
            Experience
          </p>
          <span className="text-sm font-mono text-brand-muted-gold font-semibold">
            {profile.xp.toLocaleString()} XP
          </span>
        </div>
        <div className="w-full bg-brand-charcoal-base rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-brand-muted-gold to-brand-muted-gold-dark h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(xpProgress * 100).toFixed(1)}%` }}
          ></div>
        </div>
        <p className="text-xs text-brand-offwhite-muted mt-2">
          {Math.floor(xpProgress * 100)}% to next tier
        </p>
      </div>
    </div>
  );
}
