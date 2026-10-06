import React from 'react';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import BroadcastBanner from '@/components/BroadcastBanner';
import FeedbackButtonWrapper from '@/components/FeedbackButtonWrapper';
import PyodidePreloader from '@/components/PyodidePreloader';
import MonacoPreloader from '@/components/MonacoPreloader';
import { UserProvider } from '@/lib/UserContext';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="relative min-h-dvh flex flex-col bg-background text-foreground">
        {/* Subtle animated hexagon grid — ambient background texture */}
        <AnimatedBackground fadeEnd="75%" opacity={0.75} />
        <TopNav />
        {/* Bottom padding mirrors --tabbar-height: the tab bar is fixed, so
            content has to reserve its own room or the last card on every
            screen would sit under the bar. Collapses at `nav:` where the
            desktop TopNav links take over. */}
        <main className="relative z-10 flex-1 w-full pb-[var(--tabbar-height)] nav:pb-0">
          <BroadcastBanner />
          {children}
        </main>
        <MobileTabBar />
        <FeedbackButtonWrapper />
        <PyodidePreloader />
        <MonacoPreloader />
      </div>
    </UserProvider>
  );
}
