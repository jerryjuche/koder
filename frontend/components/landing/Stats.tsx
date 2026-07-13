'use client';

import { motion } from 'motion/react';

const stats = [
  { value: "50K+", label: "Submissions" },
  { value: "10K+", label: "Active Learners" },
  { value: "500+", label: "Curated Problems" },
  { value: "99.9%", label: "Sandbox Uptime" }
];

export default function Stats() {
  return (
    <section className="py-20 border-y border-brand-charcoal-border bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-brand-muted-gold mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-brand-offwhite-muted uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
