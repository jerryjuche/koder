"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  LayoutDashboard,
  Trophy,
  Settings,
  LogOut,
  User as UserIcon,
  PlusCircle,
  CheckCheck,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/UserContext";
import { useNotifications } from "@/lib/useNotifications";
import { logout } from "@/lib/api";
import { Avatar } from "@/components/base/avatar/avatar";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notifMenuOpen, setNotifMenuOpen] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);

  // Reset avatarError when user data changes (e.g. after Google sync)
  React.useEffect(() => {
    setAvatarError(false);
  }, [user?.google_avatar_url]);

  // Close notification menu on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close notification menu on route change
  React.useEffect(() => {
    setNotifMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Problems", href: "/", icon: LayoutDashboard },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Admin", href: "/admin", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left section: Logo & Nav */}
        <div className="flex items-center gap-8">
          <Link href="/home" className="flex items-center group">
            <div className="relative w-12 h-12 overflow-hidden rounded-xl transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Koder"
                width={48}
                height={48}
                priority
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          <nav className="hidden md:flex gap-1.5">
            {navLinks
              .filter((link) => link.name !== "Admin" || user?.role === "admin")
              .map((link) => {
                const isActive =
                  pathname === link.href ||
                  (pathname !== "/" &&
                    link.href !== "/" &&
                    pathname?.startsWith(link.href));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "bg-muted text-foreground border border-border/50"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    <Icon size={16} />
                    {link.name}
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* Right section: User Status */}
        {loading ? (
          <div className="flex items-center gap-4 opacity-50">
            <div className="w-24 h-4 bg-muted rounded animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          </div>
        ) : user ? (
          <div className="flex items-center gap-5">
            {/* XP Level */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-1 text-primary text-sm font-bold">
                <svg
                  width="12"
                  height="16"
                  viewBox="0 0 12 16"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
                </svg>
                <span>Lv.{user.level}</span>
              </div>
              <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: (user.xp % 1000) / 10 + "%" }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {user.xp.toLocaleString()} XP
              </span>
            </div>

            {/* Add Problem Button */}
            {(user.role === "verified_contributor" || user.role === "admin") && (
              <Link
                href="/contribute"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-background bg-primary hover:bg-primary/90 rounded-md transition-colors mr-2"
              >
                <PlusCircle size={16} />
                <span>Add Problem</span>
              </Link>
            )}

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-destructive rounded-full ring-2 ring-background">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-border">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                        No new notifications.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.is_read) markAsRead(n.id);
                            setNotifMenuOpen(false);
                            router.push("/settings?tab=notifications");
                          }}
                          className={cn(
                            "px-4 py-3 border-b border-border/50 cursor-pointer transition-colors",
                            n.is_read ? "opacity-60" : "bg-muted/30"
                          )}
                        >
                          <p className="text-sm text-foreground">{n.message}</p>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && unreadCount > 0 && (
                    <div className="px-4 py-2 border-t border-border bg-muted/50">
                      <button
                        onClick={() => {
                          markAllAsRead();
                          setNotifMenuOpen(false);
                        }}
                        className="flex items-center justify-center gap-2 w-full py-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        <CheckCheck size={16} /> Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown (shadcn DropdownMenu) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Avatar
                      src={!avatarError ? user.google_avatar_url : undefined}
                      name={user.name}
                      colorIndex={user.colorIndex}
                      size="md"
                      verified={user.role === "admin"}
                      className="ring-1 ring-border/50"
                    />
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground leading-tight">
                            {user.name}
                          </span>
                          {user.role === "admin" && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {user.username || user.studentId}
                        </div>
                      </div>
                      <ChevronDown size={14} className="text-muted-foreground" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3 py-1">
                      <Avatar
                        src={!avatarError ? user.google_avatar_url : undefined}
                        name={user.name}
                        colorIndex={user.colorIndex}
                        size="sm"
                        verified={user.role === "admin"}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          {user.role === "admin" && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <span className="text-amber-400 font-mono text-xs">
                            {user.username || user.studentId}
                          </span>
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon size={16} /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings size={16} /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout();
                    window.location.href = "/login";
                  }}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut size={16} /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm font-bold text-foreground hover:text-primary transition-colors"
          >
            Log In
          </Link>
        )}
      </div>
    </header>
  );
}
