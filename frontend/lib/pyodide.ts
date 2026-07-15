import { loadPyodide, PyodideInterface } from "pyodide";

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.27.4/full/";
const DEFAULT_PACKAGES = ["numpy", "matplotlib"];
const EXEC_TIMEOUT_MS = 10000;
const MAX_OUTPUT_LENGTH = 50000;

let instance: PyodideInterface | null = null;
let loadPromise: Promise<PyodideInterface> | null = null;

export type ExecutionResult = {
  stdout: string;
  stderr: string;
  error: string | null;
};

export function isPyodideReady(): boolean {
  return instance !== null;
}

export async function getPyodideInstance(): Promise<PyodideInterface> {
  if (instance) return instance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const pyodide = await loadPyodide({
      indexURL: PYODIDE_CDN,
    });
    await pyodide.loadPackage(DEFAULT_PACKAGES);
    instance = pyodide;
    return pyodide;
  })();

  return loadPromise;
}

export async function executePython(
  code: string,
  timeoutMs: number = EXEC_TIMEOUT_MS,
): Promise<ExecutionResult> {
  const pyodide = await getPyodideInstance();

  const stdoutBuf: string[] = [];
  const stderrBuf: string[] = [];

  pyodide.setStdout({
    batched: (msg: string) => {
      if (stdoutBuf.join("\n").length < MAX_OUTPUT_LENGTH) {
        stdoutBuf.push(msg);
      }
    },
  });

  pyodide.setStderr({
    batched: (msg: string) => {
      if (stderrBuf.join("\n").length < MAX_OUTPUT_LENGTH) {
        stderrBuf.push(msg);
      }
    },
  });

  let error: string | null = null;

  try {
    const result = await Promise.race([
      pyodide.runPythonAsync(code),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("Execution timed out")), timeoutMs),
      ),
    ]);

    if (result != null && result !== undefined) {
      stdoutBuf.push(String(result));
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      error = err.message;
    } else {
      error = String(err);
    }
  }

  return {
    stdout: stdoutBuf.join("\n"),
    stderr: stderrBuf.join("\n"),
    error,
  };
}

export async function loadPyodidePackages(packages: string[]): Promise<void> {
  const pyodide = await getPyodideInstance();
  await pyodide.loadPackage(packages);
}

export function resetPyodideInstance(): void {
  instance = null;
  loadPromise = null;
}
