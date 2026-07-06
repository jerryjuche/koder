"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Send, Activity, Info, AlertTriangle, Sparkles, RefreshCw, Wrench, Megaphone, X, ChevronDown, Trash2, Plus, Power, PowerOff, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAllBroadcasts, createBroadcast, deleteBroadcast, deactivateBroadcast, activateBroadcast } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Broadcast } from "@/lib/types";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  info:         { icon: Info,          label: "Info",         color: "text-blue-400",  bg: "bg-blue-500/10" },
  warning:      { icon: AlertTriangle, label: "Warning",      color: "text-amber-400", bg: "bg-amber-500/10" },
  update:       { icon: RefreshCw,     label: "Update",       color: "text-emerald-400", bg: "bg-emerald-500/10" },
  new_feature:  { icon: Sparkles,      label: "New Feature",  color: "text-purple-400", bg: "bg-purple-500/10" },
  maintenance:  { icon: Wrench,        label: "Maintenance",  color: "text-red-400",   bg: "bg-red-500/10" },
  announcement: { icon: Megaphone,     label: "Announcement", color: "text-sky-400",   bg: "bg-sky-500/10" },
};

const PRIORITY_STYLES: Record<string, string> = {
  low:      "border-blue-500/20 bg-blue-500/10 text-blue-400",
  medium:   "border-amber-500/20 bg-amber-500/10 text-amber-400",
  high:     "border-orange-500/20 bg-orange-500/10 text-orange-400",
  critical: "border-red-500/20 bg-red-500/10 text-red-400",
};

const TYPE_OPTIONS = Object.entries(TYPE_CONFIG).map(([value, cfg]) => ({ value, label: cfg.label }));
const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

interface Props {
  compact?: boolean;
}

