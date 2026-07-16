import React from 'react';
import FeedbackButton from '@/components/FeedbackButton';
import PyodidePreloader from '@/components/PyodidePreloader';
import { UserProvider } from '@/lib/UserContext';

export default function ProblemsLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {children}
        <FeedbackButton />
        <PyodidePreloader />
      </div>
    </UserProvider>
  );
}
