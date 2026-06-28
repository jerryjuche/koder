"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/types";
import {
  Award,
  Zap,
  Code,
  Star,
  Target,
  CheckCircle2,
  Flame,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AchievementsProps {
  profile: UserProfile;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  unlocked: boolean;
  color: string;
  bg: string;
  border: string;
}

function allAchievements(profile: UserProfile): Achievement[] {
  return [
    {
      id: "first_blood",
      title: "First Blood",
      description: "Solved your first problem",
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
      icon: Flame,
      unlocked: profile.stats.current_streak_days >= 3,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      border: "border-orange-400/20",
    },
    {
      id: "perfectionist",
      title: "Perfectionist",
      description: "Achieved an average quality score of 2.5+",
      icon: Star,
      unlocked:
        profile.stats.average_stars >= 2.5 && profile.stats.solved_count > 0,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      id: "speed_demon",
      title: "Speed Demon",
      description: "Submitted a solution under 10ms",
      icon: Zap,
      unlocked:
        profile.stats.best_runtime_ms > 0 && profile.stats.best_runtime_ms < 10,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/20",
    },
    {
      id: "veteran",
      title: "Veteran Coder",
      description: "Reached level 10",
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
      icon: Code,
      unlocked: profile.stats.solved_count >= 50,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
    },
  ];
}

export default function Achievements({ profile }: AchievementsProps) {
  const achievements = allAchievements(profile);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const [selected, setSelected] = useState<Achievement | null>(null);

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50">
              <Award size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Achievements
            </h3>
          </div>
          <Badge variant="outline" className="font-mono">
            {unlockedCount} / {achievements.length}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <Tooltip key={achievement.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSelected(achievement)}
                    className={cn(
                      "w-full aspect-square rounded-full flex items-center justify-center border transition-all duration-200",
                      achievement.unlocked
                        ? "bg-card border-border hover:ring-2 hover:ring-primary/50 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg"
                        : "bg-muted/30 border-border opacity-30 grayscale"
                    )}
                  >
                    <Icon
                      size={22}
                      className={
                        achievement.unlocked
                          ? achievement.color
                          : "text-muted-foreground"
                      }
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-44">
                  <p className="font-semibold text-xs mb-0.5">
                    {achievement.title}
                    {achievement.unlocked && (
                      <CheckCircle2
                        size={10}
                        className="inline ml-1 text-emerald-400"
                      />
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {achievement.description}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </Card>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="text-center mb-2 mt-2">
              <div
                className={cn(
                  "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 border",
                  selected?.unlocked ? selected.bg : "bg-muted/50",
                  selected?.unlocked ? "border-transparent" : "border-border"
                )}
              >
                {selected && (
                  <selected.icon
                    size={40}
                    className={
                      selected.unlocked
                        ? selected.color
                        : "text-muted-foreground"
                    }
                  />
                )}
              </div>
              <DialogTitle className="text-2xl font-bold text-center">
                {selected?.title}
              </DialogTitle>
            </div>
            <div className="flex justify-center">
              {selected?.unlocked ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 gap-1"
                >
                  <CheckCircle2 size={12} />
                  Unlocked
                </Badge>
              ) : (
                <Badge variant="secondary">Locked</Badge>
              )}
            </div>
          </DialogHeader>

          <div className="bg-muted/50 p-4 rounded-xl border border-border">
            <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
              Criteria
            </p>
            <DialogDescription className="text-sm text-foreground">
              {selected?.description}
            </DialogDescription>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
