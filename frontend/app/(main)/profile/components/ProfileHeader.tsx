"use client";

import { useState } from "react";
import { User as UserType, UserProfile } from "@/lib/types";
import { useHasMounted } from "@/hooks/use-has-mounted";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Trophy,
  Settings,
  Share2,
  Calendar,
  Target,
  Flame,
  Zap,
  CheckCircle2,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/base/avatar/avatar";

interface ProfileHeaderProps {
  profile: UserProfile;
  user?: UserType | null;
}

export default function ProfileHeader({ profile, user }: ProfileHeaderProps) {
  const [avatarError, setAvatarError] = useState(false);
  const mounted = useHasMounted();

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const solvedCount = profile.stats.solved_count ?? user?.solvedCount ?? 0;
  const attemptedCount = profile.stats.attempted_count ?? user?.attemptedCount ?? 0;
  const successRate =
    attemptedCount > 0
      ? ((solvedCount / attemptedCount) * 100).toFixed(0)
      : "0";
  const streakDays = profile.stats.current_streak_days ?? user?.streak ?? 0;
  const xp = profile.xp ?? user?.xp ?? 0;
  const level = profile.level ?? user?.level ?? 1;

  const xpInLevel = xp % 1000;
  const xpPercent = Math.min(100, (xpInLevel / 1000) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={mounted ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-border/60 bg-brand-charcoal-card overflow-hidden"
    >
      {/* Gold accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="p-4 sm:p-5 space-y-4">
        {/* Identity row */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <Avatar
              src={!avatarError ? profile.google_avatar_url : undefined}
              name={profile.name}
              colorIndex={profile.color_index}
              size="lg"
              verified={user?.verified}
              className="border-2 border-primary/30 shadow-md rounded-full"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-foreground truncate leading-tight">
                  {profile.name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {profile.username && (
                    <span className="text-xs font-mono text-primary/90">
                      @{profile.username.replace(/^@/, "")}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar size={11} />
                    {joinDate}
                  </span>
                </div>
              </div>

              {/* Level badge */}
              <div className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/15 border border-primary/25 px-2.5 py-1 text-primary">
                <Zap size={12} className="fill-primary/20" />
                <span className="text-[11px] font-bold tabular-nums">Lv. {level}</span>
              </div>
            </div>

            {profile.bio && (
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* XP progress */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
              {xpInLevel.toLocaleString()} / 1,000 XP
            </span>
            <span className="text-[11px] font-semibold text-primary tabular-nums">
              {xpPercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted/80 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={mounted ? { width: `${xpPercent}%` } : {}}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
            />
          </div>
        </div>

        {/* 4-up stats — match home dashboard */}
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-xl bg-brand-charcoal-panel/80 border border-border/50 px-2 py-2.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap size={12} className="text-primary shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                XP
              </span>
            </div>
            <p className="text-sm font-bold tabular-nums text-foreground leading-none">
              {xp.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-brand-charcoal-panel/80 border border-border/50 px-2 py-2.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame size={12} className="text-orange-400 shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Streak
              </span>
            </div>
            <p className="text-sm font-bold tabular-nums text-foreground leading-none">
              {streakDays}
            </p>
          </div>
          <div className="rounded-xl bg-brand-charcoal-panel/80 border border-border/50 px-2 py-2.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Solved
              </span>
            </div>
            <p className="text-sm font-bold tabular-nums text-foreground leading-none">
              {solvedCount}
            </p>
          </div>
          <div className="rounded-xl bg-brand-charcoal-panel/80 border border-border/50 px-2 py-2.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Hash size={12} className="text-primary shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Rank
              </span>
            </div>
            <p className="text-sm font-bold tabular-nums text-foreground leading-none">
              {profile.global_rank ? `#${profile.global_rank}` : "—"}
            </p>
          </div>
        </div>

        {/* Secondary metrics row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/40 px-2.5 py-1.5">
            <Target size={12} className="text-primary" />
            <span className="text-xs font-bold tabular-nums text-foreground">{successRate}%</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Rate</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/40 px-2.5 py-1.5">
            <Trophy size={12} className="text-primary" />
            <span className="text-xs font-bold tabular-nums text-foreground">
              {profile.global_rank ? `#${profile.global_rank}` : "—"}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Global</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-0.5">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 border-border/60 bg-background/30 hover:bg-background/50 text-foreground text-xs"
          >
            <Link href="/settings">
              <Settings size={13} />
              Edit Profile
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="h-8 text-muted-foreground/50 cursor-not-allowed text-xs"
          >
            <Share2 size={13} />
            Share
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
