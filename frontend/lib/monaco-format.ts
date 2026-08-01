import { formatCode } from "@/lib/api";
import type { editor, languages } from "monaco-editor";

type Monaco = typeof import("monaco-editor");

let formattingRegistered = false;

// Registers a real formatting provider for Go + Python. The backend formats Go
// with gofmt (go/format.Source) and Python with pinned black in the remote
// sandbox, so output matches what the grading pipeline canonicalizes. Monaco's
// built-in editor.action.formatDocument (Shift+Alt+F / Cmd+Shift+F) drives this
// provider; failures degrade silently to the client-side indenter.
export function registerFormattingProvider(monaco: Monaco): void {
  if (formattingRegistered) return;
  formattingRegistered = true;

  for (const language of ["go", "python"] as const) {
    monaco.languages.registerDocumentFormattingEditProvider(language, {
      provideDocumentFormattingEdits: async (
        model: editor.ITextModel,
      ): Promise<languages.TextEdit[]> => {
        const source = model.getValue();
        if (source.trim() === "") return [];

        const res = await formatCode(source, language);
        if (!res.success || !res.data) return [];

        const formatted = res.data.formatted;
        if (formatted === source) return [];

        return [
          {
            range: model.getFullModelRange(),
            text: formatted,
          },
        ];
      },
    });
  }
}
