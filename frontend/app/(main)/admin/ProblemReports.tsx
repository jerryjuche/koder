"use client";

import React, { useState, useEffect, useMemo } from "react";
import NextImage from "next/image";
import {
  Bug,
  CheckCircle2,
  Clock,
  AlertCircle,
  Code2,
  Terminal,
  FileText,
  Pencil,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  List,
  Group,
  ArrowUpRight,
  Image as ImageLucide,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchProblemReports,
  updateFeedbackStatus,
  fetchAllProblemsAdmin,
  updateProblem,
} from "@/lib/api";
import { toast } from "@/lib/toast";
import { FeedbackItem, Problem, UpdateProblemPayload } from "@/lib/types";
import ProblemEditPanel from "./ProblemEditPanel";
import { ProfileHoverCard } from "@/components/profile/ProfileHoverCard";

const STATUS_TABS = [
  { id: "", label: "All", icon: Bug },
  { id: "new", label: "New", icon: AlertCircle },
  { id: "in_progress", label: "In Progress", icon: Clock },
  { id: "resolved", label: "Resolved", icon: CheckCircle2 },
] as const;

const PRIORITY_CONFIG = {
  low: {
    label: "Low",
    class: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-400",
  },
  medium: {
    label: "Medium",
    class: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  high: {
    label: "High",
    class: "bg-red-500/10 text-red-400 border-red-500/20",
    dot: "bg-red-400",
  },
};

const STATUS_CONFIG = {
  new: {
    label: "New",
    class:
      "bg-brand-error/10 text-brand-error border-brand-error/20",
    dot: "bg-brand-error",
  },
  in_progress: {
    label: "In Progress",
    class:
      "bg-brand-warning/10 text-brand-warning border-brand-warning/20",
    dot: "bg-brand-warning",
  },
  resolved: {
    label: "Resolved",
    class:
      "bg-brand-success/10 text-brand-success border-brand-success/20",
    dot: "bg-brand-success",
  },
};

type ViewMode = "grouped" | "flat";

interface Props {
  compact?: boolean;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ProblemReports({ compact }: Props) {
  const [reports, setReports] = useState<FeedbackItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editProblem, setEditProblem] = useState<Problem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grouped");
  const [showResolved, setShowResolved] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );

  const loadReports = async () => {
    const res = await fetchProblemReports();
    if (res.success && res.data) setReports(res.data);
    setLoading(false);
  };

  useEffect(() => {
    const doFetch = async () => {
      const res = await fetchProblemReports();
      if (res.success && res.data) setReports(res.data);
      setLoading(false);
    };
    doFetch();
  }, [statusFilter]);

  const filtered = useMemo(() => {
    let f = statusFilter
      ? reports.filter((r) => r.status === statusFilter)
      : reports;
    if (!showResolved) {
      f = f.filter((r) => r.status !== "resolved");
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      f = f.filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term) ||
          r.problem_slug?.toLowerCase().includes(term) ||
          r.problem_title?.toLowerCase().includes(term) ||
          r.user_name?.toLowerCase().includes(term)
      );
    }
    return f;
  }, [reports, statusFilter, searchTerm, showResolved]);

  const groupedByProblem = useMemo(() => {
    const grouped: Record<string, FeedbackItem[]> = {};
    for (const r of filtered) {
      const key = r.problem_slug || "unknown";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    }
    return grouped;
  }, [filtered]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    const res = await updateFeedbackStatus(id, newStatus);
    setUpdating(null);
    if (res.success) {
      toast.success(`Report marked as ${newStatus.replace("_", " ")}`);
      loadReports();
    } else {
      toast.error(res.error?.message || "Failed to update");
    }
  };

  const handleEditProblem = async (slug: string) => {
    const res = await fetchAllProblemsAdmin();
    if (res.success && res.data) {
      const found = res.data.find((p) => p.slug === slug);
      if (found) {
        setEditProblem(found);
      } else {
        toast.error("Problem not found");
      }
    }
  };

  const handleSaveProblem = async (data: UpdateProblemPayload) => {
    if (!editProblem) return;
    const res = await updateProblem(editProblem.id, data);
    if (res.success) {
      toast.success(`"${res.data?.title || editProblem.title}" updated`);
      setEditProblem(null);
      loadReports();
    } else {
      toast.error(res.error?.message || "Failed to update problem");
    }
  };

  const toggleGroup = (slug: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const renderReportRow = (report: FeedbackItem, showProblemInfo = false) => {
    const isExpanded = expandedId === report.id;
    const priorityCfg = PRIORITY_CONFIG[report.priority] || PRIORITY_CONFIG.low;
    const statusCfg =
      STATUS_CONFIG[report.status] || STATUS_CONFIG.new;

    return (
      <React.Fragment key={report.id}>
        <div
          onClick={() => setExpandedId(isExpanded ? null : report.id)}
          className={cn(
            "group flex items-center gap-3 px-5 py-2.5 cursor-pointer transition-colors",
            isExpanded
              ? "bg-brand-charcoal-hover/40"
              : "hover:bg-brand-charcoal-hover/20"
          )}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full shrink-0 transition-opacity",
              priorityCfg.dot
            )}
          />
          <div className="flex-1 min-w-0 flex items-center gap-3">
            {showProblemInfo && (
              <span className="text-[11px] font-mono text-brand-offwhite-muted/60 truncate max-w-[140px] shrink-0">
                {report.problem_slug}
              </span>
            )}
            <span className="text-sm font-medium text-brand-offwhite truncate">
              {report.title}
            </span>
            {report.error_message && (
              <AlertCircle
                size={12}
                className="text-brand-error/60 shrink-0"
              />
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded border",
                priorityCfg.class
              )}
            >
              {priorityCfg.label}
            </span>
            <span
              className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded border",
                statusCfg.class
              )}
            >
              {statusCfg.label}
            </span>
            <span className="text-[11px] text-brand-offwhite-muted/60 w-14 text-right tabular-nums">
              {timeAgo(report.created_at)}
            </span>
            {!isExpanded ? (
              <ChevronRight
                size={14}
                className="text-brand-offwhite-muted/30 group-hover:text-brand-offwhite-muted/60 transition-colors"
              />
            ) : (
              <ChevronDown
                size={14}
                className="text-brand-offwhite-muted/60"
              />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="px-5 pb-4">
            <div className="rounded-xl border border-brand-charcoal-border bg-brand-charcoal-base overflow-hidden">
              {/* Meta bar */}
              <div className="flex items-center gap-4 px-4 py-2 bg-brand-charcoal-panel/30 border-b border-brand-charcoal-border/50 text-[11px] text-brand-offwhite-muted">
                <span>
                  by{" "}
                  {report.is_anonymous ? (
                    <span className="text-brand-offwhite/80">Anonymous</span>
                  ) : report.user_id ? (
                    <ProfileHoverCard userId={report.user_id} side="bottom" align="start">
                      <span className="text-brand-offwhite/80 cursor-pointer">
                        {report.user_name || "Unknown"}
                      </span>
                    </ProfileHoverCard>
                  ) : (
                    <span className="text-brand-offwhite/80">
                      {report.user_name || "Unknown"}
                    </span>
                  )}
                </span>
                <span className="w-1 h-1 rounded-full bg-brand-charcoal-border" />
                <span>
                  {new Date(report.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {report.problem_slug && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-brand-charcoal-border" />
                    <span>
                      Problem:{" "}
                      <span className="text-brand-offwhite/80 font-mono">
                        {report.problem_slug}
                      </span>
                    </span>
                  </>
                )}
              </div>

              <div className="p-4 space-y-4">
                {/* Description */}
                <div>
                  <span className="text-[11px] font-medium text-brand-offwhite-muted uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Terminal size={12} /> Description
                  </span>
                  <p className="text-sm text-brand-offwhite-muted leading-relaxed whitespace-pre-wrap">
                    {report.description}
                  </p>
                </div>

                {/* Error message */}
                {report.error_message && (
                  <div>
                    <span className="text-[11px] font-medium text-brand-error uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <AlertCircle size={12} /> Error Message
                    </span>
                    <pre className="text-xs text-brand-offwhite bg-red-950/30 rounded-lg p-3 border border-red-500/10 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
                      {report.error_message}
                    </pre>
                  </div>
                )}

                {/* Code snippet */}
                {report.code_snippet && (
                  <div>
                    <span className="text-[11px] font-medium text-brand-muted-gold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Code2 size={12} /> User Code
                    </span>
                    <pre className="text-xs text-brand-offwhite bg-brand-charcoal-card rounded-lg p-3 border border-brand-charcoal-border overflow-x-auto font-mono leading-relaxed max-h-48 overflow-y-auto">
                      {report.code_snippet}
                    </pre>
                  </div>
                )}

                {/* Screenshot */}
                {report.screenshot_url && (
                  <div>
                    <span className="text-[11px] font-medium text-brand-offwhite-muted uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <ImageLucide size={12} /> Screenshot
                    </span>
                    <div className="relative inline-block max-w-full">
                      <NextImage
                        src={`data:image/png;base64,${report.screenshot_url}`}
                        alt="Bug screenshot"
                        width={400}
                        height={300}
                        className="max-h-64 rounded-lg border border-brand-charcoal-border object-contain bg-brand-charcoal-card w-auto"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-brand-charcoal-panel/30 border-t border-brand-charcoal-border/50">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-brand-offwhite-muted font-medium">
                    Status:
                  </span>
                  <div className="flex gap-1">
                    {(["new", "in_progress", "resolved"] as const).map(
                      (s) => {
                        const cfg = STATUS_CONFIG[s];
                        const isActive = report.status === s;
                        return (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(report.id, s)}
                            disabled={updating === report.id || isActive}
                            className={cn(
                              "text-[10px] font-semibold px-2 py-1 rounded border transition-all",
                              isActive
                                ? `${cfg.class} cursor-default`
                                : "border-brand-charcoal-border/50 text-brand-offwhite-muted/50 hover:text-brand-offwhite hover:border-brand-offwhite-muted/30 bg-transparent"
                            )}
                          >
                            {updating === report.id
                              ? "..."
                              : cfg.label}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
                <button
                  onClick={() =>
                    report.problem_slug &&
                    handleEditProblem(report.problem_slug)
                  }
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-muted-gold hover:text-brand-muted-gold/80 transition-colors"
                >
                  <Pencil size={12} />
                  Edit Problem
                  <ArrowUpRight size={11} className="opacity-60" />
                </button>
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  };

  const unresolvedCount = reports.filter(
    (r) => r.status !== "resolved"
  ).length;

  return (
    <div
      className={cn(
        "overflow-hidden",
        !compact &&
          "rounded-2xl border border-brand-charcoal-border bg-brand-charcoal-card"
      )}
    >
      {/* Header */}
      {!compact && (
        <div className="border-b border-brand-charcoal-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-brand-offwhite flex items-center gap-2">
              <Bug className="h-5 w-5 text-brand-error" />
              Problem Reports
              <span className="text-xs bg-brand-charcoal-hover text-brand-offwhite-muted px-2 py-0.5 rounded-full">
                {reports.length}
              </span>
              {unresolvedCount > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-error/10 text-brand-error border border-brand-error/20">
                  {unresolvedCount} unresolved
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex bg-brand-charcoal-base rounded-lg border border-brand-charcoal-border p-0.5">
                <button
                  onClick={() => setViewMode("grouped")}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors",
                    viewMode === "grouped"
                      ? "bg-brand-charcoal-hover text-brand-offwhite"
                      : "text-brand-offwhite-muted hover:text-brand-offwhite"
                  )}
                >
                  <Group size={13} />
                  Grouped
                </button>
                <button
                  onClick={() => setViewMode("flat")}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors",
                    viewMode === "flat"
                      ? "bg-brand-charcoal-hover text-brand-offwhite"
                      : "text-brand-offwhite-muted hover:text-brand-offwhite"
                  )}
                >
                  <List size={13} />
                  Flat
                </button>
              </div>

              {/* Resolved toggle */}
              <button
                onClick={() => setShowResolved(!showResolved)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors border",
                  showResolved
                    ? "bg-brand-success/10 text-brand-success border-brand-success/20"
                    : "bg-brand-charcoal-base text-brand-offwhite-muted border-brand-charcoal-border hover:text-brand-offwhite"
                )}
              >
                <CheckCircle2 size={13} />
                {showResolved ? "Showing resolved" : "Hide resolved"}
              </button>

              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-offwhite-muted"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-brand-charcoal-base border border-brand-charcoal-border rounded text-sm px-8 py-1.5 focus:outline-none focus:border-brand-muted-gold w-56 text-brand-offwhite placeholder:text-brand-offwhite-muted/40"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-offwhite-muted hover:text-brand-offwhite transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex gap-1">
            {STATUS_TABS.map((tab) => {
              const Icon = tab.icon;
              const count = tab.id
                ? reports.filter((r) => r.status === tab.id).length
                : reports.length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    statusFilter === tab.id
                      ? "bg-brand-muted-gold/10 text-brand-muted-gold"
                      : "text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                  <span className="ml-0.5 text-[10px] opacity-60">
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "",
          compact && "max-h-[400px] overflow-y-auto scrollbar-thin"
        )}
      >
        {loading ? (
          <div className="px-5 py-8 text-center text-brand-offwhite-muted text-sm">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-charcoal-base border border-brand-charcoal-border flex items-center justify-center mb-3">
              <Bug className="h-6 w-6 text-brand-offwhite-muted/40" />
            </div>
            <p className="text-sm text-brand-offwhite-muted font-medium">
              {searchTerm || statusFilter
                ? "No reports match your filters"
                : "No problem reports yet"}
            </p>
            <p className="text-xs text-brand-offwhite-muted/60 mt-1">
              Bug reports from students will appear here
            </p>
          </div>
        ) : viewMode === "flat" ? (
          <div className="divide-y divide-brand-charcoal-border/30">
            {filtered.map((report) => renderReportRow(report, true))}
          </div>
        ) : (
          <div className="divide-y divide-brand-charcoal-border/50">
            {Object.entries(groupedByProblem).map(
              ([slug, items], groupIdx) => {
                const isCollapsed = collapsedGroups.has(slug);
                const problemTitle =
                  items[0]?.problem_title || slug;
                const unresolved = items.filter(
                  (r) => r.status !== "resolved"
                ).length;

                return (
                  <div key={slug}>
                    {/* Group header */}
                    <div
                      onClick={() => toggleGroup(slug)}
                      className={cn(
                        "px-5 py-3 flex items-center justify-between cursor-pointer transition-colors",
                        groupIdx !== 0 &&
                          "border-t border-brand-charcoal-border/30",
                        isCollapsed
                          ? "hover:bg-brand-charcoal-hover/20"
                          : "bg-brand-charcoal-panel/40"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button className="text-brand-offwhite-muted/50 hover:text-brand-offwhite-muted transition-colors shrink-0">
                          {isCollapsed ? (
                            <ChevronRight size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                        <FileText
                          size={15}
                          className="text-brand-offwhite-muted shrink-0"
                        />
                        <span className="text-sm font-semibold text-brand-offwhite truncate">
                          {problemTitle}
                        </span>
                        <span className="text-[11px] font-mono text-brand-offwhite-muted/50">
                          {slug}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-brand-offwhite-muted/60 tabular-nums">
                          {items.length} report
                          {items.length !== 1 ? "s" : ""}
                        </span>
                        {unresolved > 0 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-error/10 text-brand-error border border-brand-error/20">
                            {unresolved} open
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProblem(slug);
                          }}
                          className="flex items-center gap-1.5 text-[11px] text-brand-muted-gold hover:text-brand-muted-gold/80 transition-colors font-medium"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* Reports within group */}
                    {!isCollapsed && (
                      <div className="divide-y divide-brand-charcoal-border/20">
                        {items.map((report) =>
                          renderReportRow(report)
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Edit Problem Panel */}
      {editProblem && (
        <ProblemEditPanel
          problem={editProblem}
          onSave={handleSaveProblem}
          onClose={() => setEditProblem(null)}
        />
      )}
    </div>
  );
}
