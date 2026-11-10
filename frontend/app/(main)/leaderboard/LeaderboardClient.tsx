"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, Users, X } from "lucide-react";
import { fetchLeaderboard, fetchUser } from "@/lib/api";
import { LeaderboardEntry, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/base/avatar/avatar";
import Podium from "@/components/leaderboard/Podium";
import RankRow from "@/components/leaderboard/RankRow";

type Period = "weekly" | "monthly" | "all";

const DISPLAY_LIMIT = 15;

const PERIOD_LABELS: Record<Period, string> = {
  weekly: "This Week",
  monthly: "This Month",
  all: "All Time",
};

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

function Stat({ label, value, toneClass }: { label: string; value: string; toneClass: string }) {
  return (
    <div className="flex flex-col-reverse text-left sm:text-right">
      <dt className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-brand-offwhite-muted">
        {label}
      </dt>
      <dd className={cn("text-lg font-extrabold leading-none tabular-nums", toneClass)}>
        {value}
      </dd>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 pb-10 pt-3 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-3 pb-1">
        <div className="space-y-2">
          <div className="h-3 w-12 rounded bg-brand-charcoal-card" />
          <div className="h-7 w-40 rounded-lg bg-brand-charcoal-card" />
        </div>
        <div className="h-8 w-24 rounded-xl bg-brand-charcoal-card" />
      </div>
      <div className="grid grid-cols-3 items-end gap-2 pt-5 sm:gap-3">
        <div className="h-36 rounded-2xl bg-brand-charcoal-card" />
        <div className="h-44 rounded-2xl bg-brand-charcoal-card" />
        <div className="h-36 rounded-2xl bg-brand-charcoal-card" />
      </div>
      <div className="mt-5 h-16 rounded-2xl bg-brand-charcoal-card" />
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-brand-charcoal-card">
        <div className="flex flex-col gap-2.5 border-b border-border/60 p-3">
          <div className="h-10 rounded-xl bg-brand-charcoal-panel" />
          <div className="h-10 rounded-lg bg-brand-charcoal-panel" />
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-t border-border/40 px-4 py-3">
            <div className="h-4 w-4 rounded bg-brand-charcoal-panel" />
            <div className="size-10 shrink-0 rounded-full bg-brand-charcoal-panel" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-28 rounded bg-brand-charcoal-panel" />
              <div className="h-3 w-20 rounded bg-brand-charcoal-panel" />
            </div>
            <div className="h-4 w-14 rounded bg-brand-charcoal-panel" />
          </div>
        ))}
      </div>
    </div>
  );
}

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

  /** Podium placement order — the winner sits in the middle column. */
  const top3 = [leaderboard[1], leaderboard[0], leaderboard[2]];

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="mx-auto max-w-5xl animate-in fade-in duration-500 px-4 pb-10 pt-3 sm:px-6 lg:px-8">
      {/* Header — same eyebrow + extrabold name rhythm as the dashboard */}
      <header className="flex items-end justify-between gap-3 pb-1">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-brand-muted-gold">Ranks</p>
          <h1 className="mt-1 truncate text-[26px] font-extrabold leading-none tracking-tight text-foreground sm:text-3xl">
            Leaderboard
          </h1>
        </div>
        <p className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-brand-charcoal-card px-2.5 py-1.5 text-xs font-semibold text-brand-offwhite-muted">
          <Users size={13} className="text-brand-muted-gold" aria-hidden="true" />
          <span className="tabular-nums">{leaderboard.length}</span>
          <span className="hidden sm:inline">students</span>
        </p>
      </header>

      {leaderboard.length >= 1 && <Podium entries={top3} />}

      {/* Your ranking */}
      {user && myEntry && (
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-primary/25 bg-primary/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-mono text-base font-bold tabular-nums text-primary">
              {myRankInFull > 0 ? `#${myRankInFull}` : "—"}
            </span>
            <Avatar
              src={user.google_avatar_url}
              name={user.name}
              colorIndex={user.colorIndex}
              size="md"
              verified={user.verified}
              className="shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Your ranking
              </p>
              <p title={user.name} className="truncate text-sm font-bold text-foreground">
                {user.username || user.studentId}
              </p>
              <p className="truncate text-xs text-brand-offwhite-muted">{user.studentId}</p>
            </div>
          </div>
          <dl className="flex items-center gap-5 sm:gap-7">
            <Stat label="XP" value={user.xp.toLocaleString()} toneClass="text-primary" />
            <Stat label="Solved" value={String(user.solvedCount)} toneClass="text-foreground" />
            <Stat label="Best" value={formatTime(myEntry.bestTimeMs)} toneClass="text-foreground" />
          </dl>
        </div>
      )}

      {/* Rank list */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-brand-charcoal-card">
        <div className="flex flex-col gap-2.5 border-b border-border/60 p-3">
          <div className="relative">
            <Search
              size={15}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-offwhite-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username or name…"
              aria-label="Search students"
              className="h-10 w-full rounded-xl border border-border bg-brand-charcoal-panel pl-9 pr-10 text-sm font-medium text-foreground transition-colors placeholder:text-brand-offwhite-muted/80 hover:border-white/[0.12] focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-brand-offwhite-muted transition-colors hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div
            role="group"
            aria-label="Ranking period"
            className="inline-flex w-full items-center gap-0.5 rounded-lg border border-border bg-brand-charcoal-panel p-1"
          >
            {(["weekly", "monthly", "all"] as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={period === p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "h-8 flex-1 rounded-md px-2 text-xs font-semibold transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  period === p
                    ? "bg-primary/15 text-primary ring-1 ring-primary/25"
                    : "text-brand-offwhite-muted hover:bg-white/[0.04] hover:text-foreground",
                )}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border/50">
          {displayed.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Users size={20} className="mx-auto text-brand-offwhite-muted" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-foreground">
                No students match “{search}”.
              </p>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-brand-offwhite-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Clear search
              </button>
            </div>
          ) : (
            displayed.map((entry, index) => (
              <RankRow
                key={entry.user?.id || index}
                entry={entry}
                rank={index + 1}
                isMe={entry.user?.id === user?.id}
                bestLabel={
                  entry.bestTimeMs != null && entry.bestTimeMs > 0
                    ? formatTime(entry.bestTimeMs)
                    : "—"
                }
              />
            ))
          )}
        </div>

        <div className="border-t border-border/50 bg-brand-charcoal-panel/60 px-4 py-3 text-[11px] text-brand-offwhite-muted">
          Showing {displayed.length} of {filtered.length} student
          {filtered.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
