"use client";

import { useEffect } from "react";
import { eagerLoadPyodide } from "@/lib/pyodide";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    eagerLoadPyodide();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {children}
    </div>
  );
}
