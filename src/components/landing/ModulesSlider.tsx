'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Reveal } from '@/components/ui/Reveal';

const modules = [
  {
    title: 'Vie quotidienne',
    description: 'Apprends les expressions utiles pour les situations du quotidien et de la vie sociale.',
    tag: 'Gratuit' as const,
    image: '/modules/vie-quotidienne.jpeg',
  },
  {
    title: 'Entretien',
    description: 'Prépare-toi à décrocher un poste avec un anglais professionnel et naturel.',
    tag: 'Premium' as const,
    image: '/modules/entretien.jpeg',
  },
  {
    title: 'Voyage',
    description: 'Maîtrise les bases pour voyager, communiquer et t’ouvrir à de nouveaux horizons.',
    tag: 'Gratuit' as const,
    image: '/modules/voyage.jpeg',
  },
  {
    title: 'Tech & startups',
    description: 'Découvre un anglais adapté à l’innovation, au numérique et à l’entrepreneuriat.',
    tag: 'Premium' as const,
    image: '/modules/tech.jpeg',
  },
];

const filters = ['Tous', 'Gratuit', 'Premium'] as const;
type Filter = (typeof filters)[number];

const IMAGE_PHASE_MS = 2000;
const TEXT_PHASE_MS = 5000;

export function ModulesSlider() {
  const [filter, setFilter] = useState<Filter>('Tous');
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<'image' | 'text'>('image');
  const prefersReducedMotion = useReducedMotion();

  const filtered = useMemo(
    () => (filter === 'Tous' ? modules : modules.filter((m) => m.tag === filter)),
    [filter],
  );

  useEffect(() => {
    setActiveIndex(0);
    setPhase('image');
  }, [filter]);

  useEffect(() => {
    if (prefersReducedMotion || filtered.length <= 1) return;

    const delay = phase === 'image' ? IMAGE_PHASE_MS : TEXT_PHASE_MS;
    const timer = setTimeout(() => {
      if (phase === 'image') {
        setPhase('text');
      } else {
        setPhase('image');
        setActiveIndex((i) => (i + 1) % filtered.length);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [phase, filtered.length, prefersReducedMotion]);

  const goTo = (index: number) => {
    setActiveIndex(((index % filtered.length) + filtered.length) % filtered.length);
    setPhase('image');
  };

  const active = filtered[activeIndex];

  return (
    <section id="modules" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Modules</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl dark:text-white">
              Des parcours qui parlent à votre réalité.
            </h2>
          </div>
          <Link href="/modules" className="font-semibold text-red-700 transition hover:text-green-700 dark:text-yellow-400">
            Voir tous les modules →
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-6 flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === f
                  ? 'bg-gradient-to-r from-red-600 via-red-500 to-green-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </Reveal>

      {!active ? (
        <p className="mt-10 text-slate-600 dark:text-slate-300">Aucun module dans cette catégorie pour l’instant.</p>
      ) : (
        <Reveal delay={0.15}>
          <div className="relative mt-10 overflow-hidden rounded-[1.75rem] border border-red-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 shadow-sm dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950">
            <div className="relative h-56 sm:h-72">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={active.image}
                    alt={active.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    priority={activeIndex === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">{active.title}</h3>
                    <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-slate-800">{active.tag}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative min-h-[7.5rem] p-6">
              <AnimatePresence mode="wait">
                {phase === 'text' || prefersReducedMotion ? (
                  <motion.div
                    key={active.title + '-text'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
                  >
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{active.description}</p>
                    <Link
                      href="/modules"
                      className="mt-4 inline-flex font-semibold text-red-700 transition hover:text-green-700 dark:text-yellow-400"
                    >
                      Explorer ce module →
                    </Link>
                  </motion.div>
                ) : (
                  <div className="h-16" aria-hidden="true" />
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-2 pb-5">
              {filtered.map((m, index) => (
                <button
                  key={m.title}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Voir le module ${m.title}`}
                  aria-current={index === activeIndex}
                  className={`h-2.5 cursor-pointer rounded-full transition-all ${
                    index === activeIndex ? 'w-6 bg-red-600 dark:bg-yellow-400' : 'w-2.5 bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </section>
  );
}
