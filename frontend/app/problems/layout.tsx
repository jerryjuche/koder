import React from 'react';
import TopNav from '@/components/layout/TopNav';
import FeedbackButton from '@/components/FeedbackButton';
import { UserProvider } from '@/lib/UserContext';

export default function ProblemsLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <TopNav />
        {children}
        <FeedbackButton />
      </div>
    </UserProvider>
  );
}
