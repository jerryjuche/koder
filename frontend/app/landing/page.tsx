import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Code2,
  Flame,
  LayoutDashboard,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Koder - Zero-Cost Automated Code Grading Platform",
  description:
    "Professional code grading platform for Go programming. Real-time feedback, zero infrastructure costs, fully automated evaluation.",
};

export default function LandingPage() {
  const highlights = [
    {
      icon: Code2,
      title: "Automated grading",
      description:
        "Run student submissions inside isolated Go sandboxes with deterministic test results and execution metrics.",
    },
    {
      icon: BarChart3,
      title: "Progress analytics",
      description:
        "Track XP, streaks, leaderboards, and pass rates across learners and assignments.",
    },
    {
      icon: Trophy,
      title: "Competency growth",
      description:
        "Motivate students with rank-based achievements and real-time performance signals.",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Fast execution",
      description:
        "Optimized concurrent evaluation that returns feedback quickly without slowing workflows.",
    },
    {
      icon: Users,
      title: "Instructor-ready",
      description:
        "Admin tools for ingestion, enrichment, and problem lifecycle management.",
    },
    {
      icon: BookOpen,
      title: "Rich content",
      description:
        "Curated Go problems with hints, tags, and difficulty metadata for every skill level.",
    },
    {
      icon: Flame,
      title: "Streak tracking",
      description:
        "Encourage consistency with progress streaks and daily practice insights.",
    },
    {
      icon: CheckCircle2,
      title: "Reliable scoring",
      description:
        "Precise pass/fail validation with per-test diagnostics and hidden-case support.",
    },
    {
      icon: Sparkles,
      title: "Elegant UI",
      description:
        "Modern dashboard layouts designed for clarity and quick decision-making.",
    },
  ];

  const stats = [
    { label: "Problems", value: "500+" },
    { label: "Learners", value: "2K+" },
    { label: "Submissions", value: "50K+" },
    { label: "Success Rate", value: "94%" },
  ];

  return (
    <div className="min-h-screen bg-brand-charcoal-base text-brand-offwhite">
      <nav className="sticky top-0 z-50 border-b border-brand-charcoal-border bg-brand-charcoal-base/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-muted-gold text-brand-charcoal-base shadow-sm shadow-brand-muted-gold/20">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">Koder</p>
              <p className="text-xs uppercase tracking-[0.35em] text-brand-offwhite-muted">
                zero-cost grading
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-full px-5 py-2 text-sm font-semibold text-brand-offwhite transition hover:text-brand-muted-gold"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gradient-to-r from-brand-muted-gold to-brand-muted-gold-dark px-5 py-2 text-sm font-semibold text-brand-charcoal-base shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:scale-[1.02]"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 relative">
        {/* Subtle radial gradient background blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[600px] bg-brand-muted-gold/5 blur-[120px] rounded-full pointer-events-none" />

        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-brand-charcoal-border bg-brand-charcoal-card px-4 py-2 text-sm text-brand-offwhite-muted">
              <Zap className="h-4 w-4 text-brand-muted-gold" />
              Free-tier infrastructure with no hidden costs
            </div>
            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-brand-offwhite via-[#F4E3B2] to-brand-offwhite bg-clip-text text-transparent">
                A professional Go grading platform built for modern curricula.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-brand-offwhite-muted">
                Koder delivers secure, automated evaluation and learner
                analytics without production infrastructure. Keep your focus on
                outcomes, not setup.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-muted-gold to-brand-muted-gold-dark px-8 py-4 text-base font-semibold text-brand-charcoal-base shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.35)] hover:scale-[1.02]"
              >
                Start grading
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-brand-charcoal-border bg-brand-charcoal-card px-8 py-4 text-base font-semibold text-brand-offwhite transition hover:border-brand-muted-gold hover:text-brand-muted-gold"
              >
                Browse Problems
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-brand-charcoal-border bg-brand-charcoal-card p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-brand-offwhite-muted">
                  launch speed
                </p>
                <p className="mt-2 text-3xl font-semibold text-brand-offwhite">
                  Instant
                </p>
              </div>
              <div className="rounded-3xl border border-brand-charcoal-border bg-brand-charcoal-card p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-brand-offwhite-muted">
                  grading
                </p>
                <p className="mt-2 text-3xl font-semibold text-brand-offwhite">
                  Automated
                </p>
              </div>
              <div className="rounded-3xl border border-brand-charcoal-border bg-brand-charcoal-card p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-brand-offwhite-muted">
                  feedback
                </p>
                <p className="mt-2 text-3xl font-semibold text-brand-offwhite">
                  Deterministic
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2.5rem] border border-brand-charcoal-border/80 bg-brand-charcoal-card/90 backdrop-blur-md p-8 shadow-[0_30px_80px_rgba(0,0,0,0.3)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-muted-gold/20 to-transparent"></div>
              <div className="flex items-center justify-between text-sm text-brand-offwhite-muted mb-6">
                <div className="rounded-2xl bg-brand-charcoal-base px-3 py-1">
                  Instructor dashboard
                </div>
                <div className="rounded-full bg-brand-success/10 px-3 py-1 text-brand-success">
                  Live
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-3xl border border-brand-charcoal-border bg-brand-charcoal-base p-5">
                  <div className="flex items-center justify-between gap-4 text-sm text-brand-offwhite-muted mb-4">
                    <span>Active assignment</span>
                    <span className="font-semibold text-brand-offwhite">
                      Pointers 2.0
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-brand-charcoal-card p-4 border border-brand-charcoal-border">
                      <p className="text-xs uppercase tracking-[0.35em] text-brand-offwhite-muted">
                        Submissions
                      </p>
                      <p className="mt-2 text-xl font-semibold text-brand-offwhite">
                        1.2K
                      </p>
                    </div>
                    <div className="rounded-3xl bg-brand-charcoal-card p-4 border border-brand-charcoal-border">
                      <p className="text-xs uppercase tracking-[0.35em] text-brand-offwhite-muted">
                        Pass rate
                      </p>
                      <p className="mt-2 text-xl font-semibold text-brand-success">
                        92%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl bg-brand-charcoal-card p-5 border border-brand-charcoal-border">
                  <div className="flex items-center justify-between text-sm text-brand-offwhite-muted mb-4">
                    <span>Review queue</span>
                    <span className="rounded-full bg-brand-muted-gold/10 px-3 py-1 text-brand-muted-gold">
                      Fast
                    </span>
                  </div>
                  <div className="grid gap-3">
                    <div className="rounded-3xl bg-brand-charcoal-base p-4">
                      <p className="text-sm text-brand-offwhite-muted">
                        Draft problems awaiting enrichment
                      </p>
                      <p className="mt-3 text-lg font-semibold text-brand-offwhite">
                        24
                      </p>
                    </div>
                    <div className="rounded-3xl bg-brand-charcoal-base p-4">
                      <p className="text-sm text-brand-offwhite-muted">
                        Active learners
                      </p>
                      <p className="mt-3 text-lg font-semibold text-brand-offwhite">
                        2.1K
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-brand-charcoal-border bg-brand-charcoal-card p-8">
              <p className="text-sm uppercase tracking-[0.35em] text-brand-offwhite-muted mb-3">
                Trusted workflow
              </p>
              <div className="flex items-center gap-3 text-brand-offwhite-muted text-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-brand-charcoal-base text-brand-muted-gold">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-brand-offwhite">
                    One platform, full control
                  </p>
                  <p>
                    Manage problems, submissions, and analytics from a single
                    interface.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {highlights.map((highlight, idx) => {
            const Icon = highlight.icon;
            return (
              <div
                key={idx}
                className="bg-brand-charcoal-card border border-brand-charcoal-border hover:border-brand-muted-gold/30 transition-all duration-300 rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-1 shadow-sm"
              >
                <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-brand-offwhite pointer-events-none">
                  <Icon size={140} />
                </div>
                <div className="relative z-10">
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-charcoal-base border border-brand-charcoal-border text-brand-muted-gold shadow-sm shadow-brand-muted-gold/10">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-brand-offwhite mb-3">
                    {highlight.title}
                  </h3>
                  <p className="text-brand-offwhite-muted leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-24 rounded-[2.5rem] border border-brand-charcoal-border/50 bg-brand-charcoal-card p-12 shadow-[0_30px_80px_rgba(0,0,0,0.18)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-muted-gold/5 to-transparent opacity-50 rounded-[2.5rem] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-brand-offwhite">Enterprise Assessment, Zero Overhead</h2>
              <p className="text-brand-offwhite-muted mt-3 max-w-2xl mx-auto">Built specifically to solve the hardest infrastructure problems in evaluating code at scale.</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="rounded-2xl border border-brand-charcoal-border bg-brand-charcoal-base p-6 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-brand-offwhite-muted mb-3">Isolation</p>
                <p className="text-xl font-semibold text-brand-offwhite">Docker Sandboxing</p>
                <p className="text-sm text-brand-offwhite-muted mt-3">Safely execute untrusted learner code in secure, ephemeral nsjail containers.</p>
              </div>
              <div className="rounded-2xl border border-brand-charcoal-border bg-brand-charcoal-base p-6 text-center border-t-brand-muted-gold/30">
                <p className="text-sm uppercase tracking-[0.35em] text-brand-offwhite-muted mb-3">Economics</p>
                <p className="text-xl font-semibold text-brand-offwhite">Zero-Cost Scaling</p>
                <p className="text-sm text-brand-offwhite-muted mt-3">Leverage heavily optimized concurrent Go routines that require zero paid cloud instances.</p>
              </div>
              <div className="rounded-2xl border border-brand-charcoal-border bg-brand-charcoal-base p-6 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-brand-offwhite-muted mb-3">Intelligence</p>
                <p className="text-xl font-semibold text-brand-offwhite">AI Enrichment</p>
                <p className="text-sm text-brand-offwhite-muted mt-3">Automatically generate hints, tags, and difficulty metadata for thousands of problems.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24 rounded-4xl border border-brand-muted-gold/20 bg-brand-charcoal-card p-12 text-center shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-offwhite-muted mb-4">
            Ready for a better Go grading experience?
          </p>
          <h2 className="text-3xl font-bold text-brand-offwhite mb-4">
            Build reliable code assessment workflows without the overhead.
          </h2>
          <p className="mx-auto max-w-2xl text-brand-offwhite-muted leading-relaxed mb-8">
            Koder is built for educators and teams who want modern grading
            tools, fast feedback loops, and transparent learner progress on a
            zero-cost stack.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-muted-gold to-brand-muted-gold-dark px-8 py-4 text-base font-semibold text-brand-charcoal-base shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.35)] hover:scale-[1.02]"
            >
              Create an account
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-brand-charcoal-border bg-brand-charcoal-base px-8 py-4 text-base font-semibold text-brand-offwhite transition hover:border-brand-muted-gold hover:text-brand-muted-gold"
            >
              Sign in
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-brand-charcoal-border bg-brand-charcoal-base/90 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-offwhite">Koder</p>
            <p className="text-sm text-brand-offwhite-muted">
              Zero-cost automated Go grading for instructors and learners.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-brand-offwhite-muted">
            <Link
              href="/login"
              className="transition hover:text-brand-muted-gold"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="transition hover:text-brand-muted-gold"
            >
              Register
            </Link>
            <Link
              href="/admin"
              className="transition hover:text-brand-muted-gold"
            >
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
