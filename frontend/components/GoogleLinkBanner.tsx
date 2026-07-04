"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "@untitledui/icons";
import { Chrome, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchUser } from "@/lib/api";
import { User } from "@/lib/types";

export default function GoogleLinkBanner() {
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("google-banner-dismissed") === "true") return;
    setVisible(true);
  }, []);

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
        "relative flex items-start gap-4 rounded-2xl border px-5 py-4 shadow-lg",
        "border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-amber-500/[0.03] to-transparent",
        "animate-in fade-in slide-in-from-top-2 duration-500",
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
        <AlertTriangle className="size-5 text-amber-400" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-amber-300">Secure your account</span>
          <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
            Recommended
          </span>
        </div>
        <p className="mt-1 text-sm text-amber-200/70 leading-relaxed">
          Link your Google account for seamless sign-in and automatic profile syncing across all your devices.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <a
          href="/settings?tab=security"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
            "bg-amber-400/15 text-amber-300 hover:bg-amber-400/25",
          )}
        >
          <Chrome size={16} />
          Link Google
        </a>
        <button
          onClick={handleDismiss}
          className="flex size-8 items-center justify-center rounded-lg text-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
