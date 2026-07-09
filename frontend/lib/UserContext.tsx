"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { User } from "@/lib/types";
import { fetchUser, updatePrimaryLanguage } from "@/lib/api";

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const res = await fetchUser();
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch {
      // silently fail — handled by login redirect
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    window.addEventListener("user-updated", loadUser);
    return () => window.removeEventListener("user-updated", loadUser);
  }, [loadUser]);

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
