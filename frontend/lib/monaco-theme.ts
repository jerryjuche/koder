export function registerVSCodeDarkPlusTheme(monaco: any) {
  monaco.editor.defineTheme("vs-dark-plus", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "C586C0" },
      { token: "keyword.control", foreground: "C586C0" },
      { token: "keyword.function", foreground: "C586C0" },
      { token: "function", foreground: "DCDCAA" },
      { token: "type", foreground: "4EC9B0" },
      { token: "class", foreground: "4EC9B0" },
      { token: "variable", foreground: "9CDCFE" },
      { token: "variable.parameter", foreground: "9CDCFE" },
      { token: "string", foreground: "CE9178" },
      { token: "number", foreground: "B5CEA8" },
      { token: "comment", foreground: "6A9955" },
      { token: "operator", foreground: "D4D4D4" },
      { token: "delimiter", foreground: "D4D4D4" },
      { token: "identifier", foreground: "9CDCFE" },
    ],
    colors: {
      "editor.background": "#1E1E1E",
      "editor.foreground": "#D4D4D4",
      "editorLineNumber.foreground": "#858585",
      "editor.selectionBackground": "#264F78",
    },
  });

  monaco.editor.setTheme("vs-dark-plus");
}
