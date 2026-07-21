"use client";

import { useEffect } from "react";
import { eagerLoadPyodide } from "@/lib/pyodide";

export default function PyodidePreloader() {
  useEffect(() => {
    eagerLoadPyodide();
  }, []);
  return null;
}
