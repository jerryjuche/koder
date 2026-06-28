"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/types";
import { getUserColor, cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import {
  Trophy,
  Settings,
  Calendar,
  Share2,
  Copy,
  Check,
  MapPin,
  Globe,
  Mail,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProfileHeaderProps {
  profile: UserProfile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

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

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm relative overflow-hidden">
      {/* Accent gradient line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 via-primary to-amber-400/80" />

      <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
        {/* Avatar — Gitea image or initials fallback */}
        <div className="relative flex-shrink-0">
          {profile.gitea_avatar_url && !avatarError ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-border shadow-lg overflow-hidden">
              <Image
                src={profile.gitea_avatar_url}
                alt={profile.gitea_username ?? "Gitea avatar"}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            </div>
          ) : (
            <div
              className={cn(
                "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center",
                "border-[3px] border-border shadow-lg",
                getUserColor(profile.color_index)
              )}
            >
              <span className="text-3xl sm:text-4xl font-bold text-white tracking-wider">
                {initials}
              </span>
            </div>
          )}
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-primary/20 to-transparent -z-10 blur-sm" />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                  {profile.name}
                </h2>
                <span className="bg-muted/50 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full text-xs font-mono flex-shrink-0">
                  @{profile.student_id}
                </span>
                {profile.gitea_username && (
                  <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-mono flex-shrink-0">
                    <GitBranch size={12} />
                    {profile.gitea_username}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground text-sm">
                <Mail size={14} />
                <span>{profile.student_id}</span>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Joined {joinDate}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy size={12} className="text-primary" />
                  Level {profile.level}
                </span>
              </div>
            </div>

            {/* Rank badge */}
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

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 relative">
              <div className="absolute -left-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 to-primary/5 rounded-full" />
              <p className="text-sm text-muted-foreground leading-relaxed pl-4 italic">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Settings size={15} />
                Edit Profile
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={copyProfileLink}>
              {copied ? (
                <>
                  <Check size={15} className="text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={15} />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
