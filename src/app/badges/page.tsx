import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/utils/format';

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const [{ data: badges }, { data: earned }] = await Promise.all([
    supabase.from('badges').select('*').order('xp_required', { ascending: true, nullsFirst: true }),
    supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', user.id),
  ]);

  const earnedMap = new Map((earned ?? []).map((entry) => [entry.badge_id, entry.earned_at]));

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] px-6 py-16 text-slate-900 dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-red-200 bg-white/80 p-8 shadow-xl shadow-red-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Badges</p>
            <h1 className="mt-3 text-4xl font-black">Tes récompenses</h1>
          </div>
          <Link href="/dashboard" className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200">
            Retour au dashboard
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {(badges ?? []).map((badge) => {
            const earnedAt = earnedMap.get(badge.id);
            const unlocked = Boolean(earnedAt);

            return (
              <div
                key={badge.id}
                className={`rounded-[1.25rem] border p-5 dark:border-slate-700 ${
                  unlocked
                    ? 'border-slate-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950'
                    : 'border-slate-200 bg-slate-100 opacity-60 grayscale dark:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{badge.icon}</span>
                  <div>
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{badge.description}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs font-semibold">
                  {unlocked ? (
                    <span className="text-green-700 dark:text-green-400">Débloqué le {formatDate(earnedAt as string)}</span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">🔒 Non débloqué</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
