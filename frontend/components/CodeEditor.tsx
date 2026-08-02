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

  const handleBeforeMount = useCallback((monaco: any) => {
    initMonacoEditor(monaco);
  }, []);

  // Monaco's Enter handler only applies language indentation rules (which give
  // the auto-indent after a colon) when the current line is cheaply tokenizable.
  // With custom TextMate tokenizers that state is reliably stale while typing,
  // forceTokenization() is async and can't help synchronously. Instead, we
  // manually detect lines ending with ":" and insert the indented newline
  // ourselves, bypassing the stale-tokenization check entirely.
  const handleEnterIndent = useCallback(
    (editor: any, monaco: any) =>
      editor.onKeyDown((e: any) => {
        if (e.keyCode !== monaco.KeyCode.Enter) return;
        const model = editor.getModel();
        const position = editor.getPosition();
        if (!model || !position) return;

        const line = position.lineNumber;
        const lineContent = model.getLineContent(line);
        const trimmed = lineContent.trimEnd();

        // Only intervene for Python lines ending with ':'
        if (!trimmed.endsWith(":")) return;

        // Extract leading whitespace from the current line
        const leadingWs = lineContent.match(/^(\s*)/)?.[1] ?? "";
        const tabSize = editor.getOption(monaco.editor.EditorOption.tabSize) ?? 4;
        const insertSpaces = editor.getOption(monaco.editor.EditorOption.insertSpaces) ?? true;
        const indentUnit = insertSpaces ? " ".repeat(tabSize) : "\t";

        // Prevent Monaco's default Enter handling
        e.preventDefault();
        e.stopPropagation();

        // Insert: newline + current indent + one extra indent level
        const insertText = "\n" + leadingWs + indentUnit;
        editor.executeEdits("auto-indent", [
          {
            range: {
              startLineNumber: line,
              startColumn: lineContent.length + 1,
              endLineNumber: line,
              endColumn: lineContent.length + 1,
            },
            text: insertText,
          },
        ]);

        // Move cursor to the new indented position
        const newLine = line + 1;
        const newColumn = leadingWs.length + indentUnit.length + 1;
        editor.setPosition({ lineNumber: newLine, column: newColumn });
      }),
    []
  );

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      initMonacoEditor(monaco);
      monaco.editor.setTheme("vs-dark-plus");
      handleEnterIndent(editor, monaco);
      onMountRef.current?.(editor, monaco);
    },
    [handleEnterIndent]
  );

  return (
    <Editor
      height={height}
      language={language}
      defaultValue={initialValue}
      onChange={handleChange}
      beforeMount={handleBeforeMount}
      theme="vs-dark-plus"
      loading={
        loading ?? (
          <div className="h-full w-full flex items-center justify-center bg-brand-charcoal-panel">
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
