"use client";

import { useEffect, useState, useMemo } from "react";
import { User, FileText, GitPullRequest } from "lucide-react";
import { UserProfile } from "@/lib/types";
import { fetchUserProfile } from "@/lib/api";
import {
  eachDayOfInterval,
  endOfYear,
  formatISO,
  startOfYear,
} from "date-fns";
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphTotalCount,
  ContributionGraphLegend,
} from "@/components/kibo-ui/contribution-graph";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from "./components/ProfileHeader";
import ProgressMetrics from "./components/ProgressMetrics";
import StatsOverview from "./components/StatsOverview";
import MyContributions from "./components/MyContributions";
import Achievements from "./components/Achievements";
import RecentActivity from "./components/RecentActivity";
import { useNotifications } from "@/lib/useNotifications";

export default function ProfileClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { notifications } = useNotifications();

  const hasContributionNotif = notifications.some(
    (n) =>
      !n.is_read &&
      (n.type === "contribution_approved" ||
        n.type === "contribution_rejected")
  );

  const [error, setError] = useState<string | null>(null);

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

    const onUserUpdated = () => loadData();
    window.addEventListener("user-updated", onUserUpdated);
    return () => {
      mounted = false;
      window.removeEventListener("user-updated", onUserUpdated);
    };
  }, []);

  const contributionData = useMemo(() => {
    const now = new Date();
    const days = eachDayOfInterval({
      start: startOfYear(now),
      end: endOfYear(now),
    });

    const maxCount = 20;
    return days.map((date) => {
      const c = Math.round(
        Math.random() * maxCount - Math.random() * (0.8 * maxCount)
      );
      const count = Math.max(0, c);
      const level = Math.ceil((count / maxCount) * 4);

      return {
        date: formatISO(date, { representation: "date" }),
        count,
        level,
      };
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          <div className="space-y-3">
            <div className="h-10 w-48 bg-card rounded-xl border border-border" />
            <div className="h-5 w-64 bg-card rounded-md border border-border" />
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-card rounded-2xl border border-border"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[400px] bg-card rounded-2xl border border-border" />
              <div className="h-[400px] bg-card rounded-2xl border border-border" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg">
            {error || "Failed to load profile"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg transition font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background py-8 px-4 sm:px-6 lg:px-8">
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

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Activity
              </h3>
              <TooltipProvider>
                <ContributionGraph data={contributionData}>
                  <ContributionGraphCalendar>
                    {({ activity, dayIndex, weekIndex }) => (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <g>
                            <ContributionGraphBlock
                              activity={activity}
                              className="cursor-pointer"
                              dayIndex={dayIndex}
                              weekIndex={weekIndex}
                            />
                          </g>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-semibold">{activity.date}</p>
                          <p>{activity.count} contributions</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </ContributionGraphCalendar>
                  <ContributionGraphFooter>
                    <ContributionGraphTotalCount />
                    <ContributionGraphLegend />
                  </ContributionGraphFooter>
                </ContributionGraph>
              </TooltipProvider>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProgressMetrics profile={profile} />
              </div>
              <Achievements profile={profile} />
            </div>

            <RecentActivity profile={profile} />
          </TabsContent>

          <TabsContent value="contributions" className="mt-6">
            <MyContributions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
