"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MOBILE_WORKSPACE_BREAKPOINT } from "@/lib/mobile-workspace";

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

/**
 * Two-pane resizable split.
 *
 * Orientation follows the CSS `nav:` variant (>= MOBILE_WORKSPACE_BREAKPOINT):
 * side-by-side on desktop, stacked top/bottom on phones so neither pane is
 * squeezed into an unusable sliver. Sizing uses `flex-basis`, which maps onto
 * the main axis in both orientations, and the handle thickness lives in the
 * `--split-handle` variable (see `app/globals.css`) so the panes can subtract
 * exactly half of it and still sum to 100%.
 *
 * Dragging uses Pointer Events, so mouse, touch and pen all work. `touch-none`
 * on the handle stops the page from scrolling mid-drag.
 */
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
  // Starts true so the server and the first client render agree, then syncs to
  // the real media query in an effect (avoids a hydration mismatch).
  const [sideBySide, setSideBySide] = useState(true);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const clamp = useCallback(
    (pct: number) =>
      Math.max(minLeftPercent, Math.min(100 - minRightPercent, pct)),
    [minLeftPercent, minRightPercent],
  );

  /** Orientation follows the same `nav:` breakpoint the CSS layout uses. */
  useEffect(() => {
    const mql = window.matchMedia(
      `(min-width: ${MOBILE_WORKSPACE_BREAKPOINT}px)`,
    );
    const onChange = () => setSideBySide(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Never leave the page with text selection disabled if we unmount mid-drag.
  useEffect(() => {
    return () => {
      document.body.style.userSelect = "";
    };
  }, []);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const position = sideBySide ? clientX - rect.left : clientY - rect.top;
      const extent = sideBySide ? rect.width : rect.height;
      if (extent <= 0) return;
      setLeftPercent(clamp((position / extent) * 100));
    },
    [clamp, sideBySide],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragging.current = true;
      document.body.style.userSelect = "none";
      // Capture so the drag keeps tracking outside the handle bounds —
      // required for touch, where the finger leaves the 6px bar immediately.
      handleRef.current?.setPointerCapture?.(e.pointerId);
      // preventDefault() above suppresses implicit focus-on-click, so focus
      // explicitly — otherwise pointer users can't reach the keyboard control.
      handleRef.current?.focus?.();
      updateFromPointer(e.clientX, e.clientY);
    },
    [updateFromPointer],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      e.preventDefault();
      updateFromPointer(e.clientX, e.clientY);
    },
    [updateFromPointer],
  );

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.userSelect = "";
    try {
      handleRef.current?.releasePointerCapture?.(e.pointerId);
    } catch {
      // Pointer was already released (e.g. pointercancel) — nothing to do.
    }
  }, []);

  const nudge = useCallback(
    (delta: number) => setLeftPercent((prev) => clamp(prev + delta)),
    [clamp],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const back = sideBySide ? "ArrowLeft" : "ArrowUp";
      const forward = sideBySide ? "ArrowRight" : "ArrowDown";
      if (e.key === back) {
        e.preventDefault();
        nudge(-2);
      } else if (e.key === forward) {
        e.preventDefault();
        nudge(2);
      }
    },
    [sideBySide, nudge],
  );

  const panelStyle = (percent: number) => ({
    flexBasis: `calc(${percent}% - var(--split-handle, 6px) / 2)`,
    flexGrow: 0,
    flexShrink: 0,
  });

  return (
    <div
      ref={containerRef}
      className={cn("split-pane flex flex-col nav:flex-row overflow-hidden", className)}
    >
      {/* Left / top panel */}
      <div
        className={cn("overflow-hidden min-w-0 min-h-0", leftClassName)}
        style={panelStyle(leftPercent)}
      >
        {left}
      </div>

      {/* Drag handle */}
      <div
        ref={handleRef}
        role="separator"
        aria-label="Resize panes"
        aria-orientation={sideBySide ? "vertical" : "horizontal"}
        aria-valuenow={Math.round(leftPercent)}
        aria-valuemin={minLeftPercent}
        aria-valuemax={100 - minRightPercent}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative flex items-center justify-center shrink-0 select-none touch-none",
          "h-[var(--split-handle)] w-full nav:h-auto nav:w-[var(--split-handle)]",
          "cursor-row-resize nav:cursor-col-resize",
          "bg-brand-charcoal-border hover:bg-brand-muted-gold/40 active:bg-brand-muted-gold/60",
          "focus-visible:outline-none focus-visible:bg-brand-muted-gold/50",
          "transition-colors duration-150 group",
        )}
      >
        {/* Grip dots — visible on touch (no hover), revealed on hover otherwise */}
        <div className="flex flex-row nav:flex-col items-center gap-[3px] can-hover:opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none">
          <div className="w-[2px] h-[2px] rounded-full bg-brand-charcoal-base" />
          <div className="w-[2px] h-[2px] rounded-full bg-brand-charcoal-base" />
          <div className="w-[2px] h-[2px] rounded-full bg-brand-charcoal-base" />
          <div className="w-[2px] h-[2px] rounded-full bg-brand-charcoal-base" />
        </div>
      </div>

      {/* Right / bottom panel */}
      <div
        className={cn("overflow-hidden min-w-0 min-h-0", rightClassName)}
        style={panelStyle(100 - leftPercent)}
      >
        {right}
      </div>
    </div>
  );
}
