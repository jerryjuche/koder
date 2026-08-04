"use client";

import React, { useState, useRef, useCallback } from "react";
import { Search, ShieldCheck, ShieldOff, User, Mail, Loader2, X, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminResetPassword, searchUsers, toggleUserVerified } from "@/lib/api";
import { toast } from "@/lib/toast";
import { UserSearchResult } from "@/lib/types";
import { ProfileHoverCard } from "@/components/profile/ProfileHoverCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  compact?: boolean;
}

export default function UserVerificationPanel({ compact }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [resetUser, setResetUser] = useState<UserSearchResult | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    const res = await searchUsers(trimmed);
    if (res.success && res.data) {
      setResults(res.data);
    } else {
      toast.error(res.error?.message || "Search failed");
      setResults([]);
    }
    setLoading(false);
  }, []);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  }, [doSearch]);

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setSearched(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const handleToggle = useCallback(async (user: UserSearchResult) => {
    setToggling(user.id);
    const res = await toggleUserVerified(user.id);
    if (res.success && res.data) {
      const data = res.data;
      setResults((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, verified: data.verified } : u))
      );
      toast.success(
        `${user.name} ${data.verified ? "verified" : "unverified"}`
      );
    } else {
      toast.error(res.error?.message || "Failed to update");
    }
    setToggling(null);
  }, []);

  const handleReset = useCallback(async () => {
    if (!resetUser) return;
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setResetting(true);
    const res = await adminResetPassword(resetUser.id, newPassword);
    if (res.success) {
      toast.success(`Password reset for ${resetUser.name}`);
      setResetUser(null);
      setNewPassword("");
    } else {
      toast.error(res.error?.message || "Failed to reset password");
    }
    setResetting(false);
  }, [resetUser, newPassword]);

  return (
    <div
      className={cn(
        "bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden",
        compact && "xl:col-span-1",
      )}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-brand-charcoal-border flex items-center gap-2">
        <ShieldCheck size={18} className="text-emerald-400" />
        <h3 className="font-bold text-brand-offwhite">User Verification</h3>
      </div>

      <div className="p-4 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-offwhite-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") doSearch(query);
            }}
            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg pl-9 pr-8 py-2.5 text-sm text-brand-offwhite placeholder-brand-offwhite-muted/50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-offwhite-muted hover:text-brand-offwhite transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className={cn("space-y-1", !compact && "max-h-[320px] overflow-y-auto")}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="text-amber-400 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            results.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-brand-charcoal-base/40 hover:bg-brand-charcoal-base transition-colors group"
              >
                {/* User info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      "bg-gradient-to-br from-brand-charcoal-hover to-brand-charcoal-base text-brand-offwhite-muted",
                    )}
                  >
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <ProfileHoverCard userId={user.id} side="bottom" align="start">
                        <span className="text-sm font-semibold text-brand-offwhite truncate cursor-pointer hover:text-amber-400 transition-colors">
                          {user.name}
                        </span>
                      </ProfileHoverCard>
                      {user.role === "admin" && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/20 shrink-0">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-brand-offwhite-muted mt-0.5">
                      <span className="flex items-center gap-1">
                        <User size={10} />
                        @{user.username || "unknown"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={10} />
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setResetUser(user);
                      setNewPassword("");
                    }}
                    title="Reset password"
                    className="relative flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-all shrink-0 bg-brand-charcoal-hover/40 text-brand-offwhite-muted border border-brand-charcoal-border hover:border-amber-500/30 hover:text-amber-400"
                  >
                    <KeyRound size={13} />
                  </button>
                  <button
                    onClick={() => handleToggle(user)}
                    disabled={toggling === user.id}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0",
                      user.verified
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-brand-charcoal-hover/40 text-brand-offwhite-muted border border-brand-charcoal-border hover:border-brand-offwhite-muted/30 hover:text-brand-offwhite",
                      toggling === user.id && "opacity-50 pointer-events-none",
                    )}
                  >
                    {toggling === user.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : user.verified ? (
                      <ShieldCheck size={13} />
                    ) : (
                      <ShieldOff size={13} />
                    )}
                    {toggling === user.id
                      ? "..."
                      : user.verified
                        ? "Verified"
                        : "Unverified"}
                  </button>
                </div>
              </div>
            ))
          ) : searched ? (
            <div className="flex flex-col items-center justify-center py-8 text-brand-offwhite-muted">
              <Search size={24} className="mb-2 opacity-40" />
              <p className="text-sm">No users found</p>
              <p className="text-xs opacity-60 mt-0.5">Try a different search term</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-brand-offwhite-muted">
              <ShieldCheck size={24} className="mb-2 opacity-30" />
              <p className="text-sm">Search for a user by name or username</p>
              <p className="text-xs opacity-60 mt-0.5">Type at least 2 characters</p>
            </div>
          )}
        </div>
      </div>

      {/* Reset password dialog */}
      <Dialog open={!!resetUser} onOpenChange={(open) => { if (!open) setResetUser(null); }}>
        <DialogContent className="sm:max-w-md bg-brand-charcoal-card border-brand-charcoal-border">
          <DialogHeader>
            <DialogTitle className="text-brand-offwhite flex items-center gap-2">
              <KeyRound size={16} className="text-amber-400" />
              Reset password
            </DialogTitle>
            <DialogDescription className="text-brand-offwhite-muted">
              Set a new password for <span className="text-brand-offwhite font-semibold">{resetUser?.name}</span>
              {resetUser?.username ? ` (@${resetUser.username})` : ""}. The user will need to sign in with this new password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="admin-new-password" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
              New password
            </Label>
            <Input
              id="admin-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus-visible:border-amber-500/50 focus-visible:ring-0"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => { setResetUser(null); setNewPassword(""); }}
              className="border-brand-charcoal-border text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReset}
              disabled={resetting}
              className="bg-amber-500 hover:bg-amber-600 text-brand-charcoal-base font-semibold"
            >
              {resetting ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
              {resetting ? "Resetting..." : "Reset password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
