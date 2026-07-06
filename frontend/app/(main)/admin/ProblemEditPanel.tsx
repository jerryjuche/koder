'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Activity, BookOpen, Code2, Lightbulb, Eye, EyeOff, Save, X, Hash, Type, Braces, Tag, Layers, Beaker } from 'lucide-react';
import { Problem, UpdateProblemPayload } from '@/lib/types';

interface ProblemEditPanelProps {
  problem: Problem;
  onSave: (data: UpdateProblemPayload) => Promise<void>;
  onClose: () => void;
}

const DIFFICULTIES = [
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Easy' },
  { value: 3, label: 'Medium' },
  { value: 4, label: 'Hard' },
  { value: 5, label: 'Expert' },
];

const DIFFICULTY_COLORS = [
  'text-[#8DB4B9]',
  'text-brand-success',
  'text-brand-muted-gold',
  'text-brand-error',
  'text-red-400',
];

export default function ProblemEditPanel({ problem, onSave, onClose }: ProblemEditPanelProps) {
  const [title, setTitle] = useState(problem.title || '');
  const [statement, setStatement] = useState(problem.statement || '');
  const [constraints, setConstraints] = useState(problem.constraints || '');
  const [learningObjective, setLearningObjective] = useState(problem.learningObjective || '');
  const [module, setModule] = useState(problem.module || '');
  const [funcName, setFuncName] = useState(problem.func_name || '');
  const [returnType, setReturnType] = useState(problem.return_type || '');
  const [paramTypes, setParamTypes] = useState((problem.param_types || []).join(', '));
  const [difficulty, setDifficulty] = useState(problem.difficulty || 1);
  const [xpReward, setXpReward] = useState(problem.xpReward || 10);
  const [tags, setTags] = useState((problem.tags || []).join(', '));
  const [visible, setVisible] = useState(problem.visible ?? true);
  const [hint1, setHint1] = useState((problem.hints || [])[0] || '');
  const [hint2, setHint2] = useState((problem.hints || [])[1] || '');
  const [hint3, setHint3] = useState((problem.hints || [])[2] || '');
  const [saving, setSaving] = useState(false);
  const [livePreview, setLivePreview] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const hints = [hint1, hint2, hint3].filter(h => h.trim() !== '');
      const parsedParamTypes = paramTypes.split(',').map(s => s.trim()).filter(Boolean);
      const parsedTags = tags.split(',').map(s => s.trim()).filter(Boolean);

      await onSave({
        title: title || undefined,
        statement: statement || undefined,
        constraints: constraints || undefined,
        learning_objective: learningObjective || undefined,
        module: module || undefined,
        func_name: funcName || undefined,
        return_type: returnType || undefined,
        param_types: parsedParamTypes.length > 0 ? parsedParamTypes : undefined,
        hints: hints.length > 0 ? hints : undefined,
        difficulty,
        xp_reward: xpReward,
        tags: parsedTags.length > 0 ? parsedTags : undefined,
        visible,
      });
    } finally {
      setSaving(false);
    }
  };

  const diffLabel = DIFFICULTIES.find(d => d.value === difficulty)?.label || 'Beginner';
  const diffColor = DIFFICULTY_COLORS[difficulty - 1] || 'text-brand-offwhite-muted';

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-brand-charcoal-card border-brand-charcoal-border text-brand-offwhite">
        <DialogHeader className="shrink-0 border-b border-brand-charcoal-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-muted-gold/10 border border-brand-muted-gold/20 flex items-center justify-center">
                <Code2 size={20} className="text-brand-muted-gold" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-brand-offwhite">Edit Problem</DialogTitle>
                <DialogDescription className="text-brand-offwhite-muted text-sm flex items-center gap-2">
                  <span className="font-mono text-xs bg-brand-charcoal-hover px-2 py-0.5 rounded">{problem.slug}</span>
                  <span className={cn("font-medium text-xs", diffColor)}>{diffLabel}</span>
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLivePreview(!livePreview)}
                className={cn(
                  "text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors",
                  livePreview
                    ? "bg-brand-muted-gold/10 text-brand-muted-gold border border-brand-muted-gold/20"
                    : "text-brand-offwhite-muted hover:text-brand-offwhite border border-transparent"
                )}
              >
                {livePreview ? <Eye size={14} /> : <EyeOff size={14} />}
                {livePreview ? 'Editing' : 'Preview'}
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-6 py-5 px-1">
          {livePreview ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-brand-offwhite mb-4">{title || problem.title}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.split(',').map((t, i) => t.trim() && (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-brand-charcoal-hover text-brand-offwhite-muted border border-brand-charcoal-border">
                      {t.trim()}
                    </span>
                  ))}
                </div>
                <div className="prose prose-invert max-w-none">
                  <div className="text-sm text-brand-offwhite leading-relaxed whitespace-pre-wrap">
                    {statement || problem.statement}
                  </div>
                </div>
              </div>
              {(constraints || problem.constraints) && (
                <div className="bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl p-5">
                  <h3 className="text-sm font-bold text-brand-muted-gold mb-2 flex items-center gap-2">
                    <Braces size={14} /> Constraints
                  </h3>
                  <p className="text-sm text-brand-offwhite whitespace-pre-wrap">{constraints || problem.constraints}</p>
                </div>
              )}
              {(learningObjective || problem.learningObjective) && (
                <div className="bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl p-5">
                  <h3 className="text-sm font-bold text-[#8DB4B9] mb-2 flex items-center gap-2">
                    <BookOpen size={14} /> Learning Objective
                  </h3>
                  <p className="text-sm text-brand-offwhite whitespace-pre-wrap">{learningObjective || problem.learningObjective}</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Basic Info */}
              <Section icon={<Type size={16} />} title="Basic Information">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Title">
                    <input value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="Problem title" />
                  </Field>
                  <Field label="Slug">
                    <input value={problem.slug} disabled className="input-field opacity-60 cursor-not-allowed" />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Module">
                    <input value={module} onChange={e => setModule(e.target.value)} className="input-field" placeholder="e.g. math-recursion" />
                  </Field>
                  <Field label="Difficulty">
                    <select value={difficulty} onChange={e => setDifficulty(Number(e.target.value))} className="input-field">
                      {DIFFICULTIES.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="XP Reward">
                    <input type="number" value={xpReward} onChange={e => setXpReward(Number(e.target.value))} className="input-field" min={0} />
                  </Field>
                  <Field label="Tags">
                    <input value={tags} onChange={e => setTags(e.target.value)} className="input-field" placeholder="comma, separated" />
                  </Field>
                </div>
              </Section>

              {/* Description */}
              <Section icon={<BookOpen size={16} />} title="Description">
                <Field label="Statement">
                  <textarea value={statement} onChange={e => setStatement(e.target.value)} className="input-field min-h-[200px] font-mono text-sm leading-relaxed" placeholder="Problem statement in markdown..." />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Constraints">
                    <textarea value={constraints} onChange={e => setConstraints(e.target.value)} className="input-field min-h-[100px]" placeholder="Constraints and limitations..." />
                  </Field>
                  <Field label="Learning Objective">
                    <textarea value={learningObjective} onChange={e => setLearningObjective(e.target.value)} className="input-field min-h-[100px]" placeholder="What the student will learn..." />
                  </Field>
                </div>
              </Section>

              {/* Function Signature */}
              <Section icon={<Braces size={16} />} title="Function Signature">
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Function Name">
                    <input value={funcName} onChange={e => setFuncName(e.target.value)} className="input-field font-mono" placeholder="e.g. Fibonacci" />
                  </Field>
                  <Field label="Return Type">
                    <input value={returnType} onChange={e => setReturnType(e.target.value)} className="input-field font-mono" placeholder="e.g. int" />
                  </Field>
                  <Field label="Param Types">
                    <input value={paramTypes} onChange={e => setParamTypes(e.target.value)} className="input-field font-mono" placeholder="int, string" />
                  </Field>
                </div>
              </Section>

              {/* Hints */}
              <Section icon={<Lightbulb size={16} />} title="Hints">
                <div className="space-y-3">
                  {['Hint 1', 'Hint 2', 'Hint 3'].map((hintLabel, i) => {
                    const val = [hint1, hint2, hint3][i];
                    const setVal = [setHint1, setHint2, setHint3][i];
                    return (
                      <Field key={hintLabel} label={hintLabel}>
                        <textarea
                          value={val}
                          onChange={e => setVal(e.target.value)}
                          className="input-field min-h-[60px] text-sm"
                          placeholder={`Hint ${i + 1}...`}
                        />
                      </Field>
                    );
                  })}
                </div>
              </Section>

              {/* Visibility */}
              <Section icon={<Eye size={16} />} title="Visibility">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-brand-offwhite">Published</div>
                    <div className="text-xs text-brand-offwhite-muted mt-0.5">{visible ? 'Students can see this problem' : 'Hidden from students'}</div>
                  </div>
                  <button
                    onClick={() => setVisible(!visible)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      visible ? 'bg-brand-success' : 'bg-brand-charcoal-border'
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                      visible ? 'right-1' : 'left-1'
                    )} />
                  </button>
                </div>
              </Section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-brand-charcoal-border pt-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-brand-offwhite-muted">
            <Hash size={12} />
            <span>ID: <span className="font-mono">{problem.id.substring(0, 8)}...</span></span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-brand-offwhite-muted hover:text-brand-offwhite border border-brand-charcoal-border hover:bg-brand-charcoal-hover transition-colors flex items-center gap-2">
              <X size={16} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-brand-muted-gold text-brand-charcoal-base hover:bg-brand-muted-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Activity size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Sub-components

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-brand-charcoal-border bg-brand-charcoal-card/50 flex items-center gap-2">
        <span className="text-brand-muted-gold">{icon}</span>
        <h3 className="text-sm font-bold text-brand-offwhite">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-brand-offwhite-muted tracking-wide uppercase">{label}</label>
      {children}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
