'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Activity, AlertCircle, Github, Wand2, Search, Pencil, CheckCircle2, GitCommit, LucideIcon, Send, Code, MessageSquare, BrainCircuit, BookOpen, Lock, LockOpen, ChevronDown, Trash2, Pin, PinOff, ShieldCheck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ingestGitHubRepo, enrichAllProblems, fetchAdminStats, fetchAdminActivity, fetchAllProblemsAdmin, fetchUser, toggleProblemVisibility, publishAllDrafts, updateProblem, fetchAIUsageStats, fetchAllModules, toggleProblemModuleLock, deleteProblemModule, fetchAllCourses, fetchModules, toggleModuleLock, upsertModuleMeta, setModulePin } from '@/lib/api';
import { toast } from '@/lib/toast';
import { clearCache } from '@/lib/cache';
import { AdminStats, AIUsageStats, ActivityLog, Problem, UpdateProblemPayload, Course, Module as CurriculumModule, AllModule } from '@/lib/types';
import { useWebSocket } from '@/lib/event';
import PendingContributions from './PendingContributions';
import FeedbackPanel from './FeedbackPanel';
import BroadcastPanel from './BroadcastPanel';
import ProblemEditPanel from './ProblemEditPanel';
import ProblemReports from './ProblemReports';
import UserVerificationPanel from './UserVerificationPanel';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const [allModules, setAllModules] = useState<AllModule[]>([]);
  const [togglingModule, setTogglingModule] = useState<string | null>(null);
  const [deletingModule, setDeletingModule] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseModules, setCourseModules] = useState<Record<string, CurriculumModule[]>>({});
  const [togglingCourseModule, setTogglingCourseModule] = useState<string | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [editingModuleName, setEditingModuleName] = useState<string | null>(null);
  const [editingModuleValue, setEditingModuleValue] = useState('');

  const loadData = useCallback(async () => {
    const [statsRes, usageRes, logsRes, problemsRes, modulesRes, coursesRes] = await Promise.all([
      fetchAdminStats(),
      fetchAIUsageStats(),
      fetchAdminActivity(),
      fetchAllProblemsAdmin(),
      fetchAllModules(),
      fetchAllCourses(),
    ]);

    if (modulesRes.success && modulesRes.data) {
      setAllModules(modulesRes.data);
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
      const modulePromises = coursesRes.data.map((c: Course) => fetchModules(c.id));
      const moduleResults = await Promise.all(modulePromises);
      const modulesMap: Record<string, CurriculumModule[]> = {};
      coursesRes.data.forEach((c: Course, i: number) => {
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
        <Link href="/admin/curriculum" className="bg-brand-charcoal-card border border-amber-600/30 hover:border-amber-500/60 rounded-2xl p-6 block transition-all duration-200 hover:-translate-y-0.5 group">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <BookOpen size={18} className="text-amber-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400/80">Curriculum</span>
          </div>
          <div className="text-lg font-bold text-brand-offwhite mb-0.5 group-hover:text-amber-300 transition-colors">Module Manager</div>
          <div className="text-xs text-brand-offwhite-muted/70">Lock, unlock, and manage modules</div>
        </Link>
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

      {/* Problem Module Locks Panel */}
      {allModules.length > 0 && (
        <div className="relative group">
          <div className="absolute -z-10 rounded-2xl transition-all duration-300 ease-out bg-black/10 dark:bg-white/[0.06] left-2 top-2 -right-1.5 -bottom-1.5 opacity-0 scale-[0.96] blur-[0.5px] group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-1 group-hover:blur-0" />
          <Card className="border-brand-charcoal-border overflow-hidden">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-brand-charcoal-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <ShieldCheck size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-offwhite">Problem Module Locks</h3>
                    <p className="text-[11px] text-brand-offwhite-muted/60">Lock entire problem categories from student access</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite-muted/70">
                  <Lock size={10} className="mr-1 text-amber-400/70" />
                  {allModules.filter(m => m.is_locked).length}/{allModules.length}
                </Badge>
              </div>
              <div className="p-5">
                <Tabs defaultValue="go">
                  <TabsList className="mb-4">
                    <TabsTrigger value="go" className="text-xs data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-400">
                      <span className="w-4 h-4 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-400 flex items-center justify-center mr-1.5">G</span>
                      Go
                    </TabsTrigger>
                    <TabsTrigger value="python" className="text-xs data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400">
                      <span className="w-4 h-4 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 flex items-center justify-center mr-1.5">P</span>
                      Python
                    </TabsTrigger>
                  </TabsList>
                  {(["go", "python"] as const).map((lang) => {
                    const mods = allModules
                      .filter((m) => lang === "go" ? !m.module_name.startsWith("python-") : m.module_name.startsWith("python-"))
                      .sort((a, b) => a.module_name.localeCompare(b.module_name));
                    if (mods.length === 0) return null;
                    return (
                      <TabsContent key={lang} value={lang} className="mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                          {mods.map((mod) => {
                            const isLocked = mod.is_locked;
                            const displayName = mod.display_name;
                            return (
                              <div key={mod.module_name} className="group/card bg-brand-charcoal-base/80 border border-brand-charcoal-border rounded-xl p-3.5 transition-all hover:border-brand-charcoal-hover hover:-translate-y-0.5 hover:shadow-sm hover:shadow-black/20">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm font-semibold text-brand-offwhite truncate">{displayName}</span>
                                    </div>
                                    <span className="text-[11px] text-brand-offwhite-muted/40 font-mono block truncate">{mod.module_name}</span>
                                  </div>
                                  {isLocked && (
                                    <div className="w-6 h-6 rounded-md bg-amber-500/15 flex items-center justify-center shrink-0">
                                      <Lock size={11} className="text-amber-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] text-brand-offwhite-muted/50 font-medium">
                                    {mod.problem_count} problem{mod.problem_count !== 1 ? 's' : ''}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={togglingModule === mod.module_name}
                                      onClick={async () => {
                                        setTogglingModule(mod.module_name);
                                        const res = await toggleProblemModuleLock(mod.module_name);
                                        if (res.success) {
                                          setAllModules((prev) =>
                                            prev.map((m) =>
                                              m.module_name === mod.module_name ? { ...m, is_locked: !isLocked } : m
                                            )
                                          );
                                          toast.success(isLocked ? `"${displayName}" unlocked` : `"${displayName}" locked`);
                                        } else {
                                          toast.error(res.error?.message || "Failed to toggle");
                                        }
                                        setTogglingModule(null);
                                      }}
                                      className={cn(
                                        "h-7 text-[11px] gap-1 px-2.5 transition-all",
                                        isLocked
                                          ? "bg-amber-500/12 border border-amber-500/25 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40"
                                          : "text-brand-offwhite-muted/60 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent"
                                      )}
                                    >
                                      {isLocked ? <Lock size={11} /> : <LockOpen size={11} />}
                                      {isLocked ? "Locked" : "Unlock"}
                                    </Button>
                                    {mod.problem_count === 0 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={deletingModule === mod.module_name}
                                        onClick={async () => {
                                          if (!confirm(`Permanently delete module "${displayName}"?`)) return;
                                          setDeletingModule(mod.module_name);
                                          const res = await deleteProblemModule(mod.module_name);
                                          if (res.success) {
                                            toast.success(`"${displayName}" deleted`);
                                            clearCache("/admin/problems");
                                            await loadData();
                                          } else {
                                            toast.error(res.error?.message || "Failed to delete module");
                                          }
                                          setDeletingModule(null);
                                        }}
                                        className="h-7 w-7 p-0 text-red-400/40 hover:text-red-400 hover:bg-red-500/10"
                                        title="Delete module"
                                      >
                                        <Trash2 size={12} />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Curriculum Module Locks Panel */}
      {courses.length > 0 && !loadingCourses && (
        <div className="relative group">
          <div className="absolute -z-10 rounded-2xl transition-all duration-300 ease-out bg-black/10 dark:bg-white/[0.06] left-2 top-2 -right-1.5 -bottom-1.5 opacity-0 scale-[0.96] blur-[0.5px] group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-1 group-hover:blur-0" />
          <Card className="border-brand-charcoal-border overflow-hidden">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-brand-charcoal-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <BookOpen size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-offwhite">Curriculum Module Locks</h3>
                    <p className="text-[11px] text-brand-offwhite-muted/60">Lock curriculum modules from student access</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite-muted/70">
                  <Lock size={10} className="mr-1 text-amber-400/70" />
                  {courses.reduce((acc, c) => acc + (courseModules[c.id] || []).filter(m => m.locked).length, 0)}/
                  {courses.reduce((acc, c) => acc + (courseModules[c.id] || []).length, 0)}
                </Badge>
              </div>
              <div className="p-5 space-y-3">
                {courses.map((course) => {
                  const mods = courseModules[course.id] || [];
                  if (mods.length === 0) return null;
                  const lockedCount = mods.filter(m => m.locked).length;
                  return (
                    <details key={course.id} className="group/cc" open={lockedCount > 0}>
                      <summary className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-brand-offwhite hover:text-amber-300 transition-colors [&::-webkit-details-marker]:hidden rounded-lg px-3 py-2 hover:bg-brand-charcoal-base/50 -mx-3">
                        <ChevronDown size={14} className="text-brand-offwhite-muted group-open/cc:rotate-180 transition-transform shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="truncate">{course.title}</span>
                        </div>
                        <Badge variant="outline" className={cn(
                          "text-[10px] px-2 py-0 h-5 font-normal",
                          lockedCount > 0
                            ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                            : "border-brand-charcoal-border text-brand-offwhite-muted/50"
                        )}>
                          {lockedCount}/{mods.length} locked
                        </Badge>
                      </summary>
                      <div className="mt-2 flex flex-wrap gap-2 pl-7">
                        {mods.map((mod) => (
                          <div key={mod.id} className="group/pill">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={togglingCourseModule === mod.id}
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
                              className={cn(
                                "h-8 text-xs gap-1.5 px-3 transition-all rounded-lg",
                                mod.locked
                                  ? "bg-amber-500/12 border border-amber-500/25 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40"
                                  : "bg-brand-charcoal-base/50 border border-brand-charcoal-border text-brand-offwhite-muted/70 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/8"
                              )}
                            >
                              {mod.locked ? <Lock size={12} /> : <LockOpen size={12} />}
                              {mod.title}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </details>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Module Settings Panel */}
      {allModules.length > 0 && (
        <div className="relative group">
          <div className="absolute -z-10 rounded-2xl transition-all duration-300 ease-out bg-black/10 dark:bg-white/[0.06] left-2 top-2 -right-1.5 -bottom-1.5 opacity-0 scale-[0.96] blur-[0.5px] group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-1 group-hover:blur-0" />
          <Card className="border-brand-charcoal-border overflow-hidden">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-brand-charcoal-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-muted-gold/15 flex items-center justify-center">
                    <FileText size={16} className="text-brand-muted-gold" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-offwhite">Module Settings</h3>
                    <p className="text-[11px] text-brand-offwhite-muted/60">Rename modules and pin them to appear first</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs bg-brand-charcoal-base border-brand-charcoal-border text-brand-offwhite-muted/70">
                  <Pin size={10} className="mr-1 text-brand-muted-gold/70" />
                  {allModules.filter(m => m.is_pinned).length} pinned
                </Badge>
              </div>
              <div className="p-5">
                <Tabs defaultValue="go">
                  <TabsList className="mb-4">
                    <TabsTrigger value="go" className="text-xs data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-400">
                      <span className="w-4 h-4 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-400 flex items-center justify-center mr-1.5">G</span>
                      Go
                    </TabsTrigger>
                    <TabsTrigger value="python" className="text-xs data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400">
                      <span className="w-4 h-4 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 flex items-center justify-center mr-1.5">P</span>
                      Python
                    </TabsTrigger>
                  </TabsList>
                  {(["go", "python"] as const).map((lang) => {
                    const mods = allModules
                      .filter((m) => lang === "go" ? !m.module_name.startsWith("python-") : m.module_name.startsWith("python-"))
                      .sort((a, b) => a.module_name.localeCompare(b.module_name));
                    if (mods.length === 0) return null;
                    return (
                      <TabsContent key={lang} value={lang} className="mt-0">
                        <div className="space-y-2">
                          {mods.map((mod) => {
                            const currentDisplayName = mod.display_name;
                            const isPinned = mod.is_pinned;
                            const isEditing = editingModuleName === mod.module_name;
                            return (
                              <div key={mod.module_name} className="group/row bg-brand-charcoal-base/60 border border-brand-charcoal-border rounded-xl px-4 py-3 transition-all hover:border-brand-charcoal-hover hover:bg-brand-charcoal-base/80">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      {isEditing ? (
                                        <div className="flex items-center gap-1.5">
                                          <Input
                                            value={editingModuleValue}
                                            onChange={(e) => setEditingModuleValue(e.target.value)}
                                            onBlur={async () => {
                                              const val = editingModuleValue.trim();
                                              if (val && val !== currentDisplayName) {
                                                const res = await upsertModuleMeta(mod.module_name, val);
                                                if (res.success) {
                                                  toast.success(`Renamed to "${val}"`);
                                                  await loadData();
                                                } else {
                                                  toast.error(res.error?.message || "Failed to rename");
                                                }
                                              }
                                              setEditingModuleName(null);
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                              if (e.key === 'Escape') setEditingModuleName(null);
                                            }}
                                            className="h-8 text-sm bg-brand-charcoal-base border-brand-muted-gold/50 focus:border-brand-muted-gold"
                                            autoFocus
                                          />
                                          <button
                                            onClick={() => setEditingModuleName(null)}
                                            className="p-1 rounded text-brand-offwhite-muted/50 hover:text-brand-offwhite-muted hover:bg-brand-charcoal-hover transition-all"
                                          >
                                            <X size={14} />
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <span className="text-sm font-semibold text-brand-offwhite">{currentDisplayName}</span>
                                          {isPinned && (
                                            <Pin size={12} className="text-amber-400 shrink-0" />
                                          )}
                                        </>
                                      )}
                                    </div>
                                    <span className="text-[11px] text-brand-offwhite-muted/40 font-mono block">
                                      {mod.module_name} · {mod.problem_count} problem{mod.problem_count !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingModuleName(mod.module_name);
                                        setEditingModuleValue(currentDisplayName);
                                      }}
                                      className={cn(
                                        "h-8 w-8 p-0 text-brand-offwhite-muted/40 hover:text-brand-muted-gold hover:bg-brand-muted-gold/10",
                                        isEditing && "hidden"
                                      )}
                                      title="Rename module"
                                    >
                                      <Pencil size={14} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={async () => {
                                        const next = !isPinned;
                                        const res = await setModulePin(mod.module_name, next);
                                        if (res.success) {
                                          setAllModules((prev) =>
                                            prev.map((m) =>
                                              m.module_name === mod.module_name ? { ...m, is_pinned: next } : m
                                            )
                                          );
                                          toast.success(next ? `"${currentDisplayName}" pinned` : `"${currentDisplayName}" unpinned`);
                                        } else {
                                          toast.error(res.error?.message || "Failed to toggle pin");
                                        }
                                      }}
                                      className={cn(
                                        "h-8 w-8 p-0 transition-all",
                                        isPinned
                                          ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                                          : "text-brand-offwhite-muted/30 hover:text-amber-400 hover:bg-amber-500/10"
                                      )}
                                      title={isPinned ? "Unpin module" : "Pin module"}
                                    >
                                      {isPinned ? <Pin size={14} /> : <PinOff size={14} />}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </div>
            </CardContent>
          </Card>
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
