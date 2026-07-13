'use client';

import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: "50K+", label: "Submissions" },
  { value: "10K+", label: "Active Learners" },
  { value: "500+", label: "Curated Problems" },
  { value: "99.9%", label: "Sandbox Uptime" },
];

function AnimatedStat({ value, label, index }: { value: string; label: string; index: number }) {
  const [displayed, setDisplayed] = useState("0");
  const ref = useRef(null);
  const num = parseInt(value.replace(/\D/g, ""));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const isPercent = value.includes("%");
          const end = num;
          const duration = 1500;
          const stepTime = Math.max(16, duration / end);

          const timer = setInterval(() => {
            start += Math.ceil(end / 40);
            if (start >= end) {
              start = end;
              clearInterval(timer);
            }
            setDisplayed(isPercent ? `${start}%` : `${start}+`);
          }, stepTime);

          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [num, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="text-center"
    >
      <div className="mb-2 text-4xl font-bold text-brand-muted-gold md:text-5xl">
        {displayed}
      </div>
      <div className="text-sm font-medium uppercase tracking-wider text-brand-offwhite-muted">
        {label}
      </div>
    </motion.div>
  );
}

export default function Stats() {
  return (
    <section className="border-y border-brand-charcoal-border py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <AnimatedStat key={index} value={stat.value} label={stat.label} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
