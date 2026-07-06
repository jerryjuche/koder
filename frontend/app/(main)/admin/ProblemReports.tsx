"use client";

import React, { useState, useEffect } from "react";
import { Bug, CheckCircle2, Clock, AlertCircle, ExternalLink, Code2, Terminal, MessageSquare, FileText, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchProblemReports, updateFeedbackStatus, fetchAllProblemsAdmin, updateProblem } from "@/lib/api";
import { toast } from "@/lib/toast";
import { FeedbackItem, Problem, UpdateProblemPayload } from "@/lib/types";
import ProblemEditPanel from "./ProblemEditPanel";

const STATUS_TABS = [
  { id: "", label: "All", icon: Bug },
  { id: "new", label: "New", icon: AlertCircle },
  { id: "in_progress", label: "In Progress", icon: Clock },
  { id: "resolved", label: "Resolved", icon: CheckCircle2 },
] as const;

const STATUS_COLORS: Record<string, string> = {
  new: "bg-brand-error/10 text-brand-error border-brand-error/20",
  in_progress: "bg-brand-warning/10 text-brand-warning border-brand-warning/20",
  resolved: "bg-brand-success/10 text-brand-success border-brand-success/20",
};

interface Props {
  compact?: boolean;
}

export default function ProblemReports({ compact }: Props) {
  const [reports, setReports] = useState<FeedbackItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editProblem, setEditProblem] = useState<Problem | null>(null);

  const loadReports = async () => {
    const res = await fetchProblemReports();
    if (res.success && res.data) setReports(res.data);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    loadReports();
  }, [statusFilter]);

  const filtered = statusFilter
    ? reports.filter((r) => r.status === statusFilter)
    : reports;

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

  const groupedByProblem: Record<string, FeedbackItem[]> = {};
  for (const r of filtered) {
    const key = r.problem_slug || "unknown";
    if (!groupedByProblem[key]) groupedByProblem[key] = [];
    groupedByProblem[key].push(r);
  }

  return (
    <div className={cn("overflow-hidden", !compact && "rounded-2xl border border-brand-charcoal-border bg-brand-charcoal-card")}>
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
            </h3>
          </div>
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
                      : "text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                  <span className="ml-0.5 text-[10px] opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* List */}
      <div className={cn("", compact && "max-h-[400px] overflow-y-auto scrollbar-thin")}>
        {loading ? (
          <div className="px-5 py-8 text-center text-brand-offwhite-muted text-sm">Loading...</div>
        ) : Object.keys(groupedByProblem).length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <Bug className="h-10 w-10 text-brand-offwhite-muted/30 mb-3" />
            <p className="text-sm text-brand-offwhite-muted">No problem reports yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-brand-charcoal-border/50">
            {Object.entries(groupedByProblem).map(([slug, items]) => {
              const problemTitle = items[0]?.problem_title || slug;
              const unresolved = items.filter((r) => r.status !== "resolved").length;

              return (
                <div key={slug} className="divide-y divide-brand-charcoal-border/30">
                  {/* Problem header */}
                  <div className="px-5 py-3 bg-brand-charcoal-panel/30 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={14} className="text-brand-offwhite-muted shrink-0" />
                      <span className="text-sm font-bold text-brand-offwhite truncate">{problemTitle}</span>
                      <span className="text-xs font-mono text-brand-offwhite-muted/60">{slug}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {unresolved > 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-error/10 text-brand-error border border-brand-error/20">
                          {unresolved} open
                        </span>
                      )}
                      <button
                        onClick={() => handleEditProblem(slug)}
                        className="flex items-center gap-1.5 text-xs text-brand-muted-gold hover:text-brand-muted-gold/80 transition-colors"
                        title="Edit this problem"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Reports for this problem */}
                  {items.map((report) => {
                    const isExpanded = expandedId === report.id;
                    return (
                      <React.Fragment key={report.id}>
                        <div
                          onClick={() => setExpandedId(isExpanded ? null : report.id)}
                          className="px-5 py-3 hover:bg-brand-charcoal-hover/30 transition-colors cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-6 h-6 rounded-lg bg-brand-charcoal-base border border-brand-charcoal-border flex items-center justify-center shrink-0">
                              <MessageSquare size={12} className="text-brand-offwhite-muted" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-brand-offwhite truncate">{report.title}</div>
                              <div className="text-[11px] text-brand-offwhite-muted">
                                {report.user_name || "Anonymous"} · {new Date(report.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded border", STATUS_COLORS[report.status])}>
                              {report.status.replace("_", " ")}
                            </span>
                            <ExternalLink size={13} className="text-brand-offwhite-muted/40" />
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-5 pb-4">
                            <div className="rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base p-4 space-y-4">
                              {/* Error message */}
                              {report.error_message && (
                                <div>
                                  <span className="text-[11px] font-medium text-brand-error uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                                    <AlertCircle size={12} /> Error
                                  </span>
                                  <pre className="text-xs text-brand-offwhite bg-brand-charcoal-card rounded-lg p-3 border border-brand-charcoal-border overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
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
                                  <pre className="text-xs text-brand-offwhite bg-brand-charcoal-card rounded-lg p-3 border border-brand-charcoal-border overflow-x-auto font-mono leading-relaxed max-h-40 overflow-y-auto">
                                    {report.code_snippet}
                                  </pre>
                                </div>
                              )}

                              {/* Description */}
                              <div>
                                <span className="text-[11px] font-medium text-brand-offwhite-muted uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                                  <Terminal size={12} /> Description
                                </span>
                                <p className="text-sm text-brand-offwhite-muted leading-relaxed whitespace-pre-wrap">
                                  {report.description}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center justify-between pt-2 border-t border-brand-charcoal-border/50">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-brand-offwhite-muted">Status:</span>
                                  <select
                                    value={report.status}
                                    onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                    disabled={updating === report.id}
                                    className="bg-brand-charcoal-card border border-brand-charcoal-border rounded px-2 py-1 text-xs text-brand-offwhite focus:outline-none focus:border-brand-muted-gold"
                                  >
                                    <option value="new">New</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                  </select>
                                </div>
                                <button
                                  onClick={() => handleEditProblem(slug)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-muted-gold/30 px-3 py-1.5 text-xs font-medium text-brand-muted-gold hover:bg-brand-muted-gold/10 transition-colors"
                                >
                                  <Pencil size={13} />
                                  Edit Problem
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            })}
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
