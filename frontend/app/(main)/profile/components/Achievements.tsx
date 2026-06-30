"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/types";
import { Award, CheckCircle2 } from "lucide-react";
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
import { getAchievements, type Achievement } from "@/lib/achievements";

interface AchievementsProps {
  profile: UserProfile;
}

export default function Achievements({ profile }: AchievementsProps) {
  const achievements = getAchievements(profile);
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
                      "w-full aspect-square rounded-full flex items-center justify-center border border-border transition-all duration-200",
                      achievement.unlocked
                        ? "hover:ring-2 hover:ring-primary/50 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg"
                        : "opacity-30 grayscale"
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
                  "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 border-2",
                  selected?.unlocked
                    ? selected.bg + " " + selected.border
                    : "bg-muted/50 border-border"
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
              {selected?.criteria || selected?.description}
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
