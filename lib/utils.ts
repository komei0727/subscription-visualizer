import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  const classString = clsx(inputs)
  // Remove duplicate classes by splitting, creating a Set, and rejoining
  const uniqueClasses = [...new Set(classString.split(' ').filter(Boolean))].join(' ')
  return twMerge(uniqueClasses)
}
