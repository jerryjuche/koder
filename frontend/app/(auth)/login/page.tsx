'use client';

import React, { useCallback, useState } from 'react';
import { useHasMounted } from '@/hooks/use-has-mounted';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Mail, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { login, googleLogin } from '@/lib/api';
import { useGoogleOneTap } from '@/hooks/use-google-one-tap';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleButton } from '@/components/auth/google-button';
import { AuthDivider } from '@/components/auth/auth-divider';
import { LabelInputContainer } from '@/components/auth/label-input-container';
import { BottomGradient } from '@/components/auth/bottom-gradient';

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
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      const res = await googleLogin(response.credential);
      if (res.success && res.data) {
        router.push(res.data.onboarding ? '/onboarding' : '/');
      } else if (res.error?.code === 'GOOGLE_NOT_LINKED') {
        setErrorMsg('This Google account is not linked to any Koder profile. Please sign in with your password below, then link Google in your Settings.');
      } else {
        setErrorMsg(res.error?.message || 'Google sign-in failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }, [router]);

  const { prompt, ready } = useGoogleOneTap(
    useCallback((response: { credential: string }) => {
      handleGoogleResponse(response);
    }, [handleGoogleResponse]),
  );

  const mounted = useHasMounted();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { loginId: '', password: '' },
  });

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await login({ login: data.loginId, password: data.password });
      if (res.success && res.data) {
        router.push(res.data.onboarding ? '/onboarding' : '/');
      } else {
        setErrorMsg(res.error?.message || 'Login failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (ready) prompt();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-3xl p-8 shadow-2xl shadow-input"
    >
      <div className="flex flex-col items-center text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Image
            src="/logo.png"
            alt="Koder"
            width={72}
            height={72}
            priority
            className="object-contain drop-shadow-lg mb-5"
          />
        </motion.div>
        <h1 className="text-2xl font-bold text-brand-offwhite mb-1.5">Welcome back</h1>
        <p className="text-brand-offwhite-muted text-sm max-w-xs mx-auto">
          Sign in to your account to continue solving problems.
        </p>
      </div>

      <div className="space-y-6">
        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <GoogleButton
              onClick={handleGoogleClick}
              loading={googleLoading}
              disabled={!mounted || !ready}
            />
          </motion.div>
        )}

        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <AuthDivider text="or sign in with email" />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                role="alert" className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm overflow-hidden"
              >
                {errorMsg}
              </motion.div>
            )}

            <LabelInputContainer>
              <Label htmlFor="loginId" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
                Username or Email
              </Label>
              <Input
                {...register('loginId')}
                id="loginId"
                type="text"
                autoComplete="username"
                data-invalid={!!errors.loginId}
                className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 data-[invalid=true]:border-brand-error focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4"
                placeholder="username or email"
              />
              {errors.loginId && (
                <p className="text-brand-error text-[11px] mt-1 font-medium">{errors.loginId.message}</p>
              )}
            </LabelInputContainer>

            <LabelInputContainer>
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-[11px] text-brand-muted-gold/50 hover:text-brand-muted-gold transition-colors font-medium">
                   Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  data-invalid={!!errors.password}
                  className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 data-[invalid=true]:border-brand-error focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-brand-error text-[11px] mt-1 font-medium">{errors.password.message}</p>
              )}
            </LabelInputContainer>

            <button
              type="submit"
              disabled={loading}
              className="group/btn relative w-full bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base h-12 rounded-xl font-bold transition-all shadow-lg shadow-brand-muted-gold/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-brand-charcoal-base/30 border-t-brand-charcoal-base rounded-full animate-spin" />
              ) : (
                <>
                  <Mail size={16} />
                  Sign In
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
              <BottomGradient />
            </button>
          </form>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="text-center text-sm text-brand-offwhite-muted mt-7"
      >
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-brand-offwhite font-bold hover:text-brand-muted-gold transition-colors">
          Apply for access
        </Link>
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="mt-6 pt-5 border-t border-brand-charcoal-border/50"
      >
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
      </motion.div>
    </motion.div>
  );
}
