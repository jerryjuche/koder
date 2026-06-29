"use client";

import { useEffect, useState, useMemo } from "react";
import { User, FileText, GitPullRequest } from "lucide-react";
import { UserProfile, ActivityEntry } from "@/lib/types";
import { fetchUserProfile, fetchUserActivity } from "@/lib/api";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from "./components/ProfileHeader";
import ProgressMetrics from "./components/ProgressMetrics";
import StatsOverview from "./components/StatsOverview";
import MyContributions from "./components/MyContributions";
import Achievements from "./components/Achievements";
import ActivityFeed from "./components/ActivityFeed";

import ContributionGraphSection from "./components/ContributionGraphSection";
import { useNotifications } from "@/lib/useNotifications";

export default function ProfileClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notifications } = useNotifications();

  const hasContributionNotif = notifications.some(
    (n) =>
      !n.is_read &&
      (n.type === "contribution_approved" ||
        n.type === "contribution_rejected")
  );

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [profileRes, activityRes] = await Promise.all([
          fetchUserProfile(),
          fetchUserActivity(),
        ]);
        if (!mounted) return;

        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
        } else {
          setError(profileRes.error?.message || "Failed to load profile");
          return;
        }

        if (activityRes.success && activityRes.data) {
          setActivity(activityRes.data);
        }
      } catch (err) {
        if (!mounted) return;
        setError("An error occurred while loading your profile");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    const onUserUpdated = () => loadData();
    window.addEventListener("user-updated", onUserUpdated);
    return () => {
      mounted = false;
      window.removeEventListener("user-updated", onUserUpdated);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          {/* Header skeleton */}
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="flex gap-6 items-start">
              <div className="w-24 h-24 rounded-2xl bg-muted" />
              <div className="flex-1 space-y-3">
                <div className="h-8 w-48 bg-muted rounded-lg" />
                <div className="h-4 w-32 bg-muted rounded-md" />
                <div className="h-16 w-3/4 bg-muted rounded-lg" />
              </div>
            </div>
          </div>
          {/* Stats skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-card rounded-xl border border-border" />
            ))}
          </div>
          {/* Two column skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-card rounded-xl border border-border" />
              <div className="h-48 bg-card rounded-xl border border-border" />
            </div>
            <div className="h-96 bg-card rounded-xl border border-border" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive text-lg">
            {error || "Failed to load profile"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg transition font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <User size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                My Profile
              </h1>
              <p className="text-muted-foreground text-sm">
                View your progress, rank, and problem-solving statistics
              </p>
            </div>
          </div>

          <ProfileHeader profile={profile} />

          <Tabs defaultValue="overview" className="w-full">
            <TabsList variant="line" className="w-full justify-start">
              <TabsTrigger value="overview" className="gap-2">
                <FileText size={16} />
                Overview
              </TabsTrigger>
              <TabsTrigger value="contributions" className="relative gap-2">
                <GitPullRequest size={16} />
                My Contributions
                {hasContributionNotif && (
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse absolute -top-0.5 -right-1" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <StatsOverview profile={profile} />

              <ContributionGraphSection activity={activity} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ProgressMetrics profile={profile} />
                </div>
                <Achievements profile={profile} />
              </div>

            </TabsContent>

            <TabsContent value="contributions" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <MyContributions />
                </div>
                <div>
                  <ActivityFeed
                    profile={profile}
                    activity={activity}
                    contributionCount={0}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}
