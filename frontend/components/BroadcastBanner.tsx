"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Info, Sparkles, RefreshCw, Wrench, Megaphone, X, ArrowRight } from "lucide-react";
import { fetchActiveBroadcasts, dismissBroadcast } from "@/lib/api";
import { useWebSocket } from "@/lib/event";
import { Broadcast } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<
  string,
  {
    icon: React.ElementType;
    accentBar: string;
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    titleColor: string;
    textColor: string;
    button: string;
    dismissHover: string;
  }
> = {
  info: {
    icon: Info,
    accentBar: "bg-blue-500",
    bg: "bg-blue-500/[0.04]",
    border: "border-blue-500/15",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    titleColor: "text-blue-100",
    textColor: "text-blue-200/60",
    button: "bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border-blue-500/20",
    dismissHover: "hover:bg-blue-500/10 hover:text-blue-300",
  },
  warning: {
    icon: AlertTriangle,
    accentBar: "bg-amber-500",
    bg: "bg-amber-500/[0.04]",
    border: "border-amber-500/15",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    titleColor: "text-amber-100",
    textColor: "text-amber-200/60",
    button: "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border-amber-500/20",
    dismissHover: "hover:bg-amber-500/10 hover:text-amber-300",
  },
  update: {
    icon: RefreshCw,
    accentBar: "bg-emerald-500",
    bg: "bg-emerald-500/[0.04]",
    border: "border-emerald-500/15",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    titleColor: "text-emerald-100",
    textColor: "text-emerald-200/60",
    button: "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border-emerald-500/20",
    dismissHover: "hover:bg-emerald-500/10 hover:text-emerald-300",
  },
  new_feature: {
    icon: Sparkles,
    accentBar: "bg-purple-500",
    bg: "bg-purple-500/[0.04]",
    border: "border-purple-500/15",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    titleColor: "text-purple-100",
    textColor: "text-purple-200/60",
    button: "bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border-purple-500/20",
    dismissHover: "hover:bg-purple-500/10 hover:text-purple-300",
  },
  maintenance: {
    icon: Wrench,
    accentBar: "bg-red-500",
    bg: "bg-red-500/[0.04]",
    border: "border-red-500/15",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
    titleColor: "text-red-100",
    textColor: "text-red-200/60",
    button: "bg-red-500/15 text-red-300 hover:bg-red-500/25 border-red-500/20",
    dismissHover: "hover:bg-red-500/10 hover:text-red-300",
  },
  announcement: {
    icon: Megaphone,
    accentBar: "bg-sky-500",
    bg: "bg-sky-500/[0.04]",
    border: "border-sky-500/15",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-400",
    titleColor: "text-sky-100",
    textColor: "text-sky-200/60",
    button: "bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 border-sky-500/20",
    dismissHover: "hover:bg-sky-500/10 hover:text-sky-300",
  },
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
    <div className="space-y-3 mb-5 max-w-3xl mx-auto">
      {visible.map((broadcast) => {
        const style = TYPE_STYLES[broadcast.type] || TYPE_STYLES.info;
        const Icon = style.icon;
        const hasMessage = broadcast.message && broadcast.message.trim().length > 0;

        return (
          <div
            key={broadcast.id}
            className={cn(
              "group relative overflow-hidden rounded-xl border transition-colors",
              "animate-in fade-in slide-in-from-top-2 duration-500",
              style.bg,
              style.border,
              broadcast.priority === "critical" && "ring-1 ring-red-500/30",
            )}
          >
            <div className={cn("h-1 w-full", style.accentBar)} />

            <div className="px-4 py-3">
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", style.iconBg)}>
                  <Icon className={cn("size-4", style.iconColor)} />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className={cn("text-sm font-semibold leading-snug", style.titleColor)}>
                    {broadcast.title}
                  </h4>
                  {hasMessage && (
                    <p className={cn("mt-1 text-[13px] leading-relaxed", style.textColor)}>
                      {broadcast.message}
                    </p>
                  )}
                  {broadcast.action_label && broadcast.action_url && (
                    <a
                      href={broadcast.action_url}
                      className={cn(
                        "mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                        style.button,
                      )}
                    >
                      {broadcast.action_label}
                      <ArrowRight size={11} />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleDismiss(broadcast.id)}
                  className={cn(
                    "mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors",
                    style.dismissHover,
                  )}
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
