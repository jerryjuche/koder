"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
} from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { registerVSCodeDarkPlusTheme } from "@/lib/monaco-theme";
import { usePyodide } from "@/hooks/usePyodide";
import PyodideConsole from "@/components/PyodideConsole";
import ResizableSplitPane from "@/components/ResizableSplitPane";

loader.config({ paths: { vs: "/vs" } });

interface SectionExerciseProps {
  problemReferences: string[];
  miniProject?: boolean;
  language?: string;
}

export default function SectionExercise({
  problemReferences,
  miniProject,
  language = "python",
}: SectionExerciseProps) {
  const [code, setCode] = useState("");
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    passed: boolean;
    output: string;
  } | null>(null);
  const mounted = useHasMounted();
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

  useEffect(() => {
    loader.init().then(registerVSCodeDarkPlusTheme).catch(() => {});
  }, []);

  const defaultCode = miniProject
    ? "# Write your mini project code here\n\n"
    : '# Write your solution here\n\ndef solution():\n    pass\n';

  const hasProblems = problemReferences.length > 0;

  const handleTest = useCallback(async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    setTesting(true);
    setResults(null);

    if (hasProblems) {
      const slug = problemReferences[0];
      const lang = isPython ? "python" : "go";
      const res = await testCode(slug, code, lang);
      if (res.success && res.data) {
        setResults({
          passed: res.data.status === "passed",
          output:
            res.data.output_logs || getFriendlyMessage(res.data.status),
        });
      } else {
        setResults({
          passed: false,
          output: res.error?.message || "Test failed",
        });
      }
    } else {
      setResults({
        passed: true,
        output: "Code received (no test configured for this exercise)",
      });
    }

    setTesting(false);
  }, [code, hasProblems, isPython, problemReferences]);

  const handlePyodideRun = useCallback(async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }
    await pyodideExecute(code);
  }, [code, pyodideExecute]);

  pyodideRunRef.current = handlePyodideRun;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (isPython && pyodideReady) {
          pyodideRunRef.current();
        } else if (!isPython) {
          handleTest();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPython, pyodideReady, handleTest]);

  const getFriendlyMessage = (status: string) => {
    switch (status) {
      case "passed":
        return "All tests passed!";
      case "failed":
        return "Some tests failed. Check your output.";
      case "compiler_error":
        return "Compilation error. Check your syntax.";
      case "timeout":
        return "Execution timed out.";
      default:
        return status;
    }
  };

  const editorContent = (
    <div className={cn("border rounded-lg overflow-hidden h-full flex flex-col", isPython ? "rounded-r-none border-r-0" : "")}>
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4" />
          <span className="text-sm font-medium">
            {miniProject ? "Mini Project" : "Exercise"}
          </span>
          {hasProblems && (
            <Badge variant="outline" className="text-xs">
              {problemReferences.length} problem(s)
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
              disabled={!pyodideReady || testing}
              className="border-brand-muted-gold/30 text-brand-muted-gold hover:bg-brand-muted-gold/10 hover:text-brand-muted-gold"
            >
              {pyodideLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Globe className="h-3 w-3 mr-1" />
              )}
              Run in Browser
            </Button>
          )}
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
            Test
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {mounted ? (
          <Editor
            height="100%"
            language={isPython ? "python" : "go"}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark-plus"
            onMount={(_editor, monaco) => {
              editorRef.current = _editor;
              if (monaco) registerVSCodeDarkPlusTheme(monaco);
            }}
            options={{
              minimap: { enabled: false },
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              fontSize: 14,
              padding: { top: 8 },
            }}
            loading={
              <div className="h-full bg-[#1e1e1e] animate-pulse" />
            }
          />
        ) : (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full min-h-[200px] p-4 font-mono text-sm bg-[#1e1e1e] text-[#d4d4d4] border-0 resize-none focus:outline-none"
            placeholder={defaultCode}
            spellCheck={false}
          />
        )}
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
      {isPython && mounted ? (
        <ResizableSplitPane
          left={editorContent}
          right={consoleContent}
          defaultLeftPercent={60}
          minLeftPercent={35}
          minRightPercent={25}
          className="border rounded-lg overflow-hidden h-[400px]"
        />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              <span className="text-sm font-medium">
                {miniProject ? "Mini Project" : "Exercise"}
              </span>
              {hasProblems && (
                <Badge variant="outline" className="text-xs">
                  {problemReferences.length} problem(s)
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {isPython ? "Python" : "Go"}
              </Badge>
            </div>
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
              Test
            </Button>
          </div>

          <div style={{ height: "200px" }}>
            {mounted ? (
              <Editor
                height="100%"
                language={isPython ? "python" : "go"}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark-plus"
                onMount={(_editor, monaco) => {
                  editorRef.current = _editor;
                  if (monaco) registerVSCodeDarkPlusTheme(monaco);
                }}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  padding: { top: 8 },
                }}
                loading={
                  <div className="h-[200px] bg-[#1e1e1e] animate-pulse" />
                }
              />
            ) : (
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full min-h-[200px] p-4 font-mono text-sm bg-[#1e1e1e] text-[#d4d4d4] border-0 resize-y focus:outline-none"
                placeholder={defaultCode}
                spellCheck={false}
              />
            )}
          </div>
        </div>
      )}

      {results && (
        <div
          className={`border rounded-lg mt-2 p-4 ${
            results.passed
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {results.passed ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`text-sm font-medium ${
                results.passed ? "text-green-800" : "text-red-800"
              }`}
            >
              {results.passed ? "Passed" : "Failed"}
            </span>
          </div>
          {results.output && (
            <pre className="text-xs whitespace-pre-wrap font-mono bg-black/5 p-2 rounded max-h-40 overflow-y-auto">
              {results.output}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
