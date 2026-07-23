"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Editor, { loader } from "@monaco-editor/react";

// This eliminates network dependency — faster load, works offline after first visit
loader.config({ paths: { vs: "/vs" } });

import {
  ChevronLeft,
  Play,
  RotateCcw,
  Lightbulb,
  Target,
  ChevronDown,
  ChevronUp,
  Copy,
  Expand,
  Shrink,
  CheckCircle2,
  Bug,
  Send,
  X,
  Code2,
  AlertTriangle,
  Activity,
  Edit3,
  Save,
} from "lucide-react";
import { useUser } from "@/lib/UserContext";
import { cn, getDifficultyColor, getDifficultyLabel } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import {
  fetchProblem,
  submitSolution,
  testCode,
  submitFeedback,
  updatePrimaryLanguage,
  updateProblem,
} from "@/lib/api";
import { toast } from "@/lib/toast";
import { clearCache } from "@/lib/cache";
import { Problem, TestResult, ExecutionResult, UpdateProblemPayload } from "@/lib/types";
import TestResultPanel from "@/components/TestResultPanel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LanguageLogo } from "@/components/LanguageLogo";

const GO_CODE = `package koder

// Write your solution here.
// The backend will test your exported function automatically.
`;

const PYTHON_CODE = `def solution():
    # Write your solution here.
    pass
`;

const STORE_KEY = (s: string, lang?: string) => lang ? `koder_code_${s}_${lang}` : `koder_code_${s}`;

function formatCode(code: string, lang: string): string {
  // Shared: normalize line endings, strip trailing whitespace, collapse excessive blank lines
  let result = code.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "");
  result = result.replace(/\n{3,}/g, "\n\n").trim();

  const lines = result.split("\n");
  const out: string[] = [];
  let indent = 0;

  if (lang === "go") {
    // Go: tabs for indent, brace on same line, block-aware
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      if (raw === "") { out.push(""); continue; }

      const trimmed = raw.trimStart();
      // Strip inline comments before checking ending characters
      const stripped = trimmed.replace(/\/\/.*$/, "").trimEnd();

      // Dedent before closing tokens
      if (/^[})\]]/.test(trimmed)) indent = Math.max(0, indent - 1);

      // Dedent for case/default labels (they align with switch body, then re-indent content)
      const isGoLabel = /^(case .+:|default:)/.test(stripped);
      if (isGoLabel) indent = Math.max(0, indent - 1);

      out.push("\t".repeat(indent) + trimmed);

      // Increase indent after opening tokens
      if (stripped.endsWith("{") || stripped.endsWith("(") || stripped.endsWith("[")) indent++;
      if (isGoLabel) indent++;
    }

    result = out.join("\n") + "\n";
  } else if (lang === "python") {
    // Python: 4-space indent, PEP 8
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      if (raw === "") { out.push(""); continue; }

      const trimmed = raw.trimStart();

      // Dedent only for continuation keywords (elif/else/except/finally) that
      // align with the parent block. return/pass/break/continue/raise are body
      // statements that stay at the current indent level.
      if (/^(elif\b|else:|except\b|finally:)/.test(trimmed))
        indent = Math.max(0, indent - 1);

      out.push(" ".repeat(indent * 4) + trimmed);

      // Increase indent after colon (block start)
      const hasComment = trimmed.includes("#");
      const codePart = hasComment ? trimmed.split("#")[0] : trimmed;
      if (codePart.trimEnd().endsWith(":")) indent++;
    }

    result = out.join("\n") + "\n";
  }

  // Ensure single trailing newline
  result = result.replace(/\n+$/, "\n");
  return result;
}

