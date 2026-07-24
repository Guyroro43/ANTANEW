'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-red-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-11 w-14 flex-shrink-0 overflow-hidden rounded-lg shadow-md">
            <Image src="/logo.jpeg" alt="Logo ANTA" fill className="object-cover object-top" priority />
          </div>
          <span className="text-lg font-black tracking-wide text-slate-900 dark:text-white">ANTA</span>
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/connexion"
            className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 dark:bg-green-600 dark:hover:bg-green-700"
          >
            Commencer
          </Link>
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? 'Masquer le menu' : 'Afficher le menu'}
          aria-expanded={isMenuOpen}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white/80 text-lg text-slate-800 transition hover:border-red-400 sm:hidden dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white/95 px-6 py-3 backdrop-blur sm:hidden dark:border-slate-800 dark:bg-slate-950/95">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/inscription"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 dark:bg-green-600"
            >
              Inscription
            </Link>
            <Link
              href="/connexion"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200"
            >
              Connexion
            </Link>
            <Link
              href="#modules"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200"
            >
              Modules
            </Link>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
