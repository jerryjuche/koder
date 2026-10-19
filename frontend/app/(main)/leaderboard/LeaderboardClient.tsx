"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  CheckCircle2,
  Clock,
  Zap,
  Medal,
  Crown,
  Users,
} from "lucide-react";
import { fetchLeaderboard, fetchUser } from "@/lib/api";
import { LeaderboardEntry, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/base/avatar/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileHoverCard } from "@/components/profile/ProfileHoverCard";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

type Period = "weekly" | "monthly" | "all";

const DISPLAY_LIMIT = 15;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function formatTime(ms: number): string {
  if (ms <= 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  if (remainder < 0.5) return `${minutes}m`;
  return `${minutes}m ${remainder.toFixed(1)}s`;
}

function getRankSuffix(rank: number): string {
  if (rank === 1) return "st";
  if (rank === 2) return "nd";
  if (rank === 3) return "rd";
  return "th";
}

const PERIOD_LABELS: Record<Period, string> = {
  weekly: "This Week",
  monthly: "This Month",
  all: "All Time",
};

const podiumConfig: Record<
  number,
  {
    cardBg: string;
    avatarRing: string;
    rankBadge: string;
    rankIcon: React.ElementType;
    rankColor: string;
  }
> = {
  1: {
    cardBg:
      "bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30 shadow-lg shadow-amber-500/5",
    avatarRing: "ring-amber-400",
    rankBadge:
      "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30",
    rankIcon: Crown,
    rankColor: "text-amber-400",
  },
  2: {
    cardBg:
      "bg-gradient-to-b from-slate-400/10 to-transparent border-slate-400/20 shadow-md shadow-slate-400/5",
    avatarRing: "ring-slate-400",
    rankBadge: "bg-slate-500/20 text-slate-300 border border-slate-400/30",
    rankIcon: Medal,
    rankColor: "text-slate-300",
  },
  3: {
    cardBg:
      "bg-gradient-to-b from-orange-600/10 to-transparent border-orange-500/20 shadow-md shadow-orange-500/5",
    avatarRing: "ring-orange-500",
    rankBadge: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    rankIcon: Medal,
    rankColor: "text-orange-400",
  },
};

export default function LeaderboardClient() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<Period>("all");
  const mounted = useRef(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialLoad = useRef(true);

  const loadData = useCallback(async (currentPeriod: Period = period) => {
    try {
      const [lbRes, userRes] = await Promise.all([
        fetchLeaderboard(currentPeriod),
        fetchUser(),
      ]);
      if (!mounted.current) return;
      if (lbRes.success && lbRes.data) setLeaderboard(lbRes.data);
      if (userRes.success && userRes.data) setUser(userRes.data);
    } finally {
      if (mounted.current) {
        setLoading(false);
        initialLoad.current = false;
      }
    }
  }, [period]);

  useEffect(() => {
    mounted.current = true;
    const loadAndPoll = async () => {
      await loadData(period);
    };
    loadAndPoll();
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => loadData(period), 7_000);
    const onUserUpdated = () => loadData(period);
    window.addEventListener("user-updated", onUserUpdated);
    return () => {
      mounted.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
      window.removeEventListener("user-updated", onUserUpdated);
    };
  }, [period, loadData]);

  const filtered = useMemo(() => {
    const all = leaderboard;
    if (!search.trim()) return all;
    const q = search.trim().toLowerCase();
    return all.filter(
      (e) =>
        e.user.username?.toLowerCase().includes(q) ||
        e.user.name.toLowerCase().includes(q) ||
        e.user.studentId.toLowerCase().includes(q)
    );
  }, [leaderboard, search]);

  const displayed = useMemo(() => filtered.slice(0, DISPLAY_LIMIT), [filtered]);

  const myRankInFull = useMemo(
    () => leaderboard.findIndex((e) => e.user.id === user?.id) + 1,
    [leaderboard, user]
  );
  const myEntry = useMemo(
    () => leaderboard.find((e) => e.user.id === user?.id),
    [leaderboard, user]
  );

  const top3 = [leaderboard[1], leaderboard[0], leaderboard[2]];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse pt-4 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="h-10 w-48 bg-card rounded-xl mx-auto" />
        <div className="h-4 w-64 bg-card rounded-xl mx-auto" />
        <div className="flex flex-wrap justify-center gap-2.5 md:gap-3 lg:gap-4 items-end mt-12">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-card rounded-2xl border border-border w-[calc(50%-0.3125rem)] md:w-52",
                i === 1 ? "h-52 lg:w-64" : "h-40 lg:w-56"
              )}
            />
          ))}
        </div>
        <div className="h-16 bg-card rounded-2xl border border-border" />
        <div className="bg-card rounded-2xl border border-border h-72" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-w-5xl mx-auto pt-3 pb-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
        {/* Header — compact standard ranking chrome */}
        <div className="flex items-center gap-3 pt-1 pb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
            <Trophy size={20} className="text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-tight">
              Leaderboard
            </h1>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Users size={12} />
              {leaderboard.length} student
              {leaderboard.length !== 1 ? "s" : ""} competing
            </p>
          </div>
        </div>

        {/* Podium */}
        {leaderboard.length >= 1 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-5 pb-4 max-w-lg mx-auto">
            {top3.map((entry, i) => {
              if (!entry?.user)
                return (
                  <div key={"empty-" + i} className={cn("w-full", i === 1 ? "h-48" : "h-40")} />
                );
              const rankVal = i === 1 ? 1 : i === 0 ? 2 : 3;
              const isFirst = rankVal === 1;
              const config = podiumConfig[rankVal];
              const RankIcon = config.rankIcon;

              return (
                <div
                  key={rankVal}
                  className={cn(
                    "relative flex flex-col items-center px-2 sm:px-4 pb-4 pt-8 rounded-2xl border transition-transform hover:-translate-y-1 duration-200 w-full",
                    config.cardBg,
                    isFirst ? "pb-5 pt-9 shadow-lg shadow-primary/10" : ""
                  )}
                >
                  {/* Rank badge */}
                  <div
                    className={cn(
                      "absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg",
                      config.rankBadge
                    )}
                  >
                    <RankIcon size={13} />
                    <span>{rankVal}{getRankSuffix(rankVal)}</span>
                  </div>

                  {/* Avatar */}
                  <div className="mb-3">
                    <Avatar
                      src={entry.user.google_avatar_url}
                      name={entry.user.name}
                      colorIndex={entry.user.colorIndex || 0}
                      size="podium"
                      verified={entry.user.verified}
                      className={cn(
                        "shadow-lg ring-[3px] ring-offset-2 ring-offset-background",
                        config.avatarRing
                      )}
                    />
                  </div>

                  {/* Name + Stats */}
                  <div className="text-center space-y-1.5 w-full">
                    <ProfileHoverCard user={entry.user}>
                      <p
                        className={cn(
                          "font-bold truncate max-w-[12rem] mx-auto cursor-pointer",
                          isFirst
                            ? "text-[15px] text-foreground"
                            : "text-sm text-muted-foreground"
                        )}
                      >
                        {entry.user.name}
                      </p>
                    </ProfileHoverCard>

                    <div className="flex items-center justify-center gap-1.5 text-primary font-semibold">
                      <Zap size={12} className="shrink-0" />
                      <span className="text-sm">{(entry.user.xp || 0).toLocaleString()} XP</span>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                      <CheckCircle2 size={11} className="text-amber-400 shrink-0" />
                      <span className="text-[11px]">{entry.user.solvedCount ?? 0} solved</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* My Ranking Banner */}
        {user && myEntry && (
          <Card className="bg-gradient-to-r from-primary/10 via-card to-card border-primary/25 px-4 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-primary/5 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center font-mono font-bold text-primary text-lg shrink-0">
                {myRankInFull > 0 ? `#${myRankInFull}` : "—"}
              </div>
              <Avatar
                src={user.google_avatar_url}
                name={user.name}
                colorIndex={user.colorIndex}
                size="md"
                verified={user.verified}
                className="ring-2 ring-primary/30 ring-offset-2 ring-offset-background shrink-0"
              />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
                  Your Ranking
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-base font-bold text-foreground font-mono cursor-default">
                      {user.username || user.studentId}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs bg-black/90 border border-white/10 text-white/80">
                    {user.name}
                  </TooltipContent>
                </Tooltip>
                <div className="text-xs text-muted-foreground font-mono">
                  {user.studentId}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-xl font-bold text-primary">
                  {user.xp.toLocaleString()}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  XP
                </div>
              </div>
              <div className="w-px h-8 bg-border hidden sm:block" />
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">
                  {user.solvedCount}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Solved
                </div>
              </div>
              <div className="w-px h-8 bg-border hidden sm:block" />
              <div className="text-center">
                <div className="text-xl font-bold text-cyan-400">
                  {formatTime(myEntry.bestTimeMs)}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Best
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Rank list — mobile-first cards, no horizontal scroll */}
        <Card className="overflow-hidden shadow-sm border-border/60">
          {/* Toolbar */}
          <div className="p-3 border-b border-border flex flex-col gap-2.5 bg-muted/20">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username or name..."
                className="pl-9 h-10 text-sm"
              />
            </div>

            <div className="flex items-center bg-muted border border-border rounded-lg p-0.5 gap-0.5 w-full">
              {(["weekly", "monthly", "all"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-all",
                    period === p
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-border/40">
            {displayed.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                No students match your search.
              </div>
            ) : (
              displayed.map((entry, index) => {
                const rank = index + 1;
                const rowUser = entry.user;
                const isMe = rowUser?.id === user?.id;
                const isTop3 = rank <= 3;

                return (
                  <div
                    key={rowUser?.id || rank}
                    className={cn(
                      "flex items-center gap-3 px-3 sm:px-4 py-3.5",
                      isMe && "bg-primary/5",
                      isTop3 && rank === 1 && "bg-amber-500/[0.06]"
                    )}
                  >
                    {/* Rank badge */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 tabular-nums",
                        rank === 1 && "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                        rank === 2 && "bg-slate-400/20 text-slate-300 border border-slate-400/30",
                        rank === 3 && "bg-orange-500/20 text-orange-400 border border-orange-500/30",
                        rank > 3 && "bg-muted/60 text-muted-foreground border border-border/50"
                      )}
                    >
                      {rank}
                    </div>

                    {/* Avatar */}
                    <Avatar
                      src={rowUser?.google_avatar_url}
                      name={rowUser?.name || "?"}
                      colorIndex={rowUser?.colorIndex}
                      size="md"
                      verified={rowUser?.verified}
                      className="shrink-0"
                    />

                    {/* Name + meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <ProfileHoverCard user={rowUser}>
                          <p className="text-[15px] font-semibold text-foreground truncate cursor-pointer">
                            {rowUser?.username || rowUser?.name || "—"}
                          </p>
                        </ProfileHoverCard>
                        {isMe && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 h-4 text-primary border-primary/30 bg-primary/5 uppercase tracking-wider font-bold shrink-0"
                          >
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {rowUser?.solvedCount ?? 0} solved
                        {entry.bestTimeMs != null && entry.bestTimeMs > 0
                          ? ` · best ${formatTime(entry.bestTimeMs)}`
                          : ""}
                      </p>
                    </div>

                    {/* XP — always visible, no horizontal scroll */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-1 text-primary font-bold text-[15px] tabular-nums">
                        <Zap size={13} className="shrink-0" />
                        {(rowUser?.xp || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                        XP
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground bg-muted/10">
            <span>
              Showing {displayed.length} of {filtered.length} student
              {filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}
