'use client';

import { motion } from 'motion/react';

const testimonials = [
  {
    quote: "Koder completely changed how I learn Go. The instant feedback and clean editor make working through concurrency problems a breeze.",
    author: "Sarah Chen",
    role: "Backend Developer",
    initials: "SC"
  },
  {
    quote: "The Python curriculum is incredibly well structured. The AI-generated hints are just enough to keep me unstuck without giving the answer away.",
    author: "James Wilson",
    role: "Data Scientist",
    initials: "JW"
  },
  {
    quote: "I love the community aspect. Contributing my own problems and seeing others solve them on the leaderboard is super motivating.",
    author: "Elena Rodriguez",
    role: "Computer Science Student",
    initials: "ER"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-brand-charcoal-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Loved by Developers</h2>
          <p className="text-brand-offwhite-muted max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our community has to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-brand-charcoal-card border border-brand-charcoal-border p-8 rounded-2xl flex flex-col"
            >
              <div className="flex-1">
                <div className="flex gap-1 text-brand-muted-gold mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-brand-offwhite mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-charcoal-hover border border-brand-charcoal-border flex items-center justify-center font-bold text-brand-muted-gold">
                  {testimonial.initials}
                </div>
                <div>
                  <div className="font-bold text-white">{testimonial.author}</div>
                  <div className="text-sm text-brand-offwhite-muted">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
