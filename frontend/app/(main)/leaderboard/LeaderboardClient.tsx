"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
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
import { cn, getUserColor } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
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
  const [avatarsFailed, setAvatarsFailed] = useState<Set<string>>(new Set());
  const mounted = useRef(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialLoad = useRef(true);

  const loadData = async (currentPeriod: Period = period) => {
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
  };

  useEffect(() => {
    mounted.current = true;
    loadData(period);
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => loadData(period), 30_000);
    const onUserUpdated = () => loadData(period);
    window.addEventListener("user-updated", onUserUpdated);
    return () => {
      mounted.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
      window.removeEventListener("user-updated", onUserUpdated);
    };
  }, [period]);

  // Reset avatar errors when user data changes (e.g. after Google sync)
  useEffect(() => {
    setAvatarsFailed(new Set());
  }, [user?.google_avatar_url]);

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
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse pt-4 pb-12 px-4">
        <div className="h-10 w-48 bg-card rounded-xl mx-auto" />
        <div className="h-4 w-64 bg-card rounded-xl mx-auto" />
        <div className="flex justify-center gap-5 items-end mt-12">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-card rounded-2xl border border-border",
                i === 2 ? "w-72 h-52" : "w-60 h-40"
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
      <div className="max-w-5xl mx-auto pb-12 px-4 animate-in fade-in duration-500">
        {/* Header */}
        <div className="text-center space-y-4 pt-4 pb-2 relative">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-card border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
              <Trophy size={32} className="text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Users size={14} />
            {leaderboard.length} student
            {leaderboard.length !== 1 ? "s" : ""} competing
          </p>
        </div>

        {/* Podium */}
        {leaderboard.length >= 1 && (
          <div className="flex justify-center gap-3 sm:gap-4 items-end pt-8 pb-4">
            {top3.map((entry, i) => {
              if (!entry?.user)
                return (
                  <div key={"empty-" + i} className={cn("w-56", i === 1 ? "h-52" : "h-44")} />
                );
              const rankVal = i === 1 ? 1 : i === 0 ? 2 : 3;
              const isFirst = rankVal === 1;
              const config = podiumConfig[rankVal];
              const RankIcon = config.rankIcon;

              return (
                <div
                  key={rankVal}
                  className={cn(
                    "relative flex flex-col items-center px-5 pb-5 pt-10 rounded-2xl border transition-transform hover:-translate-y-1 duration-200",
                    config.cardBg,
                    isFirst ? "w-64" : "w-56"
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
                    {entry.user.google_avatar_url &&
                    !avatarsFailed.has(entry.user.id) ? (
                      <div
                        className={cn(
                          "w-16 h-16 rounded-full overflow-hidden shadow-lg ring-[3px] ring-offset-2 ring-offset-background",
                          config.avatarRing
                        )}
                      >
                        <Image
                          src={entry.user.google_avatar_url}
                          alt={entry.user.username ?? "Avatar"}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          onError={() =>
                            setAvatarsFailed(
                              (prev) => new Set(prev).add(entry.user.id)
                            )
                          }
                        />
                      </div>
                    ) : (
                      <Avatar
                        className={cn(
                          "w-16 h-16 text-lg shadow-lg ring-[3px] ring-offset-2 ring-offset-background",
                          config.avatarRing
                        )}
                      >
                        <AvatarFallback
                          className={getUserColor(entry.user.colorIndex || 0)}
                        >
                          {getInitials(entry.user.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  {/* Name + Stats */}
                  <div className="text-center space-y-1.5 w-full">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p
                          className={cn(
                            "font-bold truncate max-w-[12rem] mx-auto",
                            isFirst
                              ? "text-[15px] text-foreground"
                              : "text-sm text-muted-foreground"
                          )}
                        >
                          {entry.user.name}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs bg-black/90 border border-white/10 text-white/80">
                        {entry.user.username && `@${entry.user.username}`}
                      </TooltipContent>
                    </Tooltip>

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
          <Card className="bg-gradient-to-r from-primary/10 via-card to-card border-primary/25 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-primary/5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center font-mono font-bold text-primary text-lg shrink-0">
                {myRankInFull > 0 ? `#${myRankInFull}` : "—"}
              </div>
              {user.google_avatar_url && !avatarsFailed.has(user.id) ? (
                <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-primary/30 ring-offset-2 ring-offset-background shrink-0">
                  <Image
                    src={user.google_avatar_url}
                    alt={user.username ?? "Avatar"}
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                    onError={() =>
                      setAvatarsFailed((prev) => new Set(prev).add(user.id))
                    }
                  />
                </div>
              ) : (
                <Avatar className="w-11 h-11 ring-2 ring-primary/30 ring-offset-2 ring-offset-background shrink-0">
                  <AvatarFallback className={getUserColor(user.colorIndex)}>
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              )}
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

        {/* Table */}
        <Card className="overflow-hidden shadow-sm">
          {/* Toolbar */}
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-muted/20">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username or name..."
                className="pl-9 h-9 text-sm"
              />
            </div>

            <div className="flex items-center bg-muted border border-border rounded-lg p-0.5 gap-0.5">
              {(["weekly", "monthly", "all"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="px-5 py-3 w-14 text-center">Rank</th>
                  <th className="px-2 py-3 w-8 text-center">
                    <span className="sr-only">Trend</span>
                  </th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-5 py-3 text-right">XP</th>
                  <th className="px-5 py-3 text-center">Solved</th>
                  <th className="px-5 py-3 text-right">Best Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {displayed.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-muted-foreground text-sm"
                    >
                      {search
                        ? `No students match "${search}"`
                        : "No data available."}
                    </td>
                  </tr>
                ) : (
                  displayed.map((entry, idx) => {
                    const rank = entry.rank ?? idx + 1;
                    const rowUser = entry.user;
                    const isMe = user?.id === rowUser?.id;
                    const initials = getInitials(rowUser?.name || "?");

                    return (
                      <tr
                        key={rowUser?.id || idx}
                        style={{ animationDelay: `${idx * 30}ms` }}
                        className={cn(
                          "group transition-all duration-150 animate-in fade-in slide-in-from-bottom-1",
                          isMe
                            ? "bg-primary/5 border-l-2 border-l-primary"
                            : "hover:bg-muted/40"
                        )}
                      >
                        {/* Rank */}
                        <td className="px-5 py-3.5 text-center">
                          {rank <= 3 ? (
                            <div
                              className={cn(
                                "w-7 h-7 mx-auto rounded-lg flex items-center justify-center font-mono text-xs font-bold",
                                rank === 1
                                  ? "bg-amber-500/20 text-amber-400"
                                  : rank === 2
                                    ? "bg-slate-400/15 text-slate-300"
                                    : "bg-orange-500/15 text-orange-400"
                              )}
                            >
                              {rank}
                            </div>
                          ) : (
                            <span className="text-sm font-mono text-muted-foreground">
                              {rank}
                            </span>
                          )}
                        </td>

                        {/* Delta */}
                        <td className="px-2 py-3.5 text-center">
                          {entry.rankDelta === 0 ? (
                            <Minus
                              size={13}
                              className="text-muted-foreground/50 mx-auto"
                            />
                          ) : entry.rankDelta > 0 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-center text-amber-400 gap-0.5 cursor-default">
                                  <TrendingUp size={12} />
                                  <span className="text-[10px] font-bold">
                                    {entry.rankDelta}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="text-xs">
                                Up {entry.rankDelta} rank
                                {entry.rankDelta !== 1 ? "s" : ""}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-center text-rose-400 gap-0.5 cursor-default">
                                  <TrendingDown size={12} />
                                  <span className="text-[10px] font-bold">
                                    {Math.abs(entry.rankDelta)}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="text-xs">
                                Down {Math.abs(entry.rankDelta)} rank
                                {Math.abs(entry.rankDelta) !== 1 ? "s" : ""}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </td>

                        {/* Student - Username primary, name on hover */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {rowUser?.google_avatar_url &&
                            !avatarsFailed.has(rowUser.id) ? (
                              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                                <Image
                                  src={rowUser.google_avatar_url}
                                  alt={rowUser.username ?? "Avatar"}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                  onError={() =>
                                    setAvatarsFailed(
                                      (prev) =>
                                        new Set(prev).add(rowUser.id)
                                    )
                                  }
                                />
                              </div>
                            ) : (
                              <Avatar className="w-8 h-8 text-xs shrink-0">
                                <AvatarFallback
                                  className={getUserColor(
                                    rowUser?.colorIndex || 0
                                  )}
                                >
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <div className="text-sm font-semibold text-foreground flex items-center gap-2 leading-tight">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="font-mono cursor-default">
                                      {rowUser?.username || rowUser?.name || "Unknown"}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs bg-black/90 border border-white/10 text-white/80">
                                    {rowUser?.name || "Unknown"}
                                  </TooltipContent>
                                </Tooltip>
                                {isMe && (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] px-1.5 py-0 h-4 text-primary border-primary/30 bg-primary/5 uppercase tracking-wider font-bold"
                                  >
                                    You
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* XP */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1 text-primary font-bold text-sm">
                            <Zap size={11} />
                            {(rowUser?.xp || 0).toLocaleString()}
                          </div>
                        </td>

                        {/* Solved */}
                        <td className="px-5 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <CheckCircle2
                              size={14}
                              className={
                                (rowUser?.solvedCount ?? 0) > 0
                                  ? "text-amber-400"
                                  : "text-muted-foreground/30"
                              }
                            />
                            <span className="text-sm font-semibold text-foreground">
                              {rowUser?.solvedCount ?? 0}
                            </span>
                          </div>
                        </td>

                        {/* Best Time */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5 font-mono text-sm text-amber-400">
                            <Clock size={12} className="opacity-60" />
                            {formatTime(entry.bestTimeMs)}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground bg-muted/10">
            <span>
              Showing {displayed.length} of {filtered.length} student
              {filtered.length !== 1 ? "s" : ""}
              {search && ` matching "${search}"`}
            </span>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}
