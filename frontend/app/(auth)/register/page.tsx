'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Code2, ArrowRight } from 'lucide-react';
import { register } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await register({
        student_id: studentId || email,
        name: `${firstName} ${lastName}`.trim(),
        password
      });
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        router.push('/');
      } else {
        setErrorMsg(res.error?.message || 'Registration failed');
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
        <h1 className="text-2xl font-bold text-brand-offwhite mb-2">Create an account</h1>
        <p className="text-brand-offwhite-muted text-sm">Join ZeroJudge to start solving problems.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="bg-brand-error/10 border border-brand-error/20 text-brand-error px-4 py-3 rounded-xl text-sm">
            {errorMsg}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted mb-2">First Name</label>
            <input 
              type="text" 
              required
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-4 py-3 text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors"
              placeholder="Ada"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted mb-2">Last Name</label>
            <input 
              type="text" 
              required
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-4 py-3 text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors"
              placeholder="Lovelace"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted mb-2">Email Address</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-4 py-3 text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors"
            placeholder="student@university.edu"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted mb-2">Student ID (Optional)</label>
          <input 
            type="text" 
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-4 py-3 text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors"
            placeholder="e.g. s1234567"
          />
        </div>

        <div>
           <label className="block text-xs font-bold uppercase tracking-wider text-brand-offwhite-muted mb-2">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-4 py-3 text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors"
            placeholder="Create a strong password"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-muted-gold/20 flex justify-center items-center gap-2 group mt-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-brand-charcoal-base/30 border-t-brand-charcoal-base rounded-full animate-spin" />
          ) : (
            <>Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-brand-offwhite-muted mt-8">
        Already have an account? <Link href="/login" className="text-brand-offwhite font-bold hover:text-brand-muted-gold transition-colors">Sign In</Link>
      </p>
    </div>
  );
}
