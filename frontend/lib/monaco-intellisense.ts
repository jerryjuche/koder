import type { editor, languages, Position } from "monaco-editor";

type Monaco = typeof import("monaco-editor");

export const CompletionKind = {
  Function: 1,
  Variable: 4,
  Class: 5,
  Module: 8,
  Constant: 14,
  Keyword: 17,
  Snippet: 27,
} as const;

export interface ScannedSymbol {
  name: string;
  kind: number;
  line: number;
}

interface Pattern {
  re: RegExp;
  kind: number;
}

const PYTHON_PATTERNS: Pattern[] = [
  { re: /^\s*def\s+([A-Za-z_]\w*)\s*\(/, kind: CompletionKind.Function },
  { re: /^\s*class\s+([A-Za-z_]\w*)\b/, kind: CompletionKind.Class },
  { re: /^\s*([A-Za-z_]\w*)\s*(?::\s*\S+)?=(?!=)/, kind: CompletionKind.Variable },
  { re: /^\s*for\s+([A-Za-z_]\w*)\s+in\b/, kind: CompletionKind.Variable },
  { re: /\bwith\b.+?\s+as\s+([A-Za-z_]\w*)\b/, kind: CompletionKind.Variable },
  { re: /\bexcept\b.*?\s+as\s+([A-Za-z_]\w*)\s*:/, kind: CompletionKind.Variable },
  { re: /^\s*import\s+([A-Za-z_]\w*)/, kind: CompletionKind.Module },
  { re: /^\s*from\s+([A-Za-z_]\w*)\s+import\b/, kind: CompletionKind.Module },
  { re: /\b(?:global|nonlocal)\s+([A-Za-z_]\w*)/, kind: CompletionKind.Variable },
];

const GO_PATTERNS: Pattern[] = [
  { re: /([A-Za-z_]\w*)\s*:=(?!=)/, kind: CompletionKind.Variable },
  { re: /^\s*var\s+([A-Za-z_]\w*)\b/, kind: CompletionKind.Variable },
  { re: /^\s*const\s+\(?\s*([A-Za-z_]\w*)/, kind: CompletionKind.Constant },
  { re: /^\s*func\s+(?:\w+\.)?(\w+)\s*\(/, kind: CompletionKind.Function },
  { re: /^\s*type\s+(\w+)\s+(?:struct|interface)\b/, kind: CompletionKind.Class },
  { re: /^\s*import\s+["'`]([\w./-]+)["'`]/, kind: CompletionKind.Module },
  { re: /^\s*["'`]([\w./-]+)["'`]\s*$/, kind: CompletionKind.Module },
];

const PYTHON_KEYWORDS = new Set([
  "False", "None", "True", "and", "as", "assert", "async", "await", "break",
  "class", "continue", "def", "del", "elif", "else", "except", "finally",
  "for", "from", "global", "if", "import", "in", "is", "lambda", "nonlocal",
  "not", "or", "pass", "raise", "return", "try", "while", "with", "yield",
]);

const GO_KEYWORDS = new Set([
  "break", "default", "func", "interface", "select", "case", "defer", "go",
  "map", "struct", "chan", "else", "goto", "package", "switch", "const",
  "fallthrough", "if", "range", "type", "continue", "for", "import", "return",
  "var",
]);

const MAX_SCAN_LINES = 10_000;

const NAME_PATTERN = /^[A-Za-z_]\w*$/;

function scanModel(
  model: editor.ITextModel,
  cursorLine: number,
  patterns: Pattern[],
): ScannedSymbol[] {
  const symbols = new Map<string, ScannedSymbol>();
  const lineCount = model.getLineCount();
  const scanStart = lineCount <= MAX_SCAN_LINES ? 1 : Math.max(1, cursorLine - 2500);
  const scanEnd = lineCount <= MAX_SCAN_LINES ? lineCount : Math.min(lineCount, cursorLine + 2500);

  const addSymbol = (name: string, kind: number, line: number) => {
    if (!name || !NAME_PATTERN.test(name)) return;
    const existing = symbols.get(name);
    if (!existing || Math.abs(existing.line - cursorLine) > Math.abs(line - cursorLine)) {
      symbols.set(name, { name, kind, line });
    }
  };

  for (let line = scanStart; line <= scanEnd; line++) {
    const text = model.getLineContent(line);

    for (const pattern of patterns) {
      const match = pattern.re.exec(text);
      if (!match) continue;
      addSymbol(match[1] ?? "", pattern.kind, line);
      break;
    }

    const pythonDef = /^\s*def\s+[A-Za-z_]\w*\s*\(([^)]*)\)/.exec(text);
    if (pythonDef) {
      for (const param of pythonDef[1].split(",")) {
        const name = param.split(/[:=]/)[0]?.trim();
        if (name && NAME_PATTERN.test(name) && !PYTHON_KEYWORDS.has(name)) {
          addSymbol(name, CompletionKind.Variable, line);
        }
      }
    }

    const goFunc = /^\s*func\s+(?:\(\w+\s+\*?\w+\)\s+)?\w+\s*\(([^)]*)\)/.exec(text);
    if (goFunc) {
      for (const param of splitGoParams(goFunc[1])) {
        const first = param.trim().split(/\s+/)[0];
        if (first && NAME_PATTERN.test(first) && !GO_KEYWORDS.has(first)) {
          addSymbol(first, CompletionKind.Variable, line);
        }
      }
    }
  }

  return Array.from(symbols.values());
}

function splitGoParams(signature: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of signature) {
    if (char === "(" || char === "[" || char === "{") depth++;
    else if (char === ")" || char === "]" || char === "}") depth--;
    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}

export function collectDocumentIdentifiers(
  model: editor.ITextModel,
  position: Position,
  language: string,
): ScannedSymbol[] {
  return scanModel(model, position.lineNumber, language === "python" ? PYTHON_PATTERNS : GO_PATTERNS);
}

export interface StaticCompletion {
  label: string;
  kind?: number;
  detail?: string;
  documentation?: string;
  insertText: string;
  insertTextRules?: number;
}

const kindLabel = (kind: number): string => {
  const entry = Object.entries(CompletionKind).find(([, v]) => v === kind);
  return entry ? entry[0].toLowerCase() : "symbol";
};

export function buildCompletionSuggestions(
  monaco: Monaco,
  model: editor.ITextModel,
  position: Position,
  language: string,
  staticItems: StaticCompletion[] = [],
  maxSuggestions = 200,
): languages.CompletionItem[] {
  const wordUntil = model.getWordUntilPosition(position);
  const prefix = wordUntil.word.toLowerCase();
  const range = {
    startLineNumber: position.lineNumber,
    endLineNumber: position.lineNumber,
    startColumn: wordUntil.startColumn,
    endColumn: wordUntil.endColumn,
  };

  const docByLabel = new Map<string, ScannedSymbol>();
  for (const sym of collectDocumentIdentifiers(model, position, language)) {
    const existing = docByLabel.get(sym.name);
    if (
      !existing ||
      Math.abs(existing.line - position.lineNumber) > Math.abs(sym.line - position.lineNumber)
    ) {
      docByLabel.set(sym.name, sym);
    }
  }

  const suggestions: languages.CompletionItem[] = [];
  const usedLabels = new Set<string>();

  for (const sym of docByLabel.values()) {
    if (usedLabels.has(sym.name)) continue;
    usedLabels.add(sym.name);
    const distance = Math.abs(sym.line - position.lineNumber);
    const match = sym.name.toLowerCase().startsWith(prefix) ? "0" : "1";
    const rank = String(Math.max(0, 100 - distance)).padStart(3, "0");
    suggestions.push({
      label: sym.name,
      kind: sym.kind,
      detail:
        language === "python"
          ? `${kindLabel(sym.kind)} · line ${sym.line}`
          : `line ${sym.line}`,
      insertText: sym.name,
      filterText: sym.name,
      sortText: `${match}${rank}-${sym.name.toLowerCase()}`,
      range,
    });
  }

  for (const item of staticItems) {
    if (usedLabels.has(item.label)) continue;
    if (prefix && !item.label.toLowerCase().startsWith(prefix)) continue;
    usedLabels.add(item.label);
    suggestions.push({
      label: item.label,
      kind: item.kind ?? CompletionKind.Function,
      detail: item.detail,
      documentation: item.documentation,
      insertText: item.insertText,
      insertTextRules: item.insertTextRules,
      filterText: item.label,
      sortText: `2-${item.label.toLowerCase()}`,
      range,
    });
  }

  return suggestions.slice(0, maxSuggestions);
}

export function registerGoCompletionProvider(monaco: Monaco): void {
  if (goProviderRegistered) return;
  goProviderRegistered = true;

  monaco.languages.registerCompletionItemProvider("go", {
    triggerCharacters: [".", "(", ",", ":"],
    provideCompletionItems: (model: editor.ITextModel, position: Position) => ({
      suggestions: buildCompletionSuggestions(monaco, model, position, "go", GO_STATIC_COMPLETIONS),
    }),
  });

  monaco.languages.registerHoverProvider("go", {
    provideHover: (model: editor.ITextModel, position: Position) => {
      const word = model.getWordAtPosition(position);
      if (!word) return null;
      const doc = GO_HOVER_DOCS[word.word];
      if (!doc) return null;
      return {
        range: {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        },
        contents: [{ value: doc }],
      };
    },
  });
}

let goProviderRegistered = false;

// Static Go completions: the full 25-keyword set plus predeclared builtins
// (append/cap/close/complex/copy/delete/imag/len/make/new/panic/print/println/
// real/recover/min/max/clear) and common stdlib modules. This is a curated
// static list — the future upgrade path is gopls over WASM via
// monaco-languageclient, which would add type-aware completions/hover/diagnostics.
export const GO_STATIC_COMPLETIONS: StaticCompletion[] = [
  { label: "package", kind: CompletionKind.Keyword, insertText: "package " },
  { label: "import", kind: CompletionKind.Keyword, insertText: "import " },
  { label: "func", kind: CompletionKind.Keyword, insertText: "func " },
  { label: "func main", kind: CompletionKind.Function, insertText: "func main() {\n\t$0\n}", insertTextRules: CompletionKind.Snippet },
  { label: "var", kind: CompletionKind.Keyword, insertText: "var " },
  { label: "const", kind: CompletionKind.Keyword, insertText: "const " },
  { label: "type", kind: CompletionKind.Keyword, insertText: "type " },
  { label: "struct", kind: CompletionKind.Keyword, insertText: "struct" },
  { label: "interface", kind: CompletionKind.Keyword, insertText: "interface" },
  { label: "if", kind: CompletionKind.Keyword, insertText: "if " },
  { label: "else", kind: CompletionKind.Keyword, insertText: "else " },
  { label: "for", kind: CompletionKind.Keyword, insertText: "for " },
  { label: "range", kind: CompletionKind.Keyword, insertText: "range" },
  { label: "switch", kind: CompletionKind.Keyword, insertText: "switch " },
  { label: "case", kind: CompletionKind.Keyword, insertText: "case " },
  { label: "default", kind: CompletionKind.Keyword, insertText: "default:" },
  { label: "select", kind: CompletionKind.Keyword, insertText: "select" },
  { label: "defer", kind: CompletionKind.Keyword, insertText: "defer " },
  { label: "go", kind: CompletionKind.Keyword, insertText: "go " },
  { label: "chan", kind: CompletionKind.Keyword, insertText: "chan " },
  { label: "map", kind: CompletionKind.Keyword, insertText: "map[" },
  { label: "break", kind: CompletionKind.Keyword, insertText: "break" },
  { label: "continue", kind: CompletionKind.Keyword, insertText: "continue" },
  { label: "return", kind: CompletionKind.Keyword, insertText: "return " },
  { label: "fallthrough", kind: CompletionKind.Keyword, insertText: "fallthrough" },
  { label: "goto", kind: CompletionKind.Keyword, insertText: "goto " },
  { label: "make", detail: "make(T, ...)", documentation: "Allocate and initialize a slice, map, or channel.", insertText: "make($0)", insertTextRules: CompletionKind.Snippet },
  { label: "new", detail: "new(T)", documentation: "Allocate memory for a value of type T and return a pointer.", insertText: "new($0)", insertTextRules: CompletionKind.Snippet },
  { label: "len", detail: "len(x)", documentation: "Return the length of a string, slice, map, or array.", insertText: "len($0)", insertTextRules: CompletionKind.Snippet },
  { label: "cap", detail: "cap(x)", documentation: "Return the capacity of a slice or array.", insertText: "cap($0)", insertTextRules: CompletionKind.Snippet },
  { label: "append", detail: "append(s, ...v)", documentation: "Append values to a slice.", insertText: "append($0)", insertTextRules: CompletionKind.Snippet },
  { label: "copy", detail: "copy(dst, src)", documentation: "Copy elements from src into dst.", insertText: "copy($0)", insertTextRules: CompletionKind.Snippet },
  { label: "delete", detail: "delete(m, k)", documentation: "Delete the entry with key k from map m.", insertText: "delete($0)", insertTextRules: CompletionKind.Snippet },
  { label: "panic", detail: "panic(v)", documentation: "Stop normal execution and panic with the given value.", insertText: "panic($0)", insertTextRules: CompletionKind.Snippet },
  { label: "recover", detail: "recover()", documentation: "Regain control of a panicking goroutine.", insertText: "recover($0)", insertTextRules: CompletionKind.Snippet },
  { label: "close", detail: "close(c)", documentation: "Close a channel or file.", insertText: "close($0)", insertTextRules: CompletionKind.Snippet },
  { label: "min", detail: "min(x, ...)", documentation: "Return the smallest of the arguments.", insertText: "min($0)", insertTextRules: CompletionKind.Snippet },
  { label: "max", detail: "max(x, ...)", documentation: "Return the largest of the arguments.", insertText: "max($0)", insertTextRules: CompletionKind.Snippet },
  { label: "clear", detail: "clear(m)", documentation: "Delete all entries from a map or zero a slice.", insertText: "clear($0)", insertTextRules: CompletionKind.Snippet },
  { label: "complex", detail: "complex(r, i)", documentation: "Construct a complex number from real and imaginary parts.", insertText: "complex($0)", insertTextRules: CompletionKind.Snippet },
  { label: "imag", detail: "imag(c)", documentation: "Return the imaginary part of a complex number.", insertText: "imag($0)", insertTextRules: CompletionKind.Snippet },
  { label: "real", detail: "real(c)", documentation: "Return the real part of a complex number.", insertText: "real($0)", insertTextRules: CompletionKind.Snippet },
  { label: "print", detail: "print(v, ...)", documentation: "Write the operands to standard error with spaces and a newline (predeclared).", insertText: "print($0)", insertTextRules: CompletionKind.Snippet },
  { label: "println", detail: "println(v, ...)", documentation: "Write the operands to standard error with spaces and a newline (predeclared).", insertText: "println($0)", insertTextRules: CompletionKind.Snippet },
  { label: "int", kind: CompletionKind.Class, insertText: "int" },
  { label: "int64", kind: CompletionKind.Class, insertText: "int64" },
  { label: "float64", kind: CompletionKind.Class, insertText: "float64" },
  { label: "string", kind: CompletionKind.Class, insertText: "string" },
  { label: "bool", kind: CompletionKind.Class, insertText: "bool" },
  { label: "byte", kind: CompletionKind.Class, insertText: "byte" },
  { label: "rune", kind: CompletionKind.Class, insertText: "rune" },
  { label: "error", kind: CompletionKind.Class, insertText: "error" },
  { label: "any", kind: CompletionKind.Class, insertText: "any" },
  { label: "nil", kind: CompletionKind.Constant, insertText: "nil" },
  { label: "true", kind: CompletionKind.Constant, insertText: "true" },
  { label: "false", kind: CompletionKind.Constant, insertText: "false" },
  { label: "fmt", kind: CompletionKind.Module, insertText: "fmt" },
  { label: "strings", kind: CompletionKind.Module, insertText: "strings" },
  { label: "strconv", kind: CompletionKind.Module, insertText: "strconv" },
  { label: "math", kind: CompletionKind.Module, insertText: "math" },
  { label: "sort", kind: CompletionKind.Module, insertText: "sort" },
  { label: "errors", kind: CompletionKind.Module, insertText: "errors" },
  { label: "os", kind: CompletionKind.Module, insertText: "os" },
  { label: "io", kind: CompletionKind.Module, insertText: "io" },
  { label: "json", kind: CompletionKind.Module, insertText: "json" },
  { label: "time", kind: CompletionKind.Module, insertText: "time" },
  { label: "reflect", kind: CompletionKind.Module, insertText: "reflect" },
  { label: "unicode", kind: CompletionKind.Module, insertText: "unicode" },
  { label: "bytes", kind: CompletionKind.Module, insertText: "bytes" },
  { label: "slices", kind: CompletionKind.Module, insertText: "slices" },
  { label: "maps", kind: CompletionKind.Module, insertText: "maps" },
  { label: "sync", kind: CompletionKind.Module, insertText: "sync" },
];

const GO_HOVER_DOCS: Record<string, string> = {};

for (const item of GO_STATIC_COMPLETIONS) {
  const kind = kindLabel(item.kind ?? CompletionKind.Function);
  const detail = item.detail ? `**${item.detail}**  ` : "";
  const doc = item.documentation ? `\n\n${item.documentation}` : "";
  GO_HOVER_DOCS[item.label] = `*Go ${kind}*  \n${detail}${doc}`;
}
