"use client";

import { useEffect, useRef } from "react";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" className="flex-shrink-0">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

export function GoogleButton({
  onCredential,
  loading,
  disabled,
}: {
  onCredential: (credential: string) => void;
  loading: boolean;
  disabled: boolean;
}) {
  const gisRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || initializedRef.current) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.google) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential: string }) => {
            onCredential(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: false,
        });

        initializedRef.current = true;

        if (gisRef.current) {
          window.google.accounts.id.renderButton(gisRef.current, {
            type: "standard",
            shape: "rectangular",
            theme: "outline",
            size: "large",
            width: 300,
            text: "signin_with",
          });
        }
      } catch (error) {
        console.error("GIS initialization failed:", error);
      }
    };

    document.head.appendChild(script);

    return () => {
      initializedRef.current = false;
    };
  }, [onCredential]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#2A2A3A] bg-[#1C1C28] px-4 py-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-offwhite-muted/30 border-t-brand-offwhite-muted" />
        <span className="text-[15px] font-medium text-brand-offwhite-muted">
          Signing in with Google...
        </span>
      </div>
    );
  }

  return (
    <div className="group relative w-full">
      {/* Custom styled button (visible layer) */}
      <div className="pointer-events-none flex w-full items-center justify-center gap-3 rounded-xl border border-[#2A2A3A] bg-[#1C1C28] px-4 py-3 transition-all duration-200 group-hover:border-brand-muted-gold/30 group-hover:bg-[#252535]">
        <GoogleIcon />
        <span className="text-[15px] font-medium text-brand-offwhite transition-colors group-hover:text-white">
          Continue with Google
        </span>
      </div>
      {/* Invisible GIS overlay — captures clicks, opens popup */}
      <div
        ref={gisRef}
        className="absolute inset-0 opacity-0 [&>div]:!h-full [&>div]:!w-full [&>div>div>iframe]:!w-full"
      />
    </div>
  );
}
