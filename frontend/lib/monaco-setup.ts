"use client";

import { useEffect } from "react";
import { loader } from "@monaco-editor/react";
import { registerVSCodeDarkPlusTheme } from "@/lib/monaco-theme";
import { registerPythonLanguageFeatures } from "@/lib/monaco-python";
import { registerGoCompletionProvider } from "@/lib/monaco-intellisense";

// Serve Monaco's AMD build + workers from /public/vs (copied by scripts/copy-monaco.mjs).
// Single config point — do not call loader.config anywhere else.
loader.config({ paths: { vs: "/vs" } });

let initialized = false;

export function initMonacoEditor(monaco: any): any {
  if (initialized) return monaco;
  initialized = true;

  registerVSCodeDarkPlusTheme(monaco);
  registerPythonLanguageFeatures(monaco);
  registerGoCompletionProvider(monaco);

  // The editor measures glyph widths from the loaded font. If a web font is
  // applied after Monaco boots, line metrics go stale and lines can wrap or
  // jump while typing. Re-measure once fonts are ready to keep metrics exact.
  if (typeof document !== "undefined" && "fonts" in document) {
    document.fonts.ready
      .then(() => {
        try {
          monaco.editor.remeasureFonts?.();
        } catch {
          /* no-op */
        }
      })
      .catch(() => {
        /* no-op */
      });
  }

  return monaco;
}

export function useMonacoSetup() {
  useEffect(() => {
    let cancelled = false;
    loader
      .init()
      .then((monaco) => {
        if (!cancelled) initMonacoEditor(monaco);
      })
      .catch(() => {
        /* Monaco still works with fallback defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);
}
