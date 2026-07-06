"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { User as UserIcon, Settings as SettingsIcon, Bell, Shield, Palette, LogOut, CheckCircle2, Chrome, CheckCheck, Clock, GitPullRequest, XCircle, KeyRound, Eye, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { fetchUser, fetchUserProfile, updateUserProfile, linkGoogle, deleteAccount, fetchRecentNotifications, fetchApi, logout, changePassword, updateUsername, verifyPin, setPin } from "@/lib/api";
import { User, UserProfile, NotificationItem } from "@/lib/types";
import { toast } from "@/lib/toast";
import { useGoogleOneTap } from "@/hooks/use-google-one-tap";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PinInput } from "@/components/base/input/pin-input";
import { REGEXP_ONLY_DIGITS } from "input-otp";

type Tab = "profile" | "appearance" | "notifications" | "security";

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const validTabs: Tab[] = ["profile", "appearance", "notifications", "security"];
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam && validTabs.includes(tabParam as Tab) ? (tabParam as Tab) : "profile"
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  // Preferences states (local storage)
  const [theme, setTheme] = useState("vs-dark");

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Google linking
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  // Delete account
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Username change
  const [newUsername, setNewUsername] = useState("");
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  // Change password
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [cpPin, setCpPin] = useState('');
  const [cpStep, setCpStep] = useState<'pin' | 'set-pin' | 'password' | 'done'>('pin');
  const [cpNewPassword, setCpNewPassword] = useState('');
  const [cpConfirmPassword, setCpConfirmPassword] = useState('');
  const [cpNewPin, setCpNewPin] = useState('');
  const [cpConfirmNewPin, setCpConfirmNewPin] = useState('');
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState('');

  const [cpShowPin, setCpShowPin] = useState(false);
  const cpPinSubmitRef = useRef<HTMLButtonElement>(null);
  const { prompt } = useGoogleOneTap(
    useCallback(async (response: { credential: string }) => {
      setLinkingGoogle(true);
      try {
        const res = await linkGoogle(response.credential);
        if (res.success) {
          window.dispatchEvent(new Event("user-updated"));
          toast.success({
            title: "Google account linked",
            description: "You can now sign in with Google.",
          });
        } else {
          toast.error({
            title: "Link failed",
            description: res.error?.message || "Could not link Google account.",
          });
        }
      } catch {
        toast.error({ title: "Link failed", description: "Unable to connect. Please try again." });
      } finally {
        setLinkingGoogle(false);
      }
    }, []),
  );

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const [profileRes, userRes] = await Promise.all([
          fetchUserProfile(),
          fetchUser(),
        ]);
        if (!mounted) return;
        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
          setName(profileRes.data.name || "");
          setBio((profileRes.data as any).bio || "");
          setNewUsername(profileRes.data.username || "");
        }
        if (userRes.success && userRes.data) {
          setUser(userRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadProfile();

    // Load local preference
    setTheme(localStorage.getItem("koder_theme") || "vs-dark");

    const onUserUpdated = () => {
      fetchUser().then((res) => {
        if (mounted && res.success && res.data) {
          setUser(res.data);
          setNewUsername(res.data.username || "");
        }
      });
    };
    window.addEventListener("user-updated", onUserUpdated);

    return () => {
      mounted = false;
      window.removeEventListener("user-updated", onUserUpdated);
    };
  }, []);

  // Fetch notifications when tab is active
  useEffect(() => {
    if (activeTab !== "notifications") return;
    setNotifLoading(true);
    fetchRecentNotifications().then((res) => {
      if (res.success && res.data) {
        setNotifications(res.data);
      }
      setNotifLoading(false);
    });
  }, [activeTab]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await updateUserProfile(name, bio);
      if (res.success) {
        toast.success({
          title: "Profile updated",
          description: "Your profile changes have been saved successfully.",
        });
        window.dispatchEvent(new Event("user-updated"));
      } else {
        throw new Error(res.error?.message || "Failed to update profile");
      }
    } catch (err: any) {
      toast.error({
        title: "Update failed",
        description: err.message || "Something went wrong while saving your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSetUsername = async () => {
    const sanitized = newUsername.replace(/[^a-zA-Z0-9_-]/g, '');
    if (sanitized !== newUsername) {
      setUsernameError("Username can only contain letters, numbers, hyphens, and underscores");
      setUsernameSaving(false);
      return;
    }
    if (sanitized.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      setUsernameSaving(false);
      return;
    }
    if (sanitized.length > 30) {
      setUsernameError("Username must be 30 characters or fewer");
      setUsernameSaving(false);
      return;
    }
    setUsernameSaving(true);
    setUsernameError("");
    try {
      const res = await updateUsername(sanitized);
      if (res.success) {
        toast.success({
          title: "Username set!",
          description: "Your username has been configured successfully.",
        });
        window.dispatchEvent(new Event("user-updated"));
        // Refresh user data
        const userRes = await fetchUser();
        if (userRes.success && userRes.data) {
          setUser(userRes.data);
        }
      } else {
        setUsernameError(res.error?.message || "Failed to set username");
      }
    } catch (err: any) {
      setUsernameError(err.message || "Unable to connect. Please try again.");
    } finally {
      setUsernameSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/auth/login";
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteAccount();
      if (res.success) {
        window.location.href = "/auth/login";
      } else {
        throw new Error(res.error?.message || "Failed to delete account");
      }
    } catch (err: any) {
      toast.error({
        title: "Delete failed",
        description: err.message || "Something went wrong while deleting your account.",
      });
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.FC<any> }[] = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-charcoal-base flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-muted-gold border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-brand-charcoal-base min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon size={32} className="text-brand-muted-gold" />
          <h1 className="text-3xl font-bold tracking-tight text-brand-offwhite">
            Settings
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold",
                    activeTab === tab.id
                      ? "bg-brand-muted-gold/10 text-brand-muted-gold border border-brand-muted-gold/20"
                      : "text-brand-offwhite-muted hover:bg-brand-charcoal-hover hover:text-brand-offwhite border border-transparent"
                  )}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
            
            <div className="pt-6 mt-6 border-t border-brand-charcoal-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-brand-error hover:bg-brand-error/10 transition-all duration-200 text-sm font-semibold border border-transparent"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-6 sm:p-8 shadow-xl">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-bold text-brand-offwhite mb-1">Public Profile</h2>
                  <p className="text-sm text-brand-offwhite-muted mb-6">
                    This information will be displayed publicly on your profile and leaderboards.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-offwhite-muted uppercase tracking-wider mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg px-4 py-2.5 text-sm text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-offwhite-muted uppercase tracking-wider mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg px-4 py-2.5 text-sm text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors resize-none"
                      placeholder="Tell the community about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-offwhite-muted uppercase tracking-wider mb-2">
                      Username
                    </label>
                    {user?.usernameSet === false ? (
                      <>
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => { setNewUsername(e.target.value); setUsernameError(""); }}
                          className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg px-4 py-2.5 text-sm text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors"
                          placeholder="Choose a unique username"
                        />
                        {usernameError && (
                          <p className="text-xs text-red-400 mt-1.5">{usernameError}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-brand-muted-gold">
                            This will be your public identifier. Cannot be changed later.
                          </p>
                          <button
                            onClick={handleSetUsername}
                            disabled={usernameSaving || !newUsername || newUsername.length < 3}
                            className="bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base px-4 py-1.5 rounded-lg font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {usernameSaving ? "Saving..." : "Set Username"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={profile?.username || ""}
                          disabled
                          className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg px-4 py-2.5 text-sm text-brand-offwhite-muted cursor-not-allowed opacity-70"
                        />
                        <p className="text-xs text-brand-offwhite-muted mt-2">
                          Your unique identifier across the platform. Contact support to change it.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="pt-4 border-t border-brand-charcoal-border flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving || (!name && !bio)}
                      className="bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base px-6 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-bold text-brand-offwhite mb-1">Appearance</h2>
                  <p className="text-sm text-brand-offwhite-muted mb-6">
                    Customize the look and feel of the platform.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Dark Mode */}
                  <div className="relative rounded-xl border-2 border-brand-muted-gold bg-brand-charcoal-base p-4 cursor-pointer">
                    <div className="absolute top-2 right-2 text-brand-muted-gold">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="h-24 w-full rounded-lg bg-[#0A0A0A] border border-brand-charcoal-border mb-3 p-3 flex flex-col gap-2">
                      <div className="w-1/2 h-2 rounded bg-brand-charcoal-card border border-brand-charcoal-border"></div>
                      <div className="w-full h-8 rounded bg-[#111] border border-brand-charcoal-border flex items-center px-2 gap-2">
                         <div className="w-2 h-2 rounded-full bg-brand-muted-gold"></div>
                         <div className="w-16 h-1 rounded bg-[#222]"></div>
                      </div>
                    </div>
                    <div className="font-bold text-sm text-brand-offwhite">Midnight Dark</div>
                    <div className="text-xs text-brand-offwhite-muted mt-1">Default dark theme with gold accents</div>
                  </div>

                  {/* Light Mode (Coming Soon) */}
                  <div className="relative rounded-xl border border-brand-charcoal-border bg-brand-charcoal-base/50 p-4 opacity-50 cursor-not-allowed">
                    <div className="absolute top-2 right-2 text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted bg-brand-charcoal-hover px-2 py-0.5 rounded">
                      Soon
                    </div>
                    <div className="h-24 w-full rounded-lg bg-white border border-gray-200 mb-3 p-3 flex flex-col gap-2">
                      <div className="w-1/2 h-2 rounded bg-gray-100 border border-gray-200"></div>
                      <div className="w-full h-8 rounded bg-gray-50 border border-gray-200 flex items-center px-2 gap-2">
                         <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                         <div className="w-16 h-1 rounded bg-gray-200"></div>
                      </div>
                    </div>
                    <div className="font-bold text-sm text-brand-offwhite">Clean Light</div>
                    <div className="text-xs text-brand-offwhite-muted mt-1">High contrast light theme</div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-bold text-brand-offwhite mb-1">Notifications</h2>
                  <p className="text-sm text-brand-offwhite-muted mb-6">
                    Recent activity and updates about your account.
                  </p>
                </div>

                <div className="space-y-3">
                  {notifLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-6 h-6 rounded-full border-2 border-brand-muted-gold border-t-transparent animate-spin" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Bell size={32} className="text-brand-offwhite-muted/40 mb-3" />
                      <p className="text-sm text-brand-offwhite-muted font-medium">No recent notifications</p>
                      <p className="text-xs text-brand-offwhite-muted/60 mt-1">
                        When an admin reviews your contributions or you earn achievements, they'll appear here.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-brand-offwhite-muted font-medium uppercase tracking-wider">
                          Recent activity
                        </span>
                        {notifications.some((n) => !n.is_read) && (
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetchApi("/notifications/read-all", { method: "POST" });
                                if (res.success) {
                                  setNotifications((prev) =>
                                    prev.map((n) => ({ ...n, is_read: true }))
                                  );
                                }
                              } catch {}
                            }}
                            className="text-xs text-brand-muted-gold hover:text-brand-muted-gold/80 font-semibold transition-colors flex items-center gap-1"
                          >
                            <CheckCheck size={14} /> Mark all as read
                          </button>
                        )}
                      </div>
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            "flex items-start gap-3 p-4 rounded-xl border transition-colors",
                            n.is_read
                              ? "border-brand-charcoal-border bg-brand-charcoal-base/50"
                              : "border-brand-muted-gold/20 bg-brand-muted-gold/5"
                          )}
                        >
                          <div className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg",
                            n.type === "contribution_approved"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : n.type === "contribution_rejected"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-brand-muted-gold/10 text-brand-muted-gold"
                          )}>
                            {n.type === "contribution_approved" ? (
                              <CheckCircle2 size={16} />
                            ) : n.type === "contribution_rejected" ? (
                              <XCircle size={16} />
                            ) : (
                              <GitPullRequest size={16} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={cn(
                              "text-sm leading-relaxed",
                              n.is_read ? "text-brand-offwhite-muted" : "text-brand-offwhite"
                            )}>
                              {n.message}
                            </p>
                            <span className="text-xs text-brand-offwhite-muted/60 mt-1.5 block">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          {!n.is_read && (
                            <div className="w-2 h-2 rounded-full bg-brand-muted-gold shrink-0 mt-2" />
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-bold text-brand-offwhite mb-1">Security</h2>
                  <p className="text-sm text-brand-offwhite-muted mb-6">
                    Manage your account security and authentication.
                  </p>
                </div>

                <div className="bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="text-brand-muted-gold" size={20} />
                    <h3 className="font-bold text-sm text-brand-offwhite">Password</h3>
                  </div>
                  <p className="text-sm text-brand-offwhite-muted mb-4">
                    Change your password using your 6-digit recovery PIN.
                  </p>
                  <button
                    onClick={() => { setChangePasswordOpen(true); setCpStep('pin'); setCpPin(''); setCpNewPassword(''); setCpConfirmPassword(''); setCpNewPin(''); setCpConfirmNewPin(''); setCpError(''); }}
                    className="bg-brand-charcoal-hover border border-brand-charcoal-border hover:bg-brand-charcoal-panel hover:border-brand-muted-gold/50 text-brand-offwhite px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                  >
                    Change Password
                  </button>
                </div>

                <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                  <DialogContent className="sm:max-w-md bg-brand-charcoal-card border-brand-charcoal-border">
                    <DialogHeader>
                      <DialogTitle className="text-brand-offwhite text-lg flex items-center gap-2">
                        <Shield size={18} className="text-brand-muted-gold" />
                        {cpStep === 'pin' ? 'Verify your PIN' : cpStep === 'set-pin' ? 'Set up recovery PIN' : cpStep === 'password' ? 'Set new password' : 'Password changed'}
                        {(cpStep === 'pin' || cpStep === 'set-pin') && (
                          <button
                            type="button"
                            onClick={() => setCpShowPin((p) => !p)}
                            className="ml-auto p-1.5 rounded-lg text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-border transition-colors"
                            aria-label={cpShowPin ? 'Hide PIN' : 'Show PIN'}
                          >
                            {cpShowPin ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        )}
                      </DialogTitle>
                      <DialogDescription className="text-brand-offwhite-muted text-sm">
                        {cpStep === 'pin'
                          ? 'Enter your 6-digit recovery PIN to proceed.'
                          : cpStep === 'set-pin'
                          ? 'Create a 6-digit PIN for account recovery and password changes.'
                          : cpStep === 'password'
                          ? 'Choose a new password for your account.'
                          : 'Your password has been updated.'}
                      </DialogDescription>
                    </DialogHeader>

                    {cpStep === 'pin' && (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!/^\d{6}$/.test(cpPin)) {
                          setCpError('PIN must be exactly 6 digits');
                          return;
                        }
                        setCpLoading(true);
                        setCpError('');
                        try {
                          const res = await verifyPin(cpPin);
                          if (res.success) {
                            setCpStep('password');
                          } else if (res.error?.code === 'PIN_MISMATCH') {
                            setCpError('Incorrect PIN. Please try again.');
                          } else if (res.error?.code === 'PIN_NOT_SET') {
                            setCpStep('set-pin');
                            setCpError('');
                          } else {
                            setCpError(res.error?.message || 'PIN verification failed');
                          }
                        } catch {
                          setCpError('Unable to connect. Please try again.');
                        } finally {
                          setCpLoading(false);
                        }
                      }} className="space-y-5">
                        {cpError && (
                          <div role="alert" className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm">
                            {cpError}
                          </div>
                        )}
                        <div className="flex justify-center py-4">
                          <PinInput size="lg" mask={!cpShowPin}>
                            <PinInput.Group
                              maxLength={6}
                              pattern={REGEXP_ONLY_DIGITS}
                              value={cpPin}
                              onChange={(v) => { setCpPin(v); if (cpError) setCpError(''); }}
                              onComplete={(v) => {
                                setCpPin(v);
                                cpPinSubmitRef.current?.click();
                              }}
                              autoFocus
                              hasError={cpError.includes('Incorrect PIN')}
                            >
                              <PinInput.Slot index={0} />
                              <PinInput.Slot index={1} />
                              <PinInput.Slot index={2} />
                              <PinInput.Separator />
                              <PinInput.Slot index={3} />
                              <PinInput.Slot index={4} />
                              <PinInput.Slot index={5} />
                            </PinInput.Group>
                          </PinInput>
                        </div>
                        <button
                          ref={cpPinSubmitRef}
                          type="submit"
                          disabled={cpPin.length !== 6 || cpLoading}
                          className="w-full bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base h-11 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {cpLoading ? (
                            <div className="w-4 h-4 border-2 border-brand-charcoal-base/30 border-t-brand-charcoal-base rounded-full animate-spin" />
                          ) : (
                            'Continue'
                          )}
                        </button>
                      </form>
                    )}

                    {cpStep === 'set-pin' && (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!/^\d{6}$/.test(cpNewPin)) {
                          setCpError('PIN must be exactly 6 digits');
                          return;
                        }
                        if (cpNewPin !== cpConfirmNewPin) {
                          setCpError('PINs do not match');
                          return;
                        }
                        setCpLoading(true);
                        setCpError('');
                        try {
                          const res = await setPin(cpNewPin, cpConfirmNewPin);
                          if (res.success) {
                            setCpPin(cpNewPin);
                            setCpStep('password');
                          } else {
                            setCpError(res.error?.message || 'Failed to set PIN');
                          }
                        } catch {
                          setCpError('Unable to connect. Please try again.');
                        } finally {
                          setCpLoading(false);
                        }
                      }} className="space-y-4">
                        {cpError && (
                          <div role="alert" className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm">
                            {cpError}
                          </div>
                        )}
                        <div className="bg-brand-muted-gold/5 border border-brand-muted-gold/20 rounded-xl px-4 py-3">
                          <p className="text-xs text-brand-offwhite-muted">
                            No recovery PIN is set on your account. Create a 6-digit PIN to enable password changes and account recovery.
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted mb-2">
                            New recovery PIN
                          </label>
                          <PinInput size="lg" mask={!cpShowPin}>
                            <PinInput.Group
                              maxLength={6}
                              pattern={REGEXP_ONLY_DIGITS}
                              value={cpNewPin}
                              onChange={(v) => { setCpNewPin(v); setCpError(''); }}
                              autoFocus
                              hasError={!!cpError}
                            >
                              <PinInput.Slot index={0} />
                              <PinInput.Slot index={1} />
                              <PinInput.Slot index={2} />
                              <PinInput.Separator />
                              <PinInput.Slot index={3} />
                              <PinInput.Slot index={4} />
                              <PinInput.Slot index={5} />
                            </PinInput.Group>
                          </PinInput>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted mb-2">
                            Confirm recovery PIN
                          </label>
                          <PinInput size="lg" mask={!cpShowPin}>
                            <PinInput.Group
                              maxLength={6}
                              pattern={REGEXP_ONLY_DIGITS}
                              value={cpConfirmNewPin}
                              onChange={(v) => { setCpConfirmNewPin(v); setCpError(''); }}
                              hasError={!!cpError}
                            >
                              <PinInput.Slot index={0} />
                              <PinInput.Slot index={1} />
                              <PinInput.Slot index={2} />
                              <PinInput.Separator />
                              <PinInput.Slot index={3} />
                              <PinInput.Slot index={4} />
                              <PinInput.Slot index={5} />
                            </PinInput.Group>
                          </PinInput>
                        </div>
                        <button
                          type="submit"
                          disabled={cpNewPin.length !== 6 || cpConfirmNewPin.length !== 6 || cpLoading}
                          className="w-full bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base h-11 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {cpLoading ? (
                            <div className="w-4 h-4 border-2 border-brand-charcoal-base/30 border-t-brand-charcoal-base rounded-full animate-spin" />
                          ) : (
                            'Set PIN & continue'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setCpStep('pin'); setCpError(''); }}
                          className="w-full text-sm text-brand-offwhite-muted hover:text-brand-offwhite transition-colors"
                        >
                          Go back
                        </button>
                      </form>
                    )}

                    {cpStep === 'password' && (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (cpNewPassword.length < 6) {
                          setCpError('Password must be at least 6 characters');
                          return;
                        }
                        if (cpNewPassword !== cpConfirmPassword) {
                          setCpError('Passwords do not match');
                          return;
                        }
                        setCpLoading(true);
                        setCpError('');
                        try {
                          const res = await changePassword(cpPin, cpNewPassword);
                          if (res.success) {
                            setCpStep('done');
                          } else {
                            setCpError(res.error?.message || 'Failed to change password');
                          }
                        } catch {
                          setCpError('Unable to connect. Please try again.');
                        } finally {
                          setCpLoading(false);
                        }
                      }} className="space-y-4">
                        {cpError && (
                          <div role="alert" className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm">
                            {cpError}
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted mb-2">
                            New password
                          </label>
                          <input
                            type="password"
                            value={cpNewPassword}
                            onChange={(e) => setCpNewPassword(e.target.value)}
                            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus:border-brand-muted-gold focus:outline-none h-11 rounded-xl px-4 text-sm transition-colors"
                            placeholder="At least 6 characters"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted mb-2">
                            Confirm new password
                          </label>
                          <input
                            type="password"
                            value={cpConfirmPassword}
                            onChange={(e) => setCpConfirmPassword(e.target.value)}
                            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus:border-brand-muted-gold focus:outline-none h-11 rounded-xl px-4 text-sm transition-colors"
                            placeholder="Re-enter your password"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={cpLoading}
                          className="w-full bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base h-11 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {cpLoading ? (
                            <div className="w-4 h-4 border-2 border-brand-charcoal-base/30 border-t-brand-charcoal-base rounded-full animate-spin" />
                          ) : (
                            'Change password'
                          )}
                        </button>
                      </form>
                    )}

                    {cpStep === 'done' && (
                      <div className="text-center py-6 space-y-4">
                        <div className="mx-auto w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle2 size={28} className="text-green-400" />
                        </div>
                        <p className="text-sm text-brand-offwhite-muted">
                          Your password has been updated successfully.
                        </p>
                        <button
                          onClick={() => setChangePasswordOpen(false)}
                          className="bg-brand-charcoal-hover hover:bg-brand-charcoal-panel border border-brand-charcoal-border text-brand-offwhite px-6 py-2 rounded-xl font-bold text-sm transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>



                <div className="bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Chrome className="text-brand-muted-gold" size={20} />
                    <h3 className="font-bold text-sm text-brand-offwhite">Google Account</h3>
                  </div>
                  {user?.google_linked ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 size={18} />
                      <span className="text-sm font-semibold">Account linked</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-brand-offwhite-muted mb-4">
                        Link your Google account for seamless sign-in. You will still be able to sign in with your password.
                      </p>
                      <button
                        onClick={() => prompt()}
                        disabled={linkingGoogle}
                        className="bg-brand-charcoal-hover border border-brand-charcoal-border hover:border-brand-muted-gold/50 hover:bg-brand-charcoal-panel text-brand-offwhite px-4 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {linkingGoogle ? (
                          <><div className="w-4 h-4 border-2 border-brand-muted-gold/30 border-t-brand-muted-gold rounded-full animate-spin" /> Linking...</>
                        ) : (
                          <><Chrome size={16} /> Link Google Account</>
                        )}
                      </button>
                    </>
                  )}
                </div>

                <div className="bg-brand-error/5 border border-brand-error/20 rounded-xl p-5">
                  <h3 className="font-bold text-sm text-brand-error mb-2">Danger Zone</h3>
                  <p className="text-sm text-brand-error/80 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  {confirmDelete ? (
                    <div className="flex flex-col gap-3">
                      <p className="text-xs text-brand-error/70">
                        All your submissions, progress, and account data will be permanently removed. Are you sure?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="bg-brand-error hover:bg-brand-error/80 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {deleting ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
                          ) : (
                            "Yes, delete my account"
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          disabled={deleting}
                          className="bg-brand-charcoal-hover border border-brand-charcoal-border text-brand-offwhite px-4 py-2 rounded-lg font-bold text-sm transition-colors hover:bg-brand-charcoal-panel disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="bg-brand-error/10 border border-brand-error/30 hover:bg-brand-error/20 text-brand-error px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                    >
                      Delete Account
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-charcoal-base flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-muted-gold border-t-transparent animate-spin"></div>
      </div>
    }>
      <SettingsPageContent />
    </Suspense>
  );
}
