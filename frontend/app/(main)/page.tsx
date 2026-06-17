'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, CheckCircle2, Circle, Clock, Flame, BarChart2 } from 'lucide-react';
import { fetchProblems, fetchUser } from '@/lib/api';
import { Problem, User } from '@/lib/types';
import { cn, getDifficultyColor, getDifficultyLabel } from '@/lib/utils';

export default function Dashboard() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProblems(), fetchUser()]).then(([probRes, userRes]) => {
      if (probRes.success) setProblems(probRes.data || []);
      if (userRes.success) setUser(userRes.data);
      setLoading(false);
    });
  }, []);

  const solvedCount = problems.filter(p => p.solved).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-brand-offwhite">Problem Set</h1>
          <p className="text-brand-offwhite-muted">{solvedCount} of {problems.length} problems solved</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
            <CheckCircle2 className="text-brand-success" size={20} />
            <div>
              <div className="text-sm font-bold leading-none mb-1">{solvedCount}</div>
              <div className="text-xs text-brand-offwhite-muted font-medium">Solved</div>
            </div>
          </div>
          <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 12 16" className="text-brand-muted-gold" fill="currentColor">
              <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
            </svg>
            <div>
              <div className="text-sm font-bold leading-none mb-1">{user?.xp?.toLocaleString() || 0}</div>
              <div className="text-xs text-brand-offwhite-muted font-medium">XP Earned</div>
            </div>
          </div>
          <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
            <BarChart2 className="text-brand-offwhite-muted" size={20} />
            <div>
              <div className="text-sm font-bold leading-none mb-1">7 days</div>
              <div className="text-xs text-brand-offwhite-muted font-medium">Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-4 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-offwhite-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search problems or tags..." 
            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-brand-offwhite placeholder:text-brand-offwhite-muted focus:outline-none focus:border-brand-muted-gold transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-between gap-4 bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg px-4 py-2.5 text-sm text-brand-offwhite-muted hover:text-brand-offwhite w-40 transition-colors">
            All Modules <ChevronDown size={14} />
          </button>
          <button className="flex items-center justify-between gap-4 bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg px-4 py-2.5 text-sm text-brand-offwhite-muted hover:text-brand-offwhite w-32 transition-colors">
            All Levels <ChevronDown size={14} />
          </button>
          
          <div className="flex items-center bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg p-1">
            <button className="px-5 py-1.5 rounded bg-brand-charcoal-hover text-brand-offwhite text-sm font-medium shadow-sm transition-colors">All</button>
            <button className="px-5 py-1.5 rounded text-brand-offwhite-muted hover:text-brand-offwhite text-sm font-medium transition-colors">Solved</button>
            <button className="px-5 py-1.5 rounded text-brand-offwhite-muted hover:text-brand-offwhite text-sm font-medium transition-colors">Unsolved</button>
          </div>
        </div>
      </div>

      <div className="text-sm text-brand-offwhite-muted font-medium">
        Showing {problems.length} of {problems.length} problems
      </div>

      {/* Problem Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="h-56 bg-brand-charcoal-card rounded-2xl animate-pulse"></div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map((problem, i) => (
            <Link 
              key={problem.id} 
              href={`/problems/${problem.slug}`}
              className="group block bg-brand-charcoal-card border border-brand-charcoal-border hover:border-brand-muted-gold/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-brand-muted-gold/5 hover:-translate-y-1 relative overflow-hidden"
              style={{ animationFillMode: 'both', animationDelay: (i * 100) + 'ms' }}
            >
              {/* Highlight bar for solved */}
              {problem.solved && (
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-success"></div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-brand-offwhite-muted">#{problem.slug === 'hello-world' ? '001' : '00' + (i+1)}</span>
                  <span className="bg-brand-charcoal-hover text-brand-offwhite-muted px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-brand-charcoal-border">{problem.module}</span>
                </div>
                {problem.solved ? (
                  <CheckCircle2 className="text-brand-success" size={20} />
                ) : (
                  <Circle className="text-brand-charcoal-border group-hover:text-brand-muted-gold/40 transition-colors" size={20} />
                )}
              </div>

              <h3 className="text-xl font-bold text-brand-offwhite mb-2 group-hover:text-brand-muted-gold transition-colors">{problem.title}</h3>
              
              <div className="flex items-center gap-1 mb-4">
                {/* Difficulty Stars */}
                {[...Array(5)].map((_, j) => (
                   <Flame key={j} size={14} className={j < problem.difficulty ? 'text-brand-error' : 'text-brand-charcoal-border'} />
                ))}
                <span className={cn("text-xs font-bold ml-2", getDifficultyColor(problem.difficulty))}>
                  {getDifficultyLabel(problem.difficulty)}
                </span>
              </div>

              <p className="text-sm text-brand-offwhite-muted line-clamp-2 h-10 mb-5">
                {problem.slug === 'hello-world' ? "Print 'Hello, World!' to stdout using Go's fmt package." : 
                 problem.slug === 'two-sum' ? "Find two numbers in a slice that add up to a target sum." :
                 "Implement a function to efficiently process standard typical input requirements."}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {problem.tags.map(tag => (
                  <span key={tag} className="text-xs bg-brand-charcoal-hover text-brand-offwhite-muted px-2 py-1 rounded-md border border-brand-charcoal-border">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-brand-offwhite-muted pt-4 border-t border-brand-charcoal-border/50">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><Clock size={14} /> {problem.estTimeMinutes}m</span>
                  <span className="flex items-center gap-1"><BarChart2 size={14} /> {problem.successRate}%</span>
                </div>
                <div className="font-bold flex items-center gap-1 text-brand-muted-gold">
                  <svg width="10" height="12" viewBox="0 0 12 16" fill="currentColor">
                    <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
                  </svg>
                  +{problem.xpReward} XP
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
