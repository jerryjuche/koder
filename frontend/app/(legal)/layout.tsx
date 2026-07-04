import React from 'react';
import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-charcoal-base text-brand-offwhite">
      <header className="border-b border-brand-charcoal-border">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="font-mono text-sm font-semibold text-brand-muted-gold tracking-tight no-underline">
            <span className="opacity-50">&gt; </span>koder
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        {children}
      </main>

      <footer className="border-t border-brand-charcoal-border text-center py-6 text-brand-offwhite-muted text-xs font-mono">
        &copy; {new Date().getFullYear()} Koder &nbsp;·&nbsp; Built for constraint, engineered for correctness.
      </footer>
    </div>
  );
}
