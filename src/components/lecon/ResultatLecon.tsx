import Link from 'next/link';

export interface Mistake {
  questionText: string;
  yourAnswer: string;
  correctAnswer: string;
  feedback?: string;
}

interface ResultatLeconProps {
  score: number;
  total: number;
  xpEarned: number;
  currentStreak: number;
  moduleSlug: string;
  mistakes?: Mistake[];
}

export function ResultatLecon({
  score,
  total,
  xpEarned,
  currentStreak,
  moduleSlug,
  mistakes = [],
}: ResultatLeconProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <p className="text-6xl">🎉</p>
      <h2 className="text-3xl font-black text-slate-900 dark:text-white">Leçon terminée !</h2>

      {total > 0 && (
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Score : {score} / {total}
        </p>
      )}

      {xpEarned > 0 ? (
        <p className="text-lg font-semibold text-red-600 dark:text-yellow-400">+{xpEarned} XP</p>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">XP déjà comptabilisé pour cette leçon.</p>
      )}

      <p className="text-sm text-slate-500 dark:text-slate-400">Streak actuelle : {currentStreak} 🔥</p>

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
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
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
    </div>
  );
}
