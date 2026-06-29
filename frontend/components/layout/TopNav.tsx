"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Code2,
  Bell,
  LayoutDashboard,
  Trophy,
  Settings,
  LogOut,
  User as UserIcon,
  PlusCircle,
  CheckCheck,
  ChevronDown,
  GitBranch,
} from "lucide-react";
import { cn, getUserColor } from "@/lib/utils";
import { useUser } from "@/lib/UserContext";
import { useNotifications } from "@/lib/useNotifications";
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
  const { user, loading } = useUser();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notifMenuOpen, setNotifMenuOpen] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);

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
    <header className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left section: Logo & Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-1.5 rounded-md text-background transition-transform group-hover:scale-105">
              <Code2 size={20} className="stroke-[2.5]" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              Zero<span className="text-primary">Judge</span>
            </span>
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
                    {user.gitea_avatar_url && !avatarError ? (
                      <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-border shadow-inner flex-shrink-0">
                        <Image
                          src={user.gitea_avatar_url}
                          alt={user.gitea_username ?? "Avatar"}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner flex-shrink-0",
                          getUserColor(user.colorIndex),
                        )}
                      >
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    )}
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="text-left">
                        <div className="text-sm font-medium text-foreground leading-tight">
                          {user.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.gitea_username || (
                            <span className="font-mono">{user.studentId}</span>
                          )}
                        </div>
                      </div>
                      <ChevronDown size={14} className="text-muted-foreground" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3 py-1">
                      {user.gitea_avatar_url && !avatarError ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0">
                          <Image
                            src={user.gitea_avatar_url}
                            alt={user.gitea_username ?? "Avatar"}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0",
                            getUserColor(user.colorIndex),
                          )}
                        >
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.gitea_username ? (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <GitBranch size={10} />
                              {user.gitea_username}
                            </span>
                          ) : (
                            <span className="font-mono">{user.studentId}</span>
                          )}
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
                  onClick={() => {
                    localStorage.removeItem("token");
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
