"use client";

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-red-300 bg-white/90 text-slate-800 shadow-sm transition hover:border-green-400 hover:text-green-700 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100"
      aria-label={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
