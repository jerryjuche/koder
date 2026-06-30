import { Target, Flame, Star, Zap, Award, Code } from "lucide-react";
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
      icon: Target,
      unlocked: profile.stats.solved_count >= 1,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
    {
      id: "hot_streak",
      title: "Hot Streak",
      description: "Maintained a 3-day streak",
      criteria: "Achieve a 3-day consecutive solving streak",
      icon: Flame,
      unlocked: profile.stats.current_streak_days >= 3,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      border: "border-orange-400/20",
    },
    {
      id: "perfectionist",
      title: "Perfectionist",
      description: "Average quality score of 2.5+",
      criteria: "Maintain average stars above 2.5 across solved problems",
      icon: Star,
      unlocked: profile.stats.average_stars >= 2.5 && profile.stats.solved_count > 0,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/20",
    },
    {
      id: "speed_demon",
      title: "Speed Demon",
      description: "Submitted a solution under 10ms",
      criteria: "Complete any problem with runtime less than 10ms",
      icon: Zap,
      unlocked: profile.stats.best_runtime_ms > 0 && profile.stats.best_runtime_ms < 10,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/20",
    },
    {
      id: "veteran",
      title: "Veteran Coder",
      description: "Reached level 10",
      criteria: "Earn enough XP to reach level 10",
      icon: Award,
      unlocked: profile.level >= 10,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
    },
    {
      id: "completionist",
      title: "Completionist",
      description: "Solved 50 problems",
      criteria: "Solve 50 different problems",
      icon: Code,
      unlocked: profile.stats.solved_count >= 50,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
    },
  ];
}
