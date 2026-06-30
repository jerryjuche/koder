"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/types";
import { Award, CheckCircle2 } from "lucide-react";
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        <Card className="p-6 bg-black/20 backdrop-blur-sm border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Award size={18} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Achievements</h3>
                <p className="text-xs text-white/40">Badges earned through progress</p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono border-white/10 text-white/50 bg-white/5">
              {unlockedCount} / {achievements.length}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {achievements.map((achievement, i) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSelected(achievement)}
                        className={cn(
                          "w-full aspect-square rounded-2xl flex items-center justify-center border transition-all duration-300",
                          achievement.unlocked
                            ? [
                                achievement.border,
                                achievement.bg,
                                "hover:ring-2 hover:ring-white/10 hover:-translate-y-1 hover:shadow-xl",
                                "hover:shadow-purple-500/10"
                              ].join(" ")
                            : "border-white/5 bg-white/[0.02] opacity-30 grayscale"
                        )}
                      >
                        <Icon
                          size={24}
                          className={achievement.unlocked ? achievement.color : "text-white/30"}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-44 bg-black/90 border border-white/10 text-white/80 backdrop-blur-md">
                      <p className="font-semibold text-xs mb-0.5">
                        {achievement.title}
                        {achievement.unlocked && (
                          <CheckCircle2 size={10} className="inline ml-1 text-amber-400" />
                        )}
                      </p>
                      <p className="text-[10px] text-white/50">
                        {achievement.description}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-sm bg-black/90 backdrop-blur-xl border border-white/10">
          <DialogHeader>
            <div className="text-center mb-2 mt-2">
              <div
                className={cn(
                  "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 border-2",
                  selected?.unlocked
                    ? selected.bg + " " + selected.border
                    : "bg-white/5 border-white/10"
                )}
              >
                {selected && (
                  <selected.icon
                    size={40}
                    className={
                      selected.unlocked
                        ? selected.color
                        : "text-white/30"
                    }
                  />
                )}
              </div>
              <DialogTitle className="text-2xl font-bold text-center text-white">
                {selected?.title}
              </DialogTitle>
            </div>
            <div className="flex justify-center">
              {selected?.unlocked ? (
                <Badge
                  variant="outline"
                  className="bg-amber-400/10 text-amber-400 border-amber-400/20 gap-1"
                >
                  <CheckCircle2 size={12} />
                  Unlocked
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-white/5 text-white/40 border-white/10">Locked</Badge>
              )}
            </div>
          </DialogHeader>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-xs text-white/40 mb-1 font-semibold uppercase tracking-wider">
              Criteria
            </p>
            <DialogDescription className="text-sm text-white/80">
              {selected?.criteria || selected?.description}
            </DialogDescription>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
