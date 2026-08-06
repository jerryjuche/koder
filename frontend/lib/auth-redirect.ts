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
