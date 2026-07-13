'use client';

import { motion } from 'motion/react';
import { Terminal, Bot, Globe2, Users, ShieldCheck, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: "Secure Sandbox Execution",
    description:
      "Write and run Go and Python code in fully isolated environments with deterministic results, performance metrics, and zero cross-contamination between executions.",
  },
  {
    icon: Bot,
    title: "AI-Powered Enrichment",
    description:
      "Every problem spec is transformed by AI into structured test cases, hints, and dual-language scaffolding — no manual test writing required.",
  },
  {
    icon: Globe2,
    title: "Seamless Multi-Language",
    description:
      "Switch between Go and Python on any problem. Master systems programming and data science paradigms within a single unified platform.",
  },
  {
    icon: Users,
    title: "Vibrant Community",
    description:
      "Create and share your own coding problems, learn from community best-practice solutions, and climb the global leaderboard.",
  },
  {
    icon: Terminal,
    title: "Professional Monaco Editor",
    description:
      "A full-featured IDE in the browser with syntax highlighting for Go and Python, autocomplete, error diagnostics, and keyboard shortcuts.",
  },
  {
    icon: BarChart3,
    title: "Progress & Analytics",
    description:
      "Track your solved count, XP curve, module proficiency, contribution streaks, and see exactly where you stand on the global rankings.",
  },
];

export default function Features() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-brand-offwhite md:text-5xl">
            Everything you need to master coding
          </h2>
          <p className="mx-auto max-w-2xl text-brand-offwhite-muted">
            Koder provides a comprehensive suite of tools designed to accelerate
            your learning and keep you engaged.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-2xl border border-brand-charcoal-border bg-brand-charcoal-card p-8 transition-all duration-300 hover:border-brand-muted-gold/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.06)]"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-muted-gold/10 text-brand-muted-gold transition-transform duration-300 group-hover:scale-110">
                  <Icon size={24} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-offwhite">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-brand-offwhite-muted">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
