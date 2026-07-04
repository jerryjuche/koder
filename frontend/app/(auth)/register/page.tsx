'use client';

import React, { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { register as registerUser, googleLogin } from '@/lib/api';
import { useGoogleOneTap } from '@/hooks/use-google-one-tap';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleButton } from '@/components/auth/google-button';
import { AuthDivider } from '@/components/auth/auth-divider';
import { LabelInputContainer } from '@/components/auth/label-input-container';
import { BottomGradient } from '@/components/auth/bottom-gradient';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  agreeTerms: z.boolean().refine((val) => val, 'You must agree to the Terms of Service'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
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
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      agreeTerms: false,
    },
  });

  const handleGoogleResponse = async (response: { credential: string }) => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      const res = await googleLogin(response.credential);
      if (res.success && res.data) {
        router.push(res.data.onboarding ? '/onboarding' : '/');
      } else {
        setErrorMsg(res.error?.message || 'Google sign-in failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await registerUser({
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
      });
      if (res.success && res.data) {
        router.push(res.data.onboarding ? '/onboarding' : '/');
      } else {
        setErrorMsg(res.error?.message || 'Registration failed');
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
        <h1 className="text-2xl font-bold text-brand-offwhite mb-1.5">Create your account</h1>
        <p className="text-brand-offwhite-muted text-sm max-w-xs mx-auto">
          Join Koder and start solving problems.
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
            <AuthDivider text="or sign up with email" />
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
                className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm overflow-hidden"
              >
                {errorMsg}
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <LabelInputContainer>
                <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
                  First Name
                </Label>
                <Input
                  {...register('firstName')}
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  data-invalid={!!errors.firstName}
                  className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 data-[invalid=true]:border-brand-error focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4"
                  placeholder="Ada"
                />
                {errors.firstName && (
                  <p className="text-brand-error text-[11px] mt-1 font-medium">{errors.firstName.message}</p>
                )}
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
                  Last Name
                </Label>
                <Input
                  {...register('lastName')}
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  data-invalid={!!errors.lastName}
                  className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 data-[invalid=true]:border-brand-error focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4"
                  placeholder="Lovelace"
                />
                {errors.lastName && (
                  <p className="text-brand-error text-[11px] mt-1 font-medium">{errors.lastName.message}</p>
                )}
              </LabelInputContainer>
            </div>

            <LabelInputContainer>
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
                Email Address
              </Label>
              <Input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                data-invalid={!!errors.email}
                className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 data-[invalid=true]:border-brand-error focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4"
                placeholder="student@university.edu"
              />
              {errors.email && (
                <p className="text-brand-error text-[11px] mt-1 font-medium">{errors.email.message}</p>
              )}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="reg-password" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
                Password
              </Label>
              <Input
                {...register('password')}
                id="reg-password"
                type="password"
                autoComplete="new-password"
                data-invalid={!!errors.password}
                className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 data-[invalid=true]:border-brand-error focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4"
                placeholder="Create a strong password"
              />
              {errors.password && (
                <p className="text-brand-error text-[11px] mt-1 font-medium">{errors.password.message}</p>
              )}
            </LabelInputContainer>

            <div className="flex items-start gap-3 pt-1">
              <input
                {...register('agreeTerms')}
                id="agree-terms"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-brand-charcoal-border bg-brand-charcoal-base text-brand-muted-gold focus:ring-brand-muted-gold focus:ring-offset-0"
              />
              <Label htmlFor="agree-terms" className="text-xs text-brand-offwhite-muted leading-relaxed select-none font-normal">
                I agree to the{' '}
                <Link href="/terms" className="text-brand-muted-gold hover:underline font-medium">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-brand-muted-gold hover:underline font-medium">Privacy Policy</Link>
              </Label>
            </div>
            {errors.agreeTerms && (
              <p className="text-brand-error text-[11px] -mt-2 font-medium">{errors.agreeTerms.message}</p>
            )}

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
                  Create Account
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
        Already have an account?{' '}
        <Link href="/login" className="text-brand-offwhite font-bold hover:text-brand-muted-gold transition-colors">
          Sign In
        </Link>
      </motion.p>
    </motion.div>
  );
}
