"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  RefreshCw,
} from "lucide-react";
import { fetchLeaderboard, fetchUser } from "@/lib/api";
import { LeaderboardEntry, User } from "@/lib/types";
import { cn, getUserColor } from "@/lib/utils";

type Period = "weekly" | "monthly" | "all";

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

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<Period>("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(true);

  const loadData = async (silent = false, currentPeriod: Period = period) => {
    if (!silent) setRefreshing(true);
    try {
      const [lbRes, userRes] = await Promise.all([fetchLeaderboard(currentPeriod), fetchUser()]);
      if (!mounted.current) return;
      if (lbRes.success && lbRes.data) setLeaderboard(lbRes.data);
      if (userRes.success && userRes.data) setUser(userRes.data);
      setLastUpdated(new Date());
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    mounted.current = true;
    const timer = setTimeout(() => loadData(true, period), 0);
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => loadData(true, period), 30_000);
    const onUserUpdated = () => loadData(true, period);
    window.addEventListener("user-updated", onUserUpdated);
    return () => {
      mounted.current = false;
      clearTimeout(timer);
      if (pollingRef.current) clearInterval(pollingRef.current);
      window.removeEventListener("user-updated", onUserUpdated);
    };
  }, [period]);

  const filtered = useMemo(() => {
    if (!search.trim()) return leaderboard;
    const q = search.trim().toLowerCase();
    return leaderboard.filter(
      (e) =>
        e.user.name.toLowerCase().includes(q) ||
        e.user.studentId.toLowerCase().includes(q)
    );
  }, [leaderboard, search]);

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
        <div className="h-12 w-56 bg-brand-charcoal-card rounded-xl mx-auto" />
        <div className="h-4 w-72 bg-brand-charcoal-card rounded-xl mx-auto" />
        <div className="flex justify-center gap-5 items-end mt-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn("bg-brand-charcoal-card rounded-2xl", i === 2 ? "w-72 h-48" : "w-60 h-40")} />
          ))}
        </div>
        <div className="h-16 bg-brand-charcoal-card rounded-2xl" />
        <div className="bg-brand-charcoal-card rounded-2xl h-72" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 px-4 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="text-center space-y-4 pt-4 pb-2 relative">
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-brand-muted-gold/20 blur-3xl rounded-full" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-muted-gold/20 to-brand-charcoal-card border border-brand-muted-gold/30 flex items-center justify-center shadow-lg shadow-brand-muted-gold/10">
            <Trophy size={32} className="text-brand-muted-gold" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-brand-offwhite">Leaderboard</h1>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-brand-offwhite-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
            {leaderboard.length} student{leaderboard.length !== 1 ? "s" : ""} competing
          </span>
          {lastUpdated && (
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => loadData(false)}
            disabled={refreshing}
            className="text-brand-offwhite-muted hover:text-brand-offwhite transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Podium ── */}
      {leaderboard.length >= 1 && (
        <div className="flex justify-center gap-4 items-end pt-8 pb-4">
          {top3.map((entry, i) => {
            if (!entry?.user) return <div key={i} className={cn("w-60", i === 1 ? "h-44" : "h-36")} />;
            const rankVal = i === 1 ? 1 : i === 0 ? 2 : 3;
            const isFirst = rankVal === 1;

            const rankConfig = {
              1: {
                cardBg: "bg-gradient-to-b from-amber-500/10 via-brand-muted-gold/5 to-transparent border-brand-muted-gold/30 shadow-lg shadow-brand-muted-gold/5",
                avatarRing: "ring-brand-muted-gold",
                rankBadge: "bg-gradient-to-r from-amber-500 to-brand-muted-gold text-white shadow-lg shadow-amber-500/30",
                crown: true,
              },
              2: {
                cardBg: "bg-gradient-to-b from-slate-400/10 to-transparent border-slate-400/20 shadow-md shadow-slate-400/5",
                avatarRing: "ring-slate-400",
                rankBadge: "bg-slate-500/20 text-slate-300 border border-slate-400/30",
                crown: false,
              },
              3: {
                cardBg: "bg-gradient-to-b from-orange-600/10 to-transparent border-orange-500/20 shadow-md shadow-orange-500/5",
                avatarRing: "ring-orange-500",
                rankBadge: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
                crown: false,
              },
            }[rankVal];

            return (
              <div
                key={rankVal}
                className={cn(
                  "relative flex flex-col items-center px-6 pb-6 pt-8 rounded-2xl border transition-transform hover:-translate-y-1 duration-200",
                  rankConfig.cardBg,
                  isFirst ? "w-72 h-52" : "w-60 h-40"
                )}
              >
                {/* Rank badge */}
                <div className={cn("absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full", rankConfig.rankBadge)}>
                  {rankVal}{getRankSuffix(rankVal)}
                </div>

                {/* Crown for 1st */}
                {rankConfig.crown && (
                  <div className="absolute -top-6 text-lg">👑</div>
                )}

                {/* Avatar */}
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center font-bold text-base text-white shadow-lg ring-2 ring-offset-2 ring-offset-brand-charcoal-base",
                  rankConfig.avatarRing,
                  getUserColor(entry.user.colorIndex || 0)
                )}>
                  {getInitials(entry.user.name)}
                </div>

                <div className="text-center mt-3">
                  <div className={cn("font-bold truncate max-w-[10rem]", isFirst ? "text-lg text-brand-offwhite" : "text-base text-brand-offwhite-muted")}>
                    {entry.user.name}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-brand-muted-gold font-bold mt-1.5 text-sm">
                    <Zap size={12} />
                    {(entry.user.xp || 0).toLocaleString()} XP
                  </div>
                  <div className="flex items-center justify-center gap-1 text-brand-offwhite-muted text-xs mt-1">
                    <CheckCircle2 size={11} className="text-brand-success" />
                    {entry.user.solvedCount ?? 0} solved
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── My Ranking Banner ── */}
      {user && myEntry && (
        <div className="bg-gradient-to-r from-brand-muted-gold/10 via-brand-charcoal-card to-brand-charcoal-card border border-brand-muted-gold/25 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-brand-muted-gold/5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-brand-muted-gold/15 border border-brand-muted-gold/30 flex items-center justify-center font-mono font-bold text-brand-muted-gold text-lg shrink-0">
              {myRankInFull > 0 ? `#${myRankInFull}` : "—"}
            </div>
            <div className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center font-bold text-base text-white shadow-inner shrink-0",
              getUserColor(user.colorIndex)
            )}>
              {getInitials(user.name)}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-brand-muted-gold mb-0.5">Your Ranking</div>
              <div className="text-base font-bold text-brand-offwhite">{user.name}</div>
              <div className="text-xs text-brand-offwhite-muted font-mono">{user.studentId}</div>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-xl font-bold text-brand-muted-gold">{user.xp.toLocaleString()}</div>
              <div className="text-[10px] uppercase tracking-wider text-brand-offwhite-muted font-semibold">XP</div>
            </div>
            <div className="w-px h-8 bg-brand-charcoal-border hidden sm:block" />
            <div className="text-center">
              <div className="text-xl font-bold text-brand-offwhite">{user.solvedCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-brand-offwhite-muted font-semibold">Solved</div>
            </div>
            <div className="w-px h-8 bg-brand-charcoal-border hidden sm:block" />
            <div className="text-center">
              <div className="text-xl font-bold text-[#8DB4B9]">{formatTime(myEntry.bestTimeMs)}</div>
              <div className="text-[10px] uppercase tracking-wider text-brand-offwhite-muted font-semibold">Best</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-brand-charcoal-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-brand-charcoal-hover/20">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-offwhite-muted" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID…"
              className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg pl-9 pr-4 py-2 text-sm text-brand-offwhite placeholder:text-brand-offwhite-muted/60 focus:outline-none focus:border-brand-muted-gold transition-colors"
            />
          </div>

          <div className="flex items-center bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg p-1 gap-0.5">
            {(["weekly", "monthly", "all"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => { setRefreshing(true); setPeriod(p); }}
                className={cn(
                  "px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
                  period === p
                    ? "bg-brand-charcoal-hover text-brand-offwhite shadow-sm border border-brand-charcoal-border"
                    : "text-brand-offwhite-muted hover:text-brand-offwhite"
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
              <tr className="border-b border-brand-charcoal-border text-[10px] uppercase tracking-wider text-brand-offwhite-muted font-semibold">
                <th className="px-5 py-3 w-14 text-center">Rank</th>
                <th className="px-2 py-3 w-8 text-center">△</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-5 py-3 text-right">XP</th>
                <th className="px-5 py-3 text-center">Solved</th>
                <th className="px-5 py-3 text-right">Best Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal-border/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-brand-offwhite-muted text-sm">
                    {search ? `No students match "${search}"` : "No data available."}
                  </td>
                </tr>
              ) : (
                filtered.map((entry, idx) => {
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
                          ? "bg-brand-muted-gold/5 border-l-2 border-l-brand-muted-gold"
                          : "hover:bg-brand-charcoal-hover/40"
                      )}
                    >
                      {/* Rank */}
                      <td className="px-5 py-3.5 text-center">
                        {rank <= 3 ? (
                          <div className={cn(
                            "w-7 h-7 mx-auto rounded-lg flex items-center justify-center font-mono text-xs font-bold",
                            rank === 1 ? "bg-brand-muted-gold/20 text-brand-muted-gold" :
                            rank === 2 ? "bg-slate-400/15 text-slate-300" :
                            "bg-orange-500/15 text-orange-400"
                          )}>
                            {rank}
                          </div>
                        ) : (
                          <span className="text-sm font-mono text-brand-offwhite-muted">{rank}</span>
                        )}
                      </td>

                      {/* Delta */}
                      <td className="px-2 py-3.5 text-center">
                        {entry.rankDelta === 0 ? (
                          <Minus size={13} className="text-brand-offwhite-muted/50 mx-auto" />
                        ) : entry.rankDelta > 0 ? (
                          <div className="flex items-center justify-center text-brand-success gap-0.5">
                            <TrendingUp size={12} />
                            <span className="text-[10px] font-bold">{entry.rankDelta}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center text-brand-error gap-0.5">
                            <TrendingDown size={12} />
                            <span className="text-[10px] font-bold">{Math.abs(entry.rankDelta)}</span>
                          </div>
                        )}
                      </td>

                      {/* Student */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner shrink-0",
                            getUserColor(rowUser?.colorIndex || 0)
                          )}>
                            {initials}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-brand-offwhite flex items-center gap-2 leading-tight">
                              {rowUser?.name || "Unknown"}
                              {isMe && (
                                <span className="bg-brand-muted-gold/10 text-brand-muted-gold text-[9px] px-1.5 py-0.5 rounded border border-brand-muted-gold/30 uppercase tracking-wider font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-brand-offwhite-muted/70 font-mono mt-0.5">
                              {rowUser?.studentId || ""}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* XP */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 text-brand-muted-gold font-bold text-sm">
                          <Zap size={11} />
                          {(rowUser?.xp || 0).toLocaleString()}
                        </div>
                      </td>

                      {/* Solved */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <CheckCircle2
                            size={14}
                            className={(rowUser?.solvedCount ?? 0) > 0 ? "text-brand-success" : "text-brand-offwhite-muted/30"}
                          />
                          <span className="text-sm font-semibold text-brand-offwhite">
                            {rowUser?.solvedCount ?? 0}
                          </span>
                        </div>
                      </td>

                      {/* Best Time */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 font-mono text-sm text-[#8DB4B9]">
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
        <div className="px-5 py-3 border-t border-brand-charcoal-border/50 flex items-center justify-between text-[11px] text-brand-offwhite-muted bg-brand-charcoal-hover/10">
          <span>
            Showing {filtered.length} of {leaderboard.length} student{leaderboard.length !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
            Live — refreshes every 30s
          </span>
        </div>
      </div>
    </div>
  );
}
