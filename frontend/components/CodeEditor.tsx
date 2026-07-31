"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import Editor, { loader, type OnMount } from "@monaco-editor/react";
import { initMonacoEditor, useMonacoSetup } from "@/lib/monaco-setup";
import { MONACO_EDITOR_OPTIONS } from "@/lib/monaco-options";

interface CodeEditorProps {
  /** Read the seed value once at mount. Keep referentially stable (useCallback) so the editor stays memoized while typing. */
  getInitialValue: () => string;
  onChange?: (value: string) => void;
  onMount?: OnMount;
  language: string;
  height?: string | number;
  options?: Parameters<typeof Editor>[0]["options"];
  loading?: React.ReactNode;
}

function CodeEditorInner({
  getInitialValue,
  onChange,
  onMount,
  language,
  height = "100%",
  options,
  loading,
}: CodeEditorProps) {
  // Seed the model exactly once per mount. The editor is intentionally
  // UNCONTROLLED: React never writes back into Monaco, which eliminates the
  // stale-value race that corrupts content during fast typing.
  const [initialValue] = useState<string>(() => getInitialValue());
  const onChangeRef = useRef(onChange);
  const onMountRef = useRef(onMount);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    onMountRef.current = onMount;
  }, [onMount]);

  useMonacoSetup();

  const handleChange = useCallback((value?: string) => {
    onChangeRef.current?.(value ?? "");
  }, []);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    initMonacoEditor(monaco);
    monaco.editor.setTheme("vs-dark-plus");
    onMountRef.current?.(editor, monaco);
  }, []);

  return (
    <Editor
      height={height}
      language={language}
      defaultValue={initialValue}
      onChange={handleChange}
      theme="vs-dark-plus"
      loading={
        loading ?? (
          <div className="h-full w-full flex items-center justify-center bg-[#1E1E2A]">
            <div className="w-6 h-6 rounded-full border-2 border-brand-muted-gold border-t-transparent animate-spin" />
          </div>
        )
      }
      onMount={handleMount}
      options={{ ...MONACO_EDITOR_OPTIONS, ...options }}
    />
  );
}

export const CodeEditor = memo(CodeEditorInner);

// Warm the Monaco loader module-level so the first mount is instant.
if (typeof window !== "undefined") {
  loader.init().catch(() => {
    /* Monaco still works with fallback defaults */
  });
}
