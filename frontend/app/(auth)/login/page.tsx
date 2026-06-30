'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Code2, ArrowRight, Loader2 } from 'lucide-react';
import { login, googleLogin } from '@/lib/api';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            options: { theme: string; size: string; text?: string; width?: string },
          ) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [gisLoaded, setGisLoaded] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const gisInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGisLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (gisLoaded && window.google && googleButtonRef.current && !gisInitialized.current) {
      gisInitialized.current = true;
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: handleGoogleResponse,
        cancel_on_tap_outside: true,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        width: '100%',
      });
    }
  }, [gisLoaded]);

  const handleGoogleResponse = async (response: { credential: string }) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await googleLogin(response.credential);
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        if (res.data.onboarding) {
          router.push('/onboarding');
        } else {
          router.push('/');
        }
      } else {
        setErrorMsg(res.error?.message || 'Google sign-in failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await login({ login: loginId, password });
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        router.push('/');
      } else {
        setErrorMsg(res.error?.message || 'Login failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-center mb-6">
        <div className="bg-brand-muted-gold p-2 rounded-xl text-brand-charcoal-base shadow-lg shadow-brand-muted-gold/20">
          <Code2 size={32} className="stroke-[2.5]" />
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-brand-offwhite mb-2">Welcome back</h1>
        <p className="text-brand-offwhite-muted text-sm">Sign in to ZeroJudge to continue computing.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm">
            {errorMsg}
          </div>
        )}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted mb-2">Username or Email</label>
          <input 
            type="text" 
            required
            value={loginId}
            onChange={e => setLoginId(e.target.value)}
            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-4 py-3 text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors"
            placeholder="username or email"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">Password</label>
            <Link href="#" className="text-xs text-brand-muted-gold hover:text-brand-muted-gold-dark">Forgot password?</Link>
          </div>
          <input 
            type="password" 
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-4 py-3 text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-muted-gold/20 flex justify-center items-center gap-2 group mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-brand-charcoal-base/30 border-t-brand-charcoal-base rounded-full animate-spin" />
          ) : (
            <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>
      </form>

      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-charcoal-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-brand-charcoal-card px-2 text-brand-offwhite-muted">or</span>
            </div>
          </div>

          <div className="w-full min-h-[45px]">
            {gisLoaded ? (
              <div ref={googleButtonRef} className="flex justify-center w-full [&>div]:w-full" />
            ) : (
              <div className="w-full h-[45px] bg-brand-charcoal-base/50 border border-brand-charcoal-border rounded-lg flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin text-brand-offwhite-muted" />
                <span className="text-[11px] text-brand-offwhite-muted/50">Loading Google Sign-In...</span>
              </div>
            )}
          </div>
        </>
      )}

      <p className="text-center text-sm text-brand-offwhite-muted mt-8">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-brand-offwhite font-bold hover:text-brand-muted-gold transition-colors">
          Apply for access
        </Link>
      </p>

      <p className="mt-6 pt-4 border-t border-brand-charcoal-border text-center text-xs text-brand-offwhite-muted/60 leading-relaxed">
        By signing in, you agree to our{' '}
        <Link href="/terms" className="text-brand-muted-gold hover:text-brand-muted-gold-dark transition-colors font-medium">
          Terms of Service
        </Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-brand-muted-gold hover:text-brand-muted-gold-dark transition-colors font-medium">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
