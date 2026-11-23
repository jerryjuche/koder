"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Crown,
  Download,
  Flame,
  Lightbulb,
  Sparkles,
  Target,
  TrendingDown,
  Trophy,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import type {
  AdminInsightReport,
  AdminInsightsSnapshotExtended,
  InsightsAtRiskStudent,
  InsightsLeaderboardEntry,
  InsightsSkill,
  InsightsStuckStudent,
  StudentInsight,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// ── Cards under one analyst answer ─────────────────────────────────────────
//
// Every number here comes straight from the SQL snapshot returned with the
// answer, never from the model's prose. That is deliberate: the narrative can
// be wrong, the tiles cannot, and an admin can check one against the other.

type Ask = (question: string) => void;

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function fmtMs(ms: number): string {
  if (!ms) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function Delta({ value, suffix = "" }: { value: number; suffix?: string }) {
  if (!value) {
    return <span className="text-[10px] text-brand-offwhite-muted/50">no change</span>;
  }
  const up = value > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-medium",
        up ? "text-brand-success" : "text-brand-error",
      )}
    >
      <Icon size={10} />
      {up ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}

function MetricTile({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  delta,
  deltaSuffix,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Users;
  accent: string;
  delta?: number;
  deltaSuffix?: string;
}) {
  return (
    <div className="rounded-xl border border-brand-charcoal-border bg-brand-charcoal-base/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-brand-offwhite-muted/60">
        <Icon size={11} className={accent} />
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-xl font-bold text-brand-offwhite">{value}</span>
        {typeof delta === "number" && <Delta value={delta} suffix={deltaSuffix} />}
      </div>
      {hint && (
        <div className="text-[11px] text-brand-offwhite-muted/60">{hint}</div>
      )}
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  accent = "text-brand-cool-accent",
  action,
  children,
  tone,
}: {
  title: string;
  icon: typeof Users;
  accent?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  tone?: "warning" | "gold";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-brand-charcoal-base/40 p-3",
        tone === "warning"
          ? "border-brand-warning/20 bg-brand-warning/5"
          : tone === "gold"
            ? "border-brand-muted-gold/20 bg-brand-muted-gold/5"
            : "border-brand-charcoal-border",
      )}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <Icon size={12} className={accent} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-offwhite-muted/70">
          {title}
        </span>
        {action && <span className="ml-auto">{action}</span>}
      </div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] text-brand-offwhite-muted/60">{children}</p>
  );
}

