import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserColor(index: number): string {
  const colors = [
    'bg-[#D4AF37]', // Muted Gold
    'bg-[#E07A5F]', // Terracotta 
    'bg-[#8E9AAF]', // Cool silver
    'bg-[#52B788]', // Success Green
    'bg-[#A4A4A4]', // Grey
    'bg-[#AE8E44]', // Bronze Variant
  ];
  return colors[(index || 0) % colors.length];
}

export function getDifficultyColor(difficulty: string | number): string {
  const diff = typeof difficulty === 'number' 
    ? difficulty 
    : parseInt(difficulty as string, 10);

  switch (diff) {
    case 1: return 'text-[#52B788]'; // Beginner / Easy green
    case 2: return 'text-[#8DB4B9]'; // Easy
    case 3: return 'text-[#D4AF37]'; // Medium / Gold
    case 4: return 'text-[#FF8C42]'; // Hard / Orange
    case 5: return 'text-[#FF4D4D]'; // Expert / Red
    default: return 'text-gray-400';
  }
}

export function getDifficultyLabel(difficulty: number): string {
  const labels = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
  return labels[difficulty - 1] || 'Unknown';
}
