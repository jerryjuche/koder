"use client";

import { useEffect, useState, useCallback } from "react";
import { User, Activity } from "lucide-react";
import { UserProfile } from "@/lib/types";
import { fetchUserProfile } from "@/lib/api";
import ProfileHeader from "./components/ProfileHeader";
import ProgressMetrics from "./components/ProgressMetrics";
import StatsOverview from "./components/StatsOverview";
import MyContributions from "./components/MyContributions";

export default function ProfileClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "contributions">("overview");
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const response = await fetchUserProfile();
        if (!mounted) return;
        if (response.success && response.data) {
          setProfile(response.data);
        } else {
          setError(response.error?.message || "Failed to load profile");
        }
      } catch (err) {
        if (!mounted) return;
        setError("An error occurred while loading your profile");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    const onUserUpdated = () => {
      loadData();
    };
    window.addEventListener("user-updated", onUserUpdated);
    return () => {
      mounted = false;
      window.removeEventListener("user-updated", onUserUpdated);
    };
  }, []);

  const handleNameUpdate = async () => {
    try {
      const response = await fetchUserProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      }
    } catch (err) {
      console.error("Failed to refresh profile after name update", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-charcoal-base py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="space-y-3">
            <div className="h-10 w-48 bg-brand-charcoal-card rounded-xl border border-brand-charcoal-border"></div>
            <div className="h-5 w-64 bg-brand-charcoal-card rounded-md border border-brand-charcoal-border"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column skeleton */}
            <div className="lg:col-span-1 space-y-6">
              <div className="h-72 bg-brand-charcoal-card rounded-2xl border border-brand-charcoal-border"></div>
              <div className="h-64 bg-brand-charcoal-card rounded-2xl border border-brand-charcoal-border"></div>
            </div>
            {/* Right column skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <div className="h-80 bg-brand-charcoal-card rounded-2xl border border-brand-charcoal-border"></div>
              <div className="h-48 bg-brand-charcoal-card rounded-2xl border border-brand-charcoal-border"></div>
              <div className="h-64 bg-brand-charcoal-card rounded-2xl border border-brand-charcoal-border"></div>
            </div>
          </div>
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
            <ProfileHeader profile={profile} onNameUpdate={handleNameUpdate} />
          </div>

          {/* Right column: Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 border-b border-brand-charcoal-border w-full">
                <button 
                  onClick={() => setActiveTab("overview")}
                  className={`pb-4 px-2 font-semibold transition ${activeTab === "overview" ? "text-brand-muted-gold border-b-2 border-brand-muted-gold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Overview
                </button>
                {/* Verified Contributor Tab */}
                <button 
                  onClick={() => setActiveTab("contributions")}
                  className={`pb-4 px-2 font-semibold transition ${activeTab === "contributions" ? "text-brand-muted-gold border-b-2 border-brand-muted-gold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  My Contributions
                </button>
              </div>
            </div>

            {activeTab === "overview" ? (
              <div className="space-y-6">
                <StatsOverview profile={profile} />
                <ProgressMetrics profile={profile} />
              </div>
            ) : (
              <div className="pt-4">
                <MyContributions />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
