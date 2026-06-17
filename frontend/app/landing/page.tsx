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
              className="rounded-full bg-brand-muted-gold px-5 py-2 text-sm font-semibold text-brand-charcoal-base shadow-md shadow-brand-muted-gold/20 transition hover:bg-brand-muted-gold-dark"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-brand-charcoal-border bg-brand-charcoal-card px-4 py-2 text-sm text-brand-offwhite-muted">
              <Zap className="h-4 w-4 text-brand-muted-gold" />
              Free-tier infrastructure with no hidden costs
            </div>
            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
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
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-muted-gold px-8 py-4 text-base font-semibold text-brand-charcoal-base shadow-lg shadow-brand-muted-gold/20 transition hover:bg-brand-muted-gold-dark"
              >
                Start grading
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-full border border-brand-charcoal-border bg-brand-charcoal-card px-8 py-4 text-base font-semibold text-brand-offwhite transition hover:border-brand-muted-gold hover:text-brand-muted-gold"
              >
                Explore admin tools
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
            <div className="rounded-[2.5rem] border border-brand-charcoal-border bg-brand-charcoal-card p-8 shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
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
                className="rounded-3xl border border-brand-charcoal-border bg-brand-charcoal-card p-8 shadow-sm transition hover:-translate-y-1"
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-charcoal-base text-brand-muted-gold">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-brand-offwhite mb-3">
                  {highlight.title}
                </h3>
                <p className="text-brand-offwhite-muted leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            );
          })}
        </section>

        <section className="mt-24 rounded-[2.5rem] border border-brand-muted-gold/20 bg-brand-charcoal-card p-10 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
          <div className="grid gap-8 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-brand-charcoal-border bg-brand-charcoal-base p-6 text-center"
              >
                <p className="text-sm uppercase tracking-[0.35em] text-brand-offwhite-muted mb-3">
                  {stat.label}
                </p>
                <p className="text-4xl font-semibold text-brand-offwhite">
                  {stat.value}
                </p>
              </div>
            ))}
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
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-muted-gold px-8 py-4 text-base font-semibold text-brand-charcoal-base shadow-lg shadow-brand-muted-gold/20 transition hover:bg-brand-muted-gold-dark"
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
