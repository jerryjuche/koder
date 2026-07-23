import React from 'react';
import TopNav from '@/components/layout/TopNav';
import BroadcastBanner from '@/components/BroadcastBanner';
import FeedbackButtonWrapper from '@/components/FeedbackButtonWrapper';
import PyodidePreloader from '@/components/PyodidePreloader';
import PixelSnow from '@/components/PixelSnow';
import { UserProvider } from '@/lib/UserContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="relative z-0 bg-background text-foreground min-h-screen">
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{ contain: 'layout style paint' }}
          aria-hidden="true"
        >
          <PixelSnow
            color="#D4AF37"
            density={0.2}
            speed={0.8}
            brightness={0.35}
            variant="snowflake"
            direction={160}
            flakeSize={0.008}
            minFlakeSize={0.8}
            pixelResolution={250}
            depthFade={10}
            farPlane={25}
          />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <TopNav />
          <main className="flex-1 w-full px-4 sm:px-6 lg:px-8">
            <BroadcastBanner />
            {children}
          </main>
          <FeedbackButtonWrapper />
          <PyodidePreloader />
        </div>
      </div>
    </UserProvider>
  );
}
