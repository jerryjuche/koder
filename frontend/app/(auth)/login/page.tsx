'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Code2, ArrowRight, GitBranch } from 'lucide-react';
import { login, API_BASE } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await login({ student_id: studentId, password });
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        router.push('/');
      } else {
        setErrorMsg(res.error?.message || 'Login failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
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
        {errorMsg && (
          <div className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm">
            {errorMsg}
          </div>
        )}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted mb-2">Student ID / Email</label>
          <input 
            type="text" 
            required
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
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
            value={password}
            onChange={e => setPassword(e.target.value)}
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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-brand-charcoal-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-brand-charcoal-card px-2 text-brand-offwhite-muted">or</span>
        </div>
      </div>

      <a
        href={`${API_BASE}/auth/gitea/login`}
        className="w-full flex items-center justify-center gap-2 border border-brand-charcoal-border rounded-xl py-3 text-brand-offwhite hover:bg-brand-charcoal-hover transition text-sm font-medium"
      >
        <GitBranch size={18} />
        Sign in with Gitea
      </a>

      <p className="text-center text-sm text-brand-offwhite-muted mt-8">
        Don&apos;t have an account? <Link href="/register" className="text-brand-offwhite font-bold hover:text-brand-muted-gold transition-colors">Apply for access</Link>
      </p>
    </div>
  );
}
