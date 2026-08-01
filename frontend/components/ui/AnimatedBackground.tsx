'use client';

import { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';

const ShapeGrid = dynamic(() => import('@/components/ui/ShapeGrid'), { ssr: false });

interface AnimatedBackgroundProps {
  /** How far down the viewport the animation is visible before fully fading (default: '55%') */
  fadeEnd?: string;
  /** Overall opacity of the animation layer (default: 0.45) */
  opacity?: number;
  /** Shape variant (default: 'hexagon') */
  shape?: 'square' | 'hexagon' | 'circle' | 'triangle';
}

// Subscribe to prefers-reduced-motion without triggering setState-in-effect lint.
const motionQuery =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

function subscribeMotion(cb: () => void) {
  motionQuery?.addEventListener('change', cb);
  return () => motionQuery?.removeEventListener('change', cb);
}
function getMotionSnapshot() {
  return motionQuery?.matches ?? false;
}
function getMotionServerSnapshot() {
  return false;
}

export default function AnimatedBackground({
  fadeEnd = '60%',
  opacity = 0.65,
  shape = 'hexagon',
}: AnimatedBackgroundProps) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeMotion,
    getMotionSnapshot,
    getMotionServerSnapshot,
  );

  if (prefersReducedMotion) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
      style={{ opacity }}
    >
      {/* Animated canvas grid — brand gold borders, subtle hover glow */}
      <ShapeGrid
        shape={shape}
        borderColor="rgba(212, 175, 55, 0.22)"
        hoverFillColor="rgba(212, 175, 55, 0.35)"
        speed={0.25}
        direction="diagonal"
        squareSize={44}
        hoverTrailAmount={4}
      />

      {/* Top-to-bottom gradient: visible at top, softly fades toward bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, rgba(20, 20, 20, 0.08) 30%, rgba(20, 20, 20, 0.35) 50%, rgba(20, 20, 20, 0.75) ${fadeEnd})`,
        }}
      />
    </div>
  );
}
