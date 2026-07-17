"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import "@/lib/monaco-setup";
import Editor, { loader } from "@monaco-editor/react";
import { registerVSCodeDarkPlusTheme } from "@/lib/monaco-theme";
import { executeMultiFile, type MultiFileSpec } from "@/lib/pyodide";
import { usePyodide } from "@/hooks/usePyodide";
import PyodideConsole from "@/components/PyodideConsole";
import ResizableSplitPane from "@/components/ResizableSplitPane";
import {
  Loader2,
  Play,
  Globe,
  FileCode,
  CheckCircle2,
  XCircle,
  Terminal,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MultiFileEditorProps {
  files: { path: string; content: string }[];
  entryPoint: string;
}

type RunResult = {
  stdout: string;
  stderr: string;
  error: string | null;
  runtimeMs: number;
};

const fileIcon = (path: string) => {
  if (path.endsWith(".py")) return <FileCode className="h-3.5 w-3.5 text-[#FFD43B]" />;
  if (path.endsWith(".go")) return <FileCode className="h-3.5 w-3.5 text-[#00ADD8]" />;
  return <FileCode className="h-3.5 w-3.5 text-muted-foreground" />;
};

export default function MultiFileEditor({ files, entryPoint }: MultiFileEditorProps) {
  const [activePath, setActivePath] = useState(files[0]?.path || "");
  const [codeByPath, setCodeByPath] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const f of files) map[f.path] = f.content;
    return map;
  });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const {
    ready: pyodideReady,
    loading: pyodideLoading,
    consoleLines,
    execute: pyodideExecute,
    clearConsole,
  } = usePyodide();

  useEffect(() => {
    loader.init().then(registerVSCodeDarkPlusTheme).catch(() => {});
  }, []);

  const activeCode = codeByPath[activePath] || "";
  const isEntryPoint = activePath === entryPoint;

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCodeByPath((prev) => ({ ...prev, [activePath]: value }));
    }
  }, [activePath]);

  const handleRun = useCallback(async () => {
    if (!pyodideReady) {
      setErrorMsg("Pyodide is still loading. Please wait.");
      return;
    }

    setRunning(true);
    setResult(null);
    setErrorMsg(null);
    const startTime = performance.now();

    try {
      const allFiles = files.map((f) => ({
        path: f.path,
        content: codeByPath[f.path] || f.content,
      }));

      const res = await executeMultiFile({ files: allFiles, entryPoint });
      setResult({
        stdout: res.stdout,
        stderr: res.stderr,
        error: res.error,
        runtimeMs: Math.round(performance.now() - startTime),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    }

    setRunning(false);
  }, [files, entryPoint, codeByPath, pyodideReady]);

  const handlePyodideRun = useCallback(async () => {
    if (!pyodideReady || !activeCode.trim()) return;
    await pyodideExecute(activeCode);
  }, [pyodideReady, activeCode, pyodideExecute]);

  // Ctrl+Enter triggers full multi-file run
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRun]);

  const editorContent = (
    <div className="h-full flex flex-col">
      {/* File tabs */}
      <div className="flex items-center border-b border-[#2A2A2A] bg-[#1A1A1A] shrink-0 overflow-x-auto">
        {files.map((f) => {
          const isActive = f.path === activePath;
          const hasChanges = codeByPath[f.path] !== f.content;
          return (
            <button
              key={f.path}
              onClick={() => setActivePath(f.path)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-r border-[#2A2A2A] transition-colors whitespace-nowrap",
                isActive
                  ? "bg-[#1E1E1E] text-white border-t-2 border-t-[#FFD43B] border-b-[#1E1E1E]"
                  : "bg-[#1A1A1A] text-[#888] hover:text-white hover:bg-[#222]",
              )}
            >
              {fileIcon(f.path)}
              <span>{f.path.split("/").pop() || f.path}</span>
              {isEntryPoint && (
                <span className="text-[10px] text-[#FFD43B]/60 ml-1 font-mono">main</span>
              )}
              {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-[#FFD43B] ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#1E1E1E] border-b border-[#2A2A2A] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#666]">
            {activePath.split("/").pop() || activePath}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePyodideRun}
            disabled={running || !pyodideReady}
            className="text-[11px] h-7 px-2 border-[#333] text-[#888] hover:text-white hover:border-[#555]"
            title="Run active file only (Ctrl+Enter runs all)"
          >
            {pyodideLoading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Globe className="h-3 w-3 mr-1" />
            )}
            Run File
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={running || !pyodideReady}
            className="text-[11px] h-7 px-3 bg-[#FFD43B] hover:bg-[#FFD43B]/90 text-[#1A1A1A] font-bold"
          >
            {running ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Play className="h-3 w-3 mr-1" />
            )}
            Run All
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={activePath.endsWith(".py") ? "python" : activePath.endsWith(".go") ? "go" : "plaintext"}
          value={activeCode}
          onChange={handleCodeChange}
          theme="vs-dark-plus"
          loading={<div className="h-full bg-[#1E1E1E]" />}
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
    <div className="h-full overflow-hidden border-l border-[#2A2A2A]">
      <PyodideConsole
        lines={consoleLines}
        onClear={clearConsole}
        isLoading={pyodideLoading && !pyodideReady}
      />
    </div>
  );

  return (
    <div>
      {/* Main editor + console split */}
      <div className="border border-[#2A2A2A] rounded-lg overflow-hidden" style={{ height: "520px" }}>
        <ResizableSplitPane
          left={editorContent}
          right={consoleContent}
          defaultLeftPercent={60}
          minLeftPercent={35}
          minRightPercent={25}
          className="h-[520px]"
        />
      </div>

      {/* Results */}
      {(result || errorMsg) && (
        <div className="mt-4">
          {errorMsg && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/5 text-red-400 text-sm">
              <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {result && (
            <div className={cn(
              "rounded-lg border overflow-hidden",
              result.error ? "border-red-500/30" : result.stderr ? "border-amber-500/30" : "border-green-500/30",
            )}>
              <div className={cn(
                "flex items-center gap-2 px-4 py-2.5 border-b text-sm font-medium",
                result.error ? "bg-red-500/5 border-red-500/30 text-red-400" : result.stderr ? "bg-amber-500/5 border-amber-500/30 text-amber-400" : "bg-green-500/5 border-green-500/30 text-green-400",
              )}>
                {result.error ? <XCircle className="h-4 w-4" /> : result.stderr ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>{result.error ? "Error" : result.stderr ? "Warnings/Errors" : "Completed"}</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground/60">
                  <Clock className="h-3 w-3" />
                  {result.runtimeMs}ms
                </span>
              </div>
              <div className="p-3 bg-[#0A0A0A]">
                <div className="flex items-center gap-1.5 mb-2">
                  <Terminal className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">Output</span>
                </div>
                <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto text-foreground/90">
                  {result.error || result.stderr || result.stdout || "(no output)"}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
