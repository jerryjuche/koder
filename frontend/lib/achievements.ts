import {
  Crosshair,
  Flame,
  Sparkles,
  Gauge,
  Medal,
  Braces,
} from "lucide-react";
import type { UserProfile } from "./types";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  criteria: string;
  icon: React.ElementType;
  unlocked: boolean;
  color: string;
  bg: string;
  border: string;
}

export function getAchievements(profile: UserProfile): Achievement[] {
  return [
    {
      id: "first_blood",
      title: "First Blood",
      description: "Solved your first problem",
      criteria: "Solve at least 1 problem",
      icon: Crosshair,
      unlocked: profile.stats.solved_count >= 1,
      color: "text-emerald-400",
      bg: "bg-emerald-400/15",
      border: "border-emerald-400/30",
    },
    {
      id: "hot_streak",
      title: "Hot Streak",
      description: "Maintained a 3-day streak",
      criteria: "Achieve a 3-day consecutive solving streak",
      icon: Flame,
      unlocked: profile.stats.current_streak_days >= 3,
      color: "text-orange-400",
      bg: "bg-orange-400/15",
      border: "border-orange-400/30",
    },
    {
      id: "perfectionist",
      title: "Perfectionist",
      description: "Average quality score of 2.5+",
      criteria: "Maintain average stars above 2.5 across solved problems",
      icon: Sparkles,
      unlocked:
        profile.stats.average_stars >= 2.5 && profile.stats.solved_count > 0,
      color: "text-yellow-400",
      bg: "bg-yellow-400/15",
      border: "border-yellow-400/30",
    },
    {
      id: "speed_demon",
      title: "Speed Demon",
      description: "Submitted a solution under 10ms",
      criteria: "Complete any problem with runtime less than 10ms",
      icon: Gauge,
      unlocked:
        profile.stats.best_runtime_ms > 0 && profile.stats.best_runtime_ms < 10,
      color: "text-cyan-400",
      bg: "bg-cyan-400/15",
      border: "border-cyan-400/30",
    },
    {
      id: "veteran",
      title: "Veteran Coder",
      description: "Reached level 10",
      criteria: "Earn enough XP to reach level 10",
      icon: Medal,
      unlocked: profile.level >= 10,
      color: "text-violet-400",
      bg: "bg-violet-400/15",
      border: "border-violet-400/30",
    },
    {
      id: "completionist",
      title: "Completionist",
      description: "Solved 50 problems",
      criteria: "Solve 50 different problems",
      icon: Braces,
      unlocked: profile.stats.solved_count >= 50,
      color: "text-sky-400",
      bg: "bg-sky-400/15",
      border: "border-sky-400/30",
    },
  ];
}
