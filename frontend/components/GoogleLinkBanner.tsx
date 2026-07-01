"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle } from "@untitledui/icons";
import { Chrome, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { linkGoogle, fetchUser } from "@/lib/api";
import { User } from "@/lib/types";
import { toast } from "@/lib/toast";
import { useGoogleOneTap } from "@/hooks/use-google-one-tap";

export default function GoogleLinkBanner() {
  const [visible, setVisible] = useState(false);
  const [linking, setLinking] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const gisRef = useRef<HTMLDivElement>(null);

  const { renderButton, ready } = useGoogleOneTap(
    useCallback(async (response) => {
      setLinking(true);
      try {
        const res = await linkGoogle(response.credential);
        if (res.success) {
          if (res.data?.token) {
            localStorage.setItem("token", res.data.token);
          }
          window.dispatchEvent(new Event("user-updated"));
          setVisible(false);
          toast.success({
            title: "Google account linked",
            description: "You can now sign in with Google.",
          });
        } else {
          toast.error({
            title: "Link failed",
            description: res.error?.message || "Could not link Google account.",
          });
        }
      } catch {
        toast.error({ title: "Link failed", description: "Network error while linking." });
      } finally {
        setLinking(false);
      }
    }, []),
  );

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

  useEffect(() => {
    if (ready && gisRef.current) {
      renderButton(gisRef.current);
    }
  }, [ready, renderButton]);

  const handleLink = useCallback(() => {
    const el = gisRef.current?.querySelector<HTMLElement>('[role="button"], button');
    el?.click();
  }, []);

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
        <button
          onClick={handleLink}
          disabled={linking || !ready}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
            "bg-amber-400/15 text-amber-300 hover:bg-amber-400/25",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {linking ? (
            <>
              <div className="size-4 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
              Connecting...
            </>
          ) : (
            <>
              <Chrome size={16} />
              Link Google
            </>
          )}
        </button>
        <button
          onClick={handleDismiss}
          className="flex size-8 items-center justify-center rounded-lg text-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
      <div ref={gisRef} className="hidden" />
    </div>
  );
}
