"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/types";
import { Award, CheckCircle2, Lock, ChevronRight } from "lucide-react";
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
      <Card className="p-4 sm:p-5 bg-brand-charcoal-card border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Award size={18} className="text-primary shrink-0" />
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">
                Achievements
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Badges from your progress
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold tabular-nums text-muted-foreground">
            {unlockedCount}/{achievements.length}
          </span>
        </div>

        <div className="space-y-0.5">
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
                    "flex items-center gap-3 rounded-xl px-2.5 py-3 transition-colors",
                    achievement.unlocked ? "hover:bg-white/[0.04]" : "opacity-50"
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      "shrink-0",
                      achievement.unlocked ? achievement.color : "text-muted-foreground/40"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-[15px] sm:text-sm text-foreground truncate">
                        {achievement.title}
                      </h4>
                      {achievement.unlocked && (
                        <CheckCircle2 size={13} className="text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {achievement.description}
                    </p>
                  </div>
                  <ChevronRight size={15} className="text-muted-foreground/40 shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Dialog unchanged in logic — only visual soft container kept for large icon */}
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-sm bg-brand-charcoal-card border border-border/50">
          <DialogHeader>
            <div className="text-center mb-1 mt-1">
              <div
                className={cn(
                  "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 border",
                  selected?.unlocked
                    ? selected.bg + " " + selected.border
                    : "bg-muted/30 border-border/40"
                )}
              >
                {selected && (
                  <selected.icon
                    size={32}
                    className={selected.unlocked ? selected.color : "text-muted-foreground/50"}
                  />
                )}
              </div>
              <DialogTitle className="text-lg font-bold text-center text-foreground">
                {selected?.title}
              </DialogTitle>
            </div>
            <div className="flex justify-center">
              {selected?.unlocked ? (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 gap-1 text-xs">
                  <CheckCircle2 size={12} /> Unlocked
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-muted/40 text-muted-foreground border-border/50 gap-1 text-xs">
                  <Lock size={12} /> Locked
                </Badge>
              )}
            </div>
          </DialogHeader>

          <div className="bg-background/30 p-3.5 rounded-xl border border-border/40">
            <p className="text-[11px] text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">
              How to unlock
            </p>
            <DialogDescription className="text-sm text-foreground/90 leading-relaxed">
              {selected?.criteria || selected?.description}
            </DialogDescription>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="w-full border-border/50 bg-background/20 text-foreground hover:bg-background/40 text-sm font-medium"
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