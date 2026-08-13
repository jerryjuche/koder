"use client";

// Background Monaco warm-up. Called from MonacoPreloader (and can be awaited
// from the landing page's CodeEditor) to fetch the AMD build + TextMate
// assets during idle instead of on first editor mount.
//
// This runs the exact same init path editors use (loader config + loader.init +
// initMonacoEditor), so the module-level `initialized` guard in monaco-setup
// flips to true here and later mounts skip duplicate registrations. Monaco
// still paints lazily on mount — warm-up only pre-fetches/pre-parses.
//
// Kept module-scope (not a hook) so it can also run from non-React entry
// points without re-mounting across the tree.
import { loader } from "@monaco-editor/react";
import { initMonacoEditor } from "@/lib/monaco-setup";

export function warmMonaco(): Promise<any> {
  return loader
    .init()
    .then((monaco) => initMonacoEditor(monaco))
    .catch(() => null);
}