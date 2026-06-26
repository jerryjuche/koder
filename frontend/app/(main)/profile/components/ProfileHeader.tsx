"use client";

import { UserProfile } from "@/lib/types";
import { getUserColor, cn } from "@/lib/utils";
import Link from "next/link";
import { Trophy, Settings, Mail, Quote } from "lucide-react";

interface ProfileHeaderProps {
  profile: UserProfile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="bg-brand-charcoal-card rounded-2xl border border-brand-charcoal-border shadow-lg shadow-brand-charcoal-border/5 relative overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-brand-muted-gold/80 via-brand-muted-gold to-amber-400/80" />

      <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              "w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center",
              "border-2 border-brand-charcoal-border/60 shadow-xl",
              getUserColor(profile.color_index)
            )}
          >
            <span className="text-4xl sm:text-5xl font-bold text-white tracking-wider">
              {profile.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-brand-muted-gold/20 to-transparent -z-10 blur-sm" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-bold text-brand-offwhite truncate">
                  {profile.name}
                </h2>
                <span className="bg-brand-charcoal-base/80 border border-brand-charcoal-border text-brand-offwhite-muted px-2.5 py-0.5 rounded-full text-xs font-mono flex-shrink-0">
                  {profile.student_id}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-brand-offwhite-muted/70 text-sm">
                <Mail size={14} />
                <span>{profile.student_id}</span>
              </div>
            </div>

            {/* Global Rank Badge */}
            <div className="flex-shrink-0 self-start">
              <div className={cn(
                "px-4 py-2.5 rounded-xl border text-center min-w-[130px]",
                "bg-gradient-to-br from-amber-500/10 to-brand-muted-gold/5",
                "border-brand-muted-gold/30"
              )}>
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <Trophy size={14} className="text-brand-muted-gold" />
                  <span className="text-[10px] font-bold text-brand-muted-gold/80 uppercase tracking-wider">
                    Global Rank
                  </span>
                </div>
                <span className="text-xl font-bold text-brand-muted-gold font-mono">
                  #{profile.global_rank || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 relative">
              <div className="absolute -left-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-muted-gold/40 to-brand-muted-gold/5 rounded-full" />
              <p className="text-sm text-brand-offwhite-muted leading-relaxed pl-4 italic">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex items-center gap-3">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-5 py-2 bg-brand-charcoal-base hover:bg-brand-charcoal-hover border border-brand-charcoal-border text-brand-offwhite rounded-xl transition text-sm font-semibold"
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
