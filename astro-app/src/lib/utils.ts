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

const spacingClasses: Record<string, string> = {
  none: 'py-0',
  small: 'py-6 md:py-8',
  default: '',
  large: 'py-20 md:py-24',
};

const maxWidthClasses: Record<string, string> = {
  narrow: 'max-w-4xl mx-auto',
  default: '',
  full: 'max-w-none',
};

export function blockBaseClasses(bg?: string, spacing?: string, maxWidth?: string): string {
  return cn(
    bgClasses[bg ?? 'white'],
    spacingClasses[spacing ?? 'default'],
    maxWidthClasses[maxWidth ?? 'default'],
  );
}
