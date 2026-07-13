'use client';

import { motion } from 'motion/react';
import { BookOpen, Code, RefreshCcw, Award } from 'lucide-react';

const steps = [
  {
    icon: BookOpen,
    title: "Choose a Challenge",
    description: "Select from hundreds of curated problems ranging from algorithms to concurrent programming."
  },
  {
    icon: Code,
    title: "Write Your Code",
    description: "Draft your solution in our robust, integrated Monaco editor in Go or Python."
  },
  {
    icon: RefreshCcw,
    title: "Instant Execution",
    description: "Run your code against our automated test suites and get real-time feedback on correctness and performance."
  },
  {
    icon: Award,
    title: "Earn XP & Rank Up",
    description: "Solve problems to gain experience points, climb the leaderboard, and showcase your skills."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-brand-charcoal-base relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-charcoal-card rounded-full blur-3xl opacity-20 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How it works</h2>
          <p className="text-brand-offwhite-muted max-w-2xl mx-auto">
            A frictionless learning loop designed to build your coding muscle memory fast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-[2px] bg-brand-charcoal-border" />
          
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
                <div className="w-24 h-24 mx-auto bg-brand-charcoal-card border-2 border-brand-charcoal-border rounded-full flex items-center justify-center text-brand-muted-gold mb-6 relative z-10">
                  <Icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-brand-offwhite-muted">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
