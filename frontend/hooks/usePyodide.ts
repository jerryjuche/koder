"use client";

import { useState, useCallback, useRef } from "react";
import {
  executePython,
  isPyodideReady,
  getPyodideInstance,
  loadPyodidePackages,
  type ExecutionResult,
} from "@/lib/pyodide";

export type ConsoleLine = {
  id: number;
  type: "output" | "error" | "info" | "input" | "system";
  text: string;
  timestamp: number;
};

const MAX_CONSOLE_LINES = 500;

let nextId = 1;

export function usePyodide() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>(() => [
    {
      id: nextId++,
      type: "system",
      text: '>>> Python playground ready. Press Ctrl+Enter or click "Run in Browser" to execute code.',
      timestamp: Date.now(),
    },
  ]);

  const loadingStarted = useRef(false);

  const addLine = useCallback(
    (type: ConsoleLine["type"], text: string) => {
      setConsoleLines((prev) => {
        const updated = [
          ...prev,
          { id: nextId++, type, text, timestamp: Date.now() },
        ];
        if (updated.length > MAX_CONSOLE_LINES) {
          return updated.slice(updated.length - MAX_CONSOLE_LINES);
        }
        return updated;
      });
    },
    [],
  );

  const ensureLoaded = useCallback(async (): Promise<boolean> => {
    if (ready) return true;
    if (loadingStarted.current) {
      try {
        await getPyodideInstance();
        return true;
      } catch {
        return false;
      }
    }
    loadingStarted.current = true;
    setLoading(true);
    try {
      await getPyodideInstance();
      setReady(true);
      setLoading(false);
      addLine("system", ">>> Pyodide initialized with numpy, matplotlib.");
      return true;
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      addLine("error", `Failed to initialize Python: ${msg}`);
      return false;
    }
  }, [ready, addLine]);

  const startLoading = useCallback(async () => {
    await ensureLoaded();
  }, [ensureLoaded]);

  const execute = useCallback(
    async (code: string): Promise<ExecutionResult | null> => {
      if (!code.trim()) {
        addLine("error", "Cannot execute empty code.");
        return null;
      }

      const loaded = await ensureLoaded();
      if (!loaded) {
        addLine("error", "Pyodide is not available. Please try again later.");
        return null;
      }

      addLine("input", `>>> ${code.trim().split("\n")[0]}${code.trim().split("\n").length > 1 ? " ..." : ""}`);

      let result: ExecutionResult;
      try {
        result = await executePython(code);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        addLine("error", msg);
        return null;
      }

      if (result.error) {
        addLine("error", result.error);
      }

      if (result.stderr) {
        const lines = result.stderr.split("\n").filter(Boolean);
        for (const line of lines) {
          addLine("error", line);
        }
      }

      if (result.stdout) {
        const lines = result.stdout.split("\n");
        for (const line of lines) {
          addLine("output", line);
        }
      }

      if (!result.error && !result.stderr && !result.stdout) {
        addLine("output", "(no output)");
      }

      return result;
    },
    [addLine, ensureLoaded],
  );

  const clearConsole = useCallback(() => {
    setConsoleLines([
      {
        id: nextId++,
        type: "system",
        text: ">>> Console cleared.",
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const loadPackages = useCallback(async (packages: string[]) => {
    addLine("system", `Loading packages: ${packages.join(", ")}...`);
    try {
      await loadPyodidePackages(packages);
      addLine("system", `Packages loaded: ${packages.join(", ")}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLine("error", `Failed to load packages: ${msg}`);
    }
  }, [addLine]);

  return {
    ready,
    loading,
    error,
    consoleLines,
    execute,
    startLoading,
    clearConsole,
    loadPackages,
  } as const;
}
