'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { forgotPassword } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LabelInputContainer } from '@/components/auth/label-input-container';
import { BottomGradient } from '@/components/auth/bottom-gradient';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await forgotPassword(data.email);
      if (res.success) {
        setSent(true);
      } else {
        setErrorMsg(res.error?.message || 'Something went wrong. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-3xl p-8 shadow-2xl shadow-input max-w-md mx-auto"
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
            width={64}
            height={64}
            priority
            className="object-contain drop-shadow-lg mb-5"
          />
        </motion.div>

        {sent ? (
          <>
            <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
            <h1 className="text-2xl font-bold text-brand-offwhite mb-1.5">Check your email</h1>
            <p className="text-brand-offwhite-muted text-sm max-w-xs mx-auto">
              If an account with that email exists, we&apos;ve sent a password reset link.
              It&apos;s valid for 1 hour.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 text-sm text-brand-muted-gold/70 hover:text-brand-muted-gold transition-colors font-medium"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-brand-offwhite mb-1.5">Forgot password?</h1>
            <p className="text-brand-offwhite-muted text-sm max-w-xs mx-auto">
              No worries. Enter your email and we&apos;ll send you a reset link.
            </p>
          </>
        )}
      </div>

      {!sent && (
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

          <LabelInputContainer>
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
              Email address
            </Label>
            <Input
              {...register('email')}
              id="email"
              type="email"
              autoComplete="email"
              data-invalid={!!errors.email}
              className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 data-[invalid=true]:border-brand-error focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-brand-error text-[11px] mt-1 font-medium">{errors.email.message}</p>
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
                Send reset link
              </>
            )}
            <BottomGradient />
          </button>
        </form>
      )}

      {!sent && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-center text-sm text-brand-offwhite-muted mt-7"
        >
          <Link href="/login" className="inline-flex items-center gap-1.5 text-brand-offwhite font-bold hover:text-brand-muted-gold transition-colors">
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </motion.p>
      )}
    </motion.div>
  );
}
