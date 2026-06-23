"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/types";
import { Award, Zap, Code, Star, Target, CheckCircle2, Flame, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AchievementsProps {
  profile: UserProfile;
}

export default function Achievements({ profile }: AchievementsProps) {
  // Simple logic to compute achievements based on stats
  const achievements = [
    {
      id: "first_blood",
      title: "First Blood",
      description: "Solved your first problem",
      icon: Target,
      unlocked: profile.stats.solved_count >= 1,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      id: "hot_streak",
      title: "Hot Streak",
      description: "Maintained a 3-day streak",
      icon: Flame,
      unlocked: profile.stats.current_streak_days >= 3,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      id: "perfectionist",
      title: "Perfectionist",
      description: "Achieved an average quality score of 2.5+",
      icon: Star,
      unlocked: profile.stats.average_stars >= 2.5 && profile.stats.solved_count > 0,
      color: "text-brand-muted-gold",
      bg: "bg-brand-muted-gold/10",
    },
    {
      id: "speed_demon",
      title: "Speed Demon",
      description: "Submitted a solution under 10ms",
      icon: Zap,
      unlocked: profile.stats.best_runtime_ms > 0 && profile.stats.best_runtime_ms < 10,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
    {
      id: "veteran",
      title: "Veteran Coder",
      description: "Reached level 10",
      icon: Award,
      unlocked: profile.level >= 10,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      id: "completionist",
      title: "Completionist",
      description: "Solved 50 problems",
      icon: Code,
      unlocked: profile.stats.solved_count >= 50,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
  ];

  const [selectedAchievement, setSelectedAchievement] = useState<typeof achievements[0] | null>(null);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="bg-brand-charcoal-card rounded-2xl border border-brand-charcoal-border p-6 hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-brand-charcoal-border/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award size={24} className="text-brand-muted-gold" />
          <h3 className="text-lg font-semibold text-brand-offwhite">
            Achievements
          </h3>
        </div>
        <div className="text-xs font-mono text-brand-offwhite-muted bg-brand-charcoal-card px-3 py-1.5 rounded-lg border border-brand-charcoal-border">
          {unlockedCount} / {achievements.length} Unlocked
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          return (
            <Card
              key={achievement.id}
              onClick={() => setSelectedAchievement(achievement)}
              className={cn(
                "relative overflow-hidden transition-all duration-300 cursor-pointer group hover:-translate-y-0.5",
                achievement.unlocked
                  ? "bg-brand-charcoal-card border-brand-charcoal-border hover:border-brand-muted-gold/30 hover:shadow-lg hover:shadow-brand-muted-gold/5"
                  : "bg-brand-charcoal-base border-brand-charcoal-border/30 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
              )}
            >
              {achievement.unlocked && (
                <div className="absolute top-2 right-2 text-brand-success">
                  <CheckCircle2 size={16} />
                </div>
              )}
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className={cn(
                    "p-3 rounded-xl flex-shrink-0 border transition-colors",
                    achievement.unlocked ? achievement.bg : "bg-brand-charcoal-hover group-hover:bg-brand-charcoal-panel",
                    achievement.unlocked ? "border-transparent" : "border-brand-charcoal-border"
                  )}
                >
                  <Icon
                    size={24}
                    className={achievement.unlocked ? achievement.color : "text-brand-offwhite-muted"}
                  />
                </div>
                <div>
                  <h4
                    className={cn(
                      "font-bold text-sm mb-1",
                      achievement.unlocked ? "text-brand-offwhite" : "text-brand-offwhite-muted"
                    )}
                  >
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-brand-offwhite-muted leading-relaxed line-clamp-1">
                    Click to view criteria
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Achievement Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="absolute inset-0" 
            onClick={() => setSelectedAchievement(null)}
          ></div>
          <div className="relative bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-4 right-4 text-brand-offwhite-muted hover:text-brand-offwhite transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6 mt-4">
              <div className={cn(
                "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 border",
                selectedAchievement.unlocked ? selectedAchievement.bg : "bg-brand-charcoal-base",
                selectedAchievement.unlocked ? "border-transparent" : "border-brand-charcoal-border"
              )}>
                {(() => {
                  const Icon = selectedAchievement.icon;
                  return (
                    <Icon 
                      size={40} 
                      className={selectedAchievement.unlocked ? selectedAchievement.color : "text-brand-offwhite-muted"} 
                    />
                  );
                })()}
              </div>
              
              <h3 className="text-2xl font-bold text-brand-offwhite mb-2">
                {selectedAchievement.title}
              </h3>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-charcoal-base border border-brand-charcoal-border mb-4">
                {selectedAchievement.unlocked ? (
                  <>
                    <CheckCircle2 size={14} className="text-brand-success" />
                    <span className="text-xs font-bold text-brand-success uppercase tracking-wider">Unlocked</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-brand-offwhite-muted"></div>
                    <span className="text-xs font-bold text-brand-offwhite-muted uppercase tracking-wider">Locked</span>
                  </>
                )}
              </div>
              
              <div className="bg-brand-charcoal-base/50 p-4 rounded-xl border border-brand-charcoal-border/50">
                <p className="text-sm text-brand-offwhite-muted mb-1 font-semibold uppercase tracking-wider text-xs">Criteria</p>
                <p className="text-brand-offwhite">{selectedAchievement.description}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedAchievement(null)}
              className="w-full py-3 rounded-xl bg-brand-charcoal-hover hover:bg-brand-charcoal-base border border-brand-charcoal-border text-sm font-bold text-brand-offwhite transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
