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

export function initTextMateTokenization(monaco: any): void {
  if (initPromise) return;
  initPromise = setupTextMate(monaco).catch((err) => {
    console.warn("[monaco-textmate] falling back to built-in tokenization:", err);
    initPromise = null;
  });
}

async function setupTextMate(monaco: any): Promise<void> {
  const wasmRes = await fetch("/vs/onig.wasm");
  if (!wasmRes.ok) throw new Error(`onig.wasm fetch failed: ${wasmRes.status}`);
  await onig.loadWASM(await wasmRes.arrayBuffer());

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
