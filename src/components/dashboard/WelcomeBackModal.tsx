'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { Icon, icons } from '@/components/ui/Icon';

interface WelcomeBackModalProps {
  firstName: string;
  currentStreak: number;
  streakIntact: boolean;
  hasCompletedToday: boolean;
  nextLesson: { title: string; href: string } | null;
}

const DISMISS_KEY = 'anta_popup_dismissed';

const quickActions = (nextLessonHref: string | null) => [
  { href: nextLessonHref ?? '/modules', label: 'Continuer', icon: icons.book },
  { href: '/dashboard', label: 'Streak', icon: icons.flame },
  { href: '/badges', label: 'Badges', icon: icons.badge },
  { href: '/classement', label: 'Classement', icon: icons.trophy },
];

export function WelcomeBackModal({ firstName, currentStreak, streakIntact, hasCompletedToday, nextLesson }: WelcomeBackModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hasCompletedToday) return;
    const today = new Date().toISOString().slice(0, 10);
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(DISMISS_KEY) === today) return;

    const timer = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(timer);
  }, [hasCompletedToday]);

  const dismiss = () => {
    const today = new Date().toISOString().slice(0, 10);
    window.localStorage.setItem(DISMISS_KEY, today);
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={dismiss} className="max-w-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xl font-black text-slate-900 dark:text-white">Salut {firstName}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Prêt(e) à apprendre aujourd&apos;hui ?</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <Icon icon={icons.x} className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {quickActions(nextLesson?.href ?? null).map((action) => (
          <Link
            key={action.label}
            href={action.href}
            onClick={dismiss}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-3 text-center transition hover:border-red-400 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
          >
            <Icon icon={action.icon} className="h-5 w-5 text-red-600 dark:text-green-400" />
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <p className="border-b border-slate-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Routine du jour
        </p>
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-600" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Terminer une leçon</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <div
            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
              streakIntact ? 'border-green-600 bg-green-600 text-white' : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {streakIntact && <Icon icon={icons.check} className="h-3.5 w-3.5" />}
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Garder ton streak de {currentStreak} jour{currentStreak > 1 ? 's' : ''}</span>
        </div>
      </div>

      {nextLesson && (
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-red-50 via-yellow-50 to-green-50 p-4 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Recommandé pour toi</p>
          <p className="mt-1.5 font-bold text-slate-900 dark:text-white">{nextLesson.title}</p>
          <Link
            href={nextLesson.href}
            onClick={dismiss}
            className="mt-3 inline-flex rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 dark:bg-green-600 dark:hover:bg-green-500"
          >
            Commencer
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={dismiss}
        className="mt-4 w-full text-center text-sm font-semibold text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
      >
        Plus tard
      </button>
    </Modal>
  );
}
