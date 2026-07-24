import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Reveal } from '@/components/ui/Reveal';
import { Icon, icons } from '@/components/ui/Icon';

const rankStyles: Record<number, string> = {
  1: 'bg-yellow-400 text-yellow-950',
  2: 'bg-slate-300 text-slate-800',
  3: 'bg-amber-600 text-amber-50',
};

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const [{ data: leaderboard }, { data: myRank }] = await Promise.all([
    supabase.rpc('get_leaderboard', { p_limit: 20 }),
    supabase.rpc('get_my_rank'),
  ]);

  const entries = leaderboard ?? [];
  const isInTop = entries.some((entry) => entry.id === user.id);

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#fffdf5_0%,_#fef3c7_35%,_#ecfccb_100%)] px-6 py-16 text-slate-900 dark:bg-[linear-gradient(135deg,_#020617_0%,_#111827_45%,_#052e16_100%)] dark:text-slate-100">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-red-200 bg-white/80 p-8 shadow-xl shadow-red-100 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-yellow-400">Classement</p>
              <h1 className="mt-3 text-4xl font-black">Les meilleurs apprenants</h1>
            </div>
            <Link href="/dashboard" className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:border-green-500 hover:text-green-700 dark:border-slate-600 dark:text-slate-200">
              Retour au dashboard
            </Link>
          </div>
        </Reveal>

        {entries.length === 0 ? (
          <p className="mt-8 text-slate-600 dark:text-slate-300">Le classement n&apos;est pas encore disponible.</p>
        ) : (
          <div className="mt-8 space-y-3">
            {entries.map((entry, index) => {
              const isMe = entry.id === user.id;
              const medalClass = rankStyles[entry.rank];
              return (
                <Reveal key={entry.id} delay={Math.min(index, 10) * 0.05}>
                  <div
                    className={`flex items-center justify-between rounded-[1.25rem] border px-5 py-4 transition ${
                      isMe
                        ? 'border-red-400 bg-gradient-to-br from-red-50 via-yellow-50 to-green-50 dark:border-yellow-500 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950'
                        : 'border-slate-200 bg-gradient-to-br from-white via-yellow-50 to-green-50 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950'
                    }`}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-3 font-semibold">
                      <span
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-black tabular-nums ${
                          medalClass ?? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {medalClass ? <Icon icon={icons.trophy} className="h-4 w-4" /> : entry.rank}
                      </span>
                      <UserAvatar name={entry.first_name} src={entry.avatar_url} size={36} />
                      <span className="truncate">{entry.first_name}</span>
                      {isMe && <span className="flex-shrink-0 text-xs font-normal text-red-600 dark:text-yellow-400">(toi)</span>}
                    </span>
                    <span className="flex-shrink-0 text-sm font-semibold tabular-nums text-slate-600 dark:text-slate-300">{entry.total_xp} XP</span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        {!isInTop && myRank != null && (
          <div className="mt-6 border-t border-slate-200 pt-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
            Ta position actuelle : <span className="font-semibold tabular-nums text-slate-900 dark:text-white">#{myRank}</span>
          </div>
        )}
      </div>
    </main>
  );
}
