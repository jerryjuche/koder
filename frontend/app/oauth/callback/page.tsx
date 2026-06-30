'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function OAuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      // Scrub token from URL bar and browser history immediately
      window.history.replaceState({}, document.title, '/');
      router.push('/');
    } else {
      window.history.replaceState({}, document.title, '/login');
      if (error === 'invalid_state') {
        // silent redirect — CSRF mismatch
      } else if (error) {
        // silent redirect for any other error
      }
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-charcoal-base">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-brand-muted-gold/30 border-t-brand-muted-gold rounded-full animate-spin" />
        <p className="text-brand-offwhite-muted text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-brand-charcoal-base">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-muted-gold/30 border-t-brand-muted-gold rounded-full animate-spin" />
          <p className="text-brand-offwhite-muted text-sm">Completing sign in...</p>
        </div>
      </div>
    }>
      <OAuthCallbackInner />
    </Suspense>
  );
}
