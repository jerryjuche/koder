import type { languages, editor } from "monaco-editor";

// ─── VS Code Dark+ Color Palette ─────────────────────────────────────────────

const C = {
  bg: "#1E1E1E",
  fg: "#D4D4D4",
  comment: "#6A9955",
  keyword: "#C586C0",
  function: "#DCDCAA",
  type: "#4EC9B0",
  variable: "#9CDCFE",
  string: "#CE9178",
  number: "#B5CEA8",
  module: "#CE9178",
  self: "#9CDCFE",
  tag: "#569CD6",
  lineHighlight: "#2A2D2E",
  selection: "#264F78",
  inactiveSelection: "#3A3D41",
  cursor: "#AEAFAD",
  lineNumber: "#858585",
  lineNumberActive: "#C6C6C6",
  bracketBg: "#3A3D41",
  bracketBorder: "#888888",
  widgetBg: "#252526",
  widgetBorder: "#454545",
  suggestSelected: "#094771",
};

// ─── Go tokenizer ────────────────────────────────────────────────────────────

const goKeywords = [
  "break", "case", "chan", "const", "continue", "default", "defer",
  "else", "fallthrough", "for", "func", "go", "goto", "if",
  "import", "interface", "map", "package", "range", "return",
  "select", "struct", "switch", "type", "var",
];

const goTypes = [
  "bool", "true", "false", "uint8", "uint16", "uint32", "uint64",
  "int8", "int16", "int32", "int64", "float32", "float64",
  "complex64", "complex128", "byte", "rune", "uint", "int",
  "uintptr", "string", "nil",
];

const goOperators = [
  "+", "-", "*", "/", "%", "&", "|", "^", "<<", ">>", "&^",
  "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>=", "&^=",
  "&&", "||", "<-", "++", "--", "==", "<", ">", "=", "!", "!=",
  "<=", ">=", ":=", "...",
];

const goSymbols = /[=><!~?:&|+\-*\/\^%]+/;
const goEscapes = /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/;

