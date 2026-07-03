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
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } },
              }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-muted-gold/20 bg-brand-muted-gold/8 px-4 py-1.5"
            >
              <Zap className="h-3.5 w-3.5 text-brand-muted-gold" />
              <span className="text-xs font-medium text-brand-muted-gold/90 tracking-wide">
                Zero-cost automated Go grading
              </span>
            </motion.div>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {"Learn Go through practice, not theory."
                .split(" ")
                .map((word, index) => (
                  <motion.span
                    key={index}
                    custom={index}
                    variants={wordVariants}
                    className={cn(
                      "mr-2 inline-block",
                      word === "Go" ? "text-[#00ADD8]" : "",
                      word === "practice," || word === "theory." ? "bg-gradient-to-r from-brand-offwhite via-[#f0e6c5] to-brand-offwhite bg-clip-text text-transparent" : "",
                      word !== "Go" && word !== "practice," && word !== "theory." ? "text-brand-offwhite" : "",
                    )}
                  >
                    {word}
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

            {/* Hero preview image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              className="relative mt-16 mx-auto max-w-5xl"
            >
              <div className="relative rounded-2xl border border-brand-charcoal-border/60 bg-brand-charcoal-card/40 p-2 backdrop-blur-sm shadow-2xl">
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-brand-muted-gold/10 via-transparent to-brand-muted-gold/5 opacity-60 pointer-events-none" />
                <div className="relative overflow-hidden rounded-xl border border-brand-charcoal-border/30 bg-brand-charcoal-base">
                  <div className="flex items-center gap-1.5 border-b border-brand-charcoal-border/30 px-4 py-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                    <span className="ml-3 text-xs text-brand-offwhite-muted/50 font-mono">koder — ~/workspace</span>
                  </div>
                  <div className="grid grid-cols-[1fr_2fr] min-h-[320px] sm:min-h-[400px]">
                    <div className="border-r border-brand-charcoal-border/30 p-4 space-y-3">
                      {["variables.go", "loops.go", "functions.go", "structs.go", "pointers.go"].map((file, i) => (
                        <div
                          key={file}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono transition-colors",
                            i === 0 ? "bg-brand-muted-gold/10 text-brand-muted-gold" : "text-brand-offwhite-muted/60 hover:text-brand-offwhite-muted/80",
                          )}
                        >
                          <Code2 className="h-3 w-3 flex-shrink-0" />
                          {file}
                        </div>
                      ))}
                    </div>
                    <div className="p-5 font-mono text-xs leading-[22px]">
                      <pre className="m-0 text-brand-offwhite-muted/70">
                        <span className="text-[#c792ea]">package </span><span className="text-brand-offwhite-muted/80">piscine</span>
                        {"\n"}
                        <span className="text-[#c792ea]">import </span><span className="text-[#c3e88d]">"strconv"</span>
                        {"\n\n"}
                        <span className="text-[#c792ea]">func </span><span className="text-[#ffcb6b]">Itoa</span><span className="text-brand-offwhite-muted/50">(</span><span className="text-[#eeffff]">n</span><span className="text-[#ff5370]"> int</span><span className="text-brand-offwhite-muted/50">)</span><span className="text-[#ff5370]"> string</span><span className="text-brand-offwhite-muted/50"> {"{"}</span>
                        {"\n"}
                        <span className="text-brand-offwhite-muted/30">  </span><span className="text-[#c792ea]">if</span><span className="text-brand-offwhite-muted/70"> n </span><span className="text-brand-offwhite-muted/70">&lt;</span><span className="text-[#f78c6c]"> 0</span><span className="text-brand-offwhite-muted/70"> {"{"}</span>
                        {"\n"}
                        <span className="text-brand-offwhite-muted/30">    </span><span className="text-[#c792ea]">return</span><span className="text-brand-offwhite-muted/70"> </span><span className="text-[#89ddff]">"-"</span><span className="text-brand-offwhite-muted/70"> + </span><span className="text-[#ffcb6b]">Itoa</span><span className="text-brand-offwhite-muted/70">(-n)</span>
                        {"\n"}
                        <span className="text-brand-offwhite-muted/30">  </span><span className="text-brand-offwhite-muted/70">{"}"}</span>
                        {"\n"}
                        <span className="text-brand-offwhite-muted/30">  </span><span className="text-[#c792ea]">if</span><span className="text-brand-offwhite-muted/70"> n == </span><span className="text-[#f78c6c]">0</span><span className="text-brand-offwhite-muted/70"> {"{"}</span>
                        {"\n"}
                        <span className="text-brand-offwhite-muted/30">    </span><span className="text-[#c792ea]">return</span><span className="text-brand-offwhite-muted/70"> </span><span className="text-[#89ddff]">"0"</span>
                        {"\n"}
                        <span className="text-brand-offwhite-muted/30">  </span><span className="text-brand-offwhite-muted/70">{"}"}</span>
                        {"\n"}
                        <span className="text-brand-offwhite-muted/30">  </span><span className="text-brand-offwhite-muted/50">// ...</span>
                        {"\n"}
                        <span className="text-brand-offwhite-muted/70">{"}"}</span>
                      </pre>
                      <div className="mt-3">
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-green-500/10 px-2.5 py-1 text-green-400/80 text-[10px] font-semibold tracking-wide">
                          <span>✓</span>
                          <span>All tests passed (5/5)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
              { title: "Product", links: ["Features", "Pricing", "Documentation", "Changelog"] },
              { title: "Resources", links: ["API Reference", "Integrations", "Community", "Blog"] },
              { title: "Company", links: ["About", "Privacy", "Terms", "Contact"] },
            ].map((group) => (
              <div key={group.title}>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-offwhite-muted">{group.title}</p>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link}>
                      <Link href="/" className="text-sm text-brand-offwhite-muted/60 transition-colors hover:text-brand-offwhite">{link}</Link>
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
              <span className="hidden sm:inline">&middot;</span>
              <span className="hidden sm:inline">Oracle free tier</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
