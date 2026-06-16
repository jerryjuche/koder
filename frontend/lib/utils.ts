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

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'beginner': return 'text-[#52B788]'; 
    case 'easy': return 'text-[#8DB4B9]'; 
    case 'medium': return 'text-[#D4AF37]'; 
    case 'hard': return 'text-[#E07A5F]'; 
    case 'expert': return 'text-[#C96464]';
    default: return 'text-[var(--color-brand-offwhite-muted)]';
  }
}
