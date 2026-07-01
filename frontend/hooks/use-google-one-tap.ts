import { useCallback, useEffect, useRef } from "react";

type OneTapCallback = (response: { credential: string }) => void;

let scriptLoaded = false;
let scriptLoading = false;
let initialized = false;
let globalCallback: OneTapCallback | null = null;
const loadListeners: Array<() => void> = [];

function loadGsiScript() {
  if (scriptLoaded || scriptLoading) return;
  scriptLoading = true;

  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.onload = () => {
    scriptLoaded = true;
    scriptLoading = false;
    loadListeners.forEach((fn) => fn());
    loadListeners.length = 0;
  };
  document.head.appendChild(script);
}

function ensureInitialized(clientId: string) {
  if (initialized || !window.google) return;
  initialized = true;

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        globalCallback?.(response);
      },
      cancel_on_tap_outside: true,
      itp_support: true,
    } as any);
  } catch {
    initialized = false;
  }
}

export function useGoogleOneTap(onSuccess: OneTapCallback) {
  const cbRef = useRef<OneTapCallback>(onSuccess);
  cbRef.current = onSuccess;

  const ready = typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!ready) return;

    globalCallback = (response) => {
      cbRef.current(response);
    };

    if (!scriptLoaded) {
      loadGsiScript();
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

    if (scriptLoaded) {
      ensureInitialized(clientId);
    } else {
      const onLoad = () => ensureInitialized(clientId);
      loadListeners.push(onLoad);
      return () => {
        const idx = loadListeners.indexOf(onLoad);
        if (idx !== -1) loadListeners.splice(idx, 1);
      };
    }
  }, [ready]);

  const prompt = useCallback(() => {
    if (!window.google) return;
    try {
      (window.google.accounts.id as any).prompt();
    } catch {
      // FedCM unavailable in this context (e.g. localhost, insecure origin)
    }
  }, []);

  const renderButton = useCallback((element: HTMLElement, options?: { width?: number }) => {
    if (!window.google) return;
    try {
      window.google.accounts.id.renderButton(element, {
        type: 'standard',
        shape: 'rectangular',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        width: options?.width ?? 350,
      } as any);
    } catch {
      // Render failed
    }
  }, []);

  return { prompt, renderButton, ready };
}
