'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Code2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-muted-gold/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-charcoal-card border border-brand-charcoal-border text-brand-muted-gold text-sm font-medium mb-8"
        >
          <Code2 size={16} />
          <span>The Ultimate Automated Grading Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
        >
          Master Go & Python with <br className="hidden md:block" />
          <span className="text-brand-muted-gold">Instant Feedback</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-brand-offwhite-muted max-w-2xl mx-auto mb-10"
        >
          Learn coding efficiently with real-time execution in secure sandboxes, AI-powered problem enrichment, and community-driven curricula.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/problems"
            className="w-full sm:w-auto px-8 py-4 bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Start Learning Go
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/problems"
            className="w-full sm:w-auto px-8 py-4 bg-brand-charcoal-card border border-brand-charcoal-border hover:bg-brand-charcoal-hover text-brand-offwhite font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Start Learning Python
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
