'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Activity, AlertCircle, Github, Wand2, Search, MoreHorizontal, CheckCircle2, GitCommit, LucideIcon, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ingestGitHubRepo, enrichAllProblems, fetchAdminStats, fetchAdminActivity, fetchAllProblemsAdmin, fetchUser, toggleProblemVisibility, publishAllDrafts } from '@/lib/api';
import { toast } from '@/lib/toast';
import { AdminStats, ActivityLog, Problem } from '@/lib/types';
import PendingContributions from './PendingContributions';

const ICON_MAP: Record<string, LucideIcon> = {
  CheckCircle2,
  GitCommit,
  AlertCircle,
  Github,
  Activity,
  Wand2,
};

export default function AdminDashboard() {
  const router = useRouter();
  const [ingestUrl, setIngestUrl] = useState('https://github.com/cs3100/go-assignments');
  const [ingesting, setIngesting] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    const [statsRes, logsRes, problemsRes] = await Promise.all([
      fetchAdminStats(),
      fetchAdminActivity(),
      fetchAllProblemsAdmin()
    ]);

    if (statsRes.success && statsRes.data) setStats(statsRes.data);
    if (logsRes.success && logsRes.data) setActivityLogs(logsRes.data);
    if (problemsRes.success && problemsRes.data) setProblems(problemsRes.data);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const userRes = await fetchUser();
      if (cancelled) return;
      
      if (!userRes.success || userRes.data?.role !== 'admin') {
        router.push('/');
        return;
      }
      setIsAuthorized(true);

      const [statsRes, logsRes, problemsRes] = await Promise.all([
        fetchAdminStats(),
        fetchAdminActivity(),
        fetchAllProblemsAdmin()
      ]);

      if (cancelled) return;

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (logsRes.success && logsRes.data) setActivityLogs(logsRes.data);
      if (problemsRes.success && problemsRes.data) setProblems(problemsRes.data);
    };

    load();
    const interval = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [router]);

  const handleIngest = async () => {
    if (!ingestUrl.trim()) {
      toast.error("Please enter at least one GitHub URL");
      return;
    }
    
    setIngesting(true);
    const urls = ingestUrl.split('\n').map(u => u.trim()).filter(Boolean);
    
    let successCount = 0;
    let failCount = 0;

    for (const url of urls) {
      const res = await ingestGitHubRepo(url);
      if (res.success) {
        successCount++;
      } else {
        failCount++;
        toast.error(`Failed to ingest ${url}: ${res.error?.message}`);
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully ingested ${successCount} folder(s) or repository(s)!`);
      loadData();
    }
    if (failCount === 0 && successCount > 0) {
      setIngestUrl(''); // clear on full success
    }
    
    setIngesting(false);
  };

  const handleEnrich = async () => {
    setEnriching(true);
    const res = await enrichAllProblems();
    if (res.success) {
      toast.success("Enrichment completed!");
      loadData();
    } else {
      toast.error(res.error?.message || "Enrichment failed.");
    }
    setEnriching(false);
  };

  const handlePublishAll = async () => {
    setPublishing(true);
    const res = await publishAllDrafts();
    if (res.success) {
      toast.success(`Published ${res.data?.published ?? 0} draft(s)!`);
      loadData();
    } else {
      toast.error(res.error?.message || "Publish failed");
    }
    setPublishing(false);
  };

  const handleToggleVisibility = async (problem: Problem) => {
    const next = !problem.visible;
    const res = await toggleProblemVisibility(problem.id, next);
    if (res.success) {
      toast.success(`"${problem.title}" is now ${next ? 'visible' : 'hidden'}`);
      loadData();
    } else {
      const detail = (res.error as any)?.details;
      toast.error(detail ? `${res.error?.message}: ${detail}` : (res.error?.message || "Toggle failed"));
    }
  };

  const filteredProblems = problems.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const draftsCount = problems.filter(p => !p.visible).length;

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-64 text-brand-offwhite-muted">
        <Activity className="animate-spin mr-2" size={18} /> Verifying access...
      </div>
    );
  }

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
          <div className="text-3xl font-bold text-brand-offwhite mb-1">{stats?.total_problems || 0}</div>
          <div className="text-sm text-brand-offwhite-muted font-medium">Total Problems</div>
        </div>
        <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-6">
          <CheckCircle2 size={20} className="text-brand-success mb-4" />
          <div className="text-3xl font-bold text-brand-offwhite mb-1">{stats?.active_problems || 0}</div>
          <div className="text-sm text-brand-offwhite-muted font-medium">Active Problems</div>
        </div>
        <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl p-6">
          <Activity size={20} className="text-[#8DB4B9] mb-4" />
          <div className="text-3xl font-bold text-brand-offwhite mb-1">{stats?.total_submissions || 0}</div>
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
                <textarea 
                  value={ingestUrl}
                  onChange={(e) => setIngestUrl(e.target.value)}
                  placeholder="https://github.com/01-edu/public/tree/master/subjects/isprime&#10;https://github.com/01-edu/public/tree/master/subjects/isprintable"
                  rows={3}
                  className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg px-4 py-3 text-sm text-brand-offwhite mb-4 focus:outline-none focus:border-brand-muted-gold resize-y font-mono whitespace-nowrap overflow-x-auto"
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
                    <span className="text-brand-offwhite">Live</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-offwhite-muted">Problems pending</span>
                    <span className="text-brand-muted-gold font-bold">{draftsCount} drafts</span>
                  </div>
                </div>

                <button 
                  onClick={handleEnrich}
                  disabled={enriching || draftsCount === 0}
                  className="w-full bg-transparent border border-brand-muted-gold text-brand-muted-gold hover:bg-brand-muted-gold hover:text-brand-charcoal-base py-2.5 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-brand-muted-gold"
                >
                  {enriching ? <Activity className="animate-spin" size={18} /> : <Wand2 size={18} />} 
                  {enriching ? 'Enriching...' : 'Enrich All Problems'}
                </button>

                {draftsCount > 0 && (
                  <button
                    onClick={handlePublishAll}
                    disabled={publishing}
                    className="w-full bg-brand-success/10 border border-brand-success/30 text-brand-success hover:bg-brand-success/20 py-2.5 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors disabled:opacity-50 mt-3"
                  >
                    {publishing ? <Activity className="animate-spin" size={18} /> : <Send size={18} />}
                    {publishing ? 'Publishing...' : `Publish All Drafts (${draftsCount})`}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-brand-charcoal-border flex justify-between items-center">
              <div className="font-bold flex items-center gap-2 text-brand-offwhite">
                <FileText size={18} className="text-brand-offwhite" /> Problems <span className="text-xs bg-brand-charcoal-hover text-brand-offwhite-muted px-2 py-0.5 rounded-full">{problems.length}</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-offwhite-muted" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter problems..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-brand-charcoal-base border border-brand-charcoal-border rounded text-sm px-8 py-1.5 focus:outline-none focus:border-brand-muted-gold w-64" 
                />
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
                {filteredProblems.map((p, i) => {
                  const isActive = p.visible;
                  const diffLabel = p.difficulty === 1 ? 'Easy' : p.difficulty === 2 ? 'Medium' : p.difficulty === 3 ? 'Hard' : 'Expert';
                  const diffColor = p.difficulty === 1 ? 'text-[#8DB4B9]' : p.difficulty === 2 ? 'text-brand-muted-gold' : 'text-brand-error';
                  
                  return (
                    <tr key={i} className="hover:bg-brand-charcoal-hover/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-brand-offwhite">{p.title}</div>
                        <div className="text-xs text-brand-offwhite-muted font-mono">{p.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-brand-offwhite-muted">{p.module}</td>
                      <td className={cn("px-6 py-4 font-medium", diffColor)}>{diffLabel}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded font-medium",
                          isActive
                            ? "bg-brand-success/10 text-brand-success border border-brand-success/20"
                            : p.statement?.includes("Pending enrichment")
                              ? "bg-brand-warning/10 text-brand-warning border border-brand-warning/20"
                              : "bg-brand-offwhite-muted/10 text-brand-offwhite-muted border border-brand-offwhite-muted/20"
                        )}>
                          {isActive ? 'published' : p.statement?.includes("Pending enrichment") ? 'pending enrich' : 'draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          onClick={() => handleToggleVisibility(p)}
                          className={cn("w-10 h-5 rounded-full relative cursor-pointer opacity-80 hover:opacity-100 transition-opacity", isActive ? 'bg-brand-success' : 'bg-brand-charcoal-border')}
                        >
                          <div className={cn("w-3 h-3 bg-white rounded-full absolute top-1 transition-all", isActive ? 'right-1' : 'left-1')}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-brand-offwhite-muted hover:text-brand-offwhite"><MoreHorizontal size={18} /></button>
                      </td>
                    </tr>
                  )
                })}
                {filteredProblems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-brand-offwhite-muted">
                      No problems found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PendingContributions />
        </div>

        {/* Activity Log */}
        <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden flex flex-col h-[700px]">
          <div className="p-5 border-b border-brand-charcoal-border flex justify-between items-center shrink-0">
            <h3 className="font-bold text-brand-offwhite flex items-center gap-2"><Activity size={18} className="text-brand-offwhite-muted" /> Activity Log</h3>
            <div className="text-xs font-bold text-brand-success flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-brand-success"></div> Live</div>
          </div>
          <div className="p-5 space-y-6 overflow-y-auto overflow-x-hidden flex-1 scrollbar-hide">
             {activityLogs.map((log, i) => {
               const Icon = ICON_MAP[log.icon] || Activity;
               return (
                 <div key={log.id} className="flex gap-4 relative animate-in slide-in-from-right-4 fade-in">
                   <div className="relative z-10 shrink-0 bg-brand-charcoal-card">
                     <Icon size={16} className={log.color} />
                   </div>
                   {i !== activityLogs.length - 1 && (
                     <div className="absolute left-2 top-4 bottom-[-24px] w-px bg-brand-charcoal-border z-0"></div>
                   )}
                   <p className="text-sm text-brand-offwhite-muted leading-tight pt-0.5">{log.message}</p>
                 </div>
               )
             })}
             {activityLogs.length === 0 && (
                <div className="text-sm text-brand-offwhite-muted text-center pt-8">No recent activity</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
