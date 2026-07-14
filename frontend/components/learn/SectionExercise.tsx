"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { testCode } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, CheckCircle2, XCircle, Code2 } from "lucide-react";
import { toast } from "@/lib/toast";

interface SectionExerciseProps {
  problemReferences: string[];
  miniProject?: boolean;
  language?: string;
}

export default function SectionExercise({ problemReferences, miniProject, language = "python" }: SectionExerciseProps) {
  const [code, setCode] = useState("");
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{ passed: boolean; output: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Defer Monaco render to avoid SSR issues
  useState(() => { setMounted(true); });

  const defaultCode = miniProject
    ? '# Write your mini project code here\n\n'
    : '# Write your solution here\n\ndef solution():\n    pass\n';

  const hasProblems = problemReferences.length > 0;

  const handleTest = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    setTesting(true);
    setResults(null);

    if (hasProblems) {
      const slug = problemReferences[0];
      const lang = language === "go" ? "go" : "python";
      const res = await testCode(slug, code, lang);
      if (res.success && res.data) {
        setResults({
          passed: res.data.status === "passed",
          output: res.data.output_logs || getFriendlyMessage(res.data.status),
        });
      } else {
        setResults({ passed: false, output: res.error?.message || "Test failed" });
      }
    } else {
      setResults({ passed: true, output: "Code received (no test configured for this exercise)" });
    }

    setTesting(false);
  };

  const getFriendlyMessage = (status: string) => {
    switch (status) {
      case "passed": return "All tests passed!";
      case "failed": return "Some tests failed. Check your output.";
      case "compiler_error": return "Compilation error. Check your syntax.";
      case "timeout": return "Execution timed out.";
      default: return status;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4" />
          <span className="text-sm font-medium">{miniProject ? "Mini Project" : "Exercise"}</span>
          {hasProblems && (
            <Badge variant="outline" className="text-xs">{problemReferences.length} problem(s)</Badge>
          )}
          <Badge variant="secondary" className="text-xs">{language === "go" ? "Go" : "Python"}</Badge>
        </div>
        <Button size="sm" variant="default" onClick={handleTest} disabled={testing}>
          {testing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Play className="h-3 w-3 mr-1" />}
          Test
        </Button>
      </div>

      {mounted ? (
        <Editor
          height="200px"
          language={language === "go" ? "go" : "python"}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            fontSize: 14,
            padding: { top: 8 },
          }}
          loading={<div className="h-[200px] bg-[#1e1e1e] animate-pulse" />}
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

      {results && (
        <div className={`border-t p-4 ${results.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-2 mb-2">
            {results.passed ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${results.passed ? "text-green-800" : "text-red-800"}`}>
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
