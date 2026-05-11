import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreLabel(score: number): string {
  if (score >= 8.5) return "Spot On";
  if (score >= 7.0) return "Grand";
  if (score >= 4.0) return "Not the Worst";
  return "Keep at It";
}
