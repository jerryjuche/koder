"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchUser } from "@/lib/api";
import { User } from "@/lib/types";

export default function GoogleLinkBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    if (localStorage.getItem("google-banner-dismissed") === "true") return false;
    return true;
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!visible) return;
    fetchUser().then((res) => {
      if (res.success && res.data) setUser(res.data);
    });
  }, [visible]);

  const handleDismiss = () => {
    localStorage.setItem("google-banner-dismissed", "true");
    setVisible(false);
  };

  if (!visible || !user || user.google_linked) return null;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-l-[3px] border-l-amber-500 bg-[#1A1A1A] transition-colors",
        "animate-in fade-in slide-in-from-top-2 duration-500",
      )}
    >
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-foreground leading-snug">
              Secure your account
            </h4>
            <p className="mt-1 text-[13px] leading-relaxed text-amber-100/70">
              Link your Google account for seamless sign-in and automatic profile syncing across all your devices.
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-amber-500/10 hover:text-amber-300"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>

        <a
          href="/settings?tab=security"
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
            "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25",
          )}
        >
          Link Google
        </a>
      </div>
    </div>
  );
}
