import type confetti from "canvas-confetti";

let confettiModule: Promise<typeof confetti> | null = null;

function loadConfetti(): Promise<typeof confetti> {
  confettiModule ??= import("canvas-confetti").then((namespace) => {
    const mod = namespace as unknown as { default?: typeof confetti };
    return mod.default ?? (namespace as unknown as typeof confetti);
  });
  return confettiModule;
}

export const CONFETTI_COLORS = ["#D4AF37", "#22C55E", "#FFFFFF"];

export interface ConfettiBurstOptions {
  particleCount?: number;
  angle?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  startVelocity?: number;
  ticks?: number;
}

const BURST_BASE = {
  zIndex: 100,
  ticks: 120,
  disableForReducedMotion: true,
};

/** Single, lightweight confetti burst. Fires as soon as the library loads. */
export async function fireConfetti(options: ConfettiBurstOptions = {}): Promise<void> {
  const create = await loadConfetti();
  create({
    ...BURST_BASE,
    spread: 55,
    startVelocity: 45,
    particleCount: 50,
    ...options,
  });
}

export interface ConfettiRainOptions {
  /** Cannon sides to fire from. */
  side?: "left" | "right" | "both";
  /** Total number of bursts, including the first. */
  bursts?: number;
  /** Milliseconds between bursts. */
  intervalMs?: number;
  /** Particles per cannon per burst. */
  particleCount?: number;
}

/**
 * Bounded double-cannon celebration. Uses a deliberate burst count instead of
 * a runaway interval so the number of concurrently-animating particles stays
 * low enough for the main-thread canvas rasterizer to keep up on weak devices.
 */
export async function fireConfettiRain(options: ConfettiRainOptions = {}): Promise<void> {
  const { side = "both", bursts = 6, intervalMs = 450, particleCount = 40 } = options;
  const create = await loadConfetti();

  const cannons: ConfettiBurstOptions[] = [];
  if (side === "left" || side === "both") {
    cannons.push({ angle: 60, origin: { x: 0, y: 0.6 }, particleCount });
  }
  if (side === "right" || side === "both") {
    cannons.push({ angle: 120, origin: { x: 1, y: 0.6 }, particleCount });
  }

  const fire = () => {
    for (const cannon of cannons) {
      create({
        ...BURST_BASE,
        spread: 90,
        startVelocity: 45,
        colors: CONFETTI_COLORS,
        ...cannon,
      });
    }
  };

  fire();
  for (let i = 1; i < bursts; i += 1) {
    setTimeout(fire, i * intervalMs);
  }
}