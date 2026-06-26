import React from 'react';
import TopNav from '@/components/layout/TopNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-charcoal-base text-brand-offwhite">
      <TopNav />
      {/* Content area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
