type PyodideFS = {
  writeFile(path: string, content: string | Uint8Array): void;
  readFile(path: string, opts?: { encoding?: string }): string | Uint8Array;
  mkdir(path: string): void;
};

type PyodideInterface = {
  runPythonAsync(code: string): Promise<unknown>;
  runPython(code: string): unknown;
  loadPackage(packages: string[]): Promise<void>;
  setStdout(opts: { batched: (msg: string) => void }): void;
  setStderr(opts: { batched: (msg: string) => void }): void;
  FS: PyodideFS;
};

export interface MultiFileSpec {
  files: { path: string; content: string }[];
  entryPoint: string;
}

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.27.4/full/";
const PACKAGE_URL = `${PYODIDE_CDN}pyodide.mjs`;
const DEFAULT_PACKAGES = ["numpy", "matplotlib"];
const EXEC_TIMEOUT_MS = 10000;
const MAX_OUTPUT_LENGTH = 50000;

let instance: PyodideInterface | null = null;
let loadPromise: Promise<PyodideInterface> | null = null;
let loadError: string | null = null;

export function eagerLoadPyodide(): void {
  if (instance || loadPromise) return;
  loadPromise = (async () => {
    const pkg = await new Function("url", "return import(url)")(PACKAGE_URL);
    const load = pkg.loadPyodide;
    const pyodide = await load({ indexURL: PYODIDE_CDN });
    await pyodide.loadPackage(DEFAULT_PACKAGES);
    try {
      await pyodide.runPythonAsync(INPUT_SHIM_CODE);
    } catch {}
    instance = pyodide;
    return pyodide;
  })();
  loadPromise.catch((err) => {
    loadError = err instanceof Error ? err.message : String(err);
  });
}

const INPUT_SHIM_CODE = `
import js
import builtins

def _koder_input(prompt=""):
    result = js.window.prompt(str(prompt) if prompt else "")
    if result is None:
        raise EOFError("Input cancelled by user")
    return result

builtins.input = _koder_input
`;

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
  eagerLoadPyodide();
  if (loadError) throw new Error(loadError);
  return loadPromise!;
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

async function ensureDir(pyodide: PyodideInterface, path: string): Promise<void> {
  const parts = path.split("/");
  const seen = new Set<string>();
  for (let i = 0; i < parts.length - 1; i++) {
    const dir = parts.slice(0, i + 1).join("/");
    if (dir && !seen.has(dir)) {
      seen.add(dir);
      try { pyodide.FS.mkdir(dir); } catch { /* already exists */ }
    }
  }
}

export async function writeFile(path: string, content: string): Promise<void> {
  const pyodide = await getPyodideInstance();
  await ensureDir(pyodide, path);
  pyodide.FS.writeFile(path, content);
}

const WORK_DIR = "/home/pyodide/koder";

export async function executeMultiFile(
  spec: MultiFileSpec,
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

  // Create working directory and write all files via writeFile
  try { pyodide.FS.mkdir(WORK_DIR); } catch { /* exists */ }
  for (const file of spec.files) {
    const path = file.path.startsWith("/") ? file.path : `${WORK_DIR}/${file.path}`;
    await writeFile(path, file.content);
  }

  // Bootstrap: add work dir to sys.path, change to it, run entry point
  const entryPath = spec.entryPoint.startsWith("/") ? spec.entryPoint : `${WORK_DIR}/${spec.entryPoint}`;
  const safeQuote = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const bootstrapCode = `
import sys, os
os.chdir("${safeQuote(WORK_DIR)}")
if "${safeQuote(WORK_DIR)}" not in sys.path:
    sys.path.insert(0, "${safeQuote(WORK_DIR)}")
with open("${safeQuote(entryPath)}") as _f:
    _code = _f.read()
exec(compile(_code, "${safeQuote(spec.entryPoint)}", "exec"))
`;

  let error: string | null = null;

  try {
    const result = await Promise.race([
      pyodide.runPythonAsync(bootstrapCode),
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
