import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const bgClasses: Record<string, string> = {
  white: '',
  light: 'bg-muted',
  dark: 'bg-foreground text-background',
  primary: 'bg-primary text-primary-foreground',
  hatched: 'bg-hatched text-background',
  'hatched-light': 'bg-hatched-light text-foreground',
};

