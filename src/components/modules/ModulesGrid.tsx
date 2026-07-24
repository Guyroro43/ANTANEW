'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon, icons } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/utils/cn';

export interface ModuleCardData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  isPremium: boolean;
  locked: boolean;
  completedCount: number;
  totalCount: number;
}

type Filter = 'tous' | 'gratuit' | 'premium';

const filters: { key: Filter; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'gratuit', label: 'Gratuit' },
  { key: 'premium', label: 'Premium' },
];

const fallbackGradients = [
  'from-red-600 via-red-500 to-yellow-500',
  'from-yellow-500 via-yellow-400 to-green-500',
  'from-green-600 via-green-500 to-yellow-400',
  'from-red-500 via-yellow-500 to-green-600',
];

export function ModulesGrid({ modules }: { modules: ModuleCardData[] }) {
  const [filter, setFilter] = useState<Filter>('tous');

  const filtered = useMemo(() => {
    if (filter === 'tous') return modules;
    if (filter === 'gratuit') return modules.filter((m) => !m.isPremium);
    return modules.filter((m) => m.isPremium);
  }, [filter, modules]);

  return (
    <div>
      <div className="mt-8 inline-flex gap-1.5 rounded-full bg-slate-100 p-1.5 dark:bg-slate-800/60">
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              filter === item.key
                ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-slate-600 dark:text-slate-300">Aucun module dans cette catégorie.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-5">
          {filtered.map((module, index) => {
            const gradient = fallbackGradients[index % fallbackGradients.length];
            const card = (
              <div className="group relative h-56 w-full overflow-hidden rounded-[1.75rem] border border-white/10 shadow-lg shadow-slate-900/10 transition hover:-translate-y-1 hover:shadow-xl">
                {module.imageUrl ? (
                  <Image
                    src={module.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 700px, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className={cn('h-full w-full bg-gradient-to-br', gradient)} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/10" />

                {module.locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px]">
                    <span className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-slate-900">
                      <Icon icon={icons.lock} className="h-4 w-4" />
                      Réservé Premium
                    </span>
                  </div>
                )}

                <div className="absolute left-5 top-5 flex items-center gap-2">
                  <span
                    className={cn(
                      'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white backdrop-blur',
                      module.isPremium ? 'bg-yellow-500/90' : 'bg-green-600/90',
                    )}
                  >
                    {module.isPremium && <Icon icon={icons.crown} className="h-3 w-3" />}
                    {module.isPremium ? 'Premium' : 'Gratuit'}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h2 className="text-2xl font-black text-white drop-shadow-sm">{module.title}</h2>
                  <p className="mt-1 line-clamp-1 text-sm text-white/80">
                    {module.description ?? 'Des leçons pour progresser dans des situations réelles.'}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                      <Icon icon={icons.bolt} className="h-3.5 w-3.5 text-yellow-400" />
                      {module.completedCount}/{module.totalCount} leçons terminées
                    </span>
                    {!module.locked && (
                      <span className="flex items-center gap-1 text-sm font-semibold text-white transition group-hover:translate-x-0.5">
                        Commencer
                        <Icon icon={icons.chevronRight} className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );

            return (
              <Reveal key={module.id} delay={index * 0.05}>
                <Link href={module.locked ? '/abonnement' : `/modules/${module.slug}`} className="block">
                  {card}
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
