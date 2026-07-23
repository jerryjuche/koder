import React from 'react';
import TopNav from '@/components/layout/TopNav';
import BroadcastBanner from '@/components/BroadcastBanner';
import FeedbackButtonWrapper from '@/components/FeedbackButtonWrapper';
import PyodidePreloader from '@/components/PyodidePreloader';
import { UserProvider } from '@/lib/UserContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <TopNav />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8">
          <BroadcastBanner />
          {children}
        </main>
        <FeedbackButtonWrapper />
        <PyodidePreloader />
      </div>
    </UserProvider>
  );
}
