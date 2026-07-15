"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ResizableSplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftPercent?: number;
  minLeftPercent?: number;
  minRightPercent?: number;
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
}

export default function ResizableSplitPane({
  left,
  right,
  defaultLeftPercent = 60,
  minLeftPercent = 30,
  minRightPercent = 20,
  className,
  leftClassName,
  rightClassName,
}: ResizableSplitPaneProps) {
  const [leftPercent, setLeftPercent] = useState(defaultLeftPercent);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(
      minLeftPercent,
      Math.min(100 - minRightPercent, newPercent),
    );
    setLeftPercent(clamped);
  }, [minLeftPercent, minRightPercent]);

  const handleMouseUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={cn("flex overflow-hidden", className)}
      style={{ flexDirection: "row" }}
    >
      {/* Left panel */}
      <div
        className={cn("overflow-hidden", leftClassName)}
        style={{ width: `${leftPercent}%`, minWidth: 0 }}
      >
        {left}
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "relative flex items-center justify-center",
          "w-[6px] shrink-0 cursor-col-resize",
          "bg-brand-charcoal-border hover:bg-brand-muted-gold/40 active:bg-brand-muted-gold/60",
          "transition-colors duration-150 group",
        )}
      >
        {/* Grip dots */}
        <div className="flex flex-col items-center gap-[3px] opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
          <div className="w-[2px] h-[2px] rounded-full bg-brand-charcoal-base" />
          <div className="w-[2px] h-[2px] rounded-full bg-brand-charcoal-base" />
          <div className="w-[2px] h-[2px] rounded-full bg-brand-charcoal-base" />
          <div className="w-[2px] h-[2px] rounded-full bg-brand-charcoal-base" />
        </div>
      </div>

      {/* Right panel */}
      <div
        className={cn("overflow-hidden", rightClassName)}
        style={{ width: `${100 - leftPercent}%`, minWidth: 0 }}
      >
        {right}
      </div>
    </div>
  );
}
