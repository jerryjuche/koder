'use client';

import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Code2,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { LanguageLogo } from '@/components/LanguageLogo';
import { LabelInputContainer } from '@/components/auth/label-input-container';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { checkUsername, completeOnboarding, fetchUser } from '@/lib/api';
import { useUser } from '@/lib/UserContext';
import { cn } from '@/lib/utils';

const stepVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 40 : -40,
    scale: 0.95,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction < 0 ? 40 : -40,
    scale: 0.95,
    transition: { duration: 0.2 },
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setPrimaryLanguage } = useUser();
  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState('Developer');

  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.usernameSet && user.primaryLanguage) {
      router.push('/home');
    } else if (user.usernameSet && !user.primaryLanguage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(2);
    }
  }, [user, router]);

  useEffect(() => {
    fetchUser().then((res) => {
      if (res.success && res.data?.name) {
        setName(res.data.name.split(' ')[0]);
      }
    });
  }, []);

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(val);
    setErrorMsg('');
    setIsAvailable(null);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (val.length < 3) {
      setIsAvailable(false);
      return;
    }

    setIsChecking(true);
    typingTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await checkUsername(val);
        if (res.success && res.data) {
          setIsAvailable(res.data.available);
          if (!res.data.available) {
            setErrorMsg('Username is already taken');
          }
        } else {
          setIsAvailable(false);
          setErrorMsg(res.error?.message || 'Error checking username');
        }
      } catch {
        setIsAvailable(false);
        setErrorMsg('Network error. Please try again.');
      } finally {
        setIsChecking(false);
      }
    }, 500);
  };

  const submitUsername = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !isAvailable || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await completeOnboarding(username);
      if (res.success && res.data) {
        if (res.data.refresh_token) {
          localStorage.setItem("refresh_token", res.data.refresh_token);
        }
        window.dispatchEvent(new Event("user-updated"));
        setDirection(1);
        setStep(2);
      } else {
        setErrorMsg(res.error?.message || 'Failed to complete setup');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLanguageSelect = async (lang: string) => {
    setIsSubmitting(true);
    try {
      await setPrimaryLanguage(lang);
      router.push('/home');
    } catch {
      setErrorMsg('Failed to set language. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex w-full min-h-[500px] flex-col justify-center">
      {/* Progress indicator */}
      <div className="absolute -top-12 left-0 flex w-full justify-center">
        <div className="flex items-center gap-2 rounded-full border border-brand-charcoal-border bg-brand-charcoal-card px-3 py-1.5">
          <div
            className={cn(
              "h-1.5 w-8 rounded-full transition-colors",
              step >= 1 ? "bg-brand-muted-gold" : "bg-brand-charcoal-border",
            )}
          />
          <div
            className={cn(
              "h-1.5 w-8 rounded-full transition-colors",
              step >= 2 ? "bg-brand-muted-gold" : "bg-brand-charcoal-border",
            )}
          />
          <span className="ml-2 text-xs font-medium tracking-wide text-brand-offwhite">
            STEP {step} OF 2
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {step === 1 && (
          <motion.div
            key="step1"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="relative w-full overflow-hidden rounded-3xl border border-brand-charcoal-border bg-brand-charcoal-card p-8 shadow-2xl"
          >
            <div className="pointer-events-none absolute left-0 top-0 h-32 w-full bg-gradient-to-b from-brand-muted-gold/10 to-transparent" />

            <div className="relative z-10 mb-8 flex flex-col items-center text-center">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-brand-muted-gold/30 bg-brand-charcoal-base text-brand-muted-gold shadow-lg shadow-brand-muted-gold/10">
                <Code2 size={24} />
              </div>
              <h1 className="mb-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Welcome, {name}!
              </h1>
              <p className="max-w-[280px] text-sm text-brand-offwhite-muted sm:text-base">
                Choose a unique username to represent you on the leaderboards.
              </p>
            </div>

            <form onSubmit={submitUsername} className="relative z-10 space-y-6">
              <LabelInputContainer>
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User size={14} />
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g. awesome_coder"
                    value={username}
                    onChange={handleUsernameChange}
                    className={cn(
                      "h-12 pr-10 text-lg",
                      isAvailable === true && "border-green-500/50 focus-visible:ring-green-500/50",
                      isAvailable === false && username.length >= 3 && "border-brand-error/50 focus-visible:ring-brand-error/50",
                    )}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isChecking ? (
                      <Loader2 size={18} className="animate-spin text-brand-offwhite-muted" />
                    ) : isAvailable === true ? (
                      <CheckCircle2 size={18} className="text-green-500" />
                    ) : isAvailable === false && username.length >= 3 ? (
                      <XCircle size={18} className="text-brand-error" />
                    ) : null}
                  </div>
                </div>
                {errorMsg && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-brand-error">
                    <XCircle size={12} />
                    {errorMsg}
                  </p>
                )}
                <p className="mt-2 text-xs leading-relaxed text-brand-offwhite-muted">
                  3-30 characters. Letters, numbers, underscores, and hyphens only.
                  <br />
                  <strong className="font-medium text-brand-offwhite">
                    Your username will also serve as your student ID and cannot be changed later.
                  </strong>
                </p>
              </LabelInputContainer>

              <Button
                type="submit"
                disabled={!isAvailable || isSubmitting}
                className="group flex h-12 w-full items-center justify-center gap-2 text-base font-bold"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex items-center justify-center rounded-full border border-brand-charcoal-border bg-brand-charcoal-hover px-3 py-1 text-sm font-medium text-brand-offwhite">
                <Sparkles size={14} className="mr-2 text-brand-muted-gold" />
                Almost there
              </div>
              <h1 className="mb-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Choose your weapon
              </h1>
              <p className="text-brand-offwhite-muted">
                Select your primary programming language. You can always switch later.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Go card */}
              <button
                onClick={() => handleLanguageSelect('go')}
                disabled={isSubmitting}
                className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-brand-charcoal-border bg-brand-charcoal-card p-6 text-left transition-all duration-300 hover:border-[#00ADD8]/50 hover:shadow-lg hover:shadow-[#00ADD8]/10 disabled:opacity-50"
              >
                <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-[#00ADD8]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <LanguageLogo
                  language="go"
                  size={56}
                  className="mb-4 drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                />
                <h3 className="mb-1 text-xl font-bold text-white">Go</h3>
                <p className="mb-4 text-center text-xs leading-relaxed text-brand-offwhite-muted">
                  Fast, statically typed, and built for concurrency.
                </p>
                <div className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-[#00ADD8]/10 py-2 text-sm font-bold text-[#00ADD8] transition-colors group-hover:bg-[#00ADD8] group-hover:text-white">
                  Select Go
                  <ChevronRight size={16} />
                </div>
              </button>

              {/* Python card */}
              <button
                onClick={() => handleLanguageSelect('python')}
                disabled={isSubmitting}
                className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-brand-charcoal-border bg-brand-charcoal-card p-6 text-left transition-all duration-300 hover:border-[#FFD43B]/50 hover:shadow-lg hover:shadow-[#FFD43B]/10 disabled:opacity-50"
              >
                <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-[#FFD43B]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <LanguageLogo
                  language="python"
                  size={56}
                  className="mb-4 drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                />
                <h3 className="mb-1 text-xl font-bold text-white">Python</h3>
                <p className="mb-4 text-center text-xs leading-relaxed text-brand-offwhite-muted">
                  Elegant, readable, and incredibly versatile.
                </p>
                <div className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-[#306998]/20 py-2 text-sm font-bold text-[#FFD43B] transition-colors group-hover:bg-[#306998] group-hover:text-[#FFD43B]">
                  Select Python
                  <ChevronRight size={16} />
                </div>
              </button>
            </div>

            {errorMsg && (
              <p className="mb-4 text-center text-sm font-medium text-brand-error">
                {errorMsg}
              </p>
            )}

            <div className="text-center">
              <button
                onClick={() => handleLanguageSelect('go')}
                disabled={isSubmitting}
                className="text-sm text-brand-offwhite-muted underline underline-offset-4 transition-colors hover:text-brand-offwhite disabled:opacity-50"
              >
                Skip for now (defaults to Go)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
