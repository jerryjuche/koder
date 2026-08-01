'use client';

import { useEffect, useState } from 'react';
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

export default function AnimatedBackground({
  fadeEnd = '55%',
  opacity = 0.45,
  shape = 'hexagon',
}: AnimatedBackgroundProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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
        borderColor="rgba(212, 175, 55, 0.045)"
        hoverFillColor="rgba(212, 175, 55, 0.07)"
        speed={0.22}
        direction="diagonal"
        squareSize={44}
        hoverTrailAmount={3}
      />

      {/* Top-to-bottom gradient: visible at top, fades to solid charcoal base at fadeEnd */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, rgba(20, 20, 20, 0.15) 25%, rgba(20, 20, 20, 0.6) 40%, #141414 ${fadeEnd})`,
        }}
      />
    </div>
  );
}
