"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingContent from "@/components/LandingContent";
import { fetchUser } from "@/lib/api";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetchUser();
        if (res.success && res.data) {
          router.replace("/home");
        }
      } catch {
        // Not authenticated — show landing page
      }
    };
    checkAuth();
  }, [router]);

  return <LandingContent />;
}