function generateScaffold(problem: Problem | null, lang: string): string {
  const lv = problem?.language_versions?.[lang];
  if (lv?.func_name) {
    const params =
      lv.param_types
        ?.map((t, i) =>
          lang === "python" ? `arg${i + 1}` : `arg${i + 1} ${t}`,
        )
        .join(", ") || "";
    if (lang === "python") {
      return `def ${lv.func_name}(${params}):\n    pass\n`;
    }
    const ret = lv.return_type ? ` ${lv.return_type}` : "";
    return `package koder\n\nfunc ${lv.func_name}(${params})${ret} {\n\t// Write your solution here\n}\n`;
  }
  // Fallback: try top-level Go fields
  if (lang !== "python" && problem?.func_name) {
    const params =
      problem.param_types?.map((t, i) => `arg${i + 1} ${t}`).join(", ") || "";
    const ret = problem.return_type ? ` ${problem.return_type}` : "";
    return `package koder\n\nfunc ${problem.func_name}(${params})${ret} {\n\t// Write your solution here\n}\n`;
  }
  // Default constants
  return lang === "python" ? PYTHON_CODE : GO_CODE;
}



export default function ProblemWorkspaceClient({ slug }: { slug: string }) {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const handleTestRef = useRef<() => Promise<void>>(async () => {});
  const handleSubmitRef = useRef<() => Promise<void>>(async () => {});
  const handleFormatRef = useRef<() => void>(() => {});
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const lang = localStorage.getItem("koder_language") || "go";
      const perLang = localStorage.getItem(STORE_KEY(slug, lang));
      if (perLang) return perLang;
      const saved = localStorage.getItem(STORE_KEY(slug));
      if (saved) return saved;
    }
    return GO_CODE;
  });
  const [panelMode, setPanelMode] = useState<"tests" | "hints">("tests");
  const [hintsOpen, setHintsOpen] = useState<boolean[]>(Array(10).fill(false));
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastExecution, setLastExecution] = useState<any>(null);
  const [testsExpanded, setTestsExpanded] = useState(true);
  const [saved, setSaved] = useState(true);
  const [activeLanguage, setActiveLanguage] = useState<string>("go");
  const [cooldown, setCooldown] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportSending, setReportSending] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [languageConfirmOpen, setLanguageConfirmOpen] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<string | null>(null);
  const [scaffoldAtToggle, setScaffoldAtToggle] = useState<string>("");
  const [fullscreen, setFullscreen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    statement: "",
    difficulty: 1,
    xp_reward: 0,
    tags: "",
    module: "",
    constraints: "",
    learning_objective: "",
  });
  const { user } = useUser();

  const returnTo = typeof window !== "undefined"
    ? sessionStorage.getItem("return_to") || "/home"
    : "/home";

  useEffect(() => {
    fetchProblem(slug).then((res) => {
      if (res.success && res.data) {
        setProblem(res.data);
        const available = res.data.language_versions
          ? Object.entries(res.data.language_versions)
              .filter(([_, spec]) => spec.func_name)
              .map(([lang]) => lang)
          : [];
        const preferred = localStorage.getItem("koder_language") || "go";
        const lang = available.length > 0 && !available.includes(preferred)
          ? available[0]
          : preferred;
        const scaffold = generateScaffold(res.data, lang);
        setActiveLanguage(lang);
        // Restore saved code if it exists, otherwise use scaffold
        const stored = localStorage.getItem(STORE_KEY(slug, lang)) || localStorage.getItem(STORE_KEY(slug));
        if (stored) {
          setCode(stored);
        } else {
          setCode(scaffold);
        }
        setScaffoldAtToggle(scaffold);
        setSaved(true);
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
      localStorage.setItem(STORE_KEY(slug, activeLanguage), code);
      setSaved(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [code, slug, problem, activeLanguage]);



  // Keyboard shortcuts — use function declarations (hoisted) to satisfy no-hoisted-functions rule
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmitRef.current();
        } else {
          handleTestRef.current();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeLanguage]);

  const handleReset = () => {
    let fresh = generateScaffold(problem, activeLanguage);
    setCode(fresh);
    setSaved(true);
    setResults(null);
    setErrorMsg(null);
    setLastExecution(null);
    setHintsOpen(Array(10).fill(false));
    localStorage.removeItem(STORE_KEY(slug, activeLanguage));
    localStorage.removeItem(STORE_KEY(slug));
    toast.success("Reset to original scaffold");
  };

  async function applyLanguageSwitch(newLang: string) {
    const scaffold = generateScaffold(problem, newLang);
    setActiveLanguage(newLang);
    // Restore saved code for the target language if available
    const saved = localStorage.getItem(STORE_KEY(slug, newLang));
    setCode(saved || scaffold);
    setScaffoldAtToggle(scaffold);
    localStorage.setItem("koder_language", newLang);
    try {
      await updatePrimaryLanguage(newLang);
    } catch {
      // Non-critical: backend language preference update can fail silently
    }
    window.dispatchEvent(new Event("user-updated"));
  }

  function handleFormat() {
    const ed = editorRef.current;
    if (!ed) return;
    const raw = ed.getValue();
    const formatted = formatCode(raw, activeLanguage);
    ed.executeEdits("format", [{
      range: ed.getModel()!.getFullModelRange(),
      text: formatted,
      forceMoveMarkers: true,
    }]);
    setCode(formatted);
    setSaved(true);
    toast.success("Code formatted");
  }

  async function handleSubmit() {
    setSubmitting(true);
    setPanelMode("tests");
    setTestsExpanded(true);
    setErrorMsg(null);

    const res = await submitSolution(slug, code, activeLanguage);

    if (res.success && res.data) {
      const executionResult = res.data;
      setLastExecution(executionResult);

      if (
        executionResult.status === "compiler_error" ||
        executionResult.status === "timeout"
      ) {
        setErrorMsg(null); // Clear generic errorMsg, we use lastExecution
        setResults(null);
        toast.error(
          `Execution failed: ${executionResult.friendly_message || executionResult.status}`,
        );
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
          sessionStorage.setItem(`koder_solution_lang_${slug}`, activeLanguage);
          if (problem)
            sessionStorage.setItem(
              `koder_problem_${slug}`,
              JSON.stringify(problem),
            );
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
      toast.error(res.error?.message || "Too many attempts. Please wait.");
    } else if (res.error?.code === "ALREADY_SOLVED") {
      setErrorMsg(null);
      setResults(null);
      setLastExecution(null);
      toast.success("You already solved this problem!");
    } else {
      setErrorMsg(res.error?.message || "Submission failed");
      setResults(null);
      setLastExecution(null);
      toast.error(res.error?.message || "Submission failed");
    }

    setSubmitting(false);
  }

  async function handleTest() {
    setSubmitting(true);
    setPanelMode("tests");
    setTestsExpanded(true);
    setErrorMsg(null);

    const res = await testCode(slug, code, activeLanguage);

    if (res.success && res.data) {
      const executionResult = res.data;
      setLastExecution(executionResult);

      if (
        executionResult.status === "compiler_error" ||
        executionResult.status === "timeout"
      ) {
        setErrorMsg(null);
        setResults(null);
        toast.error(
          `Test failed: ${executionResult.friendly_message || executionResult.status}`,
        );
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
      toast.error(res.error?.message || "Too many attempts. Please wait.");
    } else {
      setErrorMsg(res.error?.message || "Test failed");
      setResults(null);
      setLastExecution(null);
      toast.error(res.error?.message || "Test failed");
    }

    setSubmitting(false);
  }
  const handleReportSubmit = async () => {
    if (!problem) return;
    setReportSending(true);
    const baseDesc = `Error encountered while solving "${problem.title}" (${problem.slug}).\n\nError: ${errorMsg || lastExecution?.friendly_message || "Unknown error"}\n\nCode:\n\`\`\`${activeLanguage}\n${code}\n\`\`\``;
    const fullDesc = reportDescription.trim()
      ? `${baseDesc}\n\nAdditional notes:\n${reportDescription.trim()}`
      : baseDesc;
    const res = await submitFeedback({
      type: "bug",
      title: `Problem: ${problem.title}`,
      description: fullDesc,
      priority: "medium",
      is_anonymous: false,
      problem_slug: problem.slug,
      code_snippet: code,
      error_message: errorMsg || lastExecution?.friendly_message || "",
    });
    setReportSending(false);
    if (res.success) {
      setReportSubmitted(true);
    } else {
      toast.error(res.error?.message || "Failed to submit report");
    }
  };

  useEffect(() => {
    handleFormatRef.current = handleFormat;
    handleSubmitRef.current = handleSubmit;
    handleTestRef.current = handleTest;
  });

  const handleEditSave = async () => {
    if (!problem) return;
    setEditSaving(true);
    try {
      const payload: UpdateProblemPayload = {
        title: editForm.title,
        statement: editForm.statement,
        difficulty: editForm.difficulty,
        xp_reward: editForm.xp_reward,
        tags: editForm.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        module: editForm.module || undefined,
        constraints: editForm.constraints || undefined,
        learning_objective: editForm.learning_objective || undefined,
      };
      const res = await updateProblem(String(problem.id), payload);
      if (res.success) {
        clearCache(`/problems/${problem.slug}`);
        toast.success("Problem updated successfully");
        if (res.data) {
          setProblem(res.data);
        }
        setEditOpen(false);
      } else {
        toast.error(typeof res.error === 'string' ? res.error : res.error?.message || "Failed to update problem");
      }
    } catch {
      toast.error("Failed to update problem");
    } finally {
      setEditSaving(false);
    }
  };

  if (!problem) {
    return (
      <div className="h-screen w-screen bg-brand-charcoal-base flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-muted-gold border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const availableLanguages = problem.language_versions
    ? Object.entries(problem.language_versions)
        .filter(([_, spec]) => spec.func_name)
        .map(([lang]) => lang)
    : [];
  const langColors: Record<string, { active: string; text: string }> = {
    go: { active: "bg-[#00ADD8]/15 text-[#00ADD8]", text: "Go" },
    python: { active: "bg-[#FFD43B]/15 text-[#FFD43B]", text: "Python" },
  };

  return (
    <div className="h-screen flex flex-col bg-brand-charcoal-base text-brand-offwhite overflow-hidden">
      {/* Workspace Header */}
      <header className="h-14 border-b border-brand-charcoal-border bg-brand-charcoal-card shrink-0 flex items-center justify-between px-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link
            href={returnTo}
            className="text-brand-offwhite-muted hover:text-brand-offwhite flex items-center gap-1 text-sm font-medium transition-colors shrink-0"
          >
            <ChevronLeft size={16} /> Back
          </Link>
          <div className="w-px h-5 bg-brand-charcoal-border shrink-0"></div>
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-bold truncate">{problem.title}</span>
            <span className="bg-brand-charcoal-hover text-brand-offwhite-muted px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-brand-charcoal-border shrink-0">
              {problem.module}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1 text-brand-muted-gold text-sm font-bold bg-brand-muted-gold/10 px-3 py-1.5 rounded-lg border border-brand-muted-gold/20 mr-2">
            <svg width="10" height="12" viewBox="0 0 12 16" fill="currentColor">
              <path d="M6 0L0 8H5L4 16L12 6H7L8 0H6Z" />
            </svg>
            +{problem.xpReward} XP
          </div>

          <button
            onClick={() => setPanelMode(panelMode === "hints" ? "tests" : "hints")}
            className={cn(
              "flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors border",
              panelMode === "hints"
                ? "bg-brand-muted-gold/10 text-brand-muted-gold border-brand-muted-gold/30"
                : "text-brand-offwhite-muted border-transparent hover:text-brand-offwhite hover:bg-brand-charcoal-hover",
            )}
          >
            <Lightbulb size={16} /> Hints
          </button>
          {user?.role === "admin" && problem && (
            <button
              onClick={() => {
                if (problem) {
                  setEditForm({
                    title: problem.title || "",
                    statement: problem.statement || "",
                    difficulty: problem.difficulty || 1,
                    xp_reward: problem.xpReward || 0,
                    tags: (problem.tags || []).join(", "),
                    module: problem.module || "",
                    constraints: problem.constraints || "",
                    learning_objective: problem.learningObjective || "",
                  });
                }
                setEditOpen(true);
              }}
              className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors border border-transparent text-brand-offwhite-muted hover:text-brand-accent-teal hover:border-brand-accent-teal/30 hover:bg-brand-accent-teal/5"
              title="Edit problem"
            >
              <Edit3 size={15} /> Edit
            </button>
          )}
          <button
            onClick={() => {
              setReportOpen(true);
              setReportSubmitted(false);
              setReportDescription("");
            }}
            className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors border border-transparent text-brand-offwhite-muted hover:text-brand-error hover:border-brand-error/30 hover:bg-brand-error/5"
            title="Report a problem with this exercise"
          >
            <Bug size={15} /> Report Bug
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
              <span className="text-brand-muted-gold font-mono">
                {cooldown}s
              </span>
            ) : submitting ? (
              <div className="w-4 h-4 border-2 border-brand-charcoal-border border-t-brand-offwhite rounded-full animate-spin" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
            {cooldown > 0 ? "Wait" : "Test"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || cooldown > 0 || problem.solved}
            className={cn(
              "px-5 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md transition-all",
              problem.solved
                ? "bg-brand-success/10 text-brand-success border border-brand-success/30 cursor-not-allowed"
                : "bg-brand-muted-gold hover:bg-brand-muted-gold-dark text-brand-charcoal-base shadow-brand-muted-gold/10",
              (submitting || cooldown > 0) && "opacity-70",
            )}
          >
            {problem.solved ? (
              <CheckCircle2 size={16} />
            ) : cooldown > 0 ? (
              <span className="font-mono">{cooldown}s</span>
            ) : submitting ? (
              <div className="w-4 h-4 border-2 border-brand-charcoal-base/30 border-t-brand-charcoal-base rounded-full animate-spin" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
            {problem.solved ? "Solved" : cooldown > 0 ? "Wait" : "Submit"}
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Problem Statement */}
        {!fullscreen && (
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
                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(
                        problem?.statement ||
                          problem?.descriptionMarkdown ||
                          "No problem statement available yet. This exercise is pending enrichment."
                      ),
                    }}
                  />
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
                        <span className="text-brand-muted-gold mt-1 text-xs">
                          ◆
                        </span>
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
                        <span className="text-brand-muted-gold mt-1 text-xs">
                          ◆
                        </span>
                        <span>
                          <span className="font-mono text-brand-offwhite/90">
                            Return Type:
                          </span>{" "}
                          {problem.return_type}
                        </span>
                      </li>
                    )}
                    <li className="flex items-start gap-3">
                      <span className="text-brand-muted-gold mt-1 text-xs">
                        ◆
                      </span>
                      <span>
                        <span className="font-mono text-brand-offwhite/90">
                          Difficulty:
                        </span>{" "}
                        {getDifficultyLabel(problem.difficulty)}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-brand-muted-gold mt-1 text-xs">
                        ◆
                      </span>
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
                    {problem.constraints && (
                      <li className="flex items-start gap-3">
                        <span className="text-brand-muted-gold mt-1 text-xs">
                          ◆
                        </span>
                        <span className="whitespace-pre-line">
                          {problem.constraints}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Learning Objective */}
              {problem.learningObjective && (
                <div className="mb-8">
                  <div className="text-xs font-bold uppercase tracking-widest text-brand-offwhite mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                    Learning Objective
                  </div>
                  <div className="relative rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-5 shadow-lg backdrop-blur-sm overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-transparent opacity-60"></div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Target size={16} className="text-emerald-400" />
                      </div>
                      <p className="text-sm text-brand-offwhite-muted leading-relaxed pt-1">
                        {problem.learningObjective}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
        )}

        {/* Middle: Editor & Results */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0F1115]">
          {/* Editor Header */}
          <div className="h-10 flex items-center justify-between px-4 bg-[#0F1115] border-b border-brand-charcoal-border">
            <div className="flex items-center gap-3">
              {availableLanguages.length > 1 ? (
                <div className="flex rounded-lg border border-brand-charcoal-border overflow-hidden bg-brand-charcoal-base">
                  {availableLanguages.map((lang, idx) => (
                    <React.Fragment key={lang}>
                      {idx > 0 && <div className="w-px bg-brand-charcoal-border self-stretch" />}
                      <button
                        onClick={async () => {
                          if (activeLanguage === lang) return;
                          if (code !== scaffoldAtToggle) {
                            setPendingLanguage(lang);
                            setLanguageConfirmOpen(true);
                          } else {
                            await applyLanguageSwitch(lang);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold transition-colors",
                          activeLanguage === lang
                            ? (langColors[lang]?.active || "bg-primary/15 text-primary")
                            : "text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover",
                        )}
                      >
                        <LanguageLogo language={lang as "go" | "python"} size={18} />
                        {langColors[lang]?.text || lang}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-brand-offwhite-muted">
                  <LanguageLogo language={(availableLanguages[0] || "go") as "go" | "python"} size={18} />
                  {langColors[availableLanguages[0]]?.text || (availableLanguages[0] === "python" ? "Python" : "Go")}
                </div>
              )}
              <span className="text-xs font-mono text-brand-offwhite-muted">
                solution.{activeLanguage === "python" ? "py" : "go"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!saved && (
                <span className="text-[10px] text-brand-offwhite-muted/60 animate-pulse">
                  ● Unsaved
                </span>
              )}
              {saved &&
                code !== scaffoldAtToggle && (
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
              <button
                onClick={() => {
                  navigator.clipboard
                    .writeText(code)
                    .then(() => {
                      toast.success("Code copied to clipboard");
                    })
                    .catch(() => {
                      toast.error("Failed to copy code");
                    });
                }}
                className="text-brand-offwhite-muted hover:text-brand-offwhite p-1 rounded hover:bg-brand-charcoal-hover transition-colors"
                title="Copy code"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={() => setFullscreen(!fullscreen)}
                className="text-brand-offwhite-muted hover:text-brand-offwhite p-1 rounded hover:bg-brand-charcoal-hover transition-colors"
                title={fullscreen ? "Exit fullscreen" : "Fullscreen editor"}
              >
                {fullscreen ? <Shrink size={16} /> : <Expand size={16} />}
              </button>
            </div>
          </div>

          {/* Editor Instance */}
          <div className="flex-1 overflow-hidden relative">
            <Editor
              height="100%"
              language={activeLanguage}
              theme="vs-dark"
              loading={
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-brand-muted-gold border-t-transparent animate-spin" />
                    <p className="text-sm text-brand-offwhite-muted">
                      Loading editor...
                    </p>
                  </div>
                </div>
              }
              value={code}
              onChange={(v) => {
                setCode(v || "");
                setSaved(false);
              }}
              onMount={(editor, monaco) => {
                editorRef.current = editor;
                monacoRef.current = monaco;

                editor.addAction({
                  id: "koder-format",
                  label: "Format Code",
                  keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
                  run: () => handleFormatRef.current(),
                });

                editor.addAction({
                  id: "koder-test",
                  label: "Run Tests",
                  keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
                  run: () => handleTestRef.current(),
                });

                editor.addAction({
                  id: "koder-submit",
                  label: "Submit Solution",
                  keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter],
                  run: () => handleSubmitRef.current(),
                });
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontWeight: "500",
                fontFamily: "var(--font-mono), monospace",
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: "all",
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                  alwaysConsumeMouseWheel: false,
                },
                overviewRulerLanes: 3,
                hideCursorInOverviewRuler: false,
                bracketPairColorization: { enabled: true },
                matchBrackets: "always",
                autoClosingBrackets: "never",
                autoClosingQuotes: "never",
                autoIndent: "full",
                formatOnPaste: true,
                tabSize: 4,
                insertSpaces: true,
                quickSuggestions: false,
                snippetSuggestions: "none",
                suggestOnTriggerCharacters: false,
                acceptSuggestionOnEnter: "off",
                suggestSelection: "recentlyUsed",
                parameterHints: { enabled: false },
                wordWrap: "off",
                folding: true,
                foldingHighlight: true,
                foldingStrategy: "indentation",
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

        {/* Right: Hints Panel */}
        {panelMode === "hints" && (
          <div className="w-80 shrink-0 border-l border-brand-charcoal-border bg-brand-charcoal-card animate-in slide-in-from-right overflow-hidden flex flex-col">
            <div className="p-5 border-b border-brand-charcoal-border flex items-center justify-between shrink-0">
              <div className="font-bold flex items-center gap-2 text-brand-muted-gold">
                <Lightbulb size={18} /> Progressive Hints
              </div>
              <span className="text-xs text-brand-offwhite-muted bg-brand-charcoal-base px-2 py-1 rounded">
                ({hintsOpen.filter(Boolean).length}/{problem.hints?.length || 3}{" "}
                viewed)
              </span>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
              {(problem.hints && problem.hints.length > 0
                ? problem.hints
                : [
                    "Think about using the standard fmt package in Go. Which function prints with a newline?",
                    "You don't need to return a value from main(), simply call the print function.",
                    'The exact syntax is `fmt.Println("Hello, World!")` inside the main function.',
                  ]
              ).map((hintText, idx) => {
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

      {/* Report Issue Dialog */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setReportOpen(false);
              setReportDescription("");
            }}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-brand-charcoal-border bg-brand-charcoal-card shadow-2xl animate-in zoom-in-95 duration-200">
            {reportSubmitted ? (
              <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-success/10 border border-brand-success/20">
                  <CheckCircle2 className="h-8 w-8 text-brand-success" />
                </div>
                <h3 className="text-xl font-bold text-brand-offwhite mb-2">
                  Thank You
                </h3>
                <p className="text-sm text-brand-offwhite-muted max-w-sm leading-relaxed">
                  Your report has been submitted. The admin will review the
                  issue and fix it as soon as possible.
                </p>
                <button
                  onClick={() => setReportOpen(false)}
                  className="mt-6 rounded-lg border border-brand-charcoal-border px-5 py-2 text-sm font-medium text-brand-offwhite hover:bg-brand-charcoal-hover transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-brand-charcoal-border px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-error/10 border border-brand-error/20 flex items-center justify-center">
                      <Bug size={18} className="text-brand-error" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-brand-offwhite">
                        Report Issue
                      </h2>
                      <p className="text-xs text-brand-offwhite-muted">
                        Help us fix this problem
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setReportOpen(false);
                      setReportDescription("");
                    }}
                    className="rounded-lg p-1.5 text-brand-offwhite-muted hover:text-brand-offwhite hover:bg-brand-charcoal-hover transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <div className="rounded-lg bg-brand-charcoal-base border border-brand-charcoal-border p-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-brand-offwhite-muted">
                      <Target size={12} />
                      <span>
                        Problem:{" "}
                        <span className="text-brand-offwhite font-medium">
                          {problem.title}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand-offwhite-muted">
                      <Code2 size={12} />
                      <span>
                        Slug:{" "}
                        <span className="font-mono text-brand-offwhite">
                          {problem.slug}
                        </span>
                      </span>
                    </div>
                    {(errorMsg || lastExecution?.friendly_message) && (
                      <div className="flex items-start gap-2 text-xs text-brand-offwhite-muted">
                        <AlertTriangle
                          size={12}
                          className="mt-0.5 shrink-0 text-brand-warning"
                        />
                        <span className="text-brand-warning font-mono text-[11px] leading-relaxed break-all">
                          {errorMsg || lastExecution?.friendly_message}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-brand-offwhite-muted uppercase tracking-wider">
                      Additional Details{" "}
                      <span className="text-brand-offwhite-muted/50">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      id="report-description"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Describe what you expected vs what happened..."
                      rows={3}
                      className="w-full resize-none rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base px-4 py-2.5 text-sm text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus:outline-none focus:border-brand-muted-gold transition-colors"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 border-t border-brand-charcoal-border px-5 py-4">
                  <button
                    onClick={() => {
                      setReportOpen(false);
                      setReportDescription("");
                    }}
                    className="rounded-lg border border-brand-charcoal-border px-4 py-2 text-sm font-medium text-brand-offwhite-muted hover:bg-brand-charcoal-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportSubmit}
                    disabled={reportSending}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-error px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-error/90 disabled:opacity-50"
                  >
                    {reportSending ? (
                      <Activity size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    {reportSending ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Dialog open={languageConfirmOpen} onOpenChange={setLanguageConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch language?</DialogTitle>
            <DialogDescription>
              Switching languages will replace the editor content with a scaffold for the new
              language. You can save your current code before switching.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <button
              onClick={() => {
                setLanguageConfirmOpen(false);
                setPendingLanguage(null);
              }}
              className="rounded-lg border border-brand-charcoal-border px-4 py-2 text-sm font-medium text-brand-offwhite-muted hover:bg-brand-charcoal-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (pendingLanguage) {
                  const currentCode = editorRef.current?.getValue() ?? code;
                  localStorage.setItem(STORE_KEY(slug, activeLanguage), currentCode);
                  setSaved(true);
                  await applyLanguageSwitch(pendingLanguage);
                }
                setLanguageConfirmOpen(false);
                setPendingLanguage(null);
              }}
              className="rounded-lg bg-brand-charcoal-hover px-4 py-2 text-sm font-medium text-brand-offwhite hover:bg-brand-charcoal-panel border border-brand-charcoal-border transition-colors"
            >
              Save &amp; Switch
            </button>
            <button
              onClick={async () => {
                if (pendingLanguage) {
                  await applyLanguageSwitch(pendingLanguage);
                }
                setLanguageConfirmOpen(false);
                setPendingLanguage(null);
              }}
              className="rounded-lg bg-brand-muted-gold px-5 py-2 text-sm font-semibold text-black transition-all duration-300 hover:bg-brand-muted-gold/90"
            >
              Switch anyway
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditOpen(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-brand-charcoal-border bg-brand-charcoal-card shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-brand-charcoal-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-accent-teal/10 border border-brand-accent-teal/20 flex items-center justify-center">
                  <Edit3 size={18} className="text-brand-accent-teal" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-brand-offwhite">
                    Edit Problem
                  </h2>
                  <p className="text-xs text-brand-offwhite-muted">
                    {problem.slug}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-offwhite-muted hover:bg-brand-charcoal-hover transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-offwhite mb-1">Title</label>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base px-3 py-2 text-sm text-brand-offwhite focus:outline-none focus:ring-1 focus:ring-brand-muted-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-offwhite mb-1">Statement</label>
                <textarea
                  value={editForm.statement}
                  onChange={(e) => setEditForm({ ...editForm, statement: e.target.value })}
                  rows={6}
                  className="w-full rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base px-3 py-2 text-sm text-brand-offwhite focus:outline-none focus:ring-1 focus:ring-brand-muted-gold resize-y font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-offwhite mb-1">Difficulty (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({ ...editForm, difficulty: Math.min(5, Math.max(1, Number(e.target.value))) })}
                    className="w-full rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base px-3 py-2 text-sm text-brand-offwhite focus:outline-none focus:ring-1 focus:ring-brand-muted-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-offwhite mb-1">XP Reward</label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.xp_reward}
                    onChange={(e) => setEditForm({ ...editForm, xp_reward: Number(e.target.value) })}
                    className="w-full rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base px-3 py-2 text-sm text-brand-offwhite focus:outline-none focus:ring-1 focus:ring-brand-muted-gold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-offwhite mb-1">Module</label>
                <input
                  value={editForm.module}
                  onChange={(e) => setEditForm({ ...editForm, module: e.target.value })}
                  className="w-full rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base px-3 py-2 text-sm text-brand-offwhite focus:outline-none focus:ring-1 focus:ring-brand-muted-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-offwhite mb-1">Tags (comma-separated)</label>
                <input
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  className="w-full rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base px-3 py-2 text-sm text-brand-offwhite focus:outline-none focus:ring-1 focus:ring-brand-muted-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-offwhite mb-1">Constraints</label>
                <textarea
                  value={editForm.constraints}
                  onChange={(e) => setEditForm({ ...editForm, constraints: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base px-3 py-2 text-sm text-brand-offwhite focus:outline-none focus:ring-1 focus:ring-brand-muted-gold resize-y font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-offwhite mb-1">Learning Objective</label>
                <textarea
                  value={editForm.learning_objective}
                  onChange={(e) => setEditForm({ ...editForm, learning_objective: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base px-3 py-2 text-sm text-brand-offwhite focus:outline-none focus:ring-1 focus:ring-brand-muted-gold resize-y font-mono"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-brand-charcoal-border px-5 py-4">
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-lg border border-brand-charcoal-border px-4 py-2 text-sm font-medium text-brand-offwhite-muted hover:bg-brand-charcoal-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="rounded-lg bg-brand-accent-teal px-5 py-2 text-sm font-semibold text-black transition-all duration-300 hover:bg-brand-accent-teal/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {editSaving ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
