import React from 'react';
import FeedbackButtonWrapper from '@/components/FeedbackButtonWrapper';
import PyodidePreloader from '@/components/PyodidePreloader';
import { UserProvider } from '@/lib/UserContext';

export default function ProblemsLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {children}
        <FeedbackButtonWrapper />
        <PyodidePreloader />
      </div>
    </UserProvider>
  );
}
