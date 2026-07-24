import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';
import { Icon, icons } from '@/components/ui/Icon';

export interface Mistake {
  questionText: string;
  yourAnswer: string;
  correctAnswer: string;
  feedback?: string;
}

export interface NewBadge {
  slug: string;
  name: string;
  icon: string;
}

interface ResultatLeconProps {
  score: number;
  total: number;
  xpEarned: number;
  currentStreak: number;
  moduleSlug: string;
  mistakes?: Mistake[];
  newBadges?: NewBadge[];
}

export function ResultatLecon({
  score,
  total,
  xpEarned,
  currentStreak,
  moduleSlug,
  mistakes = [],
  newBadges = [],
}: ResultatLeconProps) {
  return (
    <Reveal className="flex flex-col items-center gap-4 py-8 text-center">
      <p className="text-6xl">🎉</p>
      <h2 className="text-3xl font-black text-slate-900 dark:text-white">Leçon terminée !</h2>

      {total > 0 && (
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Score : <span className="tabular-nums">{score} / {total}</span>
        </p>
      )}

      {xpEarned > 0 ? (
        <p className="flex items-center gap-1.5 text-lg font-semibold text-red-600 dark:text-yellow-400">
          <Icon icon={icons.bolt} className="h-5 w-5" />
          +{xpEarned} XP
        </p>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">XP déjà comptabilisé pour cette leçon.</p>
      )}

      <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <Icon icon={icons.flame} className="h-4 w-4" />
        Streak actuelle : {currentStreak}
      </p>

      {newBadges.length > 0 && (
        <div className="mt-2 w-full max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Nouveau{newBadges.length > 1 ? 'x' : ''} badge{newBadges.length > 1 ? 's' : ''} débloqué{newBadges.length > 1 ? 's' : ''} !
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {newBadges.map((badge) => (
              <div
                key={badge.slug}
                className="flex items-center gap-2 rounded-full border border-yellow-300 bg-gradient-to-br from-white via-yellow-50 to-green-50 px-4 py-2 shadow-sm dark:border-yellow-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950"
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {mistakes.length > 0 && (
        <div className="mt-4 w-full max-w-xl text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Ce qu&apos;il fallait retenir
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {mistakes.map((mistake, index) => (
              <div
                key={index}
                className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950"
              >
                <p className="font-semibold text-slate-900 dark:text-white">{mistake.questionText}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-red-700 dark:text-red-300">
                  <Icon icon={icons.x} className="h-3.5 w-3.5 flex-shrink-0" />
                  Ta réponse : {mistake.yourAnswer} — Bonne réponse : {mistake.correctAnswer}
                </p>
                {mistake.feedback && (
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">💡 {mistake.feedback}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link
          href={`/modules/${moduleSlug}`}
          className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200"
        >
          Retour au module
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 dark:bg-green-600 dark:hover:bg-green-700"
        >
          Dashboard
        </Link>
      </div>
    </Reveal>
  );
}
