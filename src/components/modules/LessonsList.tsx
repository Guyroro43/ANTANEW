'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Icon, icons } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/utils/cn';

export interface LessonCardData {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  contentType: string;
  contentTypeLabel: string;
  locked: boolean;
  completed: boolean;
}

type Tab = 'todo' | 'done';

const contentTypeIcons: Record<string, LucideIcon> = {
  qcm: icons.doc,
  pdf: icons.doc,
  video: icons.video,
  audio: icons.speaker,
};

export function LessonsList({ lessons }: { lessons: LessonCardData[] }) {
  const [tab, setTab] = useState<Tab>('todo');

  const filtered = useMemo(
    () => lessons.filter((lesson) => (tab === 'todo' ? !lesson.completed : lesson.completed)),
    [lessons, tab],
  );

  const counts = useMemo(
    () => ({
      todo: lessons.filter((l) => !l.completed).length,
      done: lessons.filter((l) => l.completed).length,
    }),
    [lessons],
  );

  return (
    <div>
      <div className="mt-8 inline-flex gap-1.5 rounded-full bg-slate-100 p-1.5 dark:bg-slate-800/60">
        <button
          type="button"
          onClick={() => setTab('todo')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-semibold transition',
            tab === 'todo'
              ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100',
          )}
        >
          À faire ({counts.todo})
        </button>
        <button
          type="button"
          onClick={() => setTab('done')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-semibold transition',
            tab === 'done'
              ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100',
          )}
        >
          Terminées ({counts.done})
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-slate-600 dark:text-slate-300">
          {tab === 'todo' ? 'Tout est fait ici, bravo !' : 'Aucune leçon terminée pour l’instant.'}
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {filtered.map((lesson, index) => (
            <Reveal key={lesson.id} delay={index * 0.05}>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-green-950 dark:text-green-400">
                    <Icon icon={contentTypeIcons[lesson.contentType] ?? icons.doc} className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {lesson.contentTypeLabel}
                    </span>
                    <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{lesson.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {lesson.description ?? lesson.category ?? 'Une leçon pratique pour progresser en anglais.'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  {lesson.locked ? (
                    <Link
                      href="/abonnement"
                      className="rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-yellow-300"
                    >
                      Débloquer Premium
                    </Link>
                  ) : (
                    <Link
                      href={`/lecon/${lesson.id}`}
                      className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 dark:bg-green-600 dark:hover:bg-green-500"
                    >
                      {lesson.completed ? 'Revoir' : 'Commencer'}
                    </Link>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
