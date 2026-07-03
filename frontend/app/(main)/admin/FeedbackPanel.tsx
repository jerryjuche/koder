"use client";

import React, { useState, useEffect } from "react";
import { MessageSquareText, Bug, Lightbulb, Search, CheckCircle2, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAdminFeedback, fetchAdminFeedbackCounts, updateFeedbackStatus } from "@/lib/api";
import { toast } from "@/lib/toast";
import { FeedbackItem } from "@/lib/types";

const STATUS_TABS = [
  { id: "", label: "All", icon: MessageSquareText },
  { id: "new", label: "New", icon: AlertCircle },
  { id: "in_progress", label: "In Progress", icon: Clock },
  { id: "resolved", label: "Resolved", icon: CheckCircle2 },
] as const;

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  general: { icon: MessageSquareText, color: "text-brand-offwhite-muted" },
  bug: { icon: Bug, color: "text-brand-error" },
  feature: { icon: Lightbulb, color: "text-brand-muted-gold" },
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-brand-offwhite-muted/10 text-brand-offwhite-muted border-brand-offwhite-muted/20",
  medium: "bg-brand-warning/10 text-brand-warning border-brand-warning/20",
  high: "bg-brand-error/10 text-brand-error border-brand-error/20",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-brand-error/10 text-brand-error border-brand-error/20",
  in_progress: "bg-brand-warning/10 text-brand-warning border-brand-warning/20",
  resolved: "bg-brand-success/10 text-brand-success border-brand-success/20",
};

interface Props {
  compact?: boolean;
}

export default function FeedbackPanel({ compact }: Props) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadData = async () => {
    const [feedbackRes, countsRes] = await Promise.all([
      fetchAdminFeedback(statusFilter),
      fetchAdminFeedbackCounts(),
    ]);
    if (feedbackRes.success && feedbackRes.data) setFeedbacks(feedbackRes.data);
    if (countsRes.success && countsRes.data) setCounts(countsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [statusFilter]);

  const filtered = searchTerm
    ? feedbacks.filter(
        (f) =>
          f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : feedbacks;

  const handleStatusChange = async (id: string, newStatus: string, adminNotes?: string) => {
    setUpdating(id);
    const res = await updateFeedbackStatus(id, newStatus, adminNotes);
    setUpdating(null);
    if (res.success) {
      toast.success(`Feedback marked as ${newStatus.replace("_", " ")}`);
      loadData();
    } else {
      toast.error(res.error?.message || "Failed to update");
    }
  };

  return (
    <div className={cn("overflow-hidden", !compact && "rounded-2xl border border-brand-charcoal-border bg-brand-charcoal-card")}>
      {/* Header */}
      {!compact && (
        <div className="border-b border-brand-charcoal-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-brand-offwhite flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-brand-muted-gold" />
              Feedback
              <span className="text-xs bg-brand-charcoal-hover text-brand-offwhite-muted px-2 py-0.5 rounded-full">
                {feedbacks.length}
              </span>
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-offwhite-muted" size={14} />
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-brand-charcoal-base border border-brand-charcoal-border rounded text-sm px-8 py-1.5 focus:outline-none focus:border-brand-muted-gold w-56 text-brand-offwhite placeholder:text-brand-offwhite-muted/40"
              />
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex gap-1">
            {STATUS_TABS.map((tab) => {
              const Icon = tab.icon;
              const count = tab.id ? counts[tab.id] ?? 0 : Object.values(counts).reduce((a, b) => a + b, 0);
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

      {/* Table */}
      <div className={cn("overflow-x-auto", compact && "max-h-[300px] overflow-y-auto scrollbar-thin")}>
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-brand-offwhite-muted uppercase tracking-wider border-b border-brand-charcoal-border">
            <tr>
              <th className="px-5 py-3 font-medium w-8"></th>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-charcoal-border/50">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-brand-offwhite-muted text-sm">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-brand-offwhite-muted text-sm">
                  No feedback found.
                </td>
              </tr>
            ) : (
              filtered.map((fb) => {
                const config = TYPE_CONFIG[fb.type] || TYPE_CONFIG.general;
                const Icon = config.icon;
                const isExpanded = expandedId === fb.id;

                return (
                  <React.Fragment key={fb.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : fb.id)}
                      className="hover:bg-brand-charcoal-hover/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3">
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-brand-offwhite">{fb.title}</div>
                      </td>
                      <td className="px-5 py-3 text-brand-offwhite-muted text-xs">
                        {fb.is_anonymous ? "Anonymous" : fb.user_name || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded border", PRIORITY_COLORS[fb.priority])}>
                          {fb.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded border", STATUS_COLORS[fb.status])}>
                          {fb.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-brand-offwhite-muted">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <ExternalLink className="h-3.5 w-3.5 text-brand-offwhite-muted/50" />
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="px-5 pb-4">
                          <div className="rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base p-4 space-y-3">
                            <p className="text-sm text-brand-offwhite-muted leading-relaxed whitespace-pre-wrap">
                              {fb.description}
                            </p>
                            {fb.screenshot_url && (
                              <div>
                                <p className="text-xs font-medium text-brand-offwhite-muted mb-1">Screenshot:</p>
                                <img
                                  src={`data:image/png;base64,${fb.screenshot_url}`}
                                  alt="Screenshot"
                                  className="max-h-48 rounded-lg border border-brand-charcoal-border"
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-3 pt-2 border-t border-brand-charcoal-border/50">
                              <span className="text-xs text-brand-offwhite-muted">Status:</span>
                              <select
                                value={fb.status}
                                onChange={(e) => handleStatusChange(fb.id, e.target.value)}
                                disabled={updating === fb.id}
                                className="bg-brand-charcoal-card border border-brand-charcoal-border rounded px-2 py-1 text-xs text-brand-offwhite focus:outline-none focus:border-brand-muted-gold"
                              >
                                <option value="new">New</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                              </select>
                              <span className="text-xs text-brand-offwhite-muted ml-2">Admin notes:</span>
                              <input
                                defaultValue={fb.admin_notes || ""}
                                placeholder="Add note..."
                                onBlur={(e) => {
                                  if (e.target.value !== (fb.admin_notes || "")) {
                                    handleStatusChange(fb.id, fb.status, e.target.value);
                                  }
                                }}
                                className="flex-1 bg-brand-charcoal-card border border-brand-charcoal-border rounded px-2 py-1 text-xs text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus:outline-none focus:border-brand-muted-gold"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
