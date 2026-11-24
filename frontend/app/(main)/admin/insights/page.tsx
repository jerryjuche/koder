"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { fetchUser } from "@/lib/api";
import AdminInsightsPanel from "@/components/admin/AdminInsightsPanel";

// Full-screen chat surface for Atlas. The admin dashboard keeps a compact
// launcher card; the conversation itself lives on its own page.
export default function AdminInsightsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const userRes = await fetchUser();
      if (cancelled) return;
      if (!userRes.success || userRes.data?.role !== "admin") {
        router.push("/home");
        return;
      }
      setIsAuthorized(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex h-64 items-center justify-center text-brand-offwhite-muted">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-3 pb-4 pt-3 sm:px-5">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-brand-offwhite-muted transition hover:bg-brand-charcoal-hover/60 hover:text-brand-offwhite"
        >
          <ArrowLeft size={13} />
          Back to admin
        </Link>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-offwhite-muted/40">
          Admin · Atlas
        </span>
      </div>
      <AdminInsightsPanel />
    </div>
  );
}
