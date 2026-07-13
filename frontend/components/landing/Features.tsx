'use client';

import { motion } from 'motion/react';
import { Terminal, Bot, Globe2, Users, Trophy, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: "Secure Sandbox Execution",
    description: "Write and run Go and Python code safely in isolated environments with real-time feedback and performance metrics."
  },
  {
    icon: Bot,
    title: "AI Problem Generation",
    description: "Never run out of challenges. Our AI enriches the curriculum by generating tailored problems and hints."
  },
  {
    icon: Globe2,
    title: "Seamless Multi-Language",
    description: "Switch between Go and Python effortlessly. Learn multiple paradigms within the same unified platform."
  },
  {
    icon: Users,
    title: "Community Contributions",
    description: "Create and share your own coding problems. Earn recognition as our admins moderate and publish community content."
  },
  {
    icon: Terminal,
    title: "Professional Editor",
    description: "Code comfortably in a dark-mode Monaco editor featuring syntax highlighting, autocomplete, and vim mode."
  },
  {
    icon: Trophy,
    title: "Leaderboards & Progress",
    description: "Track your journey, earn experience points, rank up, and compete globally on the leaderboard."
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-[#0a0a0a] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Everything you need to master coding</h2>
          <p className="text-brand-offwhite-muted max-w-2xl mx-auto">
            Koder provides a comprehensive suite of tools designed to accelerate your learning and keep you engaged.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-brand-charcoal-card border border-brand-charcoal-border p-8 rounded-2xl hover:border-brand-muted-gold/50 transition-colors"
              >
                <div className="w-12 h-12 bg-brand-muted-gold/10 rounded-xl flex items-center justify-center text-brand-muted-gold mb-6">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-brand-offwhite-muted leading-relaxed">
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
