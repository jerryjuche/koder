import React from 'react';
import TopNav from '@/components/layout/TopNav';
import BroadcastBanner from '@/components/BroadcastBanner';
import FeedbackButtonWrapper from '@/components/FeedbackButtonWrapper';
import PyodidePreloader from '@/components/PyodidePreloader';
import { UserProvider } from '@/lib/UserContext';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="relative min-h-screen flex flex-col bg-background text-foreground">
        {/* Subtle animated hexagon grid — ambient background texture */}
        <AnimatedBackground fadeEnd="75%" opacity={0.75} />
        <TopNav />
        <main className="relative z-10 flex-1 w-full px-4 sm:px-6 lg:px-8 pt-6">
          <BroadcastBanner />
          {children}
        </main>
        <FeedbackButtonWrapper />
        <PyodidePreloader />
      </div>
    </UserProvider>
  );
}
