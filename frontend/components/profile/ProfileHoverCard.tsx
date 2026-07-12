"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/base/avatar/avatar";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { fetchUserById } from "@/lib/api";
import { PublicUserData, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Zap, Trophy, CheckCircle2, Flame, Hash } from "lucide-react";

function Stat({ value, label, icon: Icon, color }: {
  value: string | number;
  label: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={12} className={cn("shrink-0", color)} />
      <span className="text-sm font-bold text-white tabular-nums">{value}</span>
      <span className="text-[9px] text-white/40 uppercase tracking-wider">{label}</span>
    </div>
  );
}

interface ProfileHoverCardProps {
  children: React.ReactNode;
  user?: User | null;
  userId?: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

export function ProfileHoverCard({ children, user, userId, side = "top", align = "center" }: ProfileHoverCardProps) {
  const [data, setData] = useState<PublicUserData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && !user) {
      setLoading(true);
      fetchUserById(userId).then((res) => {
        if (res.success && res.data) setData(res.data);
        setLoading(false);
      });
    }
  }, [userId, user]);

  const info = user
    ? {
        name: user.name,
        username: user.username,
        xp: user.xp,
        level: user.level,
        solvedCount: user.solvedCount,
        streak: user.streak,
        colorIndex: user.colorIndex,
        avatarUrl: user.google_avatar_url,
        role: user.role,
        verified: user.verified,
      }
    : data
      ? {
          name: data.name,
          username: data.username,
          xp: data.xp,
          level: data.level,
          solvedCount: data.solved_count,
          streak: data.streak,
          colorIndex: data.color_index,
          avatarUrl: data.google_avatar_url,
          role: data.role,
          verified: data.verified,
        }
      : null;

  if (!info) {
    return <>{children}</>;
  }

  return (
    <HoverCard openDelay={400} closeDelay={150}>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer">{children}</span>
      </HoverCardTrigger>
      <HoverCardContent side={side} align={align}>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {/* Avatar + Name row */}
            <div className="flex items-center gap-3">
              <Avatar
                src={info.avatarUrl}
                name={info.name}
                colorIndex={info.colorIndex}
                size="md"
                verified={info.verified}
              />
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate flex items-center gap-2">
                  {info.name}
                  {info.role === "admin" && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/20">
                      Admin
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/40 font-mono truncate">
                  @{info.username || "unknown"}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5" />

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2">
              <Stat value={info.xp.toLocaleString()} label="XP" icon={Zap} color="text-amber-400" />
              <Stat value={`#${info.level}`} label="Level" icon={Hash} color="text-[#7B8CBB]" />
              <Stat value={info.solvedCount} label="Solved" icon={CheckCircle2} color="text-emerald-400" />
              <Stat value={info.streak} label="Day Streak" icon={Flame} color="text-orange-400" />
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
