"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { fetchUser, updatePrimaryLanguage } from "@/lib/api";
import { useWebSocket } from "@/lib/event";

type UserContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => void;
  setPrimaryLanguage: (lang: string) => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: () => {},
  setPrimaryLanguage: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const redirecting = useRef(false);

  const loadUser = useCallback(async () => {
    try {
      const res = await fetchUser();
      if (res.success && res.data) {
        setUser(res.data);
      } else if (!redirecting.current) {
        redirecting.current = true;
        router.replace("/");
      }
    } catch {
      if (!redirecting.current) {
        redirecting.current = true;
        router.replace("/");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const initialLoad = async () => {
      try {
        const res = await fetchUser();
        if (res.success && res.data) {
          setUser(res.data);
        } else if (!redirecting.current) {
          redirecting.current = true;
          router.replace("/");
        }
      } catch {
        if (!redirecting.current) {
          redirecting.current = true;
          router.replace("/");
        }
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
    window.addEventListener("user-updated", loadUser);
    return () => window.removeEventListener("user-updated", loadUser);
  }, [loadUser, router]);

  useWebSocket({
    "user.xp.updated": useCallback(() => {
      loadUser();
    }, [loadUser]),
  });

  const refreshUser = useCallback(() => {
    loadUser();
  }, [loadUser]);

  const setPrimaryLanguage = useCallback(async (lang: string) => {
    try {
      localStorage.setItem("koder_language", lang);
      await updatePrimaryLanguage(lang);
      setUser((prev) => prev ? { ...prev, primaryLanguage: lang } : prev);
      window.dispatchEvent(new Event("user-updated"));
    } catch {
      console.error("Failed to save language preference");
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, setPrimaryLanguage }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