export default function BroadcastPanel({ compact }: Props) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [type, setType] = useState("info");
  const [priority, setPriority] = useState("medium");
  const [title, setTitle] = useState("");
  const [actionLabel, setActionLabel] = useState("");
  const [actionUrl, setActionUrl] = useState("");

  const load = useCallback(async () => {
    const res = await fetchAllBroadcasts();
    if (res.success && res.data) setBroadcasts(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setType("info");
    setPriority("medium");
    setTitle("");
    setActionLabel("");
    setActionUrl("");
    setShowForm(false);
  };

  const handleSend = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSending(true);
    const payload: any = { type, title: title.trim() };
    if (priority !== "medium") payload.priority = priority;
    if (actionLabel.trim() && actionUrl.trim()) {
      payload.action_label = actionLabel.trim();
      payload.action_url = actionUrl.trim();
    }
    const res = await createBroadcast(payload);
    if (res.success) {
      toast.success("Broadcast sent!");
      resetForm();
      load();
    } else {
      toast.error(res.error?.message || "Failed to send");
    }
    setSending(false);
  };

  const handleToggle = async (b: Broadcast) => {
    setToggling(b.id);
    const res = b.active ? await deactivateBroadcast(b.id) : await activateBroadcast(b.id);
    setToggling(null);
    if (res.success) {
      toast.success(b.active ? "Broadcast deactivated" : "Broadcast activated");
      load();
    } else {
      toast.error("Failed to toggle");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this broadcast permanently? Users will no longer see it.")) return;
    const res = await deleteBroadcast(id);
    if (res.success) {
      toast.success("Broadcast deleted");
      load();
    } else {
      toast.error("Failed to delete");
    }
  };

  const activeCount = broadcasts.filter(b => b.active).length;

  return (
    <div className={cn("bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden")}>
      <div className="px-5 py-4 border-b border-brand-charcoal-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-muted-gold/10 border border-brand-muted-gold/20 flex items-center justify-center">
            <Megaphone size={17} className="text-brand-muted-gold" />
          </div>
          <div>
            <h3 className="font-bold text-brand-offwhite text-sm">Broadcasts</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-brand-offwhite-muted">{broadcasts.length} total</span>
              {activeCount > 0 && (
                <span className="text-[10px] font-medium text-brand-success flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                  {activeCount} active
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
            showForm
              ? "bg-brand-charcoal-hover text-brand-offwhite-muted border border-brand-charcoal-border"
              : "bg-brand-muted-gold/15 text-brand-muted-gold border border-brand-muted-gold/20 hover:bg-brand-muted-gold/25",
          )}
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Cancel" : "New Broadcast"}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Create Form */}
        {showForm && (
          <div className="bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-brand-offwhite-muted uppercase tracking-wider mb-1.5 block">Type</label>
                <div className="relative">
                  {(() => {
                    const Icon = TYPE_CONFIG[type]?.icon || Info;
                    return <Icon className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5", TYPE_CONFIG[type]?.color || "text-blue-400")} />;
                  })()}
                  <select value={type} onChange={e => setType(e.target.value)}
                    className="w-full bg-brand-charcoal-card border border-brand-charcoal-border rounded-lg pl-8 pr-3 py-2 text-xs text-brand-offwhite appearance-none focus:outline-none focus:border-brand-muted-gold cursor-pointer">
                    {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-brand-offwhite-muted pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-brand-offwhite-muted uppercase tracking-wider mb-1.5 block">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)}
                  className="w-full bg-brand-charcoal-card border border-brand-charcoal-border rounded-lg px-3 py-2 text-xs text-brand-offwhite appearance-none focus:outline-none focus:border-brand-muted-gold cursor-pointer">
                  {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-brand-offwhite-muted uppercase tracking-wider mb-1.5 block">Action (optional)</label>
                <div className="flex gap-2">
                  <input value={actionLabel} onChange={e => setActionLabel(e.target.value)}
                    placeholder="Button label" className="flex-1 bg-brand-charcoal-card border border-brand-charcoal-border rounded-lg px-3 py-2 text-xs text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus:outline-none focus:border-brand-muted-gold" />
                  <input value={actionUrl} onChange={e => setActionUrl(e.target.value)}
                    placeholder="https://..." className="flex-[2] bg-brand-charcoal-card border border-brand-charcoal-border rounded-lg px-3 py-2 text-xs text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus:outline-none focus:border-brand-muted-gold font-mono" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-brand-offwhite-muted uppercase tracking-wider mb-1.5 block">Title <span className="text-brand-error">*</span></label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="What's the broadcast about?" className="w-full bg-brand-charcoal-card border border-brand-charcoal-border rounded-lg px-3 py-2 text-xs text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus:outline-none focus:border-brand-muted-gold" />
            </div>
            <button onClick={handleSend} disabled={sending}
              className="w-full bg-brand-muted-gold text-brand-charcoal-base font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs hover:brightness-110 transition-all disabled:opacity-50">
              {sending ? <Activity className="animate-spin" size={14} /> : <Send size={14} />}
              {sending ? "Sending..." : "Send Broadcast"}
            </button>
          </div>
        )}

        {/* Broadcast List */}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-brand-offwhite-muted text-xs">
            <Activity className="animate-spin mr-2" size={12} /> Loading...
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Megaphone size={28} className="text-brand-offwhite-muted/20 mb-3" />
            <p className="text-sm text-brand-offwhite-muted">No broadcasts yet</p>
            <p className="text-xs text-brand-offwhite-muted/50 mt-1">Create your first broadcast to notify users</p>
          </div>
        ) : (
          <div className={cn("space-y-2", !compact && "max-h-[420px] overflow-y-auto scrollbar-thin pr-1")}>
            {(compact ? broadcasts.slice(0, 6) : broadcasts).map((b) => {
              const cfg = TYPE_CONFIG[b.type] || TYPE_CONFIG.info;
              const Icon = cfg.icon;
              return (
                <div
                  key={b.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                    b.active
                      ? "bg-brand-charcoal-base border-brand-charcoal-border"
                      : "bg-brand-charcoal-base/30 border-brand-charcoal-border/20",
                  )}
                >
                  {/* Type icon */}
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
                    <Icon size={15} className={cfg.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-bold truncate", b.active ? "text-brand-offwhite" : "text-brand-offwhite/50")}>
                        {b.title}
                      </span>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider leading-none shrink-0", PRIORITY_STYLES[b.priority])}>
                        {b.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-brand-offwhite-muted/50 flex items-center gap-1">
                        <Calendar size={9} />
                        {new Date(b.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-brand-offwhite-muted/50 flex items-center gap-1">
                        <User size={9} />
                        {b.user_name || "Admin"}
                      </span>
                    </div>
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(b)}
                      disabled={toggling === b.id}
                      className={cn(
                        "relative w-[38px] h-5 rounded-full transition-colors",
                        b.active ? "bg-brand-success" : "bg-brand-charcoal-border",
                        toggling === b.id && "opacity-50"
                      )}
                      title={b.active ? "Click to deactivate" : "Click to activate"}
                    >
                      <div className={cn(
                        "w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all",
                        b.active ? "right-0.5" : "left-0.5"
                      )} />
                    </button>
                    <span className={cn("text-[10px] font-medium w-12", b.active ? "text-brand-success" : "text-brand-offwhite-muted/40")}>
                      {b.active ? "On" : "Off"}
                    </span>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg text-brand-offwhite-muted/30 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    title="Delete permanently"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {compact && !showForm && broadcasts.length > 6 && (
          <div className="text-center text-[10px] text-brand-offwhite-muted/50 pt-1 border-t border-brand-charcoal-border/30">
            Showing 6 of {broadcasts.length} broadcasts
          </div>
        )}
      </div>
    </div>
  );
}
