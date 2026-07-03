"use client";

import React, { useState, useEffect } from "react";
import { Send, Activity, Info, AlertTriangle, Sparkles, RefreshCw, Wrench, Megaphone, X, ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAllBroadcasts, createBroadcast, deleteBroadcast } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Broadcast } from "@/lib/types";

const TYPE_OPTIONS = [
  { value: "info", label: "Information", icon: Info, color: "text-blue-400" },
  { value: "warning", label: "Warning", icon: AlertTriangle, color: "text-amber-400" },
  { value: "update", label: "Update", icon: RefreshCw, color: "text-emerald-400" },
  { value: "new_feature", label: "New Feature", icon: Sparkles, color: "text-purple-400" },
  { value: "maintenance", label: "Maintenance", icon: Wrench, color: "text-red-400" },
  { value: "announcement", label: "Announcement", icon: Megaphone, color: "text-sky-400" },
];

const PRIORITY_OPTIONS = [
  { value: "medium", label: "Medium", color: "text-amber-400" },
  { value: "low", label: "Low", color: "text-blue-400" },
  { value: "high", label: "High", color: "text-orange-400" },
  { value: "critical", label: "Critical", color: "text-red-400" },
];

export default function BroadcastPanel({ compact }: { compact?: boolean }) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);

  const [type, setType] = useState("info");
  const [priority, setPriority] = useState("medium");
  const [title, setTitle] = useState("");
  const [actionLabel, setActionLabel] = useState("");
  const [actionUrl, setActionUrl] = useState("");

  const load = async () => {
    const res = await fetchAllBroadcasts();
    if (res.success && res.data) setBroadcasts(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

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
      toast.error(res.error?.message || "Failed to send broadcast");
    }
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this broadcast permanently?")) return;
    const res = await deleteBroadcast(id);
    if (res.success) {
      toast.success("Broadcast deleted");
      load();
    } else {
      toast.error("Failed to delete");
    }
  };

  const TypeIcon = TYPE_OPTIONS.find(t => t.value === type)?.icon || Info;

  const getTypeColor = (t: string) => {
    const opt = TYPE_OPTIONS.find(o => o.value === t);
    return opt?.color || "text-blue-400";
  };

  const getTypeLabel = (t: string) => {
    const opt = TYPE_OPTIONS.find(o => o.value === t);
    return opt?.label || t;
  };

  const getPriorityBadge = (p: string) => {
    const colors: Record<string, string> = {
      low: "border-blue-500/20 bg-blue-500/10 text-blue-400",
      medium: "border-amber-500/20 bg-amber-500/10 text-amber-400",
      high: "border-orange-500/20 bg-orange-500/10 text-orange-400",
      critical: "border-red-500/20 bg-red-500/10 text-red-400",
    };
    return colors[p] || colors.medium;
  };

  return (
    <div className={cn("bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden")}>
      {!compact && (
        <div className="px-5 py-4 border-b border-brand-charcoal-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-brand-muted-gold" />
            <h3 className="font-bold text-brand-offwhite">Broadcasts</h3>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
              showForm
                ? "bg-brand-charcoal-hover text-brand-offwhite-muted"
                : "bg-brand-muted-gold/15 text-brand-muted-gold hover:bg-brand-muted-gold/25",
            )}
          >
            {showForm ? <X size={14} /> : <Send size={14} />}
            {showForm ? "Cancel" : "New"}
          </button>
        </div>
      )}

      <div className="p-4 space-y-3">
        {showForm && (
          <div className="bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-brand-offwhite-muted uppercase tracking-wider mb-1 block">Type</label>
                <div className="relative">
                  <TypeIcon className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5", getTypeColor(type))} />
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-brand-charcoal-card border border-brand-charcoal-border rounded-lg pl-8 pr-3 py-2 text-xs text-brand-offwhite appearance-none focus:outline-none focus:border-brand-muted-gold"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-brand-offwhite-muted pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-brand-offwhite-muted uppercase tracking-wider mb-1 block">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-brand-charcoal-card border border-brand-charcoal-border rounded-lg px-3 py-2 text-xs text-brand-offwhite appearance-none focus:outline-none focus:border-brand-muted-gold"
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-brand-offwhite-muted uppercase tracking-wider mb-1 block">Action (opt)</label>
                <input
                  type="text"
                  value={actionLabel}
                  onChange={(e) => setActionLabel(e.target.value)}
                  placeholder="Label"
                  className="w-full bg-brand-charcoal-card border border-brand-charcoal-border rounded-lg px-3 py-2 text-xs text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus:outline-none focus:border-brand-muted-gold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-brand-offwhite-muted uppercase tracking-wider mb-1 block">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Broadcast title..."
                className="w-full bg-brand-charcoal-card border border-brand-charcoal-border rounded-lg px-3 py-2 text-xs text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus:outline-none focus:border-brand-muted-gold"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full bg-brand-muted-gold text-brand-charcoal-base font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-xs hover:brightness-110 transition-all disabled:opacity-50"
            >
              {sending ? <Activity className="animate-spin" size={14} /> : <Send size={14} />}
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center text-brand-offwhite-muted text-xs py-4"><Activity className="animate-spin inline mr-2" size={12} />Loading...</div>
        ) : broadcasts.length === 0 ? (
          <div className="text-center text-brand-offwhite-muted text-xs py-4">No broadcasts yet</div>
        ) : (
          <div className={cn("space-y-1.5", !compact && "max-h-[300px] overflow-y-auto scrollbar-thin")}>
            {(compact ? broadcasts.slice(0, 5) : broadcasts).map((b) => (
              <div key={b.id} className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors",
                b.active
                  ? "bg-brand-charcoal-base border-brand-charcoal-border"
                  : "bg-brand-charcoal-base/40 border-brand-charcoal-border/20 opacity-50"
              )}>
                <div className={cn("size-6 rounded-md flex items-center justify-center", getTypeColor(b.type).replace("text", "bg").replace("-400", "-500/10"))}>
                  {(() => {
                    const Opt = TYPE_OPTIONS.find(t => t.value === b.type);
                    if (!Opt) return <Info size={12} className={getTypeColor(b.type)} />;
                    const Icon = Opt.icon;
                    return <Icon size={12} className={getTypeColor(b.type)} />;
                  })()}
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="font-bold text-brand-offwhite truncate">{b.title}</span>
                  <span className={cn("text-[9px] px-1 py-0.5 rounded border font-bold uppercase tracking-wider leading-none", getPriorityBadge(b.priority))}>{b.priority}</span>
                  {!b.active && <span className="text-[9px] text-brand-offwhite-muted/40">inactive</span>}
                </div>
                <span className="text-[9px] text-brand-offwhite-muted/50 shrink-0">Admin</span>
                <span className="text-[9px] text-brand-offwhite-muted/30 shrink-0">{new Date(b.created_at).toLocaleDateString()}</span>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-1 rounded text-brand-offwhite-muted/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  title="Delete"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {compact && !showForm && (
          <button onClick={() => setShowForm(true)} className="text-[10px] font-bold text-brand-muted-gold hover:text-brand-muted-gold/80 transition-colors w-full text-center py-1">
            <Send size={10} className="inline mr-1" />New Broadcast
          </button>
        )}
      </div>
    </div>
  );
}
