"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Trash2, FileCode, Star,
} from "lucide-react";

interface MultiFileConfigPanelProps {
  metadata: Record<string, unknown> | undefined;
  onChange: (meta: Record<string, unknown>) => void;
}

interface FileEntry {
  path: string;
  content: string;
}

interface MultiFileSpec {
  files: FileEntry[];
  entryPoint: string;
}

const DEFAULT_SPEC: MultiFileSpec = {
  files: [
    { path: "main.py", content: "# Write your code here\n\ndef solution():\n    pass\n" },
  ],
  entryPoint: "main.py",
};

function getExt(path: string): string {
  return path.includes(".") ? path.split(".").pop()!.toLowerCase() : "";
}

function iconColor(ext: string): string {
  if (ext === "py") return "text-[#FFD43B]";
  if (ext === "go") return "text-[#00ADD8]";
  if (ext === "js") return "text-[#F7DF1E]";
  if (ext === "html") return "text-[#E34F26]";
  if (ext === "css") return "text-[#1572B6]";
  if (ext === "json") return "text-[#292929] dark:text-[#CCC]";
  return "text-muted-foreground";
}

export default function MultiFileConfigPanel({ metadata, onChange }: MultiFileConfigPanelProps) {
  const spec = (metadata?.multiFile as MultiFileSpec | undefined) ?? DEFAULT_SPEC;
  const [files, setFiles] = useState<FileEntry[]>(spec.files);
  const [entryPoint, setEntryPoint] = useState(spec.entryPoint);
  const [activeIndex, setActiveIndex] = useState(0);
  const [draftContent, setDraftContent] = useState<string | null>(null);
  const initialized = useRef(false);

  const syncParent = useCallback((f: FileEntry[], ep: string) => {
    const meta = metadata || {};
    onChange({
      ...meta,
      multiFile: { files: f, entryPoint: ep },
    });
  }, [metadata, onChange]);

  // Sync spec changes into local state when parent metadata changes (legitimate external system sync)
  const specKey = JSON.stringify(spec);
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setFiles(spec.files);
    setEntryPoint(spec.entryPoint);
    setDraftContent(null);
    if (spec.files.length > 0 && activeIndex >= spec.files.length) {
      setActiveIndex(0);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  // eslint-disable-next-line react-hooks/exhaustive-deps -- spec.files/entryPoint tracked via specKey; activeIndex intentionally excluded
  }, [specKey]);

  // Initialize parent on first mount (intentionally runs only once)
  useEffect(() => {
    if (!initialized.current && !metadata?.multiFile) {
      initialized.current = true;
      syncParent(DEFAULT_SPEC.files, DEFAULT_SPEC.entryPoint);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional one-time mount init
  }, []);

  const activeFile = files[activeIndex] || files[0];
  const displayContent = draftContent !== null ? draftContent : (activeFile?.content ?? "");

  const commitContent = useCallback(() => {
    if (draftContent === null || !activeFile) return;
    const updated = files.map((f, i) =>
      i === activeIndex ? { ...f, content: draftContent } : f,
    );
    setFiles(updated);
    setDraftContent(null);
    syncParent(updated, entryPoint);
  }, [draftContent, activeFile, files, activeIndex, entryPoint, syncParent]);

  const updateActivePath = (newPath: string) => {
    const updated = files.map((f, i) =>
      i === activeIndex ? { ...f, path: newPath } : f,
    );
    const newEntry = entryPoint === files[activeIndex]?.path ? newPath : entryPoint;
    setFiles(updated);
    setEntryPoint(newEntry);
    syncParent(updated, newEntry);
  };

  const handleAddFile = () => {
    const baseName = "file";
    let idx = 1;
    while (files.some((f) => f.path === `${baseName}${idx}.py`)) idx++;
    const newPath = `${baseName}${idx}.py`;
    const updated = [...files, { path: newPath, content: "" }];
    setFiles(updated);
    setActiveIndex(updated.length - 1);
    setDraftContent(null);
    syncParent(updated, entryPoint);
  };

  const handleRemoveActive = () => {
    if (files.length <= 1) return;
    const updated = files.filter((_, i) => i !== activeIndex);
    const wasEntry = files[activeIndex]?.path === entryPoint;
    const newEntry = wasEntry ? (updated[0]?.path || "") : entryPoint;
    setFiles(updated);
    setEntryPoint(newEntry);
    setDraftContent(null);
    setActiveIndex((prev) => Math.min(prev, updated.length - 1));
    syncParent(updated, newEntry);
  };

  const handleSetEntry = () => {
    const targetPath = files[activeIndex]?.path;
    if (targetPath && targetPath !== entryPoint) {
      setEntryPoint(targetPath);
      syncParent(files, targetPath);
    }
  };

  const handleSwitchTab = (i: number) => {
    if (i === activeIndex) return;
    commitContent();
    setActiveIndex(i);
  };

  if (!activeFile) {
    return (
      <div className="border rounded-lg p-6 text-center">
        <p className="text-xs text-muted-foreground">No files configured.</p>
        <Button size="sm" variant="outline" className="mt-2" onClick={handleAddFile}>
          <Plus className="h-3 w-3 mr-1" /> Add File
        </Button>
      </div>
    );
  }

  const ext = getExt(activeFile.path);

  return (
    <div className="border rounded-lg overflow-hidden bg-muted/10">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b">
        <div className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs font-semibold">Multi-File Configuration</span>
        </div>
        <span className="text-[10px] text-muted-foreground/60">
          {files.length} {files.length === 1 ? "file" : "files"}
        </span>
      </div>

      {/* File tabs */}
      <div className="flex items-stretch border-b overflow-x-auto bg-muted/20">
        {files.map((f, i) => {
          const isActive = i === activeIndex;
          const isEntry = f.path === entryPoint;
          const fext = getExt(f.path);
          return (
            <button
              key={`${f.path}-${i}`}
              onClick={() => handleSwitchTab(i)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-r whitespace-nowrap transition-colors",
                isActive
                  ? "bg-background text-foreground border-b-2 border-b-primary shadow-sm"
                  : "bg-transparent text-muted-foreground/70 hover:text-foreground hover:bg-muted/30",
              )}
            >
              <FileCode className={cn("h-3.5 w-3.5 shrink-0", iconColor(fext))} />
              <span className="truncate max-w-[100px]">{f.path.split("/").pop() || f.path}</span>
              {isEntry && (
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-500/15 text-amber-500 leading-none">
                  main
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={handleAddFile}
          className="flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 transition-colors shrink-0"
          title="Add file"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* File editor */}
      <div className="p-3 space-y-3">
        {/* Path + entry point row */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-[11px] text-muted-foreground mb-1 block font-medium">
              File path
            </label>
            <div className="flex items-center gap-1.5">
              <FileCode className={cn("h-4 w-4 shrink-0", iconColor(ext))} />
              <Input
                value={activeFile.path}
                onChange={(e) => updateActivePath(e.target.value)}
                className="h-8 text-xs font-mono"
                placeholder="e.g. utils.py"
              />
            </div>
          </div>
          <div className="shrink-0">
            {activeFile.path === entryPoint ? (
              <span className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md bg-amber-500/10 text-amber-500 text-[11px] font-medium whitespace-nowrap">
                <Star className="h-3 w-3" /> Entry Point
              </span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSetEntry}
                className="h-8 text-[11px] px-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
              >
                <Star className="h-3 w-3 mr-1" /> Set as Main
              </Button>
            )}
          </div>
        </div>

        {/* Content editor */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] text-muted-foreground font-medium">Content</label>
            <span className="text-[10px] text-muted-foreground/50">
              {displayContent.length} chars
              {draftContent !== null && (
                <span className="ml-2 text-amber-500/70">unsaved</span>
              )}
            </span>
          </div>
          <Textarea
            value={displayContent}
            onChange={(e) => setDraftContent(e.target.value)}
            onBlur={commitContent}
            className="min-h-[180px] font-mono text-xs leading-relaxed"
            placeholder="Write your code here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-t">
        <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
          Students see a tabbed editor with all files. The entry point runs on{" "}
          <strong className="text-foreground/70">Run All</strong>.
        </p>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemoveActive}
            disabled={files.length <= 1}
            className="h-7 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="h-3 w-3 mr-1" /> Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
