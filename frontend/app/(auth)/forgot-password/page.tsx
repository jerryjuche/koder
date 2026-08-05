'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, RotateCw, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { forgotPassword } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LabelInputContainer } from '@/components/auth/label-input-container';
import { BottomGradient } from '@/components/auth/bottom-gradient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendFeedback, setResendFeedback] = useState<'' | 'sent' | 'error'>('');

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleEmailReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Enter your email address');
      return;
    }
    setEmailLoading(true);
    setErrorMsg('');
    try {
      const res = await forgotPassword(email.trim());
      if (res.success) {
        setEmailSent(true);
      } else {
        setErrorMsg(res.error?.message || 'Unable to send reset email');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || resendCooldown > 0) return;
    setResending(true);
    setResendFeedback('');
    try {
      const res = await forgotPassword(email.trim());
      if (res.success) {
        setResendFeedback('sent');
        setResendCooldown(60);
      } else {
        setResendFeedback('error');
      }
    } catch {
      setResendFeedback('error');
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-3xl p-8 shadow-2xl shadow-input max-w-md mx-auto"
    >
      <div className="flex flex-col items-center text-center mb-6">
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

        {emailSent ? (
          <>
            <Mail className="w-12 h-12 text-brand-muted-gold mb-4" />
            <h1 className="text-2xl font-bold text-brand-offwhite mb-1.5">Check your inbox</h1>
            <p className="text-brand-offwhite-muted text-sm max-w-xs mx-auto">
              If an account exists for <span className="text-brand-offwhite font-semibold">{email}</span>, we&apos;ve sent
              a password reset link. Follow the instructions in the email to set a new password.
            </p>
            <div className="mt-5 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-offwhite-muted hover:text-brand-muted-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCw size={14} className={resending ? 'animate-spin' : ''} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email'}
              </button>
              {resendFeedback === 'sent' && (
                <span className="inline-flex items-center gap-1.5 text-xs text-green-400">
                  <CheckCircle2 size={13} />
                  Another reset link sent to {email}
                </span>
              )}
              {resendFeedback === 'error' && (
                <span className="text-xs text-brand-error">
                  Couldn&apos;t resend. Try again in a moment.
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-brand-offwhite mb-1.5">Forgot password?</h1>
            <p className="text-brand-offwhite-muted text-sm max-w-xs mx-auto">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </>
        )}
      </div>

      {!emailSent && (
        <motion.form
          key="email-form"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleEmailReset}
          noValidate
          className="space-y-5"
        >
          {errorMsg && (
            <div role="alert" className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm">
              {errorMsg}
            </div>
          )}

          <LabelInputContainer>
            <Label htmlFor="reset-email" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
              Email address
            </Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4"
              placeholder="you@example.com"
            />
          </LabelInputContainer>

          <button
            type="submit"
            disabled={emailLoading}
            className="group/btn relative w-full bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base h-12 rounded-xl font-bold transition-all shadow-lg shadow-brand-muted-gold/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          >
            {emailLoading ? (
              <div className="w-5 h-5 border-2 border-brand-charcoal-base/30 border-t-brand-charcoal-base rounded-full animate-spin" />
            ) : (
              <>
                <Mail size={16} />
                Send reset link
              </>
            )}
            <BottomGradient />
          </button>
        </motion.form>
      )}

      {!emailSent && (
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
