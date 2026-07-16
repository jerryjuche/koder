"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import "@/lib/monaco-setup";
import Editor, { loader } from "@monaco-editor/react";
import { testCode } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Play,
  CheckCircle2,
  XCircle,
  Code2,
  Globe,
  ChevronLeft,
  ChevronRight,
  Clock,
  Bug,
  Terminal,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { registerVSCodeDarkPlusTheme } from "@/lib/monaco-theme";
import { usePyodide } from "@/hooks/usePyodide";
import PyodideConsole from "@/components/PyodideConsole";
import ResizableSplitPane from "@/components/ResizableSplitPane";

// Pre-initialize Monaco and register theme before Editor mounts
loader.init().then(registerVSCodeDarkPlusTheme).catch(() => {});

interface SectionExerciseProps {
  problemReferences: string[];
  miniProject?: boolean;
  language?: string;
}

type ResultType = "test" | "execution" | "error";

interface ExerciseResult {
  type: ResultType;
  passed: boolean;
  output: string;
  runtimeMs: number;
  error?: string;
}

const defaultExerciseCodes: string[] = [
  '# Write your solution here\n\ndef solution():\n    pass\n',
  '# Write your solution here\n\ndef solution():\n    # TODO: implement\n    pass\n',
  '# Write your solution here\n\ndef solution():\n    return None\n',
];