function Leaderboard({
  rows,
  onAsk,
  disabled,
}: {
  rows: InsightsLeaderboardEntry[];
  onAsk: Ask;
  disabled?: boolean;
}) {
  if (rows.length === 0) return <Empty>No XP recorded yet.</Empty>;
  return (
    <ul className="space-y-1">
      {rows.slice(0, 6).map((row, i) => (
        <li key={row.user_id}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAsk(`How is ${row.name || row.username} doing?`)}
            className="group flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left transition hover:bg-brand-charcoal-hover/60 disabled:opacity-60"
            title={`Ask about ${row.name || row.username}`}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold",
                i === 0
                  ? "bg-brand-muted-gold/20 text-brand-muted-gold"
                  : "bg-brand-charcoal-hover text-brand-offwhite-muted/60",
              )}
            >
              {i === 0 ? <Crown size={11} /> : i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs text-brand-offwhite group-hover:text-brand-cool-accent">
                {row.name || row.username}
              </span>
              <span className="block text-[10px] text-brand-offwhite-muted/50">
                Lv {row.level} · {fmt(row.lifetime_xp)} XP
                {row.streak_days > 0 && ` · ${row.streak_days}d streak`}
              </span>
            </span>
            <span className="text-right">
              <span className="block text-[11px] font-semibold text-brand-muted-gold">
                +{fmt(row.window_xp)}
              </span>
              {row.rank_change !== 0 && (
                <span
                  className={cn(
                    "block text-[10px]",
                    row.rank_change > 0 ? "text-brand-success" : "text-brand-error",
                  )}
                >
                  {row.rank_change > 0 ? "↑" : "↓"}
                  {Math.abs(row.rank_change)} top-10
                </span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function RiskList({
  quiet,
  stuck,
  onAsk,
  disabled,
}: {
  quiet: InsightsAtRiskStudent[];
  stuck: InsightsStuckStudent[];
  onAsk: Ask;
  disabled?: boolean;
}) {
  if (quiet.length === 0 && stuck.length === 0) {
    return <Empty>Nobody is flagged right now.</Empty>;
  }
  return (
    <div className="space-y-2">
      {quiet.slice(0, 3).map((s) => (
        <button
          key={`q-${s.user_id}`}
          type="button"
          disabled={disabled}
          onClick={() => onAsk(`Why has ${s.name || s.username} gone quiet?`)}
          className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left hover:bg-brand-charcoal-hover/60 disabled:opacity-60"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-warning/15 text-brand-warning">
            <TrendingDown size={10} />
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-brand-offwhite">
            {s.name || s.username}
          </span>
          <span className="text-[10px] text-brand-warning">
            {s.days_quiet}d quiet
          </span>
        </button>
      ))}
      {stuck.slice(0, 3).map((s) => (
        <button
          key={`s-${s.user_id}-${s.slug}`}
          type="button"
          disabled={disabled}
          onClick={() =>
            onAsk(`What is ${s.name || s.username} stuck on and why?`)
          }
          className="flex w-full items-start gap-2 rounded-lg px-1 py-1 text-left hover:bg-brand-charcoal-hover/60 disabled:opacity-60"
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-error/15 text-brand-error">
            <AlertTriangle size={10} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs text-brand-offwhite">
              {s.name || s.username}
            </span>
            <span className="block truncate text-[10px] text-brand-offwhite-muted/50">
              {s.fails} fails on {s.problem}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

function SkillBars({ rows }: { rows: InsightsSkill[] }) {
  if (rows.length === 0) return <Empty>No weak skills detected.</Empty>;
  return (
    <div className="space-y-2">
      {rows.slice(0, 4).map((skill) => (
        <div key={skill.tag}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="truncate text-brand-offwhite">{skill.tag}</span>
            <span className="text-brand-offwhite-muted/60">
              {skill.pass_rate}% · {skill.attempts} tries
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-brand-charcoal-hover">
            <div
              className={cn(
                "h-full rounded-full",
                skill.pass_rate < 35
                  ? "bg-brand-error"
                  : skill.pass_rate < 50
                    ? "bg-brand-warning"
                    : "bg-brand-cool-accent",
              )}
              style={{ width: `${Math.max(4, Math.min(100, skill.pass_rate))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SubjectCard({
  subject,
  onAsk,
  disabled,
}: {
  subject: StudentInsight;
  onAsk: Ask;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-xl border border-brand-cool-accent/30 bg-brand-cool-accent/5 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-cool-accent/15">
          <UserRound size={16} className="text-brand-cool-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-brand-offwhite">
            {subject.name || subject.username}
          </div>
          <div className="text-[11px] text-brand-offwhite-muted/70">
            @{subject.username} · rank #{subject.rank} · level {subject.level}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px]">
          <span className="text-brand-muted-gold">
            <strong className="text-brand-offwhite">{fmt(subject.lifetime_xp)}</strong> XP
          </span>
          <span className="text-brand-offwhite-muted">
            <strong className="text-brand-offwhite">{subject.window_solved}</strong> solved
          </span>
          <span className="text-brand-offwhite-muted">
            <strong className="text-brand-offwhite">{subject.window_pass_rate}%</strong> pass
          </span>
          {subject.streak_days > 0 && (
            <span className="inline-flex items-center gap-1 text-brand-success">
              <Flame size={11} /> {subject.streak_days}d
            </span>
          )}
        </div>
      </div>
      {subject.struggling_with.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-brand-offwhite-muted/50">
            Stuck on
          </span>
          {subject.struggling_with.slice(0, 3).map((p) => (
            <span
              key={p.slug}
              className="rounded-full border border-brand-warning/20 bg-brand-warning/10 px-2 py-0.5 text-[10px] text-brand-warning"
            >
              {p.title} · {p.pass_rate}%
            </span>
          ))}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAsk(`What should ${subject.name || subject.username} practise next?`)}
          className="rounded-full border border-brand-cool-accent/20 bg-brand-cool-accent/10 px-2 py-0.5 text-[10px] text-brand-cool-accent hover:bg-brand-cool-accent/20 disabled:opacity-60"
        >
          What should they practise next?
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAsk(`Where is ${subject.name || subject.username} losing the most attempts?`)}
          className="rounded-full border border-brand-charcoal-border px-2 py-0.5 text-[10px] text-brand-offwhite-muted hover:text-brand-offwhite disabled:opacity-60"
        >
          Where do they lose attempts?
        </button>
      </div>
    </div>
  );
}

function Takeaways({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: typeof CheckCircle2;
  tone: "success" | "warning" | "gold";
}) {
  const tones = {
    success: "text-brand-success border-brand-success/20 bg-brand-success/5",
    warning: "text-brand-warning border-brand-warning/20 bg-brand-warning/5",
    gold: "text-brand-muted-gold border-brand-muted-gold/20 bg-brand-muted-gold/5",
  } as const;

  return (
    <div className={cn("rounded-xl border p-3", tones[tone])}>
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
        <Icon size={12} />
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-[11px] text-brand-offwhite-muted/60">
          Nothing notable in this window.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item} className="text-[11px] leading-relaxed text-brand-offwhite-muted">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// buildInsightMarkdown renders one answer for sharing outside the platform.
// It is intentionally plain: headings, bullets and the numbers beside them.
export function buildInsightMarkdown(
  report: AdminInsightReport,
  snapshot: AdminInsightsSnapshotExtended,
  subject?: StudentInsight | null,
): string {
  const t = snapshot.totals;
  const lines: string[] = [];
  lines.push(`# ${report.headline}`, "", report.summary, "");

  if (subject) {
    lines.push(
      `## Student: ${subject.name || subject.username}`,
      "",
      `- Lifetime XP: ${fmt(subject.lifetime_xp)} (level ${subject.level}, rank #${subject.rank})`,
      `- Window: ${subject.window_solved} solved, ${subject.window_pass_rate}% pass rate, ${subject.window_attempts} attempts`,
      `- Streak: ${subject.streak_days} days`,
      "",
    );
  }

  lines.push(
    `## Platform (${snapshot.period})`,
    "",
    `- Active students: ${fmt(t.active_users)}`,
    `- Submissions: ${fmt(t.submissions)} (${fmt(t.passed)} passed)`,
    `- Pass rate: ${t.pass_rate}%`,
    `- Problems solved: ${fmt(t.solutions)}`,
    `- XP earned: ${fmt(t.xp_earned)}`,
    "",
  );

  if (snapshot.leaderboard.length > 0) {
    lines.push("## XP leaderboard", "");
    snapshot.leaderboard.slice(0, 10).forEach((row, i) => {
      lines.push(
        `${i + 1}. ${row.name || row.username} — Lv ${row.level}, ${fmt(row.lifetime_xp)} XP (+${fmt(row.window_xp)} this window)`,
      );
    });
    lines.push("");
  }

  const sections: [string, string[]][] = [
    ["What went well", report.highlights],
    ["Needs attention", report.concerns],
    ["Recommended actions", report.recommendations],
  ];
  for (const [title, items] of sections) {
    if (items.length === 0) continue;
    lines.push(`## ${title}`, "");
    items.forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  }

  lines.push(
    `_Window: ${new Date(snapshot.window_start).toLocaleString()} → ${new Date(snapshot.window_end).toLocaleString()}_`,
  );
  return lines.join("\n");
}

export default function AdminInsightCards({
  report,
  snapshot,
  subject,
  onAsk,
  disabled,
}: {
  report: AdminInsightReport;
  snapshot: AdminInsightsSnapshotExtended;
  subject?: StudentInsight | null;
  onAsk: Ask;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const totals = snapshot.totals;
  const comparison = snapshot.comparison;
  const funnel = snapshot.funnel;
  const levels = snapshot.levels ?? [];
  const maxLevel = Math.max(1, ...levels.map((l) => l.students));

  const copy = async () => {
    const markdown = buildInsightMarkdown(report, snapshot, subject);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      download();
    }
  };

  const download = () => {
    const markdown = buildInsightMarkdown(report, snapshot, subject);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "koder-insight.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-3 space-y-3">
      {subject && (
        <SubjectCard subject={subject} onAsk={onAsk} disabled={disabled} />
      )}

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <MetricTile
          label="Active students"
          value={fmt(totals.active_users)}
          hint={`${fmt(totals.new_users)} new`}
          icon={Users}
          accent="text-[#8DB4B9]"
          delta={comparison?.active_users_delta}
        />
        <MetricTile
          label="Submissions"
          value={fmt(totals.submissions)}
          hint={`${fmt(totals.passed)} passed · ${fmt(totals.failed)} failed`}
          icon={Zap}
          accent="text-brand-cool-accent"
          delta={comparison?.submissions_delta}
        />
        <MetricTile
          label="Pass rate"
          value={`${totals.pass_rate}%`}
          hint={`avg ${fmtMs(totals.avg_runtime_ms)}`}
          icon={Target}
          accent="text-brand-success"
          delta={comparison?.pass_rate_delta}
          deltaSuffix="pp"
        />
        <MetricTile
          label="XP earned"
          value={fmt(totals.xp_earned)}
          hint={`${fmt(totals.solutions)} problems solved`}
          icon={Trophy}
          accent="text-brand-muted-gold"
          delta={comparison?.xp_earned_delta}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Card
          title="XP leaderboard"
          icon={Award}
          accent="text-brand-muted-gold"
          action={
            <span className="text-[10px] text-brand-offwhite-muted/50">
              click to ask
            </span>
          }
        >
          <Leaderboard rows={snapshot.leaderboard ?? []} onAsk={onAsk} disabled={disabled} />
        </Card>

        <Card title="Needs attention" icon={AlertTriangle} accent="text-brand-warning" tone="warning">
          <RiskList
            quiet={snapshot.at_risk?.gone_quiet ?? []}
            stuck={snapshot.at_risk?.stuck ?? []}
            onAsk={onAsk}
            disabled={disabled}
          />
        </Card>

        <Card title="Weak skills" icon={TrendingDown} accent="text-brand-cool-accent">
          <SkillBars rows={snapshot.weak_skills ?? []} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Takeaways
          title="What went well"
          icon={CheckCircle2}
          items={report.highlights}
          tone="success"
        />
        <Takeaways
          title="Needs attention"
          icon={AlertTriangle}
          items={report.concerns}
          tone="warning"
        />
        <Takeaways
          title="Recommended actions"
          icon={Lightbulb}
          items={report.recommendations}
          tone="gold"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-brand-charcoal-border/60 pt-2">
        <button
          type="button"
          onClick={() => setShowDetail((v) => !v)}
          className="inline-flex items-center gap-1 text-[11px] text-brand-offwhite-muted/70 transition hover:text-brand-offwhite"
        >
          <ChevronDown
            size={11}
            className={cn("transition-transform", showDetail && "rotate-180")}
          />
          {showDetail ? "Hide detail" : "Curriculum, levels & activity"}
        </button>
        <span className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 text-[11px] text-brand-offwhite-muted/70 transition hover:text-brand-offwhite"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-1 text-[11px] text-brand-offwhite-muted/70 transition hover:text-brand-offwhite"
          >
            <Download size={11} />
            Export .md
          </button>
        </span>
      </div>

      {showDetail && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card title="Curriculum" icon={BookOpen} accent="text-brand-cool-accent">
            <div className="space-y-1 text-[11px] text-brand-offwhite-muted">
              <Row label="Lesson completions" value={fmt(funnel?.completions_in_window ?? 0)} />
              <Row label="Learners" value={fmt(funnel?.learners_in_window ?? 0)} />
              <Row label="Lesson XP" value={fmt(funnel?.lesson_xp_in_window ?? 0)} />
              <Row
                label="Courses started / finished"
                value={`${fmt(funnel?.courses_started ?? 0)} / ${fmt(funnel?.courses_completed ?? 0)}`}
              />
              <Row
                label="Published lessons"
                value={fmt(funnel?.lessons_published ?? 0)}
              />
              <div className="pt-1 text-[10px] text-brand-offwhite-muted/50">
                Lesson rows only record completion, so drop-off is shown at course
                level ({funnel?.course_completion_rate ?? 0}% finish).
              </div>
            </div>
          </Card>

          <Card title="Level distribution" icon={Sparkles} accent="text-brand-muted-gold">
            {levels.length === 0 ? (
              <Empty>No students yet.</Empty>
            ) : (
              <div className="flex items-end gap-1.5">
                {levels.slice(0, 8).map((bucket) => (
                  <div key={bucket.level} className="flex-1 text-center">
                    <div
                      className="mx-auto w-full rounded-t bg-brand-cool-accent/40"
                      style={{
                        height: `${Math.max(4, (bucket.students / maxLevel) * 48)}px`,
                      }}
                      title={`${bucket.students} students at level ${bucket.level}`}
                    />
                    <div className="mt-1 text-[9px] text-brand-offwhite-muted/60">
                      L{bucket.level}
                    </div>
                    <div className="text-[9px] text-brand-offwhite-muted/40">
                      {bucket.students}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Recent activity" icon={ArrowRight} accent="text-brand-offwhite-muted">
            {(snapshot.activity_feed ?? []).length === 0 ? (
              <Empty>No activity recorded.</Empty>
            ) : (
              <ul className="space-y-1.5">
                {(snapshot.activity_feed ?? []).slice(0, 5).map((event, i) => (
                  <li key={`${event.created_at}-${i}`} className="text-[11px]">
                    <div className="line-clamp-2 text-brand-offwhite-muted">
                      {event.message}
                    </div>
                    <div className="text-[10px] text-brand-offwhite-muted/40">
                      {new Date(event.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <span className="text-brand-offwhite">{value}</span>
    </div>
  );
}
