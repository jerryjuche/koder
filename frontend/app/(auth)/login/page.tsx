'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Loader2 } from 'lucide-react';
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
  const [errorMsg, setErrorMsg] = useState('');
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const { renderButton, ready } = useGoogleOneTap(
    useCallback((response: { credential: string }) => {
      handleGoogleResponse(response);
    }, []),
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && ready && googleButtonRef.current) {
      renderButton(googleButtonRef.current, { width: 350 });
    }
  }, [mounted, ready]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { loginId: '', password: '' },
  });

  const handleGoogleResponse = async (response: { credential: string }) => {
    setLoading(true);
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
      setLoading(false);
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
            <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>
      </form>

      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
        <>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-charcoal-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-brand-charcoal-card px-2 text-brand-offwhite-muted">or</span>
            </div>
          </div>

          <div className="w-full min-h-[45px]">
            {mounted && ready ? (
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
