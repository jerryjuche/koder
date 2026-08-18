"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Info,
  AlertTriangle,
  Sparkles,
  Star,
  ShieldAlert,
  Bell,
  X,
  ArrowRight,
} from "lucide-react";
import { fetchActiveBroadcasts, dismissBroadcast } from "@/lib/api";
import { useWebSocket } from "@/lib/event";
import { Broadcast } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<
  string,
  {
    icon: React.ElementType;
    bg: string;
    border: string;
    text: string;
    muted: string;
    link: string;
    linkHover: string;
  }
> = {
  info: {
    icon: Info,
    bg: "bg-blue-500/10",
    border: "border-b border-blue-500/20",
    text: "text-blue-200",
    muted: "text-blue-300/60",
    link: "text-blue-300",
    linkHover: "hover:text-blue-200",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500/10",
    border: "border-b border-amber-500/20",
    text: "text-amber-200",
    muted: "text-amber-300/60",
    link: "text-amber-300",
    linkHover: "hover:text-amber-200",
  },
  update: {
    icon: Star,
    bg: "bg-emerald-500/10",
    border: "border-b border-emerald-500/20",
    text: "text-emerald-200",
    muted: "text-emerald-300/60",
    link: "text-emerald-300",
    linkHover: "hover:text-emerald-200",
  },
  new_feature: {
    icon: Sparkles,
    bg: "bg-violet-500/10",
    border: "border-b border-violet-500/20",
    text: "text-violet-200",
    muted: "text-violet-300/60",
    link: "text-violet-300",
    linkHover: "hover:text-violet-200",
  },
  maintenance: {
    icon: ShieldAlert,
    bg: "bg-red-500/10",
    border: "border-b border-red-500/20",
    text: "text-red-200",
    muted: "text-red-300/60",
    link: "text-red-300",
    linkHover: "hover:text-red-200",
  },
  announcement: {
    icon: Bell,
    bg: "bg-sky-500/10",
    border: "border-b border-sky-500/20",
    text: "text-sky-200",
    muted: "text-sky-300/60",
    link: "text-sky-300",
    linkHover: "hover:text-sky-200",
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

  useWebSocket(
    {
      "broadcast.created": useCallback(() => {
        fetchBanners();
      }, [fetchBanners]),
      "broadcast.updated": useCallback(() => {
        fetchBanners();
      }, [fetchBanners]),
      "broadcast.deleted": useCallback(() => {
        fetchBanners();
      }, [fetchBanners]),
    },
    [fetchBanners],
  );

  const handleDismiss = async (id: string) => {
    await dismissBroadcast(id);
    setDismissed((prev) => new Set(prev).add(id));
  };

  const visible = broadcasts.filter((b) => !dismissed.has(b.id));

  if (visible.length === 0) return null;

  return (
    <div className="w-full">
      {visible.map((broadcast) => {
        const config = TYPE_CONFIG[broadcast.type] || TYPE_CONFIG.info;
        const Icon = config.icon;
        const hasMessage =
          broadcast.message && broadcast.message.trim().length > 0;

        return (
          <div
            key={broadcast.id}
            className={cn(
              "relative w-full overflow-hidden",
              config.bg,
              config.border,
              "animate-in fade-in slide-in-from-top-0 duration-300",
            )}
          >
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
              <Icon className={cn("h-4 w-4 shrink-0", config.text)} />

              <p className={cn("min-w-0 flex-1 text-sm", config.text)}>
                <span className="font-medium">{broadcast.title}</span>
                {hasMessage && (
                  <span className={cn(" ml-1.5", config.muted)}>
                    {broadcast.message}
                  </span>
                )}
              </p>

              {broadcast.action_label && broadcast.action_url && (
                <a
                  href={broadcast.action_url}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 text-xs font-medium transition-colors",
                    config.link,
                    config.linkHover,
                  )}
                >
                  {broadcast.action_label}
                  <ArrowRight className="h-3 w-3" />
                </a>
              )}

              <button
                onClick={() => handleDismiss(broadcast.id)}
                className={cn(
                  "ml-1 shrink-0 p-0.5 rounded transition-colors",
                  config.muted,
                  "hover:bg-white/5",
                )}
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
