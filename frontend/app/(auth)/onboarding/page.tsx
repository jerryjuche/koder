'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { completeOnboarding, checkUsername, fetchUser } from '@/lib/api';
import LanguageSelector from '@/components/LanguageSelector';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<'username' | 'language'>('username');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchUser().then((res) => {
      if (res.success && res.data) {
        setUserName(res.data.name);
      }
    });
  }, []);

  useEffect(() => {
    if (username.length < 3) return;
    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await checkUsername(username);
        if (res.success && res.data) {
          setAvailable(res.data.available);
        }
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!available) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await completeOnboarding(username);
      if (res.success && res.data) {
        if ((res.data as any)?.refresh_token) {
          localStorage.setItem("refresh_token", (res.data as any).refresh_token);
        }
        window.dispatchEvent(new Event("user-updated"));
        setStep('language');
      } else {
        setErrorMsg(res.error?.message || 'Failed to set username');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'language') {
    return <LanguageSelector />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-3xl p-8 shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-center mb-6">
          <div className="bg-brand-muted-gold p-2 rounded-xl text-brand-charcoal-base shadow-lg shadow-brand-muted-gold/20">
            <Code2 size={32} className="stroke-[2.5]" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-offwhite mb-2">
            {userName ? `Welcome, ${userName}!` : 'Complete Your Account'}
          </h1>
          <p className="text-brand-offwhite-muted text-sm">
            Choose a unique username to complete your account setup. This will be your student identifier across the platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div role="alert" className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                minLength={3}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''));
                  setAvailable(null);
                }}
                className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-4 py-3 text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors pr-10"
                placeholder="your-unique-username"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking && <Loader2 size={18} className="animate-spin text-brand-offwhite-muted" />}
                {!checking && available === true && (
                  <CheckCircle2 size={18} className="text-amber-400" />
                )}
                {!checking && available === false && (
                  <XCircle size={18} className="text-red-400" />
                )}
              </div>
            </div>
            {username.length >= 3 && !checking && available === true && (
              <p className="text-xs text-amber-400 mt-1">Username available</p>
            )}
            {username.length >= 3 && !checking && available === false && (
              <p className="text-xs text-red-400 mt-1">Username already taken</p>
            )}
            {username.length > 0 && username.length < 3 && (
              <p className="text-xs text-brand-offwhite-muted mt-1">At least 3 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !available}
            className="w-full bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-muted-gold/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              'Complete Setup'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-brand-offwhite-muted/50 mt-6">
          Your username will also serve as your student ID and cannot be changed later.
        </p>
      </div>
    </div>
  );
}
