"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
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

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] bg-[length:200%_100%] animate-shimmer ${className}`} />
  );
}

function ProfileSkeleton() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="rounded-2xl bg-[#242430]/40 backdrop-blur-sm border border-white/6 p-8">
          <div className="flex gap-6 items-start">
            <SkeletonBlock className="w-24 h-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <SkeletonBlock className="h-8 w-48" />
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonBlock key={i} className="h-28" />
          ))}
        </div>

        {/* Two column skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonBlock className="h-64" />
            <SkeletonBlock className="h-48" />
          </div>
          <div className="space-y-6">
            <SkeletonBlock className="h-64" />
            <SkeletonBlock className="h-48" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notifications } = useNotifications();

  const hasContributionNotif = useMemo(
    () => notifications.some(
      (n) =>
        !n.is_read &&
        (n.type === "contribution_approved" ||
          n.type === "contribution_rejected")
    ),
    [notifications]
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
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <p className="text-red-400 text-lg">
            {error || "Failed to load profile"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 rounded-xl transition font-medium"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page title */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="p-2.5 rounded-xl bg-[#7B8CBB]/10 border border-[#7B8CBB]/20">
              <User size={22} className="text-[#7B8CBB]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                My Profile
              </h1>
              <p className="text-white/40 text-sm">
                View your progress, rank, and problem-solving statistics
              </p>
            </div>
          </motion.div>

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
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse absolute -top-0.5 -right-1" />
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
                <div className="lg:col-span-1">
                  <Achievements profile={profile} />
                </div>
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
