"use client";

import { useCallback, useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { fetchActiveBroadcasts, dismissBroadcast } from "@/lib/api";
import { useWebSocket } from "@/lib/event";
import { Broadcast } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<
  string,
  {
    border: string;
    textColor: string;
    button: string;
    dismissHover: string;
  }
> = {
  info: {
    border: "border-l-blue-500",
    textColor: "text-blue-100/70",
    button: "bg-blue-500/15 text-blue-300 hover:bg-blue-500/25",
    dismissHover: "hover:bg-blue-500/10 hover:text-blue-300",
  },
  warning: {
    border: "border-l-amber-500",
    textColor: "text-amber-100/70",
    button: "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25",
    dismissHover: "hover:bg-amber-500/10 hover:text-amber-300",
  },
  update: {
    border: "border-l-emerald-500",
    textColor: "text-emerald-100/70",
    button: "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25",
    dismissHover: "hover:bg-emerald-500/10 hover:text-emerald-300",
  },
  new_feature: {
    border: "border-l-purple-500",
    textColor: "text-purple-100/70",
    button: "bg-purple-500/15 text-purple-300 hover:bg-purple-500/25",
    dismissHover: "hover:bg-purple-500/10 hover:text-purple-300",
  },
  maintenance: {
    border: "border-l-red-500",
    textColor: "text-red-100/70",
    button: "bg-red-500/15 text-red-300 hover:bg-red-500/25",
    dismissHover: "hover:bg-red-500/10 hover:text-red-300",
  },
  announcement: {
    border: "border-l-sky-500",
    textColor: "text-sky-100/70",
    button: "bg-sky-500/15 text-sky-300 hover:bg-sky-500/25",
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
        const hasMessage = broadcast.message && broadcast.message.trim().length > 0;

        return (
          <div
            key={broadcast.id}
            className={cn(
              "group relative overflow-hidden rounded-lg border border-l-[3px] bg-[#1A1A1A] transition-colors",
              "animate-in fade-in slide-in-from-top-2 duration-500",
              style.border,
              broadcast.priority === "critical" && "border-l-red-500 ring-1 ring-red-500/20",
            )}
          >
            <div className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-foreground leading-snug">
                    {broadcast.title}
                  </h4>
                  {hasMessage && (
                    <p className={cn("mt-1 text-[13px] leading-relaxed", style.textColor)}>
                      {broadcast.message}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDismiss(broadcast.id)}
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 transition-colors",
                    style.dismissHover,
                  )}
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>

              {broadcast.action_label && broadcast.action_url && (
                <a
                  href={broadcast.action_url}
                  className={cn(
                    "mt-3 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                    style.button,
                  )}
                >
                  {broadcast.action_label}
                  <ArrowRight size={11} />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
