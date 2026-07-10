'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import {
  MessageSquare,
  Lightbulb,
  Beaker,
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  Send,
  X,
  AlertCircle,
  CheckCircle2,
  BrainCircuit,
  RefreshCw,
  Sparkles,
  RotateCcw,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiAssist } from '@/lib/api';
import { toast } from '@/lib/toast';
import type {
  Problem,
  AIActionType,
  AIAssistRequest,
  AIAssistResponse,
  ChatMessage,
  TestCase,
} from '@/lib/types';

interface AIAssistantPanelProps {
  problem: Problem;
  onApply: (response: AIAssistResponse) => void;
  onClose: () => void;
}

const QUICK_ACTIONS: { action: AIActionType; label: string; icon: React.ReactNode }[] = [
  { action: 'rephrase_statement', label: 'Rephrase', icon: <MessageSquare size={12} /> },
  { action: 'improve_hints', label: 'Hints', icon: <Lightbulb size={12} /> },
  { action: 'generate_test_cases', label: 'Test Cases', icon: <Beaker size={12} /> },
  { action: 'fix_signatures', label: 'Signatures', icon: <ArrowLeftRight size={12} /> },
];

const DIFFICULTY_LABELS = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];

const DIFFICULTY_COLORS: Record<number, string> = {
  1: 'bg-green-500/20 text-green-400',
  2: 'bg-emerald-500/20 text-emerald-400',
  3: 'bg-yellow-500/20 text-yellow-400',
  4: 'bg-orange-500/20 text-orange-400',
  5: 'bg-red-500/20 text-red-400',
};

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hasApplyableFields(response: AIAssistResponse): boolean {
  return !!(
    response.statement ||
    response.hints ||
    response.constraints ||
    response.func_name ||
    response.return_type ||
    response.param_types ||
    response.language_versions ||
    response.difficulty ||
    response.xp_reward
  );
}

