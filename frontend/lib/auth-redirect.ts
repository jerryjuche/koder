"use client";

const REDIRECT_KEY = "koder_redirect";

const DEEP_PATHS = ["/problems", "/learn", "/profile", "/leaderboard", "/settings", "/admin", "/contribute"];

export function captureAuthRedirect(): void {
  if (typeof window === "undefined") return;
  const { pathname, search } = window.location;
  const isDeep = DEEP_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (isDeep) {
    try {
      sessionStorage.setItem(REDIRECT_KEY, pathname + search);
    } catch {
      // sessionStorage unavailable (private mode) — ignore, landing page is the fallback
    }
  }
}

export function consumeAuthRedirect(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const path = sessionStorage.getItem(REDIRECT_KEY);
    if (path) sessionStorage.removeItem(REDIRECT_KEY);
    return path;
  } catch {
    return null;
  }
}

// Resolves a `redirect_to` query value into a safe same-origin internal path.
// Guards against open redirects: external/other-origin targets and bare "/"
// (which would just loop the root page) resolve to null so callers fall back
// to their default destination.
export function getSafeRedirectTarget(value: string | null): string | null {
  if (!value) return null;
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : null;
    if (!origin) return null;
    const url = new URL(value, origin);
    if (url.origin !== origin) return null;
    const target = `${url.pathname}${url.search}${url.hash}`;
    if (!target || target === "/") return null;
    return target;
  } catch {
    return null;
  }
}

// Reads the current page's `?redirect_to=` param and returns a validated
// internal path, or null when absent/invalid. Safe to call at any time in the
// client; the caller decides when the value is consumed.
export function getCurrentRedirectTarget(): string | null {
  if (typeof window === "undefined") return null;
  return getSafeRedirectTarget(new URL(window.location.href).searchParams.get("redirect_to"));
}
