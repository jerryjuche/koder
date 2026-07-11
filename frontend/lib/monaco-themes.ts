import type { languages, editor } from "monaco-editor";

// ─── Go tokenizer ────────────────────────────────────────────────────────────

const goKeywords = [
  "break", "case", "chan", "const", "continue", "default", "defer",
  "else", "fallthrough", "for", "func", "go", "goto", "if",
  "import", "interface", "map", "package", "range", "return",
  "select", "struct", "switch", "type", "var",
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
  "(", ")", "", "]", "{", "}", ",", ";", ".", ":",
];

const goSymbols = /[=><!~?:&|+\-*\/\^%]+/;
const goEscapes = /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/;

const customGoLanguage: languages.IMonarchLanguage = {
  defaultToken: "",
  tokenPostfix: ".go",

  keywords: goKeywords,
  operators: goOperators,
  symbols: goSymbols,
  escapes: goEscapes,

  tokenizer: {
    root: [
      [/\b(func)(\s+)([a-zA-Z_]\w*)\b/, ["keyword.func", "", "identifier.function"]],
      [/\b(type)(\s+)([a-zA-Z_]\w*)\b/, ["keyword.type", "", "identifier.type"]],
      [/\b(var|const)(\s+)([a-zA-Z_]\w*)\b/, ["keyword.declaration", "", "identifier.variable"]],
      [/\b(func)(\s+)([a-zA-Z_*]\w*)/, ["keyword.func", "", "identifier.function"]],
      [/\b(package)(\s+)([a-zA-Z_]\w*)/, ["keyword.package", "", "identifier.module"]],

      [/[a-zA-Z_]\w*/, {
        cases: {
          "@keywords": { token: "keyword.$0" },
          "@default": "identifier",
        },
      }],
      { include: "@whitespace" },
      [/\[\[.*\]\]/, "annotation"],
      [/^\s*#\w+/, "keyword"],
      [/[{}()\[\]]/, "@brackets"],
      [/[<>](?!@symbols)/, "@brackets"],
      [/@symbols/, {
        cases: {
          "@operators": "delimiter",
          "@default": "",
        },
      }],
      [/\d*\d+[eE]([\-+]?\d+)?/, "number.float"],
      [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
      [/0[xX][0-9a-fA-F']*[0-9a-fA-F]/, "number.hex"],
      [/0[0-7']*[0-7]/, "number.octal"],
      [/0[bB][0-1']*[0-1]/, "number.binary"],
      [/\d[\d']*/, "number"],
      [/\d/, "number"],
      [/[;,.]/, "delimiter"],
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

const customPythonLanguage: languages.IMonarchLanguage = {
  defaultToken: "",
  tokenPostfix: ".python",

  keywords: pythonKeywords,

  brackets: [
    { open: "{", close: "}", token: "delimiter.curly" },
    { open: "[", close: "]", token: "delimiter.bracket" },
    { open: "(", close: ")", token: "delimiter.parenthesis" },
  ],

  tokenizer: {
    root: [
      { include: "@whitespace" },
      { include: "@numbers" },
      { include: "@strings" },

      [/\b(def)(\s+)([a-zA-Z_]\w*)\b/, ["keyword.def", "", "identifier.function"]],
      [/\b(class)(\s+)([a-zA-Z_]\w*)\b/, ["keyword.class", "", "identifier.type"]],

      [/\bself\b/, "variable.language.self"],
      [/\bcls\b/, "variable.language.self"],

      [/[,:;]/, "delimiter"],
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
      [/-?0x([abcdef]|[ABCDEF]|\d)+[lL]?/, "number.hex"],
      [/-?(\d*\.)?\d+([eE][+\-]?\d+)?[jJ]?[lL]?/, "number"],
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

// ─── Theme ───────────────────────────────────────────────────────────────────

const themeRules: editor.ITokenThemeRule[] = [
  { token: "", foreground: "D4D4D4", background: "1E1E1E" },
  { token: "comment", foreground: "6A9955", fontStyle: "italic" },
  { token: "keyword", foreground: "C586C0" },
  { token: "identifier.function", foreground: "DCDCAA" },
  { token: "identifier.type", foreground: "4EC9B0" },
  { token: "identifier.variable", foreground: "9CDCFE" },
  { token: "identifier.module", foreground: "CE9178" },
  { token: "variable.language.self", foreground: "9CDCFE" },
  { token: "type", foreground: "4EC9B0" },
  { token: "string", foreground: "CE9178" },
  { token: "number", foreground: "B5CEA8" },
  { token: "delimiter", foreground: "D4D4D4" },
  { token: "tag", foreground: "569CD6" },
  { token: "attribute.name", foreground: "9CDCFE" },
  { token: "attribute.value", foreground: "CE9178" },
];

const themeColors: editor.IStandaloneThemeData["colors"] = {
  "editor.background": "#1E1E1E",
  "editor.foreground": "#D4D4D4",
  "editor.lineHighlightBackground": "#2A2D2E",
  "editor.selectionBackground": "#264F78",
  "editor.inactiveSelectionBackground": "#3A3D41",
  "editorCursor.foreground": "#AEAFAD",
  "editorLineNumber.foreground": "#858585",
  "editorLineNumber.activeForeground": "#C6C6C6",
  "editor.selectionHighlightBackground": "#3A3D41",
  "editorBracketMatch.background": "#3A3D41",
  "editorBracketMatch.border": "#888888",
  "editorGutter.background": "#1E1E1E",
  "editorWidget.background": "#252526",
  "editorWidget.border": "#454545",
  "editorSuggestWidget.background": "#252526",
  "editorSuggestWidget.border": "#454545",
  "editorSuggestWidget.selectedBackground": "#094771",
  "minimap.background": "#1E1E1E",
};

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
    monaco.languages.setMonarchTokensProvider("go", customGoLanguage);
  } catch (e) {
    console.warn("Failed to register custom Go tokenizer:", e);
  }
  try {
    monaco.languages.setMonarchTokensProvider("python", customPythonLanguage);
  } catch (e) {
    console.warn("Failed to register custom Python tokenizer:", e);
  }

  registered = true;
}

export function refreshLanguageTokens(monaco: typeof import("monaco-editor"), language: string) {
  if (language === "go") {
    try {
      monaco.languages.setMonarchTokensProvider("go", customGoLanguage);
    } catch (e) {
      console.warn("Failed to refresh Go tokenizer:", e);
    }
  } else if (language === "python") {
    try {
      monaco.languages.setMonarchTokensProvider("python", customPythonLanguage);
    } catch (e) {
      console.warn("Failed to refresh Python tokenizer:", e);
    }
  }
}

export function isThemeRegistered() {
  return registered;
}
