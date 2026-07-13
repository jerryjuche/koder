"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/base/avatar/avatar";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { fetchUserById } from "@/lib/api";
import { PublicUserData, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Zap, Hash, CheckCircle2 } from "lucide-react";

function Stat({ value, label, icon: Icon, color }: {
  value: string | number;
  label: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1">
        <Icon size={11} className={cn("shrink-0", color)} />
        <span className="text-base font-extrabold text-white tabular-nums leading-none">{value}</span>
      </div>
      <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest">{label}</span>
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
  const needsFetch = !user && !!userId;

  useEffect(() => {
    if (needsFetch) {
      fetchUserById(userId!).then((res) => {
        if (res.success && res.data) setData(res.data);
      });
    }
  }, [needsFetch, userId, user]);

  const info = user
    ? {
        name: user.name,
        username: user.username,
        xp: user.xp,
        level: user.level,
        solvedCount: user.solvedCount,
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
          colorIndex: data.color_index,
          avatarUrl: data.google_avatar_url,
          role: data.role,
          verified: data.verified,
        }
      : null;

  const loading = needsFetch && !data;

  const xpInLevel = info ? info.xp % 1000 : 0;
  const xpPercent = info ? Math.min(100, (xpInLevel / 1000) * 100) : 0;

  return (
    <HoverCard openDelay={400} closeDelay={150}>
      <HoverCardTrigger asChild>
        <span className={info ? "cursor-pointer" : ""}>{children}</span>
      </HoverCardTrigger>
      <HoverCardContent side={side} align={align}>
        {loading ? (
          <div className="flex items-center justify-center h-36">
            <div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : info ? (
          <div className="overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-[3px] w-full bg-gradient-to-r from-[#7B8CBB]/40 via-amber-400 to-[#7B8CBB]/40" />

            <div className="p-5 space-y-4">
              {/* Avatar + Name row */}
              <div className="flex items-center gap-3">
                <Avatar
                  src={info.avatarUrl}
                  name={info.name}
                  colorIndex={info.colorIndex}
                  size="md"
                  verified={info.verified}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{info.name}</span>
                    {info.verified && (
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider shrink-0">
                        Verified
                      </span>
                    )}
                    {info.role === "admin" && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/20 shrink-0">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/40 font-mono truncate mt-0.5">
                    @{info.username || "unknown"}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                <Stat value={info.xp.toLocaleString()} label="XP" icon={Zap} color="text-amber-400" />
                <Stat value={info.level} label="Level" icon={Hash} color="text-[#7B8CBB]" />
                <Stat value={info.solvedCount} label="Solved" icon={CheckCircle2} color="text-emerald-400" />
              </div>

              {/* XP Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/30 font-mono">{xpInLevel.toLocaleString()} / 1,000 XP</span>
                  <span className="text-amber-400/70 font-semibold">{xpPercent.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7B8CBB] via-amber-500 to-amber-400 transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
}
