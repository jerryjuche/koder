'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Code2, Bell, LayoutDashboard, Trophy, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { cn, getUserColor } from '@/lib/utils';
import { fetchUser } from '@/lib/api';
import { User } from '@/lib/types';

export default function TopNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    fetchUser().then(res => {
      if (res.success) setUser(res.data);
    });
  }, []);

  const navLinks = [
    { name: 'Problems', href: '/', icon: LayoutDashboard },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Admin', href: '/admin', icon: Settings },
  ];

  return (
    <header className="border-b border-brand-charcoal-border bg-brand-charcoal-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left section: Logo & Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-brand-muted-gold p-1.5 rounded-md text-brand-charcoal-base transition-transform group-hover:scale-105">
              <Code2 size={20} className="stroke-[2.5]" />
            </div>
            <span className="font-bold text-xl tracking-tight text-brand-offwhite">
              Zero<span className="text-brand-muted-gold">Judge</span>
            </span>
          </Link>

          <nav className="hidden md:flex gap-1.5">
            {navLinks.map(link => {
              const isActive = pathname === link.href || (pathname !== '/' && link.href !== '/' && pathname?.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                    isActive 
                      ? "bg-brand-charcoal-hover text-brand-offwhite border border-brand-charcoal-border/50" 
                      : "text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover/50"
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
        {user ? (
          <div className="flex items-center gap-5">
            {/* XP Bar */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-1 text-brand-muted-gold text-sm font-bold">
                <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
                </svg>
                <span>Lv.{user.level}</span>
              </div>
              <div className="w-32 h-1.5 bg-brand-charcoal-hover rounded-full overflow-hidden">
                <div 
                  className="bg-brand-muted-gold h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: ((user.xp % 1000) / 10) + '%' }}
                />
              </div>
              <span className="text-xs text-brand-offwhite-muted font-mono">{user.xp.toLocaleString()} XP</span>
            </div>

            <button className="text-brand-offwhite-muted hover:text-brand-offwhite transition-colors relative">
              <Bell size={20} />
              <span className="absolute 0 right-0 w-2 h-2 bg-brand-error rounded-full ring-2 ring-brand-charcoal-base"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner", getUserColor(user.avatarIndex))}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-brand-offwhite leading-tight">{user.name}</div>
                  <div className="text-xs text-brand-offwhite-muted font-mono">{user.studentId}</div>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl shadow-xl py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover transition-colors">
                    <UserIcon size={16} /> Profile
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover transition-colors">
                    <Settings size={16} /> Settings
                  </Link>
                  <div className="h-px bg-brand-charcoal-border my-1"></div>
                  <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-error hover:bg-brand-error/10 transition-colors">
                    <LogOut size={16} /> Sign Out
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-48 h-8 animate-pulse bg-brand-charcoal-hover rounded-md"></div>
        )}
      </div>
    </header>
  );
}