const goLanguage: languages.IMonarchLanguage = {
  defaultToken: "",
  tokenPostfix: ".go",

  keywords: goKeywords,
  types: goTypes,
  operators: goOperators,
  symbols: goSymbols,
  escapes: goEscapes,

  tokenizer: {
    root: [
      [/\b(func)(\s+)([a-zA-Z_]\w*)\b/, ["keyword.func", "", "entity.name.function"]],
      [/\b(type)(\s+)([a-zA-Z_]\w*)\b/, ["keyword.type", "", "entity.name.type"]],
      [/\b(var|const)(\s+)([a-zA-Z_]\w*)\b/, ["storage.modifier", "", "variable.other"]],
      [/\b(func)(\s*\([^)]*\))(\s+)([a-zA-Z_]\w*)\s*\(/, ["keyword.func", "", "", "entity.name.function", ""]],
      [/\b(package)(\s+)([a-zA-Z_]\w*)/, ["keyword.package", "", "entity.name.import"]],

      [/[a-zA-Z_]\w*/, {
        cases: {
          "@keywords": { token: "keyword.$0" },
          "@types": "support.type",
          "@default": "identifier",
        },
      }],

      { include: "@whitespace" },
      [/\[\[.*\]\]/, "annotation"],
      [/^\s*#\w+/, "keyword"],
      [/[{}()\[\]]/, "punctuation"],
      [/[<>](?!@symbols)/, "punctuation"],
      [/@symbols/, {
        cases: {
          "@operators": "keyword.operator",
          "@default": "",
        },
      }],
      [/\d*\d+[eE]([\-+]?\d+)?/, "constant.numeric"],
      [/\d*\.\d+([eE][\-+]?\d+)?/, "constant.numeric"],
      [/0[xX][0-9a-fA-F']*[0-9a-fA-F]/, "constant.numeric"],
      [/0[0-7']*[0-7]/, "constant.numeric"],
      [/0[bB][0-1']*[0-1]/, "constant.numeric"],
      [/\d[\d']*/, "constant.numeric"],
      [/\d/, "constant.numeric"],
      [/[;,.]/, "punctuation"],
      [/"([^"\\]|\\.)*$/, "string.invalid"],
      [/"/, "string", "@string"],
      [/`/, "string", "@rawstring"],
      [/'[^\\']'/, "string"],
      [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
      [/'/, "string.invalid"],
    ],

    whitespace: [
      [/[ \t\r\n]+/, ""],
      [/\/\*\*(?!\/)/, "comment.doc", "@doccomment"],
      [/\/\*/, "comment", "@comment"],
      [/\/\/.*$/, "comment"],
    ],

    comment: [
      [/[^\/*]+/, "comment"],
      [/\*\//, "comment", "@pop"],
      [/[\/*]/, "comment"],
    ],

    doccomment: [
      [/[^\/*]+/, "comment.doc"],
      [/\/\*/, "comment.doc.invalid"],
      [/\*\//, "comment.doc", "@pop"],
      [/[\/*]/, "comment.doc"],
    ],

    string: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, "string", "@pop"],
    ],

    rawstring: [
      [/[^\`]/, "string"],
      [/`/, "string", "@pop"],
    ],
  },
};

// ─── Python tokenizer ────────────────────────────────────────────────────────

const pythonKeywords = [
  "False", "None", "True", "_", "and", "as", "assert", "async", "await",
  "break", "case", "class", "continue", "def", "del", "elif", "else",
  "except", "exec", "finally", "for", "from", "global", "if", "import",
  "in", "is", "lambda", "match", "nonlocal", "not", "or", "pass",
  "print", "raise", "return", "try", "type", "while", "with", "yield",
  "int", "float", "long", "complex", "hex", "abs", "all", "any",
  "apply", "basestring", "bin", "bool", "buffer", "bytearray",
  "callable", "chr", "classmethod", "cmp", "coerce", "compile",
  "complex", "delattr", "dict", "dir", "divmod", "enumerate", "eval",
  "execfile", "file", "filter", "format", "frozenset", "getattr",
  "globals", "hasattr", "hash", "help", "id", "input", "intern",
  "isinstance", "issubclass", "iter", "len", "locals", "list", "map",
  "max", "memoryview", "min", "next", "object", "oct", "open", "ord",
  "pow", "property", "reversed", "range", "raw_input", "reduce",
  "reload", "repr", "reversed", "round", "set", "setattr", "slice",
  "sorted", "staticmethod", "str", "sum", "super", "tuple", "unichr",
  "unicode", "vars", "xrange", "zip",
  "__dict__", "__methods__", "__members__", "__class__", "__bases__",
  "__name__", "__mro__", "__subclasses__", "__init__", "__import__",
];

const pythonLanguage: languages.IMonarchLanguage = {
  defaultToken: "",
  tokenPostfix: ".python",

  keywords: pythonKeywords,

  brackets: [
    { open: "{", close: "}", token: "punctuation" },
    { open: "[", close: "]", token: "punctuation" },
    { open: "(", close: ")", token: "punctuation" },
  ],

  tokenizer: {
    root: [
      { include: "@whitespace" },
      { include: "@numbers" },
      { include: "@strings" },

      [/\b(def)(\s+)([a-zA-Z_]\w*)\b/, ["keyword.def", "", "entity.name.function"]],
      [/\b(class)(\s+)([a-zA-Z_]\w*)\b/, ["keyword.class", "", "entity.name.type"]],

      [/\bself\b/, "variable.language.special.self.python"],
      [/\bcls\b/, "variable.language.special.self.python"],

      [/[,:;]/, "punctuation"],
      [/[{}()\[\]]/, "@brackets"],
      [/@[a-zA-Z_]\w*/, "tag"],

      [/[a-zA-Z_]\w*/, {
        cases: {
          "@keywords": { token: "keyword.$0" },
          "@default": "identifier",
        },
      }],
    ],

    whitespace: [
      [/\s+/, "white"],
      [/(^#.*$)/, "comment"],
      [/'''/, "string", "@endDocString"],
      [/"""/, "string", "@endDblDocString"],
    ],

    endDocString: [
      [/[^']+/, "string"],
      [/\\'/, "string"],
      [/'''/, "string", "@popall"],
      [/'/, "string"],
    ],

    endDblDocString: [
      [/[^"]+/, "string"],
      [/\\"/, "string"],
      [/"""/, "string", "@popall"],
      [/"/, "string"],
    ],

    numbers: [
      [/-?0x([abcdef]|[ABCDEF]|\d)+[lL]?/, "constant.numeric"],
      [/-?(\d*\.)?\d+([eE][+\-]?\d+)?[jJ]?[lL]?/, "constant.numeric"],
    ],

    strings: [
      [/'$/, "string.escape", "@popall"],
      [/f'{1,3}/, "string.escape", "@fStringBody"],
      [/'/, "string.escape", "@stringBody"],
      [/"$/, "string.escape", "@popall"],
      [/f"{1,3}/, "string.escape", "@fDblStringBody"],
      [/"/, "string.escape", "@dblStringBody"],
    ],

    fStringBody: [
      [/[^\\'\{\}]+$/, "string", "@popall"],
      [/[^\\'\{\}]+/, "string"],
      [/\{[^\}':!=]+/, "identifier", "@fStringDetail"],
      [/\\./, "string"],
      [/'/, "string.escape", "@popall"],
      [/\\$/, "string"],
    ],
    stringBody: [
      [/[^\\']+$/, "string", "@popall"],
      [/[^\\']+/, "string"],
      [/\\./, "string"],
      [/'/, "string.escape", "@popall"],
      [/\\$/, "string"],
    ],
    fDblStringBody: [
      [/[^\\"\{\}]+$/, "string", "@popall"],
      [/[^\\"\{\}]+/, "string"],
      [/\{[^\}':!=]+/, "identifier", "@fStringDetail"],
      [/\\./, "string"],
      [/"/, "string.escape", "@popall"],
      [/\\$/, "string"],
    ],
    dblStringBody: [
      [/[^\\"]+$/, "string", "@popall"],
      [/[^\\"]+/, "string"],
      [/\\./, "string"],
      [/"/, "string.escape", "@popall"],
      [/\\$/, "string"],
    ],
    fStringDetail: [
      [/[:][^}]+/, "string"],
      [/[!][ars]/, "string"],
      [/=/, "string"],
      [/\}/, "identifier", "@pop"],
    ],
  },
};

// ─── Theme: VS Code Dark+ ────────────────────────────────────────────────────

const themeRules: editor.ITokenThemeRule[] = [
  { token: "", foreground: C.fg, background: C.bg },

  { token: "comment", foreground: C.comment, fontStyle: "italic" },
  { token: "keyword", foreground: C.keyword },
  { token: "keyword.control", foreground: C.keyword },
  { token: "keyword.package", foreground: C.keyword },
  { token: "keyword.operator", foreground: C.fg },
  { token: "storage.modifier", foreground: C.keyword },

  { token: "entity.name.function", foreground: C.function },
  { token: "support.function", foreground: C.function },
  { token: "entity.name.type", foreground: C.type },
  { token: "support.type", foreground: C.type },
  { token: "entity.name.import", foreground: C.module },

  { token: "variable.other", foreground: C.variable },
  { token: "variable.parameter", foreground: C.variable },
  { token: "variable.language.special.self.python", foreground: C.variable },

  { token: "string", foreground: C.string },
  { token: "string.quoted", foreground: C.string },
  { token: "constant.numeric", foreground: C.number },
  { token: "punctuation", foreground: C.fg },
  { token: "tag", foreground: C.tag },

  { token: "function", foreground: C.function },
  { token: "variable", foreground: C.variable },
  { token: "parameter", foreground: C.variable },
  { token: "property", foreground: C.variable },
  { token: "type", foreground: C.type },
  { token: "class", foreground: C.type },
  { token: "struct", foreground: C.type },
  { token: "interface", foreground: C.type },
];

const themeColors: editor.IStandaloneThemeData["colors"] = {
  "editor.background": C.bg,
  "editor.foreground": C.fg,
  "editor.lineHighlightBackground": C.lineHighlight,
  "editor.selectionBackground": C.selection,
  "editor.inactiveSelectionBackground": C.inactiveSelection,
  "editorCursor.foreground": C.cursor,
  "editorLineNumber.foreground": C.lineNumber,
  "editorLineNumber.activeForeground": C.lineNumberActive,
  "editor.selectionHighlightBackground": C.inactiveSelection,
  "editorBracketMatch.background": C.bracketBg,
  "editorBracketMatch.border": C.bracketBorder,
  "editorGutter.background": C.bg,
  "editorWidget.background": C.widgetBg,
  "editorWidget.border": C.widgetBorder,
  "editorSuggestWidget.background": C.widgetBg,
  "editorSuggestWidget.border": C.widgetBorder,
  "editorSuggestWidget.selectedBackground": C.suggestSelected,
  "minimap.background": C.bg,
};

// ─── Semantic Tokens ─────────────────────────────────────────────────────────

interface TokenSpan {
  line: number;
  startCol: number;
  length: number;
  typeIdx: number;
}

const SEM_TOKENS = ["function", "variable", "type", "parameter", "property", "struct", "class", "interface"];
const SEM_IDX: Record<string, number> = {};
SEM_TOKENS.forEach((t, i) => { SEM_IDX[t] = i; });

function semType(name: string): number {
  return SEM_IDX[name] ?? 0;
}

const semLegend: languages.SemanticTokensLegend = {
  tokenTypes: SEM_TOKENS,
  tokenModifiers: [],
};

function encode(spans: TokenSpan[]): Uint32Array {
  if (spans.length === 0) return new Uint32Array(0);
  spans.sort((a, b) => a.line !== b.line ? a.line - b.line : a.startCol - b.startCol);
  const data: number[] = [];
  let prevLine = 0, prevCol = 0;

  for (const s of spans) {
    const lineDelta = s.line - prevLine;
    const colDelta = lineDelta === 0 ? s.startCol - prevCol : s.startCol;
    data.push(lineDelta, colDelta, s.length, s.typeIdx, 0);
    prevLine = s.line;
    prevCol = s.startCol;
  }

  return new Uint32Array(data);
}

function goSemanticTokens(text: string): TokenSpan[] {
  const spans: TokenSpan[] = [];
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // func Name( or func Name[
    const fn = line.match(/\bfunc\s+([A-Za-z_]\w*)\s*[(\[]/);
    if (fn) {
      const col = line.indexOf(fn[1]) + 1;
      spans.push({ line: i, startCol: col, length: fn[1].length, typeIdx: semType("function") });
      continue;
    }

    // func (r T) Name( — method
    const method = line.match(/\bfunc\s*\([^)]*\)\s+([A-Za-z_]\w*)\s*\(/);
    if (method) {
      const col = line.indexOf(method[1]) + 1;
      spans.push({ line: i, startCol: col, length: method[1].length, typeIdx: semType("function") });
      continue;
    }

    // type Name
    const tp = line.match(/\btype\s+([A-Za-z_]\w*)\b/);
    if (tp) {
      const col = line.indexOf(tp[1]) + 1;
      spans.push({ line: i, startCol: col, length: tp[1].length, typeIdx: semType("type") });
      continue;
    }

    // var Name
    const vr = line.match(/\bvar\s+([A-Za-z_]\w*)\b/);
    if (vr) {
      const col = line.indexOf(vr[1]) + 1;
      spans.push({ line: i, startCol: col, length: vr[1].length, typeIdx: semType("variable") });
      continue;
    }

    // Name :=  — short variable decl
    const sv = line.match(/\b([a-z_]\w*)\s*:=\s/);
    if (sv) {
      const col = line.indexOf(sv[1]) + 1;
      spans.push({ line: i, startCol: col, length: sv[1].length, typeIdx: semType("variable") });
    }
  }

  return spans;
}

function pythonSemanticTokens(text: string): TokenSpan[] {
  const spans: TokenSpan[] = [];
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // def Name(
    const fn = line.match(/\bdef\s+([A-Za-z_]\w*)\s*\(/);
    if (fn) {
      const col = line.indexOf(fn[1]) + 1;
      spans.push({ line: i, startCol: col, length: fn[1].length, typeIdx: semType("function") });
      continue;
    }

    // class Name
    const cls = line.match(/\bclass\s+([A-Za-z_]\w*)\b/);
    if (cls) {
      const col = line.indexOf(cls[1]) + 1;
      spans.push({ line: i, startCol: col, length: cls[1].length, typeIdx: semType("class") });
    }
  }

  return spans;
}

function registerSemanticProviders(monaco: typeof import("monaco-editor")) {
  try {
    monaco.languages.registerDocumentSemanticTokensProvider("go", {
      getLegend: () => semLegend,
      provideDocumentSemanticTokens: (model) => {
        const spans = goSemanticTokens(model.getValue());
        return { data: encode(spans) };
      },
      releaseDocumentSemanticTokens: () => {},
    });
  } catch (e) {
    console.warn("Failed to register Go semantic tokens provider:", e);
  }

  try {
    monaco.languages.registerDocumentSemanticTokensProvider("python", {
      getLegend: () => semLegend,
      provideDocumentSemanticTokens: (model) => {
        const spans = pythonSemanticTokens(model.getValue());
        return { data: encode(spans) };
      },
      releaseDocumentSemanticTokens: () => {},
    });
  } catch (e) {
    console.warn("Failed to register Python semantic tokens provider:", e);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

let registered = false;

export function setupMonacoTheme(monaco: typeof import("monaco-editor")) {
  if (monaco.editor.defineTheme) {
    monaco.editor.defineTheme("koder-vscode", {
      base: "vs-dark",
      inherit: true,
      rules: themeRules,
      colors: themeColors,
    });
    monaco.editor.setTheme("koder-vscode");
  }

  try {
    monaco.languages.setMonarchTokensProvider("go", goLanguage);
  } catch (e) {
    console.warn("Failed to register Go tokenizer:", e);
  }
  try {
    monaco.languages.setMonarchTokensProvider("python", pythonLanguage);
  } catch (e) {
    console.warn("Failed to register Python tokenizer:", e);
  }

  registerSemanticProviders(monaco);

  registered = true;
}

export function refreshLanguageTokens(monaco: typeof import("monaco-editor"), language: string) {
  if (language === "go") {
    try {
      monaco.languages.setMonarchTokensProvider("go", goLanguage);
    } catch (e) {
      console.warn("Failed to refresh Go tokenizer:", e);
    }
  } else if (language === "python") {
    try {
      monaco.languages.setMonarchTokensProvider("python", pythonLanguage);
    } catch (e) {
      console.warn("Failed to refresh Python tokenizer:", e);
    }
  }
}

export function isThemeRegistered() {
  return registered;
}
