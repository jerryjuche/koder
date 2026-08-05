"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Mail, RefreshCw, Search, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchEmailLogs } from "@/lib/api";
import { EmailLog, EmailLogStatus, ApiResponse } from "@/lib/types";

const STATUS_CONFIG: Record<EmailLogStatus, { label: string; color: string; bg: string }> = {
  created:         { label: "Created",         color: "text-brand-offwhite-muted", bg: "bg-brand-offwhite-muted/10 border-brand-offwhite-muted/20" },
  sent:            { label: "Sent",            color: "text-sky-400",              bg: "bg-sky-500/10 border-sky-500/20" },
  delivered:       { label: "Delivered",       color: "text-brand-success",        bg: "bg-brand-success/10 border-brand-success/20" },
  delivery_delayed:{ label: "Delayed",         color: "text-amber-400",            bg: "bg-amber-500/10 border-amber-500/20" },
  bounced:         { label: "Bounced",         color: "text-orange-400",           bg: "bg-orange-500/10 border-orange-500/20" },
  complained:      { label: "Complained",      color: "text-red-400",              bg: "bg-red-500/10 border-red-500/20" },
  failed:          { label: "Failed",          color: "text-brand-error",          bg: "bg-brand-error/10 border-brand-error/20" },
};

const STATUS_ORDER: EmailLogStatus[] = ["created", "sent", "delivered", "delivery_delayed", "bounced", "complained", "failed"];

const FLOW_LABELS: Record<string, string> = {
  forgot_password: "Password reset",
  admin_reset: "Admin reset",
};

function formatTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  compact?: boolean;
}

export default function EmailLogsPanel({ compact }: Props) {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");

  const query = useCallback((status: string, email: string) => {
    return fetchEmailLogs({
      limit: 100,
      status: status || undefined,
      email: email.trim() || undefined,
    });
  }, []);

  const applyResult = useCallback((res: ApiResponse<EmailLog[]>) => {
    if (res.success && res.data) {
      setLogs(res.data);
      setError(null);
    } else {
      setError(res.error?.message || "Failed to load email logs");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    query("", "").then((res) => {
      if (!cancelled) {
        applyResult(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [query, applyResult]);

  const refresh = () => {
    query(statusFilter, emailFilter).then(applyResult);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatusFilter(value);
    query(value, emailFilter).then(applyResult);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailFilter(value);
    query(statusFilter, value).then(applyResult);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-offwhite-muted" size={14} />
          <input
            type="text"
            placeholder="Filter by email..."
            value={emailFilter}
            onChange={handleEmailChange}
            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg text-sm px-8 py-1.5 focus:outline-none focus:border-brand-muted-gold"
          />
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:border-brand-muted-gold text-brand-offwhite-muted"
        >
          <option value="">All statuses</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-brand-offwhite-muted hover:text-brand-offwhite bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={cn(loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="text-brand-error text-sm py-2">{error}</div>
      )}

      {loading && logs.length === 0 ? (
        <div className="text-brand-offwhite-muted py-6 text-center text-sm">Loading email logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-brand-offwhite-muted py-8 text-center text-sm flex flex-col items-center gap-2">
          <Inbox size={28} className="opacity-50" />
          No email logs found
        </div>
      ) : (
        <div className={cn("overflow-x-auto", !compact && "max-h-[480px] overflow-y-auto scrollbar-thin")}>
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-brand-offwhite-muted uppercase tracking-wider border-b border-brand-charcoal-border bg-brand-charcoal-card sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Flow</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-center">Attempts</th>
                <th className="px-4 py-3 font-medium">Detail</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Delivered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal-border/50">
              {logs.map((log) => {
                const cfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.failed;
                return (
                  <tr key={log.id} className="hover:bg-brand-charcoal-hover/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-brand-offwhite flex items-center gap-2">
                        <Mail size={13} className="text-brand-offwhite-muted shrink-0" />
                        {log.email}
                      </div>
                      {log.provider_email_id && (
                        <div className="text-[11px] text-brand-offwhite-muted/60 font-mono truncate max-w-[220px]" title={log.provider_email_id}>
                          {log.provider_email_id}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-brand-offwhite-muted">
                      {FLOW_LABELS[log.flow] || log.flow}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", cfg.color, cfg.bg)}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-brand-offwhite-muted">{log.attempts}</td>
                    <td className="px-4 py-3">
                      {log.error ? (
                        <span className="text-[12px] text-brand-error/90 block max-w-[260px] truncate" title={log.error}>
                          {log.error}
                        </span>
                      ) : (
                        <span className="text-brand-offwhite-muted/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-brand-offwhite-muted whitespace-nowrap">{formatTime(log.created_at)}</td>
                    <td className="px-4 py-3 text-brand-offwhite-muted whitespace-nowrap">{formatTime(log.delivered_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
