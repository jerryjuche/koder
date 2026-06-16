'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Code2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  return (
    <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-center mb-6">
        <div className="bg-brand-muted-gold p-2 rounded-xl text-brand-charcoal-base shadow-lg shadow-brand-muted-gold/20">
          <Code2 size={32} className="stroke-[2.5]" />
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-brand-offwhite mb-2">Welcome back</h1>
        <p className="text-brand-offwhite-muted text-sm">Sign in to ZeroJudge to continue computing.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted mb-2">Email Address</label>
          <input 
            type="email" 
            required
            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-4 py-3 text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors"
            placeholder="student@university.edu"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted">Password</label>
            <Link href="#" className="text-xs text-brand-muted-gold hover:text-brand-muted-gold-dark">Forgot password?</Link>
          </div>
          <input 
            type="password" 
            required
            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-4 py-3 text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-muted-gold/20 flex justify-center items-center gap-2 group mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-brand-charcoal-base/30 border-t-brand-charcoal-base rounded-full animate-spin" />
          ) : (
            <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-brand-offwhite-muted mt-8">
        Don&apos;t have an account? <Link href="/register" className="text-brand-offwhite font-bold hover:text-brand-muted-gold transition-colors">Apply for access</Link>
      </p>
    </div>
  );
}
