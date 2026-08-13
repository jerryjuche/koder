"use client";

import { useEffect } from "react";

/**
 * Background Monaco warm-up. Mirrors PyodidePreloader: kicked off on every
 * authenticated page so the Monaco AMD build + TextMate assets fetch and parse
 * during idle instead of blocking the first editor mount (~5 s before this
 * existed). The dynamic import also prefetches the shared Monaco chunks
 * (CodeEditor, monaco-setup, vscode-textmate/oniguruma) used by the problem
 * workspace and the Learn exercises, so navigation into an editor is instant.
 */
export default function MonacoPreloader() {
  useEffect(() => {
    let cancelled = false;
    import(/* webpackChunkName: "monaco-warm" */ "@/lib/monaco-warm")
      .then((mod) => {
        if (!cancelled) mod.warmMonaco();
      })
      .catch(() => {
        /* Monaco loads lazily on the first editor mount if warm-up fails */
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}