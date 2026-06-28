"use client";

import { UserProfile } from "@/lib/types";
import { getUserColor, cn } from "@/lib/utils";
import Link from "next/link";
import { Trophy, Settings, Mail } from "lucide-react";

interface ProfileHeaderProps {
  profile: UserProfile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg relative overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 via-primary to-amber-400/80" />

      <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              "w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center",
              "border-2 border-border/60 shadow-xl",
              getUserColor(profile.color_index)
            )}
          >
            <span className="text-4xl sm:text-5xl font-bold text-white tracking-wider">
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </span>
          </div>
          <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent -z-10 blur-sm" />
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                  {profile.name}
                </h2>
                <span className="bg-muted/50 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full text-xs font-mono flex-shrink-0">
                  {profile.student_id}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground/70 text-sm">
                <Mail size={14} />
                <span>{profile.student_id}</span>
              </div>
            </div>

            <div className="flex-shrink-0 self-start">
              <div
                className={cn(
                  "px-4 py-2.5 rounded-xl border text-center min-w-[130px]",
                  "bg-gradient-to-br from-amber-500/10 to-primary/5",
                  "border-primary/30"
                )}
              >
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <Trophy size={14} className="text-primary" />
                  <span className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">
                    Global Rank
                  </span>
                </div>
                <span className="text-xl font-bold text-primary font-mono">
                  #{profile.global_rank || "—"}
                </span>
              </div>
            </div>
          </div>

          {profile.bio && (
            <div className="mt-4 relative">
              <div className="absolute -left-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 to-primary/5 rounded-full" />
              <p className="text-sm text-muted-foreground leading-relaxed pl-4 italic">
                {profile.bio}
              </p>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-5 py-2 bg-background hover:bg-muted border border-border text-foreground rounded-xl transition text-sm font-semibold"
            >
              <Settings size={15} />
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
