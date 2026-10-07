"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
import { User, FileText, GitPullRequest } from "lucide-react";
import { User as UserType, UserProfile, ActivityEntry } from "@/lib/types";
import { fetchUserProfile, fetchUserActivity } from "@/lib/api";
import { useUser } from "@/lib/UserContext";
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
    <div className="pt-3 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="rounded-2xl bg-brand-charcoal-card border border-border/60 p-4">
          <div className="flex gap-3.5 items-start">
            <SkeletonBlock className="w-14 h-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-5 w-40" />
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-3 w-2/3" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonBlock key={i} className="h-14 rounded-xl" />
          ))}
        </div>
        <SkeletonBlock className="h-32 rounded-xl" />
      </div>
    </div>
  );
}

export default function ProfileClient() {
  const { user } = useUser();
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
      <div className="min-h-dvh flex items-center justify-center">
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
      <div className="pt-3 pb-6 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Compact page label — desktop only title weight */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <User size={16} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-tight">
                Profile
              </h1>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Progress, rank, and activity
              </p>
            </div>
          </div>

          <ProfileHeader profile={profile} user={user} />

          <Tabs defaultValue="overview" className="w-full">
            <TabsList variant="line" className="w-full justify-start h-auto">
              <TabsTrigger value="overview" className="gap-1.5 text-sm">
                <FileText size={14} />
                Overview
              </TabsTrigger>
              <TabsTrigger value="contributions" className="relative gap-1.5 text-sm">
                <GitPullRequest size={14} />
                Contributions
                {hasContributionNotif && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse absolute -top-0.5 -right-0.5" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-3 mt-3">
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
                <div className="lg:col-span-4 min-w-0 overflow-x-auto">
                  <ContributionGraphSection activity={activity} />
                </div>
                <div className="lg:col-span-2">
                  <StatsOverview profile={profile} />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2">
                  <ProgressMetrics profile={profile} />
                </div>
                <div className="lg:col-span-1">
                  <Achievements profile={profile} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contributions" className="mt-3">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
