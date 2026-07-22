'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Activity, AlertCircle, Github, Wand2, Search, Pencil, CheckCircle2, GitCommit, LucideIcon, Send, Code, MessageSquare, BrainCircuit, BookOpen, Lock, LockOpen, ChevronDown, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ingestGitHubRepo, enrichAllProblems, fetchAdminStats, fetchAdminActivity, fetchAllProblemsAdmin, fetchUser, toggleProblemVisibility, publishAllDrafts, updateProblem, fetchAIUsageStats, fetchModuleLocks, toggleProblemModuleLock, deleteProblemModule, fetchAllCourses, fetchModules, toggleModuleLock } from '@/lib/api';
import { toast } from '@/lib/toast';
import { AdminStats, AIUsageStats, ActivityLog, Problem, UpdateProblemPayload, Course, Module as CurriculumModule } from '@/lib/types';
import { useWebSocket } from '@/lib/event';
import PendingContributions from './PendingContributions';
import FeedbackPanel from './FeedbackPanel';
import BroadcastPanel from './BroadcastPanel';
import ProblemEditPanel from './ProblemEditPanel';
import ProblemReports from './ProblemReports';
import UserVerificationPanel from './UserVerificationPanel';

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
  const [aiUsageStats, setAIUsageStats] = useState<AIUsageStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [problemsError, setProblemsError] = useState<string | null>(null);
  const [moduleLocks, setModuleLocks] = useState<Set<string>>(new Set());
  const [togglingModule, setTogglingModule] = useState<string | null>(null);
  const [deletingModule, setDeletingModule] = useState<string | null>(null);
  const MODULE_DISPLAY_NAMES: Record<string, string> = {
    "arrays-strings": "Arrays & Strings",
    "strings-runes": "Strings & Runes",
    "math-recursion": "Math & Recursion",
    "data-structures": "Data Structures",
    "sorting-searching": "Sorting & Searching",
    "hashmaps-sets": "Hash Maps & Sets",
    concurrency: "Concurrency",
    "dynamic-programming": "Dynamic Programming",
    "bit-manipulation": "Bit Manipulation",
    "trees-graphs": "Trees & Graphs",
    "error-handling": "Error Handling",
    testing: "Testing",
    "file-io": "File I/O",
    networking: "Networking",
    "interfaces-generics": "Interfaces & Generics",
    pointers: "Pointers",
    "oop-composition": "OOP & Composition",
    "design-patterns": "Design Patterns",
    "encoding-serialization": "Encoding & Serialization",
    "linked-lists": "Linked Lists",
    "go-fundamentals": "Go Fundamentals",
    "python-fundamentals": "Python Fundamentals",
    "python-challenges": "Python Challenges",
    "python-intermediate": "Python Intermediate",
    "python-variables-math": "Python Variables & Math",
    "python-arrays-strings": "Python Arrays & Strings",
  };
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseModules, setCourseModules] = useState<Record<string, CurriculumModule[]>>({});
  const [togglingCourseModule, setTogglingCourseModule] = useState<string | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const loadData = useCallback(async () => {
    const [statsRes, usageRes, logsRes, problemsRes, locksRes, coursesRes] = await Promise.all([
      fetchAdminStats(),
      fetchAIUsageStats(),
      fetchAdminActivity(),
      fetchAllProblemsAdmin(),
      fetchModuleLocks(),
      fetchAllCourses(),
    ]);

    if (locksRes.success && locksRes.data) {
      setModuleLocks(new Set(locksRes.data.map((l) => l.module_name)));
    }

    if (statsRes.success && statsRes.data) setStats(statsRes.data);
    if (usageRes.success && usageRes.data) setAIUsageStats(usageRes.data);
    if (logsRes.success && logsRes.data) setActivityLogs(logsRes.data);
    if (problemsRes.success && problemsRes.data) {
      setProblems(problemsRes.data);
      setProblemsError(null);
    } else if (problemsRes.error) {
      setProblemsError(problemsRes.error.message || 'Failed to load problems');
      toast.error(problemsRes.error.message || 'Failed to load problems');
    }

    if (coursesRes.success && coursesRes.data) {
      setCourses(coursesRes.data);
      setLoadingCourses(true);
      const modulePromises = coursesRes.data.map((c) => fetchModules(c.id));
      const moduleResults = await Promise.all(modulePromises);
      const modulesMap: Record<string, CurriculumModule[]> = {};
      coursesRes.data.forEach((c, i) => {
        if (moduleResults[i].success && moduleResults[i].data) {
          modulesMap[c.id] = moduleResults[i].data;
        }
      });
      setCourseModules(modulesMap);
      setLoadingCourses(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const userRes = await fetchUser();
      if (cancelled) return;
      
      if (!userRes.success || userRes.data?.role !== 'admin') {
        router.push('/home');
        return;
      }
      setIsAuthorized(true);
      await loadData();
    };

    load();

    const interval = setInterval(loadData, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [router, loadData]);

  // WebSocket live updates
  useWebSocket({
    'problem.updated': useCallback((data: any) => {
      setProblems((prev) =>
        prev.map((p) =>
          p.id === data.id ? { ...p, ...data } : p,
        ),
      );
    }, []),
    'problem.publish-all': useCallback(() => {
      loadData();
    }, [loadData]),
  }, [loadData]);

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
    // Optimistic update
    setProblems((prev) =>
      prev.map((p) => (p.id === problem.id ? { ...p, visible: next } : p)),
    );
    const res = await toggleProblemVisibility(problem.id, next);
    if (res.success) {
      toast.success(`"${problem.title}" is now ${next ? 'visible' : 'hidden'}`);
    } else {
      // Revert on failure
      setProblems((prev) =>
        prev.map((p) => (p.id === problem.id ? { ...p, visible: !next } : p)),
      );
      const detail = (res.error as any)?.details;
      toast.error(detail ? `${res.error?.message}: ${detail}` : (res.error?.message || "Toggle failed"));
    }
  };

  const handleEditProblem = (problem: Problem) => {
    setEditingProblem(problem);
  };

  const handleSaveProblem = async (data: UpdateProblemPayload) => {
    if (!editingProblem) return;
    const res = await updateProblem(editingProblem.id, data);
    if (res.success) {
      toast.success(`"${res.data?.title || editingProblem.title}" updated`);
      setEditingProblem(null);
      loadData();
    } else {
      toast.error(res.error?.message || "Failed to update problem");
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <a href="/admin/curriculum" className="bg-brand-charcoal-card border border-amber-600/30 hover:border-amber-500/60 rounded-2xl p-6 block transition-all duration-200 hover:-translate-y-0.5 group">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <BookOpen size={18} className="text-amber-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400/80">Curriculum</span>
          </div>
          <div className="text-lg font-bold text-brand-offwhite mb-0.5 group-hover:text-amber-300 transition-colors">Module Manager</div>
          <div className="text-xs text-brand-offwhite-muted/70">Lock, unlock, and manage modules</div>
        </a>
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
        <div className="bg-brand-charcoal-card border border-brand-cool-accent/30 rounded-2xl p-6">
          <BrainCircuit size={20} className="text-brand-cool-accent mb-4" />
          <div className="text-3xl font-bold text-brand-offwhite mb-1">{stats?.total_ai_calls || 0}</div>
          <div className="text-sm text-brand-offwhite-muted font-medium">AI Calls</div>
          <div className="text-xs text-brand-offwhite-muted/70 mt-1">{stats?.ai_calls_today ?? 0} today</div>
        </div>
      </div>

      {/* AI Usage Details */}
      {aiUsageStats && aiUsageStats.total_ai_calls > 0 && (
        <div className="bg-brand-charcoal-card border border-brand-cool-accent/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm text-brand-offwhite-muted mb-3">
            <BrainCircuit size={16} className="text-brand-cool-accent" />
            <span className="font-medium text-brand-offwhite">AI Usage</span>
            <span className="text-xs">{aiUsageStats.total_ai_calls} total calls</span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-brand-offwhite-muted">This week: </span>
              <span className="text-brand-offwhite font-medium">{aiUsageStats.ai_calls_this_week}</span>
            </div>
            <div>
              <span className="text-brand-offwhite-muted">Success rate: </span>
              <span className="text-brand-success font-medium">{aiUsageStats.success_rate}%</span>
            </div>
            <div>
              <span className="text-brand-offwhite-muted">Avg response: </span>
              <span className="text-brand-offwhite font-medium">{Math.round(aiUsageStats.avg_response_time_ms)}ms</span>
            </div>
          </div>
        </div>
      )}

      {/* Module Locks Panel */}
      {problems.length > 0 && (
        <div className="bg-brand-charcoal-card border border-amber-600/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm text-brand-offwhite-muted mb-4">
            <Lock size={16} className="text-amber-400" />
            <span className="font-medium text-brand-offwhite">Problem Module Locks</span>
            <span className="text-xs text-brand-offwhite-muted/60">Lock entire problem categories from student access</span>
          </div>
          <div className="space-y-3">
            {(["go", "python"] as const).map((lang) => {
              const modules = [...new Set(problems.map((p) => p.module).filter(Boolean))]
                .filter((mod) => lang === "go" ? !mod.startsWith("python-") : mod.startsWith("python-"))
                .sort();
              if (modules.length === 0) return null;
              const lockedCount = modules.filter((m) => moduleLocks.has(m)).length;
              const displayLang = lang === "go" ? "Go" : "Python";
              return (
                <details key={lang} className="group" open>
                  <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-brand-offwhite hover:text-amber-300 transition-colors [&::-webkit-details-marker]:hidden">
                    <ChevronDown size={14} className="text-brand-offwhite-muted group-open:rotate-180 transition-transform shrink-0" />
                    <div className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0",
                      lang === "go" ? "bg-cyan-500/15 text-cyan-400" : "bg-amber-500/15 text-amber-400",
                    )}>
                      {lang === "go" ? "G" : "P"}
                    </div>
                    {displayLang}
                    <span className="text-xs text-brand-offwhite-muted/50 font-normal">
                      ({lockedCount}/{modules.length} locked)
                    </span>
                  </summary>
                  <div className="mt-3 flex flex-wrap gap-2 pl-7">
                    {modules.map((mod) => {
                      const isLocked = moduleLocks.has(mod);
                      const displayName = MODULE_DISPLAY_NAMES[mod] || mod;
                      return (
                        <div key={mod} className="flex items-center gap-1.5">
                          <button
                            onClick={async () => {
                              setTogglingModule(mod);
                              const res = await toggleProblemModuleLock(mod);
                              if (res.success) {
                                setModuleLocks((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(mod)) next.delete(mod);
                                  else next.add(mod);
                                  return next;
                                });
                                toast.success(isLocked ? `"${displayName}" unlocked` : `"${displayName}" locked`);
                              } else {
                                toast.error(res.error?.message || "Failed to toggle");
                              }
                              setTogglingModule(null);
                            }}
                            disabled={togglingModule === mod}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                              isLocked
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/15"
                                : "bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite-muted hover:border-amber-500/30 hover:text-amber-400",
                            )}
                          >
                            {isLocked ? <Lock size={12} /> : <LockOpen size={12} />}
                            {displayName}
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Permanently delete all problems in "${displayName}"? This cannot be undone.`)) return;
                              setDeletingModule(mod);
                              const res = await deleteProblemModule(mod);
                              if (res.success) {
                                toast.success(`"${displayName}" deleted`);
                                setProblems((prev) => prev.filter((p) => p.module !== mod));
                                loadData();
                              } else {
                                toast.error(res.error?.message || "Failed to delete module");
                              }
                              setDeletingModule(null);
                            }}
                            disabled={deletingModule === mod}
                            className="p-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30"
                            title={`Delete "${displayName}" and all its problems`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}

      {/* Curriculum Module Locks Panel */}
      {courses.length > 0 && !loadingCourses && (
        <div className="bg-brand-charcoal-card border border-amber-600/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm text-brand-offwhite-muted mb-4">
            <BookOpen size={16} className="text-amber-400" />
            <span className="font-medium text-brand-offwhite">Curriculum Module Locks</span>
            <span className="text-xs text-brand-offwhite-muted/60">Lock entire curriculum modules from student access</span>
          </div>
          <div className="space-y-3">
            {courses.map((course) => {
              const modules = courseModules[course.id] || [];
              if (modules.length === 0) return null;
              return (
                <details key={course.id} className="group">
                  <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-brand-offwhite hover:text-amber-300 transition-colors [&::-webkit-details-marker]:hidden">
                    <ChevronDown size={14} className="text-brand-offwhite-muted group-open:rotate-180 transition-transform shrink-0" />
                    <BookOpen size={14} className="text-brand-offwhite-muted shrink-0" />
                    {course.title}
                    <span className="text-xs text-brand-offwhite-muted/50 font-normal">
                      ({modules.filter((m) => m.locked).length}/{modules.length} locked)
                    </span>
                  </summary>
                  <div className="mt-3 flex flex-wrap gap-2 pl-6">
                    {modules.map((mod) => (
                      <button
                        key={mod.id}
                        onClick={async () => {
                          setTogglingCourseModule(mod.id);
                          const res = await toggleModuleLock(mod.id);
                          if (res.success) {
                            setCourseModules((prev) => ({
                              ...prev,
                              [course.id]: prev[course.id].map((m) =>
                                m.id === mod.id ? { ...m, locked: !m.locked } : m
                              ),
                            }));
                            toast.success(mod.locked ? `"${mod.title}" unlocked` : `"${mod.title}" locked`);
                          } else {
                            toast.error(res.error?.message || "Failed to toggle");
                          }
                          setTogglingCourseModule(null);
                        }}
                        disabled={togglingCourseModule === mod.id}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                          mod.locked
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/15"
                            : "bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite-muted hover:border-amber-500/30 hover:text-amber-400",
                        )}
                      >
                        {mod.locked ? <Lock size={12} /> : <LockOpen size={12} />}
                        {mod.title}
                      </button>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
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

          {/* Broadcasts */}
          <BroadcastPanel compact />

          {/* Problem Reports */}
          <ProblemReports compact />

          {/* User Verification */}
          <UserVerificationPanel compact />

          {/* Contributions + Feedback Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-brand-charcoal-border flex items-center gap-2">
                <Code size={18} className="text-brand-muted-gold" />
                <h3 className="font-bold text-brand-offwhite">Pending Contributions</h3>
              </div>
              <div className="p-4">
                <PendingContributions compact />
              </div>
            </div>
            <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-brand-charcoal-border flex items-center gap-2">
                <MessageSquare size={18} className="text-brand-muted-gold" />
                <h3 className="font-bold text-brand-offwhite">Feedback & Reports</h3>
              </div>
              <div className="p-4">
                <FeedbackPanel compact />
              </div>
            </div>
          </div>

          {/* Problems (scrollable) */}
          <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden shadow-lg shadow-black/10">
            <div className="p-4 border-b border-brand-charcoal-border flex justify-between items-center bg-brand-charcoal-panel/50 sticky top-0 z-10">
              <div className="font-bold flex items-center gap-2 text-brand-offwhite">
                <FileText size={18} className="text-brand-offwhite" /> Problem Catalog <span className="text-xs bg-brand-charcoal-hover text-brand-offwhite-muted px-2 py-0.5 rounded-full">{problems.length}</span>
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
            
            <div className="overflow-y-auto max-h-[420px] scrollbar-thin">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-brand-offwhite-muted uppercase tracking-wider border-b border-brand-charcoal-border bg-brand-charcoal-card sticky top-0 z-10">
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
                          <button onClick={() => handleEditProblem(p)} className="text-brand-offwhite-muted hover:text-brand-muted-gold transition-colors" title="Edit problem">
                            <Pencil size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {problemsError && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="text-brand-error mb-1">Failed to load problems</div>
                        <div className="text-brand-offwhite-muted text-xs">{problemsError}</div>
                      </td>
                    </tr>
                  )}
                  {!problemsError && filteredProblems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-brand-offwhite-muted">
                        No problems found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-1 bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden flex flex-col h-fit lg:sticky lg:top-6">
          <div className="p-5 border-b border-brand-charcoal-border flex justify-between items-center shrink-0">
            <h3 className="font-bold text-brand-offwhite flex items-center gap-2"><Activity size={18} className="text-brand-offwhite-muted" /> Activity Log</h3>
            <div className="text-xs font-bold text-brand-success flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-brand-success"></div> Live</div>
          </div>
          <div className="p-5 space-y-6 overflow-y-auto max-h-[600px] scrollbar-thin">
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

      {editingProblem && (
        <ProblemEditPanel
          problem={editingProblem}
          onSave={handleSaveProblem}
          onClose={() => setEditingProblem(null)}
        />
      )}
    </div>
  );
}
