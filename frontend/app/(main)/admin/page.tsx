'use client';

import React, { useState } from 'react';
import { Settings, FileText, Activity, AlertCircle, Github, Wand2, Search, MoreHorizontal, CheckCircle2, Clock, GitCommit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ingestGitHubRepo, enrichAllProblems } from '@/lib/api';

export default function AdminDashboard() {
  const [ingestUrl, setIngestUrl] = useState('https://github.com/cs3100/go-assignments');
  const [ingesting, setIngesting] = useState(false);

  const handleIngest = async () => {
    setIngesting(true);
    await ingestGitHubRepo(ingestUrl);
    setIngesting(false);
  };

  const activityLogs = [
    { type: 'success', msg: "Problem 'fibonacci-sequence' graded successfully (batch: 12 submissions)", icon: CheckCircle2, color: 'text-brand-success' },
    { type: 'info', msg: "User s2022003 submitted solution for 'two-sum'", icon: GitCommit, color: 'text-brand-offwhite' },
    { type: 'warning', msg: "Problem 'json-parser' test runner timeout — retrying (1/3)", icon: AlertCircle, color: 'text-brand-muted-gold' },
    { type: 'success', msg: "GitHub repo ingested: 3 new problems queued for enrichment", icon: Github, color: 'text-brand-success' },
    { type: 'info', msg: "Leaderboard recalculated — 342 students ranked", icon: Activity, color: 'text-brand-offwhite' },
    { type: 'error', msg: "Problem 'json-parser' enrichment failed: LLM rate limit hit", icon: AlertCircle, color: 'text-brand-error' },
    { type: 'success', msg: "Problem 'goroutine-counter' made visible", icon: CheckCircle2, color: 'text-brand-success' },
    { type: 'info', msg: "Cron: Running nightly XP decay pass", icon: GitCommit, color: 'text-brand-offwhite' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-offwhite mb-2">Admin Dashboard</h1>
          <p className="text-brand-offwhite-muted">Manage problems, content ingestion, and platform operations</p>
        </div>
        <div className="bg-[#1A2521] border border-brand-success/30 text-brand-success px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse"></div>
          All systems operational
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-6">
          <FileText size={20} className="text-brand-muted-gold mb-4" />
          <div className="text-3xl font-bold text-brand-offwhite mb-1">10</div>
          <div className="text-sm text-brand-offwhite-muted font-medium">Total Problems</div>
        </div>
        <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-6">
          <CheckCircle2 size={20} className="text-brand-success mb-4" />
          <div className="text-3xl font-bold text-brand-offwhite mb-1">6</div>
          <div className="text-sm text-brand-offwhite-muted font-medium">Active Problems</div>
        </div>
        <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-6">
          <Activity size={20} className="text-[#8DB4B9] mb-4" />
          <div className="text-3xl font-bold text-brand-offwhite mb-1">1,587</div>
          <div className="text-sm text-brand-offwhite-muted font-medium">Total Submissions</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-brand-charcoal-card border border-brand-charcoal-border hover:border-brand-muted-gold/30 transition-colors rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Github size={100} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-brand-offwhite font-bold mb-1">
                  <Github className="text-brand-offwhite" size={20} /> Ingest GitHub Repo
                </div>
                <p className="text-sm text-brand-offwhite-muted mb-6">Pull problems from repository</p>
                <input 
                  value={ingestUrl}
                  onChange={(e) => setIngestUrl(e.target.value)}
                  className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg px-4 py-2 text-sm text-brand-offwhite mb-4 focus:outline-none focus:border-brand-muted-gold"
                />
                <button 
                  onClick={handleIngest}
                  disabled={ingesting}
                  className="w-full bg-brand-charcoal-base border border-brand-charcoal-border hover:bg-brand-charcoal-hover text-brand-offwhite py-2.5 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors disabled:opacity-50"
                >
                  {ingesting ? <Activity className="animate-spin" size={18} /> : <Github size={18} />}
                  {ingesting ? 'Ingesting...' : 'Ingest Repository'}
                </button>
              </div>
            </div>

            <div className="bg-brand-charcoal-card border border-brand-muted-gold/30 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity flex">
                <Wand2 size={100} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-brand-offwhite font-bold mb-1">
                  <Wand2 className="text-brand-muted-gold" size={20} /> Enrich All Problems
                </div>
                <p className="text-sm text-brand-offwhite-muted mb-6">AI-generate hints, tags & difficulty</p>
                
                <div className="space-y-3 mb-6 font-mono text-xs">
                  <div className="flex justify-between border-b border-brand-charcoal-border/50 pb-2">
                    <span className="text-brand-offwhite-muted">Last enrichment</span>
                    <span className="text-brand-offwhite">2 hours ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-offwhite-muted">Problems pending</span>
                    <span className="text-brand-muted-gold font-bold">3 drafts</span>
                  </div>
                </div>

                <button 
                  onClick={async () => {
                    const btn = document.getElementById('enrich-btn');
                    if (btn) btn.textContent = 'Enriching...';
                    await enrichAllProblems();
                    if (btn) btn.textContent = 'Enrich All Problems';
                  }}
                  id="enrich-btn"
                  className="w-full bg-transparent border border-brand-muted-gold text-brand-muted-gold hover:bg-brand-muted-gold hover:text-brand-charcoal-base py-2.5 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors"
                >
                  <Wand2 size={18} /> Enrich All Problems
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-brand-charcoal-border flex justify-between items-center">
              <div className="font-bold flex items-center gap-2 text-brand-offwhite">
                <FileText size={18} className="text-brand-offwhite" /> Problems <span className="text-xs bg-brand-charcoal-hover text-brand-offwhite-muted px-2 py-0.5 rounded-full">10</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-offwhite-muted" size={14} />
                <input type="text" placeholder="Filter problems..." className="bg-brand-charcoal-base border border-brand-charcoal-border rounded text-sm px-8 py-1.5 focus:outline-none focus:border-brand-muted-gold w-64" />
              </div>
            </div>
            
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-brand-offwhite-muted uppercase tracking-wider border-b border-brand-charcoal-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Problem</th>
                  <th className="px-6 py-4 font-medium">Module</th>
                  <th className="px-6 py-4 font-medium">Diff.</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Visible</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-charcoal-border/50">
                {[
                  { title: 'Hello, World!', slug: 'hello-world', mod: 'Basics', diff: 'Beginner', diffColor: 'text-brand-success', status: 'active' },
                  { title: 'Fibonacci Sequence', slug: 'fibonacci-sequence', mod: 'Recursion', diff: 'Easy', diffColor: 'text-[#8DB4B9]', status: 'active' },
                  { title: 'Two Sum', slug: 'two-sum', mod: 'Arrays', diff: 'Easy', diffColor: 'text-[#8DB4B9]', status: 'active' },
                  { title: 'Reverse a Linked List', slug: 'linked-list-reversal', mod: 'Data Structures', diff: 'Medium', diffColor: 'text-brand-muted-gold', status: 'active' },
                  { title: 'Binary Search', slug: 'binary-search', mod: 'Algorithms', diff: 'Easy', diffColor: 'text-[#8DB4B9]', status: 'draft' },
                  { title: 'Concurrent Counter', slug: 'goroutine-counter', mod: 'Concurrency', diff: 'Hard', diffColor: 'text-brand-error', status: 'active' },
                  { title: 'Merge Sort', slug: 'merge-sort', mod: 'Algorithms', diff: 'Medium', diffColor: 'text-brand-muted-gold', status: 'draft' },
                  { title: 'JSON Decoder', slug: 'json-parser', mod: 'Standard Library', diff: 'Medium', diffColor: 'text-brand-muted-gold', status: 'error' },
                  { title: 'Channel Pipeline', slug: 'channel-pipeline', mod: 'Concurrency', diff: 'Expert', diffColor: 'text-[#C96464]', status: 'draft' },
                ].map((p, i) => (
                  <tr key={i} className="hover:bg-brand-charcoal-hover/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-brand-offwhite">{p.title}</div>
                      <div className="text-xs text-brand-offwhite-muted font-mono">{p.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-brand-offwhite-muted">{p.mod}</td>
                    <td className={cn("px-6 py-4 font-medium", p.diffColor)}>{p.diff}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded font-medium",
                        p.status === 'active' ? "bg-brand-success/10 text-brand-success border border-brand-success/20" :
                        p.status === 'error' ? "bg-brand-error/10 text-brand-error border border-brand-error/20" :
                        "bg-brand-offwhite-muted/10 text-brand-offwhite-muted border border-brand-offwhite-muted/20"
                      )}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn("w-10 h-5 rounded-full relative cursor-pointer opacity-80 hover:opacity-100 transition-opacity", p.status === 'active' ? 'bg-brand-success' : 'bg-brand-charcoal-border')}>
                        <div className={cn("w-3 h-3 bg-white rounded-full absolute top-1 transition-all", p.status === 'active' ? 'right-1' : 'left-1')}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-brand-offwhite-muted hover:text-brand-offwhite"><MoreHorizontal size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden flex flex-col h-[700px]">
          <div className="p-5 border-b border-brand-charcoal-border flex justify-between items-center shrink-0">
            <h3 className="font-bold text-brand-offwhite flex items-center gap-2"><Activity size={18} className="text-brand-offwhite-muted" /> Activity Log</h3>
            <div className="text-xs font-bold text-brand-success flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-brand-success"></div> Live</div>
          </div>
          <div className="p-5 space-y-6 overflow-y-auto overflow-x-hidden flex-1 scrollbar-hide">
             {activityLogs.map((log, i) => {
               const Icon = log.icon;
               return (
                 <div key={i} className="flex gap-4 relative animate-in slide-in-from-right-4 fade-in" style={{ animationDelay: (i * 100) + 'ms', animationFillMode: 'both' }}>
                   <div className="relative z-10 shrink-0 bg-brand-charcoal-card">
                     <Icon size={16} className={log.color} />
                   </div>
                   {i !== activityLogs.length - 1 && (
                     <div className="absolute left-2 top-4 bottom-[-24px] w-px bg-brand-charcoal-border z-0"></div>
                   )}
                   <p className="text-sm text-brand-offwhite-muted leading-tight pt-0.5">{log.msg}</p>
                 </div>
               )
             })}
          </div>
        </div>
      </div>
    </div>
  );
}
