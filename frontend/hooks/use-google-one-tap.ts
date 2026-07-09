import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            options: { theme: string; size: string; text?: string; width?: string },
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

type OneTapCallback = (response: { credential: string }) => void;

let scriptLoaded = false;
let scriptLoading = false;
let initialized = false;
let globalCallback: OneTapCallback | null = null;
const loadListeners: Array<() => void> = [];
const initListeners: Array<() => void> = [];

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
    } as any);
  } catch (err) {
    initialized = false;
  }
  // Signal ready regardless of init success — renderButton (popup) works
  // without a successful initialize(). Only prompt() needs it.
  initListeners.forEach((fn) => fn());
  initListeners.length = 0;
}

export function useGoogleOneTap(onSuccess: OneTapCallback) {
  const cbRef = useRef<OneTapCallback>(onSuccess);

  useEffect(() => {
    cbRef.current = onSuccess;
  }, [onSuccess]);

  const canLoad = typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [ready, setReady] = useState(initialized);

  // Sync ready with initialized state during render (avoids setState in effect)
  const [prevInitSync, setPrevInitSync] = useState(initialized);
  if (initialized !== prevInitSync && canLoad) {
    setPrevInitSync(initialized);
    if (initialized) setReady(true);
  }

  useEffect(() => {
    if (!canLoad) return;

    if (initialized) return;

    globalCallback = (response) => {
      cbRef.current(response);
    };

    if (!scriptLoaded) {
      loadGsiScript();
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

    const onInit = () => setReady(true);
    initListeners.push(onInit);

    if (scriptLoaded) {
      ensureInitialized(clientId);
    } else {
      const onLoad = () => ensureInitialized(clientId);
      loadListeners.push(onLoad);
      return () => {
        const idx = loadListeners.indexOf(onLoad);
        if (idx !== -1) loadListeners.splice(idx, 1);
        const iidx = initListeners.indexOf(onInit);
        if (iidx !== -1) initListeners.splice(iidx, 1);
      };
    }

    return () => {
      const iidx = initListeners.indexOf(onInit);
      if (iidx !== -1) initListeners.splice(iidx, 1);
    };
  }, [canLoad]);

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
    } catch (err) {
      console.error('[GIS] renderButton() failed:', err);
    }
  }, []);

  return { prompt, renderButton, ready };
}
