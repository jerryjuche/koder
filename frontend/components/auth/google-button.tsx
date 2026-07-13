"use client";

import { useEffect, useRef } from "react";

export function GoogleButton({
  onCredential,
  loading,
  disabled,
}: {
  onCredential: (credential: string) => void;
  loading: boolean;
  disabled: boolean;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);
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

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
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
    <div ref={buttonRef} className="flex w-full justify-center [&>div]:!w-full" />
  );
}
