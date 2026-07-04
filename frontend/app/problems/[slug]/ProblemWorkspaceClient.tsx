"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import {
  ChevronLeft,
  Play,
  RotateCcw,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Copy,
  Expand,
} from "lucide-react";
import { cn, getDifficultyColor, getDifficultyLabel } from "@/lib/utils";
import { fetchProblem, submitSolution, testCode } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Problem, TestResult, ExecutionResult } from "@/lib/types";
import TestResultPanel from "@/components/TestResultPanel";

const DEFAULT_CODE = `package piscine

// Write your solution here.
// The backend will test your exported function automatically.
`;

const STORE_KEY = (s: string) => `koder_code_${s}`;

export default function ProblemWorkspaceClient({ slug }: { slug: string }) {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [panelMode, setPanelMode] = useState<"tests" | "hints">("tests");
  const [hintsOpen, setHintsOpen] = useState<boolean[]>(Array(10).fill(false));
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastExecution, setLastExecution] = useState<any>(null);
  const [testsExpanded, setTestsExpanded] = useState(true);
  const [saved, setSaved] = useState(true);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    fetchProblem(slug).then((res) => {
      if (res.success && res.data) {
        setProblem(res.data);
        const p = res.data;
        if (p.func_name) {
          const params =
            p.param_types?.map((t, i) => `arg${i + 1} ${t}`).join(", ") || "";
          const ret = p.return_type ? ` ${p.return_type}` : "";
          const scaffold = `package piscine\n\nfunc ${p.func_name}(${params})${ret} {\n\t// Write your solution here\n}\n`;
          setCode(scaffold);
          setSaved(true);
        }
      }
    });
  }, [slug]);

  // Cooldown countdown for rate limiting
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-save to localStorage with 2s debounce
  useEffect(() => {
    if (!problem) return;
    const timer = setTimeout(() => {
      localStorage.setItem(STORE_KEY(slug), code);
      setSaved(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [code, slug, problem]);

  // Restore saved code on mount
  useEffect(() => {
    if (!problem || !problem.func_name) return;
    const savedCode = localStorage.getItem(STORE_KEY(slug));
    if (savedCode) {
      setCode(savedCode);
      setSaved(true);
    }
  }, [problem, slug]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) handleSubmit();
        else handleTest();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleFormat();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const handleReset = () => {
    const p = problem;
    let fresh: string;
    if (p?.func_name) {
      const params =
        p.param_types?.map((t, i) => `arg${i + 1} ${t}`).join(", ") || "";
      const ret = p.return_type ? ` ${p.return_type}` : "";
      fresh = `package piscine\n\nfunc ${p.func_name}(${params})${ret} {\n\t// Write your solution here\n}\n`;
    } else {
      fresh = DEFAULT_CODE;
    }
    setCode(fresh);
    setSaved(true);
    setResults(null);
    setErrorMsg(null);
    setLastExecution(null);
    setHintsOpen(Array(10).fill(false));
    localStorage.removeItem(STORE_KEY(slug));
    toast.success("Reset to original scaffold");
  };

  const handleFormat = () => {
    const ed = editorRef.current;
    if (!ed) return;
    const raw = ed.getValue();
    const formatted = raw
      .split("\n")
      .map((l: string) => l.replace(/[ \t]+$/, ""))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^(\t*) +/gm, (_: string, tabs: string) => tabs + " ".repeat(4))
      .trimEnd() + "\n";
    ed.executeEdits("format", [
      {
        range: ed.getModel().getFullModelRange(),
        text: formatted,
        forceMoveMarkers: true,
      },
    ]);
    setCode(formatted);
    setSaved(true);
    toast.success("Code formatted");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setPanelMode("tests");
    setTestsExpanded(true);
    setErrorMsg(null);

    const res = await submitSolution(slug, code);

    if (res.success && res.data) {
      const executionResult = res.data;
      setLastExecution(executionResult);

      if (
        executionResult.status === "compiler_error" ||
        executionResult.status === "timeout"
      ) {
        setErrorMsg(null); // Clear generic errorMsg, we use lastExecution
        setResults(null);
        toast.error(`Execution failed: ${executionResult.friendly_message || executionResult.status}`);
      } else {
        const mappedResults: TestResult[] = (
          executionResult.test_results || []
        ).map((tr: any, idx: number) => ({
          id: tr.test_case_id || `t${idx}`,
          name: `Case ${tr.ordinal ?? idx + 1}`,
          passed: tr.passed,
          executionTimeMs: executionResult.runtime_ms || 0,
          output:
            tr.is_hidden && !tr.passed ? "(hidden test case)" : tr.got || "",
          expectedOutput:
            tr.is_hidden && !tr.passed ? "(hidden)" : tr.expected || "",
        }));
        setResults(mappedResults);

        const passedAll =
          mappedResults.length > 0 && mappedResults.every((r) => r.passed);
        if (passedAll) {
          toast.success("Solution accepted!");
          window.dispatchEvent(new Event("user-updated"));
          sessionStorage.setItem(`koder_solution_${slug}`, code);
          router.push(`/problems/${slug}/success`);
        } else {
          toast.error("Some test cases failed.");
        }
      }
    } else if (res.error?.code === "RATE_LIMITED") {
      setErrorMsg(null);
      setResults(null);
      setLastExecution(null);
      const match = res.error.message.match(/(\d+)/);
      const seconds = match ? parseInt(match[1]) : 10;
      setCooldown(seconds);
      toast.error(res.error.message);
    } else {
      setErrorMsg(res.error?.message || "Submission failed");
      setResults(null);
      setLastExecution(null);
      toast.error(res.error?.message || "Submission failed");
    }

    setSubmitting(false);
  };

  const handleTest = async () => {
    setSubmitting(true);
    setPanelMode("tests");
    setTestsExpanded(true);
    setErrorMsg(null);

    const res = await testCode(slug, code);

    if (res.success && res.data) {
      const executionResult = res.data;
      setLastExecution(executionResult);

      if (
        executionResult.status === "compiler_error" ||
        executionResult.status === "timeout"
      ) {
        setErrorMsg(null);
        setResults(null);
        toast.error(`Test failed: ${executionResult.friendly_message || executionResult.status}`);
      } else {
        const mappedResults: TestResult[] = (
          executionResult.test_results || []
        ).map((tr: any, idx: number) => ({
          id: tr.test_case_id || `t${idx}`,
          name: `Case ${tr.ordinal ?? idx + 1}`,
          passed: tr.passed,
          executionTimeMs: executionResult.runtime_ms || 0,
          output:
            tr.is_hidden && !tr.passed ? "(hidden test case)" : tr.got || "",
          expectedOutput:
            tr.is_hidden && !tr.passed ? "(hidden)" : tr.expected || "",
        }));
        setResults(mappedResults);

        const passedAll =
          mappedResults.length > 0 && mappedResults.every((r) => r.passed);
        if (passedAll) {
          toast.success("All visible tests passed!");
        } else {
          toast.error("Some test cases failed.");
        }
      }
    } else if (res.error?.code === "RATE_LIMITED") {
      setErrorMsg(null);
      setResults(null);
      setLastExecution(null);
      const match = res.error.message.match(/(\d+)/);
      const seconds = match ? parseInt(match[1]) : 10;
      setCooldown(seconds);
      toast.error(res.error.message);
    } else {
      setErrorMsg(res.error?.message || "Test failed");
      setResults(null);
      setLastExecution(null);
      toast.error(res.error?.message || "Test failed");
    }

    setSubmitting(false);
  };

  if (!problem) {
    return (
      <div className="h-screen w-screen bg-brand-charcoal-base flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-muted-gold border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-brand-charcoal-base text-brand-offwhite overflow-hidden">
      {/* Workspace Header */}
      <header className="h-14 border-b border-brand-charcoal-border bg-brand-charcoal-card shrink-0 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/home"
            className="text-brand-offwhite-muted hover:text-brand-offwhite flex items-center gap-1 text-sm font-medium transition-colors"
          >
            <ChevronLeft size={16} /> Problems
          </Link>
          <div className="w-px h-5 bg-brand-charcoal-border"></div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-brand-offwhite-muted">
              #{problem.slug === "hello-world" ? "001" : "002"}
            </span>
            <span className="font-bold">{problem.title}</span>
            <span
              className={cn(
                "text-xs font-bold",
                getDifficultyColor(problem.difficulty),
              )}
            >
              {getDifficultyLabel(problem.difficulty)}
            </span>
            <span className="bg-brand-charcoal-hover text-brand-offwhite-muted px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-brand-charcoal-border">
              {problem.module}
            </span>
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
            onClick={() =>
              setPanelMode(panelMode === "hints" ? "tests" : "hints")
            }
            className={cn(
              "flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors border",
              panelMode === "hints"
                ? "bg-brand-muted-gold/10 text-brand-muted-gold border-brand-muted-gold/30"
                : "text-brand-offwhite-muted border-transparent hover:text-brand-offwhite hover:bg-brand-charcoal-hover",
            )}
          >
            <Lightbulb size={16} /> Hints
          </button>
          <button
            onClick={handleReset}
            className="text-brand-offwhite-muted hover:text-brand-offwhite transition-colors p-1.5 rounded-lg hover:bg-brand-charcoal-hover"
            title="Reset code to original"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={handleTest}
            disabled={submitting || cooldown > 0}
            className="text-brand-offwhite-muted hover:text-brand-offwhite px-4 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors border border-brand-charcoal-border hover:border-brand-offwhite/30 disabled:opacity-70"
          >
            {cooldown > 0 ? (
              <span className="text-brand-muted-gold font-mono">{cooldown}s</span>
            ) : submitting ? (
              <div className="w-4 h-4 border-2 border-brand-charcoal-border border-t-brand-offwhite rounded-full animate-spin" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
            {cooldown > 0 ? "Wait" : "Test"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || cooldown > 0}
            className="bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base px-5 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md shadow-brand-muted-gold/10 transition-all disabled:opacity-70"
          >
            {cooldown > 0 ? (
              <span className="text-brand-charcoal-base font-mono">{cooldown}s</span>
            ) : submitting ? (
              <div className="w-4 h-4 border-2 border-brand-charcoal-base/30 border-t-brand-charcoal-base rounded-full animate-spin" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
            {cooldown > 0 ? "Wait" : "Submit"}
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Problem Statement */}
        <div className="w-1/3 min-w-[350px] border-r border-brand-charcoal-border bg-brand-charcoal-base overflow-y-auto custom-scrollbar">
          <div className="p-6">
            {/* Problem Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-brand-offwhite mb-3">
                {problem.title}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={cn(
                    "text-sm font-bold px-3 py-1 rounded-full",
                    getDifficultyColor(problem.difficulty),
                  )}
                >
                  {getDifficultyLabel(problem.difficulty)}
                </span>
                <span className="text-xs font-mono text-brand-offwhite-muted bg-brand-charcoal-hover px-2.5 py-1 rounded border border-brand-charcoal-border">
                  Go
                </span>
                {problem.solved && (
                  <span className="text-xs font-bold text-brand-success bg-brand-success/10 px-2.5 py-1 rounded border border-brand-success/30">
                    ✓ Solved
                  </span>
                )}
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-brand-charcoal-border/50">
              <div className="bg-brand-charcoal-card rounded-lg p-3 border border-brand-charcoal-border">
                <div className="text-lg font-bold text-brand-offwhite">
                  {problem.success_rate !== undefined
                    ? Math.round(problem.success_rate)
                    : 0}
                  %
                </div>
                <div className="text-xs text-brand-offwhite-muted font-medium">
                  Acceptance
                </div>
              </div>
              <div className="bg-brand-charcoal-card rounded-lg p-3 border border-brand-charcoal-border">
                <div className="text-lg font-bold text-brand-offwhite">
                  {problem.total_submissions || 0}
                </div>
                <div className="text-xs text-brand-offwhite-muted font-medium">
                  Submissions
                </div>
              </div>
              <div className="bg-brand-charcoal-card rounded-lg p-3 border border-brand-charcoal-border">
                <div className="text-lg font-bold text-brand-muted-gold">
                  {problem.estTimeMinutes ||
                    (problem as any).EstTimeMinutes ||
                    (problem.difficulty === 1
                      ? 15
                      : problem.difficulty === 2
                        ? 30
                        : 60)}
                  m
                </div>
                <div className="text-xs text-brand-offwhite-muted font-medium">
                  Time
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-widest text-brand-offwhite mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-muted-gold shadow-[0_0_8px_rgba(238,197,126,0.8)]"></span>
                Description
              </div>
              <div className="relative rounded-xl border border-brand-charcoal-border/80 bg-gradient-to-br from-brand-charcoal-card/90 to-brand-charcoal-base/50 p-6 shadow-lg backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-brand-muted-gold/5">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-muted-gold to-transparent opacity-70"></div>
                <div className="prose prose-invert prose-brand prose-sm sm:prose-base max-w-none text-brand-offwhite-muted leading-relaxed prose-pre:bg-[#0B0B0B] prose-pre:border prose-pre:border-brand-charcoal-border prose-a:text-brand-muted-gold hover:prose-a:text-brand-offwhite transition-colors">
                  <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                    {problem?.statement ||
                      problem?.descriptionMarkdown ||
                      "No problem statement available yet. This exercise is pending enrichment."}
                  </Markdown>
                </div>
              </div>
            </div>

            {/* Examples Section */}
            {problem.examples && problem.examples.length > 0 && (
              <div className="mb-8">
                <div className="text-xs font-bold uppercase tracking-widest text-brand-offwhite mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-success shadow-[0_0_8px_rgba(62,207,142,0.8)]"></span>
                  Examples
                </div>
                <div className="space-y-4">
                  {problem.examples.map((ex, idx) => (
                    <div
                      key={ex.id}
                      className="group rounded-xl border border-brand-charcoal-border bg-gradient-to-br from-[#0F1115] to-[#0A0C0F] overflow-hidden shadow-md transition-all duration-300 hover:border-brand-charcoal-border/80 hover:shadow-lg"
                    >
                      <div className="px-5 py-2.5 bg-brand-charcoal-hover/40 border-b border-brand-charcoal-border/50 flex items-center justify-between">
                        <div className="text-xs font-bold tracking-wide text-brand-offwhite/80 uppercase">
                          Example {idx + 1}
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-brand-offwhite-muted/70 mb-2">
                            Input
                          </div>
                          <div className="font-mono text-sm text-brand-offwhite break-words whitespace-pre-wrap bg-[#050608] p-3.5 rounded-lg border border-brand-charcoal-border/60 shadow-inner">
                            {ex.input}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-brand-offwhite-muted/70 mb-2">
                            Expected Output
                          </div>
                          <div className="font-mono text-sm text-brand-success break-words whitespace-pre-wrap bg-[#050608] p-3.5 rounded-lg border border-brand-success/20 shadow-inner">
                            {ex.expected}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints Section */}
            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-widest text-brand-offwhite mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-charcoal-border shadow-[0_0_8px_rgba(255,255,255,0.2)]"></span>
                Constraints
              </div>
              <div className="rounded-xl border border-brand-charcoal-border bg-gradient-to-br from-brand-charcoal-card/80 to-transparent p-5 backdrop-blur-sm">
                <ul className="space-y-3 text-sm text-brand-offwhite-muted">
                  {problem.param_types && problem.param_types.length > 0 && (
                    <li className="flex items-start gap-3">
                      <span className="text-brand-muted-gold mt-1 text-xs">◆</span>
                      <span>
                        <span className="font-mono text-brand-offwhite/90">
                          Parameters:
                        </span>{" "}
                        {problem.param_types.map((t) => `${t}`).join(", ")}
                      </span>
                    </li>
                  )}
                  {problem.return_type && (
                    <li className="flex items-start gap-3">
                      <span className="text-brand-muted-gold mt-1 text-xs">◆</span>
                      <span>
                        <span className="font-mono text-brand-offwhite/90">
                          Return Type:
                        </span>{" "}
                        {problem.return_type}
                      </span>
                    </li>
                  )}
                  <li className="flex items-start gap-3">
                    <span className="text-brand-muted-gold mt-1 text-xs">◆</span>
                    <span>
                      <span className="font-mono text-brand-offwhite/90">
                        Difficulty:
                      </span>{" "}
                      {getDifficultyLabel(problem.difficulty)}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-muted-gold mt-1 text-xs">◆</span>
                    <span>
                      <span className="font-mono text-brand-offwhite/90">
                        Time Limit:
                      </span>{" "}
                      {problem.estTimeMinutes ||
                        (problem.difficulty === 1
                          ? 15
                          : problem.difficulty === 2
                            ? 30
                            : 60)}{" "}
                      minutes
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tags Section */}
            {problem.tags && problem.tags.length > 0 && (
              <div className="mb-8">
                <div className="text-xs font-bold uppercase tracking-widest text-brand-offwhite mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-offwhite/50 shadow-[0_0_8px_rgba(255,255,255,0.4)]"></span>
                  Topics
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {problem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] uppercase tracking-wider bg-brand-muted-gold/5 text-brand-muted-gold px-3.5 py-1.5 rounded-full border border-brand-muted-gold/20 font-bold hover:bg-brand-muted-gold/10 hover:border-brand-muted-gold/40 transition-colors cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Middle: Editor & Results */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0F1115]">
          {/* Editor Header */}
          <div className="h-10 flex items-center justify-between px-4 bg-[#0F1115] border-b border-brand-charcoal-border">
            <div className="flex items-center gap-3">
              <div className="text-xs font-mono font-bold bg-brand-charcoal-hover text-brand-offwhite px-2 py-1 rounded-md border border-brand-charcoal-border">
                Go
              </div>
              <span className="text-xs font-mono text-brand-offwhite-muted">
                solution.go
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!saved && (
                <span className="text-[10px] text-brand-offwhite-muted/60 animate-pulse">
                  ● Unsaved
                </span>
              )}
              {saved && code !== DEFAULT_CODE && (
                <span className="text-[10px] text-brand-success/60">
                  ● Saved
                </span>
              )}
              <button
                onClick={handleFormat}
                className="text-xs text-brand-offwhite-muted hover:text-brand-offwhite px-2 py-1 rounded hover:bg-brand-charcoal-hover transition-colors border border-brand-charcoal-border font-mono"
                title="Format code (Ctrl+S)"
              >
                {`{ }`}
              </button>
              <button className="text-brand-offwhite-muted hover:text-brand-offwhite p-1 rounded hover:bg-brand-charcoal-hover transition-colors">
                <Copy size={16} />
              </button>
              <button className="text-brand-offwhite-muted hover:text-brand-offwhite p-1 rounded hover:bg-brand-charcoal-hover transition-colors">
                <Expand size={16} />
              </button>
            </div>
          </div>

          {/* Editor Instance */}
          <div className="flex-1 overflow-hidden relative">
            <Editor
              height="100%"
              defaultLanguage="go"
              theme="vs-dark"
              value={code}
              onChange={(v) => {
                setCode(v || "");
                setSaved(false);
              }}
              onMount={(editor, monaco) => {
                editorRef.current = editor;
                monacoRef.current = monaco;
                const pkgMethods: Record<string, { label: string; detail: string; insertText: string }[]> = {
                  fmt: [
                    { label: "Println(a ...any)", detail: "fmt.Println", insertText: "Println(${1:})" },
                    { label: "Printf(format string, a ...any)", detail: "fmt.Printf", insertText: "Printf(\"${1:}\\n\", ${2:})" },
                    { label: "Sprintf(format string, a ...any)", detail: "fmt.Sprintf", insertText: "Sprintf(\"${1:}\\n\", ${2:})" },
                    { label: "Fprint(w io.Writer, a ...any)", detail: "fmt.Fprint", insertText: "Fprint(${1:w}, ${2:})" },
                    { label: "Fprintln(w io.Writer, a ...any)", detail: "fmt.Fprintln", insertText: "Fprintln(${1:w}, ${2:})" },
                    { label: "Errorf(format string, a ...any)", detail: "fmt.Errorf", insertText: "Errorf(\"${1:}\\n\", ${2:})" },
                    { label: "Scan(a ...any)", detail: "fmt.Scan", insertText: "Scan(${1:})" },
                    { label: "Scanf(format string, a ...any)", detail: "fmt.Scanf", insertText: "Scanf(\"${1:}\", ${2:})" },
                    { label: "Sscan(str string, a ...any)", detail: "fmt.Sscan", insertText: "Sscan(\"${1:}\", ${2:})" },
                  ],
                  strings: [
                    { label: "Contains(s, substr string) bool", detail: "strings.Contains", insertText: "Contains(${1:s}, ${2:substr})" },
                    { label: "Count(s, substr string) int", detail: "strings.Count", insertText: "Count(${1:s}, ${2:substr})" },
                    { label: "HasPrefix(s, prefix string) bool", detail: "strings.HasPrefix", insertText: "HasPrefix(${1:s}, ${2:prefix})" },
                    { label: "HasSuffix(s, suffix string) bool", detail: "strings.HasSuffix", insertText: "HasSuffix(${1:s}, ${2:suffix})" },
                    { label: "Index(s, substr string) int", detail: "strings.Index", insertText: "Index(${1:s}, ${2:substr})" },
                    { label: "Join(elems []string, sep string) string", detail: "strings.Join", insertText: "Join(${1:elems}, \"${2:sep}\")" },
                    { label: "Split(s, sep string) []string", detail: "strings.Split", insertText: "Split(${1:s}, \"${2:sep}\")" },
                    { label: "ToLower(s string) string", detail: "strings.ToLower", insertText: "ToLower(${1:s})" },
                    { label: "ToUpper(s string) string", detail: "strings.ToUpper", insertText: "ToUpper(${1:s})" },
                    { label: "Trim(s, cutset string) string", detail: "strings.Trim", insertText: "Trim(${1:s}, \"${2:cutset}\")" },
                    { label: "TrimSpace(s string) string", detail: "strings.TrimSpace", insertText: "TrimSpace(${1:s})" },
                    { label: "Replace(s, old, new string, n int) string", detail: "strings.Replace", insertText: "Replace(${1:s}, \"${2:old}\", \"${3:new}\", ${4:n})" },
                    { label: "Fields(s string) []string", detail: "strings.Fields", insertText: "Fields(${1:s})" },
                  ],
                  math: [
                    { label: "Abs(x float64) float64", detail: "math.Abs", insertText: "Abs(${1:x})" },
                    { label: "Pow(x, y float64) float64", detail: "math.Pow", insertText: "Pow(${1:x}, ${2:y})" },
                    { label: "Sqrt(x float64) float64", detail: "math.Sqrt", insertText: "Sqrt(${1:x})" },
                    { label: "Max(x, y float64) float64", detail: "math.Max", insertText: "Max(${1:x}, ${2:y})" },
                    { label: "Min(x, y float64) float64", detail: "math.Min", insertText: "Min(${1:x}, ${2:y})" },
                    { label: "Floor(x float64) float64", detail: "math.Floor", insertText: "Floor(${1:x})" },
                    { label: "Ceil(x float64) float64", detail: "math.Ceil", insertText: "Ceil(${1:x})" },
                    { label: "Round(x float64) float64", detail: "math.Round", insertText: "Round(${1:x})" },
                    { label: "Sin(x float64) float64", detail: "math.Sin", insertText: "Sin(${1:x})" },
                    { label: "Cos(x float64) float64", detail: "math.Cos", insertText: "Cos(${1:x})" },
                    { label: "Exp(x float64) float64", detail: "math.Exp", insertText: "Exp(${1:x})" },
                    { label: "Log(x float64) float64", detail: "math.Log", insertText: "Log(${1:x})" },
                  ],
                  sort: [
                    { label: "Ints(a []int)", detail: "sort.Ints", insertText: "Ints(${1:a})" },
                    { label: "Strings(a []string)", detail: "sort.Strings", insertText: "Strings(${1:a})" },
                    { label: "Float64s(a []float64)", detail: "sort.Float64s", insertText: "Float64s(${1:a})" },
                    { label: "SearchInts(a []int, x int) int", detail: "sort.SearchInts", insertText: "SearchInts(${1:a}, ${2:x})" },
                    { label: "SearchStrings(a []string, x string) int", detail: "sort.SearchStrings", insertText: "SearchStrings(${1:a}, \"${2:x}\")" },
                    { label: "Slice(x any, less func(i, j int) bool)", detail: "sort.Slice", insertText: "Slice(${1:x}, func(i, j int) bool { return ${2:} })" },
                    { label: "IsSorted(data Interface) bool", detail: "sort.IsSorted", insertText: "IsSorted(${1:data})" },
                    { label: "Reverse(data Interface) Interface", detail: "sort.Reverse", insertText: "Reverse(${1:data})" },
                  ],
                  os: [
                    { label: "Getenv(key string) string", detail: "os.Getenv", insertText: "Getenv(\"${1:key}\")" },
                    { label: "Setenv(key, value string) error", detail: "os.Setenv", insertText: "Setenv(\"${1:key}\", \"${2:value}\")" },
                    { label: "Getwd() (string, error)", detail: "os.Getwd", insertText: "Getwd()" },
                    { label: "Chdir(dir string) error", detail: "os.Chdir", insertText: "Chdir(\"${1:dir}\")" },
                    { label: "Exit(code int)", detail: "os.Exit", insertText: "Exit(${1:code})" },
                    { label: "ReadFile(name string) ([]byte, error)", detail: "os.ReadFile", insertText: "ReadFile(\"${1:name}\")" },
                    { label: "WriteFile(name string, data []byte, perm FileMode) error", detail: "os.WriteFile", insertText: "WriteFile(\"${1:name}\", ${2:data}, ${3:0644})" },
                  ],
                  strconv: [
                    { label: "Atoi(s string) (int, error)", detail: "strconv.Atoi", insertText: "Atoi(${1:s})" },
                    { label: "Itoa(i int) string", detail: "strconv.Itoa", insertText: "Itoa(${1:i})" },
                    { label: "ParseFloat(s string, bitSize int) (float64, error)", detail: "strconv.ParseFloat", insertText: "ParseFloat(\"${1:s}\", ${2:bitSize})" },
                    { label: "FormatFloat(f float64, fmt byte, prec, bitSize int) string", detail: "strconv.FormatFloat", insertText: "FormatFloat(${1:f}, '${2:f}', ${3:-1}, ${4:64})" },
                  ],
                  time: [
                    { label: "Now() Time", detail: "time.Now", insertText: "Now()" },
                    { label: "Since(t Time) Duration", detail: "time.Since", insertText: "Since(${1:t})" },
                    { label: "Sleep(d Duration)", detail: "time.Sleep", insertText: "Sleep(${1:d})" },
                    { label: "Parse(layout, value string) (Time, error)", detail: "time.Parse", insertText: "Parse(\"${1:2006-01-02}\", \"${2:value}\")" },
                  ],
                  errors: [
                    { label: "New(text string) error", detail: "errors.New", insertText: "New(\"${1:text}\")" },
                    { label: "As(err error, target any) bool", detail: "errors.As", insertText: "As(${1:err}, ${2:target})" },
                    { label: "Is(err, target error) bool", detail: "errors.Is", insertText: "Is(${1:err}, ${2:target})" },
                    { label: "Unwrap(err error) error", detail: "errors.Unwrap", insertText: "Unwrap(${1:err})" },
                  ],
                  "encoding/json": [
                    { label: "Marshal(v any) ([]byte, error)", detail: "json.Marshal", insertText: "Marshal(${1:v})" },
                    { label: "Unmarshal(data []byte, v any) error", detail: "json.Unmarshal", insertText: "Unmarshal(${1:data}, ${2:v})" },
                    { label: "NewDecoder(r io.Reader) *Decoder", detail: "json.NewDecoder", insertText: "NewDecoder(${1:r})" },
                    { label: "NewEncoder(w io.Writer) *Encoder", detail: "json.NewEncoder", insertText: "NewEncoder(${1:w})" },
                  ],
                };

                const allPackages = [
                  "fmt", "strings", "io", "os", "time", "math", "sort",
                  "encoding/json", "net/http", "context", "errors",
                  "bufio", "bytes", "crypto", "database/sql", "flag",
                  "hash", "html", "image", "log", "mime", "net", "path",
                  "regexp", "sync", "syscall", "testing", "text/template",
                  "unicode", "archive/tar", "archive/zip", "compress/gzip",
                  "strconv", "reflect",
                ];

                const keywords = [
                  "func", "var", "const", "if", "else", "for", "switch",
                  "case", "default", "break", "continue", "return", "defer",
                  "go", "chan", "select", "range", "type", "struct",
                  "interface", "map", "slice", "array", "import", "package",
                  "fallthrough", "goto", "panic", "recover", "nil", "true", "false",
                  "int", "string", "bool", "float64", "byte", "rune", "error",
                  "int8", "int16", "int32", "int64", "uint", "uint8", "uint16",
                  "uint32", "uint64", "float32", "complex64", "complex128",
                ];

                monaco.languages.registerHoverProvider("go", {
                  provideHover: (model: any, position: any) => {
                    const word = model.getWordAtPosition(position);
                    if (!word) return null;
                    const lineContent = model.getLineContent(position.lineNumber);
                    const beforeMatch = lineContent.slice(0, word.startColumn - 1).match(/(\w+)\.\s*$/);
                    if (beforeMatch) {
                      const pkgName = beforeMatch[1];
                      const fnName = word.word;
                      const methods = pkgMethods[pkgName];
                      if (methods) {
                        const match = methods.find((m) => m.label.startsWith(fnName));
                        if (match) {
                          return {
                            contents: [
                              { value: `**${match.detail}**` },
                              { value: `\`\`\`go\nfunc ${match.label}\n\`\`\`` },
                            ],
                          };
                        }
                      }
                    }
                    return null;
                  },
                });

                monaco.languages.registerCompletionItemProvider("go", {
                  triggerCharacters: ["."],
                  provideCompletionItems: (model: any, position: any) => {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                      startLineNumber: position.lineNumber,
                      endLineNumber: position.lineNumber,
                      startColumn: word.startColumn,
                      endColumn: position.column,
                    };

                    const textUntilPos = model.getValueInRange({
                      startLineNumber: position.lineNumber,
                      startColumn: 1,
                      endLineNumber: position.lineNumber,
                      endColumn: position.column,
                    });

                    const dotMatch = textUntilPos.match(/(\w+)\.\s*$/);

                    if (dotMatch) {
                      const pkgName = dotMatch[1];
                      const methods = pkgMethods[pkgName];
                      if (methods) {
                        return {
                          suggestions: methods.map((m) => ({
                            label: m.label,
                            kind: monaco.languages.CompletionItemKind.Function,
                            insertText: m.insertText,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            range,
                            detail: m.detail,
                          })),
                        };
                      }
                      return { suggestions: [] };
                    }

                    const suggestions = [
                      ...allPackages.map((pkg) => ({
                        label: pkg,
                        kind: monaco.languages.CompletionItemKind.Module,
                        insertText: pkg,
                        range,
                        detail: "Go package",
                      })),
                      ...keywords.map((kw) => ({
                        label: kw,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: kw,
                        range,
                        detail: "Go keyword",
                      })),
                    ];

                    return { suggestions };
                  },
                });
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "var(--font-mono), monospace",
                padding: { top: 16 },
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
                renderLineHighlight: "none",
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                quickSuggestions: false,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: "smart",
              }}
            />
          </div>

          {/* Bottom Panel (Tests) — Professional Test Result Display */}
          <TestResultPanel
            results={results}
            execution={lastExecution as ExecutionResult | null}
            errorMsg={errorMsg}
            expanded={testsExpanded}
            onToggle={() => setTestsExpanded(!testsExpanded)}
          />
        </div>

        {/* Right: Hints Panel (Collapsible) */}
        {panelMode === "hints" && (
          <div className="w-80 shrink-0 border-l border-brand-charcoal-border bg-brand-charcoal-card animate-in slide-in-from-right overflow-y-auto custom-scrollbar">
            <div className="p-5 border-b border-brand-charcoal-border flex items-center justify-between">
              <div className="font-bold flex items-center gap-2 text-brand-muted-gold">
                <Lightbulb size={18} /> Progressive Hints
              </div>
              <span className="text-xs text-brand-offwhite-muted bg-brand-charcoal-base px-2 py-1 rounded">
                ({hintsOpen.filter(Boolean).length}/{problem.hints?.length || 3} viewed)
              </span>
            </div>
            <div className="p-5 space-y-4">
              {(problem.hints && problem.hints.length > 0 ? problem.hints : [
                "Think about using the standard fmt package in Go. Which function prints with a newline?",
                "You don't need to return a value from main(), simply call the print function.",
                'The exact syntax is `fmt.Println("Hello, World!")` inside the main function.',
              ]).map((hintText, idx) => {
                const isOpen = hintsOpen[idx];
                const isLocked = idx > 0 && !hintsOpen[idx - 1];
                return (
                  <div
                    key={idx}
                    className={cn(
                      "border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer",
                      isOpen
                        ? "border-brand-muted-gold bg-brand-muted-gold/5"
                        : isLocked
                          ? "border-brand-charcoal-border/50 bg-brand-charcoal-base/50 opacity-50"
                          : "border-brand-charcoal-border bg-brand-charcoal-base hover:border-brand-charcoal-hover hover:bg-brand-charcoal-hover/50",
                    )}
                    onClick={() => {
                      if (isLocked) return;
                      const newOpen = [...hintsOpen];
                      newOpen[idx] = !newOpen[idx];
                      setHintsOpen(newOpen);
                    }}
                  >
                    <div className="p-4 flex items-center justify-between">
                      <span
                        className={cn(
                          "text-sm font-bold flex items-center gap-2",
                          isOpen
                            ? "text-brand-muted-gold"
                            : "text-brand-offwhite-muted",
                        )}
                      >
                        <Lightbulb
                          size={16}
                          className={
                            isOpen
                              ? "fill-brand-muted-gold text-brand-muted-gold"
                              : ""
                          }
                        />{" "}
                        Hint {idx + 1}
                        {!isOpen && (
                          <span className="font-normal text-xs ml-1">
                            · Click to unlock
                          </span>
                        )}
                      </span>
                      {isOpen ? (
                        <ChevronUp
                          size={16}
                          className="text-brand-muted-gold"
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          className="text-brand-offwhite-muted"
                        />
                      )}
                    </div>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-sm text-brand-offwhite animate-in slide-in-from-top-2 fade-in">
                        {hintText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
