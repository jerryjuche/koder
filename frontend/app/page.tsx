"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LandingContent from "@/components/LandingContent";
import { fetchUser } from "@/lib/api";

export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetchUser();
        if (res.success && res.data) {
          router.replace("/home");
          return;
        }
      } catch {
        // Not authenticated — show landing page
      }
      setChecking(false);
    };
    checkAuth();
  }, [router]);

  if (checking) return null;

  return <LandingContent />;
}
