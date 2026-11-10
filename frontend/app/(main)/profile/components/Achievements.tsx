"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/types";
import { Award, CheckCircle2, Lock, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
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
      <Card className="p-4 bg-brand-charcoal-card border border-border/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Award size={16} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground leading-tight">
                Achievements
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Badges from your progress
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="font-mono text-[11px] border-border/60 text-muted-foreground bg-background/40 tabular-nums"
          >
            {unlockedCount}/{achievements.length}
          </Badge>
        </div>

        <div className="space-y-1.5">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <button
                key={achievement.id}
                type="button"
                onClick={() => setSelected(achievement)}
                className="w-full text-left"
              >
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                    achievement.unlocked
                      ? "bg-brand-charcoal-panel/50 border-border/50 hover:border-primary/30"
                      : "bg-background/20 border-border/30 opacity-55"
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
                      achievement.unlocked
                        ? `${achievement.bg} ${achievement.border}`
                        : "bg-muted/30 border-border/40"
                    )}
                  >
                    <Icon
                      size={18}
                      className={
                        achievement.unlocked
                          ? achievement.color
                          : "text-muted-foreground/50"
                      }
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-sm text-foreground truncate">
                        {achievement.title}
                      </h4>
                      {achievement.unlocked && (
                        <CheckCircle2
                          size={12}
                          className="text-primary shrink-0"
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {achievement.description}
                    </p>
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-muted-foreground/50 shrink-0"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-sm bg-brand-charcoal-card border border-border/60">
          <DialogHeader>
            <div className="text-center mb-1 mt-1">
              <div
                className={cn(
                  "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 border",
                  selected?.unlocked
                    ? selected.bg + " " + selected.border
                    : "bg-muted/30 border-border/50"
                )}
              >
                {selected && (
                  <selected.icon
                    size={32}
                    className={
                      selected.unlocked
                        ? selected.color
                        : "text-muted-foreground/50"
                    }
                  />
                )}
              </div>
              <DialogTitle className="text-lg font-bold text-center text-foreground">
                {selected?.title}
              </DialogTitle>
            </div>
            <div className="flex justify-center">
              {selected?.unlocked ? (
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/25 gap-1"
                >
                  <CheckCircle2 size={12} />
                  Unlocked
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-muted/40 text-muted-foreground border-border/50 gap-1"
                >
                  <Lock size={12} />
                  Locked
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="bg-background/40 p-3 rounded-xl border border-border/50">
            <p className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
              How to unlock
            </p>
            <DialogDescription className="text-sm text-foreground/90">
              {selected?.criteria || selected?.description}
            </DialogDescription>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="w-full border-border/60 bg-background/30 text-foreground hover:bg-background/50"
              >
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
