'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Code2, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

const wordVariants = {
  hidden: { opacity: 0, filter: "blur(4px)", y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: "easeOut" },
  }),
};

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.95]);

  return (
    <motion.section
      ref={ref}
      style={{ opacity: heroOpacity, scale: heroScale }}
      className="relative min-h-[90vh] flex items-center overflow-hidden"
    >
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
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-charcoal-border bg-brand-charcoal-card/60 px-4 py-1.5 text-sm font-medium text-brand-muted-gold/90 backdrop-blur-sm"
          >
            <Code2 size={14} />
            <span>Automated Code Grading Platform</span>
          </motion.div>

          {/* Headline with word animation */}
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {"Master Go & Python with Instant Feedback."
              .split(" ")
              .map((word, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={wordVariants}
                  className={cn(
                    "mr-2 inline-block align-middle",
                    word === "Instant" || word === "Feedback."
                      ? "bg-gradient-to-r from-brand-offwhite via-[#f0e6c5] to-brand-offwhite bg-clip-text text-transparent"
                      : "text-brand-offwhite",
                  )}
                >
                  {word === "Go" || word === "Python" ? (
                    <span className="text-brand-muted-gold">{word}</span>
                  ) : (
                    word
                  )}
                </motion.span>
              ))}
          </h1>

          {/* Subtitle */}
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

          {/* CTAs */}
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
              Start learning
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
  );
}
