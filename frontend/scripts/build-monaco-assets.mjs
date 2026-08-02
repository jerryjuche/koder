// Generates committed Monaco assets from vendored upstream sources:
//
//   1. lib/dark-plus-theme.generated.json           — VS Code "Dark+ (default dark)"
//      converted to Monaco IStandaloneThemeData via monaco-vscode-textmate-theme-converter.
//   2. lib/dark-plus-textmate.generated.json        — raw TextMate IRawTheme consumed by
//      vscode-textmate Registry.setTheme (tokenColors + colors + default foreground rule).
//   3. lib/grammars/python.tmLanguage.json          — MagicPython (plist) converted to the
//      JSON grammar format consumed by vscode-textmate.
//   4. lib/grammars/go.tmLanguage.json              — VSCode Go grammar, copied as-is.
//
// All emitted artifacts live under lib/ (tracked in git). The vendored sources under
// scripts/vendor/ are gitignored build inputs.
//
// Vendored upstream sources (all MIT, pinned):
//   - scripts/vendor/dark_vs.json   <- microsoft/vscode @ 1.97.0
//     extensions/theme-defaults/themes/dark_vs.json
//   - scripts/vendor/dark_plus.json <- microsoft/vscode @ 1.97.0
//     extensions/theme-defaults/themes/dark_plus.json
//   - scripts/vendor/grammars/MagicPython.tmLanguage <- MagicStack/MagicPython @ 7d0f2b2
//     grammars/MagicPython.tmLanguage
//   - scripts/vendor/grammars/go.tmLanguage.json    <- microsoft/vscode @ 1.97.0
//     extensions/go/syntaxes/go.tmLanguage.json
//
// Run: node scripts/build-monaco-assets.mjs
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { parseRawGrammar } = require("vscode-textmate");
const { convertTheme } = require("monaco-vscode-textmate-theme-converter");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vendor = resolve(root, "scripts", "vendor");

// VSCode theme files are JSONC (allow // comments and trailing commas). Strip
// both outside of string literals so the strict JSON.parse can read them. The
// comment pass runs first so a trailing comma followed by a comment (e.g.
// `"foo", // note\n ]`) is handled correctly by the comma pass.
function stripJsoncComments(text) {
  let out = "";
  let inString = false;
  let i = 0;
  const n = text.length;
  while (i < n) {
    const ch = text[i];
    if (inString) {
      out += ch;
      if (ch === "\\") {
        out += text[i + 1] ?? "";
        i += 2;
        continue;
      }
      if (ch === '"') inString = false;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      i += 1;
      continue;
    }
    if (ch === "/" && text[i + 1] === "/") {
      while (i < n && text[i] !== "\n") i += 1;
      out += "\n";
      continue;
    }
    if (ch === "/" && text[i + 1] === "*") {
      i += 2;
      while (i < n && !(text[i] === "*" && text[i + 1] === "/")) i += 1;
      i += 2;
      out += " ";
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

function stripTrailingCommas(text) {
  let out = "";
  let inString = false;
  let i = 0;
  const n = text.length;
  while (i < n) {
    const ch = text[i];
    if (inString) {
      out += ch;
      if (ch === "\\") {
        out += text[i + 1] ?? "";
        i += 2;
        continue;
      }
      if (ch === '"') inString = false;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      i += 1;
      continue;
    }
    if (ch === ",") {
      let j = i + 1;
      while (j < n && /\s/.test(text[j])) j += 1;
      if (j < n && (text[j] === "}" || text[j] === "]")) {
        i += 1;
        continue;
      }
    }
    out += ch;
    i += 1;
  }
  return out;
}

function parseJsonc(text) {
  return JSON.parse(stripTrailingCommas(stripJsoncComments(text)));
}

// --- 1. Dark+ theme ----------------------------------------------------------
// dark_plus.json inherits from dark_vs.json via "include". Merge the inherited
// tokenColors + colors first, then convert the combined theme.
const darkVs = parseJsonc(readFileSync(resolve(vendor, "dark_vs.json"), "utf8"));
const darkPlus = parseJsonc(readFileSync(resolve(vendor, "dark_plus.json"), "utf8"));
const merged = {
  ...darkPlus,
  tokenColors: [...(darkVs.tokenColors ?? []), ...(darkPlus.tokenColors ?? [])],
  colors: { ...(darkVs.colors ?? {}), ...(darkPlus.colors ?? {}) },
};

const converted = convertTheme(merged);
const theme = {
  base: "vs-dark",
  inherit: true,
  rules: converted.rules,
  colors: converted.colors,
};

const themeOut = resolve(root, "lib", "dark-plus-theme.generated.json");
writeFileSync(themeOut, JSON.stringify(theme, null, 2) + "\n");
console.log(`[build-monaco] wrote ${themeOut} (${(theme.rules || []).length} rules, ${Object.keys(theme.colors || {}).length} colors)`);

// --- 2. Raw TextMate theme for vscode-textmate Registry -----------------------
// Monaco's converted theme cannot feed Registry.setTheme (it needs an IRawTheme:
// name + settings(tokenColors) + colors). Also prepend a scope-less default rule
// so uncolored tokens inherit Dark+'s editor.foreground (#D4D4D4) instead of
// vscode-textmate's #000000 fallback — matching real VS Code exactly.
const textmateTheme = {
  name: merged.name ?? "dark-plus",
  settings: [
    { settings: { foreground: "#D4D4D4", background: "#1E1E1E" } },
    ...(merged.tokenColors ?? []),
  ],
  colors: merged.colors ?? {},
};
const textmateOut = resolve(root, "lib", "dark-plus-textmate.generated.json");
writeFileSync(textmateOut, JSON.stringify(textmateTheme, null, 2) + "\n");
console.log(`[build-monaco] wrote ${textmateOut} (${(textmateTheme.settings || []).length} settings entries)`);

// --- 3. Grammars -> tracked lib/grammars/ -------------------------------------
const grammarDir = resolve(root, "lib", "grammars");
mkdirSync(grammarDir, { recursive: true });

const plist = readFileSync(resolve(vendor, "grammars", "MagicPython.tmLanguage"), "utf8");
const rawPythonGrammar = parseRawGrammar(plist, "MagicPython.tmLanguage");
const pythonOut = resolve(grammarDir, "python.tmLanguage.json");
writeFileSync(pythonOut, JSON.stringify(rawPythonGrammar, null, 2) + "\n");
console.log(`[build-monaco] wrote ${pythonOut} (scope ${rawPythonGrammar.scopeName}, ${Buffer.byteLength(JSON.stringify(rawPythonGrammar))} bytes)`);

const goGrammar = parseJsonc(readFileSync(resolve(vendor, "grammars", "go.tmLanguage.json"), "utf8"));
const goOut = resolve(grammarDir, "go.tmLanguage.json");
writeFileSync(goOut, JSON.stringify(goGrammar, null, 2) + "\n");
console.log(`[build-monaco] wrote ${goOut} (scope ${goGrammar.scopeName}, ${Buffer.byteLength(JSON.stringify(goGrammar))} bytes)`);
