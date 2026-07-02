"use client";

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('anta-theme') as 'light' | 'dark' | null;
    const initialTheme = storedTheme ?? 'light';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    window.localStorage.setItem('anta-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="rounded-full border border-red-300 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-green-400 hover:text-green-700 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100"
      aria-label="Basculer le thème"
    >
      {theme === 'light' ? '🌙 Mode sombre' : '☀️ Mode clair'}
    </button>
  );
}
