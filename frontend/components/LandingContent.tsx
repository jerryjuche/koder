"use client";

import {
  ArrowRight,
  BarChart3,
  Code2,
  Command,
  GraduationCap,
  Shield,
  Sparkles,
  Trophy,
  Zap,
  ChevronRight,
  Cpu,
  Menu,
  X,
  CheckCircle,
  BookOpen,
  Target,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const wordVariants = {
  hidden: { opacity: 0, filter: "blur(4px)", y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      duration: 0.35,
      delay: i * 0.06,
      ease: "easeOut" as const,
    },
  }),
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export default function LandingContent({ onGetStarted }: { onGetStarted?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.95]);

  const nav = (
    <>
      <Link
        href="/login"
        className="text-sm font-medium text-brand-offwhite-muted transition-colors hover:text-brand-offwhite"
      >
        Log in
      </Link>
      <Link
        href="/register"
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-muted-gold px-5 py-2 text-sm font-semibold text-brand-charcoal-base transition-all duration-300 hover:bg-brand-muted-gold-dark hover:shadow-[0_0_24px_rgba(212,175,55,0.3)]"
      >
        Get started
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-brand-charcoal-base text-brand-offwhite overflow-hidden">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-brand-charcoal-border/60 bg-brand-charcoal-base/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Koder"
              width={36}
              height={36}
              className="rounded-xl"
            />
            <span className="text-lg font-bold tracking-tight">Koder</span>
          </Link>

          <div className="hidden items-center gap-4 sm:flex">{nav}</div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center rounded-lg border border-brand-charcoal-border p-2 sm:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-brand-charcoal-border/60 bg-brand-charcoal-card overflow-hidden"
            >
              <div className="flex flex-col gap-3 px-4 py-4">
                <Link
                  href="/login"
                  className="rounded-xl border border-brand-charcoal-border px-4 py-2.5 text-center text-sm font-medium text-brand-offwhite-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-muted-gold px-4 py-2.5 text-sm font-semibold text-brand-charcoal-base"
                  onClick={() => setMobileOpen(false)}
                >
                  Get started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO ─── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[90vh] flex items-center"
      >
        {/* Side gradient lines */}
        <div className="absolute inset-y-0 left-8 h-full w-px hidden lg:block">
          <div className="h-1/3 w-px bg-gradient-to-b from-transparent via-brand-muted-gold/40 to-transparent" />
        </div>
        <div className="absolute inset-y-0 right-8 h-full w-px hidden lg:block">
          <div className="h-1/3 w-px bg-gradient-to-b from-transparent via-brand-muted-gold/40 to-transparent" />
        </div>

        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-muted-gold/8 blur-[180px]" />
          <div className="absolute top-1/2 left-[15%] h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute top-1/3 right-[15%] h-[300px] w-[300px] rounded-full bg-amber-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-5xl text-center"
          >


            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {"Learn Go through practice, not theory."
                .split(" ")
                .map((word, index) => (
                  <motion.span
                    key={index}
                    custom={index}
                    variants={wordVariants}
                    className={cn(
                      "mr-2 inline-block align-middle",
                      word === "practice," || word === "theory." ? "bg-gradient-to-r from-brand-offwhite via-[#f0e6c5] to-brand-offwhite bg-clip-text text-transparent" : "",
                      word !== "Go" && word !== "practice," && word !== "theory." ? "text-brand-offwhite" : "",
                    )}
                  >
                    {word === "Go" ? (
                      <svg viewBox="0 0 207 78" className="inline-block h-[1.1em] w-[2.7em] align-text-bottom" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g fill="#00ADD8" fillRule="evenodd">
                          <path d="m16.2 24.1c-.4 0-.5-.2-.3-.5l2.1-2.7c.2-.3.7-.5 1.1-.5h35.7c.4 0 .5.3.3.6l-1.7 2.6c-.2.3-.7.6-1 .6z" />
                          <path d="m1.1 33.3c-.4 0-.5-.2-.3-.5l2.1-2.7c.2-.3.7-.5 1.1-.5h45.6c.4 0 .6.3.5.6l-.8 2.4c-.1.4-.5.6-.9.6z" />
                          <path d="m25.3 42.5c-.4 0-.5-.3-.3-.6l1.4-2.5c.2-.3.6-.6 1-.6h20c.4 0 .6.3.6.7l-.2 2.4c0 .4-.4.7-.7.7z" />
                          <g transform="translate(55)">
                            <path d="m74.1 22.3c-6.3 1.6-10.6 2.8-16.8 4.4-1.5.4-1.6.5-2.9-1-1.5-1.7-2.6-2.8-4.7-3.8-6.3-3.1-12.4-2.2-18.1 1.5-6.8 4.4-10.3 10.9-10.2 19 .1 8 5.6 14.6 13.5 15.7 6.8.9 12.5-1.5 17-6.6.9-1.1 1.7-2.3 2.7-3.7-3.6 0-8.1 0-19.3 0-2.1 0-2.6-1.3-1.9-3 1.3-3.1 3.7-8.3 5.1-10.9.3-.6 1-1.6 2.5-1.6h36.4c-.2 2.7-.2 5.4-.6 8.1-1.1 7.2-3.8 13.8-8.2 19.6-7.2 9.5-16.6 15.4-28.5 17-9.8 1.3-18.9-.6-26.9-6.6-7.4-5.6-11.6-13-12.7-22.2-1.3-10.9 1.9-20.7 8.5-29.3 7.1-9.3 16.5-15.2 28-17.3 9.4-1.7 18.4-.6 26.5 4.9 5.3 3.5 9.1 8.3 11.6 14.1.6.9.2 1.4-1 1.7z" />
                            <path d="m107.2 77.6c-9.1-.2-17.4-2.8-24.4-8.8-5.9-5.1-9.6-11.6-10.8-19.3-1.8-11.3 1.3-21.3 8.1-30.2 7.3-9.6 16.1-14.6 28-16.7 10.2-1.8 19.8-.8 28.5 5.1 7.9 5.4 12.8 12.7 14.1 22.3 1.7 13.5-2.2 24.5-11.5 33.9-6.6 6.7-14.7 10.9-24 12.8-2.7.5-5.4.6-8 .9zm23.8-40.4c-.1-1.3-.1-2.3-.3-3.3-1.8-9.9-10.9-15.5-20.4-13.3-9.3 2.1-15.3 8-17.5 17.4-1.8 7.8 2 15.7 9.2 18.9 5.5 2.4 11 2.1 16.3-.6 7.9-4.1 12.2-10.5 12.7-19.1z" fillRule="nonzero" />
                          </g>
                        </g>
                      </svg>
                    ) : (
                      word
                    )}
                  </motion.span>
                ))}
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.2 }}
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-brand-offwhite-muted sm:text-lg"
            >
              Koder turns every problem into an instant feedback loop. Write
              code, submit, and get deterministic results in seconds — no
              manual review, no infrastructure cost.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.4 }}
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/register"
                className="group relative inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-brand-muted-gold to-brand-muted-gold-dark px-8 text-base font-semibold text-brand-charcoal-base shadow-[0_0_24px_rgba(212,175,55,0.2)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.35)] hover:scale-[1.02] overflow-hidden"
              >
                Start grading
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-brand-charcoal-border bg-brand-charcoal-card/60 px-8 text-base font-semibold text-brand-offwhite backdrop-blur-sm transition-all duration-300 hover:border-brand-muted-gold/40 hover:text-brand-muted-gold"
              >
                Browse problems
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>


          </motion.div>
        </div>
      </motion.section>

      {/* ─── FEATURES GRID ─── */}
      <section className="relative py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-muted-gold/20 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mb-16 text-center"
          >
            <motion.p variants={fadeInUp} custom={0} className="mb-4 text-xs uppercase tracking-[0.25em] text-brand-muted-gold/80 font-medium">
              Platform capabilities
            </motion.p>
            <motion.h2 variants={fadeInUp} custom={1} className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Everything you need to master Go
            </motion.h2>
            <motion.p variants={fadeInUp} custom={2} className="mx-auto mt-4 max-w-xl text-brand-offwhite-muted">
              From ingestion to evaluation, Koder handles every step so you can focus on coding.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: Shield, title: "Secure Sandboxing", desc: "Every submission runs in an isolated container with zero network access. Deterministic evaluation with no escape paths." },
              { icon: Zap, title: "Real-Time Feedback", desc: "Per-test-case results in under 3 seconds. Hidden test cases prevent gaming, visible cases guide iteration." },
              { icon: BarChart3, title: "Deep Analytics", desc: "Track XP, streaks, pass rates by difficulty, module proficiency, and leaderboard rankings over any period." },
              { icon: GraduationCap, title: "Curriculum-Grade Content", desc: "Problems organized by module with difficulty tiers, auto-generated hints, and AI-enriched test cases." },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  custom={i}
                  className="group relative overflow-hidden rounded-2xl border border-brand-charcoal-border/60 bg-brand-charcoal-card/50 p-6 backdrop-blur-sm transition-all duration-500 hover:border-brand-muted-gold/20 hover:bg-brand-charcoal-card/80 hover:shadow-[0_0_40px_rgba(212,175,55,0.06)]"
                >
                  <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-brand-muted-gold/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative z-10">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-charcoal-border bg-brand-charcoal-base text-brand-muted-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-brand-offwhite">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-brand-offwhite-muted">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── DETAILED FEATURES ─── */}
      <section className="relative py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-muted-gold/20 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mb-16 text-center"
          >
            <motion.p variants={fadeInUp} custom={0} className="mb-4 text-xs uppercase tracking-[0.25em] text-brand-muted-gold/80 font-medium">
              Why Koder
            </motion.p>
            <motion.h2 variants={fadeInUp} custom={1} className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Built for developers who ship real Go
            </motion.h2>
            <motion.p variants={fadeInUp} custom={2} className="mx-auto mt-4 max-w-xl text-brand-offwhite-muted">
              Purpose-built for Go mastery — every feature designed to accelerate learning.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3"
          >
            {[
              { icon: Cpu, title: "Isolated Execution", desc: "Every submission runs in a fresh Docker container or remote sandbox with memory limits, no network, and OS-level process isolation." },
              { icon: Sparkles, title: "AI-Powered Enrichment", desc: "Gemini generates test cases, hints, and difficulty ratings from raw READMEs. Provider-adaptive rate limits keep costs predictable." },
              { icon: Command, title: "Built for Go", desc: "Native Go test template engine generates type-safe assertions. Supports primitives, slices, structs, and reflect.DeepEqual automatically." },
              { icon: Target, title: "Deterministic Scoring", desc: "Stars (1-3 based on attempt count), XP, streaks, and leaderboards with tiebreaker-safe ranking. Never decreases on re-attempts." },
              { icon: Shield, title: "Security First", desc: "Pre-execution validation blocks dangerous imports. No network access in sandbox. 64MB filesystem write limit. Zero escape paths." },
              { icon: Trophy, title: "Community Engine", desc: "Students contribute problems, like best-practice solutions, earn verified contributor status. Admin moderation pipeline." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeInUp}
                  custom={i}
                  className="rounded-xl border border-brand-charcoal-border/50 bg-brand-charcoal-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-brand-muted-gold/15 hover:bg-brand-charcoal-card/60"
                >
                  <Icon className="mb-3 h-5 w-5 text-brand-muted-gold" />
                  <h3 className="mb-1.5 text-base font-semibold text-brand-offwhite">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-brand-offwhite-muted">{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-muted-gold/8 via-brand-muted-gold/5 to-transparent blur-[180px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="relative overflow-hidden rounded-3xl border border-brand-muted-gold/15 bg-gradient-to-b from-brand-muted-gold/5 to-brand-charcoal-card/60 px-6 py-16 text-center shadow-2xl sm:px-16 sm:py-20"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-brand-muted-gold/30 to-transparent" />
              <div className="absolute bottom-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-brand-muted-gold/20 to-transparent" />
              <div className="absolute top-1/2 -left-20 h-40 w-40 rounded-full bg-brand-muted-gold/10 blur-[80px]" />
              <div className="absolute top-1/2 -right-20 h-40 w-40 rounded-full bg-brand-muted-gold/10 blur-[80px]" />
            </div>

            <motion.p variants={fadeInUp} custom={0} className="mb-3 text-xs uppercase tracking-[0.25em] text-brand-muted-gold/80 font-medium">
              Start coding today
            </motion.p>
            <motion.h2 variants={fadeInUp} custom={1} className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Your Go journey starts here.
            </motion.h2>
            <motion.p variants={fadeInUp} custom={2} className="mx-auto mt-4 max-w-lg text-brand-offwhite-muted">
              No credit card. No setup. Just write code, submit, and learn — one problem at a time.
            </motion.p>

            <motion.div variants={fadeInUp} custom={3} className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-brand-muted-gold to-brand-muted-gold-dark px-8 text-base font-semibold text-brand-charcoal-base shadow-[0_0_24px_rgba(212,175,55,0.2)] transition-all duration-300 hover:shadow-[0_0_36px_rgba(212,175,55,0.35)] hover:scale-[1.02]"
              >
                Create free account
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-brand-charcoal-border bg-brand-charcoal-card/60 px-8 text-base font-semibold text-brand-offwhite backdrop-blur-sm transition-all duration-300 hover:border-brand-muted-gold/30 hover:text-brand-muted-gold"
              >
                Sign in
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-brand-charcoal-border/50 bg-brand-charcoal-base">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <Image src="/logo.png" alt="Koder" width={32} height={32} className="rounded-lg" />
                <span className="text-base font-bold tracking-tight">Koder</span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-brand-offwhite-muted max-w-xs">
                Zero-cost automated Go grading platform built for learners who want to write real code and get instant feedback.
              </p>
            </div>

            {[
              { title: "Practice", links: [{ label: "Problems", href: "/home" }, { label: "Leaderboard", href: "/leaderboard" }, { label: "Contribute", href: "/contribute" }] },
              { title: "Community", links: [{ label: "Discord", href: "#" }, { label: "GitHub", href: "https://github.com/jerryjuche/koder" }, { label: "Report Issue", href: "https://github.com/jerryjuche/koder/issues" }] },
              { title: "Legal", links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }] },
            ].map((group) => (
              <div key={group.title}>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-offwhite-muted">{group.title}</p>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-brand-offwhite-muted/60 transition-colors hover:text-brand-offwhite">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-brand-charcoal-border/30 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-brand-offwhite-muted/50">&copy; {new Date().getFullYear()} Koder. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-brand-offwhite-muted/50">
              <span>Built with Go + Next.js</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
