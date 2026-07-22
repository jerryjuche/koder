import { CodeSnippet } from ".";

export function DefaultSnippet() {
  return (
    <CodeSnippet
      files={[{ language: "go", filename: "solution.go", code: `package koder\n\nfunc Add(a, b int) int {\n\treturn a + b\n}` }]}
    />
  );
}

export function CollapsedSnippet() {
  return (
    <CodeSnippet
      files={[{ language: "python", filename: "solution.py", code: `def add(a, b):\n    return a + b\n\ndef subtract(a, b):\n    return a - b\n\ndef multiply(a, b):\n    return a * b` }]}
      collapsed
      maxHeight={100}
    />
  );
}

export function MultiFileSnippet() {
  return (
    <CodeSnippet
      files={[
        { language: "go", filename: "handler.go", code: `package koder\n\nfunc Handler(w http.ResponseWriter, r *http.Request) {\n\tw.Write([]byte("ok"))\n}` },
        { language: "go", filename: "main.go", code: `package main\n\nfunc main() {\n\thttp.HandleFunc("/", Handler)\n\thttp.ListenAndServe(":8080", nil)\n}` },
      ]}
    />
  );
}
