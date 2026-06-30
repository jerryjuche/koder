"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/lib/types";
import { getUserColor, cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Trophy,
  Settings,
  Share2,
  Check,
  Calendar,
  Target,
  Flame,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProfileHeaderProps {
  profile: UserProfile;
}

function MiniStat({ value, label, icon: Icon }: {
  value: number | string;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/5">
      <Icon size={13} className="shrink-0 text-amber-400/70" />
      <span className="text-sm font-bold text-white tabular-nums">{value}</span>
      <span className="text-[10px] text-white/50 uppercase tracking-wider hidden sm:inline">{label}</span>
    </div>
  );
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Profile link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const successRate = profile.stats.attempted_count > 0
    ? ((profile.stats.solved_count / profile.stats.attempted_count) * 100).toFixed(0)
    : "0";

  const xpInLevel = profile.xp % 1000;
  const xpPercent = Math.min(100, (xpInLevel / 1000) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={mounted ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-amber-600/5 animate-pulse-slow" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="relative backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl shadow-2xl">
        <div className="h-[3px] w-full bg-gradient-to-r from-amber-600/40 via-amber-400 to-amber-600/40" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            <div className="relative flex-shrink-0 group">
              <div className="absolute -inset-2 bg-gradient-to-br from-amber-400/30 via-amber-500/20 to-transparent rounded-full blur-md animate-pulse-slow" />
              <div className="absolute -inset-1 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-sm" />

              {profile.google_avatar_url && !avatarError ? (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-amber-400/30 shadow-lg overflow-hidden">
                  <Image
                    src={profile.google_avatar_url}
                    alt={profile.username ?? "Avatar"}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    "relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center",
                    "border-2 border-amber-400/30 shadow-lg",
                    getUserColor(profile.color_index)
                  )}
                >
                  <span className="text-3xl sm:text-4xl font-bold text-white tracking-wider">
                    {initials}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white truncate tracking-tight">
                      {profile.name}
                    </h2>
                    {profile.username && (
                      <span className="bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2.5 py-0.5 rounded-full text-xs font-mono shrink-0">
                        {profile.username}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5 text-white/50 text-sm">
                    <Calendar size={13} />
                    <span>Joined {joinDate}</span>
                  </div>

                  {profile.bio && (
                    <p className="text-sm text-white/60 mt-2 leading-relaxed max-w-xl">
                      {profile.bio}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 self-start flex items-center gap-3">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                      <motion.circle
                        cx="32" cy="32" r="28" fill="none"
                        stroke="url(#xpGrad)" strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                        animate={mounted ? { strokeDashoffset: 2 * Math.PI * 28 * (1 - xpPercent / 100) } : {}}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                      />
                      <defs>
                        <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#D4AF37" />
                          <stop offset="100%" stopColor="#F59E0B" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="text-center">
                      <div className="text-lg font-black text-white leading-none tracking-tight">{profile.level}</div>
                      <div className="text-[7px] text-amber-400/70 uppercase tracking-widest font-semibold">Level</div>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 rounded-xl border border-amber-500/20 text-center min-w-[110px] bg-amber-500/5">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Trophy size={12} className="text-amber-400" />
                      <span className="text-[9px] font-bold text-amber-400/70 uppercase tracking-wider">Rank</span>
                    </div>
                    <span className="text-xl font-bold text-amber-400 font-mono">
                      #{profile.global_rank || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-amber-400/70 font-mono font-semibold">{xpInLevel.toLocaleString()} / 1,000 XP</span>
                  <span className="text-white/40">{xpPercent.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
                    initial={{ width: 0 }}
                    animate={mounted ? { width: `${xpPercent}%` } : {}}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <MiniStat value={`#${profile.global_rank || "-"}`} label="Rank" icon={Trophy} />
                <MiniStat value={profile.stats.solved_count} label="Solved" icon={Target} />
                <MiniStat value={`${successRate}%`} label="Rate" icon={Zap} />
                <MiniStat value={`${profile.stats.current_streak_days}d`} label="Streak" icon={Flame} />
              </div>

              <div className="mt-5 flex items-center gap-3 flex-wrap">
                <Button variant="outline" size="sm" asChild className="border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-white/70">
                  <Link href="/settings">
                    <Settings size={14} />
                    Edit Profile
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={copyProfileLink} className="text-white/50 hover:text-white hover:bg-white/5">
                  {copied ? (
                    <><Check size={14} className="text-amber-400" /> Copied</>
                  ) : (
                    <><Share2 size={14} /> Share Profile</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
