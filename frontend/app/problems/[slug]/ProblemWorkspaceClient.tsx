'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import Markdown from 'react-markdown';
import { ChevronLeft, ChevronRight, Play, RotateCcw, Lightbulb, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Copy, Expand } from 'lucide-react';
import { cn, getDifficultyColor, getDifficultyLabel } from '@/lib/utils';
import { fetchProblem, submitSolution } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Problem, TestResult } from '@/lib/types';

const DEFAULT_CODE = `package piscine

// Write your solution here.
// The backend will test your exported function automatically.
`;

export default function ProblemWorkspaceClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [panelMode, setPanelMode] = useState<'tests' | 'hints'>('tests');
  const [hintsOpen, setHintsOpen] = useState([false, false, false]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [testsExpanded, setTestsExpanded] = useState(true);

  useEffect(() => {
    fetchProblem(slug).then(res => {
      if (res.success && res.data) {
        setProblem(res.data);
        const p = res.data;
        if (p.func_name) {
          const params = p.param_types?.map((t, i) => `arg${i + 1} ${t}`).join(', ') || '';
          const ret = p.return_type ? ` ${p.return_type}` : '';
          const scaffold = `package piscine\n\nfunc ${p.func_name}(${params})${ret} {\n\t// Write your solution here\n}\n`;
          setCode(scaffold);
        }
      }
    });
  }, [slug]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setPanelMode('tests');
    setTestsExpanded(true);
    setErrorMsg(null);

    const res = await submitSolution(slug, code);

    if (res.success && res.data) {
      const executionResult = res.data;
      
      if (executionResult.status === 'compiler_error' || executionResult.status === 'timeout') {
         setErrorMsg(executionResult.output_logs || `Execution failed with status: ${executionResult.status}`);
         setResults(null);
         toast.error(`Execution failed: ${executionResult.status}`);
      } else {
         const mappedResults: TestResult[] = (executionResult.test_results || []).map((tr: any, idx: number) => ({
           id: tr.test_case_id || `t${idx}`,
           name: `Case ${tr.ordinal ?? idx + 1}`,
           passed: tr.passed,
           executionTimeMs: executionResult.runtime_ms || 0,
           output: tr.is_hidden && !tr.passed ? '(hidden test case)' : (tr.got || ''),
           expectedOutput: tr.is_hidden && !tr.passed ? '(hidden)' : (tr.expected || ''),
         }));
         setResults(mappedResults);
         
         const passedAll = mappedResults.length > 0 && mappedResults.every(r => r.passed);
         if (passedAll) {
           toast.success("Solution accepted!");
           window.dispatchEvent(new Event('user-updated'));
         } else {
           toast.error("Some test cases failed.");
         }
      }
    } else {
      setErrorMsg(res.error?.message || "Submission failed");
      setResults(null);
      toast.error(res.error?.message || "Submission failed");
    }

    setSubmitting(false);
  };

  const testsPassed = results?.filter(r => r.passed).length || 0;
  const testsTotal = results?.length || 0;
  const allPassed = testsTotal > 0 && testsPassed === testsTotal;

  if (!problem) {
    return <div className="h-screen w-screen bg-brand-charcoal-base flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-brand-muted-gold border-t-transparent animate-spin"></div></div>;
  }

  return (
    <div className="h-screen flex flex-col bg-brand-charcoal-base text-brand-offwhite overflow-hidden">
      {/* Workspace Header */}
      <header className="h-14 border-b border-brand-charcoal-border bg-brand-charcoal-card shrink-0 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-brand-offwhite-muted hover:text-brand-offwhite flex items-center gap-1 text-sm font-medium transition-colors">
            <ChevronLeft size={16} /> Problems
          </Link>
          <div className="w-px h-5 bg-brand-charcoal-border"></div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-brand-offwhite-muted">#{problem.slug === 'hello-world' ? '001' : '002'}</span>
            <span className="font-bold">{problem.title}</span>
            <span className={cn("text-xs font-bold", getDifficultyColor(problem.difficulty))}>{getDifficultyLabel(problem.difficulty)}</span>
            <span className="bg-brand-charcoal-hover text-brand-offwhite-muted px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-brand-charcoal-border">{problem.module}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-brand-muted-gold text-sm font-bold bg-brand-muted-gold/10 px-3 py-1.5 rounded-lg border border-brand-muted-gold/20 mr-2">
            <svg width="10" height="12" viewBox="0 0 12 16" fill="currentColor">
              <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
            </svg>
            +{problem.xpReward} XP
          </div>
          
          <button 
            onClick={() => setPanelMode(panelMode === 'hints' ? 'tests' : 'hints')}
            className={cn("flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors border", 
              panelMode === 'hints' ? "bg-brand-muted-gold/10 text-brand-muted-gold border-brand-muted-gold/30" : "text-brand-offwhite-muted border-transparent hover:text-brand-offwhite hover:bg-brand-charcoal-hover"
            )}
          >
            <Lightbulb size={16} /> Hints
          </button>
          <button className="text-brand-offwhite-muted hover:text-brand-offwhite transition-colors p-1.5 rounded-lg hover:bg-brand-charcoal-hover">
            <RotateCcw size={18} />
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base px-5 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md shadow-brand-muted-gold/10 transition-all disabled:opacity-70"
          >
            {submitting ? <div className="w-4 h-4 border-2 border-brand-charcoal-base/30 border-t-brand-charcoal-base rounded-full animate-spin" /> : <Play size={16} fill="currentColor" />}
            Submit
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Problem Statement */}
        <div className="w-1/3 min-w-[350px] border-r border-brand-charcoal-border bg-brand-charcoal-base overflow-y-auto custom-scrollbar p-6">
          <h1 className="text-2xl font-bold mb-6">{problem.title}</h1>
          <div className="prose prose-invert prose-brand max-w-none text-sm text-brand-offwhite-muted leading-relaxed">
             <div className="markdown-body">
               <Markdown>{problem?.statement || problem?.descriptionMarkdown || "No problem statement available yet. This exercise is pending enrichment."}</Markdown>
             </div>
          </div>
          
          {/* Metadata Cards */}
          <div className="mt-10 mb-2 text-xs font-bold tracking-wider text-brand-offwhite uppercase">Tags</div>
          <div className="flex flex-wrap gap-2 mb-8">
            {problem.tags.map(tag => (
              <span key={tag} className="text-xs bg-brand-charcoal-hover text-brand-offwhite-muted px-2 py-1 rounded-md border border-brand-charcoal-border">
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-brand-charcoal-border pt-6">
             <div className="text-center">
               <div className="text-xl font-bold text-brand-offwhite mb-1">{problem.total_submissions || 0}</div>
               <div className="text-[10px] uppercase font-bold tracking-wide text-brand-offwhite-muted">Submissions</div>
             </div>
             <div className="text-center">
               <div className="text-xl font-bold text-brand-success mb-1">{problem.success_rate !== undefined ? Math.round(problem.success_rate) : 0}%</div>
               <div className="text-[10px] uppercase font-bold tracking-wide text-brand-offwhite-muted">Success Rate</div>
             </div>
             <div className="text-center">
               <div className="text-xl font-bold text-brand-muted-gold mb-1">{problem.difficulty === 1 ? 15 : problem.difficulty === 2 ? 30 : 60}m</div>
               <div className="text-[10px] uppercase font-bold tracking-wide text-brand-offwhite-muted">Est. Time</div>
             </div>
          </div>
        </div>

        {/* Middle: Editor & Results */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0F1115]">
          {/* Editor Header */}
          <div className="h-10 flex items-center justify-between px-4 bg-[#0F1115] border-b border-brand-charcoal-border">
             <div className="flex items-center gap-3">
               <div className="text-xs font-mono font-bold bg-brand-charcoal-hover text-brand-offwhite px-2 py-1 rounded-md border border-brand-charcoal-border">Go</div>
               <span className="text-xs font-mono text-brand-offwhite-muted">solution.go</span>
             </div>
             <div className="flex items-center gap-2">
               <button className="text-brand-offwhite-muted hover:text-brand-offwhite p-1 rounded hover:bg-brand-charcoal-hover transition-colors"><Copy size={16} /></button>
               <button className="text-brand-offwhite-muted hover:text-brand-offwhite p-1 rounded hover:bg-brand-charcoal-hover transition-colors"><Expand size={16} /></button>
             </div>
          </div>
          
          {/* Editor Instance */}
          <div className="flex-1 overflow-hidden relative">
            <Editor
              height="100%"
              defaultLanguage="go"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'var(--font-mono), monospace',
                padding: { top: 16 },
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
                renderLineHighlight: "none",
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
              }}
            />
          </div>

          {/* Bottom Panel (Tests) - Only show if not hints mode or if we specifically want it split */}
          {(results || errorMsg) && (
            <div className={cn(
               "border-t border-brand-charcoal-border bg-brand-charcoal-base transition-all duration-300 flex flex-col",
               testsExpanded ? "h-64" : "h-12"
            )}>
               <div 
                 className="h-12 flex items-center justify-between px-4 cursor-pointer hover:bg-brand-charcoal-hover/50 select-none shrink-0"
                 onClick={() => setTestsExpanded(!testsExpanded)}
               >
                 <div className="flex items-center gap-3">
                   <ChevronRight size={16} className={cn("text-brand-offwhite-muted transition-transform", testsExpanded && "rotate-90")} />
                   <span className="text-sm font-bold text-brand-offwhite">Test Results</span>
                   {!errorMsg && (
                     <span className={cn(
                       "text-xs font-bold px-2 py-0.5 rounded", 
                       allPassed ? "bg-brand-success/20 text-brand-success" : "bg-brand-error/20 text-brand-error"
                     )}>
                       {testsPassed}/{testsTotal}
                     </span>
                   )}
                 </div>
               </div>

               {testsExpanded && (
                 <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                   {errorMsg && (
                     <div className="bg-brand-error/20 border border-brand-error/50 text-brand-error px-5 py-4 rounded-xl text-sm font-bold mb-4 flex items-start gap-3 shadow-sm shadow-brand-error/10">
                       <XCircle size={18} className="mt-0.5 shrink-0" /> 
                       <div>
                         <div className="uppercase text-[10px] tracking-wider opacity-80 mb-1">Submission Failed</div>
                         {errorMsg}
                       </div>
                     </div>
                   )}
                   {!errorMsg && !allPassed && (
                     <div className="flex items-center gap-2 text-brand-error font-medium mb-4">
                       <XCircle size={18} /> {testsPassed}/{testsTotal} tests passed
                     </div>
                   )}
                   {allPassed && (
                     <div className="flex items-center gap-2 text-brand-success font-medium mb-4">
                       <CheckCircle2 size={18} /> All {testsTotal} tests passed successfully!
                     </div>
                   )}

                   {results?.map((res, i) => (
                     <div key={i} className={cn(
                       "rounded-xl border p-4",
                       res.passed ? "bg-brand-success/5 border-brand-success/20" : "bg-brand-error/5 border-brand-error/30"
                     )}>
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3 font-mono text-sm">
                           {res.passed ? <CheckCircle2 size={16} className="text-brand-success" /> : <XCircle size={16} className="text-brand-error" />}
                           <span className={res.passed ? "text-brand-success" : "text-brand-error"}>{res.name}</span>
                         </div>
                         <div className="text-xs font-mono text-brand-offwhite-muted">{res.executionTimeMs.toFixed(1)}ms</div>
                       </div>
                       
                       {!res.passed && res.output && (
                         <div className="mt-4 pt-4 border-t border-brand-error/20 space-y-3">
                           <div>
                             <div className="text-[10px] uppercase font-bold text-brand-offwhite-muted mb-1">Output</div>
                             <div className="bg-[#1A1A1A] rounded p-2 text-sm font-mono text-brand-offwhite border border-brand-charcoal-border whitespace-pre-wrap break-all">{res.output}</div>
                           </div>
                           {res.expectedOutput && (
                             <div>
                               <div className="text-[10px] uppercase font-bold text-brand-offwhite-muted mb-1">Expected</div>
                               <div className="bg-[#1A1A1A] rounded p-2 text-sm font-mono text-brand-success border border-brand-charcoal-border whitespace-pre-wrap break-all">{res.expectedOutput}</div>
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Right: Hints Panel (Collapsible) */}
        {panelMode === 'hints' && (
          <div className="w-80 shrink-0 border-l border-brand-charcoal-border bg-brand-charcoal-card animate-in slide-in-from-right overflow-y-auto custom-scrollbar">
            <div className="p-5 border-b border-brand-charcoal-border flex items-center justify-between">
               <div className="font-bold flex items-center gap-2 text-brand-muted-gold">
                 <Lightbulb size={18} /> Progressive Hints
               </div>
               <span className="text-xs text-brand-offwhite-muted bg-brand-charcoal-base px-2 py-1 rounded">
                 ({hintsOpen.filter(Boolean).length}/3 viewed)
               </span>
            </div>
            <div className="p-5 space-y-4">
              {[
                "Think about using the standard fmt package in Go. Which function prints with a newline?",
                "You don't need to return a value from main(), simply call the print function.",
                "The exact syntax is `fmt.Println(\"Hello, World!\")` inside the main function."
              ].map((hintText, idx) => {
                const isOpen = hintsOpen[idx];
                const isLocked = idx > 0 && !hintsOpen[idx-1];
                return (
                  <div key={idx} className={cn(
                    "border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer",
                    isOpen ? "border-brand-muted-gold bg-brand-muted-gold/5" : 
                    isLocked ? "border-brand-charcoal-border/50 bg-brand-charcoal-base/50 opacity-50" : 
                    "border-brand-charcoal-border bg-brand-charcoal-base hover:border-brand-charcoal-hover hover:bg-brand-charcoal-hover/50"
                  )}
                  onClick={() => {
                    if (isLocked) return;
                    const newOpen = [...hintsOpen];
                    newOpen[idx] = !newOpen[idx];
                    setHintsOpen(newOpen);
                  }}
                  >
                    <div className="p-4 flex items-center justify-between">
                       <span className={cn("text-sm font-bold flex items-center gap-2", isOpen ? "text-brand-muted-gold" : "text-brand-offwhite-muted")}>
                         <Lightbulb size={16} className={isOpen ? "fill-brand-muted-gold text-brand-muted-gold" : ""} /> Hint {idx + 1}
                         {!isOpen && <span className="font-normal text-xs ml-1">· Click to unlock</span>}
                       </span>
                       {isOpen ? <ChevronUp size={16} className="text-brand-muted-gold"/> : <ChevronDown size={16} className="text-brand-offwhite-muted" />}
                    </div>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-sm text-brand-offwhite animate-in slide-in-from-top-2 fade-in">
                        {hintText}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
