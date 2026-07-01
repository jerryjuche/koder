"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { User, Settings as SettingsIcon, Bell, Shield, Code, Palette, LogOut, CheckCircle2, Chrome } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchUserProfile, updateUserProfile, linkGoogle, deleteAccount } from "@/lib/api";
import { UserProfile } from "@/lib/types";
import { toast } from "@/lib/toast";
import { useGoogleOneTap } from "@/hooks/use-google-one-tap";

type Tab = "profile" | "editor" | "appearance" | "notifications" | "security";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  // Preferences states (local storage)
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState("14");
  const [autoSave, setAutoSave] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  // Google linking
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  // Delete account
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const gisRef = useRef<HTMLDivElement>(null);

  const { renderButton, ready } = useGoogleOneTap(
    useCallback(async (response: { credential: string }) => {
      setLinkingGoogle(true);
      try {
        const res = await linkGoogle(response.credential);
        if (res.success) {
          if (res.data?.token) {
            localStorage.setItem("token", res.data.token);
          }
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
        toast.error({ title: "Link failed", description: "Network error while linking." });
      } finally {
        setLinkingGoogle(false);
      }
    }, []),
  );

  useEffect(() => {
    if (ready && gisRef.current) {
      renderButton(gisRef.current);
    }
  }, [ready, renderButton]);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const res = await fetchUserProfile();
        if (!mounted) return;
        if (res.success && res.data) {
          setProfile(res.data);
          setName(res.data.name || "");
          setBio((res.data as any).bio || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadProfile();

    // Load local preferences
    setTheme(localStorage.getItem("koder_theme") || "vs-dark");
    setFontSize(localStorage.getItem("koder_font_size") || "14");
    setAutoSave(localStorage.getItem("koder_auto_save") !== "false");

    return () => {
      mounted = false;
    };
  }, []);

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

  const handleSavePreferences = () => {
    localStorage.setItem("koder_theme", theme);
    localStorage.setItem("koder_font_size", fontSize);
    localStorage.setItem("koder_auto_save", autoSave ? "true" : "false");
    toast.success({
      title: "Preferences saved",
      description: "Your editor preferences have been updated.",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteAccount();
      if (res.success) {
        localStorage.removeItem("token");
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
    { id: "profile", label: "Profile", icon: User },
    { id: "editor", label: "Editor", icon: Code },
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
                    <input
                      type="text"
                      value={profile?.username || ""}
                      disabled
                      className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg px-4 py-2.5 text-sm text-brand-offwhite-muted cursor-not-allowed opacity-70"
                    />
                    <p className="text-xs text-brand-offwhite-muted mt-2">
                      Your unique identifier across the platform. Contact support to change it.
                    </p>
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

            {/* Editor Tab */}
            {activeTab === "editor" && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="text-xl font-bold text-brand-offwhite mb-1">Editor Preferences</h2>
                  <p className="text-sm text-brand-offwhite-muted mb-6">
                    Customize your coding experience in the workspace.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-brand-offwhite-muted uppercase tracking-wider mb-2">
                      Font Size
                    </label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="w-full sm:w-64 appearance-none bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg px-4 py-2.5 text-sm text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors"
                    >
                      <option value="12">12px (Small)</option>
                      <option value="14">14px (Medium)</option>
                      <option value="16">16px (Large)</option>
                      <option value="18">18px (Extra Large)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-offwhite-muted uppercase tracking-wider mb-2">
                      Theme
                    </label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-full sm:w-64 appearance-none bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg px-4 py-2.5 text-sm text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors"
                    >
                      <option value="vs-dark">VS Dark (Default)</option>
                      <option value="hc-black">High Contrast Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-b border-brand-charcoal-border">
                    <div>
                      <div className="font-bold text-sm text-brand-offwhite mb-1">Auto-Save</div>
                      <div className="text-xs text-brand-offwhite-muted">Automatically save your code locally while typing</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />
                      <div className="w-11 h-6 bg-brand-charcoal-base border border-brand-charcoal-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-offwhite after:border-brand-charcoal-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-muted-gold"></div>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleSavePreferences}
                      className="bg-brand-charcoal-hover border border-brand-charcoal-border hover:border-brand-muted-gold/50 hover:bg-brand-charcoal-panel text-brand-offwhite px-6 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                    >
                      Save Preferences
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
                    Manage how we communicate with you.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-brand-charcoal-border bg-brand-charcoal-base">
                    <div>
                      <div className="font-bold text-sm text-brand-offwhite mb-1">Email Notifications</div>
                      <div className="text-xs text-brand-offwhite-muted">Receive summaries of your weekly progress</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} />
                      <div className="w-11 h-6 bg-brand-charcoal-card border border-brand-charcoal-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-offwhite after:border-brand-charcoal-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-muted-gold"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-brand-charcoal-border bg-brand-charcoal-base">
                    <div>
                      <div className="font-bold text-sm text-brand-offwhite mb-1">In-App Notifications</div>
                      <div className="text-xs text-brand-offwhite-muted">Receive alerts for new problems and achievements</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={pushNotifs} onChange={(e) => setPushNotifs(e.target.checked)} />
                      <div className="w-11 h-6 bg-brand-charcoal-card border border-brand-charcoal-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-offwhite after:border-brand-charcoal-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-muted-gold"></div>
                    </label>
                  </div>
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
                    You can change your password by clicking the button below. You will be prompted to enter your current password.
                  </p>
                  <button className="bg-brand-charcoal-hover border border-brand-charcoal-border hover:bg-brand-charcoal-panel text-brand-offwhite px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                    Change Password
                  </button>
                </div>



                <div className="bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Chrome className="text-brand-muted-gold" size={20} />
                    <h3 className="font-bold text-sm text-brand-offwhite">Google Account</h3>
                  </div>
                  <p className="text-sm text-brand-offwhite-muted mb-4">
                    Link your Google account for seamless sign-in. You will still be able to sign in with your password.
                  </p>
                  {ready ? (
                    <div ref={gisRef} className="[&>div]:w-full min-h-[40px]" />
                  ) : (
                    <button
                      disabled
                      className="bg-brand-charcoal-hover border border-brand-charcoal-border text-brand-offwhite px-4 py-2 rounded-lg font-bold text-sm opacity-50 cursor-not-allowed flex items-center gap-2"
                    >
                      <Chrome size={16} /> Link Google Account
                    </button>
                  )}
                  <div className="hidden" />
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
