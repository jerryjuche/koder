'use client';

import { motion } from 'motion/react';
import { BookOpen, Code, RefreshCcw, Award } from 'lucide-react';

const steps = [
  {
    icon: BookOpen,
    title: "Choose a Challenge",
    description:
      "Select from hundreds of curated problems spanning algorithms, data structures, concurrency, and everything in between.",
  },
  {
    icon: Code,
    title: "Write Your Solution",
    description:
      "Draft your code in our Monaco-powered editor with syntax highlighting, autocomplete, and instant diagnostics for Go and Python.",
  },
  {
    icon: RefreshCcw,
    title: "Run & Receive Feedback",
    description:
      "Execute against automated test suites with per-case pass/fail results, unified diffs, and wall-clock runtime metrics.",
  },
  {
    icon: Award,
    title: "Rank Up & Repeat",
    description:
      "Earn XP per solved problem, climb the leaderboard, build streaks, and watch your module proficiency grow over time.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-brand-charcoal-card opacity-20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-brand-offwhite md:text-5xl">
            How it works
          </h2>
          <p className="mx-auto max-w-2xl text-brand-offwhite-muted">
            A frictionless learning loop designed to build your coding muscle
            memory fast.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Connecting line for desktop */}
          <div className="absolute left-[12.5%] right-[12.5%] top-12 hidden h-[2px] bg-gradient-to-r from-transparent via-brand-charcoal-border to-transparent md:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-brand-charcoal-border bg-brand-charcoal-card text-brand-muted-gold transition-all duration-300 hover:border-brand-muted-gold/40 hover:shadow-[0_0_25px_rgba(212,175,55,0.1)]">
                  <Icon size={32} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-offwhite">
                  {step.title}
                </h3>
                <p className="text-brand-offwhite-muted">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
