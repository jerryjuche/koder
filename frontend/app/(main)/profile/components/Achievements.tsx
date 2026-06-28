"use client";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AchievementsProps {
  profile: UserProfile;
}

const allAchievements = (profile: UserProfile) => [
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

export default function Achievements({ profile }: AchievementsProps) {
  const achievements = allAchievements(profile);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Award size={20} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Achievements
          </h3>
        </div>
        <Badge variant="outline" className="font-mono">
          {unlockedCount} / {achievements.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          return (
            <Dialog key={achievement.id}>
              <DialogTrigger asChild>
                <Card
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-0.5",
                    achievement.unlocked
                      ? "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                      : "opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                  )}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div
                      className={cn(
                        "p-3 rounded-xl flex-shrink-0 border transition-colors",
                        achievement.unlocked
                          ? achievement.bg
                          : "bg-muted",
                        achievement.unlocked
                          ? "border-transparent"
                          : "border-border"
                      )}
                    >
                      <Icon
                        size={24}
                        className={
                          achievement.unlocked
                            ? achievement.color
                            : "text-muted-foreground"
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={cn(
                            "font-bold text-sm",
                            achievement.unlocked
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {achievement.title}
                        </h4>
                        {achievement.unlocked && (
                          <CheckCircle2
                            size={14}
                            className="text-emerald-400 shrink-0"
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Click to view details
                      </p>
                    </div>
                  </div>
                </Card>
              </DialogTrigger>

              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <div className="text-center mb-2 mt-2">
                    <div
                      className={cn(
                        "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 border",
                        achievement.unlocked
                          ? achievement.bg
                          : "bg-muted/50",
                        achievement.unlocked
                          ? "border-transparent"
                          : "border-border"
                      )}
                    >
                      <Icon
                        size={40}
                        className={
                          achievement.unlocked
                            ? achievement.color
                            : "text-muted-foreground"
                        }
                      />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center">
                      {achievement.title}
                    </DialogTitle>
                  </div>
                  <div className="flex justify-center">
                    {achievement.unlocked ? (
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
                    {achievement.description}
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
          );
        })}
      </div>
    </Card>
  );
}


