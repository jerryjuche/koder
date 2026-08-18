"use client";

import { useEffect, useState } from "react";
import { Link2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchUser } from "@/lib/api";
import { User } from "@/lib/types";

export default function GoogleLinkBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    if (localStorage.getItem("google-banner-dismissed") === "true")
      return false;
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
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 animate-in fade-in slide-in-from-top-0 duration-300">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
        <Link2 className="h-4 w-4 shrink-0 text-amber-200" />

        <p className="min-w-0 flex-1 text-sm text-amber-200">
          <span className="font-medium">Secure your account</span>
          <span className="ml-1.5 text-amber-300/60">
            Link Google for seamless sign-in and automatic profile syncing.
          </span>
        </p>

        <a
          href="/settings?tab=security"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-amber-300 transition-colors hover:text-amber-200"
        >
          Link Google
        </a>

        <button
          onClick={handleDismiss}
          className="ml-1 shrink-0 p-0.5 rounded transition-colors text-amber-300/60 hover:bg-white/5"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
