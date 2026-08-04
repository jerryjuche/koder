'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, KeyRound, CheckCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { PinInput } from '@/components/base/input/pin-input';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { motion, AnimatePresence } from 'framer-motion';
import { forgotPassword, forgotPasswordPin, resetPasswordPin } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LabelInputContainer } from '@/components/auth/label-input-container';
import { BottomGradient } from '@/components/auth/bottom-gradient';

type Tab = 'email' | 'pin';

export default function ForgotPasswordPage() {
  const [tab, setTab] = useState<Tab>('pin');

  // PIN reset state
  const [pinLogin, setPinLogin] = useState('');
  const [pin, setPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinToken, setPinToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Email reset state
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handlePinVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinLogin.trim()) {
      setErrorMsg('Enter your username or email');
      return;
    }
    if (!/^\d{6}$/.test(pin)) {
      setErrorMsg('PIN must be exactly 6 digits');
      return;
    }
    setPinLoading(true);
    setErrorMsg('');
    try {
      const res = await forgotPasswordPin(pinLogin.trim(), pin);
      if (res.success && res.data) {
        setPinToken(res.data.token);
        setPinVerified(true);
      } else {
        setErrorMsg(res.error?.message || 'Invalid username/email or PIN');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect. Please try again.');
    } finally {
      setPinLoading(false);
    }
  };

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

  const handlePinReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setPinLoading(true);
    setErrorMsg('');
    try {
      const res = await resetPasswordPin(pinToken, newPassword);
      if (res.success) {
        setPinVerified(false);
        setPinToken('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPinLogin('');
        setPin('');
        setSent(true);
      } else {
        setErrorMsg(res.error?.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect. Please try again.');
    } finally {
      setPinLoading(false);
    }
  };

  const [sent, setSent] = useState(false);
  const [showPin, setShowPin] = useState(false);

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

        {sent ? (
          <>
            <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
            <h1 className="text-2xl font-bold text-brand-offwhite mb-1.5">Password reset</h1>
            <p className="text-brand-offwhite-muted text-sm max-w-xs mx-auto">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 text-sm text-brand-muted-gold/70 hover:text-brand-muted-gold transition-colors font-medium"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </>
        ) : emailSent ? (
          <>
            <Mail className="w-12 h-12 text-brand-muted-gold mb-4" />
            <h1 className="text-2xl font-bold text-brand-offwhite mb-1.5">Check your inbox</h1>
            <p className="text-brand-offwhite-muted text-sm max-w-xs mx-auto">
              If an account exists for <span className="text-brand-offwhite font-semibold">{email}</span>, we&apos;ve sent
              a password reset link. Follow the instructions in the email to set a new password.
            </p>
          </>
        ) : pinVerified ? (
          <>
            <Shield className="w-12 h-12 text-brand-muted-gold mb-4" />
            <h1 className="text-2xl font-bold text-brand-offwhite mb-1.5">Set new password</h1>
            <p className="text-brand-offwhite-muted text-sm max-w-xs mx-auto">
              PIN verified. Choose a new password for your account.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-brand-offwhite">Forgot password?</h1>
              <button
                type="button"
                onClick={() => setShowPin((p) => !p)}
                className="p-1.5 rounded-lg text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-border transition-colors"
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-brand-offwhite-muted text-sm max-w-xs mx-auto">
              Recover your account with your recovery PIN or a reset link sent by email.
            </p>
          </>
        )}
      </div>

      {!sent && !emailSent && !pinVerified && (
        <>
          <div className="flex bg-brand-charcoal-base rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setTab('pin'); setErrorMsg(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                tab === 'pin'
                  ? 'bg-brand-muted-gold text-brand-charcoal-base shadow-lg shadow-brand-muted-gold/20'
                  : 'text-brand-offwhite-muted hover:text-brand-offwhite'
              }`}
            >
              <KeyRound size={14} />
              Recovery PIN
            </button>
            <button
              type="button"
              onClick={() => { setTab('email'); setErrorMsg(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                tab === 'email'
                  ? 'bg-brand-muted-gold text-brand-charcoal-base shadow-lg shadow-brand-muted-gold/20'
                  : 'text-brand-offwhite-muted hover:text-brand-offwhite'
              }`}
            >
              <Mail size={14} />
              Email Reset
            </button>
          </div>

          {tab === 'email' && (
            <motion.form
              key="email-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
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

          <AnimatePresence mode="wait">
            {tab === 'pin' && (
              <motion.form
                key="pin-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handlePinVerify}
                noValidate
                className="space-y-5"
              >
                {errorMsg && (
                  <div role="alert" className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm">
                    {errorMsg}
                  </div>
                )}

                <LabelInputContainer>
                  <Label htmlFor="pin-login" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
                    Username or email
                  </Label>
                  <Input
                    id="pin-login"
                    type="text"
                    value={pinLogin}
                    onChange={(e) => setPinLogin(e.target.value)}
                    autoComplete="username"
                    className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4"
                    placeholder="username or you@example.com"
                  />
                </LabelInputContainer>

                <PinInput size="md" mask={!showPin}>
                  <PinInput.Label>6-digit recovery PIN</PinInput.Label>
                  <PinInput.Group
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={pin}
                    onChange={(v) => { setPin(v); if (errorMsg) setErrorMsg(''); }}
                    autoFocus
                    hasError={!!errorMsg}
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

                <button
                  type="submit"
                  disabled={pinLoading}
                  className="group/btn relative w-full bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base h-12 rounded-xl font-bold transition-all shadow-lg shadow-brand-muted-gold/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                >
                  {pinLoading ? (
                    <div className="w-5 h-5 border-2 border-brand-charcoal-base/30 border-t-brand-charcoal-base rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound size={16} />
                      Verify PIN
                    </>
                  )}
                  <BottomGradient />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </>
      )}

      {pinVerified && !sent && (
        <form onSubmit={handlePinReset} noValidate className="space-y-5">
          {errorMsg && (
            <div role="alert" className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm">
              {errorMsg}
            </div>
          )}

          <LabelInputContainer>
            <Label htmlFor="new-password" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
              New password
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4"
              placeholder="At least 8 characters"
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label htmlFor="confirm-new-password" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
              Confirm new password
            </Label>
            <Input
              id="confirm-new-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              autoComplete="new-password"
              className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4"
              placeholder="Re-enter your password"
            />
          </LabelInputContainer>

          <button
            type="submit"
            disabled={pinLoading}
            className="group/btn relative w-full bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base h-12 rounded-xl font-bold transition-all shadow-lg shadow-brand-muted-gold/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          >
            {pinLoading ? (
              <div className="w-5 h-5 border-2 border-brand-charcoal-base/30 border-t-brand-charcoal-base rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle size={16} />
                Reset password
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
