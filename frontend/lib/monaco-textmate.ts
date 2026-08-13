"use client";

// Real TextMate tokenization for Go + Python, exactly as VS Code renders them.
//
// vscode-textmate tokenizes a line into a Uint32Array of encoded tokens whose
// foreground/background ids index into the theme's color map. Monaco exposes the
// same binary format via `languages.setTokensProvider` + `tokenizeEncoded`
// (EncodedTokenizationSupportAdapter) — the ids are rendered against a color map
// installed with `languages.setColorMap`, so no scope-to-color translation is
// needed and the output matches Dark+ pixel-for-pixel.
import * as tm from "vscode-textmate";
import * as onig from "vscode-oniguruma";

import pythonGrammar from "@/lib/grammars/python.tmLanguage.json";
import goGrammar from "@/lib/grammars/go.tmLanguage.json";
import textmateTheme from "@/lib/dark-plus-textmate.generated.json";

let initPromise: Promise<void> | null = null;

const WASM_FETCH_TIMEOUT_MS = 10_000;
const WASM_MAX_ATTEMPTS = 4;

async function fetchOnigWasm(): Promise<ArrayBuffer> {
  const url = "/vs/onig.wasm";
  let lastErr: Error = new Error(`onig.wasm fetch failed`);
  for (let attempt = 0; attempt < WASM_MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(WASM_FETCH_TIMEOUT_MS) });
      if (res.ok) return await res.arrayBuffer();
      lastErr = new Error(`onig.wasm fetch failed: ${res.status}`);
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error("onig.wasm fetch failed");
    }
  }
  throw lastErr;
}

export function initTextMateTokenization(monaco: any): void {
  if (initPromise) return;
  initPromise = setupTextMate(monaco).catch((err) => {
    console.warn("[monaco-textmate] falling back to built-in tokenization:", err);
    initPromise = null;
  });
}

async function setupTextMate(monaco: any): Promise<void> {
  const wasmBuffer = await fetchOnigWasm();
  await onig.loadWASM(wasmBuffer);

  const registry = new tm.Registry({
    onigLib: Promise.resolve({
      createOnigScanner: (patterns: string[]) => onig.createOnigScanner(patterns),
      createOnigString: (text: string) => onig.createOnigString(text),
    }),
    loadGrammar: async (scopeName: string) => {
      if (scopeName === "source.python") return pythonGrammar as tm.IRawGrammar;
      if (scopeName === "source.go") return goGrammar as tm.IRawGrammar;
      return null;
    },
  });

  registry.setTheme(textmateTheme as tm.IRawTheme, null);
  const colorMap = registry.getColorMap();
  monaco.languages.setColorMap(colorMap as string[]);

  const python = await registry.loadGrammar("source.python");
  if (python) {
    monaco.languages.setTokensProvider("python", makeEncodedProvider(python));
  }
  const go = await registry.loadGrammar("source.go");
  if (go) {
    monaco.languages.setTokensProvider("go", makeEncodedProvider(go));
  }
}

function makeEncodedProvider(grammar: tm.Grammar) {
  return {
    getInitialState: () => tm.INITIAL,
    tokenizeEncoded: (line: string, state: any) => {
      const result = grammar.tokenizeLine2(line, state);
      return { tokens: result.tokens, endState: result.ruleStack };
    },
  };
}
