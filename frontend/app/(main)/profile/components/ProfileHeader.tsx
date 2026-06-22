"use client";

import { UserProfile } from "@/lib/types";
import { useState } from "react";
import { updateUserName } from "@/lib/api";
import { getUserColor, cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
  profile: UserProfile;
  onNameUpdate: () => void;
}



export default function ProfileHeader({
  profile,
  onNameUpdate,
}: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (name.trim() === profile.name) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateUserName(name.trim());
      if (response.success) {
        setIsEditing(false);
        onNameUpdate();
        // Notify other components (TopNav) to reload user data
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("user-updated"));
        }
      } else {
        alert(response.error?.message || "Failed to update name");
        setName(profile.name);
      }
    } catch (error) {
      alert("Error updating name");
      setName(profile.name);
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <div className="bg-brand-charcoal-card rounded-2xl border border-brand-charcoal-border p-6">
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(212,175,55,0.2)] border-2 border-brand-charcoal-base",
            getUserColor(profile.color_index)
          )}
        >
          <span className="text-4xl font-bold text-white shadow-inner">
            {profile.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Name - Editable */}
        <div className="w-full mb-4">
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="flex-1 px-3 py-2 bg-brand-charcoal-panel text-brand-offwhite rounded-lg border border-brand-charcoal-border focus:border-brand-muted-gold outline-none text-sm"
                autoFocus
                disabled={isSaving}
              />
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-2 bg-brand-muted-gold hover:bg-brand-muted-gold-dark disabled:bg-brand-charcoal-border text-brand-charcoal-base rounded-lg transition text-sm font-medium"
              >
                {isSaving ? "..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(profile.name);
                }}
                disabled={isSaving}
                className="px-3 py-2 bg-brand-charcoal-panel hover:bg-brand-charcoal-hover disabled:bg-brand-charcoal-border text-brand-offwhite rounded-lg transition text-sm font-medium border border-brand-charcoal-border"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-bold text-brand-offwhite">
                {profile.name}
              </h2>
              <button
                onClick={() => setIsEditing(true)}
                className="text-brand-offwhite-muted hover:text-brand-muted-gold transition p-1"
                title="Edit name"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Student ID & Status */}
        <div className="flex flex-col items-center gap-3 mb-5">
          <p className="text-sm text-brand-offwhite-muted">
            ID:{" "}
            <span className="text-brand-offwhite font-mono">
              {profile.student_id}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <div className="bg-[#1A2521] border border-brand-success/30 text-brand-success px-3 py-1 rounded-full flex items-center gap-2 text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse"></div>
              Active
            </div>
            {profile.stats.current_streak_days > 0 && (
              <div className="bg-brand-charcoal-panel border border-brand-muted-gold/30 text-brand-muted-gold px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium">
                <Flame size={12} />
                {profile.stats.current_streak_days} Day Streak
              </div>
            )}
          </div>
        </div>

        {/* Level and XP */}
        <div className="flex items-center gap-6 mb-5">
          <div className="text-center">
            <p className="text-[10px] text-brand-offwhite-muted uppercase tracking-wider font-semibold mb-1">Level</p>
            <p className="text-xl font-bold text-brand-offwhite">{profile.level}</p>
          </div>
          <div className="w-px h-8 bg-brand-charcoal-border"></div>
          <div className="text-center">
            <p className="text-[10px] text-brand-offwhite-muted uppercase tracking-wider font-semibold mb-1">XP</p>
            <p className="text-xl font-bold text-brand-muted-gold">{profile.xp.toLocaleString()}</p>
          </div>
        </div>

        {/* Join Date */}
        <p className="text-xs text-brand-offwhite-muted mb-6">
          Member since{" "}
          {new Date(profile.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* Edit Profile Placeholder Button */}
        <Link 
          href="/profile/edit"
          className="w-full mt-auto py-2 px-4 rounded-lg border border-brand-charcoal-border bg-brand-charcoal-panel hover:bg-brand-charcoal-hover text-brand-offwhite text-sm font-medium transition-colors text-center inline-block"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