export default function AIAssistantPanel({ problem, onApply, onClose }: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const [targetDifficulty, setTargetDifficulty] = useState(problem.difficulty || 3);
  const [activePreview, setActivePreview] = useState<AIAssistResponse | null>(null);
  const [expandedHints, setExpandedHints] = useState(true);
  const [showTestCases, setShowTestCases] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (activePreview) {
          handleApplyPreview();
        }
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const sendMessage = useCallback(async (
    content: string,
    action: AIActionType = 'chat',
    extras?: Partial<AIAssistRequest>
  ) => {
    if (loading) return;
    setLoading(true);
    setDifficultyOpen(false);

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      status: 'complete',
    };

    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      status: 'pending',
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      const res = await aiAssist({
        action,
        problem,
        message: action === 'chat' ? content : undefined,
        difficulty: extras?.difficulty,
        ...extras,
      });

      if (res.success && res.data) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? {
                  ...m,
                  status: 'complete',
                  content: res.data!.explanation || 'Suggestion ready.',
                  response: res.data!,
                }
              : m
          )
        );
        setActivePreview(res.data!);
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? {
                  ...m,
                  status: 'error',
                  error: res.error?.message || 'AI request failed',
                }
              : m
          )
        );
      }
    } catch (err: unknown) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                status: 'error',
                error: err instanceof Error ? err.message : 'Network error',
              }
            : m
        )
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [loading, problem]);

  const handleQuickAction = useCallback((action: AIActionType) => {
    const labels: Record<string, string> = {
      rephrase_statement: 'Rephrase the statement',
      improve_hints: 'Improve the hints',
      generate_test_cases: 'Generate test cases',
      regenerate_test_cases: 'Regenerate all test cases',
      add_edge_cases: 'Add edge case test cases',
      fix_signatures: 'Fix Go/Python function signatures',
    };
    sendMessage(labels[action] || action, action);
  }, [sendMessage]);

  const handleDifficultyAdjust = useCallback(() => {
    setDifficultyOpen(false);
    sendMessage(
      `Adjust difficulty to ${DIFFICULTY_LABELS[targetDifficulty - 1]} (${targetDifficulty}/5)`,
      'adjust_difficulty',
      { difficulty: targetDifficulty }
    );
  }, [targetDifficulty, sendMessage]);

  const handleApplyPreview = useCallback(() => {
    if (!activePreview) return;
    onApply(activePreview);
    if (activePreview.test_cases && activePreview.test_cases.length > 0) {
      toast.success(`${activePreview.test_cases.length} test cases saved automatically`);
    }
    setActivePreview(null);
    setMessages((prev) =>
      prev.map((m) => (m.response ? { ...m, applied: true } : m))
    );
  }, [activePreview, onApply]);

  const handleRevert = useCallback(() => {
    setActivePreview(null);
  }, []);

  const handleApplyFromChat = useCallback((msgId: string) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg?.response) return;

    onApply(msg.response);
    setActivePreview(null);

    if (msg.response.test_cases && msg.response.test_cases.length > 0) {
      toast.success(`${msg.response.test_cases.length} test cases saved automatically`);
    }

    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, applied: true } : m))
    );
  }, [messages, onApply]);

  const handleRetry = useCallback((msgId: string) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;
    const idx = messages.findIndex((m) => m.id === msgId);
    const userMsg = idx > 0 ? messages[idx - 1] : null;
    if (userMsg && userMsg.role === 'user') {
      setMessages((prev) => prev.filter((m) => m.id !== msgId && m.id !== userMsg.id));
      sendMessage(userMsg.content, 'chat');
    }
  }, [messages, sendMessage]);

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || loading) return;
    setInputValue('');
    sendMessage(trimmed, 'chat');
  }, [inputValue, loading, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const previewData = useMemo(() => {
    if (!activePreview) return null;
    return {
      statement: activePreview.statement || problem.statement,
      hints: activePreview.hints || problem.hints || [],
      testCases: activePreview.test_cases || [],
      funcName: activePreview.func_name || problem.func_name,
      returnType: activePreview.return_type || problem.return_type,
      paramTypes: activePreview.param_types || problem.param_types || [],
      languageVersions: activePreview.language_versions || (problem as any).language_versions,
      difficulty: activePreview.difficulty || problem.difficulty,
      xpReward: activePreview.xp_reward || problem.xpReward,
      constraints: activePreview.constraints !== undefined ? activePreview.constraints : problem.constraints,
    };
  }, [activePreview, problem]);

  return (
    <motion.div
      ref={panelRef}
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 520, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative h-full flex flex-col bg-brand-charcoal-card border-l border-brand-charcoal-border overflow-hidden"
      role="complementary"
      aria-label="AI Assistant"
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-brand-charcoal-border">
        <div className="flex items-center gap-2">
          <BrainCircuit size={18} className="text-brand-muted-gold" />
          <span className="text-sm font-bold text-brand-offwhite">AI Assistant</span>
          {activePreview && (
            <span className="text-[10px] bg-brand-muted-gold/20 text-brand-muted-gold px-1.5 py-0.5 rounded-full">
              Preview
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover transition-colors"
          aria-label="Close AI Assistant"
        >
          <X size={16} />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="shrink-0 px-4 py-2.5 border-b border-brand-charcoal-border/50">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.action}
              onClick={() => handleQuickAction(qa.action)}
              disabled={loading}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                "border border-brand-charcoal-border hover:border-brand-muted-gold/30",
                "text-brand-offwhite-muted hover:text-brand-muted-gold hover:bg-brand-muted-gold/5",
                "disabled:opacity-40 disabled:pointer-events-none"
              )}
              aria-label={`AI action: ${qa.label}`}
            >
              {qa.icon}
              {qa.label}
            </button>
          ))}
          <div className="relative">
            <button
              onClick={() => setDifficultyOpen(!difficultyOpen)}
              disabled={loading}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                "border border-brand-charcoal-border hover:border-brand-muted-gold/30",
                "text-brand-offwhite-muted hover:text-brand-muted-gold hover:bg-brand-muted-gold/5",
                "disabled:opacity-40 disabled:pointer-events-none"
              )}
              aria-label="Adjust difficulty"
              aria-expanded={difficultyOpen}
            >
              <ChevronDown size={12} />
              Difficulty
            </button>
            <AnimatePresence>
              {difficultyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl p-2 shadow-xl z-50 min-w-[180px]"
                  role="dialog"
                  aria-label="Select target difficulty"
                >
                  <p className="text-[10px] font-medium text-brand-offwhite-muted uppercase tracking-wider px-2 pb-1">
                    Target Difficulty
                  </p>
                  {DIFFICULTY_LABELS.map((label, i) => {
                    const d = i + 1;
                    return (
                      <button
                        key={d}
                        onClick={() => {
                          setTargetDifficulty(d);
                          handleDifficultyAdjust();
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2",
                          targetDifficulty === d
                            ? 'bg-brand-muted-gold/10 text-brand-muted-gold'
                            : 'text-brand-offwhite hover:bg-brand-charcoal-hover'
                        )}
                      >
                        <span className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                          DIFFICULTY_COLORS[d]
                        )}>
                          {d}
                        </span>
                        {label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content: Preview + Chat */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Preview Panel */}
        <div className="w-[240px] shrink-0 border-r border-brand-charcoal-border/50 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-4">
            {!previewData ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-brand-offwhite-muted px-4">
                <Sparkles size={24} className="mb-2 opacity-30" />
                <p className="text-[11px] font-medium mb-1">No Preview</p>
                <p className="text-[10px] max-w-[180px]">
                  Use a quick action or ask the AI to generate changes
                </p>
              </div>
            ) : (
              <>
                {/* Statement */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-medium text-brand-offwhite-muted uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare size={10} className="text-brand-muted-gold" />
                      Statement
                    </h4>
                    <button
                      onClick={() => handleQuickAction('rephrase_statement')}
                      disabled={loading}
                      className="text-[9px] text-brand-muted-gold/70 hover:text-brand-muted-gold transition-colors flex items-center gap-0.5"
                      aria-label="Regenerate statement"
                    >
                      <RefreshCw size={9} />
                      Regen
                    </button>
                  </div>
                  <div className="text-[11px] text-brand-offwhite leading-relaxed [&_p]:mb-1 [&_code]:text-brand-muted-gold [&_code]:text-[10px] [&_pre]:bg-brand-charcoal-base [&_pre]:rounded [&_pre]:p-1.5 [&_pre]:text-[10px] [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_h1]:text-sm [&_h1]:font-bold [&_h2]:text-xs [&_h2]:font-bold line-clamp-7">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                    >
                      {previewData.statement}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Hints */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedHints(!expandedHints)}
                      className="text-[10px] font-medium text-brand-offwhite-muted uppercase tracking-wider flex items-center gap-1 hover:text-brand-offwhite transition-colors"
                    >
                      <Lightbulb size={10} className="text-brand-muted-gold" />
                      Hints ({previewData.hints.length})
                      <ChevronRight size={10} className={cn("transition-transform", expandedHints && "rotate-90")} />
                    </button>
                    <button
                      onClick={() => handleQuickAction('improve_hints')}
                      disabled={loading}
                      className="text-[9px] text-brand-muted-gold/70 hover:text-brand-muted-gold transition-colors flex items-center gap-0.5"
                      aria-label="Regenerate hints"
                    >
                      <RefreshCw size={9} />
                      Regen
                    </button>
                  </div>
                  <AnimatePresence>
                    {expandedHints && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1">
                          {previewData.hints.map((hint, i) => (
                            <div key={i} className="text-[10px] text-brand-offwhite-muted bg-brand-charcoal-base/50 rounded-lg p-2">
                              <span className="text-brand-muted-gold font-medium">{i + 1}.</span>{' '}
                              {hint}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Test Cases */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowTestCases(!showTestCases)}
                      className="text-[10px] font-medium text-brand-offwhite-muted uppercase tracking-wider flex items-center gap-1 hover:text-brand-offwhite transition-colors"
                    >
                      <Beaker size={10} className="text-brand-muted-gold" />
                      Test Cases ({previewData.testCases.length})
                      <ChevronRight size={10} className={cn("transition-transform", showTestCases && "rotate-90")} />
                    </button>
                    <button
                      onClick={() => handleQuickAction('generate_test_cases')}
                      disabled={loading}
                      className="text-[9px] text-brand-muted-gold/70 hover:text-brand-muted-gold transition-colors flex items-center gap-0.5"
                      aria-label="Regenerate test cases"
                    >
                      <RefreshCw size={9} />
                      Regen
                    </button>
                  </div>
                  <AnimatePresence>
                    {showTestCases && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1">
                          {previewData.testCases.slice(0, 5).map((tc, i) => (
                            <div key={i} className="text-[10px] bg-brand-charcoal-base/50 rounded-lg p-2 font-mono">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-brand-offwhite-muted">
                                  #{tc.ordinal}
                                </span>
                                <span className={cn(
                                  "text-[9px] px-1 py-0.5 rounded",
                                  tc.is_hidden ? "bg-brand-muted-gold/20 text-brand-muted-gold" : "bg-green-500/20 text-green-400"
                                )}>
                                  {tc.is_hidden ? 'Hidden' : 'Visible'}
                                </span>
                              </div>
                              <div className="text-brand-offwhite truncate">
                                {typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input)}
                              </div>
                              <div className="text-brand-muted-gold/70 truncate">
                                → {tc.expected}
                              </div>
                            </div>
                          ))}
                          {previewData.testCases.length > 5 && (
                            <div className="text-[9px] text-brand-offwhite-muted/50 text-center">
                              +{previewData.testCases.length - 5} more
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Signature */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-medium text-brand-offwhite-muted uppercase tracking-wider flex items-center gap-1">
                      <ArrowLeftRight size={10} className="text-brand-muted-gold" />
                      Signature
                    </h4>
                    <button
                      onClick={() => handleQuickAction('fix_signatures')}
                      disabled={loading}
                      className="text-[9px] text-brand-muted-gold/70 hover:text-brand-muted-gold transition-colors flex items-center gap-0.5"
                      aria-label="Regenerate signatures"
                    >
                      <RefreshCw size={9} />
                      Regen
                    </button>
                  </div>
                  <div className="bg-brand-charcoal-base rounded-lg p-2 font-mono text-[10px] text-brand-offwhite">
                    <span className="text-brand-muted-gold">func</span>{' '}
                    {previewData.funcName}(
                    <span className="text-brand-offwhite-muted">
                      {previewData.paramTypes.join(', ')}
                    </span>
                    ){' '}
                    <span className="text-brand-muted-gold">→</span>{' '}
                    {previewData.returnType}
                  </div>
                </div>

                {/* Language Versions */}
                {previewData.languageVersions && Object.keys(previewData.languageVersions).length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-medium text-brand-offwhite-muted uppercase tracking-wider flex items-center gap-1">
                      <Code2 size={10} className="text-brand-muted-gold" />
                      Languages
                    </h4>
                    <div className="space-y-1">
                      {Object.entries(previewData.languageVersions).map(([lang, spec]) => (
                        <div key={lang} className="bg-brand-charcoal-base rounded-lg p-2 font-mono text-[10px]">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={cn(
                              "text-[9px] px-1 py-0.5 rounded font-medium",
                              lang === 'go' ? 'bg-sky-500/20 text-sky-400' : 'bg-amber-500/20 text-amber-400'
                            )}>
                              {lang === 'go' ? 'Go' : 'Python'}
                            </span>
                          </div>
                          <div className="text-brand-offwhite truncate">
                            {spec.func_name}(
                            <span className="text-brand-offwhite-muted">{spec.param_types.join(', ')}</span>
                            ) <span className="text-brand-muted-gold">→</span> {spec.return_type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Difficulty */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-medium text-brand-offwhite-muted uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={10} className="text-brand-muted-gold" />
                    Difficulty
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium",
                      DIFFICULTY_COLORS[previewData.difficulty]
                    )}>
                      {DIFFICULTY_LABELS[previewData.difficulty - 1]}
                    </span>
                    <span className="text-[10px] text-brand-offwhite-muted">
                      {previewData.difficulty}/5
                    </span>
                    <span className="text-[10px] text-brand-muted-gold">
                      {previewData.xpReward} XP
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Preview Footer */}
          {previewData && (
            <div className="shrink-0 px-3 py-2.5 border-t border-brand-charcoal-border/50">
              <div className="flex gap-2">
                <button
                  onClick={handleApplyPreview}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium bg-brand-success/10 text-brand-success border border-brand-success/20 hover:bg-brand-success/20 transition-colors"
                  aria-label="Apply all preview changes"
                >
                  <CheckCircle2 size={12} />
                  Apply
                </button>
                <button
                  onClick={handleRevert}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium bg-brand-charcoal-base text-brand-offwhite-muted border border-brand-charcoal-border hover:bg-brand-charcoal-hover transition-colors"
                  aria-label="Revert preview"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Chat Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Messages */}
          <div
            className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-3"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-brand-offwhite-muted">
                <BrainCircuit size={28} className="mb-2 opacity-30" />
                <p className="text-[11px] font-medium mb-1">AI Chat</p>
                <p className="text-[10px] max-w-[180px]">
                  Ask questions or request changes to the problem
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.role === 'user' ? (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[85%] bg-brand-muted-gold/10 border border-brand-muted-gold/20 rounded-xl px-3 py-2">
                      <p className="text-[11px] text-brand-offwhite leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ) : msg.status === 'pending' ? (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-charcoal-hover flex items-center justify-center shrink-0">
                      <BrainCircuit size={12} className="text-brand-muted-gold/50" />
                    </div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-muted-gold animate-pulse" />
                        <span className="text-[10px] text-brand-offwhite-muted">Thinking...</span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-brand-charcoal-hover rounded animate-pulse" />
                        <div className="h-1.5 w-3/4 bg-brand-charcoal-hover rounded animate-pulse" />
                        <div className="h-1.5 w-1/2 bg-brand-charcoal-hover rounded animate-pulse" />
                      </div>
                    </div>
                  </motion.div>
                ) : msg.status === 'error' ? (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-error/10 flex items-center justify-center shrink-0">
                      <AlertCircle size={12} className="text-brand-error" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-brand-error/5 border border-brand-error/20 rounded-xl px-3 py-2">
                        <p className="text-[10px] text-brand-error font-medium">Failed</p>
                        <p className="text-[10px] text-brand-offwhite-muted mt-0.5">{msg.error}</p>
                      </div>
                      <button
                        onClick={() => handleRetry(msg.id)}
                        className="text-[10px] text-brand-muted-gold hover:text-brand-muted-gold/80 mt-1 underline underline-offset-2"
                      >
                        Retry
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-muted-gold/10 flex items-center justify-center shrink-0">
                      <BrainCircuit size={12} className="text-brand-muted-gold" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-[11px] text-brand-offwhite leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>

                      {/* Quick Apply button for chat responses with changes */}
                      {msg.response && hasApplyableFields(msg.response) && !msg.applied && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApplyFromChat(msg.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-brand-success/10 text-brand-success border border-brand-success/20 hover:bg-brand-success/20 transition-colors"
                            aria-label="Apply AI suggestion"
                          >
                            <CheckCircle2 size={10} />
                            Apply
                          </button>
                          <button
                            onClick={() => setActivePreview(msg.response!)}
                            className="text-[10px] text-brand-muted-gold hover:text-brand-muted-gold/80"
                          >
                            View preview
                          </button>
                        </div>
                      )}

                      {msg.applied && (
                        <div className="flex items-center gap-1.5 text-[10px] text-brand-success">
                          <CheckCircle2 size={10} />
                          Applied
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}

            {messages.length > 0 && messages[messages.length - 1].status === 'complete' && (
              <div className="text-center pt-1">
                <span className="text-[9px] text-brand-offwhite-muted/50">
                  {messages.length / 2} suggestion{messages.length / 2 !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="shrink-0 px-3 py-2.5 border-t border-brand-charcoal-border/50">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                disabled={loading}
                className={cn(
                  "flex-1 bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-3 py-2",
                  "text-[11px] text-brand-offwhite placeholder:text-brand-offwhite-muted/40",
                  "focus:outline-none focus:border-brand-muted-gold/50 resize-none",
                  "disabled:opacity-40"
                )}
                aria-label="Chat input"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || loading}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-xl transition-all shrink-0",
                  "bg-brand-muted-gold text-brand-charcoal-base",
                  "hover:bg-brand-muted-gold/90",
                  "disabled:opacity-30 disabled:pointer-events-none"
                )}
                aria-label="Send message"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-brand-charcoal-base border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={13} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
