import Link from 'next/link';
import { Reveal } from './Reveal';

const days = [
  'Salutations',
  'Se présenter',
  'Au marché',
  'Au travail',
  'En voyage',
  'Petit oral',
  'Bilan & badge',
];

export function Challenge() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <Reveal>
        <div className="overflow-hidden rounded-[2rem] border border-amber-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 p-8 shadow-xl shadow-amber-100 sm:p-10 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950 dark:shadow-none">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
            <div className="max-w-xl flex-1">
              <span className="inline-flex items-center rounded-full border border-red-300 bg-white/80 px-3 py-1 text-sm font-medium text-red-700 dark:border-green-700 dark:bg-slate-900/80 dark:text-green-300">
                100% gratuit
              </span>
              <h2 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl dark:text-white">
                Le Défi 7 jours pour te lancer en anglais.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-700 dark:text-slate-300">
                Une leçon courte par jour, pendant une semaine, adaptée à ton niveau. À la fin, tu repars avec de
                nouveaux réflexes et ton premier badge.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/inscription"
                  className="rounded-full bg-red-600 px-6 py-3 text-center font-semibold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700"
                >
                  Je relève le défi
                </Link>
              </div>
            </div>

            <div className="flex-1">
              <ol className="space-y-2">
                {days.map((day, index) => (
                  <Reveal key={day} delay={index * 0.06}>
                    <li className="flex items-center gap-3 rounded-xl bg-white/70 px-4 py-2.5 dark:bg-slate-800/70">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white dark:bg-green-600">
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{day}</span>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
