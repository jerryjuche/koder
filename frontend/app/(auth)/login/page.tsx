'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Loader2, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { login, googleLogin } from '@/lib/api';
import { useGoogleOneTap } from '@/hooks/use-google-one-tap';

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

const loginSchema = z.object({
  loginId: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { prompt, ready } = useGoogleOneTap(
    useCallback((response: { credential: string }) => {
      handleGoogleResponse(response);
    }, []),
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { loginId: '', password: '' },
  });

  const handleGoogleResponse = async (response: { credential: string }) => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      const res = await googleLogin(response.credential);
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        router.push(res.data.onboarding ? '/onboarding' : '/');
      } else if (res.error?.code === 'GOOGLE_NOT_LINKED') {
        setErrorMsg('This Google account is not linked to any Koder profile. Please sign in with your password below, then link Google in your Settings.');
      } else {
        setErrorMsg(res.error?.message || 'Google sign-in failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await login({ login: data.loginId, password: data.password });
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

  const handleGoogleClick = () => {
    if (ready) prompt();
  };

  return (
    <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-3xl p-7 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-center mb-4">
        <Image
          src="/logo.png"
          alt="Koder"
          width={72}
          height={72}
          priority
          className="object-contain drop-shadow-lg"
        />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-brand-offwhite mb-1">Welcome back</h1>
        <p className="text-brand-offwhite-muted text-sm">Sign in to your account to continue solving problems.</p>
      </div>

      <div className="space-y-6">
        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <>
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={!mounted || !ready || googleLoading}
              className="group relative w-full flex items-center justify-center gap-3 bg-[#1C1C28] hover:bg-[#252535] border border-[#2A2A3A] hover:border-brand-muted-gold/30 rounded-xl px-4 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-brand-offwhite-muted/30 border-t-brand-offwhite-muted rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 48 48" className="flex-shrink-0">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                  <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                </svg>
              )}
              <span className="text-[15px] font-medium text-brand-offwhite group-hover:text-white transition-colors">
                Continue with Google
              </span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-charcoal-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-brand-charcoal-card px-3 text-brand-offwhite-muted/60 tracking-wider font-medium">
                  or sign in with email
                </span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {errorMsg && (
            <div className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm">
              {errorMsg}
            </div>
          )}

          <div>
            <label htmlFor="loginId" className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted mb-2">
              Username or Email
            </label>
            <input
              {...register('loginId')}
              id="loginId"
              type="text"
              autoComplete="username"
              data-invalid={!!errors.loginId}
              className="w-full bg-brand-charcoal-base border rounded-xl px-4 py-3 text-brand-offwhite outline-none transition-colors placeholder:text-brand-offwhite-muted/40 data-[invalid=true]:border-brand-error focus:border-brand-muted-gold"
              style={{ borderColor: errors.loginId ? 'rgb(239 68 68 / 0.5)' : undefined }}
              placeholder="username or email"
            />
            {errors.loginId && (
              <p className="text-brand-error text-[11px] mt-1.5 font-medium">{errors.loginId.message}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
                Password
              </label>
              <Link href="#" className="text-xs text-brand-muted-gold/60 hover:text-brand-muted-gold transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              {...register('password')}
              id="password"
              type="password"
              autoComplete="current-password"
              data-invalid={!!errors.password}
              className="w-full bg-brand-charcoal-base border rounded-xl px-4 py-3 text-brand-offwhite outline-none transition-colors placeholder:text-brand-offwhite-muted/40 data-[invalid=true]:border-brand-error focus:border-brand-muted-gold"
              style={{ borderColor: errors.password ? 'rgb(239 68 68 / 0.5)' : undefined }}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-brand-error text-[11px] mt-1.5 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-muted-gold/20 flex justify-center items-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-brand-charcoal-base/30 border-t-brand-charcoal-base rounded-full animate-spin" />
            ) : (
              <><Mail size={16} /> Sign In with Email <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-brand-offwhite-muted mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-brand-offwhite font-bold hover:text-brand-muted-gold transition-colors">
          Apply for access
        </Link>
      </p>

      <div className="mt-5 pt-4 border-t border-brand-charcoal-border/50">
        <p className="text-[11px] text-brand-offwhite-muted/50 text-center leading-relaxed">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-brand-muted-gold/70 hover:text-brand-muted-gold transition-colors font-medium">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-brand-muted-gold/70 hover:text-brand-muted-gold transition-colors font-medium">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
