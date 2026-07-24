'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';

const highlights = ['10 min/jour', 'Modules culturels', 'Paiement local'];

export function Hero() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 sm:py-16 lg:flex-row lg:items-center lg:px-8 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="max-w-2xl flex-1"
      >
        <span className="inline-flex items-center rounded-full border border-red-300 bg-white/80 px-3 py-1 text-sm font-medium text-red-700 shadow-sm dark:border-green-700 dark:bg-slate-900/80 dark:text-green-300">
          Apprends l’anglais avec les réalités d’Afrique
        </span>
        <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
          Parle anglais avec confiance, à votre niveau, partout.
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-700 sm:text-xl dark:text-slate-300">
          ANTA rend l’apprentissage de l’anglais simple, motivant et culturellement proche grâce à des leçons courtes, adaptées aux jeunes africains et à leurs ambitions.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/inscription"
            className="rounded-full bg-red-600 px-6 py-3 text-center font-semibold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700"
          >
            Commencer gratuitement
          </Link>
          <Link
            href="#modules"
            className="rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-center font-semibold text-slate-800 transition hover:border-green-400 hover:text-green-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
          >
            Découvrir les modules
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {highlights.map((item) => (
            <span key={item} className="rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white dark:bg-green-700">
              {item}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
        className="flex-1"
      >
        <div className="relative overflow-hidden rounded-[2rem] border border-amber-200 bg-white/80 p-6 shadow-2xl shadow-amber-100 backdrop-blur">
          <div className="absolute inset-0">
            <Image src="/lion.jpeg" alt="Lion en fond pour ANTA" fill className="object-cover" priority />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.35),_transparent_35%)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-transparent to-green-900/40" />
          <div className="relative rounded-[1.5rem] border border-yellow-100 bg-gradient-to-br from-red-600/90 via-yellow-500/90 to-green-500/90 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-yellow-50/90">Aujourd’hui</p>
                <h2 className="mt-2 text-2xl font-semibold">Leçon recommandée</h2>
              </div>
              <div className="rounded-full bg-white/20 px-3 py-2 text-sm font-semibold">+120 XP</div>
            </div>
            <div className="mt-8 space-y-4 rounded-2xl bg-white/20 p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30 text-2xl">🗣️</div>
                <div>
                  <p className="font-semibold">Conversation au marché</p>
                  <p className="text-sm text-yellow-50/90">Vocabulaire utile et expressions locales</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-900/20 px-4 py-3">
                <span>Streak</span>
                <span className="font-bold">7 jours</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
