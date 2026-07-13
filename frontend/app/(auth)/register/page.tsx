'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useHasMounted } from '@/hooks/use-has-mounted';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Mail, ArrowLeft, Shield, CheckCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { register as registerUser, completeOnboarding, googleLogin, checkUsername } from '@/lib/api';
import { useGoogleOneTap } from '@/hooks/use-google-one-tap';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleButton } from '@/components/auth/google-button';
import { AuthDivider } from '@/components/auth/auth-divider';
import { LabelInputContainer } from '@/components/auth/label-input-container';
import { BottomGradient } from '@/components/auth/bottom-gradient';
import { PinInput } from '@/components/base/input/pin-input';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      const res = await googleLogin(response.credential);
      if (res.success && res.data) {
        router.push(res.data.onboarding ? '/onboarding' : '/home');
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

  // Step 1 fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step1Errors, setStep1Errors] = useState<string[]>([]);

  // Step 2 fields
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step2Errors, setStep2Errors] = useState<string[]>([]);

  const [showPin, setShowPin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const pinComplete = /^\d{6}$/.test(pin);
  const confirmComplete = /^\d{6}$/.test(confirmPin);
  const pinsMatch = pin === confirmPin;
  const pinReady = pinComplete && confirmComplete && pinsMatch;

  // Step 3 fields
  const [username, setUsername] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const handleGoogleClick = () => {
    if (ready) prompt();
  };

  const validateStep1 = (): boolean => {
    const errors: string[] = [];
    if (!firstName.trim()) errors.push('First name is required');
    if (!lastName.trim()) errors.push('Last name is required');
    if (!email.trim()) errors.push('Email is required');
    else if (!/\S+@\S+\.\S+/.test(email)) errors.push('Enter a valid email address');
    if (password.length < 8) errors.push('Password must be at least 8 characters');
    if (password !== confirmPassword) errors.push('Passwords do not match');
    setStep1Errors(errors);
    return errors.length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: string[] = [];
    if (!/^\d{6}$/.test(pin)) errors.push('PIN must be exactly 6 digits');
    if (pin !== confirmPin) errors.push('PINs do not match');
    setStep2Errors(errors);
    return errors.length === 0;
  };

  // Check username availability with debounce
  useEffect(() => {
    if (username.length < 3) return;
    const timer = setTimeout(async () => {
      setUsernameChecking(true);
      try {
        const res = await checkUsername(username);
        if (res.success && res.data) {
          setUsernameAvailable(res.data.available);
        } else {
          setUsernameAvailable(false);
        }
      } catch {
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (validateStep1()) setStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (validateStep2()) setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameAvailable) return;

    setLoading(true);
    setErrorMsg('');

    try {
      // Register user with all collected data
      const res = await registerUser({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        pin,
      });

      if (!res.success || !res.data) {
        setErrorMsg(res.error?.message || 'Registration failed');
        setLoading(false);
        return;
      }

      // Now set the username via onboarding endpoint
      const onboardingRes = await completeOnboarding(username);
      if (!onboardingRes.success) {
        // Account created but username failed — redirect to onboarding to retry
        router.push('/onboarding');
        return;
      }

      setLoading(false);
      setStep(4);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect. Please try again.');
      setLoading(false);
    }
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

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  s === step
                    ? 'bg-brand-muted-gold w-8'
                    : s < step
                      ? 'bg-green-500'
                      : 'bg-brand-charcoal-border'
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-2xl font-bold text-brand-offwhite mb-1.5">Create your account</h1>
              <p className="text-brand-offwhite-muted text-sm max-w-xs mx-auto">
                Join Koder and start solving problems.
              </p>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step2-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Shield size={20} className="text-brand-muted-gold" />
                <h1 className="text-2xl font-bold text-brand-offwhite">Set recovery PIN</h1>
                <button
                  type="button"
                  onClick={() => setShowPin((p) => !p)}
                  className="ml-1 p-1.5 rounded-lg text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-border transition-colors"
                  aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-brand-offwhite-muted text-sm max-w-xs mx-auto">
                This 6-digit PIN is used to recover your account if you forget your password.
              </p>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step3-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-2xl font-bold text-brand-offwhite mb-1.5">Choose a username</h1>
              <p className="text-brand-offwhite-muted text-sm max-w-xs mx-auto">
                This will be your public handle on Koder.
              </p>
            </motion.div>
          )}
          {step === 4 && (
            <motion.div
              key="step4-header"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-brand-offwhite mb-1.5">Account created!</h1>
              <p className="text-brand-offwhite-muted text-sm max-w-xs mx-auto">
                Welcome to Koder, {firstName}. Start solving problems and earning XP.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
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

              <form onSubmit={handleStep1Next} noValidate className="space-y-5">
                {errorMsg && (
                  <div role="alert" className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <LabelInputContainer>
                    <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                      className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4"
                      placeholder="Ada"
                    />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                      className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4"
                      placeholder="Lovelace"
                    />
                  </LabelInputContainer>
                </div>

                <LabelInputContainer>
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4"
                    placeholder="student@university.edu"
                  />
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label htmlFor="reg-password" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4 pr-12"
                      placeholder="Create a strong password"
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
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label htmlFor="reg-confirm-password" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4 pr-12"
                      placeholder="Re-enter your password"
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
                </LabelInputContainer>

                {step1Errors.length > 0 && (
                  <div role="alert" className="bg-brand-error/10 border border-brand-error/20 rounded-xl px-4 py-3">
                    {step1Errors.map((err, i) => (
                      <p key={i} className="text-brand-error text-xs">{err}</p>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  className="group/btn relative w-full bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base h-12 rounded-xl font-bold transition-all shadow-lg shadow-brand-muted-gold/20 flex items-center justify-center gap-2 overflow-hidden"
                >
                  <Mail size={16} />
                  Continue
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  <BottomGradient />
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleStep2Next} noValidate className="space-y-6">
              {errorMsg && (
                <div role="alert" className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm">
                  {errorMsg}
                </div>
              )}

              <PinInput size="md" mask={!showPin}>
                <PinInput.Label className="text-sm font-semibold not-uppercase tracking-normal text-center w-full text-brand-offwhite-muted">Recovery PIN</PinInput.Label>
                <PinInput.Group
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={pin}
                  onChange={setPin}
                  autoFocus
                  hasError={step2Errors.length > 0}
                  className="mx-auto"
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

              <PinInput size="md" mask={!showPin}>
                <PinInput.Label className="text-sm font-semibold not-uppercase tracking-normal text-center w-full text-brand-offwhite-muted">Confirm PIN</PinInput.Label>
                <PinInput.Group
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={confirmPin}
                  onChange={setConfirmPin}
                  hasError={(confirmPin.length > 0 && !pinsMatch) || step2Errors.length > 0}
                  className="mx-auto"
                >
                  <PinInput.Slot index={0} />
                  <PinInput.Slot index={1} />
                  <PinInput.Slot index={2} />
                  <PinInput.Separator />
                  <PinInput.Slot index={3} />
                  <PinInput.Slot index={4} />
                  <PinInput.Slot index={5} />
                </PinInput.Group>
                {confirmPin.length > 0 && (
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    {pinsMatch && confirmComplete ? (
                      <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                        <CheckCircle size={12} /> PINs match
                      </span>
                    ) : !pinsMatch ? (
                      <span className="text-brand-error text-xs font-medium">PINs do not match</span>
                    ) : null}
                  </div>
                )}
              </PinInput>

              {step2Errors.length > 0 && (
                <div role="alert" className="bg-brand-error/10 border border-brand-error/20 rounded-xl px-4 py-3">
                  {step2Errors.map((err, i) => (
                    <p key={i} className="text-brand-error text-xs">{err}</p>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={!pinReady}
                className="group/btn relative w-full bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base h-12 rounded-xl font-bold transition-all shadow-lg shadow-brand-muted-gold/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                Continue
                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                <BottomGradient />
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-brand-offwhite-muted hover:text-brand-offwhite transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={14} />
                Back to details
              </button>
            </form>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {errorMsg && (
                <div role="alert" className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm">
                  {errorMsg}
                </div>
              )}

              <LabelInputContainer>
                <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''));
                    setUsernameAvailable(null);
                  }}
                  autoComplete="off"
                  data-invalid={username.length >= 3 && usernameAvailable === false}
                  className="bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite placeholder:text-brand-offwhite-muted/40 data-[invalid=true]:border-brand-error focus-visible:border-brand-muted-gold focus-visible:ring-0 h-12 rounded-xl px-4 font-mono"
                  placeholder="cool_coder_42"
                />
                {username.length >= 3 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    {usernameChecking ? (
                      <div className="w-3 h-3 border-2 border-brand-muted-gold/30 border-t-brand-muted-gold rounded-full animate-spin" />
                    ) : usernameAvailable === true ? (
                      <CheckCircle size={14} className="text-green-400" />
                    ) : usernameAvailable === false ? (
                      <span className="text-brand-error text-[11px] font-medium">Username taken</span>
                    ) : null}
                    {usernameAvailable === true && (
                      <span className="text-green-400 text-[11px] font-medium">Available</span>
                    )}
                  </div>
                )}
              </LabelInputContainer>

              <button
                type="submit"
                disabled={loading || !usernameAvailable}
                className="group/btn relative w-full bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base h-12 rounded-xl font-bold transition-all shadow-lg shadow-brand-muted-gold/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-brand-charcoal-base/30 border-t-brand-charcoal-base rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Create Account
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
                <BottomGradient />
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-center text-sm text-brand-offwhite-muted hover:text-brand-offwhite transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={14} />
                Back to PIN
              </button>
            </form>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center"
          >
            <button
              onClick={() => router.push('/home')}
              className="inline-flex items-center gap-2 bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base px-8 h-12 rounded-xl font-bold transition-all shadow-lg shadow-brand-muted-gold/20"
            >
              Go to Dashboard
              <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {step < 4 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-center text-sm text-brand-offwhite-muted mt-7"
        >
          Already have an account?{' '}
          <Link href="/login" className="text-brand-offwhite font-bold hover:text-brand-muted-gold transition-colors">
            Sign In
          </Link>
        </motion.p>
      )}
    </motion.div>
  );
}
