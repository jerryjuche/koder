"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Code2, BookOpen, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/UserContext";
import { toast } from "@/lib/toast";

/**
 * Persistent bottom tab bar for the app shell (Spec A · Navigation model).
 *
 * Replaces the TopNav hamburger as primary mobile navigation: 5 destinations
 * always visible where the thumb rests, 56px row + additive safe-area inset,
 * 2px gold top indicator — the exact same indicator style as the problem
 * workspace's MobileBottomTabs (Spec A rule 4: one active style everywhere).
 *
 * Rules:
 *  1. Top-level screens get the tab bar  → hidden at >= 900px (`nav:`), where
 *     the desktop TopNav links take over.
 *  2. Sub-pages swap it for an action bar → lesson routes render their own
 *     Previous/Next dock, so the bar steps aside there.
 *  3. The workspace keeps its own 5 tabs  → `/problems/[slug]` lives outside
 *     the (main) layout and never sees this component.
 */

interface Tab {
  key: string;
  label: string;
  href: string;
  icon: React.ElementType;
  /** Admin-only destination (same gate the TopNav desktop link uses). */
  adminOnly?: boolean;
}

const TABS: Tab[] = [
  { key: "home", label: "Home", href: "/home", icon: Home },
  { key: "problems", label: "Problems", href: "/problems", icon: Code2 },
  { key: "learn", label: "Learn", href: "/learn/courses", icon: BookOpen, adminOnly: true },
  { key: "ranks", label: "Ranks", href: "/leaderboard", icon: Trophy },
  { key: "profile", label: "Profile", href: "/profile", icon: User },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const { user } = useUser();

  // Rule 2 — sub-pages swap the tab bar for their own action bar. The lesson
  // viewer docks Previous/Next at the bottom of the viewport; stacking a
  // second fixed bar under it would bury that dock.
  const isLessonRoute = pathname?.includes("/lessons/") ?? false;

  // (main) is an authenticated shell; wait for the user so the bar never
  // flashes destinations that would only bounce to the landing page.
  if (!user || isLessonRoute) return null;

  const isAdmin = user.role === "admin";

  const isActive = (href: string) =>
    pathname === href || (pathname?.startsWith(`${href}/`) ?? false);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 nav:hidden select-none border-t border-brand-charcoal-border bg-brand-charcoal-chrome pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="h-14 grid grid-cols-5 items-stretch">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          const locked = Boolean(tab.adminOnly) && !isAdmin;

          const inner = (
            <>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-brand-muted-gold" />
              )}
              <Icon size={20} strokeWidth={active ? 2.2 : 2} />
              <span
                className={cn(
                  "text-micro leading-none",
                  active ? "font-bold" : "font-medium",
                )}
              >
                {tab.label}
              </span>
            </>
          );

          const cls = cn(
            // ~78 x 56 per destination — comfortably past the 44px minimum.
            "relative flex flex-col items-center justify-center gap-1 touch-manipulation transition-colors duration-150 active:scale-[0.97] cursor-pointer",
            active
              ? "text-brand-muted-gold"
              : "text-brand-offwhite-muted hover:text-brand-offwhite",
          );

          if (locked) {
            return (
              <button
                key={tab.key}
                type="button"
                aria-disabled
                onClick={() =>
                  toast.info("Learn is coming soon — available to administrators only")
                }
                className={cn(cls, "opacity-60 cursor-not-allowed active:scale-100")}
              >
                {inner}
              </button>
            );
          }

          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cls}
              onClick={() => {
                // Same re-tap behaviour as TopNav's Dashboard link: landing on
                // the tab you're already on refreshes the screen.
                if (active) window.dispatchEvent(new Event("user-updated"));
              }}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
