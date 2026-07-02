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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number] },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

export default function LandingContent({ onGetStarted }: { onGetStarted?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.92]);

  const stats = [
    { label: "Problems", value: "500+" },
    { label: "Active Learners", value: "2,000+" },
    { label: "Submissions Graded", value: "50,000+" },
    { label: "Avg. Success Rate", value: "94%" },
  ];

  const features = [
    {
      icon: Shield,
      title: "Secure Sandboxing",
      description:
        "Every submission runs in an isolated, ephemeral Go container with zero network access. Deterministic evaluation with no escape paths.",
      gradient: "from-amber-500/20 to-transparent",
    },
    {
      icon: Zap,
      title: "Real-Time Feedback",
      description:
        "Students get per-test-case results in under 3 seconds. Hidden test cases prevent gaming, visible cases guide iteration.",
      gradient: "from-blue-500/20 to-transparent",
    },
    {
      icon: BarChart3,
      title: "Deep Analytics",
      description:
        "Track XP growth, streaks, pass rates by difficulty, module proficiency, and leaderboard rankings over weekly or monthly periods.",
      gradient: "from-emerald-500/20 to-transparent",
    },
    {
      icon: GraduationCap,
      title: "Curriculum-Grade Content",
      description:
        "Problems organized by module with difficulty tiers, auto-generated hints, and AI-enriched test cases from raw specifications.",
      gradient: "from-purple-500/20 to-transparent",
    },
  ];

  const footerLinks = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Documentation", "Changelog"],
    },
    {
      title: "Resources",
      links: ["API Reference", "Integrations", "Community", "Blog"],
    },
    {
      title: "Company",
      links: ["About", "Privacy", "Terms", "Contact"],
    },
  ];

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
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-muted-gold px-5 py-2 text-sm font-semibold text-brand-charcoal-base transition-all duration-300 hover:bg-brand-muted-gold-dark hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
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

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-brand-charcoal-border/60 bg-brand-charcoal-card px-4 py-4 sm:hidden"
          >
            <div className="flex flex-col gap-3">
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
      </nav>

      {/* ─── HERO ─── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-32 pb-20 sm:pt-40 sm:pb-28"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-muted-gold/8 blur-[150px]" />
          <div className="absolute top-60 -left-40 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute top-80 -right-40 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center">
              <Badge
                variant="outline"
                className="rounded-full border-brand-muted-gold/30 bg-brand-muted-gold/10 px-4 py-1.5 text-xs font-medium text-brand-muted-gold"
              >
                <Zap className="mr-1.5 h-3 w-3" />
                Zero-cost automated Go grading
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              <span className="bg-gradient-to-r from-brand-offwhite via-[#f0e6c5] to-brand-offwhite bg-clip-text text-transparent">
                Learn Go through practice,{" "}
              </span>
              <span className="bg-gradient-to-r from-brand-muted-gold via-[#e8c84a] to-brand-muted-gold-dark bg-clip-text text-transparent">
                not theory.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-brand-offwhite-muted sm:text-lg"
            >
              Koder turns every problem into an instant feedback loop. Write
              code, submit, and get deterministic results in seconds — no
              manual review, no infrastructure cost.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/register"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-brand-muted-gold to-brand-muted-gold-dark px-8 text-base font-semibold text-brand-charcoal-base shadow-[0_0_24px_rgba(212,175,55,0.2)] transition-all duration-300 hover:shadow-[0_0_36px_rgba(212,175,55,0.35)] hover:scale-[1.02]"
              >
                Start grading
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-brand-charcoal-border bg-brand-charcoal-card/60 px-8 text-base font-semibold text-brand-offwhite backdrop-blur-sm transition-all duration-300 hover:border-brand-muted-gold/40 hover:text-brand-muted-gold"
              >
                Browse problems
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeInUp}
              className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-brand-charcoal-border/50 bg-brand-charcoal-border/30 sm:grid-cols-4"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-brand-charcoal-card/60 px-4 py-6 backdrop-blur-sm sm:px-6"
                >
                  <p className="text-2xl font-bold text-brand-offwhite sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-brand-offwhite-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── FEATURES ─── */}
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
            className="mb-14 text-center"
          >
            <motion.p variants={fadeInUp} className="mb-3 text-xs uppercase tracking-[0.3em] text-brand-muted-gold">
              Platform capabilities
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Everything you need to run code assessments
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-4 max-w-xl text-brand-offwhite-muted"
            >
              From ingestion to evaluation, Koder handles every step so you can
              focus on coding.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  custom={i}
                  className="group relative overflow-hidden rounded-2xl border border-brand-charcoal-border/60 bg-brand-charcoal-card/50 p-6 backdrop-blur-sm transition-all duration-500 hover:border-brand-muted-gold/20 hover:bg-brand-charcoal-card/80 hover:shadow-[0_0_40px_rgba(212,175,55,0.06)]"
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                      "bg-gradient-to-br",
                      feature.gradient,
                    )}
                  />

                  <div className="relative z-10">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-charcoal-border bg-brand-charcoal-base text-brand-muted-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-brand-offwhite">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-brand-offwhite-muted">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── WHY KODER ─── */}
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
            className="mb-14 text-center"
          >
            <motion.p variants={fadeInUp} className="mb-3 text-xs uppercase tracking-[0.3em] text-brand-muted-gold">
              Why Koder
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Built for developers who want to ship real Go
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-4 max-w-xl text-brand-offwhite-muted"
            >
              Purpose-built for Go mastery, Koder gives you the practice you
              need with the feedback you deserve.
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
              {
                icon: Cpu,
                title: "Isolated Execution",
                desc: "Every submission runs in a fresh Docker container or remote sandbox with memory limits, no network, and OS-level process isolation.",
              },
              {
                icon: Sparkles,
                title: "AI-Powered Enrichment",
                desc: "Gemini and Groq generate test cases, hints, and difficulty ratings from raw READMEs. Provider-adaptive rate limits keep costs predictable.",
              },
              {
                icon: Command,
                title: "Built for Go",
                desc: "Native Go test template engine generates type-safe assertions. Supports primitives, slices, structs, and reflect.DeepEqual automatically.",
              },
              {
                icon: BarChart3,
                title: "Deterministic Scoring",
                desc: "Stars (1-3 based on attempt count), XP, streaks, and leaderboards with tiebreaker-safe ranking. Never decreases on re-attempts.",
              },
              {
                icon: Shield,
                title: "Security First",
                desc: "Pre-execution regex blocks dangerous imports (os/exec, syscall, unsafe). No network access in sandbox. 64MB filesystem write limit.",
              },
              {
                icon: Trophy,
                title: "Community Engine",
                desc: "Students can contribute problems, like best-practice solutions, and earn verified contributor status. Admin moderation pipeline.",
              },
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
                  <h3 className="mb-1.5 text-base font-semibold text-brand-offwhite">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-brand-offwhite-muted">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-muted-gold/8 via-brand-muted-gold/5 to-transparent blur-[150px]" />
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
            </div>

            <motion.p
              variants={fadeInUp}
              className="mb-3 text-xs uppercase tracking-[0.3em] text-brand-muted-gold"
            >
              Start coding today
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Your Go journey starts here.
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-4 max-w-lg text-brand-offwhite-muted"
            >
              No credit card. No setup. Just write code, submit, and learn —
              one problem at a time.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/register"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-brand-muted-gold to-brand-muted-gold-dark px-8 text-base font-semibold text-brand-charcoal-base shadow-[0_0_24px_rgba(212,175,55,0.2)] transition-all duration-300 hover:shadow-[0_0_36px_rgba(212,175,55,0.35)] hover:scale-[1.02]"
              >
                Create free account
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
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
                <Image
                  src="/logo.png"
                  alt="Koder"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-base font-bold tracking-tight">
                  Koder
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-brand-offwhite-muted max-w-xs">
                Zero-cost automated Go grading platform built for learners who
                want to write real code and get instant feedback.
              </p>
            </div>

            {footerLinks.map((group) => (
              <div key={group.title}>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-offwhite-muted">
                  {group.title}
                </p>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="/"
                        className="text-sm text-brand-offwhite-muted/70 transition-colors hover:text-brand-offwhite"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-brand-charcoal-border/30 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-brand-offwhite-muted/50">
              &copy; {new Date().getFullYear()} Koder. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-brand-offwhite-muted/50">
              <span>Built with Go + Next.js</span>
              <span className="hidden sm:inline">&middot;</span>
              <span className="hidden sm:inline">Oracle free tier</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
