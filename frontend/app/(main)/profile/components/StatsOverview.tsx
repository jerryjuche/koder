"use client";

import { UserProfile } from "@/lib/types";
import { Trophy, Star, Target, CheckCircle2, Flame, Award, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  profile: UserProfile;
}

export default function StatsOverview({ profile }: StatsOverviewProps) {
  return (
    <div className="bg-brand-charcoal-card rounded-2xl border border-brand-charcoal-border p-6 h-full flex flex-col relative overflow-hidden">
      {/* Background fade pattern like the image */}
      <div 
        className="absolute -bottom-32 -right-32 w-96 h-96 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, transparent 0, transparent 4px, currentColor 4px, currentColor 5px)`,
          backgroundSize: '24px 24px'
        }}
      ></div>

      <div className="flex items-center gap-2 mb-6 text-brand-muted-gold relative z-10">
        <Trophy size={20} />
        <h3 className="text-lg font-bold text-brand-offwhite">Statistics</h3>
      </div>

      <div className="flex flex-col gap-4 relative z-10 flex-1">
        {/* Top Row: Total XP and Level */}
        <div className="flex gap-4">
          <div className="flex-1 bg-[#121418] border border-brand-charcoal-border/50 rounded-xl p-5 text-center shadow-inner">
            <p className="text-[11px] text-brand-offwhite-muted font-bold mb-2 tracking-widest uppercase">Total XP</p>
            <p className="text-3xl font-bold text-brand-offwhite font-mono">{profile.xp.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-[#121418] border border-brand-charcoal-border/50 rounded-xl p-5 text-center shadow-inner">
            <p className="text-[11px] text-brand-offwhite-muted font-bold mb-2 tracking-widest uppercase">Level</p>
            <p className="text-3xl font-bold text-brand-muted-gold font-mono">{profile.level}</p>
          </div>
        </div>

        {/* Global Rank */}
        <div className="bg-[#121418] border border-brand-charcoal-border/50 rounded-xl p-4 flex justify-between items-center group hover:bg-[#15181C] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-purple-400/10 flex items-center justify-center">
              <Hash size={16} className="text-purple-400" />
            </div>
            <span className="text-xs font-bold text-brand-offwhite-muted uppercase tracking-wider">Global Rank</span>
          </div>
          <span className="text-lg font-bold text-brand-offwhite font-mono">#{profile.global_rank || "-"}</span>
        </div>

        {/* Total Solved */}
        <div className="bg-[#121418] border border-brand-charcoal-border/50 rounded-xl p-4 flex justify-between items-center group hover:bg-[#15181C] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-400/10 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-brand-offwhite-muted uppercase tracking-wider">Total Solved</span>
          </div>
          <span className="text-lg font-bold text-brand-offwhite font-mono">{profile.stats.solved_count}</span>
        </div>

        {/* Success Rate */}
        <div className="bg-[#121418] border border-brand-charcoal-border/50 rounded-xl p-4 flex justify-between items-center group hover:bg-[#15181C] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-rose-400/10 flex items-center justify-center">
              <Target size={16} className="text-rose-400" />
            </div>
            <span className="text-xs font-bold text-brand-offwhite-muted uppercase tracking-wider">Success Rate</span>
          </div>
          <span className="text-lg font-bold text-brand-offwhite font-mono">
            {((profile.stats.solved_count / Math.max(1, profile.stats.attempted_count)) * 100).toFixed(1)}%
          </span>
        </div>

        {/* Current Streak */}
        <div className="bg-[#121418] border border-brand-charcoal-border/50 rounded-xl p-4 flex justify-between items-center group hover:bg-[#15181C] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-orange-400/10 flex items-center justify-center">
              <Flame size={16} className="text-orange-400" />
            </div>
            <span className="text-xs font-bold text-brand-offwhite-muted uppercase tracking-wider">Current Streak</span>
          </div>
          <span className="text-lg font-bold text-brand-offwhite font-mono">{profile.stats.current_streak_days} Days</span>
        </div>
      </div>
    </div>
  );
}
