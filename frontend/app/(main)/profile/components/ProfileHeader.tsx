"use client";

import { UserProfile } from "@/lib/types";
import { getUserColor, cn } from "@/lib/utils";
import Link from "next/link";
import { Trophy } from "lucide-react";

interface ProfileHeaderProps {
  profile: UserProfile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="bg-brand-charcoal-card rounded-2xl border border-brand-charcoal-border p-8 flex flex-col md:flex-row gap-8 items-start">
      {/* Avatar */}
      <div
        className={cn(
          "w-32 h-32 rounded-3xl flex-shrink-0 flex items-center justify-center shadow-lg border-2 border-brand-charcoal-border/50",
          getUserColor(profile.color_index)
        )}
      >
        <span className="text-5xl font-bold text-white tracking-wider">
          {profile.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col pt-2">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-3xl font-bold text-brand-offwhite">
            {profile.name}
          </h2>
          <span className="bg-brand-charcoal-base border border-brand-charcoal-border text-brand-offwhite-muted px-2.5 py-0.5 rounded-full text-xs font-mono">
            {profile.student_id}
          </span>
        </div>

        <p className="text-brand-offwhite-muted mb-6 max-w-2xl leading-relaxed text-sm">
          {profile.bio || "No bio provided. Update your profile in the settings to tell the community a little bit about yourself."}
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-auto">
          <Link
            href="/settings"
            className="px-6 py-2 bg-brand-charcoal-base hover:bg-brand-charcoal-hover border border-brand-charcoal-border text-brand-offwhite rounded-xl transition text-sm font-semibold"
          >
            Edit Profile
          </Link>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-muted-gold/10 border border-brand-muted-gold/30 text-brand-muted-gold rounded-xl text-sm font-semibold">
            <Trophy size={16} />
            <span>Global Rank: #{profile.global_rank || "Unranked"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
