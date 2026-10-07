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
      className="rounded-2xl border border-border/50 bg-brand-charcoal-card overflow-hidden"
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="p-4 sm:p-5 space-y-5">
        {/* Identity */}
        <div className="flex items-start gap-3.5">
          <Avatar
            src={!avatarError ? profile.google_avatar_url : undefined}
            name={profile.name}
            colorIndex={profile.color_index}
            size="lg"
            verified={user?.verified}
            className="border-2 border-primary/25 shadow-md rounded-full"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-foreground truncate leading-tight tracking-tight">
                  {profile.name}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {profile.username && (
                    <span className="text-sm font-mono text-primary/90">
                      @{profile.username.replace(/^@/, "")}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    {joinDate}
                  </span>
                </div>
              </div>

              <div className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/12 border border-primary/20 px-2.5 py-1 text-primary">
                <Zap size={13} className="fill-primary/20" />
                <span className="text-xs font-bold tabular-nums">Lv. {level}</span>
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* XP */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {xpInLevel.toLocaleString()} / 1,000 XP
            </span>
            <span className="text-xs font-semibold text-primary tabular-nums">
              {xpPercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted/70 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={mounted ? { width: `${xpPercent}%` } : {}}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
            />
          </div>
        </div>

        {/* Flattened stats — bigger & bolder on mobile */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          {[
            { icon: Zap, label: "XP", value: xp.toLocaleString(), color: "text-primary" },
            { icon: Flame, label: "Streak", value: streakDays, color: "text-orange-400" },
            { icon: CheckCircle2, label: "Solved", value: solvedCount, color: "text-emerald-400" },
            { icon: Hash, label: "Rank", value: profile.global_rank ? `#${profile.global_rank}` : "—", color: "text-primary" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="text-center py-1">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Icon size={13} className={`${color} shrink-0`} />
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold tabular-nums text-foreground leading-none">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Secondary metrics — clean inline */}
        <div className="flex items-center justify-center gap-5 sm:gap-6 text-sm">
          <div className="inline-flex items-center gap-1.5">
            <Target size={14} className="text-primary" />
            <span className="font-bold tabular-nums text-foreground">{successRate}%</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Rate</span>
          </div>
          <div className="w-px h-3.5 bg-border/60" />
          <div className="inline-flex items-center gap-1.5">
            <Trophy size={14} className="text-primary" />
            <span className="font-bold tabular-nums text-foreground">
              {profile.global_rank ? `#${profile.global_rank}` : "—"}
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Global</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-0.5">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 border-border/50 bg-background/20 hover:bg-background/40 text-foreground text-sm font-medium"
          >
            <Link href="/settings">
              <Settings size={14} />
              Edit Profile
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="h-9 text-muted-foreground/50 cursor-not-allowed text-sm"
          >
            <Share2 size={14} />
            Share
          </Button>
        </div>
      </div>
    </motion.div>
  );
}