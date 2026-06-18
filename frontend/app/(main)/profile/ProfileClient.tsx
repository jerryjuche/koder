"use client";

import { useEffect, useState } from "react";
import { User, Activity } from "lucide-react";
import { UserProfile } from "@/lib/types";
import { fetchUserProfile } from "@/lib/api";
import ProfileHeader from "./components/ProfileHeader";
import RankStats from "./components/RankStats";
import ProgressMetrics from "./components/ProgressMetrics";
import PerformanceStats from "./components/PerformanceStats";

export default function ProfileClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUserProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.error?.message || "Failed to load profile");
      }
    } catch (err) {
      setError("An error occurred while loading your profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();

    // Also listen for global user-updated events to refresh profile
    const onUserUpdated = () => {
      loadProfile();
    };
    window.addEventListener("user-updated", onUserUpdated);
    return () => window.removeEventListener("user-updated", onUserUpdated);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-charcoal-base flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-muted-gold"></div>
          <p className="mt-4 text-brand-offwhite-muted">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-brand-charcoal-base flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-error text-lg">
            {error || "Failed to load profile"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base rounded-lg transition font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-charcoal-base py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <User size={32} className="text-brand-muted-gold" />
            <h1 className="text-3xl font-bold tracking-tight text-brand-offwhite">
              My Profile
            </h1>
          </div>
          <p className="text-brand-offwhite-muted">
            View your progress, rank, and problem-solving statistics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Header and Rank */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileHeader profile={profile} onNameUpdate={() => { loadProfile(); }} />
            <RankStats profile={profile} />
          </div>

          {/* Right column: Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <ProgressMetrics profile={profile} />
            <PerformanceStats profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}
