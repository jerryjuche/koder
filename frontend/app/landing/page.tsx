import {
  ArrowRight,
  Code2,
  Zap,
  Trophy,
  Users,
  BookOpen,
  CheckCircle2,
  Flame,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Koder - Zero-Cost Automated Code Grading Platform",
  description:
    "Professional code grading platform for Go programming. Real-time feedback, zero infrastructure costs, fully automated evaluation.",
};

export default function LandingPage() {
  const features = [
    {
      icon: Code2,
      title: "Instant Code Evaluation",
      description:
        "Submit Go solutions and receive real-time feedback on test case results with detailed output logs.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Optimized execution engine with concurrent evaluation, delivering results in seconds.",
    },
    {
      icon: Trophy,
      title: "Global Leaderboard",
      description:
        "Compete with peers on a dynamic leaderboard tracking XP, solved problems, and performance metrics.",
    },
    {
      icon: Users,
      title: "Collaborative Learning",
      description:
        "Track progress across difficulty levels, earn achievements, and learn from community insights.",
    },
    {
      icon: BookOpen,
      title: "Rich Problem Library",
      description:
        "Access hundreds of carefully curated Go programming challenges with detailed hints and explanations.",
    },
    {
      icon: Flame,
      title: "Streak Tracking",
      description:
        "Maintain daily solving streaks and challenge yourself with consistent problem-solving.",
    },
  ];

  const stats = [
    { label: "Problems", value: "500+", icon: BookOpen },
    { label: "Daily Users", value: "2K+", icon: Users },
    { label: "Total Submissions", value: "50K+", icon: Code2 },
    { label: "Success Rate", value: "94%", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-charcoal-base via-brand-charcoal-panel to-brand-charcoal-base">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-brand-charcoal-base/80 border-b border-brand-charcoal-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-gold rounded-lg flex items-center justify-center">
              <Code2 className="w-6 h-6 text-brand-charcoal-base" />
            </div>
            <span className="text-xl font-bold text-brand-offwhite">KODER</span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-6 py-2 text-brand-offwhite hover:text-brand-gold transition font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal-base rounded-lg font-medium transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-brand-charcoal-card border border-brand-charcoal-border rounded-full">
          <Zap className="w-4 h-4 text-brand-gold" />
          <span className="text-sm text-brand-offwhite-muted">
            Zero-cost automated grading on free-tier infrastructure
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-brand-offwhite mb-6 leading-tight">
          Professional Go Code Grading
          <span className="block text-brand-gold">Simplified</span>
        </h1>

        <p className="text-lg text-brand-offwhite-muted max-w-2xl mx-auto mb-8">
          Master Go programming with instant feedback, real-time execution, and
          comprehensive progress tracking. Built for learners who demand
          professional-grade infrastructure without the cost.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/register"
            className="px-8 py-4 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal-base rounded-lg font-bold text-lg transition flex items-center justify-center gap-2 group"
          >
            Start Grading Code
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 border border-brand-charcoal-border hover:border-brand-gold text-brand-offwhite rounded-lg font-bold text-lg transition hover:text-brand-gold"
          >
            Sign In
          </Link>
        </div>

        {/* Hero Graphic */}
        <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-8 overflow-hidden">
          <div className="bg-brand-charcoal-base rounded-lg p-6 font-mono text-sm text-brand-offwhite">
            <div className="text-brand-offwhite-muted mb-4">
              <span className="text-brand-gold">$</span> koder submit
              solution.go
            </div>
            <div className="space-y-2">
              <div className="text-brand-success flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Test case 1: PASSED (12ms)
              </div>
              <div className="text-brand-success flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Test case 2: PASSED (8ms)
              </div>
              <div className="text-brand-error flex items-center gap-2">
                <span className="w-4 h-4">✕</span>
                Test case 3: FAILED (expected: 42, got: 41)
              </div>
              <div className="text-brand-success flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Test case 4: PASSED (15ms)
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-charcoal-border">
              <div className="text-brand-offwhite-muted">
                Result: 3/4 passed • 35ms total • +250 XP earned
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-offwhite mb-4">
            Why Choose Koder
          </h2>
          <p className="text-lg text-brand-offwhite-muted">
            Production-grade features without production-grade costs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl p-6 hover:border-brand-gold/50 transition group"
              >
                <div className="w-12 h-12 bg-brand-charcoal-panel rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-gold/10 transition">
                  <Icon className="w-6 h-6 text-brand-gold" />
                </div>
                <h3 className="text-lg font-bold text-brand-offwhite mb-2">
                  {feature.title}
                </h3>
                <p className="text-brand-offwhite-muted">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-brand-charcoal-card to-brand-charcoal-panel border border-brand-charcoal-border rounded-2xl p-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="flex justify-center mb-4">
                    <Icon className="w-8 h-8 text-brand-gold" />
                  </div>
                  <div className="text-3xl font-bold text-brand-gold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-brand-offwhite-muted font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-offwhite mb-4">
            How It Works
          </h2>
          <p className="text-lg text-brand-offwhite-muted">
            Four simple steps to master Go programming
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: "1",
              title: "Read Problem",
              desc: "Explore detailed problem statements with hints and examples",
            },
            {
              step: "2",
              title: "Write Code",
              desc: "Code in our Monaco editor with full Go syntax support",
            },
            {
              step: "3",
              title: "Submit",
              desc: "Get instant feedback on all test cases with execution times",
            },
            {
              step: "4",
              title: "Track Progress",
              desc: "Earn XP, maintain streaks, and climb the global leaderboard",
            },
          ].map((item, idx) => (
            <div key={idx} className="relative">
              <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl p-6 text-center h-full">
                <div className="w-12 h-12 bg-brand-gold text-brand-charcoal-base rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-brand-offwhite mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-brand-offwhite-muted">{item.desc}</p>
              </div>
              {idx < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-brand-gold to-transparent" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-brand-gold/10 to-brand-charcoal-card border border-brand-gold/30 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-brand-offwhite mb-4">
            Ready to Master Go?
          </h2>
          <p className="text-lg text-brand-offwhite-muted mb-8 max-w-2xl mx-auto">
            Join thousands of programmers learning Go on Koder. Start with zero
            setup, zero costs, immediate results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-brand-gold hover:bg-brand-gold-dark text-brand-charcoal-base rounded-lg font-bold text-lg transition"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border border-brand-gold text-brand-gold hover:bg-brand-gold/10 rounded-lg font-bold text-lg transition"
            >
              Already a Member?
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-charcoal-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-brand-charcoal-base" />
                </div>
                <span className="font-bold text-brand-offwhite">KODER</span>
              </div>
              <p className="text-sm text-brand-offwhite-muted">
                Zero-cost code grading for Go programming.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-brand-offwhite mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-brand-offwhite-muted">
                <li>
                  <a href="#" className="hover:text-brand-gold transition">
                    Problems
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-gold transition">
                    Leaderboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-gold transition">
                    Dashboard
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-brand-offwhite mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-brand-offwhite-muted">
                <li>
                  <a href="#" className="hover:text-brand-gold transition">
                    Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-gold transition">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-gold transition">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-brand-offwhite mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-brand-offwhite-muted">
                <li>
                  <a href="#" className="hover:text-brand-gold transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-gold transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-gold transition">
                    License
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-brand-charcoal-border pt-8 text-center text-sm text-brand-offwhite-muted">
            <p>
              © 2026 Koder. All rights reserved. Built on zero-cost
              infrastructure.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
