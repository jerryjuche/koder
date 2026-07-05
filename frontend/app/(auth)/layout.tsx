import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-charcoal-base text-brand-offwhite p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-charcoal-hover blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-muted-gold/5 blur-[100px]"></div>
      </div>
      
      <div className="w-full max-w-md z-10 relative">
        {children}
      </div>

    </div>
  );
}
