"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <p className="text-[10rem] sm:text-[12rem] font-bold leading-none text-brand-muted-gold/10 select-none tracking-tighter">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center shadow-lg">
              <FileQuestion className="w-10 h-10 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Page not found
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Check the URL or navigate back to a known page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className={cn(
              "inline-flex items-center gap-2",
              "bg-primary text-primary-foreground",
              "px-6 py-2.5 rounded-lg font-semibold text-sm",
              "hover:opacity-90 transition-all",
              "shadow-lg shadow-primary/20",
            )}
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className={cn(
              "inline-flex items-center gap-2",
              "text-muted-foreground hover:text-foreground",
              "px-6 py-2.5 rounded-lg font-semibold text-sm",
              "transition-colors border border-border hover:bg-muted",
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>

      <p className="mt-20 text-xs text-muted-foreground/50">
        Koder &mdash; Code. Learn. Grow.
      </p>
    </div>
  );
}
