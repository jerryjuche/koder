"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Info, Sparkles, RefreshCw, Wrench, Megaphone, X, ArrowRight } from "lucide-react";
import { fetchActiveBroadcasts, dismissBroadcast } from "@/lib/api";
import { useWebSocket } from "@/lib/event";
import { Broadcast } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<string, { icon: React.ElementType; border: string; gradient: string; iconBg: string; iconColor: string; titleColor: string; textColor: string; button: string }> = {
  info: {
    icon: Info,
    border: "border-blue-500/20",
    gradient: "from-blue-500/5 via-blue-500/[0.03] to-transparent",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    titleColor: "text-blue-300",
    textColor: "text-blue-200/70",
    button: "bg-blue-400/15 text-blue-300 hover:bg-blue-400/25",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-500/20",
    gradient: "from-amber-500/5 via-amber-500/[0.03] to-transparent",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    titleColor: "text-amber-300",
    textColor: "text-amber-200/70",
    button: "bg-amber-400/15 text-amber-300 hover:bg-amber-400/25",
  },
  update: {
    icon: RefreshCw,
    border: "border-emerald-500/20",
    gradient: "from-emerald-500/5 via-emerald-500/[0.03] to-transparent",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    titleColor: "text-emerald-300",
    textColor: "text-emerald-200/70",
    button: "bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25",
  },
  new_feature: {
    icon: Sparkles,
    border: "border-purple-500/20",
    gradient: "from-purple-500/5 via-purple-500/[0.03] to-transparent",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    titleColor: "text-purple-300",
    textColor: "text-purple-200/70",
    button: "bg-purple-400/15 text-purple-300 hover:bg-purple-400/25",
  },
  maintenance: {
    icon: Wrench,
    border: "border-red-500/20",
    gradient: "from-red-500/5 via-red-500/[0.03] to-transparent",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
    titleColor: "text-red-300",
    textColor: "text-red-200/70",
    button: "bg-red-400/15 text-red-300 hover:bg-red-400/25",
  },
  announcement: {
    icon: Megaphone,
    border: "border-sky-500/20",
    gradient: "from-sky-500/5 via-sky-500/[0.03] to-transparent",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-400",
    titleColor: "text-sky-300",
    textColor: "text-sky-200/70",
    button: "bg-sky-400/15 text-sky-300 hover:bg-sky-400/25",
  },
};

const PRIORITY_BADGES: Record<string, string> = {
  low: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  medium: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  high: "border-orange-500/20 bg-orange-500/10 text-orange-400",
  critical: "border-red-500/20 bg-red-500/10 text-red-400",
};

export default function BroadcastBanner() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const fetchBanners = useCallback(() => {
    fetchActiveBroadcasts().then((res) => {
      if (res.success && res.data) {
        setBroadcasts(res.data);
      }
    });
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    fetchBanners();

    const scheduleNext = () => {
      const delay = document.visibilityState === "visible" ? 7000 : 120000;
      timeoutId = setTimeout(() => {
        fetchBanners();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchBanners();
        clearTimeout(timeoutId);
        scheduleNext();
      } else {
        clearTimeout(timeoutId);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchBanners]);

  useWebSocket({
    'broadcast.created': useCallback(() => { fetchBanners(); }, [fetchBanners]),
    'broadcast.updated': useCallback(() => { fetchBanners(); }, [fetchBanners]),
    'broadcast.deleted': useCallback(() => { fetchBanners(); }, [fetchBanners]),
  }, [fetchBanners]);

  const handleDismiss = async (id: string) => {
    await dismissBroadcast(id);
    setDismissed((prev) => new Set(prev).add(id));
  };

  const visible = broadcasts.filter((b) => !dismissed.has(b.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-5 w-fit mx-auto">
      {visible.map((broadcast) => {
        const style = TYPE_STYLES[broadcast.type] || TYPE_STYLES.info;
        const Icon = style.icon;

        return (
          <div
            key={broadcast.id}
            className={cn(
              "relative flex items-center gap-3 rounded-xl border px-4 py-2.5",
              "animate-in fade-in slide-in-from-top-2 duration-500",
              style.gradient,
              style.border,
              broadcast.priority === "critical" && "ring-1 ring-red-500/30",
            )}
          >
            <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", style.iconBg)}>
              <Icon className={cn("size-4", style.iconColor)} />
            </div>

            <span className={cn("text-sm font-semibold truncate", style.titleColor)}>
              {broadcast.title}
            </span>

            <span className={cn(
              "rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider leading-none shrink-0",
              PRIORITY_BADGES[broadcast.priority] || PRIORITY_BADGES.medium
            )}>
              {broadcast.priority}
            </span>

            <span className="text-[10px] text-muted-foreground/40 font-medium shrink-0">Admin</span>

            {broadcast.action_label && broadcast.action_url && (
              <a
                href={broadcast.action_url}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all shrink-0",
                  style.button,
                )}
              >
                {broadcast.action_label}
                <ArrowRight size={10} />
              </a>
            )}

            <button
              onClick={() => handleDismiss(broadcast.id)}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 hover:bg-muted/30 hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
