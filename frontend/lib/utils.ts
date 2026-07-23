import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserColor(index: number): string {
  const colors = [
    "bg-[#D4AF37]", // Gold
    "bg-[#E07A5F]", // Terracotta
    "bg-[#8E9AAF]", // Silver
    "bg-[#A4A4A4]", // Grey
    "bg-[#7B8EA0]", // Steel
    "bg-[#AE8E44]", // Bronze
  ];

  const safeIndex = Math.max(0, Math.min(index, colors.length - 1));
  return colors[safeIndex];
}

export function getDifficultyColor(difficulty: string | number): string {
  const diff =
    typeof difficulty === "number"
      ? difficulty
      : parseInt(difficulty as string, 10);

  switch (diff) {
    case 1:
      return "text-amber-400"; // Beginner / Easy
    case 2:
      return "text-[#8DB4B9]"; // Easy
    case 3:
      return "text-[#D4AF37]"; // Medium / Gold
    case 4:
      return "text-[#FF8C42]"; // Hard / Orange
    case 5:
      return "text-[#FF4D4D]"; // Expert / Red
    default:
      return "text-gray-400";
  }
}

export function getDifficultyLabel(difficulty: number): string {
  const labels = ["Beginner", "Easy", "Medium", "Hard", "Expert"];
  return labels[difficulty - 1] || "Unknown";
}

// Mulberry32 seeded PRNG — deterministic, fast, 32-bit
export function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle with seeded PRNG — deterministic per seed
export function shuffleArray<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  const rng = seededRandom(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
