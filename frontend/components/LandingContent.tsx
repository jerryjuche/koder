"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";

export default function LandingContent({ onGetStarted }: { onGetStarted?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <>
      <Link
        href="/login"
        className="text-sm font-medium text-brand-offwhite-muted transition-colors hover:text-brand-offwhite"
      >
        Log in
      </Link>
      <Link
        href="/register"
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-muted-gold px-5 py-2 text-sm font-semibold text-brand-charcoal-base transition-all duration-300 hover:bg-brand-muted-gold-dark hover:shadow-[0_0_24px_rgba(212,175,55,0.3)]"
      >
        Get started
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </>
  );

  return (
    <div className="min-h-screen overflow-hidden bg-brand-charcoal-base text-brand-offwhite">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-brand-charcoal-border/60 bg-brand-charcoal-base/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Koder"
              width={36}
              height={36}
              className="rounded-xl"
            />
            <span className="text-lg font-bold tracking-tight">Koder</span>
          </Link>

          <div className="hidden items-center gap-4 sm:flex">{nav}</div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center rounded-lg border border-brand-charcoal-border p-2 sm:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-brand-charcoal-border/60 bg-brand-charcoal-card"
            >
              <div className="flex flex-col gap-3 px-4 py-4">
                <Link
                  href="/login"
                  className="rounded-xl border border-brand-charcoal-border px-4 py-2.5 text-center text-sm font-medium text-brand-offwhite-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-muted-gold px-4 py-2.5 text-sm font-semibold text-brand-charcoal-base"
                  onClick={() => setMobileOpen(false)}
                >
                  Get started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── SECTIONS ─── */}
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />

      {/* ─── FINAL CTA ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-brand-charcoal-border bg-gradient-to-br from-brand-charcoal-card to-brand-charcoal-panel px-8 py-16 text-center sm:px-16"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-brand-muted-gold/10 blur-[100px]" />
            <h2 className="relative text-3xl font-bold text-brand-offwhite md:text-5xl">
              Ready to start coding?
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-brand-offwhite-muted">
              No credit card. No setup. Just write code, submit, and learn —
              one problem at a time.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-brand-muted-gold to-brand-muted-gold-dark px-8 text-base font-semibold text-brand-charcoal-base shadow-[0_0_24px_rgba(212,175,55,0.2)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_36px_rgba(212,175,55,0.35)]"
              >
                Create free account
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-brand-charcoal-border bg-brand-charcoal-card/60 px-8 text-base font-semibold text-brand-offwhite backdrop-blur-sm transition-all duration-300 hover:border-brand-muted-gold/30 hover:text-brand-muted-gold"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
}