export default function SectionExercise({
  problemReferences,
  miniProject,
  language = "python",
}: SectionExerciseProps) {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [codes, setCodes] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, ExerciseResult | null>>({});
  const [testing, setTesting] = useState(false);
  const {
    ready: pyodideReady,
    loading: pyodideLoading,
    consoleLines,
    execute: pyodideExecute,
    clearConsole,
  } = usePyodide();

  const editorRef = useRef<any>(null);
  const pyodideRunRef = useRef<() => Promise<void>>(async () => {});
  const isPython = language === "python";
  const hasProblems = problemReferences.length > 0;
  const totalExercises = hasProblems ? problemReferences.length : 1;

  const currentCode = codes[exerciseIndex] ?? (miniProject
    ? "# Write your mini project code here\n\n"
    : defaultExerciseCodes[Math.min(exerciseIndex, defaultExerciseCodes.length - 1)]);

  const currentResult = results[exerciseIndex] ?? null;

  const goToExercise = useCallback((idx: number) => {
    setExerciseIndex(idx);
  }, []);

  const handleTest = useCallback(async () => {
    const code = currentCode;
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    setTesting(true);
    const startTime = performance.now();

    try {
      if (hasProblems) {
        const slug = problemReferences[exerciseIndex];
        const lang = isPython ? "python" : "go";
        const res = await testCode(slug, code, lang);

        if (res.success && res.data) {
          const d = res.data;
          setResults((prev) => ({
            ...prev,
            [exerciseIndex]: {
              type: "test",
              passed: d.status === "passed",
              output: d.output_logs || friendlyStatus(d.status),
              runtimeMs: d.runtime_ms ?? Math.round(performance.now() - startTime),
              error: d.status === "compiler_error" ? d.friendly_message : undefined,
            },
          }));
        } else {
          setResults((prev) => ({
            ...prev,
            [exerciseIndex]: {
              type: "test",
              passed: false,
              output: res.error?.message || "Something went wrong",
              runtimeMs: Math.round(performance.now() - startTime),
              error: res.error?.message,
            },
          }));
        }
      } else if (isPython) {
        const pyResult = await pyodideExecute(code);
        const output = pyResult
          ? (pyResult.error || pyResult.stdout || "(no output)")
          : "Python execution failed. Check the console for details.";
        setResults((prev) => ({
          ...prev,
          [exerciseIndex]: {
            type: pyResult?.error ? "error" : "execution",
            passed: false,
            output,
            runtimeMs: Math.round(performance.now() - startTime),
            error: pyResult?.error || (!pyResult ? "Execution returned no result" : undefined),
          },
        }));
      } else {
        setResults((prev) => ({
          ...prev,
          [exerciseIndex]: {
            type: "error",
            passed: false,
            output: "In-browser Go execution is not supported. This exercise requires problem references to test against the backend.",
            runtimeMs: 0,
            error: "Go execution not available in browser",
          },
        }));
      }
    } catch (err: any) {
      setResults((prev) => ({
        ...prev,
        [exerciseIndex]: {
          type: "error",
          passed: false,
          output: err?.message || "Unexpected error",
          runtimeMs: Math.round(performance.now() - startTime),
          error: err?.message,
        },
      }));
    }

    setTesting(false);
  }, [currentCode, hasProblems, isPython, exerciseIndex, problemReferences, pyodideExecute]);

  const handlePyodideRun = useCallback(async () => {
    const code = currentCode;
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }
    setTesting(true);
    try {
      await pyodideExecute(code);
    } finally {
      setTesting(false);
    }
  }, [currentCode, pyodideExecute]);

  pyodideRunRef.current = handlePyodideRun;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (isPython && pyodideReady) {
          pyodideRunRef.current();
        } else {
          handleTest();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPython, pyodideReady, handleTest]);

  const friendlyStatus = (status: string) => {
    switch (status) {
      case "passed": return "All tests passed!";
      case "failed": return "Some tests failed.";
      case "compiler_error": return "Compilation error.";
      case "timeout": return "Execution timed out.";
      default: return status;
    }
  };

  const ResultsPanel = ({ result }: { result: ExerciseResult }) => {
    const hasOutput = result.output && result.output.length > 0;

    const isTest = result.type === "test";
    const isExecution = result.type === "execution";
    const isError = result.type === "error";

    const borderColor = isError || (isTest && !result.passed) ? "border-red-200"
      : isTest && result.passed ? "border-green-200"
      : "border-blue-200";

    const headerBg = isError || (isTest && !result.passed) ? "bg-red-50/80 dark:bg-red-950/20 border-red-200"
      : isTest && result.passed ? "bg-green-50/80 dark:bg-green-950/20 border-green-200"
      : "bg-blue-50/80 dark:bg-blue-950/20 border-blue-200";

    const headerIcon = isError || (isTest && !result.passed)
      ? <XCircle className="h-5 w-5 text-red-600 shrink-0" />
      : isTest && result.passed
        ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
        : <Terminal className="h-5 w-5 text-blue-600 shrink-0" />;

    const headerText = isError || (isTest && !result.passed)
      ? "Failed"
      : isTest && result.passed
        ? "Success"
        : "Execution Output";

    const headerTextColor = isError || (isTest && !result.passed)
      ? "text-red-800 dark:text-red-300"
      : isTest && result.passed
        ? "text-green-800 dark:text-green-300"
        : "text-blue-800 dark:text-blue-300";

    return (
      <div className={cn("border rounded-lg overflow-hidden transition-all duration-300", borderColor)}>
        <div className={cn("flex items-center gap-2.5 px-4 py-3 border-b", headerBg)}>
          {headerIcon}
          <span className={cn("font-semibold text-sm", headerTextColor)}>
            {headerText}
          </span>
          <span className="text-xs text-muted-foreground/60 ml-auto flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {result.runtimeMs}ms
          </span>
        </div>

        {result.error && (
          <div className="px-4 py-2.5 bg-red-50/50 dark:bg-red-950/10 border-b border-red-100 dark:border-red-900/20">
            <div className="flex items-start gap-2">
              <Bug className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-700 dark:text-red-400">Error</p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5 font-mono">{result.error}</p>
              </div>
            </div>
          </div>
        )}

        {hasOutput && (
          <div className="p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Terminal className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">Output</span>
            </div>
            <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap bg-black/5 dark:bg-white/5 rounded-lg p-3 max-h-48 overflow-y-auto text-foreground/90">
              {result.output || "(no output)"}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const editorContent = (
    <div className={cn("border rounded-lg overflow-hidden h-full flex flex-col", isPython ? "rounded-r-none border-r-0" : "")}>
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4" />
          <span className="text-sm font-medium">
            {miniProject ? "Mini Project" : (hasProblems ? `Exercise ${exerciseIndex + 1}` : "Code Playground")}
          </span>
          {hasProblems && (
            <Badge variant="outline" className="text-xs font-mono">
              {problemReferences[exerciseIndex]}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {isPython ? "Python" : "Go"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {isPython && (
            <Button
              size="sm"
              variant="outline"
              onClick={handlePyodideRun}
              disabled={testing}
              className="border-brand-muted-gold/30 text-brand-muted-gold hover:bg-brand-muted-gold/10 hover:text-brand-muted-gold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pyodideLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Globe className="h-3 w-3 mr-1" />
              )}
              Run in Browser
            </Button>
          )}
          {!(isPython && !hasProblems) && (
            <Button
              size="sm"
              variant="default"
              onClick={handleTest}
              disabled={testing}
            >
              {testing ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Play className="h-3 w-3 mr-1" />
              )}
              {hasProblems ? "Test" : "Run"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[#1e1e1e]">
        <Editor
          height="100%"
          language={isPython ? "python" : "go"}
          value={currentCode}
          onChange={(value) => setCodes((prev) => ({ ...prev, [exerciseIndex]: value || "" }))}
          theme="vs-dark-plus"
          loading={<div className="h-full bg-[#1e1e1e]" />}
          onMount={(_editor, monaco) => {
            editorRef.current = _editor;
            if (monaco) registerVSCodeDarkPlusTheme(monaco);
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
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoIndent: "full",
            formatOnPaste: true,
            tabSize: 4,
            insertSpaces: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            snippetSuggestions: "inline",
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "smart",
            suggestSelection: "first",
            wordWrap: "off",
            folding: true,
            foldingHighlight: true,
            foldingStrategy: "indentation",
          }}
        />
      </div>
    </div>
  );

  const consoleContent = (
    <div className="h-full rounded-r-lg overflow-hidden border border-l-0 border-brand-charcoal-border">
      <PyodideConsole
        lines={consoleLines}
        onClear={clearConsole}
        isLoading={pyodideLoading && !pyodideReady}
      />
    </div>
  );

  return (
    <div>
      {isPython ? (
        /* Split pane: editor + PyodideConsole side by side */
        <div className="border rounded-lg overflow-hidden" style={{ height: "400px" }}>
          <ResizableSplitPane
            left={editorContent}
            right={consoleContent}
            defaultLeftPercent={60}
            minLeftPercent={35}
            minRightPercent={25}
            className="h-[400px]"
          />
        </div>
      ) : (
        /* Standalone: editor only (Go or non-Python) */
        <div style={{ height: "260px" }}>
          {editorContent}
        </div>
      )}

      {/* Results - hidden when PyodideConsole split pane is visible (console already shows output) */}
      {currentResult && !isPython && (
        <div className="mt-3">
          <ResultsPanel result={currentResult} />
        </div>
      )}

      {/* Exercise navigation */}
      {hasProblems && totalExercises > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToExercise(exerciseIndex - 1)}
            disabled={exerciseIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalExercises }, (_, i) => (
              <button
                key={i}
                onClick={() => goToExercise(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === exerciseIndex
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/20 hover:bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToExercise(exerciseIndex + 1)}
            disabled={exerciseIndex === totalExercises - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
